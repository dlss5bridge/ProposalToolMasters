import reducer from "./webProposalSlice";

export { getQuoteModel } from "./webProposalThunk";

export {
  selectQuoteModel,
  selectQuoteModelLoading,
  selectQuoteModelError,
  selectSelectedServicesList,
} from "./webProposalSelectors";

export default reducer;
