/* eslint-disable */
import { fetchData } from '../utils/http.js';

const projectListContainer = document.querySelector('#project-list-container');
const projectListPagination = document.querySelector('#project-list-pagination');

let currentPage = 1;
let projectsPerPage = 1;
let type = '_id';

async function fetchProjects() {
  return await fetchData(`/api/v1/projects?page=${currentPage}&limit=${projectsPerPage}&sort=${type}`);
}

function cardProject(project, container) {
  const markup = `
    <div class="col">
      <div class="card shadow">
        <div class="card-body rounded">
          <h4 class="card-title text-slate-900 fw-semibold">${project.name}</h4>
          <p class="card-text text-slate-600">${project.richDescription.slice(0, 100)}...</p>
          ${project.imageCover?.signedUrl ? `<img class="object-fit-cover border rounded-3" src="${project.imageCover.signedUrl}" width="100%" height="200" />` : ''}
          <a class="btn bg-green-500 text-slate-50 mt-3" href="/projects/${project.slug}">Read More ⟶</a>
        </div>
      </div>
    </div>
  `;
  container.innerHTML += markup;
}

function renderPagination(totalPages, hasNextPage) {
  const prevButton = document.createElement('li');
  prevButton.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
  prevButton.innerHTML = `
    <a class="page-link" aria-label="Previous">
      <span aria-hidden="true">«</span>
    </a>
  `;

  if(currentPage > 1) {
    prevButton.addEventListener('click', () => changeProjectPage(currentPage - 1));
  }
  projectListPagination.appendChild(prevButton);

  if (totalPages <= 5) {
    for (let i = 1; i <= totalPages; i++) {
      const pageItem = document.createElement('li');
      pageItem.className = `page-item ${i === currentPage ? 'active' : ''}`;
      pageItem.innerHTML = `<a class="page-link">${i}</a>`;
      pageItem.addEventListener('click', () =>  changeProjectPage(i));
      projectListPagination.appendChild(pageItem);
    }
  } else {
    const createPageItem = (i) => {
      const pageItem = document.createElement('li');
      pageItem.className = `page-item ${i === currentPage ? 'active' : ''}`;
      pageItem.innerHTML = `<a class="page-link">${i}</a>`;
      pageItem.addEventListener('click', () => changeProjectPage(i));
      projectListPagination.appendChild(pageItem);
    };

    createPageItem(1);

    if (currentPage > 4) {
      const ellipsisItem = document.createElement('li');
      ellipsisItem.className = 'page-item disabled';
      ellipsisItem.innerHTML = `<a class="page-link">...</a>`;
      projectListPagination.appendChild(ellipsisItem);
    }

    for (
      let i = Math.max(2, currentPage - 2);
      i <= Math.min(totalPages - 1, currentPage + 2);
      i++
    ) {
      createPageItem(i);
    }

    if (currentPage < totalPages - 3) {
      const ellipsisItem = document.createElement('li');
      ellipsisItem.className = 'page-item disabled';
      ellipsisItem.innerHTML = `<a class="page-link">...</a>`;
      projectListPagination.appendChild(ellipsisItem);
    }

    createPageItem(totalPages);
  }

  const nextButton = document.createElement('li');
  nextButton.className = `page-item ${!hasNextPage ? 'disabled' : ''}`;
  nextButton.innerHTML = `
    <a class="page-link" aria-label="Next">
      <span aria-hidden="true">»</span>
    </a>
  `;
  if (hasNextPage) {
    nextButton.addEventListener('click', () =>
      changeProjectPage(currentPage + 1),
    );
  }
  projectListPagination.appendChild(nextButton);
}

async function renderProjects() {
  projectListContainer.innerHTML = '<p class="">Loading images</p>';

  try {
    const data = await fetchProjects();
    projectListContainer.innerHTML = '';
    projectListPagination.innerHTML = '';
    const hasNextPage = currentPage < data.totalPages;
    data.data.doc.forEach((project) => cardProject(project, projectListContainer));
    if(data.totalPages >= 1) renderPagination(data.totalPages, hasNextPage);
  } catch (error) {
    projectListContainer.innerHTML = '<p class="text-danger">Failed to load projects. Please try again later.</p>';
  }
}

if(projectListContainer) {
  renderProjects();
}

window.changeProjectPage = async function (newPage) {
  if (newPage < 1) return;
  currentPage = newPage;
  await renderProjects();
};