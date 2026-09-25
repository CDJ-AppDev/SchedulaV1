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
1. [x] Finish creating `NEW_PRD.md`.
2. [x] Fully remove any remaining k8s deployment files.
3. [x] Update database schema (`backend/sql/`) to include basic preference/availability tables or modify existing `courseslot`/`schedulelist` to support them.
4. [x] Modify frontend (`frontend/scripts/` & `pages/`) to add a simple interface for setting availability/preferences.
5. [x] Update backend endpoints to calculate Smart Scheduling based on the user's preferences.
6. [x] Handoff to next agent if token limit is reached.

## Status
- **MVP Ready**: The Smart Scheduling core feature is implemented. Users can define blocked times, and the system prevents conflicting course additions.
