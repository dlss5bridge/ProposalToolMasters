/* global $ */
import React, { useContext, useEffect, useState } from "react";
import "./EmailTemplate.css";
import "./EmailTemplate-redesign.css";
import { useNavigate } from "react-router";
import CommonButtonComponent from "../../../components/CommonButtonComponent";
import ConfirmModel from "../../../components/ConfirmationBox";
import {
  EmailTemplatesDelete,
  GetEmailTemplatesList,
  EmailTemplatesChangeStatus,
  GetChangeIsDefaultStatus,
  GetEmailTemplatesModel,
  CopyEmail,
} from "../../../redux/Services/Config/EmailTemplateApi";
import PaginationComponent from "../../../components/PaginationModel";
import Android12Switch from "../../../components/AndroidSwitch";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import { AuthContextProvider } from "../../../AuthContext/AuthContext";
import { useDispatch, useSelector } from "react-redux";
import Tooltip from "@mui/material/Tooltip";
import NoResultFoundModel from "../../../components/NoResultFoundModel";
import SuccessModal from "../../../components/SuccessModal";
import ErrorModel from "../../../components/ErrorModel";
import Footer from "../../../components/Footer";
import { updateState } from "../../../redux/Persist";
import RecordsAvailablePopupModel from "../../../components/RecordsAvailablePopupModel";

function EmailTemplate() {
  const moduleName = "Email Template";
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
    handleErrorMessage,
  } = useContext(AuthContextProvider);
  const [EmailTemplateList, setEmailTemplateList] = useState([]);

  const [errorMessage, setErrorMessage] = useState("");
  const [isAddUpdateActionDone, setIsAddUpdateActionDone] = useState(false);
  const [openSuccessModal, setOpenSuccessModal] = React.useState(false);
  const [currentPage, setCurrentPage] = useState(
    common.currentPage === "" ? 1 : common.currentPage,
  );
  const formattedErrorMessage = handleErrorMessage(errorMessage);
  const [totalRecords, setTotalRecords] = useState(-1);
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
      modelRequestData.TemplateID !== null &&
      modelRequestData.templateKeyID !== null
    ) {
      setTopbar("none");
      navigate("/add-email-template", { state: modelRequestData });
    } else {
      GetEmailTemplatesListData(isCurrentPage);
    }
  }, [modelRequestData.TemplateID]);

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
      const data = await GetEmailTemplatesList({
        pageSize: pageSize,
        pageNo: pageNoList,
        organisationID: common.organisationID,
        organisationKeyID: common.organisationKeyID,
        searchKeyword:
          searchKeywordValue === undefined ? searchKeyword : searchKeywordValue,
        primarySortDirection:
          sortValue === undefined ? primarySortDirection : sortValue,
        PrimarySortColumnName: sortType == "" ? TemplateSort : sortType,
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
            setEmailTemplateList(TemplateListData);
            setTotalRecords(TemplateListData.length);
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
          const Data = await EmailTemplatesChangeStatus(
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
                  Data?.data?.responseData.templateExistsInModule.map(
                    (item) => item.serviceName,
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
        const Data = await EmailTemplatesDelete(
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
                  .join(", ");
              const servicePackageNames =
                Data?.data?.responseData.templateExistsInModule.map(
                  (item) => item.serviceName,
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
  // Copy Email Template Data
  const CopyEmailTemplateData = async () => {
    if (!common.userKeyID) return;
    try {
      setLoader(true);
      const data = await CopyEmail(
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
    navigate("/add-email-template", { state: addEmailTemplateRequestData });
  };
  // 2) On Click Template Edit Button
  const TemplateEditBtnClicked = async (Template, type) => {
    if (type === "editPredefined") {
      setLoader(true);
      const data = await GetEmailTemplatesModel(Template.templateKeyID, true);
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

  return (
    <>
      <div className="email-template-redesign">
        <div className="email-template-page">
          {/* =========================
              PAGE HEADER
              ========================= */}
          <div className="email-template-page-header">
            <div className="email-template-page-heading">
              <h1 className="email-template-page-title">Email Templates</h1>
              <p className="email-template-page-subtitle">
                Manage reusable email templates.
              </p>
            </div>

            {canAdd && (
              <div className="email-template-page-action">
                <CommonButtonComponent
                  title={getCrudButtonToolTipName("Add", moduleName)}
                  name={getCrudButtonTextName("Add", moduleName)}
                  AddBtn={TemplateAddBtnClicked}
                />
              </div>
            )}
          </div>

          {/* =========================
              LIST CARD
              ========================= */}
          <section className="email-template-list-card">
            {/* Toolbar is intentionally outside the scrollable table area */}
            <div className="email-template-toolbar">
              <div className="email-template-search-wrap">
                <i className="ri-search-line email-template-search-icon"></i>

                <input
                  type="text"
                  value={searchKeyword}
                  onChange={handleSearch}
                  className="email-template-search-input"
                  placeholder={
                    isMobile
                      ? "Search"
                      : getPlaceholderTextName("Search", moduleName)
                  }
                />
              </div>
            </div>

            {/* Only table content can scroll horizontally */}
            <div className="email-template-table-scroll">
              <table
                className={`email-template-table ${
                  !showProfessionType
                    ? "email-template-table--no-profession"
                    : ""
                }`}
                id="customerTable"
              >
                <thead>
                  <tr>
                    <th>
                      <button
                        type="button"
                        className="email-template-sort-button"
                        onClick={() => {
                          setSortType("TemplateName");
                          handleSort(
                            primarySortDirectionObj.templateNameSort === null
                              ? "asc"
                              : primarySortDirectionObj.templateNameSort ===
                                  "asc"
                                ? "desc"
                                : "asc",
                            "TemplateName",
                          );
                        }}
                      >
                        <span>Name</span>
                        <i
                          className={
                            primarySortDirectionObj.templateNameSort === "desc"
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
                          className="email-template-sort-button"
                          onClick={() => {
                            setSortType("ProfessionType");
                            handleSort(
                              primarySortDirectionObj.ProfessionType === null
                                ? "asc"
                                : primarySortDirectionObj.ProfessionType ===
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
                              primarySortDirectionObj.ProfessionType === "desc"
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
                        className="email-template-sort-button"
                        onClick={() => {
                          setSortType("TemplateType");
                          handleSort(
                            primarySortDirectionObj.TemplateTypeSort === null
                              ? "asc"
                              : primarySortDirectionObj.TemplateTypeSort ===
                                  "asc"
                                ? "desc"
                                : "asc",
                            "TemplateType",
                          );
                        }}
                      >
                        <span>Template Type</span>
                        <i
                          className={
                            primarySortDirectionObj.TemplateTypeSort === "desc"
                              ? "ri-arrow-up-line"
                              : "ri-arrow-down-line"
                          }
                        ></i>
                      </button>
                    </th>

                    <th>Is Default</th>
                    <th>Status</th>
                    <th className="email-template-actions-heading">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {EmailTemplateList.slice(
                    0,
                    isMobile ? isMobileRecords : desktopRecords,
                  ).map((Template) => {
                    const templateName =
                      Template.templateName?.replace(/\b\w/g, (l) =>
                        l.toUpperCase(),
                      ) || "-";

                    return (
                      <tr
                        className="email-template-row"
                        key={Template.templateKeyID || Template.templateName}
                      >
                        <td>
                          <div className="email-template-name-cell">
                            {/* <span className="email-template-name-icon">
                              <i className="ri-mail-line"></i>
                            </span> */}

                            <div className="email-template-name-content">
                              <div className="email-template-name-line">
                                {Template.notifySAChanges !== null &&
                                  common.organisationKeyID !== null && (
                                    <Tooltip title="View System Administrator Changes">
                                      <button
                                        type="button"
                                        className="email-template-notification-button"
                                        onClick={() =>
                                          TemplateEditBtnClicked(
                                            Template,
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
                                    templateName.length > 50
                                      ? Template.templateName
                                      : ""
                                  }
                                >
                                  <span className="email-template-name">
                                    {isMobile && templateName.length > 22
                                      ? `${templateName.substring(0, 22)}...`
                                      : !isMobile && templateName.length > 50
                                        ? `${templateName.substring(0, 50)}...`
                                        : templateName}
                                  </span>
                                </Tooltip>
                              </div>
                            </div>
                          </div>
                        </td>

                        {showProfessionType && (
                          <td>
                            <span
                              className="email-template-profession-chip"
                              title={Template.professionTypeNames}
                            >
                              {Template.professionTypeNames || "-"}
                            </span>
                          </td>
                        )}

                        <td>
                          <span className="email-template-type-badge">
                            {replaceNames(
                              Template.templateType,
                              EngagementName,
                              proposalName,
                            ) || "-"}
                          </span>
                        </td>

                        <td>
                          <div className="email-template-status-control">
                            <span
                              className={`email-template-default-badge ${
                                Template.isDefaultName === "Yes"
                                  ? "is-default"
                                  : "is-not-default"
                              }`}
                            >
                              {Template.isDefaultName || "-"}
                            </span>

                            {canDelete && (
                              <Tooltip
                                title={getCrudButtonToolTipName(
                                  "Change Is Default",
                                )}
                              >
                                <FormGroup>
                                  <FormControlLabel
                                    className="email-template-switch-label"
                                    control={
                                      <Android12Switch
                                        onClick={() =>
                                          setModelRequestData({
                                            ...modelRequestData,
                                            professionTypeNames:
                                              Template.professionTypeNames,
                                            BusinessTypeName:
                                              Template.orgBusinessType,
                                            status: Template.isDefaultName,
                                            templateKeyID:
                                              Template.templateKeyID,
                                            isDefault:
                                              Template.isDefaultName === "Yes"
                                                ? false
                                                : true,
                                            StatusType: "IsDefault",
                                            Action: "Status",
                                          })
                                        }
                                        checked={
                                          Template.isDefaultName === "Yes"
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

                        <td>
                          <div className="email-template-status-control">
                            <span
                              className={`email-template-status-badge ${
                                Template.statusName === "Active"
                                  ? "is-active"
                                  : "is-inactive"
                              }`}
                            >
                              {Template.statusName || "-"}
                            </span>

                            {canDelete && (
                              <Tooltip
                                title={getCrudButtonToolTipName(
                                  "Change Status",
                                )}
                              >
                                <FormGroup>
                                  <FormControlLabel
                                    className="email-template-switch-label"
                                    control={
                                      <Android12Switch
                                        onClick={() =>
                                          setModelRequestData({
                                            ...modelRequestData,
                                            professionTypeNames:
                                              Template.professionTypeNames,
                                            BusinessTypeName:
                                              Template.orgBusinessType,
                                            status: Template.statusName,
                                            templateKeyID:
                                              Template.templateKeyID,
                                            userKeyID: common.userKeyID,
                                            StatusType: null,
                                            Action: "Status",
                                          })
                                        }
                                        checked={
                                          Template.statusName === "Active"
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

                        <td className="email-template-actions-cell">
                          <div className="email-template-row-actions">
                            {/* Copy stays unconditional, exactly like the original */}
                            <Tooltip
                              title={getCrudButtonToolTipName(
                                "Copy",
                                moduleName,
                              )}
                            >
                              <button
                                type="button"
                                className="email-template-action-button email-template-action-button--copy"
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
                                  className="email-template-action-button email-template-action-button--edit"
                                  onClick={() =>
                                    TemplateEditBtnClicked(Template)
                                  }
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
                                  className="email-template-action-button email-template-action-button--delete"
                                  onClick={() =>
                                    setModelRequestData({
                                      ...modelRequestData,
                                      templateKeyID: Template.templateKeyID,
                                      templateName: Template.templateName,
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
            </div>

            {totalRecords <= 0 && (
              <div className="email-template-empty-state">
                <NoResultFoundModel
                  name={moduleName}
                  totalRecords={totalRecords}
                />
              </div>
            )}

            {listCount > pageSize && (
              <div className="email-template-pagination">
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

        {/* Existing functional modals */}
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
              ? EmailTemplatesChangeStatusDataAndDeleteData
              : CopyEmailTemplateData
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

        <div className="email-template-footer-wrap">
          <Footer />
        </div>
      </div>
    </>
  );
}

export default EmailTemplate;
