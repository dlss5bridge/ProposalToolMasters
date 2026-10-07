/* global $ */
import React, { useContext, useEffect, useRef, useState } from "react";
import { AuthContextProvider } from "../../../AuthContext/AuthContext";
import "../../configure/packages/Package.css";
import "./Update-practice-details.css";
import { GetBusinessTypeLookupList } from "../../../redux/Services/Master/BusinessTypeLookupListApi";
import { ERROR_MESSAGES } from "../../../components/GlobalMessage";
import Upload_image_modal from "../../../components/UpdateImageModel/Upload_image_modal";
import Upload_Logo_Modal from "../../../components/UpdateImageModel/Upload_logo_modal";
import AddressModal from "../../../components/AddressModal/AddressModal";
import Utils from "../../../Middleware/Utils";
import Select from "react-select";
import {
  GetCompanyDetails,
  GetCompanyList,
  GetCompanyOfficers,
} from "../../../redux/Services/Master/companyDetailsAPI";
import { Row, Col, Card, CardBody } from "reactstrap";
import DatePicker from "react-date-picker";
import "react-date-picker/dist/DatePicker.css";
import "react-calendar/dist/Calendar.css";
import { useDispatch, useSelector } from "react-redux";
import { CountryCode, CountryName } from "../../../redux/Services/CountryApi";
import CancelIcon from "@mui/icons-material/Cancel";
import {
  CLIENT_TYPES,
  CREATE_PRACTICE_DETAILS,
} from "../../../Middleware/enums";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { GetCurrencyTypeList } from "../../../redux/Services/Master/CurrencyTypeLookUpList";
import { FormControl, FormControlLabel, RadioGroup } from "@mui/material";
import Checkbox from "@mui/material/Checkbox";
import {
  AddUpdateLogo,
  AddUpdateOrganisation,
  AddUpdateSignature,
} from "../../../redux/Services/Setting/Organisation";
import SuccessModal from "../../../components/SuccessModal";
import { updateState } from "../../../redux/Persist";
import { GetIncorporatedInLookUpList } from "../../../redux/Services/Master/IncorporatedInLookUpList";
import { GetProfessionTypeLookupList } from "../../../redux/Services/Master/ProfessionTypeApi";
import { forEach } from "lodash";
import ConfirmModel from "../../../components/ConfirmationBox";
import BackButtonSvg from "../../../components/BackButtonSvg";
import InvalidFormIcon from "../../../components/InvalidFormIcon";
import {
  BuyPlan,
  ChoosePlanApi,
  CreateStripeCheckoutSession,
} from "../../../redux/Services/Setting/PaymentGatewayApi";
import { RefreshToken } from "../../../redux/Services/Auth/loginApi";
import "./Create-practice-details.css";
import "../../../components/ChoosePlanForPurchase.css";
import BinarySelect from "../../../components/BinarySelect";
import Android12Switch from "../../../components/AndroidSwitch";

// Basic Information component
const Basic_information = (props) => {
  const [openAddressPopUp, setOpenAddressPopUp] = useState(false);
  const BasicInfoCreatePracticeDivContainerRef = useRef(null);
  const handleAddressPopUpClose = () => {
    setOpenAddressPopUp(false);
  };
  const [type, setType] = useState("");

  const handleImageUpload = () => {
    if (type == "Signature") {
      const file = props.basicInfo.signatoryImage; // Assuming you only want to handle the first selected file
      const reader = new FileReader();
      reader.onload = () => {
        const base64ImageData = reader.result;
        props.setSignature(base64ImageData);
      };
      if (file) {
        reader.readAsDataURL(file);
      }
    }
  };

  const handleOpenTradingAddressPopup = (e) => {
    let tradingAddress = {
      addressLine1: props.basicInfo.tradingAddress?.addressLine1
        ? props.basicInfo.tradingAddress.addressLine1
        : "",
      addressLine2: props.basicInfo.tradingAddress?.addressLine2
        ? props.basicInfo.tradingAddress.addressLine2
        : "",
      locality: props.basicInfo.tradingAddress?.locality
        ? props.basicInfo.tradingAddress.locality
        : "",
      region: props.basicInfo.tradingAddress?.region
        ? props.basicInfo.tradingAddress.region
        : "",
      country: props.basicInfo.tradingAddress?.countryName
        ? props.basicInfo.tradingAddress.countryName
        : "",
      countryId: props.basicInfo.tradingAddress?.countryId
        ? props.basicInfo.tradingAddress.countryId
        : null,
      postcode: props.basicInfo.tradingAddress?.postcode
        ? props.basicInfo.tradingAddress.postcode
        : "",
    };
    props.setAddress(tradingAddress);
    setOpenAddressPopUp(true);
  };

  const handleBusinessTypeChange = (e) => {
    document.getElementById("category-description").value = "";
    props.setConcatenatedTradingAddress("");
    props.setDateValidation(false);
    props.setConcatenatedRegisterAddress("");
    props.setOfficers([
      {
        officerID: null,
        firstName: "",
        lastName: "",
        countryCodeID: 9,
        phoneCountryCodeID: { value: 9, label: "+44" },
        phoneNo: "",
        emailID: "",
        addressID: null,
        isAuthorisedSignatory: false,
        officerRole: "",
        appointedOn: "",
        moduleName: "",
        moduleID: null,
        officersAddress: {
          addressId: null,
          premises: "",
          addressLine1: "",
          addressLine2: "",
          locality: "",
          region: "",
          countryId: null,
          postcode: "",
        },
      },
    ]);
    props.setOfficersError(false);
    props.setConcatenatedResidentialAddress([{ officersFullAddress: "" }]);
    props.setRequireErrorMessage(false);
    props.setBasicInfo({
      ...props.basicInfo,
      businessTypeID: null,
      businessTypeName: "",
      tradingName: "",
      tradingStartDate: "",
      tradingAddress: {
        addressId: null,
        premises: "",
        addressLine1: "",
        addressLine2: "",
        locality: "",
        region: "",
        countryId: null,
        postcode: "",
        countryName: "",
      },
      signatoryName: "",
      signatoryImage: "",
      searchCompany: "",
      companyName: "",
      entityType: "",
      companyNumber: null,
      regOfficeAddress: "",
      incorporateIn: null,
      businessTypeName: e.label,
      businessTypeID: Number(e.value),
    });
    props.setSignature("");
    props.setCompanyForm({
      companyID: 0,
      companyName: "",
      companyType: "",
      companyNumber: "",
      companyStatus: "",
      addressID: null,
      incorporationDate: "",
      incInID: null,
      moduleName: "",
      moduleID: null,
      companyAddress: null,
    });
  };

  const IncorporatedValue = props.incorporatedInList.filter(
    (item) => props.companyForm?.incInID == item.value,
  );

  function formatDate(dateString) {
    const dateObject = new Date(dateString);
    const formattedDate = `${dateObject.getDate()}/${
      dateObject.getMonth() + 1
    }/${dateObject.getFullYear()}`;
    return formattedDate;
  }
  const today = new Date();
  const minDate = new Date(1970, 0, 1);

  // Set the maximum date to today
  const maxDate = today;
  return (
    <>
      <div
        ref={BasicInfoCreatePracticeDivContainerRef}
        onClick={(e) =>
          props.scrollUptoCurrentPosition(
            e,
            BasicInfoCreatePracticeDivContainerRef,
          )
        }
        className="create-practice-height scrollbar cp-scroll"
        id="style-1"
      >
        <div className="cp-body">
          <section className="cp-card">
            <div className="cp-card-head">
              <div>
                <h2 className="cp-card-title">Business Identity</h2>
                <p className="cp-card-subtitle">
                  Tell us what kind of practice you're setting up.
                </p>
              </div>
            </div>

            <div className="cp-card-body">
              <div className="cp-grid">
                <div className="cp-field" id="ProspectType_Div">
                  <label className="cp-label">
                    Profession Types<span className="cp-req">*</span>
                  </label>
                  <Select
                    isMulti
                    className="cp-select"
                    options={props.ProfessionalTypeLookeupListOptions}
                    value={props.professionTypeValue}
                    onChange={props.OnChangeSelectProfessionType}
                  />
                  {props.requireErrorMessage &&
                  props.professionTypeValue?.length === 0 ? (
                    <span className="validation cp-validation">
                      {ERROR_MESSAGES}
                    </span>
                  ) : (
                    ""
                  )}
                </div>

                <div className="cp-field" id="BusinessType_Div">
                  <label className="cp-label">
                    Business Type<span className="cp-req">*</span>
                  </label>
                  <Select
                    className="cp-select"
                    options={props.BusinessTypeLookupList}
                    value={{
                      value: props.basicInfo.businessTypeID,
                      label: props.basicInfo.businessTypeName,
                    }}
                    onChange={(e) => {
                      handleBusinessTypeChange(e);
                    }}
                  />
                  {props.requireErrorMessage &&
                  (props.basicInfo.businessTypeID === "" ||
                    props.basicInfo.businessTypeID === null) ? (
                    <span className="validation cp-validation">
                      {ERROR_MESSAGES}
                    </span>
                  ) : (
                    ""
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* ---------- Sole Trader / Partnership ---------- */}
          {(props.basicInfo.businessTypeID === CLIENT_TYPES.Sole_Trader ||
            props.basicInfo.businessTypeID === CLIENT_TYPES.Partnership) && (
            <>
              <section className="cp-card">
                <div className="cp-card-head">
                  <div>
                    <h2 className="cp-card-title">Trading Details</h2>
                    <p className="cp-card-subtitle">
                      Name, start date and address of the practice.
                    </p>
                  </div>
                </div>

                <div className="cp-card-body">
                  <div className="cp-grid">
                    <div className="cp-field">
                      <label className="cp-label">
                        Trading Name<span className="cp-req">*</span>
                      </label>
                      <input
                        type="text"
                        maxLength={50}
                        className="input-text cp-input"
                        placeholder="Trading Name"
                        value={props.basicInfo.tradingName}
                        onChange={(e) => {
                          const inputValue = e.target.value;
                          const trimmedValue = inputValue.replace(/^\s+/g, "");

                          // Validation: Check if the trimmed value is either alphanumeric or only alphabet but not only numeric
                          const isValidName =
                            /^[a-zA-Z0-9\s,.!?"':;&()-_`]+(?:[a-zA-Z0-9\s,.!?"':;&()-_`]+)*$/.test(
                              trimmedValue,
                            ) && !/^\d+$/.test(trimmedValue);

                          if (isValidName || trimmedValue === "") {
                            const capitalizedValue =
                              trimmedValue.charAt(0).toUpperCase() +
                              trimmedValue.slice(1);
                            props.setBasicInfo({
                              ...props.basicInfo,
                              tradingName: capitalizedValue,
                            });
                          }
                        }}
                      />
                      {props.requireErrorMessage &&
                      (props.basicInfo.tradingName === "" ||
                        props.basicInfo.tradingName === null) ? (
                        <span className="validation cp-validation">
                          {ERROR_MESSAGES}
                        </span>
                      ) : (
                        ""
                      )}
                    </div>

                    <div className="cp-field">
                      <label className="cp-label">
                        Trading Start Date<span className="cp-req">*</span>
                      </label>
                      <div className="cp-datepicker">
                        <DatePicker
                          minDate={minDate}
                          maxDate={maxDate}
                          format="dd/MM/y"
                          dayPlaceholder="dd"
                          monthPlaceholder="mm"
                          yearPlaceholder="yyyy"
                          value={props.basicInfo.tradingStartDate}
                          onChange={(e) => {
                            props.setDateValidation(false);
                            props.setBasicInfo({
                              ...props.basicInfo,
                              tradingStartDate: e,
                            });
                          }}
                        />
                      </div>

                      {props.DateValidation &&
                      (props.basicInfo.tradingStartDate !== "" ||
                        props.basicInfo.tradingStartDate !== null) ? (
                        <span className="validation cp-validation">
                          Invalid Date
                        </span>
                      ) : (
                        ""
                      )}

                      {props.requireErrorMessage &&
                      (props.basicInfo.tradingStartDate === "" ||
                        props.basicInfo.tradingStartDate === null) ? (
                        <span className="validation cp-validation">
                          {ERROR_MESSAGES}
                        </span>
                      ) : (
                        ""
                      )}
                    </div>

                    <div className="cp-field">
                      <label className="cp-label">
                        Trading Address<span className="cp-req">*</span>
                      </label>
                      <input
                        type="text"
                        className="input-text cp-input cp-input-clickable"
                        id="category-description"
                        placeholder="Trading Address"
                        value={props.concatenatedTradingAddress}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          props.setAddressPopUpTitle("Trading Address");
                          handleOpenTradingAddressPopup(e);
                        }}
                        autoComplete="off"
                      />
                      {props.requireErrorMessage &&
                      (props.basicInfo.tradingAddress === "" ||
                        props.basicInfo.tradingAddress === null ||
                        props.concatenatedTradingAddress === null ||
                        props.concatenatedTradingAddress === "") ? (
                        <span className="validation cp-validation">
                          {ERROR_MESSAGES}
                        </span>
                      ) : (
                        ""
                      )}
                    </div>
                  </div>
                </div>
              </section>

              <section className="cp-card">
                <div className="cp-card-head">
                  <div>
                    <h2 className="cp-card-title">E Signature</h2>
                    <p className="cp-card-subtitle">
                      Optional — fill both fields or leave both blank.
                    </p>
                  </div>
                </div>

                <div className="cp-card-body">
                  <div className="cp-grid">
                    <div className="cp-field">
                      <label className="cp-label">
                        Signatory Name
                        {props.signature !== null &&
                          props.signature !== undefined &&
                          props.signature !== "" && (
                            <span className="cp-req">*</span>
                          )}
                      </label>
                      <input
                        type="text"
                        className="input-text cp-input"
                        placeholder="Signatory Name"
                        value={props.basicInfo.signatoryName}
                        onChange={(e) => {
                          let inputValue = e.target.value;
                          // Remove leading spaces
                          inputValue = inputValue.trimLeft();
                          // Capitalize the first letter
                          inputValue =
                            inputValue.charAt(0).toUpperCase() +
                            inputValue.slice(1);
                          // Check if the length is within the limit and there are no digits
                          if (
                            inputValue.length <= 50 &&
                            !/\d/.test(inputValue)
                          ) {
                            props.setBasicInfo({
                              ...props.basicInfo,
                              signatoryName: inputValue,
                            });
                          }
                        }}
                      />
                      {props.requireErrorMessage &&
                      props.signature !== null &&
                      props.signature !== undefined &&
                      props.signature !== "" &&
                      (props.basicInfo.signatoryName === "" ||
                        props.basicInfo.signatoryName === null) ? (
                        <span className="validation cp-validation">
                          {ERROR_MESSAGES}
                        </span>
                      ) : (
                        ""
                      )}
                    </div>

                    <div className="cp-field cp-field-full">
                      <label className="cp-label">
                        Signatory Image
                        {props.basicInfo.signatoryName !== null &&
                          props.basicInfo.signatoryName !== undefined &&
                          props.basicInfo.signatoryName !== "" && (
                            <span className="cp-req">*</span>
                          )}
                      </label>

                      {props.signature ? (
                        <div className="cp-media-box">
                          <div className="cp-media-preview">
                            <img
                              src={props.signature}
                              className="cp-media-img"
                              alt="Selected Signature"
                            />
                          </div>
                          <button
                            onClick={() => {
                              props.setSignature(null);
                              props.setBasicInfo({
                                ...props.basicInfo,
                                signatoryImage: null,
                              });
                            }}
                            className="btn btn-sm btn-danger remove-item-btn cp-btn cp-btn-danger"
                          >
                            <i className="bi bi-trash3"></i>
                            <span>Remove</span>
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="cp-upload-box">
                            <button
                              className="btn btn-md btn-primary create-item-btn cp-btn cp-btn-outline"
                              data-bs-toggle="modal"
                              onClick={() => {
                                setType("Signature");
                              }}
                              data-bs-target="#SignatureUploadModel"
                            >
                              <i className="bi bi-plus-circle"></i>
                              <span>Upload Signature</span>
                            </button>
                            <span className="cp-hint">
                              Supported file types are .jpg, .jpeg, .png up to a
                              file size of 2MB.
                            </span>
                          </div>
                          {props.requireErrorMessage &&
                          props.basicInfo.signatoryName !== null &&
                          props.basicInfo.signatoryName !== undefined &&
                          props.basicInfo.signatoryName !== "" &&
                          (props.signature === "" ||
                            props.signature === null) ? (
                            <span className="validation cp-validation">
                              This field is required if you have entered a value
                              in the above 'Signatory Name' field. To proceed
                              without uploading a signature, please remove the
                              data from 'Signatory Name' above.
                            </span>
                          ) : (
                            ""
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </section>
            </>
          )}

          {/* ---------- Company / LLP ---------- */}
          {(props.basicInfo.businessTypeID === CLIENT_TYPES.Company ||
            props.basicInfo.businessTypeID === CLIENT_TYPES.LLP) && (
            <>
              <section className="cp-card">
                <div className="cp-card-head">
                  <div>
                    <h2 className="cp-card-title">Company Details</h2>
                    <p className="cp-card-subtitle">
                      Search Companies House to auto-fill registered details.
                    </p>
                  </div>
                </div>

                <div className="cp-card-body">
                  <div className="cp-grid">
                    <div className="cp-field cp-field-search">
                      <label className="cp-label">Search Company</label>
                      <input
                        type="text"
                        className="input-text cp-input"
                        id="category-description"
                        placeholder="Search Company"
                        onChange={(e) => props.handleCompanyInputChange(e)}
                        onKeyDown={(e) => {
                          if (e.key === " " && e.target.value === "") {
                            e.preventDefault();
                          }
                        }}
                      />
                      {props.companies.length > 0 && (
                        <div className="autocomplete-input-div show">
                          <ul className="searchList">
                            {props.companies.map((i, index) => (
                              <li
                                key={index}
                                onClick={() => props.handleCompanySelect(i)}
                              >
                                {i.title}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    <div className="cp-field" id="CompanyName">
                      <label className="cp-label">
                        Company Name<span className="cp-req">*</span>
                      </label>
                      <input
                        disabled
                        className="input-text cp-input"
                        placeholder="Company Name"
                        value={props.companyForm.companyName}
                        onChange={(e) =>
                          props.setCompanyForm({
                            ...props.companyForm,
                            companyName: e.target.value,
                          })
                        }
                      />
                      {props.requireErrorMessage &&
                      (props.companyForm.companyName === "" ||
                        props.companyForm.companyName === null) ? (
                        <span className="validation cp-validation">
                          {ERROR_MESSAGES}
                        </span>
                      ) : (
                        ""
                      )}
                    </div>

                    <div className="cp-field">
                      <label className="cp-label">
                        Entity Type<span className="cp-req">*</span>
                      </label>
                      <input
                        disabled
                        className="input-text cp-input"
                        placeholder="Entity Type"
                        value={props.companyForm.companyType}
                        onChange={(e) =>
                          props.setCompanyForm({
                            ...props.companyForm,
                            companyType: e.target.value,
                          })
                        }
                      />
                      {props.requireErrorMessage &&
                      (props.companyForm.companyType === "" ||
                        props.companyForm.companyType === null) ? (
                        <span className="validation cp-validation">
                          {ERROR_MESSAGES}
                        </span>
                      ) : (
                        ""
                      )}
                    </div>

                    <div className="cp-field" id="CompanyNumber">
                      <label className="cp-label">
                        Company Number<span className="cp-req">*</span>
                      </label>
                      <input
                        disabled
                        className="input-text cp-input"
                        placeholder="Company Number"
                        value={props.companyForm.companyNumber}
                        onChange={(e) =>
                          props.setCompanyForm({
                            ...props.companyForm,
                            companyNumber: e.target.value,
                          })
                        }
                      />
                      {props.requireErrorMessage &&
                      (props.companyForm.companyNumber === "" ||
                        props.companyForm.companyNumber === null) ? (
                        <span className="validation cp-validation">
                          {ERROR_MESSAGES}
                        </span>
                      ) : (
                        ""
                      )}
                    </div>

                    <div className="cp-field">
                      <label className="cp-label">
                        Incorporation Date<span className="cp-req">*</span>
                      </label>
                      <input
                        disabled
                        className="input-text cp-input"
                        placeholder="Incorporation Date"
                        value={
                          props.companyForm.incorporationDate
                            ? formatDate(props.companyForm.incorporationDate)
                            : ""
                        }
                        onChange={(e) =>
                          props.setCompanyForm({
                            ...props.companyForm,
                            incorporationDate: e.target.value,
                          })
                        }
                      />
                      {props.requireErrorMessage &&
                      (props.companyForm.incorporationDate === "" ||
                        props.companyForm.incorporationDate === null) ? (
                        <span className="validation cp-validation">
                          {ERROR_MESSAGES}
                        </span>
                      ) : (
                        ""
                      )}
                    </div>

                    <div className="cp-field">
                      <label className="cp-label">
                        Registered Office Address
                      </label>
                      <input
                        disabled
                        className="input-text cp-input"
                        id="category-description"
                        placeholder="Registered Office Address"
                        value={props.concatenatedRegisterAddress}
                        onChange={(e) =>
                          props.setCompanyForm({
                            ...props.companyForm,
                            companyAddress: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="cp-field" id="InCorporateIDDiv">
                      <label className="cp-label">
                        Incorporated In<span className="cp-req">*</span>
                      </label>
                      <Select
                        className="CurrencySelect cp-select"
                        options={props.incorporatedInList}
                        value={IncorporatedValue}
                        onChange={props.handleIncorporatedInChange}
                      />
                      {props.requireErrorMessage &&
                      (props.companyForm.incInID === 0 ||
                        props.companyForm.incInID === null) ? (
                        <span className="validation cp-validation">
                          {ERROR_MESSAGES}
                        </span>
                      ) : (
                        ""
                      )}
                    </div>
                  </div>
                </div>
              </section>

              <section className="cp-card" id="LTDTradingDetails">
                <div className="cp-card-head">
                  <div>
                    <h2 className="cp-card-title">Trading Detail</h2>
                    <p className="cp-card-subtitle">
                      How the business trades day to day.
                    </p>
                  </div>
                </div>

                <div className="cp-card-body">
                  <div className="cp-grid">
                    <div className="cp-field">
                      <label className="cp-label">
                        Trading Name<span className="cp-req">*</span>
                      </label>
                      <input
                        type="text"
                        maxLength={50}
                        className="input-text cp-input"
                        placeholder="Trading Name"
                        value={props.basicInfo.tradingName}
                        onChange={(e) => {
                          const inputValue = e.target.value;
                          const trimmedValue = inputValue.replace(/^\s+/g, "");

                          // Validation: Check if the trimmed value is either alphanumeric or only alphabet but not only numeric
                          const isValidName =
                            /^[a-zA-Z0-9\s,.!?"':;&()-_`]+(?:[a-zA-Z0-9\s,.!?"':;&()-_`]+)*$/.test(
                              trimmedValue,
                            ) && !/^\d+$/.test(trimmedValue);

                          if (isValidName || trimmedValue === "") {
                            const capitalizedValue =
                              trimmedValue.charAt(0).toUpperCase() +
                              trimmedValue.slice(1);
                            props.setBasicInfo({
                              ...props.basicInfo,
                              tradingName: capitalizedValue,
                            });
                          }
                        }}
                      />
                      {props.requireErrorMessage &&
                      (props.basicInfo.tradingName === "" ||
                        props.basicInfo.tradingName === null) ? (
                        <span className="validation cp-validation">
                          {ERROR_MESSAGES}
                        </span>
                      ) : (
                        ""
                      )}
                    </div>

                    <div className="cp-field">
                      <label className="cp-label">
                        Trading Start Date<span className="cp-req">*</span>
                      </label>
                      <div className="cp-datepicker">
                        <DatePicker
                          minDate={minDate}
                          maxDate={maxDate}
                          format="dd/MM/y"
                          dayPlaceholder="dd"
                          monthPlaceholder="mm"
                          yearPlaceholder="yyyy"
                          value={props.basicInfo.tradingStartDate}
                          onChange={(e) => {
                            props.setDateValidation(false);
                            props.setBasicInfo({
                              ...props.basicInfo,
                              tradingStartDate: e,
                            });
                          }}
                        />
                      </div>

                      {props.DateValidation &&
                      (props.basicInfo.tradingStartDate !== "" ||
                        props.basicInfo.tradingStartDate !== null) ? (
                        <span className="validation cp-validation">
                          Invalid Date
                        </span>
                      ) : (
                        ""
                      )}
                      {props.requireErrorMessage &&
                      (props.basicInfo.tradingStartDate === "" ||
                        props.basicInfo.tradingStartDate === null) ? (
                        <span className="validation cp-validation">
                          {ERROR_MESSAGES}
                        </span>
                      ) : (
                        ""
                      )}
                    </div>

                    <div className="cp-field">
                      <label className="cp-label">
                        Trading Address<span className="cp-req">*</span>
                      </label>
                      <input
                        type="text"
                        className="input-text cp-input cp-input-clickable"
                        id="category-description"
                        placeholder="Trading Address"
                        value={props.concatenatedTradingAddress}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          props.setAddressPopUpTitle("Trading Address");
                          handleOpenTradingAddressPopup(e);
                        }}
                      />
                      {props.requireErrorMessage &&
                      (props.basicInfo.tradingAddress === "" ||
                        props.basicInfo.tradingAddress === null ||
                        props.concatenatedTradingAddress === null ||
                        props.concatenatedTradingAddress === "") ? (
                        <span className="validation cp-validation">
                          {ERROR_MESSAGES}
                        </span>
                      ) : (
                        ""
                      )}
                    </div>
                  </div>
                </div>
              </section>

              <section className="cp-card" id="LTD_E_Signature">
                <div className="cp-card-head">
                  <div>
                    <h2 className="cp-card-title">E Signature</h2>
                    <p className="cp-card-subtitle">
                      Optional — fill both fields or leave both blank.
                    </p>
                  </div>
                </div>

                <div className="cp-card-body">
                  <div className="cp-grid">
                    <div className="cp-field">
                      <label className="cp-label">
                        Signatory Name
                        {props.signature !== null &&
                          props.signature !== undefined &&
                          props.signature !== "" && (
                            <span className="cp-req">*</span>
                          )}
                      </label>
                      <input
                        type="text"
                        className="input-text cp-input"
                        placeholder="Signatory Name"
                        value={props.basicInfo.signatoryName}
                        onChange={(e) => {
                          let inputValue = e.target.value;
                          // Remove leading spaces
                          inputValue = inputValue.trimLeft();
                          // Capitalize the first letter
                          inputValue =
                            inputValue.charAt(0).toUpperCase() +
                            inputValue.slice(1);
                          // Check if the length is within the limit
                          if (inputValue.length <= 50) {
                            props.setBasicInfo({
                              ...props.basicInfo,
                              signatoryName: inputValue,
                            });
                          }
                        }}
                      />
                      {props.requireErrorMessage &&
                      props.signature !== null &&
                      props.signature !== undefined &&
                      props.signature !== "" &&
                      (props.basicInfo.signatoryName === "" ||
                        props.basicInfo.signatoryName === null) ? (
                        <span className="validation cp-validation">
                          {ERROR_MESSAGES}
                        </span>
                      ) : (
                        ""
                      )}
                    </div>

                    <div className="cp-field cp-field-full">
                      <label className="cp-label">
                        Signatory Image
                        {props.basicInfo.signatoryName !== null &&
                          props.basicInfo.signatoryName !== undefined &&
                          props.basicInfo.signatoryName !== "" && (
                            <span className="cp-req">*</span>
                          )}
                      </label>

                      {props.signature ? (
                        <div className="cp-media-box">
                          <div className="cp-media-preview">
                            <img
                              src={props.signature}
                              className="cp-media-img"
                              alt="Selected Signature"
                            />
                          </div>
                          <button
                            onClick={() => {
                              props.setSignature(null);
                              props.setBasicInfo({
                                ...props.basicInfo,
                                signatoryImage: null,
                              });
                            }}
                            className="btn btn-sm btn-danger remove-item-btn cp-btn cp-btn-danger"
                          >
                            <i className="bi bi-trash3"></i>
                            <span>Remove</span>
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="cp-upload-box">
                            <button
                              className="btn btn-md btn-primary create-item-btn cp-btn cp-btn-outline"
                              data-bs-toggle="modal"
                              onClick={() => {
                                setType("Signature");
                              }}
                              data-bs-target="#SignatureUploadModel"
                            >
                              <i className="bi bi-plus-circle"></i>
                              <span>Upload Signature</span>
                            </button>
                            <span className="cp-hint">
                              Supported file types are .jpg, .jpeg, .png up to a
                              file size of 2MB.
                            </span>
                          </div>
                          {props.requireErrorMessage &&
                          props.basicInfo.signatoryName !== null &&
                          props.basicInfo.signatoryName !== undefined &&
                          props.basicInfo.signatoryName !== "" &&
                          (props.signature === "" ||
                            props.signature === null) ? (
                            <span className="validation cp-validation">
                              This field is required if you have entered a value
                              in the above 'Signatory Name' field. To proceed
                              without uploading a signature, please remove the
                              data from 'Signatory Name' above.
                            </span>
                          ) : (
                            ""
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </section>
            </>
          )}
        </div>

        <AddressModal
          // handleOk={handleOk}
          setAddressUpdatedDatetime={props.setAddressUpdatedDatetime}
          fullAddress={props.fullAddress}
          setFullAddress={props.setFullAddress}
          title={props.addressPopUpTitle}
          openAddressPopUp={openAddressPopUp}
          address={props.address}
          setAddress={props.setAddress}
          handleAddressPopUpClose={handleAddressPopUpClose}
          setOpenAddressPopUp={setOpenAddressPopUp}
        />
        {/* Declare Modal here */}
        {/* Upload signature modal */}
        <Upload_image_modal
          class="modal fade"
          id="SignatureUploadModel"
          tabIndex="-1"
          aria_hidden="true"
          handleImageUpload={handleImageUpload}
          setBasicInfo={props.setBasicInfo}
          basicInfo={props.basicInfo}
        />
      </div>

      {props.errorMessage ? (
        <span className="validation cp-footer-error">{props.errorMessage}</span>
      ) : (
        ""
      )}

      <div className="cp-footer-bar">
        <button
          className="btn btn-md btn-light cp-btn cp-btn-ghost"
          onClick={props.handleCancel}
        >
          <span>Cancel</span>
        </button>
        <button
          className="btn btn-md btn-primary create-item-btn cp-btn cp-btn-primary"
          onClick={() => props.handleTabChange(2)}
        >
          <span>Next</span>
        </button>
      </div>
    </>
  );
};

const OfficerDetails = (props) => {
  const [index, setIndex] = useState(0);
  const OfficerDetailsCreatePracticeDivContainerRef = useRef(null);
  const [openAddressPopUp, setOpenAddressPopUp] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  const handleAddressPopUpClose = () => {
    setOpenAddressPopUp(false);
  };

  const handleSwitchToggle = (e, index) => {
    const currentOfficer = props.officersForm[index];
    if (!currentOfficer) {
      // Handle the case where officersForm[index] is undefined or null
      console.error("Invalid officer at index:", index);
      return;
    }
    const newChecked = !currentOfficer.isAuthorisedSignatory;
    setIsChecked(newChecked);
    props.OnOfficerChange(index, "isAuthorisedSignatory", newChecked);

    // Assuming setAuthoritySignatorySignatory is a state-setting function
    props.setAuthoritySignatorySignatory(false);
  };

  const handleOpenRegisterOfficeAddressPopup = (e, AddressIndex) => {
    props.setSelectedOfficerAddressIndex(AddressIndex);
    let officerAddress = {
      premises: props.officersForm[AddressIndex].officersAddress?.premises
        ? props.officersForm[AddressIndex].officersAddress?.premises
        : "",
      addressLine1: props.officersForm[AddressIndex].officersAddress
        ?.addressLine1
        ? props.officersForm[AddressIndex].officersAddress?.addressLine1
        : "",
      addressLine2: props.officersForm[AddressIndex].officersAddress
        ?.addressLine2
        ? props.officersForm[AddressIndex].officersAddress?.addressLine2
        : "",
      locality: props.officersForm[AddressIndex].officersAddress?.locality
        ? props.officersForm[AddressIndex].officersAddress?.locality
        : "",
      region: props.officersForm[AddressIndex].officersAddress?.region
        ? props.officersForm[AddressIndex].officersAddress?.region
        : "",
      country: props.officersForm[AddressIndex].officersAddress?.countryName
        ? props.officersForm[AddressIndex].officersAddress?.countryName
        : "",
      countryId: props.officersForm[AddressIndex].officersAddress?.countryId
        ? props.officersForm[AddressIndex].officersAddress?.countryId
        : null,
      postcode: props.officersForm[AddressIndex].officersAddress?.postcode
        ? props.officersForm[AddressIndex].officersAddress?.postcode
        : "",
    };

    props.setAddress(officerAddress);
    setOpenAddressPopUp(true);
  };

  const isValidEmail = (email) => {
    // Regular expression for a basic email validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  };

  const isValidPhoneNumber = (phoneNumber) => {
    const phoneNumberRegex = /^\d{10,15}$/; // Allow between 10 and 15 digits
    return phoneNumberRegex.test(phoneNumber);
  };

  function isValidDate(dateString) {
    // Attempt to create a Date object from the provided date string
    const dateObject = new Date(dateString);

    // Check if the date object is valid and the parsed year is within a reasonable range
    return (
      !isNaN(dateObject.getTime()) &&
      dateObject.getFullYear() >= 1970 &&
      dateObject.getFullYear() <= new Date().getFullYear()
    );
  }

  const today = new Date();
  const minDate = new Date(1970, 0, 1);
  // Set the maximum date to today
  const maxDate = today;
  return (
    <>
      <div
        ref={OfficerDetailsCreatePracticeDivContainerRef}
        onClick={(e) =>
          props.scrollUptoCurrentPosition(
            e,
            OfficerDetailsCreatePracticeDivContainerRef,
          )
        }
        className="create-practice-height scrollbar cp-scroll"
        id="style-1"
      >
        <div className="cp-body">
          {/* ---------- Sole Trader ---------- */}
          {props.businessTypeID === CLIENT_TYPES.Sole_Trader &&
            props.officersForm?.map((item, index) => {
              return (
                <section className="cp-card" key={index}>
                  <div className="cp-card-head">
                    <div>
                      <h2 className="cp-card-title">Sole Trader Details</h2>
                      <p className="cp-card-subtitle">
                        Business owner information.
                      </p>
                    </div>
                  </div>

                  <div className="cp-card-body">
                    <div className="cp-grid">
                      <div className="cp-field">
                        <label className="cp-label">
                          First Name<span className="cp-req">*</span>
                        </label>
                        <input
                          type="text"
                          className="input-text cp-input"
                          placeholder="First Name"
                          value={props.officersForm[index].firstName}
                          onChange={(e) => {
                            const inputValue = e.target.value.trim();
                            // Reject input if it contains numeric characters
                            // Remove all spaces and dots
                            const cleanedValue = inputValue.replace(
                              /[.\s]/g,
                              "",
                            );
                            // Reject input if it starts with a digit
                            if (/\d/.test(cleanedValue)) {
                              return;
                            }
                            const capitalizedValue =
                              cleanedValue.charAt(0).toUpperCase() +
                              cleanedValue.slice(1);
                            props.OnOfficerChange(
                              index,
                              "firstName",
                              capitalizedValue,
                            );
                          }}
                          maxLength={30}
                        />
                        {props.officerError &&
                        (props.officersForm[index].firstName === null ||
                          props.officersForm[index].firstName === "") ? (
                          <span className="validation cp-validation">
                            {ERROR_MESSAGES}
                          </span>
                        ) : (
                          ""
                        )}
                      </div>

                      <div className="cp-field">
                        <label className="cp-label">
                          Last Name<span className="cp-req">*</span>
                        </label>
                        <input
                          type="text"
                          className="input-text cp-input"
                          placeholder="Last Name"
                          value={props.officersForm[index].lastName}
                          onChange={(e) => {
                            const inputValue = e.target.value;

                            // Remove all spaces and dots
                            const cleanedValue = inputValue.replace(
                              /[.\s]/g,
                              "",
                            );

                            // Reject input if it starts with a digit
                            if (/\d/.test(cleanedValue)) {
                              return;
                            }

                            const capitalizedValue =
                              cleanedValue.charAt(0).toUpperCase() +
                              cleanedValue.slice(1);
                            props.OnOfficerChange(
                              index,
                              "lastName",
                              capitalizedValue,
                            );
                          }}
                          maxLength={30}
                        />
                        {props.officerError &&
                        (props.officersForm[index].lastName === null ||
                          props.officersForm[index].lastName === "") ? (
                          <span className="validation cp-validation">
                            {ERROR_MESSAGES}
                          </span>
                        ) : (
                          ""
                        )}
                      </div>

                      <div className="cp-field">
                        <label className="cp-label">
                          Phone<span className="cp-req">*</span>
                        </label>
                        <div className="phone-input-div cp-phone">
                          <Select
                            className="createCompanyInfo cp-select"
                            options={props.countryCodes}
                            value={
                              props.officersForm[index]?.phoneCountryCodeID
                            }
                            onChange={(e) => {
                              setIndex(index);
                              props.OnOfficerChange(
                                index,
                                "phoneCountryCodeID",
                                e,
                              );
                              props.OnOfficerChange(
                                index,
                                "countryCodeID",
                                e.value,
                              );
                              props.setOtherInfo({
                                ...props.otherInfo,
                                countryCodeID: e,
                              });
                            }}
                          />
                          <div className="phone-input-number-div">
                            <input
                              className="input-text cp-input"
                              type="text"
                              placeholder="Phone"
                              value={props.officersForm[index].phoneNo}
                              onChange={(e) => {
                                // Ensure that the input only contains numeric characters
                                const sanitizedInput = e.target.value
                                  .replace(/[^0-9]/g, "")
                                  .slice(0, 15);
                                props.OnOfficerChange(
                                  index,
                                  "phoneNo",
                                  sanitizedInput,
                                );
                                props.setOtherInfo({
                                  ...props.otherInfo,
                                  contactPhone: sanitizedInput,
                                });
                              }}
                            />
                          </div>
                        </div>
                        {props.officerError &&
                        (props.officersForm[index]?.phoneCountryCodeID === "" ||
                          props.officersForm[index]?.phoneCountryCodeID ===
                            null ||
                          props.officersForm[index].phoneNo === "" ||
                          props.officersForm[index].phoneNo === null) ? (
                          <span className="validation cp-validation">
                            {ERROR_MESSAGES}
                          </span>
                        ) : props.officerError &&
                          !isValidPhoneNumber(
                            props.officersForm[index].phoneNo,
                          ) ? (
                          <span className="validation cp-validation">
                            {" "}
                            Invalid phone number{" "}
                          </span>
                        ) : (
                          ""
                        )}
                      </div>

                      <div className="cp-field">
                        <label className="cp-label">
                          Practice Email<span className="cp-req">*</span>
                        </label>
                        <input
                          type="text"
                          className="input-text cp-input"
                          placeholder="Email"
                          maxLength={50}
                          value={props.officersForm[index].emailID}
                          onChange={(e) => {
                            // Get the entered value
                            const enteredValue = e.target.value
                              .trim()
                              .toLowerCase();

                            // Check for consecutive dots
                            if (enteredValue.includes("..")) {
                              // If consecutive dots found, remove the last dot
                              const correctedValue = enteredValue.replace(
                                /\.+/g,
                                ".",
                              );
                              // Update the value in the parent component
                              props.OnOfficerChange(
                                index,
                                "emailID",
                                correctedValue,
                              );
                              // Update the contact email in the parent component's state
                              props.setOtherInfo({
                                ...props.otherInfo,
                                contactEmail: correctedValue,
                              });
                              return;
                            }

                            // Update the value in the parent component
                            props.OnOfficerChange(
                              index,
                              "emailID",
                              enteredValue,
                            );
                            // Update the contact email in the parent component's state
                            props.setOtherInfo({
                              ...props.otherInfo,
                              contactEmail: enteredValue,
                            });
                          }}
                        />
                        {props.officerError &&
                          (props.officersForm[index].emailID === null ||
                          props.officersForm[index].emailID === "" ? (
                            <span className="validation cp-validation">
                              {ERROR_MESSAGES}
                            </span>
                          ) : (
                            !isValidEmail(
                              props.officersForm[index].emailID,
                            ) && (
                              <span className="validation cp-validation">
                                Invalid email pattern
                              </span>
                            )
                          ))}
                      </div>

                      <div className="cp-field">
                        <label className="cp-label">
                          Practice Address<span className="cp-req">*</span>
                        </label>
                        <input
                          className="input-text cp-input cp-input-clickable"
                          type="text"
                          placeholder="Practice Address"
                          value={
                            props.concatenatedResidentialAddress[0]
                              ?.officersFullAddress
                          }
                          onMouseDown={(e) => {
                            e.preventDefault();
                            props.setAddressPopUpTitle("Practice Address");
                            handleOpenRegisterOfficeAddressPopup(e, index);
                          }}
                          autoComplete="off"
                        />
                        {props.officerError &&
                        (props.concatenatedResidentialAddress[0]
                          .officersFullAddress === null ||
                          props.concatenatedResidentialAddress[index]
                            .officersFullAddress === "") ? (
                          <span className="validation cp-validation">
                            {ERROR_MESSAGES}
                          </span>
                        ) : (
                          ""
                        )}
                      </div>
                    </div>
                  </div>
                </section>
              );
            })}

          {/* ---------- Partnership ---------- */}
          {props.businessTypeID === CLIENT_TYPES.Partnership && (
            <section className="cp-card">
              <div className="cp-card-head">
                <div>
                  <h2 className="cp-card-title">Partnership Details</h2>
                  <p className="cp-card-subtitle">
                    Partner information and authorised signatories.
                  </p>
                </div>
              </div>

              <div className="cp-card-body">
                {props.officersForm?.map((i, index) => {
                  return (
                    <div
                      className="cp-subcard"
                      id={`Partner_${index}`}
                      key={index}
                    >
                      <div className="cp-subcard-head">
                        <span className="cp-subcard-title">
                          Partner {index + 1}
                        </span>
                        <div className="cp-subcard-actions">
                          <div className="cp-signatory">
                            <Android12Switch
                              id={`checkbox${index}`}
                              checked={
                                props.officersForm[index]?.isAuthorisedSignatory
                              }
                              onChange={(e) => handleSwitchToggle(e, index)}
                              color="primary"
                            />
                            <div
                              htmlFor={`checkbox${index}`}
                              className="isAuthorized"
                            >
                              Authorised Signatory
                            </div>
                          </div>
                          {props.officersForm?.length === 1 ? null : (
                            <button
                              className="btn btn-sm btn-danger cp-btn cp-btn-danger"
                              onClick={() => props.deleteOfficer(index)}
                            >
                              <i className="bi bi-trash3"></i>
                              Delete Partner
                            </button>
                          )}
                        </div>
                      </div>

                      {props.officersForm.length === 0 && (
                        <span className="validation cp-validation cp-validation-block">
                          {" "}
                          At least 1 authorised partner is required.{" "}
                        </span>
                      )}
                      {props.authoritySignatorySignatory &&
                        props.officerError &&
                        props.AuthorityCount === 0 && (
                          <span className="validation cp-validation cp-validation-block">
                            {" "}
                            At least 1 authorised partner is required.{" "}
                          </span>
                        )}

                      <div className="cp-grid">
                        <div className="cp-field">
                          <label className="cp-label">
                            First Name<span className="cp-req">*</span>
                          </label>
                          <input
                            type="text"
                            className="input-text cp-input"
                            placeholder="First Name"
                            value={
                              props.officersForm[index].firstName
                                ? props.officersForm[index].firstName
                                    .charAt(0)
                                    .toUpperCase() +
                                  props.officersForm[index].firstName
                                    .slice(1)
                                    .toLowerCase()
                                : ""
                            }
                            onChange={(e) => {
                              const inputValue = e.target.value.trim();
                              // Reject input if it contains numeric characters
                              // Remove all spaces and dots
                              const cleanedValue = inputValue.replace(
                                /[.\s]/g,
                                "",
                              );

                              // Reject input if it starts with a digit
                              if (/\d/.test(cleanedValue)) {
                                return;
                              }
                              const capitalizedValue =
                                cleanedValue.charAt(0).toUpperCase() +
                                cleanedValue.slice(1);

                              props.OnOfficerChange(
                                index,
                                "firstName",
                                capitalizedValue,
                              );
                            }}
                            maxLength={30}
                          />
                          {props.officerError &&
                          (props.officersForm[index].firstName === null ||
                            props.officersForm[index].firstName === "") ? (
                            <span className="validation cp-validation">
                              {ERROR_MESSAGES}
                            </span>
                          ) : (
                            ""
                          )}
                        </div>

                        <div className="cp-field">
                          <label className="cp-label">
                            Last Name<span className="cp-req">*</span>
                          </label>
                          <input
                            type="text"
                            className="input-text cp-input"
                            placeholder="Last Name"
                            value={
                              props.officersForm[index].lastName
                                ? props.officersForm[index].lastName
                                    .charAt(0)
                                    .toUpperCase() +
                                  props.officersForm[index].lastName
                                    .slice(1)
                                    .toLowerCase()
                                : ""
                            }
                            onChange={(e) => {
                              const inputValue = e.target.value;

                              // Remove all spaces and dots
                              const cleanedValue = inputValue.replace(
                                /[.\s]/g,
                                "",
                              );

                              // Reject input if it starts with a digit
                              if (/\d/.test(cleanedValue)) {
                                return;
                              }

                              const capitalizedValue =
                                cleanedValue.charAt(0).toUpperCase() +
                                cleanedValue.slice(1);

                              props.OnOfficerChange(
                                index,
                                "lastName",
                                capitalizedValue,
                              );
                            }}
                            maxLength={30}
                          />
                          {props.officerError &&
                          (props.officersForm[index].lastName === null ||
                            props.officersForm[index].lastName === "") ? (
                            <span className="validation cp-validation">
                              {ERROR_MESSAGES}
                            </span>
                          ) : (
                            ""
                          )}
                        </div>

                        <div className="cp-field">
                          <label className="cp-label">
                            Phone<span className="cp-req">*</span>
                          </label>
                          <div className="phone-input-div cp-phone">
                            <Select
                              className="createCompanyInfo cp-select"
                              options={props.countryCodes}
                              value={
                                props.officersForm[index]?.phoneCountryCodeID
                              }
                              onChange={(e) => {
                                setIndex(index);
                                props.OnOfficerChange(
                                  index,
                                  "phoneCountryCodeID",
                                  e,
                                );
                                props.OnOfficerChange(
                                  index,
                                  "countryCodeID",
                                  e.value,
                                );
                              }}
                            />
                            <div className="phone-input-number-div">
                              <input
                                className="input-text cp-input"
                                type="text"
                                placeholder="Phone"
                                value={props.officersForm[index].phoneNo}
                                onChange={(e) => {
                                  // Ensure that the input only contains numeric characters
                                  const sanitizedInput = e.target.value
                                    .replace(/[^0-9]/g, "")
                                    .slice(0, 15);
                                  props.OnOfficerChange(
                                    index,
                                    "phoneNo",
                                    sanitizedInput,
                                  );
                                }}
                              />
                            </div>
                          </div>
                          {props.officerError &&
                          (props.officersForm[index]?.phoneCountryCodeID ===
                            "" ||
                            props.officersForm[index]?.phoneCountryCodeID ===
                              null ||
                            props.officersForm[index].phoneNo === "" ||
                            props.officersForm[index].phoneNo === null) ? (
                            <span className="validation cp-validation">
                              {ERROR_MESSAGES}
                            </span>
                          ) : props.officerError &&
                            !isValidPhoneNumber(
                              props.officersForm[index].phoneNo,
                            ) ? (
                            <span className="validation cp-validation">
                              {" "}
                              Invalid phone number{" "}
                            </span>
                          ) : (
                            ""
                          )}
                        </div>

                        <div className="cp-field">
                          <label className="cp-label">
                            Email<span className="cp-req">*</span>
                          </label>
                          <input
                            placeholder="Email"
                            className="input-text cp-input"
                            type="email"
                            maxLength={50}
                            value={props.officersForm[index]?.emailID}
                            onChange={(e) => {
                              // Get the entered value
                              const enteredValue = e.target.value
                                .trim()
                                .toLowerCase();

                              // Check for consecutive dots
                              if (enteredValue.includes("..")) {
                                // If consecutive dots found, remove the last dot
                                const correctedValue = enteredValue.replace(
                                  /\.+/g,
                                  ".",
                                );
                                // Update the value in the parent component
                                props.OnOfficerChange(
                                  index,
                                  "emailID",
                                  correctedValue,
                                );
                                return;
                              }

                              // Update the value in the parent component
                              props.OnOfficerChange(
                                index,
                                "emailID",
                                enteredValue,
                              );
                            }}
                          />
                          {props.officerError &&
                            (props.officersForm[index].emailID === null ||
                            props.officersForm[index].emailID === "" ? (
                              <span className="validation cp-validation">
                                {ERROR_MESSAGES}
                              </span>
                            ) : (
                              !isValidEmail(
                                props.officersForm[index].emailID,
                              ) && (
                                <span className="validation cp-validation">
                                  Invalid email pattern
                                </span>
                              )
                            ))}
                        </div>

                        <div className="cp-field">
                          <label className="cp-label">
                            Residential Address<span className="cp-req">*</span>
                          </label>
                          <input
                            className="input-text cp-input cp-input-clickable"
                            type="text"
                            placeholder="Residential Address"
                            value={
                              props.concatenatedResidentialAddress[index]
                                ?.officersFullAddress
                            }
                            onMouseDown={(e) => {
                              e.preventDefault();
                              props.setAddressPopUpTitle("Residential Address");
                              handleOpenRegisterOfficeAddressPopup(e, index);
                            }}
                            autoComplete="off"
                          />
                          {props.officerError &&
                          (props.concatenatedResidentialAddress[index]
                            .officersFullAddress === null ||
                            props.concatenatedResidentialAddress[index]
                              .officersFullAddress === "") ? (
                            <span className="validation cp-validation">
                              {ERROR_MESSAGES}
                            </span>
                          ) : (
                            ""
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* ---------- Company / LLP ---------- */}
          {(props.businessTypeID === CLIENT_TYPES.Company ||
            props.businessTypeID === CLIENT_TYPES.LLP) && (
            <section className="cp-card">
              <div className="cp-card-head">
                <div>
                  <h2 className="cp-card-title">Officer Details</h2>
                  <p className="cp-card-subtitle">
                    Officer information and authorised signatories.
                  </p>
                </div>
              </div>

              <div className="cp-card-body">
                {props.officersForm?.map((i, index) => {
                  return (
                    <div
                      className="cp-subcard"
                      id={`Officers${index}`}
                      key={index}
                    >
                      <div className="cp-subcard-head">
                        <span className="cp-subcard-title">
                          Officer {index + 1}
                        </span>
                        <div className="cp-subcard-actions">
                          <div className="cp-signatory">
                            <Android12Switch
                              id="checkbox"
                              checked={
                                props.officersForm[index]?.isAuthorisedSignatory
                              }
                              onChange={(e) => handleSwitchToggle(e, index)}
                              color="primary"
                            />
                            <div className="isAuthorized">
                              Authorised Signatory
                            </div>
                          </div>
                          {props.officersForm?.length === 1 ? null : (
                            <button
                              className="btn btn-sm btn-danger cp-btn cp-btn-danger"
                              onClick={() => props.deleteOfficer(index)}
                            >
                              <i className="bi bi-trash3"></i>
                              Delete Officer
                            </button>
                          )}
                        </div>
                      </div>

                      {props.officersForm.length === 0 && (
                        <span className="validation cp-validation cp-validation-block">
                          {" "}
                          At least 1 authorised officer is required.{" "}
                        </span>
                      )}
                      {props.authoritySignatorySignatory &&
                        props.officerError &&
                        props.AuthorityCount === 0 && (
                          <span className="validation cp-validation cp-validation-block">
                            {" "}
                            At least 1 authorised officer is required.{" "}
                          </span>
                        )}

                      <div className="cp-grid">
                        <div className="cp-field">
                          <label className="cp-label">
                            First Name<span className="cp-req">*</span>
                          </label>
                          <input
                            type="text"
                            className="input-text cp-input"
                            placeholder="First Name"
                            value={
                              props.officersForm[index].firstName
                                ? props.officersForm[index].firstName
                                    .charAt(0)
                                    .toUpperCase() +
                                  props.officersForm[index].firstName
                                    .slice(1)
                                    .toLowerCase()
                                : ""
                            }
                            onChange={(e) => {
                              const inputValue = e.target.value.trim();
                              // Reject input if it contains numeric characters
                              // Remove all spaces and dots
                              const cleanedValue = inputValue.replace(
                                /[.\s]/g,
                                "",
                              );

                              // Reject input if it starts with a digit
                              if (/\d/.test(cleanedValue)) {
                                return;
                              }
                              const capitalizedValue =
                                cleanedValue.charAt(0).toUpperCase() +
                                cleanedValue.slice(1);

                              props.OnOfficerChange(
                                index,
                                "firstName",
                                capitalizedValue,
                              );
                            }}
                            maxLength={30}
                          />
                          {props.officerError &&
                          (props.officersForm[index].firstName === null ||
                            props.officersForm[index].firstName === undefined ||
                            props.officersForm[index].firstName === "") ? (
                            <span className="validation cp-validation">
                              {ERROR_MESSAGES}
                            </span>
                          ) : (
                            ""
                          )}
                        </div>

                        <div className="cp-field">
                          <label className="cp-label">
                            Last Name<span className="cp-req">*</span>
                          </label>
                          <input
                            type="text"
                            className="input-text cp-input"
                            placeholder="Last Name"
                            value={
                              props.officersForm[index].lastName
                                ? props.officersForm[index].lastName
                                    .charAt(0)
                                    .toUpperCase() +
                                  props.officersForm[index].lastName
                                    .slice(1)
                                    .toLowerCase()
                                : ""
                            }
                            onChange={(e) => {
                              const inputValue = e.target.value;

                              // Remove all spaces and dots
                              const cleanedValue = inputValue.replace(
                                /[.\s]/g,
                                "",
                              );

                              // Reject input if it starts with a digit
                              if (/\d/.test(cleanedValue)) {
                                return;
                              }

                              const capitalizedValue =
                                cleanedValue.charAt(0).toUpperCase() +
                                cleanedValue.slice(1);

                              props.OnOfficerChange(
                                index,
                                "lastName",
                                capitalizedValue,
                              );
                            }}
                            maxLength={30}
                          />
                          {props.officerError &&
                          (props.officersForm[index].lastName === null ||
                            props.officersForm[index].lastName === "") ? (
                            <span className="validation cp-validation">
                              {ERROR_MESSAGES}
                            </span>
                          ) : (
                            ""
                          )}
                        </div>

                        <div className="cp-field">
                          <label className="cp-label">
                            Role<span className="cp-req">*</span>
                          </label>
                          <input
                            maxLength={30}
                            type="text"
                            className="input-text cp-input"
                            placeholder="Role"
                            value={props.officersForm[index]?.officerRole}
                            onChange={(e) => {
                              const inputValue = e.target.value.trimLeft();
                              const capitalizedValue =
                                inputValue.charAt(0).toUpperCase() +
                                inputValue.slice(1);

                              props.OnOfficerChange(
                                index,
                                "officerRole",
                                capitalizedValue,
                              );
                            }}
                          />
                          {props.officerError &&
                          (props.officersForm[index].officerRole === null ||
                            props.officersForm[index].officerRole === "") ? (
                            <span className="validation cp-validation">
                              {ERROR_MESSAGES}
                            </span>
                          ) : (
                            ""
                          )}
                        </div>

                        <div className="cp-field">
                          <label className="cp-label">
                            Appointed On<span className="cp-req">*</span>
                          </label>
                          <div className="cp-datepicker">
                            <DatePicker
                              minDate={minDate}
                              maxDate={maxDate}
                              format="dd/MM/y"
                              dayPlaceholder="dd"
                              monthPlaceholder="mm"
                              yearPlaceholder="yyyy"
                              value={props.officersForm[index]?.appointedOn}
                              onChange={(e) =>
                                props.OnOfficerChange(index, "appointedOn", e)
                              }
                            />
                          </div>
                          {/* {props.InvalidAppointedOnDate &&
                              !isValidDate(
                                props.officersForm[index]?.appointedOn
                              ) ? (
                              <span className="validation">Invalid Date</span>
                            ) : null} */}

                          {props.officerError &&
                          (props.officersForm[index]?.appointedOn === null ||
                            props.officersForm[index]?.appointedOn === "") ? (
                            <span className="validation cp-validation">
                              {ERROR_MESSAGES}
                            </span>
                          ) : (
                            ""
                          )}
                        </div>

                        <div className="cp-field">
                          <label className="cp-label">Phone</label>
                          <div className="phone-input-div cp-phone">
                            <Select
                              className="createCompanyInfo cp-select"
                              options={props.countryCodes}
                              value={
                                props.officersForm[index]?.phoneCountryCodeID
                              }
                              onChange={(e) => {
                                setIndex(index);
                                props.OnOfficerChange(
                                  index,
                                  "phoneCountryCodeID",
                                  e,
                                );
                                props.OnOfficerChange(
                                  index,
                                  "countryCodeID",
                                  e.value,
                                );
                              }}
                            />
                            <div className="phone-input-number-div">
                              <input
                                className="input-text cp-input"
                                type="text"
                                placeholder="Phone"
                                value={props.officersForm[index].phoneNo}
                                onChange={(e) => {
                                  const sanitizedInput = e.target.value
                                    .replace(/[^0-9]/g, "")
                                    .slice(0, 15);
                                  props.OnOfficerChange(
                                    index,
                                    "phoneNo",
                                    sanitizedInput,
                                  );
                                }}
                              />
                            </div>
                          </div>
                          {props.officerError &&
                          props.officersForm[index].phoneNo !== null &&
                          props.officersForm[index].phoneNo !== "" &&
                          props.officersForm[index].phoneNo !== undefined &&
                          !isValidPhoneNumber(
                            props.officersForm[index].phoneNo,
                          ) ? (
                            <span className="validation cp-validation">
                              {" "}
                              Invalid phone number{" "}
                            </span>
                          ) : (
                            ""
                          )}
                        </div>

                        <div className="cp-field">
                          <label className="cp-label">
                            Email<span className="cp-req">*</span>
                          </label>
                          <input
                            className="input-text cp-input"
                            placeholder="Email"
                            type="text"
                            maxLength={50}
                            value={props.officersForm[index]?.emailID}
                            onChange={(e) => {
                              // Get the entered value
                              const enteredValue = e.target.value
                                .trim()
                                .toLowerCase();

                              // Check for consecutive dots
                              if (enteredValue.includes("..")) {
                                // If consecutive dots found, remove the last dot
                                const correctedValue = enteredValue.replace(
                                  /\.+/g,
                                  ".",
                                );
                                // Update the email address in the parent component
                                props.OnOfficerChange(
                                  index,
                                  "emailID",
                                  correctedValue,
                                );
                                return;
                              }

                              // Update the email address in the parent component
                              props.OnOfficerChange(
                                index,
                                "emailID",
                                enteredValue,
                              );
                            }}
                          />
                          {props.officerError &&
                            (props.officersForm[index].emailID === null ||
                            props.officersForm[index].emailID === "" ? (
                              <span className="validation cp-validation">
                                {ERROR_MESSAGES}
                              </span>
                            ) : (
                              !isValidEmail(
                                props.officersForm[index].emailID,
                              ) && (
                                <span className="validation cp-validation">
                                  Invalid email pattern
                                </span>
                              )
                            ))}
                        </div>

                        <div className="cp-field">
                          <label className="cp-label">
                            Correspondence Address
                            <span className="cp-req">*</span>
                          </label>
                          <input
                            className="input-text cp-input cp-input-clickable"
                            placeholder="Correspondence Address"
                            type="text"
                            value={
                              props.concatenatedResidentialAddress[index]
                                ?.officersFullAddress
                            }
                            onMouseDown={(e) => {
                              e.preventDefault();
                              props.setAddressPopUpTitle(
                                "Correspondence Address",
                              );
                              handleOpenRegisterOfficeAddressPopup(e, index);
                            }}
                          />
                          {props.officerError &&
                          (props.concatenatedResidentialAddress[index]
                            .officersFullAddress === null ||
                            props.concatenatedResidentialAddress[index]
                              .officersFullAddress === "") ? (
                            <span className="validation cp-validation">
                              {ERROR_MESSAGES}
                            </span>
                          ) : (
                            ""
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </div>

        <AddressModal
          title={props.addressPopUpTitle}
          setAddressUpdatedDatetime={props.setAddressUpdatedDatetime}
          fullAddress={props.fullAddress}
          setFullAddress={props.setFullAddress}
          openAddressPopUp={openAddressPopUp}
          address={props.address}
          setAddress={props.setAddress}
          handleAddressPopUpClose={handleAddressPopUpClose}
          setOpenAddressPopUp={setOpenAddressPopUp}
        />
      </div>

      {props.errorMessage ? (
        <span className="validation cp-footer-error">{props.errorMessage}</span>
      ) : (
        ""
      )}

      <div className="cp-footer-bar">
        {props.businessTypeID === CLIENT_TYPES.Partnership && (
          <button
            className="btn btn-md btn-primary create-item-btn cp-btn cp-btn-outline cp-btn-add"
            onClick={() => {
              props.setOfficersError(false);
              props.addOfficer();
            }}
          >
            <i className="bi bi-plus-circle"></i>
            <span>Add Partner</span>
          </button>
        )}
        {props.businessTypeID === CLIENT_TYPES.LLP && (
          <button
            className="btn btn-md btn-primary create-item-btn cp-btn cp-btn-outline cp-btn-add"
            onClick={props.addOfficer}
          >
            <i className="bi bi-plus-circle"></i>
            <span>Add Officer</span>
          </button>
        )}
        {props.businessTypeID === CLIENT_TYPES.Company && (
          <button
            className="btn btn-md btn-primary create-item-btn cp-btn cp-btn-outline cp-btn-add"
            onClick={props.addOfficer}
          >
            <i className="bi bi-plus-circle"></i>
            <span>Add Officer</span>
          </button>
        )}

        <button
          className="btn btn-md btn-light cp-btn cp-btn-ghost"
          onClick={props.handleCancel}
        >
          <span>Cancel</span>
        </button>
        <button
          onClick={() => props.handleBackBtnChange(1)}
          className="btn btn-md btn-primary create-item-btn cp-btn cp-btn-ghost"
        >
          <span>Back</span>
        </button>
        <button
          className="btn btn-md btn-primary create-item-btn cp-btn cp-btn-primary"
          onClick={() => props.handleTabChange(3)}
        >
          <span>Next</span>
        </button>
      </div>
    </>
  );
};

const OtherInformation = (props) => {
  const currencyFilter = props.currencyType.find(
    (item) => props.otherInfo.preferredCurrency == item.value,
  );

  let taxName;
  if (currencyFilter.value === 1) {
    taxName = "VAT";
  } else if (currencyFilter.value === 2) {
    taxName = "EU VAT";
  } else if (currencyFilter.value === 3) {
    taxName = "Sales Tax";
  } else if (currencyFilter.value === 4) {
    taxName = "GST";
  }

  useEffect(() => {
    let newVAT = 20;

    if (props.otherInfo.preferredCurrency === 4) {
      newVAT = 18;
    } else if (props.otherInfo.preferredCurrency === 2) {
      newVAT = 21;
    } else if (props.otherInfo.preferredCurrency === 3) {
      newVAT = 19;
    }

    props.setOtherInfo((prev) => ({
      ...prev,
      indirectTaxPercentage: newVAT,
    }));
    console.log(newVAT);
  }, [props.otherInfo.preferredCurrency]);

  const isValidPhoneNumber = (phoneNumber) => {
    const phoneNumberRegex = /^\d{10,15}$/; // Allow between 10 and 15 digits
    return phoneNumberRegex.test(phoneNumber);
  };
  const VATRegFilter = Utils.VAT_Registered.find(
    (item) => props.otherInfo.VATReg == item.value,
  );
  const handlePhoneChange = (e) => {
    const enteredValue = e.target.value;
    // Check if the entered value is a valid number
    if (!isNaN(enteredValue)) {
      const sanitizedInput = e.target.value.replace(/[^0-9]/g, "").slice(0, 15);
      // Check if the sanitized phone number has 10 digits
      if (isValidPhoneNumber(sanitizedInput)) {
        props.setOtherInfo({
          ...props.otherInfo,
          contactPhone: sanitizedInput,
        });
      }
    }
  };
  const [type, setType] = useState("");

  const handleChangeTaxPercentage = (e) => {
    let value = e.target.value;

    let cleanValue = value.replace(/[^0-9.]/g, "");

    // Prevent multiple dots:
    const parts = cleanValue.split(".");
    if (parts.length > 2) {
      cleanValue = parts[0] + "." + parts.slice(1).join("");
    }

    const regex = /^(\d{0,3}(\.\d{0,2})?)?$/;

    if (regex.test(cleanValue)) {
      props.setOtherInfo({
        ...props.otherInfo,
        indirectTaxPercentage: cleanValue,
      });
    }
  };

  const handleImageUpload = () => {
    if (type == "Logo") {
      const file = props.otherInfo.logo; // Assuming you only want to handle the first selected file
      const reader = new FileReader();
      reader.onload = () => {
        const base64ImageData = reader.result;
        props.setLogo(base64ImageData);
      };
      if (file) {
        reader.readAsDataURL(file);
      }
    }
  };
  const isValidEmail = (email) => {
    // Regular expression for basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  const PhoneValue = props.countryCodes.find(
    (item) => props.otherInfo.countryCodeID?.value == item.value,
  );
  const isValidWebUrl = (web) => {
    // Regular expression for a basic URL validation
    const urlRegex =
      /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi;
    return urlRegex.test(web);
  };
  return (
    <>
      <div className="create-practice-height scrollbar cp-scroll" id="style-1">
        <div className="cp-body">
          <section className="cp-card">
            <div className="cp-card-head">
              <div>
                <h2 className="cp-card-title">Currency &amp; Tax</h2>
                <p className="cp-card-subtitle">
                  Billing currency and indirect tax registration.
                </p>
              </div>
            </div>

            <div className="cp-card-body">
              <div className="cp-grid">
                <div className="cp-field">
                  <label className="cp-label">
                    Preferred Currency<span className="cp-req">*</span>
                  </label>
                  <Select
                    className="CurrencySelect cp-select"
                    options={props.currencyType}
                    value={currencyFilter}
                    onChange={(e) => {
                      props.setOtherInfo({
                        ...props.otherInfo,
                        preferredCurrency: e.value,
                      });
                    }}
                  />
                  {props.requireOtherErrorMessage &&
                  (props.otherInfo.preferredCurrency === "" ||
                    props.otherInfo.preferredCurrency === null) ? (
                    <span className="validation cp-validation">
                      {ERROR_MESSAGES}
                    </span>
                  ) : (
                    ""
                  )}
                </div>

                <div className="cp-field">
                  <label className="cp-label">{taxName} Registered</label>
                  <BinarySelect
                    options={Utils.VAT_Registered}
                    value={VATRegFilter}
                    onChange={(e) =>
                      props.setOtherInfo({
                        ...props.otherInfo,
                        VATReg: e.value,
                      })
                    }
                    ariaLabel="VAT Registered"
                  />
                </div>

                {props.otherInfo.VATReg === 0 && (
                  <>
                    <div className="cp-field">
                      <label className="cp-label">{taxName} Number</label>
                      <input
                        type="text"
                        className="input-text cp-input"
                        placeholder={`${taxName} Number`}
                        value={props.otherInfo.VATNumber}
                        onChange={(e) => {
                          const sanitizedInput = e.target.value
                            .trimStart()
                            .slice(0, 12);
                          props.setOtherInfo({
                            ...props.otherInfo,
                            VATNumber: sanitizedInput.toUpperCase(),
                          });
                        }}
                      />
                    </div>

                    <div className="cp-field">
                      <label className="cp-label">
                        {taxName} Percentage (%)
                      </label>
                      {/* <Slider
                        value={props.otherInfo.indirectTaxPercentage ?? 20}
                        step={0.1}
                        min={0}
                        max={100}
                        aria-label="Default"
                        valueLabelDisplay="auto"
                        onChange={(e, newValue) => {
                          props.setOtherInfo({
                            ...props.otherInfo,
                            indirectTaxPercentage: newValue,
                          });
                        }}
                      /> */}
                      <input
                        className="input-text cp-input"
                        type="text"
                        value={props.otherInfo.indirectTaxPercentage ?? 20.0}
                        onChange={handleChangeTaxPercentage}
                        max={100}
                      />
                      {props.requireOtherErrorMessage &&
                        props.otherInfo.indirectTaxPercentage > 100 && (
                          <label className="text-danger cp-validation">
                            Percentage cannot exceed 100
                          </label>
                        )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </section>

          <section className="cp-card">
            <div className="cp-card-head">
              <div>
                <h2 className="cp-card-title">Contact Information</h2>
                <p className="cp-card-subtitle">
                  How clients and the system reach your practice.
                </p>
              </div>
            </div>

            <div className="cp-card-body">
              <div className="cp-grid">
                <div className="cp-field">
                  <label className="cp-label">Website</label>
                  <input
                    maxLength={100}
                    type="text"
                    className="input-text cp-input"
                    placeholder="www.example.com"
                    value={props.otherInfo.website}
                    onChange={(e) =>
                      props.setOtherInfo({
                        ...props.otherInfo,
                        website: e.target.value.trim(),
                      })
                    }
                  />
                  {props.requireOtherErrorMessage &&
                    props.otherInfo.website !== null &&
                    props.otherInfo.website !== "" &&
                    props.otherInfo.website !== undefined &&
                    !isValidWebUrl(props.otherInfo.website) && (
                      <span className="validation cp-validation">
                        {" "}
                        Invalid Url{" "}
                      </span>
                    )}
                </div>

                <div className="cp-field">
                  <label className="cp-label">
                    Contact Email<span className="cp-req">*</span>
                  </label>
                  <input
                    type="text"
                    className="input-text cp-input"
                    placeholder="Email"
                    maxLength={50}
                    value={props.otherInfo.contactEmail}
                    onChange={(e) => {
                      // Get the entered value
                      const enteredValue = e.target.value.trim().toLowerCase();

                      // Check for consecutive dots
                      if (enteredValue.includes("..")) {
                        // If consecutive dots found, remove the last dot
                        const correctedValue = enteredValue.replace(
                          /\.+/g,
                          ".",
                        );
                        // Update the contact email in the state
                        props.setOtherInfo({
                          ...props.otherInfo,
                          contactEmail: correctedValue,
                        });
                        return;
                      }

                      // Update the contact email in the state
                      props.setOtherInfo({
                        ...props.otherInfo,
                        contactEmail: enteredValue,
                      });
                    }}
                  />
                  {props.requireOtherErrorMessage &&
                  (props.otherInfo.contactEmail === "" ||
                    props.otherInfo.contactEmail === null) ? (
                    <span className="validation cp-validation">
                      {ERROR_MESSAGES}
                    </span>
                  ) : props.requireOtherErrorMessage &&
                    !isValidEmail(props.otherInfo.contactEmail) ? (
                    <span className="validation cp-validation">
                      {" "}
                      Invalid Email{" "}
                    </span>
                  ) : (
                    ""
                  )}
                </div>

                <div className="cp-field">
                  <label className="cp-label">
                    Contact Phone<span className="cp-req">*</span>
                  </label>
                  <div className="phone-input-div cp-phone">
                    <Select
                      className="createCompanyInfo cp-select"
                      options={props.countryCodes}
                      value={PhoneValue}
                      onChange={(e) => {
                        props.setOtherInfo({
                          ...props.otherInfo,
                          countryCodeID: e,
                        });
                      }}
                    />
                    <div className="phone-input-number-div">
                      <input
                        className="input-text cp-input"
                        type="text"
                        placeholder="Phone"
                        value={props.otherInfo.contactPhone}
                        onChange={(e) => {
                          const sanitizedInput = e.target.value
                            .replace(/[^0-9]/g, "")
                            .slice(0, 15);
                          props.setOtherInfo({
                            ...props.otherInfo,
                            contactPhone: sanitizedInput,
                          });
                        }}
                      />
                    </div>
                  </div>
                  {props.requireOtherErrorMessage &&
                  (props.otherInfo.countryCodeID === "" ||
                    props.otherInfo.countryCodeID === null ||
                    props.otherInfo.contactPhone === "" ||
                    props.otherInfo.contactPhone === null) ? (
                    <span className="validation cp-validation">
                      {ERROR_MESSAGES}
                    </span>
                  ) : props.requireOtherErrorMessage &&
                    !isValidPhoneNumber(props.otherInfo.contactPhone) ? (
                    <span className="validation cp-validation">
                      {" "}
                      Invalid phone number{" "}
                    </span>
                  ) : (
                    ""
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className="cp-card">
            <div className="cp-card-head">
              <div>
                <h2 className="cp-card-title">Branding</h2>
                <p className="cp-card-subtitle">
                  Logo, colour and tagline applied to client-facing documents.
                </p>
              </div>
            </div>

            <div className="cp-card-body">
              <div className="cp-grid">
                <div className="cp-field cp-field-full">
                  <label className="cp-label">Logo</label>
                  {props.logo ? (
                    <div className="cp-media-box">
                      <div className="cp-media-preview">
                        <img
                          src={props.logo}
                          className="cp-media-img"
                          alt="Selected Signature"
                        />
                      </div>
                      <button
                        onClick={() => props.setLogo(null)}
                        className="btn btn-sm btn-danger remove-item-btn cp-btn cp-btn-danger"
                      >
                        <i className="bi bi-trash3"></i>
                        <span>Remove</span>
                      </button>
                    </div>
                  ) : (
                    <div className="cp-upload-box">
                      <button
                        className="btn btn-md btn-primary create-item-btn cp-btn cp-btn-outline"
                        data-bs-toggle="modal"
                        data-bs-target="#LogoUploadModal"
                        onClick={() => {
                          setType("Logo");
                        }}
                      >
                        <i className="bi bi-plus-circle"></i>
                        <span>Upload Logo</span>
                      </button>
                      <span className="cp-hint">
                        Supported file types are .jpg, .jpeg, .png up to a file
                        size of 2MB.
                      </span>
                    </div>
                  )}
                </div>

                <div className="cp-field">
                  <label className="cp-label">Brand Color</label>
                  <div className="cp-color-row">
                    <input
                      type="color"
                      className="form-control cp-color-swatch"
                      id="exampleColorInput contactNumber"
                      title="Choose your color"
                      value={props.otherInfo.brandColor}
                      onChange={(e) =>
                        props.setOtherInfo({
                          ...props.otherInfo,
                          brandColor: e.target.value,
                        })
                      }
                    />
                    <span className="cp-color-hex">
                      {props.otherInfo.brandColor}
                    </span>
                  </div>
                  {/* {props.requireOtherErrorMessage &&
                                    (props.otherInfo.brandColor === "" ||
                                        props.otherInfo.brandColor === null) ? (
                                    <span className="validation">{ERROR_MESSAGES}</span>
                                ) : (
                                    ""
                                )} */}
                </div>

                <div className="cp-field">
                  <label className="cp-label">Business Tagline</label>
                  <input
                    maxLength={100}
                    type="text"
                    className="input-text cp-input"
                    placeholder="Business Tagline"
                    value={props.otherInfo.businessTagline}
                    onChange={(e) => {
                      const inputValue = e.target.value;
                      const trimmedValue = inputValue.trimLeft();
                      const capitalizedValue =
                        trimmedValue.charAt(0).toUpperCase() +
                        trimmedValue.slice(1);

                      props.setOtherInfo({
                        ...props.otherInfo,
                        businessTagline: capitalizedValue,
                      });
                    }}
                  />
                </div>

                <div className="cp-field">
                  <label className="cp-label">
                    Affiliated Accounting Body Name
                  </label>
                  <input
                    maxLength={50}
                    type="text"
                    className="input-text cp-input"
                    placeholder="Affiliated Accounting Body Name"
                    value={props.otherInfo.AffiliatedAcBodyName}
                    onChange={(e) => {
                      const inputValue = e.target.value;
                      const trimmedValue = inputValue.trimLeft();
                      const capitalizedValue =
                        trimmedValue.charAt(0).toUpperCase() +
                        trimmedValue.slice(1);
                      props.setOtherInfo({
                        ...props.otherInfo,
                        AffiliatedAcBodyName: capitalizedValue,
                      });
                    }}
                  />
                </div>

                <div className="cp-field">
                  <label className="cp-label">
                    Website of Affiliated Accounting Body
                  </label>
                  <input
                    maxLength={100}
                    type="text"
                    className="input-text cp-input"
                    placeholder="Website of Affiliated Accounting Body"
                    value={props.otherInfo.webOfAffiliatedAccount}
                    onChange={(e) => {
                      const inputValue = e.target.value;
                      const trimmedValue = inputValue.trimLeft();
                      const capitalizedValue =
                        trimmedValue.charAt(0).toUpperCase() +
                        trimmedValue.slice(1);
                      props.setOtherInfo({
                        ...props.otherInfo,
                        webOfAffiliatedAccount: capitalizedValue,
                      });
                    }}
                  />
                </div>
              </div>
            </div>
          </section>
        </div>

        <Upload_Logo_Modal
          class="modal fade"
          id="LogoUploadModal"
          tabIndex="-1"
          aria_hidden="true"
          handleImageUpload={handleImageUpload}
          setOtherInfo={props.setOtherInfo}
          otherInfo={props.otherInfo}
        />
      </div>

      {props.errorMessage ? (
        <span className="validation cp-footer-error">{props.errorMessage}</span>
      ) : (
        ""
      )}

      <div className="cp-footer-bar">
        <button
          className="btn btn-md btn-light cp-btn cp-btn-ghost"
          onClick={props.handleCancel}
        >
          <span>Cancel</span>
        </button>
        <button
          onClick={() => props.handleBackBtnChange(2)}
          className="btn btn-md btn-primary create-item-btn cp-btn cp-btn-ghost"
        >
          <span>Back</span>
        </button>
        <button
          className="btn btn-md btn-primary create-item-btn cp-btn cp-btn-primary"
          onClick={() => props.handleTabChange(4)}
        >
          <span>Next</span>
          {/* <span> Create Practice</span> */}
        </button>
      </div>
    </>
  );
};

const SubscriptionPlanView = (props) => {
  return (
    <>
      <div className="create-practice-height scrollbar cp-scroll" id="style-1">
        <div className="choose-plan-page">
          <div className="choose-plan-shell">
            {/* =========================
                HEADER
                ========================= */}
            <div className="choose-plan-header">
              <div>
                <h1 className="choose-plan-title">Choose Plan</h1>
                <p className="choose-plan-subtitle">
                  Select the subscription package that best fits your practice.
                </p>
              </div>

              <div className="choose-plan-billing-toggle">
                <span
                  className={`choose-plan-billing-label ${
                    !props.isYearly ? "is-active" : ""
                  }`}
                >
                  Monthly
                </span>

                <FormControlLabel
                  className="choose-plan-switch-label"
                  control={
                    <Android12Switch
                      checked={props.isYearly}
                      onChange={props.handleToggle}
                      color="primary"
                    />
                  }
                />

                <span
                  className={`choose-plan-billing-label ${
                    props.isYearly ? "is-active" : ""
                  }`}
                >
                  Yearly
                </span>
              </div>
            </div>

            {/* =========================
                PLANS
                ========================= */}
            <div className="choose-plan-grid">
              {props.chooseApiData?.map((PurchasePlanList, index) => {
                return (
                  <article
                    className="choose-plan-card"
                    key={
                      PurchasePlanList.subscriptionPackageKeyID ||
                      PurchasePlanList.packageName ||
                      index
                    }
                  >
                    <div className="choose-plan-card__header">
                      <div className="choose-plan-card__heading">
                        <span className="choose-plan-card__icon">
                          <i className="bi bi-stars"></i>
                        </span>

                        <div>
                          <h2>{PurchasePlanList?.packageName}</h2>
                          <span className="choose-plan-card__billing-badge">
                            {props.isYearly
                              ? "Yearly billing"
                              : "Monthly billing"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="choose-plan-card__body">
                      {/* PRICE */}
                      <div className="choose-plan-price-area">
                        <div className="choose-plan-current-price">
                          {!props.isYearly
                            ? (() => {
                                const MonthlyPrice =
                                  Number(PurchasePlanList?.yearlyValuePlan) /
                                  12;
                                return `${props.formatValue(
                                  MonthlyPrice,
                                )}/Month`;
                              })()
                            : `${props.formatValue(
                                PurchasePlanList?.yearlyValuePlan,
                              )}/Year`}
                        </div>
                      </div>

                      <div className="choose-plan-divider"></div>

                      {/* FEATURES */}
                      <div className="choose-plan-features">
                        <div className="choose-plan-feature">
                          <span
                            className={`choose-plan-feature__icon ${
                              PurchasePlanList?.prepareQuote == true
                                ? "is-enabled"
                                : "is-disabled"
                            }`}
                          >
                            <i
                              className={`bi ${
                                PurchasePlanList?.prepareQuote == true
                                  ? "bi-check-lg"
                                  : "bi-x-lg"
                              }`}
                            ></i>
                          </span>
                          <span>Prepare {props.proposalName}</span>
                        </div>

                        <div className="choose-plan-feature">
                          <span
                            className={`choose-plan-feature__icon ${
                              PurchasePlanList?.sendQuote === true
                                ? "is-enabled"
                                : "is-disabled"
                            }`}
                          >
                            <i
                              className={`bi ${
                                PurchasePlanList?.sendQuote === true
                                  ? "bi-check-lg"
                                  : "bi-x-lg"
                              }`}
                            ></i>
                          </span>
                          <span>Send {props.proposalName}</span>
                        </div>

                        <div className="choose-plan-feature">
                          <span
                            className={`choose-plan-feature__icon ${
                              PurchasePlanList?.prepareContract === true
                                ? "is-enabled"
                                : "is-disabled"
                            }`}
                          >
                            <i
                              className={`bi ${
                                PurchasePlanList?.prepareContract === true
                                  ? "bi-check-lg"
                                  : "bi-x-lg"
                              }`}
                            ></i>
                          </span>
                          <span>Prepare {props.EngagementName}</span>
                        </div>

                        <div className="choose-plan-feature">
                          <span
                            className={`choose-plan-feature__icon ${
                              PurchasePlanList?.eSignaturePerMonth > 0
                                ? "is-enabled"
                                : "is-disabled"
                            }`}
                          >
                            <i
                              className={`bi ${
                                PurchasePlanList?.eSignaturePerMonth > 0
                                  ? "bi-check-lg"
                                  : "bi-x-lg"
                              }`}
                            ></i>
                          </span>
                          <span>
                            Send And Digitally Sign The {props.EngagementName}
                            {PurchasePlanList?.eSignaturePerMonth > 0
                              ? `: ${PurchasePlanList?.eSignaturePerMonth}/Month`
                              : ""}
                          </span>
                        </div>

                        <div className="choose-plan-feature">
                          <span
                            className={`choose-plan-feature__icon ${
                              PurchasePlanList?.isMailBox === true ||
                              PurchasePlanList?.isMailBox === null
                                ? "is-enabled"
                                : "is-disabled"
                            }`}
                          >
                            <i
                              className={`bi ${
                                PurchasePlanList?.isMailBox === true ||
                                PurchasePlanList?.isMailBox === null
                                  ? "bi-check-lg"
                                  : "bi-x-lg"
                              }`}
                            ></i>
                          </span>
                          <span>Personalized Outgoing Mailbox</span>
                        </div>

                        <div className="choose-plan-feature">
                          <span
                            className={`choose-plan-feature__icon ${
                              PurchasePlanList?.apiIntegration == true
                                ? "is-enabled"
                                : "is-disabled"
                            }`}
                          >
                            <i
                              className={`bi ${
                                PurchasePlanList?.apiIntegration == true
                                  ? "bi-check-lg"
                                  : "bi-x-lg"
                              }`}
                            ></i>
                          </span>
                          <span>API Integration</span>
                        </div>
                      </div>

                      {/* OFFER */}
                      {PurchasePlanList && (
                        <div className="choose-plan-offer-area">
                          {(props.isYearly &&
                            PurchasePlanList.yearlyOffer?.length > 0) ||
                          (!props.isYearly &&
                            PurchasePlanList.monthlyOffer?.length > 0) ? (
                            <>
                              <label className="choose-plan-offer-label">
                                Available Offer
                              </label>

                              <Select
                                placeholder="Select Offer"
                                menuPosition="auto"
                                className="choose-plan-offer-select"
                                classNamePrefix="choose-plan-select"
                                onChange={(selectedOption) =>
                                  props.handleSelectChange(
                                    selectedOption,
                                    index,
                                    PurchasePlanList.subscriptionPackageKeyID,
                                    PurchasePlanList.packageName,
                                  )
                                }
                                options={(props.isYearly
                                  ? PurchasePlanList.yearlyOffer
                                  : PurchasePlanList.monthlyOffer
                                )?.map((offer) => ({
                                  id: offer.offerID,
                                  label: offer.offerName,
                                  value: offer.offerID,
                                }))}
                                value={
                                  props.selectedOfferID &&
                                  props.selectedOfferID.index === index
                                    ? props.selectedOfferID
                                    : null
                                }
                              />
                            </>
                          ) : (
                            <div className="choose-plan-no-offer">
                              No offers available for this billing period.
                            </div>
                          )}
                        </div>
                      )}

                      {props.errorMessage && (
                        <div className="choose-plan-error">
                          {props.errorMessage}
                        </div>
                      )}
                    </div>

                    <div className="choose-plan-card__footer">
                      {!PurchasePlanList.isFreePackage ? (
                        <>
                          <button
                            onClick={() =>
                              props.BuyPlanData(
                                index,
                                PurchasePlanList.subscriptionPackageKeyID,
                              )
                            }
                            className="btn choose-plan-purchase-btn"
                          >
                            Purchase
                          </button>

                          <p className="choose-plan-note">
                            Note: Selected offer apply once only. After expiry,
                            standard rates apply.
                          </p>
                        </>
                      ) : (
                        <p className="choose-plan-note">
                          Included by default with your account.
                        </p>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="cp-footer-bar">
        <button
          className="btn btn-md btn-primary create-item-btn cp-btn cp-btn-primary"
          onClick={() => props.handleSuccessPopupOk(4)}
        >
          <span>Continue With The Free Package</span>
          {/* <span> Create Practice</span> */}
        </button>
      </div>
    </>
  );
};
const Create_practice_details = () => {
  // A] Declare State
  const {
    setTopbar,
    scrollUpDownByElementID,
    setLoader,
    scrollUptoCurrentPosition,
    setIsAddUpdatePurchaseDone,
    EngagementName,
    proposalName,
    formatValue,
    formatValueWithoutCurrencySymbol,
  } = useContext(AuthContextProvider);
  const dispatch = useDispatch();
  const common = useSelector((state) => state.Storage);

  const [activeTab, setActiveTab] = useState(1);
  const [requireErrorMessage, setRequireErrorMessage] = useState(false);
  const [requireOtherErrorMessage, setRequireOtherErrorMessage] =
    useState(false);
  const [companies, setCompanies] = useState([]);
  const [openErrorModal, setOpenErrorModal] = useState(false);
  const [countryLookupList, setCountryLookupList] = useState([]);
  const [incorporatedInList, setIncorporatedInList] = useState([]);
  const [countryCodes, setcountryCodes] = useState([]);
  const [currencyType, setCurrencyType] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [OrganisationKeyId, setOrganisationKeyId] = useState("");
  const [dismissModal, setDismissModal] = useState(null);
  const [officerError, setOfficersError] = useState(false);
  const [InvalidAppointedOnDate, setInvalidAppointedOnDate] = useState(false);
  const [DateValidation, setDateValidation] = useState(false);
  const [isValidForm, setIsValidForm] = useState({
    BasicForm: false,
    OfficerForm: false,
    OtherInfoForm: false,
    ChooseSubscriptionPlan: false,
  });
  const [AuthorityCount, setAuthorityCount] = useState(0);
  const [openSuccessModal, setOpenSuccessModal] = useState(false);
  const [officerCount, setOfficerCount] = useState(0);
  const [modelAction, setModelAction] = useState("create");
  const [selectedCountry, setSelectedCountries] = useState([]);
  const [signature, setSignature] = useState("");
  const [logo, setLogo] = useState(null);
  const [concatenatedResidentialAddress, setConcatenatedResidentialAddress] =
    useState([{ officersFullAddress: "" }]);
  const [concatenatedTradingAddress, setConcatenatedTradingAddress] =
    useState("");
  const [addressPopUpTitle, setAddressPopUpTitle] = useState(null);
  const [professionTypeLookupList, setProfessionTypeLookupList] = useState([]);

  const [fullAddress, setFullAddress] = useState("");
  const [addressUpdatedDatetime, setAddressUpdatedDatetime] = useState(
    Date.now(),
  );
  const [selectedOfferID, setSelectedOfferID] = useState({
    value: null,
    label: null,
    index: null,
    subscriptionPackageKeyID: null,
    packageName: null,
  });
  const [chooseApiData, setChooseApiData] = useState();
  const [isYearly, setIsYearly] = useState(true);
  const [modelRequestData, setModelRequestData] = useState({
    Action: null,
    message: "",
    status: 0,
  });
  const [address, setAddress] = useState({
    premises: null,
    addressLine1: null,
    addressLine2: null,
    locality: null,
    region: null,
    country: null,
    countryId: null,
    postcode: null,
  });
  const [basicInfo, setBasicInfo] = useState({
    businessTypeID: 2,
    businessTypeName: "Sole Trader",
    tradingName: "",
    professionTypeList: [],
    tradingStartDate: "",
    tradingAddress: {
      addressId: null,
      premises: null,
      addressLine1: null,
      addressLine2: null,
      locality: null,
      region: null,
      countryId: null,
      postcode: null,
      countryName: null,
    },
    signatoryName: "",
    signatoryImage: null,
    searchCompany: null,
    companyName: null,
    entityType: null,
    companyNumber: null,
    regOfficeAddress: null,
    incorporateIn: null,
  });
  const [otherInfo, setOtherInfo] = useState({
    VATReg: 1,
    VATNumber: null,
    preferredCurrency: 1,
    indirectTaxPercentage: null,
    website: null,
    contactEmail: null,
    contactPhone: null,
    countryCode: null,
    logo: null,
    brandColor: "#00AFEF",
    businessTagline: null,
    countryCodeID: { value: 9, label: "+44" },
    AffiliatedAcBodyName: null,
    webOfAffiliatedAccount: null,
  });
  const [companyForm, setCompanyForm] = useState({
    companyID: null,
    companyName: null,
    companyType: null,
    companyNumber: null,
    companyStatus: null,
    addressID: null,
    incorporationDate: null,
    incInID: null,
    moduleName: null,
    moduleID: null,
    companyAddress: null,
  });
  const [authoritySignatorySignatory, setAuthoritySignatorySignatory] =
    useState(false);
  const [officersForm, setOfficers] = useState([
    {
      officerID: null,
      firstName: "",
      lastName: "",
      countryCodeID: 9,
      phoneCountryCodeID: { value: 9, label: "+44" },
      phoneNo: "",
      emailID: "",
      addressID: null,
      isAuthorisedSignatory: false,
      officerRole: "",
      appointedOn: "",
      moduleName: null,
      moduleID: null,
      officersAddress: {
        addressId: null,
        premises: null,
        addressLine1: null,
        addressLine2: null,
        locality: null,
        region: null,
        countryId: null,
        postcode: null,
      },
    },
  ]);
  const [selectedOfficerAddressIndex, setSelectedOfficerAddressIndex] =
    useState(0);
  const [concatenatedRegisterAddress, setConcatenatedRegisterAddress] =
    useState("");

  const [BusinessTypeLookupList, setBusinessTypeLookupList] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const companyDebounceRef = useRef(null);
  const [saveLocationState, setSaveLocationState] = useState(location.state);
  // B] Initial UseEffect

  useEffect(() => {
    setTopbar("none");
    getCountries();
    getCountryCodes();
    GetCurrencyListData();
    GetBusinessTypeLookupListData();
    GetIncorporatedInLookUpListData();
    GetProfessionTypeLookupListData();
  }, []);

  useEffect(() => {
    let tradingAddressObj = {
      addressId: address?.address?.addressId,
      premises: address?.address?.premises,
      addressLine1: address?.address?.addressLine1,
      addressLine2: address?.address?.addressLine2,
      locality: address?.address?.locality,
      region: address?.address?.region,
      countryId: address?.address?.countryId,
      postcode: address?.address?.postcode,
      countryName: address?.address?.country,
    };
    if (addressPopUpTitle === "Trading Address") {
      setBasicInfo({
        ...basicInfo,
        tradingAddress: tradingAddressObj,
      });
      setConcatenatedTradingAddress(fullAddress);
    }
    if (
      addressPopUpTitle === "Residential Address" ||
      addressPopUpTitle === "Practice Address" ||
      addressPopUpTitle === "Correspondence Address"
    ) {
      setOfficers((prevOfficers) => {
        const updatedOfficers = [...prevOfficers];
        updatedOfficers[selectedOfficerAddressIndex].officersAddress =
          tradingAddressObj;
        return updatedOfficers;
      });

      let ResidentialFullAddress = [...concatenatedResidentialAddress];
      ResidentialFullAddress[selectedOfficerAddressIndex] = {
        officersFullAddress: fullAddress,
      };
      setConcatenatedResidentialAddress(ResidentialFullAddress);
    }
  }, [addressUpdatedDatetime]);

  // C] Call All lookUp List and Crud api here
  //1) BusinessType Lookup List Api
  const GetBusinessTypeLookupListData = async () => {
    try {
      const data = await GetBusinessTypeLookupList();
      if (data?.data?.statusCode === 200) {
        if (data?.data?.responseData?.data) {
          let BusinessTypeListData = data?.data?.responseData?.data;
          BusinessTypeListData = BusinessTypeListData.slice(1, 6).map(
            (BusinessType) => ({
              value: BusinessType.businessTypeID,
              label: BusinessType.businessTypeName,
            }),
          );

          setBusinessTypeLookupList(BusinessTypeListData);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  //1) Country Code Lookup List Api
  const getCountryCodes = async () => {
    try {
      const data = await CountryCode();

      if (data?.data?.statusCode === 200) {
        if (data?.data?.responseData?.data) {
          let CountryList = data?.data?.responseData?.data;
          CountryList = CountryList.map((countryCode) => ({
            value: countryCode.countryCodeId,
            label: countryCode.countryCode,
          }));
          setcountryCodes(CountryList);
          // officersForm.forEach((element) => {
          //   element.countryCodeID = CountryList[0].countryCodeId;
          // });
        }
      }
    } catch (error) {}
  };

  //  Profession Type Lookup List Api
  const GetProfessionTypeLookupListData = async () => {
    try {
      const data = await GetProfessionTypeLookupList();

      if (data?.data?.statusCode === 200) {
        if (data?.data?.responseData?.data) {
          const professionTypeLookupListData = data?.data?.responseData?.data;
          setProfessionTypeLookupList(professionTypeLookupListData);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };
  // Country Lookup list
  const getCountries = async () => {
    try {
      const data = await CountryName();
      if (data?.data?.statusCode === 200) {
        if (data?.data?.responseData?.data) {
          const CountryList = data?.data?.responseData?.data;
          setCountryLookupList(CountryList);
        }
      }
    } catch (error) {}
  };

  let countryValue = countryLookupList.map((country) => ({
    value: country.countryId,
    label: country.countryName,
  }));

  const GetIncorporatedInLookUpListData = async () => {
    try {
      const data = await GetIncorporatedInLookUpList();
      if (data?.data?.statusCode === 200) {
        if (data?.data?.responseData?.data) {
          let incorporateInListData = data?.data?.responseData?.data;
          incorporateInListData = incorporateInListData.map((incIn) => ({
            value: incIn.incInID,
            label: incIn.incInName,
          }));
          setIncorporatedInList(incorporateInListData);
        }
      }
    } catch (error) {}
  };

  // Currency Lookup list
  const GetCurrencyListData = async () => {
    try {
      const data = await GetCurrencyTypeList();
      if (data?.data?.statusCode === 200) {
        if (data?.data?.responseData?.data) {
          let CurrencyList = data?.data?.responseData?.data;
          CurrencyList = CurrencyList.map((currency) => ({
            value: currency.currencyId,
            label: currency.currencyName,
          }));
          setCurrencyType(CurrencyList);
          // officersForm.forEach((element) => {
          //   element.countryCodeID = CurrencyList[0].countryCodeId;
          // });
        }
      }
    } catch (error) {}
  };
  // professionType lookup list
  const ProfessionalTypeLookeupListOptions = professionTypeLookupList.map(
    (ptype) => ({
      value: ptype.professionTypeId,
      label: ptype.professionTypeName,
    }),
  );

  const professionTypeValue = basicInfo?.professionTypeList?.map((item) => ({
    value: item.professionTypeId,
    label: item.professionTypeName,
  }));

  // 1) On Change Select Profession Type
  const OnChangeSelectProfessionType = (ptype) => {
    const updatedPfList = ptype.map((option) => ({
      professionTypeId: option.value,
      professionTypeName: option.label,
    }));

    setBasicInfo({
      ...basicInfo,
      professionTypeList: updatedPfList,
    });
  };

  const addOfficer = () => {
    setOfficersError(false);
    setOfficerCount(officerCount + 1);
    concatenatedResidentialAddress.push({
      officersFullAddress: "",
    });
    officersForm.push({
      officerID: null,
      firstName: "",
      lastName: "",
      countryCodeID: 9,
      phoneCountryCodeID: { value: 9, label: "+44" },
      phoneNo: "",
      emailID: "",
      addressID: null,
      isAuthorisedSignatory: false,
      officerRole: "",
      appointedOn: "",
      moduleName: null,
      moduleID: null,
      officersAddress: null,
    });
    if (basicInfo.businessTypeID === CLIENT_TYPES.Partnership) {
      setTimeout(function () {
        scrollUpDownByElementID(`Partner_${officersForm.length - 1}`);
      }, 200);
    }
    if (
      basicInfo.businessTypeID === CLIENT_TYPES.LLP ||
      basicInfo.businessTypeID === CLIENT_TYPES.Company
    ) {
      setTimeout(function () {
        scrollUpDownByElementID(`Officers${officersForm.length - 1}`);
      }, 200);
    }
  };
  const AddUpdateClickedPracticeDetails = (confirmToSave, nextTab) => {
    const ApiRequest_ParamsObj = {
      organisationKeyID: null,
      confirmToSave:
        confirmToSave == undefined ? modelRequestData.status : confirmToSave,
      professionTypeList:
        basicInfo.professionTypeList?.length === 0
          ? null
          : basicInfo.professionTypeList,
      userKeyID: common.userKeyID,
      businessTypeID: basicInfo.businessTypeID,
      tradingBusinessName: basicInfo.tradingName,
      tradingStartDate: basicInfo.tradingStartDate,
      organisationAddress: basicInfo.tradingAddress,
      companyDetails: companyForm,
      officersList: officersForm,
      otherInformation: {
        orgOtherInfoId: 0,
        signatoryName: basicInfo.signatoryName,
        signatureImageUrl: null,
        isVatRegistered: otherInfo.VATReg,
        vatNumber: otherInfo.VATNumber,
        indirectTaxPercentage: otherInfo.indirectTaxPercentage,
        preferredCurrencyId: otherInfo.preferredCurrency,
        website: otherInfo.website,
        countryCodeID: otherInfo.countryCodeID?.value,
        phoneNo: otherInfo.contactPhone,
        emailID: otherInfo.contactEmail,
        logoUrl: null,
        brandColor: otherInfo.brandColor,
        businessTagline: otherInfo.businessTagline,
        affiliatedAccountingBodyName: otherInfo.AffiliatedAcBodyName,
        affiliatedAccountingBodyWebsite: otherInfo.webOfAffiliatedAccount,
        countryCode: otherInfo.countryCode?.label,
      },
      professionTypeList: basicInfo.professionTypeList,
    };

    AddUpdateOrganisationData(ApiRequest_ParamsObj, nextTab);
  };
  // Add or Update Service Category Data
  const AddUpdateOrganisationData = async (apiRequestParams, nextTab) => {
    setLoader(true);
    try {
      let url = "/Organisation/AddUpdateOrganisationInformation"; // Default URL for Adding Data
      const response = await AddUpdateOrganisation(url, apiRequestParams);
      if (response) {
        if (response?.data?.statusCode === 200) {
          debugger;
          const refreshTokenResponse = await RefreshToken(common.userKeyID);
          if (refreshTokenResponse?.data?.statusCode === 200) {
            const newToken = refreshTokenResponse.data.responseData.token;
            dispatch(updateState({ token: newToken }));
          }
          localStorage.removeItem("OrganisationLocalList");
          let uploadSignatureResponse;
          const ModuleKeyID = response.data.responseData.data;
          setOrganisationKeyId(ModuleKeyID);
          let showSuccessModalWhen = "OrganisationSuccess";
          if (basicInfo.signatoryImage !== null && otherInfo.logo !== null) {
            showSuccessModalWhen = "LogoSuccess";
          } else if (basicInfo.signatoryImage !== null) {
            showSuccessModalWhen = "SignatoryImageSuccess";
          } else if (otherInfo.logo !== null) {
            showSuccessModalWhen = "LogoSuccess";
          }

          if (showSuccessModalWhen === "OrganisationSuccess") {
            setLoader(false);
            // setOpenSuccessModal(true);
            $("#" + "ConfirmModel").modal("hide");
            setActiveTab(nextTab);
            ChoosePlanApiModelData();
          }
          if (basicInfo.signatoryImage !== null) {
            const Signature = new FormData();
            // Instead, you should append the entire file
            Signature.set("file", basicInfo.signatoryImage); // Append the file itself
            uploadSignatureResponse = await AddUpdateSignature(
              ModuleKeyID,
              Signature,
            );
          }
          let uploadLogoResponse;
          if (otherInfo.logo !== null) {
            const Logo = new FormData();
            Logo.set("file", otherInfo.logo); // Append the file itself
            uploadLogoResponse = await AddUpdateLogo(ModuleKeyID, Logo);
          }

          if (uploadSignatureResponse || uploadLogoResponse) {
            setLoader(false);
            // setOpenSuccessModal(true);
            setActiveTab(nextTab);
            ChoosePlanApiModelData();
          }
          $("#" + "ConfirmModel").modal("hide");

          const professionTypeIDs = basicInfo.professionTypeList.map(
            (item) => item.professionTypeId,
          );
          setActiveTab(nextTab);
          ChoosePlanApiModelData();
          localStorage.removeItem("OrganisationLocalList");
          if (common.organisationCount == 0) {
            // dispatch(
            //   updateState({
            //     businessTypeID: basicInfo.businessTypeID,
            //     organisationCount: Number(common.organisationCount) + 1,
            //     organisationKeyID: ModuleKeyID,
            //     professionTypeLists: professionTypeIDs,
            //     enableEL: 1,
            //   })
            // );
          } else {
            dispatch(
              updateState({
                businessTypeID: basicInfo.businessTypeID,
                organisationKeyID: ModuleKeyID,
                professionTypeLists: professionTypeIDs,
                enableEL: 1,
              }),
            );
          }
        } else {
          setLoader(false);
          setErrorMessage(response?.response?.data?.errorMessage);
          const alreadyExistMessage = response?.response?.data?.errorMessage;
          if (
            response?.response?.data?.errorMessage.includes("already exist")
          ) {
            setErrorMessage("");
            setModelRequestData({
              ...modelRequestData,
              Action: "PracticeWarning",
              message: alreadyExistMessage,
            });

            $("#" + "ConfirmModel").modal("show");
          }
        }
      }
    } catch (error) {
      setLoader(false);
      console.error(error);
    }
  };

  // 1] Company search function Api
  const getCompanies = async (params) => {
    try {
      const data = await GetCompanyList(params);
      if (data?.data?.responseData) {
        if (data?.data?.responseData) {
          const CompanyList = data?.data?.responseData;
          setCompanies(CompanyList);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Save company detail Function
  const companyDetails = async (params) => {
    try {
      const data = await GetCompanyDetails(params);

      if (data?.data?.responseData) {
        setCompanies([]);
        const CompanyDetails = data?.data?.responseData;
        const address = CompanyDetails.registered_office_address;
        const selected_Country = countryLookupList.filter(
          (c) => c.countryName == address.country,
        )[0];

        const company_Address = {
          addressId: null,
          premises: address.premises || null,
          addressLine1: address.address_line_1 || null,
          addressLine2: address.address_line_2 || null,
          locality: address.locality || null,
          country: address.country || null,
          countryId: selected_Country?.countryId || null,
          region: address.region || null,
          postcode: address.postal_code || null,
        };

        const fullAddress = concatenateFullAddress(company_Address);
        setConcatenatedRegisterAddress(fullAddress);
        setBasicInfo({
          ...basicInfo,
          tradingName: CompanyDetails.company_name,
          tradingStartDate: CompanyDetails.date_of_creation,
          tradingAddress: company_Address,
          regOfficeAddress: fullAddress,
        });
        setConcatenatedTradingAddress(fullAddress);
        setCompanyForm({
          ...companyForm,
          companyName: CompanyDetails.company_name,
          companyNumber: CompanyDetails.company_number,
          companyType: CompanyDetails.type,
          incInID: null,
          incorporationDate: CompanyDetails.date_of_creation,
          companyAddress: company_Address,
        });
      }
    } catch (error) {
      console.log(error);
    }
  };
  //Save officer detail form
  const companyOfficers = async (params) => {
    try {
      const data = await GetCompanyOfficers(params);
      if (data?.data?.responseData) {
        let CompanyOfficer = data?.data?.responseData;
        let CompOfficers = [];
        let CorrespondenceOrResidentialAddress = [];
        let officerCount = 0;
        if (CompanyOfficer?.length === 0) {
          CompOfficers.push({
            officerID: null,
            firstName: "",
            lastName: "",
            countryCodeID: 9,
            phoneCountryCodeID: { value: 9, label: "+44" },
            phoneNo: null,
            emailID: null,
            addressID: null,
            isAuthorisedSignatory: false,
            officerRole: "",
            appointedOn: "",
            moduleName: null,
            moduleID: null,
            officersAddress: null,
          });
          let CorrespondenceOrResidentialAddressObj = {
            officersFullAddress: null,
          };
          CorrespondenceOrResidentialAddress.push(
            CorrespondenceOrResidentialAddressObj,
          );
        } else {
          CompanyOfficer.forEach((officer) => {
            officerCount = officerCount + 1;
            let officerName = officer?.name?.split(",");
            let officerFirstName = officerName[1]?.trim()?.split(" ")[0];
            let officerLastName = officerName[0]?.trim()?.split(" ")[0];

            if (officerFirstName && officerFirstName?.length > 30) {
              officerFirstName = officerFirstName?.substring(0, 29);
            }
            if (officerLastName && officerLastName?.length > 30) {
              officerLastName = officerLastName?.substring(0, 29);
            }
            const selected_Country = countryLookupList.filter(
              (c) => c.countryName == officer?.address.country,
            )[0];

            let officerAddress = {
              organisationID: common.organisationID,
              premises: officer?.address.premises || null,
              addressLine1:
                `${officer?.address.premises || ""} ${
                  officer?.address.address_line_1 || ""
                }`.trim() || null,
              addressLine2: officer?.address.address_line_2 || null,
              locality: officer?.address.locality || null,
              region: officer?.address.region || null,
              country: officer?.address.country || null,
              countryId:
                selected_Country?.countryId === ""
                  ? null
                  : selected_Country?.countryId,
              postcode: officer?.address.postal_code || null,
            };

            CompOfficers.push({
              createdByID: 0,
              organisationID: common.organisationID,
              officerID: null,
              firstName: officerFirstName === undefined ? "" : officerFirstName,
              lastName: officerLastName === undefined ? "" : officerLastName,
              countryCodeID: 9,
              phoneCountryCodeID: { value: 9, label: "+44" },
              phoneNo: null,
              emailID: "",
              addressID: null,
              isAuthorisedSignatory: false,
              officerRole: officer?.officer_role,
              appointedOn: officer?.appointed_on,
              moduleName: null,
              moduleID: 0,
              officersAddress: officerAddress,
            });
            let fullAddressConcatenation =
              concatenateFullAddress(officerAddress);
            let CorrespondenceOrResidentialAddressObj = {
              officersFullAddress: fullAddressConcatenation,
            };
            CorrespondenceOrResidentialAddress.push(
              CorrespondenceOrResidentialAddressObj,
            );
          });
        }

        setConcatenatedResidentialAddress(CorrespondenceOrResidentialAddress);
        setOfficers(CompOfficers);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const concatenateFullAddress = (address) => {
    const addPart = (part) => (part ? `${part}, ` : "");
    let concatenatedAddress = `${addPart(
      address?.addressLine1?.replace(",", " "),
    )}${addPart(address?.addressLine2)}${addPart(address?.locality)}${addPart(
      address?.region,
    )}${addPart(address?.country || address?.countryName)}${
      address?.postcode || ""
    }`;

    // Remove trailing comma, if present
    if (concatenatedAddress.endsWith(", ")) {
      concatenatedAddress = concatenatedAddress.slice(0, -2);
    }
    return concatenatedAddress;
  };

  const OnOfficerChange = (index, field, value) => {
    const updatedOfficer = [...officersForm];
    updatedOfficer[index][field] = value;
    setOfficers(updatedOfficer);
  };

  const deleteOfficer = (index) => {
    const addressesCopy = [...concatenatedResidentialAddress];

    if (index >= 0 && index < addressesCopy.length) {
      addressesCopy.splice(index, 1);
      setConcatenatedResidentialAddress(addressesCopy);
    }
    const officerCopy = [...officersForm];
    if (index >= 0 && index < officerCopy.length) {
      officerCopy.splice(index, 1);
      setOfficers(officerCopy);
    }
  };

  // Handle Function
  const handleCompanySelect = (e) => {
    const company_Number = e.company_number;
    setSignature(null);
    setAuthoritySignatorySignatory(false);
    setOfficersError(false);
    setIsValidForm({
      ...isValidForm,
      BasicForm: false,
      OfficerForm: false,
      OtherInfoForm: false,
    });

    setOtherInfo({
      VATReg: 1,
      VATNumber: null,
      preferredCurrency: 1,
      website: null,
      contactEmail: null,
      contactPhone: null,
      countryCode: null,
      logo: null,
      brandColor: "#00AFEF",
      businessTagline: null,
      countryCodeID: { value: 9, label: "+44" },
      AffiliatedAcBodyName: null,
      webOfAffiliatedAccount: null,
    });
    setOfficers([
      {
        officerID: null,
        firstName: "",
        lastName: "",
        countryCodeID: 9,
        phoneCountryCodeID: { value: 9, label: "+44" },
        phoneNo: "",
        emailID: "",
        addressID: null,
        isAuthorisedSignatory: false,
        officerRole: "",
        appointedOn: "",
        moduleName: "",
        moduleID: null,
        officersAddress: {
          addressId: null,
          premises: "",
          addressLine1: "",
          addressLine2: "",
          locality: "",
          region: "",
          countryId: null,
          postcode: "",
        },
      },
    ]);
    setConcatenatedResidentialAddress([{ officersFullAddress: "" }]);
    companyOfficers(company_Number);
    companyDetails(company_Number);
  };

  const handleCompanyInputChange = (e) => {
    const newValue = e.target.value.trim();
    if (companyDebounceRef.current) {
      clearTimeout(companyDebounceRef.current);
    }
    if (newValue === "") {
      setCompanies([]);
      // Hide the autocomplete list here
      const autocompleteDiv = document.querySelector(".searchList");
      if (autocompleteDiv) {
        autocompleteDiv.classList.remove("show");
      }
    } else {
      companyDebounceRef.current = setTimeout(() => {
        getCompanies(newValue);
        // Show the autocomplete list here
        const autocompleteDiv = document.querySelector(".searchList");
        if (autocompleteDiv) {
          autocompleteDiv.classList.add("show");
        }
      }, 700);
    }
  };

  const handleCountriesChange = (selectedCountry) => {
    setSelectedCountries(selectedCountry);
    setCompanyForm({ ...companyForm, incInID: selectedCountry.value });
  };

  const handleIncorporatedInChange = (selectedCountry) => {
    setCompanyForm({ ...companyForm, incInID: selectedCountry.value });
  };

  const handleBackBtnChange = (newTab) => {
    // setCompanies([]);

    setOfficersError(false);
    setRequireOtherErrorMessage(false);
    setRequireErrorMessage(false);
    setActiveTab(newTab);
  };
  // tab value change
  const handleChangeTab = (newTab, clickedTabID) => {
    if (activeTab === CREATE_PRACTICE_DETAILS.ChoosePlan) {
      return false;
    }
    let clickedTabClasses = $("#" + clickedTabID).attr("class");
    if (clickedTabClasses?.includes("disabled")) {
      return false;
    }
    if (newTab <= activeTab) {
      setOfficersError(false);
      setRequireErrorMessage(false);
      setRequireOtherErrorMessage(false);
      setActiveTab(newTab);
    } else {
      if (newTab == 3) {
        let createPractice = true;
        handleTabChange(newTab, createPractice);
      } else {
        handleTabChange(newTab);
      }
    }
  };

  const handleCancel = () => {
    if (saveLocationState === 1) {
      navigate("/get-started");
    } else {
      navigate("/");
    }
  };

  const handleSuccessPopupOk = () => {
    $("#" + "ConfirmModel").modal("hide");
    const professionTypeIDs = basicInfo.professionTypeList.map(
      (item) => item.professionTypeId,
    );
    localStorage.removeItem("OrganisationLocalList");
    if (common.organisationCount == 0) {
      dispatch(
        updateState({
          businessTypeID: basicInfo.businessTypeID,
          organisationCount: Number(common.organisationCount) + 1,
          organisationKeyID: OrganisationKeyId,
          professionTypeLists: professionTypeIDs,
          enableEL: 1,
        }),
      );
      // navigate("/")
      const navigateAndRefresh = () => {
        navigate("/");
        setIsAddUpdatePurchaseDone(true);
        // window.location.reload(true);
      };
      // Call the navigateAndRefresh function
      navigateAndRefresh();
      // Close the pop-up
      // setOpenAddressPopUp(false);
    } else {
      dispatch(
        updateState({
          businessTypeID: basicInfo.businessTypeID,
          organisationKeyID: OrganisationKeyId,
          professionTypeLists: professionTypeIDs,
          enableEL: 1,
        }),
      );
      // navigate("/")
      const navigateAndRefresh = () => {
        navigate("/");
        setIsAddUpdatePurchaseDone(true);
        // window.location.reload(true);
      };
      // Call the navigateAndRefresh function
      navigateAndRefresh();
      // Close the pop-up
      // setOpenAddressPopUp(false);
    }
  };

  const handleConfirmButton = () => {
    setModelRequestData({
      ...modelRequestData,
      Action: "PracticeWarning",
      Status: 1,
    });
    AddUpdateClickedPracticeDetails(1, 4);
  };
  const phoneNumberRegex = /^\d{10,15}$/; // Allow between 10 and 15 digits
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const urlRegex =
    /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi;

  const handleTabChange = (newTab, createPractice) => {
    setCompanies([]);
    let hasOfficerError = false;
    let DateError = false;
    let authorizedRecords;
    let OfficerAppointedOnDate = false;
    if (
      basicInfo.businessTypeID === CLIENT_TYPES.Partnership ||
      basicInfo.businessTypeID === CLIENT_TYPES.LLP ||
      basicInfo.businessTypeID === CLIENT_TYPES.Company
    ) {
      authorizedRecords = officersForm.filter(
        (item) => item.isAuthorisedSignatory === true,
      );
      setAuthorityCount(authorizedRecords.length);
    }

    if (activeTab === CREATE_PRACTICE_DETAILS.BasicInformation) {
      if (
        basicInfo.businessTypeID === CLIENT_TYPES.Sole_Trader ||
        basicInfo.businessTypeID === CLIENT_TYPES.Partnership
      ) {
        // const dateString = basicInfo.tradingStartDate;
        // // Step 1: Check if the input is a valid date string
        // if (dateString != "" && dateString != null) {
        //   if (!isNaN(Date.parse(dateString))) {
        //     // Step 2: Parse Date
        //     const parsedDate = new Date(dateString);
        //     // Step 3: Additional Checks (Optional)
        //     const minYear = 1970; // Minimum acceptable year
        //     const maxYear = new Date().getFullYear(); // Maximum acceptable year
        //     if (
        //       !isNaN(parsedDate.getTime()) &&
        //       parsedDate.getFullYear() >= minYear &&
        //       parsedDate.getFullYear() <= maxYear
        //     ) {
        //       // Valid date
        //       setRequireErrorMessage(false);
        //       setDateValidation(false); // Set validation to false (indicating a valid date)
        //       DateError = false; // Set DateError to false
        //     } else {
        //       // Invalid date
        //       setDateValidation(true); // Set validation to true (indicating an invalid date)
        //       DateError = true; // Set DateError to true
        //     }
        //   } else {
        //     // Invalid date string format
        //     setDateValidation(true); // Set validation to true (indicating an invalid date string format)
        //     DateError = true; // Set DateError to true
        //   }
        // }

        if (
          basicInfo.businessTypeID === "" ||
          basicInfo.professionTypeList.length === 0 ||
          basicInfo.businessTypeID === null ||
          basicInfo.tradingName === "" ||
          basicInfo.tradingName === null ||
          basicInfo.tradingStartDate === "" ||
          basicInfo.tradingStartDate === null ||
          basicInfo.tradingAddress === "" ||
          basicInfo.tradingAddress === null ||
          concatenatedTradingAddress === null ||
          concatenatedTradingAddress === "" ||
          ((basicInfo.signatoryName === null ||
            basicInfo.signatoryName === undefined ||
            basicInfo.signatoryName === "" ||
            signature === null ||
            signature === undefined ||
            signature === "") &&
            !(
              (basicInfo.signatoryName === null ||
                basicInfo.signatoryName === undefined ||
                basicInfo.signatoryName === "") &&
              (signature === null ||
                signature === undefined ||
                signature === "")
            ))
        ) {
          setRequireErrorMessage(true);
          if (basicInfo.professionTypeList.length === 0) {
            scrollUpDownByElementID("ProspectType_Div");
          }
          setIsValidForm({
            ...isValidForm,
            BasicForm: false,
          });
          return false;
        } else {
          setActiveTab(newTab);
          setRequireErrorMessage(false);
          setIsValidForm({
            ...isValidForm,
            BasicForm: true,
          });
        }
      } else if (
        basicInfo.businessTypeID === CLIENT_TYPES.LLP ||
        basicInfo.businessTypeID === CLIENT_TYPES.Company
      ) {
        // const dateString = basicInfo.tradingStartDate;
        // // Step 1: Check if the input is a valid date string
        // if (dateString != "" && dateString != null) {
        //   if (!isNaN(Date.parse(dateString))) {
        //     // Step 2: Parse Date
        //     const parsedDate = new Date(dateString);
        //     // Step 3: Additional Checks (Optional)
        //     const minYear = 1970; // Minimum acceptable year
        //     const maxYear = new Date().getFullYear(); // Maximum acceptable year
        //     if (
        //       !isNaN(parsedDate.getTime()) &&
        //       parsedDate.getFullYear() >= minYear &&
        //       parsedDate.getFullYear() <= maxYear
        //     ) {
        //       // Valid date
        //       setOfficersError(false)
        //       setDateValidation(false); // Set validation to false (indicating a valid date)
        //       DateError = false; // Set DateError to false
        //     } else {
        //       // Invalid date
        //       setDateValidation(true); // Set validation to true (indicating an invalid date)
        //       DateError = true; // Set DateError to true
        //     }
        //   } else {
        //     // Invalid date string format
        //     setDateValidation(true); // Set validation to true (indicating an invalid date string format)
        //     DateError = true; // Set DateError to true
        //   }
        // }
        if (
          companyForm.incInID === 0 ||
          companyForm.incInID === null ||
          basicInfo.businessTypeID === "" ||
          basicInfo.professionTypeList?.length === 0 ||
          basicInfo.businessTypeID === null ||
          basicInfo.tradingName === "" ||
          basicInfo.tradingName === null ||
          companyForm.companyName === null ||
          companyForm.companyName === "" ||
          companyForm.companyNumber === "" ||
          companyForm.companyNumber === null ||
          basicInfo.tradingStartDate === "" ||
          basicInfo.tradingStartDate === null ||
          basicInfo.tradingAddress === "" ||
          basicInfo.tradingAddress === null ||
          concatenatedTradingAddress === null ||
          concatenatedTradingAddress === "" ||
          ((basicInfo.signatoryName === null ||
            basicInfo.signatoryName === undefined ||
            basicInfo.signatoryName === "" ||
            signature === null ||
            signature === undefined ||
            signature === "") &&
            !(
              (basicInfo.signatoryName === null ||
                basicInfo.signatoryName === undefined ||
                basicInfo.signatoryName === "") &&
              (signature === null ||
                signature === undefined ||
                signature === "")
            ))
        ) {
          setRequireErrorMessage(true);
          if (basicInfo.professionTypeList.length === 0) {
            scrollUpDownByElementID("ProspectType_Div");
          } else if (
            companyForm.companyName === null ||
            companyForm.companyName === ""
          ) {
            scrollUpDownByElementID("CompanyName");
          } else if (
            companyForm.companyNumber === "" ||
            companyForm.companyNumber === null
          ) {
            scrollUpDownByElementID("CompanyNumber");
          } else if (
            companyForm.incInID === null ||
            companyForm.incInID === ""
          ) {
            scrollUpDownByElementID("InCorporateIDDiv");
          } else if (
            basicInfo.tradingName === "" ||
            basicInfo.tradingName === null ||
            basicInfo.tradingStartDate === "" ||
            basicInfo.tradingStartDate === null ||
            concatenatedTradingAddress === null ||
            concatenatedTradingAddress === ""
          ) {
            scrollUpDownByElementID("LTDTradingDetails");
          }
          setIsValidForm({
            ...isValidForm,
            BasicForm: false,
            OfficerForm: false,
            OtherInfoForm: false,
            ChooseSubscriptionPlan: false,
          });
          return false;
        } else {
          setActiveTab(newTab);
          setIsValidForm({
            ...isValidForm,
            BasicForm: true,
          });
          setRequireErrorMessage(false);
        }
      }
    } else if (activeTab === CREATE_PRACTICE_DETAILS.OfficerDetails) {
      if (basicInfo.businessTypeID === CLIENT_TYPES.Sole_Trader) {
        for (let i = 0; i < officersForm.length; i++) {
          if (
            officersForm[i].firstName === "" ||
            officersForm[i].firstName === null ||
            officersForm[i].firstName === undefined ||
            officersForm[i].lastName === "" ||
            officersForm[i].lastName === null ||
            officersForm[i].lastName === undefined ||
            officersForm[i].phoneNo === "" ||
            officersForm[i].phoneNo === null ||
            !phoneNumberRegex.test(officersForm[i].phoneNo) ||
            officersForm[i].emailID === "" ||
            officersForm[i].emailID === null ||
            !emailPattern.test(officersForm[i].emailID) ||
            concatenatedResidentialAddress[i].officersFullAddress === null ||
            concatenatedResidentialAddress[i].officersFullAddress === ""
          ) {
            setOfficersError(true);
            setIsValidForm({
              ...isValidForm,
              OfficerForm: false,
              OtherInfoForm: false,
              ChooseSubscriptionPlan: false,
            });
            break; // Use break to exit the loop once an error is found
          } else {
            for (let i = 0; i < officersForm.length; i++) {
              if (
                officersForm[i].phoneNo !== null &&
                officersForm[i].phoneNo !== "" &&
                officersForm[i].phoneNo !== undefined
              ) {
                if (!phoneNumberRegex.test(officersForm[i].phoneNo)) {
                  setOfficersError(true);
                  setIsValidForm({
                    ...isValidForm,
                    BasicForm: false,
                    OfficerForm: false,
                    OtherInfoForm: false,
                    ChooseSubscriptionPlan: false,
                  });
                  hasOfficerError = true;
                }
              }
            }
            if (!hasOfficerError) {
              setActiveTab(newTab);
              setIsValidForm({
                ...isValidForm,
                OfficerForm: true,
              });
              setOfficersError(false);
            }
            setRequireErrorMessage(false);
          }
        }
      } else if (basicInfo.businessTypeID === CLIENT_TYPES.Partnership) {
        for (let i = 0; i < officersForm.length; i++) {
          if (
            officersForm[i]?.firstName === "" ||
            officersForm[i]?.firstName === null ||
            officersForm[i]?.firstName === undefined ||
            officersForm[i]?.lastName === "" ||
            officersForm[i]?.lastName === null ||
            officersForm[i]?.lastName === undefined ||
            officersForm[i]?.phoneNo === "" ||
            officersForm[i]?.phoneNo === null ||
            authorizedRecords.length === 0 ||
            !phoneNumberRegex.test(officersForm[i]?.phoneNo) ||
            officersForm[i]?.emailID === "" ||
            officersForm[i]?.emailID === null ||
            !emailPattern.test(officersForm[i]?.emailID) ||
            concatenatedResidentialAddress[i]?.officersFullAddress === null ||
            concatenatedResidentialAddress[i]?.officersFullAddress === ""
          ) {
            setAuthoritySignatorySignatory(true);
            setOfficersError(true);
            scrollUpDownByElementID(`Partner_${i}`);
            setIsValidForm({
              ...isValidForm,
              OfficerForm: false,
              OtherInfoForm: false,
              ChooseSubscriptionPlan: false,
            });
            hasOfficerError = true;
            return false;
          }
        }
        if (!hasOfficerError) {
          setActiveTab(newTab);
          setIsValidForm({
            ...isValidForm,
            OfficerForm: true,
          });
          setOfficersError(false);
        }
      } else if (
        basicInfo.businessTypeID === CLIENT_TYPES.LLP ||
        basicInfo.businessTypeID === CLIENT_TYPES.Company
      ) {
        for (let i = 0; i < officersForm.length; i++) {
          if (
            officersForm[i].firstName === "" ||
            officersForm[i].firstName === null ||
            officersForm[i].firstName === undefined ||
            officersForm[i].lastName === "" ||
            officersForm[i].lastName === null ||
            officersForm[i].lastName === undefined ||
            officersForm[i].emailID === "" ||
            officersForm[i].emailID === null ||
            authorizedRecords.length === 0 ||
            officersForm[i].officerRole === "" ||
            officersForm[i].officerRole === null ||
            officersForm[i].appointedOn === null ||
            officersForm[i].appointedOn === "" ||
            officersForm[i].appointedOn === undefined ||
            !emailPattern.test(officersForm[i].emailID) ||
            concatenatedResidentialAddress[i].officersFullAddress === null ||
            concatenatedResidentialAddress[i].officersFullAddress === ""
          ) {
            setAuthoritySignatorySignatory(true);
            setOfficersError(true);
            scrollUpDownByElementID(`Officers${i}`);
            setIsValidForm({
              ...isValidForm,
              OfficerForm: false,
              OtherInfoForm: false,
              ChooseSubscriptionPlan: false,
            });

            hasOfficerError = true;
            return false;
          }
        }
        for (let i = 0; i < officersForm.length; i++) {
          if (
            officersForm[i].phoneNo !== null &&
            officersForm[i].phoneNo !== "" &&
            officersForm[i].phoneNo !== undefined
          ) {
            if (!phoneNumberRegex.test(officersForm[i].phoneNo)) {
              setOfficersError(true);
              scrollUpDownByElementID(`Officers${i}`);
              setIsValidForm({
                ...isValidForm,
                BasicForm: false,
                OfficerForm: false,
                OtherInfoForm: false,
                ChooseSubscriptionPlan: false,
              });
              hasOfficerError = true;
            }
          }
        }
        if (!hasOfficerError && !OfficerAppointedOnDate) {
          setActiveTab(newTab);
          setIsValidForm({
            ...isValidForm,
            OfficerForm: true,
          });
          setOfficersError(false);
        }
      }
    } else if (activeTab === CREATE_PRACTICE_DETAILS.OtherInformation) {
      if (
        otherInfo.preferredCurrency === "" ||
        otherInfo.preferredCurrency === null ||
        otherInfo.contactEmail === "" ||
        otherInfo.contactEmail === null ||
        otherInfo.contactPhone === "" ||
        otherInfo.contactPhone === null ||
        !phoneNumberRegex.test(otherInfo.contactPhone) ||
        !emailPattern.test(otherInfo.contactEmail)
      ) {
        setRequireOtherErrorMessage(true);
        return false;
      } else if (
        otherInfo.indirectTaxPercentage !== null &&
        otherInfo.indirectTaxPercentage > 100
      ) {
        setIsValidForm({
          ...isValidForm,
          OfficerForm: true,
          ChooseSubscriptionPlan: true,
        });
        setRequireOtherErrorMessage(true);
        return false;
      } else if (
        otherInfo.website !== "" &&
        otherInfo.website !== undefined &&
        otherInfo.website !== null
      ) {
        if (!urlRegex.test(otherInfo.website)) {
          setRequireOtherErrorMessage(true);
          return false;
        } else {
          setIsValidForm({
            ...isValidForm,
            OfficerForm: true,
            ChooseSubscriptionPlan: true,
          });
          setRequireOtherErrorMessage(false);
          if (createPractice) {
            return;
          } else {
            AddUpdateClickedPracticeDetails(null, newTab);
          }
        }
      } else {
        setIsValidForm({
          ...isValidForm,
          OfficerForm: true,
          ChooseSubscriptionPlan: true,
        });
        setRequireOtherErrorMessage(false);
        if (createPractice) {
          return;
        } else {
          AddUpdateClickedPracticeDetails(null, newTab);
        }
      }
    }
  };
  const ChoosePlanApiModelData = async () => {
    try {
      const data = await ChoosePlanApi();
      if (data?.data?.statusCode === 200) {
        if (data?.data?.responseData?.data) {
          const ModelData = data?.data?.responseData?.data;

          setChooseApiData(ModelData);
        }
      } else {
        setErrorMessage(data?.data?.errorMessage);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleToggle = () => {
    setIsYearly(!isYearly); // Toggle between monthly and yearly
    // Additional logic if needed
    setSelectedOfferID({
      value: null,
      label: null,
      index: null,
      subscriptionPackageKeyID: null,
      packageName: null,
    });
  };

  const BuyPlanData = async (i, subscriptionPackageKeyIDForPurchase) => {
    setLoader(true);
    try {
      const subscriptionPackageData =
        subscriptionPackageKeyIDForPurchase ===
        selectedOfferID?.subscriptionPackageKeyID
          ? selectedOfferID.subscriptionPackageKeyID
          : subscriptionPackageKeyIDForPurchase;
      const offerData =
        subscriptionPackageKeyIDForPurchase ===
        selectedOfferID?.subscriptionPackageKeyID
          ? selectedOfferID.value
          : null;
      const data = await BuyPlan({
        organisationKeyID: OrganisationKeyId,
        userKeyID: common.userKeyID,
        subscriptionPackageKeyID: subscriptionPackageData,
        paymentFrequencyID: isYearly ? 1 : 4,
        offerID: offerData,
      });

      if (data && data?.data?.statusCode === 200) {
        setLoader(false);

        const invoiceKeyID = data.data.responseData.invoiceKeyID;
        const finalBillingAmount = data.data.responseData.finalBillingAmount;
        if (finalBillingAmount !== null) {
          CreateStripeCheckoutSessionRedirection(
            common.userKeyID,
            invoiceKeyID,
          );
        } else {
          navigate("/mySubscription");
        }
      } else {
        setLoader(false);
        setErrorMessage(data?.data?.errorMessage);
      }
    } catch (error) {
      setLoader(false);
      console.log(error);
    }
  };
  const CreateStripeCheckoutSessionRedirection = async (
    userKeyID,
    InvoiceKeyID,
  ) => {
    setLoader(true);

    try {
      const response = await CreateStripeCheckoutSession(
        userKeyID,
        InvoiceKeyID,
      );
      const data = response.data;

      if (data.statusCode === 200) {
        if (common.organisationCount == 0) {
          const professionTypeIDs = basicInfo.professionTypeList.map(
            (item) => item.professionTypeId,
          );
          dispatch(
            updateState({
              businessTypeID: basicInfo.businessTypeID,
              organisationCount: Number(common.organisationCount) + 1,
              organisationKeyID: OrganisationKeyId,
              professionTypeLists: professionTypeIDs,
              enableEL: 1,
            }),
          );
        }
        const sessionURL = data.responseData.sessionURL;
        setLoader(false);

        window.open(sessionURL, "_self");
      } else {
        console.error("Error fetching data from the API");
        setLoader(false);
      }
    } catch (error) {
      console.error("Error fetching data from the API", error);
      setLoader(false);
    }
  };

  const handleSelectChange = (
    selectedOption,
    index,
    subscriptionPackageKeyIDNew,
    packageNameNew,
  ) => {
    // Extract the offerID and label from the selected option
    const selectedOfferID = selectedOption.value;
    const selectedName = selectedOption.label;
    const subscriptionPackageKeyID = subscriptionPackageKeyIDNew;

    // Store the selected offerID, label, and index in state
    setSelectedOfferID({
      value: selectedOfferID,
      label: selectedName,
      index,
      subscriptionPackageKeyID: subscriptionPackageKeyID,
      packageName: packageNameNew,
    });
    // setSelectedIndex(index);
  };

  return (
    <div className="cp-page">
      <div className="cp-page-head">
        <h1 className="cp-page-title">
          <BackButtonSvg onClick={handleCancel} />
          Create New Practice
        </h1>
        {/* <p className="cp-page-subtitle">
          Set up your organisation profile, officers, branding and plan.
        </p> */}
      </div>

      <div className="cp-steps-wrap">
        <ul className="cp-steps">
          <li>
            <div
              onClick={() =>
                handleChangeTab(1, "Practice_BasicInformation_Tab")
              }
              id="Practice_BasicInformation_Tab"
              className={`${
                activeTab === CREATE_PRACTICE_DETAILS.BasicInformation
                  ? "cp-step is-active"
                  : isValidForm.BasicForm === true
                    ? "cp-step is-done"
                    : "cp-step disabled cursor-not-allowed"
              }`}
            >
              <span className="cp-step-count">1</span>
              <span className="cp-step-title">Basic Information</span>
              {requireErrorMessage && (
                <span className="validation cp-step-warn">
                  <InvalidFormIcon />
                </span>
              )}
            </div>
          </li>

          <li>
            <div
              onClick={() => handleChangeTab(2, "Practice_OfficerDetails_Tab")}
              id="Practice_OfficerDetails_Tab"
              className={`${
                activeTab === CREATE_PRACTICE_DETAILS.OfficerDetails
                  ? "cp-step is-active"
                  : isValidForm.BasicForm === true
                    ? "cp-step is-done"
                    : "cp-step disabled cursor-not-allowed"
              }`}
            >
              <span className="cp-step-count">2</span>
              <span className="cp-step-title">
                {basicInfo.businessTypeID === null
                  ? "Sole Trader"
                  : [4, 5].includes(basicInfo.businessTypeID)
                    ? "Officer Details"
                    : basicInfo.businessTypeName}
              </span>
              {officerError && isValidForm.BasicForm === true && (
                <span className="validation cp-step-warn">
                  <InvalidFormIcon />
                </span>
              )}
            </div>
          </li>

          <li>
            <div
              onClick={() =>
                handleChangeTab(3, "Practice_OtherInformation_Tab")
              }
              id="Practice_OtherInformation_Tab"
              className={`${
                activeTab === CREATE_PRACTICE_DETAILS.OtherInformation
                  ? "cp-step is-active"
                  : isValidForm.OfficerForm === true
                    ? "cp-step is-done"
                    : "cp-step disabled cursor-not-allowed"
              }`}
            >
              <span className="cp-step-count">3</span>
              <span className="cp-step-title">Other Information</span>
              {requireOtherErrorMessage && isValidForm.OfficerForm && (
                <span className="validation cp-step-warn">
                  <InvalidFormIcon />
                </span>
              )}
            </div>
          </li>

          <li>
            <div
              className={`${
                activeTab === CREATE_PRACTICE_DETAILS.ChoosePlan
                  ? "cp-step is-active"
                  : isValidForm.ChooseSubscriptionPlan === true
                    ? "cp-step is-done"
                    : "cp-step disabled cursor-not-allowed"
              }`}
            >
              <span className="cp-step-count">4</span>
              <span className="cp-step-title">Choose Plan</span>
            </div>
          </li>
        </ul>
      </div>

      <div className="cp-content">
        {activeTab === CREATE_PRACTICE_DETAILS.BasicInformation && (
          <Basic_information
            scrollUptoCurrentPosition={scrollUptoCurrentPosition}
            DateValidation={DateValidation}
            setDateValidation={setDateValidation}
            InvalidAppointedOnDate={InvalidAppointedOnDate}
            setInvalidAppointedOnDate={setInvalidAppointedOnDate}
            concatenatedTradingAddress={concatenatedTradingAddress}
            officersForm={officersForm}
            setOfficers={setOfficers}
            errorMessage={errorMessage}
            setOfficersError={setOfficersError}
            setConcatenatedTradingAddress={setConcatenatedTradingAddress}
            basicInfo={basicInfo}
            ProfessionalTypeLookeupListOptions={
              ProfessionalTypeLookeupListOptions
            }
            professionTypeValue={professionTypeValue}
            OnChangeSelectProfessionType={OnChangeSelectProfessionType}
            addressPopUpTitle={addressPopUpTitle}
            setAddressPopUpTitle={setAddressPopUpTitle}
            addressUpdatedDatetime={addressUpdatedDatetime}
            setAddressUpdatedDatetime={setAddressUpdatedDatetime}
            address={address}
            fullAddress={fullAddress}
            concatenatedRegisterAddress={concatenatedRegisterAddress}
            setConcatenatedRegisterAddress={setConcatenatedRegisterAddress}
            setFullAddress={setFullAddress}
            setRequireErrorMessage={setRequireErrorMessage}
            signature={signature}
            setSignature={setSignature}
            setAddress={setAddress}
            setBasicInfo={setBasicInfo}
            requireErrorMessage={requireErrorMessage}
            companies={companies}
            companyForm={companyForm}
            setCompanyForm={setCompanyForm}
            selectedCountry={selectedCountry}
            BusinessTypeLookupList={BusinessTypeLookupList}
            countryValue={countryValue}
            incorporatedInList={incorporatedInList}
            handleCompanySelect={handleCompanySelect}
            handleCompanyInputChange={handleCompanyInputChange}
            handleCountriesChange={handleCountriesChange}
            handleIncorporatedInChange={handleIncorporatedInChange}
            handleTabChange={handleTabChange}
            handleCancel={handleCancel}
            setConcatenatedResidentialAddress={
              setConcatenatedResidentialAddress
            }
            handleBackBtnChange={handleBackBtnChange}
          />
        )}
        {activeTab === CREATE_PRACTICE_DETAILS.OfficerDetails && (
          <OfficerDetails
            scrollUptoCurrentPosition={scrollUptoCurrentPosition}
            officersForm={officersForm}
            officerError={officerError}
            errorMessage={errorMessage}
            otherInfo={otherInfo}
            InvalidAppointedOnDate={InvalidAppointedOnDate}
            setInvalidAppointedOnDate={setInvalidAppointedOnDate}
            setOtherInfo={setOtherInfo}
            AuthorityCount={AuthorityCount}
            authoritySignatorySignatory={authoritySignatorySignatory}
            setAuthoritySignatorySignatory={setAuthoritySignatorySignatory}
            businessTypeID={basicInfo.businessTypeID}
            addressPopUpTitle={addressPopUpTitle}
            setOfficersError={setOfficersError}
            setAddressPopUpTitle={setAddressPopUpTitle}
            addressUpdatedDatetime={addressUpdatedDatetime}
            setAddressUpdatedDatetime={setAddressUpdatedDatetime}
            concatenatedResidentialAddress={concatenatedResidentialAddress}
            setConcatenatedResidentialAddress={
              setConcatenatedResidentialAddress
            }
            setSelectedOfficerAddressIndex={setSelectedOfficerAddressIndex}
            OnOfficerChange={OnOfficerChange}
            addOfficer={addOfficer}
            fullAddress={fullAddress}
            setFullAddress={setFullAddress}
            address={address}
            setAddress={setAddress}
            deleteOfficer={deleteOfficer}
            countryCodes={countryCodes}
            handleTabChange={handleTabChange}
            handleCancel={handleCancel}
            handleBackBtnChange={handleBackBtnChange}
          />
        )}
        {activeTab === CREATE_PRACTICE_DETAILS.OtherInformation && (
          <OtherInformation
            otherInfo={otherInfo}
            setOtherInfo={setOtherInfo}
            requireOtherErrorMessage={requireOtherErrorMessage}
            currencyType={currencyType}
            countryCodes={countryCodes}
            logo={logo}
            errorMessage={errorMessage}
            setLogo={setLogo}
            handleCancel={handleCancel}
            handleTabChange={handleTabChange}
            handleBackBtnChange={handleBackBtnChange}
          />
        )}
        {activeTab === CREATE_PRACTICE_DETAILS.ChoosePlan && (
          <SubscriptionPlanView
            handleSelectChange={handleSelectChange}
            BuyPlanData={BuyPlanData}
            handleSuccessPopupOk={handleSuccessPopupOk}
            handleToggle={handleToggle}
            isYearly={isYearly}
            setIsYearly={setIsYearly}
            formatValue={formatValue}
            EngagementName={EngagementName}
            proposalName={proposalName}
            selectedOfferID={selectedOfferID}
            chooseApiData={chooseApiData}
            formatValueWithoutCurrencySymbol={formatValueWithoutCurrencySymbol}
          />
        )}

        {/* Write Component here */}
      </div>

      <ConfirmModel
        openErrorModal={openErrorModal}
        openSuccessModal={openSuccessModal}
        modelRequestData={modelRequestData}
        UpdatedStatus={handleConfirmButton}
        modelAction={modelAction}
      />
      <SuccessModal
        keepPopup
        handleClose={handleSuccessPopupOk}
        setDismissModal={setDismissModal}
        setOpenSuccessModal={setOpenSuccessModal}
        openSuccessModal={openSuccessModal}
        modelAction={"Create"}
        message={"Practice " + basicInfo.tradingName}
      />
    </div>
  );
};

export default Create_practice_details;
