/* eslint-disable */

import PaginatedList from './PaginatedList.js';
import { fetchData } from './http.js';
import { spinner } from './spinner.js';

class PaginatedAdminList extends PaginatedList{
  constructor({ container, paginationContainer, endpoint, type, itemsPerPage = 1, sort = '_id' }) {
    super({ container, paginationContainer, endpoint, type, itemsPerPage })
    this.sort = sort;
    this.abortController = null;
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
    if (this.abortController) this.abortController.abort();
    spinner(this.container);
    try {
      this.abortController = new AbortController();
      const url = this.endpoint.includes('search') ? `${this.endpoint}&page=${this.currentPage}&limit=${this.itemsPerPage}&sort=${this.sort}` : `${this.endpoint}?page=${this.currentPage}&limit=${this.itemsPerPage}&sort=${this.sort}`;

      const data = await fetchData(url, { signal: this.abortController.signal });
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
      if(error.name === 'CanceledError') {
       this.container.innerHTML = `
        <tr>
          <td colspan="100%">
             <p class="text-red-600 m-0">Previous request was cancelled.</p>
          </td>
        </tr>
      `;
      } else {
        this.container.innerHTML = `
        <tr>
          <td colspan="100%">
             <p class="text-red-600 m-0">Failed to load ${this.type}. Please try again later</p>
          </td>
        </tr>
        `;
      }
    }
  }
}

export class PaginatedAdminAddressList extends PaginatedAdminList {
  constructor({ container, paginationContainer, endpoint, type, itemsPerPage = 1, sort = '_id' }) {
    super({ container, paginationContainer, endpoint, type, itemsPerPage, sort });
  }

  createCard(item) {
    const markup = `
    <tr>
      <td class="text-slate-800" style="vertical-align: middle">${item.phase}</td>
      <td class="text-slate-800" style="vertical-align: middle">${item.block}</td>
      <td class="text-slate-800" style="vertical-align: middle">${item.lot}</td>
      <td class="text-slate-800" style="vertical-align: middle">${item.street}</td>
      <td class="text-slate-800" style="vertical-align: middle">${item.status}</td>
      <td data-id="${item._id}" data-address="${item.completeAddress}">
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

export class PaginatedAdminPaymentList extends PaginatedAdminList {
  constructor({ container, paginationContainer, endpoint, type, itemsPerPage = 1, sort = '_id', fromDate, toDate }) {
    super({ container, paginationContainer, endpoint, type, itemsPerPage, sort })
    this.fromDate = fromDate;
    this.toDate = toDate;
    this.abortController = null;
  }

  createCard(item, index) {
    const globalIndex = (this.currentPage - 1) * this.itemsPerPage + index + 1;
    const markup = `
    <tr class="text-slate-800">
      <td style="vertical-align: middle">${globalIndex}</td>
      <td style="vertical-align: middle">${item.formattedDateRange}</td>
      <td style="vertical-align: middle">${item.amount}</td>
      <td style="vertical-align: middle">${new Intl.DateTimeFormat("en-us", {
      year: "numeric",
      month: "long",
      day: "2-digit",
      timeZone: 'Asia/Manila'
    }).format(new Date(item.paymentDate))}</td>
      <td style="vertical-align: middle">${item.stripeSessionId || 'NA'}</td>
      <td style="vertical-align: middle">${item.paymentMethod}</td>
    </tr>
    `;
    this.container.innerHTML += markup;
  }

  async render() {
    if (this.abortController) this.abortController.abort();
    spinner(this.container);
    try {
      this.abortController = new AbortController();
      let url = `${this.endpoint}`;

      if(this.endpoint.includes('email') || this.endpoint.includes('phase')) {
        url += `&page=${this.currentPage}&limit=${this.itemsPerPage}&sort=${this.sort}`
      }

      if(this.fromDate && this.toDate) {
        url += `&fromDate=${this.fromDate}&toDate=${this.toDate}`;
      }

      const data = await fetchData(url, { signal: this.abortController.signal });
      this.container.innerHTML = '';
      this.paginationContainer.innerHTML = '';

      const items = data.data.doc;
      const totalPages = data.totalPages;
      const hasNextPage = this.currentPage < totalPages;

      this.container.dataset.userEmail = data.data.email ? data.data.email : '';

      // For single data
      if(items._id) {
        this.createCard(items);
        return;
      }

      if (!items.length) {
        this.container.innerHTML = `<tr>
          <td colspan="100%" class="fs-6 text-slate-400">Either no ${this.type.slice(0, this.type.length - 1)} record exists or no ${this.type.slice(0, this.type.length - 1)} date is recorded.</td>
        </tr>`;
        return;
      }

      if(this.currentPage === 1) {
        const featuredItem = items.find(item => item.isFeatured === true);
        if(featuredItem) this.createCard(featuredItem);
      }

      items.forEach((item, index) => !item.isFeatured && this.createCard(item, index));
      if (totalPages > 1) this.renderPagination(totalPages, hasNextPage);
    } catch (error) {
      throw error;
    }
  }
}

export class PaginatedAdminBookingEvent extends PaginatedAdminList {
  constructor({ container, paginationContainer, endpoint, type, itemsPerPage = 1, sort = '-createdAt' }) {
    super({ container, paginationContainer, endpoint, type, itemsPerPage, sort })
    this.abortController = null;
  }

  createCard(item, index) {
    const markup = `
    <tr class="text-slate-800">
      <td style="vertical-align: middle">${item.user.name}</td>
      <td style="vertical-align: middle">${item.place}</td>
      <td style="vertical-align: middle">${item.user.contactNumber}</td>
      <td style="vertical-align: middle">${item.user.email}</td>
      <td style="vertical-align: middle">${item.user.address.completeAddress}</td>
      <td style="vertical-align: middle">${item.approvedBy ? item.approvedBy.name : ""}</td>
      <td style="vertical-align: middle">
        <button class="btn bg-${item.approved ? "yellow" : "green"}-700 text-slate-100 fw-semibold" data-eventstatus="${item.approved ? "disapprove" : "approve"}" data-eventid="${item._id}">${item.approved ? "Unapprove" : "Approve"}</button>
      </td>
    </tr>
    `;
    this.container.innerHTML += markup;
  }

  async render() {
    if (this.abortController) this.abortController.abort();
    spinner(this.container);
    try {
      this.abortController = new AbortController();
      const url = this.endpoint.includes('email') ? `${this.endpoint}&page=${this.currentPage}&limit=${this.itemsPerPage}&sort=${this.sort}` : `${this.endpoint}?page=${this.currentPage}&limit=${this.itemsPerPage}&sort=${this.sort}`;

      const data = await fetchData(url, { signal: this.abortController.signal });
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
      if(error.name === 'CanceledError') {
        this.container.innerHTML = `
        <tr>
          <td colspan="100%">
             <p class="text-red-600 m-0">Previous request was cancelled.</p>
          </td>
        </tr>
      `;
      } else {
        // this.container.innerHTML = `
        // <tr>
        //   <td colspan="100%">
        //      <p class="text-red-600 m-0">Failed to load ${this.type}. Please try again later</p>
        //   </td>
        // </tr>
        // `;
        throw error;
      }
    }
  }
}

export class GarbageCollectionManagement {
  constructor({ container, endpoint, type, sort = 'phase' }) {
    this.container = container;
    this.endpoint = endpoint;
    this.type = type;
    this.sort = sort;
    this.abortController = null;
  }

  timeToDate(str) {
    const [hours, minutes] = str.split(":");
    const now = new Date(); // This is for storing only the time!
    now.setHours(hours, minutes, 0, 0);
    return now;
  };

  createCard(item, container) {
    // const [from, to] = item.time.split("-");
    // const fromTime = this.timeToDate(from).toLocaleString("en-PH", {
    //   hour12: true,
    //   hour: "2-digit",
    //   minute: "2-digit",
    // });
    // const toTime = this.timeToDate(to).toLocaleString("en-PH", {
    //   hour12: true,
    //   hour: "2-digit",
    //   minute: "2-digit",
    // });
    const markup = `
            <tr>
                <td>${item.day}</td>
                <td>${item.timeLocation.time}</td>
                <td>${item.timeLocation.street}</td>
                <td>Update, Delete</td>
            </tr>
        `;
    container.innerHTML += markup;
  }

  createDiv(phase) {
    const markup = `
        <div id="collection${phase}">
          <h3 class="fs-6">Phase ${phase}</h3>
          <table id="collectionTable${phase}" class="table">
            <thead class="fw-bold">
              <td>Day</td>
              <td>Time</td>
              <td>Street</td>
              <td>Action</td>
            </thead>
            <tbody id="collectionBody${phase}"></tbody>
          </table>
        </div>
    `;

    this.container.insertAdjacentHTML("afterbegin", markup);
  }

  async render() {
    if (this.abortController) this.abortController.abort();
    spinner(this.container);
    try {
      this.abortController = new AbortController();
      const url = `${this.endpoint}?sort=${this.sort}`;

      const data = await fetchData(url, { signal: this.abortController.signal });
      this.container.innerHTML = '';

      const items = data.data.doc;

      if (!items.length) {
        this.container.innerHTML = `<p class="fs-6 text-slate-400">No ${this.type} available.</p>`;
        return;
      }

      const uniquePhases = [...new Set(items.map(item => item.phase))];

      uniquePhases.forEach(phase => {
        this.createDiv(phase);
        const phaseItems = items.filter(item => item.phase === phase);
        const tbody = document.querySelector(`#collectionBody${phase}`);
        phaseItems.forEach(item => this.createCard(item, tbody));
      })
    } catch (error) {
      if(error.name === 'CanceledError') {
        this.container.innerHTML = `
        <tr>
          <td colspan="100%">
             Previous request was canceled.
          </td>
        </tr>
      `;
      } else {
        throw error;
      }
    }
  }
}

export default PaginatedAdminList;