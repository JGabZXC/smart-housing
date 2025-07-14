/* eslint-disable */
import PaginatedList from '../utils/PaginatedList.js';
import { postData } from '../utils/http.js';
import { showAlert } from '../utils/alerts.js';
import { buttonSpinner } from '../utils/spinner.js';

const eventListContainer = document.querySelector('#event-list-container');
const eventListPagination = document.querySelector('#event-list-pagination');
const attendEventSingle = document.querySelector('#attendEventSingle');
const attendEventIndex = document.querySelector('#attendEventIndex');
const viewAttendeesBtn = document.querySelector('#viewAttendeesBtn');
const viewAttendeesBtnSpan = document.querySelector('#viewAttendeesBtn span');
const attendeesModal = document.querySelector('#attendeesModal');
const attendeesList = document.querySelector('#attendees-list');

function createAttendeeElement(attendee) {
  return `
    <div class="list-group-item d-flex justify-content-between align-items-center">
      <div>
        <h6 class="mb-1">${attendee.name} <br/> ${attendee.email}</h6>
        <small class="text-muted">${attendee.contactNumber || 'No contact number'}</small>
      </div>
    </div>
  `;
}

if (viewAttendeesBtn) {
  viewAttendeesBtn.addEventListener('click', async () => {

    // Show modal
    const modal = new bootstrap.Modal(attendeesModal);
    modal.show();
  });
}

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

      console.log(response);

      if(response.status === 'success') {
        status = !status;
        eventButton.dataset.attended = status;
        showAlert('success', status
          ? 'You have successfully attended the event.'
          : 'You have successfully left the event.'
        );
        attendeesList.innerHTML = '';
        viewAttendeesBtnSpan.innerHTML = response.data.updatedEvent.attendees.length;
        response.data.updatedEvent.attendees.forEach(attendee => {
          attendeesList.insertAdjacentHTML('beforeend', createAttendeeElement(attendee));
        });
      }
    } catch(err) {
      showAlert('error', err.response?.data?.message || 'Failed to attend the event. Please try again later.');
    } finally {
      buttonSpinner(eventButton, status ? "Leave Event" : "Attend Event", 'Submitting');
    }
  });
}