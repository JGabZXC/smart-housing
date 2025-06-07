/* eslint-disable */

import { buttonSpinner} from '../utils/spinner.js';
import { patchData } from '../utils/http.js';
import { showAlert } from '../utils/alerts.js';

const changePasswordForm = document.querySelector('#change-password-form');
const changePasswordFormButton = document.querySelector('#change-password-form-button');
const changeDetailsForm = document.querySelector('#change-details-form');
const changeDetailsFormButton = document.querySelector('#change-details-form-button');

if(changePasswordForm) {
  changePasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const body = {
      currentPassword: formData.get('currentPassword'),
      password: formData.get('password'),
      confirmPassword: formData.get('confirmPassword')
    }
    try {
      buttonSpinner(changePasswordFormButton, 'Confirm', 'Loading');
      const response = await patchData(`/api/v1/users/me/changePassword`, body);
      if (response.status === 'success') {
        showAlert('success','Password changed successfully!');
        changePasswordForm.reset();
      }
    } catch (err) {
      showAlert('error', err.response.data.message || 'An error occurred while changing the password.');
    } finally {
      buttonSpinner(changePasswordFormButton, 'Confirm', 'Loading');
    }
  })
}

if(changeDetailsForm) {
  changeDetailsForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const {userid} = changeDetailsForm.dataset;
    const formData = new FormData(e.target);
    const body = {
      name: `${formData.get('first-name')} ${formData.get('middle-initial')} ${formData.get('last-name')}`.trim(),
      email: formData.get('email') || ''
    }
    try {
      buttonSpinner(changeDetailsFormButton, 'Confirm', 'Loading');
      const response = await patchData(`/api/v1/users/me/changeDetails`, body);
      if (response.status === 'success') {
        showAlert('success','Details changed successfully!');
        changeDetailsForm.reset();
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
    } catch (err) {
      showAlert('error', err.response.data.message || 'An error occurred while changing the details.');
    } finally {
      buttonSpinner(changeDetailsFormButton, 'Confirm', 'Loading');
    }
  })
}