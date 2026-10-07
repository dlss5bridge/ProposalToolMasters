/* global $ */
import React, { useContext, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import Tooltip from "@mui/material/Tooltip";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Android12Switch from "../../../components/AndroidSwitch";
import "../email_template/EmailTemplate.css";
import "../Reminder/ReminderEmailTemplate/AddReminderTemplate-redesign.css";
import "./AddNewTemplateHeaderFooter-redesign.css";
import { Row, Col } from "reactstrap";
import Select from "react-select";
import { AuthContextProvider } from "../../../AuthContext/AuthContext";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { GetProfessionTypeLookupList } from "../../../redux/Services/Master/ProfessionTypeApi";
import { GetTemplateTypeList } from "../../../redux/Services/Master/TemplateTypeLookupListApi";
import { USER_ROLE_TYPE } from "../../../Middleware/enums";
import SAPredefinedChangesNotifyMessageModel from "../../../components/SAPredefinedChangesNotifyMessageModel";
import { AddUpdateTemplateFooterPdf, AddUpdateTemplateHeaderFooterWithPdf, AddUpdateTemplateHeaderPdf, GetTemplateList,GetTemplateHeaderFooterModel,AddUpdateTemplateHeaderFooter, GetTemplatesList, GetAllTemplatesList } from "../../../redux/Services/Config/TemplateApi";

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
function Add_New_Header_And_Footer(props) {
  //Declare State:
  const moduleName = "Header and Footer";
  let getTemplateListApiCallCount = 0;
  const [editorStateForHeader, setEditorStateForHeader] = useState("");
  const [editorStateForFooter, setEditorStateForFooter] = useState("");

  const {
    setTopbar,
    prospectName,
    setLoader,
    proposalName,
    EngagementName,
    getCrudButtonTextName,
    getCrudPopUpTitleName,
    getCrudButtonToolTipName,
    scrollUpDownByElementID,
    HtmlToPlainText,
    hasActionAccess,
    isMobileRecords,
    isMobile,
    setListCount,
    listCount,
    desktopRecords,
    maxCountToRecallApi
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

  const [professionTypeLookupList, setProfessionTypeLookupList] = useState([]);

  // const [TemplateTypeLookupList, setTemplateTypeLookupList] = useState([]);
  const [selectedOption,setSelectedOption] = useState(null);
  const [selectedHeaderFile, setSelectedHeaderFile] = useState({
    fileName: null,
    size: null,
  });
  const [selectedFooterFile, setSelectedFooterFile] = useState({
    fileName: null,
    size: null,
  });
  const [currentPage, setCurrentPage] = useState(
      common.currentPage === "" ? 1 : common.currentPage
    );
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedTemplates,setSelectedTemplate] = useState([]);
  const [templateKeyID,setTemplateKeyID] = useState([]);
  const pageSize = isMobile ? isMobileRecords : desktopRecords;
  const isCurrentPage =
    common.currentPage === "" ? currentPage : common.currentPage;
  const [primarySortDirection, setPrimarySortDirection] = useState(null);
  const [sortType, setSortType] = useState(null);
  const [selectedTemplateType, setSelectedTemplateType] = useState(null);
  const [prospectType, setProspectType] = useState(null); 
  const [businessTypeID, setBusinessTypeID] = useState(null); 
  const [modelAction, setModelAction] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [totalRecords, setTotalRecords] = useState(-1);
  const [errorEditorMessage, setEditorMassage] = useState(null);
  const [BusinessTypeLookupList, setBusinessTypeLookupList] = useState([]);
  const [TemplateTypeLookupList, setTemplateTypeLookupList] = useState([]);
  const [requireErrorMessage, setRequireErrorMessage] = useState(false);
  const [openErrorModal, setOpenErrorModal] = React.useState(false);
  const [imageUrlHeader, setImageUrlHeader] = useState(null);
  const [imageUrlFooter, setImageUrlFooter] = useState(null);
  const allOption = { value: "ALL", label: "ALL (Select All Templates)" };
  const [TemplateList, setTemplateList] = useState([{
    value: null,
    label: null,
}]);
    const [modelRequestData, setModelRequestData] = useState({
      Action: null,
      message: "",
      ServiceName: [],
      name: null,
    });
  const [TemplateObj, setTemplateObj] = useState({
    hfTemplateKeyID: null,
    status: 1,
    professionTypeList: [],
    templateList: [],
    templateName: undefined,
    templateTypeID: null,
    headerHeight: null,
    footerHeight: null,
    templateContentForHeader: null,
    templateContentForFooter: null,
    showSeparatorLines: true,
    headerImage: null,
    footerImage: null
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
    // GetTemplateListData(isCurrentPage);
    GetBusinessTypeLookupListData();
    GetTemplateListData();
    GetTemplateTypeLookupListData();
    setTopbar("none");
    if (location.state?.hfTemplateKeyID !== null) {
      GetTemplateHeaderFooterModelData(location.state?.hfTemplateKeyID);
      setModelRequestData({
        ...modelRequestData,
        Action: "Update"
      })
    }
  }, [location.state]);

  const SetInitialModelData = () => {
    setTemplateObj({
      hfTemplateKeyID: null,
      templateName: undefined,
      status: 1,
      professionTypeList: [],
      templateList: [],
      templateTypeID: null,
      headerFooter: null,
      footerHeight: null,
      templateContentForHeader: null,
      templateContentForFooter: null,
      showSeparatorLines: true,
      headerImage: null,
      footerImage: null
    });
    setErrorMessage("");
  };

    //2) TemplateType Lookup List Api
    const GetTemplateTypeLookupListData = async () => {
      try {
        const data = await GetTemplateTypeList(7);
        if (data?.data?.statusCode === 200) {
          if (data?.data?.responseData?.data) {
            let TemplateTypeListData = data?.data?.responseData?.data;
            TemplateTypeListData = TemplateTypeListData.map((templateType) => ({
              value: templateType.templateTypeID,
              label: templateType.templateTypeName,
            })).filter(x => x.value !== 42);
            setTemplateTypeLookupList(TemplateTypeListData);
          }
        }
      } catch (error) {
        console.log(error);
      }
    };

  // const TemplateTypeLookupList = [
  //   { value: 1, label: "Image"}, // Actual Value is different 
  //   { value: 4, label: "Custom Template"}
  // ]
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

  const GetTemplateHeaderFooterModelData = async(id) => {
    if(!id) {
      console.log("No id provided");
      return;
    }
    try{
      const data = await GetTemplateHeaderFooterModel(id);
      if(data?.data?.statusCode === 200){
        if(data?.data?.responseData?.data){
          const ModelData = data?.data?.responseData?.data;
          console.log(ModelData);
          setTemplateObj({
            ...TemplateObj,
            hfTemplateKeyID: ModelData.hfTemplateKeyID,
            templateName: ModelData.hfTemplateName,
            templateTypeID: ModelData.templateTypeID,
            status: ModelData.status,
            headerHeight: ModelData.headerHeight,
            footerHeight: ModelData.footerHeight,
            professionTypeList: ModelData.professionTypeList,
            templateList: ModelData.templateList,
            templateContentForHeader: ModelData.templateContentForHeader,
            templateContentForFooter:ModelData.templateContentForFooter,
            showSeparatorLines: ModelData.showSeparatorLines,
            headerImage: ModelData.headerImage || null,
            footerImage: ModelData.footerImage || null,
          })
          setSelectedHeaderFile({
            ...selectedHeaderFile,
            fileName: ModelData.headerImage
          })
          setSelectedFooterFile({
            ...selectedFooterFile,
            fileName: ModelData.footerImage
          })
          setEditorStateForHeader(ModelData.templateContentForHeader)
          setEditorStateForFooter(ModelData.templateContentForFooter)
          setLoader(false);
        }
        else {
          setErrorMessage(data?.data?.errorMessage);
          setLoader(false);
        }
      }
    }
    catch(error){
      console.error(error);
      setLoader(false);
    }
  }
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

  const TemplateListValue = TemplateObj.templateList?.map((item) => ({
    value: item.templateID,
    label: item.templateName
  }));
  //2) TemplateType Lookup List Api
  // const GetTemplateTypeLookupListData = async () => {
  //   try {
  //     const data = await GetTemplateTypeList(2);
  //     if (data?.data?.statusCode === 200) {
  //       if (data?.data?.responseData?.data) {
  //         let TemplateTypeListData = data?.data?.responseData?.data;
  //         TemplateTypeListData = TemplateTypeListData.map((templateType) => ({
  //           value: templateType.templateTypeID,
  //           label: templateType.templateTypeName,
  //         }));
  //         setTemplateTypeLookupList(TemplateTypeListData);
  //       }
  //     }
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

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
  // const handleTemplateChange = (t) => {
  //   const updatedTemplateList = t.map((option) => ({
  //     templateID: option.value,
  //     templateName: option.label
  //   }));
  //   setTemplateObj({
  //     ...TemplateObj,
  //     templateList: updatedTemplateList,
  //   })
  // };

  const handleTemplateChange = (selectedOptions) => {
    if (!selectedOptions) {
      setTemplateObj({ ...TemplateObj, templateList: [] });
      return;
    }
  
    // Check if "ALL" is selected
    const isAllSelected = selectedOptions.some(option => option.value === "ALL");
  
    let updatedTemplateList;
    if (isAllSelected) {
      updatedTemplateList = TemplateList.filter(option => option.value !== "ALL"); 
    } else {
      updatedTemplateList = selectedOptions;
    }
  
    setTemplateObj({
      ...TemplateObj,
      templateList: updatedTemplateList.map(option => ({
        templateID: option.value,
        templateName: option.label
      })),
    });
  };

  const handleClose = async () => {
    if (isCheck) {
      setLoader(true)
      const Notification = await NotifySuperAdminPredefinedChangesToAdmin({
        userKeyID: common.userKeyID,
        moduleKeyID: TemplateObj.hfTemplateKeyID,
        moduleName: "Predefined-HnF-Template"
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
      // $("#" + "ConfirmSAChangesModel").modal("hide");
      setOpenSuccessModal(false);
      setOpenErrorModal(false)
      navigate("/templates", { state: "Header and Footer" });
    }
  };

  // F] Calling CRUD Api here
  // 1) Get Model Data Api
  // const GetTemplateListData = async (
  //   i,
  //   searchKeywordValue,
  //   sortValue,
  //   TemplateSort,
  //   templateTypeID,
  //   clientBusinessTypeID,
  //   businessTypeId
  // ) => {
  //   setLoader(true);
  //   const pageNoList = i ? i - 1 : 0;
  //   try {
  //     const data = await GetTemplateList({
  //       pageSize: Number(pageSize),
  //       pageNo: pageNoList,
  //       organisationID: common.organisationID,
  //       organisationKeyID: common.organisationKeyID,
  //       SearchKeyword:
  //         searchKeywordValue === undefined ? searchKeyword : searchKeywordValue,
  //       primarySortDirection:
  //         sortValue === undefined ? primarySortDirection : sortValue,
  //       PrimarySortColumnName: sortType == "" ? TemplateSort : sortType,
  //       templateTypeID:
  //         templateTypeID === undefined ? selectedTemplateType : templateTypeID,
  //       clientBusinessTypeID:
  //         clientBusinessTypeID === undefined
  //           ? prospectType
  //           : clientBusinessTypeID,
  //       businessTypeID:
  //         businessTypeId === undefined ? businessTypeID : businessTypeId,
  //     });
  //     if (data) {
  //       if (data?.data?.statusCode === 200) {
  //         setLoader(false);
  //         getTemplateListApiCallCount = 0;
  //         if (data?.data?.responseData?.data) {
  //           const totalCount = data.data.totalCount;
  //           const TemplateListData = data.data.responseData.data.map((item) => ({
  //               label: `${item.templateName}(${item.clientBusinessType})`,
  //               value: item.templateID,
  //             }));
  //             setTemplateList(TemplateListData);
  //             setTotalRecords(TemplateListData.length);
  //           // if (pageNoList > 0 && TemplateListData.length === 0) {
  //           //   let newPaneNo = Number(pageNoList);
  //           //   if (newPaneNo > 1) {
  //           //     newPaneNo = newPaneNo - 1;
  //           //   }
  //           //   GetTemplateListData(
  //           //     newPaneNo,
  //           //     searchKeywordValue,
  //           //     sortValue,
  //           //     TemplateSort
  //           //   );
  //           //   setCurrentPage(pageNoList);
  //           //   return;
  //           // }
  //           setListCount(totalCount);
  //         }
  //       } else {
  //         if (getTemplateListApiCallCount < maxCountToRecallApi) {
  //           getTemplateListApiCallCount += 1;
  //           setTimeout(function () {
  //             GetTemplateListData(
  //               i,
  //               searchKeywordValue,
  //               sortValue,
  //               TemplateSort
  //             );
  //           }, 2000);
  //         } else {
  //           setLoader(false);
  //         }

  //         setErrorMessage(data?.data?.errorMessage);
  //       }
  //     }
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };
  const GetTemplateListData = async () => {
    setLoader(true);
    try {
      const data = await GetAllTemplatesList(1, common.organisationKeyID);
      if (data) {
        if (data?.data?.statusCode === 200) {
          setLoader(false);
          getTemplateListApiCallCount = 0;
          if (data?.data?.responseData?.data) {
            const totalCount = data.data.totalCount;
            const TemplateListData = data.data.responseData.data.map((item) => ({
                label: `${item.templateName}(${item.clientBusinessType})`,
                value: item.templateID
              }));
              setTemplateList(TemplateListData);
              setTotalRecords(TemplateListData.length);
            // if (pageNoList > 0 && TemplateListData.length === 0) {
            //   let newPaneNo = Number(pageNoList);
            //   if (newPaneNo > 1) {
            //     newPaneNo = newPaneNo - 1;
            //   }
            //   GetTemplateListData(
            //     newPaneNo,
            //     searchKeywordValue,
            //     sortValue,
            //     TemplateSort
            //   );
            //   setCurrentPage(pageNoList);
            //   return;
            // }
            setListCount(totalCount);
          }
        } else {
          if (getTemplateListApiCallCount < maxCountToRecallApi) {
            getTemplateListApiCallCount += 1;
            setTimeout(function () {
              GetTemplateListData(common.organisationKeyID);
            }, 2000);
          } else {
            setLoader(false);
          }

          setErrorMessage(data?.data?.errorMessage);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };
  // 2) Add Update Button Click Function
  // const TemplateAddUpdateBtnClicked = (Accept) => {
  //   if (Accept === "Accept") {
  //     $("#" + "ConfirmSAChangesModel").modal("show");

  //     setStatus(true)
  //     return
  //   }
  //   // Check Validations will be done here
  //   if (
  //     (common.professionTypeLists?.length > 1 ||
  //       common.organisationKeyID === null) &&
  //     professionTypeValue?.length === 0
  //   ) {
  //     scrollUpDownByElementID("ProfessionTypeDiv");
  //     setRequireErrorMessage(true);
  //     return false; // Return false or handle your error logic here if needed.
  //   } else if (
  //     TemplateObj.templateName === undefined ||
  //     TemplateObj.templateName === "" ||
  //     TemplateObj.templateTypeID === undefined ||
  //     TemplateObj.templateTypeID === "" ||
  //     TemplateObj.templateTypeID === null ||
  //     (common.organisationKeyID === null &&
  //       (TemplateObj.orgBusinessTypeID === "" ||
  //         TemplateObj.orgBusinessTypeID === null ||
  //         TemplateObj.orgBusinessTypeID === undefined))
  //   ) {
  //     if (
  //       common.organisationKeyID === null &&
  //       (TemplateObj.orgBusinessTypeID === "" ||
  //         TemplateObj.orgBusinessTypeID === null ||
  //         TemplateObj.orgBusinessTypeID === undefined)
  //     ) {
  //       scrollUpDownByElementID("OrganisationBusinessDiv");
  //     } else if (
  //       TemplateObj.templateTypeID === undefined ||
  //       TemplateObj.templateTypeID === "" ||
  //       TemplateObj.templateTypeID === null
  //     ) {
  //       scrollUpDownByElementID("TemplateTypeDiv");
  //     } else if (
  //       TemplateObj.templateName === undefined ||
  //       TemplateObj.templateName === ""
  //     ) {
  //       scrollUpDownByElementID("TemplateNameDiv");
  //     }
  //     setRequireErrorMessage(true);
  //     return false; // Return false or handle your error logic here if needed.
  //   } else if (TemplateObj.templateTypeID === 3 && !selectedFile.fileName) {
  //     // Check if PDF file is not selected
  //     setRequireErrorMessage(true);
  //     return false;
  //   } else if (
  //     (templateElementList[0].htmlContent === null ||
  //       templateElementList[0].htmlContent === "" ||
  //       templateElementList[0].htmlContent === undefined ||
  //       templateElementList[0].htmlContent === "<p></p>\n" ||
  //       templateElementList[0].htmlContent === "<p></p>" ||
  //       templateElementList[0].htmlContent === "<p><br></p>") &&
  //     TemplateObj.templateTypeID === 4
  //   ) {
  //     scrollUpDownByElementID(
  //       `EditorDiv_${templateElementList[0].htmlContent}`
  //     );
  //     setRequireErrorMessage(true);
  //     return false;
  //   } else if (!editorState && TemplateObj.templateTypeID === 4) {
  //     setRequireErrorMessage(true);
  //     return false;
  //   } else if (editorState) {
  //     const indexToUpdate = 0;
  //     const trimmedContent = HtmlToPlainText(editorState, moduleName);
  //     const hasTextAtZeroPosition = trimmedContent.trim().length > 0;
  //     if (!hasTextAtZeroPosition) {
  //       setEditorState("");
  //       const updatedTemplateElementList = [...templateElementList];
  //       updatedTemplateElementList[indexToUpdate] = {
  //         ...updatedTemplateElementList[indexToUpdate],
  //         htmlContent: null,
  //       };
  //       setTemplateElementList(updatedTemplateElementList);

  //       setRequireErrorMessage(true);
  //       return false;
  //     }
  //   } else {
  //     setRequireErrorMessage(false);
  //     setErrorMessage(""); // Clear the error message if there is content
  //   }

  //   // Preparing Object For Add Update and if any modification then it will done here
  //   const ApiRequest_ParamsObj = {
  //     //global level params : fixed
  //     acceptSAChanges: Accept,
  //     organisationKeyID: common.organisationKeyID,
  //     organisationID: common.organisationID,
  //     //form level params : fixed
  //     templateTypeID: TemplateObj.templateTypeID, //will change module wise
  //     hfTemplateID: TemplateObj.hfTemplateID,
  //     userKeyID: common.userKeyID,
  //     orgBusinessTypeID:
  //       TemplateObj.orgBusinessTypeID === null
  //         ? common.businessTypeID
  //         : TemplateObj.orgBusinessTypeID,
  //     isDefault: TemplateObj.isDefault,
  //     isPredefined: common.roleTypeId === USER_ROLE_TYPE.SuperAdmin ? 1 : 0,
  //     //form level params : will change according to module
  //     templateName: TemplateObj.templateName,
  //     status: TemplateObj.status,
  //     templateElementList:
  //       TemplateObj.templateTypeID == 3 ? null : templateElementList,
  //     professionTypeList:
  //       common.professionTypeLists?.length > 1 ||
  //         common.organisationKeyID === null
  //         ? TemplateObj.professionTypeList
  //         : [
  //           {
  //             professionTypeId: professionTypeInputValue[0]?.professionTypeId,
  //             professionTypeName:
  //               professionTypeInputValue[0]?.professionTypeName,
  //           },
  //         ],
  //   };
  //   AddUpdateTermAndConditionData(ApiRequest_ParamsObj);
  // };

  const TemplateAddUpdateBtnClicked = () => {
    // Modal display logic for Accept action
  
    // Validation logic
    let isValid = true;
  
    if (!TemplateObj.templateName) {
      scrollUpDownByElementID("TemplateNameDiv");
      setRequireErrorMessage(true);
      isValid = false;
    }
  
    if (!TemplateObj.templateTypeID ||
      TemplateObj.templateTypeID === null ||
      TemplateObj.templateTypeID === ""
    ) {
      scrollUpDownByElementID("TemplateTypeDiv");
      setRequireErrorMessage(true);
      isValid = false;
    } 
    // if (
    //   !TemplateObj.templateContentForHeader ||
    //   TemplateObj.templateContentForHeader.trim() === "" ||
    //   TemplateObj.templateContentForHeader === "<p><br></p>" ||
    //   TemplateObj.templateContentForHeader === "<p></p>"
    // ) {
    //   scrollUpDownByElementID("HeaderContentDiv");
    //   setRequireErrorMessage(false);
    //   isValid = true;
    // }
  
    // if (
    //   !TemplateObj.templateContentForFooter ||
    //   TemplateObj.templateContentForFooter.trim() === "" ||
    //   TemplateObj.templateContentForFooter === "<p><br></p>" ||
    //   TemplateObj.templateContentForFooter === "<p></p>"
    // ) {
    //   scrollUpDownByElementID("FooterContentDiv");
    //   setRequireErrorMessage(false);
    //   isValid = true;
    // }

  //   const isHeaderEmpty =
  //   TemplateObj.templateContentForHeader === null ||
  //   TemplateObj.templateContentForHeader === undefined ||
  //   TemplateObj.templateContentForHeader === "<p><br></p>" ||
  //   TemplateObj.templateContentForHeader === "<p></p>";

  // const isFooterEmpty =
  //   TemplateObj.templateContentForFooter === null ||
  //   TemplateObj.templateContentForFooter === undefined ||
  //   TemplateObj.templateContentForFooter === "<p><br></p>" ||
  //   TemplateObj.templateContentForFooter === "<p></p>";
  const isHeaderEmpty =
  TemplateObj.templateContentForHeader === null ||
  TemplateObj.templateContentForHeader === undefined || 
  TemplateObj.templateContentForHeader === "";

const isFooterEmpty =
  TemplateObj.templateContentForFooter === null ||
  TemplateObj.templateContentForFooter === undefined ||
  TemplateObj.templateContentForFooter === "";

if (isHeaderEmpty && isFooterEmpty) {
  scrollUpDownByElementID("FooterContentDiv");
  isValid = false;
}
    // if (TemplateObj.templateTypeID === 42 && (!selectedHeaderFile.fileName && !selectedFooterFile.fileName)) {
    //   // Check if PDF file is not selected
    //   setRequireErrorMessage(true);
    //   isValid = false;
    // }
    if (isHeaderEmpty && isFooterEmpty) {
      scrollUpDownByElementID("FooterContentDiv"); // or HeaderContentDiv depending on UX
      setRequireErrorMessage(true);
      setErrorMessage("Either header or footer content must be provided.");
      isValid = false;
    }    
  
    if (!isValid) {
      // Stop further processing if validation fails
      return false;
    }
  
    // Reset error state if all validations pass
    setRequireErrorMessage(false);
    setErrorMessage("");
  
    // Prepare payload for submission
  
    // Prepare payload for submission
    const apiRequestParams = {
      hfTemplateKeyID: TemplateObj.hfTemplateKeyID,
      hfTemplateName: TemplateObj.templateName,
      templateTypeID: TemplateObj.templateTypeID,
      headerHeight: TemplateObj.headerHeight,
      footerHeight: TemplateObj.footerHeight,
      templateContentForHeader: TemplateObj.templateContentForHeader,
      templateContentForFooter: TemplateObj.templateContentForFooter,
      showSeparatorLines: Boolean(TemplateObj.showSeparatorLines),
      userKeyID: common.userKeyID || null,
      organisationKeyID: common.organisationKeyID || null,
      templateList: TemplateObj.templateList,
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
  
    // Call the Add/Update function
    AddUpdateHeaderFooterTemplateData(apiRequestParams);
  };
  

  // Add or Update Service Category Data
  const AddUpdateHeaderFooterTemplateData = async (apiRequestParams) => {
    setLoader(true);
    try {
      // if (
      //   apiRequestParams.templateTypeID === 3 ||
      //   apiRequestParams.templateTypeID === "3"
      // ) {
      //   const response = await AddUpdateTermAndCondition(url, apiRequestParams);
      //   if (response) {

      //     if (response?.data?.statusCode === 200) {
      //       const ModuleKeyID = response.data.responseData.data;
      //       const formData = new FormData();
      //       // Instead, you should append the entire file
      //       const isBinary = selectedFile.fileName instanceof Blob || selectedFile.fileName instanceof File;
      //       if (isBinary) {
      //         formData.set("file", selectedFile.fileName); // Append the file itself
      //         const uploadResponse = await AddUpdateTemplateDataWithPdf(
      //           selectedFile.size,
      //           ModuleKeyID,
      //           formData
      //         );

      //         if (uploadResponse) {
      //           if (apiRequestParams.hfTemplateID === null) {
      //             $("#" + props.id).modal("show");
      //             $("#" + "ConfirmSAChangesModel").modal("hide");
      //             setOpenSuccessModal(true);
      //             props.setIsAddUpdateActionDone(true);
      //             setLoader(false);
      //             navigate("/templates", { state: "Header and Footer" });
      //           } else {
      //             $("#" + "ConfirmSAChangesModel").modal("hide");
      //             setOpenSuccessModal(true);
      //             setLoader(false);
      //             props.setIsAddUpdateActionDone(true);
      //             navigate("/templates", { state: "Header and Footer" });
      //           }
      //         } else {
      //           setErrorMessage(uploadResponse?.response?.data?.errorMessage);
      //           setLoader(false);
      //         }
      //       } else {
      //         $("#" + props.id).modal("show");
      //         $("#" + "ConfirmSAChangesModel").modal("hide");
      //         setOpenSuccessModal(true);
      //         props.setIsAddUpdateActionDone(true);
      //         setLoader(false);
      //         navigate("/templates", { state: "Header and Footer" });
      //       }
      //     } else {
      //       setErrorMessage(response?.response?.data?.errorMessage);
      //       setLoader(false);
      //     }
      //   }
      // } else if (
      //   apiRequestParams.templateTypeID === 4 ||
      //   apiRequestParams.templateTypeID === "4"
      // ) {
      //   const response = await AddUpdateTermAndCondition(url, apiRequestParams);
      //   if (response) {
      //     if (response?.data?.statusCode === 200) {
      //       if (apiRequestParams.hfTemplateID === null) {
      //         // toast.success("Added Successfully.");
      //         $("#" + props.id).modal("show");
      //         setOpenSuccessModal(true);
      //         props.setIsAddUpdateActionDone(true);
      //         setLoader(false);
      //         navigate("/terms-and-conditions");
      //       } else {
      //         // toast.success("Updated Successfully.");
      //         setOpenSuccessModal(true);
      //         props.setIsAddUpdateActionDone(true);
      //       }
      //     } else {
      //       setLoader(false);
      //       setErrorMessage(response?.response?.data?.errorMessage);
      //     }
      //   }
      // }
      const response = await AddUpdateTemplateHeaderFooter(apiRequestParams);
      if(response?.data?.statusCode == 200) {
        if(apiRequestParams.templateTypeID === 42) {
        const ModuleKeyID = response.data.responseData.data;
        const formDataForHeader = new FormData();
        const isBinaryForHeader = selectedHeaderFile.fileName instanceof Blob || selectedHeaderFile.fileName instanceof File;
        if(isBinaryForHeader) {
          formDataForHeader.set("file",selectedHeaderFile.fileName);
          const uploadHeaderFile = await AddUpdateTemplateHeaderPdf(
            selectedHeaderFile.size,
            ModuleKeyID,
            formDataForHeader
          )
          if(uploadHeaderFile) {
            $("#" + props.id).modal("show");
            setOpenSuccessModal(true);
          }
        }
          const formDataForFooter = new FormData();
          const isBinaryForFooter = setSelectedFooterFile.fileName instanceof Blob || selectedFooterFile.fileName instanceof File;
          if(isBinaryForFooter) {
            formDataForFooter.set("file",selectedFooterFile.fileName);
            const uploadFooterFile = await AddUpdateTemplateFooterPdf(
              selectedFooterFile.size,
              ModuleKeyID,
              formDataForFooter
            )
            if(uploadFooterFile) {
              $("#" + props.id).modal("show");
              setOpenSuccessModal(true);
            }
          }
      } else {
        setOpenSuccessModal(true);
        setLoader(false);
      }
        console.log("Success");
        setOpenSuccessModal(true);
        setLoader(false);
        // navigate("/templates", {state : "Header and Footer"});
        return;
      }
      else {
        setOpenErrorModal(true);
        setErrorMessage(response?.response?.data?.errorMessage);
        setLoader(false);
      }
    } catch (error) {
      setLoader(false);
      console.error(error);
    }
  };

  // handle function
  const handleHeaderImgDelete = () => {
    setTemplateObj({
      ...TemplateObj,
      headerImage: null,
    });
    setSelectedHeaderFile({
      fileName: null,
      size: null,
    });
  };
  const handleFooterImgDelete = () => {
    setTemplateObj({
      ...TemplateObj,
      footerImage: null,
    });
    setSelectedFooterFile({
      fileName: null,
      size: null,
    });
  };

  // handle function
  const handleSubmit = () => {
    setTopbar("block");
    navigate("/templates", { state: "Header and Footer" });
    SetInitialModelData();
  };

  const handleHeaderFileUpload = (e) => {
    e.preventDefault();
    setErrorMessage(""); // Clear any existing error message
    const file = e.target.files[0];
    setRequireErrorMessage(false);
    // Check if a file is selected
    if (file) {
      console.log(file.name);
      // Check if the file size exceeds the limit (2MB)
      if (file.size > 2 * 1024 * 1024) {
        setErrorMessage("File size must be less than 2MB.");
        return; 
      }// Return without setting the pdfUrl stateImage
      // File size is within the limit, create a URL for the file
      const url = URL.createObjectURL(file);
      setImageUrlHeader(url);
      console.log(url);
      // Update the selectedFile state
      setSelectedHeaderFile({
        fileName: file,
        size: file.size,
      });
    }
  };

  const handleFooterFileUpload = (e) => {
    e.preventDefault();
    setErrorMessage(""); // Clear any existing error message
    const file = e.target.files[0];
    setRequireErrorMessage(false);
    // Check if a file is selected
    if (file) {
      // Check if the file size exceeds the limit (2MB)
      if (file.size > 2 * 1024 * 1024) {
        setErrorMessage("File size must be less than 2MB.");
        return; // Return without setting the pdfUrl state
      }

      // File size is within the limit, create a URL for the file
      const url = URL.createObjectURL(file);
      setImageUrlFooter(url);
      
      // Update the selectedFile state
      setSelectedFooterFile({
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
        status: 1,
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
  
  const htmlHasWhitespace = (htmlContent) => {
    // Strip HTML tags and check if there is any visible whitespace
    const textContent = htmlContent.replace(/<[^>]+>/g, "").trim(); // Remove HTML tags and trim spaces
  
    return textContent.length > 0; // Returns true if there's visible whitespace or text
  };

  const handleContentForHeader = (newEditorState) => {
    const trimmedContent = HtmlToPlainText(newEditorState,moduleName);
    const hasWhitespace = htmlHasWhitespace(newEditorState);
    if(trimmedContent.trim().length > 0) {
      setTemplateObj({
        ...TemplateObj,
        templateContentForHeader : newEditorState
      })
    } else if (hasWhitespace) {
      setTemplateObj({
        ...TemplateObj,
        templateContentForHeader: " ", // Whitespace is valid
      });
    }
    else {
      setTemplateObj({
        ...TemplateObj,
        templateContentForHeader: null
      })
    }
  }
  const handleContentForFooter = (newEditorState) => {
    const trimmedContent = HtmlToPlainText(newEditorState,moduleName);
    const hasWhitespace = htmlHasWhitespace(newEditorState);
    if(trimmedContent.trim().length > 0) {
      setTemplateObj({
        ...TemplateObj,
        templateContentForFooter : newEditorState
      })
    }  else if (hasWhitespace) {
      setTemplateObj({
        ...TemplateObj,
        templateContentForFooter: " ", // Whitespace is valid
      });
    }
    else {
      setTemplateObj({
        ...TemplateObj,
        templateContentForFooter: null
      })
    }
  }
//   const templateTypeFilter = TemplateTypeLookupList?.filter(
//     (template) => template.value !== 3
//   );

  // const orgBusinessTypeFilter = BusinessTypeLookupList?.filter(
  //   (businessType) => businessType.value == TemplateObj.orgBusinessTypeID
  // );

  const professionTypeInputValue = professionTypeLookupList.filter(
    (item) => common.professionTypeLists[0] === item.professionTypeId
  );


  // const handleConfirmButton = () => {
  //   $("#" + "ConfirmSAChangesModel").modal("hide");
  //   if (Status) {
  //     TemplateAddUpdateBtnClicked(true)
  //   } else {
  //     DeclineSuperAdminChangesData()
  //   }
  // }

  return (
    <div className="container-fluid new-item-page-container rt-form thf-form">
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
                    <i className="ri-file-list-3-line"></i>
                  </span>
                  <div>
                    <h4 className="rt-card__title">Template Details</h4>
                    <p className="rt-card__desc">
                      Which templates this header/footer applies to, its name and type.
                    </p>
                  </div>
                </div>
                <div className="rt-fields">
                <>
                  {(common.professionTypeLists?.length > 1 ||
                    common.organisationKeyID === null) && (
                      <>
                        <div className="row fieldset" id="ProfessionTypeDiv">
                          <div className="col-lg-3 template-label text-left">
                            <div className="mb-1">
                              <label className="form-label">
                                Profession Type
                                <span className="text-danger">*</span>
                              </label>
                            </div>
                          </div>
                          <div className="col-lg-9 mb-1">
                            <div className="input-group">
                              {common.professionTypeLists?.length > 1 ||
                                common.organisationKeyID === null ? (
                                <Select
                                  classNamePrefix="app-select"
                                  isMulti
                                  style={{ padding: "5px" }}
                                  className="user-role-select"
                                  options={ProfessionalTypeLookeupListOptions}
                                  value={professionTypeValue}
                                  onChange={OnChangeSelectProfessionType}
                                />
                              ) : (
                                ""
                                // <input
                                //   disabled
                                //   style={{ padding: "5px" }}
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
                  <div className="row fieldset" id="AppliesToDiv">
                    {/* <SAPredefinedChangesNotifyMessageModel Params={{ moduleName: moduleName, SAChanges: location.state?.Type }} /> */}
                    {common.organisationKeyID !== null && (
                        <>
                          <div className="col-lg-3 template-label text-left">
                            <div className="mb-1">
                              <label htmlFor="useremail" className="form-label">
                                Applies To
                                <span className="text-danger">*</span>
                              </label>
                            </div>
                          </div>
                          <div className="col-lg-9">
                            <div className="">
                              <div className="input-group user-role-select">
                                {common.organisationKeyID !== null ? (
                                    <Select
                                    classNamePrefix="app-select"
                                    isMulti
                                    className="user-role-select"
                                    options={[allOption, ...TemplateList]}
                                    // value={TemplateList.find((option) => option.value === templateKeyID)}
                                    value = {TemplateListValue}
                                    onChange={handleTemplateChange}
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
                              {(requireErrorMessage &&
                                TemplateObj.templateList === null) && (
                                <label className="validation">
                                  {ERROR_MESSAGES}
                                </label>
                              ) || ""
                              }
                            </div>
                          </div>
                        </>
                      )}
                  </div>
                </>

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
                          classNamePrefix="app-select"
                          className="user-role-select"
                          options={TemplateTypeLookupList}
                          value={TemplateTypeLookupList.find((t) => t.value === TemplateObj.templateTypeID) || null}
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
                </div>
                </div>
                <div className="rt-card">
                <div className="rt-card__head">
                  <span className="rt-card__icon">
                    <i className="ri-ruler-line"></i>
                  </span>
                  <div>
                    <h4 className="rt-card__title">Size &amp; Lines</h4>
                    <p className="rt-card__desc">
                      Height of the header and footer areas, and separator lines.
                    </p>
                  </div>
                </div>
                <div className="rt-fields thf-layout">
                <div className="row fieldset" id="TemplateNameDiv">
                  <div className="col-lg-3 template-label text-left">
                    <div className="mb-1">
                      <label className="form-label">
                        Header Height
                      </label>
                    </div>
                  </div>
                  <div className="col-lg-9">
                    <div className="">
                      <div className="mb-1 input-group">
                        <Select
                        classNamePrefix="app-select"
                        className="user-role-select"
                        options={Utils.heightOptions}
                        value={Utils.heightOptions.find(option => option.value === TemplateObj.headerHeight) || 
                          Utils.heightOptions.find(option => option.value === "100px")
                        }
                        onChange={(selectedOption) => { 
                          setTemplateObj({
                            ...TemplateObj,
                            headerHeight: selectedOption.value
                          });
                        }}
                          />
                      </div>
                      {/* {requireErrorMessage &&
                        (TemplateObj.templateName === "" ||
                          TemplateObj.templateName === undefined) ? (
                        <label className="validation">{ERROR_MESSAGES}</label>
                      ) : (
                        ""
                      )} */}
                    </div>
                  </div>
                </div>
                <div className="row fieldset" id="TemplateNameDiv">
                  <div className="col-lg-3 template-label text-left">
                    <div className="mb-1">
                      <label className="form-label">
                        Footer Height
                      </label>
                    </div>
                  </div>
                  <div className="col-lg-9">
                    <div className="">
                      <div className="mb-1 input-group">
                      <Select
                        classNamePrefix="app-select"
                        className="user-role-select"
                        options={Utils.heightOptions}
                        value={Utils.heightOptions.find(option => option.value === TemplateObj.footerHeight) || 
                          Utils.heightOptions.find(option => option.value === "50px")
                        }
                        onChange={(selectedOption) => { 
                          setTemplateObj({
                            ...TemplateObj,
                            footerHeight: selectedOption.value
                          });
                        }}
                          />
                      </div>
                      {/* {requireErrorMessage &&
                        (TemplateObj.templateName === "" ||
                          TemplateObj.templateName === undefined) ? (
                        <label className="validation">{ERROR_MESSAGES}</label>
                      ) : (
                        ""
                      )} */}
                    </div>
                  </div>
                </div>
                <div className="row fieldset" id="separatorLine">
                  <div className="col-lg-3 template-label text-left">
                    <div className="mb-1">
                      <label className="form-label">Show Separator Lines</label>
                    </div>
                  </div>
                  <div className="col-lg-9">
                    <div className="">
                      <div className="mb-1 " style={{ marginLeft: "-10px" }}>
                        <div style={{ display: "flex", alignItems: "center" }}>
                          <Android12Switch
                            onChange={(e, checked) =>
                              setTemplateObj(prev => ({
                                ...prev,
                                showSeparatorLines: checked ? true : false
                              }))
                            }
                            checked={TemplateObj.showSeparatorLines === true}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                </div>
                </div>
                {(TemplateObj.templateTypeID === 42 ||
                  TemplateObj.templateTypeID === "42") && (
                    <div className="rt-card thf-images">
                      <div className="rt-card__head">
                        <span className="rt-card__icon">
                          <i className="ri-image-line"></i>
                        </span>
                        <div>
                          <h4 className="rt-card__title">Header &amp; Footer Images</h4>
                          <p className="rt-card__desc">
                            Upload the images shown at the top and bottom of each page.
                          </p>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-lg-3 template-label text-left">
                          <div className="mb-1">
                            <label className="form-label">
                              Header Image
                              <span className="text-danger">*</span>
                            </label>
                          </div>
                        </div>

                        <div className="col-lg-9">
                          <div className="mb-3">
                            <div>
                              <div className="col-lg-9">
                                {TemplateObj.headerImage === null ? (
                                  selectedHeaderFile.fileName && (
                                    <button
                                      onClick={handleHeaderImgDelete}
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
                                    onClick={handleHeaderImgDelete}
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
                            {TemplateObj.headerImage === null ? (
                              <>
                                {selectedHeaderFile.fileName ? (
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
                                     <img
                                      src={imageUrlHeader}
                                      alt="Preview"
                                      style={{ width: "100%", maxHeight: "500px", objectFit: "contain" }}
                                    />
                                        {/* // <p>PDF cannot be displayed. <a href={TemplateObj.pdf}>Download</a> it instead.</p> */}
                                      
                                    </div>
                                  </>
                                ) : (
                                  <>
                                    <div className="input-group">
                                      <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                          e.preventDefault(); // Prevent the default form submission behavior
                                          handleHeaderFileUpload(e);
                                        }}
                                      />
                                    </div>
                                    <div className="text-muted helpMessage">
                                      Supported file types are .jpg, .jpeg, .png up to a file
                                      size of 2MB.
                                    </div>
                                    {requireErrorMessage &&
                                      !selectedHeaderFile.fileName &&
                                      TemplateObj.templateTypeID === 42 ? (
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
                                  <img
                                      src={TemplateObj.headerImage}
                                      alt="Preview"
                                      style={{ width: "100%", maxHeight: "500px", objectFit: "contain" }}
                                    />
                                    {/* // <p>PDF cannot be displayed. <a href={TemplateObj.pdf}>Download</a> it instead.</p> */}

                                </div>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="col-lg-3 template-label text-left">
                          <div className="mb-1">
                            <label className="form-label">
                              Footer Image
                              <span className="text-danger">*</span>
                            </label>
                          </div>
                        </div>
                        <div className="col-lg-9">
                          <div className="mb-3">
                            <div>
                              <div className="col-lg-9">
                                {TemplateObj.footerImage === null ? (
                                  selectedFooterFile.fileName && (
                                    <button
                                      onClick={handleFooterImgDelete}
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
                                    onClick={handleFooterImgDelete}
                                    style={{
                                      marginBottom: "5px",
                                      fontSize: "75%",
                                    }}
                                    className="btn btn-sm btn-danger remove-item-btn"
                                  >
                                    <i class="bi bi-trash3 margin-right"></i>{" "}
                                    Delete
                                  </button>
                                )}
                              </div>
                            </div>
                            {TemplateObj.footerImage === null ? (
                              <>
                                {selectedFooterFile.fileName ? (
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
                                      {/* <object
                                        title="PDF Viewer"
                                        data={pdfUrlFooter}
                                        width="100%"
                                        height="500px"
                                      > */}
                                      <img
                                        src={imageUrlFooter}
                                        alt="Preview"
                                        style={{ width: "100%", maxHeight: "500px", objectFit: "contain" }}
                                      />
                                        {/* // <p>PDF cannot be displayed. <a href={TemplateObj.pdf}>Download</a> it instead.</p> */}
                                    </div>
                                  </>
                                ) : (
                                  <>
                                    <div className="input-group">
                                      <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                          e.preventDefault(); // Prevent the default form submission behavior
                                          handleFooterFileUpload(e);
                                        }}
                                      />
                                    </div>
                                    <div className="text-muted helpMessage">
                                      Supported file types are .jpg, .jpeg, .png up to a file
                                      size of 2MB.
                                    </div>
                                    {requireErrorMessage &&
                                      !selectedFooterFile.fileName &&
                                      TemplateObj.templateTypeID === 42 ? (
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
                                  <img
                                      // src={imageUrlFooter}
                                      src={TemplateObj.footerImage}
                                      alt="Preview"
                                      style={{ width: "100%", maxHeight: "500px", objectFit: "contain" }}
                                    />
                                    {/* // <p>PDF cannot be displayed. <a href={TemplateObj.pdf}>Download</a> it instead.</p> */}

                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
  
                {(TemplateObj.templateTypeID === 42 ||
                  TemplateObj.templateTypeID === "42") && (
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

                {(TemplateObj.templateTypeID === 41 ||
                  TemplateObj.templateTypeID === "41") && (
                    <div className="rt-card rt-content">
                      <div className="rt-card__head">
                        <span className="rt-card__icon">
                          <i className="ri-layout-top-line"></i>
                        </span>
                        <div>
                          <h4 className="rt-card__title">Template Content For Header</h4>
                          <p className="rt-card__desc">
                            Click a variable to copy it, then paste it into the header below.
                          </p>
                        </div>
                      </div>

                      <div className="fieldset-group helper-variables-div">
                        <label className="fieldset-group-label">Variables</label>
                        <AccountantVariables
                          ModuleName="HeaderFooterTemplate"
                          ClintType={null}
                          businessTypeId={
                            common.organisationKeyID === null
                              ? TemplateObj.orgBusinessTypeID
                              : common.businessTypeID
                          }
                        />
                      </div>
                      <div id={`EditorDiv_${TemplateObj.templateContentForHeader}`}>
                        <Text_Editor
                          editorState={editorStateForHeader}
                          handleContentChange={handleContentForHeader}
                          modelAction={modelAction}
                        />
                      </div>
                    </div>
                  )} 
                {/* {requireErrorMessage &&
                  (TemplateObj.templateContentForHeader === null ||
                    TemplateObj.templateContentForHeader === "" ||
                    TemplateObj.templateContentForHeader === undefined ||
                    TemplateObj.templateContentForHeader === "<p></p>\n" ||
                    TemplateObj.templateContentForHeader === "<p></p>" ||
                    TemplateObj.templateContentForHeader === "<p><br></p>") &&
                  TemplateObj.templateTypeID === 41 ? (
                  <label className="validation">{ERROR_MESSAGES}</label>
                ) : (
                  ""
                )} */}
                {requireErrorMessage && errorEditorMessage ? (
                  <label className="validation">{errorEditorMessage}</label>
                ) : (
                  ""
                )}

                {(TemplateObj.templateTypeID === 41 ||
                  TemplateObj.templateTypeID === "41") && (
                    <div className="rt-card rt-content">
                      <div className="rt-card__head">
                        <span className="rt-card__icon">
                          <i className="ri-layout-bottom-line"></i>
                        </span>
                        <div>
                          <h4 className="rt-card__title">Template Content For Footer</h4>
                          <p className="rt-card__desc">
                            Click a variable to copy it, then paste it into the footer below.
                          </p>
                        </div>
                      </div>

                      <div className="fieldset-group helper-variables-div">
                        <label className="fieldset-group-label">Variables</label>
                        <AccountantVariables
                          ModuleName="HeaderFooterTemplate"
                          ClintType={null}
                          businessTypeId={
                            common.organisationKeyID === null
                              ? TemplateObj.orgBusinessTypeID
                              : common.businessTypeID
                          }
                        />
                      </div>
                      <div id={`EditorDiv_${TemplateObj.templateContentForFooter}`}>
                        <Text_Editor
                          editorState={editorStateForFooter}
                          handleContentChange={handleContentForFooter}
                          modelAction={modelAction}
                        />
                      </div>
                    </div>
                  )}
                {/* {requireErrorMessage &&
                  (TemplateObj.templateContentForFooter === null ||
                    TemplateObj.templateContentForFooter === "" ||
                    TemplateObj.templateContentForFooter === undefined ||
                    TemplateObj.templateContentForFooter === "<p></p>\n" ||
                    TemplateObj.templateContentForFooter === "<p></p>" ||
                    TemplateObj.templateContentForFooter === "<p><br></p>") &&
                  TemplateObj.templateTypeID === 41 ? (
                  <label className="validation">{ERROR_MESSAGES}</label>
                ) : (
                  ""
                )} */}
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
                {/* {location.state?.Type ? (<>
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
                } */}
                <>
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
                </>
              </Col>
            </Row>
            {/* <!-- end tab content --> */}
          </div>
          {/* <!-- end card body --> */}
        </div>
        {/* <!-- end card --> */}
      </div>
      <SuccessModal
        keepPopup
        handleClose={handleClose}
        setDismissModal={setDismissModal}
        setIsCheck={setIsCheck}
        isCheck={isCheck}
        setOpenSuccessModal={setOpenSuccessModal}
        openSuccessModal={openSuccessModal}
        modelAction={modelAction}
        message={moduleName + " " + TemplateObj.templateName}
      />
      <ErrorModel
        ErrorModel={openErrorModal}
        handleClose={handleClose}
        ErrorMessage={errorMessage}
      />
      {/* <AcceptSuperAdminChangesConfirmation
        openErrorModal={openErrorModal}
        ModelId={props.id}
        Status={Status}
        openSuccessModal={openSuccessModal}
        modelRequestData={location.state}
        UpdatedChanges={handleConfirmButton}
      /> */}
    </div>
  );
}

export default Add_New_Header_And_Footer;
