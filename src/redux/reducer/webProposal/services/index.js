import reducer from "./servicesSlice";

export {
  getRecurringServices,
  getOneOffServices,
  getCalculatedServicesPriceByPackages,
} from "./servicesThunk";

export {
  setSelectedServiceIDs,
  setServicesSelectionError,
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
  selectRecurringSelections,
  selectOneOffSelections,
  selectDefaultRecurringSelections,
  selectDefaultOneOffSelections,
  selectServicesPricing,
  selectServicesPricingLoading,
  selectServicesPricingError,
  selectServicesVatPercentage,
  selectServicesCurrencyID,
} from "./servicesSelectors";

export default reducer;
