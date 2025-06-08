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

export function spinner(target, loadingText = 'Loading') {
  const element = target;

  if (element.tagName === 'TBODY' || target.tagName === 'TABLE') {
    target.innerHTML = `
      <tr>
        <td colspan="100%" class="text-slate-600">
          <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> ${loadingText}
        </td>
      </tr>
    `;
  } else {
    element.innerHTML = `<p class="text-slate-600 p-2 m-0"><span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> ${loadingText}</p>`;
  }
}