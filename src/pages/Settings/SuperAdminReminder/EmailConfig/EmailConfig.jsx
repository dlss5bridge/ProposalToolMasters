/* global $ */
import React, { useState, useRef, useContext, useEffect } from "react";
import "../../Email_config/EmailConfigStyle.css";
import {
    AddUpdateEmailConfig,
    GetReminderEmailConfigModel,
} from "../../../../redux/Services/Setting/EmailConfigApi";
import { useSelector } from "react-redux";
import SuccessModal from "../../../../components/SuccessModal";
import { AuthContextProvider } from "../../../../AuthContext/AuthContext";
import ErrorModel from "../../../../components/ErrorModel";
import ConfirmModel from "../../../../components/ConfirmationBox";
import Footer from "../../../../components/Footer";

const Email_Config = () => {
    // A] States Declaration :
    const modalRef = useRef(null);
    const [openErrorModal, setOpenErrorModal] = React.useState(false);
    const [dismissModal, setDismissModal] = useState(null);
    const [openSuccessModal, setOpenSuccessModal] = React.useState(false);
    const [modelAction, setModelAction] = useState("");
    const [isAddUpdateActionDone, setIsAddUpdateActionDone] = useState(false);
    const { getCrudButtonToolTipName, proposalName, setLoader, setTopbar, userAccessData, EngagementName, activeOrganizationSubscriptionPlan } =
        useContext(AuthContextProvider);

    const [showModal, setShowModal] = useState(false);
    const [modelRequestData, setModelRequestData] = useState({
        userKeyID: null,
        organisationKeyID: null,
        status: "",
        Action: "",
        moduleName: ""
    });

    const [emailConfigObj, setEmailConfigObj] = useState({
        userKeyID: null,
        reminderCC: "",
        reminderBCC: "",
    });

    const [PreEmailConfigObj, setPrevEmailConfigObj] = useState({
        userKeyID: null,
        reminderCC: "",
        reminderBCC: "",
    });
    const [errorMessage, setErrorMessage] = useState("");
    const [PrevError, setPrevError] = useState(false);
    const common = useSelector((state) => state.Storage); //Getting Logged Users Details From Persist Storage of redux hooks
    // B] Initial useEffect : Will call when Add/Update button click from list page

    useEffect(() => {
        setTopbar("block");
    }, []);

    useEffect(() => {
        if (common.organisationKeyID !== null) {
            GetReminderEmailConfigModelData(common.organisationKeyID);
        }
    }, [common.organisationKeyID]);
    const GetReminderEmailConfigModelData = async (id) => {
        if (!id) {
            return;
        }
        try {
            const data = await GetReminderEmailConfigModel(id);
            if (data?.data?.statusCode === 200) {
                if (data?.data?.responseData?.data) {
                    const ModelData = data?.data?.responseData?.data;
                    setEmailConfigObj({
                        ...emailConfigObj,
                        userKeyID: common.userKeyID,
                        reminderCC: ModelData.reminderCC,
                        reminderBCC: ModelData.reminderBCC,
                    });
                    setPrevEmailConfigObj({
                        ...PreEmailConfigObj,
                        userKeyID: common.userKeyID,
                        reminderCC: ModelData.reminderCC,
                        reminderBCC: ModelData.reminderBCC,
                    });
                }
            } else {
                setErrorMessage(data?.data?.errorMessage);
            }
        } catch (error) {
            console.log(error);
        }
    };

    // 2) Add Update Button Click Function
    const EmailConfigAddUpdateBtnClicked = (action) => {
        if (activeOrganizationSubscriptionPlan?.isMailBox !== true) {
            setShowModal(true);
            return;
        }
        setModelRequestData({ ...modelRequestData, Action: action });
        setModelAction(null);

        if (action === "ClearCcBcc") {
            // Check if all fields are already empty
            if (
                (emailConfigObj.reminderCC === null) &&
                emailConfigObj.reminderBCC === null
            ) {
                // Show an error message using the existing ErrorModel
                setOpenErrorModal(true);
                setPrevError(false);
                return;
            }
            // For Clear action, set all fields to null
            const ApiRequest_ParamsObj = {
                organisationKeyID: common.organisationKeyID,
                userKeyID: common.userKeyID,
                reminderCC: null,
                reminderBCC: null
            };
            AddUpdateEmailConfigData(ApiRequest_ParamsObj);
            return;
        }
        //Check Validations will be done here
        const emailPattern = /^\S+@\S+\.\S+$/;
        if (
            PreEmailConfigObj.reminderCC == emailConfigObj.reminderCC &&
            PreEmailConfigObj.reminderBCC == emailConfigObj.reminderBCC
        ) {
            setPrevError(true);
            return false;
        }

        const reminderCC = emailConfigObj?.reminderCC
            ?.split(/[,]+/)
            ?.map((email) => email?.trim())
            ?.filter((email) => email && emailPattern.test(email));



        const reminderBCC = emailConfigObj?.reminderBCC
            ?.split(/[,\s]+/)
            ?.map((email) => email?.trim())
            ?.filter((email) => email && emailPattern.test(email));

        if (
            reminderCC?.length !== emailConfigObj?.reminderCC?.split(/[,]+/)?.length ||
            reminderBCC?.length !== emailConfigObj?.reminderBCC?.split(/[,\s]+/)?.length
        ) {
            // setErrorMessage("Please enter valid email addresses.");
            return false;
        } else {
            // Code will run properly if all conditions are met
        }
        // Preparing Object For Add Update and if any modification then it will done here
        const ApiRequest_ParamsObj = {
            //global level params : fixed
            organisationKeyID: common.organisationKeyID,
            userKeyID: common.userKeyID,
            //form level params : will change according to module
            reminderCC: reminderCC?.join(", "),
            reminderBCC: reminderBCC?.join(", "),
        };
        AddUpdateEmailConfigData(ApiRequest_ParamsObj);
    };

    // Add or Update Email config Data CC and BCC
    const AddUpdateEmailConfigData = async (apiRequestParams) => {
        setLoader(true);
        try {
            let url = "/AddUpdateEmailConfig"; // Default URL for Adding Data
            if (
                apiRequestParams.Action === "Update" ||
                apiRequestParams.Action === "ClearCcBcc"
            ) {
                url = `/AddUpdateEmailConfig?Action=${apiRequestParams.Action}`; // URL for Updating Data
            }
            const response = await AddUpdateEmailConfig(url, apiRequestParams);
            if (response) {
                setLoader(false);
                if (response?.data?.statusCode === 200) {
                    if (apiRequestParams.Action === "Update") {
                        if ($("#" + "ConfirmModel").hasClass("show")) {
                            $("#" + "ConfirmModel").one("hidden.bs.modal", () => {
                                setOpenSuccessModal(true);
                            });
                            $("#" + "ConfirmModel").modal("hide");
                        } else {
                            setOpenSuccessModal(true);
                        }
                        setIsAddUpdateActionDone(true);
                        GetReminderEmailConfigModelData(common.organisationKeyID);
                    } else {
                        if ($("#" + "ConfirmModel").hasClass("show")) {
                            $("#" + "ConfirmModel").one("hidden.bs.modal", () => {
                                setOpenSuccessModal(true);
                            });
                            $("#" + "ConfirmModel").modal("hide");
                        } else {
                            setOpenSuccessModal(true);
                        }
                        setIsAddUpdateActionDone(true);
                        GetReminderEmailConfigModelData(common.organisationKeyID);
                    }
                } else {
                    setErrorMessage(response?.response?.data?.errorMessage);
                }
            }
        } catch (error) {
            console.error(error);
        }
    };

    //email validation function
    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    const handleClose = () => {
        $("#" + "successModal").modal("hide");
        $("#" + "ConfirmModel").modal("hide");
        setOpenSuccessModal(false);
        setOpenErrorModal(false);
    };

    //Design part :
    return (
        <div>
            <div class="main-content">
                <div style={{ height: "85vh" }} class="page-content page-background">
                    <div class="container ">
                        <div className="row">
                            <div style={{ marginTop: "10px" }} class="col-12">
                                <div class="card">
                                    <div class="card-body bg-white">
                                        <div class=" row ">
                                            <div className="row">
                                                <h6>
                                                    <u>CC/BCC Configuration</u>{" "}
                                                </h6>
                                                <div className="col-md-6  mb-2">
                                                    <div>
                                                        <label class="fieldset-label table-content-font">
                                                            Reminder CC
                                                        </label>
                                                    </div>

                                                    <div>
                                                        <input
                                                            class="input-text table-content-font"
                                                            type="text"
                                                            placeholder="john.doe@example.com , jane.smith@example.com"
                                                            value={emailConfigObj.reminderCC || ""}
                                                            onChange={(e) => {
                                                                const trimmedValue = e.target.value.replace(
                                                                    /\s/g,
                                                                    ""
                                                                ); // Remove spaces
                                                                setPrevError(false);
                                                                setEmailConfigObj({
                                                                    ...emailConfigObj,
                                                                    reminderCC: trimmedValue,
                                                                });
                                                            }}
                                                        />
                                                        {emailConfigObj.reminderCC &&
                                                            emailConfigObj.reminderCC
                                                                .split(/[,]+/)
                                                                .some(
                                                                    (email) => !validateEmail(email.trim())
                                                                ) && (
                                                                <label className="validation">
                                                                    Please enter valid email addresses separated
                                                                    by commas ("," ) .
                                                                </label>
                                                            )}
                                                    </div>
                                                </div>
                                                <div className="col-md-6 mb-2">
                                                    <div>
                                                        <label class="fieldset-label table-content-font">
                                                            Reminder BCC
                                                        </label>
                                                    </div>
                                                    <div>
                                                        <input
                                                            class="input-text table-content-font "
                                                            type="text"
                                                            placeholder="john.doe@example.com , jane.smith@example.com"
                                                            value={emailConfigObj.reminderBCC || ""}
                                                            onChange={(e) => {
                                                                const trimmedValue = e.target.value.replace(
                                                                    /\s/g,
                                                                    ""
                                                                ); // Remove spaces
                                                                setPrevError(false);
                                                                setEmailConfigObj({
                                                                    ...emailConfigObj,
                                                                    reminderBCC: trimmedValue,
                                                                });
                                                            }}
                                                        />

                                                        {emailConfigObj.reminderBCC &&
                                                            emailConfigObj.reminderBCC
                                                                .split(/[,\s]+/)
                                                                .some(
                                                                    (email) => !validateEmail(email.trim())
                                                                ) && (
                                                                <label className="validation">
                                                                    Please enter valid email addresses separated
                                                                    by commas ("," ) .
                                                                </label>
                                                            )}
                                                    </div>
                                                </div>

                                            </div>

                                            <div class="row justify-content-end">
                                                <div className="col-lg-6 d-flex justify-content-end align-items-center">
                                                    <button
                                                        data-bs-toggle="modal"
                                                        data-bs-target="#ConfirmModel"
                                                        onClick={() => {
                                                            setModelRequestData({
                                                                ...modelRequestData,
                                                                Action: "ClearCcBcc",
                                                            });
                                                        }}
                                                        className="btn btn-light me-2"
                                                        style={{ fontSize: "14px" }}
                                                    >
                                                        <span>Reset</span>
                                                    </button>

                                                    <button
                                                        style={{ fontSize: "14px" }}
                                                        className="btn btn-primary create-item-btn"
                                                        onClick={() => {
                                                            EmailConfigAddUpdateBtnClicked();
                                                        }}
                                                    >
                                                        <span>Submit</span>
                                                    </button>

                                                </div>
                                            </div>
                                            <div className="row mb-3">
                                                <div className="col-12 text-center">
                                                    {PrevError && (
                                                        <label className="validation">
                                                            You haven't changed any value
                                                        </label>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <Footer />
            </div>

            <ConfirmModel
                openErrorModal={openErrorModal}
                openSuccessModal={openSuccessModal}
                modelRequestData={modelRequestData}
                message={
                    modelRequestData.Action === "ResetEmailConfigurationChange"
                        ? "Are you sure you want to reset the email configuration?"
                        : modelRequestData.Action === "ClearCcBcc"
                            ? "Are you sure you want to reset all CC and BCC fields?"
                            : ""
                }
                UpdatedStatus={() => {
                    if (modelRequestData.Action === "ClearCcBcc") {
                        EmailConfigAddUpdateBtnClicked("ClearCcBcc");
                    } else {
                        EmailConfigAddUpdateBtnClicked("Update");
                    }
                }}
            />

            <SuccessModal
                handleClose={handleClose}
                setDismissModal={setDismissModal}
                setOpenSuccessModal={setOpenSuccessModal}
                openSuccessModal={openSuccessModal}
                modelAction={modelAction}
                message={
                    modelRequestData.Action === "ResetEmailConfigurationChange"
                        ? "Email configuration has been reset successfully!"
                        : modelRequestData.Action === "ClearCcBcc"
                            ? "CC and BCC fields have been reset successfully!"
                            : modelRequestData.Action === "VerifyEmailID" ?
                                "Please check your mailbox for an email sent by AWS. When found (check your spam), click the link to verify that Outbooks has permission to send emails from this email address."
                                : modelRequestData.Action === "Status" ? "Status has been changed successfully!" :
                                    "Email configuration has been updated successfully!"
                }
            />
            {/* <ErrorModel
        ErrorModel={openErrorModal}
        handleClose={handleClose}
        ErrorMessage={"Failed to send email"}
      /> */}
            <ErrorModel
                ErrorModel={openErrorModal}
                handleClose={handleClose}
                ErrorMessage={
                    modelRequestData.Action === "ClearCcBcc" &&
                        emailConfigObj.reminderCC === "" &&
                        emailConfigObj.reminderBCC === ""
                        ? ""
                        : "All fields are already empty. No action needed." // This will use the existing error message for other cases
                }
            />

        </div>
    );
};

export default Email_Config;
