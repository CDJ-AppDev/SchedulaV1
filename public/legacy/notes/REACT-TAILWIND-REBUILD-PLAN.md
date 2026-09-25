# React + Tailwind Frontend Rebuild Plan

## Summary

Rebuild the Academic Schedule Builder frontend as a parallel **Vite + React + TypeScript + Tailwind CSS** single-page app. The existing static HTML/CSS/vanilla JavaScript frontend remains intact until the React app reaches feature parity and passes manual verification.

The rebuild must preserve the current Express API contract and the existing schedule JSON shape. No backend endpoint changes are part of this migration unless a later session documents and approves a separate backend task.

This plan is designed for multiple agent sessions. Each session has a bounded goal, expected files, verification steps, and a required handoff note so work can resume cleanly after usage limits.

## Current Frontend Baseline

- Static entry points:
  - `index.html`
  - `pages/login.html`
  - `pages/signup.html`
  - `pages/forgot-password.html`
  - `pages/setup.html`
  - `pages/home.html`
  - `pages/builder.html`
  - `pages/plotter.html`
  - `pages/profile.html`
  - `admin/admin.html`
- Current frontend assets:
  - `frontend/css/*.css`
  - `frontend/scripts/*.js`
  - `admin/admin.js`
- Backend API:
  - `backend/db-server.js`
  - Existing `/api/*` and `/api/admin/*` routes remain the source of truth.
- Deployment:
  - Root `Dockerfile` currently copies static files into an Nginx image.
  - React cutover should happen only after parity verification.

## Target Architecture

Create a new workspace:

```text
frontend-react/
  package.json
  index.html
  vite.config.ts
  tsconfig.json
  tailwind.config.ts
  postcss.config.js
  src/
    main.tsx
    app/
    api/
    components/
    features/
    hooks/
    lib/
    providers/
    routes/
    styles/
    types/
```

Recommended dependencies:

- `react`
- `react-dom`
- `react-router-dom`
- `typescript`
- `vite`
- `tailwindcss`
- `postcss`
- `autoprefixer`
- `html2canvas`

Do not add an animation library in v1. Use Tailwind/CSS transitions first. Reconsider only if a later audit proves CSS cannot meet the requirement.

## Route Map

| Current page | React route | Notes |
|---|---|---|
| `index.html` | `/` | Landing page, theme toggle, calls to signup/login |
| `pages/login.html` | `/login` | Email/password auth, admin redirect |
| `pages/signup.html` | `/signup` | Signup validation, then setup flow |
| `pages/forgot-password.html` | `/forgot-password` | PIN request/reset flow |
| `pages/setup.html` | `/setup` | Program/year/semester cascading setup |
| `pages/home.html` | `/home` | Student dashboard |
| `pages/builder.html` | `/builder` | Schedule builder |
| `pages/plotter.html` | `/plotter` | Timetable visualizer and PNG export |
| `pages/profile.html` | `/profile` | Account and academic settings |
| `admin/admin.html` | `/admin` | Admin CRUD dashboard |

Use React Router route guards:

- Public routes: `/`, `/login`, `/signup`, `/forgot-password`
- Authenticated student routes: `/setup`, `/home`, `/builder`, `/plotter`, `/profile`
- Admin route: `/admin`

## API Compatibility Requirements

Keep these behaviors compatible with the current frontend:

- Token storage:
  - Store JWT token in `localStorage`.
  - Send authenticated requests with `Authorization: Bearer <token>`.
- Session restore:
  - Refresh user state through `/api/user-session`.
  - Redirect non-admin users away from `/admin`.
- API base resolution:
  - Local development should target `http://localhost:3000/api`.
  - Hosted/co-located production should default to same-origin `/api`.
  - Keep this logic centralized in one API config module.
- Schedule persistence:
  - `GET /api/schedule`
  - `PUT /api/schedule`
  - `DELETE /api/schedule`
  - `DELETE /api/schedule/:id`
  - Preserve current regular and irregular schedule entry shapes.
- Admin:
  - Use existing `/api/admin/users`, `/api/admin/programs`, `/api/admin/terms`, `/api/admin/courses`, `/api/admin/professors`, `/api/admin/courseslots`, and `/api/admin/schedules`.

## Shared TypeScript Models

Define shared types before implementing feature screens:

- `UserSession`
- `AuthUser`
- `Program`
- `Term`
- `Professor`
- `Course`
- `CourseSlot`
- `AvailableCourse`
- `Schedule`
- `ScheduleEntry`
- `RegularScheduleEntry`
- `IrregularScheduleEntry`
- `AdminResource`
- `ApiError`

Hard rule: if the backend response is ambiguous, model the current observed frontend usage first and document uncertainty in the session handoff. Do not silently invent a new API shape.

## Redundancy Audit

Complete this audit before building reusable components.

### CSS Redundancy Inventory

Inspect:

- `frontend/css/main.css`
- `frontend/css/landing.css`
- `frontend/css/dashboard.css`
- `frontend/css/builder.css`
- `frontend/css/plotter.css`
- `frontend/css/profile.css`
- `frontend/css/admin.css`
- `frontend/css/footer.css`

Inventory repeated patterns:

- Buttons
- Inputs/selects/textareas
- Modals/overlays
- Cards/panels
- Tables
- Badges/status pills
- Headers/navigation
- Filters/search rows
- Empty/loading/error states
- Theme tokens
- Shadows/radii/focus rings
- Page-level backgrounds

Deliverable: create an audit section in the session handoff with duplicates found and the React component that will replace each duplicate.

### JavaScript Redundancy Inventory

Inspect:

- `frontend/scripts/utils.js`
- `frontend/scripts/auth.js`
- `frontend/scripts/theme.js`
- `frontend/scripts/popup.js`
- `frontend/scripts/setup.js`
- `frontend/scripts/profile.js`
- `frontend/scripts/subjects.js`
- `frontend/scripts/plotter.js`
- `admin/admin.js`

Inventory repeated logic:

- API base resolution
- Auth/token retrieval
- `localStorage` user/session handling
- Time parsing
- HTML escaping
- Modal/confirm behavior
- Fetch error handling
- Loading/empty state rendering
- Pagination
- Admin dependency fetches
- Program -> term -> course cascading filters

Deliverable: map each repeated behavior into a React module, hook, provider, or component.

## Design System Direction

Use one Tailwind design system across the React app.

### Palette

- Base: zinc/slate neutrals.
- Accent: one restrained academic/product accent.
- Avoid the current purple-heavy glow aesthetic unless a later brand decision explicitly keeps it.
- Support both light and dark modes with CSS variables and Tailwind tokens.

### Layout

- Use shared app shells:
  - `MarketingShell`
  - `AuthShell`
  - `StudentShell`
  - `AdminShell`
- Use consistent max widths:
  - Main app content: `max-w-7xl`
  - Dense admin tables: full-width within safe gutters.
- Avoid nested cards.
- Use cards only for repeated items, modals, or intentionally framed tools.

### Components

Build these shared components before feature screens:

- `Button`
- `IconButton`
- `Input`
- `Select`
- `Checkbox`
- `Field`
- `Modal`
- `ConfirmDialog`
- `Alert`
- `Badge`
- `Card`
- `Table`
- `Pagination`
- `Tabs`
- `EmptyState`
- `ErrorState`
- `Skeleton`
- `PageHeader`
- `AppNav`
- `ThemeToggle`

### Motion

- Animate only `transform` and `opacity`.
- Add `prefers-reduced-motion` support.
- Use consistent durations and easing tokens.
- Required states:
  - Button hover/active feedback.
  - Modal enter/exit transition.
  - Page content fade/slide.
  - Skeleton shimmer.
  - Timetable block entrance.
- Avoid scroll listeners and layout-thrashing animations.

## Multi-Session Implementation Plan

Each session must start by reading this file, `PRD.md`, and `CODEX.md`.

Each session must end with this handoff format:

```md
## Session Handoff

### Files changed
- ...

### Routes/features completed
- ...

### API assumptions
- ...

### Known gaps
- ...

### Verification performed
- ...

### Next recommended session
- ...
```

### Session 1: Scaffold and Architecture

Goal: create the React workspace and the app skeleton.

Tasks:

- Create `frontend-react/` with Vite, React, TypeScript, and Tailwind.
- Configure path aliases if useful, but keep them simple.
- Add React Router route skeletons for all target routes.
- Add `apiClient` with API base resolution and authenticated request support.
- Add `AuthProvider` for token, user, session restore, login/logout helpers, and admin detection.
- Add `ThemeProvider` for light/dark mode and persistence.
- Add route guards for authenticated and admin routes.
- Add shared type stubs for API/domain models.
- Add placeholder pages for all routes.

Verification:

- `npm install`
- `npm run build`
- Local dev server renders all routes.
- Theme toggle changes app theme.
- Route guards do not crash without a backend.

Handoff expectation:

- Document exact dependencies installed.
- Document any API response assumptions made in type stubs.

### Session 2: Design System and Reusable Components

Goal: replace page-specific style duplication with a reusable Tailwind component layer.

Tasks:

- Perform the CSS and JS redundancy audit described above.
- Implement the shared component set.
- Add consistent empty, loading, and error states.
- Add modal and confirm dialog primitives with Escape handling.
- Add a temporary `/components` showcase route or equivalent local-only component preview.
- Define final Tailwind theme tokens.

Verification:

- `npm run build`
- Component showcase displays light/dark states.
- Keyboard focus states are visible.
- Reduced-motion mode does not depend on animation.

Handoff expectation:

- Include the audit inventory and component replacements.
- List any legacy CSS patterns intentionally not carried forward.

### Session 3: Auth and Onboarding

Goal: rebuild public authentication and setup flows.

Tasks:

- Implement `/login`.
- Implement `/signup`.
- Implement `/forgot-password`.
- Implement `/setup` with cascading program/year/semester selection.
- Preserve token persistence and admin redirect behavior.
- Preserve password reset PIN request/reset API behavior.
- Add validation messages equivalent to current flows.

Verification:

- Signup -> setup path works against local backend.
- Login stores token and user state.
- Admin login routes to `/admin`.
- Forgot password handles success and error responses.
- Refresh restores session when token is valid.

Handoff expectation:

- Document any backend response shape mismatches.

### Session 4: Student Dashboard and Profile

Goal: rebuild home and profile workflows.

Tasks:

- Implement `/home` with navigation to Builder and Plotter.
- Implement `/profile` account editing.
- Implement username/email/password edit affordances.
- Implement password visibility toggle.
- Implement academic program/year/semester update.
- Preserve theme persistence across student pages.

Verification:

- Profile loads current user data.
- Account edits call the expected API endpoints.
- Academic term changes update local and server state.
- Student nav works on desktop and mobile.

Handoff expectation:

- Note any profile fields that are unavailable from current backend responses.

### Session 5: Builder

Goal: rebuild the schedule builder with backend-compatible schedule persistence.

Tasks:

- Implement course loading from `GET /api/courses`.
- Group available course slots by course code/name.
- Implement accordion-style course browsing.
- Implement add course slot.
- Implement irregular manual course entry.
- Preserve conflict detection:
  - Same day.
  - Overlapping start/end time.
  - Regular and irregular entries both checked.
- Preserve unit tally and regular/irregular status.
- Implement multiple schedule selector, create new schedule, switch schedules, save schedule, remove course, delete schedule.
- Preserve current schedule payload shape.

Verification:

- Add database-backed course slot.
- Attempt conflicting course and confirm it is blocked.
- Add irregular course.
- Save and reload schedule.
- Switch between schedules.
- Delete course and schedule.
- Compare saved payload with legacy frontend behavior.

Handoff expectation:

- Include example saved regular and irregular schedule payloads.

### Session 6: Plotter

Goal: rebuild timetable visualization and PNG export.

Tasks:

- Implement saved schedule picker.
- Implement timetable grid from 7 AM to 8 PM.
- Implement Monday-Saturday columns.
- Implement proportional course block positioning.
- Support regular and irregular entries.
- Implement display toggles:
  - Hide professor.
  - Hide code.
  - Hide name.
  - Hide time.
  - Hide day.
  - Hide room.
- Implement block color and font color controls.
- Implement PNG export with `html2canvas`.

Verification:

- Generate a timetable from a saved schedule.
- Toggle each display option.
- Change colors and confirm blocks update.
- Export PNG and visually inspect the result.
- Test narrow viewport for no layout overlap.

Handoff expectation:

- Document timetable geometry assumptions and export limitations.

### Session 7: Admin Dashboard

Goal: rebuild the full admin CRUD dashboard.

Tasks:

- Implement admin shell and tab navigation.
- Implement users, programs, terms, courses, professors, course slots, and schedules tabs.
- Implement pagination.
- Implement filters:
  - Terms by program.
  - Courses by program and term.
  - Professors by department.
  - Course slots by program, term, course, and professor department.
- Implement create/edit/delete modals.
- Implement dependency fetching for modal selectors.
- Preserve read-only schedules view with delete option.

Verification:

- Each admin tab loads.
- Create/edit/delete works for each mutable resource.
- Cascading filters update correctly.
- Non-admin cannot access `/admin`.
- Admin schedules render user, units, status, and timestamps.

Handoff expectation:

- Document all admin API payload shapes used by the React app.

### Session 8: Cutover and Cleanup

Goal: switch production frontend serving to the React build after parity approval.

Tasks:

- Update root `Dockerfile` to build `frontend-react/` and copy `dist` into Nginx.
- Preserve `k8s/nginx.conf` API proxy behavior.
- Keep legacy static files in place until explicit cleanup approval.
- Add or update notes explaining how to run/build the React frontend.
- Run full parity checklist.

Verification:

- React production build succeeds.
- Docker image serves React app.
- SPA refresh works on nested routes.
- `/api` proxy still reaches backend.
- Kubernetes frontend probe `/` still succeeds.

Handoff expectation:

- State whether legacy static frontend is still present.
- Do not delete legacy files unless separately requested.

## Test Plan

### Automated Checks

Minimum checks once `frontend-react/` exists:

```bash
cd frontend-react
npm run build
```

If linting is added:

```bash
cd frontend-react
npm run lint
```

If tests are added:

```bash
cd frontend-react
npm test
```

### Manual Parity Scenarios

Use `public/notes/PRESENTATION.md` as the functional parity baseline.

- Landing:
  - Show landing page.
  - Toggle light/dark theme.
  - Navigate to signup/login.
- Auth and onboarding:
  - Signup.
  - Show validation error for password mismatch.
  - Select Program -> Year -> Semester.
  - Login and logout.
  - Refresh page and restore session.
- Student builder:
  - Add course from available classes.
  - Attempt duplicate/conflicting course.
  - Add irregular manual course.
  - Create new schedule.
  - Switch schedules.
  - Save schedule.
  - Delete course and schedule.
- Plotter:
  - Select schedule.
  - Generate timetable.
  - Toggle professor/code/name/time/day/room.
  - Change block and font colors.
  - Export PNG.
- Profile:
  - Edit username.
  - Edit email.
  - Edit password.
  - Toggle password visibility.
  - Change academic term.
- Admin:
  - Users CRUD.
  - Programs CRUD.
  - Terms CRUD.
  - Courses CRUD.
  - Professors CRUD.
  - Course slots CRUD.
  - Schedules read/delete.
  - Cascading filters.
- Footer/modals:
  - Terms modal.
  - Privacy modal.
  - About modal.
  - Contact content.

### Visual QA

- Light and dark themes use the same component structure.
- Mobile layouts do not overflow horizontally.
- Auth forms, builder, plotter, and admin tables have no overlapping text.
- Loading states are layout-stable.
- Empty states explain the next action.
- Error states are visible and recoverable.
- Modal focus and Escape behavior work.
- Active buttons provide tactile feedback.
- Reduced-motion users do not receive unnecessary animation.

## Non-Goals for This Migration

- Do not migrate the backend to TypeScript.
- Do not redesign the database schema.
- Do not add teams, departments, blocks, representatives, shared schedules, public/private schedule access, or keyboard shortcuts.
- Do not remove legacy frontend files during the parallel migration.
- Do not change password security behavior as part of this frontend rebuild.
- Do not introduce React Native, Next.js, or server-side rendering.

## Acceptance Criteria

The React rebuild is ready for cutover only when:

- All target routes exist in React.
- Student and admin feature parity is verified against `public/notes/PRESENTATION.md`.
- Schedule save/load payloads remain compatible with the existing backend.
- `npm run build` succeeds in `frontend-react/`.
- Docker/Nginx can serve the React `dist` build.
- Refreshing nested SPA routes works.
- Light/dark themes are consistent across all pages.
- No redundant second styling system is introduced after the Tailwind design system is established.
- A final session handoff confirms known gaps are either resolved or explicitly approved for later work.

