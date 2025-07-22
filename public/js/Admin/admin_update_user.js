/* eslint-disable */

import { showAlert } from '../utils/alerts.js';
import { buttonSpinner } from '../utils/spinner.js';
import { patchData, postData } from '../utils/http.js';

const updateUserSection = document.getElementById('updateUserSection');
const updateSearchEmailForm = document.getElementById('updateSearchEmailForm');
const searchEmailButton = document.getElementById('searchEmailButton');
const updateResidentForm = document.getElementById('updateResidentForm');
const residentId = document.getElementById('residentId');
const updateResidentButton = document.getElementById('updateResidentButton');

if(updateUserSection) {
  updateSearchEmailForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = new FormData(e.target).get('searchEmail');
    if(!email.trim()) {
      updateResidentForm.reset();
      updateResidentButton.disabled = true;
      return;
    }

    try {
      buttonSpinner(searchEmailButton, 'Check', 'Searching');
      const res = await postData(`/api/v1/getIds`, {
        type: "user",
        object: { email },
        message: 'No email was found',
      });
      const data = res.data.doc[0];

      console.log(data);

      if(res.status === 'success') {
        showAlert('success', 'Email was found!');
        residentId.value = data._id;
        document.querySelector("#updateName").value = data.name;
        document.querySelector("#updateEmail").value = data.email;
        updateResidentButton.disabled = false;
      }
    } catch(err) {
      showAlert('error', err.response?.data?.message || 'An error occurred');
    } finally {
      buttonSpinner(searchEmailButton, 'Check', 'Searching');
    }
  });

  updateResidentForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    try {
      buttonSpinner(updateResidentButton, 'Update', 'Updating');
      const id = residentId.value;

      const res = await patchData(`/api/v1/users/${id}`, {
        name: formData.get('name'),
        email: formData.get('email'),
        contactNumber: formData.get('contactNumber'),
        role: formData.get('role'),
        address: {
          phase: formData.get('phase'),
          block: formData.get('block'),
          lot: formData.get('lot'),
          street: formData.get('street')
        },
        password: formData.get('password'),
        confirmPassword: formData.get('confirmPassword')
      });

      if(res.status === 'success') {
        showAlert('success', 'Resident updated successfully!');
        updateResidentForm.reset();
      }
    } catch(err) {
      showAlert('error', err.response?.data?.message || 'An error occurred');
    } finally {
      buttonSpinner(updateResidentButton, 'Update', 'Updating');
    }
  });
}