// ==================== MAIN APPLICATION ====================

// Initialize entire application
function initApp() {
    // Initialize data storage
    initializeData();
    
    // Setup navigation
    setupNavigation();
    setupThemeToggle();
    applySavedTheme();
    
    // Setup modal
    setupModalEvents();
    
    // Setup forms
    setupSubjectForm();
    setupScheduleForm();
    setupTaskForm();
    
    // Setup task filters
    setupTaskFilters();
    
    // Setup settings
    setupSettingsEvents();
    loadSettingsForm();
    
    // Load initial data
    updateDashboard();
    displaySubjects();
    updateSubjectDropdowns();
    displaySchedule();
    displayTasks('all');
    updateProgress();
    
    // Start reminder system
    startReminderChecker();
    
    console.log('Smart Study Planner initialized!');
}

// Start app when DOM is ready
window.addEventListener('DOMContentLoaded', initApp);