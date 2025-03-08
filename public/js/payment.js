/* eslint-disable */

import axios from 'axios';
import { showAlert } from './alerts';
// import Stripe from 'stripe';

const stripe = Stripe('pk_test_51QwOPPClThVOR2ixkE3rzDKQQYLle1QBOujl0hWgtIpWH94iMUulfvWPPeHakIrWMD2XeE2zZdXHUSNNDH2BUJik00A03piR06');

export const payWithStripe = async (amount, dateRange) =>{
  try {
    const session = await axios(`/api/v1/payments/checkout-session?amount=${amount}&dateRange=${dateRange}`);

    await stripe.redirectToCheckout({
      sessionId: session.data.session.id
    });
  } catch(err) {
    showAlert('error', err.message);
  }
}