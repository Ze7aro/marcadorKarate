import { useState, useEffect } from "react";
import {
  Button,
} from "@heroui/react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useKumite } from "@/context/KumiteContext";
import { getCurrentMatch } from "@/utils/bracketUtils";
import toast from "react-hot-toast";

import { useCategoryCatalog } from "@/hooks/useCategoryCatalog";
import { useKumiteProjection } from "./KumiteComponents/useKumiteProjection";
import { useKumiteTimerFlow } from "./KumiteComponents/useKumiteTimerFlow";
import { useKumiteMatchActions } from "./KumiteComponents/useKumiteMatchActions";
import { useKumiteWinnerFlow } from "./KumiteComponents/useKumiteWinnerFlow";
import { useKumiteSetupActions } from "./KumiteComponents/useKumiteSetupActions";
import KumiteDialogs from "./KumiteComponents/KumiteDialogs";
import KumiteSetupPanel from "./KumiteComponents/KumiteSetupPanel";
import KumiteMatchPanel from "./KumiteComponents/KumiteMatchPanel";

export default function KumitePage() {
  const navigate = useNavigate();
  const { t } = useTranslation(["kumite", "common"]);
  const { state, dispatch } = useKumite();
  const { openProjection, closeProjection } = useKumiteProjection();
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
  }>({ name: "", scoreAka: 0, scoreShiro: 0, side: null, reason: null });

  const currentMatch = state.bracket ? getCurrentMatch(state.bracket) : null;
  const isMatchCompleted = currentMatch?.status === "completed";
  const isTimeExpired = !!currentMatch && currentMatch.timeRemaining === 0;
  const isAtoshiBaraku = !!currentMatch && currentMatch.timeRemaining > 0 && currentMatch.timeRemaining <= 15;
  const infractionButtonClass = "border border-amber-300/28 bg-amber-500/22 text-amber-50 font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]";
  const winnerButtonClass = " bg-rose-500/12 text-rose-100 font-bold shadow-[0_0_0_1px_rgba(244,63,94,0.18)]";
  const isTournamentCompleted = state.bracket && state.bracket.matches.every((match) => match.status === "completed" || (!match.competidorAka && !match.competidorShiro));
  const { formattedTime, isRunning, start, pause, reset } = useKumiteTimerFlow(currentMatch, state.matchDuration);
  const { swapSides, addScore, removeScore, addPenalty, addWarning, removePenalty, removeWarning } = useKumiteMatchActions(currentMatch, isMatchCompleted);
  const { declareWinner, nextMatch, resolveMatch } = useKumiteWinnerFlow({ currentMatch, pause, reset, setWinnerInfo, setShowWinnerModal, setShowEnchoSenModal });
  const { selectedCategoryId, addCompetitor, removeCompetitor, selectCategory, generateTournamentBracket } = useKumiteSetupActions(kumiteCategories, reset);

  const handleEditMatchResult = (matchId: number, scoreAka: number, scoreShiro: number, winnerId: number) => {
    dispatch({ type: "EDIT_MATCH_RESULT", payload: { matchId, scoreAka, scoreShiro, winnerId } });
    toast.success("Resultado actualizado");
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

  const handleDurationChange = (duration: number) => {
    dispatch({ type: "SET_MATCH_DURATION", payload: duration });
    if (currentMatch) dispatch({ type: "UPDATE_MATCH", payload: { id: currentMatch.id, data: { timeRemaining: duration } } });
    reset(duration);
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
        declareWinner(currentMatch.competidorAka.id);
        return;
      } else if (!currentMatch.isEnchoSen && currentMatch.scoreShiro >= 3) {
        declareWinner(currentMatch.competidorShiro.id);
        return;
      }

      // Condición de Encho-sen (Primer punto gana)
      if (currentMatch.isEnchoSen) {
        if (
          currentMatch.scoreAka > 0 &&
          currentMatch.scoreAka > currentMatch.scoreShiro
        ) {
          declareWinner(currentMatch.competidorAka.id);
          return;
        } else if (
          currentMatch.scoreShiro > 0 &&
          currentMatch.scoreShiro > currentMatch.scoreAka
        ) {
          declareWinner(currentMatch.competidorShiro.id);
          return;
        }
      }

      // Condición de descalificación por penalizaciones (Atenai Hansoku)
      if (currentMatch.penaltiesAka?.includes("atenai_hansoku")) {
        declareWinner(
          currentMatch.competidorShiro.id,
          "disqualification",
        );
        return;
      } else if (currentMatch.penaltiesShiro?.includes("atenai_hansoku")) {
        declareWinner(currentMatch.competidorAka.id, "disqualification");
        return;
      }

      // Condición de descalificación por avisos (Kinshi Hansoku)
      if (currentMatch.warningsAka?.includes("kinshi_hansoku")) {
        declareWinner(
          currentMatch.competidorShiro.id,
          "disqualification",
        );
        return;
      } else if (currentMatch.warningsShiro?.includes("kinshi_hansoku")) {
        declareWinner(currentMatch.competidorAka.id, "disqualification");
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
    <div className="app-shell lg:h-screen lg:overflow-hidden">
      <div className="app-container flex h-full min-h-0 flex-col">
        {/* Header */}
        <div className="app-header shrink-0">
          <div className="flex gap-2">
            <h1 className="app-title mb-2">{t("kumite:module.title")}</h1>
            <p className="app-subtitle self-end">
              {t("kumite:module.description")}
            </p>
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
                      ? closeProjection
                      : openProjection
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
                    ? closeProjection
                    : openProjection
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

        <div className="grid grid-cols-1 gap-4 lg:min-h-0 lg:flex-1 lg:grid-cols-[minmax(320px,0.95fr)_minmax(0,2fr)] lg:items-stretch">
          <KumiteSetupPanel
            categories={kumiteCategories}
            selectedCategoryId={selectedCategoryId}
            onCategoryChange={selectCategory}
            onDurationChange={handleDurationChange}
            onAddCompetitor={() => setShowAgregarDialog(true)}
            onRemoveCompetitor={removeCompetitor}
            onGenerateBracket={generateTournamentBracket}
          />

          <KumiteMatchPanel
            currentMatch={currentMatch}
            isMatchCompleted={isMatchCompleted}
            isTimeExpired={isTimeExpired}
            isAtoshiBaraku={isAtoshiBaraku}
            formattedTime={formattedTime}
            isRunning={isRunning}
            handleStartPauseTimer={handleStartPauseTimer}
            handleResetTimer={handleResetTimer}
            swapSides={swapSides}
            addScore={addScore}
            removeScore={removeScore}
            addPenalty={addPenalty}
            addWarning={addWarning}
            removePenalty={removePenalty}
            removeWarning={removeWarning}
            declareWinner={declareWinner}
            resolveMatch={resolveMatch}
            infractionButtonClass={infractionButtonClass}
            winnerButtonClass={winnerButtonClass}
          />

        </div>
      </div>

      <KumiteDialogs
        showAdd={showAgregarDialog}
        showBracket={showBracketDialog}
        showResults={showResultsDialog}
        showWinner={showWinnerModal}
        showEnchoSen={showEnchoSenModal}
        bracket={state.bracket}
        winnerInfo={winnerInfo}
        categoria={state.categoria}
        area={state.area}
        onAdd={addCompetitor}
        onCloseAdd={() => setShowAgregarDialog(false)}
        onCloseBracket={() => setShowBracketDialog(false)}
        onSelectMatch={handleSelectMatch}
        onEditMatchResult={handleEditMatchResult}
        onCloseResults={() => setShowResultsDialog(false)}
        onCloseWinner={() => setShowWinnerModal(false)}
        onNextMatch={nextMatch}
        onCloseEnchoSen={() => setShowEnchoSenModal(false)}
        onConfirmEnchoSen={handleStartEnchoSen}
      />

    </div>
  );
}
