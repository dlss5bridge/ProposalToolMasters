/* global $ */
import SuccessModal from "./SuccessModal";
import { Box, Modal, Tooltip, Typography } from "@mui/material";
import React, { useContext, useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Row, Col } from "reactstrap";
import "../../src/Auth/registration/Registration.css";
import "./UserProfileModal.css";
import { CountryName, CountryCode } from "../redux/Services/CountryApi";
import { UpdateUser } from "../redux/Services/Auth/RegistrationApi";
import Select from "react-select";
import { ERROR_MESSAGES } from "../components/GlobalMessage";
import { useDispatch, useSelector } from "react-redux";
import { GetUserModelData } from "../redux/Services/Setting/UsersApi";
// import Loader from "../../loader/Loader";
import { updateState } from "../redux/Persist";
import { AuthContextProvider } from "../AuthContext/AuthContext";
import { UserRole } from "../redux/Services/Master/RoleTypeLookupListApi";

const UserModelNew = (props) => {
  const modalRef = useRef(null);
  const [socialObj, setSocialObj] = useState({
    firstName: null,
    lastName: null,
    email: undefined,
    phone: undefined,
    phoneCode: 9,
    createdByID: null,
    country: null,
    UserKeyID: null,
  });
  // Declare State

  const [openSuccessModal, setOpenSuccessModal] = useState(false);
  const [countryCode, setCountryCode] = useState([]);
  const common = useSelector((state) => state.Storage);
  const [open, setOpen] = useState(false);
  // const [loader, setLoader] = useState(true);
  const { setLoader, setTopbar } = useContext(AuthContextProvider);
  const [countryName, setcountryName] = useState([]);
  const [userRole, setUserRole] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [requireErrorMessage, setRequireErrorMessage] = useState(false);
  const dispatch = useDispatch();
  useEffect(() => {
    if (props.open) {
      if (
        props.UserKeyID !== undefined &&
        props.UserKeyID !== null &&
        props.UserKeyID !== ""
      ) {
        // call here
        GetSocialLoginModelData(props.UserKeyID);
        GetRoleTypeLookupListData();
        GetCountryCodeData();
        GetCountryNameData();
        setOpen(true);
      }
    } else {
      setOpen(false);
    }
  }, [props.open]);

  const GetSocialLoginModelData = async (id) => {
    if (!id) {
      return;
    }
    try {
      const data = await GetUserModelData(id);
      if (data?.data?.statusCode === 200) {
        if (data?.data?.responseData?.data) {
          const ModelData = data?.data?.responseData?.data;
          setSocialObj({
            ...socialObj,
            firstName: ModelData.firstName,
            lastName: ModelData.lastName,
            email: ModelData.email === null ? "" : ModelData.email,
            phone: ModelData.phoneNumber === null ? "" : ModelData.phoneNumber,
            phoneCode:
              ModelData.countryCodeID === null ? 9 : ModelData.countryCodeID,
            country: ModelData.countryID,
            UserKeyID: ModelData.UserKeyID,
            roleTypeID_ForUpdate: ModelData.roleTypeID_ForUpdate,
          });
        }
      } else {
        setErrorMessage(data?.data?.errorMessage);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // 1) Country Code Lookup List Api
  const GetCountryCodeData = async () => {
    try {
      const data = await CountryCode();
      if (data?.data?.statusCode === 200) {
        if (data?.data?.responseData?.data) {
          const CountryCode = data?.data?.responseData?.data;
          setCountryCode(CountryCode);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };
  const CountryCodeOption = countryCode.map((code) => ({
    value: code.countryCodeId,
    label: code.countryCode,
  }));
  // 1) Country option Type Lookup List Api
  const GetCountryNameData = async () => {
    try {
      const data = await CountryName();
      if (data?.data?.statusCode === 200) {
        if (data?.data?.responseData?.data) {
          const CountryCode = data?.data?.responseData?.data;
          setcountryName(CountryCode);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const GetRoleTypeLookupListData = async () => {
    try {
      let callingFrom = "Admin";
      if (
        common.roleTypeId === 1 &&
        (common.organisationKeyID === null || common.organisationKeyID === "")
      ) {
        callingFrom = "SuperAdmin";
      }
      const data = await UserRole(callingFrom);
      let UserRoleData = data.data.responseData.data;
      if (callingFrom === "Admin") {
        UserRoleData = UserRoleData.filter((role) => role.roleTypeId !== 1);
        setUserRole(UserRoleData);
      } else if (callingFrom === "SuperAdmin") {
        setUserRole(UserRoleData);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const CountryNameOption = countryName.map((name) => ({
    value: name.countryId,
    label: name.countryName,
  }));
  const UserRoleTypeLookupList = userRole.map((userRoleType) => ({
    value: userRoleType.roleTypeId,
    label: userRoleType.roleName,
  }));
  const userRoleValue = UserRoleTypeLookupList.find(
    (item) => item.value == socialObj.roleTypeID_ForUpdate,
  );
  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  const phoneNumberRegex = /^\d{10,15}$/; // Allow between 10 and 15 digits

  const RegistrationAddUpdateBtnClicked = () => {
    let hasError = false;

    if (
      socialObj.firstName === undefined ||
      socialObj.firstName === "" ||
      socialObj.lastName === undefined ||
      socialObj.lastName === "" ||
      socialObj.email === undefined ||
      socialObj.email === "" ||
      !emailRegex.test(socialObj.email) || // Check if email matches the regex pattern
      !phoneNumberRegex.test(socialObj.phone) || // Check if phone
      socialObj.phone === null ||
      socialObj.phone === "" ||
      socialObj.country === null ||
      socialObj.country === "" ||
      socialObj.phoneCode === null ||
      socialObj.phoneCode === "" ||
      socialObj.roleTypeID_ForUpdate === "" ||
      socialObj.roleTypeID_ForUpdate === null ||
      socialObj.roleTypeID_ForUpdate === undefined
    ) {
      hasError = true;
    }

    if (hasError) {
      setRequireErrorMessage(true);
      return false;
    } else {
      setRequireErrorMessage("");
      setErrorMessage("");
    }

    // Preparing Object For Add Update and if any modification then it will done here
    const ApiRequest_ParamsObj = {
      UserKeyID: common.userKeyID,
      UserKeyID_ForUpdate: props.UserKeyID,
      firstName: socialObj.firstName,
      lastName: socialObj.lastName,
      email: socialObj.email,
      countryCodeID: socialObj.phoneCode,
      countryID: socialObj.country,
      phoneNumber: socialObj?.phone,
      roleTypeID_ForUpdate: socialObj.roleTypeID_ForUpdate,
    };
    $("#" + props.id).modal("hide");

    AddUpdateRegistrationData(ApiRequest_ParamsObj);
  };

  // 3) Add Update Service Category Data Api
  const AddUpdateRegistrationData = async (ApiRequest_ParamsObj) => {
    setLoader(true);
    try {
      const response = await UpdateUser(ApiRequest_ParamsObj);
      if (response) {
        if (response?.status === 200) {
          dispatch(
            updateState({
              mobileNo: socialObj?.phone,
              name: socialObj.firstName,
            }),
          );

          setLoader(false);
          setOpen(false);
          setOpenSuccessModal(true);
          props.setShowUserModal(false);
          props.setIsAddUpdateActionDone(true);
        } else {
          setLoader(false);
          setErrorMessage(response?.response?.data?.errorMessage);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const isValidPhoneNumber = (phoneNumber) => {
    const phoneNumberRegex = /^\d{10,15}$/; // Allow between 10 and 15 digits
    return phoneNumberRegex.test(phoneNumber);
  };
  const handleCloseModal = () => {
    $("#" + props.id).modal("hide");
    setOpenSuccessModal(false);
    dispatch(
      updateState({
        isPasswordSet: true,
      }),
    );
  };
  const handleClose = () => {
    $("#" + props.id).modal("hide");
    setOpenSuccessModal(false);
    setErrorMessage("");
    setRequireErrorMessage("");
  };

  return (
    <div>
      <div
        // style={{ display: openSuccessModal && "none" }}
        class={props.class}
        id={props.id}
        ref={modalRef}
        tabIndex={props.tabIndex}
        aria-hidden="false"
        data-bs-backdrop="static"
        data-bs-keyboard="false"
      >
        <div class="modal-dialog modal-md modal-dialog-centered upm-dialog">
          <div class="modal-content upm-content">
            {/* HEADER */}
            <div class="modal-header upm-header">
              <div className="upm-header-text">
                <h5 class="modal-title upm-title">Update User Profile</h5>
              </div>

              {common?.mobileNo !== undefined && common?.mobileNo !== null && (
                <button
                  className="upm-close"
                  aria-label="Close"
                  onClick={() => {
                    props.setShowUserModal(false);
                    handleClose();
                  }}
                >
                  <i class="bi bi-x-lg"></i>
                </button>
              )}
            </div>

            {/* BODY */}
            <div class={`modal-body create-practice-height scrollbar upm-body`}>
              <div className="upm-grid">
                <div className="upm-field">
                  <label className="upm-label">
                    First Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="input-text upm-input"
                    placeholder="Enter first name"
                    value={socialObj.firstName}
                    onChange={(e) => {
                      const inputValue = e.target.value;
                      const trimmedValue = inputValue
                        .replace(/\s+/g, "")
                        .slice(0, 30); // Remove all spaces
                      if (/\d/.test(trimmedValue)) {
                        return;
                      }
                      const capitalizedValue =
                        trimmedValue.charAt(0).toUpperCase() +
                        trimmedValue.slice(1);
                      setSocialObj({
                        ...socialObj,
                        firstName: capitalizedValue,
                      });
                    }}
                  />
                  {requireErrorMessage &&
                  (socialObj.firstName === undefined ||
                    socialObj.firstName === "") ? (
                    <label className="validation upm-validation">
                      {ERROR_MESSAGES}
                    </label>
                  ) : (
                    ""
                  )}
                </div>

                <div className="upm-field">
                  <label className="upm-label">
                    Last Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="input-text upm-input"
                    placeholder="Enter last name"
                    value={socialObj.lastName}
                    onChange={(e) => {
                      const inputValue = e.target.value;
                      const trimmedValue = inputValue
                        .replace(/\s+/g, "")
                        .slice(0, 30); // Remove all spaces
                      if (/\d/.test(trimmedValue)) {
                        return;
                      }
                      const capitalizedValue =
                        trimmedValue.charAt(0).toUpperCase() +
                        trimmedValue.slice(1);
                      setSocialObj({
                        ...socialObj,
                        lastName: capitalizedValue,
                      });
                    }}
                  />
                  {requireErrorMessage &&
                  (socialObj.lastName === undefined ||
                    socialObj.lastName === "") ? (
                    <label className="validation upm-validation">
                      {ERROR_MESSAGES}
                    </label>
                  ) : (
                    ""
                  )}
                </div>

                <div className="upm-field upm-field-full">
                  <label className="upm-label">
                    Email Address <span className="text-danger">*</span>
                  </label>
                  {props.Edit ? (
                    <>
                      <Tooltip title="If you want to change your email, please contact the admin.">
                        <div className="upm-input-wrap">
                          <input
                            type="text"
                            className="input-text upm-input upm-input-locked"
                            placeholder="Enter email address"
                            onChange={(e) =>
                              setSocialObj({
                                ...socialObj,
                                email: e.target.value,
                              })
                            }
                            disabled={props.Edit}
                            value={socialObj.email}
                          />
                          <i className="bi bi-lock-fill upm-input-lock"></i>
                        </div>
                      </Tooltip>
                      <span className="upm-hint">
                        If you want to change your email, please contact the
                        admin.
                      </span>
                    </>
                  ) : (
                    <input
                      type="text"
                      className="input-text upm-input"
                      placeholder="Enter email address"
                      onChange={(e) => {
                        const trimmedValue = e.target.value.trim();
                        if (!trimmedValue.startsWith(" ")) {
                          setSocialObj({
                            ...socialObj,
                            email: trimmedValue,
                          });
                        }
                      }}
                      disabled={props.Edit}
                      value={socialObj.email}
                    />
                  )}

                  {requireErrorMessage ? (
                    socialObj.email === undefined || socialObj.email === "" ? (
                      <label className="validation upm-validation">
                        {ERROR_MESSAGES}
                      </label>
                    ) : !emailRegex.test(socialObj.email) ? (
                      <label className="validation upm-validation">
                        Enter a valid email.
                      </label>
                    ) : null
                  ) : null}
                </div>

                <div className="upm-field upm-field-full">
                  <label htmlFor="useremail" className="upm-label">
                    Phone Number <span className="text-danger">*</span>
                  </label>
                  <div className="phone-input-div upm-phone">
                    <Select
                      classNamePrefix="app-select"
                      className="phone-input-country-code upm-select"
                      options={CountryCodeOption}
                      value={CountryCodeOption?.filter(
                        (i) => i.value === socialObj.phoneCode,
                      )}
                      onChange={(selectedOption) => {
                        setSocialObj({
                          ...socialObj,
                          phoneCode: selectedOption.value,
                        });
                      }}
                    />
                    <div className="phone-input-number-div">
                      <input
                        className="input-text upm-input"
                        type="text"
                        placeholder="Enter phone number"
                        value={socialObj.phone}
                        onChange={(e) => {
                          const sanitizedInput = e.target.value
                            .replace(/[^0-9]/g, "")
                            .slice(0, 15);
                          setSocialObj({
                            ...socialObj,
                            phone: sanitizedInput,
                          });
                        }}
                      />
                    </div>
                  </div>
                  {requireErrorMessage &&
                  (socialObj.phoneCode === "" ||
                    socialObj.phoneCode === null ||
                    socialObj.phone === "" ||
                    socialObj.phone === null) ? (
                    <label className="validation upm-validation">
                      {ERROR_MESSAGES}
                    </label>
                  ) : requireErrorMessage &&
                    !isValidPhoneNumber(socialObj.phone) ? (
                    <label className="validation upm-validation">
                      {" "}
                      Invalid phone number{" "}
                    </label>
                  ) : (
                    ""
                  )}
                </div>

                <div
                  className={
                    props.Edit ? "upm-field upm-field-full" : "upm-field"
                  }
                >
                  <label className="upm-label">
                    Country <span className="text-danger">*</span>
                  </label>

                  <Select
                    classNamePrefix="app-select"
                    className="upm-select"
                    id="customerName-field"
                    options={CountryNameOption.slice(2)}
                    value={CountryNameOption?.filter(
                      (i) => i.value === socialObj.country,
                    )}
                    onChange={(country) => {
                      setSocialObj({ ...socialObj, country: country.value });
                    }}
                    menuPlacement={"auto"}
                  />
                  {requireErrorMessage &&
                  (socialObj.country === "" || socialObj.country === null) ? (
                    <label className="validation upm-validation">
                      {ERROR_MESSAGES}
                    </label>
                  ) : (
                    ""
                  )}
                </div>

                {!props.Edit && (
                  <div className="upm-field">
                    <label className="upm-label">
                      User Role <span className="text-danger">*</span>
                    </label>

                    <Select
                      classNamePrefix="app-select"
                      className="user-role-select upm-select"
                      // id="customerName-field"
                      value={userRoleValue}
                      onChange={(roleTypeID_ForUpdate) => {
                        setSocialObj({
                          ...socialObj,
                          roleTypeID_ForUpdate: roleTypeID_ForUpdate.value,
                        });
                      }}
                      options={UserRoleTypeLookupList}
                      placeholder="Select..."
                      menuPlacement={"auto"}
                      // className="form-select placeholderStyle h-40"
                    />
                    {requireErrorMessage &&
                    (socialObj.roleTypeID_ForUpdate === "" ||
                      socialObj.roleTypeID_ForUpdate === null ||
                      socialObj.roleTypeID_ForUpdate === undefined) ? (
                      <label className="validation upm-validation">
                        {ERROR_MESSAGES}
                      </label>
                    ) : (
                      ""
                    )}
                  </div>
                )}
              </div>

              {errorMessage ? (
                <label className="validation upm-form-error">
                  {errorMessage}
                </label>
              ) : (
                ""
              )}
            </div>

            {/* FOOTER */}
            <div class="modal-footer upm-footer">
              {common?.mobileNo !== undefined && common?.mobileNo !== null && (
                <button
                  type="button"
                  className="upm-btn upm-btn-ghost"
                  onClick={() => {
                    props.setShowUserModal(false);
                    handleClose();
                  }}
                >
                  <span>Cancel</span>
                </button>
              )}

              <button
                className="btn btn-md btn-primary create-item-btn upm-btn upm-btn-primary"
                onClick={() => {
                  RegistrationAddUpdateBtnClicked();
                }}
              >
                <span>Update Profile</span>
              </button>
            </div>
          </div>
          <SuccessModal
            openSuccessModal={openSuccessModal}
            handleClose={handleCloseModal}
            message="User profile has been updated successfully."
            modelAction="ShowMessage"
          />
        </div>
      </div>
    </div>
  );
};

export default UserModelNew;
