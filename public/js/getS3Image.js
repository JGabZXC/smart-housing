/* eslint-disable */

import axios from 'axios';
const featuredPhoto = document.querySelector('.featured-photo');
const featuredPhotoBg = document.querySelector('.featured-photo-bg');

export const getFeatured = async (type, photoDestination) => {
  try {
    const res = await axios({
      method: 'GET',
      url: `/api/v1/images/getFeaturedCover/${type}`,
    });

    const photo = document.querySelector(photoDestination);

    const coverImage = res.data;
    photo.src = coverImage[0].imageUrl;
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

    // If there is no image, remove the carousel and featuredPhoto
    if(res.data.message) {
      const carousel = document.querySelector('#carousel-1');
      carousel.innerHTML = '';
      if (featuredPhoto) featuredPhoto.remove();
      if (featuredPhotoBg) {
        featuredPhotoBg.style.backgroundImage = `url('https://cdn.bootstrapstudio.io/placeholders/1400x800.png')`;
        featuredPhotoBg.style.backgroundSize = 'cover';
      };
      return;
    };

    const typeImages = res.data;
    if(featuredPhoto) featuredPhoto.src = typeImages.coverPhotoUrl;
    if(featuredPhotoBg) {
      featuredPhotoBg.style.backgroundImage = `url(${typeImages.coverPhotoUrl})`;
      featuredPhotoBg.style.backgroundSize = 'cover';
    }

    const carouselInner = document.querySelector('.carousel-inner');
    carouselInner.innerHTML = '';

    const carouselIndicators = document.querySelector('.carousel-indicators');
    carouselIndicators.innerHTML = '';

    typeImages.imageUrls.forEach((image, index) => {
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
