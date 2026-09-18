const buildDriverValues = (service) => {
  const values = {};

  (service.pricingDriverList || [])
    .filter((driver) => driver.driverVisibility)
    .forEach((driver) => {
      if (driver.driverTypeID === 3) {
        const option =
          driver.variation?.find(
            (variation) => variation.variationID === driver.variationID,
          ) || driver.variation?.find((variation) => variation.isDefault);
        values[driver.globalPricingDriverID] = {
          driverName: driver.driverName,
          value: option ? option.variationID : null,
          label: option ? option.variationName : null,
        };
      } else if (driver.driverTypeID === 4) {
        const option =
          driver.slab?.find((slab) => slab.slabID === driver.slabID) ||
          driver.slab?.find((slab) => slab.isDefault);
        values[driver.globalPricingDriverID] = {
          driverName: driver.driverName,
          value: option ? option.slabID : null,
          label: option
            ? option.slabTypeName || `${option.slabFrom} - ${option.slabTo}`
            : null,
        };
      } else if (driver.driverTypeID === 2) {
        // The pricing driver endpoint occasionally returns a quantity
        // driver's driverValue equal to its own globalPricingDriverID
        // instead of a real quantity or null — treat that as corrupted/unset
        // data and default to 1 rather than sending it through as-is, since
        // an unset value would otherwise multiply the price by a 5-digit ID.
        const isCorruptedDefault =
          driver.driverValue != null &&
          driver.driverValue === driver.globalPricingDriverID;
        values[driver.globalPricingDriverID] = {
          driverName: driver.driverName,
          value: isCorruptedDefault ? 1 : (driver.driverValue ?? ""),
        };
      }
    });

  return values;
};

export const buildSelectionsFromQuoteModel = (
  recurringCategories,
  oneOffCategories,
  // Standard "Package" quotes only: when the driver list is scoped by
  // ServicePackageIDs, the backend's `isSelected` flag comes back false for
  // every row regardless, so the whole (already package-scoped) response
  // needs to be treated as selected instead of filtered by that flag.
  treatAllAsSelected = false,
) => {
  const recurringSelections = {};
  const oneOffSelections = {};
  let order = 0;

  [
    { categories: recurringCategories, listType: "recurring" },
    { categories: oneOffCategories, listType: "oneOff" },
  ].forEach(({ categories, listType }) => {
    (categories || []).forEach((category) => {
      (category.servicesList || [])
        .filter((service) => treatAllAsSelected || service.isSelected)
        .forEach((service) => {
          const selection = {
            listType,
            serviceID: service.serviceID,
            serviceName: service.serviceName,
            categoryName: category.serviceCatName,
            serviceCatID: category.serviceCatID,
            driverValues: buildDriverValues(service),
            order: order++,
          };

          if (listType === "oneOff") {
            oneOffSelections[service.serviceID] = selection;
          } else {
            recurringSelections[service.serviceID] = selection;
          }
        });
    });
  });

  return { recurringSelections, oneOffSelections, nextOrder: order };
};
