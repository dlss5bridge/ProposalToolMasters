import React, { useEffect, useRef } from "react";
import Modal from "@mui/material/Modal";
import Button from "@mui/material/Button";
import Backdrop from "@mui/material/Backdrop";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { showSuccessToast } from "./SuccessToast";
import "./SuccessModal.css";

const SuccessModal = (props) => {
  const navigate = useNavigate();
  const common = useSelector((state) => state.Storage);

  // Same message markup as before; shown in the toast or (when kept) the popup
  const messageContent = (
    <>
    {props.modelAction === null ? props.message : null}
    {
      props.modelAction === "Update" ? (
        <div>
          <div>
            <span class="text-muted mb-0">
              {props.message} has been updated successfully!
            </span>
          </div>
          {props?.modelRequestData?.Action === "Update" &&
            props?.modelRequestData?.ServiceName?.length > 0 && (
              <>
                <div class="mt-3">
                  <span class="text-muted mb-0 mt-2">
                    {props?.modelRequestData?.message}
                  </span>
                </div>
                {/* Display list of services from modelRequestData.ServiceName */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  <ul
                    style={{
                      paddingLeft: "0px",
                      textAlign: "left",
                      marginBottom: "0px",
                    }}
                    class="ServicesUpdated-list"
                  >
                    {props?.modelRequestData?.ServiceName?.map(
                      (item) => (
                        <li key={item}>
                          <span>{item}</span>
                        </li>
                      ),
                    )}
                  </ul>
                </div>
                {/* Display a message */}
                <div>
                  <span class="text-muted mb-0">
                    {props?.modelRequestData?.ServiceName
                      ?.length === 1 ? (
                      <>
                        {" "}
                        Please update this{" "}
                        {props?.modelRequestData?.name} as
                        appropriate
                      </>
                    ) : (
                      <>
                        {" "}
                        Please update these{" "}
                        {props?.modelRequestData?.name} as
                        appropriate
                      </>
                    )}
                  </span>
                </div>
              </>
            )}
        </div>
      ) : null // If modelAction is not "Add", render nothing
    }

    {props.modelAction === "Add"
      ? `${props.message} has been added successfully!`
      : null}
    {props.modelAction === "UnpaidUser" ? (
      <span class="text-muted mb-0">{props.message}</span>
    ) : null}
    {props.modelAction === "PaidUser" ? (
      <span class="text-muted mb-0">{props.message}</span>
    ) : null}
    {props.modelAction === "NotificationSend"
      ? `Notification has been send successfully!`
      : null}
    {props.modelAction === "Uploaded"
      ? `${props.message} `
      : null}
    {props.modelAction === "Send"
      ? `${props.message} with ${props.refIdStore} successfully sent!`
      : null}
    {props.modelAction === "ResendAddUpdateQuote"
      ? `${props.message} sent successfully!`
      : null}
    {props.modelAction === "ResendAddUpdateContract"
      ? `${props.message} sent successfully!`
      : null}
    {props.modelAction === "Resend"
      ? `${props.message} with ${props.refIdStore} successfully re-sent!`
      : null}
    {props.modelAction === "EmailSend"
      ? `${props.message} successfully sent!`
      : null}
    {props.modelAction === "Skipped"
      ? `${props.message} has been skipped successfully!`
      : null}
    {props.modelAction === "Draft"
      ? `${props.message} has been draft successfully!`
      : null}
    {props.modelAction === "Purchase"
      ? `Subscription plan ${props.message} has been purchased successfully!`
      : null}

    {props.modelAction === "Delete"
      ? `${props.message} has been deleted successfully!`
      : null}
    {props.modelAction === "Redirect"
      ? `Prospect has been authenticated successfully!`
      : null}
    {props.modelAction === "DeleteFeeInflation"
      ? `${props.message} has been deleted successfully!`
      : null}
    {props.modelAction === "Archive"
      ? `${props.message} has been archived successfully!`
      : null}
    {props.modelAction === "DeleteContract"
      ? `${props.message} has been deleted successfully!`
      : null}
    {props.modelAction === "ArchiveContract"
      ? `${props.message} has been archived successfully!`
      : null}
    {props.modelAction === "Unarchive"
      ? `${props.message} has been Unarchived successfully!`
      : null}
    {props.modelAction === "UnarchiveContract"
      ? `${props.message} has been Unarchived successfully!`
      : null}
    {props.modelAction === "ArchiveLinkedELs"
      ? `${props.message}`
      : null}
    {props.modelAction === "Copy" ? `${props.message}` : null}
    {props.modelAction === "Void" ? `${props.message}` : null}
    {props.modelAction === "EnableApiIntegration"
      ? `${props.message}`
      : null}
    {props.modelAction === "Status" ? `${props.message}` : null}
    {props.modelAction === "ReminderStatus"
      ? `${props.message}`
      : null}
    {props.modelAction === "ShowMessage" ? props.message : null}
    {props.modelAction === "Create"
      ? `${props.message} has been created successfully!`
      : null}
    {props.modelAction === "2FaStatusChange"
      ? props.message
      : null}
    {props.modelAction === "Paid"
      ? `${props.message} has been updated successfully!`
      : null}
    {props.modelAction === "ResetEmailConfigurationChange"
      ? `${props.message} has been reset successfully!`
      : null}
    {props.modelAction === "AddContact"
      ? `${props.message}!`
      : null}
    {props.modelAction === "Create Invoice"
      ? `${props?.message}!`
      : null}

    {common.organisationKeyID === null &&
      props.modelAction === "Update" &&
      props?.isCheck !== undefined && (
        <div className="sm-notify-row">
          <label>
            <input
              type="checkbox"
              checked={props?.isCheck} // Assuming props.isCheck is a boolean indicating checkbox state
              onChange={() => props?.setIsCheck(!props?.isCheck)} // Toggle the checkbox state
            />
            <b>Notify existing users with this update.</b>
          </label>
        </div>
      )}
    </>
  );

  // The popup stays only where the user has to act on it (the "Notify existing
  // users" checkbox) or where a page asks for it with keepPopup.
  const showNotifyOption =
    common.organisationKeyID === null &&
    props.modelAction === "Update" &&
    props?.isCheck !== undefined;
  const showAsToast = !props.keepPopup && !showNotifyOption;

  // Toast mode: show the toast at the moment the popup would have opened and
  // run the same handleClose the Ok button ran, so the flow carries on without
  // the extra click. A page that is still saving after it reports success can
  // pass holdClose: the toast shows at once, handleClose waits until it's false.
  const handledRef = useRef(false);
  const closePendingRef = useRef(false);
  useEffect(() => {
    if (!props.openSuccessModal) {
      handledRef.current = false;
      closePendingRef.current = false;
      return;
    }
    if (!showAsToast) return;
    if (!handledRef.current) {
      handledRef.current = true;
      closePendingRef.current = true;
      showSuccessToast(messageContent, {
        duration:
          props?.modelRequestData?.ServiceName?.length > 0 ? 8000 : 4500,
      });
    }
    if (closePendingRef.current && !props.holdClose) {
      closePendingRef.current = false;
      props.handleClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.openSuccessModal, showAsToast, props.holdClose]);

  return (
    <>
      <Modal
        open={props.openSuccessModal && !showAsToast}
        aria-labelledby="parent-modal-title"
        aria-describedby="parent-modal-description"
        onClose={(e, reason) => {
          // Prevent closing when clicking outside (backdrop)
          if (reason === "backdropClick") return;
          props.handleClose(); // Close only when explicitly triggered (like by clicking the button)
        }}
        BackdropComponent={props?.isBackDropDisplay ? Backdrop : ""}
        sx={{
          display: "flex",
          p: 1,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div className="sm-dialog">
          <div className="sm-content">
            <div className="sm-icon-halo">
              <div className="sm-icon">
                <CheckCircleOutlineIcon fontSize="inherit" />
              </div>
            </div>

            <div className="sm-body">
              <p className="sm-message">{messageContent}</p>
            </div>

            <div className="sm-footer">
              <Button
                type="button"
                className="sm-ok-btn"
                onClick={() => {
                  props.handleClose();
                }}
              >
                <span>Ok</span>
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default SuccessModal;
