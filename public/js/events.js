/* eslint-disable */

import { buttonSpinner, fetchData } from './_eventAndProjHelper';
import axios from 'axios';
import { showAlert } from './alerts';

const eventListContainer = document.querySelector('#event-list-container');
const adminEventContainer = document.querySelector('#admin-event-container');
const adminEventTableBodyList = document.querySelector('#admin-event-tablebody-list');
const searchButtonEventAdmin = document.querySelector('#searchButtonEventAdmin');
const eventControlSortLimit = document.querySelector('#eventControlSortLimit');

let currentPage = 1;
let projectsPerPage = 10;
let type = '-date';

function renderEvent (event, container) {
  const markup =
    `
      <div class="col">
        <div class="card">
          <div class="card-body">
            <h4 class="card-title">${event.name}</h4>
            <p class="card-text">${event.richDescription.slice(0, 100)}...</p>
            ${event.coverUrl ? `<img class"object-fit-cover" src="${event.coverUrl}" width="100%" height="200" />` : ''}
            <a class="card-link" href="/event/${event.slug}">Read More</a>
          </div>
        </div>
      </div>
      `;
  container.innerHTML += markup;
}

function renderEventAdmin (event, container) {
  let date;
  if(event.date)  {
    date = new Date(event.date);
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
        <td>${event.name}</td>
        <td>${date || 'No date specified'}</td>
        <td>
          <a href="/event/${event.slug}" class="btn btn-primary">View</a>
          <a href="/event/${event.slug}/edit?type=event" class="btn btn-warning">Edit</a>
          <button data-id="${event._id}" data-title="${event.name}" class="btn btn-danger" type="button" data-bs-toggle="modal" data-bs-target="#modalDeleteDashboard">Delete</button>
        </td>
      </tr>
      `;
  container.innerHTML += markup;
}

export const getEvents = async () => {
  if(adminEventContainer) return await fetchData(
    `/api/v1/events`,
    adminEventTableBodyList,
    renderEventAdmin,
    currentPage,
    projectsPerPage,
    changeEventPage,
    '#pagination-admin-event',
    type
  );

  await fetchData(`/api/v1/events`, eventListContainer, renderEvent, currentPage, projectsPerPage, changeEventPage);
}

// ADMIN DASHBOARD
if(searchButtonEventAdmin) {
  searchButtonEventAdmin.addEventListener('click', async () => {
    const searchInput = document.querySelector('#searchInputEventAdmin').value;

    if(!searchInput) {
      await fetchData(
        `/api/v1/events`,
        adminEventTableBodyList,
        renderEventAdmin,
        currentPage,
        projectsPerPage,
        changeEventPage,
      );
      return;
    }

    try {
      buttonSpinner(searchButtonEventAdmin, 'Search Event', 'Searching')
      const res = await axios({
        method: 'POST',
        url: `/api/v1/getIds`,
        data: {
          type: 'event',
          object: {
            slug: searchInput
          },
          message: 'No event found with that slug'
        }
      })
      const { _id } = res.data.data.doc[0];
      if (!_id) {
        showAlert('error', 'No event found with that slug');
        return;
      }

      await fetchData(`/api/v1/events/${_id}`, adminEventTableBodyList,
        renderEventAdmin,
        currentPage,
        projectsPerPage,
        changeEventPage,
      )
    } catch (err) {
      showAlert('error', err.response.data.message);
    } finally {
      buttonSpinner(searchButtonEventAdmin, 'Search Event', 'Searching')
    }
  })
}

if(eventControlSortLimit) {
  eventControlSortLimit.addEventListener('change', async (e) => {
    const parentElementId = e.target.closest('select').getAttribute('id');

    console.log(parentElementId);

    if(parentElementId === 'eventLimitSelectAdmin') {
      projectsPerPage = parseInt(e.target.value);

      await fetchData(
        `/api/v1/events`,
        adminEventTableBodyList,
        renderEventAdmin,
        currentPage,
        projectsPerPage,
        changeEventPage,
        '#pagination-admin-event',
        type
      );
      return;
    }

    if(parentElementId === 'eventSortSelectAdmin') {
      type = e.target.value;
      await fetchData(
        `/api/v1/events`,
        adminEventTableBodyList,
        renderEventAdmin,
        currentPage,
        projectsPerPage,
        changeEventPage,
        '#pagination-admin-event',
        type
      );
      return;
    }
  })
}

window.changeEventPage = async function(newPage) {
  if(newPage < 1) return;
  currentPage = newPage;
  await getEvents();
}