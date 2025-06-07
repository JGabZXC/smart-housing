/* eslint-disable */
import { buttonSpinner } from './spinner.js';
import { postData } from './http.js';
import { showAlert } from './alerts.js';

export const searchSlug = async (paginatedAdminList, searchBtn, inputName, resourceType, resourceLabel, e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  if(!formData.get(inputName)) {
    await paginatedAdminList.render();
    return;
  }
  const searchInput = formData.get(inputName).toLowerCase().trim();

  try {
    buttonSpinner(searchBtn, `Search ${resourceLabel}`, 'Searching...');
    const checkSlug = await postData(`/api/v1/getIds`, {
      type: resourceType,
      object: {
        slug: searchInput,
      },
      message: `No ${resourceLabel} found with that slug`,
    });

    console.log(checkSlug)

    const { _id } = checkSlug.data?.doc[0];
    if (!_id) {
      showAlert('error', `No ${resourceLabel} found with that slug`);
      return;
    }

    paginatedAdminList.currentPage = 1;
    paginatedAdminList.endpoint = `/api/v1/${resourceType}/${_id}`;
    await paginatedAdminList.render();
    paginatedAdminList.endpoint = `/api/v1/${resourceType}`; // Reset endpoint after search
  } catch(err) {
    console.log(err);
    showAlert('error', err.response?.data.message || `An error occurred while searching for the ${resourceLabel}.`);
  } finally {
    buttonSpinner(searchBtn, `Search ${resourceLabel}`, 'Searching...');
  }
}