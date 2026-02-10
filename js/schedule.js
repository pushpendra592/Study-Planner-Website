// ==================== SCHEDULE FUNCTIONS ====================

// Add new schedule session
function addSchedule(subjectId, day, startTime, endTime) {
    var schedules = loadData('schedules') || [];
    
    // Check for conflicts
    var hasConflict = checkTimeConflict(day, startTime, endTime, null);
    if (hasConflict) {
        showNotification('Time conflict with another session!');
        return false;
    }
    
    var subjectName = getSubjectName(subjectId);
    
    var schedule = {
        id: generateId(),
        subjectId: parseInt(subjectId),
        subjectName: subjectName,
        day: day,
        startTime: startTime,
        endTime: endTime
    };
    
    schedules.push(schedule);
    saveData('schedules', schedules);
    
    addActivity('Added study session: ' + subjectName + ' on ' + day);
    showNotification('Schedule added!');
    
    displaySchedule();
    updateDashboard();
    
    return true;
}

// Check for time conflicts
function checkTimeConflict(day, startTime, endTime, excludeId) {
    var schedules = loadData('schedules') || [];
    
    for (var i = 0; i < schedules.length; i++) {
        var s = schedules[i];
        
        // Skip different days
        if (s.day !== day) {
            continue;
        }
        
        // Skip excluded ID (for editing)
        if (excludeId && s.id === excludeId) {
            continue;
        }
        
        // Check overlap
        var overlap = false;
        
        if (startTime >= s.startTime && startTime < s.endTime) {
            overlap = true;
        }
        if (endTime > s.startTime && endTime <= s.endTime) {
            overlap = true;
        }
        if (startTime <= s.startTime && endTime >= s.endTime) {
            overlap = true;
        }
        
        if (overlap) {
            return true;
        }
    }
    
    return false;
}

// Delete schedule by ID
function deleteSchedule(id) {
    var schedules = loadData('schedules') || [];
    
    for (var i = 0; i < schedules.length; i++) {
        if (schedules[i].id === id) {
            schedules.splice(i, 1);
            break;
        }
    }
    
    saveData('schedules', schedules);
    
    showNotification('Schedule deleted!');
    displaySchedule();
    updateDashboard();
}

// Display weekly schedule
function displaySchedule() {
    var schedules = loadData('schedules') || [];
    var container = document.getElementById('scheduleDisplay');
    
    var days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    var html = '';
    
    for (var d = 0; d < days.length; d++) {
        var day = days[d];
        var daySchedules = [];
        
        // Get schedules for this day
        for (var i = 0; i < schedules.length; i++) {
            if (schedules[i].day === day) {
                daySchedules.push(schedules[i]);
            }
        }
        
        // Sort by start time
        daySchedules.sort(function(a, b) {
            return a.startTime.localeCompare(b.startTime);
        });
        
        // Build HTML
        html += '<div class="schedule-day">';
        html += '<h4>' + capitalizeFirst(day) + '</h4>';
        
        if (daySchedules.length === 0) {
            html += '<p class="empty-msg" style="padding: 0.5rem">No sessions</p>';
        } else {
            for (var j = 0; j < daySchedules.length; j++) {
                var s = daySchedules[j];
                html += '<div class="schedule-item">';
                html += '<span class="time">' + s.startTime + ' - ' + s.endTime + '</span>';
                html += '<span class="subject-name">' + s.subjectName + '</span>';
                html += '<button class="btn small danger" onclick="deleteSchedule(' + s.id + ')">×</button>';
                html += '</div>';
            }
        }
        
        html += '</div>';
    }
    
    container.innerHTML = html;
}

// Capitalize first letter
function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Get today's day name
function getTodayName() {
    var days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[new Date().getDay()];
}

// Setup schedule form
function setupScheduleForm() {
    var form = document.getElementById('scheduleForm');
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        var subjectId = document.getElementById('scheduleSubject').value;
        var day = document.getElementById('scheduleDay').value;
        var startTime = document.getElementById('startTime').value;
        var endTime = document.getElementById('endTime').value;
        
        if (!subjectId || !startTime || !endTime) {
            showNotification('Please fill all fields!');
            return;
        }
        
        if (startTime >= endTime) {
            showNotification('End time must be after start time!');
            return;
        }
        
        var success = addSchedule(subjectId, day, startTime, endTime);
        if (success) {
            this.reset();
        }
    });
}