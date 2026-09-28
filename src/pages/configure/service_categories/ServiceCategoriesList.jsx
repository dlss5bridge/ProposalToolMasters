/* global $ */
import React, { useContext, useEffect, useState } from "react";
import "./ServiceCategory.css";
import "./ServiceCategory-redesign.css";
import CommonButtonComponent from "../../../components/CommonButtonComponent";
import ServicesCategoriesModel from "./ServicesCategoriesModel";
import ConfirmModel from "../../../components/ConfirmationBox";
import {
  CopyServiceCategory,
  DeleteServiceCategory,
  GetServiceCategoryList,
  GetServiceCategoryModel,
  ServiceCategoryChangeStatus,
} from "../../../redux/Services/Config/ServiceCategoryApi";
import PaginationComponent from "../../../components/PaginationModel";
import { useSelector } from "react-redux";
import Android12Switch from "../../../components/AndroidSwitch";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Tooltip, { tooltipClasses } from "@mui/material/Tooltip";
import NoResultFoundModel from "../../../components/NoResultFoundModel";
import { AuthContextProvider } from "../../../AuthContext/AuthContext";
import SuccessModal from "../../../components/SuccessModal";
import ErrorModel from "../../../components/ErrorModel";
import Footer from "../../../components/Footer";
import RecordsAvailablePopupModel from "../../../components/RecordsAvailablePopupModel";

const Service_Categories = () => {
  // A] States Declaration :
  const moduleName = "Service Category";
  const [serviceCategoryList, setServiceCategoryList] = useState([]);
  const [modelRequestData, setModelRequestData] = useState({
    serviceCatKeyID: null,
    serviceCatName: null,
    status: "",
    Action: "",
    userKeyID: null,
    Type: null,
    moduleName: moduleName,
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [isAddUpdateActionDone, setIsAddUpdateActionDone] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const common = useSelector((state) => state.Storage); //Getting Logged Users Details From Persist Storage of redux hooks
  const [primarySortDirection, setPrimarySortDirection] = useState(null);
  const [primarySortDirectionObj, setPrimarySortDirectionObj] = useState({
    ServiceNameSort: null,
    ProfessionTypeSort: null,
  });
  const [sortType, setSortType] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [totalRecords, setTotalRecords] = useState(-1);
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

  let getServiceCategoryListApiCallCount = 0;
  const [openSuccessModal, setOpenSuccessModal] = React.useState(false);
  const [openErrorModal, setOpenErrorModal] = React.useState(false);
  const [showProfessionType, setShowProfessionType] = useState(
    common.organisationKeyID === null || common.professionTypeLists.length > 1,
  );
  const pageSize = isMobile ? isMobileRecords : desktopRecords;
  const formattedErrorMessage = handleErrorMessage(errorMessage);

  // B] Initial useEffect :
  // 1) Will Call Initial Api Like List Api
  useEffect(() => {
    setTopbar("block");
    GetServiceCategoryListData(1, null, null, null);
  }, []);

  //2) This useEffect will trigger when we successfully add or update record from popup model
  useEffect(() => {
    if (isAddUpdateActionDone) {
      if (modelRequestData.Action === null) {
        setSearchKeyword("");
        setPrimarySortDirection(null);
        setCurrentPage(1);
        GetServiceCategoryListData(1, null, null, null);
      } else {
        GetServiceCategoryListData(currentPage);
      }
      setIsAddUpdateActionDone(false);
    }
  }, [isAddUpdateActionDone]);

  // C] Calling All Api's like List and other Here :
  // 1) Get Service Category List Data
  const GetServiceCategoryListData = async (
    i,
    searchKeywordValue,
    sortValue,
    ServiceSortType,
  ) => {
    setLoader(true);
    const pageNoList = i - 1;

    try {
      const data = await GetServiceCategoryList({
        pageSize: pageSize,
        pageNo: pageNoList,
        organisationKeyID: common.organisationKeyID,
        searchKeyword:
          searchKeywordValue === undefined ? searchKeyword : searchKeywordValue,
        primarySortDirection:
          sortValue === undefined ? primarySortDirection : sortValue,
        PrimarySortColumnName:
          sortType == "" ? ServiceSortType : sortType || null,
      });

      if (data) {
        if (data?.data?.statusCode === 200) {
          setLoader(false);
          getServiceCategoryListApiCallCount = 0;
          if (data?.data?.responseData?.data) {
            const totalCount = data.data.totalCount;
            const ServiceCategoryListData = data.data.responseData.data;

            if (pageNoList > 0 && ServiceCategoryListData.length === 0) {
              let newPaneNo = Number(pageNoList);
              if (newPaneNo > 1) {
                newPaneNo = newPaneNo - 1;
              }
              GetServiceCategoryListData(
                newPaneNo,
                searchKeywordValue,
                sortValue,
                ServiceSortType,
              );
              setCurrentPage(pageNoList);
              return;
            }

            setListCount(totalCount);
            setServiceCategoryList(ServiceCategoryListData);
            setTotalRecords(ServiceCategoryListData.length);
          }
        } else {
          if (getServiceCategoryListApiCallCount < maxCountToRecallApi) {
            getServiceCategoryListApiCallCount += 1;
            setTimeout(function () {
              GetServiceCategoryListData(
                i,
                searchKeywordValue,
                sortValue,
                ServiceSortType,
              );
            }, 2000);
          } else {
            setLoader(false);
          }

          setErrorMessage(data?.data?.errorMessage);
        }
      }
    } catch (error) {
      setLoader(false);
      console.log(error);
    }
  };

  // E] Event Handling Functions will call here.
  // 1) On Click Service Category Add Button
  const ServiceCategoryAddBtnClicked = (serviceCategory) => {
    {
      setModelRequestData({
        ...modelRequestData,
        serviceCatKeyID: null,
        Action: null,
      });
    }
  };
  // 2) On Click Service Category Edit Button
  const ServiceCategoryEditBtnClicked = async (serviceCategory, type) => {
    if (type === "editPredefined") {
      setLoader(true);
      const data = await GetServiceCategoryModel(
        serviceCategory.serviceCatKeyID,
        true,
      );
      if (data?.data?.statusCode === 200) {
        setLoader(false);
        $("#" + "addUpdateModal").modal("show");
        setModelRequestData({
          ...modelRequestData,
          serviceCatKeyID: serviceCategory.serviceCatKeyID,
          Action: "Update",
          Type: true,
          moduleName: moduleName,
        });
      } else {
        setLoader(false);
        setErrorMessage(data?.response?.data?.errorMessage);
        setOpenErrorModal(true);
      }
    } else {
      setModelRequestData({
        ...modelRequestData,
        serviceCatKeyID: serviceCategory.serviceCatKeyID,
        Action: "Update",
        Type: null,
      });
    }
  };

  // Copy Service Category
  const CopyServiceCategoryData = async () => {
    if (!common.userKeyID) return;
    try {
      setLoader(true);
      const data = await CopyServiceCategory(
        modelRequestData.serviceCatKeyID,
        common.userKeyID,
      );
      if (data?.data?.statusCode === 200) {
        setLoader(false);
        $("#" + "ConfirmModel").one("hidden.bs.modal", () => {
          setOpenSuccessModal(true);
        });
        $("#" + "ConfirmModel").modal("hide");
        GetServiceCategoryListData(currentPage);
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
  // 2) On Click Service Category Status Button
  const ServiceCategoryChangeStatusDataAndDeleteData = async () => {
    setLoader(true);
    if (modelRequestData.Action === "Status") {
      try {
        const Data = await ServiceCategoryChangeStatus(
          modelRequestData.serviceCatKeyID,
          modelRequestData.userKeyID,
        );
        if (Data) {
          setLoader(false);
          if (Data?.data?.statusCode === 200) {
            if (
              Data?.data?.responseData.serviceCategoryExistsinServices
                .length !== 0
            ) {
              const servicePackageNames =
                Data?.data?.responseData.serviceCategoryExistsinServices.map(
                  (item) => item.serviceName,
                );
              setModelRequestData({
                ...modelRequestData,
                Action: "ServiceCategoriesWarning",
                message: `Following services are assigned to the selected ${moduleName.toLowerCase()}. You must remove the services from this ${moduleName.toLowerCase()} before attempting to mark it as InActive.`,
                ServiceName: servicePackageNames,
              });
              $("#" + "ConfirmModel").modal("hide");
              $("#" + "RecordsAvailablePopupModel").modal("show");
              GetServiceCategoryListData(currentPage);
            } else {
              GetServiceCategoryListData(currentPage);
              $("#" + "ConfirmModel").one("hidden.bs.modal", () => {
                setOpenSuccessModal(true);
              });
              $("#" + "ConfirmModel").modal("hide");
            }
          } else {
            setErrorMessage(Data?.response?.data?.errorMessage);
            setOpenErrorModal(true);
            GetServiceCategoryListData(currentPage);
          }
        }
        GetServiceCategoryListData(currentPage);
      } catch (error) {
        console.log(error);
      }
    } else if (modelRequestData.Action === "Delete") {
      try {
        const Data = await DeleteServiceCategory(
          modelRequestData.serviceCatKeyID,
          modelRequestData.userKeyID,
        );
        if (Data) {
          setLoader(false);
          if (Data?.data?.statusCode === 200) {
            if (
              Data?.data?.responseData.serviceCategoryExistsinServices
                .length !== 0
            ) {
              const servicePackageNames =
                Data?.data?.responseData.serviceCategoryExistsinServices.map(
                  (item) => item.serviceName,
                );
              setModelRequestData({
                ...modelRequestData,
                Action: "ServiceCategoriesWarning",
                message: `Following services are assigned to the selected ${moduleName.toLowerCase()}. You must remove the services from this ${moduleName.toLowerCase()} before attempting to mark it as InActive.`,
                ServiceName: servicePackageNames,
              });
              $("#" + "ConfirmModel").modal("hide");
              $("#" + "RecordsAvailablePopupModel").modal("show");
              GetServiceCategoryListData(currentPage);
            } else {
              GetServiceCategoryListData(currentPage);
              $("#" + "ConfirmModel").one("hidden.bs.modal", () => {
                setOpenSuccessModal(true);
              });
              $("#" + "ConfirmModel").modal("hide");
            }
          } else {
            setErrorMessage(Data?.response?.data?.errorMessage);
            setOpenErrorModal(true);
          }
          GetServiceCategoryListData(currentPage);
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  // F] Pagination :
  const handlePageChange = async (pageNumber) => {
    setCurrentPage(pageNumber);
    await GetServiceCategoryListData(pageNumber); // Call your function with the selected page number
  };

  // E] Sorting & handle Function
  const handleSort = (sortValue, ServiceSortType) => {
    if (ServiceSortType == "ServiceCatName") {
      setPrimarySortDirection(sortValue);
      setPrimarySortDirectionObj({
        ...primarySortDirectionObj,
        ServiceNameSort: sortValue,
      });
      setCurrentPage(1);
      GetServiceCategoryListData(1, searchKeyword, sortValue, ServiceSortType);
    } else if (ServiceSortType == "ProfessionType") {
      setPrimarySortDirection(sortValue);
      setPrimarySortDirectionObj({
        ...primarySortDirectionObj,
        ProfessionTypeSort: sortValue,
      });
      setCurrentPage(1);
      GetServiceCategoryListData(1, searchKeyword, sortValue, ServiceSortType);
    }
  };

  //handle Search
  const handleSearch = (e) => {
    const searchKeywordValue = e.target.value;
    setSearchKeyword(searchKeywordValue);
    setCurrentPage(1);
    GetServiceCategoryListData(1, searchKeywordValue);
  };
  // handle Close
  const handleClose = () => {
    $("#" + "ConfirmModel").modal("hide");
    $("#" + "RecordsAvailablePopupModel").modal("hide");
    setOpenSuccessModal(false);
    setOpenErrorModal(false);
  };

  //Design part :
  const canAdd =
    (userAccessData.Admin_Config_ServiceCat_CanAdd &&
      common.organisationKeyID !== null) ||
    (userAccessData.SuperAdmin_Config_ServiceCat_CanAdd &&
      common.organisationKeyID === null);

  const canEdit =
    (userAccessData.Admin_Config_ServiceCat_CanEdit &&
      common.organisationKeyID !== null) ||
    (userAccessData.SuperAdmin_Config_ServiceCat_CanEdit &&
      common.organisationKeyID === null);

  const canDelete =
    (userAccessData.Admin_Config_ServiceCat_CanDelete &&
      common.organisationKeyID !== null) ||
    (userAccessData.SuperAdmin_Config_ServiceCat_CanDelete &&
      common.organisationKeyID === null);

  return (
    <>
      <div className="service-category-redesign">
        <div className="service-category-page">
          {/* =========================
              PAGE HEADER
              ========================= */}
          <div className="service-category-page-header">
            <div>
              <h1 className="service-category-page-title">
                Service Categories
              </h1>
              <p className="service-category-page-subtitle">
                Manage service categories, profession mapping and availability.
              </p>
            </div>

            {canAdd && (
              <div className="service-category-add-action">
                <CommonButtonComponent
                  title={getCrudButtonToolTipName("Add", moduleName)}
                  dataBsTarget="#addUpdateModal"
                  data_bs_toggle="modal"
                  name={getCrudButtonTextName("Add", moduleName)}
                  AddBtn={() => ServiceCategoryAddBtnClicked()}
                />
              </div>
            )}
          </div>

          {/* =========================
              LIST CARD
              ========================= */}
          <section className="service-category-list-card">
            {/* Toolbar */}
            <div className="service-category-toolbar">
              <div className="service-category-search-wrap">
                <i className="ri-search-line service-category-search-icon"></i>

                <input
                  type="text"
                  value={searchKeyword}
                  onChange={handleSearch}
                  className="service-category-search-input"
                  placeholder={
                    isMobile
                      ? "Search"
                      : getPlaceholderTextName("Search", moduleName)
                  }
                />
              </div>

              {/* <div className="service-category-record-count">
                {listCount > 0
                  ? `${listCount} ${
                      listCount === 1 ? "category" : "categories"
                    }`
                  : ""}
              </div> */}
            </div>

            {/* Table */}
            <div className="service-category-table-wrap">
              <table className="service-category-table" id="customerTable">
                <thead>
                  <tr>
                    <th>
                      <button
                        type="button"
                        className="service-category-sort-button"
                        onClick={() => {
                          setSortType("ServiceCatName");
                          handleSort(
                            primarySortDirectionObj.ServiceNameSort === null
                              ? "asc"
                              : primarySortDirectionObj.ServiceNameSort ===
                                  "asc"
                                ? "desc"
                                : "asc",
                            "ServiceCatName",
                          );
                        }}
                      >
                        <span>Service Category</span>
                        <i
                          className={
                            primarySortDirectionObj.ServiceNameSort === "desc"
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
                          className="service-category-sort-button"
                          onClick={() => {
                            setSortType("ProfessionType");
                            handleSort(
                              primarySortDirectionObj.ProfessionTypeSort ===
                                null
                                ? "asc"
                                : primarySortDirectionObj.ProfessionTypeSort ===
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
                              primarySortDirectionObj.ProfessionTypeSort ===
                              "desc"
                                ? "ri-arrow-up-line"
                                : "ri-arrow-down-line"
                            }
                          ></i>
                        </button>
                      </th>
                    )}

                    <th>Status</th>

                    {(canEdit || canDelete) && (
                      <th className="service-category-actions-heading">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>

                <tbody>
                  {serviceCategoryList
                    ?.slice(0, isMobile ? isMobileRecords : desktopRecords)
                    .map((serviceCategory) => {
                      const formattedName =
                        serviceCategory.serviceCatName?.replace(/\b\w/g, (l) =>
                          l.toUpperCase(),
                        ) || "-";

                      const statusClass = (serviceCategory.statusName || "")
                        .toLowerCase()
                        .replace(/\s+/g, "-");

                      return (
                        <tr
                          className="service-category-table-row"
                          key={serviceCategory.serviceCatKeyID}
                        >
                          <td>
                            <div className="service-category-name-cell">
                              {/* <span className="service-category-icon">
                                <i className="ri-stack-line"></i>
                              </span> */}

                              <div className="service-category-name-copy">
                                <div className="service-category-name-line">
                                  {serviceCategory.notifySAChanges !== null &&
                                    common.organisationKeyID !== null && (
                                      <Tooltip title="View System Administrator Changes">
                                        <button
                                          type="button"
                                          className="service-category-notification"
                                          onClick={() =>
                                            ServiceCategoryEditBtnClicked(
                                              serviceCategory,
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
                                      serviceCategory.serviceCatName?.length >
                                      50
                                        ? serviceCategory.serviceCatName
                                        : ""
                                    }
                                  >
                                    <span className="service-category-primary-text">
                                      {isMobile && formattedName.length > 24
                                        ? `${formattedName.substring(0, 24)}...`
                                        : !isMobile && formattedName.length > 50
                                          ? `${formattedName.substring(
                                              0,
                                              50,
                                            )}...`
                                          : formattedName}
                                    </span>
                                  </Tooltip>
                                </div>
                              </div>
                            </div>
                          </td>

                          {showProfessionType && (
                            <td>
                              <span
                                className="service-category-profession-chip"
                                title={serviceCategory.professionTypeNames}
                              >
                                {serviceCategory.professionTypeNames || "-"}
                              </span>
                            </td>
                          )}

                          <td>
                            <div className="service-category-status-control">
                              <span
                                className={`service-category-status-badge service-category-status-badge--${statusClass}`}
                              >
                                <span className="service-category-status-dot"></span>
                                {serviceCategory.statusName || "-"}
                              </span>

                              {canDelete && (
                                <Tooltip
                                  title={getCrudButtonToolTipName(
                                    "Change Status",
                                  )}
                                >
                                  <FormGroup>
                                    <FormControlLabel
                                      className="service-category-switch-label"
                                      control={
                                        <Android12Switch
                                          onClick={() =>
                                            setModelRequestData({
                                              ...modelRequestData,
                                              status:
                                                serviceCategory.statusName,
                                              serviceCatKeyID:
                                                serviceCategory.serviceCatKeyID,
                                              userKeyID: common.userKeyID,
                                              Action: "Status",
                                            })
                                          }
                                          checked={
                                            serviceCategory.statusName ===
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
                            <td className="service-category-actions-cell">
                              <div className="service-category-row-actions">
                                <Tooltip
                                  title={getCrudButtonToolTipName(
                                    "Copy",
                                    moduleName,
                                  )}
                                >
                                  <button
                                    type="button"
                                    className="service-category-action-button service-category-action-button--copy"
                                    data-bs-toggle="modal"
                                    data-bs-target="#ConfirmModel"
                                    onClick={() =>
                                      setModelRequestData({
                                        ...modelRequestData,
                                        serviceCatName:
                                          serviceCategory.serviceCatName,
                                        Action: "Copy",
                                        serviceCatKeyID:
                                          serviceCategory.serviceCatKeyID,
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
                                      className="service-category-action-button service-category-action-button--edit"
                                      data-bs-toggle="modal"
                                      data-bs-target="#addUpdateModal"
                                      onClick={() =>
                                        ServiceCategoryEditBtnClicked(
                                          serviceCategory,
                                        )
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
                                      className="service-category-action-button service-category-action-button--delete"
                                      data-bs-toggle="modal"
                                      data-bs-target="#ConfirmModel"
                                      onClick={() =>
                                        setModelRequestData({
                                          ...modelRequestData,
                                          serviceCatKeyID:
                                            serviceCategory.serviceCatKeyID,
                                          serviceCatName:
                                            serviceCategory.serviceCatName,
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

              {totalRecords <= 0 && (
                <div className="service-category-empty-state">
                  <NoResultFoundModel
                    name={moduleName}
                    totalRecords={totalRecords}
                  />
                </div>
              )}
            </div>

            {/* Pagination */}
            {listCount > pageSize && (
              <div className="service-category-pagination-wrap">
                <PaginationComponent
                  totalCount={listCount}
                  totalPages={totalPage}
                  desktopRecords={desktopRecords}
                  currentPage={currentPage}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </section>
        </div>

        {/* =========================
            EXISTING MODALS
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
              ? ServiceCategoryChangeStatusDataAndDeleteData
              : CopyServiceCategoryData
          }
        />

        <RecordsAvailablePopupModel
          handleClose={handleClose}
          openErrorModal={openErrorModal}
          openSuccessModal={openSuccessModal}
          modelRequestData={modelRequestData}
          UpdatedStatus={ServiceCategoryChangeStatusDataAndDeleteData}
        />

        <SuccessModal
          handleClose={handleClose}
          setOpenSuccessModal={setOpenSuccessModal}
          openSuccessModal={openSuccessModal}
          modelAction={modelRequestData.Action}
          message={`${
            modelRequestData.Action === "Delete"
              ? `${moduleName} ${modelRequestData.serviceCatName}`
              : modelRequestData.Action === "Copy"
                ? `Copy of ${modelRequestData.serviceCatName} has been created successfully!`
                : "Status has been changed successfully!"
          }`}
        />

        <ServicesCategoriesModel
          class="modal fade"
          id="addUpdateModal"
          tabIndex="-1"
          aria_labelledby="exampleModalLabel"
          aria_hidden="true"
          setIsAddUpdateActionDone={setIsAddUpdateActionDone}
          modelRequestData={modelRequestData}
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

export default Service_Categories;
