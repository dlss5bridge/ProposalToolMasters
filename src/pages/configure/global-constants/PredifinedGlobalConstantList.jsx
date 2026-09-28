/* global $ */
import React, { useContext, useEffect, useState } from "react";
import "./PredefineGlobalConstant.css";
import "./PredefineGlobalConstant-redesign.css";
import CommonButtonComponent from "../../../components/CommonButtonComponent";
import GlobalConstantModal from "./GlobalConstantModel";
import ConfirmModel from "../../../components/ConfirmationBox";
import {
  GetGlobalConstantList,
  DeleteGlobalConstant,
  GlobalConstantChangeStatus,
  GetGlobalConstantModel,
  CopyGlobalConstant,
} from "../../../redux/Services/Config/GlobalConstantApi";
import PaginationComponent from "../../../components/PaginationModel";
import { useSelector } from "react-redux";
import Android12Switch from "../../../components/AndroidSwitch";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Tooltip from "@mui/material/Tooltip";
import NoResultFoundModel from "../../../components/NoResultFoundModel";
import { AuthContextProvider } from "../../../AuthContext/AuthContext";
import SuccessModal from "../../../components/SuccessModal";
import ErrorModel from "../../../components/ErrorModel";
import Footer from "../../../components/Footer";
import RecordsAvailablePopupModel from "../../../components/RecordsAvailablePopupModel";

function Global_Constants() {
  // A] States Declaration :
  let getGlobalConstantListApiCallCount = 0;
  const [totalRecords, setTotalRecords] = useState(-1);

  const moduleName = "Global Constant";
  const [globalConstantList, setGlobalConstantList] = useState([]);
  const [isAddUpdateActionDone, setIsAddUpdateActionDone] = useState(false);
  const [modelRequestData, setModelRequestData] = useState({
    globalPricingDriverKeyID: null,
    driverName: null,
    keyID: null,
    status: "",
    Action: "",
    userKeyID: null,
    Type: null,
  });
  const [primarySortDirectionObj, setPrimarySortDirectionObj] = useState({
    DriverNameSort: null,
    ProfessionTypeSort: null,
    TypeSort: null,
  });
  const [sortType, setSortType] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const common = useSelector((state) => state.Storage); //Getting Logged Users Details From Persist Storage of redux hooks
  const [primarySortDirection, setPrimarySortDirection] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState(null);
  const [openSuccessModal, setOpenSuccessModal] = React.useState(false);
  const [openErrorModal, setOpenErrorModal] = useState(false);
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
    handleErrorMessage,
    formatValue,
  } = useContext(AuthContextProvider);
  const pageSize = isMobile ? isMobileRecords : desktopRecords;
  const [showProfessionType, setShowProfessionType] = useState(
    common.organisationKeyID === null || common.professionTypeLists.length > 1,
  );
  const formattedErrorMessage = handleErrorMessage(errorMessage);
  // B] Initial useEffect :
  // 1) Will Call Initial Api Like List Api
  useEffect(() => {
    setTopbar("block");
  }, []);

  useEffect(() => {
    GetGlobalConstantListData(1, null, null, null);
  }, []);

  //2) This useEffect will trigger when we successfully add or update record from popup model
  useEffect(() => {
    if (isAddUpdateActionDone) {
      if (modelRequestData.Action === null) {
        setSearchKeyword(null);
        setPrimarySortDirection(null);
        setCurrentPage(1);
        setSortType(null);
        GetGlobalConstantListData(1, null, null, null);
      } else {
        GetGlobalConstantListData(currentPage);
      }

      setIsAddUpdateActionDone(false);
    }
  }, [isAddUpdateActionDone]);

  // C] Calling All Api's like List and other Here :
  // 1) Global Constant List Data
  const GetGlobalConstantListData = async (
    i,
    searchKeywordValue,
    sortValue,
    GlobalConstantSortType,
  ) => {
    setLoader(true);
    const pageNoList = i - 1;
    try {
      const data = await GetGlobalConstantList({
        pageSize: pageSize,
        pageNo: pageNoList,
        OrganisationKeyID: common.organisationKeyID,
        searchKeyword:
          searchKeywordValue === undefined ? searchKeyword : searchKeywordValue,
        primarySortDirection:
          sortValue === undefined ? primarySortDirection : sortValue,
        PrimarySortColumnName:
          GlobalConstantSortType === null
            ? null
            : GlobalConstantSortType == undefined ||
                GlobalConstantSortType == ""
              ? sortType
              : GlobalConstantSortType !== null
                ? GlobalConstantSortType
                : null,
      });
      if (data) {
        if (data?.data?.statusCode === 200) {
          setLoader(false);
          getGlobalConstantListApiCallCount = 0;
          if (data?.data?.responseData?.data) {
            const totalCount = data.data.totalCount;
            const globalConstantListData = data.data.responseData.data;
            if (pageNoList > 0 && globalConstantListData.length === 0) {
              let newPaneNo = Number(pageNoList);
              if (newPaneNo > 1) {
                newPaneNo = newPaneNo - 1;
              }
              GetGlobalConstantListData(
                newPaneNo,
                searchKeywordValue,
                sortValue,
                GlobalConstantSortType,
              );
              setCurrentPage(pageNoList);
              return;
            }
            setListCount(totalCount);
            setGlobalConstantList(globalConstantListData);
            setTotalRecords(globalConstantListData.length);
          }
        } else {
          if (getGlobalConstantListApiCallCount < maxCountToRecallApi) {
            getGlobalConstantListApiCallCount += 1;
            setTimeout(function () {
              GetGlobalConstantListData(
                i,
                searchKeywordValue,
                sortValue,
                GlobalConstantSortType,
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

  // D] Event Handling Functions will call here.
  // 1) On Click Global Constant Add Button
  const GlobalConstantEditBtnClicked = async (GlobalConstant, type) => {
    if (type === "editPredefined") {
      setLoader(true);
      const data = await GetGlobalConstantModel(
        GlobalConstant.globalPricingDriverKeyID,
        true,
      );
      if (data?.data?.statusCode === 200) {
        setLoader(false);
        $("#" + "addUpdateModal").modal("show");
        setModelRequestData({
          ...modelRequestData,
          globalPricingDriverKeyID: GlobalConstant.globalPricingDriverKeyID,
          Action: "Update",
          Type: true,
        });
      } else {
        setLoader(false);
        setErrorMessage(data?.response?.data?.errorMessage);
        setOpenErrorModal(true);
      }
    } else {
      setModelRequestData({
        ...modelRequestData,
        globalPricingDriverKeyID: GlobalConstant.globalPricingDriverKeyID,
        Action: "Update",
        Type: null,
      });
    }
  };

  // E] Event Handling Functions will call here.
  // 1) On Click Global Constant Add Button
  const GlobalConstantAddBtnClicked = () => {
    {
      setModelRequestData({
        ...modelRequestData,
        globalPricingDriverKeyID: null,
        Action: null,
      });
    }
  };

  // Update Function Modal
  // 2) On Click Global Constant Status Button
  const GlobalConstantChangeStatusDataAndDeleteData = async () => {
    setLoader(true);
    if (modelRequestData.Action === "Status") {
      try {
        const Data = await GlobalConstantChangeStatus(
          modelRequestData.globalPricingDriverKeyID,
          modelRequestData.userKeyID,
        );
        if (Data) {
          setLoader(false);
          if (Data?.data?.statusCode === 200) {
            if (
              Data?.data?.responseData.globalConstantExistsInServices.length !==
              0
            ) {
              const servicePackageNames =
                Data?.data?.responseData.globalConstantExistsInServices.map(
                  (item) => item.serviceName,
                );
              setModelRequestData({
                ...modelRequestData,
                Action: "GlobalConstantWarning",
                message: `Following services are assigned to the selected ${moduleName.toLowerCase()}.You must remove the services from this ${moduleName.toLowerCase()} before attempting to mark it as InActive.`,
                ServiceName: servicePackageNames,
              });
              $("#" + "ConfirmModel").modal("hide");
              $("#" + "RecordsAvailablePopupModel").modal("show");
              GetGlobalConstantListData(currentPage);
            } else {
              GetGlobalConstantListData(currentPage);
              $("#" + "ConfirmModel").one("hidden.bs.modal", () => {
                setOpenSuccessModal(true);
              });
              $("#" + "ConfirmModel").modal("hide");
            }
          } else {
            setErrorMessage(Data?.response?.data?.errorMessage);
            setOpenErrorModal(true);
          }
          GetGlobalConstantListData(currentPage);
        }
      } catch (error) {
        console.log(error);
      }
    } else if (modelRequestData.Action === "Delete") {
      try {
        const Data = await DeleteGlobalConstant(
          modelRequestData.globalPricingDriverKeyID,
          modelRequestData.userKeyID,
        );
        if (Data) {
          setLoader(false);
          if (Data?.data?.statusCode === 200) {
            if (
              Data?.data?.responseData.globalConstantExistsInServices.length !==
              0
            ) {
              const servicePackageNames =
                Data?.data?.responseData.globalConstantExistsInServices.map(
                  (item) => item.serviceName,
                );
              setModelRequestData({
                ...modelRequestData,
                Action: "GlobalConstantWarning",
                message: `Following services are assigned to the selected ${moduleName.toLowerCase()}.You must remove the services from this ${moduleName.toLowerCase()} before attempting to mark it as InActive.`,
                ServiceName: servicePackageNames,
              });
              $("#" + "ConfirmModel").modal("hide");
              $("#" + "RecordsAvailablePopupModel").modal("show");
              GetGlobalConstantListData(currentPage);
            } else {
              GetGlobalConstantListData(currentPage);
              $("#" + "ConfirmModel").one("hidden.bs.modal", () => {
                setOpenSuccessModal(true);
              });
              $("#" + "ConfirmModel").modal("hide");
            }
          } else {
            setErrorMessage(Data?.response?.data?.errorMessage);
            setOpenErrorModal(true);
          }
          GetGlobalConstantListData(currentPage);
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  // Copy Record
  const CopyGlobalConstantData = async () => {
    if (!common.userKeyID) return;
    try {
      setLoader(true);
      const data = await CopyGlobalConstant(
        modelRequestData.globalPricingDriverKeyID,
        common.userKeyID,
      );
      if (data?.data?.statusCode === 200) {
        setLoader(false);
        $("#" + "ConfirmModel").one("hidden.bs.modal", () => {
          setOpenSuccessModal(true);
        });
        $("#" + "ConfirmModel").modal("hide");
        GetGlobalConstantListData(currentPage);
      } else {
        setLoader(false);
        setErrorMessage(data?.data?.errorMessage);
        setOpenErrorModal(true);
      }
    } catch (error) {
      console.error(error);
    }
  };
  // F] Pagination :
  const HandlePageChange = async (pageNumber) => {
    setCurrentPage(pageNumber);
    await GetGlobalConstantListData(pageNumber); // Call your function with the selected page number
  };

  // E] Sorting
  const handleSort = (sortValue, GlobalConstantSortType) => {
    if (GlobalConstantSortType == "DriverName") {
      setPrimarySortDirection(sortValue);
      setPrimarySortDirectionObj({
        ...primarySortDirectionObj,
        DriverNameSort: sortValue,
      });
      setCurrentPage(1);
      GetGlobalConstantListData(
        1,
        searchKeyword,
        sortValue,
        GlobalConstantSortType,
      );
    } else if (GlobalConstantSortType == "ProfessionType") {
      setPrimarySortDirection(sortValue);
      setPrimarySortDirectionObj({
        ...primarySortDirectionObj,
        ProfessionTypeSort: sortValue,
      });
      setCurrentPage(1);
      GetGlobalConstantListData(
        1,
        searchKeyword,
        sortValue,
        GlobalConstantSortType,
      );
    }
  };

  //Searching
  const HandleSearch = (e) => {
    const searchKeywordValue = e.target.value;
    setSearchKeyword(searchKeywordValue);
    setCurrentPage(1);
    GetGlobalConstantListData(1, searchKeywordValue);
  };

  const handleClose = () => {
    $("#" + "ConfirmModel").modal("hide");
    $("#" + "RecordsAvailablePopupModel").modal("hide");
    setOpenSuccessModal(false);
    setOpenErrorModal(false);
  };
  const canAdd =
    (userAccessData.Admin_Config_Global_Constant_CanAdd &&
      common.organisationKeyID !== null) ||
    (userAccessData.SuperAdmin_Config_Global_Constant_CanAdd &&
      common.organisationKeyID === null);

  const canEdit =
    (userAccessData.Admin_Config_Global_Constant_CanEdit &&
      common.organisationKeyID !== null) ||
    (userAccessData.SuperAdmin_Config_Global_Constant_CanEdit &&
      common.organisationKeyID === null);

  const canDelete =
    (userAccessData.Admin_Config_Global_Constant_CanDelete &&
      common.organisationKeyID !== null) ||
    (userAccessData.SuperAdmin_Config_Global_Constant_CanDelete &&
      common.organisationKeyID === null);

  return (
    <>
      <div className="global-constant-redesign">
        <div className="global-constant-page">
          <div className="global-constant-page-header">
            <div>
              <h1 className="global-constant-page-title">Global Constants</h1>
              <p className="global-constant-page-subtitle">
                Manage constant values.
              </p>
            </div>

            {canAdd && (
              <div className="global-constant-add-action">
                <CommonButtonComponent
                  title={getCrudButtonToolTipName("Add", moduleName)}
                  AddBtn={() => GlobalConstantAddBtnClicked()}
                  dataBsTarget="#addUpdateModal"
                  data_bs_toggle="modal"
                  name={getCrudButtonTextName("Add", moduleName)}
                />
              </div>
            )}
          </div>

          <section className="global-constant-list-card">
            <div className="global-constant-toolbar">
              <div className="global-constant-search-wrap">
                <i className="ri-search-line global-constant-search-icon"></i>
                <input
                  type="text"
                  value={searchKeyword || ""}
                  onChange={HandleSearch}
                  className="global-constant-search-input"
                  placeholder={
                    isMobile
                      ? "Search"
                      : getPlaceholderTextName("Search", moduleName)
                  }
                />
              </div>

              {/* <div className="global-constant-record-count">
                {listCount > 0
                  ? `${listCount} ${listCount === 1 ? "constant" : "constants"}`
                  : ""}
              </div> */}
            </div>

            <div className="global-constant-table-wrap">
              <table
                className={`global-constant-table ${
                  !showProfessionType
                    ? "global-constant-table--no-profession"
                    : ""
                }`}
                id="customerTable"
              >
                <thead>
                  <tr>
                    <th>
                      <button
                        type="button"
                        className="global-constant-sort-button"
                        onClick={() => {
                          setSortType("DriverName");
                          handleSort(
                            primarySortDirectionObj.DriverNameSort === null
                              ? "asc"
                              : primarySortDirectionObj.DriverNameSort === "asc"
                                ? "desc"
                                : "asc",
                            "DriverName",
                          );
                        }}
                      >
                        <span>Driver Name</span>
                        <i
                          className={
                            primarySortDirectionObj.DriverNameSort === "desc"
                              ? "ri-arrow-up-line"
                              : "ri-arrow-down-line"
                          }
                        ></i>
                      </button>
                    </th>

                    {showProfessionType && (
                      <th>
                        <button
                          type="button"
                          className="global-constant-sort-button"
                          onClick={() => {
                            setSortType("ProfessionType");
                            handleSort(
                              primarySortDirectionObj.ProfessionTypeSort ===
                                null
                                ? "asc"
                                : primarySortDirectionObj.ProfessionTypeSort ===
                                    "asc"
                                  ? "desc"
                                  : "asc",
                              "ProfessionType",
                            );
                          }}
                        >
                          <span>Profession Type</span>
                          <i
                            className={
                              primarySortDirectionObj.ProfessionTypeSort ===
                              "desc"
                                ? "ri-arrow-up-line"
                                : "ri-arrow-down-line"
                            }
                          ></i>
                        </button>
                      </th>
                    )}

                    <th>Type</th>
                    <th>Value</th>
                    <th>Status</th>
                    <th className="global-constant-actions-heading">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {globalConstantList
                    .slice(0, isMobile ? isMobileRecords : desktopRecords)
                    .map((GlobalConstant) => {
                      const driverName =
                        GlobalConstant.driverName?.replace(/\b\w/g, (l) =>
                          l.toUpperCase(),
                        ) || "-";

                      const statusClass = (GlobalConstant.statusName || "")
                        .toLowerCase()
                        .replace(/\s+/g, "-");

                      return (
                        <tr
                          className="global-constant-table-row"
                          key={
                            GlobalConstant.globalPricingDriverKeyID ||
                            GlobalConstant.driverName
                          }
                        >
                          <td>
                            <div className="global-constant-name-cell">
                              {/* <span className="global-constant-icon">
                                <i className="ri-function-line"></i>
                              </span> */}

                              <div className="global-constant-name-copy">
                                <div className="global-constant-name-line">
                                  {GlobalConstant.notifySAChanges !== null &&
                                    common.organisationKeyID !== null && (
                                      <Tooltip title="View System Administrator Changes">
                                        <button
                                          type="button"
                                          className="global-constant-notification-button"
                                          onClick={() =>
                                            GlobalConstantEditBtnClicked(
                                              GlobalConstant,
                                              "editPredefined",
                                            )
                                          }
                                        >
                                          <i className="ri-notification-3-line"></i>
                                        </button>
                                      </Tooltip>
                                    )}

                                  <Tooltip
                                    title={
                                      driverName.length > 55
                                        ? GlobalConstant.driverName
                                        : ""
                                    }
                                  >
                                    <span className="global-constant-primary-text">
                                      {isMobile && driverName.length > 24
                                        ? `${driverName.substring(0, 24)}...`
                                        : !isMobile && driverName.length > 55
                                          ? `${driverName.substring(0, 55)}...`
                                          : driverName}
                                    </span>
                                  </Tooltip>
                                </div>
                              </div>
                            </div>
                          </td>

                          {showProfessionType && (
                            <td>
                              <span
                                className="global-constant-profession-chip"
                                title={GlobalConstant.professionTypeNames}
                              >
                                {GlobalConstant.professionTypeNames || "-"}
                              </span>
                            </td>
                          )}

                          <td>
                            <span className="global-constant-type-badge">
                              {GlobalConstant.driverTypeName || "-"}
                            </span>
                          </td>

                          <td>
                            <span className="global-constant-value">
                              {formatValue(GlobalConstant.driverValue)}
                            </span>
                          </td>

                          <td>
                            <div className="global-constant-status-control">
                              <span
                                className={`global-constant-status-badge global-constant-status-badge--${statusClass}`}
                              >
                                <span className="global-constant-status-dot"></span>
                                {GlobalConstant.statusName || "-"}
                              </span>

                              {canDelete && (
                                <Tooltip
                                  title={getCrudButtonToolTipName(
                                    "Change Status",
                                  )}
                                >
                                  <FormGroup>
                                    <FormControlLabel
                                      className="global-constant-switch-label"
                                      control={
                                        <Android12Switch
                                          onClick={() =>
                                            setModelRequestData({
                                              ...modelRequestData,
                                              status: GlobalConstant.statusName,
                                              globalPricingDriverKeyID:
                                                GlobalConstant.globalPricingDriverKeyID,
                                              userKeyID: common.userKeyID,
                                              Action: "Status",
                                            })
                                          }
                                          checked={
                                            GlobalConstant.statusName ===
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

                          <td className="global-constant-actions-cell">
                            <div className="global-constant-row-actions">
                              <Tooltip
                                title={getCrudButtonToolTipName(
                                  "Copy",
                                  moduleName,
                                )}
                              >
                                <button
                                  type="button"
                                  className="global-constant-action-button global-constant-action-button--copy"
                                  data-bs-toggle="modal"
                                  data-bs-target="#ConfirmModel"
                                  onClick={() =>
                                    setModelRequestData({
                                      ...modelRequestData,
                                      driverName: GlobalConstant.driverName,
                                      Action: "Copy",
                                      globalPricingDriverKeyID:
                                        GlobalConstant.globalPricingDriverKeyID,
                                      userKeyID: common.userKeyID,
                                    })
                                  }
                                >
                                  <i className="ri-file-copy-line"></i>
                                </button>
                              </Tooltip>

                              {canEdit && (
                                <Tooltip
                                  title={getCrudButtonToolTipName(
                                    "Update",
                                    moduleName,
                                  )}
                                >
                                  <button
                                    type="button"
                                    className="global-constant-action-button global-constant-action-button--edit"
                                    onClick={() =>
                                      GlobalConstantEditBtnClicked(
                                        GlobalConstant,
                                      )
                                    }
                                    data-bs-toggle="modal"
                                    data-bs-target="#addUpdateModal"
                                  >
                                    <i className="ri-pencil-line"></i>
                                  </button>
                                </Tooltip>
                              )}

                              {canDelete && (
                                <Tooltip
                                  title={getCrudButtonToolTipName(
                                    "Delete",
                                    moduleName,
                                  )}
                                >
                                  <button
                                    type="button"
                                    className="global-constant-action-button global-constant-action-button--delete"
                                    onClick={() =>
                                      setModelRequestData({
                                        ...modelRequestData,
                                        globalPricingDriverKeyID:
                                          GlobalConstant.globalPricingDriverKeyID,
                                        driverName: GlobalConstant.driverName,
                                        userKeyID: common.userKeyID,
                                        Action: "Delete",
                                      })
                                    }
                                    data-bs-toggle="modal"
                                    data-bs-target="#ConfirmModel"
                                  >
                                    <i className="ri-delete-bin-line"></i>
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

              {totalRecords <= 0 && (
                <div className="global-constant-empty-state">
                  <NoResultFoundModel
                    name={moduleName}
                    totalRecords={totalRecords}
                  />
                </div>
              )}
            </div>

            {listCount > pageSize && (
              <div className="global-constant-pagination-wrap">
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

        <ErrorModel
          ErrorModel={openErrorModal}
          handleClose={handleClose}
          ErrorMessage={formattedErrorMessage}
        />

        <ConfirmModel
          openErrorModal={openErrorModal}
          openSuccessModal={openSuccessModal}
          modelRequestData={modelRequestData}
          UpdatedStatus={
            modelRequestData.Action === "Delete" ||
            modelRequestData.Action === "Status"
              ? GlobalConstantChangeStatusDataAndDeleteData
              : CopyGlobalConstantData
          }
        />

        <RecordsAvailablePopupModel
          handleClose={handleClose}
          openErrorModal={openErrorModal}
          openSuccessModal={openSuccessModal}
          modelRequestData={modelRequestData}
          UpdatedStatus={GlobalConstantChangeStatusDataAndDeleteData}
        />

        <SuccessModal
          handleClose={handleClose}
          setOpenSuccessModal={setOpenSuccessModal}
          openSuccessModal={openSuccessModal}
          modelAction={modelRequestData.Action}
          message={`${
            modelRequestData.Action === "Delete"
              ? `${moduleName} ${modelRequestData.driverName}`
              : modelRequestData.Action === "Copy"
                ? `Copy of ${modelRequestData.driverName} has been created successfully!`
                : "Status has been changed successfully!"
          }`}
        />

        <GlobalConstantModal
          class="modal fade"
          id="addUpdateModal"
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
}

export default Global_Constants;
