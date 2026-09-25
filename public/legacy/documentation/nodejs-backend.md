# Node.js Backend — Feature Documentation

## Overview
The backend is a modular Node.js/Express API that handles authentication, user profile management, course catalog retrieval, schedule persistence, and administrative CRUD operations. It acts as the intermediary between the frontend and the PostgreSQL database.

## Key Files & Locations
- **Core Application**:
  - `backend/db-server.js`: Main Express app composition, mounted routers, middleware wiring, and server startup.
- **Routing & Controllers**:
  - `backend/routes/auth.js`: Login, signup, token refresh, logout, password reset.
  - `backend/routes/user.js`: Profile updates, term selection.
  - `backend/routes/courses.js`: Course retrieval, schedule saving/loading.
  - `backend/routes/programs.js`: Cached program listings.
  - `backend/routes/admin.js`: Administrative CRUD endpoints.
- **Services (Business & DB Logic)**:
  - `backend/services/*.js`: SQL queries (using `pg` parameterized queries), business rules, JWT rotation, and admin transaction logic.
- **Middleware**:
  - `backend/middleware/auth.js`: `authenticateToken` and `adminOnly` route guards.
  - `backend/middleware/errorHandler.js`: Centralized Express error handler.
- **Configuration & Utilities**:
  - `backend/config/env.js`, `backend/config/database.js`: Environment and connection pool configuration.
  - `backend/utils/crypto.js`, `backend/utils/email.js`: AES encryption helpers and nodemailer configuration.

## Features
- **Session & Auth Management**
  - Generates short-lived JWT access tokens and long-lived refresh tokens (rotated transactionally).
  - Protects private routes via `authenticateToken` and restricts dashboard actions via `adminOnly`.
- **Schedule Management**
  - Saves and retrieves student schedules in an optimized JSONB format, batch-loading related course slots to prevent N+1 query issues.
- **Admin Dashboard Integration**
  - Manages cascading updates (e.g., updating a program automatically generates/regenerates associated academic terms).
  - Enforces time validation (7:00 AM to 8:00 PM) for course slots.
- **Security & Reliability**
  - Uses `cors`, `compression`, and `express-rate-limit`.
  - Uses `asyncHandler` wrappers to pass exceptions directly to a centralized error handler.

## Dependencies
- **PostgreSQL**: Relies entirely on the schema defined in `backend/sql/1setup.sql`.
- **Third-Party Libraries**: `express`, `pg`, `jsonwebtoken`, `nodemailer`, `cors`, `dotenv`.

## TODOs & Known Limitations
- **Password Hashing**: Currently, user passwords are encrypted using reversible AES-256-CBC. This must be migrated to a one-way hashing algorithm like `bcrypt` or `argon2` before public release.
- **Validation**: While core auth flows have input validation, many admin endpoints rely on basic type checking. Integrating a robust validation library (like Zod or Joi) is recommended.
- **Refactoring**: Keep routes thin. Move any lingering raw SQL strings out of route files and into `backend/services/`.
