/* global $ */
import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import CommonButtonComponent from "../../../../components/CommonButtonComponent";
import ConfirmModel from "../../../../components/ConfirmationBox";
import FilterModel from "../../../../components/FilterModel";
import {
  MarketingReminderChangeStatus,
  MarketingReminderDelete,
} from "../../../../redux/Services/Setting/MarketingReminderApi";
import {
  AddFreePackageUpgradeRemindersForSelectedOrganisations,
  GetOldOrganisationsWithFreePackage,
  GetSubscriptionPackageReminderList,
  GetFreePackageOrganisationList,
  SubscriptionReminderChangeStatus,
} from "../../../../redux/Services/Setting/SubscriptionPackageReminderApi";
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
import Select from "react-select";
import "./SuperAdminReminderSubscriptionPackageList-redesign.css";

function SuperAdminReminderSubscriptionPackageList() {
  const moduleName = "Subscription Package Reminder";
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
  const [organisationList, setOrganisationList] = useState([]);
  const [oldOrganisations, setOldOrganisations] = useState([]);
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
    reminderTypeID: null,
    reminderNameType: null,
    emailTemplateType: null,
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
    GetOrganisationListData(common.userKeyID, 30);
    GetOldOrganisationsWithFreePackageData();
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
      navigate("/UpdateSuperAdminSubscriptionPackageReminder", {
        state: modelRequestData,
      });
    }
  }, [modelRequestData]);

  const organisationOptions = organisationList.map((o) => ({
    value: o.organisationKeyID,
    label: o.tradingBusinessName,
  }));
  console.log(organisationOptions);

  // Handle Add Orgs
  const handleAddOrganisations = async (oldOrganisations) => {
    setLoader(true);
    try {
      const orgKeyIds = oldOrganisations.map((o) => o.organisationKeyID);
      const data =
        await AddFreePackageUpgradeRemindersForSelectedOrganisations(orgKeyIds);
      if (data?.data?.statusCode === 200) {
        setLoader(false);
      } else {
        setLoader(false);
        setErrorMessage(data?.data?.errorMessage);
      }
      await GetOldOrganisationsWithFreePackageData();
    } catch (error) {
      console.log(error);
    }
  };
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
      const data = await GetSubscriptionPackageReminderList({
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
  // Organisations for the workflow
  const GetOrganisationListData = async (userKeyID, pageSize) => {
    setLoader(true);
    try {
      const data = await GetFreePackageOrganisationList(userKeyID, 30);

      if (data) {
        if (data?.data?.statusCode === 200) {
          setLoader(false);
          if (data?.data?.responseData?.data) {
            const orgList = data?.data?.responseData?.data;
            const totalCount = data.data.totalCount;
            const totalUserCount = data.data.responseData?.totalUserCount;
            setOrganisationList(orgList);
            setTotalRecords(orgList.length);
          }
        } else {
          setErrorMessage(data?.data?.errorMessage);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Old Orgs with Free Package selected for workflow
  const GetOldOrganisationsWithFreePackageData = async () => {
    setLoader(true);
    try {
      const data = await GetOldOrganisationsWithFreePackage();
      if (data) {
        if (data?.data?.statusCode === 200) {
          setLoader(false);
          setOldOrganisations(data?.data?.responseData?.data);
        } else {
          setLoader(false);
          setErrorMessage(data?.data?.errorMessage);
        }
      }
    } catch (error) {
      setLoader(false);
      console.log(error);
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
      Action: "Update",
      //   lessDay: lessDay,
      //   greaterDay: greaterDay,
      reminderKeyID: Template.reminderKeyID,
      //   emailTemplateType: emailTemplateType,
      //   templateTypeID: templateTypeID,
      reminderTypeID: 5,
      reminderNameType: Template.reminderNameType,
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
    <div className="container-fluid subscription-reminder-list-redesign">
      <div className="subscription-reminder-page">
        {/* =====================================================
            PAGE HEADER
            ===================================================== */}
        <div className="subscription-reminder-page-header">
          <div className="subscription-reminder-heading-copy">
            <h1>Subscription Package Reminder</h1>
            <p>
              Manage subscription package reminder schedules, email templates,
              status and organisation assignments.
            </p>
          </div>

          <div className="subscription-reminder-count">
            <span className="subscription-reminder-count-icon">
              <i className="ri-notification-3-line"></i>
            </span>

            <div>
              <span>Total Reminders</span>
              <strong>{listCount > 0 ? listCount : 0}</strong>
            </div>
          </div>
        </div>

        {/* =====================================================
            REMINDER LIST
            ===================================================== */}
        <section className="subscription-reminder-list-card">
          <div className="subscription-reminder-toolbar">
            <div className="subscription-reminder-search-wrap">
              <i className="ri-search-line"></i>

              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => {
                  handleSearch(e);
                }}
                className="form-control subscription-reminder-search-input"
                placeholder={
                  isMobile
                    ? "Search"
                    : getPlaceholderTextName("Search", moduleName)
                }
              />
            </div>

            <div className="subscription-reminder-toolbar-note">
              <span>
                {listCount > 0
                  ? `${listCount} ${listCount === 1 ? "reminder" : "reminders"}`
                  : "No reminders"}
              </span>
            </div>
          </div>

          <div className="subscription-reminder-table-scroll">
            <table className="subscription-reminder-table" id="customerTable">
              <thead>
                <tr>
                  <th>Reminder Name</th>
                  <th>Reminder Type</th>
                  <th>Email Template</th>
                  <th>Days</th>
                  <th>Sequence</th>
                  <th>Status</th>
                  <th className="subscription-reminder-actions-heading">
                    {((userAccessData.Admin_Config_Email_Template_CanEdit &&
                      common.organisationKeyID !== null) ||
                      (userAccessData.SuperAdmin_Config_Email_Template_CanAdd &&
                        common.organisationKeyID === null)) && <>Action</>}
                  </th>
                </tr>
              </thead>

              <tbody>
                {EmailTemplateList.slice(
                  0,
                  isMobile ? isMobileRecords : desktopRecords,
                ).map((Template, index) => {
                  return (
                    <tr key={Template.reminderKeyID || index}>
                      {/* REMINDER NAME */}
                      <td>
                        <div className="subscription-reminder-name-cell">
                          <span className="subscription-reminder-name-icon">
                            <i className="ri-notification-4-line"></i>
                          </span>

                          <div className="subscription-reminder-name-copy">
                            {isMobile ? (
                              <strong>
                                {Template.reminderName.length > 20
                                  ? `${Template.reminderName.substring(
                                      0,
                                      20,
                                    )}...`
                                  : Template.reminderName}
                              </strong>
                            ) : (
                              <>
                                {Template.reminderName.length > 50 ? (
                                  <Tooltip title={Template.reminderName}>
                                    <strong>
                                      {`${Template.reminderName.substring(
                                        0,
                                        50,
                                      )}...`}
                                    </strong>
                                  </Tooltip>
                                ) : (
                                  <strong>{Template.reminderName}</strong>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* REMINDER TYPE */}
                      <td>
                        <span className="subscription-reminder-type-text">
                          {Template.reminderNameType?.replace(/_/g, " ")}
                        </span>
                      </td>

                      {/* EMAIL TEMPLATE */}
                      <td>
                        <span className="subscription-reminder-template-pill">
                          {Template.templateName}
                        </span>
                      </td>

                      {/* DAYS */}
                      <td>
                        <span className="subscription-reminder-days-pill">
                          {Template.days}
                        </span>
                      </td>

                      {/* SEQUENCE */}
                      <td>
                        <span className="subscription-reminder-sequence">
                          {Template.sequenceName}
                        </span>
                      </td>

                      {/* STATUS */}
                      <td>
                        <div className="subscription-reminder-status-cell">
                          <span
                            className={`subscription-reminder-status-pill ${
                              Template.statusName === "Active"
                                ? "is-active"
                                : "is-inactive"
                            }`}
                          >
                            {Template.statusName}
                          </span>

                          {((userAccessData.Admin_Config_Email_Template_CanDelete &&
                            common.organisationKeyID !== null) ||
                            (userAccessData.SuperAdmin_Config_Email_Template_CanDelete &&
                              common.organisationKeyID === null)) && (
                            <Tooltip
                              title={getCrudButtonToolTipName("Change Status")}
                            >
                              <FormGroup>
                                <FormControlLabel
                                  control={
                                    <Android12Switch
                                      onClick={() =>
                                        setModelRequestData({
                                          ...modelRequestData,
                                          professionTypeNames:
                                            Template.professionTypeNames,
                                          BusinessTypeName:
                                            Template.orgBusinessType,
                                          reminderKeyID: Template.reminderKeyID,
                                          status:
                                            Template.statusName === "Active"
                                              ? "Active"
                                              : "InActive",
                                          userKeyID: common.userKeyID,
                                          StatusType: null,
                                          Action: "Status",
                                        })
                                      }
                                      checked={Template.statusName === "Active"}
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
                      <td className="subscription-reminder-actions-cell">
                        <div className="subscription-reminder-row-actions">
                          {((userAccessData.Admin_Config_Email_Template_CanEdit &&
                            common.organisationKeyID !== null) ||
                            (userAccessData.SuperAdmin_Config_Email_Template_CanEdit &&
                              common.organisationKeyID === null)) && (
                            <Tooltip
                              title={getCrudButtonToolTipName(
                                "Update",
                                moduleName,
                              )}
                            >
                              <button
                                type="button"
                                onClick={() => TemplateEditBtnClicked(Template)}
                                className="subscription-reminder-action-btn subscription-reminder-edit-btn"
                              >
                                <i className="ri-pencil-fill"></i>
                              </button>
                            </Tooltip>
                          )}

                          {((userAccessData.Admin_Config_Email_Template_CanDelete &&
                            common.organisationKeyID !== null) ||
                            (userAccessData.SuperAdmin_Config_Email_Template_CanDelete &&
                              common.organisationKeyID === null)) && (
                            <Tooltip
                              title={getCrudButtonToolTipName(
                                "Delete",
                                moduleName,
                              )}
                            >
                              <button
                                type="button"
                                onClick={() =>
                                  setModelRequestData((prevState) => ({
                                    ...prevState,
                                    reminderKeyID: Template.reminderKeyID,
                                    userKeyID: common.userKeyID,
                                    Action: "Delete",
                                  }))
                                }
                                className="subscription-reminder-action-btn subscription-reminder-delete-btn"
                                data-bs-toggle="modal"
                                data-bs-target="#ConfirmModel"
                              >
                                <i className="ri-delete-bin-5-fill"></i>
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
          </div>

          {totalRecords <= 0 && (
            <div className="subscription-reminder-empty-state">
              <NoResultFoundModel
                name={moduleName}
                totalRecords={totalRecords}
              />
            </div>
          )}
        </section>

        {/* =====================================================
            PAGINATION OUTSIDE LIST CARD
            ===================================================== */}
        {listCount > pageSize && (
          <div className="subscription-reminder-pagination">
            <PaginationComponent
              totalCount={listCount}
              totalPages={totalPage}
              currentPage={currentPage}
              onPageChange={handlePageChange}
            />
          </div>
        )}

        {/* =====================================================
            ORGANISATION ASSIGNMENT
            ===================================================== */}
        <section className="subscription-reminder-organisation-card">
          <div className="subscription-reminder-organisation-header">
            <div className="subscription-reminder-organisation-title">
              <span className="subscription-reminder-organisation-icon">
                <i className="ri-building-4-line"></i>
              </span>

              <div>
                <h2>Free Package Organisations</h2>
                <p>
                  Select organisations that should receive free package upgrade
                  reminders.
                </p>
              </div>
            </div>

            <span className="subscription-reminder-selected-org-count">
              {oldOrganisations.length} selected
            </span>
          </div>

          <div className="subscription-reminder-organisation-body">
            <div className="subscription-reminder-organisation-field">
              <label className="form-label">
                Select Organisations <span className="text-danger">*</span>
              </label>

              <Select
                isMulti
                menuPlacement="top"
                className="subscription-reminder-organisation-select"
                classNamePrefix="subscription-reminder-select"
                options={organisationOptions}
                value={organisationOptions.filter((opt) =>
                  oldOrganisations.some(
                    (o) => o.organisationKeyID === opt.value,
                  ),
                )}
                onChange={(selectedOptions) => {
                  const updated = selectedOptions.map((sel) => ({
                    organisationKeyID: sel.value,
                    organisationName: sel.label,
                  }));
                  setOldOrganisations(updated);
                }}
              />
            </div>

            <button
              type="button"
              className="subscription-reminder-add-org-btn"
              onClick={() => handleAddOrganisations(oldOrganisations)}
            >
              <i className="ri-add-line"></i>
              <span>Add Organisations</span>
            </button>
          </div>
        </section>

        {/* =====================================================
            EXISTING MODALS
            ===================================================== */}
        <ErrorModel
          ErrorModel={openErrorModal}
          handleClose={handleClose}
          ErrorMessage={errorMessage}
        />

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

      <div className="subscription-reminder-footer-wrap">
        <Footer />
      </div>
    </div>
  );
}

export default SuperAdminReminderSubscriptionPackageList;
