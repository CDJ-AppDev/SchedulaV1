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

### Phase 3 - Frontend Plan (awaiting review)

1. **Map page contracts.** Inventory every page script and HTML element that currently calls `/term`, `/schedule`, `/courses`, `/programs`, or sends course-shaped JSON. Record the replacement endpoint and payload before editing.
2. **Generalize the builder markup.** Replace course import fields with required `title`, `start_at`, `end_at`, and `timezone`; add an `Add details` disclosure for nullable description, location, modality, category, color, priority, status, recurrence rule, reminder offset, notes, and participants.
3. **Rewrite builder state/API calls.** Adapt `frontend/scripts/subjects.js` to `/api/schedules` and `/api/schedules/:id/events`, remove term/unit/regular/irregular/course-slot state, retain schedule switching, save/delete, escaping, and generic overlap presentation.
4. **Replace academic data classes.** Remove `Professor`, `CourseSlot`, and `Course` from `frontend/scripts/classes.js`; use the event payload directly unless a generic event helper is demonstrably needed.
5. **Generalize visualization.** Update plotter labels, controls, fallbacks, and block rendering from course/code/professor/room fields to event title, description, location, participant, and time fields. Preserve color customization and PNG export while removing fixed academic wording.
6. **Update profile/preferences.** Remove program/year/semester selection and `/term` calls. Keep account editing, connect preferences to `/api/preferences`, and connect availability CRUD to `/api/availability`.
7. **Update onboarding and dashboard copy.** Make setup/profile/home pages generic for personal and team scheduling; remove academic labels, assumptions, and dead redirects without adding a replacement component unless required.
8. **Reduce admin UI.** Remove programs, terms, courses, professors, and course-slot tabs/forms/filters. Keep generic users and schedules administration, updating columns and payloads to UUIDs and event counts.
9. **Clean CSS and assets.** Remove orphaned academic selectors, labels, and assets only after markup references are gone. Preserve the existing visual direction and avoid introducing a new design system.
10. **Frontend validation.** Run a global academic-term search over runtime files, syntax-check browser scripts, start the backend, manually verify login/profile/preferences/availability, create/edit/delete an event, verify a conflict, reload, plot, and export.

**Approval gate:** Do not begin Phase 3 implementation until this checklist and the generic event UI contract are approved.

### Current Risks

- The database migration is applied, but the frontend still calls legacy `/term`, `/schedule`, and academic payloads until Phase 3.
- Existing unrelated worktree changes were preserved, including edits to this file and deleted legacy documentation.
- Password encryption remains reversible in the existing helper and is outside the current domain migration scope.
