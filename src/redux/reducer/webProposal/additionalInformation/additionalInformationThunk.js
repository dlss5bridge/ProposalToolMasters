import { createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../../Services/axiosInterceptor";
import { Base_Url } from "../../../../Base-Url/Base_Url";

// The API returns each variation/slab option with an isDefault flag, but
// leaves driverValue (the field the UI actually reads/validates against)
// unset — without this, a field renders its default option selected while
// validateAdditionalInformationItem still reports it as required, since it
// never looks at isDefault directly.
//
// A service the admin already added by default can also come back with a
// driverValue left over from when the quote was first created, pointing at
// a variation/slab ID that no longer exists in the current options list
// (e.g. the org edited that driver's options since). That stale ID doesn't
// resolve to a price, so it must be replaced with the current default the
// same way a missing value would be — otherwise pricing silently falls back
// to the backend's minimum instead of the org's configured default.
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

// The web-based-proposal route runs outside the authenticated app (no login,
// no redux/local-storage auth state), so all identity values are sourced
// from the GetQuoteModel API response (webProposal.quoteModel) instead.
export const getAdditionalInformationList = createAsyncThunk(
  "webProposalAdditionalInformation/getAdditionalInformationList",
  async (
    { organisationKeyID, userKeyID, quoteKeyID, clientID, servicesIDs },
    thunkAPI,
  ) => {
    try {
      const res = await apiClient.post(
        `${Base_Url}/configure/Services/GetPricingFormulasGlobalPricingDrivers`,
        {
          organisationKeyID,
          userKeyID: "af735c9a-bb05-481a-866f-4bcc1a325a41", //TODO: revert this later
          ServicesIDs: servicesIDs,
          moduleKeyID: quoteKeyID,
          clientID,
          ServicePackageIDs: [],
          moduleName: "Quotation",
        },
      );

      return withDefaultDriverValues(res.data?.responseData?.data || []);
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err?.response?.data || "Something went wrong",
      );
    }
  },
);
