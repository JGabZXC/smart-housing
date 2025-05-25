/* eslint-disable */

import { fetchData, buttonSpinner } from './_eventAndProjHelper';
import axios from 'axios';
import { showAlert } from './alerts';


const projectListContainer = document.querySelector('#project-list-container');
const adminProjectContainer = document.querySelector('#admin-project-container');
const adminProjectTableBodyList = document.querySelector('#admin-project-tablebody-list');
const searchButtonProjectAdmin = document.querySelector('#searchButtonProjectAdmin');
const projectControlSortLimit = document.querySelector('#projectControlSortLimit');

let currentPage = 1;
let projectsPerPage = 10;
let type = '-date';

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
            <a class="btn btn-warning" type="button" href="project/${project.slug}/edit?type=project">Edit</a>
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
    '#pagination-admin-project',
    type
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

// ADMIN DASHBOARD
if(searchButtonProjectAdmin) {
  searchButtonProjectAdmin.addEventListener('click', async () => {
    const searchInput = document.querySelector('#searchInputProjectAdmin').value;

    if(!searchInput) {
      await fetchData(
        `/api/v1/projects`,
        adminProjectTableBodyList,
        renderProjectAdmin,
        currentPage,
        projectsPerPage,
        changeProjectPage,
        '#pagination-admin-project'
      );
      return;
    }

    try {
      buttonSpinner(searchButtonProjectAdmin, 'Search Project', 'Searching')
      const res = await axios({
        method: 'POST',
        url: `/api/v1/getIds`,
        data: {
          type: 'project',
          object: {
            slug: searchInput
          },
          message: 'No project found with that slug'
        }
      })
      const { _id } = res.data.data.doc[0];
      if (!_id) {
        showAlert('error', 'No project found with that slug');
        return;
      }

      await fetchData(`/api/v1/projects/${_id}`, adminProjectTableBodyList,
        renderProjectAdmin,
        currentPage,
        projectsPerPage,
        changeProjectPage)
    } catch (err) {
      showAlert('error', err.response.data.message);
    } finally {
      buttonSpinner(searchButtonProjectAdmin, 'Search Project', 'Searching')
    }
  })
}

if(projectControlSortLimit) {
  projectControlSortLimit.addEventListener('change', async (e) => {
    const parentElementId = e.target.closest('select').getAttribute('id');

    if(parentElementId === 'projectLimitSelectAdmin') {
      projectsPerPage = parseInt(e.target.value);

      await fetchData(
        `/api/v1/projects`,
        adminProjectTableBodyList,
        renderProjectAdmin,
        currentPage,
        projectsPerPage,
        changeProjectPage,
        '#pagination-admin-project'
      );
      return;
    }

    if(parentElementId === 'projectSortSelectAdmin') {
      type = e.target.value;
      await fetchData(
        `/api/v1/projects`,
        adminProjectTableBodyList,
        renderProjectAdmin,
        currentPage,
        projectsPerPage,
        changeProjectPage,
        '#pagination-admin-project',
        type
      );
      return;
    }
  })
}

window.changeProjectPage = async function (newPage) {
  if (newPage < 1) return;
  currentPage = newPage;
  await getProjects();
};
