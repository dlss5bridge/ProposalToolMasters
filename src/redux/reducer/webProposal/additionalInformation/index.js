import reducer from "./additionalInformationSlice";

export { getAdditionalInformationList } from "./additionalInformationThunk";

export {
  setAdditionalInformationList,
  clearAdditionalInformationList,
} from "./additionalInformationSlice";

export {
  selectAdditionalInformationList,
  selectAdditionalInformationListLoading,
  selectAdditionalInformationListError,
  selectHasAdditionalInformation,
} from "./additionalInformationSelectors";

export default reducer;
