class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  paginate() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 10;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = [
      'page',
      'sort',
      'limit',
      'fields',
      'search',
      'email',
      'fromDate',
      'toDate',
      'phase',
      'block',
      'lot',
      'street',
      'method',
    ];
    excludedFields.forEach((el) => delete queryObj[el]);

    // Convert filter conditions
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    const parsedQuery = JSON.parse(queryStr);

    // Create final query object
    const finalQuery = { ...parsedQuery };

    // Handle search parameter
    if (this.queryString.search) {
      const searchTerm = this.queryString.search;
      const searchConditions = [];

      // Text search conditions
      const textSearchConditions = [
        { street: { $regex: searchTerm, $options: 'i' } },
        { status: { $regex: searchTerm, $options: 'i' } },
      ];

      // Extract numeric patterns
      const phaseMatch = searchTerm.match(/phase\s+(\d+)/i);
      const blockMatch = searchTerm.match(/block\s+(\d+)/i);
      const lotMatch = searchTerm.match(/lot\s+(\d+)/i);

      // If we have specific field patterns, handle them separately from general search
      if (phaseMatch || blockMatch || lotMatch) {
        const numericConditions = {};

        if (phaseMatch) numericConditions.phase = Number(phaseMatch[1]);
        if (blockMatch) numericConditions.block = Number(blockMatch[1]);
        if (lotMatch) numericConditions.lot = Number(lotMatch[1]);

        // Add separate field conditions to search
        searchConditions.push(numericConditions);
      } else {
        // For standalone searches without field specifiers
        const standaloneNumbers = searchTerm.match(/\b(\d+)\b/g);
        if (standaloneNumbers) {
          standaloneNumbers.forEach((num) => {
            searchConditions.push(
              { phase: Number(num) },
              { block: Number(num) },
              { lot: Number(num) },
            );
          });
        }
      }

      // Add text search conditions to the search array
      searchConditions.push(...textSearchConditions);

      // Add combined search to the query
      finalQuery.$or = searchConditions;
    }

    this.query = this.query.find(finalQuery);
    return this;
  }
}

module.exports = APIFeatures;
