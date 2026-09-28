/* global $ */
import React, { useContext, useEffect, useState } from "react";
import "./termAndCondition.css";
import "./termAndCondition-redesign.css";
import { useNavigate } from "react-router";
import CommonButtonComponent from "../../../components/CommonButtonComponent";
import ConfirmModel from "../../../components/ConfirmationBox";
import {
  TermsAndConditionsDelete,
  GetTermsAndConditionsList,
  TermsAndConditionsChangeStatus,
  GetChangeIsDefaultStatus,
  GetTermsAndConditionsModel,
  CopyTermsAndConditions,
} from "../../../redux/Services/Config/TermAndConditionApi";
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
import { USER_ROLE_TYPE } from "../../../Middleware/enums";
import { updateState } from "../../../redux/Persist";
import RecordsAvailablePopupModel from "../../../components/RecordsAvailablePopupModel";

function Term_and_Condition() {
  let getTermsAndConditionsListApiCallCount = 0;
  const moduleName = "Terms & Conditions";
  //A]Declare state
  const common = useSelector((state) => state.Storage); //Getting Logged Users Details From Persist Storage of redux hooks
  const navigate = useNavigate();
  const {
    setTopbar,
    prospectName,
    setLoader,
    EngagementName,
    proposalName,
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
  const [TermAndConditionList, setTermAndConditionList] = useState([]);
  const [totalRecords, setTotalRecords] = useState(-1);
  const [errorMessage, setErrorMessage] = useState("");
  const [isAddUpdateActionDone, setIsAddUpdateActionDone] = useState(false);
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
  const [modelRequestData, setModelRequestData] = useState({
    professionTypeNames: null,
    BusinessTypeName: null,
    TemplateID: null,
    templateName: null,
    templateKeyID: null,
    StatusType: null,
    isDefault: null,
    status: null,
    Action: "",
    userKeyID: null,
  });
  const [openSuccessModal, setOpenSuccessModal] = React.useState(false);
  const [openErrorModal, setOpenErrorModal] = useState(false);
  const isCurrentPage =
    common.currentPage === "" ? currentPage : common.currentPage;
  const pageSize = isMobile ? isMobileRecords : desktopRecords;
  const dispatch = useDispatch();
  const [showProfessionType, setShowProfessionType] = useState(
    common.organisationKeyID === null || common.professionTypeLists.length > 1,
  );
  const formattedErrorMessage = handleErrorMessage(errorMessage);

  // B] Initial useEffect :
  // 1) Will Call Initial Api Like List Api
  useEffect(() => {
    setTopbar("block");
    GetTermsAndConditionsListData(isCurrentPage);
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
        GetTermsAndConditionsListData(isCurrentPage, null, null);
      } else {
        GetTermsAndConditionsListData(isCurrentPage);
      }
      setIsAddUpdateActionDone(false);
    }
  }, [isAddUpdateActionDone]);

  useEffect(() => {
    if (
      modelRequestData.Action === "Update" ||
      modelRequestData.Action === null
    ) {
      if (
        modelRequestData.Action === "Update" &&
        modelRequestData.TemplateID !== null
      ) {
        setTopbar("none");
        navigate("/add-terms-and-conditions", { state: modelRequestData });
      } else if (
        modelRequestData.TemplateID === null &&
        modelRequestData.Action === null
      ) {
        setTopbar("none");
        navigate("/add-terms-and-conditions", { state: modelRequestData });
      }
    }
  }, [modelRequestData]);
  // C] Calling All Api's like List and other Here :
  // 1) Get Service Category List Data
  const GetTermsAndConditionsListData = async (
    i,
    searchKeywordValue,
    sortValue,
    TemplateSort,
  ) => {
    setLoader(true);
    const pageNoList = i - 1;
    try {
      const data = await GetTermsAndConditionsList({
        pageSize: pageSize,
        pageNo: pageNoList,
        organisationID: common.organisationID,
        organisationKeyID: common.organisationKeyID,
        SearchKeyword:
          searchKeywordValue === undefined ? searchKeyword : searchKeywordValue,
        primarySortDirection:
          sortValue === undefined ? primarySortDirection : sortValue,
        PrimarySortColumnName:
          TemplateSort == undefined || TemplateSort == ""
            ? sortType
            : TemplateSort,
      });
      if (data) {
        if (data?.data?.statusCode === 200) {
          setLoader(false);
          getTermsAndConditionsListApiCallCount = 0;
          if (data?.data?.responseData?.data) {
            const totalCount = data.data.totalCount;
            const TemplateListData = data.data.responseData.data;
            if (pageNoList > 0 && TemplateListData.length === 0) {
              let newPaneNo = Number(pageNoList);
              if (newPaneNo > 1) {
                newPaneNo = newPaneNo - 1;
              }

              GetTermsAndConditionsListData(
                newPaneNo,
                searchKeywordValue,
                sortValue,
                TemplateSort,
              );
              setCurrentPage(pageNoList);
              return;
            }
            setListCount(totalCount);
            setTermAndConditionList(TemplateListData);
            setTotalRecords(TemplateListData.length);
          }
        } else {
          if (getTermsAndConditionsListApiCallCount < maxCountToRecallApi) {
            getTermsAndConditionsListApiCallCount += 1;
            setTimeout(function () {
              GetTermsAndConditionsListData(
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
  // Copy TnC data
  const CopyTermsAndConditionsTemplateData = async () => {
    if (!common.userKeyID) return;
    try {
      setLoader(true);
      const data = await CopyTermsAndConditions(
        modelRequestData.templateKeyID,
        common.userKeyID,
      );
      if (data?.data?.statusCode === 200) {
        setLoader(false);
        $("#" + "ConfirmModel").one("hidden.bs.modal", () => {
          setOpenSuccessModal(true);
        });
        $("#" + "ConfirmModel").modal("hide");
        GetTermsAndConditionsListData(currentPage);
      } else {
        setLoader(false);
        setErrorMessage(data?.data?.errorMessage);
        setOpenErrorModal(true);
      }
    } catch (error) {
      console.error(error);
    }
  };
  // Update Function Modal
  // 2) On Click Template Status Button
  const TermsAndConditionsChangeStatusDataAndDeleteData = async () => {
    setLoader(true);
    if (modelRequestData.Action === "Status") {
      if (modelRequestData.StatusType === null) {
        try {
          const Data = await TermsAndConditionsChangeStatus(
            modelRequestData.templateKeyID,
            modelRequestData.userKeyID,
          );
          if (Data) {
            setLoader(false);
            if (Data?.data?.statusCode === 200) {
              if (
                Data?.data?.responseData.templateExistsInModule.length !== 0
              ) {
                const servicePackageNames =
                  Data?.data?.responseData.templateExistsInModule.map(
                    (item) => item.templateName,
                  );
                const moduleNames =
                  Data?.data?.responseData.templateExistsInModule
                    .map((item) => item.moduleName)
                    .join(", ");
                setModelRequestData({
                  ...modelRequestData,
                  Action: "TermAndConditionWarning",
                  message: `Following ${moduleNames} are assigned to the selected ${moduleName}.You must remove the ${moduleNames} from this ${moduleName} before attempting to mark it as InActive.`,
                  ServiceName: servicePackageNames,
                });
                $("#" + "ConfirmModel").modal("hide");
                $("#" + "RecordsAvailablePopupModel").modal("show");
                GetTermsAndConditionsListData(currentPage);
              } else {
                GetTermsAndConditionsListData(currentPage);
                $("#" + "ConfirmModel").one("hidden.bs.modal", () => {
                  setOpenSuccessModal(true);
                });
                $("#" + "ConfirmModel").modal("hide");
              }
            } else {
              let ErrorMessage = Data?.response?.data?.errorMessage;
              if (
                ErrorMessage.includes(
                  "At least one template should be defaulted.",
                ) &&
                common.organisationKeyID === null
              ) {
                setErrorMessage(
                  ` Status cannot be changed to InActive. This template is marked as default for profession type ${modelRequestData.professionTypeNames} and business type ${modelRequestData.BusinessTypeName}.`,
                );
                setOpenErrorModal(true);
              } else if (
                ErrorMessage.includes(
                  "At least one template should be defaulted.",
                ) &&
                showProfessionType &&
                common.organisationKeyID !== null
              ) {
                setErrorMessage(
                  ` Status cannot be changed to InActive. This template is marked as default for profession type  ${modelRequestData.professionTypeNames}.`,
                );
                setOpenErrorModal(true);
              } else if (
                ErrorMessage.includes(
                  "At least one template should be defaulted.",
                )
              ) {
                setErrorMessage(
                  ` Status cannot be changed to InActive. This template is marked as default.`,
                );
                setOpenErrorModal(true);
              } else {
                setErrorMessage(Data?.response?.data?.errorMessage);
                setOpenErrorModal(true);
              }
            }
            GetTermsAndConditionsListData(isCurrentPage);
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
              let ErrorMessage = Data?.response?.data?.errorMessage;
              if (
                ErrorMessage.includes(
                  "At least one template should be defaulted.",
                ) &&
                common.organisationKeyID === null
              ) {
                setErrorMessage(
                  `This template is the only template of profession type ${modelRequestData.professionTypeNames} and business type ${modelRequestData.BusinessTypeName}  marked as default. At least one template must be defaulted.`,
                );
                setOpenErrorModal(true);
              } else if (
                ErrorMessage.includes(
                  "At least one template should be defaulted.",
                ) &&
                showProfessionType &&
                common.organisationKeyID !== null
              ) {
                setErrorMessage(
                  `This template is the only template of profession type ${modelRequestData.professionTypeNames} marked as default. At least one template must be defaulted.`,
                );
                setOpenErrorModal(true);
              } else if (
                ErrorMessage.includes(
                  "At least one template should be defaulted.",
                )
              ) {
                setErrorMessage(
                  `This template is the only template  marked as default. At least one template must be defaulted.`,
                );
                setOpenErrorModal(true);
              } else {
                setErrorMessage(Data?.response?.data?.errorMessage);
                setOpenErrorModal(true);
              }
            }
            GetTermsAndConditionsListData(isCurrentPage);
          }
        } catch (error) {
          console.log(error);
        }
      }
    } else if (modelRequestData.Action === "Delete") {
      try {
        const Data = await TermsAndConditionsDelete(
          modelRequestData.templateKeyID,
          modelRequestData.userKeyID,
        );
        if (Data) {
          setLoader(false);
          if (Data?.data?.statusCode === 200) {
            if (Data?.data?.responseData.templateExistsInModule.length !== 0) {
              const servicePackageNames =
                Data?.data?.responseData.templateExistsInModule.map(
                  (item) => item.templateName,
                );
              setModelRequestData({
                ...modelRequestData,
                Action: "TermAndConditionWarning",
                message: `This Service  is used in below services.You must remove the service  from these before you InActive it.`,
                ServiceName: servicePackageNames,
              });
              $("#" + "ConfirmModel").modal("hide");
              $("#" + "RecordsAvailablePopupModel").modal("show");
              GetTermsAndConditionsListData(currentPage);
            } else {
              GetTermsAndConditionsListData(currentPage);
              $("#" + "ConfirmModel").one("hidden.bs.modal", () => {
                setOpenSuccessModal(true);
              });
              $("#" + "ConfirmModel").modal("hide");
            }
          } else {
            setErrorMessage(Data?.response?.data?.errorMessage);
            setOpenErrorModal(true);
          }
        }

        GetTermsAndConditionsListData(isCurrentPage);
      } catch (error) {
        console.log(error);
      }
    }
  };

  //E] Update Function Modal
  // 1) On Click Service Category Add Button
  const TemplateAddBtnClicked = () => {
    setModelRequestData({
      ...modelRequestData,
      Action: null,
      TemplateID: null,
      templateKeyID: null,
    });
  };

  // 2) On Click Template Edit Button
  const TemplateEditBtnClicked = async (Template, type) => {
    if (type === "editPredefined") {
      setLoader(true);
      const data = await GetTermsAndConditionsModel(
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

  // F] Pagination :
  const handlePageChange = async (pageNumber) => {
    setCurrentPage(pageNumber);
    await GetTermsAndConditionsListData(pageNumber); // Call your function with the selected page number
  };

  // G] Sorting & Handle Function:
  const handleSort = (sortValue, TemplateSort) => {
    if (TemplateSort === "TemplateName") {
      setPrimarySortDirection(sortValue);
      setPrimarySortDirectionObj({
        ...primarySortDirectionObj,
        templateNameSort: sortValue,
      });
      setCurrentPage(1);
      GetTermsAndConditionsListData(1, searchKeyword, sortValue, TemplateSort);
    } else if (TemplateSort === "TemplateType") {
      setPrimarySortDirection(sortValue);
      setPrimarySortDirectionObj({
        ...primarySortDirectionObj,
        TemplateTypeSort: sortValue,
      });
      setCurrentPage(1);
      GetTermsAndConditionsListData(1, searchKeyword, sortValue, TemplateSort);
    } else if (TemplateSort === "BusinessType") {
      setPrimarySortDirection(sortValue);
      setPrimarySortDirectionObj({
        ...primarySortDirectionObj,
        BusinessType: sortValue,
      });
      setCurrentPage(1);
      GetTermsAndConditionsListData(1, searchKeyword, sortValue, TemplateSort);
    } else if (TemplateSort === "ProspectBusinessType") {
      setPrimarySortDirection(sortValue);
      setPrimarySortDirectionObj({
        ...primarySortDirectionObj,
        ProspectBusinessType: sortValue,
      });
      setCurrentPage(1);
      GetTermsAndConditionsListData(1, searchKeyword, sortValue, TemplateSort);
    } else if (TemplateSort === "ProfessionType") {
      setPrimarySortDirection(sortValue);
      setPrimarySortDirectionObj({
        ...primarySortDirectionObj,
        ProfessionType: sortValue,
      });
      setCurrentPage(1);
      GetTermsAndConditionsListData(1, searchKeyword, sortValue, TemplateSort);
    }
  };
  const handleSearch = (e) => {
    const searchKeywordValue = e.target.value;
    setSearchKeyword(searchKeywordValue);
    setCurrentPage(1);
    GetTermsAndConditionsListData(isCurrentPage, searchKeywordValue);
  };

  const handleClose = () => {
    $("#" + "ConfirmModel").modal("hide");
    $("#" + "RecordsAvailablePopupModel").modal("hide");
    setOpenSuccessModal(false);
    setOpenErrorModal(false);
  };

  const canAdd =
    (userAccessData.Admin_Config_TnC_CanAdd &&
      common.organisationKeyID !== null) ||
    (userAccessData.SuperAdmin_Config_TnC_CanAdd &&
      common.organisationKeyID === null);

  const canEdit =
    (userAccessData.Admin_Config_TnC_CanEdit &&
      common.organisationKeyID !== null) ||
    (userAccessData.SuperAdmin_Config_TnC_CanEdit &&
      common.organisationKeyID === null);

  const canDelete =
    (userAccessData.Admin_Config_TnC_CanDelete &&
      common.organisationKeyID !== null) ||
    (userAccessData.SuperAdmin_Config_TnC_CanDelete &&
      common.organisationKeyID === null);

  const showBusinessType =
    common.roleTypeId === USER_ROLE_TYPE.SuperAdmin &&
    common.organisationKeyID === null;

  return (
    <>
      <div className="tnc-list-redesign">
        <div className="tnc-list-page">
          {/* =========================
              PAGE HEADER
              ========================= */}
          <div className="tnc-list-page-header">
            <div className="tnc-list-page-heading">
              <h1 className="tnc-list-page-title">Terms &amp; Conditions</h1>
              <p className="tnc-list-page-subtitle">
                Manage reusable terms and conditions.
              </p>
            </div>

            {canAdd && (
              <div className="tnc-list-page-action">
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
          <section className="tnc-list-card">
            {/* Toolbar is deliberately outside the scrollable table area */}
            <div className="tnc-list-toolbar">
              <div className="tnc-list-search-wrap">
                <i className="ri-search-line tnc-list-search-icon"></i>

                <input
                  type="text"
                  value={searchKeyword}
                  onChange={handleSearch}
                  className="tnc-list-search-input"
                  placeholder={
                    isMobile
                      ? "Search"
                      : getPlaceholderTextName("Search", moduleName)
                  }
                />
              </div>
            </div>

            {/* Only the table area can horizontally scroll */}
            <div className="tnc-list-table-scroll">
              <table
                className={`tnc-list-table ${
                  !showProfessionType ? "tnc-list-table--no-profession" : ""
                } ${!showBusinessType ? "tnc-list-table--no-business" : ""}`}
                id="customerTable"
              >
                <thead>
                  <tr>
                    <th>
                      <button
                        type="button"
                        className="tnc-list-sort-button"
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
                          className="tnc-list-sort-button"
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

                    {showBusinessType && (
                      <th>
                        <button
                          type="button"
                          className="tnc-list-sort-button"
                          onClick={() => {
                            setSortType("BusinessType");
                            handleSort(
                              primarySortDirectionObj.BusinessType === null
                                ? "asc"
                                : primarySortDirectionObj.BusinessType === "asc"
                                  ? "desc"
                                  : "asc",
                              "BusinessType",
                            );
                          }}
                        >
                          <span>Business Type</span>
                          <i
                            className={
                              primarySortDirectionObj.BusinessType === "desc"
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
                        className="tnc-list-sort-button"
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
                    <th className="tnc-list-actions-heading">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {TermAndConditionList.slice(
                    0,
                    isMobile ? isMobileRecords : desktopRecords,
                  ).map((Template) => {
                    const templateName =
                      Template.templateName?.replace(/\b\w/g, (l) =>
                        l.toUpperCase(),
                      ) || "-";

                    return (
                      <tr
                        className="tnc-list-row"
                        key={Template.templateKeyID || Template.templateName}
                      >
                        <td>
                          <div className="tnc-list-name-cell">
                            {/* <span className="tnc-list-name-icon">
                              <i className="ri-file-list-3-line"></i>
                            </span> */}

                            <div className="tnc-list-name-content">
                              <div className="tnc-list-name-line">
                                {Template.notifySAChanges !== null &&
                                  common.organisationKeyID !== null && (
                                    <Tooltip title="View System Administrator Changes">
                                      <button
                                        type="button"
                                        className="tnc-list-notification-button"
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
                                  <span className="tnc-list-name">
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
                              className="tnc-list-profession-chip"
                              title={Template.professionTypeNames}
                            >
                              {Template.professionTypeNames || "-"}
                            </span>
                          </td>
                        )}

                        {showBusinessType && (
                          <td>
                            <span
                              className="tnc-list-business-chip"
                              title={Template.orgBusinessType}
                            >
                              {Template.orgBusinessType || "-"}
                            </span>
                          </td>
                        )}

                        <td>
                          <span className="tnc-list-type-badge">
                            {Template.templateType || "-"}
                          </span>
                        </td>

                        <td>
                          <div className="tnc-list-status-control">
                            <span
                              className={`tnc-list-default-badge ${
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
                                    className="tnc-list-switch-label"
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
                                            StatusType: "IsDefault",
                                            isDefault:
                                              Template.isDefaultName === "Yes"
                                                ? false
                                                : true,
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
                          <div className="tnc-list-status-control">
                            <span
                              className={`tnc-list-status-badge ${
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
                                    className="tnc-list-switch-label"
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

                        <td className="tnc-list-actions-cell">
                          <div className="tnc-list-row-actions">
                            {/* Copy remains available exactly as in the original list */}
                            <Tooltip
                              title={getCrudButtonToolTipName(
                                "Copy",
                                moduleName,
                              )}
                            >
                              <button
                                type="button"
                                className="tnc-list-action-button tnc-list-action-button--copy"
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
                                  className="tnc-list-action-button tnc-list-action-button--edit"
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
                                  className="tnc-list-action-button tnc-list-action-button--delete"
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
              <div className="tnc-list-empty-state">
                <NoResultFoundModel
                  name={moduleName}
                  totalRecords={totalRecords}
                />
              </div>
            )}

            {listCount > pageSize && (
              <div className="tnc-list-pagination">
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
              ? TermsAndConditionsChangeStatusDataAndDeleteData
              : CopyTermsAndConditionsTemplateData
          }
        />

        <RecordsAvailablePopupModel
          handleClose={handleClose}
          openErrorModal={openErrorModal}
          openSuccessModal={openSuccessModal}
          modelRequestData={modelRequestData}
          UpdatedStatus={TermsAndConditionsChangeStatusDataAndDeleteData}
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

        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="btn btn-danger btn-icon"
          id="back-to-top"
        >
          <i className="ri-arrow-up-line"></i>
        </button>
      </div>

      <div className="tnc-list-footer-wrap">
        <Footer />
      </div>
    </>
  );
}

export default Term_and_Condition;
