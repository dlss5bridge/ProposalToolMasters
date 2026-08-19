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

const CALCULATE_URL = `${Base_Url}/configure/Services/GetCalculatedServicesPriceByPackages`;

const toResult = (responseData) => ({
  prices: responseData.data || [],
  vatPercentage: responseData.vatPercentage || 0,
  currencyID: responseData.currencyID || 1,
  packageList: responseData.packageList || [],
  // Standard "Package" quotes (QUOTE_TYPE_ID.Package) resolve each
  // service's per-package price from this list, not from the flat
  // packageOneValue/Two/ThreeValue on `data` — see packagePriceViaMapping
  // in ProposalPricingTableStep.jsx, mirroring AddUpdateProposal.jsx's
  // GetCalculatedServicesPriceByPackagesData.
  serviceMappingWithPackagesList: responseData.serviceMappingWithPackagesList || [],
});

export const getCalculatedServicesPriceByPackages = createAsyncThunk(
  "webProposalServices/getCalculatedServicesPriceByPackages",
  async (payload, thunkAPI) => {
    try {
      // One-off services are billed once — they must never reprice when the
      // quote's recurring payment frequency changes. The backend scales
      // every row in one shared calculateServicesGPDList by the single
      // GetValueOf sent, one-off rows included, so a combined request makes
      // one-off prices drift with frequency exactly like recurring ones do.
      // Sending one-off rows in their own request, always pinned to
      // GetValueOf: "Yearly" (frequency-independent), keeps them stable
      // while the recurring request still scales normally.
      const { oneOffGetValueOf, calculateServicesGPDList = [], ...rest } =
        payload;
      // AdditionalData rows (Additional Information global pricing drivers)
      // carry no serviceChargeTypeID — a single such driver can feed both a
      // recurring and a one-off service's formula, so it must be resent with
      // both split requests, not routed to just one.
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
