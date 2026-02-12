/* settings.js — Settings page logic */

document.addEventListener('DOMContentLoaded', () => {
    initSettingsPage();
});

function initSettingsPage() {
    loadSettings();

    // Theme toggle
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.checked = Storage.getTheme() === 'light';
        themeToggle.addEventListener('change', () => {
            toggleTheme();
            showToast(`Switched to ${Storage.getTheme()} mode.`, 'info');
        });
    }

    // Session duration
    const sessionInput = document.getElementById('sessionDuration');
    if (sessionInput) {
        sessionInput.addEventListener('change', () => {
            const settings = Storage.getSettings();
            settings.defaultSessionDuration = parseInt(sessionInput.value) || 25;
            Storage.saveSettings(settings);
            showToast('Session duration updated.', 'success');
        });
    }

    // Break duration
    const breakInput = document.getElementById('breakDuration');
    if (breakInput) {
        breakInput.addEventListener('change', () => {
            const settings = Storage.getSettings();
            settings.breakDuration = parseInt(breakInput.value) || 5;
            Storage.saveSettings(settings);
            showToast('Break duration updated.', 'success');
        });
    }

    // Notification toggle
    const notifToggle = document.getElementById('notificationToggle');
    if (notifToggle) {
        notifToggle.addEventListener('change', () => {
            const settings = Storage.getSettings();
            settings.notifications = notifToggle.checked;
            Storage.saveSettings(settings);
            if (notifToggle.checked && 'Notification' in window) {
                Notification.requestPermission();
            }
            showToast(notifToggle.checked ? 'Notifications enabled.' : 'Notifications disabled.', 'info');
        });
    }

    // Default view
    const viewSelect = document.getElementById('defaultView');
    if (viewSelect) {
        viewSelect.addEventListener('change', () => {
            const settings = Storage.getSettings();
            settings.defaultView = viewSelect.value;
            Storage.saveSettings(settings);
            showToast('Default view updated.', 'success');
        });
    }

    // Export
    const exportBtn = document.getElementById('exportData');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportData);
    }

    // Import
    const importInput = document.getElementById('importFile');
    if (importInput) {
        importInput.addEventListener('change', importData);
    }

    // Reset
    const resetBtn = document.getElementById('resetData');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            confirmAction(
                'Reset All Data',
                'This will permanently delete all subjects, schedules, tasks, and study logs. Are you absolutely sure?',
                () => {
                    Storage.resetAll();
                    showToast('All data has been reset.', 'success');
                    setTimeout(() => window.location.reload(), 800);
                }
            );
        });
    }
}

function loadSettings() {
    const settings = Storage.getSettings();

    const sessionInput = document.getElementById('sessionDuration');
    if (sessionInput) sessionInput.value = settings.defaultSessionDuration || 25;

    const breakInput = document.getElementById('breakDuration');
    if (breakInput) breakInput.value = settings.breakDuration || 5;

    const notifToggle = document.getElementById('notificationToggle');
    if (notifToggle) notifToggle.checked = settings.notifications !== false;

    const viewSelect = document.getElementById('defaultView');
    if (viewSelect) viewSelect.value = settings.defaultView || 'daily';

    // Render data stats
    renderDataStats();
}

function renderDataStats() {
    const statsEl = document.getElementById('dataStats');
    if (!statsEl) return;

    const subjects = Storage.getSubjects().length;
    const schedules = Storage.getSchedules().length;
    const tasks = Storage.getTasks().length;
    const logs = Storage.getStudyLogs().length;

    statsEl.innerHTML = `
    <div style="display:flex;gap:1.5rem;flex-wrap:wrap;margin:1rem 0">
      <div><small style="display:block">Subjects</small><strong>${subjects}</strong></div>
      <div><small style="display:block">Schedules</small><strong>${schedules}</strong></div>
      <div><small style="display:block">Tasks</small><strong>${tasks}</strong></div>
      <div><small style="display:block">Study Logs</small><strong>${logs}</strong></div>
    </div>`;
}

function exportData() {
    const data = Storage.exportAll();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `study-planner-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Data exported successfully!', 'success');
}

function importData(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
        try {
            const data = JSON.parse(evt.target.result);
            confirmAction(
                'Import Data',
                'This will merge imported data with your existing data. Continue?',
                () => {
                    Storage.importAll(data);
                    showToast('Data imported successfully!', 'success');
                    setTimeout(() => window.location.reload(), 800);
                }
            );
        } catch (err) {
            showToast('Invalid file format. Please use a valid JSON backup.', 'error');
        }
    };
    reader.readAsText(file);
    e.target.value = '';
}
