/* eslint-disable */

import { fetchData } from './_eventAndProjHelper';


const projectListContainer = document.querySelector('#project-list-container');
const adminProjectContainer = document.querySelector('#admin-project-container');
const adminProjectTableBodyList = document.querySelector('#admin-project-tablebody-list');

let currentPage = 1;
const projectsPerPage = 10;

function renderProject(project, container) {
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

function renderProjectAdmin (project, container) {
  let date;
  if(project.date)  {
    date = new Date(project.date);
    date = date.toLocaleString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'Asia/Manila',
    });
  }

  const markup =
    `
    <tr>
        <td>${project.name}</td>
        <td>${date || 'No date specified'}</td>
        <td class="d-flex gap-2">
            <a class="btn btn-primary" type="button" href="project/${project.slug}">View</a>
            <a class="btn btn-warning" type="button" href="project/${project.slug}/edit">Edit</a>
            <button data-id="${project._id}" data-title="${project.name}" class="btn btn-danger" type="button" data-bs-toggle="modal" data-bs-target="#modalDeleteDashboard">Delete</button>
        </td>
    </tr>
    `
  container.innerHTML += markup;
}

export const getProjects = async () => {
  if(adminProjectContainer) return await fetchData(
    `/api/v1/projects`,
    adminProjectTableBodyList,
    renderProjectAdmin,
    currentPage,
    projectsPerPage,
    changeProjectPage,
  );

  await fetchData(
    `/api/v1/projects`,
    projectListContainer,
    renderProject,
    currentPage,
    projectsPerPage,
    changeProjectPage,
  );
};

window.changeProjectPage = async function (newPage) {
  if (newPage < 1) return;
  currentPage = newPage;
  await getProjects();
};
