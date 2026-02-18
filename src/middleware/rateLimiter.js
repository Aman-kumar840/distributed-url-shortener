const rateLimit = require("express-rate-limit");

// Limit shorten endpoint
const shortenLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // 20 requests per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many requests. Please try again later.",
  },
});

module.exports = { shortenLimiter };
