/* eslint-disable */

import axios from 'axios';
const featuredPhoto = document.querySelector('.featured-photo');

export const getFeaturedProject = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: '/api/v1/images/getFeaturedCover/project',
    });

    const coverImage = res.data;
    featuredPhoto.src = coverImage[0].imageUrl;
  } catch (err) {
    console.error(err);
  }
};

export const getImages = async (slug) => {
  try {
    const res = await axios({
      method: 'GET',
      url: `/api/v1/images/getImages/project/${slug}`,
    });

    const projectImages = res.data;
    console.log(projectImages);
    featuredPhoto.src = projectImages.coverPhotoUrl;

    const carouselInner = document.querySelector('.carousel-inner');
    carouselInner.innerHTML = '';

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
    });
  } catch (err) {
    console.error(err);
  }
};
