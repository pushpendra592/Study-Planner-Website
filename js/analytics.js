/* analytics.js — Analytics page with Chart.js */

document.addEventListener('DOMContentLoaded', () => {
    initAnalyticsPage();
});

let chartInstances = {};
let analyticsPeriod = 'week';

function initAnalyticsPage() {
    renderAnalytics();
    renderInsights();

    document.querySelectorAll('.period-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.period-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            analyticsPeriod = btn.dataset.period;
            renderAnalytics();
            renderInsights();
        });
    });
}

function getFilteredLogs() {
    const logs = Storage.getStudyLogs();
    const now = new Date();

    if (analyticsPeriod === 'week') {
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return logs.filter(l => new Date(l.date) >= weekAgo);
    } else if (analyticsPeriod === 'month') {
        const monthAgo = new Date(now);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return logs.filter(l => new Date(l.date) >= monthAgo);
    }
    return logs;
}

function renderAnalytics() {
    renderStudyDistribution();
    renderWeeklyHours();
    renderProgressLine();
    renderCompletionRate();
    renderStatsSummary();
}

function renderStudyDistribution() {
    const ctx = document.getElementById('distributionChart');
    if (!ctx) return;

    if (chartInstances.distribution) chartInstances.distribution.destroy();

    const logs = getFilteredLogs();
    const subjects = Storage.getSubjects();
    const subjectMap = {};

    logs.forEach(l => {
        if (l.subjectId) {
            subjectMap[l.subjectId] = (subjectMap[l.subjectId] || 0) + (l.duration || 0);
        }
    });

    const labels = [];
    const data = [];
    const colors = [];

    subjects.forEach(s => {
        if (subjectMap[s.id]) {
            labels.push(s.name);
            data.push(Math.round(subjectMap[s.id] * 10) / 10);
            colors.push(s.color || '#8B5CF6');
        }
    });

    if (data.length === 0) {
        labels.push('No data');
        data.push(1);
        colors.push('#3f3f46');
    }

    chartInstances.distribution = new Chart(ctx, {
        type: 'pie',
        data: {
            labels,
            datasets: [{
                data,
                backgroundColor: colors,
                borderColor: 'transparent',
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary').trim(),
                        padding: 16,
                        font: { family: "'Inter', sans-serif", size: 12 }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: (tooltipItem) => `${tooltipItem.label}: ${tooltipItem.parsed} min`
                    }
                }
            }
        }
    });
}

function renderWeeklyHours() {
    const ctx = document.getElementById('weeklyChart');
    if (!ctx) return;

    if (chartInstances.weekly) chartInstances.weekly.destroy();

    const logs = getFilteredLogs();
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dailyMinutes = [0, 0, 0, 0, 0, 0, 0];

    logs.forEach(l => {
        const dayIdx = new Date(l.date).getDay();
        dailyMinutes[dayIdx] += l.duration || 0;
    });

    const hours = dailyMinutes.map(m => Math.round(m / 60 * 10) / 10);

    const textColor = getComputedStyle(document.documentElement).getPropertyValue('--text-secondary').trim();
    const gridColor = getComputedStyle(document.documentElement).getPropertyValue('--border').trim();

    chartInstances.weekly = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: days,
            datasets: [{
                label: 'Hours',
                data: hours,
                backgroundColor: 'rgba(139, 92, 246, 0.6)',
                borderColor: '#8B5CF6',
                borderWidth: 1,
                borderRadius: 6,
                borderSkipped: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: gridColor },
                    ticks: { color: textColor, font: { family: "'Inter', sans-serif" } }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: textColor, font: { family: "'Inter', sans-serif" } }
                }
            }
        }
    });
}

function renderProgressLine() {
    const ctx = document.getElementById('progressChart');
    if (!ctx) return;

    if (chartInstances.progress) chartInstances.progress.destroy();

    const logs = getFilteredLogs();
    const dateMap = {};

    logs.forEach(l => {
        const dateKey = new Date(l.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        dateMap[dateKey] = (dateMap[dateKey] || 0) + (l.duration || 0);
    });

    const labels = Object.keys(dateMap);
    const data = Object.values(dateMap).map(m => Math.round(m / 60 * 10) / 10);

    // If no data, show placeholder
    if (labels.length === 0) {
        labels.push('No data');
        data.push(0);
    }

    const textColor = getComputedStyle(document.documentElement).getPropertyValue('--text-secondary').trim();
    const gridColor = getComputedStyle(document.documentElement).getPropertyValue('--border').trim();

    chartInstances.progress = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: 'Hours',
                data,
                borderColor: '#8B5CF6',
                backgroundColor: 'rgba(139, 92, 246, 0.1)',
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#8B5CF6',
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: gridColor },
                    ticks: { color: textColor, font: { family: "'Inter', sans-serif" } }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: textColor, font: { family: "'Inter', sans-serif" } }
                }
            }
        }
    });
}

function renderCompletionRate() {
    const ctx = document.getElementById('completionChart');
    if (!ctx) return;

    if (chartInstances.completion) chartInstances.completion.destroy();

    const tasks = Storage.getTasks();
    const completed = tasks.filter(t => t.completed).length;
    const pending = tasks.length - completed;

    chartInstances.completion = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Completed', 'Pending'],
            datasets: [{
                data: [completed || 0, pending || (completed ? 0 : 1)],
                backgroundColor: ['#22c55e', '#3f3f46'],
                borderColor: 'transparent',
                borderWidth: 0,
                cutout: '72%'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary').trim(),
                        padding: 16,
                        font: { family: "'Inter', sans-serif", size: 12 }
                    }
                }
            }
        }
    });
}

function renderStatsSummary() {
    const logs = getFilteredLogs();
    const tasks = Storage.getTasks();
    const subjects = Storage.getSubjects();

    const totalMinutes = logs.reduce((sum, l) => sum + (l.duration || 0), 0);
    const totalHours = Math.round(totalMinutes / 60 * 10) / 10;

    const completed = tasks.filter(t => t.completed).length;
    const pending = tasks.length - completed;

    // Most studied subject
    const subjectMinutes = {};
    logs.forEach(l => {
        if (l.subjectId) subjectMinutes[l.subjectId] = (subjectMinutes[l.subjectId] || 0) + (l.duration || 0);
    });
    let topSubjectName = 'None';
    let topMinutes = 0;
    Object.entries(subjectMinutes).forEach(([id, mins]) => {
        if (mins > topMinutes) {
            const s = Storage.getSubjectById(id);
            topSubjectName = s ? s.name : 'Unknown';
            topMinutes = mins;
        }
    });

    // Streak calculation
    const streak = calculateStreak(logs);

    const container = document.getElementById('statsSummary');
    if (container) {
        container.innerHTML = `
      <div class="stat-card">
        <div class="stat-icon purple"><i class="fas fa-clock"></i></div>
        <div class="stat-info">
          <h4>Total Study Time</h4>
          <div class="stat-value">${totalHours}h</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon green"><i class="fas fa-check-double"></i></div>
        <div class="stat-info">
          <h4>Tasks Done</h4>
          <div class="stat-value">${completed}/${tasks.length}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon yellow"><i class="fas fa-star"></i></div>
        <div class="stat-info">
          <h4>Top Subject</h4>
          <div class="stat-value" style="font-size:1.1rem">${escapeHtml(topSubjectName)}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon red"><i class="fas fa-fire"></i></div>
        <div class="stat-info">
          <h4>Streak</h4>
          <div class="stat-value">${streak} day${streak !== 1 ? 's' : ''}</div>
        </div>
      </div>`;
    }
}

function calculateStreak(logs) {
    if (logs.length === 0) return 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dates = new Set();
    logs.forEach(l => {
        const d = new Date(l.date);
        d.setHours(0, 0, 0, 0);
        dates.add(d.getTime());
    });

    let streak = 0;
    let checkDate = new Date(today);

    while (dates.has(checkDate.getTime())) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
    }

    return streak;
}

function renderInsights() {
    const container = document.getElementById('insightsContainer');
    if (!container) return;

    const logs = getFilteredLogs();
    const tasks = Storage.getTasks();
    const subjects = Storage.getSubjects();
    const insights = [];

    // Check study frequency
    const totalMinutes = logs.reduce((sum, l) => sum + (l.duration || 0), 0);
    if (totalMinutes === 0) {
        insights.push({
            icon: 'fa-lightbulb',
            color: 'var(--warning)',
            text: 'Start logging your study sessions to see personalized insights here.'
        });
    } else {
        const avgDaily = totalMinutes / 7;
        if (avgDaily >= 120) {
            insights.push({
                icon: 'fa-trophy',
                color: 'var(--success)',
                text: `Great work! You\'re averaging ${Math.round(avgDaily)} minutes per day.`
            });
        } else {
            insights.push({
                icon: 'fa-arrow-up',
                color: 'var(--accent)',
                text: `Try to increase your daily study time. You\'re currently at ${Math.round(avgDaily)} min/day.`
            });
        }
    }

    // Check overdue tasks
    const overdue = tasks.filter(t => !t.completed && new Date(t.deadline) < new Date()).length;
    if (overdue > 0) {
        insights.push({
            icon: 'fa-exclamation-circle',
            color: 'var(--danger)',
            text: `You have ${overdue} overdue task${overdue > 1 ? 's' : ''}. Try to catch up soon.`
        });
    }

    // Subject balance
    if (subjects.length > 1 && logs.length > 0) {
        const subjectMinutes = {};
        logs.forEach(l => {
            if (l.subjectId) subjectMinutes[l.subjectId] = (subjectMinutes[l.subjectId] || 0) + (l.duration || 0);
        });
        const studied = Object.keys(subjectMinutes).length;
        if (studied < subjects.length) {
            insights.push({
                icon: 'fa-balance-scale',
                color: 'var(--warning)',
                text: `You\'ve only studied ${studied} of ${subjects.length} subjects. Try to balance your time.`
            });
        }
    }

    if (insights.length === 0) {
        insights.push({
            icon: 'fa-chart-line',
            color: 'var(--accent)',
            text: 'Keep studying and your insights will appear here.'
        });
    }

    container.innerHTML = insights.map(i => `
    <div style="display:flex;align-items:flex-start;gap:12px;padding:12px 0;border-bottom:1px solid var(--border)">
      <i class="fas ${i.icon}" style="color:${i.color};margin-top:3px;flex-shrink:0"></i>
      <p style="font-size:0.88rem;color:var(--text-secondary);margin:0">${i.text}</p>
    </div>
  `).join('');
}
