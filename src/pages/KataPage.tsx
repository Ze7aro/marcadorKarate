import { useMemo, useState } from "react";
import {
  Button,
  Card,
  CardBody,
} from "@heroui/react";
import { useKata } from "@/context/KataContext";
import {
  calculateKataMetrics,
  compareCompetitors,
  getRoundDefinitions,
  getRoundStructure,
} from "@/utils/kataUtils";
import { showToast } from "@/utils/toast";
import { invoke } from "@tauri-apps/api/core";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import { CompetenciaKata, Competidor } from "@/types";
import { useNavigate } from "react-router-dom";
import { useCategoryCatalog } from "@/hooks/useCategoryCatalog";
import { useKataActions } from "@/pages/KataComponents/useKataActions";
import KataCompetitorCard from "@/pages/KataComponents/KataCompetitorCard";
import KataConfigurationPanel from "@/pages/KataComponents/KataConfigurationPanel";
import KataRoundHistory from "@/pages/KataComponents/KataRoundHistory";
import KataHeaderActions from "@/pages/KataComponents/KataHeaderActions";
import KataDialogs from "@/pages/KataComponents/KataDialogs";

export default function KataPage() {
  const createCompetitorUid = () =>
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `comp-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

  const navigate = useNavigate();

  const { state, dispatch } = useKata();
  const { getByDiscipline } = useCategoryCatalog();
  const [showHistorial, setShowHistorial] = useState(false);
  const [showAgregarCompetidor, setShowAgregarCompetidor] = useState(false);
  const [showResultados, setShowResultados] = useState(false);
  const kataActions = useKataActions(setShowResultados);
  const kataCategories = getByDiscipline("kata");
  const roundDefinitions = useMemo(
    () => getRoundDefinitions(state.roundFormat),
    [state.roundFormat],
  );
  const roundStructure = useMemo(
    () => getRoundStructure(state.roundFormat, state.previousRounds.length + 1),
    [state.previousRounds.length, state.roundFormat],
  );
  const sumRounds = state.sumRounds;
  // Función para abrir la ventana de proyección
  const handleOpenKataDisplay = async () => {
    try {
      // Verificar si la ventana ya existe
      const existingWindow = await WebviewWindow.getByLabel("kata-display");

      if (existingWindow) {
        await existingWindow.setFocus();
        showToast.success("Ventana de proyección ya está abierta");
        return;
      }

      // Crear nueva ventana usando el comando Rust
      await invoke("open_kata_display");

      // Actualizar estado
      dispatch({ type: "SET_DISPLAY_WINDOW", payload: true });
      showToast.success("Ventana de proyección abierta");
    } catch (error) {
      console.error("Error opening display window:", error);
      showToast.error("Error al abrir ventana de proyección");
    }
  };

  // Función para cerrar la ventana de proyección
  const handleCloseKataDisplay = async () => {
    try {
      await invoke("close_kata_display");
      dispatch({ type: "SET_DISPLAY_WINDOW", payload: false });
      showToast.success("Ventana de proyección cerrada");
    } catch (error) {
      console.error("Error closing display window:", error);
      showToast.error("Error al cerrar ventana de proyección");
    }
  };

  // Función para resetear todo
  const handleReset = () => {
    if (confirm("¿Estás seguro de que quieres resetear todos los datos?")) {
      dispatch({ type: "RESET_ALL" });
      showToast.success("Datos reseteados");
    }
  };

  // Función para cargar competencia desde historial
  const handleLoadCompetencia = (competencia: CompetenciaKata) => {
    // Convertir competidores de DB a formato de la app
    const competidores = competencia.competidores.map((comp, index) => ({
      id: index + 1,
      competitorUid: createCompetitorUid(),
      Nombre: comp.nombre,
      Edad: comp.edad,
      PuntajeFinal: comp.puntajeFinal,
      PuntajesJueces: comp.puntajesJueces.map((p) => p.toString()),
      Kiken: comp.descalificado,
    }));

    // Actualizar estado
    dispatch({ type: "SET_COMPETIDORES", payload: competidores });
    dispatch({ type: "SET_AREA", payload: competencia.area });
    dispatch({
      type: "SET_CATEGORIA",
      payload: {
        categoria: competencia.categoria,
        titulo: competencia.categoria,
      },
    });

    showToast.success("Competencia cargada desde el historial");
  };

  // Función para cargar competidores desde Excel
  const selectedCategoryId =
    kataCategories.find((item) => item.categoria === state.categoria)?.id || "";

  const handleCategorySelection = (categoryId: string) => {
    const selectedCategory = kataCategories.find(
      (category) => category.id === categoryId,
    );

    if (!selectedCategory) {
      return;
    }

    dispatch({
      type: "LOAD_CATEGORY",
      payload: {
        categoria: selectedCategory.categoria,
        competidores: selectedCategory.competidores.map(
          (competidor, index) => ({
            ...competidor,
            id: index + 1,
            competitorUid: competidor.competitorUid || createCompetitorUid(),
            Categoria: selectedCategory.categoria,
            PuntajeFinal: null,
            PuntajesJueces: [],
            Kiken: false,
          }),
        ),
      },
    });
    showToast.success(`Categoría ${selectedCategory.categoria} cargada`);
  };

  // Función para agregar competidor
  const handleAddCompetidor = (nombre: string, edad: number) => {
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

  // Función para descalificar (Kiken)
  const handleKiken = (competidor: Competidor) => {
    if (confirm(`¿Descalificar a ${competidor.Nombre}?`)) {
      dispatch({
        type: "UPDATE_COMPETIDOR",
        payload: {
          id: competidor.id,
          data: {
            Kiken: true,
            PuntajeFinal: null,
            PuntajesJueces: [],
          },
        },
      });
      showToast.success("Competidor descalificado");
    }
  };

  // Función para eliminar competidor
  const handleEliminarCompetidor = (id: number) => {
    if (confirm("¿Eliminar este competidor?")) {
      const nuevosCompetidores = state.competidores.filter((c) => c.id !== id);
      dispatch({ type: "SET_COMPETIDORES", payload: nuevosCompetidores });
      showToast.success("Competidor eliminado");
    }
  };

  // Función para iniciar desempate
  const handleStartTieBreaker = (tiedCompetitorIds: number[]) => {
    // 1. Archivar ronda actual
    const currentRoundNumber = state.previousRounds.length + 1;
    const currentRoundDefinition =
      roundDefinitions[
        Math.min(currentRoundNumber - 1, roundDefinitions.length - 1)
      ];
    const roundToArchive = {
      id: currentRoundNumber,
      nombre: currentRoundDefinition.label,
      key: currentRoundDefinition.key,
      countsForFinal: currentRoundDefinition.countsForFinal,
      competidores: [...state.competidores], // Copia profunda de competidores actuales
      fecha: new Date().toISOString(),
    };
    dispatch({ type: "ARCHIVE_ROUND", payload: roundToArchive });

    // 2. Preparar nueva ronda con competidores empatados
    const tiedCompetitors = state.competidores
      .filter((c) => tiedCompetitorIds.includes(c.id))
      .map((c) => ({
        ...c,
        PuntajeFinal: null,
        PuntajesJueces: [],
        previousScore: c.PuntajeFinal, // Opcional: guardar puntaje anterior si se desea mostrar
      }));

    dispatch({ type: "SET_COMPETIDORES", payload: tiedCompetitors });
    setShowResultados(false);
    showToast.success(
      `Ronda ${currentRoundNumber} archivada. Iniciando desempate.`,
    );
  };

  // Función para avanzar a la siguiente ronda (cut off)
  const handleAdvanceRound = (selectedIds: number[]) => {
    // 1. Calcular métricas y ordenar
    const competidoresConMetricas = state.competidores
      .filter((c) => c.PuntajeFinal !== null && !c.Kiken)
      .map((c) => ({
        competidor: c,
        metrics: calculateKataMetrics(
          (c.PuntajesJueces || []).map((p) => p || "0"),
          state.numJudges,
        ),
      }));

    const sorted = competidoresConMetricas
      .sort((a, b) => compareCompetitors(a.metrics, b.metrics))
      .map((w) => w.competidor);

    const winners = sorted.filter((competidor) =>
      selectedIds.includes(competidor.id),
    );

    if (winners.length === 0) {
      showToast.error(
        "Selecciona al menos un competidor para la siguiente ronda",
      );
      return;
    }

    // 2. Archivar ronda actual
    const currentRoundNumber = state.previousRounds.length + 1;
    const currentRoundDefinition =
      roundDefinitions[
        Math.min(currentRoundNumber - 1, roundDefinitions.length - 1)
      ];
    const roundToArchive = {
      id: currentRoundNumber,
      nombre: currentRoundDefinition.label,
      key: currentRoundDefinition.key,
      countsForFinal: currentRoundDefinition.countsForFinal,
      competidores: [...state.competidores],
      fecha: new Date().toISOString(),
    };
    dispatch({ type: "ARCHIVE_ROUND", payload: roundToArchive });

    // 3. Preparar nueva ronda con los ganadores
    const nextRoundCompetitors = [...winners]
      .sort(
        (a, b) =>
          (a.PuntajeFinal ?? Number.POSITIVE_INFINITY) -
          (b.PuntajeFinal ?? Number.POSITIVE_INFINITY),
      )
      .map((c) => ({
        ...c,
        PuntajeFinal: null,
        PuntajesJueces: [],
      }));

    dispatch({ type: "SET_COMPETIDORES", payload: nextRoundCompetitors });
    setShowResultados(false);
    showToast.success(
      `Siguiente ronda iniciada con ${winners.length} competidores`,
    );
  };

  return (
    <div className="app-shell">
      <div className="app-container">
        <KataHeaderActions
          displayWindowOpen={state.displayWindowOpen}
          competitorCount={state.competidores.length}
          canAdvance={roundStructure.nextRoundCutoff !== null}
          onBack={() => navigate("/inicio")}
          onOpenDisplay={handleOpenKataDisplay}
          onCloseDisplay={handleCloseKataDisplay}
          onExport={(format) => kataActions.exportFiles(format)}
          onReset={handleReset}
          onShowResults={() => setShowResultados(true)}
          onAdvanceRound={() => setShowResultados(true)}
        />

        <KataRoundHistory rounds={state.previousRounds} />

        <KataConfigurationPanel
          categories={kataCategories}
          selectedCategoryId={selectedCategoryId}
          onCategoryChange={handleCategorySelection}
        />

        {/* Competidores */}
        <Card className="app-panel rounded-[1.75rem]">
          <CardBody className="p-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="app-section-title">
                Ronda Actual: {roundStructure.label}
              </h2>
              <Button
                className="app-button-primary"
                onPress={() => setShowAgregarCompetidor(true)}
              >
                + Agregar Competidor
              </Button>
            </div>

            {state.competidores.length === 0 ? (
              <div className="app-empty-state">
                <p className="text-lg text-slate-100">
                  No hay competidores agregados
                </p>
                <p className="text-sm mt-2 text-slate-400">
                  Selecciona una categoría cargada en inicio o agrega
                  competidores manualmente
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {state.competidores.map((competidor, index) => {
                  return (
                    <KataCompetitorCard
                      key={competidor.id}
                      competidor={competidor}
                      index={index}
                      onKiken={handleKiken}
                      onDelete={handleEliminarCompetidor}
                    />
                  );

                })}
              </div>
            )}
          </CardBody>
        </Card>

        <KataDialogs
          showHistory={showHistorial}
          showAddCompetitor={showAgregarCompetidor}
          showResults={showResultados}
          competitors={state.competidores}
          previousRounds={state.previousRounds}
          numJudges={state.numJudges}
          categoria={state.categoria}
          area={state.area}
          currentRound={state.previousRounds.length + 1}
          roundFormat={state.roundFormat}
          sumRounds={sumRounds}
          onCloseHistory={() => setShowHistorial(false)}
          onLoadCompetition={handleLoadCompetencia}
          onCloseAddCompetitor={() => setShowAgregarCompetidor(false)}
          onAddCompetitor={handleAddCompetidor}
          onCloseResults={() => setShowResultados(false)}
          onExport={(format) => kataActions.exportFiles(format)}
          onTieBreaker={handleStartTieBreaker}
          onNextRound={handleAdvanceRound}
        />

      </div>
    </div>
  );
}
