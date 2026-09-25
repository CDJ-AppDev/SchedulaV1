# Front-End JavaScript — Feature Documentation

## Overview
Browser-side vanilla JavaScript powers authentication flows, API access, schedule builder/plotter interactions, profile management, and a private admin dashboard that performs CRUD operations via the backend admin API.

## Key Files & Locations
- **Shared Utilities**
  - `frontend/scripts/utils.js`: Core app configuration (`APP_CONFIG`), dynamic API base resolution, and shared utilities (`APP_UTILS.escapeHtml()`, `APP_UTILS.timeStringToMinutes()`). This file must be loaded before others.
  - `frontend/scripts/auth.js`: Token handling, route guard, login/signup/reset flows, file URL token pass-through, and admin nav injection.
  - `frontend/scripts/theme.js`: Light/dark theme toggle and local storage persistence.
  - `frontend/scripts/popup.js`: Shared modal/confirm UI, replacing native alerts.
- **Application Pages**
  - `frontend/scripts/setup.js`: Post-signup setup (cascading program/year/semester selection).
  - `frontend/scripts/profile.js`: User profile updates and account actions.
  - `frontend/scripts/classes.js`: OOP Data classes (`Professor`, `CourseSlot`, `Course`).
  - `frontend/scripts/subjects.js`: Schedule builder logic, course selection, manual irregular entries, and conflict checking (`doTimesOverlap()`, `checkScheduleConflict()`).
  - `frontend/scripts/plotter.js`: Timetable grid generation (7 AM to 8 PM, Mon-Sat), customization, and PNG export via `html2canvas`.
- **Private Admin Dashboard**
  - `admin/admin.js`: Admin UI state, cascading filters, modal forms, and CRUD calls to `/api/admin/*`.

## Features
- **API Base URL Resolution**: `APP_CONFIG.API_BASE` dynamically targets backend endpoints based on the deployment environment (local, hosted, or file://).
- **Token Propagation**: `auth.js` maintains session JWTs in `localStorage` and automatically wraps requests with `Authorization: Bearer <token>`.
- **Conflict Prevention**: `subjects.js` enforces schedule validity by checking day/time overlaps for both regular slots and manual entries.
- **Admin Dashboard**: Comprehensive CRUD tools with dependency filters (e.g., Program -> Term -> Course cascades).

## Dependencies
- **Node.js Backend**: All data flows depend on Express endpoints in `backend/db-server.js`.
- **HTML Pages**: Scripts rely on DOM IDs and classes defined in `pages/*.html` and `admin/admin.html`.

## TODOs & Known Limitations
- **Inline Event Handlers**: Moving `onclick`/`onsubmit` to `addEventListener` would improve code hygiene but requires rigorous testing.
- **Monolithic Admin JS**: `admin/admin.js` handles too much (API, rendering, filtering) and could be modularized.
- **Future Architecture (React/TS)**: As documented in `REACT-TAILWIND-REBUILD-PLAN.md`, this entire vanilla JavaScript ecosystem is planned to be replaced by a React/TypeScript application to improve component reusability and type safety.
- **Keyboard Shortcuts**: Planned functionality (see `KEYBOARD-PLAN.md`) is yet to be fully integrated.
