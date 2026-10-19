/** Renders generic schedule events and exports the timetable as PNG. */
document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('token');
  if (!token) { window.location.href = 'login.html'; return; }

  const list = document.getElementById('plotter-schedule-list');
  const generateButton = document.getElementById('btn-generate');
  const saveButton = document.getElementById('btn-save-png');
  const blocks = document.getElementById('blocks-container');
  const hideDetails = document.getElementById('hide-prof');
  const hideCategory = document.getElementById('hide-code');
  const hideTitle = document.getElementById('hide-name');
  const hideTime = document.getElementById('hide-time');
  const hideDay = document.getElementById('hide-day');
  const hideLocation = document.getElementById('hide-location');
  const colorInput = document.getElementById('custom-color');
  const fontColorInput = document.getElementById('custom-font-color');
  let schedules = [];
  let selectedSchedule = null;

  async function loadSchedules() {
    const response = await fetch(`${API_BASE}/schedules`, { headers: { Authorization: `Bearer ${token}` } });
    if (!response.ok) throw new Error('Failed to load schedules');
    schedules = await response.json();
    renderScheduleList();
  }

  function renderScheduleList() {
    list.innerHTML = '';
    if (!schedules.length) { list.innerHTML = '<div class="plotter-schedule-item"><span>No schedules found.</span></div>'; return; }
    schedules.forEach(schedule => {
      const item = document.createElement('div'); item.className = 'plotter-schedule-item';
      const name = document.createElement('span'); name.textContent = schedule.title;
      const button = document.createElement('button'); button.className = 'btn-select'; button.textContent = 'SELECT';
      button.addEventListener('click', () => { selectedSchedule = schedule; document.querySelectorAll('.plotter-schedule-item .btn-select').forEach(node => { node.classList.remove('selected'); node.textContent = 'SELECT'; }); button.classList.add('selected'); button.textContent = 'SELECTED'; });
      item.append(name, button); list.appendChild(item);
    });
  }

  function parseTime(value) { return window.APP_UTILS?.timeStringToMinutes(value) ?? null; }
  function dayIndex(value) { return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].indexOf(value); }

  function plotEvent(event, bgColor, fontColor) {
    const start = new Date(event.start_at); const end = new Date(event.end_at);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return;
    const day = start.toLocaleDateString('en-US', { weekday: 'long', timeZone: event.timezone || 'UTC' });
    const startTime = start.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', timeZone: event.timezone || 'UTC' });
    const endTime = end.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', timeZone: event.timezone || 'UTC' });
    const startMinutes = parseTime(startTime); const endMinutes = parseTime(endTime); const dayStart = 7 * 60;
    if (startMinutes === null || endMinutes === null || endMinutes <= startMinutes || startMinutes < dayStart) return;
    const column = dayIndex(day); if (column < 1 || column > 6) return;
    const block = document.createElement('article'); block.className = 'event-block';
    block.style.top = `${startMinutes - dayStart}px`; block.style.height = `${endMinutes - startMinutes}px`; block.style.left = `${(column - 1) * (100 / 6)}%`; block.style.width = `${100 / 6}%`; block.style.backgroundColor = event.color || bgColor; block.style.color = fontColor; block.style.border = `2px solid ${fontColor}`;
    if (!hideCategory.checked && event.category) { const category = document.createElement('div'); category.className = 'subject-code'; category.textContent = event.category; block.appendChild(category); }
    if (!hideTitle.checked) { const title = document.createElement('div'); title.className = 'subject-name'; title.textContent = event.title || 'Untitled event'; block.appendChild(title); }
    if (!hideDetails.checked && (event.description || event.modality)) { const details = document.createElement('div'); details.className = 'prof-name'; details.textContent = [event.description, event.modality].filter(Boolean).join(' | '); block.appendChild(details); }
    if (!hideDay.checked || !hideLocation.checked) { const metadata = document.createElement('div'); metadata.className = 'day-room-text'; metadata.textContent = [hideDay.checked ? '' : day, hideLocation.checked ? '' : event.location].filter(Boolean).join(' | '); block.appendChild(metadata); }
    if (!hideTime.checked) { const time = document.createElement('div'); time.className = 'time-text'; time.textContent = `${startTime} - ${endTime}`; block.appendChild(time); }
    blocks.appendChild(block);
  }

  generateButton.addEventListener('click', () => {
    if (!selectedSchedule) { alert('Select a schedule first.'); return; }
    blocks.innerHTML = ''; document.getElementById('capture-area')?.classList.add('visible'); saveButton.classList.add('visible');
    (selectedSchedule.events || []).forEach(event => plotEvent(event, colorInput.value || '#ffffff', fontColorInput.value || '#000000'));
    if (!(selectedSchedule.events || []).length) alert('This schedule has no events.');
  });

  saveButton.addEventListener('click', async () => {
    if (typeof html2canvas === 'undefined') { alert('html2canvas library is not loaded.'); return; }
    const image = await html2canvas(document.getElementById('capture-area'), { backgroundColor: null, scale: 2 });
    const link = document.createElement('a'); link.href = image.toDataURL('image/png'); link.download = 'schedula-schedule.png'; link.click();
  });

  try { await loadSchedules(); } catch (error) { list.innerHTML = `<div class="plotter-schedule-item"><span>${error.message}</span></div>`; }
});
