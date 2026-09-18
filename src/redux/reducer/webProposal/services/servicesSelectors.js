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
export const selectServicesPackageList = (state) => state.webProposalServices.packageList;
export const selectServiceMappingWithPackagesList = (state) => state.webProposalServices.serviceMappingWithPackagesList;

// Custom Package proposals lock the admin's default service picks (see
// ProposalServicesStep's lockIfCustomPackage) so the client can add services
// but not remove these — used to tell locked vs client-added services apart
// for read-only vs editable Additional Information fields.
export const selectLockedServiceIDs = (state) => {
  const { recurringSelections, oneOffSelections } = state.webProposalServices;
  return new Set(
    [
      ...Object.values(recurringSelections || {}),
      ...Object.values(oneOffSelections || {}),
    ]
      .filter((selection) => selection.locked)
      .map((selection) => selection.serviceID),
  );
};
