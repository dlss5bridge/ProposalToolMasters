import { createAsyncThunk } from "@reduxjs/toolkit";
import { GetProposalModelWithoutToken } from "../../Services/Proposal/ProposalApi";

export const getQuoteModel = createAsyncThunk(
  "webProposal/getQuoteModel",
  async (quoteKeyID, thunkAPI) => {
    try {
      const res = await GetProposalModelWithoutToken(quoteKeyID);

      if (res?.data?.statusCode === 200 && res?.data?.responseData?.data) {
        return res.data.responseData.data;
      }

      return thunkAPI.rejectWithValue(
        res?.data?.errorMessage || "Something went wrong",
      );
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err?.response?.data || "Something went wrong",
      );
    }
  },
);
