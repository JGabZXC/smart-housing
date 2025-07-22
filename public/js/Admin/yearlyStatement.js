/* eslint-disable */

class YearlyStatementManager {
  constructor() {
    this.currentYear = new Date().getFullYear();
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.populateYearSelect();
    this.loadStatement(this.currentYear);
  }

  setupEventListeners() {
    document.getElementById('yearSelect').addEventListener('change', (e) => {
      if (e.target.value) {
        this.loadStatement(parseInt(e.target.value));
      }
    });

    document.getElementById('refreshBtn').addEventListener('click', () => {
      const selectedYear = document.getElementById('yearSelect').value;
      if (selectedYear) {
        this.loadStatement(parseInt(selectedYear));
      }
    });

    // Event delegation for month card clicks
    document.getElementById('monthlyBreakdown').addEventListener('click', (e) => {
      const monthCard = e.target.closest('.month-card');
      if (monthCard && !monthCard.classList.contains('no-payments')) {
        const monthName = monthCard.dataset.month;
        const transactionsData = monthCard.dataset.transactions;

        if (monthName && transactionsData) {
          try {
            const transactions = JSON.parse(transactionsData);
            this.showTransactions(monthName, transactions);
          } catch (error) {
            console.error('Error parsing transaction data:', error);
          }
        }
      }
    });
  }

  populateYearSelect() {
    const yearSelect = document.getElementById('yearSelect');
    const currentYear = new Date().getFullYear();

    for (let year = 2025; year <= currentYear + 5; year++) {
      const option = document.createElement('option');
      option.value = year;
      option.textContent = year;
      if (year === this.currentYear) {
        option.selected = true;
      }
      yearSelect.appendChild(option);
    }
  }

  showLoading() {
    document.getElementById('loadingSpinner').classList.remove('d-none');
    document.getElementById('contentContainer').classList.add('d-none');
    document.getElementById('errorAlert').classList.add('d-none');
  }

  hideLoading() {
    document.getElementById('loadingSpinner').classList.add('d-none');
  }

  showError(message) {
    document.getElementById('errorMessage').textContent = message;
    document.getElementById('errorAlert').classList.remove('d-none');
    document.getElementById('contentContainer').classList.add('d-none');
  }

  showContent() {
    document.getElementById('contentContainer').classList.remove('d-none');
    document.getElementById('errorAlert').classList.add('d-none');
  }

  async loadStatement(year) {
    this.showLoading();

    try {
      const response = await fetch(`/api/v1/payments/yearly-statement/${year}`);
      const data = await response.json();

      if (data.status === 'success') {
        this.renderStatement(data.data);
        this.showContent();
      } else {
        throw new Error(data.message || 'Failed to load statement');
      }
    } catch (error) {
      console.error('Error loading statement:', error);
      this.showError(error.message || 'Failed to load yearly statement');
    } finally {
      this.hideLoading();
    }
  }

  renderStatement(data) {
    this.renderSummary(data.summary);
    this.renderMonthlyBreakdown(data.monthlyBreakdown);
  }

  renderSummary(summary) {
    document.getElementById('yearlyTotal').textContent = `₱${summary.yearlyTotal.toLocaleString()}`;
    document.getElementById('totalTransactions').textContent = summary.totalTransactions.toLocaleString();
    document.getElementById('averageMonthly').textContent = `₱${summary.averageMonthlyRevenue.toLocaleString()}`;
    document.getElementById('topMonth').textContent = summary.topPerformingMonth?.month || '-';
    document.getElementById('activeMonths').textContent = summary.monthsWithPayments;
    document.getElementById('activePercentage').textContent = `${summary.activeMonthsPercentage}%`;
  }

  renderMonthlyBreakdown(monthlyData) {
    const container = document.getElementById('monthlyBreakdown');
    container.innerHTML = '';

    monthlyData.forEach(month => {
      const hasPayments = month.transactionCount > 0;
      const cardClass = hasPayments ? 'month-card' : 'month-card no-payments';

      const monthCard = document.createElement('div');
      monthCard.className = 'col-xl-2 col-lg-3 col-md-4 col-sm-6 mb-3';

      monthCard.innerHTML = `
        <div class="card ${cardClass} h-100" 
             style="cursor: ${hasPayments ? 'pointer' : 'default'}"
             data-month="${month.month}"
             data-transactions='${hasPayments ? JSON.stringify(month.transactions) : '[]'}'>
          <div class="card-body text-center">
            <h6 class="card-title text-primary mb-2">${month.month}</h6>
            <h4 class="text-dark mb-1">₱${Math.round(month.monthlyTotal).toLocaleString()}</h4>
            <small class="text-muted">
              ${month.transactionCount} transaction${month.transactionCount !== 1 ? 's' : ''}
            </small>
            ${hasPayments ? '<div class="mt-2"><i class="bi bi-eye text-primary"></i></div>' : ''}
          </div>
        </div>
      `;

      container.appendChild(monthCard);
    });
  }

  showTransactions(month, transactions) {
    document.getElementById('modalMonthTitle').textContent = `${month} Transactions`;

    const transactionsList = document.getElementById('transactionsList');
    transactionsList.innerHTML = '';

    if (transactions.length === 0) {
      transactionsList.innerHTML = '<p class="text-muted text-center">No transactions found for this month.</p>';
      return;
    }

    transactions.forEach((transaction) => {
      const transactionCard = document.createElement('div');
      transactionCard.className = 'card mb-3';

      const paymentMethod = transaction.paymentMethod === 'stripe' ?
        '<span class="badge bg-primary">Stripe</span>' :
        '<span class="badge bg-success">Manual</span>';

      transactionCard.innerHTML = `
        <div class="card-body">
          <div class="row">
            <div class="col-md-8">
              <h6 class="card-title mb-2">
                ${transaction.user.name}
                ${paymentMethod}
              </h6>
              <p class="card-text small text-muted mb-1">
                <i class="bi bi-envelope me-1"></i>${transaction.user.email}
              </p>
              <p class="card-text small text-muted mb-1">
                <i class="bi bi-calendar me-1"></i>
                Coverage: ${new Date(transaction.fromDate).toLocaleDateString()} -
                ${new Date(transaction.toDate).toLocaleDateString()}
              </p>
              ${transaction.or ? `<p class="card-text small text-muted mb-1">
                <i class="bi bi-receipt me-1"></i>OR: ${transaction.or}
              </p>` : ''}
            </div>
            <div class="col-md-4 text-md-end">
              <h5 class="text-primary mb-1">₱${Math.round(transaction.originalAmount).toLocaleString()}</h5>
              <small class="text-muted">Payment Amount</small>
              <p class="small text-muted mb-0">
                Paid: ${new Date(transaction.paymentDate).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      `;

      transactionsList.appendChild(transactionCard);
    });

    const modal = new bootstrap.Modal(document.getElementById('transactionModal'));
    modal.show();
  }
}

const yearlyStatementSection = document.querySelector('#yearlyStatementSection')

// Initialize the manager when the page loads
let yearlyManager;
if(yearlyStatementSection) {
  yearlyManager = new YearlyStatementManager();
}