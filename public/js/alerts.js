/* eslint-disable */
export const hideAlert = () => {
  const el = document.querySelector('.alert-con');

  if (el) el.parentElement.removeChild(el);
};

// type is 'success' or 'error'
export const showAlert = (type, msg, time = 5) => {
  hideAlert();
  // const markup = `<!--<div class="alert alert&#45;&#45;${type}">${msg}</div>-->`;
  const markup = `<div class="container alert-con position-sticky w-100 z-3">
    <div class="alert alert-${type === 'error' ? 'danger' : 'success'} alert-dismissible fade show w-100" role="alert"><span>${msg}</span>
      <button class="btn-close" type="button" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
  </div>`
  document.querySelector('body').insertAdjacentHTML('afterbegin', markup);
  window.setTimeout(hideAlert, time * 1000);
};

// <div className="container position-sticky w-100 z-3">
//   <div className="alert alert-warning alert-dismissible fade show w-100" role="alert"><strong>Holy
//     guacamole!</strong><span> You should check in on some of those fields below. </span>
//     <button className="btn-close" type="button" data-bs-dismiss="alert" aria-label="Close"></button>
//   </div>
// </div>