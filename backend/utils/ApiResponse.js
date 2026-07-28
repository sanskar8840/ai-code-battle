/**
 * Sends a consistently-shaped success response.
 * Usage: sendResponse(res, 200, "Login successful", { user, token })
 */
const sendResponse = (res, statusCode, message, data = null) => {
  const payload = { success: true, message };
  if (data !== null) payload.data = data;
  return res.status(statusCode).json(payload);
};

module.exports = sendResponse;
