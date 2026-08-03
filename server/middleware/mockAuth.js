// Middleware mock auth untuk pengembangan
// Jika header `x-user-role` disertakan, akan menyuntikkan req.user.role
// Jika process.env.DEV_USER_ROLE diset, akan digunakan sebagai default (non-produksi)

module.exports = function (req, res, next) {
  try {
    const headerRole = req.headers['x-user-role'];
    if (headerRole) {
      req.user = { role: headerRole };
    } else if (process.env.DEV_USER_ROLE) {
      // Hati-hati: hanya untuk development/local testing
      req.user = { role: process.env.DEV_USER_ROLE };
    }
  } catch (e) {
    // jangan ganggu request kalau terjadi error kecil
  }
  next();
};
