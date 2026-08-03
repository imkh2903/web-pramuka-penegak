/**
 * API Routes - Keanggotaan & SKU
 * Mengelola data anggota dan SKU dari Google Sheets
 */

const express = require('express');
const router = express.Router();
const googleSheetsService = require('../services/googleSheetsService');
const { requireRole } = require('../middleware/rbac');

// GET - Ambil semua data anggota
router.get('/', async (req, res) => {
    try {
        const sheetId = process.env.GOOGLE_SHEET_MEMBERS_ID;
        const data = await googleSheetsService.getSheetData(sheetId, 'Anggota');
        
        res.json({
            status: 'success',
            message: 'Data anggota berhasil diambil',
            count: data.length,
            data: data
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Gagal mengambil data anggota',
            error: error.message
        });
    }
});

// GET - Filter anggota berdasarkan sangga
router.get('/sangga/:sangga', async (req, res) => {
    try {
        const sheetId = process.env.GOOGLE_SHEET_MEMBERS_ID;
        const sangga = req.params.sangga;
        const data = await googleSheetsService.getSheetData(sheetId, 'Anggota');
        
        const filtered = data.filter(member => 
            member.Sangga?.toLowerCase() === sangga.toLowerCase()
        );
        
        res.json({
            status: 'success',
            sangga: sangga,
            count: filtered.length,
            data: filtered
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Gagal filter data anggota',
            error: error.message
        });
    }
});

// GET - Filter berdasarkan tingkat SKU
router.get('/tingkat/:tingkat', async (req, res) => {
    try {
        const sheetId = process.env.GOOGLE_SHEET_MEMBERS_ID;
        const tingkat = req.params.tingkat;
        const data = await googleSheetsService.getSheetData(sheetId, 'Anggota');
        
        const filtered = data.filter(member => 
            member['Tingkat SKU']?.toLowerCase() === tingkat.toLowerCase()
        );
        
        res.json({
            status: 'success',
            tingkat: tingkat,
            count: filtered.length,
            data: filtered
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Gagal filter data tingkat SKU',
            error: error.message
        });
    }
});

// GET - Statistik anggota
router.get('/stats/summary', async (req, res) => {
    try {
        const sheetId = process.env.GOOGLE_SHEET_MEMBERS_ID;
        const data = await googleSheetsService.getSheetData(sheetId, 'Anggota');
        
        // Count per sangga
        const sanggas = {};
        const tingkats = {};
        
        data.forEach(member => {
            sanggas[member.Sangga] = (sanggas[member.Sangga] || 0) + 1;
            tingkats[member['Tingkat SKU']] = (tingkats[member['Tingkat SKU']] || 0) + 1;
        });
        
        res.json({
            status: 'success',
            totalMembers: data.length,
            bySangga: sanggas,
            byTingkat: tingkats
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Gagal mengambil statistik',
            error: error.message
        });
    }
});

// POST - Tambah anggota baru
router.post('/', requireRole(['Admin','Kerani']), async (req, res) => {
    try {
        const { nama, kelas, sangga, tingkat, wa, email } = req.body;
        
        // Validasi input
        if (!nama || !kelas || !sangga || !tingkat) {
            return res.status(400).json({
                status: 'error',
                message: 'Data tidak lengkap'
            });
        }
        
        const sheetId = process.env.GOOGLE_SHEET_MEMBERS_ID;
        const newData = [nama, kelas, sangga, tingkat, wa || '', email || '', new Date().toLocaleDateString('id-ID')];
        
        await googleSheetsService.appendSheetData(sheetId, 'Anggota', newData);
        
        res.status(201).json({
            status: 'success',
            message: 'Anggota berhasil ditambahkan',
            data: { nama, kelas, sangga, tingkat, wa, email }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Gagal menambah anggota',
            error: error.message
        });
    }
});

module.exports = router;
