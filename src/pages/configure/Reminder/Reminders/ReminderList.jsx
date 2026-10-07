/* global $ */
import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import FilterModel from "../../../../components/FilterModel";
import ConfirmModel from "../../../../components/ConfirmationBox";
import {
  ReminderDelete,
  GetReminderList,
  ReminderChangeStatus,
  GetReminderModel,
  CopyReminder,
} from "../../../../redux/Services/Config/ReminderCrudApi";
import PaginationComponent from "../../../../components/PaginationModel";

import { AuthContextProvider } from "../../../../AuthContext/AuthContext";
import { useDispatch, useSelector } from "react-redux";
import Tooltip from "@mui/material/Tooltip";
import NoResultFoundModel from "../../../../components/NoResultFoundModel";
import SuccessModal from "../../../../components/SuccessModal";
import ErrorModel from "../../../../components/ErrorModel";
import Footer from "../../../../components/Footer";
import { updateState } from "../../../../redux/Persist";

import RecordsAvailablePopupModel from "../../../../components/RecordsAvailablePopupModel";
import {
  Search,
  Plus,
  MoreVertical,
  Copy,
  Pencil,
  Trash2,
  BellRing,
  Check,
  X,
  Funnel,
} from "lucide-react";
import "./ReminderList.css";
import "../../../../styles/action-menu.css";

function ReminderList() {
  const moduleName = "Reminder";
  let getEmailTemplatesListApiCallCount = 0;
  //A]Declare state
  const common = useSelector((state) => state.Storage); //Getting Logged Users Details From Persist Storage of redux hooks
  const navigate = useNavigate();
  const {
    setLoader,
    setTopbar,
    maxCountToRecallApi,
    totalPage,
    EngagementName,
    proposalName,
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
  const [isFilterApply, setIsFilterApply] = useState(false);
  const [EmailAddressType, setEmailAddressType] = useState(null);
  const [TriggerPointType, setTriggerPointType] = useState(null);
  const [DocumentStatus, setDocumentStatus] = useState(null);
  const [totalRecords, setTotalRecords] = useState(-1);
  const [errorMessage, setErrorMessage] = useState("");
  const [isAddUpdateActionDone, setIsAddUpdateActionDone] = useState(false);
  const [openSuccessModal, setOpenSuccessModal] = React.useState(false);
  const [currentPage, setCurrentPage] = useState(
    common.currentPage === "" ? 1 : common.currentPage,
  );
  const [reminderName, setReminderName] = useState("");

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
  const [showProfessionType, setShowProfessionType] = useState(
    common.organisationKeyID === null || common.professionTypeLists.length > 1,
  );

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
  }, []);

  //2) This useEffect will trigger when we successfully add or update record from popup model
  useEffect(() => {
    if (isAddUpdateActionDone) {
      if (modelRequestData.Action === null) {
        setSearchKeyword("");
        setPrimarySortDirection(null);
        setCurrentPage(1);
        GetEmailTemplatesListData(isCurrentPage, null, null);
      } else {
        GetEmailTemplatesListData(isCurrentPage);
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
      navigate("/add-reminder", { state: modelRequestData });
    } else {
      GetEmailTemplatesListData(isCurrentPage);
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
    setLoader(true);
    const pageNoList = i - 1;
    try {
      const data = await GetReminderList({
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
        documentStatusID:
          documentStatusID === undefined ? DocumentStatus : documentStatusID,
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
          const Data = await ReminderChangeStatus(
            modelRequestData.reminderKeyID,
            modelRequestData.userKeyID,
          );
          if (Data) {
            setLoader(false);
            if (Data?.data?.statusCode === 200) {
              GetEmailTemplatesListData(currentPage);
              $("#" + "ConfirmModel").one("hidden.bs.modal", () => {
                setOpenSuccessModal(true);
              });
              $("#" + "ConfirmModel").modal("hide");
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
        const Data = await ReminderDelete(
          modelRequestData.reminderKeyID,
          modelRequestData.userKeyID,
        );
        if (Data) {
          setLoader(false);
          if (Data?.data?.statusCode === 200) {
            GetEmailTemplatesListData(currentPage);
            $("#" + "ConfirmModel").one("hidden.bs.modal", () => {
              setOpenSuccessModal(true);
            });
            $("#" + "ConfirmModel").modal("hide");
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
    navigate("/add-reminder", { state: addReminderRequestData });
  };
  // 2) On Click Template Edit Button

  const TemplateEditBtnClicked = async (Template, type) => {
    if (type === "editPredefined") {
      setLoader(true);
      const data = await GetReminderModel(Template.reminderKeyID, true);
      if (data?.data?.statusCode === 200) {
        setLoader(false);
        setModelRequestData({
          ...modelRequestData,
          reminderKeyID: Template.reminderKeyID,
          Action: "Update",
          Type: true,
        });
      } else {
        setLoader(false);
        setErrorMessage(data?.response?.data?.errorMessage);
        setOpenErrorModal(true);
      }
    } else {
      dispatch(
        updateState({
          currentPage: currentPage,
        }),
      );
      setModelRequestData(() => ({
        ...modelRequestData,
        reminderKeyID: Template.reminderKeyID,
        Action: "Update",
      }));
    }
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
  const getDisplayStatusName = (statusName, proposalName, engagementName) => {
    // Replace "Quote" with proposalName and "Contract" with engagementName (case-insensitive)
    let updatedStatusName = statusName
      ?.replace(/quote/gi, proposalName) // "gi" for case-insensitive replacement
      .replace(/contract/gi, engagementName);

    // Split by comma and handle multiple records
    const statusArray = updatedStatusName?.split(",");

    // Display only the first two records followed by "..."
    return statusArray?.length > 2
      ? `${statusArray.slice(0, 2).join(", ")}...`
      : updatedStatusName;
  };

  // Copy Record
  const CopyReminderData = async () => {
    if (!common.userKeyID) return;
    try {
      setLoader(true);
      const data = await CopyReminder(
        modelRequestData.reminderKeyID,
        common.userKeyID,
      );
      if (data?.data?.statusCode === 200) {
        setLoader(false);
        $("#" + "ConfirmModel").one("hidden.bs.modal", () => {
          setOpenSuccessModal(true);
        });
        $("#" + "ConfirmModel").modal("hide");
        GetEmailTemplatesListData(isCurrentPage);
      } else {
        setLoader(false);
        setErrorMessage(data?.data?.errorMessage);
        setOpenErrorModal(true);
      }
    } catch (error) {
      console.error(error);
    }
  };
  const ApplyFilter = () => {
    if (
      (EmailAddressType !== null && EmailAddressType !== "") ||
      (TriggerPointType !== null && TriggerPointType !== "") ||
      (DocumentStatus !== null && DocumentStatus !== "")
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
      DocumentStatus,
    );
  };
  const ClearFilter = () => {
    setIsFilterApply(false);
    setEmailAddressType(null);
    setTriggerPointType(null);
    setDocumentStatus(null);
    GetEmailTemplatesListData(
      1,
      searchKeyword,
      primarySortDirection,
      sortType,
      null,
      null,
      null,
    );
  };

  const canAdd =
    (userAccessData.Admin_Config_Email_Template_CanAdd &&
      common.organisationKeyID !== null) ||
    (userAccessData.SuperAdmin_Config_Email_Template_CanAdd &&
      common.organisationKeyID === null);

  const canEdit =
    (userAccessData.Admin_Config_Email_Template_CanEdit &&
      common.organisationKeyID !== null) ||
    (userAccessData.SuperAdmin_Config_Email_Template_CanEdit &&
      common.organisationKeyID === null);

  const canDelete =
    (userAccessData.Admin_Config_Email_Template_CanDelete &&
      common.organisationKeyID !== null) ||
    (userAccessData.SuperAdmin_Config_Email_Template_CanDelete &&
      common.organisationKeyID === null);

  const getTriggerPointName = (name) => {
    if (!name) return "-";

    if (name.includes("Quote")) {
      return name.replace("Quote", proposalName);
    }

    if (name.includes("Contract")) {
      return name.replace("Contract", EngagementName);
    }

    return name;
  };

  const getNextSortDirection = (direction) =>
    direction === "asc" ? "desc" : "asc";

  const renderSortIcon = (direction) => (
    <span
      className={`reminder-list-sort-icon ${direction ? "is-active" : ""}`}
      aria-hidden="true"
    >
      <i
        className={
          direction === "desc" ? "ri-arrow-down-s-line" : "ri-arrow-up-s-line"
        }
      />
    </span>
  );

  const renderStatusToggle = (Template) => {
    const isActive = Template.statusName === "Active";

    return (
      <div className="reminder-list-status-wrap">
        {canDelete && (
          <Tooltip title={getCrudButtonToolTipName("Change Status")}>
            <button
              type="button"
              className={`reminder-list-toggle ${
                isActive ? "is-active" : "is-inactive"
              }`}
              data-bs-toggle="modal"
              data-bs-target="#ConfirmModel"
              onClick={() =>
                setModelRequestData({
                  ...modelRequestData,
                  professionTypeNames: Template.professionTypeNames,
                  BusinessTypeName: Template.orgBusinessType,
                  reminderKeyID: Template.reminderKeyID,
                  status: isActive ? "Active" : "InActive",
                  userKeyID: common.userKeyID,
                  StatusType: null,
                  Action: "Status",
                })
              }
              aria-label={`Change status for ${Template.reminderName}`}
            >
              <span className="reminder-list-toggle__thumb">
                {isActive ? (
                  <Check size={11} strokeWidth={2.5} />
                ) : (
                  <X size={10} strokeWidth={2.5} />
                )}
              </span>
            </button>
          </Tooltip>
        )}

        <span
          className={`reminder-list-status-pill ${
            isActive ? "is-active" : "is-inactive"
          }`}
        >
          {Template.statusName}
        </span>
      </div>
    );
  };

  const renderActionMenu = (Template) => (
    <div className="dropdown reminder-list-actions">
      <button
        type="button"
        className="reminder-list-actions__trigger"
        data-bs-toggle="dropdown"
        aria-expanded="false"
        aria-label={`Actions for ${Template.reminderName}`}
      >
        <MoreVertical size={18} strokeWidth={2} />
      </button>

      <ul className="dropdown-menu dropdown-menu-end reminder-list-actions__menu">
        <li>
          <button
            type="button"
            className="dropdown-item"
            data-bs-toggle="modal"
            data-bs-target="#ConfirmModel"
            onClick={() =>
              setModelRequestData({
                ...modelRequestData,
                Action: "Copy",
                reminderName: Template.reminderName,
                reminderKeyID: Template.reminderKeyID,
                userKeyID: common.userKeyID,
              })
            }
          >
            <Copy size={15} strokeWidth={2} />
            <span>Copy</span>
          </button>
        </li>

        {canEdit && (
          <li>
            <button
              type="button"
              className="dropdown-item"
              onClick={() => TemplateEditBtnClicked(Template)}
            >
              <Pencil size={15} strokeWidth={2} />
              <span>Edit</span>
            </button>
          </li>
        )}

        {canDelete && (
          <li>
            <button
              type="button"
              className="dropdown-item text-danger"
              data-bs-toggle="modal"
              data-bs-target="#ConfirmModel"
              onClick={() =>
                setModelRequestData((prevState) => ({
                  ...prevState,
                  reminderKeyID: Template.reminderKeyID,
                  reminderName: Template.reminderName,
                  userKeyID: common.userKeyID,
                  Action: "Delete",
                }))
              }
            >
              <Trash2 size={15} strokeWidth={2} />
              <span>Delete</span>
            </button>
          </li>
        )}
      </ul>
    </div>
  );

  return (
    <>
      <div className="reminder-list-page">
        <div className="reminder-list-page__inner">
          <div className="reminder-list-page__header">
            <h1>{moduleName}</h1>

            {canAdd && (
              <Tooltip title={getCrudButtonToolTipName("Add ", moduleName)}>
                <button
                  type="button"
                  className="reminder-list-add-btn"
                  onClick={TemplateAddBtnClicked}
                >
                  <Plus size={17} strokeWidth={2.2} />
                  <span>Add {moduleName}</span>
                </button>
              </Tooltip>
            )}
          </div>

          <section className="reminder-list-card">
            <div className="reminder-list-toolbar">
              <div className="reminder-list-toolbar__left">
                <div className="reminder-list-search">
                  <Search
                    size={17}
                    strokeWidth={2}
                    className="reminder-list-search__icon"
                  />

                  <input
                    type="text"
                    value={searchKeyword}
                    onChange={handleSearch}
                    placeholder={
                      isMobile
                        ? "Search"
                        : getPlaceholderTextName("Search", moduleName)
                    }
                  />
                </div>

                <Tooltip title={getCrudButtonToolTipName("Filter", moduleName)}>
                  <button
                    type="button"
                    className={`reminder-list-filter-btn ${
                      isFilterApply ? "is-active" : ""
                    }`}
                    data-bs-toggle="modal"
                    data-bs-target="#FilterModel"
                  >
                    <Funnel size={17} strokeWidth={1.9} className="app-filter-icon" />
                    <span>Filter</span>

                    {isFilterApply && (
                      <span className="reminder-list-filter-dot" />
                    )}
                  </button>
                </Tooltip>

                {isFilterApply && (
                  <button
                    type="button"
                    className="reminder-list-clear-filter"
                    onClick={ClearFilter}
                  >
                    Clear Filter
                  </button>
                )}
              </div>
            </div>

            <div className="reminder-list-table-wrap">
              <table className="reminder-list-table">
                <thead>
                  <tr>
                    <th className="reminder-list-col-name">
                      <button
                        type="button"
                        className="reminder-list-sort-btn"
                        onClick={() => {
                          const nextDirection = getNextSortDirection(
                            primarySortDirectionObj.templateNameSort,
                          );
                          setSortType("ReminderName");
                          handleSort(nextDirection, "TemplateName");
                        }}
                      >
                        <span>Reminder Name</span>
                        {renderSortIcon(
                          primarySortDirectionObj.templateNameSort,
                        )}
                      </button>
                    </th>

                    <th className="reminder-list-col-template">
                      <button
                        type="button"
                        className="reminder-list-sort-btn"
                        onClick={() => {
                          const nextDirection = getNextSortDirection(
                            primarySortDirectionObj.TemplateTypeSort,
                          );
                          setSortType("TemplateName");
                          handleSort(nextDirection, "TemplateType");
                        }}
                      >
                        <span>Email Template</span>
                        {renderSortIcon(
                          primarySortDirectionObj.TemplateTypeSort,
                        )}
                      </button>
                    </th>

                    <th className="reminder-list-col-email">
                      <button
                        type="button"
                        className="reminder-list-sort-btn"
                        onClick={() => {
                          const nextDirection = getNextSortDirection(
                            primarySortDirectionObj.EmailAddressType,
                          );
                          setSortType("EmailAddressName");
                          handleSort(nextDirection, "EmailAddressName");
                        }}
                      >
                        <span>Email Address</span>
                        {renderSortIcon(
                          primarySortDirectionObj.EmailAddressType,
                        )}
                      </button>
                    </th>

                    <th className="reminder-list-col-trigger">
                      <button
                        type="button"
                        className="reminder-list-sort-btn"
                        onClick={() => {
                          const nextDirection = getNextSortDirection(
                            primarySortDirectionObj.TriggerPointType,
                          );
                          setSortType("TriggerPointName");
                          handleSort(nextDirection, "TriggerPointName");
                        }}
                      >
                        <span>Trigger Point</span>
                        {renderSortIcon(
                          primarySortDirectionObj.TriggerPointType,
                        )}
                      </button>
                    </th>

                    <th className="reminder-list-col-document">
                      Document Status
                    </th>
                    <th className="reminder-list-col-frequency">Frequency</th>
                    <th className="reminder-list-col-repeat">Repeat</th>
                    <th className="reminder-list-col-status">Status</th>
                    <th className="reminder-list-col-action">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {EmailTemplateList.slice(
                    0,
                    isMobile ? isMobileRecords : desktopRecords,
                  ).map((Template) => (
                    <tr key={Template.reminderKeyID}>
                      <td>
                        <div className="reminder-list-name-cell">
                          {Template.notifySAChanges !== null &&
                            common.organisationKeyID !== null && (
                              <Tooltip title="View System Administrator Changes">
                                <button
                                  type="button"
                                  className="reminder-list-notification"
                                  onClick={() =>
                                    TemplateEditBtnClicked(
                                      Template,
                                      "editPredefined",
                                    )
                                  }
                                >
                                  <BellRing size={14} strokeWidth={2} />
                                </button>
                              </Tooltip>
                            )}

                          <Tooltip
                            title={
                              Template.reminderName?.length > 45
                                ? Template.reminderName
                                : ""
                            }
                            arrow
                          >
                            <span className="reminder-list-name">
                              {isMobile && Template.reminderName?.length > 24
                                ? `${Template.reminderName.substring(0, 24)}...`
                                : !isMobile &&
                                    Template.reminderName?.length > 50
                                  ? `${Template.reminderName.substring(
                                      0,
                                      50,
                                    )}...`
                                  : Template.reminderName || "-"}
                            </span>
                          </Tooltip>
                        </div>
                      </td>

                      <td>
                        <Tooltip title={Template.templateName || ""} arrow>
                          <span className="reminder-list-chip reminder-list-chip--template">
                            {Template.templateName || "-"}
                          </span>
                        </Tooltip>
                      </td>

                      <td>
                        <Tooltip
                          title={
                            Template.emailAddressName?.replace(
                              /prospects/gi,
                              prospectName,
                            ) || ""
                          }
                          arrow
                        >
                          <span className="reminder-list-chip">
                            {Template.emailAddressName?.replace(
                              /prospects/gi,
                              prospectName,
                            ) || "-"}
                          </span>
                        </Tooltip>
                      </td>

                      <td>
                        <Tooltip
                          title={getTriggerPointName(Template.triggerPointName)}
                          arrow
                        >
                          <span className="reminder-list-chip reminder-list-chip--trigger">
                            {getTriggerPointName(Template.triggerPointName)}
                          </span>
                        </Tooltip>
                      </td>

                      <td>
                        <Tooltip
                          title={
                            Template.documentStatusName
                              ?.replace(/quote/gi, proposalName)
                              .replace(/contract/gi, EngagementName) || ""
                          }
                          arrow
                        >
                          <span className="reminder-list-document-status">
                            {getDisplayStatusName(
                              Template.documentStatusName,
                              proposalName,
                              EngagementName,
                            ) || "-"}
                          </span>
                        </Tooltip>
                      </td>

                      <td>
                        <span className="reminder-list-frequency">
                          {Template.reminderFrequencyName || "-"}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`reminder-list-repeat ${
                            Template.isRepeat ? "is-yes" : "is-no"
                          }`}
                        >
                          {Template.isRepeat ? "Yes" : "No"}
                        </span>
                      </td>

                      <td>{renderStatusToggle(Template)}</td>

                      <td className="reminder-list-action-cell">
                        {renderActionMenu(Template)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {totalRecords <= 0 && (
                <NoResultFoundModel
                  name={moduleName}
                  totalRecords={totalRecords}
                />
              )}
            </div>

            {listCount > pageSize && (
              <div className="reminder-list-pagination">
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
      </div>

      <ErrorModel
        ErrorModel={openErrorModal}
        handleClose={handleClose}
        ErrorMessage={errorMessage}
      />

      <ConfirmModel
        openErrorModal={openErrorModal}
        openSuccessModal={openSuccessModal}
        modelRequestData={modelRequestData}
        UpdatedStatus={
          modelRequestData.Action === "Delete" ||
          modelRequestData.Action === "Status"
            ? EmailTemplatesChangeStatusDataAndDeleteData
            : CopyReminderData
        }
      />

      <RecordsAvailablePopupModel
        handleClose={handleClose}
        openErrorModal={openErrorModal}
        openSuccessModal={openSuccessModal}
        modelRequestData={modelRequestData}
        UpdatedStatus={EmailTemplatesChangeStatusDataAndDeleteData}
      />

      <SuccessModal
        handleClose={handleClose}
        setOpenSuccessModal={setOpenSuccessModal}
        openSuccessModal={openSuccessModal}
        modelAction={modelRequestData.Action}
        message={`${
          modelRequestData.Action === "Delete"
            ? `${moduleName} ${modelRequestData.reminderName || ""}`
            : modelRequestData.Action === "Copy"
              ? `Copy of ${modelRequestData.reminderName} has been created successfully!`
              : "Status has been changed successfully!"
        }`}
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
        DocumentStatus={DocumentStatus}
        setEmailAddressType={setEmailAddressType}
        setTriggerPointType={setTriggerPointType}
        setDocumentStatus={setDocumentStatus}
      />

      <Footer />
    </>
  );
}

export default ReminderList;
