/* eslint-disable */
import PaginatedList from '../utils/PaginatedList.js';

const projectListContainer = document.querySelector('#project-list-container');
const projectListPagination = document.querySelector('#project-list-pagination');

if(projectListContainer) {
  const projectList = new PaginatedList({
    container: projectListContainer,
    paginationContainer: projectListPagination,
    endpoint: '/api/v1/projects',
    type: 'projects',
    itemsPerPage: 1
  });

  projectList.render();
}


