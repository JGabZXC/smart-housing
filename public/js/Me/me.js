/* eslint-disable */

import { buttonSpinner} from '../utils/spinner.js';
import { patchData, postData } from '../utils/http.js';
import { showAlert } from '../utils/alerts.js';

const changePasswordForm = document.querySelector('#change-password-form');
const changePasswordFormButton = document.querySelector('#change-password-form-button');
const changeDetailsForm = document.querySelector('#change-details-form');
const changeDetailsFormButton = document.querySelector('#change-details-form-button');

const securityQuestionSelect = document.querySelector('#security-question');
const customQuestionContainer = document.querySelector('#custom-question-container');
const customQuestionInput = document.querySelector('#custom-question');
const securityQuestionForm = document.querySelector('#security-question-form');
const securityQuestionButton = document.querySelector('#security-question-button');
const verifyStepEl = document.querySelector('#verify-step');
const currentSecurityAnswer = document.querySelector('#current-security-answer');
const verifySecurityButton = document.querySelector('#verify-security-button');
const updateStepEl = document.querySelector('#update-step');
let answer = '';

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
    const formData = new FormData(e.target);
    const body = {
      name: `${formData.get('first-name')} ${formData.get('middle-initial')} ${formData.get('last-name')}`.trim(),
      email: formData.get('email') || '',
      contactNumber: formData.get('number') || ''
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

if (securityQuestionSelect) {
  securityQuestionSelect.addEventListener('change', function() {
    if (this.value === 'Custom Question') {
      customQuestionContainer.style.display = 'block';
      customQuestionInput.required = true;
    } else {
      customQuestionContainer.style.display = 'none';
      customQuestionInput.required = false;
      customQuestionInput.value = '';
    }
  });
}

// Update the security question form submission handler
if (securityQuestionForm) {
  securityQuestionForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(securityQuestionForm);
    let securityQuestion = formData.get('securityQuestion');
    const customQuestion = formData.get('customQuestion');
    const securityAnswer = formData.get('securityAnswer');
    const confirmSecurityAnswer = formData.get('confirmSecurityAnswer');

    // Use custom question if "Custom Question" is selected
    if (securityQuestion === 'Custom Question') {
      if (!customQuestion || customQuestion.trim().length < 10) {
        showAlert('error', 'Custom question must be at least 10 characters long');
        return;
      }
      securityQuestion = customQuestion.trim();
    }

    // Validation
    if (!securityQuestion || !securityAnswer || !confirmSecurityAnswer) {
      showAlert('error', 'Please fill in all fields');
      return;
    }

    if (securityAnswer !== confirmSecurityAnswer) {
      showAlert('error', 'Secret answers do not match');
      return;
    }

    if (securityAnswer.length < 3) {
      showAlert('error', 'Secret answer must be at least 3 characters long');
      return;
    }

    let buttonText = securityQuestionButton.textContent;

    try {
      buttonSpinner(securityQuestionButton, buttonText, "Setting up");

      const body = {
        secretQuestion: securityQuestion,
        secretAnswer: securityAnswer,
        currentAnswer: answer,
      }

      const response = await patchData('/api/v1/users/me/securityAnswer', body);

      if (response.status === 'success') {
        showAlert('success', 'Secret Question updated successfully!');
        setTimeout(() => {
          location.reload();
        }, 1500);
      }
    } catch (error) {
      showAlert('error', error.response?.data?.message || 'Failed to update secret question');
    } finally {
      buttonSpinner(securityQuestionButton, buttonText, "Setting up");
      answer = '';
    }
  });
}

if(verifyStepEl) {
  verifySecurityButton.addEventListener('click', async () => {
    const securityAnswer = currentSecurityAnswer.value.trim();

    if(!securityAnswer) {
      return;
    }
    console.log(`Security Answer: ${securityAnswer}`); // Debugging line

    try {
      buttonSpinner(verifySecurityButton, "Verify", "Verifying");
      const response = await postData('/api/v1/users/me/verifySecretAnswer', { secretAnswer: securityAnswer });

      if(response.status === 'success') {
        showAlert('success', 'Secret answer verified successfully!');
        updateStepEl.classList.remove('d-none');
        updateStepEl.classList.add('d-flex');
        answer = securityAnswer; // Store the verified answer for later use
      }
    } catch (err) {
      showAlert('error', err.response?.data?.message || 'Failed to update secret question');
    } finally {
      buttonSpinner(verifySecurityButton, "Verify", "Verifying");
    }
  })
}