// Merge-BIM Application - Project & Scope Package Management
console.log("Merge-BIM app initialized - ISO 19650 & IFC Schema Compliant");

// Current page state
let currentPage = 'projects';
let currentProjectId = null;

// Project data store
let projects = [];

// Storage key
const STORAGE_KEY = 'mergeBimProjects';

// Load projects from storage (try sessionStorage first, then localStorage)
function loadProjectsFromStorage() {
    let stored = null;
    
    // Try sessionStorage first
    stored = sessionStorage.getItem(STORAGE_KEY);
    console.log('sessionStorage:', stored ? 'has data (' + stored.length + ' chars)' : 'empty');
    
    // If sessionStorage is empty, try localStorage
    if (!stored) {
        stored = localStorage.getItem(STORAGE_KEY);
        console.log('localStorage:', stored ? 'has data (' + stored.length + ' chars)' : 'empty');
    }
    
    if (stored) {
        try {
            projects = JSON.parse(stored);
            console.log('Loaded projects:', projects.length);
            projects.forEach(p => console.log('  -', p.name, p.id));
            
            // Save to both storages for redundancy
            sessionStorage.setItem(STORAGE_KEY, stored);
            localStorage.setItem(STORAGE_KEY, stored);
            
        } catch (e) {
            console.error('Error parsing stored projects:', e);
            projects = [];
        }
    } else {
        console.log('No projects found in storage');
        projects = [];
    }
    
    // Ensure all projects have scopePackages array
    projects.forEach(project => {
        if (!project.scopePackages) {
            project.scopePackages = [];
        }
    });
}

// Save projects to both storages
function saveProjects() {
    try {
        const jsonString = JSON.stringify(projects);
        sessionStorage.setItem(STORAGE_KEY, jsonString);
        localStorage.setItem(STORAGE_KEY, jsonString);
        console.log('Projects saved to storage. Total projects:', projects.length);
    } catch (e) {
        console.error('Error saving projects to storage:', e);
    }
}

// DOM Elements - Projects Page
let projectsContainer, addProjectBtn, addProjectModal, projectForm, closeModal, cancelModal;

// DOM Elements - Project Page
let backBtn, projectNameEl, projectCodeEl, projectIfcEl, projectIsoEl, projectDescriptionEl;
let editProjectBtn, scopePackagesContainer, addScopePackageBtn;
let addScopePackageModal, scopePackageForm, closeScopeModal, cancelScopeModal;
let viewScopePackageModal, closeViewScopeModal, viewScopeContent;

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded and parsed");
    
    // Wait a brief moment to ensure DOM is fully ready
    setTimeout(() => {
        // Load all DOM elements safely (they may not exist on all pages)
        loadDOMElements();
        
        // Load projects from storage
        loadProjectsFromStorage();
        console.log('Projects loaded from storage:', projects);
        
        // Determine which page we're on
        const isProjectPage = projectNameEl !== null;
        const isIndexPage = projectsContainer !== null;
        
        if (isProjectPage) {
            currentPage = 'project';
            const urlParams = new URLSearchParams(window.location.search);
            currentProjectId = urlParams.get('projectId');
            if (currentProjectId) {
                loadProject(currentProjectId);
            } else {
                console.error('No projectId in URL on project page, redirecting to index');
                // Prevent redirect loop - only redirect if we're not already going to index
                if (window.location.pathname.includes('project.html') && 
                    !window.location.pathname.includes('index.html')) {
                    console.log('Redirecting to index.html');
                    window.location.href = 'index.html';
                }
            }
        } else if (isIndexPage) {
            currentPage = 'projects';
            console.log('On index page, rendering projects');
            renderProjects();
        } else {
            console.error('Unknown page type - neither project nor index page elements found');
        }
        
        setupEventListeners();
    }, 100);
});

// Load DOM elements safely
function loadDOMElements() {
    projectsContainer = document.getElementById('projectsContainer');
    addProjectBtn = document.getElementById('addProjectBtn');
    addProjectModal = document.getElementById('addProjectModal');
    projectForm = document.getElementById('projectForm');
    closeModal = document.getElementById('closeModal');
    cancelModal = document.getElementById('cancelModal');

    backBtn = document.getElementById('backBtn');
    projectNameEl = document.getElementById('projectName');
    projectCodeEl = document.getElementById('projectCode');
    projectIfcEl = document.getElementById('projectIfc');
    projectIsoEl = document.getElementById('projectIso');
    projectDescriptionEl = document.getElementById('projectDescription');
    editProjectBtn = document.getElementById('editProjectBtn');
    scopePackagesContainer = document.getElementById('scopePackagesContainer');
    addScopePackageBtn = document.getElementById('addScopePackageBtn');
    addScopePackageModal = document.getElementById('addScopePackageModal');
    scopePackageForm = document.getElementById('scopePackageForm');
    closeScopeModal = document.getElementById('closeScopeModal');
    cancelScopeModal = document.getElementById('cancelScopeModal');
    viewScopePackageModal = document.getElementById('viewScopePackageModal');
    closeViewScopeModal = document.getElementById('closeViewScopeModal');
    viewScopeContent = document.getElementById('viewScopeContent');
}

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
        // Ensure scopePackages exists
        if (!project.scopePackages) {
            project.scopePackages = [];
        }
        
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
        alert('Project not found. You will be redirected to the projects page.');
        // Only redirect if we're on project.html
        if (window.location.pathname.includes('project.html')) {
            window.location.href = 'index.html';
        }
    }
}

// Render projects to the UI
function renderProjects() {
    console.log('renderProjects called');
    console.log('projectsContainer exists:', !!projectsContainer);
    console.log('Projects to render:', projects.length);
    
    // Re-get the container element in case it wasn't loaded earlier
    if (!projectsContainer) {
        projectsContainer = document.getElementById('projectsContainer');
        console.log('Re-fetched projectsContainer:', projectsContainer);
    }
    
    if (!projectsContainer) {
        console.error('projectsContainer is still null! Cannot render projects.');
        // Try one more time after a brief delay
        setTimeout(() => {
            projectsContainer = document.getElementById('projectsContainer');
            if (projectsContainer) {
                renderProjects();
            }
        }, 50);
        return;
    }
    
    if (projects.length === 0) {
        projectsContainer.innerHTML = `
            <div class="empty-state">
                <p>No projects yet. Click the "Add Project" button to create your first BIM project.</p>
            </div>
        `;
        console.log('Rendered empty state');
        return;
    }

    console.log('Rendering', projects.length, 'projects');
    
    try {
        const html = projects.map(project => {
            // Ensure scopePackages exists
            if (!project.scopePackages) {
                project.scopePackages = [];
            }
            return `
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
        `}).join('');
        
        console.log('Generated HTML length:', html.length);
        projectsContainer.innerHTML = html;
        console.log('Projects rendered successfully');
    } catch (e) {
        console.error('Error generating project HTML:', e);
        projectsContainer.innerHTML = '<div style="color: red; padding: 20px;">Error rendering projects: ' + e.message + '</div>';
    }
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
