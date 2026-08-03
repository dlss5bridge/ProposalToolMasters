import { getVisibleAdditionalInformationItems } from "./validateAdditionalInformation";

export const selectAdditionalInformationList = (state) =>
  state.webProposalAdditionalInformation.list;

export const selectAdditionalInformationListLoading = (state) =>
  state.webProposalAdditionalInformation.listLoading;

export const selectAdditionalInformationListError = (state) =>
  state.webProposalAdditionalInformation.listError;

// Must match the same driverTypeID/driverVisibility filter the step itself
// renders with — otherwise a list containing only non-visible items (e.g.
// the primary driverTypeID 1 already captured in the Services step) would
// still insert an "Additional Information" step with nothing to fill in.
export const selectHasAdditionalInformation = (state) =>
  getVisibleAdditionalInformationItems(
    state.webProposalAdditionalInformation.list,
  ).length > 0;

export const selectAdditionalInformationValidationVisible = (state) =>
  state.webProposalAdditionalInformation.validationVisible;
