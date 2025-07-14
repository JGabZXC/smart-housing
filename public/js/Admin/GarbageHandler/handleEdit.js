/* eslint-disable */

import { fetchData } from '../../utils/http.js';

async function handleEdit({ garbageId, scheduleId, timeLocationId }, type) {
  try {
    document.getElementById('garbageId').value = garbageId;
    document.getElementById('scheduleId').value = scheduleId;
    document.getElementById('timeLocationId').value = timeLocationId;
    const data = await fetchData(`/api/v1/garbages/${garbageId}`);
    const garbage = data.data.doc;

    const schedule = garbage.schedule.find(s => s._id === scheduleId);
    const timeLocation = schedule.timeLocation.find(t => t._id === timeLocationId);

    document.querySelector('#modalTitle').textContent = `Edit Time ${timeLocation.time}`;
    document.querySelector('#timeContainer').style.display = 'block';
    document.querySelector('#streetContainer').style.display = 'block';
    document.querySelector('#dayContainer').style.display = 'none';
    document.querySelector('#phaseContainer').style.display = 'none';
    const typeInput = document.createElement('input');
    typeInput.type = 'hidden';
    typeInput.id = 'type';
    typeInput.value = type;
    document.querySelector('#phaseContainer').appendChild(typeInput);
    this.checkRequiredForm();

    // Set time values
    const [timeFrom, timeTo] = timeLocation.time.split('-');
    document.getElementById('timeFrom').value = timeFrom;
    document.getElementById('timeTo').value = timeTo;

    // Set street inputs
    const streetInputs = document.getElementById('streetInputs');
    streetInputs.innerHTML = timeLocation.street
      .map((street, index) => `
        <div class="input-group mb-2">
          <input type="text" class="form-control street-input" value="${street}" required>
          ${index === 0
        ? '<button type="button" class="btn btn-outline-secondary add-street">+</button>'
        : '<button type="button" class="btn btn-outline-danger remove-street">-</button>'
      }
        </div>
      `)
      .join('');

    this.modal.show();
  } catch (err) {
    console.log(err);
    this.showNotificationModal('Error', 'Error loading time location data', 'danger');
  }
}

export default handleEdit;