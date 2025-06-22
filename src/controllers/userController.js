
const User = require('../models/User');

// @desc    Get current authenticated user details
// @route   GET /api/users/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    // req.user is populated by authMiddleware
    // It contains { id: userId, email: userEmail }
    // We fetch the user from DB to get the latest details and ensure it exists
    const user = await User.findById(req.user.id);

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    res.status(200).json({
      id: user._id, // Mongoose toJSON transform handles id
      name: user.name,
      email: user.email,
    });
  } catch (error) {
    next(error);
  }
};
