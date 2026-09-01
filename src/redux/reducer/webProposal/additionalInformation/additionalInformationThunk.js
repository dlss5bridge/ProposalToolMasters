import { createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../../Services/axiosInterceptor";
import { Base_Url } from "../../../../Base-Url/Base_Url";
import { withDefaultDriverValues } from "./withDefaultDriverValues";

export { withDefaultDriverValues };

// The web-based-proposal route runs outside the authenticated app (no login,
// no redux/local-storage auth state), so all identity values are sourced
// from the GetQuoteModel API response (webProposal.quoteModel) instead.
export const getAdditionalInformationList = createAsyncThunk(
  "webProposalAdditionalInformation/getAdditionalInformationList",
  async (
    {
      organisationKeyID,
      userKeyID,
      quoteKeyID,
      clientID,
      servicesIDs,
      servicePackageIDs,
    },
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
          ServicePackageIDs: servicePackageIDs || [],
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
