/* global $ */
import React, { useContext, useEffect, useRef, useState } from "react";
import CommonButtonComponent from "../../components/CommonButtonComponent";
import { useLocation, useNavigate } from "react-router-dom";
import "./Proposals.css";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Utils from "../../Middleware/Utils";
import Select from "react-select";
import { AuthContextProvider } from "../../AuthContext/AuthContext";
import dayjs from "dayjs";
import DatePicker from "react-date-picker";
import "react-date-picker/dist/DatePicker.css";
import "react-calendar/dist/Calendar.css";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  ChangeQuoteStatus,
  CopyQuotation,
  DeleteQuotation,
  DeleteSingleApiQuote,
  GetOldProposalList,
  GetProposalList,
  ResendProposal,
  ArchiveQuotation
} from "../../redux/Services/Proposal/ProposalApi";
import DropDown from "../../components/DropDown";
import { useSelector } from "react-redux";
// import Proposal_model from "./AddNewProposalModal";
import PaginationComponent from "../../components/PaginationModel";
import NoResultFoundModel from "../../components/NoResultFoundModel";
import Footer from "../../components/Footer";
import Tooltip from "@mui/material/Tooltip";
import {
  CalenderFilterEnum,
  statusID,
  statusNames,
} from "../../Middleware/enums";
import FilterModel from "../../components/FilterModel";
import * as XLSX from "xlsx";
import { GetNOBTypeLookupList } from "../../redux/Services/Master/NOBTypeLookupListApi";
import { GetProspectTypeVariationLookupList } from "../../redux/Services/Master/BusinessTypeLookupListApi";
import { GetServiceUpdatedAfterSendingQuoteOrContract } from "../../redux/Services/Config/ServicesApi";
import ViewPlan from "../../components/ViewPlan";
import { Base_Url } from "../../Base-Url/Base_Url";
import SuccessModal from "../../components/SuccessModal";
import ConfirmModel from "../../components/ConfirmationBox";
import Android12Switch from "../../components/AndroidSwitch";
import ErrorModel from "../../components/ErrorModel";
import {
  ChangeFailedMailLogStatus,
  GetProspectSendMailStatus,
  ResendAddUpdateQuote,
} from "../../redux/Services/EmailFailureStatusAPI/EmailFailureStatusAPI";
import EmailFailurePopUP from "../../components/EmailFailurePopUp";
const Proposals = () => {
  const SaveAsDraft = "SaveAsDraft";

  // Declare State
  const [modelRequestData, setModelRequestData] = useState({
    message: null,
    status: null,
    Action: null,
    ProposalId: null,
    keyID: null,
    SearchKeyword: "",
    quoteKeyID: null,
    RefId: null,
    contracts: []
  });

  const [openEmailFailurePopUp, setOpenEmailFailurePopUp] = useState(false);
  const [emailCheckModel, setEmailCheckModel] = useState({
    MethodName: "",
  });

  const [activeTab, setActiveTab] = useState("Proposal");
  const [formDateOfCalenderForExport, setFormDateOfCalenderForExport] =
    useState(null);
  const [openSuccessModal, setOpenSuccessModal] = React.useState(false);
  const [toDateCalenderForExport, setToDateCalenderForExport] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isAddUpdateActionDone, setIsAddUpdateActionDone] = useState(false);
  const [ProposalList, setProposalList] = useState([]);
  const [remainingProposalsPerMonth, setRemainingProposalsPerMonth] = useState(null);
  const [SingleProposalList, setSingleProposalList] = useState([]);
  const [oldProposalList, setOldProposalList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [OldProposalCurrentPage, setOldProposalCurrentPage] = useState(1);
  const [SingleProposalCurrentPage, setSingleProposalCurrentPage] = useState(1);
  const [businessNatureID, setBusinessNatureID] = useState(null);
  const [prospectType, setProspectType] = useState(null);
  const [isFilterApply, setIsFilterApply] = useState(false);
  const common = useSelector((state) => state.Storage); //Getting Logged Users Details From Persist Storage of redux hooks
  const [title, setTitle] = useState("");
  const [search, setSearch] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const location = useLocation();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedOption, setSelectedOption] = useState("");
  const [isHovered, setIsHovered] = useState(false);
  const [ProposalSearchKeyword, setSearchOldProposalKeyword] = useState("");
  const [SingleProposalSearchKeyword, setSearchSingleProposalKeyword] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [totalRecords, setTotalRecords] = useState(-1);
  const [OldtotalRecords, setOldTotalRecords] = useState(-1);
  const [SingletotalRecords, setSingleTotalRecords] = useState(-1);
  let getTemplateListApiCallCount = 0;
  const [fromDate, setFromDate] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [toDate, setToDate] = useState(null);
  const [isCopyPending, setIsCopyPending] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [status, setStatus] = useState("");
  const [oldProposalListCount, setOldProposalListCount] = useState(0);
  const [SingleProposalListCount, setSingleProposalListCount] = useState(0);
  const [openErrorModal, setOpenErrorModal] = useState(false);
  const [hasWebPLData, setHasWebPLData] = useState(false);
  const hasCheckedWebPL = useRef(false);
  const navigate = useNavigate();
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
    GetCustomDate,
    activeOrganizationSubscriptionPlan,
    formatValue,
  } = useContext(AuthContextProvider);
  const pageSize = isMobile
    ? isMobileRecords
    : desktopRecords > 5 && window.innerHeight == 652
      ? 5
      : desktopRecords;

  const totalOldProposalPage = isMobile
    ? Math.ceil(oldProposalListCount / isMobileRecords)
    : Math.ceil(
        oldProposalListCount /
          (desktopRecords > 5 && window.innerHeight == 652
            ? 5
            : desktopRecords),
      );
  // B] Initial useEffect :
  // 1) Will Call Initial Api Like List Api
  useEffect(() => {
    setTopbar("block");
    GetOldProposalListData(1);
    GetProposalListSingleApiData(1);
  }, []);

  useEffect(() => {
    if (location.state && location.state.proposalType !== null) {
      // const FromDate = location.state.fromDate || null;
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
      GetProposalListData(
        1,
        null,
        location.state.proposalType,
        FromDate,
        ToDate,
        businessNatureID,
        prospectType,
      );
    } else {
      GetProposalListData(
        currentPage,
        null,
        status,
        fromDate,
        toDate,
        businessNatureID,
        prospectType,
      );
    }
  }, [
    location.state?.proposalType,
    location.state?.fromDate,
    location.state?.toDate,
    location.state?.selectedOption,
  ]);

  //2) This useEffect will trigger when we successfully add or update record from popup model
  useEffect(() => {
    if (isAddUpdateActionDone) {
      GetProposalListData(currentPage);
      setIsAddUpdateActionDone(false);
    }
  }, [isAddUpdateActionDone]);

  //Handle Search
  const handleSearch = (e) => {
    const searchKeywordValue = e.target.value;
    setSearchKeyword(searchKeywordValue);
    setCurrentPage(1);
    GetProposalListData(
      1,
      searchKeywordValue,
      null,
      null,
      null,
      businessNatureID,
      prospectType,
    );
  };
  const handleSearchOldProposal = (e) => {
    const searchKeywordValue = e.target.value;
    setSearchOldProposalKeyword(searchKeywordValue);
    setOldProposalCurrentPage(OldProposalCurrentPage);
    GetOldProposalListData(
      OldProposalCurrentPage,
      searchKeywordValue,
      null,
      null,
      null,
      businessNatureID,
      prospectType,
    );
  };
  const handleSearchSinglePL = (e) => {
    const searchKeywordValue = e.target.value;
    setSearchSingleProposalKeyword(searchKeywordValue);
    setSingleProposalCurrentPage(1);
    GetProposalListSingleApiData(
      1,
      searchKeywordValue,
      null,
      null,
      null,
    );
  };

  // Handle Close the  Model
  const handleCloseModel = () => {
    setShowModal(false);
  };
  const handleCloseErrorModel = () => {
    setOpenErrorModal(false);
  };
  //Handle Page Change
  const handlePageChange = async (pageNumber) => {
    setCurrentPage(pageNumber);
    await GetProposalListData(pageNumber); // Call your function with the selected page number
  };
  const handlePageChangeOldProposal = async (pageNumber) => {
    setOldProposalCurrentPage(pageNumber);
    await GetOldProposalListData(pageNumber); // Call your function with the selected page number
  };
  const handlePageChangeSingleProposal = async (pageNumber) => {
    setSingleProposalCurrentPage(pageNumber);
    await GetProposalListSingleApiData(pageNumber); // Call your function with the selected page number
  };

  //Handle Export data
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
        BusinessTypeListData = ProspectData.data.responseData.data.map(
          (BusinessType) => ({
            value: BusinessType.businessTypeID,
            label: BusinessType.businessTypeName,
          }),
        );
      }
    }
    let NoBTypeListData = [];
    const NOBType = await GetNOBTypeLookupList(
      common.organisationKeyID,
      common.userKeyID,
    );
    if (NOBType?.data?.statusCode === 200) {
      if (NOBType?.data?.responseData?.data) {
        NoBTypeListData = NOBType.data.responseData.data.map((NOB) => ({
          value: NOB.businessNatureID,
          label: NOB.businessNatureName,
        }));
      }
    }
    try {
      const data = await GetProposalList({
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
        quoteFor: "Outbooks",
      });

      // NEW: fetch the SingleApi proposal data too
      const singleApiData = await GetProposalList({
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
        quoteFor: "SingleApi",
      });

      if (data && data.data.statusCode === 200) {
        if (data.data.responseData.data.length > 0) {
          const ProposalListData = data.data.responseData.data;
          const statusName =
            Utils.ProposalStatus.find((option) => option.value === status)?.label || "";
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
            "Total Proposals (Proposal Data)": ProposalListData.length,
            "Total Proposals (API Proposal Data)":
              singleApiData?.data?.statusCode === 200
                ? singleApiData?.data?.responseData?.data?.length || 0
                : 0,
          };

          const proposal = `${prospectName} Name`;
          const proposalPdf = `${proposalName} PDF`;

          // shared row-mapper so both sheets stay consistent
          const mapProposalRows = (list) =>
            list.map((item) => ({
              "Ref Id": item.prefix,
              [proposal]: item.clientName,
              "One Off Price": `£ ${item.oneOffPrice !== null ? item.oneOffPrice : "0.00"}`,
              "Recurring Price": `£ ${item.recurringPrice !== null ? item.recurringPrice : "0.00"}`,
              "Status Name": item.statusName,
              [proposalPdf]: item.quotePDFUrl,
              "Last Updated On": item.lastUpdatedOn,
            }));

          const proposalHeaderRow = [
            "Ref Id",
            proposal,
            "One Off Price",
            "Recurring Price",
            "Status Name",
            proposalPdf,
            "Last Updated On",
          ];

          const toRows = (mappedList) =>
            mappedList.map((item) => [
              item["Ref Id"],
              item[proposal],
              item["One Off Price"],
              item["Recurring Price"],
              item["Status Name"],
              item[proposalPdf],
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

          // Sheet 1: Summary/filters
          const headersArray = Object.entries(headers).map(([key, value]) => [key, value]);
          const summarySheet = XLSX.utils.aoa_to_sheet(headersArray);
          setColWidths(summarySheet, headersArray);
          XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");

          // Sheet 2: Proposal data
          const proposalRows = toRows(mapProposalRows(ProposalListData));
          const proposalSheetData = [proposalHeaderRow, ...proposalRows];
          const proposalSheet = XLSX.utils.aoa_to_sheet(proposalSheetData);
          setColWidths(proposalSheet, proposalSheetData);
          XLSX.utils.book_append_sheet(workbook, proposalSheet, "Proposal Data");

          // Sheet 3: API (SingleApi) proposal data
          if (singleApiData?.data?.statusCode === 200 && singleApiData?.data?.responseData?.data?.length > 0) {
            const singleApiRows = toRows(mapProposalRows(singleApiData.data.responseData.data));
            const singleApiSheetData = [proposalHeaderRow, ...singleApiRows];
            const singleApiSheet = XLSX.utils.aoa_to_sheet(singleApiSheetData);
            setColWidths(singleApiSheet, singleApiSheetData);
            XLSX.utils.book_append_sheet(workbook, singleApiSheet, "API Proposal Data");
          }

          const fileName = `${proposalName}_Data_${orgName.organisationName}_${reportingPeriod}.xlsx`;
          XLSX.writeFile(workbook, fileName);

          await GetProposalListData(
            1, searchKeyword, status, fromDate, toDate, businessNatureID, prospectType, false,
          );
        } else {
          console.error("No data available for export");
        }
      } else {
        console.error("Failed to fetch data for export");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleEmailFailurePopupClose = async () => {
    await ChangeFailedMailLogStatus(
      common.userKeyID,
      common.organisationKeyID,
      "AddUpdateQuote",
    );
    setOpenEmailFailurePopUp(false);
  };

  const handleResendQuote = async () => {
    setLoader(true);
    try {
      if (emailCheckModel.MethodName === "Resend") {
        const data = await ResendProposal(
          modelRequestData.quoteKeyID,
          common.userKeyID,
        );

        if (data.data.statusCode === 200) {
          setLoader(false);
          setOpenSuccessModal(true);
        } else {
          $("#" + "ConfirmModel").modal("hide");
          setLoader(false);
          setOpenErrorModal(true);
          setErrorMessage(data.data.errorMessage);
        }
      } else {
        await ResendAddUpdateQuote(
          common.userKeyID,
          modelRequestData.quoteKeyID,
        );
      }
      setLoader(false);
      setOpenEmailFailurePopUp(false);
    } catch (error) {
      setLoader(false);
      console.log(error);
    }
  };

  //Get Proposal List data From Api
  const GetProposalListData = async (
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
      const data = await GetProposalList({
        organisationKeyID: common.organisationKeyID,
        pageSize: exportPageSize ? 30 : Number(pageSize),
        pageNo: pageNoList,
        SearchKeyword:
          searchKeywordValue === undefined ? searchKeyword : searchKeywordValue,
        StatusID: Status !== undefined ? Status : status,
        userKeyID: common.userKeyID || null,
        fromDate:
          FromDate === undefined
            ? fromDate == ""
              ? null
              : fromDate
            : FromDate,
        toDate: ToDate === undefined ? (toDate == "" ? null : toDate) : ToDate,
        businessTypeID:
          prospectTypeId === undefined ? prospectType : prospectTypeId,
        businessNatureID:
          businessNatureId === undefined ? businessNatureID : businessNatureId,
        quoteFor: "Outbooks",
      });
      if (data) {
        if (data?.data?.statusCode === 200) {
          setLoader(false);
          getTemplateListApiCallCount = 0;
          if (data?.data?.responseData?.data) {
            const totalCount = data.data.totalCount;
            const ProposalListData = data.data.responseData.data;
            const remainingProposals = data.data.responseData.remainingQuotesPerMonth;
            if (pageNoList > 0 && ProposalListData.length === 0) {
              let newPaneNo = Number(pageNoList);
              if (newPaneNo > 1) {
                newPaneNo = newPaneNo - 1;
              }
              GetProposalListData(newPaneNo, searchKeywordValue);
              setCurrentPage(pageNoList);
              return;
            }
            setListCount(totalCount);
            setProposalList(ProposalListData);
            setRemainingProposalsPerMonth(remainingProposals);
            console.log(remainingProposals);
            setTotalRecords(ProposalListData.length);
          }
        } else {
          if (getTemplateListApiCallCount < maxCountToRecallApi) {
            getTemplateListApiCallCount += 1;
            setTimeout(function () {
              GetProposalListData(i, searchKeywordValue);
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

  const GetProposalListSingleApiData = async (
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
      const data = await GetProposalList({
        organisationKeyID: common.organisationKeyID,
        pageSize: Number(pageSize),
        pageNo: pageNoList,
        SearchKeyword:
          searchKeywordValue === undefined ? searchKeyword : searchKeywordValue,
        StatusID: Status !== undefined ? Status : status,
        userKeyID: common.userKeyID || null,
        fromDate:
          FromDate === undefined
            ? fromDate == ""
              ? null
              : fromDate
            : FromDate,
        toDate: ToDate === undefined ? (toDate == "" ? null : toDate) : ToDate,
        businessTypeID:
          prospectTypeId === undefined ? prospectType : prospectTypeId,
        businessNatureID:
          businessNatureId === undefined ? businessNatureID : businessNatureId,
        quoteFor: "SingleApi",
      });
      if (data) {
        if (data?.data?.statusCode === 200) {
          setLoader(false);
          getTemplateListApiCallCount = 0;
          if (data?.data?.responseData?.data) {
            const totalCount = data.data.totalCount;
            const ProposalListData = data.data.responseData.data;
            if (pageNoList > 0 && ProposalListData.length === 0) {
              let newPaneNo = Number(pageNoList);
              if (newPaneNo > 1) {
                newPaneNo = newPaneNo - 1;
              }
              GetProposalListSingleApiData(newPaneNo, searchKeywordValue);
              setSingleProposalCurrentPage(pageNoList);
              return;
            }
            setSingleProposalListCount(totalCount);
            setSingleProposalList(ProposalListData);
            setSingleTotalRecords(ProposalListData.length);

            if (!hasCheckedWebPL.current) {
              hasCheckedWebPL.current = true;
              setHasWebPLData(ProposalListData.length > 0);
            }
          }
        } else {
          if (getTemplateListApiCallCount < maxCountToRecallApi) {
            getTemplateListApiCallCount += 1;
            setTimeout(function () {
              GetProposalListSingleApiData(i, searchKeywordValue);
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

  const GetOldProposalListData = async (
    i,
    searchKeywordValue,
    Status,
    FromDate,
    ToDate,
  ) => {
    setLoader(true);

    const pageNoList = i - 1;
    try {
      const data = await GetOldProposalList({
        organisationKeyID: common.organisationKeyID,
        pageSize: Number(pageSize),
        pageNo: pageNoList,
        SearchKeyword:
          searchKeywordValue === undefined
            ? ProposalSearchKeyword
            : searchKeywordValue,
        StatusID: Status !== undefined ? Status : status,
        userKeyID: common.userKeyID || null,
        fromDate:
          FromDate === undefined
            ? fromDate == ""
              ? null
              : fromDate
            : FromDate,
        toDate: ToDate === undefined ? (toDate == "" ? null : toDate) : ToDate,
      });
      if (data) {
        if (data?.data?.statusCode === 200) {
          setLoader(false);
          getTemplateListApiCallCount = 0;
          if (data?.data?.responseData?.data) {
            const totalCount = data.data.totalCount;
            const ProposalListData = data.data.responseData.data;
            if (pageNoList > 0 && ProposalListData.length === 0) {
              let newPaneNo = Number(pageNoList);
              if (newPaneNo > 1) {
                newPaneNo = newPaneNo - 1;
              }
              GetOldProposalListData(newPaneNo, searchKeywordValue);
              OldProposalCurrentPage(pageNoList);
              return;
            }
            setOldProposalListCount(totalCount);
            setOldProposalList(ProposalListData);
            setOldTotalRecords(ProposalListData.length);
          }
        } else {
          if (getTemplateListApiCallCount < maxCountToRecallApi) {
            getTemplateListApiCallCount += 1;
            setTimeout(function () {
              GetOldProposalListData(i, searchKeywordValue);
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
  // E] Event Handling Functions will call here.
  // 1) On Click Service Category Add Button

  //Click Add Proposal
  const ProposalAddBtnClicked = () => {
    if (activeOrganizationSubscriptionPlan?.prepareQuote !== true || (remainingProposalsPerMonth === undefined || remainingProposalsPerMonth === 0)) {
      setShowModal(true);
      return;
    }

    navigate("/add-proposal", {
      state: {
        quoteKeyID: null,
        Action: null,
      },
    });
  };

  const TabHandle = (tab) => {
    if (tab === "Old Proposal") {
      setActiveTab(tab);
      GetOldProposalListData(1);
    } else if (tab === "Proposal") {
      setActiveTab(tab);
      GetProposalListData(1);
      setSearchSingleProposalKeyword("");
    } else {
      setActiveTab(tab);
      // GetProposalListData(1)
      GetProposalListSingleApiData(1);
      setSearchKeyword("");
    }
  };

  //Click on Edit Proposal
  const handleEditProposal = (item) => {
    setModelRequestData({
      ...modelRequestData,
      quoteKeyID: item.quoteKeyID,
      Action: "Update",
    });
    let addTemplateRequestData = {
      quoteKeyID: item?.quoteKeyID || null,
      Action: "Update",
    };
    navigate("/add-proposal", { state: addTemplateRequestData });
  };

  //handle Skip to El
  // const HandleSkippedToEL = (item) => {
  //   // Update modelRequestData state
  //   setModelRequestData((prevData) => ({
  //     ...prevData,
  //     quoteKeyID: item.quoteKeyID,
  //   }));

  //   // Create addEngagementLetterData
  //   const addEngagementLetterData = item
  //     ? { QuoteKeyID: item.quoteKeyID }
  //     : { QuoteKeyID: null };

  //   // Navigate to /add-engagement-letter with state
  //   navigate("/add-engagement-letter", { state: addEngagementLetterData });
  // };

  const HandleSkippedToEL = async (item, confirmed = false) => {
    // keep quoteKeyID in state for confirm use
    setModelRequestData((prev) => ({
      ...prev,
      quoteKeyID: item?.quoteKeyID ?? prev.quoteKeyID,
    }));

    try {
      if (!confirmed) {
        setLoader(true);
        const checkRes = await GetServiceUpdatedAfterSendingQuoteOrContract(
          item.quoteKeyID,
          "Quotation", // or "Contract" if that’s the right module for your EL flow
        );
        setLoader(false);

        if (checkRes?.data?.statusCode === 200) {
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

          // Build message using only \n (the modal already uses white-space: pre-wrap)
          let message = "";

          // If updated items exist
          if (serviceUpdatedAfterSent || packageUpdatedAfterSent) {
            message +=
              "Following Services or Packages were updated which may affect the Engagement Letter. Do you want to proceed?\n";

            if (serviceUpdatedAfterSent && updatedServiceNames?.length > 0) {
              message += "\nServices:\n";
              message +=
                updatedServiceNames.map((s) => `• ${s}`).join("\n") + "\n";
            }

            if (packageUpdatedAfterSent && updatedPackageNames?.length > 0) {
              message += "\nPackages:\n";
              message +=
                updatedPackageNames.map((p) => `• ${p}`).join("\n") + "\n";
            }

            message += "\n"; // spacer if both updated & deleted exist
          }

          // If deleted items exist
          if (serviceDeletedAfterSent || packageDeletedAfterSent) {
            message +=
              "Following Services or Packages were deleted which may affect the Engagement Letter. Do you want to proceed?\n";

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

          // If anything changed, open confirm modal for the EL flow
          if (
            serviceUpdatedAfterSent ||
            serviceDeletedAfterSent ||
            packageUpdatedAfterSent ||
            packageDeletedAfterSent
          ) {
            setModelRequestData((prev) => ({
              ...prev,
              Action: "ServiceWarningEL",
              message,
              quoteKeyID: item.quoteKeyID,
            }));
            $("#ConfirmModel").modal("show");
            return;
          }
        } else {
          setErrorMessage(
            checkRes?.data?.errorMessage || "Something went wrong.",
          );
          setOpenErrorModal(true);
          return;
        }
      }

      // Phase B: proceed (user clicked Yes or no warnings)
      $("#ConfirmModel").modal("hide");
      const addEngagementLetterData = {
        QuoteKeyID: item?.quoteKeyID || modelRequestData.quoteKeyID || null,
      };
      navigate("/add-engagement-letter", { state: addEngagementLetterData });
    } catch (err) {
      setLoader(false);
      setErrorMessage(err?.message || String(err));
      setOpenErrorModal(true);
    }
  };

  //Handle Download the pdf
  const handleDownload = async (item, Type) => {
    setLoader(true);

    try {
      const options = {
        method: "GET",
        headers: {
          Authorization: common.token,
        },
        responseType: "blob",
      };
      let response = null;
      if (Type == "Zip") {
        response = await fetch(
          `${Base_Url}/SignEasy/DownloadDocumentAsZip?ContractKeyID=${item.quoteKeyID}`,
          options,
        );
      } else {
        response = await fetch(
          `${Base_Url}/SignEasy/DownloadDocumentAsPDF?ContractKeyID=${item.quoteKeyID}`,
          options,
        );
      }
      // const response = await DownloadDocumentAsZip(ContractKeyID);

      if (!response) {
        throw new Error("Failed to download ZIP file");
      }
      // Convert the response to a blob
      const blob = await response.blob();
      // Create a temporary anchor element to trigger the download
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      if (Type == "Zip") {
        link.download = `${proposalName} for-${item.clientName}.zip`;
      } else {
        link.download = `${proposalName} for-${item.clientName}.pdf`;
      }
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setLoader(false);
    } catch (error) {
      setLoader(false);
      console.error("Error downloading ZIP file:", error);
    }
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

  //View the Proposal
  const handleView = (item) => {
    setModelRequestData({
      ...modelRequestData,
      quoteKeyID: item.quoteKeyID,
    });
    let addTemplateRequestData = {
      quoteKeyID: item?.quoteKeyID || null,
      draftOn: GetOnlyDate(item.createdOn),
      sentOn: GetOnlyDate(item.sentOn),
      AcceptedOn: GetOnlyDate(item.acceptDeclineDate),
      // SignedOn:GetOnlyDate(item.signedOn,true),
      SkippedOn: GetOnlyDate(item.lastUpdatedOn),
    };
    navigate("/view-proposal", { state: addTemplateRequestData });
  };

  //Resend the Proposal
  const handleResend = async (item) => {
    if (!activeOrganizationSubscriptionPlan.sendQuote) {
      setShowModal(true);
      return;
    }
    try {
      setLoader(true);
      const data = await ResendProposal(
        modelRequestData.quoteKeyID,
        common.userKeyID,
      );
      if (data?.response?.data?.errorMessage === "Client - Send Mail Failed") {
        // Call Get prospect send mail status api
        const EmailStausData = await GetProspectSendMailStatus(
          common.userKeyID,
          common.organisationKeyID,
          "AddUpdateQuote",
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

      if (data.data.statusCode === 200) {
        if (!data?.data?.responseData?.isEmailSent[0]?.isMailSent) {
          const EmailStausData = await GetProspectSendMailStatus(
            common.userKeyID,
            common.organisationKeyID,
            "AddUpdateQuote",
            "Temp Key Id",
          );
          if (!EmailStausData?.data?.responseData) {
            setEmailCheckModel((prev) => ({
              ...prev,
              MethodName: "Resend",
            }));
            setOpenEmailFailurePopUp(true);
          }
        }
        setLoader(false);
        setOpenSuccessModal(true);
      } else {
        $("#" + "ConfirmModel").modal("hide");
        setLoader(false);
        setOpenErrorModal(true);
        setErrorMessage(data.data.errorMessage);
      }
    } catch (error) {
      setLoader(false);
      setErrorMessage(error);
    }
  };

  //Copy the Proposal
  // const CopyQuotationData = async (item) => {
  //   if (!activeOrganizationSubscriptionPlan.prepareQuote) {
  //     setShowModal(true);
  //     return;
  //   }
  //   try {
  //     const checkRes = await GetServiceUpdatedAfterSendingQuoteOrContract(modelRequestData.quoteKeyID, "Quotation");
  //     const serviceUpdatedAfterSent = checkRes.data?.responseData?.data;
  //     if (serviceUpdatedAfterSent) {
  //       setModelRequestData({
  //         Action: "ServiceWarning", // <-- Use ServiceWarning here
  //         message: "Some Service/Services were updated which may affect the copied proposal",
  //         ServiceName: serviceUpdatedAfterSent,
  //         quoteKeyID: modelRequestData.quoteKeyID,
  //         RefId: modelRequestData.RefId,
  //       });
  //       $("#ConfirmModel").modal("show");
  //       return;
  //     }
  //     const CopyQuote = await CopyQuotation(
  //       modelRequestData.quoteKeyID,
  //       common.userKeyID
  //     );
  //     if (CopyQuote.data.statusCode === 200) {
  //       setOpenSuccessModal(true);
  //     }
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

  const CopyQuotationData = async (item, confirmed = false) => {
    // Add confirmed parameter
    if (!activeOrganizationSubscriptionPlan.prepareQuote) {
      setShowModal(true);
      return;
    }
    try {
      if (!confirmed) {
        // If not confirmed, check for service updates
        const checkRes = await GetServiceUpdatedAfterSendingQuoteOrContract(
          modelRequestData.quoteKeyID,
          "Quotation",
        );
        setLoader(true);
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
              "Following Services or Packages were updated which may affect the copied proposal. Do you want to proceed?\n";

            if (serviceUpdatedAfterSent && updatedServiceNames?.length > 0) {
              message += "\nServices:\n";
              message +=
                updatedServiceNames.map((s) => `• ${s}`).join("\n") + "\n";
            }

            if (packageUpdatedAfterSent && updatedPackageNames?.length > 0) {
              message += "\nPackages:\n";
              message +=
                updatedPackageNames.map((p) => `• ${p}`).join("\n") + "\n";
            }

            message += "\n";
          }

          // If deleted items exist
          if (serviceDeletedAfterSent || packageDeletedAfterSent) {
            message +=
              "Following Services or Packages were deleted which may affect the copied proposal. Do you want to proceed?\n";

            if (serviceDeletedAfterSent && deletedServiceNames?.length > 0) {
              message += "\nServices:\n";
              message +=
                deletedServiceNames.map((s) => `• ${s}`).join("\n") + "\n";
            }

            if (packageDeletedAfterSent && deletedPackageNames?.length > 0) {
              message += "\nPackages:\n";
              message +=
                deletedPackageNames.map((p) => `• ${p}`).join("\n") + "\n";
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
              quoteKeyID: modelRequestData.quoteKeyID,
              RefId: modelRequestData.RefId,
            });
            setIsCopyPending(true);
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
      // If confirmed or no service updates, copy the quotation
      const data = await CopyQuotation(
        modelRequestData.quoteKeyID,
        common.userKeyID,
      );
      $("#ConfirmModel").modal("hide");
      if (data) {
        if (data.data?.statusCode === 200) {
          setLoader(false);
          setOpenSuccessModal(true);
        } else {
          setLoader(false);
          setErrorMessage(data?.response?.data?.errorMessage);
          setOpenErrorModal(true);
        }
        setIsCopyPending(false); // Reset the flag
      }
    } catch (error) {
      console.log(error.message);
      setLoader(false);
      setErrorMessage(error.message);
      setOpenErrorModal(true);
      setIsCopyPending(false); // Reset the flag
    }
  };

  //handle close model function
  const handleClose = () => {
    setOpenSuccessModal(false);
    $("#" + "ConfirmModel").modal("hide");
    if (modelRequestData.Action !== "Resend") {
      GetProposalListData(
        currentPage,
        searchKeyword,
        status,
        fromDate,
        toDate,
        businessNatureID,
        prospectType,
      );
    }
  };
  //handle View the Pdf
  const handleViewPdf = (item) => {
    setModelRequestData({
      ...modelRequestData,
      quoteKeyID: item.quoteKeyID,
    });
    let ViewPdfData = {
      ModuleName: "Quote",
      quoteKeyID: item.quoteKeyID,
    };
    navigate(`/view-pdf`, { state: ViewPdfData }); // Pass quoteKeyID in URL
  };
  const handleViewOldProposalPdf = (item) => {
    navigate(`/view-pdf`, { state: item }); // Pass quoteKeyID in URL
  };
  const ChangeQuoteStatusData = async () => {
    setLoader(true);
    if (modelRequestData.Action === "ReminderStatus") {
      try {
        const Data = await ChangeQuoteStatus(
          modelRequestData.quoteKeyID,
          common.userKeyID,
        );
        if (Data) {
          setLoader(false);
          if (Data?.data?.statusCode === 200) {
            setOpenSuccessModal(true);

            // GetProposalListData(currentPage);
            // setOpenSuccessModal(true);
          } else {
            setErrorMessage(Data?.response?.data?.errorMessage);
            // setOpenErrorModal(true);
          }
          // GetProposalListData(currentPage);
        }
      } catch (error) {
        console.log(error);
      }
    }
  };
  // Delete Draft Quotation
  const DeleteQuotationData = async () => {
    try {
      setLoader(true);
      if (selectedRows.length !== 0) {
        const data = await DeleteSingleApiQuote({
          userKeyID: common.userKeyID,
          quoteKeyIDs: selectedRows,
        });
        if (data?.data?.statusCode === 200) {
          setLoader(false);
          setOpenSuccessModal(true);
          GetProposalListSingleApiData(currentPage);
        } else {
          setLoader(false);
          setErrorMessage(data?.data?.errorMessage);
          setOpenErrorModal(true);
        }
      } else {
        debugger
        const data = await DeleteQuotation(
          modelRequestData.quoteKeyID,
          common.userKeyID,
        );
        if (data?.data?.statusCode === 200) {
          setLoader(false);
          setOpenSuccessModal(true);
          // GetProposalListData(currentPage);
        } else {
          $("#" + "ConfirmModel").modal("hide");
          setLoader(false);
          setOpenErrorModal(true);
          setErrorMessage(data?.response?.data?.errorMessage);
        }
      }
    } catch (error) {
      console.error(error);
    }
  };
  
  const ArchiveQuotationData = async() => {
    try {
      // show popup saying all linked ELs will be archived too.
      // if(modelRequestData.Action === "ArchiveLinkedELs") {
      //   console.log("Pan")
      //   console.log(modelRequestData.Action)
      //   const contractList = modelRequestData.contracts
      //   .map(contract => `<li>${contract.RefID}</li>`).join('');

      //   setModelRequestData({
      //     ...modelRequestData,
      //     message: `Archiving this record would archive all the linked ${EngagementName} too:
      //     <ul>${contractList}</ul>`
      //   });
      //   $("#ConfirmModel").modal("show");
      //   return;
      // }
      setLoader(true);
      const data = await ArchiveQuotation(
        modelRequestData.quoteKeyID,
        common.userKeyID,
        modelRequestData.Action === "Archive" || modelRequestData.Action === "ArchiveLinkedELs" ? true
        : modelRequestData.Action === "Unarchive" ? false : null
      );
      if(data?.data?.statusCode === 200) {
        setLoader(false);
        setOpenSuccessModal(true);
      } else {
          setLoader(false);
          setErrorMessage(data?.data?.errorMessage);
          setOpenErrorModal(true);
      }
      GetProposalListData(
        currentPage,null,status,fromDate,toDate,businessNatureID,prospectType,
      );
    }
    catch(error) {
      console.error(error);
    }
  }

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

    GetProposalListData(
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
    GetProposalListData(1, searchKeyword, null, null, null, null, null);
    setCurrentPage(1);
  };

  const visibleRows = SingleProposalList.slice(
    0,
    isMobile ? isMobileRecords : desktopRecords,
  );

  const handleRowSelect = (quoteKeyID) => {
    setSelectedRows((prevSelected) =>
      prevSelected.includes(quoteKeyID)
        ? prevSelected.filter((id) => id !== quoteKeyID)
        : [...prevSelected, quoteKeyID],
    );
  };

  const handleSelectAll = () => {
    if (selectedRows.length === visibleRows.length) {
      setSelectedRows([]); // Deselect all
    } else {
      setSelectedRows(visibleRows.map((item) => item.quoteKeyID)); // Select all
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
                                    activeTab === "Proposal" ? "active" : ""
                                  }`}
                                  data-bs-toggle="tab"
                                  href="#Proposal"
                                  role="tab"
                                  aria-selected={activeTab === "Proposal"}
                                  onClick={() => {
                                    setActiveTab("Proposal");
                                    setSelectedRows([]);
                                    TabHandle("Proposal");
                                  }}
                                >
                                  <b>{proposalName} </b>
                                </a>
                              </li>
                              {oldProposalList.length > 0 && (
                                <li className="nav-item">
                                  <a
                                    className={`nav-link tab_nav ${
                                      activeTab === "Old Proposal"
                                        ? "active"
                                        : ""
                                    }`}
                                    data-bs-toggle="tab"
                                    href="#Old Proposal"
                                    role="tab"
                                    aria-selected={activeTab === "Old Proposal"}
                                    onClick={() => {
                                      setSelectedRows([]);
                                      TabHandle("Old Proposal");
                                    }}
                                  >
                                    <b>Migrated {proposalName}</b>
                                  </a>
                                </li>
                              )}
                              {(hasWebPLData || SingleProposalList?.length > 0) && (
                                <li className="nav-item">
                                  <a
                                    className={`nav-link tab_nav ${
                                      activeTab === "Web Proposal"
                                        ? "active"
                                        : ""
                                    }`}
                                    data-bs-toggle="tab"
                                    href="#Web Proposal"
                                    role="tab"
                                    aria-selected={activeTab === "Web Proposal"}
                                    onClick={() => {
                                      setActiveTab("Web Proposal");
                                      TabHandle("Web Proposal");
                                    }}
                                  >
                                    <b>API {proposalName} </b>
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
                                      {/* <div class="col-md-6 col-lg-6 col-9  mb-2"> */}
                                      {activeTab === "Old Proposal" && (
                                        <div class="col-md-6 col-lg-6 col-9  mb-2">
                                          <div
                                            class="search-box col-md-5 col-8 width-searchbox "
                                            style={{}}
                                          >
                                            <i className="ri-search-line search-icon"></i>
                                            <input
                                              type="text"
                                              class="form-control search"
                                              value={ProposalSearchKeyword}
                                              onChange={(e) => {
                                                handleSearchOldProposal(e);
                                              }}
                                              placeholder={
                                                isMobile
                                                  ? "Search"
                                                  : getPlaceholderTextName(
                                                      "Search",
                                                      proposalName,
                                                    )
                                              }
                                            />
                                          </div>
                                        </div>
                                      )}

                                      {activeTab === "Proposal" && (
                                        <div class="col-md-6 col-lg-6 col-9  mb-2">
                                          <div className="d-flex justify-content-start">
                                            <div
                                              class="search-box  width-searchbox "
                                              id="w-100"
                                              style={{ marginRight: "10px" }}
                                            >
                                              <i className="ri-search-line search-icon"></i>
                                              <input
                                                type="text"
                                                class="form-control search"
                                                value={searchKeyword}
                                                onChange={(e) => {
                                                  handleSearch(e);
                                                }}
                                                placeholder={
                                                  isMobile
                                                    ? "Search"
                                                    : getPlaceholderTextName(
                                                        "Search",
                                                        proposalName,
                                                      )
                                                }
                                              />
                                            </div>
                                            <div className=" d-flex align-items-start justify-content-start ">
                                              <Tooltip
                                                title={getCrudButtonToolTipName(
                                                  "Export",
                                                  proposalName,
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
                                                  proposalName,
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
                                              {isFilterApply ? (
                                                <Tooltip title={"Clear Filter"}>
                                                  <div>
                                                    <button
                                                      className="btn btn-md btn-success create-Filter-item-btn "
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
                                      )}
                                      {activeTab === "Web Proposal" && (
                                        <div class="col-md-3 col-lg-3 col-12  mb-2">
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
                                                  class="form-control search"
                                                  value={SingleProposalSearchKeyword}
                                                  onChange={(e) => {
                                                    handleSearchSinglePL(e);
                                                  }}
                                                  placeholder={
                                                    isMobile
                                                      ? "Search"
                                                      : getPlaceholderTextName(
                                                          "Search",
                                                          proposalName,
                                                        )
                                                  }
                                                />
                                              </div>
                                              {/* Export button */}
                                              <Tooltip
                                                title={getCrudButtonToolTipName(
                                                  "Export",
                                                  proposalName,
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
                                              {/* Filter button */}
                                              <Tooltip
                                                title={getCrudButtonToolTipName(
                                                  "Filter",
                                                  proposalName,
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
                                              {isFilterApply ? (
                                                <Tooltip title={"Clear Filter"}>
                                                  <div>
                                                    <button
                                                      className="btn btn-md btn-success create-Filter-item-btn me-2"
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
                                            <div className="d-flex justify-content-start">
                                              {/* Delete button */}
                                              <Tooltip
                                                title={getCrudButtonToolTipName(
                                                  `Delete Selected ${proposalName}`,
                                                )}
                                              >
                                                <div>
                                                  <button
                                                    className={
                                                      selectedRows.length !== 0
                                                        ? "btn btn-md btn-success create-item-btn filter me-2"
                                                        : "btn btn-md btn-success create-item-btn-apply filter me-2"
                                                    }
                                                    disabled={
                                                      selectedRows.length === 0
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
                                        </div>
                                      )}
                                      {/* </div> */}
                                      {activeTab === "Proposal" && (
                                        <div class="col-lg-6 col-md-6 col-3 text-nowrap mb-2">
                                          {userAccessData.Admin_Proposal_CanAdd && (
                                            <div className="d-flex justify-content-sm-end add-new-btn">
                                              {activeTab === "Proposal" && (
                                                <CommonButtonComponent
                                                  setTitle={setTitle}
                                                  name={`Add ${proposalName}`}
                                                  title={`Add ${proposalName}`}
                                                  AddBtn={() => {
                                                    setModelRequestData({
                                                      ...modelRequestData,
                                                      ProposalId: null,
                                                      keyID: null,
                                                      quoteKeyID: null,
                                                    });
                                                    ProposalAddBtnClicked();
                                                  }}
                                                  // onclick={() => ProposalAddBtnClicked()}
                                                />
                                              )}

                                              {/* </div> */}
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </div>

                                    {/* Table Of Template and Template Pdf */}

                                    <div
                                      className={`tab-pane ${
                                        activeTab === "Old Proposal"
                                          ? "active"
                                          : ""
                                      }`}
                                      id="base-justified-home"
                                    >
                                      {activeTab === "Old Proposal" && (
                                        <table
                                          class="table align-middle table-nowrap"
                                          id="customerTable"
                                        >
                                          <thead class="table-light table-header-font">
                                            <tr className="head-row">
                                              <td className="tr-table-class text-white">
                                                Ref ID
                                              </td>
                                              <td className="tr-table-class text-white">
                                                {prospectName} Name
                                              </td>
                                              <td className="tr-table-class text-white">
                                                Status
                                              </td>
                                              <td className="tr-table-class text-white">
                                                Value
                                              </td>
                                              <td className="tr-table-class text-white">
                                                Documents
                                              </td>
                                              {/* <td className="tr-table-class text-white text-center">
                                  {userAccessData.Admin_Proposal_CanView && (
                                    <>Action</>
                                  )}
                                </td> */}
                                            </tr>
                                          </thead>
                                          <tbody class="list form-check-all">
                                            {oldProposalList
                                              .slice(
                                                0,
                                                isMobile
                                                  ? isMobileRecords
                                                  : desktopRecords,
                                              )
                                              .map((item) => {
                                                return (
                                                  <tr class="table_new">
                                                    <td className="table-content-font">
                                                      {item.refID}
                                                    </td>
                                                    <td className="table-content-font">
                                                      {item.clientName}
                                                    </td>

                                                    {item.status ===
                                                      statusNames.Draft && (
                                                      <>
                                                        <td className="table-content-font ">
                                                          <p
                                                            className="  p-1 text-center text-white rounded"
                                                            style={{
                                                              background:
                                                                "#DAA520",
                                                            }}
                                                          >
                                                            {item.status
                                                              ?.charAt(0)
                                                              ?.toUpperCase() +
                                                              item.status?.slice(
                                                                1,
                                                              )}
                                                          </p>
                                                        </td>
                                                      </>
                                                    )}
                                                    {item.status ===
                                                      statusNames.Sent && (
                                                      <>
                                                        <td className="table-content-font">
                                                          <p
                                                            className=" p-1 text-center text-white rounded"
                                                            style={{
                                                              background:
                                                                " #626ED4",
                                                            }}
                                                          >
                                                            {item.status
                                                              ?.charAt(0)
                                                              ?.toUpperCase() +
                                                              item.status?.slice(
                                                                1,
                                                              )}
                                                          </p>
                                                        </td>
                                                      </>
                                                    )}
                                                    {item.status ===
                                                      statusNames.Accepted && (
                                                      <>
                                                        <td className="table-content-font">
                                                          <p
                                                            className=" p-1 text-center text-white rounded"
                                                            style={{
                                                              background:
                                                                "#008000",
                                                            }}
                                                          >
                                                            {item.status
                                                              ?.charAt(0)
                                                              ?.toUpperCase() +
                                                              item.status?.slice(
                                                                1,
                                                              )}
                                                          </p>
                                                        </td>
                                                      </>
                                                    )}
                                                    {item.status ===
                                                      statusNames.Awaiting_Signature && (
                                                      <>
                                                        <td className="table-content-font">
                                                          <p
                                                            className=" p-1 text-center text-white rounded"
                                                            style={{
                                                              background:
                                                                "#626ED4",
                                                            }}
                                                          >
                                                            {/* Awaiting Response */}
                                                            {item.statusName}
                                                          </p>
                                                        </td>
                                                      </>
                                                    )}
                                                    {item.status ===
                                                      statusNames.Declined && (
                                                      <>
                                                        <td className="table-content-font">
                                                          <p
                                                            className=" p-1 text-center text-white rounded"
                                                            style={{
                                                              background:
                                                                "#FF0000",
                                                            }}
                                                          >
                                                            {item.status
                                                              ?.charAt(0)
                                                              ?.toUpperCase() +
                                                              item.status?.slice(
                                                                1,
                                                              )}
                                                          </p>
                                                        </td>
                                                      </>
                                                    )}
                                                    {item.status ===
                                                      statusNames.Signed && (
                                                      <>
                                                        <td className="table-content-font">
                                                          <p
                                                            className=" p-1 text-center text-white rounded"
                                                            style={{
                                                              background:
                                                                "#008000",
                                                            }}
                                                          >
                                                            {item.status
                                                              ?.charAt(0)
                                                              ?.toUpperCase() +
                                                              item.status?.slice(
                                                                1,
                                                              )}
                                                          </p>
                                                        </td>
                                                      </>
                                                    )}
                                                    {item.status ===
                                                      statusNames.Skipped && (
                                                      <>
                                                        <td className="table-content-font">
                                                          <p
                                                            className=" p-1 text-center text-white rounded"
                                                            style={{
                                                              background:
                                                                "#38A4F8",
                                                            }}
                                                          >
                                                            {item.status
                                                              ?.charAt(0)
                                                              ?.toUpperCase() +
                                                              item.status?.slice(
                                                                1,
                                                              )}
                                                          </p>
                                                        </td>
                                                      </>
                                                    )}
                                                    {/* {item.packagesNames !== null && (
                                        <td>
                                          <p className="mb-0">
                                            <b>
                                              {item.packagesNames
                                                .split(",")
                                                .map((name, index) =>
                                                  name.length > 7 ? (
                                                    <Tooltip
                                                      key={index}
                                                      title={name}
                                                    >
                                                      <span>
                                                        {name.substring(0, 7) +
                                                          "..."}
                                                      </span>
                                                    </Tooltip>
                                                  ) : (
                                                    name
                                                  )
                                                )
                                                .reduce((prev, curr) => [
                                                  prev,
                                                  ", ",
                                                  curr,
                                                ])}
                                            </b>
                                          </p>
                                        </td>
                                      )} */}

                                                    <td>
                                                      {item.status !==
                                                        statusNames.Draft && (
                                                        <p className="mb-0">
                                                          Recurring:{" "}
                                                          <b>
                                                            {formatValue(
                                                              item.recurringTotal,
                                                            )}
                                                          </b>
                                                        </p>
                                                      )}
                                                      {item.status !==
                                                        statusNames.Draft && (
                                                        <p className="mb-0">
                                                          {" "}
                                                          OneOff :{" "}
                                                          <b>
                                                            {formatValue(
                                                              item.oneOffTotal,
                                                            )}
                                                          </b>
                                                        </p>
                                                      )}
                                                    </td>

                                                    <td className="table-content-font">
                                                      {/* <a
                                        // href="https://teststaging.outbooks.com/api/quote/preview-pdf/b8c4365d-d32a-40ef-9835-f90800aa476b"
                                        href={item.quotePDFUrl}
                                        target="_blank"
                                      > */}{" "}
                                                      {item.status !==
                                                        statusNames.Draft &&
                                                        item.pdfUrl &&
                                                        item.status !==
                                                          statusNames.Signed && (
                                                          <p
                                                            onClick={() => {
                                                              handleViewOldProposalPdf(
                                                                item.pdfUrl,
                                                              );
                                                              setTitle(
                                                                "View proposals",
                                                              );
                                                            }}
                                                            style={{
                                                              cursor: "pointer",
                                                              color: "blue",
                                                            }}
                                                          >
                                                            {proposalName} PDF
                                                          </p>
                                                        )}
                                                      {item.status !==
                                                        statusNames.Draft &&
                                                        item.pdfUrl &&
                                                        item.status ===
                                                          statusNames.Signed && (
                                                          <p
                                                            onClick={() => {
                                                              handleViewOldProposalPdf(
                                                                item.pdfUrl,
                                                              );
                                                              setTitle(
                                                                "View proposals",
                                                              );
                                                            }}
                                                            style={{
                                                              cursor: "pointer",
                                                            }}
                                                          >
                                                            {proposalName} PDF
                                                          </p>
                                                        )}
                                                      {/* </a> */}
                                                    </td>
                                                  </tr>
                                                );
                                              })}
                                          </tbody>
                                        </table>
                                      )}
                                    </div>
                                    <div
                                      className={`tab-pane ${
                                        activeTab === "Proposal" ? "active" : ""
                                      }`}
                                      id="base-justified-home"
                                    >
                                      {activeTab === "Proposal" && (
                                        <table
                                          class="table align-middle table-nowrap"
                                          id="customerTable"
                                        >
                                          <thead class="table-light table-header-font">
                                            <tr className="head-row">
                                              <td className="tr-table-class text-white">
                                                Ref ID
                                              </td>
                                              <td className="tr-table-class text-white">
                                                {prospectName} Name
                                              </td>
                                              <td className="tr-table-class text-white">
                                                Status
                                              </td>
                                              <td className="tr-table-class text-white">
                                                Value
                                              </td>
                                              <td className="tr-table-class text-white">
                                                Documents
                                              </td>
                                              <td className="tr-table-class text-white">
                                                Last Updated
                                              </td>
                                              <td className="tr-table-class text-white">
                                                Send Reminder
                                              </td>
                                              <td className="tr-table-class text-white">
                                                {userAccessData.Admin_Proposal_CanView && (
                                                  <>Action</>
                                                )}
                                              </td>
                                            </tr>
                                          </thead>
                                          <tbody class="list form-check-all">
                                            {ProposalList?.slice(
                                              0,
                                              isMobile
                                                ? isMobileRecords
                                                : desktopRecords,
                                            )?.map((item, index) => {
                                              return (
                                                <tr class="table_new">
                                                  <td className="table-content-font">
                                                    {item.prefix}
                                                  </td>
                                                  <td className="table-content-font">
                                                    {item.clientName}
                                                  </td>

                                                  {item.statusID ===
                                                    statusID.Draft && (
                                                    <>
                                                      <td className="table-content-font ">
                                                        <p
                                                          className="  p-1 text-center text-white rounded"
                                                          style={{
                                                            background:
                                                              "#DAA520",
                                                          }}
                                                        >
                                                          {item.statusName}
                                                        </p>
                                                      </td>
                                                    </>
                                                  )}
                                                  {item.statusID ===
                                                    statusID.Sent && (
                                                    <>
                                                      <td className="table-content-font">
                                                        <p
                                                          className=" p-1 text-center text-white rounded"
                                                          style={{
                                                            background:
                                                              " #626ED4",
                                                          }}
                                                        >
                                                          {item.statusName}
                                                        </p>
                                                      </td>
                                                    </>
                                                  )}
                                                  {item.statusID ===
                                                    statusID.Accepted && (
                                                    <>
                                                      <td className="table-content-font">
                                                        <p
                                                          className=" p-1 text-center text-white rounded"
                                                          style={{
                                                            background:
                                                              "#008000",
                                                          }}
                                                        >
                                                          {item.statusName}
                                                        </p>
                                                      </td>
                                                    </>
                                                  )}
                                                  {item.statusID ===
                                                    statusID.Awaiting_Signature && (
                                                    <>
                                                      <td className="table-content-font">
                                                        <p
                                                          className=" p-1 text-center text-white rounded"
                                                          style={{
                                                            background:
                                                              "#626ED4",
                                                          }}
                                                        >
                                                          {/* Awaiting Response */}
                                                          {item.statusName}
                                                        </p>
                                                      </td>
                                                    </>
                                                  )}
                                                  {item.statusID ===
                                                    statusID.Declined && (
                                                    <>
                                                      <td className="table-content-font">
                                                        <p
                                                          className=" p-1 text-center text-white rounded"
                                                          style={{
                                                            background:
                                                              "#FF0000",
                                                          }}
                                                        >
                                                          {item.statusName}
                                                        </p>
                                                      </td>
                                                    </>
                                                  )}
                                                  {item.statusID ===
                                                    statusID.Signed && (
                                                    <>
                                                      <td className="table-content-font">
                                                        <p
                                                          className=" p-1 text-center text-white rounded"
                                                          style={{
                                                            background:
                                                              "#008000",
                                                          }}
                                                        >
                                                          {item.statusName}
                                                        </p>
                                                      </td>
                                                    </>
                                                  )}
                                                  {item.statusID ===
                                                    statusID.Skipped && (
                                                    <>
                                                      <td className="table-content-font">
                                                        <p
                                                          className=" p-1 text-center text-white rounded"
                                                          style={{
                                                            background:
                                                              "#38A4F8",
                                                          }}
                                                        >
                                                          {item.statusName}
                                                        </p>
                                                      </td>
                                                    </>
                                                  )}
                                                  {item.packagesNames !==
                                                    null && (
                                                    <td class="table-content-font">
                                                      <p className="mb-0">
                                                        <b>
                                                          {item.packagesNames
                                                            .split(",")
                                                            .map(
                                                              (
                                                                name,
                                                                index,
                                                                array,
                                                              ) => {
                                                                // Remove extra spaces and trim the name
                                                                name =
                                                                  name.trim();

                                                                // Check if there's only one package
                                                                const isSinglePackage =
                                                                  array.length ===
                                                                  1;
                                                                const isDoublePackage =
                                                                  array.length ===
                                                                  2;
                                                                // Define the length limit based on the number of packages
                                                                const maxLength =
                                                                  isSinglePackage
                                                                    ? 45
                                                                    : isDoublePackage
                                                                      ? 25
                                                                      : 15;

                                                                return name.length >
                                                                  maxLength ? (
                                                                  <Tooltip
                                                                    key={index}
                                                                    title={name}
                                                                  >
                                                                    <span>
                                                                      {name.substring(
                                                                        0,
                                                                        maxLength,
                                                                      ) + "..."}
                                                                    </span>
                                                                  </Tooltip>
                                                                ) : (
                                                                  name
                                                                );
                                                              },
                                                            )
                                                            .reduce(
                                                              (prev, curr) => [
                                                                prev,
                                                                ", ",
                                                                curr,
                                                              ],
                                                            )}
                                                        </b>
                                                      </p>
                                                    </td>
                                                  )}

                                                  {item.packagesNames ===
                                                    null && (
                                                    <td class="table-content-font">
                                                      {item.statusID !==
                                                        statusID.Draft && (
                                                        <p className="mb-0">
                                                          Recurring:{" "}
                                                          <b>
                                                            {formatValue(
                                                              item.recurringPrice,
                                                            )}
                                                          </b>
                                                        </p>
                                                      )}
                                                      {item.statusID !==
                                                        statusID.Draft && (
                                                        <p className="mb-0">
                                                          {" "}
                                                          OneOff :{" "}
                                                          <b>
                                                            {formatValue(
                                                              item.oneOffPrice,
                                                            )}
                                                          </b>
                                                        </p>
                                                      )}
                                                    </td>
                                                  )}

                                                  {/* Document download */}
                                                  <td className="table-content-font">
                                                    {/* <a
                                      // href="https://teststaging.outbooks.com/api/quote/preview-pdf/b8c4365d-d32a-40ef-9835-f90800aa476b"
                                      href={item.quotePDFUrl}
                                      target="_blank"
                                    > */}{" "}
                                                    {item.statusID !==
                                                      statusID.Draft &&
                                                      item.quotePDFUrl &&
                                                      item.statusID !==
                                                        statusID.Signed && (
                                                        <p
                                                          onClick={() => {
                                                            handleViewPdf(item);
                                                            setTitle(
                                                              "View proposals",
                                                            );
                                                          }}
                                                          style={{
                                                            cursor: "pointer",
                                                            color: "blue",
                                                          }}
                                                        >
                                                          {proposalName} PDF
                                                        </p>
                                                      )}
                                                    {item.statusID !==
                                                      statusID.Draft &&
                                                      item.quotePDFUrl &&
                                                      item.statusID ===
                                                        statusID.Signed && (
                                                        <p
                                                          onClick={() => {
                                                            handleDownload(
                                                              item,
                                                              "zip",
                                                            );
                                                            // downloadPdfFromAws(item.quotePDFUrl);
                                                          }}
                                                          style={{
                                                            cursor: "pointer",
                                                          }}
                                                        >
                                                          {proposalName} PDF
                                                        </p>
                                                      )}
                                                    {/* </a> */}
                                                  </td>
                                                  {/* Status updated on */}

                                                  <td className="table-content-font">
                                                    {item.statusID ===
                                                    statusID.Accepted ? (
                                                      <span>
                                                        Accepted on:{" "}
                                                        {GetOnlyDate(
                                                          item.acceptDeclineDate,
                                                        )}
                                                      </span>
                                                    ) : item.statusID ===
                                                      statusID.Sent ? (
                                                      <span>
                                                        Sent on:{" "}
                                                        {GetOnlyDate(
                                                          item.sentOn,
                                                        )}
                                                      </span>
                                                    ) : item.statusID ===
                                                      statusID.Draft ? (
                                                      <span>
                                                        Drafted on:{" "}
                                                        {GetOnlyDate(
                                                          item.createdOn,
                                                        )}
                                                      </span>
                                                    ) : item.statusID ===
                                                      statusID.Skipped ? (
                                                      <span>
                                                        Skipped on:{" "}
                                                        {GetOnlyDate(
                                                          item.sentOn,
                                                        )}
                                                      </span>
                                                    ) : null}
                                                  </td>

                                                  <td className="table-content-font">
                                                    {item.statusID !==
                                                      statusID.Draft && (
                                                      <div
                                                        style={{
                                                          alignItems: "none",
                                                        }}
                                                        class="d-flex gap-2"
                                                      >
                                                        <Tooltip
                                                          title={
                                                            item.enableReminder
                                                              ? item.reminderName
                                                                ? getCrudButtonToolTipName(
                                                                    item.reminderName,
                                                                  )
                                                                : "No reminder found"
                                                              : ""
                                                          }
                                                        >
                                                          <div
                                                            style={{
                                                              width: "40px",
                                                            }}
                                                          >
                                                            {item.enableReminder
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
                                                                          item.enableReminder
                                                                            ? "Enable"
                                                                            : "Disable",
                                                                        quoteKeyID:
                                                                          item?.quoteKeyID,
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
                                                                    item.enableReminder
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
                                                  {/*buttons */}
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
                                                              item.statusID ===
                                                              statusID.Draft
                                                                ? "2px 0px 2px 0px"
                                                                : "6px 8px"
                                                            }`,
                                                            inset:
                                                              "auto 0px 0px auto",
                                                          }}
                                                          class="dropdown-menu"
                                                          aria-labelledby="dropdownMenuButton"
                                                        >
                                                          {/* Draft button */}
                                                          {item.statusID ===
                                                            statusID.Draft &&
                                                            userAccessData.Admin_Proposal_CanEdit && (
                                                              <>
                                                                <li>
                                                                  {/* <Tooltip title={`Edit ${proposalName}`} placement="right"> */}
                                                                  <a
                                                                    className="dropdown-item"
                                                                    onClick={() => {
                                                                      handleEditProposal(
                                                                        item,
                                                                      );
                                                                      setTitle(
                                                                        "Edit proposals",
                                                                      );
                                                                    }}
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
                                                                      proposalName
                                                                    }
                                                                  </a>
                                                                  {/* </Tooltip> */}
                                                                </li>
                                                              </>
                                                            )}

                                                          {/* View button */}
                                                          {(item.statusID ===
                                                            statusID.Accepted ||
                                                            item.statusID ===
                                                              statusID.Declined ||
                                                            item.statusID ===
                                                              statusID.Sent ||
                                                            item.statusID ===
                                                              statusID.Skipped) &&
                                                            userAccessData.Admin_Proposal_CanView && (
                                                              <li>
                                                                <a
                                                                  class="dropdown-item"
                                                                  onClick={() =>
                                                                    handleView(
                                                                      item,
                                                                    )
                                                                  }
                                                                >
                                                                  <i class="bi bi-eye"></i>{" "}
                                                                  View{" "}
                                                                  {proposalName}
                                                                </a>
                                                              </li>
                                                            )}

                                                          {/* Generate Contract button */}
                                                          {(item.statusID ===
                                                            statusID.Sent ||
                                                            item.statusID ===
                                                              statusID.Skipped) &&
                                                            common.enableEL ==
                                                              1 &&
                                                            userAccessData.Admin_Engagement_Latter_CanAdd &&
                                                            userAccessData.Admin_Engagement_Latter_CanView && (
                                                              <li>
                                                                <a
                                                                  class="dropdown-item"
                                                                  onClick={() => {
                                                                    HandleSkippedToEL(
                                                                      item,
                                                                      false,
                                                                    );
                                                                    setTitle(
                                                                      "Skipped To Engagement_letter",
                                                                    );
                                                                  }}
                                                                >
                                                                  <i class="bi bi-gear-fill"></i>{" "}
                                                                  Generate{" "}
                                                                  {
                                                                    EngagementName
                                                                  }
                                                                </a>
                                                              </li>
                                                            )}

                                                          {/* Copy button */}
                                                          {item.statusID !==
                                                            statusID.Draft && (
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
                                                                      quoteKeyID:
                                                                        item.quoteKeyID,
                                                                      RefId:
                                                                        item.prefix,
                                                                    },
                                                                  );
                                                                }}
                                                              >
                                                                <i class="fa-solid fa-copy"></i>{" "}
                                                                Copy{" "}
                                                                {proposalName}
                                                              </a>
                                                            </li>
                                                          )}

                                                          {/* Resend Proposal */}
                                                          {item.statusID ===
                                                            statusID.Sent &&
                                                            userAccessData.Admin_Proposal_CanEdit && (
                                                              <li>
                                                                <a
                                                                  class="dropdown-item"
                                                                  data-bs-toggle="modal"
                                                                  data-bs-target="#ConfirmModel"
                                                                  onClick={() => {
                                                                    setModelRequestData(
                                                                      {
                                                                        ...modelRequestData,
                                                                        quoteKeyID:
                                                                          item.quoteKeyID,
                                                                        message: `Are you sure you want to re-send ${proposalName}`,
                                                                        RefId:
                                                                          item.prefix,
                                                                        Action:
                                                                          "Resend",
                                                                      },
                                                                    );
                                                                  }}
                                                                >
                                                                  <i class="fas fa-redo"></i>{" "}
                                                                  Re-send{" "}
                                                                  {proposalName}
                                                                </a>
                                                              </li>
                                                            )}
                                                            {/*Archive*/}
                                                          {!item.isArchived && (
                                                            <li>
                                                              {/* <Tooltip title={`Delete ${proposalName}`} placement="right"> */}
                                                              <a
                                                                class="dropdown-item"
                                                                data-bs-toggle="modal"
                                                                data-bs-target="#ConfirmModel"
                                                                onClick={() => {
                                                                  setModelRequestData(
                                                                    {
                                                                      ...modelRequestData,
                                                                      Action: item.contracts?.length === 0
                                                                      ? "Archive" : "ArchiveLinkedELs",
                                                                      RefId:
                                                                        item.prefix,
                                                                      quoteKeyID:
                                                                        item.quoteKeyID,
                                                                      userKeyID:
                                                                        common.userKeyID,
                                                                      contracts:
                                                                        item.contracts,
                                                                      message: item?.contracts?.length === 0
                                                                       ? "Are you sure you want to archive this quote?"
                                                                        : `Archiving this record would archive all the linked ${EngagementName} too:`,
                                                                    },
                                                                  );
                                                                }}
                                                              >
                                                                <i
                                                                  className="ri-archive-fill"
                                                                  style={{
                                                                    marginRight:
                                                                      "2px",
                                                                  }}
                                                                ></i>{" "}
                                                                Archive{" "}
                                                                {proposalName}
                                                              </a>
                                                              {/* </Tooltip> */}
                                                            </li>
                                                          )}
                                                          {item?.isArchived && (
                                                            <li>
                                                              <a
                                                                class="dropdown-item"
                                                                data-bs-toggle="modal"
                                                                data-bs-target="#ConfirmModel"
                                                                onClick={() => {
                                                                  setModelRequestData(
                                                                    {
                                                                      ...modelRequestData,
                                                                      Action: "Unarchive",
                                                                      RefId:
                                                                        item.prefix,
                                                                      quoteKeyID:
                                                                        item.quoteKeyID,
                                                                      userKeyID:
                                                                        common.userKeyID,
                                                                      contracts:
                                                                        item.contracts,
                                                                      message: "Are you sure you want to Unarchive this quote?",
                                                                    },
                                                                  );
                                                                }}
                                                              >
                                                                <i
                                                                  className="ri-archive-fill"
                                                                  style={{
                                                                    marginRight:
                                                                      "2px",
                                                                  }}
                                                                ></i>
                                                                Unarchive{" "}
                                                                {proposalName}
                                                              </a>
                                                            </li>
                                                          )}

                                                          {(
                                                              item.statusID === statusID.Draft ||
                                                              (item.statusID === statusID.Sent && (
                                                                item.contracts?.length === 0 ||
                                                                !item.contracts?.some(c => c.StatusID === statusID.Signed || c.StatusID === statusID.Declined)
                                                              ))
                                                              ) && (
                                                              <li>
                                                                {/* <Tooltip title={`Delete ${proposalName}`} placement="right"> */}
                                                                <a
                                                                  class="dropdown-item"
                                                                  data-bs-toggle="modal"
                                                                  data-bs-target="#ConfirmModel"
                                                                  onClick={() => {
                                                                    setModelRequestData(
                                                                      {
                                                                        ...modelRequestData,
                                                                        Action:
                                                                          "Delete",
                                                                        RefId:
                                                                          item.prefix,
                                                                        quoteKeyID:
                                                                          item.quoteKeyID,
                                                                        userKeyID:
                                                                          common.userKeyID,
                                                                        message:
                                                                          "Are you sure you want to delete this quote?",
                                                                      },
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
                                                                  {proposalName}
                                                                </a>
                                                                {/* </Tooltip> */}
                                                              </li>
                                                            )}
                                                        </ul>
                                                      </div>
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
                                      className={`tab-pane ${
                                        activeTab === "Web Proposal"
                                          ? "active"
                                          : ""
                                      }`}
                                      id="base-justified-home"
                                    >
                                      {activeTab === "Web Proposal" && (
                                        <table
                                          class="table align-middle table-nowrap"
                                          id="customerTable"
                                        >
                                          <thead class="table-light table-header-font">
                                            <tr className="head-row">
                                              <td className="tr-table-class text-white">
                                                <input
                                                  type="checkbox"
                                                  className="me-2"
                                                  checked={
                                                    selectedRows.length ===
                                                    visibleRows.length
                                                  }
                                                  onChange={handleSelectAll}
                                                />{" "}
                                                Ref ID
                                              </td>
                                              <td className="tr-table-class text-white">
                                                {prospectName} Name
                                              </td>
                                              <td className="tr-table-class text-white">
                                                Status
                                              </td>
                                              <td className="tr-table-class text-white">
                                                Value
                                              </td>
                                              <td className="tr-table-class text-white">
                                                Documents
                                              </td>

                                              <td className="tr-table-class text-white">
                                                {userAccessData.Admin_Proposal_CanView && (
                                                  <>Action</>
                                                )}
                                              </td>
                                            </tr>
                                          </thead>
                                          <tbody class="list form-check-all">
                                            {SingleProposalList.slice(
                                              0,
                                              isMobile
                                                ? isMobileRecords
                                                : desktopRecords,
                                            ).map((item, index) => {
                                              return (
                                                <tr class="table_new">
                                                  <td className="table-content-font">
                                                    <input
                                                      type="checkbox"
                                                      className="me-2"
                                                      checked={selectedRows.includes(
                                                        item.quoteKeyID,
                                                      )}
                                                      onChange={() =>
                                                        handleRowSelect(
                                                          item.quoteKeyID,
                                                        )
                                                      }
                                                    />{" "}
                                                    {item.prefix}
                                                  </td>
                                                  <td className="table-content-font">
                                                    {item.clientName}
                                                  </td>

                                                  {item.statusID ===
                                                    statusID.Draft && (
                                                    <>
                                                      <td className="table-content-font ">
                                                        <p
                                                          className="  p-1 text-center text-white rounded"
                                                          style={{
                                                            background:
                                                              "#DAA520",
                                                          }}
                                                        >
                                                          {item.statusName}
                                                        </p>
                                                      </td>
                                                    </>
                                                  )}
                                                  {item.statusID ===
                                                    statusID.Sent && (
                                                    <>
                                                      <td className="table-content-font">
                                                        <p
                                                          className=" p-1 text-center text-white rounded"
                                                          style={{
                                                            background:
                                                              " #626ED4",
                                                          }}
                                                        >
                                                          {item.statusName}
                                                        </p>
                                                      </td>
                                                    </>
                                                  )}
                                                  {item.statusID ===
                                                    statusID.Accepted && (
                                                    <>
                                                      <td className="table-content-font">
                                                        <p
                                                          className=" p-1 text-center text-white rounded"
                                                          style={{
                                                            background:
                                                              "#008000",
                                                          }}
                                                        >
                                                          {item.statusName}
                                                        </p>
                                                      </td>
                                                    </>
                                                  )}
                                                  {item.statusID ===
                                                    statusID.Awaiting_Signature && (
                                                    <>
                                                      <td className="table-content-font">
                                                        <p
                                                          className=" p-1 text-center text-white rounded"
                                                          style={{
                                                            background:
                                                              "#626ED4",
                                                          }}
                                                        >
                                                          {/* Awaiting Response */}
                                                          {item.statusName}
                                                        </p>
                                                      </td>
                                                    </>
                                                  )}
                                                  {item.statusID ===
                                                    statusID.Declined && (
                                                    <>
                                                      <td className="table-content-font">
                                                        <p
                                                          className=" p-1 text-center text-white rounded"
                                                          style={{
                                                            background:
                                                              "#FF0000",
                                                          }}
                                                        >
                                                          {item.statusName}
                                                        </p>
                                                      </td>
                                                    </>
                                                  )}
                                                  {item.statusID ===
                                                    statusID.Signed && (
                                                    <>
                                                      <td className="table-content-font">
                                                        <p
                                                          className=" p-1 text-center text-white rounded"
                                                          style={{
                                                            background:
                                                              "#008000",
                                                          }}
                                                        >
                                                          {item.statusName}
                                                        </p>
                                                      </td>
                                                    </>
                                                  )}
                                                  {item.statusID ===
                                                    statusID.Skipped && (
                                                    <>
                                                      <td className="table-content-font">
                                                        <p
                                                          className=" p-1 text-center text-white rounded"
                                                          style={{
                                                            background:
                                                              "#38A4F8",
                                                          }}
                                                        >
                                                          {item.statusName}
                                                        </p>
                                                      </td>
                                                    </>
                                                  )}
                                                  {item.packagesNames !==
                                                    null && (
                                                    <td class="table-content-font">
                                                      <p className="mb-0">
                                                        <b>
                                                          {item.packagesNames
                                                            .split(",")
                                                            .map(
                                                              (
                                                                name,
                                                                index,
                                                                array,
                                                              ) => {
                                                                // Remove extra spaces and trim the name
                                                                name =
                                                                  name.trim();

                                                                // Check if there's only one package
                                                                const isSinglePackage =
                                                                  array.length ===
                                                                  1;
                                                                const isDoublePackage =
                                                                  array.length ===
                                                                  2;
                                                                // Define the length limit based on the number of packages
                                                                const maxLength =
                                                                  isSinglePackage
                                                                    ? 45
                                                                    : isDoublePackage
                                                                      ? 25
                                                                      : 15;

                                                                return name.length >
                                                                  maxLength ? (
                                                                  <Tooltip
                                                                    key={index}
                                                                    title={name}
                                                                  >
                                                                    <span>
                                                                      {name.substring(
                                                                        0,
                                                                        maxLength,
                                                                      ) + "..."}
                                                                    </span>
                                                                  </Tooltip>
                                                                ) : (
                                                                  name
                                                                );
                                                              },
                                                            )
                                                            .reduce(
                                                              (prev, curr) => [
                                                                prev,
                                                                ", ",
                                                                curr,
                                                              ],
                                                            )}
                                                        </b>
                                                      </p>
                                                    </td>
                                                  )}

                                                  {item.packagesNames ===
                                                    null && (
                                                    <td class="table-content-font">
                                                      {item.statusID !==
                                                        statusID.Draft && (
                                                        <p className="mb-0">
                                                          Recurring:{" "}
                                                          <b>
                                                            {formatValue(
                                                              item.recurringPrice,
                                                            )}
                                                          </b>
                                                        </p>
                                                      )}
                                                      {item.statusID !==
                                                        statusID.Draft && (
                                                        <p className="mb-0">
                                                          {" "}
                                                          OneOff :{" "}
                                                          <b>
                                                            {formatValue(
                                                              item.oneOffPrice,
                                                            )}
                                                          </b>
                                                        </p>
                                                      )}
                                                    </td>
                                                  )}

                                                  <td className="table-content-font">
                                                    {/* <a
                                      // href="https://teststaging.outbooks.com/api/quote/preview-pdf/b8c4365d-d32a-40ef-9835-f90800aa476b"
                                      href={item.quotePDFUrl}
                                      target="_blank"
                                    > */}{" "}
                                                    {item.statusID !==
                                                      statusID.Draft &&
                                                      item.quotePDFUrl &&
                                                      item.statusID !==
                                                        statusID.Signed && (
                                                        <p
                                                          onClick={() => {
                                                            handleViewPdf(item);
                                                            setTitle(
                                                              "View proposals",
                                                            );
                                                          }}
                                                          style={{
                                                            cursor: "pointer",
                                                            color: "blue",
                                                          }}
                                                        >
                                                          {proposalName} PDF
                                                        </p>
                                                      )}
                                                    {item.statusID !==
                                                      statusID.Draft &&
                                                      item.quotePDFUrl &&
                                                      item.statusID ===
                                                        statusID.Signed && (
                                                        <p
                                                          onClick={() => {
                                                            handleDownload(
                                                              item,
                                                              "zip",
                                                            );
                                                            // downloadPdfFromAws(item.quotePDFUrl);
                                                          }}
                                                          style={{
                                                            cursor: "pointer",
                                                          }}
                                                        >
                                                          {proposalName} PDF
                                                        </p>
                                                      )}
                                                    {/* </a> */}
                                                  </td>
                                                  {/*Delete buttons */}

                                                  <td>
                                                    <div class="d-flex gap-2">
                                                      <Tooltip
                                                        title={getCrudButtonToolTipName(
                                                          "Delete",
                                                          { proposalName },
                                                        )}
                                                      >
                                                        <div class="remove">
                                                          <button
                                                            class="btn btn-sm btn-danger remove-item-btn actionButtonsStyle"
                                                            data-bs-toggle="modal"
                                                            data-bs-target="#ConfirmModel"
                                                            onClick={() =>
                                                              setModelRequestData(
                                                                {
                                                                  ...modelRequestData,
                                                                  quoteKeyID:
                                                                    item.quoteKeyID,
                                                                  clientName:
                                                                    item.clientName,
                                                                  userKeyID:
                                                                    common.userKeyID,
                                                                  Action:
                                                                    "Delete",
                                                                },
                                                              )
                                                            }
                                                          >
                                                            <i class="ri-delete-bin-5-fill"></i>
                                                          </button>
                                                        </div>
                                                      </Tooltip>
                                                    </div>
                                                  </td>
                                                </tr>
                                              );
                                            })}
                                          </tbody>
                                        </table>
                                      )}
                                    </div>
                                    {activeTab === "Proposal" && (
                                      <div>
                                        {totalRecords <= 0 && (
                                          <NoResultFoundModel
                                            name={proposalName}
                                            totalRecords={totalRecords}
                                          />
                                        )}
                                      </div>
                                    )}
                                    {activeTab === "old Proposal" && (
                                      <div>
                                        {OldtotalRecords <= 0 && (
                                          <NoResultFoundModel
                                            name={proposalName}
                                            totalRecords={OldtotalRecords}
                                          />
                                        )}
                                      </div>
                                    )}
                                    {activeTab === "Web Proposal" && (
                                      <div>
                                        {SingletotalRecords <= 0 && (
                                          <NoResultFoundModel
                                            name={proposalName}
                                            totalRecords={SingletotalRecords}
                                          />
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                              {activeTab === "Proposal" && (
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
                              {activeTab === "Old Proposal" && (
                                <div>
                                  {oldProposalListCount > Number(pageSize) && (
                                    <PaginationComponent
                                      totalCount={oldProposalListCount}
                                      totalPages={totalOldProposalPage}
                                      currentPage={OldProposalCurrentPage}
                                      onPageChange={handlePageChangeOldProposal}
                                    />
                                  )}
                                </div>
                              )}
                              {activeTab === "Web Proposal" && (
                                <div>
                                  {SingleProposalListCount >
                                    Number(pageSize) && (
                                    <PaginationComponent
                                      totalCount={SingleProposalListCount}
                                      totalPages={
                                        isMobile
                                          ? Math.ceil(
                                              SingleProposalListCount /
                                                isMobileRecords,
                                            )
                                          : Math.ceil(
                                              SingleProposalListCount /
                                                (desktopRecords > 5 &&
                                                window.innerHeight == 652
                                                  ? 5
                                                  : desktopRecords),
                                            )
                                      }
                                      currentPage={SingleProposalCurrentPage}
                                      onPageChange={
                                        handlePageChangeSingleProposal
                                      }
                                    />
                                  )}
                                </div>
                              )}
                              {/* */}

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
                  </div>
                  <ViewPlan
                    moduleName={"Contract"}
                    showModal={showModal}
                    handleCloseModel={handleCloseModel}
                    setShowModal={setShowModal}
                    activeOrganizationKeyId={common.organisationKeyID}
                  />
                  <ErrorModel
                    ErrorModel={openErrorModal}
                    handleClose={handleCloseErrorModel}
                    ErrorMessage={errorMessage}
                  />
                  <ConfirmModel
                    openSuccessModal={openSuccessModal}
                    modelRequestData={modelRequestData}
                    setModelRequestData={setModelRequestData}
                    UpdatedStatus={
                      modelRequestData.Action === "ReminderStatus"
                        ? ChangeQuoteStatusData
                        : modelRequestData.Action === "Resend"
                          ? handleResend
                          : modelRequestData.Action === "Copy"
                            ? CopyQuotationData
                            : modelRequestData.Action === "ServiceWarning"
                              ? () => CopyQuotationData(null, true)
                              : modelRequestData.Action === "ServiceWarningEL" // <-- add this
                                ? () =>
                                    HandleSkippedToEL(
                                      {
                                        quoteKeyID: modelRequestData.quoteKeyID,
                                      },
                                      true,
                                    )
                                  : modelRequestData.Action === "Archive" || modelRequestData.Action === "Unarchive"
                                  || modelRequestData.Action === "ArchiveLinkedELs" ? ArchiveQuotationData
                                : DeleteQuotationData
                    }
                  />
                  <SuccessModal
                    handleClose={handleClose}
                    setOpenSuccessModal={setOpenSuccessModal}
                    openSuccessModal={openSuccessModal}
                    modelAction={modelRequestData.Action}
                    message={
                      modelRequestData.Action === "Delete"
                        ? selectedRows.length !== 0
                          ? proposalName
                          : `${modelRequestData.RefId}`
                        : modelRequestData.Action === "Copy"
                          ? `The Copy of ${modelRequestData.RefId} has been created successfully! `
                          : modelRequestData.Action === "ReminderStatus"
                            ? "Status has been changed successfully!"
                            : modelRequestData.Action === "Resend"
                              ? proposalName
                              : modelRequestData.Action === "Archive"
                              || modelRequestData.Action === "Unarchive"
                                ? proposalName
                                : modelRequestData.Action === "ArchiveLinkedELs"
                                  ? `${proposalName} and all the linked ${EngagementName} have been archived successfully`
                              : ""
                    }
                    refIdStore={modelRequestData.RefId}
                  />
                  <FilterModel
                    class="modal fade"
                    id="FilterModel"
                    tabIndex="-1"
                    aria_labelledby="exampleModalLabel"
                    aria_hidden="true"
                    data-bs-backdrop="static"
                    data-bs-keyboard="false"
                    selectedOption={selectedOption}
                    ClearFilter={ClearFilter}
                    setFromDate={setFromDate}
                    setToDate={setToDate}
                    setStatus={setStatus}
                    setSelectedOption={setSelectedOption}
                    showDatePicker={showDatePicker}
                    setShowDatePicker={setShowDatePicker}
                    fromDate={fromDate}
                    toDate={toDate}
                    status={status}
                    ModuleName={proposalName}
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
                    onYesClick={handleResendQuote}
                    emailCheckModel={emailCheckModel}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Proposals;
