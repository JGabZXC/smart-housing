/* eslint-disable */

import axios from 'axios';
const featuredPhoto = document.querySelector('.featured-photo');

export const getFeatured = async (type) => {
  try {
    const res = await axios({
      method: 'GET',
      url: `/api/v1/images/getFeaturedCover/${type}`,
    });

    const coverImage = res.data;
    featuredPhoto.src = coverImage[0].imageUrl;
  } catch (err) {
    console.error(err);
  }
};



export const getImages = async (type, slug) => {
  try {
    const res = await axios({
      method: 'GET',
      url: `/api/v1/images/getImages/${type}/${slug}`,
    });

    if(res.data.message) {
      const carousel = document.querySelector('#carousel-1');
      carousel.innerHTML = '';
      featuredPhoto.remove();
      return;
    };

    const projectImages = res.data;
    featuredPhoto.src = projectImages.coverPhotoUrl;

    const carouselInner = document.querySelector('.carousel-inner');
    carouselInner.innerHTML = '';

    const carouselIndicators = document.querySelector('.carousel-indicators');
    carouselIndicators.innerHTML = '';

    projectImages.imageUrls.forEach((image, index) => {
      const div = document.createElement('div');
      div.classList.add('carousel-item');
      if (index === 0) div.classList.add('active');

      const img = document.createElement('img');
      img.classList.add('w-100', 'd-block', 'object-fit-cover');
      img.src = image;
      img.alt = 'Slide Image';
      img.width = '100%';
      img.height = 600;

      div.appendChild(img);
      carouselInner.appendChild(div);

      const indicator = document.createElement('button');
      indicator.type = 'button';
      indicator.setAttribute('data-bs-target', '#carousel-1');
      indicator.setAttribute('data-bs-slide-to', index);
      if (index === 0) indicator.classList.add('active');
      carouselIndicators.appendChild(indicator);
    });
  } catch (err) {
    console.error(err);
  }
};
