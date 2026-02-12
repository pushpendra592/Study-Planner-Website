/* app.js — Shared logic: nav, theme, toasts, modals, pomodoro, shortcuts */

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initNav();
    initKeyboardShortcuts();
});

/* ===== Theme ===== */
function initTheme() {
    const theme = Storage.getTheme();
    document.documentElement.setAttribute('data-theme', theme);
}

function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    Storage.setTheme(next);
}

/* ===== Navigation ===== */
function initNav() {
    // Highlight active page
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.navbar-nav a').forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage || (currentPage === '' && href === 'index.html')) {
            link.classList.add('active');
        }
    });

    // Hamburger toggle
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.navbar-nav');
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('open');
        });

        // Close on link click (mobile)
        navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('open');
            });
        });

        // Close on outside click
        document.addEventListener('click', (e) => {
            if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('open');
            }
        });
    }
}

/* ===== Toast Notifications ===== */
function showToast(message, type = 'info') {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const icons = {
        success: 'fa-circle-check',
        error: 'fa-circle-exclamation',
        warning: 'fa-exclamation-triangle',
        info: 'fa-circle-info'
    };

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
    <i class="fas ${icons[type]} toast-icon text-${type === 'error' ? 'danger' : type}"></i>
    <span class="toast-message">${message}</span>
  `;

    container.appendChild(toast);

    requestAnimationFrame(() => {
        requestAnimationFrame(() => toast.classList.add('show'));
    });

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400);
    }, 3500);
}

/* ===== Modal Helpers ===== */
function openModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

function closeAllModals() {
    document.querySelectorAll('.modal-overlay.active').forEach(m => {
        m.classList.remove('active');
    });
    document.body.style.overflow = '';
}

// Close modal on overlay click
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay') && e.target.classList.contains('active')) {
        e.target.classList.remove('active');
        document.body.style.overflow = '';
    }
});

// Close modals on Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAllModals();
});

/* ===== Confirmation Dialog ===== */
function confirmAction(title, message, onConfirm) {
    // Remove existing confirm modal
    const existing = document.getElementById('confirmModal');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'confirmModal';
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
    <div class="modal" style="max-width: 400px">
      <div class="confirm-body">
        <i class="fas fa-exclamation-triangle"></i>
        <h3>${title}</h3>
        <p>${message}</p>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="closeModal('confirmModal'); document.getElementById('confirmModal').remove();">Cancel</button>
        <button class="btn btn-danger" id="confirmActionBtn">Yes, proceed</button>
      </div>
    </div>
  `;

    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('active'));
    document.body.style.overflow = 'hidden';

    document.getElementById('confirmActionBtn').addEventListener('click', () => {
        closeModal('confirmModal');
        overlay.remove();
        onConfirm();
    });
}

/* ===== Pomodoro Timer ===== */
const Pomodoro = {
    duration: 25 * 60,
    breakDuration: 5 * 60,
    remaining: 25 * 60,
    running: false,
    onBreak: false,
    interval: null,
    subjectId: null,

    init(displayEl, labelEl) {
        this.displayEl = displayEl;
        this.labelEl = labelEl;
        const settings = Storage.getSettings();
        this.duration = (settings.defaultSessionDuration || 25) * 60;
        this.breakDuration = (settings.breakDuration || 5) * 60;
        this.remaining = this.duration;
        this.render();
    },

    start() {
        if (this.running) return;
        this.running = true;
        this.interval = setInterval(() => this.tick(), 1000);
    },

    pause() {
        this.running = false;
        if (this.interval) clearInterval(this.interval);
    },

    reset() {
        this.pause();
        this.onBreak = false;
        this.remaining = this.duration;
        if (this.labelEl) this.labelEl.textContent = 'Focus Session';
        this.render();
    },

    tick() {
        this.remaining--;
        if (this.remaining <= 0) {
            this.pause();
            if (!this.onBreak) {
                // Log the study session
                if (this.subjectId) {
                    Storage.addStudyLog({
                        subjectId: this.subjectId,
                        duration: this.duration / 60,
                        type: 'pomodoro'
                    });
                }
                showToast('Focus session complete! Take a break.', 'success');
                this.onBreak = true;
                this.remaining = this.breakDuration;
                if (this.labelEl) this.labelEl.textContent = 'Break Time';
                this.start();
            } else {
                showToast('Break over! Ready for another round?', 'info');
                this.onBreak = false;
                this.remaining = this.duration;
                if (this.labelEl) this.labelEl.textContent = 'Focus Session';
            }
        }
        this.render();
    },

    render() {
        if (!this.displayEl) return;
        const mins = Math.floor(this.remaining / 60);
        const secs = this.remaining % 60;
        this.displayEl.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
};

/* ===== Keyboard Shortcuts ===== */
function initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Don't trigger when typing in inputs
        if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;

        if (e.altKey) {
            switch (e.key) {
                case '1': window.location.href = 'index.html'; break;
                case '2': window.location.href = 'dashboard.html'; break;
                case '3': window.location.href = 'subjects.html'; break;
                case '4': window.location.href = 'schedule.html'; break;
                case '5': window.location.href = 'tasks.html'; break;
                case '6': window.location.href = 'analytics.html'; break;
                case '7': window.location.href = 'settings.html'; break;
            }
        }
    });
}

/* ===== Utility Functions ===== */
function formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatDateTime(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
        month: 'short', day: 'numeric',
        hour: 'numeric', minute: '2-digit'
    });
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function debounce(fn, delay) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
}

function getGreeting() {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
}

function getTodayDayNumber() {
    return new Date().getDay();
}

/* ===== Navbar HTML Generator ===== */
function getNavbarHTML() {
    return `
  <nav class="navbar">
    <a href="index.html" class="navbar-brand">
      <div class="logo-icon"><i class="fas fa-book-open-reader"></i></div>
      StudyPlanner
    </a>
    <div class="navbar-nav">
      <a href="index.html"><i class="fas fa-house"></i> Home</a>
      <a href="dashboard.html"><i class="fas fa-table-cells-large"></i> Dashboard</a>
      <a href="subjects.html"><i class="fas fa-layer-group"></i> Subjects</a>
      <a href="schedule.html"><i class="fas fa-calendar-days"></i> Schedule</a>
      <a href="tasks.html"><i class="fas fa-list-check"></i> Tasks</a>
      <a href="analytics.html"><i class="fas fa-chart-line"></i> Analytics</a>
      <a href="settings.html"><i class="fas fa-gear"></i> Settings</a>
    </div>
    <button class="hamburger" aria-label="Toggle menu">
      <span></span>
      <span></span>
      <span></span>
    </button>
  </nav>`;
}
