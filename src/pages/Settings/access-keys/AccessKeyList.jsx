/* global $ */
import React, { useContext, useEffect, useState } from "react";
import CommonButtonComponent from "../../../components/CommonButtonComponent";
import "./AccessKeyStyle.css";
import { useSelector } from "react-redux";
import {
  DeleteAccessKey,
  GetAccessKeyList,
} from "../../../redux/Services/Setting/AccessKeyApi";
import AccesskeyModal from "./AccesskeyModal";
import PaginationComponent from "../../../components/PaginationModel";
import NoResultFoundModel from "../../../components/NoResultFoundModel";
import Tooltip, { tooltipClasses } from "@mui/material/Tooltip";
import { AuthContextProvider } from "../../../AuthContext/AuthContext";
import SuccessModal from "../../../components/SuccessModal";
import ErrorModel from "../../../components/ErrorModel";
import ConfirmModel from "../../../components/ConfirmationBox";
import Footer from "../../../components/Footer";
import { GetOrganisationLookupList } from "../../../redux/Services/Master/OrganisationLookupList";
import { Label } from "reactstrap";
const AccessKeyList = () => {
  let getAccessKeyListApiCallCount = 0;
  // A] States Declaration :
  const moduleName = "Access Key";
  const [accessKeyList, setAccessKeyList] = useState([]);

  const [modelRequestData, setModelRequestData] = useState({
    AccessKeyName: "",
    accessKeyKeyID: null,
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
  } = useContext(AuthContextProvider);
  let pageSize = isMobile ? isMobileRecords : desktopRecords;
  // B] Initial useEffect :
  // 1) Will Call Initial Api Like List Api
  useEffect(() => {
    setTopbar("block");
    GetAccessKeyListData(1);
  }, []);


  //2) This useEffect will trigger when we successfully add or update record from popup model
  useEffect(() => {
    if (isAddUpdateActionDone) {
      if (modelRequestData.Action === null) {
        setSearchKeyword("");
        setPrimarySortDirection(null);
        setCurrentPage(1);
        GetAccessKeyListData(1, null, null);
      } else {
        GetAccessKeyListData(currentPage);
      }
      setIsAddUpdateActionDone(false);
    }
  }, [isAddUpdateActionDone]);

  // C] Calling All Api's like List and other Here :

  // 1) Get Access Key List Data
  const GetAccessKeyListData = async (i, searchKeywordValue, sortValue) => {
    setLoader(true);
    const pageNoList = i - 1;
    if (pageSize === 0) {
      pageSize = 1
    }
    try {
      const data = await GetAccessKeyList({
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
          getAccessKeyListApiCallCount = 0;
          if (data?.data?.responseData?.data) {
            const totalCount = data.data.totalCount;
            const AccessKeyListData = data.data.responseData.data;
            if (pageNoList > 0 && AccessKeyListData.length === 0) {
              let newPaneNo = Number(pageNoList);
              if (newPaneNo > 1) {
                newPaneNo = newPaneNo - 1;
              }
              GetAccessKeyListData(newPaneNo, searchKeywordValue, sortValue);
              setCurrentPage(pageNoList);
              return;
            }
            setListCount(totalCount);
            setAccessKeyList(AccessKeyListData);
            setTotalRecords(AccessKeyListData.length);
          }
        } else {
          if (getAccessKeyListApiCallCount < maxCountToRecallApi) {
            getAccessKeyListApiCallCount += 1;
            setTimeout(function () {
              GetAccessKeyListData(i, searchKeywordValue, sortValue);
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
  // 1) On Click Access Key Add Button
  const AccessKeyAddBtnClicked = () => {
    {
      setModelRequestData({
        ...modelRequestData,
        Action: null,
      });
    }
  };

  // 2) On Click Access Key Delete Button
  const DeleteAccessKeyData = async () => {
    setLoader(true);
    try {
      const Data = await DeleteAccessKey(
        modelRequestData.AccessKeyKeyID,
        modelRequestData.userKeyID
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
        GetAccessKeyListData(currentPage);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // F] Pagination :
  const handlePageChange = async (pageNumber) => {
    setCurrentPage(pageNumber);
    await GetAccessKeyListData(pageNumber); // Call your function with the selected page number
  };

  // E] Sorting
  const HandleSort = (sortValue) => {
    setPrimarySortDirection(sortValue);
    setCurrentPage(1);
    GetAccessKeyListData(1, searchKeyword, sortValue);
  };

  const handleSearch = (e) => {
    const searchKeywordValue = e.target.value;
    setSearchKeyword(searchKeywordValue);
    setCurrentPage(1);
    GetAccessKeyListData(1, searchKeywordValue);
  };

  const handleClose = () => {
    $("#" + "ConfirmModel").modal("hide");
    setOpenSuccessModal(false);
    setOpenErrorModal(false);
  };

  //Design part :
  return (
    <div>
      <div className="main-content">
        <div className="services page-background">
          <div className="page-info-header page-info-strip">
            <div className="container">
              <div className="row">
                <div className="col-md-6 col-6">
                  <div class="page-title-cls">Access Keys</div>
                </div>
                <div className="col-md-6 col-6">
                  <div className="d-flex justify-content-sm-end add-new-btn">
                    {userAccessData.Admin_Setting_AccessKeyCanAdd &&
                      common.organisationKeyID !== null && (
                        <CommonButtonComponent
                          title={getCrudButtonToolTipName("Add", moduleName)}
                          name={getCrudButtonTextName("Add", moduleName)}
                          dataBsTarget="#showModal1"
                          data_bs_toggle="modal"
                          AddBtn={() => AccessKeyAddBtnClicked()}
                        />
                      )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="container">
            <div class="row">
              <div class="col-lg-12">
                <div class="card">
                  <div class="card-body">
                    <div id="customerList">
                      <div class="row g-4 mb-3"></div>
                      <div class="table-responsive table-card  mb-3 table-padding">
                        <div class="search-box col-md-4 col-8 width-searchbox mb-2">
                          <i class="ri-search-line search-icon"></i>
                          <input
                            type="text"
                            value={searchKeyword}
                            onChange={(e) => {
                              handleSearch(e);
                            }}
                            className="form-control search"
                            placeholder={
                              isMobile ? "Search" : getPlaceholderTextName("Search", moduleName)
                            }
                          />

                        </div>
                        <table
                          class="table align-middle table-nowrap"
                          id="customerTable"
                        >
                          <thead class="table-light table-header-font">
                            <tr className="head-row ">
                              <td
                                className="tr-table-class text-white"
                                style={{
                                  width: "10%",
                                }}
                              >
                                Access Key
                                {primarySortDirection === "desc" && (
                                  <i
                                    onClick={() => {
                                      HandleSort("asc");
                                    }}
                                    style={{ cursor: "pointer" }}
                                    class="fas fa-sort-alpha-up ml-1"
                                  ></i>
                                )}
                                {(primarySortDirection === null ||
                                  primarySortDirection === "asc") && (
                                    <i
                                      onClick={() => {
                                        HandleSort(
                                          primarySortDirection === null
                                            ? "asc"
                                            : "desc"
                                        );
                                      }}
                                      style={{ cursor: "pointer" }}
                                      class="fas fa-sort-alpha-down ml-1"
                                    ></i>
                                  )}
                              </td>
                              <td className="tr-table-class  text-white">
                                Token
                              </td>

                              <td className="tr-table-class text-center text-white">
                                {userAccessData.Admin_Setting_AccessKeyCanDelete && (
                                  <>Action</>
                                )}
                              </td>
                            </tr>
                          </thead>
                          <tbody class="list form-check-all ">
                            {accessKeyList
                              .slice(
                                0,
                                isMobile ? isMobileRecords : desktopRecords
                              )
                              .map((AccessKey) => {
                                return (
                                  <tr class="table_new">
                                    <td className="table-content-font">
                                      {AccessKey.accessKeyName
                                        .toLowerCase()
                                        .replace(/\b\w/g, (l) =>
                                          l.toUpperCase()
                                        )}
                                    </td>

                                    <td className="table-content-font">
                                      {" "}
                                      {AccessKey.token}
                                    </td>
                                    {/* <td> {AccessKey.statusName}</td> */}
                                    <td className="table-content-font">
                                      <div class="d-flex gap-2 justify-content-center">
                                        {userAccessData.Admin_Setting_AccessKeyCanDelete && (
                                          <Tooltip
                                            title={getCrudButtonToolTipName(
                                              "Delete",
                                              moduleName
                                            )}
                                          >
                                            <div class="remove">
                                              <button
                                                class="btn btn-sm btn-danger remove-item-btn actionButtonsStyle"
                                                data-bs-toggle="modal"
                                                data-bs-target="#ConfirmModel"
                                                onClick={() =>
                                                  setModelRequestData({
                                                    ...modelRequestData,
                                                    AccessKeyKeyID:
                                                      AccessKey.accessKeyKeyID,
                                                    AccessKeyName:
                                                      AccessKey.accessKeyName,
                                                    userKeyID: common.userKeyID,
                                                    Action: "Delete",
                                                  })
                                                }
                                              >
                                                <i class="ri-delete-bin-5-fill"></i>
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

                        {totalRecords <= 0 && (
                          <NoResultFoundModel
                            name={moduleName}
                            totalRecords={totalRecords}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                  {listCount > pageSize && (
                    <PaginationComponent
                      totalCount={listCount}
                      totalPages={totalPage}
                      currentPage={currentPage}
                      onPageChange={handlePageChange}
                    />
                  )}
                </div>
              </div>
            </div>
            <ErrorModel
              ErrorModel={openErrorModal}
              handleClose={handleClose}
              ErrorMessage={errorMessage}
            />
            {/* Confirm Modal  */}
            <ConfirmModel
              openErrorModal={openErrorModal}
              openSuccessModal={openSuccessModal}
              modelRequestData={modelRequestData}
              UpdatedStatus={DeleteAccessKeyData}
            />

            {/* Success Modal  */}
            <SuccessModal
              handleClose={handleClose}
              setOpenSuccessModal={setOpenSuccessModal}
              openSuccessModal={openSuccessModal}
              modelAction={modelRequestData.Action}
              message={
                modelRequestData.Action === "Delete"
                  ? moduleName + " " + modelRequestData.AccessKeyName
                  : "Status has been changed successfully!"
              }
            />
            {/* Modal  */}
            <AccesskeyModal
              class="modal fade"
              id="showModal1"
              tabIndex="-1"
              aria_labelledby="exampleModalLabel"
              aria_hidden="true"
              setIsAddUpdateActionDone={setIsAddUpdateActionDone}
              modelRequestData={modelRequestData}
            />
          </div>
        </div>

        <Footer />
      </div>

      {/* start back-to-top */}
      <button
        onclick="topFunction()"
        class="btn btn-danger btn-icon"
        id="back-to-top"
      >
        <i class="ri-arrow-up-line"></i>
      </button>
      {/* end back-to-top */}
    </div>
  );
};

export default AccessKeyList;
