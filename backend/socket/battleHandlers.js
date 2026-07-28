const Problem = require("../models/Problem");
const Submission = require("../models/Submission");
const battleService = require("../services/battleService");
const judge0Service = require("../services/judge0Service");
const { aggregateResults } = require("../services/gradingService");
const { getLanguageById } = require("../config/languages");

/**
 * Kicks off the countdown -> battleStart -> timer chain once both players
 * have joined the Socket.IO room. Shared by the fresh-match flow and (later)
 * reconnect-triggered re-sync, so the lifecycle logic lives in one place.
 */
const beginBattleSequence = (io, roomId) => {
  const battle = battleService.getBattle(roomId);
  if (!battle || battle.battleStatus !== "ready") return;

  io.to(roomId).emit("battleReady", { roomId });

  battleService.startCountdown(roomId, io, () => {
    const current = battleService.getBattle(roomId);
    if (!current || current.finished) return;

    io.to(roomId).emit("battleStart", battleService.sanitizeForClient(current));

    battleService.startBattleTimer(roomId, io, async () => {
      // Time's up with nobody having solved it — grade on test cases passed.
      const result = await battleService.endBattle(roomId, "completed");
      if (result) {
        io.to(roomId).emit("battleEnd", { ...result, reason: "time_up" });
        battleService.scheduleCleanup(roomId);
      }
    });
  });
};

const buildTestCases = (problem) => [
  ...problem.examples.map((ex) => ({ input: ex.input, expectedOutput: ex.output })),
];
const buildFullTestCases = (problem) => [
  ...problem.examples.map((ex) => ({ input: ex.input, expectedOutput: ex.output })),
  ...(problem.hiddenTestCases || []).map((tc) => ({ input: tc.input, expectedOutput: tc.output })),
];

const registerBattleHandlers = (io, socket) => {
  const userId = socket.user._id.toString();

  // --- Join / rejoin the room ---
  socket.on("joinRoom", ({ roomId }) => {
    const battle = battleService.getBattle(roomId);
    if (!battle) {
      socket.emit("battleError", { message: "This battle no longer exists." });
      return;
    }
    if (!battle.players.some((p) => p.userId === userId)) {
      socket.emit("battleError", { message: "You're not a player in this battle." });
      return;
    }

    socket.join(roomId);
    socket.data.roomId = roomId;
    battleService.markReconnected(roomId, userId, socket.id);

    socket.to(roomId).emit("playerJoined", { userId });
    socket.emit("battleStateSync", battleService.sanitizeForClient(battle));

    const bothJoined = battleService.markJoined(roomId, userId);
    if (bothJoined && battle.battleStatus === "ready") {
      beginBattleSequence(io, roomId);
    }
  });

  // --- Reconnect after a dropped connection (new socket, same user) ---
  socket.on("reconnectToBattle", ({ roomId }) => {
    const battle = battleService.markReconnected(roomId, userId, socket.id);
    if (!battle) {
      socket.emit("battleError", { message: "Couldn't reconnect — this battle may have ended." });
      return;
    }
    socket.join(roomId);
    socket.data.roomId = roomId;
    socket.emit("battleStateSync", battleService.sanitizeForClient(battle));
    socket.to(roomId).emit("opponentReconnected", { userId });
  });

  // --- Spectator (read-only) join ---
  socket.on("spectatorJoin", ({ roomId }) => {
    const battle = battleService.getBattle(roomId);
    if (!battle) {
      socket.emit("battleError", { message: "This battle doesn't exist." });
      return;
    }
    socket.join(roomId);
    socket.emit("battleStateSync", battleService.sanitizeForClient(battle));
  });

  // --- Run code: visible examples only, doesn't affect win condition ---
  socket.on("codeRun", async ({ roomId, language, code }) => {
    const battle = battleService.getBattle(roomId);
    if (!battle || battle.finished) return;
    if (!getLanguageById(language) || !battle.problem.supportedLanguages.includes(language)) {
      socket.emit("battleError", { message: `Unsupported language: ${language}` });
      return;
    }

    try {
      const results = await judge0Service.runTestCases({
        language,
        sourceCode: code,
        testCases: buildTestCases(battle.problem),
        timeLimitMs: battle.problem.timeLimitMs,
        memoryLimitKb: battle.problem.memoryLimitKb,
      });
      const { overallStatus, passed, total } = aggregateResults(results);

      battleService.recordProgress(roomId, userId, { status: overallStatus, passed, total, isSubmit: false });

      socket.emit("submissionResult", {
        isRun: true,
        status: overallStatus,
        passed,
        total,
        results: results.map((r, i) => ({
          testCaseNumber: i + 1,
          input: r.input,
          expectedOutput: r.expectedOutput,
          actualOutput: r.stdout,
          status: r.status,
          stderr: r.stderr || undefined,
          compileOutput: r.compileOutput || undefined,
          runtimeMs: r.runtimeMs,
          memoryKb: r.memoryKb,
        })),
      });

      io.to(roomId).emit("playerProgress", battleService.sanitizeForClient(battle).players);
    } catch (err) {
      socket.emit("battleError", { message: err.message || "Run failed" });
    }
  });

  // --- Submit code: full grading, counts toward the win condition ---
  socket.on("codeSubmit", async ({ roomId, language, code }) => {
    const battle = battleService.getBattle(roomId);
    if (!battle || battle.finished) return;
    if (!getLanguageById(language) || !battle.problem.supportedLanguages.includes(language)) {
      socket.emit("battleError", { message: `Unsupported language: ${language}` });
      return;
    }

    try {
      const testCases = buildFullTestCases(battle.problem);
      const results = await judge0Service.runTestCases({
        language,
        sourceCode: code,
        testCases,
        timeLimitMs: battle.problem.timeLimitMs,
        memoryLimitKb: battle.problem.memoryLimitKb,
      });
      const { overallStatus, passed, total, maxRuntimeMs, maxMemoryKb } = aggregateResults(results);
      const visibleCount = battle.problem.examples.length;

      // Persist a real Submission so it shows up in the player's normal
      // submission history too, not just the battle record.
      const submissionDoc = await Submission.create({
        user: userId,
        problem: battle.problem._id,
        problemTitle: battle.problem.title,
        difficulty: battle.problem.difficulty,
        tags: battle.problem.tags,
        language,
        code,
        status: overallStatus,
        runtimeMs: maxRuntimeMs,
        memoryKb: maxMemoryKb,
        testCasesPassed: passed,
        testCasesTotal: total,
      });

      // Keep problem-level acceptance stats consistent with solo submissions.
      const problemDoc = await Problem.findById(battle.problem._id);
      if (problemDoc) {
        problemDoc.totalSubmissions += 1;
        if (overallStatus === "Accepted") problemDoc.totalAccepted += 1;
        problemDoc.recomputeAcceptanceRate();
        await problemDoc.save();
      }
      if (overallStatus === "Accepted") {
        const solved = socket.user.registerSolve(battle.problem._id);
        if (solved) await socket.user.save({ validateBeforeSave: false });
      }

      battleService.recordProgress(roomId, userId, { status: overallStatus, passed, total, isSubmit: true });

      const visibleResults = results.slice(0, visibleCount).map((r, i) => ({
        testCaseNumber: i + 1,
        input: r.input,
        expectedOutput: r.expectedOutput,
        actualOutput: r.stdout,
        status: r.status,
        stderr: r.stderr || undefined,
        compileOutput: r.compileOutput || undefined,
        runtimeMs: r.runtimeMs,
        memoryKb: r.memoryKb,
      }));
      const hiddenPassed = passed - visibleResults.filter((r) => r.status === "Accepted").length;

      socket.emit("submissionResult", {
        isRun: false,
        submissionId: submissionDoc._id,
        status: overallStatus,
        passed,
        total,
        runtimeMs: maxRuntimeMs,
        memoryKb: maxMemoryKb,
        visibleResults,
        hiddenSummary: { passed: hiddenPassed, total: total - visibleCount },
      });

      io.to(roomId).emit("playerProgress", battleService.sanitizeForClient(battle).players);

      // First to Accepted wins immediately.
      if (overallStatus === "Accepted") {
        const result = await battleService.endBattle(roomId, "completed");
        if (result) {
          io.to(roomId).emit("battleEnd", { ...result, reason: "solved" });
          battleService.scheduleCleanup(roomId);
        }
      }
    } catch (err) {
      socket.emit("battleError", { message: err.message || "Submission failed" });
    }
  });

  // --- Chat ---
  socket.on("chatMessage", ({ roomId, message }) => {
    if (!message || !message.trim()) return;
    const entry = battleService.addChatMessage(roomId, userId, message.trim());
    if (!entry) return;

    io.to(roomId).emit("chatMessage", {
      userId,
      username: socket.user.username,
      name: socket.user.name,
      message: entry.message,
      sentAt: entry.sentAt,
    });
  });

  socket.on("typing", ({ roomId, isTyping }) => {
    socket.to(roomId).emit("typing", { userId, isTyping: !!isTyping });
  });

  // --- Rematch ---
  socket.on("rematchRequest", ({ roomId }) => {
    socket.to(roomId).emit("rematchRequest", { fromUserId: userId });
  });

  socket.on("rematchAccepted", async ({ roomId }) => {
    const oldBattle = battleService.getBattle(roomId);
    if (!oldBattle) return;

    const opponentState = oldBattle.players.find((p) => p.userId !== userId);
    const selfState = oldBattle.players.find((p) => p.userId === userId);
    if (!opponentState || !selfState) return;

    try {
      const newBattle = await battleService.createBattle(
        { ...selfState, socketId: socket.id },
        { ...opponentState, socketId: opponentState.socketId }
      );

      io.to(roomId).emit("rematchAccepted", { roomId: newBattle.roomId });
    } catch (err) {
      io.to(roomId).emit("battleError", { message: err.message || "Couldn't start the rematch." });
    }
  });

  // --- Heartbeat (lightweight liveness ack, separate from Socket.IO's own ping/pong) ---
  socket.on("heartbeat", () => {
    socket.emit("heartbeatAck", { serverTime: Date.now() });
  });

  // --- Disconnect handling ---
  socket.on("disconnect", () => {
    const roomId = socket.data.roomId;
    if (!roomId) return;

    const battle = battleService.getBattle(roomId);
    if (!battle || battle.finished) return;

    socket.to(roomId).emit("opponentDisconnected", { userId, graceMs: battleService.DISCONNECT_GRACE_MS });

    battleService.markDisconnected(roomId, userId, async () => {
      const result = await battleService.endBattle(roomId, "completed");
      if (result) {
        io.to(roomId).emit("battleEnd", { ...result, reason: "forfeit" });
        battleService.scheduleCleanup(roomId);
      }
    });
  });
};

module.exports = { registerBattleHandlers, beginBattleSequence };
