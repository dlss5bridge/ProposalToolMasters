export const selectQuoteModel = (state) => state.webProposal.quoteModel;
export const selectQuoteModelLoading = (state) =>
  state.webProposal.quoteModelLoading;
export const selectQuoteModelError = (state) =>
  state.webProposal.quoteModelError;
export const selectSelectedServicesList = (state) =>
  state.webProposal.quoteModel?.selectedServicesList || [];

export const selectThemeSettings = (state) =>
  state.webProposal.themeSettings;
export const selectThemeSettingsLoading = (state) =>
  state.webProposal.themeSettingsLoading;
export const selectThemeSettingsError = (state) =>
  state.webProposal.themeSettingsError;
