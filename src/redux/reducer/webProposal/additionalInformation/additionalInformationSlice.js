import { createSlice } from "@reduxjs/toolkit";
import { getAdditionalInformationList } from "./additionalInformationThunk";

const initialState = {
  list: [],
  listLoading: false,
  listError: null,
  validationVisible: false,
};

const additionalInformationSlice = createSlice({
  name: "webProposalAdditionalInformation",
  initialState,
  reducers: {
    setAdditionalInformationList(state, action) {
      state.list = action.payload || [];
    },
    setAdditionalInformationValidationVisible(state, action) {
      state.validationVisible = action.payload;
    },
    clearAdditionalInformationList(state) {
      state.list = [];
      state.listError = null;
      state.validationVisible = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAdditionalInformationList.pending, (state) => {
        state.listLoading = true;
        state.listError = null;
      })
      .addCase(getAdditionalInformationList.fulfilled, (state, action) => {
        state.listLoading = false;
        state.list = action.payload;
      })
      .addCase(getAdditionalInformationList.rejected, (state, action) => {
        state.listLoading = false;
        state.listError = action.payload;
        state.list = [];
      });
  },
});

export const {
  setAdditionalInformationList,
  setAdditionalInformationValidationVisible,
  clearAdditionalInformationList,
} = additionalInformationSlice.actions;

export default additionalInformationSlice.reducer;
