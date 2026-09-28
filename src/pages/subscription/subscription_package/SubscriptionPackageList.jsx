/* global $ */
import React, { useState, useEffect, useContext } from "react";
import "./SubscriptionPackage.css";
import "./SubscriptionPackage-redesign.css";
import { useNavigate } from "react-router-dom";
import CommonButtonComponent from "../../../components/CommonButtonComponent";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Android12Switch from "../../../components/AndroidSwitch";
import SubscriptionPackageModel from "./SubscriptionPackageModel";
import ConfirmModel from "../../../components/ConfirmationBox";
import PaginationComponent from "../../../components/PaginationModel";
import Tooltip, { tooltipClasses } from "@mui/material/Tooltip";
import NoResultFoundModel from "../../../components/NoResultFoundModel";
import { useDispatch, useSelector } from "react-redux";
import {
  DeleteSubscriptionPackage,
  GetSubscriptionPackageList,
  SubscriptionPackageChangeStatus,
} from "../../../redux/Services/Subscription/PackageApi";
import { AuthContextProvider } from "../../../AuthContext/AuthContext";
import ErrorModel from "../../../components/ErrorModel";
import SuccessModal from "../../../components/SuccessModal";
import Footer from "../../../components/Footer";
// import { updateState } from "../../../redux/Persist";
import { updateState } from "../../../redux/Persist";
const Subscription_Package = () => {
  const moduleName = "Subscription Package";
  // A] States Declaration :
  const [subscriptionPackageList, setSubscriptionPackageList] = useState([]);
  const [totalRecords, setTotalRecords] = useState(-1);
  const [openSuccessModal, setOpenSuccessModal] = React.useState(false);
  const [openErrorModal, setOpenErrorModal] = useState(false);
  const [modelRequestData, setModelRequestData] = useState({
    isFreePackage: null,
    subscriptionPackageKeyID: null,
    packageName: null,
    status: "",
    Action: "",
    userKeyID: null,
  });
  // const dispatch = useDispatch();
  const [errorMessage, setErrorMessage] = useState("");
  const [isAddUpdateActionDone, setIsAddUpdateActionDone] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  // const totalPage = Math.ceil(listCount / 10); // Calculate the total number of pages based on listCount
  const common = useSelector((state) => state.Storage); //Getting Logged Users Details From Persist Storage of redux hooks
  const [primarySortDirection, setPrimarySortDirection] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState("");
  const {
    setLoader,
    setTopbar,
    userAccessData,
    maxCountToRecallApi,
    totalPage,
    isMobile,
    setListCount,
    listCount,
    desktopRecords,
    isMobileRecords,
    handleErrorMessage,
    getPlaceholderTextName,
    formatValue,
  } = useContext(AuthContextProvider);
  let getServiceCategoryListApiCallCount = 0;

  const pageSize = isMobile ? isMobileRecords : desktopRecords;
  const formattedErrorMessage = handleErrorMessage(errorMessage);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isEditAction, setIsEditAction] = useState(false);
  // B] Initial useEffect :
  // 1) Will Call Initial Api Like List Api
  useEffect(() => {
    setTopbar("block");
    GetSubscriptionPackageListData(1);
  }, []);

  //2) This useEffect will trigger when we successfully add or update record from popup model
  useEffect(() => {
    if (isAddUpdateActionDone) {
      if (modelRequestData.Action === null) {
        setSearchKeyword("");
        setPrimarySortDirection(null);
        setCurrentPage(1);
        GetSubscriptionPackageListData(1, null, null);
      } else {
        GetSubscriptionPackageListData(currentPage);
      }

      setIsAddUpdateActionDone(false);
    }
  }, [isAddUpdateActionDone]);

  useEffect(() => {
    if (
      modelRequestData.Action === "Update" &&
      modelRequestData.subscriptionPackageKeyID !== null
    ) {
      setTopbar("none");
      navigate("/subscriptionModal", { state: modelRequestData });
    } else if (modelRequestData.Action === null) {
      GetSubscriptionPackageListData(1);
    }
  }, [modelRequestData, navigate]);

  // C] Calling All Api's like List and other Here :
  // 1) Get subscription package List Data
  const GetSubscriptionPackageListData = async (
    i,
    searchKeywordValue,
    sortValue,
  ) => {
    setLoader(true);
    const pageNoList = i - 1;
    try {
      const data = await GetSubscriptionPackageList({
        pageSize: pageSize,
        pageNo: pageNoList,
        searchKeyword:
          searchKeywordValue === undefined ? searchKeyword : searchKeywordValue,
        primarySortDirection:
          sortValue === undefined ? primarySortDirection : sortValue,
      });
      if (data) {
        setLoader(false);
        getServiceCategoryListApiCallCount = 0;
        if (data?.data?.statusCode === 200) {
          if (data?.data?.responseData?.data) {
            const totalCount = data.data.totalCount;
            const SubscriptionPackageListData = data.data.responseData.data;
            if (pageNoList > 0 && SubscriptionPackageListData.length === 0) {
              let newPaneNo = Number(pageNoList);
              if (newPaneNo > 1) {
                newPaneNo = newPaneNo - 1;
              }
              GetSubscriptionPackageListData(
                newPaneNo,
                searchKeywordValue,
                sortValue,
              );
              setCurrentPage(pageNoList);
              return;
            }
            setListCount(totalCount);
            setSubscriptionPackageList(SubscriptionPackageListData);
            setTotalRecords(SubscriptionPackageListData.length);
          }
        } else {
          if (getServiceCategoryListApiCallCount < maxCountToRecallApi) {
            getServiceCategoryListApiCallCount += 1;
            setTimeout(function () {
              GetSubscriptionPackageListData(i, searchKeywordValue, sortValue);
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

  // E] Event Handling Functions will call here.
  // 1) On Click subscription package Add Button
  const SubscriptionPackageAddBtnClicked = () => {
    {
      setModelRequestData({
        ...modelRequestData,
        subscriptionPackageKeyID: null,
        Action: null,
      });
    }
    let addEmailTemplateRequestData = {
      subscriptionPackageKeyID: null,
      packageName: null,
      status: "",
      Action: null,
      userKeyID: null,
    };
    setTopbar("none");
    navigate("/subscriptionModal", { state: addEmailTemplateRequestData });
  };
  // 2) On Click subscription package Edit Button
  const SubscriptionPackageEditBtnClicked = (subscriptionPackage) => {
    // debugger;
    // dispatch(updateState({ currentPage: currentPage }));
    setModelRequestData(() => ({
      ...modelRequestData,
      subscriptionPackageKeyID: subscriptionPackage?.subscriptionPackageKeyID,
      Action: "Update",
      isFreePackage: subscriptionPackage.isFreePackage,
    }));
  };
  const handleChangeStatus = (subscriptionPackage) => {
    setModelRequestData((prevState) => ({
      ...prevState,
      status: subscriptionPackage.statusName,
      subscriptionPackageKeyID: subscriptionPackage.subscriptionPackageKeyID,
      userKeyID: common.userKeyID,
      Action: "Status",
    }));
  };
  // Update Function Modal
  // 2) On Click subscription package Status Button
  const SubscriptionPackageChangeStatusDataAndDeleteData = async () => {
    setLoader(true);
    if (modelRequestData.Action === "Status") {
      try {
        const Data = await SubscriptionPackageChangeStatus(
          modelRequestData.subscriptionPackageKeyID,
          modelRequestData.userKeyID,
        );
        if (Data) {
          setLoader(false);
          if (Data?.data?.statusCode === 200) {
            $("#" + "ConfirmModel").one("hidden.bs.modal", () => {
              setOpenSuccessModal(true);
            });
            $("#" + "ConfirmModel").modal("hide");
          } else {
            setErrorMessage(
              Data?.response?.data?.errors?.SubscriptionPackageKeyID[0],
            );
            setOpenErrorModal(true);
          }
          GetSubscriptionPackageListData(currentPage);
        }
      } catch (error) {
        console.log(error);
      }
    } else if (modelRequestData.Action === "Delete") {
      try {
        const Data = await DeleteSubscriptionPackage(
          modelRequestData.subscriptionPackageKeyID,
          modelRequestData.userKeyID,
        );
        if (Data) {
          setLoader(false);
          if (Data?.data?.statusCode === 200) {
            $("#" + "ConfirmModel").one("hidden.bs.modal", () => {
              setOpenSuccessModal(true);
            });
            $("#" + "ConfirmModel").modal("hide");
          } else {
            setErrorMessage(Data?.response?.data.errorMessage);
            setOpenErrorModal(true);
          }
        }

        GetSubscriptionPackageListData(currentPage);
      } catch (error) {
        console.log(error);
      }
    }
  };

  // F] Pagination :
  const handlePageChange = async (pageNumber) => {
    setCurrentPage(pageNumber);
    await GetSubscriptionPackageListData(pageNumber); // Call your function with the selected page number
  };

  // E] Sorting & handle Function
  const HandleSort = (sortValue) => {
    setPrimarySortDirection(sortValue);
    setCurrentPage(1);
    GetSubscriptionPackageListData(1, searchKeyword, sortValue);
  };
  const HandleSearch = (e) => {
    const searchKeywordValue = e.target.value;
    setSearchKeyword(searchKeywordValue);
    setCurrentPage(1);
    GetSubscriptionPackageListData(1, searchKeywordValue);
  };

  const handleClose = () => {
    $("#" + "ConfirmModel").modal("hide");
    setOpenSuccessModal(false);
    setOpenErrorModal(false);
  };

  return (
    <div className="container-fluid subscription-packages-redesign">
      <div className="subscription-packages-page">
        {/* =========================
            PAGE HEADER
            ========================= */}
        <div className="subscription-packages-page-header">
          <div className="subscription-packages-heading-copy">
            <h1>Subscription Packages</h1>
            <p>Manage package pricing, availability and subscription status.</p>
          </div>

          {userAccessData.SuperAdmin_Config_Subscription_Package_CanAdd && (
            <div className="subscription-packages-header-action">
              <CommonButtonComponent
                title={`Add ${moduleName} `}
                name={`Add ${moduleName} `}
                AddBtn={() => SubscriptionPackageAddBtnClicked()}
              />
            </div>
          )}
        </div>

        {/* =========================
            LIST CARD
            ========================= */}
        <section className="subscription-packages-list-card">
          {/* SEARCH TOOLBAR */}
          <div className="subscription-packages-toolbar">
            <div className="subscription-packages-search-wrap">
              <i className="ri-search-line"></i>

              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => {
                  HandleSearch(e);
                }}
                className="form-control subscription-packages-search-input"
                placeholder={
                  isMobile
                    ? "Search"
                    : getPlaceholderTextName("Search", moduleName)
                }
              />
            </div>

            <div className="subscription-packages-count">
              {/* <span className="subscription-packages-count-icon">
                <i className="ri-box-3-line"></i>
              </span> */}

              <span>Total Packages</span>
              <strong>{listCount > 0 ? listCount : 0}</strong>
            </div>
          </div>

          {/* TABLE */}
          <div className="subscription-packages-table-scroll">
            <table className="subscription-packages-table" id="customerTable">
              <thead>
                <tr>
                  <th className="subscription-package-name-column">
                    <button
                      type="button"
                      className="subscription-packages-sort-btn"
                      onClick={() => {
                        HandleSort(
                          primarySortDirection === null
                            ? "asc"
                            : primarySortDirection === "asc"
                              ? "desc"
                              : "asc",
                        );
                      }}
                    >
                      <span>{moduleName} Name</span>

                      <i
                        className={
                          primarySortDirection === "desc"
                            ? "fas fa-sort-alpha-up"
                            : "fas fa-sort-alpha-down"
                        }
                      ></i>
                    </button>
                  </th>

                  <th>Monthly Price</th>
                  <th>Yearly Price</th>
                  <th>Status</th>

                  <th className="subscription-packages-actions-heading">
                    {(userAccessData.SuperAdmin_Config_Subscription_Package_CanDelete ||
                      userAccessData.SuperAdmin_Config_Subscription_Package_CanEdit) && (
                      <>Actions</>
                    )}
                  </th>
                </tr>
              </thead>

              <tbody>
                {subscriptionPackageList.map((subscriptionPackage) => {
                  return (
                    <tr key={subscriptionPackage.subscriptionPackageKeyID}>
                      {/* PACKAGE NAME */}
                      <td>
                        <div className="subscription-package-name-cell">
                          {/* <span className="subscription-package-icon">
                            <i className="ri-price-tag-3-line"></i>
                          </span> */}

                          <div className="subscription-package-name-copy">
                            <strong>{subscriptionPackage.packageName}</strong>

                            {(subscriptionPackage.isFreePackage ||
                              subscriptionPackage.isFreeAfterTrial) && (
                              <span className="subscription-package-type-badge">
                                {subscriptionPackage.isFreePackage
                                  ? "Free Package"
                                  : "Free After Trial"}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* MONTHLY PRICE */}
                      <td>
                        <span className="subscription-package-price">
                          {formatValue(subscriptionPackage.monthlyPrice)}
                        </span>
                      </td>

                      {/* YEARLY PRICE */}
                      <td>
                        <span className="subscription-package-price">
                          {formatValue(subscriptionPackage.yearlyPrice)}
                        </span>
                      </td>

                      {/* STATUS */}
                      <td>
                        <div className="subscription-package-status-cell">
                          <span
                            className={`subscription-package-status-pill ${
                              subscriptionPackage.statusName === "Active"
                                ? "is-active"
                                : "is-inactive"
                            }`}
                          >
                            {subscriptionPackage.statusName}
                          </span>

                          {userAccessData.SuperAdmin_Config_Subscription_Package_CanEdit && (
                            <Tooltip title={"Change Status"}>
                              <FormGroup>
                                <FormControlLabel
                                  control={
                                    <Android12Switch
                                      disabled={
                                        subscriptionPackage.isFreePackage ||
                                        subscriptionPackage.isFreeAfterTrial
                                      }
                                      onClick={() =>
                                        setModelRequestData((prevState) => ({
                                          ...prevState,
                                          status:
                                            subscriptionPackage.statusName,
                                          subscriptionPackageKeyID:
                                            subscriptionPackage.subscriptionPackageKeyID,
                                          userKeyID: common.userKeyID,
                                          Action: "Status",
                                        }))
                                      }
                                      checked={
                                        subscriptionPackage.statusName ===
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

                      {/* ACTIONS */}
                      <td className="subscription-packages-actions-cell">
                        <div className="subscription-packages-row-actions">
                          {userAccessData.SuperAdmin_Config_Subscription_Package_CanEdit && (
                            <Tooltip title={"Update Subscription Package"}>
                              <button
                                type="button"
                                onClick={() =>
                                  SubscriptionPackageEditBtnClicked(
                                    subscriptionPackage,
                                  )
                                }
                                className="subscription-package-action-btn subscription-package-edit-btn"
                              >
                                <i className="ri-pencil-fill"></i>
                              </button>
                            </Tooltip>
                          )}

                          {userAccessData.SuperAdmin_Config_Subscription_Package_CanDelete &&
                            !(
                              subscriptionPackage.isFreePackage ||
                              subscriptionPackage.isFreeAfterTrial
                            ) && (
                              <Tooltip title={"Delete Subscription Package"}>
                                <button
                                  type="button"
                                  className="subscription-package-action-btn subscription-package-delete-btn"
                                  data-bs-toggle="modal"
                                  data-bs-target="#ConfirmModel"
                                  onClick={() =>
                                    setModelRequestData({
                                      ...modelRequestData,
                                      subscriptionPackageKeyID:
                                        subscriptionPackage.subscriptionPackageKeyID,
                                      packageName:
                                        subscriptionPackage.packageName,
                                      userKeyID: common.userKeyID,
                                      Action: "Delete",
                                    })
                                  }
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
            <div className="subscription-packages-empty-state">
              <NoResultFoundModel
                name={moduleName}
                totalRecords={totalRecords}
              />
            </div>
          )}
        </section>

        {/* PAGINATION OUTSIDE LIST CARD */}
        {listCount > 6 && (
          <div className="subscription-packages-pagination">
            <PaginationComponent
              totalCount={listCount}
              totalPages={totalPage}
              desktopRecords={desktopRecords}
              currentPage={currentPage}
              onPageChange={handlePageChange}
            />
          </div>
        )}

        {/* EXISTING MODALS */}
        <ErrorModel
          ErrorModel={openErrorModal}
          handleClose={handleClose}
          ErrorMessage={formattedErrorMessage}
        />

        <ConfirmModel
          openErrorModal={openErrorModal}
          openSuccessModal={openSuccessModal}
          modelRequestData={modelRequestData}
          UpdatedStatus={SubscriptionPackageChangeStatusDataAndDeleteData}
        />

        <SuccessModal
          handleClose={handleClose}
          setOpenSuccessModal={setOpenSuccessModal}
          openSuccessModal={openSuccessModal}
          modelAction={modelRequestData.Action}
          message={`${
            modelRequestData.Action === "Delete"
              ? `Subscription package ${modelRequestData.packageName}`
              : "Status has been changed successfully!"
          }`}
        />

        {/* Modal */}
        {/* <SubscriptionPackageModel
          class="modal fade"
          id="addUpdateModal"
          tabIndex="-1"
          aria_labelledby="exampleModalLabel"
          aria_hidden="true"
          setIsAddUpdateActionDone={setIsAddUpdateActionDone}
          modelRequestData={modelRequestData}
        /> */}
      </div>

      {/* start back-to-top */}
      <button
        onclick="topFunction()"
        className="btn btn-danger btn-icon"
        id="back-to-top"
      >
        <i className="ri-arrow-up-line"></i>
      </button>
      {/* end back-to-top */}

      <div className="subscription-packages-footer-wrap">
        <Footer />
      </div>
    </div>
  );
};

export default Subscription_Package;
