/* eslint-disable */

import axios from 'axios';

export function renderPagination(
  totalPages,
  currentPage,
  hasNextPage,
  changePageFunction,
  paginationSelector = '.pagination'
) {
  const pagination = document.querySelector(paginationSelector);
  pagination.innerHTML = '';

  const prevButton = document.createElement('li');
  prevButton.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
  prevButton.innerHTML = `
    <a class="page-link" aria-label="Previous">
      <span aria-hidden="true">«</span>
    </a>
  `;
  if (currentPage > 1) {
    prevButton.addEventListener('click', () =>
      changePageFunction(currentPage - 1),
    );
  }
  pagination.appendChild(prevButton);

  if (totalPages <= 5) {
    for (let i = 1; i <= totalPages; i++) {
      const pageItem = document.createElement('li');
      pageItem.className = `page-item ${i === currentPage ? 'active' : ''}`;
      pageItem.innerHTML = `<a class="page-link">${i}</a>`;
      pageItem.addEventListener('click', () => changePageFunction(i));
      pagination.appendChild(pageItem);
    }
  } else {
    const createPageItem = (i) => {
      const pageItem = document.createElement('li');
      pageItem.className = `page-item ${i === currentPage ? 'active' : ''}`;
      pageItem.innerHTML = `<a class="page-link">${i}</a>`;
      pageItem.addEventListener('click', () => changePageFunction(i));
      pagination.appendChild(pageItem);
    };

    createPageItem(1);

    if (currentPage > 4) {
      const ellipsisItem = document.createElement('li');
      ellipsisItem.className = 'page-item disabled';
      ellipsisItem.innerHTML = `<a class="page-link">...</a>`;
      pagination.appendChild(ellipsisItem);
    }

    for (
      let i = Math.max(2, currentPage - 2);
      i <= Math.min(totalPages - 1, currentPage + 2);
      i++
    ) {
      createPageItem(i);
    }

    if (currentPage < totalPages - 3) {
      const ellipsisItem = document.createElement('li');
      ellipsisItem.className = 'page-item disabled';
      ellipsisItem.innerHTML = `<a class="page-link">...</a>`;
      pagination.appendChild(ellipsisItem);
    }

    createPageItem(totalPages);
  }

  const nextButton = document.createElement('li');
  nextButton.className = `page-item ${!hasNextPage ? 'disabled' : ''}`;
  nextButton.innerHTML = `
    <a class="page-link" aria-label="Next">
      <span aria-hidden="true">»</span>
    </a>
  `;
  if (hasNextPage) {
    nextButton.addEventListener('click', () =>
      changePageFunction(currentPage + 1),
    );
  }
  pagination.appendChild(nextButton);
}

export async function fetchData(
  url,
  container,
  renderFunction,
  currentPage,
  itemsPerPage,
  changePage,
  paginationSelector = '.pagination'
) {
  try {
    const res = await axios({
      method: 'GET',
      url: `${url}?&page=${currentPage}&limit=${itemsPerPage}&sort=-date`,
    });

    if (res.data.results === 0) {
      container.innerHTML = `<p>No items found</p>`;
      if(document.querySelector(paginationSelector)) document.querySelector(paginationSelector).innerHTML = '';
      return;
    }

    const items = res.data.data.doc;
    const totalPages = res.data.totalPages;
    container.innerHTML = '';

    items.forEach((item) => renderFunction(item, container));

    const hasNextPage = items.length === itemsPerPage;
    renderPagination(totalPages, currentPage, hasNextPage, changePage, paginationSelector);
  } catch (err) {
    console.error(err);
  }
}
