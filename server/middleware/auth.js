const jwt = require('jsonwebtoken');

// Middleware otentikasi nyata berbasis JWT.
// - Jika header Authorization: Bearer <token> ada, verifikasi dengan JWT_SECRET.
// - Jika valid, payload disimpan ke req.user.
// - Jika tidak ada token dan DEV_USER_ROLE di-set, gunakan peran dev untuk testing lokal.

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization || '';

  if (authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7).trim();
    const secret = process.env.JWT_SECRET || 'dev_jwt_secret';
    try {
      const payload = jwt.verify(token, secret);
      // standar payload bisa berisi { sub, role, roles, name, email }
      req.user = payload;
      return next();
    } catch (err) {
      return res.status(401).json({ status: 'error', message: 'Token tidak valid atau kadaluarsa' });
    }
  }

  // Fallback untuk pengembangan: header x-user-role atau DEV_USER_ROLE
  const headerRole = req.headers['x-user-role'];
  if (headerRole) {
    req.user = { role: headerRole };
    return next();
  }

  if (process.env.DEV_USER_ROLE) {
    req.user = { role: process.env.DEV_USER_ROLE };
    return next();
  }

  // Tidak ada otentikasi — biarkan req.user undefined; RBAC akan menolak jika diperlukan
  return next();
};
