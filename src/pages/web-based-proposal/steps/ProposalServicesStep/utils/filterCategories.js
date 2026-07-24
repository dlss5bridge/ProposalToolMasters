// Filters {serviceCatID, serviceCatName, servicesList} categories by a
// free-text search (matched against serviceName) and an optional category id.
// Categories left with zero matching services are dropped.
export const filterCategories = (categories, search, categoryFilter) => {
  const term = search.trim().toLowerCase();

  return categories
    .filter((category) => categoryFilter === "all" || categoryFilter === category.serviceCatID)
    .map((category) => {
      if (!term) return category;

      const servicesList = category.servicesList.filter((service) =>
        service.serviceName.toLowerCase().includes(term),
      );

      return { ...category, servicesList };
    })
    .filter((category) => category.servicesList.length > 0);
};
