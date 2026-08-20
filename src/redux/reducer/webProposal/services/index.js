import reducer from "./servicesSlice";

export {
  getRecurringServices,
  getOneOffServices,
  getCalculatedServicesPriceByPackages,
} from "./servicesThunk";

export {
  setSelectedServiceIDs,
  setServicesSelectionError,
  setServicesFieldErrors,
  setServicesFieldErrorsVisible,
  setServiceSelections,
  setDefaultServiceSelections,
} from "./servicesSlice";

export {
  selectRecurringServices,
  selectRecurringServicesLoading,
  selectRecurringServicesError,
  selectOneOffServices,
  selectOneOffServicesLoading,
  selectOneOffServicesError,
  selectSelectedServiceIDs,
  selectServicesSelectionError,
  selectServicesFieldErrors,
  selectServicesFieldErrorsVisible,
  selectRecurringSelections,
  selectOneOffSelections,
  selectDefaultRecurringSelections,
  selectDefaultOneOffSelections,
  selectServicesPricing,
  selectServicesPricingLoading,
  selectServicesPricingError,
  selectServicesVatPercentage,
  selectServicesCurrencyID,
  selectServicesPackageList,
  selectServiceMappingWithPackagesList,
  selectLockedServiceIDs,
} from "./servicesSelectors";

export default reducer;
