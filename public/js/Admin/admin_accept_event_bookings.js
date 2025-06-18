/* eslint-disable */

import { PaginatedAdminBookingEvent } from '../utils/PaginatedAdminList.js';
import { setupShowHandler, setupSortHandler } from './admin_dashboard.js';
import { buttonSpinner } from '../utils/spinner.js';
import { showAlert } from '../utils/alerts.js';
import { patchData } from '../utils/http.js';

const acceptEventBookingSection = document.querySelector('#acceptEventBookingSection');
const adminEventBookingTableBody = document.querySelector('#adminEventBookingTableBody');
const adminEventBookingSearchForm = document.querySelector('#adminEventBookingSearchForm');
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
    const formData = new FormData(e.target);
    const searchEmail = formData.get('adminSearchBookingInput');

    try {
      buttonSpinner(adminEventBookingSearchFormButton, "Search", "Searching");

      eventBookingList.endpoint = !searchEmail ? '/api/v1/eventsresident' : `/api/v1/eventsresident?email=${searchEmail}`;
      eventBookingList.currentPage = 1; // Reset to first page on new search
      await eventBookingList.render();
    } catch(err) {
      adminEventBookingTableBody.innerHTML = '';
      showAlert("error", err.response?.data?.message || "An error occurred while searching.");
    } finally {
      buttonSpinner(adminEventBookingSearchFormButton, "Search", "Searching");
    }
  });

  adminEventBookingTableBody.addEventListener('click', async (e) => {
    e.preventDefault();
    const button = e.target.closest('button');
    if (!button) return;

    const {eventstatus, eventid} = button.dataset;
    try {
      const res = await patchData(`/api/v1/eventsresident/${eventid}`, { approved: eventstatus === 'approve' });
      if(res.status === 'success') {
        showAlert("success", `Event booking ${eventstatus === 'approve' ? "approved" : "disapproved"} successfully!`);
        await eventBookingList.render();
      }
    } catch(err) {
      showAlert("error", err.response?.data?.message || "An error occurred while processing the request.");
    }
  });

  eventBookingList.render();
}