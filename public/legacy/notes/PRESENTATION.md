# 🎓 Academic Schedule Builder — Feature Showcase (Condensed)

> Quick reference for all features. Demo time: ~15 minutes.

---

## 📋 All Features

| # | Feature | Page | Details |
|---|---------|------|---------|
| 0 | Landing Page | `index.html` | Hero, particles, theme toggle (🌙/☀️), CTA buttons |
| 1 | Login | `pages/login.html` | Email/password, JWT token stored, admin redirect |
| 2 | Sign Up | `pages/signup.html` | Password validation, duplicate email check |
| 3 | Forgot Password | `pages/forgot-password.html` | Email reset request, confirmation modal |
| 4 | Setup | `pages/setup.html` | Cascading dropdowns (Program → Year → Semester) |
| 5 | Home Dashboard | `pages/home.html` | Sticky nav, two feature cards (Builder/Plotter) |
| 6 | Browse Classes | `pages/builder.html` | Accordion courses, time slots, ADD button |
| 7 | Irregular Courses | `pages/builder.html` | Manual entry form (code, name, units, time, room, professor) |
| 8 | Multiple Schedules | `pages/builder.html` | Schedule selector dropdown, create new, switch schedules |
| 9 | Save/Delete Schedule | `pages/builder.html` | Name input, units display (Regular/Irregular status), delete confirmation |
| 10 | Visualize Schedule | `pages/plotter.html` | Timetable grid (7AM-8PM, MON-SAT), colored course blocks |
| 11 | Display Options | `pages/plotter.html` | Checkboxes: Hide Professor/Code/Name/Time/Day/Room |
| 12 | Color Customization | `pages/plotter.html` | Color pickers for block + font, hex codes, real-time preview |
| 13 | Export as PNG | `pages/plotter.html` | Save timetable as downloadable PNG image |
| 14 | Profile - Account | `pages/profile.html` | Edit username/email/password (pencil icons, eye toggle for password) |
| 15 | Profile - Academic | `pages/profile.html` | Change program/year/semester (cascading, Apply button) |
| 16 | Admin - Users | `admin/admin.html` | Create/Edit/Delete users, set role (user/admin), assign term |
| 17 | Admin - Programs | `admin/admin.html` | Name, total years, semester type (semester/trimester), standard units |
| 18 | Admin - Terms | `admin/admin.html` | Program filter, manage year + semester combinations, required units |
| 19 | Admin - Courses | `admin/admin.html` | Program → Term → Course filters, course code + name + units |
| 20 | Admin - Professors | `admin/admin.html` | Department filter, name, used for course slots |
| 21 | Admin - Course Slots | `admin/admin.html` | ⭐ **CRITICAL**: Program → Term → Course filters, professor + day + time + room |
| 22 | Admin - Schedules | `admin/admin.html` | Read-only view of all student schedules, delete option, timestamp + status |
| 23 | Footer | All pages | Terms, Privacy Policy, About, Contact (via modals) |
| 24 | Theme Toggle | Landing + All Pages | Light/Dark mode, persists in localStorage, applies everywhere |

---

## 🎯 Quick Demo Checklist

### **Landing Page** (1 min)
- [ ] Show hero, particles, grid lines
- [ ] Toggle theme 🌙/☀️ (show light + dark)
- [ ] Click "Get Started" → signup.html

### **Auth & Onboarding** (4 min)
- [ ] Sign Up: Email, password, confirm password
- [ ] Show validation error (password mismatch)
- [ ] Setup page: Select Program → Year → Semester (cascading unlocks)

### **Student Core** (6 min)
- [ ] Home: Show 2 cards (Builder, Plotter)
- [ ] Builder: Add course from Available Classes (accordion + ADD button)
- [ ] Try adding same course twice (error: conflict prevention)
- [ ] Schedule selector: Create new, switch between schedules
- [ ] Save schedule: Name + units display (Regular status)
- [ ] Plotter: Generate, show timetable grid, colored blocks
- [ ] Options: Toggle Hide Professor/Time/Code (instant update)
- [ ] Colors: Pick block color + font color (real-time)
- [ ] Export: Save as PNG (download)

### **Student Account** (2 min)
- [ ] Profile: Edit username/email/password (pencil icons)
- [ ] Show eye icon (toggle password visibility)
- [ ] Change academic enrollment: Program → Year → Semester

### **Admin Panel** (3 min)
- [ ] Users tab: Create user, set role, assign term
- [ ] Programs: Show standard units, semester type
- [ ] **Course Slots** (most important): 3-level filter (Program → Term → Course), show professor + time + room
- [ ] Schedules: Read-only view, show user + units + status + timestamp

### **Footer** (1 min)
- [ ] Click "Terms" link → Terms modal
- [ ] Click "Privacy" link → Privacy Policy modal  
- [ ] Click "About" link → About modal
- [ ] Show contact: academicschedulebuilder@gmail.com

---

## 🔑 Key Talking Points

1. **Landing Page** — Professional hero with animated particles + theme toggle
2. **JWT Authentication** — Secure login with token in localStorage
3. **Cascading Dropdowns** — Smart UX (fields unlock progressively)
4. **Schedule Builder** — Browse + add courses, irregular course support, multiple drafts
5. **Unit Validation** — Regular vs. Irregular status based on unit count
6. **Visual Timetable** — Proportional blocks, color-coded, time-accurate positioning
7. **Customization** — Hide fields, pick colors, export as PNG
8. **Admin Hierarchy** — Programs → Terms → Courses → Course Slots (logical structure)
9. **Course Slots** — What students actually select from (multiple sections per course)
10. **Read-Only Admin** — Monitor all schedules, delete if needed, no forced edits

---

## ✨ Design Highlights

- **Modern UI**: Glassmorphism, grid backgrounds, smooth animations
- **Responsive**: Mobile-friendly, works on all devices
- **Theme Support**: Light/Dark mode, persists, applies everywhere
- **Real-time Updates**: No page reloads, instant feedback
- **Color Consistency**: Brand colors throughout, visual hierarchy clear
- **Accessibility**: Icons + text labels, ARIA attributes, keyboard navigation

---

## ⚙️ Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Auth | JWT tokens (localStorage) |
| Export | html2canvas (PNG generation) |
| Storage | Backend API + Database |
| Deployment | Docker + Kubernetes |

---

## 🚀 Live Demo Flow (~15 min total)

```
1. Landing (1 min)
   └─ Theme toggle demo

2. Sign Up → Setup (2 min)
   └─ Create account, set academic term

3. Schedule Builder (5 min)
   ├─ Browse classes
   ├─ Add courses
   ├─ Multiple schedules
   └─ Save schedule

4. Schedule Plotter (4 min)
   ├─ Generate timetable
   ├─ Toggle display options
   ├─ Customize colors
   └─ Export PNG

5. Profile & Admin (2 min)
   ├─ Edit profile
   ├─ Change enrollment
   └─ Admin overview (Users, Courses, Slots)

6. Footer (1 min)
   └─ Show Terms, Privacy, About
```

---

## 🛠️ Troubleshooting

| Issue | Fix |
|-------|-----|
| No courses showing | Verify: User term has courses + course slots created |
| Theme not applying | Refresh page, check localStorage |
| Export PNG fails | Zoom 100%, disable ad blockers, use Chrome/Firefox |
| Slots dropdown empty | Check: Parent data exists (Programs before Terms, etc.) |
| Admin button invisible | Verify: Logged in as admin user |

---