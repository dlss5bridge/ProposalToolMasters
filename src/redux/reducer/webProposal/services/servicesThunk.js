import { createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../../Services/axiosInterceptor";
import { Base_Url } from "../../../../Base-Url/Base_Url";

const SERVICE_CHARGE_TYPE_ID = {
  RECURRING: 1,
  ONE_OFF: 2,
};

// This route runs unauthenticated, so identity values come from the
// GetQuoteModel response (webProposal.quoteModel) rather than app auth state.
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
  userKeyID,
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

const CALCULATE_URL = `${Base_Url}/configure/Services/GetCalculatedServicesPriceByPackages`;

const toResult = (responseData) => ({
  prices: responseData.data || [],
  vatPercentage: responseData.vatPercentage || 0,
  currencyID: responseData.currencyID || 1,
  packageList: responseData.packageList || [],
  // Package quotes resolve each service's per-package price from this list
  // rather than the flat packageOneValue/Two/ThreeValue on `data` — see
  // packagePriceViaMapping in ProposalPricingTableStep.jsx.
  serviceMappingWithPackagesList: responseData.serviceMappingWithPackagesList || [],
});

export const getCalculatedServicesPriceByPackages = createAsyncThunk(
  "webProposalServices/getCalculatedServicesPriceByPackages",
  async (payload, thunkAPI) => {
    try {
      // One-off services must never reprice when the recurring payment
      // frequency changes, but the backend scales every row in a shared
      // calculateServicesGPDList by the single GetValueOf sent. So one-off
      // rows go in their own request pinned to GetValueOf: "Yearly", while
      // the recurring request scales normally.
      const { oneOffGetValueOf, calculateServicesGPDList = [], ...rest } =
        payload;
      // Additional Information pricing driver rows carry no
      // serviceChargeTypeID and can feed both recurring and one-off
      // formulas, so they need to be resent with both split requests.
      const oneOffEntries = calculateServicesGPDList.filter(
        (entry) => Number(entry.serviceChargeTypeID) === 2,
      );
      const recurringEntries = calculateServicesGPDList.filter(
        (entry) => Number(entry.serviceChargeTypeID) !== 2,
      );
      const additionalEntries = calculateServicesGPDList.filter(
        (entry) => entry.serviceChargeTypeID == null,
      );

      const canSplit =
        oneOffGetValueOf &&
        oneOffGetValueOf !== payload.GetValueOf &&
        oneOffEntries.length > 0 &&
        recurringEntries.length > additionalEntries.length;

      if (!canSplit) {
        const res = await apiClient.post(CALCULATE_URL, payload);
        return toResult(res.data?.responseData || {});
      }

      const [recurringRes, oneOffRes] = await Promise.all([
        apiClient.post(CALCULATE_URL, {
          ...rest,
          calculateServicesGPDList: recurringEntries,
        }),
        apiClient.post(CALCULATE_URL, {
          ...rest,
          GetValueOf: oneOffGetValueOf,
          calculateServicesGPDList: [...oneOffEntries, ...additionalEntries],
        }),
      ]);

      const recurringResult = toResult(recurringRes.data?.responseData || {});
      const oneOffResult = toResult(oneOffRes.data?.responseData || {});

      return {
        ...recurringResult,
        prices: [
          ...recurringResult.prices.filter(
            (item) => Number(item.serviceChargeTypeID) !== 2,
          ),
          ...oneOffResult.prices.filter(
            (item) => Number(item.serviceChargeTypeID) === 2,
          ),
        ],
        serviceMappingWithPackagesList: [
          ...recurringResult.serviceMappingWithPackagesList.filter(
            (row) => Number(row.serviceChargeTypeID) !== 2,
          ),
          ...oneOffResult.serviceMappingWithPackagesList.filter(
            (row) => Number(row.serviceChargeTypeID) === 2,
          ),
        ],
      };
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err?.response?.data || "Something went wrong",
      );
    }
  },
);
