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
import { FormControlLabel, Switch } from "@mui/material";

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
    <div>
      <div className="container-fluid">
        {/* <div class="main-content"> */}
        <div class="services page-background">
          <div class="">
            <div class="row">
              <div class="col-lg-12">
                <div class="card">
                  {/* end card header  */}
                  <div class="card-body mb-2">
                    <div id="customerList" style={{ marginTop: "3rem" }}>
                      <div class="bg-light border-bottom px-2">
                        {/* <div className="container"> */}
                        <div className="row">
                          <div className="col-md-6 col-6">
                            <div class="page-title-cls">Choose Plan</div>
                          </div>
                          <div class="col-md-6 col-6">
                            <div class="d-flex justify-content-sm-end add-new-btn">
                              <label style={{ marginRight: "1rem" }}>
                                Monthly
                              </label>
                              <FormControlLabel
                                control={
                                  <Switch
                                    checked={isYearly}
                                    onChange={handleToggle}
                                    color="primary"
                                  />
                                }
                              />
                              <label style={{ marginRight: "1rem" }}>
                                Yearly
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div class="container">
                      <div class="row">
                        <div class="col-lg-12">
                          <div class="card">
                            <div class="card-body">
                              <div id="customerList">
                                <div class="row g-4 mb-3"></div>
                                <div class="table-responsive table-card mt-4 mb-3 table-padding">
                                  <div class="modal-body">
                                    <>
                                      <div className="scrollbar" id="style-1">
                                        <div className="tab-content">
                                          <div className="container-fluid">
                                            <Row
                                              className="d-flex"
                                              style={{ background: "white" }}
                                            >
                                              {chooseApiData
                                                ?.filter(
                                                  (item) => !item.isFreePackage,
                                                )
                                                .map(
                                                  (PurchasePlanList, index) => {
                                                    return (
                                                      <>
                                                        <Col xl={4} md={6}>
                                                          <Card className="pricing-box d-flex shadow-lg p-3 mb-3 bg-white rounded">
                                                            <CardBody
                                                              style={{
                                                                width: "305px",
                                                                height: "450px",
                                                              }}
                                                              className="p-3"
                                                            >
                                                              <div className="media ">
                                                                <i className="ion ion-ios-airplane h2 align-self-center"></i>
                                                                <div className="media-body text-center ">
                                                                  <div className="text-center login-logo">
                                                                    <img
                                                                      width={
                                                                        130
                                                                      }
                                                                      height={
                                                                        25
                                                                      }
                                                                      src="data:image/png;base64,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"
                                                                      alt="login"
                                                                    />
                                                                  </div>

                                                                  <h6 className="text-dark">
                                                                    {
                                                                      PurchasePlanList?.packageName
                                                                    }
                                                                  </h6>

                                                                  {!isYearly ? (
                                                                    // <div>
                                                                    //   {(() => {
                                                                    //     const MonthlyPrice =
                                                                    //       Number(
                                                                    //         PurchasePlanList?.yearlyValuePlan
                                                                    //       ) / 12;
                                                                    //     return formatValue(
                                                                    //       MonthlyPrice
                                                                    //     );
                                                                    //   })()}
                                                                    //   / Month
                                                                    // </div>
                                                                    <div>
                                                                      {discountedMonthsMonthly?.find(
                                                                        (
                                                                          item,
                                                                        ) =>
                                                                          item.index ===
                                                                          index,
                                                                      ) && (
                                                                        <span
                                                                          style={{
                                                                            color:
                                                                              "#6c757d",
                                                                            textDecoration:
                                                                              "line-through",
                                                                            display:
                                                                              "block",
                                                                          }}
                                                                        >
                                                                          {formatValue(
                                                                            PurchasePlanList?.yearlyValuePlan /
                                                                              12,
                                                                          )}{" "}
                                                                          /Month
                                                                        </span>
                                                                      )}

                                                                      {/* {formatValue(
                                                            PurchasePlanList?.yearlyValuePlan /
                                                              12
                                                          )} */}
                                                                      {(() => {
                                                                        const discount =
                                                                          discountedMonthsMonthly?.find(
                                                                            (
                                                                              item,
                                                                            ) =>
                                                                              item.index ===
                                                                              index,
                                                                          );

                                                                        if (
                                                                          discount
                                                                        ) {
                                                                          if (
                                                                            discount.offerType ===
                                                                            1
                                                                          ) {
                                                                            return `${formatValue(
                                                                              PurchasePlanList?.yearlyValuePlan /
                                                                                12,
                                                                            )}/${
                                                                              discount.firstValue
                                                                            } months`;
                                                                          }

                                                                          if (
                                                                            discount.offerType ===
                                                                            2
                                                                          ) {
                                                                            return `${formatValue(
                                                                              PurchasePlanList?.yearlyValuePlan /
                                                                                12,
                                                                            )}/${
                                                                              discount.firstValue +
                                                                              1
                                                                            } months`;
                                                                          }

                                                                          if (
                                                                            discount.offerType ===
                                                                              3 ||
                                                                            discount.offerType ===
                                                                              4
                                                                          ) {
                                                                            return `${formatValue(
                                                                              discount.firstValue,
                                                                            )}/Month`;
                                                                          }
                                                                        }

                                                                        // If no discount or not matched types
                                                                        return `${formatValue(
                                                                          PurchasePlanList?.yearlyValuePlan /
                                                                            12,
                                                                        )}/Month`;
                                                                      })()}
                                                                      {/* {(() => {
                                                            const discount =
                                                              discountedMonthsMonthly?.find(
                                                                (item) =>
                                                                  item.index ===
                                                                  index
                                                              );

                                                            if (
                                                              discount?.offerType ===
                                                              1
                                                            ) {
                                                              return `/${discount.firstValue} months`;
                                                            }

                                                            if (
                                                              discount?.offerType ===
                                                              2
                                                            ) {
                                                              return `/${
                                                                discount.firstValue +
                                                                1
                                                              } months`;
                                                            }

                                                            return "/Months";
                                                          })()} */}

                                                                      {/* {discountedMonthsYearly
                                                            ? `/${discountedMonthsYearly}`
                                                            : `/Year`} */}
                                                                    </div>
                                                                  ) : (
                                                                    <div>
                                                                      {discountedMonthsYearly?.find(
                                                                        (
                                                                          item,
                                                                        ) =>
                                                                          item.index ===
                                                                          index,
                                                                      ) && (
                                                                        <span
                                                                          style={{
                                                                            color:
                                                                              "#6c757d",
                                                                            textDecoration:
                                                                              "line-through",
                                                                            display:
                                                                              "block",
                                                                          }}
                                                                        >
                                                                          {formatValue(
                                                                            PurchasePlanList?.yearlyValuePlan,
                                                                          )}{" "}
                                                                          /Year
                                                                        </span>
                                                                      )}

                                                                      {/* {formatValue(
                                                            PurchasePlanList?.yearlyValuePlan
                                                          )} */}

                                                                      {(() => {
                                                                        const discount =
                                                                          discountedMonthsYearly?.find(
                                                                            (
                                                                              item,
                                                                            ) =>
                                                                              item.index ===
                                                                              index,
                                                                          );

                                                                        if (
                                                                          discount
                                                                        ) {
                                                                          if (
                                                                            discount.offerType ===
                                                                            1
                                                                          ) {
                                                                            return `${formatValue(
                                                                              PurchasePlanList?.yearlyValuePlan,
                                                                            )}/${
                                                                              discount.firstValue
                                                                            } months`;
                                                                          }

                                                                          if (
                                                                            discount.offerType ===
                                                                            2
                                                                          ) {
                                                                            return `${formatValue(
                                                                              PurchasePlanList?.yearlyValuePlan,
                                                                            )}/${
                                                                              discount.firstValue +
                                                                              12
                                                                            } months`;
                                                                          }

                                                                          if (
                                                                            discount.offerType ===
                                                                              3 ||
                                                                            discount.offerType ===
                                                                              4
                                                                          ) {
                                                                            return `${formatValue(
                                                                              discount.firstValue,
                                                                            )}/Year`;
                                                                          }
                                                                        }

                                                                        // If no discount or not matched types
                                                                        return `${formatValue(
                                                                          PurchasePlanList?.yearlyValuePlan,
                                                                        )}/Year`;
                                                                      })()}

                                                                      {/* {(() => {
                                                            debugger
                                                            const discount =
                                                              discountedMonthsYearly?.find(
                                                                (item) =>
                                                                  item.index ===
                                                                  index
                                                              );
                                                            if (!discount)
                                                              return "/Year";

                                                            if (
                                                              discount?.offerType ===
                                                              1
                                                            ) {
                                                              return `/${discount.firstValue} months`;
                                                            }

                                                            if (
                                                              discount?.offerType ===
                                                              2
                                                            ) {
                                                              return `/${
                                                                discount.firstValue +
                                                                12
                                                              } months`;
                                                            }

                                                            if (!discount) {
                                                              const val =
                                                                formatValue(
                                                                  PurchasePlanList?.yearlyValuePlan
                                                                );
                                                              return val;
                                                            }

                                                            if (discount.offerType === 3 || discount.offerType === 4) {
                                                              return (
                                                                discount.firstValue
                                                              );
                                                            }

                                                            return "/Year";
                                                          })()} */}

                                                                      {/* {discountedMonthsYearly
                                                            ? `/${discountedMonthsYearly}`
                                                            : `/Year`} */}
                                                                    </div>
                                                                  )}
                                                                </div>
                                                              </div>
                                                              <div className="pricing-features mt-1 pt-2">
                                                                {/* Prepare Proposal */}
                                                                <div>
                                                                  {PurchasePlanList?.prepareQuote ==
                                                                  true ? (
                                                                    <span
                                                                      style={{
                                                                        color:
                                                                          "green",
                                                                      }}
                                                                      className="fa fa-check"
                                                                    ></span>
                                                                  ) : (
                                                                    <span
                                                                      style={{
                                                                        color:
                                                                          "red",
                                                                      }}
                                                                      className="fa fa-times"
                                                                    ></span>
                                                                  )}
                                                                  <span
                                                                    style={{
                                                                      marginLeft:
                                                                        "10px",
                                                                    }}
                                                                  >
                                                                    {" "}
                                                                    Prepare{" "}
                                                                    {
                                                                      proposalName
                                                                    }
                                                                  </span>
                                                                </div>
                                                                {/* Send Proposal */}
                                                                <div>
                                                                  {PurchasePlanList?.sendQuote ===
                                                                  true ? (
                                                                    <span
                                                                      style={{
                                                                        color:
                                                                          "green",
                                                                      }}
                                                                      className="fa fa-check"
                                                                    ></span>
                                                                  ) : (
                                                                    <span
                                                                      style={{
                                                                        color:
                                                                          "red",
                                                                      }}
                                                                      className="fa fa-times"
                                                                    ></span>
                                                                  )}
                                                                  <span
                                                                    style={{
                                                                      marginLeft:
                                                                        "10px",
                                                                    }}
                                                                  >
                                                                    {" "}
                                                                    Send{" "}
                                                                    {
                                                                      proposalName
                                                                    }
                                                                  </span>
                                                                </div>
                                                                {/*Send Proposals Per Month*/}
                                                                {PurchasePlanList?.quotesPerMonth >
                                                                  0 && (
                                                                  <div>
                                                                    <span
                                                                      style={{
                                                                        color:
                                                                          "green",
                                                                      }}
                                                                      className="fa fa-check"
                                                                    ></span>
                                                                    <span
                                                                      style={{
                                                                        marginLeft:
                                                                          "10px",
                                                                      }}
                                                                    >
                                                                      {" "}
                                                                      Perpare
                                                                      and Send{" "}
                                                                      {
                                                                        proposalName
                                                                      }
                                                                      {PurchasePlanList?.quotesPerMonth >
                                                                        0 && (
                                                                        <>
                                                                          :
                                                                          {
                                                                            PurchasePlanList?.quotesPerMonth
                                                                          }
                                                                          /Month
                                                                        </>
                                                                      )}
                                                                    </span>
                                                                  </div>
                                                                )}
                                                                {/* Prepare EL */}
                                                                <div>
                                                                  {PurchasePlanList?.prepareContract ===
                                                                  true ? (
                                                                    <span
                                                                      style={{
                                                                        color:
                                                                          "green",
                                                                      }}
                                                                      className="fa fa-check"
                                                                    ></span>
                                                                  ) : (
                                                                    <span
                                                                      style={{
                                                                        color:
                                                                          "red",
                                                                      }}
                                                                      className="fa fa-times"
                                                                    ></span>
                                                                  )}
                                                                  {"  "}
                                                                  <span
                                                                    style={{
                                                                      marginLeft:
                                                                        "10px",
                                                                    }}
                                                                  >
                                                                    {" "}
                                                                    Prepare{" "}
                                                                    {
                                                                      EngagementName
                                                                    }{" "}
                                                                    (EL)
                                                                  </span>
                                                                </div>
                                                                {/* Send and sign EL */}
                                                                <div className="d-flex align-items-start">
                                                                  <div>
                                                                    {PurchasePlanList?.eSignaturePerMonth >
                                                                    0 ? (
                                                                      <span
                                                                        style={{
                                                                          color:
                                                                            "green",
                                                                        }}
                                                                        className="fa fa-check"
                                                                      ></span>
                                                                    ) : (
                                                                      <span
                                                                        style={{
                                                                          color:
                                                                            "red",
                                                                        }}
                                                                        className="fa fa-times"
                                                                      ></span>
                                                                    )}
                                                                  </div>
                                                                  <span
                                                                    style={{
                                                                      marginLeft:
                                                                        "13px",
                                                                    }}
                                                                  >
                                                                    Send And
                                                                    E-Sign The
                                                                    EL
                                                                    {PurchasePlanList?.eSignaturePerMonth >
                                                                      0 && (
                                                                      <>
                                                                        :
                                                                        {
                                                                          PurchasePlanList?.eSignaturePerMonth
                                                                        }
                                                                        /Month
                                                                      </>
                                                                    )}
                                                                  </span>
                                                                </div>
                                                                {/* Personalized SMTP */}
                                                                <div>
                                                                  {PurchasePlanList?.isMailBox ===
                                                                    true ||
                                                                  PurchasePlanList?.isMailBox ===
                                                                    null ? (
                                                                    <span
                                                                      style={{
                                                                        color:
                                                                          "green",
                                                                      }}
                                                                      className="fa fa-check"
                                                                    ></span>
                                                                  ) : (
                                                                    <span
                                                                      style={{
                                                                        color:
                                                                          "red",
                                                                      }}
                                                                      className="fa fa-times"
                                                                    ></span>
                                                                  )}
                                                                  <span
                                                                    style={{
                                                                      marginLeft:
                                                                        "10px",
                                                                    }}
                                                                  >
                                                                    {" "}
                                                                    Personalized
                                                                    SMTP
                                                                  </span>
                                                                </div>
                                                                {/* Single API */}
                                                                <div>
                                                                  {PurchasePlanList?.apiIntegration ==
                                                                  true ? (
                                                                    <span
                                                                      style={{
                                                                        color:
                                                                          "green",
                                                                      }}
                                                                      className="fa fa-check"
                                                                    ></span>
                                                                  ) : (
                                                                    <span
                                                                      style={{
                                                                        color:
                                                                          "red",
                                                                      }}
                                                                      className="fa fa-times"
                                                                    ></span>
                                                                  )}
                                                                  <span
                                                                    style={{
                                                                      marginLeft:
                                                                        "10px",
                                                                    }}
                                                                  >
                                                                    {" "}
                                                                    API
                                                                    Integration
                                                                  </span>
                                                                </div>
                                                                {/* PDF TO CSV */}
                                                                <div>
                                                                  {PurchasePlanList?.enablePdfToCsv ===
                                                                    true ||
                                                                  PurchasePlanList?.enablePdfToCsv ===
                                                                    null ? (
                                                                    <span
                                                                      style={{
                                                                        color:
                                                                          "green",
                                                                      }}
                                                                      className="fa fa-check"
                                                                    ></span>
                                                                  ) : (
                                                                    <span
                                                                      style={{
                                                                        color:
                                                                          "red",
                                                                      }}
                                                                      className="fa fa-times"
                                                                    ></span>
                                                                  )}
                                                                  <span
                                                                    style={{
                                                                      marginLeft:
                                                                        "10px",
                                                                    }}
                                                                  >
                                                                    {" "}
                                                                    {PurchasePlanList?.noOfPages ===
                                                                    null
                                                                      ? "PDF To CSV"
                                                                      : "PDF To CSV: "}
                                                                    {PurchasePlanList?.noOfPages ===
                                                                    1
                                                                      ? `${PurchasePlanList?.noOfPages} Page`
                                                                      : PurchasePlanList?.noOfPages >
                                                                          1
                                                                        ? `${PurchasePlanList?.noOfPages} Pages`
                                                                        : ""}
                                                                  </span>
                                                                </div>

                                                                <div>
                                                                  {PurchasePlanList?.enableXERO ===
                                                                  true ? (
                                                                    <span
                                                                      style={{
                                                                        color:
                                                                          "green",
                                                                      }}
                                                                      className="fa fa-check"
                                                                    ></span>
                                                                  ) : (
                                                                    <span
                                                                      style={{
                                                                        color:
                                                                          "red",
                                                                      }}
                                                                      className="fa fa-times"
                                                                    ></span>
                                                                  )}
                                                                  <span
                                                                    style={{
                                                                      marginLeft:
                                                                        "10px",
                                                                    }}
                                                                  >
                                                                    {" "}
                                                                    Xero
                                                                    Subscription
                                                                  </span>
                                                                </div>

                                                                <div>
                                                                  {PurchasePlanList?.enableQBO ===
                                                                  true ? (
                                                                    <span
                                                                      style={{
                                                                        color:
                                                                          "green",
                                                                      }}
                                                                      className="fa fa-check"
                                                                    ></span>
                                                                  ) : (
                                                                    <span
                                                                      style={{
                                                                        color:
                                                                          "red",
                                                                      }}
                                                                      className="fa fa-times"
                                                                    ></span>
                                                                  )}
                                                                  <span
                                                                    style={{
                                                                      marginLeft:
                                                                        "10px",
                                                                    }}
                                                                  >
                                                                    {" "}
                                                                    Quickbooks
                                                                    Subscription
                                                                  </span>
                                                                </div>

                                                                {/* ai agent enable start  */}
                                                                <div>
                                                                  {PurchasePlanList?.enableAIAgent ===
                                                                  true ? (
                                                                    <span
                                                                      style={{
                                                                        color:
                                                                          "green",
                                                                      }}
                                                                      className="fa fa-check"
                                                                    ></span>
                                                                  ) : (
                                                                    <span
                                                                      style={{
                                                                        color:
                                                                          "red",
                                                                      }}
                                                                      className="fa fa-times"
                                                                    ></span>
                                                                  )}
                                                                  <span
                                                                    style={{
                                                                      marginLeft:
                                                                        "10px",
                                                                    }}
                                                                  >
                                                                    {" "}
                                                                    AI Agent
                                                                    Subscription
                                                                  </span>
                                                                </div>

                                                                {PurchasePlanList && (
                                                                  <div
                                                                    className="d-flex flex-column"
                                                                    style={{
                                                                      minHeight:
                                                                        "75px",
                                                                    }}
                                                                  >
                                                                    {(isYearly &&
                                                                      PurchasePlanList
                                                                        .yearlyOffer
                                                                        ?.length >
                                                                        0) ||
                                                                    (!isYearly &&
                                                                      PurchasePlanList
                                                                        .monthlyOffer
                                                                        ?.length >
                                                                        0) ? (
                                                                      <div className="w-100">
                                                                        <label></label>
                                                                        <Select
                                                                          placeholder="Select Offer"
                                                                          menuPosition="auto"
                                                                          className="phone-input-country-code selectDropDown Drop-down-width"
                                                                          onChange={(
                                                                            selectedOption,
                                                                          ) =>
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
                                                                              id: "", // or null, depending on how you handle unselected values
                                                                              label:
                                                                                "Select Offer",
                                                                              value:
                                                                                "",
                                                                            },
                                                                            ...(isYearly
                                                                              ? PurchasePlanList.yearlyOffer
                                                                              : PurchasePlanList.monthlyOffer
                                                                            )?.map(
                                                                              (
                                                                                offer,
                                                                              ) => ({
                                                                                id: offer.offerID,
                                                                                label:
                                                                                  offer.offerName,
                                                                                value:
                                                                                  offer.offerID,
                                                                              }),
                                                                            ),
                                                                          ]}
                                                                          value={
                                                                            selectedOfferID.find(
                                                                              (
                                                                                val,
                                                                              ) =>
                                                                                val.index ===
                                                                                index,
                                                                            ) ||
                                                                            ""
                                                                          }

                                                                          // value={
                                                                          //   selectedOfferID &&
                                                                          //   selectedOfferID.index ===
                                                                          //     index
                                                                          //     ? selectedOfferID
                                                                          //     : null
                                                                          // }
                                                                        />
                                                                      </div>
                                                                    ) : (
                                                                      <div className="flex-grow-1"></div>
                                                                    )}
                                                                  </div>
                                                                )}
                                                              </div>
                                                              {errorMessage && (
                                                                <p>
                                                                  {errorMessage}
                                                                </p>
                                                              )}

                                                              <div
                                                                className=" d-flex justify-content-center"
                                                                style={{
                                                                  marginBottom:
                                                                    "0.5rem",
                                                                }}
                                                              >
                                                                <button
                                                                  onClick={() =>
                                                                    handleButtonClick(
                                                                      index,
                                                                      PurchasePlanList.subscriptionPackageKeyID,
                                                                    )
                                                                  }
                                                                  className="btn btn-success create-item-btn add-new "
                                                                >
                                                                  <span>
                                                                    {" "}
                                                                    Purchase
                                                                  </span>
                                                                </button>
                                                              </div>
                                                              <span
                                                                className="text-muted"
                                                                style={{
                                                                  fontSize:
                                                                    "12px",
                                                                }}
                                                              >
                                                                Note: Selected
                                                                offer apply once
                                                                only. After
                                                                expiry, standard
                                                                rates apply.
                                                              </span>
                                                            </CardBody>
                                                          </Card>
                                                        </Col>
                                                      </>
                                                    );
                                                  },
                                                )}
                                            </Row>
                                          </div>
                                        </div>
                                      </div>
                                    </>
                                  </div>{" "}
                                </div>
                              </div>
                              {/* end card  */}
                            </div>
                          </div>
                          {/* end col */}
                        </div>
                        {/* end col  */}
                      </div>
                      {/* end modal  */}
                    </div>
                    {/* container-fluid  */}
                  </div>
                  {/* End Page-content */}
                </div>
              </div>
            </div>
          </div>
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
