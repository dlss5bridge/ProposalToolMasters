import { createSlice } from "@reduxjs/toolkit";
import {
  getRecurringServices,
  getOneOffServices,
  getCalculatedServicesPriceByPackages,
} from "./servicesThunk";

const initialState = {
  recurringServices: [],
  recurringServicesLoading: false,
  recurringServicesError: null,

  oneOffServices: [],
  oneOffServicesLoading: false,
  oneOffServicesError: null,

  selectedServiceIDs: [],
  selectionError: false,

  // Required-driver-field errors for the current selections, keyed by
  // serviceID -> driverID -> message. Lets the step-advance guard block
  // leaving Services while a required quantity/variation/slab is missing.
  // fieldErrorsVisible only reveals them inline once an advance attempt fails.
  fieldErrors: { recurring: {}, oneOff: {} },
  fieldErrorsVisible: false,

  // Full selection detail (including chosen driver values), mirrored from
  // ProposalServicesStep so the Pricing Table step can build the
  // GetCalculatedServicesPriceByPackages payload without re-deriving it.
  recurringSelections: {},
  oneOffSelections: {},

  // Snapshot taken once right after hydrating from the quote model (the
  // services already quoted on an Amendment). Stays immutable so Pricing
  // Table can detect if the selection changed since and diff against it.
  defaultRecurringSelections: {},
  defaultOneOffSelections: {},

  pricing: [],
  pricingLoading: false,
  pricingError: null,
  vatPercentage: 0,
  currencyID: 1,
  packageList: [],
  serviceMappingWithPackagesList: [],
};

const servicesSlice = createSlice({
  name: "webProposalServices",
  initialState,
  reducers: {
    setSelectedServiceIDs(state, action) {
      state.selectedServiceIDs = action.payload || [];
    },
    setServicesSelectionError(state, action) {
      state.selectionError = action.payload;
    },
    setServicesFieldErrors(state, action) {
      state.fieldErrors = action.payload || { recurring: {}, oneOff: {} };
    },
    setServicesFieldErrorsVisible(state, action) {
      state.fieldErrorsVisible = action.payload;
    },
    setServiceSelections(state, action) {
      state.recurringSelections = action.payload?.recurringSelections || {};
      state.oneOffSelections = action.payload?.oneOffSelections || {};
    },
    setDefaultServiceSelections(state, action) {
      state.defaultRecurringSelections =
        action.payload?.recurringSelections || {};
      state.defaultOneOffSelections = action.payload?.oneOffSelections || {};
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getRecurringServices.pending, (state) => {
        state.recurringServicesLoading = true;
        state.recurringServicesError = null;
      })
      .addCase(getRecurringServices.fulfilled, (state, action) => {
        state.recurringServicesLoading = false;
        state.recurringServices = action.payload;
      })
      .addCase(getRecurringServices.rejected, (state, action) => {
        state.recurringServicesLoading = false;
        state.recurringServicesError = action.payload;
      })
      .addCase(getOneOffServices.pending, (state) => {
        state.oneOffServicesLoading = true;
        state.oneOffServicesError = null;
      })
      .addCase(getOneOffServices.fulfilled, (state, action) => {
        state.oneOffServicesLoading = false;
        state.oneOffServices = action.payload;
      })
      .addCase(getOneOffServices.rejected, (state, action) => {
        state.oneOffServicesLoading = false;
        state.oneOffServicesError = action.payload;
      })
      .addCase(getCalculatedServicesPriceByPackages.pending, (state) => {
        state.pricingLoading = true;
        state.pricingError = null;
      })
      .addCase(
        getCalculatedServicesPriceByPackages.fulfilled,
        (state, action) => {
          state.pricingLoading = false;
          state.pricing = action.payload.prices;
          state.vatPercentage = action.payload.vatPercentage;
          state.currencyID = action.payload.currencyID;
          state.packageList = action.payload.packageList;
          state.serviceMappingWithPackagesList =
            action.payload.serviceMappingWithPackagesList;
        },
      )
      .addCase(
        getCalculatedServicesPriceByPackages.rejected,
        (state, action) => {
          state.pricingLoading = false;
          state.pricingError = action.payload;
        },
      );
  },
});

export const {
  setSelectedServiceIDs,
  setServicesSelectionError,
  setServicesFieldErrors,
  setServicesFieldErrorsVisible,
  setServiceSelections,
  setDefaultServiceSelections,
} = servicesSlice.actions;

export default servicesSlice.reducer;
