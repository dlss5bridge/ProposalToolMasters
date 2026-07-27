import persistReducer from "redux-persist/es/persistReducer";
import storage from "redux-persist/lib/storage";
import storageSliceReducer from "../Persist";
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../reducer/authSlice";
import quickBookReducer from "../reducer/quickBookSlice";
import metricReducer from "../reducer/metricsSlice";
import pricingSettingsReducer from "../reducer/pricingSettings/pricingSettingsSlice";
import proposalStepperReducer from "../reducer/webProposal/proposalStepperSlice";
import pdfViewerReducer from "../reducer/pdfViewer/pdfViewerSlice";
import stepperReducer from "../reducer/webProposal/stepper/stepperSlice";
import webProposalServicesReducer from "../reducer/webProposal/services";
import webProposalReducer from "../reducer/webProposal";

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
    proposalStepper: proposalStepperReducer,
    pdfViewer: pdfViewerReducer,
    stepper: stepperReducer,
    webProposalServices: webProposalServicesReducer,
    webProposal: webProposalReducer,
  },
});
