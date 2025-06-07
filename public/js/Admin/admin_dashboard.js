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
    form: '#createDashboardForm',
    container: '#modalDashboard',
    saveBtn: '#saveBtnDashboard',
    deleteModal: '#modalDeleteDashboard',
    deleteBtn: '#deleteBtnDashboard',
    deleteForm: '#deleteDashboardForm',
    title: '#title',
  }
};

let projectList, eventList;
let existingModalDelete;
if(document.querySelector(selectors.modal.deleteModal)) existingModalDelete = new bootstrap.Modal(document.querySelector(selectors.modal.deleteModal));

function setupSortHandler(sortElement, listInstance) {
  sortElement.addEventListener('change', (e) => {
    listInstance.sort = e.target.value;
    listInstance.currentPage = 1; // Reset to first page on sort change
    listInstance.render();
  });
}

function setupShowHandler(showElement, listInstance) {
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

    // Show modal
    const modal = new bootstrap.Modal(document.querySelector(selectors.modal.deleteModal));
    modal.show();
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
    let id, type;
    setupDeleteListener(selectors.project.tableBody);
    setupDeleteListener(selectors.event.tableBody);

    document.querySelector(selectors.modal.deleteForm).addEventListener('submit', async (e) => {
      e.preventDefault();
      const { id, type } = document.querySelector(selectors.modal.deleteForm).dataset;
      console.log(id, type);

      try {
        buttonSpinner(document.querySelector(selectors.modal.deleteBtn), 'Confirm', 'Deleting...');

        const res = await axios.delete(`/api/v1/${type}/${id}`);

        if (res.status === 204) {
          showAlert('success', `${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully!`);

          // Render appropriate list
          if (type === 'project') {
            await projectList.render();
          } else if (type === 'event') {
            await eventList.render();
          }
        }

        bootstrap.Modal.getInstance(selectors.modal.deleteModal).hide();
      } catch (err) {
        console.error(err);
        showAlert('error', err.response?.data?.message || 'Deletion failed.');
      } finally {
        buttonSpinner(document.querySelector(selectors.modal.deleteBtn), 'Confirm', 'Deleting...');
      }
    });

    setupSortHandler(document.querySelector(selectors.event.sort), eventList);
    setupSortHandler(document.querySelector(selectors.project.sort), projectList);
    setupShowHandler(document.querySelector(selectors.project.show), projectList);
    setupShowHandler(document.querySelector(selectors.event.show), eventList);
    document.querySelector(selectors.project.searchForm).addEventListener('submit', (e) => searchSlug(projectList, document.querySelector(selectors.project.searchButton), 'admin-search-project', selectors.project.type, 'Project', e));
    document.querySelector(selectors.event.searchForm).addEventListener('submit', (e) => searchSlug(eventList, document.querySelector(selectors.event.searchButton), 'admin-search-event', selectors.event.type, 'Event', e));
  }

  projectList.render();
  eventList.render();
}