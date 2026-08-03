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

  // Live map of required-driver-field errors across the currently committed
  // selections (recurring + one-off), keyed by serviceID -> driverID ->
  // message. Kept in sync from ProposalServicesStep so the step-advance
  // guard (in ProposalAmendment/ProposalInputForm) can block leaving the
  // Services step while a selected service is missing a required
  // quantity/variation/slab value. fieldErrorsVisible mirrors the
  // additionalInformationValidationVisible pattern: the errors are computed
  // continuously, but only rendered inline once an advance attempt fails.
  fieldErrors: { recurring: {}, oneOff: {} },
  fieldErrorsVisible: false,

  // Full selection detail (including chosen driver values), mirrored from
  // ProposalServicesStep's local state so the Pricing Table step can build
  // the GetCalculatedServicesPriceByPackages payload without re-deriving it.
  recurringSelections: {},
  oneOffSelections: {},

  // Snapshot of recurringSelections/oneOffSelections taken once, right after
  // hydrating from the quote model (i.e. the services the client was already
  // quoted for an Amendment proposal). Kept immutable afterwards so the
  // Pricing Table step can tell whether the user has since changed the
  // selection and, if so, compare against the original priced set.
  defaultRecurringSelections: {},
  defaultOneOffSelections: {},

  pricing: [],
  pricingLoading: false,
  pricingError: null,
  vatPercentage: 0,
  currencyID: 1,
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
