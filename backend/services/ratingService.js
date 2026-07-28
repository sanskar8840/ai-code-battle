const K_FACTOR = 32;

/**
 * Standard ELO expected-score formula: probability `ratingA` beats `ratingB`.
 */
const expectedScore = (ratingA, ratingB) => 1 / (1 + 10 ** ((ratingB - ratingA) / 400));

/**
 * `result` is from playerA's perspective: 1 = win, 0 = loss, 0.5 = draw.
 * Returns the new rating for player A only — call it once per player with
 * their own perspective's result.
 */
const calculateNewRating = (ratingA, ratingB, result) => {
  const expected = expectedScore(ratingA, ratingB);
  const delta = Math.round(K_FACTOR * (result - expected));
  return { newRating: Math.max(100, ratingA + delta), delta };
};

/**
 * Computes both players' new ratings for a finished battle in one call.
 * `outcome` is "player1" | "player2" | "draw" (who won).
 */
const computeBattleRatingChanges = (player1Rating, player2Rating, outcome) => {
  const [result1, result2] =
    outcome === "player1" ? [1, 0] : outcome === "player2" ? [0, 1] : [0.5, 0.5];

  const p1 = calculateNewRating(player1Rating, player2Rating, result1);
  const p2 = calculateNewRating(player2Rating, player1Rating, result2);

  return {
    player1: { before: player1Rating, after: p1.newRating, delta: p1.delta },
    player2: { before: player2Rating, after: p2.newRating, delta: p2.delta },
  };
};

module.exports = { calculateNewRating, computeBattleRatingChanges, expectedScore, K_FACTOR };
