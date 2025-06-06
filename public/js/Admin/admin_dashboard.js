/* eslint-disable */
import axios from 'axios';
import PaginatedAdminList  from "../utils/PaginatedAdminList.js"
import { showAlert } from '../utils/alerts.js';
import { buttonSpinner } from '../utils/spinner.js';
import { postData } from '../utils/http.js';
import { searchSlug } from '../utils/modalHandlers.js';

const adminProjectSection = document.querySelector('#admin-project-section');
const adminProjectTableBody = document.querySelector('#admin-project-table-body');
const adminProjectPagination = document.querySelector('#admin-project-pagination');
const sortProject = document.querySelector('#sort-project');
const showProject = document.querySelector('#show-project');

const adminProjectSearchForm = document.querySelector('#admin-project-search-form');
const adminProjectSearchButton = document.querySelector('#admin-project-search-button');

const adminEventSection = document.querySelector('#admin-event-section');
const adminEventTableBody = document.querySelector('#admin-event-table-body');
const adminEventPagination = document.querySelector('#admin-event-pagination');
const sortEvent = document.querySelector('#sort-event');
const showEvent = document.querySelector('#show-event');

const createDashboardForm = document.querySelector('#createDashboardForm');
const modalDashboard = document.querySelector('#modalDashboard');
const saveBtnDashboard = document.querySelector('#saveBtnDashboard');

const modalDeleteDashboard = document.querySelector('#modalDeleteDashboard');
const deleteBtnDashboard = document.querySelector('#deleteBtnDashboard');
const titleEl = document.querySelector('#title');

let adminProjectList, adminEventList = null;
let existingModal, existingModalDelete;
if(modalDashboard) existingModal = new bootstrap.Modal(modalDashboard);
if(modalDeleteDashboard) existingModalDelete = new bootstrap.Modal(modalDeleteDashboard);

function handleProjectSearch(event) {
  searchSlug(
    adminProjectList,
    adminProjectSearchButton,
    'admin-search-project',
    'projects',
    'project',
    event
  )
}

function handleEventSearch(event) {
  searchSlug(
    adminEventtList,
    adminEventSearchButton,
    'admin-event-project',
    'events',
    'event',
    event
  )
}

if(adminProjectSection) {
  let id = '';
  if (!adminProjectList) {
    adminProjectList = new PaginatedAdminList({
      container: adminProjectTableBody,
      paginationContainer: adminProjectPagination,
      endpoint: '/api/v1/projects',
      type: 'projects',
      itemsPerPage: 5,
    });

    adminProjectTableBody.addEventListener('click', (e) => {
      const button = e.target.closest('button');
      if(!button) return;

      const { id: data_id, title: data_title} = button.dataset;
      id = data_id;
      titleEl.innerText = data_title;
    });

    modalDeleteDashboard.addEventListener('submit', async(e) => {
      e.preventDefault();
      try {
        buttonSpinner(deleteBtnDashboard, 'Confirm', 'Deleting...')
        const res = await axios({
          method: 'DELETE',
          url: `/api/v1/projects/${id}`
        })

        if(res.status === 204) {
          showAlert('success', 'Project deleted successfully!');
          await adminProjectList.render();
        }
        existingModalDelete.hide();
        buttonSpinner(deleteBtnDashboard, 'Confirm', 'Deleting...');
      } catch (err) {
        console.log(err);
        showAlert('error', err.response.data.message);
        buttonSpinner(deleteBtnDashboard, 'Confirm', 'Deleting...')
      }
    });

    sortProject.addEventListener('change', (e) => {
      adminProjectList.sort = e.target.value;
      adminProjectList.currentPage = 1; // Reset to first page on sort change
      adminProjectList.render();
    });

    showProject.addEventListener('change', (e) => {
      adminProjectList.itemsPerPage = parseInt(e.target.value, 10);
      adminProjectList.currentPage = 1; // Reset to first page on items per page change
      adminProjectList.render();
    });

    createDashboardForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const formData = new FormData(e.target);
      const { imageCover, images } = Object.fromEntries(formData.entries());
      if (imageCover && imageCover.length > 0) {
        formData.append(`imageCover`, imageCover[0]);
      }
      if (images && images.length > 0) {
        for (let i = 0; i < images.length; i++) {
          formData.append(`images`, images[i]);
        }
      }

      try {
        buttonSpinner(saveBtnDashboard, 'Create', 'Creating...');
        const response = await postData(`/api/v1/projects`, formData);

        if(response.status === 'success') {
          showAlert('success', 'Project created successfully!');
          existingModal.hide();
          buttonSpinner(saveBtnDashboard, 'Create', 'Creating...');
          await adminProjectList.render();
        }
      } catch(err) {
        showAlert('error', err.response.data?.message || 'An error occurred while creating the project.');
      } finally {
        buttonSpinner(saveBtnDashboard, 'Create', 'Creating...')
      }
    });

    adminProjectSearchForm.addEventListener('submit', handleProjectSearch);
  }

  adminProjectList.render();
}

if(adminEventSection) {
  if (!adminEventList) {
    adminEventList = new PaginatedAdminList({
      container: adminEventTableBody,
      paginationContainer: adminEventPagination,
      endpoint: '/api/v1/events',
      type: 'events',
      itemsPerPage: 5,
    });

    sortEvent.addEventListener('change', (e) => {
      adminEventList.sort = e.target.value;
      adminEventList.currentPage = 1; // Reset to first page on sort change
      adminEventList.render();
    });

    showEvent.addEventListener('change', (e) => {
      adminEventList.itemsPerPage = parseInt(e.target.value, 10);
      adminEventList.currentPage = 1; // Reset to first page on items per page change
      adminEventList.render();
    });
  }

  adminEventList.render();
}

if (modalDashboard) {
  modalDashboard.addEventListener('hidden.bs.modal', () => {
    modalDashboard.removeEventListener('submit', handleProjectSearch);
    modalDashboard.removeEventListener('submit', handleEventSearch);
  });
}
