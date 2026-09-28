/* global $ */
import React, { useState, useEffect, useContext } from "react";
import "./SubscriptionPackage.css";
import "./PdfToCsvSubscription-redesign.css";
import { useNavigate } from "react-router-dom";
import CommonButtonComponent from "../../../components/CommonButtonComponent";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Android12Switch from "../../../components/AndroidSwitch";
// import SubscriptionPackageModel from "./SubscriptionPackageModel";
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
import { getPDFToCSVSubscriptionPackageList } from "../../../redux/Services/PDFToCSVAPI/PDFToCSVAPI";
const PdfToCsvSubscription_Package = () => {
  const moduleName = "PDF To CSV Subscription Package";
  // A] States Declaration :
  const [subscriptionPackageList, setSubscriptionPackageList] = useState([]);
  const [totalRecords, setTotalRecords] = useState(-1);
  const [openSuccessModal, setOpenSuccessModal] = React.useState(false);
  const [openErrorModal, setOpenErrorModal] = useState(false);
  const [modelRequestData, setModelRequestData] = useState({
    pcspKeyID: null,
    Action: null,
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
    GetPDFToCSVSubscriptionPackageListData(1);
  }, []);

  //2) This useEffect will trigger when we successfully add or update record from popup model
  useEffect(() => {
    if (isAddUpdateActionDone) {
      if (modelRequestData.Action === null) {
        setSearchKeyword("");
        setPrimarySortDirection(null);
        setCurrentPage(1);
        GetPDFToCSVSubscriptionPackageListData(1, null, null);
      } else {
        GetPDFToCSVSubscriptionPackageListData(currentPage);
      }

      setIsAddUpdateActionDone(false);
    }
  }, [isAddUpdateActionDone]);

  useEffect(() => {
    if (
      modelRequestData.Action === "Update" &&
      modelRequestData.pcspKeyID !== null
    ) {
      setTopbar("none");
      navigate("/pdf-csv-subscriptionModal", { state: modelRequestData });
    } else if (modelRequestData.Action === null) {
      GetPDFToCSVSubscriptionPackageListData(1);
    }
  }, [modelRequestData, navigate]);

  // C] Calling All Api's like List and other Here :
  // 1) Get subscription package List Data
  const GetPDFToCSVSubscriptionPackageListData = async (
    i,
    searchKeywordValue,
  ) => {
    setLoader(true);
    const pageNoList = i - 1;
    try {
      const data = await getPDFToCSVSubscriptionPackageList({
        pageSize: pageSize,
        pageNo: pageNoList,
        searchKeyword:
          searchKeywordValue === undefined ? searchKeyword : searchKeywordValue,
        // primarySortDirection:
        //   sortValue === undefined ? primarySortDirection : sortValue,
        userKeyID: common.userKeyID,
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
              GetPDFToCSVSubscriptionPackageListData(
                newPaneNo,
                searchKeywordValue,
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
              GetPDFToCSVSubscriptionPackageListData(i, searchKeywordValue);
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
        pcspKeyID: null,
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
    navigate("/pdf-csv-subscriptionModal", {
      state: addEmailTemplateRequestData,
    });
  };
  // 2) On Click subscription package Edit Button
  const SubscriptionPackageEditBtnClicked = (subscriptionPackage) => {
    dispatch(updateState({ currentPage: currentPage }));
    setModelRequestData((prevState) => ({
      ...prevState,
      pcspKeyID: subscriptionPackage?.pcspKeyID,
      Action: "Update",
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
          GetPDFToCSVSubscriptionPackageListData(currentPage);
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

        GetPDFToCSVSubscriptionPackageListData(currentPage);
      } catch (error) {
        console.log(error);
      }
    }
  };

  // F] Pagination :
  const handlePageChange = async (pageNumber) => {
    setCurrentPage(pageNumber);
    await GetPDFToCSVSubscriptionPackageListData(pageNumber); // Call your function with the selected page number
  };

  // E] Sorting & handle Function
  const HandleSort = (sortValue) => {
    setPrimarySortDirection(sortValue);
    setCurrentPage(1);
    GetPDFToCSVSubscriptionPackageListData(1, searchKeyword);
  };
  const HandleSearch = (e) => {
    const searchKeywordValue = e.target.value;
    setSearchKeyword(searchKeywordValue);
    setCurrentPage(1);
    GetPDFToCSVSubscriptionPackageListData(1, searchKeywordValue);
  };

  const handleClose = () => {
    $("#" + "ConfirmModel").modal("hide");
    setOpenSuccessModal(false);
    setOpenErrorModal(false);
  };

  return (
    <div className="container-fluid pdfcsv-subscription-redesign-v2">
      <div className="pdfcsv-subscription-page-v2">
        {/* PAGE HEADER */}
        <div className="pdfcsv-subscription-header-v2">
          <div className="pdfcsv-subscription-heading-v2">
            <h1>PDF To CSV Subscription Packages</h1>
            <p>
              Manage package validity, page limits, pricing and availability.
            </p>
          </div>

          {userAccessData.SuperAdmin_Config_Subscription_Package_CanAdd && (
            <div className="pdfcsv-subscription-add-v2">
              <CommonButtonComponent
                title={`Add ${moduleName} `}
                name={`Add ${moduleName} `}
                AddBtn={() => SubscriptionPackageAddBtnClicked()}
              />
            </div>
          )}
        </div>

        {/* LIST CARD */}
        <section className="pdfcsv-subscription-card-v2">
          <div className="pdfcsv-subscription-toolbar-v2">
            <div className="pdfcsv-subscription-search-v2">
              <i className="ri-search-line"></i>
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => {
                  HandleSearch(e);
                }}
                className="form-control"
                placeholder={
                  isMobile
                    ? "Search"
                    : getPlaceholderTextName("Search", moduleName)
                }
              />
            </div>

            <div className="pdfcsv-subscription-count-v2">
              {/* <span className="pdfcsv-subscription-count-icon-v2">
                <i className="ri-file-excel-2-line"></i>
              </span> */}
              <span>Total Packages</span>
              <strong>{listCount > 0 ? listCount : 0}</strong>
            </div>
          </div>

          <div className="pdfcsv-subscription-table-scroll-v2">
            <table className="pdfcsv-subscription-table-v2" id="customerTable">
              <thead>
                <tr>
                  <th>
                    <button
                      type="button"
                      className="pdfcsv-subscription-sort-v2"
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
                      <span>Package Name</span>
                      <i
                        className={
                          primarySortDirection === "desc"
                            ? "fas fa-sort-alpha-up"
                            : "fas fa-sort-alpha-down"
                        }
                      ></i>
                    </button>
                  </th>
                  <th>Validity</th>
                  <th>Pages</th>
                  <th>Discounted Price</th>
                  <th>Status</th>
                  <th className="pdfcsv-subscription-actions-head-v2">
                    {(userAccessData.SuperAdmin_Config_Subscription_Package_CanDelete ||
                      userAccessData.SuperAdmin_Config_Subscription_Package_CanEdit) && (
                      <>Actions</>
                    )}
                  </th>
                </tr>
              </thead>

              <tbody>
                {subscriptionPackageList.map((subscriptionPackage, index) => (
                  <tr
                    key={
                      subscriptionPackage.pcspKeyID ||
                      subscriptionPackage.subscriptionPackageKeyID ||
                      index
                    }
                  >
                    <td>
                      <div className="pdfcsv-subscription-name-v2">
                        <span className="pdfcsv-subscription-file-icon-v2">
                          <i className="ri-file-excel-2-line"></i>
                        </span>
                        <strong>{subscriptionPackage.packageName}</strong>
                      </div>
                    </td>

                    <td>
                      <span className="pdfcsv-subscription-validity-v2">
                        {subscriptionPackage.validity}
                      </span>
                    </td>

                    <td>
                      <span className="pdfcsv-subscription-pages-v2">
                        {subscriptionPackage.pages}
                      </span>
                    </td>

                    <td>
                      <span className="pdfcsv-subscription-price-v2">
                        {subscriptionPackage.discountedPrice}
                      </span>
                    </td>

                    <td>
                      <div className="pdfcsv-subscription-status-v2">
                        <span
                          className={`pdfcsv-subscription-status-pill-v2 ${
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
                                    disabled={subscriptionPackage.isFreePackage}
                                    onClick={() =>
                                      setModelRequestData((prevState) => ({
                                        ...prevState,
                                        status: subscriptionPackage.statusName,
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

                    <td className="pdfcsv-subscription-actions-cell-v2">
                      <div className="pdfcsv-subscription-actions-v2">
                        {userAccessData.SuperAdmin_Config_Subscription_Package_CanEdit && (
                          <Tooltip title={"Update Package"}>
                            <button
                              type="button"
                              className="pdfcsv-subscription-action-btn-v2 pdfcsv-subscription-edit-v2"
                              onClick={() =>
                                SubscriptionPackageEditBtnClicked(
                                  subscriptionPackage,
                                )
                              }
                            >
                              <i className="ri-pencil-fill"></i>
                            </button>
                          </Tooltip>
                        )}

                        {userAccessData.SuperAdmin_Config_Subscription_Package_CanDelete &&
                          !subscriptionPackage.isFreePackage && (
                            <Tooltip title={"Delete Subscription Package"}>
                              <button
                                type="button"
                                className="pdfcsv-subscription-action-btn-v2 pdfcsv-subscription-delete-v2"
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
                ))}
              </tbody>
            </table>
          </div>

          {totalRecords <= 0 && (
            <div className="pdfcsv-subscription-empty-v2">
              <NoResultFoundModel
                name={moduleName}
                totalRecords={totalRecords}
              />
            </div>
          )}
        </section>

        {/* PAGINATION OUTSIDE THE LIST CARD */}
        {listCount > 6 && (
          <div className="pdfcsv-subscription-pagination-v2">
            <PaginationComponent
              totalCount={listCount}
              totalPages={totalPage}
              desktopRecords={desktopRecords}
              currentPage={currentPage}
              onPageChange={handlePageChange}
            />
          </div>
        )}

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
      </div>

      <div className="pdfcsv-subscription-footer-v2">
        <Footer />
      </div>

      <button
        onclick="topFunction()"
        className="btn btn-danger btn-icon"
        id="back-to-top"
      >
        <i className="ri-arrow-up-line"></i>
      </button>
    </div>
  );
};
export default PdfToCsvSubscription_Package;
