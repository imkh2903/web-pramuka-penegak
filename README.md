# 🚀 Portal Terintegrasi Gudep Ambalan Penegak

> Sistem manajemen digital komprehensif untuk Ambalan Peguak MAN 1 Padang Pariaman dengan integrasi **Google Sheets**, **Google Drive**, dan **Backend API Node.js**.

## ✨ Fitur Utama

### 1. **Keanggotaan & SKU Digital**
- ✅ Database anggota real-time dari Google Sheets
- ✅ Tracking SKU/SKK (Tamu → Garuda)
- ✅ Pengelompokan per Sangga (5 unit)
- ✅ Digital Logbook dan portfolio bukti tugas
- ✅ Presensi QR Code

### 2. **Administrasi & Keuangan**
- ✅ Tools Kerani (nomor surat otomatis, arsip dokumen)
- ✅ Juru Uang (kas transparan, laporan keuangan)
- ✅ QRIS payment link untuk iuran
- ✅ Export laporan keuangan ke PDF
- ✅ Buku Adat digital (managed by Pemangku Adat)

### 3. **Kegiatan & Inventaris**
- ✅ Kalender kegiatan sinkron Google Calendar
- ✅ Sistem RSVP dan registrasi kegiatan
- ✅ Download lembar izin otomatis
- ✅ Manajemen inventaris & peminjaman barang
- ✅ Tracking kuota tempat kegiatan

### 4. **Publikasi & Kreativitas**
- ✅ Blog/buletin karya Penegak
- ✅ Galeri foto dari Google Drive
- ✅ Integrasi YouTube (links)
- ✅ Peta potensi proyek sosial per Sangga
- ✅ Forum sharing karya

### 5. **Keamanan & Akses**
- ✅ Role-Based Access Control (RBAC)
  - **Pembina**: Full admin access
  - **Kerani**: Manage surat & dokumen
  - **Juru Uang**: Manage keuangan & kas
  - **Anggota**: Submit data & lihat info publik
- ✅ Google OAuth 2.0 integration
- ✅ JWT Token authentication
- ✅ Audit log semua aktivitas

---

## 📁 Struktur Folder

```
web-pramuka-penegak-comprehensive/
│
├── 📂 public/                          # Frontend (HTML, CSS, JS)
│   ├── index.html                      # Halaman utama
│   ├── keanggotaan.html                # Modul Keanggotaan & SKU
│   ├── administrasi.html               # Modul Admin & Keuangan
│   ├── kegiatan.html                   # Modul Kegiatan & Inventaris
│   ├── publikasi.html                  # Modul Publikasi & Karya
│   ├── 📂 css/
│   │   └── style.css                   # Stylesheet utama
│   ├── 📂 js/
│   │   └── main.js                     # ✨ UPDATED: Real data integration
│   └── 📂 assets/
│       └── img/                        # Logo & gambar
│
├── 📂 server/                          # Backend Node.js
│   ├── server.js                       # Entry point server
│   ├── 📂 config/                      # Configuration
│   │   └── googleAuth.js               # Google OAuth setup
│   ├── 📂 routes/                      # API endpoints
│   │   ├── members.js                  # GET/POST anggota
│   │   ├── finances.js                 # GET/POST keuangan
│   │   ├── activities.js               # GET/POST kegiatan
│   │   ├── publications.js             # GET/POST publikasi
│   │   ├── upload.js                   # Upload file ke Drive
│   │   ├── files.js                    # Download/manage files
│   │   └── auth.js                     # Login/Logout/JWT
│   ├── 📂 controllers/                 # Business logic
│   ├── 📂 middleware/                  # Express middleware
│   └── 📂 services/                    # External services
│       ├── googleSheetsService.js      # Google Sheets API
│       └── googleDriveService.js       # Google Drive API
│
├── 📂 uploads/
│   ├── 📂 temp/                        # Temporary file storage
│   └── .gitkeep
│
├── 📄 package.json                     # Dependencies & scripts
├── 📄 .env.example                     # Template environment variables
├── 📄 .gitignore                       # Git ignore rules
├── 📄 .npmrc                           # NPM config (optional)
├── 📄 SETUP_INTEGRASI.md               # Panduan setup
└── 📄 README.md                        # File ini
```

---

## 🔧 Instalasi & Setup

### **Prasyarat**
- Node.js v14+ ([Download](https://nodejs.org))
- npm v6+
- Akun Google dengan Google Workspace
- Google Cloud Console access

### **Step 1: Setup Google Cloud Console**

1. Buka https://console.cloud.google.com
2. Buat project baru: **"Pramuka Penegak Portal"**
3. Enable APIs:
   - Google Sheets API
   - Google Drive API
   - Google+ API
   - Google Identity

4. Buat **Service Account**:
   - Pilih "Service Accounts" di sidebar
   - Klik "Create Service Account"
   - Nama: `pramuka-backend`
   - Izin: `Editor`
   - Download JSON key file

5. Buat **OAuth 2.0 Client ID**:
   - Pilih "OAuth consent screen"
   - Application type: **Web application**
   - Authorized redirect URIs: `http://localhost:3000/api/auth/callback`

### **Step 2: Setup Google Sheets & Drive**

#### **Google Sheets** - Buat 4 sheet:

**Sheet 1: "Anggota"**
```
Nama | Kelas | Sangga | Tingkat SKU | WA | Email | Tanggal Daftar
```

**Sheet 2: "Keuangan"**
```
Tanggal | Deskripsi | Debit | Kredit | Kategori | Verifikasi | Waktu Input
```

**Sheet 3: "Kegiatan"**
```
Nama Event | Tanggal | Lokasi | Kategori | Deskripsi | Pembina | Peserta | Status | Material Link | Created
```

**Sheet 4: "Publikasi"**
```
Judul | Kategori | Tanggal | Author | Konten | Tags | Views | Created
```

#### **Google Drive Folder Structure**:
```
Gudep Penegak Drive/
├── Dokumen Resmi/        (arsip surat, template)
├── Bukti Tugas/          (portfolio SKU)
├── Galeri Kegiatan/      (foto JPG kegiatan)
├── Publikasi/            (artikel, PDF)
└── Inventaris/           (daftar barang, foto)
```

### **Step 3: Clone & Install Project**

```bash
# Clone atau download project ini
cd web-pramuka-penegak-comprehensive

# Install dependencies
npm install

# Copy environment template
cp .env.example .env
```

### **Step 4: Konfigurasi .env**

Edit file `.env` dengan data Anda:

```env
# Google Cloud
GOOGLE_PROJECT_ID=your-project-id
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_SERVICE_ACCOUNT_EMAIL=pramuka-backend@your-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----"

# Google Sheets IDs (copy dari URL sheet)
GOOGLE_SHEET_MEMBERS_ID=1abc2def3ghi4jkl5mno6pqr7stu8vwx
GOOGLE_SHEET_FINANCES_ID=9yza8bcd7efg6hij5klm4nop3qrs2tuv
GOOGLE_SHEET_ACTIVITIES_ID=1wxy2zab3cde4fgh5ijk6lmn7opq8rst
GOOGLE_SHEET_PUBLICATIONS_ID=9uvw8xyz7abc6def5ghi4jkl3mno2pqr

# Google Drive Folder IDs
GOOGLE_DRIVE_DOCS_FOLDER=1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7
GOOGLE_DRIVE_BUKTI_FOLDER=8q9r0s1t2u3v4w5x6y7z8a9b0c1d2e3f4
GOOGLE_DRIVE_GALERI_FOLDER=5g6h7i8j9k0l1m2n3o4p5q6r7s8t9u0v1
GOOGLE_DRIVE_PUBLIKASI_FOLDER=2w3x4y5z6a7b8c9d0e1f2g3h4i5j6k7l8

# Server
PORT=3000
NODE_ENV=development
BASE_URL=http://localhost:3000
JWT_SECRET=your-super-secret-jwt-key-change-this

# Upload
MAX_FILE_SIZE=52428800
ALLOWED_EXTENSIONS=pdf,jpg,jpeg,png,doc,docx
```

### **Step 5: Jalankan Server**

```bash
# Development mode
npm run dev

# Production mode
npm start
```

Server akan berjalan di `http://localhost:3000`

---

## 📊 API Endpoints

### **Authentication**
```
POST   /api/auth/login              # Login
POST   /api/auth/logout             # Logout
GET    /api/auth/verify             # Verify token
GET    /api/auth/profile            # Get user profile
```

### **Members (Keanggotaan)**
```
GET    /api/members                 # List semua anggota
GET    /api/members/sangga/:sangga  # Filter by sangga
GET    /api/members/tingkat/:level  # Filter by tingkat SKU
GET    /api/members/stats/summary   # Statistics
POST   /api/members                 # Tambah anggota baru
```

### **Finances (Keuangan)**
```
GET    /api/finances                # List semua transaksi
GET    /api/finances/report/monthly # Laporan bulanan
GET    /api/finances/qris           # QRIS payment link
POST   /api/finances                # Catat transaksi baru
```

### **Activities (Kegiatan)**
```
GET    /api/activities              # List semua kegiatan
GET    /api/activities/upcoming     # Kegiatan mendatang
GET    /api/activities/kategori/:k  # Filter by kategori
POST   /api/activities              # Buat kegiatan baru
POST   /api/activities/:id/rsvp     # RSVP kegiatan
GET    /api/activities/inventaris   # List inventaris
```

### **Publications (Publikasi)**
```
GET    /api/publications            # List publikasi
GET    /api/publications/blog/latest # Blog terbaru
GET    /api/publications/gallery    # Galeri foto
POST   /api/publications            # Publish artikel
```

### **File Management**
```
POST   /api/upload/bukti-tugas      # Upload bukti tugas
POST   /api/upload/dokumen-resmi    # Upload dokumen
POST   /api/upload/galeri           # Upload foto galeri
GET    /api/files/:folderId         # List files in folder
POST   /api/files/:fileId/share     # Share file
DELETE /api/files/:fileId           # Delete file
```

---

## 📱 Penggunaan Frontend

### **Auto-load Real Data**

File `public/js/main.js` sudah diupdate untuk:
1. ✅ Otomatis load data anggota dari API
2. ✅ Otomatis load data keuangan & saldo
3. ✅ Otomatis load kegiatan mendatang
4. ✅ Form submit langsung ke Google Sheets via API
5. ✅ Display notifikasi sukses/error

### **Contoh penggunaan di HTML:**

```html
<!-- Container untuk display data anggota (di keanggotaan.html) -->
<div id="membersTableContainer"></div>

<!-- Container untuk statistik -->
<div id="memberStats"></div>

<!-- Form akan otomatis post ke API -->
<form id="googleSheetForm">
    <input type="text" name="nama" required>
    <input type="text" name="kelas" required>
    <button type="submit">Kirim</button>
</form>
```

---

## 🔐 Keamanan Data

### ✅ Best Practices Implementasi:

1. **Never Commit Secrets**
   ```bash
   # ❌ JANGAN include di git:
   - .env file
   - credentials.json
   - service account keys
   
   # ✅ Gunakan .gitignore
   ```

2. **Role-Based Access Control**
   ```javascript
   // Hanya user dengan role 'juru_uang' yang bisa akses finance endpoints
   if (user.role !== 'juru_uang') {
       return res.status(403).json({ error: 'Forbidden' });
   }
   ```

3. **Token Expiration**
   - JWT tokens expire dalam 24 jam
   - User harus login ulang

4. **HTTPS di Production**
   - Deploy ke Heroku/Railway/Vercel dengan SSL
   - Ubah `BASE_URL` ke production domain

---

## 🚀 Deployment

### **Option 1: Heroku**

```bash
# Install Heroku CLI
heroku login
heroku create pramuka-penegak-portal
heroku config:set $(cat .env | tr '\n' ' ')
git push heroku main
```

### **Option 2: Railway.app**

```bash
# Connect GitHub repo
# Railway akan auto-deploy saat push
```

### **Option 3: Self-hosted (VPS)**

```bash
# Install Node & PM2
npm install -g pm2
pm2 start server/server.js --name "pramuka-portal"
pm2 save
pm2 startup
```

---

## 🐛 Troubleshooting

### Problem: "Google API Error"
```
Solution: 
1. Verify GOOGLE_PRIVATE_KEY di .env (include newlines: \n)
2. Enable Google Sheets & Drive API di Console
3. Share Google Sheets ke service account email
```

### Problem: "CORS Error"
```
Solution:
1. Ensure CORS middleware enabled di server.js
2. Frontend BASE_URL harus match server URL
3. Jika localhost, pastikan port 3000 accessible
```

### Problem: "File Upload Error"
```
Solution:
1. Verify GOOGLE_DRIVE_*_FOLDER IDs di .env
2. Service account punya write access ke folder
3. Check file size limit (max 50MB)
```

---

## 📞 Support & Contact

- **Pembina**: Hubungi melalui WhatsApp grup
- **Technical Issues**: Buat issue di GitHub
- **Feature Requests**: Diskusi di grup admin

---

## 📝 License

MIT License - Bebas digunakan untuk Ambalan Penegak

---

## 🎯 Roadmap Fitur

- [ ] Mobile app (React Native)
- [ ] WhatsApp Bot untuk registrasi
- [ ] Sertifikat digital (blockchain)
- [ ] AI-powered recommendation untuk kegiatan
- [ ] Real-time notification system
- [ ] Offline mode untuk mobile

---

**🚀 Happy Coding! Satya Ku Darmakan, Darma Ku Kubaktikan** 🎖️

Dibuat dengan ❤️ untuk Ambalan Penegak MAN 1 Padang Pariaman
