/* storage.js — LocalStorage CRUD helpers */

const StorageKeys = {
  SUBJECTS: 'ssp_subjects',
  SCHEDULES: 'ssp_schedules',
  TASKS: 'ssp_tasks',
  SETTINGS: 'ssp_settings',
  THEME: 'ssp_theme',
  STUDY_LOGS: 'ssp_studyLogs'
};

const Storage = {
  get(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.error('Storage.get error:', e);
      return null;
    }
  },

  set(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.error('Storage.set error:', e);
    }
  },

  remove(key) {
    localStorage.removeItem(key);
  },

  // ---- Subjects ----
  getSubjects() {
    return this.get(StorageKeys.SUBJECTS) || [];
  },

  saveSubjects(subjects) {
    this.set(StorageKeys.SUBJECTS, subjects);
  },

  addSubject(subject) {
    const subjects = this.getSubjects();
    subject.id = this.uid();
    subject.createdAt = new Date().toISOString();
    subjects.push(subject);
    this.saveSubjects(subjects);
    return subject;
  },

  updateSubject(id, updates) {
    const subjects = this.getSubjects();
    const idx = subjects.findIndex(s => s.id === id);
    if (idx !== -1) {
      subjects[idx] = { ...subjects[idx], ...updates };
      this.saveSubjects(subjects);
      return subjects[idx];
    }
    return null;
  },

  deleteSubject(id) {
    const subjects = this.getSubjects().filter(s => s.id !== id);
    this.saveSubjects(subjects);
  },

  getSubjectById(id) {
    return this.getSubjects().find(s => s.id === id) || null;
  },

  // ---- Schedules ----
  getSchedules() {
    return this.get(StorageKeys.SCHEDULES) || [];
  },

  saveSchedules(schedules) {
    this.set(StorageKeys.SCHEDULES, schedules);
  },

  addSchedule(entry) {
    const schedules = this.getSchedules();
    entry.id = this.uid();
    entry.createdAt = new Date().toISOString();
    schedules.push(entry);
    this.saveSchedules(schedules);
    return entry;
  },

  updateSchedule(id, updates) {
    const schedules = this.getSchedules();
    const idx = schedules.findIndex(s => s.id === id);
    if (idx !== -1) {
      schedules[idx] = { ...schedules[idx], ...updates };
      this.saveSchedules(schedules);
      return schedules[idx];
    }
    return null;
  },

  deleteSchedule(id) {
    const schedules = this.getSchedules().filter(s => s.id !== id);
    this.saveSchedules(schedules);
  },

  checkScheduleConflict(day, startTime, endTime, excludeId) {
    const schedules = this.getSchedules().filter(s => s.day === day && s.id !== excludeId);
    return schedules.find(s => {
      const sStart = this.timeToMinutes(s.startTime);
      const sEnd = this.timeToMinutes(s.endTime);
      const nStart = this.timeToMinutes(startTime);
      const nEnd = this.timeToMinutes(endTime);
      return nStart < sEnd && nEnd > sStart;
    }) || null;
  },

  // ---- Tasks ----
  getTasks() {
    return this.get(StorageKeys.TASKS) || [];
  },

  saveTasks(tasks) {
    this.set(StorageKeys.TASKS, tasks);
  },

  addTask(task) {
    const tasks = this.getTasks();
    task.id = this.uid();
    task.completed = false;
    task.createdAt = new Date().toISOString();
    tasks.push(task);
    this.saveTasks(tasks);
    return task;
  },

  updateTask(id, updates) {
    const tasks = this.getTasks();
    const idx = tasks.findIndex(t => t.id === id);
    if (idx !== -1) {
      tasks[idx] = { ...tasks[idx], ...updates };
      this.saveTasks(tasks);
      return tasks[idx];
    }
    return null;
  },

  deleteTask(id) {
    const tasks = this.getTasks().filter(t => t.id !== id);
    this.saveTasks(tasks);
  },

  toggleTask(id) {
    const tasks = this.getTasks();
    const idx = tasks.findIndex(t => t.id === id);
    if (idx !== -1) {
      tasks[idx].completed = !tasks[idx].completed;
      if (tasks[idx].completed) {
        tasks[idx].completedAt = new Date().toISOString();
      } else {
        delete tasks[idx].completedAt;
      }
      this.saveTasks(tasks);
      return tasks[idx];
    }
    return null;
  },

  // ---- Study Logs ----
  getStudyLogs() {
    return this.get(StorageKeys.STUDY_LOGS) || [];
  },

  addStudyLog(log) {
    const logs = this.getStudyLogs();
    log.id = this.uid();
    log.date = new Date().toISOString();
    logs.push(log);
    this.set(StorageKeys.STUDY_LOGS, logs);
    return log;
  },

  // ---- Settings ----
  getSettings() {
    return this.get(StorageKeys.SETTINGS) || {
      theme: 'dark',
      defaultSessionDuration: 25,
      breakDuration: 5,
      notifications: true,
      defaultView: 'daily',
      accentColor: '#8B5CF6'
    };
  },

  saveSettings(settings) {
    this.set(StorageKeys.SETTINGS, settings);
  },

  getTheme() {
    return this.get(StorageKeys.THEME) || 'dark';
  },

  setTheme(theme) {
    this.set(StorageKeys.THEME, theme);
  },

  // ---- Export / Import ----
  exportAll() {
    return {
      subjects: this.getSubjects(),
      schedules: this.getSchedules(),
      tasks: this.getTasks(),
      settings: this.getSettings(),
      studyLogs: this.getStudyLogs(),
      exportedAt: new Date().toISOString()
    };
  },

  importAll(data) {
    if (data.subjects) this.saveSubjects(data.subjects);
    if (data.schedules) this.saveSchedules(data.schedules);
    if (data.tasks) this.saveTasks(data.tasks);
    if (data.settings) this.saveSettings(data.settings);
    if (data.studyLogs) this.set(StorageKeys.STUDY_LOGS, data.studyLogs);
  },

  resetAll() {
    Object.values(StorageKeys).forEach(key => this.remove(key));
  },

  // ---- Helpers ----
  uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
  },

  timeToMinutes(timeStr) {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  },

  minutesToTime(minutes) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  },

  formatTime12(timeStr) {
    const [h, m] = timeStr.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    return `${hour12}:${m.toString().padStart(2, '0')} ${period}`;
  },

  getRelativeDeadline(deadlineStr) {
    const now = new Date();
    const deadline = new Date(deadlineStr);
    const diff = deadline - now;

    if (diff < 0) return { text: 'Overdue', class: 'badge-red', overdue: true };

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 7) return { text: `${days}d left`, class: 'badge-green', overdue: false };
    if (days > 1) return { text: `${days}d left`, class: 'badge-yellow', overdue: false };
    if (days === 1) return { text: 'Tomorrow', class: 'badge-yellow', overdue: false };
    if (hours > 0) return { text: `${hours}h left`, class: 'badge-red', overdue: false };
    return { text: `${minutes}m left`, class: 'badge-red', overdue: false };
  },

  getDayName(dayNum) {
    return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayNum];
  },

  getDayShort(dayNum) {
    return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dayNum];
  }
};
