/* eslint-disable */
import PaginatedAdminList  from "../utils/PaginatedAdminList.js"
import { showAlert } from '../utils/alerts.js';
import { buttonSpinner } from '../utils/spinner.js';
import { postData } from '../utils/http.js';
import { searchSlug } from '../utils/modalHandlers.js';

const selectors = {
  adminSection: '#admin-dashboard-section',
  project: {
    section: '#admin-project-section',
    createButton: '#admin-project-create-button',
    tableBody: '#admin-project-table-body',
    pagination: '#admin-project-pagination',
    sort: '#sort-project',
    show: '#show-project',
    searchForm: '#admin-project-search-form',
    searchButton: '#admin-project-search-button',
    endpoint: '/api/v1/projects',
    type: 'projects',
  },
  event: {
    section: '#admin-event-section',
    createButton: '#admin-event-create-button',
    tableBody: '#admin-event-table-body',
    pagination: '#admin-event-pagination',
    sort: '#sort-event',
    show: '#show-event',
    searchForm: '#admin-event-search-form',
    searchButton: '#admin-event-search-button',
    endpoint: '/api/v1/events',
    type: 'events',
  },
  modal: {
    createModal: '#modalDashboard',
    createBtn: '#saveBtnDashboard',
    createForm: '#createDashboardForm',
    deleteModal: '#modalDeleteDashboard',
    deleteBtn: '#deleteBtnDashboard',
    deleteForm: '#deleteDashboardForm',
    title: '#title',
  }
};

let projectList, eventList;
let existingModalDelete, existingModalCreate;
if(document.querySelector(selectors.modal.deleteModal)) existingModalDelete = new bootstrap.Modal(document.querySelector(selectors.modal.deleteModal));
if(document.querySelector(selectors.modal.createModal)) existingModalCreate = new bootstrap.Modal(document.querySelector(selectors.modal.createModal));

function addEventFields() {
  if (!createDashboardForm.querySelector('#place')) {
    const placeDiv = document.createElement('div');
    placeDiv.className = 'mb-3';
    placeDiv.id = 'place-field';
    placeDiv.innerHTML = `
      <label for="place" class="form-label">Place</label>
      <input type="text" class="form-control" id="place" name="place" required />
    `;
    createDashboardForm.querySelector('.modal-body').insertBefore(
      placeDiv,
      createDashboardForm.querySelector('.modal-body').children[2] // Insert after Date
    );
  }
  if (!createDashboardForm.querySelector('#time')) {
    const timeDiv = document.createElement('div');
    timeDiv.className = 'mb-3';
    timeDiv.id = 'time-field';
    timeDiv.innerHTML = `
      <label for="time" class="form-label">Time</label>
      <input type="time" class="form-control" id="time" name="time" required />
    `;
    createDashboardForm.querySelector('.modal-body').insertBefore(
      timeDiv,
      createDashboardForm.querySelector('.modal-body').children[3] // After Place
    );
  }
}

function removeEventFields() {
  const placeDiv = createDashboardForm.querySelector('#place-field');
  const timeDiv = createDashboardForm.querySelector('#time-field');
  if (placeDiv) placeDiv.remove();
  if (timeDiv) timeDiv.remove();
}

export function setupSortHandler(sortElement, listInstance) {
  sortElement.addEventListener('change', (e) => {
    listInstance.sort = e.target.value;
    listInstance.currentPage = 1; // Reset to first page on sort change
    listInstance.render();
  });
}

export function setupShowHandler(showElement, listInstance) {
  showElement.addEventListener('change', (e) => {
    listInstance.itemsPerPage = e.target.value;
    listInstance.currentPage = 1;
    listInstance.render();
  })
}

function setupDeleteListener(tableBodySelector) {
  document.querySelector(tableBodySelector).addEventListener('click', (e) => {
    const button = e.target.closest('button');
    if (!button) return;

    // Destructure data attributes
    const { id, title, type } = button.dataset;

    // Store values in form dataset
    document.querySelector(selectors.modal.deleteForm).dataset.id = id;
    document.querySelector(selectors.modal.deleteForm).dataset.type = type;

    // Display title in modal
    document.querySelector(selectors.modal.title).textContent = title;
  });
}

function setupCreateButtonListener(createButtonSelector) {
  document.querySelector(createButtonSelector).addEventListener('click', () => {
    const { type } = document.querySelector(createButtonSelector).dataset;
    document.querySelector(selectors.modal.createForm).dataset.type = type;
    if(type === 'events') {
      addEventFields();
    } else {
      removeEventFields();
    }
  });
}

if(document.querySelector(selectors.project.section) || document.querySelector(selectors.event.section)) {
  if(!projectList || !eventList) {
    projectList = new PaginatedAdminList({
      container: document.querySelector(selectors.project.tableBody),
      paginationContainer: document.querySelector(selectors.project.pagination),
      endpoint: selectors.project.endpoint,
      type: selectors.project.type,
      itemsPerPage: 5
    });

    eventList = new PaginatedAdminList({
      container: document.querySelector(selectors.event.tableBody),
      paginationContainer: document.querySelector(selectors.event.pagination),
      endpoint: selectors.event.endpoint,
      type: selectors.event.type,
      itemsPerPage: 5
    });

    setupDeleteListener(selectors.project.tableBody);
    setupDeleteListener(selectors.event.tableBody);

    document.querySelector(selectors.modal.deleteForm).addEventListener('submit', async (e) => {
      e.preventDefault();
      const { id, type } = document.querySelector(selectors.modal.deleteForm).dataset;

      try {
        buttonSpinner(document.querySelector(selectors.modal.deleteBtn), 'Confirm', 'Deleting');

        const res = await axios.delete(`/api/v1/${type}/${id}`);

        if (res.status === 204) {
          showAlert('success', `${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully!`);

          // Render appropriate list
          if (type === 'projects') {
            await projectList.render();
          } else if (type === 'events') {
            await eventList.render();
          }
        }

        existingModalDelete.hide();
      } catch (err) {
        showAlert('error', err.response?.data?.message || 'Deletion failed.');
      } finally {
        buttonSpinner(document.querySelector(selectors.modal.deleteBtn), 'Confirm', 'Deleting');
      }
    });

    setupSortHandler(document.querySelector(selectors.event.sort), eventList);
    setupSortHandler(document.querySelector(selectors.project.sort), projectList);
    setupShowHandler(document.querySelector(selectors.project.show), projectList);
    setupShowHandler(document.querySelector(selectors.event.show), eventList);
    document.querySelector(selectors.project.searchForm).addEventListener('submit', (e) => searchSlug(projectList, document.querySelector(selectors.project.searchButton), 'admin-search-project', selectors.project.type, 'Project', e));
    document.querySelector(selectors.event.searchForm).addEventListener('submit', (e) => searchSlug(eventList, document.querySelector(selectors.event.searchButton), 'admin-search-event', selectors.event.type, 'Event', e));
    setupCreateButtonListener(selectors.project.createButton);
    setupCreateButtonListener(selectors.event.createButton);
  }

  document.querySelector(selectors.modal.createForm).addEventListener('submit', async (e) => {
    e.preventDefault();
    const { type } = document.querySelector(selectors.modal.createForm).dataset;
    const formData = new FormData(e.target);

    const url = type === 'projects' ? '/api/v1/projects' : '/api/v1/events';

    try {
      buttonSpinner(document.querySelector(selectors.modal.createBtn), 'Create', 'Creating');
      const response = await postData(url, formData);

      if (response.status === 'success') {
        showAlert('success', `${type.charAt(0).toUpperCase() + type.slice(1)} created successfully!`);
        existingModalCreate.hide();

        // Render appropriate list
        if (type === 'projects') {
          await projectList.render();
        } else if (type === 'events') {
          await eventList.render();
        }
      }
    } catch(err) {
      showAlert('error', err.response?.data?.message || 'Creation failed.');
    } finally {
      buttonSpinner(document.querySelector(selectors.modal.createBtn), 'Create', 'Creating');
    }
  })

  document.querySelector(selectors.modal.createModal).addEventListener('hidden.bs.modal', () => {
    document.querySelector(selectors.modal.createForm).reset();
    delete document.querySelector(selectors.modal.createForm).dataset.type;
  })

  projectList.render();
  eventList.render();
}