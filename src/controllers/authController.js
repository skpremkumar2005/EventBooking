
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config');

// Helper to generate JWT
const generateToken = (userId, email) => {
  return jwt.sign({ userId, email }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
exports.signup = async (req, res, next) => {
  const { name, email, password } = req.body;

  try {
    if (!name || !email || !password) {
      res.status(400); // Set status code before throwing error
      throw new Error('Please provide name, email, and password');
    }
    if (password.length < 6) {
        res.status(400);
        throw new Error('Password must be at least 6 characters long');
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400);
      throw new Error('Email already exists');
    }

    const user = await User.create({ name, email, password });

    if (user) {
      const token = generateToken(user._id, user.email);
      res.status(201).json({
        token,
        user: {
          id: user._id, // Mongoose toJSON transform will handle this
          name: user.name,
          email: user.email,
        },
      });
    } else {
      res.status(400);
      throw new Error('Invalid user data');
    }
  } catch (error) {
    next(error); // Pass error to global error handler
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      res.status(400);
      throw new Error('Please provide email and password');
    }

    const user = await User.findOne({ email }).select('+password'); // Explicitly select password for comparison

    if (user && (await user.comparePassword(password))) {
      const token = generateToken(user._id, user.email);
      res.status(200).json({
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
      });
    } else {
      res.status(401);
      throw new Error('Invalid credentials');
    }
  } catch (error) {
    next(error);
  }
};
