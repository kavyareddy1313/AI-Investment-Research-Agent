/**
 * middleware/errorHandler.js
 * Global Express error handling middleware.
 * Must be registered LAST in app.js (after all routes).
 */

import { logger } from '../utils/logger.js';

export const errorHandler = (err, req, res, _next) => {
  logger.error(`Unhandled error on ${req.method} ${req.path}: ${err.message}`);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: Object.values(err.errors).map(e => e.message),
    });
  }

  // Mongoose CastError (bad ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({ success: false, error: 'Invalid ID format.' });
  }

  // Default 500
  res.status(err.statusCode || 500).json({
    success: false,
    error: err.message || 'Internal Server Error',
  });
};
