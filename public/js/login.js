/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';
import {buttonSpinner} from "./_eventAndProjHelper"

export const login = async (email, password, targetButton) => {
    const button = document.querySelector(targetButton);
  try {
    buttonSpinner(button, "Login", "Logging in");
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
    // console.error(err.response.data.message);
  } finally {
    buttonSpinner(button, "Login", "Logging in");
  }
};

export const logout = async () => {
  try {
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
  }
};
