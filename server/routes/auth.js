/**
 * API Routes - Authentication
 * Handle login, logout, dan JWT tokens
 */

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { loginLimiter } = require('../middleware/rateLimiter');

// Mock user database (dalam production gunakan database sebenarnya)
const users = {
    'admin@pramuka.id': { password: 'admin123', role: 'Admin', name: 'Admin Portal' },
    'pembina@pramuka.id': { password: 'pembina123', role: 'Pembina', name: 'Pembina Ambalan' },
    'kerani@pramuka.id': { password: 'kerani123', role: 'Kerani', name: 'Kerani Ambalan' },
    'juru.uang@pramuka.id': { password: 'juru123', role: 'Juru Uang', name: 'Juru Uang' },
    'anggota@pramuka.id': { password: 'anggota123', role: 'Anggota', name: 'Anggota Penegak' }
};

// Add demo admin from environment or default for quick testing (development only).
// If ADMIN_USER/ADMIN_PASS are set in env, they will be used. Otherwise add a safe demo account.
const demoEmail = process.env.ADMIN_USER || 'admin@example.com';
const demoPass = process.env.ADMIN_PASS || 'Admin#2026';
if (!users[demoEmail]) {
    users[demoEmail] = { password: demoPass, role: 'Admin', name: 'Demo Admin' };
}


// POST - Login (menghasilkan JWT)
// Menangani GET ke /login dengan 405 untuk membantu debugging (Method Not Allowed)
router.get('/login', (req, res) => {
    res.status(405).json({
        status: 'error',
        message: 'Method Not Allowed. Gunakan POST /api/auth/login dengan body {"email":"...","password":"..."}'
    });
});

router.post('/login', loginLimiter, async (req, res) => {
    try {
        // Accept both 'email' and legacy 'username' field from frontend
        const email = req.body.email || req.body.username;
        const password = req.body.password;
        
        if (!email || !password) {
            return res.status(400).json({
                status: 'error',
                message: 'Email dan password diperlukan'
            });
        }
        
        let user = users[email];
        // If not found in users, accept admin demo credentials from env or defaults (development convenience)
        if (!user) {
            const envDemoEmail = process.env.ADMIN_USER || 'admin@example.com';
            const envDemoPass = process.env.ADMIN_PASS || 'Admin#2026';
            if (email === envDemoEmail && password === envDemoPass) {
                user = { password: envDemoPass, role: 'Admin', name: 'Demo Admin' };
                // cache into users for consistency
                users[email] = user;
            }
        }

        if (!user || user.password !== password) {
            return res.status(401).json({
                status: 'error',
                message: 'Email atau password salah'
            });
        }
        
        // Generate JWT token dengan role yang valid untuk RBAC
        const secret = process.env.JWT_SECRET || 'dev_jwt_secret';
        const token = jwt.sign(
            { 
              sub: email,
              email: email, 
              role: user.role, 
              name: user.name 
            },
            secret,
            { expiresIn: '24h' }
        );
        
        res.json({
            status: 'success',
            message: 'Login berhasil',
            token: token,
            tokenType: 'Bearer',
            expiresIn: '24h',
            user: {
                email: email,
                name: user.name,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Gagal login',
            error: error.message
        });
    }
});

// POST - Logout (stateless, tapi bisa digunakan frontend untuk clear token)
router.post('/logout', (req, res) => {
    res.json({
        status: 'success',
        message: 'Logout berhasil (hapus token dari storage lokal)'
    });
});

// GET - Verify token
router.get('/verify', (req, res) => {
    try {
        const authHeader = req.headers.authorization || '';
        const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;
        
        if (!token) {
            return res.status(401).json({
                status: 'error',
                message: 'Token tidak ditemukan di header Authorization: Bearer <token>'
            });
        }
        
        const secret = process.env.JWT_SECRET || 'dev_jwt_secret';
        const decoded = jwt.verify(token, secret);
        
        res.json({
            status: 'success',
            message: 'Token valid',
            user: decoded
        });
    } catch (error) {
        res.status(401).json({
            status: 'error',
            message: 'Token tidak valid atau kadaluarsa',
            error: error.message
        });
    }
});

// GET - Get profile dari token
router.get('/profile', (req, res) => {
    try {
        const authHeader = req.headers.authorization || '';
        const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;
        
        if (!token) {
            return res.status(401).json({
                status: 'error',
                message: 'Token tidak ditemukan'
            });
        }
        
        const secret = process.env.JWT_SECRET || 'dev_jwt_secret';
        const decoded = jwt.verify(token, secret);
        
        res.json({
            status: 'success',
            profile: {
                email: decoded.email,
                name: decoded.name,
                role: decoded.role,
                verifiedAt: new Date().toISOString()
            }
        });
    } catch (error) {
        res.status(401).json({
            status: 'error',
            message: 'Gagal mengambil profile',
            error: error.message
        });
    }
});

// GET - Demo users (untuk testing/development)
router.get('/demo-users', (req, res) => {
    // Build list from current users map
    const list = Object.keys(users).map(email => ({
        email,
        password: users[email].password,
        role: users[email].role,
        name: users[email].name
    }));

    // If there's an ADMIN_USER in env that isn't in users yet, include it for clarity
    const envDemoEmail = process.env.ADMIN_USER;
    const envDemoPass = process.env.ADMIN_PASS;
    if (envDemoEmail) {
        const exists = list.find(u => u.email === envDemoEmail);
        if (!exists) {
            list.unshift({ email: envDemoEmail, password: envDemoPass || '(not set)', role: 'Admin (env)', name: 'Demo Admin (from ENV)' });
        }
    }

    res.json({
        status: 'success',
        message: 'Demo credentials untuk testing (HANYA untuk development)',
        users: list
    });
});

module.exports = router;
