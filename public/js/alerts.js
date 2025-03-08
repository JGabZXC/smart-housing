/* eslint-disable */
export const hideAlert = () => {
  const el = document.querySelector('.alert-con');

  if (el) el.parentElement.removeChild(el);
};

// type is 'success' or 'error'
export const showAlert = (type, msg, time = 5) => {
  hideAlert();
  const markup = `<div class="container alert-con position-sticky w-100 z-3" style="top: 10px;">
    <div class="alert alert-${type === 'error' ? 'danger' : 'success'} alert-dismissible fade show w-100" role="alert"><span>${msg}</span>
      <button class="btn-close" type="button" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
  </div>`
  document.querySelector('body').insertAdjacentHTML('afterbegin', markup);
  window.setTimeout(hideAlert, time * 1000);
};