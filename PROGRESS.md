# Schedula Handover Progress

## Goal
Transition "Academic Schedule Builder (ASB)" into "Schedula", preparing a simple MVP. 
- Target MVP Feature: Smart Scheduling (Preference and Availability Detection).
- Remove all k8s integrations.
- Reuse ASB code structures and DB designs. Only change code when necessary.

## Completed Tasks
- [x] Read ASB and Schedula documentations (`SchedulaAgileSRUM1.md`, `SchedulaProposal.md`, `PRD.md`, `graph.html`, `GRAPH_REPORT.md`).
- [x] Create this `PROGRESS.md` handover file to be token efficient.

## Next Steps
1. [x] Finish creating `PRD.md`.
2. [x] Fully remove any remaining k8s deployment files.
3. [x] Update database schema (`backend/sql/`) to include basic preference/availability tables or modify existing `courseslot`/`schedulelist` to support them.
4. [x] Modify frontend (`frontend/scripts/` & `pages/`) to add a simple interface for setting availability/preferences.
5. [x] Update backend endpoints to calculate Smart Scheduling based on the user's preferences.
6. [x] Handoff to next agent if token limit is reached.

## Status
- **MVP Ready**: The Smart Scheduling core feature is implemented. Users can define blocked times, and the system prevents conflicting course additions.

## Refactor Log

### Phase 1 - Database

- Added `docs/SCHEDULA_DB_PLAN.md`, `docs/SCHEDULA_SCHEMA.md`, and `docs/DB_UPDATE_INSTRUCTIONS.md`.
- Replaced academic SQL initialization files with generic UUID-based PostgreSQL migrations under `backend/sql/migrations/`.
- Applied migrations and generic demo seeds directly to the configured local PostgreSQL database with `psql`; Docker was unavailable and is not part of the workflow.
- Created generic identity, profiles, preferences, schedules, events, recurrence, availability, groups, memberships, sharing, consolidated views, invitations, and token tables.
- Added range-based GiST indexes for event and availability overlap queries.

### Phase 2 - Backend (complete)

- `backend/db-server.js` now mounts generic schedule routes and no longer mounts academic course/program routes.
- Added generic schedule/event CRUD and conflict lookup in `backend/routes/schedules.js` and `backend/services/scheduleService.js`.
- Migrated authentication persistence to UUID users/profiles and hashed refresh/reset token tables.
- Added generic profile, preferences, and availability service/route implementations.
- Completed backend alignment: removed legacy admin/course/program route and service code, updated authorization to the new `users.platform_role`, and aligned authentication password storage with PostgreSQL `crypt()` hashes.
- Verified against the live local API: login, schedule creation, event creation, overlap detection, event update, event deletion, and schedule reload all passed. Temporary verification data was soft-deleted afterward.
- Remaining refactor work: update frontend callers and UI payloads, remove academic copy/styles/assets, and complete end-to-end frontend verification.

### Phase 3 - Frontend (complete)

- Replaced the academic builder with a generic event form using required title/start/end/timezone fields and an `Add details` disclosure for optional metadata.
- Rewired builder persistence to `/api/schedules` and `/api/schedules/:scheduleId/events`, including generic overlap checks and event removal.
- Replaced course-based plotter data with normalized schedule events and generic title/category/details/location rendering while preserving color customization and PNG export.
- Replaced academic profile setup with generic display name, timezone, locale, preferences, and availability controls.
- Reduced the admin UI to generic users and schedules and removed the obsolete academic data classes.
- Removed active academic copy and orphaned builder/profile/admin/plotter selectors from the frontend runtime surface.
- Validated all browser/admin scripts with `node --check` and verified profile/session, preferences, availability CRUD, and live API connectivity against PostgreSQL.

### Current Risks

- The frontend verification covered API-backed workflows; visual browser/PNG verification remains a manual check in the target browser environment.
- Existing unrelated worktree changes were preserved, including edits to this file and deleted legacy documentation.
- Password encryption remains reversible in the existing helper and is outside the current domain migration scope.
