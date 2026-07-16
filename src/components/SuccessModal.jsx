import React, { useState } from "react";
import Modal from "@mui/material/Modal";
import Button from "@mui/material/Button";
import "../pages/configure/global-constants/PredefineGlobalConstant.css";
import Backdrop from "@mui/material/Backdrop";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const SuccessModal = (props) => {
  const [isClosing, setIsClosing] = useState(false);
  const navigate = useNavigate();
  const common = useSelector((state) => state.Storage);
  return (
    <>
      <Modal
        open={props.openSuccessModal}
        // onClose={props.handleClose}
        // disableEnforceFocus={false} // Disable enforce focus to disable animation
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
        <div
          style={{ width: "500px" }}
          class="modal-dialog modal-md modal-dialog-centered"
        >
          <div class="modal-content">
            <div class="modal-header" style={{ paddingBottom: "10px" }}></div>
            {/* <div class="modal-body"> */}
            <div class="mt-2 text-center">
              <div className="modallogo">
                <div className="modallogo1"></div>
                <span className="modallogo2"></span>
                <span className="modallogo3"></span>
                <div className="modallogo4"></div>
                <div className="modallogo5"></div>
                <div className="modallogo6"></div>
              </div>
              <div class="mt-4 pt-2 fs-15 mx-4 mx-sm-5">
                <p class="text-muted  mb-0 " style={{ overflow: "auto" }}>
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
                  {/* {(props.modelAction === "Sent")
                      ? `${props.message} successfully Sent!`
                      : null} */}

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
                  {/* {(props.modelAction === "Update" && props.modelRequestData?.Action === "Update") &&
                      (
                        <>
                          <div >
                            <span class="text-muted mb-0">
                              {props.modelRequestData.message}
                            </span>
                          </div>
                          <div style={{ textAlign: "left" }}>
                            <ul class="designed-list" >
                              {props.modelRequestData.ServiceName?.map(item => (

                                <li key={item}> <span> {item}</span></li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <span class="text-muted mb-0">
                              Please update this services
                            </span>
                          </div>

                        </>
                      )
                    } */}
                  {common.organisationKeyID === null &&
                    props.modelAction === "Update" &&
                    props?.isCheck !== undefined && (
                      <div className="mt-3">
                        <span>
                          <input
                            style={{ marginRight: "5px" }}
                            type="checkbox"
                            checked={props?.isCheck} // Assuming props.isCheck is a boolean indicating checkbox state
                            onChange={() => props?.setIsCheck(!props?.isCheck)} // Toggle the checkbox state
                          />
                          <b>Notify existing users with this update.</b>
                        </span>
                      </div>
                    )}
                </p>
              </div>
            </div>
            <div class="d-flex gap-2 justify-content-center mt-4 mb-2">
              <p>
                <div className="add-new-btn">
                  <Button
                    type="button"
                    class="btn btn-md btn-success create-item-btn"
                    onClick={() => {
                      props.handleClose();
                      // props.setOpenSuccessModal(false)
                    }}
                  >
                    <span style={{ padding: "15px" }}>Ok</span>
                  </Button>
                </div>
              </p>
            </div>
            {/* </div> */}
          </div>
        </div>
      </Modal>
    </>
  );
};

export default SuccessModal;
