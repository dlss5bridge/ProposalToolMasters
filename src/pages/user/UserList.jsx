/* global $ */
import React, { useContext, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  GetUsersList,
  UserChangeStatus,
} from "../../redux/Services/User/UsersApi";
import PaginationComponent from "../../components/PaginationModel";
import { AuthContextProvider } from "../../AuthContext/AuthContext";
import Android12Switch from "../../components/AndroidSwitch";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Tooltip, { tooltipClasses } from "@mui/material/Tooltip";
import ConfirmModel from "../../components/ConfirmationBox";
import NoResultFoundModel from "../../components/NoResultFoundModel";

const UserList = () => {
  // A] States Declaration :
  const [usersList, setUsersList] = useState([]);
  const [listCount, setListCount] = useState([]);
  const [openErrorModal, setOpenErrorModal] = React.useState(false);

  const [modelRequestData, setModelRequestData] = useState({
    inviteUserKeyID: null,
    Action: null,
    userKeyID: null,
    status: null,
  });
  const [dismissModal, setDismissModal] = useState(false);
  const [isAddUpdateActionDone, setIsAddUpdateActionDone] = useState(false);
  const [openSuccessModal, setOpenSuccessModal] = React.useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [modelAction, setModelAction] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const totalPage = Math.ceil(listCount / 10); // Calculate the total number of pages based on listCount
  const common = useSelector((state) => state.Storage); //Getting Logged Users Details From Persist Storage of redux hooks
  const [showButton, setShowButton] = useState(false);
  const [primarySortDirection, setPrimarySortDirection] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState("");
  const { setLoader, setTopbar, formatUKPhoneNumberLocal } = useContext(AuthContextProvider);
  const [totalRecords, setTotalRecords] = useState(-1);

  // B] Initial useEffect :
  // 1) Will Call Initial Api Like List Api
  useEffect(() => {
    GetUsersListData(1);
    setTopbar("block");
  }, [common.organisationKeyID]);

  //2) This useEffect will trigger when we successfully add or update record from popup model
  useEffect(() => {
    if (isAddUpdateActionDone) {
      if (modelRequestData.Action === null) {
        setSearchKeyword("");
        setPrimarySortDirection(null);
        setCurrentPage(1);
        GetUsersListData(1, null, null);
      } else {
        GetUsersListData(currentPage);
      }
      setIsAddUpdateActionDone(false);
    }
  }, [isAddUpdateActionDone]);

  // C] Calling All Api's like List and other Here :
  // 1) Get Users List Data
  const GetUsersListData = async (i, searchKeywordValue, sortValue) => {
    setLoader(true);
    const pageNoList = i - 1;
    try {
      const data = await GetUsersList({
        pageSize: 10,
        pageNo: pageNoList,
        // organisationKeyID: common.organisationKeyID,
        userKeyID: common.userKeyID,
        searchKeyword:
          searchKeywordValue === undefined ? searchKeyword : searchKeywordValue,
        primarySortDirection:
          sortValue === undefined ? primarySortDirection : sortValue,
      });
      if (data) {
        setLoader(false);
        if (data?.data?.statusCode === 200) {
          if (data?.data?.responseData?.data) {
            const totalCount = data.data.totalCount;
            const UsersListData = data.data.responseData.data;
            if (pageNoList > 0 && UsersListData.length === 0) {
              let newPaneNo = Number(pageNoList);
              if (newPaneNo > 1) {
                newPaneNo = newPaneNo - 1;
              }
              GetUsersListData(newPaneNo, searchKeywordValue, sortValue);
              setCurrentPage(pageNoList);
              return;
            }
            setListCount(totalCount);
            setUsersList(UsersListData);
            setTotalRecords(UsersListData.length);
          }
        } else {
          setErrorMessage(data?.data?.errorMessage);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  // 2) On Click Service Category Status Button
  const UserStatusData = async () => {
    setLoader(true);
    if (modelRequestData.Action === "Status") {
      try {
        const Data = await UserChangeStatus(modelRequestData.inviteUserKeyID);
        if (Data) {
          setLoader(false);
          if (Data?.data?.statusCode === 200) {
            $("#" + "ConfirmModel").one("hidden.bs.modal", () => {
              setOpenSuccessModal(true);
            });
            $("#" + "ConfirmModel").modal("hide");
          } else {
            setErrorMessage(Data?.response?.data?.errors?.inviteUserKeyID[0]);
            setOpenErrorModal(true);
          }
        }
        GetUsersListData(currentPage);
      } catch (error) {
        console.log(error);
      }
    }
  };

  // F] Pagination :
  const handlePageChange = async (pageNumber) => {
    setCurrentPage(pageNumber);
    await GetUsersListData(pageNumber); // Call your function with the selected page number
  };
  // E] Sorting & handle Function
  const HandleSort = (sortValue) => {
    setPrimarySortDirection(sortValue);
    setCurrentPage(1);
    GetUsersListData(1, searchKeyword, sortValue);
  };
  const HandleSearch = (e) => {
    const searchKeywordValue = e.target.value;
    setSearchKeyword(searchKeywordValue);
    setCurrentPage(1);
    GetUsersListData(1, searchKeywordValue);
  };
  const HandleClose = () => {
    $("#" + "ConfirmModel").modal("hide");
    setOpenSuccessModal(false);
    setOpenErrorModal(false);
  };

  return (
    <>
      <div>
        <div class="table-responsive table-card  mb-3 table-padding">
          <div className="row">
            <div class="col-md-6 col-6">
              <div class="search-box w-30  width-searchbox mb-2">
                <i class="ri-search-line search-icon"></i>
                <input
                  type="text"
                  value={searchKeyword}
                  onChange={(e) => {
                    HandleSearch(e);
                  }}
                  className="form-control search"
                  placeholder="Search User"
                />
              </div>
            </div>
            <div class="col-md-6 col-6">
              <div className="d-flex justify-content-sm-end add-new-btn"></div>
            </div>
          </div>
          <table class="table align-middle table-nowrap" id="customerTable">
            <thead class="table-light table-header-font">
              <tr className="head-row">
                <td className="tr-table-class text-white">
                  First Name{" "}
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
                            primarySortDirection === null ? "asc" : "desc"
                          );
                        }}
                        style={{ cursor: "pointer" }}
                        class="fas fa-sort-alpha-down ml-1"
                      ></i>
                    )}
                </td>
                <td className="tr-table-class text-white">Last Name</td>
                <td className="tr-table-class text-white">Email</td>
                <td className="tr-table-class text-white">Phone Number</td>
                <td className="tr-table-class text-white">Country Name</td>
                <td className="tr-table-class text-white">Role</td>
                <td className="tr-table-class text-white">Status</td>
              </tr>
            </thead>
            <tbody class="list form-check-all table-content-font">
              {usersList.map((users) => {
                return (
                  <tr class="table_new">
                    <td>{users.firstName}</td>
                    <td>{users.lastName}</td>
                    <td>{users.email}</td>
                    <td>{formatUKPhoneNumberLocal(users.phoneNumber, users.countryCode)}</td>
                    <td>{users.countryName}</td>
                    <td>{users.roleName}</td>
                    <td className="Switch">
                      <div style={{ alignItems: "none" }} class="d-flex gap-2 ">
                        <div style={{ width: "50px" }}> {users.statusName}</div>
                        <Tooltip title={"Change Status"}>
                          <FormGroup>
                            <FormControlLabel
                              control={
                                <Android12Switch
                                  onClick={() =>
                                    setModelRequestData({
                                      ...modelRequestData,
                                      status: users.statusName,
                                      inviteUserKeyID: users.inviteUserKeyID,
                                      Action: "Status",
                                    })
                                  }
                                  checked={users.statusName === "Active"}
                                  data-bs-toggle="modal"
                                  data-bs-target="#ConfirmModel"
                                />
                              }
                            />
                          </FormGroup>
                        </Tooltip>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {totalRecords <= 0 && (
            <NoResultFoundModel
              name="Invite user "
              totalRecords={totalRecords}
            />
          )}
        </div>
        {listCount > 10 && (
          <PaginationComponent
            totalCount={listCount}
            totalPages={totalPage}
            currentPage={currentPage}
            onPageChange={handlePageChange}
          />
        )}
      </div>
      <ConfirmModel
        openErrorModal={openErrorModal}
        openSuccessModal={openSuccessModal}
        modelRequestData={modelRequestData}
        UpdatedStatus={UserStatusData}
        handleClose={HandleClose}
      />
    </>
  );
};

export default UserList;
