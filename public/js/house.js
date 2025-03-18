/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

const tableBody = document.querySelector('.table-body');
const addressContainer = document.querySelector('#address-container');
const actionBar = document.querySelector('#action-bar');
const modalElement = document.getElementById('staticBackdrop');
const bootstrapModal = new bootstrap.Modal(modalElement);

const deleteElement = document.getElementById('delete');
const bootstrapDeleteModal = new bootstrap.Modal(deleteElement);

let house;
let queryString = '';

export const getHouses = async (queryString = '') => {
  try {
    const res = await axios({
      method: 'GET',
      url: `/api/v1/housings${queryString}`,
    });

    const houses = res.data.data.doc;
    house = res.data.data.doc;

    if (houses.length < 0) {
      addressContainer.innerHTML = '<h2>No houses found</h2>';
      return;
    }
    tableBody.innerHTML = '';

    houses.forEach((house) => {
      const row = document.createElement('tr');
      row.innerHTML = `
           <td>Block ${house.block}</td>
           <td>Lot ${house.lot}</td>
        <td>${house.street}</td>
        <td>${house.status[0].toUpperCase() + house.status.slice(1)}</td>
        <td class="d-flex gap-2 justify-content-center" data-id="${house._id}">
          <button id="edit-btn" class="btn btn-warning" type="button" data-bs-toggle="modal" data-bs-target="#staticBackdrop">
            <i class="bi bi-pencil"></i>
          </button>
          <button id="delete-btn" class="btn btn-danger" type="button" data-bs-toggle="modal" data-bs-target="#delete">
            <i class="bi bi-trash"></i>
          </button>
        </td>
      `;
      tableBody.appendChild(row);
    });
  } catch (err) {
    console.error(err);
  }
};

if(tableBody) {
  tableBody.addEventListener('click', (e) => {
    let target = e.target

    if (target.tagName.toLowerCase() === 'i') target = target.parentElement;

    const parentElement = target.parentElement;
    const houseId = parentElement.dataset.id;

    const getHouse = house.find((h) => h._id === houseId);

    if(target.id === 'edit-btn') if(getHouse) {
      document.getElementById('block').value = getHouse.block;
      document.getElementById('lot').value = getHouse.lot;
      document.getElementById('street').value = getHouse.street;
      document.getElementById('status').value = getHouse.status;

      const saveBtn = document.querySelector('#save-btn');

      const newSaveBtn = saveBtn.cloneNode(true);
      saveBtn.parentNode.replaceChild(newSaveBtn, saveBtn);

      newSaveBtn.addEventListener('click', async() => {
        try {
          const res = await axios({
            method: 'PATCH',
            url: `/api/v1/housings/${houseId}`,
            data: {
              block: document.getElementById('block').value,
              lot: document.getElementById('lot').value,
              street: document.getElementById('street').value,
            },
          })

          if (res.data.status !== 'success') showAlert('error', 'Failed to update house');

          showAlert('success', 'House updated successfully')
          await getHouses(queryString);
          bootstrapModal.hide();
        } catch(err) {
          showAlert('error', err.response.data.message);
          console.error(err);
        }
      })
    }


    if(target.id === 'delete-btn') {
      const deleteBtn = document.querySelector('#delete-btn');

      const newDeleteBtn = deleteBtn.cloneNode(true);
      deleteBtn.parentNode.replaceChild(newDeleteBtn, deleteBtn);

      document.querySelector('#complete-address').textContent = getHouse.completeAddress;

      newDeleteBtn.addEventListener('click', async() => {
        try {
          const res = await axios({
            method: 'DELETE',
            url: `/api/v1/housings/${houseId}`,
          })

          if (res.data.status !== 'success') showAlert('error', 'Failed to delete house');

          showAlert('success', 'House deleted successfully');
          await getHouses(queryString);
          bootstrapDeleteModal.hide();

        } catch(err) {
          showAlert('error', err.response.data.message);
          console.error(err);
        }
      })
    }


  });
}

if(actionBar) {
  actionBar.addEventListener('change', async (e) => {
    let target = e.target;

    if(target.tagName.toLowerCase() !== 'select') return;

    // Initialize query parameters
    let sortParam = '';
    let limitParam = '';
    let orderParam = '';

    // Loop through all <select> elements to get current values
    const selects = actionBar.querySelectorAll('select');
    selects.forEach((select) => {
      const selected = select.options[select.selectedIndex];
      const group = selected.closest('optgroup').label;

      if (group === 'sort') {
        sortParam = selected.value; // Get the sort field (e.g., "street" or "status")
      } else if (group === 'show') {
        limitParam = selected.value; // Get the limit value (e.g., "10", "20", "50")
      } else if (group === 'order') {
        orderParam = selected.value; // Get the order value (e.g., "" for ascending, "-" for descending)
      }
    });

    // Build the query string
    if (sortParam) {
      queryString = `?sort=${orderParam}${sortParam}&`; // Add sort parameter with order prefix
    }
    if (limitParam) {
      queryString += `limit=${limitParam}&`; // Add limit parameter
    }

    // Remove the trailing '&' or '?' if no parameters are added
    queryString = queryString.replace(/[&?]$/, '');
    await getHouses(queryString)
  })
}
