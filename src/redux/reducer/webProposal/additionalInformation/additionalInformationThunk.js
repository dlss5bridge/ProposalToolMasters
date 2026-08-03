import { createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../../Services/axiosInterceptor";
import { Base_Url } from "../../../../Base-Url/Base_Url";

// The API returns each variation/slab option with an isDefault flag, but
// leaves driverValue (the field the UI actually reads/validates against)
// unset — without this, a field renders its default option selected while
// validateAdditionalInformationItem still reports it as required, since it
// never looks at isDefault directly.
const withDefaultDriverValues = (list) =>
  (list || []).map((item) => {
    if (
      item.driverTypeID === 3 &&
      (item.driverValue === undefined || item.driverValue === null)
    ) {
      const defaultOption = item.variation?.find((option) => option.isDefault);
      if (defaultOption) {
        return { ...item, driverValue: defaultOption.variationID };
      }
    } else if (
      item.driverTypeID === 4 &&
      (item.driverValue === undefined || item.driverValue === null)
    ) {
      const defaultOption = item.slab?.find((option) => option.isDefault);
      if (defaultOption) {
        return { ...item, driverValue: defaultOption.slabID };
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
