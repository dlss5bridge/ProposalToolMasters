/* global $ */
import React, { useContext, useEffect, useState } from "react";
import "./UsersStyle.css";
import { useDispatch, useSelector } from "react-redux";
import PaginationComponent from "../../../components/PaginationModel";
import CommonButtonComponent from "../../../components/CommonButtonComponent";
import UsersModel from "./UsersModel";
import {
  DeleteUser,
  GetInviteUsersList,
  UserChangeStatus,
} from "../../../redux/Services/Setting/InviteUserApi";
import ConfirmModel from "../../../components/ConfirmationBox";
import { Tooltip } from "@mui/material";
import NoResultFoundModel from "../../../components/NoResultFoundModel";
import { AuthContextProvider } from "../../../AuthContext/AuthContext";
import ErrorModel from "../../../components/ErrorModel";
import SuccessModal from "../../../components/SuccessModal";
import Footer from "../../../components/Footer";
import { useNavigate } from "react-router-dom";
import { resetState, updateState } from "../../../redux/Persist";
import { GetOrganisationLookupList } from "../../../redux/Services/Master/OrganisationLookupList";

const UsersList = () => {
  let getUsersListApiCallCount = 0;
  const moduleName = "User";
  // A] States Declaration :
  const [usersList, setUsersList] = useState([]);
  const [modelRequestData, setModelRequestData] = useState({
    userName: null,
    InviteUserKeyID: null,
    Action: null,
    userKeyID: null,
  });
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");
  const [isAddUpdateActionDone, setIsAddUpdateActionDone] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const common = useSelector((state) => state.Storage); //Getting Logged Users Details From Persist Storage of redux hooks
  const [primarySortDirectionUsers, setPrimarySortDirectionUsers] =
    useState(null);
  const [searchKeyword, setSearchKeyword] = useState("");
  const {
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
  } = useContext(AuthContextProvider);
  const [openErrorModal, setOpenErrorModal] = useState(false);
  const [openSuccessModal, setOpenSuccessModal] = React.useState(false);
  const [primaryUserSortDirectionObj, setPrimaryUserSortDirectionObj] =
    useState({
      UserNameTypeSort: null,
      LastNameTypeSort: null,
      RoleTypeSort: null,
      AcceptanceStatusTypeSort: null,
    });
  const [UserSortType, setUserSortType] = useState("");
  const dispatch = useDispatch();
  const [totalRecords, setTotalRecords] = useState(-1);
  // B] Initial useEffect :
  // 1) Will Call Initial Api Like List Api
  useEffect(() => {
    setTopbar("block");
  }, []);

  useEffect(() => {
    GetUsersListData(1);
  }, [common.organisationKeyID]);

  //2) This useEffect will trigger when we successfully add or update record from popup model
  useEffect(() => {
    if (isAddUpdateActionDone) {
      if (modelRequestData.Action === null) {
        setSearchKeyword("");
        setPrimarySortDirectionUsers(null);
        setCurrentPage(1);
        GetUsersListData(1, null, null);
      } else {
        GetUsersListData(currentPage);
      }

      setIsAddUpdateActionDone(false);
    }
  }, [isAddUpdateActionDone]);

  // C] Calling All Api's like List and other Here :
  // 1) Get Users List Data
  const GetUsersListData = async (
    i,
    searchKeywordValue,
    sortValue,
    InviteUserSort,
  ) => {
    setLoader(true);
    const pageNoList = i - 1;
    try {
      const data = await GetInviteUsersList({
        pageSize: 10,
        pageNo: pageNoList,
        organisationKeyID: common.organisationKeyID,
        searchKeyword:
          searchKeywordValue === undefined ? searchKeyword : searchKeywordValue,
        primarySortDirection:
          sortValue === undefined ? primarySortDirectionUsers : sortValue,
        PrimarySortColumnName:
          UserSortType == "" ? InviteUserSort : UserSortType,
      });
      if (data) {
        if (data?.data?.statusCode === 200) {
          setLoader(false);
          getUsersListApiCallCount = 0;
          if (data?.data?.responseData?.data) {
            const totalCount = data.data.totalCount;
            const UsersListData = data.data.responseData.data;
            if (pageNoList > 0 && UsersListData.length === 0) {
              let newPaneNo = Number(pageNoList);
              if (newPaneNo > 1) {
                newPaneNo = newPaneNo - 1;
              }
              GetUsersListData(
                newPaneNo,
                searchKeywordValue,
                sortValue,
                InviteUserSort,
              );
              setCurrentPage(pageNoList);
              return;
            }
            setListCount(totalCount);
            setUsersList(UsersListData);
            setTotalRecords(UsersListData.length);
          }
        } else {
          if (getUsersListApiCallCount < maxCountToRecallApi) {
            getUsersListApiCallCount += 1;
            setTimeout(function () {
              GetUsersListData(
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

  // E] Event Handling Functions will call here.
  // 1) On Click Users Add Button
  const UsersAddBtnClicked = (users) => {
    {
      setModelRequestData({
        ...modelRequestData,
        InviteUserKeyID: null,
        Action: null,
      });
    }
  };
  // 2) On Click Users Edit Button
  const UsersEditBtnClicked = (users) => {
    {
      setModelRequestData({
        ...modelRequestData,
        Action: "Update",
        inviteUserKeyID: users.inviteUserKeyID,
      });
    }
  };

  // 2) On Click Users Delete Button
  const DeleteUserData = async () => {
    setLoader(true);
    try {
      const Data = await DeleteUser(
        modelRequestData.InviteUserKeyID,
        modelRequestData.userKeyID,
      );
      if (Data) {
        setLoader(false);
        if (Data?.data?.statusCode === 200) {
          localStorage.removeItem("OrganisationLocalList");
          $("#" + "ConfirmModel").one("hidden.bs.modal", () => {
            setOpenSuccessModal(true);
          });
          $("#" + "ConfirmModel").modal("hide");
        } else {
          setErrorMessage(Data?.response?.data?.errors?.InviteUserKeyID[0]);
          setOpenErrorModal(true);
        }
        GetUsersListData(currentPage);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // F] Pagination :
  const HandlePageChange = async (pageNumber) => {
    setCurrentPage(pageNumber);
    await GetUsersListData(pageNumber); // Call your function with the selected page number
  };

  // E] Sorting & handle Function
  const handleUserSort = (sortValue, UserSort) => {
    if (UserSort == "FirstName") {
      setPrimarySortDirectionUsers(sortValue);
      setPrimaryUserSortDirectionObj({
        ...primaryUserSortDirectionObj,
        UserNameTypeSort: sortValue,
      });
      setCurrentPage(1);
      GetUsersListData(1, searchKeyword, sortValue, UserSort);
    } else if (UserSort == "LastName") {
      setPrimarySortDirectionUsers(sortValue);
      setPrimaryUserSortDirectionObj({
        ...primaryUserSortDirectionObj,
        LastNameTypeSort: sortValue,
      });
      setCurrentPage(1);
      GetUsersListData(1, searchKeyword, sortValue, UserSort);
    } else if (UserSort == "RoleName") {
      setPrimarySortDirectionUsers(sortValue);
      setPrimaryUserSortDirectionObj({
        ...primaryUserSortDirectionObj,
        RoleTypeSort: sortValue,
      });
      setCurrentPage(1);
      GetUsersListData(1, searchKeyword, sortValue, UserSort);
    } else if (UserSort == "AcceptanceStatus") {
      setPrimarySortDirectionUsers(sortValue);
      setPrimaryUserSortDirectionObj({
        ...primaryUserSortDirectionObj,
        AcceptanceStatusTypeSort: sortValue,
      });
      setCurrentPage(1);
      GetUsersListData(1, searchKeyword, sortValue, UserSort);
    }
  };
  const HandleSearch = (e) => {
    const searchKeywordValue = e.target.value;
    setSearchKeyword(searchKeywordValue);
    setCurrentPage(1);
    GetUsersListData(1, searchKeywordValue);
  };

  const handleClose = () => {
    $("#" + "ConfirmModel").modal("hide");
    const navigateAndRefresh = async () => {
      setLoader(true);

      const response = await GetOrganisationLookupList(common.userKeyID);
      const OrganisationsListData = response.data.responseData.data;
      setLoader(false);
      let ExistOrganisation = OrganisationsListData?.filter(
        (item) =>
          item.organisationKeyID?.toUpperCase() ===
          common.organisationKeyID?.toUpperCase(),
      );
      if (OrganisationsListData.length === 0) {
        localStorage.removeItem("userThemeSettingLocalStorage");
        localStorage.removeItem("accessCount");
        localStorage.removeItem("userAccess");
        localStorage.removeItem("subscriptionPlan");
        dispatch(resetState());
        navigate("/login");
      } else if (ExistOrganisation.length !== 0) {
        dispatch(
          updateState({
            businessTypeID: common.businessTypeID,
            organisationKeyID: common.organisationKeyID,
            professionTypeLists: common.professionTypeLists,
            organisationCount: ExistOrganisation.length,
          }),
        );
      } else {
        localStorage.removeItem("OrganisationLocalList");
        localStorage.removeItem("userThemeSettingLocalStorage");
        localStorage.removeItem("accessCount");
        localStorage.removeItem("userAccess");
        localStorage.removeItem("subscriptionPlan");
        dispatch(
          updateState({
            businessTypeID: "",
            organisationKeyID: "",
            professionTypeLists: "",
          }),
        );
        window.location.reload(true);
      }
      // navigate("/");
      // window.location.reload(true);
    };

    // Call the navigateAndRefresh function
    navigateAndRefresh();

    setOpenSuccessModal(false);
    setOpenErrorModal(false);
  };

  //Design part :
  return (
    <>
      <div className="users-redesign">
        <div className="users-page">
          {/* =========================
              PAGE HEADER
              ========================= */}
          <div className="users-page-header">
            <div>
              <h1 className="users-page-title">{moduleName}s</h1>
              <p className="users-page-subtitle">
                Manage users, roles and invitation status for your practice.
              </p>
            </div>

            {userAccessData.Admin_Setting_user_CanAdd && (
              <div className="users-invite-action">
                <CommonButtonComponent
                  title={getCrudButtonToolTipName("Invite", moduleName)}
                  name={getCrudButtonTextName("Invite", moduleName)}
                  dataBsTarget="#addUpdateModal"
                  data_bs_toggle="modal"
                  AddBtn={() => UsersAddBtnClicked()}
                />
              </div>
            )}
          </div>

          {/* =========================
              USERS LIST CARD
              ========================= */}
          <section className="users-list-card">
            {/* Toolbar */}
            <div className="users-list-toolbar">
              <div className="users-search-wrap">
                <i className="ri-search-line users-search-icon"></i>

                <input
                  type="text"
                  value={searchKeyword}
                  onChange={(e) => {
                    HandleSearch(e);
                  }}
                  className="users-search-input"
                  placeholder={
                    isMobile
                      ? "Search"
                      : getPlaceholderTextName("Search", moduleName)
                  }
                />
              </div>

              {/* <div className="users-list-count">
                {listCount > 0
                  ? `${listCount} ${listCount === 1 ? "user" : "users"}`
                  : ""}
              </div> */}
            </div>

            {/* Table */}
            <div className="users-table-wrap">
              <table className="users-table" id="customerTable">
                <thead>
                  <tr>
                    <th>
                      <button
                        type="button"
                        className="users-sort-button"
                        onClick={() => {
                          setUserSortType("FirstName");
                          handleUserSort(
                            primaryUserSortDirectionObj.UserNameTypeSort ===
                              null
                              ? "asc"
                              : primaryUserSortDirectionObj.UserNameTypeSort ===
                                  "asc"
                                ? "desc"
                                : "asc",
                            "FirstName",
                          );
                        }}
                      >
                        <span>First Name</span>

                        <i
                          className={
                            primaryUserSortDirectionObj.UserNameTypeSort ===
                            "desc"
                              ? "ri-arrow-up-line"
                              : "ri-arrow-down-line"
                          }
                        ></i>
                      </button>
                    </th>

                    <th>Last Name</th>

                    <th>Email</th>

                    <th>
                      <button
                        type="button"
                        className="users-sort-button"
                        onClick={() => {
                          setUserSortType("RoleName");
                          handleUserSort(
                            primaryUserSortDirectionObj.RoleTypeSort === null
                              ? "asc"
                              : primaryUserSortDirectionObj.RoleTypeSort ===
                                  "asc"
                                ? "desc"
                                : "asc",
                            "RoleName",
                          );
                        }}
                      >
                        <span>Role</span>

                        <i
                          className={
                            primaryUserSortDirectionObj.RoleTypeSort === "desc"
                              ? "ri-arrow-up-line"
                              : "ri-arrow-down-line"
                          }
                        ></i>
                      </button>
                    </th>

                    <th>
                      <button
                        type="button"
                        className="users-sort-button"
                        onClick={() => {
                          setUserSortType("AcceptanceStatus");
                          handleUserSort(
                            primaryUserSortDirectionObj.AcceptanceStatusTypeSort ===
                              null
                              ? "asc"
                              : primaryUserSortDirectionObj.AcceptanceStatusTypeSort ===
                                  "asc"
                                ? "desc"
                                : "asc",
                            "AcceptanceStatus",
                          );
                        }}
                      >
                        <span>Acceptance Status</span>

                        <i
                          className={
                            primaryUserSortDirectionObj.AcceptanceStatusTypeSort ===
                            "desc"
                              ? "ri-arrow-up-line"
                              : "ri-arrow-down-line"
                          }
                        ></i>
                      </button>
                    </th>

                    {(userAccessData.Admin_Setting_user_CanEdit ||
                      userAccessData.Admin_Setting_user_CanDelete) && (
                      <th className="users-action-heading">Actions</th>
                    )}
                  </tr>
                </thead>

                <tbody>
                  {usersList
                    .slice(0, isMobile ? isMobileRecords : desktopRecords)
                    .map((users) => {
                      const firstName = users.firstName || "";
                      const lastName = users.lastName || "";

                      const displayFirstName =
                        firstName.length > 40
                          ? `${firstName
                              .substring(0, 40)
                              .toLowerCase()
                              .replace(/\b\w/g, (l) => l.toUpperCase())}...`
                          : firstName
                              .toLowerCase()
                              .replace(/\b\w/g, (l) => l.toUpperCase());

                      const displayLastName =
                        lastName.length > 40
                          ? `${lastName
                              .substring(0, 40)
                              .toLowerCase()
                              .replace(/\b\w/g, (l) => l.toUpperCase())}...`
                          : lastName
                              .toLowerCase()
                              .replace(/\b\w/g, (l) => l.toUpperCase());

                      const initials = `${firstName.charAt(0)}${lastName.charAt(
                        0,
                      )}`.toUpperCase();

                      const acceptanceStatus = users.acceptanceStatus || "-";

                      const statusClass = acceptanceStatus
                        .toLowerCase()
                        .replace(/\s+/g, "-");

                      return (
                        <tr
                          className="users-table-row"
                          key={
                            users.inviteUserKeyID ||
                            users.userKeyID ||
                            users.email
                          }
                        >
                          <td>
                            <div className="users-name-cell">
                              {/* <span className="users-avatar">
                                {initials || "U"}
                              </span> */}

                              <div className="users-name-copy">
                                {firstName.length > 40 ? (
                                  <Tooltip title={firstName}>
                                    <span className="users-primary-text">
                                      {displayFirstName}
                                    </span>
                                  </Tooltip>
                                ) : (
                                  <span className="users-primary-text">
                                    {displayFirstName || "-"}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          <td>
                            {lastName.length > 40 ? (
                              <Tooltip title={lastName}>
                                <span className="users-cell-text">
                                  {displayLastName}
                                </span>
                              </Tooltip>
                            ) : (
                              <span className="users-cell-text">
                                {displayLastName || "-"}
                              </span>
                            )}
                          </td>

                          <td>
                            <span
                              className="users-email-text"
                              title={users.email}
                            >
                              {users.email || "-"}
                            </span>
                          </td>

                          <td>
                            <span className="users-role-badge">
                              {users.roleName || "-"}
                            </span>
                          </td>

                          <td>
                            <span
                              className={`users-status-badge users-status-badge--${statusClass}`}
                            >
                              <span className="users-status-dot"></span>
                              {acceptanceStatus}
                            </span>
                          </td>

                          {(userAccessData.Admin_Setting_user_CanEdit ||
                            userAccessData.Admin_Setting_user_CanDelete) && (
                            <td className="users-actions-cell">
                              {users.roleName !== "Super Admin" ? (
                                <div className="users-row-actions">
                                  {userAccessData.Admin_Setting_user_CanEdit && (
                                    <Tooltip
                                      title={getCrudButtonToolTipName(
                                        "Update",
                                        moduleName,
                                      )}
                                    >
                                      <button
                                        type="button"
                                        onClick={() =>
                                          UsersEditBtnClicked(users)
                                        }
                                        className="users-action-button users-action-button--edit"
                                        data-bs-toggle="modal"
                                        data-bs-target="#addUpdateModal"
                                      >
                                        <i className="ri-pencil-line"></i>
                                      </button>
                                    </Tooltip>
                                  )}

                                  {userAccessData.Admin_Setting_user_CanDelete && (
                                    <Tooltip
                                      title={getCrudButtonToolTipName(
                                        "Delete",
                                        moduleName,
                                      )}
                                    >
                                      <button
                                        type="button"
                                        className="users-action-button users-action-button--delete"
                                        data-bs-toggle="modal"
                                        data-bs-target="#ConfirmModel"
                                        onClick={() =>
                                          setModelRequestData({
                                            ...modelRequestData,
                                            InviteUserKeyID:
                                              users.inviteUserKeyID,
                                            userName: users.firstName,
                                            userKeyID: common.userKeyID,
                                            Action: "Delete",
                                          })
                                        }
                                      >
                                        <i className="ri-delete-bin-line"></i>
                                      </button>
                                    </Tooltip>
                                  )}
                                </div>
                              ) : (
                                ""
                              )}
                            </td>
                          )}
                        </tr>
                      );
                    })}
                </tbody>
              </table>

              {totalRecords <= 0 && (
                <div className="users-empty-state">
                  <NoResultFoundModel
                    name={moduleName}
                    totalRecords={totalRecords}
                  />
                </div>
              )}
            </div>

            {/* Pagination */}
            {listCount > 10 && (
              <div className="users-pagination-wrap">
                <PaginationComponent
                  totalCount={listCount}
                  totalPages={totalPage}
                  currentPage={currentPage}
                  onPageChange={HandlePageChange}
                />
              </div>
            )}
          </section>
        </div>

        {/* =========================
            EXISTING MODALS
            ========================= */}
        <ErrorModel
          ErrorModel={openErrorModal}
          handleClose={handleClose}
          ErrorMessage={errorMessage}
        />

        <ConfirmModel
          openErrorModal={openErrorModal}
          openSuccessModal={openSuccessModal}
          modelRequestData={modelRequestData}
          UpdatedStatus={DeleteUserData}
        />

        <SuccessModal
          keepPopup
          handleClose={handleClose}
          setOpenSuccessModal={setOpenSuccessModal}
          openSuccessModal={openSuccessModal}
          modelAction={modelRequestData.Action}
          message={
            modelRequestData.Action === "Delete"
              ? `${moduleName} ${modelRequestData.userName}`
              : "Status has been changed successfully!"
          }
        />

        <UsersModel
          class="modal fade"
          id="addUpdateModal"
          tabIndex="-1"
          aria_labelledby="addUpdateModal"
          aria_hidden="true"
          setIsAddUpdateActionDone={setIsAddUpdateActionDone}
          modelRequestData={modelRequestData}
        />

        <button
          onclick="topFunction()"
          class="btn btn-danger btn-icon"
          id="back-to-top"
        >
          <i class="ri-arrow-up-line"></i>
        </button>
      </div>

      <Footer />
    </>
  );
};

export default UsersList;
