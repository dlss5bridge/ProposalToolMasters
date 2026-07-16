import persistReducer from "redux-persist/es/persistReducer";
import storage from "redux-persist/lib/storage";
import storageSliceReducer from "../Persist";
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../reducer/authSlice";
import quickBookReducer from "../reducer/quickBookSlice";
import metricReducer from "../reducer/metricsSlice";
import pricingSettingsReducer from "../reducer/pricingSettings/pricingSettingsSlice";

const persistConfig = { key: "Proposal Tool", version: 1, storage };
const authPersistConfig = {
  key: "Bookkeeping",
  storage,
};

const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);
const persistReducerBlock = persistReducer(persistConfig, storageSliceReducer);

export const store = configureStore({
  reducer: {
    Storage: persistReducerBlock,
    auth: persistedAuthReducer,
    quickBook: quickBookReducer,
    metric: metricReducer,
    pricingSetting: pricingSettingsReducer,
  },
});
