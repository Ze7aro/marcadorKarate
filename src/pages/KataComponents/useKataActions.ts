import { useMemo } from "react";
import { invoke } from "@tauri-apps/api/core";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import { save } from "@tauri-apps/plugin-dialog";
import { writeFile } from "@tauri-apps/plugin-fs";
import { useCategoryCatalog } from "@/hooks/useCategoryCatalog";
import { useKata } from "@/context/KataContext";
import { CompetenciaKata, Competidor } from "@/types";
import { calculateKataMetrics, compareCompetitors, getRoundDefinitions, getRoundStructure } from "@/utils/kataUtils";
import { generateExcelFile } from "@/utils/excelUtils";
import { generateKataPDF } from "@/utils/pdfUtils";
import { showToast } from "@/utils/toast";

const createCompetitorUid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `comp-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

export function useKataActions(setShowResultados: (open: boolean) => void) {
  const { state, dispatch } = useKata();
  const { getByDiscipline } = useCategoryCatalog();
  const kataCategories = getByDiscipline("kata");
  const roundDefinitions = useMemo(() => getRoundDefinitions(state.roundFormat), [state.roundFormat]);
  const roundStructure = useMemo(
    () => getRoundStructure(state.roundFormat, state.previousRounds.length + 1),
    [state.previousRounds.length, state.roundFormat],
  );
  const selectedCategoryId = kataCategories.find((item) => item.categoria === state.categoria)?.id || "";

  const openDisplay = async () => {
    try {
      const existingWindow = await WebviewWindow.getByLabel("kata-display");
      if (existingWindow) {
        await existingWindow.setFocus();
        showToast.success("Ventana de proyección ya está abierta");
        return;
      }
      await invoke("open_kata_display");
      dispatch({ type: "SET_DISPLAY_WINDOW", payload: true });
      showToast.success("Ventana de proyección abierta");
    } catch (error) {
      console.error("Error opening display window:", error);
      showToast.error("Error al abrir ventana de proyección");
    }
  };

  const closeDisplay = async () => {
    try {
      await invoke("close_kata_display");
      dispatch({ type: "SET_DISPLAY_WINDOW", payload: false });
      showToast.success("Ventana de proyección cerrada");
    } catch (error) {
      console.error("Error closing display window:", error);
      showToast.error("Error al cerrar ventana de proyección");
    }
  };

  const reset = () => {
    if (confirm("¿Estás seguro de que quieres resetear todos los datos?")) {
      dispatch({ type: "RESET_ALL" });
      showToast.success("Datos reseteados");
    }
  };

  const loadCompetencia = (competencia: CompetenciaKata) => {
    const competidores = competencia.competidores.map((comp, index) => ({
      id: index + 1,
      competitorUid: createCompetitorUid(),
      Nombre: comp.nombre,
      Edad: comp.edad,
      PuntajeFinal: comp.puntajeFinal,
      PuntajesJueces: comp.puntajesJueces.map((p) => p.toString()),
      Kiken: comp.descalificado,
    }));
    dispatch({ type: "SET_COMPETIDORES", payload: competidores });
    dispatch({ type: "SET_AREA", payload: competencia.area });
    dispatch({ type: "SET_CATEGORIA", payload: { categoria: competencia.categoria, titulo: competencia.categoria } });
    showToast.success("Competencia cargada desde el historial");
  };

  const selectCategory = (categoryId: string) => {
    const selectedCategory = kataCategories.find((category) => category.id === categoryId);
    if (!selectedCategory) return;
    dispatch({
      type: "LOAD_CATEGORY",
      payload: {
        categoria: selectedCategory.categoria,
        competidores: selectedCategory.competidores.map((competidor, index) => ({
          ...competidor,
          id: index + 1,
          competitorUid: competidor.competitorUid || createCompetitorUid(),
          Categoria: selectedCategory.categoria,
          PuntajeFinal: null,
          PuntajesJueces: [],
          Kiken: false,
        })),
      },
    });
    showToast.success(`Categoría ${selectedCategory.categoria} cargada`);
  };

  const exportFiles = async (format: "excel" | "pdf") => {
    try {
      if (state.competidores.length === 0) {
        showToast.error("No hay competidores para exportar");
        return;
      }
      const filePath = await save({
        defaultPath: `kata_${state.area}_${state.categoria}_${Date.now()}.${format === "excel" ? "xlsx" : "pdf"}`,
        filters: [{ name: format === "excel" ? "Excel" : "PDF", extensions: [format === "excel" ? "xlsx" : "pdf"] }],
      });
      if (!filePath) return;
      const data = format === "excel"
        ? generateExcelFile(state.competidores, state.categoria || "Sin categoría", state.area || "Sin área")
        : generateKataPDF(state.competidores, state.categoria || "Sin categoría", state.area || "Sin área", new Date().toLocaleDateString("es-ES"));
      await writeFile(filePath, new Uint8Array(data));
      showToast.success(`Archivo ${format === "excel" ? "Excel" : "PDF"} exportado exitosamente`);
    } catch (error) {
      console.error(`Error exporting ${format}:`, error);
      showToast.error(`Error al exportar a ${format === "excel" ? "Excel" : "PDF"}`);
    }
  };

  const addCompetidor = (nombre: string, edad: number) => {
    const nuevoCompetidor: Competidor = {
      id: state.competidores.length + 1,
      competitorUid: createCompetitorUid(),
      Nombre: nombre,
      Edad: edad,
      Categoria: state.categoria,
      PuntajeFinal: null,
      PuntajesJueces: [],
      Kiken: false,
    };
    dispatch({ type: "ADD_COMPETIDOR", payload: nuevoCompetidor });
  };

  const kiken = (competidor: Competidor) => {
    if (!confirm(`¿Descalificar a ${competidor.Nombre}?`)) return;
    dispatch({ type: "UPDATE_COMPETIDOR", payload: { id: competidor.id, data: { Kiken: true, PuntajeFinal: null, PuntajesJueces: [] } } });
    showToast.success("Competidor descalificado");
  };

  const deleteCompetidor = (id: number) => {
    if (!confirm("¿Eliminar este competidor?")) return;
    dispatch({ type: "SET_COMPETIDORES", payload: state.competidores.filter((c) => c.id !== id) });
    showToast.success("Competidor eliminado");
  };

  const archiveRound = () => {
    const currentRoundNumber = state.previousRounds.length + 1;
    const definition = roundDefinitions[Math.min(currentRoundNumber - 1, roundDefinitions.length - 1)];
    dispatch({ type: "ARCHIVE_ROUND", payload: { id: currentRoundNumber, nombre: definition.label, key: definition.key, countsForFinal: definition.countsForFinal, competidores: [...state.competidores], fecha: new Date().toISOString() } });
    return currentRoundNumber;
  };

  const startTieBreaker = (ids: number[]) => {
    const round = archiveRound();
    dispatch({ type: "SET_COMPETIDORES", payload: state.competidores.filter((c) => ids.includes(c.id)).map((c) => ({ ...c, PuntajeFinal: null, PuntajesJueces: [], previousScore: c.PuntajeFinal })) });
    setShowResultados(false);
    showToast.success(`Ronda ${round} archivada. Iniciando desempate.`);
  };

  const advanceRound = (selectedIds: number[]) => {
    const sorted = state.competidores
      .filter((c) => c.PuntajeFinal !== null && !c.Kiken)
      .map((competidor) => ({ competidor, metrics: calculateKataMetrics((competidor.PuntajesJueces || []).map((p) => p || "0"), state.numJudges) }))
      .sort((a, b) => compareCompetitors(a.metrics, b.metrics))
      .map(({ competidor }) => competidor);
    const winners = sorted.filter((competidor) => selectedIds.includes(competidor.id));
    if (winners.length === 0) {
      showToast.error("Selecciona al menos un competidor para la siguiente ronda");
      return;
    }
    archiveRound();
    dispatch({ type: "SET_COMPETIDORES", payload: winners.sort((a, b) => (a.PuntajeFinal ?? Infinity) - (b.PuntajeFinal ?? Infinity)).map((c) => ({ ...c, PuntajeFinal: null, PuntajesJueces: [] })) });
    setShowResultados(false);
    showToast.success(`Siguiente ronda iniciada con ${winners.length} competidores`);
  };

  return { state, dispatch, kataCategories, selectedCategoryId, roundStructure, openDisplay, closeDisplay, reset, loadCompetencia, selectCategory, exportFiles, addCompetidor, kiken, deleteCompetidor, startTieBreaker, advanceRound };
}
