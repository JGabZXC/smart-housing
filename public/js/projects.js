/* eslint-disable */

import { fetchData } from './_eventAndProjHelper';

const projectListContainer = document.querySelector('#project-list-container');

let currentPage = 1;
const projectsPerPage = 10;

function renderProject (project, container) {
  const markup = `
    <div class="col">
      <div class="card">
        <div class="card-body">
          <h4 class="card-title">${project.name}</h4>
          <p class="card-text">${project.richDescription.slice(0, 100)}...</p>
          ${project.coverUrl ? `<img class="object-fit-cover" src="${project.coverUrl}" width="100%" height="200" />` : ''}
          <a class="card-link" href="/project/${project.slug}">Read More</a>
        </div>
      </div>
    </div>
  `;
  container.innerHTML += markup;
}

export const getProjects = async () => {
  await fetchData(`/api/v1/projects`, projectListContainer, renderProject, currentPage, projectsPerPage, changeProjectPage);
}


window.changeProjectPage =  async function(newPage) {
  if(newPage < 1) return;
  currentPage = newPage;
  await getProjects();
}