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
    const excludedFields = ['page', 'sort', 'limit', 'fields', 'search'];
    excludedFields.forEach((el) => delete queryObj[el]);

    // Convert filter conditions
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    const parsedQuery = JSON.parse(queryStr);

    // Create final query object
    const finalQuery = {};

    // Add parsed query conditions to final query
    Object.keys(parsedQuery).forEach((key) => {
      finalQuery[key] = parsedQuery[key];
    });

    // Handle search parameter
    if (this.queryString.search) {
      const searchTerm = this.queryString.search;
      const searchQuery = [];
      const numericConditions = {};

      // String fields with regex (always keep these as $or conditions)
      searchQuery.push(
        { street: { $regex: searchTerm, $options: 'i' } },
        { status: { $regex: searchTerm, $options: 'i' } }
      );

      // Check for "block X" pattern
      const blockMatch = searchTerm.match(/block\s+(\d+)/i);
      if (blockMatch) {
        numericConditions.block = Number(blockMatch[1]);
      }

      // Check for "lot X" pattern
      const lotMatch = searchTerm.match(/lot\s+(\d+)/i);
      if (lotMatch) {
        numericConditions.lot = Number(lotMatch[1]);
      }

      // Standalone numbers
      if (!blockMatch && !lotMatch) {
        const standaloneNumbers = searchTerm.match(/\b(\d+)\b/g);
        if (standaloneNumbers) {
          standaloneNumbers.forEach((num) => {
            searchQuery.push({ block: Number(num) }, { lot: Number(num) });
          });
        }
      }

      // Combine the searches correctly
      const combinedSearch = [];

      // Add text search fields
      combinedSearch.push(...searchQuery);

      // Add numeric conditions as a combined AND if both block and lot are specified
      if (Object.keys(numericConditions).length > 0) {
        combinedSearch.push(numericConditions);
      }

      // Add $or condition to final query
      finalQuery.$or = combinedSearch;
    }

    // Apply combined query
    this.query = this.query.find(finalQuery);
    return this;
  }
}

module.exports = APIFeatures;
