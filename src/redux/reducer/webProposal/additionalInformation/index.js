import reducer from "./additionalInformationSlice";

export { getAdditionalInformationList } from "./additionalInformationThunk";

export {
  setAdditionalInformationList,
  setAdditionalInformationValidationVisible,
  clearAdditionalInformationList,
} from "./additionalInformationSlice";

export {
  selectAdditionalInformationList,
  selectDefaultAdditionalInformationList,
  selectAdditionalInformationListLoading,
  selectAdditionalInformationListError,
  selectHasAdditionalInformation,
  selectAdditionalInformationValidationVisible,
} from "./additionalInformationSelectors";

export {
  getAdditionalInformationFieldErrors,
  getVisibleAdditionalInformationItems,
} from "./validateAdditionalInformation";

export {
  buildAdditionalInformationDriverEntries,
  additionalInformationEntriesMatch,
} from "./additionalInformationPricing";

export default reducer;
