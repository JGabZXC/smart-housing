/* eslint-disable */
import { PaginatedAdminPaymentList } from '../utils/PaginatedAdminList.js';
import { buttonSpinner } from '../utils/spinner.js';
import { showAlert } from '../utils/alerts.js';
import { setupShowHandler } from './admin_dashboard.js';
import { fetchData, postData } from '../utils/http.js';

const manualPaymentSection = document.querySelector('#manual-payment-section');
const manualPaymentDetailsElement = document.querySelector('#manual-payment-details');
const paginationContainer = document.querySelector('#manual-payment-pagination');
import { yearSelect, loadPaymentStatement, currentYear } from '../Me/me.js';

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
let userId = '';

const statementAdminManual = document.querySelector('#statement-admin-manual');

if(statementAdminManual) {
  // Set current year as default
  yearSelect.value = currentYear;



  // Handle year selection change
  yearSelect.addEventListener('change', function() {
    const selectedYear = parseInt(this.value);
    loadPaymentStatement(selectedYear, `/api/v1/payments/statement/${yearSelect.value}?id=${userId}`);
  });
}

function isCheckboxChecked(checkbox) {
  return checkbox.checked;
}

function calculateFullMonths(fromDateStr, toDateStr) {
  let fromDate;
  let toDate;
  if (!(fromDateStr instanceof Date) || !(toDateStr instanceof Date)) {
    fromDate = new Date(fromDateStr);
    toDate = new Date(toDateStr);
  } else {
    fromDate = fromDateStr;
    toDate = toDateStr;
  }

  // Check if fromDate is before toDate
  if (fromDate >= toDate) {
    return { isValid: false, months: 0 };
  }

  // Check if fromDate is the first day of the month
  if (fromDate.getDate() !== 1) {
    return { isValid: false, months: 0 };
  }

  // Check if toDate is the last day of the month
  const lastDayOfToMonth = new Date(
    toDate.getFullYear(),
    toDate.getMonth() + 1,
    0,
  );
  if (toDate.getDate() !== lastDayOfToMonth.getDate()) {
    return { isValid: false, months: 0 };
  }

  // Calculate the number of months properly across years
  const fromYear = fromDate.getFullYear();
  const fromMonth = fromDate.getMonth();
  const toYear = toDate.getFullYear();
  const toMonth = toDate.getMonth();

  const months = (toYear - fromYear) * 12 + (toMonth - fromMonth) + 1;

  return { isValid: true, months: months };
}

function updateManualPaymentAmount() {
  const fromDate = new Date(fromManualPayment.value);
  const toDate = new Date(toManualPayment.value);
  if(fromDate >= toDate) {
    showAlert('error', 'To date must be greater than or equal to From date.');
    manualPaymentForm.reset();
    return;
  }

  // Only calculate full months if checkbox is NOT checked (automatic calculation)
  if (!isCheckboxChecked(checkboxManualPayment)) {
    const calcMonth = calculateFullMonths(fromDate, toDate);
    manualPaymentAmount.value = calcMonth.months * 100; // Full payment for all months
  }
  // If checkbox is checked, don't auto-calculate - let user enter manual amount
}

function parseAddressSearch(searchQuery) {
  // Remove extra spaces and convert to lowercase for easier parsing
  const query = searchQuery.trim().toLowerCase();

  // Try to match address format: phase X, block Y, lot Z
  const addressPattern = /phase\s*(\d+)\s*,\s*block\s*(\d+)\s*,\s*lot\s*(\d+)/i;
  const match = query.match(addressPattern);

  if (match) {
    return {
      phase: parseInt(match[1]),
      block: parseInt(match[2]),
      lot: parseInt(match[3]),
    };
  }

  return null;
}

async function getIds(searchQuery) {
  const addressData = parseAddressSearch(searchQuery);

  if (addressData) {
    // Search by address components
    const params = {
      'phase': addressData.phase,
      'block': addressData.block,
      'lot': addressData.lot,
    };
    const paramsUrl = new URLSearchParams(params);
    const response = await postData(`/api/v1/getIds`, {
      type: 'house',
      object: params,
      message: `No address found with that search`,
    });

    return { user: response.data.doc[0], url: `/api/v1/payments?${paramsUrl.toString()}` };
  } else {
    const response = await postData(`/api/v1/getIds`, {
      type: 'user',
      object: {email: searchQuery},
      message: `No email found with that search`,
    });

    return { user: response.data.doc[0], url: `/api/v1/payments?email=${searchQuery}` };
  }
}

if(manualPaymentSection) {
  const currentYear = new Date().getFullYear();
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

      if (!search) {
        manualPaymentDetailsElement.classList.add('visually-hidden');
        return;
      }

      try {
        buttonSpinner(searchUserButton, 'Search', 'Searching');

        const { user, url } = await getIds(search);
        userId = user._id;
        manualPaymentList.endpoint = url;
        await manualPaymentList.render();

        loadPaymentStatement(
          currentYear,
          `/api/v1/payments/statement/${currentYear}?id=${user._id}`,
        );
        manualPaymentDetailsElement.classList.remove('visually-hidden');

      } catch (err) {
        console.error('Error searching for user:', err);
        manualPaymentDetailsElement.classList.add('visually-hidden');
        showAlert(
          'error',
          err.response?.data?.message ||
          'An error occurred while searching for user.',
        );
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
          loadPaymentStatement(
            currentYear,
            `/api/v1/payments/statement/${currentYear}?id=${user._id}`,
          );
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
        // Clear the auto-calculated amount to let user enter manual amount
        manualPaymentAmount.value = '';
      } else {
        manualPaymentAmount.setAttribute('disabled', 'true');
        // Recalculate full payment when switching back to automatic
        updateManualPaymentAmount();
      }
    });
  }
}