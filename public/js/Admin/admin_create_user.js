/* eslint-disable */

import { showAlert } from '../utils/alerts.js';
import { buttonSpinner } from '../utils/spinner.js';
import { postData } from '../utils/http.js';

const createResidentForm = document.querySelector('#createResidentForm');
const createResidentSubmitButton = document.querySelector('#createResidentSubmitButton');

if(createResidentForm) {
  createResidentForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.querySelector('#name').value;
    const contactNumber = document.querySelector('#contactNumber').value;
    const email = document.querySelector('#email').value;
    const phase = +document.querySelector('#phase').value;
    const block = +document.querySelector('#block').value;
    const lot = +document.querySelector('#lot').value;
    const street = document.querySelector('#street').value;
    const password = document.querySelector('#password').value;
    const confirmPassword = document.querySelector('#confirmPassword').value;

    try {
      buttonSpinner(createResidentSubmitButton, 'Create Resident', 'Submitting');
      const res = await postData('/api/v1/users/signup', {
        name,
        contactNumber,
        email,
        address: {
          phase,
          block,
          lot,
          street,
        },
        password,
        confirmPassword,
      });

      if(res.status === 'success') showAlert(res.data.message, 'success');
      createResidentForm.reset();
    } catch (err) {
      showAlert('error', err.response.data.message)
      console.error(err.response.data.message)
    } finally {
      buttonSpinner(createResidentSubmitButton, 'Create Resident', 'Submitting')
    }
  });
}