// The UI (and buildAdditionalInformationDriverEntries, which prices off this
// same field) treats driverValue as holding the *selected option's ID* for a
// variation/slab driver — but GetPricingFormulasGlobalPricingDrivers actually
// returns driverValue as the resolved price/value of that selection (e.g.
// 300 for a Turnover slab worth £300), with the real per-quote-selected ID
// sitting in the item's own top-level variationID/slabID field instead. Left
// as-is, every variation/slab field hydrates to whatever its *catalog
// default* option happens to be — silently discarding the value actually
// selected for this quote — because a price number essentially never equals
// a real option ID. This resolves driverValue into the ID the UI/pricing
// code expect: the quote's own selected option when it still exists among
// the current choices, falling back to the catalog default only when it
// doesn't (e.g. the org has since removed that option).
export const withDefaultDriverValues = (list) =>
  (list || []).map((item) => {
    if (item.driverTypeID === 2) {
      // GetPricingFormulasGlobalPricingDrivers has been observed returning a
      // quantity driver's driverValue equal to its own globalPricingDriverID
      // instead of a real quantity or null — same corrupted-default pattern
      // documented in buildSelectionsFromQuoteModel.js's isCorruptedDefault
      // for the sibling Services-step endpoint. A real quantity would never
      // coincidentally equal its own 5-digit driver ID, so that exact match
      // is treated as unset data and reset to 0 (this field is editable by
      // the client here, unlike the locked Custom Package default there, so
      // there's no need for a non-zero placeholder).
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
