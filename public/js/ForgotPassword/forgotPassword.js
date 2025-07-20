/* eslint-disable */

import { postData } from '../utils/http.js';
import { buttonSpinner } from '../utils/spinner.js';
import { showAlert } from '../utils/alerts.js';

const forgotPasswordSection = document.querySelector('#forgotPasswordSection');
class ForgotPassword {
  userEmail;

  constructor({emailDivEl, emailForm, questionDivEl, questionFormEl}) {
    this.emailDivEl = emailDivEl;
    this.emailForm = emailForm;
    this.questionDivEl = questionDivEl;
    this.questionFormEl = questionFormEl;
    this.securityQuestionEl = this.questionFormEl.querySelector('#securityQuestion');
    this.backToEmailEl = this.questionFormEl.querySelector('#backToEmail');
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
        email: this.userEmail,
        secretAnswer: formData.get('answer')
      };

      const button = e.target.querySelector('button');

      await this.checkAnswer(data, button);
    })

    this.backToEmailEl.addEventListener('click', () => {
      this.backToEmail();
    });
  }

  async getQuestion(email, buttonEl) {
    try {
      buttonSpinner(buttonEl, 'Find Account', 'Loading');
      const response = await postData('/api/v1/users/security-question', { email});

      if(response.status === 'success') {
        this.hideForm(this.emailDivEl, this.emailForm, true);
        this.userEmail = response.data.email;

        this.renderQuestionForm(response.data.securityQuestion);
      }
    } catch(error) {
      console.log(error);
      showAlert('error', error.response?.data?.message || 'An error occurred while fetching security question.');
    } finally {
      buttonSpinner(buttonEl, 'Find Account', 'Loading');
    }
  }

  async checkAnswer(data, buttonEl) {}

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
  const forgotPassword = new ForgotPassword({emailDivEl, emailForm, questionDivEl, questionFormEl});
  forgotPassword.init();
}