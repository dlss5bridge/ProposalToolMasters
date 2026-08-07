import { getVisibleInputFieldsItems } from "./validateInputFields";

export const selectInputFieldsList = (state) =>
  state.webProposalInputFields.list;

export const selectInputFieldsListLoading = (state) =>
  state.webProposalInputFields.listLoading;

export const selectInputFieldsListError = (state) =>
  state.webProposalInputFields.listError;

export const selectInputFieldsValidationVisible = (state) =>
  state.webProposalInputFields.validationVisible;

// Gates whether the "Input Fields" step is shown at all — mirrors
// selectHasAdditionalInformation. Cross-slice since visibility also depends
// on GetQuoteModel's globalPricingDriverID allow-list (state.webProposal).
export const selectHasInputFields = (state) =>
  getVisibleInputFieldsItems(
    state.webProposalInputFields.list,
    state.webProposal?.quoteModel?.globalPricingDriverID,
  ).length > 0;
