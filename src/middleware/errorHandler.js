const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  console.error(err);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = { message, statusCode: 404 };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = { message, statusCode: 400 };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = { message, statusCode: 400 };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = { message, statusCode: 401 };
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = { message, statusCode: 401 };
  }

  // Handle file upload errors
  if (err.code === 'FILE_TOO_LARGE') {
    return res.status(413).json({
      success: false,
      error: err.message || 'File size exceeds maximum limit',
      code: 'FILE_TOO_LARGE',
    });
  }

  if (err.code === 'INVALID_FILE_TYPE') {
    return res.status(415).json({
      success: false,
      error: err.message || 'File type not allowed',
      code: 'INVALID_FILE_TYPE',
    });
  }

  if (err.code === 'TOO_MANY_FILES') {
    return res.status(400).json({
      success: false,
      error: err.message || 'Too many files',
      code: 'TOO_MANY_FILES',
    });
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error',
    code: error.code || 'INTERNAL_SERVER_ERROR',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

module.exports = {
  errorHandler,
  notFound
};


