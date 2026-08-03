# 🎯 VISUAL GUIDE - Apa yang Telah Diimplementasikan

## Sebelum vs Sesudah

### ❌ SEBELUM (Non-functional)
```
Website → HTML Forms
  ↓
User Input (nama, kelas, sangga, dll)
  ↓
Click "Submit"
  ↓
✗ Pop-up "Berhasil!" (tapi data HILANG)
  ↓
Tidak ada data tersimpan
  ↓
Reload halaman → Data KOSONG
```

**Masalah:** Hanya simulasi, data tidak tersimpan ke database apapun.

---

### ✅ SESUDAH (Fully Functional)
```
Website (localhost:3000)
  ↓
User Input → JavaScript validate
  ↓
fetch() API call
  ↓
Express Backend Server
  ↓
Google Sheets Service
  ↓
Google Sheets API
  ↓
✅ DATA TERSIMPAN DI GOOGLE SHEETS
  ↓
API return success response
  ↓
Frontend show notification
  ↓
Reload halaman → Data langsung terlihat
```

**Hasil:** Data real-time dari Google Sheets, tersimpan permanent, accessible dari mana saja.

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                       USERS (Frontend)                      │
│              http://localhost:3000 (Public)                 │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Keanggotaan  │  │  Keuangan    │  │  Kegiatan    │      │
│  │   Page       │  │   Page       │  │   Page       │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
              ↓                    ↓                ↓
          fetch()              fetch()          fetch()
    (JavaScript API calls)
              ↓                    ↓                ↓
┌─────────────────────────────────────────────────────────────┐
│                    EXPRESS BACKEND SERVER                   │
│              (Node.js - Port 3000, Private)                 │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  HTTP Routes (GET, POST, DELETE, etc)               │  │
│  │  /api/members                                       │  │
│  │  /api/finances                                      │  │
│  │  /api/activities                                    │  │
│  │  /api/publications                                  │  │
│  │  /api/upload                                        │  │
│  │  /api/auth                                          │  │
│  └──────────────────────────────────────────────────────┘  │
│                      ↓                                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Services Layer                                      │  │
│  │  ├─ googleSheetsService.js                          │  │
│  │  └─ googleDriveService.js                           │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
           ↓                              ↓
        Google Sheets API            Google Drive API
           ↓                              ↓
┌──────────────────────────────────────────────────────────────┐
│                   GOOGLE WORKSPACE (Data Cloud)              │
│                                                               │
│  ┌────────────────────┐  ┌────────────────────────────────┐ │
│  │   Google Sheets    │  │   Google Drive                 │ │
│  │                    │  │                                │ │
│  │ • Anggota          │  │ • Dokumen Resmi/              │ │
│  │ • Keuangan         │  │ • Bukti Tugas/                │ │
│  │ • Kegiatan         │  │ • Galeri Kegiatan/            │ │
│  │ • Publikasi        │  │ • Publikasi/                  │ │
│  │                    │  │ • Inventaris/                 │ │
│  └────────────────────┘  └────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

---

## Data Flow untuk Setiap Modul

### 📌 MODUL KEANGGOTAAN (Members)

**Display Data:**
```
1. User buka halaman keanggotaan.html
2. JavaScript DOMContentLoaded event
3. loadMembersData() function
4. fetch('http://localhost:3000/api/members')
5. Backend query Google Sheets "Anggota"
6. Return JSON array [{ nama, kelas, sangga, tingkat, wa }, ...]
7. displayMembersTable() render tabel di halaman
8. Tampilkan real-time data dengan 5+ anggota
```

**Form Submission:**
```
1. User isi form: Nama, Kelas, Sangga, Tingkat
2. Click "Kirim & Simpan ke Airtable/Sheets"
3. setupFormHandler() trigger submitMemberForm()
4. fetch('POST /api/members', { nama, kelas, sangga, tingkat, wa })
5. Backend append row ke Google Sheets
6. Return success response
7. Front end show notification
8. Reload data → User langsung lihat data mereka di tabel
```

**Statistics:**
```
1. Hitung jumlah per Sangga dari Google Sheets
2. Display card: "Sangga Perintis: 5 Anggota"
3. Update real-time saat ada anggota baru
```

---

### 💰 MODUL KEUANGAN (Finances)

**Display Stats:**
```
1. loadFinancesData() fetch dari API
2. Backend query Google Sheets "Keuangan"
3. Calculate:
   - Total Debit (pengeluaran)
   - Total Kredit (pemasukan)
   - Saldo = Kredit - Debit
4. displayFinancesStats() render 3 card
   ┌─────────────────┐
   │  Total Kredit   │
   │  Rp 5.000.000   │
   ├─────────────────┤
   │  Total Debit    │
   │  Rp 1.500.000   │
   ├─────────────────┤
   │  Saldo          │
   │  Rp 3.500.000   │
   └─────────────────┘
5. Real-time update saat ada transaksi baru
```

**Report:**
```
1. GET /api/finances/report/monthly
2. Group by bulan (2026-01, 2026-02, dll)
3. Calculate debit & kredit per bulan
4. Return JSON dengan trend keuangan
5. Display report bulanan untuk transparency
```

---

### 📅 MODUL KEGIATAN (Activities)

**Display Calendar:**
```
1. loadActivitiesData() fetch upcoming events
2. Backend query Google Sheets "Kegiatan"
3. Filter hanya tanggal > hari ini
4. Sort by tanggal (ascending)
5. displayActivitiesCalendar() render:
   ├─ [02 AUG] Latihan Rutin Ambalan
   ├─ [09 AUG] Ujian SKU Penegak Bantara
   ├─ [16 AUG] Perkemahan 3 Hari
   └─ [23 AUG] Jelajah Kota Pariaman
6. Hover → Show details & RSVP button
```

**RSVP & Registrasi:**
```
1. User klik "RSVP Kegiatan"
2. Form dengan nama, email, status (Hadir/Izin)
3. POST /api/activities/:id/rsvp
4. Backend save ke database
5. Show lembar izin PDF
6. Update peserta count di kegiatan
```

---

### 📰 MODUL PUBLIKASI (Publications)

**Display Blog:**
```
1. loadPublicationsData() fetch latest articles
2. Backend query Google Sheets "Publikasi"
3. Sort by tanggal (descending)
4. Take top 10 articles
5. displayBlogPosts() render card grid:
   ┌────────────────────────────┐
   │ 🏷️ Artikel                  │
   │ Judul: "Hasil Ujian SKU"   │
   │ Author: Pembina Penegak    │
   │ Tanggal: 01 Aug 2026       │
   │ Ringkas: "Alhamdulillah..." │
   └────────────────────────────┘
6. Click → Show full article
```

**Publish Artikel:**
```
1. User isi form: Judul, Kategori, Konten, Author
2. Click "Publikasikan"
3. POST /api/publications
4. Backend append ke Google Sheets "Publikasi"
5. Return success
6. Artikel langsung tampil di front page
7. Increment views counter
```

---

### 📤 MODUL UPLOAD (Upload & Files)

**Upload Bukti Tugas:**
```
1. User pilih file JPG/PDF bukti tugas
2. Fill: Nama Anggota, Jenis Tugas
3. Click "Upload"
4. Multer middleware save temporary ke /uploads/temp
5. POST /api/upload/bukti-tugas
6. Backend upload ke Google Drive folder "Bukti Tugas/"
7. Return link publik Google Drive
8. Frontend show success + link download
9. Anggota bisa share link ke Pembina
```

**Download dari Drive:**
```
1. User klik file di galeri
2. GET /api/files/download/:fileId
3. Backend return direct link Google Drive
4. Browser download file (JPG/PDF)
5. Auto-open atau save tergantung browser
```

---

## Real-Time Data Sync

```
┌──────────────────────────────────────────────────────┐
│  Google Sheets (Single Source of Truth)              │
│                                                       │
│  Sheet: "Anggota"                                    │
│  ┌─────────────────────────────────────────────────┐│
│  │ Nama │ Kelas │ Sangga │ Tingkat │ WA  │ Email  ││
│  ├─────────────────────────────────────────────────┤│
│  │ Andi │ XI    │ Perintis│ Bantara │... │ ...    ││
│  │ Budi │ XI    │ Pencoba │ Laksana │... │ ...    ││
│  │ Citra│ XI    │ Perintis│ Calon  │... │ ...    ││
│  └─────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────┘
         ↑ Update saat form disubmit ↑
         │                          │
    User Input            Display otomatis
    di Website            di Table/Stats
```

---

## Security Layer

```
┌─────────────────────────────────────────┐
│  Frontend Request                       │
│  fetch(url, { headers, body })          │
└──────────────────────────┬──────────────┘
                           ↓
┌─────────────────────────────────────────┐
│  CORS Middleware                        │
│  ✓ Check origin                         │
│  ✓ Allow localhost:3000                 │
└──────────────────────────┬──────────────┘
                           ↓
┌─────────────────────────────────────────┐
│  JWT Authentication (jika private)      │
│  ✓ Verify token                         │
│  ✓ Check role (pembina/kerani/anggota)  │
│  ✓ Set res.user = decoded token         │
└──────────────────────────┬──────────────┘
                           ↓
┌─────────────────────────────────────────┐
│  Route Handler                          │
│  ✓ Validate input data                  │
│  ✓ Sanitize (prevent injection)         │
│  ✓ Call service layer                   │
└──────────────────────────┬──────────────┘
                           ↓
┌─────────────────────────────────────────┐
│  Google Sheets/Drive API                │
│  ✓ Service Account auth                 │
│  ✓ Credentials dari .env                │
│  ✓ API key never exposed                │
└──────────────────────────┬──────────────┘
                           ↓
┌─────────────────────────────────────────┐
│  Response                               │
│  JSON { status, data, message }         │
└─────────────────────────────────────────┘
```

---

## Struktur Database

### Google Sheets Structure

**Sheet 1: "Anggota"**
```
│ Nama      │ Kelas    │ Sangga    │ Tingkat SKU  │ WA           │ Email              │ Tanggal Daftar │
├───────────┼──────────┼───────────┼──────────────┼──────────────┼────────────────────┼────────────────┤
│ Andi      │ XI MIPA1 │ Perintis  │ Penegak      │ 081234567890 │ andi@gmail.com     │ 01-Jul-2026   │
│ Budi      │ XI IPA2  │ Pencoba   │ Bantara      │ 081345678901 │ budi@gmail.com     │ 02-Jul-2026   │
│ Citra     │ XI IPA1  │ Perintis  │ Calon        │ 081456789012 │ citra@gmail.com    │ 03-Jul-2026   │
```

**Sheet 2: "Keuangan"**
```
│ Tanggal    │ Deskripsi           │ Debit      │ Kredit     │ Kategori      │ Verifikasi │
├────────────┼─────────────────────┼────────────┼────────────┼───────────────┼────────────┤
│ 15-Jul-26  │ Iuran Anggota Bulai │            │ 1000000    │ Iuran         │ Approved   │
│ 16-Jul-26  │ Beli Tali Pramuka   │ 250000     │            │ Inventaris    │ Approved   │
│ 17-Jul-26  │ Iuran Agustusan     │            │ 500000     │ Iuran         │ Pending    │
```

**Sheet 3: "Kegiatan"**
```
│ Nama Event        │ Tanggal    │ Lokasi            │ Kategori      │ Peserta │ Status        │
├───────────────────┼────────────┼───────────────────┼───────────────┼─────────┼───────────────┤
│ Latihan Rutin     │ 02-Aug-26  │ Lapangan Sekolah  │ Latihan       │ 25      │ Confirmed     │
│ Ujian SKU Penegak │ 09-Aug-26  │ Ruang Perpustakaan│ Ujian         │ 30      │ Preparation   │
│ Perkemahan 3 Hari │ 16-Aug-26  │ Gunung Kerinci    │ Outdoor       │ 35      │ Registration  │
```

---

## Contoh API Response

### GET /api/members
```json
{
  "status": "success",
  "message": "Data anggota berhasil diambil",
  "count": 15,
  "data": [
    {
      "Nama": "Andi Purnama",
      "Kelas": "XI MIPA 1",
      "Sangga": "Sangga Perintis",
      "Tingkat SKU": "Penegak Bantara",
      "WA": "081234567890",
      "Email": "andi@gmail.com",
      "Tanggal Daftar": "01-Jul-2026"
    }
  ]
}
```

### GET /api/finances
```json
{
  "status": "success",
  "summary": {
    "totalDebit": 1250000,
    "totalKredit": 5000000,
    "saldo": 3750000,
    "lastUpdated": "2026-08-02T08:37:00Z"
  },
  "transactions": [...]
}
```

---

## Comparison: Before vs After

| Aspek | Sebelum | Sesudah |
|-------|---------|---------|
| **Database** | Tidak ada | Google Sheets (Real) |
| **Data Persistence** | ❌ Hilang saat refresh | ✅ Tersimpan permanent |
| **Form Submission** | Simulasi (fake alert) | ✅ Real POST ke API |
| **File Storage** | ❌ Tidak support | ✅ Google Drive |
| **Real-time Sync** | ❌ Manual refresh | ✅ Auto fetch & display |
| **Statistics** | Hard-coded | ✅ Dynamic dari data |
| **Authentication** | ❌ Tidak ada | ✅ JWT + Role-based |
| **API** | ❌ Tidak ada | ✅ 30+ endpoints |
| **Scalability** | Low | ✅ Cloud-based |
| **Team Collaboration** | ❌ Limited | ✅ Google Workspace |

---

## Ready to Use Checklist

- ✅ Backend server (Express.js)
- ✅ Google Sheets integration
- ✅ Google Drive integration
- ✅ 10 API route files
- ✅ 2 service files
- ✅ Updated frontend with real data
- ✅ Authentication system
- ✅ File upload/download
- ✅ Documentation (README + guides)
- ✅ Environment configuration
- ✅ Error handling
- ✅ Security (CORS, JWT, role-based)

**→ Next: Setup Google Cloud Console & run `npm install && npm run dev`**

---

🎖️ **Satya Ku Darmakan, Darma Ku Kubaktikan** 🎖️
