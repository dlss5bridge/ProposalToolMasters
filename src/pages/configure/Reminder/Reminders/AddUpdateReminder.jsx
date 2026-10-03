/* global $ */
import React, { useContext, useEffect, useState } from "react";
import Select from "react-select";
import { AuthContextProvider } from "../../../../AuthContext/AuthContext";
import BackButtonSvg from "../../../../components/BackButtonSvg";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import SuccessModal from "../../../../components/SuccessModal";
import "../../../../pages/configure/packages/Package.css";
import "../../../configure/services/ServiceStyle.css";
import "../ReminderEmailTemplate/AddReminderTemplate-redesign.css";
import "./AddUpdateReminder-redesign.css";
import { ERROR_MESSAGES } from "../../../../components/GlobalMessage";
import { useDispatch, useSelector } from "react-redux";
import AcceptSuperAdminChangesConfirmation from "../../../../components/AcceptSuperAdminChangesConfirmation";
import {
  GetEmailAddressTypeLookupList,
  GetTriggerPointTypeLookupList,
  GetFrequencyLookUpList,
  GetDocumentStatusTypeLookUpList,
} from "../../../../redux/Services/Config/ReminderApi";
import { GetEmailTemplateListLookupList } from "../../../../redux/Services/Config/TemplateApi";

import {
  GetReminderModel,
  AddUpdateReminders,
} from "../../../../redux/Services/Config/ReminderCrudApi";
import Utils from "../../../../Middleware/Utils";
import { NotifySuperAdminPredefinedChangesToAdmin } from "../../../../redux/Services/Setting/NotificationApi";
import { DeclineSuperAdminChanges } from "../../../../redux/Services/Config/ServiceCategoryApi";
import SAPredefinedChangesNotifyMessageModel from "../../../../components/SAPredefinedChangesNotifyMessageModel";
function AddUpdateReminder(props) {
  const moduleName = "Reminder";
  const navigate = useNavigate();
  const location = useLocation();
  const [openErrorModal, setOpenErrorModal] = React.useState(false);
  const [Status, setStatus] = React.useState(false);
  const [isCheck, setIsCheck] = useState(false);
  const [reminderObj, setReminderObj] = useState({
    reminderKeyID: null,
    reminderName: "",
    status: [],
    emailTemplate: null, //only for check add/update replace with null after
    emailAddress: null,
    days: 1,
    period: 1,
    triggerPoint: null,
    repeats: 2,
    frequency: null
  });


  const [errors, setErrors] = useState({});
  const [openSuccessModal, setOpenSuccessModal] = useState(false);
  const [requireErrorMessage, setRequireErrorMessage] = useState(false);
  const [emailAddressTypeLookupList, setEmailAddressTypeLookupList] = useState(
    []
  );
  const [triggerPointTypeLookupList, setTriggerPointTypeLookupList] = useState(
    []
  );
  const [frequencyTypeLookupList, setFrequencyTypeLookupList] = useState([]);
  const [documentStatusTypeLookupList, setDocumentStatusTypeLookupList] =
    useState([]);
  const [emailTemplateTypeLookupList, setEmailTemplateTypeLookupList] =
    useState([]);

  const [modelAction, setModelAction] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const {
    setTopbar,
    setLoader,
    getCrudButtonTextName,
    getCrudPopUpTitleName,
    EngagementName,
    proposalName,
    prospectName
  } = useContext(AuthContextProvider);

  const common = useSelector((state) => state.Storage);
  useEffect(() => {
    setModelAction(location.state?.reminderKeyID === null ? "Add" : "Update"); //Do not change this naming convention
    GetEmailAddressTypeData();

    GetFrequencyTypeData();
    GetDocumentStatusTypeData();
    GetEmailTemplateTypeData();
    setTopbar("none");

    if (location.state?.reminderKeyID !== null) {
      GetReminderModelData(location.state?.reminderKeyID, location.state?.Type);
    }
  }, [location.state]);

  const GetReminderModelData = async (id, GetSAChanges) => {
    if (!id) {
      return;
    }
    try {
      setLoader(true);
      const data = await GetReminderModel(id, GetSAChanges);
      if (data?.data?.statusCode === 200) {
        if (data?.data?.responseData?.data) {
          const ModelData = data?.data?.responseData?.data;

          // Update the reminderObj state with the retrieved data
          setReminderObj((prevObj) => ({
            ...prevObj,
            reminderKeyID: ModelData.reminderKeyID,
            emailTemplate: ModelData.templateID,
            reminderName: ModelData.reminderName,
            emailAddress: ModelData.emailAddressID,
            triggerPoint: ModelData.triggerPointID,
            status: ModelData.documentStatusIDs,
            frequency: ModelData.reminderFrequencyID,
            days: ModelData.days,
            period: ModelData.sequenceID,
            repeats: ModelData.isRepeat ? 1 : 2
          }));
          GetTriggerPointTypeData(ModelData.emailAddressID, ModelData.emailAddressIDType)
        }

        setLoader(false);
      } else {
        setErrorMessage(data?.data?.errorMessage);
        setLoader(false);
      }
    } catch (error) {
      console.log(error);
      setLoader(false);
    }
  };


  const handleCancelButton = () => {
    setTopbar("block");
    navigate("/reminder");
  };

  const handleReminderNameChange = (e) => {
    const inputValue = e.target.value;
    const trimmedValue = inputValue.replace(/^\s+/g, "");
    const singleSpaceValue = trimmedValue.replace(/\s{2,}/g, " ");
    const sanitizedValue = singleSpaceValue.replace(/ \./g, " ");
    const capitalizedValue =
      sanitizedValue.charAt(0).toUpperCase() + sanitizedValue.slice(1);
    setReminderObj({
      ...reminderObj,
      reminderName: capitalizedValue,
    });

    setErrors({ ...errors, reminderName: "" });
  };

  const handleDaysChange = (e) => {
    const value = e.target.value;
    if (
      value === "" ||
      (value.match(/^[1-9][0-9]{0,2}$/) && parseInt(value) <= 365)
    ) {
      setReminderObj({
        ...reminderObj,
        days: value,
      });
    }
  };

  const AddUpdateValidateReminder = (Accept) => {
    // Check for required fields
    if (Accept === "Accept") {
      $("#" + "ConfirmSAChangesModel").modal("show");

      setStatus(true)
      return
    }
    if (
      reminderObj.reminderName === undefined ||
      reminderObj.reminderName === null ||
      reminderObj.reminderName === "" ||

      reminderObj.emailTemplate === undefined ||
      reminderObj.emailTemplate === null ||
      reminderObj.emailTemplate === "" ||

      reminderObj.emailAddress === undefined ||
      reminderObj.emailAddress === null ||
      reminderObj.emailAddress === "" ||

      reminderObj.days === undefined ||
      reminderObj.days === null ||
      reminderObj.days === "" ||

      reminderObj.triggerPoint === undefined ||
      reminderObj.triggerPoint === null ||
      reminderObj.triggerPoint === "" ||

      reminderObj.status === undefined ||
      reminderObj.status === null ||
      reminderObj.status === "" ||
      reminderObj.status.length === 0 ||

      reminderObj.repeats === undefined ||
      reminderObj.repeats === null ||
      reminderObj.repeats === "" ||
      (reminderObj.repeats === 1 &&
        (reminderObj.frequency === undefined ||
          reminderObj.frequency === null ||
          reminderObj.frequency === ""))
    ) {
      setRequireErrorMessage(true); // Show common error message
      return false; // Validation failed
    }

    setRequireErrorMessage(false); // Clear error message if validation passes
    const daysInt = parseInt(reminderObj.days);
    const api_param = {
      acceptSAChanges: Accept,
      reminderKeyID: reminderObj.reminderKeyID,
      organisationKeyID: common.organisationKeyID,
      userKeyID: common.userKeyID,
      reminderName: reminderObj.reminderName,
      templateID: reminderObj.emailTemplate,
      emailAddressID: reminderObj.emailAddress,
      days: isNaN(daysInt) ? "" : daysInt,
      sequenceID: reminderObj.period,
      triggerPointID: reminderObj.triggerPoint,
      isRepeat: reminderObj.repeats === 1 ? true : false,
      reminderFrequencyID: reminderObj.frequency,
      documentStatusIDs: reminderObj.status,
    };
    AddUpdateReminderObj(api_param)
  };



  // Form data construction function
  const AddUpdateReminderObj = async (apiParam, common) => {
    setLoader(true)
    try {
      const response = await AddUpdateReminders(apiParam);

      if (response?.data?.statusCode === 200) {
        setLoader(false)
        setOpenSuccessModal(true);
        props.setIsAddUpdateActionDone(true); // Handle actions
        navigate("/reminder");
      } else {
        setLoader(false)
        setErrorMessage(response?.response?.data?.errorMessage); // Handle errors
      }
    } catch (error) {
      setLoader(false)
      console.error(error); // Catch unexpected errors
    }
  };

  const handleClose = async () => {
    if (isCheck) {
      setLoader(true)
      const Notification = await NotifySuperAdminPredefinedChangesToAdmin({
        userKeyID: common.userKeyID,
        moduleKeyID: reminderObj.reminderKeyID,
        moduleName: "Predefined-Reminder"
      })
      if (Notification?.data?.statusCode === 200) {
        setLoader(false)
        setModelAction("NotificationSend")
        setOpenSuccessModal(true)
        setIsCheck(false)
      }
    } else {
      setOpenSuccessModal(false);
      navigate("/reminder");
    }
  };

  const templateTypeFilter = emailTemplateTypeLookupList?.find(
    (template) => template.value == reminderObj.emailTemplate
  );

  const TemplateEmailAddress = emailAddressTypeLookupList?.find(
    (emailTemp) => emailTemp.value === reminderObj.emailAddress
  );

  const Sequence = Utils.periods?.find(
    (sequence) => sequence.value == reminderObj.period
  );

  const TriggerPoints = triggerPointTypeLookupList?.find(
    (trigger) => trigger.value == reminderObj.triggerPoint
  );

  const Repeat = Utils.repeats?.find(
    (repeat) => repeat.value === reminderObj.repeats
  );

  const frequencyValue = frequencyTypeLookupList?.find(
    (freq) => freq.value == reminderObj.frequency
  );

  const documentStatusValue = documentStatusTypeLookupList.filter((item) =>
    reminderObj.status.includes(item.value)
  );


  const handleSelectChange = (selectedOptions) => {

    if (selectedOptions.some((option) => option.value === 0)) {
      // If the "All" option (id: 0) is selected, select all other options
      const updatedNOBList = documentStatusTypeLookupList
        .filter((option) => option.value !== 0)
        .map((option) => option.value);
      setReminderObj((prevState) => ({
        ...prevState,
        status: updatedNOBList,
      }));
    } else {
      // Otherwise, update the status with the selected options
      setReminderObj((prevState) => ({
        ...prevState,
        status: selectedOptions.map((option) => option.value),
      }));
    }
  };

  const GetEmailAddressTypeData = async () => {
    setLoader(true)
    try {
      const data = await GetEmailAddressTypeLookupList(1);
      setLoader(false)
      let emailAddressTypeData = data?.data?.responseData.data;
      emailAddressTypeData = emailAddressTypeData.map((emailAddressType) => ({
        value: emailAddressType.emailAddressID,
        label: emailAddressType.emailAddressName?.replace(/prospects/gi, prospectName),
        emailAddressIDType: emailAddressType.emailAddressIDType
      }));
      setEmailAddressTypeLookupList(emailAddressTypeData);
    } catch (error) {
      setLoader(false)
      console.log(error);
    }
  };

  const GetTriggerPointTypeData = async (emailAddressID, emailAddressIDType) => {
    try {
      const data = await GetTriggerPointTypeLookupList(1, emailAddressID, emailAddressIDType);
      let triggerPointTypeData = data?.data?.responseData?.data;

      triggerPointTypeData = triggerPointTypeData
        .map((triggerPoint) => {
          let label = triggerPoint.triggerPointName;

          // Replace "Contract" with "EL" in the label
          if (label.includes("Contract")) {
            label = label.replace("Contract", EngagementName);
          }

          // Replace "Quote" with "Proposal" in the label
          if (label.includes("Quote")) {
            label = label.replace("Quote", proposalName);
          }

          return {
            value: triggerPoint.triggerPointID,
            label: label,
          };
        })
        .filter(Boolean); // Filters out any false values (e.g., null, undefined, etc.)

      setTriggerPointTypeLookupList(triggerPointTypeData);
    } catch (error) {
      console.log(error);
    }
  };



  const GetFrequencyTypeData = async () => {
    try {
      const data = await GetFrequencyLookUpList();
      let frequencyTypeData = data?.data?.responseData.data;
      frequencyTypeData = frequencyTypeData.map((frequencyType) => ({
        value: frequencyType.reminderFrequencyID,
        label: frequencyType.reminderFrequencyName,
      }));
      setFrequencyTypeLookupList(frequencyTypeData);
    } catch (error) {
      console.log(error);
    }
  };
  const GetDocumentStatusTypeData = async () => {
    try {
      const data = await GetDocumentStatusTypeLookUpList();
      let documentStatusTypeData = data?.data?.responseData?.data || [];

      documentStatusTypeData = documentStatusTypeData.map((documentStatus) => {
        let label = documentStatus.documentStatusName;

        // Replace "Contract" with the value of EngagementName in the label
        if (label.includes("Contract")) {
          label = label.replace("Contract", EngagementName);
        }

        // Replace "Quote" with the value of proposalName in the label
        if (label.includes("Quote")) {
          label = label.replace("Quote", proposalName);
        }

        return {
          value: documentStatus.documentStatusID,
          label: label,
        };
      });

      // Add "All" option at the beginning of the array
      documentStatusTypeData = [
        {
          value: 0,
          label: "All",
        },
      ].concat(documentStatusTypeData);

      setDocumentStatusTypeLookupList(documentStatusTypeData);
    } catch (error) {
      console.log(error);
    }
  };


  const GetEmailTemplateTypeData = async () => {
    try {
      const data = await GetEmailTemplateListLookupList(
        common.organisationKeyID,
        common.userKeyID,
        5
      );

      let emailTemplateTypeData = data?.data?.responseData.data;

      emailTemplateTypeData = emailTemplateTypeData.map((TempType) => {
        let label = TempType.templateName
        // Replace "Contract" with the value of EngagementName in the label
        return {
          value: TempType.templateID,
          label: label,
        };
      });


      setEmailTemplateTypeLookupList(emailTemplateTypeData);
    } catch (error) {
      console.log(error);
    }
  };

  const DeclineSuperAdminChangesData = async (Decline) => {
    if (Decline === "Decline") {
      // $('#' + props.id).modal('hide')

      setStatus(false)
      $("#" + "ConfirmSAChangesModel").modal("show");
      return
    }
    setLoader(true);
    try {
      const apiRequestParams = {
        organisationKeyID: common.organisationKeyID,
        userKeyID: common.userKeyID,
        moduleKeyID: location.state?.reminderKeyID,
        moduleName: "Predefined-Reminder"
        //Predefined-ServiceCategory, Predefined-GlobalConstant, Predefined-GlobalPricingDriver,
        //Predefined-PL-EL-Template, Predefined-TnC-Template, Predefined-Email-Template,
        //Predefined-Service, Predefined-ServicePackage
      }
      const response = await DeclineSuperAdminChanges(apiRequestParams);
      if (response) {
        setLoader(false);
        if (response?.data?.statusCode === 200) {
          if (apiRequestParams.Action === null) {
            $("#" + "ConfirmSAChangesModel").modal("hide");
            navigate("/reminder")
            props.setIsAddUpdateActionDone(true);
          } else {
            $("#" + "ConfirmSAChangesModel").modal("hide");
            navigate("/reminder")
            props.setIsAddUpdateActionDone(true);
          }
        } else {
          setErrorMessage(true)
          $("#" + "ConfirmSAChangesModel").modal("hide");
          setErrorMessage(response?.response?.data?.errorMessage);
        }
      }
    } catch (error) {
      console.error(error);
    }
  }
  const handleConfirmButton = () => {
    $("#" + "ConfirmSAChangesModel").modal("hide");
    if (Status) {
      AddUpdateValidateReminder(true)
    } else {
      DeclineSuperAdminChangesData()
    }
  }

  return (
    <>
      <div className="container-fluid new-item-page-container rt-form rm-form">
        <div className="new-item-page-content">
          <div className="row form-row">
            <div className="col-lg-12">
              <h3 className="modal-title">
                <BackButtonSvg onClick={handleCancelButton} />
                {modelAction === "Add"
                  ? getCrudPopUpTitleName("Add", moduleName)
                  : getCrudPopUpTitleName("Update", moduleName)}
              </h3>
              <div className="separator mb-3"></div>
              <div className="template-height scrollbar" id="style-1">
                <div className="tab-content force-overflow">
                  <div className="rt-card">
                  <div className="rt-card__head">
                    <span className="rt-card__icon">
                      <i className="ri-notification-3-line"></i>
                    </span>
                    <div>
                      <h4 className="rt-card__title">Reminder Details</h4>
                      <p className="rt-card__desc">
                        Name, email template, recipient and which documents it applies to.
                      </p>
                    </div>
                  </div>
                  <div className="row">
                    <SAPredefinedChangesNotifyMessageModel Params={{ moduleName: moduleName, SAChanges: location.state.Type }} />

                    <div className="col-lg-6">
                      <div className="mb-3">
                        <label className="form-label">
                          Reminder Name <span className="text-danger">*</span>
                        </label>
                        <div className="input-group input-height">
                          <input
                            type="text"
                            className="input-text"
                            placeholder="Enter Reminder Name"
                            value={reminderObj.reminderName}
                            onChange={handleReminderNameChange}
                            required
                            maxLength={100}
                          />
                        </div>

                        {requireErrorMessage &&
                          (reminderObj.reminderName === "" ||
                            reminderObj.reminderName === undefined) ? (
                          <label className="validation">{ERROR_MESSAGES}</label>
                        ) : (
                          ""
                        )}
                      </div>
                    </div>

                    <div className="col-lg-6">
                      <div className="mb-3">
                        <label className="form-label">
                          Email Templates <span className="text-danger">*</span>
                        </label>
                        <div className="input-group">
                          <Select
                            className="user-role-select"
                            placeholder="Select..."
                            options={emailTemplateTypeLookupList}
                            value={templateTypeFilter}
                            onChange={(selectedOption) =>
                              setReminderObj((prev) => ({
                                ...prev,
                                emailTemplate: selectedOption
                                  ? selectedOption.value
                                  : null,
                              }))
                            }
                          />
                        </div>
                        {requireErrorMessage &&
                          (reminderObj.emailTemplate === "" ||
                            reminderObj.emailTemplate === undefined ||
                            reminderObj.emailTemplate === null) ? (
                          <label className="validation">{ERROR_MESSAGES}</label>
                        ) : (
                          ""
                        )}
                      </div>
                    </div>


                    <div className="col-lg-6">
                      <div className="mb-3">
                        <label className="form-label">
                          Email Address <span className="text-danger">*</span>
                        </label>
                        <div className="input-group">
                          <Select
                            className="user-role-select"
                            placeholder="Select..."
                            options={emailAddressTypeLookupList}
                            value={TemplateEmailAddress}
                            // onChange={(e) => setReminderObj.emailAddress(e.value)}
                            onChange={(selectedOption) => {
                              setReminderObj((prev) => ({
                                ...prev,
                                emailAddress: selectedOption
                                  ? selectedOption.value
                                  : null,
                              }))
                              GetTriggerPointTypeData(selectedOption.value, selectedOption.emailAddressIDType)
                            }
                            }
                          />
                        </div>
                        {requireErrorMessage &&
                          (reminderObj.emailAddress == "" ||
                            reminderObj.emailAddress == undefined) ? (
                          <label className="validation">{ERROR_MESSAGES}</label>
                        ) : (
                          ""
                        )}
                      </div>
                    </div>

                    <div className="col-lg-6">
                      <div className="mb-3">
                        <label className="form-label">
                          Document Status
                          <span className="text-danger">*</span>
                        </label>
                        <div className="input-group">
                          <Select
                            isMulti
                            className="user-role-select"
                            placeholder="Select..."
                            options={documentStatusTypeLookupList}
                            value={documentStatusValue}
                            onChange={handleSelectChange}
                          />
                        </div>
                        {requireErrorMessage && (
                          <label className="validation">
                            {!reminderObj.status || reminderObj.status.length === 0
                              ? ERROR_MESSAGES
                              : ""}
                          </label>
                        )}
                      </div>
                    </div>
                  </div>
                  </div>
                  <div className="rt-card">
                  <div className="rt-card__head">
                    <span className="rt-card__icon">
                      <i className="ri-timer-line"></i>
                    </span>
                    <div>
                      <h4 className="rt-card__title">Schedule</h4>
                      <p className="rt-card__desc">
                        When the reminder is sent and whether it repeats.
                      </p>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-lg-6">
                      <div className="row">
                        <div className="col-lg-6">
                          <div className="mb-3">
                            <label className="form-label">
                              Days <span className="text-danger">*</span>
                            </label>

                            <div className="input-group input-height">
                              <input
                                type="text"
                                className="input-text"
                                placeholder="Enter Days"
                                value={reminderObj.days}
                                onChange={handleDaysChange}
                                required
                                maxLength={3}
                                onInput={(e) => {
                                  e.target.value = e.target.value.replace(
                                    /[^0-9]/g,
                                    ""
                                  );
                                }}
                              />
                            </div>
                            {requireErrorMessage &&
                              (reminderObj.days === "" ||
                                reminderObj.days === undefined) ? (
                              <label className="validation">
                                {ERROR_MESSAGES}
                              </label>
                            ) : (
                              ""
                            )}
                          </div>
                        </div>

                        <div className="col-lg-6">
                          <div className="mb-3">
                            <label className="form-label">
                              Sequence <span className="text-danger">*</span>
                            </label>
                            <div className="input-group">
                              <Select
                                className="user-role-select"
                                placeholder="Select..."
                                options={Utils.periods}
                                value={Sequence}
                                onChange={(selectedOption) => {
                                  setReminderObj((prevState) => ({
                                    ...prevState,
                                    period: selectedOption.value,
                                  }));
                                }}
                              />
                            </div>
                            {requireErrorMessage &&
                              (reminderObj.period == "" ||
                                reminderObj.period == undefined) ? (
                              <label className="validation">
                                {ERROR_MESSAGES}
                              </label>
                            ) : (
                              ""
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="col-lg-6">
                      <div className="mb-3">
                        <label className="form-label">
                          Trigger Point <span className="text-danger">*</span>
                        </label>
                        <div className="input-group">
                          <Select
                            className="user-role-select"
                            placeholder="Select..."
                            options={triggerPointTypeLookupList}
                            value={TriggerPoints}
                            onChange={(selectedOption) =>
                              setReminderObj((prev) => ({
                                ...prev,
                                triggerPoint: selectedOption
                                  ? selectedOption.value
                                  : null,
                              }))
                            }
                          />
                        </div>
                        {requireErrorMessage && (reminderObj.triggerPoint == "" || reminderObj.triggerPoint == undefined) ?
                          <label className="validation">
                            {ERROR_MESSAGES}
                          </label> : ""
                        }
                      </div>
                    </div>

                    <div className="col-lg-6">
                      <div className="row">
                        <div className="col-lg-6">
                          <div className="mb-3">
                            <label className="form-label">
                              Repeat <span className="text-danger">*</span>
                            </label>
                            <div className="input-group">
                              <Select
                                className="user-role-select"
                                placeholder="Select..."
                                options={Utils.repeats}
                                value={Repeat}
                                onChange={(selectedOption) => {
                                  setReminderObj((prevState) => ({
                                    ...prevState,
                                    repeats: selectedOption.value,
                                  }));
                                }}
                              />
                            </div>
                          </div>
                        </div>

                        {reminderObj.repeats && reminderObj.repeats === 1 && (
                          <div className="col-lg-6">
                            <div className="mb-3">
                              <label className="form-label">
                                Choose Frequency{" "}
                                <span className="text-danger">*</span>
                              </label>
                              <div className="input-group">
                                <Select
                                  className="user-role-select"
                                  placeholder="Select..."
                                  options={frequencyTypeLookupList}
                                  value={frequencyValue}
                                  onChange={(selectedOption) =>
                                    setReminderObj((prev) => ({
                                      ...prev,
                                      frequency: selectedOption
                                        ? selectedOption.value
                                        : null,
                                    }))
                                  }
                                />
                              </div>
                              {requireErrorMessage && (
                                <label className="validation">
                                  {reminderObj.frequency == "" || reminderObj.frequency == undefined
                                    ? ERROR_MESSAGES
                                    : ""}
                                </label>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  </div>
                </div>
              </div>
              <label
                style={{ display: "flex", justifyContent: "center" }}
                className="validation"
              >
                {errorMessage?.replace(/quote/gi, proposalName)  // "gi" for case-insensitive replacement
                  .replace(/contract/gi, EngagementName)}
              </label>
              <div className="separator"></div>
              <div className="row fieldset modal-footer rt-footer">
                <div className="col-lg-12 hstack gap-2 justify-content-end text-right mt-3">
                  {location.state?.Type ? (<>
                    <button
                      type="submit"
                      class="btn btn-md btn-success accept-item-btn"
                      onClick={() => {
                        AddUpdateValidateReminder("Accept");
                      }}
                    >
                      <span>
                        Accept
                      </span>
                    </button>
                    <button
                      type="submit"
                      class="btn btn-md btn-success declined-item-btn"
                      // data-bs-dismiss="modal"
                      onClick={() => DeclineSuperAdminChangesData("Decline")}
                    >
                      <span>
                        Decline
                      </span>
                    </button>
                  </>) : (<>
                    <button
                      className="btn btn-md btn-light"
                      onClick={handleCancelButton}
                    >
                      <span>Cancel</span>
                    </button>
                    <button
                      className="btn btn-md btn-success create-item-btn"
                      onClick={() => AddUpdateValidateReminder()}
                    >
                      <span>
                        {modelAction === "Add"
                          ? getCrudButtonTextName("Add", moduleName)
                          : getCrudButtonTextName("Update", moduleName)}
                      </span>
                    </button>
                  </>)
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <AcceptSuperAdminChangesConfirmation
        openErrorModal={openErrorModal}
        ModelId={props.id}
        Status={Status}
        openSuccessModal={openSuccessModal}
        modelRequestData={location.state}
        UpdatedChanges={handleConfirmButton}
      />
      <SuccessModal
        handleClose={handleClose}
        setOpenSuccessModal={setOpenSuccessModal}
        openSuccessModal={openSuccessModal}
        modelAction={modelAction}
        setIsCheck={setIsCheck}
        isCheck={isCheck}
        message={` ${moduleName} ${reminderObj.reminderName}`}
      />
    </>
  );
}

export default AddUpdateReminder;
