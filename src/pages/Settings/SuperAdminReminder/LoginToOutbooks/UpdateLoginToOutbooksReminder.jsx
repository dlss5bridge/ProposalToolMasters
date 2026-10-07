import React, { useContext, useEffect, useState } from "react";
import Select from "react-select"; // Assuming you have react-select installed
import { AuthContextProvider } from "../../../../AuthContext/AuthContext";
import BackButtonSvg from "../../../../components/BackButtonSvg";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { GetEmailTemplateListLookupList } from "../../../../redux/Services/Config/TemplateApi";
import SuccessModal from "../../../../components/SuccessModal";
import { GetReminderModel } from "../../../../redux/Services/Config/ReminderCrudApi";
import {
  UpdatePaidAccount,
  UpdateUnpaidAccount,
} from "../../../../redux/Services/Setting/LoginToOutbooksReminder";
import { ERROR_MESSAGES } from "../../../../components/GlobalMessage";
import Utils from "../../../../Middleware/Utils";

import { GetEmailAddressTypeLookupList, GetTriggerPointTypeLookupList } from "../../../../redux/Services/Config/ReminderApi";
import { useSelector } from "react-redux";

function UnpaidUpdateAccountDeletion() {
  const navigate = useNavigate();
  const { id } = useParams();
  const moduleName = "Reminder";

  const handleCancelButton = () => {
    setTopbar("block");
    navigate("/paid-unpaid-list");
  };

  const {
    setTopbar,
    setLoader,
    getCrudPopUpTitleName,
    proposalName,
    EngagementName,
  } = useContext(AuthContextProvider);

  const common = useSelector((state) => state.Storage); // Getting Logged Users Details From Persist Storage of redux hooks
  const location = useLocation();
  const [emailTemplateTypeLookupList, setEmailTemplateTypeLookupList] =
    useState([]);
  const [templateTypeID, setTemplateTypeID] = useState(null);
  const [modelAction, setModelAction] = useState("");
  const [dismissModal, setDismissModal] = useState(null);
  const [ErrorMessage, setErrorMessage] = useState({});
  const [requireErrorMessage, setRequireErrorMessage] = useState(false);
  const [emailAddressTypeLookupList, setEmailAddressTypeLookupList] = useState(
    []
  );
  const [openSuccessModal, setOpenSuccessModal] = useState(false);
  const [triggerPointTypeLookupList, setTriggerPointTypeLookupList] = useState(
    []
  );

  const [reminderObj, setReminderObj] = useState({
    reminderName: null,
    reminderNameType: null,
    reminderKeyID: id,
    organisationKeyID: null,
    userKeyID: null,
    templateID: null,
    emailAddressID: null,
    days: null, // Convert days to integer if not empty
    sequenceID: null,
    triggerPointID: null,
    isRepeat: null,
    reminderFrequencyID: null,
    documentStatusIDs: null,
    triggerPointID: null
  });

  useEffect(() => {
    setTopbar("none");

  }, []);

  useEffect(() => {

    if (location?.state) {
      setTemplateTypeID(location.state.templateTypeID);
      GetEmailTemplateTypeData(location.state.templateTypeID);
      setModelAction(location.state?.Action || "Unpaid"); // If Action is undefined or null, set to "Unpaid"
      GetReminderModelData(location.state.reminderKeyID);

      GetEmailAddressTypeData(location.state?.reminderTypeID)

    }
    setTopbar("none");
  }, [location.state, id]);

  const titleVariable = location.state?.listType;

  const GetEmailTemplateTypeData = async (TemplateTypeID) => {
    setLoader(true)
    try {
      const data = await GetEmailTemplateListLookupList(
        common.organisationKeyID,
        common.userKeyID,
        6,
        TemplateTypeID === undefined ? templateTypeID : TemplateTypeID
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
        setErrorMessage(data.data.errorMessage)
        setLoader(false)
      }
    } catch (error) {
      console.log(error);
    }
  };
  const GetTriggerPointTypeData = async (Id, emailAddressID, emailAddressIDType) => {
    setLoader(true)
    try {
      const data = await GetTriggerPointTypeLookupList(Id, emailAddressID, emailAddressIDType);
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

  const GetReminderModelData = async (id) => {
    if (!id) return;
    try {
      setLoader(true);
      const data = await GetReminderModel(id);
      if (data?.data?.statusCode === 200) {
        if (data?.data?.responseData?.data) {
          const ModelData = data?.data?.responseData?.data;
          setReminderObj({
            ...reminderObj,
            reminderKeyID: ModelData.reminderKeyID,
            reminderName: ModelData.reminderName,
            templateID: ModelData.templateID,
            emailAddressID: ModelData.emailAddressID,
            days: ModelData.days,
            sequenceID: ModelData.sequenceID,
            triggerPointID: ModelData.triggerPointID,
            isRepeat: ModelData.isRepeat,
            reminderFrequencyID: ModelData.reminderFrequencyID,
            documentStatusIDs: ModelData.documentStatusIDs,
            reminderNameType: location.state.reminderNameType
          });
          GetTriggerPointTypeData(location.state?.reminderTypeID, ModelData.emailAddressID, ModelData.emailAddressIDType)
        }
      } else {
        setErrorMessage(data?.data?.errorMessage);
      }
      setLoader(false);
    } catch (error) {
      console.log(error);
      setLoader(false);
    }
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


  };
  const GetEmailAddressTypeData = async (Id) => {
    try {
      const data = await GetEmailAddressTypeLookupList(Id);
      let emailAddressTypeData = data?.data?.responseData.data;
      emailAddressTypeData = emailAddressTypeData.map((emailAddressType) => ({
        value: emailAddressType.emailAddressID,
        label: emailAddressType.emailAddressName,
      }));
      setEmailAddressTypeLookupList(emailAddressTypeData);
    } catch (error) {
      console.log(error);
    }
  };
  const templateTypeFilter = emailTemplateTypeLookupList?.filter(
    (template) => template.value == reminderObj.templateID
  );
  const TriggerPoints = triggerPointTypeLookupList?.find(
    (trigger) => trigger.value == reminderObj.triggerPointID
  );
  const SequenceTypeFilter = Utils.periods?.filter(
    (sequence) => sequence.value === reminderObj.sequenceID
  );
  const TemplateEmailAddress = emailAddressTypeLookupList?.find(
    (emailTemp) => emailTemp.value === reminderObj.emailAddressID
  );
  const marketingReminderAddUpdateBtnClick = async () => {
    // Check for required fields
    if (
      reminderObj.reminderName === undefined ||
      reminderObj.reminderName === null ||
      reminderObj.reminderName === "" ||

      reminderObj.templateID === undefined ||
      reminderObj.templateID === null ||
      reminderObj.templateID === "" ||

      reminderObj.days === undefined ||
      reminderObj.days === null ||
      reminderObj.days === "" ||
      reminderObj.triggerPointID === null ||
      reminderObj.triggerPointID === "" ||
      reminderObj.triggerPointID === undefined

    ) {
      setRequireErrorMessage(true); // Show common error message
      return false; // Validation failed
    }
    if (location.state.greaterDay !== null && location.state.greaterDay <= reminderObj.days) {
      setRequireErrorMessage(true);
      return false;
    }

    if (location.state.lessDay !== null && location.state.lessDay >= reminderObj.days) {
      setRequireErrorMessage(true);
      return false;
    }

    if (location.state.greaterDay !== null && location.state.lessDay !== null &&
      location.state.greaterDay <= reminderObj.days && location.state.lessDay >= reminderObj.days) {
      setRequireErrorMessage(true);
      return false;
    }

    const formData = {
      reminderKeyID: location.state?.reminderKeyID,
      organisationKeyID: common.organisationKeyID,
      userKeyID: common.userKeyID,
      reminderName: reminderObj.reminderName,
      templateID: reminderObj.templateID,
      emailAddressID: reminderObj.emailAddressID || null,
      days: reminderObj.days === "" ? null : parseInt(reminderObj.days),
      sequenceID: reminderObj.sequenceID ? reminderObj.sequenceID : null,
      triggerPointID: reminderObj.triggerPointID || null,
      isRepeat: reminderObj.isRepeat || null,
      reminderFrequencyID: reminderObj.reminderFrequencyID || null,
      documentStatusIDs: reminderObj.documentStatusIDs || null,
    };

    try {
      let response;
      if (modelAction === "Paid") {
        response = await UpdatePaidAccount(
          "/AddUpdateLoginToOutbooksReminderPaidUser",
          formData
        );
      } else {
        response = await UpdateUnpaidAccount(
          "/AddUpdateLoginToOutbooksReminderUnpaidUser",
          formData
        );
      }

      if (response?.data?.statusCode === 200) {
        setOpenSuccessModal(true);
      } else {
        console.error(response?.response?.data?.errorMessage);
      }
    } catch (error) {
      console.error("API call error:", error);
    }

  };

  const handleClose = () => {
    setOpenSuccessModal(false);
    navigate("/paid-unpaid-list");
  };

  return (
    <>
      <div className="container-fluid new-item-page-container">
        <div className="new-item-page-content">
          <div className="row form-row">
            <div className="col-lg-12">
              <h3 className="modal-title">
                <BackButtonSvg onClick={handleCancelButton} />
                {titleVariable === "Unpaid"
                  ? getCrudPopUpTitleName("Unpaid", moduleName)
                  : getCrudPopUpTitleName("Paid", moduleName)}
              </h3>
              <div class="separator mb-3"></div>
              <div className="template-height scrollbar" id="style-1">
                <div className="tab-content force-overflow">
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
                          Reminder Type <span className="text-danger">*</span>
                        </label>
                        <div className="input-group input-height">
                          <input
                            type="text"
                            readOnly
                            className="input-text"
                            placeholder="Enter Reminder Name"
                            value={reminderObj.reminderNameType?.replace(/_/g, ' ')}
                            onChange={handleReminderNameChange}
                            required
                            maxLength={100}
                          />
                        </div>

                        {requireErrorMessage &&
                          (reminderObj.reminderNameType === "" ||
                            reminderObj.reminderNameType === undefined) ? (
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
                            classNamePrefix="app-select"
                            className="user-role-select"
                            placeholder="Select..."
                            options={emailTemplateTypeLookupList}
                            value={templateTypeFilter}
                            onChange={(selectedOption) =>
                              setReminderObj((prev) => ({
                                ...prev,
                                templateID: selectedOption
                                  ? selectedOption.value
                                  : null,
                              }))
                            }
                          />
                        </div>
                        {requireErrorMessage &&
                          (reminderObj.templateID === "" ||
                            reminderObj.templateID === undefined ||
                            reminderObj.templateID === null) ? (
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
                            classNamePrefix="app-select"
                            isDisabled
                            className="user-role-select"
                            placeholder="Select..."
                            options={emailAddressTypeLookupList}
                            value={TemplateEmailAddress}
                            // onChange={(e) => setReminderObj.emailAddressID(e.value)}
                            onChange={(selectedOption) => {
                              setReminderObj((prev) => ({
                                ...prev,
                                emailAddressID: selectedOption
                                  ? selectedOption.value
                                  : null,
                              }))
                              GetTriggerPointTypeData(location.state?.reminderTypeID, selectedOption.value, selectedOption.emailAddressIDType)
                            }
                            }
                          />
                        </div>
                        {requireErrorMessage &&
                          (reminderObj.emailAddressID == "" ||
                            reminderObj.emailAddressID == undefined) ? (
                          <label className="validation">{ERROR_MESSAGES}</label>
                        ) : (
                          ""
                        )}
                      </div>
                    </div>
                    <div className="col-lg-3">
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
                        {
                          requireErrorMessage &&
                          (
                            // Check if reminderObj.days is empty or undefined
                            (reminderObj.days === "" || reminderObj.days === undefined) ? (
                              <label className="validation">
                                {ERROR_MESSAGES}
                              </label>
                            ) : (
                              // Check if both greaterDay and lessDay are present and days fall in between
                              (location.state.greaterDay !== null && location.state.lessDay !== null) ? (
                                (reminderObj.days >= location.state.greaterDay || reminderObj.days <= location.state.lessDay) ? (
                                  <label className="validation">
                                    Select a day between {location.state.lessDay} and {location.state.greaterDay}
                                  </label>
                                ) : ""
                              ) : (
                                // If only lessDay is present and reminderObj.days is less
                                location.state.greaterDay === null && location.state.lessDay !== null && reminderObj.days <= location.state.lessDay ? (
                                  <label className="validation">
                                    Select a day greater than {location.state.lessDay}
                                  </label>
                                ) : (
                                  // If only greaterDay is present and reminderObj.days is greater
                                  location.state.lessDay === null && location.state.greaterDay !== null && reminderObj.days >= location.state.greaterDay ? (
                                    <label className="validation">
                                      Select a day less than {location.state.greaterDay}
                                    </label>
                                  ) : ""
                                )
                              )
                            )
                          )
                        }
                      </div>
                    </div>
                    <div className="col-lg-3">
                      <div className="mb-3">
                        <label className="form-label">
                          Sequence <span className="text-danger">*</span>
                        </label>
                        <div className="input-group">
                          <Select
                            classNamePrefix="app-select"
                            className="user-role-select"
                            placeholder="Select..."
                            options={Utils.periods}
                            value={SequenceTypeFilter}
                            onChange={(selectedOption) => {
                              setReminderObj((prevState) => ({
                                ...prevState,
                                sequenceID: selectedOption.value,
                              }));
                            }}
                          />
                        </div>
                        {requireErrorMessage && !reminderObj.sequenceID ? (
                          <label className="validation">{ERROR_MESSAGES}</label>
                        ) : null}
                      </div>
                    </div>
                    <div className="col-lg-6">
                      <div className="mb-3">
                        <label className="form-label">
                          Trigger Point <span className="text-danger">*</span>
                        </label>
                        <div className="input-group">
                          <Select
                            classNamePrefix="app-select"
                            isDisabled
                            className="user-role-select"
                            placeholder="Select..."
                            options={triggerPointTypeLookupList}
                            value={TriggerPoints}
                            onChange={(selectedOption) =>
                              setReminderObj((prev) => ({
                                ...prev,
                                triggerPointID: selectedOption
                                  ? selectedOption.value
                                  : null,
                              }))
                            }
                          />
                        </div>
                        {requireErrorMessage && (reminderObj.triggerPointID == "" || reminderObj.triggerPointID == undefined) ?
                          <label className="validation">
                            {ERROR_MESSAGES}
                          </label> : ""
                        }
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="separator"></div>
              <div className="row fieldset modal-footer">
                <div className="col-lg-12 hstack gap-2 justify-content-end text-right mt-3">
                  <button
                    className="btn btn-md btn-light"
                    onClick={handleCancelButton}
                  >
                    <span>Cancel</span>
                  </button>
                  <button
                    className="btn btn-md btn-success create-item-btn"
                    onClick={marketingReminderAddUpdateBtnClick}
                  >
                    <span>
                      {titleVariable === "Unpaid"
                        ? `Update Unpaid ${moduleName}`
                        : `Update Paid ${moduleName}`}
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
        message={`${moduleName}  ${reminderObj.reminderName}`}
      />
    </>
  );
}

export default UnpaidUpdateAccountDeletion;