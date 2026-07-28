export const selectQuoteModel = (state) => state.webProposal.quoteModel;
export const selectQuoteModelLoading = (state) =>
  state.webProposal.quoteModelLoading;
export const selectQuoteModelError = (state) =>
  state.webProposal.quoteModelError;
export const selectSelectedServicesList = (state) =>
  state.webProposal.quoteModel?.selectedServicesList || [];
