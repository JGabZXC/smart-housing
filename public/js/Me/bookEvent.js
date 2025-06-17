/* eslint-disable */

import { buttonSpinner, spinner } from '../utils/spinner.js';
import { fetchData, postData } from '../utils/http.js';
import { showAlert } from '../utils/alerts.js';

const bookDetailsSection = document.querySelector("#bookDetailsSection");
const eventBookedTable = document.querySelector("#eventBookedTable");
const eventTableBody = document.querySelector("#eventTableBody");
const bookEventPlace = document.querySelector("#bookEventPlace");
const buttonEventSubmit = document.querySelector("#buttonEventSubmit");

async function bookEvent() {
  spinner(eventTableBody, "Loading");

  try {
    const res = await fetchData("api/v1/eventsresident/myevent");
    const data = res.data;
    eventTableBody.innerHTML = "";

    data.doc.length > 0 ? data.doc.map((event) => {
      const eventDate = new Date(event.date);
      const formattedDate = eventDate.toLocaleString('en-PH', {
        year: 'numeric',
        month: 'long',
        day: '2-digit',
        hour12: true,
        hour: '2-digit',
        minute: '2-digit',
      });

      const row =`
        <tr>
          <td>${formattedDate}</td>
          <td>${event.place}</td>
          <td>${event.approved ? "Approved" : "Pending"}</td>
        </tr>
      `
      eventTableBody.innerHTML += row;
    }) : eventTableBody.innerHTML = `
        <tr>
          <td colspan="100%" class="text-slate-600">No events booked</td>
        </tr>`;
  } catch(err) {
    showAlert("error", err.response?.data?.message || err.message || "An error occurred while fetching events.");
  }
}

if(bookDetailsSection) {
  bookEvent();

  bookEventPlace.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const { place, date, time } = Object.fromEntries(formData.entries());

    const newDate = new Date(`${date}T${time}`);

    try {
      buttonSpinner(buttonEventSubmit, "Book Event", "Booking");
      const res = await postData("/api/v1/eventsresident", {
        date: newDate,
        place,
      });

      if(res.status === "success") {
        showAlert("success", "Event booked successfully.");
        bookEventPlace.reset();
        await bookEvent();
      } else {
        throw new Error(res.message || "Failed to book event.");
      }
    } catch(err) {
      showAlert("error", err.response?.data?.message || err.message || "An error occurred while booking the event.");
    } finally {
      buttonSpinner(buttonEventSubmit, "Book Event", "Booking");
    }
  })
}