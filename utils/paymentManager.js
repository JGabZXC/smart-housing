class CreatePayment {
  constructor({
    modelInstance,
    user,
    fromDate,
    toDate,
    stripeSessionId = null,
    paymentIntentId = null,
    type = 'manual',
  }) {
    this.modelInstance = modelInstance;
    this.user = user;
    this.fromDate = fromDate;
    this.toDate = toDate;
    this.stripeSessionId = stripeSessionId;
    this.paymentIntentId = paymentIntentId;
    this.type = type;
  }

  async addPaymentDate(amount = 100) {
    return await this.modelInstance.create({
      user: this.user._id,
      address: this.user.address,
      amount: amount,
      dateRange: {
        from: this.fromDate,
        to: this.toDate,
      },
      stripeSessionId: this.stripeSessionId,
      paymentIntentId: this.paymentIntentId,
      paymentMethod: this.type,
    });
  }

  isValidMonthPeriod(startDate, endDate) {
    // Create a date that's exactly 1 month after startDate
    const oneMonthLater = new Date(startDate);
    oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);

    // Period is valid if it's exactly 1 month (June 1 - July 1)
    // or spans multiple months (June 1 - August 1)
    return endDate >= oneMonthLater;
  }

  async hasPaymentPeriod(startDate, endDate) {
    return await this.modelInstance.findOne({
      user: this.user._id,
      'dateRange.from': startDate,
      'dateRange.to': endDate,
    });
  }

  async findOverlappingPeriods(startDate, endDate) {
    const payments = await this.modelInstance.find({
      user: this.user._id,
      'dateRange.from': { $lt: endDate },
      'dateRange.to': { $gt: startDate },
    });

    if (!payments || payments.length === 0) return false;

    return payments.length > 0;
  }
}

function getMonthName(dateRange) {
  // Split the dateRange string into start and end parts
  const { from, to } = dateRange;
  // Options for formatting the month name
  const options = { month: 'long', year: 'numeric' };

  // Format the dates to display month name and year
  const startMonthName = from.toLocaleDateString('en-US', options);
  const endMonthName = to.toLocaleDateString('en-US', options);

  return {
    startMonthName,
    endMonthName,
  };
}

function normalizeDates(startDate, endDate) {
  const fromDate = new Date(startDate);
  const toDate = new Date(endDate);

  const normalizedStart = new Date(
    Date.UTC(fromDate.getFullYear(), fromDate.getMonth(), 1),
  );
  const normalizedEnd = new Date(
    Date.UTC(toDate.getFullYear(), toDate.getMonth(), 1),
  );

  return {
    start: normalizedStart,
    end: normalizedEnd,
  };
}

function getNumberOfMonths(startDate, endDate) {
  const startYear = startDate.getFullYear();
  const startMonth = startDate.getMonth();
  const endYear = endDate.getFullYear();
  const endMonth = endDate.getMonth();

  // Calculate the total number of months
  let months = (endYear - startYear) * 12 + (endMonth - startMonth);

  // Adjust for partial months
  if (endDate.getDate() < startDate.getDate()) {
    months -= 1;
  }

  return months;
}

async function validatePaymentPeriod(paymentManager) {
  const { fromDate, toDate } = paymentManager;

  // Check date validity
  if (toDate < fromDate) throw new Error('To date is before From date.');

  if (!paymentManager.isValidMonthPeriod(fromDate, toDate))
    throw new Error(
      'Payment period must cover at least one full calendar month',
    );

  // Check for duplicates
  if (await paymentManager.hasPaymentPeriod(fromDate, toDate))
    throw new Error('Duplicate payment period detected');

  // Check for overlapping periods
  if (await paymentManager.findOverlappingPeriods(fromDate, toDate))
    throw new Error('Payment period overlaps with existing period');
}

function generateMonthlyStatement(payments, year) {
  const monthlyDues = 100; // Monthly dues in pesos
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  // Initialize monthly statement
  const monthlyBreakdown = months.map((month, index) => ({
    month,
    monthNumber: index + 1,
    status: 'unpaid',
    amountDue: monthlyDues,
    amountPaid: 0,
    remainingBalance: monthlyDues,
    paymentDate: null,
    paymentId: null
  }));

  // Sort payments by payment date to process them chronologically
  const sortedPayments = payments.sort((a, b) => new Date(a.paymentDate) - new Date(b.paymentDate));
  
  for (const payment of sortedPayments) {
    // Get the months covered by this payment's date range
    const fromMonth = payment.dateRange.from.getMonth();
    const toMonth = payment.dateRange.to.getMonth();
    const fromYear = payment.dateRange.from.getFullYear();
    const toYear = payment.dateRange.to.getFullYear();
    
    // Calculate how many months this payment should cover
    let monthsCovered = 0;
    if (fromYear === toYear) {
      monthsCovered = toMonth - fromMonth;
    } else {
      // Payment spans multiple years
      monthsCovered = (12 - fromMonth) + (toYear - fromYear - 1) * 12 + toMonth;
    }
    
    // If payment spans across years, only process months within the requested year
    if (fromYear <= year && toYear >= year) {
      const startMonth = fromYear < year ? 0 : fromMonth;
      const endMonth = toYear > year ? 11 : toMonth - 1; // -1 because toMonth is exclusive in payment logic
      
      let remainingPaymentAmount = payment.amount;
      
      // Apply payment to the months in the date range
      for (let monthIndex = startMonth; monthIndex <= endMonth && remainingPaymentAmount > 0; monthIndex++) {
        const monthData = monthlyBreakdown[monthIndex];
        const amountNeeded = monthData.remainingBalance;
        
        if (remainingPaymentAmount >= amountNeeded) {
          // Full payment for this month
          monthData.amountPaid += amountNeeded;
          monthData.remainingBalance = 0;
          monthData.status = 'paid';
          monthData.paymentDate = payment.paymentDate;
          monthData.paymentId = payment._id;
          remainingPaymentAmount -= amountNeeded;
        } else {
          // Partial payment for this month
          monthData.amountPaid += remainingPaymentAmount;
          monthData.remainingBalance -= remainingPaymentAmount;
          monthData.status = 'partial';
          monthData.paymentDate = payment.paymentDate;
          monthData.paymentId = payment._id;
          remainingPaymentAmount = 0;
        }
      }
    }
  }
  
  // Calculate totals
  const totalPaid = monthlyBreakdown.reduce((sum, month) => sum + month.amountPaid, 0);
  const totalDue = months.length * monthlyDues;
  const totalRemaining = monthlyBreakdown.reduce((sum, month) => sum + month.remainingBalance, 0);
  
  return {
    year,
    monthlyBreakdown,
    summary: {
      totalDue,
      totalPaid,
      totalRemaining,
      monthsFullyPaid: monthlyBreakdown.filter(m => m.status === 'paid').length,
      monthsPartiallyPaid: monthlyBreakdown.filter(m => m.status === 'partial').length,
      monthsUnpaid: monthlyBreakdown.filter(m => m.status === 'unpaid').length
    }
  };
}

function getAvailableYears() {
  const currentYear = new Date().getFullYear();
  const years = [];
  
  // Include current year and next 5 years
  for (let i = 0; i < 6; i++) {
    years.push(currentYear + i);
  }
  
  return years;
}

module.exports = {
  CreatePayment,
  getMonthName,
  normalizeDates,
  getNumberOfMonths,
  validatePaymentPeriod,
  generateMonthlyStatement,
  getAvailableYears,
};
