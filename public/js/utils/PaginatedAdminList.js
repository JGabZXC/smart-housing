/* eslint-disable */

import PaginatedList from './PaginatedList.js';
import { fetchData } from './http.js';
import { spinner } from './spinner.js';

class PaginatedAdminlist extends PaginatedList{
  constructor({ container, paginationContainer, endpoint, type, itemsPerPage = 1, sort = '_id' }) {
    super({ container, paginationContainer, endpoint, type, itemsPerPage })
    this.sort = sort;
  }

  createCard(item) {
    const markup = `
    <tr class="${item.isFeatured ? 'table-success' : ''}">
      <td>${item.name}</td>
      <td>${new Date(item.date).toLocaleString('en-PH', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })}</td>
      <td>View, Edit, Delete</td>
    </tr>
    `;
    this.container.innerHTML += markup;
  }

  async render() {
    spinner(this.container, `Loading ${this.type}...`);
    try {
      const data = await fetchData(`${this.endpoint}?page=${this.currentPage}&limit=${this.itemsPerPage}&sort=${this.sort}`);
      this.container.innerHTML = '';
      this.paginationContainer.innerHTML = '';

      const items = data.data.doc;
      const totalPages = data.totalPages;
      const hasNextPage = this.currentPage < totalPages;

      if (!items.length) {
        this.container.innerHTML = `<p class="fs-6 text-slate-400">No ${this.type} available.</p>`;
        return;
      }

      if(this.currentPage === 1) {
        const featuredItem = items.find(item => item.isFeatured === true);
        if(featuredItem) this.createCard(featuredItem);
      }

      items.forEach(item => !item.isFeatured && this.createCard(item));
      if (totalPages > 1) this.renderPagination(totalPages, hasNextPage);
    } catch (error) {
      console.log(error);
      this.container.innerHTML = `<p class="text-danger">Failed to load ${this.type}. Please try again later.</p>`;
    }
  }
}

export default PaginatedAdminlist;