/* global $ */
import React, { useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Utils from "../../../../Middleware/Utils";
import "../../../configure/email_template/EmailTemplate.css";
import "../../../configure/Reminder/ReminderEmailTemplate/AddReminderTemplate-redesign.css";
import "../../super_admin_email_template/SuperAdminEmailTemplateModel-redesign.css";
import { Row, Col } from "reactstrap";
import Select from "react-select";

import { AuthContextProvider } from "../../../../AuthContext/AuthContext";

import { useNavigate } from "react-router";
import IndividualVariable from "../../../../components/Variables/IndividualVariables";
import { useSelector } from "react-redux";
import { GetTemplateTypeList } from "../../../../redux/Services/Master/TemplateTypeLookupListApi";
import { CLIENT_TYPES, USER_ROLE_TYPE } from "../../../../Middleware/enums";

import SuccessModal from "../../../../components/SuccessModal";
import { ERROR_MESSAGES } from "../../../../components/GlobalMessage";
import {
  GetEmailTemplatesModel,
  AddUpdateEmailTemplates,
} from "../../../../redux/Services/Config/SuperEmailTemplateApi";

import {
  GetReminderTemplatesModel,
  AddUpdateReminderTemplates,
} from "../../../../redux/Services/Setting/SuperAdminTemplateApi";
import AccountantVariables from "../../../../components/Variables/AccountantVariables";
import BackButtonSvg from "../../../../components/BackButtonSvg";

import Text_Editor from "../../../../components/Text_Editor";
import SuperAdminReminderTemplateVariable from "../../../../components/Variables/SuperAdminReminderTemplateVariable";
import BinarySelect from "../../../../components/BinarySelect";
function AddUpdateSuperAdminReminderTemplate(props) {
  //Declare State:
  const moduleName = "Super Admin Workflow Email Template";

  const [editorState, setEditorState] = useState("");
  const [errorEditorMessage, setEditorMassage] = useState(null);
  const {
    setTopbar,
    setLoader,
    getCrudButtonTextName,
    getCrudPopUpTitleName,
    scrollUpDownByElementID,
    HtmlToPlainText,
  } = useContext(AuthContextProvider);
  const navigate = useNavigate();
  const common = useSelector((state) => state.Storage); //Getting Logged Users Details From Persist Storage of redux hooks
  const location = useLocation();
  const [templateElementList, setTemplateElementList] = useState([
    {
      TTETMapID: null, //Template's Template Element Type Mapping Id.
      templateElementTypeID: 2,
      headings: null,
      shortDesc: null,
      htmlContent: null,
    },
  ]);
  const [dismissModal, setDismissModal] = useState(null);
  const [openSuccessModal, setOpenSuccessModal] = React.useState(false);

  const [TemplateTypeLookupList, setTemplateTypeLookupList] = useState([]);

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
    templateTypeID: null,
    subject: null,
    ClientBusinessTypeID: null,
    isPredefined: null,
  });

  // A]  useEffect : Will call when Add/Update button click from list page
  useEffect(() => {
    setModelAction(location.state?.templateKeyID === null ? "Add" : "Update"); //Do not change this naming convention
    GetTemplateTypeLookupListData();
    setTopbar("none");

    if (location.state?.templateKeyID !== null) {
      GetEmailTemplatesModelData(location.state?.templateKeyID);
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
    });
    setErrorMessage("");
  };

  //2) TemplateType Lookup List Api
  const GetTemplateTypeLookupListData = async () => {
    try {
      const data = await GetTemplateTypeList(6);
      if (data?.data?.statusCode === 200) {
        if (data?.data?.responseData?.data) {
          let TemplateTypeListData = data?.data?.responseData?.data;
          TemplateTypeListData = TemplateTypeListData.map((templateType) => ({
            value: templateType.templateTypeID,
            label: templateType.templateTypeName,
          }));
          setTemplateTypeLookupList(TemplateTypeListData);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  // F] Calling CRUD Api here
  // 1) Get Model Data Api
  const GetEmailTemplatesModelData = async (id) => {
    if (!id) {
      return;
    }
    try {
      const data = await GetReminderTemplatesModel(id);
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
      } else {
        setErrorMessage(data?.data?.errorMessage);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // 2) Add Update Button Click Function
  const TemplateAddUpdateBtnClicked = () => {
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
        scrollUpDownByElementID(
          `EditorDiv_${templateElementList[0].htmlContent}`
        );
        setRequireErrorMessage(true);
        return false;
      }
    } else {
      setRequireErrorMessage(false); // Clear the error message if there are no errors.
    }

    // Preparing Object For Add Update and if any modification then it will done here
    const ApiRequest_ParamsObj = {
      //global level params : fixed
      createdByID: 1,
      organisationKeyID: common.organisationKeyID,
      organisationID: common.organisationID,
      templateTypeID: TemplateObj.templateTypeID, //will change module wise
      templateKeyID: TemplateObj.templateKeyID,
      userKeyID: common.userKeyID,
      ClientBusinessTypeID: TemplateObj.ClientBusinessTypeID,
      isPredefined: common.roleTypeId === USER_ROLE_TYPE.SuperAdmin ? 1 : 0,

      templateName: TemplateObj.templateName,
      subject: TemplateObj.subject,
      isDefault: TemplateObj.isDefault,
      templateElementList: templateElementList,
    };
    AddUpdateEmailTemplatesData(ApiRequest_ParamsObj);
  };

  //Handle Close
  const handleClose = () => {
    $("#" + props.id).modal("hide");
    setOpenSuccessModal(false);
    navigate("/super-admin-reminder-template-list");
  };

  // Add or Update Service Category Data
  const AddUpdateEmailTemplatesData = async (apiRequestParams) => {
    setLoader(true);
    try {
      let url = "/AddUpdateSuperAdminReminderEmailTemplate"; // Default URL for Adding Data

      const response = await AddUpdateReminderTemplates(url, apiRequestParams);
      if (response) {
        setLoader(false);
        if (response?.data?.statusCode === 200) {
          if (apiRequestParams.templateKeyID === null) {
            setOpenSuccessModal(true);
            props.setIsAddUpdateActionDone(true);

            navigate("/super-admin-reminder-template-list");
          } else {
            setOpenSuccessModal(true);
            props.setIsAddUpdateActionDone(true);
            navigate("/super-admin-reminder-template-list");
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
  const handleSubmit = () => {
    setTopbar("block");
    navigate("/super-admin-reminder-template-list");
    SetInitialModelData();
  };

  // Handle Change Content
  const handleContentChange = (newEditorState) => {
    const indexToUpdate = 0;

    const trimmedContent = HtmlToPlainText(newEditorState);
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
  // Handle Change Template Type
  const handleChangeTemplateType = (e) => {
    if (TemplateObj.templateTypeID !== null) {
      setTemplateObj({
        ...TemplateObj,
        templateTypeID: e.value,
        // templateKeyID: null,
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

  return (
    <div className="container-fluid new-item-page-container rt-form sae-form">
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
            <div className="template-height scrollbar">
              <div class="tab-content">
                <div className="rt-card">
                <div className="rt-card__head">
                  <span className="rt-card__icon">
                    <i className="ri-mail-settings-line"></i>
                  </span>
                  <div>
                    <h4 className="rt-card__title">Template Details</h4>
                    <p className="rt-card__desc">
                      Name, type and subject line of this reminder email.
                    </p>
                  </div>
                </div>
                <div className="rt-fields">
                <div className="row" id="TemplateNameDiv">
                  <div className="col-lg-2 template-label text-left">
                    <div className="mb-1">
                      <label className="form-label">
                        Template Name
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
                          placeholder="Enter Template Name"
                          value={TemplateObj.templateName}
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
                              templateName: capitalizedValue,
                            });
                          }}
                          maxLength={70}
                        />
                      </div>
                      {/* <label className="validation">{errorMessage}</label> */}
                      {requireErrorMessage &&
                      (TemplateObj.templateName === "" ||
                        TemplateObj.templateName === undefined) ? (
                        <label className="validation">{ERROR_MESSAGES}</label>
                      ) : (
                        ""
                      )}
                    </div>
                  </div>
                </div>
                {/* Template type */}
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
                          classNamePrefix="app-select"
                          className="user-role-select"
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

                {/* Is default */}
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
                        Click a variable to copy it, then paste it into the email body below.
                      </p>
                    </div>
                  </div>

                  {/* <div className="fieldset-group helper-variables-div"> */}
                  {/* <label className="fieldset-group-label">Variables</label> */}
                  {/* <AccountantVariables
                      ModuleName="SuperEmailTemplate"
                      SuperTemplateType={null}
                      ClintType={null}
                      businessTypeId={null}
                    />
                    <div className="separator mb-3" /> */}
                  {/* <AccountantVariables
                      ModuleName="SuperEmailTemplate"
                      businessTypeId={null}
                    /> */}
                  <SuperAdminReminderTemplateVariable
                    ModuleName="SuperEmailTemplate"
                    businessTypeId={TemplateObj.templateTypeID}
                  />
                  {/* </div> */}

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
                {requireErrorMessage && errorEditorMessage ? (
                  <label className="validation">{errorEditorMessage}</label>
                ) : (
                  ""
                )}
              </div>
              <label className="validation">
                {" "}
                {common.professionTypeLists?.length <= 1 &&
                errorMessage?.includes(
                  `Please don't choose this profession type`
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
                <button
                  onClick={handleSubmit}
                  style={{ float: "right", paddingTop: "5px" }}
                  className="btn btn-md btn-light"
                >
                  <span>{getCrudButtonTextName("Cancel")}</span>
                </button>
                <button
                  onClick={TemplateAddUpdateBtnClicked}
                  style={{ float: "right", paddingTop: "5px" }}
                  class="btn btn-md btn-success create-item-btn"
                >
                  <span>
                    {modelAction === "Add"
                      ? getCrudButtonTextName("Add", moduleName)
                      : getCrudButtonTextName("Update", moduleName)}
                  </span>
                </button>
              </Col>
            </Row>
            {/* <!-- end tab content --> */}
          </div>
          {/* <!-- end card body --> */}
        </div>
        {/* <!-- end card --> */}
      </div>
      <SuccessModal
        handleClose={handleClose}
        setDismissModal={setDismissModal}
        setOpenSuccessModal={setOpenSuccessModal}
        openSuccessModal={openSuccessModal}
        modelAction={modelAction}
        message={moduleName + " " + TemplateObj.templateName}
      />
    </div>
  );
}

export default AddUpdateSuperAdminReminderTemplate;
