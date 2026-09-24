import React, { useContext, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { AuthContextProvider } from "../AuthContext/AuthContext";
import { useSelector } from "react-redux";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import "./SuccessPage.css";

const SuccessPage = () => {
  const { setActiveOrganizationSubscriptionPlan, setIsAddUpdatePurchaseDone } =
    useContext(AuthContextProvider);
  const common = useSelector((state) => state.Storage);
  const location = useLocation();

  useEffect(() => {
    localStorage.removeItem("OrganisationLocalList");
    // localStorage.removeItem("subscriptionPlan");
    localStorage.removeItem("subscriptionPlan");

    // Reset the activeOrganizationSubscriptionPlan state to null
    setActiveOrganizationSubscriptionPlan(null);
    setIsAddUpdatePurchaseDone(true);
  }, []);

  const isPlatformLevel =
    common.organisationKeyID === null || common.organisationKeyID === undefined;

  // Same query param PaymentCancelPage.jsx reads on the matching cancel
  // redirect - shown only when Stripe actually sends it back, never made up.
  const invoiceKeyID = new URLSearchParams(location.search).get("invoice-id");

  const firstName = common.name?.split(" ")[0] || common.name;
  const today = new Date().toLocaleDateString(undefined, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="sp-page">
      <div className="sp-card">
        <span className="sp-card__icon" aria-hidden="true">
          <span className="sp-card__icon-ring" />
          <CheckCircleOutlineIcon fontSize="inherit" />
        </span>

        <span className="sp-card__eyebrow">Payment confirmed</span>
        <h1 className="sp-card__title">
          {firstName ? `Thank you, ${firstName}!` : "Thank you!"}
        </h1>
        <p className="sp-card__message">
          Your payment was processed successfully and your subscription is
          now active.
        </p>

        <div className="sp-card__receipt">
          <span>
            <ReceiptLongOutlinedIcon fontSize="inherit" /> Confirmed on{" "}
            {today}
          </span>
          {invoiceKeyID && <span>Reference #{invoiceKeyID}</span>}
        </div>

        <div className="sp-card__divider" />

        <div className="sp-card__actions">
          {isPlatformLevel ? (
            <Link to="/organisations" className="sp-btn sp-btn--primary">
              Go to Organisation List
              <ArrowForwardIcon fontSize="inherit" />
            </Link>
          ) : (
            <Link to="/mySubscription" className="sp-btn sp-btn--primary">
              Go to My Subscription
              <ArrowForwardIcon fontSize="inherit" />
            </Link>
          )}
          <Link to="/" className="sp-btn sp-btn--outline">
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SuccessPage;
