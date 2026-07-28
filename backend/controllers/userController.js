const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const sendResponse = require("../utils/ApiResponse");
const { uploadBufferToCloudinary, deleteFromCloudinary } = require("../utils/cloudinaryUpload");

// @desc    Get a public user profile by username
// @route   GET /api/users/:username
// @access  Public




const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findOne({
    username: req.params.username.toLowerCase(),
  }).populate("problemsSolved", "title difficulty");

  if (!user) {
    throw new ApiError("User not found", 404);
  }

  // Calculate Global Rank
  const rank =
    (await User.countDocuments({
      rating: { $gt: user.rating },
    })) + 1;

  const profile = {
    ...user.toSafeObject(),
    rank,
  };

  sendResponse(res, 200, "Profile fetched", {
    user: profile,
  });
});





// @desc    Update the logged-in user's own profile
// @route   PUT /api/users/me
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  const allowedFields = ["name", "bio", "country", "college", "github", "linkedin", "skills"];
  const updates = {};

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  });

  sendResponse(res, 200, "Profile updated", { user: user.toSafeObject() });
});

// @desc    List / search users (for admin, leaderboard search, etc.)
// @route   GET /api/users?search=&page=&limit=
// @access  Public
const listUsers = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Number(req.query.limit) || 20, 100);
  const search = req.query.search;

  const filter = search ? { $text: { $search: search } } : {};

  const [users, total] = await Promise.all([
    User.find(filter)
      .select("name username avatar rating country badges")
      .sort({ rating: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    User.countDocuments(filter),
  ]);

  sendResponse(res, 200, "Users fetched", {
    users,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

// @desc    Upload / replace the logged-in user's avatar
// @route   POST /api/users/me/avatar
// @access  Private
// Requires CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET in .env
const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError("No image file uploaded. Attach it under the 'avatar' field.", 400);
  }

  const user = await User.findById(req.user._id);

  // Remove the old avatar from Cloudinary first so we don't accumulate orphaned images.
  if (user.avatar?.publicId) {
    try {
      await deleteFromCloudinary(user.avatar.publicId);
    } catch (err) {
      // Non-fatal: proceed with the new upload even if cleanup of the old one fails.
      console.warn(`Failed to delete previous avatar (${user.avatar.publicId}): ${err.message}`);
    }
  }

  let result;
  try {
    result = await uploadBufferToCloudinary(req.file.buffer, {
      public_id: `user_${user._id}`,
    });
  } catch (err) {
    throw new ApiError(
      "Avatar upload failed. Check that your Cloudinary credentials are set in .env.",
      502
    );
  }

  user.avatar = { url: result.secure_url, publicId: result.public_id };
  await user.save({ validateBeforeSave: false });

  sendResponse(res, 200, "Avatar updated", { avatar: user.avatar });
});




// @desc    Get Leaderboard
// @route   GET /api/users/leaderboard
// @access  Public
const getLeaderboard = asyncHandler(async (req, res) => {
  const users = await User.find()
    .select(
      "name username avatar rating problemsSolved battlesWon battlesLost battlesDrawn currentStreak longestStreak badges"
    )
    .sort({ rating: -1 });

  const leaderboard = users.map((user, index) => {
    const totalBattles =
      user.battlesWon + user.battlesLost + user.battlesDrawn;

    const winRate =
      totalBattles === 0
        ? 0
        : Math.round((user.battlesWon / totalBattles) * 100);

    return {
      rank: index + 1,
      _id: user._id,
      name: user.name,
      username: user.username,
      avatar: user.avatar,
      rating: user.rating,
      problemsSolved: user.problemsSolved.length,
      battlesWon: user.battlesWon,
      battlesLost: user.battlesLost,
      battlesDrawn: user.battlesDrawn,
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      badges: user.badges,
      winRate,
    };
  });

  sendResponse(res, 200, "Leaderboard fetched successfully", {
    leaderboard,
  });
});










module.exports = {
  getUserProfile,
  updateProfile,
  listUsers,
  uploadAvatar,
  getLeaderboard,
};