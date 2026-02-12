/* tasks.js — Task management page logic */

document.addEventListener('DOMContentLoaded', () => {
    initTasksPage();
    requestNotificationPermission();
});

let editingTaskId = null;
let currentCategory = 'all';
let currentSort = 'deadline';

function initTasksPage() {
    populateTaskSubjectDropdown();
    renderTasks();
    startDeadlineChecker();

    const form = document.getElementById('taskForm');
    if (form) form.addEventListener('submit', handleTaskSubmit);

    // Category tabs
    document.querySelectorAll('.task-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.task-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentCategory = tab.dataset.category;
            renderTasks();
        });
    });

    // Sort
    const sortSelect = document.getElementById('taskSort');
    if (sortSelect) {
        sortSelect.addEventListener('change', () => {
            currentSort = sortSelect.value;
            renderTasks();
        });
    }
}

function populateTaskSubjectDropdown() {
    const select = document.getElementById('taskSubject');
    if (!select) return;
    const subjects = Storage.getSubjects();
    select.innerHTML = '<option value="">No subject</option>' +
        subjects.map(s => `<option value="${s.id}">${escapeHtml(s.name)}</option>`).join('');
}

function handleTaskSubmit(e) {
    e.preventDefault();

    const title = document.getElementById('taskTitle').value.trim();
    const description = document.getElementById('taskDescription')?.value.trim() || '';
    const subjectId = document.getElementById('taskSubject').value;
    const type = document.getElementById('taskType').value;
    const deadline = document.getElementById('taskDeadline').value;
    const priority = document.getElementById('taskPriority').value;

    if (!title) {
        showToast('Please enter a task title.', 'error');
        return;
    }
    if (!deadline) {
        showToast('Please set a deadline.', 'error');
        return;
    }

    const taskData = { title, description, subjectId, type, deadline, priority };

    if (editingTaskId) {
        Storage.updateTask(editingTaskId, taskData);
        showToast('Task updated!', 'success');
        editingTaskId = null;
        document.querySelector('#taskForm button[type="submit"]').innerHTML = '<i class="fas fa-plus"></i> Add Task';
    } else {
        Storage.addTask(taskData);
        showToast('Task added!', 'success');
    }

    e.target.reset();
    closeModal('taskModal');
    renderTasks();
}

function renderTasks() {
    const container = document.getElementById('tasksList');
    if (!container) return;

    let tasks = Storage.getTasks();

    // Filter by category
    if (currentCategory !== 'all') {
        tasks = tasks.filter(t => t.type === currentCategory);
    }

    // Sort
    tasks.sort((a, b) => {
        if (currentSort === 'deadline') {
            return new Date(a.deadline) - new Date(b.deadline);
        } else if (currentSort === 'priority') {
            const order = { high: 0, medium: 1, low: 2 };
            return (order[a.priority] || 2) - (order[b.priority] || 2);
        }
        return new Date(b.createdAt) - new Date(a.createdAt);
    });

    // Move completed to bottom
    const pending = tasks.filter(t => !t.completed);
    const completed = tasks.filter(t => t.completed);
    tasks = [...pending, ...completed];

    // Update counts
    updateTaskCounts();

    if (tasks.length === 0) {
        container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">✅</div>
        <h3>${currentCategory !== 'all' ? 'No ' + currentCategory + ' tasks' : 'No tasks yet'}</h3>
        <p>Click "Add Task" to create your first task and stay on top of your deadlines.</p>
      </div>`;
        return;
    }

    container.innerHTML = tasks.map(t => {
        const deadlineInfo = Storage.getRelativeDeadline(t.deadline);
        const subject = t.subjectId ? Storage.getSubjectById(t.subjectId) : null;
        const priorityClass = { high: 'badge-red', medium: 'badge-yellow', low: 'badge-green' }[t.priority] || 'badge-gray';
        const typeIcons = { assignment: 'fa-file-alt', exam: 'fa-graduation-cap', other: 'fa-bookmark' };
        const isOverdue = deadlineInfo.overdue && !t.completed;

        return `
      <div class="card task-card ${t.completed ? 'completed' : ''} ${isOverdue ? 'overdue' : ''}" style="margin-bottom:0.75rem">
        <div style="display:flex;gap:12px;align-items:flex-start">
          <label class="checkbox-wrapper" style="margin-top:2px">
            <input type="checkbox" ${t.completed ? 'checked' : ''} onchange="toggleTaskCompletion('${t.id}')">
            <span class="checkbox-custom"><i class="fas fa-check"></i></span>
          </label>
          <div style="flex:1;min-width:0">
            <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:4px">
              <h4 class="task-title" style="font-size:0.95rem">${escapeHtml(t.title)}</h4>
              <span class="badge ${priorityClass}" style="font-size:0.65rem">${t.priority}</span>
              ${subject ? `<span class="badge badge-purple" style="font-size:0.65rem">${escapeHtml(subject.name)}</span>` : ''}
            </div>
            ${t.description ? `<p style="font-size:0.82rem;margin-bottom:6px;color:var(--text-muted)">${escapeHtml(t.description)}</p>` : ''}
            <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">
              <small><i class="fas ${typeIcons[t.type] || 'fa-bookmark'}" style="margin-right:4px"></i>${t.type || 'other'}</small>
              <small><i class="far fa-clock" style="margin-right:4px"></i>${formatDateTime(t.deadline)}</small>
              <span class="deadline-countdown badge ${deadlineInfo.class}">${deadlineInfo.text}</span>
            </div>
          </div>
          <div class="btn-group" style="flex-shrink:0">
            <button class="btn btn-ghost btn-sm btn-icon" onclick="editTask('${t.id}')" title="Edit"><i class="fas fa-pen"></i></button>
            <button class="btn btn-ghost btn-sm btn-icon" onclick="deleteTask('${t.id}')" title="Delete"><i class="fas fa-trash"></i></button>
          </div>
        </div>
      </div>`;
    }).join('');
}

function updateTaskCounts() {
    const tasks = Storage.getTasks();
    const counts = {
        all: tasks.length,
        assignment: tasks.filter(t => t.type === 'assignment').length,
        exam: tasks.filter(t => t.type === 'exam').length,
        other: tasks.filter(t => t.type === 'other').length,
    };

    document.querySelectorAll('.task-tab').forEach(tab => {
        const cat = tab.dataset.category;
        const countEl = tab.querySelector('.tab-count');
        if (countEl && counts[cat] !== undefined) {
            countEl.textContent = counts[cat];
        }
    });
}

function toggleTaskCompletion(id) {
    Storage.toggleTask(id);
    const task = Storage.getTasks().find(t => t.id === id);
    if (task && task.completed) {
        showToast('Task completed! Great job! 🎉', 'success');
    }
    renderTasks();
}

function editTask(id) {
    const t = Storage.getTasks().find(task => task.id === id);
    if (!t) return;

    editingTaskId = id;
    document.getElementById('taskTitle').value = t.title;
    document.getElementById('taskDescription').value = t.description || '';
    document.getElementById('taskSubject').value = t.subjectId || '';
    document.getElementById('taskType').value = t.type || 'other';
    document.getElementById('taskDeadline').value = t.deadline || '';
    document.getElementById('taskPriority').value = t.priority || 'medium';

    document.querySelector('#taskForm button[type="submit"]').innerHTML = '<i class="fas fa-save"></i> Update Task';
    openModal('taskModal');
}

function deleteTask(id) {
    confirmAction('Delete Task', 'Remove this task permanently?', () => {
        Storage.deleteTask(id);
        showToast('Task deleted.', 'success');
        renderTasks();
    });
}

function openAddTaskModal() {
    editingTaskId = null;
    document.getElementById('taskForm')?.reset();
    document.querySelector('#taskForm button[type="submit"]').innerHTML = '<i class="fas fa-plus"></i> Add Task';
    populateTaskSubjectDropdown();
    openModal('taskModal');
}

/* ===== Browser Notifications ===== */
function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
}

function sendNotification(title, body) {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, { body, icon: '📚' });
    }
}

function startDeadlineChecker() {
    // Check every minute for upcoming deadlines
    setInterval(() => {
        const settings = Storage.getSettings();
        if (!settings.notifications) return;

        const tasks = Storage.getTasks().filter(t => !t.completed);
        const now = new Date();

        tasks.forEach(t => {
            const deadline = new Date(t.deadline);
            const diffMinutes = (deadline - now) / 60000;

            if (diffMinutes > 0 && diffMinutes <= 30 && !t._notified30) {
                sendNotification('Deadline approaching!', `"${t.title}" is due in ${Math.round(diffMinutes)} minutes.`);
                t._notified30 = true;
            }
        });
    }, 60000);
}
