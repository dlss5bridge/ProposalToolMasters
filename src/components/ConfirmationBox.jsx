/* global $ */
import React from "react";
import { useContext } from "react";
import editGif from "../assets/images/gif/edit.gif";
import { AuthContextProvider } from "../AuthContext/AuthContext";

function ConfirmModel({
  UpdatedStatus,
  openErrorModal,
  modelRequestData,
  setModelRequestData,
  openSuccessModal,
  modelAction,
}) {
  const { EngagementName } = useContext(AuthContextProvider);
  return (
    <div
      style={{ display: openSuccessModal || openErrorModal ? "block" : "none" }}
      className="modal fade zoomIn designed-popup"
      id="ConfirmModel"
      tabIndex="-1"
      aria-hidden="true"
      data-bs-backdrop="static"
      data-bs-keyboard="false"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div
            class="modal-header"
            style={{
              paddingBottom: "10px",
              borderTop: "1px solid #d3d6d8",
              borderLeft: "1px solid #d3d6d8",
              borderRight: "1px solid #d3d6d8",
            }}
          >
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
              // onClick={() => modelRequestData.Action === "PaymentStatus" ? handleClose() : null}
              data-bs-backdrop="static"
              data-bs-keyboard="false"
              id="btn-close"
            ></button>
          </div>
          <div
            className={`custom-style modal-body ${
              modelRequestData.Action === "PaymentStatus"
                ? "payment-status"
                : ""
            }`}
          >
            <div class="  text-center">
              {(modelRequestData.Action === "Status" ||
                modelRequestData.Action === "EnableApiIntegration") && (
                <img
                  src={editGif}
                  trigger="loop"
                  colors="primary:#f7b84b,secondary:#f06548"
                  style={{ width: "85px", height: "50px" }}
                />
              )}
              {modelRequestData.Action === "Delete" && (
                <lord-icon
                  src="https://cdn.lordicon.com/gsqxdxog.json"
                  trigger="loop"
                  colors="primary:#f7b84b,secondary:#f06548"
                  style={{ width: "75px", height: "60px" }}
                ></lord-icon>
              )}
              {modelRequestData.Action === "Redirect" && (
                <lord-icon
                  src="https://cdn.lordicon.com/uecgmesg.json"
                  trigger="loop"
                  colors="primary:#f7b84b,secondary:#f06548"
                  style={{ width: "75px", height: "60px" }}
                ></lord-icon>
              )}

              {modelRequestData.Action === "Disconnected" && (
                <lord-icon
                  src="https://cdn.lordicon.com/gsqxdxog.json"
                  trigger="loop"
                  colors="primary:#f7b84b,secondary:#f06548"
                  style={{ width: "75px", height: "60px" }}
                ></lord-icon>
              )}

              {modelRequestData.Action === "Add Contact" && (
                <lord-icon
                  src="https://cdn.lordicon.com/mecwbjnp.json"
                  trigger="loop"
                  colors="primary:#22c55e,secondary:#16a34a"
                  style={{ width: "75px", height: "60px" }}
                ></lord-icon>
              )}
              {modelRequestData.Action === "Add Contact Mapping" && (
                <lord-icon
                  src="https://cdn.lordicon.com/mecwbjnp.json"
                  trigger="loop"
                  colors="primary:#22c55e,secondary:#16a34a"
                  style={{ width: "75px", height: "60px" }}
                ></lord-icon>
              )}
              {(modelRequestData.Action === "Archive" ||
                modelRequestData.Action === "Unarchive" ||
                modelRequestData.Action === "ArchiveLinkedELs") && (
                <lord-icon
                  src="https://cdn.lordicon.com/xhdhjyqy.json"
                  trigger="loop"
                  colors="primary:#6c757d"
                  style={{ width: "60px", height: "60px" }}
                ></lord-icon>
              )}
              {modelRequestData.Action === "DeleteContract" && (
                <lord-icon
                  src="https://cdn.lordicon.com/gsqxdxog.json"
                  trigger="loop"
                  colors="primary:#f7b84b,secondary:#f06548"
                  style={{ width: "75px", height: "60px" }}
                ></lord-icon>
              )}
              {modelRequestData.Action === "ArchiveContract" && (
                <lord-icon
                  src="https://cdn.lordicon.com/xhdhjyqy.json"
                  trigger="loop"
                  colors="primary:#6c757d"
                  style={{ width: "60px", height: "60px" }}
                ></lord-icon>
              )}
              {modelRequestData.Action === "UnarchiveContract" && (
                <lord-icon
                  src="https://cdn.lordicon.com/xhdhjyqy.json"
                  trigger="loop"
                  colors="primary:#6c757d"
                  style={{ width: "60px", height: "60px" }}
                ></lord-icon>
              )}
              {modelRequestData.Action === "ResetEmailConfigurationChange" && (
                <lord-icon
                  src="https://cdn.lordicon.com/gsqxdxog.json"
                  trigger="loop"
                  colors="primary:#f7b84b,secondary:#f06548"
                  style={{ width: "75px", height: "60px" }}
                ></lord-icon>
              )}
              {modelRequestData.Action === "ClearCcBcc" && (
                <lord-icon
                  src="https://cdn.lordicon.com/gsqxdxog.json"
                  trigger="loop"
                  colors="primary:#f7b84b,secondary:#f06548"
                  style={{ width: "75px", height: "60px" }}
                ></lord-icon>
              )}

              {modelRequestData.Action === "Copy" && (
                <lord-icon
                  src="https://cdn.lordicon.com/uecgmesg.json"
                  trigger="loop"
                  colors="primary:#30c9e8,secondary:#08a88a"
                  style={{ width: "75px", height: "60px" }}
                ></lord-icon>
              )}

              <div class=" fs-15 mx-4 mx-sm-3">
                <h4 class="text-dark">Are you sure?</h4>
                {(modelRequestData.Action === "ReminderStatus" ||
                  modelRequestData.Action === "EnableApiIntegration") &&
                  (modelRequestData?.StatusType === null ||
                    modelRequestData?.StatusType === "" ||
                    modelRequestData?.StatusType === undefined) && (
                    <span class="text-muted mb-0">
                      Are you sure you want to change status to{" "}
                      {modelRequestData.status === "Enable"
                        ? "Disable"
                        : "Enable"}
                      ?
                    </span>
                  )}
                {modelRequestData.Action === "PaymentStatus" && (
                  <p class="text-muted mb-0">
                    Are you sure you want to set this payment gateway as default
                    payment gateway ?
                  </p>
                )}
                {modelRequestData.Action === "Status" &&
                  (modelRequestData?.StatusType === null ||
                    modelRequestData?.StatusType === "" ||
                    modelRequestData?.StatusType === undefined) && (
                    <span class="text-muted mb-0">
                      Are you sure you want to change status to{" "}
                      {modelRequestData.status === "Active"
                        ? "InActive"
                        : "Active"}
                      ?
                    </span>
                  )}
                {modelRequestData.Action === "Resend" &&
                  (modelRequestData?.StatusType === null ||
                    modelRequestData?.StatusType === "" ||
                    modelRequestData?.StatusType === undefined) && (
                    <span class="text-muted mb-0">
                      {modelRequestData.message}
                    </span>
                  )}
                {(modelRequestData.Action === "UnpaidUser" ||
                  modelRequestData.Action === "PaidUser") &&
                  (modelRequestData?.StatusType === null ||
                    modelRequestData?.StatusType === "" ||
                    modelRequestData?.StatusType === undefined) && (
                    <span class="text-muted mb-0">
                      Are you sure you want to change status to{" "}
                      {modelRequestData.status === "Active"
                        ? "InActive"
                        : "Active"}
                      ?
                    </span>
                  )}
                {modelRequestData.Action === "Delete" && (
                  <span class="text-muted mb-0">
                    Are you sure you want to delete this record?
                  </span>
                )}

                {modelRequestData.Action === "Redirect" && (
                  <span class="text-muted mb-0">
                    You are about to connect your account securely.
                  </span>
                )}
                {modelRequestData.Action === "Disconnect" && (
                  <span class="text-muted mb-0">
                    Are you sure want to unauthorised organisation.
                  </span>
                )}
                {modelRequestData.Action === "Add Contact" && (
                  <span class="text-muted mb-0">
                    Are you sure you want to add this record into Xero?
                  </span>
                )}
                {modelRequestData.Action === "Add Contact Mapping" && (
                  <span class="text-muted mb-0">
                    Are you sure you want to add this record into Xero?
                  </span>
                )}
                {modelRequestData.Action === "Archive" && (
                  <span class="text-muted mb-0">
                    Are you sure you want to Archive this record?
                  </span>
                )}
                {modelRequestData.Action === "ArchiveLinkedELs" &&
                  modelRequestData.contracts?.length > 0 && (
                    <>
                      <p className="text-muted mb-1">
                        Archiving this record would also Archive all linked{" "}
                        {EngagementName}:
                      </p>
                      <ul>
                        {modelRequestData.contracts.map((contract) => (
                          <li key={contract.RefID}>{contract.RefID}</li>
                        ))}
                      </ul>
                    </>
                  )}
                {modelRequestData.Action === "Unarchive" && (
                  <span class="text-muted mb-0">
                    Are you sure you want to Unarchive this record?
                  </span>
                )}
                {modelRequestData.Action === "DeleteContract" && (
                  <span class="text-muted mb-0">
                    Are you sure you want to delete this record?
                  </span>
                )}
                {modelRequestData.Action === "ArchiveContract" && (
                  <span class="text-muted mb-0">
                    Are you sure you want to Archive this record?
                  </span>
                )}
                {modelRequestData.Action === "UnarchiveContract" && (
                  <span class="text-muted mb-0">
                    Are you sure you want to Unarchive this record?
                  </span>
                )}
                {modelRequestData.Action === "Void" && (
                  <span class="text-muted mb-0">
                    Are you sure you want to void this record?
                  </span>
                )}
                {modelRequestData.Action ===
                  "ResetEmailConfigurationChange" && (
                  <span class="text-muted mb-0">
                    Are you sure you want to reset email configuration?
                  </span>
                )}
                {modelRequestData.Action === "ResetPaymentGatewayChange" && (
                  <span class="text-muted mb-0">
                    {`Are you sure you want to reset ${modelRequestData.moduleName}?`}
                  </span>
                )}
                {modelRequestData.Action === "ClearCcBcc" && (
                  <span class="text-muted mb-0">
                    Are you sure you want to reset CC/BCC configuration?
                  </span>
                )}
                {modelRequestData.Action === "Copy" && (
                  <span class="text-muted mb-0">
                    Are you sure you want to copy this record?
                  </span>
                )}
                {modelRequestData.Action === "FeeInflationWarning" && (
                  <span class="text-muted mb-0">
                    {modelRequestData.message}
                  </span>
                )}
                {modelRequestData.Action ===
                  "DeleteServiceFeeInflationConfig" && (
                  <span class="text-muted mb-0">
                    {modelRequestData.message}
                  </span>
                )}
                {modelRequestData.Action ===
                  "DeleteServiceFeeInflationRule" && (
                  <>
                    <span class="text-muted mb-0">
                      {modelRequestData.message}
                    </span>
                    {modelRequestData.ServiceName?.length > 0 && (
                      <ul
                        className="designed-list"
                        style={{
                          textAlign: "left",
                          maxHeight: "180px",
                          overflowY: "auto",
                        }}
                      >
                        {modelRequestData.ServiceName.map((item, idx) => (
                          <li key={`draft-${idx}`}>{item}</li>
                        ))}
                      </ul>
                    )}
                  </>
                )}
                {modelRequestData.Action === "ServiceWarning" && (
                  <div
                    className="text-muted mb-1"
                    style={{ whiteSpace: "pre-wrap", textAlign: "left" }}
                  >
                    {modelRequestData.message}
                    <div>
                      <ul
                        className="mt-1"
                        style={{ textAlign: "left", display: "inline-block" }}
                      >
                        {modelRequestData.ServiceName?.map((name, index) => (
                          <li key={index}>{name}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
                {modelRequestData.Action === "ServiceWarningEL" && (
                  <div
                    className="text-muted mb-1"
                    style={{ whiteSpace: "pre-wrap", textAlign: "left" }}
                  >
                    {modelRequestData.message}
                  </div>
                )}
                {modelRequestData.Action === "Upload" && (
                  <>
                    <span class="text-muted mb-3">
                      Are you sure you want to upload this file?
                    </span>
                  </>
                )}

                {modelRequestData.StatusType === "IsDefault" &&
                  modelRequestData.Action === "Status" && (
                    <p class="text-muted mb-0">
                      Are you sure you want to{" "}
                      {modelRequestData.isDefault
                        ? "set this template as default template"
                        : "remove this template from default"}
                      ?
                    </p>
                  )}
                {modelRequestData.StatusType === "2FaIsDefault" &&
                  modelRequestData.Action === "Status" && (
                    <p class="text-muted mb-0">
                      Are you sure you want to{" "}
                      {modelRequestData.isDefault
                        ? "set this verification as the default verification?"
                        : "remove this verification from default ?"}
                    </p>
                  )}
                {modelRequestData.StatusType === "2FaStatusChange" && (
                  <p class="text-muted mb-0">
                    Are you sure you want to {modelRequestData.status} 2 Step
                    Verification?
                  </p>
                )}
                {modelRequestData.Action === "ELStatusChange" && (
                  <p class="text-muted mb-0">
                    Are you sure you want to {modelRequestData.status} EL?
                  </p>
                )}
                {modelRequestData.Action === "emailStatusChange" && (
                  <p class="text-muted mb-0">
                    Are you sure you want to {modelRequestData.status} mail box?
                  </p>
                )}

                {modelRequestData.Action === "vatStatus" && (
                  <>
                    <img
                      src={editGif}
                      trigger="loop"
                      colors="primary:#f7b84b,secondary:#f06548"
                      style={{ width: "85px", height: "50px" }}
                    />
                    <p class="text-muted mb-0">
                      Are you sure you want to change VAT Status?
                    </p>
                  </>
                )}
                {/* {modelRequestData.Action === "Warning" && (
                  <>
                    <div>
                      <span class="text-muted mb-0">
                        {modelRequestData.message}
                      </span>
                    </div>
                    <div style={{ textAlign: "left" }}>
                      <ul class="designed-list">
                        {modelRequestData.DriverName?.map((item) => (
                          <li key={item}>
                            {" "}
                            <span> {item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <span class="font-weight-bold  mb-0">
                      Do you still want to{" "}
                      {modelAction == "Update" ? "update" : modelAction} the
                      service ?.
                    </span>
                  </>
                )} */}
                {modelRequestData.Action === "Warning" && (
                  <>
                    {modelRequestData.message && (
                      <>
                        <span className="text-muted mb-0">
                          {modelRequestData.message}
                        </span>
                        <ul
                          className="designed-list"
                          style={{ textAlign: "left" }}
                        >
                          {modelRequestData.DriverName?.map((item, idx) => (
                            <li key={`driver-${idx}`}>{item}</li>
                          ))}
                        </ul>
                      </>
                    )}

                    {modelRequestData.dependingMessage && (
                      <>
                        <div style={{ marginTop: "1rem" }}>
                          <span className="text-muted mb-0">
                            {modelRequestData.dependingMessage}
                          </span>
                          <ul
                            className="designed-list"
                            style={{ textAlign: "left" }}
                          >
                            {modelRequestData.dependingList?.map(
                              (item, idx) => (
                                <li key={`dep-${idx}`}>{item}</li>
                              ),
                            )}
                          </ul>
                        </div>
                      </>
                    )}

                    {modelRequestData.prerequisiteMessage && (
                      <>
                        <div style={{ marginTop: "1rem" }}>
                          <span className="text-muted mb-0">
                            {modelRequestData.prerequisiteMessage}
                          </span>
                          <ul
                            className="designed-list"
                            style={{ textAlign: "left" }}
                          >
                            {modelRequestData.prerequisiteList?.map(
                              (item, idx) => (
                                <li key={`pre-${idx}`}>{item}</li>
                              ),
                            )}
                          </ul>
                        </div>
                      </>
                    )}

                    <span className="font-weight-bold mb-0">
                      Do you still want to{" "}
                      {modelAction === "Update" ? "update" : modelAction} the
                      service?
                    </span>
                  </>
                )}

                {/* {modelRequestData.Action === "ServiceWarning" && (
                  <>
                    <div>
                      <span class="text-muted mb-0">
                        {modelRequestData.message}
                      </span>
                    </div>
                    <div style={{ textAlign: "left" }}>
                      <ul class="designed-list">
                        {modelRequestData.ServiceName?.map((item) => (
                          <li key={item}>
                            {" "}
                            <span> {item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                )} */}
                {modelRequestData.Action === "PracticeWarning" && (
                  <>
                    <div>
                      <span class="text-muted mb-0">
                        {modelRequestData.message}
                      </span>
                    </div>
                  </>
                )}
                {modelRequestData.Action === "PracticeWarning" && (
                  <>
                    <div style={{ fontWeight: "900" }}>
                      <span class="text-muted mb-0">
                        Still do you want to{" "}
                        {modelAction == "Update" ? "update" : modelAction} a
                        practice?
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
            <div class="d-flex gap-2 justify-content-center mt-4 mb-2">
              <button
                type="button"
                class="btn btn-md btn-light cancel-item-btn"
                data-bs-dismiss="modal"
                // onClick={() => modelRequestData.Action === "PaymentStatus" ? handleClose() : null}
              >
                {modelRequestData.Action === "Warning" ||
                modelRequestData.Action === "FeeInflationWarning" ||
                modelRequestData.Action === "DeleteServiceFeeInflationConfig" ||
                modelRequestData.Action === "DeleteServiceFeeInflationRule" ||
                modelRequestData.Action === "PracticeWarning" ||
                modelRequestData.Action === "Upload" ||
                modelRequestData.Action === "PaymentStatus" ? (
                  <span>No</span>
                ) : (
                  <span>Cancel</span>
                )}
              </button>
              {(modelRequestData.Action === "UnpaidUser" ||
                modelRequestData.Action === "ServiceWarning" ||
                modelRequestData.Action === "ServiceWarningEL" ||
                modelRequestData.Action === "FeeInflationWarning" ||
                modelRequestData.Action === "DeleteServiceFeeInflationConfig" ||
                modelRequestData.Action === "DeleteServiceFeeInflationRule" ||
                modelRequestData.Action === "Resend" ||
                modelRequestData.Action === "PaidUser" ||
                modelRequestData.Action === "Warning" ||
                modelRequestData.Action === "Status" ||
                modelRequestData.Action === "vatStatus" ||
                modelRequestData.Action === "EnableApiIntegration" ||
                modelRequestData.Action === "ReminderStatus" ||
                modelRequestData.Action === "PaymentStatus" ||
                modelRequestData.Action === "Delete" ||
                modelRequestData.Action === "DeleteContract" ||
                modelRequestData.Action === "Archive" ||
                modelRequestData.Action === "ArchiveLinkedELs" ||
                modelRequestData.Action === "Unarchive" ||
                modelRequestData.Action === "ArchiveContract" ||
                modelRequestData.Action === "UnarchiveContract" ||
                modelRequestData.Action === "Void" ||
                modelRequestData.Action == "PracticeWarning" ||
                modelRequestData.Action === "2FaStatusChange" ||
                modelRequestData.Action === "ELStatusChange" ||
                modelRequestData.Action === "ResetEmailConfigurationChange" ||
                modelRequestData.Action === "Upload" ||
                modelRequestData.Action === "ClearCcBcc" ||
                modelRequestData.Action === "Copy" ||
                modelRequestData.Action === "emailStatusChange" ||
                modelRequestData.Action === "Redirect" ||
                modelRequestData.Action === "Disconnect" ||
                modelRequestData.Action === "Add Contact" ||
                modelRequestData.Action === "Add Contact Mapping" ||
                modelRequestData.Action === "ResetPaymentGatewayChange") && (
                <button
                  onClick={() => {
                    UpdatedStatus();
                  }}
                  type="button"
                  class="btn btn-md btn-success create-item-btn"
                >
                  {(modelRequestData.Action === "Status" ||
                    modelRequestData.Action === "vatStatus" ||
                    modelRequestData.Action === "UnpaidUser" ||
                    modelRequestData.Action === "EnableApiIntegration" ||
                    modelRequestData.Action === "ReminderStatus" ||
                    modelRequestData.Action === "PaidUser" ||
                    modelRequestData.Action === "2FaStatusChange" ||
                    modelRequestData.Action === "ELStatusChange" ||
                    modelRequestData.Action === "Redirect" ||
                    modelRequestData.Action === "Add Contact" ||
                    modelRequestData.Action === "Add Contact Mapping" ||
                    modelRequestData.Action === "emailStatusChange") && (
                    <span>Yes, Change It!</span>
                  )}

                  {modelRequestData.Action === "Delete" && (
                    <span>Yes, Delete It!</span>
                  )}
                  {modelRequestData.Action === "DeleteContract" && (
                    <span>Yes, Delete It!</span>
                  )}
                  {modelRequestData.Action === "ArchiveContract" && (
                    <span>Yes, Archive It!</span>
                  )}
                  {modelRequestData.Action === "Archive" && (
                    <span>Yes, Archive It!</span>
                  )}
                  {modelRequestData.Action === "Unarchive" && (
                    <span>Yes, Unarchive It!</span>
                  )}
                  {modelRequestData.Action === "ArchiveLinkedELs" && (
                    <span>Yes, Archive It!</span>
                  )}
                  {modelRequestData.Action === "UnarchiveContract" && (
                    <span>Yes, Unarchive It!</span>
                  )}
                  {modelRequestData.Action === "Void" && (
                    <span>Yes, Void It!</span>
                  )}
                  {(modelRequestData.Action ===
                    "ResetEmailConfigurationChange" ||
                    modelRequestData.Action ===
                      "ResetPaymentGatewayChange") && (
                    <span>Yes, Reset It!</span>
                  )}
                  {modelRequestData.Action === "ClearCcBcc" && (
                    <span>Yes, Reset It!</span>
                  )}
                  {modelRequestData.Action === "Resend" && (
                    <span>Yes, Re-send It!</span>
                  )}
                  {modelRequestData.Action === "Warning" && <span>Yes</span>}
                  {modelRequestData.Action === "ServiceWarning" && (
                    <span>Yes</span>
                  )}
                  {modelRequestData.Action === "ServiceWarningEL" && (
                    <span>Yes</span>
                  )}
                  {modelRequestData.Action === "FeeInflationWarning" && (
                    <span>Yes</span>
                  )}
                  {modelRequestData.Action ===
                    "DeleteServiceFeeInflationConfig" && <span>Yes</span>}
                  {modelRequestData.Action ===
                    "DeleteServiceFeeInflationRule" && <span>Yes</span>}
                  {modelRequestData.Action === "Copy" && <span>Yes! Copy</span>}
                  {modelRequestData.Action === "Disconnect" && (
                    <span>Yes, Disconnect It!</span>
                  )}
                  {(modelRequestData.Action == "PracticeWarning" ||
                    modelRequestData.Action === "Upload" ||
                    modelRequestData.Action === "PaymentStatus") && (
                    <span>Yes</span>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModel;
