/* eslint-disable */

import '@babel/polyfill';
import { test } from './test';

// test();

import { login, logout } from './login';
import { getFeatured, getImages } from './getS3Image';
import { getMessages, submitMessages } from './message';
import { payWithStripe } from './payment';
import { showAlert } from './alerts';
import { getProjects } from './projects';
import { getEvents } from './events';
import { getHouses } from './house';
import './paymentManual';
import './dashboard';
import './createResident';
import './updateResident';
import './bookEvent';
import './editProjEve';

const email = document.querySelector('#email');
const password = document.querySelector('#password');

const featuredProject = document.querySelector('.featured-project');
const featuredEvent = document.querySelector('.featured-event');
const projectContainer = document.querySelector('#project-container');
const projectListContainer = document.querySelector('#project-list-container');
const adminProjectContainer = document.querySelector('#admin-project-container');

const eventContainer = document.querySelector('#event-container');
const eventListContainer = document.querySelector('#event-list-container');
const adminEventContainer = document.querySelector('#admin-event-container');
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

    login(emailValue, passwordValue, ".login-button");
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    logout();
  });
}

if (featuredProject) {
  getFeatured('project', '.featured-project-cover-photo');
}

if(featuredEvent) {
  getFeatured('event', ".featured-event-cover-photo");
}

// PROJECTS
if (projectContainer) {
  const slug = projectContainer.dataset.slug;
  const projectId = document.querySelector('#project-id').dataset.projectid;
  getImages('project', slug);
  getMessages('projects', projectId);
}

if (projectListContainer || adminProjectContainer) {
  getProjects();
}

// MESSAGES
if (projectContainer && submitMessageForm) {
  const projectId = document.querySelector('#project-id').dataset.projectid;
  submitMessageForm.addEventListener(
    'submit',
    (e) => {
      e.preventDefault();

      submitMessages('projects', projectId);
    },
    false,
  );
}

if(eventContainer && submitMessageForm) {
  const eventId = document.querySelector('#event-id').dataset.eventid;
  submitMessageForm.addEventListener(
    'submit',
    (e) => {
      e.preventDefault();

      submitMessages('events', eventId);
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

// EVENTS
if(eventContainer) {
  const slug = eventContainer.dataset.slug;
  const eventId = document.querySelector('#event-id').dataset.eventid;
  getImages('event', slug);
  getMessages('events', eventId);
}

if (eventListContainer || adminEventContainer) {
  getEvents();
}

// HOUSES | ADMIN
if (addressContainer) {
  getHouses();
}
