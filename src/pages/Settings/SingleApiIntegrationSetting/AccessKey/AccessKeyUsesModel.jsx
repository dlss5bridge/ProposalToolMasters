/* global $ */
import React, { useContext, useState } from "react";
import { AuthContextProvider } from "../../../../AuthContext/AuthContext";
import "react-date-picker/dist/DatePicker.css";
import "react-calendar/dist/Calendar.css";
import { AccessKeyBaseUrl } from "../../../../Base-Url/Base_Url";
import "./AccessKeyStyle-redesign.css";

const ACCESS_KEY_USE_STEPS = [
  {
    text: "Call below API from your website.",
    label: "API",
    code: `${AccessKeyBaseUrl}/api/login/authenticate?accessKey={Token}`,
  },
  {
    text: "After calling the above API, you will receive the redirection URL in the response.",
    label: "Response",
    code: `{redirectUrl: redirectUrl}`,
  },
  {
    text: "Open the redirection URL in a new tab or popup.",
  },
  {
    text: "Finish.",
  },
];

const AccessKeyUsesModal = (props) => {
  const moduleName = "Access Key";
  const { getCrudButtonTextName } = useContext(AuthContextProvider);

  const [copiedIndex, setCopiedIndex] = useState(null);

  const handleCopySnippet = async (index, text) => {
    try {
      await navigator.clipboard.writeText(text);

      setCopiedIndex(index);

      setTimeout(() => {
        setCopiedIndex(null);
      }, 1500);
    } catch (error) {
      console.log("Failed to copy:", error);
    }
  };

  return (
    <div
      //   style={{ display: "none" }}
      class={props.class}
      id={props.id}
      tabIndex={props.tabIndex}
      aria-labelledby={props.aria_labelledby}
      aria-hidden={props.aria_hidden}
      data-bs-backdrop="static"
      data-bs-keyboard="false"
    >
      <div class="modal-dialog modal-md modal-dialog-centered">
        <div class="modal-content access-key-uses-modal">
          {/*Heading Start */}
          <div class="modal-header access-key-uses-modal__head">
            <div className="access-key-uses-modal__head-text">
              <span className="access-key-uses-modal__icon">
                <i className="bi bi-key-fill"></i>
              </span>
              <div>
                <h5 class="modal-title" id="exampleModalLabel">
                  {moduleName} Uses
                </h5>
                <p className="access-key-uses-modal__subtitle">
                  Follow these steps to authenticate using the access key
                </p>
              </div>
            </div>
            {/* Close Button Start */}
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
              id="close-modal"
            >
              {/* Close Button End */}
            </button>
          </div>
          {/*Heading End */}

          <div class="modal-body">
            <ol className="access-key-uses-modal__steps">
              {ACCESS_KEY_USE_STEPS.map((step, index) => (
                <li className="access-key-uses-modal__step" key={index}>
                  <span className="access-key-uses-modal__step-number">
                    {index + 1}
                  </span>
                  <div className="access-key-uses-modal__step-body">
                    <p className="access-key-uses-modal__step-text">
                      {step.text}
                    </p>
                    {step.code && (
                      <div className="access-key-uses-modal__snippet">
                        <span className="access-key-uses-modal__snippet-label">
                          {step.label}
                        </span>
                        <div className="access-key-uses-modal__snippet-row">
                          <code className="access-key-uses-modal__snippet-code">
                            {step.code}
                          </code>
                          <button
                            type="button"
                            className={`access-key-copy-btn ${
                              copiedIndex === index
                                ? "access-key-copy-btn--copied"
                                : ""
                            }`}
                            title={copiedIndex === index ? "Copied!" : "Copy"}
                            onClick={() => handleCopySnippet(index, step.code)}
                          >
                            <i
                              className={
                                copiedIndex === index
                                  ? "ri-check-line"
                                  : "ri-file-copy-line"
                              }
                            ></i>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {/*Modal body End */}
          {/*Footer body button Start */}
          <div class="modal-footer access-key-uses-modal__footer">
            <button
              type="button"
              class="btn create-item-btn access-key-uses-modal__ok-btn"
              data-bs-dismiss="modal"
            >
              {/* <i className="bi bi-check-lg"></i> */}
              Got It
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccessKeyUsesModal;
