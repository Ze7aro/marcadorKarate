import { useKumite } from "@/context/KumiteContext";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";

type WinnerInfo = {
  name: string;
  scoreAka: number;
  scoreShiro: number;
  side: "aka" | "shiro" | null;
  reason?: "disqualification" | "hantei" | null;
};

type Props = {
  currentMatch: any;
  pause: () => void;
  reset: (time?: number) => void;
  setWinnerInfo: (info: WinnerInfo) => void;
  setShowWinnerModal: (open: boolean) => void;
  setShowEnchoSenModal: (open: boolean) => void;
};

export function useKumiteWinnerFlow({ currentMatch, pause, reset, setWinnerInfo, setShowWinnerModal, setShowEnchoSenModal }: Props) {
  const { state, dispatch } = useKumite();
  const { t } = useTranslation(["kumite"]);

  const declareWinner = (winnerId: number, reason?: "disqualification" | "hantei" | null) => {
    if (!currentMatch || !state.bracket) return;
    const winner = currentMatch.competidorAka?.id === winnerId ? currentMatch.competidorAka : currentMatch.competidorShiro;
    dispatch({ type: "DECLARE_WINNER", payload: { matchId: currentMatch.id, winnerId, reason: reason || undefined } });
    pause();
    setWinnerInfo({ name: winner?.Nombre || "", scoreAka: currentMatch.scoreAka, scoreShiro: currentMatch.scoreShiro, side: currentMatch.competidorAka?.id === winnerId ? "aka" : "shiro", reason: reason || null });
    setShowWinnerModal(true);
    toast.success(t("kumite:messages.winnerDeclared", { winner: winner?.Nombre || "" }));
  };

  const nextMatch = () => {
    if (!state.bracket) return;
    const next = state.bracket.matches.find((match) => match.status === "pending" && match.competidorAka && match.competidorShiro);
    if (next) {
      dispatch({ type: "SET_CURRENT_MATCH", payload: next.id });
      reset(state.matchDuration);
      toast.success(t("kumite:messages.nextMatch"));
    }
  };

  const resolveMatch = () => {
    if (!currentMatch) return;
    if (currentMatch.scoreAka === currentMatch.scoreShiro) {
      if (!currentMatch.isEnchoSen) setShowEnchoSenModal(true);
      return;
    }
    declareWinner(currentMatch.scoreAka > currentMatch.scoreShiro ? currentMatch.competidorAka!.id : currentMatch.competidorShiro!.id);
  };

  return { declareWinner, nextMatch, resolveMatch };
}
