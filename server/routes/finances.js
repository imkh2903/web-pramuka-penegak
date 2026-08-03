/**
 * API Routes - Keuangan & Kas
 * Mengelola data keuangan dari Google Sheets
 */

const express = require('express');
const router = express.Router();
const googleSheetsService = require('../services/googleSheetsService');
const { requireRole } = require('../middleware/rbac');

// GET - Ambil semua transaksi keuangan
router.get('/', async (req, res) => {
    try {
        const sheetId = process.env.GOOGLE_SHEET_FINANCES_ID;
        const data = await googleSheetsService.getSheetData(sheetId, 'Keuangan');
        
        // Hitung total debit & kredit
        const totalDebit = googleSheetsService.getSummary(data, 'Debit');
        const totalKredit = googleSheetsService.getSummary(data, 'Kredit');
        const saldo = totalKredit - totalDebit;
        
        res.json({
            status: 'success',
            message: 'Data keuangan berhasil diambil',
            summary: {
                totalDebit,
                totalKredit,
                saldo,
                lastUpdated: new Date().toISOString()
            },
            transactions: data
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Gagal mengambil data keuangan',
            error: error.message
        });
    }
});

// GET - Laporan bulanan
router.get('/report/monthly', async (req, res) => {
    try {
        const sheetId = process.env.GOOGLE_SHEET_FINANCES_ID;
        const data = await googleSheetsService.getSheetData(sheetId, 'Keuangan');
        
        // Group by bulan
        const byMonth = {};
        data.forEach(transaction => {
            const date = new Date(transaction.Tanggal);
            const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            
            if (!byMonth[month]) {
                byMonth[month] = { debit: 0, kredit: 0 };
            }
            
            byMonth[month].debit += parseFloat(transaction.Debit) || 0;
            byMonth[month].kredit += parseFloat(transaction.Kredit) || 0;
        });
        
        res.json({
            status: 'success',
            report: byMonth
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Gagal mengambil laporan bulanan',
            error: error.message
        });
    }
});

// POST - Catat transaksi baru
router.post('/', requireRole(['Admin','Juru Uang']), async (req, res) => {
    try {
        const { tanggal, deskripsi, debit, kredit, kategori, verifikasi } = req.body;
        
        if (!tanggal || !deskripsi) {
            return res.status(400).json({
                status: 'error',
                message: 'Data tidak lengkap'
            });
        }
        
        const sheetId = process.env.GOOGLE_SHEET_FINANCES_ID;
        const newTransaction = [
            tanggal,
            deskripsi,
            debit || '0',
            kredit || '0',
            kategori || 'Umum',
            verifikasi || 'Menunggu',
            new Date().toLocaleString('id-ID')
        ];
        
        await googleSheetsService.appendSheetData(sheetId, 'Keuangan', newTransaction);
        
        res.status(201).json({
            status: 'success',
            message: 'Transaksi berhasil dicatat',
            data: { tanggal, deskripsi, debit, kredit, kategori }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Gagal mencatat transaksi',
            error: error.message
        });
    }
});

// GET - QRIS Payment Link (placeholder)
router.get('/qris', (req, res) => {
    res.json({
        status: 'success',
        message: 'QRIS Payment Link',
        qris: {
            url: 'https://qr.linkaja.id/your-qris-link',
            nominal: 'Sesuai iuran',
            rekening: '1234567890',
            atas_nama: 'Juru Uang Ambalan Penegak',
            bank: 'BRI'
        }
    });
});

module.exports = router;
