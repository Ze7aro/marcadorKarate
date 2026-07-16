import { useState, useEffect } from "react";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Input,
  Select,
  SelectItem,
  Chip,
  Divider,
} from "@heroui/react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useKumite } from "@/context/KumiteContext";
import { generateBracket, getCurrentMatch } from "@/utils/bracketUtils";
import { useTimer } from "@/hooks/useTimer";
import AgregarCompetidor from "./KumiteComponents/AgregarCompetidor";
import BracketView from "./KumiteComponents/BracketView";
import ResultadosFinales from "./KumiteComponents/ResultadosFinales";
import WinnerModal from "./KumiteComponents/WinnerModal";
import EnchoSenModal from "./KumiteComponents/EnchoSenModal";
import toast from "react-hot-toast";
import type {
  CompetidorKumite,
  PenaltyType,
  WarningType,
} from "@/types/events";

import { invoke } from "@tauri-apps/api/core";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import { useCategoryCatalog } from "@/hooks/useCategoryCatalog";

export default function KumitePage() {
  const navigate = useNavigate();
  const { t } = useTranslation(["kumite", "common"]);
  const { state, dispatch } = useKumite();
  const { getByDiscipline } = useCategoryCatalog();
  const kumiteCategories = getByDiscipline("kumite");

  const [showAgregarDialog, setShowAgregarDialog] = useState(false);
  const [showBracketDialog, setShowBracketDialog] = useState(false);
  const [showResultsDialog, setShowResultsDialog] = useState(false);
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [showEnchoSenModal, setShowEnchoSenModal] = useState(false);
  const [winnerInfo, setWinnerInfo] = useState<{
    name: string;
    scoreAka: number;
    scoreShiro: number;
    side: "aka" | "shiro" | null;
    reason?: "disqualification" | "hantei" | null;
  }>({
    name: "",
    scoreAka: 0,
    scoreShiro: 0,
    side: null,
    reason: null,
  });

  // Timer para el match actual
  const currentMatch = state.bracket ? getCurrentMatch(state.bracket) : null;
  const infractionButtonClass =
    "border border-amber-300/28 bg-amber-500/22 text-amber-50 font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]";
  const winnerButtonClass =
    "border border-rose-400/55 bg-rose-500/12 text-rose-100 font-bold shadow-[0_0_0_1px_rgba(244,63,94,0.18)]";

  // Verificar si el torneo está completado
  const isTournamentCompleted =
    state.bracket &&
    state.bracket.matches.every(
      (m) =>
        m.status === "completed" || (!m.competidorAka && !m.competidorShiro),
    );
  const { formattedTime, isRunning, start, pause, reset } = useTimer({
    initialTime: currentMatch?.timeRemaining || state.matchDuration,
    onTick: (timeRemaining) => {
      if (currentMatch) {
        dispatch({
          type: "UPDATE_TIMER",
          payload: { matchId: currentMatch.id, timeRemaining },
        });
      }
    },
    onComplete: () => {
      toast.success(t("kumite:messages.timeUp"));
      dispatch({ type: "STOP_TIMER" });

      if (currentMatch) {
        if (
          currentMatch.isEnchoSen &&
          currentMatch.scoreAka === currentMatch.scoreShiro
        ) {
          // Si termina el tiempo en Encho-sen y siguen empate -> Hantei (o decisión manual)
          // Por ahora lo dejamos completado para que decidan
          dispatch({
            type: "UPDATE_MATCH",
            payload: { id: currentMatch.id, data: { status: "completed" } },
          });
        } else if (currentMatch.scoreAka === currentMatch.scoreShiro) {
          // Empate Normal: Solo marcar como completado, el botón para Encho-sen aparecerá
          dispatch({
            type: "UPDATE_MATCH",
            payload: { id: currentMatch.id, data: { status: "completed" } },
          });
        } else if (currentMatch.scoreAka > currentMatch.scoreShiro) {
          // Ganador Aka por puntos
          handleDeclareWinner(currentMatch.competidorAka!.id);
        } else {
          // Ganador Shiro por puntos
          handleDeclareWinner(currentMatch.competidorShiro!.id);
        }
      }
    },
  });

  const handleAddCompetidor = (nombre: string, edad: number) => {
    const nuevoCompetidor: CompetidorKumite = {
      id: Date.now(),
      Nombre: nombre,
      Edad: edad,
      Categoria: state.categoria,
    };

    dispatch({ type: "ADD_COMPETIDOR", payload: nuevoCompetidor });
    toast.success(`${nombre} agregado`);
  };

  const handleRemoveCompetidor = (id: number) => {
    dispatch({ type: "REMOVE_COMPETIDOR", payload: id });
    toast.success(t("kumite:competitor.remove"));
  };

  const selectedCategoryId =
    kumiteCategories.find((item) => item.categoria === state.categoria)?.id ||
    "";

  const handleCategorySelection = (categoryId: string) => {
    const selectedCategory = kumiteCategories.find(
      (category) => category.id === categoryId,
    );

    if (!selectedCategory) {
      return;
    }

    const competidoresKumite: CompetidorKumite[] =
      selectedCategory.competidores.map((competidor, index) => ({
        ...competidor,
        id: index + 1,
        Categoria: selectedCategory.categoria,
      }));

    dispatch({
      type: "LOAD_CATEGORY",
      payload: {
        categoria: selectedCategory.categoria,
        competidores: competidoresKumite,
      },
    });
    reset(state.matchDuration);
    toast.success(`Categoría ${selectedCategory.categoria} cargada`);
  };

  const handleGenerarBracket = () => {
    if (state.competidores.length < 2) {
      toast.error(t("kumite:messages.minCompetitors"));
      return;
    }

    try {
      const bracket = generateBracket(state.competidores, state.matchDuration);
      dispatch({ type: "GENERATE_BRACKET", payload: bracket });
      dispatch({ type: "SET_CURRENT_MATCH", payload: bracket.currentMatchId });
      toast.success(
        t("kumite:messages.bracketGenerated", {
          matches: bracket.matches.length,
        }),
      );
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  const handleStartPauseTimer = () => {
    if (isRunning) {
      pause();
      dispatch({ type: "STOP_TIMER" });
    } else {
      start();
      dispatch({ type: "START_TIMER" });
    }
  };

  // Función para abrir la ventana de proyección
  const handleOpenProjection = async () => {
    try {
      // Verificar si la ventana ya existe
      const existingWindow = await WebviewWindow.getByLabel("kumite-display");

      if (existingWindow) {
        await existingWindow.setFocus();
        toast.success(t("kumite:messages.projectionOpened"));
        return;
      }

      // Crear nueva ventana usando el comando Rust
      await invoke("open_kumite_display");

      // Actualizar estado
      dispatch({ type: "SET_DISPLAY_WINDOW", payload: true });
      toast.success(t("kumite:messages.projectionOpened"));
    } catch (error) {
      console.error("Error opening display window:", error);
      toast.error("Error al abrir ventana de proyección");
    }
  };

  // Función para cerrar la ventana de proyección
  const handleCloseProjection = async () => {
    try {
      await invoke("close_kumite_display");
      dispatch({ type: "SET_DISPLAY_WINDOW", payload: false });
      toast.success("Ventana de proyección cerrada");
    } catch (error) {
      console.error("Error closing display window:", error);
      toast.error("Error al cerrar ventana de proyección");
    }
  };

  const handleResetTimer = () => {
    reset(state.matchDuration);
    if (currentMatch) {
      dispatch({
        type: "UPDATE_MATCH",
        payload: {
          id: currentMatch.id,
          data: { timeRemaining: state.matchDuration },
        },
      });
    }
  };

  const handleAddScore = (side: "aka" | "shiro", points: number) => {
    if (currentMatch) {
      dispatch({
        type: "ADD_SCORE",
        payload: { matchId: currentMatch.id, side, points },
      });
    }
  };

  const handleSelectMatch = (matchId: number) => {
    dispatch({ type: "SET_CURRENT_MATCH", payload: matchId });
    const selectedMatch = state.bracket?.matches.find((m) => m.id === matchId);
    if (selectedMatch) {
      reset(selectedMatch.timeRemaining);
    }
    setShowBracketDialog(false);
    toast.success(t("kumite:messages.matchSelected"));
  };

  const handleAddPenalty = (side: "aka" | "shiro", penalty: PenaltyType) => {
    if (currentMatch) {
      const currentPenalties =
        side === "aka"
          ? currentMatch.penaltiesAka
          : currentMatch.penaltiesShiro;

      if (currentPenalties?.includes(penalty)) {
        toast.error(t("kumite:messages.penaltyAlreadyExists"));
        return;
      }

      dispatch({
        type: "ADD_PENALTY",
        payload: { matchId: currentMatch.id, side, penalty },
      });
      toast.success(
        `${t("kumite:penalties.title")}: ${t(`kumite:penalties.${penalty}`)}`,
      );
    }
  };

  const handleAddWarning = (side: "aka" | "shiro", warning: WarningType) => {
    if (currentMatch) {
      const currentWarnings =
        side === "aka" ? currentMatch.warningsAka : currentMatch.warningsShiro;

      if (currentWarnings?.includes(warning)) {
        toast.error(t("kumite:messages.warningAlreadyExists"));
        return;
      }

      dispatch({
        type: "ADD_WARNING",
        payload: { matchId: currentMatch.id, side, warning },
      });
      toast.success(
        `${t("kumite:warnings.title")}: ${t(`kumite:warnings.${warning}`)}`,
      );
    }
  };

  const handleRemovePenalty = (side: "aka" | "shiro", index: number) => {
    if (currentMatch) {
      dispatch({
        type: "REMOVE_PENALTY",
        payload: { matchId: currentMatch.id, side, index },
      });
      toast.success(t("common:states.success"));
    }
  };

  const handleRemoveWarning = (side: "aka" | "shiro", index: number) => {
    if (currentMatch) {
      dispatch({
        type: "REMOVE_WARNING",
        payload: { matchId: currentMatch.id, side, index },
      });
      toast.success(t("common:states.success"));
    }
  };

  const handleDeclareWinner = (
    winnerId: number,
    reason?: "disqualification" | "hantei" | null,
  ) => {
    if (currentMatch && state.bracket) {
      // Obtener nombre del ganador
      const winner =
        currentMatch.competidorAka?.id === winnerId
          ? currentMatch.competidorAka
          : currentMatch.competidorShiro;

      // Un solo dispatch atómico para declarar ganador y avanzar bracket
      dispatch({
        type: "DECLARE_WINNER",
        payload: {
          matchId: currentMatch.id,
          winnerId,
          reason: reason || undefined,
        },
      });

      // Detener timer local
      pause();

      // Preparar y mostrar modal de ganador
      setWinnerInfo({
        name: winner?.Nombre || "",
        scoreAka: currentMatch.scoreAka,
        scoreShiro: currentMatch.scoreShiro,
        side: currentMatch.competidorAka?.id === winnerId ? "aka" : "shiro",
        reason: reason || null,
      });
      setShowWinnerModal(true);

      toast.success(
        t("kumite:messages.winnerDeclared", { winner: winner?.Nombre || "" }),
      );
    }
  };

  const handleNextMatch = () => {
    if (!state.bracket) return;

    const nextMatch = state.bracket.matches.find(
      (m) => m.status === "pending" && m.competidorAka && m.competidorShiro,
    );

    if (nextMatch) {
      dispatch({ type: "SET_CURRENT_MATCH", payload: nextMatch.id });
      reset(state.matchDuration);
      toast.success(t("kumite:messages.nextMatch"));
    }
  };

  // Efecto para verificar condición de victoria automática (3 puntos)
  useEffect(() => {
    if (
      currentMatch &&
      currentMatch.status !== "completed" &&
      currentMatch.competidorAka &&
      currentMatch.competidorShiro
    ) {
      // Condición de victoria por puntos (3 puntos)
      if (!currentMatch.isEnchoSen && currentMatch.scoreAka >= 3) {
        handleDeclareWinner(currentMatch.competidorAka.id);
        return;
      } else if (!currentMatch.isEnchoSen && currentMatch.scoreShiro >= 3) {
        handleDeclareWinner(currentMatch.competidorShiro.id);
        return;
      }

      // Condición de Encho-sen (Primer punto gana)
      if (currentMatch.isEnchoSen) {
        if (
          currentMatch.scoreAka > 0 &&
          currentMatch.scoreAka > currentMatch.scoreShiro
        ) {
          handleDeclareWinner(currentMatch.competidorAka.id);
          return;
        } else if (
          currentMatch.scoreShiro > 0 &&
          currentMatch.scoreShiro > currentMatch.scoreAka
        ) {
          handleDeclareWinner(currentMatch.competidorShiro.id);
          return;
        }
      }

      // Condición de descalificación por penalizaciones (Atenai Hansoku)
      if (currentMatch.penaltiesAka?.includes("atenai_hansoku")) {
        handleDeclareWinner(
          currentMatch.competidorShiro.id,
          "disqualification",
        );
        return;
      } else if (currentMatch.penaltiesShiro?.includes("atenai_hansoku")) {
        handleDeclareWinner(currentMatch.competidorAka.id, "disqualification");
        return;
      }

      // Condición de descalificación por avisos (Kinshi Hansoku)
      if (currentMatch.warningsAka?.includes("kinshi_hansoku")) {
        handleDeclareWinner(
          currentMatch.competidorShiro.id,
          "disqualification",
        );
        return;
      } else if (currentMatch.warningsShiro?.includes("kinshi_hansoku")) {
        handleDeclareWinner(currentMatch.competidorAka.id, "disqualification");
        return;
      }
    }
  }, [
    currentMatch?.scoreAka,
    currentMatch?.scoreShiro,
    currentMatch?.penaltiesAka,
    currentMatch?.penaltiesShiro,
    currentMatch?.warningsAka,
    currentMatch?.warningsShiro,
    currentMatch?.status,
    currentMatch?.id,
    currentMatch?.isEnchoSen,
  ]);

  const handleStartEnchoSen = (time: number) => {
    if (currentMatch) {
      dispatch({
        type: "START_ENCHO_SEN",
        payload: { matchId: currentMatch.id, time },
      });
      reset(time);
      start();
      toast.success(t("kumite:messages.matchStarted"));
    }
  };

  return (
    <div className="app-shell">
      <div className="app-container">
        {/* Header */}
        <div className="app-header">
          <div>
            <h1 className="app-title mb-2">⚔️ {t("kumite:module.title")}</h1>
            <p className="app-subtitle">{t("kumite:module.description")}</p>
          </div>
          <div className="app-toolbar">
            <Button
              className="app-button-secondary"
              onPress={() => navigate("/inicio")}
            >
              ← {t("common:buttons.back")}
            </Button>
            {state.bracket ? (
              <>
                <Button
                  className={
                    state.displayWindowOpen
                      ? "app-button-danger"
                      : "app-button-secondary"
                  }
                  onPress={
                    state.displayWindowOpen
                      ? handleCloseProjection
                      : handleOpenProjection
                  }
                >
                  {state.displayWindowOpen
                    ? "Cerrar Proyección"
                    : t("kumite:actions.openProjection")}
                </Button>
                <Button
                  className="app-button-primary"
                  onPress={() => setShowBracketDialog(true)}
                >
                  {t("kumite:bracket.view")}
                </Button>
                {isTournamentCompleted && (
                  <Button
                    className="app-button-primary"
                    onPress={() => setShowResultsDialog(true)}
                  >
                    {t("kumite:actions.viewResults")}
                  </Button>
                )}
              </>
            ) : (
              <Button
                className={
                  state.displayWindowOpen
                    ? "app-button-danger"
                    : "app-button-secondary"
                }
                onPress={
                  state.displayWindowOpen
                    ? handleCloseProjection
                    : handleOpenProjection
                }
              >
                {state.displayWindowOpen
                  ? "Cerrar Proyección"
                  : t("kumite:actions.openProjection")}
              </Button>
            )}
            <Button
              className="app-button-danger"
              onPress={() => dispatch({ type: "RESET_ALL" })}
            >
              {t("kumite:actions.reset")}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Configuración */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="app-panel rounded-[1.75rem]">
              <CardHeader className="pb-0">
                <h2 className="text-xl font-semibold text-white">
                  {t("kumite:config.title")}
                </h2>
              </CardHeader>
              <Divider className="app-subtle-divider" />
              <CardBody className="space-y-4">
                <Select
                  className="app-dark-select"
                  labelPlacement="outside-top"
                  label="Categoría importada"
                  placeholder="Selecciona una categoría"
                  selectedKeys={selectedCategoryId ? [selectedCategoryId] : []}
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys)[0] as string;
                    if (selected) {
                      handleCategorySelection(selected);
                    }
                  }}
                >
                  {kumiteCategories.map((category) => (
                    <SelectItem key={category.id} className="text-black">
                      {category.categoria}
                    </SelectItem>
                  ))}
                </Select>

                <Select
                  className="app-dark-select"
                  labelPlacement="outside-top"
                  label={t("kumite:config.area")}
                  placeholder={t("kumite:config.area")}
                  selectedKeys={state.area ? [state.area] : []}
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys)[0] as string;
                    dispatch({ type: "SET_AREA", payload: selected });
                  }}
                >
                  {["1", "2", "3", "4"].map((area) => (
                    <SelectItem
                      key={area}
                      className="text-black"
                    >{`Área ${area}`}</SelectItem>
                  ))}
                </Select>

                <Input
                  className="app-dark-input"
                  labelPlacement="outside-top"
                  label={t("kumite:config.category")}
                  placeholder={t("kumite:config.categoryPlaceholder")}
                  value={state.categoria}
                  onValueChange={(value) =>
                    dispatch({
                      type: "SET_CATEGORIA",
                      payload: { categoria: value, titulo: value },
                    })
                  }
                />

                <Select
                  className="app-dark-select"
                  labelPlacement="outside-top"
                  label={t("kumite:config.matchDuration")}
                  selectedKeys={[state.matchDuration.toString()]}
                  onSelectionChange={(keys) => {
                    const selected = parseInt(Array.from(keys)[0] as string);
                    dispatch({ type: "SET_MATCH_DURATION", payload: selected });
                    if (currentMatch) {
                      dispatch({
                        type: "UPDATE_MATCH",
                        payload: {
                          id: currentMatch.id,
                          data: { timeRemaining: selected },
                        },
                      });
                    }
                    reset(selected);
                  }}
                >
                  <SelectItem key="30" className="text-black">
                    30 {t("kumite:config.seconds")}
                  </SelectItem>
                  <SelectItem key="60" className="text-black">
                    1:00
                  </SelectItem>
                  <SelectItem key="90" className="text-black">
                    1:30
                  </SelectItem>
                  <SelectItem key="120" className="text-black">
                    2:00
                  </SelectItem>
                  <SelectItem key="180" className="text-black">
                    3:00
                  </SelectItem>
                </Select>

                <Divider className="app-subtle-divider" />

                <div className="space-y-2">
                  <h3 className="font-semibold text-slate-100">
                    {t("kumite:competitor.list")}
                  </h3>
                  <Button
                    className="app-button-primary"
                    fullWidth
                    onPress={() => setShowAgregarDialog(true)}
                  >
                    {t("kumite:competitor.add")}
                  </Button>
                  <p className="text-sm text-slate-400">
                    {t("kumite:competitor.total")}: {state.competidores.length}
                  </p>

                  {state.competidores.map((comp) => (
                    <div
                      key={comp.id}
                      className="app-competitor-row flex justify-between items-center p-3 rounded-xl"
                    >
                      <span className="text-sm text-slate-100 font-medium">
                        {comp.Nombre} ({comp.Edad})
                      </span>
                      <Button
                        size="sm"
                        className="app-button-danger min-w-12"
                        onPress={() => handleRemoveCompetidor(comp.id)}
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>

                {!state.bracket && (
                  <Button
                    className="app-button-primary"
                    fullWidth
                    onPress={handleGenerarBracket}
                    isDisabled={state.competidores.length < 2}
                  >
                    {t("kumite:bracket.generate")}
                  </Button>
                )}
              </CardBody>
            </Card>
          </div>

          {/* Match Actual */}
          <Card className="app-panel rounded-[1.75rem] lg:col-span-2">
            <CardHeader>
              <h2 className="text-xl font-semibold text-white">
                {t("kumite:match.current")}
              </h2>
            </CardHeader>
            <Divider className="app-subtle-divider" />
            <CardBody>
              {!currentMatch ? (
                <div className="app-empty-state my-8">
                  <p className="text-slate-200 mb-2">
                    {t("kumite:messages.noCompetitors")}
                  </p>
                  <p className="text-sm text-slate-400">
                    Agrega competidores y genera el bracket para comenzar
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Timer */}
                  <div className="text-center">
                    <div className="text-6xl font-bold mb-4 text-white">
                      {formattedTime}
                    </div>
                    <div className="flex justify-center gap-2">
                      <Button
                        color={isRunning ? "warning" : "success"}
                        onPress={handleStartPauseTimer}
                        isDisabled={currentMatch.status === "completed"}
                      >
                        {isRunning
                          ? t("kumite:match.pause")
                          : t("kumite:match.start")}
                      </Button>
                      <Button
                        variant="flat"
                        onPress={handleResetTimer}
                        isDisabled={currentMatch.status === "completed"}
                      >
                        {t("kumite:match.reset")}
                      </Button>
                    </div>
                  </div>

                  <Divider className="app-subtle-divider" />

                  {/* Competidores */}
                  <div className="grid grid-cols-2 gap-6">
                    {/* Aka (Rojo) */}
                    <div className="rounded-2xl p-4 bg-[rgba(93,22,37,0.48)] border border-rose-500/25">
                      <div className="text-center mb-4">
                        <Chip color="danger" className="mb-2 text-white">
                          {t("kumite:competitor.aka")}
                        </Chip>
                        <h3 className="text-xl font-bold text-white">
                          {currentMatch.competidorAka?.Nombre || "BYE"}
                        </h3>
                        <div className="text-4xl font-bold my-4 text-white">
                          {currentMatch.scoreAka}
                        </div>
                      </div>

                      {currentMatch.competidorAka && (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Button
                              size="sm"
                              color="primary"
                              fullWidth
                              onPress={() => handleAddScore("aka", 0.5)}
                              isDisabled={currentMatch.status === "completed"}
                            >
                              +0.5 {t("kumite:actions.wazari")}
                            </Button>
                            <Button
                              size="sm"
                              color="secondary"
                              fullWidth
                              onPress={() => handleAddScore("aka", 1)}
                              isDisabled={currentMatch.status === "completed"}
                            >
                              +1 {t("kumite:actions.ippon")}
                            </Button>
                          </div>

                          <Divider />

                          <div className="space-y-2">
                            <p className="text-xs font-semibold text-gray-500 uppercase">
                              {t("kumite:penalties.title")}
                            </p>
                            <div className="flex flex-wrap gap-1 mb-2 min-h-6">
                              {(currentMatch.penaltiesAka || []).map(
                                (p, idx) => (
                                  <Chip
                                    key={idx}
                                    size="sm"
                                    color="warning"
                                    variant="flat"
                                    onClose={
                                      currentMatch.status === "completed"
                                        ? undefined
                                        : () => handleRemovePenalty("aka", idx)
                                    }
                                  >
                                    {t(`kumite:penalties.${p}`)}
                                  </Chip>
                                ),
                              )}
                            </div>
                            <p className="text-xs font-semibold text-gray-500 uppercase mt-2">
                              {t("kumite:warnings.title")}
                            </p>
                            <div className="flex flex-wrap gap-1 mb-2 min-h-6">
                              {(currentMatch.warningsAka || []).map(
                                (w, idx) => (
                                  <Chip
                                    key={idx}
                                    size="sm"
                                    color="danger"
                                    variant="flat"
                                    onClose={
                                      currentMatch.status === "completed"
                                        ? undefined
                                        : () => handleRemoveWarning("aka", idx)
                                    }
                                  >
                                    {t(`kumite:warnings.${w}`)}
                                  </Chip>
                                ),
                              )}
                            </div>
                            <div className="grid grid-cols-3 gap-1">
                              {(
                                [
                                  "atenai",
                                  "atenai_chui",
                                  "atenai_hansoku",
                                ] as PenaltyType[]
                              ).map((p) => (
                                <Button
                                  key={p}
                                  size="sm"
                                  variant="bordered"
                                  className={infractionButtonClass}
                                  onPress={() => handleAddPenalty("aka", p)}
                                  isDisabled={
                                    currentMatch.status === "completed" ||
                                    currentMatch.penaltiesAka?.includes(p)
                                  }
                                >
                                  {t(`kumite:penalties.${p}`)}
                                </Button>
                              ))}
                            </div>
                            <div className="grid grid-cols-4 gap-1">
                              {(
                                [
                                  "kinshi",
                                  "kinshi_ni",
                                  "kinshi_chui",
                                  "kinshi_hansoku",
                                ] as WarningType[]
                              ).map((w) => (
                                <Button
                                  key={w}
                                  size="sm"
                                  variant="bordered"
                                  className={infractionButtonClass}
                                  onPress={() => handleAddWarning("aka", w)}
                                  isDisabled={
                                    currentMatch.status === "completed" ||
                                    currentMatch.warningsAka?.includes(w)
                                  }
                                >
                                  {t(`kumite:warnings.${w}`)}
                                </Button>
                              ))}
                            </div>
                          </div>

                          <Divider />

                          <Button
                            size="sm"
                            variant="bordered"
                            className={winnerButtonClass}
                            fullWidth
                            onPress={() =>
                              handleDeclareWinner(
                                currentMatch.competidorAka!.id,
                              )
                            }
                            isDisabled={currentMatch.status === "completed"}
                          >
                            {t("kumite:actions.declareWinner")}
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Shiro (Blanco) */}
                    <div className="rounded-2xl p-4 bg-[rgba(255,255,255,0.5)] border border-slate-400/20">
                      <div className="text-center mb-4">
                        <Chip className="mb-2 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white">
                          {t("kumite:competitor.shiro")}
                        </Chip>
                        <h3 className="text-xl font-bold">
                          {currentMatch.competidorShiro?.Nombre || "BYE"}
                        </h3>
                        <div className="text-4xl font-bold my-4">
                          {currentMatch.scoreShiro}
                        </div>
                      </div>

                      {currentMatch.competidorShiro && (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Button
                              size="sm"
                              color="primary"
                              fullWidth
                              onPress={() => handleAddScore("shiro", 0.5)}
                              isDisabled={currentMatch.status === "completed"}
                            >
                              +0.5 {t("kumite:actions.wazari")}
                            </Button>
                            <Button
                              size="sm"
                              color="secondary"
                              fullWidth
                              onPress={() => handleAddScore("shiro", 1)}
                              isDisabled={currentMatch.status === "completed"}
                            >
                              +1 {t("kumite:actions.ippon")}
                            </Button>
                          </div>

                          <Divider />

                          <div className="space-y-2">
                            <p className="text-xs font-semibold text-gray-400 uppercase">
                              {t("kumite:penalties.title")}
                            </p>
                            <div className="flex flex-wrap gap-1 mb-2 min-h-6">
                              {(currentMatch.penaltiesShiro || []).map(
                                (p, idx) => (
                                  <Chip
                                    key={idx}
                                    size="sm"
                                    color="warning"
                                    variant="flat"
                                    onClose={
                                      currentMatch.status === "completed"
                                        ? undefined
                                        : () =>
                                            handleRemovePenalty("shiro", idx)
                                    }
                                  >
                                    {t(`kumite:penalties.${p}`)}
                                  </Chip>
                                ),
                              )}
                            </div>
                            <p className="text-xs font-semibold text-gray-400 uppercase mt-2">
                              {t("kumite:warnings.title")}
                            </p>
                            <div className="flex flex-wrap gap-1 mb-2 min-h-6">
                              {(currentMatch.warningsShiro || []).map(
                                (w, idx) => (
                                  <Chip
                                    key={idx}
                                    size="sm"
                                    color="danger"
                                    variant="flat"
                                    onClose={
                                      currentMatch.status === "completed"
                                        ? undefined
                                        : () =>
                                            handleRemoveWarning("shiro", idx)
                                    }
                                  >
                                    {t(`kumite:warnings.${w}`)}
                                  </Chip>
                                ),
                              )}
                            </div>
                            <div className="grid grid-cols-3 gap-1">
                              {(
                                [
                                  "atenai",
                                  "atenai_chui",
                                  "atenai_hansoku",
                                ] as PenaltyType[]
                              ).map((p) => (
                                <Button
                                  key={p}
                                  size="sm"
                                  variant="bordered"
                                  className={infractionButtonClass}
                                  onPress={() => handleAddPenalty("shiro", p)}
                                  isDisabled={
                                    currentMatch.status === "completed" ||
                                    currentMatch.penaltiesShiro?.includes(p)
                                  }
                                >
                                  {t(`kumite:penalties.${p}`)}
                                </Button>
                              ))}
                            </div>
                            <div className="grid grid-cols-4 gap-1">
                              {(
                                [
                                  "kinshi",
                                  "kinshi_ni",
                                  "kinshi_chui",
                                  "kinshi_hansoku",
                                ] as WarningType[]
                              ).map((w) => (
                                <Button
                                  key={w}
                                  size="sm"
                                  variant="bordered"
                                  className={infractionButtonClass}
                                  onPress={() => handleAddWarning("shiro", w)}
                                  isDisabled={
                                    currentMatch.status === "completed" ||
                                    currentMatch.warningsShiro?.includes(w)
                                  }
                                >
                                  {t(`kumite:warnings.${w}`)}
                                </Button>
                              ))}
                            </div>
                          </div>

                          <Divider />

                          <Button
                            size="sm"
                            variant="bordered"
                            className={winnerButtonClass}
                            fullWidth
                            onPress={() =>
                              handleDeclareWinner(
                                currentMatch.competidorShiro!.id,
                              )
                            }
                            isDisabled={currentMatch.status === "completed"}
                          >
                            {t("kumite:actions.declareWinner")}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Estado del Match */}
                  <div className="text-center">
                    <Chip
                      color={
                        currentMatch.status === "completed"
                          ? "success"
                          : "warning"
                      }
                    >
                      {currentMatch.status === "pending" &&
                        t("kumite:bracket.pending")}
                      {currentMatch.status === "in_progress" &&
                        t("kumite:bracket.inProgress")}
                      {currentMatch.status === "completed" &&
                        t("kumite:bracket.completed")}
                    </Chip>

                    {currentMatch.status === "completed" &&
                      currentMatch.scoreAka === currentMatch.scoreShiro &&
                      !currentMatch.winnerId &&
                      !currentMatch.isEnchoSen && (
                        <div className="mt-4 p-4 border rounded-lg bg-[rgba(12,24,43,0.72)] border-[rgba(80,125,196,0.14)]">
                          <Button
                            color="warning"
                            className="w-full font-bold"
                            onPress={() => setShowEnchoSenModal(true)}
                          >
                            {t("kumite:actions.startEnchoSen")}
                          </Button>
                        </div>
                      )}

                    {currentMatch.status === "completed" &&
                      currentMatch.isEnchoSen &&
                      currentMatch.scoreAka === currentMatch.scoreShiro &&
                      !currentMatch.winnerId && (
                        // Si Encho-sen termina empate, mostrar Hantei como fallback
                        <div className="mt-4 p-4 border rounded-lg bg-[rgba(12,24,43,0.72)] border-[rgba(80,125,196,0.14)]">
                          <p className="font-bold mb-2">
                            {t("kumite:actions.hantei")}
                          </p>
                          <div className="flex gap-2 justify-center">
                            <Button
                              color="danger"
                              onPress={() =>
                                handleDeclareWinner(
                                  currentMatch.competidorAka!.id,
                                  "hantei",
                                )
                              }
                            >
                              {t("kumite:competitor.aka")}
                            </Button>
                            <Button
                              className="bg-gray-200 text-gray-800"
                              onPress={() =>
                                handleDeclareWinner(
                                  currentMatch.competidorShiro!.id,
                                  "hantei",
                                )
                              }
                            >
                              {t("kumite:competitor.shiro")}
                            </Button>
                          </div>
                        </div>
                      )}

                    {currentMatch.status === "completed" &&
                      (currentMatch.winnerId ||
                        currentMatch.scoreAka !== currentMatch.scoreShiro) && (
                        <div className="mt-4">
                          <Button
                            color="primary"
                            size="lg"
                            onPress={handleNextMatch}
                            className="px-8 font-bold"
                          >
                            {t("kumite:messages.nextMatch")} →
                          </Button>
                        </div>
                      )}
                  </div>
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>

      <AgregarCompetidor
        isOpen={showAgregarDialog}
        onClose={() => setShowAgregarDialog(false)}
        onAdd={handleAddCompetidor}
      />

      {state.bracket && (
        <>
          <BracketView
            isOpen={showBracketDialog}
            onClose={() => setShowBracketDialog(false)}
            bracket={state.bracket}
            onSelectMatch={handleSelectMatch}
          />
          <ResultadosFinales
            isOpen={showResultsDialog}
            onClose={() => setShowResultsDialog(false)}
            bracket={state.bracket}
            categoria={state.categoria}
            area={state.area}
          />
          {winnerInfo && (
            <WinnerModal
              isOpen={showWinnerModal}
              onClose={() => setShowWinnerModal(false)}
              winnerName={winnerInfo.name}
              scoreAka={winnerInfo.scoreAka}
              scoreShiro={winnerInfo.scoreShiro}
              side={winnerInfo.side}
              reason={winnerInfo.reason}
              hasNextMatch={state.bracket?.matches.some(
                (m) =>
                  m.status === "pending" &&
                  m.competidorAka &&
                  m.competidorShiro,
              )}
              onNextMatch={handleNextMatch}
            />
          )}
          <EnchoSenModal
            isOpen={showEnchoSenModal}
            onClose={() => setShowEnchoSenModal(false)}
            onConfirm={handleStartEnchoSen}
          />
        </>
      )}
    </div>
  );
}
