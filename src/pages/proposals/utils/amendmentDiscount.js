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

// A re-entered amendment % must not exceed what the admin originally entered
// on the Review Services tab for that charge type — the sender can keep it
// as-is or lower it, but can't raise it past the original admin discount. A
// missing ceiling (null/undefined/"") means there's nothing to compare
// against, so any entered value is accepted.
export const isAmendmentDiscountFieldValid = (enteredValue, maxValue) => {
  if (
    enteredValue === "" ||
    enteredValue === null ||
    enteredValue === undefined
  ) {
    return false;
  }
  if (maxValue === null || maxValue === undefined || maxValue === "") {
    return true;
  }
  return Number(enteredValue) <= Number(maxValue);
};

// Whole-form validity for the Confirm button — every field the dialog is
// currently showing must individually pass isAmendmentDiscountFieldValid;
// a hidden field is ignored.
export const isAmendmentDiscountFormValid = ({
  showRecurring,
  showOneOff,
  recurringDiscountPercentageForAmendment,
  oneOffDiscountPercentageForAmendment,
  maxRecurringDiscount,
  maxOneOffDiscount,
}) => {
  const recurringValid =
    !showRecurring ||
    isAmendmentDiscountFieldValid(
      recurringDiscountPercentageForAmendment,
      maxRecurringDiscount,
    );
  const oneOffValid =
    !showOneOff ||
    isAmendmentDiscountFieldValid(
      oneOffDiscountPercentageForAmendment,
      maxOneOffDiscount,
    );

  return recurringValid && oneOffValid;
};
