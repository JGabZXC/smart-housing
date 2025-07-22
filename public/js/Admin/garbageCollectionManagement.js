/* eslint-disable */

// public/js/Admin/garbageCollection.js
import { showAlert } from '../utils/alerts.js';
import { deleteData, fetchData, patchData, postData } from '../utils/http.js';
import collectionTemplate from './GarbageHandler/collectionTemplate.js';
import handleEditTimeLocation from './GarbageHandler/handleEdit.js';
import { buttonSpinner, spinner } from '../utils/spinner.js';
import { deleteModalFunc } from './GarbageHandler/deleteModal.js';

const garbageCollectionSection = document.querySelector('#garbageCollectionSection');

class GarbageCollectionManager {
  constructor() {
    this.garbageForm = document.getElementById('garbageForm');
    this.garbageList = document.getElementById('garbageList');
    this.modal = new bootstrap.Modal(document.getElementById('garbageModal'));

    this.setupEventListeners();
    this.loadCollections();

    // Add reset form behavior before modal closes
    document.getElementById('garbageModal').addEventListener('hide.bs.modal', () => {
      this.resetForm();
    });
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
        this.handleEdit(e.target.dataset, "edit");
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
      if(e.target.matches('.edit-name')) {
        this.handleEditName(e.target.dataset);
      }
      if(e.target.matches('.edit-phase-number')) {
        this.handleEditPhaseNumber(e.target.dataset.garbageId);
      }
      if(e.target.matches('.delete-phase-number')) {
        this.handleDeletePhase(e.target.dataset.garbageId);
      }
      if(e.target.matches('.delete-day')) {
        this.handleDeleteDay(e.target.dataset);
      }
    });

    // Reset form when modal is hidden
    document.getElementById('garbageModal').addEventListener('hidden.bs.modal', () => {
      this.resetForm();
    });
  }

  async loadCollections() {
    spinner(this.garbageList, "Fetching collections");
    try {
      const data = await fetchData('/api/v1/garbages');
      this.renderCollections(data.data.doc);
    } catch (err) {
      this.garbageList.innerHTML = "<div class='text-center text-slate-600 p-2'><h2>Something went wrong.</h2></div>";
      showAlert('error', err.message);
    }
  }

  renderCollections(collections) {
    collectionTemplate.call(this, collections);
  }

  async handleFormSubmit() {
    const formData = this.getFormData();
    const saveBtnCollection = document.querySelector("#saveBtnCollection");

    const body = {
      phase: formData.phase,
      schedule: {
        day: formData.day,
        timeLocation: {
          time: formData.timeLocation.time,
          street: formData.timeLocation.street
        }
      }
    };

    try {
      buttonSpinner(saveBtnCollection, "Save", "Saving");
      if(body.phase && body.schedule.day === '') {
        await patchData(`/api/v1/garbages/${formData.garbageId}`, {
          phase: body.phase
        });
      } else if(body.schedule.day && formData.garbageId && formData.scheduleId && body.phase === '') {
        // Edit existing day name - pass day directly, not wrapped in schedule object
        await patchData(`/api/v1/garbages/schedule/${formData.garbageId}/${formData.scheduleId}`, {
          day: body.schedule.day
        });
      } else if(body.schedule.day && body.phase === '') {
        // Add new day - KEEP THIS AFTER THE EDIT CONDITION
        await postData(`/api/v1/garbages/schedule/${formData.garbageId}`, { schedule: { day: body.schedule.day } });
      } else if(body.schedule.timeLocation.time && body.schedule.timeLocation.street.length > 0 && body.phase === '') {
        console.log("else if")
        if(document.getElementById('type') && document.getElementById('type').value === 'edit') {
          await patchData(`/api/v1/garbages/schedule/${formData.garbageId}/${formData.scheduleId}/${formData.timeLocationId}`, { timeLocation: body.schedule.timeLocation });
        } else {
          await postData(`/api/v1/garbages/schedule/${formData.garbageId}/${formData.scheduleId}`, { timeLocation: body.schedule.timeLocation });
        }
      } else {
        await postData(`/api/v1/garbages`, body);
      }

      this.resetForm();
      this.modal.hide();
      this.loadCollections();
      showAlert('success', 'Collection updated successfully');
    } catch (err) {
      showAlert('error', err?.response?.data?.message || "Something went wrong with the request.");
    } finally {
      buttonSpinner(saveBtnCollection, "Save", "Saving");
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

  checkRequiredForm() {
    // Get all form inputs
    const inputs = this.garbageForm.querySelectorAll('input, select');

    // Set required attribute based on container visibility
    inputs.forEach(input => {
      const container = input.closest('div[id$="Container"]');
      if (container && container.style.display === 'none') {
        input.removeAttribute('required');
      } else {
        input.setAttribute('required', '');
      }
    });
  }

  resetForm() {
    this.garbageForm.reset();

    this.configureModalDisplay({
      title: 'Add Collection',
      showTime: true,
      showStreet: true,
      showDay: true,
      showPhase: true
    })

    // Reset street inputs
    document.getElementById('streetInputs').innerHTML = `
    <div class="input-group mb-2">
      <input type="text" class="form-control street-input" required>
      <button type="button" class="btn btn-outline-secondary add-street">+</button>
    </div>
  `;
  }

  // Helper method to configure modal display
  configureModalDisplay({ title, showTime = false, showStreet = false, showDay = false, showPhase = false }) {
    document.querySelector('#modalTitle').textContent = title;
    document.querySelector('#timeContainer').style.display = showTime ? 'block' : 'none';
    document.querySelector('#streetContainer').style.display = showStreet ? 'block' : 'none';
    document.querySelector('#dayContainer').style.display = showDay ? 'block' : 'none';
    document.querySelector('#phaseContainer').style.display = showPhase ? 'block' : 'none';
    this.checkRequiredForm();
  }

  // Helper method to set form values
  setFormValues({ garbageId = '', scheduleId = '', phase = '', day = '', timeFrom = '', timeTo = '', timeLocationId = '' }) {
    document.getElementById('garbageId').value = garbageId;
    document.getElementById('scheduleId').value = scheduleId;
    document.getElementById('phase').value = phase;
    document.getElementById('day').value = day;
    document.getElementById('timeFrom').value = timeFrom;
    document.getElementById('timeTo').value = timeTo;
    if (timeLocationId !== undefined) {
      document.getElementById('timeLocationId').value = timeLocationId;
    }
  }

  // Helper method to fetch garbage data
  async fetchGarbageData(garbageId) {
    const garbageData = await fetchData(`/api/v1/garbages/${garbageId}`);
    return garbageData.data.doc;
  }

  async handleDelete({ garbageId, scheduleId, timeLocationId }) {
    deleteModalFunc.call(this, "Time Location", `/api/v1/garbages/schedule/${garbageId}/${scheduleId}/${timeLocationId}`);
  }

  async handleEdit({ garbageId, scheduleId, timeLocationId }, type) {
    await handleEditTimeLocation.call(this, { garbageId, scheduleId, timeLocationId }, type);
  }

  async handleAddDay(garbageId) {
    const garbageData = await this.fetchGarbageData(garbageId);

    this.setFormValues({ garbageId });
    this.configureModalDisplay({
      title: `Add Day for Phase ${garbageData.phase}`,
      showDay: true
    });

    this.checkRequiredForm();
    this.modal.show();
  }

  async handleAddTime({ garbageId, scheduleId }) {
    const garbageData = await this.fetchGarbageData(garbageId);
    const schedule = garbageData.schedule.find(s => s._id === scheduleId);

    this.setFormValues({ garbageId, scheduleId });
    this.configureModalDisplay({
      title: `Add Time for ${schedule.day}`,
      showTime: true,
      showStreet: true
    });

    this.checkRequiredForm();
    this.modal.show();
  }

  async handleEditPhaseNumber(garbageId) {
    const garbageData = await this.fetchGarbageData(garbageId);

    this.setFormValues({
      garbageId,
      phase: garbageData.phase
    });

    this.configureModalDisplay({
      title: `Edit Phase Number (${garbageData.phase})`,
      showPhase: true
    });

    this.checkRequiredForm();
  }

  async handleEditName({ garbageId, scheduleId }) {
    this.resetForm();
    const garbageData = await this.fetchGarbageData(garbageId);
    const schedule = garbageData.schedule.find(s => s._id === scheduleId);

    this.setFormValues({
      garbageId,
      scheduleId,
      day: schedule.day,
    });

    this.configureModalDisplay({
      title: 'Edit Day Name',
      showDay: true
    });

    this.modal.show();
  }

  async handleDeletePhase(garbageId) {
    deleteModalFunc.call(this, "Phase", `/api/v1/garbages/${garbageId}`);
  }

  async handleDeleteDay({ garbageId, scheduleId }) {
    deleteModalFunc.call(this, "Schedule", `/api/v1/garbages/schedule/${garbageId}/${scheduleId}`);
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

    // Add reset form behavior before modal closes
    document.getElementById('notificationModal').addEventListener('hide.bs.modal', () => {
      this.resetForm();
      document.getElementById('notificationModal').remove();
    });

    modal.show();
  }
}

// Initialize the manager
if(garbageCollectionSection) {
  new GarbageCollectionManager();
}