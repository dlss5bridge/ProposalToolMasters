export const selectRecurringServices = (state) => state.webProposalServices.recurringServices;
export const selectRecurringServicesLoading = (state) => state.webProposalServices.recurringServicesLoading;
export const selectRecurringServicesError = (state) => state.webProposalServices.recurringServicesError;

export const selectOneOffServices = (state) => state.webProposalServices.oneOffServices;
export const selectOneOffServicesLoading = (state) => state.webProposalServices.oneOffServicesLoading;
export const selectOneOffServicesError = (state) => state.webProposalServices.oneOffServicesError;

export const selectSelectedServiceIDs = (state) => state.webProposalServices.selectedServiceIDs;
export const selectServicesSelectionError = (state) => state.webProposalServices.selectionError;
export const selectServicesFieldErrors = (state) => state.webProposalServices.fieldErrors;
export const selectServicesFieldErrorsVisible = (state) => state.webProposalServices.fieldErrorsVisible;

export const selectRecurringSelections = (state) => state.webProposalServices.recurringSelections;
export const selectOneOffSelections = (state) => state.webProposalServices.oneOffSelections;

export const selectDefaultRecurringSelections = (state) => state.webProposalServices.defaultRecurringSelections;
export const selectDefaultOneOffSelections = (state) => state.webProposalServices.defaultOneOffSelections;

export const selectServicesPricing = (state) => state.webProposalServices.pricing;
export const selectServicesPricingLoading = (state) => state.webProposalServices.pricingLoading;
export const selectServicesPricingError = (state) => state.webProposalServices.pricingError;
export const selectServicesVatPercentage = (state) => state.webProposalServices.vatPercentage;
export const selectServicesCurrencyID = (state) => state.webProposalServices.currencyID;
