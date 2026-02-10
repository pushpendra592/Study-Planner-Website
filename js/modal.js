// ==================== MODAL FUNCTIONS ====================

// Open edit modal
function openModal(title, content) {
    var modal = document.getElementById('editModal');
    var modalTitle = document.getElementById('modalTitle');
    var editFormContent = document.getElementById('editFormContent');
    
    modalTitle.textContent = title;
    editFormContent.innerHTML = content;
    modal.classList.remove('hidden');
}

// Close edit modal
function closeModal() {
    var modal = document.getElementById('editModal');
    modal.classList.add('hidden');
}

// Setup modal events
function setupModalEvents() {
    // Close button
    var closeBtn = document.getElementById('closeModal');
    closeBtn.addEventListener('click', closeModal);
    
    // Click outside to close
    var modal = document.getElementById('editModal');
    modal.addEventListener('click', function(e) {
        if (e.target === this) {
            closeModal();
        }
    });
    
    // Edit form submit
    var editForm = document.getElementById('editForm');
    editForm.addEventListener('submit', function(e) {
        e.preventDefault();
        handleEditFormSubmit();
    });
}

// Handle edit form submission
function handleEditFormSubmit() {
    var editType = document.getElementById('editType');
    
    if (editType && editType.value === 'subject') {
        saveEditedSubject();
    }
}