/**
 * @file profile.js
 * @description Controls the User Profile view. Manages credentials editing, password visibility toggles, and dynamic academic curriculum selections (program, year, semester).
 */

// Detect API base URL from centralized configuration
if (typeof API_BASE === 'undefined') {
  window.API_BASE = window.APP_CONFIG ? window.APP_CONFIG.API_BASE : 'http://localhost:3000/api';
}

// Redirect immediately to login if no auth token is active
document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = 'login.html';
    return;
  }
});

/** @type {Array<Object>} */
let programsList = [];

// DOM References - Profile Left Column (User Details)
const usernameInput = document.getElementById('profile-username');
const emailInput = document.getElementById('profile-email');
const passwordInput = document.getElementById('profile-password');
const editUsernameBtn = document.getElementById('edit-btn-username');
const editEmailBtn = document.getElementById('edit-btn-email');
const editPasswordBtn = document.getElementById('edit-btn-password');

// DOM References - Academic Right Column (Selection Details)
const programSelect = document.getElementById('program-select');
const yearSelect = document.getElementById('year-select');
const semesterSelect = document.getElementById('semester-select');
const applyBtn = document.getElementById('apply-courses-btn');
const selectedCoursesDisplay = document.getElementById('selected-courses');
const schedulePickerBtn = document.getElementById('schedule-picker-btn');

// ----------------- PART 1: PROFILE INFORMATION EDITING -----------------

/**
 * Handles the inline editing toggle for username, email, and password fields.
 * Transitions between "read-only disabled" and "active editing input", committing changes to the backend on toggle-close.
 * @param {HTMLInputElement} input - Input DOM reference
 * @param {HTMLButtonElement} button - Edit trigger button DOM reference
 * @param {string} fieldName - Key of the field (e.g. 'username', 'email', 'password')
 */
async function handleFieldToggle(input, button, fieldName) {
  if (input.disabled) {
    // Enable fields for keyboard input focus
    input.disabled = false;
    input.focus();
    button.classList.add('editing');
  } else {
    // Save current values to server
    const value = input.value.trim();
    if (!value && fieldName !== 'password') {
      alert(`${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} cannot be empty.`);
      return;
    }
    
    const body = {};
    body[fieldName] = value;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/user/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });
      
      let resData = {};
      try {
        resData = await response.json();
      } catch (jsonErr) {
        console.error('Error parsing JSON response:', jsonErr);
        let errText = 'An unexpected server error occurred.';
        try {
          const rawText = await response.text();
          if (rawText && rawText.length < 150) {
            errText = rawText;
          }
        } catch (_) {}
        alert('Server Error: ' + errText);
        return;
      }
      
      if (!response.ok) {
        alert(resData.error || 'Failed to update profile detail.');
        return;
      }
      
      alert(`${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} updated successfully!`);
      
      // Keep local session storage details synchronized if username changed
      if (fieldName === 'username') {
        const userObj = JSON.parse(localStorage.getItem('user') || '{}');
        userObj.username = value;
        userObj.name = value;
        localStorage.setItem('user', JSON.stringify(userObj));

        // Dynamically adjust header displays immediately
        if (typeof populateHeaderUsername === 'function') {
          populateHeaderUsername(userObj);
        }
      }
      
      input.disabled = true;
      button.classList.remove('editing');
    } catch (err) {
      console.error(err);
      alert('Error updating profile detail: ' + err.message);
    }
  }
}

// Attach field editing triggers
if (editUsernameBtn && usernameInput) {
  editUsernameBtn.addEventListener('click', () => handleFieldToggle(usernameInput, editUsernameBtn, 'username'));
}
if (editEmailBtn && emailInput) {
  editEmailBtn.addEventListener('click', () => handleFieldToggle(emailInput, editEmailBtn, 'email'));
}
if (editPasswordBtn && passwordInput) {
  editPasswordBtn.addEventListener('click', () => handleFieldToggle(passwordInput, editPasswordBtn, 'password'));
}

// Toggle password visibility field (Show/Hide)
const togglePasswordVisibilityBtn = document.getElementById('toggle-password-visibility-btn');
const eyeIcon = document.getElementById('eye-icon');

if (togglePasswordVisibilityBtn && passwordInput && eyeIcon) {
  togglePasswordVisibilityBtn.addEventListener('click', () => {
    if (passwordInput.type === 'password') {
      passwordInput.type = 'text';
      // Render slashed eye icon (Eye-Off indicator)
      eyeIcon.innerHTML = `
        <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M21 21l-3.562-3.562M21 21L3 3m18 18l-3.562-3.562M18 17.562A9.96 9.96 0 0112 19.5c-4.638 0-8.573-3.007-9.963-7.178a1.883 1.883 0 010-.639 9.878 9.878 0 014.28-5.385m10.12 10.12a3 3 0 11-4.243-4.243m4.242 4.242L9.88 9.88" />
      `;
      togglePasswordVisibilityBtn.style.opacity = '1';
    } else {
      passwordInput.type = 'password';
      // Restore default standard eye icon
      eyeIcon.innerHTML = `
        <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
        <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      `;
      togglePasswordVisibilityBtn.style.opacity = '0.6';
    }
  });
}

// ----------------- PART 2: SERVER SAVE & LOAD -----------------

/**
 * Submits the selected curriculum program details directly to the backend server.
 * Saves the generated Term ID locally on success.
 * @param {string} program_id - ID of program (e.g. 'BSCS')
 * @param {number} year_level - Integer year level (1-5)
 * @param {number} semester - Integer semester term (1-3)
 * @returns {Promise<boolean>} Resolves true on successful sync
 */
async function saveToServer(program_id, year_level, semester) {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('Authentication token missing. Sync aborting.');
      return false;
    }

    const response = await fetch(`${API_BASE}/term`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ program_id, year_level, semester })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Term selection saving failed:', data);
      alert('Failed to save term selection: ' + (data.error || 'Unknown error'));
      return false;
    }

    localStorage.setItem('termId', data.term_id);
    return true;
  } catch (err) {
    console.error('Server synchronizer interface error:', err);
    alert('Error saving program: ' + err.message);
    return false;
  }
}

/**
 * Retrieves the currently active academic term selection from the backend.
 * Falls back to offline mode if server fails.
 * @returns {Promise<Object|null>} Decoded selection payload or null
 */
async function loadFromServer() {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;

    const response = await fetch(`${API_BASE}/term`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      console.error('Academic term loading failed:', response.statusText);
      return null;
    }

    const data = await response.json();
    if (!data) return null;

    // Cache the resolved term code
    localStorage.setItem('termId', data.term_id);

    return {
      course: data.program_id,
      year: String(data.year_level),
      semester: String(data.semester),
      req_units: data.req_units
    };

  } catch (err) {
    console.error('Academic term fetching error:', err);
    return null;
  }
}

/**
 * Saves current selection selections locally to maintain page state.
 * @param {string} course - Program code
 * @param {string} year - Year level
 * @param {string} semester - Semester code
 */
function saveToLocalStorage(course, year, semester) {
  const data = { course, year, semester };
  localStorage.setItem('courseSelection', JSON.stringify(data));
}

// ----------------- PART 3: DROPDOWN SELECTORS IMPLEMENTATION -----------------

/**
 * Re-evaluates and populates the secondary year and semester dropdown forms.
 * Triggers on curriculum program modifications.
 * @param {string} progId - Selected program department key
 */
function updateDropdownOptions(progId) {
  if (!progId) {
    yearSelect.innerHTML = '<option value="">-- Select year level --</option>';
    yearSelect.disabled = true;
    semesterSelect.innerHTML = '<option value="">-- Select semester --</option>';
    semesterSelect.disabled = true;
    return;
  }

  const prog = programsList.find(p => p.programid === progId);
  if (!prog) return;

  // Build year dropdown bounds
  let yearHtml = '<option value="">-- Select year level --</option>';
  for (let i = 1; i <= prog.totalyears; i++) {
    yearHtml += `<option value="${i}">Year ${i}</option>`;
  }
  yearSelect.innerHTML = yearHtml;
  yearSelect.disabled = false;

  // Build semester dropdown bounds
  let semHtml = '<option value="">-- Select semester --</option>';
  const semLabels = ['First Semester', 'Second Semester', 'Summer Term'];
  for (let i = 1; i <= prog.semestertype; i++) {
    semHtml += `<option value="${i}">${semLabels[i - 1]}</option>`;
  }
  semesterSelect.innerHTML = semHtml;
  semesterSelect.disabled = false;
}

// ---------------- UI UPDATE ----------------

/**
 * Adjusts layout selectors, visual confirmation labels, and URL parameters to reflect loaded settings.
 * @param {string} course - Program key
 * @param {string} year - Year level key
 * @param {string} semester - Semester key
 */
function applySelectionToUI(course, year, semester) {
  if (programSelect) programSelect.value = course;
  updateDropdownOptions(course);
  if (yearSelect) yearSelect.value = year;
  if (semesterSelect) semesterSelect.value = semester;

  const ord = ['st', 'nd', 'rd', 'th'];
  const prog = programsList.find(p => p.programid === course);
  const courseLabel = prog ? prog.programname : course;

  const yearNum = parseInt(year);
  const semNum = parseInt(semester);
  const yearLabel = `${yearNum}${ord[yearNum - 1] || 'th'} Year`;

  const semLabels = ['First Semester', 'Second Semester', 'Summer Term'];
  const semesterLabel = semLabels[semNum - 1] || `${semNum} Semester`;

  selectedCoursesDisplay.textContent = `Selected: ${courseLabel} - ${yearLabel} - ${semesterLabel}`;
  schedulePickerBtn.removeAttribute('hidden');

  // Keep state URL synchronized (allows browser backward compatibility)
  window.history.replaceState(
    {},
    document.title,
    `profile.html?course=${course}&year=${year}&semester=${semester}`
  );
}

// ---------------- APPLY BUTTON ----------------

if (applyBtn) {
  applyBtn.addEventListener('click', async () => {
    const course = programSelect.value;
    const year = yearSelect.value;
    const semester = semesterSelect.value;

    if (!course || !year || !semester) {
      alert('Please select a program, year level, and semester.');
      return;
    }

    saveToLocalStorage(course, year, semester);

    // Save selection details to backend
    const saved = await saveToServer(course, parseInt(year), parseInt(semester));

    if (saved) {
      const termData = await loadFromServer();
      if (termData && termData.req_units) {
        localStorage.setItem('reqUnits', termData.req_units);
      }
      applySelectionToUI(course, year, semester);
    }
  });
}

// ---------------- SERVER-FIRST PAGE LOAD ----------------

window.addEventListener('load', async () => {
  let course, year, semester;

  // 1. Fetch user session details to fill corresponding input fields
  try {
    const token = localStorage.getItem('token');
    const userRes = await fetch(`${API_BASE}/user-session`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (userRes.ok) {
      const userData = await userRes.json();
      if (usernameInput) usernameInput.value = userData.name || '';
      if (emailInput) emailInput.value = userData.email || '';
      if (passwordInput) passwordInput.value = userData.password || '';
    }
  } catch (error) {
    console.error('Error pre-filling profile fields:', error);
  }

  // 2. Fetch available department program templates
  try {
    const response = await fetch(`${API_BASE}/programs`);
    if (response.ok) {
      programsList = await response.json();
      if (programSelect) {
        programSelect.innerHTML = '<option value="">-- Select a program --</option>' +
          programsList.map(p => `<option value="${p.programid}">${p.programname}</option>`).join('');
      }
    }
  } catch (error) {
    console.error('Error fetching programs:', error);
  }

  if (programSelect) {
    programSelect.addEventListener('change', () => {
      updateDropdownOptions(programSelect.value);
    });
  }

  // 3. Load from server (Server is primary source of truth)
  const serverData = await loadFromServer();
  if (serverData) {
    course = serverData.course;
    year = serverData.year;
    semester = serverData.semester;
    if (serverData.req_units) {
      localStorage.setItem('reqUnits', serverData.req_units);
    }
  }

  // 4. Fallback 1: Local cache storage
  if (!course || !year || !semester) {
    const savedData = localStorage.getItem('courseSelection');
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        if (!course) course = data.course;
        if (!year) year = data.year;
        if (!semester) semester = data.semester;
      } catch (err) {
        console.error('LocalStorage parse error:', err);
      }
    }
  }

  // 5. Fallback 2: URL queries parameters
  if (!course || !year || !semester) {
    const params = new URLSearchParams(window.location.search);
    const urlCourse = params.get('course');
    const urlYear = params.get('year');
    const urlSemester = params.get('semester');
    if (!course) course = urlCourse;
    if (!year) year = urlYear;
    if (!semester) semester = urlSemester;
  }

  // 6. Apply settings visually
  if (course && year && semester) {
    applySelectionToUI(course, year, semester);
  }

  // Disable account deletion if logged in as super admin
  const userObjStr = localStorage.getItem('user');
  if (userObjStr) {
    try {
      const u = JSON.parse(userObjStr);
      if (u.email === 'admin@gmail.com') {
        const deleteBtn = document.getElementById('delete-account-btn');
        if (deleteBtn) {
          deleteBtn.disabled = true;
          deleteBtn.title = "Super Admin account cannot be deleted.";
        }
      }
    } catch (_) {}
  }
});

// Account Deletion Handler
const deleteAccountBtn = document.getElementById('delete-account-btn');
if (deleteAccountBtn) {
  deleteAccountBtn.addEventListener('click', () => {
    const userObjStr = localStorage.getItem('user');
    let email = '';
    if (userObjStr) {
      try {
        const u = JSON.parse(userObjStr);
        email = u.email;
      } catch (_) {}
    }
    
    if (email === 'admin@gmail.com') {
      alert('The Super Admin account cannot be deleted.');
      return;
    }

    window.promptPopup(
      'Are you absolutely sure you want to permanently delete your account? All your schedules and details will be deleted forever. To proceed, please type <strong>DELETE</strong> in all caps.',
      async () => {
        try {
          const token = localStorage.getItem('token');
          const response = await fetch(`${API_BASE}/user/profile`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (response.ok) {
            localStorage.clear();
            // Show alert then redirect
            alert('Your account has been successfully deleted.', 'Account Deleted');
            setTimeout(() => {
              window.location.href = '../index.html';
            }, 1500);
          } else {
            const errData = await response.json();
            alert(errData.error || 'Failed to delete account.');
          }
        } catch (error) {
          alert('Error deleting account: ' + error.message);
        }
      },
      null,
      'Confirm Account Deletion',
      'DELETE'
    );
  });
}

// ----------------- PART 4: AVAILABILITY PREFERENCES -----------------
let blockedTimes = [];

async function loadPreferences() {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/preferences`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (response.ok) {
      const data = await response.json();
      blockedTimes = data.blockedTimes || [];
      renderBlockedTimes();
    }
  } catch (err) {
    console.error('Error loading preferences:', err);
  }
}

function renderBlockedTimes() {
  const list = document.getElementById('availability-list');
  if (!list) return;
  list.innerHTML = '';
  blockedTimes.forEach((block, index) => {
    const item = document.createElement('div');
    item.style.display = 'flex';
    item.style.justifyContent = 'space-between';
    item.style.padding = '8px';
    item.style.backgroundColor = 'var(--surface)';
    item.style.border = '1px solid var(--border)';
    item.style.color = 'var(--text)';
    item.style.borderRadius = '4px';
    item.innerHTML = `
      <span>${block.day}: ${block.startTime} - ${block.endTime}</span>
      <button onclick="removeBlockedTime(${index})" style="background:none; border:none; color:red; cursor:pointer; font-weight: bold;">&times;</button>
    `;
    list.appendChild(item);
  });
  localStorage.setItem('blockedTimes', JSON.stringify(blockedTimes));
}

window.removeBlockedTime = function(index) {
  blockedTimes.splice(index, 1);
  renderBlockedTimes();
};

const addAvailBtn = document.getElementById('add-avail-btn');
const saveAvailBtn = document.getElementById('save-avail-btn');

if (addAvailBtn) {
  addAvailBtn.addEventListener('click', () => {
    const day = document.getElementById('avail-day').value;
    const startTime = document.getElementById('avail-start').value;
    const endTime = document.getElementById('avail-end').value;
    if (day && startTime && endTime) {
      blockedTimes.push({ day, startTime, endTime });
      renderBlockedTimes();
    }
  });
}

if (saveAvailBtn) {
  saveAvailBtn.addEventListener('click', async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/preferences`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ blockedTimes })
      });
      if (response.ok) {
        alert('Preferences saved successfully!');
      } else {
        alert('Failed to save preferences');
      }
    } catch (err) {
      console.error(err);
      alert('Error saving preferences');
    }
  });
}

// Call loadPreferences on page load
document.addEventListener('DOMContentLoaded', () => {
  loadPreferences();
});
