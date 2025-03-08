/* eslint-disable */

import '@babel/polyfill';
import { test } from './test';

// test();

import { login, logout } from './login';
import { getFeaturedProject, getImages } from './getS3Image';
import { getMessagesProject, submitMessagesProject } from './message';

const email = document.querySelector('#email');
const password = document.querySelector('#password');

const hero = document.querySelector('.hero-index');
const projectContainer = document.querySelector('#project-container');

const loginForm = document.querySelector('#login-form');
const submitMessageForm = document.querySelector('#form-message');
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
  getFeaturedProject();
}

if (projectContainer) {
  const slug = projectContainer.dataset.slug;
  const projectId = document.querySelector('#project-id').dataset.projectid;
  getImages(slug);
  getMessagesProject(projectId);
}

if(submitMessageForm) {
  const projectId = document.querySelector('#project-id').dataset.projectid;
  submitMessageForm.addEventListener('submit', (e) => {
    e.preventDefault();

    submitMessagesProject(projectId)
  }, false);
}
