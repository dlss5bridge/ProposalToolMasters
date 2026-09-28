/* global $ */
import React, { lazy, Suspense, useContext, useEffect, useState } from "react";
import "./GlobalPricingDriversStyle.css";
import "./GlobalPricingDriversStyle-redesign.css";
import CommonButtonComponent from "../../../components/CommonButtonComponent";
// import Global_Pricing_Driver_model from "./GlobalPricingDriverModel";
import {
  CopyGlobalPricingDriver,
  DeleteGlobalPricingDriver,
  GetGlobalPricingDriverList,
  GetGlobalPricingDriverModel,
  GlobalPricingDriverChangeStatus,
} from "../../../redux/Services/Config/GlobalPricingDriverApi";
import PaginationComponent from "../../../components/PaginationModel";
import { useSelector } from "react-redux";
import Android12Switch from "../../../components/AndroidSwitch";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import ConfirmModel from "../../../components/ConfirmationBox";
import Tooltip from "@mui/material/Tooltip";
import NoResultFoundModel from "../../../components/NoResultFoundModel";
import { AuthContextProvider } from "../../../AuthContext/AuthContext";
import SuccessModal from "../../../components/SuccessModal";
import ErrorModel from "../../../components/ErrorModel";
import Footer from "../../../components/Footer";
import RecordsAvailablePopupModel from "../../../components/RecordsAvailablePopupModel";
const Global_Pricing_Driver_model = lazy(
  () => import("./GlobalPricingDriverModel"),
);

function Predefined_Global_Pricing_Drivers() {
  let getGlobalPricingDriverListApiCallCount = 0;
  const moduleName = "Global Pricing Driver";
  const moduleNameGlobalProspect = "Global Prospect Variables";
  // A] States Declaration :
  const [errorMessage, setErrorMessage] = useState("");
  const [isAddUpdateActionDone, setIsAddUpdateActionDone] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState("GlobalPricingDriver");
  const [modelRequestData, setModelRequestData] = useState({
    Action: "",
    status: "",
    message: "",
    ServiceName: [],
    name: null,
    ServiceKeyID: null,
    globalPricingDriverKeyID: null,
    variationKeyID: null,
    userKeyID: null,
    slabKeyID: null,
    addedFor: null,
  });
  const [primarySortDirectionObj, setPrimarySortDirectionObj] = useState({
    DriverNameSort: null,
    ProfessionTypeSort: null,
    TypeSort: null,
  });
  const [sortType, setSortType] = useState(null);
  const [globalPricingDriverList, setGlobalPricingDriverList] = useState([]);
  const common = useSelector((state) => state.Storage); //Getting Logged Users Details From Persist Storage of redux hooks
  const [showProfessionType, setShowProfessionType] = useState(
    common.organisationKeyID === null || common.professionTypeLists.length > 1,
  );
  const [primarySortDirection, setPrimarySortDirection] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState(null);
  const [openSuccessModal, setOpenSuccessModal] = React.useState(false);
  const [openErrorModal, setOpenErrorModal] = useState(false);
  const [totalRecords, setTotalRecords] = useState(-1);
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
  } = useContext(AuthContextProvider);
  const pageSize = isMobile ? isMobileRecords : desktopRecords;
  // B] Initial useEffect :
  // 1) Will Call Initial Api Like List Api

  useEffect(() => {
    setTopbar("block");
    GetGlobalPricingDriverListData(
      1,
      null,
      null,
      null,
      modelRequestData.addedFor,
    );
  }, []);
  const formattedErrorMessage = handleErrorMessage(errorMessage);
  //2) This useEffect will trigger when we successfully add or update record from popup model
  useEffect(() => {
    if (isAddUpdateActionDone) {
      if (modelRequestData.Action === null) {
        setSearchKeyword("");
        setPrimarySortDirection(null);
        setCurrentPage(1);
        GetGlobalPricingDriverListData(
          1,
          null,
          null,
          null,
          modelRequestData.addedFor,
        );
      } else {
        GetGlobalPricingDriverListData(
          currentPage,
          null,
          null,
          null,
          modelRequestData.addedFor,
        );
      }
      setIsAddUpdateActionDone(false);
    }
  }, [isAddUpdateActionDone]);

  // C] Calling All Api's like List and other Here :
  // 1) Get Global Pricing Driver List Data
  const GetGlobalPricingDriverListData = async (
    i,
    searchKeywordValue,
    sortValue,
    GlobalDriverSortType,
    addedFor,
  ) => {
    setLoader(true);
    const pageNoList = i - 1;
    try {
      const response = await GetGlobalPricingDriverList({
        pageSize: pageSize,
        pageNo: pageNoList,
        organisationKeyID: common.organisationKeyID,
        SearchKeyword:
          searchKeywordValue === undefined ? searchKeyword : searchKeywordValue,
        primarySortDirection:
          sortValue === undefined ? primarySortDirection : sortValue,
        PrimarySortColumnName:
          GlobalDriverSortType == undefined || GlobalDriverSortType == ""
            ? sortType
            : GlobalDriverSortType !== null
              ? GlobalDriverSortType
              : null,
        addedFor: addedFor,
      });
      if (response) {
        if (response?.data?.statusCode === 200) {
          setLoader(false);
          getGlobalPricingDriverListApiCallCount = 0;
          if (response?.data?.responseData?.data) {
            const totalCount = response.data.totalCount;
            const GlobalDriverCategoryListData =
              response.data.responseData.data;
            if (pageNoList > 0 && GlobalDriverCategoryListData.length === 0) {
              let newPaneNo = Number(pageNoList);
              if (newPaneNo > 1) {
                newPaneNo = newPaneNo - 1;
              }
              GetGlobalPricingDriverListData(
                newPaneNo,
                searchKeywordValue,
                sortValue,
                GlobalDriverSortType,
                addedFor,
              );
              setCurrentPage(pageNoList);
              return;
            }
            setListCount(totalCount);
            setGlobalPricingDriverList(GlobalDriverCategoryListData);
            setTotalRecords(GlobalDriverCategoryListData.length);
          }
        } else {
          if (getGlobalPricingDriverListApiCallCount < maxCountToRecallApi) {
            getGlobalPricingDriverListApiCallCount += 1;
            setTimeout(function () {
              GetGlobalPricingDriverListData(
                i,
                searchKeywordValue,
                sortValue,
                GlobalDriverSortType,
                addedFor,
              );
            }, 2000);
          } else {
            setLoader(false);
          }

          setErrorMessage(response?.data?.errorMessage);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  // E] Event Handling Functions will call here.
  // 1) On Click Global Pricing Driver Add Button
  const GlobalPricingDriverAddBtnClicked = () => {
    {
      setModelRequestData({
        ...modelRequestData,
        Action: null,
        globalPricingDriverKeyID: null,
        addedFor:
          activeTab === "GlobalProspectDriver" ? "GlobalProspect" : null,
      });
    }
  };

  // 2) On Click Global Pricing Driver Edit Button
  const GlobalPricingDriverEditBtnClicked = async (GPD, type) => {
    if (type === "editPredefined") {
      setLoader(true);
      const data = await GetGlobalPricingDriverModel(
        GPD.globalPricingDriverKeyID,
        true,
      );
      if (data?.data?.statusCode === 200) {
        setLoader(false);
        $("#" + "GlobalPricingModel").modal("show");
        setModelRequestData({
          ...modelRequestData,
          globalPricingDriverKeyID: GPD.globalPricingDriverKeyID,
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
        Action: "Update",
        globalPricingDriverKeyID: GPD.globalPricingDriverKeyID,
        Type: undefined,
      });
    }
  };

  // Update Function Modal
  // 3) On Click Global Pricing Driver Status Button
  const GlobalPricingDriverChangeStatusDataAndDeleteData = async () => {
    setLoader(true);
    if (modelRequestData.Action === "Status") {
      try {
        const response = await GlobalPricingDriverChangeStatus(
          modelRequestData.globalPricingDriverKeyID,
          modelRequestData.userKeyID,
        );
        if (response) {
          setLoader(false);
          if (response?.data?.statusCode === 200) {
            if (
              response?.data?.responseData.globalPricingDriverExistsInServices
                .length !== 0
            ) {
              const servicePackageNames =
                response?.data?.responseData.globalPricingDriverExistsInServices.map(
                  (item) => item.serviceName,
                );
              setModelRequestData({
                ...modelRequestData,
                Action: "GlobalPricingDriversWarning",
                message: `Following services are assigned to the selected ${moduleName.toLowerCase()}.You must remove the services from this ${moduleName.toLowerCase()} before attempting to mark it as InActive.`,
                ServiceName: servicePackageNames,
              });
              $("#" + "ConfirmModel").modal("hide");
              $("#" + "RecordsAvailablePopupModel").modal("show");
              GetGlobalPricingDriverListData(
                currentPage,
                null,
                null,
                null,
                modelRequestData.addedFor,
              );
            } else {
              setModelRequestData({
                ...modelRequestData,
                Action: null,
                gloalPricingDriverKeyID: null,
              });
              GetGlobalPricingDriverListData(
                currentPage,
                null,
                null,
                null,
                modelRequestData.addedFor,
              );
              $("#" + "ConfirmModel").one("hidden.bs.modal", () => {
                setOpenSuccessModal(true);
              });
              $("#" + "ConfirmModel").modal("hide");
            }
          } else {
            setErrorMessage(response?.response?.data?.errorMessage);
            setOpenErrorModal(true);
          }
          GetGlobalPricingDriverListData(
            currentPage,
            null,
            null,
            null,
            modelRequestData.addedFor,
          );
        }
      } catch (error) {
        console.log(error);
      }
    } else if (modelRequestData.Action === "Delete") {
      try {
        const response = await DeleteGlobalPricingDriver(
          modelRequestData.globalPricingDriverKeyID,
          modelRequestData.userKeyID,
        );
        if (response) {
          setLoader(false);
          if (response?.data?.statusCode === 200) {
            if (
              response?.data?.responseData.globalPricingDriverExistsInServices
                .length !== 0
            ) {
              const servicePackageNames =
                response?.data?.responseData.globalPricingDriverExistsInServices.map(
                  (item) => item.serviceName,
                );
              setModelRequestData({
                ...modelRequestData,
                Action: "GlobalPricingDriversWarning",
                message: `Following services are assigned to the selected ${moduleName.toLowerCase()}.You must remove the services from this ${moduleName.toLowerCase()} before attempting to mark it as InActive.`,
                ServiceName: servicePackageNames,
              });
              $("#" + "ConfirmModel").modal("hide");
              $("#" + "RecordsAvailablePopupModel").modal("show");
              GetGlobalPricingDriverListData(
                currentPage,
                null,
                null,
                null,
                modelRequestData.addedFor,
              );
            } else {
              GetGlobalPricingDriverListData(
                currentPage,
                null,
                null,
                null,
                modelRequestData.addedFor,
              );
              $("#" + "ConfirmModel").one("hidden.bs.modal", () => {
                setOpenSuccessModal(true);
              });
              $("#" + "ConfirmModel").modal("hide");
            }
          } else {
            setErrorMessage(response?.response?.data?.errorMessage);
            setOpenErrorModal(true);
          }
          GetGlobalPricingDriverListData(
            currentPage,
            null,
            null,
            null,
            modelRequestData.addedFor,
          );
        }
      } catch (error) {
        console.log(error);
      }
    }
  };
  // Copy
  const CopyGlobalPricingDriverData = async () => {
    if (!common.userKeyID) return;
    try {
      setLoader(true);
      const data = await CopyGlobalPricingDriver(
        modelRequestData.globalPricingDriverKeyID,
        common.userKeyID,
      );
      if (data?.data?.statusCode === 200) {
        setLoader(false);
        $("#" + "ConfirmModel").one("hidden.bs.modal", () => {
          setOpenSuccessModal(true);
        });
        $("#" + "ConfirmModel").modal("hide");
        GetGlobalPricingDriverListData(currentPage);
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
  const handlePageChange = async (pageNumber) => {
    setCurrentPage(pageNumber);
    await GetGlobalPricingDriverListData(pageNumber); // Call your function with the selected page number
  };

  // E] Sorting

  const handleSort = (sortValue, GlobalDriverSortType) => {
    if (GlobalDriverSortType == "DriverName") {
      setPrimarySortDirection(sortValue);
      setPrimarySortDirectionObj({
        ...primarySortDirectionObj,
        DriverNameSort: sortValue,
      });
      setCurrentPage(1);
      GetGlobalPricingDriverListData(
        1,
        searchKeyword,
        sortValue,
        GlobalDriverSortType,
        modelRequestData.addedFor,
      );
    } else if (GlobalDriverSortType == "ProfessionType") {
      setPrimarySortDirection(sortValue);
      setPrimarySortDirectionObj({
        ...primarySortDirectionObj,
        ProfessionTypeSort: sortValue,
      });
      setCurrentPage(1);
      GetGlobalPricingDriverListData(
        1,
        searchKeyword,
        sortValue,
        GlobalDriverSortType,
        modelRequestData.addedFor,
      );
    } else if (GlobalDriverSortType == "DriverTypeName") {
      setPrimarySortDirection(sortValue);
      setPrimarySortDirectionObj({
        ...primarySortDirectionObj,
        TypeSort: sortValue,
      });
      setCurrentPage(1);
      GetGlobalPricingDriverListData(
        1,
        searchKeyword,
        sortValue,
        GlobalDriverSortType,
        modelRequestData.addedFor,
      );
    }
  };

  //Handle Search
  const handleSearch = (e) => {
    const searchKeywordValue = e.target.value;
    setSearchKeyword(searchKeywordValue);
    setCurrentPage(1);
    GetGlobalPricingDriverListData(
      1,
      searchKeywordValue,
      null,
      null,
      modelRequestData.addedFor,
    );
  };

  const handleClose = () => {
    $("#" + "ConfirmModel").modal("hide");
    $("#" + "RecordsAvailablePopupModel").modal("hide");
    setOpenSuccessModal(false);
    setOpenErrorModal(false);
  };

  const TabHandle = async (tab) => {
    if (tab === "GlobalPricingDriver") {
      setActiveTab(tab);
      setModelRequestData({
        ...modelRequestData,
        addedFor: null,
      });
      if (common.organisationKeyID !== null) {
        GetGlobalPricingDriverListData(1, null, null, null);
      }
    }
    //   else if (tab === "ProspectVariables") {
    //   setActiveTab(tab);
    //   setLoader(true);
    //   try {
    //     const data = await GetGlobalProspectVariables(common.organisationKeyID);
    //     if(data?.data?.statusCode === 200) {
    //       setLoader(false);
    //       const responseData = data?.data?.responseData?.data;
    //       console.log(responseData);
    //       const formatted = responseData.map(item => ({
    //         globalVariableID: item.globalVariableID,
    //         globalVariableKeyID: item.globalVariableKeyID,
    //         globalVariableName: item.globalVariableName,
    //         dataType: item.dataType,
    //         isRequired: item.isRequired,
    //         isActive: item.isActive,
    //         status: item.status
    //         // isExisting: true
    //       }));

    //       setVariables(formatted);
    //       console.log(formatted);
    //     }

    //   } catch (error) {
    //     setLoader(false);
    //     console.error(error);
    //     setVariables([]);
    //   }
    // }
    else if (tab === "GlobalProspectDriver") {
      try {
        const data = await GetGlobalPricingDriverListData(
          1,
          null,
          null,
          null,
          "GlobalProspect",
        );
        setModelRequestData({
          ...modelRequestData,
          Action: null,
          addedFor: "GlobalProspect",
        });
      } catch (error) {
        setLoader(false);
        console.log(error);
        setErrorMessage(true);
      } finally {
        setLoader(false);
      }
    }
  };

  //Design part :
  const canAdd =
    common.organisationKeyID !== null
      ? userAccessData.Admin_Config_Global_Driver_CanAdd
      : userAccessData.SuperAdmin_Config_Global_Driver_CanAdd;

  const canEdit =
    (userAccessData.Admin_Config_Global_Driver_CanEdit &&
      common.organisationKeyID !== null) ||
    (userAccessData.SuperAdmin_Config_Global_Driver_CanEdit &&
      common.organisationKeyID === null);

  const canDelete =
    (userAccessData.Admin_Config_Global_Driver_CanDelete &&
      common.organisationKeyID !== null) ||
    (userAccessData.SuperAdmin_Config_Global_Driver_CanDelete &&
      common.organisationKeyID === null);

  const currentModuleName =
    activeTab === "GlobalProspectDriver"
      ? moduleNameGlobalProspect
      : moduleName;

  return (
    <>
      <div className="global-driver-redesign">
        <div className="global-driver-page">
          {/* =========================
              PAGE HEADER + TABS
              ========================= */}
          <div className="global-driver-page-header">
            <div className="global-driver-heading-block">
              <h1 className="global-driver-page-title">Drivers</h1>
              <p className="global-driver-page-subtitle">
                Manage global pricing drivers and prospect variables.
              </p>
            </div>

            {canAdd && (
              <div className="global-driver-add-action">
                <CommonButtonComponent
                  title={getCrudButtonToolTipName("Add", currentModuleName)}
                  dataBsTarget="#GlobalPricingModel"
                  data_bs_toggle="modal"
                  AddBtn={() => {
                    GlobalPricingDriverAddBtnClicked();
                  }}
                  name={getCrudButtonTextName("Add", currentModuleName)}
                />
              </div>
            )}
          </div>

          <div className="global-driver-tabs" role="tablist">
            <button
              type="button"
              className={`global-driver-tab ${
                activeTab === "GlobalPricingDriver" ? "is-active" : ""
              }`}
              role="tab"
              aria-selected={activeTab === "GlobalPricingDriver"}
              onClick={() => {
                setActiveTab("GlobalPricingDriver");
                TabHandle("GlobalPricingDriver");
              }}
            >
              {/* <i className="ri-line-chart-line"></i> */}
              <span>Global Pricing Drivers</span>
            </button>

            {common.organisationKeyID !== null && (
              <button
                type="button"
                className={`global-driver-tab ${
                  activeTab === "GlobalProspectDriver" ? "is-active" : ""
                }`}
                role="tab"
                aria-selected={activeTab === "GlobalProspectDriver"}
                onClick={() => {
                  setActiveTab("GlobalProspectDriver");
                  TabHandle("GlobalProspectDriver");
                }}
              >
                {/* <i className="ri-user-settings-line"></i> */}
                <span>Global Prospect Variables</span>
              </button>
            )}
          </div>

          {/* =========================
              LIST CARD
              ========================= */}
          <section className="global-driver-list-card">
            <div className="global-driver-toolbar">
              <div className="global-driver-search-wrap">
                <i className="ri-search-line global-driver-search-icon"></i>

                <input
                  type="text"
                  value={searchKeyword || ""}
                  onChange={handleSearch}
                  className="global-driver-search-input"
                  placeholder={
                    isMobile
                      ? "Search"
                      : getPlaceholderTextName("Search", currentModuleName)
                  }
                />
              </div>

              <div className="global-driver-toolbar-meta">
                {/* <span className="global-driver-current-view">
                  {activeTab === "GlobalProspectDriver"
                    ? "Prospect Variables"
                    : "Pricing Drivers"}
                </span> */}

                {/* {listCount > 0 && (
                  <span className="global-driver-record-count">
                    {listCount} {listCount === 1 ? "record" : "records"}
                  </span>
                )} */}
              </div>
            </div>

            <div className="global-driver-table-wrap">
              <table
                className={`global-driver-table ${
                  !showProfessionType
                    ? "global-driver-table--no-profession"
                    : ""
                }`}
                id="customerTable"
              >
                <thead>
                  <tr>
                    <th>
                      <button
                        type="button"
                        className="global-driver-sort-button"
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
                        <span>
                          {activeTab === "GlobalPricingDriver"
                            ? "Driver Name"
                            : "Variable Name"}
                        </span>

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
                          className="global-driver-sort-button"
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

                    <th>
                      <button
                        type="button"
                        className="global-driver-sort-button"
                        onClick={() => {
                          setSortType("DriverTypeName");
                          handleSort(
                            primarySortDirectionObj.TypeSort === null
                              ? "asc"
                              : primarySortDirectionObj.TypeSort === "asc"
                                ? "desc"
                                : "asc",
                            "DriverTypeName",
                          );
                        }}
                      >
                        <span>Type</span>

                        <i
                          className={
                            primarySortDirectionObj.TypeSort === "desc"
                              ? "ri-arrow-up-line"
                              : "ri-arrow-down-line"
                          }
                        ></i>
                      </button>
                    </th>

                    <th>Status</th>

                    <th className="global-driver-actions-heading">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {globalPricingDriverList
                    .slice(0, isMobile ? isMobileRecords : desktopRecords)
                    .map((PricingDriver) => {
                      const driverName =
                        PricingDriver.driverName?.replace(/\b\w/g, (l) =>
                          l.toUpperCase(),
                        ) || "-";

                      const statusClass = (PricingDriver.statusName || "")
                        .toLowerCase()
                        .replace(/\s+/g, "-");

                      const isProtectedDriver =
                        PricingDriver.addedFor === "Predefined-NOB" ||
                        PricingDriver.addedFor === "Predefined-PT";

                      return (
                        <tr
                          className="global-driver-table-row"
                          key={
                            PricingDriver.globalPricingDriverKeyID ||
                            PricingDriver.driverName
                          }
                        >
                          <td>
                            <div className="global-driver-name-cell">
                              {/* <span className="global-driver-icon">
                                <i
                                  className={
                                    activeTab === "GlobalProspectDriver"
                                      ? "ri-user-settings-line"
                                      : "ri-line-chart-line"
                                  }
                                ></i>
                              </span> */}

                              <div className="global-driver-name-copy">
                                <div className="global-driver-name-line">
                                  {PricingDriver.notifySAChanges !== null &&
                                    common.organisationKeyID !== null && (
                                      <Tooltip title="View System Administrator Changes">
                                        <button
                                          type="button"
                                          className="global-driver-notification-button"
                                          onClick={() =>
                                            GlobalPricingDriverEditBtnClicked(
                                              PricingDriver,
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
                                        ? PricingDriver.driverName
                                        : ""
                                    }
                                  >
                                    <span className="global-driver-primary-text">
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
                                className="global-driver-profession-chip"
                                title={PricingDriver.professionTypeNames}
                              >
                                {PricingDriver.professionTypeNames || "-"}
                              </span>
                            </td>
                          )}

                          <td>
                            <span className="global-driver-type-badge">
                              {PricingDriver.driverType || "-"}
                            </span>
                          </td>

                          <td>
                            <div className="global-driver-status-control">
                              <span
                                className={`global-driver-status-badge global-driver-status-badge--${statusClass}`}
                              >
                                <span className="global-driver-status-dot"></span>
                                {PricingDriver.statusName || "-"}
                              </span>

                              {canDelete && !isProtectedDriver && (
                                <Tooltip
                                  title={getCrudButtonToolTipName(
                                    "Change Status",
                                  )}
                                >
                                  <FormGroup>
                                    <FormControlLabel
                                      className="global-driver-switch-label"
                                      control={
                                        <Android12Switch
                                          onClick={() =>
                                            setModelRequestData({
                                              ...modelRequestData,
                                              status: PricingDriver.statusName,
                                              globalPricingDriverKeyID:
                                                PricingDriver.globalPricingDriverKeyID,
                                              userKeyID: common.userKeyID,
                                              Action: "Status",
                                            })
                                          }
                                          checked={
                                            PricingDriver.statusName ===
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

                              {isProtectedDriver && (
                                <span className="global-driver-system-badge">
                                  System
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="global-driver-actions-cell">
                            <div className="global-driver-row-actions">
                              <Tooltip
                                title={getCrudButtonToolTipName(
                                  "Copy",
                                  moduleName,
                                )}
                              >
                                <button
                                  type="button"
                                  className="global-driver-action-button global-driver-action-button--copy"
                                  data-bs-toggle="modal"
                                  data-bs-target="#ConfirmModel"
                                  onClick={() =>
                                    setModelRequestData({
                                      ...modelRequestData,
                                      Action: "Copy",
                                      driverName: PricingDriver.driverName,
                                      globalPricingDriverKeyID:
                                        PricingDriver.globalPricingDriverKeyID,
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
                                    className="global-driver-action-button global-driver-action-button--edit"
                                    onClick={() =>
                                      GlobalPricingDriverEditBtnClicked(
                                        PricingDriver,
                                      )
                                    }
                                    data-bs-toggle="modal"
                                    data-bs-target="#GlobalPricingModel"
                                  >
                                    <i className="ri-pencil-line"></i>
                                  </button>
                                </Tooltip>
                              )}

                              {canDelete && !isProtectedDriver && (
                                <Tooltip
                                  title={getCrudButtonToolTipName(
                                    "Delete",
                                    moduleName,
                                  )}
                                >
                                  <button
                                    type="button"
                                    className="global-driver-action-button global-driver-action-button--delete"
                                    data-bs-toggle="modal"
                                    data-bs-target="#ConfirmModel"
                                    onClick={() =>
                                      setModelRequestData({
                                        ...modelRequestData,
                                        globalPricingDriverKeyID:
                                          PricingDriver.globalPricingDriverKeyID,
                                        driverName: PricingDriver.driverName,
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
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>

              {totalRecords <= 0 && (
                <div className="global-driver-empty-state">
                  <NoResultFoundModel
                    name={currentModuleName}
                    totalRecords={totalRecords}
                  />
                </div>
              )}
            </div>

            {listCount > pageSize && (
              <div className="global-driver-pagination-wrap">
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
            EXISTING FUNCTIONAL MODALS
            ========================= */}
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
              ? GlobalPricingDriverChangeStatusDataAndDeleteData
              : CopyGlobalPricingDriverData
          }
        />

        <RecordsAvailablePopupModel
          handleClose={handleClose}
          openErrorModal={openErrorModal}
          openSuccessModal={openSuccessModal}
          modelRequestData={modelRequestData}
          UpdatedStatus={GlobalPricingDriverChangeStatusDataAndDeleteData}
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

        <Suspense fallback={null}>
          <Global_Pricing_Driver_model
            class="modal fade"
            id="GlobalPricingModel"
            tabIndex="-1"
            aria_labelledby="exampleModalLabel"
            aria_hidden="true"
            setIsAddUpdateActionDone={setIsAddUpdateActionDone}
            modelRequestData={modelRequestData}
          />
        </Suspense>
      </div>

      <Footer />
    </>
  );
}

export default Predefined_Global_Pricing_Drivers;
