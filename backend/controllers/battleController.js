const asyncHandler = require("express-async-handler");
const Battle = require("../models/Battle");
const ApiError = require("../utils/ApiError");
const sendResponse = require("../utils/ApiResponse");
const battleService = require("../services/battleService");

// @desc    List the logged-in user's battle history
// @route   GET /api/battles?page=&limit=&result=
// @access  Private
const getMyBattles = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Number(req.query.limit) || 20, 100);

  const filter = { "players.user": req.user._id, battleStatus: { $in: ["finished", "aborted"] } };

  const [battles, total] = await Promise.all([
    Battle.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("players.user", "name username avatar rating")
      .populate("winner", "name username"),
    Battle.countDocuments(filter),
  ]);

  sendResponse(res, 200, "Battle history fetched", {
    battles,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

// @desc    Get a single battle by its roomId or Mongo _id — checks the live
//          in-memory state first (for battles still in progress), then falls
//          back to the persisted document for finished battles.
// @route   GET /api/battles/:roomId
// @access  Private (must be a participant, or admin)
const getBattleByRoom = asyncHandler(async (req, res) => {
  const { roomId } = req.params;

  const liveBattle = battleService.getBattle(roomId);
  if (liveBattle) {
    const isParticipant = liveBattle.players.some((p) => p.userId === req.user._id.toString());
    if (!isParticipant && req.user.role !== "admin") {
      throw new ApiError("You're not a participant in this battle", 403);
    }
    return sendResponse(res, 200, "Live battle state fetched", {
      live: true,
      battle: battleService.sanitizeForClient(liveBattle),
    });
  }

  const isObjectId = /^[a-f\d]{24}$/i.test(roomId);
  const query = isObjectId ? { _id: roomId } : { roomId };

  const battle = await Battle.findOne(query)
    .populate("players.user", "name username avatar rating")
    .populate("winner", "name username")
    .populate("loser", "name username")
    .populate("problem", "title slug difficulty");

  if (!battle) {
    throw new ApiError("Battle not found", 404);
  }

  const isParticipant = battle.players.some((p) => p.user._id.toString() === req.user._id.toString());
  if (!isParticipant && req.user.role !== "admin") {
    throw new ApiError("You're not a participant in this battle", 403);
  }

  sendResponse(res, 200, "Battle fetched", { live: false, battle });
});

module.exports = { getMyBattles, getBattleByRoom };
