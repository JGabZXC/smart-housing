/* eslint-disable */

import axios from 'axios';
const imgContainer = document.querySelector('.img');

export const test = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: 'http://127.0.0.1:3000/test/api',
    });
    const coverImages = res.data;
    console.log(coverImages);
    coverImages.map((image) => {
      console.log(image);
      const img = document.createElement('img');
      img.src = image.imageUrl;
      imgContainer.appendChild(img);
    });
  } catch (err) {
    console.log(err);
  }
  A;
};
