/* eslint-disable */

import { patchData, postData } from '../utils/http.js';
import { buttonSpinner } from '../utils/spinner.js';
import { showAlert } from '../utils/alerts.js';

const forgotPasswordSection = document.querySelector('#forgotPasswordSection');
class ForgotPassword {
  #userEmail;
  #resetToken;

  constructor({emailDivEl, emailForm, questionDivEl, questionFormEl, resetDivEl, resetFormEl, successMessageEl}) {
    this.emailDivEl = emailDivEl;
    this.emailForm = emailForm;
    this.questionDivEl = questionDivEl;
    this.questionFormEl = questionFormEl;
    this.securityQuestionEl = this.questionFormEl.querySelector('#securityQuestion');
    this.backToEmailEl = this.questionFormEl.querySelector('#backToEmail');
    this.resetDivEl = resetDivEl;
    this.resetFormEl = resetFormEl;
    this.successMessageEl = successMessageEl;
  }

  init() {
    this.emailForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const email = formData.get('email');
      const button = e.target.querySelector('button');

      await this.getQuestion(email, button);
    });

    this.questionFormEl.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);

      const data = {
        email: this.#userEmail,
        secretAnswer: formData.get('answer')
      };
      const button = e.target.querySelector('button');

      await this.checkAnswer(data, button);
    })

    this.backToEmailEl.addEventListener('click', () => {
      this.backToEmail();
    });

    this.resetFormEl.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const password = formData.get('password');
      const confirmPassword = formData.get('confirmPassword');
      const button = e.target.querySelector('button');

      if(password !== confirmPassword) {
        showAlert('error', 'Passwords do not match. Please try again.');
        return;
      }

      const data = {
        password,
        confirmPassword
      }

      await this.submitPasswordResetForm(data, button);
    })
  }

  async getQuestion(email, buttonEl) {
    try {
      buttonSpinner(buttonEl, 'Find Account', 'Loading');
      const response = await postData('/api/v1/users/security-question', { email});

      if(response.status === 'success') {
        this.hideForm(this.emailDivEl, this.emailForm, true);
        this.#userEmail = response.data.userEmail;

        this.renderQuestionForm(response.data.securityQuestion);
      }
    } catch(error) {
      console.log(error);
      showAlert('error', error.response?.data?.message || 'An error occurred while fetching security question.');
    } finally {
      buttonSpinner(buttonEl, 'Find Account', 'Loading');
    }
  }

  async checkAnswer(data, buttonEl) {
    try {
      buttonSpinner(buttonEl, 'Check Answer', 'Loading');
      const response = await postData('/api/v1/users/check-security-answer', data);

      console.log(response);

      if(response.status === 'success') {
        showAlert('success', 'Security answer is correct. You can now reset your password.');
        // Redirect to password reset page or show reset form
        this.#resetToken = response.resetToken;
        this.showSubmitPasswordResetForm();
      }
    } catch(error) {
      console.log(error);
      showAlert('error', error.response?.data?.message || 'An error occurred while checking the security answer.');
    } finally {
      buttonSpinner(buttonEl, 'Check Answer', 'Loading');
    }
  }

  showSubmitPasswordResetForm() {
    this.hideForm(this.questionDivEl, this.questionFormEl, true);
    this.hideForm(this.resetDivEl, this.resetFormEl, false);
  }

  async submitPasswordResetForm(data, buttonEl) {
    try {
      buttonSpinner(buttonEl, 'Submit New Password', 'Submitting');
      const response = await patchData(`/api/v1/users/reset/${this.#resetToken}`, data);
      if(response.status === 'success') {
        showAlert('success', 'Password reset successful. You will be redirected wait a second.');
        this.hideForm(this.resetDivEl, this.resetFormEl, true);
        this.hideForm(this.successMessageEl, undefined, false);
        setTimeout(() => {
          window.location.href = '/';
        }, 1500);
      }
    } catch(error) {
      showAlert('error', error.response?.data?.message || 'An error occurred while submitting the password reset form.');
    } finally {
      buttonSpinner(buttonEl, 'Submit New Password', 'Submitting');
    }
  }

  renderQuestionForm(question) {
    this.hideForm(this.questionDivEl, this.questionFormEl, false);
    this.securityQuestionEl.textContent = question;
  }

  backToEmail() {
    this.hideForm(this.questionDivEl, this.questionFormEl, true);
    this.securityQuestionEl.textContent = '';

    this.hideForm(this.emailDivEl, this.emailForm, false);
  }

  hideForm(elementDiv, elementForm, isHide) {
    if(isHide) {
      elementForm.reset();
      elementDiv.classList.add('d-none');
    } else {
      elementDiv.classList.remove('d-none');
    }
  }
}


if(forgotPasswordSection) {
  const emailDivEl = document.querySelector('#emailStep');
  const emailForm = document.querySelector('#emailForm');
  const questionDivEl = document.querySelector('#questionStep');
  const questionFormEl = document.querySelector('#questionForm');
  const resetDivEl = document.querySelector('#resetStep');
  const resetFormEl = document.querySelector('#resetPasswordForm');
  const successMessageEl = document.querySelector('#successMessage');
  const forgotPassword = new ForgotPassword({emailDivEl, emailForm, questionDivEl, questionFormEl, resetDivEl, resetFormEl, successMessageEl});
  forgotPassword.init();
}