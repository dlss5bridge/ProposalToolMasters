/* global $ */
import React, { useEffect, useState, useRef, useContext } from "react";
import Select from "react-select";
import { useLocation } from "react-router-dom";
import SuccessModal from "../../../components/SuccessModal";
import FormControlLabel from "@mui/material/FormControlLabel";
import TextField from "@mui/material/TextField";
import FormGroup from "@mui/material/FormGroup";
import { Row, Col } from "reactstrap";
import { ERROR_MESSAGES } from "../../../components/GlobalMessage";
import { useSelector } from "react-redux";
import {
  AddUpdateSubscriptionPackage,
  GetSubscriptionPackageModel,
} from "../../../redux/Services/Subscription/PackageApi";
import { AuthContextProvider } from "../../../AuthContext/AuthContext";
import { useNavigate } from "react-router-dom";
import BackButtonSvg from "../../../components/BackButtonSvg";
import Android12Switch from "../../../components/AndroidSwitch";
function SubscriptionPackageModel(props) {
  const moduleName = "Subscription Package";
  // Declare all State
  const [modelAction, setModelAction] = useState("");
  const [requireErrorMessage, setRequireErrorMessage] = useState(false);
  const [
    requireErrorMessageForESignature,
    setRequireErrorMessageForESignature,
  ] = useState(false);
  const SubscriptionContainerRef = useRef(null);
  const [DiscountPriceError, setDiscountPriceError] = useState(false);
  const [subscriptionPackageObj, setSubscriptionPackageObj] = useState({
    subscriptionPackageKeyID: null,
    isFreePackage: null,
    isFreeAfterTrial: null,
    packageName: "",
    prepareQuote: true,
    sendQuote: true,
    quotesPerMonth: "",
    prepareContract: true,
    sendContract: true,
    signContract: true,
    eSignaturePerMonth: "",
    enablePdfToCsv: true,
    enableXERO: false,
    enableQBO: false,
    enableAIAgent: false,
    pages: null,
    yearlyValuePlan: "",
    discountPercentageYear: "",
    discountPercentageYearCheck: false,
    discountPercentageMonth: "",
    discountPercentageMonthCheck: false,
    discountPriceYear: "",
    discountPriceYearCheck: false,
    discountPriceMonth: "",
    discountPriceMonthCheck: false,
    monthFreeYear: "",
    monthFreeYearCheck: false,
    monthFreeMonth: "",
    monthFreeMonthCheck: false,
    getMonthsYear: "",
    getMonthsYearCheck: false,
    getMonthsMonth: "",
    getMonthsMonthCheck: false,
    inPriceOfMonthYear: "",
    inPriceOfMonthMonth: "",
    isMailBox: false,
    apiIntegration: true,
    noOfPages: null,
    enableWebBasedProposal: false,
  });

  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");
  const location = useLocation();
  const common = useSelector((state) => state.Storage); //Getting Logged Users Details From Persist Storage of redux hooks
  const [openSuccessModal, setOpenSuccessModal] = React.useState(false);
  const {
    setLoader,
    proposalName,
    EngagementName,
    scrollUpDownByElementID,
    scrollUptoCurrentPosition,
    setTopbar,
    getCrudPopUpTitleName,
  } = useContext(AuthContextProvider);

  //c]Declare UseEffect

  useEffect(() => {
    setTopbar("none");
  }, []);
  useEffect(() => {
    setModelAction(
      location?.state?.Action === undefined || location?.state?.Action === null
        ? "Add"
        : "Update",
    ); //Do not change this naming convention

    // setModelAction(props.modelRequestData?.Action === null ? "Add" : "Update"); //Do not change this naming convention
    if (location.state?.subscriptionPackageKeyID !== null) {
      GetSubscriptionPackageModelData(location.state?.subscriptionPackageKeyID);
    }
  }, [location.state]);

  // C] This function will clear all data from popup model
  const SetInitialModelData = () => {
    setSubscriptionPackageObj({
      ...subscriptionPackageObj,
      subscriptionPackageKeyID: null,
      packageName: "",
      prepareQuote: true,
      sendQuote: true,
      prepareContract: true,
      sendContract: true,
      signContract: true,
      eSignaturePerMonth: "",
      yearlyValuePlan: "",
      discountPercentageYear: "",
      discountPercentageMonth: "",
      discountPriceYear: "",
      discountPriceMonth: "",
      monthFreeYear: "",
      monthFreeMonth: "",
      getMonthsYear: "",
      getMonthsMonth: "",
      inPriceOfMonthYear: "",
      inPriceOfMonthMonth: "",
      isMailBox: false,
      enableWebBasedProposal: false,
    });
    setErrorMessage("");
    setRequireErrorMessage(false);
  };

  // F] Calling CRUD Api here
  // 1) Get Model Data Api
  const GetSubscriptionPackageModelData = async (id) => {
    if (!id) {
      return;
    }
    //..............Subscription package Edit Data Api...................
    try {
      const data = await GetSubscriptionPackageModel(id);
      if (data?.data?.statusCode === 200) {
        if (data?.data?.responseData?.data) {
          const ModelData = data?.data?.responseData?.data;
          const discountPriceYear = ModelData.subscriptionOffers.find(
            (offer) => offer.paymentFrequencyID === 1,
          )?.discountPrice;
          const monthFreeYear = ModelData.subscriptionOffers.find(
            (offer) => offer.paymentFrequencyID === 1,
          )?.monthFree;
          const getMonthsYear = ModelData.subscriptionOffers.find(
            (offer) => offer.paymentFrequencyID === 1,
          )?.getMonths;
          const inPriceOfMonthYear = ModelData.subscriptionOffers.find(
            (offer) => offer.paymentFrequencyID === 1,
          )?.inPriceOfMonth;
          const discountPercentageYear = ModelData.subscriptionOffers.find(
            (offer) => offer.paymentFrequencyID === 1,
          )?.discountPercentage;

          const discountPriceMonth = ModelData.subscriptionOffers.find(
            (offer) => offer.paymentFrequencyID === 4,
          )?.discountPrice;
          const monthFreeMonth = ModelData.subscriptionOffers.find(
            (offer) => offer.paymentFrequencyID === 4,
          )?.monthFree;
          const getMonthsMonth = ModelData.subscriptionOffers.find(
            (offer) => offer.paymentFrequencyID === 4,
          )?.getMonths;
          const inPriceOfMonthMonth = ModelData.subscriptionOffers.find(
            (offer) => offer.paymentFrequencyID === 4,
          )?.inPriceOfMonth;
          const discountPercentageMonth = ModelData.subscriptionOffers.find(
            (offer) => offer.paymentFrequencyID === 4,
          )?.discountPercentage;
          setSubscriptionPackageObj({
            ...subscriptionPackageObj,
            apiIntegration: ModelData.apiIntegration,
            isFreePackage: ModelData.isFreePackage,
            isFreeAfterTrial: ModelData.isFreeAfterTrial,
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
            isMailBox: ModelData.isMailBox,
            enablePdfToCsv: ModelData.enablePdfToCsv,
            enableXERO: ModelData.enableXERO,
            enableQBO: ModelData.enableQBO,
            enableAIAgent: ModelData.enableAIAgent,
            enableWebBasedProposal: ModelData.enableWebBasedProposal,
            pages: ModelData.noOfPages,
            discountPercentageYear:
              discountPercentageYear === undefined ? 0 : discountPercentageYear,
            discountPercentageYearCheck:
              discountPercentageYear === undefined
                ? false
                : discountPercentageYear > 0
                  ? true
                  : false,
            discountPercentageMonth:
              discountPercentageMonth === undefined
                ? 0
                : discountPercentageMonth,
            discountPercentageMonthCheck:
              discountPercentageMonth === undefined
                ? false
                : discountPercentageMonth > 0
                  ? true
                  : false,
            discountPriceYear:
              discountPriceYear === undefined ? 0 : discountPriceYear,
            discountPriceYearCheck:
              discountPriceYear === undefined
                ? false
                : discountPriceYear > 0
                  ? true
                  : false,
            discountPriceMonth:
              discountPriceMonth === undefined ? 0 : discountPriceMonth,
            discountPriceMonthCheck:
              discountPriceMonth === undefined
                ? false
                : discountPriceMonth > 0
                  ? true
                  : false,
            monthFreeYear: monthFreeYear === undefined ? 0 : monthFreeYear,
            monthFreeYearCheck:
              monthFreeYear === undefined
                ? false
                : monthFreeYear > 0
                  ? true
                  : false,
            monthFreeMonth: monthFreeMonth === undefined ? 0 : monthFreeMonth,
            monthFreeMonthCheck:
              monthFreeMonth === undefined
                ? false
                : monthFreeMonth > 0
                  ? true
                  : false,
            getMonthsYear: getMonthsYear === undefined ? 0 : getMonthsYear,
            getMonthsYearCheck:
              getMonthsYear === undefined
                ? false
                : getMonthsYear > 0
                  ? true
                  : false,
            getMonthsMonth: getMonthsMonth === undefined ? 0 : getMonthsMonth,
            getMonthsMonthCheck:
              getMonthsMonth === undefined
                ? false
                : getMonthsMonth > 0
                  ? true
                  : false,
            inPriceOfMonthYear:
              inPriceOfMonthYear === undefined ? 0 : inPriceOfMonthYear,
            inPriceOfMonthYearCheck:
              inPriceOfMonthYear === undefined ? 0 : inPriceOfMonthYear,
            inPriceOfMonthMonth:
              inPriceOfMonthMonth === undefined ? 0 : inPriceOfMonthMonth,
          });
        }
      } else {
        setErrorMessage(data?.data?.errorMessage);
      }
    } catch (error) {
      console.log(error);
    }
  };

  //2]Add Update Button Click Function
  const SubscriptionPackageAddUpdateBtnClicked = () => {
    //Check Validations will be done here

    if (
      subscriptionPackageObj.packageName === undefined ||
      subscriptionPackageObj.packageName === "" ||
      subscriptionPackageObj.packageName === null
    ) {
      scrollUpDownByElementID("PackageName");
      setRequireErrorMessage(true);
      return false; // Return false or handle your error logic here if needed.
    } else {
      setRequireErrorMessage(""); // Clear the error message if there are no errors.
    }
    if (
      subscriptionPackageObj.enablePdfToCsv &&
      (subscriptionPackageObj.pages === undefined ||
        subscriptionPackageObj.pages === "" ||
        subscriptionPackageObj.pages === null)
    ) {
      scrollUpDownByElementID("Pages");
      setRequireErrorMessage(true);
      return false; // Return false or handle your error logic here if needed.
    } else {
      setRequireErrorMessage(""); // Clear the error message if there are no errors.
    }
    if (subscriptionPackageObj.sendContract === true) {
      if (Number(subscriptionPackageObj.eSignaturePerMonth) < 1) {
        scrollUpDownByElementID("ESignature");
        setRequireErrorMessageForESignature(true);
        return false;
      }
    }
    const { yearlyValuePlan, discountPriceMonth, discountPriceYear } =
      subscriptionPackageObj;

    if (
      Number(yearlyValuePlan) > 20000 ||
      Number(discountPriceMonth) > 20000 ||
      Number(discountPriceYear) > 20000
    ) {
      let exceededValue = "";

      if (Number(yearlyValuePlan) > 20000) {
        exceededValue = `The Yearly Plan Value (${yearlyValuePlan})`;
      } else if (Number(discountPriceMonth) > 20000) {
        exceededValue = `The Monthly Discount Price (${discountPriceMonth})`;
      } else if (Number(discountPriceYear) > 20000) {
        exceededValue = `The Yearly Discount Price (${discountPriceYear})`;
      }

      setErrorMessage(
        `${exceededValue
          ?.toString()
          .replace(
            /\B(?=(\d{3})+(?!\d))/g,
            ",",
          )} exceeds Stripe's transaction limit of £ 20,000. Please enter a lower amount.`,
      );

      scrollUpDownByElementID("ErrorMessage");
      return false;
    }

    scrollUpDownByElementID("ErrorMessage");
    // Clear the error message and set close to true if there are no errors.
    setErrorMessage("");

    // Preparing Object For Add Update and if any modification then it will done here
    const ApiRequest_ParamsObj = {
      //global level params : fixed
      // Action: modelRequestData.Action,
      userKeyID: common.userKeyID,
      // organisationKeyID: common.organisationKeyID,

      //form level params : fixed
      // subscriptionPackageKeyID: props.modelRequestData.subscriptionPackageKeyID, //will change module wise
      subscriptionPackageKeyID: subscriptionPackageObj.subscriptionPackageKeyID, //will change module wise

      //form level params : will change according to module
      apiIntegration: subscriptionPackageObj.apiIntegration,
      packageName: subscriptionPackageObj.packageName,
      prepareQuote: subscriptionPackageObj.prepareQuote,
      sendQuote: subscriptionPackageObj.sendQuote,
      quotesPerMonth:
        subscriptionPackageObj.quotesPerMonth === ""
          ? null
          : subscriptionPackageObj.quotesPerMonth,
      prepareContract: subscriptionPackageObj.prepareContract,
      enablePdfToCsv: subscriptionPackageObj.enablePdfToCsv,
      enableQBO: subscriptionPackageObj.enableQBO,
      enableXERO: subscriptionPackageObj.enableXERO,
      enableAIAgent: subscriptionPackageObj?.enableAIAgent,
      enableWebBasedProposal: subscriptionPackageObj?.enableWebBasedProposal,
      noOfPages: Number(subscriptionPackageObj.pages),
      sendContract: subscriptionPackageObj.sendContract,
      signContract: subscriptionPackageObj.sendContract,
      isMailBox: subscriptionPackageObj.isMailBox,
      eSignaturePerMonth:
        subscriptionPackageObj.eSignaturePerMonth === ""
          ? null
          : subscriptionPackageObj.eSignaturePerMonth,
      yearlyValuePlan:
        subscriptionPackageObj.yearlyValuePlan === ""
          ? null
          : Number(subscriptionPackageObj.yearlyValuePlan),

      subscriptionOffers:
        subscriptionPackageObj.isFreePackage ||
        subscriptionPackageObj.isFreeAfterTrial
          ? null
          : [
              {
                paymentFrequencyID: 4, // Monthly
                discountPercentage:
                  subscriptionPackageObj.discountPercentageMonthCheck
                    ? subscriptionPackageObj.discountPercentageMonth === ""
                      ? null
                      : Number(subscriptionPackageObj.discountPercentageMonth)
                    : 0,
                discountPrice: subscriptionPackageObj.discountPriceMonthCheck
                  ? subscriptionPackageObj.discountPriceMonth === ""
                    ? null
                    : Number(subscriptionPackageObj.discountPriceMonth)
                  : 0,
                monthFree: subscriptionPackageObj.monthFreeMonthCheck
                  ? subscriptionPackageObj.monthFreeMonth === ""
                    ? null
                    : Number(subscriptionPackageObj.monthFreeMonth)
                  : 0,
                getMonths: subscriptionPackageObj.getMonthsMonthCheck
                  ? subscriptionPackageObj.getMonthsMonth === ""
                    ? null
                    : Number(subscriptionPackageObj.getMonthsMonth)
                  : 0,
                inPriceOfMonth:
                  subscriptionPackageObj.inPriceOfMonthMonth === ""
                    ? null
                    : Number(subscriptionPackageObj.inPriceOfMonthMonth),
              },
              {
                paymentFrequencyID: 1, // Yearly
                discountPercentage:
                  subscriptionPackageObj.discountPercentageYearCheck
                    ? subscriptionPackageObj.discountPercentageYear === ""
                      ? null
                      : Number(subscriptionPackageObj.discountPercentageYear)
                    : 0,
                discountPrice: subscriptionPackageObj.discountPriceYearCheck
                  ? subscriptionPackageObj.discountPriceYear === ""
                    ? null
                    : Number(subscriptionPackageObj.discountPriceYear)
                  : 0,
                monthFree: subscriptionPackageObj.monthFreeYearCheck
                  ? subscriptionPackageObj.monthFreeYear === ""
                    ? null
                    : Number(subscriptionPackageObj.monthFreeYear)
                  : 0,
                getMonths: subscriptionPackageObj.getMonthsYearCheck
                  ? subscriptionPackageObj.getMonthsYear === ""
                    ? null
                    : Number(subscriptionPackageObj.getMonthsYear)
                  : 0,
                inPriceOfMonth:
                  subscriptionPackageObj.inPriceOfMonthYear === ""
                    ? null
                    : Number(subscriptionPackageObj.inPriceOfMonthYear),
              },
            ],
    };

    AddUpdateSubscriptionPackageData(ApiRequest_ParamsObj);
    // console.log("ApiRequest_ParamsObj", ApiRequest_ParamsObj);
  };

  // 3) Add Update Subscription package Data Api
  const AddUpdateSubscriptionPackageData = async (ApiRequest_ParamsObj) => {
    setLoader(true);
    try {
      const response = await AddUpdateSubscriptionPackage(ApiRequest_ParamsObj);
      if (response) {
        setLoader(false);
        if (response?.data?.statusCode === 200) {
          // $('#' + props.id).modal('hide')
          // uncomment upper code for hide

          if (ApiRequest_ParamsObj.Action === null) {
            setOpenSuccessModal(true);
            props.setIsAddUpdateActionDone(true);
            navigate("/sub-package");
          } else {
            setOpenSuccessModal(true);
            props.setIsAddUpdateActionDone(true);
            navigate("/sub-package");
          }
        } else {
          setErrorMessage(response?.response?.data?.errorMessage);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const HandleClose = () => {
    $("#" + props.id).modal("hide");
    setOpenSuccessModal(false);
    SetInitialModelData();
    navigate("/sub-package");
  };
  const handlePrepareQuoteChange = (e) => {
    const prepareQuoteValue = !subscriptionPackageObj.prepareQuote;
    setSubscriptionPackageObj({
      ...subscriptionPackageObj,
      prepareQuote: prepareQuoteValue,
      sendQuote: prepareQuoteValue ? subscriptionPackageObj.sendQuote : false,
      enableWebBasedProposal: prepareQuoteValue
        ? subscriptionPackageObj.enableWebBasedProposal
        : false,
    });
  };
  const handleApiIntegrationChange = (e) => {
    const prepareQuoteValue = !subscriptionPackageObj.apiIntegration;
    setSubscriptionPackageObj({
      ...subscriptionPackageObj,
      apiIntegration: prepareQuoteValue,
    });
  };
  const handleSendQuoteChange = (e) => {
    if (subscriptionPackageObj.prepareQuote) {
      setSubscriptionPackageObj({
        ...subscriptionPackageObj,
        sendQuote: !subscriptionPackageObj.sendQuote,
      });
    }
  };

  const handlePrepareELChange = (e) => {
    const prepareElValue = !subscriptionPackageObj.prepareContract;
    setSubscriptionPackageObj({
      ...subscriptionPackageObj,
      prepareContract: prepareElValue,
      sendContract: prepareElValue
        ? subscriptionPackageObj.sendContract
        : false,
      eSignaturePerMonth: prepareElValue
        ? subscriptionPackageObj.eSignaturePerMonth
        : "",
    });
  };
  const handlePDFToCSVChange = (e) => {
    const EnablePDFToCSVValue = !subscriptionPackageObj.enablePdfToCsv;

    setSubscriptionPackageObj((prev) => ({
      ...prev,
      enablePdfToCsv: EnablePDFToCSVValue,
    }));
  };

  const handleAiAgentChange = (e) => {
    const EnableAIAgent = !subscriptionPackageObj.enableAIAgent;

    setSubscriptionPackageObj((prev) => ({
      ...prev,
      enableAIAgent: EnableAIAgent,
    }));
  };

  const handleSendELChange = (e) => {
    if (subscriptionPackageObj.prepareContract) {
      const sendContract = !subscriptionPackageObj.sendContract;
      setSubscriptionPackageObj({
        ...subscriptionPackageObj,
        sendContract: sendContract,
        eSignaturePerMonth: sendContract
          ? subscriptionPackageObj.eSignaturePerMonth
          : "",
        // signContract: sendContract === "YES" ? true : false,
      });
    }
  };

  const handleSubmit = () => {
    setTopbar("block");
    navigate("/sub-package");
    SetInitialModelData();
  };

  return (
    <div
      ref={SubscriptionContainerRef}
      onClick={(e) => scrollUptoCurrentPosition(e, SubscriptionContainerRef)}
    >
      <div class="container-fluid new-item-page-container">
        <div class="new-item-page-nav"></div>
        <div class="new-item-page-content">
          <div class="row form-row">
            <div class="col-lg-12">
              <h3 class="modal-title">
                <BackButtonSvg onClick={handleSubmit} />
                {modelAction === "Add"
                  ? getCrudPopUpTitleName("Add", moduleName)
                  : getCrudPopUpTitleName("Update", moduleName)}
              </h3>
              <div class="separator mb-3"></div>

              <div className="template-height scrollbar" id="style-1">
                <div class="tab-content">
                  <div className="row" id="PackageName">
                    <div className="col-lg-6">
                      <label>
                        {moduleName} Name
                        <span className="text-danger">*</span>
                      </label>
                    </div>
                    <div className="col-12 ">
                      <input
                        type="text"
                        className="input-text"
                        placeholder={`${moduleName} Name`}
                        value={subscriptionPackageObj?.packageName}
                        onChange={(e) => {
                          setErrorMessage("");
                          let inputValue = e.target.value;
                          // Truncate input if length exceeds 30 characters
                          if (inputValue.length > 30) {
                            inputValue = inputValue.slice(0, 30);
                          }

                          const isValidName =
                            /^[a-zA-Z]+(?:[a-zA-Z0-9\s]*)$/.test(inputValue) &&
                            !/^\d+$/.test(inputValue);
                          if (isValidName || inputValue === "") {
                            const capitalizedValue =
                              inputValue.charAt(0).toUpperCase() +
                              inputValue.slice(1);
                            setSubscriptionPackageObj({
                              ...subscriptionPackageObj,
                              packageName: capitalizedValue,
                            });
                          }
                        }}
                      />

                      {requireErrorMessage &&
                      subscriptionPackageObj.packageName === "" ? (
                        <label className="validation">{ERROR_MESSAGES}</label>
                      ) : (
                        ""
                      )}
                    </div>
                  </div>

                  {/* api integration start  */}
                  <div className="row p-2">
                    <div className="fieldset-group ">
                      <label className="fieldset-group-label required">
                        API Integration
                      </label>
                      <div class="row">
                        <div class="col-lg-3 col-md-3 col-sm-6 text-start text-md-end mt-2">
                          <label class="form-label">API Integration</label>
                        </div>
                        <div
                          class="col-lg-3 col-md-3 col-sm-6"
                          style={{ display: "flex", alignItems: "center" }}
                        >
                          <div style={{ width: "40px", marginBottom: "5px" }}>
                            {subscriptionPackageObj.apiIntegration
                              ? "Yes"
                              : "No"}
                          </div>
                          <FormGroup>
                            <FormControlLabel
                              control={
                                <Android12Switch
                                  checked={
                                    subscriptionPackageObj.apiIntegration
                                  }
                                  onClick={handleApiIntegrationChange}
                                />
                              }
                            />
                          </FormGroup>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* api integration end  */}
                  <div className="row p-2">
                    <div className="fieldset-group ">
                      <label className="fieldset-group-label required">
                        {proposalName}
                      </label>
                      <div class="row">
                        <div class="col-lg-3 col-md-3 col-sm-6 text-start text-md-end mt-2">
                          <label class="form-label">
                            Prepare {proposalName}
                          </label>
                        </div>
                        <div
                          class="col-lg-3 col-md-3 col-sm-6"
                          style={{ display: "flex", alignItems: "center" }}
                        >
                          <div style={{ width: "40px", marginBottom: "5px" }}>
                            {subscriptionPackageObj.prepareQuote ? "Yes" : "No"}
                          </div>
                          <FormGroup>
                            <FormControlLabel
                              control={
                                <Android12Switch
                                  checked={subscriptionPackageObj.prepareQuote}
                                  onClick={handlePrepareQuoteChange}
                                />
                              }
                            />
                          </FormGroup>
                        </div>
                        {/* </div>

                      <div class="row"> */}
                        <div class="col-lg-3 col-md-3 col-sm-6 text-start text-md-end mt-2">
                          <label class="form-label">Send {proposalName}</label>
                        </div>
                        <div
                          class="col-lg-3 col-md-3 col-sm-6"
                          style={{ display: "flex", alignItems: "center" }}
                        >
                          <div style={{ width: "40px", marginBottom: "5px" }}>
                            {subscriptionPackageObj.sendQuote ? "Yes" : "No"}
                          </div>
                          <FormGroup>
                            <FormControlLabel
                              control={
                                <Android12Switch
                                  checked={subscriptionPackageObj.sendQuote}
                                  onClick={handleSendQuoteChange}
                                  disabled={
                                    !subscriptionPackageObj.prepareQuote
                                  }
                                />
                              }
                            />
                          </FormGroup>
                        </div>
                        <div className=" col-6 p-2">
                          <TextField
                            InputLabelProps={{
                              sx: {
                                fontWeight: "bold",
                              },
                            }}
                            label="Proposals per month"
                            id="outlined-basic"
                            variant="outlined"
                            type="text"
                            size="small"
                            value={
                              subscriptionPackageObj?.quotesPerMonth === "" ||
                              subscriptionPackageObj?.quotesPerMonth === null
                                ? ""
                                : subscriptionPackageObj?.quotesPerMonth
                                    ?.toString()
                                    .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                            }
                            onChange={(e) => {
                              let inputValue = e.target.value;
                              // Remove leading zeros
                              inputValue = inputValue.replace(/^0+/, "");
                              // Remove non-numeric characters except decimal point
                              inputValue = inputValue.replace(/[^\d]/g, "");
                              // Limit to 12 digits before the decimal point
                              if (inputValue.includes(".")) {
                                const [integerPart, decimalPart] =
                                  inputValue.split(".");
                                inputValue = `${integerPart.slice(
                                  0,
                                  7,
                                )}.${decimalPart.slice(0, 2)}`;
                              } else {
                                inputValue = inputValue.slice(0, 7);
                              }

                              setSubscriptionPackageObj({
                                ...subscriptionPackageObj,
                                quotesPerMonth: inputValue,
                              });
                            }}
                            disabled={
                              !(
                                subscriptionPackageObj.sendQuote &&
                                subscriptionPackageObj.prepareQuote
                              )
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="fieldset-group" id="ESignature">
                    <label htmlFor="" className="fieldset-group-label required">
                      {EngagementName}
                    </label>
                    <div class="row">
                      <div class="col-lg-3 col-md-3 col-sm-6 text-start text-md-end mt-2">
                        <label class="form-label">
                          Prepare {EngagementName}
                        </label>
                      </div>
                      <div
                        class="col-lg-3 col-md-3 col-sm-6"
                        style={{ display: "flex", alignItems: "center" }}
                      >
                        <div style={{ width: "40px", marginBottom: "5px" }}>
                          {subscriptionPackageObj.prepareContract
                            ? "Yes"
                            : "No"}
                        </div>
                        <FormGroup>
                          <FormControlLabel
                            control={
                              <Android12Switch
                                checked={subscriptionPackageObj.prepareContract}
                                onClick={handlePrepareELChange}
                              />
                            }
                          />
                        </FormGroup>
                      </div>
                      {/* </div>

                      <div class="row"> */}
                      <div class="col-lg-3 col-md-3 col-sm-6 text-start text-md-end mt-2">
                        <label class="form-label">
                          Send And Digitally Sign The {EngagementName}
                        </label>
                      </div>
                      <div
                        class="col-lg-3 col-md-3 col-sm-6"
                        style={{ display: "flex", alignItems: "center" }}
                      >
                        <div style={{ width: "40px", marginBottom: "5px" }}>
                          {subscriptionPackageObj.sendContract ? "Yes" : "No"}
                        </div>
                        <FormGroup>
                          <FormControlLabel
                            control={
                              <Android12Switch
                                checked={subscriptionPackageObj.sendContract}
                                onClick={handleSendELChange}
                                disabled={
                                  !subscriptionPackageObj.prepareContract
                                }
                              />
                            }
                          />
                        </FormGroup>
                      </div>
                      <div className=" col-6 p-2">
                        <TextField
                          InputLabelProps={{
                            sx: {
                              fontWeight: "bold",
                            },
                          }}
                          label="E-Signature per month"
                          id="outlined-basic"
                          variant="outlined"
                          type="text"
                          size="small"
                          value={
                            subscriptionPackageObj.eSignaturePerMonth === "" ||
                            subscriptionPackageObj.eSignaturePerMonth === null
                              ? 0
                              : subscriptionPackageObj.eSignaturePerMonth
                                  ?.toString()
                                  .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                          }
                          onChange={(e) => {
                            let inputValue = e.target.value;
                            // Remove leading zeros
                            inputValue = inputValue.replace(/^0+/, "");
                            // Remove non-numeric characters except decimal point
                            inputValue = inputValue.replace(/[^\d]/g, "");
                            // Limit to 12 digits before the decimal point
                            if (inputValue.includes(".")) {
                              const [integerPart, decimalPart] =
                                inputValue.split(".");
                              inputValue = `${integerPart.slice(
                                0,
                                7,
                              )}.${decimalPart.slice(0, 2)}`;
                            } else {
                              inputValue = inputValue.slice(0, 7);
                            }

                            setSubscriptionPackageObj({
                              ...subscriptionPackageObj,
                              eSignaturePerMonth: inputValue,
                            });
                          }}
                          disabled={
                            !(
                              subscriptionPackageObj.sendContract &&
                              subscriptionPackageObj.prepareContract
                            )
                          }
                        />
                      </div>
                      {requireErrorMessageForESignature &&
                      subscriptionPackageObj.sendContract &&
                      Number(subscriptionPackageObj.eSignaturePerMonth) < 1 ? (
                        <label className="validation mb-1">
                          The E-Signature per month must be at least 1.
                        </label>
                      ) : (
                        ""
                      )}
                    </div>
                  </div>
                  {/* PDF TO CSV Starts */}
                  <div className="fieldset-group" id="ESignature">
                    <label htmlFor="" className="fieldset-group-label required">
                      PDF To CSV
                    </label>
                    <div class="row">
                      <div class="col-lg-3 col-md-3 col-sm-6 text-start text-md-end mt-2">
                        <label class="form-label">
                          Enable PDF to CSV Conversion
                        </label>
                      </div>
                      <div
                        class="col-lg-3 col-md-3 col-sm-6"
                        style={{ display: "flex", alignItems: "center" }}
                      >
                        <div style={{ width: "40px", marginBottom: "5px" }}>
                          {subscriptionPackageObj.enablePdfToCsv ? "Yes" : "No"}
                        </div>
                        <FormGroup>
                          <FormControlLabel
                            control={
                              <Android12Switch
                                checked={subscriptionPackageObj.enablePdfToCsv}
                                onClick={handlePDFToCSVChange}
                              />
                            }
                          />
                        </FormGroup>
                      </div>

                      {/* Pages per month Current */}

                      <div class="col-lg-6 col-md-6 col-sm-6 text-start text-md-end mt-2 p-2">
                        <TextField
                          label={<span>Pages per month </span>}
                          id="outlined-basic"
                          variant="outlined"
                          type="text"
                          InputLabelProps={{
                            sx: {
                              fontWeight: "bold",
                            },
                          }}
                          size="small"
                          // value={subscriptionPackageObj?.pages}
                          value={
                            subscriptionPackageObj?.pages === "" ||
                            subscriptionPackageObj?.pages === null
                              ? 0
                              : subscriptionPackageObj?.pages
                                  ?.toString()
                                  .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                          }
                          onChange={(e) => {
                            setErrorMessage("");
                            let inputValue = e.target.value;

                            // Remove all non-digit characters (including decimal point)
                            inputValue = inputValue.replace(/\D/g, ""); // \D = anything not a digit

                            // Remove leading zeros
                            inputValue = inputValue.replace(/^0+/, "");

                            // Limit to maximum 7 digits (or any limit you want)
                            inputValue = inputValue.slice(0, 7);

                            setSubscriptionPackageObj({
                              ...subscriptionPackageObj,
                              pages: inputValue,
                            });
                          }}
                        />
                        {requireErrorMessage &&
                        (subscriptionPackageObj.pages === "" ||
                          subscriptionPackageObj.pages === undefined ||
                          subscriptionPackageObj.pages === null) ? (
                          <label className="validation">{ERROR_MESSAGES}</label>
                        ) : (
                          ""
                        )}
                      </div>

                      {/* Pages per month E# */}
                      {/* <div
                        className="col-2"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <label className="text-center">
                          Pages
                          <span className="text-danger">*</span>
                        </label>
                      </div>
                      <div className="col-4 ">
                        <input
                          type="text"
                          className="input-text"
                          placeholder="Pages"
                          value={subscriptionPackageObj?.pages}
                          onChange={(e) => {
                            setErrorMessage("");
                            let inputValue = e.target.value;

                            // Remove all non-digit characters (including decimal point)
                            inputValue = inputValue.replace(/\D/g, ""); // \D = anything not a digit

                            // Remove leading zeros
                            inputValue = inputValue.replace(/^0+/, "");

                            // Limit to maximum 7 digits (or any limit you want)
                            inputValue = inputValue.slice(0, 7);

                            setSubscriptionPackageObj({
                              ...subscriptionPackageObj,
                              pages: inputValue,
                            });
                          }}
                        />

                        {requireErrorMessage &&
                        (subscriptionPackageObj.pages === "" ||
                          subscriptionPackageObj.pages === undefined ||
                          subscriptionPackageObj.pages === null) ? (
                          <label className="validation">{ERROR_MESSAGES}</label>
                        ) : (
                          ""
                        )}
                      </div> */}
                    </div>
                  </div>
                  {/* PDF TO CSV Ends */}

                  {/* Bookkeeping subscription start  */}

                  <div className="row p-2">
                    <div className="fieldset-group ">
                      <label className="fieldset-group-label required">
                        Bookkeeping Subscriptions
                      </label>
                      <div class="row">
                        <div class="col-lg-3 col-md-3 col-sm-6 text-start text-md-end mt-2">
                          <label class="form-label">Xero</label>
                        </div>
                        <div
                          class="col-lg-3 col-md-3 col-sm-6"
                          style={{ display: "flex", alignItems: "center" }}
                        >
                          <div style={{ width: "40px", marginBottom: "5px" }}>
                            {subscriptionPackageObj.enableXERO ? "Yes" : "No"}
                          </div>
                          <FormGroup>
                            <FormControlLabel
                              control={
                                <Android12Switch
                                  checked={subscriptionPackageObj.enableXERO}
                                  onClick={(e) =>
                                    setSubscriptionPackageObj({
                                      ...subscriptionPackageObj,
                                      enableXERO:
                                        !subscriptionPackageObj.enableXERO,
                                    })
                                  }
                                />
                              }
                            />
                          </FormGroup>
                        </div>
                        {/* </div>

                      <div class="row"> */}
                        <div class="col-lg-3 col-md-3 col-sm-6 text-start text-md-end mt-2">
                          <label class="form-label">Quickbooks</label>
                        </div>
                        <div
                          class="col-lg-3 col-md-3 col-sm-6"
                          style={{ display: "flex", alignItems: "center" }}
                        >
                          <div style={{ width: "40px", marginBottom: "5px" }}>
                            {subscriptionPackageObj.enableQBO ? "Yes" : "No"}
                          </div>
                          <FormGroup>
                            <FormControlLabel
                              control={
                                <Android12Switch
                                  checked={subscriptionPackageObj.enableQBO}
                                  onClick={(e) => {
                                    setSubscriptionPackageObj({
                                      ...subscriptionPackageObj,
                                      enableQBO:
                                        !subscriptionPackageObj.enableQBO,
                                    });
                                  }}
                                />
                              }
                            />
                          </FormGroup>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Bookkeeping subscription end  */}

                  {/* ai agent subscription start  */}

                  <div className="row p-2">
                    <div className="fieldset-group ">
                      <label className="fieldset-group-label required">
                        Ai Agent Subscription
                      </label>
                      <div class="row">
                        <div class="col-lg-3 col-md-3 col-sm-6 text-start text-md-end mt-2">
                          <label class="form-label">Enable Ai Agent</label>
                        </div>
                        <div
                          class="col-lg-3 col-md-3 col-sm-6"
                          style={{ display: "flex", alignItems: "center" }}
                        >
                          <div style={{ width: "40px", marginBottom: "5px" }}>
                            {subscriptionPackageObj.enableAIAgent
                              ? "Yes"
                              : "No"}
                          </div>
                          <FormGroup>
                            <FormControlLabel
                              control={
                                <Android12Switch
                                  checked={subscriptionPackageObj.enableAIAgent}
                                  onClick={handleAiAgentChange}
                                />
                              }
                            />
                          </FormGroup>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ai agent subscription end  */}
                  <div className="fieldset-group">
                    <label htmlFor="" className="fieldset-group-label required">
                      Other
                    </label>
                    <div class="row">
                      <div class="col-lg-3 col-md-3 col-sm-6 text-start text-md-end mt-2">
                        <label class="form-label">
                          Personalized Outgoing Mailbox
                        </label>
                      </div>
                      <div
                        class="col-lg-3 col-md-3 col-sm-6"
                        style={{ display: "flex", alignItems: "center" }}
                      >
                        <div style={{ width: "40px", marginBottom: "5px" }}>
                          {subscriptionPackageObj.isMailBox ? "Yes" : "No"}
                        </div>
                        <FormGroup>
                          <FormControlLabel
                            control={
                              <Android12Switch
                                checked={subscriptionPackageObj.isMailBox}
                                onClick={(e) => {
                                  setSubscriptionPackageObj({
                                    ...subscriptionPackageObj,
                                    isMailBox:
                                      !subscriptionPackageObj.isMailBox,
                                  });
                                }}
                              />
                            }
                          />
                        </FormGroup>
                      </div>
                      {subscriptionPackageObj.prepareQuote && (
                        <>
                          <div class="col-lg-3 col-md-3 col-sm-6 text-start text-md-end mt-2">
                            <label class="form-label">
                              Web Based {proposalName}
                            </label>
                          </div>
                          <div
                            class="col-lg-3 col-md-3 col-sm-6"
                            style={{ display: "flex", alignItems: "center" }}
                          >
                            <div style={{ width: "40px", marginBottom: "5px" }}>
                              {subscriptionPackageObj.enableWebBasedProposal
                                ? "Yes"
                                : "No"}
                            </div>
                            <FormGroup>
                              <FormControlLabel
                                control={
                                  <Android12Switch
                                    checked={
                                      subscriptionPackageObj.enableWebBasedProposal
                                    }
                                    onClick={(e) => {
                                      setSubscriptionPackageObj({
                                        ...subscriptionPackageObj,
                                        enableWebBasedProposal:
                                          !subscriptionPackageObj.enableWebBasedProposal,
                                      });
                                    }}
                                  />
                                }
                              />
                            </FormGroup>
                          </div>
                        </>
                      )}
                      {/* <div class="col-lg-6 col-md-6 col-sm-6 text-start text-md-end mt-2 p-2">
                        <TextField
                          label={<span>Yearly value for the plan </span>}
                          id="outlined-basic"
                          variant="outlined"
                          type="text"
                          InputLabelProps={{
                            sx: {
                              fontWeight: "bold",
                            },
                          }}
                          size="small"
                          value={
                            subscriptionPackageObj?.yearlyValuePlan === "" ||
                            subscriptionPackageObj?.yearlyValuePlan === null
                              ? 0
                              : subscriptionPackageObj?.yearlyValuePlan
                                  ?.toString()
                                  .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                          }
                          onChange={(e) => {
                            setErrorMessage("");
                            let inputValue = e.target.value;
                            // Remove leading zeros
                            inputValue = inputValue.replace(/^0+/, "");
                            // Remove non-numeric characters except decimal point
                            inputValue = inputValue.replace(/[^\d.]/g, "");
                            // Limit to 12 digits before the decimal point
                            if (inputValue.includes(".")) {
                              const [integerPart, decimalPart] =
                                inputValue.split(".");
                              inputValue = `${integerPart.slice(
                                0,
                                7,
                              )}.${decimalPart.slice(0, 2)}`;
                            } else {
                              inputValue = inputValue.slice(0, 7);
                            }
                            setDiscountPriceError(false);
                            // Add commas to the number
                            inputValue = inputValue;
                            setSubscriptionPackageObj({
                              ...subscriptionPackageObj,
                              yearlyValuePlan: inputValue,
                            });
                          }}
                        />
                      </div> */}
                    </div>
                  </div>
                  <div className="fieldset-group">
                    <label htmlFor="" className="fieldset-group-label required">
                      Fees
                    </label>
                    <div class="row">
                      <div class="col-lg-6 col-md-6 col-sm-6 text-start mt-2 p-2">
                        <TextField
                          label={<span>Yearly value for the plan </span>}
                          id="outlined-basic"
                          variant="outlined"
                          type="text"
                          InputLabelProps={{
                            sx: {
                              fontWeight: "bold",
                            },
                          }}
                          size="small"
                          value={
                            subscriptionPackageObj?.yearlyValuePlan === "" ||
                            subscriptionPackageObj?.yearlyValuePlan === null
                              ? 0
                              : subscriptionPackageObj?.yearlyValuePlan
                                  ?.toString()
                                  .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                          }
                          onChange={(e) => {
                            setErrorMessage("");
                            let inputValue = e.target.value;
                            // Remove leading zeros
                            inputValue = inputValue.replace(/^0+/, "");
                            // Remove non-numeric characters except decimal point
                            inputValue = inputValue.replace(/[^\d.]/g, "");
                            // Limit to 12 digits before the decimal point
                            if (inputValue.includes(".")) {
                              const [integerPart, decimalPart] =
                                inputValue.split(".");
                              inputValue = `${integerPart.slice(
                                0,
                                7,
                              )}.${decimalPart.slice(0, 2)}`;
                            } else {
                              inputValue = inputValue.slice(0, 7);
                            }
                            setDiscountPriceError(false);
                            // Add commas to the number
                            inputValue = inputValue;
                            setSubscriptionPackageObj({
                              ...subscriptionPackageObj,
                              yearlyValuePlan: inputValue,
                            });
                          }}
                        />
                      </div>
                      <div class="col-lg-6 col-md-6 col-sm-6"></div>
                    </div>
                  </div>
                  {!subscriptionPackageObj.isFreePackage && (
                    <>
                      <hr />
                      <p> Discounts For Annual Bills</p>
                      <div className="row">
                        <div className="mt-3 col-6">
                          <div className="row">
                            <div
                              className="col-2"
                              style={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                              }}
                            >
                              <input
                                type="checkbox"
                                className="check check_tick"
                                style={{
                                  height: "100%",
                                  width: "16px",
                                }}
                                id="flexCheckDefault"
                                checked={
                                  subscriptionPackageObj.discountPercentageYearCheck
                                }
                                onChange={() => {
                                  setSubscriptionPackageObj((prev) => ({
                                    ...prev,
                                    discountPercentageYearCheck:
                                      !subscriptionPackageObj.discountPercentageYearCheck,
                                  }));
                                }}
                              />
                            </div>
                            <div className="col-10">
                              <TextField
                                InputLabelProps={{
                                  sx: {
                                    fontWeight: "bold",
                                  },
                                }}
                                label="Discount(%)"
                                id="outlined-size-small"
                                type="text"
                                size="small"
                                value={
                                  subscriptionPackageObj.discountPercentageYearCheck
                                    ? subscriptionPackageObj.discountPercentageYear ===
                                        "" ||
                                      subscriptionPackageObj.discountPercentageYear ===
                                        null
                                      ? 0
                                      : subscriptionPackageObj.discountPercentageYear
                                    : 0
                                }
                                onChange={(e) => {
                                  let inputValue = e.target.value;
                                  // Remove leading zeros
                                  inputValue = inputValue.replace(/^0+/, "");
                                  // Remove any non-numeric characters except dot
                                  inputValue = inputValue.replace(
                                    /[^0-9.]/g,
                                    "",
                                  );
                                  // Split the input value by decimal point
                                  const parts = inputValue.split(".");
                                  // Ensure the number of parts is not more than 2
                                  if (parts.length > 2) {
                                    return;
                                  }
                                  // If there are more than 1 parts (means decimal point exists)
                                  if (parts.length === 2) {
                                    // Take only the first two parts and join them with a dot
                                    inputValue =
                                      parts[0] + "." + parts[1].slice(0, 2);
                                  }
                                  // Check if the value is a valid number within the range [0, 100]
                                  if (
                                    isNaN(inputValue) ||
                                    inputValue < 0 ||
                                    inputValue > 100
                                  ) {
                                    return;
                                  }
                                  // Set the state with the sanitized value
                                  setSubscriptionPackageObj({
                                    ...subscriptionPackageObj,
                                    discountPercentageYear: inputValue,
                                  });
                                }}
                                disabled={
                                  !subscriptionPackageObj.discountPercentageYearCheck
                                }
                              />
                            </div>
                          </div>
                          {/* row end */}
                        </div>
                        <div className="mt-3 col-6">
                          <div className="row">
                            <div
                              className="col-2"
                              style={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                              }}
                            >
                              <input
                                type="checkbox"
                                className="check check_tick"
                                style={{
                                  height: "100%",
                                  width: "16px",
                                }}
                                id="flexCheckDefault"
                                // checked={
                                //   subscriptionPackageObj.discountPriceYear > 0
                                // }
                                checked={
                                  subscriptionPackageObj.discountPriceYearCheck
                                }
                                onChange={() => {
                                  setSubscriptionPackageObj((prev) => ({
                                    ...prev,
                                    discountPriceYearCheck:
                                      !subscriptionPackageObj.discountPriceYearCheck,
                                  }));
                                }}
                              />
                            </div>
                            <div className="col-10">
                              <TextField
                                InputLabelProps={{
                                  sx: {
                                    fontWeight: "bold",
                                  },
                                }}
                                label={<span>Discounted Price </span>}
                                id="outlined-size-small"
                                type="text"
                                size="small"
                                value={
                                  subscriptionPackageObj?.discountPriceYearCheck
                                    ? subscriptionPackageObj?.discountPriceYear ===
                                        "" ||
                                      subscriptionPackageObj?.discountPriceYear ===
                                        null
                                      ? 0
                                      : subscriptionPackageObj?.discountPriceYear

                                          ?.toString()
                                          .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                                    : 0
                                }
                                onChange={(e) => {
                                  setErrorMessage("");
                                  let inputValue = e.target.value;
                                  // Remove leading zeros
                                  inputValue = inputValue.replace(/^0+/, "");
                                  // Remove non-numeric characters except decimal point
                                  inputValue = inputValue.replace(
                                    /[^\d.]/g,
                                    "",
                                  );
                                  // Limit to 12 digits before the decimal point
                                  if (inputValue.includes(".")) {
                                    const [integerPart, decimalPart] =
                                      inputValue.split(".");
                                    inputValue = `${integerPart.slice(
                                      0,
                                      7,
                                    )}.${decimalPart.slice(0, 2)}`;
                                  } else {
                                    inputValue = inputValue.slice(0, 7);
                                  }
                                  // Add commas to the number
                                  inputValue = inputValue;
                                  const yearlyValue =
                                    subscriptionPackageObj?.yearlyValuePlan;
                                  const discountPrice = inputValue;

                                  if (
                                    !isNaN(discountPrice) &&
                                    discountPrice > yearlyValue
                                  ) {
                                    // If the discount price is greater than the yearly value, set an error or handle it accordingly
                                    // For example, you can display an error message or prevent form submission
                                    // Here, I'm setting an error message to be displayed
                                    setRequireErrorMessage(true);
                                    setDiscountPriceError(true);
                                  } else {
                                    // If the discount price is valid, clear the error message
                                    setDiscountPriceError(false);
                                  }
                                  setSubscriptionPackageObj({
                                    ...subscriptionPackageObj,
                                    discountPriceYear: inputValue,
                                  });
                                }}
                                disabled={
                                  !subscriptionPackageObj.discountPriceYearCheck
                                }
                              />
                              {requireErrorMessage && DiscountPriceError ? (
                                <label className="validation">
                                  Discounted price cannot be greater than the
                                  yearly value for the plan.
                                </label>
                              ) : (
                                ""
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="row">
                        <div className="mt-3 col-6">
                          <div className="row">
                            <div
                              className="col-2"
                              style={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                              }}
                            >
                              <input
                                type="checkbox"
                                className="check check_tick"
                                style={{
                                  height: "100%",
                                  width: "16px",
                                }}
                                id="flexCheckDefault"
                                checked={
                                  subscriptionPackageObj.monthFreeYearCheck
                                }
                                onChange={() => {
                                  setSubscriptionPackageObj((prev) => ({
                                    ...prev,
                                    monthFreeYearCheck:
                                      !subscriptionPackageObj.monthFreeYearCheck,
                                  }));
                                }}
                              />
                            </div>

                            <div className="col-10">
                              <TextField
                                InputLabelProps={{
                                  sx: {
                                    fontWeight: "bold",
                                  },
                                }}
                                label="Months free"
                                id="outlined-size-small"
                                type="text"
                                size="small"
                                value={
                                  subscriptionPackageObj.monthFreeYearCheck
                                    ? subscriptionPackageObj.monthFreeYear ===
                                        "" ||
                                      subscriptionPackageObj.monthFreeYear ===
                                        null
                                      ? 0
                                      : subscriptionPackageObj.monthFreeYear
                                    : 0
                                }
                                onChange={(e) => {
                                  let inputValue = e.target.value;
                                  // Remove non-numeric characters
                                  inputValue = inputValue.replace(/[^\d]/g, "");
                                  // Convert to number
                                  let numericValue = parseInt(inputValue, 10);
                                  // Restrict value to be between 0 and 24
                                  if (isNaN(numericValue) || numericValue < 0) {
                                    numericValue = 0;
                                  } else if (numericValue > 24) {
                                    numericValue = 24;
                                  }
                                  // Set the value
                                  setSubscriptionPackageObj({
                                    ...subscriptionPackageObj,
                                    monthFreeYear: numericValue.toString(),
                                  });
                                }}
                                disabled={
                                  !subscriptionPackageObj.monthFreeYearCheck
                                }
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="row">
                        <div className="mt-3 col-6">
                          <div className="row">
                            <div
                              className="col-2"
                              style={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                              }}
                            >
                              <input
                                type="checkbox"
                                className="check check_tick"
                                style={{
                                  height: "100%",
                                  width: "16px",
                                }}
                                id="flexCheckDefault"
                                // checked={
                                //   subscriptionPackageObj.getMonthsYear > 0
                                // }
                                checked={
                                  subscriptionPackageObj.getMonthsYearCheck
                                }
                                onChange={() => {
                                  setSubscriptionPackageObj((prev) => ({
                                    ...prev,
                                    getMonthsYearCheck:
                                      !subscriptionPackageObj.getMonthsYearCheck,
                                  }));
                                }}
                              />
                            </div>

                            <div class="col-10">
                              <TextField
                                InputLabelProps={{
                                  sx: {
                                    fontWeight: "bold",
                                  },
                                }}
                                label="Months for the Price of"
                                id="outlined-size-small"
                                type="text"
                                size="small"
                                value={
                                  subscriptionPackageObj.getMonthsYearCheck
                                    ? subscriptionPackageObj.getMonthsYear ===
                                        "" ||
                                      subscriptionPackageObj.getMonthsYear ===
                                        null
                                      ? 0
                                      : subscriptionPackageObj.getMonthsYear
                                    : 0
                                }
                                onChange={(e) => {
                                  let inputValue = e.target.value;
                                  // Remove non-numeric characters
                                  inputValue = inputValue.replace(/[^\d]/g, "");
                                  // Convert to number
                                  let numericValue = parseInt(inputValue, 10);
                                  // Restrict value to be between 0 and 24
                                  if (isNaN(numericValue) || numericValue < 0) {
                                    numericValue = 0;
                                  } else if (numericValue > 24) {
                                    numericValue = 24;
                                  }
                                  // Set the value
                                  setSubscriptionPackageObj({
                                    ...subscriptionPackageObj,
                                    getMonthsYear: numericValue.toString(),
                                  });
                                }}
                                disabled={
                                  !subscriptionPackageObj.getMonthsYearCheck
                                }
                              />
                            </div>
                            {/* <div class="col-3">
                  <span
                    for="customerName-field"
                    class="fieldset-label required "
                  >
                    Months for the Price of
                  </span>
                </div> */}
                          </div>
                        </div>

                        <div className="mt-3 col-6">
                          <div className="row">
                            <div className="col-2"></div>
                            <div class="col-10">
                              <TextField
                                InputLabelProps={{
                                  sx: {
                                    fontWeight: "bold",
                                  },
                                }}
                                label="Months"
                                id="outlined-size-small"
                                type="text"
                                size="small"
                                value={
                                  subscriptionPackageObj.inPriceOfMonthYear ===
                                    "" ||
                                  subscriptionPackageObj.inPriceOfMonthYear ===
                                    null
                                    ? 0
                                    : subscriptionPackageObj.inPriceOfMonthYear
                                }
                                onChange={(e) => {
                                  let inputValue = e.target.value;
                                  // Remove non-numeric characters
                                  inputValue = inputValue.replace(/[^\d]/g, "");
                                  // Convert to number
                                  let numericValue = parseInt(inputValue, 10);
                                  // Restrict value to be between 0 and 24
                                  if (isNaN(numericValue) || numericValue < 0) {
                                    numericValue = 0;
                                  } else if (numericValue > 24) {
                                    numericValue = 24;
                                  }
                                  // Set the value
                                  setSubscriptionPackageObj({
                                    ...subscriptionPackageObj,
                                    inPriceOfMonthYear: numericValue.toString(),
                                  });
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <hr />
                      <p>Discounts for Monthly Bills </p>
                      <div className="row">
                        <div className="mt-3 col-6">
                          <div className="row">
                            <div
                              className="col-2"
                              style={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                              }}
                            >
                              <input
                                type="checkbox"
                                className="check check_tick"
                                style={{
                                  height: "100%",
                                  width: "16px",
                                }}
                                id="flexCheckDefault"
                                // checked={
                                //   subscriptionPackageObj.discountPercentageMonth >
                                //   0
                                // }
                                checked={
                                  subscriptionPackageObj.discountPercentageMonthCheck
                                }
                                onChange={() => {
                                  setSubscriptionPackageObj((prev) => ({
                                    ...prev,
                                    discountPercentageMonthCheck:
                                      !subscriptionPackageObj.discountPercentageMonthCheck,
                                  }));
                                }}
                              />
                            </div>
                            <div className="col-10">
                              <TextField
                                InputLabelProps={{
                                  sx: {
                                    fontWeight: "bold",
                                  },
                                }}
                                label="Discount(%)"
                                id="outlined-size-small"
                                type="text"
                                size="small"
                                value={
                                  subscriptionPackageObj.discountPercentageMonthCheck
                                    ? subscriptionPackageObj.discountPercentageMonth ===
                                        "" ||
                                      subscriptionPackageObj.discountPercentageMonth ===
                                        null
                                      ? 0
                                      : subscriptionPackageObj.discountPercentageMonth
                                    : 0
                                }
                                onChange={(e) => {
                                  let inputValue = e.target.value;
                                  // Remove leading zeros
                                  inputValue = inputValue.replace(/^0+/, "");
                                  // Remove any non-numeric characters except dot
                                  inputValue = inputValue.replace(
                                    /[^0-9.]/g,
                                    "",
                                  );
                                  // Split the input value by decimal point
                                  const parts = inputValue.split(".");
                                  // Ensure the number of parts is not more than 2
                                  if (parts.length > 2) {
                                    return;
                                  }
                                  // If there are more than 1 parts (means decimal point exists)
                                  if (parts.length === 2) {
                                    // Take only the first two parts and join them with a dot
                                    inputValue =
                                      parts[0] + "." + parts[1].slice(0, 2);
                                  }
                                  // Check if the value is a valid number within the range [0, 100]
                                  if (
                                    isNaN(inputValue) ||
                                    inputValue < 0 ||
                                    inputValue > 100
                                  ) {
                                    return;
                                  }
                                  // Set the state with the sanitized value
                                  setSubscriptionPackageObj({
                                    ...subscriptionPackageObj,
                                    discountPercentageMonth: inputValue,
                                  });
                                }}
                                disabled={
                                  !subscriptionPackageObj.discountPercentageMonthCheck
                                }
                              />
                            </div>
                          </div>
                          {/* row end */}
                        </div>
                        <div className="mt-3 col-6">
                          <div className="row">
                            <div
                              className="col-2"
                              style={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                              }}
                            >
                              <input
                                type="checkbox"
                                className="check check_tick"
                                style={{
                                  height: "100%",
                                  width: "16px",
                                }}
                                id="flexCheckDefault"
                                // checked={
                                //   subscriptionPackageObj.discountPriceMonth > 0
                                // }
                                checked={
                                  subscriptionPackageObj.discountPriceMonthCheck
                                }
                                onChange={() => {
                                  setSubscriptionPackageObj((prev) => ({
                                    ...prev,
                                    discountPriceMonthCheck:
                                      !subscriptionPackageObj.discountPriceMonthCheck,
                                  }));
                                }}
                              />
                            </div>
                            <div className="col-10">
                              <TextField
                                InputLabelProps={{
                                  sx: {
                                    fontWeight: "bold",
                                  },
                                }}
                                label={<span>Discounted Price </span>}
                                id="outlined-size-small"
                                type="text"
                                size="small"
                                value={
                                  subscriptionPackageObj?.discountPriceMonthCheck
                                    ? subscriptionPackageObj?.discountPriceMonth ===
                                        "" ||
                                      subscriptionPackageObj.discountPriceMonth ===
                                        null
                                      ? 0
                                      : subscriptionPackageObj?.discountPriceMonth
                                          ?.toString()
                                          .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                                    : 0
                                }
                                onChange={(e) => {
                                  setErrorMessage("");
                                  let inputValue = e.target.value;
                                  // Remove leading zeros
                                  inputValue = inputValue.replace(/^0+/, "");
                                  // Remove non-numeric characters except decimal point
                                  inputValue = inputValue.replace(
                                    /[^\d.]/g,
                                    "",
                                  );
                                  // Limit to 12 digits before the decimal point
                                  if (inputValue.includes(".")) {
                                    const [integerPart, decimalPart] =
                                      inputValue.split(".");
                                    inputValue = `${integerPart.slice(
                                      0,
                                      7,
                                    )}.${decimalPart.slice(0, 2)}`;
                                  } else {
                                    inputValue = inputValue.slice(0, 7);
                                  }
                                  // Add commas to the number
                                  inputValue = inputValue;
                                  const yearlyValue =
                                    subscriptionPackageObj?.yearlyValuePlan;
                                  const discountPrice = inputValue;
                                  if (
                                    !isNaN(yearlyValue) &&
                                    !isNaN(discountPrice) &&
                                    discountPrice > yearlyValue
                                  ) {
                                    // If the discount price is greater than the yearly value, set an error or handle it accordingly
                                    // For example, you can display an error message or prevent form submission
                                    // Here, I'm setting an error message to be displayed
                                    setRequireErrorMessage(true);
                                    setDiscountPriceError(true);
                                  } else {
                                    // If the discount price is valid, clear the error message
                                    setDiscountPriceError(false);
                                  }
                                  setSubscriptionPackageObj({
                                    ...subscriptionPackageObj,
                                    discountPriceMonth: inputValue,
                                  });
                                }}
                                disabled={
                                  !subscriptionPackageObj.discountPriceMonthCheck
                                }
                              />

                              {requireErrorMessage && DiscountPriceError ? (
                                <label className="validation">
                                  Discounted price cannot be greater than the
                                  yearly value for the plan.
                                </label>
                              ) : (
                                ""
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="row">
                        <div className="mt-3 col-6">
                          <div className="row">
                            <div
                              className="col-2"
                              style={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                              }}
                            >
                              <input
                                type="checkbox"
                                className="check check_tick"
                                style={{
                                  height: "100%",
                                  width: "16px",
                                }}
                                id="flexCheckDefault"
                                // checked={
                                //   subscriptionPackageObj.monthFreeMonth > 0
                                // }
                                checked={
                                  subscriptionPackageObj.monthFreeMonthCheck
                                }
                                onChange={() => {
                                  setSubscriptionPackageObj((prev) => ({
                                    ...prev,
                                    monthFreeMonthCheck:
                                      !subscriptionPackageObj.monthFreeMonthCheck,
                                  }));
                                }}
                              />
                            </div>

                            <div class="col-10">
                              <TextField
                                InputLabelProps={{
                                  sx: {
                                    fontWeight: "bold",
                                  },
                                }}
                                label="Months free"
                                id="outlined-size-small"
                                type="text"
                                size="small"
                                value={
                                  subscriptionPackageObj?.monthFreeMonthCheck
                                    ? subscriptionPackageObj?.monthFreeMonth ===
                                        "" ||
                                      subscriptionPackageObj?.monthFreeMonth ===
                                        null
                                      ? 0
                                      : subscriptionPackageObj?.monthFreeMonth
                                    : 0
                                }
                                onChange={(e) => {
                                  let inputValue = e.target.value;
                                  // Remove non-numeric characters
                                  inputValue = inputValue.replace(/[^\d]/g, "");
                                  // Convert to number
                                  let numericValue = parseInt(inputValue, 10);
                                  // Restrict value to be between 0 and 24
                                  if (isNaN(numericValue) || numericValue < 0) {
                                    numericValue = 0;
                                  } else if (numericValue > 24) {
                                    numericValue = 24;
                                  }
                                  // Set the value
                                  setSubscriptionPackageObj({
                                    ...subscriptionPackageObj,
                                    monthFreeMonth: numericValue.toString(),
                                  });
                                }}
                                disabled={
                                  !subscriptionPackageObj.monthFreeMonthCheck
                                }
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="row">
                        <div className="mt-3 col-6">
                          <div className="row">
                            <div
                              className="col-2"
                              style={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                              }}
                            >
                              <input
                                type="checkbox"
                                className="check check_tick"
                                style={{
                                  height: "100%",
                                  width: "16px",
                                }}
                                id="flexCheckDefault"
                                // checked={
                                //   subscriptionPackageObj.getMonthsMonth > 0
                                // }
                                checked={
                                  subscriptionPackageObj.getMonthsMonthCheck
                                }
                                onChange={() => {
                                  setSubscriptionPackageObj((prev) => ({
                                    ...prev,
                                    getMonthsMonthCheck:
                                      !subscriptionPackageObj.getMonthsMonthCheck,
                                  }));
                                }}
                              />
                            </div>

                            <div class="col-10">
                              <TextField
                                InputLabelProps={{
                                  sx: {
                                    fontWeight: "bold",
                                  },
                                }}
                                label="Months for the Price of"
                                id="outlined-size-small"
                                type="text"
                                size="small"
                                value={
                                  subscriptionPackageObj?.getMonthsMonthCheck
                                    ? subscriptionPackageObj?.getMonthsMonth ===
                                        "" ||
                                      subscriptionPackageObj?.getMonthsMonth ===
                                        null
                                      ? 0
                                      : subscriptionPackageObj?.getMonthsMonth
                                    : 0
                                }
                                onChange={(e) => {
                                  let inputValue = e.target.value;
                                  // Remove non-numeric characters
                                  inputValue = inputValue.replace(/[^\d]/g, "");
                                  // Convert to number
                                  let numericValue = parseInt(inputValue, 10);
                                  // Restrict value to be between 0 and 24
                                  if (isNaN(numericValue) || numericValue < 0) {
                                    numericValue = 0;
                                  } else if (numericValue > 24) {
                                    numericValue = 24;
                                  }
                                  // Set the value
                                  setSubscriptionPackageObj({
                                    ...subscriptionPackageObj,
                                    getMonthsMonth: numericValue.toString(),
                                  });
                                }}
                                disabled={
                                  !subscriptionPackageObj.getMonthsMonthCheck
                                }
                              />
                            </div>
                            {/* <div class="col-3">
                  <span
                    for="customerName-field"
                    class="fieldset-label required "
                  >
                    Months for the Price of
                  </span>
                </div> */}
                          </div>
                        </div>

                        <div className="mt-3 col-6">
                          <div className="row">
                            <div className="col-2"></div>
                            <div class="col-10">
                              <TextField
                                InputLabelProps={{
                                  sx: {
                                    fontWeight: "bold",
                                  },
                                }}
                                label="Months"
                                id="outlined-size-small"
                                type="text"
                                size="small"
                                value={
                                  subscriptionPackageObj?.inPriceOfMonthMonth ===
                                    "" ||
                                  subscriptionPackageObj?.inPriceOfMonthMonth ===
                                    null
                                    ? 0
                                    : subscriptionPackageObj?.inPriceOfMonthMonth
                                }
                                onChange={(e) => {
                                  let inputValue = e.target.value;
                                  // Remove non-numeric characters
                                  inputValue = inputValue.replace(/[^\d]/g, "");
                                  // Convert to number
                                  let numericValue = parseInt(inputValue, 10);
                                  // Restrict value to be between 0 and 24
                                  if (isNaN(numericValue) || numericValue < 0) {
                                    numericValue = 0;
                                  } else if (numericValue > 24) {
                                    numericValue = 24;
                                  }
                                  // Set the value
                                  setSubscriptionPackageObj({
                                    ...subscriptionPackageObj,
                                    inPriceOfMonthMonth:
                                      numericValue.toString(),
                                  });
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
              <label
                style={{ display: "flex", justifyContent: "center" }}
                className="validation mt-2"
                id="ErrorMessage"
              >
                {errorMessage}
              </label>
              <hr />
              <Row class="modal-footer">
                <Col
                  style={{ paddingTop: "14px" }}
                  class="hstack gap-2 justify-content-end"
                >
                  <button
                    type="submit"
                    style={{ float: "right", paddingTop: "5px" }}
                    className="btn btn-md btn-success create-item-btn"
                    onClick={SubscriptionPackageAddUpdateBtnClicked}
                    disabled={DiscountPriceError}
                  >
                    <span>
                      {modelAction === "Add" ? "Add " + moduleName : "Update"}
                    </span>
                  </button>

                  <button
                    style={{
                      float: "right",
                      paddingTop: "5px",
                      marginRight: "10px",
                    }}
                    onClick={handleSubmit}
                    class="btn btn-md btn-light"
                  >
                    <span>Cancel</span>
                  </button>
                </Col>
              </Row>
            </div>
          </div>
        </div>
      </div>

      <SuccessModal
        handleClose={HandleClose}
        setOpenSuccessModal={setOpenSuccessModal}
        openSuccessModal={openSuccessModal}
        modelAction={modelAction}
        message={`Subscription package ${subscriptionPackageObj.packageName}`}
      />
    </div>
  );
}

export default SubscriptionPackageModel;
