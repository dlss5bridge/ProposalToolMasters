// GetPricingFormulasGlobalPricingDrivers returns driverValue as the resolved
// price of a variation/slab selection, not the selected option's ID — the
// real ID lives on the item's own variationID/slabID. Resolve driverValue
// back into that ID here (falling back to the catalog default if the
// quote's selected option no longer exists) since the UI and pricing code
// expect driverValue to hold the option ID.
export const withDefaultDriverValues = (list) =>
  (list || []).map((item) => {
    if (item.driverTypeID === 2) {
      // API sometimes returns a quantity driver's driverValue equal to its
      // own globalPricingDriverID instead of a real quantity or null —
      // treat that as unset data and reset to 0.
      if (
        item.driverValue != null &&
        item.driverValue === item.globalPricingDriverID
      ) {
        return { ...item, driverValue: 0 };
      }
    } else if (item.driverTypeID === 3) {
      const hasSelected = item.variation?.some(
        (option) => option.variationID === item.variationID,
      );
      const resolvedID = hasSelected
        ? item.variationID
        : item.variation?.find((option) => option.isDefault)?.variationID;
      if (resolvedID != null) {
        return { ...item, driverValue: resolvedID };
      }
    } else if (item.driverTypeID === 4) {
      const hasSelected = item.slab?.some(
        (option) => option.slabID === item.slabID,
      );
      const resolvedID = hasSelected
        ? item.slabID
        : item.slab?.find((option) => option.isDefault)?.slabID;
      if (resolvedID != null) {
        return { ...item, driverValue: resolvedID };
      }
    }
    return item;
  });
