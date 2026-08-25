import { useKumite } from "@/context/KumiteContext";
import type { PenaltyType, WarningType } from "@/types/events";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";

export function useKumiteMatchActions(currentMatch: any, isMatchCompleted: boolean | undefined) {
  const { dispatch } = useKumite();
  const { t } = useTranslation(["kumite", "common"]);

  const swapSides = () => {
    if (!currentMatch || isMatchCompleted) return;
    dispatch({ type: "SWAP_MATCH_COMPETITORS", payload: { matchId: currentMatch.id } });
    toast.success("Shiro y Aka intercambiados");
  };

  const addScore = (side: "aka" | "shiro", points: number) => {
    if (currentMatch) dispatch({ type: "ADD_SCORE", payload: { matchId: currentMatch.id, side, points } });
  };

  const removeScore = (side: "aka" | "shiro", points: number) => {
    if (currentMatch) dispatch({ type: "REMOVE_SCORE", payload: { matchId: currentMatch.id, side, points } });
  };

  const addPenalty = (side: "aka" | "shiro", penalty: PenaltyType) => {
    if (!currentMatch) return;
    const penalties = side === "aka" ? currentMatch.penaltiesAka : currentMatch.penaltiesShiro;
    if (penalties?.includes(penalty)) {
      toast.error(t("kumite:messages.penaltyAlreadyExists"));
      return;
    }
    dispatch({ type: "ADD_PENALTY", payload: { matchId: currentMatch.id, side, penalty } });
    toast.success(`${t("kumite:penalties.title")}: ${t(`kumite:penalties.${penalty}`)}`);
  };

  const addWarning = (side: "aka" | "shiro", warning: WarningType) => {
    if (!currentMatch) return;
    const warnings = side === "aka" ? currentMatch.warningsAka : currentMatch.warningsShiro;
    if (warnings?.includes(warning)) {
      toast.error(t("kumite:messages.warningAlreadyExists"));
      return;
    }
    dispatch({ type: "ADD_WARNING", payload: { matchId: currentMatch.id, side, warning } });
    toast.success(`${t("kumite:warnings.title")}: ${t(`kumite:warnings.${warning}`)}`);
  };

  const removePenalty = (side: "aka" | "shiro", index: number) => {
    if (currentMatch) {
      dispatch({ type: "REMOVE_PENALTY", payload: { matchId: currentMatch.id, side, index } });
      toast.success(t("common:states.success"));
    }
  };

  const removeWarning = (side: "aka" | "shiro", index: number) => {
    if (currentMatch) {
      dispatch({ type: "REMOVE_WARNING", payload: { matchId: currentMatch.id, side, index } });
      toast.success(t("common:states.success"));
    }
  };

  return { swapSides, addScore, removeScore, addPenalty, addWarning, removePenalty, removeWarning };
}
