/* eslint-disable */
import PaginatedAdminList  from "../utils/PaginatedAdminList.js"

const adminProjectTableBody = document.querySelector('#admin-project-table-body');
const adminProjectPagination = document.querySelector('#admin-project-pagination');
const sortProject = document.querySelector('#sort-project');
const showProject = document.querySelector('#show-project');

let adminProjectList = null;

if(adminProjectTableBody) {
  if (!adminProjectList) {
    adminProjectList = new PaginatedAdminList({
      container: adminProjectTableBody,
      paginationContainer: adminProjectPagination,
      endpoint: '/api/v1/projects',
      type: 'projects',
      itemsPerPage: 5,
    });

    sortProject.addEventListener('change', (e) => {
      adminProjectList.sort = e.target.value;
      adminProjectList.currentPage = 1; // Reset to first page on sort change
      adminProjectList.render();
    })

    showProject.addEventListener('change', (e) => {
      adminProjectList.itemsPerPage = parseInt(e.target.value, 10);
      adminProjectList.currentPage = 1; // Reset to first page on items per page change
      adminProjectList.render();
    })
  }


  adminProjectList.render();
}