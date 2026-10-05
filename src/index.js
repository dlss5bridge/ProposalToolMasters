import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./aiBot.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import AuthContext from "./AuthContext/AuthContext.jsx";
import { PersistGate } from "redux-persist/integration/react";
import persistStore from "redux-persist/es/persistStore";
import { store } from "./redux/store/store";
import { Provider } from "react-redux";
import { PublicClientApplication, EventType } from "@azure/msal-browser";
import { msalConfig } from "./config/microsoftConfig.js";
import { MsalProvider } from "@azure/msal-react";

// react-pdf (and its bundled pdf.js) is intentionally NOT imported here anymore.
// It was only used to set pdfjs.GlobalWorkerOptions.workerSrc, which dragged the
// whole library into the eager entry bundle. The worker is now configured inside
// the lazy PdfViewers component where react-pdf is actually rendered.

const msalInstance = new PublicClientApplication(msalConfig);

msalInstance.addEventCallback((event) => {
  if (event.EventType === EventType.LOGIN_SUCCESS && event.payload.account) {
    const account = event.payload.account;
    msalInstance.setActiveAccount(account);
  }
});

const AppWrapper = () => {
  return (
    // <React.StrictMode>
    <MsalProvider instance={msalInstance}>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistores}>
          <AuthContext>
            <App />
          </AuthContext>
        </PersistGate>
      </Provider>
    </MsalProvider>
    // </React.StrictMode>
  );
};

const root = createRoot(document.getElementById("root"));

let persistores = persistStore(store);

root.render(<AppWrapper />);

reportWebVitals();
