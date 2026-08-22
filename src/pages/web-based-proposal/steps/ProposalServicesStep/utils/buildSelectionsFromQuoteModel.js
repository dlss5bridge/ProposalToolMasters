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
        values[driver.globalPricingDriverID] = {
          driverName: driver.driverName,
          value: driver.driverValue ?? "",
        };
      }
    });

  return values;
};

export const buildSelectionsFromQuoteModel = (
  recurringCategories,
  oneOffCategories,
  // Standard "Package" quotes only: GetServicesWithGlobalPricingDriverList
  // ByServiceChargeType is called with ServicePackageIDs scoped to the
  // admin's chosen package(s) (mirrors AddUpdateProposal.jsx's
  // GetRecurringServiceListData/GetOneOffServiceListData, which then stamps
  // `service.servicePackageIDs = selectedPackages` on every row it gets
  // back — i.e. every service the package-scoped call returns IS the
  // package's service list). The backend's own `isSelected` flag on this
  // endpoint is only meaningful for the plain Service catalog (org-wide,
  // no package scoping) and comes back false for every row when
  // ServicePackageIDs is set, so Package quotes must treat the whole
  // (already package-scoped) response as selected instead of filtering by
  // it. Service and Custom Package quotes are untouched — this only
  // widens the filter when explicitly asked to.
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
