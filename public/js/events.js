/* eslint-disable */

import axios from 'axios';

const eventListContainer = document.querySelector('#event-list-container');
const pagination = document.querySelector('.pagination');

let currentPage = 1;
const projectsPerPage = 10;
let hasNextPage = false;

export const getEvents = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: `/api/v1/events?&page=${currentPage}&limit=${projectsPerPage}&sort=-date`,
    });

    if(res.data.results === 0) {
      eventListContainer.innerHTML = `<p>No events found</p>`;
      pagination.innerHTML = '';
      return;
    }

    const events = res.data.data.doc;
    const totalPages = res.data.totalPages;
    eventListContainer.innerHTML = '';

    hasNextPage = events.length === projectsPerPage;

    events.forEach(event => {
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
    });

    renderPagination(totalPages);
  } catch (err) {
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

window.changeEventPage = function(newPage) {
  if(newPage < 1) return;
  currentPage = newPage;
  getEvents();
}