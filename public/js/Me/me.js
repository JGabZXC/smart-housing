/* eslint-disable */

import { buttonSpinner} from '../utils/spinner.js';
import { patchData, postData, fetchData } from '../utils/http.js';
import { showAlert } from '../utils/alerts.js';

const changePasswordForm = document.querySelector('#change-password-form');
const changePasswordFormButton = document.querySelector('#change-password-form-button');
const changeDetailsForm = document.querySelector('#change-details-form');
const changeDetailsFormButton = document.querySelector('#change-details-form-button');

const securityQuestionSelect = document.querySelector('#security-question');
const customQuestionContainer = document.querySelector('#custom-question-container');
const customQuestionInput = document.querySelector('#custom-question');
const securityQuestionForm = document.querySelector('#security-question-form');
const securityQuestionButton = document.querySelector('#security-question-button');
const verifyStepEl = document.querySelector('#verify-step');
const currentSecurityAnswer = document.querySelector('#current-security-answer');
const verifySecurityButton = document.querySelector('#verify-security-button');
const updateStepEl = document.querySelector('#update-step');
let answer = '';

export const yearSelect = document.getElementById('year-select');
export const currentYear = new Date().getFullYear();
const meContainer = document.querySelector('#me-container');

export async function loadPaymentStatement(year, url) {
  const tableBody = document.getElementById('payment-statement-body');
  const totalDue = document.getElementById('total-due');
  const totalPaid = document.getElementById('total-paid');
  const totalRemaining = document.getElementById('total-remaining');
  const monthsPaid = document.getElementById('months-paid');

  try {
    // Show loading state
    tableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center text-muted">
                        <div class="spinner-border spinner-border-sm me-2"></div>
                        Loading payment statement...
                    </td>
                </tr>
            `;

    const response = await fetchData(url ? url : `/api/v1/payments/statement/${year}`);

    if (response.status === 'success') {
      const statement = response.data.statement;
      const summary = statement.summary;

      // Update summary cards
      totalDue.textContent = `₱${summary.totalDue}`;
      totalPaid.textContent = `₱${summary.totalPaid}`;
      totalRemaining.textContent = `₱${summary.totalRemaining}`;
      monthsPaid.textContent = `${summary.monthsFullyPaid}/12`;

      // Clear table and populate with monthly data
      tableBody.innerHTML = '';

      statement.monthlyBreakdown.forEach(month => {
        const row = document.createElement('tr');

        // Determine status badge
        let statusBadge = '';
        if (month.status === 'paid') {
          statusBadge = '<span class="badge bg-success">Paid</span>';
        } else if (month.status === 'partial') {
          statusBadge = '<span class="badge bg-warning">Partial</span>';
        } else {
          statusBadge = '<span class="badge bg-danger">Unpaid</span>';
        }

        // Format payment date
        let paymentDate = '-';
        if (month.paymentDate) {
          paymentDate = new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: '2-digit',
            timeZone: 'Asia/Manila'
          }).format(new Date(month.paymentDate));
        }

        row.innerHTML = `
                        <td>${month.month}</td>
                        <td>${statusBadge}</td>
                        <td>₱${month.amountDue}</td>
                        <td>₱${month.amountPaid}</td>
                        <td>₱${month.remainingBalance}</td>
                        <td>${paymentDate}</td>
                    `;

        tableBody.appendChild(row);
      });

      // Populate year dropdown if availableYears is provided
      if (response.data.availableYears) {
        updateYearOptions(response.data.availableYears);
      }

    } else {
      throw new Error('Failed to load payment statement');
    }

  } catch (error) {
    console.error('Error loading payment statement:', error);
    tableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center text-danger">
                        <i class="bi bi-exclamation-triangle me-2"></i>
                        Error loading payment statement. Please try again.
                    </td>
                </tr>
            `;

    // Reset summary
    totalDue.textContent = '₱0';
    totalPaid.textContent = '₱0';
    totalRemaining.textContent = '₱0';
    monthsPaid.textContent = '0/12';
  }
}

export function updateYearOptions(availableYears) {
  const currentSelection = yearSelect.value;
  yearSelect.innerHTML = '';

  availableYears.forEach(year => {
    const option = document.createElement('option');
    option.value = year;
    option.textContent = year;
    if (year.toString() === currentSelection) {
      option.selected = true;
    }
    yearSelect.appendChild(option);
  });
}

if(meContainer) {
  // Set current year as default
  yearSelect.value = currentYear;

// Load initial payment statement
  loadPaymentStatement(currentYear);

// Handle year selection change
  yearSelect.addEventListener('change', function() {
    const selectedYear = parseInt(this.value);
    loadPaymentStatement(selectedYear);
  });
}

if(changePasswordForm) {
  changePasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const body = {
      currentPassword: formData.get('currentPassword'),
      password: formData.get('password'),
      confirmPassword: formData.get('confirmPassword')
    }
    try {
      buttonSpinner(changePasswordFormButton, 'Confirm', 'Loading');
      const response = await patchData(`/api/v1/users/me/changePassword`, body);
      if (response.status === 'success') {
        showAlert('success','Password changed successfully!');
        changePasswordForm.reset();
      }
    } catch (err) {
      showAlert('error', err.response.data.message || 'An error occurred while changing the password.');
    } finally {
      buttonSpinner(changePasswordFormButton, 'Confirm', 'Loading');
    }
  })
}

if(changeDetailsForm) {
  changeDetailsForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const body = {
      name: `${formData.get('first-name')} ${formData.get('middle-initial')} ${formData.get('last-name')}`.trim(),
      email: formData.get('email') || '',
      contactNumber: formData.get('number') || ''
    }
    try {
      buttonSpinner(changeDetailsFormButton, 'Confirm', 'Loading');
      const response = await patchData(`/api/v1/users/me/changeDetails`, body);
      if (response.status === 'success') {
        showAlert('success','Details changed successfully!');
        changeDetailsForm.reset();
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
    } catch (err) {
      showAlert('error', err.response.data.message || 'An error occurred while changing the details.');
    } finally {
      buttonSpinner(changeDetailsFormButton, 'Confirm', 'Loading');
    }
  })
}

if (securityQuestionSelect) {
  securityQuestionSelect.addEventListener('change', function() {
    if (this.value === 'Custom Question') {
      customQuestionContainer.style.display = 'block';
      customQuestionInput.required = true;
    } else {
      customQuestionContainer.style.display = 'none';
      customQuestionInput.required = false;
      customQuestionInput.value = '';
    }
  });
}

// Update the security question form submission handler
if (securityQuestionForm) {
  securityQuestionForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(securityQuestionForm);
    let securityQuestion = formData.get('securityQuestion');
    const customQuestion = formData.get('customQuestion');
    const securityAnswer = formData.get('securityAnswer');
    const confirmSecurityAnswer = formData.get('confirmSecurityAnswer');

    // Use custom question if "Custom Question" is selected
    if (securityQuestion === 'Custom Question') {
      if (!customQuestion || customQuestion.trim().length < 10) {
        showAlert('error', 'Custom question must be at least 10 characters long');
        return;
      }
      securityQuestion = customQuestion.trim();
    }

    // Validation
    if (!securityQuestion || !securityAnswer || !confirmSecurityAnswer) {
      showAlert('error', 'Please fill in all fields');
      return;
    }

    if (securityAnswer !== confirmSecurityAnswer) {
      showAlert('error', 'Secret answers do not match');
      return;
    }

    if (securityAnswer.length < 3) {
      showAlert('error', 'Secret answer must be at least 3 characters long');
      return;
    }

    let buttonText = securityQuestionButton.textContent;

    try {
      buttonSpinner(securityQuestionButton, buttonText, "Setting up");

      const body = {
        secretQuestion: securityQuestion,
        secretAnswer: securityAnswer,
        currentAnswer: answer,
      }

      const response = await patchData('/api/v1/users/me/securityAnswer', body);

      if (response.status === 'success') {
        showAlert('success', 'Secret Question updated successfully!');
        setTimeout(() => {
          location.reload();
        }, 1500);
      }
    } catch (error) {
      showAlert('error', error.response?.data?.message || 'Failed to update secret question');
    } finally {
      buttonSpinner(securityQuestionButton, buttonText, "Setting up");
      answer = '';
    }
  });
}

if(verifyStepEl) {
  verifySecurityButton.addEventListener('click', async () => {
    const securityAnswer = currentSecurityAnswer.value.trim();

    if(!securityAnswer) {
      return;
    }
    console.log(`Security Answer: ${securityAnswer}`); // Debugging line

    try {
      buttonSpinner(verifySecurityButton, "Verify", "Verifying");
      const response = await postData('/api/v1/users/me/verifySecretAnswer', { secretAnswer: securityAnswer });

      if(response.status === 'success') {
        showAlert('success', 'Secret answer verified successfully!');
        updateStepEl.classList.remove('d-none');
        updateStepEl.classList.add('d-flex');
        answer = securityAnswer; // Store the verified answer for later use
      }
    } catch (err) {
      showAlert('error', err.response?.data?.message || 'Failed to update secret question');
    } finally {
      buttonSpinner(verifySecurityButton, "Verify", "Verifying");
    }
  })
}