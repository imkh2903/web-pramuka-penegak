// Middleware RBAC sederhana
// Gunakan: const { requireRole } = require('../middleware/rbac');
// router.post('/path', requireRole(['Admin','Kerani']), handler)

function normalizeRole(r) {
  if (!r) return '';
  return String(r).toLowerCase();
}

function requireRole(allowedRoles = []) {
  const allowed = allowedRoles.map(normalizeRole);
  return (req, res, next) => {
    // Periksa user yang disuntikkan oleh auth middleware atau header developer
    const user = req.user || {};
    const headerRole = req.headers['x-user-role'];
    const envDev = process.env.DEV_USER_ROLE;

    // support: user.role (string) atau user.roles (array)
    let role = '';
    if (Array.isArray(user.roles) && user.roles.length > 0) {
      // ambil peran pertama jika ada
      role = normalizeRole(user.roles[0]);
    } else if (user.role) {
      role = normalizeRole(user.role);
    } else {
      role = normalizeRole(headerRole || envDev);
    }

    if (!role) {
      return res.status(401).json({ status: 'error', message: 'Unauthorized: role tidak ditemukan. Sertakan header x-user-role, DEV_USER_ROLE, atau sertakan token JWT.' });
    }

    if (allowed.includes(role)) {
      return next();
    }

    return res.status(403).json({ status: 'error', message: 'Forbidden: Anda tidak memiliki izin untuk melakukan aksi ini.' });
  };
}

module.exports = { requireRole };
