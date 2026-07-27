import reducer from "./webProposalSlice";

export { getQuoteModel } from "./webProposalThunk";

export {
  selectQuoteModel,
  selectQuoteModelLoading,
  selectQuoteModelError,
} from "./webProposalSelectors";

export default reducer;
