import React, { useContext, useEffect, useState } from "react";
import CommonButtonComponent from "../../components/CommonButtonComponent";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import Switch from "@mui/material/Switch";
import "../proposals/Proposals.css";
import { AuthContextProvider } from "../../AuthContext/AuthContext";
import { GetClientInformationModel } from "../../redux/Services/client/clientAPI";
import { CountryCode, CountryName } from "../../redux/Services/CountryApi";
import { CLIENT_TYPES } from "../../Middleware/enums";
import { GetIncorporatedInLookUpList } from "../../redux/Services/Master/IncorporatedInLookUpList";
import Footer from "../../components/Footer";
import Tooltip, { tooltipClasses } from "@mui/material/Tooltip";
import "./Prospects.css";
import "./ProspectViewDetails-redesign.css";
const ProspectViewDetails = () => {
  const [title, setTitle] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [IncorporatedValue, setIncorporateValue] = useState("");
  const [incorporatedInList, setIncorporatedInList] = useState([]);
  const { setTopbar, prospectName, setLoader, isMobile } =
    useContext(AuthContextProvider);
  const [basicInfo, setBasicInfo] = useState({
    clientKeyID: null,
    addressId: null,
    businessTypeID: null,
    originalBusinessTypeID: null,
    businessTypeName: "",
    tradingName: null,
    tradingAddress: null,
    VATReg: null,
    VATNumber: null,
    website: null,
    businessNatureNames: null,
    NatureOfBusiness: [],
  });
  const navigate = useNavigate();
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
    entityType: null,
  });
  const [officersForm, setOfficers] = useState([
    {
      officerID: null,
      firstName: null,
      lastName: null,
      countryCodeID: null,
      phoneCountryCodeID: null,
      phoneNo: null,
      emailID: null,
      addressID: null,
      isAuthorisedSignatory: null,
      officerRole: null,
      appointedOn: null,
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
  const [concatenatedResidentialAddress, setConcatenatedResidentialAddress] =
    useState([{ officersFullAddress: null }]);
  const [concatenatedTradingAddress, setConcatenatedTradingAddress] =
    useState("");

  const [concatenatedRegisterAddress, setConcatenatedRegisterAddress] =
    useState("");
  const location = useLocation();
  const [saveLocationState, setSaveLocationState] = useState(location.state);
  // initial UseEffect
  useEffect(() => {
    setTopbar("block");
  }, []);

  useEffect(() => {
    if (
      saveLocationState?.Action !== undefined &&
      saveLocationState?.Action !== null
    ) {
      GetClientInformationModelData(saveLocationState.clientKeyID);
    }
  }, [saveLocationState]);

  const GetClientInformationModelData = async (id) => {
    if (!id) {
      return;
    }
    setLoader(true);
    try {
      const data = await GetClientInformationModel(id);
      if (data?.data?.statusCode === 200) {
        setLoader(false);
        if (data?.data?.responseData?.data) {
          let CountryList;
          const countryCodeData = await CountryCode();
          if (countryCodeData?.data?.statusCode === 200) {
            if (countryCodeData?.data?.responseData?.data) {
              CountryList = countryCodeData?.data?.responseData?.data;
              CountryList = CountryList.map((countryCode) => ({
                value: countryCode.countryCodeId,
                label: countryCode.countryCode,
              }));
            }
          }
          const IncIn = await GetIncorporatedInLookUpList();
          let incorporateInListData = IncIn?.data?.responseData?.data;
          // incorporateInListData = incorporateInListData.map((incIn) => ({
          //   value: incIn.incInID,
          //   label: incIn.incInName,
          // }));
          // setIncorporatedInList(incorporateInListData);

          const ModelData = data?.data?.responseData?.data;
          const AddressObj = {
            addressId: ModelData.tradingAddress.addressId,
            premises: ModelData.tradingAddress.premises,
            addressLine1: ModelData.tradingAddress.addressLine1,
            addressLine2: ModelData.tradingAddress.addressLine2,
            locality: ModelData.tradingAddress.locality,
            region: ModelData.tradingAddress.region,
            countryId: ModelData.tradingAddress.countryId,
            postcode: ModelData.tradingAddress.postcode,
          };

          setBasicInfo({
            ...basicInfo,
            clientKeyID: ModelData.clientKeyID,
            originalBusinessTypeID: ModelData.originalBusinessTypeID,
            businessTypeID: ModelData.businessTypeID,
            businessTypeName: ModelData.businessTypeName,
            tradingName: ModelData.tradingBusinessName,
            tradingAddress: AddressObj,
            VATReg: ModelData.isVatRegistered,
            VATNumber: ModelData.vatNumber,
            website: ModelData.websiteName,
            NatureOfBusiness: ModelData.NatureOfBusiness,
            businessNatureNames: ModelData.businessNatureNames,
          });

          let officerArray = [];
          ModelData.officersList.forEach((item) => {
            const PhoneSelectedValue = CountryList.find(
              (countryCode) => item.countryCodeID == countryCode.value,
            );
            let officerObj = {
              officerID: item.officerID,
              firstName: item.firstName,
              lastName: item.lastName,
              countryCodeID: item.countryCodeID,
              phoneCountryCodeID: PhoneSelectedValue,
              phoneNo: item.phoneNo,
              emailID: item.emailID,
              addressID: item.addressID,
              isAuthorisedSignatory: item.isAuthorisedSignatory,
              officerRole: item.officerRole,
              appointedOn: item.appointedOn,
              moduleName: item.moduleName,
              moduleID: item.moduleID,
              officersAddress: {
                addressId: item.officersAddress.addressId,
                premises: item.officersAddress.premises,
                addressLine1: item.officersAddress.addressLine1,
                addressLine2: item.officersAddress.addressLine2,
                locality: item.officersAddress.locality,
                region: item.officersAddress.region,
                countryId: item.officersAddress.countryID,
                postcode: item.officersAddress.postcode,
                countryName: item.officersAddress.countryName,
              },
            };
            officerArray.push(officerObj);
          });

          setOfficers(officerArray);
          let companyObj = {
            companyID: ModelData.companyDetails.companyID,
            companyName: ModelData.companyDetails.companyName,
            companyType: ModelData.companyDetails.companyType,
            companyNumber: ModelData.companyDetails.companyNumber,
            companyStatus: ModelData.companyDetails.companyStatus,
            addressID: ModelData.companyDetails.addressID,
            incorporationDate: ModelData.companyDetails.incorporationDate,
            incInID: ModelData.companyDetails.incInID,
            moduleName: ModelData.companyDetails.moduleName,
            moduleID: ModelData.companyDetails.moduleID,
            companyAddress: {
              addressId: ModelData.companyDetails.companyAddress?.addressId,
              premises: ModelData.companyDetails.companyAddress?.premises,
              addressLine1:
                ModelData.companyDetails.companyAddress?.addressLine1,
              addressLine2:
                ModelData.companyDetails.companyAddress?.addressLine2,
              locality: ModelData.companyDetails.companyAddress?.locality,
              region: ModelData.companyDetails.companyAddress?.region,
              countryId: ModelData.companyDetails.companyAddress?.countryId,
              postcode: ModelData.companyDetails.companyAddress?.postcode,
            },
          };

          setCompanyForm(companyObj);
          const fullAddress = concatenateFullAddress(
            ModelData.companyDetails?.companyAddress,
          );
          setConcatenatedRegisterAddress(fullAddress);

          let CorrespondenceOrResidentialAddress = [];
          ModelData.officersList.forEach((officer, index) => {
            const address = officer.officersAddress;
            if (address) {
              let fullAddressConcatenation = concatenateFullAddress(address);
              let CorrespondenceOrResidentialAddressObj = {
                officersFullAddress: fullAddressConcatenation,
              };
              CorrespondenceOrResidentialAddress.push(
                CorrespondenceOrResidentialAddressObj,
              );
            } else {
              CorrespondenceOrResidentialAddress.push({
                officersFullAddress: null,
              });
            }
          });
          setConcatenatedResidentialAddress(CorrespondenceOrResidentialAddress);

          if (ModelData.tradingAddress) {
            //const addPart = (part) => (part ? `${part}, ` : "");
            const fullAddress = concatenateFullAddress(
              ModelData.tradingAddress,
            );
            //`${addPart(ModelData.tradingAddress?.premises)}${addPart(ModelData.tradingAddress?.addressLine1)}${addPart(ModelData.tradingAddress?.addressLine2)}${addPart(ModelData.tradingAddress?.locality)}${addPart(ModelData.tradingAddress?.region)}${addPart(ModelData.tradingAddress?.country)}${ModelData.tradingAddress?.postcode || ""}`;
            setConcatenatedTradingAddress(fullAddress);
          }
          const IncorporateValue = incorporateInListData.filter(
            (item) => ModelData.companyDetails.incInID == item.incInID,
          );

          setIncorporateValue(IncorporateValue[0].incInName);
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

  const concatenateFullAddress = (address) => {
    const addPart = (part) => (part ? `${part}, ` : "");
    let concatenatedAddress = `${addPart(address?.addressLine1)}${addPart(
      address?.addressLine2,
    )}${addPart(address?.locality)}${addPart(address?.region)}${addPart(
      address?.country,
    )}${addPart(address?.countryName)}${address?.postcode || ""}`;

    // Remove trailing comma, if present
    if (concatenatedAddress.endsWith(", ")) {
      concatenatedAddress = concatenatedAddress.slice(0, -2);
    }
    return concatenatedAddress;
  };

  return (
    <div className="container view-prospect-redesign">
      <div className="page-content page-background prospect-bg">
        <div className="view-prospect-page-header">
          <div className="view-prospect-page-heading">
            <Tooltip title="Back">
              <button
                type="button"
                className="view-prospect-back-btn"
                onClick={() => navigate("/prospects")}
              >
                <i className="ri-arrow-left-line"></i>
              </button>
            </Tooltip>

            <div className="view-prospect-page-title">
              <h1>{prospectName} Details</h1>
              <p>
                Review prospect information, trading details, company
                information and associated people.
              </p>
            </div>
          </div>

          <div className="view-prospect-summary-card">
            <span>{prospectName?.toUpperCase()} TYPE</span>
            <strong>{basicInfo.businessTypeName || "-"}</strong>
          </div>
        </div>

        <div className="container-fluid view-prospect-content">
          <div className="row">
            <div className="col-lg-12">
              <div className="card view-prospect-main-card">
                <div className="card-body">
                  <div
                    id="customerList"
                    className="view-prospect-customer-list"
                  >
                    <div className="search-box ms-2 width-searchbox prospect-form view-prospect-tabs-shell">
                      <div className="table-card mb-3 Height_View_scroll view-prospect-tab-card">
                        <ul className="nav nav-tabs mb-3">
                          <li className="nav-item">
                            <a
                              className="nav-link tab_nav active"
                              data-bs-toggle="tab"
                              href="#base-justified-home"
                              role="tab"
                              aria-selected="false"
                            >
                              <span className="view-prospect-tab-icon">
                                <i className="ri-file-info-line"></i>
                              </span>
                              <span>{prospectName} Details</span>
                            </a>
                          </li>

                          {basicInfo.originalBusinessTypeID ===
                          CLIENT_TYPES.Individual ? null : (
                            <li className="nav-item">
                              {basicInfo.originalBusinessTypeID ===
                              CLIENT_TYPES.Partnership ? (
                                <a
                                  className="nav-link tab_nav"
                                  data-bs-toggle="tab"
                                  href="#product"
                                  role="tab"
                                  aria-selected="false"
                                >
                                  <span className="view-prospect-tab-icon">
                                    <i className="ri-team-line"></i>
                                  </span>
                                  <span>Partner Details</span>
                                </a>
                              ) : null}

                              {basicInfo.originalBusinessTypeID ===
                              CLIENT_TYPES.Sole_Trader ? (
                                <a
                                  className="nav-link tab_nav"
                                  data-bs-toggle="tab"
                                  href="#product"
                                  role="tab"
                                  aria-selected="false"
                                >
                                  <span className="view-prospect-tab-icon">
                                    <i className="ri-user-3-line"></i>
                                  </span>
                                  <span>Sole Trader Details</span>
                                </a>
                              ) : null}

                              {basicInfo.originalBusinessTypeID ===
                                CLIENT_TYPES.LLP ||
                              basicInfo.originalBusinessTypeID ===
                                CLIENT_TYPES.Company ? (
                                <a
                                  className="nav-link tab_nav"
                                  data-bs-toggle="tab"
                                  href="#product"
                                  role="tab"
                                  aria-selected="false"
                                >
                                  <span className="view-prospect-tab-icon">
                                    <i className="ri-user-star-line"></i>
                                  </span>
                                  <span>Officer Details</span>
                                </a>
                              ) : null}
                            </li>
                          )}
                        </ul>

                        <div className="tab-content text-muted">
                          <div
                            className="tab-pane active"
                            id="base-justified-home"
                            role="tabpanel"
                          >
                            <div className="view-prospect-info-grid">
                              <section className="view-prospect-info-card">
                                <div className="view-prospect-info-card-head">
                                  <span className="view-prospect-info-icon">
                                    <i className="ri-information-line"></i>
                                  </span>
                                  <div>
                                    <h3>Basic Information</h3>
                                    <p>
                                      Core prospect and registration details.
                                    </p>
                                  </div>
                                </div>

                                <div className="view-prospect-info-card-body view-prospect-field-grid">
                                  <div className="view-prospect-field">
                                    <span>{prospectName} Type</span>
                                    <strong>
                                      {basicInfo.businessTypeName || "-"}
                                    </strong>
                                  </div>

                                  {basicInfo.originalBusinessTypeID ===
                                    CLIENT_TYPES.Individual ||
                                  basicInfo.originalBusinessTypeID ===
                                    CLIENT_TYPES.Sole_Trader ||
                                  basicInfo.originalBusinessTypeID ===
                                    CLIENT_TYPES.Partnership ? null : (
                                    <>
                                      <div className="view-prospect-field">
                                        <span>VAT Registered</span>
                                        <strong>
                                          {basicInfo.VATReg === 0 ? "Yes" : ""}
                                          {basicInfo.VATReg === 1 ? "No" : ""}
                                        </strong>
                                      </div>
                                      {basicInfo.VATNumber !== null && (
                                        <div className="view-prospect-field">
                                          <span>VAT Number</span>
                                          <strong>{basicInfo.VATNumber}</strong>
                                        </div>
                                      )}
                                      <div className="view-prospect-field">
                                        <span>Website</span>
                                        <strong>
                                          {basicInfo.website || "-"}
                                        </strong>
                                      </div>
                                    </>
                                  )}

                                  {(basicInfo.originalBusinessTypeID ===
                                    CLIENT_TYPES.Sole_Trader ||
                                    basicInfo.originalBusinessTypeID ===
                                      CLIENT_TYPES.Partnership) && (
                                    <>
                                      <div className="view-prospect-field">
                                        <span>VAT Registered</span>
                                        <strong>
                                          {basicInfo.VATReg === 0
                                            ? "Yes"
                                            : "No"}
                                        </strong>
                                      </div>
                                      {basicInfo.VATNumber !== null && (
                                        <div className="view-prospect-field">
                                          <span>VAT Number</span>
                                          <strong>{basicInfo.VATNumber}</strong>
                                        </div>
                                      )}
                                      <div className="view-prospect-field">
                                        <span>Website</span>
                                        <strong>
                                          {basicInfo.website || "-"}
                                        </strong>
                                      </div>
                                    </>
                                  )}

                                  {basicInfo.originalBusinessTypeID ===
                                    CLIENT_TYPES.Individual && (
                                    <>
                                      <div className="view-prospect-field">
                                        <span>First Name</span>
                                        <strong>
                                          {officersForm[0]?.firstName || "-"}
                                        </strong>
                                      </div>
                                      <div className="view-prospect-field">
                                        <span>Last Name</span>
                                        <strong>
                                          {officersForm[0]?.lastName || "-"}
                                        </strong>
                                      </div>
                                      <div className="view-prospect-field">
                                        <span>Phone</span>
                                        <strong>
                                          {officersForm[0]?.phoneNo || "-"}
                                        </strong>
                                      </div>
                                      <div className="view-prospect-field">
                                        <span>{prospectName} Email</span>
                                        <strong>
                                          {officersForm[0]?.emailID || "-"}
                                        </strong>
                                      </div>
                                      <div className="view-prospect-field">
                                        <span>Website</span>
                                        <strong>
                                          {basicInfo.website || "-"}
                                        </strong>
                                      </div>
                                      <div className="view-prospect-field view-prospect-field-wide">
                                        <span>Residential Address</span>
                                        <strong>
                                          {concatenatedResidentialAddress[0]
                                            ?.officersFullAddress || "-"}
                                        </strong>
                                      </div>
                                    </>
                                  )}
                                </div>
                              </section>

                              {basicInfo.originalBusinessTypeID !==
                                CLIENT_TYPES.Individual && (
                                <section className="view-prospect-info-card">
                                  <div className="view-prospect-info-card-head">
                                    <span className="view-prospect-info-icon">
                                      <i className="ri-store-2-line"></i>
                                    </span>
                                    <div>
                                      <h3>Trading Details</h3>
                                      <p>
                                        Trading identity, address and business
                                        activity.
                                      </p>
                                    </div>
                                  </div>
                                  <div className="view-prospect-info-card-body view-prospect-field-grid">
                                    <div className="view-prospect-field">
                                      <span>Trading Name</span>
                                      <strong>
                                        {basicInfo.tradingName || "-"}
                                      </strong>
                                    </div>
                                    <div className="view-prospect-field">
                                      <span>Nature Of Business</span>
                                      <strong>
                                        {basicInfo.businessNatureNames || "-"}
                                      </strong>
                                    </div>
                                    <div className="view-prospect-field view-prospect-field-wide">
                                      <span>Trading Address</span>
                                      <strong>
                                        {concatenatedTradingAddress || "-"}
                                      </strong>
                                    </div>
                                  </div>
                                </section>
                              )}

                              {basicInfo.originalBusinessTypeID !==
                                CLIENT_TYPES.Individual &&
                                basicInfo.originalBusinessTypeID !==
                                  CLIENT_TYPES.Sole_Trader &&
                                basicInfo.originalBusinessTypeID !==
                                  CLIENT_TYPES.Partnership && (
                                  <section className="view-prospect-info-card view-prospect-company-card">
                                    <div className="view-prospect-info-card-head">
                                      <span className="view-prospect-info-icon">
                                        <i className="ri-building-4-line"></i>
                                      </span>
                                      <div>
                                        <h3>Company Details</h3>
                                        <p>
                                          Registered company and incorporation
                                          information.
                                        </p>
                                      </div>
                                    </div>
                                    <div className="view-prospect-info-card-body view-prospect-field-grid">
                                      <div className="view-prospect-field">
                                        <span>Company Name</span>
                                        <strong>
                                          {companyForm.companyName || "-"}
                                        </strong>
                                      </div>
                                      <div className="view-prospect-field">
                                        <span>Entity Type</span>
                                        <strong>
                                          {companyForm.companyType || "-"}
                                        </strong>
                                      </div>
                                      <div className="view-prospect-field">
                                        <span>Company Number</span>
                                        <strong>
                                          {companyForm.companyNumber || "-"}
                                        </strong>
                                      </div>
                                      <div className="view-prospect-field">
                                        <span>Company Incorporated In</span>
                                        <strong>
                                          {IncorporatedValue || "-"}
                                        </strong>
                                      </div>
                                      <div className="view-prospect-field">
                                        <span>Company Incorporation Date</span>
                                        <strong>
                                          {companyForm.incorporationDate || "-"}
                                        </strong>
                                      </div>
                                      <div className="view-prospect-field view-prospect-field-wide">
                                        <span>
                                          Company Registered Office Address
                                        </span>
                                        <strong>
                                          {concatenatedRegisterAddress || "-"}
                                        </strong>
                                      </div>
                                    </div>
                                  </section>
                                )}
                            </div>
                          </div>

                          <div
                            className="tab-pane"
                            id="product"
                            role="tabpanel"
                          >
                            <div className="view-prospect-people-wrap">
                              <div className="view-prospect-section-intro">
                                <div>
                                  <h3>
                                    {basicInfo.originalBusinessTypeID ===
                                    CLIENT_TYPES.Partnership
                                      ? "Partner Details"
                                      : basicInfo.originalBusinessTypeID ===
                                          CLIENT_TYPES.Sole_Trader
                                        ? "Sole Trader Details"
                                        : "Officer Details"}
                                  </h3>
                                  <p>
                                    Review contact, role, authorisation and
                                    address information.
                                  </p>
                                </div>
                                <span className="view-prospect-count-pill">
                                  {officersForm.length}{" "}
                                  {officersForm.length === 1
                                    ? "Person"
                                    : "People"}
                                </span>
                              </div>

                              <div className="view-prospect-people-grid">
                                {officersForm.map((prospect, index) => (
                                  <section
                                    className="view-prospect-person-card"
                                    key={index}
                                  >
                                    <div className="view-prospect-person-head">
                                      <div className="view-prospect-person-identity">
                                        <span className="view-prospect-person-avatar">
                                          {officersForm[
                                            index
                                          ].firstName?.charAt(0)}
                                          {officersForm[index].lastName?.charAt(
                                            0,
                                          )}
                                        </span>
                                        <div className="view-prospect-person-title">
                                          <small>
                                            {basicInfo.originalBusinessTypeID ===
                                            CLIENT_TYPES.Partnership
                                              ? `Partner ${index + 1}`
                                              : basicInfo.originalBusinessTypeID ===
                                                  CLIENT_TYPES.Sole_Trader
                                                ? "Sole Trader"
                                                : `Officer ${index + 1}`}
                                          </small>
                                          <strong>
                                            {officersForm[index].firstName}{" "}
                                            {officersForm[index].lastName}
                                          </strong>
                                        </div>
                                      </div>

                                      {(basicInfo.originalBusinessTypeID ===
                                        CLIENT_TYPES.LLP ||
                                        basicInfo.originalBusinessTypeID ===
                                          CLIENT_TYPES.Company ||
                                        basicInfo.originalBusinessTypeID ===
                                          CLIENT_TYPES.Partnership) && (
                                        <div className="view-prospect-authorised-wrap">
                                          <span
                                            className={`view-prospect-authorised-pill ${
                                              officersForm[index]
                                                ?.isAuthorisedSignatory
                                                ? "is-authorised"
                                                : "is-not-authorised"
                                            }`}
                                          >
                                            {officersForm[index]
                                              ?.isAuthorisedSignatory
                                              ? "Authorised"
                                              : "Not Authorised"}
                                          </span>
                                          <Switch
                                            checked={
                                              officersForm[index]
                                                ?.isAuthorisedSignatory
                                            }
                                            disabled
                                            color="primary"
                                          />
                                        </div>
                                      )}
                                    </div>

                                    <div className="view-prospect-person-body">
                                      <div className="view-prospect-person-field">
                                        <span className="view-prospect-person-field-icon">
                                          <i className="ri-user-line"></i>
                                        </span>
                                        <div>
                                          <small>First Name</small>
                                          <strong>
                                            {officersForm[index].firstName ||
                                              "-"}
                                          </strong>
                                        </div>
                                      </div>
                                      <div className="view-prospect-person-field">
                                        <span className="view-prospect-person-field-icon">
                                          <i className="ri-user-line"></i>
                                        </span>
                                        <div>
                                          <small>Last Name</small>
                                          <strong>
                                            {officersForm[index].lastName ||
                                              "-"}
                                          </strong>
                                        </div>
                                      </div>
                                      <div className="view-prospect-person-field">
                                        <span className="view-prospect-person-field-icon">
                                          <i className="ri-phone-line"></i>
                                        </span>
                                        <div>
                                          <small>Phone</small>
                                          <strong>
                                            {officersForm[index].phoneNo || "-"}
                                          </strong>
                                        </div>
                                      </div>
                                      <div className="view-prospect-person-field">
                                        <span className="view-prospect-person-field-icon">
                                          <i className="ri-mail-line"></i>
                                        </span>
                                        <div>
                                          <small>Email</small>
                                          <strong>
                                            {officersForm[index].emailID || "-"}
                                          </strong>
                                        </div>
                                      </div>

                                      {basicInfo.originalBusinessTypeID ===
                                        CLIENT_TYPES.Sole_Trader ||
                                      basicInfo.originalBusinessTypeID ===
                                        CLIENT_TYPES.Partnership ? null : (
                                        <>
                                          <div className="view-prospect-person-field">
                                            <span className="view-prospect-person-field-icon">
                                              <i className="ri-shield-user-line"></i>
                                            </span>
                                            <div>
                                              <small>Role</small>
                                              <strong>
                                                {officersForm[index]
                                                  .officerRole || "-"}
                                              </strong>
                                            </div>
                                          </div>
                                          <div className="view-prospect-person-field">
                                            <span className="view-prospect-person-field-icon">
                                              <i className="ri-calendar-line"></i>
                                            </span>
                                            <div>
                                              <small>Appointed On</small>
                                              <strong>
                                                {officersForm[index]
                                                  .appointedOn || "-"}
                                              </strong>
                                            </div>
                                          </div>
                                        </>
                                      )}

                                      <div className="view-prospect-person-field view-prospect-person-field-wide">
                                        <span className="view-prospect-person-field-icon">
                                          <i className="ri-map-pin-line"></i>
                                        </span>
                                        <div>
                                          <small>
                                            {basicInfo.originalBusinessTypeID ===
                                              CLIENT_TYPES.Company ||
                                            basicInfo.originalBusinessTypeID ===
                                              CLIENT_TYPES.LLP
                                              ? "Correspondence Address"
                                              : "Residential Address"}
                                          </small>
                                          <strong>
                                            {concatenatedResidentialAddress[
                                              index
                                            ]?.officersFullAddress || "-"}
                                          </strong>
                                        </div>
                                      </div>
                                    </div>
                                  </section>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="view-prospect-footer-wrap">
          <Footer />
        </div>
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

export default ProspectViewDetails;
