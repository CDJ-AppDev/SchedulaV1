/** Generic profile, preference, and availability controls. */
const token = () => localStorage.getItem('token');
const headers = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` });
const get = id => document.getElementById(id);

async function api(url, options = {}) {
  const response = await fetch(`${API_BASE}${url}`, { ...options, headers: { ...headers(), ...(options.headers || {}) } });
  const data = response.status === 204 ? null : await response.json();
  if (!response.ok) throw new Error(data?.error || 'Request failed');
  return data;
}

function formatDate(value) { const date = new Date(value); return Number.isNaN(date.getTime()) ? value : date.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }); }
function message(text, error = false) { const target = get('availability-list'); if (target) { target.dataset.message = text; target.classList.toggle('text-error-center', error); } }

async function loadProfile() {
  const data = await api('/user-session');
  get('profile-display-name').value = data.name || '';
  get('profile-email').value = data.email || '';
  get('profile-timezone').value = data.timezone || 'UTC';
  get('profile-locale').value = data.locale || 'en-US';
}

async function loadPreferences() {
  const data = await api('/preferences');
  get('preference-modality').value = data.modality_preference || '';
  get('preference-buffer').value = data.buffer_minutes ?? 15;
  get('preference-view').value = data.default_view || '';
}

async function loadAvailability() {
  const blocks = await api('/availability'); const list = get('availability-list'); list.innerHTML = '';
  blocks.forEach(block => { const row = document.createElement('div'); row.className = 'profile-info-row-col'; row.innerHTML = `<span>${block.availability_type}: ${formatDate(block.start_at)} - ${formatDate(block.end_at)}${block.label ? ` | ${window.APP_UTILS.escapeHtml(block.label)}` : ''}</span><button class="btn-remove" type="button" data-availability-id="${block.id}"><img src="../assets/delete.png" alt="" class="btn-icon"> Remove</button>`; list.appendChild(row); });
}

get('save-profile-btn').addEventListener('click', async () => { try { await api('/user/profile', { method: 'PUT', body: JSON.stringify({ display_name: get('profile-display-name').value.trim(), email: get('profile-email').value.trim(), password: get('profile-password').value, timezone: get('profile-timezone').value.trim(), locale: get('profile-locale').value.trim() }) }); get('profile-password').value = ''; alert('Profile saved.'); } catch (error) { alert(error.message); } });
get('save-preferences-btn').addEventListener('click', async () => { try { await api('/preferences', { method: 'PUT', body: JSON.stringify({ modality_preference: get('preference-modality').value || null, buffer_minutes: Number(get('preference-buffer').value) || 0, default_view: get('preference-view').value.trim() || null }) }); alert('Preferences saved.'); } catch (error) { alert(error.message); } });
get('add-availability-btn').addEventListener('click', async () => { const start = get('availability-start').value; const end = get('availability-end').value; if (!start || !end || new Date(end) <= new Date(start)) return message('Enter a valid availability range.', true); try { await api('/availability', { method: 'POST', body: JSON.stringify({ start_at: new Date(start).toISOString(), end_at: new Date(end).toISOString(), timezone: get('profile-timezone').value || 'UTC', availability_type: get('availability-type').value, label: get('availability-label').value.trim() || null }) }); get('availability-label').value = ''; await loadAvailability(); } catch (error) { message(error.message, true); } });
get('availability-list').addEventListener('click', async event => { const button = event.target.closest('[data-availability-id]'); if (!button) return; try { await api(`/availability/${button.dataset.availabilityId}`, { method: 'DELETE' }); await loadAvailability(); } catch (error) { message(error.message, true); } });
get('delete-account-btn').addEventListener('click', () => { confirmPopup('Delete your account and schedules? This cannot be undone.', async () => { try { await api('/user/profile', { method: 'DELETE' }); localStorage.clear(); window.location.href = '../index.html'; } catch (error) { alert(error.message); } }, null, 'Delete account', 'error'); });

document.addEventListener('DOMContentLoaded', async () => { if (!token()) { window.location.href = 'login.html'; return; } try { await Promise.all([loadProfile(), loadPreferences(), loadAvailability()]); } catch (error) { message(error.message, true); } });
