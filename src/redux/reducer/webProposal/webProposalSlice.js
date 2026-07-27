import { createSlice } from "@reduxjs/toolkit";
import { getQuoteModel } from "./webProposalThunk";

const initialState = {
  quoteModel: null,
  quoteModelLoading: false,
  quoteModelError: null,
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
      });
  },
});

export default webProposalSlice.reducer;
