/* eslint-disable */

import axios from 'axios';
const featuredPhoto = document.querySelector('.featured-photo');

export const getS3Image = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: '/api/v1/getImage',
    });

    const coverImage = res.data;
    featuredPhoto.src = coverImage[0].imageUrl;
  } catch (err) {
    console.error(err);
  }
};
