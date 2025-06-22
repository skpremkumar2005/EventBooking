
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');
const User = require('../models/User'); // Optional: if you need to fetch user details

const authMiddleware = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);

      // Attach user id and email to request object (or full user object if needed)
      // For simplicity, just attaching id and email.
      // If full user object is needed frequently, uncomment User.findById.
      // req.user = await User.findById(decoded.userId).select('-password'); 
      req.user = { id: decoded.userId, email: decoded.email };

      if (!req.user) {
         return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      next();
    } catch (error) {
      console.error('Token verification error:', error.message);
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Not authorized, token expired' });
      }
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

module.exports = authMiddleware;
