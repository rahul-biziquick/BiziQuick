/**
 * Calculate pagination values
 * @param {number|string} page - Current page number
 * @param {number|string} limit - Items per page
 * @returns {{ skip: number, take: number, currentPage: number, pageSize: number }}
 */
const getPaginationParams = (page = 1, limit = 10) => {
  const currentPage = parseInt(page, 10);
  const pageSize = parseInt(limit, 10);
  const skip = (currentPage - 1) * pageSize;
  const take = pageSize;

  return { skip, take, currentPage, pageSize };
};

/**
 * Format paginated response
 * @param {Array} items - The items retrieved
 * @param {number} totalItems - Total number of items
 * @param {number} currentPage - Current page number
 * @param {number} pageSize - Number of items per page
 * @returns {{ totalItems: number, totalPages: number, currentPage: number, pageSize: number, items: Array }}
 */
const getPaginatedResponse = (items, totalItems, currentPage, pageSize) => {
  const totalPages = Math.ceil(totalItems / pageSize);

  return {
    totalItems,
    totalPages,
    currentPage,
    pageSize,
    items,
  };
};

module.exports = {
  getPaginationParams,
  getPaginatedResponse,
};
