import { createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../../Services/axiosInterceptor";
import { Base_Url } from "../../../../Base-Url/Base_Url";

const SERVICE_CHARGE_TYPE_ID = {
  RECURRING: 1,
  ONE_OFF: 2,
};

// The web-based-proposal route runs outside the authenticated app (no login,
// no redux/local-storage auth state), so all identity values are sourced
// from the GetQuoteModel API response (webProposal.quoteModel) instead.
const buildServicesPayload = (
  {
    organisationKeyID,
    userKeyID,
    quoteKeyID,
    clientID,
    quoteTypeID,
    servicePackageIDs,
  },
  serviceChargeTypeID,
) => ({
  organisationKeyID,
  userKeyID: "af735c9a-bb05-481a-866f-4bcc1a325a41", //TODO: revert this later
  moduleKeyID: quoteKeyID,
  ClientKeyID: String(clientID),
  QuoteTypeID: quoteTypeID,
  ServiceChargeTypeID: serviceChargeTypeID,
  moduleName: "Quotation",
  ProfessionTypeIDs: null,
  BusinessTypeIDs: null,
  BusinessNatureIDs: null,
  ServicePackageIDs: servicePackageIDs || [],
  QuoteKeyID: null,
  SourceID: null,
});

const fetchServicesByChargeType = async (
  serviceChargeTypeID,
  quoteModel,
  thunkAPI,
) => {
  try {
    const res = await apiClient.post(
      `${Base_Url}/configure/Services/GetServicesWithGlobalPricingDriverListByServiceChargeType`,
      buildServicesPayload(quoteModel, serviceChargeTypeID),
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

export const getCalculatedServicesPriceByPackages = createAsyncThunk(
  "webProposalServices/getCalculatedServicesPriceByPackages",
  async (payload, thunkAPI) => {
    try {
      const res = await apiClient.post(
        `${Base_Url}/configure/Services/GetCalculatedServicesPriceByPackages`,
        payload,
      );

      const responseData = res.data?.responseData || {};
      return {
        prices: responseData.data || [],
        vatPercentage: responseData.vatPercentage || 0,
        currencyID: responseData.currencyID || 1,
        packageList: responseData.packageList || [],
        // Standard "Package" quotes (QUOTE_TYPE_ID.Package) resolve each
        // service's per-package price from this list, not from the flat
        // packageOneValue/Two/ThreeValue on `data` — see packagePriceViaMapping
        // in ProposalPricingTableStep.jsx, mirroring AddUpdateProposal.jsx's
        // GetCalculatedServicesPriceByPackagesData.
        serviceMappingWithPackagesList:
          responseData.serviceMappingWithPackagesList || [],
      };
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err?.response?.data || "Something went wrong",
      );
    }
  },
);
