import { createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../Services/axiosInterceptor";
import { Base_Url } from "../../../Base-Url/Base_Url";

export const GetAllProposalGlobalVariables = createAsyncThunk(
  "pricingSettings/GetAllProposalGlobalVariables",
  async (organisationKeyID, thunkAPI) => {
    try {
      const res = await apiClient.get(
        `${Base_Url}/GlobalPricingDriver/GetGlobalPricingDriverLookupList?OrganisationKeyID=${organisationKeyID}&AddedFor=GlobalProspect`,
      );

      const data = res.data?.responseData?.data || [];

      return data.map((item) => ({
        value: item.globalPricingDriverID,
        label: item.driverName,
      }));
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err?.response?.data || "Something went wrong",
      );
    }
  },
);
