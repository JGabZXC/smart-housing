/* eslint-disable */
import PaginatedList from '../utils/PaginatedList.js';
import { postData } from '../utils/http.js';
import { showAlert } from '../utils/alerts.js';
import { buttonSpinner } from '../utils/spinner.js';

const eventListContainer = document.querySelector('#event-list-container');
const eventListPagination = document.querySelector('#event-list-pagination');
const attendEventSingle = document.querySelector('#attendEventSingle');
const attendEventIndex = document.querySelector('#attendEventIndex');

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

if(attendEventSingle || attendEventIndex) {
  const eventButton = document.querySelector('.attend-button');
  eventButton.addEventListener('click', async () => {
    const { eventid, attended} = eventButton.dataset;
    let status = attended === 'true';
    try {
      buttonSpinner(eventButton, status ? "Leave Event" : "Attend Event", 'Submitting');
      const response = await postData(`/api/v1/events/${eventid}/attend?type=${status ? 'leave' : 'attend'}`);

      if(response.status === 'success') {
        status = !status;
        eventButton.dataset.attended = status;
        // Show correct alert message
        showAlert('success', status
          ? 'You have successfully attended the event.'
          : 'You have successfully left the event.'
        );
      }
    } catch(err) {
      showAlert('error', err.response?.data?.message || 'Failed to attend the event. Please try again later.');
    } finally {
      buttonSpinner(eventButton, status ? "Leave Event" : "Attend Event", 'Submitting');
    }
  });
}