class CreatePayment {
  constructor({
    modelInstance,
    user,
    fromDate,
    toDate,
    stripedSessionId = null,
    paymentIntentId = null,
    type = 'manual',
  }) {
    this.modelInstance = modelInstance;
    this.user = user;
    this.fromDate = fromDate;
    this.toDate = toDate;
    this.stripedSessionId = stripedSessionId;
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
      stripedSessionId: this.stripedSessionId,
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

module.exports = {
  CreatePayment,
  getMonthName,
  normalizeDates,
  getNumberOfMonths,
  validatePaymentPeriod,
};
