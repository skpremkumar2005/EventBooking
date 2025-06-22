require('dotenv').config();

module.exports = {
  PORT: process.env.PORT,
  MONGODB_URI: process.env.MONGODB_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
  FRONTEND_URL: process.env.FRONTEND_URL,

  // Email Configuration
  EMAIL_HOST: process.env.EMAIL_HOST,
  EMAIL_PORT: process.env.EMAIL_PORT,
  EMAIL_SECURE: process.env.EMAIL_SECURE === 'true', // Convert string to boolean
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASS: process.env.EMAIL_PASS,
  EMAIL_FROM: process.env.EMAIL_FROM,
};