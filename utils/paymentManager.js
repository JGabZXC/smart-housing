class CreatePayment {
  constructor({
    modelInstance,
    user,
    fromDate,
    toDate,
    stripeSessionId = null,
    paymentIntentId = null,
    type = 'manual',
    or = 'unset',
  }) {
    this.modelInstance = modelInstance;
    this.user = user;
    this.fromDate = fromDate;
    this.toDate = toDate;
    this.stripeSessionId = stripeSessionId;
    this.paymentIntentId = paymentIntentId;
    this.type = type;
    this.or = or;
  }

  async addPaymentDate(amount = 100) {
    // For manual payments, intelligently adjust the date range and amount
    if (this.type === 'manual') {
      const adjustedPayment = await this.calculateOptimalPaymentRange(amount);
      this.stripeSessionId = this.or;

      // If no amount can be applied, throw an error
      if (adjustedPayment.amount === 0) {
        throw new Error(
          'No available months to apply payment. All months are already fully paid.',
        );
      }

      const payment = await this.modelInstance.create({
        user: this.user._id,
        address: this.user.address,
        amount: adjustedPayment.amount,
        dateRange: {
          from: adjustedPayment.fromDate,
          to: adjustedPayment.toDate,
        },
        stripeSessionId: this.stripeSessionId,
        paymentIntentId: this.paymentIntentId,
        paymentMethod: this.type,
      });

      // Return payment info including unused amount
      return {
        payment,
        unusedAmount: adjustedPayment.unusedAmount,
        appliedAmount: adjustedPayment.amount,
      };
    }

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

  async calculateOptimalPaymentRange(requestedAmount) {
    // Get existing payments to understand what's already paid
    const existingPayments = await this.modelInstance.find({
      user: this.user._id,
    });

    // Start from the requested start date
    const currentDate = new Date(this.fromDate);
    let remainingAmount = requestedAmount;
    let actualStartDate = null;
    let actualEndDate = null;

    // Find months that need payment
    const processedMonths = new Map(); // Track payments per month

    while (remainingAmount > 0) {
      const monthKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}`;

      // Calculate total paid for this month from existing payments
      let totalPaidForMonth = 0;
      existingPayments.forEach((payment) => {
        totalPaidForMonth += this.calculateSequentialPaymentForMonth(
          payment,
          monthKey,
        );
      });

      // Add any amount we've processed in this run
      totalPaidForMonth += processedMonths.get(monthKey) || 0;

      // Calculate available space in this month (max 100 pesos per month)
      const availableSpace = Math.max(0, 100 - totalPaidForMonth);

      if (availableSpace > 0) {
        // Set start date if this is the first month we're paying
        if (actualStartDate === null) {
          actualStartDate = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            1,
          );
        }

        // Calculate how much we can pay for this month
        const paymentForMonth = Math.min(remainingAmount, availableSpace);

        // Track what we're paying for this month
        processedMonths.set(
          monthKey,
          (processedMonths.get(monthKey) || 0) + paymentForMonth,
        );

        remainingAmount -= paymentForMonth;

        // Update end date to this month
        const lastDayOfMonth = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() + 1,
          0,
        );
        actualEndDate = lastDayOfMonth;

        // If this month isn't fully paid (100), don't move to next month yet
        if (totalPaidForMonth + paymentForMonth < 100 && remainingAmount > 0) {
          continue;
        }
      }

      // Move to next month
      currentDate.setMonth(currentDate.getMonth() + 1);

      // Safety check to avoid infinite loop
      if (
        currentDate.getFullYear() >
        new Date(this.fromDate).getFullYear() + 5
      ) {
        break;
      }
    }

    // If we couldn't place any payment, use original dates
    if (actualStartDate === null) {
      actualStartDate = this.fromDate;
      actualEndDate = this.toDate;
    }

    // Calculate the actual amount that will be used
    const actualAmount = requestedAmount - remainingAmount;

    return {
      fromDate: actualStartDate,
      toDate: actualEndDate,
      amount: actualAmount,
      unusedAmount: remainingAmount,
    };
  }

  async hasPaymentPeriod(fromDate, toDate, currentAmount = 0) {
    const payments = await this.modelInstance.find({
      user: this.user._id,
      'dateRange.from': { $lte: toDate },
      'dateRange.to': { $gte: fromDate },
    });

    if (!payments || payments.length === 0) return false;

    const monthKeys = this.getMonthKeys(fromDate, toDate);
    let remainingCurrentAmount = currentAmount;

    for (const monthKey of monthKeys) {
      let totalForMonth = 0;

      payments.forEach((payment) => {
        const paymentAmount = this.calculateSequentialPaymentForMonth(
          payment,
          monthKey,
        );
        totalForMonth += paymentAmount;
      });

      // Block payment if month is already fully paid
      if (totalForMonth >= 100) {
        return true; // Invalid payment, would overlap
      }

      // Calculate how much of current payment would apply to this month
      const availableSpace = Math.max(0, 100 - totalForMonth);
      const currentPaymentForMonth = Math.min(
        remainingCurrentAmount,
        availableSpace,
      );

      // Block payment if it would exceed allowed amount
      if (totalForMonth + currentPaymentForMonth > 100) {
        return true;
      }

      remainingCurrentAmount -= currentPaymentForMonth;
      if (remainingCurrentAmount <= 0) break;
    }

    return false; // Valid payment
  }
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

      current.setMonth(current.getMonth() + 1);
    }

    return keys;
  }

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

function calculateFullMonths(fromDate, toDate) {
  if (fromDate.getFullYear() < 2025 || toDate.getFullYear() < 2025) {
    return { isValid: false, months: 0 };
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
  const monthlyDues = 100;
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  // Track total paid per month globally
  const globalMonthlyPayments = new Map();

  // First pass: allocate payments sequentially across all months
  payments
    .sort((a, b) => new Date(a.paymentDate) - new Date(b.paymentDate))
    .forEach((payment) => {
      let remainingAmount = payment.amount;
      const startDate = new Date(payment.dateRange.from);
      const endDate = new Date(payment.dateRange.to);
      const currentDate = new Date(startDate);

      while (currentDate <= endDate && remainingAmount > 0) {
        const monthKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}`;
        const alreadyPaid = globalMonthlyPayments.get(monthKey) || 0;
        const toPay = Math.min(monthlyDues - alreadyPaid, remainingAmount);

        if (toPay > 0) {
          globalMonthlyPayments.set(monthKey, alreadyPaid + toPay);
          remainingAmount -= toPay;
        }
        currentDate.setMonth(currentDate.getMonth() + 1);
      }
    });

  // Build statement for the selected year
  const monthlyBreakdown = months.map((month, idx) => {
    const monthKey = `${year}-${idx}`;
    const paid = globalMonthlyPayments.get(monthKey) || 0;
    return {
      month,
      monthNumber: idx + 1,
      status: paid === 0 ? 'unpaid' : paid >= monthlyDues ? 'paid' : 'partial',
      amountDue: monthlyDues,
      amountPaid: paid,
      remainingBalance: monthlyDues - paid,
      paymentDate: null,
      paymentId: null,
    };
  });

  // Totals
  const totalPaid = monthlyBreakdown.reduce((sum, m) => sum + m.amountPaid, 0);
  const totalDue = months.length * monthlyDues;
  const totalRemaining = monthlyBreakdown.reduce((sum, m) => sum + m.remainingBalance, 0);

  return {
    year,
    monthlyBreakdown,
    summary: {
      totalDue,
      totalPaid,
      totalRemaining,
      monthsFullyPaid: monthlyBreakdown.filter((m) => m.status === 'paid').length,
      monthsPartiallyPaid: monthlyBreakdown.filter((m) => m.status === 'partial').length,
      monthsUnpaid: monthlyBreakdown.filter((m) => m.status === 'unpaid').length,
    },
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
  getNumberOfMonths,
  calculateFullMonths,
  validatePaymentPeriod,
  generateMonthlyStatement,
  getAvailableYears,
};
