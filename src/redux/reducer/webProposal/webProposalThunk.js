import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  GetOrganisationThemeSettings,
  GetProposalModelWithoutToken,
} from "../../Services/Proposal/ProposalApi";

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

// GetOrganisationThemeSettings responds with responseData.data as a
// single-item array holding the organisation's theming for this quote.
export const getOrganisationThemeSettings = createAsyncThunk(
  "webProposal/getOrganisationThemeSettings",
  async (quoteKeyID, thunkAPI) => {
    try {
      const res = await GetOrganisationThemeSettings(quoteKeyID);

      if (res?.data?.statusCode === 200 && res?.data?.responseData?.data) {
        const [themeSettings] = res.data.responseData.data;
        return themeSettings || null;
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
