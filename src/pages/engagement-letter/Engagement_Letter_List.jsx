/* global $ */
import React, { useContext, useState, useEffect, useRef } from "react";
import CommonButtonComponent from "../../components/CommonButtonComponent";
import { useNavigate, useLocation } from "react-router-dom";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import "./Engagement_Letter.css";
import Utils from "../../Middleware/Utils";
import { AuthContextProvider } from "../../AuthContext/AuthContext";
import dayjs from "dayjs";
import DatePicker from "react-date-picker";
import "react-date-picker/dist/DatePicker.css";
import "react-calendar/dist/Calendar.css";
import DropDown from "../../components/DropDown";
import Footer from "../../components/Footer";
import Select from "react-select";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import NoResultFoundModel from "../../components/NoResultFoundModel";
import Tooltip, { tooltipClasses } from "@mui/material/Tooltip";
import { useDispatch, useSelector } from "react-redux";
import {
  ChangeContractStatus,
  CopyContract,
  DeleteContract,
  DeleteSingleApiContract,
  GetEngagementList,
  GetOldEngagementList,
  VoidContract,
  ArchiveContract,
} from "../../redux/Services/EngagementLetter/EngagementLetterApi";
import PaginationComponent from "../../components/PaginationModel";
import {
  CalenderFilterEnum,
  statusID,
  statusNames,
} from "../../Middleware/enums";
import FilterModel from "../../components/FilterModel";
import * as XLSX from "xlsx";
import { GetProspectTypeVariationLookupList } from "../../redux/Services/Master/BusinessTypeLookupListApi";
import { GetNOBTypeLookupList } from "../../redux/Services/Master/NOBTypeLookupListApi";
import { GetServiceUpdatedAfterSendingQuoteOrContract } from "../../redux/Services/Config/ServicesApi";
import {
  DownloadDocumentAsZip,
  ResendContract,
} from "../../redux/Services/SignEasy";
import ViewPlan from "../../components/ViewPlan";
import { Base_Url } from "../../Base-Url/Base_Url";
import ConfirmModel from "../../components/ConfirmationBox";
import SuccessModal from "../../components/SuccessModal";
import ErrorModel from "../../components/ErrorModel";
import Android12Switch from "../../components/AndroidSwitch";
import {
  ChangeFailedMailLogStatus,
  GetProspectSendMailStatus,
} from "../../redux/Services/EmailFailureStatusAPI/EmailFailureStatusAPI";
import EmailFailurePopUP from "../../components/EmailFailurePopUp";
import { CreateEngagementInvoice } from "../../redux/reducer/engagementSlice";

const Engagement_Letter = () => {
  let getEngagementListApiCallCount = 0;
  const dispatch = useDispatch();

  // Declare State
  const [modelRequestData, setModelRequestData] = useState({
    message: null,
    contractKeyID: null,
    Action: null,
    status: null,
    ProposalId: null,
    keyID: null,
    SearchKeyword: "",
    refId: null,
    isSigned: null,
  });
  const [totalRecords, setTotalRecords] = useState(-1);
  const [remainingESignatures, setRemainingESignatures] = useState(null);
  const [totalSingleRecords, setTotalSingleRecords] = useState(-1);
  const [emailError, setEmailError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [openErrorModal, setOpenErrorModal] = useState(false);
  const [organisationsList, setOrganisationsList] = useState([]);
  const [formDateOfCalenderForExport, setFormDateOfCalenderForExport] =
    useState(null);
  const [toDateCalenderForExport, setToDateCalenderForExport] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [OldElSearchKeyword, setSearchOldELKeyword] = useState("");
  const [SingleElSearchKeyword, setSearchSingleELKeyword] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [ElCurrentPage, setOldElCurrentPage] = useState(1);
  const [SingleElCurrentPage, setSingleElCurrentPage] = useState(1);
  const location = useLocation();
  const common = useSelector((state) => state.Storage);
  const [title, setTitle] = useState("");
  const [isAddUpdateActionDone, setIsAddUpdateActionDone] = useState(false);
  const [isCopyPending, setIsCopyPending] = useState(false);
  const [engagementList, setEngagementList] = useState([]);
  const [OldEngagementList, setOldEngagementList] = useState([]);
  const [SingleEngagementList, setSingleEngagementList] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [activeTab, setActiveTab] = useState("NewEL");
  const [oldElListCount, setOldElListCount] = useState(0);
  const [SingleElListCount, setSingleElListCount] = useState(0);
  const [openEmailFailurePopUp, setOpenEmailFailurePopUp] = useState(false);
  const [hasWebElData, setHasWebElData] = useState(false);
  const [emailCheckModel, setEmailCheckModel] = useState({
    MethodName: "",
  });
  const hasCheckedWebEl = useRef(false);

  const {
    EngagementName,
    prospectName,
    getCrudButtonTextName,
    getPlaceholderTextName,
    getCrudButtonToolTipName,
    setTopbar,
    setLoader,
    maxCountToRecallApi,
    activeOrganizationSubscriptionPlan,
    totalPage,
    isMobile,
    setListCount,
    listCount,
    desktopRecords,
    isMobileRecords,
    userAccessData,
    GetCustomDate,
    formatValue,
  } = useContext(AuthContextProvider);
  const totalOldELPage = isMobile
    ? Math.ceil(oldElListCount / isMobileRecords)
    : Math.ceil(
        oldElListCount /
          (desktopRecords > 5 && window.innerHeight == 652
            ? 5
            : desktopRecords),
      );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedOption, setSelectedOption] = useState("");
  const [fromDate, setFromDate] = useState(null);
  const [openSuccessModal, setOpenSuccessModal] = React.useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [toDate, setToDate] = useState(null);
  const [status, setStatus] = useState("");
  const [businessNatureID, setBusinessNatureID] = useState(null);
  const [isFilterApply, setIsFilterApply] = useState(false);
  const [prospectType, setProspectType] = useState(null);
  const navigate = useNavigate();
  const isCurrentPage =
    common.currentPage === "" ? currentPage : common.currentPage;

  const pageSize = isMobile
    ? isMobileRecords
    : desktopRecords > 5 && window.innerHeight == 652
      ? 5
      : desktopRecords;

  useEffect(() => {
    setTopbar("block");
    // GetEngagementListData(isCurrentPage);
    GetOldEngagementListData(1);
    GetEngagementListForSingleApiData(1);
  }, []);

  useEffect(() => {
    if (location.state && location.state.proposalType !== null) {
      const FromDate = location.state.fromDate
        ? dayjs(location.state.fromDate).format("YYYY-MM-DD")
        : null;
      const ToDate = location.state.toDate
        ? dayjs(location.state.toDate).format("YYYY-MM-DD")
        : null;

      setStatus(location.state.proposalType);
      setSelectedOption(location.state.selectedOption);
      setFromDate(FromDate);
      setToDate(ToDate);
      if (location?.state?.selectedOption?.label === "Custom Date Range") {
        setShowDatePicker(true);
      }
      setIsFilterApply(true);
      // Set currentPage to 1 when location.state changes
      setCurrentPage(1);
      GetEngagementListData(
        currentPage,
        null,
        location.state.proposalType,
        FromDate,
        ToDate,
        businessNatureID,
        prospectType,
      );
    } else {
      GetEngagementListData(
        currentPage,
        null,
        status,
        fromDate,
        toDate,
        businessNatureID,
        prospectType,
        false,
      );
    }
  }, [
    location.state?.proposalType,
    location.state?.fromDate,
    location.state?.toDate,
    location.state?.selectedOption,
  ]);

  useEffect(() => {
    if (
      modelRequestData.Action === "Update" ||
      modelRequestData.Action === "View" ||
      modelRequestData.Action === null
    ) {
      if (
        modelRequestData.Action === "Update" &&
        modelRequestData.contractKeyID !== null
      ) {
        setTopbar("none");
        navigate("/add-engagement-letter", { state: modelRequestData });
      } else if (modelRequestData.Action === "View") {
        navigate("/view-letter", { state: modelRequestData });
      }
      // else if (
      //   modelRequestData.contractKeyID === null &&
      //   modelRequestData.Action === null
      // ) {
      //   setTopbar("none");
      //   navigate("/add-engagement-letter", { state: modelRequestData });
      // }
    }
  }, [modelRequestData]);
  //new Contract List
  const GetEngagementListData = async (
    i,
    searchKeywordValue,
    Status,
    FromDate,
    ToDate,
    businessNatureId,
    prospectTypeId,
    exportPageSize,
  ) => {
    setLoader(true);
    const pageNoList = i - 1;
    try {
      const data = await GetEngagementList({
        pageSize: exportPageSize ? 30 : Number(pageSize),
        pageNo: pageNoList,
        organisationKeyID: common.organisationKeyID,
        searchKeyword:
          searchKeywordValue === undefined ? searchKeyword : searchKeywordValue,
        StatusID: Status !== undefined ? Status : status,
        userKeyID: common.userKeyID || null,
        fromDate:
          FromDate === undefined
            ? fromDate === ""
              ? null
              : fromDate
            : FromDate,
        toDate: ToDate === undefined ? (toDate === "" ? null : toDate) : ToDate,
        businessTypeID:
          prospectTypeId === undefined ? prospectType : prospectTypeId,
        businessNatureID:
          businessNatureId === undefined ? businessNatureID : businessNatureId,
        contractsFor: "Outbooks",
      });

      if (data) {
        setRemainingESignatures(data?.data?.responseData?.remainingESignatures);
        if (data?.data?.statusCode === 200) {
          setLoader(false);
          getEngagementListApiCallCount = 0;
          if (data?.data?.responseData?.data) {
            const engagementList = data?.data?.responseData?.data;
            const totalCount = data.data.totalCount;
            if (pageNoList > 0 && engagementList.length === 0) {
              let newPaneNo = Number(pageNoList);
              if (newPaneNo > 1) {
                newPaneNo = newPaneNo - 1;
              }
              GetEngagementListData(newPaneNo, searchKeywordValue);
              setCurrentPage(pageNoList);
              return;
            }
            setListCount(totalCount);
            setEngagementList(engagementList);
            setTotalRecords(engagementList.length);
          }
        } else {
          if (getEngagementListApiCallCount < maxCountToRecallApi) {
            getEngagementListApiCallCount += 1;
            setTimeout(function () {
              GetEngagementListData(i, searchKeywordValue);
            }, 2000);
          } else {
            setLoader(false);
          }

          setErrorMessage(data?.data?.errorMessage);
        }
        return data;
      }
    } catch (error) {
      console.log(error);
    }
  };
  //old Contract List
  const GetOldEngagementListData = async (
    i,
    searchKeywordValue,
    Status,
    FromDate,
    ToDate,
  ) => {
    setLoader(true);

    const pageNoList = i - 1;
    try {
      const data = await GetOldEngagementList({
        pageSize: pageSize,
        pageNo: pageNoList,
        organisationKeyID: common.organisationKeyID,
        searchKeyword:
          searchKeywordValue === undefined
            ? OldElSearchKeyword
            : searchKeywordValue,
        StatusID: Status !== undefined ? Status : status,
        userKeyID: common.userKeyID || null,
        fromDate: FromDate === undefined ? fromDate : FromDate,
        toDate: ToDate === undefined ? toDate : ToDate,
      });

      if (data) {
        if (data?.data?.statusCode === 200) {
          setLoader(false);
          getEngagementListApiCallCount = 0;
          if (data?.data?.responseData?.data) {
            const engagementList = data?.data?.responseData?.data;
            const totalCount = data.data.totalCount;
            if (pageNoList > 0 && engagementList.length === 0) {
              let newPaneNo = Number(pageNoList);
              if (newPaneNo > 1) {
                newPaneNo = newPaneNo - 1;
              }
              GetOldEngagementListData(newPaneNo, searchKeywordValue);
              setOldElCurrentPage(pageNoList);
              return;
            }
            setOldElListCount(totalCount);
            setOldEngagementList(engagementList);
            // setTotalRecords(engagementList.length);
          }
        } else {
          if (getEngagementListApiCallCount < maxCountToRecallApi) {
            getEngagementListApiCallCount += 1;
            setTimeout(function () {
              GetOldEngagementListData(i, searchKeywordValue);
            }, 2000);
          } else {
            setLoader(false);
          }

          setErrorMessage(data?.data?.errorMessage);
        }
        return data;
      }
    } catch (error) {
      console.log(error);
    }
  };

  //Single Api List
  const GetEngagementListForSingleApiData = async (
    i,
    searchKeywordValue,
    Status,
    FromDate,
    ToDate,
    businessNatureId,
    prospectTypeId,
  ) => {
    setLoader(true);
    const pageNoList = i - 1;
    try {
      const data = await GetEngagementList({
        pageSize: Number(pageSize),
        pageNo: pageNoList,
        organisationKeyID: common.organisationKeyID,
        searchKeyword:
          searchKeywordValue === undefined ? searchKeyword : searchKeywordValue,
        StatusID: Status !== undefined ? Status : status,
        userKeyID: common.userKeyID || null,
        fromDate:
          FromDate === undefined
            ? fromDate === ""
              ? null
              : fromDate
            : FromDate,
        toDate: ToDate === undefined ? (toDate === "" ? null : toDate) : ToDate,
        businessTypeID:
          prospectTypeId === undefined ? prospectType : prospectTypeId,
        businessNatureID:
          businessNatureId === undefined ? businessNatureID : businessNatureId,
        contractsFor: "SingleApi",
      });

      if (data) {
        if (data?.data?.statusCode === 200) {
          setLoader(false);
          getEngagementListApiCallCount = 0;
          if (data?.data?.responseData?.data) {
            const engagementList = data?.data?.responseData?.data;
            const totalCount = data.data.totalCount;
            if (pageNoList > 0 && engagementList.length === 0) {
              let newPaneNo = Number(pageNoList);
              if (newPaneNo > 1) {
                newPaneNo = newPaneNo - 1;
              }
              GetEngagementListForSingleApiData(newPaneNo, SingleElSearchKeyword);
              setSingleElCurrentPage(pageNoList);
              return;
            }
            setSingleElListCount(totalCount);
            setSingleEngagementList(engagementList);
            setTotalSingleRecords(engagementList.length);

            if (!hasCheckedWebEl.current) {
              hasCheckedWebEl.current = true;
              setHasWebElData(engagementList.length > 0);
            }
          }
        } else {
          if (getEngagementListApiCallCount < maxCountToRecallApi) {
            getEngagementListApiCallCount += 1;
            setTimeout(function () {
              GetEngagementListForSingleApiData(i, searchKeywordValue);
            }, 2000);
          } else {
            setLoader(false);
          }

          setErrorMessage(data?.data?.errorMessage);
        }
        return data;
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleCloseModel = () => {
    setShowModal(false);
  };

  const handleExport = async () => {
    let OrganisationList = localStorage.getItem("OrganisationLocalList");
    let OrganisationListData = [];
    if (OrganisationList) {
      OrganisationListData = JSON.parse(OrganisationList);
    }
    const orgName = OrganisationListData.find(
      (org) => org.organisationKeyID == common.organisationKeyID,
    );
    let BusinessTypeListData = [];
    const ProspectData = await GetProspectTypeVariationLookupList(
      common.organisationKeyID,
      common.userKeyID,
    );
    if (ProspectData?.data?.statusCode === 200) {
      if (ProspectData?.data?.responseData?.data) {
        BusinessTypeListData = ProspectData?.data?.responseData?.data;
        BusinessTypeListData = BusinessTypeListData.map((BusinessType) => ({
          value: BusinessType.businessTypeID,
          label: BusinessType.businessTypeName,
        }));
      }
    }
    let NoBTypeListData = [];
    const NOBType = await GetNOBTypeLookupList(
      common.organisationKeyID,
      common.userKeyID,
    );
    if (NOBType?.data?.statusCode === 200) {
      if (NOBType?.data?.responseData?.data) {
        NoBTypeListData = NOBType?.data?.responseData?.data;
        NoBTypeListData = NoBTypeListData.map((NOB) => ({
          value: NOB.businessNatureID,
          label: NOB.businessNatureName,
        }));
      }
    }
    try {
      const data = await GetEngagementList({
        organisationKeyID: common.organisationKeyID,
        pageSize: 30,
        pageNo: 0,
        SearchKeyword: searchKeyword,
        StatusID: status,
        userKeyID: common.userKeyID || null,
        fromDate: fromDate === "" ? null : fromDate,
        toDate: toDate === "" ? null : toDate,
        businessTypeID: prospectType,
        businessNatureID: businessNatureID,
        contractsFor: "Outbooks",
      });

      const singleApiData = await GetEngagementList({
        organisationKeyID: common.organisationKeyID,
        pageSize: 30,
        pageNo: 0,
        SearchKeyword: searchKeyword,
        StatusID: status,
        userKeyID: common.userKeyID || null,
        fromDate: fromDate === "" ? null : fromDate,
        toDate: toDate === "" ? null : toDate,
        businessTypeID: prospectType,
        businessNatureID: businessNatureID,
        contractsFor: "SingleApi",
      });

      if (data && data.data.statusCode === 200) {
        if (data.data.responseData.data.length > 0) {
          const EngagementListData = data.data.responseData.data;
          const statusName =
            Utils.EngagementLetterStatus.find((option) => option.value === status)?.label || "";
          const reportingPeriod =
            Utils.CalenderFilter.find((option) => option.value === selectedOption.value)?.label || "";
          const businessTypeName =
            BusinessTypeListData.find((item) => item.value == prospectType)?.label || "";
          const businessNatureName =
            NoBTypeListData.find((item) => item.value == businessNatureID)?.label || "";

          const headers = {
            "Practice Name": orgName.organisationName,
            "Filter Status": statusName,
            "Reporting Period Filter": reportingPeriod,
            "Business Nature Filter": businessNatureName,
            "Business Type Filter": businessTypeName,
            "Total Engagement Letters (Engagement Data)": EngagementListData.length,
            "Total Engagement Letters (API Engagement Data)":
              singleApiData?.data?.statusCode === 200
                ? singleApiData?.data?.responseData?.data?.length || 0
                : 0,
          };

          const engagement = `${EngagementName} Name`;
          const engagementPdf = `${EngagementName} PDF`;

          const mapEngagementRows = (list) =>
            list.map((item) => ({
              "Ref Id": item.prefix,
              [engagement]: item.clientName,
              "One Off Price": `£ ${item.oneOffPrice !== null ? item.oneOffPrice : "0.00"}`,
              "Recurring Price": `£ ${item.recurringPrice !== null ? item.recurringPrice : "0.00"}`,
              "Status Name": item.statusName,
              [engagementPdf]: item.documents,
              "Last Updated On": item.lastUpdatedOn,
            }));

          const engagementHeaderRow = [
            "Ref Id",
            engagement,
            "One Off Price",
            "Recurring Price",
            "Status Name",
            engagementPdf,
            "Last Updated On",
          ];

          const toRows = (mappedList) =>
            mappedList.map((item) => [
              item["Ref Id"],
              item[engagement],
              item["One Off Price"],
              item["Recurring Price"],
              item["Status Name"],
              item[engagementPdf],
              item["Last Updated On"],
            ]);

          const setColWidths = (sheet, sheetData) => {
            const widths = sheetData.reduce((w, row) => {
              row.forEach((cell, i) => {
                const val = cell !== null && cell !== undefined ? String(cell) : "";
                w[i] = Math.max(w[i] || 0, val.length);
              });
              return w;
            }, []);
            sheet["!cols"] = widths.map((w) => ({ wch: w + 2 }));
          };

          const workbook = XLSX.utils.book_new();

          // Sheet 1: Summary/filters (now includes both counts)
          const headersArray = Object.entries(headers).map(([key, value]) => [key, value]);
          const summarySheet = XLSX.utils.aoa_to_sheet(headersArray);
          setColWidths(summarySheet, headersArray);
          XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");

          // Sheet 2: Engagement data (Outbooks)
          const engagementRows = toRows(mapEngagementRows(EngagementListData));
          const engagementSheetData = [engagementHeaderRow, ...engagementRows];
          const engagementSheet = XLSX.utils.aoa_to_sheet(engagementSheetData);
          setColWidths(engagementSheet, engagementSheetData);
          XLSX.utils.book_append_sheet(workbook, engagementSheet, "Engagement Data");

          // Sheet 3: API (SingleApi) engagement data
          if (singleApiData?.data?.statusCode === 200 && singleApiData?.data?.responseData?.data?.length > 0) {
            const singleApiRows = toRows(mapEngagementRows(singleApiData.data.responseData.data));
            const singleApiSheetData = [engagementHeaderRow, ...singleApiRows];
            const singleApiSheet = XLSX.utils.aoa_to_sheet(singleApiSheetData);
            setColWidths(singleApiSheet, singleApiSheetData);
            XLSX.utils.book_append_sheet(workbook, singleApiSheet, "API Engagement Data");
          }

          const fileName = `${EngagementName}_Data_${orgName.organisationName}_${reportingPeriod}.xlsx`;
          XLSX.writeFile(workbook, fileName);

          await GetEngagementListData(
            1, searchKeyword, status, fromDate, toDate, businessNatureID, prospectType, false,
          );
        } else {
          console.error("Failed to fetch data for export");
        }
      } else {
        console.error("Failed to fetch data for export");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const new_letter = () => {
    if (
      activeOrganizationSubscriptionPlan?.prepareContract !== true ||
      remainingESignatures <= 0
    ) {
      setShowModal(true);
      return;
    }
    if (common.professionTypeLists.length === 1) {
      const modelRequestData = {
        clientName: null,
        ProfessionTypeId: common.professionTypeLists,
        contractKeyID: null,
        Action: null,
      };
      navigate("/add-engagement-letter", { state: modelRequestData });
    } else {
      // setModelRequestData({
      //   ProfessionTypeId: null,
      //   contractKeyID: null,
      //   Action: null,
      // });
      const modelRequestData = {
        ProfessionTypeId: null,
        contractKeyID: null,
        Action: null,
      };
      navigate("/add-engagement-letter", { state: modelRequestData });
    }
  };

  const EngagementEditBtnClicked = (engagement) => {
    setModelRequestData({
      clientName: engagement.clientName,
      contractKeyID: engagement.contractKeyID,
      Action: "Update",
    });
  };
  const ChangeContractStatusData = async () => {
    setLoader(true);
    if (modelRequestData.Action === "ReminderStatus") {
      if (modelRequestData.StatusType === null) {
        try {
          const Data = await ChangeContractStatus(
            modelRequestData.contractKeyID,
            common.userKeyID,
          );
          if (Data) {
            setLoader(false);
            if (Data?.data?.statusCode === 200) {
              setOpenSuccessModal(true);

              // GetEngagementListData(currentPage);
              // setOpenSuccessModal(true);
            } else {
              setErrorMessage(Data?.response?.data?.errorMessage);
              // setOpenErrorModal(true);
            }
            // GetEngagementListData(currentPage);
          }
        } catch (error) {
          console.log(error);
        }
      }
    }
  };

  // Archive Contract
  const ArchiveContractData = async () => {
    try {
      setLoader(true);
      const data = await ArchiveContract(
        modelRequestData.contractKeyID,
        common.userKeyID,
        modelRequestData.Action === "ArchiveContract" ? true
        : modelRequestData.Action === "UnarchiveContract" ? false : null
      );
      if (data?.data?.statusCode === 200) {
        setLoader(false);
        setOpenSuccessModal(true);
      } else {
        setLoader(false);
        setErrorMessage(data?.response?.data?.errorMessage);
        setOpenErrorModal(true);
      }
      GetEngagementListData(
        currentPage,
        searchKeyword,
        status,
        fromDate,
        toDate,
        businessNatureID,
        prospectType,
      );
    } catch (error) {
      console.error(error);
    }
  };

  // el seacrh function
  const handleSearch = (e) => {
    const searchKeywordValue = e.target.value;
    setSearchKeyword(searchKeywordValue);
    setCurrentPage(1);
    GetEngagementListData(
      1,
      searchKeywordValue,
      null,
      null,
      null,
      businessNatureID,
      prospectType,
      false,
    );
  };
  //old El search
  const handleSearchOldEl = (e) => {
    const searchKeywordValue = e.target.value;
    setSearchOldELKeyword(searchKeywordValue);
    setOldElCurrentPage(ElCurrentPage);
    GetOldEngagementListData(
      ElCurrentPage,
      searchKeywordValue,
      null,
      null,
      null,
    );
  };
  //single api Search finction
  const handleSearchSingleEl = (e) => {
    const searchSingleKeywordValue = e.target.value;
    setSearchSingleELKeyword(searchSingleKeywordValue);
    setSingleElCurrentPage(ElCurrentPage);
    GetEngagementListForSingleApiData(
      ElCurrentPage,
      searchSingleKeywordValue,
      null,
      null,
      null,
    );
  };
  // F] Pagination :
  const handlePageChange = async (pageNumber) => {
    setCurrentPage(pageNumber);
    await GetEngagementListData(pageNumber); // Call your function with the selected page number
  };

  const handlePageOldELChange = async (pageNumber) => {
    setOldElCurrentPage(pageNumber);
    await GetOldEngagementListData(pageNumber); // Call your function with the selected page number
  };
  const handlePageSingleELChange = async (pageNumber) => {
    setSingleElCurrentPage(pageNumber);
    await GetEngagementListForSingleApiData(pageNumber); // Call your function with the selected page number
  };
  const GetOnlyDate = (value) => {
    if (!value) return "";

    // Case 1: Format like "May 28 2025  6:03PM" or "May  9 2025  5:55PM"
    if (/[A-Za-z]{3}\s+\d{1,2}\s+\d{4}/.test(value)) {
      const [monthStr, day, year] = value.trim().split(/\s+/);
      const monthMap = {
        Jan: "01",
        Feb: "02",
        Mar: "03",
        Apr: "04",
        May: "05",
        Jun: "06",
        Jul: "07",
        Aug: "08",
        Sep: "09",
        Oct: "10",
        Nov: "11",
        Dec: "12",
      };
      const month = monthMap[monthStr];
      const formattedDay = day.padStart(2, "0");
      return `${formattedDay}/${month}/${year}`;
    }

    // Case 2: Format like "6/11/2025 10:21:35 AM"
    const [datePart] = value.split(" ");
    const [month, day, year] = datePart.split("/"); // US format mm/dd/yyyy
    const formattedDay = day.padStart(2, "0");
    const formattedMonth = month.padStart(2, "0");
    return `${formattedDay}/${formattedMonth}/${year}`;
  };

  const handleEmailFailurePopupClose = async () => {
    if (emailCheckModel.MethodName === "All Email Failed") {
      setOpenEmailFailurePopUp(false);
    } else {
      await ChangeFailedMailLogStatus(
        common.userKeyID,
        common.organisationKeyID,
        "AddUpdateContract",
      );
    }
    setOpenEmailFailurePopUp(false);
  };

  const handleResendContract = async () => {
    // debugger;
    setLoader(true);
    try {
      const data = await ResendContract(
        modelRequestData.contractKeyID,
        common.userKeyID,
      );
      setLoader(false);
      const EmailStausData = await GetProspectSendMailStatus(
        common.userKeyID,
        common.organisationKeyID,
        "SendContractEmailToAllSignatories",
        "Temp Key Id",
      );
      if (!EmailStausData?.data?.responseData) {
        setEmailCheckModel((prev) => ({
          ...prev,
          MethodName: "All Email Failed",
        }));
        setOpenEmailFailurePopUp(true);
      }
      if (data?.data?.statusCode === 200) {
        setLoader(false);
        setOpenEmailFailurePopUp(false);
        setOpenSuccessModal(true);
      } else {
        $("#" + "ConfirmModel").modal("hide");
        setLoader(false);
        // setOpenErrorModal(true);
        setErrorMessage(data?.data?.errorMessage);
      }
    } catch (error) {
      setLoader(false);
      setErrorMessage(error);
    }
  };

  const handleViewEngagementDetails = (engagement, statusID) => {
    setModelRequestData({
      ...modelRequestData,
      contractKeyID: engagement.contractKeyID, // Change ClientKeyID to contractKeyID
      Action: "View",
      draftOn: GetOnlyDate(engagement.createdOn),
      sentOn: GetOnlyDate(engagement.sentOn),
      SignedOn: GetOnlyDate(engagement.signedOn),
      // SignedOn:GetOnlyDate(engagement.signedOn,true),
      voidOn: GetOnlyDate(engagement.lastUpdatedOn),
      isSigned: engagement.statusID === statusID.Signed,
    });
  };
  //Resend the Proposal
  const handleResend = async (item) => {
    if (!activeOrganizationSubscriptionPlan.sendContract) {
      setShowModal(true);
      return;
    }
    try {
      setLoader(true);
      const data = await ResendContract(
        modelRequestData.contractKeyID,
        common.userKeyID,
      );
      // Check if mail is failed?
      if (data?.response?.data?.errorMessage === "Client - Send Mail Failed") {
        // Call Get prospect send mail status api
        const EmailStausData = await GetProspectSendMailStatus(
          common.userKeyID,
          common.organisationKeyID,
          "SendContractEmailToAllSignatories",
          "Temp Key Id",
        );
        if (!EmailStausData.data.responseData) {
          setEmailCheckModel((prev) => ({
            ...prev,
            MethodName: "Resend",
          }));
          setOpenEmailFailurePopUp(true);
        }
      }
      if (data?.data?.statusCode === 200) {
        const sentMailResponse = data?.data?.responseData.sentMailResponse;
        if (!sentMailResponse[sentMailResponse.length - 1].isMailSent) {
          const EmailStausData = await GetProspectSendMailStatus(
            common.userKeyID,
            common.organisationKeyID,
            "SendContractEmailToAllSignatories",
            "Temp Key Id",
          );
          if (!EmailStausData?.data?.responseData) {
            setEmailCheckModel((prev) => ({
              ...prev,
              MethodName: "All Email Failed",
            }));
            setOpenEmailFailurePopUp(true);
          }
        }
        setLoader(false);
        setOpenSuccessModal(true);
      } else {
        $("#" + "ConfirmModel").modal("hide");
        setLoader(false);
        // setOpenErrorModal(true);
        setErrorMessage(data?.data?.errorMessage);
      }
    } catch (error) {
      setLoader(false);
      setErrorMessage(error);
    }
  };
  // Void Contract
  const VoidContractData = async () => {
    try {
      setLoader(true);
      const data = await VoidContract(
        modelRequestData.contractKeyID,
        common.userKeyID,
      );
      if (data?.data?.statusCode === 200) {
        setLoader(false);
        setOpenSuccessModal(true);
      } else {
        $("#" + "ConfirmModel").modal("hide");
        setLoader(false);
        setErrorMessage(data?.data?.errorMessage);
        setOpenErrorModal(true);
      }
    } catch (error) {
      setLoader(false);
      console.error(error);
    }
  };
  // const handleViewPdf = (item) => {
  //   setModelRequestData({
  //     ...modelRequestData,
  //     contractKeyID: item.contractKeyID,
  //   });
  //   let ViewPdfData = {
  //     ModuleName: "Contract"
  //   };
  //   navigate(`/view-pdf/${item.contractKeyID}`, { state: ViewPdfData }); // Pass quoteKeyID in URL
  // };
  const handleViewPdf = (item) => {
    setModelRequestData({
      ...modelRequestData,
      contractKeyID: item.contractKeyID,
    });

    let ViewPdfData = {
      ModuleName: "Contract",
      contractKeyID: item.contractKeyID,
    };
    navigate(`/view-pdf`, { state: ViewPdfData }); // Pass quoteKeyID in URL
  };
  const handleViewOldProposalPdf = (item) => {
    navigate(`/view-pdf`, { state: item }); // Pass quoteKeyID in URL
  };

  const handleTabClick = (tab) => {
    if (tab === "OldEL") {
      GetOldEngagementListData(1);
      setActiveTab(tab);
      setSearchKeyword("");
    } else if (tab === "WebEL") {
      setActiveTab(tab);
      setSearchSingleELKeyword("");
      GetEngagementListForSingleApiData(1,"",null,null,null);
    } else {
      GetEngagementListData(1);
      setActiveTab(tab);
      setSearchOldELKeyword("");
    }
  };
  const handleDownload = async (engagement) => {
    setLoader(true);
    if (engagement.manuallySignedContractDocUrl !== null) {
      setModelRequestData({
        ...modelRequestData,
        ModuleName: "Contract",
        contractKeyID: engagement.contractKeyID, // Change ClientKeyID to contractKeyID
        Action: "View",
      });
      let ViewPdfData = {
        ModuleName: "Contract",
        quoteKeyID: engagement.contractKeyID,
      };
      navigate("/view-pdf", { state: ViewPdfData });
    } else {
      try {
        const options = {
          method: "GET",
          headers: {
            Authorization: common.token,
          },
          responseType: "blob",
        };
        const response = await fetch(
          `${Base_Url}/SignEasy/DownloadDocumentAsZip?ContractKeyID=${engagement.contractKeyID}`,
          options,
        );
        // const response = await DownloadDocumentAsZip(ContractKeyID);

        if (!response?.ok) {
          setOpenErrorModal(true);
          setEmailError(`Something went wrong`);
          setLoader(false);
          return false;
        }
        // Convert the response to a blob
        const blob = await response.blob();
        // Create a temporary anchor element to trigger the download
        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        link.download = `${EngagementName}-${engagement.prefix}.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setLoader(false);
      } catch (error) {
        setLoader(false);
        console.error("Error downloading ZIP file:", error);
      }
    }
  };

  const handleDownloadMigratedEl = async (engagement) => {
    setLoader(true);

    try {
      const options = {
        method: "GET",
        headers: {
          Authorization: common.token,
        },
        responseType: "blob",
      };
      const response = await fetch(
        `${Base_Url}/SignEasy/DownloadMigratedELDocumentAsZip?ContractKeyID=${engagement.contractKeyID}`,
        options,
      );
      // const response = await DownloadDocumentAsZip(ContractKeyID);

      if (!response?.ok) {
        setOpenErrorModal(true);
        setEmailError(`Something went wrong`);
        setLoader(false);
        return false;
      }
      // Convert the response to a blob
      const blob = await response.blob();
      // Create a temporary anchor element to trigger the download
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = `${EngagementName}-${engagement.refID}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setLoader(false);
    } catch (error) {
      setLoader(false);
      console.error("Error downloading ZIP file:", error);
    }
  };
  const ApplyFilter = () => {
    if (
      (businessNatureID !== null && businessNatureID !== "") ||
      (prospectType !== null && prospectType !== "") ||
      (status !== "" && status !== null) ||
      (fromDate !== null && fromDate !== "") ||
      (toDate !== null && toDate !== "") ||
      (selectedOption !== "" && selectedOption !== null)
    ) {
      setIsFilterApply(true);
    } else {
      setIsFilterApply(false);
    }

    const normalizedFromDate =
      fromDate === undefined || fromDate === "" ? null : fromDate;
    const normalizedToDate =
      toDate === undefined || toDate === "" ? null : toDate;
    GetEngagementListData(
      1,
      searchKeyword,
      status,
      normalizedFromDate,
      normalizedToDate,
      businessNatureID,
      prospectType,
    );
    setCurrentPage(1);
  };
  const handleCloseErrorModel = () => {
    setOpenErrorModal(false);
  };
  const ClearFilter = () => {
    setSelectedOption("");
    setIsFilterApply(false);
    setBusinessNatureID(null);
    setProspectType(null);
    setFromDate("");
    setToDate("");
    setStatus("");
    setShowDatePicker(false);
    setSelectedOption("");
    GetEngagementListData(1, searchKeyword, null, null, null, null, null);
    setCurrentPage(1);
  };

  const clearFilter = () => {
    setSelectedOption(null);
    setFromDate(null);
  };
  // const CopyContractData = async (item) => {
  //   if (!activeOrganizationSubscriptionPlan.prepareContract) {
  //     setShowModal(true);
  //     return;
  //   }
  //   try {
  //     const CopyQuote = await CopyContract(
  //       modelRequestData.contractKeyID,
  //       common.userKeyID
  //     );
  //     if (CopyQuote.data.statusCode === 200) {
  //       setOpenSuccessModal(true);
  //     }
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

  const CopyContractData = async (item, confirmed = false) => {
    // Add confirmed parameter
    if (
      !activeOrganizationSubscriptionPlan.prepareQuote ||
      remainingESignatures <= 0
    ) {
      setShowModal(true);
      return;
    }
    try {
      if (!confirmed) {
        // If not confirmed, check for service updates
        const checkRes = await GetServiceUpdatedAfterSendingQuoteOrContract(
          modelRequestData.contractKeyID,
          "Contract",
        );
        if (checkRes.data?.statusCode === 200) {
          setLoader(false);
          const {
            isServiceUpdatedAfter: serviceUpdatedAfterSent,
            isServiceDeletedAfter: serviceDeletedAfterSent,
            isPackageUpdatedAfter: packageUpdatedAfterSent,
            isPackageDeletedAfter: packageDeletedAfterSent,
            updatedPackageNames,
            deletedPackageNames,
            deletedServiceNames,
            updatedServiceNames,
          } = checkRes.data?.responseData?.data || {};

          let message = "";

          // If updated items exist
          if (serviceUpdatedAfterSent || packageUpdatedAfterSent) {
            message +=
              "Following Services or Packages were updated which may affect the copied Engagement Letter. Do you want to proceed?\n";

            if (serviceUpdatedAfterSent && updatedServiceNames?.length > 0) {
              message += "\nServices:\n";
              message +=
                updatedServiceNames.map((s) => `- ${s}`).join("\n") + "\n";
            }

            if (packageUpdatedAfterSent && updatedPackageNames?.length > 0) {
              message += "\nPackages:\n";
              message +=
                updatedPackageNames.map((p) => `- ${p}`).join("\n") + "\n";
            }

            message += "\n";
          }

          // If deleted items exist
          if (serviceDeletedAfterSent || packageDeletedAfterSent) {
            message +=
              "Following Services or Packages were deleted which may affect the copied Engagement Letter. Do you want to proceed?\n";

            if (serviceDeletedAfterSent && deletedServiceNames?.length > 0) {
              message += "\nServices:\n";
              message +=
                deletedServiceNames.map((s) => `- ${s}`).join("\n") + "\n";
            }

            if (packageDeletedAfterSent && deletedPackageNames?.length > 0) {
              message += "\nPackages:\n";
              message +=
                deletedPackageNames.map((p) => `- ${p}`).join("\n") + "\n";
            }
          }

          if (
            serviceUpdatedAfterSent ||
            serviceDeletedAfterSent ||
            packageUpdatedAfterSent ||
            packageDeletedAfterSent
          ) {
            setModelRequestData({
              ...modelRequestData,
              Action: "ServiceWarning",
              message,
              quoteKeyID: modelRequestData.contractKeyID,
              RefId: modelRequestData.refId,
            });
            setIsCopyPending(true);
            setShowModal(false);
            $("#ConfirmModel").modal("show");
            return;
          }
        } else {
          setLoader(false);
          setErrorMessage(checkRes.data?.errorMessage);
          setOpenErrorModal(true);
          return;
        }
      }
      setLoader(true);
      setModelRequestData({
        ...modelRequestData,
        Action: "Copy",
      });
      // If confirmed or no service updates, copy the contract
      const response = await CopyContract(
        modelRequestData.contractKeyID,
        common.userKeyID,
      );
      $("#ConfirmModel").modal("hide");
      // console.log(response);
      if (response) {
        if (response?.data?.statusCode === 200) {
          setLoader(false);
          setOpenSuccessModal(true);
        } else {
          setLoader(false);
          setErrorMessage(response?.response?.data?.errorMessage);
          setOpenErrorModal(true);
        }
        setIsCopyPending(false); // Reset the flag
      }
    } catch (error) {
      setLoader(false);
      setErrorMessage(error.message);
      setOpenErrorModal(true);
      console.log(error);
      setIsCopyPending(false); // Reset the flag
    }
  };

  const handleClose = () => {
    setOpenSuccessModal(false);
    $("#" + "ConfirmModel").modal("hide");
    if (modelRequestData.Action !== "Resend") {
      GetEngagementListData(
        currentPage,
        searchKeyword,
        status,
        fromDate,
        toDate,
        businessNatureID,
        prospectType,
        false,
      );
    }
  };
  const DeleteSingleApiContractData = async () => {
    try {
      setLoader(true);
      if (selectedRows.length !== 0) {
        const data = await DeleteSingleApiContract({
          userKeyID: common.userKeyID,
          contractKeyIDs: selectedRows,
        });
        if (data?.data?.statusCode === 200) {
          setLoader(false);
          setOpenSuccessModal(true);
          GetEngagementListForSingleApiData(currentPage);
        } else {
          setLoader(false);
          setErrorMessage(data?.data?.errorMessage);
          setOpenErrorModal(true);
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const visibleRows = SingleEngagementList.slice(
    0,
    isMobile ? isMobileRecords : desktopRecords,
  );

  const handleRowSelect = (contractKeyID) => {
    setSelectedRows((prevSelected) =>
      prevSelected.includes(contractKeyID)
        ? prevSelected.filter((id) => id !== contractKeyID)
        : [...prevSelected, contractKeyID],
    );
  };

  const handleSelectAll = () => {
    if (selectedRows.length === visibleRows.length) {
      setSelectedRows([]); // Deselect all
    } else {
      setSelectedRows(visibleRows.map((item) => item.contractKeyID)); // Select all
    }
  };

  // const HandleDeleteDraftContractData = () => {
  //   console.log(modelRequestData.contractKeyID);
  // };

  const HandleDeleteDraftContractData = async () => {
    try {
      setLoader(true);
      const data = await DeleteContract({
        userKeyID: common.userKeyID,
        contractKeyIDs: [modelRequestData.contractKeyID],
      });
      if (data?.data?.statusCode === 200) {
        setLoader(false);
        setOpenSuccessModal(true);
        GetEngagementListData(currentPage);
      } else {
        setLoader(false);
        setErrorMessage(data?.data?.errorMessage);
        setOpenErrorModal(true);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <div className="container-fluid">
        {/* <div class="main-content"> */}
        <div class="services page-background">
          <div class="">
            <div class="row">
              <div class="col-lg-12">
                <div class="card">
                  {/* end card header  */}
                  <div class="card-body mb-2">
                    <div id="customerList" style={{ marginTop: "3rem" }}>
                      <div class="bg-light border-bottom px-2">
                        {/* <div class="container"> */}
                        <div className="row">
                          <div className="col-md-12 p-0 ">
                            <ul className="nav nav-tabs" role="tablist">
                              <li className="nav-item">
                                <a
                                  className={`nav-link tab_nav ${
                                    activeTab === "NewEL" ? "active" : ""
                                  }`}
                                  data-bs-toggle="tab"
                                  href="#NewEL"
                                  role="tab"
                                  aria-selected={activeTab === "NewEL"}
                                  onClick={() => handleTabClick("NewEL")}
                                >
                                  <b>{EngagementName}</b>
                                </a>
                              </li>

                              {(SingleEngagementList?.length > 0 || activeTab === "WebEL" || hasWebElData) && (
                                <li className="nav-item">
                                  <a
                                    className={`nav-link tab_nav ${
                                      activeTab === "WebEL" ? "active" : ""
                                    }`}
                                    data-bs-toggle="tab"
                                    href="#WebEL"
                                    role="tab"
                                    aria-selected={activeTab === "WebEL"}
                                    onClick={() => handleTabClick("WebEL")}
                                  >
                                    <b>API {EngagementName}</b>
                                  </a>
                                </li>
                              )}
                              {(OldEngagementList?.length > 0 || activeTab === "OldEL") && (
                                <li className="nav-item">
                                  <a
                                    className={`nav-link tab_nav ${
                                      activeTab === "OldEL" ? "active" : ""
                                    }`}
                                    data-bs-toggle="tab"
                                    href="#OldEL"
                                    role="tab"
                                    aria-selected={activeTab === "OldEL"}
                                    onClick={() => handleTabClick("OldEL")}
                                  >
                                    <b>Migrated {EngagementName}</b>
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
                            <div class="card">
                              {/* end card header  */}
                              <div class="card-body">
                                <div id="customerList">
                                  <div class="row g-4 mb-3"></div>
                                  <div class="table-responsive table-card mt-2 mb-3 table-padding">
                                    <div className="row">
                                      <div class="col-md-12 col-lg-12 col-12 col-sm-6  mb-2">
                                        {activeTab === "OldEL" && (
                                          <div
                                            class="search-box col-md-5 col-8 width-searchbox "
                                            style={{}}
                                          >
                                            <i className="ri-search-line search-icon"></i>
                                            <input
                                              type="text"
                                              value={OldElSearchKeyword}
                                              class="form-control search"
                                              onChange={(e) => {
                                                handleSearchOldEl(e);
                                              }}
                                              placeholder={
                                                isMobile
                                                  ? "Search"
                                                  : getPlaceholderTextName(
                                                      "Search",
                                                      EngagementName,
                                                    )
                                              }
                                            />
                                          </div>
                                        )}

                                        {activeTab === "NewEL" && (
                                          <div class="row">
                                            <div class="col-md-6 col-lg-6 col-6 mb-2">
                                              <div className="d-flex justify-content-start">
                                                <div
                                                  class="search-box  width-searchbox "
                                                  id="w-100"
                                                  style={{ marginRight: "10px" }}
                                                >
                                                  <i className="ri-search-line search-icon"></i>
                                                  <input
                                                    type="text"
                                                    value={searchKeyword}
                                                    class="form-control search"
                                                    onChange={(e) => {
                                                      handleSearch(e);
                                                    }}
                                                    placeholder={
                                                      isMobile
                                                        ? "Search"
                                                        : getPlaceholderTextName("Search", EngagementName)
                                                    }
                                                  />
                                                </div>
                                                <div className=" d-flex align-items-start justify-content-start ">
                                                  <Tooltip
                                                    title={getCrudButtonToolTipName("Export", EngagementName)}
                                                  >
                                                    <div>
                                                      <button
                                                        class="btn btn-md btn-success create-item-btn-apply filter me-2"
                                                        onClick={handleExport}
                                                      >
                                                        <span
                                                          style={{
                                                            marginRight: "0px",
                                                            width: "42px",
                                                            fontSize: "15px",
                                                          }}
                                                        ></span>
                                                        <i class="ri-file-excel-2-fill  Filter-apply-color"></i>
                                                      </button>
                                                    </div>
                                                  </Tooltip>
                                                  <Tooltip
                                                    title={getCrudButtonToolTipName("Filter", EngagementName)}
                                                  >
                                                    <div>
                                                      <button
                                                        className={
                                                          isFilterApply
                                                            ? "btn btn-md btn-success create-item-btn filter me-2"
                                                            : "btn btn-md btn-success create-item-btn-apply filter me-2"
                                                        }
                                                        data-bs-toggle="modal"
                                                        data-bs-target="#FilterModel"
                                                      >
                                                        <i
                                                          className={
                                                            isFilterApply
                                                              ? "ri-filter-fill align-bottom "
                                                              : "ri-filter-fill align-bottom Filter-apply-color"
                                                          }
                                                        ></i>
                                                      </button>
                                                    </div>
                                                  </Tooltip>
                                                  <div className="col-9">
                                                    {isFilterApply ? (
                                                      <Tooltip title={"Clear Filter"}>
                                                        <div>
                                                          <button
                                                            className="btn btn-md btn-success create-Filter-item-btn text-nowrap"
                                                            onClick={ClearFilter}
                                                          >
                                                            <span className="text-nowrap">Clear Filter</span>
                                                          </button>
                                                        </div>
                                                      </Tooltip>
                                                    ) : (
                                                      ""
                                                    )}
                                                  </div>
                                                </div>
                                              </div>
                                            </div>

                                            <div class="col-md-6 col-lg-6 col-6 text-end mb-2">
                                              {(userAccessData.Admin_Engagement_Latter_CanEdit ||
                                                userAccessData.Admin_Engagement_Latter_CanView) &&
                                                userAccessData.Admin_Engagement_Latter_CanAdd && (
                                                  <div className="d-flex justify-content-sm-end add-new-btn">
                                                    <CommonButtonComponent
                                                      title={getCrudButtonToolTipName("Add", EngagementName)}
                                                      name={getCrudButtonTextName("Add", EngagementName)}
                                                      AddBtn={() => new_letter()}
                                                    />
                                                  </div>
                                                )}
                                            </div>
                                          </div>
                                        )}

                                        {activeTab === "WebEL" && (
                                          <div class="row">
                                        <div class="col-md-6 col-lg-6 col-6  mb-2">
                                          <div className="d-flex justify-content-between">
                                          <div className="d-flex justify-content-start">
                                            <div
                                              class="search-box  width-searchbox "
                                              id="w-100"
                                              style={{ marginRight: "10px" }}
                                            >
                                              <i className="ri-search-line search-icon"></i>

                                              <input
                                                type="text"
                                                value={SingleElSearchKeyword}
                                                class="form-control search"
                                                onChange={(e) => {
                                                  handleSearchSingleEl(e);
                                                }}
                                                placeholder={
                                                  isMobile
                                                    ? "Search"
                                                    : getPlaceholderTextName(
                                                        "Search",
                                                        EngagementName,
                                                      )
                                                }
                                              />
                                            </div>
                                            <div className=" d-flex align-items-start justify-content-start ">
                                              <Tooltip
                                                title={getCrudButtonToolTipName(
                                                  "Export",
                                                  EngagementName,
                                                )}
                                              >
                                                <div>
                                                  <button
                                                    class="btn btn-md btn-success create-item-btn-apply filter me-2"
                                                    onClick={handleExport}
                                                  >
                                                    {/* <i class="ri-pencil-fill"></i> */}
                                                    <span
                                                      style={{
                                                        marginRight: "0px",
                                                        width: "42px",
                                                        fontSize: "15px",
                                                      }}
                                                    ></span>
                                                    <i class="ri-file-excel-2-fill  Filter-apply-color"></i>
                                                  </button>
                                                </div>
                                              </Tooltip>
                                              <Tooltip
                                                title={getCrudButtonToolTipName(
                                                  "Filter",
                                                  EngagementName,
                                                )}
                                              >
                                                <div>
                                                  <button
                                                    className={
                                                      isFilterApply
                                                        ? "btn btn-md btn-success create-item-btn filter me-2"
                                                        : "btn btn-md btn-success create-item-btn-apply filter me-2"
                                                    }
                                                    data-bs-toggle="modal"
                                                    data-bs-target="#FilterModel"
                                                  >
                                                    {/* <i class="ri-pencil-fill"></i> */}

                                                    <i
                                                      className={
                                                        isFilterApply
                                                          ? "ri-filter-fill align-bottom "
                                                          : "ri-filter-fill align-bottom Filter-apply-color"
                                                      }
                                                    ></i>
                                                  </button>
                                                </div>
                                              </Tooltip>
                                              <div className="col-9">
                                                {isFilterApply ? (
                                                  <Tooltip
                                                    title={"Clear Filter"}
                                                  >
                                                    <div>
                                                      <button
                                                        className="btn btn-md btn-success create-Filter-item-btn text-nowrap"
                                                        onClick={ClearFilter} // Corrected from onclick to onClick
                                                      >
                                                        <span className="text-nowrap">
                                                          Clear Filter
                                                        </span>
                                                      </button>
                                                    </div>
                                                  </Tooltip>
                                                ) : (
                                                  ""
                                                )}
                                              </div>
                                            </div>
                                          </div>
                                          </div>
                                          </div>
                                          <div class="col-md-6 col-lg-6 col-6 text-end mb-2">
                                          <Tooltip
                                                  title={getCrudButtonToolTipName(
                                                    `Delete ${EngagementName}`,
                                                  )}
                                                >
                                                  <div className="d-inline-block">
                                                    <button
                                                      className={
                                                        selectedRows.length !==
                                                        0
                                                          ? "btn btn-md btn-success create-item-btn filter me-2"
                                                          : "btn btn-md btn-success create-item-btn-apply filter me-2"
                                                      }
                                                      disabled={
                                                        selectedRows.length ===
                                                        0
                                                      }
                                                      data-bs-toggle="modal"
                                                      data-bs-target="#ConfirmModel"
                                                      onClick={() =>
                                                        setModelRequestData({
                                                          ...modelRequestData,
                                                          Action: "Delete",
                                                        })
                                                      }
                                                    >
                                                      <i
                                                        className={
                                                          selectedRows.length !==
                                                          0
                                                            ? "ri-delete-bin-5-fill align-bottom "
                                                            : "ri-delete-bin-5-fill align-bottom Filter-apply-color"
                                                        }
                                                      ></i>
                                                    </button>
                                                  </div>
                                                </Tooltip>
                                          </div>
                                          </div>
                                        )}
                                      </div>

                                      
                                    </div>

                                    {/* Table Of Template and Template Pdf */}
                                    <div
                                      className={`tab-pane ${
                                        activeTab === "OldEL" ? "active" : ""
                                      }`}
                                      id="OldEL"
                                    >
                                      {activeTab === "OldEL" && (
                                        <table
                                          class="table align-middle table-nowrap"
                                          id="customerTable"
                                        >
                                          <thead class="table-light table-header-font">
                                            <tr className="head-row ">
                                              <td className="tr-table-class text-white">
                                                Ref ID
                                              </td>
                                              <td className="tr-table-class text-white">
                                                {prospectName}
                                              </td>
                                              <td className="tr-table-class text-white text-center">
                                                Status
                                              </td>
                                              <td className="tr-table-class text-white">
                                                Value
                                              </td>
                                              <td className="tr-table-class text-white">
                                                Documents
                                              </td>

                                              {/* <td className="tr-table-class text-white">
                                 {(userAccessData.Admin_Engagement_Latter_CanEdit ||
                                   userAccessData.Admin_Engagement_Latter_CanView) && (
                                   <>Action</>
                                 )}
                               </td> */}
                                            </tr>
                                          </thead>
                                          <tbody class="list form-check-all">
                                            {OldEngagementList.slice(
                                              0,
                                              isMobile
                                                ? isMobileRecords
                                                : desktopRecords,
                                            ).map((engagement) => {
                                              return (
                                                <>
                                                  <tr class="table_new">
                                                    <td className="table-content-font">
                                                      {engagement.refID}
                                                    </td>
                                                    <td className="table-content-font">
                                                      {engagement.clientName}
                                                    </td>
                                                    {engagement.status ===
                                                      statusNames.Draft && (
                                                      <>
                                                        <td class="table-content-font">
                                                          <p
                                                            style={{
                                                              background:
                                                                "#DAA520",
                                                            }}
                                                            className=" p-1 text-center text-white rounded"
                                                          >
                                                            {engagement.status
                                                              ?.charAt(0)
                                                              ?.toUpperCase() +
                                                              engagement.status?.slice(
                                                                1,
                                                              )}
                                                          </p>
                                                        </td>
                                                      </>
                                                    )}
                                                    {engagement.status ===
                                                      statusNames.Pending && (
                                                      <>
                                                        <td class="table-content-font">
                                                          <p
                                                            className=" p-1 text-center text-white rounded"
                                                            style={{
                                                              background:
                                                                "#626ED4",
                                                            }}
                                                          >
                                                            {/* {engagement.status?.charAt(0)?.toUpperCase() +
                                                      engagement.status?.slice(1)} */}
                                                            Send
                                                          </p>
                                                        </td>
                                                      </>
                                                    )}

                                                    {engagement.status ===
                                                      statusNames.Accepted && (
                                                      <>
                                                        <td class="table-content-font">
                                                          <p
                                                            style={{
                                                              background:
                                                                "#008000",
                                                            }}
                                                            className=" p-1 text-center text-white rounded"
                                                          >
                                                            {engagement.status
                                                              ?.charAt(0)
                                                              ?.toUpperCase() +
                                                              engagement.status?.slice(
                                                                1,
                                                              )}
                                                          </p>
                                                        </td>
                                                      </>
                                                    )}
                                                    {engagement.status ===
                                                      statusNames.Awaiting_Signature && (
                                                      <>
                                                        <td class="table-content-font">
                                                          <p
                                                            style={{
                                                              background:
                                                                "#626ED4",
                                                            }}
                                                            className=" p-1 text-center text-white rounded"
                                                          >
                                                            {engagement.status
                                                              ?.charAt(0)
                                                              ?.toUpperCase() +
                                                              engagement.status?.slice(
                                                                1,
                                                              )}
                                                          </p>
                                                        </td>
                                                      </>
                                                    )}
                                                    {engagement.status ===
                                                      statusNames.Declined && (
                                                      <>
                                                        <td class="table-content-font">
                                                          <p
                                                            style={{
                                                              background:
                                                                "#FF0000",
                                                            }}
                                                            className=" p-1 text-center text-white rounded"
                                                          >
                                                            {engagement.status
                                                              ?.charAt(0)
                                                              ?.toUpperCase() +
                                                              engagement.status?.slice(
                                                                1,
                                                              )}
                                                          </p>
                                                        </td>
                                                      </>
                                                    )}
                                                    {engagement.status ===
                                                      statusNames.Signed && (
                                                      <>
                                                        <td class="table-content-font">
                                                          <p
                                                            style={{
                                                              background:
                                                                "#008000",
                                                            }}
                                                            className=" p-1 text-center text-white rounded"
                                                          >
                                                            {/* {engagement.status?.charAt(0)?.toUpperCase() +
                                                      engagement.status?.slice(1)} */}
                                                            Signed
                                                          </p>
                                                        </td>
                                                      </>
                                                    )}
                                                    {engagement.status ===
                                                      statusNames.Skipped && (
                                                      <>
                                                        <td class="table-content-font">
                                                          <p
                                                            style={{
                                                              background:
                                                                "#38A4F8",
                                                            }}
                                                            className="p-1 text-center text-white rounded"
                                                          >
                                                            {engagement.status
                                                              ?.charAt(0)
                                                              ?.toUpperCase() +
                                                              engagement.status?.slice(
                                                                1,
                                                              )}
                                                          </p>
                                                        </td>
                                                      </>
                                                    )}
                                                    <td
                                                      style={{ padding: "6px" }}
                                                    >
                                                      {engagement.status !==
                                                        statusNames.Draft && (
                                                        <p className="mb-0">
                                                          Recurring:{" "}
                                                          <b>
                                                            {formatValue(
                                                              engagement.recurringTotal,
                                                            )}
                                                          </b>
                                                        </p>
                                                      )}
                                                      {engagement.status !==
                                                        statusNames.Draft && (
                                                        <p className="mb-0">
                                                          {" "}
                                                          OneOff :{" "}
                                                          <b>
                                                            {formatValue(
                                                              engagement.oneOffTotal,
                                                            )}
                                                          </b>
                                                        </p>
                                                      )}
                                                    </td>

                                                    <td className="table-content-font">
                                                      {/* <a href={engagement.documents} target="_blank">
                                     {EngagementName} PDF
                                   </a> */}
                                                      {engagement.status !==
                                                        statusNames.Draft &&
                                                        engagement.pdfUrl &&
                                                        engagement.status !==
                                                          statusNames.Signed && (
                                                          <p
                                                            onClick={() => {
                                                              handleViewOldProposalPdf(
                                                                engagement.pdfUrl,
                                                              );
                                                              setTitle(
                                                                "View engagement",
                                                              );
                                                            }}
                                                            style={{
                                                              cursor: "pointer",
                                                              color: "blue",
                                                            }}
                                                          >
                                                            {EngagementName} PDF
                                                          </p>
                                                        )}
                                                      {engagement.status !==
                                                        statusNames.Draft &&
                                                        engagement.pdfUrl &&
                                                        engagement.status ===
                                                          statusNames.Signed && (
                                                          <p
                                                            onClick={() => {
                                                              handleDownloadMigratedEl(
                                                                engagement,
                                                              );
                                                            }}
                                                            style={{
                                                              cursor: "pointer",
                                                              color: "blue",
                                                            }}
                                                          >
                                                            {EngagementName} PDF
                                                          </p>
                                                        )}
                                                    </td>
                                                  </tr>
                                                </>
                                              );
                                            })}
                                          </tbody>
                                        </table>
                                      )}
                                    </div>
                                    <div
                                      className={`tab-pane ${
                                        activeTab === "NewEL" ? "active" : ""
                                      }`}
                                      id="base-justified-home"
                                    >
                                      {activeTab === "NewEL" && (
                                        <table
                                          class="table align-middle table-nowrap"
                                          id="customerTable"
                                        >
                                          <thead class="table-light table-header-font">
                                            <tr className="head-row ">
                                              <td className="tr-table-class text-white">
                                                Ref ID
                                              </td>
                                              <td className="tr-table-class text-white">
                                                {prospectName}
                                              </td>
                                              <td className="tr-table-class text-white text-center">
                                                Status
                                              </td>
                                              <td className="tr-table-class text-white">
                                                Value
                                              </td>
                                              <td className="tr-table-class text-white">
                                                Documents
                                              </td>
                                              <td className="tr-table-class text-white">
                                                Last Updated On
                                              </td>
                                              <td className="tr-table-class text-white">
                                                Send Reminder
                                              </td>
                                              <td className="tr-table-class text-white">
                                                {(userAccessData.Admin_Engagement_Latter_CanEdit ||
                                                  userAccessData.Admin_Engagement_Latter_CanView) && (
                                                  <>Action</>
                                                )}
                                              </td>
                                            </tr>
                                          </thead>
                                          <tbody class="list form-check-all">
                                            {engagementList
                                              .slice(
                                                0,
                                                isMobile
                                                  ? isMobileRecords
                                                  : desktopRecords,
                                              )
                                              .map((engagement) => {
                                                return (
                                                  <>
                                                    <tr class="table_new">
                                                      <td className="table-content-font">
                                                        {engagement.prefix}
                                                      </td>
                                                      <td className="table-content-font">
                                                        {engagement.clientName}
                                                      </td>
                                                      {engagement.statusID ===
                                                        statusID.Draft && (
                                                        <>
                                                          <td class="table-content-font">
                                                            <p
                                                              style={{
                                                                background:
                                                                  "#DAA520",
                                                              }}
                                                              className=" p-1 text-center text-white rounded"
                                                            >
                                                              {
                                                                engagement.statusName
                                                              }
                                                            </p>
                                                          </td>
                                                        </>
                                                      )}
                                                      {engagement.statusID ===
                                                        statusID.Sent && (
                                                        <>
                                                          <td class="table-content-font">
                                                            <p
                                                              className=" p-1 text-center text-white rounded"
                                                              style={{
                                                                background:
                                                                  "#626ED4",
                                                              }}
                                                            >
                                                              {
                                                                engagement.statusName
                                                              }
                                                            </p>
                                                          </td>
                                                        </>
                                                      )}
                                                      {engagement.statusID ===
                                                        statusID.Accepted && (
                                                        <>
                                                          <td class="table-content-font">
                                                            <p
                                                              style={{
                                                                background:
                                                                  "#008000",
                                                              }}
                                                              className=" p-1 text-center text-white rounded"
                                                            >
                                                              {
                                                                engagement.statusName
                                                              }
                                                            </p>
                                                          </td>
                                                        </>
                                                      )}
                                                      {engagement.statusID ===
                                                        statusID.Awaiting_Signature && (
                                                        <>
                                                          <td class="table-content-font">
                                                            <p
                                                              style={{
                                                                background:
                                                                  "#626ED4",
                                                              }}
                                                              className=" p-1 text-center text-white rounded"
                                                            >
                                                              {
                                                                engagement.statusName
                                                              }
                                                            </p>
                                                          </td>
                                                        </>
                                                      )}
                                                      {engagement.statusID ===
                                                        statusID.Declined && (
                                                        <>
                                                          <td class="table-content-font">
                                                            <p
                                                              style={{
                                                                background:
                                                                  "#FF0000",
                                                              }}
                                                              className=" p-1 text-center text-white rounded"
                                                            >
                                                              {
                                                                engagement.statusName
                                                              }
                                                            </p>
                                                          </td>
                                                        </>
                                                      )}
                                                      {engagement.statusID ===
                                                        statusID.Signed && (
                                                        <>
                                                          <td class="table-content-font">
                                                            <p
                                                              style={{
                                                                background:
                                                                  "#008000",
                                                              }}
                                                              className=" p-1 text-center text-white rounded"
                                                            >
                                                              {
                                                                engagement.statusName
                                                              }
                                                            </p>
                                                          </td>
                                                        </>
                                                      )}
                                                      {engagement.statusID ===
                                                        statusID.Skipped && (
                                                        <>
                                                          <td class="table-content-font">
                                                            <p
                                                              style={{
                                                                background:
                                                                  "#38A4F8",
                                                              }}
                                                              className="p-1 text-center text-white rounded"
                                                            >
                                                              {
                                                                engagement.statusName
                                                              }
                                                            </p>
                                                          </td>
                                                        </>
                                                      )}
                                                      {engagement.statusID ===
                                                        statusID.Void && (
                                                        <>
                                                          <td class="table-content-font">
                                                            <p
                                                              style={{
                                                                background:
                                                                  "#1897ad",
                                                              }}
                                                              className="p-1 text-center text-white rounded"
                                                            >
                                                              {
                                                                engagement.statusName
                                                              }
                                                            </p>
                                                          </td>
                                                        </>
                                                      )}
                                                      <td
                                                        style={{
                                                          padding: "6px",
                                                        }}
                                                      >
                                                        {engagement.statusID !==
                                                          statusID.Draft && (
                                                          <p className="mb-0">
                                                            Recurring:{" "}
                                                            <b>
                                                              {formatValue(
                                                                engagement.recurringPrice,
                                                              )}
                                                            </b>
                                                          </p>
                                                        )}
                                                        {engagement.statusID !==
                                                          statusID.Draft && (
                                                          <p className="mb-0">
                                                            {" "}
                                                            OneOff :{" "}
                                                            <b>
                                                              {formatValue(
                                                                engagement.oneOffPrice,
                                                              )}
                                                            </b>
                                                          </p>
                                                        )}
                                                      </td>

                                                      <td className="table-content-font">
                                                        {engagement.statusID !==
                                                          statusID.Draft &&
                                                          engagement.statusID !==
                                                            statusID.Void &&
                                                          engagement.documents &&
                                                          engagement.statusID !==
                                                            statusID.Signed && (
                                                            <p
                                                              onClick={() => {
                                                                handleViewPdf(
                                                                  engagement,
                                                                );
                                                                setTitle(
                                                                  "View engagement",
                                                                );
                                                              }}
                                                              style={{
                                                                cursor:
                                                                  "pointer",
                                                                color: "blue",
                                                              }}
                                                            >
                                                              {EngagementName}{" "}
                                                              PDF
                                                            </p>
                                                          )}
                                                        {engagement.statusID !==
                                                          statusID.Draft &&
                                                          engagement.statusID !==
                                                            statusID.Void &&
                                                          engagement.documents &&
                                                          engagement.statusID ===
                                                            statusID.Signed && (
                                                            <p
                                                              onClick={() => {
                                                                handleDownload(
                                                                  engagement,
                                                                );
                                                              }}
                                                              style={{
                                                                cursor:
                                                                  "pointer",
                                                                color: "blue",
                                                              }}
                                                            >
                                                              {EngagementName}{" "}
                                                              PDF
                                                            </p>
                                                          )}
                                                      </td>
                                                      <td className="table-content-font">
                                                        {engagement.statusID ===
                                                        statusID.Signed ? (
                                                          <span>
                                                            Signed on:{" "}
                                                            {GetOnlyDate(
                                                              engagement.signedOn,
                                                            )}
                                                          </span>
                                                        ) : engagement.statusID ===
                                                          statusID.Sent ? (
                                                          <span>
                                                            Sent on:{" "}
                                                            {GetOnlyDate(
                                                              engagement.sentOn ??
                                                                engagement.createdOn,
                                                            )}
                                                          </span>
                                                        ) : engagement.statusID ===
                                                          statusID.Draft ? (
                                                          <span>
                                                            Drafted on:{" "}
                                                            {GetOnlyDate(
                                                              engagement.createdOn,
                                                            )}
                                                          </span>
                                                        ) : engagement.statusID ===
                                                          statusID.Void ? (
                                                          <span>
                                                            Voided on:{" "}
                                                            {GetOnlyDate(
                                                              engagement.lastUpdatedOn,
                                                            )}
                                                          </span>
                                                        ) : null}
                                                      </td>

                                                      <td className="table-content-font">
                                                        {engagement.statusID !==
                                                          statusID.Draft &&
                                                          engagement.statusID !==
                                                            statusID.Void && (
                                                            <div
                                                              style={{
                                                                alignItems:
                                                                  "none",
                                                              }}
                                                              class="d-flex gap-2 "
                                                            >
                                                              <Tooltip
                                                                title={
                                                                  engagement.enableReminder
                                                                    ? engagement.reminderName
                                                                      ? getCrudButtonToolTipName(
                                                                          engagement.reminderName,
                                                                        )
                                                                      : "No reminder found"
                                                                    : ""
                                                                }
                                                              >
                                                                <div
                                                                  style={{
                                                                    width:
                                                                      "40px",
                                                                  }}
                                                                >
                                                                  {engagement.enableReminder
                                                                    ? "Enable"
                                                                    : "Disable"}
                                                                </div>
                                                              </Tooltip>

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
                                                                                engagement.enableReminder
                                                                                  ? "Enable"
                                                                                  : "Disable",
                                                                              contractKeyID:
                                                                                engagement?.contractKeyID,
                                                                              userKeyID:
                                                                                common.userKeyID,
                                                                              StatusType:
                                                                                null,
                                                                              Action:
                                                                                "ReminderStatus",
                                                                            },
                                                                          )
                                                                        }
                                                                        checked={
                                                                          engagement.enableReminder
                                                                        }
                                                                        data-bs-toggle="modal"
                                                                        data-bs-target="#ConfirmModel"
                                                                      />
                                                                    }
                                                                  />
                                                                </FormGroup>
                                                              </Tooltip>
                                                            </div>
                                                          )}
                                                      </td>
                                                      <td className="table-content-font">
                                                        <div class="d-flex gap-2">
                                                          {/* Dropdown for all actions */}
                                                          <div class="dropdown">
                                                            <button
                                                              class="btn btn-md btn-success create-item-btn"
                                                              type="button"
                                                              id="dropdownMenuButton"
                                                              data-bs-toggle="dropdown"
                                                              aria-expanded="false"
                                                            >
                                                              <span>
                                                                Actions
                                                                <ExpandMoreIcon />
                                                              </span>
                                                            </button>
                                                            <ul
                                                              style={{
                                                                padding: `${
                                                                  engagement.statusID ===
                                                                  statusID.Draft
                                                                    ? "2px 0px 2px 0px"
                                                                    : "6px 8px"
                                                                }`,
                                                              }}
                                                              class="dropdown-menu"
                                                              aria-labelledby="dropdownElMenuButton"
                                                            >
                                                              {/* Draft button */}
                                                              {engagement.statusID ===
                                                                statusID.Draft &&
                                                                userAccessData.Admin_Engagement_Latter_CanEdit && (
                                                                  <>
                                                                    <li>
                                                                      {/* <Tooltip title={`Edit ${EngagementName}`}> */}
                                                                      <a
                                                                        class="dropdown-item"
                                                                        onClick={() =>
                                                                          EngagementEditBtnClicked(
                                                                            engagement,
                                                                          )
                                                                        }
                                                                      >
                                                                        <i
                                                                          className="ri-pencil-fill custom-pencil-icon"
                                                                          style={{
                                                                            marginRight:
                                                                              "2px",
                                                                          }}
                                                                        ></i>{" "}
                                                                        Edit{" "}
                                                                        {
                                                                          EngagementName
                                                                        }
                                                                      </a>
                                                                      {/* </Tooltip> */}
                                                                    </li>

                                                                    {/* Delete Contract */}

                                                                    <li>
                                                                      {/* <Tooltip title={`Delete ${proposalName}`} placement="right"> */}
                                                                      <a
                                                                        class="dropdown-item"
                                                                        data-bs-toggle="modal"
                                                                        data-bs-target="#ConfirmModel"
                                                                        onClick={() => {
                                                                          setModelRequestData(
                                                                            (
                                                                              prev,
                                                                            ) => ({
                                                                              ...prev,
                                                                              Action:
                                                                                "DeleteContract",
                                                                              contractKeyID:
                                                                                engagement.contractKeyID,
                                                                            }),
                                                                          );
                                                                        }}
                                                                      >
                                                                        <i
                                                                          className="ri-delete-bin-5-fill"
                                                                          style={{
                                                                            marginRight:
                                                                              "2px",
                                                                          }}
                                                                        ></i>{" "}
                                                                        Delete{" "}
                                                                        {
                                                                          EngagementName
                                                                        }
                                                                      </a>
                                                                      {/* </Tooltip> */}
                                                                    </li>
                                                                  </>
                                                                )}

                                                              {/* View button */}
                                                              {engagement.statusID !==
                                                                statusID.Draft &&
                                                                userAccessData.Admin_Engagement_Latter_CanView && (
                                                                  <li>
                                                                    <a
                                                                      class="dropdown-item"
                                                                      onClick={() =>
                                                                        handleViewEngagementDetails(
                                                                          engagement,
                                                                          statusID,
                                                                        )
                                                                      }
                                                                    >
                                                                      <i class="bi bi-eye"></i>{" "}
                                                                      View{" "}
                                                                      {
                                                                        EngagementName
                                                                      }
                                                                    </a>
                                                                  </li>
                                                                )}

                                                              {/* Void action button */}
                                                              {engagement.statusID ===
                                                                statusID.Void &&
                                                                userAccessData.Admin_Engagement_Latter_CanEdit && (
                                                                  <>
                                                                    {/* Delete Void */}
                                                                    <li>
                                                                      <a
                                                                        class="dropdown-item"
                                                                        data-bs-toggle="modal"
                                                                        data-bs-target="#ConfirmModel"
                                                                        onClick={() => {
                                                                          setModelRequestData(
                                                                            (
                                                                              prev,
                                                                            ) => ({
                                                                              ...prev,
                                                                              Action:
                                                                                "DeleteContract",
                                                                              contractKeyID:
                                                                                engagement.contractKeyID,
                                                                            }),
                                                                          );
                                                                        }}
                                                                      >
                                                                        <i
                                                                          className="ri-delete-bin-5-fill"
                                                                          style={{
                                                                            marginRight:
                                                                              "2px",
                                                                          }}
                                                                        ></i>{" "}
                                                                        Delete{" "}
                                                                        {
                                                                          EngagementName
                                                                        }
                                                                      </a>
                                                                      {/* </Tooltip> */}
                                                                    </li>
                                                                  </>
                                                                )}

                                                              {/* Copy button */}
                                                              {engagement.statusID !==
                                                                statusID.Draft &&
                                                                engagement.statusID !==
                                                                  statusID.Void && (
                                                                  <li>
                                                                    <a
                                                                      class="dropdown-item"
                                                                      data-bs-toggle="modal"
                                                                      data-bs-target="#ConfirmModel"
                                                                      onClick={() => {
                                                                        setModelRequestData(
                                                                          {
                                                                            ...modelRequestData,
                                                                            Action:
                                                                              "Copy",
                                                                            contractKeyID:
                                                                              engagement.contractKeyID,
                                                                            refId:
                                                                              engagement.prefix,
                                                                          },
                                                                        );
                                                                      }}
                                                                    >
                                                                      <i class="fa-solid fa-copy"></i>{" "}
                                                                      Copy{" "}
                                                                      {
                                                                        EngagementName
                                                                      }
                                                                    </a>
                                                                  </li>
                                                                )}
                                                              {/* Resend button*/}
                                                              {(engagement.statusID ===
                                                                statusID.Sent ||
                                                                engagement.statusID ===
                                                                  statusID.Awaiting_Signature) &&
                                                                userAccessData.Admin_Engagement_Latter_CanEdit && (
                                                                  <>
                                                                    <li>
                                                                      <a
                                                                        class="dropdown-item"
                                                                        data-bs-toggle="modal"
                                                                        data-bs-target="#ConfirmModel"
                                                                        onClick={() => {
                                                                          setModelRequestData(
                                                                            {
                                                                              ...modelRequestData,
                                                                              contractKeyID:
                                                                                engagement.contractKeyID,
                                                                              message: `Are you sure you want to re-send ${EngagementName}`,
                                                                              refId:
                                                                                engagement.prefix,
                                                                              Action:
                                                                                "Resend",
                                                                            },
                                                                          );
                                                                        }}
                                                                      >
                                                                        <i class="fas fa-redo"></i>{" "}
                                                                        Re-send{" "}
                                                                        {
                                                                          EngagementName
                                                                        }
                                                                      </a>
                                                                    </li>
                                                                    {/* Void button */}
                                                                    <li>
                                                                      <a
                                                                        class="dropdown-item"
                                                                        data-bs-toggle="modal"
                                                                        data-bs-target="#ConfirmModel"
                                                                        onClick={() => {
                                                                          setModelRequestData(
                                                                            {
                                                                              ...modelRequestData,
                                                                              refId:
                                                                                engagement.prefix,
                                                                              contractKeyID:
                                                                                engagement.contractKeyID,
                                                                              message: `Are you sure you want to void ${modelRequestData.refId}`,
                                                                              Action:
                                                                                "Void",
                                                                            },
                                                                          );
                                                                        }}
                                                                      >
                                                                        <i class="fa fa-ban"></i>{" "}
                                                                        Void{" "}
                                                                        {
                                                                          EngagementName
                                                                        }
                                                                      </a>
                                                                    </li>
                                                                  </>
                                                                )}
                                                              {/* Archive */}
                                                              {!engagement.isArchived && (
                                                                <li>
                                                                  <a
                                                                    class="dropdown-item"
                                                                    data-bs-toggle="modal"
                                                                    data-bs-target="#ConfirmModel"
                                                                    onClick={() =>
                                                                      setModelRequestData(
                                                                        {
                                                                          ...modelRequestData,
                                                                          Action:
                                                                            "ArchiveContract",
                                                                          refId:
                                                                            engagement.prefix,
                                                                          contractKeyID:
                                                                            engagement.contractKeyID,
                                                                        },
                                                                      )
                                                                    }
                                                                  >
                                                                    <i class="bi-archive-fill"></i>{" "}
                                                                    Archive{" "}
                                                                    {
                                                                      EngagementName
                                                                    }
                                                                  </a>
                                                                </li>
                                                              )}

                                                              {/* Unarchive */}
                                                              {engagement.isArchived && (
                                                                <li>
                                                                  <a
                                                                    class="dropdown-item"
                                                                    data-bs-toggle="modal"
                                                                    data-bs-target="#ConfirmModel"
                                                                    onClick={() =>
                                                                      setModelRequestData(
                                                                        {
                                                                          ...modelRequestData,
                                                                          Action:
                                                                            "UnarchiveContract",
                                                                          refId:
                                                                            engagement.prefix,
                                                                          contractKeyID:
                                                                            engagement.contractKeyID,
                                                                        },
                                                                      )
                                                                    }
                                                                  >
                                                                    <i class="bi-archive-fill"></i>{" "}
                                                                    Unarchive{" "}
                                                                    {
                                                                      EngagementName
                                                                    }
                                                                  </a>
                                                                </li>
                                                              )}

                                                              {/* invoice button  */}
                                                              {engagement.statusName ==
                                                                "Signed" && (
                                                                //check prospect synced or not
                                                                //check organisation sync with xerO/qbo
                                                                <li>
                                                                  {/* <Tooltip title={`Delete ${proposalName}`} placement="right"> */}
                                                                  <a
                                                                    className="dropdown-item"
                                                                    // data-bs-toggle="modal"
                                                                    // data-bs-target="#ConfirmModel"
                                                                    onClick={async () => {
                                                                      //add loader on action button later
                                                                      try {
                                                                        const res =
                                                                          await dispatch(
                                                                            CreateEngagementInvoice(
                                                                              {
                                                                                organisationKeyID:
                                                                                  common.organisationKeyID,
                                                                                contractKeyId:
                                                                                  engagement.contractKeyID,
                                                                              },
                                                                            ),
                                                                          ).unwrap();

                                                                        // SUCCESS
                                                                        setOpenSuccessModal(
                                                                          true,
                                                                        );
                                                                        setModelRequestData(
                                                                          {
                                                                            ...modelRequestData,
                                                                            Action:
                                                                              "Create Invoice",
                                                                            message:
                                                                              "Invoice Created Successfully!",
                                                                          },
                                                                        );
                                                                      } catch (error) {
                                                                        // ERROR
                                                                        setErrorMessage(
                                                                          error ||
                                                                            "Something went wrong",
                                                                        );
                                                                        setOpenErrorModal(
                                                                          true,
                                                                        );
                                                                      }
                                                                    }}
                                                                  >
                                                                    <i
                                                                      className="ri-bill-line"
                                                                      style={{
                                                                        marginRight:
                                                                          "2px",
                                                                      }}
                                                                    ></i>{" "}
                                                                    Create
                                                                    Invoice
                                                                  </a>
                                                                  {/* </Tooltip> */}
                                                                </li>
                                                              )}
                                                            </ul>
                                                          </div>
                                                        </div>
                                                      </td>
                                                      {/* <td>
                                            <div class="d-flex gap-2">
                                              {userAccessData.Admin_Engagement_Latter_CanView && (
                                                <>
                                                  {engagement.statusID !==
                                                    statusID.Draft && (
                                                      <Tooltip
                                                        title={getCrudButtonToolTipName(
                                                          "View",
                                                          EngagementName
                                                        )}
                                                      >
                                                        <div class="view">
                                                          <button
                                                            class="btn btn-md btn-success create-item-btn view"
                                                            onClick={() =>
                                                              handleViewEngagementDetails(
                                                                engagement
                                                              )
                                                            }
                                                          >
                                                            {/* <i class="ri-pencil-fill"></i> */}
                                                      {/*   <span
                                                              style={{
                                                                marginRight:
                                                                  "4px",
                                                              }}
                                                            >
                                                              View
                                                            </span>
                                                            <i class="bi bi-eye"></i>
                                                          </button>
                                                        </div>
                                                      </Tooltip>
                                                    )}
                                                </>
                                              )}
                                              {userAccessData.Admin_Engagement_Latter_CanEdit && (
                                                <>
                                                  {engagement.statusID ===
                                                    statusID.Draft && (
                                                      <Tooltip
                                                        title={getCrudButtonToolTipName(
                                                          "Update",
                                                          EngagementName
                                                        )}
                                                      >
                                                        <div class="edit">
                                                          <button
                                                            class="btn btn-sm btn-success edit-item-btn actionButtonsStyle"
                                                            onClick={() =>
                                                              EngagementEditBtnClicked(
                                                                engagement
                                                              )
                                                            }
                                                          >
                                                            <i class="ri-pencil-fill"></i>
                                                          </button>
                                                        </div>
                                                      </Tooltip>
                                                    )}
                                                </>
                                              )}
                                              {engagement.statusID !==
                                                statusID.Draft && (
                                                  <>
                                                    <Tooltip
                                                      title={`Copy ${EngagementName}`}
                                                    >
                                                      <div class="Engagement_letter">
                                                        <button
                                                          class="btn btn-md btn-success create-item-btn view"
                                                          data-bs-toggle="modal"
                                                          data-bs-target="#ConfirmModel"
                                                          onClick={() => {
                                                            setModelRequestData({
                                                              ...modelRequestData,
                                                              Action: "Copy",
                                                              contractKeyID:
                                                                engagement.contractKeyID,
                                                              refId:
                                                                engagement.prefix,
                                                            });
                                                          }}
                                                        >
                                                          <span
                                                            style={{
                                                              marginRight: "4px",
                                                            }}
                                                          >
                                                            Copy
                                                          </span>
                                                          <i class="fa-solid fa-copy"></i>
                                                        </button>
                                                      </div>
                                                    </Tooltip>
                                                  </>
                                                )}
                                            </div>
                                          </td> */}
                                                    </tr>
                                                  </>
                                                );
                                              })}
                                          </tbody>
                                        </table>
                                      )}
                                    </div>
                                    <div
                                      className={`tab-pane ${
                                        activeTab === "WebEL" ? "active" : ""
                                      }`}
                                      id="WebEL"
                                    >
                                      {activeTab === "WebEL" && (
                                        <table
                                          class="table align-middle table-nowrap"
                                          id="customerTable"
                                        >
                                          <thead class="table-light table-header-font">
                                            <tr className="head-row ">
                                              <td className="tr-table-class text-white">
                                                <input
                                                  type="checkbox"
                                                  className="me-2"
                                                  checked={
                                                    selectedRows.length ===
                                                    visibleRows.length
                                                  }
                                                  onChange={handleSelectAll}
                                                />
                                                Ref ID
                                              </td>
                                              <td className="tr-table-class text-white">
                                                {prospectName}
                                              </td>
                                              <td className="tr-table-class text-white text-center">
                                                Status
                                              </td>
                                              <td className="tr-table-class text-white">
                                                Value
                                              </td>
                                              <td className="tr-table-class text-white">
                                                Documents
                                              </td>
                                              <td className="tr-table-class text-white">
                                                Action
                                              </td>

                                              {/* <td className="tr-table-class text-white">
                                    {(userAccessData.Admin_Engagement_Latter_CanEdit ||
                                      userAccessData.Admin_Engagement_Latter_CanView) && (
                                        <>Action</>
                                      )}
                                  </td> */}
                                            </tr>
                                          </thead>
                                          <tbody class="list form-check-all">
                                            {SingleEngagementList.slice(
                                              0,
                                              isMobile
                                                ? isMobileRecords
                                                : desktopRecords,
                                            ).map((engagement) => {
                                              return (
                                                <>
                                                  <tr class="table_new">
                                                    <td className="table-content-font">
                                                      <input
                                                        type="checkbox"
                                                        className="me-2"
                                                        checked={selectedRows.includes(
                                                          engagement.contractKeyID,
                                                        )}
                                                        onChange={() =>
                                                          handleRowSelect(
                                                            engagement.contractKeyID,
                                                          )
                                                        }
                                                      />
                                                      {engagement.prefix}
                                                    </td>
                                                    <td className="table-content-font">
                                                      {engagement.clientName}
                                                    </td>
                                                    {engagement.statusID ===
                                                      statusID.Draft && (
                                                      <>
                                                        <td class="table-content-font">
                                                          <p
                                                            style={{
                                                              background:
                                                                "#DAA520",
                                                            }}
                                                            className=" p-1 text-center text-white rounded"
                                                          >
                                                            {
                                                              engagement.statusName
                                                            }
                                                          </p>
                                                        </td>
                                                      </>
                                                    )}
                                                    {engagement.statusID ===
                                                      statusID.Sent && (
                                                      <>
                                                        <td class="table-content-font">
                                                          <p
                                                            className=" p-1 text-center text-white rounded"
                                                            style={{
                                                              background:
                                                                "#626ED4",
                                                            }}
                                                          >
                                                            {
                                                              engagement.statusName
                                                            }
                                                          </p>
                                                        </td>
                                                      </>
                                                    )}
                                                    {engagement.statusID ===
                                                      statusID.Accepted && (
                                                      <>
                                                        <td class="table-content-font">
                                                          <p
                                                            style={{
                                                              background:
                                                                "#008000",
                                                            }}
                                                            className=" p-1 text-center text-white rounded"
                                                          >
                                                            {
                                                              engagement.statusName
                                                            }
                                                          </p>
                                                        </td>
                                                      </>
                                                    )}
                                                    {engagement.statusID ===
                                                      statusID.Awaiting_Signature && (
                                                      <>
                                                        <td class="table-content-font">
                                                          <p
                                                            style={{
                                                              background:
                                                                "#626ED4",
                                                            }}
                                                            className=" p-1 text-center text-white rounded"
                                                          >
                                                            {
                                                              engagement.statusName
                                                            }
                                                          </p>
                                                        </td>
                                                      </>
                                                    )}
                                                    {engagement.statusID ===
                                                      statusID.Declined && (
                                                      <>
                                                        <td class="table-content-font">
                                                          <p
                                                            style={{
                                                              background:
                                                                "#FF0000",
                                                            }}
                                                            className=" p-1 text-center text-white rounded"
                                                          >
                                                            {
                                                              engagement.statusName
                                                            }
                                                          </p>
                                                        </td>
                                                      </>
                                                    )}
                                                    {engagement.statusID ===
                                                      statusID.Signed && (
                                                      <>
                                                        <td class="table-content-font">
                                                          <p
                                                            style={{
                                                              background:
                                                                "#008000",
                                                            }}
                                                            className=" p-1 text-center text-white rounded"
                                                          >
                                                            {
                                                              engagement.statusName
                                                            }
                                                          </p>
                                                        </td>
                                                      </>
                                                    )}
                                                    {engagement.statusID ===
                                                      statusID.Skipped && (
                                                      <>
                                                        <td class="table-content-font">
                                                          <p
                                                            style={{
                                                              background:
                                                                "#38A4F8",
                                                            }}
                                                            className="p-1 text-center text-white rounded"
                                                          >
                                                            {
                                                              engagement.statusName
                                                            }
                                                          </p>
                                                        </td>
                                                      </>
                                                    )}
                                                    <td
                                                      style={{ padding: "6px" }}
                                                    >
                                                      {engagement.statusID !==
                                                        statusID.Draft && (
                                                        <p className="mb-0">
                                                          Recurring:{" "}
                                                          <b>
                                                            {formatValue(
                                                              engagement.recurringPrice,
                                                            )}
                                                          </b>
                                                        </p>
                                                      )}
                                                      {engagement.statusID !==
                                                        statusID.Draft && (
                                                        <p className="mb-0">
                                                          {" "}
                                                          OneOff :{" "}
                                                          <b>
                                                            {formatValue(
                                                              engagement.oneOffPrice,
                                                            )}
                                                          </b>
                                                        </p>
                                                      )}
                                                    </td>

                                                    <td className="table-content-font">
                                                      {/* <a href={engagement.documents} target="_blank">
                                      {EngagementName} PDF
                                    </a> */}
                                                      {engagement.statusID !==
                                                        statusID.Draft &&
                                                        engagement.documents &&
                                                        engagement.statusID !==
                                                          statusID.Signed && (
                                                          <p
                                                            onClick={() => {
                                                              handleViewPdf(
                                                                engagement,
                                                              );
                                                              setTitle(
                                                                "View engagement",
                                                              );
                                                            }}
                                                            style={{
                                                              cursor: "pointer",
                                                              color: "blue",
                                                            }}
                                                          >
                                                            {EngagementName} PDF
                                                          </p>
                                                        )}
                                                      {engagement.statusID !==
                                                        statusID.Draft &&
                                                        engagement.documents &&
                                                        engagement.statusID ===
                                                          statusID.Signed && (
                                                          <p
                                                            onClick={() => {
                                                              handleDownload(
                                                                engagement,
                                                              );
                                                            }}
                                                            style={{
                                                              cursor: "pointer",
                                                              color: "blue",
                                                            }}
                                                          >
                                                            {EngagementName} PDF
                                                          </p>
                                                        )}
                                                    </td>
                                                    <td className="table-content-font">
                                                      <div class="d-flex gap-2">
                                                        {/* Dropdown for all actions */}
                                                        <div class="dropdown">
                                                          <button
                                                            class="btn btn-md btn-success create-item-btn"
                                                            type="button"
                                                            id="dropdownMenuButton"
                                                            data-bs-toggle="dropdown"
                                                            aria-expanded="false"
                                                          >
                                                            <span>
                                                              Actions
                                                              <ExpandMoreIcon />
                                                            </span>
                                                          </button>
                                                          <ul
                                                            style={{
                                                              padding: `${
                                                                engagement.statusID ===
                                                                statusID.Draft
                                                                  ? "2px 0px 2px 0px"
                                                                  : "6px 8px"
                                                              }`,
                                                            }}
                                                            class="dropdown-menu"
                                                            aria-labelledby="dropdownElMenuButton"
                                                          >
                                                            {/* Draft button */}
                                                            {engagement.statusID ===
                                                              statusID.Draft &&
                                                              userAccessData.Admin_Engagement_Latter_CanEdit && (
                                                                <>
                                                                  {/* <li>
                                                        <a
                                                          class="dropdown-item"
                                                          onClick={() =>
                                                            EngagementEditBtnClicked(
                                                              engagement
                                                            )
                                                          }
                                                        >
                                                          <i
                                                            className="ri-pencil-fill custom-pencil-icon"
                                                            style={{
                                                              marginRight:
                                                                "2px",
                                                            }}
                                                          ></i>{" "}
                                                          Edit {EngagementName}
                                                        </a>
                                                      </li> */}

                                                                  {/* Delete Contract */}

                                                                  {/* <li>
                                                        <a
                                                          class="dropdown-item"
                                                          data-bs-toggle="modal"
                                                          data-bs-target="#ConfirmModel"
                                                          onClick={() => {
                                                            setModelRequestData(
                                                              (prev) => ({
                                                                ...prev,
                                                                Action:
                                                                  "DeleteContract",
                                                                contractKeyID:
                                                                  engagement.contractKeyID,
                                                              })
                                                            );
                                                          }}
                                                        >
                                                          <i
                                                            className="ri-delete-bin-5-fill"
                                                            style={{
                                                              marginRight:
                                                                "2px",
                                                            }}
                                                          ></i>{" "}
                                                          Delete{" "}
                                                          {EngagementName}
                                                        </a>
                                                      </li> */}
                                                                </>
                                                              )}

                                                            {/* View button */}
                                                            {engagement.statusID !==
                                                              statusID.Draft &&
                                                              userAccessData.Admin_Engagement_Latter_CanView && (
                                                                <li>
                                                                  <a
                                                                    class="dropdown-item"
                                                                    onClick={() =>
                                                                      handleViewEngagementDetails(
                                                                        engagement,
                                                                        statusID,
                                                                      )
                                                                    }
                                                                  >
                                                                    <i class="bi bi-eye"></i>{" "}
                                                                    View{" "}
                                                                    {
                                                                      EngagementName
                                                                    }
                                                                  </a>
                                                                </li>
                                                              )}

                                                            {/* Void action button */}
                                                            {/* {engagement.statusID ===
                                                  statusID.Void &&
                                                  userAccessData.Admin_Engagement_Latter_CanEdit && (
                                                    <>
                                                      <li>
                                                        <a
                                                          class="dropdown-item"
                                                          data-bs-toggle="modal"
                                                          data-bs-target="#ConfirmModel"
                                                          onClick={() => {
                                                            setModelRequestData(
                                                              (prev) => ({
                                                                ...prev,
                                                                Action:
                                                                  "DeleteContract",
                                                                contractKeyID:
                                                                  engagement.contractKeyID,
                                                              })
                                                            );
                                                          }}
                                                        >
                                                          <i
                                                            className="ri-delete-bin-5-fill"
                                                            style={{
                                                              marginRight:
                                                                "2px",
                                                            }}
                                                          ></i>{" "}
                                                          Delete{" "}
                                                          {EngagementName}
                                                        </a>
                                                      </li>
                                                    </>
                                                  )} */}

                                                            {/* Copy button */}
                                                            {/* {engagement.statusID !==
                                                  statusID.Draft &&
                                                  engagement.statusID !==
                                                    statusID.Void && (
                                                    <li>
                                                      <a
                                                        class="dropdown-item"
                                                        data-bs-toggle="modal"
                                                        data-bs-target="#ConfirmModel"
                                                        onClick={() => {
                                                          setModelRequestData({
                                                            ...modelRequestData,
                                                            Action: "Copy",
                                                            contractKeyID:
                                                              engagement.contractKeyID,
                                                            refId:
                                                              engagement.prefix,
                                                          });
                                                        }}
                                                      >
                                                        <i class="fa-solid fa-copy"></i>{" "}
                                                        Copy {EngagementName}
                                                      </a>
                                                    </li>
                                                  )} */}
                                                            {/* Resend button*/}
                                                            {/* {(engagement.statusID ===
                                                  statusID.Sent ||
                                                  engagement.statusID ===
                                                    statusID.Awaiting_Signature) &&
                                                  userAccessData.Admin_Engagement_Latter_CanEdit && (
                                                    <>
                                                      <li>
                                                        <a
                                                          class="dropdown-item"
                                                          data-bs-toggle="modal"
                                                          data-bs-target="#ConfirmModel"
                                                          onClick={() => {
                                                            setModelRequestData(
                                                              {
                                                                ...modelRequestData,
                                                                contractKeyID:
                                                                  engagement.contractKeyID,
                                                                message: `Are you sure you want to re-send ${EngagementName}`,
                                                                refId:
                                                                  engagement.prefix,
                                                                Action:
                                                                  "Resend",
                                                              }
                                                            );
                                                          }}
                                                        >
                                                          <i class="fas fa-redo"></i>{" "}
                                                          Re-send{" "}
                                                          {EngagementName}
                                                        </a>
                                                      </li>
                                                      <li>
                                                        <a
                                                          class="dropdown-item"
                                                          data-bs-toggle="modal"
                                                          data-bs-target="#ConfirmModel"
                                                          onClick={() => {
                                                            setModelRequestData(
                                                              {
                                                                ...modelRequestData,
                                                                refId:
                                                                  engagement.prefix,
                                                                contractKeyID:
                                                                  engagement.contractKeyID,
                                                                message: `Are you sure you want to void ${modelRequestData.refId}`,
                                                                Action: "Void",
                                                              }
                                                            );
                                                          }}
                                                        >
                                                          <i class="fa fa-ban"></i>{" "}
                                                          Void {EngagementName}
                                                        </a>
                                                      </li>
                                                    </>
                                                  )} */}
                                                          </ul>
                                                        </div>
                                                      </div>
                                                    </td>
                                                    {/* <td>
                                            <div class="d-flex gap-2">
                                              <Tooltip
                                                title={getCrudButtonToolTipName(
                                                  "Delete",
                                                  { EngagementName }
                                                )}
                                              >
                                                <div class="remove">
                                                  <button
                                                    class="btn btn-sm btn-danger remove-item-btn actionButtonsStyle"
                                                    data-bs-toggle="modal"
                                                    data-bs-target="#ConfirmModel"
                                                    onClick={() =>
                                                      setModelRequestData({
                                                        ...modelRequestData,
                                                        contractKeyID:
                                                          engagement.contractKeyID,
                                                        clientName:
                                                          engagement.clientName,
                                                        userKeyID:
                                                          common.userKeyID,
                                                        Action: "Delete",
                                                      })
                                                    }
                                                  >
                                                    <i class="ri-delete-bin-5-fill"></i>
                                                  </button>
                                                </div>
                                              </Tooltip>

                                            </div>
                                          </td> */}

                                                    {/* <td className="table-content-font">
                                            <div class="d-flex gap-2">
                                             
                                              <div class="dropdown">
                                                <button
                                                  class="btn btn-md btn-success create-item-btn"
                                                  type="button"
                                                  id="dropdownMenuButton"
                                                  data-bs-toggle="dropdown"
                                                  aria-expanded="false"
                                                ><span>
                                                    Actions
                                                    <ExpandMoreIcon />

                                                  </span>
                                                </button>
                                                <ul style={{
                                                  padding: `${engagement.statusID === statusID.Draft ? "2px 0px 2px 0px" : "6px 8px"}`
                                                }} class="dropdown-menu" aria-labelledby="dropdownElMenuButton">
                                               
                                                  {engagement.statusID === statusID.Draft && userAccessData.Admin_Engagement_Latter_CanEdit && (
                                                    <li>
                                                     
                                                      <a class="dropdown-item" onClick={() =>
                                                        EngagementEditBtnClicked(
                                                          engagement
                                                        )
                                                      }>
                                                        <i
                                                          className="ri-pencil-fill custom-pencil-icon"
                                                          style={{ marginRight: "2px" }}
                                                        ></i> Edit {EngagementName}
                                                      </a>
                                                     
                                                    </li>
                                                  )}

                                                
                                                  {(engagement.statusID !== statusID.Draft) && userAccessData.Admin_Engagement_Latter_CanView && (
                                                    <li>

                                                      <a class="dropdown-item" onClick={() =>
                                                        handleViewEngagementDetails(
                                                          engagement
                                                        )
                                                      }>
                                                        <i class="bi bi-eye"></i> View {EngagementName}
                                                      </a>

                                                    </li>
                                                  )}

                                                
                                                  {engagement.statusID !== statusID.Draft && (
                                                    <li>

                                                      <a class="dropdown-item" data-bs-toggle="modal"
                                                        data-bs-target="#ConfirmModel" onClick={() => {
                                                          setModelRequestData({
                                                            ...modelRequestData,
                                                            Action: "Copy",
                                                            contractKeyID:
                                                              engagement.contractKeyID,
                                                            refId:
                                                              engagement.prefix,
                                                          });
                                                        }}>
                                                        <i class="fa-solid fa-copy"></i> Copy {EngagementName}
                                                      </a>

                                                    </li>
                                                  )}
                                                 
                                                  {(engagement.statusID === statusID.Sent || engagement.statusID === statusID.Awaiting_Signature
                                                  ) && userAccessData.Admin_Engagement_Latter_CanEdit && (
                                                      <li>
                                                        <a class="dropdown-item" data-bs-toggle="modal"
                                                          data-bs-target="#ConfirmModel" onClick={() => {
                                                            setModelRequestData({
                                                              ...modelRequestData,
                                                              contractKeyID: engagement.contractKeyID,
                                                              message: `Are you sure you want to re-send ${EngagementName}`,
                                                              refId: engagement.prefix,
                                                              Action: "Resend"
                                                            })
                                                          }}>
                                                          <i class="fas fa-redo"></i> Re-send {EngagementName}
                                                        </a>
                                                      </li>
                                                    )}
                                                </ul>
                                              </div>
                                            </div>

                                          </td> */}
                                                    {/* <td>
                                            <div class="d-flex gap-2">
                                              {userAccessData.Admin_Engagement_Latter_CanView && (
                                                <>
                                                  {engagement.statusID !==
                                                    statusID.Draft && (
                                                      <Tooltip
                                                        title={getCrudButtonToolTipName(
                                                          "View",
                                                          EngagementName
                                                        )}
                                                      >
                                                        <div class="view">
                                                          <button
                                                            class="btn btn-md btn-success create-item-btn view"
                                                            onClick={() =>
                                                              handleViewEngagementDetails(
                                                                engagement
                                                              )
                                                            }
                                                          >
                                                            {/* <i class="ri-pencil-fill"></i> */}
                                                    {/*   <span
                                                              style={{
                                                                marginRight:
                                                                  "4px",
                                                              }}
                                                            >
                                                              View
                                                            </span>
                                                            <i class="bi bi-eye"></i>
                                                          </button>
                                                        </div>
                                                      </Tooltip>
                                                    )}
                                                </>
                                              )}
                                              {userAccessData.Admin_Engagement_Latter_CanEdit && (
                                                <>
                                                  {engagement.statusID ===
                                                    statusID.Draft && (
                                                      <Tooltip
                                                        title={getCrudButtonToolTipName(
                                                          "Update",
                                                          EngagementName
                                                        )}
                                                      >
                                                        <div class="edit">
                                                          <button
                                                            class="btn btn-sm btn-success edit-item-btn actionButtonsStyle"
                                                            onClick={() =>
                                                              EngagementEditBtnClicked(
                                                                engagement
                                                              )
                                                            }
                                                          >
                                                            <i class="ri-pencil-fill"></i>
                                                          </button>
                                                        </div>
                                                      </Tooltip>
                                                    )}
                                                </>
                                              )}
                                              {engagement.statusID !==
                                                statusID.Draft && (
                                                  <>
                                                    <Tooltip
                                                      title={`Copy ${EngagementName}`}
                                                    >
                                                      <div class="Engagement_letter">
                                                        <button
                                                          class="btn btn-md btn-success create-item-btn view"
                                                          data-bs-toggle="modal"
                                                          data-bs-target="#ConfirmModel"
                                                          onClick={() => {
                                                            setModelRequestData({
                                                              ...modelRequestData,
                                                              Action: "Copy",
                                                              contractKeyID:
                                                                engagement.contractKeyID,
                                                              refId:
                                                                engagement.prefix,
                                                            });
                                                          }}
                                                        >
                                                          <span
                                                            style={{
                                                              marginRight: "4px",
                                                            }}
                                                          >
                                                            Copy
                                                          </span>
                                                          <i class="fa-solid fa-copy"></i>
                                                        </button>
                                                      </div>
                                                    </Tooltip>
                                                  </>
                                                )}
                                            </div>
                                          </td> */}
                                                  </tr>
                                                </>
                                              );
                                            })}
                                          </tbody>
                                        </table>
                                      )}
                                    </div>
                                    {activeTab === "NewEL" && (
                                      <div>
                                        {totalRecords <= 0 && (
                                          <NoResultFoundModel
                                            name={EngagementName}
                                            totalRecords={totalRecords}
                                          />
                                        )}
                                      </div>
                                    )}
                                    {activeTab === "WebEL" && (
                                      <div>
                                        {totalSingleRecords <= 0 && (
                                          <NoResultFoundModel
                                            name={EngagementName}
                                            totalRecords={totalSingleRecords}
                                          />
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                {activeTab === "NewEL" && (
                                  <div>
                                    {listCount > Number(pageSize) && (
                                      <PaginationComponent
                                        totalCount={listCount}
                                        totalPages={
                                          isMobile
                                            ? Math.ceil(
                                                listCount / isMobileRecords,
                                              )
                                            : Math.ceil(
                                                listCount /
                                                  (desktopRecords > 5 &&
                                                  window.innerHeight == 652
                                                    ? 5
                                                    : desktopRecords),
                                              )
                                        }
                                        currentPage={currentPage}
                                        onPageChange={handlePageChange}
                                      />
                                    )}
                                  </div>
                                )}
                                {activeTab === "WebEL" && (
                                  <div>
                                    {SingleElListCount > Number(pageSize) && (
                                      <PaginationComponent
                                        totalCount={SingleElListCount}
                                        totalPages={
                                          isMobile
                                            ? Math.ceil(
                                                SingleElListCount /
                                                  isMobileRecords,
                                              )
                                            : Math.ceil(
                                                SingleElListCount /
                                                  (desktopRecords > 5 &&
                                                  window.innerHeight == 652
                                                    ? 5
                                                    : desktopRecords),
                                              )
                                        }
                                        currentPage={SingleElCurrentPage}
                                        onPageChange={handlePageSingleELChange}
                                      />
                                    )}
                                  </div>
                                )}
                                {activeTab === "OldEL" && (
                                  <div>
                                    {oldElListCount > pageSize && (
                                      <PaginationComponent
                                        totalCount={oldElListCount}
                                        totalPages={totalOldELPage}
                                        currentPage={ElCurrentPage}
                                        onPageChange={handlePageOldELChange}
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
                    {/* End Page-content */}
                    <ViewPlan
                      moduleName={"Contract"}
                      showModal={showModal}
                      handleCloseModel={handleCloseModel}
                      setShowModal={setShowModal}
                      activeOrganizationKeyId={common.organisationKeyID}
                    />
                    <ConfirmModel
                      openSuccessModal={openSuccessModal}
                      modelRequestData={modelRequestData}
                      UpdatedStatus={
                        modelRequestData.Action === "ReminderStatus"
                          ? ChangeContractStatusData
                          : modelRequestData.Action === "Resend"
                            ? handleResend
                            : modelRequestData.Action === "Void"
                              ? VoidContractData
                              : modelRequestData.Action === "Delete"
                                ? DeleteSingleApiContractData
                                : modelRequestData.Action === "DeleteContract"
                                  ? HandleDeleteDraftContractData
                                  : modelRequestData.Action ===
                                      "ArchiveContract"
                                      || modelRequestData.Action === "UnarchiveContract"
                                    ? ArchiveContractData
                                    : modelRequestData.Action === "Copy"
                                      ? CopyContractData
                                      : () => CopyContractData(null, true)
                      }
                    />
                    <SuccessModal
                      handleClose={handleClose}
                      setOpenSuccessModal={setOpenSuccessModal}
                      openSuccessModal={openSuccessModal}
                      modelAction={modelRequestData.Action}
                      message={
                        modelRequestData.Action === "Copy"
                          ? `The Copy of  ${modelRequestData.refId} has been created successfully! `
                          : modelRequestData.Action === "ReminderStatus"
                            ? "Status has been changed successfully!"
                            : modelRequestData.Action === "Resend"
                              ? EngagementName
                              : modelRequestData.Action === "Void"
                                ? `${modelRequestData.refId} has been voided successfully!`
                                : modelRequestData.Action === "Delete"
                                  ? selectedRows.length !== 0
                                    ? EngagementName
                                    : ""
                                  : modelRequestData.Action === "DeleteContract"
                                    ? EngagementName
                                    : modelRequestData.Action ===
                                        "ArchiveContract"
                                      ? EngagementName
                                      : modelRequestData.Action ===
                                          "UnarchiveContract"
                                        ? EngagementName
                                        : modelRequestData.Action ===
                                            "Create Invoice"
                                          ? "Invoice created successfully!"
                                          : ""
                      }
                      refIdStore={modelRequestData.refId}
                    />

                    <ErrorModel
                      ErrorModel={openErrorModal}
                      emailError={emailError}
                      handleClose={handleCloseErrorModel}
                      ErrorMessage={errorMessage}
                    />
                    <FilterModel
                      class="modal fade"
                      id="FilterModel"
                      tabIndex="-1"
                      aria_labelledby="exampleModalLabel"
                      aria_hidden="true"
                      data-bs-backdrop="static"
                      data-bs-keyboard="false"
                      clearFilter={clearFilter}
                      selectedOption={selectedOption}
                      setFromDate={setFromDate}
                      setToDate={setToDate}
                      setStatus={setStatus}
                      setSelectedOption={setSelectedOption}
                      showDatePicker={showDatePicker}
                      setShowDatePicker={setShowDatePicker}
                      fromDate={fromDate}
                      toDate={toDate}
                      status={status}
                      ModuleName={EngagementName}
                      engagementList={engagementList}
                      ApplyFilter={ApplyFilter}
                      businessNatureID={businessNatureID}
                      setBusinessNatureID={setBusinessNatureID}
                      prospectType={prospectType}
                      setProspectType={setProspectType}
                      formDateOfCalenderForExport={formDateOfCalenderForExport}
                      setFormDateOfCalenderForExport={
                        setFormDateOfCalenderForExport
                      }
                      toDateCalenderForExport={toDateCalenderForExport}
                      setToDateCalenderForExport={setToDateCalenderForExport}
                    />

                    <EmailFailurePopUP
                      open={openEmailFailurePopUp}
                      handleClose={handleEmailFailurePopupClose}
                      isBackDropDisplay={true}
                      onYesClick={handleResendContract}
                      emailCheckModel={emailCheckModel}
                    />
                  </div>

                  {/* start back-to-top */}
                  <button
                    onclick="topFunction()"
                    class="btn btn-danger btn-icon"
                    id="back-to-top"
                  >
                    <i class="ri-arrow-up-line"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* </div> */}
      </div>
      <Footer />
    </>
  );
};

export default Engagement_Letter;
