/* eslint-disable */
import axios from 'axios';
import PaginatedAdminList  from "../utils/PaginatedAdminList.js"
import { showAlert } from '../utils/alerts.js';
import { buttonSpinner } from '../utils/spinner.js';

const adminProjectCreateButton = document.querySelector('#admin-project-create-button');
const adminProjectTableBody = document.querySelector('#admin-project-table-body');
const adminProjectPagination = document.querySelector('#admin-project-pagination');
const adminProjectSearchButton = document.querySelector('#admin-project-search-button')
const sortProject = document.querySelector('#sort-project');
const showProject = document.querySelector('#show-project');

const searchProjectForm = document.querySelector('#search-project-form');
const projectSearchInput = document.querySelector('#search-project-input');
const createDashboardForm = document.querySelector('#createDashboardForm');
const modalDashboard = document.querySelector('#modalDashboard');
const saveBtnDashboard = document.querySelector('#saveBtnDashboard');

const modalDeleteDashboard = document.querySelector('#modalDeleteDashboard');
const deleteBtnDashboard = document.querySelector('#deleteBtnDashboard');
const titleEl = document.querySelector('#title');

let adminProjectList = null;
let existingModal, existingModalDelete;
if(modalDashboard) existingModal = new bootstrap.Modal(modalDashboard);
if(modalDeleteDashboard) existingModalDelete = new bootstrap.Modal(modalDeleteDashboard);


if(adminProjectTableBody) {
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
  }

  adminProjectList.render();
}

async function submitProjectForm(e) {
  e.preventDefault();

  const name = document.querySelector('#name').value;
  const date = document.querySelector('#date').value;
  const summary = document.querySelector('#richDescription').value;
  const description = document.querySelector('#description').value;
  const imageCover = document.querySelector('#imageCover').files;
  const images = document.querySelector('#images').files;

  const formData = new FormData();
  formData.append('name', name);
  formData.append('date', date);
  formData.append('richDescription', summary);
  formData.append('description', description);
  if (imageCover && imageCover.length > 0) {
    formData.append(`imageCover`, imageCover[0]);
  }
  if (images && images.length > 0) {
    for (let i = 0; i < images.length; i++) {
      formData.append(`images`, images[i]);
    }
  }

  try {
    saveBtnDashboard.disabled = true;
    saveBtnDashboard.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Creating...';
    const res = await axios({
      method: 'POST',
      url: '/api/v1/projects',
      data: formData,
    });
    const data = res.data;

    if (data.status === 'success') showAlert('success', 'Project created successfully!');

    existingModal.hide();
    saveBtnDashboard.disabled = false;
    saveBtnDashboard.innerHTML = 'Create';
    await adminProjectList.render();
  } catch (err) {
    showAlert('error', err.response.data.message);
    saveBtnDashboard.disabled = false;
    saveBtnDashboard.innerHTML = 'Create';
    console.log(err);
  }
}

if(searchProjectForm) {
  searchProjectForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    if(!projectSearchInput.value) {
      await adminProjectList.render();
      return;
    }

    try {
      buttonSpinner(adminProjectSearchButton, 'Search Project', 'Searching')
      const res = await axios({
        method: 'POST',
        url: `/api/v1/getIds`,
        data: {
          type: 'project',
          object: {
            slug: projectSearchInput.value
          },
          message: 'No project found with that slug'
        }
      })
      const { _id } = res.data.data.doc[0];
      if (!_id) {
        showAlert('error', 'No project found with that slug');
        return;
      }

      const newProjectList = new PaginatedAdminList({
        container: adminProjectTableBody,
        paginationContainer: adminProjectPagination,
        endpoint: `/api/v1/projects/${_id}`,
        type: 'projects',
        itemsPerPage: 5,
      })

      newProjectList.render();
    } catch (err) {
      showAlert('error', err.response.data.message);
    } finally {
      buttonSpinner(adminProjectSearchButton, 'Search Project', 'Searching')
    }
  })
}

if(adminProjectCreateButton) {
  adminProjectCreateButton.addEventListener('click', () => {
    console.log("clicked");
    modalDashboard.classList.add('add-project-modal');

    modalDashboard.addEventListener('submit', submitProjectForm);
  });
}

if(modalDashboard) {
  modalDashboard.addEventListener('hidden.bs.modal', () => {
    // remove existing event listener on form
    modalDashboard.removeEventListener('submit', submitProjectForm);

    const place = document.querySelector('#place');
    const time = document.querySelector('#time');

    if(place) {
      place.parentElement.remove();
      time.parentElement.remove();
    }

    if (modalDashboard.classList.contains('add-project-modal') || modalDashboard.classList.contains('add-event-modal')) {
      modalDashboard.classList.remove('add-project-modal');
      modalDashboard.classList.remove('add-event-modal');
    }
    createDashboardForm.reset();
  });
}