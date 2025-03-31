/* eslint-disable */

import axios from 'axios';
import { showAlert } from './alerts';
import { buttonSpinner } from './_eventAndProjHelper';

const updateSearchEmailForm = document.querySelector('#updateSearchEmailForm');
const searchEmailButton = document.querySelector('#searchEmailButton');

const updateResidentForm = document.querySelector('#updateResidentForm');
const updateResidentButton = document.querySelector('#updateResidentButton');

const residentId = document.querySelector('#residentId');

if(updateResidentButton) {
  updateResidentButton.disabled = true;
}

if(updateSearchEmailForm) {
  updateSearchEmailForm.addEventListener('submit', async(e) => {
    e.preventDefault();
    const email = document.querySelector('#searchEmail').value;

    if(email.trim() === '') return;
    try {
      buttonSpinner(searchEmailButton, 'Check', 'Searching');
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
      updateSearchEmailForm.reset();
      updateResidentButton.disabled = false;
    } catch(err) {
      console.error(err);
      showAlert('error', err.response.data.message);
    } finally {
      buttonSpinner(searchEmailButton, 'Check', 'Searching');
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
      buttonSpinner(updateResidentButton, 'Update', 'Updating');
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
      if (!residentId.value) {
        buttonSpinner(updateResidentButton, 'Update', 'Updating', true);
        return;
      }
      buttonSpinner(updateResidentButton, 'Update', 'Updating');
    }
  })
}