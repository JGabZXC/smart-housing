/* eslint-disable */

import { spinner } from './spinner.js';
import { fetchData } from './http.js';

class PaginatedList {
  constructor({ container, paginationContainer, endpoint, type, itemsPerPage = 1 }) {
    this.container = container;
    this.paginationContainer = paginationContainer;
    this.endpoint = endpoint;
    this.type = type;
    this.itemsPerPage = itemsPerPage;
    this.currentPage = 1;
  }

  createCard(item) {
    const markup = `
      <div class="col">
        <div class="card shadow">
          <div class="card-body rounded">
            <h4 class="card-title text-slate-900 fw-semibold">${item.name}</h4>
            <p class="card-text text-slate-600">${item.richDescription?.slice(0, 100) || ''}...</p>
            ${item.imageCover?.signedUrl ? `<img class="object-fit-cover border rounded-3" src="${item.imageCover.signedUrl}" alt="${item.name}" width="100%" height="200" />` : ''}
            <a class="btn bg-green-500 text-slate-50 mt-3" href="/${this.type}/${item.slug}">Read More ⟶</a>
          </div>
        </div>
      </div>
    `;

    this.container.innerHTML += markup;
  }

  renderPagination(totalPages, hasNextPage) {
    const createPageButton = (label, page, isActive = false, isDisabled = false) => {
      const li = document.createElement('li');
      li.className = `page-item ${isActive ? 'active' : ''} ${isDisabled ? 'disabled' : ''}`;
      li.innerHTML = `<a class="page-link">${label}</a>`;
      if (!isDisabled && page !== this.currentPage) {
        li.addEventListener('click', () => this.changePage(page));
      }
      return li;
    }

    this.paginationContainer.appendChild(
      createPageButton('«', this.currentPage - 1, false, this.currentPage === 1)
    );

    const visiblePages = totalPages <= 5
      ? [...Array(totalPages).keys()].map(i => i + 1)
      : [
        1,
        ...(this.currentPage > 4 ? ['...'] : []),
        ...[...Array(5).keys()].map(i => i + this.currentPage - 2).filter(p => p > 1 && p < totalPages),
        ...(this.currentPage < totalPages - 3 ? ['...'] : []),
        totalPages
      ];

    visiblePages.forEach(p => {
      if (p === '...') {
        const ellipsis = document.createElement('li');
        ellipsis.className = 'page-item disabled';
        ellipsis.innerHTML = '<a class="page-link">...</a>';
        this.paginationContainer.appendChild(ellipsis);
      } else {
        this.paginationContainer.appendChild(createPageButton(p, p, p === this.currentPage));
      }
    });

    this.paginationContainer.appendChild(
      createPageButton('»', this.currentPage + 1, false, !hasNextPage)
    );
  }

  async render() {
    spinner(this.container, `Loading ${this.type}...`);

    try {
      const data = await fetchData(`${this.endpoint}?page=${this.currentPage}&limit=${this.itemsPerPage}`);
      this.container.innerHTML = '';
      this.paginationContainer.innerHTML = '';

      const items = data.data.doc;
      const totalPages = data.totalPages;
      const hasNextPage = this.currentPage < totalPages;

      if (!items.length) {
        this.container.innerHTML = `<p class="fs-6 text-slate-400">No ${this.type} available.</p>`;
        return;
      }

      items.forEach(item => this.createCard(item));
      if (totalPages > 1) this.renderPagination(totalPages, hasNextPage);
    } catch (error) {
      console.log(error);
      this.container.innerHTML = `<p class="text-danger">Failed to load ${this.type}. Please try again later.</p>`;
    }
  }

  async changePage(newPage) {
    if (newPage < 1) return;
    this.currentPage = newPage;
    await this.render();
  }
}

export default PaginatedList;