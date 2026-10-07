/* global $ */
import React, { useEffect, useState, useRef, useContext } from "react";
import { Check, X, CreditCard } from "lucide-react";
import { AuthContextProvider } from "../AuthContext/AuthContext";
import "./SubscriptionView.css";

// Same status → colour mapping as before, as a pill tone
const statusTone = (status) =>
  status === "Active"
    ? "active"
    : status === "Expired"
      ? "expired"
      : status === "Pending"
        ? "pending"
        : status === "InActive"
          ? "inactive"
          : "neutral";

const Feature = ({ enabled, children }) => (
  <li className={`sv-feature ${enabled ? "is-on" : "is-off"}`}>
    <span className="sv-feature__icon">
      {enabled ? (
        <Check size={13} strokeWidth={3} />
      ) : (
        <X size={13} strokeWidth={3} />
      )}
    </span>
    <span className="sv-feature__text">{children}</span>
  </li>
);

const Field = ({ label, children }) => (
  <div className="sv-field">
    <span className="sv-field__label">{label}</span>
    <span className="sv-field__value">{children}</span>
  </div>
);

function SubscriptionView(props) {
  const {
    EngagementName,
    proposalName,
    setLoader,
    formatValue,
    formatValueWithoutCurrencySymbol,
  } = useContext(AuthContextProvider);
  console.log(props.subscriptionPackageObj);
  // console.log(props.subscriptionPackageObj, "props.subscriptionPackageObj")
  const pkg = props.subscriptionPackageObj;

  const remainingProposal =
    pkg.remainingQuotesPerMonth < 0 ? 0 : pkg.remainingQuotesPerMonth;
  const remainingESignatures =
    pkg.remainingESignatures < 0 ? 0 : pkg.remainingESignatures;

  return (
    <div>
      <div
        class={props.class}
        id={props.id}
        tabIndex={props.tabIndex}
        aria-labelledby={props.aria_labelledby}
        aria-hidden={props.aria_hidden}
        data-bs-backdrop="static"
        data-bs-keyboard="false"
      >
        <div className="modal-dialog model-large modal-dialog-centered sv-dialog">
          <div class="modal-content sv-modal">
            {/* Header */}
            <div class="modal-header sv-head">
              <span className="sv-head__icon">
                <CreditCard size={20} strokeWidth={1.9} />
              </span>
              <div className="sv-head__text">
                <h5 class="modal-title sv-head__title" id="exampleModalLabel">
                  {props.title || "Subscription Overview"}
                </h5>
                <p className="sv-head__sub">{pkg.packageName}</p>
              </div>
              <button
                type="button"
                class="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
                id="close-modal"
              ></button>
            </div>

            <div className="sv-body">
              {/* Subscription details */}
              <section className="sv-card">
                <h6 className="sv-card__title">Subscription Details</h6>

                <div className="sv-fields">
                  <Field label="Package Name">{pkg.packageName}</Field>
                  <Field label="Payment Frequency">
                    {pkg.paymentFrequencyID === 1
                      ? "Yearly"
                      : pkg.paymentFrequencyID === 4
                        ? "Monthly"
                        : ""}
                  </Field>
                  <Field label="Days">
                    {pkg.paymentFrequencyID === 1
                      ? "365 Days"
                      : pkg.paymentFrequencyID === 4
                        ? "30 Days"
                        : "-"}
                  </Field>
                  <Field label="Payment Status">{pkg.paymentStatus}</Field>
                  <Field label="Subscription Date">
                    {pkg.subscriptionStartDate === null
                      ? "-"
                      : pkg.subscriptionStartDate}
                  </Field>
                  <Field label="Next Renewal Date">
                    {pkg.renewDate === null ? "-" : pkg.renewDate}
                  </Field>
                  <Field label="Subscription Status">
                    <span
                      className={`sv-status sv-status--${statusTone(
                        pkg.subscriptionStatus,
                      )}`}
                    >
                      {pkg.subscriptionStatus}
                    </span>
                  </Field>
                </div>

                <div className="sv-usage">
                  <div className="sv-usage__tile">
                    <span className="sv-usage__label">Remaining Proposal</span>
                    <span className="sv-usage__value">
                      {remainingProposal ?? "-"}
                    </span>
                  </div>
                  <div className="sv-usage__tile">
                    <span className="sv-usage__label">
                      Remaining E-Signatures
                    </span>
                    <span className="sv-usage__value">
                      {remainingESignatures ?? "-"}
                    </span>
                  </div>
                </div>
              </section>

              {/* Package details */}
              <section className="sv-card">
                <h6 className="sv-card__title">Package Details</h6>

                <div className="sv-price">
                  <span className="sv-price__value">
                    {formatValue(pkg?.yearlyValuePlan / 12)}
                  </span>
                  <span className="sv-price__unit">/Month</span>
                </div>

                <ul className="sv-features">
                  <Feature enabled={pkg?.apiIntegration == true}>
                    API Integration
                  </Feature>
                  <Feature enabled={pkg?.prepareQuote == true}>
                    Prepare {proposalName}
                  </Feature>
                  <Feature enabled={pkg?.prepareContract === true}>
                    Prepare {EngagementName}
                  </Feature>
                  <Feature enabled={pkg?.sendQuote === true}>
                    Send {proposalName}
                  </Feature>
                  {pkg?.sendQuote === true && pkg?.quotesPerMonth > 0 && (
                    <Feature enabled>
                      Prepare and Send {proposalName}:{" "}
                      {formatValueWithoutCurrencySymbol(pkg?.quotesPerMonth)}
                      /Month
                    </Feature>
                  )}
                  <Feature enabled={pkg?.signContract === true}>
                    Send And Digitally Sign The {EngagementName}:{" "}
                    {formatValueWithoutCurrencySymbol(
                      pkg?.eSignaturePerMonth,
                    )}
                    /Month
                  </Feature>
                  <Feature
                    enabled={!(pkg?.isMailBox === null || !pkg?.isMailBox)}
                  >
                    Personalized Outgoing Mailbox
                  </Feature>
                </ul>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SubscriptionView;
