/* global $ */
import React, { useContext, useEffect, useRef, useState } from "react";
import "./template.css";
import { Row, Col, Card, Alert } from "reactstrap";
import Select from "react-select";
import { AuthContextProvider } from "../../../AuthContext/AuthContext";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Tooltip, { tooltipClasses } from "@mui/material/Tooltip";
import Android12Switch from "../../../components/AndroidSwitch";
import { styled } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import IndividualVariable from "../../../components/Variables/IndividualVariables";
import SoleTraderVariable from "../../../components/Variables/SoleTraderVariable";
import PartnershipVariable from "../../../components/Variables/PartnershipVariables";
import LlpAndCompanyVariable from "../../../components/Variables/LlpAndCompanyVariables";
import Heading from "../../../components/TemplateDesign/Heading";
import TextBlock from "../../../components/TemplateDesign/Text_Block";
import First_Page from "../../../components/TemplateDesign/First_Page";
import { useLocation } from "react-router-dom";
import FullPage from "../../../components/TemplateDesign/Full_Page_Heading";
import { GetProfessionTypeLookupList } from "../../../redux/Services/Master/ProfessionTypeApi";
import {
  GetBusinessTypeLookupList,
  GetProspectTypeVariationLookupList,
} from "../../../redux/Services/Master/BusinessTypeLookupListApi";
import { GetTemplateTypeList } from "../../../redux/Services/Master/TemplateTypeLookupListApi";
import { GetTemplateElementTypeLookUpList } from "../../../redux/Services/Master/TemplateElementType";
import {
  CLIENT_TYPES,
  fieldToIdMap,
  Template_Type,
  USER_ROLE_TYPE,
} from "../../../Middleware/enums";
import AcceptSuperAdminChangesConfirmation from "../../../components/AcceptSuperAdminChangesConfirmation";
import {
  GetTemplateModel,
  AddUpdateTemplate,
  GetTemplatePdfList,
  GetTemplateLookupPDFList,
  GetFontFamilyList,
  AddUpdateTemplateWatermark,
} from "../../../redux/Services/Config/TemplateApi";
import { useDispatch, useSelector } from "react-redux";

import SuccessModal from "../../../components/SuccessModal";
import { ERROR_MESSAGES } from "../../../components/GlobalMessage";
import Utils from "../../../Middleware/Utils";
import CopyToClipboard from "../../../components/CopyToClipboard/CopyToClipboard";
import BackButtonSvg from "../../../components/BackButtonSvg";
import { NotifySuperAdminPredefinedChangesToAdmin } from "../../../redux/Services/Setting/NotificationApi";
import { DeclineSuperAdminChanges } from "../../../redux/Services/Config/ServiceCategoryApi";
import ErrorModel from "../../../components/ErrorModel";
import { LocalizationProvider } from "@mui/x-date-pickers";
import SAPredefinedChangesNotifyMessageModel from "../../../components/SAPredefinedChangesNotifyMessageModel";
import CommonProspectVariable from "../../../components/Variables/CommonProspectVariable";
import FileTablePreview from "../../../components/FileTablePreview";

function Add_New_Templates(props) {
  //Declare State:
  const moduleName = "Template";
  const {
    setTopbar,
    prospectName,
    setLoader,
    proposalName,
    EngagementName,
    getCrudButtonTextName,
    getCrudPopUpTitleName,
    scrollUpDownByElementID,
    scrollUptoCurrentPosition,
    HtmlToPlainText,
    hasActionAccess,
  } = useContext(AuthContextProvider);
  const navigate = useNavigate();
  const TemplateDivContainerRef = useRef(null);
  const common = useSelector((state) => state.Storage); //Getting Logged Users Details From Persist Storage of redux hooks
  const location = useLocation();
  const [templateElementList, setTemplateElementList] = useState([]);

  const [TemplatePdfLookupListList, setTemplatePdfLookupListList] = useState(
    [],
  );
  const [modelRequestData, setModelRequestData] = useState({
    Action: null,
    message: "",
    ServiceName: [],
    name: null,
  });
  const [openErrorModal, setOpenErrorModal] = React.useState(false);
  const [professionTypeLookupList, setProfessionTypeLookupList] = useState([]);
  const [fontFamilyList, setFontFamilyList] = useState([]);
  const [BusinessTypeLookupList, setBusinessTypeLookupList] = useState([]);
  const [ProspectTypeVariation, setProspectTypeVariationLookupList] = useState(
    [],
  );
  const [TemplateTypeLookupList, setTemplateTypeLookupList] = useState([]);
  // const [orientationID,setOrientationID] = useState(1);
  const [templatePdfList, setTemplatePdfList] = useState([]);
  const [TemplateElementTypeLookupList, setTemplateElementTypeLookupList] =
    useState([]);
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [selectedPdfDetails, setSelectedPdfDetails] = useState([]);
  const [selectedFile, setSelectedFile] = useState({
    fileName: null,
    size: null,
  });
  const [modelAction, setModelAction] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [FirstPageHeading, setFirstPageHeading] = useState(1);
  const [requireTempErrorMessage, setRequireTempErrorMessage] = useState(false);
  const [requireErrorMessage, setRequireErrorMessage] = useState(false);
  const [requireElementTypeErrorMessage, setRequireElementTypeErrorMessage] =
    useState({
      templateElementTypeIDRequire: false,
      headings: false,
      shortDesc: false,
      htmlContent: false,
      RequireSignataryBlock: false,
      RequireFirstPageBlock: false,
    });

  const [
    requireElementLengthErrorMessage,
    setRequireElementLengthErrorMessage,
  ] = useState(false);
  const [TemplateObj, setTemplateObj] = useState({
    templateKeyID: null,
    enableFirstPage: false,
    headerFooterFirstPage: true,
    organisationID: null,
    originalBusinessTypeID: [],
    originalBusinessTypeIDs: [],
    createdByID: null,
    isDefault: false,
    templateName: undefined,
    templateTypeID: null,
    clientBusinessTypeID: null,
    clientBusinessTypeIDs: [],
    orgBusinessTypeID: common.businessTypeID,
    isPredefined: null,
    fontFamilyID: null,
    watermarkImage: null,
    orientationID: 1,
    professionTypeList: [],
    pricingTableColumnIDs: null,
    // Service description main heading
    serviceDescriptionMainHeading: "Service Description",
    serviceDescriptionMainHeadingFontSize: null,
    serviceDescriptionMainHeadingFontWeight: null,
    serviceDescriptionMainHeadingFontItalic: null,
    // Service description Recurring/On-going Heading
    serviceDescriptionRecurringHeading: "Ongoing/Recurring Services",
    serviceDescriptionRecurringHeadingFontSize: null,
    serviceDescriptionRecurringHeadingFontWeight: null,
    serviceDescriptionRecurringHeadingFontItalic: null,
    // Service description One-Off/Ad hoc Heading
    serviceDescriptionOneOffHeading: "One-Off/Ad hoc Services",
    serviceDescriptionOneOffHeadingFontSize: null,
    serviceDescriptionOneOffHeadingFontWeight: null,
    serviceDescriptionOneOffHeadingFontItalic: null,
    // Service description Service Category Heading
    serviceDescriptionServiceCatHeading: "",
    serviceDescriptionServiceCatHeadingFontSize: null,
    serviceDescriptionServiceCatHeadingFontWeight: null,
    serviceDescriptionServiceCatHeadingFontItalic: null,
    // Statement Of Facts main heading
    statementOfFactsMainHeading: "Statement Of Facts",
    statementOfFactsMainHeadingFontSize: null,
    statementOfFactsMainHeadingFontWeight: null,
    statementOfFactsMainHeadingFontItalic: null,
    // Statement Of Facts Recurring/On-going Heading
    statementOfFactsRecurringHeading: "Ongoing/Recurring Services",
    statementOfFactsRecurringHeadingFontSize: null,
    statementOfFactsRecurringHeadingFontWeight: null,
    statementOfFactsRecurringHeadingFontItalic: null,
    // Statement Of Facts One-Off/Ad hoc Heading
    statementOfFactsOneOffHeading: "One-Off/Ad hoc Services",
    statementOfFactsOneOffHeadingFontSize: null,
    statementOfFactsOneOffHeadingFontWeight: null,
    statementOfFactsOneOffHeadingFontItalic: null,
  });
  const [dismissModal, setDismissModal] = useState(null);
  const [isCheck, setIsCheck] = useState(false);
  const [openSuccessModal, setOpenSuccessModal] = React.useState(false);
  const [Status, setStatus] = React.useState(false);
  const organisationList = JSON.parse(
    localStorage.getItem("OrganisationLocalList") || "[]",
  );

  const storedOrg = organisationList.find(
    (item) => item.organisationKeyID === common.organisationKeyID,
  );
  // Remember, here the opposite sign is used for the vatStatus because, in the backend they have stored opposite. If the org is vat reg th en they have stored false else true.

  const isVatEnabledForOrg =
    storedOrg?.isVatRegistered === true ? false : true || false;
  const [visibleFieldsCustomTemp, setVisibleFieldsCustomTemp] = useState({
    serviceCategory: true,
    serviceName: true,
    vatRate: isVatEnabledForOrg,
    vat: isVatEnabledForOrg,
    fees: true,
    serviceScope: true,
    feesIncVat: isVatEnabledForOrg,
  });

  const VAT_FIELD_KEYS = ["vatRate", "vat", "feesIncVat"];

  const getVisibleFieldIds = () => {
    const selectedIds = Object.entries(visibleFieldsCustomTemp)
      .filter(([key, value]) => {
        if (value !== true) {
          return false;
        }

        // Never send VAT-related column IDs for non-VAT organisations.
        if (!isVatEnabledForOrg && VAT_FIELD_KEYS.includes(key)) {
          return false;
        }

        return true;
      })
      .map(([key]) => fieldToIdMap[key])
      .filter((id) => id !== undefined && id !== null);

    return selectedIds.join(",");
  };

  useEffect(() => {
    if (!isVatEnabledForOrg) {
      setVisibleFieldsCustomTemp((prev) => ({
        ...prev,
        vatRate: false,
        vat: false,
        feesIncVat: false,
      }));
    }
  }, [isVatEnabledForOrg]);

  useEffect(() => {
    const updateVisibleFieldsFromIds = (pricingTableColumnIDs) => {
      if (
        typeof pricingTableColumnIDs !== "string" ||
        pricingTableColumnIDs.trim() === ""
      ) {
        setVisibleFieldsCustomTemp({
          serviceCategory: true,
          serviceName: true,
          serviceScope: true,
          fees: true,

          // VAT fields depend on organisation VAT registration.
          vatRate: isVatEnabledForOrg,
          vat: isVatEnabledForOrg,
          feesIncVat: isVatEnabledForOrg,
        });

        return;
      }

      const idsFromBackend = pricingTableColumnIDs
        .split(",")
        .map((id) => Number(id.trim()))
        .filter((id) => !Number.isNaN(id));

      const updatedFields = Object.fromEntries(
        Object.entries(fieldToIdMap).map(([key, id]) => {
          if (!isVatEnabledForOrg && VAT_FIELD_KEYS.includes(key)) {
            return [key, false];
          }

          return [key, idsFromBackend.includes(id)];
        }),
      );

      setVisibleFieldsCustomTemp(updatedFields);
    };

    updateVisibleFieldsFromIds(TemplateObj.pricingTableColumnIDs);
  }, [TemplateObj.pricingTableColumnIDs, isVatEnabledForOrg]);
  // console.log("getVisibleFieldIds", getVisibleFieldIds());
  // console.log("visibleFieldsCustomTemp", visibleFieldsCustomTemp);
  const [selectedTemplateType, setSelectedTemplateType] = useState(0);
  const vatPercentage = true;
  // console.log("selectedTemplateType", selectedTemplateType);
  // A]  useEffect : Will call when Add/Update button click from list page
  useEffect(() => {
    setModelAction(
      location?.state?.Action === undefined || location?.state?.Action === null
        ? "Add"
        : "Update",
    ); //Do not change this naming convention
    GetProfessionTypeLookupListData();
    GetBusinessTypeLookupListData();
    GetProspectTypeVariationLookupListData();
    GetTemplateTypeLookupListData();
    // GetFontFamilyListData();
    GetTemplateElementTypeLookUpListData();
    setTopbar("none");
    if (location.state?.templateKeyID !== null) {
      GetTemplateModalData(location.state?.templateKeyID, location.state?.Type);
      setModelRequestData({
        ...modelRequestData,
        Action: "update",
      });
    }
  }, [location.state]);
  useEffect(() => {
    if (modelAction === "Update") {
      GetTemplateLookupPdfListData();
    }
  }, [modelAction]);
  const SetInitialModelData = () => {
    setTemplateObj({
      templateKeyID: null,
      organisationID: null,
      enableFirstPage: false,
      headerFooterFirstPage: true,
      watermarkImage: null,
      orientationID: 1,
      createdByID: null,
      templateName: undefined,
      templateTypeID: null,
      clientBusinessTypeID: null,
      clientBusinessTypeIDs: null,
      orgBusinessTypeID: null,
      isPredefined: null,
      fontFamilyID: null,
      professionTypeList: [],
      // Service description main heading
      serviceDescriptionMainHeading: "Service Description",
      serviceDescriptionMainHeadingFontSize: null,
      serviceDescriptionMainHeadingFontWeight: null,
      serviceDescriptionMainHeadingFontItalic: null,
      // Service description Recurring/On-going Heading
      serviceDescriptionRecurringHeading: "Ongoing/Recurring Services",
      serviceDescriptionRecurringHeadingFontSize: null,
      serviceDescriptionRecurringHeadingFontWeight: null,
      serviceDescriptionRecurringHeadingFontItalic: null,
      // Service description One-Off/Ad hoc Heading
      serviceDescriptionOneOffHeading: "One-Off/Ad hoc Services",
      serviceDescriptionOneOffHeadingFontSize: null,
      serviceDescriptionOneOffHeadingFontWeight: null,
      serviceDescriptionOneOffHeadingFontItalic: null,
      // Service description Service Category Heading
      serviceDescriptionServiceCatHeading: "",
      serviceDescriptionServiceCatHeadingFontSize: null,
      serviceDescriptionServiceCatHeadingFontWeight: null,
      serviceDescriptionServiceCatHeadingFontItalic: null,
      // Statement Of Facts main heading
      statementOfFactsMainHeading: "Statement Of Facts",
      statementOfFactsMainHeadingFontSize: null,
      statementOfFactsMainHeadingFontWeight: null,
      statementOfFactsMainHeadingFontItalic: null,
      // Statement Of Facts Recurring/On-going Heading
      statementOfFactsRecurringHeading: "Ongoing/Recurring Services",
      statementOfFactsRecurringHeadingFontSize: null,
      statementOfFactsRecurringHeadingFontWeight: null,
      statementOfFactsRecurringHeadingFontItalic: null,
      // Statement Of Facts One-Off/Ad hoc Heading
      statementOfFactsOneOffHeading: "One-Off/Ad hoc Services",
      statementOfFactsOneOffHeadingFontSize: null,
      statementOfFactsOneOffHeadingFontWeight: null,
      statementOfFactsOneOffHeadingFontItalic: null,
    });

    setErrorMessage("");
  };

  // Get Font Family List
  // const GetFontFamilyListData = async () => {
  //   try {
  //     const data = await GetFontFamilyList(common.organisationKeyID, common.userKeyID);
  //     if (data?.data?.statusCode === 200) {
  //       if (data?.data?.responseData?.data) {
  //         const FontFamilyList = data?.data?.responseData?.data;
  //         setFontFamilyList(FontFamilyList);
  //       }
  //     }
  //   } catch (error) {
  //     console.error(error);
  //   }
  // }
  const FontFamilyLookupList = Utils.FontFamily.map((font) => ({
    value: font.value,
    label: font.label,
  }));
  const FontFamilyValue = FontFamilyLookupList?.find(
    (font) => font.value === TemplateObj.fontFamilyID || null,
  );
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
    }),
  );
  const professionTypeValue = TemplateObj?.professionTypeList?.map((item) => ({
    value: item.professionTypeId,
    label: item.professionTypeName,
  }));
  // Handle Compare And Set Pdf
  const handleCompareAndSetPdf = () => {
    templateElementList.forEach((element) => {
      if (element.templateElementTypeID === 9) {
        const foundPdf = TemplatePdfLookupListList.find(
          (pdf) => pdf.templatePDFKeyID === element.headings,
        );
        if (foundPdf) {
          setSelectedPdf({
            value: foundPdf.templatePDFKeyID,
            label: foundPdf.templatePDFTitle,
          });
        }
      }
    });
  };

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
    handleCompareAndSetPdf(); // Call the function to set the initial selected PDF
  }, []);

  // Call the function whenever templateElementList or TemplatePdfLookupListList changes
  useEffect(() => {
    handleCompareAndSetPdf();
  }, [templateElementList, TemplatePdfLookupListList]);

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
  // Get Prospect Type variation Lookup list data
  const GetProspectTypeVariationLookupListData = async () => {
    try {
      const data = await GetProspectTypeVariationLookupList(
        common.organisationKeyID,
        common.userKeyID,
      );
      if (data?.data?.statusCode === 200) {
        if (data?.data?.responseData?.data) {
          let BusinessTypeListData = data?.data?.responseData?.data;

          BusinessTypeListData = BusinessTypeListData.map((BusinessType) => ({
            originalBusinessTypeID: BusinessType.originalBusinessTypeID,
            value: BusinessType.businessTypeID,
            label: BusinessType.businessTypeName,
          }));
          setProspectTypeVariationLookupList(BusinessTypeListData);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  //3) TemplateType Lookup List Api
  const GetTemplateTypeLookupListData = () => {
    let templateTypeListsData = [
      { templateTypeID: 1, templateTypeName: `${proposalName}` },
      { templateTypeID: 2, templateTypeName: `${EngagementName}` },
    ];

    const transformedData = templateTypeListsData.map((templateType) => ({
      value: templateType.templateTypeID,
      label: templateType.templateTypeName,
    }));

    setTemplateTypeLookupList(transformedData);
  };
  // const GetTemplateTypeLookupListData = async () => {
  //   try {
  //     const data = await GetTemplateTypeList(1);

  //     if (data?.data?.statusCode === 200 && data?.data?.responseData?.data) {
  //       let templateTypeListData = data.data.responseData.data;

  //       let templateTypeListsData = templateTypeListData.map(item => {
  //         if (item.templateTypeName === "Quote") {
  //           return { ...item, templateTypeName: `${proposalName}` };
  //         } else if (item.templateTypeName === "Contract") {
  //           return { ...item, templateTypeName: `${EngagementName}` };
  //         } else {
  //           return item;
  //         }
  //       });

  //       // Uncomment the line below to log or inspect the transformed data
  //       alert(JSON.stringify(templateTypeListsData));

  //       const transformedData = templateTypeListsData.map(templateType => ({
  //         value: templateType.templateTypeID,
  //         label: templateType.templateTypeName
  //       }));

  //       setTemplateTypeLookupList(transformedData);
  //     }
  //   } catch (error) {
  //     console.error(error);
  //   }
  // };
  //3) TemplateElementType Lookup List Api
  const GetTemplateElementTypeLookUpListData = async () => {
    try {
      const data = await GetTemplateElementTypeLookUpList();
      if (data?.data?.statusCode === 200) {
        if (data?.data?.responseData?.data) {
          const TemplateElementTypeListData = data?.data?.responseData?.data;
          setTemplateElementTypeLookupList(TemplateElementTypeListData);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  // handle Upload file
  const handleFileUpload = (e) => {
    e.preventDefault();
    setErrorMessage(""); // Clear any existing error message
    setRequireErrorMessage(false);

    const file = e.target.files[0];

    if (file) {
      // Validate file extension
      const fileNameParts = file.name.split(".");
      const fileExtension =
        fileNameParts[fileNameParts.length - 1].toLowerCase();
      const allowedExtensions = ["jpg", "jpeg", "png"];

      if (!allowedExtensions.includes(fileExtension)) {
        setErrorMessage(
          "Invalid file type. Only JPG, JPEG, and PNG files are allowed.",
        );
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setErrorMessage("File size must be less than 10MB.");
        return;
      }

      // File is valid
      setSelectedFile({
        fileName: file,
        size: file.size,
      });
    }
  };

  const handleWatermarkImageDelete = () => {
    setTemplateObj({
      ...TemplateObj,
      watermarkImage: null,
    });
    setSelectedFile({
      fileName: null,
      size: null,
    });
  };

  const TemplateElementLookeupListOptions = TemplateElementTypeLookupList.map(
    (templateElementType) => {
      if (TemplateObj.templateTypeID === 1) {
        // If templateTypeID is 2, you can conditionally hide elements here
        if (templateElementType.templateElementTypeID === 7) {
          // Exclude Signature Block (Only for Contract) element
          return null;
        }
      }
      let label = templateElementType.templateElementTypeName;
      // Replace "Contract" with "EL" in the label
      if (label.includes("Contract")) {
        label = label.replace("Contract", EngagementName);
      }
      if (label.includes("Quote")) {
        label = label.replace("Quote", proposalName);
      }
      return {
        value: templateElementType.templateElementTypeID,
        label: label,
      };
    },
  ).filter(Boolean);

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
  const GetTemplateModalData = async (id, GetSAChanges) => {
    if (!id) {
      return;
    }
    try {
      setLoader(true);
      const data = await GetTemplateModel(id, GetSAChanges);
      if (data?.data?.statusCode === 200) {
        if (data?.data?.responseData?.data) {
          const ModelData = data?.data?.responseData?.data;
          setTemplateObj({
            ...TemplateObj,
            templateKeyID: ModelData.templateKeyID,
            enableFirstPage: ModelData.enableFirstPage,
            headerFooterFirstPage: ModelData.headerFooterFirstPage,
            organisationID: ModelData.organisationID,
            createdByID: ModelData.createdByID,
            templateName: ModelData.templateName,
            isDefault: ModelData.isDefault,
            templateTypeID: ModelData.templateTypeID,
            clientBusinessTypeID: ModelData.clientBusinessTypeID,
            clientBusinessTypeIDs: ModelData.clientBusinessTypeIDs,
            orgBusinessTypeID: ModelData.orgBusinessTypeID,
            isPredefined: ModelData.isPredefined,
            fontFamilyID: ModelData.fontFamilyID,
            watermarkImage: ModelData.watermarkImage,
            orientationID: ModelData.orientationID,
            professionTypeList: ModelData.professionTypeList,
            originalBusinessTypeID: ModelData.originalBusinessTypeID,
            originalBusinessTypeIDs: ModelData.originalBusinessTypeIDs,
            // pricingTableColumnIDs: ModelData.pricingTableColumnIDs,
          });
          setTemplateElementList(
            ...templateElementList,
            ModelData.templateElementList,
          );
          const pricingTableCustomIDList = ModelData.templateElementList.filter(
            (item) => item.templateElementTypeID === 3,
          );

          const serviceDescriptionObj = ModelData.templateElementList.filter(
            (item) => item.templateElementTypeID === 4,
          );

          const statementOfFactsObj = ModelData.templateElementList.filter(
            (item) => item.templateElementTypeID === 8,
          );

          setTemplateObj((prev) => ({
            ...prev,
            pricingTableColumnIDs:
              pricingTableCustomIDList[0]?.pricingTableColumnIDs,
          }));

          setTemplateObj((prev) => ({
            ...prev,
            serviceDescriptionMainHeading:
              serviceDescriptionObj[0]?.mainHeading,
            serviceDescriptionRecurringHeading:
              serviceDescriptionObj[0]?.recurringOnGoingHeading,
            serviceDescriptionOneOffHeading:
              serviceDescriptionObj[0]?.oneOffAdhocHeading,
            serviceDescriptionMainHeadingFontSize: Number(
              serviceDescriptionObj[0]?.mainHeadingFontSize,
            ),
            serviceDescriptionRecurringHeadingFontSize: Number(
              serviceDescriptionObj[0]?.recurringOnGoingHeadingFontSize,
            ),
            serviceDescriptionOneOffHeadingFontSize: Number(
              serviceDescriptionObj[0]?.oneOffAdhocFontSize,
            ),
            serviceDescriptionMainHeadingFontWeight:
              serviceDescriptionObj[0]?.mainHeadingIsBold,
            serviceDescriptionMainHeadingFontItalic:
              serviceDescriptionObj[0]?.mainHeadingIsItalic,
            serviceDescriptionRecurringHeadingFontWeight:
              serviceDescriptionObj[0]?.recurringOnGoingHeadingIsBold,
            serviceDescriptionRecurringHeadingFontItalic:
              serviceDescriptionObj[0]?.recurringOnGoingHeadingIsItalic,
            serviceDescriptionOneOffHeadingFontWeight:
              serviceDescriptionObj[0]?.oneOffAdhocHeadingIsBold,
            serviceDescriptionOneOffHeadingFontItalic:
              serviceDescriptionObj[0]?.oneOffAdhocHeadingIsItalic,
          }));

          setTemplateObj((prev) => ({
            ...prev,
            statementOfFactsMainHeading: statementOfFactsObj[0]?.mainHeading,
            statementOfFactsRecurringHeading:
              statementOfFactsObj[0]?.recurringOnGoingHeading,
            statementOfFactsOneOffHeading:
              statementOfFactsObj[0]?.oneOffAdhocHeading,
            statementOfFactsMainHeadingFontSize: Number(
              statementOfFactsObj[0]?.mainHeadingFontSize,
            ),
            statementOfFactsRecurringHeadingFontSize: Number(
              statementOfFactsObj[0]?.recurringOnGoingHeadingFontSize,
            ),
            statementOfFactsOneOffHeadingFontSize: Number(
              statementOfFactsObj[0]?.oneOffAdhocFontSize,
            ),
            statementOfFactsMainHeadingFontWeight:
              statementOfFactsObj[0]?.mainHeadingIsBold,
            statementOfFactsMainHeadingFontItalic:
              statementOfFactsObj[0]?.mainHeadingIsItalic,
            statementOfFactsRecurringHeadingFontWeight:
              statementOfFactsObj[0]?.recurringOnGoingHeadingIsBold,
            statementOfFactsRecurringHeadingFontItalic:
              statementOfFactsObj[0]?.recurringOnGoingHeadingIsItalic,
            statementOfFactsOneOffHeadingFontWeight:
              statementOfFactsObj[0]?.oneOffAdhocHeadingIsBold,
            statementOfFactsOneOffHeadingFontItalic:
              statementOfFactsObj[0]?.oneOffAdhocHeadingIsItalic,
          }));

          if (
            pricingTableCustomIDList[0]?.pricingTableColumnIDs !== null &&
            pricingTableCustomIDList[0]?.pricingTableColumnIDs !== "" &&
            pricingTableCustomIDList[0]?.pricingTableColumnIDs !== undefined
          ) {
            setSelectedTemplateType(6);
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

  // Get Template Lookup Pdf List Data
  const GetTemplateLookupPdfListData = async () => {
    try {
      const data = await GetTemplateLookupPDFList({
        OrganisationKeyID: common.organisationKeyID,
        userKeyID: common.userKeyID,
        selectedTemplatePDFKeyIDs:
          selectedPdfDetails.length > 0 ? selectedPdfDetails : null,
      });
      if (data) {
        if (data?.data?.statusCode === 200) {
          if (data?.data?.responseData?.data) {
            const totalCount = data.data.totalCount;
            const TemplatePDFListData = data.data.responseData.data;
            const options = TemplatePDFListData.map((item) => ({
              templatePDFKeyID: item.templatePDFKeyID,
              templatePDFTitle: item.templatePDFTitle,
            }));

            setTemplatePdfLookupListList(options);
          }
        } else {
          setErrorMessage(data?.data?.errorMessage);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  // handle orientation toggle
  const handleOrientationChange = (e) => {
    setTemplateObj({ ...TemplateObj, orientationID: Number(e.target.value) });
  };

  // 2) Add Update Button Click Function
  const TemplateAddUpdateBtnClicked = (Accept) => {
    if (Accept === "Accept") {
      $("#" + "ConfirmSAChangesModel").modal("show");

      setStatus(true);
      return;
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
      // TemplateObj.clientBusinessTypeID === null ||
      // TemplateObj.clientBusinessTypeID === "" ||
      TemplateObj.clientBusinessTypeIDs.length === 0 ||
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
        // TemplateObj.clientBusinessTypeID === null ||
        // TemplateObj.clientBusinessTypeID === ""
        TemplateObj.clientBusinessTypeIDs.length === 0
      ) {
        scrollUpDownByElementID("ProspectBusinessDiv");
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
    } else if (TemplateObj.templateTypeID) {
      if (templateElementList?.length === 0) {
        scrollUpDownByElementID("AddElementDiv");
        setRequireElementLengthErrorMessage(true);
        return false;
      } else {
        let hasError = false;
        const elementTypeId = templateElementList.filter(
          (element, index) => element.templateElementTypeID === null,
        );
        const elementHeadingTypeId = templateElementList.filter((item) => {
          return item.templateElementTypeID === 1;
        });
        const elementFullPageHeadingTypeId = templateElementList.filter(
          (item) => {
            return item.templateElementTypeID === 5;
          },
        );
        const elementHtmlContentTypeId = templateElementList.filter((item) => {
          return item.templateElementTypeID === 2;
        });
        const elementHtmlContentWithFirstPageTypeId =
          templateElementList.filter((item) => {
            return item.templateElementTypeID === 10;
          });
        const elementPdfTypeId = templateElementList.filter((item) => {
          return item.templateElementTypeID === 9;
        });

        if (elementTypeId.length > 0) {
          // Iterating over the filtered elements
          elementTypeId.forEach((element, index) => {
            if (
              element.templateElementTypeID === null ||
              element.templateElementTypeID === ""
            ) {
              // If true, setting an error message in the state
              scrollUpDownByElementID(
                `ElementDiv_${element.templateElementTypeID}`,
              );
              setRequireElementTypeErrorMessage({
                ...requireElementTypeErrorMessage,
                templateElementTypeIDRequire: true,
              });
              hasError = true;
            }
          });
        }

        // Checking if there are elements that passed the filter
        if (elementHeadingTypeId.length > 0) {
          // Iterating over the filtered elements
          elementHeadingTypeId.forEach((element, index) => {
            if (element.headings === null || element.headings === "") {
              // If true, setting an error message in the state
              scrollUpDownByElementID(`HeadingDiv_${element.headings}`);
              setRequireElementTypeErrorMessage({
                ...requireElementTypeErrorMessage,
                headings: true,
              });
              hasError = true;
            }
          });
        }
        if (elementFullPageHeadingTypeId.length > 0) {
          // Iterating over the filtered elements
          elementFullPageHeadingTypeId.forEach((element, index) => {
            if (
              element.headings === null ||
              element.headings === "" ||
              element.shortDesc === null ||
              element.shortDesc === ""
            ) {
              // If true, setting an error message in the state
              if (element.headings === null || element.headings === "") {
                scrollUpDownByElementID(
                  `FullPageHeadingDiv_${element.headings}`,
                );
              } else {
                scrollUpDownByElementID(
                  `FullPageShortDescriptionDiv_${element.shortDesc}`,
                );
              }
              setRequireElementTypeErrorMessage({
                ...requireElementTypeErrorMessage,
                headings: true,
                shortDesc: true,
              });
              hasError = true;
            }
          });
        }

        if (elementHtmlContentTypeId.length > 0) {
          // Iterating over the filtered elements
          elementHtmlContentTypeId.forEach((element, index) => {
            // if (
            //   element.htmlContent === null ||
            //   element.htmlContent === "" ||
            //   element.htmlContent === undefined ||
            //   element.htmlContent === "<p></p>\n" ||
            //   element.htmlContent === "<p></p>" ||
            //   element.htmlContent === "<p><br></p>"
            // ) {
            //   scrollUpDownByElementID(`EditorDiv_${element.htmlContent}`);
            //   setRequireElementTypeErrorMessage({
            //     ...requireElementTypeErrorMessage,
            //     htmlContent: true,
            //   });
            //   hasError = true;
            // }

            if (element?.htmlContent) {
              // Remove HTML tags and style attributes using HtmlToPlainText function
              const cleanContent = HtmlToPlainText(element?.htmlContent);
              // Check if any text is present after removing tags and styles
              const textPresent = cleanContent.trim().length > 0;

              if (!textPresent) {
                setRequireElementTypeErrorMessage({
                  ...requireElementTypeErrorMessage,
                  htmlContent: true,
                });

                const updatedTemplateElementList = [...templateElementList];
                updatedTemplateElementList[index] = {
                  ...updatedTemplateElementList[index],
                  htmlContent: null,
                };

                setTemplateElementList(updatedTemplateElementList);
                hasError = true;
                scrollUpDownByElementID(`EditorDiv_${element.htmlContent}`);
                return false; // This should probably be set through state to trigger re-renders
              }
            } else {
              scrollUpDownByElementID(`EditorDiv_${element.htmlContent}`);
              setRequireElementTypeErrorMessage({
                ...requireElementTypeErrorMessage,
                htmlContent: true,
              });
              hasError = true;
            }
          });
        }

        if (elementHtmlContentWithFirstPageTypeId.length > 0) {
          // Iterating over the filtered elements
          elementHtmlContentWithFirstPageTypeId.forEach((element, index) => {
            if (
              element.htmlContent === null ||
              element.htmlContent === "" ||
              element.htmlContent === undefined ||
              element.htmlContent === "<p></p>\n" ||
              element.htmlContent === "<p></p>" ||
              element.htmlContent === "<p><br></p>"
            ) {
              scrollUpDownByElementID(`EditorDiv_${element.htmlContent}`);
              setRequireElementTypeErrorMessage({
                ...requireElementTypeErrorMessage,
                htmlContent: true,
              });
              hasError = true;
            }
          });
        }
        if (elementHtmlContentWithFirstPageTypeId.length > 0) {
          elementHtmlContentWithFirstPageTypeId.forEach((element, index) => {
            // Add a null check before calling HtmlToPlainText function
            if (element?.htmlContent) {
              // Remove HTML tags and style attributes using HtmlToPlainText function
              const cleanContent = HtmlToPlainText(element.htmlContent);
              // Check if any text is present after removing tags and styles
              const textPresent = cleanContent.trim().length > 0;

              if (!textPresent) {
                setRequireElementTypeErrorMessage({
                  ...requireElementTypeErrorMessage,
                  htmlContent: true,
                });

                const updatedTemplateElementList = [...templateElementList];
                updatedTemplateElementList[index] = {
                  ...updatedTemplateElementList[index],
                  htmlContent: null,
                };

                setTemplateElementList(updatedTemplateElementList);
                hasError = true; // This should probably be set through state to trigger re-renders
              }
            }
          });
        }
        if (elementPdfTypeId.length > 0) {
          // Iterating over the filtered elements
          elementPdfTypeId.forEach((element, index) => {
            if (element.headings === null || element.headings === "") {
              scrollUpDownByElementID(`HeadingDiv_${element.headings}`);
              setRequireElementTypeErrorMessage({
                ...requireElementTypeErrorMessage,
                headings: true,
              });
              hasError = true;
            }
          });
        }

        // Select atleast one signatory block validation

        // if (TemplateObj.templateTypeID === 2 && elementTypeId.length === 0) {
        //   const SignataryBlock = templateElementList.filter(
        //     (item) => item.templateElementTypeID == 7
        //   );

        //   if (SignataryBlock.length === 0) {
        //     scrollUpDownByElementID("SignatoriesBlockDiv");
        //     setRequireElementTypeErrorMessage({
        //       ...requireElementTypeErrorMessage,
        //       RequireSignataryBlock: true,
        //     });
        //     hasError = true;
        //   }
        // }

        const FirstPageOnTop = templateElementList.filter(
          (item) => item.templateElementTypeID == 10,
        );
        if (FirstPageOnTop.length > 0 && elementTypeId.length === 0) {
          const FirstPage = templateElementList.findIndex(
            (item) => item.templateElementTypeID == 10,
          );

          if (FirstPage > 0) {
            scrollUpDownByElementID("FirstPage");
            setRequireElementTypeErrorMessage({
              ...requireElementTypeErrorMessage,
              RequireFirstPageBlock: true,
            });
            hasError = true;
          }
        }
        if (hasError) {
          return false; // Exit the function if an error is encountered
        }
      }
    } else if (
      (common.roleTypeId === USER_ROLE_TYPE.SuperAdmin &&
        TemplateObj.orgBusinessTypeID === null) ||
      TemplateObj.orgBusinessTypeID === ""
    ) {
      setRequireErrorMessage(true);
      return false; // Return false or handle your error logic here if needed.
    } else {
      setRequireErrorMessage(false); // Clear the error message if there are no errors.
    }

    const isEditorContentEmptyOrOnlyPTags = templateElementList.some(
      (element) =>
        element.templateElementTypeID === 2 &&
        (!element.htmlContent || element.htmlContent.trim() === "<p></p>"),
    );

    if (isEditorContentEmptyOrOnlyPTags) {
      setRequireErrorMessage("This field is required.");
      // setRequireErrorMessage({ERROR_MESSAGES});
      return false; // Return false or handle your error logic here if the editor is empty or contains only <p> tags
    } else {
      setRequireErrorMessage(""); // Clear the error message if there are no errors.
    }

    // Preparing Object For Add Update and if any modification then it will done here

    // const UpdatedTemplateElementList = templateElementList.filter(
    //   (item) => item.templateElementTypeID === 3
    // );

    const ModifiedUpdatedTemplateElementList = templateElementList.map(
      (item) => ({
        ...item,
        pricingTableColumnIDs:
          selectedTemplateType === 0 ? "" : getVisibleFieldIds(),

        ...(item.templateElementTypeID === 4 && {
          mainHeading: TemplateObj.serviceDescriptionMainHeading || null,
          recurringOnGoingHeading:
            TemplateObj.serviceDescriptionRecurringHeading || null,
          oneOffAdhocHeading:
            TemplateObj.serviceDescriptionOneOffHeading || null,

          mainHeadingFontSize: TemplateObj.serviceDescriptionMainHeadingFontSize
            ? String(TemplateObj.serviceDescriptionMainHeadingFontSize)
            : null,
          recurringOnGoingHeadingFontSize:
            TemplateObj.serviceDescriptionRecurringHeadingFontSize
              ? String(TemplateObj.serviceDescriptionRecurringHeadingFontSize)
              : null,
          oneOffAdhocFontSize:
            TemplateObj.serviceDescriptionOneOffHeadingFontSize
              ? String(TemplateObj.serviceDescriptionOneOffHeadingFontSize)
              : null,

          mainHeadingIsBold:
            TemplateObj.serviceDescriptionMainHeadingFontWeight || null,
          mainHeadingIsItalic:
            TemplateObj.serviceDescriptionMainHeadingFontItalic || null,

          recurringOnGoingHeadingIsBold:
            TemplateObj.serviceDescriptionRecurringHeadingFontWeight || null,
          recurringOnGoingHeadingIsItalic:
            TemplateObj.serviceDescriptionRecurringHeadingFontItalic || null,

          oneOffAdhocHeadingIsBold:
            TemplateObj.serviceDescriptionOneOffHeadingFontWeight || null,
          oneOffAdhocHeadingIsItalic:
            TemplateObj.serviceDescriptionOneOffHeadingFontItalic || null,
        }),

        ...(item.templateElementTypeID === 8 && {
          mainHeading: TemplateObj.statementOfFactsMainHeading || null,
          recurringOnGoingHeading:
            TemplateObj.statementOfFactsRecurringHeading || null,
          oneOffAdhocHeading: TemplateObj.statementOfFactsOneOffHeading || null,

          mainHeadingFontSize: TemplateObj.statementOfFactsMainHeadingFontSize
            ? String(TemplateObj.statementOfFactsMainHeadingFontSize)
            : null,
          recurringOnGoingHeadingFontSize:
            TemplateObj.statementOfFactsRecurringHeadingFontSize
              ? String(TemplateObj.statementOfFactsRecurringHeadingFontSize)
              : null,
          oneOffAdhocFontSize: TemplateObj.statementOfFactsOneOffHeadingFontSize
            ? String(TemplateObj.statementOfFactsOneOffHeadingFontSize)
            : null,

          mainHeadingIsBold:
            TemplateObj.statementOfFactsMainHeadingFontWeight || null,
          mainHeadingIsItalic:
            TemplateObj.statementOfFactsMainHeadingFontItalic || null,

          recurringOnGoingHeadingIsBold:
            TemplateObj.statementOfFactsRecurringHeadingFontWeight || null,
          recurringOnGoingHeadingIsItalic:
            TemplateObj.statementOfFactsRecurringHeadingFontItalic || null,

          oneOffAdhocHeadingIsBold:
            TemplateObj.statementOfFactsOneOffHeadingFontWeight || null,
          oneOffAdhocHeadingIsItalic:
            TemplateObj.statementOfFactsOneOffHeadingFontItalic || null,
        }),
      }),
    );

    const ApiRequest_ParamsObj = {
      //global level params : fixed
      acceptSAChanges: Accept,
      organisationKeyID: common.organisationKeyID,
      organisationID: common.organisationID,
      //form level params : fixed
      templateTypeID: TemplateObj.templateTypeID, //will change module wise
      templateKeyID: TemplateObj.templateKeyID,
      watermarkImage: TemplateObj.watermarkImage,
      enableFirstPage: TemplateObj.enableFirstPage,
      headerFooterFirstPage: TemplateObj.headerFooterFirstPage,
      orientationID: TemplateObj.orientationID,
      userKeyID: common.userKeyID,
      clientBusinessTypeID: TemplateObj.clientBusinessTypeID,
      clientBusinessTypeIDs: TemplateObj.clientBusinessTypeIDs,
      orgBusinessTypeID: TemplateObj.orgBusinessTypeID,
      isPredefined: common.roleTypeId === USER_ROLE_TYPE.SuperAdmin ? 1 : 0,
      isDefault: TemplateObj.isDefault,
      //form level params : will change according to module
      templateName: TemplateObj.templateName,
      templateElementList: ModifiedUpdatedTemplateElementList,
      fontFamilyID: TemplateObj.fontFamilyID,
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

    AddUpdateTemplateData(ApiRequest_ParamsObj);
  };

  // Add or Update Service Category setRequireErrorMessage
  const AddUpdateTemplateData = async (apiRequestParams) => {
    setLoader(true);
    try {
      let url = "/AddUpdateTemplate"; // Default URL for Adding Data
      if (apiRequestParams.templateKeyID !== null) {
        url = `/AddUpdateTemplate?templateKeyID=${apiRequestParams.templateKeyID}`; // URL for Updating Data
      }
      const response = await AddUpdateTemplate(url, apiRequestParams);
      if (response) {
        setLoader(false);
        if (response?.data?.statusCode === 200) {
          const TemplateKeyID = response.data.responseData.data;
          const formData = new FormData();
          const isBinary =
            selectedFile.fileName instanceof Blob ||
            selectedFile.fileName instanceof File;
          // Instead, you should append the entire file
          if (isBinary) {
            setLoader(true);
            formData.set("file", selectedFile.fileName); // Append the file itself
            const uploadResponse = await AddUpdateTemplateWatermark(
              selectedFile.size,
              TemplateKeyID,
              formData,
            );

            if (uploadResponse) {
              if (apiRequestParams.templateKeyID === null) {
                $("#" + props.id).modal("show");
                setOpenSuccessModal(true);
                setLoader(false);
                // navigate("/terms-and-conditions");
              } else {
                setOpenSuccessModal(true);
                setLoader(false);
                // navigate("/terms-and-conditions");
              }
            } else {
              setErrorMessage(uploadResponse?.response?.data?.errorMessage);
              setLoader(false);
            }
          } else {
            setOpenSuccessModal(true);
            setLoader(false);
          }
          if (apiRequestParams.templateKeyID === null) {
            setOpenSuccessModal(true);
            props.setIsAddUpdateActionDone(true);
          } else {
            setOpenSuccessModal(true);
            props.setIsAddUpdateActionDone(true);
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
    navigate("/templates");
    SetInitialModelData();
  };

  //Add element function
  const AddElementBtnClicked = () => {
    const templateTypeId = templateElementList.filter(
      (item) => item.templateElementTypeID === null,
    );

    if (templateTypeId.length === 0) {
      const elementObj = {
        TTETMapID: null, //Template's Template Element Type Mapping Id.
        templateElementTypeID: null,
        headings: null,
        shortDesc: null,
        htmlContent: null,
      };
      setTemplateElementList([...templateElementList, elementObj]);
    } else {
      setRequireElementTypeErrorMessage({
        ...requireElementTypeErrorMessage,
        templateElementTypeIDRequire: true,
      });
    }
    setTimeout(function () {
      scrollUpDownByElementID("AddElementDiv");
    }, 200);
  };

  const DeleteBtnClicked = (index) => {
    // Create a copy of the templateElementList array
    const updatedTemplateElementList = [...templateElementList];
    // Remove the element at the specified index
    updatedTemplateElementList.splice(index, 1);
    // Update the state with the modified array
    setTemplateElementList(updatedTemplateElementList); // Assuming you're using useState to manage the state
  };

  const OnTemplateChange = (index, field, value) => {
    const UpdateTemplate = [...templateElementList];
    let outputString;

    switch (FirstPageHeading) {
      case 1:
        outputString = "Proposal For";
        break;
      case 2:
        outputString = `Engagement Letter for`;
        break;
      default:
        outputString = "Default case";
        break;
    }
    const firstPageHTML = `
    <div style="margin-top: 400px;">
                      <p style="text-align: center;   color: #00BFFF;">
                        <span  style="color: #00BFFF; margin-top: 15px; font-size: 50px;" class="OrgBrandColor">${outputString}</span><br>
                       
                      </p>
                      <p style="page-break-after: always;"></p>
                      </div>
                    `;

    if (value === 9) {
      GetTemplateLookupPdfListData();
    }
    if (value === 10) {
      UpdateTemplate[index].headings = null;
      UpdateTemplate[index].shortDesc = null;
      UpdateTemplate[index].htmlContent = firstPageHTML;
      UpdateTemplate[index][field] = Number(value);
    } else if (field === "templateElementTypeID" && value !== 10) {
      UpdateTemplate[index].headings = null;
      UpdateTemplate[index].shortDesc = null;
      UpdateTemplate[index].htmlContent = null;
      UpdateTemplate[index][field] = Number(value);
    } else {
      UpdateTemplate[index].headings = null;
      UpdateTemplate[index].shortDesc = null;
      UpdateTemplate[index].htmlContent = null;
      UpdateTemplate[index][field] = Number(value);
    }

    if (value === 10) {
      // Remove the element from its current position
      const [shiftedElement] = UpdateTemplate.splice(index, 1);
      // Insert the element at the beginning
      UpdateTemplate.unshift(shiftedElement);
    }

    setTemplateElementList(UpdateTemplate);
  };

  const handleChangeTemplateType = (e) => {
    if (TemplateObj.templateTypeID !== null) {
      setRequireElementTypeErrorMessage({
        templateElementTypeID: false,
        headings: false,
        shortDesc: false,
        htmlContent: false,
        RequireSignataryBlock: false,
      });
      setTemplateObj({
        ...TemplateObj,
        // keyID: null,
        organisationID: null,
        templateTypeID: e.value,
        createdByID: null,
        isDefault: false,
        // templateName: "",
        clientBusinessTypeID: null,
        // clientBusinessTypeIDs: [],
        orgBusinessTypeID: common.businessTypeID,
        isPredefined: null,
      });
      setTemplateElementList([]);
    } else {
      setTemplateObj({
        ...TemplateObj,
        templateTypeID: e.value,
      });
    }
  };
  const handleClose = async () => {
    if (isCheck) {
      setLoader(true);
      const Notification = await NotifySuperAdminPredefinedChangesToAdmin({
        userKeyID: common.userKeyID,
        moduleKeyID: TemplateObj.templateKeyID,
        moduleName: "Predefined-PL-EL-Template",
      });
      if (Notification?.data?.statusCode === 200) {
        setLoader(false);
        setModelAction("NotificationSend");
        setOpenSuccessModal(true);
        setIsCheck(false);
      }
    } else {
      $("#" + props.id).modal("hide");
      $("#" + "ConfirmSAChangesModel").modal("hide");
      setErrorMessage(false);
      setOpenSuccessModal(false);
      navigate("/templates");
    }
  };

  const templateTypeFilter = TemplateTypeLookupList?.filter(
    (template) => template.value == TemplateObj.templateTypeID,
  );
  useEffect(() => {
    // Check if templateTypeFilter is not empty and has at least one element
    if (templateTypeFilter && templateTypeFilter.length > 0) {
      // Assuming you want to store the first found value in the state
      setFirstPageHeading(templateTypeFilter[0].value);
    } else {
      // Handle the case when no matching template is found
      setFirstPageHeading(null);
    }
  }, [templateTypeFilter]);
  // const businessTypeFilter = ProspectTypeVariation?.filter(
  //   (businessType) => businessType.value == TemplateObj.clientBusinessTypeIDs
  // );
  const businessTypeFilter = ProspectTypeVariation?.filter((businessType) =>
    TemplateObj.clientBusinessTypeIDs?.includes(businessType.value),
  );

  const orgBusinessTypeFilter = BusinessTypeLookupList?.filter(
    (businessType) => businessType.value == TemplateObj.orgBusinessTypeID,
  );
  const IsActiveFilter = Utils.IS_default.find(
    (item) => TemplateObj.isDefault == item.value,
  );
  const professionTypeInputValue = professionTypeLookupList.filter(
    (item) => common.professionTypeLists[0] === item.professionTypeId,
  );

  const handlePdfSelect = (selectedOption, index) => {
    setSelectedPdf(selectedOption);
    setSelectedPdfDetails((prevDetails) => [
      ...prevDetails,
      selectedOption.value,
    ]);

    const updatedTemplateElementList = [...templateElementList];
    if (
      updatedTemplateElementList.length > 0 &&
      index >= 0 &&
      index < updatedTemplateElementList.length
    ) {
      updatedTemplateElementList[index].headings = selectedOption.value; // Assuming you want to set the headings property to the selected PDF title
      setTemplateElementList(updatedTemplateElementList);
    }
  };

  const SignataryBlock = templateElementList?.filter(
    (item) => item.templateElementTypeID == 7,
  );

  const ElementTypeValue = templateElementList
    .map((element, index) => {
      const matchingOption = TemplateElementLookeupListOptions.find(
        (option) => {
          return (
            element.templateElementTypeID !== null &&
            option.value === element.templateElementTypeID
          );
        },
      );
      if (matchingOption) {
        return {
          index: index,
          value: matchingOption.value,
          label: matchingOption.label,
        };
      }
      return null;
    })
    .filter(Boolean);

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
        moduleName: "Predefined-PL-EL-Template",
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
            navigate("/templates");
            props.setIsAddUpdateActionDone(true);
          } else {
            $("#" + "ConfirmSAChangesModel").modal("hide");
            navigate("/templates");
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

  const handleMultiSelectChange = (selectedOptions) => {
    setTemplateObj({
      ...TemplateObj,
      clientBusinessTypeIDs: selectedOptions.map((opt) => opt.value),
      originalBusinessTypeIDs: selectedOptions.map(
        (opt) => opt.originalBusinessTypeID,
      ),
    });
  };
  const CustomWidthTooltip = styled(({ className, ...props }) => (
    <Tooltip {...props} classes={{ popper: className }} />
  ))({
    [`& .${tooltipClasses.tooltip}`]: {
      maxWidth: 500,
    },
  });

  const templates = [
    {
      id: 0,
      label: "Default",
      content: null,
    },
    {
      id: 1,
      label: "Default",
      content: null,
    },
    {
      id: 2,
      label: "Default",
      content: null,
    },
    {
      id: 3,
      label: "Default",
      content: null,
    },
    {
      id: 4,
      label: "Default",
      content: null,
    },
    {
      id: 5,
      label: "Default",
      content: null,
    },
    {
      id: 6,
      label: "Custom",
      content: (
        <div style={{ marginTop: "0px" }} className="table-responsive">
          <table className="table align-middle table-nowrap">
            <thead className="table-dark text-white">
              <tr className="head-row">
                {visibleFieldsCustomTemp?.serviceCategory && (
                  <th
                    className="tr-table-class text-white text-center"
                    style={{ width: "16.66%" }}
                  >
                    Service Category
                  </th>
                )}
                {visibleFieldsCustomTemp.serviceName && (
                  <th
                    className="tr-table-class text-white text-center"
                    style={{ width: "16.66%" }}
                  >
                    Services
                  </th>
                )}
                {visibleFieldsCustomTemp.serviceScope && (
                  <th
                    className="tr-table-class text-white text-center"
                    style={{ width: "16.66%" }}
                  >
                    Service Scope
                  </th>
                )}

                {visibleFieldsCustomTemp.fees && (
                  <th
                    className="tr-table-class text-white text-center"
                    style={{ width: "16.66%" }}
                  >
                    Fees (£)
                  </th>
                )}
                {isVatEnabledForOrg &&
                  vatPercentage &&
                  visibleFieldsCustomTemp.vatRate && (
                    <th
                      className="tr-table-class text-white text-center"
                      style={{ width: "16.66%" }}
                    >
                      VAT Rate
                    </th>
                  )}
                {isVatEnabledForOrg &&
                  vatPercentage &&
                  visibleFieldsCustomTemp.vat && (
                    <th
                      className="tr-table-class text-white text-center"
                      style={{ width: "16.66%" }}
                    >
                      VAT (£)
                    </th>
                  )}
                {isVatEnabledForOrg &&
                  vatPercentage &&
                  visibleFieldsCustomTemp.feesIncVat && (
                    <th
                      className="tr-table-class text-white text-center"
                      style={{ width: "16.66%" }}
                    >
                      Fees inc VAT (£)
                    </th>
                  )}
              </tr>
            </thead>

            <tbody>
              <tr>
                {visibleFieldsCustomTemp?.serviceCategory && (
                  <td className="text-center">Test Service Category</td>
                )}
                {visibleFieldsCustomTemp.serviceName && (
                  <td className="text-center">Test Service</td>
                )}
                {visibleFieldsCustomTemp.serviceScope && (
                  <td className="text-center">Test scope=4</td>
                )}
                {visibleFieldsCustomTemp.fees && (
                  <td className="text-center">$500</td>
                )}
                {isVatEnabledForOrg &&
                  vatPercentage &&
                  visibleFieldsCustomTemp.vatRate && (
                    <td className="text-center">20%</td>
                  )}
                {isVatEnabledForOrg &&
                  vatPercentage &&
                  visibleFieldsCustomTemp.vat && (
                    <td className="text-center">$100</td>
                  )}
                {isVatEnabledForOrg &&
                  vatPercentage &&
                  visibleFieldsCustomTemp.feesIncVat && (
                    <td className="text-center">$600</td>
                  )}
              </tr>

              {/* === NET TOTAL ROW === */}
              {/* <tr className="head-row">
                <td className="tr-table-class text-white">Net Total</td>
                {visibleFieldsCustomTemp?.serviceCategory && <td></td>}
                {visibleFieldsCustomTemp.serviceScope && <td></td>}
                {visibleFieldsCustomTemp.fees && (
                  <td className="tr-table-class text-white text-center"></td>
                )}
                {vatPercentage && visibleFieldsCustomTemp.vatRate && <td></td>}
                {vatPercentage && visibleFieldsCustomTemp.vat && (
                  <td className="tr-table-class text-white text-center"></td>
                )}
                {vatPercentage && visibleFieldsCustomTemp.feesIncVat && (
                  <td className="tr-table-class text-white text-center"></td>
                )}
              </tr> */}

              {/* === DISCOUNT + GRAND TOTAL ROWS === */}
              {/* {Number(RecurringPricingInfo.Discount) > 0 &&
                ProposalObject.DiscountLines && (
                  <>
                    <tr className="head-grey-row">
                      {visibleFieldsCustomTemp?.serviceCategory && (
                        <td className="tr-table-class font-14 text-white">
                          Discount
                        </td>
                      )}
                      {visibleFieldsCustomTemp.serviceName && <td></td>}
                      {visibleFieldsCustomTemp.serviceScope && <td></td>}
                      {visibleFieldsCustomTemp.fees && (
                        <td className="tr-table-class font-14 text-white text-center">
                          (-) {formatValue(RecurringPricingInfo.Discount)}
                        </td>
                      )}
                      {vatPercentage && visibleFieldsCustomTemp.vatRate && (
                        <td></td>
                      )}
                      {vatPercentage && visibleFieldsCustomTemp.vat && (
                        <td className="tr-table-class text-white text-center">
                          (-){" "}
                          {Number(RecurringPricingInfo.OriginalPrice) <
                            Number(RecurringPricingInfo.DiscountedPrice) ||
                          (Number(RecurringPricingInfo.Discount) > 0 &&
                            !ProposalObject.DiscountLines)
                            ? formatValue(
                                ((Number(RecurringPricingInfo.DiscountedPrice) *
                                  20) /
                                  100) *
                                  (RecurringPricingInfo.DefaultDiscount / 100)
                              )
                            : formatValue(
                                ((Number(RecurringPricingInfo.OriginalPrice) *
                                  20) /
                                  100) *
                                  (RecurringPricingInfo.DefaultDiscount / 100)
                              )}
                        </td>
                      )}
                      {vatPercentage && visibleFieldsCustomTemp.feesIncVat && (
                        <td className="tr-table-class text-white text-center">
                          (-){" "}
                          {Number(RecurringPricingInfo.OriginalPrice) <
                            Number(RecurringPricingInfo.DiscountedPrice) ||
                          (Number(RecurringPricingInfo.Discount) > 0 &&
                            !ProposalObject.DiscountLines)
                            ? formatValue(
                                (Number(RecurringPricingInfo.DiscountedPrice) +
                                  (Number(
                                    RecurringPricingInfo.DiscountedPrice
                                  ) *
                                    20) /
                                    100) *
                                  (RecurringPricingInfo.DefaultDiscount / 100)
                              )
                            : formatValue(
                                (Number(RecurringPricingInfo.OriginalPrice) +
                                  (Number(RecurringPricingInfo.OriginalPrice) *
                                    20) /
                                    100) *
                                  (RecurringPricingInfo.DefaultDiscount / 100)
                              )}
                        </td>
                      )}
                    </tr>

                    <tr className="head-row">
                      {visibleFieldsCustomTemp?.serviceCategory && (
                        <td className="tr-table-class font-14 text-white">
                          Grand Total
                        </td>
                      )}
                      {visibleFieldsCustomTemp.serviceName && <td></td>}
                      {visibleFieldsCustomTemp.serviceScope && <td></td>}
                      {visibleFieldsCustomTemp.fees && (
                        <td className="tr-table-class font-14 text-white text-center">
                          {Number(RecurringPricingInfo.OriginalPrice) <
                            Number(RecurringPricingInfo.DiscountedPrice) ||
                          (Number(RecurringPricingInfo.Discount) > 0 &&
                            !ProposalObject.DiscountLines)
                            ? formatValue(
                                RecurringPricingInfo.DiscountedPrice -
                                  RecurringPricingInfo.Discount
                              )
                            : formatValue(
                                RecurringPricingInfo.OriginalPrice -
                                  RecurringPricingInfo.Discount
                              )}
                        </td>
                      )}
                      {vatPercentage && visibleFieldsCustomTemp.vatRate && (
                        <td></td>
                      )}
                      {vatPercentage && visibleFieldsCustomTemp.vat && (
                        <td className="tr-table-class font-14 text-white text-center">
                          {Number(RecurringPricingInfo.OriginalPrice) <
                            Number(RecurringPricingInfo.DiscountedPrice) ||
                          (Number(RecurringPricingInfo.Discount) > 0 &&
                            !ProposalObject.DiscountLines)
                            ? formatValue(
                                (Number(RecurringPricingInfo.DiscountedPrice) *
                                  20) /
                                  100 -
                                  ((Number(
                                    RecurringPricingInfo.DiscountedPrice
                                  ) *
                                    20) /
                                    100) *
                                    (RecurringPricingInfo.DefaultDiscount / 100)
                              )
                            : formatValue(
                                (Number(RecurringPricingInfo.OriginalPrice) *
                                  20) /
                                  100 -
                                  ((Number(RecurringPricingInfo.OriginalPrice) *
                                    20) /
                                    100) *
                                    (RecurringPricingInfo.DefaultDiscount / 100)
                              )}
                        </td>
                      )}
                      {vatPercentage && visibleFieldsCustomTemp.feesIncVat && (
                        <td className="tr-table-class font-14 text-white text-center">
                          {formatValue(RecurringPricingInfo.GrandTotal)}
                        </td>
                      )}
                    </tr>
                  </>
                )} */}
            </tbody>
          </table>
        </div>
      ),
    },
  ];

  const handleCheckboxChange = (field) => {
    setVisibleFieldsCustomTemp((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const formatFieldLabel = (field) => {
    // Special case for VAT fields
    if (field === "vatRate") return "VAT Rate";
    if (field === "feesIncVat") return "Fees Inc VAT";
    if (field === "vat") return "VAT";

    // Default behavior
    return field
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase());
  };

  return (
    <div className="container-fluid new-item-page-container">
      <div
        ref={TemplateDivContainerRef}
        onClick={(e) => scrollUptoCurrentPosition(e, TemplateDivContainerRef)}
        class="new-item-page-content"
      >
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
              <div class="tab-content  force-overflow">
                <>
                  <div className="row mb-2" id="ProfessionTypeDiv">
                    <SAPredefinedChangesNotifyMessageModel
                      Params={{
                        moduleName: moduleName,
                        SAChanges: location.state?.Type,
                      }}
                    />
                    {(common.professionTypeLists?.length > 1 ||
                      common.organisationKeyID === null) && (
                      <>
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
                      </>
                    )}
                  </div>
                </>
                {common.roleTypeId === USER_ROLE_TYPE.SuperAdmin &&
                  common.organisationKeyID === null && (
                    <>
                      <div className="row mb-2" id="OrganisationBusinessDiv">
                        <div className="col-lg-3 template-label text-left">
                          <div className="mb-1">
                            <label className="form-label">
                              Organisation Business Type{" "}
                              <span className="text-danger">*</span>
                            </label>
                          </div>
                        </div>
                        <div className="col-lg-9">
                          <div className="mb-1 input-group">
                            <Select
                              className="user-role-select"
                              options={BusinessTypeLookupList.slice(1, 6)}
                              value={orgBusinessTypeFilter}
                              onChange={(e) =>
                                setTemplateObj({
                                  ...TemplateObj,
                                  orgBusinessTypeID: e.value,
                                })
                              }
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
                <div className="row mb-2" id="ProspectBusinessDiv">
                  <div className="col-lg-3 template-label text-left">
                    <div className="mb-1 ">
                      <label className="form-label">
                        {prospectName} Business Type{" "}
                        <span className="text-danger">*</span>
                      </label>
                    </div>
                  </div>
                  <div className="col-lg-9">
                    <div className="mb-1  input-group">
                      <Select
                        className="user-role-select"
                        options={ProspectTypeVariation}
                        isMulti
                        value={businessTypeFilter}
                        onChange={handleMultiSelectChange}
                      />
                      {requireErrorMessage &&
                      // TemplateObj.clientBusinessTypeID === "" ||
                      // TemplateObj.clientBusinessTypeID === null
                      TemplateObj.clientBusinessTypeIDs.length === 0 ? (
                        <label className="validation">{ERROR_MESSAGES}</label>
                      ) : (
                        ""
                      )}
                    </div>
                  </div>
                </div>
                <div className="row mb-2" id="TemplateTypeDiv">
                  <div className="col-lg-3 template-label text-left">
                    <div className="mb-1">
                      <label className="form-label">
                        Template Type
                        <span className="text-danger">*</span>
                      </label>
                    </div>
                  </div>
                  <div className="col-lg-9">
                    <div className="mb-1 input-group ">
                      <Select
                        className="user-role-select"
                        options={TemplateTypeLookupList}
                        value={templateTypeFilter}
                        onChange={(e) => {
                          handleChangeTemplateType(e);
                        }}
                      />
                      {requireErrorMessage &&
                      (TemplateObj.templateTypeID === "" ||
                        TemplateObj.templateTypeID === null) ? (
                        <label className="validation">{ERROR_MESSAGES}</label>
                      ) : (
                        ""
                      )}
                    </div>
                  </div>
                </div>
                <div className="row mb-2" id="TemplateNameDiv">
                  <div className="col-lg-3 template-label text-left">
                    <div className="mb-1 ">
                      <label className="form-label">
                        Template Name
                        <span className="text-danger">*</span>
                      </label>
                    </div>
                  </div>
                  <div className="col-lg-9">
                    <div className="mb-1 ">
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
                              "",
                            );
                            const capitalizedValue =
                              trimmedValue.charAt(0).toUpperCase() +
                              trimmedValue.slice(1);
                            setTemplateObj({
                              ...TemplateObj,
                              templateName: capitalizedValue,
                            });
                          }}
                          maxLength={100}
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
                <div className="row mb-2" id="IsDefaultDiv">
                  <div
                    style={{ padding: "10px" }}
                    className="col-lg-3  text-left"
                  >
                    <div className="mb-1">
                      <label className="form-label">
                        Is Default? <span className="text-danger">*</span>
                      </label>
                    </div>
                  </div>
                  <div className="col-lg-9">
                    <div className="mb-2 input-group">
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
                      {requireErrorMessage &&
                      (TemplateObj.status === "" ||
                        TemplateObj.status === null) ? (
                        <label className="validation">{ERROR_MESSAGES}</label>
                      ) : (
                        ""
                      )}
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
                <div className="row mb-2" id="FontFamily">
                  <div
                    style={{ padding: "10px" }}
                    className="col-lg-3  text-left"
                  >
                    <div className="mb-1">
                      <label className="form-label">Font Family</label>
                    </div>
                  </div>
                  <div className="col-lg-9">
                    <div className="mb-2 input-group">
                      <Select
                        className="user-role-select"
                        options={FontFamilyLookupList}
                        value={FontFamilyValue}
                        getOptionLabel={(e) => (
                          <span style={{ fontFamily: e.label }}>{e.label}</span>
                        )}
                        onChange={(e) =>
                          setTemplateObj({
                            ...TemplateObj,
                            fontFamilyID: e.value,
                          })
                        }
                        styles={{
                          option: (provided, state) => ({
                            ...provided,
                            cursor: "pointer",
                          }),
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div className="row mb-2" id="WatermarkDiv">
                  <div
                    style={{ padding: "10px" }}
                    className="col-lg-3  text-left"
                  >
                    <div className="mb-1">
                      <label className="form-label">Upload Watermark</label>
                    </div>
                  </div>
                  <div className="col-lg-9 col-md-9">
                    {(TemplateObj.watermarkImage || selectedFile.fileName) && (
                      <button
                        onClick={handleWatermarkImageDelete}
                        style={{
                          marginBottom: "5px",
                          fontSize: "75%",
                        }}
                        className="btn btn-sm btn-danger remove-item-btn"
                      >
                        <i className="bi bi-trash3 margin-right"></i> Delete
                      </button>
                    )}

                    <div className="mb-2 input-group">
                      {!selectedFile.fileName && !TemplateObj.watermarkImage ? (
                        <input
                          type="file"
                          accept=".jpg, .jpeg, .png"
                          onChange={(e) => {
                            e.preventDefault();
                            const file = e.target.files[0];

                            if (file) {
                              const fileNameParts = file.name.split(".");
                              const fileExtension =
                                fileNameParts[
                                  fileNameParts.length - 1
                                ].toLowerCase();
                              const allowedExtensions = ["jpg", "jpeg", "png"];

                              if (!allowedExtensions.includes(fileExtension)) {
                                console.error(
                                  "Please select a JPG, JPEG, or PNG file.",
                                );
                                return;
                              }

                              handleFileUpload(e);
                            }
                          }}
                        />
                      ) : (
                        <div className="input-group mt-3">
                          {/* Preview for newly selected file */}
                          {selectedFile.fileName &&
                            (() => {
                              const file = selectedFile.fileName;
                              const fileExtension = file.name
                                .split(".")
                                .pop()
                                .toLowerCase();

                              if (
                                ["jpg", "jpeg", "png"].includes(fileExtension)
                              ) {
                                return (
                                  <div style={{ width: "100%" }}>
                                    <p>
                                      <strong>Preview:</strong> {file.name}
                                    </p>
                                    <iframe
                                      title="Watermark Preview"
                                      src={URL.createObjectURL(file)}
                                      width="100%"
                                      height="350px"
                                      loading="lazy"
                                      style={{ border: "1px solid #000" }}
                                    />
                                  </div>
                                );
                              }

                              return (
                                <p className="text-danger">
                                  Unsupported file format.
                                </p>
                              );
                            })()}

                          {/* Preview for existing watermark*/}
                          {!selectedFile.fileName &&
                            TemplateObj.watermarkImage && (
                              <div style={{ width: "100%" }}>
                                <p>
                                  <strong>Current Watermark:</strong>
                                </p>
                                <iframe
                                  title="Current Watermark"
                                  src={TemplateObj.watermarkImage}
                                  width="100%"
                                  height="350px"
                                  loading="lazy"
                                  style={{ border: "1px solid #000" }}
                                />
                              </div>
                            )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="row mb-2" id="FirstPage">
                  <div
                    style={{ padding: "10px" }}
                    className="col-lg-3  text-left"
                  >
                    <div className="mb-1">
                      <label className="form-label">Add First Page</label>
                    </div>
                  </div>
                  <div className="col-lg-9">
                    <div
                      class="col-md-9 col-sm-9 col-lg-9"
                      style={{
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <FormGroup>
                        <FormControlLabel
                          control={
                            <CustomWidthTooltip
                              title={`Enable/Disable First Page`}
                            >
                              <Android12Switch
                                id="isEL"
                                checked={TemplateObj.enableFirstPage}
                                onChange={() =>
                                  setTemplateObj({
                                    ...TemplateObj,
                                    enableFirstPage:
                                      !TemplateObj.enableFirstPage,
                                  })
                                }
                              />
                            </CustomWidthTooltip>
                          }
                        />
                        <div
                          style={{
                            marginTop: "-12px",
                            marginBottom: "10px",
                            textAlign: "justify",
                          }}
                          className="text-muted helpMessage"
                        >
                          <b>Note: </b>
                          If enabled and a customised first page is configured,
                          it will be displayed; if not, the default first page
                          will appear. If disabled, no first page will be
                          displayed.
                        </div>
                      </FormGroup>
                    </div>
                  </div>
                </div>
                <div className="row mb-2">
                  <div
                    id="FirstPageHeaderFooter"
                    style={{ padding: "10px" }}
                    className="col-lg-3  text-left"
                  >
                    <div className="mb-1">
                      <label className="form-label">
                        Header/Footer for First Page
                      </label>
                    </div>
                  </div>
                  <div className="col-lg-3 col-sm-9">
                    <div
                      class="col-md-3 col-sm-9 col-lg-3"
                      style={{
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <FormGroup>
                        <FormControlLabel
                          control={
                            <CustomWidthTooltip
                              title={`Enable/Disable First Page Header/Footer`}
                            >
                              <Android12Switch
                                id="isHFfirst"
                                checked={TemplateObj.headerFooterFirstPage}
                                onChange={() =>
                                  setTemplateObj({
                                    ...TemplateObj,
                                    headerFooterFirstPage:
                                      !TemplateObj.headerFooterFirstPage,
                                  })
                                }
                              />
                            </CustomWidthTooltip>
                          }
                        />
                      </FormGroup>
                    </div>
                  </div>
                </div>
                <div className="row mb-2" id="ViewMode">
                  <div
                    style={{ padding: "10px" }}
                    className="col-lg-3  text-left"
                  >
                    <div className="mb-1">
                      <label className="form-label">Orientation</label>
                    </div>
                  </div>
                  <div className="col-lg-9">
                    <div
                      class="col-md-9 col-sm-9 col-lg-9 me-4"
                      style={{
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <div className="row">
                        <div className="col-md-3 col-lg-3 me-4">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="orientation"
                            value={1}
                            checked={TemplateObj.orientationID === 1}
                            onChange={handleOrientationChange}
                            defaultChecked
                          />
                          <label className="form-check-lable">Portrait</label>
                        </div>
                        <div className="col-md-3 col-lg-3">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="orientation"
                            value={2}
                            checked={TemplateObj.orientationID === 2}
                            onChange={handleOrientationChange}
                          />
                          <label className="form-check-label">Landscape</label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {TemplateObj.templateTypeID !== null && (
                  <>
                    <h6 className="mt-2">Template Content</h6>
                  </>
                )}
                <div className="row" id="VariablesDiv">
                  <div className="col-12">
                    <div className="overflow-hidden">
                      {/* {TemplateObj?.originalBusinessTypeID ===
                        CLIENT_TYPES.Individual &&
                        TemplateObj.templateTypeID !== null && (
                          <>
                            <div className="separator mb-3" />
                            <IndividualVariable
                              ModuleName="Template"
                              ClintType={TemplateObj?.originalBusinessTypeID}
                              businessTypeId={
                                common.organisationKeyID === null
                                  ? TemplateObj.orgBusinessTypeID
                                  : common.businessTypeID
                              }
                            />
                          </>
                        )}
                      {TemplateObj?.originalBusinessTypeID ==
                        CLIENT_TYPES.Sole_Trader &&
                        TemplateObj.templateTypeID !== null && (
                          <>
                            <div className="separator mb-3" />
                            <SoleTraderVariable
                              ModuleName="Template"
                              ClintType={TemplateObj?.originalBusinessTypeID}
                              businessTypeId={
                                common.organisationKeyID === null
                                  ? TemplateObj.orgBusinessTypeID
                                  : common.businessTypeID
                              }
                            />
                          </>
                        )}
                      {TemplateObj?.originalBusinessTypeID ==
                        CLIENT_TYPES.Partnership &&
                        TemplateObj.templateTypeID !== null && (
                          <>
                            <div className="separator mb-3" />
                            <PartnershipVariable
                              ModuleName="Template"
                              ClintType={TemplateObj?.originalBusinessTypeID}
                              businessTypeId={
                                common.organisationKeyID === null
                                  ? TemplateObj.orgBusinessTypeID
                                  : common.businessTypeID
                              }
                            />
                          </>
                        )}{" "}
                      {(TemplateObj?.originalBusinessTypeID == CLIENT_TYPES.LLP ||
                        TemplateObj?.originalBusinessTypeID ==
                        CLIENT_TYPES.Company) &&
                        TemplateObj.templateTypeID !== null && (
                          <>
                            <div className="separator mb-3" />
                            <LlpAndCompanyVariable
                              ModuleName="Template"
                              ClintType={TemplateObj?.originalBusinessTypeID}
                              businessTypeId={
                                common.organisationKeyID === null
                                  ? TemplateObj.orgBusinessTypeID
                                  : common.businessTypeID
                              }
                            />
                          </>
                        )} */}
                      {TemplateObj.templateTypeID !== null && (
                        <>
                          <div className="separator mb-3" />
                          <CommonProspectVariable
                            ModuleName="Template"
                            ClintType={TemplateObj?.originalBusinessTypeIDs}
                            businessTypeId={
                              common.organisationKeyID === null
                                ? TemplateObj.orgBusinessTypeID
                                : common.businessTypeID
                            }
                          />
                        </>
                      )}
                    </div>
                  </div>
                </div>
                {/* <div className="row" >
                  <div className="col-12">
                    <div className="overflow-hidden">
                      
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-12">
                    <div className="overflow-hidden">
                     
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-12">
                    <div className="overflow-hidden">
                      
                    </div>
                  </div>
                </div> */}
              </div>
              {templateElementList?.map((item, index) => {
                let componentToRender = null;
                switch (item.templateElementTypeID) {
                  case 1:
                  case "1":
                    componentToRender = (
                      <Heading
                        templateElementList={templateElementList}
                        requireElementTypeErrorMessage={
                          requireElementTypeErrorMessage
                        }
                        setRequireElementTypeErrorMessage={
                          setRequireElementTypeErrorMessage
                        }
                        setTemplateElementList={setTemplateElementList}
                        index={index}
                      />
                    );
                    break;
                  case 2:
                  case "2":
                    componentToRender = (
                      <TextBlock
                        templateElementList={templateElementList}
                        requireElementTypeErrorMessage={
                          requireElementTypeErrorMessage
                        }
                        setRequireElementTypeErrorMessage={
                          setRequireElementTypeErrorMessage
                        }
                        setTemplateElementList={setTemplateElementList}
                        index={index}
                      />
                    );
                    break;

                  case 3:
                  case "3":
                    // Pricing table
                    componentToRender = (
                      <div className="m-3">
                        {/* === Row with Both Labels === */}
                        <div className="d-flex align-items-start flex-wrap">
                          {/* === Template 0 === */}
                          <div className="d-flex align-items-start me-4">
                            <input
                              type="radio"
                              id={`template-${templates[0].id}`}
                              value={templates[0].id}
                              checked={selectedTemplateType === templates[0].id}
                              onChange={() =>
                                setSelectedTemplateType(templates[0].id)
                              }
                              className="me-2 mt-1"
                            />
                            <label
                              className="form-check-label fs-6"
                              htmlFor={`template-${templates[0].id}`}
                              style={{ cursor: "pointer", fontSize: "15px" }}
                            >
                              <strong>{templates[0].label}</strong>
                            </label>
                          </div>

                          {/* === Template 6 === */}
                          <div className="d-flex align-items-start">
                            <input
                              type="radio"
                              id={`template-${templates[6].id}`}
                              value={templates[6].id}
                              checked={selectedTemplateType === templates[6].id}
                              onChange={() =>
                                setSelectedTemplateType(templates[6].id)
                              }
                              className="me-2 mt-1"
                            />
                            <label
                              htmlFor={`template-${templates[6].id}`}
                              className="form-check-label fs-6"
                              style={{ fontSize: "15px", cursor: "pointer" }}
                            >
                              {templates[6].label}
                            </label>
                          </div>
                        </div>

                        {/* === Template 0 Content === */}
                        {selectedTemplateType === templates[0].id && (
                          <div className="mt-2">{templates[0].content}</div>
                        )}

                        {/* === Template 6 Content === */}
                        {selectedTemplateType === templates[6].id && (
                          <div
                            className="mt-2"
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: "10px",
                            }}
                          >
                            {/* Checkboxes */}
                            <div
                              className="mb-1 d-flex flex-wrap gap-3"
                              style={{ marginTop: "25px" }}
                            >
                              {Object.keys(visibleFieldsCustomTemp)
                                .filter(
                                  (field) =>
                                    isVatEnabledForOrg ||
                                    !VAT_FIELD_KEYS.includes(field),
                                )
                                .map((field) => (
                                  <div key={field} className="form-check">
                                    <input
                                      type="checkbox"
                                      className="form-check-input"
                                      id={`pricing-field-${field}`}
                                      checked={visibleFieldsCustomTemp[field]}
                                      disabled={
                                        field === "serviceName" ||
                                        (isVatEnabledForOrg &&
                                          field === "feesIncVat")
                                      }
                                      onChange={() =>
                                        handleCheckboxChange(field)
                                      }
                                    />

                                    <label
                                      htmlFor={`pricing-field-${field}`}
                                      className="form-check-label"
                                    >
                                      {formatFieldLabel(field)}
                                    </label>
                                  </div>
                                ))}
                            </div>

                            {/* Table */}
                            <div className="mt-1">{templates[6].content}</div>
                          </div>
                        )}
                      </div>
                    );
                    break;
                  case 4:
                  case "4":
                    // Service description
                    componentToRender = (
                      <div>
                        <div className="row fieldset">
                          <div className="col-2 fieldset-label">
                            <label className="fieldset-label required">
                              Main Heading
                            </label>
                          </div>
                          <div className="col-5">
                            <input
                              type="text"
                              placeholder="Main service description heading"
                              className="input-text"
                              value={TemplateObj.serviceDescriptionMainHeading}
                              maxLength={150}
                              onChange={(e) => {
                                let input = e.target.value;
                                if (input.startsWith(" ")) {
                                  input = input.trimStart();
                                }
                                setTemplateObj((prev) => ({
                                  ...prev,
                                  serviceDescriptionMainHeading: input,
                                }));
                              }}
                            />
                          </div>
                          <div className="col-2">
                            {/* <input
                              type="text"
                              placeholder="Enter font size"
                              className="input-text"
                              value={
                                TemplateObj.serviceDescriptionMainHeadingFontSize
                              }
                            /> */}
                            <div className="input-group">
                              <Select
                                className=" selectDropDown Drop-down-width"
                                value={Utils.FontSize.find(
                                  (item) =>
                                    item.value ===
                                    Number(
                                      TemplateObj.serviceDescriptionMainHeadingFontSize,
                                    ),
                                )}
                                onChange={(e) => {
                                  setTemplateObj((prev) => ({
                                    ...prev,
                                    serviceDescriptionMainHeadingFontSize:
                                      e.value,
                                  }));
                                }}
                                options={Utils.FontSize}
                                aria-label="Font"
                                placeholder="Font"
                                menuPlacement="top"
                              />
                            </div>
                          </div>
                          <div className="col-1 d-flex align-items-center justify-content-center">
                            <div className="form-check d-flex align-items-center gap-2 m-0">
                              <input
                                type="checkbox"
                                id="mainboldCheckbox"
                                className="form-check-input m-0"
                                checked={
                                  TemplateObj.serviceDescriptionMainHeadingFontWeight ===
                                  true
                                }
                                onChange={(e) =>
                                  setTemplateObj((prev) => ({
                                    ...prev,
                                    serviceDescriptionMainHeadingFontWeight: e
                                      .target.checked
                                      ? true
                                      : false,
                                  }))
                                }
                              />
                              <label
                                htmlFor="mainboldCheckbox"
                                className="form-check-label mb-0"
                              >
                                Bold
                              </label>
                            </div>
                          </div>

                          <div className="col-1 d-flex align-items-center justify-content-center">
                            <div className="form-check d-flex align-items-center gap-2 m-0">
                              <input
                                type="checkbox"
                                id="mainitalicCheckbox"
                                className="form-check-input m-0"
                                checked={
                                  TemplateObj.serviceDescriptionMainHeadingFontItalic ===
                                  true
                                }
                                onChange={(e) =>
                                  setTemplateObj((prev) => ({
                                    ...prev,
                                    serviceDescriptionMainHeadingFontItalic: e
                                      .target.checked
                                      ? true
                                      : false,
                                  }))
                                }
                              />
                              <label
                                htmlFor="mainitalicCheckbox"
                                className="form-check-label mb-0"
                              >
                                Italic
                              </label>
                            </div>
                          </div>
                        </div>
                        {/* Recurring / On-going services heading */}
                        <div className="row fieldset">
                          <div className="col-2 fieldset-label">
                            <label className="fieldset-label required text-wrap">
                              Recurring/On-going Heading
                            </label>
                          </div>
                          <div className="col-5">
                            <input
                              type="text"
                              placeholder="Enter Recurring/On-going Heading"
                              className="input-text"
                              value={
                                TemplateObj.serviceDescriptionRecurringHeading
                              }
                              maxLength={150}
                              onChange={(e) => {
                                let input = e.target.value;
                                if (input.startsWith(" ")) {
                                  input = input.trimStart();
                                }
                                setTemplateObj((prev) => ({
                                  ...prev,
                                  serviceDescriptionRecurringHeading: input,
                                }));
                              }}
                            />
                          </div>
                          <div className="col-2">
                            {/* <input
                              type="text"
                              placeholder="Enter font size"
                              className="input-text"
                              value={
                                TemplateObj.serviceDescriptionMainHeadingFontSize
                              }
                            /> */}
                            <div className="input-group">
                              <Select
                                className=" selectDropDown Drop-down-width"
                                value={Utils.FontSize.filter(
                                  (item) =>
                                    item.value ===
                                    TemplateObj.serviceDescriptionRecurringHeadingFontSize,
                                )}
                                onChange={(e) => {
                                  setTemplateObj((prev) => ({
                                    ...prev,
                                    serviceDescriptionRecurringHeadingFontSize:
                                      e.value,
                                  }));
                                }}
                                options={Utils.FontSize}
                                aria-label="Font"
                                placeholder="Font"
                                menuPlacement="top"
                              />
                            </div>
                          </div>
                          <div className="col-1 d-flex align-items-center justify-content-center">
                            <div className="form-check d-flex align-items-center gap-2 m-0">
                              <input
                                type="checkbox"
                                id="recurringboldCheckbox"
                                className="form-check-input m-0"
                                checked={
                                  TemplateObj.serviceDescriptionRecurringHeadingFontWeight ===
                                  true
                                }
                                onChange={(e) =>
                                  setTemplateObj((prev) => ({
                                    ...prev,
                                    serviceDescriptionRecurringHeadingFontWeight:
                                      e.target.checked ? true : false,
                                  }))
                                }
                              />
                              <label
                                htmlFor="recurringboldCheckbox"
                                className="form-check-label mb-0"
                              >
                                Bold
                              </label>
                            </div>
                          </div>

                          <div className="col-1 d-flex align-items-center justify-content-center">
                            <div className="form-check d-flex align-items-center gap-2 m-0">
                              <input
                                type="checkbox"
                                id="recurringitalicCheckbox"
                                className="form-check-input m-0"
                                checked={
                                  TemplateObj.serviceDescriptionRecurringHeadingFontItalic ===
                                  true
                                }
                                onChange={(e) =>
                                  setTemplateObj((prev) => ({
                                    ...prev,
                                    serviceDescriptionRecurringHeadingFontItalic:
                                      e.target.checked ? true : false,
                                  }))
                                }
                              />
                              <label
                                htmlFor="recurringitalicCheckbox"
                                className="form-check-label mb-0"
                              >
                                Italic
                              </label>
                            </div>
                          </div>
                        </div>
                        {/* One-Off/Ad hoc Services heading */}
                        <div className="row fieldset">
                          <div className="col-2 fieldset-label">
                            <label className="fieldset-label required text-wrap">
                              One-Off/Ad hoc Heading
                            </label>
                          </div>
                          <div className="col-5">
                            <input
                              type="text"
                              placeholder="Enter One-Off/Ad hoc Heading"
                              className="input-text"
                              value={
                                TemplateObj.serviceDescriptionOneOffHeading
                              }
                              maxLength={150}
                              onChange={(e) => {
                                let input = e.target.value;
                                if (input.startsWith(" ")) {
                                  input = input.trimStart();
                                }
                                setTemplateObj((prev) => ({
                                  ...prev,
                                  serviceDescriptionOneOffHeading: input,
                                }));
                              }}
                            />
                          </div>
                          <div className="col-2">
                            <div className="input-group">
                              <Select
                                className="selectDropDown Drop-down-width"
                                value={Utils.FontSize.filter(
                                  (item) =>
                                    item.value ===
                                    TemplateObj.serviceDescriptionOneOffHeadingFontSize,
                                )}
                                onChange={(e) => {
                                  setTemplateObj((prev) => ({
                                    ...prev,
                                    serviceDescriptionOneOffHeadingFontSize:
                                      e.value,
                                  }));
                                }}
                                options={Utils.FontSize}
                                aria-label="Font"
                                placeholder="Font"
                                menuPlacement="top"
                              />
                            </div>
                          </div>
                          <div className="col-1 d-flex align-items-center justify-content-center">
                            <div className="form-check d-flex align-items-center gap-2 m-0">
                              <input
                                type="checkbox"
                                id="oneOffboldCheckbox"
                                className="form-check-input m-0"
                                checked={
                                  TemplateObj.serviceDescriptionOneOffHeadingFontWeight ===
                                  true
                                }
                                onChange={(e) =>
                                  setTemplateObj((prev) => ({
                                    ...prev,
                                    serviceDescriptionOneOffHeadingFontWeight: e
                                      .target.checked
                                      ? true
                                      : false,
                                  }))
                                }
                              />
                              <label
                                htmlFor="oneOffboldCheckbox"
                                className="form-check-label mb-0"
                              >
                                Bold
                              </label>
                            </div>
                          </div>

                          <div className="col-1 d-flex align-items-center justify-content-center">
                            <div className="form-check d-flex align-items-center gap-2 m-0">
                              <input
                                type="checkbox"
                                id="oneOffitalicCheckbox"
                                className="form-check-input m-0"
                                checked={
                                  TemplateObj.serviceDescriptionOneOffHeadingFontItalic ===
                                  true
                                }
                                onChange={(e) =>
                                  setTemplateObj((prev) => ({
                                    ...prev,
                                    serviceDescriptionOneOffHeadingFontItalic: e
                                      .target.checked
                                      ? true
                                      : false,
                                  }))
                                }
                              />
                              <label
                                htmlFor="oneOffitalicCheckbox"
                                className="form-check-label mb-0"
                              >
                                Italic
                              </label>
                            </div>
                          </div>
                        </div>
                        {/* Service Cat heading */}
                        {/* <div className="row fieldset">
                          <div className="col-2 fieldset-label">
                            <label className="fieldset-label required text-wrap">
                              Service Category Heading
                            </label>
                          </div>
                          <div className="col-5">
                            <input
                              type="text"
                              placeholder="Enter Service Category Heading"
                              className="input-text"
                              value={
                                TemplateObj.serviceDescriptionServiceCatHeading
                              }
                            />
                          </div>
                          <div className="col-2">
                            <div className="input-group">
                              <Select
                                className="selectDropDown Drop-down-width"
                                value={Utils.FontSize.filter(
                                  (item) =>
                                    item.value ===
                                    TemplateObj.serviceDescriptionServiceCatHeadingFontSize
                                )}
                                onChange={(e) => {
                                  setTemplateObj((prev) => ({
                                    ...prev,
                                    serviceDescriptionServiceCatHeadingFontSize:
                                      e.value,
                                  }));
                                }}
                                options={Utils.FontSize}
                                aria-label="Font"
                                placeholder="Font"
                                menuPlacement="top"
                              />
                            </div>
                          </div>
                          <div className="col-1 d-flex align-items-center justify-content-center">
                            <div className="form-check d-flex align-items-center gap-2 m-0">
                              <input
                                type="checkbox"
                                id="catboldCheckbox"
                                className="form-check-input m-0"
                                checked={
                                  TemplateObj.serviceDescriptionServiceCatHeadingFontWeight ===
                                  true
                                }
                                onChange={(e) =>
                                  setTemplateObj((prev) => ({
                                    ...prev,
                                    serviceDescriptionServiceCatHeadingFontWeight:
                                      e.target.checked ? true : false,
                                  }))
                                }
                              />
                              <label
                                htmlFor="catboldCheckbox"
                                className="form-check-label mb-0"
                              >
                                Bold
                              </label>
                            </div>
                          </div>

                          <div className="col-1 d-flex align-items-center justify-content-center">
                            <div className="form-check d-flex align-items-center gap-2 m-0">
                              <input
                                type="checkbox"
                                id="catitalicCheckbox"
                                className="form-check-input m-0"
                                checked={
                                  TemplateObj.serviceDescriptionServiceCatHeadingFontItalic ===
                                  true
                                }
                                onChange={(e) =>
                                  setTemplateObj((prev) => ({
                                    ...prev,
                                    serviceDescriptionServiceCatHeadingFontItalic:
                                      e.target.checked ? true : false,
                                  }))
                                }
                              />
                              <label
                                htmlFor="catitalicCheckbox"
                                className="form-check-label mb-0"
                              >
                                Italic
                              </label>
                            </div>
                          </div>
                        </div> */}
                      </div>
                    );
                    break;
                  case 5:
                  case "5":
                    componentToRender = (
                      <FullPage
                        templateElementList={templateElementList}
                        requireElementTypeErrorMessage={
                          requireElementTypeErrorMessage
                        }
                        setRequireElementTypeErrorMessage={
                          setRequireElementTypeErrorMessage
                        }
                        setTemplateElementList={setTemplateElementList}
                        index={index}
                      />
                    );
                    break;
                  case 6:
                  case "6":
                    componentToRender = null;
                    break;
                  case 7:
                  case "7":
                    componentToRender = null;
                    break;
                  case 8:
                  case "8":
                    // Statment of facts
                    componentToRender = (
                      <div>
                        <div className="row fieldset">
                          <div className="col-2 fieldset-label">
                            <label className="fieldset-label required">
                              Main Heading
                            </label>
                          </div>
                          <div className="col-5">
                            <input
                              type="text"
                              placeholder="Main statement of facts heading"
                              className="input-text"
                              value={TemplateObj.statementOfFactsMainHeading}
                              maxLength={150}
                              onChange={(e) => {
                                let input = e.target.value;
                                if (input.startsWith(" ")) {
                                  input = input.trimStart();
                                }
                                setTemplateObj((prev) => ({
                                  ...prev,
                                  statementOfFactsMainHeading: input,
                                }));
                              }}
                            />
                          </div>
                          <div className="col-2">
                            {/* <input
                              type="text"
                              placeholder="Enter font size"
                              className="input-text"
                              value={
                                TemplateObj.statementOfFactsMainHeadingFontSize
                              }
                            /> */}
                            <div className="input-group">
                              <Select
                                className=" selectDropDown Drop-down-width"
                                value={Utils.FontSize.filter(
                                  (item) =>
                                    item.value ===
                                    TemplateObj.statementOfFactsMainHeadingFontSize,
                                )}
                                onChange={(e) => {
                                  setTemplateObj((prev) => ({
                                    ...prev,
                                    statementOfFactsMainHeadingFontSize:
                                      e.value,
                                  }));
                                }}
                                options={Utils.FontSize}
                                aria-label="Font"
                                placeholder="Font"
                                menuPlacement="top"
                              />
                            </div>
                          </div>
                          <div className="col-1 d-flex align-items-center justify-content-center">
                            <div className="form-check d-flex align-items-center gap-2 m-0">
                              <input
                                type="checkbox"
                                id="mainSOFboldCheckbox"
                                className="form-check-input m-0"
                                checked={
                                  TemplateObj.statementOfFactsMainHeadingFontWeight ===
                                  true
                                }
                                onChange={(e) =>
                                  setTemplateObj((prev) => ({
                                    ...prev,
                                    statementOfFactsMainHeadingFontWeight: e
                                      .target.checked
                                      ? true
                                      : false,
                                  }))
                                }
                              />
                              <label
                                htmlFor="mainSOFboldCheckbox"
                                className="form-check-label mb-0"
                              >
                                Bold
                              </label>
                            </div>
                          </div>

                          <div className="col-1 d-flex align-items-center justify-content-center">
                            <div className="form-check d-flex align-items-center gap-2 m-0">
                              <input
                                type="checkbox"
                                id="mainSOFitalicCheckbox"
                                className="form-check-input m-0"
                                checked={
                                  TemplateObj.statementOfFactsMainHeadingFontItalic ===
                                  true
                                }
                                onChange={(e) =>
                                  setTemplateObj((prev) => ({
                                    ...prev,
                                    statementOfFactsMainHeadingFontItalic: e
                                      .target.checked
                                      ? true
                                      : false,
                                  }))
                                }
                              />
                              <label
                                htmlFor="mainSOFitalicCheckbox"
                                className="form-check-label mb-0"
                              >
                                Italic
                              </label>
                            </div>
                          </div>
                        </div>
                        {/* Recurring / On-going services heading */}
                        <div className="row fieldset">
                          <div className="col-2 fieldset-label">
                            <label className="fieldset-label required text-wrap">
                              Recurring/On-going Heading
                            </label>
                          </div>
                          <div className="col-5">
                            <input
                              type="text"
                              placeholder="Enter Recurring/On-going Heading"
                              className="input-text"
                              value={
                                TemplateObj.statementOfFactsRecurringHeading
                              }
                              maxLength={150}
                              onChange={(e) => {
                                let input = e.target.value;
                                if (input.startsWith(" ")) {
                                  input = input.trimStart();
                                }
                                setTemplateObj((prev) => ({
                                  ...prev,
                                  statementOfFactsRecurringHeading: input,
                                }));
                              }}
                            />
                          </div>
                          <div className="col-2">
                            {/* <input
                              type="text"
                              placeholder="Enter font size"
                              className="input-text"
                              value={
                                TemplateObj.statementOfFactsMainHeadingFontSize
                              }
                            /> */}
                            <div className="input-group">
                              <Select
                                className=" selectDropDown Drop-down-width"
                                value={Utils.FontSize.filter(
                                  (item) =>
                                    item.value ===
                                    TemplateObj.statementOfFactsRecurringHeadingFontSize,
                                )}
                                onChange={(e) => {
                                  setTemplateObj((prev) => ({
                                    ...prev,
                                    statementOfFactsRecurringHeadingFontSize:
                                      e.value,
                                  }));
                                }}
                                options={Utils.FontSize}
                                aria-label="Font"
                                placeholder="Font"
                                menuPlacement="top"
                              />
                            </div>
                          </div>
                          <div className="col-1 d-flex align-items-center justify-content-center">
                            <div className="form-check d-flex align-items-center gap-2 m-0">
                              <input
                                type="checkbox"
                                id="recurringSOFboldCheckbox"
                                className="form-check-input m-0"
                                checked={
                                  TemplateObj.statementOfFactsRecurringHeadingFontWeight ===
                                  true
                                }
                                onChange={(e) =>
                                  setTemplateObj((prev) => ({
                                    ...prev,
                                    statementOfFactsRecurringHeadingFontWeight:
                                      e.target.checked ? true : false,
                                  }))
                                }
                              />
                              <label
                                htmlFor="recurringSOFboldCheckbox"
                                className="form-check-label mb-0"
                              >
                                Bold
                              </label>
                            </div>
                          </div>

                          <div className="col-1 d-flex align-items-center justify-content-center">
                            <div className="form-check d-flex align-items-center gap-2 m-0">
                              <input
                                type="checkbox"
                                id="recurringSOFitalicCheckbox"
                                className="form-check-input m-0"
                                checked={
                                  TemplateObj.statementOfFactsRecurringHeadingFontItalic ===
                                  true
                                }
                                onChange={(e) =>
                                  setTemplateObj((prev) => ({
                                    ...prev,
                                    statementOfFactsRecurringHeadingFontItalic:
                                      e.target.checked ? true : false,
                                  }))
                                }
                              />
                              <label
                                htmlFor="recurringSOFitalicCheckbox"
                                className="form-check-label mb-0"
                              >
                                Italic
                              </label>
                            </div>
                          </div>
                        </div>
                        {/* One-Off/Ad hoc Services heading */}
                        <div className="row fieldset">
                          <div className="col-2 fieldset-label">
                            <label className="fieldset-label required text-wrap">
                              One-Off/Ad hoc Heading
                            </label>
                          </div>
                          <div className="col-5">
                            <input
                              type="text"
                              placeholder="Enter One-Off/Ad hoc Heading"
                              className="input-text"
                              value={TemplateObj.statementOfFactsOneOffHeading}
                              maxLength={150}
                              onChange={(e) => {
                                let input = e.target.value;
                                if (input.startsWith(" ")) {
                                  input = input.trimStart();
                                }
                                setTemplateObj((prev) => ({
                                  ...prev,
                                  statementOfFactsOneOffHeading: input,
                                }));
                              }}
                            />
                          </div>
                          <div className="col-2">
                            <div className="input-group">
                              <Select
                                className="selectDropDown Drop-down-width"
                                value={Utils.FontSize.filter(
                                  (item) =>
                                    item.value ===
                                    TemplateObj.statementOfFactsOneOffHeadingFontSize,
                                )}
                                onChange={(e) => {
                                  setTemplateObj((prev) => ({
                                    ...prev,
                                    statementOfFactsOneOffHeadingFontSize:
                                      e.value,
                                  }));
                                }}
                                options={Utils.FontSize}
                                aria-label="Font"
                                placeholder="Font"
                                menuPlacement="top"
                              />
                            </div>
                          </div>
                          <div className="col-1 d-flex align-items-center justify-content-center">
                            <div className="form-check d-flex align-items-center gap-2 m-0">
                              <input
                                type="checkbox"
                                id="oneOffSOFboldCheckbox"
                                className="form-check-input m-0"
                                checked={
                                  TemplateObj.statementOfFactsOneOffHeadingFontWeight ===
                                  true
                                }
                                onChange={(e) =>
                                  setTemplateObj((prev) => ({
                                    ...prev,
                                    statementOfFactsOneOffHeadingFontWeight: e
                                      .target.checked
                                      ? true
                                      : false,
                                  }))
                                }
                              />
                              <label
                                htmlFor="oneOffSOFboldCheckbox"
                                className="form-check-label mb-0"
                              >
                                Bold
                              </label>
                            </div>
                          </div>

                          <div className="col-1 d-flex align-items-center justify-content-center">
                            <div className="form-check d-flex align-items-center gap-2 m-0">
                              <input
                                type="checkbox"
                                id="oneOffSOFitalicCheckbox"
                                className="form-check-input m-0"
                                checked={
                                  TemplateObj.statementOfFactsOneOffHeadingFontItalic ===
                                  true
                                }
                                onChange={(e) =>
                                  setTemplateObj((prev) => ({
                                    ...prev,
                                    statementOfFactsOneOffHeadingFontItalic: e
                                      .target.checked
                                      ? true
                                      : false,
                                  }))
                                }
                              />
                              <label
                                htmlFor="oneOffSOFitalicCheckbox"
                                className="form-check-label mb-0"
                              >
                                Italic
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                    break;
                  case 9:
                  case "9":
                    // let componentToRender = null;

                    if (modelAction === "Add") {
                      componentToRender = (
                        <>
                          <div className="row fieldset">
                            <div className="col-md-2">
                              <label className="fieldset-label required">
                                Select PDF{" "}
                                <span className="text-danger">*</span>
                              </label>
                            </div>
                            <div className="col-md-10">
                              <div className="input-group">
                                <Select
                                  className="user-role-select"
                                  options={TemplatePdfLookupListList.map(
                                    (item) => ({
                                      value: item.templatePDFKeyID,
                                      label: item.templatePDFTitle,
                                    }),
                                  )}
                                  getOptionLabel={(option) => option.label}
                                  getOptionValue={(option) => option.value}
                                  value={templateElementList.headings}
                                  onChange={(selectedOption) =>
                                    handlePdfSelect(selectedOption, index)
                                  }
                                />
                              </div>
                              {requireElementTypeErrorMessage.headings &&
                              (templateElementList[index]?.headings === "" ||
                                templateElementList[index]?.headings === null ||
                                templateElementList[index]?.headings ===
                                  undefined) ? (
                                <label className="validation">
                                  {ERROR_MESSAGES}
                                </label>
                              ) : (
                                ""
                              )}
                            </div>
                          </div>
                        </>
                      );
                    }

                    if (modelAction === "Update") {
                      const selectedPdf = TemplatePdfLookupListList.find(
                        (item) =>
                          item.templatePDFKeyID ===
                          templateElementList[index].headings,
                      );
                      componentToRender = (
                        <>
                          <div className="row fieldset">
                            <div className="col-md-2">
                              <label className="fieldset-label required">
                                Select PDF{" "}
                                <span className="text-danger">*</span>
                              </label>
                            </div>
                            <div className="col-md-10">
                              <div className="input-group">
                                <Select
                                  className="user-role-select"
                                  options={TemplatePdfLookupListList.map(
                                    (item) => ({
                                      value: item.templatePDFKeyID,
                                      label: item.templatePDFTitle,
                                    }),
                                  )}
                                  getOptionLabel={(option) => option.label}
                                  getOptionValue={(option) => option.value}
                                  value={
                                    selectedPdf
                                      ? {
                                          label: selectedPdf.templatePDFTitle,
                                          value: selectedPdf.templatePDFKeyID,
                                        }
                                      : null
                                  }
                                  onChange={(selectedOption) =>
                                    handlePdfSelect(selectedOption, index)
                                  }
                                />
                              </div>
                              {requireElementTypeErrorMessage.headings &&
                              (templateElementList[index]?.headings === "" ||
                                templateElementList[index]?.headings === null ||
                                templateElementList[index]?.headings ===
                                  undefined) ? (
                                <label className="validation">
                                  {ERROR_MESSAGES}
                                </label>
                              ) : (
                                ""
                              )}
                            </div>
                          </div>
                        </>
                      );
                    }

                    break;
                  case 10:
                  case "10":
                    componentToRender = (
                      <First_Page
                        templateElementList={templateElementList}
                        requireElementTypeErrorMessage={
                          requireElementTypeErrorMessage
                        }
                        TemplateObj={TemplateObj}
                        setTemplateObj={setTemplateObj}
                        setRequireElementTypeErrorMessage={
                          setRequireElementTypeErrorMessage
                        }
                        setTemplateElementList={setTemplateElementList}
                        index={index}
                        modelAction={modelAction}
                        moduleName={moduleName}
                      />
                    );
                    // let outputString;

                    // switch (FirstPageHeading) {
                    //   case 1:
                    //     outputString = "Proposal For";
                    //     break;
                    //   case 2:
                    //     outputString = `Engagement Letter for`;
                    //     break;
                    //   default:
                    //     outputString = "Default case";
                    //     break;
                    // }
                    // const firstPageHTML = `
                    //   <p style="text-align: center;   color: #00BFFF;">
                    //     <span  style="color: #00BFFF; margin-top: 15px; font-size: 50px;" class="OrgBrandColor">${outputString}</span><br>

                    //   </p>
                    //   <p style="page-break-after: always;"></p>
                    // `;

                    // const FirstPage = true;
                    // componentToRender = (
                    //   <>
                    //     {modelAction === "Update" && (
                    //       <TextBlock
                    //         templateElementList={templateElementList}
                    //         requireElementTypeErrorMessage={
                    //           requireElementTypeErrorMessage
                    //         }
                    //         setRequireElementTypeErrorMessage={
                    //           setRequireElementTypeErrorMessage
                    //         }
                    //         setTemplateElementList={setTemplateElementList}
                    //         index={index}
                    //         content={firstPageHTML}
                    //         modelAction={modelAction}
                    //         moduleName={moduleName}
                    //       />
                    //     )}
                    //     {modelAction === "Add" && (
                    //       <TextBlock
                    //         templateElementList={templateElementList}
                    //         requireElementTypeErrorMessage={
                    //           requireElementTypeErrorMessage
                    //         }
                    //         setRequireElementTypeErrorMessage={
                    //           setRequireElementTypeErrorMessage
                    //         }
                    //         setTemplateElementList={setTemplateElementList}
                    //         index={index}
                    //         content={firstPageHTML}
                    //         FirstPage={FirstPage}
                    //         modelAction={modelAction}
                    //         moduleName={moduleName}
                    //       />
                    //     )}
                    <div id="FirstPage">
                      {requireElementTypeErrorMessage.RequireFirstPageBlock ? (
                        <label className="validation">
                          First page should be at top position
                        </label>
                      ) : (
                        ""
                      )}
                    </div>;
                    //   </>
                    // );
                    break;

                  default:
                    componentToRender = null;
                    break;
                }
                return (
                  <div
                    id={`ElementDiv_${templateElementList[index]?.templateElementTypeID}`}
                    className="element-block"
                    style={{ opacity: "1" }}
                    draggable="true"
                    onDragStart={(e) => {
                      e.dataTransfer.setData("index", index);
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      const sourceIndex = e.dataTransfer.getData("index");
                      const targetIndex = index;
                      setRequireElementTypeErrorMessage({
                        ...requireElementTypeErrorMessage,
                        RequireFirstPageBlock: true,
                      });
                      if (
                        templateElementList[templateElementList.length - 1]
                          ?.templateElementTypeID === null
                      ) {
                        if (
                          sourceIndex == templateElementList.length - 1 ||
                          targetIndex == templateElementList.length - 1
                        ) {
                          return;
                        }
                      }
                      if (templateElementList[0].templateElementTypeID === 10) {
                        if (
                          targetIndex == 0 ||
                          `${templateElementList[index]?.templateElementTypeID}` ===
                            10 ||
                          sourceIndex == 0
                        ) {
                          return;
                        }
                      }

                      // Rearrange the templateElementList based on the drag-and-drop
                      if (sourceIndex !== targetIndex) {
                        const updatedList = [...templateElementList];
                        const [draggedItem] = updatedList.splice(
                          sourceIndex,
                          1,
                        );
                        updatedList.splice(targetIndex, 0, draggedItem);

                        setTemplateElementList(updatedList);
                      }
                    }}
                    key={index}
                  >
                    <button
                      onClick={() => DeleteBtnClicked(index)}
                      className="btn btn-sm btn-danger delete-element-btn"
                    >
                      <i className="ion ion-md-trash mr-1"></i>Delete Element
                    </button>

                    <div className="element">
                      <div className="row fieldset">
                        <div className="col-md-2">
                          <label className="fieldset-label required">
                            Element Type <span className="text-danger">*</span>
                          </label>
                        </div>
                        <div className="col-md-10">
                          <div className="input-group">
                            <Select
                              className="user-role-select"
                              options={TemplateElementLookeupListOptions.filter(
                                (item) =>
                                  item.value !== 10 ||
                                  templateElementList.every(
                                    (element) =>
                                      element.templateElementTypeID !== 10,
                                  ),
                              )}
                              value={
                                ElementTypeValue[index] === undefined
                                  ? null
                                  : ElementTypeValue[index]
                              }
                              onChange={(e) => {
                                setRequireElementTypeErrorMessage(false);
                                OnTemplateChange(
                                  index,
                                  "templateElementTypeID",
                                  e.value,
                                );
                              }}
                              menuPlacement="top"
                            />
                          </div>

                          {requireElementTypeErrorMessage.templateElementTypeIDRequire &&
                          (templateElementList[index].templateElementTypeID ===
                            "" ||
                            templateElementList[index].templateElementTypeID ===
                              null) ? (
                            <label className="validation">
                              {ERROR_MESSAGES}
                            </label>
                          ) : (
                            ""
                          )}
                        </div>
                      </div>
                      <div>{componentToRender}</div>
                    </div>
                  </div>
                );
              })}
              <span id="AddElementDiv"></span>
              {/* {(TemplateObj.templateTypeID == 1 ||
                TemplateObj.templateTypeID == 2) && (
                  <>
                    {" "}
                    <hr />
                    <div
                      className="element-block add-element-block"
                      id="AddElementDiv"
                    >
                      <a
                        onClick={AddElementBtnClicked}
                        className="add-element-icon"
                        title="Add Element"
                      >
                        <i className="ion ion-md-add">+</i>
                      </a>
                    </div>
                    {requireElementLengthErrorMessage &&
                      templateElementList.length === 0 ? (
                      <label className="validation">{ERROR_MESSAGES}</label>
                    ) : (
                      ""
                    )}
                  </>
                )} */}
              <label
                className="validation"
                style={{
                  fontSize: "15px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {common.professionTypeLists?.length <= 1 &&
                errorMessage?.includes(
                  `Please don't choose this profession type`,
                )
                  ? errorMessage.split(".")[0]
                  : errorMessage}
                {SignataryBlock.length === 0 &&
                  TemplateObj.templateTypeID === 2 &&
                  requireElementTypeErrorMessage.RequireSignataryBlock && (
                    <div id="SignatoriesBlockDiv">
                      At least 1 Signatory Block is required for{" "}
                      {EngagementName} template.
                    </div>
                  )}
              </label>
            </div>

            <hr />
            <Row className="modal-footer">
              <p className="text-danger">
                Note - Selected PDF size should be less than 20MB.
              </p>
              <Col
                style={{ paddingTop: "14px" }}
                className="hstack gap-2 justify-content-end"
              >
                {(TemplateObj.templateTypeID == 1 ||
                  TemplateObj.templateTypeID == 2) && (
                  <>
                    {/* {" "}
                    <hr />
                    <div
                      className="element-block add-element-block"
                      id="AddElementDiv"
                    >
                      <a
                        onClick={AddElementBtnClicked}
                        className="add-element-icon"
                        title="Add Element"
                      >
                        <i className="ion ion-md-add">+</i>
                      </a>
                    </div>
                    {requireElementLengthErrorMessage &&
                      templateElementList.length === 0 ? (
                      <label className="validation">{ERROR_MESSAGES}</label>
                    ) : (
                      ""
                    )} */}

                    {requireElementLengthErrorMessage &&
                    templateElementList.length === 0 ? (
                      <label className="validation">
                        At least one element is required.
                      </label>
                    ) : (
                      ""
                    )}
                    <button
                      onClick={AddElementBtnClicked}
                      style={{ float: "right", paddingTop: "5px" }}
                      className="btn btn-md btn-success create-item-btn"
                    >
                      <span>Add Element</span>
                    </button>
                  </>
                )}
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
      <SuccessModal
        handleClose={handleClose}
        setIsCheck={setIsCheck}
        isCheck={isCheck}
        setDismissModal={setDismissModal}
        setOpenSuccessModal={setOpenSuccessModal}
        openSuccessModal={openSuccessModal}
        modelAction={modelAction}
        message={`${moduleName} ${TemplateObj.templateName}`}
      />
      <AcceptSuperAdminChangesConfirmation
        openErrorModal={openErrorModal}
        ModelId={props.id}
        Status={Status}
        openSuccessModal={openSuccessModal}
        modelRequestData={location.state}
        UpdatedChanges={handleConfirmButton}
      />
      <ErrorModel
        ErrorModel={openErrorModal}
        handleClose={handleClose}
        ErrorMessage={errorMessage}
      />
    </div>
  );
}

export default Add_New_Templates;
