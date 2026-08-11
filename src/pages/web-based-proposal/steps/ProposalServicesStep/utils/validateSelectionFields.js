// Mirrors AddUpdateProposal.jsx's pre-calculation guard (search
// `hasUndefinedDriver` there): a selected service's visible quantity/
// variation/slab driver must have a real value before it's safe to send to
// GetCalculatedServicesPriceByPackages — an unset driver reaches the API as
// a null driverValue, which breaks that service's (and can break the whole
// request's) price calculation instead of just pricing it at 0.
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

        // Mirrors AddUpdateProposal.jsx's quantity range guard (search
        // `hasFrom`/`hasTo` there): quantityFrom/quantityTo come back as
        // `null`, not just `undefined`, when a bound isn't configured, so
        // both must be excluded — otherwise an unset bound is coerced to 0
        // and a valid default value (e.g. 1) is rejected as "between 0 and 0".
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
// its service definition's required driver fields. Shared by the pending
// (Add Service modal), committed (main list), and Pricing Table's
// pre-calculation checks so a service is held to the same required-field bar
// no matter how it was selected or which step reads it.
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
