/* global $ */
import React, { useContext, useEffect, useState } from "react";
import "./Package.css";
import "./Package-redesign.css";
import CommonButtonComponent from "../../../components/CommonButtonComponent";
import { useNavigate } from "react-router";
import Android12Switch from "../../../components/AndroidSwitch";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Tooltip, { tooltipClasses } from "@mui/material/Tooltip";
import { AuthContextProvider } from "../../../AuthContext/AuthContext";
import { useDispatch, useSelector } from "react-redux";
import {
  CopyPackage,
  GetPackageList,
  GetServicePackageModel,
  ServicePackageChangeStatus,
  ServicePackageDelete,
} from "../../../redux/Services/Config/PackageApi";
import PaginationComponent from "../../../components/PaginationModel";
import NoResultFoundModel from "../../../components/NoResultFoundModel";
import ErrorModel from "../../../components/ErrorModel";
import ConfirmModel from "../../../components/ConfirmationBox";
import SuccessModal from "../../../components/SuccessModal";
import Footer from "../../../components/Footer";
import RecordsAvailablePopupModel from "../../../components/RecordsAvailablePopupModel";
import { updateState } from "../../../redux/Persist";
import FilterModel from "../../../components/FilterModel";
import { Funnel } from "lucide-react";
const Predefined_Package = () => {
  const moduleName = "Package";
  const dispatch = useDispatch();
  //A]Declare state
  const common = useSelector((state) => state.Storage); //Getting Logged Users Details From Persist Storage of redux hooks
  const navigate = useNavigate();
  const [openSuccessModal, setOpenSuccessModal] = React.useState(false);
  const [totalRecords, setTotalRecords] = useState(-1);
  const {
    setLoader,
    setTopbar,
    isMobile,
    setListCount,
    listCount,
    desktopRecords,
    isMobileRecords,
    getCrudButtonTextName,
    getPlaceholderTextName,
    getCrudButtonToolTipName,
    userAccessData,
    EngagementName,
    proposalName,
    handleErrorMessage,
    formatValue,
  } = useContext(AuthContextProvider);

  const [PackagesList, setPackageList] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [businessNatureID, setBusinessNatureID] = useState(null);
  const [prospectType, setProspectType] = useState(null);
  const [isFilterApply, setIsFilterApply] = useState(false);
  const [isAddUpdateActionDone, setIAddUpdateActionDone] = useState(false);
  const [currentPage, setCurrentPage] = useState(
    common.currentPage === "" ? 1 : common.currentPage,
  );
  const [openErrorModal, setOpenErrorModal] = useState(false);
  const [modelRequestData, setModelRequestData] = useState({
    servicePackageKeyID: null,
    servicePackageName: null,
    status: null,
    Action: "",
    userKeyID: null,
    Type: null,
  });
  const formattedErrorMessage = handleErrorMessage(errorMessage);
  const [primarySortDirection, setPrimarySortDirection] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [showProfessionType, setShowProfessionType] = useState(
    common.organisationKeyID === null || common.professionTypeLists.length > 1,
  );
  const pageSize = isMobile ? isMobileRecords : desktopRecords;
  const isCurrentPage =
    common.currentPage === "" ? currentPage : common.currentPage;
  // B] Initial useEffect :
  // 1) Will Call Initial Api Like List Api
  useEffect(() => {
    setTopbar("block");
    GetPackageListData(isCurrentPage);

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
        GetPackageListData(isCurrentPage, null, null);
      } else {
        GetPackageListData(isCurrentPage);
      }
      setIAddUpdateActionDone(false);
    }
  }, [isAddUpdateActionDone]);

  useEffect(() => {
    if (modelRequestData.Action === "Add") {
      setTopbar("none");
      navigate("/add-update-package", { state: modelRequestData });
    } else if (
      modelRequestData.servicePackageKeyID !== null &&
      modelRequestData.Action === "Update"
    ) {
      setTopbar("none");
      navigate("/add-update-package", { state: modelRequestData });
    }
  }, [modelRequestData.Action]);

  // C] Calling All Api's like List and other Here :
  // 1) Get Package List Data
  const GetPackageListData = async (
    i,
    searchKeywordValue,
    sortValue,
    businessNatureId,
    businessTypeId,
  ) => {
    setLoader(true);
    const pageNoList = i - 1;
    try {
      const data = await GetPackageList({
        pageSize: Number(pageSize) - 1,
        pageNo: pageNoList,
        organisationID: common.organisationID,
        organisationKeyID: common.organisationKeyID,
        SearchKeyword:
          searchKeywordValue === undefined ? searchKeyword : searchKeywordValue,
        primarySortDirection:
          sortValue === undefined ? primarySortDirection : sortValue,
        businessTypeID:
          businessTypeId === undefined ? prospectType : businessTypeId,
        businessNatureID:
          businessNatureId === undefined ? businessNatureID : businessNatureId,
      });
      if (data) {
        setLoader(false);
        if (data?.data?.statusCode === 200) {
          if (data?.data?.responseData?.data) {
            const totalCount = data.data.totalCount;
            const PackageListData = data.data.responseData.data;
            if (pageNoList > 0 && PackageListData.length === 0) {
              let newPaneNo = Number(pageNoList);
              if (newPaneNo > 1) {
                newPaneNo = newPaneNo - 1;
              }
              GetPackageListData(newPaneNo, searchKeywordValue, sortValue);
              setCurrentPage(pageNoList);
              return;
            }
            const modifiedPackage = PackageListData.map((item) => ({
              ...item,
              recurringOriginalPrice: formatValue(item.recurringOriginalPrice),
              recurringDefaultPrice: formatValue(item.recurringDefaultPrice),
              recurringMinPrice: formatValue(item.recurringMinPrice),
              oneOffOriginalPrice: formatValue(item.oneOffOriginalPrice),
              oneOffDefaultPrice: formatValue(item.oneOffDefaultPrice),
              oneOffMinPrice: formatValue(item.oneOffMinPrice),
            }));
            setListCount(totalCount);
            setPackageList(modifiedPackage);
            setTotalRecords(modifiedPackage.length);
          }
        } else {
          setErrorMessage(data?.data?.errorMessage);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Update Function Modal
  // 2) On Click Package Status Button
  const PackageChangeStatusDataAndDeleteData = async () => {
    setLoader(true);
    if (modelRequestData.Action === "Status") {
      try {
        const Data = await ServicePackageChangeStatus(
          modelRequestData.servicePackageKeyID,
          modelRequestData.userKeyID,
        );
        if (Data) {
          setLoader(false);
          if (Data?.data?.statusCode === 200) {
            if (
              Data?.data?.responseData.servicePackageExistsInQuotes.length !== 0
            ) {
              const servicePackageNames =
                Data?.data?.responseData.servicePackageExistsInQuotes.map(
                  (item) => item.quoteName,
                );
              setModelRequestData({
                ...modelRequestData,
                Action: "PackageListWarning",
                message: `Following ${proposalName}/${EngagementName} are assigned to the selected ${moduleName}.You must remove the ${proposalName}/${EngagementName} from this ${moduleName} before attempting to mark it as InActive.`,
                ServiceName: servicePackageNames,
              });
              $("#" + "ConfirmModel").modal("hide");
              $("#" + "RecordsAvailablePopupModel").modal("show");
              GetPackageListData(isCurrentPage);
            } else {
              GetPackageListData(isCurrentPage);
              $("#" + "ConfirmModel").one("hidden.bs.modal", () => {
                setOpenSuccessModal(true);
              });
              $("#" + "ConfirmModel").modal("hide");
            }
          } else {
            setErrorMessage(Data?.response?.data?.errorMessage);
            setOpenErrorModal(true);
          }
          GetPackageListData(currentPage);
        }
      } catch (error) {
        console.log(error);
      }
    } else if (modelRequestData.Action === "Delete") {
      try {
        const Data = await ServicePackageDelete(
          modelRequestData.servicePackageKeyID,
          modelRequestData.userKeyID,
        );
        if (Data) {
          setLoader(false);
          if (Data?.data?.statusCode === 200) {
            if (
              Data?.data?.responseData.servicePackageExistsInQuotes.length !== 0
            ) {
              const servicePackageNames =
                Data?.data?.responseData.servicePackageExistsInQuotes.map(
                  (item) => item.serviceName,
                );
              setModelRequestData({
                ...modelRequestData,
                Action: "PackageListWarning",
                message: `Following ${proposalName}/${EngagementName} are assigned to the selected ${moduleName}.You must remove the ${proposalName}/${EngagementName} from this ${moduleName} before attempting to mark it as InActive.`,
                ServiceName: servicePackageNames,
              });
              $("#" + "ConfirmModel").modal("hide");
              $("#" + "RecordsAvailablePopupModel").modal("show");
              GetPackageListData(isCurrentPage);
            } else {
              GetPackageListData(isCurrentPage);
              $("#" + "ConfirmModel").one("hidden.bs.modal", () => {
                setOpenSuccessModal(true);
              });
              $("#" + "ConfirmModel").modal("hide");
            }
          } else {
            setErrorMessage(Data?.response?.data?.errorMessage);
            setOpenErrorModal(true);
          }
          GetPackageListData(currentPage);
        }
      } catch (error) {
        console.log(error);
      }
    } else if (modelRequestData.Action === "Copy") {
      try {
        const CopyPackageData = await CopyPackage(
          modelRequestData.servicePackageKeyID,
          modelRequestData.userKeyID,
        );
        if (CopyPackageData.data.statusCode === 200) {
          setLoader(false);
          $("#" + "ConfirmModel").one("hidden.bs.modal", () => {
            setOpenSuccessModal(true);
          });
          $("#" + "ConfirmModel").modal("hide");
          GetPackageListData(currentPage);
        }
      } catch (error) {
        setLoader(false);
        console.log(error);
      }
    }
  };

  //E] Update Function Modal
  // 1) On Click Service Category Add Button
  const PackageAddBtnClicked = () => {
    {
      setModelRequestData({
        ...modelRequestData,
        servicePackageKeyID: null,
        Action: "Add",
      });
    }
    setTopbar("none");
  };
  // 2) On Click Package Edit Button
  const PackageEditBtnClicked = async (Package, type) => {
    if (type === "editPredefined") {
      setLoader(true);
      const data = await GetServicePackageModel(
        Package.servicePackageKeyID,
        true,
      );
      if (data?.data?.statusCode === 200) {
        setLoader(false);

        setModelRequestData({
          ...modelRequestData,
          servicePackageName: Package.servicePackageName,
          servicePackageKeyID: Package.servicePackageKeyID,
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
      dispatch(
        updateState({
          currentPage: currentPage,
        }),
      );
      setModelRequestData({
        ...modelRequestData,
        servicePackageName: Package.servicePackageName,
        servicePackageKeyID: Package.servicePackageKeyID,
        Action: "Update",
        Type: null,
      });
    }
  };

  // F] Pagination :
  const handlePageChange = async (pageNumber) => {
    setCurrentPage(pageNumber);
    await GetPackageListData(pageNumber); // Call your function with the selected page number
  };

  // G] Sorting & Handle Function:
  const handleSort = (sortValue) => {
    setPrimarySortDirection(sortValue);
    setCurrentPage(1);
    GetPackageListData(isCurrentPage, searchKeyword, sortValue);
  };
  //Handle Search
  const handleSearch = (e) => {
    const searchKeywordValue = e.target.value;
    setSearchKeyword(searchKeywordValue);
    setCurrentPage(1);
    GetPackageListData(isCurrentPage, searchKeywordValue);
  };
  // handle Close
  const handleClose = () => {
    $("#" + "ConfirmModel").modal("hide");
    $("#" + "RecordsAvailablePopupModel").modal("hide");
    if (openErrorModal && formattedErrorMessage.includes("default state")) {
      GetPackageListData(
        currentPage,
        searchKeyword,
        primarySortDirection,
        businessNatureID,
        prospectType,
      );
    }
    setOpenSuccessModal(false);
    setOpenErrorModal(false);
  };
  //Apply Filter
  const ApplyFilter = () => {
    if (
      (businessNatureID !== null && businessNatureID !== "") ||
      (prospectType !== null && prospectType !== "")
    ) {
      setIsFilterApply(true);
    } else {
      setIsFilterApply(false);
    }
    GetPackageListData(
      1,
      searchKeyword,
      primarySortDirection,
      businessNatureID,
      prospectType,
    );
  };
  const ClearFilter = () => {
    setIsFilterApply(false);
    setBusinessNatureID(null);
    setProspectType(null);
    GetPackageListData(1, searchKeyword, primarySortDirection, null, null);
  };

  const canAdd =
    (userAccessData.Admin_Config_ServicePackage_CanAdd &&
      common.organisationKeyID !== null) ||
    (userAccessData.SuperAdmin_Config_ServicePackage_CanAdd &&
      common.organisationKeyID === null);

  const canEdit =
    (userAccessData.Admin_Config_ServicePackage_CanEdit &&
      common.organisationKeyID !== null) ||
    (userAccessData.SuperAdmin_Config_ServicePackage_CanEdit &&
      common.organisationKeyID === null);

  const canDelete =
    (userAccessData.Admin_Config_ServicePackage_CanDelete &&
      common.organisationKeyID !== null) ||
    (userAccessData.SuperAdmin_Config_ServicePackage_CanDelete &&
      common.organisationKeyID === null);

  return (
    <>
      <div className="package-redesign">
        <div className="package-page">
          {/* =========================
              PAGE HEADER
              ========================= */}
          <div className="package-page-header">
            <div>
              <h1 className="package-page-title">Packages</h1>
              <p className="package-page-subtitle">Manage package pricings.</p>
            </div>

            {canAdd && (
              <div className="package-add-action">
                <CommonButtonComponent
                  title={getCrudButtonToolTipName("Add", moduleName)}
                  name={getCrudButtonTextName("Add", moduleName)}
                  AddBtn={() => PackageAddBtnClicked()}
                />
              </div>
            )}
          </div>

          {/* =========================
              LIST CARD
              ========================= */}
          <section className="package-list-card">
            {/* Toolbar */}
            <div className="package-toolbar">
              <div className="package-search-wrap">
                <i className="ri-search-line package-search-icon"></i>

                <input
                  type="text"
                  value={searchKeyword}
                  onChange={handleSearch}
                  className="package-search-input"
                  placeholder={
                    isMobile
                      ? "Search"
                      : getPlaceholderTextName("Search", moduleName)
                  }
                />
              </div>

              <div className="package-toolbar-actions">
                <Tooltip title={getCrudButtonToolTipName("Filter", moduleName)}>
                  <button
                    type="button"
                    className={`package-filter-button ${
                      isFilterApply ? "package-filter-button--active" : ""
                    }`}
                    data-bs-toggle="modal"
                    data-bs-target="#FilterModel"
                  >
                    <Funnel size={17} strokeWidth={1.9} className="app-filter-icon" />
                    <span>Filter</span>

                    {isFilterApply && (
                      <span className="package-filter-active-dot"></span>
                    )}
                  </button>
                </Tooltip>

                {isFilterApply && (
                  <Tooltip title="Clear Filter">
                    <button
                      type="button"
                      className="package-clear-filter-button"
                      onClick={ClearFilter}
                    >
                      <i className="ri-close-line"></i>
                      <span>Clear Filter</span>
                    </button>
                  </Tooltip>
                )}

                {/* <span className="package-record-count">
                  {listCount > 0
                    ? `${listCount} ${listCount === 1 ? "package" : "packages"}`
                    : ""}
                </span> */}
              </div>
            </div>

            {/* Table */}
            <div className="package-table-wrap">
              <table
                className={`package-table ${
                  !showProfessionType ? "package-table--no-profession" : ""
                }`}
                id="customerTable"
              >
                <thead>
                  <tr>
                    <th>
                      <button
                        type="button"
                        className="package-sort-button"
                        onClick={() =>
                          handleSort(
                            primarySortDirection === null
                              ? "asc"
                              : primarySortDirection === "asc"
                                ? "desc"
                                : "asc",
                          )
                        }
                      >
                        <span>Name</span>

                        <i
                          className={
                            primarySortDirection === "desc"
                              ? "ri-arrow-up-line"
                              : "ri-arrow-down-line"
                          }
                        ></i>
                      </button>
                    </th>

                    {showProfessionType && <th>Profession Type</th>}

                    <th>Original Price</th>
                    <th>Default Price</th>
                    <th>Minimum Price</th>
                    <th>Status</th>

                    <th className="package-actions-heading">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {PackagesList?.slice(
                    0,
                    isMobile ? isMobileRecords : desktopRecords,
                  ).map((Package) => {
                    const packageName =
                      Package.servicePackageName?.replace(/\b\w/g, (l) =>
                        l.toUpperCase(),
                      ) || "-";

                    const statusClass = (Package.statusName || "")
                      .toLowerCase()
                      .replace(/\s+/g, "-");

                    return (
                      <tr
                        className="package-table-row"
                        key={
                          Package.servicePackageKeyID ||
                          Package.servicePackageName
                        }
                      >
                        <td>
                          <div className="package-name-cell">
                            {/* <span className="package-icon">
                              <i className="ri-box-3-line"></i>
                            </span> */}

                            <div className="package-name-copy">
                              <div className="package-name-line">
                                {Package.notifySAChanges !== null &&
                                  common.organisationKeyID !== null && (
                                    <Tooltip title="View System Administrator Changes">
                                      <button
                                        type="button"
                                        className="package-notification-button"
                                        onClick={() =>
                                          PackageEditBtnClicked(
                                            Package,
                                            "editPredefined",
                                          )
                                        }
                                      >
                                        <i className="ri-notification-3-line"></i>
                                      </button>
                                    </Tooltip>
                                  )}

                                {Package.needToUpdate && (
                                  <span
                                    className="package-update-marker"
                                    title="Update required"
                                  >
                                    *
                                  </span>
                                )}

                                <Tooltip
                                  title={
                                    packageName.length > 45
                                      ? Package.servicePackageName
                                      : ""
                                  }
                                >
                                  <span className="package-primary-text">
                                    {isMobile && packageName.length > 22
                                      ? `${packageName.substring(0, 22)}...`
                                      : !isMobile && packageName.length > 45
                                        ? `${packageName.substring(0, 45)}...`
                                        : packageName}
                                  </span>
                                </Tooltip>
                              </div>
                            </div>
                          </div>
                        </td>

                        {showProfessionType && (
                          <td>
                            <span
                              className="package-profession-chip"
                              title={Package.professionTypeNames}
                            >
                              {Package.professionTypeNames || "-"}
                            </span>
                          </td>
                        )}

                        <td>
                          <div className="package-price-stack">
                            <div>
                              <span>Recurring</span>
                              <strong>{Package.recurringOriginalPrice}</strong>
                            </div>

                            <div>
                              <span>One Off</span>
                              <strong>{Package.oneOffOriginalPrice}</strong>
                            </div>
                          </div>
                        </td>

                        <td>
                          <div className="package-price-stack">
                            <div>
                              <span>Recurring</span>
                              <strong>{Package.recurringDefaultPrice}</strong>
                            </div>

                            <div>
                              <span>One Off</span>
                              <strong>{Package.oneOffDefaultPrice}</strong>
                            </div>
                          </div>
                        </td>

                        <td>
                          <div className="package-price-stack">
                            <div>
                              <span>Recurring</span>
                              <strong>{Package.recurringMinPrice}</strong>
                            </div>

                            <div>
                              <span>One Off</span>
                              <strong>{Package.oneOffMinPrice}</strong>
                            </div>
                          </div>
                        </td>

                        <td>
                          <div className="package-status-control">
                            <span
                              className={`package-status-badge package-status-badge--${statusClass}`}
                            >
                              <span className="package-status-dot"></span>
                              {Package.statusName || "-"}
                            </span>

                            {canDelete && (
                              <Tooltip
                                title={getCrudButtonToolTipName(
                                  "Change Status",
                                )}
                              >
                                <FormGroup>
                                  <FormControlLabel
                                    className="package-switch-label"
                                    control={
                                      <Android12Switch
                                        onClick={() =>
                                          setModelRequestData({
                                            ...modelRequestData,
                                            servicePackageKeyID:
                                              Package.servicePackageKeyID,
                                            status: Package.statusName,
                                            Action: "Status",
                                            userKeyID: common.userKeyID,
                                          })
                                        }
                                        checked={
                                          Package.statusName === "Active"
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

                        <td className="package-actions-cell">
                          <div className="package-row-actions">
                            <Tooltip
                              title={getCrudButtonToolTipName(
                                "Copy",
                                moduleName,
                              )}
                            >
                              <button
                                type="button"
                                className="package-action-button package-action-button--copy"
                                data-bs-toggle="modal"
                                data-bs-target="#ConfirmModel"
                                onClick={() =>
                                  setModelRequestData({
                                    ...modelRequestData,
                                    servicePackageKeyID:
                                      Package.servicePackageKeyID,
                                    servicePackageName:
                                      Package.servicePackageName,
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
                                  className="package-action-button package-action-button--edit"
                                  onClick={() => PackageEditBtnClicked(Package)}
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
                                  className="package-action-button package-action-button--delete"
                                  data-bs-toggle="modal"
                                  data-bs-target="#ConfirmModel"
                                  onClick={() =>
                                    setModelRequestData({
                                      ...modelRequestData,
                                      servicePackageKeyID:
                                        Package.servicePackageKeyID,
                                      servicePackageName:
                                        Package.servicePackageName,
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
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {totalRecords <= 0 && (
                <div className="package-empty-state">
                  <NoResultFoundModel
                    name={moduleName}
                    totalRecords={totalRecords}
                  />
                </div>
              )}
            </div>

            {/* Pagination */}
            {listCount > Number(pageSize) - 1 && (
              <div className="package-pagination-wrap">
                <PaginationComponent
                  totalCount={listCount}
                  totalPages={
                    isMobile
                      ? Math.ceil(listCount / isMobileRecords)
                      : Math.ceil(listCount / (desktopRecords - 1))
                  }
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
          UpdatedStatus={PackageChangeStatusDataAndDeleteData}
        />

        <RecordsAvailablePopupModel
          handleClose={handleClose}
          openErrorModal={openErrorModal}
          openSuccessModal={openSuccessModal}
          modelRequestData={modelRequestData}
          UpdatedStatus={PackageChangeStatusDataAndDeleteData}
        />

        <SuccessModal
          handleClose={handleClose}
          setOpenSuccessModal={setOpenSuccessModal}
          openSuccessModal={openSuccessModal}
          modelAction={modelRequestData.Action}
          message={
            modelRequestData.Action === "Copy"
              ? `The Copy of ${modelRequestData.servicePackageName} has been created successfully!`
              : modelRequestData.Action === "Delete"
                ? `${moduleName} ${modelRequestData.servicePackageName}`
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

export default Predefined_Package;
