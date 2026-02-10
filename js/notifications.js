// ==================== NOTIFICATION FUNCTIONS ====================

// Show notification popup
function showNotification(message) {
    var notif = document.getElementById('notification');
    var notifText = document.getElementById('notificationText');
    
    notifText.textContent = message;
    notif.classList.remove('hidden');
    
    setTimeout(function() {
        notif.classList.add('hidden');
    }, 3000);
}

// Check for upcoming deadline reminders
function checkReminders() {
    var settings = loadData('settings');
    if (!settings || !settings.notifications) {
        return;
    }
    
    var tasks = loadData('tasks') || [];
    var now = new Date();
    
    for (var i = 0; i < tasks.length; i++) {
        var task = tasks[i];
        
        if (task.completed) {
            continue;
        }
        
        var deadline = new Date(task.deadline);
        var hoursLeft = (deadline - now) / (1000 * 60 * 60);
        
        if (hoursLeft <= 24 && hoursLeft > 0) {
            showNotification('Reminder: "' + task.title + '" is due soon!');
            break;
        }
    }
}

// Start reminder checker
function startReminderChecker() {
    // Check every 5 minutes
    setInterval(checkReminders, 5 * 60 * 1000);
    
    // Check on load after 3 seconds
    setTimeout(checkReminders, 3000);
}