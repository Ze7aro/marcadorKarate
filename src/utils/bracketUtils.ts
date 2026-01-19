import {
  CompetidorKumite,
  Match,
  BracketState,
  MatchStatus,
} from "@/types/events";

/**
 * Genera un bracket de eliminación simple
 * @param competidores Lista de competidores
 * @param matchDuration Duración del match en segundos
 * @returns BracketState con matches organizados
 */
export function generateBracket(
  competidores: CompetidorKumite[],
  matchDuration: number = 120
): BracketState {
  const totalCompetitors = competidores.length;

  if (totalCompetitors < 2) {
    throw new Error(
      "Se necesitan al menos 2 competidores para generar un bracket"
    );
  }

  // Calcular número de rondas (log2 del siguiente poder de 2)
  const nextPowerOf2 = Math.pow(2, Math.ceil(Math.log2(totalCompetitors)));
  const rounds = Math.log2(nextPowerOf2);

  // Shuffle competidores para distribución aleatoria
  const shuffled = [...competidores].sort(() => Math.random() - 0.5);

  // Asignar posiciones en el bracket
  const competidoresConPosicion = shuffled.map((c, index) => ({
    ...c,
    bracket: 1,
    round: 1,
    position: index,
  }));

  // Generar matches de la primera ronda
  const matches: Match[] = [];
  let matchId = 1;

  // Primera ronda
  const firstRoundMatches = Math.ceil(totalCompetitors / 2);
  for (let i = 0; i < firstRoundMatches; i++) {
    const aka = competidoresConPosicion[i * 2] || null;
    const ao = competidoresConPosicion[i * 2 + 1] || null;

    matches.push({
      id: matchId++,
      round: 1,
      position: i,
      competidorAka: aka,
      competidorShiro: ao,
      status: "pending" as MatchStatus,
      scoreAka: 0,
      scoreShiro: 0,
      penaltiesAka: [],
      penaltiesShiro: [],
      timeRemaining: matchDuration,
      duration: matchDuration,
    });
  }

  // Generar matches para rondas siguientes (placeholders)
  for (let round = 2; round <= rounds; round++) {
    const matchesInRound = Math.pow(2, rounds - round);
    for (let pos = 0; pos < matchesInRound; pos++) {
      matches.push({
        id: matchId++,
        round,
        position: pos,
        competidorAka: null,
        competidorShiro: null,
        status: "pending" as MatchStatus,
        scoreAka: 0,
        scoreShiro: 0,
        penaltiesAka: [],
        penaltiesShiro: [],
        timeRemaining: matchDuration,
        duration: matchDuration,
      });
    }
  }

  return {
    totalCompetitors,
    rounds,
    matches,
    currentMatchId: matches[0]?.id || null,
  };
}

/**
 * Avanza el ganador al siguiente match
 * @param bracket Estado actual del bracket
 * @param matchId ID del match completado
 * @param winnerId ID del competidor ganador
 * @returns BracketState actualizado
 */
export function advanceWinner(
  bracket: BracketState,
  matchId: number,
  winnerId: number
): BracketState {
  const currentMatch = bracket.matches.find((m) => m.id === matchId);
  if (!currentMatch) return bracket;

  const winner =
    currentMatch.competidorAka?.id === winnerId
      ? currentMatch.competidorAka
      : currentMatch.competidorShiro;

  if (!winner) return bracket;

  // Encontrar el siguiente match
  const nextRound = currentMatch.round + 1;
  const nextPosition = Math.floor(currentMatch.position / 2);

  const nextMatch = bracket.matches.find(
    (m) => m.round === nextRound && m.position === nextPosition
  );

  if (!nextMatch) {
    // Es la final, no hay siguiente match
    return bracket;
  }

  // Determinar si va a aka o ao (par = aka, impar = ao)
  const isAka = currentMatch.position % 2 === 0;

  const updatedMatches = bracket.matches.map((m) =>
    m.id === nextMatch.id
      ? {
          ...m,
          [isAka ? "competidorAka" : "competidorShiro"]: winner,
        }
      : m
  );

  return {
    ...bracket,
    matches: updatedMatches,
  };
}

/**
 * Obtiene el match actual en progreso
 */
export function getCurrentMatch(bracket: BracketState): Match | null {
  return bracket.matches.find((m) => m.id === bracket.currentMatchId) || null;
}

/**
 * Obtiene el ganador del torneo
 */
export function getTournamentWinner(
  bracket: BracketState
): CompetidorKumite | null {
  const finalMatch = bracket.matches.find(
    (m) => m.round === bracket.rounds && m.status === "completed"
  );

  if (!finalMatch || !finalMatch.winnerId) return null;

  return (
    (finalMatch.competidorAka?.id === finalMatch.winnerId
      ? finalMatch.competidorAka
      : finalMatch.competidorShiro) || null
  );
}

/**
 * Obtiene nombre de la ronda
 */
export function getRoundName(round: number, totalRounds: number): string {
  if (round === totalRounds) return "Final";
  if (round === totalRounds - 1) return "Semifinal";
  if (round === totalRounds - 2) return "Cuartos de Final";
  return `Ronda ${round}`;
}
