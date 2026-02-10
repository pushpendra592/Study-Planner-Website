# 📚 Smart Study Planner

A lightweight, web-based study planner that helps students organize subjects, schedules, and tasks while tracking
progress. Built with Vanilla JavaScript and uses LocalStorage for data persistence — no backend required.

---

## ✨ Features

### 📊 Dashboard
- Overview of subjects, pending tasks, and today’s schedule
- Real-time updates as data changes

### 📘 Subjects
- Add, edit, and delete subjects
- Assign priority levels and custom colors

### 🗓 Schedule Planner
- Weekly timetable view
- Conflict detection for overlapping sessions
- Easy schedule modification

### ✅ Tasks
- Track assignments, exams, and deadlines
- Task filtering for better organization

### 📈 Progress Tracking
- Completion rate analytics
- Activity log to monitor study habits

### ⚙️ Settings
- Light/Dark theme toggle
- Data export for backup
- Reset stored data

---

## 🛠 Tech Stack

- HTML5
- CSS3
- Vanilla JavaScript
- LocalStorage

---

## 📂 Project Structure

smart-study-planner/
├── index.html
├── style.css
├── js/
│ ├── storage.js # LocalStorage operations & initialization
│ ├── notifications.js # Notifications & reminders
│ ├── navigation.js # Navigation & theme toggle
│ ├── modal.js # Modal handling
│ ├── subjects.js # Subject management (CRUD)
│ ├── schedule.js # Schedule planner & conflict detection
│ ├── tasks.js # Task management & filters
│ ├── dashboard.js # Dashboard updates
│ ├── progress.js # Progress analytics
│ ├── settings.js # Settings, export & reset
│ └── app.js # Main application initialization
└── README.md
---

## 🚀 Getting Started

1. Download or clone the repository
2. Open `index.html` in any modern browser
3. Add subjects first, then create schedules and tasks

---

## 🧠 Usage Flow

1. Create subjects
2. Build weekly schedules
3. Add assignments and exams
4. Track progress from the dashboard

---

## 🔒 Data Storage

- Data is stored locally using LocalStorage
- Clearing browser data will reset all progress unless exported

---

## 👤 Author

Created February 2025

---

## 📌 Future Enhancements

- Cloud synchronization
- Calendar export (ICS)
- Advanced reminders
- Mobile-first UI improvements
