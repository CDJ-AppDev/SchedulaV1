const API_BASE = window.APP_CONFIG ? window.APP_CONFIG.API_BASE : 'http://localhost:3000/api';
const token = localStorage.getItem('token');
const value = id => document.getElementById(id).value.trim();

document.getElementById('setup-btn').addEventListener('click', async () => {
  if (!token) { window.location.href = 'login.html'; return; }
  const display_name = value('display-name'); const timezone = value('timezone'); const locale = value('locale');
  if (!display_name || !timezone || !locale) { alert('Display name, timezone, and locale are required.'); return; }
  try {
    const response = await fetch(`${API_BASE}/user/profile`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ display_name, timezone, locale }) });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Setup failed');
    window.location.href = './home.html';
  } catch (error) { alert(error.message); }
});
