/* global $ */
import React, { useContext, useEffect, useState } from "react";
import "../pages/configure/global-constants/PredefineGlobalConstant.css";
import { Row, Col, Card, CardBody } from "reactstrap";
import Select from "react-select";
import { useNavigate, useLocation } from "react-router-dom";
import SuccessModal from "./SuccessModal";
import Footer from "../components/Footer";
import {
  BuyPlan,
  ChoosePlanApi,
  CreateStripeCheckoutSession,
} from "../redux/Services/Setting/PaymentGatewayApi";
import { AuthContextProvider } from "../AuthContext/AuthContext";
import { useSelector } from "react-redux";
import { FormControlLabel } from "@mui/material";
import "./ChoosePlanForPurchase.css";
import Android12Switch from "./AndroidSwitch";

const ChoosePlanForPurchase = (props) => {
  const {
    setLoader,
    EngagementName,
    proposalName,
    formatValue,
    formatValueWithoutCurrencySymbol,
    setTopbar,
  } = useContext(AuthContextProvider);
  const [selectedOfferID, setSelectedOfferID] = useState([]);

  // const [selectedOfferID, setSelectedOfferID] = useState([
  //   {
  //     value: null,
  //     label: null,
  //     index: null,
  //     subscriptionPackageKeyID: null,
  //     packageName: null,
  //   },
  // ]);

  const [openSuccessModal, setOpenSuccessModal] = React.useState(false);
  const [discountedRateYearly, setDiscountedRateYearly] = useState(null);
  const [discountedRateMonthly, setDiscountedRateMonthly] = useState(null);
  const [discountedMonthsYearly, setDiscountedMonthsYearly] = useState([]);
  const [discountedMonthsMonthly, setDiscountedMonthsMonthly] = useState([]);
  const [yearlyBillingAmount, setYearlyBillingAmount] = useState([]);
  const [chooseApiData, setChooseApiData] = useState();
  const common = useSelector((state) => state.Storage);
  const [errorMessage, setErrorMessage] = useState("");
  const [isYearly, setIsYearly] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { organizationKeyId } = location.state || {}; // Access organizationKeyId from location state

  useEffect(() => {
    setTopbar("block");
    ChoosePlanApiModelData();
  }, []);

  const ChoosePlanApiModelData = async () => {
    try {
      const data = await ChoosePlanApi();
      if (data?.data?.statusCode === 200) {
        if (data?.data?.responseData?.data) {
          const ModelData = data?.data?.responseData?.data;

          setChooseApiData(ModelData);
        }
      } else {
        setErrorMessage(data?.data?.errorMessage);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const handleToggle = () => {
    setIsYearly(!isYearly); // Toggle between monthly and yearly
    // Additional logic if needed
    // setDiscountedMonthsMonthly(null);
    // setDiscountedMonthsYearly(null);
    setSelectedOfferID([]);
    setDiscountedMonthsMonthly([]);
    setDiscountedMonthsYearly([]);
  };
  const handleButtonClick = async (i, subscriptionPackageKeyID) => {
    debugger;
    // Pass the value of 'i' and 'searchKeywordValue' into the BuyPlanData function
    BuyPlanData(i, subscriptionPackageKeyID);
    // Your logic after BuyPlanData completes, if needed
  };

  const BuyPlanData = async (i, subscriptionPackageKeyIDForPurchase) => {
    debugger;
    setLoader(true);
    try {
      const subscriptionPackageData =
        subscriptionPackageKeyIDForPurchase ===
        selectedOfferID[0]?.subscriptionPackageKeyID
          ? selectedOfferID[0].subscriptionPackageKeyID
          : subscriptionPackageKeyIDForPurchase;
      const offerData =
        subscriptionPackageKeyIDForPurchase ===
        selectedOfferID[0]?.subscriptionPackageKeyID
          ? selectedOfferID[0].value
          : null;
      const data = await BuyPlan({
        organisationKeyID: organizationKeyId,
        userKeyID: common.userKeyID,
        subscriptionPackageKeyID: subscriptionPackageData,
        paymentFrequencyID: isYearly ? 1 : 4,
        offerID: offerData,
      });

      if (data && data?.data?.statusCode === 200) {
        setLoader(false);

        const invoiceKeyID = data.data.responseData.invoiceKeyID;
        const finalBillingAmount = data.data.responseData.finalBillingAmount;
        if (finalBillingAmount !== null) {
          CreateStripeCheckoutSessionRedirection(
            common.userKeyID,
            invoiceKeyID,
          );
        } else {
          navigate("/mySubscription");
        }

        // setOpenSuccessModal(true); // Open success modal upon successful purchase
        // Additional logic if needed
      } else {
        setLoader(false);
        setErrorMessage(data?.data?.errorMessage);
      }
    } catch (error) {
      setLoader(false);
      console.log(error);
    }
  };
  const CreateStripeCheckoutSessionRedirection = async (
    userKeyID,
    InvoiceKeyID,
  ) => {
    debugger;
    setLoader(true);

    try {
      const response = await CreateStripeCheckoutSession(
        userKeyID,
        InvoiceKeyID,
      );
      const data = response.data;

      if (data.statusCode === 200) {
        const sessionURL = data.responseData.sessionURL;
        setLoader(false);

        window.open(sessionURL, "_self");
      } else {
        console.error("Error fetching data from the API");
        setLoader(false);
      }
    } catch (error) {
      console.error("Error fetching data from the API", error);
      setLoader(false);
    }
  };
  const handleClose = () => {
    $("#" + props.id).modal("hide");
    setOpenSuccessModal(false);
    if (common.organisationKeyID === null) {
      navigate("/view-organisations-details", {
        state: { organizationKeyId: organizationKeyId },
      });
    } else {
      navigate("/mySubscription", { state: "ChoosePlane" });
    }
  };
  const handleSelectChange = (
    selectedOption,
    index,
    subscriptionPackageKeyIDNew,
    packageNameNew,
    yearlyOffer,
    monthlyOffer,
  ) => {
    debugger;
    // Extract the offerID and label from the selected option
    const selectedOfferID = selectedOption.value;
    const selectedName = selectedOption.label;
    const subscriptionPackageKeyID = subscriptionPackageKeyIDNew;

    // Store the selected offerID, label, and index in state
    // setSelectedOfferID({
    //   value: selectedOfferID,
    //   label: selectedName,
    //   index,
    //   subscriptionPackageKeyID: subscriptionPackageKeyID,
    //   packageName: packageNameNew,
    // });

    setSelectedOfferID((prev) => {
      const existing = prev.findIndex((obj) => obj.index === index);

      if (existing !== -1) {
        const updated = [...prev];
        updated[existing] = {
          value: selectedOfferID,
          label: selectedName,
          index,
          subscriptionPackageKeyID: subscriptionPackageKeyID,
          packageName: packageNameNew,
        };
        return updated;
      } else {
        return [
          ...prev,
          {
            value: selectedOfferID,
            label: selectedName,
            index,
            subscriptionPackageKeyID: subscriptionPackageKeyID,
            packageName: packageNameNew,
          },
        ];
      }
    });

    // setSelectedIndex(index);

    // const GetMonths = 1;
    // const MonthFree = 2;
    // const DiscountPrice = 3;
    // const DiscountPercentage = 4;

    let offerType;

    if (isYearly) {
      if (selectedOfferID === "GetMonths") {
        offerType = 1;
        const offer = yearlyOffer.find(
          (item) => item.offerID === selectedOfferID,
        );
        const [firstValue, secondValue] = offer.value.split(",").map(Number);

        setDiscountedMonthsYearly((prev) => {
          const existingIndex = prev.findIndex((obj) => obj.index === index);

          if (existingIndex !== -1) {
            const updated = [...prev];
            updated[existingIndex] = { index, firstValue, offerType };
            return updated;
          } else {
            return [...prev, { index, firstValue, offerType }];
          }
        });
      } else if (selectedOfferID === "MonthFree") {
        offerType = 2;
        const offer = yearlyOffer.find(
          (item) => item.offerID === selectedOfferID,
        );
        const firstValue = Number(offer.value); // Rename to match

        setDiscountedMonthsYearly((prev) => {
          const existingIndex = prev.findIndex((obj) => obj.index === index);

          if (existingIndex !== -1) {
            const updated = [...prev];
            updated[existingIndex] = { index, firstValue, offerType }; // Keep consistent
            return updated;
          } else {
            return [...prev, { index, firstValue, offerType }];
          }
        });
      } else if (selectedOfferID === "DiscountPrice") {
        offerType = 3;
        const offer = yearlyOffer.find(
          (item) => item.offerID === selectedOfferID,
        );
        const firstValue = Number(offer.finalBillingAmount); // Rename to match

        setDiscountedMonthsYearly((prev) => {
          const existingIndex = prev.findIndex((obj) => obj.index === index);

          if (existingIndex !== -1) {
            const updated = [...prev];
            updated[existingIndex] = { index, firstValue, offerType }; // Keep consistent
            return updated;
          } else {
            return [...prev, { index, firstValue, offerType }];
          }
        });
      } else if (selectedOfferID === "DiscountPercentage") {
        offerType = 4;
        const offer = yearlyOffer.find(
          (item) => item.offerID === selectedOfferID,
        );
        const firstValue = Number(offer.finalBillingAmount); // Rename to match

        setDiscountedMonthsYearly((prev) => {
          const existingIndex = prev.findIndex((obj) => obj.index === index);

          if (existingIndex !== -1) {
            const updated = [...prev];
            updated[existingIndex] = { index, firstValue, offerType }; // Keep consistent
            return updated;
          } else {
            return [...prev, { index, firstValue, offerType }];
          }
        });
      } else {
        // Remove the object with matching index if it exists
        setDiscountedMonthsYearly((prev) =>
          prev.filter((obj) => obj.index !== index),
        );
      }
    } else if (!isYearly) {
      if (selectedOfferID === "GetMonths") {
        offerType = 1;
        const offer = monthlyOffer.find(
          (item) => item.offerID === selectedOfferID,
        );
        const [firstValue, secondValue] = offer.value.split(",").map(Number);

        setDiscountedMonthsMonthly((prev) => {
          const existingIndex = prev?.findIndex((obj) => obj.index === index);

          if (existingIndex !== -1) {
            const updated = [...prev];
            updated[existingIndex] = { index, firstValue, offerType };
            return updated;
          } else {
            return [...prev, { index, firstValue, offerType }];
          }
        });
      } else if (selectedOfferID === "MonthFree") {
        offerType = 2;
        const offer = monthlyOffer.find(
          (item) => item.offerID === selectedOfferID,
        );
        const firstValue = Number(offer.value); // Rename to match

        setDiscountedMonthsMonthly((prev) => {
          const existingIndex = prev?.findIndex((obj) => obj.index === index);

          if (existingIndex !== -1) {
            const updated = [...prev];
            updated[existingIndex] = { index, firstValue, offerType }; // Keep consistent
            return updated;
          } else {
            return [...prev, { index, firstValue, offerType }];
          }
        });
      } else if (selectedOfferID === "DiscountPrice") {
        offerType = 3;
        const offer = monthlyOffer.find(
          (item) => item.offerID === selectedOfferID,
        );
        const firstValue = Number(offer.finalBillingAmount); // Rename to match

        setDiscountedMonthsMonthly((prev) => {
          const existingIndex = prev.findIndex((obj) => obj.index === index);

          if (existingIndex !== -1) {
            const updated = [...prev];
            updated[existingIndex] = { index, firstValue, offerType }; // Keep consistent
            return updated;
          } else {
            return [...prev, { index, firstValue, offerType }];
          }
        });
      } else if (selectedOfferID === "DiscountPercentage") {
        offerType = 4;
        const offer = monthlyOffer.find(
          (item) => item.offerID === selectedOfferID,
        );
        const firstValue = Number(offer.finalBillingAmount); // Rename to match

        setDiscountedMonthsMonthly((prev) => {
          const existingIndex = prev.findIndex((obj) => obj.index === index);

          if (existingIndex !== -1) {
            const updated = [...prev];
            updated[existingIndex] = { index, firstValue, offerType }; // Keep consistent
            return updated;
          } else {
            return [...prev, { index, firstValue, offerType }];
          }
        });
      } else {
        // Remove the object with matching index if it exists
        setDiscountedMonthsMonthly((prev) =>
          prev.filter((obj) => obj.index !== index),
        );
      }
    }
  };

  console.log("selectedOfferID", selectedOfferID);

  const HandleGetDiscountedRate = (actualRate, offer) => {
    // offer -> offerId
    // offers
    // 1. Get x % off    ----> DiscountPercentage
    // 2. Get at x amount   ----> DiscountPrice
    // 3. Get x months in the price of y months   ----> GetMonths
    // 4. Get x months for free   -----> MonthFree
  };

  // console.log(chooseApiData);

  return (
    <div className="choose-plan-page">
      <div className="choose-plan-shell">
        {/* =========================
            HEADER
            ========================= */}
        <div className="choose-plan-header">
          <div>
            <h1 className="choose-plan-title">Choose Plan</h1>
            <p className="choose-plan-subtitle">
              Select the subscription package that best fits your practice.
            </p>
          </div>

          <div className="choose-plan-billing-toggle">
            <span
              className={`choose-plan-billing-label ${
                !isYearly ? "is-active" : ""
              }`}
            >
              Monthly
            </span>

            <FormControlLabel
              className="choose-plan-switch-label"
              control={
                <Android12Switch
                  checked={isYearly}
                  onChange={handleToggle}
                  color="primary"
                />
              }
            />

            <span
              className={`choose-plan-billing-label ${
                isYearly ? "is-active" : ""
              }`}
            >
              Yearly
            </span>
          </div>
        </div>

        {/* =========================
            PLANS
            ========================= */}
        <div className="choose-plan-grid">
          {chooseApiData
            ?.filter((item) => !item.isFreePackage)
            .map((PurchasePlanList, index) => {
              const monthlyDiscount = discountedMonthsMonthly?.find(
                (item) => item.index === index,
              );

              const yearlyDiscount = discountedMonthsYearly?.find(
                (item) => item.index === index,
              );

              const selectedOffer =
                selectedOfferID.find((val) => val.index === index) || null;

              return (
                <article
                  className="choose-plan-card"
                  key={
                    PurchasePlanList.subscriptionPackageKeyID ||
                    PurchasePlanList.packageName ||
                    index
                  }
                >
                  <div className="choose-plan-card__header">
                    <div className="choose-plan-card__heading">
                      <span className="choose-plan-card__icon">
                        <i className="bi bi-stars"></i>
                      </span>

                      <div>
                        <h2>{PurchasePlanList?.packageName}</h2>
                        <span className="choose-plan-card__billing-badge">
                          {isYearly ? "Yearly billing" : "Monthly billing"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="choose-plan-card__body">
                    {/* =========================
                        PRICE
                        ========================= */}
                    <div className="choose-plan-price-area">
                      {!isYearly ? (
                        <>
                          {monthlyDiscount && (
                            <div className="choose-plan-original-price">
                              {formatValue(
                                PurchasePlanList?.yearlyValuePlan / 12,
                                1,
                              )}{" "}
                              / Month
                            </div>
                          )}

                          <div className="choose-plan-current-price">
                            {(() => {
                              const discount = monthlyDiscount;

                              if (discount) {
                                if (discount.offerType === 1) {
                                  return `${formatValue(
                                    PurchasePlanList?.yearlyValuePlan / 12,
                                    1,
                                  )}/${discount.firstValue} months`;
                                }

                                if (discount.offerType === 2) {
                                  return `${formatValue(
                                    PurchasePlanList?.yearlyValuePlan / 12,
                                    1,
                                  )}/${discount.firstValue + 1} months`;
                                }

                                if (
                                  discount.offerType === 3 ||
                                  discount.offerType === 4
                                ) {
                                  return `${formatValue(
                                    discount.firstValue,
                                    1,
                                  )}/Month`;
                                }
                              }

                              return `${formatValue(
                                PurchasePlanList?.yearlyValuePlan / 12,
                                1,
                              )}/Month`;
                            })()}
                          </div>
                        </>
                      ) : (
                        <>
                          {yearlyDiscount && (
                            <div className="choose-plan-original-price">
                              {formatValue(
                                PurchasePlanList?.yearlyValuePlan,
                                1,
                              )}{" "}
                              / Year
                            </div>
                          )}

                          <div className="choose-plan-current-price">
                            {(() => {
                              const discount = yearlyDiscount;

                              if (discount) {
                                if (discount.offerType === 1) {
                                  return `${formatValue(
                                    PurchasePlanList?.yearlyValuePlan,
                                    1,
                                  )}/${discount.firstValue} months`;
                                }

                                if (discount.offerType === 2) {
                                  return `${formatValue(
                                    PurchasePlanList?.yearlyValuePlan,
                                    1,
                                  )}/${discount.firstValue + 12} months`;
                                }

                                if (
                                  discount.offerType === 3 ||
                                  discount.offerType === 4
                                ) {
                                  return `${formatValue(
                                    discount.firstValue,
                                    1,
                                  )}/Year`;
                                }
                              }

                              return `${formatValue(
                                PurchasePlanList?.yearlyValuePlan,
                                1,
                              )}/Year`;
                            })()}
                          </div>
                        </>
                      )}
                    </div>

                    <div className="choose-plan-divider"></div>

                    {/* =========================
                        FEATURES
                        ========================= */}
                    <div className="choose-plan-features">
                      <div className="choose-plan-feature">
                        <span
                          className={`choose-plan-feature__icon ${
                            PurchasePlanList?.prepareQuote === true
                              ? "is-enabled"
                              : "is-disabled"
                          }`}
                        >
                          <i
                            className={`bi ${
                              PurchasePlanList?.prepareQuote === true
                                ? "bi-check-lg"
                                : "bi-x-lg"
                            }`}
                          ></i>
                        </span>

                        <span>Prepare {proposalName}</span>
                      </div>

                      <div className="choose-plan-feature">
                        <span
                          className={`choose-plan-feature__icon ${
                            PurchasePlanList?.sendQuote === true
                              ? "is-enabled"
                              : "is-disabled"
                          }`}
                        >
                          <i
                            className={`bi ${
                              PurchasePlanList?.sendQuote === true
                                ? "bi-check-lg"
                                : "bi-x-lg"
                            }`}
                          ></i>
                        </span>

                        <span>Send {proposalName}</span>
                      </div>

                      {PurchasePlanList?.quotesPerMonth > 0 && (
                        <div className="choose-plan-feature">
                          <span className="choose-plan-feature__icon is-enabled">
                            <i className="bi bi-check-lg"></i>
                          </span>

                          <span>
                            Perpare and Send {proposalName}:{" "}
                            {PurchasePlanList?.quotesPerMonth}/Month
                          </span>
                        </div>
                      )}

                      <div className="choose-plan-feature">
                        <span
                          className={`choose-plan-feature__icon ${
                            PurchasePlanList?.prepareContract === true
                              ? "is-enabled"
                              : "is-disabled"
                          }`}
                        >
                          <i
                            className={`bi ${
                              PurchasePlanList?.prepareContract === true
                                ? "bi-check-lg"
                                : "bi-x-lg"
                            }`}
                          ></i>
                        </span>

                        <span>Prepare {EngagementName} (EL)</span>
                      </div>

                      <div className="choose-plan-feature">
                        <span
                          className={`choose-plan-feature__icon ${
                            PurchasePlanList?.eSignaturePerMonth > 0
                              ? "is-enabled"
                              : "is-disabled"
                          }`}
                        >
                          <i
                            className={`bi ${
                              PurchasePlanList?.eSignaturePerMonth > 0
                                ? "bi-check-lg"
                                : "bi-x-lg"
                            }`}
                          ></i>
                        </span>

                        <span>
                          Send And E-Sign The EL
                          {PurchasePlanList?.eSignaturePerMonth > 0
                            ? `: ${PurchasePlanList?.eSignaturePerMonth}/Month`
                            : ""}
                        </span>
                      </div>

                      <div className="choose-plan-feature">
                        <span
                          className={`choose-plan-feature__icon ${
                            PurchasePlanList?.isMailBox === true ||
                            PurchasePlanList?.isMailBox === null
                              ? "is-enabled"
                              : "is-disabled"
                          }`}
                        >
                          <i
                            className={`bi ${
                              PurchasePlanList?.isMailBox === true ||
                              PurchasePlanList?.isMailBox === null
                                ? "bi-check-lg"
                                : "bi-x-lg"
                            }`}
                          ></i>
                        </span>

                        <span>Personalized SMTP</span>
                      </div>

                      <div className="choose-plan-feature">
                        <span
                          className={`choose-plan-feature__icon ${
                            PurchasePlanList?.apiIntegration === true
                              ? "is-enabled"
                              : "is-disabled"
                          }`}
                        >
                          <i
                            className={`bi ${
                              PurchasePlanList?.apiIntegration === true
                                ? "bi-check-lg"
                                : "bi-x-lg"
                            }`}
                          ></i>
                        </span>

                        <span>API Integration</span>
                      </div>

                      <div className="choose-plan-feature">
                        <span
                          className={`choose-plan-feature__icon ${
                            PurchasePlanList?.enablePdfToCsv === true ||
                            PurchasePlanList?.enablePdfToCsv === null
                              ? "is-enabled"
                              : "is-disabled"
                          }`}
                        >
                          <i
                            className={`bi ${
                              PurchasePlanList?.enablePdfToCsv === true ||
                              PurchasePlanList?.enablePdfToCsv === null
                                ? "bi-check-lg"
                                : "bi-x-lg"
                            }`}
                          ></i>
                        </span>

                        <span>
                          {PurchasePlanList?.noOfPages === null
                            ? "PDF To CSV"
                            : "PDF To CSV: "}
                          {PurchasePlanList?.noOfPages === 1
                            ? `${PurchasePlanList?.noOfPages} Page`
                            : PurchasePlanList?.noOfPages > 1
                              ? `${PurchasePlanList?.noOfPages} Pages`
                              : ""}
                        </span>
                      </div>

                      <div className="choose-plan-feature">
                        <span
                          className={`choose-plan-feature__icon ${
                            PurchasePlanList?.enableXERO === true
                              ? "is-enabled"
                              : "is-disabled"
                          }`}
                        >
                          <i
                            className={`bi ${
                              PurchasePlanList?.enableXERO === true
                                ? "bi-check-lg"
                                : "bi-x-lg"
                            }`}
                          ></i>
                        </span>

                        <span>Xero Subscription</span>
                      </div>

                      <div className="choose-plan-feature">
                        <span
                          className={`choose-plan-feature__icon ${
                            PurchasePlanList?.enableQBO === true
                              ? "is-enabled"
                              : "is-disabled"
                          }`}
                        >
                          <i
                            className={`bi ${
                              PurchasePlanList?.enableQBO === true
                                ? "bi-check-lg"
                                : "bi-x-lg"
                            }`}
                          ></i>
                        </span>

                        <span>Quickbooks Subscription</span>
                      </div>

                      <div className="choose-plan-feature">
                        <span
                          className={`choose-plan-feature__icon ${
                            PurchasePlanList?.enableAIAgent === true
                              ? "is-enabled"
                              : "is-disabled"
                          }`}
                        >
                          <i
                            className={`bi ${
                              PurchasePlanList?.enableAIAgent === true
                                ? "bi-check-lg"
                                : "bi-x-lg"
                            }`}
                          ></i>
                        </span>

                        <span>AI Agent Subscription</span>
                      </div>
                    </div>

                    {/* =========================
                        OFFER
                        ========================= */}
                    <div className="choose-plan-offer-area">
                      {(isYearly && PurchasePlanList.yearlyOffer?.length > 0) ||
                      (!isYearly &&
                        PurchasePlanList.monthlyOffer?.length > 0) ? (
                        <>
                          <label className="choose-plan-offer-label">
                            Available Offer
                          </label>

                          <Select
                            placeholder="Select Offer"
                            menuPosition="auto"
                            className="choose-plan-offer-select"
                            classNamePrefix="choose-plan-select"
                            onChange={(selectedOption) =>
                              handleSelectChange(
                                selectedOption,
                                index,
                                PurchasePlanList.subscriptionPackageKeyID,
                                PurchasePlanList.packageName,
                                PurchasePlanList?.yearlyOffer,
                                PurchasePlanList?.monthlyOffer,
                              )
                            }
                            options={[
                              {
                                id: "",
                                label: "Select Offer",
                                value: "",
                              },
                              ...(isYearly
                                ? PurchasePlanList.yearlyOffer
                                : PurchasePlanList.monthlyOffer
                              )?.map((offer) => ({
                                id: offer.offerID,
                                label: offer.offerName,
                                value: offer.offerID,
                              })),
                            ]}
                            value={selectedOffer || ""}
                          />
                        </>
                      ) : (
                        <div className="choose-plan-no-offer">
                          No offers available for this billing period.
                        </div>
                      )}
                    </div>

                    {errorMessage && (
                      <div className="choose-plan-error">{errorMessage}</div>
                    )}
                  </div>

                  <div className="choose-plan-card__footer">
                    <button
                      onClick={() =>
                        handleButtonClick(
                          index,
                          PurchasePlanList.subscriptionPackageKeyID,
                        )
                      }
                      className="btn choose-plan-purchase-btn"
                    >
                      Purchase
                    </button>

                    <p className="choose-plan-note">
                      Note: Selected offer apply once only. After expiry,
                      standard rates apply.
                    </p>
                  </div>
                </article>
              );
            })}
        </div>
      </div>

      <SuccessModal
        handleClose={handleClose}
        setOpenSuccessModal={setOpenSuccessModal}
        openSuccessModal={openSuccessModal}
        modelAction={"Purchase"}
        message={selectedOfferID?.packageName}
      />

      <Footer />
    </div>
  );
};
export default ChoosePlanForPurchase;
