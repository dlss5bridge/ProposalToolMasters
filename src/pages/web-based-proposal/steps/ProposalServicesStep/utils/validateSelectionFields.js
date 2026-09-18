// A selected service's visible quantity/variation/slab driver must have a
// real value before it's safe to send to GetCalculatedServicesPriceByPackages
// — an unset driver reaches the API as a null value and can break the whole
// request's price calculation, not just that service's.
export const validateSelectionFields = (service, driverValues) => {
  const fieldErrors = {};

  (service.pricingDriverList || [])
    .filter((driver) => driver.driverVisibility)
    .forEach((driver) => {
      const entry = driverValues?.[driver.globalPricingDriverID];

      if (driver.driverTypeID === 2) {
        if (
          entry?.value === "" ||
          entry?.value === null ||
          entry?.value === undefined
        ) {
          fieldErrors[driver.globalPricingDriverID] =
            `${driver.driverName} is required.`;
          return;
        }

        const numericValue = Number(entry.value);
        if (Number.isNaN(numericValue)) {
          fieldErrors[driver.globalPricingDriverID] = "Enter a valid number.";
          return;
        }

        // quantityFrom/quantityTo can come back `null` (not just
        // `undefined`) when a bound isn't configured, so both need to be
        // excluded explicitly — otherwise an unset bound is coerced to 0
        // and a valid value gets rejected as "between 0 and 0".
        const quantity = driver.quantity?.[0];
        const from = quantity?.quantityFrom;
        const to = quantity?.quantityTo;
        const parsedFrom = Number(from);
        const parsedTo = Number(to);
        const hasFrom =
          from !== undefined &&
          from !== null &&
          from !== "" &&
          !Number.isNaN(parsedFrom);
        const hasTo =
          to !== undefined &&
          to !== null &&
          to !== "" &&
          !Number.isNaN(parsedTo);

        if (
          (hasFrom &&
            hasTo &&
            (numericValue < parsedFrom || numericValue > parsedTo)) ||
          (hasFrom && !hasTo && numericValue < parsedFrom) ||
          (!hasFrom && hasTo && numericValue > parsedTo)
        ) {
          fieldErrors[driver.globalPricingDriverID] =
            hasFrom && hasTo
              ? `Enter a value between ${parsedFrom} and ${parsedTo}.`
              : hasFrom
                ? `Enter a value of at least ${parsedFrom}.`
                : `Enter a value of at most ${parsedTo}.`;
        }
      } else if (driver.driverTypeID === 3 || driver.driverTypeID === 4) {
        if (entry?.value === null || entry?.value === undefined) {
          fieldErrors[driver.globalPricingDriverID] =
            `${driver.driverName} is required.`;
        }
      }
    });

  return fieldErrors;
};

// Validates every selection in a selections map (keyed by serviceID) against
// its service definition's required driver fields. Shared by the Add Service
// modal, the main list, and the Pricing Table's pre-calculation checks.
export const validateSelectionsMap = (selections, serviceByID) => {
  const errors = {};
  let hasError = false;

  Object.values(selections || {}).forEach((selection) => {
    const service = serviceByID.get(selection.serviceID);
    if (!service) return;
    const fieldErrors = validateSelectionFields(service, selection.driverValues);
    if (Object.keys(fieldErrors).length > 0) {
      errors[selection.serviceID] = fieldErrors;
      hasError = true;
    }
  });

  return { errors, hasError };
};
