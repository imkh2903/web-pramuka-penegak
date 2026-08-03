// Middleware audit logging untuk mencatat aktivitas penting
const fs = require('fs');
const path = require('path');

// Buat folder logs jika tidak ada
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const auditLog = (req, res, next) => {
  // Simpan original send untuk intercept response
  const originalSend = res.send;

  res.send = function (data) {
    // Hanya log method yg penting dan response yg sukses/gagal auth
    const shouldLog =
      (req.method === 'POST' && req.path.includes('/auth/login')) ||
      (req.method === 'POST' && req.path.includes('/api/members')) ||
      (req.method === 'POST' && req.path.includes('/api/finances')) ||
      (req.method === 'POST' && req.path.includes('/api/activities')) ||
      (req.method === 'POST' && req.path.includes('/api/upload'));

    if (shouldLog) {
      const logEntry = {
        timestamp: new Date().toISOString(),
        method: req.method,
        path: req.path,
        ip: req.ip || req.connection.remoteAddress,
        user: req.user ? req.user.email || req.user.sub : 'anonymous',
        role: req.user ? req.user.role : 'none',
        statusCode: res.statusCode,
        userAgent: req.headers['user-agent'] || 'unknown',
      };

      // Append ke file log harian
      const dateStr = new Date().toISOString().split('T')[0];
      const logFilePath = path.join(logsDir, `audit-${dateStr}.log`);

      fs.appendFile(
        logFilePath,
        JSON.stringify(logEntry) + '\n',
        (err) => {
          if (err) console.error('Gagal menulis audit log:', err);
        }
      );
    }

    // Lanjutkan response normal
    res.send = originalSend;
    return originalSend.call(this, data);
  };

  next();
};

module.exports = auditLog;
