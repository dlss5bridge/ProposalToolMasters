/* global $ */
import React, { useEffect, useState, useRef, useContext } from "react";
import { useSelector } from "react-redux";
import SuccessModal from "../components/SuccessModal";
import { AuthContextProvider } from "../AuthContext/AuthContext";
import { AddUpdatePaymentGateway, ChangeDefaultPaymentGateways, GetPaymentGatewayModel } from "../redux/Services/Setting/PaymentGatewayApi";
import ConfirmModel from "./ConfirmationBox";
import { ERROR_MESSAGES } from "./GlobalMessage";
import { ChangeDefaultPaymentGatewaysTypes } from "../Middleware/enums";
import goCardless from "../assets/images/gocardless-logo.png";
import stripe from "../assets/images/stripe-logo.png";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Android12Switch from "./AndroidSwitch";
import Tooltip from "@mui/material/Tooltip";
import "../pages/Settings/payment-gateway/PaymentGatewayStyle.css"
import ErrorModel from "./ErrorModel";
function PaymentGatewayModel(props) {
    const modalRef = useRef(null);
    const common = useSelector((state) => state.Storage); //Getting Logged Users Details From Persist Storage of redux hooks
    const [dismissModal, setDismissModal] = useState(null);
    const [openSuccessModal, setOpenSuccessModal] = React.useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [modelRequestData, setModelRequestData] = useState({
        Action: null,
        status: null,
        StatusType: null,
        PaymentGatewayID: null,
        moduleName: ""
    });
    const [openErrorModal, setOpenErrorModal] = useState(false);
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
    const [errorMessage, setErrorMessage] = useState("");
    const [RequireGoCardLessErrorMessage, setRequireGoCardLessErrorMessage] = useState(false);
    const [RequireStripeErrorMessage, setRequireStripeErrorMessage] = useState(false);
    const [RequireBankTransferErrorMessage, setRequireBankTransferErrorMessage] = useState(false);
    const { setLoader, setTopbar, userAccessData, getCrudButtonToolTipName } =
        useContext(AuthContextProvider);
    useEffect(() => {
        if (common.organisationKeyID !== null) {
            GetPaymentGatewayModelData(common.organisationKeyID);
            props?.setISModalOpen(false)
        }
    }, [common.organisationKeyID, props?.isModalOpen]);

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
                        goCardlessAccessToken: ModelData.goCardlessAccessToken === null ? "" : ModelData.goCardlessAccessToken,
                        stripePublishableKey: ModelData.stripePublishableKey === null ? "" : ModelData.stripePublishableKey,
                        stripeSecretKey: ModelData.stripeSecretKey === null ? "" : ModelData.stripeSecretKey,
                        organisationKeyID: ModelData.organisationKeyID,
                        bankTransferName: ModelData.bankTransferName === null ? "" : ModelData.bankTransferName,
                        AccountNumber: ModelData.accountNumber === null ? "" : ModelData.accountNumber,
                        PaymentGatewayID: ModelData.defaultPaymentGatewayID,
                        sortCode: ModelData.authenticationCode
                            ? ModelData.authenticationCode.replace(/(\d{2})(?=\d)/g, "$1-")
                            : "",
                    });
                    setModelRequestData({
                        ...modelRequestData,
                        PaymentGatewayID: ModelData.defaultPaymentGatewayID,
                    })
                }
            } else {
                setErrorMessage(data?.data?.errorMessage);
            }
        } catch (error) {
            console.log(error);
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
        })
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
        })
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
        setRequireGoCardLessErrorMessage(false)
        setRequireStripeErrorMessage(false)
        setRequireBankTransferErrorMessage(false)
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
                        return
                    }
                    if (apiRequestParams.Action === "Update") {
                        if ($("#" + "ConfirmModel").hasClass("show")) {
                            $("#" + "ConfirmModel").one("hidden.bs.modal", () => {
                                setOpenSuccessModal(true);
                            });
                            $("#" + "ConfirmModel").modal("hide");
                        } else {
                            setOpenSuccessModal(true);
                        }
                        props.setIsAddUpdatePricingActionDone(true);
                    } else {
                        if ($("#" + "ConfirmModel").hasClass("show")) {
                            $("#" + "ConfirmModel").one("hidden.bs.modal", () => {
                                setOpenSuccessModal(true);
                            });
                            $("#" + "ConfirmModel").modal("hide");
                        } else {
                            setOpenSuccessModal(true);
                        }
                        props.setIsAddUpdatePricingActionDone(true);
                    }
                } else {
                    setErrorMessage(response?.response?.data?.errorMessage);
                }
            }
        } catch (error) {
            console.error(error);
        }
    };
    //Reset Function
    const HandleResetModalFunction = () => {
        if (modelRequestData.moduleName === "Bank Transfer") {
            if (!paymentGatewayObj.bankTransferName && !paymentGatewayObj.AccountNumber && !paymentGatewayObj.sortCode) {
                setOpenErrorModal(true)
                setErrorMessage("All fields are already empty. No action needed.")
                return
            }
            if (paymentGatewayObj.PaymentGatewayID === ChangeDefaultPaymentGatewaysTypes.BankTransfer) {
                setErrorMessage("To reset this payment gateway, please set it to not default first.")
                setOpenErrorModal(true)
                return false
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
                setOpenErrorModal(true)
                setErrorMessage("All fields are already empty. No action needed.")
                return
            }
            if (paymentGatewayObj.PaymentGatewayID === ChangeDefaultPaymentGatewaysTypes.GoCardless) {
                setErrorMessage("To reset this payment gateway, please set it to not default first.")
                setOpenErrorModal(true)
                return false
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
            if (!paymentGatewayObj.stripePublishableKey && !paymentGatewayObj.stripeSecretKey) {
                setOpenErrorModal(true)
                setErrorMessage("All fields are already empty. No action needed.")
                return
            }
            if (paymentGatewayObj.PaymentGatewayID === ChangeDefaultPaymentGatewaysTypes.Stripe) {
                setErrorMessage("To reset this payment gateway, please set it to not default first.")
                setOpenErrorModal(true)
                return false
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
    }
    // handle function
    const handleClose = () => {
        if (modelRequestData.Action === "ResetPaymentGatewayChange") {
            GetPaymentGatewayModelData(common.organisationKeyID);

        }
        $("#" + "ConfirmModel").modal("hide");
        $("#" + props.id).modal("hide");
        setOpenSuccessModal(false);
        setModelRequestData({
            ...modelRequestData,
            PaymentGatewayID: null
        })
    };
    const IsValid = (paymentGatewayID) => {
        if (paymentGatewayID === ChangeDefaultPaymentGatewaysTypes.BankTransfer) {
            if (paymentGatewayObj.PaymentGatewayID === ChangeDefaultPaymentGatewaysTypes.BankTransfer) {
                setErrorMessage("To disable this as the default payment gateway, please set another payment gateway as the default first.")
                setOpenErrorModal(true)
                return false
            }
            setSuccessMessage("Bank Transfer");
            setModelRequestData({
                ...modelRequestData,
                Status: null,
                StatusType: null,
                PaymentGatewayID: ChangeDefaultPaymentGatewaysTypes.BankTransfer,
                Action: "PaymentStatus",
            })
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
        } else if (paymentGatewayID === ChangeDefaultPaymentGatewaysTypes.GoCardless) {
            if (paymentGatewayObj.PaymentGatewayID === ChangeDefaultPaymentGatewaysTypes.GoCardless) {
                setErrorMessage("To disable this as the default payment gateway, please set another payment gateway as the default first.")
                setOpenErrorModal(true)
                return false
            }
            setSuccessMessage("Access Token");
            setModelRequestData({
                ...modelRequestData,
                Status: null,
                StatusType: null,
                PaymentGatewayID: ChangeDefaultPaymentGatewaysTypes.GoCardless,
                Action: "PaymentStatus",
            })
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
            if (paymentGatewayObj.PaymentGatewayID === ChangeDefaultPaymentGatewaysTypes.Stripe) {
                setErrorMessage("To disable this as the default payment gateway, please set another payment gateway as the default first.")
                setOpenErrorModal(true)
                return false
            }
            setSuccessMessage("Publishable key and secret key");
            setModelRequestData({
                ...modelRequestData,
                Status: null,
                StatusType: null,
                PaymentGatewayID: ChangeDefaultPaymentGatewaysTypes.Stripe,
                Action: "PaymentStatus",
            })
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
    }
    const ChangePaymentStatusData = async () => {
        setLoader(true);
        setRequireGoCardLessErrorMessage(false)
        setRequireStripeErrorMessage(false)
        setRequireBankTransferErrorMessage(false)
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
            paymentGateWayType: modelRequestData.PaymentGatewayID === ChangeDefaultPaymentGatewaysTypes.BankTransfer ? "BankTransfer" : modelRequestData.PaymentGatewayID === ChangeDefaultPaymentGatewaysTypes.GoCardless ? "GoCardlessAccess" : "Stripe",
        };
        AddUpdatePaymentGatewayData(ApiRequest_ParamsObj, "changeStatus")
        if (modelRequestData.Action === "PaymentStatus") {
            if (modelRequestData.StatusType === null) {
                try {
                    const data = await ChangeDefaultPaymentGateways(common.organisationKeyID, common.userKeyID, modelRequestData.PaymentGatewayID)
                    if (data) {
                        setLoader(false);
                        if (data?.data?.statusCode === 200) {
                            GetPaymentGatewayModelData(common.organisationKeyID);
                            $("#" + "ConfirmModel").one("hidden.bs.modal", () => {
                                setOpenSuccessModal(true);
                            });
                            $("#" + "ConfirmModel").modal("hide");
                            props.setIsAddUpdatePricingActionDone(true);
                        } else {
                            GetPaymentGatewayModelData(common.organisationKeyID);
                            setErrorMessage(data?.response?.data?.errorMessage);
                            props.setIsAddUpdatePricingActionDone(true);
                        }

                    }
                } catch (error) {
                    console.log(error);
                }
            }
        }
    }

    const handleCloseErrorModel = () => {
        setOpenErrorModal(false);
        $("#" + "ConfirmModel").modal("hide");
    };
    //Design part :
    return (
        <div>
            <div
                style={{ display: openSuccessModal && "none" }}
                class={props.class}
                id={props.id}
                ref={modalRef}
                tabIndex={props.tabIndex}
                aria-labelledby={props.aria_labelledby}
                aria-hidden={props.aria_hidden}
                data-bs-backdrop="static"
                data-bs-keyboard="false"
            >
                <div class="modal-dialog modal-lg modal-dialog-centered">
                    <div class="modal-content">
                        {/*Heading Start */}
                        <div class="modal-header bg-light p-3">
                            <h5 class="modal-title" id="exampleModalLabel">
                                Payment Gateway
                            </h5>
                            {/* Close Button Start */}
                            <button
                                type="button"
                                class="btn-close"
                                data-bs-dismiss="modal"
                                aria-label="Close"
                                id="close-modal"
                                onClick={() => {
                                    setRequireGoCardLessErrorMessage(false)
                                    setRequireStripeErrorMessage(false)
                                    setRequireBankTransferErrorMessage(false)
                                }}
                            >
                                {/* Close Button End */}
                            </button>
                        </div>
                        {/*Heading End */}
                        {/*Modal body Start */}
                        <div class="modal-body">
                            <div className="row">
                                <div className="col-lg-4 col-md-4 col-sm-12">
                                    <div className="card payment-field">
                                        <div className="card-header" style={{ position: "relative" }}>
                                            <img style={{ maxWidth: "70%" }} className="payment-gateway-logoGoCardLess" src={goCardless} />

                                            {/* Tooltip and Switch (placed on the right side of the header) */}

                                            <FormGroup>
                                                <FormControlLabel
                                                    control={
                                                        <Tooltip title={getCrudButtonToolTipName("Change Status")}>
                                                            <Android12Switch

                                                                onClick={() => IsValid(ChangeDefaultPaymentGatewaysTypes.GoCardless)}
                                                                checked={
                                                                    paymentGatewayObj.PaymentGatewayID === ChangeDefaultPaymentGatewaysTypes.GoCardless
                                                                }
                                                            // data-bs-toggle="modal"
                                                            // data-bs-target="#ConfirmModel"
                                                            />
                                                        </Tooltip>
                                                    }
                                                    style={{
                                                        position: "absolute",
                                                        right: "0px", // Adjust as needed for right positioning
                                                        top: "50%",
                                                        transform: "translateY(-50%)", // Vertically center the switch
                                                    }}
                                                />
                                            </FormGroup>

                                        </div>

                                        <div className="card-body">
                                            <label>
                                                Access Token
                                                <span style={{ color: "red" }}>*</span>:
                                            </label>
                                            <input
                                                class="input-text"
                                                placeholder="Access Token"
                                                type="password"
                                                value={paymentGatewayObj.goCardlessAccessToken}
                                                onChange={(e) => {
                                                    const inputValue = e.target.value;
                                                    // Directly update the state without modifying the input value
                                                    setPaymentGatewayObj({
                                                        ...paymentGatewayObj,
                                                        goCardlessAccessToken: inputValue,
                                                    });
                                                }}
                                            />

                                            {RequireGoCardLessErrorMessage &&
                                                !paymentGatewayObj.goCardlessAccessToken ? (
                                                <label className="validation">
                                                    {ERROR_MESSAGES}
                                                </label>
                                            ) : (
                                                ""
                                            )}
                                        </div>
                                        {userAccessData.Admin_Setting_Practice_Config_CanEdit && (
                                            <div class="card-footer text-right">
                                                <button
                                                    className="btn btn-light me-2"
                                                    id="add-btn"
                                                    // data-bs-toggle="modal"
                                                    // data-bs-target="#ConfirmModel"
                                                    style={{ background: "#fff", fontSize: "14px" }}
                                                    onClick={() => {
                                                        $("#" + "ConfirmModel").modal("show");
                                                        setModelRequestData({
                                                            ...modelRequestData,
                                                            Action: "ResetPaymentGatewayChange",
                                                            moduleName: "Go cardless"
                                                        })
                                                    }}
                                                >
                                                    <span>Reset</span>
                                                </button>
                                                <button
                                                    class="btn btn-success create-item-btn"
                                                    id="add-btn"
                                                    onClick={() => {
                                                        PaymentGatewayGoCardlessAddUpdateBtnClicked();
                                                    }}
                                                >
                                                    <span>Save</span>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div class="col-lg-8 col-md-8 col-sm-12">
                                    <div class="card payment-field">
                                        <div class="card-header text-center" style={{ position: "relative" }}>
                                            <img class="payment-gateway-logo" src={stripe} />

                                            <FormGroup>
                                                <FormControlLabel
                                                    control={
                                                        <Tooltip title={getCrudButtonToolTipName("Change Status")}>
                                                            <Android12Switch
                                                                onClick={() => IsValid(ChangeDefaultPaymentGatewaysTypes.Stripe)}
                                                                checked={
                                                                    paymentGatewayObj.PaymentGatewayID === ChangeDefaultPaymentGatewaysTypes.Stripe
                                                                }
                                                            // data-bs-toggle="modal"
                                                            // data-bs-target="#ConfirmModel"
                                                            />
                                                        </Tooltip>
                                                    }
                                                    style={{
                                                        position: "absolute",
                                                        right: "0px", // Adjust as needed for right positioning
                                                        top: "50%",
                                                        transform: "translateY(-50%)", // Vertically center the switch
                                                    }}
                                                />
                                            </FormGroup>

                                        </div>
                                        <div class="card-body">
                                            <div class="row">
                                                <div class="col-lg-6 col-md-6 col-sm-12">
                                                    <label>
                                                        Publishable Key{" "}
                                                        <span style={{ color: "red" }}>*</span>:
                                                    </label>
                                                    <input
                                                        class="input-text"
                                                        placeholder="Publishable Key"
                                                        value={paymentGatewayObj.stripePublishableKey}
                                                        onChange={(e) => {
                                                            const inputValue = e.target.value;
                                                            const sanitizedValue = inputValue.replace(
                                                                /\s/g,
                                                                ""
                                                            );
                                                            // const inputValue = e.target.value;
                                                            // const trimmedValue = inputValue.replace(/^\s+/g, '');
                                                            // const capitalizedValue = trimmedValue.charAt(0).toUpperCase() + trimmedValue.slice(1);
                                                            setPaymentGatewayObj({
                                                                ...paymentGatewayObj,
                                                                stripePublishableKey: sanitizedValue,
                                                            });
                                                        }}
                                                    />
                                                    {RequireStripeErrorMessage &&
                                                        !paymentGatewayObj.stripePublishableKey ? (
                                                        <label className="validation">
                                                            {ERROR_MESSAGES}
                                                        </label>
                                                    ) : (
                                                        ""
                                                    )}
                                                </div>

                                                <div class="col-lg-6 col-md-6 col-sm-12">
                                                    <label>
                                                        Secret Key
                                                        <span style={{ color: "red" }}>*</span>:
                                                    </label>
                                                    <input
                                                        class="input-text"
                                                        placeholder="Secret Key"
                                                        type="password"
                                                        value={paymentGatewayObj.stripeSecretKey}
                                                        onChange={(e) => {
                                                            const inputValue = e.target.value;
                                                            const sanitizedValue = inputValue.replace(
                                                                /\s/g,
                                                                ""
                                                            );
                                                            // const inputValue = e.target.value;
                                                            // const trimmedValue = inputValue.replace(/^\s+/g, '');
                                                            // const capitalizedValue = trimmedValue.charAt(0).toUpperCase() + trimmedValue.slice(1);
                                                            setPaymentGatewayObj({
                                                                ...paymentGatewayObj,
                                                                stripeSecretKey: sanitizedValue,
                                                            });
                                                        }}
                                                    />
                                                    {RequireStripeErrorMessage &&
                                                        !paymentGatewayObj.stripeSecretKey ? (
                                                        <label className="validation">
                                                            {ERROR_MESSAGES}
                                                        </label>
                                                    ) : (
                                                        ""
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        {userAccessData.Admin_Setting_Practice_Config_CanEdit && (
                                            <div class="card-footer text-right">
                                                <button
                                                    className="btn btn-light me-2"
                                                    id="add-btn"
                                                    // data-bs-toggle="modal"
                                                    // data-bs-target="#ConfirmModel"
                                                    style={{ background: "#fff", fontSize: "14px" }}
                                                    onClick={() => {
                                                        $("#" + "ConfirmModel").modal("show");
                                                        setModelRequestData({
                                                            ...modelRequestData,
                                                            Action: "ResetPaymentGatewayChange",
                                                            moduleName: "Stripe"
                                                        })
                                                    }}
                                                >
                                                    <span>Reset</span>
                                                </button>
                                                <button
                                                    class="btn btn-success create-item-btn"
                                                    id="add-btn"
                                                    onClick={() => {
                                                        PaymentGatewayStripeAddUpdateBtnClicked();
                                                    }}
                                                >
                                                    <span>Save</span>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="col-lg-12 col-md-12 col-sm-12">
                                    <div style={{ marginBottom: "0px" }} className="card payment-field">
                                        <div className="Bank-Transfer-header text-center" style={{ position: "relative" }}>
                                            <div>Bank Transfer</div>

                                            <FormGroup>
                                                <FormControlLabel
                                                    control={
                                                        <Tooltip title={getCrudButtonToolTipName("Change Status")}>
                                                            <Android12Switch
                                                                onClick={() => IsValid(ChangeDefaultPaymentGatewaysTypes.BankTransfer)}
                                                                checked={
                                                                    paymentGatewayObj.PaymentGatewayID === ChangeDefaultPaymentGatewaysTypes.BankTransfer
                                                                }
                                                            // data-bs-toggle="modal"
                                                            // data-bs-target="#ConfirmModel"
                                                            />
                                                        </Tooltip>
                                                    }
                                                    style={{
                                                        position: "absolute",
                                                        right: "0px", // Adjust as needed for right positioning
                                                        top: "50%",
                                                        transform: "translateY(-50%)", // Vertically center the switch
                                                    }}
                                                />
                                            </FormGroup>

                                        </div>
                                        <div className="card-body">
                                            <div class="row">
                                                <div class="col-lg-4 col-md-4 col-sm-12">
                                                    <label>
                                                        Name
                                                        <span style={{ color: "red" }}>*</span>:
                                                    </label>
                                                    <input
                                                        class="input-text"
                                                        placeholder="Name"
                                                        type="text"
                                                        value={paymentGatewayObj.bankTransferName}
                                                        maxLength={100}
                                                        onChange={(e) => {
                                                            const inputValue = e.target.value;

                                                            // Remove any numeric characters
                                                            let sanitizedValue = inputValue.replace(/[0-9]/g, "");

                                                            // Remove leading spaces and allow only one space between words
                                                            sanitizedValue = sanitizedValue.replace(/^\s+/, "").replace(/\s+/g, " ");

                                                            // Capitalize the first letter
                                                            const capitalizedValue =
                                                                sanitizedValue.charAt(0).toUpperCase() + sanitizedValue.slice(1);

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
                                                        <label className="validation">
                                                            {ERROR_MESSAGES}
                                                        </label>
                                                    ) : (
                                                        ""
                                                    )}
                                                </div>
                                                <div class="col-lg-4 col-md-4 col-sm-12">
                                                    <label>
                                                        Account Number
                                                        <span style={{ color: "red" }}>*</span>:
                                                    </label>
                                                    <input
                                                        class="input-text"
                                                        placeholder="Account Number"
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
                                                        maxLength={8} // This ensures that no more than 8 characters are allowed in the field
                                                    />
                                                    {RequireBankTransferErrorMessage && (
                                                        <>
                                                            {!paymentGatewayObj.AccountNumber || paymentGatewayObj.AccountNumber.trim() === "" ? (
                                                                <label className="validation">
                                                                    {ERROR_MESSAGES} {/* Show a generic error message if the account number is empty */}
                                                                </label>
                                                            ) : (
                                                                isInvalidInput(paymentGatewayObj.AccountNumber, 8) && (
                                                                    <label className="validation">
                                                                        Please enter a valid account number consisting of 8 digits. {/* Show a specific error message if the account number is not exactly 8 digits */}
                                                                    </label>
                                                                )
                                                            )}
                                                        </>
                                                    )}
                                                </div>

                                                <div class="col-lg-4 col-md-4 col-sm-12">
                                                    <label>
                                                        Sort Code
                                                        <span style={{ color: "red" }}>*</span>:
                                                    </label>
                                                    <input
                                                        class="input-text"
                                                        placeholder="Sort Code"
                                                        type="text"
                                                        value={paymentGatewayObj.sortCode}
                                                        onChange={(e) => {
                                                            let inputValue = e.target.value;

                                                            // Remove non-numeric characters
                                                            let sanitizedValue = inputValue.replace(/[^0-9]/g, "");

                                                            // Limit to 6 digits
                                                            if (sanitizedValue.length > 6) {
                                                                sanitizedValue = sanitizedValue.substring(0, 6);
                                                            }

                                                            // Format with dashes (22-22-22 format)
                                                            let formattedValue = sanitizedValue
                                                                .replace(/(\d{2})(?=\d)/g, "$1-"); // Add a dash after every 2 digits

                                                            setPaymentGatewayObj({
                                                                ...paymentGatewayObj,
                                                                sortCode: formattedValue,
                                                            });
                                                        }}
                                                    />

                                                    {RequireBankTransferErrorMessage && (
                                                        <>
                                                            {!paymentGatewayObj.sortCode || paymentGatewayObj.sortCode.trim() === "" ? (
                                                                <label className="validation">{ERROR_MESSAGES}</label>
                                                            ) : (
                                                                paymentGatewayObj.sortCode.replace(/-/g, "").length !== 6 && (
                                                                    <label className="validation">
                                                                        Please enter a valid sort code consisting of 6 digits. {/* Show a specific error message if sortCode is not exactly 6 digits */}
                                                                    </label>
                                                                )
                                                            )}
                                                        </>
                                                    )}


                                                </div>
                                            </div>
                                        </div>

                                        {userAccessData.Admin_Setting_Practice_Config_CanEdit && (
                                            <div class="card-footer text-right">
                                                <button
                                                    className="btn btn-light me-2"
                                                    id="add-btn"
                                                    // data-bs-toggle="modal"
                                                    // data-bs-target="#ConfirmModel"
                                                    style={{ background: "#fff", fontSize: "14px" }}
                                                    onClick={() => {
                                                        $("#" + "ConfirmModel").modal("show");
                                                        setModelRequestData({
                                                            ...modelRequestData,
                                                            Action: "ResetPaymentGatewayChange",
                                                            moduleName: "Bank Transfer"
                                                        })
                                                    }}
                                                >
                                                    <span>Reset</span>
                                                </button>
                                                <button
                                                    class="btn btn-success create-item-btn"
                                                    id="add-btn"
                                                    onClick={() => {
                                                        PaymentGatewayBankTransferAddUpdateBtnClicked();
                                                    }}
                                                >
                                                    <span>Save</span>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/*Modal body End */}
                    </div>
                    <ConfirmModel
                        openSuccessModal={openSuccessModal}
                        modelRequestData={modelRequestData}
                        UpdatedStatus={modelRequestData.Action === "PaymentStatus" ? ChangePaymentStatusData : HandleResetModalFunction}
                        handleClose={handleClose}
                    />
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
                        modelAction={modelRequestData.Action === "PaymentStatus" ? "Status" : modelRequestData.Action === "ResetPaymentGatewayChange" ? null : "Update"}
                        message={modelRequestData.Action === "PaymentStatus" ? "Status has been changed successfully!" : modelRequestData.Action === "ResetPaymentGatewayChange" ? `${modelRequestData.moduleName} has been reset successfully!` : successMessage}
                    />

                </div>


            </div>
        </div>
    );
}

export default PaymentGatewayModel;
