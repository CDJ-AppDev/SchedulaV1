/**
 * @file subjects.js
 * @description Coordinates the Schedule Builder workspace. Manages course selection, time conflict audits, irregular manual course entries, and synchronization of academic schedule lists with the backend.
 */

// DOM Interface Controls
const addCourseBtn = document.getElementById('add-course-btn');
const coursesList = document.getElementById('scheduledList');
const availableCoursesList = document.getElementById('availableCourses');

const courseCodeInput = document.getElementById('course-code');
const courseNameInput = document.getElementById('course-name');
const teacherNameInput = document.getElementById('teacher-name');
const roomCodeInput = document.getElementById('room-code');
const scheduleDayInput = document.getElementById('schedule-day');
const startTimeInput = document.getElementById('start-time');
const endTimeInput = document.getElementById('end-time');
const courseUnitsInput = document.getElementById('course-units');

// Local application states
let courses = [];
let availableCourses = [];
let currentTermId = null;
let userSchedules = [];
let activeScheduleId = 'new';

/**
 * Fetches academic term settings (cached locally by active Term ID).
 * @param {string} token - Session authorization token
 * @param {string} [termId] - Optional active Term ID filter
 * @returns {Promise<Object>} Academic term details
 */
async function getTermData(token, termId) {
  const activeTermId = termId || localStorage.getItem('termId');
  const cacheKey = activeTermId ? `termData_${activeTermId}` : 'termData';
  const cachedTermData = localStorage.getItem(cacheKey);

  if (cachedTermData) {
    const termData = JSON.parse(cachedTermData);
    if (termData && termData.req_units) {
      localStorage.setItem('reqUnits', termData.req_units);
    }
    return termData;
  }

  try {
    let url = `${API_BASE}/term`;
    if (activeTermId) {
      url += `?termId=${encodeURIComponent(activeTermId)}`;
    }

    const termResponse = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const termData = await termResponse.json();
    if (termData) {
      localStorage.setItem(cacheKey, JSON.stringify(termData));
      if (termData.req_units) {
        localStorage.setItem('reqUnits', termData.req_units);
      }
    }
    return termData;
  } catch (error) {
    console.error('Error fetching term data:', error);
    return null;
  }
}

/**
 * Purges cached academic program term settings from local storage.
 */
function clearTermCache() {
  const activeTermId = localStorage.getItem('termId');
  if (activeTermId) {
    localStorage.removeItem(`termData_${activeTermId}`);
  }
  localStorage.removeItem('termData');
  localStorage.removeItem('reqUnits');
}

/**
 * Parses a standard 24-hour time string into integer minutes since midnight.
 * @param {string} timeStr - Time string ("HH:MM" or "HH:MM:SS")
 * @returns {number|null} Minutes since midnight, or null if invalid
 */
function timeStringToMinutes(timeStr) {
  return window.APP_UTILS ? window.APP_UTILS.timeStringToMinutes(timeStr) : null;
}

/**
 * Checks if two daily time blocks overlap.
 * @param {string} start1 - Slot 1 start time
 * @param {string} end1 - Slot 1 end time
 * @param {string} start2 - Slot 2 start time
 * @param {string} end2 - Slot 2 end time
 * @returns {boolean} True if the time ranges overlap
 */
function doTimesOverlap(start1, end1, start2, end2) {
  const start1Min = timeStringToMinutes(start1);
  const end1Min = timeStringToMinutes(end1);
  const start2Min = timeStringToMinutes(start2);
  const end2Min = timeStringToMinutes(end2);

  if (!start1Min || !end1Min || !start2Min || !end2Min) return false;
  return start1Min < end2Min && start2Min < end1Min;
}

/**
 * Audits the schedule to determine if a new time slot conflicts with existing entries.
 * Evaluates both formal curriculum sections and manual irregular entries.
 * @param {string} newDay - Day label (e.g. 'Monday')
 * @param {string} newStartTime - Time string
 * @param {string} newEndTime - Time string
 * @returns {Object} Conflict status object with descriptive fields
 */
function checkScheduleConflict(newDay, newStartTime, newEndTime) {
  // Check against user preferences blocked times
  let blockedTimes = [];
  try {
    blockedTimes = JSON.parse(localStorage.getItem('blockedTimes')) || [];
  } catch (e) {}

  for (let block of blockedTimes) {
    if (block.day.toLowerCase() === newDay.toLowerCase()) {
      if (doTimesOverlap(block.startTime, block.endTime, newStartTime, newEndTime)) {
        return {
          conflict: true,
          conflictingCourse: 'Unavailable Time (Preference)',
          conflictingDay: block.day,
          conflictingTime: `${block.startTime} - ${block.endTime}`
        };
      }
    }
  }

  for (let course of courses) {
    let courseDay, courseStartTime, courseEndTime;

    if (course.schedule) {
      // Formal API curriculum schedule layout
      courseDay = course.schedule.day;
      courseStartTime = course.schedule.startTime;
      courseEndTime = course.schedule.endTime;
    } else if (course.slots && course.slots.length > 0) {
      // Manual irregular schedule layout
      courseDay = course.slots[0].day;
      courseStartTime = course.slots[0].startTime;
      courseEndTime = course.slots[0].endTime;
    } else {
      continue;
    }

    if (courseDay && courseDay.toLowerCase() === newDay.toLowerCase()) {
      if (doTimesOverlap(courseStartTime, courseEndTime, newStartTime, newEndTime)) {
        return {
          conflict: true,
          conflictingCourse: course.code || course.courseCode,
          conflictingDay: courseDay,
          conflictingTime: `${courseStartTime} - ${courseEndTime}`
        };
      }
    }
  }

  return { conflict: false };
}

async function loadAvailableCourses() {
  // Available courses are now manually imported by the user.
}

function displayAvailableCourses() {}
function addAvailableCourse(courseslotId) {}

/**
 * Renders the scheduled courses list.
 * Evaluates units totals, validates "Regular / Irregular" tags, and formats listings.
 * Employs APP_UTILS HTML-escaping to secure against XSS.
 */
function displayCourses() {
  coursesList.innerHTML = '';

  const unitsDisplay = document.getElementById('schedule-units-display');
  const statusBadge = document.getElementById('regular-status-badge');

  if (!courses || courses.length === 0) {
    coursesList.innerHTML = '<p class="text-muted-light">No courses added yet.</p>';
    if (unitsDisplay) unitsDisplay.textContent = `Units: 0 / ${localStorage.getItem('reqUnits') || 0}`;
    if (statusBadge) statusBadge.style.display = 'none';
    window.currentTotalUnits = 0;
    window.isRegular = false;
    return;
  }

  const esc = window.APP_UTILS ? window.APP_UTILS.escapeHtml : (s => s);

  let totalUnits = 0;
  let hasIrregular = false;
  const coursesByCode = {};

  courses.forEach((course) => {
    if (!course.courseslot_id) {
      // Manual irregular schedule parsing
      totalUnits += parseInt(course.units || 0, 10);
      hasIrregular = true;

      const courseCard = document.createElement('div');
      courseCard.className = 'course-card irregular-course-card';
      courseCard.style.marginBottom = '12px';

      const slot = (course.slots && course.slots[0]) || {};
      const displayCode = course.courseCode || course.code || course.course_id || 'TBA';
      const displayProf = (slot.profId?.name) || course.teacher_name || 'TBD';
      const displayDay = slot.day || (course.schedule?.day) || 'TBD';
      const displayStart = slot.startTime || (course.schedule?.startTime) || '';
      const displayEnd = slot.endTime || (course.schedule?.endTime) || '';
      const displayRoom = slot.room || (course.schedule?.room) || '';

      courseCard.innerHTML = `
         <div class="course-card-body card-body-flex">
           <div>
             <h3 class="card-title-sm">${esc(displayCode)} - ${esc(course.name)}</h3>
             <p class="card-text-main">${esc(displayProf)}</p>
             <p class="card-text-sub">${esc(displayDay)} | ${esc(displayStart)} - ${esc(displayEnd)} ${displayRoom ? `| Room: ${esc(displayRoom)}` : ''}</p>
           </div>
           <button class="btn-remove btn-remove-inline" data-manual-code="${esc(displayCode)}" data-course-name="${esc(displayCode)} - ${esc(course.name)}"><svg class="btn-icon-svg" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" style="width: 13px; height: 13px; margin-right: 4px; display: inline-block; vertical-align: -1px;"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>REMOVE</button>
         </div>
       `;
      coursesList.appendChild(courseCard);
    } else {
      // Formal API curriculum section
      if (!coursesByCode[course.code]) {
        coursesByCode[course.code] = course;
        totalUnits += parseInt(course.units || 0, 10);
      }
    }
  });

  // Render formal API program courses
  Object.values(coursesByCode).forEach((course) => {
    const courseCard = document.createElement('div');
    courseCard.className = 'course-card irregular-course-card';
    courseCard.style.marginBottom = '12px';

    const displayCode = course.code || course.course_id;
    const displayProf = course.teacher_name || 'TBD';
    const displayDay = course.schedule?.day || course.day || 'TBD';
    const displayStart = course.schedule?.startTime || course.startTime || '';
    const displayEnd = course.schedule?.endTime || course.endTime || '';
    const displayRoom = course.schedule?.room || course.room || '';

    courseCard.innerHTML = `
      <div class="course-card-body card-body-flex">
        <div>
          <h3 class="card-title-sm">${esc(displayCode)} - ${esc(course.name)}</h3>
          <p class="card-text-main">${esc(displayProf)}</p>
          <p class="card-text-sub">${esc(displayDay)} ${displayStart ? `| ${esc(displayStart)} - ${esc(displayEnd)}` : ''} ${displayRoom ? `| Room: ${esc(displayRoom)}` : ''}</p>
        </div>
        <button class="btn-remove btn-remove-inline" data-courseslot-id="${course.courseslot_id}" data-course-name="${esc(displayCode)} - ${esc(course.name)}"><svg class="btn-icon-svg" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" style="width: 13px; height: 13px; margin-right: 4px; display: inline-block; vertical-align: -1px;"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>REMOVE</button>
      </div>
    `;
    coursesList.appendChild(courseCard);
  });

  const reqUnits = parseInt(localStorage.getItem('reqUnits')) || 0;

  if (unitsDisplay) {
    unitsDisplay.textContent = `Units: ${totalUnits} / ${reqUnits}`;
  }

  // Evaluate "Regular" status - must meet unit totals exactly and contain no manually entered slots
  const isRegular = (totalUnits === reqUnits) && !hasIrregular;

  if (statusBadge) {
    statusBadge.style.display = 'inline-block';
    if (isRegular) {
      statusBadge.textContent = 'REGULAR';
      statusBadge.style.backgroundColor = 'rgba(0, 204, 102, 0.2)';
      statusBadge.style.color = '#00cc66';
      statusBadge.style.border = '1px solid #00cc66';
    } else {
      statusBadge.textContent = 'IRREGULAR';
      statusBadge.style.backgroundColor = 'rgba(204, 51, 51, 0.2)';
      statusBadge.style.color = '#cc3333';
      statusBadge.style.border = '1px solid #cc3333';
    }
  }

  window.currentTotalUnits = totalUnits;
  window.isRegular = isRegular;
}

/**
 * Removes an irregular manual course from the workspace state.
 * @param {string} courseCode - Unique target code
 */
function removeManualCourse(courseCode) {
  courses = courses.filter(c => (c.courseCode || c.code || c.course_id) !== courseCode);
  displayCourses();
  loadAvailableCourses();
}

/**
 * Removes a formal API course section from the active scheduled state.
 * @param {string|number} courseslotId - Unique section key
 */
function removeCourse(courseslotId) {
  courses = courses.filter(c => c.courseslot_id !== parseInt(courseslotId));
  displayCourses();
  loadAvailableCourses();
}

// 🌟 Efficient Event Delegation for dynamic deletion buttons
if (coursesList) {
  coursesList.addEventListener('click', (event) => {
    const removeBtn = event.target.closest('.btn-remove-inline');
    if (!removeBtn) return;

    const manualCode = removeBtn.getAttribute('data-manual-code');
    const slotId = removeBtn.getAttribute('data-courseslot-id');
    const courseName = removeBtn.getAttribute('data-course-name') || 'this course';

    confirmPopup(
      `Remove <strong>${courseName}</strong> from your schedule?`,
      () => {
        if (manualCode) {
          removeManualCourse(manualCode);
        } else if (slotId) {
          removeCourse(slotId);
        }
      },
      null,
      'Remove Course',
      'warning'
    );
  });
}

// Event handler for adding irregular courses manually
if (addCourseBtn) {
  addCourseBtn.addEventListener('click', () => {
    const code = courseCodeInput.value.trim();
    const name = courseNameInput.value.trim();
    const tName = teacherNameInput.value.trim();
    const day = scheduleDayInput.value.trim();
    const start = startTimeInput.value.trim();
    const end = endTimeInput.value.trim();
    const units = parseInt(courseUnitsInput?.value || "0", 10);
    const room = roomCodeInput.value.trim() || 'TBA';

    if (!code || !name || !tName || !day || !start || !end) {
      alert("Please fill in all irregular course details.");
      return;
    }

    // Time validation (7:00 AM - 8:00 PM limit checks)
    const startMins = timeStringToMinutes(start);
    const endMins = timeStringToMinutes(end);
    const limitStart = 7 * 60;
    const limitEnd = 20 * 60;

    if (startMins === null || endMins === null) {
      alert("Please enter valid start and end times.");
      return;
    }
    if (startMins < limitStart) {
      alert("Invalid Time!\nStart time cannot be earlier than 7:00 AM.");
      return;
    }
    if (endMins > limitEnd) {
      alert("Invalid Time!\nEnd time cannot be later than 8:00 PM.");
      return;
    }
    if (startMins >= endMins) {
      alert("Invalid Time!\nStart time must precede end time.");
      return;
    }

    const conflictCheck = checkScheduleConflict(day, start, end);

    if (conflictCheck.conflict) {
      alert(
        `⚠️ Scheduling Conflict Detected!\n\n` +
        `This course conflicts with:\n` +
        `Course: ${conflictCheck.conflictingCourse}\n` +
        `Day: ${conflictCheck.conflictingDay}\n` +
        `Time: ${conflictCheck.conflictingTime}\n\n` +
        `Please adjust the time or day.`
      );
      return;
    }

    const newCourse = {
      courseCode: code,
      name: name,
      units: units,
      slots: [{
        profId: { name: tName, department: 'Manual' },
        day: day,
        startTime: start,
        endTime: end,
        room: room
      }]
    };

    courses.push(newCourse);

    // Reset input fields
    courseCodeInput.value = '';
    courseNameInput.value = '';
    teacherNameInput.value = '';
    roomCodeInput.value = '';
    scheduleDayInput.value = '';
    startTimeInput.value = '';
    endTimeInput.value = '';
    if (courseUnitsInput) courseUnitsInput.value = '';

    displayCourses();

    // Auto-collapse irregular section dropdown panel
    const header = addCourseBtn.closest('.dropdown').previousElementSibling;
    if (header && header.classList.contains('course-card-header')) {
      header.click();
    }
  });
}

/**
 * Switches the active timetable template in the workspace editor.
 * Resets fields or parses selection courses dynamically.
 * @param {string|number} id - Database schedule key or 'new'
 */
window.switchActiveSchedule = function (id) {
  activeScheduleId = id;
  const nameInput = document.getElementById('schedule-name-input');
  const deleteBtn = document.getElementById('delete-schedule-btn');

  if (id === 'new') {
    courses = [];
    window.currentScheduleId = null;
    if (nameInput) nameInput.value = 'Schedule';
    if (deleteBtn) deleteBtn.style.display = 'none';
  } else {
    const sched = userSchedules.find(s => s.schedule_id == id);
    if (sched) {
      window.currentScheduleId = sched.schedule_id;
      if (nameInput) nameInput.value = sched.schedule_name;
      courses = sched.courses || [];
      if (deleteBtn) deleteBtn.style.display = 'inline-flex';
    }
  }
  displayCourses();
  loadAvailableCourses();
};

/**
 * Fetches all saved schedules for the currently authenticated user.
 * Dynamically renders curriculum selectors.
 */
async function loadUserSchedule() {
  const token = localStorage.getItem('token');
  if (!token) return;

  try {
    const response = await fetch(`${API_BASE}/schedule`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    userSchedules = await response.json();

    const selector = document.getElementById('schedule-selector');
    if (selector) {
      selector.innerHTML = '<option value="new">+ Create New Schedule</option>';
      userSchedules.forEach(s => {
        const opt = document.createElement('option');
        opt.value = s.schedule_id;
        opt.textContent = s.schedule_name;
        selector.appendChild(opt);
      });

      if (activeScheduleId && activeScheduleId !== 'new') {
        selector.value = activeScheduleId;
      } else if (userSchedules.length > 0 && activeScheduleId === 'new') {
        selector.value = userSchedules[0].schedule_id;
        activeScheduleId = userSchedules[0].schedule_id;
      }

      selector.onchange = (e) => switchActiveSchedule(e.target.value);
    }

    switchActiveSchedule(activeScheduleId);
  } catch (error) {
    console.error('Error loading schedule:', error);
  }
}

// Initialise settings and fetch active details
document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = 'login.html';
    return;
  }

  // Pre-load curriculum bounds
  getTermData(token).then(termData => {
    if (termData && termData.req_units) {
      localStorage.setItem('reqUnits', termData.req_units);
      displayCourses();
    }
  }).catch(error => {
    console.error('Error fetching term data on page open:', error);
  });

  const reqUnits = localStorage.getItem('reqUnits');
  if (reqUnits) {
    const unitsDisplay = document.getElementById('schedule-units-display');
    if (unitsDisplay) unitsDisplay.textContent = `Units: 0 / ${reqUnits}`;
  }

  loadAvailableCourses();
  loadUserSchedule();

  // Save Schedule Event Trigger
  const saveBtn = document.querySelector('.btn-save');
  if (saveBtn) {
    saveBtn.addEventListener('click', async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Cannot save schedule: you are not logged in.');
        return;
      }

      if (courses.length === 0) {
        alert('Cannot save empty schedule.');
        return;
      }

      const scheduleName = document.getElementById('schedule-name-input')?.value || 'My Schedule';

      const scheduleList = [];
      courses.forEach(c => {
        if (c.courseCode) {
          scheduleList.push(c);
        } else {
          const exists = scheduleList.find(item => item.courseslot_id === c.courseslot_id);
          if (!exists) {
            scheduleList.push({ courseslot_id: c.courseslot_id });
          }
        }
      });

      try {
        const response = await fetch(`${API_BASE}/schedule`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            schedule_id: window.currentScheduleId || null,
            schedule_name: scheduleName,
            total_units: window.currentTotalUnits || 0,
            regular: window.isRegular !== undefined ? window.isRegular : true,
            schedule_list: scheduleList
          })
        });

        if (response.ok) {
          const data = await response.json();
          alert('Schedule saved successfully!');
          if (data.schedule_id) {
            window.currentScheduleId = data.schedule_id;
            activeScheduleId = data.schedule_id;
            loadUserSchedule();
          }
        } else {
          alert('Failed to save schedule.');
        }
      } catch (error) {
        console.error('Error saving schedule:', error);
        alert('Error saving schedule.');
      }
    });
  }

  // Delete Schedule Event Trigger
  const deleteBtn = document.getElementById('delete-schedule-btn');
  if (deleteBtn) {
    deleteBtn.addEventListener('click', () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      if (!window.currentScheduleId) return;

      confirmPopup(
        'Are you sure you want to delete this schedule? This cannot be undone.',
        async () => {
          try {
            const response = await fetch(`${API_BASE}/schedule/${window.currentScheduleId}`, {
              method: 'DELETE',
              headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
              alert('Schedule deleted successfully.');
              activeScheduleId = 'new';
              loadUserSchedule();
            } else {
              alert('Failed to delete schedule.');
            }
          } catch (error) {
            console.error('Error deleting schedule:', error);
            alert('Error deleting schedule.');
          }
        },
        null,
        'Delete Schedule'
      );
    });
  }
});

// ----------------- IMPORT CLASSES LOGIC -----------------
const importTableBody = document.getElementById('import-table-body');
const addImportRowBtn = document.getElementById('add-import-row-btn');
const importClassesBtn = document.getElementById('import-classes-btn');

function createImportRow() {
  const tr = document.createElement('tr');
  const inputStyle = 'width: 100%; padding: 6px; background: var(--input-bg); color: var(--text); border: 1px solid var(--border); border-radius: 4px;';
  tr.innerHTML = `
    <td style="padding: 4px;"><input type="text" class="import-input" placeholder="Code" style="${inputStyle}"></td>
    <td style="padding: 4px;"><input type="text" class="import-input" placeholder="Name" style="${inputStyle}"></td>
    <td style="padding: 4px;"><input type="number" class="import-input" placeholder="3" style="${inputStyle}"></td>
    <td style="padding: 4px;"><input type="text" class="import-input" placeholder="Prof" style="${inputStyle}"></td>
    <td style="padding: 4px;"><input type="text" class="import-input" placeholder="Room" style="${inputStyle}"></td>
    <td style="padding: 4px;">
      <select class="import-input" style="${inputStyle}">
        <option value="Monday">Monday</option>
        <option value="Tuesday">Tuesday</option>
        <option value="Wednesday">Wednesday</option>
        <option value="Thursday">Thursday</option>
        <option value="Friday">Friday</option>
        <option value="Saturday">Saturday</option>
      </select>
    </td>
    <td style="padding: 4px;"><input type="time" class="import-input" style="${inputStyle}"></td>
    <td style="padding: 4px;"><input type="time" class="import-input" style="${inputStyle}"></td>
    <td style="padding: 4px; text-align: center;"><button type="button" class="btn-remove-import-row" style="background: none; border: none; color: var(--text); font-weight: bold; cursor: pointer;">&times;</button></td>
  `;
  tr.querySelector('.btn-remove-import-row').addEventListener('click', () => tr.remove());
  return tr;
}

if (addImportRowBtn && importTableBody) {
  addImportRowBtn.addEventListener('click', () => {
    importTableBody.appendChild(createImportRow());
  });
  // add a default row initially
  importTableBody.appendChild(createImportRow());
}

if (importClassesBtn && importTableBody) {
  importClassesBtn.addEventListener('click', () => {
    const rows = importTableBody.querySelectorAll('tr');
    let importedCount = 0;
    
    rows.forEach(row => {
      const inputs = row.querySelectorAll('.import-input');
      const code = inputs[0].value.trim();
      const name = inputs[1].value.trim();
      const units = parseInt(inputs[2].value || "0", 10);
      const teacher = inputs[3].value.trim() || 'TBA';
      const room = inputs[4].value.trim() || 'TBA';
      const day = inputs[5].value;
      const start = inputs[6].value;
      const end = inputs[7].value;

      if (!code || !name || !day || !start || !end) {
        return; // Skip incomplete rows silently
      }

      // Check conflicts
      const conflictCheck = checkScheduleConflict(day, start, end);
      if (conflictCheck.conflict) {
        alert(
          `Conflict for ${code}: overlaps with ${conflictCheck.conflictingCourse} on ${conflictCheck.conflictingDay} (${conflictCheck.conflictingTime})`
        );
        return;
      }

      const newCourse = {
        courseCode: code,
        name: name,
        units: units,
        slots: [{
          profId: { name: teacher, department: 'Manual' },
          day: day,
          startTime: start,
          endTime: end,
          room: room
        }]
      };

      courses.push(newCourse);
      importedCount++;
      row.remove(); // clear valid row
    });

    if (importedCount > 0) {
      alert(`Successfully imported ${importedCount} classes!`);
      displayCourses();
    } else {
      alert('No valid classes imported. Please fill out code, name, day, start time, and end time.');
    }
  });
}

