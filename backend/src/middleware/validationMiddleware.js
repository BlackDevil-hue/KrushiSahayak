/**
 * validationMiddleware.js
 * express-validator result handler middleware.
 */

const { validationResult } = require('express-validator');

/**
 * Validates request data using express-validator errors.
 * Returns HTTP 400 with structured validation error messages if validation fails.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation error: invalid request input parameters.',
      errors: errors.array().map((err) => ({
        field: err.path || err.param,
        message: err.msg,
        value: err.value,
      })),
    });
  }
  next();
};

module.exports = {
  validate,
};
