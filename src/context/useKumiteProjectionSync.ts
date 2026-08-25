import { useEffect } from "react";
import { useCrossPlatformChannel } from "@/hooks/useCrossPlatformChannel";
import { createTechniqueCounts } from "@/utils/bracketUtils";
import type { KumiteStateSync } from "@/types/events";
import { KUMITE_EVENTS } from "@/types/events";

export function useKumiteProjectionSync(state: any) {
  const postKumiteMessage = useCrossPlatformChannel<KumiteStateSync>(KUMITE_EVENTS.SYNC_STATE, () => undefined);
  useEffect(() => {
    const timer = setTimeout(() => {
      const currentMatch = state.bracket?.matches.find((match: any) => match.id === state.currentMatchId);
      const data: KumiteStateSync = {
        currentMatch: currentMatch || null,
        competidorAka: currentMatch?.competidorAka?.Nombre || "",
        competidorShiro: currentMatch?.competidorShiro?.Nombre || "",
        scoreAka: currentMatch?.scoreAka || 0,
        scoreShiro: currentMatch?.scoreShiro || 0,
        techniqueCountsAka: currentMatch?.techniqueCountsAka || createTechniqueCounts(),
        techniqueCountsShiro: currentMatch?.techniqueCountsShiro || createTechniqueCounts(),
        timeRemaining: currentMatch?.timeRemaining || 0,
        isRunning: state.isTimerRunning,
        categoria: state.categoria,
        area: state.area,
        penaltiesAka: currentMatch?.penaltiesAka || [],
        penaltiesShiro: currentMatch?.penaltiesShiro || [],
        atenaiCountAka: currentMatch?.atenaiCountAka || 0,
        atenaiCountShiro: currentMatch?.atenaiCountShiro || 0,
        warningsAka: currentMatch?.warningsAka || [],
        warningsShiro: currentMatch?.warningsShiro || [],
        status: currentMatch?.status || "pending",
        winner: currentMatch?.status === "completed" && currentMatch.winnerId ? { name: currentMatch.winnerId === currentMatch.competidorAka?.id ? currentMatch.competidorAka?.Nombre || "" : currentMatch.competidorShiro?.Nombre || "", side: currentMatch.winnerId === currentMatch.competidorAka?.id ? "aka" : "shiro" } : null,
      };
      postKumiteMessage(data);
    }, 300);
    return () => clearTimeout(timer);
  }, [state.bracket, state.currentMatchId, state.isTimerRunning, state.categoria, state.area, postKumiteMessage]);
}
