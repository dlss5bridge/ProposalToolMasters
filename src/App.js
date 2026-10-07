// ------------------------------------Pages with loader--------------------------------------------
import { useEffect, useState } from "react";
import Index from "./routes/Index";
import { SuccessToastHost } from "./components/SuccessToast";
import Img from "../src/assets/images/internetdis.png";
// -----------------------------------App Component------------------------------------------------
function App() {
  // checking internet connection , real time
  const [status, setStatus] = useState(() => {
    if (navigator.onLine) {
      return true;
    } else {
      return false;
    }
  });

  useEffect(() => {
    window.ononline = (e) => {
      setStatus(true);
    };

    window.onoffline = (e) => {
      setStatus(false);
    };
  }, [status]);

  useEffect(() => {
    sessionStorage.setItem("data-layout", "horizontal");
    const broadcastChannel = new BroadcastChannel("reloadChannel");
    const handleReloadMessage = (event) => {
      window.location.reload();
    };
    broadcastChannel.addEventListener("message", handleReloadMessage);

    let isPageUnloading = false;

    const handleBeforeUnload = () => {
      isPageUnloading = true;
    };

    const handleUnload = () => {
      const navigationType = performance.getEntriesByType("navigation")[0].type;
      // If it's a page reload (not tab close), don't remove anything
      if (navigationType === "reload") {
        return; // Do nothing on page refresh
      }
      if (isPageUnloading) {
        // localStorage.removeItem("userAccess");
        localStorage.removeItem("OrganisationLocalList");
        localStorage.removeItem("userThemeSettingLocalStorage");
        // localStorage.removeItem("logoutMilliseconds");
        localStorage.removeItem("subscriptionPlan");
        localStorage.removeItem("accessCount");
        // dispatch(resetState());
      }
    };

    const handleDOMContentLoaded = () => {
      if (performance.navigation.type === 1) {
        // Page was reloaded, do not logout
        isPageUnloading = false;
      } else {
        isPageUnloading = true;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("unload", handleUnload);
    document.addEventListener("DOMContentLoaded", handleDOMContentLoaded);

    return () => {
      broadcastChannel.removeEventListener("message", handleReloadMessage);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("unload", handleUnload);
      document.removeEventListener("DOMContentLoaded", handleDOMContentLoaded);
    };
  }, []);

  return (
    <>
      <SuccessToastHost />
      {status ? (
        <Index />
      ) : (
        <>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100vh",
            }}
          >
            <img
              src={Img}
              alt="internetDisConnect"
              style={{ width: "100px" }}
            />
            <h1 style={{ marginBottom: "5px" }}>No Connection</h1>
            <h4 style={{ margin: "0px" }}>
              You are not connected to the internet
            </h4>
          </div>
        </>
      )}
    </>
  );
}

export default App;
