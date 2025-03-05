/* eslint-disable */

import '@babel/polyfill';
import { test } from './test';

// test();

import { login, logout } from './login';
import { getFeaturedProject, getImages } from './getS3Image';

const email = document.querySelector('#email');
const password = document.querySelector('#password');

const hero = document.querySelector('.hero-index');
const projectContainer = document.querySelector('#project-container');
const slug = projectContainer.dataset.slug;

const loginForm = document.querySelector('#login-form');
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
  getImages(slug);
}
