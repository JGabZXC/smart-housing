/* eslint-disable */

import { showAlert } from './alerts.js';
// import Stripe from 'stripe';

const stripe = Stripe('pk_test_51QwOPPClThVOR2ixkE3rzDKQQYLle1QBOujl0hWgtIpWH94iMUulfvWPPeHakIrWMD2XeE2zZdXHUSNNDH2BUJik00A03piR06');

export const payWithStripe = async (dateRange) =>{
  try {
    const session = await axios(`/api/v1/payments/payment-session`, {
      method: 'POST',
      data: {
        dateRange
      }
    });

    await stripe.redirectToCheckout({
      sessionId: session.data.session.id
    });
  } catch(err) {
    showAlert('error', err.response.data.message);
  }
}

const fromDate = document.querySelector('#from-date');
const toDate = document.querySelector('#to-date');
const paymentForm = document.querySelector('#payment-form');

if(paymentForm) {
  paymentForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const from = fromDate.value; // e.g., "2024-06-01"
    const to = toDate.value;     // e.g., "2024-08-01"
    const fromMMYYYY = from ? from.slice(5, 7) + from.slice(0, 4) : '';
    const toMMYYYY = to ? to.slice(5, 7) + to.slice(0, 4) : '';

    const dateRange = `${fromMMYYYY}-${toMMYYYY}`;

    try {
      await payWithStripe(dateRange);
    } catch (err) {
      showAlert('error', err.response.data.message);
    }
  })
}