/* eslint-disable */

import axios from 'axios';
import { showAlert } from './alerts';

const updateSearchEmailForm = document.querySelector('#updateSearchEmailForm');
const searchEmailButton = document.querySelector('#searchEmailButton');

const updateResidentForm = document.querySelector('#updateResidentForm');
const updateResidentButton = document.querySelector('#updateResidentButton');

if(updateSearchEmailForm) {
  updateSearchEmailForm.addEventListener('submit', async(e) => {
    e.preventDefault();
    const email = document.querySelector('#searchEmail').value;

    if(email.trim() === '') return;
    try {
      const residentId = document.querySelector('#residentId');
      searchEmailButton.disabled = true;
      searchEmailButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Searching...';
      const res = await axios({
        method: 'POST',
        url: `/api/v1/getIds`,
        data: {
          type: "user",
          object: {
            email
          },
          message: 'No email was found',
        }
      });

      const data = res.data.data.doc[0];

      if(res.data.status === 'success') showAlert('success', 'Email was found!');
      residentId.value = data._id;
    } catch(err) {
      console.error(err);
      showAlert('error', err.response.data.message);
    } finally {
      searchEmailButton.disabled = false;
      searchEmailButton.innerHTML = 'Check';
    }
  })
}

if(updateResidentForm) {
  updateResidentForm.addEventListener('submit', async(e) => {
    e.preventDefault();
    const id = document.querySelector('#residentId').value;
    const name = document.querySelector('#updateName').value;
    const email = document.querySelector('#updateEmail').value;
    const contactNumber = document.querySelector('#updateContactNumber').value;
    const role = document.querySelector('#updateRole').value;
    const phase = document.querySelector('#updatePhase').value;
    const block = document.querySelector('#updateBlock').value;
    const lot = document.querySelector('#updateLot').value;
    const street = document.querySelector('#updateStreet').value;
    const password = document.querySelector('#updatePassword').value;
    const confirmPassword = document.querySelector('#updateConfirmPassword').value;

    try {
      updateResidentButton.disabled = true;
      updateResidentButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Updating...';
      const res = await axios({
        method: 'PATCH',
        url: `/api/v1/users/${id}`,
        data: {
          name,
          email,
          contactNumber,
          role,
          address: {
            phase,
            block,
            lot,
            street,
          },
          password,
          confirmPassword,
        }
      });

      if(res.data.status === 'success') showAlert('success', 'Resident was successfully updated');
      updateResidentForm.reset();
    } catch(err) {
      console.error(err);
      showAlert('error', err.response.data.message);
    } finally {
      updateResidentButton.disabled = false;
      updateResidentButton.innerHTML = 'Update'
    }
  })
}