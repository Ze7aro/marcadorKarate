import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { useKumite } from "@/context/KumiteContext";
import { useTimer } from "@/hooks/useTimer";
import { playBell } from "./KumiteScoreControls";

type Match = ReturnType<typeof import("@/utils/bracketUtils").getCurrentMatch>;

export function useKumiteTimerFlow(currentMatch: Match, matchDuration: number) {
  const { dispatch } = useKumite();
  const { t } = useTranslation(["kumite"]);
  const bellFiredRef = useRef<number | null>(null);
  const atoshiFiredRef = useRef<number | null>(null);
  const timer = useTimer({
    initialTime: currentMatch?.timeRemaining || matchDuration,
    onTick: (timeRemaining) => {
      if (currentMatch) dispatch({ type: "UPDATE_TIMER", payload: { matchId: currentMatch.id, timeRemaining } });
    },
    onComplete: () => {
      playBell();
      toast.success(t("kumite:messages.timeUp"));
      dispatch({ type: "STOP_TIMER" });
    },
  });

  useEffect(() => {
    if (!currentMatch) {
      bellFiredRef.current = null;
      atoshiFiredRef.current = null;
      return;
    }
    if (bellFiredRef.current !== currentMatch.id && currentMatch.timeRemaining === 0) {
      bellFiredRef.current = currentMatch.id;
    }
    if (atoshiFiredRef.current !== currentMatch.id && currentMatch.timeRemaining === 15) {
      atoshiFiredRef.current = currentMatch.id;
      toast(t("kumite:messages.atoshiBaraku"), { icon: "⏱️" });
    }
    if (currentMatch.timeRemaining > 15) atoshiFiredRef.current = null;
  }, [currentMatch?.id, currentMatch?.timeRemaining, t]);

  return timer;
}
