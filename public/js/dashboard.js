/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';
import { getProjects } from './projects';
import { getEvents } from './events';

const projectCreateButton = document.querySelector('#project-create-button');
const eventCreateButton = document.querySelector('#event-create-button');
const modalDashboard = document.querySelector('#modalDashboard');
const modalDeleteDashboard = document.querySelector('#modalDeleteDashboard');
const modalDashboardForm = document.querySelector('#createDashboardForm');
const saveBtnDashboard = document.querySelector('#saveBtnDashboard');
const deleteBtnDashboard = document.querySelector('#deleteBtnDashboard');

const projectTable = document.querySelector('#admin-project-tablebody-list');
const eventTable = document.querySelector('#admin-event-tablebody-list');

let existingModal, existingModalDelete;
if(modalDashboard) existingModal = new bootstrap.Modal(modalDashboard);
if(modalDeleteDashboard) existingModalDelete = new bootstrap.Modal(modalDeleteDashboard);

async function submitProjectForm(e) {
  e.preventDefault();

  const name = document.querySelector('#name').value;
  const date = document.querySelector('#date').value;
  const summary = document.querySelector('#richDescription').value;
  const description = document.querySelector('#description').value;
  const imageCover = document.querySelector('#imageCover').files;
  const images = document.querySelector('#images').files;

  const formData = new FormData();
  formData.append('name', name);
  formData.append('date', date);
  formData.append('richDescription', summary);
  formData.append('description', description);
  if (imageCover && imageCover.length > 0) {
    formData.append(`imageCover`, imageCover[0]);
  }
  if (images && images.length > 0) {
    for (let i = 0; i < images.length; i++) {
      formData.append(`images`, images[i]);
    }
  }

  try {
    saveBtnDashboard.disabled = true;
    saveBtnDashboard.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Creating...';
    const res = await axios({
      method: 'POST',
      url: 'api/v1/projects',
      data: formData,
    });
    const data = res.data;

    if (data.status === 'success') showAlert('success', 'Project created successfully!');

    existingModal.hide();
    saveBtnDashboard.disabled = false;
    saveBtnDashboard.innerHTML = 'Create';
    await getProjects();
  } catch (err) {
    showAlert('error', err.response.data.message);
    saveBtnDashboard.disabled = false;
    saveBtnDashboard.innerHTML = 'Create';
    console.log(err);
  }
}

async function submitEventForm(e) {
  e.preventDefault();

  const place = document.querySelector('#place').value;
  const name = document.querySelector('#name').value;
  const date = new Date(`${document.querySelector('#date').value}T${document.querySelector('#time').value}`);
  const summary = document.querySelector('#richDescription').value;
  const description = document.querySelector('#description').value;
  const imageCover = document.querySelector('#imageCover').files;
  const images = document.querySelector('#images').files;


  const formData = new FormData();
  formData.append('name', name);
  formData.append('date', date);
  formData.append('richDescription', summary);
  formData.append('description', description);
  formData.append('place', place);
  if (imageCover && imageCover.length > 0) {
    formData.append(`imageCover`, imageCover[0]);
  }
  if (images && images.length > 0) {
    for (let i = 0; i < images.length; i++) {
      formData.append(`images`, images[i]);
    }
  }

  try {
    saveBtnDashboard.disabled = true;
    saveBtnDashboard.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Creating...';
    const res = await axios({
      method: 'POST',
      url: 'api/v1/events',
      data: formData,
    });
    const data = res.data;

    if (data.status === 'success') showAlert('success', 'Event created successfully!');

    existingModal.hide();
    saveBtnDashboard.disabled = false;
    saveBtnDashboard.innerHTML = 'Create';
    await getEvents();
  } catch (err) {
    showAlert('error', err.response.data.message);
    saveBtnDashboard.disabled = false;
    saveBtnDashboard.innerHTML = 'Create';
    console.log(err);
  }
}

if(projectCreateButton) {
  projectCreateButton.addEventListener('click', () => {
    modalDashboard.classList.add('add-project-modal');

    modalDashboardForm.addEventListener('submit', submitProjectForm);
  });
}

if(eventCreateButton) {
  eventCreateButton.addEventListener('click', () => {
    const modalBody = document.querySelector('.modal-body');
    const markup =
      `
      <div class="mb-3">
           <label for="place" class="form-label">Place</label>
           <input type="text" class="form-control" id="place" name="place" required />
       </div>
       <div class="mb-3">
           <label for="time" class="form-label">Time</label>
           <input type="time" class="form-control" id="time" name="time" required />
       </div>
      `
    modalDashboard.classList.add('add-event-modal');
    modalBody.insertAdjacentHTML('afterbegin', markup);

    modalDashboardForm.addEventListener('submit', submitEventForm);
  });
}

if(projectTable) {
  projectTable.addEventListener('click', async (e) => {
    if(e.target.nodeName.toLowerCase() === 'button') {
      const projectId = e.target.dataset.id;
      const titleText = e.target.dataset.title;
      const deleteModal = document.querySelector('#deleteDashboardForm');
      const title = document.querySelector("#title");

      title.innerHTML = titleText;

      deleteModal.addEventListener('submit', async(e) => {
        e.preventDefault();
        try {
          deleteBtnDashboard.disabled = true;
          deleteBtnDashboard.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Deleting...';
          const res = await axios({
            method: 'DELETE',
            url: `api/v1/projects/${projectId}`
          })

          if(res.status === 204) {
            showAlert('success', 'Project deleted successfully!');
            await getProjects();
          }
          existingModalDelete.hide();
          deleteBtnDashboard.disabled = false;
          deleteBtnDashboard.innerHTML = 'Confirm';
        } catch (err) {
          console.error(err);
          showAlert('error', err.response.data.message);
          deleteBtnDashboard.disabled = false;
          deleteBtnDashboard.innerHTML = 'Confirm';
        }
      });
    }
  })
}

if(eventTable) {
  eventTable.addEventListener('click', async (e) => {
    if(e.target.nodeName.toLowerCase() === 'button') {
      const eventId = e.target.dataset.id;
      const titleText = e.target.dataset.title;
      const deleteModal = document.querySelector('#deleteDashboardForm');
      const title = document.querySelector("#title");

      title.innerHTML = titleText;

      deleteModal.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
          deleteBtnDashboard.disabled = true;
          deleteBtnDashboard.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Deleting...';
          const res = await axios({
            method: 'DELETE',
            url: `api/v1/events/${eventId}`
          })

          if (res.status === 204) showAlert('success', 'Event deleted successfully!');
          existingModalDelete.hide();
          await getEvents();
          deleteBtnDashboard.disabled = false;
          deleteBtnDashboard.innerHTML = 'Confirm';
        } catch (err) {
          console.error(err);
          showAlert('error', err.response.data.message);
          deleteBtnDashboard.disabled = false;
          deleteBtnDashboard.innerHTML = 'Confirm';
        }
      });
    }
  })
}

if(modalDashboard) {
  modalDashboard.addEventListener('hidden.bs.modal', () => {
    // remove existing event listener on form
    modalDashboardForm.removeEventListener('submit', submitProjectForm);
    modalDashboardForm.removeEventListener('submit', submitEventForm);

    const place = document.querySelector('#place');
    const time = document.querySelector('#time');

    if(place) {
      place.parentElement.remove();
      time.parentElement.remove();
    }

    if (modalDashboard.classList.contains('add-project-modal') || modalDashboard.classList.contains('add-event-modal')) {
      modalDashboard.classList.remove('add-project-modal');
      modalDashboard.classList.remove('add-event-modal');
    }
    modalDashboardForm.reset();
  });
}
