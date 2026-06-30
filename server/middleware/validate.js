/**
 * middleware/validate.js
 * Request validation middleware for all API routes.
 */

import { sendError } from '../utils/apiResponse.js';

/**
 * Validates that req.body.companyName is a non-empty string ≤ 100 chars
 * and contains only letters, numbers, spaces, dots, dashes, and parens.
 */
export const validateCompanyName = (req, res, next) => {
  const { companyName } = req.body;

  if (!companyName) {
    return sendError(res, 'companyName is required in the request body.', 400);
  }

  if (typeof companyName !== 'string') {
    return sendError(res, 'companyName must be a string.', 400);
  }

  const trimmed = companyName.trim();

  if (trimmed.length === 0) {
    return sendError(res, 'companyName cannot be empty.', 400);
  }

  if (trimmed.length > 100) {
    return sendError(res, 'companyName must not exceed 100 characters.', 400);
  }

  // Allow letters, numbers, spaces, dots, dashes, parentheses, ampersands
  const allowedPattern = /^[a-zA-Z0-9\s.\-()&,]+$/;
  if (!allowedPattern.test(trimmed)) {
    return sendError(res, 'companyName contains invalid characters.', 400);
  }

  // Attach sanitized value back for downstream use
  req.body.companyName = trimmed;
  next();
};

/**
 * Validates that req.params.id is a valid MongoDB ObjectId format (24 hex chars).
 */
export const validateObjectId = (req, res, next) => {
  const { id } = req.params;
  const objectIdPattern = /^[a-fA-F0-9]{24}$/;

  if (!id || !objectIdPattern.test(id)) {
    return sendError(res, 'Invalid report ID format.', 400);
  }

  next();
};
