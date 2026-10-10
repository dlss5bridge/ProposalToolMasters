import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { Base_Url, DeviationBaseUrl, DeviationBaseUrlv2, QuickBookUrl, XeroBaseUrl } from "../../Base-Url/Base_Url";
import apiClient from "../Services/axiosInterceptor";

// GET connection URL
export const fetchQuickBookConnectionUrl = createAsyncThunk(
  "quickbook/fetchConnectionUrl",
  async (organisationKeyID, thunkAPI) => {
    try {
      const res = await apiClient.get(
        `${QuickBookUrl}connection-url/${organisationKeyID}`
      );

      return res.data; //  this is your promise resolve data
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data);
    }
  }
);

export const fetchContactsLookup = createAsyncThunk(
  "xero/fetchContactsLookup",
  async ({ organisationKeyID, activePlatform }, thunkAPI) => {
    try {
      const baseUrl =
        activePlatform === "QuickBooks"
          ? `${QuickBookUrl}customers/fetch/${organisationKeyID}`
          : `${XeroBaseUrl}contacts/fetch/${organisationKeyID}`;

      const res = await apiClient.get(`${baseUrl}`, {});

      // // Transform data HERE (not in component)
      // const mappings = res.data?.contacts || [];

      // const formatted = mappings.map((item) => ({
      //   value: item.XeroContactID,
      //   label: item.ContactName,
      //   ClientKeyID: item.ClientKeyID,
      // }));

      // return formatted; // final usable data

      const result = [];

      if (activePlatform === "QuickBooks") {
        const customers = res.data?.customers || [];

        customers.forEach((item) => {
          result.push({
            value: item.QBCustomerID,
            label: item.DisplayName,
            ClientKeyID: item.ClientKeyID,
            ClientID: item.ClientID,
          });
        });
      } else {
        const contacts = res.data?.contacts || [];

        contacts.forEach((item) => {
          result.push({
            value: item.XeroContactID,
            label: item.ContactName,
            ClientKeyID: item.ClientKeyID,
            ClientID: item.ClientID,
          });
        });
      }

      return result;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data);
    }
  }
);

export const fetchCachedContactsLookup = createAsyncThunk(
  "xero/fetchContactsLookup",
  async ({ organisationKeyID, activePlatform }, thunkAPI) => {
    try {
      const baseUrl =
        activePlatform === "QuickBooks"
          ? `${QuickBookUrl}customers/${organisationKeyID}`
          : `${XeroBaseUrl}contacts/${organisationKeyID}`;

      const res = await apiClient.get(`${baseUrl}`, {});

      // // Transform data HERE (not in component)
      // const mappings = res.data?.contacts || [];

      // const formatted = mappings.map((item) => ({
      //   value: item.XeroContactID,
      //   label: item.ContactName,
      //   ClientKeyID: item.ClientKeyID,
      // }));

      // return formatted; // final usable data

      const result = [];

      if (activePlatform === "QuickBooks") {
        const customers = res.data?.customers || [];

        customers.forEach((item) => {
          result.push({
            value: item.QBCustomerID,
            label: item.DisplayName,
            ClientKeyID: item.ClientKeyID,
            ClientID: item.ClientID,
          });
        });
      } else {
        const contacts = res.data?.contacts || [];

        contacts.forEach((item) => {
          result.push({
            value: item.XeroContactID,
            label: item.ContactName,
            ClientKeyID: item.ClientKeyID,
            ClientID: item.ClientID,
          });
        });
      }

      return result;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data);
    }
  }
);

// export const GetAllDrivers = createAsyncThunk(
//   "xero/getAllDrivers",
//   async (organisationKeyID, thunkAPI) => {
//     try {
//       const res = await apiClient.get(
//         `${Base_Url}/XEROAndQBO/GetLocalAndGlobalPricingDriverListWithServices?OrganisationKeyID=${organisationKeyID}`
//       );

//       const drivers = res.data?.responseData?.data || [];

//       // Transform data here (VERY IMPORTANT)
//       const formatted = drivers.map((d) => ({
//         id: d.globalPricingDriverID,
//         name: d.driverName,
//         services: d._ServiceList.map((s) => ({
//           serviceID: s.serviceID,
//           serviceName: s.serviceName,
//         })),
//       }));

//       return formatted; // clean data for UI
//     } catch (err) {
//       return thunkAPI.rejectWithValue(err.response?.data);
//     }
//   }
// );


export const GetAllMetricsList = createAsyncThunk(
   "metrics/GetAllMetricsList",

   async (_, thunkAPI) => {
      try {
         const res = await apiClient.get(`${DeviationBaseUrl}metrics`);

         const metrics = res?.data?.metrics || [];
 
         // format data for react-select
         const formatted = metrics.map((d) => ({
            metricKey: d.metricKey,
            description: d.description,
         }));

         return formatted;
      } catch (err) {
         return thunkAPI.rejectWithValue(
            err?.response?.data || "Something went wrong"
         );
      }
   }
);

export const addContactMapping = createAsyncThunk(
  "contact/addContactMapping",
  async (payload, thunkAPI) => {
    debugger;
    const { organisationKeyId, activePlatform, ...body } = payload;

    const baseUrl =
      activePlatform === "QuickBooks"
        ? `${QuickBookUrl}mappings/${organisationKeyId}`
        : `${XeroBaseUrl}mappings/${organisationKeyId}`;

    try {
      const response = await apiClient.post(baseUrl, body);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || "Error");
    }
  }
);

// delete Contact Mapping
export const deleteXeroContactMapping = createAsyncThunk(
  "xero/deleteMapping",
  async ({ organisationKeyId, xeroContactId }, thunkAPI) => {
    debugger;
    try {
      const url = `${XeroBaseUrl}mappings/${organisationKeyId}/${xeroContactId}`;

      const res = await apiClient.delete(url);

      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data);
    }
  }
);

export const deleteQuickBooksContactMapping = createAsyncThunk(
  "quickbooks/deleteMapping",
  async ({ organisationKeyID, xeroContactId }, thunkAPI) => {
    try {
      const url = `${QuickBookUrl}mappings/${organisationKeyID}/${xeroContactId}`;

      const res = await apiClient.delete(url);

      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data);
    }
  }
);

// export const SaveMetricMapping = createAsyncThunk(
//   "quickBook/SaveMetricMapping",

//    async ({ organisationKeyID, payload }, thunkAPI) => {
//     try {
//       const res = await apiClient.post(
//         `${DeviationBaseUrlv2}mappings/${organisationKeyID}`,
//         payload
//       );

//       return res.data;
//     } catch (err) {
//       return thunkAPI.rejectWithValue(
//         err?.response?.data || "Something went wrong"
//       );
//     }
//   }
// );

export const DisconnectIntegration = createAsyncThunk(
  "integration/disconnect",
  async ({ organisationKeyID, activePlatform, includeClients = false }, thunkAPI) => {
    try {
      const baseUrl =
        activePlatform === "QuickBooks"
          ? `${QuickBookUrl}disconnect/${organisationKeyID}`
          : `${XeroBaseUrl}disconnect/${organisationKeyID}`;

      const res = await apiClient.post(baseUrl, { includeClients });

      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message);
    }
  }
);

const quickBookSlice = createSlice({
  name: "quickbook",
  initialState: {
    connectionUrl: null,
    contactsLookup: [],
    drivers: [],
     metrics: [],
   metricsLoading: false,
   metricsError: null,
    message: "",
    loading: {
      connectionUrl: false,
      contactsLookup: false,
      drivers: false,
      disconnect: false,
    },

    error: {
      connectionUrl: null,
      contactsLookup: null,
      drivers: null,
      disconnect: null,
    },
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchQuickBookConnectionUrl.pending, (state) => {
        state.loading.connectionUrl = true;
      })
      .addCase(fetchQuickBookConnectionUrl.fulfilled, (state, action) => {
        state.loading.connectionUrl = false;
        state.connectionUrl = action.payload;
      })
      .addCase(fetchQuickBookConnectionUrl.rejected, (state, action) => {
        state.loading.connectionUrl = false;
        state.error.connectionUrl = action.payload;
      })
      //contacts
      .addCase(fetchContactsLookup.pending, (state) => {
        state.loading.contactsLookup = true;
      })
      .addCase(fetchContactsLookup.fulfilled, (state, action) => {
        state.loading.contactsLookup = false;
        state.contactsLookup = action.payload; //  FIXED
      })
      .addCase(fetchContactsLookup.rejected, (state, action) => {
        state.loading.contactsLookup = [];
        state.error.contactsLookup = action.payload;
      })
      // .addCase(GetAllDrivers.pending, (state) => {
      //   state.loading.drivers = true;
      // })
      // .addCase(GetAllDrivers.fulfilled, (state, action) => {
      //   state.loading.drivers = false;
      //   state.drivers = action.payload;
      // })
      // .addCase(GetAllDrivers.rejected, (state, action) => {
      //   state.loading.drivers = false;
      //   state.error.drivers = action.payload;
      // })
      .addCase(DisconnectIntegration.pending, (state) => {
        state.loading.disconnect = true;
      })
      .addCase(DisconnectIntegration.fulfilled, (state, action) => {
        state.loading.disconnect = false;
        state.message = "Disconnected successfully";
      })
      .addCase(DisconnectIntegration.rejected, (state, action) => {
        state.loading.disconnect = false;
        state.error.disconnect = action.payload;
      })

         // pending
         .addCase(GetAllMetricsList.pending, (state) => {
            state.metricsLoading = true;
            state.metricsError = null;
         })

         // fulfilled
         .addCase(GetAllMetricsList.fulfilled, (state, action) => {
            state.metricsLoading = false;
            state.metrics = action.payload;
         })

         // rejected
         .addCase(GetAllMetricsList.rejected, (state, action) => {
            state.metricsLoading = false;
            state.metricsError = action.payload;
         })
    // });
  },
});

export default quickBookSlice.reducer;
