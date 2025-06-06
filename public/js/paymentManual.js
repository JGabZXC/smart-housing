/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';
import { buttonSpinner } from './_eventAndProjHelper';

const payDuesForm = document.querySelector('#pay-dues-form');
const table = document.querySelector('#dues-table');
const searchResidentDue = document.querySelector('#search-resident-due');
const insertPaymentButton = document.querySelector("#insert-payment-btn");
const customAmount = document.querySelector('#custom-amount');
const amountInput = document.querySelector('#amount');

if(payDuesForm) {
  const calculateAmount = (from, to) => {
    return (
      ((to.getFullYear() - from.getFullYear()) * 12 +
        (to.getMonth() - from.getMonth())) *
      1000
    );
  }
  const validateDates = (from, to) => {
    if (isNaN(from) || isNaN(to)) {
      showAlert('error', 'Please select a valid date', 10);
      return false;
    }
    if (to < from) {
      showAlert('error', 'The "From" date must be earlier than the "To" date', 10);
      return false;
    }
    if (from.getTime() === to.getTime()) {
      showAlert('error', 'The "From" date and "To" date must not be the same', 10);
      return false;
    }
    return true;
  }
  const toggleCustomAmount = (isCustom) => {
    if (isCustom) {
      amountInput.removeAttribute('readonly');
      amountInput.classList.remove('bg-secondary', 'text-white');
      amountInput.classList.add('text-black');
    } else {
      amountInput.setAttribute('readonly', true);
      amountInput.classList.add('bg-secondary', 'text-white');
      amountInput.classList.remove('text-black');
    }
  };


  payDuesForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.querySelector('#email').value;
    let from = document.querySelector('#from-date').value;
    from = new Date(from);
    let to = document.querySelector('#to-date').value;
    to = new Date(to);

    if (!validateDates(from, to)) return;

    let amount = amountInput.value;

    if (!customAmount.checked) {
      amount = calculateAmount(from, to);
    }

    // Format date strings
    const fromFormatted =
      (from.getMonth() + 1).toString().padStart(2, '0') + from.getFullYear();
    const toFormatted =
      (to.getMonth() + 1).toString().padStart(2, '0') + to.getFullYear();
    const dateRange = `${fromFormatted}-${toFormatted}`;


    buttonSpinner(insertPaymentButton, 'Confirm', 'Inserting payment');
    try {
      const res = await axios({
        method: 'POST',
        url: '/api/v1/payments',
        data: { email, amount, dateRange },
      });

      if (res.data.status === 'success') {
        showAlert('success', 'Payment inserted successfully');
        payDuesForm.reset();
      }
    } catch (err) {
      showAlert('error', err.response?.data?.message || 'An error occurred');
    } finally {
      buttonSpinner(insertPaymentButton, 'Confirm', 'Inserting payment');
      toggleCustomAmount(false);
    }

  })

  document.querySelector('#to-date').addEventListener('change', () => {
    if(customAmount.checked) return;

    let from = document.querySelector('#from-date').value;
    from = new Date(from);
    let to = document.querySelector('#to-date').value;
    to = new Date(to);

    if (!validateDates(from, to)) return showAlert('error', 'Please select a valid date', 10);

    if (to < from)
      return showAlert(
        'error',
        'The "From" date must be earlier than the "To" date',
        10,
      );

    amountInput.value = calculateAmount(from, to);
  })

  customAmount.addEventListener('change', () => {
    toggleCustomAmount(customAmount.checked);
  })

}

if(searchResidentDue) {
  // table.innerHTML = '<p>Try searching a resident email to view their dues</p>';

  const tableBody = table.querySelector('tbody');
  searchResidentDue.addEventListener('click', async () => {
    const emailValue = document.querySelector('#resident-email').value.trim();
    tableBody.innerHTML = '';

    if(emailValue === '') return showAlert('error', 'Please enter a valid email');
    buttonSpinner(searchResidentDue, 'Search', 'Searching');
    try {
      const res = await axios({
        method: 'GET',
        url: `/api/v1/payments?email=${emailValue}`
      });

      const data = res.data.data.doc;

      if (data.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No payment records found for this email</td></tr>';
        return;
      }

      data.forEach(payment => {
        const row = document.createElement('tr');

        // Format date to display as Month Day, Year
        const paidOn = new Date(payment.paymentDate);
        const formattedDate = paidOn.toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        });

        row.innerHTML = `
          <td>${payment.user.email || emailValue}</td>
          <td>${payment.user.name || 'N/A'}</td>
          <td>${payment.address?.completeAddress || 'N/A'}</td>
          <td>₱${payment.amount}</td>
          <td>${payment.formattedDateRange}</td>
          <td>${formattedDate}</td>
        `;

        tableBody.appendChild(row);
      });
    } catch (err) {
      showAlert('error', err.response.data.message);
    } finally {
      buttonSpinner(searchResidentDue, 'Search', 'Searching');
    }
  })
}