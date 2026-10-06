/* global $ */
import React, { useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Utils from "../../../../Middleware/Utils";
import "../../email_template/EmailTemplate.css";
import "./AddReminderTemplate-redesign.css";
import "../../../../styles/fancy-select.css";
import BinarySelect from "../../../../components/BinarySelect";
import { Row, Col } from "reactstrap";
import Select from "react-select";
import { AuthContextProvider } from "../../../../AuthContext/AuthContext";

import { useNavigate } from "react-router";
import { useSelector } from "react-redux";
import { GetTemplateTypeList } from "../../../../redux/Services/Master/TemplateTypeLookupListApi";
import { USER_ROLE_TYPE } from "../../../../Middleware/enums";
import AcceptSuperAdminChangesConfirmation from "../../../../components/AcceptSuperAdminChangesConfirmation";
import SuccessModal from "../../../../components/SuccessModal";
import { ERROR_MESSAGES } from "../../../../components/GlobalMessage";
import {
  GetReminderTemplatesModel,
  AddUpdateReminderTemplates,
} from "../../../../redux/Services/Config/ReminderTemplatesApi";
import BackButtonSvg from "../../../../components/BackButtonSvg";
import Text_Editor from "../../../../components/Text_Editor";
import ReminderVariables from "../../../../components/Variables/ReminderVariables";
import { DeclineSuperAdminChanges } from "../../../../redux/Services/Config/ServiceCategoryApi";
import SAPredefinedChangesNotifyMessageModel from "../../../../components/SAPredefinedChangesNotifyMessageModel";
import { NotifySuperAdminPredefinedChangesToAdmin } from "../../../../redux/Services/Setting/NotificationApi";
function AddUpdateReminderTemplate(props) {
  //Declare State:
  const moduleName = "Workflow Email Template";
  const [editorState, setEditorState] = useState("");
  const {
    setTopbar,
    setLoader,
    getCrudButtonTextName,
    getCrudPopUpTitleName,
    scrollUpDownByElementID,
    HtmlToPlainText,
    proposalName,
    EngagementName,
    hasActionAccess,
  } = useContext(AuthContextProvider);
  const navigate = useNavigate();
  const common = useSelector((state) => state.Storage); //Getting Logged Users Details From Persist Storage of redux hooks
  const location = useLocation();
  const [templateElementList, setTemplateElementList] = useState([
    {
      TTETMapID: null,
      templateElementTypeID: 2,
      headings: null,
      shortDesc: null,
      htmlContent: null,
    },
  ]);
  const [openSuccessModal, setOpenSuccessModal] = React.useState(false);
  const [openErrorModal, setOpenErrorModal] = React.useState(false);
  const [isCheck, setIsCheck] = useState(false);
  const [TemplateTypeLookupList, setTemplateTypeLookupList] = useState([]);
  const [Status, setStatus] = React.useState(false);
  const [modelAction, setModelAction] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [requireErrorMessage, setRequireErrorMessage] = useState(false);
  const [TemplateObj, setTemplateObj] = useState({
    templateKeyID: null,
    organisationID: null,
    createdByID: null,
    status: 1,
    isDefault: false,
    templateName: undefined,
    subject: null,
    templateTypeID: null,
    ClientBusinessTypeID: null,
    isPredefined: null,
    professionTypeList: [],
  });

  // A]  useEffect : Will call when Add/Update button click from list page

  useEffect(() => {
    const Admin_Config_Template_CanAdd = hasActionAccess(21, 81);
    const SuperAdmin_Config_Template_CanAdd = hasActionAccess(16, 61);
    if (
      (location?.state?.Action === undefined ||
        location?.state?.Action === null) &&
      !(Admin_Config_Template_CanAdd || SuperAdmin_Config_Template_CanAdd)
    ) {
      navigate(-1);
    }
  }, []);
  useEffect(() => {
    setModelAction(
      location?.state?.Action === undefined || location?.state?.Action === null
        ? "Add"
        : "Update"
    ); //Do not change this naming convention
    GetTemplateTypeLookupListData();
    setTopbar("none");

    if (location.state?.templateKeyID !== null) {
      GetEmailTemplatesModelData(
        location.state?.templateKeyID,
        location.state?.Type
      );
    }
  }, [location.state]);

  const SetInitialModelData = () => {
    setTemplateObj({
      templateKeyID: null,
      organisationID: null,
      createdByID: null,
      templateName: undefined,
      templateTypeID: 4,
      ClientBusinessTypeID: null,
      isPredefined: null,
      professionTypeList: [],
    });
    setErrorMessage("");
  };

  //2) TemplateType Lookup List Api
  const GetTemplateTypeLookupListData = async () => {
    setLoader(true);
    try {
      const data = await GetTemplateTypeList(5);
      if (data?.data?.statusCode === 200) {
        setLoader(false);
        if (data?.data?.responseData?.data) {
          let TemplateTypeListData = data?.data?.responseData?.data;
          TemplateTypeListData = TemplateTypeListData.map((templateType) => ({
            value: templateType.templateTypeID,
            label: templateType.templateTypeName,
          }));
          const updatedData = TemplateTypeListData.map((item) => {
            if (item.label && item.label.includes("Contract")) {
              return {
                ...item,
                label: item.label.replace("Contract", EngagementName),
              }; // Replace "Contract" with "EL" in the label
            }
            if (item.label && item.label.includes("Quote")) {
              return {
                ...item,
                label: item.label.replace("Quote", proposalName),
              }; // Replace "Contract" with "EL" in the label
            }
            return item;
          });
          setTemplateTypeLookupList(updatedData);
        }
      } else {
        setLoader(false);
        setErrorMessage(data?.data?.errorMessage);
      }
    } catch (error) {
      setLoader(false);
      console.log(error);
    }
  };

  // E] Event Handling Functions will call here.
  // 1) On Change Select Profession Type
  const OnChangeSelectProfessionType = (ptype) => {
    const updatedPfList = ptype.map((option) => ({
      professionTypeId: option.value,
      professionTypeName: option.label,
    }));
    setTemplateObj({
      ...TemplateObj,
      professionTypeList: updatedPfList,
    });
  };

  // F] Calling CRUD Api here
  // 1) Get Model Data Api
  const GetEmailTemplatesModelData = async (id, GetSAChanges) => {
    if (!id) {
      return;
    }
    try {
      setLoader(true);
      const data = await GetReminderTemplatesModel(id, GetSAChanges);
      if (data?.data?.statusCode === 200) {
        if (data?.data?.responseData?.data) {
          const ModelData = data?.data?.responseData?.data;
          setTemplateObj({
            ...TemplateObj,
            templateKeyID: ModelData.templateKeyID,
            organisationID: ModelData.organisationID,
            createdByID: ModelData.createdByID,
            templateName: ModelData.templateName,
            subject: ModelData.subject,
            templateTypeID: ModelData.templateTypeID,
            isDefault: ModelData.isDefault,
            ClientBusinessTypeID: ModelData.ClientBusinessTypeID,
            isPredefined: ModelData.isPredefined,
            professionTypeList: ModelData.professionTypeList,
          });

          const htmlContent =
            ModelData.templateElementList[0]?.htmlContent || "";

          // Update editor state
          setEditorState(htmlContent);
          setTemplateElementList([
            {
              TTETMapID: ModelData.templateElementList[0].ttetMapID,
              headings: ModelData.templateElementList[0].headings,
              templateElementTypeID:
                ModelData.templateElementList[0].templateElementTypeID,
              htmlContent: ModelData.templateElementList[0].htmlContent,
            },
          ]);
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

  // 2) Add Update Button Click Function
  const TemplateAddUpdateBtnClicked = (Accept) => {
    // Check Validations will be done here
    // if (
    //   (common.professionTypeLists?.length > 1 ||
    //     common.organisationKeyID === null) &&
    //   professionTypeValue?.length === 0
    // ) {
    //   scrollUpDownByElementID("ProfessionTypeDiv");
    //   setRequireErrorMessage(true);
    //   return false; // Return false or handle your error logic here if needed.
    // } else

    if (Accept === "Accept") {
      $("#" + "ConfirmSAChangesModel").modal("show");

      setStatus(true);
      return;
    }
    if (
      TemplateObj.templateName === undefined ||
      TemplateObj.templateName === "" ||
      TemplateObj.subject === undefined ||
      TemplateObj.subject === "" ||
      TemplateObj.subject === null ||
      TemplateObj.templateTypeID === undefined ||
      TemplateObj.templateTypeID === "" ||
      TemplateObj.templateTypeID === null ||
      TemplateObj.templateName === null
    ) {
      if (
        TemplateObj.templateName === undefined ||
        TemplateObj.templateName === ""
      ) {
        scrollUpDownByElementID("TemplateNameDiv");
      } else if (
        TemplateObj.templateTypeID === undefined ||
        TemplateObj.templateTypeID === "" ||
        TemplateObj.templateTypeID === null
      ) {
        scrollUpDownByElementID("TemplateTypeDiv");
      }
      setRequireErrorMessage(true);
      return false; // Return false or handle your error logic here if needed.
    } else if (!editorState && TemplateObj.templateTypeID === 4) {
      setRequireErrorMessage(true);
      return false;
    } else if (
      templateElementList[0].htmlContent === null ||
      templateElementList[0].htmlContent === "" ||
      templateElementList[0].htmlContent === undefined ||
      templateElementList[0].htmlContent === "<p></p>\n" ||
      templateElementList[0].htmlContent === "<p></p>" ||
      templateElementList[0].htmlContent === "<p><br></p>"
    ) {
      scrollUpDownByElementID(
        `EditorDiv_${templateElementList[0].htmlContent}`
      );
      setRequireErrorMessage(true);
      return false;
    } else if (editorState) {
      const indexToUpdate = 0;
      const trimmedContent = HtmlToPlainText(editorState, moduleName);
      const hasTextAtZeroPosition = trimmedContent.trim().length > 0;
      if (!hasTextAtZeroPosition) {
        setEditorState("");
        const updatedTemplateElementList = [...templateElementList];
        updatedTemplateElementList[indexToUpdate] = {
          ...updatedTemplateElementList[indexToUpdate],
          htmlContent: null,
        };
        setTemplateElementList(updatedTemplateElementList);

        setRequireErrorMessage(true);
        return false;
      }
    } else {
      setRequireErrorMessage(false); // Clear the error message if there are no errors.
    }

    // Preparing Object For Add Update and if any modification then it will done here
    const ApiRequest_ParamsObj = {
      createdByID: 1,
      organisationKeyID: common.organisationKeyID,
      organisationID: common.organisationID,
      acceptSAChanges: Accept,
      templateTypeID: TemplateObj.templateTypeID, //will change module wise
      templateKeyID: TemplateObj.templateKeyID,
      userKeyID: common.userKeyID,
      ClientBusinessTypeID: TemplateObj.ClientBusinessTypeID,
      isPredefined: common.roleTypeId === USER_ROLE_TYPE.SuperAdmin ? 1 : 0,
      templateName: TemplateObj.templateName,
      subject: TemplateObj.subject,
      isDefault: TemplateObj.isDefault,
      templateElementList: templateElementList,
      professionTypeList: null,
      // professionTypeList:
      //   common.professionTypeLists?.length > 1 ||
      //     common.organisationKeyID === null
      //     ? TemplateObj.professionTypeList
      //     : [
      //       {
      //         professionTypeId: professionTypeInputValue[0]?.professionTypeId,
      //         professionTypeName:
      //           professionTypeInputValue[0]?.professionTypeName,
      //       },
      //     ],
    };
    AddUpdateEmailTemplatesData(ApiRequest_ParamsObj);
  };

  const handleClose = async () => {
    if (isCheck) {
      setLoader(true);
      const Notification = await NotifySuperAdminPredefinedChangesToAdmin({
        userKeyID: common.userKeyID,
        moduleKeyID: TemplateObj.templateKeyID,
        moduleName: "Predefined-Reminder-Email-Template",
      });
      if (Notification?.data?.statusCode === 200) {
        setLoader(false);
        setModelAction("NotificationSend");
        setOpenSuccessModal(true);
        setIsCheck(false);
      }
    } else {
      $("#" + props.id).modal("hide");
      setOpenSuccessModal(false);
      navigate("/reminder-email-template");
    }
  };

  // Add or Update Service Category Data
  const AddUpdateEmailTemplatesData = async (apiRequestParams) => {
    setLoader(true);
    try {
      let url = "/AddUpdateReminderEmailTemplates"; // Default URL for Adding Data
      if (apiRequestParams.templateKeyID !== null) {
        url = `/AddUpdateReminderEmailTemplates?templateKeyID=${apiRequestParams.templateKeyID}`; // URL for Updating Data
      }
      const response = await AddUpdateReminderTemplates(url, apiRequestParams);
      if (response) {
        setLoader(false);
        if (response?.data?.statusCode === 200) {
          if (apiRequestParams.templateKeyID === null) {
            // toast.success("Added Successfully.");
            setOpenSuccessModal(true);
            props.setIsAddUpdateActionDone(true);

            navigate("/reminder-email-template");
          } else {
            setLoader(false);
            // toast.success("Updated Successfully.");
            setOpenSuccessModal(true);
            props.setIsAddUpdateActionDone(true);
            navigate("/reminder-email-template");
          }
        } else {
          setLoader(false);
          setErrorMessage(response?.response?.data?.errorMessage);
        }
      }
    } catch (error) {
      setLoader(false);
      console.error(error);
    }
  };

  // handle function
  const handleSubmit = () => {
    setTopbar("block");
    navigate("/reminder-email-template");
    SetInitialModelData();
  };

  //Handle Content change
  const handleContentChange = (newEditorState) => {
    const indexToUpdate = 0;

    const trimmedContent = HtmlToPlainText(newEditorState, moduleName);
    const hasTextAtZeroPosition = trimmedContent.trim().length > 0;
    if (!hasTextAtZeroPosition) {
      setEditorState("");
      const updatedTemplateElementList = [...templateElementList];
      updatedTemplateElementList[indexToUpdate] = {
        ...updatedTemplateElementList[indexToUpdate],
        htmlContent: null,
      };
      setTemplateElementList(updatedTemplateElementList);

      return;
    } else {
      setEditorState(newEditorState);
    }

    try {
      const updatedTemplateElementList = [...templateElementList];
      if (newEditorState) {
        const indexToUpdate = 0;
        if (
          indexToUpdate >= 0 &&
          indexToUpdate < updatedTemplateElementList.length
        ) {
          updatedTemplateElementList[indexToUpdate] = {
            ...updatedTemplateElementList[indexToUpdate],
            htmlContent: newEditorState,
          };
          setTemplateElementList(updatedTemplateElementList);
        } else {
          console.error("Invalid indexToUpdate:", indexToUpdate);
        }
      } else {
        console.warn("newEditorState is empty.");
      }
    } catch (error) {
      console.error("Error updating content:", error);
    }
  };

  //Handle Change Template Type
  const handleChangeTemplateType = (e) => {
    if (TemplateObj.templateTypeID !== null) {
      setTemplateObj({
        ...TemplateObj,
        templateTypeID: e.value,
        // keyID: null,
        createdByID: null,
        status: 1,
        isDefault: false,
        // templateName: "",
        ClientBusinessTypeID: null,
        isPredefined: null,
      });
      setEditorState("");
    } else {
      setTemplateObj({
        ...TemplateObj,
        templateTypeID: e.value,
      });
    }
  };
  const templateTypeFilter = TemplateTypeLookupList?.filter(
    (template) => template.value == TemplateObj.templateTypeID
  );

  const IsActiveFilter = Utils.IS_default.find(
    (item) => TemplateObj.isDefault == item.value
  );

  const DeclineSuperAdminChangesData = async (Decline) => {
    if (Decline === "Decline") {
      // $('#' + props.id).modal('hide')

      setStatus(false);
      $("#" + "ConfirmSAChangesModel").modal("show");
      return;
    }
    setLoader(true);
    try {
      const apiRequestParams = {
        organisationKeyID: common.organisationKeyID,
        userKeyID: common.userKeyID,
        moduleKeyID: location.state?.templateKeyID,
        moduleName: "Predefined-Reminder-Email-Template",
        //Predefined-ServiceCategory, Predefined-GlobalConstant, Predefined-GlobalPricingDriver,
        //Predefined-PL-EL-Template, Predefined-TnC-Template, Predefined-Email-Template,
        //Predefined-Service, Predefined-ServicePackage
      };
      const response = await DeclineSuperAdminChanges(apiRequestParams);
      if (response) {
        setLoader(false);
        if (response?.data?.statusCode === 200) {
          if (apiRequestParams.Action === null) {
            $("#" + "ConfirmSAChangesModel").modal("hide");
            navigate("/reminder-email-template");
            props.setIsAddUpdateActionDone(true);
          } else {
            $("#" + "ConfirmSAChangesModel").modal("hide");
            navigate("/reminder-email-template");
            props.setIsAddUpdateActionDone(true);
          }
        } else {
          setErrorMessage(true);
          $("#" + "ConfirmSAChangesModel").modal("hide");
          setErrorMessage(response?.response?.data?.errorMessage);
        }
      }
    } catch (error) {
      console.error(error);
    }
  };
  const handleConfirmButton = () => {
    $("#" + "ConfirmSAChangesModel").modal("hide");
    if (Status) {
      TemplateAddUpdateBtnClicked(true);
    } else {
      DeclineSuperAdminChangesData();
    }
  };
  return (
    <div className="container-fluid new-item-page-container rt-form">
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
                <SAPredefinedChangesNotifyMessageModel
                  Params={{
                    moduleName: moduleName,
                    SAChanges: location.state.Type,
                  }}
                />
                <>
                  {/* <div className="row" id="ProfessionTypeDiv">
                    {(common.professionTypeLists?.length > 1 ||
                      common.organisationKeyID === null) && (
                        <>
                          <div className="col-lg-2 template-label text-left">
                            <div className="mb-1">
                              <label className="form-label">
                                Profession Type
                                <span className="text-danger">*</span>
                              </label>
                            </div>
                          </div>
                          <div className="col-lg-10 mb-2">
                            <div className="input-group">
                              {common.professionTypeLists?.length > 1 ||
                                common.organisationKeyID === null ? (
                                <Select
                                  isMulti
                                  style={{ padding: "5px" }}
                                  className="user-role-select"
                                  options={ProfessionalTypeLookeupListOptions}
                                  value={professionTypeValue}
                                  onChange={OnChangeSelectProfessionType}
                                />
                              ) : (
                                ""
                              )}
                            </div>
                            {requireErrorMessage &&
                              (common.professionTypeLists?.length > 1 ||
                                common.organisationKeyID === null) &&
                              professionTypeValue?.length === 0 ? (
                              <label className="validation">
                                {ERROR_MESSAGES}
                              </label>
                            ) : (
                              ""
                            )}
                          </div>
                        </>
                      )}
                  </div> */}
                </>
                <div className="rt-card">
                <div className="rt-card__head">
                  <span className="rt-card__icon">
                    <i className="ri-mail-settings-line"></i>
                  </span>
                  <div>
                    <h4 className="rt-card__title">Template Details</h4>
                    <p className="rt-card__desc">
                      Name, type and subject line of this workflow email.
                    </p>
                  </div>
                </div>
                <div className="rt-fields">
                <div className="row" id="TemplateNameDiv">
                  <div className="col-lg-2 mb-1 template-label text-left">
                    <label className="form-label">
                      Template Name
                      <span className="text-danger">*</span>
                    </label>
                  </div>
                  <div className="col-lg-10 mb-2">
                    <div className="input-group">
                      <input
                        type="text"
                        className="input-text"
                        placeholder="Enter Template Name"
                        value={TemplateObj.templateName}
                        onChange={(e) => {
                          setErrorMessage("");
                          const inputValue = e.target.value;
                          const trimmedValue = inputValue.replace(/^\s+/g, "");
                          const capitalizedValue =
                            trimmedValue.charAt(0).toUpperCase() +
                            trimmedValue.slice(1);
                          setTemplateObj({
                            ...TemplateObj,
                            templateName: capitalizedValue,
                          });
                        }}
                        maxLength={50}
                      />
                    </div>
                    {requireErrorMessage &&
                    (TemplateObj.templateName === "" ||
                      TemplateObj.templateName === undefined) ? (
                      <label className="validation">{ERROR_MESSAGES}</label>
                    ) : (
                      ""
                    )}
                  </div>
                </div>
                {/* Template Type */}
                <div className="row" id="TemplateTypeDiv">
                  <div className="col-lg-2 template-label text-left">
                    <div className="mb-1">
                      <label className="form-label">
                        Template Type
                        <span className="text-danger">*</span>
                      </label>
                    </div>
                  </div>
                  <div className="col-lg-10">
                    <div className="mb-2 ">
                      <div className="input-group">
                        <Select
                          className="user-role-select"
                          classNamePrefix="fx-select"
                          options={TemplateTypeLookupList}
                          value={templateTypeFilter}
                          onChange={(e) => {
                            handleChangeTemplateType(e);
                          }}
                        />
                      </div>
                      {requireErrorMessage &&
                      (TemplateObj.templateTypeID == "" ||
                        TemplateObj.templateTypeID == null) ? (
                        <label className="validation">{ERROR_MESSAGES}</label>
                      ) : (
                        ""
                      )}
                    </div>
                  </div>
                </div>

                {/* Subject Line */}
                <div className="row" id="TemplateNameDiv">
                  <div className="col-lg-2 template-label text-left">
                    <div className="mb-1">
                      <label className="form-label">
                        Subject Line
                        <span className="text-danger">*</span>
                      </label>
                    </div>
                  </div>
                  <div className="col-lg-10">
                    <div className="mb-2 ">
                      <div className="input-group">
                        <input
                          type="text"
                          className="input-text"
                          placeholder="Enter Subject Line"
                          value={TemplateObj.subject}
                          onChange={(e) => {
                            setErrorMessage("");
                            const inputValue = e.target.value;
                            const trimmedValue = inputValue.replace(
                              /^\s+/g,
                              ""
                            );
                            const capitalizedValue =
                              trimmedValue.charAt(0).toUpperCase() +
                              trimmedValue.slice(1);
                            setTemplateObj({
                              ...TemplateObj,
                              subject: capitalizedValue,
                            });
                          }}
                          maxLength={50}
                        />
                      </div>
                      {/* <label className="validation">{errorMessage}</label> */}
                      {requireErrorMessage &&
                      (TemplateObj.subject === "" ||
                        TemplateObj.subject === undefined ||
                        TemplateObj.subject === null) ? (
                        <label className="validation">{ERROR_MESSAGES}</label>
                      ) : (
                        ""
                      )}
                    </div>
                  </div>
                </div>

                {/* Is Default */}
                <div className="row mb-2">
                  <div
                    style={{ padding: "10px" }}
                    className="col-lg-2  text-left"
                  >
                    <div className="mb-1">
                      <label className="form-label">
                        Is Default?
                        <span className="text-danger">*</span>
                      </label>
                    </div>
                  </div>
                  <div className="col-lg-10">
                    <div className="mb-2 input-group">
                      <BinarySelect
                        options={Utils.IS_default}
                        value={IsActiveFilter}
                        onChange={(e) =>
                          setTemplateObj({
                            ...TemplateObj,
                            isDefault: e.value,
                          })
                        }
                        isDisabled={modelAction === "Update" ? true : false}
                        ariaLabel="Is Default"
                      />
                    </div>
                    {modelAction === "Update" ? (
                      <></>
                    ) : (
                      <div
                        style={{ fontSize: "12px" }}
                        className="text-muted helpMessage"
                      >
                        If you set this template as the default, any other
                        template with the same template type will automatically
                        be marked as non-default.
                      </div>
                    )}
                  </div>
                </div>
                </div>
                </div>
                <div className="rt-card rt-content">
                  <div className="rt-card__head">
                    <span className="rt-card__icon">
                      <i className="ri-file-text-line"></i>
                    </span>
                    <div>
                      <h4 className="rt-card__title">Template Content</h4>
                      <p className="rt-card__desc">
                        Click a variable to copy it, then paste it into the
                        email body below.
                      </p>
                    </div>
                  </div>
                  <div className="fieldset-group helper-variables-div">
                    <label className="fieldset-group-label">Variables</label>
                    <ReminderVariables
                      ModuleName="ReminderEmailTemplate"
                      TemplateType={
                        TemplateObj.templateTypeID === null
                          ? null
                          : "ReminderEmailTemplate"
                      }
                      ClintType={null}
                      businessTypeId={TemplateObj.templateTypeID}
                    />
                  </div>

                  <div id={`EditorDiv_${templateElementList[0].htmlContent}`}>
                    <Text_Editor
                      editorState={editorState}
                      handleContentChange={handleContentChange}
                      modelAction={modelAction}
                    />
                  </div>
                </div>
                {requireErrorMessage &&
                (!editorState ||
                  templateElementList[0].htmlContent === null ||
                  templateElementList[0].htmlContent === "" ||
                  templateElementList[0].htmlContent === undefined ||
                  templateElementList[0].htmlContent === "<p></p>\n" ||
                  templateElementList[0].htmlContent === "<p></p>" ||
                  templateElementList[0].htmlContent === "<p><br></p>") ? (
                  <label className="validation">{ERROR_MESSAGES}</label>
                ) : (
                  ""
                )}
              </div>
              <label className="validation">
                {" "}
                {common.professionTypeLists?.length <= 1 &&
                errorMessage?.includes(
                  `Please dont choose this profession type`
                )
                  ? errorMessage.split(".")[0]
                  : errorMessage}
              </label>
            </div>

            <Row className="modal-footer rt-footer">
              <Col
                style={{ paddingTop: "14px" }}
                className="hstack gap-2 justify-content-end"
              >
                {location.state?.Type ? (
                  <>
                    <button
                      type="submit"
                      class="btn btn-md btn-success accept-item-btn"
                      onClick={() => {
                        TemplateAddUpdateBtnClicked("Accept");
                      }}
                    >
                      <span>Accept</span>
                    </button>
                    <button
                      type="submit"
                      class="btn btn-md btn-success declined-item-btn"
                      // data-bs-dismiss="modal"
                      onClick={() => DeclineSuperAdminChangesData("Decline")}
                    >
                      <span>Decline</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleSubmit}
                      style={{ float: "right", paddingTop: "5px" }}
                      className="btn btn-md btn-light"
                    >
                      <span>{getCrudButtonTextName("Cancel")}</span>
                    </button>
                    <button
                      onClick={() => {
                        TemplateAddUpdateBtnClicked();
                      }}
                      style={{ float: "right", paddingTop: "5px" }}
                      className="btn btn-md btn-success create-item-btn"
                    >
                      <span>
                        {modelAction === "Add"
                          ? getCrudButtonTextName("Add", moduleName)
                          : getCrudButtonTextName("Update", moduleName)}
                      </span>
                    </button>
                  </>
                )}
              </Col>
            </Row>
            {/* <!-- end tab content --> */}
          </div>
          {/* <!-- end card body --> */}
        </div>
        {/* <!-- end card --> */}
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
        message={moduleName + " " + TemplateObj.templateName}
      />
    </div>
  );
}

export default AddUpdateReminderTemplate;
