import { createAsyncThunk } from "@reduxjs/toolkit";
import { GetGlobalProspectVariablesByPricingSettingsForWebProposal } from "../../../Services/Proposal/ProposalApi";

// This lookup endpoint returns driverTypeID as a string ("2", "3", ...) and
// leaves variation/slab options' variationID/slabID null — the real
// identifier is variationKeyID/slabKeyID. Coerce both so the rest of the
// list can be treated the same way as every other driver list in the app
// (numeric driverTypeID, populated variationID/slabID).
const normalizeItem = (item) => ({
  ...item,
  driverTypeID: Number(item.driverTypeID),
  variation: (item.variation || []).map((option) => ({
    ...option,
    variationID: option.variationID ?? option.variationKeyID,
  })),
  slab: (item.slab || []).map((option) => ({
    ...option,
    slabID: option.slabID ?? option.slabKeyID,
  })),
});

// Same fixup as additionalInformationThunk's withDefaultDriverValues: the
// lookup list carries an isDefault flag per variation/slab option but leaves
// driverValue (what the field actually reads/validates) unset.
const withDefaultDriverValues = (list) =>
  (list || []).map((item) => {
    if (item.driverTypeID === 3) {
      const hasValidValue = item.variation?.some(
        (option) => option.variationID === item.driverValue,
      );
      if (!hasValidValue) {
        const defaultOption = item.variation?.find(
          (option) => option.isDefault,
        );
        if (defaultOption) {
          return { ...item, driverValue: defaultOption.variationID };
        }
      }
    } else if (item.driverTypeID === 4) {
      const hasValidValue = item.slab?.some(
        (option) => option.slabID === item.driverValue,
      );
      if (!hasValidValue) {
        const defaultOption = item.slab?.find((option) => option.isDefault);
        if (defaultOption) {
          return { ...item, driverValue: defaultOption.slabID };
        }
      }
    }
    return item;
  });

// The web-based-proposal route runs outside the authenticated app, so the
// lookup is keyed off the QuoteKeyID from the URL rather than any redux/
// local-storage auth state.
export const getInputFieldsList = createAsyncThunk(
  "webProposalInputFields/getInputFieldsList",
  async (quoteKeyID, thunkAPI) => {
    try {
      const res =
        await GetGlobalProspectVariablesByPricingSettingsForWebProposal(
          quoteKeyID,
        );

      if (res?.data?.statusCode === 200) {
        const list = (res.data?.responseData?.data || []).map(normalizeItem);
        return withDefaultDriverValues(list);
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
