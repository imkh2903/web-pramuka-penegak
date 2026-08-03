# Panduan Penggunaan & Sinkronisasi Data (Pramuka Penegak Portal)

Dokumen ini menjelaskan langkah-langkah penggunaan aplikasi web agar menampilkan data riil dari API, contoh payload, cara melakukan `Sync from Sheet`, dan petunjuk membuat PDF dari dokumen Markdown.

> Catatan: Semua perintah contoh menggunakan environment development di http://localhost:3000

---

## Daftar Isi
- Prasyarat
- Cara kerja sinkronisasi
- Endpoint `Sync from Sheet`
- Cara menggunakan dari Web (UI)
- Contoh payload (curl)
- Debugging umum
- Menyertakan Screenshots (placeholder)
- Konversi Markdown -> PDF

---

## Prasyarat
- Server backend berjalan (npm run dev)
- GOOGLE_SHEET_MEMBERS_ID terisi di .env atau environment
- Service account credentials tersedia (server/credentials.json atau env GOOGLE_SERVICE_ACCOUNT_JSON)
- Anda memiliki peran Admin untuk memicu sinkronisasi

## Cara kerja sinkronisasi
1. Endpoint `POST /api/sync/sheets` memaksa server untuk:
   - Menghubungi Google Sheets dengan service account
   - Memuat metadata dokumen (judul, sheet tabs)
   - Membaca sheet utama (Anggota) dan menyimpan cache di server/data/members_cache.json
   - Menyimpan metadata terakhir di server/data/last_sync.json
2. Frontend harus memanggil endpoint ini ketika pengguna menekan tombol "Sync from Sheet".
3. Setelah sinkron selesai, frontend melakukan fetch ulang (re-fetch) terhadap resource yang terkait (mis. GET /api/members).

## Endpoint: Sync from Sheet
- URL: `POST /api/sync/sheets`
- Method: POST
- Auth: Bearer JWT (role: Admin) atau header `x-user-role: Admin` di development
- Response sukses:
```json
{
  "status": "success",
  "message": "Sync completed",
  "meta": {
    "timestamp": "2026-08-03T05:00:00.000Z",
    "sheetId": "...",
    "titles": ["Anggota","Keuangan", "Kegiatan"],
    "anggotaCount": 123
  }
}
```

- Error contoh:
```json
{ "status":"error", "message":"Failed to sync from Google Sheets", "error":"No local credentials.json found" }
```

- Metadata terakhir: `GET /api/sync/last` (Admin)

## Cara Menggunakan dari Web (UI)
1. Login sebagai Admin di UI, dapatkan JWT.
2. Tambahkan tombol di halaman admin: "Sync from Sheet".
3. Tindakan tombol: kirim POST ke `/api/sync/sheets` dengan header Authorization: `Bearer <TOKEN>`.
4. Setelah menerima status success, jalankan re-fetch untuk menampilkan data terbaru:
   - GET /api/members
   - GET /api/finances
   - GET /api/activities
5. Tampilkan notifikasi kepada pengguna: "Sinkronisasi selesai. Ditemukan X anggota."

## Contoh payload & curl
- Login (dapat token):
```bash
curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@pramuka.id","password":"admin123"}'
```

- Memanggil Sync (gunakan TOKEN dari login):
```bash
curl -s -X POST http://localhost:3000/api/sync/sheets \
  -H "Authorization: Bearer <TOKEN>"
```

- Setelah sukses, ambil members:
```bash
curl -s http://localhost:3000/api/members -H "Authorization: Bearer <TOKEN>"
```

- Menambah anggota contoh:
```bash
curl -X POST http://localhost:3000/api/members \
 -H "Content-Type: application/json" \
 -H "Authorization: Bearer <TOKEN>" \
 -d '{"nama":"Budi", "nomor_induk":"PR-001", "email":"budi@pramuka.id","telepon":"0812xxxx","asal":"Ambalan X","peran":"Anggota"}'
```

## Debugging umum
- Jika mendapat 401/403: periksa token JWT dan role user.
- Jika mendapat error sinkron: periksa file server/data/last_sync.json dan server logs.
- Jika Sheets gagal: periksa bahwa service account sudah di-Share sebagai Editor ke Google Sheet.
- Untuk 404 pada route: periksa method (GET vs POST) dan cek log saat server start yang menunjukkan mounting route.

## Menyertakan Screenshots
- Simpan screenshot di folder `docs/images/` dengan nama jelas, misalnya `docs/images/sync-button.png`.
- Di file ini, sisipkan markdown gambar:

```
![Sync button](images/sync-button.png)
```

(placeholders sudah disediakan — tambahkan gambar secara manual lalu commit)

## Konversi Markdown -> PDF
- Dengan pandoc (jika terinstall):
```bash
pandoc docs/USER_GUIDE_SYNC_AND_API.md -o docs/USER_GUIDE_SYNC_AND_API.pdf
```
- Atau buka file MD di VSCode dan pilih "Export to PDF" dari menu Print/Export.

---

Jika ingin, saya bisa juga:
- Membuat contoh tombol UI (React component) yang memanggil endpoint sync dan melakukan re-fetch.
- Menambahkan endpoint server yang juga men-trigger reload cache untuk resources lain.

Sebutkan apakah mau contoh React button sekarang atau langsung saya tambahkan contoh di repo.