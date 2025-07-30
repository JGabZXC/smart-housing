// paymentManager.js - Refactored for partial payment rollover to next month

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
    if (this.type === 'manual') {
      const allocation = await this.allocatePayment(amount);
      this.stripeSessionId = this.or;

      if (!allocation || allocation.allocations.length === 0) {
        throw new Error(
          'No available months to apply payment. All months are already fully paid.',
        );
      }

      // Only create one record if the range is not split
      if (allocation.allocations.length === 1) {
        const alloc = allocation.allocations[0];
        const payment = await this.modelInstance.create({
          user: this.user._id,
          address: this.user.address,
          amount: alloc.amount,
          dateRange: {
            from: alloc.fromDate,
            to: alloc.toDate,
          },
          stripeSessionId: this.stripeSessionId,
          paymentIntentId: this.paymentIntentId,
          paymentMethod: this.type,
        });
        return {
          payment,
          unusedAmount: allocation.unusedAmount,
          appliedAmount: allocation.totalApplied,
        };
      }
      // Multiple allocations/rollover
      const payments = [];
      for (const alloc of allocation.allocations) {
        payments.push(
          await this.modelInstance.create({
            user: this.user._id,
            address: this.user.address,
            amount: alloc.amount,
            dateRange: {
              from: alloc.fromDate,
              to: alloc.toDate,
            },
            stripeSessionId: this.stripeSessionId,
            paymentIntentId: this.paymentIntentId,
            paymentMethod: this.type,
          }),
        );
      }
      return {
        payment: payments,
        unusedAmount: allocation.unusedAmount,
        appliedAmount: allocation.totalApplied,
      };
    }

    // Not manual, just create as is
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

  /**
   * Allocates the payment amount to months, rolling over excess to next unpaid months.
   * Example: If Dec 2025 is partially paid (50), and we attempt to pay 100 for Dec 2025,
   * it will allocate 50 to Dec 2025 and 50 to Jan 2026.
   */
  async allocatePayment(requestedAmount) {
    const existingPayments = await this.modelInstance.find({
      user: this.user._id,
    });

    const allocations = [];
    let remainingAmount = requestedAmount;

    // Calculate max allowed for the selected range
    const months = this.getMonthKeys(this.fromDate, this.toDate);
    let totalAllowed = 0;
    let alreadyPaid = 0;

    for (const monthKey of months) {
      totalAllowed += 100;
      for (const payment of existingPayments) {
        alreadyPaid += this._getAmountPaidForMonth(payment, monthKey);
      }
    }
    const availableForRange = totalAllowed - alreadyPaid;

    // If the payment fits the selected range, allocate as a single record
    if (remainingAmount <= availableForRange) {
      allocations.push({
        amount: remainingAmount,
        fromDate: new Date(this.fromDate),
        toDate: new Date(this.toDate),
      });
      remainingAmount = 0;
    } else {
      // Allocate max possible for range, then roll over the rest
      if (availableForRange > 0) {
        allocations.push({
          amount: availableForRange,
          fromDate: new Date(this.fromDate),
          toDate: new Date(this.toDate),
        });
        remainingAmount -= availableForRange;
      }

      // Start rolling over to next months
      const rollDate = new Date(this.toDate);
      rollDate.setMonth(rollDate.getMonth() + 1);

      while (remainingAmount > 0) {
        const monthKey = `${rollDate.getFullYear()}-${rollDate.getMonth()}`;
        let paid = 0;
        for (const payment of existingPayments) {
          paid += this._getAmountPaidForMonth(payment, monthKey);
        }
        const maxForMonth = 100;
        const availableForMonth = Math.max(0, maxForMonth - paid);
        if (availableForMonth > 0) {
          const toApply = Math.min(remainingAmount, availableForMonth);
          allocations.push({
            amount: toApply,
            fromDate: new Date(rollDate.getFullYear(), rollDate.getMonth(), 1),
            toDate: new Date(
              rollDate.getFullYear(),
              rollDate.getMonth() + 1,
              0,
            ),
          });
          remainingAmount -= toApply;
        }
        rollDate.setMonth(rollDate.getMonth() + 1);
        if (
          rollDate.getFullYear() >
          new Date(this.fromDate).getFullYear() + 5
        ) {
          break;
        }
      }
    }

    const totalApplied = requestedAmount - remainingAmount;
    return { allocations, unusedAmount: remainingAmount, totalApplied };
  }

  /**
   * Returns the amount paid in a specific month by a given payment.
   * @param {*} payment
   * @param {*} monthKey
   */
  _getAmountPaidForMonth(payment, monthKey) {
    // monthKey: "YYYY-M"
    const [year, month] = monthKey.split('-').map(Number);
    const start = new Date(payment.dateRange.from);
    const end = new Date(payment.dateRange.to);

    let paid = 0;
    let rem = payment.amount;
    const cur = new Date(start.getFullYear(), start.getMonth(), 1);

    while (cur <= end && rem > 0) {
      const curKey = `${cur.getFullYear()}-${cur.getMonth()}`;
      const toPay = Math.min(100, rem);

      if (curKey === monthKey) {
        paid += toPay;
        break;
      }
      rem -= toPay;
      cur.setMonth(cur.getMonth() + 1);
    }

    return paid;
  }

  // The following functions remain unchanged
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
        const paymentAmount = this._getAmountPaidForMonth(payment, monthKey);
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
}

function getMonthName(dateRange) {
  const { from, to } = dateRange;
  const options = { month: 'long', year: 'numeric' };
  const startMonthName = from.toLocaleDateString('en-US', options);
  const endMonthName = to.toLocaleDateString('en-US', options);
  return { startMonthName, endMonthName };
}

function getNumberOfMonths(startDate, endDate) {
  const startYear = startDate.getFullYear();
  const startMonth = startDate.getMonth();
  const endYear = endDate.getFullYear();
  const endMonth = endDate.getMonth();
  let months = (endYear - startYear) * 12 + (endMonth - startMonth);
  if (endDate.getDate() < startDate.getDate()) {
    months -= 1;
  }
  return months;
}

function calculateFullMonths(fromDate, toDate) {
  if (fromDate.getFullYear() < 2025 || toDate.getFullYear() < 2025) {
    return { isValid: false, months: 0 };
  }
  if (fromDate >= toDate) {
    return { isValid: false, months: 0 };
  }
  if (fromDate.getDate() !== 1) {
    return { isValid: false, months: 0 };
  }
  const lastDayOfToMonth = new Date(
    toDate.getFullYear(),
    toDate.getMonth() + 1,
    0,
  );
  if (toDate.getDate() !== lastDayOfToMonth.getDate()) {
    return { isValid: false, months: 0 };
  }
  const fromYear = fromDate.getFullYear();
  const fromMonth = fromDate.getMonth();
  const toYear = toDate.getFullYear();
  const toMonth = toDate.getMonth();
  const months = (toYear - fromYear) * 12 + (toMonth - fromMonth) + 1;
  return { isValid: true, months: months };
}

async function validatePaymentPeriod(paymentManager, paymentAmount) {
  const { fromDate, toDate } = paymentManager;
  if (await paymentManager.hasPaymentPeriod(fromDate, toDate, paymentAmount))
    throw new Error(
      'Payment period already fully paid or would exceed 100 pesos',
    );
  // Overlap check commented out
  // if (await paymentManager.findOverlappingPeriods(fromDate, toDate))
  //   throw new Error('Payment period overlaps with existing period');
}

function generateMonthlyStatement(payments, year) {
  const monthlyDues = 100;
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

  const sortedPayments = payments.sort(
    (a, b) => new Date(a.paymentDate) - new Date(b.paymentDate),
  );

  sortedPayments.forEach((payment) => {
    let remainingAmount = payment.amount;
    const startDate = new Date(payment.dateRange.from);
    const endDate = new Date(payment.dateRange.to);
    let monthPointer =
      startDate.getFullYear() === year ? startDate.getMonth() : 0;

    while (remainingAmount > 0 && monthPointer < monthlyBreakdown.length) {
      const monthData = monthlyBreakdown[monthPointer];
      const toPay = Math.min(
        monthlyDues - monthData.amountPaid,
        remainingAmount,
      );

      if (toPay > 0) {
        monthData.amountPaid += toPay;
        monthData.remainingBalance = monthlyDues - monthData.amountPaid;
        monthData.paymentDate = payment.paymentDate;
        monthData.paymentId = payment._id;
        if (monthData.amountPaid >= monthlyDues) {
          monthData.status = 'paid';
          monthPointer++;
        } else {
          monthData.status = 'partial';
          break;
        }
        remainingAmount -= toPay;
      } else {
        monthPointer++;
      }
    }
  });

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

function getAvailableYears() {
  const currentYear = new Date().getFullYear();
  const years = [];
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
