import { createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../../Services/axiosInterceptor";
import { Base_Url } from "../../../../Base-Url/Base_Url";

const SERVICE_CHARGE_TYPE_ID = {
  RECURRING: 1,
  ONE_OFF: 2,
};

// TODO: ClientKeyID/QuoteKeyID/QuoteTypeID are hardcoded until the wizard
// threads real proposal/client identity through routing or redux state.
const buildServicesPayload = (
  userKeyID,
  organisationKeyID,
  serviceChargeTypeID,
) => ({
  organisationKeyID: "16c73999-e14a-41fc-9ec3-1e30fa23d2f6", //organisationKeyID from  getquote api response
  userKeyID: "af735c9a-bb05-481a-866f-4bcc1a325a41", //fetch from the url
  moduleKeyID: "2aa8603a-3736-422a-a77d-baf437cba51d", //quoteKeyID from getquote api response
  ClientKeyID: "2581", //clientID from the getquote api response
  QuoteTypeID: 3, //quoteTypeID from the getquote api response
  ServiceChargeTypeID: serviceChargeTypeID,
  moduleName: "Quotation",
  ProfessionTypeIDs: null,
  BusinessTypeIDs: null,
  BusinessNatureIDs: null,
  ServicePackageIDs: [],
  QuoteKeyID: null,
  SourceID: null,
});

const fetchServicesByChargeType = async (
  serviceChargeTypeID,
  { userKeyID, organisationKeyID },
  thunkAPI,
) => {
  try {
    const res = await apiClient.post(
      `${Base_Url}/configure/Services/GetServicesWithGlobalPricingDriverListByServiceChargeType`,
      buildServicesPayload(userKeyID, organisationKeyID, serviceChargeTypeID),
    );

    return res.data?.responseData?.data || [];
  } catch (err) {
    return thunkAPI.rejectWithValue(
      err?.response?.data || "Something went wrong",
    );
  }
};

export const getRecurringServices = createAsyncThunk(
  "webProposalServices/getRecurringServices",
  (params, thunkAPI) =>
    fetchServicesByChargeType(
      SERVICE_CHARGE_TYPE_ID.RECURRING,
      params,
      thunkAPI,
    ),
);

export const getOneOffServices = createAsyncThunk(
  "webProposalServices/getOneOffServices",
  (params, thunkAPI) =>
    fetchServicesByChargeType(SERVICE_CHARGE_TYPE_ID.ONE_OFF, params, thunkAPI),
);
