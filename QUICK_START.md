# 🚀 QUICK START GUIDE - Setup dalam 5 Menit

Panduan ringkas untuk mulai menggunakan Portal Gudep Penegak.

## ✅ Checklist Setup

### 1️⃣ Google Cloud Console (5 menit)
- [ ] Buka https://console.cloud.google.com
- [ ] Buat project baru
- [ ] Enable: Google Sheets API, Google Drive API
- [ ] Create Service Account → Download JSON
- [ ] Copy `GOOGLE_PRIVATE_KEY` & `GOOGLE_SERVICE_ACCOUNT_EMAIL`

### 2️⃣ Google Sheets (5 menit)
- [ ] Buat Google Sheet dengan 4 sheets:
  - Anggota (nama, kelas, sangga, tingkat, wa)
  - Keuangan (tanggal, deskripsi, debit, kredit)
  - Kegiatan (nama, tanggal, lokasi, peserta)
  - Publikasi (judul, kategori, konten, author)
- [ ] Share ke service account email
- [ ] Copy sheet IDs dari URL

### 3️⃣ Google Drive (2 menit)
- [ ] Buat 5 folder:
  - Dokumen Resmi
  - Bukti Tugas
  - Galeri Kegiatan
  - Publikasi
  - Inventaris
- [ ] Share ke service account email
- [ ] Copy folder IDs

### 4️⃣ Project Setup (3 menit)
```bash
# Pindah ke folder
cd web-pramuka-penegak-comprehensive

# Install dependencies
npm install

# Copy .env template
cp .env.example .env

# Edit .env dengan data Anda
# GOOGLE_SHEET_MEMBERS_ID=...
# GOOGLE_DRIVE_BUKTI_FOLDER=...
# dll
```

### 5️⃣ Jalankan Server (1 menit)
```bash
npm run dev
```

✅ **Server running di http://localhost:3000**

---

## 🔗 Cara Mendapatkan Sheet ID & Folder ID

### Sheet ID
```
URL: https://docs.google.com/spreadsheets/d/[SHEET_ID]/edit
Ambil bagian: [SHEET_ID]
Contoh: 1abc2def3ghi4jkl5mno6pqr7stu8vwx
```

### Folder ID
```
URL: https://drive.google.com/drive/folders/[FOLDER_ID]
Ambil bagian: [FOLDER_ID]
Contoh: 1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7
```

---

## 🧪 Test API

### Terminal 1: Jalankan server
```bash
npm run dev
```

### Terminal 2: Test endpoints

#### Test 1: Health Check
```bash
curl http://localhost:3000/api/health
```

#### Test 2: List Anggota
```bash
curl http://localhost:3000/api/members
```

#### Test 3: List Keuangan
```bash
curl http://localhost:3000/api/finances
```

#### Test 4: Tambah Anggota
```bash
curl -X POST http://localhost:3000/api/members \
  -H "Content-Type: application/json" \
  -d '{
    "nama": "Budi Purnama",
    "kelas": "XI MIPA 1",
    "sangga": "Sangga Perintis",
    "tingkat": "Penegak Bantara",
    "wa": "081234567890",
    "email": "budi@email.com"
  }'
```

---

## 📱 Test di Browser

1. Buka http://localhost:3000
2. Lihat console browser (F12 → Console)
3. Data dari Google Sheets akan otomatis terload
4. Coba submit form untuk test save ke database

---

## 🔑 Default Test Accounts

```
Email: pembina@pramuka.id
Password: pembina123
Role: Admin (Full Access)

Email: anggota@pramuka.id
Password: anggota123
Role: Anggota (Limited Access)
```

---

## ⚠️ Common Issues

### "Cannot find module 'express'"
```bash
npm install
```

### "Google API Error"
- Pastikan `.env` terisi dengan benar
- Check Google Private Key format (harus punya \n)
- Pastikan Google Sheets API enabled

### "Port 3000 already in use"
```bash
# Use different port
PORT=3001 npm run dev
```

### "Sheet not found"
- Copy benar-benar Sheet ID dari URL
- Pastikan sheet name sesuai: "Anggota", "Keuangan", dll

---

## 🎯 Next Steps

1. ✅ Customize data fields sesuai kebutuhan
2. ✅ Update authentication dengan database real
3. ✅ Deploy ke production
4. ✅ Setup WhatsApp notification
5. ✅ Add QR code generation

---

**Butuh bantuan?** Lihat README.md untuk dokumentasi lengkap.

Selamat menggunakan! 🎖️
