Panduan singkat: base64-encode service account JSON + CI/CD

1) Encode service account (Linux / macOS)
   base64 service-account.json | tr -d '\n' > service-account.json.base64

   PowerShell (Windows):
   # from PS prompt
   $raw = Get-Content -Raw -Path .\service-account.json; [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($raw)) | Set-Content -NoNewline .\service-account.json.base64

2) Set secret in GitHub (CLI) - recommended
   gh secret set GOOGLE_SERVICE_ACCOUNT_JSON --body "$(cat service-account.json.base64)"
   gh secret set GOOGLE_SHEET_MEMBERS_ID --body "<sheetId>"
   gh secret set GOOGLE_DRIVE_BUKTI_FOLDER --body "<folderId>"

3) Vercel (CLI) - set env var (base64 safe)
   vercel env add GOOGLE_SERVICE_ACCOUNT_JSON production
   # when prompted, paste the base64 string

4) Netlify (CLI)
   netlify env:set GOOGLE_SERVICE_ACCOUNT_JSON "$(cat service-account.json.base64)"

5) GitHub Actions
   - Example workflow created: .github/workflows/deploy-with-secrets.yml
   - Workflow reads the secret as-is (base64 OR raw JSON) and server code already supports parsing both.

6) Local test
   - Export env locally (bash):
       export GOOGLE_SERVICE_ACCOUNT_JSON="$(cat service-account.json.base64)"
     then run:
       node scripts/decode-sa.js
     or to write a temporary credentials file:
       node scripts/decode-sa.js --write

7) Security notes
   - Store secret only in CI/CD provider secret store (not repo). Limit access to repos/admins.
   - Rotate the service account key if leaked. Remove any local credentials.json files and purge git history if previously committed.

Butuh integrasi contoh untuk Vercel/Netlify deploy steps? Reply "Ya" untuk saya tambahkan contoh deploy step.