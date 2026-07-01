/**
 * utils/apiResponse.js
 * Standardized JSON response helpers for all Express routes.
 */

export const sendSuccess = (res, data, statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    data,
  });
};

export const sendError = (res, message, statusCode = 500, details = null) => {
  const payload = { success: false, error: message };
  if (details) payload.details = details;
  res.status(statusCode).json(payload);
};
