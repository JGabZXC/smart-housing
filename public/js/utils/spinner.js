/* eslint-disable */
export function buttonSpinner(target, defaultText, loadingText, keepDisabled = false) {
  const button = target;

  if(keepDisabled) {
    button.disabled = true;
    button.innerHTML = defaultText;
    return;
  }

  if(button.disabled) {
    button.disabled = false;
    button.innerHTML = defaultText;
    return;
  }

  button.disabled = true;
  button.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> ${loadingText}...`;
}

export function spinner(target, loadingText) {
  const element = target;

  element.innerHTML = `<p class="text-slate-600"><span class="spinner-border spinner-border-sm text-slate-900" role="status" aria-hidden="true"></span> ${loadingText}...</p>`;
}