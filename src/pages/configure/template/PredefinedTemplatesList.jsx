/* global $ */
import React, { useContext, useEffect, useState } from "react";
import "./template.css";
import "./template-list-redesign.css";
import { useNavigate, useLocation } from "react-router";
import CommonButtonComponent from "../../../components/CommonButtonComponent";
import ConfirmModel from "../../../components/ConfirmationBox";
import {
  DeleteTemplate,
  GetTemplateList,
  EmailTemplatesChangeStatus,
  GetChangeIsDefaultStatus,
  GetTemplatePdfList,
  DeleteTemplatePdf,
  TemplatesPdfChangeStatus,
  GetTemplateLookupPDFList,
  GetTemplateModel,
  GetTemplatePdfModel,
  GetTemplateHeaderFooterList,
  GetTemplateHeaderFooterModel,
  DeleteTemplateHeaderFooter,
  TemplateHeaderFooterChangeStatus,
  AddUpdateTemplateHeaderFooter,
  CopyTemplate,
  CopyTemplatePdf,
} from "../../../redux/Services/Config/TemplateApi";
import PaginationComponent from "../../../components/PaginationModel";
import { useDispatch, useSelector } from "react-redux";
import Android12Switch from "../../../components/AndroidSwitch";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import { AuthContextProvider } from "../../../AuthContext/AuthContext";
import FilterModel from "../../../components/FilterModel";
import Tooltip, { tooltipClasses } from "@mui/material/Tooltip";
import NoResultFoundModel from "../../../components/NoResultFoundModel";

import SuccessModal from "../../../components/SuccessModal";
import ErrorModel from "../../../components/ErrorModel";
import Footer from "../../../components/Footer";
import { USER_ROLE_TYPE } from "../../../Middleware/enums";
import { updateState } from "../../../redux/Persist";

import { GetInviteUsersList } from "../../../redux/Services/Setting/InviteUserApi";
import RecordsAvailablePopupModel from "../../../components/RecordsAvailablePopupModel";
import { Funnel } from "lucide-react";
import PdfFileIcon from "../../../components/PdfFileIcon";
function Predefined_Templates() {
  //A]Declare state
  const moduleName = "Template";
  const moduleNameForTemplatePdf = "Template PDF/EXCEL";
  const moduleNameForHeaderFooter = "Header and Footer";
  let getTemplateListApiCallCount = 0;
  const common = useSelector((state) => state.Storage); //Getting Logged Users Details From Persist Storage of redux hooks
  const [showProfessionType, setShowProfessionType] = useState(
    common.organisationKeyID === null || common.professionTypeLists.length > 1,
  );
  const [isFilterApply, setIsFilterApply] = useState(false);
  const [selectedTemplateType, setSelectedTemplateType] = useState(null);

  const [prospectType, setProspectType] = useState(null);

  const navigate = useNavigate();
  const [businessNatureID, setBusinessNatureID] = useState(null);
  const [businessTypeID, setBusinessTypeID] = useState(null);
  const [openSuccessModal, setOpenSuccessModal] = React.useState(false);
  const [shouldFetch, setShouldFetch] = useState(false);
  const {
    setTopbar,
    prospectName,
    setLoader,
    EngagementName,
    proposalName,
    maxCountToRecallApi,
    totalPage,
    isMobile,
    setListCount,
    listCount,
    desktopRecords,
    isMobileRecords,
    getCrudButtonTextName,
    getPlaceholderTextName,
    getCrudButtonToolTipName,
    userAccessData,
    handleErrorMessage,
  } = useContext(AuthContextProvider);
  const [activeTab, setActiveTab] = useState("Templates");
  const [TemplateList, setTemplateList] = useState([]);
  const [TemplatePdfList, setTemplatePdfList] = useState([]);
  const [TemplateHeaderFooterList, setTemplateHeaderFooterList] = useState([]);
  const location = useLocation();
  const [errorMessage, setErrorMessage] = useState("");
  const [isAddUpdateActionDone, setIsAddUpdateActionDone] = useState(false);
  const [currentPage, setCurrentPage] = useState(
    common.currentPage === "" ? 1 : common.currentPage,
  );
  const [searchKeywordForPDF, setSearchKeywordForPDF] = useState("");
  const [currentPageUsers, setCurrentPageUsers] = useState(1);
  const [totalRecords, setTotalRecords] = useState(-1);
  const [pdfListCount, setPdfListCount] = useState([]);
  const [HeaderFooterListCount, setHeaderFooterListCount] = useState([]);
  const totalPdfPage = Math.ceil(pdfListCount / 10);
  const [openErrorModal, setOpenErrorModal] = useState(false);
  const [modelRequestData, setModelRequestData] = useState({
    professionTypeNames: null,
    BusinessTypeName: null,
    TemplateID: null,
    templateName: null,
    templateKeyID: null,
    status: null,
    isDefault: null,
    StatusType: null,
    Action: "",
    userKeyID: null,
    templatePdfKeyID: null,
    hfTemplateKeyID: null,
  });
  const [sortType, setSortType] = useState(null);

  const [primarySortDirection, setPrimarySortDirection] = useState(null);
  const [primarySortDirectionObj, setPrimarySortDirectionObj] = useState({
    templateNameSort: null,
    TemplateTypeSort: null,
    BusinessType: null,
    ProspectBusinessType: null,
    ProfessionType: null,
    templatePdfListSort: null,
    hfTemplateName: null,
    hfProfessionType: null,
    hfTemplateType: null,
  });
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchKeywordHF, setSearchKeywordHF] = useState("");
  const pageSize = isMobile ? isMobileRecords : desktopRecords;
  const isCurrentPage =
    common.currentPage === "" ? currentPage : common.currentPage;
  const formattedErrorMessage = handleErrorMessage(errorMessage);
  const dispatch = useDispatch();
  // B] Initial useEffect :
  // 1) Will Call Initial Api Like List Api
  useEffect(() => {
    setTopbar("block");
    GetTemplateListData(isCurrentPage);

    dispatch(
      updateState({
        currentPage: "",
      }),
    );
  }, [pageSize]);
  const ClearFilter = () => {
    setIsFilterApply(false);
    setBusinessNatureID(null);
    setShouldFetch(true);
    setSelectedTemplateType(null);
    setBusinessTypeID(null);
    setProspectType(null);
    GetTemplateListData(
      1,
      searchKeyword,
      primarySortDirection,
      sortType,
      null,
      null,
      null,
    );
  };
  //2) This useEffect will trigger when we successfully add or update record from popup model
  useEffect(() => {
    if (isAddUpdateActionDone) {
      if (modelRequestData.Action === null) {
        setSearchKeyword("");
        setPrimarySortDirection(null);
        setCurrentPage(1);
        setSearchKeywordForPDF("");
        GetTemplateListData(isCurrentPage, null, null);
      } else {
        GetTemplateListData(isCurrentPage);
      }
      setIsAddUpdateActionDone(false);
    }
  }, [isAddUpdateActionDone]);
  useEffect(() => {
    // Check if the location state is "Templates PDF"
    if (location.state === "Templates PDF") {
      // Do something when the state is "Templates PDF"
      setActiveTab("Templates PDF");
      GetTemplatePdfListData(1, null, null, null);
    }
  }, [location.state]);

  useEffect(() => {
    // Check if the location state is "Templates PDF"
    if (location.state === "Header and Footer") {
      // console.log("Header and Footer");
      // Do something when the state is "Templates PDF"
      setActiveTab("Header and Footer");
      GetTemplateHFListData(1, null, null, null);
    }
  }, [location.state]);
  useEffect(() => {
    if (
      modelRequestData.TemplateID !== null &&
      modelRequestData.templateKeyID !== null
    ) {
      setTopbar("none");

      navigate("/add-template", { state: modelRequestData });
    } else {
      GetTemplateListData(isCurrentPage);
    }
  }, [modelRequestData.TemplateID]);

  const HandlePageChangeUsers = async (pageNumber) => {
    setCurrentPageUsers(pageNumber);
    await GetTemplatePdfListData(pageNumber); // Call your function with the selected page number
  };
  // C] Calling All Api's like List and other Here :
  // 1) Get Template List Data
  const GetTemplateListData = async (
    i,
    searchKeywordValue,
    sortValue,
    TemplateSort,
    templateTypeID,
    clientBusinessTypeID,
    businessTypeId,
  ) => {
    setLoader(true);
    const pageNoList = i - 1;
    try {
      const data = await GetTemplateList({
        pageSize: Number(pageSize),
        pageNo: pageNoList,
        organisationID: common.organisationID,
        organisationKeyID: common.organisationKeyID,
        SearchKeyword:
          searchKeywordValue === undefined ? searchKeyword : searchKeywordValue,
        primarySortDirection:
          sortValue === undefined ? primarySortDirection : sortValue,
        PrimarySortColumnName: sortType == "" ? TemplateSort : sortType,
        templateTypeID:
          templateTypeID === undefined ? selectedTemplateType : templateTypeID,
        clientBusinessTypeID:
          clientBusinessTypeID === undefined
            ? prospectType
            : clientBusinessTypeID,
        businessTypeID:
          businessTypeId === undefined ? businessTypeID : businessTypeId,
      });
      if (data) {
        if (data?.data?.statusCode === 200) {
          setLoader(false);
          getTemplateListApiCallCount = 0;
          if (data?.data?.responseData?.data) {
            const totalCount = data.data.totalCount;
            const TemplateListData = data.data.responseData.data;
            if (pageNoList > 0 && TemplateListData.length === 0) {
              let newPaneNo = Number(pageNoList);
              if (newPaneNo > 1) {
                newPaneNo = newPaneNo - 1;
              }
              GetTemplateListData(
                newPaneNo,
                searchKeywordValue,
                sortValue,
                TemplateSort,
              );
              setCurrentPage(pageNoList);
              return;
            }
            setListCount(totalCount);
            setTemplateList(TemplateListData);
            setTotalRecords(TemplateListData.length);
          }
        } else {
          if (getTemplateListApiCallCount < maxCountToRecallApi) {
            getTemplateListApiCallCount += 1;
            setTimeout(function () {
              GetTemplateListData(
                i,
                searchKeywordValue,
                sortValue,
                TemplateSort,
              );
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

  const CopyTemplateData = async () => {
    if (!common.userKeyID) return;
    try {
      setLoader(true);
      const data = await CopyTemplate(
        modelRequestData.templateKeyID,
        common.userKeyID,
      );
      if (data?.data?.statusCode) {
        setLoader(false);
        $("#" + "ConfirmModel").one("hidden.bs.modal", () => {
          setOpenSuccessModal(true);
        });
        $("#" + "ConfirmModel").modal("hide");
        GetTemplateListData(isCurrentPage);
      } else {
        setLoader(false);
        setErrorMessage(data?.data?.errorMessage);
        setOpenErrorModal(true);
      }
    } catch (error) {
      console.error(error);
    }
  };
  // Copy Template Data
  const CopyTemplatePdfData = async () => {
    if (!common.userKeyID) return;
    try {
      setLoader(true);
      const data = await CopyTemplatePdf(
        modelRequestData.templatePdfKeyID,
        common.userKeyID,
      );
      if (data?.data?.statusCode) {
        setLoader(false);
        $("#" + "ConfirmModel").one("hidden.bs.modal", () => {
          setOpenSuccessModal(true);
        });
        $("#" + "ConfirmModel").modal("hide");
        GetTemplatePdfListData(isCurrentPage);
      } else {
        setLoader(false);
        setErrorMessage(data?.data?.errorMessage);
        setOpenErrorModal(true);
      }
    } catch (error) {
      console.error(error);
    }
  };
  const ApplyFilter = () => {
    if (
      (selectedTemplateType !== null && selectedTemplateType !== "") ||
      (prospectType !== null && prospectType !== "") ||
      (businessTypeID !== null && businessTypeID !== "")
    ) {
      setIsFilterApply(true);
    } else {
      setIsFilterApply(false);
    }
    GetTemplateListData(
      1,
      searchKeyword,
      primarySortDirection,
      sortType,
      selectedTemplateType,
      prospectType,
      businessTypeID,
    );
  };

  const GetTemplateHFListData = async (
    i,
    searchKeywordHF,
    sortValue,
    TemplateSort,
  ) => {
    setLoader(true);
    const pageNoList = i - 1;
    try {
      const data = await GetTemplateHeaderFooterList({
        pageSize: 10,
        pageNo: pageNoList,
        SearchKeyword:
          searchKeywordHF === undefined ? searchKeywordHF : searchKeywordHF,
        userKeyID: common.userKeyID || null,
        organisationKeyID: common.organisationKeyID,
        primarySortDirection:
          sortValue === undefined ? primarySortDirection : sortValue,
        PrimarySortColumnName: sortType == "" ? TemplateSort : sortType,
      });
      if (data) {
        if (data?.data?.statusCode === 200) {
          setLoader(false);
          getTemplateListApiCallCount = 0;
          if (data?.data?.responseData?.data) {
            const totalCount = data.data.totalCount;
            const TemplateListData = data.data.responseData.data;
            if (pageNoList > 0 && TemplateListData.length === 0) {
              let newPaneNo = Number(pageNoList);
              if (newPaneNo > 1) {
                newPaneNo = newPaneNo - 1;
              }
              GetTemplateHFListData(
                newPaneNo,
                searchKeywordHF,
                sortValue,
                TemplateSort,
              );
              setCurrentPageUsers(pageNoList);
              return;
            }
            setHeaderFooterListCount(totalCount);
            setTemplateHeaderFooterList(TemplateListData);
            setTotalRecords(TemplateListData.length);
          }
        } else {
          if (getTemplateListApiCallCount < maxCountToRecallApi) {
            getTemplateListApiCallCount += 1;
            setTimeout(function () {
              GetTemplateHFListData(
                i,
                searchKeywordHF,
                sortValue,
                TemplateSort,
              );
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

  const GetTemplatePdfListData = async (
    i,
    searchKeywordForPDF,
    sortValue,
    TemplateSort,
  ) => {
    setLoader(true);
    const pageNoList = i - 1;
    try {
      const data = await GetTemplatePdfList({
        pageSize: 10,
        pageNo: pageNoList,
        SearchKeyword:
          searchKeywordForPDF === undefined
            ? searchKeywordForPDF
            : searchKeywordForPDF,
        userKeyID: common.userKeyID || null,
        organisationKeyID: common.organisationKeyID || null,
        primarySortDirection:
          sortValue === undefined ? primarySortDirection : sortValue,
        PrimarySortColumnName: sortType == "" ? TemplateSort : sortType,
      });
      if (data) {
        if (data?.data?.statusCode === 200) {
          setLoader(false);
          getTemplateListApiCallCount = 0;
          if (data?.data?.responseData?.data) {
            const totalCount = data.data.totalCount;
            const TemplateListData = data.data.responseData.data;
            if (pageNoList > 0 && TemplateListData.length === 0) {
              let newPaneNo = Number(pageNoList);
              if (newPaneNo > 1) {
                newPaneNo = newPaneNo - 1;
              }
              GetTemplatePdfListData(
                newPaneNo,
                searchKeywordForPDF,
                sortValue,
                TemplateSort,
              );
              setCurrentPageUsers(pageNoList);
              return;
            }
            setPdfListCount(totalCount);
            setTemplatePdfList(TemplateListData);
            setTotalRecords(TemplateListData.length);
          }
        } else {
          if (getTemplateListApiCallCount < maxCountToRecallApi) {
            getTemplateListApiCallCount += 1;
            setTimeout(function () {
              GetTemplatePdfListData(
                i,
                searchKeywordForPDF,
                sortValue,
                TemplateSort,
              );
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
  // Update Function Modal
  // 2) On Click Template Status Button
  const TemplateChangeStatusDataAndDeleteData = async () => {
    setLoader(true);
    if (modelRequestData.Action === "Status") {
      if (modelRequestData.StatusType === null) {
        try {
          const Data = await EmailTemplatesChangeStatus(
            modelRequestData.templateKeyID,
            modelRequestData.userKeyID,
          );
          if (Data) {
            setLoader(false);
            if (Data?.data?.statusCode === 200) {
              if (
                Data?.data?.responseData.templateExistsInModule.length !== 0
              ) {
                const servicePackageNames =
                  Data?.data?.responseData.templateExistsInModule.flatMap(
                    (item) =>
                      item.recordList.map((templateName) => templateName.name),
                  );
                const moduleNames =
                  Data?.data?.responseData.templateExistsInModule
                    .map((item) => item.moduleName)
                    .join(", ");

                setModelRequestData({
                  ...modelRequestData,
                  Action: "TemplateWarning",
                  message: `Following ${moduleNames} are assigned to the selected ${moduleName}.You must remove the ${moduleNames} from this ${moduleName} before attempting to mark it as InActive.`,
                  ServiceName: servicePackageNames,
                });
                $("#" + "ConfirmModel").modal("hide");
                $("#" + "RecordsAvailablePopupModel").modal("show");
                // GetTemplateListData(currentPage);
              } else {
                GetTemplateListData(currentPage);
                $("#" + "ConfirmModel").one("hidden.bs.modal", () => {
                  setOpenSuccessModal(true);
                });
                $("#" + "ConfirmModel").modal("hide");
              }
            } else {
              let ErrorMessage = Data?.response?.data?.errorMessage;
              if (
                ErrorMessage.includes(
                  "At least one template should be defaulted.",
                ) &&
                common.organisationKeyID === null
              ) {
                setErrorMessage(
                  ` Status cannot be changed to InActive. This template is marked as default for profession type ${modelRequestData.professionTypeNames} and business type ${modelRequestData.BusinessTypeName}.`,
                );
                setOpenErrorModal(true);
              } else if (
                ErrorMessage.includes(
                  "At least one template should be defaulted.",
                ) &&
                showProfessionType &&
                common.organisationKeyID !== null
              ) {
                setErrorMessage(
                  ` Status cannot be changed to InActive. This template is marked as default for profession type  ${modelRequestData.professionTypeNames}.`,
                );
                setOpenErrorModal(true);
              } else if (
                ErrorMessage.includes(
                  "At least one template should be defaulted.",
                )
              ) {
                setErrorMessage(
                  ` Status cannot be changed to InActive. This template is marked as default.`,
                );
                setOpenErrorModal(true);
              } else {
                setErrorMessage(Data?.response?.data?.errorMessage);
                setOpenErrorModal(true);
              }
            }
            GetTemplateListData(isCurrentPage);
          }
        } catch (error) {
          console.log(error);
        }
      } else if (modelRequestData.StatusType === "IsDefault") {
        try {
          const Data = await GetChangeIsDefaultStatus(
            common.organisationKeyID,
            modelRequestData.templateKeyID,
            modelRequestData.isDefault,
            common.userKeyID,
          );
          if (Data) {
            setLoader(false);
            if (Data?.data?.statusCode === 200) {
              $("#" + "ConfirmModel").one("hidden.bs.modal", () => {
                setOpenSuccessModal(true);
              });
              $("#" + "ConfirmModel").modal("hide");
            } else {
              let ErrorMessage = Data?.response?.data?.errorMessage;
              if (
                ErrorMessage.includes(
                  "At least one template should be defaulted.",
                ) &&
                common.organisationKeyID === null
              ) {
                setErrorMessage(
                  `This template is the only template of profession type ${modelRequestData.professionTypeNames} and business type ${modelRequestData.BusinessTypeName}  marked as default. At least one template must be defaulted.`,
                );
                setOpenErrorModal(true);
              } else if (
                ErrorMessage.includes(
                  "At least one template should be defaulted.",
                ) &&
                showProfessionType &&
                common.organisationKeyID !== null
              ) {
                setErrorMessage(
                  `This template is the only template of profession type ${modelRequestData.professionTypeNames} marked as default. At least one template must be defaulted.`,
                );
                setOpenErrorModal(true);
              } else if (
                ErrorMessage.includes(
                  "At least one template should be defaulted.",
                )
              ) {
                setErrorMessage(
                  `This template is the only template  marked as default. At least one template must be defaulted.`,
                );
                setOpenErrorModal(true);
              } else {
                setErrorMessage(Data?.response?.data?.errorMessage);
                setOpenErrorModal(true);
              }
            }
            GetTemplateListData(isCurrentPage);
          }
        } catch (error) {
          console.log(error);
        }
      }
    } else if (modelRequestData.Action === "Delete") {
      try {
        const Data = await DeleteTemplate(
          modelRequestData.templateKeyID,
          modelRequestData.userKeyID,
        );
        if (Data) {
          setLoader(false);
          if (Data?.data?.statusCode === 200) {
            if (Data?.data?.responseData.templateExistsInModule.length !== 0) {
              const servicePackageNames =
                Data?.data?.responseData.templateExistsInModule.flatMap(
                  (item) =>
                    item.recordList.map((templateName) => templateName.name),
                );
              setModelRequestData({
                ...modelRequestData,
                Action: "TemplateWarning",
                message: `Following template are assigned to the selected ${proposalName} and ${EngagementName}.You must remove the services from this ${proposalName} and ${EngagementName} before attempting to mark it as InActive.`,
                ServiceName: servicePackageNames,
              });
              $("#" + "ConfirmModel").modal("hide");
              $("#" + "RecordsAvailablePopupModel").modal("show");
              // GetTemplateListData(currentPage);
            } else {
              GetTemplateListData(currentPage);
              $("#" + "ConfirmModel").one("hidden.bs.modal", () => {
                setOpenSuccessModal(true);
              });
              $("#" + "ConfirmModel").modal("hide");
            }
          } else {
            setErrorMessage(Data?.response?.data?.errorMessage);
            setOpenErrorModal(true);
          }
          GetTemplateListData(isCurrentPage);
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  const TemplatePdfChangeStatusDataAndDeleteData = async () => {
    setLoader(true);
    if (modelRequestData.Action === "Status") {
      if (modelRequestData.StatusType === null) {
        try {
          const Data = await TemplatesPdfChangeStatus(
            modelRequestData.templatePdfKeyID,
            modelRequestData.userKeyID,
          );
          if (Data) {
            setLoader(false);
            if (Data?.data?.statusCode === 200) {
              if (
                Data?.data?.responseData.templatePDFExistsInTemplate.length !==
                0
              ) {
                const servicePackageNames =
                  Data?.data?.responseData.templatePDFExistsInTemplate.map(
                    (item) => item.templateName,
                  );
                setModelRequestData({
                  ...modelRequestData,
                  Action: "TemplatePdfWarning",
                  message: `Following  templates are assigned to the selected template pdf.You must remove the template pdf from this templates before attempting to mark it as InActive.`,
                  ServiceName: servicePackageNames,
                });
                $("#" + "ConfirmModel").modal("hide");
                $("#" + "RecordsAvailablePopupModel").modal("show");

                // GetTemplatePdfListData(currentPageUsers, null, null, null);
              } else {
                GetTemplatePdfListData(currentPageUsers, null, null, null);
                $("#" + "ConfirmModel").one("hidden.bs.modal", () => {
                  setOpenSuccessModal(true);
                });
                $("#" + "ConfirmModel").modal("hide");
              }
            } else {
              let ErrorMessage = Data?.response?.data?.errorMessage;
              if (
                ErrorMessage.includes(
                  "At least one template should be defaulted.",
                ) &&
                common.organisationKeyID === null
              ) {
                setErrorMessage(
                  ` Status cannot be changed to InActive. This template is marked as default for profession type ${modelRequestData.professionTypeNames} and business type ${modelRequestData.BusinessTypeName}.`,
                );
                setOpenErrorModal(true);
              } else if (
                ErrorMessage.includes(
                  "At least one template should be defaulted.",
                ) &&
                showProfessionType &&
                common.organisationKeyID !== null
              ) {
                setErrorMessage(
                  ` Status cannot be changed to InActive. This template is marked as default for profession type  ${modelRequestData.professionTypeNames}.`,
                );
                setOpenErrorModal(true);
              } else if (
                ErrorMessage.includes(
                  "At least one template should be defaulted.",
                )
              ) {
                setErrorMessage(
                  ` Status cannot be changed to InActive. This template is marked as default.`,
                );
                setOpenErrorModal(true);
              } else {
                setErrorMessage(Data?.response?.data?.errorMessage);
                setOpenErrorModal(true);
              }
            }
            GetTemplatePdfListData(currentPageUsers, null, null, null);
          }
        } catch (error) {
          console.log(error);
        }
      }
    } else if (modelRequestData.Action === "Delete") {
      try {
        const Data = await DeleteTemplatePdf(
          modelRequestData.templatePdfKeyID,
          modelRequestData.Action,
          modelRequestData.userKeyID,
        );
        if (Data) {
          setLoader(false);
          if (Data?.data?.statusCode === 200) {
            if (
              Data?.data?.responseData.templatePDFExistsInTemplate.length !== 0
            ) {
              const servicePackageNames =
                Data?.data?.responseData.templatePDFExistsInTemplate.map(
                  (item) => item.templateName,
                );
              setModelRequestData({
                ...modelRequestData,
                Action: "TemplatePdfWarning",
                message: `Following services are assigned to the selected template.You must remove the services from this template before attempting to mark it as InActive.`,
                ServiceName: servicePackageNames,
              });
              $("#" + "ConfirmModel").modal("hide");
              $("#" + "RecordsAvailablePopupModel").modal("show");
              // GetTemplatePdfListData(currentPageUsers, null, null, null);
            } else {
              GetTemplatePdfListData(currentPageUsers, null, null, null);
              $("#" + "ConfirmModel").one("hidden.bs.modal", () => {
                setOpenSuccessModal(true);
              });
              $("#" + "ConfirmModel").modal("hide");
            }
          } else {
            setErrorMessage(Data?.response?.data?.errorMessage);
            setOpenErrorModal(true);
          }
          GetTemplatePdfListData(currentPageUsers, null, null, null);
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  const TemplateHeaderFooterChangeStatusAndDeleteData = async () => {
    setLoader(true);

    if (modelRequestData.Action === "Delete") {
      try {
        const Data = await DeleteTemplateHeaderFooter(
          modelRequestData.hfTemplateKeyID,
          modelRequestData.userKeyID,
        );
        if (Data) {
          setLoader(false);
          if (Data?.data?.statusCode === 200) {
            $("#" + "ConfirmModel").one("hidden.bs.modal", () => {
              setOpenSuccessModal(true);
            });
            $("#" + "ConfirmModel").modal("hide");
          } else {
            setErrorMessage(Data?.response?.data?.errorMessage);
            setOpenErrorModal(true);
          }
          GetTemplateHFListData(currentPage);
        }
      } catch (error) {
        console.log(error);
      }
    } else if (modelRequestData.Action === "Status") {
      try {
        const Data = await TemplateHeaderFooterChangeStatus(
          modelRequestData.hfTemplateKeyID,
          modelRequestData.userKeyID,
        );
        if (Data) {
          setLoader(false);
          if (Data?.data?.statusCode === 200) {
            $("#" + "ConfirmModel").one("hidden.bs.modal", () => {
              setOpenSuccessModal(true);
            });
            $("#" + "ConfirmModel").modal("hide");
          } else {
            setErrorMessage(Data?.response?.data?.errorMessage);
            setOpenErrorModal(true);
          }
        }
        GetTemplateHFListData(currentPage);
      } catch (error) {
        console.log(error);
      }
    }
  };

  //E] Update Function Modal
  // 1) On Click Service Category Add Button
  const TemplateAddBtnClicked = () => {
    {
      setModelRequestData({
        ...modelRequestData,
        TemplateID: null,
        templateKeyID: null,
      });
    }
    let addTemplateRequestData = {
      TemplateID: null,
      templateName: null,
      templateKeyID: null,
      status: null,
    };
    setTopbar("none");
    navigate("/add-template", { state: addTemplateRequestData });
  };
  const TemplateHeaderFooterAddBtnClicked = () => {
    {
      setModelRequestData({
        ...modelRequestData,
        TemplateID: null,
        templateKeyID: null,
      });
    }
    let addTemplateRequestData = {
      TemplateID: null,
      templateName: null,
      templateKeyID: null,
      status: null,
    };
    setTopbar("none");
    navigate("/add-template-header-footer", { state: addTemplateRequestData });
  };
  const TemplatePDFEditBtnClicked = async (Template, type) => {
    if (type === "editPredefined") {
      setLoader(true);
      const data = await GetTemplatePdfModel(Template?.templatePdfKeyID, true);
      if (data?.data?.statusCode === 200) {
        setLoader(false);
        setModelRequestData({
          ...modelRequestData,
          TemplateID: Template.templateID,
          templateName: Template?.templatePdfTitle || null,
          templateKeyID: Template?.templatePdfKeyID,
          Action: "Update",
          Type: true,
        });
        let addTemplateRequestData = {
          TemplateID: null,
          templateName: Template?.templatePdfTitle || null,
          templatePdfKeyID: Template?.templatePdfKeyID || null,
          status: null,
          Action: "Update",
          Type: true,
        };
        setTopbar("none");
        navigate("/add-template-pdf", { state: addTemplateRequestData });
      } else {
        setLoader(false);
        setErrorMessage(data?.response?.data?.errorMessage);
        setOpenErrorModal(true);
      }
    } else {
      {
        setModelRequestData({
          ...modelRequestData,
          TemplateID: null,
          templateKeyID: null,
        });
      }
      let addTemplateRequestData = {
        TemplateID: null,
        templateName: Template?.templatePdfTitle || null,
        templatePdfKeyID: Template?.templatePdfKeyID || null,
        status: null,
      };
      setTopbar("none");
      navigate("/add-template-pdf", { state: addTemplateRequestData });
    }
  };
  // 2) On Click Template Edit Button
  const TemplateEditBtnClicked = async (Template, type) => {
    if (type === "editPredefined") {
      setLoader(true);
      const data = await GetTemplateModel(Template.templateKeyID, true);
      if (data?.data?.statusCode === 200) {
        setLoader(false);
        setModelRequestData({
          ...modelRequestData,
          TemplateID: Template.templateID,
          templateKeyID: Template.templateKeyID,
          Action: "Update",
          Type: true,
        });
      } else {
        setLoader(false);
        setErrorMessage(data?.response?.data?.errorMessage);
        setOpenErrorModal(true);
      }
    } else {
      dispatch(
        updateState({
          currentPage: currentPage,
        }),
      );
      setModelRequestData({
        ...modelRequestData,
        TemplateID: Template.templateID,
        templateKeyID: Template.templateKeyID,
      });
    }
  };
  const TemplateHeaderFooterEditBtnClicked = async (Template, type) => {
    if (type === "edit") {
      setLoader(true);
      const data = await GetTemplateHeaderFooterModel(
        Template?.hfTemplateKeyID,
      );
      if (data?.data?.statusCode === 200) {
        setLoader(false);
        setModelRequestData({
          ...modelRequestData,
          TemplateID: null,
          hfTemplateName: Template?.hfTemplateName || null,
          hfTemplateKeyID: Template?.hfTemplateKeyID,
          Action: "Update",
          Type: true,
        });
        let addTemplateRequestData = {
          TemplateID: null,
          hfTemplateName: Template?.hfTemplateName || null,
          hfTemplateKeyID: Template?.hfTemplateKeyID || null,
          templateTypeID: Template?.templateTypeID || null,
          status: null,
          Action: "Update",
          Type: true,
        };
        setTopbar("none");
        navigate("/add-template-header-footer", {
          state: addTemplateRequestData,
        });
      } else {
        // console.log("type: not edit");
        setLoader(false);
        setErrorMessage(data?.response?.data?.errorMessage);
        setOpenErrorModal(true);
      }
    } else {
      {
        setModelRequestData({
          ...modelRequestData,
          TemplateID: null,
          hfTemplateKeyID: null,
        });
      }
      let addTemplateRequestData = {
        TemplateID: null,
        hfTemplateName: Template?.hfTemplateName || null,
        hfTemplateKeyID: Template?.hfTemplateKeyID || null,
        status: null,
      };
      setTopbar("none");
      navigate("/add-template-header-footer", {
        state: addTemplateRequestData,
      });
    }
  };

  // F] Pagination :
  const handlePageChange = async (pageNumber) => {
    setCurrentPage(pageNumber);
    await GetTemplateListData(pageNumber); // Call your function with the selected page number
  };

  // G] Sorting & Handle Function:
  const handleSort = (sortValue) => {
    if (sortType === "TemplateName") {
      setPrimarySortDirection(sortValue);
      setPrimarySortDirectionObj({
        ...primarySortDirectionObj,
        templateNameSort: sortValue,
      });

      setCurrentPage(1);
      GetTemplateListData(isCurrentPage, searchKeyword, sortValue);
    } else if (sortType === "TemplateType") {
      setPrimarySortDirection(sortValue);
      setPrimarySortDirectionObj({
        ...primarySortDirectionObj,
        TemplateTypeSort: sortValue,
      });
      setCurrentPage(currentPage);
      GetTemplateListData(currentPage, searchKeyword, sortValue);
    } else if (sortType === "BusinessType") {
      setPrimarySortDirection(sortValue);
      setPrimarySortDirectionObj({
        ...primarySortDirectionObj,
        BusinessType: sortValue,
      });
      setCurrentPage(currentPage);
      GetTemplateListData(currentPage, searchKeyword, sortValue);
    } else if (sortType === "ProspectBusinessType") {
      setPrimarySortDirection(sortValue);
      setPrimarySortDirectionObj({
        ...primarySortDirectionObj,
        ProspectBusinessType: sortValue,
      });
      setCurrentPage(currentPage);
      GetTemplateListData(currentPage, searchKeyword, sortValue);
    } else if (sortType === "ProfessionType") {
      setPrimarySortDirection(sortValue);
      setPrimarySortDirectionObj({
        ...primarySortDirectionObj,
        ProfessionType: sortValue,
      });
      setCurrentPage(currentPage);
      GetTemplateListData(currentPage, searchKeyword, sortValue);
    } else if (sortType === "TemplatePdfTitle") {
      setPrimarySortDirection(sortValue);
      setPrimarySortDirectionObj({
        ...primarySortDirectionObj,
        templatePdfListSort: sortValue,
      });
      setCurrentPageUsers(currentPage);
      GetTemplatePdfListData(currentPage, searchKeywordForPDF, sortValue);
    } else if (sortType === "HFProfessionType") {
      setPrimarySortDirection(sortValue);
      setPrimarySortDirectionObj({
        ...primarySortDirectionObj,
        hfProfessionType: sortValue,
      });
      setCurrentPage(1);
      GetTemplateHFListData(isCurrentPage, searchKeywordHF, sortValue);
    } else if (sortType === "HFTemplateName") {
      setPrimarySortDirection(sortValue);
      setPrimarySortDirectionObj({
        ...primarySortDirectionObj,
        hfTemplateName: sortValue,
      });
      setCurrentPage(1);
      GetTemplateHFListData(isCurrentPage, searchKeywordHF, sortValue);
    } else if (sortType === "HFTemplateType") {
      setPrimarySortDirection(sortValue);
      setPrimarySortDirectionObj({
        ...primarySortDirectionObj,
        hfTemplateType: sortValue,
      });
      setCurrentPage(1);
      GetTemplateHFListData(isCurrentPage, searchKeywordHF, sortValue);
    }
  };

  const handleSearch = (e) => {
    const searchKeywordValue = e.target.value;
    setSearchKeyword(searchKeywordValue);
    setCurrentPage(currentPage);
    GetTemplateListData(currentPage, searchKeywordValue);
  };
  const handleSearchForPdf = (e) => {
    const searchKeywordForPDF = e.target.value;
    setSearchKeywordForPDF(searchKeywordForPDF);
    setCurrentPage(currentPage);
    GetTemplatePdfListData(currentPage, searchKeywordForPDF);
  };
  const handleSearchForHF = (e) => {
    const searchKeywordHF = e.target.value;
    setSearchKeywordHF(searchKeywordHF);
    setCurrentPage(currentPage);
    GetTemplateHFListData(currentPage, searchKeywordHF);
  };
  const handleClose = () => {
    $("#" + "ConfirmModel").modal("hide");
    $("#" + "RecordsAvailablePopupModel").modal("hide");
    if (
      openErrorModal &&
      formattedErrorMessage.includes("default state") &&
      activeTab === "Templates PDF"
    ) {
      GetTemplatePdfListData(currentPage, searchKeywordForPDF, sortType);
    }
    if (
      openErrorModal &&
      formattedErrorMessage.includes("default state") &&
      activeTab === "Templates"
    ) {
      GetTemplateListData(
        currentPage,
        searchKeyword,
        primarySortDirection,
        sortType,
        selectedTemplateType,
        prospectType,
        businessTypeID,
      );
    }
    setOpenSuccessModal(false);
    setOpenErrorModal(false);
  };

  const OnHeaderFooterTabClicked = () => {
    setActiveTab("Header and Footer");
    GetTemplateHFListData(1);
  };
  const OnTemplatePDFTabClicked = () => {
    setActiveTab("Templates PDF");
    GetTemplatePdfListData(1);
  };
  const OnTemplateTabClicked = () => {
    setActiveTab("Templates");
    GetTemplateListData(isCurrentPage);
  };

  return (
    <>
      <div className="container-fluid template-list-redesign">
        <div className="template-list-page-header">
          <div>
            <h1 className="template-list-page-title">Templates</h1>
            <p className="template-list-page-subtitle">
              Manage templates, supporting documents, and header/footer
              configurations.
            </p>
          </div>
          <div className="template-list-toolbar-right">
            {((userAccessData.Admin_Config_Template_CanAdd &&
              common.organisationKeyID !== null) ||
              (userAccessData.SuperAdmin_Config_Template_CanAdd &&
                common.organisationKeyID === null)) && (
              <div className="template-list-add-action">
                {activeTab === "Templates" && (
                  <CommonButtonComponent
                    title={getCrudButtonToolTipName("Add", moduleName)}
                    name={getCrudButtonTextName("Add", moduleName)}
                    AddBtn={TemplateAddBtnClicked}
                  />
                )}

                {activeTab === "Templates PDF" && (
                  <CommonButtonComponent
                    title={getCrudButtonToolTipName(
                      "Add",
                      moduleNameForTemplatePdf,
                    )}
                    name={getCrudButtonTextName(
                      "Add",
                      moduleNameForTemplatePdf,
                    )}
                    AddBtn={() => TemplatePDFEditBtnClicked()}
                  />
                )}

                {activeTab === "Header and Footer" && (
                  <CommonButtonComponent
                    title={getCrudButtonToolTipName(
                      "Add",
                      moduleNameForHeaderFooter,
                    )}
                    name={getCrudButtonTextName(
                      "Add",
                      moduleNameForHeaderFooter,
                    )}
                    AddBtn={TemplateHeaderFooterAddBtnClicked}
                  />
                )}
              </div>
            )}
          </div>
        </div>

        {/* <div class="main-content"> */}
        <div className="services page-background template-list-page-content">
          <div class="">
            <div class="row">
              <div class="col-lg-12">
                <div className="card template-list-shell">
                  {/* end card header  */}
                  <div className="card-body mb-2 template-list-shell-body">
                    <div
                      id="customerList"
                      className="template-list-customer-section"
                    >
                      <div className="bg-light border-bottom px-2 template-list-tabs-wrap">
                        {/* <div className="container"> */}
                        <div className="row">
                          <div className="col-md-12 ">
                            <ul
                              className="nav nav-tabs template-list-tabs"
                              role="tablist"
                            >
                              <li className="nav-item">
                                <a
                                  className={`nav-link tab_nav ${
                                    activeTab === "Templates" ? "active" : ""
                                  }`}
                                  data-bs-toggle="tab"
                                  href="#Templates"
                                  role="tab"
                                  aria-selected={activeTab === "Templates"}
                                  onClick={() => {
                                    setActiveTab("Templates");
                                    OnTemplateTabClicked();
                                  }}
                                >
                                  <b>Templates</b>
                                </a>
                              </li>
                              <li className="nav-item">
                                <a
                                  className={`nav-link tab_nav ${
                                    activeTab === "Templates PDF"
                                      ? "active"
                                      : ""
                                  }`}
                                  data-bs-toggle="tab"
                                  href="#Templates PDF"
                                  role="tab"
                                  aria-selected={activeTab === "Templates PDF"}
                                  onClick={() => OnTemplatePDFTabClicked()}
                                >
                                  <b>Template PDF/EXCEL</b>
                                </a>
                              </li>
                              {common.organisationKeyID && (
                                <li className="nav-item">
                                  <a
                                    className={`nav-link tab_nav ${
                                      activeTab === "Header and Footer"
                                        ? "active"
                                        : ""
                                    }`}
                                    data-bs-toggle="tab"
                                    href="#Header and Footer"
                                    role="tab"
                                    aria-selected={
                                      activeTab === "Header and Footer"
                                    }
                                    onClick={() => OnHeaderFooterTabClicked()}
                                  >
                                    <b>Header and Footer</b>
                                  </a>
                                </li>
                              )}
                            </ul>
                          </div>
                        </div>
                        {/* </div> */}
                      </div>
                      <div class="">
                        <div class="row">
                          <div class="col-lg-12">
                            <div className="card template-list-shell">
                              {/* end card header  */}
                              <div className="card-body template-list-inner-card-body">
                                <div id="customerList">
                                  <div className="template-list-table-card">
                                    <div className="template-list-toolbar">
                                      <div className="template-list-toolbar-left">
                                        {activeTab === "Templates" && (
                                          <>
                                            <div className="template-list-search-box">
                                              <i className="ri-search-line template-list-search-icon"></i>
                                              <input
                                                type="text"
                                                value={searchKeyword}
                                                onChange={handleSearch}
                                                className="template-list-search-input"
                                                placeholder={
                                                  isMobile
                                                    ? "Search"
                                                    : getPlaceholderTextName(
                                                        "Search",
                                                        moduleName,
                                                      )
                                                }
                                              />
                                            </div>

                                            <Tooltip
                                              title={getCrudButtonToolTipName(
                                                "Filter",
                                                moduleName,
                                              )}
                                            >
                                              <button
                                                type="button"
                                                className={`template-list-filter-btn ${
                                                  isFilterApply
                                                    ? "template-list-filter-btn--active"
                                                    : ""
                                                }`}
                                                data-bs-toggle="modal"
                                                data-bs-target="#FilterModel"
                                              >
                                                <Funnel size={17} strokeWidth={1.9} className="app-filter-icon" />
                                                <span className="app-filter-label">Filter</span>
                                              </button>
                                            </Tooltip>

                                            {isFilterApply && (
                                              <Tooltip title="Clear Filter">
                                                <button
                                                  type="button"
                                                  className="template-list-clear-filter-btn"
                                                  onClick={ClearFilter}
                                                >
                                                  <i className="ri-close-line"></i>
                                                  <span>Clear Filter</span>
                                                </button>
                                              </Tooltip>
                                            )}
                                          </>
                                        )}

                                        {activeTab === "Templates PDF" && (
                                          <div className="template-list-search-box">
                                            <i className="ri-search-line template-list-search-icon"></i>
                                            <input
                                              type="text"
                                              value={searchKeywordForPDF}
                                              onChange={handleSearchForPdf}
                                              className="template-list-search-input"
                                              placeholder={
                                                isMobile
                                                  ? "Search"
                                                  : getPlaceholderTextName(
                                                      "Search",
                                                      moduleNameForTemplatePdf,
                                                    )
                                              }
                                            />
                                          </div>
                                        )}

                                        {activeTab === "Header and Footer" && (
                                          <div className="template-list-search-box">
                                            <i className="ri-search-line template-list-search-icon"></i>
                                            <input
                                              type="text"
                                              value={searchKeywordHF}
                                              onChange={handleSearchForHF}
                                              className="template-list-search-input"
                                              placeholder={
                                                isMobile
                                                  ? "Search"
                                                  : getPlaceholderTextName(
                                                      "Search",
                                                      moduleNameForHeaderFooter,
                                                    )
                                              }
                                            />
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    {/* Table Of Template and Template Pdf */}
                                    <div
                                      className={`tab-pane template-list-data-pane ${
                                        activeTab === "Templates PDF"
                                          ? "active"
                                          : ""
                                      }`}
                                      id="base-justified-home"
                                    >
                                      {activeTab === "Templates PDF" && (
                                        <table
                                          className="table align-middle table-nowrap template-list-table template-list-pdf-table"
                                          id="customerTable"
                                        >
                                          <thead className="table-light table-header-font template-list-table-head">
                                            <tr className="head-row">
                                              <td
                                                className="tr-table-class text-white"
                                                style={{ width: "70%" }}
                                              >
                                                Title
                                                {primarySortDirectionObj.templatePdfListSort ===
                                                  "desc" && (
                                                  <i
                                                    onClick={() => {
                                                      setSortType(
                                                        "TemplatePdfTitle",
                                                      );
                                                      handleSort(
                                                        "asc",
                                                        "TemplatePdfTitle",
                                                      );
                                                    }}
                                                    class="fas fa-sort-alpha-up ml-1"
                                                  ></i>
                                                )}
                                                {(primarySortDirectionObj.templatePdfListSort ===
                                                  null ||
                                                  primarySortDirectionObj.templatePdfListSort ===
                                                    "asc") && (
                                                  <i
                                                    onClick={() => {
                                                      setSortType(
                                                        "TemplatePdfTitle",
                                                      );
                                                      handleSort(
                                                        primarySortDirectionObj.templatePdfListSort ===
                                                          null
                                                          ? "asc"
                                                          : "desc",
                                                        "TemplatePdfList",
                                                      );
                                                    }}
                                                    class="fas fa-sort-alpha-down  ml-1"
                                                  ></i>
                                                )}
                                              </td>

                                              <td className="tr-table-class text-white">
                                                Document
                                              </td>

                                              <td className="tr-table-class text-white">
                                                Status
                                              </td>
                                              <td className="tr-table-class text-white">
                                                Action
                                              </td>
                                            </tr>
                                          </thead>
                                          <tbody className="list form-check-all">
                                            {TemplatePdfList.slice(
                                              0,
                                              isMobile
                                                ? isMobileRecords
                                                : desktopRecords,
                                            ).map((Template) => {
                                              return (
                                                <tr className="table_new table-content-font template-list-row">
                                                  <td>
                                                    {Template.notifySAChanges !==
                                                      null &&
                                                      common.organisationKeyID !==
                                                        null && (
                                                        <>
                                                          <Tooltip title="View System Administrator Changes">
                                                            <span
                                                              onClick={() =>
                                                                TemplatePDFEditBtnClicked(
                                                                  Template,
                                                                  "editPredefined",
                                                                )
                                                              }
                                                              className="UpdateConfigValue"
                                                              // data-bs-toggle="modal"

                                                              // data-bs-target="#addUpdateModal"
                                                            >
                                                              <i className="fa fa-regular fa-bell"></i>
                                                            </span>
                                                          </Tooltip>
                                                        </>
                                                      )}
                                                    {isMobile ? (
                                                      <>
                                                        {Template
                                                          .templatePdfTitle
                                                          .length > 20
                                                          ? Template.templatePdfTitle
                                                              .substring(0, 20)
                                                              .replace(
                                                                /\b\w/g,
                                                                (l) =>
                                                                  l.toUpperCase(),
                                                              ) + "..."
                                                          : Template.templatePdfTitle.replace(
                                                              /\b\w/g,
                                                              (l) =>
                                                                l.toUpperCase(),
                                                            )}
                                                      </>
                                                    ) : (
                                                      <>
                                                        <Tooltip
                                                          title={
                                                            Template.templatePdfTitle
                                                          }
                                                        ></Tooltip>

                                                        <>
                                                          {
                                                            Template.templatePdfTitle
                                                          }
                                                        </>
                                                      </>
                                                    )}
                                                  </td>

                                                  <td>
                                                    <Tooltip title="View Document" placement="top">
                                                    <a
                                                      // href="https://teststaging.outbooks.com/api/quote/preview-pdf/b8c4365d-d32a-40ef-9835-f90800aa476b"
                                                      href={Template.pdf}
                                                      target="_blank"
                                                      rel="noreferrer"
                                                      className="template-list-document-link"
                                                    >
                                                      <PdfFileIcon
                                                        {...(/\.xlsx?(\?|#|$)/i.test(Template.pdf || "")
                                                          ? { label: "XLS", tagColor: "#079455" }
                                                          : /\.csv(\?|#|$)/i.test(Template.pdf || "")
                                                            ? { label: "CSV", tagColor: "#079455" }
                                                            : {})}
                                                      />
                                                      <span className="visually-hidden">View Document</span>
                                                    </a>
                                                    </Tooltip>
                                                  </td>

                                                  <td className="Switch">
                                                    <div
                                                      style={{
                                                        alignItems: "none",
                                                        marginLeft:
                                                          ((userAccessData.Admin_Config_Template_CanEdit &&
                                                            common.organisationKeyID !==
                                                              null) ||
                                                            (userAccessData.SuperAdmin_Config_Template_CanEdit &&
                                                              common.organisationKeyID ===
                                                                null)) &&
                                                          ((userAccessData.Admin_Config_Template_CanDelete &&
                                                            common.organisationKeyID !==
                                                              null) ||
                                                            (userAccessData.SuperAdmin_Config_Template_CanDelete &&
                                                              common.organisationKeyID ===
                                                                null))
                                                            ? ""
                                                            : "10px",
                                                      }}
                                                      class="d-flex gap-2 "
                                                    >
                                                      <span
                                                        className={`template-list-status-badge ${
                                                          Template.statusName ===
                                                          "Active"
                                                            ? "is-active"
                                                            : "is-inactive"
                                                        }`}
                                                      >
                                                        {Template.statusName}
                                                      </span>
                                                      {((userAccessData.Admin_Config_Template_CanDelete &&
                                                        common.organisationKeyID !==
                                                          null) ||
                                                        (userAccessData.SuperAdmin_Config_Template_CanDelete &&
                                                          common.organisationKeyID ===
                                                            null)) && (
                                                        <Tooltip
                                                          title={getCrudButtonToolTipName(
                                                            "Change Status",
                                                          )}
                                                        >
                                                          <FormGroup
                                                            style={{
                                                              width: "55px",
                                                            }}
                                                          >
                                                            <FormControlLabel
                                                              control={
                                                                <Android12Switch
                                                                  onClick={() =>
                                                                    setModelRequestData(
                                                                      {
                                                                        ...modelRequestData,
                                                                        professionTypeNames:
                                                                          Template.professionTypeNames,
                                                                        BusinessTypeName:
                                                                          Template.orgBusinessType,
                                                                        status:
                                                                          Template.statusName,
                                                                        templateKeyID:
                                                                          Template.templateKeyID,
                                                                        userKeyID:
                                                                          common.userKeyID,
                                                                        templatePdfKeyID:
                                                                          Template.templatePdfKeyID,
                                                                        StatusType:
                                                                          null,
                                                                        Action:
                                                                          "Status",
                                                                      },
                                                                    )
                                                                  }
                                                                  checked={
                                                                    Template.statusName ===
                                                                    "Active"
                                                                  }
                                                                  data-bs-toggle="modal"
                                                                  data-bs-target="#ConfirmModel"
                                                                />
                                                              }
                                                            />
                                                          </FormGroup>
                                                        </Tooltip>
                                                      )}
                                                    </div>
                                                  </td>
                                                  <td className="template-list-actions-cell">
                                                    <div className="d-flex gap-2 template-list-row-actions">
                                                      <Tooltip
                                                        title={getCrudButtonToolTipName(
                                                          "Copy",
                                                          moduleNameForTemplatePdf,
                                                        )}
                                                      >
                                                        <div class="copy">
                                                          <button
                                                            class="btn btn-sm btn-success edit-item-btn edit"
                                                            data-bs-toggle="modal"
                                                            data-bs-target="#ConfirmModel"
                                                            onClick={() =>
                                                              setModelRequestData(
                                                                {
                                                                  ...modelRequestData,
                                                                  Action:
                                                                    "Copy",
                                                                  templatePdfTitle:
                                                                    Template.templatePdfTitle,
                                                                  templatePdfKeyID:
                                                                    Template.templatePdfKeyID,
                                                                  userKeyID:
                                                                    common.userKeyID,
                                                                },
                                                              )
                                                            }
                                                          >
                                                            <i className="fa-solid fa-copy"></i>
                                                          </button>
                                                        </div>
                                                      </Tooltip>
                                                      {((userAccessData.Admin_Config_Template_CanEdit &&
                                                        common.organisationKeyID !==
                                                          null) ||
                                                        (userAccessData.SuperAdmin_Config_Template_CanEdit &&
                                                          common.organisationKeyID ===
                                                            null)) && (
                                                        <Tooltip
                                                          title={getCrudButtonToolTipName(
                                                            "Update",
                                                            moduleNameForTemplatePdf,
                                                          )}
                                                        >
                                                          <div class="edit">
                                                            <button
                                                              onClick={() =>
                                                                TemplatePDFEditBtnClicked(
                                                                  Template,
                                                                )
                                                              }
                                                              class="btn btn-sm btn-success edit-item-btn actionButtonsStyle"
                                                            >
                                                              <i className="ri-pencil-fill"></i>
                                                            </button>
                                                          </div>
                                                        </Tooltip>
                                                      )}
                                                      {((userAccessData.Admin_Config_Template_CanDelete &&
                                                        common.organisationKeyID !==
                                                          null) ||
                                                        (userAccessData.SuperAdmin_Config_Template_CanDelete &&
                                                          common.organisationKeyID ===
                                                            null)) && (
                                                        <Tooltip
                                                          title={getCrudButtonToolTipName(
                                                            "Delete",
                                                            moduleNameForTemplatePdf,
                                                          )}
                                                        >
                                                          <div class="remove">
                                                            <button
                                                              onClick={() =>
                                                                setModelRequestData(
                                                                  {
                                                                    ...modelRequestData,
                                                                    templateKeyID:
                                                                      Template.templateKeyID,
                                                                    templateName:
                                                                      Template.templatePdfTitle,
                                                                    templatePdfKeyID:
                                                                      Template.templatePdfKeyID,
                                                                    userKeyID:
                                                                      common.userKeyID,
                                                                    Action:
                                                                      "Delete",
                                                                  },
                                                                )
                                                              }
                                                              class="btn btn-sm btn-danger remove-item-btn actionButtonsStyle"
                                                              data-bs-toggle="modal"
                                                              data-bs-target="#ConfirmModel"
                                                            >
                                                              <i className="ri-delete-bin-5-fill"></i>
                                                            </button>
                                                          </div>
                                                        </Tooltip>
                                                      )}
                                                    </div>
                                                  </td>
                                                </tr>
                                              );
                                            })}
                                          </tbody>
                                        </table>
                                      )}
                                    </div>
                                    <div
                                      className={`tab-pane template-list-data-pane ${
                                        activeTab === "Templates"
                                          ? "active"
                                          : ""
                                      }`}
                                      id="base-justified-home"
                                    >
                                      {activeTab === "Templates" && (
                                        <table
                                          className={`table align-middle table-nowrap template-list-table template-list-main-table ${
                                            !showProfessionType
                                              ? "template-list-main-table--no-profession"
                                              : ""
                                          } ${
                                            !(
                                              common.roleTypeId ===
                                                USER_ROLE_TYPE.SuperAdmin &&
                                              common.organisationKeyID === null
                                            )
                                              ? "template-list-main-table--no-business"
                                              : ""
                                          }`}
                                          id="customerTable"
                                        >
                                          <thead className="table-light table-header-font template-list-table-head">
                                            <tr className="head-row">
                                              <td
                                                className="tr-table-class text-white"
                                                style={{ width: "10%" }}
                                              >
                                                Name
                                                {primarySortDirectionObj.templateNameSort ===
                                                  "desc" && (
                                                  <i
                                                    onClick={() => {
                                                      setSortType(
                                                        "TemplateName",
                                                      );
                                                      handleSort("asc");
                                                    }}
                                                    class="fas fa-sort-alpha-up ml-1"
                                                  ></i>
                                                )}
                                                {(primarySortDirectionObj.templateNameSort ===
                                                  null ||
                                                  primarySortDirectionObj.templateNameSort ===
                                                    "asc") && (
                                                  <i
                                                    onClick={() => {
                                                      setSortType(
                                                        "TemplateName",
                                                      );
                                                      handleSort(
                                                        primarySortDirectionObj.templateNameSort ===
                                                          null
                                                          ? "asc"
                                                          : "desc",
                                                      );
                                                    }}
                                                    class="fas fa-sort-alpha-down  ml-1"
                                                  ></i>
                                                )}
                                              </td>

                                              <td className="tr-table-class text-white profession-type-column">
                                                {showProfessionType && (
                                                  <>
                                                    Profession Type
                                                    {primarySortDirectionObj.ProfessionType ===
                                                      "desc" && (
                                                      <i
                                                        onClick={() => {
                                                          setSortType(
                                                            "ProfessionType",
                                                          );
                                                          handleSort("asc");
                                                        }}
                                                        class="fas fa-sort-alpha-up ml-1"
                                                      ></i>
                                                    )}
                                                    {(primarySortDirectionObj.ProfessionType ===
                                                      null ||
                                                      primarySortDirectionObj.ProfessionType ===
                                                        "asc") && (
                                                      <i
                                                        onClick={() => {
                                                          setSortType(
                                                            "ProfessionType",
                                                          );
                                                          handleSort(
                                                            primarySortDirectionObj.ProfessionType ===
                                                              null
                                                              ? "asc"
                                                              : "desc",
                                                          );
                                                        }}
                                                        class="fas fa-sort-alpha-down  ml-1"
                                                      ></i>
                                                    )}
                                                  </>
                                                )}
                                              </td>
                                              {common.roleTypeId ===
                                                USER_ROLE_TYPE.SuperAdmin &&
                                              common.organisationKeyID ===
                                                null ? (
                                                <td className="tr-table-class text-white">
                                                  Business Type
                                                  {primarySortDirectionObj.BusinessType ===
                                                    "desc" && (
                                                    <i
                                                      onClick={() => {
                                                        setSortType(
                                                          "BusinessType",
                                                        );
                                                        handleSort("asc");
                                                      }}
                                                      class="fas fa-sort-alpha-up ml-1"
                                                    ></i>
                                                  )}
                                                  {(primarySortDirectionObj.BusinessType ===
                                                    null ||
                                                    primarySortDirectionObj.BusinessType ===
                                                      "asc") && (
                                                    <i
                                                      onClick={() => {
                                                        setSortType(
                                                          "BusinessType",
                                                        );
                                                        handleSort(
                                                          primarySortDirectionObj.BusinessType ===
                                                            null
                                                            ? "asc"
                                                            : "desc",
                                                        );
                                                      }}
                                                      class="fas fa-sort-alpha-down  ml-1"
                                                    ></i>
                                                  )}
                                                </td>
                                              ) : (
                                                <td className="tr-table-class text-white">
                                                  <span className="invisible">
                                                    Business Type
                                                    {primarySortDirectionObj.BusinessType ===
                                                      "desc" && (
                                                      <i
                                                        onClick={() => {
                                                          setSortType(
                                                            "BusinessType",
                                                          );
                                                          handleSort("asc");
                                                        }}
                                                        class="fas fa-sort-alpha-up ml-1"
                                                      ></i>
                                                    )}
                                                    {(primarySortDirectionObj.BusinessType ===
                                                      null ||
                                                      primarySortDirectionObj.BusinessType ===
                                                        "asc") && (
                                                      <i
                                                        onClick={() => {
                                                          setSortType(
                                                            "BusinessType",
                                                          );
                                                          handleSort(
                                                            primarySortDirectionObj.BusinessType ===
                                                              null
                                                              ? "asc"
                                                              : "desc",
                                                          );
                                                        }}
                                                        class="fas fa-sort-alpha-down  ml-1"
                                                      ></i>
                                                    )}
                                                  </span>
                                                </td>
                                              )}
                                              <td className="tr-table-class text-white">
                                                Type
                                                {primarySortDirectionObj.TemplateTypeSort ===
                                                  "desc" && (
                                                  <i
                                                    onClick={() => {
                                                      setSortType(
                                                        "TemplateType",
                                                      );
                                                      handleSort("asc");
                                                    }}
                                                    class="fas fa-sort-alpha-up ml-1"
                                                  ></i>
                                                )}
                                                {(primarySortDirectionObj.TemplateTypeSort ===
                                                  null ||
                                                  primarySortDirectionObj.TemplateTypeSort ===
                                                    "asc") && (
                                                  <i
                                                    onClick={() => {
                                                      setSortType(
                                                        "TemplateType",
                                                      );
                                                      handleSort(
                                                        primarySortDirectionObj.TemplateTypeSort ===
                                                          null
                                                          ? "asc"
                                                          : "desc",
                                                      );
                                                    }}
                                                    class="fas fa-sort-alpha-down  ml-1"
                                                  ></i>
                                                )}
                                              </td>
                                              <td className="tr-table-class text-white">
                                                {prospectName} Type
                                                {primarySortDirectionObj.ProspectBusinessType ===
                                                  "desc" && (
                                                  <i
                                                    onClick={() => {
                                                      setSortType(
                                                        "ProspectBusinessType",
                                                      );
                                                      handleSort("asc");
                                                    }}
                                                    class="fas fa-sort-alpha-up ml-1"
                                                  ></i>
                                                )}
                                                {(primarySortDirectionObj.ProspectBusinessType ===
                                                  null ||
                                                  primarySortDirectionObj.ProspectBusinessType ===
                                                    "asc") && (
                                                  <i
                                                    onClick={() => {
                                                      setSortType(
                                                        "ProspectBusinessType",
                                                      );
                                                      handleSort(
                                                        primarySortDirectionObj.ProspectBusinessType ===
                                                          null
                                                          ? "asc"
                                                          : "desc",
                                                      );
                                                    }}
                                                    class="fas fa-sort-alpha-down  ml-1"
                                                  ></i>
                                                )}
                                              </td>
                                              <td className="tr-table-class text-white">
                                                Is Default
                                              </td>
                                              <td className="tr-table-class text-white">
                                                Status
                                              </td>
                                              <td className="tr-table-class text-white">
                                                Action
                                              </td>
                                            </tr>
                                          </thead>
                                          <tbody className="list form-check-all">
                                            {TemplateList.slice(
                                              0,
                                              isMobile
                                                ? isMobileRecords
                                                : desktopRecords,
                                            ).map((Template) => {
                                              return (
                                                <tr className="table_new table-content-font template-list-row">
                                                  <td className="table_new table-content-font template-list-name-column">
                                                    {Template.notifySAChanges !==
                                                      null &&
                                                      common.organisationKeyID !==
                                                        null && (
                                                        <>
                                                          <Tooltip title="View System Administrator Changes">
                                                            <span
                                                              onClick={() =>
                                                                TemplateEditBtnClicked(
                                                                  Template,
                                                                  "editPredefined",
                                                                )
                                                              }
                                                              className="UpdateConfigValue"
                                                              // data-bs-toggle="modal"

                                                              // data-bs-target="#addUpdateModal"
                                                            >
                                                              <i className="fa fa-regular fa-bell"></i>
                                                            </span>
                                                          </Tooltip>
                                                        </>
                                                      )}
                                                    {isMobile ? (
                                                      <>
                                                        {Template.templateName
                                                          .length > 20
                                                          ? Template.templateName
                                                              .substring(0, 20)
                                                              .replace(
                                                                /\b\w/g,
                                                                (l) =>
                                                                  l.toUpperCase(),
                                                              ) + "..."
                                                          : Template.templateName
                                                              .substring(0, 20)
                                                              .replace(
                                                                /\b\w/g,
                                                                (l) =>
                                                                  l.toUpperCase(),
                                                              )}
                                                      </>
                                                    ) : (
                                                      <>
                                                        {Template.templateName
                                                          .length > 48 ? (
                                                          !showProfessionType ? (
                                                            <Tooltip
                                                              title={
                                                                Template.templateName
                                                              }
                                                            >
                                                              {Template.templateName
                                                                .substring(
                                                                  0,
                                                                  78,
                                                                )
                                                                .replace(
                                                                  /\b\w/g,
                                                                  (l) =>
                                                                    l.toUpperCase(),
                                                                ) + "..."}
                                                            </Tooltip>
                                                          ) : (
                                                            <Tooltip
                                                              title={
                                                                Template.templateName
                                                              }
                                                            >
                                                              {Template.templateName
                                                                .substring(
                                                                  0,
                                                                  48,
                                                                )
                                                                .replace(
                                                                  /\b\w/g,
                                                                  (l) =>
                                                                    l.toUpperCase(),
                                                                ) + "..."}
                                                            </Tooltip>
                                                          )
                                                        ) : (
                                                          <>
                                                            {Template.templateName.replace(
                                                              /\b\w/g,
                                                              (l) =>
                                                                l.toUpperCase(),
                                                            )}
                                                          </>
                                                        )}
                                                      </>
                                                    )}
                                                  </td>

                                                  <td className="table-content-font template-list-profession-column">
                                                    {showProfessionType &&
                                                      Template.professionTypeNames}
                                                  </td>
                                                  {common.roleTypeId ===
                                                    USER_ROLE_TYPE.SuperAdmin &&
                                                  common.organisationKeyID ===
                                                    null ? (
                                                    <td>
                                                      {Template.orgBusinessType}
                                                    </td>
                                                  ) : (
                                                    <td>&nbsp;</td>
                                                  )}
                                                  <td className="template-list-type-column">
                                                    {Template.templateType ==
                                                    "Contract"
                                                      ? `${EngagementName}`
                                                      : `${proposalName}`}
                                                  </td>
                                                  <td className="template-list-prospect-column">
                                                    {
                                                      Template.clientBusinessType
                                                    }
                                                  </td>
                                                  <td className="Switch">
                                                    <div
                                                      style={{
                                                        alignItems: "none",
                                                        marginLeft:
                                                          ((userAccessData.Admin_Config_Template_CanEdit &&
                                                            common.organisationKeyID !==
                                                              null) ||
                                                            (userAccessData.SuperAdmin_Config_Template_CanEdit &&
                                                              common.organisationKeyID ===
                                                                null)) &&
                                                          ((userAccessData.Admin_Config_Template_CanDelete &&
                                                            common.organisationKeyID !==
                                                              null) ||
                                                            (userAccessData.SuperAdmin_Config_Template_CanDelete &&
                                                              common.organisationKeyID ===
                                                                null))
                                                            ? ""
                                                            : "10px",
                                                      }}
                                                      class="d-flex gap-2 "
                                                    >
                                                      {/* <span
                                                        className={`template-list-default-badge ${
                                                          Template.isDefaultName ===
                                                          "Yes"
                                                            ? "is-default"
                                                            : "is-not-default"
                                                        }`}
                                                      ></span> */}
                                                      {((userAccessData.Admin_Config_Template_CanDelete &&
                                                        common.organisationKeyID !==
                                                          null) ||
                                                        (userAccessData.SuperAdmin_Config_Template_CanDelete &&
                                                          common.organisationKeyID ===
                                                            null)) && (
                                                        <Tooltip
                                                          title={getCrudButtonToolTipName(
                                                            "Change Is Default",
                                                          )}
                                                        >
                                                          <FormGroup>
                                                            <FormControlLabel
                                                              control={
                                                                <Android12Switch
                                                                  onClick={() =>
                                                                    setModelRequestData(
                                                                      {
                                                                        ...modelRequestData,
                                                                        professionTypeNames:
                                                                          Template.professionTypeNames,
                                                                        BusinessTypeName:
                                                                          Template.orgBusinessType,
                                                                        status:
                                                                          Template.isDefaultName,
                                                                        templateKeyID:
                                                                          Template.templateKeyID,
                                                                        StatusType:
                                                                          "IsDefault",
                                                                        isDefault:
                                                                          Template.isDefaultName ===
                                                                          "Yes"
                                                                            ? false
                                                                            : true,
                                                                        Action:
                                                                          "Status",
                                                                      },
                                                                    )
                                                                  }
                                                                  checked={
                                                                    Template.isDefaultName ===
                                                                    "Yes"
                                                                  }
                                                                  data-bs-toggle="modal"
                                                                  data-bs-target="#ConfirmModel"
                                                                />
                                                              }
                                                            />
                                                          </FormGroup>
                                                        </Tooltip>
                                                      )}
                                                    </div>
                                                  </td>
                                                  <td className="Switch">
                                                    <div
                                                      style={{
                                                        alignItems: "none",
                                                        marginLeft:
                                                          ((userAccessData.Admin_Config_Template_CanEdit &&
                                                            common.organisationKeyID !==
                                                              null) ||
                                                            (userAccessData.SuperAdmin_Config_Template_CanEdit &&
                                                              common.organisationKeyID ===
                                                                null)) &&
                                                          ((userAccessData.Admin_Config_Template_CanDelete &&
                                                            common.organisationKeyID !==
                                                              null) ||
                                                            (userAccessData.SuperAdmin_Config_Template_CanDelete &&
                                                              common.organisationKeyID ===
                                                                null))
                                                            ? ""
                                                            : "10px",
                                                      }}
                                                      class="d-flex gap-2 "
                                                    >
                                                      {/* <span
                                                        className={`template-list-status-badge ${
                                                          Template.statusName ===
                                                          "Active"
                                                            ? "is-active"
                                                            : "is-inactive"
                                                        }`}
                                                      ></span> */}
                                                      {((userAccessData.Admin_Config_Template_CanDelete &&
                                                        common.organisationKeyID !==
                                                          null) ||
                                                        (userAccessData.SuperAdmin_Config_Template_CanDelete &&
                                                          common.organisationKeyID ===
                                                            null)) && (
                                                        <Tooltip
                                                          title={getCrudButtonToolTipName(
                                                            "Change Status",
                                                          )}
                                                        >
                                                          <FormGroup>
                                                            <FormControlLabel
                                                              control={
                                                                <Android12Switch
                                                                  onClick={() =>
                                                                    setModelRequestData(
                                                                      {
                                                                        ...modelRequestData,
                                                                        professionTypeNames:
                                                                          Template.professionTypeNames,
                                                                        BusinessTypeName:
                                                                          Template.orgBusinessType,
                                                                        status:
                                                                          Template.statusName,
                                                                        templateKeyID:
                                                                          Template.templateKeyID,
                                                                        userKeyID:
                                                                          common.userKeyID,

                                                                        StatusType:
                                                                          null,
                                                                        Action:
                                                                          "Status",
                                                                      },
                                                                    )
                                                                  }
                                                                  checked={
                                                                    Template.statusName ===
                                                                    "Active"
                                                                  }
                                                                  data-bs-toggle="modal"
                                                                  data-bs-target="#ConfirmModel"
                                                                />
                                                              }
                                                            />
                                                          </FormGroup>
                                                        </Tooltip>
                                                      )}
                                                    </div>
                                                  </td>
                                                  <td className="template-list-actions-cell">
                                                    <div className="d-flex gap-2 template-list-row-actions">
                                                      <Tooltip
                                                        title={getCrudButtonToolTipName(
                                                          "Copy",
                                                          moduleName,
                                                        )}
                                                      >
                                                        <div class="copy">
                                                          <button
                                                            class="btn btn-sm btn-success edit-item-btn edit"
                                                            data-bs-toggle="modal"
                                                            data-bs-target="#ConfirmModel"
                                                            onClick={() =>
                                                              setModelRequestData(
                                                                {
                                                                  ...modelRequestData,
                                                                  Action:
                                                                    "Copy",
                                                                  templateName:
                                                                    Template.templateName,
                                                                  templateKeyID:
                                                                    Template.templateKeyID,
                                                                  userKeyID:
                                                                    common.userKeyID,
                                                                },
                                                              )
                                                            }
                                                          >
                                                            <i className="fa-solid fa-copy"></i>
                                                          </button>
                                                        </div>
                                                      </Tooltip>
                                                      {((userAccessData.Admin_Config_Template_CanEdit &&
                                                        common.organisationKeyID !==
                                                          null) ||
                                                        (userAccessData.SuperAdmin_Config_Template_CanEdit &&
                                                          common.organisationKeyID ===
                                                            null)) && (
                                                        <Tooltip
                                                          title={getCrudButtonToolTipName(
                                                            "Update",
                                                            moduleName,
                                                          )}
                                                        >
                                                          <div class="edit">
                                                            <button
                                                              onClick={() =>
                                                                TemplateEditBtnClicked(
                                                                  Template,
                                                                )
                                                              }
                                                              class="btn btn-sm btn-success edit-item-btn actionButtonsStyle"
                                                            >
                                                              <i className="ri-pencil-fill"></i>
                                                            </button>
                                                          </div>
                                                        </Tooltip>
                                                      )}
                                                      {((userAccessData.Admin_Config_Template_CanDelete &&
                                                        common.organisationKeyID !==
                                                          null) ||
                                                        (userAccessData.SuperAdmin_Config_Template_CanDelete &&
                                                          common.organisationKeyID ===
                                                            null)) && (
                                                        <Tooltip
                                                          title={getCrudButtonToolTipName(
                                                            "Delete",
                                                            moduleName,
                                                          )}
                                                        >
                                                          <div class="remove">
                                                            <button
                                                              onClick={() =>
                                                                setModelRequestData(
                                                                  {
                                                                    ...modelRequestData,
                                                                    templateKeyID:
                                                                      Template.templateKeyID,
                                                                    templateName:
                                                                      Template.templateName,
                                                                    userKeyID:
                                                                      common.userKeyID,
                                                                    Action:
                                                                      "Delete",
                                                                  },
                                                                )
                                                              }
                                                              class="btn btn-sm btn-danger remove-item-btn actionButtonsStyle"
                                                              data-bs-toggle="modal"
                                                              data-bs-target="#ConfirmModel"
                                                            >
                                                              <i className="ri-delete-bin-5-fill"></i>
                                                            </button>
                                                          </div>
                                                        </Tooltip>
                                                      )}
                                                    </div>
                                                  </td>
                                                </tr>
                                              );
                                            })}
                                          </tbody>
                                        </table>
                                      )}
                                    </div>
                                    <div
                                      className={`tab-pane template-list-data-pane ${
                                        activeTab === "Header and Footer"
                                          ? "active"
                                          : ""
                                      }`}
                                      id="base-justified-home"
                                    >
                                      {activeTab === "Header and Footer" && (
                                        <table
                                          className={`table align-middle table-nowrap template-list-table template-list-hf-table ${
                                            !showProfessionType
                                              ? "template-list-hf-table--no-profession"
                                              : ""
                                          }`}
                                          id="customerTable"
                                        >
                                          <thead className="table-light table-header-font template-list-table-head">
                                            <tr className="head-row">
                                              <td
                                                className="tr-table-class text-white"
                                                style={{ width: "10%" }}
                                              >
                                                Template Name
                                                {primarySortDirectionObj.hfTemplateName ===
                                                  "desc" && (
                                                  <i
                                                    onClick={() => {
                                                      setSortType(
                                                        "HFTemplateName",
                                                      );
                                                      handleSort("asc");
                                                    }}
                                                    class="fas fa-sort-alpha-up ml-1"
                                                  ></i>
                                                )}
                                                {(primarySortDirectionObj.hfTemplateName ===
                                                  null ||
                                                  primarySortDirectionObj.hfTemplateName ===
                                                    "asc") && (
                                                  <i
                                                    onClick={() => {
                                                      setSortType(
                                                        "HFTemplateName",
                                                      );
                                                      handleSort(
                                                        primarySortDirectionObj.hfTemplateName ===
                                                          null
                                                          ? "asc"
                                                          : "desc",
                                                      );
                                                    }}
                                                    class="fas fa-sort-alpha-down  ml-1"
                                                  ></i>
                                                )}
                                              </td>

                                              <td className="tr-table-class text-white profession-type-column">
                                                {showProfessionType && (
                                                  <>
                                                    Profession Type
                                                    {primarySortDirectionObj.hfProfessionType ===
                                                      "desc" && (
                                                      <i
                                                        onClick={() => {
                                                          setSortType(
                                                            "HFProfessionType",
                                                          );
                                                          handleSort("asc");
                                                        }}
                                                        class="fas fa-sort-alpha-up ml-1"
                                                      ></i>
                                                    )}
                                                    {(primarySortDirectionObj.hfProfessionType ===
                                                      null ||
                                                      primarySortDirectionObj.hfProfessionType ===
                                                        "asc") && (
                                                      <i
                                                        onClick={() => {
                                                          setSortType(
                                                            "HFProfessionType",
                                                          );
                                                          handleSort(
                                                            primarySortDirectionObj.hfProfessionType ===
                                                              null
                                                              ? "asc"
                                                              : "desc",
                                                          );
                                                        }}
                                                        class="fas fa-sort-alpha-down  ml-1"
                                                      ></i>
                                                    )}
                                                  </>
                                                )}
                                              </td>
                                              {/* <td className="tr-table-class text-white profession-type-column">
                                    {showProfessionType && (
                                      <>
                                        Profession Type
                                        {primarySortDirectionObj.ProfessionType ===
                                          "desc" && (
                                            <i
                                              onClick={() => {
                                                setSortType("ProfessionType");
                                                handleSort("asc");
                                              }}
                                              class="fas fa-sort-alpha-up ml-1"
                                            ></i>
                                          )}
                                        {(primarySortDirectionObj.ProfessionType ===
                                          null ||
                                          primarySortDirectionObj.ProfessionType ===
                                          "asc") && (
                                            <i
                                              onClick={() => {
                                                setSortType("ProfessionType");
                                                handleSort(
                                                  primarySortDirectionObj.ProfessionType ===
                                                    null
                                                    ? "asc"
                                                    : "desc"
                                                );
                                              }}
                                              class="fas fa-sort-alpha-down  ml-1"
                                            ></i>
                                          )}
                                      </>
                                    )}
                                  </td> */}
                                              {/* {common.roleTypeId ===
                                    USER_ROLE_TYPE.SuperAdmin &&
                                    common.organisationKeyID === null ? (
                                    <td className="tr-table-class text-white">
                                      Business Type
                                      {primarySortDirectionObj.BusinessType ===
                                        "desc" && (
                                          <i
                                            onClick={() => {
                                              setSortType("BusinessType");
                                              handleSort("asc");
                                            }}
                                            class="fas fa-sort-alpha-up ml-1"
                                          ></i>
                                        )}
                                      {(primarySortDirectionObj.BusinessType ===
                                        null ||
                                        primarySortDirectionObj.BusinessType ===
                                        "asc") && (
                                          <i
                                            onClick={() => {
                                              setSortType("BusinessType");
                                              handleSort(
                                                primarySortDirectionObj.BusinessType ===
                                                  null
                                                  ? "asc"
                                                  : "desc"
                                              );
                                            }}
                                            class="fas fa-sort-alpha-down  ml-1"
                                          ></i>
                                        )}
                                    </td>
                                  ) : (
                                    <td className="tr-table-class text-white">
                                      <span className="invisible">
                                        Business Type
                                        {primarySortDirectionObj.BusinessType ===
                                          "desc" && (
                                            <i
                                              onClick={() => {
                                                setSortType("BusinessType");
                                                handleSort("asc");
                                              }}
                                              class="fas fa-sort-alpha-up ml-1"
                                            ></i>
                                          )}
                                        {(primarySortDirectionObj.BusinessType ===
                                          null ||
                                          primarySortDirectionObj.BusinessType ===
                                          "asc") && (
                                            <i
                                              onClick={() => {
                                                setSortType("BusinessType");
                                                handleSort(
                                                  primarySortDirectionObj.BusinessType ===
                                                    null
                                                    ? "asc"
                                                    : "desc"
                                                );
                                              }}
                                              class="fas fa-sort-alpha-down  ml-1"
                                            ></i>
                                          )}
                                      </span>
                                    </td>
                                  )} */}
                                              <td className="tr-table-class text-white">
                                                Template Type
                                                {primarySortDirectionObj.hfTemplateType ===
                                                  "desc" && (
                                                  <i
                                                    onClick={() => {
                                                      setSortType(
                                                        "HFTemplateType",
                                                      );
                                                      handleSort("asc");
                                                    }}
                                                    class="fas fa-sort-alpha-up ml-1"
                                                  ></i>
                                                )}
                                                {(primarySortDirectionObj.hfTemplateType ===
                                                  null ||
                                                  primarySortDirectionObj.hfTemplateType ===
                                                    "asc") && (
                                                  <i
                                                    onClick={() => {
                                                      setSortType(
                                                        "HFTemplateType",
                                                      );
                                                      handleSort(
                                                        primarySortDirectionObj.hfTemplateType ===
                                                          null
                                                          ? "asc"
                                                          : "desc",
                                                      );
                                                    }}
                                                    class="fas fa-sort-alpha-down  ml-1"
                                                  ></i>
                                                )}
                                              </td>
                                              {/* <td className="tr-table-class text-white">
                                    {prospectName} Type
                                    {primarySortDirectionObj.ProspectBusinessType ===
                                      "desc" && (
                                        <i
                                          onClick={() => {
                                            setSortType("ProspectBusinessType");
                                            handleSort("asc");
                                          }}
                                          class="fas fa-sort-alpha-up ml-1"
                                        ></i>
                                      )}
                                    {(primarySortDirectionObj.ProspectBusinessType ===
                                      null ||
                                      primarySortDirectionObj.ProspectBusinessType ===
                                      "asc") && (
                                        <i
                                          onClick={() => {
                                            setSortType("ProspectBusinessType");
                                            handleSort(
                                              primarySortDirectionObj.ProspectBusinessType ===
                                                null
                                                ? "asc"
                                                : "desc"
                                            );
                                          }}
                                          class="fas fa-sort-alpha-down  ml-1"
                                        ></i>
                                      )}
                                  </td> */}
                                              <td className="tr-table-class text-white">
                                                Status
                                              </td>
                                              <td className="tr-table-class text-white">
                                                {((userAccessData.Admin_Config_Template_CanEdit &&
                                                  common.organisationKeyID !==
                                                    null) ||
                                                  (userAccessData.Admin_Config_Template_CanDelete &&
                                                    common.organisationKeyID !==
                                                      null)) && <>Action</>}
                                              </td>
                                            </tr>
                                          </thead>
                                          <tbody className="list form-check-all">
                                            {TemplateHeaderFooterList.slice(
                                              0,
                                              isMobile
                                                ? isMobileRecords
                                                : desktopRecords,
                                            ).map((Template) => {
                                              return (
                                                <tr className="table_new table-content-font template-list-row">
                                                  <td className="table_new table-content-font template-list-name-column">
                                                    {/* {Template.notifySAChanges !== null && common.organisationKeyID !== null && (
                                          <>
                                            <Tooltip
                                              title="View System Administrator Changes"

                                            >
                                              <span onClick={() =>
                                                TemplateEditBtnClicked(
                                                  Template, "editPredefined"
                                                )
                                              }
                                                className="UpdateConfigValue"
                                              // data-bs-toggle="modal"

                                              // data-bs-target="#addUpdateModal"
                                              ><i className="fa fa-regular fa-bell"></i></span>
                                            </Tooltip>
                                          </>
                                        )} */}
                                                    {isMobile ? (
                                                      <>
                                                        {Template.hfTemplateName
                                                          .length > 20
                                                          ? Template.hfTemplateName
                                                              .substring(0, 20)
                                                              .toLowerCase()
                                                              .replace(
                                                                /\b\w/g,
                                                                (l) =>
                                                                  l.toUpperCase(),
                                                              ) + "..."
                                                          : Template.hfTemplateName
                                                              .substring(0, 20)
                                                              .toLowerCase()
                                                              .replace(
                                                                /\b\w/g,
                                                                (l) =>
                                                                  l.toUpperCase(),
                                                              )}
                                                      </>
                                                    ) : (
                                                      <>
                                                        {Template.hfTemplateName
                                                          .length > 48 ? (
                                                          !showProfessionType ? (
                                                            <Tooltip
                                                              title={
                                                                Template.hfTemplateName
                                                              }
                                                            >
                                                              {Template.hfTemplateName
                                                                .substring(
                                                                  0,
                                                                  78,
                                                                )
                                                                .toLowerCase()
                                                                .replace(
                                                                  /\b\w/g,
                                                                  (l) =>
                                                                    l.toUpperCase(),
                                                                ) + "..."}
                                                            </Tooltip>
                                                          ) : (
                                                            <Tooltip
                                                              title={
                                                                Template.hfTemplateName
                                                              }
                                                            >
                                                              {Template.hfTemplateName
                                                                .substring(
                                                                  0,
                                                                  48,
                                                                )
                                                                .toLowerCase()
                                                                .replace(
                                                                  /\b\w/g,
                                                                  (l) =>
                                                                    l.toUpperCase(),
                                                                ) + "..."}
                                                            </Tooltip>
                                                          )
                                                        ) : (
                                                          <>
                                                            {Template.hfTemplateName
                                                              .toLowerCase()
                                                              .replace(
                                                                /\b\w/g,
                                                                (l) =>
                                                                  l.toUpperCase(),
                                                              )}
                                                          </>
                                                        )}
                                                      </>
                                                    )}
                                                  </td>
                                                  <td className="table-content-font">
                                                    {showProfessionType &&
                                                      Template.professionTypeNames}
                                                  </td>

                                                  <td className="table-content-font">
                                                    {Template.templateTypeID ===
                                                    41
                                                      ? "Custom Template"
                                                      : ""}
                                                  </td>
                                                  {/* {common.roleTypeId ===
                                        USER_ROLE_TYPE.SuperAdmin &&
                                        common.organisationKeyID === null ? (
                                        <td>{Template.orgBusinessType}</td>
                                      ) : (
                                        <td>&nbsp;</td>
                                        )} */}
                                                  {/* <td> */}
                                                  {/* {Template.templateType == "Contract"
                                          ? `${EngagementName}`
                                          : `${proposalName}`} */}
                                                  {/* </td> */}
                                                  {/* <td className="Switch">
                                        <div
                                          style={{
                                            alignItems: "none",
                                            marginLeft:
                                              ((userAccessData.Admin_Config_Template_CanEdit &&
                                                common.organisationKeyID !==
                                                null) ||
                                                (userAccessData.SuperAdmin_Config_Template_CanEdit &&
                                                  common.organisationKeyID ===
                                                  null)) &&
                                                ((userAccessData.Admin_Config_Template_CanDelete &&
                                                  common.organisationKeyID !==
                                                  null) ||
                                                  (userAccessData.SuperAdmin_Config_Template_CanDelete &&
                                                    common.organisationKeyID ===
                                                    null))
                                                ? ""
                                                : "10px",
                                          }}
                                          class="d-flex gap-2 "
                                        >
                                          <div style={{ width: "20px" }}>
                                            {" "}
                                            {Template.isDefault === 1 ? 'Yes' : 'No'}
                                          </div>
                                          {((userAccessData.Admin_Config_Template_CanDelete &&
                                            common.organisationKeyID !==
                                            null) ||
                                            (userAccessData.SuperAdmin_Config_Template_CanDelete &&
                                              common.organisationKeyID ===
                                              null)) && (
                                              <Tooltip
                                                title={getCrudButtonToolTipName(
                                                  "Change Is Default"
                                                )}
                                              >
                                                <FormGroup>
                                                  <FormControlLabel
                                                    control={
                                                      <Android12Switch
                                                        onClick={() =>
                                                          setModelRequestData({
                                                            ...modelRequestData,
                                                            professionTypeNames:
                                                              Template.professionTypeNames,
                                                            BusinessTypeName:
                                                              Template.orgBusinessType,
                                                            status:
                                                              Template.status,
                                                            templateKeyID:
                                                              Template.templateKeyID,
                                                            StatusType:
                                                              "IsDefault",
                                                            isDefault:
                                                              Template.isDefault ===
                                                                1
                                                                ? false
                                                                : true,
                                                            Action: "Status",
                                                          })
                                                        }
                                                        checked={
                                                          Template.isDefault ===
                                                          1
                                                        }
                                                        data-bs-toggle="modal"
                                                        data-bs-target="#ConfirmModel"
                                                      />
                                                    }
                                                  />
                                                </FormGroup>
                                              </Tooltip>
                                            )}
                                        </div>
                                      </td> */}
                                                  <td className="Switch">
                                                    <div
                                                      style={{
                                                        alignItems: "none",
                                                        marginLeft:
                                                          userAccessData.Admin_Config_Template_CanEdit &&
                                                          common.organisationKeyID !==
                                                            null &&
                                                          userAccessData.Admin_Config_Template_CanDelete &&
                                                          common.organisationKeyID !==
                                                            null
                                                            ? ""
                                                            : "10px",
                                                      }}
                                                      class="d-flex gap-2 "
                                                    >
                                                      <span
                                                        className={`template-list-status-badge ${
                                                          Template.status === 1
                                                            ? "is-active"
                                                            : "is-inactive"
                                                        }`}
                                                      >
                                                        {Template.status === 1
                                                          ? "Active"
                                                          : "Inactive"}
                                                      </span>
                                                      {userAccessData.Admin_Config_Template_CanDelete &&
                                                        common.organisationKeyID !==
                                                          null && (
                                                          <Tooltip
                                                            title={getCrudButtonToolTipName(
                                                              "Change Status",
                                                            )}
                                                          >
                                                            <FormGroup>
                                                              <FormControlLabel
                                                                control={
                                                                  <Android12Switch
                                                                    onClick={() =>
                                                                      setModelRequestData(
                                                                        {
                                                                          ...modelRequestData,
                                                                          status:
                                                                            Template.status,
                                                                          hfTemplateKeyID:
                                                                            Template.hfTemplateKeyID,
                                                                          userKeyID:
                                                                            common.userKeyID,

                                                                          StatusType:
                                                                            null,
                                                                          Action:
                                                                            "Status",
                                                                        },
                                                                      )
                                                                    }
                                                                    checked={
                                                                      Template.status ===
                                                                      1
                                                                    }
                                                                    data-bs-toggle="modal"
                                                                    data-bs-target="#ConfirmModel"
                                                                  />
                                                                }
                                                              />
                                                            </FormGroup>
                                                          </Tooltip>
                                                        )}
                                                    </div>
                                                  </td>
                                                  <td className="template-list-actions-cell">
                                                    <div className="d-flex gap-2 template-list-row-actions">
                                                      {userAccessData.Admin_Config_Template_CanEdit &&
                                                        common.organisationKeyID !==
                                                          null && (
                                                          <Tooltip
                                                            title={getCrudButtonToolTipName(
                                                              "Update",
                                                              moduleNameForHeaderFooter,
                                                            )}
                                                          >
                                                            <div class="edit">
                                                              <button
                                                                onClick={() =>
                                                                  TemplateHeaderFooterEditBtnClicked(
                                                                    Template,
                                                                    "edit",
                                                                  )
                                                                }
                                                                class="btn btn-sm btn-success edit-item-btn actionButtonsStyle"
                                                              >
                                                                <i className="ri-pencil-fill"></i>
                                                              </button>
                                                            </div>
                                                          </Tooltip>
                                                        )}
                                                      {userAccessData.Admin_Config_Template_CanDelete &&
                                                        common.organisationKeyID !==
                                                          null && (
                                                          <Tooltip
                                                            title={getCrudButtonToolTipName(
                                                              "Delete",
                                                              moduleNameForHeaderFooter,
                                                            )}
                                                          >
                                                            <div class="remove">
                                                              <button
                                                                onClick={() =>
                                                                  setModelRequestData(
                                                                    {
                                                                      ...modelRequestData,
                                                                      hfTemplateKeyID:
                                                                        Template.hfTemplateKeyID,
                                                                      templateName:
                                                                        Template.hfTemplateName,
                                                                      userKeyID:
                                                                        common.userKeyID,
                                                                      Action:
                                                                        "Delete",
                                                                    },
                                                                  )
                                                                }
                                                                class="btn btn-sm btn-danger remove-item-btn actionButtonsStyle"
                                                                data-bs-toggle="modal"
                                                                data-bs-target="#ConfirmModel"
                                                              >
                                                                <i className="ri-delete-bin-5-fill"></i>
                                                              </button>
                                                            </div>
                                                          </Tooltip>
                                                        )}
                                                    </div>
                                                  </td>
                                                </tr>
                                              );
                                            })}
                                          </tbody>
                                        </table>
                                      )}
                                    </div>
                                    {activeTab === "Templates" && (
                                      <div>
                                        {totalRecords <= 0 && (
                                          <NoResultFoundModel
                                            name={moduleName}
                                            totalRecords={totalRecords}
                                          />
                                        )}
                                      </div>
                                    )}
                                    {activeTab === "Templates PDF" && (
                                      <div>
                                        {totalRecords <= 0 && (
                                          <NoResultFoundModel
                                            name={moduleNameForTemplatePdf}
                                            totalRecords={totalRecords}
                                          />
                                        )}
                                      </div>
                                    )}
                                    {activeTab === "Header and Footer" && (
                                      <div>
                                        {totalRecords <= 0 && (
                                          <NoResultFoundModel
                                            name={moduleNameForHeaderFooter}
                                            totalRecords={totalRecords}
                                          />
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {activeTab === "Templates" && (
                                  <div className="template-list-pagination">
                                    {listCount > Number(pageSize) && (
                                      <PaginationComponent
                                        totalCount={listCount}
                                        totalPages={
                                          isMobile
                                            ? Math.ceil(
                                                listCount / isMobileRecords,
                                              )
                                            : Math.ceil(
                                                listCount / desktopRecords,
                                              )
                                        }
                                        currentPage={currentPage}
                                        onPageChange={handlePageChange}
                                      />
                                    )}
                                  </div>
                                )}
                                {activeTab === "Templates PDF" && (
                                  <div className="template-list-pagination">
                                    {pdfListCount > pageSize && (
                                      <PaginationComponent
                                        totalCount={pdfListCount}
                                        totalPages={totalPdfPage}
                                        currentPage={currentPageUsers}
                                        onPageChange={HandlePageChangeUsers}
                                      />
                                    )}
                                  </div>
                                )}
                                {activeTab === "Header and Footer" && (
                                  <div className="template-list-pagination">
                                    {HeaderFooterListCount > pageSize && (
                                      <PaginationComponent
                                        totalCount={HeaderFooterListCount}
                                        totalPages={
                                          isMobile
                                            ? Math.ceil(
                                                HeaderFooterListCount /
                                                  isMobileRecords,
                                              )
                                            : Math.ceil(
                                                HeaderFooterListCount /
                                                  desktopRecords,
                                              )
                                        }
                                        currentPage={currentPageUsers}
                                        onPageChange={handlePageChange}
                                      />
                                    )}
                                  </div>
                                )}
                                {/* */}
                              </div>
                              {/* end card  */}
                            </div>
                            {/* end col */}
                          </div>
                          {/* end col  */}
                        </div>
                        {/* end row */}
                      </div>
                      {/* container-fluid  */}
                    </div>
                    <FilterModel
                      class="modal fade"
                      id="FilterModel"
                      tabIndex="-1"
                      aria_labelledby="exampleModalLabel"
                      aria_hidden="true"
                      data-bs-backdrop="static"
                      data-bs-keyboard="false"
                      ModuleName={moduleName}
                      isFilterApply={isFilterApply}
                      setIsFilterApply={setIsFilterApply}
                      ApplyFilter={ApplyFilter}
                      businessTypeID={businessTypeID}
                      setBusinessTypeID={setBusinessTypeID}
                      selectedTemplateType={selectedTemplateType}
                      setSelectedTemplateType={setSelectedTemplateType}
                      prospectType={prospectType}
                      setProspectType={setProspectType}
                    />

                    <ErrorModel
                      ErrorModel={openErrorModal}
                      handleClose={handleClose}
                      ErrorMessage={formattedErrorMessage}
                    />
                    {/* Confirm Modal  */}
                    {activeTab === "Templates PDF" && (
                      <>
                        <ConfirmModel
                          openErrorModal={openErrorModal}
                          openSuccessModal={openSuccessModal}
                          modelRequestData={modelRequestData}
                          UpdatedStatus={
                            modelRequestData.Action === "Delete" ||
                            modelRequestData.Action === "Status"
                              ? TemplatePdfChangeStatusDataAndDeleteData
                              : CopyTemplatePdfData
                          }
                        />
                        <RecordsAvailablePopupModel
                          handleClose={handleClose}
                          openErrorModal={openErrorModal}
                          openSuccessModal={openSuccessModal}
                          modelRequestData={modelRequestData}
                          UpdatedStatus={
                            TemplatePdfChangeStatusDataAndDeleteData
                          }
                        />
                      </>
                    )}
                    {activeTab === "Templates" && (
                      <>
                        <ConfirmModel
                          openErrorModal={openErrorModal}
                          openSuccessModal={openSuccessModal}
                          modelRequestData={modelRequestData}
                          UpdatedStatus={
                            modelRequestData.Action === "Delete" ||
                            modelRequestData.Action === "Status"
                              ? TemplateChangeStatusDataAndDeleteData
                              : CopyTemplateData
                          }
                        />
                        <RecordsAvailablePopupModel
                          handleClose={handleClose}
                          openErrorModal={openErrorModal}
                          openSuccessModal={openSuccessModal}
                          modelRequestData={modelRequestData}
                          UpdatedStatus={TemplateChangeStatusDataAndDeleteData}
                        />
                      </>
                    )}
                    {activeTab === "Header and Footer" && (
                      <>
                        <ConfirmModel
                          openErrorModal={openErrorModal}
                          openSuccessModal={openSuccessModal}
                          modelRequestData={modelRequestData}
                          UpdatedStatus={
                            TemplateHeaderFooterChangeStatusAndDeleteData
                          }
                        />
                        <RecordsAvailablePopupModel
                          handleClose={handleClose}
                          openErrorModal={openErrorModal}
                          openSuccessModal={openSuccessModal}
                          modelRequestData={modelRequestData}
                          UpdatedStatus={
                            TemplateHeaderFooterChangeStatusAndDeleteData
                          }
                        />
                      </>
                    )}
                    {activeTab === "Templates PDF" && (
                      <>
                        <SuccessModal
                          handleClose={handleClose}
                          setOpenSuccessModal={setOpenSuccessModal}
                          openSuccessModal={openSuccessModal}
                          modelAction={modelRequestData.Action}
                          message={`${
                            modelRequestData.Action === "Delete"
                              ? `${moduleNameForTemplatePdf} ${modelRequestData.templatePdfTitle}`
                              : modelRequestData.Action === "Copy"
                                ? `Copy of ${modelRequestData.templatePdfTitle} has been created successfully!`
                                : "Status has been changed successfully!"
                          }`}
                        />
                      </>
                    )}
                    {activeTab === "Templates" && (
                      <>
                        <SuccessModal
                          handleClose={handleClose}
                          setOpenSuccessModal={setOpenSuccessModal}
                          openSuccessModal={openSuccessModal}
                          modelAction={modelRequestData.Action}
                          message={`${
                            modelRequestData.Action === "Delete"
                              ? `${moduleName} ${modelRequestData.templateName}`
                              : modelRequestData.Action === "Copy"
                                ? `Copy of ${modelRequestData.templateName} has been created successfully!`
                                : "Status has been changed successfully!"
                          }`}
                        />
                      </>
                    )}
                    {activeTab === "Header and Footer" && (
                      <>
                        <SuccessModal
                          handleClose={handleClose}
                          setOpenSuccessModal={setOpenSuccessModal}
                          openSuccessModal={openSuccessModal}
                          modelAction={modelRequestData.Action}
                          message={`${
                            modelRequestData.Action === "Delete"
                              ? `${moduleNameForHeaderFooter} ${modelRequestData.templateName}`
                              : "Status has been changed successfully!"
                          }`}
                        />
                      </>
                    )}
                    {/* Success Modal  */}

                    {/* End Page-content */}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* start back-to-top */}
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="btn btn-danger btn-icon"
          id="back-to-top"
        >
          <i className="ri-arrow-up-line"></i>
        </button>
        {/* end back-to-top */}
      </div>

      <div className="template-list-footer-wrap">
        <Footer />
      </div>
    </>
  );
}

export default Predefined_Templates;
