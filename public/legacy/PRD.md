# Product Requirements Document

## Overview

Academic Schedule Builder (ASB) is a full-stack web application for building, saving, and visualizing academic course schedules. It serves students who need to select course slots for a program/year/semester and administrators who maintain the catalog structure behind those schedules.

The product solves three connected problems:

- Students need to browse eligible courses, avoid obvious schedule conflicts, save multiple schedule variants, and export a timetable.
- Administrators need CRUD tools for programs, terms, courses, professors, course slots, users, roles, and saved schedules.
- Operators need a PostgreSQL-backed API that keeps authentication, profiles, course data, refresh sessions, and saved schedules in sync.

## Goals & Non-Goals

### Goals

- Let users create accounts, log in, maintain JWT-backed sessions, silently refresh expired access tokens, log out, reset passwords through a PIN email flow, and complete program/year/semester setup.
- Let students browse available courses for their selected term through `GET /api/courses`.
- Let students build schedules from database-backed course slots and manual irregular entries.
- Prevent obvious time conflicts in the builder through `doTimesOverlap()` and `checkScheduleConflict()` in `frontend/scripts/subjects.js`.
- Persist multiple named schedules with total units and regular/irregular status through `PUT /api/schedule`.
- Visualize schedules in a Monday-Saturday timetable grid through `frontend/scripts/plotter.js`.
- Export timetable views as PNG through `html2canvas`.
- Let users edit profile/account fields and academic term selection through `frontend/scripts/profile.js`.
- Provide an admin dashboard for catalog, role, and user management through `admin/admin.html`, `admin/admin.js`, and `/api/admin/*` endpoints.
- Support a static frontend, modular Node/Express backend, PostgreSQL database, Docker images, and Kubernetes deployment manifests.

### Non-Goals

- Native mobile apps are not documented.
- Real-time collaborative scheduling is not documented.
- Calendar provider integrations are not documented.
- Payment, billing, enrollment registration, or official SIS integration are not documented.
- Production-grade secret management is not currently implemented; Kubernetes secrets in this repo are dev/local examples.
- Password hashing is not currently implemented; the current backend uses reversible AES encryption, which is a security limitation.
- React or TypeScript migration is planned in `public/notes/TODO.md`, but is not part of the current implemented system.
- Automated testing is not documented.

## Users & Use Cases

### Student / Default User

- Signs up through `pages/signup.html`, then chooses program/year/semester through `pages/setup.html`.
- Logs in through `pages/login.html`; access and refresh tokens are stored client-side.
- Uses `pages/builder.html` to browse eligible courses, add course slots, add irregular manual courses, create/switch schedules, save schedules, and delete schedule entries.
- Uses `pages/plotter.html` to render a timetable from a saved schedule, customize display options, choose block/font colors, and export PNG.
- Uses `pages/profile.html` to edit username/email/password and update academic program/year/semester.

### Admin User

- Logs in with an account whose `user_credentials.useraccess` is `Admin`.
- Uses `admin/admin.html` and `admin/admin.js` to manage users, programs, terms, courses, professors, course slots, and schedules.
- Uses program -> term -> course filters for course and course-slot workflows.
- Can promote/demote user roles through dedicated make-admin/remove-admin endpoints.
- Views all saved schedules in a read-only admin view and can delete schedules.

### Operator / Developer

- Runs the backend through `backend/package.json` using `npm start`, which executes `node db-server.js`.
- Applies PostgreSQL schema and seed files from `backend/sql/`.
- Builds and pushes Docker images using commands documented in `public/notes/COMMANDS.md`.
- Deploys Kubernetes manifests from `k8s/` for frontend, backend, and Postgres.

## Functional Requirements

### Authentication and Session Management

- `POST /api/signup` must create `user_credentials` and `user_profile`; the default username may start as the email.
- `POST /api/login` must validate credentials, issue a short-lived access JWT, issue a refresh token, store the refresh token in `REFRESH_TOKENS`, and return user metadata.
- `POST /api/refresh` must validate and rotate refresh tokens transactionally.
- `POST /api/logout` must delete the provided refresh token when present.
- `authenticateToken` in `backend/middleware/auth.js` must protect authenticated API routes.
- `adminOnly` in `backend/middleware/auth.js` must restrict `/api/admin/*` routes to users whose `useraccess` is `Admin`.
- `frontend/scripts/auth.js` must centralize token retrieval, route guarding, user-session syncing, refresh retry, and auth page actions.
- For `file://` operation, `redirectWithToken()` must preserve token/user data through query parameters.
- Password reset must support `POST /api/forgot-password` and `POST /api/reset-password`, using 6-digit PIN records in `password_reset_token` and SMTP or development fallback logging.

### User Setup and Profile

- `POST /api/term` must update `user_profile.termid` transactionally and may update username.
- `GET /api/term` must return the current user's selected term or a specific term by query parameter.
- `GET /api/programs` must provide a public list of academic programs.
- Public program loading should use the cache in `backend/services/programService.js`.
- `frontend/scripts/setup.js` must implement cascading program, year, and semester dropdowns.
- `frontend/scripts/profile.js` must support account field editing and academic selection updates.

### Course Catalog and Schedule Builder

- `GET /api/courses` must return course, course-slot, professor, and term metadata for the user's selected term.
- `frontend/scripts/classes.js` must model `Professor`, `CourseSlot`, and `Course`.
- `frontend/scripts/subjects.js` must render available courses, selected courses, manual irregular entries, total units, and regular/irregular status.
- Conflict prevention must compare day/start/end time using `doTimesOverlap()` and `checkScheduleConflict()`.
- Schedule status must be `REGULAR` only when total units match required units and no irregular manual entries exist.
- Users must be able to create, switch, save, and delete multiple schedules.

### Schedule Persistence

- `GET /api/schedule` must fetch all user schedules and batch-load referenced `courseslot` rows to avoid N+1 queries.
- `PUT /api/schedule` must create or update schedules with `schedulename`, `totalunits`, `regular`, and JSONB `schedulelist`.
- `DELETE /api/schedule` must remove one course-slot entry from a schedule JSONB list.
- `DELETE /api/schedule/:id` must delete an entire schedule owned by the user.
- Manual irregular entries must remain in `schedulelist` and be returned with hydrated database-backed entries.

### Plotter and Export

- `frontend/scripts/plotter.js` must render a timetable grid from 7:00 AM to 8:00 PM, Monday through Saturday.
- `plotBlock()` must convert times into absolute grid coordinates and day columns.
- Course block text must be rendered with `.textContent` where documented to reduce XSS risk.
- Plotter options must support hiding professor, code, name, time, day, and room.
- Color customization must support block color and font color with real-time preview.
- PNG export must use `html2canvas` and download `My_Schedule.png`.

### Admin Dashboard

- `admin/admin.js` must manage dashboard tabs for users, programs, terms, courses, professors, course slots, and schedules.
- Admin filters must support program -> term -> course flows for course and course-slot workflows.
- Admin create/edit modals must submit JSON to `/api/admin/*`.
- Admin program create/update must generate or regenerate terms in `backend/services/adminService.js`.
- Admin course update behavior must replace `course_term` mappings when the course code or term mapping changes.
- Admin course-slot writes must reject invalid time ranges and enforce 7:00 AM to 8:00 PM bounds.
- Admin schedules are documented as read-only except delete.

### Frontend Composition and Theme

- Static HTML pages in `index.html`, `pages/*.html`, and `admin/admin.html` must load behavior through `frontend/scripts/*.js`.
- Shared globals from `frontend/scripts/utils.js`, especially `APP_CONFIG`, `APP_UTILS.escapeHtml()`, and `APP_UTILS.timeStringToMinutes()`, must load before scripts that depend on them.
- CSS must use `frontend/css/main.css` for global design tokens, theme variables, shared components, and layout primitives.
- `frontend/scripts/theme.js` must toggle light/dark theme using DOM attributes/storage.
- Footer modals for Terms, Privacy, About, and Contact are documented as available on all pages.

### Deployment and Operations

- Backend runtime dependencies include `compression`, `cors`, `dotenv`, `express`, `express-rate-limit`, `jsonwebtoken`, `nodemailer`, and `pg`.
- Docker builds must support root frontend image, backend image, and SQL initialization image.
- Kubernetes manifests must deploy frontend, backend, Postgres, Services, ConfigMap, Secret, PV, and PVC.
- Backend Kubernetes probes should use `/api/programs`.
- Frontend Kubernetes probes should use `/`.
- Postgres Kubernetes probes should use TCP checks on port 5432.

## Technical Constraints

- Frontend is static HTML5, CSS3, and vanilla JavaScript. No frontend framework is documented in the current implementation.
- Backend is a modular Node.js/Express API composed by `backend/db-server.js`.
- Route handlers live in `backend/routes/`; database and business logic live in `backend/services/`.
- Database is PostgreSQL with JSONB schedule storage.
- Authentication uses JWT via `jsonwebtoken`.
- Access tokens are short-lived; refresh tokens are persisted and rotated through `REFRESH_TOKENS`.
- Password storage currently uses AES-256-CBC reversible encryption, not one-way hashing.
- Email delivery uses `nodemailer` with SMTP environment variables and a development fallback.
- Dynamic frontend API origin selection is centralized in `frontend/scripts/utils.js` through `APP_CONFIG.API_BASE`.
- Admin and page scripts rely on global functions and script ordering rather than ES modules.
- Many HTML pages use inline `onclick`, `onsubmit`, and `onchange` attributes.
- Deployment supports Docker and Kubernetes; GitHub Pages requires a separately hosted backend and database.
- `k8s/secret.yaml` contains base64 credentials and is documented as dev/local only.
- `k8s/postgres-pv.yaml` uses `hostPath`, which is not portable for managed multi-node clusters.

## Open Questions

- Should passwords be migrated from reversible AES encryption to bcrypt or argon2 before any public release?
- What is the production source of truth for secrets: plain Kubernetes Secret, sealed secrets, a cloud secret manager, or another system?
- Should production use LoadBalancer Services directly or move to ClusterIP plus Ingress?
- Which deployment path is preferred for first release: GitHub Pages plus hosted backend, single-server custom domain, or Kubernetes?
- What exact backend URL should `APP_CONFIG.API_BASE` use for GitHub Pages deployment?
- What validation library, if any, should be used for stricter admin endpoint input validation?
- Should inline HTML event attributes be retained for stability or refactored into `addEventListener` bindings?
- Should `admin/admin.js` be split into API client, renderers, filters, and modal modules?
- Is keyboard shortcut support from `public/notes/KEYBOARD-PLAN.md` approved for implementation, and should shortcut hints appear in the UI?
- What are the acceptance rules for irregular schedules beyond unit mismatch and manual entries?
- Are teams, departments, blocks, representatives, shared schedules, and public/private access required for the first release or later roadmap only?
- Is there an expected automated test strategy?
