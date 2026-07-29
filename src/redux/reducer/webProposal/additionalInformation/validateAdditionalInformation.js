const isEmpty = (value) => value === null || value === undefined || value === "";

export const getVisibleAdditionalInformationItems = (list) =>
  (list || []).filter(
    (item) => item.driverTypeID !== 1 && item.driverVisibility !== false,
  );

// driverTypeID: 2 = quantity (number), 3 = variation (select), 4 = slab (select),
// 5 = free text, 6 = date. All visible drivers are treated as required, matching
// the ProposalServicesStep pricing driver fields.
export const validateAdditionalInformationItem = (item) => {
  if (item.driverTypeID === 2) {
    if (isEmpty(item.driverValue)) {
      return `${item.driverName} is required.`;
    }

    const numericValue = Number(item.driverValue);
    if (Number.isNaN(numericValue)) {
      return "Enter a valid number.";
    }

    const quantity = item.quantity?.[0];
    const min =
      quantity?.quantityFrom !== undefined
        ? Number(quantity.quantityFrom)
        : undefined;
    const max =
      quantity?.quantityTo !== undefined
        ? Number(quantity.quantityTo)
        : undefined;
    if (
      (min !== undefined && numericValue < min) ||
      (max !== undefined && numericValue > max)
    ) {
      return `Enter a value between ${min} and ${max}.`;
    }

    return null;
  }

  if (item.driverTypeID === 3 || item.driverTypeID === 4) {
    return isEmpty(item.driverValue) ? `${item.driverName} is required.` : null;
  }

  if (item.driverTypeID === 5) {
    return isEmpty(item.enteredText) ? `${item.driverName} is required.` : null;
  }

  if (item.driverTypeID === 6) {
    return isEmpty(item.enteredDate) ? `${item.driverName} is required.` : null;
  }

  return null;
};

export const getAdditionalInformationFieldErrors = (list) => {
  const errors = {};

  getVisibleAdditionalInformationItems(list).forEach((item) => {
    const message = validateAdditionalInformationItem(item);
    if (message) {
      errors[item.globalPricingDriverID] = message;
    }
  });

  return errors;
};
