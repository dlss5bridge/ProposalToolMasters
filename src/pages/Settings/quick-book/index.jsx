import { useContext, useEffect, useState } from "react";
import Select from "react-select";
import { useDispatch, useSelector } from "react-redux";

import { ConnectionAuthentication } from "../../../redux/Services//Xero/XeroApi";
import AuthButton from "../../../components/Sidebar/AuthenticationButton";
import {
  DisconnectIntegration,
  GetAllMetricsList,
  //   GetAllDrivers
} from "../../../redux/reducer/quickBookSlice";
import ErrorModel from "../../../components/ErrorModel";
import { AuthContextProvider } from "../../../AuthContext/AuthContext";
import "../xero/Xero.css";
import { getActivePlatform } from "../../../lib/utils";
import {
  quickBooksConnectionStatus,
  xeroConnectionStatus,
} from "../../../redux/reducer/authSlice";
import MappingUI from "../xero/components/MetricsMapping";
import {
  GetAllDrivers,
  GetMetricMappings,
} from "../../../redux/reducer/metricsSlice";

function QuickBookAuthentication() {
  const dispatch = useDispatch();
  const auth = useSelector((state) => state?.Storage);
  const drivers = useSelector((state) => state.metric.drivers);
  const metrics = useSelector((state) => state.quickBook.metrics);
  const metricMappings = useSelector((state) => state.metric.metricMappings);
  const activePlatform = getActivePlatform();

  //==================state=====================
  const { handleErrorMessage } = useContext(AuthContextProvider);
  const [errorMessage, setErrorMessage] = useState("");
  const formattedErrorMessage = handleErrorMessage(errorMessage);
  const [openErrorModal, setOpenErrorModal] = useState(false);

  //==================UseEffect=====================
  useEffect(() => {
    dispatch(GetAllDrivers(auth?.organisationKeyID));
    dispatch(GetAllMetricsList());
    dispatch(GetMetricMappings(auth?.organisationKeyID));
  }, [dispatch, auth?.organisationKeyID]);

  //==================functions=====================
  const handleAuthenticate = async () => {
    try {
      const raw = JSON.parse(localStorage.getItem("persist:Proposal Tool"));
      const organisationKeyID = JSON.parse(raw.organisationKeyID);

      const res = await ConnectionAuthentication(
        organisationKeyID,
        activePlatform || "QuickBooks",
      );

      if (res?.status === 200) {
        const url = res.data.connectionUrl;
        // CLOSE MODAL BEFORE REDIRECT
        const modalEl = document.getElementById("ConfirmModel");
        if (modalEl) {
          const modalInstance =
            window.bootstrap.Modal.getInstance(modalEl) ||
            new window.bootstrap.Modal(modalEl);

          modalInstance.hide();
        }

        window.open(url, "_blank", "noopener,noreferrer");
      } else {
        setOpenErrorModal(true);
        setErrorMessage(res.response.data.message);
      }
    } catch (err) {
      console.error(err);
      setOpenErrorModal(true);
      setErrorMessage("Something went wrong");
    }
  };

  const handleDisconnect = async () => {
    try {
      await dispatch(
        DisconnectIntegration({
          organisationKeyID: auth?.organisationKeyID,
          activePlatform,
        }),
      ).unwrap();

      dispatch(xeroConnectionStatus(auth?.organisationKeyID));
      dispatch(quickBooksConnectionStatus(auth?.organisationKeyID));
      window.location.reload();
    } catch (err) {
      console.error(err);

      setOpenErrorModal(true);
      setErrorMessage(err || "Something went wrong");
    }
  };

  const handleClose = () => {
    setOpenErrorModal(false);
    const modalEl = document.getElementById("ConfirmModel");
    if (modalEl) {
      const modalInstance =
        window.bootstrap.Modal.getInstance(modalEl) ||
        new window.bootstrap.Modal(modalEl);

      modalInstance.hide();
    }
  };

  return (
    <div className="container-fluid py-4">
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-semibold mb-0" style={{ color: "#111827" }}>
          QuickBooks Integration
        </h4>

        <AuthButton
          onAuthenticate={handleAuthenticate}
          onDisconnect={handleDisconnect}
          activeBtn={activePlatform === "QuickBooks" ? true : false}
          activePlatform={activePlatform}
          moduleName="QuickBooks"
          tooltipLabel="Authenticate Quickbook"
        />
      </div>

      {/* MAPPING */}
      <MappingUI
        drivers={drivers}
        metrics={metrics}
        metricMappings={metricMappings}
      />

      {/* ERROR MODAL */}
      <ErrorModel
        ErrorModel={openErrorModal}
        handleClose={handleClose}
        ErrorMessage={formattedErrorMessage}
      />
    </div>
  );
}

export default QuickBookAuthentication;
