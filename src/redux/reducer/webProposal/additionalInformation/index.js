import reducer from "./additionalInformationSlice";

export { getAdditionalInformationList } from "./additionalInformationThunk";

export {
  setAdditionalInformationList,
  setAdditionalInformationValidationVisible,
  clearAdditionalInformationList,
} from "./additionalInformationSlice";

export {
  selectAdditionalInformationList,
  selectAdditionalInformationListLoading,
  selectAdditionalInformationListError,
  selectHasAdditionalInformation,
  selectAdditionalInformationValidationVisible,
} from "./additionalInformationSelectors";

export { getAdditionalInformationFieldErrors } from "./validateAdditionalInformation";

export default reducer;
