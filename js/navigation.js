// ==================== NAVIGATION FUNCTIONS ====================

// Switch between sections
function switchSection(sectionId) {
    // Hide all sections
    var sections = document.querySelectorAll('.section');
    for (var i = 0; i < sections.length; i++) {
        sections[i].classList.remove('active');
    }
    
    // Remove active class from nav links
    var navLinks = document.querySelectorAll('.nav-link');
    for (var i = 0; i < navLinks.length; i++) {
        navLinks[i].classList.remove('active');
    }
    
    // Show selected section
    document.getElementById(sectionId).classList.add('active');
    
    // Add active class to nav link
    var activeLink = document.querySelector('[data-section="' + sectionId + '"]');
    if (activeLink) {
        activeLink.classList.add('active');
    }
    
    // Refresh section data
    refreshSectionData(sectionId);
}

// Refresh data when section changes
function refreshSectionData(sectionId) {
    if (sectionId === 'dashboard') {
        updateDashboard();
    } else if (sectionId === 'subjects') {
        displaySubjects();
    } else if (sectionId === 'schedule') {
        updateSubjectDropdowns();
        displaySchedule();
    } else if (sectionId === 'tasks') {
        updateSubjectDropdowns();
        displayTasks('all');
    } else if (sectionId === 'progress') {
        updateProgress();
    }
}

// Setup navigation click events
function setupNavigation() {
    var navLinks = document.querySelectorAll('.nav-link');
    
    for (var i = 0; i < navLinks.length; i++) {
        navLinks[i].addEventListener('click', function(e) {
            e.preventDefault();
            var section = this.getAttribute('data-section');
            switchSection(section);
        });
    }
}

// Toggle theme between dark and light
function toggleTheme() {
    var body = document.body;
    var themeBtn = document.getElementById('themeBtn');
    var settings = loadData('settings');
    
    if (body.classList.contains('light-theme')) {
        body.classList.remove('light-theme');
        themeBtn.textContent = '🌙';
        settings.theme = 'dark';
    } else {
        body.classList.add('light-theme');
        themeBtn.textContent = '☀️';
        settings.theme = 'light';
    }
    
    saveData('settings', settings);
}

// Apply saved theme on load
function applySavedTheme() {
    var settings = loadData('settings');
    var themeBtn = document.getElementById('themeBtn');
    var themeSelect = document.getElementById('themeSelect');
    
    if (settings && settings.theme === 'light') {
        document.body.classList.add('light-theme');
        themeBtn.textContent = '☀️';
        if (themeSelect) {
            themeSelect.value = 'light';
        }
    } else {
        themeBtn.textContent = '🌙';
        if (themeSelect) {
            themeSelect.value = 'dark';
        }
    }
}

// Setup theme toggle button
function setupThemeToggle() {
    var themeBtn = document.getElementById('themeBtn');
    themeBtn.addEventListener('click', toggleTheme);
}