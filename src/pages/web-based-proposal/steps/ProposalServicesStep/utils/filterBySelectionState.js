// Splits {serviceCatID, serviceCatName, servicesList} categories into the
// subset already selected (shown on the main step) and the subset still
// addable (shown in the Add Service dialog). Categories left with zero
// matching services are dropped.
export const getSelectedCategories = (categories, selections) =>
  categories
    .map((category) => ({
      ...category,
      servicesList: category.servicesList.filter(
        (service) => selections[service.serviceID],
      ),
    }))
    .filter((category) => category.servicesList.length > 0);

export const getAddableCategories = (categories, selections) =>
  categories
    .map((category) => ({
      ...category,
      servicesList: category.servicesList.filter(
        (service) => !selections[service.serviceID],
      ),
    }))
    .filter((category) => category.servicesList.length > 0);
