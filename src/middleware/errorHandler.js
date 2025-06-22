
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err); // Log the error for debugging

  let statusCode = res.statusCode === 200 ? 500 : res.statusCode; // Default to 500 if status code is not already set
  let message = err.message || 'An unexpected error occurred';

  // Mongoose Bad ObjectId
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 400; // Bad Request
    message = 'Invalid ID format';
  }

  // Mongoose Duplicate Key Error
  if (err.code === 11000) {
    statusCode = 400; // Bad Request
    const field = Object.keys(err.keyValue)[0];
    message = `Duplicate field value entered for ${field}. Please use another value.`;
  }

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    statusCode = 400; // Bad Request
    // Collect all validation messages
    const errors = Object.values(err.errors).map(el => el.message);
    message = `Validation Error: ${errors.join('. ')}`;
  }
  
  res.status(statusCode).json({
    message: message,
    // stack: process.env.NODE_ENV === 'production' ? null : err.stack, // Optionally include stack in development
  });
};

module.exports = errorHandler;
