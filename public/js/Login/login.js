/* eslint-disable */
// import axios from 'axios'; // Enable this line if bundling with parcel!
import { showAlert } from '../utils/alerts.js';
import { buttonSpinner } from '../utils/spinner.js';

const loginForm = document.querySelector('#login-form');
const loginButton = document.querySelector('#login-button');

const logoutForm = document.querySelector('#logout-form');
const logoutButton = document.querySelector('#logout-button');

if(loginForm) {
  loginForm.addEventListener('submit', async(e) => {
    e.preventDefault();
    const formData = new FormData(loginForm);
    const email = formData.get('email');
    const password = formData.get('password');

    try {
      buttonSpinner(loginButton, "Login", "Logging in");
      const res = await axios({
        method: 'POST',
        url: '/api/v1/users/login',
        data: {
          email,
          password,
        },
      });

      if (res.data.status === 'success') {
        showAlert('success', 'Logged in successfully!');
        window.setTimeout(() => {
          location.assign('/');
        }, 500);
      }
    } catch (err) {
      showAlert('error', err.response.data.message);
    } finally {
      buttonSpinner(loginButton, "Login", "Logging in");
    }
  })
}

if(logoutForm) {
  logoutForm.addEventListener('submit', async(e) => {
    e.preventDefault();

    try {
      buttonSpinner(logoutButton, "Log out", "Logging out");
      const res = await axios({
        method: 'GET',
        url: '/api/v1/users/logout',
      });

      if (res.data.status === 'success') {
        showAlert('warning', 'Logged out successfully!');
        window.setTimeout(() => {
          location.assign('/');
        }, 2000);
      }
    } catch (err) {
      if (err.response.data.status === 'error') {
        showAlert('error', `${err.response.data.message}. Logging out...`);
        window.setTimeout(() => {
          location.assign('/');
        }, 2000);
      }
    } finally {
      buttonSpinner(logoutButton, "Log out", "Logging out");
    }
  })
}
