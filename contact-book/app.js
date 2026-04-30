/**
 * Contact Book Application
 * Features: CRUD operations, multiple views, search, filter, export/import
 */

class ContactBook {
    constructor() {
        // DOM Elements
        this.addContactBtn = document.getElementById('addContactBtn');
        this.emptyAddBtn = document.getElementById('emptyAddBtn');
        this.contactForm = document.getElementById('contactForm');
        this.contactModal = document.getElementById('contactModal');
        this.detailModal = document.getElementById('detailModal');
        this.contactList = document.getElementById('contactList');
        this.contactGrid = document.getElementById('contactGrid');
        this.contactTableBody = document.getElementById('contactTableBody');
        this.searchInput = document.getElementById('searchInput');
        this.clearSearchBtn = document.getElementById('clearSearchBtn');
        this.filterCheckboxes = document.querySelectorAll('.filter-checkbox');
        this.viewBtns = document.querySelectorAll('.view-btn');
        this.views = document.querySelectorAll('.view');
        this.emptyState = document.getElementById('emptyState');
        this.exportBtn = document.getElementById('exportBtn');
        this.importBtn = document.getElementById('importBtn');
        this.importFile = document.getElementById('importFile');
        this.toast = document.getElementById('toast');

        // Form Elements
        this.firstNameInput = document.getElementById('firstName');
        this.lastNameInput = document.getElementById('lastName');
        this.emailInput = document.getElementById('email');
        this.phoneInput = document.getElementById('phone');
        this.birthDateInput = document.getElementById('birthDate');
        this.companyInput = document.getElementById('company');
        this.jobTitleInput = document.getElementById('jobTitle');
        this.addressInput = document.getElementById('address');
        this.websiteInput = document.getElementById('website');
        this.notesInput = document.getElementById('notes');
        this.categorySelect = document.getElementById('category');
        this.isFavoriteCheckbox = document.getElementById('isFavorite');
        this.cancelBtn = document.getElementById('cancelBtn');
        this.deleteBtn = document.getElementById('deleteBtn');
        this.modalTitle = document.getElementById('modalTitle');

        // Detail Modal Elements
        this.detailEditBtn = document.getElementById('detailEditBtn');
        this.detailDeleteBtn = document.getElementById('detailDeleteBtn');
        this.detailCloseBtn = document.getElementById('detailCloseBtn');

        // State
        this.contacts = [];
        this.filteredContacts = [];
        this.currentView = 'list';
        this.editingId = null;
        this.selectedContactId = null;
        this.selectedFilters = new Set(['all']);

        // Storage Key
        this.storageKey = 'contactsData';

        // Initialize
        this.init();
    }

    /**
     * Initialize the application
     */
    init() {
        this.loadFromStorage();
        this.attachEventListeners();
        this.render();
    }

    /**
     * Attach event listeners
     */
    attachEventListeners() {
        // Add Contact Button
        this.addContactBtn.addEventListener('click', () => this.openAddModal());
        this.emptyAddBtn.addEventListener('click', () => this.openAddModal());

        // Form Events
        this.contactForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
        this.cancelBtn.addEventListener('click', () => this.closeModal());
        this.deleteBtn.addEventListener('click', () => this.handleDeleteContact());

        // Modal Close
        document.querySelectorAll('.modal-close-btn').forEach(btn => {
            btn.addEventListener('click', () => this.closeAllModals());
        });

        // Search
        this.searchInput.addEventListener('input', (e) => {
            this.handleSearch(e.target.value);
            this.updateClearSearchBtn();
        });
        this.clearSearchBtn.addEventListener('click', () => {
            this.searchInput.value = '';
            this.handleSearch('');
            this.updateClearSearchBtn();
        });

        // Filter
        this.filterCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => this.handleFilter());
        });

        // View Toggle
        this.viewBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.switchView(e.target.closest('.view-btn').dataset.view));
        });

        // Export/Import
        this.exportBtn.addEventListener('click', () => this.exportContacts());
        this.importBtn.addEventListener('click', () => this.importFile.click());
        this.importFile.addEventListener('change', (e) => this.handleImport(e));

        // Detail Modal
        this.detailEditBtn.addEventListener('click', () => this.editContactFromDetail());
        this.detailDeleteBtn.addEventListener('click', () => this.deleteContactFromDetail());
        this.detailCloseBtn.addEventListener('click', () => this.detailModal.classList.add('hidden'));
    }

    /**
     * Open Add Contact Modal
     */
    openAddModal() {
        this.editingId = null;
        this.resetForm();
        this.modalTitle.textContent = 'Add Contact';
        this.deleteBtn.classList.add('hidden');
        this.contactModal.classList.remove('hidden');
        this.firstNameInput.focus();
    }

    /**
     * Open Edit Modal
     */
    openEditModal(id) {
        const contact = this.contacts.find(c => c.id === id);
        if (!contact) return;

        this.editingId = id;
        this.populateForm(contact);
        this.modalTitle.textContent = 'Edit Contact';
        this.deleteBtn.classList.remove('hidden');
        this.contactModal.classList.remove('hidden');
    }

    /**
     * Close Modal
     */
    closeModal() {
        this.contactModal.classList.add('hidden');
        this.editingId = null;
        this.resetForm();
    }

    /**
     * Close All Modals
     */
    closeAllModals() {
        this.contactModal.classList.add('hidden');
        this.detailModal.classList.add('hidden');
        this.editingId = null;
        this.resetForm();
    }

    /**
     * Reset Form
     */
    resetForm() {
        this.contactForm.reset();
        this.clearFormErrors();
        this.isFavoriteCheckbox.checked = false;
    }

    /**
     * Populate Form with Contact Data
     */
    populateForm(contact) {
        this.firstNameInput.value = contact.firstName;
        this.lastNameInput.value = contact.lastName;
        this.emailInput.value = contact.email || '';
        this.phoneInput.value = contact.phone || '';
        this.birthDateInput.value = contact.birthDate || '';
        this.companyInput.value = contact.company || '';
        this.jobTitleInput.value = contact.jobTitle || '';
        this.addressInput.value = contact.address || '';
        this.websiteInput.value = contact.website || '';
        this.notesInput.value = contact.notes || '';
        this.categorySelect.value = contact.category;
        this.isFavoriteCheckbox.checked = contact.isFavorite;
    }

    /**
     * Handle Form Submit
     */
    handleFormSubmit(e) {
        e.preventDefault();

        if (!this.validateForm()) return;

        const formData = {
            firstName: this.firstNameInput.value.trim(),
            lastName: this.lastNameInput.value.trim(),
            email: this.emailInput.value.trim(),
            phone: this.phoneInput.value.trim(),
            birthDate: this.birthDateInput.value,
            company: this.companyInput.value.trim(),
            jobTitle: this.jobTitleInput.value.trim(),
            address: this.addressInput.value.trim(),
            website: this.websiteInput.value.trim(),
            notes: this.notesInput.value.trim(),
            category: this.categorySelect.value,
            isFavorite: this.isFavoriteCheckbox.checked
        };

        if (this.editingId) {
            this.updateContact(this.editingId, formData);
        } else {
            this.addContact(formData);
        }

        this.closeModal();
    }

    /**
     * Validate Form
     */
    validateForm() {
        this.clearFormErrors();
        let isValid = true;

        // First Name
        if (!this.firstNameInput.value.trim()) {
            this.showFieldError('firstName', 'First name is required');
            isValid = false;
        }

        // Last Name
        if (!this.lastNameInput.value.trim()) {
            this.showFieldError('lastName', 'Last name is required');
            isValid = false;
        }

        // Email
        if (this.emailInput.value && !this.isValidEmail(this.emailInput.value)) {
            this.showFieldError('email', 'Invalid email address');
            isValid = false;
        }

        // Phone
        if (this.phoneInput.value && !this.isValidPhone(this.phoneInput.value)) {
            this.showFieldError('phone', 'Invalid phone number');
            isValid = false;
        }

        // Category
        if (!this.categorySelect.value) {
            this.showFieldError('category', 'Please select a category');
            isValid = false;
        }

        // Website
        if (this.websiteInput.value && !this.isValidUrl(this.websiteInput.value)) {
            this.showFieldError('website', 'Invalid website URL');
            isValid = false;
        }

        return isValid;
    }

    /**
     * Show Field Error
     */
    showFieldError(fieldName, message) {
        const field = document.getElementById(fieldName);
        const errorElement = document.getElementById(`${fieldName}Error`);
        
        field.closest('.form-group').classList.add('error');
        errorElement.textContent = message;
        errorElement.classList.add('show');
    }

    /**
     * Clear Form Errors
     */
    clearFormErrors() {
        document.querySelectorAll('.form-group').forEach(group => {
            group.classList.remove('error');
        });
        document.querySelectorAll('.error-message').forEach(elem => {
            elem.classList.remove('show');
        });
    }

    /**
     * Add Contact
     */
    addContact(data) {
        const contact = {
            id: Date.now(),
            ...data,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        this.contacts.unshift(contact);
        this.saveToStorage();
        this.render();
        this.showToast('Contact added successfully!', 'success');
    }

    /**
     * Update Contact
     */
    updateContact(id, data) {
        const contact = this.contacts.find(c => c.id === id);
        if (contact) {
            Object.assign(contact, data, { updatedAt: new Date().toISOString() });
            this.saveToStorage();
            this.render();
            this.showToast('Contact updated successfully!', 'success');
        }
    }

    /**
     * Delete Contact
     */
    deleteContact(id) {
        if (confirm('Are you sure you want to delete this contact?')) {
            this.contacts = this.contacts.filter(c => c.id !== id);
            this.saveToStorage();
            this.render();
            this.closeAllModals();
            this.showToast('Contact deleted successfully!', 'success');
        }
    }

    /**
     * Handle Delete Contact from Modal
     */
    handleDeleteContact() {
        this.deleteContact(this.editingId);
    }

    /**
     * Handle Delete from Detail View
     */
    deleteContactFromDetail() {
        this.deleteContact(this.selectedContactId);
    }

    /**
     * Edit Contact from Detail
     */
    editContactFromDetail() {
        this.detailModal.classList.add('hidden');
        this.openEditModal(this.selectedContactId);
    }

    /**
     * Handle Search
     */
    handleSearch(query) {
        this.filteredContacts = this.getFilteredAndSearchedContacts(query);
        this.render();
    }

    /**
     * Update Clear Search Button
     */
    updateClearSearchBtn() {
        if (this.searchInput.value.trim()) {
            this.clearSearchBtn.classList.remove('hidden');
        } else {
            this.clearSearchBtn.classList.add('hidden');
        }
    }

    /**
     * Handle Filter
     */
    handleFilter() {
        const checkedFilters = Array.from(this.filterCheckboxes)
            .filter(cb => cb.checked)
            .map(cb => cb.value);

        this.selectedFilters = new Set(checkedFilters);
        this.filteredContacts = this.getFilteredAndSearchedContacts(this.searchInput.value);
        this.render();
    }

    /**
     * Get Filtered and Searched Contacts
     */
    getFilteredAndSearchedContacts(searchQuery = '') {
        let result = this.contacts;

        // Filter
        if (this.selectedFilters.size > 0 && !this.selectedFilters.has('all')) {
            result = result.filter(contact => {
                if (this.selectedFilters.has('favorite') && contact.isFavorite) return true;
                if (this.selectedFilters.has(contact.category)) return true;
                return false;
            });
        }

        // Search
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(contact => {
                const fullName = `${contact.firstName} ${contact.lastName}`.toLowerCase();
                const email = contact.email.toLowerCase();
                const phone = contact.phone.toLowerCase();
                const company = contact.company.toLowerCase();

                return fullName.includes(query) || 
                       email.includes(query) || 
                       phone.includes(query) ||
                       company.includes(query);
            });
        }

        return result;
    }

    /**
     * Switch View
     */
    switchView(viewName) {
        this.currentView = viewName;
        this.viewBtns.forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-view="${viewName}"]`).classList.add('active');
        this.render();
    }

    /**
     * Render Contacts
     */
    render() {
        const contacts = this.filteredContacts.length > 0 ? this.filteredContacts : this.contacts;

        // Show/Hide empty state
        if (contacts.length === 0) {
            this.emptyState.classList.remove('hidden');
            this.views.forEach(v => v.classList.remove('active'));
            document.getElementById(`${this.currentView}View`).classList.add('active');
        } else {
            this.emptyState.classList.add('hidden');
            this.views.forEach(v => v.classList.remove('active'));
            document.getElementById(`${this.currentView}View`).classList.add('active');
        }

        // Render based on current view
        switch (this.currentView) {
            case 'list':
                this.renderListView(contacts);
                break;
            case 'grid':
                this.renderGridView(contacts);
                break;
            case 'table':
                this.renderTableView(contacts);
                break;
        }

        this.updateStatistics();
    }

    /**
     * Render List View
     */
    renderListView(contacts) {
        this.contactList.innerHTML = '';
        contacts.forEach(contact => {
            const li = this.createListItem(contact);
            this.contactList.appendChild(li);
        });
    }

    /**
     * Create List Item
     */
    createListItem(contact) {
        const li = document.createElement('li');
        li.className = 'contact-item';
        li.dataset.id = contact.id;

        const initials = this.getInitials(contact.firstName, contact.lastName);

        li.innerHTML = `
            <div class="contact-avatar">${initials}</div>
            <div class="contact-info">
                <div class="contact-name">${this.escapeHtml(contact.firstName)} ${this.escapeHtml(contact.lastName)}</div>
                <div class="contact-details">
                    ${contact.email ? `<div class="contact-detail"><i class="fas fa-envelope"></i> ${this.escapeHtml(contact.email)}</div>` : ''}
                    ${contact.phone ? `<div class="contact-detail"><i class="fas fa-phone"></i> ${this.escapeHtml(contact.phone)}</div>` : ''}
                    ${contact.company ? `<div class="contact-detail"><i class="fas fa-building"></i> ${this.escapeHtml(contact.company)}</div>` : ''}
                </div>
                <span class="contact-category">${this.capitalize(contact.category)}</span>
            </div>
            <div class="contact-actions">
                <button class="action-btn favorite ${contact.isFavorite ? 'active' : ''}" title="Toggle Favorite">
                    <i class="fas fa-star"></i>
                </button>
                <button class="action-btn edit" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn delete" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;

        // Attach event listeners
        li.addEventListener('click', (e) => {
            if (!e.target.closest('.contact-actions')) {
                this.showContactDetail(contact.id);
            }
        });

        li.querySelector('.favorite').addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleFavorite(contact.id);
        });

        li.querySelector('.edit').addEventListener('click', (e) => {
            e.stopPropagation();
            this.openEditModal(contact.id);
        });

        li.querySelector('.delete').addEventListener('click', (e) => {
            e.stopPropagation();
            this.deleteContact(contact.id);
        });

        return li;
    }

    /**
     * Render Grid View
     */
    renderGridView(contacts) {
        this.contactGrid.innerHTML = '';
        contacts.forEach(contact => {
            const card = this.createGridCard(contact);
            this.contactGrid.appendChild(card);
        });
    }

    /**
     * Create Grid Card
     */
    createGridCard(contact) {
        const div = document.createElement('div');
        div.className = 'contact-card';
        div.dataset.id = contact.id;

        const initials = this.getInitials(contact.firstName, contact.lastName);

        div.innerHTML = `
            <div class="contact-avatar">${initials}</div>
            <div class="contact-name">${this.escapeHtml(contact.firstName)} ${this.escapeHtml(contact.lastName)}</div>
            ${contact.email ? `<div class="contact-details"><div class="contact-detail"><i class="fas fa-envelope"></i> ${this.escapeHtml(contact.email)}</div></div>` : ''}
            ${contact.phone ? `<div class="contact-details"><div class="contact-detail"><i class="fas fa-phone"></i> ${this.escapeHtml(contact.phone)}</div></div>` : ''}
            <span class="contact-category">${this.capitalize(contact.category)}</span>
            <div class="contact-actions">
                <button class="action-btn favorite ${contact.isFavorite ? 'active' : ''}" title="Toggle Favorite">
                    <i class="fas fa-star"></i>
                </button>
                <button class="action-btn edit" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn delete" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;

        // Attach event listeners
        div.addEventListener('click', (e) => {
            if (!e.target.closest('.contact-actions')) {
                this.showContactDetail(contact.id);
            }
        });

        div.querySelector('.favorite').addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleFavorite(contact.id);
        });

        div.querySelector('.edit').addEventListener('click', (e) => {
            e.stopPropagation();
            this.openEditModal(contact.id);
        });

        div.querySelector('.delete').addEventListener('click', (e) => {
            e.stopPropagation();
            this.deleteContact(contact.id);
        });

        return div;
    }

    /**
     * Render Table View
     */
    renderTableView(contacts) {
        this.contactTableBody.innerHTML = '';
        contacts.forEach(contact => {
            const tr = this.createTableRow(contact);
            this.contactTableBody.appendChild(tr);
        });
    }

    /**
     * Create Table Row
     */
    createTableRow(contact) {
        const tr = document.createElement('tr');
        tr.dataset.id = contact.id;

        tr.innerHTML = `
            <td>${this.escapeHtml(contact.firstName)} ${this.escapeHtml(contact.lastName)}</td>
            <td>${this.escapeHtml(contact.email || '-')}</td>
            <td>${this.escapeHtml(contact.phone || '-')}</td>
            <td><span class="contact-category">${this.capitalize(contact.category)}</span></td>
            <td>
                <div class="contact-actions">
                    <button class="action-btn favorite ${contact.isFavorite ? 'active' : ''}" title="Toggle Favorite">
                        <i class="fas fa-star"></i>
                    </button>
                    <button class="action-btn edit" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;

        // Attach event listeners
        tr.addEventListener('click', (e) => {
            if (!e.target.closest('.contact-actions')) {
                this.showContactDetail(contact.id);
            }
        });

        tr.querySelector('.favorite').addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleFavorite(contact.id);
        });

        tr.querySelector('.edit').addEventListener('click', (e) => {
            e.stopPropagation();
            this.openEditModal(contact.id);
        });

        tr.querySelector('.delete').addEventListener('click', (e) => {
            e.stopPropagation();
            this.deleteContact(contact.id);
        });

        return tr;
    }

    /**
     * Show Contact Detail
     */
    showContactDetail(id) {
        const contact = this.contacts.find(c => c.id === id);
        if (!contact) return;

        this.selectedContactId = id;

        document.getElementById('detailName').textContent = `${contact.firstName} ${contact.lastName}`;
        document.getElementById('detailEmail').textContent = contact.email || '-';
        document.getElementById('detailPhone').textContent = contact.phone || '-';
        document.getElementById('detailWebsite').innerHTML = contact.website ? 
            `<a href="${this.escapeHtml(contact.website)}" target="_blank">${this.escapeHtml(contact.website)}</a>` : '-';
        document.getElementById('detailCompany').textContent = contact.company || '-';
        document.getElementById('detailJobTitle').textContent = contact.jobTitle || '-';
        document.getElementById('detailAddress').textContent = contact.address || '-';
        document.getElementById('detailBirthDate').textContent = contact.birthDate ? 
            this.formatDate(contact.birthDate) : '-';
        document.getElementById('detailNotes').textContent = contact.notes || '-';

        this.detailModal.classList.remove('hidden');
    }

    /**
     * Toggle Favorite
     */
    toggleFavorite(id) {
        const contact = this.contacts.find(c => c.id === id);
        if (contact) {
            contact.isFavorite = !contact.isFavorite;
            this.saveToStorage();
            this.render();
        }
    }

    /**
     * Update Statistics
     */
    updateStatistics() {
        const total = this.contacts.length;
        const favorites = this.contacts.filter(c => c.isFavorite).length;
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const birthdays = this.contacts.filter(c => {
            if (!c.birthDate) return false;
            const birthDate = new Date(c.birthDate);
            return birthDate.getMonth() === currentMonth;
        }).length;

        document.getElementById('totalContacts').textContent = total;
        document.getElementById('favoriteCount').textContent = favorites;
        document.getElementById('birthdayCount').textContent = birthdays;
    }

    /**
     * Export Contacts
     */
    exportContacts() {
        if (this.contacts.length === 0) {
            this.showToast('No contacts to export', 'warning');
            return;
        }

        const dataStr = JSON.stringify(this.contacts, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `contacts-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);

        this.showToast(`Exported ${this.contacts.length} contact(s)!`, 'success');
    }

    /**
     * Handle Import
     */
    handleImport(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const imported = JSON.parse(e.target.result);

                if (!Array.isArray(imported)) {
                    throw new Error('Invalid file format');
                }

                if (confirm(`Import ${imported.length} contact(s)? Existing contacts will be kept.`)) {
                    this.contacts = [...this.contacts, ...imported];
                    this.saveToStorage();
                    this.render();
                    this.showToast(`Imported ${imported.length} contact(s)!`, 'success');
                }
            } catch (error) {
                this.showToast('Failed to import contacts', 'error');
                console.error('Import Error:', error);
            }
        };
        reader.readAsText(file);

        this.importFile.value = '';
    }

    /**
     * Save to Local Storage
     */
    saveToStorage() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.contacts));
        } catch (error) {
            this.showToast('Failed to save contacts', 'error');
            console.error('Storage Error:', error);
        }
    }

    /**
     * Load from Local Storage
     */
    loadFromStorage() {
        try {
            const data = localStorage.getItem(this.storageKey);
            this.contacts = data ? JSON.parse(data) : [];
            this.filteredContacts = [...this.contacts];
        } catch (error) {
            this.showToast('Failed to load contacts', 'error');
            console.error('Storage Error:', error);
            this.contacts = [];
            this.filteredContacts = [];
        }
    }

    /**
     * Validation Methods
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    isValidPhone(phone) {
        const phoneRegex = /^[\d\s\-\+\(\)]{7,}$/;
        return phoneRegex.test(phone);
    }

    isValidUrl(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Utility Methods
     */
    getInitials(firstName, lastName) {
        return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }

    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    /**
     * Show Toast Notification
     */
    showToast(message, type = 'info') {
        this.toast.textContent = message;
        this.toast.className = `toast show ${type}`;

        setTimeout(() => {
            this.toast.classList.remove('show');
        }, 3000);
    }
}

/**
 * Initialize app when DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
    new ContactBook();
});