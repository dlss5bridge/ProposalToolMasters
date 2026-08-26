import reducer from "./webProposalSlice";

export {
  getQuoteModel,
  getOrganisationThemeSettings,
  amendProposal,
  saveProposalInputFields,
  acceptProposal,
  addUpdateQuote,
} from "./webProposalThunk";

export {
  selectQuoteModel,
  selectQuoteModelLoading,
  selectQuoteModelError,
  selectSelectedServicesList,
  selectThemeSettings,
  selectThemeSettingsLoading,
  selectThemeSettingsError,
} from "./webProposalSelectors";

export default reducer;
