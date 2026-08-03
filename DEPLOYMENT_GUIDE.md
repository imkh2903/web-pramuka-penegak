# 🚀 Panduan Deployment Backend & Frontend (Production)

Dokumen ini menjelaskan cara deploy backend ke production dan menghubungkan frontend (Netlify) agar menampilkan data riil dari Google Sheets.

---

## 📋 Ringkasan Masalah Saat Ini
- ✅ Frontend di-deploy ke Netlify (hanya HTML/CSS/JS)
- ❌ Backend tidak ter-deploy (hanya berjalan lokal di localhost:3000)
- ❌ Frontend di Netlify tidak bisa connect ke backend lokal (CORS + network isolation)
- ❌ Data di Google Sheets tidak tampil di web production

## ✅ Solusi: Deploy Backend ke Cloud Gratis

Ada 3 pilihan platform gratis:
1. **Railway** (rekomendasi) — mudah, auto-deploy dari GitHub
2. **Render** — gratis, ramah untuk Node.js
3. **Heroku** — premium ($7/bulan sekarang), tapi support baik

### Pilihan 1: Deploy ke Railway (Rekomendasi)

#### Step 1: Setup GitHub Repository (jika belum ada)
```bash
cd /path/to/web-pramuka-penegak-comprehensive
git init
git add .
git commit -m "Initial commit: backend + frontend setup"
git remote add origin https://github.com/YOUR_USERNAME/web-pramuka-penegak.git
git push -u origin main
```

#### Step 2: Siapkan File Konfigurasi Production
- Pastikan `.env.example` sudah ada
- Update `.gitignore` agar jangan include `server/credentials.json` (⚠️ sensitif!)

#### Step 3: Deploy ke Railway
1. Buka https://railway.app
2. Sign up dengan GitHub
3. Klik "New Project" → "Deploy from GitHub repo"
4. Pilih repository `web-pramuka-penegak`
5. Railway akan auto-detect Node.js app
6. Set environment variables di Railway dashboard:
   ```
   GOOGLE_SERVICE_ACCOUNT_JSON=<paste isi credentials.json>
   GOOGLE_SHEET_MEMBERS_ID=1v2iUh-l3hvl4KBEDUOCsSyzwwM08Rw-wwE3Yp-S5AYM
   JWT_SECRET=<generate random string, misal: $(openssl rand -base64 32)>
   NODE_ENV=production
   PORT=5000
   ```
7. Deploy akan otomatis berjalan. URL production akan berupa: `https://<project-name>-prod.up.railway.app`
8. Copy URL production untuk step berikutnya

#### Step 4: Update Frontend untuk Connect ke Backend Production
Di file `js/config.js` (buat baru jika belum ada):
```javascript
// js/config.js
const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://<railway-backend-url>'  // contoh: https://gudep-portal-prod.up.railway.app
  : 'http://localhost:3000';

console.log('API URL:', API_BASE_URL);
```

Kemudian di setiap file HTML yang fetch data, ubah:
**Dari:**
```javascript
fetch('http://localhost:3000/api/members')
```

**Menjadi:**
```javascript
const API_BASE = 'https://<railway-backend-url>';
fetch(API_BASE + '/api/members')
```

#### Step 5: Deploy Frontend ke Netlify (Update)
1. Di Netlify, tambah build environment variables:
   - `REACT_APP_API_URL` = `https://<railway-backend-url>`
2. Commit perubahan ke GitHub
3. Netlify auto-redeploy

#### Step 6: Verifikasi Koneksi
1. Buka https://hilarious-cascaron-65e0f7.netlify.app (frontend)
2. Buka browser DevTools (F12) → Network tab
3. Klik tombol (misal "Login" atau "Keanggotaan")
4. Periksa XHR request ke backend URL production
5. Seharusnya sukses 200 atau 401 (auth failed), bukan 404/CORS error

---

### Pilihan 2: Deploy ke Render (Alternatif)

1. Buka https://render.com
2. Klik "New +" → "Web Service"
3. Hubungkan GitHub repository
4. Isi form:
   - Name: `gudep-penegak-backend`
   - Build command: `npm install`
   - Start command: `npm start`
   - Environment: Node
5. Add environment variables (sama seperti Railway)
6. Deploy

Render akan memberikan URL: `https://gudep-penegak-backend.onrender.com`

---

## 🔐 Keamanan Deployment

### A. Jangan Commit Credentials!
File `.gitignore` harus include:
```gitignore
server/credentials.json
.env
node_modules
logs/
```

### B. Gunakan Environment Variables untuk Secrets
- Jangan hardcode JWT_SECRET atau credentials
- Setiap platform (Railway/Render) punya dashboard untuk set env vars
- Gunakan `GOOGLE_SERVICE_ACCOUNT_JSON` env var (isi credentials.json di sini)

### C. CORS Configuration
Di `server/server.js`, pastikan CORS sudah setup:
```javascript
app.use(cors({
  origin: [
    'https://hilarious-cascaron-65e0f7.netlify.app',
    'https://gudep-penegak-backend.onrender.com',
    'http://localhost:3000',
    'http://localhost:3001'
  ],
  credentials: true
}));
```

---

## 📡 Testing Backend Production

### Test 1: Health Check
```bash
curl https://<backend-url>/api/health
```
Expected response:
```json
{ "status": "OK", "timestamp": "...", "message": "Pramuka Penegak Portal is running" }
```

### Test 2: Login
```bash
curl -X POST https://<backend-url>/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@pramuka.id","password":"admin123"}'
```

### Test 3: Fetch Members (dengan token)
```bash
curl https://<backend-url>/api/members \
  -H "Authorization: Bearer <TOKEN_DARI_LOGIN>"
```

### Test 4: Check Google Sheets Connection
Lihat logs di Railway/Render dashboard. Harus muncul baris seperti:
```
✅ Berhasil terhubung ke Google Sheets!
✅ Judul Dokumen: Database Pramuka Penegak
Daftar Tab: Anggota, Keuangan, Kegiatan, Publikasi
```

---

## 🐛 Debugging Deployment

### Masalah 1: "Cannot find module 'express'"
**Solusi:** Platform lupa jalankan `npm install`. Pastikan `package.json` ada di root repo.

### Masalah 2: CORS error di frontend
**Solusi:** Tambahkan frontend URL ke CORS whitelist di server.js dan re-deploy backend.

### Masalah 3: "Invalid credentials" saat sync Google Sheets
**Solusi:** 
- Periksa GOOGLE_SERVICE_ACCOUNT_JSON env var (harus valid JSON)
- Pastikan service account sudah di-Share sebagai Editor ke Google Sheet
- Periksa Google Sheets & Drive APIs enabled di GCP

### Masalah 4: Blank page di production
**Solusi:**
- Buka DevTools (F12) → Console tab
- Cari error messages
- Kemungkinan: API URL salah, fetch failed, atau config.js tidak load

---

## 📝 Checklist Deployment

- [ ] Repo di GitHub sudah public (atau private dengan access Railway)
- [ ] `.env.example` sudah lengkap
- [ ] `.gitignore` protect credentials.json
- [ ] CORS config di server.js include frontend domain
- [ ] Environment variables set di Railway/Render (GOOGLE_SERVICE_ACCOUNT_JSON, JWT_SECRET, etc)
- [ ] Backend test: curl health check → 200 OK
- [ ] Backend test: curl login → 200 OK + token
- [ ] Backend test: curl members dengan token → 200 OK
- [ ] Backend logs menunjukkan "✅ Berhasil terhubung ke Google Sheets"
- [ ] Frontend update API_BASE_URL ke production backend
- [ ] Frontend re-deploy ke Netlify
- [ ] Frontend test: klik tombol login/keanggotaan → XHR ke backend production OK
- [ ] Data Google Sheets tampil di frontend production

---

## 🎯 Next Steps

1. **Pilih platform**: Railway (recommended) atau Render
2. **Push ke GitHub**: `git push`
3. **Deploy**: Follow step-by-step Railway/Render setup
4. **Update frontend** dengan production backend URL
5. **Test end-to-end** dari https://hilarious-cascaron-65e0f7.netlify.app
6. **Monitor logs** di Railway/Render dashboard

Jika ada error, bagikan **error message lengkap** dari platform logs, saya bantu debug.

---

## 📞 Support & FAQ

**Q: Berapa biaya deployment?**
A: Railway & Render gratis untuk tier awal. Railway $5/bulan untuk upgrade, Render similar.

**Q: Bisa pakai Heroku?**
A: Bisa, tapi Heroku sekarang non-free ($7+/month). Railway/Render lebih value.

**Q: Berapa lama deploy?**
A: ~2-5 menit untuk push repo dan auto-deploy.

**Q: Perlu mengubah kode?**
A: Minimal: hanya update API_BASE_URL di frontend + environment variables di backend.

---

Siap? Mulai dari Step 1: Setup GitHub repo, atau sudah punya?
