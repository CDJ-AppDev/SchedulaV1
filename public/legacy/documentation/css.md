# Front-End CSS — Feature Documentation

## Overview
CSS stylesheets provide the visual system (colors, spacing, typography, components) for public pages and the private admin dashboard, including light/dark theming via CSS custom properties.

## Key Files & Locations
- `frontend/css/main.css`: global design tokens (`:root`), theme variables, shared components (header, buttons, inputs, layout)
- `frontend/css/landing.css`: landing page-specific styles
- `frontend/css/dashboard.css`: home/dashboard page styles
- `frontend/css/builder.css`: schedule builder styles
- `frontend/css/plotter.css`: schedule plotter styles
- `frontend/css/profile.css`: profile/settings styles
- `frontend/css/admin.css`: admin dashboard layout/table/modal styles

## Features
- **Theme system**: global CSS variables under `:root` and `[data-theme="light"]` drive light/dark color palettes and component styling.
- **Reusable layout/components**: shared header (`.app-header`), navigation buttons (`.nav-button`), input/select/button primitives, and modal/popup styles.
- **Responsive design**: multiple media queries scale header/nav and card layouts for smaller viewports.

## Dependencies
- **HTML Pages**: `pages/*.html` and `admin/admin.html` include these stylesheets.
- **Front-End JavaScript**: `frontend/scripts/theme.js` toggles theme state (via DOM attributes/storage).

## TODOs & Known Limitations
- **Duplication across page styles**: multiple page CSS files contain similar button/input/table patterns; consider consolidating into `main.css` utilities or a small component layer.
- **Vendor prefixes**: `-webkit-backdrop-filter` is present to support Safari; other vendor prefixes are minimal.
- **Audit scope**: this audit prioritized functional safety; deeper dead-rule elimination would require runtime coverage (page-by-page rendering + CSS usage tooling).
- **Tailwind CSS Migration**: As outlined in the `REACT-TAILWIND-REBUILD-PLAN.md`, this entire vanilla CSS architecture is scheduled to be deprecated in favor of a unified Tailwind CSS design system inside a React SPA. Until the React app achieves feature parity, do not introduce new bespoke CSS frameworks here.
