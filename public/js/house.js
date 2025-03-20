/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';
import { renderPagination } from './_eventAndProjHelper';

/*

  TODO: Refactor code duplicate code later

*/

const tableBody = document.querySelector('.table-body');
const addressContainer = document.querySelector('#address-container');
const actionBar = document.querySelector('#action-bar');
const modalElement = document.getElementById('staticBackdrop');
const deleteElement = document.getElementById('delete');
const createElement = document.getElementById('create');

let house;
let currentPage = 1;
let queryString = '?page=1&sort=phase';
let hasNextPage = false;
let housesPerPage;

let bootstrapModal;
let bootstrapDeleteModal;
let bootstrapCreateModal;
if(modalElement) {
bootstrapModal = new bootstrap.Modal(modalElement);
bootstrapDeleteModal = new bootstrap.Modal(deleteElement);
bootstrapCreateModal = new bootstrap.Modal(createElement);
}

export const getHouses = async () => {
  try {

    const res = await axios({
      method: 'GET',
      url: `/api/v1/housings${queryString}`,
    });

    const houses = res.data.houses;
    const totalPages = res.data.totalPages;
    house = houses;

    if (houses.length < 0) {
      addressContainer.innerHTML = '<h2>No houses found</h2>';
      return;
    }
    tableBody.innerHTML = '';

    houses.forEach((house) => {
      const row = document.createElement('tr');
      row.innerHTML = `
           <td>Phase ${house.phase}</td>
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

    hasNextPage = houses.length === housesPerPage;

    renderPagination(totalPages, currentPage, hasNextPage, changeAddress);
  } catch (err) {
    console.error(err);
  }
};

if(tableBody) {
  tableBody.addEventListener('click', (e) => {
    let target = e.target;

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
        newSaveBtn.disabled = true;
        newSaveBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Saving...';

        try {
          const res = await axios({
            method: 'PATCH',
            url: `/api/v1/housings/${houseId}`,
            data: {
              block: document.getElementById('block').value,
              lot: document.getElementById('lot').value,
              street: document.getElementById('street').value,
              status: document.getElementById('status').value,
            },
          })

          if (res.data.status !== 'success') showAlert('error', 'Failed to update house');

          showAlert('success', 'House updated successfully')
          await getHouses(queryString);
          bootstrapModal.hide();
          newSaveBtn.disabled = false;
          newSaveBtn.innerHTML = 'Save changes';
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
        newDeleteBtn.disabled = true;
        newDeleteBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Deleting...';

        try {
          const res = await axios({
            method: 'DELETE',
            url: `/api/v1/housings/${houseId}`,
          })

          if (res.data.status !== 'success') showAlert('error', 'Failed to delete house');

          showAlert('success', 'House deleted successfully');
          await getHouses(queryString);
          bootstrapDeleteModal.hide();
          newDeleteBtn.disabled = false;
          newDeleteBtn.innerHTML = 'Confirm';
        } catch(err) {
          showAlert('error', err.response.data.message);
          console.error(err);
        }
      })
    }


  });
}

if(actionBar) {
  const searchInput = actionBar.querySelector('input[type="search"]');
  const searchButton = actionBar.querySelector('button.btn-primary');
  // const createAddress = actionBar.querySelector('#create-address');
  const createButton = document.querySelector('#create-btn');

  searchButton.addEventListener('click', async () => {
    const searchValue = searchInput.value.trim();

    // Reset to page 1 when searching
    currentPage = 1;

    // Update query string with search parameter
    queryString = `?page=${currentPage}`;

    // Add search parameter if there's a search value
    if (searchValue) {
      queryString += `&search=${encodeURIComponent(searchValue)}`;
    }

    // Keep existing sort and limit parameters if they exist
    if (queryString.includes('sort=')) {
      // Extract sort parameter from existing query string
      const sortMatch = queryString.match(/sort=([^&]*)/);
      if (sortMatch) queryString += `&sort=${sortMatch[1]}`;
    } else {
      // Apply default sort
      queryString += '&sort=block';
    }

    if (queryString.includes('limit=')) {
      // Extract limit parameter from existing query string
      const limitMatch = queryString.match(/limit=([^&]*)/);
      if (limitMatch) queryString += `&limit=${limitMatch[1]}`;
    }

    await getHouses();
  });

  // Allow search on Enter key press
  searchInput.addEventListener('keypress', async (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      searchButton.click();
    }
  });

  actionBar.addEventListener('change', async (e) => {
    let target = e.target;

    if(target.tagName.toLowerCase() !== 'select') return;

    currentPage = 1;

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
        housesPerPage = selected.value;
      } else if (group === 'order') {
        orderParam = selected.value; // Get the order value (e.g., "" for ascending, "-" for descending)
      }
    });


    // Build the query string
    queryString = `?page=${currentPage}`;

    if (sortParam) {
      queryString += `&sort=${orderParam}${sortParam}`;
    }
    if (limitParam) {
      queryString += `&limit=${limitParam}`;
    }

    await getHouses();

    // // Build the query string
    // if (sortParam) {
    //   queryString = `?page=${currentPage}&sort=${orderParam}${sortParam}&`; // Add sort parameter with order prefix
    // }
    // if (limitParam) {
    //   queryString += `limit=${limitParam}&`; // Add limit parameter
    // }
    //
    // // Remove the trailing '&' or '?' if no parameters are added
    // queryString = queryString.replace(/[&?]$/, '');
    // await getHouses(queryString)
  })

  createButton.addEventListener('click', async () => {
    createButton.disabled = true;
    createButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Creating...';

    try {
      const res = await axios({
        method: 'POST',
        url: '/api/v1/housings',
        data: {
          phase: document.getElementById('phase-create').value,
          block: document.getElementById('block-create').value,
          lot: document.getElementById('lot-create').value,
          street: document.getElementById('street-create').value,
          status: document.getElementById('status-create').value,
        },
      });

      if (res.data.status !== 'success') showAlert('error', 'Failed to create house');

      showAlert('success', 'House created successfully');
      await getHouses(queryString);
      bootstrapCreateModal.hide();
      document.querySelector('#createHouseForm').reset();
      createButton.disabled = false;
      createButton.innerHTML = 'Confirm';
    } catch (err) {
      createButton.disabled = false;
      createButton.innerHTML = 'Confirm';
      showAlert('error', err.response.data.message);
    }
  })
}

window.changeAddress = async function (newPage) {
  if (newPage < 1) return;
  currentPage = newPage;

  // Update page parameter in existing query string
  if (queryString.includes('?')) {
    // If query string already has parameters
    if (queryString.includes('page=')) {
      // Replace existing page parameter
      queryString = queryString.replace(/page=\d+/, `page=${newPage}`);
    } else {
      // Add page parameter
      queryString += `&page=${newPage}`;
    }
  } else {
    // If no query string parameters yet
    queryString = `?page=${newPage}`;
  }

  await getHouses();
};
