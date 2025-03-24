/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';
import { getProjects } from './projects';

const projectCreateButton = document.querySelector('#project-create-button');
const eventCreateButton = document.querySelector('#event-create-button');
const modal = document.querySelector('#create');
const modalForm = document.querySelector('#create-form');
const saveBtn = document.querySelector('#save-btn');

if(projectCreateButton) {
  const existingModal = new bootstrap.Modal(modal);
  saveBtn.addEventListener('click', async () => {
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
      saveBtn.disabled = true;
      saveBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Creating...';
      const res = await axios({
        method: 'POST',
        url: 'api/v1/projects',
        data: formData,
      });
      const data = res.data;
      console.log(data);

      if(data.status === 'success') showAlert('success', 'Project created successfully!');

      existingModal.hide();
      saveBtn.disabled = false;
      saveBtn.innerHTML = 'Create';
      await getProjects();
    } catch (err) {
      showAlert('error', err.response.data.message);
      saveBtn.disabled = false;
      saveBtn.innerHTML = 'Create';
      console.log(err);
    }
  })
}

if(eventCreateButton) {
  // const place = document.querySelector('#place').value;
  eventCreateButton.addEventListener('click', (e) => {
    const markup =
      `
      <div class="mb-3">
           <label for="place" class="form-label">Place</label>
           <input type="text" class="form-control" id="place" name="place" required />
       </div>
      `
    modalForm.insertAdjacentHTML('afterbegin', markup);
  });
}

if(modal) {
  modal.addEventListener('hidden.bs.modal', () => {
    const place = document.querySelector('#place');

    if(place) {
      place.parentElement.remove();
    }
    modalForm.reset();
  });
}
