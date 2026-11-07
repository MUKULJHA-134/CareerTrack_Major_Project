const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error for development debugging
  if (process.env.NODE_ENV !== 'production') {
    console.error('Error Trace:', err);
  }

  // Multer File Size or Upload Error
  if (err.code === 'LIMIT_FILE_SIZE') {
    const limitMb = Math.round((parseInt(process.env.MAX_FILE_SIZE, 10) || 5242880) / (1024 * 1024));
    return res.status(400).json({
      success: false,
      message: `File size exceeds maximum allowed limit (${limitMb} MB). Please upload a smaller file.`
    });
  }

  if (err.message && err.message.includes('Invalid file type')) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }

  // Mongoose Bad ObjectId (CastError)
  if (err.name === 'CastError') {
    return res.status(404).json({
      success: false,
      message: `Resource not found with ID: ${err.value}`
    });
  }

  // Mongoose Duplicate Key (Code 11000)
  if (err.code === 11000) {
    if (err.keyPattern && err.keyPattern.job && err.keyPattern.email) {
      return res.status(409).json({
        success: false,
        message: 'Duplicate Application Detected: You have already submitted an application for this position using this email address.'
      });
    }
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return res.status(409).json({
      success: false,
      message: `Duplicate entry detected for ${field}: '${err.keyValue ? err.keyValue[field] : ''}'. Please provide a unique value.`
    });
  }

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val) => val.message);
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: messages
    });
  }

  // JWT Errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid authorization token.'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Authorization token has expired. Please log in again.'
    });
  }

  // Default internal server error
  return res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'An unexpected server error occurred.'
  });
};

module.exports = errorHandler;
