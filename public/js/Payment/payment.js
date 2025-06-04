/* eslint-disable */

import { showAlert } from '../utils/alerts.js';
import { buttonSpinner } from '../utils/spinner.js';

const paymentStripeForm = document.querySelector('#payment-stripe-form');
const payDuesButton = document.querySelector('#pay-dues-button');

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

if(paymentStripeForm) {
  paymentStripeForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(paymentStripeForm);
    const fromDate = formData.get('from-date');
    const toDate = formData.get('to-date');
    const fromMMYYYY = fromDate ? fromDate.slice(5, 7) + fromDate.slice(0, 4) : '';
    const toMMYYYY = toDate ? toDate.slice(5, 7) + toDate.slice(0, 4) : '';

    const dateRange = `${fromMMYYYY}-${toMMYYYY}`;

    console.log(fromDate, toDate);

    if(!fromDate || !toDate) {
      return showAlert('error', 'Please select a valid date range.');
    }

    try {
      buttonSpinner(payDuesButton, "Pay with Stripe <i class=\"bi bi-stripe\"></i>", "Processing payment");
      await payWithStripe(dateRange);
    } catch (err) {
      showAlert('error', err.response.data.message);
    } finally {
      buttonSpinner(payDuesButton, "Pay with Stripe <i class=\"bi bi-stripe\"></i>", "Processing payment");
    }
  });
}