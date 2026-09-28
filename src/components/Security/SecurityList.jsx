/* global $ */
import React, { useContext, useEffect, useState } from "react";
import "../../pages/configure/service_categories/ServiceCategory.css";
import "./SecurityList-redesign.css";
import CommonButtonComponent from "../../components/CommonButtonComponent";
import ConfirmModel from "../../components/ConfirmationBox";
import {
  GetAuthenticationList,
  DeleteAuthentication,
  AuthenticationChangeStatus,
  GetChangeIsDefaultStatus,
  GetEnable2Fa,
} from "../../redux/Services/Auth/AuthenticatioApi";
import PaginationComponent from "../../components/PaginationModel";
import { useDispatch, useSelector } from "react-redux";
import Android12Switch from "../../components/AndroidSwitch";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Tooltip, { tooltipClasses } from "@mui/material/Tooltip";
import NoResultFoundModel from "../../components/NoResultFoundModel";
import { AuthContextProvider } from "../../AuthContext/AuthContext";
import SuccessModal from "../../components/SuccessModal";
import ErrorModel from "../../components/ErrorModel";
import Footer from "../../components/Footer";
import RecordsAvailablePopupModel from "../../components/RecordsAvailablePopupModel";
import { useNavigate } from "react-router-dom";
import { Typography } from "@mui/material";
import { updateState } from "../../redux/Persist";

const SecurityList = () => {
  const dispatch = useDispatch();
  const [twoFaChecked, setTwoFaChecked] = useState(false);

  const handleToggle = () => {
    setTwoFaChecked(!twoFaChecked);
  };

  const navigate = useNavigate();
  // A] States Declaration :
  const moduleName = "Authenticator";
  const [authList, setAuthList] = useState([]);
  const [modelRequestData, setModelRequestData] = useState({
    mfaKeyID: null,
    authenticatorName: null,
    status: "",
    Action: "",
    userKeyID: null,
    isDefault: null,
    StatusType: null,
    keyID: null,
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [isAddUpdateActionDone, setIsAddUpdateActionDone] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(-1);
  const common = useSelector((state) => state.Storage); //Getting Logged Users Details From Persist Storage of redux hooks
  const [primarySortDirection, setPrimarySortDirection] = useState(null);
  const [primarySortDirectionObj, setPrimarySortDirectionObj] = useState({
    AuthenticatorNameSort: null,
    authenticationType: null,
  });
  const [sortType, setSortType] = useState("");
  const [searchKeyword, setSearchKeyword] = useState(null);
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
    handleErrorMessage,
    getCrudButtonTextName,
    getPlaceholderTextName,
    getCrudButtonToolTipName,
  } = useContext(AuthContextProvider);

  let getAuthenticationListApiCallCount = 0;
  const [openSuccessModal, setOpenSuccessModal] = React.useState(false);
  const [openErrorModal, setOpenErrorModal] = React.useState(false);

  const pageSize = isMobile ? isMobileRecords : desktopRecords;
  const formattedErrorMessage = handleErrorMessage(errorMessage);

  // B] Initial useEffect :
  // 1) Will Call Initial Api Like List Api
  useEffect(() => {
    setTopbar("block");
    GetAuthListData(1, null, null, null);
  }, []);

  //2) This useEffect will trigger when we successfully add or update record from popup model
  useEffect(() => {
    if (isAddUpdateActionDone) {
      if (modelRequestData.Action === null) {
        setSearchKeyword(null);
        setPrimarySortDirection(null);
        setCurrentPage(1);
        GetAuthListData(1, null, null, null);
      } else {
        GetAuthListData(currentPage);
      }
      setIsAddUpdateActionDone(false);
    }
  }, [isAddUpdateActionDone]);

  useEffect(() => {
    if (modelRequestData.Action === null) {
      navigate("/security-model", { state: modelRequestData });
    }
  }, [modelRequestData]);

  // C] Calling All Api's like List and other Here :
  // 1) Get Auth List Data
  const GetAuthListData = async (
    i,
    searchKeywordValue,
    sortValue,
    AuthSortType,
  ) => {
    setLoader(true);
    const pageNoList = i - 1;

    try {
      const data = await GetAuthenticationList({
        pageSize: 10,
        pageNo: pageNoList,
        userKeyID: common.userKeyID,
        searchKeyword:
          searchKeywordValue === undefined ? searchKeyword : searchKeywordValue,
        primarySortDirection:
          sortValue === undefined ? primarySortDirection : sortValue,
        PrimarySortColumnName: sortType == "" ? AuthSortType : sortType || null,
      });

      if (data) {
        if (data?.data?.statusCode === 200) {
          setLoader(false);
          getAuthenticationListApiCallCount = 0;
          if (data?.data?.responseData?.data) {
            const totalCount = data.data.totalCount;
            const authListData = data.data.responseData.data;

            if (pageNoList > 1 && authListData.length === 0) {
              let newPaneNo = Number(pageNoList);
              if (newPaneNo > 1) {
                newPaneNo = newPaneNo - 1;
              }
              GetAuthListData(
                newPaneNo,
                searchKeywordValue,
                sortValue,
                AuthSortType,
              );
              setCurrentPage(pageNoList);
              return;
            }

            setListCount(totalCount);
            setAuthList(authListData);
            setTotalRecords(authListData.length);
          }
        } else {
          if (getAuthenticationListApiCallCount < maxCountToRecallApi) {
            getAuthenticationListApiCallCount += 1;
            setTimeout(function () {
              GetAuthListData(i, searchKeywordValue, sortValue, AuthSortType);
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

  const AuthenticationChangeStatusDataAndDeleteData = async () => {
    setLoader(true);
    if (modelRequestData.Action === "Status") {
      if (modelRequestData.StatusType === null) {
        try {
          const Data = await AuthenticationChangeStatus(
            modelRequestData.mfaKeyID,
            modelRequestData.userKeyID,
          );
          if (Data) {
            setLoader(false);
            if (Data?.data?.statusCode === 200) {
              GetAuthListData(currentPage);
              $("#" + "ConfirmModel").one("hidden.bs.modal", () => {
                setOpenSuccessModal(true);
              });
              $("#" + "ConfirmModel").modal("hide");
            } else {
              setErrorMessage(Data?.response?.data?.errorMessage);
              setOpenErrorModal(true);
            }
            GetAuthListData(currentPage);
          }
        } catch (error) {
          console.log(error);
        }
      } else if (modelRequestData.StatusType === "2FaIsDefault") {
        try {
          const Data = await GetChangeIsDefaultStatus(
            modelRequestData.mfaKeyID,
            common.userKeyID,
            modelRequestData.isDefault,
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
            GetAuthListData(currentPage);
          }
        } catch (error) {
          console.log(error);
        }
      }
    } else if (modelRequestData.Action === "Delete") {
      try {
        const Data = await DeleteAuthentication(
          modelRequestData.mfaKeyID,
          modelRequestData.userKeyID,
        );
        if (Data) {
          setLoader(false);
          if (Data?.data?.statusCode === 200) {
            GetAuthListData(currentPage);
            $("#" + "ConfirmModel").one("hidden.bs.modal", () => {
              setOpenSuccessModal(true);
            });
            $("#" + "ConfirmModel").modal("hide");
          } else {
            setErrorMessage(Data?.response?.data?.errorMessage);
            setOpenErrorModal(true);
          }
          GetAuthListData(currentPage);
        }
      } catch (error) {
        console.log(error);
      }
    } else if (
      modelRequestData.StatusType === "2FaStatusChange" &&
      modelRequestData.Action === "2FaStatusChange"
    ) {
      try {
        const response = await GetEnable2Fa(common.userKeyID);
        if (response) {
          setLoader(false);
          if (response.data?.statusCode === 200) {
            $("#" + "ConfirmModel").one("hidden.bs.modal", () => {
              setOpenSuccessModal(true);
            });
            $("#" + "ConfirmModel").modal("hide");
          } else {
            setErrorMessage(response.response.data.errorMessage);
            setOpenErrorModal(true);
          }
        }
      } catch (error) {}
    }
  };

  // F] Pagination :
  const handlePageChange = async (pageNumber) => {
    setCurrentPage(pageNumber);
    await GetAuthListData(pageNumber); // Call your function with the selected page number
  };

  // E] Sorting & handle Function

  const handleSort = (sortValue, AuthSortType) => {
    if (AuthSortType == "AuthenticatorName") {
      setPrimarySortDirection(sortValue);
      setPrimarySortDirectionObj({
        ...primarySortDirectionObj,
        AuthenticatorNameSort: sortValue,
      });
      setCurrentPage(1);
      GetAuthListData(1, searchKeyword, sortValue, AuthSortType);
    } else if (AuthSortType == "AuthenticationTypeName") {
      setPrimarySortDirection(sortValue);
      setPrimarySortDirectionObj({
        ...primarySortDirectionObj,
        authenticationType: sortValue,
      });
      setCurrentPage(1);
      GetAuthListData(1, searchKeyword, sortValue, AuthSortType);
    }
  };

  const handleSearch = (e) => {
    const searchKeywordValue = e.target.value;
    setSearchKeyword(searchKeywordValue);
    setCurrentPage(1);
    GetAuthListData(1, searchKeywordValue);
  };

  const handleCloseSuccessModel = (data) => {
    if (modelRequestData.Action === "2FaStatusChange") {
      dispatch(
        updateState({
          enableMFA: common.enableMFA == 1 ? 0 : 1,
        }),
      );
      $("#" + "ConfirmModel").modal("hide");
      $("#" + "RecordsAvailablePopupModel").modal("hide");
      setOpenSuccessModal(false);
      setOpenErrorModal(false);
    } else {
      $("#" + "ConfirmModel").modal("hide");
      $("#" + "RecordsAvailablePopupModel").modal("hide");
      setOpenSuccessModal(false);
      setOpenErrorModal(false);
    }
  };

  const handleClose = () => {
    $("#" + "ConfirmModel").modal("hide");
    $("#" + "RecordsAvailablePopupModel").modal("hide");
    setOpenSuccessModal(false);
    setOpenErrorModal(false);
  };

  const AuthenticationAddBtnClicked = () => {
    {
      setModelRequestData({
        ...modelRequestData,
        mfaKeyID: null,
        Action: null,
      });
    }
  };

  //Design part :
  return (
    <div>
      <div className="main-content security-list-redesign">
        <div className="security-list-page">
          {/* =========================
              PAGE HEADER
              ========================= */}
          <div className="security-list-page-header">
            <div className="security-list-heading-copy">
              <h1>Security</h1>
              <p>
                Manage two-step verification methods and account authentication
                security.
              </p>
            </div>

            <div className="security-list-header-actions">
              <CommonButtonComponent
                title={getCrudButtonToolTipName("Add", "Verification")}
                name={getCrudButtonTextName("Add", "Verification")}
                setTitle={"setTitle"}
                onclick={() => AuthenticationAddBtnClicked()}
              />
            </div>
          </div>

          {/* =========================
              TWO-FACTOR VERIFICATION
              ========================= */}
          <section className="security-twofa-card">
            <div className="security-twofa-copy">
              <span className="security-twofa-icon">
                <i className="ri-shield-keyhole-line"></i>
              </span>

              <div>
                <div className="security-twofa-title-row">
                  <h2>Two-Step Verification</h2>

                  <span
                    className={`security-twofa-status ${
                      common.enableMFA == 1 ? "is-enabled" : "is-disabled"
                    }`}
                  >
                    {common.enableMFA == 1 ? "Enabled" : "Disabled"}
                  </span>
                </div>

                <p>
                  Add an extra layer of security by requiring another
                  verification method when signing in.
                </p>
              </div>
            </div>

            <Tooltip title={`Enable/Disable 2 step verification`}>
              <div className="security-twofa-toggle">
                <span>
                  {common.enableMFA == 1 ? "Disable" : "Enable"} verification
                </span>

                <FormGroup>
                  <FormControlLabel
                    control={
                      <Android12Switch
                        checked={common.enableMFA == 1}
                        onClick={() =>
                          setModelRequestData({
                            ...modelRequestData,
                            status:
                              common.enableMFA == 1 ? "Disable" : "Enable",
                            StatusType: "2FaStatusChange",
                            Action: "2FaStatusChange",
                          })
                        }
                        data-bs-toggle="modal"
                        data-bs-target="#ConfirmModel"
                      />
                    }
                  />
                </FormGroup>
              </div>
            </Tooltip>
          </section>

          {/* =========================
              AUTHENTICATOR LIST
              ========================= */}
          <section className="security-list-card">
            <div className="security-list-card-header">
              <div>
                <h2>Verification Methods</h2>
                <p>
                  Review your configured authenticators, defaults and current
                  status.
                </p>
              </div>

              {listCount > 0 && (
                <span className="security-list-count">
                  {listCount}{" "}
                  {listCount === 1 ? "verification" : "verifications"}
                </span>
              )}
            </div>

            <div className="security-list-table-scroll">
              <table className="security-list-table" id="customerTable">
                <thead>
                  <tr>
                    <th>
                      <button
                        type="button"
                        className="security-sort-button"
                        onClick={() => {
                          setSortType("AuthenticatorName");
                          handleSort(
                            primarySortDirectionObj.AuthenticatorNameSort ===
                              null
                              ? "asc"
                              : primarySortDirectionObj.AuthenticatorNameSort ===
                                  "asc"
                                ? "desc"
                                : "asc",
                            "AuthenticatorName",
                          );
                        }}
                      >
                        <span>Verification Name</span>

                        <i
                          className={
                            primarySortDirectionObj.AuthenticatorNameSort ===
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
                        className="security-sort-button"
                        onClick={() => {
                          setSortType("AuthenticationTypeName");
                          handleSort(
                            primarySortDirectionObj?.authenticationType === null
                              ? "asc"
                              : primarySortDirectionObj?.authenticationType ===
                                  "asc"
                                ? "desc"
                                : "asc",
                            "AuthenticationTypeName",
                          );
                        }}
                      >
                        <span>Verification Type</span>

                        <i
                          className={
                            primarySortDirectionObj?.authenticationType ===
                            "desc"
                              ? "fas fa-sort-alpha-up"
                              : "fas fa-sort-alpha-down"
                          }
                        ></i>
                      </button>
                    </th>

                    <th>Is Default</th>
                    <th>Status</th>
                    <th className="security-actions-heading">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {authList
                    ?.slice(0, isMobile ? isMobileRecords : desktopRecords)
                    .map((auth, index) => {
                      return (
                        <tr key={index}>
                          <td>
                            <div className="security-auth-name-cell">
                              <span className="security-auth-icon">
                                <i className="ri-shield-user-line"></i>
                              </span>

                              <span
                                className="security-auth-name"
                                title={auth.authenticatorName}
                              >
                                {isMobile ? (
                                  <>
                                    {auth.authenticatorName?.length > 20
                                      ? auth.authenticatorName.substring(
                                          0,
                                          20,
                                        ) + "..."
                                      : auth.authenticatorName}
                                  </>
                                ) : (
                                  <>
                                    {auth.authenticatorName.length > 45 ? (
                                      <Tooltip title={auth.authenticatorName}>
                                        <span>
                                          {auth.authenticatorName.substring(
                                            0,
                                            45,
                                          ) + "..."}
                                        </span>
                                      </Tooltip>
                                    ) : (
                                      <>{auth?.authenticatorName}</>
                                    )}
                                  </>
                                )}
                              </span>
                            </div>
                          </td>

                          <td>
                            <span className="security-auth-type-chip">
                              {auth?.authenticationTypeName}
                            </span>
                          </td>

                          <td>
                            <div className="security-switch-cell">
                              <span
                                className={`security-value-pill ${
                                  auth.isDefault === 1
                                    ? "is-positive"
                                    : "is-neutral"
                                }`}
                              >
                                {auth.isDefault === 0 ? "No" : "Yes"}
                              </span>

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
                                          setModelRequestData({
                                            ...modelRequestData,
                                            status: auth.isDefaultName,
                                            keyID: auth.keyID,
                                            mfaKeyID: auth.mfaKeyID,
                                            userKeyID: common.userKeyID,
                                            isDefault:
                                              auth.isDefault === 1
                                                ? false
                                                : true,
                                            StatusType: "2FaIsDefault",
                                            Action: "Status",
                                          })
                                        }
                                        checked={auth.isDefault === 1}
                                        data-bs-toggle="modal"
                                        data-bs-target="#ConfirmModel"
                                      />
                                    }
                                  />
                                </FormGroup>
                              </Tooltip>
                            </div>
                          </td>

                          <td>
                            <div className="security-switch-cell">
                              <span
                                className={`security-status-pill ${
                                  auth.statusName === "Active"
                                    ? "is-active"
                                    : "is-inactive"
                                }`}
                              >
                                {auth.statusName}
                              </span>

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
                                            status: auth.statusName,
                                            keyID: auth.keyID,
                                            mfaKeyID: auth.mfaKeyID,
                                            userKeyID: common.userKeyID,
                                            StatusType: null,
                                            Action: "Status",
                                          })
                                        }
                                        checked={auth.statusName === "Active"}
                                        data-bs-toggle="modal"
                                        data-bs-target="#ConfirmModel"
                                      />
                                    }
                                  />
                                </FormGroup>
                              </Tooltip>
                            </div>
                          </td>

                          <td className="security-actions-cell">
                            <Tooltip
                              title={getCrudButtonToolTipName(
                                "Delete",
                                "Verification",
                              )}
                            >
                              <button
                                type="button"
                                className="security-delete-button"
                                data-bs-toggle="modal"
                                data-bs-target="#ConfirmModel"
                                onClick={() =>
                                  setModelRequestData({
                                    ...modelRequestData,
                                    mfaKeyID: auth.mfaKeyID,
                                    authenticatorName: auth.authenticatorName,
                                    userKeyID: common.userKeyID,
                                    StatusType: null,
                                    Action: "Delete",
                                  })
                                }
                              >
                                <i className="ri-delete-bin-5-line"></i>
                              </button>
                            </Tooltip>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>

            {totalRecords <= 0 && (
              <div className="security-list-empty-wrap">
                <NoResultFoundModel
                  name={"2 Step Verification"}
                  totalRecords={totalRecords}
                />
              </div>
            )}

            {listCount > pageSize && (
              <div className="security-list-pagination">
                <PaginationComponent
                  totalCount={listCount}
                  totalPages={totalPage}
                  desktopRecords={desktopRecords}
                  currentPage={currentPage}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </section>

          <ErrorModel
            ErrorModel={openErrorModal}
            handleClose={handleClose}
            ErrorMessage={formattedErrorMessage}
          />

          <ConfirmModel
            openErrorModal={openErrorModal}
            openSuccessModal={openSuccessModal}
            modelRequestData={modelRequestData}
            UpdatedStatus={AuthenticationChangeStatusDataAndDeleteData}
          />

          <SuccessModal
            handleClose={handleCloseSuccessModel}
            setOpenSuccessModal={setOpenSuccessModal}
            openSuccessModal={openSuccessModal}
            modelAction={modelRequestData.Action}
            message={
              modelRequestData.Action === "Delete"
                ? "Verification" + " " + modelRequestData.authenticatorName
                : modelRequestData.Action === "2FaStatusChange"
                  ? `Verification status has been changed successfully!`
                  : "Status has been changed successfully!"
            }
          />
        </div>

        <div className="security-list-footer-wrap">
          <Footer />
        </div>
      </div>

      {/* start back-to-top */}
      <button
        onClick="topFunction()"
        className="btn btn-danger btn-icon"
        id="back-to-top"
      >
        <i className="ri-arrow-up-line"></i>
      </button>
      {/* end back-to-top */}
    </div>
  );
};

export default SecurityList;
