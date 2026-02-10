// ==================== DASHBOARD FUNCTIONS ====================

// Update entire dashboard
function updateDashboard() {
    updateDashboardStats();
    updateTodaySchedule();
    updateUpcomingDeadlines();
}

// Update dashboard statistics
function updateDashboardStats() {
    var subjects = loadData('subjects') || [];
    var tasks = loadData('tasks') || [];
    var schedules = loadData('schedules') || [];
    
    // Total subjects
    document.getElementById('totalSubjects').textContent = subjects.length;
    
    // Pending tasks
    var pendingCount = 0;
    for (var i = 0; i < tasks.length; i++) {
        if (!tasks[i].completed) {
            pendingCount++;
        }
    }
    document.getElementById('pendingTasks').textContent = pendingCount;
    
    // Today's sessions
    var today = getTodayName();
    var todayCount = 0;
    
    for (var i = 0; i < schedules.length; i++) {
        if (schedules[i].day === today) {
            todayCount++;
        }
    }
    document.getElementById('todaySessions').textContent = todayCount;
    
    // Completion rate
    var completedCount = tasks.length - pendingCount;
    var rate = 0;
    if (tasks.length > 0) {
        rate = Math.round((completedCount / tasks.length) * 100);
    }
    document.getElementById('completionRate').textContent = rate + '%';
}

// Update today's schedule list
function updateTodaySchedule() {
    var schedules = loadData('schedules') || [];
    var container = document.getElementById('todayScheduleList');
    var today = getTodayName();
    
    var todaySchedules = [];
    
    for (var i = 0; i < schedules.length; i++) {
        if (schedules[i].day === today) {
            todaySchedules.push(schedules[i]);
        }
    }
    
    if (todaySchedules.length === 0) {
        container.innerHTML = '<p class="empty-msg">No sessions scheduled for today</p>';
        return;
    }
    
    // Sort by start time
    todaySchedules.sort(function(a, b) {
        return a.startTime.localeCompare(b.startTime);
    });
    
    var html = '';
    
    for (var i = 0; i < todaySchedules.length; i++) {
        var s = todaySchedules[i];
        html += '<div class="list-item">';
        html += '<span>' + s.subjectName + '</span>';
        html += '<span>' + s.startTime + ' - ' + s.endTime + '</span>';
        html += '</div>';
    }
    
    container.innerHTML = html;
}

// Update upcoming deadlines list
function updateUpcomingDeadlines() {
    var tasks = loadData('tasks') || [];
    var container = document.getElementById('upcomingDeadlines');
    var now = new Date();
    
    var upcomingTasks = [];
    
    for (var i = 0; i < tasks.length; i++) {
        var task = tasks[i];
        
        if (task.completed) {
            continue;
        }
        
        var deadline = new Date(task.deadline);
        var daysLeft = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
        
        if (daysLeft <= 7 && daysLeft >= 0) {
            upcomingTasks.push({
                title: task.title,
                deadline: task.deadline,
                daysLeft: daysLeft
            });
        }
    }
    
    if (upcomingTasks.length === 0) {
        container.innerHTML = '<p class="empty-msg">No upcoming deadlines</p>';
        return;
    }
    
    // Sort by days left
    upcomingTasks.sort(function(a, b) {
        return a.daysLeft - b.daysLeft;
    });
    
    var html = '';
    
    for (var i = 0; i < upcomingTasks.length; i++) {
        var t = upcomingTasks[i];
        var style = '';
        
        if (t.daysLeft <= 2) {
            style = 'color: var(--danger)';
        }
        
        html += '<div class="list-item" style="' + style + '">';
        html += '<span>' + t.title + '</span>';
        html += '<span>' + t.daysLeft + ' days left</span>';
        html += '</div>';
    }
    
    container.innerHTML = html;
}