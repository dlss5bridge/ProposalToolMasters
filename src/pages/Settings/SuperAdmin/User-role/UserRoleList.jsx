/* global $ */
import React, { useContext, useEffect, useState } from "react";
import "../../../configure/service_categories/ServiceCategory.css";
import CommonButtonComponent from "../../../../components/CommonButtonComponent";
import UserRoleModel from "./UserRoleModel";
import AccessModel from "./AccessModel";
import ConfirmModel from "../../../../components/ConfirmationBox";
import {
  DeleteUserRole,
  GetUserRoleList,
  UserRoleChangeStatus,
} from "../../../../redux/Services/Config/UserRoleApi";
import PaginationComponent from "../../../../components/PaginationModel";
import { useSelector } from "react-redux";
import Android12Switch from "../../../../components/AndroidSwitch";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Tooltip, { tooltipClasses } from "@mui/material/Tooltip";
import NoResultFoundModel from "../../../../components/NoResultFoundModel";
import { AuthContextProvider } from "../../../../AuthContext/AuthContext";
import SuccessModal from "../../../../components/SuccessModal";
import ErrorModel from "../../../../components/ErrorModel";
import Footer from "../../../../components/Footer";
import RecordsAvailablePopupModel from "../../../../components/RecordsAvailablePopupModel";
import { USER_ROLE_TYPE } from "../../../../Middleware/enums";
import "./UserRoleList-redesign.css";

const UserRoleList = () => {
  // A] States Declaration :
  const moduleName = "User Role";
  const [UserRoleList, setUserRoleList] = useState([]);
  const [modelRequestData, setModelRequestData] = useState({
    roleTypeID: null,
    UserKeyID: null,
    roleName: null,
    status: "",
    Action: "",
    userKeyID: null,
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [isAddUpdateActionDone, setIsAddUpdateActionDone] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const common = useSelector((state) => state.Storage); //Getting Logged Users Details From Persist Storage of redux hooks
  const [primarySortDirection, setPrimarySortDirection] = useState(null);
  const [primarySortDirectionObj, setPrimarySortDirectionObj] = useState({
    UserNameSort: null,
    ProfessionTypeSort: null,
  });
  const [sortType, setSortType] = useState("");
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
  const [totalRecords, setTotalRecords] = useState(-1);
  let getServiceCategoryListApiCallCount = 0;
  const [openSuccessModal, setOpenSuccessModal] = React.useState(false);
  const [openErrorModal, setOpenErrorModal] = React.useState(false);
  const [showProfessionType, setShowProfessionType] = useState(
    common.organisationKeyID === null || common.professionTypeLists.length > 1,
  );
  const pageSize = isMobile ? isMobileRecords : desktopRecords;
  // B] Initial useEffect :
  // 1) Will Call Initial Api Like List Api
  useEffect(() => {
    setTopbar("block");
    GetUserRoleListData(1, null, null, null);
  }, [pageSize]);

  //2) This useEffect will trigger when we successfully add or update record from popup model
  useEffect(() => {
    if (isAddUpdateActionDone) {
      if (modelRequestData.Action === null) {
        setSearchKeyword("");
        setPrimarySortDirection(null);
        setCurrentPage(1);
        GetUserRoleListData(1, null, null, null);
      } else {
        GetUserRoleListData(currentPage);
      }
      setIsAddUpdateActionDone(false);
    }
  }, [isAddUpdateActionDone]);

  // C] Calling All Api's like List and other Here :
  // 1) Get User Role List Data
  const GetUserRoleListData = async (
    i,
    searchKeywordValue,
    sortValue,
    ServiceSortType,
  ) => {
    setLoader(true);
    const pageNoList = i - 1;
    if (pageSize === 0) {
      return;
    }
    try {
      const data = await GetUserRoleList({
        pageSize: pageSize,
        pageNo: pageNoList,
        organisationKeyID: common.organisationKeyID,
        searchKeyword:
          searchKeywordValue === undefined ? searchKeyword : searchKeywordValue,
        primarySortDirection:
          sortValue === undefined ? primarySortDirection : sortValue,
        PrimarySortColumnName:
          sortType == "" ? ServiceSortType : sortType || null,
      });

      if (data) {
        if (data?.data?.statusCode === 200) {
          setLoader(false);
          getServiceCategoryListApiCallCount = 0;
          if (data?.data?.responseData?.data) {
            const totalCount = data.data.totalCount;
            const UserRoleListData = data.data.responseData.data;
            if (pageNoList > 0 && UserRoleListData.length === 0) {
              let newPageNo = Number(pageNoList);
              if (newPageNo > 1) {
                newPageNo = newPageNo - 1;
              }
              GetUserRoleListData(
                newPageNo,
                searchKeywordValue,
                sortValue,
                ServiceSortType,
              );
              setCurrentPage(pageNoList);
              return;
            }

            setListCount(totalCount);
            setUserRoleList(UserRoleListData);
            setTotalRecords(UserRoleListData.length);
          }
        } else {
          if (getServiceCategoryListApiCallCount < maxCountToRecallApi) {
            getServiceCategoryListApiCallCount += 1;
            setTimeout(function () {
              GetUserRoleListData(
                i,
                searchKeywordValue,
                sortValue,
                ServiceSortType,
              );
            }, 2000);
          } else {
            setLoader(false);
          }

          setErrorMessage(data?.data?.errorMessage);
        }
      }
    } catch (error) {
      setLoader(false);
      console.log(error);
    }
  };

  // E] Event Handling Functions will call here.
  // 1) On Click User Role Add Button
  const UserRoleAddBtnClicked = (Action) => {
    if (Action === "accessModel") {
      setModelRequestData({
        ...modelRequestData,
        roleTypeID: null,
        Action: Action,
      });
    } else {
      setModelRequestData({
        ...modelRequestData,
        roleTypeID: null,
        Action: null,
      });
    }
  };
  // 2) On Click User Role Edit Button
  const UserRoleEditBtnClicked = (userRole) => {
    {
      setModelRequestData({
        ...modelRequestData,
        roleTypeID: userRole.roleTypeID,
        Action: "Update",
      });
    }
  };

  // Update Function Modal
  // 2) On Click User Role Status Button
  const UserRoleChangeStatusDataAndDeleteData = async () => {
    setLoader(true);
    if (modelRequestData.Action === "Status") {
      try {
        const Data = await UserRoleChangeStatus(
          modelRequestData.roleTypeID,
          modelRequestData.userKeyID,
        );
        if (Data) {
          setLoader(false);
          if (Data?.data?.statusCode === 200) {
            if (Data?.data?.responseData.roleTypeExistsInUsers.length !== 0) {
              const servicePackageNames =
                Data?.data?.responseData.roleTypeExistsInUsers[0].recordList.map(
                  (item) => item.name,
                );
              setModelRequestData({
                ...modelRequestData,
                Action: "UserRolesWarning",
                message: `This user role is assigned to the users listed below. Before deactivating it, you must remove the user role from following users.`,
                UserName: servicePackageNames,
              });
              $("#" + "ConfirmModel").modal("hide");
              $("#" + "RecordsAvailablePopupModel").modal("show");
              GetUserRoleListData(currentPage);
            } else {
              GetUserRoleListData(currentPage);
              $("#" + "ConfirmModel").one("hidden.bs.modal", () => {
                setOpenSuccessModal(true);
              });
              $("#" + "ConfirmModel").modal("hide");
            }
          } else {
            setErrorMessage(Data?.response?.data?.errorMessage);
            setOpenErrorModal(true);
            GetUserRoleListData(currentPage);
          }
        }
        GetUserRoleListData(currentPage);
      } catch (error) {
        console.log(error);
      }
    } else if (modelRequestData.Action === "Delete") {
      try {
        const Data = await DeleteUserRole(
          modelRequestData.roleTypeID,
          modelRequestData.userKeyID,
        );
        if (Data) {
          setLoader(false);
          if (Data?.data?.statusCode === 200) {
            if (Data?.data?.responseData.roleTypeExistsInUsers.length !== 0) {
              const servicePackageNames =
                Data?.data?.responseData.roleTypeExistsInUsers[0].recordList.map(
                  (item) => item.name,
                );
              setModelRequestData({
                ...modelRequestData,
                Action: "UserRolesWarning",
                message: `This user role is assigned to the users listed below. Before deactivating it, you must remove the user role from following users.`,
                UserName: servicePackageNames,
              });
              $("#" + "ConfirmModel").modal("hide");
              $("#" + "RecordsAvailablePopupModel").modal("show");
              GetUserRoleListData(currentPage);
            } else {
              GetUserRoleListData(currentPage);
              $("#" + "ConfirmModel").one("hidden.bs.modal", () => {
                setOpenSuccessModal(true);
              });
              $("#" + "ConfirmModel").modal("hide");
            }
          } else {
            setErrorMessage(Data?.response?.data?.errorMessage);
            setOpenErrorModal(true);
          }
          GetUserRoleListData(currentPage);
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  // F] Pagination :
  const handlePageChange = async (pageNumber) => {
    setCurrentPage(pageNumber);
    await GetUserRoleListData(pageNumber); // Call your function with the selected page number
  };

  // E] Sorting & handle Function

  const handleSort = (sortValue, ServiceSortType) => {
    if (ServiceSortType == "RoleName") {
      setPrimarySortDirection(sortValue);
      setPrimarySortDirectionObj({
        ...primarySortDirectionObj,
        UserNameSort: sortValue,
      });
      setCurrentPage(1);
      GetUserRoleListData(1, searchKeyword, sortValue, ServiceSortType);
    }
  };

  const handleSearch = (e) => {
    const searchKeywordValue = e.target.value;
    setSearchKeyword(searchKeywordValue);
    setCurrentPage(1);
    GetUserRoleListData(1, searchKeywordValue);
  };

  const handleClose = () => {
    $("#" + "ConfirmModel").modal("hide");
    $("#" + "RecordsAvailablePopupModel").modal("hide");
    setOpenSuccessModal(false);
    setOpenErrorModal(false);
  };

  //Design part :
  return (
    <div className="container-fluid user-role-list-redesign">
      <div className="user-role-page">
        {/* =====================================================
            PAGE HEADER
            ===================================================== */}
        <div className="user-role-page-header">
          <div className="user-role-heading-copy">
            <h1>User Roles</h1>
            <p>Manage user roles, access permissions and role availability.</p>
          </div>

          <div className="user-role-header-actions">
            <Tooltip title="Set Default Access">
              <button
                type="button"
                className="user-role-secondary-action"
                onClick={() => UserRoleAddBtnClicked("accessModel")}
                data-bs-target="#AccessModal"
                data-bs-toggle="modal"
                name={"Set Default Access"}
                title={getCrudButtonToolTipName("Set Default Access")}
              >
                <i className="ri-shield-keyhole-line"></i>
                <span>Set Default Access</span>
              </button>
            </Tooltip>

            {userAccessData.SuperAdmin_Setting_User_Role_CanAdd && (
              <div className="user-role-primary-action">
                <CommonButtonComponent
                  title={getCrudButtonToolTipName("Add", moduleName)}
                  dataBsTarget="#addUpdateModal"
                  data_bs_toggle="modal"
                  name={getCrudButtonTextName("Add", moduleName)}
                  AddBtn={() => UserRoleAddBtnClicked("User")}
                />
              </div>
            )}
          </div>
        </div>

        {/* =====================================================
            LIST CARD
            ===================================================== */}
        <section className="user-role-list-card">
          {/* SEARCH + COUNT */}
          <div className="user-role-toolbar">
            <div className="user-role-search-wrap">
              <i className="ri-search-line"></i>

              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => {
                  handleSearch(e);
                }}
                className="form-control user-role-search-input"
                placeholder={
                  isMobile
                    ? "Search"
                    : getPlaceholderTextName("Search", moduleName)
                }
              />
            </div>

            <div className="user-role-count">
              <span className="user-role-count-icon">
                <i className="ri-user-settings-line"></i>
              </span>

              <div>
                <span>Total Roles</span>
                <strong>{listCount > 0 ? listCount : 0}</strong>
              </div>
            </div>
          </div>

          {/* TABLE */}
          <div className="user-role-table-scroll">
            <table className="user-role-table" id="customerTable">
              <thead>
                <tr>
                  <th>
                    <button
                      type="button"
                      className="user-role-sort-btn"
                      onClick={() => {
                        setSortType("RoleName");
                        handleSort(
                          primarySortDirectionObj.UserNameSort === null
                            ? "asc"
                            : primarySortDirectionObj.UserNameSort === "asc"
                              ? "desc"
                              : "asc",
                          "RoleName",
                        );
                      }}
                    >
                      <span>User Role</span>

                      <i
                        className={
                          primarySortDirectionObj.UserNameSort === "desc"
                            ? "fas fa-sort-alpha-up"
                            : "fas fa-sort-alpha-down"
                        }
                      ></i>
                    </button>
                  </th>

                  <th>Status</th>

                  <th className="user-role-actions-heading">
                    {(userAccessData.SuperAdmin_Setting_User_Role_CanDelete ||
                      userAccessData.SuperAdmin_Setting_User_Role_CanEdit) && (
                      <>Actions</>
                    )}
                  </th>
                </tr>
              </thead>

              <tbody>
                {UserRoleList?.slice(
                  0,
                  isMobile ? isMobileRecords : desktopRecords,
                ).map((userRole, index) => {
                  const isProtectedRole =
                    userRole.roleTypeID === 1 || userRole.roleTypeID === 2;

                  return (
                    <tr key={index}>
                      {/* ROLE */}
                      <td>
                        <div className="user-role-name-cell">
                          <span className="user-role-icon">
                            <i className="ri-shield-user-line"></i>
                          </span>

                          <div className="user-role-name-copy">
                            {isMobile ? (
                              <strong>
                                {userRole.roleName.length > 20
                                  ? userRole.roleName.substring(0, 20) + "..."
                                  : userRole.roleName}
                              </strong>
                            ) : (
                              <>
                                {userRole.roleName?.length > 45 ? (
                                  <Tooltip title={userRole.roleName}>
                                    <strong>
                                      {userRole.roleName.substring(0, 45) +
                                        "..."}
                                    </strong>
                                  </Tooltip>
                                ) : (
                                  <strong>{userRole.roleName}</strong>
                                )}
                              </>
                            )}

                            {isProtectedRole && (
                              <span className="user-role-system-badge">
                                System Role
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* STATUS */}
                      <td>
                        <div className="user-role-status-cell">
                          <span
                            className={`user-role-status-pill ${
                              userRole.statusName === "Active"
                                ? "is-active"
                                : "is-inactive"
                            }`}
                          >
                            {userRole.statusName}
                          </span>

                          {userAccessData.SuperAdmin_Setting_User_Role_CanDelete &&
                            userRole.roleTypeID !== 1 &&
                            userRole.roleTypeID !== 2 && (
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
                                            status: userRole.statusName,
                                            roleTypeID: userRole.roleTypeID,
                                            userKeyID: common.userKeyID,
                                            Action: "Status",
                                          })
                                        }
                                        checked={
                                          userRole.statusName === "Active"
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

                      {/* ACTIONS */}
                      <td className="user-role-actions-cell">
                        <div className="user-role-row-actions">
                          {userRole.roleTypeID !== 1 &&
                            userRole.roleTypeID !== 2 && (
                              <>
                                {userAccessData.SuperAdmin_Setting_User_Role_CanEdit && (
                                  <Tooltip
                                    title={getCrudButtonToolTipName(
                                      "Update",
                                      moduleName,
                                    )}
                                  >
                                    <button
                                      type="button"
                                      onClick={() =>
                                        UserRoleEditBtnClicked(userRole)
                                      }
                                      className="user-role-action-btn user-role-edit-btn"
                                      data-bs-toggle="modal"
                                      data-bs-target="#addUpdateModal"
                                    >
                                      <i className="ri-pencil-fill"></i>
                                    </button>
                                  </Tooltip>
                                )}

                                {userAccessData.SuperAdmin_Setting_User_Role_CanDelete && (
                                  <Tooltip
                                    title={getCrudButtonToolTipName(
                                      "Delete",
                                      moduleName,
                                    )}
                                  >
                                    <button
                                      type="button"
                                      className="user-role-action-btn user-role-delete-btn"
                                      data-bs-toggle="modal"
                                      data-bs-target="#ConfirmModel"
                                      onClick={() =>
                                        setModelRequestData({
                                          ...modelRequestData,
                                          roleTypeID: userRole.roleTypeID,
                                          roleName: userRole.roleName,
                                          userKeyID: common.userKeyID,
                                          Action: "Delete",
                                        })
                                      }
                                    >
                                      <i className="ri-delete-bin-5-fill"></i>
                                    </button>
                                  </Tooltip>
                                )}
                              </>
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
            <div className="user-role-empty-state">
              <NoResultFoundModel
                name={moduleName}
                totalRecords={totalRecords}
              />
            </div>
          )}
        </section>

        {/* PAGINATION OUTSIDE LIST */}
        {listCount > pageSize && (
          <div className="user-role-pagination">
            <PaginationComponent
              totalCount={listCount}
              totalPages={totalPage}
              desktopRecords={desktopRecords}
              currentPage={currentPage}
              onPageChange={handlePageChange}
            />
          </div>
        )}

        {/* =====================================================
            EXISTING MODALS
            ===================================================== */}
        <ErrorModel
          ErrorModel={openErrorModal}
          handleClose={handleClose}
          ErrorMessage={
            errorMessage === "Please InActive this record first."
              ? "Please change the status to InActive first."
              : errorMessage
          }
        />

        <ConfirmModel
          openErrorModal={openErrorModal}
          openSuccessModal={openSuccessModal}
          modelRequestData={modelRequestData}
          UpdatedStatus={UserRoleChangeStatusDataAndDeleteData}
        />

        <RecordsAvailablePopupModel
          id="RecordsAvailablePopupModel"
          handleClose={handleClose}
          openErrorModal={openErrorModal}
          openSuccessModal={openSuccessModal}
          modelRequestData={modelRequestData}
          UpdatedStatus={UserRoleChangeStatusDataAndDeleteData}
        />

        <SuccessModal
          handleClose={handleClose}
          setOpenSuccessModal={setOpenSuccessModal}
          openSuccessModal={openSuccessModal}
          modelAction={modelRequestData.Action}
          message={
            modelRequestData.Action === "Delete"
              ? `${moduleName} ${modelRequestData.roleName}`
              : "Status has been changed successfully!"
          }
        />

        <UserRoleModel
          class="modal fade"
          id="addUpdateModal"
          tabIndex="-1"
          aria_labelledby="exampleModalLabel"
          aria_hidden="true"
          setIsAddUpdateActionDone={setIsAddUpdateActionDone}
          modelRequestData={modelRequestData}
        />

        <AccessModel
          class="modal fade"
          id="AccessModal"
          tabIndex="-1"
          aria_labelledby="exampleModalLabel"
          aria_hidden="true"
          setIsAddUpdateActionDone={setIsAddUpdateActionDone}
          modelRequestData={modelRequestData}
        />
      </div>

      <button
        onClick="topFunction()"
        className="btn btn-danger btn-icon"
        id="back-to-top"
      >
        <i className="ri-arrow-up-line"></i>
      </button>

      <div className="user-role-footer-wrap">
        <Footer />
      </div>
    </div>
  );
};

export default UserRoleList;
