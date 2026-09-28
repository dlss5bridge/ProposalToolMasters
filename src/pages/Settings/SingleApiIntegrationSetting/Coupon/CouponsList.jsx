/* global $ */
import React, { useContext, useEffect, useState } from "react";
import CommonButtonComponent from "../../../../components/CommonButtonComponent";
import { useSelector } from "react-redux";
import CouponsModal from "./CouponModal";
import PaginationComponent from "../../../../components/PaginationModel";
import NoResultFoundModel from "../../../../components/NoResultFoundModel";
import Tooltip, { tooltipClasses } from "@mui/material/Tooltip";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import SuccessModal from "../../../../components/SuccessModal";
import ErrorModel from "../../../../components/ErrorModel";
import ConfirmModel from "../../../../components/ConfirmationBox";
import Footer from "../../../../components/Footer";
import { AuthContextProvider } from "../../../../AuthContext/AuthContext";
import Android12Switch from "../../../../components/AndroidSwitch";
import {
  ChangeCouponStatus,
  DeleteCouponCode,
  GetCouponCodeList,
} from "../../../../redux/Services/Setting/CouponApi";
import { useNavigate } from "react-router-dom";
import "./CouponCodeList-redesign.css";
const CouponCodeList = () => {
  let getCouponCodeListApiCallCount = 0;
  const navigate = useNavigate();
  // A] States Declaration :
  const moduleName = "Coupon";
  const [couponCodeList, setCouponCodeList] = useState([]);

  const [modelRequestData, setModelRequestData] = useState({
    CouponCodeName: "",
    couponKeyID: null,
    Action: null,
    userKeyID: null,
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [isAddUpdateActionDone, setIsAddUpdateActionDone] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(-1);
  const common = useSelector((state) => state.Storage); //Getting Logged Users Details From Persist Storage of redux hooks
  const [primarySortDirection, setPrimarySortDirection] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [openErrorModal, setOpenErrorModal] = useState(false);
  const [openSuccessModal, setOpenSuccessModal] = React.useState(false);
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
    formatValue,
    formatValueWithoutCurrencySymbol,
    activeOrganizationSubscriptionPlan,
    isSubscriptionLoading,
  } = useContext(AuthContextProvider);
  const pageSize = isMobile ? isMobileRecords : desktopRecords;
  // B] Initial useEffect :
  // 1) Will Call Initial Api Like List Api
  useEffect(() => {
    if (isSubscriptionLoading || !activeOrganizationSubscriptionPlan) return;
    if (!activeOrganizationSubscriptionPlan?.apiIntegration) {
      navigate(-1); // Redirect to the previous page
    }
    setTopbar("block");
    GetCouponCodeListData(1);
  }, [isSubscriptionLoading, activeOrganizationSubscriptionPlan]);

  //2) This useEffect will trigger when we successfully add or update record from popup model
  useEffect(() => {
    if (isAddUpdateActionDone) {
      if (modelRequestData.Action === null) {
        setSearchKeyword("");
        setPrimarySortDirection(null);
        setCurrentPage(1);
        GetCouponCodeListData(1, null, null);
      } else {
        GetCouponCodeListData(currentPage);
      }
      setIsAddUpdateActionDone(false);
    }
  }, [isAddUpdateActionDone]);

  // C] Calling All Api's like List and other Here :
  // 1) Get Coupon List Data
  const GetCouponCodeListData = async (i, searchKeywordValue, sortValue) => {
    // setLoader(true);
    const pageNoList = i - 1;
    try {
      const data = await GetCouponCodeList({
        pageSize: pageSize,
        pageNo: pageNoList,
        organisationKeyID: common.organisationKeyID,
        userKeyID: common.userKeyID,
        searchKeyword:
          searchKeywordValue === undefined ? searchKeyword : searchKeywordValue,
        primarySortDirection:
          sortValue === undefined ? primarySortDirection : sortValue,
      });
      if (data) {
        if (data?.data?.statusCode === 200) {
          setLoader(false);
          getCouponCodeListApiCallCount = 0;
          if (data?.data?.responseData?.data) {
            const totalCount = data.data.totalCount;
            const CouponCodeListData = data.data.responseData.data;
            if (pageNoList > 0 && CouponCodeListData.length === 0) {
              let newPaneNo = Number(pageNoList);
              if (newPaneNo > 1) {
                newPaneNo = newPaneNo - 1;
              }
              GetCouponCodeListData(newPaneNo, searchKeywordValue, sortValue);
              setCurrentPage(pageNoList);
              return;
            }
            setListCount(totalCount);
            setCouponCodeList(CouponCodeListData);
            setTotalRecords(CouponCodeListData.length);
          }
        } else {
          if (getCouponCodeListApiCallCount < maxCountToRecallApi) {
            getCouponCodeListApiCallCount += 1;
            setTimeout(function () {
              GetCouponCodeListData(i, searchKeywordValue, sortValue);
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
  // 1) On Click Coupon Add Button
  const CouponCodeAddBtnClicked = () => {
    setModelRequestData({
      ...modelRequestData,
      Action: null,
      couponKeyID: null,
    });
  };

  // 2) On Click Coupon Delete Button
  const DeleteCouponCodeData = async () => {
    setLoader(true);
    try {
      if (modelRequestData.Action === "Status") {
        const Data = await ChangeCouponStatus(
          modelRequestData.couponKeyID,
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
            setErrorMessage(Data?.response?.data?.errorMessage);
            setOpenErrorModal(true);
          }
          GetCouponCodeListData(currentPage);
        }
      } else {
        const Data = await DeleteCouponCode(
          modelRequestData.couponKeyID,
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
            setErrorMessage(Data?.response?.data?.errorMessage);
            setOpenErrorModal(true);
          }
          GetCouponCodeListData(currentPage);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  // F] Pagination :
  const handlePageChange = async (pageNumber) => {
    setCurrentPage(pageNumber);
    await GetCouponCodeListData(pageNumber); // Call your function with the selected page number
  };

  const handleSearch = (e) => {
    const searchKeywordValue = e.target.value;
    setSearchKeyword(searchKeywordValue);
    setCurrentPage(1);
    GetCouponCodeListData(1, searchKeywordValue);
  };

  const handleClose = () => {
    $("#" + "ConfirmModel").modal("hide");
    setOpenSuccessModal(false);
    setOpenErrorModal(false);
  };
  const UpdateCouponCode = (CouponCode) => {
    setModelRequestData({
      ...modelRequestData,
      couponKeyID: CouponCode.couponKeyID,
      Action: "Update",
    });
  };
  //Design part :
  return (
    <>
      <div className="coupon-list-redesign">
        <div className="coupon-list-page">
          {/* =========================
              PAGE HEADER
              ========================= */}
          <div className="coupon-list-page-header">
            <div>
              <h1 className="coupon-list-page-title">Coupons</h1>
              <p className="coupon-list-page-subtitle">
                Manage coupon codes, validity, discount values and availability.
              </p>
            </div>

            {common.organisationKeyID !== null && (
              <div className="coupon-list-add-action">
                <CommonButtonComponent
                  title={getCrudButtonToolTipName("Add", moduleName)}
                  name={getCrudButtonTextName("Add", moduleName)}
                  dataBsTarget="#CouponModel"
                  data_bs_toggle="modal"
                  AddBtn={() => CouponCodeAddBtnClicked()}
                />
              </div>
            )}
          </div>

          {/* =========================
              LIST CARD
              ========================= */}
          <section className="coupon-list-card">
            <div className="coupon-list-card-toolbar">
              <div>
                <h2>Coupon List</h2>
                <span>
                  {listCount > 0
                    ? `${listCount} ${listCount === 1 ? "coupon" : "coupons"}`
                    : "No coupons found"}
                </span>
              </div>
            </div>

            <div className="coupon-list-table-wrap">
              <table className="coupon-list-table" id="customerTable">
                <thead>
                  <tr>
                    <th>Coupon Code</th>
                    <th>Coupon Amount</th>
                    <th>Validity Count</th>
                    <th>Coupon Type</th>
                    <th>Valid From</th>
                    <th>Valid To</th>
                    <th>Status</th>
                    <th className="coupon-list-actions-heading">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {couponCodeList
                    .slice(0, isMobile ? isMobileRecords : desktopRecords)
                    .map((CouponCode) => {
                      const statusClass = (CouponCode.statusName || "")
                        .toLowerCase()
                        .replace(/\s+/g, "-");

                      const couponTypeClass = (CouponCode.couponType || "")
                        .toLowerCase()
                        .replace(/\s+/g, "-");

                      return (
                        <tr
                          className="coupon-list-row"
                          key={CouponCode.couponKeyID || CouponCode.couponCode}
                        >
                          <td>
                            <div className="coupon-code-cell">
                              <span className="coupon-code-icon">
                                <i className="ri-coupon-3-line"></i>
                              </span>

                              <span
                                className="coupon-code-value"
                                title={CouponCode.couponCode}
                              >
                                {CouponCode.couponCode || "-"}
                              </span>
                            </div>
                          </td>

                          <td>
                            <span className="coupon-amount">
                              {formatValue(CouponCode.couponAmount)}
                            </span>
                          </td>

                          <td>
                            <span className="coupon-validity-count">
                              {formatValueWithoutCurrencySymbol(
                                CouponCode.validityCount,
                              )}
                            </span>
                          </td>

                          <td>
                            <span
                              className={`coupon-type-badge coupon-type-badge--${couponTypeClass}`}
                            >
                              {CouponCode.couponType || "-"}
                            </span>
                          </td>

                          <td>
                            <span className="coupon-date">
                              {CouponCode.fromDate !== null
                                ? new Intl.DateTimeFormat("en-GB", {
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "numeric",
                                  }).format(new Date(CouponCode.fromDate))
                                : "-"}
                            </span>
                          </td>

                          <td>
                            <span className="coupon-date">
                              {CouponCode.toDate !== null
                                ? new Intl.DateTimeFormat("en-GB", {
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "numeric",
                                  }).format(new Date(CouponCode.toDate))
                                : "-"}
                            </span>
                          </td>

                          <td>
                            <div className="coupon-status-control">
                              {/* <Tooltip title={"Change Status"}>
                                <span
                                  className={`coupon-status-badge coupon-status-badge--${statusClass}`}
                                >
                                  <span className="coupon-status-dot"></span>
                                  {CouponCode.statusName || "-"}
                                </span>
                              </Tooltip> */}

                              <Tooltip
                                title={getCrudButtonToolTipName(
                                  "Change Status",
                                )}
                              >
                                <FormGroup>
                                  <FormControlLabel
                                    className="coupon-status-switch-label"
                                    control={
                                      <Android12Switch
                                        data-bs-toggle="modal"
                                        data-bs-target="#ConfirmModel"
                                        onClick={() =>
                                          setModelRequestData({
                                            ...modelRequestData,
                                            couponKeyID: CouponCode.couponKeyID,
                                            userKeyID: common.userKeyID,
                                            Action: "Status",
                                          })
                                        }
                                        checked={
                                          CouponCode.statusName === "Active"
                                        }
                                      />
                                    }
                                  />
                                </FormGroup>
                              </Tooltip>
                            </div>
                          </td>

                          <td className="coupon-list-actions-cell">
                            {!CouponCode.isUsed ? (
                              <div className="coupon-row-actions">
                                <Tooltip
                                  title={getCrudButtonToolTipName(
                                    "Update",
                                    moduleName,
                                  )}
                                >
                                  <button
                                    type="button"
                                    className="coupon-action-button coupon-action-button--edit"
                                    data-bs-toggle="modal"
                                    data-bs-target="#CouponModel"
                                    onClick={() => UpdateCouponCode(CouponCode)}
                                  >
                                    <i className="ri-pencil-line"></i>
                                  </button>
                                </Tooltip>

                                <Tooltip
                                  title={getCrudButtonToolTipName(
                                    "Delete",
                                    moduleName,
                                  )}
                                >
                                  <button
                                    type="button"
                                    className="coupon-action-button coupon-action-button--delete"
                                    data-bs-toggle="modal"
                                    data-bs-target="#ConfirmModel"
                                    onClick={() =>
                                      setModelRequestData({
                                        ...modelRequestData,
                                        couponKeyID: CouponCode.couponKeyID,
                                        CouponCodeName:
                                          CouponCode.accessKeyName,
                                        userKeyID: common.userKeyID,
                                        Action: "Delete",
                                      })
                                    }
                                  >
                                    <i className="ri-delete-bin-line"></i>
                                  </button>
                                </Tooltip>
                              </div>
                            ) : (
                              <span className="coupon-used-badge">Used</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>

              {totalRecords <= 0 && (
                <div className="coupon-list-empty-state">
                  <NoResultFoundModel
                    name={moduleName}
                    totalRecords={totalRecords}
                  />
                </div>
              )}
            </div>

            {listCount > pageSize && (
              <div className="coupon-list-pagination-wrap">
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
            EXISTING MODALS
            ========================= */}
        <ErrorModel
          ErrorModel={openErrorModal}
          handleClose={handleClose}
          ErrorMessage={errorMessage}
        />

        <ConfirmModel
          openErrorModal={openErrorModal}
          openSuccessModal={openSuccessModal}
          modelRequestData={modelRequestData}
          UpdatedStatus={DeleteCouponCodeData}
        />

        <SuccessModal
          handleClose={handleClose}
          setOpenSuccessModal={setOpenSuccessModal}
          openSuccessModal={openSuccessModal}
          modelAction={modelRequestData.Action}
          message={
            modelRequestData.Action === "Delete"
              ? moduleName + " " + modelRequestData.CouponCodeName
              : "Status has been changed successfully!"
          }
        />

        <CouponsModal
          class="modal fade"
          id="CouponModel"
          tabIndex="-1"
          aria_labelledby="exampleModalLabel"
          aria_hidden="true"
          setIsAddUpdateActionDone={setIsAddUpdateActionDone}
          modelRequestData={modelRequestData}
        />

        <button
          onclick="topFunction()"
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

export default CouponCodeList;
