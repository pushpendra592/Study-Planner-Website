// ==================== SUBJECT FUNCTIONS ====================

// Add new subject
function addSubject(name, priority, color, notes) {
    var subjects = loadData('subjects') || [];
    
    var subject = {
        id: generateId(),
        name: name,
        priority: priority,
        color: color,
        notes: notes,
        progress: 0,
        createdAt: new Date().toISOString()
    };
    
    subjects.push(subject);
    saveData('subjects', subjects);
    
    addActivity('Added subject: ' + name);
    showNotification('Subject added successfully!');
    
    displaySubjects();
    updateDashboard();
}

// Delete subject by ID
function deleteSubject(id) {
    var subjects = loadData('subjects') || [];
    var subjectName = '';
    
    for (var i = 0; i < subjects.length; i++) {
        if (subjects[i].id === id) {
            subjectName = subjects[i].name;
            subjects.splice(i, 1);
            break;
        }
    }
    
    saveData('subjects', subjects);
    
    addActivity('Deleted subject: ' + subjectName);
    showNotification('Subject deleted!');
    
    displaySubjects();
    updateDashboard();
}

// Open edit modal for subject
function editSubject(id) {
    var subjects = loadData('subjects') || [];
    var subject = null;
    
    for (var i = 0; i < subjects.length; i++) {
        if (subjects[i].id === id) {
            subject = subjects[i];
            break;
        }
    }
    
    if (!subject) {
        return;
    }
    
    var content = '';
    content += '<input type="hidden" id="editId" value="' + subject.id + '">';
    content += '<input type="hidden" id="editType" value="subject">';
    content += '<div class="form-group">';
    content += '<label>Subject Name</label>';
    content += '<input type="text" id="editName" value="' + subject.name + '" required>';
    content += '</div>';
    content += '<div class="form-row">';
    content += '<div class="form-group">';
    content += '<label>Priority</label>';
    content += '<select id="editPriority">';
    content += '<option value="high"' + (subject.priority === 'high' ? ' selected' : '') + '>High</option>';
    content += '<option value="medium"' + (subject.priority === 'medium' ? ' selected' : '') + '>Medium</option>';
    content += '<option value="low"' + (subject.priority === 'low' ? ' selected' : '') + '>Low</option>';
    content += '</select>';
    content += '</div>';
    content += '<div class="form-group">';
    content += '<label>Color</label>';
    content += '<input type="color" id="editColor" value="' + subject.color + '">';
    content += '</div>';
    content += '</div>';
    content += '<div class="form-group">';
    content += '<label>Notes</label>';
    content += '<textarea id="editNotes" rows="2">' + (subject.notes || '') + '</textarea>';
    content += '</div>';
    
    openModal('Edit Subject', content);
}

// Save edited subject
function saveEditedSubject() {
    var id = parseInt(document.getElementById('editId').value);
    var name = document.getElementById('editName').value.trim();
    var priority = document.getElementById('editPriority').value;
    var color = document.getElementById('editColor').value;
    var notes = document.getElementById('editNotes').value.trim();
    
    var subjects = loadData('subjects') || [];
    
    for (var i = 0; i < subjects.length; i++) {
        if (subjects[i].id === id) {
            subjects[i].name = name;
            subjects[i].priority = priority;
            subjects[i].color = color;
            subjects[i].notes = notes;
            break;
        }
    }
    
    saveData('subjects', subjects);
    
    addActivity('Updated subject: ' + name);
    showNotification('Subject updated!');
    
    displaySubjects();
    closeModal();
}

// Display all subjects in grid
function displaySubjects() {
    var subjects = loadData('subjects') || [];
    var container = document.getElementById('subjectsList');
    
    if (subjects.length === 0) {
        container.innerHTML = '<p class="empty-msg">No subjects added yet</p>';
        return;
    }
    
    var html = '';
    
    for (var i = 0; i < subjects.length; i++) {
        var s = subjects[i];
        
        html += '<div class="subject-card" style="border-left-color: ' + s.color + '">';
        html += '<h4>' + s.name + ' ';
        html += '<span class="priority-badge priority-' + s.priority + '">' + s.priority + '</span>';
        html += '</h4>';
        html += '<p>' + (s.notes || 'No notes') + '</p>';
        html += '<div class="subject-actions">';
        html += '<button class="btn small" onclick="editSubject(' + s.id + ')">Edit</button>';
        html += '<button class="btn small danger" onclick="deleteSubject(' + s.id + ')">Delete</button>';
        html += '</div>';
        html += '</div>';
    }
    
    container.innerHTML = html;
}

// Get subject name by ID
function getSubjectName(subjectId) {
    var subjects = loadData('subjects') || [];
    
    for (var i = 0; i < subjects.length; i++) {
        if (subjects[i].id === parseInt(subjectId)) {
            return subjects[i].name;
        }
    }
    
    return '';
}

// Update subject dropdowns in forms
function updateSubjectDropdowns() {
    var subjects = loadData('subjects') || [];
    var dropdownIds = ['scheduleSubject', 'taskSubject'];
    
    for (var d = 0; d < dropdownIds.length; d++) {
        var dropdown = document.getElementById(dropdownIds[d]);
        
        if (dropdown) {
            dropdown.innerHTML = '<option value="">Select Subject</option>';
            
            for (var i = 0; i < subjects.length; i++) {
                var option = document.createElement('option');
                option.value = subjects[i].id;
                option.textContent = subjects[i].name;
                dropdown.appendChild(option);
            }
        }
    }
}

// Setup subject form
function setupSubjectForm() {
    var form = document.getElementById('subjectForm');
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        var name = document.getElementById('subjectName').value.trim();
        var priority = document.getElementById('subjectPriority').value;
        var color = document.getElementById('subjectColor').value;
        var notes = document.getElementById('subjectNotes').value.trim();
        
        if (name) {
            addSubject(name, priority, color, notes);
            this.reset();
            document.getElementById('subjectColor').value = '#8b5cf6';
        }
    });
}