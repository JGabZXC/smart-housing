/* eslint-disable */

// public/js/Admin/garbageCollection.js
import { showAlert } from '../utils/alerts.js';
import { fetchData, patchData, postData } from '../utils/http.js';

const garbageCollectionSection = document.querySelector('#garbageCollectionSection');

class GarbageCollectionManager {
  constructor() {
    this.garbageForm = document.getElementById('garbageForm');
    this.garbageList = document.getElementById('garbageList');
    this.modal = new bootstrap.Modal(document.getElementById('garbageModal'));

    this.setupEventListeners();
    this.loadCollections();
  }

  setupEventListeners() {
    // Form submission
    this.garbageForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleFormSubmit();
    });

    // Event delegation for street buttons
    document.getElementById('streetInputs').addEventListener('click', (e) => {
      if (e.target.matches('.add-street')) {
        this.addStreetInput();
      }
      if (e.target.matches('.remove-street')) {
        e.target.closest('.input-group').remove();
      }
    });

    // Event delegation for edit/delete buttons
    this.garbageList.addEventListener('click', (e) => {
      if (e.target.matches('.edit-time-location')) {
        this.handleEdit(e.target.dataset);
      }
      if (e.target.matches('.delete-time-location')) {
        this.handleDelete(e.target.dataset);
      }
      if (e.target.matches('.add-day')) {
        this.handleAddDay(e.target.dataset.garbageId);
      }
      if (e.target.matches('.add-time')) {
        this.handleAddTime(e.target.dataset);
      }
    });

    // Reset form when modal is hidden
    document.getElementById('garbageModal').addEventListener('hidden.bs.modal', () => {
      this.resetForm();
    });
  }

  async handleAddDay(garbageId) {
    document.getElementById('garbageId').value = garbageId;
    document.getElementById('scheduleId').value = '';
    document.getElementById('timeLocationId').value = '';

    const garbageData = await fetchData(`/api/v1/garbages/${garbageId}`);
    document.getElementById('phase').value = garbageData.data.doc.phase;

    // Clear other fields
    document.getElementById('day').value = '';
    document.getElementById('timeFrom').value = '';
    document.getElementById('timeTo').value = '';
    this.resetForm();

    document.querySelector('#modalTitle').textContent = `Add Day for Phase ${garbageData.data.doc.phase}`;
    document.querySelector('#timeContainer').style.display = 'none';
    document.querySelector('#streetContainer').style.display = 'none';
    document.querySelector('#dayContainer').style.display = 'block';
    document.querySelector('#phaseContainer').style.display = 'none';

    this.modal.show();
  }

  async handleAddTime({ garbageId, scheduleId }) {
    document.getElementById('garbageId').value = garbageId;
    document.getElementById('scheduleId').value = scheduleId;
    document.getElementById('timeLocationId').value = '';

    const garbageData = await fetchData(`/api/v1/garbages/${garbageId}`);
    const schedule = garbageData.data.doc.schedule.find(s => s._id === scheduleId);

    document.getElementById('phase').value = garbageData.data.doc.phase;
    document.getElementById('day').value = schedule.day;
    document.getElementById('timeFrom').value = '';
    document.getElementById('timeTo').value = '';
    this.resetForm();

    document.querySelector('#modalTitle').textContent = `Add Time for ${schedule.day}`;
    document.querySelector('#timeContainer').style.display = 'block';
    document.querySelector('#streetContainer').style.display = 'block';
    document.querySelector('#dayContainer').style.display = 'none';
    document.querySelector('#phaseContainer').style.display = 'none';

    this.modal.show();
  }

  async loadCollections() {
    try {
      const data = await fetchData('/api/v1/garbages');
      this.renderCollections(data.data.doc);
    } catch (err) {
      showAlert('error', err.message);
    }
  }

  renderCollections(collections) {
    this.garbageList.innerHTML = collections.map(garbage => `
      <div class="card mb-3">
        <div class="card-header bg-light d-flex justify-content-between align-items-center">
          <h5 class="card-title mb-0">Phase ${garbage.phase}</h5>
          <button class="btn btn-sm btn-success add-day" data-garbage-id="${garbage._id}">
            Add Day
          </button>
        </div>
        <div class="card-body">
          ${garbage.schedule.map(schedule => `
            <div class="mb-3">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <h6 class="mb-0">${schedule.day}</h6>
                <button class="btn btn-sm btn-primary add-time" 
                  data-garbage-id="${garbage._id}"
                  data-schedule-id="${schedule._id}">
                  Add Time
                </button>
              </div>
              <table class="table table-sm">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Streets</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  ${schedule.timeLocation.map(loc => `
                    <tr>
                      <td>${loc.time}</td>
                      <td>${loc.street.join(', ')}</td>
                      <td>
                        <button class="btn btn-sm btn-outline-primary edit-time-location"
                          data-garbage-id="${garbage._id}"
                          data-schedule-id="${schedule._id}"
                          data-time-location-id="${loc._id}">
                          Edit
                        </button>
                        <button class="btn btn-sm btn-outline-danger delete-time-location"
                          data-garbage-id="${garbage._id}"
                          data-schedule-id="${schedule._id}"
                          data-time-location-id="${loc._id}">
                          Delete
                        </button>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('');
  }

  async handleFormSubmit() {
    const formData = this.getFormData();

    try {
      let response;
      if (formData.timeLocationId) {
        const body = {
          timeLocation: {
            "street": formData.timeLocation.street,
          }
        }
        // Update existing time location
        response = await patchData(
          `/api/v1/garbages/schedule/${formData.garbageId}/${formData.scheduleId}/${formData.timeLocationId}`,
          formData
        );
      } else if (formData.scheduleId) {
        // Add new time location to existing schedule
        response = await patchData(
          `/api/v1/garbages/schedule/${formData.garbageId}/${formData.scheduleId}`,
          formData
        );
      } else {
        const body = {
          phase: formData.phase,
          schedule: {
            day: formData.day,
            timeLocation: {
              time: formData.timeLocation.time,
              street: formData.timeLocation.street
            }
          }
        }
        // Create new garbage collection
        response = await postData('/api/v1/garbages', body);
      }

      this.modal.hide();
      this.loadCollections();
      showAlert('success', 'Collection updated successfully');
    } catch (err) {
      showAlert('error', err.message);
    }
  }

  getFormData() {
    return {
      garbageId: document.getElementById('garbageId').value,
      scheduleId: document.getElementById('scheduleId').value,
      timeLocationId: document.getElementById('timeLocationId').value,
      phase: document.getElementById('phase').value,
      day: document.getElementById('day').value,
      timeLocation: {
        time: `${document.getElementById('timeFrom').value}-${document.getElementById('timeTo').value}`,
        street: Array.from(document.querySelectorAll('.street-input'))
          .map(input => input.value)
          .filter(Boolean)
      }
    };
  }

  addStreetInput() {
    const div = document.createElement('div');
    div.className = 'input-group mb-2';
    div.innerHTML = `
    <input type="text" class="form-control street-input" required>
    <button type="button" class="btn btn-outline-danger remove-street">-</button>
  `;
    document.getElementById('streetInputs').appendChild(div);
  }

  resetForm() {
    this.garbageForm.reset();
    document.getElementById('garbageId').value = '';
    document.getElementById('scheduleId').value = '';
    document.getElementById('timeLocationId').value = '';
    document.getElementById('streetInputs').innerHTML = `
      <div class="input-group mb-2">
        <input type="text" class="form-control street-input" required>
        <button type="button" class="btn btn-outline-secondary add-street">+</button>
      </div>
    `;

    if (!document.getElementById('garbageId').value) {
      document.querySelector('#modalTitle').textContent = 'Add Collection';
      document.querySelector('#phaseContainer').style.display = 'block';
      document.querySelector('#dayContainer').style.display = 'block';
      document.querySelector('#timeContainer').style.display = 'block';
      document.querySelector('#streetContainer').style.display = 'block';
    }

    // Reset street inputs
    document.getElementById('streetInputs').innerHTML = `
      <div class="input-group mb-2">
        <input type="text" class="form-control street-input" required>
        <button type="button" class="btn btn-outline-secondary add-street">+</button>
      </div>
    `;
  }

  async handleDelete({ garbageId, scheduleId, timeLocationId }) {
    // Create and show confirmation modal
    const confirmModal = `
    <div class="modal fade" id="deleteConfirmModal" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header bg-danger text-white">
            <h5 class="modal-title">Delete Confirmation</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <p>Are you sure you want to delete this time location?</p>
            <p>This action cannot be undone.</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-danger" id="confirmDelete">Delete</button>
          </div>
        </div>
      </div>
    </div>
  `;

    document.body.insertAdjacentHTML('beforeend', confirmModal);
    const deleteModal = new bootstrap.Modal(document.getElementById('deleteConfirmModal'));
    deleteModal.show();

    // Handle delete confirmation
    document.getElementById('confirmDelete').addEventListener('click', async () => {
      try {
        await fetch(
          `/api/v1/garbages/schedule/${garbageId}/${scheduleId}/${timeLocationId}`,
          {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );

        deleteModal.hide();
        document.getElementById('deleteConfirmModal').remove();

        // Show success notification modal
        this.showNotificationModal('Success', 'Time location deleted successfully', 'success');
        this.loadCollections();
      } catch (err) {
        deleteModal.hide();
        document.getElementById('deleteConfirmModal').remove();
        this.showNotificationModal('Error', 'Error deleting time location', 'danger');
      }
    });

    // Clean up modal when hidden
    document.getElementById('deleteConfirmModal').addEventListener('hidden.bs.modal', function () {
      this.remove();
    });
  }

  async handleEdit({ garbageId, scheduleId, timeLocationId }) {
    try {
      const data = await fetchData(`/api/v1/garbages/${garbageId}`);
      const garbage = data.data.doc;

      const schedule = garbage.schedule.find(s => s._id === scheduleId);
      const timeLocation = schedule.timeLocation.find(t => t._id === timeLocationId);

      // Set form values
      document.getElementById('garbageId').value = garbageId;
      document.getElementById('scheduleId').value = scheduleId;
      document.getElementById('timeLocationId').value = timeLocationId;
      document.getElementById('phase').value = garbage.phase;
      document.getElementById('day').value = schedule.day;

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
      this.showNotificationModal('Error', 'Error loading time location data', 'danger');
    }
  }

// Add this helper method to your class
  showNotificationModal(title, message, type) {
    const notificationModal = `
    <div class="modal fade" id="notificationModal" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header bg-${type} text-white">
            <h5 class="modal-title">${title}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <p>${message}</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
          </div>
        </div>
      </div>
    </div>
  `;

    document.body.insertAdjacentHTML('beforeend', notificationModal);
    const modal = new bootstrap.Modal(document.getElementById('notificationModal'));
    modal.show();

    // Clean up modal when hidden
    document.getElementById('notificationModal').addEventListener('hidden.bs.modal', function () {
      this.remove();
    });
  }
}

// Initialize the manager
if(garbageCollectionSection) {
  new GarbageCollectionManager();
}