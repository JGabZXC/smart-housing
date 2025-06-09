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

  async addPaymentDate(startDate, endDate, amount = 100) {
    // Validate dates
    if (startDate >= endDate) {
      throw new Error('End date must be after start date');
    }

    // Check if period is at least 1 calendar month
    if (!this.isValidMonthPeriod(startDate, endDate)) {
      throw new Error(
        'Payment period must cover at least one full calendar month',
      );
    }

    // Check for duplicates
    if (await this.hasPaymentPeriod(startDate, endDate)) {
      throw new Error('Duplicate payment period detected');
    }

    // Check for overlapping periods
    const overlapping = this.findOverlappingPeriods(startDate, endDate);
    if (overlapping.length > 0) {
      throw new Error('Payment period overlaps with existing period');
    }

    return await this.modelInstance.create({
      user: this.user._id,
      address: this.user.address,
      amount: amount,
      dateRange: `${startDate.toISOString().split('T')[0]}TO${endDate.toISOString().split('T')[0]}`,
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
      dateRange: `${startDate.toISOString().split('T')[0]}TO${endDate.toISOString().split('T')[0]}`,
    });
  }

  findOverlappingPeriods(startDate, endDate) {
    return this.modelInstance.findOne({
      user: this.user._id,
      dateRange: `${startDate.toISOString().split('T')[0]}TO${endDate.toISOString().split('T')[0]}`,
    });
  }

  getNumberOfMonths(startDate, endDate) {
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

  validatePaymentDates(startDate, endDate) {
    return startDate >= endDate;
  }
}

function getMonthName(dateRange) {
  // Split the dateRange string into start and end parts
  const [start, end] = dateRange.split('TO');

  const startDate = new Date(start);
  const endDate = new Date(end);

  // Options for formatting the month name
  const options = { month: 'long', year: 'numeric' };

  // Format the dates to display month name and year
  const startMonthName = startDate.toLocaleDateString('en-US', options);
  const endMonthName = endDate.toLocaleDateString('en-US', options);

  return {
    startMonthName,
    endMonthName,
  };
}

module.exports = {
  CreatePayment,
  getMonthName,
};
