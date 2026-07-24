import { useState } from "react";
import { Tooltip } from "@mui/material";
import ConfirmModel from "../ConfirmationBox";
import { getActivePlatform } from "../../lib/utils";

export default function AuthButton({
  onAuthenticate,
  onDisconnect,
  activeBtn,
  moduleName,
  activePlatform,
  tooltipLabel,
}) {
  const isDisabled = !!activePlatform; // disable if ANY platform exists
  const isConnected = !!activePlatform;

  const [loading, setLoading] = useState(false);
  const [openSuccessModal, setOpenSuccessModal] = useState(false);
  const [actionType, setActionType] = useState("");

  //===================functions============================
  const handleClose = () => {
    setOpenSuccessModal(false);
  };

  const handleYesClick = async () => {
    setLoading(true);
    try {
      if (actionType === "authenticate") {
        await onAuthenticate();
      } else if (actionType === "Disconnect") {
        await onDisconnect();
      }
    } catch (error) {
    } finally {
      setLoading(false);
      setOpenSuccessModal(false);
    }
  };

  return (
    <>
      <div className="d-flex gap-2">
        <Tooltip title={isDisabled ? tooltipLabel : ""} arrow>
          <span style={{ display: "inline-block" }}>
            <button
              // onClick={() => setOpenSuccessModal(true)}
              onClick={() => {
                setActionType("authenticate");
                setOpenSuccessModal(true);
                const modal = new window.bootstrap.Modal(
                  document.getElementById("ConfirmModel"),
                );
                modal.show();
              }}
              disabled={isDisabled}
              className={`btn btn-md btn-success create-item-btn${loading ? "opacity-60" : ""}`}
            >
              {loading && (
                <span className="spinner-border spinner-border-sm me-2"></span>
              )}
              Authenticate
            </button>
          </span>
        </Tooltip>

        {activeBtn && (
          <button
            onClick={() => {
              setActionType("Disconnect");
              setOpenSuccessModal(true);
              const modal = new window.bootstrap.Modal(
                document.getElementById("ConfirmModel"),
              );
              modal.show();
            }}
            disabled={loading}
            className={`btn btn-md create-item-btn${loading ? "opacity-60" : ""}`}
            // data-bs-toggle="modal"
            // data-bs-target="#ConfirmModel"
          >
            {loading && (
              <span className="spinner-border spinner-border-sm me-2"></span>
            )}
            Disconnect
          </button>
        )}
      </div>

      <ConfirmModel
        openSuccessModal={openSuccessModal}
        handleClose={handleClose}
        UpdatedStatus={handleYesClick}
        modelRequestData={{
          Action: actionType === "Disconnect" ? "Disconnect" : "Redirect",
        }}
      />
    </>
  );
}
