/* global $ */
import React, { useContext, useEffect, useState } from "react";
import "./ServiceStyle.css";
import "./ServiceStyle-redesign.css";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import CommonButtonComponent from "../../../components/CommonButtonComponent";
import { useNavigate } from "react-router-dom";
import Android12Switch from "../../../components/AndroidSwitch";
import { AuthContextProvider } from "../../../AuthContext/AuthContext";
import NoResultFoundModel from "../../../components/NoResultFoundModel";
import {
  CopyService,
  DeleteService,
  GetServiceModel,
  GetServicesList,
  ServicesChangeStatus,
} from "../../../redux/Services/Config/ServicesApi";
import { useSelector } from "react-redux";
import { Tooltip } from "@mui/material";
import ConfirmModel from "../../../components/ConfirmationBox";
import ServicesModel from "../service_categories/ServicesCategoriesModel";
import SuccessModal from "../../../components/SuccessModal";
import ErrorModel from "../../../components/ErrorModel";
import Footer from "../../../components/Footer";
import RecordsAvailablePopupModel from "../../../components/RecordsAvailablePopupModel";
import FilterModel from "../../../components/FilterModel";
const Services = () => {
  // A] States Declaration :
  const moduleName = "Service";
  const {
    setLoader,
    setTopbar,
    maxCountToRecallApi,

    isMobile,
    setListCount,
    getCrudButtonTextName,
    getPlaceholderTextName,
    getCrudButtonToolTipName,
    userAccessData,
    handleErrorMessage,
  } = useContext(AuthContextProvider);
  let getServiceListApiCallCount = 0;
  const navigate = useNavigate();
  const [totalRecords, setTotalRecords] = useState(-1);
  const [serviceList, setServiceList] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);

  const [isAddUpdateActionDone, setIsAddUpdateActionDone] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [openSuccessModal, setOpenSuccessModal] = useState(false);
  const [openErrorModal, setOpenErrorModal] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  // Category groups the user has collapsed (UI only)
  const [collapsedCategories, setCollapsedCategories] = useState([]);
  const getCategoryKey = (service) =>
    service.serviceCatKeyID || service.serviceCatName;
  const toggleCategoryCollapse = (categoryKey) => {
    setCollapsedCategories((prev) =>
      prev.includes(categoryKey)
        ? prev.filter((key) => key !== categoryKey)
        : [...prev, categoryKey],
    );
  };
  const [modelRequestData, setModelRequestData] = useState({
    serviceKeyID: null,
    ProfessionTypeId: null,
    keyID: null,
    searchKeyword: "",
    Status: "",
    Action: "",
    userKeyID: null,
    Type: null,
  });
  const [businessNatureID, setBusinessNatureID] = useState(null);
  const [prospectType, setProspectType] = useState(null);
  const [isFilterApply, setIsFilterApply] = useState(false);
  const common = useSelector((state) => state.Storage);
  const [showProfessionType, setShowProfessionType] = useState(
    common.organisationKeyID === null || common.professionTypeLists.length > 1,
  );
  const formattedErrorMessage = handleErrorMessage(errorMessage);

  // B] Initial useEffect :
  // 1) Will Call Initial Api Like List Api
  useEffect(() => {
    GetServiceListData();
  }, [common.organisationKeyID]);

  useEffect(() => {
    setTopbar("block");
  }, []);

  useEffect(() => {
    if (
      modelRequestData.Action === null &&
      modelRequestData.serviceKeyID === null
    ) {
      navigate("/add-update-service", { state: modelRequestData });
    } else if (
      modelRequestData.Action === "Update" &&
      modelRequestData.serviceKeyID !== null
    ) {
      navigate("/add-update-service", { state: modelRequestData });
    }
  }, [modelRequestData]);
  // B] Calling All Api's like List and other Here :
  // 1) Get Service Category List Data
  const GetServiceListData = async (
    searchKeywordValue,
    businessNatureId,
    businessTypeId,
  ) => {
    setLoader(true);
    try {
      const data = await GetServicesList({
        pageSize: 10,
        pageNo: 1,
        organisationKeyID: common.organisationKeyID,
        SearchKeyword:
          searchKeywordValue === undefined ? searchKeyword : searchKeywordValue,
        businessTypeID:
          businessTypeId === undefined ? prospectType : businessTypeId,
        businessNatureID:
          businessNatureId === undefined ? businessNatureID : businessNatureId,
      });
      if (data) {
        setLoader(false);
        if (data?.data?.statusCode === 200) {
          setLoader(false);
          getServiceListApiCallCount = 0;
          if (data?.data?.responseData?.data) {
            const totalCount = data.data.totalCount;
            const ServiceListData = data.data.responseData.data;
            setListCount(totalCount);
            setServiceList(ServiceListData);
            setTotalRecords(ServiceListData.length);
          }
        } else {
          if (getServiceListApiCallCount < maxCountToRecallApi) {
            getServiceListApiCallCount += 1;
            setTimeout(function () {
              GetServiceListData();
            }, 1000);
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

  // 2) On Click Service Edit Button
  const ServiceEditBtnClicked = async (service, type) => {
    if (type === "editPredefined") {
      setLoader(true);
      const data = await GetServiceModel(service.serviceKeyID, true);
      if (data?.data?.statusCode === 200) {
        setLoader(false);
        setModelRequestData({
          serviceName: service.serviceName,
          serviceKeyID: service.serviceKeyID,
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
        serviceName: service.serviceName,
        serviceKeyID: service.serviceKeyID,
        Action: "Update",
        Type: null,
      });
    }
  };

  //Handle Change Status Data and Delete Data
  const serviceChangeStatusDataAndDeleteData = async () => {
    // console.log(modelRequestData.Action);
    setLoader(true);
    if (modelRequestData.Action === "Status") {
      try {
        const Data = await ServicesChangeStatus(
          modelRequestData.serviceKeyID,
          modelRequestData.userKeyID,
        );
        if (Data) {
          setLoader(false);
          if (Data?.data?.statusCode === 200) {
            const servicePackageNames =
              Data?.data?.responseData.serviceExistInPackage
                .map((item) => item.servicePackageName)
                .slice(0, 5);
            const moduleNamesForQuote =
              Data?.data?.responseData.serviceExistinQuote
                .map((item) => item.refID)
                .slice(0, 5);
            const moduleNamesForContract =
              Data?.data?.responseData.serviceExistinContract
                .map((item) => item.refID)
                .slice(0, 5);

            if (
              servicePackageNames.length > 0 ||
              moduleNamesForQuote.length > 0 ||
              moduleNamesForContract.length > 0
            ) {
              let warningMessage = `Following modules are linked to the selected ${moduleName.toLowerCase()}. You must remove these before attempting to mark it as InActive.\n`;

              if (servicePackageNames.length > 0) {
                warningMessage += "\nPackages:\n";
                warningMessage += servicePackageNames
                  .map((x) => `• ${x}`)
                  .join("\n");
              }

              if (moduleNamesForQuote.length > 0) {
                warningMessage += "\nProposals:\n";
                warningMessage += moduleNamesForQuote
                  .map((x) => `• ${x}`)
                  .join("\n");
              }

              if (moduleNamesForContract.length > 0) {
                warningMessage += "\nEngagement Letters:\n";
                warningMessage += moduleNamesForContract
                  .map((x) => `• ${x}`)
                  .join("\n");
              }

              setModelRequestData({
                ...modelRequestData,
                Action: "ServiceWarning",

                message: warningMessage,
                ServiceName: [],
              });
              setErrorMessage(warningMessage);
              setOpenErrorModal(true);
              // $("#" + "RecordsAvailablePopupModel").modal("show");
            } else {
              GetServiceListData(null, null, null);
            }
            // GetServiceListData(null, null, null);
          } else {
            setErrorMessage(Data?.response?.data?.errorMessage);
            GetServiceListData(null, null, null);
            setOpenErrorModal(true);
          }
          $("#ConfirmModel").modal("hide");
        }
      } catch (error) {
        console.log(error);
      }
    } else if (modelRequestData.Action === "Delete") {
      try {
        const Data = await DeleteService(
          modelRequestData.serviceKeyID,
          modelRequestData.userKeyID,
        );
        if (Data) {
          setLoader(false);
          if (Data?.data?.statusCode === 200) {
            if (Data?.data?.responseData.serviceExistInPackage.length !== 0) {
              const servicePackageNames =
                Data?.data?.responseData.serviceExistInPackage.map(
                  (item) => item.servicePackageName,
                );
              setModelRequestData({
                ...modelRequestData,
                Action: "ServiceWarning",
                message: `Following packages are assigned to the selected ${moduleName.toLowerCase()}.You must remove the packages from this ${moduleName.toLowerCase()} before attempting to mark it as InActive.`,
                ServiceName: servicePackageNames,
              });
              $("#" + "ConfirmModel").modal("show");
              //  GetServiceListData(null, null, null);
            } else {
              $("#" + "ConfirmModel").one("hidden.bs.modal", () => {
                setOpenSuccessModal(true);
              });
              $("#" + "ConfirmModel").modal("hide");
              GetServiceListData(null, null, null);
            }
          } else {
            setErrorMessage(Data?.response?.data?.errorMessage);
            setOpenErrorModal(true);
          }
          //  GetServiceListData(null, null, null);
        }
      } catch (error) {
        console.log(error);
      }
    } else if (modelRequestData.Action === "Copy") {
      try {
        const CopyServiceData = await CopyService(
          modelRequestData.serviceKeyID,
          modelRequestData.userKeyID,
        );
        if (CopyServiceData.data.statusCode === 200) {
          setLoader(false);
          $("#" + "ConfirmModel").one("hidden.bs.modal", () => {
            setOpenSuccessModal(true);
          });
          $("#" + "ConfirmModel").modal("hide");
          GetServiceListData(null, null, null);
        }
      } catch (error) {
        setLoader(false);
        console.log(error);
      }
    }
  };

  // E] Add Service Click
  const AddServiceBtn = () => {
    if (common.professionTypeLists.length === 1) {
      setModelRequestData({
        serviceName: null,
        ProfessionTypeId: common.professionTypeLists,
        serviceKeyID: null,
        Action: null,
      });
    } else {
      setModelRequestData({
        ProfessionTypeId: null,
        serviceKeyID: null,
        Action: null,
      });
    }
  };

  // Handle Search
  const handleSearch = (e) => {
    const searchKeywordValue = e.target.value;
    setSearchKeyword(searchKeywordValue);
    GetServiceListData(e.target.value);
  };

  //Handle Close
  const handleClose = () => {
    $("#" + "ConfirmModel").modal("hide");
    $("#" + "RecordsAvailablePopupModel").modal("hide");
    if (openErrorModal && formattedErrorMessage?.includes("default state")) {
      GetServiceListData(searchKeyword, businessNatureID, prospectType);
    }
    setOpenSuccessModal(false);
    setOpenErrorModal(false);
  };

  const ApplyFilter = () => {
    if (
      (businessNatureID !== null && businessNatureID !== "") ||
      (prospectType !== null && prospectType !== "")
    ) {
      setIsFilterApply(true);
    } else {
      setIsFilterApply(false);
    }
    GetServiceListData(searchKeyword, businessNatureID, prospectType);
  };
  const ClearFilter = () => {
    setIsFilterApply(false);
    setBusinessNatureID(null);
    setProspectType(null);
    GetServiceListData(searchKeyword, null, null);
  };

  //Design part :
  const canAdd =
    (userAccessData.Admin_Config_Service_CanAdd &&
      common.organisationKeyID !== null) ||
    (userAccessData.SuperAdmin_Config_Service_CanAdd &&
      common.organisationKeyID === null);

  const canEdit =
    (userAccessData.Admin_Config_Service_CanEdit &&
      common.organisationKeyID !== null) ||
    (userAccessData.SuperAdmin_Config_Service_CanEdit &&
      common.organisationKeyID === null);

  const canDelete =
    (userAccessData.Admin_Config_Service_CanDelete &&
      common.organisationKeyID !== null) ||
    (userAccessData.SuperAdmin_Config_Service_CanDelete &&
      common.organisationKeyID === null);

  return (
    <>
      <div className="services-redesign">
        <div className="services-page">
          {/* =========================
              PAGE HEADER
              ========================= */}
          <div className="services-page-header">
            <div>
              <h1 className="services-page-title">Services</h1>
              <p className="services-page-subtitle">
                Manage services, category assignments, profession types and
                availability.
              </p>
            </div>

            {canAdd && (
              <div className="services-add-action">
                <CommonButtonComponent
                  title={getCrudButtonToolTipName("Add", moduleName)}
                  name={getCrudButtonTextName("Add", moduleName)}
                  AddBtn={() => AddServiceBtn()}
                />
              </div>
            )}
          </div>

          {/* =========================
              MAIN LIST PANEL
              ========================= */}
          <section className="services-list-panel">
            {/* Toolbar */}
            <div className="services-toolbar">
              <div className="services-search-wrap">
                <i className="ri-search-line services-search-icon"></i>

                <input
                  type="text"
                  value={searchKeyword}
                  onChange={handleSearch}
                  className="services-search-input"
                  placeholder={
                    isMobile
                      ? "Search"
                      : getPlaceholderTextName("Search", moduleName)
                  }
                />
              </div>

              <div className="services-toolbar-actions">
                <Tooltip title={getCrudButtonToolTipName("Filter", moduleName)}>
                  <button
                    type="button"
                    className={`services-filter-button ${
                      isFilterApply ? "services-filter-button--active" : ""
                    }`}
                    data-bs-toggle="modal"
                    data-bs-target="#FilterModel"
                  >
                    <i className="ri-filter-3-line"></i>
                    <span>Filter</span>

                    {isFilterApply && (
                      <span className="services-filter-active-dot"></span>
                    )}
                  </button>
                </Tooltip>

                {serviceList?.length > 0 && (
                  <button
                    type="button"
                    className="services-filter-button services-collapse-all-button"
                    onClick={() =>
                      setCollapsedCategories(
                        serviceList.every((service) =>
                          collapsedCategories.includes(getCategoryKey(service)),
                        )
                          ? []
                          : serviceList.map(getCategoryKey),
                      )
                    }
                  >
                    {serviceList.every((service) =>
                      collapsedCategories.includes(getCategoryKey(service)),
                    ) ? (
                      <>
                        <i className="ri-arrow-down-s-line"></i>
                        <span>Expand All</span>
                      </>
                    ) : (
                      <>
                        <i className="ri-arrow-up-s-line"></i>
                        <span>Collapse All</span>
                      </>
                    )}
                  </button>
                )}

                {isFilterApply && (
                  <Tooltip title="Clear Filter">
                    <button
                      type="button"
                      className="services-clear-filter-button"
                      onClick={ClearFilter}
                    >
                      <i className="ri-close-line"></i>
                      <span>Clear Filter</span>
                    </button>
                  </Tooltip>
                )}
              </div>
            </div>

            {/* =========================
                CATEGORY GROUPS
                ========================= */}
            <div className="services-groups">
              {serviceList?.map((service) => {
                const categoryName =
                  service?.serviceCatName?.replace(/\b\w/g, (l) =>
                    l.toUpperCase(),
                  ) || "-";
                const categoryKey = getCategoryKey(service);
                const isCollapsed = collapsedCategories.includes(categoryKey);

                return (
                  <section
                    className={`services-category-group${isCollapsed ? " is-collapsed" : ""}`}
                    key={service.serviceCatKeyID || service.serviceCatName}
                  >
                    {/* Category heading */}
                    <div className="services-category-header">
                      <div className="services-category-title-wrap">
                        <span className="services-category-icon">
                          <i className="ri-stack-line"></i>
                        </span>

                        <div className="services-category-copy">
                          <Tooltip
                            title={
                              categoryName.length > 50
                                ? service?.serviceCatName
                                : ""
                            }
                          >
                            <h2 className="services-category-title">
                              {isMobile && categoryName.length > 26
                                ? `${categoryName.substring(0, 26)}...`
                                : !isMobile && categoryName.length > 60
                                  ? `${categoryName.substring(0, 60)}...`
                                  : categoryName}
                            </h2>
                          </Tooltip>

                          <span className="services-category-count">
                            {service?.servicesList?.length || 0}{" "}
                            {(service?.servicesList?.length || 0) === 1
                              ? "service"
                              : "services"}
                          </span>
                        </div>
                      </div>

                      <div className="services-category-actions">
                        {service.needToUpdate && (
                          <span className="services-category-attention">
                            <i className="ri-error-warning-line"></i>
                            Update required
                          </span>
                        )}
                        <button
                          type="button"
                          className="services-category-toggle"
                          onClick={() => toggleCategoryCollapse(categoryKey)}
                          aria-expanded={!isCollapsed}
                          title={isCollapsed ? "Expand services" : "Collapse services"}
                        >
                          <i className="ri-arrow-down-s-line"></i>
                        </button>
                      </div>
                    </div>

                    {/* Category table */}
                    {!isCollapsed && (
                    <div className="services-table-wrap">
                      <table className="services-table">
                        <thead>
                          <tr>
                            <th>Service Name</th>

                            {showProfessionType && <th>Profession Type</th>}

                            <th>Status</th>

                            {(canEdit || canDelete) && (
                              <th className="services-actions-heading">
                                Actions
                              </th>
                            )}
                          </tr>
                        </thead>

                        <tbody>
                          {service?.servicesList?.map((subService) => {
                            const serviceName =
                              subService.serviceName?.replace(/\b\w/g, (l) =>
                                l.toUpperCase(),
                              ) || "-";

                            const statusClass = (subService.statusName || "")
                              .toLowerCase()
                              .replace(/\s+/g, "-");

                            return (
                              <tr
                                className="services-table-row"
                                key={
                                  subService.serviceKeyID ||
                                  subService.serviceName
                                }
                              >
                                <td>
                                  <div className="services-name-cell">
                                    {/* <span className="services-item-icon">
                                      <i className="ri-tools-line"></i>
                                    </span> */}

                                    <div className="services-name-copy">
                                      <div className="services-name-line">
                                        {subService.notifySAChanges !== null &&
                                          common.organisationKeyID !== null && (
                                            <Tooltip title="View System Administrator Changes">
                                              <button
                                                type="button"
                                                className="services-notification-button"
                                                onClick={() =>
                                                  ServiceEditBtnClicked(
                                                    subService,
                                                    "editPredefined",
                                                  )
                                                }
                                              >
                                                <i className="ri-notification-3-line"></i>
                                              </button>
                                            </Tooltip>
                                          )}

                                        {service.needToUpdate && (
                                          <span
                                            className="services-update-marker"
                                            title="Update required"
                                          >
                                            *
                                          </span>
                                        )}

                                        <Tooltip
                                          title={
                                            serviceName.length > 55
                                              ? subService.serviceName
                                              : ""
                                          }
                                        >
                                          <span className="services-primary-text">
                                            {isMobile && serviceName.length > 24
                                              ? `${serviceName.substring(
                                                  0,
                                                  24,
                                                )}...`
                                              : !isMobile &&
                                                  serviceName.length > 55
                                                ? `${serviceName.substring(
                                                    0,
                                                    55,
                                                  )}...`
                                                : serviceName}
                                          </span>
                                        </Tooltip>
                                      </div>
                                    </div>
                                  </div>
                                </td>

                                {showProfessionType && (
                                  <td>
                                    <span
                                      className="services-profession-chip"
                                      title={subService.professionTypeNames}
                                    >
                                      {subService.professionTypeNames || "-"}
                                    </span>
                                  </td>
                                )}

                                <td>
                                  <div className="services-status-control">
                                    <span
                                      className={`services-status-badge services-status-badge--${statusClass}`}
                                    >
                                      <span className="services-status-dot"></span>
                                      {subService.statusName || "-"}
                                    </span>

                                    {canDelete && (
                                      <Tooltip
                                        title={getCrudButtonToolTipName(
                                          "Change Status",
                                        )}
                                      >
                                        <FormGroup>
                                          <FormControlLabel
                                            className="services-switch-label"
                                            control={
                                              <Android12Switch
                                                onClick={() =>
                                                  setModelRequestData({
                                                    ...modelRequestData,
                                                    serviceKeyID:
                                                      subService.serviceKeyID,
                                                    status:
                                                      subService.statusName,
                                                    userKeyID: common.userKeyID,
                                                    Action: "Status",
                                                  })
                                                }
                                                checked={
                                                  subService.statusName ===
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

                                {(canEdit || canDelete) && (
                                  <td className="services-actions-cell">
                                    <div className="services-row-actions">
                                      <Tooltip
                                        title={getCrudButtonToolTipName(
                                          "Copy",
                                          moduleName,
                                        )}
                                      >
                                        <button
                                          type="button"
                                          className="services-action-button services-action-button--copy"
                                          data-bs-toggle="modal"
                                          data-bs-target="#ConfirmModel"
                                          onClick={() =>
                                            setModelRequestData({
                                              ...modelRequestData,
                                              serviceKeyID:
                                                subService.serviceKeyID,
                                              serviceCatName:
                                                subService.serviceName,
                                              userKeyID: common.userKeyID,
                                              Action: "Copy",
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
                                            className="services-action-button services-action-button--edit"
                                            onClick={() =>
                                              ServiceEditBtnClicked(subService)
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
                                            className="services-action-button services-action-button--delete"
                                            data-bs-toggle="modal"
                                            data-bs-target="#ConfirmModel"
                                            onClick={() =>
                                              setModelRequestData({
                                                ...modelRequestData,
                                                serviceKeyID:
                                                  subService.serviceKeyID,
                                                serviceCatName:
                                                  subService.serviceName,
                                                userKeyID: common.userKeyID,
                                                Action: "Delete",
                                              })
                                            }
                                          >
                                            <i className="ri-delete-bin-line"></i>
                                          </button>
                                        </Tooltip>
                                      )}
                                    </div>
                                  </td>
                                )}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                    )}
                  </section>
                );
              })}

              {totalRecords <= 0 && (
                <div className="services-empty-state">
                  <NoResultFoundModel
                    name={moduleName}
                    totalRecords={totalRecords}
                  />
                </div>
              )}
            </div>
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
          UpdatedStatus={serviceChangeStatusDataAndDeleteData}
        />

        <RecordsAvailablePopupModel
          handleClose={handleClose}
          openErrorModal={openErrorModal}
          openSuccessModal={openSuccessModal}
          modelRequestData={modelRequestData}
          UpdatedStatus={serviceChangeStatusDataAndDeleteData}
        />

        <SuccessModal
          handleClose={handleClose}
          setOpenSuccessModal={setOpenSuccessModal}
          openSuccessModal={openSuccessModal}
          modelAction={modelRequestData.Action}
          message={
            modelRequestData.Action === "Copy"
              ? `The Copy of ${modelRequestData.serviceCatName} has been created successfully!`
              : modelRequestData.Action === "Delete"
                ? `${moduleName} ${modelRequestData.serviceCatName}`
                : "Status has been changed successfully!"
          }
        />

        <ServicesModel
          class="modal fade"
          id="addUpdateModal"
          tabIndex="-1"
          aria_labelledby="exampleModalLabel"
          aria_hidden="true"
          setIsAddUpdateActionDone={setIsAddUpdateActionDone}
          modelRequestData={modelRequestData}
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
          ApplyFilter={ApplyFilter}
          businessNatureID={businessNatureID}
          setBusinessNatureID={setBusinessNatureID}
          prospectType={prospectType}
          setProspectType={setProspectType}
        />

        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="btn btn-danger btn-icon"
          id="back-to-top"
        >
          <i className="ri-arrow-up-line"></i>
        </button>
      </div>

      <Footer />
    </>
  );
};

export default Services;
