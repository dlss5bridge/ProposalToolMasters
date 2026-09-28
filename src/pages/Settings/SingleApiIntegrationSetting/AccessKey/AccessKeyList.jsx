/* global $ */
import React, { useContext, useEffect, useState } from "react";
import CommonButtonComponent from "../../../../components/CommonButtonComponent";
import "./AccessKeyStyle.css";
import "./AccessKeyStyle-redesign.css";
import { useSelector } from "react-redux";
import hint from "../../../../assets/images/hint.png";
import AccesskeyModal from "./AccesskeyModal";
import PaginationComponent from "../../../../components/PaginationModel";
import NoResultFoundModel from "../../../../components/NoResultFoundModel";
import Tooltip, { tooltipClasses } from "@mui/material/Tooltip";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import SuccessModal from "../../../../components/SuccessModal";
import ErrorModel from "../../../../components/ErrorModel";
import ConfirmModel from "../../../../components/ConfirmationBox";
import Footer from "../../../../components/Footer";
import { AuthContextProvider } from "../../../../AuthContext/AuthContext";
import Android12Switch from "../../../../components/AndroidSwitch";
import {
  AccessKeyChangeStatus,
  DeleteAccessKey,
  EnableAccessKeyApiIntegationChangeStatus,
  GetAccessKeyList,
} from "../../../../redux/Services/Setting/AccessKeyApi";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import { AccessKeyBaseUrl } from "../../../../Base-Url/Base_Url";
import AccessKeyUsesModal from "./AccessKeyUsesModel";
const AccessKeyList = () => {
  let getAccessKeyListApiCallCount = 0;
  const navigate = useNavigate();
  // A] States Declaration :
  const moduleName = "Access Key";
  const [accessKeyList, setAccessKeyList] = useState([]);

  const [modelRequestData, setModelRequestData] = useState({
    AccessKeyName: "",
    accessKeyKeyID: null,
    Action: null,
    userKeyID: null,
    status: null,
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [isAddUpdateActionDone, setIsAddUpdateActionDone] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(-1);
  const common = useSelector((state) => state.Storage); //Getting Logged Users Details From Persist Storage of redux hooks
  const [primarySortDirection, setPrimarySortDirection] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [openErrorModal, setOpenErrorModal] = useState(false);
  const [isSingleApiAccessKeyEnable, setIsSingleApiAccessKeyEnable] =
    useState(false);

  const [openSuccessModal, setOpenSuccessModal] = React.useState(false);
  const [copiedToken, setCopiedToken] = useState(null);
  const {
    setLoader,
    setTopbar,
    maxCountToRecallApi,
    isMobile,
    setListCount,
    listCount,
    getCrudButtonTextName,
    getPlaceholderTextName,
    getCrudButtonToolTipName,
    userAccessData,
    activeOrganizationSubscriptionPlan,
    isSubscriptionLoading,
    desktopRecords,
    isMobileRecords,
  } = useContext(AuthContextProvider);
  const totalPage = isMobile
    ? Math.ceil(listCount / isMobileRecords)
    : Math.ceil(listCount / desktopRecords);
  const pageSize = isMobile ? isMobileRecords : desktopRecords;
  // B] Initial useEffect :
  // 1) Will Call Initial Api Like List Api
  useEffect(() => {
    // console.log("activeOrganizationSubscriptionPlan", activeOrganizationSubscriptionPlan);
    if (isSubscriptionLoading || !activeOrganizationSubscriptionPlan) return;
    if (
      common.organisationKeyID !== null &&
      !activeOrganizationSubscriptionPlan?.apiIntegration
    ) {
      navigate(-1); // Redirect to the previous page
    }
    setTopbar("block");
    GetAccessKeyListData(1);
  }, [isSubscriptionLoading, activeOrganizationSubscriptionPlan]);

  //2) This useEffect will trigger when we successfully add or update record from popup model
  useEffect(() => {
    if (isAddUpdateActionDone) {
      if (modelRequestData.Action === null) {
        setSearchKeyword("");
        setPrimarySortDirection(null);
        setCurrentPage(1);
        GetAccessKeyListData(1, null, null);
      } else {
        GetAccessKeyListData(currentPage);
      }
      setIsAddUpdateActionDone(false);
    }
  }, [isAddUpdateActionDone]);

  // C] Calling All Api's like List and other Here :
  // 1) Get Access Key List Data
  const GetAccessKeyListData = async (i, searchKeywordValue, sortValue) => {
    setLoader(true);
    const pageNoList = i - 1;
    try {
      const data = await GetAccessKeyList({
        pageSize: pageSize,
        pageNo: pageNoList,
        organisationKeyID: common.organisationKeyID,
        userKeyID: common.userKeyID,
        searchKeyword:
          searchKeywordValue === undefined ? searchKeyword : searchKeywordValue,
        primarySortDirection:
          sortValue === undefined ? primarySortDirection : sortValue,
      });
      if (data) {
        if (data?.data?.statusCode === 200) {
          setLoader(false);
          getAccessKeyListApiCallCount = 0;
          if (data?.data?.responseData?.data) {
            const totalCount = data.data.totalCount;
            const AccessKeyListData = data.data.responseData.data;
            const isSingleApiAccessKeyEnable =
              data.data.responseData.isSingleApiAccessKeyEnable;
            setIsSingleApiAccessKeyEnable(isSingleApiAccessKeyEnable);
            if (pageNoList > 0 && AccessKeyListData.length === 0) {
              let newPaneNo = Number(pageNoList);
              if (newPaneNo > 1) {
                newPaneNo = newPaneNo - 1;
              }
              GetAccessKeyListData(newPaneNo, searchKeywordValue, sortValue);
              setCurrentPage(pageNoList);
              return;
            }
            setListCount(totalCount);
            setAccessKeyList(AccessKeyListData);
            setTotalRecords(AccessKeyListData.length);
          }
        } else {
          if (getAccessKeyListApiCallCount < maxCountToRecallApi) {
            getAccessKeyListApiCallCount += 1;
            setTimeout(function () {
              GetAccessKeyListData(i, searchKeywordValue, sortValue);
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
  // 1) On Click Access Key Add Button
  const AccessKeyAddBtnClicked = () => {
    {
      setModelRequestData({
        ...modelRequestData,
        Action: null,
      });
    }
  };

  // 2) On Click Access Key ChangeStatus Button
  const ChangeStatusAccessKeyData = async () => {
    if (modelRequestData.Action === "EnableApiIntegration") {
      try {
        const Data = await EnableAccessKeyApiIntegationChangeStatus(
          common.organisationKeyID,
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
          GetAccessKeyListData(currentPage);
        }
      } catch (error) {
        console.log(error);
      }
    } else if (modelRequestData.Action === "Status") {
      try {
        const Data = await AccessKeyChangeStatus(
          modelRequestData.accessKeyKeyID,
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
          GetAccessKeyListData(currentPage);
        }
      } catch (error) {
        console.log(error);
      }
    } else {
      setLoader(true);
      try {
        const Data = await DeleteAccessKey(
          modelRequestData.accessKeyKeyID,
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
          GetAccessKeyListData(currentPage);
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  // F] Pagination :
  const handlePageChange = async (pageNumber) => {
    setCurrentPage(pageNumber);
    await GetAccessKeyListData(pageNumber); // Call your function with the selected page number
  };

  // E] Sorting
  const HandleSort = (sortValue) => {
    setPrimarySortDirection(sortValue);
    setCurrentPage(1);
    GetAccessKeyListData(1, searchKeyword, sortValue);
  };

  const handleSearch = (e) => {
    const searchKeywordValue = e.target.value;
    setSearchKeyword(searchKeywordValue);
    setCurrentPage(1);
    GetAccessKeyListData(1, searchKeywordValue);
  };

  const handleClose = () => {
    $("#" + "ConfirmModel").modal("hide");
    setOpenSuccessModal(false);
    setOpenErrorModal(false);
  };

  const handleCopyToken = async (token) => {
    try {
      await navigator.clipboard.writeText(token);

      setCopiedToken(token);

      setTimeout(() => {
        setCopiedToken(null);
      }, 1500);
    } catch (error) {
      console.log("Failed to copy token:", error);
    }
  };

  //Design part :
  return (
    <>
      <div className="access-key-redesign">
        <div className="access-key-page">
          {/* =========================
              PAGE HEADER
              ========================= */}
          <div className="access-key-page-header">
            <div>
              <h1 className="access-key-page-title">Access Keys</h1>
              <p className="access-key-page-subtitle">
                Manage API access keys and integration access for your
                workspace.
              </p>
            </div>

            {common.organisationKeyID !== null && (
              <div className="access-key-header-switch">
                <div className="access-key-header-switch-copy">
                  <span className="access-key-header-switch-title">
                    Single API Access Key
                  </span>
                  <span className="access-key-header-switch-state">
                    {isSingleApiAccessKeyEnable ? "Enabled" : "Disabled"}
                  </span>
                </div>

                <Tooltip title="Enable/Disable Single API Access Key">
                  <FormGroup>
                    <FormControlLabel
                      className="access-key-switch-label"
                      control={
                        <Android12Switch
                          checked={isSingleApiAccessKeyEnable}
                          onClick={() =>
                            setModelRequestData({
                              ...modelRequestData,
                              userKeyID: common.userKeyID,
                              status: isSingleApiAccessKeyEnable
                                ? "Enable"
                                : "Disable",
                              Action: "EnableApiIntegration",
                            })
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
          </div>

          {/* =========================
              LIST CARD
              ========================= */}
          <section className="access-key-list-card">
            {/* Toolbar */}
            <div className="access-key-toolbar">
              <div className="access-key-search-wrap">
                <i className="ri-search-line access-key-search-icon"></i>

                <input
                  type="text"
                  value={searchKeyword}
                  onChange={(e) => {
                    handleSearch(e);
                  }}
                  className="access-key-search-input"
                  placeholder={
                    isMobile
                      ? "Search"
                      : getPlaceholderTextName("Search", moduleName)
                  }
                />
              </div>

              <div className="access-key-toolbar-actions">
                {common.organisationKeyID === null && (
                  <div className="access-key-add-action">
                    <CommonButtonComponent
                      title={getCrudButtonToolTipName("Add", moduleName)}
                      name={getCrudButtonTextName("Add", moduleName)}
                      dataBsTarget="#showModal1"
                      data_bs_toggle="modal"
                      AddBtn={() => AccessKeyAddBtnClicked()}
                    />
                  </div>
                )}

                {common.organisationKeyID !== null && (
                  <Tooltip title={`How To Use ${moduleName}`}>
                    <button
                      type="button"
                      className="access-key-help-button"
                      data-bs-target="#AccessKeyUsesModel"
                      data-bs-toggle="modal"
                    >
                      <img src={hint} className="access-key-help-icon" alt="" />
                      <span>How To Use {moduleName}</span>
                    </button>
                  </Tooltip>
                )}
              </div>
            </div>

            {/* Table */}
            <div className="access-key-table-wrap">
              <table className="access-key-table" id="customerTable">
                <thead>
                  <tr>
                    <th>
                      <button
                        type="button"
                        className="access-key-sort-button"
                        onClick={() =>
                          HandleSort(
                            primarySortDirection === null
                              ? "asc"
                              : primarySortDirection === "asc"
                                ? "desc"
                                : "asc",
                          )
                        }
                      >
                        <span>Access Key</span>
                        <i
                          className={
                            primarySortDirection === "desc"
                              ? "ri-arrow-up-line"
                              : "ri-arrow-down-line"
                          }
                        ></i>
                      </button>
                    </th>

                    <th>Token</th>
                    <th>Organisation Name</th>

                    {common.organisationKeyID !== null && <th>Status</th>}

                    <th>Expiry Date</th>

                    {common.organisationKeyID === null && (
                      <>
                        <th>Status</th>
                        <th className="access-key-actions-heading">
                          Actions
                          {/* {userAccessData.Admin_Setting_AccessKeyCanDelete && (
                            <>Actions</>
                          )} */}
                        </th>
                      </>
                    )}
                  </tr>
                </thead>

                <tbody>
                  {accessKeyList
                    .slice(0, isMobile ? isMobileRecords : desktopRecords)
                    .map((AccessKey) => {
                      const formattedName = AccessKey.accessKeyName
                        ? AccessKey.accessKeyName
                            .toLowerCase()
                            .replace(/\b\w/g, (l) => l.toUpperCase())
                        : "-";

                      const expiryStatusClass = (AccessKey.expiryStatus || "")
                        .toLowerCase()
                        .replace(/\s+/g, "-");

                      const statusClass = (AccessKey.statusName || "")
                        .toLowerCase()
                        .replace(/\s+/g, "-");

                      return (
                        <tr
                          className="access-key-table-row"
                          key={
                            AccessKey.accessKeyKeyID ||
                            AccessKey.accessKeyName ||
                            AccessKey.token
                          }
                        >
                          <td>
                            <div className="access-key-name-cell">
                              <span className="access-key-key-icon">
                                <i className="ri-key-2-line"></i>
                              </span>

                              <span
                                className="access-key-primary-text"
                                title={AccessKey.accessKeyName}
                              >
                                {formattedName}
                              </span>
                            </div>
                          </td>

                          <td>
                            <div className="access-key-token-wrapper">
                              <span
                                className="access-key-token"
                                title={AccessKey.token}
                              >
                                {AccessKey.token || "-"}
                              </span>

                              {AccessKey.token && (
                                <Tooltip
                                  title={
                                    copiedToken === AccessKey.token
                                      ? "Copied!"
                                      : "Copy Access Key"
                                  }
                                >
                                  <button
                                    type="button"
                                    className={`access-key-copy-btn ${
                                      copiedToken === AccessKey.token
                                        ? "access-key-copy-btn--copied"
                                        : ""
                                    }`}
                                    onClick={() =>
                                      handleCopyToken(AccessKey.token)
                                    }
                                  >
                                    <i
                                      className={
                                        copiedToken === AccessKey.token
                                          ? "ri-check-line"
                                          : "ri-file-copy-line"
                                      }
                                    ></i>
                                  </button>
                                </Tooltip>
                              )}
                            </div>
                          </td>

                          <td>
                            <span
                              className="access-key-organisation"
                              title={AccessKey.organisationName}
                            >
                              {AccessKey.organisationName || "-"}
                            </span>
                          </td>

                          {common.organisationKeyID !== null && (
                            <td>
                              <span
                                className={`access-key-status-badge access-key-status-badge--${expiryStatusClass}`}
                              >
                                <span className="access-key-status-dot"></span>
                                {AccessKey.expiryStatus || "-"}
                              </span>
                            </td>
                          )}

                          <td>
                            <span className="access-key-date">
                              {AccessKey.expiryDate
                                ? dayjs(AccessKey.expiryDate).format(
                                    "DD/MM/YYYY",
                                  )
                                : "-"}
                            </span>
                          </td>

                          {common.organisationKeyID === null && (
                            <>
                              <td>
                                <div className="access-key-status-control">
                                  <span
                                    className={`access-key-status-badge access-key-status-badge--${statusClass}`}
                                  >
                                    <span className="access-key-status-dot"></span>
                                    {AccessKey.statusName}
                                  </span>

                                  <Tooltip
                                    title={getCrudButtonToolTipName(
                                      "Change Status",
                                    )}
                                  >
                                    <FormGroup>
                                      <FormControlLabel
                                        className="access-key-row-switch-label"
                                        control={
                                          <Android12Switch
                                            checked={
                                              AccessKey.statusName === "Active"
                                            }
                                            onClick={() =>
                                              setModelRequestData({
                                                ...modelRequestData,
                                                accessKeyKeyID:
                                                  AccessKey.accessKeyKeyID,
                                                AccessKeyName:
                                                  AccessKey.accessKeyName,
                                                userKeyID: common.userKeyID,
                                                status: AccessKey.statusName,
                                                Action: "Status",
                                              })
                                            }
                                            data-bs-toggle="modal"
                                            data-bs-target="#ConfirmModel"
                                          />
                                        }
                                      />
                                    </FormGroup>
                                  </Tooltip>
                                </div>
                              </td>

                              <td className="access-key-actions-cell">
                                <div className="access-key-row-actions">
                                  <Tooltip
                                    title={getCrudButtonToolTipName(
                                      "Delete",
                                      moduleName,
                                    )}
                                  >
                                    <button
                                      type="button"
                                      className="access-key-action-button access-key-action-button--delete"
                                      data-bs-toggle="modal"
                                      data-bs-target="#ConfirmModel"
                                      onClick={() =>
                                        setModelRequestData({
                                          ...modelRequestData,
                                          accessKeyKeyID:
                                            AccessKey.accessKeyKeyID,
                                          AccessKeyName:
                                            AccessKey.accessKeyName,
                                          userKeyID: common.userKeyID,
                                          Action: "Delete",
                                        })
                                      }
                                    >
                                      <i className="ri-delete-bin-line"></i>
                                    </button>
                                  </Tooltip>
                                </div>
                              </td>
                            </>
                          )}
                        </tr>
                      );
                    })}
                </tbody>
              </table>

              {totalRecords <= 0 && (
                <div className="access-key-empty-state">
                  <NoResultFoundModel
                    name={moduleName}
                    totalRecords={totalRecords}
                  />
                </div>
              )}
            </div>

            {/* Pagination */}
            {listCount > pageSize && (
              <div className="access-key-pagination-wrap">
                <PaginationComponent
                  totalCount={listCount}
                  totalPages={totalPage}
                  currentPage={currentPage}
                  onPageChange={handlePageChange}
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
          UpdatedStatus={ChangeStatusAccessKeyData}
        />

        <SuccessModal
          handleClose={handleClose}
          setOpenSuccessModal={setOpenSuccessModal}
          openSuccessModal={openSuccessModal}
          modelAction={modelRequestData.Action}
          message={
            modelRequestData.Action === "Delete"
              ? moduleName + " " + modelRequestData.AccessKeyName
              : "Status has been changed successfully!"
          }
        />

        <AccesskeyModal
          class="modal fade"
          id="showModal1"
          tabIndex="-1"
          aria_labelledby="exampleModalLabel"
          aria_hidden="true"
          setIsAddUpdateActionDone={setIsAddUpdateActionDone}
          modelRequestData={modelRequestData}
        />

        <AccessKeyUsesModal
          class="modal fade"
          id="AccessKeyUsesModel"
          tabIndex="-1"
          aria_labelledby="exampleModalLabel"
          aria_hidden="true"
          setIsAddUpdateActionDone={setIsAddUpdateActionDone}
          modelRequestData={modelRequestData}
        />

        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="btn btn-danger btn-icon"
          id="back-to-top"
        >
          <i className="ri-arrow-up-line"></i>
        </button>
      </div>

      <Footer />
    </>
  );
};

export default AccessKeyList;
