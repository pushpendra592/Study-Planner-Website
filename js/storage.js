// ==================== LOCAL STORAGE FUNCTIONS ====================

// Load data from localStorage
function loadData(key) {
    var data = localStorage.getItem(key);
    if (data) {
        return JSON.parse(data);
    }
    return null;
}

// Save data to localStorage
function saveData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

// Initialize all app data
function initializeData() {
    if (!loadData('subjects')) {
        saveData('subjects', []);
    }
    if (!loadData('schedules')) {
        saveData('schedules', []);
    }
    if (!loadData('tasks')) {
        saveData('tasks', []);
    }
    if (!loadData('activities')) {
        saveData('activities', []);
    }
    if (!loadData('settings')) {
        saveData('settings', {
            theme: 'dark',
            notifications: true,
            reminderTime: 30
        });
    }
}

// Add activity to log
function addActivity(message) {
    var activities = loadData('activities') || [];
    
    var activity = {
        id: Date.now(),
        message: message,
        time: new Date().toLocaleString()
    };
    
    activities.unshift(activity);
    
    // Keep only last 50 activities
    if (activities.length > 50) {
        activities = activities.slice(0, 50);
    }
    
    saveData('activities', activities);
}

// Generate unique ID
function generateId() {
    return Date.now();
}