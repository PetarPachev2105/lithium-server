const httpStatus = require('http-status');

class LithiumError extends Error {
  constructor(errorType, message) {
    // Calling parent constructor of base Error class.
    super(message);

    // Saving class name in the property of our custom error as a shortcut.
    this.name = 'LithiumError';

    // Set the default HTTP status code to 500
    this.statusCode = errorType || 500;

    // Capturing stack trace, excluding constructor call from it.
    Error.captureStackTrace(this, this.constructor);

    this.status = errorType || 'Lithium Error';
  }
}

const LithiumErrorTypes = {
  MISSING_INPUTS: httpStatus.BAD_REQUEST,
  BAD_INPUTS: httpStatus.BAD_REQUEST,
  GENERAL: httpStatus.INTERNAL_SERVER_ERROR,
  DATA_NOT_FOUND: httpStatus.NOT_FOUND,
  UNAUTHORIZED: httpStatus.UNAUTHORIZED,
};

module.exports = {
  LithiumError,
  LithiumErrorTypes,
};