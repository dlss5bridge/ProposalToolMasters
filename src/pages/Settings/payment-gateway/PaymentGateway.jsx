/* global $ */
import React, { useEffect, useState, useRef, useContext } from "react";
import "./PaymentGatewayStyle.css";
import SuccessModal from "../../../components/SuccessModal";
import goCardless from "../../../assets/images/gocardless-logo.png";
import stripe from "../../../assets/images/stripe-logo.png";
import {
  AddUpdatePaymentGateway,
  ChangeDefaultPaymentGateways,
  GetPaymentGatewayModel,
} from "../../../redux/Services/Setting/PaymentGatewayApi";
import { useSelector } from "react-redux";
import { ERROR_MESSAGES } from "../../../components/GlobalMessage";
import { AuthContextProvider } from "../../../AuthContext/AuthContext";
import Footer from "../../../components/Footer";
import ConfirmModel from "../../../components/ConfirmationBox";
import { ChangeDefaultPaymentGatewaysTypes } from "../../../Middleware/enums";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Android12Switch from "../../../components/AndroidSwitch";
import Tooltip from "@mui/material/Tooltip";
import ErrorModel from "../../../components/ErrorModel";
const Payment_Gateway = () => {
  // A] States Declaration :
  const modalRef = useRef(null);

  const [dismissModal, setDismissModal] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [openSuccessModal, setOpenSuccessModal] = React.useState(false);
  const [isAddUpdateActionDone, setIsAddUpdateActionDone] = useState(false);
  const [modelRequestData, setModelRequestData] = useState({
    Action: null,
    status: null,
    StatusType: null,
    PaymentGatewayID: null,
    moduleName: "",
  });

  const [paymentGatewayObj, setPaymentGatewayObj] = useState({
    userKeyID: null,
    goCardlessAccessToken: undefined,
    stripePublishableKey: undefined,
    stripeSecretKey: undefined,
    bankTransferName: null,
    AccountNumber: null,
    sortCode: null,
    isDefault: null,
    PaymentGatewayID: null,
  });
  const [openErrorModal, setOpenErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [RequireGoCardLessErrorMessage, setRequireGoCardLessErrorMessage] =
    useState(false);
  const [RequireStripeErrorMessage, setRequireStripeErrorMessage] =
    useState(false);
  const [RequireBankTransferErrorMessage, setRequireBankTransferErrorMessage] =
    useState(false);
  const { setLoader, setTopbar, userAccessData, getCrudButtonToolTipName } =
    useContext(AuthContextProvider);
  const common = useSelector((state) => state.Storage); //Getting Logged Users Details From Persist Storage of redux hooks

  // B] Initial useEffect : Will call when Add/Update button click from list page
  useEffect(() => {
    setTopbar("block");
  }, []);

  useEffect(() => {
    if (common.organisationKeyID !== null) {
      GetPaymentGatewayModelData(common.organisationKeyID);
    }
  }, [common.organisationKeyID]);

  // F] Calling CRUD Api here
  // 1) Get Model Data Api
  const isInvalidInput = (value, length = null) =>
    !value || (length !== null && value.replace(/-/g, "").length !== length);
  const GetPaymentGatewayModelData = async (id) => {
    if (!id) {
      return;
    }
    try {
      const data = await GetPaymentGatewayModel(id);

      if (data?.data?.statusCode === 200) {
        if (data?.data?.responseData?.data) {
          const ModelData = data?.data?.responseData?.data;
          setPaymentGatewayObj({
            ...paymentGatewayObj,
            // keyID: ModelData.KeyID,
            userKeyID: common.userKeyID,
            goCardlessAccessToken:
              ModelData.goCardlessAccessToken === null
                ? ""
                : ModelData.goCardlessAccessToken,
            stripePublishableKey:
              ModelData.stripePublishableKey === null
                ? ""
                : ModelData.stripePublishableKey,
            stripeSecretKey:
              ModelData.stripeSecretKey === null
                ? ""
                : ModelData.stripeSecretKey,
            organisationKeyID: ModelData.organisationKeyID,
            bankTransferName:
              ModelData.bankTransferName === null
                ? ""
                : ModelData.bankTransferName,
            AccountNumber:
              ModelData.accountNumber === null ? "" : ModelData.accountNumber,
            PaymentGatewayID: ModelData.defaultPaymentGatewayID,
            sortCode: ModelData.authenticationCode
              ? ModelData.authenticationCode.replace(/(\d{2})(?=\d)/g, "$1-")
              : "",
          });
          setModelRequestData({
            ...modelRequestData,
            PaymentGatewayID: ModelData.defaultPaymentGatewayID,
          });
        }
      } else {
        setErrorMessage(data?.data?.errorMessage);
      }
    } catch (error) {
      console.log(error);
    }
  };
  //Reset Function
  const HandleResetModalFunction = () => {
    if (modelRequestData.moduleName === "Bank Transfer") {
      if (
        !paymentGatewayObj.bankTransferName &&
        !paymentGatewayObj.AccountNumber &&
        !paymentGatewayObj.sortCode
      ) {
        setOpenErrorModal(true);
        setErrorMessage("All fields are already empty. No action needed.");
        return;
      }
      if (
        paymentGatewayObj.PaymentGatewayID ===
        ChangeDefaultPaymentGatewaysTypes.BankTransfer
      ) {
        setErrorMessage(
          "To reset this payment gateway, please set it to not default first.",
        );
        setOpenErrorModal(true);
        return false;
      }
      const ApiRequest_ParamsObj = {
        //global level params : fixed
        organisationKeyID: common.organisationKeyID,
        userKeyID: common.userKeyID,

        //form level params : will change according to module
        bankTransferName: null,
        accountNumber: null,
        authenticationCode: null,
        goCardlessAccessToken: paymentGatewayObj.goCardlessAccessToken,
        stripePublishableKey: paymentGatewayObj.stripePublishableKey,
        stripeSecretKey: paymentGatewayObj.stripeSecretKey,
        paymentGateWayType: "BankTransfer",
      };

      AddUpdatePaymentGatewayData(ApiRequest_ParamsObj);
    } else if (modelRequestData.moduleName === "Go cardless") {
      if (!paymentGatewayObj.goCardlessAccessToken) {
        setOpenErrorModal(true);
        setErrorMessage("All fields are already empty. No action needed.");
        return;
      }
      if (
        paymentGatewayObj.PaymentGatewayID ===
        ChangeDefaultPaymentGatewaysTypes.GoCardless
      ) {
        setErrorMessage(
          "To reset this payment gateway, please set it to not default first.",
        );
        setOpenErrorModal(true);
        return false;
      }
      const ApiRequest_ParamsObj = {
        //global level params : fixed
        organisationKeyID: common.organisationKeyID,
        userKeyID: common.userKeyID,

        //form level params : will change according to module
        bankTransferName: paymentGatewayObj.bankTransferName,
        accountNumber: paymentGatewayObj.AccountNumber,
        authenticationCode: paymentGatewayObj.sortCode.replace(/-/g, ""),
        goCardlessAccessToken: null,
        stripePublishableKey: paymentGatewayObj.stripePublishableKey,
        stripeSecretKey: paymentGatewayObj.stripeSecretKey,
        paymentGateWayType: "GoCardlessAccess",
      };

      AddUpdatePaymentGatewayData(ApiRequest_ParamsObj);
    } else if (modelRequestData.moduleName === "Stripe") {
      if (
        !paymentGatewayObj.stripePublishableKey &&
        !paymentGatewayObj.stripeSecretKey
      ) {
        setOpenErrorModal(true);
        setErrorMessage("All fields are already empty. No action needed.");
        return;
      }
      if (
        paymentGatewayObj.PaymentGatewayID ===
        ChangeDefaultPaymentGatewaysTypes.Stripe
      ) {
        setErrorMessage(
          "To reset this payment gateway, please set it to not default first.",
        );
        setOpenErrorModal(true);
        return false;
      }
      const ApiRequest_ParamsObj = {
        //global level params : fixed
        organisationKeyID: common.organisationKeyID,
        userKeyID: common.userKeyID,

        //form level params : will change according to module
        bankTransferName: paymentGatewayObj.bankTransferName,
        accountNumber: paymentGatewayObj.AccountNumber,
        authenticationCode: paymentGatewayObj.sortCode.replace(/-/g, ""),
        goCardlessAccessToken: paymentGatewayObj.goCardlessAccessToken,
        stripePublishableKey: null,
        stripeSecretKey: null,
        paymentGateWayType: "Stripe",
      };

      AddUpdatePaymentGatewayData(ApiRequest_ParamsObj);
    }
  };
  // 2) Add Update Button Click Function
  const PaymentGatewayGoCardlessAddUpdateBtnClicked = () => {
    setSuccessMessage("Access Token");
    //Check Validations will be done here
    if (
      !paymentGatewayObj.goCardlessAccessToken ||
      paymentGatewayObj.goCardlessAccessToken === "" ||
      paymentGatewayObj.goCardlessAccessToken.trim() === ""
    ) {
      setRequireGoCardLessErrorMessage(true);
      setRequireStripeErrorMessage(false);
      setRequireBankTransferErrorMessage(false);

      return false; // Return false or handle your error logic here if needed.
    } else {
      setRequireGoCardLessErrorMessage(""); // Clear the error message if there are no errors.
    }
    setModelRequestData({
      ...modelRequestData,

      Action: null,
    });
    // Preparing Object For Add Update and if any modification then it will done here
    const ApiRequest_ParamsObj = {
      //global level params : fixed
      organisationKeyID: common.organisationKeyID,
      userKeyID: common.userKeyID,

      //form level params : will change according to module
      bankTransferName: paymentGatewayObj.bankTransferName,
      accountNumber: paymentGatewayObj.AccountNumber,
      authenticationCode: paymentGatewayObj.sortCode.replace(/-/g, ""),
      goCardlessAccessToken: paymentGatewayObj.goCardlessAccessToken,
      stripePublishableKey: paymentGatewayObj.stripePublishableKey,
      stripeSecretKey: paymentGatewayObj.stripeSecretKey,
      paymentGateWayType: "GoCardlessAccess",
    };

    AddUpdatePaymentGatewayData(ApiRequest_ParamsObj);
  };
  const PaymentGatewayBankTransferAddUpdateBtnClicked = () => {
    setSuccessMessage("Bank Transfer");
    // Validation for Bank Transfer inputs
    if (
      isInvalidInput(paymentGatewayObj.bankTransferName) ||
      isInvalidInput(paymentGatewayObj.sortCode, 6) ||
      isInvalidInput(paymentGatewayObj.AccountNumber, 8)
    ) {
      setRequireBankTransferErrorMessage(true);
      setRequireStripeErrorMessage(false);
      setRequireGoCardLessErrorMessage(false);
      return false; // Validation failed, terminate further execution.
    }

    // Reset error message on successful validation
    setRequireBankTransferErrorMessage(false);

    // Prepare request data for Add/Update operation
    setModelRequestData((prev) => ({
      ...prev,
      Action: null, // Reset or set specific action if needed
    }));

    const ApiRequest_ParamsObj = {
      // Global parameters
      organisationKeyID: common.organisationKeyID,
      userKeyID: common.userKeyID,

      // Form-specific parameters
      bankTransferName: paymentGatewayObj.bankTransferName,
      accountNumber: paymentGatewayObj.AccountNumber,
      authenticationCode: paymentGatewayObj.sortCode.replace(/-/g, ""),
      paymentGateWayType: "BankTransfer",
    };

    // Trigger Add/Update API call
    AddUpdatePaymentGatewayData(ApiRequest_ParamsObj);
  };
  const PaymentGatewayStripeAddUpdateBtnClicked = () => {
    //Check Validations will be done here
    setSuccessMessage("Publishable key and secret key");
    if (
      !paymentGatewayObj.stripePublishableKey ||
      paymentGatewayObj.stripePublishableKey === "" ||
      paymentGatewayObj.stripePublishableKey.trim() === ""
    ) {
      setRequireStripeErrorMessage(true);
      setRequireGoCardLessErrorMessage(false);
      setRequireBankTransferErrorMessage(false);
      return false; // Return false or handle your error logic here if needed.
    } else if (
      !paymentGatewayObj.stripeSecretKey ||
      paymentGatewayObj.stripeSecretKey === "" ||
      paymentGatewayObj.stripeSecretKey.trim() === ""
    ) {
      setRequireStripeErrorMessage(true);
      setRequireGoCardLessErrorMessage(false);
      return false;
    } else {
      setRequireStripeErrorMessage(""); // Clear the error message if there are no errors.
    }
    setModelRequestData({
      ...modelRequestData,

      Action: null,
    });
    // Preparing Object For Add Update and if any modification then it will done here
    const ApiRequest_ParamsObj = {
      //global level params : fixed
      organisationKeyID: common.organisationKeyID,
      userKeyID: common.userKeyID,

      //form level params : will change according to module
      bankTransferName: paymentGatewayObj.bankTransferName,
      accountNumber: paymentGatewayObj.AccountNumber,
      authenticationCode: paymentGatewayObj.sortCode.replace(/-/g, ""),
      goCardlessAccessToken: paymentGatewayObj.goCardlessAccessToken,
      stripePublishableKey: paymentGatewayObj.stripePublishableKey,
      stripeSecretKey: paymentGatewayObj.stripeSecretKey,

      paymentGateWayType: "Stripe",
    };

    AddUpdatePaymentGatewayData(ApiRequest_ParamsObj);
  };

  // Add or Update payment gateway Data
  const AddUpdatePaymentGatewayData = async (apiRequestParams, Type) => {
    setLoader(true);
    try {
      let url = "/AddUpdatePaymentGateways"; // Default URL for Adding Data
      if (apiRequestParams.Action === "Update") {
        url = `/AddUpdatePaymentGateways?Action=${apiRequestParams.Action}`; // URL for Updating Data
      }
      const response = await AddUpdatePaymentGateway(url, apiRequestParams);
      if (response) {
        setLoader(false);
        if (response?.data?.statusCode === 200) {
          if (Type === "changeStatus") {
            return;
          }

          if (apiRequestParams.Action === "Update") {
            setOpenSuccessModal(true);
            setIsAddUpdateActionDone(true);
          } else {
            setOpenSuccessModal(true);
            setIsAddUpdateActionDone(true);
          }
        } else {
          setErrorMessage(response?.response?.data?.errorMessage);
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  // handle function
  const handleClose = () => {
    $("#" + "ConfirmModel").modal("hide");
    if (modelRequestData.Action === "ResetPaymentGatewayChange") {
      GetPaymentGatewayModelData(common.organisationKeyID);
    }
    setOpenSuccessModal(false);
    setModelRequestData({
      ...modelRequestData,
      PaymentGatewayID: null,
    });
  };
  const IsValid = (paymentGatewayID) => {
    if (paymentGatewayID === ChangeDefaultPaymentGatewaysTypes.BankTransfer) {
      if (
        paymentGatewayObj.PaymentGatewayID ===
        ChangeDefaultPaymentGatewaysTypes.BankTransfer
      ) {
        setErrorMessage(
          "To disable this as the default payment gateway, please set another payment gateway as the default first.",
        );
        setOpenErrorModal(true);
        return false;
      }
      setSuccessMessage("Bank Transfer");
      setModelRequestData({
        ...modelRequestData,
        Status: null,
        StatusType: null,
        PaymentGatewayID: ChangeDefaultPaymentGatewaysTypes.BankTransfer,
        Action: "PaymentStatus",
      });
      if (
        isInvalidInput(paymentGatewayObj.bankTransferName) ||
        isInvalidInput(paymentGatewayObj.sortCode, 6) ||
        isInvalidInput(paymentGatewayObj.AccountNumber, 8)
      ) {
        setRequireBankTransferErrorMessage(true);
        setRequireStripeErrorMessage(false);
        setRequireGoCardLessErrorMessage(false);
        return false; // Validation failed, terminate further execution.
      }
    } else if (
      paymentGatewayID === ChangeDefaultPaymentGatewaysTypes.GoCardless
    ) {
      if (
        paymentGatewayObj.PaymentGatewayID ===
        ChangeDefaultPaymentGatewaysTypes.GoCardless
      ) {
        setErrorMessage(
          "To disable this as the default payment gateway, please set another payment gateway as the default first.",
        );
        setOpenErrorModal(true);
        return false;
      }
      setSuccessMessage("Access Token");
      setModelRequestData({
        ...modelRequestData,
        Status: null,
        StatusType: null,
        PaymentGatewayID: ChangeDefaultPaymentGatewaysTypes.GoCardless,
        Action: "PaymentStatus",
      });
      if (
        !paymentGatewayObj.goCardlessAccessToken ||
        paymentGatewayObj.goCardlessAccessToken === "" ||
        paymentGatewayObj.goCardlessAccessToken.trim() === ""
      ) {
        setRequireGoCardLessErrorMessage(true);
        setRequireStripeErrorMessage(false);
        setRequireBankTransferErrorMessage(false);

        return false; // Return false or handle your error logic here if needed.
      }
    } else {
      if (
        paymentGatewayObj.PaymentGatewayID ===
        ChangeDefaultPaymentGatewaysTypes.Stripe
      ) {
        setErrorMessage(
          "To disable this as the default payment gateway, please set another payment gateway as the default first.",
        );
        setOpenErrorModal(true);
        return false;
      }
      setSuccessMessage("Publishable key and secret key");
      setModelRequestData({
        ...modelRequestData,
        Status: null,
        StatusType: null,
        PaymentGatewayID: ChangeDefaultPaymentGatewaysTypes.Stripe,
        Action: "PaymentStatus",
      });
      if (
        !paymentGatewayObj.stripePublishableKey ||
        paymentGatewayObj.stripePublishableKey === "" ||
        paymentGatewayObj.stripePublishableKey.trim() === ""
      ) {
        setRequireStripeErrorMessage(true);
        setRequireGoCardLessErrorMessage(false);
        setRequireBankTransferErrorMessage(false);
        return false; // Return false or handle your error logic here if needed.
      }
    }

    $("#" + "ConfirmModel").modal("show");
  };
  const ChangePaymentStatusData = async () => {
    setLoader(true);

    const ApiRequest_ParamsObj = {
      //global level params : fixed
      organisationKeyID: common.organisationKeyID,
      userKeyID: common.userKeyID,

      //form level params : will change according to module
      bankTransferName: paymentGatewayObj.bankTransferName,
      accountNumber: paymentGatewayObj.AccountNumber,
      authenticationCode: paymentGatewayObj.sortCode.replace(/-/g, ""),
      goCardlessAccessToken: paymentGatewayObj.goCardlessAccessToken,
      stripePublishableKey: paymentGatewayObj.stripePublishableKey,
      stripeSecretKey: paymentGatewayObj.stripeSecretKey,
      paymentGateWayType:
        modelRequestData.PaymentGatewayID ===
        ChangeDefaultPaymentGatewaysTypes.BankTransfer
          ? "BankTransfer"
          : modelRequestData.PaymentGatewayID ===
              ChangeDefaultPaymentGatewaysTypes.GoCardless
            ? "GoCardlessAccess"
            : "Stripe",
    };
    AddUpdatePaymentGatewayData(ApiRequest_ParamsObj, "changeStatus");
    if (modelRequestData.Action === "PaymentStatus") {
      if (modelRequestData.StatusType === null) {
        try {
          const data = await ChangeDefaultPaymentGateways(
            common.organisationKeyID,
            common.userKeyID,
            modelRequestData.PaymentGatewayID,
          );
          if (data) {
            setLoader(false);
            if (data?.data?.statusCode === 200) {
              GetPaymentGatewayModelData(common.organisationKeyID);
              setOpenSuccessModal(true);
            } else {
              GetPaymentGatewayModelData(common.organisationKeyID);
              setErrorMessage(data?.response?.data?.errorMessage);
            }
          }
        } catch (error) {
          console.log(error);
        }
      }
    }
  };
  const handleCloseErrorModel = () => {
    setOpenErrorModal(false);
    $("#" + "ConfirmModel").modal("hide");
  };
  //Design part :
  return (
    <div className="payment-gateway-redesign">
      <div className="main-content">
        <div className="payment-gateway-page">
          <div className="payment-gateway-container">
            {/* =========================================
              PAGE TITLE
              ========================================= */}
            <div className="payment-gateway-title-wrap">
              <h1 className="payment-gateway-title">Payment Gateways</h1>
            </div>

            {/* =========================================
              TOP ROW
              ========================================= */}
            <div className="payment-gateway-top-grid">
              {/* =========================================
                GOCARDLESS
                ========================================= */}
              <div className="gateway-card">
                <div className="gateway-card-header">
                  <div className="gateway-heading">
                    <span className="gateway-icon">
                      <i className="bi bi-bank"></i>
                    </span>

                    <h2>GoCardless</h2>
                  </div>

                  <div className="gateway-header-actions">
                    <span
                      className={`gateway-status ${
                        paymentGatewayObj.goCardlessAccessToken
                          ? "gateway-status--configured"
                          : "gateway-status--disabled"
                      }`}
                    >
                      <span className="gateway-status-dot"></span>

                      {paymentGatewayObj.goCardlessAccessToken
                        ? "Configured"
                        : "Not Configured"}
                    </span>

                    <FormGroup className="gateway-switch-group">
                      <FormControlLabel
                        className="gateway-switch-label"
                        control={
                          <Tooltip
                            title={getCrudButtonToolTipName("Change Status")}
                          >
                            <Android12Switch
                              onClick={() =>
                                IsValid(
                                  ChangeDefaultPaymentGatewaysTypes.GoCardless,
                                )
                              }
                              checked={
                                paymentGatewayObj.PaymentGatewayID ===
                                ChangeDefaultPaymentGatewaysTypes.GoCardless
                              }
                            />
                          </Tooltip>
                        }
                      />
                    </FormGroup>
                  </div>
                </div>

                <div className="gateway-card-body">
                  <div className="gateway-field">
                    <label>
                      Access Token
                      <span>*</span>
                    </label>

                    <input
                      className="input-text gateway-input"
                      placeholder="Access Token"
                      type="password"
                      maxLength={50}
                      value={paymentGatewayObj.goCardlessAccessToken}
                      onChange={(e) => {
                        const inputValue = e.target.value;

                        setPaymentGatewayObj({
                          ...paymentGatewayObj,

                          goCardlessAccessToken: inputValue,
                        });
                      }}
                    />

                    <div className="gateway-field-help">
                      Used for authenticating direct debit requests.
                    </div>

                    {RequireGoCardLessErrorMessage &&
                    !paymentGatewayObj.goCardlessAccessToken ? (
                      <label className="validation">{ERROR_MESSAGES}</label>
                    ) : (
                      ""
                    )}
                  </div>
                </div>

                {userAccessData.Admin_Setting_Practice_Config_CanEdit && (
                  <div className="gateway-card-footer">
                    <button
                      className="btn gateway-reset-btn"
                      id="add-btn"
                      data-bs-toggle="modal"
                      data-bs-target="#ConfirmModel"
                      onClick={() => {
                        setModelRequestData({
                          ...modelRequestData,

                          Action: "ResetPaymentGatewayChange",

                          moduleName: "Go cardless",
                        });
                      }}
                    >
                      Reset
                    </button>

                    <button
                      className="btn gateway-save-btn"
                      id="add-btn"
                      onClick={() => {
                        PaymentGatewayGoCardlessAddUpdateBtnClicked();
                      }}
                    >
                      Save Changes
                    </button>
                  </div>
                )}
              </div>

              {/* =========================================
                STRIPE
                ========================================= */}
              <div className="gateway-card">
                <div className="gateway-card-header">
                  <div className="gateway-heading">
                    <span className="gateway-icon">
                      <i className="bi bi-credit-card"></i>
                    </span>

                    <h2>Stripe</h2>
                  </div>

                  <div className="gateway-header-actions">
                    <span
                      className={`gateway-status ${
                        paymentGatewayObj.stripePublishableKey &&
                        paymentGatewayObj.stripeSecretKey
                          ? "gateway-status--configured"
                          : "gateway-status--disabled"
                      }`}
                    >
                      <span className="gateway-status-dot"></span>

                      {paymentGatewayObj.stripePublishableKey &&
                      paymentGatewayObj.stripeSecretKey
                        ? "Configured"
                        : "Not Configured"}
                    </span>

                    <FormGroup className="gateway-switch-group">
                      <FormControlLabel
                        className="gateway-switch-label"
                        control={
                          <Tooltip
                            title={getCrudButtonToolTipName("Change Status")}
                          >
                            <Android12Switch
                              onClick={() =>
                                IsValid(
                                  ChangeDefaultPaymentGatewaysTypes.Stripe,
                                )
                              }
                              checked={
                                paymentGatewayObj.PaymentGatewayID ===
                                ChangeDefaultPaymentGatewaysTypes.Stripe
                              }
                            />
                          </Tooltip>
                        }
                      />
                    </FormGroup>
                  </div>
                </div>

                <div className="gateway-card-body">
                  <div className="gateway-two-columns">
                    <div className="gateway-field">
                      <label>
                        Publishable Key
                        <span>*</span>
                      </label>

                      <input
                        className="input-text gateway-input"
                        placeholder="Publishable Key"
                        value={paymentGatewayObj.stripePublishableKey}
                        onChange={(e) => {
                          const inputValue = e.target.value;

                          const sanitizedValue = inputValue.replace(/\s/g, "");

                          setPaymentGatewayObj({
                            ...paymentGatewayObj,

                            stripePublishableKey: sanitizedValue,
                          });
                        }}
                      />

                      {RequireStripeErrorMessage &&
                      !paymentGatewayObj.stripePublishableKey ? (
                        <label className="validation">{ERROR_MESSAGES}</label>
                      ) : (
                        ""
                      )}
                    </div>

                    <div className="gateway-field">
                      <label>
                        Secret Key
                        <span>*</span>
                      </label>

                      <input
                        className="input-text gateway-input"
                        placeholder="Secret Key"
                        type="password"
                        value={paymentGatewayObj.stripeSecretKey}
                        onChange={(e) => {
                          const inputValue = e.target.value;

                          const sanitizedValue = inputValue.replace(/\s/g, "");

                          setPaymentGatewayObj({
                            ...paymentGatewayObj,

                            stripeSecretKey: sanitizedValue,
                          });
                        }}
                      />

                      {RequireStripeErrorMessage &&
                      !paymentGatewayObj.stripeSecretKey ? (
                        <label className="validation">{ERROR_MESSAGES}</label>
                      ) : (
                        ""
                      )}
                    </div>
                  </div>
                </div>

                {userAccessData.Admin_Setting_Practice_Config_CanEdit && (
                  <div className="gateway-card-footer">
                    <button
                      className="btn gateway-reset-btn"
                      id="add-btn"
                      data-bs-toggle="modal"
                      data-bs-target="#ConfirmModel"
                      onClick={() => {
                        setModelRequestData({
                          ...modelRequestData,

                          Action: "ResetPaymentGatewayChange",

                          moduleName: "Stripe",
                        });
                      }}
                    >
                      Reset
                    </button>

                    <button
                      className="btn gateway-save-btn"
                      id="add-btn"
                      onClick={() => {
                        PaymentGatewayStripeAddUpdateBtnClicked();
                      }}
                    >
                      Save Changes
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* =========================================
              BANK TRANSFER
              ========================================= */}
            <div className="gateway-card gateway-bank-card">
              <div className="gateway-card-header">
                <div className="gateway-heading">
                  <span className="gateway-icon">
                    <i className="bi bi-currency-pound"></i>
                  </span>

                  <h2>Bank Transfer</h2>
                </div>

                <div className="gateway-header-actions">
                  <span
                    className={`gateway-status ${
                      paymentGatewayObj.bankTransferName &&
                      paymentGatewayObj.AccountNumber &&
                      paymentGatewayObj.sortCode
                        ? "gateway-status--configured"
                        : "gateway-status--disabled"
                    }`}
                  >
                    <span className="gateway-status-dot"></span>

                    {paymentGatewayObj.bankTransferName &&
                    paymentGatewayObj.AccountNumber &&
                    paymentGatewayObj.sortCode
                      ? "Configured"
                      : "Not Configured"}
                  </span>

                  <FormGroup className="gateway-switch-group">
                    <FormControlLabel
                      className="gateway-switch-label"
                      control={
                        <Tooltip
                          title={getCrudButtonToolTipName("Change Status")}
                        >
                          <Android12Switch
                            onClick={() =>
                              IsValid(
                                ChangeDefaultPaymentGatewaysTypes.BankTransfer,
                              )
                            }
                            checked={
                              paymentGatewayObj.PaymentGatewayID ===
                              ChangeDefaultPaymentGatewaysTypes.BankTransfer
                            }
                          />
                        </Tooltip>
                      }
                    />
                  </FormGroup>
                </div>
              </div>

              <div className="gateway-card-body">
                <div className="gateway-three-columns">
                  {/* ACCOUNT NAME */}
                  <div className="gateway-field">
                    <label>
                      Account Name
                      <span>*</span>
                    </label>

                    <input
                      className="input-text gateway-input"
                      placeholder="e.g. Acme Accounting Ltd"
                      type="text"
                      value={paymentGatewayObj.bankTransferName}
                      maxLength={100}
                      onChange={(e) => {
                        const inputValue = e.target.value;

                        let sanitizedValue = inputValue.replace(/[0-9]/g, "");

                        sanitizedValue = sanitizedValue
                          .replace(/^\s+/, "")
                          .replace(/\s+/g, " ");

                        const capitalizedValue =
                          sanitizedValue.charAt(0).toUpperCase() +
                          sanitizedValue.slice(1);

                        setPaymentGatewayObj({
                          ...paymentGatewayObj,

                          bankTransferName: capitalizedValue,
                        });
                      }}
                    />

                    {RequireBankTransferErrorMessage &&
                    (paymentGatewayObj.bankTransferName === "" ||
                      paymentGatewayObj.bankTransferName === null ||
                      paymentGatewayObj.bankTransferName === undefined) ? (
                      <label className="validation">{ERROR_MESSAGES}</label>
                    ) : (
                      ""
                    )}
                  </div>

                  {/* ACCOUNT NUMBER */}
                  <div className="gateway-field">
                    <label>
                      Account Number
                      <span>*</span>
                    </label>

                    <input
                      className="input-text gateway-input"
                      placeholder="8 digit number"
                      type="text"
                      value={paymentGatewayObj.AccountNumber}
                      onChange={(e) => {
                        let inputValue = e.target.value;

                        let sanitizedValue = inputValue.replace(/[^0-9]/g, "");

                        setPaymentGatewayObj({
                          ...paymentGatewayObj,

                          AccountNumber: sanitizedValue,
                        });
                      }}
                      maxLength={8}
                    />

                    {RequireBankTransferErrorMessage && (
                      <>
                        {!paymentGatewayObj.AccountNumber ||
                        paymentGatewayObj.AccountNumber.trim() === "" ? (
                          <label className="validation">{ERROR_MESSAGES}</label>
                        ) : (
                          isInvalidInput(
                            paymentGatewayObj.AccountNumber,
                            8,
                          ) && (
                            <label className="validation">
                              Please enter a valid account number consisting of
                              8 digits.
                            </label>
                          )
                        )}
                      </>
                    )}
                  </div>

                  {/* SORT CODE */}
                  <div className="gateway-field">
                    <label>
                      Sort Code
                      <span>*</span>
                    </label>

                    <input
                      className="input-text gateway-input"
                      placeholder="XX-XX-XX"
                      type="text"
                      value={paymentGatewayObj.sortCode}
                      onChange={(e) => {
                        let inputValue = e.target.value;

                        let sanitizedValue = inputValue.replace(/[^0-9]/g, "");

                        if (sanitizedValue.length > 6) {
                          sanitizedValue = sanitizedValue.substring(0, 6);
                        }

                        let formattedValue = sanitizedValue.replace(
                          /(\d{2})(?=\d)/g,
                          "$1-",
                        );

                        setPaymentGatewayObj({
                          ...paymentGatewayObj,

                          sortCode: formattedValue,
                        });
                      }}
                    />

                    {RequireBankTransferErrorMessage && (
                      <>
                        {!paymentGatewayObj.sortCode ||
                        paymentGatewayObj.sortCode.trim() === "" ? (
                          <label className="validation">{ERROR_MESSAGES}</label>
                        ) : (
                          paymentGatewayObj.sortCode.replace(/-/g, "")
                            .length !== 6 && (
                            <label className="validation">
                              Please enter a valid sort code consisting of 6
                              digits.
                            </label>
                          )
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* INFO BOX */}
                <div className="gateway-info-box">
                  <i className="bi bi-info-circle"></i>

                  <span>
                    These details will be displayed on invoices generated for
                    clients who prefer manual bank transfers.
                  </span>
                </div>
              </div>

              {userAccessData.Admin_Setting_Practice_Config_CanEdit && (
                <div className="gateway-card-footer">
                  <button
                    className="btn gateway-reset-btn"
                    id="add-btn"
                    data-bs-toggle="modal"
                    data-bs-target="#ConfirmModel"
                    onClick={() => {
                      setModelRequestData({
                        ...modelRequestData,

                        Action: "ResetPaymentGatewayChange",

                        moduleName: "Bank Transfer",
                      });
                    }}
                  >
                    Reset
                  </button>

                  <button
                    className="btn gateway-save-btn"
                    id="add-btn"
                    onClick={() => {
                      PaymentGatewayBankTransferAddUpdateBtnClicked();
                    }}
                  >
                    Save Details
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* =========================================
        EXISTING COMPONENTS — UNCHANGED
        ========================================= */}

      <button className="btn btn-danger btn-icon" id="back-to-top">
        <i className="ri-arrow-up-line"></i>
      </button>

      <ErrorModel
        ErrorModel={openErrorModal}
        handleClose={handleCloseErrorModel}
        ErrorMessage={errorMessage}
      />

      <SuccessModal
        handleClose={handleClose}
        setDismissModal={setDismissModal}
        setOpenSuccessModal={setOpenSuccessModal}
        openSuccessModal={openSuccessModal}
        modelAction={
          modelRequestData.Action === "PaymentStatus"
            ? "Status"
            : modelRequestData.Action === "ResetPaymentGatewayChange"
              ? null
              : "Update"
        }
        message={
          modelRequestData.Action === "PaymentStatus"
            ? "Status has been changed successfully!"
            : modelRequestData.Action === "ResetPaymentGatewayChange"
              ? `${modelRequestData.moduleName} has been reset successfully!`
              : successMessage
        }
      />

      <ConfirmModel
        openSuccessModal={openSuccessModal}
        modelRequestData={modelRequestData}
        UpdatedStatus={
          modelRequestData.Action === "PaymentStatus"
            ? ChangePaymentStatusData
            : HandleResetModalFunction
        }
        handleClose={handleClose}
      />

      <Footer />
    </div>
  );
};

export default Payment_Gateway;
