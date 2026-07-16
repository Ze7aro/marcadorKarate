export interface KataScoreMetrics {
  total: number;
  minIncluded: number;
  maxIncluded: number;
  minTotal?: number;
  maxTotal?: number;
  originalScores: number[];
  validScores: number[];
}

/**
 * Calculates metrics for Kata scoring including tie-breaking criteria.
 * Rules:
 * 1. With 5 judges, exclude highest and lowest scores.
 * 2. With 3 judges, exclude the highest score.
 * 3. Total = Sum of the remaining scores.
 * 4. Tie-breaker 1: Lowest included score (Min Included).
 * 5. Tie-breaker 2: Highest included score (Max Included).
 */
export const calculateKataMetrics = (
  puntajes: (string | number)[],
  numJudges: number,
): KataScoreMetrics => {
  // Convert strings to numbers and filter invalid
  const validScores = puntajes
    .map((p) => (typeof p === "string" ? parseFloat(p) : p))
    .filter((p) => !isNaN(p) && p > 0);

  // If not enough scores, return zeros
  if (validScores.length < numJudges) {
    return {
      total: 0,
      minIncluded: 0,
      maxIncluded: 0,
      originalScores: validScores,
      validScores: [],
    };
  }

  // Sort scores primarily for calculation
  const sortedScores = [...validScores].sort((a, b) => a - b);

  let total = 0;
  let includedScores: number[] = [];
  let minTotal: number | undefined;
  let maxTotal: number | undefined;

  if (numJudges === 5) {
    // Remove lowest (index 0) and highest (index 4)
    // Keep indices 1, 2, 3
    includedScores = sortedScores.slice(1, 4);
    total = includedScores.reduce((a, b) => a + b, 0);
    minTotal = sortedScores[0];
    maxTotal = sortedScores[4];
  } else if (numJudges === 3) {
    includedScores = sortedScores.slice(0, 2);
    total = includedScores.reduce((a, b) => a + b, 0);
    minTotal = sortedScores[0];
    maxTotal = sortedScores[2];
  } else {
    includedScores = sortedScores;
    total = sortedScores.reduce((a, b) => a + b, 0);
    minTotal = sortedScores[0];
    maxTotal = sortedScores[sortedScores.length - 1];
  }

  // Metrics for tie-breaking from the INCLUDED scores
  const minIncluded = Math.min(...includedScores);
  const maxIncluded = Math.max(...includedScores);

  return {
    total,
    minIncluded,
    maxIncluded,
    minTotal,
    maxTotal,
    originalScores: sortedScores, // sorted all
    validScores: includedScores, // only the ones that counted
  };
};

/**
 * Comparator function for sorting competitors
 */
export const compareCompetitors = (
  metricsA: KataScoreMetrics,
  metricsB: KataScoreMetrics,
): number => {
  // 1. Total Score (Higher is better)
  if (Math.abs(metricsB.total - metricsA.total) > 0.001) {
    return metricsB.total - metricsA.total;
  }

  // 2. Tie-Breaker 1: Lowest of the included scores (Higher is better)
  if (Math.abs(metricsB.minIncluded - metricsA.minIncluded) > 0.001) {
    return metricsB.minIncluded - metricsA.minIncluded;
  }

  // 3. Tie-Breaker 2: Highest of the included scores (Higher is better)
  if (Math.abs(metricsB.maxIncluded - metricsA.maxIncluded) > 0.001) {
    return metricsB.maxIncluded - metricsA.maxIncluded;
  }

  // Still tied
  return 0;
};

export interface RoundStructure {
  totalRounds: number;
  nextRoundCutoff: number | null; // Null if it's the final round
  label: string;
  key: string;
  countsForFinal: boolean;
}

export type KataRoundFormatKey = "tokui_only" | "sentei_tokui" | "full_three_rounds";

export interface KataRoundDefinition {
  key: string;
  label: string;
  countsForFinal: boolean;
}

export interface KataRoundResult {
  competitorUid: string;
  nombre: string;
  edad: number;
  round1Score: number | null;
  round2Score: number | null;
  total: number;
  latestRoundScore: number;
  kiken?: boolean;
}

interface RoundSnapshotCompetitor {
  competitorUid?: string;
  Nombre: string;
  Edad: number;
  PuntajeFinal?: number | null;
  Kiken?: boolean;
}

interface RoundSnapshot {
  countsForFinal?: boolean;
  competidores: RoundSnapshotCompetitor[];
}

export const getRoundDefinitions = (
  roundFormat: KataRoundFormatKey,
): KataRoundDefinition[] => {
  switch (roundFormat) {
    case "full_three_rounds":
      return [
        {
          key: "shitei_sentei",
          label: "Shitei/Sentei",
          countsForFinal: false,
        },
        {
          key: "sentei_tokui",
          label: "Sentei/Tokui",
          countsForFinal: true,
        },
        {
          key: "tokui",
          label: "Tokui",
          countsForFinal: true,
        },
      ];
    case "sentei_tokui":
      return [
        {
          key: "sentei_tokui",
          label: "Sentei/Tokui",
          countsForFinal: true,
        },
        {
          key: "tokui",
          label: "Tokui",
          countsForFinal: true,
        },
      ];
    default:
      return [
        {
          key: "tokui",
          label: "Tokui",
          countsForFinal: true,
        },
      ];
  }
};

export const buildKataFinalResults = (
  previousRounds: RoundSnapshot[],
  currentCompetidores: RoundSnapshotCompetitor[],
  currentRoundCountsForFinal = true,
): KataRoundResult[] => {
  const allRounds = [
    ...previousRounds,
    { competidores: currentCompetidores, countsForFinal: currentRoundCountsForFinal },
  ];
  const scoredRounds = allRounds
    .filter((round) => round.countsForFinal !== false)
    .map((round) =>
      round.competidores.filter(
        (c) => c.PuntajeFinal !== null && c.PuntajeFinal !== undefined && !c.Kiken && c.competitorUid,
      ),
    )
    .filter((round) => round.length > 0);

  if (scoredRounds.length === 0) {
    return [];
  }

  if (scoredRounds.length === 1) {
    return scoredRounds[0]
      .map((competidor) => ({
        competitorUid: competidor.competitorUid!,
        nombre: competidor.Nombre,
        edad: competidor.Edad,
        round1Score: null,
        round2Score: competidor.PuntajeFinal ?? null,
        total: competidor.PuntajeFinal ?? 0,
        latestRoundScore: competidor.PuntajeFinal ?? 0,
        kiken: competidor.Kiken,
      }))
      .sort((a, b) => b.total - a.total);
  }

  const lastTwoRounds = scoredRounds.slice(-2);
  const previousRoundMap = new Map(
    lastTwoRounds[0].map((competidor) => [competidor.competitorUid!, competidor]),
  );

  return lastTwoRounds[1]
    .filter((competidor) => previousRoundMap.has(competidor.competitorUid!))
    .map((competidor) => {
      const previousRoundCompetitor = previousRoundMap.get(competidor.competitorUid!)!;
      const round1Score = previousRoundCompetitor.PuntajeFinal ?? 0;
      const round2Score = competidor.PuntajeFinal ?? 0;

      return {
        competitorUid: competidor.competitorUid!,
        nombre: competidor.Nombre,
        edad: competidor.Edad,
        round1Score,
        round2Score,
        total: round1Score + round2Score,
        latestRoundScore: round2Score,
        kiken: competidor.Kiken,
      };
    })
    .sort((a, b) => {
      if (Math.abs(b.total - a.total) > 0.001) {
        return b.total - a.total;
      }

      return b.latestRoundScore - a.latestRoundScore;
    });
};

/**
 * Determines the round structure based on total competitors (WKF Rules)
 */
export const getRoundStructure = (
  roundFormat: KataRoundFormatKey,
  currentRound: number, // 1-based
): RoundStructure => {
  const definitions = getRoundDefinitions(roundFormat);
  const roundDefinition =
    definitions[Math.min(Math.max(currentRound - 1, 0), definitions.length - 1)];
  const isLastRound = currentRound >= definitions.length;

  return {
    totalRounds: definitions.length,
    nextRoundCutoff: isLastRound ? null : 0,
    label: roundDefinition.label,
    key: roundDefinition.key,
    countsForFinal: roundDefinition.countsForFinal,
  };
};
