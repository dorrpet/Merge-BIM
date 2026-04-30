// Merge-BIM Application - Project Management
console.log("Merge-BIM app initialized - ISO 19650 & IFC Schema Compliant");

// Project data store (in-memory for now, can be replaced with API calls)
let projects = JSON.parse(localStorage.getItem('mergeBimProjects')) || [];

// DOM Elements
const projectsContainer = document.getElementById('projectsContainer');
const addProjectBtn = document.getElementById('addProjectBtn');
const addProjectModal = document.getElementById('addProjectModal');
const projectForm = document.getElementById('projectForm');
const closeModal = document.getElementById('closeModal');
const cancelModal = document.getElementById('cancelModal');

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded and parsed");
    renderProjects();
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    // Open modal
    addProjectBtn.addEventListener('click', () => {
        addProjectModal.classList.add('active');
    });

    // Close modal
    closeModal.addEventListener('click', () => {
        addProjectModal.classList.remove('active');
        resetForm();
    });

    cancelModal.addEventListener('click', () => {
        addProjectModal.classList.remove('active');
        resetForm();
    });

    // Close modal when clicking outside
    addProjectModal.addEventListener('click', (e) => {
        if (e.target === addProjectModal) {
            addProjectModal.classList.remove('active');
            resetForm();
        }
    });

    // Form submission
    projectForm.addEventListener('submit', (e) => {
        e.preventDefault();
        createProject();
    });
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
                    <button class="btn btn-secondary" onclick="viewProject('${project.id}')">View</button>
                    <button class="btn btn-secondary" onclick="editProject('${project.id}')">Edit</button>
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
        updatedAt: new Date().toISOString()
    };

    projects.push(newProject);
    saveProjects();
    renderProjects();
    
    // Close modal and reset form
    addProjectModal.classList.remove('active');
    resetForm();

    console.log('Project created:', newProject);
}

// View project details (placeholder for future implementation)
function viewProject(projectId) {
    const project = projects.find(p => p.id === projectId);
    if (project) {
        console.log('Viewing project:', project);
        alert(`Viewing project: ${project.name}\nCode: ${project.code}\nIFC: ${project.ifcVersion}\nISO: ${project.isoStandard}`);
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

// Reset form
function resetForm() {
    projectForm.reset();
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Make functions globally available for onclick handlers
window.viewProject = viewProject;
window.editProject = editProject;
