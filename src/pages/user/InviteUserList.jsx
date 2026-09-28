/* global $ */
import React, { useContext, useEffect, useState } from "react";
import "./UsersStyle.css";
import "./UsersStyle-redesign.css";
import { useSelector } from "react-redux";
import Android12Switch from "../../components/AndroidSwitch";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import PaginationComponent from "../../components/PaginationModel";
import CommonButtonComponent from "../../components/CommonButtonComponent";
import UsersModel from "../Settings/users/UsersModel";
import NoResultFoundModel from "../../components/NoResultFoundModel";
import {
  DeleteInviteUser,
  UserChangeStatus,
  DeleteUser,
  GetInviteUsersList,
  InviteUserChangeStatus,
} from "../../redux/Services/Setting/InviteUserApi";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import ConfirmModel from "../../components/ConfirmationBox";
import { Tooltip } from "@mui/material";
import SuccessModal from "../../components/SuccessModal";
import UserList from "./UserList";
import { AuthContextProvider } from "../../AuthContext/AuthContext";
import ErrorModel from "../../components/ErrorModel";
import Footer from "../../components/Footer";
import { GetUsersList } from "../../redux/Services/User/UsersApi";
import UserModelNew from "../../components/UserModelNew";
import RecordsAvailablePopupModel from "../../components/RecordsAvailablePopupModel";
import { GetCountryLookUpList } from "../../Database/ProposalToolDatabase";
import { ActiveDateFilterEnum } from "../../Middleware/enums";
import Utils from "../../Middleware/Utils";
import Select from "react-select";
import { SuperAdminRoleTypeLookupList } from "../../Database/ProposalToolDatabase";
const InviteUser = () => {
  // A] States Declaration :
  const moduleName = "User";
  let getUsersListCallCount = 0;
  let getInviteUsersListCallCount = 0;
  const [inviteUsersList, setInviteUsersList] = useState([]);
  const [UserListCount, setUserListCount] = useState([]);
  const [modelRequestData, setModelRequestData] = useState({
    userName: null,
    inviteUserKeyID: null,
    Action: null,
    userKeyID: null,
    status: null,
    user: null,
    showModel: false,
    Edit: true,
  });
  const [totalRecords, setTotalRecords] = useState(-1);
  const [isAddUpdateActionDone, setIsAddUpdateActionDone] = useState(false);
  const [openSuccessModal, setOpenSuccessModal] = React.useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPageUsers, setCurrentPageUsers] = useState(1);

  // Calculate the total number of pages based on listCount
  const common = useSelector((state) => state.Storage); //Getting Logged Users Details From Persist Storage of redux hooks
  const [primarySortDirection, setPrimarySortDirection] = useState(null); //setPrimarySortDirectionUsers
  const [primarySortDirectionUsers, setPrimarySortDirectionUsers] =
    useState(null); //setPrimarySortDirectionUsers
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchKeywordUsers, setSearchKeywordUsers] = useState("");
  const [openErrorModal, setOpenErrorModal] = useState(false);
  const {
    setLoader,
    setTopbar,
    isMobile,
    listCount,
    totalPage,
    setListCount,
    desktopRecords,
    userAccessData,
    isMobileRecords,
    handleErrorMessage,
    maxCountToRecallApi,
    getCrudButtonTextName,
    getPlaceholderTextName,
    getCrudButtonToolTipName,
    GetActiveDateRange,
  } = useContext(AuthContextProvider);
  const [usersList, setUsersList] = useState([]);
  const totalUserPage = isMobile
    ? Math.ceil(UserListCount / isMobileRecords)
    : Math.ceil(UserListCount / desktopRecords);
  const [primaryUserSortDirectionObj, setPrimaryUserSortDirectionObj] =
    useState({
      UserLNameTypeSort: null,
      UserNameTypeSort: null,
      RoleTypeSort: null,
      AcceptanceStatusTypeSort: null,
      EmailTypeSort: null,
    });
  const [UserSortType, setUserSortType] = useState(null);
  const [
    primaryInviteUserSortDirectionObj,
    setPrimaryInviteUserSortDirectionObj,
  ] = useState({
    InviteUserLNameTypeSort: null,
    InviteUserNameTypeSort: null,
    InviteRoleTypeSort: null,
    InviteAcceptanceStatusTypeSort: null,
    InviteEmailTypeSort: null,
  });
  const pageSize = isMobile ? isMobileRecords : desktopRecords;
  const [InviteUserSortType, setInviteUserSortType] = useState("");
  const formattedErrorMessage = handleErrorMessage(errorMessage);
  const [selectedOption, setSelectedOption] = useState(null);
  const [countryId, setCountryId] = useState(null);
  const [roleType, setRoleType] = useState(null);
  // const [primarySortColumnName,setPrimarySortColumnName] = useState(null);
  const [isFilterApply, setIsFilterApply] = useState(null);
  const [orgCount, setOrgCount] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [fromDate, setFromDate] = useState(null);
  const [tabSelected, setTabSelected] = useState("users");

  // B] Initial useEffect :
  // 1) Will Call Initial Api Like List Api
  useEffect(() => {
    GetUsersListData(1);
    setTopbar("block");
    // GetInviteUsersListData(1);
  }, [common.organisationKeyID, common.token]);

  //2) This useEffect will trigger when we successfully add or update record from popup model
  useEffect(() => {
    if (isAddUpdateActionDone) {
      if (modelRequestData.Action === null) {
        setSearchKeyword("");
        setPrimarySortDirection(null);
        setCurrentPage(1);
        GetUsersListData(1, null, null, null);
        GetInviteUsersListData(1, null, null, null);
      } else {
        GetUsersListData(
          currentPageUsers,
          searchKeyword,
          countryId,
          roleType,
          fromDate,
          toDate,
          primarySortDirectionUsers,
          UserSortType,
        );
        GetInviteUsersListData(currentPage);
      }
      setIsAddUpdateActionDone(false);
    }
  }, [isAddUpdateActionDone]);
  useEffect(() => {
    if (modelRequestData.inviteUserKeyID && modelRequestData.showModel) {
      setShowUserModal(true);
    }
  }, [modelRequestData]);

  // C] Calling All Api's like List and other Here :
  // 1) Get Users List Data
  const [showUserModal, setShowUserModal] = useState(false);
  const GetInviteUsersListData = async (
    i,
    searchKeywordValue,
    sortValue,
    InviteUserSort,
  ) => {
    setLoader(true);
    // setUsersPage(false);
    try {
      const data = await GetInviteUsersList({
        pageSize: pageSize,
        pageNo: i - 1,
        organisationKeyID: common.organisationKeyID,
        searchKeyword:
          searchKeywordValue === undefined ? searchKeyword : searchKeywordValue,
        primarySortDirection:
          sortValue === undefined ? primarySortDirection : sortValue,
        PrimarySortColumnName:
          InviteUserSort === undefined ||
          InviteUserSort === null ||
          InviteUserSort === ""
            ? null
            : InviteUserSort,
      });
      if (data) {
        if (data?.data?.statusCode === 200) {
          setLoader(false);
          getInviteUsersListCallCount = 0;
          if (data?.data?.responseData?.data) {
            const totalCount = data.data.totalCount;
            const InviteUsersListData = data.data.responseData.data;
            setListCount(totalCount);
            setInviteUsersList(InviteUsersListData);
            setTotalRecords(InviteUsersListData.length);
          }
        } else {
          if (getInviteUsersListCallCount < maxCountToRecallApi) {
            getInviteUsersListCallCount += 1;
            setTimeout(function () {
              GetInviteUsersListData(
                i,
                searchKeywordValue,
                sortValue,
                InviteUserSort,
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

  const GetUsersListData = async (
    i,
    searchKeywordValue,
    countryId,
    roleType,
    FromDate,
    ToDate,
    sortValue,
    UserSort,
  ) => {
    // setUsersPage(true);
    setLoader(true);
    try {
      const data = await GetUsersList({
        pageSize: pageSize,
        pageNo: i - 1,
        organisationKeyID: common.organisationKeyID,
        userKeyID: common.userKeyID,
        searchKeyword:
          searchKeywordValue === undefined
            ? searchKeywordUsers
            : searchKeywordValue,
        countryID:
          countryId === undefined || countryId === null ? null : countryId,
        RoleType: roleType === undefined || roleType === null ? null : roleType,
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
          getUsersListCallCount = 0;
          if (data?.data?.responseData?.data) {
            const totalCount = data.data.totalCount;
            const UsersListData = data.data.responseData.data;
            const orgCount = data.data.responseData.totalOrgCount;
            setUserListCount(totalCount);
            setUsersList(UsersListData);
            setTotalRecords(UsersListData.length);
            setOrgCount(orgCount);
          }
        } else {
          if (getUsersListCallCount < maxCountToRecallApi) {
            getUsersListCallCount += 1;
            setTimeout(function () {
              GetUsersListData(i, searchKeywordValue, sortValue, UserSort);
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

  const UserRoleTypeLookupList =
    SuperAdminRoleTypeLookupList.data?.responseData?.data?.map(
      (userRoleType) => ({
        value: userRoleType.roleTypeId,
        label: userRoleType.roleName,
      }),
    );

  const countryNameListData =
    GetCountryLookUpList?.data?.responseData?.data.map((countryData) => ({
      value: countryData.countryId,
      label: countryData.countryName,
    }));
  // console.log(countryNameListData);
  const countryNameFilter = countryNameListData?.filter(
    (country) => country.value == countryId,
  );
  const RoleTypeFilter = UserRoleTypeLookupList?.filter(
    (role) => role.value == roleType,
  );

  const handleSelectCountryChange = (selectedOption) => {
    setCountryId(selectedOption ? selectedOption.value : null);
  };
  const handleSelectRoleTypeChange = (selectedOption) => {
    setRoleType(selectedOption ? selectedOption.value : null);
  };
  // F] Pagination :
  // const handlePageChange = async (pageNumber) => {
  //   setCurrentPageUsers(pageNumber);
  //   await GetUsersListData(pageNumber); // Call your function with the selected page number
  // };

  const HandlePageChange = async (pageNumber) => {
    setCurrentPage(pageNumber);
    await GetInviteUsersListData(pageNumber); // Call your function with the selected page number
  };

  // E] Event Handling Functions will call here.
  // 1) On Click Users Add Button
  const UsersAddBtnClicked = (users) => {
    {
      setModelRequestData({
        ...modelRequestData,
        Action: null,
      });
    }
  };

  // Update Function Modal
  // 2) On Click user Status Button
  const InviteUserChangeStatusData = async () => {
    setLoader(true);
    if (modelRequestData.user === "Invite User") {
      if (modelRequestData.Action === "Status") {
        try {
          const Data = await InviteUserChangeStatus(
            modelRequestData.inviteUserKeyID,
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
              setErrorMessage(Data?.response?.data?.errors?.InviteUserKeyID[0]);
              setOpenErrorModal(true);
            }
          }
          GetInviteUsersListData(currentPage);
        } catch (error) {
          console.log(error);
        }
      } else if (modelRequestData.Action === "Delete") {
        try {
          const Data = await DeleteUser(
            modelRequestData.inviteUserKeyID,
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
              setErrorMessage(Data?.response?.data?.errors?.InviteUserKeyID[0]);
              setOpenErrorModal(true);
            }

            GetInviteUsersListData(currentPage);
          }
        } catch (error) {
          console.log(error);
        }
      }
    } else if (modelRequestData.user === "User") {
      if (modelRequestData.Action === "Status") {
        try {
          const Data = await UserChangeStatus(
            common.userKeyID,
            modelRequestData.inviteUserKeyID,
          );
          if (Data) {
            setLoader(false);
            if (Data?.data?.statusCode === 200) {
              $("#" + "ConfirmModel").one("hidden.bs.modal", () => {
                setOpenSuccessModal(true);
              });
              $("#" + "ConfirmModel").modal("hide");
            } else {
              setErrorMessage(Data?.response?.data?.errors?.inviteUserKeyID[0]);
              setOpenErrorModal(true);
            }
          }
          GetUsersListData(
            currentPageUsers,
            searchKeywordUsers,
            countryId,
            roleType,
            fromDate,
            toDate,
            primarySortDirectionUsers,
            UserSortType,
          );
        } catch (error) {
          console.log(error);
        }
      } else if (modelRequestData.Action === "Delete") {
        try {
          const Data = await DeleteInviteUser(
            common.userKeyID,
            modelRequestData.inviteUserKeyID,
          );
          if (Data) {
            setLoader(false);
            if (Data?.data?.statusCode === 200) {
              if (
                Data?.data?.responseData.userExistsInOrganisation.length !== 0
              ) {
                const moduleNames =
                  Data?.data?.responseData.userExistsInOrganisation
                    .map((item) => item.organisationName)
                    .join(", ");
                const servicePackageNames =
                  Data?.data?.responseData.userExistsInOrganisation.map(
                    (item) => item.organisationName,
                  );
                setModelRequestData({
                  ...modelRequestData,
                  Action: "UserWarning",
                  message: `Following organization are assigned to the selected user.You must remove from this organization before attempting to mark it as delete.`,
                  ServiceName: servicePackageNames,
                });
                $("#" + "ConfirmModel").modal("hide");
                $("#" + "RecordsAvailablePopupModel").modal("show");
                GetUsersListData(currentPageUsers);
              } else {
                GetUsersListData(currentPageUsers);
                $("#" + "ConfirmModel").one("hidden.bs.modal", () => {
                  setOpenSuccessModal(true);
                });
                $("#" + "ConfirmModel").modal("hide");
              }
            } else {
              setErrorMessage(Data?.response?.data?.errorMessage);
              setOpenErrorModal(true);
            }
            // GetUsersListData(currentPage);
            GetUsersListData(currentPageUsers);
          }
        } catch (error) {
          console.log(error);
        }
      }
    }
  };

  // F] Pagination :

  const HandlePageChangeUsers = async (pageNumber) => {
    setCurrentPageUsers(pageNumber);
    await GetUsersListData(
      pageNumber,
      searchKeywordUsers,
      countryId,
      roleType,
      fromDate,
      toDate,
      primarySortDirectionUsers,
      UserSortType,
    );
    // await GetUsersListData(pageNumber); // Call your function with the selected page number
  };

  // E] Sorting & handle Function
  const handleInviteSort = (sortValue, InviteUserSort) => {
    if (InviteUserSort == "FirstName") {
      setPrimarySortDirection(sortValue);
      setPrimaryInviteUserSortDirectionObj({
        ...primaryInviteUserSortDirectionObj,
        InviteUserNameTypeSort: sortValue,
      });
      setCurrentPage(1);
      GetInviteUsersListData(1, searchKeyword, sortValue, InviteUserSort);
    } else if (InviteUserSort == "RoleName") {
      setPrimarySortDirection(sortValue);
      setPrimaryInviteUserSortDirectionObj({
        ...primaryInviteUserSortDirectionObj,
        InviteRoleTypeSort: sortValue,
      });
      setCurrentPage(1);
      GetInviteUsersListData(1, searchKeyword, sortValue, InviteUserSort);
    } else if (InviteUserSort == "AcceptanceStatus") {
      setPrimarySortDirection(sortValue);
      setPrimaryInviteUserSortDirectionObj({
        ...primaryInviteUserSortDirectionObj,
        InviteAcceptanceStatusTypeSort: sortValue,
      });
      setCurrentPage(1);
      GetInviteUsersListData(1, searchKeyword, sortValue, InviteUserSort);
    } else if (InviteUserSort == "Email") {
      setPrimarySortDirection(sortValue);
      setPrimaryInviteUserSortDirectionObj({
        ...primaryInviteUserSortDirectionObj,
        InviteEmailTypeSort: sortValue,
      });
      setCurrentPage(1);
      GetInviteUsersListData(1, searchKeyword, sortValue, InviteUserSort);
    } else if (InviteUserSort == "LastName") {
      setPrimarySortDirection(sortValue);
      setPrimaryInviteUserSortDirectionObj({
        ...primaryInviteUserSortDirectionObj,
        InviteUserLNameTypeSort: sortValue,
      });
      setCurrentPage(1);
      GetInviteUsersListData(1, searchKeyword, sortValue, InviteUserSort);
    }
  };

  const handleUserSort = (sortValue, UserSort) => {
    if (UserSort == "FirstName") {
      setPrimarySortDirectionUsers(sortValue);
      setPrimaryUserSortDirectionObj({
        ...primaryUserSortDirectionObj,
        UserNameTypeSort: sortValue,
      });
      setCurrentPage(1);
      // GetUsersListData(1, searchKeyword, sortValue, UserSort);
      GetUsersListData(
        1,
        searchKeywordUsers,
        countryId,
        roleType,
        fromDate,
        toDate,
        sortValue,
        UserSort,
      );
    } else if (UserSort == "RoleName") {
      setPrimarySortDirectionUsers(sortValue);
      setPrimaryUserSortDirectionObj({
        ...primaryUserSortDirectionObj,
        RoleTypeSort: sortValue,
      });
      setCurrentPage(1);
      // GetUsersListData(1, searchKeyword, sortValue, UserSort);
      GetUsersListData(
        1,
        searchKeywordUsers,
        countryId,
        roleType,
        fromDate,
        toDate,
        sortValue,
        UserSort,
      );
    } else if (UserSort == "Email") {
      setPrimarySortDirectionUsers(sortValue);
      setPrimaryUserSortDirectionObj({
        ...primaryUserSortDirectionObj,
        EmailTypeSort: sortValue,
      });
      setCurrentPage(1);
      // GetUsersListData(1, searchKeyword, sortValue, UserSort);
      GetUsersListData(
        1,
        searchKeywordUsers,
        countryId,
        roleType,
        fromDate,
        toDate,
        sortValue,
        UserSort,
      );
    } else if (UserSort == "LastName") {
      setPrimarySortDirectionUsers(sortValue);
      setPrimaryUserSortDirectionObj({
        ...primaryUserSortDirectionObj,
        UserLNameTypeSort: sortValue,
      });
      setCurrentPage(1);
      // GetUsersListData(1, searchKeyword, sortValue, UserSort);
      GetUsersListData(
        1,
        searchKeywordUsers,
        countryId,
        roleType,
        fromDate,
        toDate,
        sortValue,
        UserSort,
      );
    } else if (UserSort == "CountryName") {
      setPrimarySortDirectionUsers(sortValue);
      setPrimaryUserSortDirectionObj({
        ...primaryUserSortDirectionObj,
        RoleTypeSort: sortValue,
      });
      setCurrentPage(1);
      // GetUsersListData(1, searchKeyword, sortValue, UserSort);
      GetUsersListData(
        1,
        searchKeywordUsers,
        countryId,
        roleType,
        fromDate,
        toDate,
        sortValue,
        UserSort,
      );
    }
  };

  const HandleSearchInviteUser = (e) => {
    const searchKeywordValue = e.target.value;
    setSearchKeyword(searchKeywordValue);
    setCurrentPage(1);
    GetInviteUsersListData(1, searchKeywordValue);
  };

  const HandleSearchUsers = (e) => {
    const searchKeywordValue = e.target.value;
    setSearchKeywordUsers(searchKeywordValue);
    setCurrentPage(currentPage);
    GetUsersListData(
      currentPage,
      searchKeywordValue,
      countryId,
      roleType,
      fromDate,
      toDate,
      primarySortDirectionUsers,
      UserSortType,
    );
  };

  const handleClose = () => {
    $("#" + "ConfirmModel").modal("hide");
    setOpenSuccessModal(false);
    setOpenErrorModal(false);
  };

  const GetUserData = () => {
    setShowUserModal(true);
  };

  const userFun = () => {
    GetUsersListData(currentPageUsers);
    // setUsersPage(true);
  };
  //Filters
  const ApplyFilter = () => {
    if (
      (countryId !== null && countryId !== "") ||
      (roleType !== null && roleType !== "") ||
      (fromDate !== null && fromDate !== "") ||
      (toDate !== null && toDate !== "") ||
      (selectedOption !== "" && selectedOption !== null)
    ) {
      setIsFilterApply(true);
    } else {
      setIsFilterApply(false);
    }
    // const normalizedFromDate =
    //   fromDate === undefined || fromDate === "" ? null : fromDate;
    // const normalizedToDate =
    //   toDate === undefined || toDate === "" ? null : toDate;
    setCurrentPageUsers(1);
    GetUsersListData(
      1,
      searchKeyword,
      countryId,
      roleType,
      fromDate,
      toDate,
      primarySortDirectionUsers,
      UserSortType,
    );
  };
  const ClearFilter = () => {
    setCurrentPageUsers(1);
    setSelectedOption("");
    setIsFilterApply(false);
    setCountryId(null);
    setRoleType(null);
    setFromDate(null);
    setToDate(null);
    setPrimarySortDirectionUsers(null);
    setUserSortType(null);
    GetUsersListData(1, searchKeywordUsers, null, null, null, null, null, null);
    // console.log(fromDate,toDate);
  };
  //Design part :
  return (
    <div className="container-fluid users-list-redesign">
      <div className="users-redesign-page-header">
        <div>
          <h1>Users</h1>
          <p>Manage workspace users, invitations, roles and account access.</p>
        </div>
      </div>

      {/* <div class="main-content"> */}
      <div class="services page-background users-redesign-shell">
        <div class="">
          <div class="row">
            <div class="col-lg-12">
              <div class="card">
                {/* end card header  */}
                <div class="card-body mb-2">
                  <div id="customerList" style={{ marginTop: "3rem" }}>
                    <div className="users-tabs-panel">
                      <div className="users-tabs-panel-inner">
                        <ul
                          className="nav nav-tabs users-modern-tabs"
                          role="tablist"
                        >
                          <li className="nav-item">
                            <a
                              className="nav-link tab_nav active users-modern-tab"
                              data-bs-toggle="tab"
                              href="#base-justified-home"
                              role="tab"
                              aria-selected="false"
                              onClick={() => {
                                userFun();
                                setTabSelected("users");
                              }}
                            >
                              <span className="users-modern-tab-icon">
                                <i className="ri-group-line"></i>
                              </span>

                              <span className="users-modern-tab-copy">
                                <strong>Users</strong>
                                <small>Workspace users</small>
                              </span>

                              <span className="users-modern-tab-count">
                                {UserListCount > 0 ? UserListCount : 0}
                              </span>
                            </a>
                          </li>

                          <li className="nav-item">
                            <a
                              onClick={() => {
                                GetInviteUsersListData(1);
                                setTabSelected("invite");
                              }}
                              className="nav-link tab_nav users-modern-tab"
                              data-bs-toggle="tab"
                              href="#product"
                              role="tab"
                              aria-selected="false"
                            >
                              <span className="users-modern-tab-icon">
                                <i className="ri-user-add-line"></i>
                              </span>

                              <span className="users-modern-tab-copy">
                                <strong>Invite User</strong>
                                <small>Pending invitations</small>
                              </span>

                              <span className="users-modern-tab-count">
                                {listCount > 0 ? listCount : 0}
                              </span>
                            </a>
                          </li>
                        </ul>

                        {tabSelected === "users" && (
                          <div className="users-tabs-org-summary">
                            <span className="users-tabs-org-icon">
                              <i className="ri-building-4-line"></i>
                            </span>

                            <div>
                              <span>Organisations</span>
                              <strong>{orgCount > 0 ? orgCount : 0}</strong>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div class="">
                      <div class="row">
                        <div class="col-lg-12">
                          <div class="card ">
                            <div class="card-body">
                              <div id="customerList">
                                <div class="row g-4 mb-3"></div>

                                <div class="tab-content  text-muted">
                                  <div
                                    class="tab-pane active"
                                    id="base-justified-home"
                                    role="tabpanel"
                                  >
                                    <div class="table-responsive table-card mt-2 mb-3 table-padding">
                                      <div className="row align-items-center justify-content">
                                        <div className="search-box col-md-3 col-sm-4 width-searchbox mb-2">
                                          <i class="ri-search-line search-icon ps-2"></i>
                                          <input
                                            type="text"
                                            value={searchKeywordUsers}
                                            onChange={(e) => {
                                              HandleSearchUsers(e);
                                            }}
                                            className="form-control search"
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
                                        <div className="col-md-9 d-flex justify-content-end align-items-center flex-wrap gap-2">
                                          <div className="col-md-3 col-sm-4 mb-2">
                                            <div className="input-group">
                                              <Select
                                                className="phone-input-country-code selectDropDown Drop-down-width"
                                                classNamePrefix="users-select"
                                                placeholder="Select Country"
                                                options={countryNameListData}
                                                value={countryNameFilter}
                                                onChange={
                                                  handleSelectCountryChange
                                                }
                                                styles={{
                                                  option: (base) => ({
                                                    ...base,
                                                    cursor: "pointer",
                                                  }),
                                                }}
                                                isClearable
                                              />
                                            </div>
                                          </div>
                                          <div className="col-md-3 col-sm-4 mb-2">
                                            <div className="input-group">
                                              <Select
                                                className="phone-input-country-code selectDropDown Drop-down-width"
                                                classNamePrefix="users-select"
                                                placeholder="Select Role"
                                                options={UserRoleTypeLookupList}
                                                value={RoleTypeFilter}
                                                onChange={
                                                  handleSelectRoleTypeChange
                                                }
                                                styles={{
                                                  option: (base) => ({
                                                    ...base,
                                                    cursor: "pointer",
                                                  }),
                                                }}
                                                isClearable
                                              />
                                            </div>
                                          </div>
                                          <div className="col-md-3 col-sm-4 mb-2">
                                            <div className="input-group">
                                              <Select
                                                className="phone-input-country-code selectDropDown Drop-down-width"
                                                classNamePrefix="users-select"
                                                style={{ cursor: "pointer" }}
                                                placeholder="Date Filter"
                                                options={Utils.DateFilter}
                                                value={selectedOption}
                                                onChange={
                                                  handleActiveDateChange
                                                }
                                                styles={{
                                                  option: (base) => ({
                                                    ...base,
                                                    cursor: "pointer",
                                                  }),
                                                }}
                                                isClearable
                                              />
                                            </div>
                                          </div>
                                          <div className="d-flex justify-content align-items-center gap-2 mb-2">
                                            <button
                                              className="btn btn-md btn-success create-item-btn"
                                              onClick={ApplyFilter}
                                            >
                                              <span>Apply Filter</span>
                                            </button>
                                            {isFilterApply && (
                                              <button
                                                className="btn btn-md btn-success create-item-btn"
                                                onClick={ClearFilter}
                                              >
                                                <span>Clear Filter</span>
                                              </button>
                                            )}
                                          </div>
                                        </div>
                                      </div>

                                      <table
                                        class="table align-middle"
                                        id="customerTable"
                                      >
                                        <thead class="table-light table-header-font">
                                          <tr className="head-row">
                                            <td
                                              className="tr-table-class text-white"
                                              style={{ width: "11%" }}
                                            >
                                              First Name{" "}
                                              {primaryUserSortDirectionObj.UserNameTypeSort ===
                                                "desc" && (
                                                <i
                                                  onClick={() => {
                                                    setUserSortType(
                                                      "FirstName",
                                                    );
                                                    handleUserSort(
                                                      "asc",
                                                      "FirstName",
                                                    );
                                                  }}
                                                  style={{ cursor: "pointer" }}
                                                  class="fas fa-sort-alpha-up ml-1"
                                                ></i>
                                              )}
                                              {(primaryUserSortDirectionObj.UserNameTypeSort ===
                                                null ||
                                                primaryUserSortDirectionObj.UserNameTypeSort ===
                                                  "asc") && (
                                                <i
                                                  onClick={() => {
                                                    setUserSortType(
                                                      "FirstName",
                                                    );
                                                    handleUserSort(
                                                      primaryUserSortDirectionObj.UserNameTypeSort ===
                                                        null
                                                        ? "asc"
                                                        : "desc",
                                                      "FirstName",
                                                    );
                                                  }}
                                                  style={{ cursor: "pointer" }}
                                                  class="fas fa-sort-alpha-down ml-1"
                                                ></i>
                                              )}
                                            </td>
                                            <td
                                              style={{ width: "12%" }}
                                              className="tr-table-class text-white"
                                            >
                                              Last Name{" "}
                                              {primaryUserSortDirectionObj.UserLNameTypeSort ===
                                                "desc" && (
                                                <i
                                                  onClick={() => {
                                                    setUserSortType("LastName");
                                                    handleUserSort(
                                                      "asc",
                                                      "LastName",
                                                    );
                                                  }}
                                                  style={{ cursor: "pointer" }}
                                                  class="fas fa-sort-alpha-up ml-1"
                                                ></i>
                                              )}
                                              {(primaryUserSortDirectionObj.UserLNameTypeSort ===
                                                null ||
                                                primaryUserSortDirectionObj.UserLNameTypeSort ===
                                                  "asc") && (
                                                <i
                                                  onClick={() => {
                                                    setUserSortType("LastName");
                                                    handleUserSort(
                                                      primaryUserSortDirectionObj.UserLNameTypeSort ===
                                                        null
                                                        ? "asc"
                                                        : "desc",
                                                      "LastName",
                                                    );
                                                  }}
                                                  style={{ cursor: "pointer" }}
                                                  class="fas fa-sort-alpha-down ml-1"
                                                ></i>
                                              )}
                                            </td>
                                            <td
                                              style={{ width: "10%" }}
                                              className="tr-table-class text-white"
                                            >
                                              Email{" "}
                                              {primaryUserSortDirectionObj.EmailTypeSort ===
                                                "desc" && (
                                                <i
                                                  onClick={() => {
                                                    setUserSortType("Email");
                                                    handleUserSort(
                                                      "asc",
                                                      "Email",
                                                    );
                                                  }}
                                                  style={{ cursor: "pointer" }}
                                                  class="fas fa-sort-alpha-up ml-1"
                                                ></i>
                                              )}
                                              {(primaryUserSortDirectionObj.EmailTypeSort ===
                                                null ||
                                                primaryUserSortDirectionObj.EmailTypeSort ===
                                                  "asc") && (
                                                <i
                                                  onClick={() => {
                                                    setUserSortType("Email");
                                                    handleUserSort(
                                                      primaryUserSortDirectionObj.EmailTypeSort ===
                                                        null
                                                        ? "asc"
                                                        : "desc",
                                                      "Email",
                                                    );
                                                  }}
                                                  style={{ cursor: "pointer" }}
                                                  class="fas fa-sort-alpha-down ml-1"
                                                ></i>
                                              )}
                                            </td>
                                            <td
                                              style={{ width: "13%" }}
                                              className="tr-table-class text-white"
                                            >
                                              Phone Number{" "}
                                            </td>
                                            <td
                                              style={{ width: "15%" }}
                                              className="tr-table-class text-white"
                                            >
                                              Organisations
                                            </td>
                                            <td
                                              className="tr-table-class text-white"
                                              style={{ width: "10%" }}
                                            >
                                              Role{" "}
                                              {primaryUserSortDirectionObj.RoleTypeSort ===
                                                "desc" && (
                                                <i
                                                  onClick={() => {
                                                    setUserSortType("RoleName");
                                                    setPrimaryInviteUserSortDirectionObj(
                                                      "asc",
                                                    );
                                                    handleUserSort(
                                                      "asc",
                                                      "RoleName",
                                                    );
                                                  }}
                                                  style={{ cursor: "pointer" }}
                                                  class="fas fa-sort-alpha-up ml-1"
                                                ></i>
                                              )}
                                              {(primaryUserSortDirectionObj.RoleTypeSort ===
                                                null ||
                                                primaryUserSortDirectionObj.RoleTypeSort ===
                                                  "asc") && (
                                                <i
                                                  onClick={() => {
                                                    setUserSortType("RoleName");
                                                    handleUserSort(
                                                      primaryUserSortDirectionObj.RoleTypeSort ===
                                                        null
                                                        ? "asc"
                                                        : "desc",
                                                      "RoleName",
                                                    );
                                                  }}
                                                  style={{ cursor: "pointer" }}
                                                  class="fas fa-sort-alpha-down ml-1"
                                                ></i>
                                              )}
                                            </td>
                                            <td
                                              style={{ width: "11%" }}
                                              className="tr-table-class text-white"
                                            >
                                              Country Name
                                              {primaryUserSortDirectionObj.RoleTypeSort ===
                                                "desc" && (
                                                <i
                                                  onClick={() => {
                                                    setUserSortType(
                                                      "CountryName",
                                                    );
                                                    setPrimaryInviteUserSortDirectionObj(
                                                      "asc",
                                                    );
                                                    handleUserSort(
                                                      "asc",
                                                      "CountryName",
                                                    );
                                                  }}
                                                  style={{ cursor: "pointer" }}
                                                  class="fas fa-sort-alpha-up ml-1"
                                                ></i>
                                              )}
                                              {(primaryUserSortDirectionObj.RoleTypeSort ===
                                                null ||
                                                primaryUserSortDirectionObj.RoleTypeSort ===
                                                  "asc") && (
                                                <i
                                                  onClick={() => {
                                                    setUserSortType(
                                                      "CountryName",
                                                    );
                                                    handleUserSort(
                                                      primaryUserSortDirectionObj.RoleTypeSort ===
                                                        null
                                                        ? "asc"
                                                        : "desc",
                                                      "CountryName",
                                                    );
                                                  }}
                                                  style={{ cursor: "pointer" }}
                                                  class="fas fa-sort-alpha-down ml-1"
                                                ></i>
                                              )}
                                            </td>
                                            <td
                                              style={{ width: "10%" }}
                                              className="tr-table-class text-white"
                                            >
                                              Status
                                            </td>
                                            <td
                                              style={{ width: "10%" }}
                                              className="tr-table-class text-white"
                                            >
                                              {(userAccessData.User_CanDelete ||
                                                userAccessData.User_CanEdit) && (
                                                <>Action</>
                                              )}
                                            </td>
                                          </tr>
                                        </thead>
                                        <tbody class="list form-check-all">
                                          {usersList
                                            .slice(
                                              0,
                                              isMobile
                                                ? isMobileRecords
                                                : desktopRecords,
                                            )
                                            .map((users) => {
                                              return (
                                                <tr class="table_new table-content-font">
                                                  <td
                                                    style={{ width: "10%" }}
                                                    className="table-content-font"
                                                  >
                                                    {users.firstName &&
                                                    users.firstName?.length >
                                                      15 ? (
                                                      <Tooltip
                                                        title={users.firstName}
                                                      >
                                                        {users.firstName
                                                          ?.substring(0, 15)
                                                          .toLowerCase()
                                                          .replace(
                                                            /\b\w/g,
                                                            (l) =>
                                                              l.toUpperCase(),
                                                          ) + "..."}
                                                      </Tooltip>
                                                    ) : (
                                                      users.firstName
                                                        ?.toLowerCase()
                                                        .replace(/\b\w/g, (l) =>
                                                          l.toUpperCase(),
                                                        )
                                                    )}
                                                  </td>
                                                  <td
                                                    style={{ width: "10%" }}
                                                    className="table-content-font"
                                                  >
                                                    {users.lastName &&
                                                    users.lastName?.length >
                                                      15 ? (
                                                      <Tooltip
                                                        title={users.lastName}
                                                      >
                                                        {users.lastName
                                                          ?.substring(0, 15)
                                                          .toLowerCase()
                                                          .replace(
                                                            /\b\w/g,
                                                            (l) =>
                                                              l.toUpperCase(),
                                                          ) + "..."}
                                                      </Tooltip>
                                                    ) : (
                                                      users.lastName
                                                        ?.toLowerCase()
                                                        .replace(/\b\w/g, (l) =>
                                                          l.toUpperCase(),
                                                        )
                                                    )}
                                                  </td>
                                                  <td
                                                    style={{ width: "10%" }}
                                                    className="table-content-font"
                                                  >
                                                    {users.email &&
                                                    users.email.length > 20 ? (
                                                      <Tooltip
                                                        title={users.email}
                                                      >
                                                        {users.email.substring(
                                                          0,
                                                          20,
                                                        ) + "..."}
                                                      </Tooltip>
                                                    ) : (
                                                      users.email
                                                    )}
                                                  </td>
                                                  <td
                                                    style={{ width: "10%" }}
                                                    className="table-content-font"
                                                  >
                                                    {users.phoneNumber &&
                                                    users.phoneNumber.length >
                                                      15 ? (
                                                      <Tooltip
                                                        title={
                                                          users.phoneNumber
                                                        }
                                                      >
                                                        {users.phoneNumber.substring(
                                                          0,
                                                          15,
                                                        ) + "..."}
                                                      </Tooltip>
                                                    ) : (
                                                      users.phoneNumber
                                                    )}
                                                  </td>
                                                  <td
                                                    style={{ width: "15%" }}
                                                    className="table-content-font"
                                                  >
                                                    {users.organisationNames &&
                                                    users.organisationNames
                                                      .length > 20 ? (
                                                      <Tooltip
                                                        title={
                                                          users.organisationNames
                                                        }
                                                      >
                                                        {users.organisationNames.substring(
                                                          0,
                                                          20,
                                                        ) + "..."}
                                                      </Tooltip>
                                                    ) : (
                                                      users.organisationNames
                                                    )}
                                                  </td>
                                                  <td
                                                    style={{ width: "10%" }}
                                                    className="table-content-font"
                                                  >
                                                    {users.roleName &&
                                                    users.roleName.length >
                                                      15 ? (
                                                      <Tooltip
                                                        title={users.roleName}
                                                      >
                                                        {users.roleName
                                                          .substring(0, 15)
                                                          .toLowerCase()
                                                          .replace(
                                                            /\b\w/g,
                                                            (l) =>
                                                              l.toUpperCase(),
                                                          ) + "..."}
                                                      </Tooltip>
                                                    ) : (
                                                      users.roleName
                                                        .toLowerCase()
                                                        .replace(/\b\w/g, (l) =>
                                                          l.toUpperCase(),
                                                        )
                                                    )}
                                                  </td>
                                                  <td
                                                    style={{ width: "10%" }}
                                                    className="table-content-font"
                                                  >
                                                    {users.countryName &&
                                                    users.countryName.length >
                                                      16 ? (
                                                      <Tooltip
                                                        title={
                                                          users.countryName
                                                        }
                                                      >
                                                        {users.countryName.substring(
                                                          0,
                                                          16,
                                                        ) + "..."}
                                                      </Tooltip>
                                                    ) : (
                                                      users.countryName
                                                    )}
                                                  </td>
                                                  <td
                                                    style={{ width: "10%" }}
                                                    className="Switch table-content-font"
                                                  >
                                                    <div
                                                      style={{
                                                        alignItems: "none",
                                                        marginLeft:
                                                          userAccessData.User_CanEdit
                                                            ? ""
                                                            : "10px",
                                                      }}
                                                      class="d-flex gap-2 "
                                                    >
                                                      <div
                                                        style={{
                                                          width: "45px",
                                                        }}
                                                      >
                                                        {users.statusName &&
                                                        users.statusName
                                                          .length > 15 ? (
                                                          <Tooltip
                                                            title={
                                                              users.statusName
                                                            }
                                                          >
                                                            {users.statusName.substring(
                                                              0,
                                                              15,
                                                            ) + "..."}
                                                          </Tooltip>
                                                        ) : (
                                                          users.statusName
                                                        )}{" "}
                                                      </div>
                                                      {userAccessData.User_CanDelete && (
                                                        <Tooltip
                                                          title={getCrudButtonToolTipName(
                                                            "Change Status",
                                                          )}
                                                        >
                                                          <FormGroup>
                                                            <FormControlLabel
                                                              control={
                                                                <Android12Switch
                                                                  onClick={() => {
                                                                    setModelRequestData(
                                                                      {
                                                                        ...modelRequestData,
                                                                        status:
                                                                          users.statusName,
                                                                        userName:
                                                                          users.firstName,
                                                                        inviteUserKeyID:
                                                                          users.userKeyID,
                                                                        Action:
                                                                          "Status",
                                                                        user: "User",
                                                                      },
                                                                    );
                                                                  }}
                                                                  checked={
                                                                    users.statusName ===
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
                                                  <td
                                                    style={{ width: "5%" }}
                                                    className="table-content-font"
                                                  >
                                                    <div class="d-flex gap-2">
                                                      {userAccessData.User_CanEdit && (
                                                        <Tooltip
                                                          title={getCrudButtonToolTipName(
                                                            "Update",
                                                            moduleName,
                                                          )}
                                                        >
                                                          <div class="edit">
                                                            <a
                                                              data-bs-toggle="modal"
                                                              data-bs-target="#InviteUserEditUser"
                                                              onClick={() => {
                                                                setShowUserModal(
                                                                  true,
                                                                );
                                                                setModelRequestData(
                                                                  {
                                                                    ...modelRequestData,
                                                                    userKeyID:
                                                                      users.userKeyID,
                                                                    Edit: false,
                                                                    Action:
                                                                      "Update",
                                                                  },
                                                                );
                                                              }}
                                                              style={{
                                                                cursor:
                                                                  "pointer",
                                                              }}
                                                              class="btn btn-sm btn-success edit-item-btn actionButtonsStyle"
                                                            >
                                                              <i class="ri-pencil-fill"></i>
                                                            </a>
                                                          </div>
                                                        </Tooltip>
                                                      )}
                                                      {userAccessData.User_CanDelete && (
                                                        <Tooltip
                                                          title={"Delete User"}
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
                                                                    userName:
                                                                      users.firstName,
                                                                    inviteUserKeyID:
                                                                      users.userKeyID,
                                                                    status:
                                                                      users.statusName,
                                                                    Action:
                                                                      "Delete",
                                                                    user: "User",
                                                                  },
                                                                )
                                                              }
                                                            >
                                                              <i class="ri-delete-bin-5-fill"></i>
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
                                      <UserModelNew
                                        id="InviteUserEditUser"
                                        class="modal fade"
                                        // id="addUpdateModal"
                                        tabIndex="-1"
                                        aria_labelledby="exampleModalLabel"
                                        aria_hidden="true"
                                        open={showUserModal}
                                        setShowUserModal={setShowUserModal}
                                        Edit={modelRequestData.Edit}
                                        UserKeyID={modelRequestData.userKeyID}
                                        setIsAddUpdateActionDone={
                                          setIsAddUpdateActionDone
                                        }
                                      />

                                      {totalRecords <= 0 && (
                                        <NoResultFoundModel
                                          name="Users"
                                          totalRecords={totalRecords}
                                        />
                                      )}
                                    </div>
                                  </div>

                                  <div
                                    class="tab-pane"
                                    id="product"
                                    role="tabpanel"
                                  >
                                    <div class="table-responsive table-card mt-2 mb-3 table-padding">
                                      <div className="row align-items-center justify-content">
                                        <div class="col-md-6 col-6">
                                          <div className="search-box col-md-6 col-sm-4 width-searchbox mb-2">
                                            <i
                                              class="ri-search-line search-icon pe-5"
                                              style={{ marginLeft: "-5px" }}
                                            ></i>
                                            <input
                                              type="text"
                                              value={searchKeyword}
                                              onChange={(e) => {
                                                HandleSearchInviteUser(e);
                                              }}
                                              className="form-control search"
                                              placeholder={
                                                isMobile
                                                  ? "Search"
                                                  : getPlaceholderTextName(
                                                      "Search",
                                                      "Invite User",
                                                    )
                                              }
                                            />
                                          </div>
                                        </div>
                                        <div class="col-md-6 col-6">
                                          <div className="d-flex justify-content-sm-end add-new-btn">
                                            {userAccessData.User_CanAdd && (
                                              <CommonButtonComponent
                                                title={getCrudButtonToolTipName(
                                                  "Invite",
                                                  moduleName,
                                                )}
                                                dataBsTarget="#addUpdateModal"
                                                data_bs_toggle="modal"
                                                name={getCrudButtonTextName(
                                                  "Invite",
                                                  moduleName,
                                                )}
                                                AddBtn={() =>
                                                  UsersAddBtnClicked()
                                                }
                                              />
                                            )}
                                          </div>
                                        </div>
                                      </div>

                                      <table
                                        class="table align-middle table-nowrap"
                                        style={{ overflow: "auto" }}
                                        id="customerTable"
                                      >
                                        <thead class="table-light table-header-font">
                                          <tr className="head-row">
                                            <td
                                              className="tr-table-class text-white"
                                              style={{ width: "30%" }}
                                            >
                                              First Name{" "}
                                              {primaryInviteUserSortDirectionObj.InviteUserNameTypeSort ===
                                                "desc" && (
                                                <i
                                                  onClick={() => {
                                                    setInviteUserSortType(
                                                      "FirstName",
                                                    );
                                                    handleInviteSort(
                                                      "asc",
                                                      "FirstName",
                                                    );
                                                  }}
                                                  style={{ cursor: "pointer" }}
                                                  class="fas fa-sort-alpha-up ml-1"
                                                ></i>
                                              )}
                                              {(primaryInviteUserSortDirectionObj.InviteUserNameTypeSort ===
                                                null ||
                                                primaryInviteUserSortDirectionObj.InviteUserNameTypeSort ===
                                                  "asc") && (
                                                <i
                                                  onClick={() => {
                                                    setInviteUserSortType(
                                                      "FirstName",
                                                    );
                                                    handleInviteSort(
                                                      primaryInviteUserSortDirectionObj.InviteUserNameTypeSort ===
                                                        null
                                                        ? "asc"
                                                        : "desc",
                                                      "FirstName",
                                                    );
                                                  }}
                                                  style={{ cursor: "pointer" }}
                                                  class="fas fa-sort-alpha-down ml-1"
                                                ></i>
                                              )}
                                            </td>
                                            <td
                                              className="tr-table-class text-white"
                                              style={{ width: "30%" }}
                                            >
                                              Last Name{" "}
                                            </td>
                                            <td className="tr-table-class text-white">
                                              Email{" "}
                                              {primaryInviteUserSortDirectionObj.InviteEmailTypeSort ===
                                                "desc" && (
                                                <i
                                                  onClick={() => {
                                                    setInviteUserSortType(
                                                      "Email",
                                                    );
                                                    handleInviteSort(
                                                      "asc",
                                                      "Email",
                                                    );
                                                  }}
                                                  style={{ cursor: "pointer" }}
                                                  class="fas fa-sort-alpha-up ml-1"
                                                ></i>
                                              )}
                                              {(primaryInviteUserSortDirectionObj.InviteEmailTypeSort ===
                                                null ||
                                                primaryInviteUserSortDirectionObj.InviteEmailTypeSort ===
                                                  "asc") && (
                                                <i
                                                  onClick={() => {
                                                    setInviteUserSortType(
                                                      "Email",
                                                    );
                                                    handleInviteSort(
                                                      primaryInviteUserSortDirectionObj.InviteEmailTypeSort ===
                                                        null
                                                        ? "asc"
                                                        : "desc",
                                                      "Email",
                                                    );
                                                  }}
                                                  style={{ cursor: "pointer" }}
                                                  class="fas fa-sort-alpha-down ml-1"
                                                ></i>
                                              )}
                                            </td>
                                            <td className="tr-table-class text-white">
                                              Role{" "}
                                              {primaryInviteUserSortDirectionObj.InviteRoleTypeSort ===
                                                "desc" && (
                                                <i
                                                  onClick={() => {
                                                    setInviteUserSortType(
                                                      "RoleName",
                                                    );
                                                    handleInviteSort(
                                                      "asc",
                                                      "RoleName",
                                                    );
                                                  }}
                                                  style={{ cursor: "pointer" }}
                                                  class="fas fa-sort-alpha-up ml-1"
                                                ></i>
                                              )}
                                              {(primaryInviteUserSortDirectionObj.InviteRoleTypeSort ===
                                                null ||
                                                primaryInviteUserSortDirectionObj.InviteRoleTypeSort ===
                                                  "asc") && (
                                                <i
                                                  onClick={() => {
                                                    setInviteUserSortType(
                                                      "RoleName",
                                                    );
                                                    handleInviteSort(
                                                      primaryInviteUserSortDirectionObj.InviteRoleTypeSort ===
                                                        null
                                                        ? "asc"
                                                        : "desc",
                                                      "RoleName",
                                                    );
                                                  }}
                                                  style={{ cursor: "pointer" }}
                                                  class="fas fa-sort-alpha-down ml-1"
                                                ></i>
                                              )}
                                            </td>
                                            <td className="tr-table-class  text-white">
                                              Acceptance Status{" "}
                                              {primaryInviteUserSortDirectionObj.InviteAcceptanceStatusTypeSort ===
                                                "desc" && (
                                                <i
                                                  onClick={() => {
                                                    setInviteUserSortType(
                                                      "AcceptanceStatus",
                                                    );
                                                    handleInviteSort(
                                                      "asc",
                                                      "AcceptanceStatus",
                                                    );
                                                  }}
                                                  style={{ cursor: "pointer" }}
                                                  class="fas fa-sort-alpha-up ml-1"
                                                ></i>
                                              )}
                                              {(primaryInviteUserSortDirectionObj.InviteAcceptanceStatusTypeSort ===
                                                null ||
                                                primaryInviteUserSortDirectionObj.InviteAcceptanceStatusTypeSort ===
                                                  "asc") && (
                                                <i
                                                  onClick={() => {
                                                    setInviteUserSortType(
                                                      "AcceptanceStatus",
                                                    );
                                                    handleInviteSort(
                                                      primaryInviteUserSortDirectionObj.InviteAcceptanceStatusTypeSort ===
                                                        null
                                                        ? "asc"
                                                        : "desc",
                                                      "AcceptanceStatus",
                                                    );
                                                  }}
                                                  style={{ cursor: "pointer" }}
                                                  class="fas fa-sort-alpha-down ml-1"
                                                ></i>
                                              )}
                                            </td>
                                            {/* <td className="tr-table-class text-white">
                                    Status
                                  </td> */}
                                            <td className="tr-table-class text-white">
                                              {userAccessData.User_CanDelete && (
                                                <>Action</>
                                              )}
                                            </td>
                                          </tr>
                                        </thead>
                                        <tbody class="list form-check-all">
                                          {inviteUsersList
                                            .slice(
                                              0,
                                              isMobile
                                                ? isMobileRecords
                                                : desktopRecords,
                                            )
                                            .map((users) => {
                                              return (
                                                <tr class="table_new">
                                                  <td className="table-content-font">
                                                    {users.firstName}
                                                  </td>
                                                  <td className="table-content-font">
                                                    {users.lastName}
                                                  </td>
                                                  <td className="table-content-font">
                                                    <Tooltip
                                                      title={users.email}
                                                    >
                                                      {users.email}
                                                    </Tooltip>
                                                  </td>
                                                  <td className="table-content-font">
                                                    {users.roleName}
                                                  </td>
                                                  <td
                                                    className={`table-content-font ${
                                                      !userAccessData.User_CanDelete
                                                        ? "text-center"
                                                        : ""
                                                    }`}
                                                  >
                                                    {users.acceptanceStatus}
                                                  </td>

                                                  <td className="switch">
                                                    <div class="d-flex gap-2">
                                                      {userAccessData.User_CanDelete && (
                                                        <Tooltip
                                                          title={"Delete User"}
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
                                                                    userName:
                                                                      users.firstName,
                                                                    inviteUserKeyID:
                                                                      users.inviteUserKeyID,
                                                                    status:
                                                                      users.statusName,
                                                                    user: "Invite User",
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
                                                      )}
                                                    </div>
                                                  </td>
                                                </tr>
                                              );
                                            })}
                                        </tbody>
                                      </table>

                                      {totalRecords <= 0 && (
                                        <NoResultFoundModel
                                          name={moduleName}
                                          totalRecords={totalRecords}
                                        />
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="users-pagination-outside">
                        {tabSelected === "users" &&
                          UserListCount > pageSize && (
                            <PaginationComponent
                              totalCount={UserListCount}
                              totalPages={totalUserPage}
                              currentPage={currentPageUsers}
                              onPageChange={HandlePageChangeUsers}
                            />
                          )}

                        {tabSelected === "invite" && listCount > pageSize && (
                          <PaginationComponent
                            totalCount={listCount}
                            totalPages={totalPage}
                            currentPage={currentPage}
                            onPageChange={HandlePageChange}
                          />
                        )}
                      </div>

                      <ErrorModel
                        ErrorModel={openErrorModal}
                        handleClose={handleClose}
                        ErrorMessage={
                          !formattedErrorMessage
                            ? "Something Went Wrong"
                            : formattedErrorMessage
                        }
                      />
                      {/* Confirm Modal  */}
                      <ConfirmModel
                        handleClose={handleClose}
                        openErrorModal={openErrorModal}
                        openSuccessModal={openSuccessModal}
                        modelRequestData={modelRequestData}
                        UpdatedStatus={InviteUserChangeStatusData}
                      />

                      {/* Success Modal  */}
                      <SuccessModal
                        handleClose={handleClose}
                        setOpenSuccessModal={setOpenSuccessModal}
                        openSuccessModal={openSuccessModal}
                        modelAction={modelRequestData.Action}
                        message={`${
                          modelRequestData.Action === "Delete"
                            ? `${modelRequestData.user} ${modelRequestData.userName}`
                            : "Status has been changed successfully!"
                        }`}
                      />

                      <RecordsAvailablePopupModel
                        handleClose={handleClose}
                        openErrorModal={openErrorModal}
                        openSuccessModal={openSuccessModal}
                        modelRequestData={modelRequestData}
                        UpdatedStatus={InviteUserChangeStatusData}
                      />
                      {/* Modal  */}
                      <UsersModel
                        class="modal fade"
                        id="addUpdateModal"
                        tabIndex="-1"
                        aria_labelledby="exampleModalLabel"
                        aria_hidden="true"
                        setIsAddUpdateActionDone={setIsAddUpdateActionDone}
                        modelRequestData={modelRequestData}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* start back-to-top */}
      <button
        onclick="topFunction()"
        class="btn btn-danger btn-icon"
        id="back-to-top"
      >
        <i class="ri-arrow-up-line"></i>
      </button>
      {/* end back-to-top */}
      <div className="users-footer-wrap">
        <Footer />
      </div>
    </div>
  );
};

export default InviteUser;
