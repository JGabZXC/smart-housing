/* eslint-disable */

import axios from 'axios';

const projectListContainer = document.querySelector('#project-list-container');

let currentPage = 1;
const projectsPerPage = 10;
let hasNextPage = false;

export const getProjects = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: `/api/v1/projects?&page=${currentPage}&limit=${projectsPerPage}&sort=-date`,
    });

    if(res.data.status !== 'success') return;

    const projects = res.data.data.doc;
    const totalPages = res.data.totalPages;
    projectListContainer.innerHTML = '';

    projects.forEach(project => {
      const markup =
        `
      <div class="col">
        <div class="card">
          <div class="card-body">
            <h4 class="card-title">${project.name}</h4>
            <p class="card-text">${project.richDescription.slice(0, 100)}...</p>
            ${project.imageUrl ? `<img class"object-fit-cover" src="${project.imageUrl}" width="100%" height="200" />` : ''}
            <a class="card-link" href="/project/${project.slug}">Read More</a>
          </div>
        </div>
      </div>
      `;
      projectListContainer.innerHTML += markup;
    });

    hasNextPage = projects.length === projectsPerPage;

    renderPagination(totalPages);
  } catch(err) {
    console.error(err);
  }
}

function renderPagination(totalPages) {
  const pagination = document.querySelector('.pagination');
  pagination.innerHTML = '';

  const prevButton = `<li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
    <a class="page-link" aria-label="Previous" onClick="changeProjectPage(${currentPage - 1})">
      <span aria-hidden="true">«</span>
    </a>
  </li>`;
  pagination.innerHTML += prevButton;

  for (let i = 1; i <= totalPages; i ++) {
    const pageItem = `<li class="page-item ${i === currentPage ? 'active' : ''}">
      <a class="page-link" onClick="changeProjectPage(${i})">${i}</a>
    </li>`
    pagination.innerHTML += pageItem;
  }

  const nextButton = `<li class="page-item ${!hasNextPage ? 'disabled' : ''}">
    <a class="page-link" aria-label="Next" onClick="changeProjectPage(${currentPage + 1})">
      <span aria-hidden="true">»</span>
    </a>
  </li>`;
  pagination.innerHTML += nextButton;
}

window.changeProjectPage = function(newPage) {
  if(newPage < 1) return;
  currentPage = newPage;
  getProjects();
}