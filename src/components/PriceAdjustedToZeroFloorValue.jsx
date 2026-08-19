import React from "react";
import Modal from "@mui/material/Modal";
import Button from "@mui/material/Button";

const PriceAdjustedToZeroFloorValue = ({
  open,
  handleClose,
  serviceNames = [],
  currencySymbol = "£",
}) => {
  const isSingle = serviceNames.length === 1;

  return (
    <Modal
      open={open}
      onClose={(e, reason) => {
        if (reason === "backdropClick") return;
        handleClose();
      }}
      aria-labelledby="price-adjusted-title"
      aria-describedby="price-adjusted-description"
      sx={{
        display: "flex",
        p: 1,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{ width: "520px", maxWidth: "95vw" }}
        className="modal-dialog modal-md modal-dialog-centered"
      >
        <div className="modal-content">
          <div className="modal-header" style={{ paddingBottom: "10px" }}></div>

          <div className="mt-2 text-center px-4">
            {/* Warning mark - plain CSS, no external asset dependency */}
            <div
              style={{
                width: "64px",
                height: "64px",
                margin: "0 auto",
                borderRadius: "50%",
                border: "3px solid #f7b84b",
                color: "#f7b84b",
                fontSize: "36px",
                lineHeight: "58px",
                fontWeight: "700",
              }}
            >
              !
            </div>

            <h4 className="text-dark mt-3" id="price-adjusted-title">
              {isSingle
                ? "A service yearly price has been set to " +
                  currencySymbol +
                  "0.01"
                : "Some service yearly prices have been set to " +
                  currencySymbol +
                  "0.01"}
            </h4>

            <p
              className="text-muted mb-2 mt-3"
              id="price-adjusted-description"
              style={{ fontSize: "14px" }}
            >
              {isSingle
                ? "Based on the current pricing set-up, the calculated yearly price for this service worked out to be less than or equal to zero:"
                : "Based on the current pricing set-up, the calculated yearly prices for these services worked out to be less than or equal to zero:"}
            </p>

            <div style={{ display: "flex", justifyContent: "center" }}>
              <ul
                className="ServicesUpdated-list"
                style={{
                  paddingLeft: "0px",
                  textAlign: "left",
                  marginBottom: "0px",
                  maxHeight: "180px",
                  overflowY: "auto",
                }}
              >
                {serviceNames.map((name, index) => (
                  <li key={`${name}-${index}`}>
                    <span className="fw-bold">{name}</span>
                  </li>
                ))}
              </ul>
            </div>

            <p className="text-muted mt-3 mb-0" style={{ fontSize: "14px" }}>
              {isSingle
                ? "A price below zero or equal to zero cannot be charged, so it has been shown as " +
                  currencySymbol +
                  "0.01 instead. Please review the pricing rules for this service if this is not what you expected."
                : "A price below zero or equal to zero cannot be charged, so they have been shown as " +
                  currencySymbol +
                  "0.01 instead. Please review the pricing rules for these services if this is not what you expected."}
            </p>
          </div>

          <div className="d-flex gap-2 justify-content-center mt-4 mb-3">
            <div>
              <button
                type="button"
                className="btn btn-primary create-item-btn"
                onClick={() => handleClose()}
              >
                <span style={{ padding: "15px" }}>Got it</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default PriceAdjustedToZeroFloorValue;
