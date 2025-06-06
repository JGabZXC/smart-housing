/* eslint-disable */

import axios from 'axios';
import { showAlert } from '../utils/alerts.js';
import { buttonSpinner} from '../utils/spinner.js';

const editProjEve = document.querySelector('#editProjEve');
const formEditProjEve = document.querySelector('#formEditProjEve');
const featuredCheckbox = document.getElementById('featured');
const editProjEveButton = document.getElementById('editProjEveButton');

if (editProjEve) {
  const { type } = editProjEve.dataset;

  if(type === "event") {
    const place = editProjEve.dataset.place;
    const time = editProjEve.dataset.time;
    const date = new Date(`1970-01-01T${time}`);
    const localTime = date.toTimeString().slice(0, 5); // "HH:MM"
    const markup = `
      <div>
           <label for="place" class="form-label" >Place</label>
           <input type="text" class="form-control" id="place" name="place" value="${place}" required />
       </div>
       <div>
           <label for="time" class="form-label">Time</label>
           <input type="time" class="form-control" id="time" name="time" value="${localTime}" required />
       </div>
    `
    formEditProjEve.insertAdjacentHTML('afterbegin', markup);
  }

  formEditProjEve.addEventListener('submit', async(e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    let url = '';

    const imageCoverFile = formData.get('imageCover');
    const imageCover = imageCoverFile && imageCoverFile.size > 0 ? imageCoverFile : null;

    const imagesFiles = formData.getAll('images');
    const images = imagesFiles.length && imagesFiles[0].size > 0 ? imagesFiles : null;

    const finalFormData = new FormData();

    let finalDate = formData.get('date');
    finalFormData.append('name', formData.get('title'));
    finalFormData.append('richDescription', formData.get('summary'));
    finalFormData.append('description', formData.get('description'));
    finalFormData.append('isFeatured', featuredCheckbox.checked);

    if (imageCover) {
      finalFormData.append('imageCover', imageCover);
    }

    if (images) {
      images.forEach(file => finalFormData.append('images', file));
    }

    let slug =  editProjEve.dataset.slug;

    if(type === 'event') {
      finalDate = `${formData.get('date')}T${formData.get('time')}`
      finalFormData.append('place', formData.get('place'));
      url = `/api/v1/events/${editProjEve.dataset.id}`;
    }

    if(type === 'projects') {
      url = `/api/v1/projects/${editProjEve.dataset.id}`;
    }

    finalFormData.append('date', finalDate);


    try {
      buttonSpinner(editProjEveButton, 'Update', 'Updating');
      const response = await axios({
        method: 'PATCH',
        url,
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        data: finalFormData,
      });

      if(response.data.status === 'success') showAlert(response.data.message, 'Updated successfully.');
      setTimeout(() => {
        window.location.href = `/${type}/${slug}`;
      }, 2000);
    } catch (err) {
      console.error(err);
    } finally {
      buttonSpinner(editProjEveButton, 'Update', 'Updating')
    }

  })
}