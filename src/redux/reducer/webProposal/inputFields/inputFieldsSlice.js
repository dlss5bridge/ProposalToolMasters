import { createSlice } from "@reduxjs/toolkit";
import { getInputFieldsList } from "./inputFieldsThunk";

const initialState = {
  list: [],
  listLoading: false,
  listError: null,
  validationVisible: false,
};

const inputFieldsSlice = createSlice({
  name: "webProposalInputFields",
  initialState,
  reducers: {
    setInputFieldsList(state, action) {
      state.list = action.payload || [];
    },
    setInputFieldsValidationVisible(state, action) {
      state.validationVisible = action.payload;
    },
    clearInputFieldsList(state) {
      state.list = [];
      state.listError = null;
      state.validationVisible = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getInputFieldsList.pending, (state) => {
        state.listLoading = true;
        state.listError = null;
      })
      .addCase(getInputFieldsList.fulfilled, (state, action) => {
        state.listLoading = false;
        state.list = action.payload;
      })
      .addCase(getInputFieldsList.rejected, (state, action) => {
        state.listLoading = false;
        state.listError = action.payload;
        state.list = [];
      });
  },
});

export const {
  setInputFieldsList,
  setInputFieldsValidationVisible,
  clearInputFieldsList,
} = inputFieldsSlice.actions;

export default inputFieldsSlice.reducer;
