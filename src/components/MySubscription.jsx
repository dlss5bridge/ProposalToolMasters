import React, { useContext, useEffect, useState } from "react";
import { AuthContextProvider } from "../AuthContext/AuthContext";
import Footer from "./Footer";
import { Tooltip } from "@mui/material";
import { GetOrganisationPlanList } from "../redux/Services/Setting/Organisation";
import { useSelector } from "react-redux";
import PaginationComponent from "./PaginationModel";
import { Row, Col, Card, CardBody } from "reactstrap";
import { useLocation, useNavigate } from "react-router-dom";
import CommonButtonComponent from "./CommonButtonComponent";
import NoResultFoundModel from "../components/NoResultFoundModel";
import SubscriptionView from "./SubscriptionView";
import {
  ChoosePlanApi,
  CreateStripeCheckoutSession,
} from "../redux/Services/Setting/PaymentGatewayApi";
import { GetUserSubscriptionPackageModel } from "../redux/Services/Subscription/UserListApi";
const MySubscription = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [errorMessage, setErrorMessage] = useState("");
  const [subScriptionPlanList, setSubScriptionPlanList] = useState([]);
  const [subScriptionActiveList, setSubScriptionActiveList] = useState({});
  const [chooseApiData, setChooseApiData] = useState([]);
  const location = useLocation();
  const [subscriptionPackageObj, setSubscriptionPackageObj] = useState({
    ospKeyID: null,
    remainingESignatures: null,
    remainingQuotesPerMonth: null,
    apiIntegration: null,
    subscriptionPackageKeyID: null,
    packageName: "",
    prepareQuote: false,
    sendQuote: false,
    quotesPerMonth: null,
    prepareContract: false,
    sendContract: false,
    signContract: false,
    eSignaturePerMonth: "",
    yearlyValuePlan: "",
    discountPercentage: "",
    discountPrice: "",
    subscriptionStartDate: "",
    monthFree: "",
    getMonths: "",
    inPriceOfMonth: "",
    isMailBox: false,
    paymentFrequencyID: null,
    renewDate: "",
    paymentStatus: "",
    subscriptionStatus: "",
    subscriptionPackageObj: "",
    hostedInvoiceUrl: "",
    invoiceKeyID: "",
  });
  const {
    setTopbar,
    setLoader,
    EngagementName,
    proposalName,
    maxCountToRecallApi,
    totalPage,
    isMobile,
    setListCount,
    listCount,
    desktopRecords,
    isMobileRecords,
    getCrudButtonTextName,
    getCrudButtonToolTipName,
    formatValue,
    formatValueWithoutCurrencySymbol,
  } = useContext(AuthContextProvider);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [totalRecords, setTotalRecords] = useState(-1);
  const pageSize = isMobile ? isMobileRecords : desktopRecords;
  const common = useSelector((state) => state.Storage);
  const navigate = useNavigate();
  const moduleName = "Plan";
  useEffect(() => {
    setTopbar("block");
    GetOrganisationPlanListData(1, null);
  }, []);

  const GetOrganisationPlanListData = async (i, searchKeywordValue) => {
    setLoader(true);
    const pageNoList = i - 1;
    let getOrganisationListCallCount = 0;
    try {
      const data = await GetOrganisationPlanList({
        pageSize: pageSize,
        pageNo: pageNoList,
        userKeyID: common.userKeyID,
        organisationKeyID: common.organisationKeyID,
        searchKeyword:
          searchKeywordValue === undefined ? searchKeyword : searchKeywordValue,
      });

      if (data) {
        if (data?.data?.statusCode === 200) {
          setLoader(false);
          if (data?.data?.responseData) {
            const SubScriptionListData = data?.data?.responseData;
            const totalCount = data.data.totalCount;
            if (pageNoList > 0 && SubScriptionListData.length === 0) {
              let newPaneNo = Number(pageNoList);
              if (newPaneNo > 1) {
                newPaneNo = newPaneNo - 1;
              }
              GetOrganisationPlanListData(newPaneNo, searchKeywordValue);
              setCurrentPage(pageNoList);
              return;
            }
            const PlanList =
              SubScriptionListData?.planList === null
                ? [
                    {
                      organisationKeyID: null,
                      ospKeyID: null,
                      organisationName: null,
                      email: null,
                      mobileNumber: null,
                      packageName: null,
                      packagePrice: null,
                      subscriptionStartDate: null,
                      nextRenewalDate: null,
                      subscriptionStatus: null,
                      invoiceKeyID: null,
                      finalBillingAmount: null,
                      paymentStatus: null,
                      hostedInvoiceUrl: null,
                      invoicePdf: null,
                    },
                  ]
                : SubScriptionListData?.planList;
            const ActivePlanList =
              SubScriptionListData?.activePlan === null
                ? {
                    ospKeyID: null,
                    isPlanActive: null,
                    subscriptionPackageKeyID: null,
                    packageName: null,
                    paymentFrequencyID: null,
                    prepareQuote: null,
                    sendQuote: null,
                    prepareContract: null,
                    sendContract: null,
                    signContract: null,
                    eSignaturePerMonth: null,
                    remainingESignatures: null,
                    yearlyValuePlan: null,
                    offerID: null,
                    discountPercentage: null,
                    discountPrice: null,
                    monthFree: null,
                    getMonths: null,
                    inPriceOfMonth: null,
                    isMailBox: null,
                    subscriptionStartDate: null,
                    subscriptionEndDate: null,
                    subscriptionCancelledDate: null,
                    renewDate: null,
                    invoiceKeyID: null,
                    finalBillingAmount: null,
                    paymentStatus: null,
                    subscriptionStatus: null,
                    hostedInvoiceUrl: null,
                    invoicePdf: null,
                    organisationKeyID: null,
                    status: null,
                    statusName: null,
                    userKeyID: null,
                    createdBy: null,
                    createdOn: null,
                    lastUpdatedBy: null,
                    lastUpdatedOn: null,
                    notifySAChanges: null,
                    acceptSAChanges: null,
                    keyID: null,
                    createdByID: null,
                    organisationID: null,
                  }
                : SubScriptionListData?.activePlan;
            setListCount(totalCount);
            // Extract planList and store in subscriptionList state
            setSubScriptionPlanList(PlanList);
            setSubScriptionActiveList(ActivePlanList);

            setTotalRecords(SubScriptionListData.length);
          }
        } else {
          if (getOrganisationListCallCount < maxCountToRecallApi) {
            getOrganisationListCallCount += 1;
            setTimeout(function () {
              GetOrganisationPlanListData(i, searchKeywordValue);
            }, 2000);
          } else {
            setLoader(false);
          }
          setErrorMessage(data?.data?.errorMessage);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

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

  const handlePageChange = async (pageNumber) => {
    setCurrentPage(pageNumber);
    await GetOrganisationPlanListData(pageNumber); // Call your function with the selected page number
  };
  const handleRedirectSubscription = async () => {
    await ChoosePlanApiModelData();
    navigate("/ChoosePlan", {
      state: { organizationKeyId: common.organisationKeyID },
    });
  };

  const handleOpenSubscriptionModel = (subscriptionObj) => {
    GetSubscriptionPackageModelData(subscriptionObj.ospKeyID);
  };

  const GetSubscriptionPackageModelData = async (id) => {
    if (!id) {
      return;
    }
    //..............Subscription package Edit Data Api...................
    try {
      const data = await GetUserSubscriptionPackageModel(id);
      if (data?.data?.statusCode === 200) {
        if (data?.data?.responseData?.data) {
          const ModelData = data?.data?.responseData?.data;
          setSubscriptionPackageObj({
            ...subscriptionPackageObj,
            ospKeyID: ModelData.ospKeyID,
            remainingESignatures: ModelData.remainingESignatures,
            remainingQuotesPerMonth: ModelData.remainingQuotesPerMonth,
            apiIntegration: ModelData.apiIntegration,
            subscriptionPackageKeyID: ModelData.subscriptionPackageKeyID,
            packageName: ModelData.packageName,
            prepareQuote: ModelData.prepareQuote,
            sendQuote: ModelData.sendQuote,
            quotesPerMonth: ModelData.quotesPerMonth,
            prepareContract: ModelData.prepareContract,
            sendContract: ModelData.sendContract,
            signContract: ModelData.signContract,
            eSignaturePerMonth: ModelData.eSignaturePerMonth,
            yearlyValuePlan: ModelData.yearlyValuePlan,
            discountPercentage: ModelData.discountPercentage,
            discountPrice: ModelData.discountPrice,
            monthFree: ModelData.monthFree,
            getMonths: ModelData.getMonths,
            inPriceOfMonth: ModelData.inPriceOfMonth,
            isMailBox: ModelData.isMailBox,
            paymentFrequencyID: ModelData.paymentFrequencyID,
            subscriptionStartDate: ModelData.subscriptionStartDate,
            renewDate: ModelData.renewDate,
            paymentStatus: ModelData.paymentStatus,
            subscriptionStatus: ModelData.subscriptionStatus,
            subscriptionPackageObj: ModelData.subscriptionPackageObj,
            hostedInvoiceUrl: ModelData.hostedInvoiceUrl,
            invoiceKeyID: ModelData.invoiceKeyID,
          });
        }
      } else {
        setErrorMessage(data?.data?.errorMessage);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const RedirectStripeCheckout = (subscription) => {
    CreateStripeCheckoutSessionRedirection(
      common.userKeyID,
      subscription.invoiceKeyID,
    );
  };
  const CreateStripeCheckoutSessionRedirection = async (
    userKeyID,
    InvoiceKeyID,
  ) => {
    setLoader(true);
    try {
      const response = await CreateStripeCheckoutSession(
        userKeyID,
        InvoiceKeyID,
      );
      const data = response.data;

      if (data.statusCode === 200) {
        setLoader(false);
        const sessionURL = data.responseData.sessionURL;

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
  // console.log(subScriptionActiveList, "subScriptionActiveList");
  return (
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
                        <div className="col-md-6 p-0 ">
                          <div class="page-title-cls"> My Subscription </div>
                        </div>
                        <div class="col-auto ms-auto">
                          <div class="d-flex justify-content-sm-end add-new-btn">
                            {
                              <CommonButtonComponent
                                title={getCrudButtonToolTipName(
                                  "Upgrade",
                                  moduleName,
                                )}
                                name={getCrudButtonTextName(
                                  "Upgrade",
                                  moduleName,
                                )}
                                AddBtn={() => handleRedirectSubscription()}
                              />
                            }{" "}
                          </div>
                        </div>
                      </div>
                      {/* </div> */}
                    </div>
                    <div className="">
                      <div className="row">
                        <div className="col-lg-12">
                          <div className="card">
                            <div className="card-body">
                              <div id="customerList">
                                <div class="row g-4 mb-3"></div>
                                <div class="table-responsive table-card mt-2 mb-3 table-padding">
                                  <div className="">
                                    <div
                                      className="row"
                                      style={{ marginLeft: "0px" }}
                                    >
                                      <div className="col-lg-12">
                                        <div
                                          className=" mb-3"
                                          style={{
                                            // border: "-1px solid #CED4DA",
                                            // borderRadius: "1px",
                                            // boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                                            backgroundColor: "#fff",
                                            position: "sticky",
                                            top: "0",
                                          }}
                                        >
                                          {/* <div> */}
                                          <div className="row">
                                            {/* Left side for subscription details */}

                                            <div className="col-md-6 mt-2">
                                              <CardBody
                                                style={{
                                                  padding: "10px",
                                                  maxHeight: "65vh",
                                                  height: "auto",
                                                }}
                                              >
                                                <div className="media ">
                                                  <i className="ion ion-ios-airplane h1 align-self-center"></i>
                                                  <div className="media-body text-center ">
                                                    <div className="text-center login-logo">
                                                      <div className="d-flex justify-content-between">
                                                        <h5 className="card-title">
                                                          Subscription Details
                                                        </h5>
                                                        <p className="mt-3">
                                                          {subScriptionActiveList.paymentStatus ===
                                                            "Unpaid" && (
                                                            <Tooltip
                                                              title={`Pay Now`}
                                                            >
                                                              <button
                                                                className="btn btn-md btn-success create-item-btn"
                                                                onClick={() =>
                                                                  RedirectStripeCheckout(
                                                                    subScriptionActiveList,
                                                                  )
                                                                }
                                                              >
                                                                <span>
                                                                  Pay Now
                                                                </span>
                                                              </button>
                                                            </Tooltip>
                                                          )}
                                                          {subScriptionActiveList.paymentStatus ===
                                                            "Paid" && (
                                                            <Tooltip
                                                              title={`Download`}
                                                            >
                                                              <a
                                                                style={{
                                                                  width: "60px",
                                                                  marginTop:
                                                                    "7px",
                                                                  padding:
                                                                    " 2px 2px 2px 2px ", // Add padding to the button
                                                                  display:
                                                                    "inline-block", // Ensure button stays in line
                                                                  borderRadius:
                                                                    "0.5rem",
                                                                }}
                                                                href={
                                                                  subScriptionActiveList.hostedInvoiceUrl
                                                                }
                                                                className="btn btn-secondary btn-xs"
                                                              >
                                                                <i className="fa fa-download"></i>
                                                              </a>
                                                            </Tooltip>
                                                          )}
                                                          {subScriptionActiveList.paymentStatus ===
                                                            "Free" && (
                                                            <p>Free</p>
                                                          )}
                                                        </p>
                                                      </div>
                                                    </div>
                                                  </div>
                                                </div>
                                                <div className="pricing-features">
                                                  <p className=" mb-1 text-dark">
                                                    <b>Package Name</b>:{" "}
                                                    {
                                                      subScriptionActiveList.packageName
                                                    }
                                                  </p>
                                                  <p className="mt-0 mb-1 text-dark">
                                                    <b>Payment Frequency</b>:{" "}
                                                    {subScriptionActiveList.paymentFrequencyID ===
                                                    1
                                                      ? "Yearly"
                                                      : subScriptionActiveList.paymentFrequencyID ===
                                                          4
                                                        ? "Monthly"
                                                        : ""}
                                                  </p>

                                                  <p className="mt-0 mb-1 text-dark">
                                                    <b>Days</b>:{" "}
                                                    {subScriptionActiveList.paymentFrequencyID ===
                                                    1
                                                      ? "365 Days"
                                                      : subScriptionActiveList.paymentFrequencyID ===
                                                          4
                                                        ? "30 Days"
                                                        : "-"}
                                                  </p>

                                                  <p className="mt-0 mb-1 text-dark">
                                                    <b>Subscription Date</b>:{" "}
                                                    {subScriptionActiveList.subscriptionStartDate ===
                                                    null
                                                      ? "-"
                                                      : subScriptionActiveList.subscriptionStartDate}
                                                  </p>
                                                  <p className="mt-0 mb-1 text-dark">
                                                    <b> Next Renewal Date</b>:{" "}
                                                    {subScriptionActiveList.renewDate ===
                                                    null
                                                      ? "-"
                                                      : subScriptionActiveList.renewDate}
                                                  </p>
                                                  <p className="mt-0 mb-1 text-dark">
                                                    <b>Payment Status</b>:{" "}
                                                    {
                                                      subScriptionActiveList.paymentStatus
                                                    }
                                                  </p>
                                                  <p className="mt-0 mb-1 text-dark">
                                                    <b>Subscription Status</b>:{" "}
                                                    {/* {subScriptionActiveList.subscriptionStatus} */}
                                                    <div
                                                      className="p-1   rounded text-nowrap"
                                                      style={{
                                                        color:
                                                          subScriptionActiveList.subscriptionStatus ===
                                                          "Active"
                                                            ? "#008000"
                                                            : subScriptionActiveList.subscriptionStatus ===
                                                                "Expired"
                                                              ? "#FF0000"
                                                              : subScriptionActiveList.subscriptionStatus ===
                                                                  "Pending"
                                                                ? "#DAA520"
                                                                : subScriptionActiveList.subscriptionStatus ===
                                                                    "InActive"
                                                                  ? "#772424"
                                                                  : "gray",
                                                        width: "100px",
                                                        padding: "1px 8px", // Add padding to the button
                                                        display: "inline-block", // Ensure button stays in line
                                                        borderRadius: "0.5rem", // Adjust border radius
                                                      }}
                                                    >
                                                      {
                                                        subScriptionActiveList.subscriptionStatus
                                                      }
                                                    </div>
                                                  </p>
                                                  <p className="mt-0 mb-1 text-dark">
                                                    <b>Remaining Proposals</b>:{" "}
                                                    {subScriptionActiveList.remainingQuotesPerMonth <
                                                    0
                                                      ? 0
                                                      : subScriptionActiveList.remainingQuotesPerMonth}
                                                  </p>
                                                  <p className="mt-0 mb-1 text-dark">
                                                    <b>
                                                      Remaining E-Signatures
                                                    </b>
                                                    :{" "}
                                                    {subScriptionActiveList.remainingESignatures <
                                                    0
                                                      ? 0
                                                      : subScriptionActiveList.remainingESignatures}
                                                  </p>
                                                  <p className="mt-0 mb-1 text-dark">
                                                    <b>Remaining Pages</b>:{" "}
                                                    {subScriptionActiveList.noOfPages <
                                                      0 ||
                                                    subScriptionActiveList.noOfPages ===
                                                      null
                                                      ? 0
                                                      : subScriptionActiveList.noOfPages}
                                                  </p>
                                                </div>
                                              </CardBody>
                                            </div>

                                            {/* Right side for user name */}
                                            <div className="col-md-6 mt-2">
                                              <CardBody
                                                style={{
                                                  padding: "10px",
                                                  maxHeight: "65vh",
                                                  height: "auto",
                                                }}
                                              >
                                                <div className="media ">
                                                  <i className="ion ion-ios-airplane h1 align-self-center"></i>
                                                  <div className="media-body text-center ">
                                                    <div className="text-center login-logo">
                                                      <h5 className="card-title">
                                                        Package Details{" "}
                                                      </h5>
                                                    </div>

                                                    {/* <h6 className="text-dark">
                                {subScriptionActiveList?.packageName}
                              </h6> */}
                                                    <p>
                                                      {(() => {
                                                        const MonthlyPrice =
                                                          Number(
                                                            subScriptionActiveList?.yearlyValuePlan,
                                                          ) / 12;
                                                        return formatValue(
                                                          MonthlyPrice,
                                                        );
                                                      })()}
                                                      / Month
                                                    </p>
                                                  </div>
                                                </div>
                                                <div className="pricing-features">
                                                  <p className="mt-0 mb-1 text-dark">
                                                    {subScriptionActiveList?.apiIntegration ==
                                                    true ? (
                                                      <span
                                                        style={{
                                                          color: "green",
                                                        }}
                                                        className="fa fa-check"
                                                      ></span>
                                                    ) : (
                                                      <span
                                                        style={{
                                                          color: "red",
                                                          marginRight: "2px",
                                                        }}
                                                        className="fa fa-times"
                                                      ></span>
                                                    )}
                                                    <span
                                                      style={{
                                                        marginLeft: "10px",
                                                      }}
                                                    >
                                                      {" "}
                                                      API Integration
                                                    </span>
                                                  </p>
                                                  <p className="mt-0 mb-1 text-dark">
                                                    {subScriptionActiveList?.prepareQuote ==
                                                    true ? (
                                                      <span
                                                        style={{
                                                          color: "green",
                                                        }}
                                                        className="fa fa-check"
                                                      ></span>
                                                    ) : (
                                                      <span
                                                        style={{
                                                          color: "red",
                                                          marginRight: "2px",
                                                        }}
                                                        className="fa fa-times"
                                                      ></span>
                                                    )}
                                                    <span
                                                      style={{
                                                        marginLeft: "10px",
                                                      }}
                                                    >
                                                      {" "}
                                                      Prepare {proposalName}
                                                    </span>
                                                  </p>
                                                  <p className="mt-0 mb-1 text-dark">
                                                    {subScriptionActiveList?.prepareContract ===
                                                    true ? (
                                                      <span
                                                        style={{
                                                          color: "green",
                                                        }}
                                                        className="fa fa-check"
                                                      ></span>
                                                    ) : (
                                                      <span
                                                        style={{
                                                          color: "red",
                                                          marginRight: "2px",
                                                        }}
                                                        className="fa fa-times"
                                                      ></span>
                                                    )}
                                                    <span
                                                      style={{
                                                        marginLeft: "10px",
                                                      }}
                                                    >
                                                      {" "}
                                                      Prepare {EngagementName}
                                                    </span>
                                                  </p>
                                                  <p className="mt-0 mb-1 text-dark">
                                                    {subScriptionActiveList?.sendQuote ===
                                                    true ? (
                                                      <span
                                                        style={{
                                                          color: "green",
                                                        }}
                                                        className="fa fa-check"
                                                      ></span>
                                                    ) : (
                                                      <span
                                                        style={{
                                                          color: "red",
                                                          marginRight: "2px",
                                                        }}
                                                        className="fa fa-times"
                                                      ></span>
                                                    )}
                                                    <span
                                                      style={{
                                                        marginLeft: "10px",
                                                      }}
                                                    >
                                                      {" "}
                                                      Send {proposalName}
                                                    </span>
                                                  </p>
                                                  <p className="mt-0 mb-1 text-dark">
                                                    {subScriptionActiveList?.sendQuote ===
                                                      true &&
                                                      subScriptionActiveList?.quotesPerMonth >
                                                        0 && (
                                                        <>
                                                          <span
                                                            style={{
                                                              color: "green",
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
                                                            Prepare and Send{" "}
                                                            {proposalName}:{" "}
                                                            {formatValueWithoutCurrencySymbol(
                                                              subScriptionActiveList?.quotesPerMonth,
                                                            )}
                                                            /Month
                                                          </span>
                                                        </>
                                                      )}
                                                  </p>
                                                  <p className="mt-0 mb-1 text-dark">
                                                    {subScriptionActiveList?.signContract ===
                                                    true ? (
                                                      <span
                                                        style={{
                                                          color: "green",
                                                        }}
                                                        className="fa fa-check"
                                                      ></span>
                                                    ) : (
                                                      <span
                                                        style={{
                                                          color: "red",
                                                          marginRight: "2px",
                                                        }}
                                                        className="fa fa-times"
                                                      ></span>
                                                    )}
                                                    {"  "}
                                                    <span
                                                      style={{
                                                        marginLeft: "10px",
                                                      }}
                                                    >
                                                      {"  "}
                                                      Send And Digitally Sign
                                                      The {EngagementName}:{" "}
                                                      {
                                                        subScriptionActiveList?.eSignaturePerMonth
                                                      }
                                                      /Month
                                                    </span>
                                                  </p>

                                                  <p className="mt-0 mb-1 text-dark">
                                                    {subScriptionActiveList?.isMailBox ===
                                                      null ||
                                                    !subScriptionActiveList?.isMailBox ? (
                                                      <span
                                                        style={{
                                                          color: "red",
                                                          marginRight: "2px",
                                                        }}
                                                        className="fa fa-times"
                                                      ></span>
                                                    ) : (
                                                      <span
                                                        style={{
                                                          color: "green",
                                                        }}
                                                        className="fa fa-check"
                                                      ></span>
                                                    )}
                                                    {"  "}
                                                    <span
                                                      style={{
                                                        marginLeft: "10px",
                                                      }}
                                                    >
                                                      {" "}
                                                      Personalized Outgoing
                                                      Mailbox
                                                    </span>
                                                  </p>
                                                  <p className="mt-0 mb-1 text-dark">
                                                    {subScriptionActiveList?.enablePdfToCsv ===
                                                      null ||
                                                    !subScriptionActiveList?.enablePdfToCsv ? (
                                                      <span
                                                        style={{
                                                          color: "red",
                                                          marginRight: "2px",
                                                        }}
                                                        className="fa fa-times"
                                                      ></span>
                                                    ) : (
                                                      <span
                                                        style={{
                                                          color: "green",
                                                        }}
                                                        className="fa fa-check"
                                                      ></span>
                                                    )}
                                                    {"  "}
                                                    <span
                                                      style={{
                                                        marginLeft: "10px",
                                                      }}
                                                    >
                                                      {" "}
                                                      {subScriptionActiveList?.noOfPages ===
                                                      null
                                                        ? "PDF To CSV"
                                                        : "PDF To CSV: "}
                                                      {subScriptionActiveList?.noOfPages ===
                                                      1
                                                        ? `${subScriptionActiveList?.noOfPages} Page`
                                                        : subScriptionActiveList?.noOfPages >
                                                            1
                                                          ? `${subScriptionActiveList?.noOfPages} Pages`
                                                          : ""}
                                                    </span>
                                                  </p>

                                                  {/* xero  */}
                                                  {subScriptionActiveList &&
                                                    subScriptionActiveList?.enableXERO !==
                                                      null && (
                                                      <p className="mt-0 mb-1 text-dark">
                                                        {subScriptionActiveList?.enableXERO ===
                                                          null ||
                                                        !subScriptionActiveList?.enableXERO ? (
                                                          <span
                                                            style={{
                                                              color: "red",
                                                              marginRight:
                                                                "2px",
                                                            }}
                                                            className="fa fa-times"
                                                          ></span>
                                                        ) : (
                                                          <span
                                                            style={{
                                                              color: "green",
                                                            }}
                                                            className="fa fa-check"
                                                          ></span>
                                                        )}
                                                        {"  "}
                                                        <span
                                                          style={{
                                                            marginLeft: "10px",
                                                          }}
                                                        >
                                                          {" "}
                                                          Xero Subscription
                                                        </span>
                                                      </p>
                                                    )}

                                                  {/* Quickbook  */}
                                                  {subScriptionActiveList &&
                                                    subScriptionActiveList?.enableQBO !==
                                                      null && (
                                                      <p className="mt-0 mb-1 text-dark">
                                                        {subScriptionActiveList?.enableQBO ===
                                                          null ||
                                                        !subScriptionActiveList?.enableQBO ? (
                                                          <span
                                                            style={{
                                                              color: "red",
                                                              marginRight:
                                                                "2px",
                                                            }}
                                                            className="fa fa-times"
                                                          ></span>
                                                        ) : (
                                                          <span
                                                            style={{
                                                              color: "green",
                                                            }}
                                                            className="fa fa-check"
                                                          ></span>
                                                        )}
                                                        {"  "}
                                                        <span
                                                          style={{
                                                            marginLeft: "10px",
                                                          }}
                                                        >
                                                          {" "}
                                                          Quickbooks
                                                          Subscription
                                                        </span>
                                                      </p>
                                                    )}

                                                  {/* AI Agent  */}
                                                  {subScriptionActiveList &&
                                                    subScriptionActiveList?.enableAIAgent !==
                                                      null && (
                                                      <p className="mt-0 mb-1 text-dark">
                                                        {subScriptionActiveList?.enableAIAgent ===
                                                          null ||
                                                        !subScriptionActiveList?.enableAIAgent ? (
                                                          <span
                                                            style={{
                                                              color: "red",
                                                              marginRight:
                                                                "2px",
                                                            }}
                                                            className="fa fa-times"
                                                          ></span>
                                                        ) : (
                                                          <span
                                                            style={{
                                                              color: "green",
                                                            }}
                                                            className="fa fa-check"
                                                          ></span>
                                                        )}
                                                        {"  "}
                                                        <span
                                                          style={{
                                                            marginLeft: "10px",
                                                          }}
                                                        >
                                                          {" "}
                                                          AI Agent Subscription
                                                        </span>
                                                      </p>
                                                    )}
                                                </div>
                                              </CardBody>
                                            </div>
                                          </div>
                                        </div>
                                        {/* </div> */}
                                      </div>
                                    </div>
                                  </div>
                                  <div class="table-card mt-2 table-padding">
                                    <div
                                      className="table-container mt-2"
                                      style={{
                                        maxHeight: "500px",
                                        overflowY: "auto",
                                      }}
                                    >
                                      <table className="table table-striped">
                                        <thead>
                                          <tr>
                                            <th
                                              scope="col"
                                              className="tr-table-class text-white"
                                            >
                                              Email
                                            </th>
                                            <th
                                              scope="col"
                                              className="tr-table-class text-white"
                                            >
                                              Contact No
                                            </th>
                                            <th
                                              scope="col"
                                              className="tr-table-class text-white"
                                            >
                                              Package Name
                                            </th>
                                            <th
                                              scope="col"
                                              className="tr-table-class text-white"
                                            >
                                              Package Price
                                            </th>
                                            <th
                                              scope="col"
                                              className="tr-table-class text-white"
                                            >
                                              Subscription Start Date
                                            </th>
                                            <th
                                              scope="col"
                                              className="tr-table-class text-white"
                                            >
                                              Next Renewal Date
                                            </th>
                                            <th
                                              scope="col"
                                              className="tr-table-class text-white"
                                            >
                                              Payable Amount
                                            </th>
                                            <th
                                              scope="col"
                                              className="tr-table-class text-white"
                                            >
                                              Payment Status
                                            </th>
                                            <th
                                              scope="col"
                                              className="tr-table-class text-white"
                                            >
                                              Subscription Status
                                            </th>
                                            <th
                                              scope="col"
                                              className="tr-table-class text-white"
                                            >
                                              Action
                                            </th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {subScriptionPlanList.map(
                                            (subscription, index) => (
                                              <tr key={index}>
                                                <td className="table-content-font align-items-center text-center">
                                                  {subscription.email}
                                                </td>
                                                <td className="table-content-font">
                                                  {subscription.mobileNumber}
                                                </td>
                                                <td className="table-content-font align-items-center text-center">
                                                  {subscription.packageName}
                                                </td>
                                                <td className="table-content-font align-items-center text-center">
                                                  {formatValue(
                                                    subscription.packagePrice,
                                                  )}
                                                </td>
                                                <td className="table-content-font align-items-center text-center">
                                                  {subscription.subscriptionStartDate ===
                                                  null
                                                    ? "_"
                                                    : subscription.subscriptionStartDate}
                                                </td>
                                                <td className="table-content-font align-items-center text-center">
                                                  {subscription.nextRenewalDate ===
                                                  null
                                                    ? "_"
                                                    : subscription.nextRenewalDate}
                                                </td>
                                                <td className="table-content-font ">
                                                  {formatValue(
                                                    subscription.finalBillingAmount,
                                                  )}
                                                </td>
                                                {/* <td className="table-content-font">
                                      {subscription.paymentStatus}
                                    </td> */}
                                                <td className="table-content-font align-items-center text-center">
                                                  {/* <div className="mb-1 text-center  text-white rounded text-nowrap"> */}
                                                  {subscription.paymentStatus ===
                                                    "Unpaid" && (
                                                    <Tooltip title={`Pay Now`}>
                                                      <button
                                                        style={{
                                                          width: "80px",
                                                          marginTop: "5px",
                                                          // padding: "5px 8px 6px 5px",
                                                          // margin:'1px', // Add padding to the button
                                                          display:
                                                            "inline-block", // Ensure button stays in line
                                                          // borderRadius: "0.5rem",
                                                        }}
                                                        className="btn btn-md btn-success create-item-btn view"
                                                        onClick={() =>
                                                          RedirectStripeCheckout(
                                                            subscription,
                                                          )
                                                        }
                                                      >
                                                        <span>Pay Now</span>
                                                      </button>
                                                    </Tooltip>
                                                  )}
                                                  {subscription.paymentStatus ===
                                                    "Paid" && (
                                                    <Tooltip title={`Download`}>
                                                      <a
                                                        style={{
                                                          width: "60px",
                                                          padding:
                                                            "2px 2px 2px 2px", // Add padding to the button
                                                          display:
                                                            "inline-block", // Ensure button stays in line
                                                          borderRadius:
                                                            "0.5rem",
                                                        }}
                                                        href={
                                                          subscription.hostedInvoiceUrl
                                                        }
                                                        className="btn btn-secondary btn-xs"
                                                      >
                                                        <i className="fa fa-download"></i>
                                                      </a>
                                                    </Tooltip>
                                                  )}
                                                  {subscription.paymentStatus ===
                                                    "Free" && (
                                                    <p
                                                      style={{
                                                        background: "#DAA520",
                                                        width: "100px",
                                                        padding: "4px 5px",
                                                        display: "inline-block",
                                                        borderRadius: "0.5rem",
                                                      }}
                                                    >
                                                      Free
                                                    </p>
                                                  )}
                                                  {/* </div> */}
                                                </td>
                                                <td className="Switch">
                                                  <div
                                                    style={{
                                                      alignItems: "none",
                                                    }}
                                                    className="d-flex gap-2"
                                                  >
                                                    <div
                                                      style={{
                                                        marginTop: "9px",
                                                      }}
                                                    >
                                                      <div
                                                        className="mb-1 text-center  text-white rounded text-nowrap"
                                                        style={{
                                                          background:
                                                            subscription.subscriptionStatus ===
                                                            "Active"
                                                              ? "#008000"
                                                              : subscription.subscriptionStatus ===
                                                                  "Expired"
                                                                ? "#FF0000"
                                                                : subscription.subscriptionStatus ===
                                                                    "Pending"
                                                                  ? "#DAA520"
                                                                  : subscription.subscriptionStatus ===
                                                                      "InActive"
                                                                    ? "#772424"
                                                                    : "gray",
                                                          width: "100px",
                                                          padding:
                                                            "5px 8px 6px 5px", // Add padding to the button
                                                          display:
                                                            "inline-block", // Ensure button stays in line
                                                          borderRadius:
                                                            "0.5rem", // Adjust border radius
                                                        }}
                                                      >
                                                        {
                                                          subscription.subscriptionStatus
                                                        }
                                                      </div>
                                                    </div>
                                                  </div>
                                                </td>

                                                <td>
                                                  <div class="view text-nowrap mt-1">
                                                    <Tooltip
                                                      title={`View Subscription`}
                                                    >
                                                      <div class="view">
                                                        <button
                                                          class="btn btn-md btn-success create-item-btn view"
                                                          onClick={() =>
                                                            handleOpenSubscriptionModel(
                                                              subscription,
                                                            )
                                                          }
                                                          data-bs-toggle="modal"
                                                          data-bs-target="#addSubscriptionViewModalUser"
                                                        >
                                                          <span>View</span>{" "}
                                                          <span className="mt-4">
                                                            {" "}
                                                            <i class="bi bi-eye "></i>
                                                          </span>
                                                        </button>
                                                      </div>
                                                    </Tooltip>
                                                  </div>
                                                </td>
                                              </tr>
                                            ),
                                          )}
                                        </tbody>
                                      </table>
                                      {totalRecords <= 0 && (
                                        <NoResultFoundModel
                                          name={"Subscription"}
                                          totalRecords={totalRecords}
                                        />
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            {listCount > pageSize && (
                              <PaginationComponent
                                totalCount={listCount}
                                totalPages={totalPage}
                                desktopRecords={desktopRecords}
                                currentPage={currentPage}
                                onPageChange={handlePageChange}
                              />
                            )}
                          </div>
                        </div>
                      </div>

                      {/* end row */}
                    </div>
                    {/* container-fluid  */}
                  </div>
                  {/* End Page-content */}

                  <SubscriptionView
                    class="modal fade"
                    id="addSubscriptionViewModalUser"
                    tabIndex="-1"
                    aria_labelledby="exampleModalLabel"
                    aria_hidden="true"
                    subscriptionPackageObj={subscriptionPackageObj}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>

      {/* start back-to-top */}
      <button
        onClick="topFunction()"
        class="btn btn-danger btn-icon"
        id="back-to-top"
      >
        <i className="ri-arrow-up-line"></i>
      </button>
    </div>
  );
};

export default MySubscription;
