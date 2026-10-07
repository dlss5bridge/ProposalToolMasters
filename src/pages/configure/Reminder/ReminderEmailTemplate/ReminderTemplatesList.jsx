/* global $ */
import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import FilterModel from "../../../../components/FilterModel";
import ConfirmModel from "../../../../components/ConfirmationBox";
import {
  ReminderTemplatesDelete,
  GetReminderTemplatesList,
  ReminderTemplatesChangeStatus,
  GetChangeIsDefaultStatus,
  GetReminderTemplatesModel,
  CopyReminderEmailTemplate,
} from "../../../../redux/Services/Config/ReminderTemplatesApi";
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
  Mail,
  ChevronDown,
  Funnel,
} from "lucide-react";
import "./ReminderTemplateListFigma.css";
import "../../../../styles/action-menu.css";

function ReminderTemplateList() {
  const moduleName = "Workflow Email Template";
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
  } = useContext(AuthContextProvider);
  const [EmailTemplateList, setEmailTemplateList] = useState([]);
  const pageSize = isMobile ? isMobileRecords : desktopRecords;
  const [errorMessage, setErrorMessage] = useState("");
  const [totalRecords, setTotalRecords] = useState(-1);
  const [isAddUpdateActionDone, setIsAddUpdateActionDone] = useState(false);
  const [openSuccessModal, setOpenSuccessModal] = React.useState(false);
  const [currentPage, setCurrentPage] = useState(
    common.currentPage === "" ? 1 : common.currentPage,
  );

  const [sortType, setSortType] = useState(null);
  const [primarySortDirection, setPrimarySortDirection] = useState(null);
  const [primarySortDirectionObj, setPrimarySortDirectionObj] = useState({
    templateNameSort: null,
    TemplateTypeSort: null,
    BusinessType: null,
    ProspectBusinessType: null,
    ProfessionType: null,
  });
  const [searchKeyword, setSearchKeyword] = useState("");
  const [openErrorModal, setOpenErrorModal] = useState(false);
  const [isFilterApply, setIsFilterApply] = useState(false);
  const [TemplateType, setTemplateType] = useState(null);
  const [modelRequestData, setModelRequestData] = useState({
    professionTypeNames: null,
    BusinessTypeName: null,
    TemplateID: null,
    templateKeyID: null,
    templateName: null,
    status: null,
    isDefault: null,
    StatusType: null,
    Action: "",
    userKeyID: null,
  });
  const dispatch = useDispatch();

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
  }, [pageSize]);

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
      modelRequestData.TemplateID !== null &&
      modelRequestData.templateKeyID !== null &&
      modelRequestData.Action === "Update"
    ) {
      setTopbar("none");
      navigate("/add-reminder-template", { state: modelRequestData });
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
    templateTypeID,
  ) => {
    setLoader(true);
    const pageNoList = i - 1;

    try {
      const data = await GetReminderTemplatesList({
        pageSize: pageSize,
        pageNo: pageNoList,
        organisationID: common.organisationID,
        organisationKeyID: common.organisationKeyID,
        searchKeyword:
          searchKeywordValue === undefined ? searchKeyword : searchKeywordValue,
        primarySortDirection:
          sortValue === undefined ? primarySortDirection : sortValue,
        PrimarySortColumnName: sortType == "" ? TemplateSort : sortType,
        TemplateTypeID:
          templateTypeID === undefined ? TemplateType : templateTypeID,
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
          const Data = await ReminderTemplatesChangeStatus(
            modelRequestData.templateKeyID,
            modelRequestData.userKeyID,
          );
          if (Data) {
            setLoader(false);
            if (Data?.data?.statusCode === 200) {
              if (
                Data?.data?.responseData.templateExistsInModule.length !== 0
              ) {
                const moduleNames =
                  Data?.data?.responseData.templateExistsInModule
                    .map((item) => item.moduleName)
                    ?.join(", ");
                const servicePackageNames =
                  Data?.data?.responseData.templateExistsInModule.flatMap(
                    (item) =>
                      item.recordList.map((templateName) => templateName.name),
                  );
                setModelRequestData({
                  ...modelRequestData,
                  Action: "EmailTemplateWarning",
                  message: `Following ${moduleNames} are assigned to the selected ${moduleName}.You must remove the ${moduleNames} from this ${moduleName} before attempting to mark it as InActive.`,
                  ServiceName: servicePackageNames,
                });
                $("#" + "ConfirmModel").modal("hide");
                $("#" + "RecordsAvailablePopupModel").modal("show");
                // GetEmailTemplatesListData(currentPage);
              } else {
                GetEmailTemplatesListData(currentPage);
                $("#" + "ConfirmModel").one("hidden.bs.modal", () => {
                  setOpenSuccessModal(true);
                });
                $("#" + "ConfirmModel").modal("hide");
              }
            } else {
              setErrorMessage(Data?.response?.data?.errorMessage);
              setOpenErrorModal(true);
            }
            GetEmailTemplatesListData(isCurrentPage);
          }
        } catch (error) {
          console.log(error);
        }
      } else if (modelRequestData.StatusType === "IsDefault") {
        try {
          const Data = await GetChangeIsDefaultStatus(
            common.organisationKeyID,
            modelRequestData.templateKeyID,
            modelRequestData.isDefault,
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
        const Data = await ReminderTemplatesDelete(
          modelRequestData.templateKeyID,
          modelRequestData.userKeyID,
        );
        if (Data) {
          setLoader(false);
          if (Data?.data?.statusCode === 200) {
            if (Data?.data?.responseData.templateExistsInModule.length !== 0) {
              const moduleNames =
                Data?.data?.responseData.templateExistsInModule
                  .map((item) => item.moduleName)
                  ?.join(", ");
              const servicePackageNames =
                Data?.data?.responseData.templateExistsInModule.flatMap(
                  (item) =>
                    item.recordList.map((templateName) => templateName.name),
                );
              setModelRequestData({
                ...modelRequestData,
                Action: "EmailTemplateWarning",
                message: `Following ${moduleNames} are assigned to the selected ${moduleName}.You must remove the ${moduleNames} from this ${moduleName} before attempting to mark it as InActive.`,
                ServiceName: servicePackageNames,
              });
              $("#" + "ConfirmModel").modal("hide");
              $("#" + "RecordsAvailablePopupModel").modal("show");
              GetEmailTemplatesListData(currentPage);
            } else {
              GetEmailTemplatesListData(currentPage);
              $("#" + "ConfirmModel").one("hidden.bs.modal", () => {
                setOpenSuccessModal(true);
              });
              $("#" + "ConfirmModel").modal("hide");
            }
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
        TemplateID: null,
        templateKeyID: null,
      });
    }

    let addEmailTemplateRequestData = {
      TemplateID: null,
      templateKeyID: null,
      templateName: null,
      status: null,
    };
    setTopbar("none");
    navigate("/add-reminder-template", { state: addEmailTemplateRequestData });
  };
  // 2) On Click Template Edit Button
  const TemplateEditBtnClicked = async (Template, type) => {
    if (type === "editPredefined") {
      setLoader(true);
      const data = await GetReminderTemplatesModel(
        Template.templateKeyID,
        true,
      );
      if (data?.data?.statusCode === 200) {
        setLoader(false);
        setModelRequestData({
          ...modelRequestData,
          TemplateID: Template.templateID,
          templateKeyID: Template.templateKeyID,
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
      setModelRequestData({
        ...modelRequestData,
        TemplateID: Template.templateID,
        templateKeyID: Template.templateKeyID,
        Action: "Update",
      });
    }
  };
  // Copy Reminder Email Record
  const CopyReminderEmailTemplateData = async () => {
    if (!common.userKeyID) return;
    try {
      setLoader(true);
      const data = await CopyReminderEmailTemplate(
        modelRequestData.templateKeyID,
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
    } else if (TemplateSort === "BusinessType") {
      setPrimarySortDirection(sortValue);
      setPrimarySortDirectionObj({
        ...primarySortDirectionObj,
        BusinessType: sortValue,
      });
      setCurrentPage(1);
      GetEmailTemplatesListData(1, searchKeyword, sortValue, TemplateSort);
    } else if (TemplateSort === "ProspectBusinessType") {
      setPrimarySortDirection(sortValue);
      setPrimarySortDirectionObj({
        ...primarySortDirectionObj,
        ProspectBusinessType: sortValue,
      });
      setCurrentPage(1);
      GetEmailTemplatesListData(1, searchKeyword, sortValue, TemplateSort);
    } else if (TemplateSort === "ProfessionType") {
      setPrimarySortDirection(sortValue);
      setPrimarySortDirectionObj({
        ...primarySortDirectionObj,
        ProfessionType: sortValue,
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
  const replaceNames = (text, EngagementName, proposalName) => {
    return text
      .replace(/Contract/g, EngagementName)
      .replace(/Quote/g, proposalName);
  };

  const ApplyFilter = () => {
    if (TemplateType !== null && TemplateType !== "") {
      setIsFilterApply(true);
    } else {
      setIsFilterApply(false);
    }
    GetEmailTemplatesListData(
      1,
      searchKeyword,
      primarySortDirection,
      sortType,
      TemplateType,
    );
  };
  const ClearFilter = () => {
    setIsFilterApply(false);
    setTemplateType(null);
    GetEmailTemplatesListData(
      1,
      searchKeyword,
      primarySortDirection,
      sortType,
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

  const handleNameSort = () => {
    const current = primarySortDirectionObj.templateNameSort;
    const next = current === "asc" ? "desc" : "asc";
    setSortType("TemplateName");
    handleSort(next, "TemplateName");
  };

  const handleTemplateTypeSort = () => {
    const current = primarySortDirectionObj.TemplateTypeSort;
    const next = current === "asc" ? "desc" : "asc";
    setSortType("TemplateType");
    handleSort(next, "TemplateType");
  };

  const renderSort = (direction, label, onClick) => (
    <button
      type="button"
      className={`reminder-sort ${direction === "desc" ? "is-desc" : ""}`}
      onClick={onClick}
      aria-label={`Sort ${label}`}
    >
      <ChevronDown size={15} strokeWidth={2} />
    </button>
  );

  const renderDefaultControl = (Template) => {
    const isDefault = Template.isDefaultName === "Yes";

    return (
      <div className="reminder-state-cell">
        {canDelete && (
          <Tooltip title={getCrudButtonToolTipName("Change Is Default")}>
            <button
              type="button"
              className={`reminder-toggle ${isDefault ? "is-on" : ""}`}
              onClick={() =>
                setModelRequestData({
                  ...modelRequestData,
                  professionTypeNames: Template.professionTypeNames,
                  BusinessTypeName: Template.orgBusinessType,
                  status: isDefault ? "Active" : "InActive",
                  templateKeyID: Template.templateKeyID,
                  isDefault: !isDefault,
                  StatusType: "IsDefault",
                  Action: "Status",
                })
              }
              data-bs-toggle="modal"
              data-bs-target="#ConfirmModel"
              aria-label={`Change default status for ${Template.templateName}`}
            >
              <span className="reminder-toggle__thumb" />
            </button>
          </Tooltip>
        )}

        <span
          className={`reminder-status-pill ${
            isDefault ? "is-default" : "is-neutral"
          }`}
        >
          {Template.isDefaultName}
        </span>
      </div>
    );
  };

  const renderStatusControl = (Template) => {
    const isActive = Template.statusName === "Active";

    return (
      <div className="reminder-state-cell">
        {canDelete && (
          <Tooltip title={getCrudButtonToolTipName("Change Status")}>
            <button
              type="button"
              className={`reminder-toggle ${isActive ? "is-on" : ""}`}
              onClick={() =>
                setModelRequestData({
                  ...modelRequestData,
                  professionTypeNames: Template.professionTypeNames,
                  BusinessTypeName: Template.orgBusinessType,
                  status: isActive ? "Active" : "InActive",
                  templateKeyID: Template.templateKeyID,
                  userKeyID: common.userKeyID,
                  StatusType: null,
                  Action: "Status",
                })
              }
              data-bs-toggle="modal"
              data-bs-target="#ConfirmModel"
              aria-label={`Change status for ${Template.templateName}`}
            >
              <span className="reminder-toggle__thumb" />
            </button>
          </Tooltip>
        )}

        <span
          className={`reminder-status-pill ${
            isActive ? "is-active" : "is-inactive"
          }`}
        >
          <span className="reminder-status-pill__dot" />
          {Template.statusName}
        </span>
      </div>
    );
  };

  const renderActionMenu = (Template) => (
    <div className="dropdown reminder-actions">
      <button
        type="button"
        className="reminder-actions__trigger"
        data-bs-toggle="dropdown"
        aria-expanded="false"
        aria-label={`Actions for ${Template.templateName}`}
      >
        <MoreVertical size={18} strokeWidth={2} />
      </button>

      <ul className="dropdown-menu dropdown-menu-end reminder-actions__menu">
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
                templateName: Template.templateName,
                templateKeyID: Template.templateKeyID,
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
          <>
            <li>
              <hr className="dropdown-divider" />
            </li>
            <li>
              <button
                type="button"
                className="dropdown-item reminder-actions__danger"
                data-bs-toggle="modal"
                data-bs-target="#ConfirmModel"
                onClick={() =>
                  setModelRequestData({
                    ...modelRequestData,
                    templateKeyID: Template.templateKeyID,
                    templateName: Template.templateName,
                    userKeyID: common.userKeyID,
                    Action: "Delete",
                  })
                }
              >
                <Trash2 size={15} strokeWidth={2} />
                <span>Delete</span>
              </button>
            </li>
          </>
        )}
      </ul>
    </div>
  );

  return (
    <>
      <div className="reminder-templates-figma">
        <div className="reminder-templates-figma__inner">
          <div className="reminder-page-header">
            <h1>{moduleName}</h1>

            {canAdd && (
              <Tooltip title={getCrudButtonToolTipName("Add ", moduleName)}>
                <button
                  type="button"
                  className="reminder-add-btn"
                  onClick={TemplateAddBtnClicked}
                >
                  <Plus size={17} strokeWidth={2.2} />
                  <span>Add {moduleName}</span>
                </button>
              </Tooltip>
            )}
          </div>

          <section className="reminder-panel">
            <div className="reminder-toolbar">
              <div className="reminder-toolbar__left">
                <div className="reminder-search">
                  <Search
                    className="reminder-search__icon"
                    size={18}
                    strokeWidth={1.9}
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
                    className={`reminder-filter-btn ${
                      isFilterApply ? "is-active" : ""
                    }`}
                    data-bs-toggle="modal"
                    data-bs-target="#FilterModel"
                  >
                    <Funnel size={17} strokeWidth={1.9} className="app-filter-icon" />
                    <span>Filter</span>
                  </button>
                </Tooltip>

                {isFilterApply && (
                  <button
                    type="button"
                    className="reminder-clear-filter"
                    onClick={ClearFilter}
                  >
                    Clear Filter
                  </button>
                )}
              </div>
            </div>

            <div className="reminder-table-wrap">
              <table className="reminder-table">
                <thead>
                  <tr>
                    <th className="reminder-table__name-heading">
                      <div className="reminder-table__header-label">
                        <span>Name</span>
                        {renderSort(
                          primarySortDirectionObj.templateNameSort,
                          "template name",
                          handleNameSort,
                        )}
                      </div>
                    </th>

                    <th className="reminder-table__type-heading">
                      <div className="reminder-table__header-label">
                        <span>Template Type</span>
                        {renderSort(
                          primarySortDirectionObj.TemplateTypeSort,
                          "template type",
                          handleTemplateTypeSort,
                        )}
                      </div>
                    </th>

                    <th className="reminder-table__default-heading">Default</th>
                    <th className="reminder-table__status-heading">Status</th>
                    <th className="reminder-table__actions-heading">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {EmailTemplateList.slice(
                    0,
                    isMobile ? isMobileRecords : desktopRecords,
                  ).map((Template) => (
                    <tr key={Template.templateKeyID || Template.templateID}>
                      <td>
                        <div className="reminder-name-cell">
                          <div className="reminder-template-icon">
                            <Mail size={17} strokeWidth={2} />
                          </div>

                          <div className="reminder-name-cell__content">
                            <Tooltip
                              title={
                                Template.templateName?.length > 55
                                  ? Template.templateName
                                  : ""
                              }
                              arrow
                            >
                              <span className="reminder-template-name-text">
                                {Template.templateName}
                              </span>
                            </Tooltip>

                            {Template.notifySAChanges !== null &&
                              common.organisationKeyID !== null && (
                                <Tooltip title="View System Administrator Changes">
                                  <button
                                    type="button"
                                    className="reminder-admin-change"
                                    onClick={() =>
                                      TemplateEditBtnClicked(
                                        Template,
                                        "editPredefined",
                                      )
                                    }
                                  >
                                    <BellRing size={13} strokeWidth={2} />
                                    <span>System change</span>
                                  </button>
                                </Tooltip>
                              )}
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="reminder-type-pill">
                          {replaceNames(
                            Template.templateType,
                            EngagementName,
                            proposalName,
                          )}
                        </span>
                      </td>

                      <td>{renderDefaultControl(Template)}</td>
                      <td>{renderStatusControl(Template)}</td>
                      <td className="reminder-table__actions-cell">
                        {renderActionMenu(Template)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalRecords <= 0 && (
              <div className="reminder-no-results">
                <NoResultFoundModel
                  name={moduleName}
                  totalRecords={totalRecords}
                />
              </div>
            )}

            {listCount > pageSize && (
              <div className="reminder-pagination">
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
              : CopyReminderEmailTemplateData
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
              ? `${moduleName} ${modelRequestData.templateName}`
              : modelRequestData.Action === "Copy"
                ? `Copy of ${modelRequestData.templateName} has been created successfully!`
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
          TemplateType={TemplateType}
          setTemplateType={setTemplateType}
        />

        <Footer />
      </div>
    </>
  );
}

export default ReminderTemplateList;
