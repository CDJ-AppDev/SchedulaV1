const authHeaders = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` });
const escapeValue = value => window.APP_UTILS?.escapeHtml ? window.APP_UTILS.escapeHtml(value) : String(value ?? '');

async function adminRequest(path, options = {}) {
  const response = await fetch(`${API_BASE}/admin${path}`, { ...options, headers: { ...authHeaders(), ...(options.headers || {}) } });
  const data = response.status === 204 ? null : await response.json();
  if (!response.ok) throw new Error(data?.error || 'Admin request failed');
  return data;
}

function renderUsers(users) {
  document.getElementById('users-tbody').innerHTML = users.map(user => `<tr><td>${escapeValue(user.id)}</td><td>${escapeValue(user.display_name || '')}</td><td>${escapeValue(user.email)}</td><td>${escapeValue(user.platform_role)}</td><td>${user.created_at ? new Date(user.created_at).toLocaleString() : ''}</td><td><button class="btn-action delete-btn" data-user-id="${escapeValue(user.id)}">Delete</button></td></tr>`).join('');
}

function renderSchedules(schedules) {
  document.getElementById('schedules-tbody').innerHTML = schedules.map(schedule => `<tr><td>${escapeValue(schedule.id)}</td><td>${escapeValue(schedule.owner_email)}</td><td>${escapeValue(schedule.title)}</td><td>${schedule.event_count}</td><td>${schedule.updated_at ? new Date(schedule.updated_at).toLocaleString() : ''}</td><td><button class="btn-action delete-btn" data-schedule-id="${escapeValue(schedule.id)}">Delete</button></td></tr>`).join('');
}

async function loadUsers() { renderUsers(await adminRequest('/users')); }
async function loadSchedules() { renderSchedules(await adminRequest('/schedules')); }

function openModal() { document.getElementById('admin-modal').classList.add('active'); }
function closeModal() { document.getElementById('admin-modal').classList.remove('active'); }

document.querySelectorAll('.admin-tab').forEach(tab => tab.addEventListener('click', async () => { document.querySelectorAll('.admin-tab').forEach(item => item.classList.remove('active')); document.querySelectorAll('.admin-content').forEach(item => item.classList.remove('active')); tab.classList.add('active'); document.getElementById(`${tab.dataset.tab}-tab`).classList.add('active'); if (tab.dataset.tab === 'schedules') await loadSchedules(); }));
document.getElementById('create-user-btn').addEventListener('click', openModal);
document.getElementById('close-modal').addEventListener('click', closeModal);
document.getElementById('user-form').addEventListener('submit', async event => { event.preventDefault(); try { await adminRequest('/users', { method: 'POST', body: JSON.stringify({ email: document.getElementById('user-email').value, password: document.getElementById('user-password').value, display_name: document.getElementById('user-name').value, platform_role: document.getElementById('user-role').value }) }); closeModal(); event.target.reset(); await loadUsers(); } catch (error) { alert(error.message); } });
document.addEventListener('click', event => { const userButton = event.target.closest('[data-user-id]'); const scheduleButton = event.target.closest('[data-schedule-id]'); if (userButton) { confirmPopup('Delete this user? This cannot be undone.', async () => { try { await adminRequest(`/users/${userButton.dataset.userId}`, { method: 'DELETE' }); await loadUsers(); } catch (error) { alert(error.message); } }, null, 'Delete user', 'error'); } if (scheduleButton) { confirmPopup('Delete this schedule? This cannot be undone.', async () => { try { await adminRequest(`/schedules/${scheduleButton.dataset.scheduleId}`, { method: 'DELETE' }); await loadSchedules(); } catch (error) { alert(error.message); } }, null, 'Delete schedule', 'error'); } });

document.addEventListener('DOMContentLoaded', async () => { if (!getToken()) { redirectWithToken('../pages/login.html'); return; } try { await loadUsers(); } catch (error) { document.getElementById('users-tbody').innerHTML = `<tr><td colspan="6">${escapeValue(error.message)}</td></tr>`; } });
