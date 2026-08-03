# 🚀 Panduan Integrasi Database Google Workspace - Pramuka Penegak

## Ringkasan Solusi Integrasi

Proyek Anda akan menggunakan:
- **Backend**: Node.js + Express (server yang menghubungkan ke Google APIs)
- **Database**: Google Sheets + Google Drive (file PDF, JPG)
- **Frontend**: HTML/CSS/JS yang sudah ada (akan diperbarui untuk ambil data real)
- **Authentication**: Google OAuth 2.0

---

## 📋 Struktur Folder Baru

```
web-pramuka-penegak-comprehensive/
├── public/                    # File HTML, CSS, JS frontend (sudah ada)
│   ├── index.html
│   ├── keanggotaan.html
│   ├── administrasi.html
│   ├── kegiatan.html
│   ├── publikasi.html
│   ├── css/
│   ├── js/
│   └── assets/
│
├── server/                    # Backend Node.js (baru)
│   ├── config/
│   │   ├── googleAuth.js      # Setup Google OAuth
│   │   └── credentials.json   # (JANGAN SHARE - dari Google Cloud Console)
│   ├── routes/
│   │   ├── auth.js            # Login/Logout
│   │   ├── members.js         # Data Anggota dari Google Sheets
│   │   ├── finances.js        # Data Keuangan & Kas
│   │   ├── activities.js       # Data Kegiatan & Inventaris
│   │   └── publications.js     # Data Publikasi & Galeri
│   ├── controllers/           # Logic pemrosesan data
│   ├── middleware/            # Middleware Auth, Validator
│   ├── services/
│   │   ├── googleSheetsService.js
│   │   ├── googleDriveService.js
│   │   └── fileService.js
│   └── server.js              # Entry point
│
├── .env                       # Variabel environment (JANGAN SHARE)
├── .gitignore
├── package.json               # Dependencies Node.js
└── README.md
```

---

## 🔧 Langkah-Langkah Setup

### 1. **Persiapan Google Cloud Console**

- Buka https://console.cloud.google.com
- Buat Project baru: "Pramuka Penegak"
- **Enable APIs**:
  - Google Sheets API
  - Google Drive API
  - Google OAuth 2.0
- Buat **Service Account** + download JSON credentials
- Buat **OAuth 2.0 Client ID** untuk web app

### 2. **Setup Google Sheets**

Buat 4 sheet di akun Anda:
1. **Sheet "Anggota"**: Kolom = Nama, Kelas, Sangga, Tingkat SKU, WA, Sangga, Bukti Tugas Link
2. **Sheet "Keuangan"**: Kolom = Tanggal, Deskripsi, Debit, Kredit, Saldo, Verifikasi Juru Uang
3. **Sheet "Kegiatan"**: Kolom = Nama Event, Tanggal, Lokasi, Peserta Terdaftar, Status, Link Material
4. **Sheet "Publikasi"**: Kolom = Judul, Kategori, Tanggal, Author, Konten, File Drive Link

### 3. **Struktur File di Google Drive**

```
Gudep Penegak Drive/
├── Dokumen Resmi/       (arsip surat, template)
├── Bukti Tugas/         (portfolio SKU - JPG, PDF)
├── Galeri Kegiatan/     (foto JPG kegiatan)
├── Publikasi/           (artikel, PDF) 
└── Inventaris/          (daftar barang, foto)
```

### 4. **Install Dependencies & Start Server**

```bash
# Pindah ke folder project
cd web-pramuka-penegak-comprehensive

# Install dependencies
npm install express dotenv axios google-auth-library google-spreadsheet multer cors

# Setup .env file
cp .env.example .env
# Edit .env dengan credentials Google Cloud

# Jalankan server
npm run dev
```

---

## 📊 Mapping Fitur ke Google Sheets & Drive

| Modul | Sheet | Drive Folder | Deskripsi |
|-------|-------|------|-----------|
| **Keanggotaan & SKU** | Anggota | Bukti Tugas | Tracking anggota, upload bukti |
| **Administrasi** | Keuangan | Dokumen Resmi | Kas transparan, arsip surat |
| **Kegiatan** | Kegiatan | Galeri Kegiatan | Event RSVP, inventaris |
| **Publikasi** | Publikasi | Publikasi | Blog, galeri, video |

---

## 🔐 Keamanan Data

- ✅ Gunakan **Environment Variables** untuk credentials
- ✅ Jangan share `credentials.json` atau `.env`
- ✅ Gunakan **Role-Based Access Control** (Admin, Kerani, Juru Uang, Pembina, Anggota)
- ✅ Log semua aktivitas penting

---

## 🎯 API Endpoints yang Akan Dibuat

```
GET  /api/members              # Ambil daftar anggota
POST /api/members              # Tambah anggota baru
GET  /api/finances             # Laporan kas
POST /api/finances             # Catat transaksi
GET  /api/activities           # Daftar kegiatan
GET  /api/publications         # Artikel & publikasi
POST /api/upload               # Upload dokumen ke Drive
GET  /api/drive-files/:folder  # Ambil file dari Drive
```

---

## ✨ Fitur Utama yang Akan Dibuat

1. ✅ **Real-time Data Binding**: Frontend ambil data dari Google Sheets via API
2. ✅ **File Management**: Upload/download PDF & JPG ke Google Drive
3. ✅ **Authentication**: Login dengan Google, role-based access
4. ✅ **CRUD Operations**: Tambah/Edit/Hapus data anggota, keuangan, kegiatan
5. ✅ **Reporting**: Export laporan ke PDF & Google Sheets
6. ✅ **QR Code**: Generate QR untuk presensi kegiatan

---

## 📞 Support & Next Steps

Langkah berikutnya:
1. Setup Google Cloud Console
2. Buat Google Sheets dengan struktur yang sesuai 
3. Jalankan server backend
4. Update frontend untuk ambil data real dari API

Mari dimulai! 🚀
