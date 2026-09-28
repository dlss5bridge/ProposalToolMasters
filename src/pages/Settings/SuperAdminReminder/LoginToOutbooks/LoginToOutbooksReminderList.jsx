/* global $ */
import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import ConfirmModel from "../../../../components/ConfirmationBox";
import { AppSettingType, EmailTemplates } from "../../../../Middleware/enums";
import {
  GetLoginToOutbookUnpaidList,
  GetLoginToOutbookpaidList,
} from "../../../../redux/Services/Setting/LoginToOutbooksReminder";
import {
  ReminderDelete,
  ReminderChangeStatus,
  ChangeStatusForPaidUsersLoginToOutbooksWarningMail,
  ChangeStatusForUnpaidUsersLoginToOutbooksWarningMail,
  GetApplicationSettingList,
} from "../../../../redux/Services/Config/ReminderCrudApi";

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
import "./AccountDeletionReminder-redesign.css";

function AccountDeletionReminder() {
  const moduleName = "Reminder";
  let getEmailTemplatesListApiCallCount = 0;
  //A]Declare state
  const common = useSelector((state) => state.Storage); //Getting Logged Users Details From Persist Storage of redux hooks
  const navigate = useNavigate();
  const {
    setLoader,
    setTopbar,
    maxCountToRecallApi,
    isMobile,
    setListCount,
    desktopRecords,
    isMobileRecords,
    getCrudButtonToolTipName,
    userAccessData,
  } = useContext(AuthContextProvider);
  const [EmailTemplateList, setEmailTemplateList] = useState([]);
  const [ReminderTemplateList, setReminderTemplateList] = useState([]);
  const [applicationStatusLookupList, setApplicationStatusLookupList] =
    useState([]);
  const [totalUnpaidRecords, setTotalUnpaidRecords] = useState(-1);
  const [totalRecords, setTotalRecords] = useState(-1);
  const [errorMessage, setErrorMessage] = useState("");
  const [isAddUpdateActionDone, setIsAddUpdateActionDone] = useState(false);
  const [openSuccessModal, setOpenSuccessModal] = React.useState(false);
  const [currentPage, setCurrentPage] = useState(
    common.currentPage === "" ? 1 : common.currentPage,
  );
  const [searchKeyword, setSearchKeyword] = useState("");
  const [openErrorModal, setOpenErrorModal] = useState(false);
  const [modelRequestData, setModelRequestData] = useState({
    lessDay: null,
    greaterDay: null,
    professionTypeNames: null,
    BusinessTypeName: null,
    reminderKeyID: null,
    keyID: null,
    templateName: null,
    status: null,
    isDefault: null,
    StatusType: null,
    Action: "",
    userKeyID: null,
    emailTemplateType: null,
    listType: null,
    reminderNameType: null,
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
    GetReminderTemplatesListData(isCurrentPage);
    GetApplicationSettingListData();
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
        setCurrentPage(1);
        GetEmailTemplatesListData(isCurrentPage, null, null);
        GetReminderTemplatesListData(isCurrentPage, null, null);
      } else {
        GetEmailTemplatesListData(isCurrentPage);
        GetReminderTemplatesListData(isCurrentPage);
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
      navigate("/update-paid-unpaid-account", { state: modelRequestData });
    }
  }, [modelRequestData.reminderKeyID]);

  // C] Calling All Api's like List and other Here :
  // 1) Get EmailTemplatesList Data
  const GetEmailTemplatesListData = async (
    i,
    searchKeywordValue,
    sortValue,
    TemplateSort,
  ) => {
    setLoader(true);
    const pageNoList = i - 1;
    try {
      const data = await GetLoginToOutbookUnpaidList({
        UserKeyID: common.userKeyID,
        pageSize: pageSize,
        pageNo: pageNoList,
        organisationID: common.organisationID,
        organisationKeyID: common.organisationKeyID,
        searchKeyword:
          searchKeywordValue === undefined ? searchKeyword : searchKeywordValue,
        primarySortDirection: "desc",
        primarySortColumnName: "EmailAddressName",
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
            setTotalUnpaidRecords(totalCount);
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

  const GetReminderTemplatesListData = async (
    i,
    searchKeywordValue,
    sortValue,
    TemplateSort,
  ) => {
    setLoader(true);
    const pageNoList = i - 1;
    try {
      const data = await GetLoginToOutbookpaidList({
        UserKeyID: common.userKeyID,
        pageSize: pageSize,
        pageNo: pageNoList,
        organisationID: common.organisationID,
        organisationKeyID: common.organisationKeyID,
        primarySortDirection: "asc",
        searchKeyword:
          searchKeywordValue === undefined ? searchKeyword : searchKeywordValue,
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
            setReminderTemplateList(TemplateListData);
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
    if (modelRequestData.Action === "PaidUser") {
      if (modelRequestData.StatusType === null) {
        try {
          const Data = await ChangeStatusForPaidUsersLoginToOutbooksWarningMail(
            common.userKeyID,
          );
          if (Data) {
            setLoader(false);

            if (Data?.data?.statusCode === 200) {
              GetApplicationSettingListData();
              $("#" + "ConfirmModel").one("hidden.bs.modal", () => {
                setOpenSuccessModal(true);
              });
              $("#" + "ConfirmModel").modal("hide");
            } else {
              setErrorMessage(Data?.response?.data?.errorMessage);
              setOpenErrorModal(true);
            }
            GetApplicationSettingListData();
          }
        } catch (error) {
          console.log(error);
        }
      }
    } else if (modelRequestData.Action === "UnpaidUser") {
      if (modelRequestData.StatusType === null) {
        try {
          const Data =
            await ChangeStatusForUnpaidUsersLoginToOutbooksWarningMail(
              common.userKeyID,
            );
          if (Data) {
            setLoader(false);

            if (Data?.data?.statusCode === 200) {
              GetApplicationSettingListData();
              $("#" + "ConfirmModel").one("hidden.bs.modal", () => {
                setOpenSuccessModal(true);
              });
              $("#" + "ConfirmModel").modal("hide");
            } else {
              setErrorMessage(Data?.response?.data?.errorMessage);
              setOpenErrorModal(true);
            }
            GetApplicationSettingListData();
          }
        } catch (error) {
          console.log(error);
        }
      }
    }
  };

  // 2) On Click Template Edit Button
  const TemplateEditBtnClicked = (Template, listType, index) => {
    const emailTemplateType = EmailTemplates[Template.type]; // Assuming Template.type corresponds to the keys in EmailTemplates

    let templateTypeID = null;
    let greaterDay = null;
    let lessDay = null;
    let reminderNameType = Template.reminderNameType;
    if (listType === "Unpaid") {
      if (
        Template.reminderNameType ===
        "Login_To_Outbooks_Warning_Email_First_Unpaid_User"
      ) {
        templateTypeID = EmailTemplates.UnpaidUser_FirstMail;
        templateTypeID = EmailTemplates.UnpaidUser_FirstMail;
        // greaterDay = EmailTemplateList[index + 1].days
        reminderNameType = Template.reminderNameType;
        greaterDay = EmailTemplateList.find(
          (item) =>
            item.reminderNameType ===
            "Login_To_Outbooks_Warning_Email_Second_Unpaid_User",
        ).days;
        lessDay = null;
      } else if (
        Template.reminderNameType ===
        "Login_To_Outbooks_Warning_Email_Second_Unpaid_User"
      ) {
        templateTypeID = EmailTemplates.UnpaidUser_SecondMail;
        greaterDay = EmailTemplateList.find(
          (item) =>
            item.reminderNameType ===
            "Login_To_Outbooks_Warning_Email_Third_Unpaid_User",
        ).days;
        lessDay = EmailTemplateList.find(
          (item) =>
            item.reminderNameType ===
            "Login_To_Outbooks_Warning_Email_First_Unpaid_User",
        ).days;
        reminderNameType = Template.reminderNameType;
      } else if (
        Template.reminderNameType ===
        "Login_To_Outbooks_Warning_Email_Third_Unpaid_User"
      ) {
        templateTypeID = EmailTemplates.UnpaidUser_ThirdMail;
        greaterDay = EmailTemplateList.find(
          (item) =>
            item.reminderNameType === "Account_Deletion_Email_Unpaid_User",
        ).days;
        lessDay = EmailTemplateList.find(
          (item) =>
            item.reminderNameType ===
            "Login_To_Outbooks_Warning_Email_Second_Unpaid_User",
        ).days;
        reminderNameType = Template.reminderNameType;
      } else if (
        Template.reminderNameType === "Account_Deletion_Email_Unpaid_User"
      ) {
        templateTypeID = EmailTemplates.UnpaidUser_DeletionMail;
        greaterDay = null;
        lessDay = EmailTemplateList.find(
          (item) =>
            item.reminderNameType ===
            "Login_To_Outbooks_Warning_Email_Third_Unpaid_User",
        ).days;
        reminderNameType = Template.reminderNameType;
      }
    } else if (listType === "Paid") {
      if (
        Template.reminderNameType ===
        "Login_To_Outbooks_Warning_Email_First_Paid_User"
      ) {
        templateTypeID = EmailTemplates.PaidUser_FirstMail;
        greaterDay = ReminderTemplateList.find(
          (item) =>
            item.reminderNameType ===
            "Login_To_Outbooks_Warning_Email_Second_Paid_User",
        ).days;
        lessDay = null;
        reminderNameType = Template.reminderNameType;
      } else if (
        Template.reminderNameType ===
        "Login_To_Outbooks_Warning_Email_Second_Paid_User"
      ) {
        templateTypeID = EmailTemplates.PaidUser_SecondMail;
        greaterDay = ReminderTemplateList.find(
          (item) =>
            item.reminderNameType ===
            "Login_To_Outbooks_Warning_Email_Third_Paid_User",
        ).days;
        lessDay = ReminderTemplateList.find(
          (item) =>
            item.reminderNameType ===
            "Login_To_Outbooks_Warning_Email_First_Paid_User",
        ).days;
        reminderNameType = Template.reminderNameType;
      } else if (
        Template.reminderNameType ===
        "Login_To_Outbooks_Warning_Email_Third_Paid_User"
      ) {
        templateTypeID = EmailTemplates.PaidUser_ThirdMail;
        greaterDay = null;
        lessDay = ReminderTemplateList.find(
          (item) =>
            item.reminderNameType ===
            "Login_To_Outbooks_Warning_Email_Second_Paid_User",
        ).days;
        reminderNameType = Template.reminderNameType;
      }
    }

    dispatch(
      updateState({
        currentPage: currentPage,
      }),
    );

    setModelRequestData({
      ...modelRequestData,
      Action: "Update",
      lessDay: lessDay,
      greaterDay: greaterDay,
      reminderKeyID: Template.reminderKeyID,
      emailTemplateType: emailTemplateType,
      templateTypeID: templateTypeID,
      reminderTypeID: listType === "Paid" ? 3 : 2,
      listType: listType,
      reminderNameType: reminderNameType,
    });
  };

  const GetApplicationSettingListData = async () => {
    try {
      const data = await GetApplicationSettingList(common.userKeyID);
      if (data?.data?.statusCode === 200) {
        setApplicationStatusLookupList(data.data.responseData.data);
      }
    } catch (error) {}
  };
  const handleClose = () => {
    $("#" + "ConfirmModel").modal("hide");
    setOpenSuccessModal(false);
    setOpenErrorModal(false);
  };
  const UnpaidUserStatus = applicationStatusLookupList.find(
    (item) => item.appSettingType === AppSettingType.UnpaidUser,
  )?.isEnabled;
  const PaidUserStatus = applicationStatusLookupList.find(
    (item) => item.appSettingType === AppSettingType.paidUser,
  )?.isEnabled;

  return (
    <div className="container-fluid account-reminder-redesign">
      <div className="account-reminder-page">
        {/* =====================================================
            PAGE HEADER
            ===================================================== */}
        <div className="account-reminder-page-header">
          <div className="account-reminder-heading-copy">
            <h1>Account Login / Deletion</h1>
            <p>
              Manage reminder schedules and login/deletion warning emails for
              unpaid and paid users.
            </p>
          </div>

          <div className="account-reminder-summary">
            <span className="account-reminder-summary-icon">
              <i className="ri-notification-3-line"></i>
            </span>

            <div>
              <span>Total Reminders</span>
              <strong>
                {(totalUnpaidRecords > 0 ? totalUnpaidRecords : 0) +
                  (totalRecords > 0 ? totalRecords : 0)}
              </strong>
            </div>
          </div>
        </div>

        {/* =====================================================
            UNPAID USER REMINDERS
            ===================================================== */}
        <section className="account-reminder-list-card">
          <div className="account-reminder-section-header">
            <div className="account-reminder-section-title">
              <span className="account-reminder-section-icon">
                <i className="ri-user-unfollow-line"></i>
              </span>

              <div>
                <h2>Unpaid User</h2>
                <p>
                  Configure login warnings and account deletion reminders for
                  unpaid users.
                </p>
              </div>
            </div>

            <Tooltip title={`InActive/Active`}>
              <div className="account-reminder-status-control">
                <span
                  className={`account-reminder-status-pill ${
                    UnpaidUserStatus === 1 ? "is-active" : "is-inactive"
                  }`}
                >
                  {UnpaidUserStatus === 1 ? "Active" : "InActive"}
                </span>

                <FormGroup>
                  <FormControlLabel
                    control={
                      <Android12Switch
                        checked={UnpaidUserStatus === 1}
                        onClick={() =>
                          setModelRequestData({
                            ...modelRequestData,
                            status:
                              UnpaidUserStatus === 1 ? "Active" : "InActive",
                            Action: "UnpaidUser",
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
          </div>

          <div className="account-reminder-table-scroll">
            <table className="account-reminder-table" id="customerTable">
              <thead>
                <tr>
                  <th>Reminder Name</th>
                  <th>Reminder Type</th>
                  <th>Email Template</th>
                  <th>Days</th>
                  <th>Sequence</th>
                  <th>Status</th>
                  <th className="account-reminder-actions-heading">
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
                    <tr key={Template.keyID}>
                      <td>
                        <div className="account-reminder-name-cell">
                          <span className="account-reminder-row-icon">
                            <i className="ri-mail-line"></i>
                          </span>

                          <strong>{Template.reminderName}</strong>
                        </div>
                      </td>

                      <td>
                        <span className="account-reminder-type-text">
                          {Template.reminderNameType?.replace(/_/g, " ")}
                        </span>
                      </td>

                      <td>
                        <span className="account-reminder-template-pill">
                          {Template.templateName}
                        </span>
                      </td>

                      <td>
                        <span className="account-reminder-days-pill">
                          {Template.days}
                        </span>
                      </td>

                      <td>
                        <span className="account-reminder-sequence">
                          {Template.sequenceName}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`account-reminder-row-status ${
                            Template.statusName === "Active"
                              ? "is-active"
                              : "is-inactive"
                          }`}
                        >
                          {Template.statusName}
                        </span>
                      </td>

                      <td className="account-reminder-actions-cell">
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
                              onClick={() =>
                                TemplateEditBtnClicked(
                                  Template,
                                  "Unpaid",
                                  index,
                                )
                              }
                              className="account-reminder-action-btn account-reminder-edit-btn"
                            >
                              <i className="ri-pencil-fill"></i>
                            </button>
                          </Tooltip>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {totalUnpaidRecords <= 0 && (
            <div className="account-reminder-empty-state">
              <NoResultFoundModel
                name={moduleName}
                totalRecords={totalUnpaidRecords}
              />
            </div>
          )}
        </section>

        {/* =====================================================
            PAID USER REMINDERS
            ===================================================== */}
        <section className="account-reminder-list-card">
          <div className="account-reminder-section-header">
            <div className="account-reminder-section-title">
              <span className="account-reminder-section-icon">
                <i className="ri-user-follow-line"></i>
              </span>

              <div>
                <h2>Paid User</h2>
                <p>Configure login warning reminders for active paid users.</p>
              </div>
            </div>

            <Tooltip title={`InActive/Active`}>
              <div className="account-reminder-status-control">
                <span
                  className={`account-reminder-status-pill ${
                    PaidUserStatus === 1 ? "is-active" : "is-inactive"
                  }`}
                >
                  {PaidUserStatus === 1 ? "Active" : "InActive"}
                </span>

                <FormGroup>
                  <FormControlLabel
                    control={
                      <Android12Switch
                        checked={PaidUserStatus === 1}
                        onClick={() =>
                          setModelRequestData({
                            ...modelRequestData,
                            status:
                              PaidUserStatus === 1 ? "Active" : "InActive",
                            Action: "PaidUser",
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
          </div>

          <div className="account-reminder-table-scroll">
            <table className="account-reminder-table" id="customerTablePaid">
              <thead>
                <tr>
                  <th>Reminder Name</th>
                  <th>Reminder Type</th>
                  <th>Email Template</th>
                  <th>Days</th>
                  <th>Sequence</th>
                  <th>Status</th>
                  <th className="account-reminder-actions-heading">
                    {((userAccessData.Admin_Config_Email_Template_CanEdit &&
                      common.organisationKeyID !== null) ||
                      (userAccessData.SuperAdmin_Config_Email_Template_CanAdd &&
                        common.organisationKeyID === null)) && <>Action</>}
                  </th>
                </tr>
              </thead>

              <tbody>
                {ReminderTemplateList.map((Template, index) => {
                  return (
                    <tr key={Template.keyID}>
                      <td>
                        <div className="account-reminder-name-cell">
                          <span className="account-reminder-row-icon">
                            <i className="ri-mail-line"></i>
                          </span>

                          <strong>{Template.reminderName}</strong>
                        </div>
                      </td>

                      <td>
                        <span className="account-reminder-type-text">
                          {Template.reminderNameType?.replace(/_/g, " ")}
                        </span>
                      </td>

                      <td>
                        <span className="account-reminder-template-pill">
                          {Template.templateName}
                        </span>
                      </td>

                      <td>
                        <span className="account-reminder-days-pill">
                          {Template.days}
                        </span>
                      </td>

                      <td>
                        <span className="account-reminder-sequence">
                          {Template.sequenceName}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`account-reminder-row-status ${
                            Template.statusName === "Active"
                              ? "is-active"
                              : "is-inactive"
                          }`}
                        >
                          {Template.statusName}
                        </span>
                      </td>

                      <td className="account-reminder-actions-cell">
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
                              onClick={() =>
                                TemplateEditBtnClicked(Template, "Paid", index)
                              }
                              className="account-reminder-action-btn account-reminder-edit-btn"
                            >
                              <i className="ri-pencil-fill"></i>
                            </button>
                          </Tooltip>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {totalRecords <= 0 && (
            <div className="account-reminder-empty-state">
              <NoResultFoundModel
                name={moduleName}
                totalRecords={totalRecords}
              />
            </div>
          )}
        </section>

        {/* EXISTING MODALS */}
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

        <SuccessModal
          handleClose={handleClose}
          setOpenSuccessModal={setOpenSuccessModal}
          openSuccessModal={openSuccessModal}
          modelAction={modelRequestData.Action}
          message={"Status has been changed successfully!"}
        />
      </div>

      <div className="account-reminder-footer-wrap">
        <Footer />
      </div>
    </div>
  );
}

export default AccountDeletionReminder;
