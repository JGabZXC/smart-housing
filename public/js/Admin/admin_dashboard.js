/* eslint-disable */
import PaginatedAdminList  from "../utils/PaginatedAdminList.js"
import { showAlert } from '../utils/alerts.js';
import { buttonSpinner } from '../utils/spinner.js';

const adminProjectTableBody = document.querySelector('#admin-project-table-body');
const adminProjectPagination = document.querySelector('#admin-project-pagination');
const sortProject = document.querySelector('#sort-project');
const showProject = document.querySelector('#show-project');
const modalDeleteDashboard = document.querySelector('#modalDeleteDashboard');
const deleteBtnDashboard = document.querySelector('#deleteBtnDashboard');
const titleEl = document.querySelector('#title');

let adminProjectList = null;
let existingModalDelete;
if(modalDeleteDashboard) existingModalDelete = bootstrap.Modal.getInstance(modalDeleteDashboard) || new bootstrap.Modal(modalDeleteDashboard);


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