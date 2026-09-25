# HTML Pages — Feature Documentation

## Overview
Static HTML pages form the UI surface for the Academic Schedule Builder, including public authentication/setup pages, core app pages (home/builder/plotter/profile), and a private admin dashboard page.

## Key Files & Locations
- Root entry:
  - `index.html`: landing entry
- Public app pages:
  - `pages/login.html`, `pages/signup.html`, `pages/forgot-password.html`
  - `pages/setup.html`: initial program/year/semester selection
  - `pages/home.html`: main dashboard
  - `pages/builder.html`: schedule builder
  - `pages/plotter.html`: schedule plotter
  - `pages/profile.html`: user settings/profile
- Private admin:
  - `admin/admin.html`: admin dashboard UI shell

## Features
- **Page-level composition**: pages are mostly static documents that mount behavior by loading `frontend/scripts/*.js`.
- **Common header layout**: app pages share a header/navigation structure styled by `frontend/css/main.css`.
- **Admin gating**: admin page expects a valid JWT token; authentication/nav logic is handled by `frontend/scripts/auth.js` and admin CRUD by `admin/admin.js`.

## Dependencies
- **Front-End CSS**: `frontend/css/*.css`
- **Front-End JavaScript**: `frontend/scripts/*.js` and `admin/admin.js`
- **Node.js Backend**: API endpoints under `/api/*`

## TODOs & Known Limitations
- **Inline event attributes**: many pages use `onclick`, `onsubmit`, `onchange`. Removing these requires careful refactoring to preserve navigation and form behavior.
- **Script ordering**: pages that depend on shared globals must ensure `frontend/scripts/utils.js` loads before scripts that reference `APP_CONFIG`/`APP_UTILS`.
- **Semantic cleanup**: further audit could standardize landmarks (`header/main/nav` usage), dedupe repeated meta patterns, and enforce stricter accessibility (ARIA labels, focus states) across all pages.
- **React Migration**: These static HTML pages are slated to be replaced by a Vite + React Single Page Application (SPA). The HTML files will act as the legacy frontend until full parity is reached in the React version (see `REACT-TAILWIND-REBUILD-PLAN.md`).
