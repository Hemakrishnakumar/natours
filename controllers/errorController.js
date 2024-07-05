const AppError = require('../utils/appError');

const devError = (err, res) => {
  res.status(err.statusCode).json({
    message: err.message,
    error: err,
    stack: err.stack,
  });
};

const prodError = (err, res) => {
  // Operational, trusted errors, send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    //console.log('ERROR', err);
    res.status(500).json({
      status: 'error',
      message: 'something went wrong',
    });
  }
};

const handleJWTError = (err) =>
  new AppError(
    `${err.name === 'JsonWebTokenError' ? 'Invalid token' : 'your token has expired'}, please login again`,
    401,
  );

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  if (process.env.NODE_ENV === 'development') {
    devError(err, res);
  } else {
    let error = { ...err };
    if (
      error.name === 'JsonWebTokenError' ||
      error.name === 'TokenExpiredError'
    )
      error = handleJWTError(err);
    prodError(error, res);
  }
};
