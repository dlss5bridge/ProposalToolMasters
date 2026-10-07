/* global $ */
import React, { useContext, useEffect, useState } from "react";
// import "./EmailTemplate.css";
// import "../email_template/EmailTemplate.css";

import { useNavigate } from "react-router";
import CommonButtonComponent from "../../../../components/CommonButtonComponent";
import FilterModel from "../../../../components/FilterModel";
import ConfirmModel from "../../../../components/ConfirmationBox";

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
import "./SuperAdminReminderTemplateList-redesign.css";

import {
  ReminderTemplatesDelete,
  GetReminderTemplatesList,
  ReminderTemplatesChangeStatus,
  GetChangeIsDefaultStatus,
} from "../../../../redux/Services/Setting/SuperAdminTemplateApi";
import { Funnel } from "lucide-react";

function SuperAdminReminderTemplateList() {
  const moduleName = "Super Admin Workflow Email Template";
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
    handleErrorMessage,
  } = useContext(AuthContextProvider);
  const [EmailTemplateList, setEmailTemplateList] = useState([]);
  const [totalRecords, setTotalRecords] = useState(-1);
  const [errorMessage, setErrorMessage] = useState("");
  const [isAddUpdateActionDone, setIsAddUpdateActionDone] = useState(false);
  const [openSuccessModal, setOpenSuccessModal] = React.useState(false);
  const [currentPage, setCurrentPage] = useState(
    common.currentPage === "" ? 1 : common.currentPage,
  );
  const formattedErrorMessage = handleErrorMessage(errorMessage);
  const [isFilterApply, setIsFilterApply] = useState(false);
  const [TemplateType, setTemplateType] = useState(null);

  const [sortType, setSortType] = useState(null);
  const [primarySortDirection, setPrimarySortDirection] = useState(null);
  const [primarySortDirectionObj, setPrimarySortDirectionObj] = useState({
    templateNameSort: null,
    TemplateTypeSort: null,
    BusinessType: null,
    ProspectBusinessType: null,
  });
  const [searchKeyword, setSearchKeyword] = useState("");
  const [openErrorModal, setOpenErrorModal] = useState(false);
  const [modelRequestData, setModelRequestData] = useState({
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
      modelRequestData.templateKeyID !== null
    ) {
      setTopbar("none");
      navigate("/add-update-super-admin-reminder-template", {
        state: modelRequestData,
      });
    } else {
      GetEmailTemplatesListData(isCurrentPage);
    }
  }, [modelRequestData.TemplateID]);

  // C] Calling All Api's like List and other Here :
  // 1) Get Service Category List Data
  const GetEmailTemplatesListData = async (
    i,
    searchKeywordValue,
    sortValue,
    TemplateSort,
    templateTypeID,
  ) => {
    setLoader(true);
    const pageNoList = i - 1;
    if (pageSize === 0) {
      return;
    }
    try {
      const data = await GetReminderTemplatesList({
        pageSize: pageSize,
        pageNo: pageNoList,
        userKeyID: common.userKeyID,
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

  // Update Function Modal
  // 2) On Click Template Status Button
  const EmailTemplatesChangeStatusDataAndDeleteData = async () => {
    setLoader(true);
    if (modelRequestData.Action === "Status") {
      if (modelRequestData.StatusType === null) {
        try {
          const Data = await ReminderTemplatesChangeStatus(
            common.userKeyID,
            modelRequestData.templateKeyID,
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
      } else if (modelRequestData.StatusType === "IsDefault") {
        try {
          const Data = await GetChangeIsDefaultStatus(
            common.userKeyID,
            modelRequestData.templateKeyID,
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
          modelRequestData.userKeyID,
          modelRequestData.templateKeyID,
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

  //E] Update Function Modal
  // 1) On Click Service Category Add Button
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
    navigate("/add-update-super-admin-reminder-template", {
      state: addEmailTemplateRequestData,
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
      TemplateID: Template.templateID,
      templateKeyID: Template?.templateKeyID,
    });
  };

  // F] Pagination :
  const handlePageChange = async (pageNumber) => {
    setCurrentPage(pageNumber);
    await GetEmailTemplatesListData(pageNumber); // Call your function with the selected page number
  };

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
    }
  };
  // Handle Search
  const handleSearch = (e) => {
    const searchKeywordValue = e.target.value;
    setSearchKeyword(searchKeywordValue);
    setCurrentPage(1);
    GetEmailTemplatesListData(isCurrentPage, searchKeywordValue);
  };

  // Handle Close
  const handleClose = () => {
    $("#" + "ConfirmModel").modal("hide");
    $("#" + "RecordsAvailablePopupModel").modal("hide");
    setOpenSuccessModal(false);
    setOpenErrorModal(false);
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
  return (
    <div className="container-fluid superadmin-reminder-template-redesign">
      <div className="superadmin-reminder-template-page">
        {/* =====================================================
            PAGE HEADER
            ===================================================== */}
        <div className="superadmin-reminder-template-page-header">
          <div className="superadmin-reminder-template-heading-copy">
            <h1>Workflow Email Templates</h1>
            <p>
              Manage super admin workflow email templates, default templates,
              and template availability.
            </p>
          </div>

          {userAccessData.SuperAdmin_Setting_Email_Template_CanAdd && (
            <div className="superadmin-reminder-template-header-action">
              <CommonButtonComponent
                title={getCrudButtonToolTipName("Add", moduleName)}
                name={getCrudButtonTextName("Add", moduleName)}
                AddBtn={() => TemplateAddBtnClicked()}
              />
            </div>
          )}
        </div>

        {/* =====================================================
            LIST CARD
            ===================================================== */}
        <section className="superadmin-reminder-template-list-card">
          {/* TOOLBAR */}
          <div className="superadmin-reminder-template-toolbar">
            <div className="superadmin-reminder-template-toolbar-left">
              <div className="superadmin-reminder-template-search-wrap">
                <i className="ri-search-line"></i>

                <input
                  type="text"
                  value={searchKeyword}
                  onChange={(e) => {
                    handleSearch(e);
                  }}
                  className="form-control superadmin-reminder-template-search-input"
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
                  className={`superadmin-reminder-template-filter-btn ${
                    isFilterApply ? "is-active" : ""
                  }`}
                  data-bs-toggle="modal"
                  data-bs-target="#FilterModel"
                >
                  <Funnel size={17} strokeWidth={1.9} className="app-filter-icon" />
                  <span>Filter</span>

                  {isFilterApply && (
                    <span className="superadmin-reminder-template-filter-dot"></span>
                  )}
                </button>
              </Tooltip>

              {isFilterApply && (
                <Tooltip title={"Clear Filter"}>
                  <button
                    type="button"
                    className="superadmin-reminder-template-clear-filter-btn"
                    onClick={ClearFilter}
                  >
                    <i className="ri-close-line"></i>
                    <span>Clear Filter</span>
                  </button>
                </Tooltip>
              )}
            </div>

            <div className="superadmin-reminder-template-count">
              {/* <span className="superadmin-reminder-template-count-icon">
                <i className="ri-mail-settings-line"></i>
              </span> */}

                <span>Total Templates</span>
                <strong>{listCount > 0 ? listCount : 0}</strong>
            </div>
          </div>

          {/* TABLE */}
          <div className="superadmin-reminder-template-table-scroll">
            <table
              className="superadmin-reminder-template-table"
              id="customerTable"
            >
              <thead>
                <tr>
                  <th>
                    <button
                      type="button"
                      className="superadmin-reminder-template-sort-btn"
                      onClick={() => {
                        setSortType("TemplateName");
                        handleSort(
                          primarySortDirectionObj.templateNameSort === null
                            ? "asc"
                            : primarySortDirectionObj.templateNameSort === "asc"
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
                            ? "fas fa-sort-alpha-up"
                            : "fas fa-sort-alpha-down"
                        }
                      ></i>
                    </button>
                  </th>

                  <th>
                    <button
                      type="button"
                      className="superadmin-reminder-template-sort-btn"
                      onClick={() => {
                        setSortType("TemplateType");
                        handleSort(
                          primarySortDirectionObj.TemplateTypeSort === null
                            ? "asc"
                            : primarySortDirectionObj.TemplateTypeSort === "asc"
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
                            ? "fas fa-sort-alpha-up"
                            : "fas fa-sort-alpha-down"
                        }
                      ></i>
                    </button>
                  </th>

                  <th>Is Default</th>
                  <th>Status</th>

                  <th className="superadmin-reminder-template-actions-heading">
                    {(userAccessData.SuperAdmin_Setting_Email_Template_CanDelete ||
                      userAccessData.SuperAdmin_Setting_Email_Template_CanEdit) && (
                      <>Actions</>
                    )}
                  </th>
                </tr>
              </thead>

              <tbody>
                {EmailTemplateList.slice(
                  0,
                  isMobile ? isMobileRecords : desktopRecords,
                ).map((Template, index) => {
                  return (
                    <tr key={Template.templateKeyID || index}>
                      {/* TEMPLATE NAME */}
                      <td>
                        <div className="superadmin-reminder-template-name-cell">
                          {/* <span className="superadmin-reminder-template-name-icon">
                            <i className="ri-mail-line"></i>
                          </span> */}

                          <div className="superadmin-reminder-template-name-copy">
                            {isMobile ? (
                              <strong>
                                {Template.templateName.length > 20
                                  ? Template.templateName.substring(0, 20) +
                                    "..."
                                  : Template.templateName}
                              </strong>
                            ) : (
                              <>
                                {Template.templateName.length > 50 ? (
                                  <Tooltip title={Template.templateName}>
                                    <strong>
                                      {Template.templateName.substring(0, 50) +
                                        "..."}
                                    </strong>
                                  </Tooltip>
                                ) : (
                                  <strong>{Template.templateName}</strong>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* TEMPLATE TYPE */}
                      <td>
                        <span className="superadmin-reminder-template-type-pill">
                          {Template.templateType}
                        </span>
                      </td>

                      {/* IS DEFAULT */}
                      <td>
                        <div className="superadmin-reminder-template-state-cell">
                          <span
                            className={`superadmin-reminder-template-state-pill ${
                              Template.isDefaultName === "Yes"
                                ? "is-positive"
                                : "is-neutral"
                            }`}
                          >
                            {Template.isDefaultName}
                          </span>

                          {userAccessData.SuperAdmin_Setting_Email_Template_CanDelete && (
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
                                          status: Template.isDefaultName,
                                          templateKeyID:
                                            Template?.templateKeyID,
                                          userKeyID: common.userKeyID,
                                          isDefault:
                                            Template.isDefaultName === "Yes"
                                              ? false
                                              : true,
                                          StatusType: "IsDefault",
                                          Action: "Status",
                                        })
                                      }
                                      checked={Template.isDefaultName === "Yes"}
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

                      {/* STATUS */}
                      <td>
                        <div className="superadmin-reminder-template-state-cell">
                          <span
                            className={`superadmin-reminder-template-status-pill ${
                              Template.statusName === "Active"
                                ? "is-active"
                                : "is-inactive"
                            }`}
                          >
                            {Template.statusName}
                          </span>

                          {userAccessData.SuperAdmin_Setting_Email_Template_CanDelete && (
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
                                          status: Template.statusName,
                                          templateKeyID:
                                            Template?.templateKeyID,
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
                      <td className="superadmin-reminder-template-actions-cell">
                        <div className="superadmin-reminder-template-row-actions">
                          {userAccessData.SuperAdmin_Setting_Email_Template_CanEdit && (
                            <Tooltip
                              title={getCrudButtonToolTipName(
                                "Update",
                                moduleName,
                              )}
                            >
                              <button
                                type="button"
                                onClick={() => TemplateEditBtnClicked(Template)}
                                className="superadmin-reminder-template-action-btn superadmin-reminder-template-edit-btn"
                              >
                                <i className="ri-pencil-fill"></i>
                              </button>
                            </Tooltip>
                          )}

                          {userAccessData.SuperAdmin_Setting_Email_Template_CanDelete && (
                            <Tooltip
                              title={getCrudButtonToolTipName(
                                "Delete",
                                moduleName,
                              )}
                            >
                              <button
                                type="button"
                                onClick={() =>
                                  setModelRequestData({
                                    ...modelRequestData,
                                    templateKeyID: Template?.templateKeyID,
                                    templateName: Template.templateName,
                                    userKeyID: common.userKeyID,
                                    Action: "Delete",
                                  })
                                }
                                className="superadmin-reminder-template-action-btn superadmin-reminder-template-delete-btn"
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
            <div className="superadmin-reminder-template-empty-state">
              <NoResultFoundModel
                name="Email Templates"
                totalRecords={totalRecords}
              />
            </div>
          )}
        </section>

        {/* PAGINATION OUTSIDE LIST */}
        {listCount > pageSize && (
          <div className="superadmin-reminder-template-pagination">
            <PaginationComponent
              totalCount={listCount}
              totalPages={totalPage}
              currentPage={currentPage}
              onPageChange={handlePageChange}
            />
          </div>
        )}

        {/* =====================================================
            EXISTING MODALS
            ===================================================== */}
        <ErrorModel
          ErrorModel={openErrorModal}
          handleClose={handleClose}
          ErrorMessage={formattedErrorMessage}
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
              ? moduleName + " " + modelRequestData.templateName
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
          TemplateType={TemplateType}
          setTemplateType={setTemplateType}
        />
      </div>

      <div className="superadmin-reminder-template-footer-wrap">
        <Footer />
      </div>
    </div>
  );
}

export default SuperAdminReminderTemplateList;
