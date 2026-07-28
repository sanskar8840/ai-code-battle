// Mirrors backend/services/battleService.js's BATTLE_DURATION_SECONDS.
// Kept as a constant here (not fetched from the server) since it only
// affects the timer's progress-bar-style coloring, not the actual countdown
// value — the server always sends the authoritative remainingSeconds.
export const BATTLE_DURATION_SECONDS = 20 * 60;
