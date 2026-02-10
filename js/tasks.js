// ==================== TASK FUNCTIONS ====================

// Current filter state
var currentTaskFilter = 'all';

// Add new task
function addTask(title, subjectId, type, deadline, priority) {
    var tasks = loadData('tasks') || [];
    var subjectName = getSubjectName(subjectId);
    
    var task = {
        id: generateId(),
        title: title,
        subjectId: parseInt(subjectId),
        subjectName: subjectName,
        type: type,
        deadline: deadline,
        priority: priority,
        completed: false,
        createdAt: new Date().toISOString()
    };
    
    tasks.push(task);
    saveData('tasks', tasks);
    
    addActivity('Added task: ' + title);
    showNotification('Task added!');
    
    displayTasks('all');
    updateDashboard();
}

// Toggle task completion
function toggleTask(id) {
    var tasks = loadData('tasks') || [];
    
    for (var i = 0; i < tasks.length; i++) {
        if (tasks[i].id === id) {
            tasks[i].completed = !tasks[i].completed;
            
            if (tasks[i].completed) {
                addActivity('Completed task: ' + tasks[i].title);
                updateSubjectProgress(tasks[i].subjectId);
            }
            break;
        }
    }
    
    saveData('tasks', tasks);
    displayTasks(currentTaskFilter);
    updateDashboard();
}

// Delete task by ID
function deleteTask(id) {
    var tasks = loadData('tasks') || [];
    
    for (var i = 0; i < tasks.length; i++) {
        if (tasks[i].id === id) {
            tasks.splice(i, 1);
            break;
        }
    }
    
    saveData('tasks', tasks);
    
    showNotification('Task deleted!');
    displayTasks(currentTaskFilter);
    updateDashboard();
}

// Display tasks with filter
function displayTasks(filter) {
    currentTaskFilter = filter;
    
    var tasks = loadData('tasks') || [];
    var container = document.getElementById('tasksList');
    
    // Filter tasks
    var filteredTasks = [];
    
    for (var i = 0; i < tasks.length; i++) {
        var task = tasks[i];
        
        if (filter === 'all') {
            filteredTasks.push(task);
        } else if (filter === 'pending' && !task.completed) {
            filteredTasks.push(task);
        } else if (filter === 'completed' && task.completed) {
            filteredTasks.push(task);
        }
    }
    
    // Sort by deadline
    filteredTasks.sort(function(a, b) {
        return new Date(a.deadline) - new Date(b.deadline);
    });
    
    // Build HTML
    if (filteredTasks.length === 0) {
        container.innerHTML = '<p class="empty-msg">No tasks found</p>';
        return;
    }
    
    var html = '';
    var now = new Date();
    
    for (var i = 0; i < filteredTasks.length; i++) {
        var t = filteredTasks[i];
        var isOverdue = new Date(t.deadline) < now && !t.completed;
        
        html += '<div class="task-item ' + (t.completed ? 'completed' : '') + '">';
        html += '<input type="checkbox" class="task-checkbox" ';
        html += (t.completed ? 'checked ' : '');
        html += 'onchange="toggleTask(' + t.id + ')">';
        html += '<div class="task-content">';
        html += '<div class="task-title">' + t.title + '</div>';
        html += '<div class="task-meta">';
        html += '<span>📚 ' + t.subjectName + '</span>';
        html += '<span>📋 ' + t.type + '</span>';
        html += '<span style="color: ' + (isOverdue ? 'var(--danger)' : 'inherit') + '">';
        html += '📅 ' + t.deadline + '</span>';
        html += '<span class="priority-badge priority-' + t.priority + '">' + t.priority + '</span>';
        html += '</div>';
        html += '</div>';
        html += '<div class="task-actions">';
        html += '<button class="btn small danger" onclick="deleteTask(' + t.id + ')">Delete</button>';
        html += '</div>';
        html += '</div>';
    }
    
    container.innerHTML = html;
}

// Update subject progress when task completed
function updateSubjectProgress(subjectId) {
    var tasks = loadData('tasks') || [];
    var subjects = loadData('subjects') || [];
    
    var totalTasks = 0;
    var completedTasks = 0;
    
    for (var i = 0; i < tasks.length; i++) {
        if (tasks[i].subjectId === subjectId) {
            totalTasks++;
            if (tasks[i].completed) {
                completedTasks++;
            }
        }
    }
    
    var progress = 0;
    if (totalTasks > 0) {
        progress = Math.round((completedTasks / totalTasks) * 100);
    }
    
    for (var i = 0; i < subjects.length; i++) {
        if (subjects[i].id === subjectId) {
            subjects[i].progress = progress;
            break;
        }
    }
    
    saveData('subjects', subjects);
}

// Setup task form
function setupTaskForm() {
    var form = document.getElementById('taskForm');
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        var title = document.getElementById('taskTitle').value.trim();
        var subjectId = document.getElementById('taskSubject').value;
        var type = document.getElementById('taskType').value;
        var deadline = document.getElementById('taskDeadline').value;
        var priority = document.getElementById('taskPriority').value;
        
        if (!title || !subjectId || !deadline) {
            showNotification('Please fill all required fields!');
            return;
        }
        
        addTask(title, subjectId, type, deadline, priority);
        this.reset();
    });
}

// Setup task filter buttons
function setupTaskFilters() {
    var filterBtns = document.querySelectorAll('.filter-btn');
    
    for (var i = 0; i < filterBtns.length; i++) {
        filterBtns[i].addEventListener('click', function() {
            // Remove active from all
            for (var j = 0; j < filterBtns.length; j++) {
                filterBtns[j].classList.remove('active');
            }
            
            // Add active to clicked
            this.classList.add('active');
            
            // Display filtered tasks
            var filter = this.getAttribute('data-filter');
            displayTasks(filter);
        });
    }
}