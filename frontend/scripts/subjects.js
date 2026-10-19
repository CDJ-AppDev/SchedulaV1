/** Generic schedule builder backed by the schedules/events API. */
const eventsList = document.getElementById('scheduledList');
const scheduleSelector = document.getElementById('schedule-selector');
const scheduleNameInput = document.getElementById('schedule-name-input');
const addEventButton = document.getElementById('add-event-btn');
const saveScheduleButton = document.getElementById('save-schedule-btn');
const deleteScheduleButton = document.getElementById('delete-schedule-btn');
const builderMessage = document.getElementById('builder-message');

let schedules = [];
let activeScheduleId = 'new';
let events = [];

function tokenHeaders() {
  return { Authorization: `Bearer ${localStorage.getItem('token')}` };
}

function setMessage(message, isError = false) {
  if (!builderMessage) return;
  builderMessage.textContent = message;
  builderMessage.classList.toggle('text-error-center', isError);
}

function eventFromForm() {
  const value = id => document.getElementById(id)?.value.trim() || null;
  return {
    title: value('event-title'), start_at: value('event-start'), end_at: value('event-end'), timezone: value('event-timezone') || 'UTC',
    description: value('event-description'), location: value('event-location'), modality: value('event-modality'), category: value('event-category'),
    priority: value('event-priority') ? Number(value('event-priority')) : null, status: value('event-status'), recurrence_rule: value('event-recurrence-rule'),
    reminder_offset_minutes: value('event-reminder') ? Number(value('event-reminder')) : null, notes: value('event-notes'), color: document.getElementById('event-color')?.value || null
  };
}

function clearEventForm() {
  ['event-title', 'event-start', 'event-end', 'event-description', 'event-location', 'event-category', 'event-priority', 'event-status', 'event-recurrence-rule', 'event-reminder', 'event-notes'].forEach(id => { const input = document.getElementById(id); if (input) input.value = ''; });
  document.getElementById('event-timezone').value = 'UTC';
  document.getElementById('event-modality').value = '';
}

function formatEventTime(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
}

function renderEvents() {
  eventsList.innerHTML = '';
  if (!events.length) { eventsList.innerHTML = '<p class="text-muted-light">No events added yet.</p>'; return; }
  const esc = window.APP_UTILS?.escapeHtml || (value => String(value ?? ''));
  events.forEach((event, index) => {
    const card = document.createElement('article');
    card.className = 'event-card';
    card.style.borderLeftColor = event.color || 'var(--accent)';
    card.innerHTML = `<div class="event-card-body card-body-flex"><div><h3 class="card-title-sm">${esc(event.title)}</h3><p class="card-text-main">${esc(formatEventTime(event.start_at))} - ${esc(formatEventTime(event.end_at))}</p><p class="card-text-sub">${esc(event.location || event.category || event.timezone || '')}</p></div><button class="btn-remove btn-remove-inline" type="button" data-event-key="${esc(event.id || `new-${index}`)}"><img src="../assets/delete.png" alt="" class="btn-icon"> REMOVE</button></div>`;
    eventsList.appendChild(card);
  });
}

async function requestJson(url, options = {}) {
  const response = await fetch(`${API_BASE}${url}`, { ...options, headers: { 'Content-Type': 'application/json', ...tokenHeaders(), ...(options.headers || {}) } });
  const data = response.status === 204 ? null : await response.json();
  if (!response.ok) throw new Error(data?.error || 'Request failed');
  return data;
}

function selectSchedule(id) {
  activeScheduleId = id;
  const selected = schedules.find(schedule => schedule.id === id);
  events = selected?.events || [];
  scheduleNameInput.value = selected?.title || 'My schedule';
  deleteScheduleButton.style.display = selected ? 'inline-flex' : 'none';
  renderEvents();
}

async function loadSchedules() {
  schedules = await requestJson('/schedules');
  scheduleSelector.innerHTML = '<option value="new">+ Create new schedule</option>';
  schedules.forEach(schedule => { const option = document.createElement('option'); option.value = schedule.id; option.textContent = schedule.title; scheduleSelector.appendChild(option); });
  if (activeScheduleId !== 'new' && schedules.some(schedule => schedule.id === activeScheduleId)) scheduleSelector.value = activeScheduleId;
  else if (schedules.length) { activeScheduleId = schedules[0].id; scheduleSelector.value = activeScheduleId; }
  selectSchedule(activeScheduleId);
}

async function addEvent() {
  const event = eventFromForm();
  if (!event.title || !event.start_at || !event.end_at) { alert('Title, start, and end are required.', 'Event details required'); return; }
  if (new Date(event.end_at) <= new Date(event.start_at)) { alert('End must be later than start.', 'Invalid event time'); return; }
  try {
    if (activeScheduleId !== 'new') {
      const start = encodeURIComponent(new Date(event.start_at).toISOString());
      const end = encodeURIComponent(new Date(event.end_at).toISOString());
      const conflicts = await requestJson(`/events/conflicts?start_at=${start}&end_at=${end}&schedule_id=${encodeURIComponent(activeScheduleId)}`);
      if (conflicts.length) return setMessage(`This event overlaps ${conflicts[0].title}.`, true);
    }
    events.push(event); renderEvents(); clearEventForm(); setMessage('Event added. Save the schedule to sync it.');
  } catch (error) { setMessage(error.message, true); }
}

async function saveSchedule() {
  if (!events.length) {
    alert('Add at least one event before saving.', 'Schedule is empty');
    return;
  }
  try {
    let scheduleId = activeScheduleId;
    if (scheduleId === 'new') scheduleId = (await requestJson('/schedules', { method: 'POST', body: JSON.stringify({ title: scheduleNameInput.value.trim() || 'My schedule' }) })).id;
    else await requestJson(`/schedules/${scheduleId}`, { method: 'PUT', body: JSON.stringify({ title: scheduleNameInput.value.trim() || 'My schedule' }) });
    for (const event of events) {
      const saved = await requestJson(event.id ? `/events/${event.id}` : `/schedules/${scheduleId}/events`, { method: event.id ? 'PUT' : 'POST', body: JSON.stringify({ ...event, start_at: new Date(event.start_at).toISOString(), end_at: new Date(event.end_at).toISOString() }) });
      if (!event.id) event.id = saved.id;
    }
    activeScheduleId = scheduleId;
    await loadSchedules();
    successPopup('Schedule saved successfully.', 'Schedule saved');
  } catch (error) { setMessage(error.message, true); }
}

scheduleSelector.addEventListener('change', event => selectSchedule(event.target.value));
addEventButton.addEventListener('click', addEvent);
saveScheduleButton.addEventListener('click', saveSchedule);
eventsList.addEventListener('click', async event => {
  const button = event.target.closest('[data-event-key]'); if (!button) return;
  const eventKey = button.dataset.eventKey; const eventId = eventKey.startsWith('new-') ? null : eventKey; const index = eventId ? events.findIndex(item => item.id === eventId) : Number(eventKey.slice(4));
  const remove = async () => {
    if (eventId) await requestJson(`/events/${eventId}`, { method: 'DELETE' });
    if (index >= 0) events.splice(index, 1);
    renderEvents();
  };
  confirmPopup(`Remove <strong>${window.APP_UTILS.escapeHtml(events[index]?.title || 'this event')}</strong> from the schedule?`, remove, null, 'Remove event', 'warning');
});
deleteScheduleButton.addEventListener('click', async () => {
  if (activeScheduleId === 'new') return;
  confirmPopup('Delete this schedule and its events? This cannot be undone.', async () => {
    await requestJson(`/schedules/${activeScheduleId}`, { method: 'DELETE' });
    activeScheduleId = 'new';
    await loadSchedules();
  }, null, 'Delete schedule', 'error');
});

document.addEventListener('DOMContentLoaded', async () => {
  if (!localStorage.getItem('token')) { window.location.href = 'login.html'; return; }
  try { await loadSchedules(); } catch (error) { setMessage(error.message, true); }
});
