# SQL Database — Feature Documentation

## Overview
The PostgreSQL database forms the persistence layer for Academic Schedule Builder. It uses relational schemas to structure the academic catalog, authentication data, and user profiles, and utilizes NoSQL (JSONB) features to efficiently store user schedules.

## Key Files & Locations
All initialization files are located in `backend/sql/`.
- `1setup.sql`: Defines all schemas, tables, constraints, foreign keys, and indexes. **This must be run first.**
- `1terms.sql`: Seed data for academic `program` and `term` structures.
- `2users.sql`: Seed users and profiles (includes admin and test accounts with AES-encrypted passwords).
- `3professors.sql`: Seed data for instructors.
- `4courses.sql`: Seed data for courses, term mappings, and meeting slots.

## Data Model & Features
- **User Management**
  - `user_credentials`: Stores email, encrypted passwords, roles (`Admin` or `Default`), and timestamps.
  - `user_profile`: Stores display name and links to the selected `termid`.
  - `password_reset_token`: Temporary 6-digit PIN tracking for password recovery.
- **Academic Catalog (Relational)**
  - `program` & `term`: Defines the academic tree. A `term` is a unique composite of `(programid, yearlevel, semester)`.
  - `course` & `course_term`: The course dictionary and its many-to-many relationship with available terms.
  - `professor` & `courseslot`: Physical meeting times bounded by days/times and assigned to professors.
- **Schedule Storage (JSONB)**
  - `schedule`: Stores named schedule variants per user (`schedulename`, `totalunits`, `regular` status).
  - `schedulelist`: A `JSONB` column inside the `schedule` table storing an array of selected course slots and manual, irregular entries. This avoids complex many-to-many junction tables for highly volatile, draft schedules.

## Dependencies
- **Node.js Backend**: The `backend/services/*.js` modules connect via the `pg` pool. All queries must be parameterized to prevent SQL injection.
- **Docker/K8s**: The database is designed to run in a containerized environment (see `backend/sql/Dockerfile`).

## TODOs & Known Limitations
- **Reversible Password Encryption**: Passwords are saved using AES-encryption instead of standard one-way hashes (bcrypt/argon2). This represents a major security vulnerability that must be resolved prior to launch.
- **Seed Data Security**: `2users.sql` contains realistic credentials and administrative emails. Do not deploy these seed users to a live production environment.
- **Migration Strategy**: The project currently relies on dropping and recreating tables or running manual ALTER statements. Implementing a robust migration runner (like Knex or Flyway) is strongly recommended for production lifecycles.
