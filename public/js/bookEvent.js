/* eslint-disable */
import axios from "axios";
import { showAlert } from './alerts';
import { buttonSpinner } from './_eventAndProjHelper';
const eventBookedTable = document.querySelector("#eventBookedTable");
const eventTableBody = document.querySelector("#eventTableBody");
const bookEventPlace = document.querySelector("#bookEventPlace");
const buttonEventSubmit = document.querySelector("#buttonEventSubmit");

async function bookEvent() {
  // Authenticated in the backend
  eventTableBody.innerHTML = "";
  try {
    const response = await axios({
      method: "GET",
      url: "/api/v1/eventsresident/myevent"
    })

    const data = response.data;

    if(data.status !== "success") throw new Error(data.message);

    if(data.data.doc.length === 0) {
      eventTableBody.innerHTML = `<tr><td colspan="5" class="text-center">No events booked</td></tr>`;
      return;
    }

    data.data.doc.forEach(event => {
      const eventDate = new Date(event.date);
      const formattedDate = eventDate.toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: '2-digit',
        hour12: true,
        hour: '2-digit',
        minute: '2-digit',
      });

      const row = `
        <tr>
          <td>${formattedDate}</td>
          <td>${event.place}</td>
          <td>${event.approved ? "Approved" : "Pending"}</td>
        </tr>
      `;
      eventTableBody.insertAdjacentHTML("beforeend", row);
    })

  } catch(err) {
    showAlert("error", err.message);
  }
}

if(eventBookedTable) {
  bookEvent();
}

if(bookEventPlace) {
  console.log(bookEventPlace);
  bookEventPlace.addEventListener("submit", async(e) => {
    e.preventDefault();
    const formData = new FormData(bookEventPlace);
    const { place, date, time } =Object.fromEntries(formData.entries());

    const newDate = new Date(`${date}T${time}`)

    try {
      buttonSpinner(buttonEventSubmit, "Book Event Place", "Submitting...");
      const response = await axios({
        method: "POST",
        url: "/api/v1/eventsresident",
        data: {
          date: newDate,
          place,
        }
      })

      if(response.data.status !== "success") throw new Error(response.data.message || "Failed to submit application");

      showAlert("success", "Event booked successfully");
      bookEvent();
    } catch(err) {
      if (err?.response.data.message) err.message = err.response.data.message;

      showAlert("error", err.message);
    } finally {
      buttonSpinner(buttonEventSubmit, "Book Event Place", "Submitting...");
    }
  })
}