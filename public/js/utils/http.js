/* eslint-disable */

import axios from 'axios';

export const fetchData = async (url, params = {}) => {
  try {
    const response = await axios.get(url, params);
    return response.data;
  } catch(err) {
    throw err; // Re-throw the error for further handling if needed
  }
}

export const postData = async (url, params = {}) => {
  try {
    const response = await axios.post(url, params);
    return response.data;
  } catch (err) {
    throw err;
  }
}

export const patchData = async (url, params = {}) => {
  try {
    const response = await axios.patch(url, params);
    return response.data;
  } catch (err) {
    throw err;
  }
}

export const deleteData = async (url) => {
  try {
    const response = await axios.delete(url);
    return response.data;
  } catch (err) {
    throw err;
  }
}