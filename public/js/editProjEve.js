/* eslint-disable */
import axios from 'axios';
const editProjEve = document.querySelector('#editProjEve');
const formEditProjEve = document.querySelector('#formEditProjEve');
const featuredCheckbox = document.getElementById('featured');


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
    let body = {};
    let url = '';
    console.log(formData.get('time'));

    const imageCoverFile = formData.get('imageCover');
    const imageCover = imageCoverFile && imageCoverFile.size > 0 ? imageCoverFile : null;

    const imagesFiles = formData.getAll('images');
    const images = imagesFiles.length && imagesFiles[0].size > 0 ? imagesFiles : null;
    
    const finalFormData = new FormData();

    if (imageCover) {
      finalFormData.append('imageCover', imageCover);
    }

    if (images) {
      images.forEach(file => finalFormData.append('images', file));
    }

    const finalDate = `${formData.get('date')}T${formData.get('time')}`

    finalFormData.append('name', formData.get('title'));
    finalFormData.append('place', formData.get('place'));
    finalFormData.append('date', finalDate);
    finalFormData.append('richDescription', formData.get('summary'));
    finalFormData.append('description', formData.get('description'));
    finalFormData.append('isFeatured', featuredCheckbox.checked);
    if(type === 'event') {
      if (imageCover) body.imageCover = imageCover;
      if (images) body.images = images;
      url = `/api/v1/events/${editProjEve.dataset.id}`;

      try {
        const response = await axios({
          method: 'PATCH',
          url,
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          data: finalFormData,
        });

        console.log(response);
      } catch (err) {
        console.error(err);
      }
    }
  })
}
