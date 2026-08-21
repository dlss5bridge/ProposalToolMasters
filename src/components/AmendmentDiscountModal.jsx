import React from "react";
import Modal from "@mui/material/Modal";
import Backdrop from "@mui/material/Backdrop";
import { isAmendmentDiscountFieldValid } from "../pages/proposals/utils/amendmentDiscount";

const sanitizePercentageInput = (value) => {
  // Only digits and a single decimal point - up to 2 decimal places.
  let sanitized = value.replace(/[^0-9.]/g, "");
  const firstDot = sanitized.indexOf(".");
  if (firstDot !== -1) {
    sanitized =
      sanitized.slice(0, firstDot + 1) +
      sanitized.slice(firstDot + 1).replace(/\./g, "");
  }
  const [integerPart, decimalPart] = sanitized.split(".");
  sanitized =
    decimalPart !== undefined
      ? `${integerPart}.${decimalPart.slice(0, 2)}`
      : sanitized;

  if (Number(sanitized) > 100) {
    sanitized = decimalPart !== undefined ? "100.00" : "100";
  }

  return sanitized;
};

const AmendmentDiscountModal = (props) => {
  const recurringValid =
    !props.showRecurring ||
    isAmendmentDiscountFieldValid(
      props.recurringDiscountPercentageForAmendment,
      props.maxRecurringDiscount,
    );
  const oneOffValid =
    !props.showOneOff ||
    isAmendmentDiscountFieldValid(
      props.oneOffDiscountPercentageForAmendment,
      props.maxOneOffDiscount,
    );
  const isConfirmDisabled = !recurringValid || !oneOffValid;

  return (
    <Modal
      open={props.open}
      aria-labelledby="amendment-discount-modal-title"
      onClose={(e, reason) => {
        // Keep entered values around - only close via the Cancel button.
        if (reason === "backdropClick") return;
        props.handleClose();
      }}
      BackdropComponent={Backdrop}
      sx={{
        display: "flex",
        p: 1,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{ width: "500px" }}
        className="modal-dialog modal-dialog-centered"
      >
        <div className="modal-content">
          <div className="modal-header" style={{ paddingBottom: "10px" }}></div>
          <div className="modal-body">
            <div className="mt-2 fs-15 mx-4 mx-sm-5">
              <h4 id="amendment-discount-modal-title" className="text-dark">
                Amendment Discount
              </h4>
              <p className="text-muted mb-3">
                Enter the discount (%) applied for this Amendment proposal.
              </p>
              {props.showRecurring && (
                <div className="row fieldset mb-3">
                  <div className="col-12 text-start">
                    <label className="form-label">
                      Recurring Discount (%) for Amendment
                    </label>
                  </div>
                  <div className="col-12">
                    <input
                      type="text"
                      className="input-text"
                      style={{ width: "100%" }}
                      value={props.recurringDiscountPercentageForAmendment}
                      onChange={(e) =>
                        props.onRecurringChange(
                          sanitizePercentageInput(e.target.value),
                        )
                      }
                    />
                    {!recurringValid &&
                      props.recurringDiscountPercentageForAmendment !== "" && (
                        <span className="validation">
                          {`Must not exceed ${props.maxRecurringDiscount}%.`}
                        </span>
                      )}
                  </div>
                </div>
              )}
              {props.showOneOff && (
                <div className="row fieldset mb-3">
                  <div className="col-12 text-start">
                    <label className="form-label">
                      One-Off Discount (%) for Amendment
                    </label>
                  </div>
                  <div className="col-12">
                    <input
                      type="text"
                      className="input-text"
                      style={{ width: "100%" }}
                      value={props.oneOffDiscountPercentageForAmendment}
                      onChange={(e) =>
                        props.onOneOffChange(
                          sanitizePercentageInput(e.target.value),
                        )
                      }
                    />
                    {!oneOffValid &&
                      props.oneOffDiscountPercentageForAmendment !== "" && (
                        <span className="validation">
                          {`Must not exceed ${props.maxOneOffDiscount}%.`}
                        </span>
                      )}
                  </div>
                </div>
              )}
            </div>
            <div className="d-flex gap-2 justify-content-end mt-4 mb-2 pr-5">
              <button
                type="button"
                className="btn btn-md btn-light cancel-item-btn"
                onClick={props.handleClose}
              >
                <span>Cancel</span>
              </button>
              <button
                type="button"
                className="btn btn-md btn-success create-item-btn"
                onClick={props.handleConfirm}
                disabled={isConfirmDisabled}
              >
                <span>Confirm</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default AmendmentDiscountModal;
