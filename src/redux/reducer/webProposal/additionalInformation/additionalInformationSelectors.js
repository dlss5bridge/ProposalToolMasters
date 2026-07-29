export const selectAdditionalInformationList = (state) =>
  state.webProposalAdditionalInformation.list;

export const selectAdditionalInformationListLoading = (state) =>
  state.webProposalAdditionalInformation.listLoading;

export const selectAdditionalInformationListError = (state) =>
  state.webProposalAdditionalInformation.listError;

export const selectHasAdditionalInformation = (state) =>
  state.webProposalAdditionalInformation.list.length > 0;

export const selectAdditionalInformationValidationVisible = (state) =>
  state.webProposalAdditionalInformation.validationVisible;
