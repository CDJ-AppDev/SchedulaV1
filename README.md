# Schedula: Build Your Daily Blocks

[![Build Status](https://img.shields.io/badge/Status-MVP--Prototype-violet.svg)](#sprint-planning--agile-scrum)
[![Stack](https://img.shields.io/badge/Stack-Node.js%20%7C%20PostgreSQL%20%7C%20Vanilla%20JS-blue.svg)](#technology-stack)
[![Documentation](https://img.shields.io/badge/Docs-Proposal%20%26%20Agile%20SCRUM-purple.svg)](#project-documentation)

**Schedula** is a student-first, collaborative academic scheduling platform that combines smart availability detection, preference-aware conflict resolution, and visual timetable customization. Designed to solve the challenges of traditional ad-hoc scheduling and the University Course Timetabling Problem (UCTP), Schedula empowers individual students and collaborative teams to plan their semesters without spreadsheet friction.

---

## 📌 Executive Summary & Project Context

Time management significantly influences academic and professional performance ([Patzak et al., 2025](file:///c:/Users/Win11/Downloads/schedula/public/SchedulaProposal.md#L46)). While single-user calendar applications assist with personal scheduling, they lack mechanisms for groups to share availability, negotiate meeting times, or account for individual preferences without administrative overhead ([Roels & Corbett, 2024](file:///c:/Users/Win11/Downloads/schedula/public/SchedulaProposal.md#L47); [Tran et al., 2023](file:///c:/Users/Win11/Downloads/schedula/public/SchedulaProposal.md#L49)).

### Core Problem Statements
1. **Automatic Conflict & Preference Detection:** How to automatically identify time overlaps and align schedules with user-defined availability and blocked time windows.
2. **Multi-Schedule Management:** How individuals and teams can create, combine, and organize multiple overlapping schedule combinations cleanly.
3. **Seamless Visualization & Customization:** How to provide intuitive visual schedules with easy data import (text/tabular), custom colors, and instant PNG export.

---

## 🎯 Agile SCRUM & Sprint Planning

### Sprint 1 Goal
Build a functional Minimum Viable Product (MVP) prototype of Schedula that demonstrates its primary feature: **Smart Scheduling** (*Preference & Availability Detection*).

### Team Roles & Responsibilities
- **Product Owner:** Jimenez, Jian Jowel *(Manages backlog prioritization and user alignment)*
- **Scrum Master:** Devega, Adrian Nate *(Tracks milestones, removes blockers, and manages time)*
- **Development Team:** Carmona, Devega, Jimenez *(Design, architecture, prototyping, and full-stack implementation)*

---

## 📋 Product Backlog & Feature Breakdown

### Core Features
| Feature | Description & User Story | Status |
| :--- | :--- | :---: |
| **Core 1: Smart Scheduling** | *Preference & Availability Detection:* Detects unavailable time ranges (`BlockedTimes`) and prevents conflicting course selections. | **In Progress** |
| **Core 2: Multi-Schedule Management** | *Team & User Based:* Manage personal and group schedules, duplicate templates, and avoid double-booking. | **In Progress** |
| **Core 3: Schedule Visualization & Customization** | Clean calendar grid, tabular class import, color palette picker, and PNG export capabilities. | **In Progress** |
| **Core 4: Chat Scheduling Assistant** | AI-driven assistant for natural-language scheduling suggestions and deadline delegation. | **To Do** |
| **Core 5: Authentication** | Secure user registration, encrypted passwords, JWT session handling, and email PIN password resets. | **Completed** |
| **Core 6: Authorization** | Role-based access control for personal users, team leaders, and system developers/super admins. | **Completed** |

### Secondary Features
| Feature | Description | Status |
| :--- | :--- | :---: |
| **Secondary 7: Smart Deadlines & Reminders** | Flexible task deadlines and push/email notifications for upcoming meetings. | **To Do** |
| **Secondary 8: Streak Reward System** | Usage streaks to incentivize consistent deadline compliance and attendance. | **To Do** |
| **Secondary 9: Enhanced UI/UX** | Skeuomorphic & glassmorphic design system, responsive layouts, and smooth animations. | **In Progress** |

---

## 💻 Technology Stack

### Current MVP Implementation
- **Frontend:** HTML5, Vanilla CSS3 (Custom Glassmorphism Design System), Vanilla JavaScript (ES6 Modules)
- **Backend:** Node.js, Express.js (RESTful API architecture)
- **Database:** PostgreSQL (Relational schema with `USERS`, `USER_PREFERENCES`, `COURSES`, `SCHEDULES`)
- **Containerization:** Docker & Docker Compose setup

### Planned Rebuild
- **Frontend Rebuild:** Vite + React + TypeScript + Tailwind CSS (as detailed in [NEW_PRD.md](./NEW_PRD.md))

---

## 📂 Project Structure

```text
├── backend/                  # Node.js API server, controllers, routes, & PostgreSQL scripts
│   ├── routes/               # API endpoints (auth, user, courses, admin, etc.)
│   ├── services/             # Database queries & business logic
│   └── sql/                  # Database migration & seed scripts (1setup.sql, etc.)
├── frontend/                 # Client assets and stylesheets
│   ├── css/                  # Modular stylesheets (landing, main, plotter, profile, builder)
│   └── scripts/              # Frontend interactive logic (subjects, profile, plotter, theme)
├── pages/                    # Web pages (index, builder, plotter, profile, login, signup, setup)
├── public/                   # Project proposals, Agile documentation, & notes
│   ├── SchedulaProposal.md   # Comprehensive project proposal & academic research foundation
│   ├── SchedulaAgileSRUM1.md # Sprint planning, product backlog, and retrospective
│   └── TODO.md               # Task list and feature tracking
├── PRD.md                # Updated Product Requirements Document
├── PROGRESS.md               # Implementation progress tracking
└── README.md                 # Project README
```

---

## 🛡️ Responsible AI & Ethical Compliance

- **AI Assistance:** AI tools were utilized strictly for syntax explanations, boilerplate scaffolding, and logic debugging. 
- **Human Verification:** All generated code and architecture designs underwent rigorous review, refactoring, and local runtime verification by the development team.
- **Data Privacy:** User data and survey responses are strictly anonymized and handled in compliance with privacy guidelines.

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended)
- [PostgreSQL](https://www.postgresql.org/) (v14+ recommended)

### Local Setup Instructions

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/CDJ-AppDev/SchedulaV1.git
   cd SchedulaV1
   ```

2. **Backend Configuration & Execution:**
   ```bash
   cd backend
   npm install
   node db-server.js
   ```

3. **Access the Web Application:**
   Open your browser and navigate to `http://localhost:3000` (or `http://localhost:8080` if using a static file server for the root directory).

---

## 📄 References & Academic Foundation

For full citation list and detailed literature review, see [public/SchedulaProposal.md](./public/SchedulaProposal.md):
- **Patzak, A., Zhang, X., & Vytasek, J. (2025).** Boosting productivity and wellbeing through time management. *Frontiers in Education*.
- **Roels, G., & Corbett, C. J. (2024).** Too many meetings? Scheduling rules for team coordination. *Management Science*.
- **Tran, T. N. T., Felfernig, A., & Le, V. M. (2023).** An overview of consensus models for group decision-making. *User Modeling and User-Adapted Interaction*.
- **Abdipoor, S., et al. (2023).** Meta-heuristic approaches for the University Course Timetabling Problem. *Intelligent Systems With Applications*.

---

*© 2026 CDJ Builders (De La Salle University - Dasmarinas)*