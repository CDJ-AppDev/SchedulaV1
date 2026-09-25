# Keyboard Shortcuts Implementation Plan

## Context
The application currently has **minimal keyboard support** - only Escape key closes modals in footer.js. Users request keyboard shortcuts for efficiency, especially in the admin dashboard and search/dialog interactions. Adding a centralized keyboard utility module will improve UX without relying on external libraries.

## Goal
Add comprehensive keyboard shortcuts to:
1. **Admin Dashboard** - tab switching, CRUD operations, pagination
2. **Search & Dialogs** - focus search fields, confirm/cancel dialogs, quick filters

## Architecture

### Core Solution: Create `keyboard.js` Utility Module
**File:** `/frontend/scripts/keyboard.js` (new)

This centralized module will:
- Register keyboard shortcuts globally or per-page
- Handle Ctrl/Shift/Alt combinations safely
- Provide API for adding/removing shortcuts
- Prevent conflicts with native browser shortcuts
- Handle focus management (don't trigger in input fields unless intended)

**Key Functions:**
```javascript
registerShortcut(key, combination, handler, context)  // key='Ctrl+N', handler=function
unregisterShortcut(key)
isInInput()  // detect if user is typing in a field
createShortcutMap()  // return displayable shortcut reference
```

### Admin Dashboard Shortcuts
**File:** `/admin/admin.js` (modify)

Add shortcuts for:
- **Ctrl+1/2/3/4/5/6/7** - Switch admin tabs (Users, Programs, Terms, Courses, Professors, Slots, Schedules)
- **Ctrl+N** - New item (create button in current tab)
- **Ctrl+Shift+D** - Delete selected item
- **Ctrl+E** - Edit selected item
- **Ctrl+F** - Focus search/filter input
- **Ctrl+R** - Refresh current tab
- **Ctrl+Left/Right** - Pagination navigation
- **Enter** - Confirm modal
- **Escape** - Close modal / cancel action

### Search & Dialog Shortcuts
**Files:** `/frontend/scripts/popup.js`, individual pages

Add shortcuts for:
- **Ctrl+F** - Focus global search (if available on page)
- **Enter** - Confirm dialog/alert
- **Escape** - Cancel dialog/alert (already partially implemented)
- **Tab** - Dialog button navigation
- **Shift+Tab** - Reverse button navigation

### Implementation Steps

1. **Create keyboard.js utility** (`/frontend/scripts/keyboard.js`)
   - Registry for active shortcuts
   - Context-aware execution (admin page vs schedule builder, etc.)
   - Helper functions for common patterns

2. **Update admin.js**
   - Import keyboard.js
   - Register admin-specific shortcuts in initialization
   - Bind shortcuts to existing click handlers and functions
   - Display shortcut hints in UI (optional: near buttons)

3. **Update popup.js**
   - Ensure Escape closes modals (already done for footer)
   - Add Enter to confirm dialogs
   - Make modal buttons keyboard-navigable (Tab/Shift+Tab)

4. **Update other pages** (minimal changes)
   - Add Ctrl+F for search-enabled pages (profile, builder, plotter)
   - Add Ctrl+Enter for form submissions (login, signup)

## Critical Files to Modify/Create
- **Create:** `frontend/scripts/keyboard.js` - Core keyboard utility
- **Modify:** `admin/admin.js` - Admin dashboard shortcuts (tab switching, CRUD, pagination)
- **Modify:** `frontend/scripts/popup.js` - Dialog keyboard navigation (Enter, Escape, Tab)
- **Modify:** `frontend/scripts/auth.js` - Form submission shortcuts (Ctrl+Enter)
- **Modify:** `frontend/scripts/profile.js` - Search focus shortcut (Ctrl+F)

## Shortcut Convention
- **Ctrl+** = Global/primary function
- **Shift+** = Destructive or alternate action (delete, clear)
- **Alt+** = Reserved for browser/OS (avoid)
- **Single keys** = Dialog-specific (Enter, Escape in modals only)

## Context Awareness
Shortcuts should NOT trigger when:
- User is typing in a text input (unless Ctrl+Enter)
- A modal is open (use modal-specific shortcuts instead)
- User is outside target page/context

## Verification
1. Test admin tab switching (Ctrl+1 through Ctrl+7)
2. Test new item creation (Ctrl+N in admin)
3. Test search focus (Ctrl+F on admin page)
4. Test dialog interactions (Enter to confirm, Escape to cancel)
5. Test form submission (Ctrl+Enter on login/signup)
6. Verify no conflicts with browser shortcuts (Ctrl+C, Ctrl+V, Ctrl+T, etc.)
7. Test that shortcuts don't fire when typing in input fields
8. Verify shortcut hints display in UI (buttons or help modal)

## Design Decisions
- **Why centralized keyboard.js?** - Easy to manage, avoid duplication, consistent behavior
- **Why vanilla JS library?** - No external dependencies, lightweight, fits existing tech stack
- **Why Ctrl as primary modifier?** - Familiar to users (Ctrl+C, Ctrl+Z, Ctrl+N patterns)
- **Why context-aware?** - Prevents conflicts, safer UX, different pages have different needs
