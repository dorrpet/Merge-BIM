// Merge-BIM Application - Project & Scope Package Management
console.log("Merge-BIM app initialized - ISO 19650 & IFC Schema Compliant");

// Current page state
let currentPage = 'projects';
let currentProjectId = null;

// Project data store (in-memory for now, can be replaced with API calls)
let projects = JSON.parse(localStorage.getItem('mergeBimProjects')) || [];

// DOM Elements - Projects Page
const projectsContainer = document.getElementById('projectsContainer');
const addProjectBtn = document.getElementById('addProjectBtn');
const addProjectModal = document.getElementById('addProjectModal');
const projectForm = document.getElementById('projectForm');
const closeModal = document.getElementById('closeModal');
const cancelModal = document.getElementById('cancelModal');

// DOM Elements - Project Page
const backBtn = document.getElementById('backBtn');
const projectNameEl = document.getElementById('projectName');
const projectCodeEl = document.getElementById('projectCode');
const projectIfcEl = document.getElementById('projectIfc');
const projectIsoEl = document.getElementById('projectIso');
const projectDescriptionEl = document.getElementById('projectDescription');
const editProjectBtn = document.getElementById('editProjectBtn');
const scopePackagesContainer = document.getElementById('scopePackagesContainer');
const addScopePackageBtn = document.getElementById('addScopePackageBtn');
const addScopePackageModal = document.getElementById('addScopePackageModal');
const scopePackageForm = document.getElementById('scopePackageForm');
const closeScopeModal = document.getElementById('closeScopeModal');
const cancelScopeModal = document.getElementById('cancelScopeModal');
const viewScopePackageModal = document.getElementById('viewScopePackageModal');
const closeViewScopeModal = document.getElementById('closeViewScopeModal');
const viewScopeContent = document.getElementById('viewScopeContent');

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded and parsed");
    
    // Determine which page we're on
    if (document.body.contains(projectNameEl)) {
        currentPage = 'project';
        const urlParams = new URLSearchParams(window.location.search);
        currentProjectId = urlParams.get('projectId');
        if (currentProjectId) {
            loadProject(currentProjectId);
        }
    } else {
        currentPage = 'projects';
        renderProjects();
    }
    
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    // Projects page listeners
    if (addProjectBtn) {
        addProjectBtn.addEventListener('click', () => {
            addProjectModal.classList.add('active');
        });
    }

    if (closeModal) {
        closeModal.addEventListener('click', () => {
            addProjectModal.classList.remove('active');
            resetForm();
        });
    }

    if (cancelModal) {
        cancelModal.addEventListener('click', () => {
            addProjectModal.classList.remove('active');
            resetForm();
        });
    }

    // Project page listeners
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }

    if (editProjectBtn) {
        editProjectBtn.addEventListener('click', () => {
            if (currentProjectId) {
                editProject(currentProjectId);
            }
        });
    }

    if (addScopePackageBtn) {
        addScopePackageBtn.addEventListener('click', () => {
            addScopePackageModal.classList.add('active');
        });
    }

    if (closeScopeModal) {
        closeScopeModal.addEventListener('click', () => {
            addScopePackageModal.classList.remove('active');
            resetScopeForm();
        });
    }

    if (cancelScopeModal) {
        cancelScopeModal.addEventListener('click', () => {
            addScopePackageModal.classList.remove('active');
            resetScopeForm();
        });
    }

    if (closeViewScopeModal) {
        closeViewScopeModal.addEventListener('click', () => {
            viewScopePackageModal.classList.remove('active');
        });
    }

    // Close modals when clicking outside
    if (addProjectModal) {
        addProjectModal.addEventListener('click', (e) => {
            if (e.target === addProjectModal) {
                addProjectModal.classList.remove('active');
                resetForm();
            }
        });
    }

    if (addScopePackageModal) {
        addScopePackageModal.addEventListener('click', (e) => {
            if (e.target === addScopePackageModal) {
                addScopePackageModal.classList.remove('active');
                resetScopeForm();
            }
        });
    }

    if (viewScopePackageModal) {
        viewScopePackageModal.addEventListener('click', (e) => {
            if (e.target === viewScopePackageModal) {
                viewScopePackageModal.classList.remove('active');
            }
        });
    }

    // Form submissions
    if (projectForm) {
        projectForm.addEventListener('submit', (e) => {
            e.preventDefault();
            createProject();
        });
    }

    if (scopePackageForm) {
        scopePackageForm.addEventListener('submit', (e) => {
            e.preventDefault();
            createScopePackage();
        });
    }
}

// Navigation functions
function navigateToProject(projectId) {
    window.location.href = `project.html?projectId=${projectId}`;
}

// Load project details
function loadProject(projectId) {
    const project = projects.find(p => p.id === projectId);
    if (project) {
        // Update project header
        projectNameEl.textContent = project.name;
        projectCodeEl.textContent = project.code || 'N/A';
        projectIfcEl.textContent = project.ifcVersion;
        projectIsoEl.textContent = project.isoStandard;
        projectDescriptionEl.textContent = project.description || 'No description provided';
        
        // Load scope packages
        renderScopePackages(projectId);
        
        console.log('Project loaded:', project);
    } else {
        console.error('Project not found:', projectId);
        alert('Project not found');
        window.location.href = 'index.html';
    }
}

// Render projects to the UI
function renderProjects() {
    if (projects.length === 0) {
        projectsContainer.innerHTML = `
            <div class="empty-state">
                <p>No projects yet. Click the "Add Project" button to create your first BIM project.</p>
            </div>
        `;
        return;
    }

    projectsContainer.innerHTML = projects.map(project => `
        <div class="project-card" data-id="${project.id}">
            <div class="project-header">
                <div>
                    <div class="project-name">${escapeHtml(project.name)}</div>
                    <div class="project-code">${escapeHtml(project.code || 'N/A')}</div>
                </div>
                <div class="project-badges">
                    <span class="badge badge-ifc">${escapeHtml(project.ifcVersion)}</span>
                    <span class="badge badge-iso">${escapeHtml(project.isoStandard)}</span>
                </div>
            </div>
            <div class="project-description">
                ${escapeHtml(project.description || 'No description provided')}
            </div>
            <div class="project-meta">
                <span>Created: ${formatDate(project.createdAt)}</span>
                <div class="project-actions">
                    <button class="btn btn-secondary" onclick="navigateToProject('${project.id}')">View</button>
                    <button class="btn btn-secondary" onclick="editProject('${project.id}')">Edit</button>
                </div>
            </div>
        </div>
    `).join('');
}

// Render scope packages for a project
function renderScopePackages(projectId) {
    const project = projects.find(p => p.id === projectId);
    if (!project || !project.scopePackages || project.scopePackages.length === 0) {
        scopePackagesContainer.innerHTML = `
            <div class="empty-state">
                <p>No scope packages yet. Click the "Add Scope Package" button to create your first package.</p>
            </div>
        `;
        return;
    }

    scopePackagesContainer.innerHTML = project.scopePackages.map(scopePackage => `
        <div class="scope-package-card" data-id="${scopePackage.id}">
            <div class="scope-package-header">
                <div>
                    <div class="scope-package-name">${escapeHtml(scopePackage.name)}</div>
                    <div class="scope-package-code">${escapeHtml(scopePackage.code)}</div>
                </div>
                <div class="scope-package-badges">
                    <span class="badge badge-type">${escapeHtml(scopePackage.type)}</span>
                    <span class="badge badge-status">${escapeHtml(scopePackage.status)}</span>
                </div>
            </div>
            <div class="scope-package-description">
                ${escapeHtml(scopePackage.description || 'No description provided')}
            </div>
            ${scopePackage.ifcEntities && scopePackage.ifcEntities.length > 0 ? `
                <div class="scope-package-entities">
                    <div class="scope-package-entities-title">IFC Entities:</div>
                    <div class="scope-package-entities-list">
                        ${scopePackage.ifcEntities.map(entity => `<span class="entity-tag">${escapeHtml(entity)}</span>`).join('')}
                    </div>
                </div>
            ` : ''}
            <div class="scope-package-meta">
                <span>Created: ${formatDate(scopePackage.createdAt)}</span>
                <div class="scope-package-actions">
                    <button class="btn btn-secondary" onclick="viewScopePackage('${projectId}', '${scopePackage.id}')">View</button>
                    <button class="btn btn-secondary" onclick="editScopePackage('${projectId}', '${scopePackage.id}')">Edit</button>
                </div>
            </div>
        </div>
    `).join('');
}

// Create a new project
function createProject() {
    const name = document.getElementById('projectName').value.trim();
    const code = document.getElementById('projectCode').value.trim();
    const description = document.getElementById('projectDescription').value.trim();
    const ifcVersion = document.getElementById('ifcVersion').value;
    const isoStandard = document.getElementById('isoStandard').value;

    if (!name) {
        alert('Project name is required');
        return;
    }

    const newProject = {
        id: generateId(),
        name,
        code,
        description,
        ifcVersion,
        isoStandard,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        scopePackages: []
    };

    projects.push(newProject);
    saveProjects();
    renderProjects();
    
    // Close modal and reset form
    addProjectModal.classList.remove('active');
    resetForm();

    console.log('Project created:', newProject);
}

// Create a new scope package
function createScopePackage() {
    if (!currentProjectId) return;

    const name = document.getElementById('scopeName').value.trim();
    const code = document.getElementById('scopeCode').value.trim();
    const description = document.getElementById('scopeDescription').value.trim();
    const type = document.getElementById('scopeType').value;
    const status = document.getElementById('scopeStatus').value;
    const requirements = document.getElementById('scopeRequirements').value.trim();

    // Get selected IFC entities
    const ifcEntities = [];
    const checkboxes = document.querySelectorAll('input[name="ifcEntity"]:checked');
    checkboxes.forEach(checkbox => {
        ifcEntities.push(checkbox.value);
    });

    if (!name || !code) {
        alert('Package name and code are required');
        return;
    }

    const newScopePackage = {
        id: generateId(),
        name,
        code,
        description,
        type,
        status,
        ifcEntities,
        requirements,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    // Find the project and add the scope package
    const project = projects.find(p => p.id === currentProjectId);
    if (project) {
        if (!project.scopePackages) {
            project.scopePackages = [];
        }
        project.scopePackages.push(newScopePackage);
        project.updatedAt = new Date().toISOString();
        saveProjects();
        renderScopePackages(currentProjectId);
        
        // Close modal and reset form
        addScopePackageModal.classList.remove('active');
        resetScopeForm();
        
        console.log('Scope package created:', newScopePackage);
    }
}

// View project details
function viewProject(projectId) {
    navigateToProject(projectId);
}

// View scope package details
function viewScopePackage(projectId, scopePackageId) {
    const project = projects.find(p => p.id === projectId);
    if (project) {
        const scopePackage = project.scopePackages.find(sp => sp.id === scopePackageId);
        if (scopePackage) {
            viewScopeContent.innerHTML = `
                <div class="scope-details-row">
                    <div class="scope-details-label">Package Name</div>
                    <div class="scope-details-value">${escapeHtml(scopePackage.name)}</div>
                </div>
                <div class="scope-details-row">
                    <div class="scope-details-label">Package Code</div>
                    <div class="scope-details-value">${escapeHtml(scopePackage.code)}</div>
                </div>
                <div class="scope-details-row">
                    <div class="scope-details-label">Description</div>
                    <div class="scope-details-value">${escapeHtml(scopePackage.description || 'N/A')}</div>
                </div>
                <div class="scope-details-row">
                    <div class="scope-details-label">Type</div>
                    <div class="scope-details-value"><span class="badge badge-type">${escapeHtml(scopePackage.type)}</span></div>
                </div>
                <div class="scope-details-row">
                    <div class="scope-details-label">Status</div>
                    <div class="scope-details-value"><span class="badge badge-status">${escapeHtml(scopePackage.status)}</span></div>
                </div>
                ${scopePackage.ifcEntities && scopePackage.ifcEntities.length > 0 ? `
                    <div class="scope-details-row">
                        <div class="scope-details-label">IFC Entities</div>
                        <div class="scope-details-value">
                            <div class="scope-package-entities-list">
                                ${scopePackage.ifcEntities.map(entity => `<span class="entity-tag">${escapeHtml(entity)}</span>`).join('')}
                            </div>
                        </div>
                    </div>
                ` : ''}
                <div class="scope-details-row">
                    <div class="scope-details-label">Information Requirements</div>
                    <div class="scope-details-value">${escapeHtml(scopePackage.requirements || 'N/A')}</div>
                </div>
                <div class="scope-details-row">
                    <div class="scope-details-label">Created</div>
                    <div class="scope-details-value">${formatDate(scopePackage.createdAt)}</div>
                </div>
            `;
            viewScopePackageModal.classList.add('active');
            console.log('Viewing scope package:', scopePackage);
        }
    }
}

// Edit project (placeholder for future implementation)
function editProject(projectId) {
    const project = projects.find(p => p.id === projectId);
    if (project) {
        console.log('Editing project:', project);
        alert(`Editing project: ${project.name}`);
    }
}

// Edit scope package (placeholder for future implementation)
function editScopePackage(projectId, scopePackageId) {
    const project = projects.find(p => p.id === projectId);
    if (project) {
        const scopePackage = project.scopePackages.find(sp => sp.id === scopePackageId);
        if (scopePackage) {
            console.log('Editing scope package:', scopePackage);
            alert(`Editing scope package: ${scopePackage.name}`);
        }
    }
}

// Save projects to localStorage
function saveProjects() {
    localStorage.setItem('mergeBimProjects', JSON.stringify(projects));
}

// Generate unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Format date for display
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Reset forms
function resetForm() {
    if (projectForm) projectForm.reset();
}

function resetScopeForm() {
    if (scopePackageForm) scopePackageForm.reset();
    // Uncheck all IFC entity checkboxes
    const checkboxes = document.querySelectorAll('input[name="ifcEntity"]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
    });
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Make functions globally available for onclick handlers
window.viewProject = viewProject;
window.editProject = editProject;
window.navigateToProject = navigateToProject;
window.viewScopePackage = viewScopePackage;
window.editScopePackage = editScopePackage;
