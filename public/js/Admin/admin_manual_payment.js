/* eslint-disable */
import { PaginatedAdminPaymentList } from '../utils/PaginatedAdminList.js';
import { buttonSpinner } from '../utils/spinner.js';
import { showAlert } from '../utils/alerts.js';
import { setupShowHandler} from './admin_dashboard.js';


const manualPaymentSection = document.querySelector('#manual-payment-section');
const manualPaymentDetailsElement = document.querySelector('#manual-payment-details');
const paginationContainer = document.querySelector('#manual-payment-pagination');

const searchUserForm = document.querySelector('#search-user-form');
const searchUserInput = document.querySelector('#search-user-input');
const searchUserButton = document.querySelector('#search-user-button');


const showPayment = document.querySelector('#show-payment');
const manualPaymentTableBody = document.querySelector('#manual-payment-table-body');

let manualPaymentList = null;

if(manualPaymentSection) {
  if(!manualPaymentList) {
    manualPaymentList = new PaginatedAdminPaymentList({
      container: manualPaymentTableBody,
      paginationContainer,
      endpoint: '/api/v1/payments',
      type: 'payments',
      itemsPerPage: 5,
      sort: 'paymentDate',
      fromDate: undefined,
      toDate: undefined,
    });
    setupShowHandler(showPayment, manualPaymentList);
    searchUserForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const search =  formData.get('search-input').trim();

      if(!search) {
        manualPaymentDetailsElement.classList.add('visually-hidden');
        return;
      };

      try {
        buttonSpinner(searchUserButton, 'Search', 'Searching');

        manualPaymentList.endpoint = `/api/v1/payments?email=${search}`;
        await manualPaymentList.render();
        manualPaymentDetailsElement.classList.remove('visually-hidden');
      } catch(err) {
        manualPaymentDetailsElement.classList.add('visually-hidden');
        showAlert('error', err.response?.data?.message || 'An error occurred while searching for user.');
      } finally {
        buttonSpinner(searchUserButton, 'Search', 'Searching');
      }
    });
  }
}