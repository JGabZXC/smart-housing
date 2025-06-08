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
      <td class="text-slate-800" style="vertical-align: middle">${item.name}</td>
      <td class="text-slate-800" style="vertical-align: middle;">${new Date(item.date).toLocaleString('en-PH', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })}
      </td>
      <td>
        <a class="btn text-slate-800" href="/${this.type}/${item.slug}"><i class="bi bi-eye"></i></a>
        <a class="btn border-0 text-slate-800" href="/${this.type}/${item.slug}/edit?type=${this.type}"><i class="bi bi-pencil-square"></i></a>
        <button type="button" data-id="${item._id}" data-type="${this.type}" data-title="${item.name}" data-bs-toggle="modal" data-bs-target="#modalDeleteDashboard" class="btn border-0 text-slate-800"><i class="bi bi-trash"></i></button>
      </td>
    </tr>
    `;
    this.container.innerHTML += markup;
  }

  async render() {
    spinner(this.container);
    try {
      const data = await fetchData(`${this.endpoint}?page=${this.currentPage}&limit=${this.itemsPerPage}&sort=${this.sort}`);
      this.container.innerHTML = '';
      this.paginationContainer.innerHTML = '';

      const items = data.data.doc;
      const totalPages = data.totalPages;
      const hasNextPage = this.currentPage < totalPages;

      // For single data
      if(items._id) {
        this.createCard(items);
        return;
      }

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
      this.container.innerHTML = `<p class="text-danger">Failed to load ${this.type}. Please try again later.</p>`;
    }
  }
}

export class PaginatedAdminAddressList extends PaginatedAdminlist {
  constructor({ container, paginationContainer, endpoint, type, itemsPerPage = 1, sort = '_id' }) {
    super({ container, paginationContainer, endpoint, type, itemsPerPage, sort })
  }

  createCard(item) {
    const markup = `
    <tr>
      <td class="text-slate-800" style="vertical-align: middle">${item.phase}</td>
      <td class="text-slate-800" style="vertical-align: middle">${item.block}</td>
      <td class="text-slate-800" style="vertical-align: middle">${item.lot}</td>
      <td class="text-slate-800" style="vertical-align: middle">${item.street}</td>
      <td class="text-slate-800" style="vertical-align: middle">${item.status}</td>
      <td data-id="${item._id}">
          <button id="edit-btn" class="btn" type="button" data-bs-toggle="modal" data-bs-target="#addressModal">
            <i class="bi bi-pencil-square"></i>
          </button>
          <button id="delete-btn" class="btn" type="button" data-bs-toggle="modal" data-bs-target="#delete">
            <i class="bi bi-trash"></i>
          </button>
      </td>
    </tr>
    `;
    this.container.innerHTML += markup;
  }
}

export default PaginatedAdminlist;