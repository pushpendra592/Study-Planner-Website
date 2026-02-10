// ==================== SETTINGS FUNCTIONS ====================

// Save all settings
function saveSettings() {
    var settings = {
        theme: document.getElementById('themeSelect').value,
        notifications: document.getElementById('enableNotifications').checked,
        reminderTime: parseInt(document.getElementById('reminderTime').value)
    };
    
    saveData('settings', settings);
    
    // Apply theme immediately
    applyThemeFromSettings(settings.theme);
    
    showNotification('Settings saved!');
}

// Apply theme from settings
function applyThemeFromSettings(theme) {
    var body = document.body;
    var themeBtn = document.getElementById('themeBtn');
    
    if (theme === 'light') {
        body.classList.add('light-theme');
        themeBtn.textContent = '☀️';
    } else {
        body.classList.remove('light-theme');
        themeBtn.textContent = '🌙';
    }
}

// Load settings into form
function loadSettingsForm() {
    var settings = loadData('settings');
    
    if (settings) {
        document.getElementById('themeSelect').value = settings.theme || 'dark';
        document.getElementById('enableNotifications').checked = settings.notifications !== false;
        document.getElementById('reminderTime').value = settings.reminderTime || 30;
    }
}

// Export all data
function exportData() {
    var data = {
        subjects: loadData('subjects'),
        schedules: loadData('schedules'),
        tasks: loadData('tasks'),
        activities: loadData('activities'),
        settings: loadData('settings'),
        exportDate: new Date().toISOString()
    };
    
    var dataStr = JSON.stringify(data, null, 2);
    var blob = new Blob([dataStr], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    
    var link = document.createElement('a');
    link.href = url;
    link.download = 'study-planner-backup.json';
    link.click();
    
    URL.revokeObjectURL(url);
    
    showNotification('Data exported successfully!');
}

// Reset all data
function resetAllData() {
    var confirmed = confirm('Are you sure you want to reset all data? This cannot be undone!');
    
    if (confirmed) {
        localStorage.removeItem('subjects');
        localStorage.removeItem('schedules');
        localStorage.removeItem('tasks');
        localStorage.removeItem('activities');
        
        initializeData();
        updateDashboard();
        displaySubjects();
        displaySchedule();
        displayTasks('all');
        updateProgress();
        
        showNotification('All data has been reset!');
    }
}

// Setup settings events
function setupSettingsEvents() {
    // Theme select change
    var themeSelect = document.getElementById('themeSelect');
    themeSelect.addEventListener('change', saveSettings);
    
    // Notifications toggle
    var notifToggle = document.getElementById('enableNotifications');
    notifToggle.addEventListener('change', saveSettings);
    
    // Reminder time change
    var reminderInput = document.getElementById('reminderTime');
    reminderInput.addEventListener('change', saveSettings);
    
    // Export button
    var exportBtn = document.getElementById('exportData');
    exportBtn.addEventListener('click', exportData);
    
    // Reset button
    var resetBtn = document.getElementById('resetData');
    resetBtn.addEventListener('click', resetAllData);
}