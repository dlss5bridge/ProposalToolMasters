import { createSlice } from "@reduxjs/toolkit";
import { getOrganisationThemeSettings, getQuoteModel } from "./webProposalThunk";

const initialState = {
  quoteModel: null,
  quoteModelLoading: false,
  quoteModelError: null,

  themeSettings: null,
  themeSettingsLoading: false,
  themeSettingsError: null,
};

const webProposalSlice = createSlice({
  name: "webProposal",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getQuoteModel.pending, (state) => {
        state.quoteModelLoading = true;
        state.quoteModelError = null;
      })
      .addCase(getQuoteModel.fulfilled, (state, action) => {
        state.quoteModelLoading = false;
        state.quoteModel = action.payload;
      })
      .addCase(getQuoteModel.rejected, (state, action) => {
        state.quoteModelLoading = false;
        state.quoteModelError = action.payload;
      })
      .addCase(getOrganisationThemeSettings.pending, (state) => {
        state.themeSettingsLoading = true;
        state.themeSettingsError = null;
      })
      .addCase(getOrganisationThemeSettings.fulfilled, (state, action) => {
        state.themeSettingsLoading = false;
        state.themeSettings = action.payload;
      })
      .addCase(getOrganisationThemeSettings.rejected, (state, action) => {
        state.themeSettingsLoading = false;
        state.themeSettingsError = action.payload;
      });
  },
});

export default webProposalSlice.reducer;
