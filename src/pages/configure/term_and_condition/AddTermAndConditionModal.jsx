/* global $ */
import React, { useContext, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

import "../email_template/EmailTemplate.css";
import "../Reminder/ReminderEmailTemplate/AddReminderTemplate-redesign.css";
import "./AddTermAndCondition-redesign.css";
import { Row, Col } from "reactstrap";
import Select from "react-select";

import { AuthContextProvider } from "../../../AuthContext/AuthContext";

import { useNavigate } from "react-router";
import Variables from "../../../components/Variables/IndividualVariables";
import { GetProfessionTypeLookupList } from "../../../redux/Services/Master/ProfessionTypeApi";
import { useSelector } from "react-redux";
import { GetTemplateTypeList } from "../../../redux/Services/Master/TemplateTypeLookupListApi";
import { USER_ROLE_TYPE } from "../../../Middleware/enums";
import SAPredefinedChangesNotifyMessageModel from "../../../components/SAPredefinedChangesNotifyMessageModel";
import {
  GetTermsAndConditionsModel,
  AddUpdateTermAndCondition,
} from "../../../redux/Services/Config/TermAndConditionApi";
import {
  AddUpdateTemplateDataWithPdf,
  AddUpdateTemplatePDF,
  templateForLlpList,
} from "../../../redux/Services/Config/TemplateApi";
import { Base_Url } from "../../../Base-Url/Base_Url";
import axios from "axios";
import { ERROR_MESSAGES } from "../../../components/GlobalMessage";
import SuccessModal from "../../../components/SuccessModal";
import AccountantVariables from "../../../components/Variables/AccountantVariables";
import { GetBusinessTypeLookupList } from "../../../redux/Services/Master/BusinessTypeLookupListApi";
import Utils from "../../../Middleware/Utils";
import BackButtonSvg from "../../../components/BackButtonSvg";
import AcceptSuperAdminChangesConfirmation from "../../../components/AcceptSuperAdminChangesConfirmation";
import Text_Editor from "../../../components/Text_Editor";
import { NotifySuperAdminPredefinedChangesToAdmin } from "../../../redux/Services/Setting/NotificationApi";
import { DeclineSuperAdminChanges } from "../../../redux/Services/Config/ServiceCategoryApi";
import ErrorModel from "../../../components/ErrorModel";
function Add_New_Term_And_Condition(props) {
  //Declare State:
  const moduleName = "Terms & Conditions";
  const [editorState, setEditorState] = useState("");

  const {
    setTopbar,
    prospectName,
    setLoader,
    proposalName,
    EngagementName,
    getCrudButtonTextName,
    getCrudPopUpTitleName,
    scrollUpDownByElementID,
    HtmlToPlainText,
    hasActionAccess
  } = useContext(AuthContextProvider);
  const navigate = useNavigate();
  const common = useSelector((state) => state.Storage); //Getting Logged Users Details From Persist Storage of redux hooks
  const location = useLocation();
  const [Status, setStatus] = React.useState(false);
  const [dismissModal, setDismissModal] = useState(null);
  const [isCheck, setIsCheck] = useState(false);
  const [openSuccessModal, setOpenSuccessModal] = React.useState(false);
  const [templateElementList, setTemplateElementList] = useState([
    {
      TTETMapID: null, //Template's Template Element Type Mapping Id.
      templateElementTypeID: 2,
      headings: null,
      shortDesc: null,
      htmlContent: null,
    },
  ]);
  console.log(templateElementList, 'templateElementList')
  const [professionTypeLookupList, setProfessionTypeLookupList] = useState([]);

  const [TemplateTypeLookupList, setTemplateTypeLookupList] = useState([]);
  const [selectedFile, setSelectedFile] = useState({
    fileName: null,
    size: null,
  });
  const [modelAction, setModelAction] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [errorEditorMessage, setEditorMassage] = useState(null);
  const [BusinessTypeLookupList, setBusinessTypeLookupList] = useState([]);
  const [requireErrorMessage, setRequireErrorMessage] = useState(false);
  const [openErrorModal, setOpenErrorModal] = React.useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [TemplateObj, setTemplateObj] = useState({
    templateKeyID: null,
    organisationID: null,
    orgBusinessTypeID: common.businessTypeID,
    status: 1,
    createdByID: null,
    isDefault: false,
    templateName: undefined,
    templateTypeID: null,
    pdf: null,
    businessTypeID: null,
    isPredefined: null,
    professionTypeList: [],
  });
  // A]  useEffect : Will call when Add/Update button click from list page
  useEffect(() => {
    const Admin_Config_Template_CanAdd = hasActionAccess(21, 81);
    const SuperAdmin_Config_Template_CanAdd = hasActionAccess(16, 61);
    if ((location?.state?.Action === undefined || location?.state?.Action === null) && !(Admin_Config_Template_CanAdd || SuperAdmin_Config_Template_CanAdd)) {
      navigate(-1)
    }
  }, [])

  useEffect(() => {
    setModelAction((location?.state?.Action === undefined || location?.state?.Action === null) ? "Add" : "Update"); //Do not change this naming convention
    GetProfessionTypeLookupListData();
    GetBusinessTypeLookupListData();
    GetTemplateTypeLookupListData();
    setTopbar("none");

    if (location.state?.templateKeyID !== null) {
      GetTermsAndConditionsModelData(location.state?.templateKeyID, location.state?.Type);
    }
  }, [location.state]);

  const SetInitialModelData = () => {
    setTemplateObj({
      templateKeyID: null,
      organisationID: null,
      createdByID: null,
      templateName: undefined,
      templateTypeID: null,
      businessTypeID: common.businessTypeID,
      pdf: null,
      isPredefined: null,
      professionTypeList: [],
    });
    setErrorMessage("");
  };

  // D] Calling All Api's like Lookup List and other Here :
  // 1) Profession Type Lookup List Api
  const GetProfessionTypeLookupListData = async () => {
    try {
      const data = await GetProfessionTypeLookupList();
      if (data?.data?.statusCode === 200) {
        if (data?.data?.responseData?.data) {
          const ProfessionTypeLookupListData = data?.data?.responseData?.data;
          setProfessionTypeLookupList(ProfessionTypeLookupListData);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };
  const ProfessionalTypeLookeupListOptions = professionTypeLookupList.map(
    (ptype) => ({
      value: ptype.professionTypeId,
      label: ptype.professionTypeName,
    })
  );
  const professionTypeValue = TemplateObj?.professionTypeList?.map((item) => ({
    value: item.professionTypeId,
    label: item.professionTypeName,
  }));

  //2) TemplateType Lookup List Api
  const GetTemplateTypeLookupListData = async () => {
    try {
      const data = await GetTemplateTypeList(2);
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

  const handleClose = async () => {
    if (isCheck) {
      setLoader(true)
      const Notification = await NotifySuperAdminPredefinedChangesToAdmin({
        userKeyID: common.userKeyID,
        moduleKeyID: TemplateObj.templateKeyID,
        moduleName: "Predefined-TnC-Template"
      })
      if (Notification?.data?.statusCode === 200) {
        setLoader(false)
        setModelAction("NotificationSend")
        setOpenSuccessModal(true)
        setIsCheck(false)
        setOpenErrorModal(false)
      }
    } else {
      $("#" + props.id).modal("hide");
      $("#" + "ConfirmSAChangesModel").modal("hide");
      setOpenSuccessModal(false);
      setOpenErrorModal(false)
      navigate("/terms-and-conditions");
    }
  };

  // F] Calling CRUD Api here
  // 1) Get Model Data Api
  const GetTermsAndConditionsModelData = async (id, GetSAChanges) => {
    if (!id) {
      return;
    }

    try {
      setLoader(true);
      const data = await GetTermsAndConditionsModel(id, GetSAChanges);
      if (data?.data?.statusCode === 200) {
        if (data?.data?.responseData?.data) {
          const ModelData = data?.data?.responseData?.data;
          setTemplateObj({
            ...TemplateObj,
            templateKeyID: ModelData.templateKeyID,
            organisationID: ModelData.organisationID,
            createdByID: ModelData.createdByID,
            templateName: ModelData.templateName,
            isDefault: ModelData.isDefault,
            templateTypeID: ModelData.templateTypeID,
            orgBusinessTypeID: ModelData.orgBusinessTypeID,
            pdf: ModelData.pdf,
            businessTypeID: ModelData.businessTypeID,
            isPredefined: ModelData.isPredefined,
            professionTypeList: ModelData.professionTypeList,
          });
          setSelectedFile({
            ...selectedFile,
            fileName: ModelData.pdf,
          });
          // Convert HTML content to EditorState
          const htmlContent =
            ModelData.templateElementList[0]?.htmlContent || "";

          // Update editor state
          setEditorState(htmlContent);
          if (ModelData.templateElementList !== null && ModelData.templateElementList?.length === 1) {
            setTemplateElementList([
              {
                TTETMapID: ModelData.templateElementList[0].ttetMapID, //Template's Template Element Type Mapping Id.
                headings: ModelData.templateElementList[0].headings,
                templateElementTypeID:
                  ModelData.templateElementList[0].templateElementTypeID,
                htmlContent: ModelData.templateElementList[0].htmlContent,
              },
            ]);
          }

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
    if (Accept === "Accept") {
      $("#" + "ConfirmSAChangesModel").modal("show");

      setStatus(true)
      return
    }
    // Check Validations will be done here
    if (
      (common.professionTypeLists?.length > 1 ||
        common.organisationKeyID === null) &&
      professionTypeValue?.length === 0
    ) {
      scrollUpDownByElementID("ProfessionTypeDiv");
      setRequireErrorMessage(true);
      return false; // Return false or handle your error logic here if needed.
    } else if (
      TemplateObj.templateName === undefined ||
      TemplateObj.templateName === "" ||
      TemplateObj.templateTypeID === undefined ||
      TemplateObj.templateTypeID === "" ||
      TemplateObj.templateTypeID === null ||
      (common.organisationKeyID === null &&
        (TemplateObj.orgBusinessTypeID === "" ||
          TemplateObj.orgBusinessTypeID === null ||
          TemplateObj.orgBusinessTypeID === undefined))
    ) {
      if (
        common.organisationKeyID === null &&
        (TemplateObj.orgBusinessTypeID === "" ||
          TemplateObj.orgBusinessTypeID === null ||
          TemplateObj.orgBusinessTypeID === undefined)
      ) {
        scrollUpDownByElementID("OrganisationBusinessDiv");
      } else if (
        TemplateObj.templateTypeID === undefined ||
        TemplateObj.templateTypeID === "" ||
        TemplateObj.templateTypeID === null
      ) {
        scrollUpDownByElementID("TemplateTypeDiv");
      } else if (
        TemplateObj.templateName === undefined ||
        TemplateObj.templateName === ""
      ) {
        scrollUpDownByElementID("TemplateNameDiv");
      }
      setRequireErrorMessage(true);
      return false; // Return false or handle your error logic here if needed.
    } else if (TemplateObj.templateTypeID === 3 && !selectedFile.fileName) {
      // Check if PDF file is not selected
      setRequireErrorMessage(true);
      return false;
    } else if (
      (templateElementList[0].htmlContent === null ||
        templateElementList[0].htmlContent === "" ||
        templateElementList[0].htmlContent === undefined ||
        templateElementList[0].htmlContent === "<p></p>\n" ||
        templateElementList[0].htmlContent === "<p></p>" ||
        templateElementList[0].htmlContent === "<p><br></p>") &&
      TemplateObj.templateTypeID === 4
    ) {
      scrollUpDownByElementID(
        `EditorDiv_${templateElementList[0].htmlContent}`
      );
      setRequireErrorMessage(true);
      return false;
    } else if (!editorState && TemplateObj.templateTypeID === 4) {
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
      setRequireErrorMessage(false);
      setErrorMessage(""); // Clear the error message if there is content
    }

    // Preparing Object For Add Update and if any modification then it will done here
    const ApiRequest_ParamsObj = {
      //global level params : fixed
      acceptSAChanges: Accept,
      createdByID: 1,
      organisationKeyID: common.organisationKeyID,
      organisationID: common.organisationID,
      //form level params : fixed
      templateTypeID: TemplateObj.templateTypeID, //will change module wise
      templateKeyID: TemplateObj.templateKeyID,
      userKeyID: common.userKeyID,
      orgBusinessTypeID:
        TemplateObj.orgBusinessTypeID === null
          ? common.businessTypeID
          : TemplateObj.orgBusinessTypeID,
      isDefault: TemplateObj.isDefault,
      isPredefined: common.roleTypeId === USER_ROLE_TYPE.SuperAdmin ? 1 : 0,
      //form level params : will change according to module
      templateName: TemplateObj.templateName,
      status: TemplateObj.status,
      templateElementList:
        TemplateObj.templateTypeID == 3 ? null : templateElementList,
      professionTypeList:
        common.professionTypeLists?.length > 1 ||
          common.organisationKeyID === null
          ? TemplateObj.professionTypeList
          : [
            {
              professionTypeId: professionTypeInputValue[0]?.professionTypeId,
              professionTypeName:
                professionTypeInputValue[0]?.professionTypeName,
            },
          ],
    };
    AddUpdateTermAndConditionData(ApiRequest_ParamsObj);
  };

  // Add or Update Service Category Data
  const AddUpdateTermAndConditionData = async (apiRequestParams) => {
    setLoader(true);
    try {
      let url = "/AddUpdateTermsAndConditions";
      if (apiRequestParams.templateKeyID !== null) {
        url = `/AddUpdateTermsAndConditions?templateKeyID=${apiRequestParams.templateKeyID}`;
      }
      if (
        apiRequestParams.templateTypeID === 3 ||
        apiRequestParams.templateTypeID === "3"
      ) {
        const response = await AddUpdateTermAndCondition(url, apiRequestParams);
        if (response) {

          if (response?.data?.statusCode === 200) {
            const ModuleKeyID = response.data.responseData.data;
            const formData = new FormData();
            // Instead, you should append the entire file
            const isBinary = selectedFile.fileName instanceof Blob || selectedFile.fileName instanceof File;
            if (isBinary) {
              formData.set("file", selectedFile.fileName); // Append the file itself
              const uploadResponse = await AddUpdateTemplateDataWithPdf(
                selectedFile.size,
                ModuleKeyID,
                formData
              );

              if (uploadResponse) {
                if (apiRequestParams.templateKeyID === null) {
                  $("#" + props.id).modal("show");
                  $("#" + "ConfirmSAChangesModel").modal("hide");
                  setOpenSuccessModal(true);
                  props.setIsAddUpdateActionDone(true);
                  setLoader(false);
                  navigate("/terms-and-conditions");
                } else {
                  $("#" + "ConfirmSAChangesModel").modal("hide");
                  setOpenSuccessModal(true);
                  setLoader(false);
                  props.setIsAddUpdateActionDone(true);
                  navigate("/terms-and-conditions");
                }
              } else {
                setErrorMessage(uploadResponse?.response?.data?.errorMessage);
                setLoader(false);
              }
            } else {
              $("#" + props.id).modal("show");
              $("#" + "ConfirmSAChangesModel").modal("hide");
              setOpenSuccessModal(true);
              props.setIsAddUpdateActionDone(true);
              setLoader(false);
              navigate("/terms-and-conditions");
            }
          } else {
            setErrorMessage(response?.response?.data?.errorMessage);
            setLoader(false);
          }
        }
      } else if (
        apiRequestParams.templateTypeID === 4 ||
        apiRequestParams.templateTypeID === "4"
      ) {
        const response = await AddUpdateTermAndCondition(url, apiRequestParams);
        if (response) {
          if (response?.data?.statusCode === 200) {
            if (apiRequestParams.templateKeyID === null) {
              // toast.success("Added Successfully.");
              $("#" + props.id).modal("show");
              setOpenSuccessModal(true);
              props.setIsAddUpdateActionDone(true);
              setLoader(false);
              navigate("/terms-and-conditions");
            } else {
              // toast.success("Updated Successfully.");
              setOpenSuccessModal(true);
              props.setIsAddUpdateActionDone(true);
            }
          } else {
            setLoader(false);
            setErrorMessage(response?.response?.data?.errorMessage);
          }
        }
      }
    } catch (error) {
      setLoader(false);
      console.error(error);
    }
  };

  // handle function
  const handlePdfDelete = () => {
    setTemplateObj({
      ...TemplateObj,
      pdf: null,
    });
    setSelectedFile({
      fileName: null,
      size: null,
    });
  };

  // handle function
  const handleSubmit = () => {
    setTopbar("block");
    navigate("/terms-and-conditions");
    SetInitialModelData();
  };

  const handleFileUpload = (e) => {
    e.preventDefault();
    setErrorMessage(""); // Clear any existing error message
    const file = e.target.files[0];
    setRequireErrorMessage(false);
    // Check if a file is selected
    if (file) {
      // Check if the file size exceeds the limit (2MB)
      if (file.size > 10 * 1024 * 1024) {
        setErrorMessage("File size must be less than 10MB.");
        return; // Return without setting the pdfUrl state
      }

      // File size is within the limit, create a URL for the file
      const url = URL.createObjectURL(file);
      setPdfUrl(url);

      // Update the selectedFile state
      setSelectedFile({
        fileName: file,
        size: file.size,
      });
    }
  };

  //2) BusinessType Lookup List Api
  const GetBusinessTypeLookupListData = async () => {
    try {
      const data = await GetBusinessTypeLookupList();
      if (data?.data?.statusCode === 200) {
        if (data?.data?.responseData?.data) {
          let BusinessTypeListData = data?.data?.responseData?.data;
          BusinessTypeListData = BusinessTypeListData.map((BusinessType) => ({
            value: BusinessType.businessTypeID,
            label: BusinessType.businessTypeName,
          }));
          setBusinessTypeLookupList(BusinessTypeListData);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };
  //Change Template  type
  const handleChangeTemplateType = (e) => {
    if (TemplateObj.templateTypeID !== null) {
      setTemplateObj({
        ...TemplateObj,
        // keyID: null,
        templateTypeID: e.value,
        organisationID: null,
        orgBusinessTypeID: common.businessTypeID,
        status: 1,
        createdByID: null,
        isDefault: false,
        // templateName: "",
        // pdf: null,
        businessTypeID: null,
        isPredefined: null,
      });
      // setSelectedFile({
      //   ...selectedFile,
      //   fileName: null,
      //   size: null,
      // });
      // setEditorState("");
      // setTemplateElementList([
      //   {
      //     TTETMapID: null, //Template's Template Element Type Mapping Id.
      //     templateElementTypeID: 2,
      //     headings: null,
      //     shortDesc: null,
      //     htmlContent: null,
      //   },
      // ]);
    } else {
      setTemplateObj({
        ...TemplateObj,
        templateTypeID: e.value,
      });
    }
  };
  const editorRef = useRef(null);
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

  const templateTypeFilter = TemplateTypeLookupList?.filter(
    (template) => template.value == TemplateObj.templateTypeID
  );
  const orgBusinessTypeFilter = BusinessTypeLookupList?.filter(
    (businessType) => businessType.value == TemplateObj.orgBusinessTypeID
  );
  const IsActiveFilter = Utils.IS_default.find(
    (item) => TemplateObj.isDefault == item.value
  );
  const professionTypeInputValue = professionTypeLookupList.filter(
    (item) => common.professionTypeLists[0] === item.professionTypeId
  );

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
        moduleKeyID: location.state?.templateKeyID,
        moduleName: "Predefined-TnC-Template"
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
            navigate("/terms-and-conditions")
            props.setIsAddUpdateActionDone(true);
          } else {
            $("#" + "ConfirmSAChangesModel").modal("hide");
            navigate("/terms-and-conditions")
            props.setIsAddUpdateActionDone(true);
          }
        } else {
          setOpenErrorModal(true)
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
      TemplateAddUpdateBtnClicked(true)
    } else {
      DeclineSuperAdminChangesData()
    }
  }

  return (
    <div className="container-fluid new-item-page-container rt-form tc-form">
      <div class="new-item-page-nav"></div>
      <div class="new-item-page-content">
        <div class="row form-row">
          <div class="col-lg-12">
            <h3 class="modal-title" id="exampleModalLabel">
              <BackButtonSvg onClick={handleSubmit} />
              {modelAction === "Add"
                ? getCrudPopUpTitleName("Add", moduleName)
                : getCrudPopUpTitleName("Update", moduleName)}
            </h3>
            <div class="separator mb-3"></div>
            <div className="template-height scrollbar" id="style-1">
              <div class="tab-content">
                <div className="rt-card">
                <div className="rt-card__head">
                  <span className="rt-card__icon">
                    <i className="ri-file-shield-2-line"></i>
                  </span>
                  <div>
                    <h4 className="rt-card__title">Template Details</h4>
                    <p className="rt-card__desc">
                      Name, type and default setting of this terms &amp; conditions template.
                    </p>
                  </div>
                </div>
                <div className="rt-fields">
                <>
                  <div className="row fieldset" id="ProfessionTypeDiv">
                    <SAPredefinedChangesNotifyMessageModel Params={{ moduleName: moduleName, SAChanges: location.state?.Type }} />
                    {(common.professionTypeLists?.length > 1 ||
                      common.organisationKeyID === null) && (
                        <>
                          <div className="col-lg-3 template-label text-left">
                            <div className="mb-1">
                              <label htmlFor="useremail" className="form-label">
                                Profession Type
                                <span className="text-danger">*</span>
                              </label>
                            </div>
                          </div>
                          <div className="col-lg-9">
                            <div className="">
                              <div className="input-group user-role-select">
                                {common.professionTypeLists?.length > 1 ||
                                  common.organisationKeyID === null ? (
                                  <Select
                                    isMulti
                                    className="user-role-select"
                                    options={ProfessionalTypeLookeupListOptions}
                                    value={professionTypeValue}
                                    onChange={OnChangeSelectProfessionType}
                                  />
                                ) : (
                                  ""
                                  // <input
                                  //   disabled
                                  //   type="text"
                                  //   class="input-text"
                                  //   placeholder=" Profession Type"
                                  //   value={
                                  //     professionTypeInputValue[0]?.professionTypeName
                                  //   }
                                  // />
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
                          </div>
                        </>
                      )}
                  </div>
                </>
                {common.roleTypeId === USER_ROLE_TYPE.SuperAdmin &&
                  common.organisationKeyID === null && (
                    <>
                      <div
                        className="row mb-2 fieldset"
                        id="OrganisationBusinessDiv"
                      >
                        <div className="col-lg-3 template-label text-left">
                          <div className="mb-1">
                            <label className="form-label">
                              Organisation Business Type{" "}
                              <span className="text-danger">*</span>
                            </label>
                          </div>
                        </div>
                        <div className="col-lg-9">
                          <div className=" input-group">
                            <Select
                              className="user-role-select"
                              options={BusinessTypeLookupList.slice(1, 6)}
                              value={orgBusinessTypeFilter}
                              onChange={(e) => {
                                setTemplateObj({
                                  ...TemplateObj,
                                  orgBusinessTypeID: e.value,
                                });
                              }}
                            />
                            {requireErrorMessage &&
                              (TemplateObj.orgBusinessTypeID === "" ||
                                TemplateObj.orgBusinessTypeID === null) ? (
                              <label className="validation">
                                {ERROR_MESSAGES}
                              </label>
                            ) : (
                              ""
                            )}
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                <div className="row fieldset" id="TemplateNameDiv">
                  <div className="col-lg-3 template-label text-left">
                    <div className="mb-1">
                      <label className="form-label">
                        Template Name
                        <span className="text-danger">*</span>
                      </label>
                    </div>
                  </div>
                  <div className="col-lg-9">
                    <div className="">
                      <div className="input-group">
                        <input
                          type="text"
                          className="input-text"
                          placeholder="Enter Template Name"
                          value={TemplateObj.templateName}
                          onChange={(e) => {
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
                            setErrorMessage("");
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
                </div>
                <div className="row fieldset" id="TemplateTypeDiv">
                  <div className="col-lg-3 template-label text-left">
                    <div className="mb-1">
                      <label className="form-label">
                        Template Type
                        <span className="text-danger">*</span>
                      </label>
                    </div>
                  </div>
                  <div className="col-lg-9 ">
                    <div className="">
                      <div className="input-group">
                        <Select
                          className="user-role-select"
                          options={TemplateTypeLookupList}
                          value={templateTypeFilter}
                          onChange={(e) => {
                            setRequireErrorMessage(false);
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
                <div className="row" id="IsDefaultDiv">
                  <div
                    style={{ padding: "0px 0px 17px 14px" }}
                    className="col-lg-3 template-label text-left"
                  >
                    <div className="mb-1">
                      <label className="form-label">
                        Is Default?
                        <span className="text-danger">*</span>
                      </label>
                    </div>
                  </div>
                  <div className="col-lg-9">
                    <div className="">
                      <div className="input-group">
                        <Select
                          isDisabled={modelAction === "Update" ? true : false}
                          className="user-role-select"
                          options={Utils.IS_default}
                          value={IsActiveFilter}
                          onChange={(e) =>
                            setTemplateObj({
                              ...TemplateObj,
                              isDefault: e.value,
                            })
                          }
                        />
                      </div>
                      {requireErrorMessage &&
                        (TemplateObj.status === "" ||
                          TemplateObj.status === null) ? (
                        <label className="validation">{ERROR_MESSAGES}</label>
                      ) : (
                        ""
                      )}
                    </div>
                    {modelAction === "Update" ? <></> :
                      <div
                        style={{ fontSize: "12px" }}
                        className="text-muted helpMessage"
                      >
                        If you set this template as the default, any other
                        template with the same template type will automatically be
                        marked as non-default.
                      </div>
                    }
                  </div>
                </div>
                </div>
                </div>
                {(TemplateObj.templateTypeID === 3 ||
                  TemplateObj.templateTypeID === "3") && (
                    <div className="rt-card tc-pdf">
                      <div className="rt-card__head">
                        <span className="rt-card__icon">
                          <i className="ri-file-pdf-line"></i>
                        </span>
                        <div>
                          <h4 className="rt-card__title">PDF Template</h4>
                          <p className="rt-card__desc">
                            Upload the PDF used as this terms &amp; conditions template.
                          </p>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-lg-3 template-label text-left">
                          <div className="mb-1">
                            <label className="form-label">
                              PDF Template
                              <span className="text-danger">*</span>
                            </label>
                          </div>
                        </div>

                        <div className="col-lg-9">
                          <div className="mb-3">
                            <div>
                              <div className="col-lg-9">
                                {TemplateObj.pdf === null ? (
                                  selectedFile.fileName && (
                                    <button
                                      onClick={handlePdfDelete}
                                      style={{
                                        marginBottom: "5px",
                                        fontSize: "75%",
                                      }}
                                      className="btn btn-sm btn-danger remove-item-btn "
                                    >
                                      <i class="bi bi-trash3 margin-right"></i>{" "}
                                      Delete
                                    </button>
                                  )
                                ) : (
                                  <button
                                    onClick={handlePdfDelete}
                                    style={{
                                      marginBottom: "5px",
                                      fontSize: "75%",
                                    }}
                                    className="btn btn-sm btn-danger remove-item-btn "
                                  >
                                    <i class="bi bi-trash3 margin-right"></i>{" "}
                                    Delete
                                  </button>
                                )}
                              </div>
                            </div>
                            {TemplateObj.pdf === null ? (
                              <>
                                {selectedFile.fileName ? (
                                  <>
                                    <div className="input-group">
                                      {/* Create a temporary URL for the file */}
                                      {/* Assuming selectedFile is the file object */}

                                      {/* Embed the PDF using an iframe */}
                                      {/* <iframe
                                        title="PDF Viewer"
                                        src={pdfUrl}
                                        width="100%"
                                        height="600px"
                                      ></iframe> */}
                                      <object
                                        title="PDF Viewer"
                                        data={pdfUrl}
                                        width="100%"
                                        height="500px"
                                      >
                                        {/* // <p>PDF cannot be displayed. <a href={TemplateObj.pdf}>Download</a> it instead.</p> */}
                                      </object>
                                    </div>
                                  </>
                                ) : (
                                  <>
                                    <div className="input-group">
                                      <input
                                        type="file"
                                        accept=".pdf"
                                        onChange={(e) => {
                                          e.preventDefault(); // Prevent the default form submission behavior
                                          handleFileUpload(e);
                                        }}
                                      />
                                    </div>
                                    <div className="text-muted helpMessage">
                                      Supported file types are .PDF up to a file
                                      size of 10MB.
                                    </div>
                                    {requireErrorMessage &&
                                      !selectedFile.fileName &&
                                      TemplateObj.templateTypeID === 3 ? (
                                      <label className="validation">
                                        {ERROR_MESSAGES}
                                      </label>
                                    ) : (
                                      ""
                                    )}
                                  </>
                                )}
                              </>
                            ) : (
                              <>
                                <div className="input-group">
                                  {/* Embed the PDF using an iframe */}
                                  <object
                                    title="PDF Viewer"
                                    data={`https://docs.google.com/viewer?url=${encodeURIComponent(TemplateObj.pdf)}&embedded=true`}
                                    width="100%"
                                    height="500px"
                                  >
                                    {/* // <p>PDF cannot be displayed. <a href={TemplateObj.pdf}>Download</a> it instead.</p> */}
                                  </object>

                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                {(TemplateObj.templateTypeID === 3 ||
                  TemplateObj.templateTypeID === "3") && (
                    <>
                      {/* <div className="row">
                        <div className="col-lg-3"></div>
                        <div className="col-lg-9">
                          <div className="mb-3">
                            {TemplateObj.pdf === null ? (
                              selectedFile.fileName && (
                                <button
                                  onClick={handlePdfDelete}
                                  style={{ float: "right", paddingTop: "5px" }}
                                  className="btn btn-sm btn-danger remove-item-btn d-flex gap-1"
                                >
                                  Delete
                                </button>
                              )
                            ) : (
                              <button
                                onClick={handlePdfDelete}
                                style={{ float: "right", paddingTop: "5px" }}
                                className="btn btn-sm btn-danger remove-item-btn d-flex gap-1"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </div>
                      </div> */}
                    </>
                  )}

                {(TemplateObj.templateTypeID === 4 ||
                  TemplateObj.templateTypeID === "4") && (
                    <div className="rt-card rt-content">
                      <div className="rt-card__head">
                        <span className="rt-card__icon">
                          <i className="ri-file-text-line"></i>
                        </span>
                        <div>
                          <h4 className="rt-card__title">Template Content</h4>
                          <p className="rt-card__desc">
                            Click a variable to copy it, then paste it into the content below.
                          </p>
                        </div>
                      </div>

                      <div className="fieldset-group helper-variables-div">
                        <label className="fieldset-group-label">Variables</label>
                        <AccountantVariables
                          ModuleName="TnCTemplate"
                          ClintType={null}
                          businessTypeId={
                            common.organisationKeyID === null
                              ? TemplateObj.orgBusinessTypeID
                              : common.businessTypeID
                          }
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
                  )}
                {requireErrorMessage &&
                  (templateElementList[0].htmlContent === null ||
                    templateElementList[0].htmlContent === "" ||
                    templateElementList[0].htmlContent === undefined ||
                    templateElementList[0].htmlContent === "<p></p>\n" ||
                    templateElementList[0].htmlContent === "<p></p>" ||
                    templateElementList[0].htmlContent === "<p><br></p>") &&
                  TemplateObj.templateTypeID === 4 ? (
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
              <label
                style={{ display: "flex", justifyContent: "center" }}
                className="validation mt-2"
              >
                {/* {errorMessage} */}
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
                {location.state?.Type ? (<>
                  <button
                    type="submit"
                    class="btn btn-md btn-success accept-item-btn"
                    onClick={() => {
                      TemplateAddUpdateBtnClicked("Accept");
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
                    onClick={handleSubmit}
                    style={{ float: "right", paddingTop: "5px" }}
                    className="btn btn-md btn-light"
                  >
                    <span>{getCrudButtonTextName("Cancel")}</span>
                  </button>
                  <button
                    onClick={(e) => TemplateAddUpdateBtnClicked()}
                    style={{ float: "right", paddingTop: "5px" }}
                    className="btn btn-md btn-success create-item-btn"
                  >
                    <span>
                      {modelAction === "Add"
                        ? getCrudButtonTextName("Add", moduleName)
                        : getCrudButtonTextName("Update", moduleName)}
                    </span>
                  </button>
                </>)
                }
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
        setIsCheck={setIsCheck}
        isCheck={isCheck}
        setOpenSuccessModal={setOpenSuccessModal}
        openSuccessModal={openSuccessModal}
        modelAction={modelAction}
        message={`${moduleName} ${TemplateObj.templateName}`}
      />
      <ErrorModel
        ErrorModel={openErrorModal}
        handleClose={handleClose}
        ErrorMessage={errorMessage}
      />
      <AcceptSuperAdminChangesConfirmation
        openErrorModal={openErrorModal}
        ModelId={props.id}
        Status={Status}
        openSuccessModal={openSuccessModal}
        modelRequestData={location.state}
        UpdatedChanges={handleConfirmButton}
      />
    </div>
  );
}

export default Add_New_Term_And_Condition;
