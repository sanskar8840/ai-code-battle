const config = require("../config/config");

/**
 * Signs a JWT for the given user, sets it as an httpOnly cookie,
 * and returns the token string as well (for clients that store it themselves,
 * e.g. a mobile client or Postman testing).
 */
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();

  const cookieOptions = {
    expires: new Date(Date.now() + config.jwt.cookieExpireDays * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: config.env === "production",
    sameSite: config.env === "production" ? "none" : "lax",
  };

  res
    .status(statusCode)
    .cookie("token", token, cookieOptions)
    .json({
      success: true,
      token,
      user: user.toSafeObject(),
    });
};

module.exports = sendTokenResponse;
