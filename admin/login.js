// Simple admin login logic: POST to /api/auth/login, store token, redirect to dashboard.html
document.addEventListener('DOMContentLoaded', function(){
  const form = document.getElementById('loginForm');
  const errorEl = document.getElementById('error');
  form.addEventListener('submit', async function(e){
    e.preventDefault();
    errorEl.textContent = '';
    const email = form.email.value.trim();
    const password = form.password.value;
    if(!email || !password){ errorEl.textContent = 'Masukkan email dan password.'; return }
    try{
      const resp = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if(!resp.ok){
        const txt = await resp.text();
        throw new Error(txt || 'Login gagal');
      }
      const data = await resp.json();
      if(!data || !data.token) throw new Error('Respons tidak berisi token.');
      localStorage.setItem('admin_token', data.token);
      // Redirect to dashboard (adjust path if needed)
      window.location.href = 'dashboard.html';
    }catch(err){
      console.error(err);
      errorEl.textContent = 'Login gagal: ' + (err.message || 'Kesalahan jaringan');
    }
  });
});