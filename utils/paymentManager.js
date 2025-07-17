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

  async hasPaymentPeriod(fromDate, toDate, currentAmount = 0) {
    const payments = await this.modelInstance.find({
      user: this.user._id,
      'dateRange.from': { $lte: toDate },
      'dateRange.to': { $gte: fromDate },
    });

    if (!payments || payments.length === 0) return false;

    // Check each month in the requested period
    const monthKeys = this.getMonthKeys(fromDate, toDate);
    let remainingCurrentAmount = currentAmount;

    for (const monthKey of monthKeys) {
      let totalForMonth = 0;

      // Calculate existing payments for this specific month using sequential logic
      payments.forEach((payment) => {
        const paymentAmount = this.calculateSequentialPaymentForMonth(
          payment,
          monthKey,
        );
        totalForMonth += paymentAmount;
      });

      // Calculate how much of current payment would apply to this month
      const availableSpace = Math.max(0, 100 - totalForMonth);
      const currentPaymentForMonth = Math.min(
        remainingCurrentAmount,
        availableSpace,
      );

      console.log(
        `Month ${monthKey}: existing ${totalForMonth}, adding ${currentPaymentForMonth}, remaining space ${availableSpace}`,
      );

      // If this month is already fully paid (100 pesos)
      if (totalForMonth >= 100) {
        // If we still have amount to pay and this month is full, it's an error
        if (remainingCurrentAmount > 0) return true;
      }

      // If adding current payment would exceed 100 for this month
      if (totalForMonth + currentPaymentForMonth > 100) return true;

      // Reduce remaining amount for next month
      remainingCurrentAmount -= currentPaymentForMonth;

      // If no more payment amount left, we're good
      if (remainingCurrentAmount <= 0) break;
    }

    return false; // Allow payment
  }

  // New method to calculate payment amount for a specific month using sequential logic
  calculateSequentialPaymentForMonth(payment, monthKey) {
    const [targetYear, targetMonth] = monthKey.split('-').map(Number);

    const paymentStart = new Date(
      payment.dateRange.from.getFullYear(),
      payment.dateRange.from.getMonth(),
      1,
    );
    const paymentEnd = new Date(
      payment.dateRange.to.getFullYear(),
      payment.dateRange.to.getMonth(),
      1,
    );
    const targetDate = new Date(targetYear, targetMonth, 1);

    // Check if payment covers this month
    if (targetDate < paymentStart || targetDate > paymentEnd) {
      return 0;
    }

    // Apply payment sequentially month by month, handling year boundaries correctly
    let remainingAmount = payment.amount;
    const currentDate = new Date(
      paymentStart.getFullYear(),
      paymentStart.getMonth(),
      1,
    );

    while (currentDate <= paymentEnd && remainingAmount > 0) {
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth();

      const isTargetMonth =
        currentYear === targetYear && currentMonth === targetMonth;

      // Calculate amount used for current month (up to 100 pesos)
      const amountUsedThisMonth = Math.min(remainingAmount, 100);

      if (isTargetMonth) {
        // Return the amount applied to this month
        return amountUsedThisMonth;
      }

      // Move to next month, reducing remaining amount by what was used
      remainingAmount -= amountUsedThisMonth;

      // Properly increment month, handling year boundary
      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    return 0;
  }

  // Helper method to get number of months between dates
  getMonthsBetweenDates(fromDate, toDate) {
    const startYear = new Date(fromDate).getFullYear();
    const startMonth = new Date(fromDate).getMonth();
    const endYear = new Date(toDate).getFullYear();
    const endMonth = new Date(toDate).getMonth();
    return (endYear - startYear) * 12 + (endMonth - startMonth) + 1;
  }

  // Helper method to get month keys for a date range
  getMonthKeys(fromDate, toDate) {
    const keys = [];
    const current = new Date(
      new Date(fromDate).getFullYear(),
      new Date(fromDate).getMonth(),
      1,
    );
    const end = new Date(
      new Date(toDate).getFullYear(),
      new Date(toDate).getMonth(),
      1,
    );

    while (current <= end) {
      const year = current.getFullYear();
      const month = current.getMonth();
      keys.push(`${year}-${month}`);

      // Properly increment month, handling year boundary
      current.setMonth(current.getMonth() + 1);
    }

    return keys;
  }

  // Helper method to check if a payment covers a specific month
  paymentCoversMonth(paymentFrom, paymentTo, monthKey) {
    const [year, month] = monthKey.split('-').map(Number);
    const monthDate = new Date(year, month, 1);

    const paymentStartMonth = new Date(
      paymentFrom.getFullYear(),
      paymentFrom.getMonth(),
      1,
    );
    const paymentEndMonth = new Date(
      paymentTo.getFullYear(),
      paymentTo.getMonth(),
      1,
    );

    return monthDate >= paymentStartMonth && monthDate <= paymentEndMonth;
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

function calculateFullMonths(fromDateStr, toDateStr) {
  let fromDate;
  let toDate;
  if (!(fromDateStr instanceof Date) || !(toDateStr instanceof Date)) {
    fromDate = new Date(fromDateStr);
    toDate = new Date(toDateStr);
  } else {
    fromDate = fromDateStr;
    toDate = toDateStr;
  }

  // Check if fromDate is before toDate
  if (fromDate >= toDate) {
    return { isValid: false, months: 0 };
  }

  // Check if fromDate is the first day of the month
  if (fromDate.getDate() !== 1) {
    return { isValid: false, months: 0 };
  }

  // Check if toDate is the last day of the month
  const lastDayOfToMonth = new Date(
    toDate.getFullYear(),
    toDate.getMonth() + 1,
    0,
  );
  if (toDate.getDate() !== lastDayOfToMonth.getDate()) {
    return { isValid: false, months: 0 };
  }

  // Calculate the number of months properly across years
  const fromYear = fromDate.getFullYear();
  const fromMonth = fromDate.getMonth();
  const toYear = toDate.getFullYear();
  const toMonth = toDate.getMonth();

  const months = (toYear - fromYear) * 12 + (toMonth - fromMonth) + 1;

  return { isValid: true, months: months };
}

async function validatePaymentPeriod(paymentManager, paymentAmount) {
  const { fromDate, toDate } = paymentManager;
  // Check for duplicates
  if (await paymentManager.hasPaymentPeriod(fromDate, toDate, paymentAmount))
    throw new Error(
      'Payment period already fully paid or would exceed 100 pesos',
    );

  // Check for overlapping periods
  // if (await paymentManager.findOverlappingPeriods(fromDate, toDate))
  //   throw new Error('Payment period overlaps with existing period');
}

function generateMonthlyStatement(payments, year) {
  const monthlyDues = 100; // Monthly dues in pesos
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
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
    paymentId: null,
  }));

  // Sort payments by payment date to process them chronologically
  const sortedPayments = payments.sort(
    (a, b) => new Date(a.paymentDate) - new Date(b.paymentDate),
  );

  sortedPayments.forEach((payment) => {
    // Apply sequential payment logic for each month in the requested year
    for (let monthIndex = 0; monthIndex < 12; monthIndex += 1) {
      const monthKey = `${year}-${monthIndex}`;

      // Use the same sequential logic as calculateSequentialPaymentForMonth
      const paymentAmountForMonth = calculateSequentialPaymentForMonth(
        payment,
        monthKey,
      );

      if (paymentAmountForMonth > 0) {
        const monthData = monthlyBreakdown[monthIndex];
        const amountToApply = Math.min(
          paymentAmountForMonth,
          monthData.remainingBalance,
        );

        monthData.amountPaid += amountToApply;
        monthData.remainingBalance -= amountToApply;

        if (monthData.remainingBalance === 0) {
          monthData.status = 'paid';
        } else if (monthData.amountPaid > 0) {
          monthData.status = 'partial';
        }

        monthData.paymentDate = payment.paymentDate;
        monthData.paymentId = payment._id;
      }
    }
  });

  // Calculate totals
  const totalPaid = monthlyBreakdown.reduce(
    (sum, month) => sum + month.amountPaid,
    0,
  );
  const totalDue = months.length * monthlyDues;
  const totalRemaining = monthlyBreakdown.reduce(
    (sum, month) => sum + month.remainingBalance,
    0,
  );

  return {
    year,
    monthlyBreakdown,
    summary: {
      totalDue,
      totalPaid,
      totalRemaining,
      monthsFullyPaid: monthlyBreakdown.filter((m) => m.status === 'paid')
        .length,
      monthsPartiallyPaid: monthlyBreakdown.filter(
        (m) => m.status === 'partial',
      ).length,
      monthsUnpaid: monthlyBreakdown.filter((m) => m.status === 'unpaid')
        .length,
    },
  };
}

// Helper function to use the same sequential logic
function calculateSequentialPaymentForMonth(payment, monthKey) {
  const [targetYear, targetMonth] = monthKey.split('-').map(Number);

  const paymentStart = new Date(
    payment.dateRange.from.getFullYear(),
    payment.dateRange.from.getMonth(),
    1,
  );
  const paymentEnd = new Date(
    payment.dateRange.to.getFullYear(),
    payment.dateRange.to.getMonth(),
    1,
  );
  const targetDate = new Date(targetYear, targetMonth, 1);

  // Check if payment covers this month
  if (targetDate < paymentStart || targetDate > paymentEnd) {
    return 0;
  }

  // Apply payment sequentially month by month
  let remainingAmount = payment.amount;
  const currentDate = new Date(
    paymentStart.getFullYear(),
    paymentStart.getMonth(),
    1,
  );

  while (currentDate <= paymentEnd && remainingAmount > 0) {
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    const isTargetMonth =
      currentYear === targetYear && currentMonth === targetMonth;
    const amountUsedThisMonth = Math.min(remainingAmount, 100);

    if (isTargetMonth) {
      return amountUsedThisMonth;
    }

    remainingAmount -= amountUsedThisMonth;
    currentDate.setMonth(currentDate.getMonth() + 1);
  }

  return 0;
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
  calculateFullMonths,
  validatePaymentPeriod,
  generateMonthlyStatement,
  getAvailableYears,
};
