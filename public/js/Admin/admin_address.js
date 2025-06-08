/* eslint-disable */

import { PaginatedAdminAddressList }  from "../utils/PaginatedAdminList.js"
import { setupSortHandler, setupShowHandler } from './admin_dashboard.js';
import { showAlert } from '../utils/alerts.js';
import { buttonSpinner } from '../utils/spinner.js';
import { postData } from '../utils/http.js';

const selectors = {
  address: {
    section: document.querySelector('#admin-address-section'),
    createButton: document.querySelector('#admin-create-address-button'),
    tableBody: document.querySelector('#admin-address-table-body'),
    pagination: document.querySelector('#admin-address-pagination'),
    sort: document.querySelector('#sort-address'),
    show: document.querySelector('#show-address'),
    searchForm: document.querySelector('#admin-address-search-form'),
    searchButton: document.querySelector('#admin-address-search-button'),
    endpoint: '/api/v1/housings',
    type: 'addresses',
  },
  modal: {
    modalBody: document.querySelector('#addressModal'),
    modalLabel: document.querySelector('#addressModalLabel'),
    modalForm: document.querySelector('#addressForm'),
    modalFormSaveButton: document.querySelector('#address-modal-save-btn'),
  }
}

let addressList;

if(selectors.address.section) {
  if(!addressList) {
    addressList = new PaginatedAdminAddressList(
      {
        container: selectors.address.tableBody,
        paginationContainer: selectors.address.pagination,
        endpoint: selectors.address.endpoint,
        type: selectors.address.type,
        itemsPerPage: 5
      }
    );

    setupSortHandler(selectors.address.sort, addressList);
    setupShowHandler(selectors.address.show, addressList);

    selectors.address.createButton.addEventListener('click', () => {

    })
  }


  addressList.render();
}
