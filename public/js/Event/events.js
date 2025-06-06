/* eslint-disable */
import PaginatedList from '../utils/PaginatedList.js';

const eventListContainer = document.querySelector('#event-list-container');
const eventListPagination = document.querySelector('#event-list-pagination');

let eventList = null;

if(eventListContainer) {
  if(!eventList) eventList = new PaginatedList({
    container: eventListContainer,
    paginationContainer: eventListPagination,
    endpoint: '/api/v1/events',
    type: 'events',
    itemsPerPage: 1
  })

  eventList.render();
}