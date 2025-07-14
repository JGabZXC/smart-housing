/* eslint-disable */
import { PaginatedAdminPaymentList } from '../utils/PaginatedAdminList.js';
import { buttonSpinner } from '../utils/spinner.js';
import { showAlert } from '../utils/alerts.js';
import { setupShowHandler } from './admin_dashboard.js';
import { postData } from '../utils/http.js';

const manualPaymentSection = document.querySelector('#manual-payment-section');
const manualPaymentDetailsElement = document.querySelector('#manual-payment-details');
const paginationContainer = document.querySelector('#manual-payment-pagination');

const searchUserForm = document.querySelector('#search-user-form');
const searchUserInput = document.querySelector('#search-user-input');
const searchUserButton = document.querySelector('#search-user-button');

const manualPaymentForm = document.querySelector('#manual-payment-form');
const manualPaymentFormButton = document.querySelector('#manual-payment-form-button');
const fromManualPayment = document.querySelector('#from-manual-payment');
const toManualPayment = document.querySelector('#to-manual-payment');
const checkboxManualPayment = document.querySelector('#checkbox-manual-payment');
const manualPaymentAmount = document.querySelector('#manual-payment-amount');

const showPayment = document.querySelector('#show-payment');
const manualPaymentTableBody = document.querySelector('#manual-payment-table-body');

const filterDateForm = document.querySelector('#filter-date-form');
const filterDateFormButton = document.querySelector('#filter-date-form-button');

let manualPaymentList = null;

function isCheckboxChecked(checkbox) {
  return checkbox.checked;
}

function getNumberOfMonths(startDate, endDate) {
  const startYear = startDate.getFullYear();
  const startMonth = startDate.getMonth();
  const endYear = endDate.getFullYear();
  const endMonth = endDate.getMonth();

  // Calculate the total number of months
  let months = (endYear - startYear) * 12 + (endMonth - startMonth);

  // Adjust for partial months
  if (endDate.getDate() < startDate.getDate()) {
    months -= 1;
  }

  return months;
}

function updateManualPaymentAmount() {
  const fromDate = new Date(fromManualPayment.value);
  const toDate = new Date(toManualPayment.value);
  if(fromDate >= toDate) {
    showAlert('error', 'To date must be greater than or equal to From date.');
    manualPaymentForm.reset();
    return;
  }
  manualPaymentAmount.value = getNumberOfMonths(fromDate, toDate) * 100; // Assuming 100 is monthly fee
}

function parseAddressSearch(searchQuery) {
  // Remove extra spaces and convert to lowercase for easier parsing
  const query = searchQuery.trim().toLowerCase();

  // Try to match address format: phase X, block Y, lot Z, street
  const addressPattern = /phase\s*(\d+)\s*,\s*block\s*(\d+)\s*,\s*lot\s*(\d+)\s*,\s*(.+)/i;
  const match = query.match(addressPattern);

  if (match) {
    return {
      phase: parseInt(match[1]),
      block: parseInt(match[2]),
      lot: parseInt(match[3]),
      street: match[4].trim()
    };
  }

  return null;
}

function buildSearchEndpoint(searchQuery) {
  const addressData = parseAddressSearch(searchQuery);

  if (addressData) {
    // Search by address components
    const params = new URLSearchParams({
      'phase': addressData.phase,
      'block': addressData.block,
      'lot': addressData.lot,
      'street': addressData.street
    });
    return `/api/v1/payments?${params.toString()}`;
  } else {
    // Fallback to email search
    return `/api/v1/payments?email=${searchQuery}`;
  }
}

if(manualPaymentSection) {
  if(!manualPaymentList) {
    manualPaymentList = new PaginatedAdminPaymentList({
      container: manualPaymentTableBody,
      paginationContainer,
      endpoint: '/api/v1/payments',
      type: 'payments',
      itemsPerPage: 10,
      sort: 'paymentDate',
      fromDate: undefined,
      toDate: undefined,
    });
    setupShowHandler(showPayment, manualPaymentList);
    searchUserForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const search = formData.get('search-input').trim();

      if(!search) {
        manualPaymentDetailsElement.classList.add('visually-hidden');
        return;
      };

      try {
        buttonSpinner(searchUserButton, 'Search', 'Searching');

        manualPaymentList.endpoint = buildSearchEndpoint(search);
        await manualPaymentList.render();
        manualPaymentDetailsElement.classList.remove('visually-hidden');
      } catch (err) {
        manualPaymentDetailsElement.classList.add('visually-hidden');
        showAlert('error', err.response?.data?.message || 'An error occurred while searching for user.');
      } finally {
        buttonSpinner(searchUserButton, 'Search', 'Searching');
      }
    });
    filterDateForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const fromDate = formData.get('from-date-filter');
      const toDate = formData.get('to-date-filter');

      if(!fromDate && !toDate) {
        manualPaymentList.fromDate = undefined;
        manualPaymentList.toDate = undefined;
      } else {
        manualPaymentList.fromDate = fromDate;
        manualPaymentList.toDate = toDate;
      }

      try {
        await manualPaymentList.render();
      } catch(err) {
        if(err.name === 'CanceledError') {
          manualPaymentTableBody.innerHTML = `
          <tr>
            <td colspan="100%">
               <p class="text-red-600 m-0">A previous request was canceled.</p>
            </td>
          </tr>
          `;
        } else {
          showAlert('error', err.response?.data?.message || 'An error occurred while filtering payments.');
        }
      }
    });
    manualPaymentForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const fromDate = formData.get('from-manual-payment');
      const toDate = formData.get('to-manual-payment');

      try {
        buttonSpinner(manualPaymentFormButton, 'Submit', 'Creating Payment');
        const response = await postData(`/api/v1/payments`, {
          fromDate,
          toDate,
          amount: manualPaymentAmount.value, // If disabled it will be null, so bypassing it
          email: searchUserInput.value.trim(),
        });

        if(response.status === 'success') {
          showAlert('success', 'Payment successfully created.');
          manualPaymentForm.reset();
          manualPaymentAmount.setAttribute('disabled', 'true');
          await manualPaymentList.render();
        }
      } catch (err) {
        showAlert('error', err.response?.data?.message || 'An error occurred while creating payment.');
      } finally {
        buttonSpinner(manualPaymentFormButton, 'Submit', 'Creating Payment');
      }

    });
    fromManualPayment.addEventListener('change', () => {
      if(!toManualPayment.value) return;
      updateManualPaymentAmount();
    });
    toManualPayment.addEventListener('change', () => {
      if(isCheckboxChecked(checkboxManualPayment) || !fromManualPayment.value) return; // Do nothing if checkbox is checked
      updateManualPaymentAmount();
    });
    checkboxManualPayment.addEventListener('change', () => {
      if(isCheckboxChecked(checkboxManualPayment)) {
        manualPaymentAmount.removeAttribute('disabled');
      } else {
        manualPaymentAmount.setAttribute('disabled', 'true');
        updateManualPaymentAmount();
      }
    });
  }
}