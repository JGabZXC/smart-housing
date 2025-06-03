/* eslint-disable */
// import axios from 'axios'; // Enable this line if bundling with parcel!

export const fetchData = async (url, params = {}) => {
  try {
    const response = await axios.get(url, { params });
    return response.data;
  } catch(err) {
    console.error('Error fetching data:', err);
    throw err; // Re-throw the error for further handling if needed
  }
}
