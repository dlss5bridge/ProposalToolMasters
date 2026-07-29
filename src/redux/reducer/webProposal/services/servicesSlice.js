import { createSlice } from "@reduxjs/toolkit";
import { getRecurringServices, getOneOffServices } from "./servicesThunk";

const initialState = {
  recurringServices: [],
  recurringServicesLoading: false,
  recurringServicesError: null,

  oneOffServices: [],
  oneOffServicesLoading: false,
  oneOffServicesError: null,

  selectedServiceIDs: [],
  selectionError: false,
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
      });
  },
});

export const { setSelectedServiceIDs, setServicesSelectionError } =
  servicesSlice.actions;

export default servicesSlice.reducer;
