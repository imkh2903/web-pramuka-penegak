// Middleware rate limiting untuk mencegah brute force / abuse
const rateLimit = require('express-rate-limit');

// Rate limiter untuk login (lebih ketat)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 5, // maksimal 5 percobaan
  message: 'Terlalu banyak percobaan login, coba lagi dalam 15 menit',
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter untuk API umum (lebih santai)
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 menit
  max: 100, // maksimal 100 request per menit
  message: 'Terlalu banyak request, coba lagi nanti',
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { loginLimiter, apiLimiter };
