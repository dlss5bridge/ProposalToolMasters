import React, { useContext, useEffect, useState } from "react";
import { Row, Col, Card, CardBody } from "reactstrap";
import { Link } from "react-router-dom";
import "./CreatePasswordStyle.css";
import { useNavigate, useLocation } from "react-router-dom";
import { updateState } from "../../redux/Persist";
import logoSm from "../../assets/images/company-logos/outbooks-logo.png";
import { VerifyLoginCredential } from "../../redux/Services/Auth/loginApi";
import { useDispatch } from "react-redux";
import { USER_ROLE_TYPE } from "../../Middleware/enums";
import {
  ValidateUserToken,
  ActivateUserAccount,
} from "../../redux/Services/Auth/PasswordApi";
import { AuthContextProvider } from "../../AuthContext/AuthContext";
import { OutBooksTitle } from "../../components/GlobalMessage";
import SuccessModal from "../../components/SuccessModal";
import { ColorContext } from "../../AuthContext/ColorContext";
import { GetUserPersonalizeSetting } from "../../redux/Services/Personalize/PersonalizeSetting";

const CreateNewPassword = () => {
  // Declare State
  let getUserPersonalizeSettingApiCallCount = 0;
  const { setTopbar, maxCountToRecallApi } = useContext(AuthContextProvider);
  const [errorMessage, setErrorMessage] = useState();
  const [verifyToken, setVerifyToken] = useState("");
  const { setLoader } = useContext(AuthContextProvider);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [requireErrorMessage, setRequireErrorMessage] = useState(false);
  const [openSuccessModal, setOpenSuccessModal] = useState(false);
  const {
    setCurrentCardColor,
    setCurrentTopbarTextColor,
    setCurrentTopbarColor,
  } = useContext(ColorContext);

  const { setEngagementName, setProposalName, setProspectName } =
    useContext(AuthContextProvider);

  let engagementSetting;
  let proposalSetting;
  let prospectSetting;
  const [loginObj, setLoginObj] = useState({
    isAuth: "yes",
    name: null,
    roleTypeId: null,
    email: null,
    token: null,
    userId: null,
    organisationCount: null,
    userKeyID: null,
    organisationID: null,
    organisationKeyID: null,
    isPasswordSet: null,
    loginSessionTime: null,
  });

  const [createNewPassword, setCreateNewPassword] = useState({
    Password: "",
    ConfirmPassword: "",
  });
  const [validationErrors, setValidationErrors] = useState({
    Password: "",
    ConfirmPassword: "",
  });
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const token = searchParams.get("token");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  //initial UseEffects:
  useEffect(() => {
    setTopbar("none");
  }, []);

  useEffect(() => {
    GetUserTokenVerificationStatus();
  }, [token]);

  useEffect(() => {
    GetUserPersonalizeSettingData(loginObj.userId);
  }, [loginObj.token]);

  //Verify token  Function
  const GetUserTokenVerificationStatus = async () => {
    try {
      setLoader(true);
      const tokenType = "ActivateUserAccount";
      const response = await ValidateUserToken(token, tokenType);
      if (response) {
        if (response?.data?.statusCode === 200) {
          setVerifyToken(response?.data?.responseData?.data);
          setLoader(false);
        } else {
          {
            response?.response?.data?.errorMessage
              ? setErrorMessage(response?.response?.data?.errorMessage)
              : setErrorMessage("Something went wrong");
          }
          setLoader(false);
        }
      }
    } catch (error) {
      console.log(error);
      setLoader(false);
    }
  };
  //Update Theme setting
  const GetUserPersonalizeSettingData = async (id) => {
    if (!id) {
      return;
    }
    setLoader(true);
    try {
      const response = await GetUserPersonalizeSetting(id);
      if (response) {
        if (response?.data?.statusCode === 200) {
          setLoader(false);
          getUserPersonalizeSettingApiCallCount = 0;
          const modelData =
            response?.data?.responseData.userPersonalSetting.masterThemeSetting;
          localStorage.removeItem("userThemeSettingLocalStorage");
          localStorage.setItem(
            "userThemeSettingLocalStorage",
            JSON.stringify(modelData)
          );
          // Assuming the properties in ModelData match the setting names
          engagementSetting = modelData.find(
            (item) => item.settingName === "VariableEngagementName"
          );
          proposalSetting = modelData.find(
            (item) => item.settingName === "VariableProposalName"
          );
          prospectSetting = modelData.find(
            (item) => item.settingName === "VariableProspectName"
          );

          const AppearanceHeaderBgColorSetting = modelData.find(
            (item) => item.settingName === "AppearanceHeaderBgColor"
          );
          const AppearanceNavbarMenuListColorSetting = modelData.find(
            (item) => item.settingName === "AppearanceNavbarMenuListColor"
          );
          const AppearanceDashboardCardBgColorSetting = modelData.find(
            (item) => item.settingName === "AppearanceDashboardCardBgColor"
          );
          // Set values based on the found settings
          setCurrentCardColor(
            AppearanceDashboardCardBgColorSetting?.settingValue
          );
          setCurrentTopbarTextColor(
            AppearanceNavbarMenuListColorSetting?.settingValue
          );
          setCurrentTopbarColor(AppearanceHeaderBgColorSetting?.settingValue);
          // Set values based on the found settings
          setEngagementName(engagementSetting?.settingValue);
          setProposalName(proposalSetting?.settingValue);
          setProspectName(prospectSetting?.settingValue);
        } else {
          RecallGetUserPersonalizeSettingData(id);
        }
        setLoader(false);
      } else {
        RecallGetUserPersonalizeSettingData(id);
      }
    } catch (error) {
      setLoader(false);
      console.log(error);
    }
  };
  const RecallGetUserPersonalizeSettingData = (id) => {
    if (getUserPersonalizeSettingApiCallCount < maxCountToRecallApi) {
      getUserPersonalizeSettingApiCallCount += 1;
      setTimeout(function () {
        GetUserPersonalizeSettingData(id);
      }, 1000);
    } else {
      // Stop loader after maximum API call attempts
      setLoader(false);
    }
  };
  //2]Add Update Button Click Function
  const CreateNewPasswordClicked = () => {
    let hasError = false;
    if (
      createNewPassword.Password === undefined ||
      createNewPassword.Password === "" ||
      createNewPassword.ConfirmPassword === undefined ||
      createNewPassword.ConfirmPassword === ""
    ) {
      setRequireErrorMessage(true);
      hasError = true;
      return false; // Return false or handle your error logic here if needed.
    } else if (
      createNewPassword.Password !== createNewPassword.ConfirmPassword
    ) {
      setValidationErrors({
        ...validationErrors,
        ConfirmPassword: "Passwords do not match.",
      });
      hasError = true;
      return false;
    } else {
      hasError = false;
      setRequireErrorMessage(""); // Clear the error message if there are no errors.
    }
    const pass = /^(?=.*\d)(?=.*[-@$!%*#?&])[A-Za-z\d\-@$!%*#?&]{8,}$/.test(
      createNewPassword.Password
    );
    // const pass = /^(?=.*\d)(?=.*[-@$!%*#?&])[A-Za-z\d!@#$%^&*?()_+-]{8,}$/.test(
    //   createNewPassword.Password
    // );
    if (!pass) {
      hasError = true;
    } else {
      hasError = false;
    }

    // Preparing Object For Add Update and if any modification then it will done here
    const ApiRequest_ParamsObj = {
      createPassword: createNewPassword.Password,
      confirmPassword: createNewPassword.ConfirmPassword,
      userToken: token,
    };
    if (!hasError) {
      CreateNewPasswordData(ApiRequest_ParamsObj);
    }
  };
  // 3) Add Update Service Category Data Api
  const CreateNewPasswordData = async (ApiRequest_ParamsObj) => {
    setLoader(true);
    try {
      const activateUserAccountResponse = await ActivateUserAccount(
        ApiRequest_ParamsObj
      );
      if (activateUserAccountResponse) {
        setLoader(false);
        if (activateUserAccountResponse?.data?.statusCode === 200) {
          setOpenSuccessModal(true);
          const Login_obj = {
            username: activateUserAccountResponse?.data?.responseData.data,
            password: createNewPassword.ConfirmPassword,
          };

          const response = await VerifyLoginCredential(Login_obj);

          if (response) {
            if (response?.data?.statusCode === 200) {
              const token = response.data.responseData.data.token;
              const roleTypeId = response.data.responseData.data.roleTypeId;
              const userId = response.data.responseData.data.userId;
              const userKeyID = response.data.responseData.data.userKeyID;
              const FirstName = response.data.responseData.data.firstName;
              const isPasswordSet =
                response.data.responseData.data.isPasswordSet;
              const organisationCount =
                response.data.responseData.data.organisationCount;
              const loginSessionTime =
                response.data.responseData.data.loginSessionTime;
              setLoginObj({
                isAuth: "yes",
                name: FirstName,
                userType: "",
                roleTypeId: roleTypeId,
                email: activateUserAccountResponse?.data?.responseData.data,
                token: token,
                userId: userId,
                organisationCount: organisationCount,
                userKeyID: userKeyID,
                loginSessionTime: loginSessionTime,
                isPasswordSet: isPasswordSet,
                organisationID:
                  roleTypeId == USER_ROLE_TYPE.SuperAdmin ? null : 1,
                organisationKeyID:
                  roleTypeId == USER_ROLE_TYPE.SuperAdmin ? null : "",
              });
              // GetUserPersonalizeSettingData(userKeyID)
            } else {
              setErrorMessage(response?.response?.data?.message);
            }
          }
        } else {
          {
            activateUserAccountResponse?.response?.data.message
              ? setErrorMessage(
                  activateUserAccountResponse?.response?.data.message
                )
              : setErrorMessage("Something went wrong");
          }
        }
      }
    } catch (error) {
      console.log(error);
    }
  };
  //handle Function Change Password
  const handlePasswordChange = (e) => {
    const inputValue = e.target.value;
    const passwordWithoutSpaces = inputValue.replace(/\s+/g, ""); // Remove all spaces

    setCreateNewPassword({
      ...createNewPassword,
      Password: passwordWithoutSpaces,
    });
    validatePassword(passwordWithoutSpaces);
  };
  //handle Function Change Password
  const handleConfirmPasswordChange = (e) => {
    const inputValue = e.target.value;
    const passwordWithoutSpaces = inputValue.replace(/\s+/g, ""); // Remove all spaces

    setCreateNewPassword({
      ...createNewPassword,
      ConfirmPassword: passwordWithoutSpaces,
    });
    validateConfirmPassword(passwordWithoutSpaces);
  };
  //Password Validation Function
  const validatePassword = (password) => {
    const isFieldEmpty = password.trim() === "";
    const patternError = isFieldEmpty
      ? ""
      : /^(?=.*\d)(?=.*[-@$!%*#?&])[A-Za-z\d\-@$!%*#?&]{8,}$/.test(password)
      ? ""
      : "Password should be minimum 8 characters long. It must contain at least 1 letter, at least 1 number and at least one special character, and only from the following set (others not allowed): - @ $ ! % * # ? &";

    setValidationErrors({
      ...validationErrors,
      Password: patternError,
    });
  };
  //Confirm Password Validation Function
  const validateConfirmPassword = (confirmPassword) => {
    if (confirmPassword !== createNewPassword.Password) {
      setValidationErrors({
        ...validationErrors,
        ConfirmPassword: "Passwords do not match.",
      });
      return false;
    } else {
      setValidationErrors({ ...validationErrors, ConfirmPassword: "" });
    }
  };
  //Show hide Password Function.
  const togglePasswordVisibility = (state) => {
    if (state === "Current") {
      setShowCurrentPassword(!showCurrentPassword);
    } else {
      setShowConfirmPassword(!showConfirmPassword);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    // You can also add a custom warning or message here if you want
  };

  const handleToNavigate = () => {
    // dispatch(resetState());
    navigate("/login");
  };
  // close modal and set value local
  const handleCloseModal = () => {
    dispatch(
      updateState({
        isAuth: "yes",
        userType: "",
        name: loginObj.name,
        roleTypeId: loginObj.roleTypeId,
        email: loginObj.activateUserAccountResponse?.data?.responseData.data,
        token: loginObj.token,
        userId: loginObj.userId,
        organisationCount: loginObj.organisationCount,

        userKeyID: loginObj.userKeyID,
        isPasswordSet: loginObj.isPasswordSet,
        organisationID:
          loginObj.roleTypeId == USER_ROLE_TYPE.SuperAdmin ? null : 1,
        organisationKeyID:
          loginObj.roleTypeId == USER_ROLE_TYPE.SuperAdmin ? null : "",
      })
    );

    const logoutMilliseconds = loginObj.loginSessionTime * 60000;

    // Set the value in local storage
    localStorage.setItem("logoutMilliseconds", logoutMilliseconds);
    if (loginObj.roleTypeId !== 1 && loginObj.organisationCount === 0) {
      setOpenSuccessModal(false);
      navigate("/get-started");
    } else {
      setOpenSuccessModal(false);
      navigate("/");
    }
  };
  /* ---------------------- Design Part Start From Here. ---------------------- */
  return (
    <div>
      <div className="account pages ">
        <div className="container">
          <Row className="justify-content-center mt-4">
            <Col md={8} lg={6} xl={5}>
              <div className="position-relative">
                {errorMessage && (
                  <div>
                    <Card className="overflow-hidden">
                      <CardBody className="p-4">
                        <div className="p-3">
                          <h4 className="mt-4 text-center">
                            Something went wrong!
                          </h4>
                        </div>
                      </CardBody>
                    </Card>
                  </div>
                )}

                {verifyToken === "Expired" && (
                  <div className="expired">
                    <svg
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        height: "100%",
                      }}
                      version="1.1"
                      id="Layer_1"
                      x="0px"
                      y="0px"
                      viewBox="0 0 364 390.4"
                      height="350.4"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <style type="text/css">
                        {`
        .st0 { fill: #3D2B1F; } /* Dark brown for the eyes */
        .st1 { fill: #FFDAC1; } /* Light skin tone */
        .st2 { fill: #3D2B1F; } /* Dark brown for the hair */
        .st3 { fill: #FFDAC1; } /* Light skin tone */
        .st4 { fill: #D98D54; } /* Orange-brown for the shirt */
      `}
                      </style>
                      <circle className="st0" cx="126" cy="175.4" r="12" />
                      <circle className="st0" cx="339" cy="175.4" r="12" />
                      <circle className="st1" cx="232.5" cy="170.9" r="106.5" />
                      <path
                        className="st2"
                        d="M126,164.4c0,0,4.5-15.4,10.5-19.6c0,0,31,0,65-26.5c0,0,110,85.9,176-30.8c0,0-33,28.6-116-41.4
                                c0,0-131-16.2-135.5,106V164.4z"
                      />
                      <path
                        className="st2"
                        d="M339,164.4c0,0,6.2-13.3-8.2-32.4l-6.3,3.9C324.5,135.9,333.5,142.9,339,164.4z"
                      />
                      <path
                        className="st2"
                        d="M247.8,45.3c0,0,47.7-5.3,76.7,53.7L247.8,45.3z"
                      />
                      <circle className="st0" cx="192" cy="175.4" r="9" />
                      <circle className="st0" cx="271" cy="175.4" r="9" />
                      <path
                        className="st4"
                        d="M101.4,390.1c22.1-106.8,75.7-114.1,137.1-114.1c61.4,0,104,18.8,130.1,114.1C368.7,390.6,101.3,390.6,101.4,390.1z"
                      />
                      <circle className="st0" cx="234.5" cy="230.5" r="20" />
                    </svg>

                    <div className="message">
                      <h1>Oops, this link is expired</h1>
                    </div>

                    <div className="light">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                    <div className="light_btm">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                )}
                {verifyToken === "Active" && (
                  <Card className="overflow-hidden">
                    <div className="bg-primary bg-backColor">
                      <div
                        className="text-primary text-center p-4 text-center"
                        style={{ backgroundColor: "#626ed4", height: "200px" }}
                      >
                        <div className="home-btn d-none d-sm-block">
                          <div className="display-home-btn">
                            <div>
                              <div
                                onClick={() => {
                                  handleToNavigate();
                                }}
                                style={{ cursor: "pointer" }}
                                className="text-dark"
                              >
                                <i className="fas fa-home icon-home"></i>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div style={{ marginTop: "45px" }}>
                          <h5 className="text-white font-size-20">
                            Activate your account
                          </h5>
                          <p className="text-white-50">
                            Activate your {OutBooksTitle} Account
                          </p>
                        </div>
                        <Link
                          to="/"
                          className="logo logo-admin sm-logo Create-password"
                        >
                          <img
                            src={logoSm}
                            height="45"
                            alt="logo"
                            style={{ marginTop: "11px" }}
                          />
                        </Link>
                      </div>
                    </div>
                    <CardBody className="p-4">
                      <div className="p-2">
                        <div
                          className=" text-center mt-3"
                          style={{ justifyContent: "center" }}
                        >
                          Password should be minimum 8 characters long. It must
                          contain at least 1 letter, at least 1 number and at
                          least one special character, and only from the
                          following set (others not allowed): - @ $ ! % * # ? &
                        </div>
                        {verifyToken !== "Expired" && (
                          <div className="mt-3 " style={{ fontSize: "12px" }}>
                            <label
                              className={
                                createNewPassword?.Password?.length >= 8
                                  ? "text-success"
                                  : "validation"
                              }
                            >
                              Minimum of 8 characters long{" "}
                              {createNewPassword.Password.length >= 8 && (
                                <span>&#10004;</span>
                              )}
                            </label>
                            <br />
                            <label
                              className={
                                /[a-zA-Z]/.test(createNewPassword?.Password)
                                  ? "text-success"
                                  : "validation"
                              }
                            >
                              Include at least one letter{" "}
                              {/[a-zA-Z]/.test(createNewPassword.Password) && (
                                <span>&#10004;</span>
                              )}
                            </label>
                            <br />
                            <label
                              className={
                                /\d/.test(createNewPassword?.Password)
                                  ? "text-success"
                                  : "validation"
                              }
                            >
                              Include at least one number{" "}
                              {/\d/.test(createNewPassword.Password) && (
                                <span>&#10004;</span>
                              )}
                            </label>
                            <br />
                            <label
                              className={
                                /[-@$!%*#?&]/.test(
                                  createNewPassword?.Password
                                ) &&
                                !/[^A-Za-z0-9\-@$!%*#?&]/.test(
                                  createNewPassword?.Password
                                )
                                  ? "text-success"
                                  : "validation"
                              }
                            >
                              Include at least one special character, and only
                              from the following set (others not allowed): - @ $
                              ! % * # ? &{" "}
                              {/[-@$!%*#?&]/.test(
                                createNewPassword?.Password
                              ) &&
                                !/[^A-Za-z0-9\-@$!%*#?&]/.test(
                                  createNewPassword?.Password
                                ) && <span>&#10004;</span>}
                            </label>

                            <br />
                          </div>
                        )}

                        <label
                          className="form-label mt-4"
                          htmlFor="password-input"
                        >
                          Create Password <span className="text-danger">*</span>
                        </label>
                        <div className="position-relative auth-pass-inputgroup overflow-hidden">
                          <div className="input-group">
                            <input
                              onPaste={handlePaste}
                              type={showCurrentPassword ? "text" : "password"}
                              className="input-text"
                              placeholder="Create Password"
                              value={createNewPassword.Password}
                              onChange={handlePasswordChange}
                              required
                              maxLength={20}
                              onCopy={(e) => e.preventDefault()} // Prevent default copy behavior
                              onCut={(e) => e.preventDefault()} // Prevent default cut behavior
                              onDrag={(e) => e.preventDefault()} // Prevent default drag behavior
                              onDrop={(e) => e.preventDefault()} // Prevent default drop behavior
                            />
                          </div>
                          <button
                            className="btn btn-link position-absolute end-0 top-0 text-decoration-none text-muted password-addon"
                            type="button"
                            id="password-addon"
                            onClick={() => togglePasswordVisibility("Current")}
                          >
                            <i className="ri-eye-fill align-middle"></i>
                          </button>
                          {validationErrors.Password && (
                            <label className="validation">
                              {validationErrors.Password}
                            </label>
                          )}
                          {requireErrorMessage &&
                          (createNewPassword.Password === undefined ||
                            createNewPassword.Password === "") ? (
                            <label className="validation">
                              This field is required.
                            </label>
                          ) : (
                            ""
                          )}
                        </div>
                        <label
                          className="form-label mt-3"
                          htmlFor="password-input"
                        >
                          Confirm Password{" "}
                          <span className="text-danger">*</span>
                        </label>
                        <div className="position-relative auth-pass-inputgroup overflow-hidden">
                          <div className="input-group">
                            <input
                              onPaste={handlePaste}
                              type={showConfirmPassword ? "text" : "password"}
                              className="input-text"
                              value={createNewPassword.ConfirmPassword}
                              onChange={handleConfirmPasswordChange}
                              required
                              placeholder="Confirm Password"
                              maxLength={20}
                              onCopy={(e) => e.preventDefault()} // Prevent default copy behavior
                              onCut={(e) => e.preventDefault()} // Prevent default cut behavior
                              onDrag={(e) => e.preventDefault()} // Prevent default drag behavior
                              onDrop={(e) => e.preventDefault()} // Prevent default drop behavior
                            />
                          </div>
                          <button
                            className="btn btn-link position-absolute end-0 top-0 text-decoration-none text-muted password-addon"
                            type="button"
                            id="password-addon"
                            onClick={() => togglePasswordVisibility("Confirm")}
                          >
                            <i className="ri-eye-fill align-middle"></i>
                          </button>

                          {createNewPassword.Password &&
                            createNewPassword.ConfirmPassword &&
                            createNewPassword.Password !==
                              createNewPassword.ConfirmPassword && (
                              <label className="validation">
                                Passwords do not match.
                              </label>
                            )}
                          {requireErrorMessage &&
                          (createNewPassword.ConfirmPassword === undefined ||
                            createNewPassword.ConfirmPassword === "") ? (
                            <label className="validation">
                              This field is required.
                            </label>
                          ) : (
                            ""
                          )}
                        </div>
                        <Row className="form-group mt-4">
                          <Col sm={12} className="text-right">
                            <button
                              className="btn btn-md btn-primary w-md btn-block create-item-btn "
                              type="submit"
                              onClick={CreateNewPasswordClicked}
                            >
                              <span> Activate Your Account</span>
                            </button>
                          </Col>
                        </Row>
                      </div>
                    </CardBody>

                    {errorMessage && (
                      <div
                        className="alert alert-danger fade show"
                        style={{
                          marginBottom: "0px",
                          fontSize: "small",
                          padding: "4px",
                        }}
                        role="alert"
                      >
                        {errorMessage}
                      </div>
                    )}
                  </Card>
                )}
              </div>
            </Col>
          </Row>
        </div>
      </div>
      <SuccessModal
        keepPopup
        openSuccessModal={openSuccessModal}
        handleClose={handleCloseModal}
        isBackDropDisplay={true}
        message="Your account has been activated successfully."
        modelAction="ShowMessage"
      />
    </div>
  );
};

export default CreateNewPassword;
