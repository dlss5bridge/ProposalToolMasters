import { createSlice } from "@reduxjs/toolkit";
import { GetAllProposalGlobalVariables } from "./pricingSettingsThunks";

const initialState = {
  proposalGlobalVariables: [],
  proposalGlobalVariablesLoading: false,
  proposalGlobalVariablesError: null,
};

const pricingSettingsSlice = createSlice({
  name: "pricingSettings",
  initialState,
  reducers: {},

  extraReducers: (builder) => {
    builder
      .addCase(GetAllProposalGlobalVariables.pending, (state) => {
        state.proposalGlobalVariablesLoading = true;
        state.proposalGlobalVariablesError = null;
      })

      .addCase(GetAllProposalGlobalVariables.fulfilled, (state, action) => {
        state.proposalGlobalVariablesLoading = false;
        state.proposalGlobalVariables = action.payload;
      })

      .addCase(GetAllProposalGlobalVariables.rejected, (state, action) => {
        state.proposalGlobalVariablesLoading = false;
        state.proposalGlobalVariablesError = action.payload;
      });
  },
});

export default pricingSettingsSlice.reducer;
