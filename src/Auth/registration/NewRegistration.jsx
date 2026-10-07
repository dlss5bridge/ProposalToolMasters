/* global $ */
import React, { useContext, useEffect, useState } from "react";
import "../login/LoginStyle.css";
import { useMsal } from "@azure/msal-react";
import logoImg from "../../assets/images/company-logos/logo-outbooks-proposal.webp";
import signupImg from "../../assets/images/signup.webp";
import iconFacebook from "../../assets/images/icon-fb.webp";
import iconX from "../../assets/images/icon-x.webp";
import iconLinkedin from "../../assets/images/icon-ln.webp";
import iconYoutube from "../../assets/images/icon-yt.webp";
import Select from "react-select";
import SendEmailPopUpBox from "../../components/SendEmailPopupBox";
import { CountryName, CountryCode } from "../../redux/Services/CountryApi";
import { AddUpdateUser } from "../../redux/Services/Auth/RegistrationApi";
import { useLocation, useNavigate } from "react-router-dom";
import { ERROR_MESSAGES } from "../../components/GlobalMessage";
import { AuthContextProvider } from "../../AuthContext/AuthContext";
import {
  VerifyAuthenticateWithSocialMediaByToken,
  VerifySocialMediaLoginCredential,
} from "../../redux/Services/Auth/loginApi";
import { useDispatch, useSelector } from "react-redux";
import { updateState } from "../../redux/Persist";
import { USER_ROLE_TYPE } from "../../Middleware/enums";
import microsoftLogo from "../../assets/images/login-with-icon/icon-microsoft-login.webp";
import { loginRequest } from "../../config/microsoftConfig";
import GoogleLoginButton from "../login/GoogleLoginButton";
import "./NewRegistration.css";

const NewRegistration = () => {
  /*                               State Declare                              */
  // Regex of Email id and phone number
  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  const phoneNumberRegex = /^\d{10,15}$/; // Allow between 10 and 15 digits

  const dispatch = useDispatch();
  const common = useSelector((state) => state.Storage);
  const { instance } = useMsal();
  const [countryCode, setCountryCode] = useState([]);
  const [token, setToken] = useState();
  const [countryName, setcountryName] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [requireErrorMessage, setRequireErrorMessage] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const location = useLocation();
  const {
    setTopbar,
    setLoginLoader,
    SetAccessCount,
    toggleMenuVisibility,
    isMenuVisible,
    setMenuVisible,
  } = useContext(AuthContextProvider);
  const [checkboxChecked, setCheckboxChecked] = useState(false);
  const state = location.state;
  const [regObj, setRegObj] = useState({
    firstName: state?.firstName || "",
    lastName: state?.lastName || "",
    email: state?.email || undefined,
    phone: null,
    phoneCode: { value: 9, label: "+44" },
    country: null,
  });
  const navigate = useNavigate();
  useEffect(() => {
    GetCountryCodeData();
    GetCountryNameData();
    setTopbar("none");
    setMenuVisible(false);
  }, []);

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
  // 2) Country option Type Lookup List Api
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
  //3]Add Update Button Click Function
  const RegistrationAddUpdateBtnClicked = () => {
    if (
      regObj.firstName === undefined ||
      regObj.firstName === "" ||
      regObj.lastName === undefined ||
      regObj.lastName === "" ||
      regObj.email === undefined ||
      regObj.email === "" ||
      !emailRegex.test(regObj.email) || // Check if email matches the regex pattern
      regObj.phone === null ||
      regObj.phone === "" ||
      !phoneNumberRegex.test(regObj.phone) || // Check if phone
      regObj.country === null ||
      regObj.country === "" ||
      regObj.phoneCode === null ||
      regObj.phoneCode === "" ||
      !checkboxChecked
    ) {
      setRequireErrorMessage(true);
      return false; // Return false.
    } else {
      setRequireErrorMessage(""); // Clear the error message if there are no errors.
    }
    // Clear the error message and set close to true if there are no errors.
    setErrorMessage("");

    // Preparing Object For Add Update if everything correct.
    const ApiRequest_ParamsObj = {
      UserKeyID: null,
      UserKeyID_ForUpdate: null,
      firstName: regObj.firstName,
      lastName: regObj.lastName,
      email: regObj.email,
      countryCodeID: regObj.phoneCode?.value,
      countryID: regObj.country?.value,
      phoneNumber: regObj.phone,
    };

    AddUpdateRegistrationData(ApiRequest_ParamsObj);
  };
  // 4) Add Update User Register Data Api
  const AddUpdateRegistrationData = async (ApiRequest_ParamsObj) => {
    setLoginLoader(true);
    setName(regObj.firstName);
    setEmail(regObj.email);
    try {
      const response = await AddUpdateUser(ApiRequest_ParamsObj);
      if (response) {
        setLoginLoader(false);
        if (response?.data?.statusCode === 200) {
          const Token = response.data.responseData.data;
          if (state !== undefined && state !== null && state !== "") {
            navigate(`/activate?token=${Token}`);
            setCheckboxChecked(false);
          } else {
            setToken(response?.data?.responseData.data);
            $("#" + "SendEmail").modal("show");
            setRegObj({
              firstName: "",
              lastName: "",
              email: "",
              phone: "",
              country: "",
              phoneCode: { value: 9, label: "+44" },
            });
            setCheckboxChecked(false);
          }
        } else {
          setErrorMessage(response?.response?.data?.errorMessage);
          $("#" + "SendEmail").modal("hide");
        }
      }
    } catch (error) {
      console.log(error);
    }
  };
  // Validation for phone number
  const isValidPhoneNumber = (phoneNumber) => {
    const phoneNumberRegex = /^\d{10,15}$/; // Allow between 10 and 15 digits
    return phoneNumberRegex.test(phoneNumber);
  };
  const handleCheckboxChange = () => {
    setCheckboxChecked(!checkboxChecked);
  };
  // 1] Social Media logic api function call
  const handleSocialMediaLogin = async (SocialRequest_ParamsObj) => {
    let apiUrl;
    if (SocialRequest_ParamsObj.loginBy === "Microsoft") {
      apiUrl = await VerifySocialMediaLoginCredential(SocialRequest_ParamsObj);
    } else {
      apiUrl = await VerifyAuthenticateWithSocialMediaByToken(
        SocialRequest_ParamsObj
      );
    }
    if (apiUrl) {
      if (apiUrl?.data?.statusCode === 200) {
        const token = apiUrl.data.responseData.data.token;
        const mobileNo = apiUrl.data.responseData.data.mobileNo;
        const isPasswordSet = apiUrl.data.responseData.data.isPasswordSet;
        const roleTypeId = apiUrl.data.responseData.data.roleTypeId;
        const userId = apiUrl.data.responseData.data.userId;
        const userKeyID = apiUrl.data.responseData.data.userKeyID;
        const name = apiUrl.data.responseData.data.firstName;
        const organisationCount =
          apiUrl.data.responseData.data.organisationCount;
        const enableMFA = apiUrl.data.responseData.data.enableMFA;
        const modelData = apiUrl.data.responseData.data;
        const userAccessList = apiUrl.data.responseData.data.userAccessList;
        const logoutMilliseconds = modelData.loginSessionTime * 60000;
        const currency = "GBP";
        // Set the value in local storage
        localStorage.setItem("logoutMilliseconds", logoutMilliseconds);
        // Count the number of true values
        const trueCount = userAccessList.reduce((count, item) => {
          return count + (item.setDefaultAction === true ? 1 : 0);
        }, 0);
        // Set the access count based on the total count of true values
        let newAccessCount = trueCount > 0 ? trueCount : 0;
        SetAccessCount(newAccessCount);
        // Store accessCount in local storage
        localStorage.setItem("accessCount", newAccessCount);

        dispatch(
          updateState({
            isAuth: "yes",
            userType: "",
            roleTypeId: roleTypeId,
            email: SocialRequest_ParamsObj?.email,
            mobileNo: mobileNo,
            token: token,
            name: name,
            userId: userId,
            isPasswordSet: isPasswordSet,
            userKeyID: userKeyID,
            organisationCount: organisationCount,
            organisationID: roleTypeId == USER_ROLE_TYPE.SuperAdmin ? null : 1,
            organisationKeyID:
              roleTypeId == USER_ROLE_TYPE.SuperAdmin ? null : "",
            enableMFA: enableMFA,
            isUpdateRole: false,
            enableEL: roleTypeId == USER_ROLE_TYPE.SuperAdmin ? 1 : 0,
            currency: currency,
          })
        );
        if (common.organisationCount === 0) {
          navigate("/get-started");
        } else {
          navigate("/");
        }
      }
    }
  };
  const MicrosoftLogin = () => {
    instance
      .loginPopup(loginRequest)
      .then((result) => {
        const data = result.account;
        const userName = data.name.split(" ");

        const SocialRequest_ParamsObj = {
          email: data.username,
          firstName: userName[0],
          lastName: userName[1],
          loginBy: "Microsoft",
          tokenID: result.idToken,
        };
        handleSocialMediaLogin(SocialRequest_ParamsObj);
      })
      .catch((e) => {
        console.log("result", e);
      });
  };
  const CountryNameOption = countryName.map((name) => ({
    value: name.countryId,
    label: name.countryName,
  }));
  const CountryCodeOption = countryCode.map((code) => ({
    value: code.countryCodeId,
    label: code.countryCode,
  }));
  return (
    <React.Fragment>
      <div>
        <header className="lnheader">
          <div className="lnnav-bar">
            <div className="lnlogo">
              <a className="lna" href="https://outbooks.com/proposal/">
                <img src={logoImg} alt="Outbooks" />
              </a>
              <div className="mbMenuCont">
                <button className="mbTgl" onClick={toggleMenuVisibility}>
                  &#9776;
                </button>

                <div
                  id="mbMenu"
                  className={`lnmenu mb-lnmenu ${
                    isMenuVisible ? "show" : "hide"
                  }`}
                >
                  <ul className="lnul">
                    <li>
                      <a className="lna" href="https://outbooks.com/proposal/">
                        HOME
                      </a>
                    </li>
                    <li className="tosb-nav">
                      <a
                        className="lna"
                        href="https://outbooks.com/proposal/features/"
                      >
                        FEATURES &#x25BE;
                      </a>
                      <ul className="sb-nav">
                        <li>
                          <a
                            className="lna"
                            href="https://outbooks.com/proposal/engagement-letter/"
                          >
                            Engagement Letter
                          </a>
                        </li>
                        <li>
                          <a
                            className="lna"
                            href="https://outbooks.com/proposal/professional-proposal-renewals/"
                          >
                            Professional Proposal & Renewal
                          </a>
                        </li>
                        <li>
                          <a
                            className="lna"
                            href="https://outbooks.com/proposal/consistent-pricing/"
                          >
                            Consistent Pricing
                          </a>
                        </li>
                        <li>
                          <a
                            className="lna"
                            href="https://outbooks.com/proposal/client-payment/"
                          >
                            Client Payment
                          </a>
                        </li>
                      </ul>
                    </li>
                    <li>
                      <a
                        className="lna"
                        href="https://outbooks.com/proposal/contact-us/"
                      >
                        CONTACT US
                      </a>
                    </li>
                    <li>
                      <a
                        className="lna"
                        onClick={() => {
                          navigate("/login");
                          setMenuVisible(false);
                        }}
                      >
                        Login
                      </a>
                    </li>
                    <li>
                      <a
                        className="lna"
                        onClick={() => {
                          navigate("/registration");
                          setMenuVisible(false);
                        }}
                      >
                        Signup
                      </a>
                    </li>
                    <li>
                      <a
                        className="lna"
                        href="https://outlook.office.com/bookwithme/user/4a35845a9f444012a9e5a4f2fbe159b2%40outbooks.com?anonymous&ismsaljsauthenabled=true"
                        target="_Blank"
                      >
                        Book a Free Demo
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="lnmenu lp-lnmenu">
              <ul className="lnul">
                <li>
                  <a className="lna" href="https://outbooks.com/proposal/">
                    HOME
                  </a>
                </li>
                <li>
                  <a
                    className="lna"
                    href="https://outbooks.com/proposal/features/"
                  >
                    FEATURES &#x25BE;
                  </a>
                  <ul className="sb-nav">
                    <li>
                      <a
                        className="lna"
                        href="https://outbooks.com/proposal/engagement-letter/"
                      >
                        Engagement Letter
                      </a>
                    </li>
                    <li>
                      <a
                        className="lna"
                        href="https://outbooks.com/proposal/professional-proposal-renewals/"
                      >
                        Professional Proposal & Renewal
                      </a>
                    </li>
                    <li>
                      <a
                        className="lna"
                        href="https://outbooks.com/proposal/consistent-pricing/"
                      >
                        Consistent Pricing
                      </a>
                    </li>
                    <li>
                      <a
                        className="lna"
                        href="https://outbooks.com/proposal/client-payment/"
                      >
                        Client Payment
                      </a>
                    </li>
                  </ul>
                </li>
                <li>
                  <a
                    className="lna"
                    href="https://outbooks.com/proposal/contact-us/"
                  >
                    CONTACT US
                  </a>
                </li>
              </ul>
            </div>
            <div className="lnbtn lp-lnmenu">
              <a
                onClick={() => navigate("/registration")}
                className="top3btn t3btn3"
              >
                SIGNUP
              </a>
              <a onClick={() => navigate("/login")} className="top3btn t3btn2">
                LOGIN
              </a>
              <a
                href="https://outlook.office.com/bookwithme/user/4a35845a9f444012a9e5a4f2fbe159b2%40outbooks.com?anonymous&ismsaljsauthenabled=true"
                target="_blank"
                className="top3btn t3btn1"
              >
                BOOK A FREE DEMO
              </a>
            </div>
          </div>
        </header>
        {/* {this.props.loading ? <Loader /> : null} */}
        <div className="lnmain-content">
          <section className="lnsection-one">
            <div className="lnhead-panel">
              <div className="lntext lnleft">
                {/* <h1 className="lnh1 martno">Free Register</h1>
                  <p className="lnp">Get your free Outbooks Proposal account now.</p> */}
                <h2 style={{ color: "#fff" }} className="lnh1 martno">
                  Join
                </h2>
                <p className="lnp">
                  Create a free account to start sending customised proposals
                </p>
              </div>
            </div>
            <div className="lnlogin-panel">
              <a className="lna" name="login"></a>
              <div className="lnlogin-right">
                <table className="lntable" border="0" cellPadding={5}>
                  <tbody>
                    <tr>
                      {/* <td vertical-align="middle" width={300} align="center">
                                                <img
                                                    src={signupImg}
                                                    alt="Proposl Tool Login/Signup"
                                                />
                                            </td> */}
                      <td
                        className="responsive-td"
                        width={300}
                        align="center"
                        style={{ verticalAlign: "middle", padding: "18px" }}
                      >
                        <div style={{ fontSize: "16px", lineHeight: "1.6" }}>
                          <div
                            className="responsive-content"
                            style={{
                              color: "white",
                              fontFamily: "'Gotham', 'Montserrat', sans-serif",
                              maxWidth: "600px",
                              textAlign: "left",
                              margin: "0 auto",
                            }}
                          >
                            <h2
                              style={{
                                fontSize: "35px",
                                fontWeight: "bold",
                                color: "#00e0ff",
                                margin: "0 0 20px 0",
                              }}
                            >
                              Integrate in minutes, no coding needed!
                            </h2>
                            <h3
                              style={{
                                fontSize: "25px",
                                fontWeight: "bold",
                                color: "white",
                                margin: "0 0 20px 0",
                              }}
                            >
                              Create, send and sign proposals, fast and easy.
                            </h3>
                            <p
                              style={{
                                fontSize: "18px",
                                color: "white",
                                margin: "0 0 30px 0",
                              }}
                            >
                              Boost efficiency with seamless automation.
                              <br />
                              Watch how simple it is below!
                            </p>
                            <iframe
                              className="responsive-iframe"
                              width="450"
                              height="250"
                              src="https://www.youtube.com/embed/FtKPfV79mJg?si=FHeX5ApkqKLgY157"
                              frameBorder="0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                              referrerPolicy="strict-origin-when-cross-origin"
                              allowFullScreen
                              style={{ borderRadius: "8px" }}
                            ></iframe>
                          </div>
                        </div>
                      </td>
                      {/* <td width={25}></td> */}
                      <td>
                        <div className="sign-ar">
                          {errorMessage && (
                            <div
                              className="mb-2 fade show justify-content-center align-items-center"
                              style={{
                                marginBottom: "0px",
                                fontSize: "13px",
                                padding: "9px", // Increased padding
                                textAlign: "center", // Centering the text
                                color: "#ec4561",
                              }}
                              role="alert"
                            >
                              {errorMessage}
                            </div>
                          )}

                          <div className="row-f mart">
                            <div
                              className="btn-div sign-f d-flex align-items-center"
                              style={{ cursor: "pointer" }}
                            >
                              <GoogleLoginButton
                                handleSocialMediaLogin={handleSocialMediaLogin}
                              />
                            </div>
                            <div
                              className="btn-div sign-f d-flex align-items-center"
                              style={{ cursor: "pointer" }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  width: "100%",
                                }}
                                onClick={MicrosoftLogin}
                              >
                                <img
                                  src={microsoftLogo}
                                  height={30}
                                  alt="Microsoft"
                                />
                                <span
                                  style={{
                                    marginLeft: "10px",
                                    cursor: "pointer",
                                  }}
                                >
                                  Login with Microsoft
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="row-f ordiv">
                            <hr></hr>
                            <div className="or-devider">or</div>
                          </div>
                          <div className="row">
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                flex: 1,
                              }}
                            >
                              <input
                                type="text"
                                className="lninput lntext sign-f small martno"
                                placeholder="First Name*"
                                style={{ width: "100%" }}
                                value={regObj.firstName}
                                onChange={(e) => {
                                  const inputValue = e.target.value;
                                  const trimmedValue = inputValue
                                    .replace(/\s+/g, "")
                                    .slice(0, 30);
                                  if (/\d/.test(trimmedValue)) return;
                                  const capitalizedValue =
                                    trimmedValue.charAt(0).toUpperCase() +
                                    trimmedValue.slice(1);
                                  setRegObj({
                                    ...regObj,
                                    firstName: capitalizedValue,
                                  });
                                }}
                              />
                              {requireErrorMessage &&
                                (!regObj.firstName ||
                                  state?.firstName === "" ||
                                  state?.firstName === null) && (
                                  <label className="validation registration mt-2">
                                    {ERROR_MESSAGES}
                                  </label>
                                )}
                            </div>

                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                flex: 1,
                              }}
                            >
                              <input
                                type="text"
                                className="lninput lntext sign-f small martno"
                                placeholder="Last Name*"
                                style={{ width: "100%" }}
                                value={regObj.lastName}
                                onChange={(e) => {
                                  const inputValue = e.target.value;
                                  const trimmedValue = inputValue
                                    .replace(/\s+/g, "")
                                    .slice(0, 30);
                                  if (/\d/.test(trimmedValue)) return;
                                  const capitalizedValue =
                                    trimmedValue.charAt(0).toUpperCase() +
                                    trimmedValue.slice(1);
                                  setRegObj({
                                    ...regObj,
                                    lastName: capitalizedValue,
                                  });
                                }}
                              />
                              {requireErrorMessage && !regObj.lastName && (
                                <label className="validation registration mt-2">
                                  {ERROR_MESSAGES}
                                </label>
                              )}
                            </div>
                          </div>

                          {/* <div className="row-f">
                                                        <div className="fname-valid">
                                                            {(requireErrorMessage &&
                                                                (regObj.firstName === undefined ||
                                                                    regObj.firstName === "" ||
                                                                    state?.firstName === "" ||
                                                                    state?.firstName === null)) ? (
                                                                <label className="validation registration">{ERROR_MESSAGES}</label>
                                                            ) : (
                                                                <label className="validation registration invisible">&nbsp;</label> // Empty label to reserve space
                                                            )}
                                                        </div>
                                                        <div className="lname-valid">
                                                            {(requireErrorMessage &&
                                                                (regObj.lastName === undefined || regObj.lastName === "")) ? (
                                                                <label className="validation registration">{ERROR_MESSAGES}</label>
                                                            ) : (
                                                                <label className="validation registration invisible">&nbsp;</label> // Same for last name
                                                            )}
                                                        </div>
                                                    </div> */}

                          <div className="row-f">
                            {state ? (
                              <input
                                disabled
                                type="text"
                                className="lninput lntext sign-f big"
                                placeholder="Email*"
                                value={state?.email}
                                onChange={(e) => {
                                  setErrorMessage("");
                                  const trimmedValue = e.target.value
                                    .replace(/^\s+/g, "")
                                    .slice(0, 50);
                                  setRegObj({ ...regObj, email: trimmedValue });
                                }}
                              />
                            ) : (
                              <input
                                type="text"
                                className="lninput lntext sign-f big"
                                placeholder="Email*"
                                value={regObj.email}
                                onChange={(e) => {
                                  setErrorMessage("");
                                  let enteredValue = e.target.value
                                    .trim()
                                    .toLowerCase();

                                  // Check for consecutive dots
                                  if (enteredValue.includes("..")) {
                                    // If consecutive dots found, remove the last dot
                                    enteredValue = enteredValue.replace(
                                      /\.+/g,
                                      "."
                                    );
                                  }

                                  // Limit the input to 50 characters
                                  enteredValue = enteredValue.slice(0, 50);

                                  // Update the state with the entered value
                                  setRegObj({ ...regObj, email: enteredValue });
                                }}
                              />
                            )}
                            {requireErrorMessage ? (
                              regObj.email === undefined ||
                              regObj.email === "" ? (
                                <label className="validation registration">
                                  {ERROR_MESSAGES}
                                </label>
                              ) : !emailRegex.test(regObj.email) ? (
                                <label className="validation registration">
                                  Enter a valid email.
                                </label>
                              ) : null
                            ) : null}
                          </div>
                          <div className="row-f phone-signup">
                            <div className="phone-input-div">
                              <div className="phone-input-country-code">
                                <Select
                                  classNamePrefix="app-select"
                                  style={{ padding: "5px", width: "100%" }}
                                  options={CountryCodeOption}
                                  value={regObj.phoneCode}
                                  onChange={(selectedOption) => {
                                    setRegObj({
                                      ...regObj,
                                      phoneCode: selectedOption,
                                    });
                                  }}
                                />
                              </div>
                              <div className="phone-input-number-div">
                                <input
                                  style={{ width: "100%" }}
                                  className="input-text"
                                  type="text"
                                  placeholder="Phone Number*"
                                  value={regObj.phone}
                                  onChange={(e) => {
                                    const sanitizedInput = e.target.value
                                      .replace(/[^0-9]/g, "")
                                      .slice(0, 15);
                                    setRegObj({
                                      ...regObj,
                                      phone: sanitizedInput,
                                    });
                                  }}
                                />
                              </div>
                            </div>
                            {requireErrorMessage &&
                            (regObj.phoneCode === "" ||
                              regObj.phoneCode === null ||
                              regObj.phone === "" ||
                              regObj.phone === null) ? (
                              <label className="validation registration">
                                {ERROR_MESSAGES}
                              </label>
                            ) : requireErrorMessage &&
                              !isValidPhoneNumber(regObj.phone) ? (
                              <label className="validation registration">
                                {" "}
                                Invalid phone number{" "}
                              </label>
                            ) : (
                              ""
                            )}
                          </div>

                          <div className="row-f country-signup">
                            <Select
                              classNamePrefix="app-select"
                              style={{ padding: "5px", width: "100%" }}
                              options={CountryNameOption.slice(2)}
                              value={regObj.country}
                              onChange={(e) => {
                                const country = e;
                                setRegObj({ ...regObj, country: country });
                              }}
                            />

                            {requireErrorMessage &&
                            (regObj.country === "" ||
                              regObj.country === null) ? (
                              <label className="validation registration">
                                {ERROR_MESSAGES}
                              </label>
                            ) : (
                              ""
                            )}
                          </div>
                          <div className="row-f">
                            <div className="tc-div sign-f">
                              {" "}
                              &nbsp;
                              <input
                                type="checkbox"
                                name="terms"
                                className="lninput lncheckbox sign-f"
                                value="terms"
                                id="checkbox"
                                checked={checkboxChecked}
                                onChange={handleCheckboxChange}
                              />{" "}
                              <p className="lnp tc-2 sign-f terms">
                                By registering you agree to the Outbooks
                                Proposal{" "}
                                <a
                                  className="lna"
                                  href="https://outbooks.com/proposal/terms-and-conditions/"
                                  target="_blank"
                                >
                                  <strong>Terms</strong>
                                </a>
                              </p>
                              {requireErrorMessage && !checkboxChecked && (
                                <label className="validation registration">
                                  Please check the box to agree to the terms and
                                  conditions.
                                </label>
                              )}
                            </div>
                          </div>
                          <div className="row-f">
                            <button
                              type="submit"
                              name="submit"
                              className="lnpage-btn lnlogin sign-f"
                              onClick={RegistrationAddUpdateBtnClicked}
                            >
                              REGISTER
                            </button>
                          </div>

                          <div className="row-f">
                            <div className="tc-div sign-f">
                              <span className="tc-2 sign-f">
                                {" "}
                                &nbsp;Already have an account?
                              </span>{" "}
                              &nbsp;{" "}
                              <a
                                className="lna"
                                onClick={() => navigate("/login")}
                              >
                                <strong>SIGN IN</strong>
                              </a>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>

        <footer className="lnfooter">
          <div className="lncol-1">
            <div className="lnlogo">
              <a className="lna" href="https://outbooks.com/proposal/">
                <img src={logoImg} alt="Outbooks Proposal" />
              </a>
            </div>
            <div className="lnmenu">
              <ul className="lnul lnnav-list">
                <li>
                  <a className="lna" href="https://outbooks.com/proposal/">
                    HOME
                  </a>
                </li>
                <li>
                  <a
                    className="lna"
                    onClick={() => {
                      navigate("/registration");
                      setMenuVisible(false);
                    }}
                  >
                    SIGN UP
                  </a>
                </li>
                <li>
                  <a
                    className="lna"
                    href="https://outbooks.com/proposal/features/"
                  >
                    FEATURES
                  </a>
                </li>
                <li>
                  <a
                    className="lna"
                    href="https://outbooks.com/proposal/contact-us/"
                  >
                    CONTACT US
                  </a>
                </li>
              </ul>
            </div>
            <p className="lnp lncopy-right">
              Copyright © Outbooks Proposal {new Date().getFullYear()} | All
              Rights Reserved
            </p>
          </div>
          <div className="lncol-2">
            <div className="lnmenu footer-m1">
              <ul className="lnul lnnav-list">
                <li>
                  <a
                    className="lna"
                    href="https://outbooks.com/proposal/contact-us"
                  >
                    Help Center
                  </a>
                </li>
                <li>
                  <a
                    className="lna"
                    href="https://outbooks.com/proposal/articles/"
                  >
                    Blogs
                  </a>
                </li>
                <li>
                  <a
                    className="lna"
                    href="https://outbooks.com/proposal/terms-and-conditions/"
                  >
                    Terms and Conditions
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="lncol-3">
            <p>
              <b>OUTBOOKS TECH LTD</b>
            </p>
            <p className="lnp lnadr">
              415 C, MARGARET POWELL HOUSE, Midsummer Blvd,Milton Keynes MK9
              3BN, United Kingdom
            </p>
            <p className="lnp lnregno">Registration No: 15082614</p>
            <ul className="lnul lncontact-links">
              <li>
                <a className="lna" href="mailto:info@outbookstech.com">
                  &#9993; &nbsp; info@outbookstech.com
                </a>
              </li>
              <li>
                <a className="lna" href="tel:+443300578597">
                  &#9743; &nbsp; +44 330 057 8597
                </a>
              </li>
            </ul>
            <ul className="lnul lnsocial-links">
              <li>
                <a
                  className="lna"
                  href="https://www.facebook.com/profile.php?id=61556567720993"
                >
                  <img src={iconFacebook} alt="Facebook" />
                </a>
              </li>
              <li>
                <a
                  className="lna"
                  href="https://www.linkedin.com/company/outbooksproposal/"
                >
                  <img src={iconLinkedin} alt="Linkedin" />
                </a>
              </li>
              <li>
                <a className="lna" href="https://twitter.com/outbookproposal">
                  <img src={iconX} alt="Twitter / X" />
                </a>
              </li>
              <li>
                <a
                  className="lna"
                  href="https://www.youtube.com/channel/UCCucVxt5QuYrJI6SDCDW7sQ"
                >
                  <img src={iconYoutube} alt="Youtube" />
                </a>
              </li>
            </ul>
            <a
              href="https://outbooks.com/proposal/contact-us/"
              className="lna lnpage-btn"
            >
              CONTACT US
            </a>
          </div>
        </footer>
        <SendEmailPopUpBox
          id={"SendEmail"}
          token={token}
          email={email}
          regObj={name}
        />
      </div>
    </React.Fragment>
  );
};

export default NewRegistration;
