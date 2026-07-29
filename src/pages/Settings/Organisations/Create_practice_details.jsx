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
import Switch from "@mui/material/Switch";
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
        className="create-practice-height scrollbar"
        id="style-1"
      >
        <div className="tab-content">
          <div className="tab-pane p-3 active">
            <div class="row fieldset" id="ProspectType_Div">
              <div class="col-md-3 col-sm-12 text-start text-md-end">
                <label class="fieldset-label required">
                  Profession Type
                  <span class="text-danger">*</span>
                </label>
              </div>
              <div className="col-md-9 col-sm-12 ">
                <div className="mb businessType input-group">
                  <Select
                    isMulti
                    style={{ padding: "5px" }}
                    options={props.ProfessionalTypeLookeupListOptions}
                    value={props.professionTypeValue}
                    onChange={props.OnChangeSelectProfessionType}
                  />
                  {props.requireErrorMessage &&
                  props.professionTypeValue?.length === 0 ? (
                    <span className="validation">{ERROR_MESSAGES}</span>
                  ) : (
                    ""
                  )}
                </div>
              </div>
            </div>
            <div class="row fieldset" id="BusinessType_Div">
              <div class="col-md-3 col-sm-12 text-start text-md-end">
                <label class="fieldset-label required">Business Type</label>
                <span class="text-danger">*</span>
              </div>
              <div class="col-md-9 col-sm-12">
                <div className="mb businessType input-group">
                  <Select
                    style={{ padding: "5px", width: "20%" }}
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
                    <span className="validation">{ERROR_MESSAGES}</span>
                  ) : (
                    ""
                  )}
                </div>
              </div>
            </div>
            {/* ...........Sole Trader Detail And Partnership Detail Row........... */}
            {(props.basicInfo.businessTypeID === CLIENT_TYPES.Sole_Trader ||
              props.basicInfo.businessTypeID === CLIENT_TYPES.Partnership) && (
              <div>
                <div className="row fieldset ">
                  <div class="col-md-3 col-sm-12 text-start text-md-end">
                    <label class="fieldset-label required">Trading Name</label>
                    <span class="text-danger">*</span>
                  </div>
                  <div className="col-md-9 col-sm-12">
                    <div className="">
                      <div className="input-group">
                        <input
                          type="text"
                          maxLength={50}
                          className="input-text"
                          placeholder="Trading Name"
                          value={props.basicInfo.tradingName}
                          onChange={(e) => {
                            const inputValue = e.target.value;
                            const trimmedValue = inputValue.replace(
                              /^\s+/g,
                              "",
                            );

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
                      </div>
                      {props.requireErrorMessage &&
                      (props.basicInfo.tradingName === "" ||
                        props.basicInfo.tradingName === null) ? (
                        <span className="validation">{ERROR_MESSAGES}</span>
                      ) : (
                        ""
                      )}
                    </div>
                  </div>
                </div>
                <div className="row fieldset">
                  <div class="col-md-3 col-sm-12 text-start text-md-end">
                    <label class="fieldset-label required">
                      Trading Start Date
                    </label>
                    <span class="text-danger">*</span>
                  </div>
                  <div className="col-md-9 col-sm-12">
                    <DatePicker
                      minDate={minDate}
                      maxDate={maxDate}
                      style={{ width: "100%" }}
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

                    {props.DateValidation &&
                    (props.basicInfo.tradingStartDate !== "" ||
                      props.basicInfo.tradingStartDate !== null) ? (
                      <span className="validation">Invalid Date</span>
                    ) : (
                      ""
                    )}

                    {props.requireErrorMessage &&
                    (props.basicInfo.tradingStartDate === "" ||
                      props.basicInfo.tradingStartDate === null) ? (
                      <span className="validation">{ERROR_MESSAGES}</span>
                    ) : (
                      ""
                    )}
                  </div>
                </div>
                <div className="row fieldset">
                  <div class="col-md-3 col-sm-12 text-start text-md-end">
                    <label class="fieldset-label required">
                      Trading Address
                    </label>
                    <span class="text-danger">*</span>
                  </div>
                  <div className="col-md-9 col-sm-12">
                    <div className="input-group">
                      <input
                        type="text"
                        style={{ cursor: "pointer" }}
                        class="input-text"
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
                    </div>
                    {props.requireErrorMessage &&
                    (props.basicInfo.tradingAddress === "" ||
                      props.basicInfo.tradingAddress === null ||
                      props.concatenatedTradingAddress === null ||
                      props.concatenatedTradingAddress === "") ? (
                      <span className="validation">{ERROR_MESSAGES}</span>
                    ) : (
                      ""
                    )}
                  </div>
                </div>
                <div className="row">
                  <div className="fieldset-group">
                    <label htmlFor="" className="fieldset-group-label required">
                      E Signature
                    </label>
                    <div className="row fieldset">
                      <div class="col-md-3 col-sm-12 text-start text-md-end">
                        <label class="fieldset-label required">
                          Signatory Name
                          {props.signature !== null &&
                            props.signature !== undefined &&
                            props.signature !== "" && (
                              <span class="text-danger">*</span>
                            )}
                        </label>
                      </div>
                      <div className="col-md-9 col-sm-12">
                        <div className="">
                          <div className="input-group">
                            <input
                              type="text"
                              className="input-text"
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
                              <span className="validation">
                                {ERROR_MESSAGES}
                              </span>
                            ) : (
                              ""
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="row ">
                      <div class="col-md-3 col-sm-12 text-start text-md-end">
                        <label class="fieldset-label mt-2 required">
                          Signatory Image
                          {props.basicInfo.signatoryName !== null &&
                            props.basicInfo.signatoryName !== undefined &&
                            props.basicInfo.signatoryName !== "" && (
                              <span class="text-danger">*</span>
                            )}
                        </label>
                      </div>
                      <div className="col-md-9 col-sm-12">
                        <div className="">
                          <div className="input-group">
                            <div className="col-lg-12 ">
                              {props.signature ? (
                                <div className="upload-image-preview-div">
                                  <img
                                    src={props.signature}
                                    className="upload-image-preview"
                                    style={{
                                      height: "200px",
                                      width: "200px",
                                      objectFit: "contain",
                                    }}
                                    alt="Selected Signature"
                                  />
                                  <button
                                    onClick={() => {
                                      props.setSignature(null);
                                      props.setBasicInfo({
                                        ...props.basicInfo,
                                        signatoryImage: null,
                                      });
                                    }}
                                    style={{
                                      float: "right",
                                      paddingTop: "5px",
                                    }}
                                    className="btn btn-sm btn-danger  remove-item-btn d-flex gap-1"
                                  >
                                    Remove
                                  </button>
                                </div>
                              ) : (
                                <>
                                  <button
                                    className="btn btn-md btn-primary create-item-btn"
                                    data-bs-toggle="modal"
                                    onClick={() => {
                                      setType("Signature");
                                    }}
                                    data-bs-target="#SignatureUploadModel"
                                  >
                                    <i class="bi bi-plus-circle margin-right"></i>
                                    <span> Upload Signature</span>
                                  </button>
                                  <div className="text-muted helpMessage">
                                    Supported file types are .jpg, .jpeg, .png
                                    up to a file size of 2MB.
                                  </div>
                                  {props.requireErrorMessage &&
                                  props.basicInfo.signatoryName !== null &&
                                  props.basicInfo.signatoryName !== undefined &&
                                  props.basicInfo.signatoryName !== "" &&
                                  (props.signature === "" ||
                                    props.signature === null) ? (
                                    <span className="validation">
                                      This field is required if you have entered
                                      a value in the above 'Signatory Name'
                                      field. To proceed without uploading a
                                      signature, please remove the data from
                                      'Signatory Name' above.
                                    </span>
                                  ) : (
                                    ""
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ...........Company Detail And Llp Detail Row........... */}
            {(props.basicInfo.businessTypeID === CLIENT_TYPES.Company ||
              props.basicInfo.businessTypeID === CLIENT_TYPES.LLP) && (
              <div>
                <div className="row fieldset">
                  <div class="col-md-3 col-sm-12 text-start text-md-end">
                    <label class="fieldset-label required">
                      Search Company
                    </label>
                  </div>
                  <div className="col-md-9 col-sm-12">
                    <div className="">
                      <div className="input-group">
                        <input
                          type="text"
                          style={{ padding: "5px" }}
                          class="input-text"
                          id="category-description"
                          placeholder="Search Company"
                          onChange={(e) => props.handleCompanyInputChange(e)}
                          onKeyDown={(e) => {
                            if (e.key === " " && e.target.value === "") {
                              e.preventDefault();
                            }
                          }}
                        />
                      </div>
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
                  </div>
                </div>
                <div className="row fieldset" id="CompanyName">
                  <div class="col-md-3 col-sm-12 text-start text-md-end">
                    <label class="fieldset-label required">Company Name</label>
                    <span class="text-danger">*</span>
                  </div>
                  <div className="col-md-9 col-sm-12">
                    <input
                      disabled
                      style={{ padding: "5px" }}
                      class="input-text"
                      id="category-description"
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
                      <span className="validation">{ERROR_MESSAGES}</span>
                    ) : (
                      ""
                    )}
                  </div>
                </div>
                <div className="row fieldset">
                  <div class="col-md-3 col-sm-12 text-start text-md-end">
                    <label class="fieldset-label required">Entity Type</label>
                    <span class="text-danger">*</span>
                  </div>
                  <div className="col-md-9 col-sm-12">
                    <input
                      disabled
                      style={{ padding: "5px" }}
                      class="input-text"
                      id="category-description"
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
                      <span className="validation">{ERROR_MESSAGES}</span>
                    ) : (
                      ""
                    )}
                  </div>
                </div>
                <div className="row fieldset" id="CompanyNumber">
                  <div class="col-md-3 col-sm-12 text-start text-md-end">
                    <label class="fieldset-label required">
                      Company Number
                    </label>
                    <span class="text-danger">*</span>
                  </div>
                  <div className="col-md-9 col-sm-12">
                    <input
                      disabled
                      style={{ padding: "5px" }}
                      class="input-text"
                      id="category-description"
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
                      <span className="validation">{ERROR_MESSAGES}</span>
                    ) : (
                      ""
                    )}
                  </div>
                </div>
                <div className="row fieldset">
                  <div class="col-md-3 col-sm-12 text-start text-md-end">
                    <label class="fieldset-label required">
                      Registered Office Address
                    </label>
                  </div>
                  <div className="col-md-9 col-sm-12">
                    <div className="">
                      <div className="input-group">
                        <input
                          disabled
                          style={{ padding: "5px" }}
                          class="input-text"
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
                    </div>
                  </div>
                </div>
                <div className="row fieldset">
                  <div class="col-md-3 col-sm-12 text-start text-md-end">
                    <label class="fieldset-label required">
                      Incorporation Date
                    </label>
                    <span class="text-danger">*</span>
                  </div>
                  <div className="col-md-9 col-sm-12">
                    <div className="input-group">
                      <input
                        disabled
                        style={{ padding: "5px" }}
                        className="input-text"
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
                    </div>
                    {props.requireErrorMessage &&
                    (props.companyForm.incorporationDate === "" ||
                      props.companyForm.incorporationDate === null) ? (
                      <span className="validation">{ERROR_MESSAGES}</span>
                    ) : (
                      ""
                    )}
                  </div>
                </div>
                <div className="row fieldset" id="InCorporateIDDiv">
                  <div class="col-md-3 col-sm-12 text-start text-md-end">
                    <label class="fieldset-label required">
                      Incorporated In
                    </label>
                    <span class="text-danger">*</span>
                  </div>
                  <div className="col-md-9 col-sm-12">
                    <div className="">
                      <div className="input-group">
                        <Select
                          className="CurrencySelect"
                          options={props.incorporatedInList}
                          value={IncorporatedValue}
                          onChange={props.handleIncorporatedInChange}
                        />
                      </div>
                      {props.requireErrorMessage &&
                      (props.companyForm.incInID === 0 ||
                        props.companyForm.incInID === null) ? (
                        <span className="validation">{ERROR_MESSAGES}</span>
                      ) : (
                        ""
                      )}
                    </div>
                  </div>
                </div>
                {/* .............Trading Detail------------- */}

                <div className="row fieldset" id="LTDTradingDetails">
                  <div className="fieldset-group">
                    <label htmlFor="" className="fieldset-group-label required">
                      Trading Detail
                    </label>
                    <div className="row fieldset">
                      <div class="col-md-3 col-sm-12 text-start text-md-end">
                        <label class="fieldset-label required">
                          Trading Name
                        </label>
                        <span class="text-danger">*</span>
                      </div>

                      <div className="col-md-9 col-sm-12">
                        <div className="">
                          <div className="input-group">
                            <input
                              type="text"
                              maxLength={50}
                              className="input-text"
                              placeholder="Trading Name"
                              value={props.basicInfo.tradingName}
                              onChange={(e) => {
                                const inputValue = e.target.value;
                                const trimmedValue = inputValue.replace(
                                  /^\s+/g,
                                  "",
                                );

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
                          </div>
                          {props.requireErrorMessage &&
                          (props.basicInfo.tradingName === "" ||
                            props.basicInfo.tradingName === null) ? (
                            <span className="validation">{ERROR_MESSAGES}</span>
                          ) : (
                            ""
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="row fieldset">
                      <div class="col-md-3 col-sm-12 text-start text-md-end">
                        <label class="fieldset-label required">
                          Trading Start Date
                        </label>
                        <span class="text-danger">*</span>
                      </div>
                      <div className="col-md-9 col-sm-12">
                        <DatePicker
                          minDate={minDate}
                          maxDate={maxDate}
                          style={{ width: "100%" }}
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

                        {props.DateValidation &&
                        (props.basicInfo.tradingStartDate !== "" ||
                          props.basicInfo.tradingStartDate !== null) ? (
                          <span className="validation">Invalid Date</span>
                        ) : (
                          ""
                        )}
                        {props.requireErrorMessage &&
                        (props.basicInfo.tradingStartDate === "" ||
                          props.basicInfo.tradingStartDate === null) ? (
                          <span className="validation">{ERROR_MESSAGES}</span>
                        ) : (
                          ""
                        )}
                      </div>
                    </div>
                    <div className="row fieldset">
                      <div class="col-md-3 col-sm-12 text-start text-md-end">
                        <label class="fieldset-label required">
                          Trading Address
                        </label>
                        <span class="text-danger">*</span>
                      </div>
                      <div className="col-md-9 col-sm-12">
                        <div className="">
                          <div className="input-group">
                            <input
                              type="text"
                              style={{ cursor: "pointer" }}
                              class="input-text"
                              id="category-description"
                              placeholder="Trading Address"
                              value={props.concatenatedTradingAddress}
                              onMouseDown={(e) => {
                                e.preventDefault();
                                props.setAddressPopUpTitle("Trading Address");
                                handleOpenTradingAddressPopup(e);
                              }}
                            />
                          </div>
                          {props.requireErrorMessage &&
                          (props.basicInfo.tradingAddress === "" ||
                            props.basicInfo.tradingAddress === null ||
                            props.concatenatedTradingAddress === null ||
                            props.concatenatedTradingAddress === "") ? (
                            <span className="validation">{ERROR_MESSAGES}</span>
                          ) : (
                            ""
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="row fieldset" id="LTD_E_Signature">
                  {/* ....E-signature........ */}
                  <div className="fieldset-group">
                    <label htmlFor="" className="fieldset-group-label required">
                      E Signature
                    </label>
                    <div className="row fieldset">
                      <div class="col-md-3 col-sm-12 text-start text-md-end">
                        <label class="fieldset-label required">
                          Signatory Name
                          {props.signature !== null &&
                            props.signature !== undefined &&
                            props.signature !== "" && (
                              <span class="text-danger">*</span>
                            )}
                        </label>
                      </div>
                      <div className="col-md-9 col-sm-12">
                        <div className="">
                          <div className="input-group">
                            <input
                              type="text"
                              className="input-text"
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
                              <span className="validation">
                                {ERROR_MESSAGES}
                              </span>
                            ) : (
                              ""
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="row ">
                      <div class="col-md-3 col-sm-12 text-start text-md-end">
                        <label class="fieldset-label mt-2 required">
                          Signatory Image
                          {props.basicInfo.signatoryName !== null &&
                            props.basicInfo.signatoryName !== undefined &&
                            props.basicInfo.signatoryName !== "" && (
                              <span class="text-danger">*</span>
                            )}
                        </label>
                      </div>
                      <div className="col-md-9  col-sm-12">
                        <div className="input-group">
                          <div className="col-lg-12 ">
                            {props.signature ? (
                              <div className="upload-image-preview-div">
                                <img
                                  src={props.signature}
                                  style={{
                                    height: "200px",
                                    width: "200px",
                                    objectFit: "contain",
                                  }}
                                  className="upload-image-preview"
                                  alt="Selected Signature"
                                />
                                <button
                                  onClick={() => {
                                    props.setSignature(null);
                                    props.setBasicInfo({
                                      ...props.basicInfo,
                                      signatoryImage: null,
                                    });
                                  }}
                                  style={{
                                    float: "right",
                                    paddingTop: "5px",
                                  }}
                                  className="btn btn-sm btn-danger  remove-item-btn d-flex gap-1"
                                >
                                  Remove
                                </button>
                              </div>
                            ) : (
                              <>
                                <button
                                  className="btn btn-md btn-primary create-item-btn"
                                  data-bs-toggle="modal"
                                  onClick={() => {
                                    setType("Signature");
                                  }}
                                  data-bs-target="#SignatureUploadModel"
                                >
                                  <i class="bi bi-plus-circle margin-right"></i>
                                  <span> Upload Signature</span>
                                </button>
                                <div className="text-muted helpMessage">
                                  Supported file types are .jpg, .jpeg, .png up
                                  to a file size of 2MB.
                                </div>
                                {props.requireErrorMessage &&
                                props.basicInfo.signatoryName !== null &&
                                props.basicInfo.signatoryName !== undefined &&
                                props.basicInfo.signatoryName !== "" &&
                                (props.signature === "" ||
                                  props.signature === null) ? (
                                  <span className="validation">
                                    This field is required if you have entered a
                                    value in the above 'Signatory Name' field.
                                    To proceed without uploading a signature,
                                    please remove the data from 'Signatory Name'
                                    above.
                                  </span>
                                ) : (
                                  ""
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
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
      </div>

      <span
        style={{ display: "flex", justifyContent: "center" }}
        className="validation"
      >
        {props.errorMessage}
      </span>
      <div class="separator"></div>
      <div class="col-lg-12 hstack gap-2 justify-content-end text-right mt-4">
        <button class="btn btn-md btn-light" onClick={props.handleCancel}>
          <span>Cancel</span>
        </button>
        <button
          class="btn btn-md btn-primary create-item-btn"
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
        className="create-practice-height scrollbar"
        id="style-1"
      >
        <div className="tab-content">
          <div className="row">
            <div className="col-xl-12 col-lg-12">
              {/* Sole Trader Form */}
              {props.businessTypeID === CLIENT_TYPES.Sole_Trader &&
                props.officersForm?.map((item, index) => {
                  return (
                    <>
                      <div className="row fieldset mt-4">
                        <div className="col-md-3 col-sm-12 text-start text-md-end">
                          <label class="fieldset-label required">
                            First Name
                            <span style={{ color: "#ec4561" }}>*</span>
                          </label>
                        </div>
                        <div class="col-lg-9 col-md-8 col-sm-12">
                          <input
                            type="text"
                            style={{ padding: "10px" }}
                            class="input-text"
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
                            <span className="validation">{ERROR_MESSAGES}</span>
                          ) : (
                            ""
                          )}
                        </div>
                      </div>
                      <div className="row fieldset">
                        <div className="col-md-3 col-sm-12 text-start text-md-end">
                          <label class="fieldset-label required">
                            Last Name
                            <span style={{ color: "#ec4561" }}>*</span>
                          </label>
                        </div>
                        <div class="col-lg-9 col-md-8 col-sm-12">
                          <input
                            type="text"
                            style={{ padding: "10px" }}
                            class="input-text"
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
                            <span className="validation">{ERROR_MESSAGES}</span>
                          ) : (
                            ""
                          )}
                        </div>
                      </div>
                      <div class="row fieldset">
                        <div class="col-md-3 col-sm-12 text-start text-md-end">
                          <label class="fieldset-label required">Phone</label>
                          <span style={{ color: "#ec4561" }}>*</span>
                        </div>
                        <div className="col-md-8 col-lg-9 col-sm-12 ">
                          <div className="phone-input-div">
                            <Select
                              style={{ padding: "5px", width: "20%" }}
                              className="createCompanyInfo"
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
                                style={{ width: "100%" }}
                                className="input-text"
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
                          (props.officersForm[index]?.phoneCountryCodeID ===
                            "" ||
                            props.officersForm[index]?.phoneCountryCodeID ===
                              null ||
                            props.officersForm[index].phoneNo === "" ||
                            props.officersForm[index].phoneNo === null) ? (
                            <span className="validation">{ERROR_MESSAGES}</span>
                          ) : props.officerError &&
                            !isValidPhoneNumber(
                              props.officersForm[index].phoneNo,
                            ) ? (
                            <span className="validation">
                              {" "}
                              Invalid phone number{" "}
                            </span>
                          ) : (
                            ""
                          )}
                        </div>
                      </div>
                      <div class="row fieldset">
                        <div class="col-md-3 col-sm-12 text-start text-md-end">
                          <label class="fieldset-label required">
                            Practice Email
                            <span className="text-danger">*</span>
                          </label>
                        </div>
                        <div class="col-lg-9 col-md-8 col-sm-12">
                          <input
                            type="text"
                            style={{ padding: "10px" }}
                            class="input-text"
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
                              <span className="validation">
                                {ERROR_MESSAGES}
                              </span>
                            ) : (
                              !isValidEmail(
                                props.officersForm[index].emailID,
                              ) && (
                                <span className="validation">
                                  Invalid email pattern
                                </span>
                              )
                            ))}
                        </div>
                      </div>
                      <div class="row fieldset">
                        <div class="col-md-3 col-sm-12 text-start text-md-end">
                          <label class="fieldset-label required">
                            Practice Address
                            <span style={{ color: "#ec4561" }}>*</span>
                          </label>
                        </div>
                        <div class="col-lg-9 col-md-8 col-sm-12">
                          <input
                            className="input-text"
                            type="text"
                            style={{ cursor: "pointer" }}
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
                            <span className="validation">{ERROR_MESSAGES}</span>
                          ) : (
                            ""
                          )}
                        </div>
                      </div>
                    </>
                  );
                })}
              {/* lpp form */}
              {props.businessTypeID === CLIENT_TYPES.Partnership && (
                <div>
                  {props.officersForm?.map((i, index) => {
                    return (
                      <div className="fieldset-group" id={`Partner_${index}`}>
                        <label class="fieldset-group-label">
                          {" "}
                          Partner {index + 1}{" "}
                        </label>
                        <label
                          htmlFor=""
                          className="fieldset-group-label-1 required"
                        >
                          {props.officersForm?.length === 1 ? null : (
                            <button
                              className="btn btn-sm btn-danger gap-1 delete-fieldset-group"
                              onClick={() => props.deleteOfficer(index)}
                            >
                              <i class="bi bi-trash3"></i>
                              Delete Partner
                            </button>
                          )}
                        </label>
                        <div
                          style={{ alignItems: "center" }}
                          className="align-right text-right mb-2"
                        >
                          <Switch
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
                        {props.officersForm.length === 0 && (
                          <div className="row fieldset flex-center-div">
                            <div className="col-lg-12 text-end">
                              <span className="validation">
                                {" "}
                                At least 1 authorised partner is required.{" "}
                              </span>
                            </div>
                          </div>
                        )}
                        {props.authoritySignatorySignatory &&
                          props.officerError &&
                          props.AuthorityCount === 0 && (
                            <div className="row fieldset flex-center-div">
                              <div className="col-lg-12 text-end">
                                <span className="validation">
                                  {" "}
                                  At least 1 authorised partner is
                                  required.{" "}
                                </span>
                              </div>
                            </div>
                          )}
                        <div className="row fieldset">
                          <div className="col-md-3 col-sm-12 text-start text-md-end">
                            <label class="fieldset-label required">
                              First Name
                              <span style={{ color: "#ec4561" }}>*</span>
                            </label>
                          </div>
                          <div class="col-md-9 col-sm-12">
                            <input
                              type="text"
                              style={{ padding: "5px" }}
                              class="input-text"
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
                              <span className="validation">
                                {ERROR_MESSAGES}
                              </span>
                            ) : (
                              ""
                            )}
                          </div>
                          <div className="mb-2"></div>
                          <div className="col-md-3 col-sm-12 text-start text-md-end">
                            <label class="fieldset-label required">
                              Last Name
                              <span style={{ color: "#ec4561" }}>*</span>
                            </label>
                          </div>
                          <div class="col-md-9 col-sm-12">
                            <input
                              type="text"
                              style={{ padding: "5px" }}
                              class="input-text"
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
                              <span className="validation">
                                {ERROR_MESSAGES}
                              </span>
                            ) : (
                              ""
                            )}
                          </div>
                        </div>

                        <div class="row fieldset">
                          <div class="col-md-3 col-sm-12 text-start text-md-end">
                            <label class="fieldset-label required">Phone</label>
                            <span style={{ color: "#ec4561" }}>*</span>
                          </div>
                          <div className="col-md-9 col-sm-12 ">
                            <div className="phone-input-div">
                              <Select
                                style={{ padding: "5px", width: "20%" }}
                                className="createCompanyInfo"
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
                                  style={{ width: "100%" }}
                                  className="input-text"
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
                              <span className="validation">
                                {ERROR_MESSAGES}
                              </span>
                            ) : props.officerError &&
                              !isValidPhoneNumber(
                                props.officersForm[index].phoneNo,
                              ) ? (
                              <span className="validation">
                                {" "}
                                Invalid phone number{" "}
                              </span>
                            ) : (
                              ""
                            )}
                          </div>
                          <div className="mb-2"></div>

                          <div class="col-md-3 col-sm-12 text-start text-md-end">
                            <label class="fieldset-label required">
                              Email
                              <span className="text-danger">*</span>
                            </label>
                          </div>
                          <div class="col-md-9 col-sm-12">
                            <input
                              placeholder="Email"
                              className="input-text"
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
                                <span className="validation">
                                  {ERROR_MESSAGES}
                                </span>
                              ) : (
                                !isValidEmail(
                                  props.officersForm[index].emailID,
                                ) && (
                                  <span className="validation">
                                    Invalid email pattern
                                  </span>
                                )
                              ))}
                          </div>
                        </div>
                        <div class="row fieldset">
                          <div class="col-md-3 col-sm-12 text-start text-md-end">
                            <label class="fieldset-label required">
                              Residential Address
                              <span className="text-danger">*</span>
                            </label>
                          </div>
                          <div class="col-md-9 col-sm-12">
                            <input
                              className="input-text"
                              type="text"
                              style={{ cursor: "pointer" }}
                              placeholder="Residential Address"
                              value={
                                props.concatenatedResidentialAddress[index]
                                  ?.officersFullAddress
                              }
                              onMouseDown={(e) => {
                                e.preventDefault();
                                props.setAddressPopUpTitle(
                                  "Residential Address",
                                );
                                handleOpenRegisterOfficeAddressPopup(e, index);
                              }}
                              autoComplete="off"
                            />
                            {props.officerError &&
                            (props.concatenatedResidentialAddress[index]
                              .officersFullAddress === null ||
                              props.concatenatedResidentialAddress[index]
                                .officersFullAddress === "") ? (
                              <span className="validation">
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
              )}
              {(props.businessTypeID === CLIENT_TYPES.Company ||
                props.businessTypeID === CLIENT_TYPES.LLP) && (
                <div>
                  {props.officersForm?.map((i, index) => {
                    return (
                      <div className="fieldset-group " id={`Officers${index}`}>
                        <label class="fieldset-group-label">
                          {" "}
                          Officer {index + 1}{" "}
                        </label>
                        <label
                          htmlFor=""
                          className="fieldset-group-label-1 required"
                        >
                          {props.officersForm?.length === 1 ? null : (
                            <button
                              className="btn btn-sm btn-danger gap-1 delete-fieldset-group"
                              onClick={() => props.deleteOfficer(index)}
                            >
                              <i class="bi bi-trash3 "></i>
                              Delete Officer
                            </button>
                          )}
                        </label>
                        <div
                          style={{ alignItems: "center" }}
                          className="align-right text-right mb-2"
                        >
                          <Switch
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
                        {props.officersForm.length === 0 && (
                          <div className="row fieldset flex-center-div">
                            <div className="col-lg-12 text-end">
                              <span className="validation">
                                {" "}
                                At least 1 authorised officer is required.{" "}
                              </span>
                            </div>
                          </div>
                        )}
                        {props.authoritySignatorySignatory &&
                          props.officerError &&
                          props.AuthorityCount === 0 && (
                            <div className="row fieldset flex-center-div">
                              <div className="col-lg-12 text-end">
                                <span className="validation">
                                  {" "}
                                  At least 1 authorised officer is
                                  required.{" "}
                                </span>
                              </div>
                            </div>
                          )}
                        <div className="row fieldset">
                          <div className="col-md-3 col-sm-12 text-start text-md-end">
                            <label class="fieldset-label required">
                              First Name
                              <span style={{ color: "#ec4561" }}>*</span>
                            </label>
                          </div>
                          <div class="col-md-9 col-sm-12 ">
                            <input
                              type="text"
                              style={{ padding: "5px" }}
                              class="input-text"
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
                              props.officersForm[index].firstName ===
                                undefined ||
                              props.officersForm[index].firstName === "") ? (
                              <span className="validation">
                                {ERROR_MESSAGES}
                              </span>
                            ) : (
                              ""
                            )}
                          </div>
                          <div className="mb-2"></div>
                          <div className="col-md-3 col-sm-12 text-start text-md-end">
                            <label class="fieldset-label required">
                              Last Name
                              <span style={{ color: "#ec4561" }}>*</span>
                            </label>
                          </div>
                          <div class="col-md-9 col-sm-12 ">
                            <input
                              type="text"
                              style={{ padding: "5px" }}
                              class="input-text"
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
                              <span className="validation">
                                {ERROR_MESSAGES}
                              </span>
                            ) : (
                              ""
                            )}
                          </div>
                        </div>
                        <div className="row fieldset ">
                          <div className="col-md-3 col-sm-12 text-start text-md-end">
                            <label class="fieldset-label required">
                              Role
                              <span style={{ color: "#ec4561" }}>*</span>
                            </label>
                          </div>
                          <div class="col-md-9 col-sm-12 ">
                            <input
                              maxLength={30}
                              type="text"
                              style={{ padding: "5px" }}
                              class="input-text"
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
                              <span className="validation">
                                {ERROR_MESSAGES}
                              </span>
                            ) : (
                              ""
                            )}
                          </div>
                          <div className="mb-2"></div>
                          <div className="col-md-3 col-sm-12 text-start text-md-end">
                            <label class="fieldset-label required">
                              Appointed On
                              <span style={{ color: "#ec4561" }}>*</span>
                            </label>
                          </div>
                          <div class="col-md-9 col-sm-12 ">
                            <DatePicker
                              minDate={minDate}
                              maxDate={maxDate}
                              style={{ width: "100%" }}
                              format="dd/MM/y"
                              dayPlaceholder="dd"
                              monthPlaceholder="mm"
                              yearPlaceholder="yyyy"
                              value={props.officersForm[index]?.appointedOn}
                              onChange={(e) =>
                                props.OnOfficerChange(index, "appointedOn", e)
                              }
                            />
                            {/* {props.InvalidAppointedOnDate &&
                                !isValidDate(
                                  props.officersForm[index]?.appointedOn
                                ) ? (
                                <span className="validation">Invalid Date</span>
                              ) : null} */}

                            {props.officerError &&
                            (props.officersForm[index]?.appointedOn === null ||
                              props.officersForm[index]?.appointedOn === "") ? (
                              <span className="validation">
                                {ERROR_MESSAGES}
                              </span>
                            ) : (
                              ""
                            )}
                          </div>
                        </div>
                        <div class="row fieldset">
                          <div class="col-md-3 col-sm-12 text-start text-md-end ">
                            <label class="fieldset-label required">Phone</label>
                          </div>
                          <div className="col-md-9 col-sm-12">
                            <div className="phone-input-div">
                              <Select
                                style={{ padding: "5px", width: "20%" }}
                                class="createCompanyInfo"
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
                                  style={{ width: "100%" }}
                                  className="input-text"
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
                              <span className="validation">
                                {" "}
                                Invalid phone number{" "}
                              </span>
                            ) : (
                              ""
                            )}
                          </div>
                          <div className="mb-2"></div>
                          <div class="col-md-3 col-sm-12 text-start text-md-end">
                            <label class="fieldset-label required">
                              Email
                              <span className="text-danger">*</span>
                            </label>
                          </div>
                          <div class="col-md-9 col-sm-12">
                            <input
                              className="input-text"
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
                                <span className="validation">
                                  {ERROR_MESSAGES}
                                </span>
                              ) : (
                                !isValidEmail(
                                  props.officersForm[index].emailID,
                                ) && (
                                  <span className="validation">
                                    Invalid email pattern
                                  </span>
                                )
                              ))}
                          </div>
                        </div>
                        <div class="row fieldset">
                          <div class="col-md-3 col-sm-12 text-start text-md-end">
                            <label class="fieldset-label required">
                              Correspondence Address
                              <span className="text-danger">*</span>
                            </label>
                          </div>
                          <div class="col-md-9 col-sm-12">
                            <input
                              className="input-text"
                              placeholder="Correspondence Address"
                              style={{ cursor: "pointer" }}
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
                              <span className="validation">
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
        </div>
      </div>
      <span
        style={{ display: "flex", justifyContent: "center" }}
        className="validation"
      >
        {props.errorMessage}
      </span>
      <div class="separator"></div>
      <div class="row fieldset modal-footer">
        <div class="col-lg-12 hstack gap-2 justify-content-end text-right mt-4">
          {props.businessTypeID === CLIENT_TYPES.Partnership && (
            <button
              className="btn btn-md btn-primary create-item-btn"
              onClick={() => {
                props.setOfficersError(false);
                props.addOfficer();
              }}
            >
              <i class="bi bi-plus-circle "></i>
              <span style={{ paddingLeft: "5px" }}>Add Partner</span>
            </button>
          )}
          {props.businessTypeID === CLIENT_TYPES.LLP && (
            <button
              className="btn btn-md btn-primary create-item-btn"
              onClick={props.addOfficer}
            >
              <i class="bi bi-plus-circle "></i>
              <span style={{ paddingLeft: "5px" }}>Add Officer</span>
            </button>
          )}
          {props.businessTypeID === CLIENT_TYPES.Company && (
            <button
              className="btn btn-md btn-primary create-item-btn"
              onClick={props.addOfficer}
            >
              <i class="bi bi-plus-circle "></i>
              <span style={{ paddingLeft: "5px" }}>Add Officer</span>
            </button>
          )}
          <button class="btn btn-md  btn-light" onClick={props.handleCancel}>
            <span>Cancel</span>
          </button>
          <button
            onClick={() => props.handleBackBtnChange(1)}
            style={{ paddingTop: "5px", marginRight: "4px" }}
            class="btn btn-md btn-primary create-item-btn"
          >
            <span>Back</span>
          </button>
          <button
            class="btn btn-md btn-primary create-item-btn"
            onClick={() => props.handleTabChange(3)}
          >
            <span> Next</span>
          </button>
        </div>
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
      <div className="create-practice-height scrollbar" id="style-1">
        <div className="tab-content">
          <div className="row">
            <div className="col-xl-12 col-lg-12">
              <div className="row fieldset">
                <div class="col-md-3 col-sm-12 text-start text-md-end">
                  <label class="fieldset-label  required">
                    Preferred Currency
                  </label>
                  <span class="text-danger">*</span>
                </div>
                <div className="col-md-9 col-sm-12">
                  <div className="input-group">
                    <Select
                      style={{ padding: "5px", width: "20%" }}
                      className="CurrencySelect"
                      options={props.currencyType}
                      value={currencyFilter}
                      onChange={(e) => {
                        props.setOtherInfo({
                          ...props.otherInfo,
                          preferredCurrency: e.value,
                        });
                      }}
                    />
                  </div>
                  {props.requireOtherErrorMessage &&
                  (props.otherInfo.preferredCurrency === "" ||
                    props.otherInfo.preferredCurrency === null) ? (
                    <span className="validation">{ERROR_MESSAGES}</span>
                  ) : (
                    ""
                  )}
                </div>
              </div>
              <div className="row fieldset mt-3">
                <div class="col-md-3 col-sm-12 text-start text-md-end">
                  <label class="fieldset-label required">
                    {taxName} Registered
                  </label>
                </div>
                <div className="col-md-9 col-sm-12">
                  <div className="input-group">
                    <Select
                      className="CurrencySelect"
                      options={Utils.VAT_Registered}
                      value={VATRegFilter}
                      onChange={(e) =>
                        props.setOtherInfo({
                          ...props.otherInfo,
                          VATReg: e.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>
              {props.otherInfo.VATReg === 0 && (
                <>
                  <div className="row fieldset mt-3">
                    <div class="col-md-3 col-sm-12 text-start text-md-end">
                      <label class="fieldset-label required">
                        {taxName} Number
                      </label>
                    </div>
                    <div className="col-md-9 col-sm-12">
                      <div className="input-group">
                        <input
                          type="text"
                          className="input-text"
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
                    </div>
                  </div>
                  <div className="row fieldset mt-3">
                    <div class="col-md-3 col-sm-12 text-start text-md-end">
                      <label class="fieldset-label required">
                        {taxName} Percentage
                      </label>
                    </div>
                    <div className="col-md-9 col-sm-12">
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
                        className="input-text"
                        type="text"
                        value={props.otherInfo.indirectTaxPercentage ?? 20.0}
                        onChange={handleChangeTaxPercentage}
                        max={100}
                      />
                    </div>
                    {props.requireOtherErrorMessage &&
                      props.otherInfo.indirectTaxPercentage > 100 && (
                        <label className="text-danger text-center mt-1">
                          Percentage cannot exceed 100
                        </label>
                      )}
                  </div>
                </>
              )}
              {/* <div className="row fieldset">
                <div class="col-md-3 col-sm-12 text-start text-md-end">
                  <label class="fieldset-label  required">
                    Preferred Currency
                  </label>
                  <span class="text-danger">*</span>
                </div>
                <div className="col-md-9 col-sm-12">
                  <div className="input-group">
                    <Select
                      style={{ padding: "5px", width: "20%" }}
                      className="CurrencySelect"
                      options={props.currencyType}
                      value={currencyFilter}
                      onChange={(e) => {
                        props.setOtherInfo({
                          ...props.otherInfo,
                          preferredCurrency: e.value,
                        });
                      }}
                    />
                  </div>
                  {props.requireOtherErrorMessage &&
                    (props.otherInfo.preferredCurrency === "" ||
                      props.otherInfo.preferredCurrency === null) ? (
                    <span className="validation">{ERROR_MESSAGES}</span>
                  ) : (
                    ""
                  )}
                </div>
              </div> */}
              <div className="row fieldset ">
                <div class="col-md-3 col-sm-12 text-start text-md-end">
                  <label class="fieldset-label required">Website</label>
                </div>
                <div className="col-md-9 col-sm-12">
                  <div className="input-group">
                    <input
                      maxLength={100}
                      type="text"
                      className="input-text"
                      placeholder="www.example.com"
                      value={props.otherInfo.website}
                      onChange={(e) =>
                        props.setOtherInfo({
                          ...props.otherInfo,
                          website: e.target.value.trim(),
                        })
                      }
                    />
                  </div>
                  {props.requireOtherErrorMessage &&
                    props.otherInfo.website !== null &&
                    props.otherInfo.website !== "" &&
                    props.otherInfo.website !== undefined &&
                    !isValidWebUrl(props.otherInfo.website) && (
                      <span className="validation"> Invalid Url </span>
                    )}
                </div>
              </div>
              <div className="row fieldset ">
                <div class="col-md-3 col-sm-12 text-start text-md-end">
                  <label class="fieldset-label required">Contact Email</label>
                  <span class="text-danger">*</span>
                </div>
                <div className="col-md-9 col-sm-12">
                  <div className="input-group">
                    <input
                      type="text"
                      className="input-text"
                      placeholder="Email"
                      maxLength={50}
                      value={props.otherInfo.contactEmail}
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
                  </div>
                  {props.requireOtherErrorMessage &&
                  (props.otherInfo.contactEmail === "" ||
                    props.otherInfo.contactEmail === null) ? (
                    <span className="validation">{ERROR_MESSAGES}</span>
                  ) : props.requireOtherErrorMessage &&
                    !isValidEmail(props.otherInfo.contactEmail) ? (
                    <span className="validation"> Invalid Email </span>
                  ) : (
                    ""
                  )}
                </div>
              </div>
              <div className="row fieldset ">
                <div class="col-md-3 col-sm-12 text-start text-md-end">
                  <label class="fieldset-label required">Contact Phone</label>
                  <span class="text-danger">*</span>
                </div>
                <div className="col-md-9 col-sm-12">
                  <div className="phone-input-div">
                    <Select
                      style={{ padding: "5px", width: "20%" }}
                      class="createCompanyInfo"
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
                        style={{ width: "100%" }}
                        className="input-text"
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
                    <span className="validation">{ERROR_MESSAGES}</span>
                  ) : props.requireOtherErrorMessage &&
                    !isValidPhoneNumber(props.otherInfo.contactPhone) ? (
                    <span className="validation"> Invalid phone number </span>
                  ) : (
                    ""
                  )}
                </div>
              </div>
              <div className="row fieldset ">
                <div class="col-md-3 col-sm-12 text-start text-md-end">
                  <label class="fieldset-label mb-3 required">Logo</label>
                </div>
                <div className="col-md-9 col-sm-12">
                  <div className="">
                    <div className="input-group">
                      <div className="col-lg-12 ">
                        {props.logo ? (
                          <div className="upload-image-preview-div">
                            <img
                              src={props.logo}
                              style={{
                                height: "200px",
                                width: "200px",
                                objectFit: "contain",
                              }}
                              className="upload-image-preview"
                              alt="Selected Signature"
                            />
                            <button
                              onClick={() => props.setLogo(null)}
                              style={{ float: "right", paddingTop: "5px" }}
                              className="btn btn-sm btn-danger  remove-item-btn d-flex gap-1"
                            >
                              Remove
                            </button>
                          </div>
                        ) : (
                          <>
                            <button
                              className="btn btn-md btn-primary create-item-btn"
                              data-bs-toggle="modal"
                              data-bs-target="#LogoUploadModal"
                              onClick={() => {
                                setType("Logo");
                              }}
                            >
                              <i class="bi bi-plus-circle margin-right"></i>
                              <span> Upload Logo</span>
                            </button>
                            <div className="text-muted helpMessage">
                              Supported file types are .jpg, .jpeg, .png up to a
                              file size of 2MB.
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="row fieldset ">
                <div class="col-md-3 col-sm-12 text-start text-md-end">
                  <label class="fieldset-label required">Brand Color</label>
                </div>
                <div className="col-md-9 col-sm-12">
                  <div className="input-group">
                    <input
                      type="color"
                      class="form-control height"
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
                  </div>
                  {/* {props.requireOtherErrorMessage &&
                                    (props.otherInfo.brandColor === "" ||
                                        props.otherInfo.brandColor === null) ? (
                                    <span className="validation">{ERROR_MESSAGES}</span>
                                ) : (
                                    ""
                                )} */}
                </div>
              </div>
              <div className="row fieldset ">
                <div class="col-md-3 col-sm-12 text-start text-md-end">
                  <label class="fieldset-label required">
                    Business Tagline
                  </label>
                  {/* <span class="text-danger">*</span> */}
                </div>
                <div className="col-md-9 col-sm-12">
                  <div className="input-group">
                    <input
                      maxLength={100}
                      type="text"
                      className="input-text"
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
                </div>
              </div>
              <div className="row fieldset">
                <div class="col-md-3 col-sm-12 text-start text-md-end">
                  <label class="form-label">
                    Affiliated Accounting Body Name
                  </label>
                </div>
                <div className="col-md-9 col-sm-12">
                  <div className="input-group">
                    <input
                      maxLength={50}
                      type="text"
                      className="input-text"
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
                </div>
              </div>
              <div className="row fieldset ">
                <div class="col-md-3 col-sm-12 text-start text-md-end">
                  <label class="form-label">
                    Website of Affiliated Accounting Body
                  </label>
                </div>
                <div className="col-md-9 col-sm-12">
                  <div className="input-group">
                    <input
                      maxLength={100}
                      type="text"
                      className="input-text"
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
            </div>
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
      </div>
      <span
        style={{ display: "flex", justifyContent: "center" }}
        className="validation"
      >
        {props.errorMessage}
      </span>
      <div class="separator"></div>
      <div class="row fieldset modal-footer">
        <div class="col-lg-12 hstack gap-2 justify-content-end text-right mt-4">
          <button class="btn btn-md  btn-light" onClick={props.handleCancel}>
            <span>Cancel</span>
          </button>
          <button
            onClick={() => props.handleBackBtnChange(2)}
            style={{ paddingTop: "5px", marginRight: "4px" }}
            class="btn btn-md btn-primary create-item-btn"
          >
            <span>Back</span>
          </button>
          <button
            class="btn btn-md btn-primary create-item-btn"
            onClick={() => props.handleTabChange(4)}
          >
            <span>Next</span>
            {/* <span> Create Practice</span> */}
          </button>
        </div>
      </div>
    </>
  );
};

const SubscriptionPlanView = (props) => {
  return (
    <>
      <div class="col-12">
        <div class="d-flex justify-content-sm-end add-new-btn">
          <label style={{ marginRight: "1rem" }}>Monthly</label>
          <FormControlLabel
            control={
              <Switch
                checked={props.isYearly}
                onChange={props.handleToggle}
                color="primary"
              />
            }
          />
          <label style={{ marginRight: "1rem" }}>Yearly</label>
        </div>
      </div>
      <div className="create-practice-height scrollbar" id="style-1">
        <div className="tab-content">
          <>
            <Row className="d-flex" style={{ background: "white" }}>
              {props.chooseApiData?.map((PurchasePlanList, index) => {
                return (
                  <>
                    <Col xl={6} md={6}>
                      <Card className="pricing-box d-flex shadow-lg p-3 mb-3 bg-white rounded">
                        <CardBody className="p-3">
                          <div className="media ">
                            <i className="ion ion-ios-airplane h2 align-self-center"></i>
                            <div className="media-body text-center ">
                              <div className="text-center login-logo">
                                <img
                                  width={130}
                                  height={25}
                                  src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAi4AAABkCAMAAACWyEvOAAADAFBMVEUBAQE3NDUNR103NDU3NDU3NDUAr+9MaXEAru43NDUAre02MzU2MzQ2MzQAr+83NDU3MzUqKCkAr+4Ar+8Ar+82NDQ3NDU3NDU3NDUAr+4wLi83NDUAre0Aruw3NDU3NDU3NDUAr+82MzQ3NDUAr+80MTIAr+83NDU3NDU3NDU3NDUAreoAru4Ar+81MjMAq+oAr+8Aru4BfqsAo94ArewAru4ArewAru4BrewAmdE1MjMAru43NDU3NDUAr+8Ar+8Aru4AqugBntgAksY3NDU3NDU3NDUAqOU2MzQ3NDU2MzQ3NDU3NDUAr+83NDU3NDUAru0Ar+8Ar+4Ar+8Ar+8Aru43NDU3NDUAq+kAr+8Aru4AqOQ3NDU3NDU3NDUAq+oAr+8Ar+8Aru0Aru4Ar+82MzQ3NDU3NDU2NDU3NDUApeAAru4Ar+8Ar+8Ar+8Ar+8Ar+83NDU3NDU3NDU3NDU3NDU3NDU3NDU1MjM3NDU3NDUAr+8Ar+8Ar+8Ar+8Ar+8ApuMAr+8Ar+8Ar+8Aru03NDU3NDU3NDU3NDU3NDU3NDU3NDUAru4Ar+8ArewAru4Ar+8AqeYAr+83NDU3NDU3NDU3NDUAr+8Ar+8Aru4Ar+4Ar+8Aru4Aru4Ar+83NDU3NDUArOsAre0Ar+8AqucAr+8AresAru43NDUAr+8ArewArOsAr+4Ar+83NDU3NDU3NDUArew3NDU3NDUArewBoNsAru43NDU2MzQAr+83NDX+/v6H2fclu/Exv/L6/f7T8fzb8/wStfACsO8ovPIGsfD9/v5BxPPt+f1/1/cMs/Ct5fkIsvAPtPAtvvJn0PXk9v1jzvV51fa66fqw5vodufHX8vxezfXA6/s5wfOX3/hr0fZFxfOO2/h81vfo+P3x+v3z+/3H7vshuvF11PYVtvD2/P7h9f2j4vlUyfSc4Pk1wPI9w/NPyPS96vrD7PtNx/TM7/tKx/ST3fhv0vaQ3PhZy/Te9fyr5PmF2fdbzPUYt/Gz5/qL2/en4/mE2PetDlqoAAAAuXRSTlMBcwLV8FPAAICIQStBPv6bLgOVpfsjgPbAjAb+RDn56fO9HKP1CvBIYZf9JmKJEyTaXAMMO2k0bykHDm1xj63ychoJBWntLBMZtxbgTJA40UrRefepduPcHepTEoOq2CDd60JNsSC9bSWTDl7KzO7XhHgyy1BFXXwRh6+YxYfmtxDitdNRNcW0wzueyFbgMWD4Ffma51VkoZNZfptHaOO6iyw9yRe6LmV1yDYqfJ7PoVgwWqY/CmyfJ7gQkTYAABd3SURBVHja7J19UFTXFcCXZTFDXYSdCCgkQNdsWNYJyZjGtAzEJALhq1BNA00CaMYibJza4Us+mraZThEBo3b4MNOmgaadjk0z6kRn6ttXBEVUiPgRJX5WjV/RxBqj0bZpknb33rfv3fvueY9F1zhveeev3ffu3vv2nd+ee+4557413HMLYtBFY3KPn8Rwd3ExLrh/8xuL7ntr1au6SnVcVOTPb7zz7Qc5Qqb8dO2Szb/RNavjIpdHVz/0CAfK1F/99m1duToukjzzwo9f4tRk3vTZun51XJB8d7o6K1gmPTZXV7GOy4In1nC+ycLHjbqSJzYuD9/LjUOeXz1LV/PExeXRd+Zw45NXvqPreaLict9Sbvxy7zO6piciLnN/xt2SvLlIV/XEw+VH87hblDU/13U90XBZuYa7dZn0lK7tCYXL/Knc7cjCmbq6Jw4uxtcVQRjslWS7ypL6D3frLtfFuyX/Gx0yzzNk+oTFZZZKsGUrL8nfVezL0ruVFQh1uSXsGx0yxDNk0ETFZdZa7vZx4ebM1nGZELioLqB9xoV76a86LhMAlyc5/+DC/eJFHZeAx+XXnL9w4ea9quMS4LgseN5/uHBP6LgENi5PL+T8iAv3+zutqYa0tLRKHZe7hcvrnF9xWbrqDmvK5FZUsI7LXcJl0VT/4sL9ca6OS8DiMus1zs+4cE/quAQsLg9xfsdl6VM6LgGKy8wH/I8Lt1bHJUBx8aUud9y4cKt0XAISl7en3BFcJum4BCQuPhX9jx8XbraOSwDismDOHcLldzouAYjLdGWFD57fPii8HP2MwuXsDkHODit+esrDOi4Bh8uLcLLo/L7/HDy1k+f7/nVo6PAe94GBwx8RuGyT4Nl/aOjSHrCP53RcAg6XFwA9bz/cz1Ny5poHiOt9EC5I3jsBVUrBI8bk19Q520Pt5hz2nDXCLTHwYRvxOsGtqKIIJJksLpaWzqikpOKNYSlq37zMnN7T7lyXGKG2Z9eSn6d4sQwuFdMKPFJHN8syd/W0J9XVtBgDAJdXGC3v+Xw3z8gHX7jPXPpQCRee/3QXy8tbwHiRDYUuQeI2dcrPzvAcj2Q+FO45PJl4TUicHJeKUHGEBKdZ4WvHdGU7vK0KKpMVWlVEkRdrHAOXLUWo5QwL2Sjsb3HeLoIrY7SOy/cYHR/t50E5Mup2ePcr4sLzFxk35ofMcCnSzcOaMvsbF5vTRJ3OLoO+tr2IapQRCikyZUM01Wp9mCoukR2oVStJi8XpIHvIrdI4LkvkKn5/J68gfZfcLu4pZVz4/VtlfT0iH82c4JKLM8WvuEyOZ0ZItci7S25mGuVGMIPmZTCtWm3KuFRgQzSDtEEp2bIOYhO1jcv3ZWuhQ7yK3OC43t3KuPCnD8t4kT1eqtjhYqUg2Y+4dCYAI2TLXJiIQqBRgl02ZjHQyLXeqoSLwKmT6qOV6cAUpmVcjG/SbssRXlUuDnC7TivjwvP7aFyWQApwtIWay7Ii0huFWSO3bFy4ZCa6xUNFbiKSWgKXNEEpyz0jVJU3CyMspoxChHfckmWTsyLzkoKFD3VRQzYIR6t7aq1ZVenNgqkpyoJxycTni6k+JuNx0io801JTKxp3uZZxmU2r99/8GPKxe7ZSw+XCNeUqTLugO/H3lVyMbUGbZTy4qC2ksTS2iCM4sau0iZyJsG2JLxcZCinA9oX0o7pwV93ixebU4a7aYiBcqjAtoQYWuW7RekaUet5XaBiXH1DaHeLHlMPc8BEVXPjdO8gOnyV/1AmsJ9GEPc4ef+ISt4w83IT1SBzDfssKclapT8JmQLIcTcgSOCpJs5SZKzMgEi7CKGkyL2mFp1Niri2jv6z2cKFcl0tj08Kf/oTbelIFF37bINnly9JQ6KcVV0uPX1+N1FLrP1wKm2QhG0RknEhCOrDYNRiC0NES8T2+LJlfaluOWrUwuOTj6a0cCiZGkQdSw8PDgzSMy19IN3ebD7jwZwa4XjVc+HMkLt8SR3oXvqPJ6Hc5zW+4ODKZ2Anyrxu8bztkM4og2OvxLo/y0Lt18kY5yL6sl+PSYgL8Fo9Ey3HRepiOrNH9n2zd/OnQid4dV2+ckeFwwNN2ZLsgo9eOyeI0F0aJPueLPvUK5LewV9CJbrXZX7iksiOkk+ZlGfJS2PCHsZBc17R53jSzXSWiMZpoXMzRSiN7DGqzJYBwITQ7SsdyL+71nrh8hY7vMoG9m/3y5TYbqKtCtzQTuATEUaufcAkGlGMrJbyXaeRoDLYJOcTFQj5pNel9IFzSQjAt0ByTRNk17ePyJ0Kz50iVn/onycPx0+S5mwwvI19RZmkYqJFKRUsW6BrQLzbYT7hshEZYh3xbPJ0g3VqBRjbk42BvpU7BEgqzVG4MgYsg5VDrGhz2ybMFCC73Ezonjcv+HTQPu8hQ73tANpFaU50EcGlTvKeGOOKnfJu4OMAsntXjvcRKi/lS8DIaJMOBFk8hUKMU5KZUsbikgX1WCzkGZ2qmMQBwWQTXP/UdleNwnDi7sxfg5Wsy20g8QJViIhK8CDQ/2P2Cy2KDstbQPBMFREcMhFeDg2gZBBMyKSE8LRKX2HdBUHOlLEN3UL3WcXlMUuwx9XI5MjlwFcBlgDBOO/8rHn7NOxK6ZfBF9LikBcRt4lJsUAYyTDQhIXD2GdkBVHGADBWcPY4i/KAQKrwP5r5zFpNNqvNiNI3Lc5K+ifD/h4MsDr0XqNAuKzfBVMBSH3AJ8h8uCk/+QjqrEZ1PuKghxeWdslDsvsOgjEsqhYsjKRZlg1rAepmaYBKYYLOWcZkPWoevIByI/MBH0PlhooMhtkJKBZdK/+FSrmJd8jyvnMq4JCPV03ZGAZdyEpe4GiHI15EDfyQzvJpIrUYFhHU5SxiHSxAOB4gGYKnlFcj8PEjhApvids+pOlVcNviIi1MFlyoxy2kHGzWhmDCyM8hawJ5GKDGbIVyiQ7wejatacQVkTS9e7EVmmXZxeVzU62XC9RiBaDg3Fi7XpfNXpCdJkfp1wQ+mLBWnCoELNuCR7SMuwfDXRA6nTTQOrWCjcrToldqDcwuOEpGuLgqrpOD0QIna8icrsRlhmJGsWVxWSktlYhUN0kCGVgagBsTiqV88+BNqRRGl6DNEpxCBrXzYPPgSdwFVYUYROPSyFnkZ4L0Il6aZJIUorcEQ6dF4rJXJSNsKXD6kD63ZhCHVIC6bIVy2jYnL4BizVT8bd0FB01KLkuuynCyJYXyLGJOvuPQoLr024J4KlZwXa7RUG54qzktgQmEaUO9iRdVRji71+11fJFowLeIyE8LlNGg8hsaajE4SaUgWlzKkjU7AuKBoaiXpSTL3HFfK+IJLfBYAQhyBCLJybcCtQJHcUjyb1JsULtZmIuP9VDVdPholNk/9hrcrO9EawMUo6vUTgoa9EA37xsLlEBT3/SVt6wttsO/oqCBzBfKCM2O3z7hAeQbkPpcKI2eiVmxMLdJB5qA3ocBaPZxOcOWAtboozOeKlmp+61PdYmWDBrHaTTGKu+lH+hRKELxygsBlFGrwARTmk/6EJAJrU744MjuoFQ1O7m0B4q2+1rukw6bJTsVgMuSLr3rkHSV4i3rLHHT5ize9FU1drGwnAGapULRvNmBpn6ToOmkCF+lPf/vBID4Hmp+TY5x/Xzy6UpaedSXR44dl0LfYUCSrxvSY+fjx4OIoh1Qstc1H74vo3HhMsyxPiOvHe+iVDq5U6LAq4CIUcleLv4gEukLPM/PmksU92sNFeq77wTFmo0EiDHcK+BOJL4nPXxaPEs+QSsaFlo2kibfjwqJO2cxBLXU3ereC+Fqr20pasFTkUjiIEjtcYF5IlvVF4lRgtk31YtNNsqS3HBdhm4g4H6KY4PocecapQbu4rAaTiJ8xe57Pf859TDS4ztBylYeivlMoK4Fvt8nuvYFmIaFCBtfyhd0kidjA1OetEDHwARdcetJhF7RsaVmPLY6dCeK4l0reHGJZJY6g5ZKKnYwri6O7kr1dLWZSz8ymV2E57bWgEQjVaO/VGBNRPiA6U7u4SCvpEVnBP51APHKECuvyX8if57GfOPm19Pxuel4QdjCaWqPS7ZUNBQIGJdTU0ygcjS8JLXZOEz7h8BGXLsESZbTXpXdVhpaCgfdk78ArioPs5VElwhgdEVSrWmEHY0I4dbGNNhVcDFviqcCtsPnE1B5VVxflFLLTSRqupnv6AXA24o9RoZUR90yzd4AkYucBipa9VCXeXqVnMISxWwxdsbJKkfpStk2jr0mAMCvw6QS592vJhnbHyb3f/A6gFTWRAE9gwGW7jjzakFEb24waxoV4dNQJqoLyIFHUsqsfua//oBocOy+5NXS1nRSk4zaDYU1Kl0w1gbWA0ZHF1xRjmKG+Uf7pUjYoZ0lltlOWsEv8sm55owx6AQ49sAMX0JkES2WTb7l0dedouVaXzEnTOxgvXBQq6o5+2YdLdIf76B3RN/B6evi4rLZbqtt89mUmPruM2njsaAfqIHMaYsk2bfm+Z6TD3ChspKyCIwpMFf6/vXOPbeuq4/jBEtaVFS5rciXmzZHmyaQTiRXbaZOaUjtpxAJSDYkfECdCdh4MlDR2JMpfSZw4zjaqxXkYibw7pc1DaZI/CnWmn4TWagO6rRui7VQJpI2JDZAYIAbTYH+AOOc+7PvyI22apq7PH0l8c++5x/d87u/3Pb/zeuTruZAiVD0lyerxz8tm56uu78I1p78t9EYclszd/+pTuQfVHWhcqkWRlSvyKYkfXX/76q/SMwAUs9aufHTrD+/JD95K57iqFhn87DM8MY+/cCLDq/bF7z3zTfb9f+JHP2Yh+cyjOIkr63n8+SXJNT8hp7Av9aGfvsjPlP7Cc1/J2En8/ZcEK/at589mfDxnXuQL+6UfnFD0R32O3FIxOvgEOfpoWi49+7Pn2OI88cJ3Tj3go+lwiqoPqFOmP7/1xtV8JiKJvFiV+i0fe7bk8JmSkq9lLddjTz799JN5D3CV83a25NSpkrNfzn7Wd0t+eOZwySPZb3LoGyWnchY2RzpEvku+E0gONi51otZy9nlpP4df/yk3LR+n82NsqJh2nQ42LtWiVXV/+1pWEj6UdBypp/+I+ifLinVfcLggr6hB/M+s5uPqK3AzBy1vi1eQOlKs+8LDRbIIwz/eywbD/wA+zUrLrVf2a9nuIi73CRfUJ1mZLgsvV98no6CyGKC/vJl5LaBiKhBcxqW9Q3/PKEu4SO+HmQTxa9KlozqKNV+QuNhbpP0/H/9GDYbbqejbG+9eUfVU70uzqSrWfEHigrpkW468evO2YlUXSZ/iW+/8W75K0HX5TNgLmmLNFyYuqFsxHuFv/xKZmNufKpZY/uWN3/0+Hf29/sEfFRsCLKrfqtVgaM2jRO3JPE7qMTQ3qRxurB0zNN276kxKy5Zstz9suDSo7Wj08rUbr7/z33c/ufYL9R0iXn352icfvH7zxrW/vpnvVtI1Q6zfi5lrcpUISnOXessJYFqQc7XpIJsc0INH7xUulPS7Wfba6x58XNAW7HEKqe02onOC3zgwYIyAs+3ucVmCsNsdk8UCk/2YRod+weiBlup7hQtcSn8qh4cQF3vfHuOi1oheT3jWWVuQXPfk2o2E4NLaYsZ/TWozOK+wvx2hkSBILNUwxI6womllCPyZ9t9yuRSHalvcsiPL2raMuAykP42q4aJlTduEtqtAcUENzj2lZVvlFp0Q2kx5DD905sSlkx2MR0Gl6hkBMJJfQ5LY8SxoUwp7zjKaYTNrrTKAOAfdsiNHoC4TLjSdQjTA0Cq4gJ41pnC0UHFB1r2kJaym/iwgUr8XIZjbGbU1ZMFlkxseoaMCov4vJp6PxlXBxTY+kj8ugzAvfPCB46HEJb8dGfNLJrVNXg1SlbENhvy0SyZc7KaY4tgQWNGd4aJMWXDpNVkEG+ZkFh9OXLDb36vUrJZ9P7RJawO3L+om2b+nKXb5XXv9gMOsQ5PrAi4UzojSwiylm6T4GShVVE9aNSjuUzGl0qxedzlcc+xQijEKtenHK6l4nGLz26S8M77pALWGdRJlYMux1u8t6ydKdnIbhqnJyxS/JZOOmkjjYpgRbr0OWzoeF6ve4eq16SgNuoztD0Wh+hkYpYh6se+UOsxj7Em9Po11drwgcBnZ2CNadlSzd9ASTVpD41c8yL3mx4AiajMItAeYIe1pARfyg82RsvLSuHYqvUVSrdKfwYbyW2ERbwIYrGENqAPA3SxsQ+tmIMHAuXliksrBTMoRdoKJgQqsq7RsJ2mriRVI6GQwXiPChddNCF2gAxwudiOAB2DVDBqihcmUmSi/fWmDBWhcAgcRUsbQKtC+gsAFtcf2hJYMNtzokX42yXBprwhh8zOCfaIEF94ZxRNJzmOWp9SGFzibn04aGFVEemKmelzb/YnVk+TqiqO2lDPygRabGF0QRLhAGVZdc57VlDNa4OxIb1qtEFwwTGxzrRnfkMXFNsjM21CjGzcYNDJn1BQMLeFyuGgHvrURKqwF4oywUtwLXmYzZO4FiQptBxkuC1xbSeNVxWUO+vHPNZH5qANHlJHpH9m8JpYJH1/HcwSX9bR2aXWG2YZTdVSEywX2UDfdLuAyTZMVajQRZ6sEl2au7VcG5zlcqsjlOB1X4jIEnB9yEfCM0IUKBhcUuOvwC7OlyRjdEt6rpna2WT0jxSXOW4YGjxouSYu/iasewZKEwo0GOjotuUeUkTfJ+hKV1SRt0kZyuSaNy7igpSgRLhQftJxISd0FIsl7+X+kcLFbOvCdR5gw4nDx0lxw2R6T42KLhtgCVDcTqW9kUAHhgmoG744Weilj1uVCZGPN4tAQY1MuwWUkVSMbarhgUdmP1qbSwZE1Mlt/CwYb0aw/kLYlck/IiFfJKwNRy2hemASlU+BST8rG41JpOo1OxiJNUlyQm+x2oCcmi8XF4hcigHJcROuih4l2KShcUM9dtacrFrNkHeObEytOqMeVQZrBFg6XCVxNjQlBiMRVcbH5K2zbotjeGNnMxO4AfU2iL91/6fGvSG/a4TzOpyUZLnXCbihjWXHBF10cF607wuOSZOJ2WzTSw+OyMZVyuTJckkxEKEFv4eGCH6PpjmkJZu1rrvUwy1wbesoz6TeRCP0Gt6j3DqkmLYnps05CFRdkhTLR4kLoEhBDVhOBOF0u7vu6kLIDbuizoW0IiENLIlzKge8KMGbHZYXWRkx2OS7YsowtwRbicRnid50MMArt0g0ih1l4uKDac3dIi2ske8ZtjLO/kasOIGYcm26GmIuGIKkmA9fRO+HPgEsS63Cx8YpUBNgqkWrrUohYWYHS6oVz+IRaJkZK1dBtXJHhYhulWfEyD9lxQbOyFhiHSyU93MeKdxaXQChOoOgZVEpdA20kbfDq4eGegsQFJV13AkukM2fG56PAGM3mVSwoWlhuOk3MwPEBpoOtJjPEl7oGEtGoOi64EiWTIsecntmj2zQwFkmLq94DTod+wQIwzEb2dminu4sysX2eElxIPMQ7NtkC4Ry4LENoWokLWRnHiwRcUFvCM99FhZx9ClywlfPXd+kTbCd8IeKC34iWXWvc0p58Iju+MOu0qBbeE1iD+NKyLq6aquJknEylNgMuA7IobvNpfLpxzCcLthxzRUh5uoU+8WbyXfq6FM4IN2wGEgAdPkMOXNrAhVRwMQAXA+KjuuWkkXC6k1LigubIEl3aTlSwuKCao1O7oqVvOc+MNcs63bIGrTn5sJemsjxtHOxHdNXYoquDd2xqUJ7XhO4YUh1NpzsvtjgXdROZ+uF1l5OoMcdwOAvdk9dXu6Sr1aBku8p/bOW65fyf/QOICwamviNvWEYXd519w66vmIFadD/SHLj394YPJC7YVi/584Kl+/x+PMQG+j7Ncos5p4u45Jd0wxU5WInpR/bnIXr5WPp+pyrx0LkiLjlS085M5jhM2Ny5X8+wx1F6f4zL0HBTEZddqZjLdcODcuUb1y60raFiKuKimhovWbcoihrS9+OfvsWVYq0eeFz+D5XCAUmfQUrGAAAAAElFTkSuQmCC"
                                  alt="login"
                                />
                              </div>

                              <h6 className="text-dark">
                                {PurchasePlanList?.packageName}
                              </h6>

                              {!props.isYearly ? (
                                <div>
                                  {(() => {
                                    const MonthlyPrice =
                                      Number(
                                        PurchasePlanList?.yearlyValuePlan,
                                      ) / 12;
                                    return props.formatValue(MonthlyPrice);
                                  })()}
                                  / Month
                                </div>
                              ) : (
                                <div>
                                  {props.formatValue(
                                    PurchasePlanList?.yearlyValuePlan,
                                  )}
                                  / Year
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="pricing-features mt-1 pt-2">
                            <div>
                              {PurchasePlanList?.apiIntegration == true ? (
                                <span
                                  style={{
                                    color: "green",
                                  }}
                                  className="fa fa-check"
                                ></span>
                              ) : (
                                <span
                                  style={{
                                    color: "red",
                                  }}
                                  className="fa fa-times"
                                ></span>
                              )}
                              <span
                                style={{
                                  marginLeft: "10px",
                                }}
                              >
                                {" "}
                                API Integration
                              </span>
                            </div>
                            <div>
                              {PurchasePlanList?.prepareQuote == true ? (
                                <span
                                  style={{
                                    color: "green",
                                  }}
                                  className="fa fa-check"
                                ></span>
                              ) : (
                                <span
                                  style={{
                                    color: "red",
                                  }}
                                  className="fa fa-times"
                                ></span>
                              )}
                              <span
                                style={{
                                  marginLeft: "10px",
                                }}
                              >
                                {" "}
                                Prepare {props.proposalName}
                              </span>
                            </div>
                            <div>
                              {PurchasePlanList?.prepareContract === true ? (
                                <span
                                  style={{
                                    color: "green",
                                  }}
                                  className="fa fa-check"
                                ></span>
                              ) : (
                                <span
                                  style={{
                                    color: "red",
                                  }}
                                  className="fa fa-times"
                                ></span>
                              )}
                              {"  "}
                              <span
                                style={{
                                  marginLeft: "10px",
                                }}
                              >
                                {" "}
                                Prepare {props.EngagementName}
                              </span>
                            </div>
                            <div>
                              {PurchasePlanList?.sendQuote === true ? (
                                <span
                                  style={{
                                    color: "green",
                                  }}
                                  className="fa fa-check"
                                ></span>
                              ) : (
                                <span
                                  style={{
                                    color: "red",
                                  }}
                                  className="fa fa-times"
                                ></span>
                              )}
                              <span
                                style={{
                                  marginLeft: "10px",
                                }}
                              >
                                {" "}
                                Send {props.proposalName}
                              </span>
                            </div>

                            <div className="d-flex align-items-start">
                              <div>
                                {PurchasePlanList?.eSignaturePerMonth > 0 ? (
                                  <span
                                    style={{
                                      color: "green",
                                    }}
                                    className="fa fa-check"
                                  ></span>
                                ) : (
                                  <span
                                    style={{
                                      color: "red",
                                    }}
                                    className="fa fa-times"
                                  ></span>
                                )}
                              </div>
                              <span
                                style={{
                                  marginLeft: "10px",
                                }}
                              >
                                Send And Digitally Sign The{" "}
                                {props.EngagementName}
                                {PurchasePlanList?.eSignaturePerMonth > 0 && (
                                  <>
                                    : {PurchasePlanList?.eSignaturePerMonth}
                                    /Month
                                  </>
                                )}
                              </span>
                            </div>
                            <div>
                              {PurchasePlanList?.isMailBox === true ||
                              PurchasePlanList?.isMailBox === null ? (
                                <span
                                  style={{
                                    color: "green",
                                  }}
                                  className="fa fa-check"
                                ></span>
                              ) : (
                                <span
                                  style={{
                                    color: "red",
                                  }}
                                  className="fa fa-times"
                                ></span>
                              )}
                              <span
                                style={{
                                  marginLeft: "10px",
                                }}
                              >
                                {" "}
                                Personalized Outgoing Mailbox
                              </span>
                            </div>
                            {PurchasePlanList && (
                              <div
                                className="d-flex flex-column"
                                style={{
                                  minHeight: PurchasePlanList.isFreePackage
                                    ? "110px"
                                    : "90px",
                                }}
                              >
                                {(props.isYearly &&
                                  PurchasePlanList.yearlyOffer?.length > 0) ||
                                (!props.isYearly &&
                                  PurchasePlanList.monthlyOffer?.length > 0) ? (
                                  <div className="w-100">
                                    <label></label>
                                    <Select
                                      placeholder="Select Offer"
                                      menuPosition="auto"
                                      className="phone-input-country-code selectDropDown Drop-down-width"
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
                                  </div>
                                ) : (
                                  <div className="flex-grow-1"></div>
                                )}
                              </div>
                            )}
                          </div>
                          {props.errorMessage && <p>{props.errorMessage}</p>}
                          <div className="d-flex justify-content-center">
                            {!PurchasePlanList.isFreePackage ? (
                              <button
                                onClick={() =>
                                  props.BuyPlanData(
                                    index,
                                    PurchasePlanList.subscriptionPackageKeyID,
                                  )
                                }
                                className="btn btn-success create-item-btn add-new "
                              >
                                <span> Purchase</span>
                              </button>
                            ) : (
                              <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</div>
                            )}
                          </div>
                        </CardBody>
                      </Card>
                    </Col>
                  </>
                );
              })}
            </Row>
          </>
          {/* end modal  */}
        </div>
      </div>
      <div class="separator"></div>
      <div class="row fieldset modal-footer">
        <div class="col-lg-12 hstack gap-2 justify-content-end text-right mt-3">
          <button
            class="btn btn-md btn-primary create-item-btn"
            onClick={() => props.handleSuccessPopupOk(4)}
          >
            <span>Continue With The Free Package</span>
            {/* <span> Create Practice</span> */}
          </button>
        </div>
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
    <div className="container-fluid">
      <div class="new-item-page-nav"></div>
      <div className="new-item-page-content">
        <div className="row form-row">
          <div className="col-lg-12">
            <h3 class="modal-title mb-3">
              <BackButtonSvg onClick={handleCancel} />
              Create New Practice
            </h3>
            <div
              className="steps"
              style={{ pointerEvents: "all", overflow: "auto" }}
            >
              <ul className="steps-list">
                <li>
                  <div
                    onClick={() =>
                      handleChangeTab(1, "Practice_BasicInformation_Tab")
                    }
                    id="Practice_BasicInformation_Tab"
                    className={`${
                      activeTab === CREATE_PRACTICE_DETAILS.BasicInformation
                        ? "step tab-field-center"
                        : isValidForm.BasicForm === true
                          ? "step tab-field-center"
                          : "step disabled cursor-not-allowed tab-field-center"
                    } w-90`}
                  >
                    <span class="stepCount">1</span>
                    <span class="stepTitle">Basic Information</span>

                    {requireErrorMessage && (
                      <span className="validation">
                        <InvalidFormIcon />
                      </span>
                    )}
                  </div>
                </li>
                <li>
                  <div
                    onClick={() =>
                      handleChangeTab(2, "Practice_OfficerDetails_Tab")
                    }
                    id="Practice_OfficerDetails_Tab"
                    class={`${
                      activeTab === CREATE_PRACTICE_DETAILS.OfficerDetails
                        ? "step tab-field-center"
                        : isValidForm.BasicForm === true
                          ? "step tab-field-center"
                          : "step disabled cursor-not-allowed tab-field-center"
                    } w-90`}
                  >
                    <span class="stepCount">2</span>
                    <span class="stepTitle">
                      {basicInfo.businessTypeID === null
                        ? "Sole Trader"
                        : [4, 5].includes(basicInfo.businessTypeID)
                          ? "Officer Details"
                          : basicInfo.businessTypeName}
                    </span>

                    {officerError && isValidForm.BasicForm === true && (
                      <span className="validation">
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
                    class={`${
                      activeTab === CREATE_PRACTICE_DETAILS.OtherInformation
                        ? "step tab-field-center"
                        : isValidForm.OfficerForm === true
                          ? "step tab-field-center"
                          : "step disabled cursor-not-allowed tab-field-center"
                    } w-90`}
                  >
                    <span class="stepCount">3</span>
                    <span class="stepTitle">Other Information</span>

                    {requireOtherErrorMessage && isValidForm.OfficerForm && (
                      <span className="validation">
                        <InvalidFormIcon />
                      </span>
                    )}
                  </div>
                </li>
                <li>
                  <div
                    class={`${
                      activeTab === CREATE_PRACTICE_DETAILS.ChoosePlan
                        ? "step tab-field-center"
                        : isValidForm.ChooseSubscriptionPlan === true
                          ? "step tab-field-center"
                          : "step disabled cursor-not-allowed tab-field-center"
                    } w-90`}
                  >
                    <span class="stepCount">4</span>
                    <span class="stepTitle">Choose Plan</span>
                  </div>
                </li>
              </ul>
            </div>
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
                formatValueWithoutCurrencySymbol={
                  formatValueWithoutCurrencySymbol
                }
              />
            )}

            {/* Write Component here */}
          </div>
        </div>
      </div>
      <ConfirmModel
        openErrorModal={openErrorModal}
        openSuccessModal={openSuccessModal}
        modelRequestData={modelRequestData}
        UpdatedStatus={handleConfirmButton}
        modelAction={modelAction}
      />
      <SuccessModal
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
