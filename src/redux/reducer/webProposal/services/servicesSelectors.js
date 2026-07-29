export const selectRecurringServices = (state) => state.webProposalServices.recurringServices;
export const selectRecurringServicesLoading = (state) => state.webProposalServices.recurringServicesLoading;
export const selectRecurringServicesError = (state) => state.webProposalServices.recurringServicesError;

export const selectOneOffServices = (state) => state.webProposalServices.oneOffServices;
export const selectOneOffServicesLoading = (state) => state.webProposalServices.oneOffServicesLoading;
export const selectOneOffServicesError = (state) => state.webProposalServices.oneOffServicesError;

export const selectSelectedServiceIDs = (state) => state.webProposalServices.selectedServiceIDs;
export const selectServicesSelectionError = (state) => state.webProposalServices.selectionError;
