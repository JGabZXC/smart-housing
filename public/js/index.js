/* eslint-disable */

import '@babel/polyfill';
import { test } from './test';

// test();

import { login, logout } from './login';
import { getFeatured, getImages } from './getS3Image';
import { getMessagesProject, submitMessagesProject } from './message';
import { payWithStripe } from './payment';
import { showAlert } from './alerts';
import { getProjects } from './projects';
import { getEvents } from './events';
import { getHouses } from './house';

const email = document.querySelector('#email');
const password = document.querySelector('#password');

const hero = document.querySelector('.hero-index');
const projectContainer = document.querySelector('#project-container');
const projectListContainer = document.querySelector('#project-list-container');

// const eventContainer = document.querySelector('#event-container');
const eventListContainer = document.querySelector('#event-list-container');
const addressContainer = document.querySelector('#address-container');

const loginForm = document.querySelector('#login-form');
const submitMessageForm = document.querySelector('#form-message');
const paymentForm = document.querySelector('#payment-form');
const logoutBtn = document.querySelector('#logout');

if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const emailValue = email.value;
    const passwordValue = password.value;

    login(emailValue, passwordValue);
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    logout();
  });
}

if (hero) {
  getFeatured('project');
}

// PROJECTS
if (projectContainer) {
  const slug = projectContainer.dataset.slug;
  const projectId = document.querySelector('#project-id').dataset.projectid;
  getImages('project', slug);
  getMessagesProject(projectId);
}

if (projectListContainer) {
  getProjects();
}

// MESSAGES
if (submitMessageForm) {
  const projectId = document.querySelector('#project-id').dataset.projectid;
  submitMessageForm.addEventListener(
    'submit',
    (e) => {
      e.preventDefault();

      submitMessagesProject(projectId);
    },
    false,
  );
}

if (paymentForm) {
  paymentForm.addEventListener('submit', (e) => {
    e.preventDefault();
    let fromDateValue = new Date(document.querySelector('#from-date').value);
    let toDateValue = new Date(document.querySelector('#to-date').value);

    if (isNaN(fromDateValue) || isNaN(toDateValue))
      return showAlert('error', 'Please select a valid date', 10);

    if (toDateValue < fromDateValue)
      return showAlert(
        'error',
        'The "From" date must be earlier than the "To" date',
        10,
      );

    const amount =
      ((toDateValue.getFullYear() - fromDateValue.getFullYear()) * 12 +
        (toDateValue.getMonth() - fromDateValue.getMonth())) *
      1000;
    fromDateValue =
      (fromDateValue.getMonth() + 1).toString().padStart(2, '0') +
      fromDateValue.getFullYear();
    toDateValue =
      (toDateValue.getMonth() + 1).toString().padStart(2, '0') +
      toDateValue.getFullYear();

    if (fromDateValue === toDateValue)
      return showAlert(
        'error',
        'The "From" date and "To" date must not be the same',
        10,
      );

    const dateRange = `${fromDateValue}-${toDateValue}`;
    payWithStripe(amount, dateRange);
  });
}

if (eventListContainer) {
  getEvents();
}

// HOUSES | ADMIN
if (addressContainer) {
  getHouses();
}
