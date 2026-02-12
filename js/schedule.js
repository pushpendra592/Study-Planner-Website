/* schedule.js — Schedule page logic */

document.addEventListener('DOMContentLoaded', () => {
    initSchedulePage();
});

let currentView = 'daily';
let selectedDay = new Date().getDay();
let editingScheduleId = null;

function initSchedulePage() {
    populateSubjectDropdown();
    renderDaySelector();
    renderSchedule();

    const form = document.getElementById('scheduleForm');
    if (form) form.addEventListener('submit', handleScheduleSubmit);

    // View toggle
    document.querySelectorAll('.view-toggle-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.view-toggle-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentView = btn.dataset.view;
            renderSchedule();
        });
    });

    // Print button
    const printBtn = document.getElementById('printSchedule');
    if (printBtn) printBtn.addEventListener('click', () => window.print());
}

function populateSubjectDropdown() {
    const select = document.getElementById('scheduleSubject');
    if (!select) return;
    const subjects = Storage.getSubjects();
    select.innerHTML = '<option value="">Choose a subject</option>' +
        subjects.map(s => `<option value="${s.id}">${escapeHtml(s.name)}</option>`).join('');
}

function renderDaySelector() {
    const container = document.getElementById('daySelector');
    if (!container) return;
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    container.innerHTML = days.map((d, i) =>
        `<button class="day-btn ${i === selectedDay ? 'active' : ''}" onclick="selectDay(${i})">${d}</button>`
    ).join('');
}

function selectDay(dayNum) {
    selectedDay = dayNum;
    renderDaySelector();
    renderSchedule();
}

function handleScheduleSubmit(e) {
    e.preventDefault();

    const subjectId = document.getElementById('scheduleSubject').value;
    const day = parseInt(document.getElementById('scheduleDay').value);
    const startTime = document.getElementById('scheduleStart').value;
    const endTime = document.getElementById('scheduleEnd').value;
    const recurring = document.getElementById('scheduleRecurring')?.checked || false;

    if (!subjectId || isNaN(day) || !startTime || !endTime) {
        showToast('Please fill all required fields.', 'error');
        return;
    }

    if (Storage.timeToMinutes(startTime) >= Storage.timeToMinutes(endTime)) {
        showToast('End time must be after start time.', 'error');
        return;
    }

    // Check conflicts
    const conflict = Storage.checkScheduleConflict(day, startTime, endTime, editingScheduleId);
    if (conflict) {
        const confSubject = Storage.getSubjectById(conflict.subjectId);
        showToast(`Conflicts with "${confSubject ? confSubject.name : 'another session'}" at ${Storage.formatTime12(conflict.startTime)}.`, 'warning');
        return;
    }

    const entry = { subjectId, day, startTime, endTime, recurring };

    if (editingScheduleId) {
        Storage.updateSchedule(editingScheduleId, entry);
        showToast('Schedule updated!', 'success');
        editingScheduleId = null;
        document.querySelector('#scheduleForm button[type="submit"]').innerHTML = '<i class="fas fa-plus"></i> Add Session';
    } else {
        Storage.addSchedule(entry);
        showToast('Session scheduled!', 'success');
    }

    e.target.reset();
    renderSchedule();
}

function renderSchedule() {
    if (currentView === 'daily') {
        renderDailyView();
    } else {
        renderWeeklyView();
    }
}

function renderDailyView() {
    const container = document.getElementById('scheduleTimeline');
    if (!container) return;

    const schedules = Storage.getSchedules().filter(s => s.day === selectedDay);
    schedules.sort((a, b) => Storage.timeToMinutes(a.startTime) - Storage.timeToMinutes(b.startTime));

    // Generate time slots from 6AM to 11PM
    let html = '';
    for (let hour = 6; hour <= 23; hour++) {
        const timeStr = `${hour.toString().padStart(2, '0')}:00`;
        const label = Storage.formatTime12(timeStr);
        const slotsInHour = schedules.filter(s => {
            const sh = parseInt(s.startTime.split(':')[0]);
            return sh === hour;
        });

        html += `<div class="timeline-slot">
      <div class="timeline-time">${label}</div>
      <div class="timeline-content">`;

        if (slotsInHour.length > 0) {
            slotsInHour.forEach(s => {
                const subject = Storage.getSubjectById(s.subjectId);
                const color = subject ? subject.color : '#8B5CF6';
                html += `
          <div class="timeline-block" style="border-left-color:${color}; background:${color}15" onclick="editScheduleEntry('${s.id}')">
            <div style="display:flex;justify-content:space-between;align-items:center">
              <strong style="font-size:0.85rem">${subject ? escapeHtml(subject.name) : 'Unknown'}</strong>
              <button class="btn btn-ghost btn-sm" onclick="event.stopPropagation();deleteScheduleEntry('${s.id}')" style="padding:4px 8px">
                <i class="fas fa-times"></i>
              </button>
            </div>
            <small style="color:var(--text-muted)">${Storage.formatTime12(s.startTime)} — ${Storage.formatTime12(s.endTime)}</small>
          </div>`;
            });
        }

        html += `</div></div>`;
    }

    container.innerHTML = html;

    if (schedules.length === 0) {
        document.getElementById('scheduleEmpty')?.classList.remove('hidden');
    } else {
        document.getElementById('scheduleEmpty')?.classList.add('hidden');
    }
}

function renderWeeklyView() {
    const container = document.getElementById('scheduleTimeline');
    if (!container) return;

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const allSchedules = Storage.getSchedules();

    let html = '';
    days.forEach((dayName, dayIdx) => {
        const daySchedules = allSchedules.filter(s => s.day === dayIdx);
        daySchedules.sort((a, b) => Storage.timeToMinutes(a.startTime) - Storage.timeToMinutes(b.startTime));

        html += `<div class="card" style="margin-bottom:1rem">
      <h3 style="font-size:0.95rem;margin-bottom:0.75rem;display:flex;align-items:center;gap:8px">
        <span class="day-btn ${dayIdx === new Date().getDay() ? 'active' : ''}" style="width:auto;height:auto;padding:4px 10px;pointer-events:none;font-size:0.72rem">${dayName.slice(0, 3)}</span>
        ${dayName}
        <small style="margin-left:auto;font-weight:400">${daySchedules.length} session${daySchedules.length !== 1 ? 's' : ''}</small>
      </h3>`;

        if (daySchedules.length === 0) {
            html += `<p style="font-size:0.85rem;color:var(--text-muted);padding:0.5rem 0">No sessions scheduled</p>`;
        } else {
            daySchedules.forEach(s => {
                const subject = Storage.getSubjectById(s.subjectId);
                const color = subject ? subject.color : '#8B5CF6';
                html += `
          <div class="timeline-block" style="border-left-color:${color};background:${color}15;margin-bottom:6px" onclick="editScheduleEntry('${s.id}')">
            <div style="display:flex;justify-content:space-between;align-items:center">
              <strong style="font-size:0.85rem">${subject ? escapeHtml(subject.name) : 'Unknown'}</strong>
              <button class="btn btn-ghost btn-sm" onclick="event.stopPropagation();deleteScheduleEntry('${s.id}')" style="padding:4px 8px"><i class="fas fa-times"></i></button>
            </div>
            <small style="color:var(--text-muted)">${Storage.formatTime12(s.startTime)} — ${Storage.formatTime12(s.endTime)}</small>
          </div>`;
            });
        }

        html += `</div>`;
    });

    container.innerHTML = html;
}

function editScheduleEntry(id) {
    const s = Storage.getSchedules().find(e => e.id === id);
    if (!s) return;

    editingScheduleId = id;
    document.getElementById('scheduleSubject').value = s.subjectId;
    document.getElementById('scheduleDay').value = s.day;
    document.getElementById('scheduleStart').value = s.startTime;
    document.getElementById('scheduleEnd').value = s.endTime;
    if (document.getElementById('scheduleRecurring')) {
        document.getElementById('scheduleRecurring').checked = s.recurring || false;
    }

    document.querySelector('#scheduleForm button[type="submit"]').innerHTML = '<i class="fas fa-save"></i> Update Session';
    document.getElementById('scheduleForm').scrollIntoView({ behavior: 'smooth' });
}

function deleteScheduleEntry(id) {
    confirmAction('Delete Session', 'Remove this study session from your schedule?', () => {
        Storage.deleteSchedule(id);
        showToast('Session removed.', 'success');
        renderSchedule();
    });
}
