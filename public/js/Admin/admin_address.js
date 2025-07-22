/* eslint-disable */

import { PaginatedAdminAddressList }  from "../utils/PaginatedAdminList.js"
import { setupSortHandler, setupShowHandler } from './admin_dashboard.js';
import { showAlert } from '../utils/alerts.js';
import { buttonSpinner, spinner } from '../utils/spinner.js';
import { deleteData, fetchData, patchData, postData } from '../utils/http.js';

const selectors = {
  address: {
    section: document.querySelector('#admin-address-section'),
    createButton: document.querySelector('#admin-create-address-button'),
    tableBody: document.querySelector('#admin-address-table-body'),
    pagination: document.querySelector('#admin-address-pagination'),
    sort: document.querySelector('#sort-address'),
    show: document.querySelector('#show-address'),
    searchForm: document.querySelector('#search-address-form'),
    searchButton: document.querySelector('#search-address-button'),
    endpoint: '/api/v1/housings',
    type: 'addresses',
  },
  modal: {
    modalBody: document.querySelector('#addressModal'),
    modalLabel: document.querySelector('#addressModalLabel'),
    modalForm: document.querySelector('#addressForm'),
    modalFormBody: document.querySelector('.modal-body'),
    modalFormSaveButton: document.querySelector('#address-modal-save-btn'),
    modalFormCloseButton: document.querySelector('#address-modal-close-btn'),
    modalDelete: document.querySelector('#delete'),
    modalDeleteButtonDelete: document.querySelector('#delete-btn'),
  },
  modalForm: {
    phase: document.querySelector('#phase'),
    block: document.querySelector('#block'),
    lot: document.querySelector('#lot'),
    street: document.querySelector('#street'),
    status: document.querySelector('#status'),
    completeAddress: document.querySelector('#complete-address'),
  }
}

function modalFormBuilder(doc) {
  return `
              <div class="modal-body">
                <div class="mb-3">
                  <label for="phase" class="form-label fw-semibold">Phase</label>
                  <input type="number" class="form-control" id="phase" name="phase" value=${doc?.phase || ''}>
                </div>
                <div class="mb-3">
                  <label for="block" class="form-label fw-semibold">Block</label>
                  <input type="text" class="form-control" id="block" name="block" value=${doc?.block || ''}>
                </div>
                <div class="mb-3">
                  <label for="lot" class="form-label fw-semibold">Lot</label>
                  <input type="number" class="form-control" id="lot" name="lot" value=${doc?.lot || ''}>
                </div>
                <div class="mb-3">
                  <label for="street" class="form-label fw-semibold">Street</label>
                  <input type="text" class="form-control" id="street" name="street" value=${doc?.street || ''}>
                </div>
                <div id="dayContainer" class="mb-3">
                    <label for="status" class="form-label fw-semibold">Status</label>
                    <select class="form-select" id="status" name="status">
                      <option value="" ${!doc?.status ? 'selected' : ''}>Select Type</option>
                      <option value="unoccupied" ${doc?.status === 'unoccupied' ? 'selected' : ''}>Unoccupied</option>
                      <option value="occupied" ${doc?.status === 'occupied' ? 'selected' : ''}>Occupied</option>
                      <option value="maintenance" ${doc?.status === 'maintenance' ? 'selected' : ''}>Maintenance</option>
                    </select>
                </div>
            </div>
            <div class="modal-footer">
              <button id="address-modal-close-btn" type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
              <button id="address-modal-save-btn" type="submit" class="btn bg-green-700 text-slate-100">Submit</button>
            </div>
          `;
}

let addressList;

let existingModalCreate, existingModalDelete;
if(selectors.modal.modalBody) {
  existingModalCreate = new bootstrap.Modal(selectors.modal.modalBody);
}
if(selectors.modal.modalDelete) {
  existingModalDelete = new bootstrap.Modal(selectors.modal.modalDelete);
}

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

    selectors.address.searchForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const input = formData.get('admin-search-event').trim();
      if(!input) {
        addressList.endpoint = `/api/v1/housings`;
        addressList.render();
        return;
      }

      try {
        addressList.currentPage = 1;
        addressList.endpoint = `/api/v1/housings?search=${input}`;
        buttonSpinner(selectors.address.searchButton, 'Search Address', 'Searching');
        await addressList.render();
      } catch (err) {
        showAlert('error', err.response?.data?.message || 'Failed to search address. Please try again later.');
      } finally {
        buttonSpinner(selectors.address.searchButton, 'Search Address', 'Searching');
      }
    })

    selectors.address.createButton.addEventListener('click', () => {
      selectors.modal.modalLabel.textContent = 'Create New Address';
      selectors.modal.modalForm.innerHTML = modalFormBuilder();
    });

    selectors.address.tableBody.addEventListener('click', async (e) => {
      const selectedId = e.target.closest('td')?.dataset.id;
      if(!selectedId) return;
      if(e.target.closest('button')?.getAttribute('id') === 'edit-btn') {
        try {
          selectors.modal.modalLabel.textContent = 'Edit Address';
          spinner(selectors.modal.modalForm, 'Loading address details');
          const response = await fetchData(`${selectors.address.endpoint}/${selectedId}`);

          const doc = response.data.doc;

          if(response.status === 'success') {
            selectors.modal.modalForm.innerHTML = '';
            selectors.modal.modalForm.dataset.selectedId = selectedId;

            selectors.modal.modalForm.innerHTML = modalFormBuilder(doc);
          }
        } catch(err) {
          showAlert('error', 'Failed to load address details. Please try again later.');
        }
      }
      if(e.target.closest('button')?.getAttribute('id') === 'delete-btn') {
          selectors.modal.modalDelete.dataset.selectedId = selectedId;
          selectors.modalForm.completeAddress.textContent =  e.target.closest('td')?.dataset.address;
      }
    });
    
    selectors.modal.modalForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const label = selectors.modal.modalLabel.textContent;
      const selectedId = selectors.modal.modalForm.dataset.selectedId;
      const baseURL = label === 'Create New Address' ? '/api/v1/housings' : `/api/v1/housings/${selectedId}`;
      let type = label === 'Create New Address' ? 'post': 'patch';

      const formData = new FormData(e.target);
      const body = {
        phase: formData.get('phase'),
        block: formData.get('block'),
        lot: formData.get('lot'),
        street: formData.get('street'),
        status: formData.get('status').toLowerCase()
      }

      try {
        buttonSpinner(document.querySelector('#address-modal-save-btn'), 'Submit', 'Submitting');
        const response = await (type === 'post' ? postData(baseURL, body) : patchData(baseURL, body));

        if(response.status === 'success') {
          showAlert('success', `${label} successfully!`);
          existingModalCreate.hide();
          await addressList.render();
        }
      } catch(err) {
        showAlert('error', err.response?.data?.message || 'Failed to submit the form. Please try again later.');
      } finally {
        // InnerHTML gets reset after the modal is closed (success or closing), double check if existing, because if the response fails button is still existing
        if(document.querySelector('#address-modal-save-btn')) buttonSpinner(document.querySelector('#address-modal-save-btn'), 'Submit', 'Submitting');
      }
    });

    selectors.modal.modalBody.addEventListener('hidden.bs.modal', () => {
      selectors.modal.modalForm.innerHTML = '';
      delete selectors.modal.modalForm.dataset.selectedId;
    });

    selectors.modal.modalDelete.addEventListener('hidden.bs.modal', ()=> {
      delete selectors.modal.modalDelete.dataset.selectedId;
    })

    selectors.modal.modalDeleteButtonDelete.addEventListener('click', async () => {
      const selectedId = selectors.modal.modalDelete.dataset.selectedId;
      try {
        buttonSpinner(selectors.modal.modalDeleteButtonDelete, 'Confirm', 'Deleting');

        await deleteData(`${selectors.address.endpoint}/${selectedId}`);

        showAlert('success', 'Address deleted successfully!');
        existingModalDelete.hide();
        await addressList.render();
      } catch(err) {
        showAlert('error', err.response?.data?.message || 'Failed to delete address. Please try again later.');
      } finally {
        buttonSpinner(selectors.modal.modalDeleteButtonDelete, 'Confirm', 'Deleting');
      }
    })
  }


  addressList.render();
}
