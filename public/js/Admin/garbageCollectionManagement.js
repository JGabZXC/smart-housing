/* eslint-disable */

import { buttonSpinner } from '../utils/spinner.js';
import { GarbageCollectionManagement } from '../utils/PaginatedAdminList.js';

const garbageCollectionSection = document.querySelector('#garbageCollectionSection');
const listOfGarbages = document.querySelector('#listOfGarbages');
const garbageCollectionPagination = document.querySelector('#garbageCollectionPagination');
const createGarbageForm = document.querySelector('#createGarbageForm');
const garbageModalConfirm = document.querySelector('#garbageModalConfirm');

if(garbageCollectionSection) {
  const paginatedGarbageList = new GarbageCollectionManagement(
    {
      container: listOfGarbages,
      paginationContainer: null,
      endpoint: '/api/v1/garbages',
      type: 'garbage',
      itemsPerPage: 5
    }
  );

  paginatedGarbageList.render();

  createGarbageForm.addEventListener('submit', (e) => {
    e.preventDefault();
  });
}