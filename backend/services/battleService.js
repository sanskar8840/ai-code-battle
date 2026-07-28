const crypto = require("crypto");
const Problem = require("../models/Problem");
const Battle = require("../models/Battle");
const User = require("../models/User");
const { computeBattleRatingChanges } = require("./ratingService");

const BATTLE_DURATION_SECONDS = 20 * 60; // 20 minutes per duel
const COUNTDOWN_SECONDS = 5;
const DISCONNECT_GRACE_MS = 30 * 1000;
const RECENT_PROBLEM_CACHE_SIZE = 50;

/** roomId -> battle state (in-memory, single-process — see matchmakingService.js note) */
const activeBattles = new Map();
/** Small rolling window of recently-used problem IDs, to reduce immediate repeats. */
const recentProblemIds = [];

const generateRoomId = () => crypto.randomBytes(6).toString("hex");

const difficultyForRating = (avgRating) => {
  if (avgRating < 1250) return "Easy";
  if (avgRating < 1700) return "Medium";
  return "Hard";
};

/**
 * Picks a published problem matching the pair's skill level, avoiding
 * whatever's been used most recently across the whole server.
 */
const pickProblem = async (avgRating) => {
  const difficulty = difficultyForRating(avgRating);
  const exclude = recentProblemIds.slice(-RECENT_PROBLEM_CACHE_SIZE);

  const query = { isPublished: true, difficulty, _id: { $nin: exclude } };
  let count = await Problem.countDocuments(query);

  // Fall back to "any difficulty" / "allow repeats" if the pool is too small —
  // a real deployment will have plenty of problems, but a fresh dev DB might not.
  if (count === 0) {
    delete query.difficulty;
    count = await Problem.countDocuments(query);
  }
  if (count === 0) {
    delete query._id;
    count = await Problem.countDocuments(query);
  }
  if (count === 0) return null;

  const skip = Math.floor(Math.random() * count);
  const problem = await Problem.findOne(query).select("+hiddenTestCases").skip(skip);

  if (problem) {
    recentProblemIds.push(problem._id.toString());
    if (recentProblemIds.length > RECENT_PROBLEM_CACHE_SIZE) recentProblemIds.shift();
  }
  return problem;
};

const makePlayerState = (player) => ({
  userId: player.userId.toString(),
  username: player.username,
  name: player.name,
  avatar: player.avatar || null,
  rating: player.rating,
  socketId: player.socketId,
  connected: true,
  disconnectTimer: null,
  status: null, // latest submission status, e.g. "Wrong Answer" | "Accepted"
  testCasesPassed: 0,
  testCasesTotal: 0,
  submissionCount: 0,
  runCount: 0,
  solvedAt: null,
  forfeited: false,
});

/**
 * Creates the room, persists an initial Battle document (so history exists
 * even if the process dies mid-battle), and returns the sanitized state ready
 * to send to both clients. Does NOT start the countdown — the caller does
 * that once both sockets have actually joined the room.
 */
const createBattle = async (player1, player2) => {
  const avgRating = (player1.rating + player2.rating) / 2;
  const problem = await pickProblem(avgRating);

  if (!problem) {
    throw new Error("No published problems are available to start a battle right now.");
  }

  const roomId = generateRoomId();

  const battleDoc = await Battle.create({
    roomId,
    players: [
      { user: player1.userId, ratingBefore: player1.rating, ratingAfter: player1.rating, result: "draw" },
      { user: player2.userId, ratingBefore: player2.rating, ratingAfter: player2.rating, result: "draw" },
    ],
    problem: problem._id,
    problemTitle: problem.title,
    difficulty: problem.difficulty,
    battleStatus: "ready",
    status: "aborted", // placeholder until the battle actually finishes
  });

  const state = {
    roomId,
    battleDocId: battleDoc._id,
    problem, // full doc incl. hiddenTestCases — NEVER sent to clients directly
    players: [makePlayerState(player1), makePlayerState(player2)],
    battleStatus: "ready",
    startTime: null,
    endTime: null,
    timerInterval: null,
    countdownInterval: null,
    remainingSeconds: BATTLE_DURATION_SECONDS,
    chatHistory: [],
    finished: false,
    joinedUserIds: new Set(),
  };

  activeBattles.set(roomId, state);
  return state;
};

/**
 * Marks a player as having actually joined the Socket.IO room (as opposed to
 * just having received the matchFound event). Returns true the moment BOTH
 * players have joined, which is the signal to start the countdown.
 */
const markJoined = (roomId, userId) => {
  const battle = activeBattles.get(roomId);
  if (!battle) return false;
  battle.joinedUserIds.add(userId.toString());
  return battle.joinedUserIds.size >= battle.players.length;
};

const getBattle = (roomId) => activeBattles.get(roomId);

const getBattleByUser = (userId) => {
  for (const battle of activeBattles.values()) {
    if (battle.players.some((p) => p.userId === userId.toString()) && !battle.finished) {
      return battle;
    }
  }
  return null;
};

/**
 * The version of battle state that's safe to send to clients: strips hidden
 * test cases and the opponent's source code (we never even store live code
 * server-side — clients only ever push run/submit results, not raw keystrokes).
 */
const sanitizeForClient = (battle) => ({
  roomId: battle.roomId,
  battleStatus: battle.battleStatus,
  startTime: battle.startTime,
  remainingSeconds: battle.remainingSeconds,
  problem: {
    _id: battle.problem._id,
    title: battle.problem.title,
    slug: battle.problem.slug,
    description: battle.problem.description,
    difficulty: battle.problem.difficulty,
    tags: battle.problem.tags,
    constraints: battle.problem.constraints,
    inputFormat: battle.problem.inputFormat,
    outputFormat: battle.problem.outputFormat,
    examples: battle.problem.examples,
    starterCode: battle.problem.starterCode,
    supportedLanguages: battle.problem.supportedLanguages,
    timeLimitMs: battle.problem.timeLimitMs,
    memoryLimitKb: battle.problem.memoryLimitKb,
  },
  players: battle.players.map((p) => ({
    userId: p.userId,
    username: p.username,
    name: p.name,
    avatar: p.avatar,
    rating: p.rating,
    connected: p.connected,
    status: p.status,
    testCasesPassed: p.testCasesPassed,
    testCasesTotal: p.testCasesTotal,
    submissionCount: p.submissionCount,
    runCount: p.runCount,
    solved: !!p.solvedAt,
  })),
});

const startCountdown = (roomId, io, onComplete) => {
  const battle = activeBattles.get(roomId);
  if (!battle) return;

  battle.battleStatus = "countdown";
  let remaining = COUNTDOWN_SECONDS;

  battle.countdownInterval = setInterval(() => {
    io.to(roomId).emit("countdownTick", { remaining });
    remaining -= 1;

    if (remaining < 0) {
      clearInterval(battle.countdownInterval);
      battle.countdownInterval = null;
      onComplete();
    }
  }, 1000);
};

const startBattleTimer = (roomId, io, onTimeUp) => {
  const battle = activeBattles.get(roomId);
  if (!battle) return;

  battle.battleStatus = "in_progress";
  battle.startTime = new Date();
  battle.remainingSeconds = BATTLE_DURATION_SECONDS;

  battle.timerInterval = setInterval(() => {
    battle.remainingSeconds -= 1;
    io.to(roomId).emit("timerSync", { remainingSeconds: battle.remainingSeconds });

    if (battle.remainingSeconds <= 0) {
      clearInterval(battle.timerInterval);
      battle.timerInterval = null;
      onTimeUp();
    }
  }, 1000);
};

const stopTimers = (battle) => {
  if (battle.timerInterval) clearInterval(battle.timerInterval);
  if (battle.countdownInterval) clearInterval(battle.countdownInterval);
  battle.players.forEach((p) => {
    if (p.disconnectTimer) clearTimeout(p.disconnectTimer);
  });
};

/**
 * Records the result of a Run or Submit action against a player's progress.
 * `isSubmit` distinguishes a graded submission (counts toward win condition)
 * from a scratch Run (visibility only, doesn't count as an "attempt").
 */
const recordProgress = (roomId, userId, { status, passed, total, isSubmit }) => {
  const battle = activeBattles.get(roomId);
  if (!battle) return null;

  const player = battle.players.find((p) => p.userId === userId.toString());
  if (!player) return null;

  player.status = status;
  player.testCasesPassed = passed;
  player.testCasesTotal = total;

  if (isSubmit) {
    player.submissionCount += 1;
    if (status === "Accepted" && !player.solvedAt) {
      player.solvedAt = new Date();
    }
  } else {
    player.runCount += 1;
  }

  return player;
};

/**
 * Win condition: first player to get Accepted wins immediately. If time runs
 * out with nobody solving it, whoever passed more test cases wins; a true tie
 * (including 0-0) is a draw.
 */
const determineOutcome = (battle) => {
  const [p1, p2] = battle.players;

  if (p1.solvedAt && p2.solvedAt) {
    return p1.solvedAt < p2.solvedAt ? "player1" : "player2";
  }
  if (p1.solvedAt) return "player1";
  if (p2.solvedAt) return "player2";

  if (p1.forfeited && !p2.forfeited) return "player2";
  if (p2.forfeited && !p1.forfeited) return "player1";

  if (p1.testCasesPassed !== p2.testCasesPassed) {
    return p1.testCasesPassed > p2.testCasesPassed ? "player1" : "player2";
  }
  return "draw";
};

/**
 * Finalizes the battle: stops timers, computes ratings, persists everything
 * to MongoDB (Battle doc + both User docs), and returns the result payload
 * to broadcast to clients. Idempotent — calling twice on an already-finished
 * battle is a no-op.
 */
const endBattle = async (roomId, reason = "completed") => {
  const battle = activeBattles.get(roomId);
  if (!battle || battle.finished) return null;

  battle.finished = true;
  battle.battleStatus = "finished";
  battle.endTime = new Date();
  stopTimers(battle);

  const [p1, p2] = battle.players;
  const outcome = determineOutcome(battle);
  const ratingChanges = computeBattleRatingChanges(p1.rating, p2.rating, outcome);

  const durationSeconds = battle.startTime
    ? Math.round((battle.endTime - battle.startTime) / 1000)
    : 0;

  const resultFor = (playerKey) => (outcome === playerKey ? "win" : outcome === "draw" ? "draw" : "loss");

  const [user1, user2] = await Promise.all([User.findById(p1.userId), User.findById(p2.userId)]);

  const applyResult = (user, result, ratingChange) => {
    user.rating = ratingChange.after;
    if (result === "win") user.battlesWon += 1;
    else if (result === "loss") user.battlesLost += 1;
    else user.battlesDrawn += 1;
    return user.save({ validateBeforeSave: false });
  };

  const p1Result = resultFor("player1");
  const p2Result = resultFor("player2");

  await Promise.all([
    user1 && applyResult(user1, p1Result, ratingChanges.player1),
    user2 && applyResult(user2, p2Result, ratingChanges.player2),
  ]);

  const winnerId = outcome === "player1" ? p1.userId : outcome === "player2" ? p2.userId : null;
  const loserId = outcome === "player1" ? p2.userId : outcome === "player2" ? p1.userId : null;

  await Battle.findByIdAndUpdate(battle.battleDocId, {
    battleStatus: reason === "aborted" ? "aborted" : "finished",
    status: outcome === "draw" ? "draw" : reason === "aborted" ? "aborted" : "completed",
    startTime: battle.startTime,
    endTime: battle.endTime,
    durationSeconds,
    winner: winnerId,
    loser: loserId,
    players: [
      {
        user: p1.userId,
        ratingBefore: ratingChanges.player1.before,
        ratingAfter: ratingChanges.player1.after,
        result: p1Result,
        finalStatus: p1.status,
        testCasesPassed: p1.testCasesPassed,
        testCasesTotal: p1.testCasesTotal,
        submissionCount: p1.submissionCount,
        solvedAt: p1.solvedAt,
        disconnected: !p1.connected,
        forfeited: p1.forfeited,
      },
      {
        user: p2.userId,
        ratingBefore: ratingChanges.player2.before,
        ratingAfter: ratingChanges.player2.after,
        result: p2Result,
        finalStatus: p2.status,
        testCasesPassed: p2.testCasesPassed,
        testCasesTotal: p2.testCasesTotal,
        submissionCount: p2.submissionCount,
        solvedAt: p2.solvedAt,
        disconnected: !p2.connected,
        forfeited: p2.forfeited,
      },
    ],
    ratingChanges: [
      { user: p1.userId, before: ratingChanges.player1.before, after: ratingChanges.player1.after, delta: ratingChanges.player1.delta },
      { user: p2.userId, before: ratingChanges.player2.before, after: ratingChanges.player2.after, delta: ratingChanges.player2.delta },
    ],
    chatHistory: battle.chatHistory,
  });

  return {
    roomId,
    outcome,
    winnerId,
    loserId,
    durationSeconds,
    players: battle.players.map((p, i) => ({
      userId: p.userId,
      username: p.username,
      name: p.name,
      result: i === 0 ? p1Result : p2Result,
      status: p.status,
      testCasesPassed: p.testCasesPassed,
      testCasesTotal: p.testCasesTotal,
      submissionCount: p.submissionCount,
      solved: !!p.solvedAt,
      ratingBefore: i === 0 ? ratingChanges.player1.before : ratingChanges.player2.before,
      ratingAfter: i === 0 ? ratingChanges.player1.after : ratingChanges.player2.after,
      ratingDelta: i === 0 ? ratingChanges.player1.delta : ratingChanges.player2.delta,
    })),
  };
};

/**
 * Removes a finished battle from memory after a grace period, giving both
 * clients time to fetch the result screen before the room disappears.
 */
const scheduleCleanup = (roomId, delayMs = 5 * 60 * 1000) => {
  setTimeout(() => activeBattles.delete(roomId), delayMs);
};

const markDisconnected = (roomId, userId, onForfeit) => {
  const battle = activeBattles.get(roomId);
  if (!battle) return;

  const player = battle.players.find((p) => p.userId === userId.toString());
  if (!player) return;

  player.connected = false;
  player.disconnectTimer = setTimeout(() => {
    if (!player.connected && !battle.finished) {
      player.forfeited = true;
      onForfeit();
    }
  }, DISCONNECT_GRACE_MS);
};

const markReconnected = (roomId, userId, newSocketId) => {
  const battle = activeBattles.get(roomId);
  if (!battle) return null;

  const player = battle.players.find((p) => p.userId === userId.toString());
  if (!player) return null;

  player.connected = true;
  player.socketId = newSocketId;
  if (player.disconnectTimer) {
    clearTimeout(player.disconnectTimer);
    player.disconnectTimer = null;
  }
  return battle;
};

const addChatMessage = (roomId, userId, message) => {
  const battle = activeBattles.get(roomId);
  if (!battle) return null;

  const entry = { user: userId, message: message.slice(0, 500), sentAt: new Date() };
  battle.chatHistory.push(entry);
  return entry;
};

module.exports = {
  BATTLE_DURATION_SECONDS,
  DISCONNECT_GRACE_MS,
  createBattle,
  getBattle,
  getBattleByUser,
  markJoined,
  sanitizeForClient,
  startCountdown,
  startBattleTimer,
  stopTimers,
  recordProgress,
  determineOutcome,
  endBattle,
  scheduleCleanup,
  markDisconnected,
  markReconnected,
  addChatMessage,
  activeBattles,
};
