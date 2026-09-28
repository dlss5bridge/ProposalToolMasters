/* global $ */
import React, { useContext, useEffect, useState } from "react";
// import "./EmailTemplate.css";
import "../../configure/email_template/EmailTemplate.css";
import "./SuperAdminEmailTemplateList-redesign.css";
import { useNavigate } from "react-router";
import CommonButtonComponent from "../../../components/CommonButtonComponent";
import ConfirmModel from "../../../components/ConfirmationBox";
import PaginationComponent from "../../../components/PaginationModel";
import Android12Switch from "../../../components/AndroidSwitch";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import { AuthContextProvider } from "../../../AuthContext/AuthContext";
import { useDispatch, useSelector } from "react-redux";
import Tooltip, { tooltipClasses } from "@mui/material/Tooltip";
import NoResultFoundModel from "../../../components/NoResultFoundModel";
import SuccessModal from "../../../components/SuccessModal";
import ErrorModel from "../../../components/ErrorModel";
import Footer from "../../../components/Footer";
import { updateState } from "../../../redux/Persist";
import RecordsAvailablePopupModel from "../../../components/RecordsAvailablePopupModel";
import {
  EmailTemplatesDelete,
  GetEmailTemplatesList,
  EmailTemplatesChangeStatus,
  GetChangeIsDefaultStatus,
} from "../../../redux/Services/Config/SuperEmailTemplateApi";

function SuperAdminEmailTemplateList() {
  const moduleName = "Super Admin Email Template";
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
      navigate("/super-admin-email-template-model", {
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
  ) => {
    setLoader(true);
    const pageNoList = i - 1;
    if (pageSize === 0) {
      return;
    }
    try {
      const data = await GetEmailTemplatesList({
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
          const Data = await EmailTemplatesChangeStatus(
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
        const Data = await EmailTemplatesDelete(
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
    navigate("/super-admin-email-template-model", {
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

  //Design part :
  return (
    <div className="container-fluid super-email-template-list-redesign">
      <div className="setl-page">
        {/* ---------- Page header ---------- */}
        <div className="setl-page-header">
          <div className="setl-page-heading">
            <h1 className="setl-page-title">{moduleName}</h1>
            <p className="setl-page-subtitle">
              Manage email templates, their type, default selection and status.
            </p>
          </div>

          <div className="setl-page-actions">
            <div className="d-flex justify-content-sm-end add-new-btn">
              {userAccessData.SuperAdmin_Setting_Email_Template_CanAdd && (
                <CommonButtonComponent
                  title={getCrudButtonToolTipName("Add", moduleName)}
                  name={getCrudButtonTextName("Add", moduleName)}
                  AddBtn={() => TemplateAddBtnClicked()}
                />
              )}
            </div>
          </div>
        </div>

        {/* ---------- List card ---------- */}
        <section className="setl-list-card" id="customerList">
          <div className="setl-toolbar">
            <div className="setl-search-box">
              <i className="ri-search-line setl-search-icon"></i>
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => {
                  handleSearch(e);
                }}
                className="setl-search-input"
                placeholder={
                  isMobile
                    ? "Search"
                    : getPlaceholderTextName("Search", moduleName)
                }
              />
            </div>

            {totalRecords > 0 && (
              <div className="setl-toolbar-meta">
                Showing <strong>{totalRecords}</strong> of{" "}
                <strong>{listCount}</strong>
              </div>
            )}
          </div>

          <div className="setl-table-scroll">
            <table className="setl-table" id="customerTable">
              <thead>
                <tr>
                  <td className="setl-th" style={{ width: "35%" }}>
                    <span className="setl-th-inner">
                      <span className="setl-th-label">Name</span>
                      {primarySortDirectionObj.templateNameSort === "desc" && (
                        <i
                          onClick={() => {
                            setSortType("TemplateName");
                            handleSort("asc", "TemplateName");
                          }}
                          className="fas fa-sort-alpha-up setl-sort-icon"
                        ></i>
                      )}
                      {(primarySortDirectionObj.templateNameSort === null ||
                        primarySortDirectionObj.templateNameSort === "asc") && (
                        <i
                          onClick={() => {
                            setSortType("TemplateName");
                            handleSort(
                              primarySortDirectionObj.templateNameSort === null
                                ? "asc"
                                : "desc",
                              "TemplateName",
                            );
                          }}
                          className="fas fa-sort-alpha-down setl-sort-icon"
                        ></i>
                      )}
                    </span>
                  </td>

                  <td className="setl-th">
                    <span className="setl-th-inner">
                      <span className="setl-th-label">Template Type</span>
                      {primarySortDirectionObj.TemplateTypeSort === "desc" && (
                        <i
                          onClick={() => {
                            setSortType("TemplateType");
                            handleSort("asc", "TemplateType");
                          }}
                          className="fas fa-sort-alpha-up setl-sort-icon"
                        ></i>
                      )}
                      {(primarySortDirectionObj.TemplateTypeSort === null ||
                        primarySortDirectionObj.TemplateTypeSort === "asc") && (
                        <i
                          onClick={() => {
                            setSortType("TemplateType");
                            handleSort(
                              primarySortDirectionObj.TemplateTypeSort === null
                                ? "asc"
                                : "desc",
                              "TemplateType",
                            );
                          }}
                          className="fas fa-sort-alpha-down setl-sort-icon"
                        ></i>
                      )}
                    </span>
                  </td>

                  <td className="setl-th">
                    <span className="setl-th-label">Is Default</span>
                  </td>

                  <td className="setl-th">
                    <span className="setl-th-label">Status</span>
                  </td>

                  <td className="setl-th setl-th-action setl-actions-heading">
                    {(userAccessData.SuperAdmin_Setting_Email_Template_CanDelete ||
                      userAccessData.SuperAdmin_Setting_Email_Template_CanEdit) && (
                      <span className="setl-th-label"> Action</span>
                    )}
                  </td>
                </tr>
              </thead>

              <tbody className="list form-check-all">
                {EmailTemplateList.slice(
                  0,
                  isMobile ? isMobileRecords : desktopRecords,
                ).map((Template) => {
                  return (
                    <tr className="setl-row" key={Template?.templateKeyID}>
                      <td className="setl-td setl-td-name">
                        <div className="setl-name-cell">
                          <span className="setl-name-icon">
                            <i className="ri-mail-line"></i>
                          </span>
                          <span className="setl-name-text">
                            {isMobile ? (
                              <>
                                {Template.templateName.length > 20
                                  ? Template.templateName.substring(0, 20) +
                                    "..."
                                  : Template.templateName}
                              </>
                            ) : (
                              <>
                                {Template.templateName.length > 50 ? (
                                  <Tooltip title={Template.templateName}>
                                    {Template.templateName.substring(0, 50) +
                                      "..."}
                                  </Tooltip>
                                ) : (
                                  <>{Template.templateName}</>
                                )}
                              </>
                            )}
                          </span>
                        </div>
                      </td>

                      <td className="setl-td">
                        <span className="setl-type-text">
                          {Template.templateType}
                        </span>
                      </td>

                      <td className="setl-td Switch setl-switch-cell">
                        <div className="setl-switch-wrap">
                          <span
                            className={
                              Template.isDefaultName === "Yes"
                                ? "setl-pill setl-pill-purple"
                                : "setl-pill setl-pill-default"
                            }
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

                      <td className="setl-td Switch setl-switch-cell">
                        <div className="setl-switch-wrap">
                          <span
                            className={
                              Template.statusName === "Active"
                                ? "setl-pill setl-pill-active"
                                : "setl-pill setl-pill-inactive"
                            }
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

                      <td className="setl-td setl-td-action setl-actions-cell">
                        <div className="setl-actions">
                          {userAccessData.SuperAdmin_Setting_Email_Template_CanEdit && (
                            <Tooltip
                              title={getCrudButtonToolTipName(
                                "Update",
                                moduleName,
                              )}
                            >
                              <div className="edit">
                                <button
                                  onClick={() =>
                                    TemplateEditBtnClicked(Template)
                                  }
                                  className="setl-action-btn setl-edit-btn"
                                >
                                  <i className="ri-pencil-fill"></i>
                                </button>
                              </div>
                            </Tooltip>
                          )}
                          {userAccessData.SuperAdmin_Setting_Email_Template_CanDelete && (
                            <Tooltip
                              title={getCrudButtonToolTipName(
                                "Delete",
                                moduleName,
                              )}
                            >
                              <div className="remove">
                                <button
                                  onClick={() =>
                                    setModelRequestData({
                                      ...modelRequestData,
                                      templateKeyID: Template?.templateKeyID,
                                      templateName: Template.templateName,
                                      userKeyID: common.userKeyID,
                                      Action: "Delete",
                                    })
                                  }
                                  className="setl-action-btn setl-delete-btn"
                                  data-bs-toggle="modal"
                                  data-bs-target="#ConfirmModel"
                                >
                                  <i className="ri-delete-bin-5-fill"></i>
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
          </div>

          {totalRecords <= 0 && (
            <div className="setl-empty">
              <NoResultFoundModel
                name="Email Templates"
                totalRecords={totalRecords}
              />
            </div>
          )}
        </section>

        {/* ---------- Pagination (outside the list card) ---------- */}
        {listCount > pageSize && (
          <div className="setl-pagination">
            <PaginationComponent
              totalCount={listCount}
              totalPages={totalPage}
              currentPage={currentPage}
              onPageChange={handlePageChange}
            />
          </div>
        )}

        {/* ---------- Shared modals (unchanged) ---------- */}
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
          message={`${
            modelRequestData.Action === "Delete"
              ? `${moduleName} ${modelRequestData.templateName}`
              : "Status has been changed successfully!"
          }`}
        />
      </div>

      {/* end back-to-top */}
      <div className="setl-footer-wrap">
        <Footer />
      </div>
    </div>
  );
}

export default SuperAdminEmailTemplateList;
