ENV VARS & DEPLOYMENT INSTRUCTIONS

Tujuan
- Jangan menyimpan file service account JSON di repo. Simpan sebagai environment variables di platform hosting (Netlify / Vercel) dan hapus file lokal credentials.json.

Variabel lingkungan (ENV VARS) yang diperlukan
- GOOGLE_SERVICE_ACCOUNT_JSON
  - Isi: seluruh JSON service account (paste raw JSON) atau base64-encoded JSON.
  - Contoh: paste konten file JSON service account. Jika mem-paste raw JSON, pastikan karakter newline dipertahankan.
- GOOGLE_SHEET_MEMBERS_ID
  - Isi: ID Google Spreadsheet (contoh: 1v2iUh-l3hvl4KBEDUOCsSyzwwM08Rw-wwE3Yp-S5AYM)
- GOOGLE_DRIVE_BUKTI_FOLDER
  - Isi: ID folder Google Drive untuk menyimpan bukti (contoh: dari link Drive)
- GOOGLE_DRIVE_DOCS_FOLDER (opsional)
- GOOGLE_DRIVE_GALERI_FOLDER (opsional)
- PORT (opsional untuk hosting custom)

Langkah pengaturan di Netlify
1. Login ke Netlify > Site settings > Build & deploy > Environment.
2. Tambah variable baru: "GOOGLE_SERVICE_ACCOUNT_JSON" dan paste JSON service account (atau base64 string). Tandai sebagai "Protected" jika tersedia.
3. Tambah GOOGLE_SHEET_MEMBERS_ID dan GOOGLE_DRIVE_BUKTI_FOLDER dll.
4. Redeploy site.

Langkah pengaturan di Vercel
1. Project > Settings > Environment Variables.
2. Tambah variable "GOOGLE_SERVICE_ACCOUNT_JSON" (Environment: Production, Preview, Development sesuai kebutuhan). Jika JSON mengandung newline, lebih aman gunakan base64 lalu pasang as base64; server code sudah mendukung parsing base64.
3. Tambah variabel lainnya (GOOGLE_SHEET_MEMBERS_ID, GOOGLE_DRIVE_BUKTI_FOLDER).
4. Deploy / Redeploy project.

Sharing & Permissions
- Share Google Spreadsheet dan folder Drive ke email Service Account (client_email) sebagai Editor.
- Pastikan service account memiliki akses ke folder target.

Verifikasi setelah deploy
1. Buka: https://<your-site>/api/health -> harus mengembalikan { status: 'OK', ... }
2. Coba: POST /api/members (dari UI pendaftaran) dan cek Google Sheets.
3. Coba upload file dari UI (Modul Unggah Portofolio) dan cek file muncul di Drive.

Rekomendasi keamanan
- Hapus server/credentials.json dari disk dan jangan commit file tersebut.
- Jika repo pernah mengandung credentials.json, gunakan alat untuk menghapus history git (git filter-repo / BFG) sebelum publikasi.

Jika ingin, saya bisa membantu membuat skrip kecil untuk menghapus file dari git history (butuh repo git).