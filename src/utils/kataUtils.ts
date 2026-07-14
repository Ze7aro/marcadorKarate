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
}

/**
 * Determines the round structure based on total competitors (WKF Rules)
 */
export const getRoundStructure = (
  totalCompetitors: number,
  currentRound: number, // 1-based
): RoundStructure => {
  // Case 1: Less than 8 competitors -> 1 Round (Final)
  if (totalCompetitors < 8) {
    return {
      totalRounds: 1,
      nextRoundCutoff: null,
      label: "Final",
    };
  }

  // Case 2: 8 to 18 competitors -> 2 Rounds
  if (totalCompetitors <= 18) {
    if (currentRound === 1) {
      return {
        totalRounds: 2,
        nextRoundCutoff: 6, // Top 6 to Final
        label: "Eliminatoria",
      };
    }
    return {
      totalRounds: 2,
      nextRoundCutoff: null,
      label: "Final",
    };
  }

  // Case 3: More than 18 competitors -> 3 Rounds
  // Round 1 -> Round 2 -> Round 3 (Final)
  if (currentRound === 1) {
    const cutoff = totalCompetitors <= 30 ? 12 : 18;
    return {
      totalRounds: 3,
      nextRoundCutoff: cutoff,
      label: "Ronda 1",
    };
  }

  if (currentRound === 2) {
    return {
      totalRounds: 3,
      nextRoundCutoff: 6, // Top 6 to Final
      label: "Ronda 2",
    };
  }

  return {
    totalRounds: 3,
    nextRoundCutoff: null,
    label: "Final",
  };
};
