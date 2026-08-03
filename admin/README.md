Admin — Quick README

Lokasi: /admin/index.html (akses via https://<NETLIFY_SITE>/admin/)

Akses (Demo - JANGAN PAKAI DI PRODUKSI):
- Username: admin@example.com
- Password: Admin#2026

Catatan:
- Setelah login, token JWT disimpan di localStorage dengan kunci "admin_token".
- README ini hanya untuk testing lokal/deploy awal. Ganti kredensial demo ini pada backend (mis. routes/auth) atau atur mekanisme akun yang aman.
- Pastikan Netlify mengarahkan /api ke backend Railway (netlify.toml sudah men-setup proxy). Jika login gagal, cek endpoint /api/auth/ dan variabel CORS di backend.

Keamanan rekomendasi:
1) Jangan commit kredensial nyata ke repo.
2) Gunakan akun admin yang aman dan atur password lewat backend/DB atau OAuth.
3) Gunakan HTTPS dan set ALLOWED_ORIGINS di backend ke origin Netlify.
