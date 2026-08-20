// Web-based Amendment proposals let the client remove admin-added services;
// if that pushes the recurring and/or one-off total above what the admin
// originally quoted, the discount % agreed on that charge type no longer
// applies as-is and the sender must re-enter it before sending. Extracted
// out of AddUpdateProposal.jsx so this decision can be unit tested without
// rendering that (very large) component.
export const getAmendmentDiscountVisibility = ({
  recurringDiscountPercentage,
  oneOffDiscountPercentage,
  selectedRecurringServiceListLength,
  selectedOneOffServiceListLength,
}) => {
  // A discount % must have actually been applied on the Review Services /
  // Pricing tab for that charge type...
  const hasRecurringDiscountForAmendment =
    recurringDiscountPercentage !== null &&
    Number(recurringDiscountPercentage) !== 0;
  const hasOneOffDiscountForAmendment =
    oneOffDiscountPercentage !== null && Number(oneOffDiscountPercentage) !== 0;

  // ...and that charge type's services must actually be selected on this
  // proposal — a discount left over from a charge type the client removed
  // entirely has nothing left to re-price.
  const showRecurring =
    hasRecurringDiscountForAmendment &&
    Number(selectedRecurringServiceListLength) > 0;
  const showOneOff =
    hasOneOffDiscountForAmendment &&
    Number(selectedOneOffServiceListLength) > 0;

  return {
    showRecurring,
    showOneOff,
    // Nothing to re-price — skip the dialog and submit as-is.
    shouldShowDialog: showRecurring || showOneOff,
  };
};

// A re-entered amendment % must be at least what was already agreed on the
// Review Services / Pricing tab for that charge type — the sender can keep
// the same discount (e.g. re-confirm a 10% discount as-is) but can't drop
// below it, since anything smaller would silently undercut the original
// quote. A missing floor (null/undefined/"") means there's nothing to
// compare against, so any entered value is accepted.
export const isAmendmentDiscountFieldValid = (enteredValue, minValue) => {
  if (
    enteredValue === "" ||
    enteredValue === null ||
    enteredValue === undefined
  ) {
    return false;
  }
  if (minValue === null || minValue === undefined || minValue === "") {
    return true;
  }
  return Number(enteredValue) >= Number(minValue);
};

// Whole-form validity for the Confirm button — every field the dialog is
// currently showing must individually pass isAmendmentDiscountFieldValid;
// a hidden field is ignored.
export const isAmendmentDiscountFormValid = ({
  showRecurring,
  showOneOff,
  recurringDiscountPercentageForAmendment,
  oneOffDiscountPercentageForAmendment,
  minRecurringDiscount,
  minOneOffDiscount,
}) => {
  const recurringValid =
    !showRecurring ||
    isAmendmentDiscountFieldValid(
      recurringDiscountPercentageForAmendment,
      minRecurringDiscount,
    );
  const oneOffValid =
    !showOneOff ||
    isAmendmentDiscountFieldValid(
      oneOffDiscountPercentageForAmendment,
      minOneOffDiscount,
    );

  return recurringValid && oneOffValid;
};
