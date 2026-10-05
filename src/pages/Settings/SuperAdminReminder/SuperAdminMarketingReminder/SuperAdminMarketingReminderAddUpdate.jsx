import React, { useContext, useEffect, useState } from "react";
import Select from "react-select";
import { AuthContextProvider } from "../../../../AuthContext/AuthContext";
import BackButtonSvg from "../../../../components/BackButtonSvg";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import DatePicker from "react-date-picker";
import "react-date-picker/dist/DatePicker.css";
import "react-calendar/dist/Calendar.css";
import SuccessModal from "../../../../components/SuccessModal";
import "../../../../pages/configure/packages/Package.css";
import "../../../configure/services/ServiceStyle.css";
import "../../../configure/Reminder/ReminderEmailTemplate/AddReminderTemplate-redesign.css";
import "../../../configure/Reminder/Reminders/AddUpdateReminder-redesign.css";
import "./SuperAdminMarketingReminderAddUpdate-redesign.css";
import { ERROR_MESSAGES } from "../../../../components/GlobalMessage";
import { useDispatch, useSelector } from "react-redux";
import { EmailTemplates, MarketingEmailAddressIdType } from "../../../../Middleware/enums";
import {
  GetEmailAddressTypeLookupList,
  GetTriggerPointTypeLookupList,
  GetFrequencyLookUpList,
  GetDocumentStatusTypeLookUpList,
} from "../../../../redux/Services/Config/ReminderApi";
import { GetEmailTemplateListLookupList } from "../../../../redux/Services/Config/TemplateApi";

import {
  AddUpdateMarketingReminder,
  GetMarketingReminderList,
  GetMarketingReminderModel,
  MarketingAddUpdateReminders,
} from "../../../../redux/Services/Setting/MarketingReminderApi";
import SuperAdminMarketingReminderList from "./SuperAdminMarketingReminderList";
import Utils from "../../../../Middleware/Utils";

function SuperAdminMarketingReminderAddUpdate(props) {
  const moduleName = "Other Reminder";
  const today = new Date();
  const minDate = new Date(1970, 0, 1);
  // Set the maximum date to today
  const maxDate = today;
  const navigate = useNavigate();
  const location = useLocation();
  const [reminderMarketingObj, setReminderMarketingObj] = useState({
    reminderKeyID: null,
    reminderName: "",
    subscriptionPackageID: null,
    emailAddressIDType: null,
    templateID: null,
    emailAddressID: null,
    days: 1,
    period: 1,
    triggerPointID: null,
    isRepeat: 2,
    customDate: null, // This should be null initially
    reminderFrequencyID: null,
  });
  const [openSuccessModal, setOpenSuccessModal] = useState(false);
  const [requireErrorMessage, setRequireErrorMessage] = useState(false);
  const [dismissModal, setDismissModal] = useState(null);
  const [frequencyTypeLookupList, setFrequencyTypeLookupList] = useState([]);
  const [emailAddressTypeLookupList, setEmailAddressTypeLookupList] = useState(
    []
  );
  const [emailTemplateTypeLookupList, setEmailTemplateTypeLookupList] =
    useState([]);
  const [triggerPointTypeLookupList, setTriggerPointTypeLookupList] = useState(
    []
  );
  const [modelAction, setModelAction] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const {
    setTopbar,
    setLoader,
    getCrudButtonTextName,
    getCrudPopUpTitleName,
    proposalName,
    EngagementName,
    prospectName
  } = useContext(AuthContextProvider);
  const common = useSelector((state) => state.Storage); //Getting Logged Users Details From Persist Storage of redux hooks

  useEffect(() => {
    setModelAction(
      location?.state?.Action === undefined || location?.state?.Action === null
        ? "Add"
        : "Update"
    ); //Do not change this naming convention
    GetFrequencyTypeData();
    setTopbar("none");
    GetMarketingReminderModelData(location.state?.reminderKeyID);

    GetEmailTemplateTypeData()
    GetEmailAddressTypeData()
  }, [location.state]);

  const GetMarketingReminderModelData = async (id) => {
    if (!id) {
      return;
    }
    try {
      setLoader(true);
      const data = await GetMarketingReminderModel(id);
      if (data?.data?.statusCode === 200) {
        if (data?.data?.responseData?.data) {
          const ModelData = data?.data?.responseData?.data;
          setReminderMarketingObj({
            ...reminderMarketingObj,
            reminderKeyID: ModelData.reminderKeyID,
            templateID: ModelData.templateID,
            reminderName: ModelData.reminderName,
            emailAddressID: ModelData.emailAddressID,
            subscriptionPackageID: ModelData.subscriptionPackageID,
            triggerPointID: ModelData.triggerPointID,
            emailAddressIDType: ModelData.emailAddressID !== null ? MarketingEmailAddressIdType.EmailAddressID : MarketingEmailAddressIdType.SubscriptionPackageID,
            reminderFrequencyID: ModelData.reminderFrequencyID,
            days: ModelData.days,
            customDate: ModelData.customDate,
            sequenceID: ModelData.sequenceID,
            isRepeat: ModelData.isRepeat ? 1 : 2, // Assuming 1 is for Yes, 2 is for No
          });

          GetTriggerPointTypeData(ModelData.emailAddressID === null ? ModelData.subscriptionPackageID : ModelData.emailAddressID, ModelData.emailAddressIDType)

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

  // Rest of the component code...

  const handleCancelButton = () => {
    setTopbar("block");
    navigate("/marketing-reminder");
  };

  const handleReminderNameChange = (e) => {
    const inputValue = e.target.value;
    const trimmedValue = inputValue.replace(/^\s+/g, "");
    const singleSpaceValue = trimmedValue.replace(/\s{2,}/g, " ");
    const sanitizedValue = singleSpaceValue.replace(/ \./g, " ");
    const capitalizedValue =
      sanitizedValue.charAt(0).toUpperCase() + sanitizedValue.slice(1);
    setReminderMarketingObj({
      ...reminderMarketingObj,
      reminderName: capitalizedValue,
    });

  };

  const handleDaysChange = (e) => {
    const value = e.target.value;
    if (
      value === "" ||
      (value.match(/^[1-9][0-9]{0,2}$/) && parseInt(value) <= 365)
    ) {
      // setDays(value);
      setReminderMarketingObj({
        ...reminderMarketingObj,
        days: value,
      });
    }
  };

  const AddUpdateMarketingReminderBtnClick = async () => {
    if (
      reminderMarketingObj.reminderName == undefined ||
      reminderMarketingObj.reminderName == null ||
      reminderMarketingObj.reminderName == "" ||
      reminderMarketingObj.templateID == undefined ||
      reminderMarketingObj.templateID == null ||
      reminderMarketingObj.templateID == "" ||
      (MarketingEmailAddressIdType.EmailAddressID === reminderMarketingObj.emailAddressIDType ?
        reminderMarketingObj.emailAddressID === undefined ||
        reminderMarketingObj.emailAddressID === null ||
        reminderMarketingObj.emailAddressID === "" :
        reminderMarketingObj.subscriptionPackageID === undefined ||
        reminderMarketingObj.subscriptionPackageID === null ||
        reminderMarketingObj.subscriptionPackageID === "") ||
      reminderMarketingObj.days == undefined ||
      reminderMarketingObj.days == null ||
      reminderMarketingObj.days == "" ||
      reminderMarketingObj.triggerPointID == undefined ||
      reminderMarketingObj.triggerPointID == null ||
      (reminderMarketingObj.triggerPointID === 15 &&
        !reminderMarketingObj.customDate) ||
      reminderMarketingObj.isRepeat == undefined ||
      reminderMarketingObj.isRepeat == null ||
      reminderMarketingObj.isRepeat == "" ||
      (reminderMarketingObj.isRepeat === 1 &&
        reminderMarketingObj.reminderFrequencyID === null)
    ) {
      setRequireErrorMessage(true);
      return false;
    }

    const daysInt = parseInt(reminderMarketingObj.days);

    const Api_Params = {
      reminderKeyID: reminderMarketingObj.reminderKeyID,
      organisationKeyID: common.organisationKeyID,
      userKeyID: common.userKeyID,
      reminderName: reminderMarketingObj.reminderName,
      templateID: reminderMarketingObj.templateID,
      emailAddressID: reminderMarketingObj.emailAddressID,
      subscriptionPackageID: reminderMarketingObj.subscriptionPackageID,
      days: isNaN(daysInt) ? "" : daysInt,
      sequenceID: reminderMarketingObj.period,
      triggerPointID: reminderMarketingObj.triggerPointID,
      customDate:
        reminderMarketingObj.triggerPointID === 15
          ? reminderMarketingObj.customDate
          : null,
      isRepeat: reminderMarketingObj.isRepeat === 1, // Set isRepeat based on the condition
      reminderFrequencyID:
        reminderMarketingObj.isRepeat === 1
          ? reminderMarketingObj.reminderFrequencyID
          : null,

      documentStatusIDs: null,
    }

    AddUpdateMarketReminderData(Api_Params)

  };

  const AddUpdateMarketReminderData = async (api_param) => {
    setLoader(true)
    try {
      const response = await AddUpdateMarketingReminder(api_param)
      if (response?.data?.statusCode === 200) {
        setOpenSuccessModal(true);
        setLoader(false)
      } else {
        setLoader(false)
        console.error(response?.response?.data?.errorMessage);
      }
    } catch (error) {
      setLoader(false)
      console.error(error);
    }
  }

  const handleClose = () => {
    setOpenSuccessModal(false);
    navigate("/marketing-reminder");
  };

  const GetFrequencyTypeData = async () => {
    setLoader(true)
    try {
      const data = await GetFrequencyLookUpList();
      if (data) {
        if (data?.data?.statusCode === 200) {
          setLoader(false)
          let frequencyTypeData = data?.data?.responseData.data;
          frequencyTypeData = frequencyTypeData.map((frequencyType) => ({
            value: frequencyType.reminderFrequencyID,
            label: frequencyType.reminderFrequencyName,
          }));
          setFrequencyTypeLookupList(frequencyTypeData);
        } else {
          setLoader(false)
        }
      }
    } catch (error) {
      setLoader(false)
      console.log(error);
    }
  };

  const GetEmailAddressTypeData = async () => {
    try {
      const data = await GetEmailAddressTypeLookupList(4);
      if (data?.data?.statusCode === 200) {
        let emailAddressTypeData = data?.data?.responseData.data;
        emailAddressTypeData = emailAddressTypeData.map((emailAddressType) => ({
          value: emailAddressType.emailAddressID,
          label: emailAddressType.emailAddressName?.replace(/prospects/gi, prospectName),
          emailAddressIDType: emailAddressType.emailAddressIDType
        }));
        setEmailAddressTypeLookupList(emailAddressTypeData);
      } else {
        setLoader(false)
      }
    } catch (error) {
      setLoader(false)
      console.log(error);
    }
  };
  const GetTriggerPointTypeData = async (emailAddressID, emailAddressIDType) => {
    setLoader(true)
    try {
      const data = await GetTriggerPointTypeLookupList(4, emailAddressID, emailAddressIDType);
      if (data?.data?.statusCode === 200) {
        setLoader(false)
        let triggerPointTypeData = data?.data?.responseData?.data;
        triggerPointTypeData = triggerPointTypeData
          .map((triggerPointID) => {
            let label = triggerPointID.triggerPointName;

            // Replace "Contract" with "EL" in the label
            if (label.includes("Contract")) {
              label = label.replace("Contract", EngagementName);
            }

            // Replace "Quote" with "Proposal" in the label
            if (label.includes("Quote")) {
              label = label.replace("Quote", proposalName);
            }

            return {
              value: triggerPointID.triggerPointID,
              label: label,
            };
          })
          .filter(Boolean); // Filters out any false values (e.g., null, undefined, etc.)

        setTriggerPointTypeLookupList(triggerPointTypeData);
      } else {
        setLoader(false)
        setErrorMessage(data.data.errorMessage)
      }
    } catch (error) {
      console.log(error);
    }
  };

  const GetEmailTemplateTypeData = async () => {
    setLoader(true)
    try {
      const data = await GetEmailTemplateListLookupList(
        common.organisationKeyID,
        common.userKeyID,
        6,
        EmailTemplates.Reminder
      );
      if (data?.data?.statusCode === 200) {
        setLoader(false)
        let emailTemplateTypeData = data?.data?.responseData.data;
        emailTemplateTypeData = emailTemplateTypeData.map((TempType) => ({
          value: TempType.templateID,
          label: TempType.templateName,
        }));
        setEmailTemplateTypeLookupList(emailTemplateTypeData);
      } else {
        setLoader(false)
        setErrorMessage(data.data.errorMessage)
      }
    } catch (error) {
      setLoader(false)
      console.log(error);
    }
  };
  const TriggerPoints = triggerPointTypeLookupList?.find(
    (trigger) => trigger.value == reminderMarketingObj.triggerPointID
  );
  const TemplateEmailAddress = emailAddressTypeLookupList?.find((emailTemp) =>
    (reminderMarketingObj.emailAddressID === null
      ? emailTemp.value === reminderMarketingObj.subscriptionPackageID
      : emailTemp.value === reminderMarketingObj.emailAddressID) &&
    emailTemp.emailAddressIDType === reminderMarketingObj.emailAddressIDType
  );


  return (
    <>
      <div className="container-fluid new-item-page-container rt-form rm-form mkr-form">
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
                        Name, email template and who receives this marketing reminder.
                      </p>
                    </div>
                  </div>
                  <div className="row">
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
                            value={reminderMarketingObj.reminderName}
                            onChange={handleReminderNameChange}
                            required
                            maxLength={100}
                          />
                        </div>

                        {requireErrorMessage &&
                          (reminderMarketingObj.reminderName === "" ||
                            reminderMarketingObj.reminderName === undefined) ? (
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
                            value={emailTemplateTypeLookupList.find(
                              (option) =>
                                option.value === reminderMarketingObj.templateID
                            )}
                            onChange={(selectedOption) =>
                              setReminderMarketingObj((prevState) => ({
                                ...prevState,
                                templateID: selectedOption.value,
                              }))
                            }
                          />
                        </div>
                        {requireErrorMessage &&
                          (reminderMarketingObj.templateID === "" ||
                            reminderMarketingObj.templateID === undefined ||
                            reminderMarketingObj.templateID === null) ? (
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
                            // onChange={(e) => setReminderMarketingObj.emailAddressID(e.value)}
                            onChange={(selectedOption) => {
                              if (selectedOption.emailAddressIDType === MarketingEmailAddressIdType.EmailAddressID) {
                                setReminderMarketingObj((prev) => ({
                                  ...prev,
                                  emailAddressID: selectedOption ? selectedOption.value : null,
                                  subscriptionPackageID: null,
                                  emailAddressIDType: selectedOption.emailAddressIDType
                                }));
                              } else {
                                setReminderMarketingObj((prev) => ({
                                  ...prev,
                                  subscriptionPackageID: selectedOption ? selectedOption.value : null,
                                  emailAddressID: null,
                                  emailAddressIDType: selectedOption.emailAddressIDType
                                }));
                              }
                              GetTriggerPointTypeData(selectedOption.value, selectedOption.emailAddressIDType)
                            }}

                          />
                        </div>
                        {requireErrorMessage &&
                          (reminderMarketingObj.emailAddressID == "" ||
                            reminderMarketingObj.emailAddressID == undefined) ? (
                          <label className="validation">{ERROR_MESSAGES}</label>
                        ) : (
                          ""
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
                                value={reminderMarketingObj.days}
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
                            {/* {requireErrorMessage && (
                              <label className="validation">
                                {reminderMarketingObj.days === "" ||
                                reminderMarketingObj.days === undefined
                                  ? ERROR_MESSAGES
                                  : ""}
                              </label>
                            )} */}

                            {requireErrorMessage &&
                              (reminderMarketingObj.days === "" ||
                                reminderMarketingObj.days === undefined) ? (
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
                                value={Utils.periods.find(
                                  (period) =>
                                    period.value === reminderMarketingObj.period
                                )}
                                onChange={(selectedOption) => {
                                  setReminderMarketingObj((prevState) => ({
                                    ...prevState,
                                    period: selectedOption.value,
                                  }));
                                }}
                              />
                            </div>

                            {requireErrorMessage &&
                              (reminderMarketingObj.period == "" ||
                                reminderMarketingObj.period == undefined) ? (
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
                              setReminderMarketingObj((prev) => ({
                                ...prev,
                                triggerPointID: selectedOption
                                  ? selectedOption.value
                                  : null,
                              }))
                            }
                          />
                        </div>
                        {requireErrorMessage && (reminderMarketingObj.triggerPointID == "" || reminderMarketingObj.triggerPointID == undefined) ?
                          <label className="validation">
                            {ERROR_MESSAGES}
                          </label> : ""
                        }
                      </div>
                    </div>

                    {reminderMarketingObj.triggerPointID === 15 && (
                      <div className="col-lg-6">
                        <div className="mb-3">
                          <label class="form-label">
                            Custom Date <span className="text-danger">*</span>
                          </label>
                          {/* <div class="col-md-9 col-lg-6 col-sm-12 "> */}
                          <DatePicker
                            selected={reminderMarketingObj.customDate}
                            // onChange={(date) =>
                            //   setCustomDate(formatDate(date))
                            // }
                            onChange={(date) =>
                              setReminderMarketingObj((prevState) => ({
                                ...prevState,
                                customDate: date, // Set the selected date directly
                              }))
                            }
                            value={reminderMarketingObj.customDate}
                            format="dd/MM/y"
                            dayPlaceholder="dd"
                            monthPlaceholder="mm"
                            yearPlaceholder="yyyy"
                            style={{ width: "100%" }}

                          />
                          {/* </div> */}
                          {requireErrorMessage &&
                            reminderMarketingObj.triggerPointID === 15 &&
                            !reminderMarketingObj.customDate && (
                              <label className="validation">
                                {ERROR_MESSAGES}
                              </label>
                            )}
                        </div>
                      </div>
                    )}

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
                                value={Utils.repeats.find(
                                  (repeat) =>
                                    repeat.value === reminderMarketingObj.isRepeat
                                )}
                                onChange={(selectedOption) => {
                                  setReminderMarketingObj((prevState) => ({
                                    ...prevState,
                                    isRepeat: selectedOption.value,
                                  }));
                                }}
                              />
                            </div>
                          </div>
                        </div>

                        {reminderMarketingObj.isRepeat &&
                          reminderMarketingObj.isRepeat === 1 && (
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
                                    value={
                                      frequencyTypeLookupList.find(
                                        (freq) =>
                                          freq.value ===
                                          reminderMarketingObj.reminderFrequencyID
                                      ) || null
                                    }
                                    onChange={(selectedOption) =>
                                      setReminderMarketingObj((prev) => ({
                                        ...prev,
                                        reminderFrequencyID: selectedOption
                                          ? selectedOption.value
                                          : null,
                                      }))
                                    }
                                    isDisabled={
                                      reminderMarketingObj.isRepeat !== 1
                                    }
                                  />
                                </div>
                                {requireErrorMessage &&
                                  reminderMarketingObj.isRepeat === 1 &&
                                  reminderMarketingObj.reminderFrequencyID === null && (
                                    <label className="validation">
                                      {ERROR_MESSAGES}
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
                {errorMessage}
              </label>
              <div className="separator"></div>
              <div className="row fieldset modal-footer rt-footer">
                <div className="col-lg-12 hstack gap-2 justify-content-end text-right mt-3">
                  <button
                    className="btn btn-md btn-light"
                    onClick={handleCancelButton}
                  >
                    <span>Cancel</span>
                  </button>
                  <button
                    className="btn btn-md btn-success create-item-btn"
                    onClick={AddUpdateMarketingReminderBtnClick}
                  >
                    <span>
                      {modelAction === "Add"
                        ? getCrudButtonTextName("Add", moduleName)
                        : getCrudButtonTextName("Update", moduleName)}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <SuccessModal
        handleClose={handleClose}
        setDismissModal={setDismissModal}
        setOpenSuccessModal={setOpenSuccessModal}
        openSuccessModal={openSuccessModal}
        modelAction={modelAction}
        message={` ${moduleName} ${reminderMarketingObj.reminderName}`}
      />
    </>
  );
}
export default SuperAdminMarketingReminderAddUpdate;
