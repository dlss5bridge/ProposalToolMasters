import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  AcceptWebProposal,
  AddUpdateQuoteWebProposal,
  AmendWebProposal,
  GetOrganisationThemeSettings,
  GetProposalModelWithoutToken,
  SaveWebProposalInputFields,
} from "../../Services/Proposal/ProposalApi";

export const getQuoteModel = createAsyncThunk(
  "webProposal/getQuoteModel",
  async (quoteKeyID, thunkAPI) => {
    try {
      const res = await GetProposalModelWithoutToken(quoteKeyID);

      if (res?.data?.statusCode === 200 && res?.data?.responseData?.data) {
        const data = res.data.responseData.data;

        // API returns the pricing driver selection as
        // globalPricingDriverIDsWithValues; unwrap it to a flat ID array
        // here so every consumer can just read globalPricingDriverID.
        // Falls back to the old plain-array field for older proposals.
        return {
          ...data,
          globalPricingDriverID: Array.isArray(
            data?.globalPricingDriverIDsWithValues,
          )
            ? data.globalPricingDriverIDsWithValues.map(
                (item) => item.globalPricingDriverID,
              )
            : data?.globalPricingDriverID || [],
        };
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

// Shared final Accept/Amend persistence call for all web proposal types.
export const addUpdateQuote = createAsyncThunk(
  "webProposal/addUpdateQuote",
  async (params, thunkAPI) => {
    try {
      console.log("addUpdateQuote payload ==>>", params);

      const res = await AddUpdateQuoteWebProposal(params);

      if (res?.data?.statusCode === 200) {
        return res.data?.responseData?.data ?? null;
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

// Amendment proposal's final-step action ("Amend Proposal"). Endpoint is a
// placeholder until the real one is ready.
export const amendProposal = createAsyncThunk(
  "webProposal/amendProposal",
  async (params, thunkAPI) => {
    try {
      const res = await AmendWebProposal(params);

      if (res?.data?.statusCode === 200) {
        return res.data?.responseData?.data ?? null;
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

// Standard-with-inputs proposal's final-step action ("Save"). Endpoint is a
// placeholder until the real one is ready.
export const saveProposalInputFields = createAsyncThunk(
  "webProposal/saveProposalInputFields",
  async (params, thunkAPI) => {
    try {
      const res = await SaveWebProposalInputFields(params);

      if (res?.data?.statusCode === 200) {
        return res.data?.responseData?.data ?? null;
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

// Standard proposal's "Accept" action. Endpoint is a placeholder until the
// real one is ready.
export const acceptProposal = createAsyncThunk(
  "webProposal/acceptProposal",
  async (params, thunkAPI) => {
    try {
      const res = await AcceptWebProposal(params);

      if (res?.data?.statusCode === 200) {
        return res.data?.responseData?.data ?? null;
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
