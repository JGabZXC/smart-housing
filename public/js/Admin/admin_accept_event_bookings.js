/* eslint-disable */

import { PaginatedAdminBookingEvent } from '../utils/PaginatedAdminList.js';
import { setupShowHandler, setupSortHandler } from './admin_dashboard.js';

const acceptEventBookingSection = document.querySelector('#acceptEventBookingSection');
const adminEventBookingTableBody = document.querySelector('#adminEventBookingTableBody');
const adminEventBookingSearchForm = document.querySelector('#adminEventBookingSearchForm');
const adminSearchBookingInput = document.querySelector('#adminSearchBookingInput');
const adminEventBookingSearchFormButton = document.querySelector('#adminEventBookingSearchFormButton');
const sortEventBooking = document.querySelector('#sortEventBooking');
const showEventBooking = document.querySelector('#showEventBooking');
const adminEventBookingPagination = document.querySelector('#adminEventBookingPagination');

let eventBookingList = '';
if(acceptEventBookingSection) {
  eventBookingList = new PaginatedAdminBookingEvent({
    container: adminEventBookingTableBody,
    paginationContainer: adminEventBookingPagination,
    endpoint: '/api/v1/eventsresident',
    type: 'eventResident',
    itemsPerPage: 10,
    sort: 'place',
  });

  setupSortHandler(sortEventBooking, eventBookingList);
  setupShowHandler(showEventBooking, eventBookingList);

  adminEventBookingSearchForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    console.log("submitted form");
  })

  eventBookingList.render();
}