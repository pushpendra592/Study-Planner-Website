/* subjects.js — Subject management page logic */

document.addEventListener('DOMContentLoaded', () => {
    initSubjectsPage();
});

let editingSubjectId = null;

function initSubjectsPage() {
    renderSubjects();

    // Form submission
    const form = document.getElementById('subjectForm');
    if (form) {
        form.addEventListener('submit', handleSubjectSubmit);
    }

    // Search
    const searchInput = document.getElementById('subjectSearch');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(() => {
            renderSubjects(searchInput.value.trim());
        }, 250));
    }

    // Filter
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const searchVal = document.getElementById('subjectSearch')?.value || '';
            renderSubjects(searchVal, btn.dataset.priority);
        });
    });
}

function handleSubjectSubmit(e) {
    e.preventDefault();

    const name = document.getElementById('subjectName').value.trim();
    const code = document.getElementById('subjectCode').value.trim();
    const priority = document.getElementById('subjectPriority').value;
    const color = document.getElementById('subjectColor').value;
    const targetHours = parseFloat(document.getElementById('targetHours').value) || 0;

    // Validation
    if (!name) {
        document.getElementById('subjectName').parentElement.classList.add('error');
        showToast('Please enter a subject name.', 'error');
        return;
    }

    const subjectData = { name, code, priority, color, targetHours };

    if (editingSubjectId) {
        Storage.updateSubject(editingSubjectId, subjectData);
        showToast('Subject updated!', 'success');
        editingSubjectId = null;
        document.querySelector('#subjectForm button[type="submit"]').innerHTML = '<i class="fas fa-plus"></i> Add Subject';
    } else {
        Storage.addSubject(subjectData);
        showToast('Subject added!', 'success');
    }

    e.target.reset();
    document.getElementById('subjectColor').value = '#8B5CF6';
    renderSubjects();
}

function renderSubjects(searchTerm = '', priorityFilter = 'all') {
    const container = document.getElementById('subjectsGrid');
    if (!container) return;

    let subjects = Storage.getSubjects();

    if (searchTerm) {
        const lower = searchTerm.toLowerCase();
        subjects = subjects.filter(s =>
            s.name.toLowerCase().includes(lower) ||
            (s.code && s.code.toLowerCase().includes(lower))
        );
    }

    if (priorityFilter && priorityFilter !== 'all') {
        subjects = subjects.filter(s => s.priority === priorityFilter);
    }

    if (subjects.length === 0) {
        container.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1">
        <div class="empty-state-icon">📚</div>
        <h3>${searchTerm ? 'No matches found' : 'No subjects yet'}</h3>
        <p>${searchTerm ? 'Try a different search term.' : 'Add your first subject using the form above to get started.'}</p>
      </div>`;
        return;
    }

    container.innerHTML = subjects.map(s => {
        const priorityBadgeClass = { high: 'badge-red', medium: 'badge-yellow', low: 'badge-green' }[s.priority] || 'badge-gray';
        const logs = Storage.getStudyLogs().filter(l => l.subjectId === s.id);
        const totalHours = logs.reduce((sum, l) => sum + (l.duration || 0), 0) / 60;

        return `
      <div class="card card-glow" style="position:relative">
        <div class="subject-color-bar" style="background:${escapeHtml(s.color)}"></div>
        <div class="card-header" style="margin-top:4px">
          <div>
            <h3 style="font-size:1rem">${escapeHtml(s.name)}</h3>
            ${s.code ? `<small>${escapeHtml(s.code)}</small>` : ''}
          </div>
          <span class="badge ${priorityBadgeClass}">${escapeHtml(s.priority)}</span>
        </div>
        <div class="card-body">
          <div style="display:flex;gap:1.5rem;margin-bottom:0.75rem">
            <div>
              <small>Target</small>
              <p style="color:var(--text-primary);font-weight:600;font-size:0.92rem">${s.targetHours || 0}h/week</p>
            </div>
            <div>
              <small>Logged</small>
              <p style="color:var(--text-primary);font-weight:600;font-size:0.92rem">${totalHours.toFixed(1)}h</p>
            </div>
          </div>
          <div class="btn-group">
            <button class="btn btn-ghost btn-sm" onclick="editSubject('${s.id}')"><i class="fas fa-pen"></i> Edit</button>
            <button class="btn btn-ghost btn-sm" onclick="deleteSubject('${s.id}')"><i class="fas fa-trash"></i></button>
          </div>
        </div>
      </div>`;
    }).join('');
}

function editSubject(id) {
    const s = Storage.getSubjectById(id);
    if (!s) return;

    editingSubjectId = id;
    document.getElementById('subjectName').value = s.name;
    document.getElementById('subjectCode').value = s.code || '';
    document.getElementById('subjectPriority').value = s.priority;
    document.getElementById('subjectColor').value = s.color;
    document.getElementById('targetHours').value = s.targetHours || '';

    document.querySelector('#subjectForm button[type="submit"]').innerHTML = '<i class="fas fa-save"></i> Update Subject';
    document.getElementById('subjectForm').scrollIntoView({ behavior: 'smooth' });
}

function deleteSubject(id) {
    const s = Storage.getSubjectById(id);
    confirmAction(
        'Delete Subject',
        `Are you sure you want to delete "${s ? s.name : 'this subject'}"? This cannot be undone.`,
        () => {
            Storage.deleteSubject(id);
            showToast('Subject deleted.', 'success');
            renderSubjects();
        }
    );
}
