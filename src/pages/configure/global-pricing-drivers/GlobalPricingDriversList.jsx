/* global $ */
import React, { lazy, Suspense, useContext, useEffect, useState } from "react";
import "./GlobalPricingDriversStyle.css";
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
const Global_Pricing_Driver_model = lazy(() => import("./GlobalPricingDriverModel"))

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
    addedFor: null
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
    common.organisationKeyID === null || common.professionTypeLists.length > 1
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
    GetGlobalPricingDriverListData(1, null, null, null, modelRequestData.addedFor);
  }, []);
  const formattedErrorMessage = handleErrorMessage(errorMessage);
  //2) This useEffect will trigger when we successfully add or update record from popup model
  useEffect(() => {
    if (isAddUpdateActionDone) {
      if (modelRequestData.Action === null) {
        setSearchKeyword("");
        setPrimarySortDirection(null);
        setCurrentPage(1);
        GetGlobalPricingDriverListData(1, null, null, null, modelRequestData.addedFor);
      } else {
        GetGlobalPricingDriverListData(currentPage, null, null, null, modelRequestData.addedFor);
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
    addedFor
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
        addedFor: addedFor
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
                addedFor
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
                addedFor
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
        addedFor: activeTab === "GlobalProspectDriver" ? "GlobalProspect" : null
      });
    }
  };

  // 2) On Click Global Pricing Driver Edit Button
  const GlobalPricingDriverEditBtnClicked = async (GPD, type) => {
    if (type === "editPredefined") {
      setLoader(true);
      const data = await GetGlobalPricingDriverModel(
        GPD.globalPricingDriverKeyID,
        true
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
          modelRequestData.userKeyID
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
                  (item) => item.serviceName
                );
              setModelRequestData({
                ...modelRequestData,
                Action: "GlobalPricingDriversWarning",
                message: `Following services are assigned to the selected ${moduleName.toLowerCase()}.You must remove the services from this ${moduleName.toLowerCase()} before attempting to mark it as InActive.`,
                ServiceName: servicePackageNames,
              });
              $("#" + "ConfirmModel").modal("hide");
              $("#" + "RecordsAvailablePopupModel").modal("show");
              GetGlobalPricingDriverListData(currentPage, null, null, null, modelRequestData.addedFor);
            } else {
              setModelRequestData({
                ...modelRequestData,
                Action: null,
                gloalPricingDriverKeyID: null,
              });
              GetGlobalPricingDriverListData(currentPage, null, null, null, modelRequestData.addedFor);
              setOpenSuccessModal(true);
            }
          } else {
            setErrorMessage(response?.response?.data?.errorMessage);
            setOpenErrorModal(true);
          }
          GetGlobalPricingDriverListData(currentPage, null, null, null, modelRequestData.addedFor);
        }
      } catch (error) {
        console.log(error);
      }
    } else if (modelRequestData.Action === "Delete") {
      try {
        const response = await DeleteGlobalPricingDriver(
          modelRequestData.globalPricingDriverKeyID,
          modelRequestData.userKeyID
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
                  (item) => item.serviceName
                );
              setModelRequestData({
                ...modelRequestData,
                Action: "GlobalPricingDriversWarning",
                message: `Following services are assigned to the selected ${moduleName.toLowerCase()}.You must remove the services from this ${moduleName.toLowerCase()} before attempting to mark it as InActive.`,
                ServiceName: servicePackageNames,
              });
              $("#" + "ConfirmModel").modal("hide");
              $("#" + "RecordsAvailablePopupModel").modal("show");
              GetGlobalPricingDriverListData(currentPage, null, null, null, modelRequestData.addedFor);
            } else {
              GetGlobalPricingDriverListData(currentPage, null, null, null, modelRequestData.addedFor);
              setOpenSuccessModal(true);
            }
          } else {
            setErrorMessage(response?.response?.data?.errorMessage);
            setOpenErrorModal(true);
          }
          GetGlobalPricingDriverListData(currentPage, null, null, null, modelRequestData.addedFor);
        }
      } catch (error) {
        console.log(error);
      }
    }
  };
  // Copy
  const CopyGlobalPricingDriverData = async() => {
    if(!common.userKeyID) return;
    try{
      setLoader(true);
      const data = await CopyGlobalPricingDriver(modelRequestData.globalPricingDriverKeyID,common.userKeyID);
      if(data?.data?.statusCode === 200) {
        setLoader(false);
        setOpenSuccessModal(true);
        GetGlobalPricingDriverListData(currentPage);
      }
      else {
        setLoader(false);
        setErrorMessage(data?.data?.errorMessage);
        setOpenErrorModal(true);
      }
    }
    catch(error) {
      console.error(error);
    }
  }
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
        modelRequestData.addedFor
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
        modelRequestData.addedFor
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
        modelRequestData.addedFor
      );
    }
  };

  //Handle Search
  const handleSearch = (e) => {
    const searchKeywordValue = e.target.value;
    setSearchKeyword(searchKeywordValue);
    setCurrentPage(1);
    GetGlobalPricingDriverListData(1, searchKeywordValue, null, null, modelRequestData.addedFor);
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
        addedFor: null
      })
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
          addedFor: "GlobalProspect"
        });
      } catch (error) {
        setLoader(false);
        console.log(error);
        setErrorMessage(true);
      }
      finally {
        setLoader(false);
      }
    }
  };

  //Design part :
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
                          <div className="row">
                            <div className="col-md-6 p-0 ">
                  {/* <div class="page-title-cls">Global Pricing Drivers</div> */}
                  <div class="container">
              <ul className="nav nav-tabs" role="tablist">
              {/* <div class="page-title-cls">Pricing Settings</div> */}
              <li className="nav-item">
                                <a
                                  className={`nav-link tab_nav ${
                                    activeTab === "GlobalPricingDriver" ? "active" : ""
                                  }`}
                                  data-bs-toggle="tab"
                                  href="#GlobalPricingDriver"
                                  role="tab"
                                  aria-selected={activeTab === "GlobalPricingDriver"}
                                  onClick={() => {
                                    setActiveTab("GlobalPricingDriver");
                                    // setSelectedRows([]);
                                    TabHandle("GlobalPricingDriver");
                                  }}
                                >
                                  <b>Global Pricing Drivers{" "}</b>
                                </a>
                              </li>
                              {common.organisationKeyID !== null && 
                               <li className="nav-item">
                                  <a
                                    className={`nav-link tab_nav ${
                                      activeTab === "GlobalProspectDriver"
                                        ? "active"
                                        : ""
                                    }`}
                                    data-bs-toggle="tab"
                                    href="#GlobalProspectDriver"
                                    role="tab"
                                    aria-selected={activeTab === "GlobalProspectDriver"}
                                    onClick={() => {
                                      setActiveTab("GlobalProspectDriver");
                                      // setSelectedRows([]);
                                      TabHandle("GlobalProspectDriver");
                                    }}
                                  >
                                    <b>Global Prospect Variables{" "}</b>
                                  </a>
                                </li>
                              }
                        </ul>
            </div>
                </div>
                <div className="col-auto ms-auto">
                  <div className="d-flex justify-content-sm-end add-new-letter">
                    {(common.organisationKeyID !== null
                      ? userAccessData.Admin_Config_Global_Driver_CanAdd
                      : userAccessData.SuperAdmin_Config_Global_Driver_CanAdd) && (
                      <CommonButtonComponent
                        title={getCrudButtonToolTipName(
                          "Add",
                          activeTab === "GlobalProspectDriver" ? moduleNameGlobalProspect : moduleName
                        )}
                        dataBsTarget="#GlobalPricingModel"
                        data_bs_toggle="modal"
                        AddBtn={() => {
                          GlobalPricingDriverAddBtnClicked();
                        }}
                        name={getCrudButtonTextName(
                          "Add",
                          activeTab === "GlobalProspectDriver" ? moduleNameGlobalProspect : moduleName
                        )}
                      />
                    )}
                  </div>
                </div>
                </div>
                </div>
              </div>
            <div class="row">
              <div class="col-lg-12">
                <div class="card">
                  {/* end card header  */}
                  <div class="card-body">
                    <div id="customerList">
                      <div class="row g-4 mb-3"></div>
                      <div class="table-responsive table-card mt-2 mb-3 table-padding">
                        <div class="search-box ms-2 width-searchbox">
                          <div class="row">
                            <div className="col-lg-12 col-md-12 col-sm-12 ">
                              <div className="row align-items-center">
                                <div className="col-3 mb-2">
                                  <div class="search-box w-100 width-searchbox">
                          <i class="ri-search-line search-icon"></i>
                          <input
                            type="text"
                            value={searchKeyword}
                            onChange={(e) => {
                              handleSearch(e);
                            }}
                            className="form-control search"
                            placeholder={
                              isMobile
                                ? "Search"
                                : getPlaceholderTextName("Search", activeTab === "GlobalProspectDriver" ? moduleNameGlobalProspect : moduleName)
                            }
                          />
                        </div>
                        </div>
                </div>
                </div>
                </div>
                        </div>
                        <table
                          class="table align-middle table-nowrap"
                          id="customerTable"
                        >
                          <thead class="table-light table-header-font">
                            <tr className="head-row">
                              <td
                                className="tr-table-class text-white"
                                style={{ width: "40%" }}
                              >
                                {activeTab === "GlobalPricingDriver"
                                  ? "Driver Name " : "Variable Name "}
                                {primarySortDirectionObj.DriverNameSort ===
                                  "desc" && (
                                    <i
                                      onClick={() => {
                                        setSortType("DriverName");
                                        handleSort("asc", "DriverName");
                                      }}
                                      style={{ cursor: "pointer" }}
                                      class="fas fa-sort-alpha-up ml-1"
                                    ></i>
                                  )}
                                {(primarySortDirectionObj.DriverNameSort ===
                                  null ||
                                  primarySortDirectionObj.DriverNameSort ===
                                  "asc") && (
                                    <i
                                      onClick={() => {
                                        setSortType("DriverName");
                                        handleSort(
                                          primarySortDirectionObj.DriverNameSort ===
                                            null
                                            ? "asc"
                                            : "desc",
                                          "DriverName"
                                        );
                                      }}
                                      style={{ cursor: "pointer" }}
                                      class="fas fa-sort-alpha-down ml-1"
                                    ></i>
                                  )}
                              </td>
                              <td className="tr-table-class text-white profession-type-column">
                                {showProfessionType && (
                                  <>
                                    Profession Type{" "}
                                    {primarySortDirectionObj.ProfessionTypeSort ===
                                      "desc" && (
                                        <i
                                          onClick={() => {
                                            setSortType("ProfessionType");
                                            handleSort("asc", "ProfessionType");
                                          }}
                                          style={{ cursor: "pointer" }}
                                          class="fas fa-sort-alpha-up ml-1"
                                        ></i>
                                      )}
                                    {(primarySortDirectionObj.ProfessionTypeSort ===
                                      null ||
                                      primarySortDirectionObj.ProfessionTypeSort ===
                                      "asc") && (
                                        <i
                                          onClick={() => {
                                            setSortType("ProfessionType");
                                            handleSort(
                                              primarySortDirectionObj.ProfessionTypeSort ===
                                                null
                                                ? "asc"
                                                : "desc",
                                              "ProfessionType"
                                            );
                                          }}
                                          style={{ cursor: "pointer" }}
                                          class="fas fa-sort-alpha-down ml-1"
                                        ></i>
                                      )}
                                  </>
                                )}
                              </td>
                              <td className="tr-table-class text-white">
                                Type{" "}
                                {primarySortDirectionObj.TypeSort ===
                                  "desc" && (
                                    <i
                                      onClick={() => {
                                        setSortType("DriverTypeName");
                                        handleSort("asc", "DriverTypeName");
                                      }}
                                      style={{ cursor: "pointer" }}
                                      class="fas fa-sort-alpha-up ml-1"
                                    ></i>
                                  )}
                                {(primarySortDirectionObj.TypeSort === null ||
                                  primarySortDirectionObj.TypeSort ===
                                  "asc") && (
                                    <i
                                      onClick={() => {
                                        setSortType("DriverTypeName");
                                        handleSort(
                                          primarySortDirectionObj.TypeSort ===
                                            null
                                            ? "asc"
                                            : "desc",
                                          "DriverTypeName"
                                        );
                                      }}
                                      style={{ cursor: "pointer" }}
                                      class="fas fa-sort-alpha-down ml-1"
                                    ></i>
                                  )}
                              </td>
                              <td className="tr-table-class text-white">
                                Status
                              </td>
                              <td className="tr-table-class text-white">
                                {((userAccessData.Admin_Config_Global_Driver_CanEdit &&
                                  common.organisationKeyID !== null) ||
                                  (userAccessData.SuperAdmin_Config_Global_Driver_CanEdit &&
                                    common.organisationKeyID === null) ||
                                  (userAccessData.Admin_Config_Global_Driver_CanDelete &&
                                    common.organisationKeyID !== null) ||
                                  (userAccessData.SuperAdmin_Config_Global_Driver_CanDelete &&
                                    common.organisationKeyID === null)) && (
                                    <>Action</>
                                  )}
                              </td>
                            </tr>
                          </thead>
                          <tbody class="list form-check-all">
                            {globalPricingDriverList
                              .slice(
                                0,
                                isMobile ? isMobileRecords : desktopRecords
                              )
                              .map((PricingDriver) => {
                                return (
                                  <tr class="table_new ">
                                    <td className="table-content-font">
                                      {/* {PricingDriver.driverName} */}
                                      {PricingDriver.notifySAChanges !== null && common.organisationKeyID !== null && (
                                        <>
                                          <Tooltip
                                            title="View System Administrator Changes"

                                          >
                                            <span onClick={() =>

                                              GlobalPricingDriverEditBtnClicked(
                                                PricingDriver, "editPredefined"
                                              )
                                            }
                                              className="UpdateConfigValue"
                                            // data-bs-toggle="modal"

                                            // data-bs-target="#GlobalPricingModel"
                                            ><i class="fa fa-regular fa-bell"></i></span>
                                          </Tooltip>
                                        </>
                                      )}
                                      {isMobile ? (
                                        <>
                                          {PricingDriver.driverName.length > 20
                                            ? PricingDriver.driverName
                                              .substring(0, 20)
                                              .replace(/\b\w/g, (l) =>
                                                l.toUpperCase()
                                              ) + "..."
                                            : PricingDriver.driverName
                                              .substring(0, 20)
                                              .replace(/\b\w/g, (l) =>
                                                l.toUpperCase()
                                              )}
                                        </>
                                      ) : (
                                        <>
                                          {PricingDriver.driverName.length >
                                            71 ? (
                                            <Tooltip
                                              title={PricingDriver.driverName}
                                            >
                                              {PricingDriver.driverName
                                                .substring(0, 71)
                                                .replace(/\b\w/g, (l) =>
                                                  l.toUpperCase()
                                                ) + "..."}
                                            </Tooltip>
                                          ) : (
                                            <>
                                              {PricingDriver.driverName
                                                .replace(/\b\w/g, (l) =>
                                                  l.toUpperCase()
                                                )}
                                            </>
                                          )}
                                        </>
                                      )}

                                    </td>

                                    <td className="table-content-font">
                                      {showProfessionType &&
                                        PricingDriver.professionTypeNames}
                                    </td>

                                    <td className="table-content-font">
                                      {" "}
                                      {PricingDriver.driverType}
                                    </td>
                                    <td
                                      style={{
                                        verticalAlign:
                                          PricingDriver.addedFor !==
                                            "Predefined-NOB" &&
                                            PricingDriver.addedFor !==
                                            "Predefined-PT"
                                            ? ""
                                            : "middle",
                                      }}
                                      className="Switch"
                                    >
                                      <div
                                        style={{
                                          alignItems: "none",
                                          marginLeft:
                                            ((userAccessData.Admin_Config_Global_Driver_CanEdit &&
                                              common.organisationKeyID !==
                                              null) ||
                                              (userAccessData.SuperAdmin_Config_Global_Driver_CanEdit &&
                                                common.organisationKeyID ===
                                                null)) &&
                                              ((userAccessData.Admin_Config_Global_Driver_CanDelete &&
                                                common.organisationKeyID !==
                                                null) ||
                                                (userAccessData.SuperAdmin_Config_Global_Driver_CanDelete &&
                                                  common.organisationKeyID ===
                                                  null))
                                              ? ""
                                              : "10px",
                                        }}
                                        class="d-flex gap-2 "
                                      >
                                        <div style={{ width: "50px" }}>
                                          {" "}
                                          {PricingDriver.statusName}
                                        </div>
                                        {((userAccessData.Admin_Config_Global_Driver_CanDelete &&
                                          common.organisationKeyID !== null) ||
                                          (userAccessData.SuperAdmin_Config_Global_Driver_CanDelete &&
                                            common.organisationKeyID ===
                                            null)) &&
                                          PricingDriver.addedFor !==
                                          "Predefined-NOB" &&
                                          PricingDriver.addedFor !==
                                          "Predefined-PT" && (
                                            <Tooltip
                                              title={getCrudButtonToolTipName(
                                                "Change Status"
                                              )}
                                            >
                                              <FormGroup>
                                                <FormControlLabel
                                                  control={
                                                    <Android12Switch
                                                      onClick={() =>
                                                        setModelRequestData({
                                                          ...modelRequestData,
                                                          status:
                                                            PricingDriver.statusName,
                                                          globalPricingDriverKeyID:
                                                            PricingDriver.globalPricingDriverKeyID,
                                                          userKeyID:
                                                            common.userKeyID,
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
                                      </div>
                                    </td>

                                    <td className="table-content-font">
                                      <div class="d-flex gap-2">
                                      <Tooltip
                                          title={getCrudButtonToolTipName(
                                            "Copy",
                                            moduleName
                                          )}
                                        >
                                          <div class="copy">
                                            <button
                                              class="btn btn-sm btn-success edit-item-btn edit"
                                              data-bs-toggle="modal"
                                              data-bs-target="#ConfirmModel"
                                              onClick={() =>
                                                setModelRequestData({
                                                  ...modelRequestData,
                                                  Action: "Copy",
                                                  driverName: PricingDriver.driverName,
                                                  globalPricingDriverKeyID: PricingDriver.globalPricingDriverKeyID,
                                                  userKeyID: common.userKeyID
                                                })
                                              }
                                            >
                                              <i class="fa-solid fa-copy"></i>
                                            </button>
                                          </div>
                                        </Tooltip>
                                        {((userAccessData.Admin_Config_Global_Driver_CanEdit &&
                                          common.organisationKeyID !== null) ||
                                          (userAccessData.SuperAdmin_Config_Global_Driver_CanEdit &&
                                            common.organisationKeyID ===
                                            null)) && (
                                            <Tooltip
                                              title={getCrudButtonToolTipName(
                                                "Update",
                                                moduleName
                                              )}
                                            >
                                              <div class="edit">
                                                <button
                                                  onClick={() =>
                                                    GlobalPricingDriverEditBtnClicked(
                                                      PricingDriver
                                                    )
                                                  }
                                                  class="btn btn-sm btn-success edit-item-btn actionButtonsStyle"
                                                  data-bs-toggle="modal"
                                                  data-bs-target="#GlobalPricingModel"
                                                >
                                                  <i class="ri-pencil-fill"></i>
                                                </button>
                                              </div>
                                            </Tooltip>
                                          )}
                                        {((userAccessData.Admin_Config_Global_Driver_CanDelete &&
                                          common.organisationKeyID !== null) ||
                                          (userAccessData.SuperAdmin_Config_Global_Driver_CanDelete &&
                                            common.organisationKeyID ===
                                            null)) &&
                                          PricingDriver.addedFor !==
                                          "Predefined-NOB" &&
                                          PricingDriver.addedFor !==
                                          "Predefined-PT" && (
                                            <Tooltip
                                              title={getCrudButtonToolTipName(
                                                "Delete",
                                                moduleName
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
                                                      globalPricingDriverKeyID:
                                                        PricingDriver.globalPricingDriverKeyID,
                                                      driverName:
                                                        PricingDriver.driverName,
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
                            name={activeTab === "GlobalProspectDriver" ? moduleNameGlobalProspect : moduleName}
                            totalRecords={totalRecords}
                          />
                        )}
                      </div>
                    </div>
                  {listCount > pageSize && (
                    <PaginationComponent
                      totalCount={listCount}
                      totalPages={totalPage}
                      currentPage={currentPage}
                      onPageChange={handlePageChange}
                    />
                  )}
                  </div>
                  {/* end card  */}
                </div>
                {/* end col */}
              </div>
              {/* end col  */}
            </div>
            {/* end row */}

            <ErrorModel
              ErrorModel={openErrorModal}
              handleClose={handleClose}
              ErrorMessage={formattedErrorMessage}
            />
            {/* Confirm Modal  */}
            <ConfirmModel
              openErrorModal={openErrorModal}
              openSuccessModal={openSuccessModal}
              modelRequestData={modelRequestData}
              UpdatedStatus={modelRequestData.Action === "Delete" || modelRequestData.Action === "Status" ? GlobalPricingDriverChangeStatusDataAndDeleteData : CopyGlobalPricingDriverData}
            />

            <RecordsAvailablePopupModel
              handleClose={handleClose}
              openErrorModal={openErrorModal}
              openSuccessModal={openSuccessModal}
              modelRequestData={modelRequestData}
              UpdatedStatus={GlobalPricingDriverChangeStatusDataAndDeleteData}
            />

            {/* Success Modal  */}
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
            {/* Model */}
            <Suspense>
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
        </div>
        {/* container-fluid  */}
      </div>
      {/* End Page-content */}
    </div>
    </div>
    </div>
    </div>
    <Footer />
    </>
  );
}

export default Predefined_Global_Pricing_Drivers;
