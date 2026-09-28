/* global $ */
import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import CommonButtonComponent from "../../../../components/CommonButtonComponent";
import ConfirmModel from "../../../../components/ConfirmationBox";
import FilterModel from "../../../../components/FilterModel";
import {
  MarketingReminderDelete,
  GetMarketingReminderList,
  MarketingReminderChangeStatus,
} from "../../../../redux/Services/Setting/MarketingReminderApi";
import PaginationComponent from "../../../../components/PaginationModel";
import Android12Switch from "../../../../components/AndroidSwitch";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import { AuthContextProvider } from "../../../../AuthContext/AuthContext";
import { useDispatch, useSelector } from "react-redux";
import Tooltip, { tooltipClasses } from "@mui/material/Tooltip";
import NoResultFoundModel from "../../../../components/NoResultFoundModel";
import SuccessModal from "../../../../components/SuccessModal";
import ErrorModel from "../../../../components/ErrorModel";
import Footer from "../../../../components/Footer";
import { updateState } from "../../../../redux/Persist";

import RecordsAvailablePopupModel from "../../../../components/RecordsAvailablePopupModel";
import "./SuperAdminMarketingReminderList-redesign.css";

function SuperAdminMarketingReminderList() {
  const moduleName = "Other Reminder";
  let getEmailTemplatesListApiCallCount = 0;
  //A]Declare state
  const common = useSelector((state) => state.Storage); //Getting Logged Users Details From Persist Storage of redux hooks
  const navigate = useNavigate();
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
    prospectName,
  } = useContext(AuthContextProvider);
  const [EmailTemplateList, setEmailTemplateList] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isFilterApply, setIsFilterApply] = useState(false);
  const [EmailAddressType, setEmailAddressType] = useState(null);
  const [TriggerPointType, setTriggerPointType] = useState(null);
  const [totalRecords, setTotalRecords] = useState(-1);
  const [isAddUpdateActionDone, setIsAddUpdateActionDone] = useState(false);
  const [openSuccessModal, setOpenSuccessModal] = React.useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortType, setSortType] = useState(null);
  const [primarySortDirection, setPrimarySortDirection] = useState(null);
  const [primarySortDirectionObj, setPrimarySortDirectionObj] = useState({
    templateNameSort: null,
    TemplateTypeSort: null,
    EmailAddressType: null,
    TriggerPointType: null,
  });
  const [searchKeyword, setSearchKeyword] = useState("");
  const [openErrorModal, setOpenErrorModal] = useState(false);
  const [modelRequestData, setModelRequestData] = useState({
    professionTypeNames: null,
    BusinessTypeName: null,
    reminderKeyID: null,
    // keyID: null,
    templateName: null,
    status: null,
    isDefault: null,
    StatusType: null,
    Action: "",
    userKeyID: null,
    reminderName: null,
  });
  const dispatch = useDispatch();
  const pageSize = isMobile ? isMobileRecords : desktopRecords;

  const isCurrentPage =
    common.currentPage === "" ? currentPage : common.currentPage;

  // B] Initial useEffect :
  // 1) Will Call Initial Api Like List Api
  useEffect(() => {
    setTopbar("block");
    GetEmailTemplatesListData(isCurrentPage);
    dispatch(
      updateState({
        currentPage: "",
      }),
    );
  }, [pageSize]);

  //2) This useEffect will trigger when we successfully add or update record from popup model
  useEffect(() => {
    if (isAddUpdateActionDone) {
      if (modelRequestData.Action === null) {
        setSearchKeyword("");
        setPrimarySortDirection(null);
        setCurrentPage(1);
        GetEmailTemplatesListData(isCurrentPage, null, null);
      }
      setIsAddUpdateActionDone(false);
    }
  }, [isAddUpdateActionDone]);

  useEffect(() => {
    if (
      modelRequestData.reminderKeyID !== null &&
      modelRequestData.Action === "Update"
    ) {
      setTopbar("none");
      navigate("/add-update-marketing-reminder", { state: modelRequestData });
    }
  }, [modelRequestData]);

  // C] Calling All Api's like List and other Here :
  // 1) Get EmailTemplatesList Data
  const GetEmailTemplatesListData = async (
    i,
    searchKeywordValue,
    sortValue,
    TemplateSort,
    EmailAddressTypeID,
    TriggerPointTypeID,
    documentStatusID,
  ) => {
    if (pageSize === 0) {
      return;
    }
    setLoader(true);
    const pageNoList = i - 1;
    try {
      const data = await GetMarketingReminderList({
        pageSize: pageSize,
        pageNo: pageNoList,
        UserKeyID: common.userKeyID,
        organisationKeyID: common.organisationKeyID,
        searchKeyword:
          searchKeywordValue === undefined ? searchKeyword : searchKeywordValue,
        primarySortDirection:
          sortValue === undefined ? primarySortDirection : sortValue,
        PrimarySortColumnName: sortType == "" ? TemplateSort : sortType,
        emailAddressID:
          EmailAddressTypeID === undefined
            ? EmailAddressType
            : EmailAddressTypeID,
        triggerPointID:
          TriggerPointTypeID === undefined
            ? TriggerPointType
            : TriggerPointTypeID,
      });
      if (data) {
        if (data?.data?.statusCode === 200) {
          setLoader(false);
          getEmailTemplatesListApiCallCount = 0;
          if (data?.data?.responseData?.data) {
            const totalCount = data.data.totalCount;
            const TemplateListData = data.data.responseData.data;
            if (pageNoList > 0 && TemplateListData.length === 0) {
              let newPaneNo = Number(pageNoList);
              if (newPaneNo > 1) {
                newPaneNo = newPaneNo - 1;
              }
              GetEmailTemplatesListData(
                newPaneNo,
                searchKeywordValue,
                sortValue,
                TemplateSort,
              );
              setCurrentPage(pageNoList);
              return;
            }

            setListCount(totalCount);
            setTotalRecords(totalCount);
            setEmailTemplateList(TemplateListData);
          }
        } else {
          if (getEmailTemplatesListApiCallCount < maxCountToRecallApi) {
            getEmailTemplatesListApiCallCount += 1;
            setTimeout(function () {
              GetEmailTemplatesListData(
                i,
                searchKeywordValue,
                sortValue,
                TemplateSort,
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

  // Email Template Change status and delete function
  const EmailTemplatesChangeStatusDataAndDeleteData = async () => {
    setLoader(true);
    if (modelRequestData.Action === "Status") {
      if (modelRequestData.StatusType === null) {
        try {
          const Data = await MarketingReminderChangeStatus(
            modelRequestData.reminderKeyID,
            modelRequestData.userKeyID,
          );
          if (Data) {
            setLoader(false);
            if (Data?.data?.statusCode === 200) {
              $("#" + "ConfirmModel").one("hidden.bs.modal", () => {
                setOpenSuccessModal(true);
              });
              $("#" + "ConfirmModel").modal("hide");

              // GetEmailTemplatesListData(currentPage);
              // setOpenSuccessModal(true);
            } else {
              setErrorMessage(Data?.response?.data?.errorMessage);
              setOpenErrorModal(true);
            }
            GetEmailTemplatesListData(isCurrentPage);
          }
        } catch (error) {
          console.log(error);
        }
      }
    } else if (modelRequestData.Action === "Delete") {
      try {
        const Data = await MarketingReminderDelete(
          modelRequestData.reminderKeyID,
          modelRequestData.userKeyID,
        );
        if (Data) {
          setLoader(false);
          if (Data?.data?.statusCode === 200) {
            $("#" + "ConfirmModel").one("hidden.bs.modal", () => {
              setOpenSuccessModal(true);
            });
            $("#" + "ConfirmModel").modal("hide");

            // GetEmailTemplatesListData(currentPage);
            // setOpenSuccessModal(true);
          } else {
            setErrorMessage(Data?.response?.data?.errorMessage);
            setOpenErrorModal(true);
          }
          GetEmailTemplatesListData(isCurrentPage);
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  //Add Template Button
  const TemplateAddBtnClicked = () => {
    {
      setModelRequestData({
        ...modelRequestData,
        reminderKeyID: null,
      });
    }

    let addReminderRequestData = {
      reminderKeyID: null,
      reminderName: null,
      status: null,
    };
    setTopbar("none");
    navigate("/add-update-marketing-reminder", {
      state: addReminderRequestData,
    });
  };
  // 2) On Click Template Edit Button

  const TemplateEditBtnClicked = (Template) => {
    dispatch(
      updateState({
        currentPage: currentPage,
      }),
    );
    setModelRequestData({
      ...modelRequestData,
      reminderKeyID: Template.reminderKeyID,
      Action: "Update",
    });
  };

  // Pagination :
  const handlePageChange = async (pageNumber) => {
    setCurrentPage(pageNumber);
    await GetEmailTemplatesListData(pageNumber); // Call your function with the selected page number
  };

  // G] Sorting & Handle Function:
  // const handleSort = (sortValue) => {
  //   setPrimarySortDirection(sortValue);
  //   setCurrentPage(1);
  //   GetEmailTemplatesListData(isCurrentPage, searchKeyword, sortValue);
  // };

  //Sort the list
  const handleSort = (sortValue, TemplateSort) => {
    if (TemplateSort === "TemplateName") {
      setPrimarySortDirection(sortValue);
      setPrimarySortDirectionObj({
        ...primarySortDirectionObj,
        templateNameSort: sortValue,
      });

      setCurrentPage(1);
      GetEmailTemplatesListData(1, searchKeyword, sortValue, TemplateSort);
    } else if (TemplateSort === "TemplateType") {
      setPrimarySortDirection(sortValue);
      setPrimarySortDirectionObj({
        ...primarySortDirectionObj,
        TemplateTypeSort: sortValue,
      });
      setCurrentPage(1);
      GetEmailTemplatesListData(1, searchKeyword, sortValue, TemplateSort);
    } else if (TemplateSort === "EmailAddressName") {
      setPrimarySortDirection(sortValue);
      setPrimarySortDirectionObj({
        ...primarySortDirectionObj,
        EmailAddressType: sortValue,
      });
      setCurrentPage(1);
      GetEmailTemplatesListData(1, searchKeyword, sortValue, TemplateSort);
    } else if (TemplateSort === "TriggerPointName") {
      setPrimarySortDirection(sortValue);
      setPrimarySortDirectionObj({
        ...primarySortDirectionObj,
        TriggerPointType: sortValue,
      });
      setCurrentPage(1);
      GetEmailTemplatesListData(1, searchKeyword, sortValue, TemplateSort);
    }
  };

  const handleSearch = (e) => {
    const searchKeywordValue = e.target.value;
    setSearchKeyword(searchKeywordValue);
    setCurrentPage(1);
    GetEmailTemplatesListData(isCurrentPage, searchKeywordValue);
  };

  const handleClose = () => {
    $("#" + "ConfirmModel").modal("hide");
    $("#" + "RecordsAvailablePopupModel").modal("hide");
    setOpenSuccessModal(false);
    setOpenErrorModal(false);
  };

  // const replaceNames = (text) => {
  //   return text.replace(/Contract/g, {EngagementName}).replace(/Quote/g, {proposalName});
  // };
  const ApplyFilter = () => {
    if (
      (EmailAddressType !== null && EmailAddressType !== "") ||
      (TriggerPointType !== null && TriggerPointType !== "")
    ) {
      setIsFilterApply(true);
    } else {
      setIsFilterApply(false);
    }
    GetEmailTemplatesListData(
      1,
      searchKeyword,
      primarySortDirection,
      sortType,
      EmailAddressType,
      TriggerPointType,
    );
  };
  const ClearFilter = () => {
    setIsFilterApply(false);
    setEmailAddressType(null);
    setTriggerPointType(null);
    GetEmailTemplatesListData(
      1,
      searchKeyword,
      primarySortDirection,
      sortType,
      null,
      null,
    );
  };

  return (
    <div className="container-fluid marketing-reminder-list-redesign">
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
                        <div className="col-md-6 col-6">
                          <div class="page-title-cls">{moduleName}</div>
                        </div>
                        <div className="col-auto ms-auto">
                          <div className="d-flex justify-content-sm-end add-new-btn">
                            {((userAccessData.Admin_Config_Email_Template_CanAdd &&
                              common.organisationKeyID !== null) ||
                              (userAccessData.SuperAdmin_Config_Email_Template_CanAdd &&
                                common.organisationKeyID === null)) && (
                              <CommonButtonComponent
                                title={getCrudButtonToolTipName(
                                  "Add ",
                                  moduleName,
                                )}
                                name={getCrudButtonTextName("Add", moduleName)}
                                AddBtn={() => TemplateAddBtnClicked()}
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div class="row" id="tablesections">
                        <div class="col-lg-12">
                          <div class="card">
                            {/* end card header  */}

                            <div class="card-body">
                              <div id="customerList">
                                <div class="row g-4 mb-3"></div>
                                <div class="table-responsive table-card mt-2 mb-3 table-padding">
                                  <div class="search-box ms-2 width-searchbox">
                                    <div className="row">
                                      <div className="col-lg-12 col-md-12 col-sm-12 ">
                                        <div className="row align-items-center">
                                          <div className="col-3 mb-2">
                                            <div class="search-box w-100 width-searchbox mb-2">
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
                                                    : getPlaceholderTextName(
                                                        "Search",
                                                        moduleName,
                                                      )
                                                }
                                              />
                                            </div>
                                          </div>
                                          <div className="col-6 d-flex align-items-start justify-content-start mb-3">
                                            <Tooltip
                                              title={getCrudButtonToolTipName(
                                                "Filter",
                                                moduleName,
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
                                            <div className="col-9">
                                              {isFilterApply ? (
                                                <div>
                                                  <Tooltip
                                                    title={"Clear Filter"}
                                                  >
                                                    <button
                                                      className="btn btn-md btn-success create-Filter-item-btn text-nowrap "
                                                      onClick={ClearFilter} // Corrected from onclick to onClick
                                                    >
                                                      <span>Clear Filter</span>
                                                    </button>
                                                  </Tooltip>
                                                </div>
                                              ) : (
                                                ""
                                              )}
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
                                    <thead class="table-light">
                                      <tr className="head-row table-header-font">
                                        <td className="tr-table-class text-white">
                                          Reminder Name
                                          {primarySortDirectionObj.templateNameSort ===
                                            "desc" && (
                                            <i
                                              onClick={() => {
                                                setSortType("ReminderName");
                                                handleSort(
                                                  "asc",
                                                  "TemplateName",
                                                );
                                              }}
                                              class="fas fa-sort-alpha-up ml-1"
                                            ></i>
                                          )}
                                          {(primarySortDirectionObj.templateNameSort ===
                                            null ||
                                            primarySortDirectionObj.templateNameSort ===
                                              "asc") && (
                                            <i
                                              onClick={() => {
                                                setSortType("ReminderName");
                                                handleSort(
                                                  primarySortDirectionObj.templateNameSort ===
                                                    null
                                                    ? "asc"
                                                    : "desc",
                                                  "TemplateName",
                                                );
                                              }}
                                              class="fas fa-sort-alpha-down  ml-1"
                                            ></i>
                                          )}
                                        </td>
                                        <td className="tr-table-class text-white">
                                          Email Template
                                          {primarySortDirectionObj.TemplateTypeSort ===
                                            "desc" && (
                                            <i
                                              onClick={() => {
                                                setSortType("TemplateName");
                                                handleSort(
                                                  "asc",
                                                  "TemplateType",
                                                );
                                              }}
                                              class="fas fa-sort-alpha-up ml-1"
                                            ></i>
                                          )}
                                          {(primarySortDirectionObj.TemplateTypeSort ===
                                            null ||
                                            primarySortDirectionObj.TemplateTypeSort ===
                                              "asc") && (
                                            <i
                                              onClick={() => {
                                                setSortType("TemplateName");
                                                handleSort(
                                                  primarySortDirectionObj.TemplateTypeSort ===
                                                    null
                                                    ? "asc"
                                                    : "desc",
                                                  "TemplateType",
                                                );
                                              }}
                                              class="fas fa-sort-alpha-down  ml-1"
                                            ></i>
                                          )}
                                        </td>
                                        <td className="tr-table-class text-white">
                                          Email Address
                                          {primarySortDirectionObj.EmailAddressType ===
                                            "desc" && (
                                            <i
                                              onClick={() => {
                                                setSortType("EmailAddressName");
                                                handleSort(
                                                  "asc",
                                                  "EmailAddressName",
                                                );
                                              }}
                                              class="fas fa-sort-alpha-up ml-1"
                                            ></i>
                                          )}
                                          {(primarySortDirectionObj.EmailAddressType ===
                                            null ||
                                            primarySortDirectionObj.EmailAddressType ===
                                              "asc") && (
                                            <i
                                              onClick={() => {
                                                setSortType("EmailAddressName");
                                                handleSort(
                                                  primarySortDirectionObj.EmailAddressType ===
                                                    null
                                                    ? "asc"
                                                    : "desc",
                                                  "EmailAddressName",
                                                );
                                              }}
                                              class="fas fa-sort-alpha-down  ml-1"
                                            ></i>
                                          )}
                                        </td>
                                        <td className="tr-table-class text-white">
                                          Trigger Point
                                          {primarySortDirectionObj.TriggerPointType ===
                                            "desc" && (
                                            <i
                                              onClick={() => {
                                                setSortType("TriggerPointName");
                                                handleSort(
                                                  "asc",
                                                  "TriggerPointName",
                                                );
                                              }}
                                              class="fas fa-sort-alpha-up ml-1"
                                            ></i>
                                          )}
                                          {(primarySortDirectionObj.TriggerPointType ===
                                            null ||
                                            primarySortDirectionObj.TriggerPointType ===
                                              "asc") && (
                                            <i
                                              onClick={() => {
                                                setSortType("TriggerPointName");
                                                handleSort(
                                                  primarySortDirectionObj.TriggerPointType ===
                                                    null
                                                    ? "asc"
                                                    : "desc",
                                                  "TriggerPointName",
                                                );
                                              }}
                                              class="fas fa-sort-alpha-down  ml-1"
                                            ></i>
                                          )}
                                        </td>
                                        <td className="tr-table-class text-white">
                                          Frequency
                                        </td>
                                        <td className="tr-table-class text-white">
                                          Repeat
                                        </td>
                                        <td className="tr-table-class text-white">
                                          Status
                                        </td>
                                        <td className="tr-table-class text-white">
                                          {((userAccessData.Admin_Config_Email_Template_CanEdit &&
                                            common.organisationKeyID !==
                                              null) ||
                                            (userAccessData.SuperAdmin_Config_Email_Template_CanAdd &&
                                              common.organisationKeyID ===
                                                null)) && <>Action</>}
                                        </td>
                                      </tr>
                                    </thead>
                                    <tbody class="list form-check-all">
                                      {EmailTemplateList.slice(
                                        0,
                                        isMobile
                                          ? isMobileRecords
                                          : desktopRecords,
                                      ).map((Template) => {
                                        return (
                                          <tr class="table_new table-content-font">
                                            <td className="table-content-font">
                                              {isMobile ? (
                                                <>
                                                  {Template.reminderName
                                                    .length > 20
                                                    ? `${Template.reminderName.substring(
                                                        0,
                                                        20,
                                                      )}...`
                                                    : Template.reminderName}
                                                </>
                                              ) : (
                                                <>
                                                  {Template.reminderName
                                                    .length > 50 ? (
                                                    <Tooltip
                                                      title={
                                                        Template.reminderName
                                                      }
                                                    >
                                                      {`${Template.reminderName.substring(
                                                        0,
                                                        50,
                                                      )}...`}
                                                    </Tooltip>
                                                  ) : (
                                                    <>{Template.reminderName}</>
                                                  )}
                                                </>
                                              )}
                                            </td>
                                            <td className="table-content-font">
                                              {Template.templateName}
                                            </td>
                                            <td className="table-content-font">
                                              {Template.emailAddressName?.replace(
                                                /prospects/gi,
                                                prospectName,
                                              )}
                                            </td>

                                            <td className="table-content-font">
                                              {Template.triggerPointName}
                                            </td>
                                            <td className="table-content-font">
                                              {Template.reminderFrequencyName}
                                            </td>
                                            <td className="table-content-font">
                                              {Template.isRepeat ? "Yes" : "No"}
                                            </td>
                                            <td className="Switch table-content-font">
                                              <div
                                                style={{ alignItems: "none" }}
                                                class="d-flex gap-2 "
                                              >
                                                <div style={{ width: "40px" }}>
                                                  {" "}
                                                  {Template.statusName}
                                                </div>
                                                {((userAccessData.Admin_Config_Email_Template_CanDelete &&
                                                  common.organisationKeyID !==
                                                    null) ||
                                                  (userAccessData.SuperAdmin_Config_Email_Template_CanDelete &&
                                                    common.organisationKeyID ===
                                                      null)) && (
                                                  <Tooltip
                                                    title={getCrudButtonToolTipName(
                                                      "Change Status",
                                                    )}
                                                  >
                                                    <FormGroup
                                                      style={{ width: "55px" }}
                                                    >
                                                      <FormControlLabel
                                                        control={
                                                          <Android12Switch
                                                            onClick={() =>
                                                              setModelRequestData(
                                                                {
                                                                  ...modelRequestData,
                                                                  professionTypeNames:
                                                                    Template.professionTypeNames,
                                                                  BusinessTypeName:
                                                                    Template.orgBusinessType,
                                                                  reminderKeyID:
                                                                    Template.reminderKeyID,
                                                                  status:
                                                                    Template.statusName ===
                                                                    "Active"
                                                                      ? "Active"
                                                                      : "InActive",
                                                                  userKeyID:
                                                                    common.userKeyID,
                                                                  StatusType:
                                                                    null,
                                                                  Action:
                                                                    "Status",
                                                                },
                                                              )
                                                            }
                                                            checked={
                                                              Template.statusName ===
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
                                                {((userAccessData.Admin_Config_Email_Template_CanEdit &&
                                                  common.organisationKeyID !==
                                                    null) ||
                                                  (userAccessData.SuperAdmin_Config_Email_Template_CanEdit &&
                                                    common.organisationKeyID ===
                                                      null)) && (
                                                  <Tooltip
                                                    title={getCrudButtonToolTipName(
                                                      "Update",
                                                      moduleName,
                                                    )}
                                                  >
                                                    <div class="edit">
                                                      <button
                                                        onClick={() =>
                                                          TemplateEditBtnClicked(
                                                            Template,
                                                          )
                                                        }
                                                        class="btn btn-sm btn-success edit-item-btn actionButtonsStyle"
                                                      >
                                                        <i class="ri-pencil-fill"></i>
                                                      </button>
                                                    </div>
                                                  </Tooltip>
                                                )}
                                                {((userAccessData.Admin_Config_Email_Template_CanDelete &&
                                                  common.organisationKeyID !==
                                                    null) ||
                                                  (userAccessData.SuperAdmin_Config_Email_Template_CanDelete &&
                                                    common.organisationKeyID ===
                                                      null)) && (
                                                  <Tooltip
                                                    title={getCrudButtonToolTipName(
                                                      "Delete",
                                                      moduleName,
                                                    )}
                                                  >
                                                    <div class="remove">
                                                      <button
                                                        onClick={() =>
                                                          setModelRequestData(
                                                            (prevState) => ({
                                                              ...prevState,
                                                              // keyID: Template.keyID,
                                                              reminderKeyID:
                                                                Template.reminderKeyID,
                                                              userKeyID:
                                                                common.userKeyID,
                                                              Action: "Delete",
                                                            }),
                                                          )
                                                        }
                                                        class="btn btn-sm btn-danger remove-item-btn actionButtonsStyle"
                                                        data-bs-toggle="modal"
                                                        data-bs-target="#ConfirmModel"
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
                            {/* end card  */}
                            {listCount > pageSize && (
                              <PaginationComponent
                                totalCount={listCount}
                                totalPages={totalPage}
                                currentPage={currentPage}
                                onPageChange={handlePageChange}
                              />
                            )}
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
                  <ErrorModel
                    ErrorModel={openErrorModal}
                    handleClose={handleClose}
                    ErrorMessage={errorMessage}
                  />
                  {/* Confirm Modal  */}
                  <ConfirmModel
                    openErrorModal={openErrorModal}
                    openSuccessModal={openSuccessModal}
                    modelRequestData={modelRequestData}
                    UpdatedStatus={EmailTemplatesChangeStatusDataAndDeleteData}
                  />
                  <RecordsAvailablePopupModel
                    handleClose={handleClose}
                    openErrorModal={openErrorModal}
                    openSuccessModal={openSuccessModal}
                    modelRequestData={modelRequestData}
                    UpdatedStatus={EmailTemplatesChangeStatusDataAndDeleteData}
                  />
                  {/* Success Modal  */}
                  <SuccessModal
                    handleClose={handleClose}
                    setOpenSuccessModal={setOpenSuccessModal}
                    openSuccessModal={openSuccessModal}
                    modelAction={modelRequestData.Action}
                    message={
                      modelRequestData.Action === "Delete"
                        ? `${moduleName}`
                        : "Status has been changed successfully!"
                    }
                  />
                  <FilterModel
                    class="modal fade"
                    id="FilterModel"
                    tabIndex="-1"
                    aria_labelledby="exampleModalLabel"
                    aria_hidden="true"
                    data-bs-backdrop="static"
                    data-bs-keyboard="false"
                    ModuleName={moduleName}
                    isFilterApply={isFilterApply}
                    setIsFilterApply={setIsFilterApply}
                    ApplyFilter={ApplyFilter}
                    EmailAddressType={EmailAddressType}
                    TriggerPointType={TriggerPointType}
                    setEmailAddressType={setEmailAddressType}
                    setTriggerPointType={setTriggerPointType}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
      {/* end back-to-top */}
    </div>
  );
}

export default SuperAdminMarketingReminderList;
