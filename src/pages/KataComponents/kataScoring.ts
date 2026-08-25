export type KataScoreSummary = {
  min: number;
  max: number;
  total: number;
};

export function calculateKataScoreSummary(
  scores: (string | null | undefined)[],
  numJudges: number,
  fallback = 0,
): KataScoreSummary {
  const validScores = scores
    .map((score) => parseFloat(score || "0"))
    .filter((score) => !Number.isNaN(score) && score > 0);

  if (validScores.length !== numJudges) {
    return { min: 0, max: 0, total: fallback };
  }

  const sorted = [...validScores].sort((a, b) => a - b);
  if (numJudges === 5) {
    return {
      min: sorted[0],
      max: sorted[4],
      total: sorted.slice(1, 4).reduce((sum, score) => sum + score, 0),
    };
  }

  if (numJudges === 3) {
    return {
      min: 0,
      max: sorted[2],
      total: sorted.slice(0, 2).reduce((sum, score) => sum + score, 0),
    };
  }

  return { min: 0, max: 0, total: sorted.reduce((sum, score) => sum + score, 0) };
}

export function calculateKataJudgeTotal(scores: string[], numJudges: number): number {
  return calculateKataScoreSummary(scores, numJudges).total;
}
