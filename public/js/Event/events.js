/* eslint-disable */

import { fetchData } from '../utils/http.js';
import { spinner } from '../utils/spinner.js';

const eventListContainer = document.querySelector('#event-list-container');
const eventListPagination = document.querySelector('#event-list-pagination');

let currentPage = 1;
let projectsPerPage = 1;
let type = '_id';

function cardEvent (event, container) {
  const markup =
    `
      <div class="col">
        <div class="card shadow">
          <div class="card-body rounded">
            <h4 class="card-title text-slate-900 fw-semibold">${event.name}</h4>
            <p class="card-text text-slate-600">${event.richDescription.slice(0, 100)}${event.richDescription.length > 100 ? "..." : ''}</p>
            ${event.imageCover?.signedUrl ? `<img class"object-fit-cover" src="${event.imageCover.signedUrl}" width="100%" height="200" />` : ''}
            <a class="btn bg-green-500 text-slate-50 mt-3" href="/events/${event.slug}">Read More</a>
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
  eventListPagination.appendChild(prevButton);

  if (totalPages <= 5) {
    for (let i = 1; i <= totalPages; i++) {
      const pageItem = document.createElement('li');
      pageItem.className = `page-item ${i === currentPage ? 'active' : ''}`;
      pageItem.innerHTML = `<a class="page-link">${i}</a>`;
      pageItem.addEventListener('click', () =>  changeProjectPage(i));
      eventListPagination.appendChild(pageItem);
    }
  } else {
    const createPageItem = (i) => {
      const pageItem = document.createElement('li');
      pageItem.className = `page-item ${i === currentPage ? 'active' : ''}`;
      pageItem.innerHTML = `<a class="page-link">${i}</a>`;
      pageItem.addEventListener('click', () => changeProjectPage(i));
      eventListPagination.appendChild(pageItem);
    };

    createPageItem(1);

    if (currentPage > 4) {
      const ellipsisItem = document.createElement('li');
      ellipsisItem.className = 'page-item disabled';
      ellipsisItem.innerHTML = `<a class="page-link">...</a>`;
      eventListPagination.appendChild(ellipsisItem);
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
      eventListPagination.appendChild(ellipsisItem);
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
  eventListPagination.appendChild(nextButton);
}

async function renderEvents() {
  spinner(eventListContainer, 'Loading events')

  try {
    const data = await fetchEvents();
    eventListContainer.innerHTML = '';
    eventListPagination.innerHTML = '';
    const hasNextPage = currentPage < data.totalPages;
    data.data.doc.forEach((event) => cardEvent(event, eventListContainer));
    if(data.data.doc.length === 0) {
      eventListContainer.innerHTML = '<p class="fs-6 text-slate-400">No events available.</p>';
      return;
    }
    if(data.totalPages > 1) renderPagination(data.totalPages, hasNextPage);
  } catch (error) {
    eventListContainer.innerHTML = '<p class="text-danger">Failed to load events. Please try again later.</p>';
  }
}

async function fetchEvents() {
  return await fetchData(`/api/v1/events?page=${currentPage}&limit=${projectsPerPage}&sort=${type}`);
}

if(eventListContainer) {
  renderEvents();
}

window.changeEventPage = async function (newPage) {
  if (newPage < 1) return;
  currentPage = newPage;
  await renderEvents();
};