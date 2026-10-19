# Product Requirements Document - Schedula

## Overview

Schedula is a general-purpose, team-oriented schedule builder. It lets people create calendars, add time-bounded events, detect overlaps, manage availability and preferences, visualize schedules, and prepare for group scheduling without changing the ownership model later.

The current product remains a static HTML/CSS/vanilla JavaScript frontend, a Node.js/Express backend, and PostgreSQL. The implementation should reuse the existing builder, plotter, authentication, and account flows while removing domain-specific catalog assumptions.

## Goals

- Provide reliable personal schedule and event CRUD.
- Require only generic event fields: `title`, `start_at`, `end_at`, `timezone`, and owner.
- Keep optional event details nullable and hidden behind an `Add details` UI disclosure.
- Detect overlaps using UTC range comparisons and expose conflicts without silently deleting or rejecting user data.
- Store profiles, preferences, and availability in first-class tables.
- Keep every schedule ready for future group ownership, sharing, memberships, invitations, and consolidated views.
- Preserve schedule visualization, color customization, and PNG export.
- Use parameterized PostgreSQL queries and centralized authentication/error handling.

## Non-Goals

- No catalog, curriculum, term, instructor, facility, enrollment, or academic-calendar model.
- No React/TypeScript rewrite.
- No Kubernetes or application/database image coupling.
- No real-time collaboration requirement in the first generic cut.
- No AI assistant, streak system, or deadline reward system in this phase.

## User Experience

### Personal scheduling

A user signs in, creates a schedule, adds events, edits or deletes them, and views the schedule as a list or timetable. An event requires a title and valid start/end timestamps. Optional details include description, location or URL, modality, category/tag, color, priority, status, recurrence rule, reminder offset, notes, and participants.

### Availability and preferences

A user can manage free/busy availability blocks and preferences such as preferred times, buffer minutes, modality preference, default view, notifications, time-of-day preferences, and conflict tolerance. These values are structured so future SchedulaML features can consume them without changing the core event model.

### Teams later

A schedule always has an `owner_user_id` and may have a nullable `group_id`. Future memberships, shares, invitations, and consolidated views attach to those existing rows rather than requiring a breaking ownership migration.

## Backend Contract

- Authentication: `/api/signup`, `/api/login`, `/api/refresh`, `/api/logout`, password reset routes.
- User: `/api/user-session`, `/api/user/profile`, `/api/preferences`, and `/api/availability`.
- Schedules: `/api/schedules` and `/api/schedules/:scheduleId`.
- Events: `/api/schedules/:scheduleId/events` and `/api/events/:eventId`.
- Conflict lookup: `/api/events/conflicts` with `start_at`, `end_at`, optional `schedule_id`, and optional `event_id`.
- Admin: generic user and schedule administration only.

All requests use parameterized SQL. Routes stay thin; services own SQL and business rules. The live schema and constraints are documented in [backend/schema.md](backend/schema.md) and [docs/SCHEDULA_DB_PLAN.md](docs/SCHEDULA_DB_PLAN.md).

## Frontend Requirements

- Reuse existing Builder and Plotter workflows.
- Remove course/professor/room/unit/term/program labels, state, API calls, and filters.
- Keep optional fields behind an `Add details` disclosure.
- Keep dynamic rendering escaped or use `textContent`.
- Preserve responsive layouts, theme controls, schedule switching, conflict feedback, color controls, and PNG export.
- Keep profile/account editing and add generic preference and availability management where the existing profile surface already provides it.

## Verification

The release path must verify: database migration and seed, signup/login, profile update, preference update, availability CRUD, schedule CRUD, event CRUD, overlap detection, reload persistence, timetable rendering, and export. A global search must resolve or justify remaining academic terms in runtime code and documentation.
