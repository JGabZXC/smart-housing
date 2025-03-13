/* eslint-disable */

import axios from 'axios';
import {fetchData} from './_eventAndProjHelper';

const eventListContainer = document.querySelector('#event-list-container');

let currentPage = 1;
const projectsPerPage = 10;

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
  eventListContainer.innerHTML += markup;
}

export const getEvents = async () => {
  await fetchData(`/api/v1/events`, eventListContainer, renderEvent, currentPage, projectsPerPage, changeEventPage);
}

window.changeEventPage = async function(newPage) {
  if(newPage < 1) return;
  currentPage = newPage;
  await getEvents();
}