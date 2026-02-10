# Smart Study Planner

A web-based study planner to organize subjects, schedules, tasks, and track progress.

## Features

- **Dashboard**: Overview of subjects, tasks, and today's schedule
- **Subjects**: Add, edit, delete subjects with priority and color
- **Schedule**: Weekly timetable with conflict detection
- **Tasks**: Track assignments, exams with deadlines
- **Progress**: View completion rates and activity log
- **Settings**: Theme toggle, data export, and reset

## Tech Stack

- HTML5, CSS3, Vanilla JavaScript
- LocalStorage for data persistence

## File Structure
smart-study-planner/
├── index.html
├── style.css
├── js/
│   ├── storage.js      (LocalStorage functions)
│   ├── navigation.js   (Navigation & theme)
│   ├── subjects.js     (Subject management)
│   ├── schedule.js     (Schedule planner)
│   ├── tasks.js        (Task manager)
│   ├── dashboard.js    (Dashboard updates)
│   ├── progress.js     (Progress analytics)
│   ├── settings.js     (Settings & export)
│   ├── modal.js        (Modal handling)
│   ├── notifications.js (Notifications & reminders)
│   └── app.js          (Main initialization)
└── README.md


## Usage

Open `index.html` in browser. Add subjects first, then create schedules and tasks.

## Author

Created February 2025


Summary
The JavaScript is now split into 11 separate files:

File	Purpose
storage.js	LocalStorage operations, data initialization
notifications.js	Popup notifications, reminders
navigation.js	Section switching, theme toggle
modal.js	Edit modal handling
subjects.js	Subject CRUD operations
schedule.js	Schedule management, conflict check
tasks.js	Task management, filters
dashboard.js	Dashboard statistics
progress.js	Progress analytics
settings.js	Settings, export, reset
app.js	Main initialization
