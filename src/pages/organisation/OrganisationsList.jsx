/* global $ */
import React, { useContext, useEffect, useState } from "react";
import "./Organisation.css";
import "./Organisation-redesign.css";
import PaginationComponent from "../../components/PaginationModel";
import Footer from "../../components/Footer";
import { useNavigate } from "react-router-dom";
import Android12Switch from "../../components/AndroidSwitch";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Tooltip, { tooltipClasses } from "@mui/material/Tooltip";
import { AuthContextProvider } from "../../AuthContext/AuthContext";
import NoResultFoundModel from "../../components/NoResultFoundModel";
import RecordsAvailablePopupModel from "../../components/RecordsAvailablePopupModel";
import { useLocation } from "react-router-dom";
import { GetProfessionTypeLookupList } from "../../redux/Services/Master/ProfessionTypeApi";
import { GetBusinessTypeLookupList } from "../../redux/Services/Master/BusinessTypeLookupListApi";
import Select from "react-select";
import Utils from "../../Middleware/Utils";
import { ActiveDateFilterEnum } from "../../Middleware/enums";
import {
  DeleteOrganisation,
  GetOrganisationList,
  OrganisationChangeStatus,
} from "../../redux/Services/Setting/Organisation";
import { useSelector } from "react-redux";
import ConfirmModel from "../../components/ConfirmationBox";
import ErrorModel from "../../components/ErrorModel";
import SuccessModal from "../../components/SuccessModal";
import { ChoosePlanApi } from "../../redux/Services/Setting/PaymentGatewayApi";
const Organisation = () => {
  let getOrganisationListCallCount = 0;
  const moduleName = "Organisation/Practice";
  const [searchKeywordUsers, setSearchKeywordUsers] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const location = useLocation();
  const [openErrorModal, setOpenErrorModal] = React.useState(false);
  const [openSuccessModal, setOpenSuccessModal] = React.useState(false);
  const [title, setTitle] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [primarySortDirectionUsers, setPrimarySortDirectionUsers] =
    useState(null); //setPrimarySortDirectionUsers
  const [selectedOrganizationKeyId, setSelectedOrganizationKeyId] =
    useState(null);
  const [primaryUserSortDirectionObj, setPrimaryUserSortDirectionObj] =
    useState({
      UserNameTypeSort: null,
      RoleTypeSort: null,
      AcceptanceStatusTypeSort: null,
      EmailTypeSort: null,
    });
  const [searchKeyword, setSearchKeyword] = useState("");
  const [organisationList, setOrganisationList] = useState([]);

  const [chooseApiData, setChooseApiData] = useState([]);
  const navigate = useNavigate();
  const common = useSelector((state) => state.Storage);
  const [modelRequestData, setModelRequestData] = useState({
    OrgKeyID: null,
    status: null,
    Action: "",
    OrgName: null,
    userKeyID: null,
  });
  const {
    prospectName,
    setLoader,
    setTopbar,
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
    GetActiveDateRange,
  } = useContext(AuthContextProvider);
  const pageSize = isMobile ? isMobileRecords : desktopRecords;
  const formattedErrorMessage = handleErrorMessage(errorMessage);
  const [totalRecords, setTotalRecords] = useState(-1);
  const [userCount, setUserCount] = useState(null);
  const [prospectType, setProspectType] = useState(null);
  const [businessTypeID, setBusinessTypeID] = useState(null);
  const [professionTypeID, setProfessionTypeID] = useState(null);
  const [isFilterApply, setIsFilterApply] = useState(false);
  const [UserSortType, setUserSortType] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedOption, setSelectedOption] = useState("");
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formDateOfCalenderForExport, setFormDateOfCalenderForExport] =
    useState(null);
  const [toDateCalenderForExport, setToDateCalenderForExport] = useState(null);
  const [
    OrganisationBusinessTypeLookupList,
    setOrganisationBusinessTypeLookupList,
  ] = useState([]);
  const [ProfessionTypeLookupList, setProfessionTypeLookupList] = useState([]);

  //initial effect
  useEffect(() => {
    setTopbar("block");
    GetOrganisationListData(1);
    GetProfessionTypeLookupList();
    GetOrganisationBusinessTypeLookupListData();
    GetProfessionTypeLookupListData();
  }, []);

  useEffect(() => {
    if (modelRequestData.Action == "View") {
      navigate("/view-organisations-details", { state: modelRequestData });
    }
  }, [modelRequestData]);
  useEffect(() => {
    // Check if the location state is "Templates PDF"
    if (location.state === "ChoosePlane") {
      GetOrganisationListData(1, null, null);
    }
  }, [location.state]);

  const orgBusinessTypeFilter = OrganisationBusinessTypeLookupList?.filter(
    (businessType) => businessType.value == businessTypeID,
  );

  const professionTypeFilter = ProfessionTypeLookupList?.filter(
    (professionType) =>
      professionType.value == professionTypeID ? professionTypeID : null,
  );

  const handleSelectChange = (selectedOption) => {
    setBusinessTypeID(selectedOption ? selectedOption.value : null);
  };

  const handleSelectProfessionChange = (selectedOption) => {
    setProfessionTypeID(selectedOption ? selectedOption.value : null);
  };

  const handleActiveDateChange = (selectedOption) => {
    let dateFormat = "mm-dd-yyyy";
    setSelectedOption(selectedOption);
    if (!selectedOption) {
      setSelectedOption(null);
      setToDate(null);
      setFromDate(null);
      return;
    }
    switch (selectedOption.value) {
      case ActiveDateFilterEnum.Active_In_Last_1_Day:
      case ActiveDateFilterEnum.Active_In_Last_7_Days:
      case ActiveDateFilterEnum.Active_In_Last_30_Days:
      case ActiveDateFilterEnum.Active_In_Last_60_Days:
      case ActiveDateFilterEnum.Active_In_Last_90_Days:
      case ActiveDateFilterEnum.Active_In_Last_6_Months:
      case ActiveDateFilterEnum.Active_In_Last_1_Year:
        const dateRange = GetActiveDateRange(dateFormat, selectedOption.value);
        setFromDate(dateRange.fromDate);
        setToDate(dateRange.toDate);
        break;
      default:
        break;
    }
  };
  const GetOrganisationBusinessTypeLookupListData = async () => {
    try {
      const data = await GetBusinessTypeLookupList();

      if (data?.data?.statusCode === 200) {
        if (data?.data?.responseData?.data) {
          let BusinessTypeListData = data?.data?.responseData?.data;
          BusinessTypeListData = BusinessTypeListData.map((BusinessType) => ({
            value: BusinessType.businessTypeID,
            label: BusinessType.businessTypeName,
          }));

          setOrganisationBusinessTypeLookupList(
            BusinessTypeListData.slice(1, 5),
          );
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const GetProfessionTypeLookupListData = async () => {
    try {
      const data = await GetProfessionTypeLookupList(
        common.userKeyID,
        common.organisationKeyID,
      );
      if (data?.data?.statusCode === 200) {
        if (data?.data?.responseData?.data) {
          let ProfessionTypeListData = data?.data?.responseData?.data;
          ProfessionTypeListData = ProfessionTypeListData.map(
            (ProfessionType) => ({
              value: ProfessionType.professionTypeId,
              label: ProfessionType.professionTypeName,
            }),
          );

          setProfessionTypeLookupList(ProfessionTypeListData);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };
  //Organisation Crud is here
  const GetOrganisationListData = async (
    i,
    searchKeywordValue,
    sortValue,
    UserSort,
    businessTypeId,
    professionTypeId,
    FromDate,
    ToDate,
  ) => {
    setLoader(true);
    const pageNoList = i - 1;
    try {
      const data = await GetOrganisationList({
        pageSize: pageSize,
        pageNo: pageNoList,
        userKeyID: common.userKeyID,
        searchKeyword:
          searchKeywordValue === undefined ? searchKeyword : searchKeywordValue,
        businessTypeID:
          businessTypeId == undefined ? prospectType : businessTypeId,
        professionTypeID:
          professionTypeId == undefined ? null : professionTypeId,
        fromDate:
          FromDate === undefined
            ? fromDate == ""
              ? null
              : fromDate
            : FromDate,
        toDate: ToDate === undefined ? (toDate == "" ? null : toDate) : ToDate,
        primarySortDirection:
          sortValue === undefined ? primarySortDirectionUsers : sortValue,
        PrimarySortColumnName:
          UserSort === undefined || UserSort === null || UserSort === ""
            ? null
            : UserSort,
      });

      if (data) {
        if (data?.data?.statusCode === 200) {
          setLoader(false);
          getOrganisationListCallCount = 0;
          if (data?.data?.responseData?.data) {
            const orgList = data?.data?.responseData?.data;
            const totalCount = data.data.totalCount;
            const totalUserCount = data.data.responseData?.totalUserCount;
            if (pageNoList > 0 && orgList.length === 0) {
              let newPaneNo = Number(pageNoList);
              if (newPaneNo > 1) {
                newPaneNo = newPaneNo - 1;
              }
              GetOrganisationListData(newPaneNo, searchKeywordValue, sortValue);
              setCurrentPage(pageNoList);
              return;
            }
            setListCount(totalCount);
            setUserCount(totalUserCount);
            setOrganisationList(orgList);
            setTotalRecords(orgList.length);
          }
        } else {
          if (getOrganisationListCallCount < maxCountToRecallApi) {
            getOrganisationListCallCount += 1;
            setTimeout(function () {
              GetOrganisationListData(i, searchKeywordValue, sortValue);
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
  // const handlePurchaseModalClose = () => {
  //   setOpenPurchaseModal(false)
  // };
  const showPurchaseModal = async (Org) => {
    await ChoosePlanApiModelData();
    navigate("/ChoosePlan", {
      state: { organizationKeyId: Org.organisationKeyID },
    });
    // setSelectedOrganizationKeyId(Org.organisationKeyID)
    // setOpenPurchaseModal(true)
  };
  const ChoosePlanApiModelData = async () => {
    try {
      const data = await ChoosePlanApi();
      if (data?.data?.statusCode === 200) {
        if (data?.data?.responseData?.data) {
          const ModelData = data?.data?.responseData?.data;
          setChooseApiData(ModelData);
        }
      } else {
        setErrorMessage(data?.data?.errorMessage);
      }
    } catch (error) {
      console.log(error);
    }
  };
  // 2) On Click Organisation Status Button
  const OrganisationDeleteData = async () => {
    setLoader(true);
    if (modelRequestData.Action === "Delete") {
      try {
        const Data = await DeleteOrganisation(
          modelRequestData.OrgKeyID,
          modelRequestData.userKeyID,
        );
        if (Data) {
          setLoader(false);
          if (Data?.data?.statusCode === 200) {
            if (
              Data?.data?.responseData.organisationExistsInUser.length !== 0
            ) {
              const servicePackageNames =
                Data?.data?.responseData.organisationExistsInUser.map(
                  (item) => item.email,
                );
              setModelRequestData({
                ...modelRequestData,
                Action: "OrganisationWarning",
                message: `This Organisation is assigned to below users. You must remove the Organisations from these before you InActive it.`,
                ServiceName: servicePackageNames,
              });
              $("#" + "ConfirmModel").modal("hide");
              $("#" + "RecordsAvailablePopupModel").modal("show");
              GetOrganisationListData(
                currentPage,
                searchKeyword,
                primarySortDirectionUsers,
                UserSortType,
                businessTypeID,
                professionTypeID,
                fromDate,
                toDate,
              );
            } else {
              GetOrganisationListData(
                currentPage,
                searchKeyword,
                primarySortDirectionUsers,
                UserSortType,
                businessTypeID,
                professionTypeID,
                fromDate,
                toDate,
              );

              $("#" + "ConfirmModel").one("hidden.bs.modal", () => {
                setOpenSuccessModal(true);
              });
              $("#" + "ConfirmModel").modal("hide");
            }
          } else {
            setErrorMessage(Data?.response?.data?.errorMessage);
            setOpenErrorModal(true);
          }
          GetOrganisationListData(
            currentPage,
            searchKeyword,
            primarySortDirectionUsers,
            UserSortType,
            businessTypeID,
            professionTypeID,
            fromDate,
            toDate,
          );
        }
      } catch (error) {
        console.log(error);
      }
    } else if (modelRequestData.Action === "Status") {
      try {
        const Data = await OrganisationChangeStatus(
          modelRequestData.OrgKeyID,
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
            setErrorMessage(Data?.response?.data?.errors?.OrgKeyID[0]);
            setOpenErrorModal(true);
          }
        }
        GetOrganisationListData(
          currentPage,
          searchKeyword,
          primarySortDirectionUsers,
          UserSortType,
          businessTypeID,
          professionTypeID,
          fromDate,
          toDate,
        );
      } catch (error) {
        console.log(error);
      }
    }
  };

  const handleViewOrganisation = (org) => {
    setModelRequestData({
      ...modelRequestData,
      OrgKeyID: org.organisationKeyID, // Change OrgKeyID to OrgKeyID
      Action: "View",
    });
  };

  const handleClose = () => {
    setModelRequestData({
      ...modelRequestData,
      OrgKeyID: null,
      Action: "",
      OrgName: null,
    });
    $("#" + "ConfirmModel").modal("hide");
    setOpenSuccessModal(false);
    setOpenErrorModal(false);
  };

  const handleSearch = (e) => {
    const searchKeywordValue = e.target.value;
    setSearchKeyword(searchKeywordValue);
    setCurrentPage(1);
    GetOrganisationListData(1, searchKeywordValue);
  };

  const handlePageChange = async (pageNumber) => {
    setCurrentPage(pageNumber);
    await GetOrganisationListData(
      pageNumber,
      searchKeyword,
      primarySortDirectionUsers,
      UserSortType,
      businessTypeID,
      professionTypeID,
      fromDate,
      toDate,
    );
  };

  const handleUserSort = (sortValue, UserSort) => {
    if (UserSort === "TradingBusinessName") {
      setPrimarySortDirectionUsers(sortValue);
      setPrimaryUserSortDirectionObj({
        ...primaryUserSortDirectionObj,
        UserNameTypeSort: sortValue,
      });
      setCurrentPage(1);
      GetOrganisationListData(
        1,
        searchKeywordUsers,
        sortValue,
        UserSort,
        businessTypeID,
        professionTypeID,
        fromDate,
        toDate,
      );
    } else if (UserSort === "UserFullName") {
      setPrimarySortDirectionUsers(sortValue);
      setPrimaryUserSortDirectionObj({
        ...primaryUserSortDirectionObj,
        RoleTypeSort: sortValue,
      });
      setCurrentPage(1);
      GetOrganisationListData(
        1,
        searchKeywordUsers,
        sortValue,
        UserSort,
        businessTypeID,
        professionTypeID,
        fromDate,
        toDate,
      );
    } else if (UserSort === "CreatedOnDate") {
      setPrimarySortDirectionUsers(sortValue);
      setPrimaryUserSortDirectionObj({
        ...primaryUserSortDirectionObj,
        RoleTypeSort: sortValue,
      });
      setCurrentPage(1);
      GetOrganisationListData(
        1,
        searchKeywordUsers,
        sortValue,
        UserSort,
        businessTypeID,
        professionTypeID,
        fromDate,
        toDate,
      );
    } else if (UserSort === "LastLoginDate") {
      setPrimarySortDirectionUsers(sortValue);
      setPrimaryUserSortDirectionObj({
        ...primaryUserSortDirectionObj,
        RoleTypeSort: sortValue,
      });
      setCurrentPage(1);
      GetOrganisationListData(
        1,
        searchKeywordUsers,
        sortValue,
        UserSort,
        businessTypeID,
        professionTypeID,
        fromDate,
        toDate,
      );
    }
    setUserSortType(UserSort);
  };
  // Filter
  const ApplyFilter = () => {
    if (
      (businessTypeID !== null && businessTypeID !== "") ||
      (professionTypeID !== null && professionTypeID !== "") ||
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
    setCurrentPage(1);
    GetOrganisationListData(
      1,
      searchKeyword,
      primarySortDirectionUsers,
      UserSortType,
      businessTypeID,
      professionTypeID,
      normalizedFromDate,
      normalizedToDate,
    );
  };
  const ClearFilter = () => {
    setCurrentPage(1);
    setSelectedOption("");
    setIsFilterApply(false);
    setBusinessTypeID(null);
    setProfessionTypeID(null);
    setFromDate(null);
    setToDate(null);
    setPrimarySortDirectionUsers(null);
    setUserSortType(null);
    GetOrganisationListData(
      1,
      searchKeyword,
      null,
      null,
      null,
      null,
      null,
      null,
    );
    // console.log(fromDate,toDate);
  };
  return (
    <>
      <div className="organisation-list-redesign">
        <div className="organisation-list-page">
          {/* =========================
              PAGE HEADER
              ========================= */}
          <div className="organisation-page-header">
            <div className="organisation-heading-copy">
              <h1>Organisation / Practice</h1>
              <p>
                Manage organisations, users, plans, activity and account status.
              </p>
            </div>

            <div className="organisation-summary">
              <div className="organisation-summary-card">
                <span className="organisation-summary-icon">
                  <i className="ri-building-4-line"></i>
                </span>

                <div>
                  <span>Total Organisations</span>
                  <strong>{listCount > 0 ? listCount : 0}</strong>
                </div>
              </div>

              <div className="organisation-summary-card">
                <span className="organisation-summary-icon">
                  <i className="ri-group-line"></i>
                </span>

                <div>
                  <span>Total Users</span>
                  <strong>{userCount > 0 ? userCount : 0}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* =========================
              LIST CARD
              ========================= */}
          <section className="organisation-list-card">
            {/* SEARCH / FILTERS */}
            <div className="organisation-toolbar">
              <div className="organisation-search-wrap">
                <i className="ri-search-line"></i>

                <input
                  type="text"
                  className="form-control organisation-search-input"
                  value={searchKeyword}
                  onChange={(e) => {
                    handleSearch(e);
                  }}
                  placeholder={
                    isMobile
                      ? "Search"
                      : getPlaceholderTextName("Search", moduleName)
                  }
                />
              </div>

              <div className="organisation-filter-area">
                <div className="organisation-filter-select">
                  <Select
                    className="phone-input-country-code selectDropDown Drop-down-width"
                    classNamePrefix="organisation-select"
                    placeholder="Organisation type"
                    options={OrganisationBusinessTypeLookupList}
                    value={orgBusinessTypeFilter}
                    onChange={handleSelectChange}
                    styles={{
                      option: (base) => ({
                        ...base,
                        cursor: "pointer",
                      }),
                    }}
                    isClearable
                  />
                </div>

                <div className="organisation-filter-select">
                  <Select
                    className="phone-input-country-code selectDropDown Drop-down-width"
                    classNamePrefix="organisation-select"
                    style={{ cursor: "pointer" }}
                    placeholder="Profession type"
                    options={ProfessionTypeLookupList}
                    value={professionTypeFilter}
                    onChange={handleSelectProfessionChange}
                    styles={{
                      option: (base) => ({
                        ...base,
                        cursor: "pointer",
                      }),
                    }}
                    isClearable
                  />
                </div>

                <div className="organisation-filter-select organisation-date-filter">
                  <Select
                    className="phone-input-country-code selectDropDown Drop-down-width"
                    classNamePrefix="organisation-select"
                    style={{ cursor: "pointer" }}
                    placeholder="Date Filter"
                    options={Utils.DateFilter}
                    value={selectedOption}
                    onChange={handleActiveDateChange}
                    styles={{
                      option: (base) => ({
                        ...base,
                        cursor: "pointer",
                      }),
                    }}
                    isClearable
                  />
                </div>

                <button
                  type="button"
                  className="btn organisation-apply-filter-btn"
                  onClick={ApplyFilter}
                >
                  <i className="ri-filter-3-line"></i>
                  <span>Apply Filter</span>
                </button>

                {isFilterApply && (
                  <button
                    type="button"
                    className="btn organisation-clear-filter-btn"
                    onClick={ClearFilter}
                  >
                    <i className="ri-close-line"></i>
                    <span>Clear</span>
                  </button>
                )}
              </div>
            </div>

            {/* TABLE */}
            <div className="organisation-table-scroll">
              <table className="organisation-table" id="customerTable">
                <thead>
                  <tr>
                    <th className="organisation-name-column">
                      <button
                        type="button"
                        className="organisation-sort-button"
                        onClick={() => {
                          handleUserSort(
                            primaryUserSortDirectionObj.UserNameTypeSort ===
                              null
                              ? "asc"
                              : primaryUserSortDirectionObj.UserNameTypeSort ===
                                  "asc"
                                ? "desc"
                                : "asc",
                            "TradingBusinessName",
                          );
                        }}
                      >
                        <span>Organisation</span>

                        <i
                          className={
                            primaryUserSortDirectionObj.UserNameTypeSort ===
                            "desc"
                              ? "fas fa-sort-alpha-up"
                              : "fas fa-sort-alpha-down"
                          }
                        ></i>
                      </button>
                    </th>

                    <th>
                      <button
                        type="button"
                        className="organisation-sort-button"
                        onClick={() => {
                          handleUserSort(
                            primaryUserSortDirectionObj.RoleTypeSort === null
                              ? "asc"
                              : primaryUserSortDirectionObj.RoleTypeSort ===
                                  "asc"
                                ? "desc"
                                : "asc",
                            "UserFullName",
                          );
                        }}
                      >
                        <span>Created By</span>

                        <i
                          className={
                            primaryUserSortDirectionObj.RoleTypeSort === "desc"
                              ? "fas fa-sort-alpha-up"
                              : "fas fa-sort-alpha-down"
                          }
                        ></i>
                      </button>
                    </th>

                    <th className="organisation-center-column">Users</th>

                    <th>Current Plan</th>

                    <th>
                      <button
                        type="button"
                        className="organisation-sort-button"
                        onClick={() => {
                          handleUserSort(
                            primaryUserSortDirectionObj.RoleTypeSort === null
                              ? "asc"
                              : primaryUserSortDirectionObj.RoleTypeSort ===
                                  "asc"
                                ? "desc"
                                : "asc",
                            "CreatedOnDate",
                          );
                        }}
                      >
                        <span>Created Date</span>

                        <i
                          className={
                            primaryUserSortDirectionObj.RoleTypeSort === "desc"
                              ? "fas fa-sort-alpha-up"
                              : "fas fa-sort-alpha-down"
                          }
                        ></i>
                      </button>
                    </th>

                    <th>
                      <button
                        type="button"
                        className="organisation-sort-button"
                        onClick={() => {
                          handleUserSort(
                            primaryUserSortDirectionObj.RoleTypeSort === null
                              ? "asc"
                              : primaryUserSortDirectionObj.RoleTypeSort ===
                                  "asc"
                                ? "desc"
                                : "asc",
                            "LastLoginDate",
                          );
                        }}
                      >
                        <span>Last Login Date</span>

                        <i
                          className={
                            primaryUserSortDirectionObj.RoleTypeSort === "desc"
                              ? "fas fa-sort-alpha-up"
                              : "fas fa-sort-alpha-down"
                          }
                        ></i>
                      </button>
                    </th>

                    <th>Status</th>
                    <th className="organisation-actions-heading">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {organisationList
                    .slice(0, isMobile ? isMobileRecords : desktopRecords)
                    .map((Org) => {
                      const formattedOrganisationName =
                        Org.tradingBusinessName
                          ?.toLowerCase()
                          .replace(/\b\w/g, (l) => l.toUpperCase()) || "";

                      return (
                        <tr key={Org.organisationKeyID}>
                          {/* ORGANISATION */}
                          <td>
                            <div className="organisation-name-cell">
                              <span className="organisation-avatar">
                                {Org.tradingBusinessName
                                  ?.charAt(0)
                                  ?.toUpperCase()}
                              </span>

                              <div className="organisation-name-copy">
                                {isMobile ? (
                                  <strong>
                                    {formattedOrganisationName.length > 20
                                      ? `${formattedOrganisationName.substring(
                                          0,
                                          20,
                                        )}...`
                                      : formattedOrganisationName}
                                  </strong>
                                ) : formattedOrganisationName.length > 50 ? (
                                  <Tooltip title={Org.tradingBusinessName}>
                                    <strong>
                                      {`${formattedOrganisationName.substring(
                                        0,
                                        50,
                                      )}...`}
                                    </strong>
                                  </Tooltip>
                                ) : (
                                  <strong>{formattedOrganisationName}</strong>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* CREATED BY */}
                          <td>
                            <span className="organisation-created-by">
                              {Org.fullName}
                            </span>
                          </td>

                          {/* USERS */}
                          <td className="organisation-center-column">
                            <span className="organisation-users-pill">
                              <i className="ri-user-3-line"></i>
                              {Org.numberOfUsers}
                            </span>
                          </td>

                          {/* PLAN */}
                          <td>
                            {Org.currentPlan ? (
                              <span className="organisation-plan-pill">
                                {Org.currentPlan}
                              </span>
                            ) : (
                              <button
                                type="button"
                                className="organisation-buy-plan-btn"
                                onClick={() => {
                                  showPurchaseModal(Org);
                                }}
                              >
                                Buy Plan
                              </button>
                            )}
                          </td>

                          {/* CREATED DATE */}
                          <td>
                            <span className="organisation-date-text">
                              {Org.createdOn
                                ? new Date(Org.createdOn).toLocaleDateString(
                                    "en-GB",
                                  )
                                : ""}
                            </span>
                          </td>

                          {/* LAST LOGIN */}
                          <td>
                            <span className="organisation-date-text">
                              {Org.lastLoginDate
                                ? new Date(
                                    Org.lastLoginDate,
                                  ).toLocaleDateString("en-GB")
                                : ""}
                            </span>
                          </td>

                          {/* STATUS */}
                          <td>
                            <div className="organisation-status-cell">
                              <span
                                className={`organisation-status-pill ${
                                  Org.statusName === "Active"
                                    ? "is-active"
                                    : "is-inactive"
                                }`}
                              >
                                {Org.statusName}
                              </span>

                              {userAccessData.Organisation_CanDelete && (
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
                                            setModelRequestData({
                                              ...modelRequestData,
                                              status: Org.statusName,
                                              OrgKeyID: Org.organisationKeyID,
                                              OrgName: Org.tradingBusinessName,
                                              userKeyID: common.userKeyID,
                                              Action: "Status",
                                            })
                                          }
                                          checked={Org.statusName === "Active"}
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

                          {/* ACTIONS */}
                          <td className="organisation-actions-cell">
                            <div className="organisation-row-actions">
                              {userAccessData.Organisation_CanView && (
                                <Tooltip
                                  title={getCrudButtonToolTipName(
                                    "View",
                                    moduleName,
                                  )}
                                >
                                  <button
                                    type="button"
                                    className="organisation-action-btn organisation-view-btn"
                                    onClick={() => handleViewOrganisation(Org)}
                                  >
                                    <i className="bi bi-eye"></i>
                                  </button>
                                </Tooltip>
                              )}

                              {userAccessData.Organisation_CanDelete && (
                                <Tooltip
                                  title={getCrudButtonToolTipName(
                                    "Delete",
                                    moduleName,
                                  )}
                                >
                                  <button
                                    type="button"
                                    className="organisation-action-btn organisation-delete-btn"
                                    data-bs-toggle="modal"
                                    data-bs-target="#ConfirmModel"
                                    onClick={() =>
                                      setModelRequestData({
                                        ...modelRequestData,
                                        status: Org.statusName,
                                        OrgKeyID: Org.organisationKeyID,
                                        OrgName: Org.tradingBusinessName,
                                        userKeyID: common.userKeyID,
                                        Action: "Delete",
                                      })
                                    }
                                  >
                                    <i className="ri-delete-bin-5-line"></i>
                                  </button>
                                </Tooltip>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>

            {totalRecords <= 0 && (
              <div className="organisation-empty-state">
                <NoResultFoundModel
                  name={moduleName}
                  totalRecords={totalRecords}
                />
              </div>
            )}

            {listCount > pageSize && (
              <div className="organisation-pagination">
                <PaginationComponent
                  totalCount={listCount}
                  totalPages={totalPage}
                  currentPage={currentPage}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </section>

          <ConfirmModel
            openErrorModal={openErrorModal}
            openSuccessModal={openSuccessModal}
            modelRequestData={modelRequestData}
            UpdatedStatus={OrganisationDeleteData}
            handleClose={handleClose}
          />

          <ErrorModel
            ErrorModel={openErrorModal}
            handleClose={handleClose}
            ErrorMessage={formattedErrorMessage}
          />

          <SuccessModal
            handleClose={handleClose}
            setOpenSuccessModal={setOpenSuccessModal}
            openSuccessModal={openSuccessModal}
            modelAction={modelRequestData.Action}
            message={
              modelRequestData.Action === "Delete"
                ? "Organisation " + modelRequestData.OrgName
                : "Status has been changed successfully!"
            }
          />

          <RecordsAvailablePopupModel
            handleClose={handleClose}
            openErrorModal={openErrorModal}
            openSuccessModal={openSuccessModal}
            modelRequestData={modelRequestData}
            UpdatedStatus={OrganisationDeleteData}
          />
        </div>

        <div className="organisation-footer-wrap">
          <Footer />
        </div>
      </div>
    </>
  );
};

export default Organisation;
