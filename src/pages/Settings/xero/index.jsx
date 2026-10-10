import { useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { ConnectionAuthentication } from "../../../redux/Services/Xero/XeroApi";
import AuthButton from "../../../components/Sidebar/AuthenticationButton";
import {
  DisconnectIntegration,
  GetAllMetricsList,
} from "../../../redux/reducer/quickBookSlice";
import ErrorModel from "../../../components/ErrorModel";
import { AuthContextProvider } from "../../../AuthContext/AuthContext";
import "./Xero.css";
import { getActivePlatform } from "../../../lib/utils";
import {
  quickBooksConnectionStatus,
  xeroConnectionStatus,
} from "../../../redux/reducer/authSlice";
import {
  GetAllDrivers,
  GetMetricMappings,
} from "../../../redux/reducer/metricsSlice";
import MappingUI from "./components/MetricsMapping";
import { GetDisconnectImpact } from "../../../redux/Services/Xero/XeroApi";

function XeroAuthentication() {
  const dispatch = useDispatch();
  const auth = useSelector((state) => state?.Storage);
  const drivers = useSelector((state) => state.metric.drivers);
  const metrics = useSelector((state) => state.quickBook.metrics);
  const metricMappings = useSelector((state) => state.metric.metricMappings);
  const activePlatform = getActivePlatform();
  const [impact, setImpact] = useState(null);
  const [includeClients, setIncludeClients] = useState(false);

  //=====================state========================
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
        activePlatform || "Xero",
      );

      if (res?.status === 200) {
        const url = res.data.connectionUrl;
        window.open(url, "_blank", "noopener,noreferrer");
      } else {
        setOpenErrorModal(true);
        setErrorMessage(res.response.data.message);
      }
    } catch (err) {
      console.error(err);
      setOpenErrorModal(true);
      setErrorMessage("Something went wrong");
    } finally {
      const modalEl = document.getElementById("ConfirmModel");
      if (modalEl) {
        const modalInstance =
          window.bootstrap.Modal.getInstance(modalEl) ||
          new window.bootstrap.Modal(modalEl);

        modalInstance.hide();
      }
    }
  };

  const handleDisconnect = async () => {
    try {
      await dispatch(
        DisconnectIntegration({
          organisationKeyID: auth?.organisationKeyID,
          activePlatform,
          includeClients,
        }),
      ).unwrap();

      dispatch(xeroConnectionStatus(auth?.organisationKeyID));
      dispatch(quickBooksConnectionStatus(auth?.organisationKeyID));
      window.location.reload();
    } catch (err) {
      console.error(err);
      setOpenErrorModal(true);
      setErrorMessage(err || "Something went wrong");
    } finally {
      const modalEl = document.getElementById("ConfirmModel");
      if (modalEl) {
        const modalInstance =
          window.bootstrap.Modal.getInstance(modalEl) ||
          new window.bootstrap.Modal(modalEl);

        modalInstance.hide();
      }
    }
  };

  const loadDisconnectImpact = async () => {
    setIncludeClients(false);      // default unticked each time the dialog opens
    setImpact(null);
    try {
      const res = await GetDisconnectImpact(auth?.organisationKeyID, activePlatform);
      setImpact(res?.data ?? null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleClose = () => {
    setOpenErrorModal(false);
  };

  return (
    <div className="container-fluid py-4">
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-semibold mb-0" style={{ color: "#111827" }}>
          Xero Driver Mapping
        </h4>

        <AuthButton
          onAuthenticate={handleAuthenticate}
          onDisconnect={handleDisconnect}
          activePlatform={activePlatform}
          activeBtn={activePlatform == "Xero" ? true : false}
          moduleName="Xero"
          tooltipLabel="Authenticate Xero"
          key={getActivePlatform()}
          onDisconnectOpen={loadDisconnectImpact}
          disconnectExtraContent={
            impact && impact.prospectCount > 0 ? (
              <div className="alert alert-warning text-start mt-3 mb-0">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="includeClients"
                    checked={includeClients}
                    onChange={(e) => setIncludeClients(e.target.checked)}
                  />
                  <label className="form-check-label fw-semibold" htmlFor="includeClients">
                    Also disconnect {impact.prospectCount} connected prospect
                    {impact.prospectCount === 1 ? "" : "s"}
                  </label>
                </div>
                <div className="small mt-2">
                  {impact.prospects.map((p) => p.clientName).join(", ")}
                  {impact.signedContractCount > 0 && (
                    <> — covering <strong>{impact.signedContractCount}</strong> signed engagement
                      letter{impact.signedContractCount === 1 ? "" : "s"} currently under review.
                      Disconnecting stops those reviews.</>
                  )}
                </div>
              </div>
            ) : null
          }
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

export default XeroAuthentication;
