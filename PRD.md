# Product Requirements Document - Schedula (MVP)

## Overview

Schedula (previously Academic Schedule Builder) is a web application for building, saving, and visualizing academic and team schedules. The MVP focuses on addressing the core scheduling problem: detecting preferences and availability to avoid conflicts automatically, known as **Smart Scheduling**.

It leverages the existing architecture (Node/Express backend, PostgreSQL database, Vanilla HTML/CSS/JS frontend) and data models from ASB, evolving them only as strictly necessary to introduce preference and availability detection. 

## Goals & Non-Goals

### Goals
- Retain the existing user authentication, sessions, and catalog CRUD capabilities.
- Introduce **Smart Scheduling (MVP Core Feature 1)**:
  - Users can input their availability (free/busy times).
  - The system detects availability constraints to prevent scheduling conflicts.
  - Basic preference settings (e.g., preferred time blocks).
- Maintain existing codebase structures to minimize rewrite overhead. Use similar database schemas and API designs.
- Fully remove any Kubernetes (k8s) references to simplify deployment to simpler infrastructure (like GitHub Pages + Hosted Backend).
- Prepare the system for future multi-schedule management and chat scheduling assistants (not in MVP).

### Non-Goals
- Full rewrite into React or TypeScript.
- Real-time collaborative scheduling or consensus-building models (save for future releases).
- Kubernetes deployments (explicitly removed).
- Secondary features like streak rewards and smart deadlines.

## Users & Use Cases

### Default User (Student / Professional)
- Onboards through setup and profile pages.
- Can input and edit availability hours (e.g., "Not available Mondays 8AM-12PM").
- Uses the schedule builder to see courses or meetings filtered by their availability.
- Prevents course slot addition if it violates availability constraints.

## Functional Requirements

### 1. Availability Management
- The user profile or a new `user_preferences` table will store blocked times and availability matrices.
- The frontend will have a UI section (e.g., in `profile.html` or a new `preferences.html`) to configure blocked hours.
- `GET /api/preferences` and `PUT /api/preferences` endpoints to manage these settings.

### 2. Smart Conflict Detection
- In addition to checking for overlapping classes (`checkScheduleConflict()`), the builder must check if a selected course slot overlaps with the user's declared busy/unavailable times.
- `frontend/scripts/subjects.js` will incorporate availability checks before adding a slot.

### 3. Existing Architecture Reuse
- **Database:** Reuse `user_credentials`, `user_profile`, `courses`, `courseslots`, `schedules`. Add lightweight JSONB columns or auxiliary tables for preferences.
- **Frontend:** Vanilla JS (`classes.js`, `subjects.js`, `plotter.js`) will continue to be used. CSS styling uses existing `main.css`.
- **Backend:** Node.js/Express (`backend/routes/`, `backend/services/`, `backend/db-server.js`).

## Technical Constraints
- The backend remains Node.js/Express and PostgreSQL.
- Frontend remains static HTML/JS/CSS.
- No Kubernetes. Deployment targets Docker-compose or simple PaaS (e.g., Render, Railway) + static hosting.
- Token-efficient agent collaboration through `PROGRESS.md`.
