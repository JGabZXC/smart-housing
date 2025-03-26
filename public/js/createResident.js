/* eslint-disable */

import axios from "axios";
import { showAlert } from './alerts';

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
      createResidentSubmitButton.disabled = true;
      createResidentSubmitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Submitting...';
      const res = await axios({
        method: 'POST',
        url: `/api/v1/users/signup`,
        data: {
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
        }
      })

      if(res.data.status === 'success') showAlert(res.data.message, 'success');
      createResidentForm.reset();
      createResidentSubmitButton.disabled = false;
      createResidentSubmitButton.innerHTML = 'Create Resident';
    } catch (err) {
      createResidentSubmitButton.disabled = false;
      createResidentSubmitButton.innerHTML = 'Create Resident';
      showAlert('error', err.response.data.message)
      console.error(err.response.data.message)
    }
  });
}