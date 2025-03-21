/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

const payDuesForm = document.querySelector('#pay-dues-form');
const table = document.querySelector('#dues-table');
const searchResidentDue = document.querySelector('#search-resident-due');

export const paymentManual = async () => {
  console.log('hi');
}

if(payDuesForm) {
  document.querySelector('#insert-payment-btn').addEventListener('click', async () => {
    const email = document.querySelector('#email').value;
    let from = document.querySelector('#from-date').value;
    from = new Date(from);
    let to = document.querySelector('#to-date').value;
    to = new Date(to);

    if (isNaN(from) || isNaN(to))
      return showAlert('error', 'Please select a valid date', 10);

    if (to < from)
      return showAlert(
        'error',
        'The "From" date must be earlier than the "To" date',
        10,
      );

    const amount =
      ((to.getFullYear() - from.getFullYear()) * 12 +
        (to.getMonth() - from.getMonth())) *
      1000;
    from =
      (from.getMonth() + 1).toString().padStart(2, '0') +
      from.getFullYear();
    to =
      (to.getMonth() + 1).toString().padStart(2, '0') +
      to.getFullYear();



    document.querySelector('#amount').value = amount;

    if (from === to)
      return showAlert(
        'error',
        'The "From" date and "To" date must not be the same',
        10,
      );

    const dateRange = `${from}-${to}`;
    try {
      const res = await axios({
        method: 'POST',
        url: '/api/v1/payments',
        data: {
          email,
          amount,
          dateRange,
        }
      });

      if(res.status === 200) showAlert('success', 'Payment inserted successfully');
    } catch (err) {
      showAlert('error', err.response.data.message);
    }
  })
  document.querySelector('#to-date').addEventListener('change', () => {
    let from = document.querySelector('#from-date').value;
    from = new Date(from);
    let to = document.querySelector('#to-date').value;
    to = new Date(to);

    if (isNaN(from) || isNaN(to))
      return showAlert('error', 'Please select a valid date', 10);

    if (to < from)
      return showAlert(
        'error',
        'The "From" date must be earlier than the "To" date',
        10,
      );

    const amount =
      ((to.getFullYear() - from.getFullYear()) * 12 +
        (to.getMonth() - from.getMonth())) *
      1000;

    document.querySelector('#amount').value = amount;
  })
}

if(searchResidentDue) {
  // table.innerHTML = '<p>Try searching a resident email to view their dues</p>';
  const tableBody = table.querySelector('tbody');
  searchResidentDue.addEventListener('click', async () => {
    const emailValue = document.querySelector('#resident-email').value.trim();
    tableBody.innerHTML = '';

    if(emailValue === '') return showAlert('error', 'Please enter a valid email');

    try {
      const res = await axios({
        method: 'GET',
        url: `/api/v1/payments?email=${emailValue}`
      });

      const data = res.data.data.doc;

      console.log(data);

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
          <td>${payment.amount}</td>
          <td>${payment.dateRange}</td>
          <td>${formattedDate}</td>
        `;

        tableBody.appendChild(row);
      });
    } catch (err) {
      showAlert('error', err.response.data.message);
    }
  })
}