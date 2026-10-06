/* global $ */
import React, { useContext, useEffect, useRef, useState } from "react";
import { AuthContextProvider } from "../../../AuthContext/AuthContext";
import "../../configure/packages/Package.css";
import "./Update-practice-details.css";
import "./Update-practice-details-ui.css";
import { GetBusinessTypeLookupList } from "../../../redux/Services/Master/BusinessTypeLookupListApi";
import { ERROR_MESSAGES } from "../../../components/GlobalMessage";
import Upload_image_modal from "../../../components/UpdateImageModel/Upload_image_modal";
import AddressModal from "../../../components/AddressModal/AddressModal";
import Utils from "../../../Middleware/Utils";
import Select from "react-select";
import CancelIcon from "@mui/icons-material/Cancel";
import { styled } from "@mui/material/styles";
import {
  Building2,
  PenLine,
  Layers,
  User,
  Users,
  Briefcase,
  Plus,
  Trash2,
  Info,
  Save,
} from "lucide-react";
import {
  GetCompanyDetails,
  GetCompanyList,
  GetCompanyOfficers,
} from "../../../redux/Services/Master/companyDetailsAPI";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Tooltip, { tooltipClasses } from "@mui/material/Tooltip";
import { useDispatch, useSelector } from "react-redux";
import { CountryCode, CountryName } from "../../../redux/Services/CountryApi";
import {
  templateForCompanyList,
  templateForIndividualList,
  templateForLlpList,
  templateForPartnershipList,
  templateForSoleTraderList,
} from "../../../redux/Services/Config/TemplateApi";
import DatePicker from "react-date-picker";
import "react-date-picker/dist/DatePicker.css";
import "react-calendar/dist/Calendar.css";
import { CLIENT_TYPES } from "../../../Middleware/enums";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { GetCurrencyTypeList } from "../../../redux/Services/Master/CurrencyTypeLookUpList";
import Button from "@mui/material/Button";
import {
  AddUpdateLogo,
  AddUpdateOrganisation,
  AddUpdateSignature,
  GetOrganisationInformationModel,
  DeleteSignature,
  DeleteLogo,
  GetEnableEL,
} from "../../../redux/Services/Setting/Organisation";
import SuccessModal from "../../../components/SuccessModal";
import { GetIncorporatedInLookUpList } from "../../../redux/Services/Master/IncorporatedInLookUpList";
import { GetProfessionTypeLookupList } from "../../../redux/Services/Master/ProfessionTypeApi";
import Upload_Logo_Modal from "../../../components/UpdateImageModel/Upload_logo_modal";
import Footer from "../../../components/Footer";
import ConfirmModel from "../../../components/ConfirmationBox";
import Android12Switch from "../../../components/AndroidSwitch";
import { updateState } from "../../../redux/Persist";
import InstructionModal from "../Email_config/InstructionModel";
import BinarySelect from "../../../components/BinarySelect";

const Update_Practice_Details = () => {
  // A] Declare State
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const companyDebounceRef = useRef(null);
  const {
    setLoader,
    setTopbar,
    prospectName,
    proposalName,
    scrollUpDownByElementID,
    EngagementName,
  } = useContext(AuthContextProvider);
  const [fullAddress, setFullAddress] = useState("");
  const [addressPopUpTitle, setAddressPopUpTitle] = useState(null);
  const common = useSelector((state) => state.Storage);
  const [openAddressPopUp, setOpenAddressPopUp] = useState(false);
  const [requireErrorMessage, setRequireErrorMessage] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [incorporatedInList, setIncorporatedInList] = useState([]);
  const [countryLookupList, setCountryLookupList] = useState([]);
  const [countryCodes, setcountryCodes] = useState([]);
  const [currencyType, setCurrencyType] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [dismissModal, setDismissModal] = useState(null);
  const [DateValidation, setDateValidation] = useState(false);
  const [openSuccessModal, setOpenSuccessModal] = React.useState(false);
  const [officerCount, setOfficerCount] = useState(0);
  const [modelAction, setModelAction] = useState("Update");
  const [isChecked, setIsChecked] = useState(false);
  const [addressUpdatedDatetime, setAddressUpdatedDatetime] = useState(
    Date.now(),
  );
  const today = new Date();
  const minDate = new Date(1970, 0, 1);
  // Set the maximum date to today
  const maxDate = today;
  const [type, setType] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [signature, setSignature] = useState(null);
  const [CompanyLogo, setLogo] = useState(null);
  const reader = new FileReader();
  const location = useLocation();
  const [saveLocationState, setSaveLocationState] = useState(location.state);
  const [modelRequestData, setModelRequestData] = useState({
    Action: null,
    message: "",
    status: 0,
  });
  const [openErrorModal, setOpenErrorModal] = useState(false);
  const [isIsSignatoryAvailable, setIsIsSignatoryAvailable] = useState(false);
  const [basicInfo, setBasicInfo] = useState({
    businessTypeID: null,
    businessTypeName: null,
    tradingName: null,
    professionTypeList: [],
    tradingStartDate: "",
    signatureImageUrl: null,
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
    regOfficeAddress: null,
  });
  const [otherInfo, setOtherInfo] = useState({
    orgOtherInfoId: null,
    enableEL: null,
    VATReg: 1,
    vatNumber: null,
    preferredCurrency: 1,
    indirectTaxPercentage: null,
    website: null,
    logoUrl: null,
    contactEmail: null,
    contactPhone: null,
    countryCode: null,
    logo: null,
    brandColor: "#00AFEF",
    businessTagline: null,
    countryCodeID: null,
    AffiliatedAcBodyName: null,
    webOfAffiliatedAccount: null,
  });
  const [companyForm, setCompanyForm] = useState({
    companyID: 0,
    companyName: null,
    companyType: null,
    companyNumber: null,
    companyStatus: null,
    addressID: 0,
    incorporationDate: null,
    incInID: "",
    moduleName: null,
    moduleID: 0,
    companyAddress: {
      addressId: null,
      premises: null,
      addressLine1: null,
      addressLine2: null,
      locality: null,
      region: null,
      countryId: null,
      postcode: null,
    },
  });
  const [officersForm, setOfficers] = useState([
    {
      organisationKeyID: common.organisationKeyID,
      userKeyID: common.userKeyID,
      organisationID: common.organisationID,
      officerID: null,
      firstName: "",
      lastName: "",
      countryCodeID: 9,
      phoneCountryCodeID: { value: 9, label: "+44" },
      phoneNo: null,
      emailID: "",
      addressID: null,
      isAuthorisedSignatory: false,
      officerRole: "",
      appointedOn: "",
      moduleName: null,
      moduleID: 0,
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
  const [taxName, setTaxName] = useState("VAT");
  const [modalOpen, setModalOpen] = useState(false);
  const [professionTypeLookupList, setProfessionTypeLookupList] = useState([]);
  const [selectedOfficerAddressIndex, setSelectedOfficerAddressIndex] =
    useState(0);
  const [instructions, setInstructions] = useState("");
  const [professionTypeValue, setProfessionTypeValue] = useState("");
  const [concatenatedRegisterAddress, setConcatenatedRegisterAddress] =
    useState("");
  const [concatenatedTradingAddress, setConcatenatedTradingAddress] =
    useState("");
  const [concatenatedResidentialAddress, setConcatenatedResidentialAddress] =
    useState([{ officersFullAddress: "" }]);
  const [AuthorityCount, setAuthorityCount] = useState(0);
  const [address, setAddress] = useState({
    addressId: null,
    premises: null,
    addressLine1: null,
    addressLine2: null,
    locality: null,
    region: null,
    country: null,
    countryId: null,
    postcode: null,
  });
  const [authoritySignatorySignatory, setAuthoritySignatorySignatory] =
    useState(false);

  useEffect(() => {
    setTopbar("block");
    getCountries();
    GetProfessionTypeLookupListData();
    getCountryCodes();
    GetCurrencyListData();
    GetOrganisationInformationModelData();
    GetIncorporatedInLookUpListData();
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

  const handleCurrencyChange = (e) => {
    const selectedCurrency = e.value;
    let newVAT = 20;

    if (selectedCurrency === 4) {
      newVAT = 18;
      setTaxName("GST");
    } else if (selectedCurrency === 2) {
      newVAT = 21;
      setTaxName("EU VAT");
    } else if (selectedCurrency === 3) {
      newVAT = 19;
      setTaxName("Salex Tax");
    } else {
      setTaxName("VAT");
    }

    setOtherInfo((prev) => ({
      ...prev,
      indirectTaxPercentage: newVAT,
      preferredCurrency: selectedCurrency,
    }));
  };

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
      setOtherInfo({
        ...otherInfo,
        indirectTaxPercentage: cleanValue === "" ? null : cleanValue,
      });
    }
  };

  const handleOpenRegisterOfficeAddressPopup = (e, AddressIndex) => {
    setSelectedOfficerAddressIndex(AddressIndex);

    let officerAddress = {
      addressId: officersForm[AddressIndex]?.officersAddress?.addressId
        ? officersForm[AddressIndex]?.officersAddress?.addressId
        : null,
      premises: officersForm[AddressIndex]?.officersAddress?.premises
        ? officersForm[AddressIndex]?.officersAddress?.premises
        : "",
      addressLine1: officersForm[AddressIndex]?.officersAddress?.addressLine1
        ? officersForm[AddressIndex]?.officersAddress?.addressLine1
        : "",
      addressLine2: officersForm[AddressIndex]?.officersAddress?.addressLine2
        ? officersForm[AddressIndex]?.officersAddress?.addressLine2
        : "",
      locality: officersForm[AddressIndex]?.officersAddress?.locality
        ? officersForm[AddressIndex]?.officersAddress?.locality
        : "",
      region: officersForm[AddressIndex]?.officersAddress?.region
        ? officersForm[AddressIndex]?.officersAddress?.region
        : "",
      country: officersForm[AddressIndex]?.officersAddress?.countryName
        ? officersForm[AddressIndex]?.officersAddress?.countryName
        : "",
      countryId: officersForm[AddressIndex]?.officersAddress?.countryId
        ? officersForm[AddressIndex]?.officersAddress?.countryId
        : null,
      postcode: officersForm[AddressIndex]?.officersAddress?.postcode
        ? officersForm[AddressIndex]?.officersAddress?.postcode
        : "",
    };

    setAddress(officerAddress);
    setOpenAddressPopUp(true);
  };

  const handleOpenTradingAddressPopup = (e) => {
    let tradingAddress = {
      addressId: basicInfo.tradingAddress?.addressId
        ? basicInfo.tradingAddress.addressId
        : null,
      premises: basicInfo.tradingAddress?.premises
        ? basicInfo.tradingAddress.premises
        : "",
      addressLine1: basicInfo.tradingAddress?.addressLine1
        ? basicInfo.tradingAddress.addressLine1
        : "",
      addressLine2: basicInfo.tradingAddress?.addressLine2
        ? basicInfo.tradingAddress.addressLine2
        : "",
      locality: basicInfo.tradingAddress?.locality
        ? basicInfo.tradingAddress.locality
        : "",
      region: basicInfo.tradingAddress?.region
        ? basicInfo.tradingAddress.region
        : "",
      country: basicInfo.tradingAddress?.countryName
        ? basicInfo.tradingAddress.countryName
        : "",
      countryId: basicInfo.tradingAddress?.countryId
        ? basicInfo.tradingAddress.countryId
        : null,
      postcode: basicInfo.tradingAddress?.postcode
        ? basicInfo.tradingAddress.postcode
        : "",
    };

    setAddressPopUpTitle("Trading Address");
    setAddress(tradingAddress);
    setOpenAddressPopUp(true);
  };

  // C] Call All lookUp List and Crud api here
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
        }
      }
    } catch (error) {}
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

  const GetOrganisationInformationModelData = async () => {
    setLoader(true);
    const response = await GetOrganisationInformationModel(
      common.organisationKeyID,
    );
    if (response) {
      if (response?.data?.statusCode === 200) {
        setLoader(false);
        const ModelData = response?.data?.responseData?.data;
        let tradingAddressObj = {
          addressId: ModelData.organisationAddress.addressId,
          premises: ModelData.organisationAddress.premises,
          addressLine1: ModelData.organisationAddress.addressLine1,
          addressLine2: ModelData.organisationAddress.addressLine2,
          locality: ModelData.organisationAddress.locality,
          region: ModelData.organisationAddress.region,
          countryId: ModelData.organisationAddress.countryID,
          postcode: ModelData.organisationAddress.postcode,
          countryName: ModelData.organisationAddress.countryName,
        };

        setBasicInfo({
          businessTypeID: ModelData.businessTypeID,
          businessTypeName: ModelData.businessTypeName,
          tradingName: ModelData.tradingBusinessName,
          tradingStartDate: ModelData.tradingStartDate,
          tradingAddress: tradingAddressObj,
          signatoryName: ModelData.otherInformation.signatoryName,
          signatureImageUrl: ModelData.otherInformation.signatureImageUrl,
          professionTypeList: ModelData.professionTypeList, //this will be professional type array
        });

        if (
          (ModelData.otherInformation.signatureImageUrl &&
            ModelData.otherInformation.signatoryName) || // both are truthy
          (!ModelData.otherInformation.signatureImageUrl &&
            !ModelData.otherInformation.signatoryName) // both are falsy
        ) {
          setIsIsSignatoryAvailable(true); // If both are available or both are not available
        } else {
          setIsIsSignatoryAvailable(false); // Else, they are in different states
        }

        const professionTypeName = ModelData.professionTypeList.map((item) => {
          return item.professionTypeName;
        });

        setProfessionTypeValue(professionTypeName);
        setOtherInfo({
          enableEL: ModelData.otherInformation.enableEL,
          orgOtherInfoId: ModelData.otherInformation.orgOtherInfoId,
          VATReg: ModelData.otherInformation.isVatRegistered,
          vatNumber: ModelData.otherInformation.vatNumber,
          preferredCurrency: ModelData.otherInformation.preferredCurrencyId,
          indirectTaxPercentage:
            ModelData.otherInformation.indirectTaxPercentage,
          website: ModelData.otherInformation.website,
          contactEmail: ModelData.otherInformation.emailID,
          contactPhone: ModelData.otherInformation.phoneNo,
          countryCode: ModelData.otherInformation.countryCode,
          logoUrl: ModelData.otherInformation.logoUrl,
          brandColor: ModelData.otherInformation.brandColor,
          businessTagline: ModelData.otherInformation.businessTagline,
          countryCodeID: ModelData.otherInformation.countryCodeID,
          AffiliatedAcBodyName:
            ModelData.otherInformation.affiliatedAccountingBodyName,
          webOfAffiliatedAccount:
            ModelData.otherInformation.affiliatedAccountingBodyWebsite,
        });
        if (ModelData.otherInformation.preferredCurrencyId === 1) {
          setTaxName("VAT");
        } else if (ModelData.otherInformation.preferredCurrencyId === 2) {
          setTaxName("EU VAT");
        } else if (ModelData.otherInformation.preferredCurrencyId === 3) {
          setTaxName("Sales Tax");
        } else if (ModelData.otherInformation.preferredCurrencyId === 4) {
          setTaxName("GST");
        }
        setOtherInfo((prev) => ({
          ...prev,
          indirectTaxPercentage:
            ModelData.otherInformation.indirectTaxPercentage,
        }));
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

        let officerArray = [];
        ModelData.officersList.forEach((item) => {
          const PhoneSelectedValue = CountryList.find(
            (countryCode) => item.countryCodeID == countryCode.value,
          );

          let officerObj = {
            organisationKeyID: common.organisationKeyID,
            userKeyID: common.userKeyID,
            organisationID: common.organisationID,
            officerID: item.officerID,
            firstName: item.firstName,
            lastName: item.lastName,
            countryCodeID: item.countryCodeID,
            phoneCountryCodeID: PhoneSelectedValue,
            phoneNo: item.phoneNo,
            emailID: item.emailID,
            addressID: item.addressID,
            isAuthorisedSignatory:
              item.isAuthorisedSignatory === null
                ? false
                : item.isAuthorisedSignatory,
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
            addressLine1: ModelData.companyDetails.companyAddress?.addressLine1,
            addressLine2: ModelData.companyDetails.companyAddress?.addressLine2,
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
              officersFullAddress: "",
            });
          }
        });
        setConcatenatedResidentialAddress(CorrespondenceOrResidentialAddress);
        if (ModelData.organisationAddress) {
          const fullAddress = concatenateFullAddress(
            ModelData.organisationAddress,
          );
          setConcatenatedTradingAddress(fullAddress);
        }
      } else {
        setLoader(false);
        setErrorMessage(response?.data?.errorMessage);
      }
    }
  };

  const addOfficer = () => {
    setRequireErrorMessage(false);
    setOfficerCount(officerCount + 1);
    concatenatedResidentialAddress.push({
      officersFullAddress: "",
    });
    officersForm.push({
      organisationKeyID: common.organisationKeyID,
      userKeyID: common.userKeyID,
      organisationID: common.organisationID,
      officerID: null,
      firstName: "",
      lastName: "",
      countryCodeID: 9,
      phoneCountryCodeID: { value: 9, label: "+44" },
      phoneNo: "",
      emailID: "",
      addressID: null,
      officerRole: "",
      appointedOn: "",
      moduleName: null,
      moduleID: 0,
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

  const isValidEmail = (email) => {
    // Regular expression for a basic email validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  };
  const isValidWebUrl = (web) => {
    // Regular expression for a basic URL validation
    const urlRegex =
      /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/i;

    return urlRegex.test(web);
  };
  const urlRegex =
    /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/i;
  const phoneNumberRegex = /^\d{10,15}$/; // Allow between 10 and 15 digits
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const AddUpdateClickedPracticeDetails = (confirmToSave) => {
    let hasError = false; // Flag to track errors
    let authorizedRecords;
    let OfficerAppointedOnDate = false;
    let DateError = false;
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
    // const dateString = basicInfo.tradingStartDate;
    // Step 1: Check if the input is a valid date string
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
      basicInfo.businessTypeID === CLIENT_TYPES.Sole_Trader ||
      basicInfo.businessTypeID === CLIENT_TYPES.Partnership
    ) {
      if (
        basicInfo.businessTypeID === "" ||
        basicInfo.businessTypeID === null ||
        basicInfo.tradingName === "" ||
        basicInfo.tradingName === null ||
        basicInfo.tradingStartDate === "" ||
        basicInfo.tradingStartDate === null ||
        basicInfo.tradingAddress === "" ||
        basicInfo.tradingAddress === null ||
        concatenatedTradingAddress === null ||
        concatenatedTradingAddress === "" ||
        otherInfo.contactEmail === null ||
        otherInfo.contactEmail === "" ||
        !emailPattern.test(otherInfo.contactEmail) ||
        otherInfo.preferredCurrency == null ||
        otherInfo.preferredCurrency === "" ||
        otherInfo.contactPhone === null ||
        otherInfo.contactPhone === "" ||
        !phoneNumberRegex.test(otherInfo.contactPhone) ||
        !isIsSignatoryAvailable
      ) {
        if (
          basicInfo.businessTypeID === "" ||
          basicInfo.businessTypeID === null
        ) {
          scrollUpDownByElementID("BusinessType");
        } else if (
          basicInfo.tradingName === "" ||
          basicInfo.tradingName === null
        ) {
          scrollUpDownByElementID("TradingName");
        } else if (
          basicInfo.tradingStartDate === "" ||
          basicInfo.tradingStartDate === null
        ) {
          scrollUpDownByElementID("TradingDate");
        } else if (
          concatenatedTradingAddress === null ||
          concatenatedTradingAddress === ""
        ) {
          scrollUpDownByElementID("TradingAddress");
        } else if (
          otherInfo.contactEmail === null ||
          otherInfo.contactEmail === "" ||
          !emailPattern.test(otherInfo.contactEmail)
        ) {
          scrollUpDownByElementID("Contact_Email");
        } else if (
          otherInfo.contactPhone === null ||
          otherInfo.contactPhone === "" ||
          !phoneNumberRegex.test(otherInfo.contactPhone)
        ) {
          scrollUpDownByElementID("Contact_Phone");
        }
        setRequireErrorMessage(true);
        return false;
      } else {
        if (
          otherInfo.website !== "" &&
          otherInfo.website !== undefined &&
          otherInfo.website !== null
        ) {
          if (!urlRegex.test(otherInfo.website)) {
            setRequireErrorMessage(true);
            scrollUpDownByElementID("WebSite");
            hasError = true;
            return false;
          }
        } else if (
          otherInfo.indirectTaxPercentage !== null &&
          otherInfo.indirectTaxPercentage > 100
        ) {
          scrollUpDownByElementID("Tax_Percentage");
          setRequireErrorMessage(true);
          hasError = true;
          return false;
        }
        for (let i = 0; i < officersForm.length; i++) {
          if (basicInfo.businessTypeID === CLIENT_TYPES.Sole_Trader) {
            if (
              officersForm[i].firstName === "" ||
              officersForm[i].firstName === null ||
              officersForm[i].lastName === "" ||
              officersForm[i].lastName === null ||
              officersForm[i].phoneNo === "" ||
              officersForm[i].phoneNo === null ||
              !phoneNumberRegex.test(officersForm[i].phoneNo) ||
              officersForm[i].emailID === "" ||
              officersForm[i].emailID === null ||
              !emailPattern.test(officersForm[i].emailID) ||
              concatenatedResidentialAddress[i].officersFullAddress === null ||
              concatenatedResidentialAddress[i].officersFullAddress === ""
            ) {
              scrollUpDownByElementID("SoleTraderDetails");
              setRequireErrorMessage(true);
              hasError = true;
              break; // Use break to exit the loop once an error is found
            }
            // else {
            //   if (
            //     basicInfo.businessTypeID === CLIENT_TYPES.Partnership ||
            //     basicInfo.businessTypeID === CLIENT_TYPES.LLP ||
            //     basicInfo.businessTypeID === CLIENT_TYPES.Company
            //   ) {
            //     let authoritySignatoryFound = false;
            //     for (let i = 0; i < officersForm.length; i++) {
            //       if (officersForm[i].isAuthorisedSignatory === true) {
            //         authoritySignatoryFound = true;
            //         hasError = true;
            //         break;
            //       }
            //     }
            //     if (authoritySignatoryFound) {
            //       hasError = false;
            //     } else {
            //       setRequireErrorMessage(true);
            //       // scrollUpDownByElementID("SoleTraderDetails")
            //       setAuthoritySignatorySignatory(true);
            //       return false;
            //     }
            //   } else {
            //     hasError = false;
            //   }
            // }
          } else if (basicInfo.businessTypeID === CLIENT_TYPES.Partnership) {
            if (
              officersForm[i].firstName === "" ||
              officersForm[i].firstName === null ||
              officersForm[i].lastName === "" ||
              officersForm[i].lastName === null ||
              officersForm[i].phoneNo === "" ||
              officersForm[i].phoneNo === null ||
              authorizedRecords.length === 0 ||
              !phoneNumberRegex.test(officersForm[i].phoneNo) ||
              officersForm[i].emailID === "" ||
              officersForm[i].emailID === null ||
              !emailPattern.test(officersForm[i].emailID) ||
              concatenatedResidentialAddress[i].officersFullAddress === null ||
              concatenatedResidentialAddress[i].officersFullAddress === ""
            ) {
              setAuthoritySignatorySignatory(true);
              scrollUpDownByElementID(`Partner_${i}`);
              setRequireErrorMessage(true);
              hasError = true;
              break; // Use break to exit the loop once an error is found
            }
            // else {
            //   if (
            //     basicInfo.businessTypeID === CLIENT_TYPES.Partnership ||
            //     basicInfo.businessTypeID === CLIENT_TYPES.LLP ||
            //     basicInfo.businessTypeID === CLIENT_TYPES.Company
            //   ) {
            //     let authoritySignatoryFound = false;
            //     for (let i = 0; i < officersForm.length; i++) {
            //       if (officersForm[i].isAuthorisedSignatory === true) {
            //         authoritySignatoryFound = true;
            //         hasError = true;
            //         break;
            //       }
            //     }
            //     if (authoritySignatoryFound) {
            //       hasError = false;
            //     } else {
            //       setRequireErrorMessage(true);
            //       setAuthoritySignatorySignatory(true);
            //       return false;
            //     }
            //   } else {
            //     hasError = false;
            //   }
            // }
          }
        }
        // for (let i = 0; i < officersForm.length; i++) {
        //   if (
        //     officersForm[i].phoneNo !== null &&
        //     officersForm[i].phoneNo !== "" &&
        //     officersForm[i].phoneNo !== undefined
        //   ) {
        //     if (!phoneNumberRegex.test(officersForm[i].phoneNo)) {
        //       setRequireErrorMessage(true);
        //       scrollUpDownByElementID(`Partner_${i}`)
        //       hasError = true;
        //       break;
        //     }
        //   }
        // }

        if (!hasError) {
          const ApiRequest_ParamsObj = {
            organisationKeyID: common.organisationKeyID,
            userKeyID: common.userKeyID,
            confirmToSave:
              confirmToSave == undefined
                ? modelRequestData.status
                : confirmToSave,
            businessTypeID: basicInfo.businessTypeID,
            tradingBusinessName: basicInfo.tradingName,
            tradingStartDate: basicInfo.tradingStartDate,
            organisationAddress: basicInfo.tradingAddress,
            companyDetails: companyForm,
            officersList: officersForm,
            otherInformation: {
              enableEL: otherInfo.enableEL,
              orgOtherInfoId: otherInfo.orgOtherInfoId,
              signatoryName: basicInfo.signatoryName,
              isVatRegistered: otherInfo.VATReg,
              vatNumber: otherInfo.vatNumber,
              indirectTaxPercentage:
                otherInfo.VATReg === 0 ? otherInfo.indirectTaxPercentage : null,
              preferredCurrencyId: otherInfo.preferredCurrency,
              website: otherInfo.website,
              countryCodeID: otherInfo.countryCodeID,
              phoneNo: otherInfo.contactPhone,
              emailID: otherInfo.contactEmail,
              brandColor: otherInfo.brandColor,
              businessTagline: otherInfo.businessTagline,
              affiliatedAccountingBodyName: otherInfo.AffiliatedAcBodyName,
              affiliatedAccountingBodyWebsite: otherInfo.webOfAffiliatedAccount,
            },
            professionTypeList: basicInfo.professionTypeList,
          };
          AddUpdateOrganisationData(ApiRequest_ParamsObj);
        }
      }
    } else if (
      basicInfo.businessTypeID === CLIENT_TYPES.LLP ||
      basicInfo.businessTypeID === CLIENT_TYPES.Company
    ) {
      if (
        companyForm.incInID === 0 ||
        companyForm.incInID === null ||
        companyForm.incInID === "" ||
        companyForm.companyName === "" ||
        companyForm.companyName === null ||
        companyForm.companyNumber === "" ||
        companyForm.companyNumber === null ||
        basicInfo.businessTypeID === "" ||
        basicInfo.businessTypeID === null ||
        basicInfo.tradingName === "" ||
        basicInfo.tradingName === null ||
        basicInfo.tradingStartDate === "" ||
        basicInfo.tradingStartDate === null ||
        basicInfo.tradingAddress === "" ||
        basicInfo.tradingAddress === null ||
        concatenatedTradingAddress === null ||
        concatenatedTradingAddress === "" ||
        otherInfo.contactEmail === null ||
        otherInfo.contactEmail === "" ||
        !emailPattern.test(otherInfo.contactEmail) ||
        otherInfo.preferredCurrency == null ||
        otherInfo.preferredCurrency === "" ||
        otherInfo.contactPhone === null ||
        otherInfo.contactPhone === "" ||
        !phoneNumberRegex.test(otherInfo.contactPhone) ||
        !isIsSignatoryAvailable
      ) {
        setAuthoritySignatorySignatory(true);
        if (
          basicInfo.businessTypeID === "" ||
          basicInfo.businessTypeID === null
        ) {
          scrollUpDownByElementID("BusinessType");
        } else if (
          basicInfo.tradingName === "" ||
          basicInfo.tradingName === null ||
          basicInfo.tradingStartDate === "" ||
          basicInfo.tradingStartDate === null ||
          concatenatedTradingAddress === null ||
          concatenatedTradingAddress === ""
        ) {
          scrollUpDownByElementID("TradingDetails");
        } else if (
          companyForm.companyName === "" ||
          companyForm.companyName === null
        ) {
          scrollUpDownByElementID("UpdateCompany");
        } else if (
          companyForm.companyNumber === "" ||
          companyForm.companyNumber === null
        ) {
          scrollUpDownByElementID("CompanyNumber");
        } else if (
          companyForm.incInID === 0 ||
          companyForm.incInID === null ||
          companyForm.incInID === ""
        ) {
          scrollUpDownByElementID("IncorporatedIn");
        } else if (
          otherInfo.contactEmail === null ||
          otherInfo.contactEmail === "" ||
          !emailPattern.test(otherInfo.contactEmail)
        ) {
          scrollUpDownByElementID("Contact_Email");
        } else if (
          otherInfo.contactPhone === null ||
          otherInfo.contactPhone === "" ||
          !phoneNumberRegex.test(otherInfo.contactPhone)
        ) {
          scrollUpDownByElementID("Contact_Phone");
        }
        setRequireErrorMessage(true);
        return false;
      } else {
        if (
          otherInfo.indirectTaxPercentage !== null &&
          otherInfo.indirectTaxPercentage > 100
        ) {
          scrollUpDownByElementID("Tax_Percentage");
          setRequireErrorMessage(true);
          return false;
        }
        for (let i = 0; i < officersForm.length; i++) {
          if (
            officersForm[i].firstName === "" ||
            officersForm[i].firstName === null ||
            officersForm[i].lastName === "" ||
            officersForm[i].lastName === null ||
            officersForm[i].emailID === "" ||
            officersForm[i].emailID === null ||
            officersForm[i].officerRole === "" ||
            officersForm[i].officerRole === null ||
            authorizedRecords.length === 0 ||
            officersForm[i]?.appointedOn === null ||
            officersForm[i]?.appointedOn === "" ||
            !emailPattern.test(officersForm[i].emailID) ||
            concatenatedResidentialAddress[i].officersFullAddress === null ||
            concatenatedResidentialAddress[i].officersFullAddress === ""
          ) {
            setRequireErrorMessage(true);
            setAuthoritySignatorySignatory(true);
            scrollUpDownByElementID(`Officers${i}`);
            hasError = true;
            break; // Use break to exit the loop once an error is found
          }
          // else {
          //   if (
          //     basicInfo.businessTypeID === CLIENT_TYPES.LLP ||
          //     basicInfo.businessTypeID === CLIENT_TYPES.Company
          //   ) {
          //     let authoritySignatoryFound = false;
          //     for (let i = 0; i < officersForm.length; i++) {
          //       if (officersForm[i].isAuthorisedSignatory === true) {
          //         authoritySignatoryFound = true;
          //         hasError = true;
          //         break;
          //       }
          //     }
          //     if (authoritySignatoryFound) {
          //       hasError = false;
          //     } else {
          //       setRequireErrorMessage(true);
          //       setAuthoritySignatorySignatory(true);
          //       return false;
          //     }
          //   } else {
          //     hasError = false;
          //   }
          // }
        }
        for (let i = 0; i < officersForm.length; i++) {
          if (
            officersForm[i].phoneNo !== null &&
            officersForm[i].phoneNo !== "" &&
            officersForm[i].phoneNo !== undefined
          ) {
            if (!phoneNumberRegex.test(officersForm[i].phoneNo)) {
              scrollUpDownByElementID(`Officers${i}`);
              setRequireErrorMessage(true);
              hasError = true;
            }
          }
        }
        if (
          otherInfo.website !== "" &&
          otherInfo.website !== undefined &&
          otherInfo.website !== null
        ) {
          if (!urlRegex.test(otherInfo.website)) {
            scrollUpDownByElementID("WebSite");
            setRequireErrorMessage(true);
            hasError = true;
          }
        }

        if (!hasError && !DateError && !OfficerAppointedOnDate) {
          const ApiRequest_ParamsObj = {
            organisationKeyID: common.organisationKeyID,
            userKeyID: common.userKeyID,
            confirmToSave:
              confirmToSave == undefined
                ? modelRequestData.status
                : confirmToSave,
            businessTypeID: basicInfo.businessTypeID,
            tradingBusinessName: basicInfo.tradingName,
            tradingStartDate: basicInfo.tradingStartDate,
            organisationAddress: basicInfo.tradingAddress,
            companyDetails: companyForm,
            officersList: officersForm,
            otherInformation: {
              enableEL: otherInfo.enableEL,
              orgOtherInfoId: otherInfo.orgOtherInfoId,
              signatoryName: basicInfo.signatoryName,
              isVatRegistered: otherInfo.VATReg,
              vatNumber: otherInfo.vatNumber,
              indirectTaxPercentage:
                otherInfo.VATReg === 0 ? otherInfo.indirectTaxPercentage : null,
              preferredCurrencyId: otherInfo.preferredCurrency,
              website: otherInfo.website,
              countryCodeID: otherInfo.countryCodeID,
              phoneNo: otherInfo.contactPhone,
              emailID: otherInfo.contactEmail,
              brandColor: otherInfo.brandColor,
              businessTagline: otherInfo.businessTagline,
              affiliatedAccountingBodyName: otherInfo.AffiliatedAcBodyName,
              affiliatedAccountingBodyWebsite: otherInfo.webOfAffiliatedAccount,
            },
          };

          AddUpdateOrganisationData(ApiRequest_ParamsObj);
        }
      }
    }
  };
  // Add or Update Service Category Data
  const AddUpdateOrganisationData = async (apiRequestParams) => {
    setLoader(true);
    try {
      const Action = "Update";
      let url = `/Organisation/AddUpdateOrganisationInformation?Action=${Action}`; // Default URL for Adding Data
      const response = await AddUpdateOrganisation(url, apiRequestParams);

      if (response) {
        if (response?.data?.statusCode === 200) {
          dispatch(updateState({ currency: otherInfo.preferredCurrency }));
          localStorage.removeItem("OrganisationLocalList");
          const ModuleKeyID = response.data.responseData.data;
          let uploadSignatureResponse;
          let uploadLogoResponse;
          let showSuccessModalWhen = "OrganisationSuccess";
          if (
            basicInfo.signatoryImage !== null &&
            basicInfo.signatoryImage !== undefined
          ) {
            showSuccessModalWhen = "SignatoryImageSuccess";
          } else if (otherInfo.logo !== null && otherInfo.logo !== undefined) {
            showSuccessModalWhen = "LogoSuccess";
          }
          if (showSuccessModalWhen === "OrganisationSuccess") {
            setLoader(false);
            if ($("#" + "ConfirmModel").hasClass("show")) {
              $("#" + "ConfirmModel").one("hidden.bs.modal", () => {
                setOpenSuccessModal(true);
              });
              $("#" + "ConfirmModel").modal("hide");
            } else {
              setOpenSuccessModal(true);
            }
            // navigate("/");
          }
          if (
            basicInfo.signatoryImage !== null &&
            basicInfo.signatoryImage !== undefined
          ) {
            const Signature = new FormData();
            // Instead, you should append the entire file
            Signature.set("file", basicInfo.signatoryImage); // Append the file itself
            uploadSignatureResponse = await AddUpdateSignature(
              ModuleKeyID,
              Signature,
            );
          }
          if (basicInfo.signatoryImage === null) {
            uploadSignatureResponse = await DeleteSignature(ModuleKeyID);
          }

          if (otherInfo.logo !== null && otherInfo.logo !== undefined) {
            const Logo = new FormData();
            Logo.set("file", otherInfo.logo); // Append the file itself
            uploadLogoResponse = await AddUpdateLogo(ModuleKeyID, Logo);
          }

          if (otherInfo.logo === null) {
            uploadSignatureResponse = await DeleteLogo(ModuleKeyID);
          }
          if (uploadSignatureResponse || uploadLogoResponse) {
            setLoader(false);
            if ($("#" + "ConfirmModel").hasClass("show")) {
              $("#" + "ConfirmModel").one("hidden.bs.modal", () => {
                setOpenSuccessModal(true);
              });
              $("#" + "ConfirmModel").modal("hide");
            } else {
              setOpenSuccessModal(true);
            }
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
          addressId: companyForm?.companyAddress.addressId,
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
          signatureImageUrl: null,
          signatoryName: "",
          regOfficeAddress: fullAddress,
        });
        setConcatenatedTradingAddress(fullAddress);
        setCompanyForm({
          ...companyForm,
          companyName: CompanyDetails.company_name,
          companyNumber: CompanyDetails.company_number,
          companyType: CompanyDetails.type,
          incorporationDate: CompanyDetails.date_of_creation,
          incInID: "",
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
        const CompanyOfficer = data?.data?.responseData;
        const CompOfficers = [];
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

  const handleAddressPopUpClose = () => {
    setOpenAddressPopUp(false);
  };

  const OnOfficerChange = (index, field, value) => {
    const updatedOfficer = [...officersForm];
    updatedOfficer[index][field] = value;
    setOfficers(updatedOfficer);
  };
  const handleCloseModal = () => {
    setModalOpen(false);
    // setAlertMessage(""); // Reset alert message when modal is closed
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
    companyOfficers(company_Number);
    companyDetails(company_Number);
    setSignature(null);
    setConcatenatedResidentialAddress([{ officersFullAddress: "" }]);
    setConcatenatedTradingAddress("");
    setBasicInfo({
      businessTypeID: null,
      businessTypeName: null,
      tradingName: null,
      professionTypeList: [],
      tradingStartDate: "",
      signatureImageUrl: null,
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
      regOfficeAddress: null,
    });
    setOtherInfo({
      ...otherInfo,
      VATReg: 1,
      vatNumber: "",
      preferredCurrency: 1,
      website: "",
      logoUrl: "",
      contactEmail: "",
      contactPhone: "",
      countryCode: 9,
      logo: null,
      brandColor: "#00AFEF",
      businessTagline: "",
      countryCodeID: 9,
      AffiliatedAcBodyName: "",
      webOfAffiliatedAccount: "",
    });
    setOfficers([
      {
        organisationKeyID: common.organisationKeyID,
        userKeyID: common.userKeyID,
        organisationID: common.organisationID,
        officerID: null,
        firstName: "",
        lastName: "",
        countryCodeID: 9,
        phoneCountryCodeID: { value: 9, label: "+44" },
        phoneNo: null,
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
    setCompanyForm({
      companyID: 0,
      companyName: null,
      companyType: null,
      companyNumber: null,
      companyStatus: null,
      addressID: 0,
      incorporationDate: null,
      incInID: "",
      moduleName: null,
      moduleID: 0,
      companyAddress: {
        addressId: null,
        premises: null,
        addressLine1: null,
        addressLine2: null,
        locality: null,
        region: null,
        countryId: null,
        postcode: null,
      },
    });
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

  const handleIncorporatedInChange = (selectedCountry) => {
    setCompanyForm({ ...companyForm, incInID: selectedCountry.value });
  };

  const handleSwitchToggle = (e, index) => {
    const currentOfficer = officersForm[index];
    if (!currentOfficer) {
      // Handle the case where officersForm[index] is undefined or null
      console.error("Invalid officer at index:", index);
      return;
    }
    const newChecked = !currentOfficer.isAuthorisedSignatory;

    setIsChecked(newChecked);
    OnOfficerChange(index, "isAuthorisedSignatory", newChecked);

    // Assuming setAuthoritySignatorySignatory is a state-setting function
    setAuthoritySignatorySignatory(false);
  };

  const VATRegFilter = Utils.VAT_Registered.find(
    (item) => otherInfo.VATReg == item.value,
  );
  const ContactFilter = countryCodes.find(
    (item) => otherInfo.countryCodeID == item.value,
  );

  const handleImageUpload = (image) => {
    if (type == "Signature") {
      setBasicInfo({
        ...basicInfo,
        signatoryImage: image,
      });
      const file = basicInfo.signatoryImage; // Assuming you only want to handle the first selected file
      reader.onload = () => {
        const base64ImageData = reader.result;
        setSignature(base64ImageData);
        if (
          (base64ImageData && basicInfo.signatoryName) || // both are truthy
          (!base64ImageData && !basicInfo.signatoryName) // both are falsy
        ) {
          setIsIsSignatoryAvailable(true); // If both are available or both are not available
        } else {
          setIsIsSignatoryAvailable(false); // Else, they are in different states
        }
      };

      if (file) {
        reader.readAsDataURL(file);
      }
    } else if (type == "Logo") {
      setOtherInfo({
        ...otherInfo,
        logo: image,
      });
      const LogoFile = image; // Assuming you only want to handle the first selected file

      if (LogoFile) {
        reader.readAsDataURL(LogoFile);
      }
      reader.onload = () => {
        const base64ImageData = reader.result;
        setLogo(base64ImageData);
      };
    }
  };

  const handleClose = () => {
    // navigate("/")
    $("#" + "ConfirmModel").modal("hide");
    // const navigateAndRefresh = () => {
    dispatch(
      updateState({
        enableEL: otherInfo.enableEL,
      }),
    );
    navigate("/");
    window.location.reload(true);
    // };

    // Call the navigateAndRefresh function
    // navigateAndRefresh();

    // Close the pop-up
    setOpenAddressPopUp(false);
  };

  const isValidPhoneNumber = (phoneNumber) => {
    const phoneNumberRegex = /^\d{10,15}$/; // Allow between 10 and 15 digits
    return phoneNumberRegex.test(phoneNumber);
  };

  const handleChangeSelectedValue = () => {
    let value = [];

    for (let i = 0; i < officersForm.length; i++) {
      // Find the country code based on the countryCodeID in officersForm
      let phoneValue = countryCodes.find(
        (item) => officersForm[i]?.countryCodeID === item.value,
      );

      // If a matching country code is found, add it to the value array
      if (phoneValue) {
        value.push({
          label: phoneValue.label,
          value: phoneValue.value,
        });
      }
    }
  };

  const handleOfficerPhoneSelectedValue = (e, index) => {
    OnOfficerChange(index, "countryCodeID", e.value);
    OnOfficerChange(index, "phoneCountryCodeID", e);
    handleChangeSelectedValue();
  };

  const currencyFilter = currencyType.find(
    (item) => otherInfo.preferredCurrency == item.value,
  );

  const IncorporatedValue = incorporatedInList.filter(
    (item) => companyForm?.incInID == item.value,
  );

  function formatDate(dateString) {
    const dateObject = new Date(dateString);
    const formattedDate = `${dateObject.getDate()}/${
      dateObject.getMonth() + 1
    }/${dateObject.getFullYear()}`;
    return formattedDate;
  }

  const handleConfirmButton = async () => {
    setModelRequestData({
      ...modelRequestData,
      Action: "PracticeWarning",
      Status: 1,
    });
    AddUpdateClickedPracticeDetails(1);
  };

  // const handleHowToCreateClick = () => {
  //   setModalOpen(true);
  //   // setInstructions(`If enabled, your practice has access to ${EngagementName} feature , otherwise your practices no longer has access to ${EngagementName} features`);
  //   setInstructions(`If enabled, your practice will have access to the ${EngagementName} feature,Conversely, if it is disabled, your practice will no longer have access to the ${EngagementName} features, and their associated advantages will be unavailable`)}

  const longText = `If enabled, your practice will have access to the ${EngagementName} feature.Conversely, if it is disabled, your practice will no longer have access to the ${EngagementName} features, and their associated advantages will be unavailable.`;

  const CustomWidthTooltip = styled(({ className, ...props }) => (
    <Tooltip {...props} classes={{ popper: className }} />
  ))({
    [`& .${tooltipClasses.tooltip}`]: {
      maxWidth: 500,
    },
  });

  const handleVATStatusChange = (e) => {
    setOtherInfo({
      ...otherInfo,
      VATReg: e.value,
    });

    if (otherInfo.VATReg === 0) {
      setOtherInfo((prev) => ({
        ...prev,
        indirectTaxPercentage: 20,
      }));
    }
  };

  return (
    <>
      <div className="pd-page">
        {/* ================= PAGE HEADER ================= */}
        <div className="pd-page-head">
          <h1 className="pd-page-title">Update Practice Details</h1>
          <p className="pd-page-subtitle">
            Manage your organization profile, branding, electronic signature,
            taxation and practice information.
          </p>
        </div>

        <div className="pd-content">
          {/* ================= BASIC INFORMATION ================= */}
          <section className="pd-card" id="BasicInformation">
            <div className="pd-card-head">
              <span className="pd-card-icon">
                <Building2 size={18} />
              </span>
              <div>
                <h2 className="pd-card-title">Basic Information</h2>
                <p className="pd-card-subtitle">
                  Configure your business information.
                </p>
              </div>
            </div>

            <div className="pd-card-body">
              <div className="pd-grid">
                <div className="pd-field">
                  <label className="pd-label">
                    Profession Type<span className="pd-req">*</span>
                  </label>
                  <input
                    disabled
                    className="input-text pd-input"
                    placeholder="Profession Type"
                    value={professionTypeValue}
                  />
                </div>

                <div className="pd-field" id="BusinessType">
                  <label className="pd-label">
                    Business Type<span className="pd-req">*</span>
                  </label>
                  <input
                    type="text"
                    disabled
                    className="input-text pd-input"
                    placeholder="Business Type"
                    value={basicInfo.businessTypeName}
                  />
                </div>

                {(basicInfo.businessTypeID === CLIENT_TYPES.Sole_Trader ||
                  basicInfo.businessTypeID === CLIENT_TYPES.Partnership) && (
                  <>
                    <div className="pd-field pd-field-full" id="TradingName">
                      <label className="pd-label">
                        Trading Name<span className="pd-req">*</span>
                      </label>
                      <input
                        maxLength={50}
                        type="text"
                        className="input-text pd-input"
                        placeholder="Trading Name"
                        value={basicInfo.tradingName}
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
                            setBasicInfo({
                              ...basicInfo,
                              tradingName: capitalizedValue,
                            });
                          }
                        }}
                      />
                      {requireErrorMessage &&
                      (basicInfo.tradingName === "" ||
                        basicInfo.tradingName === null) ? (
                        <span className="validation pd-validation">
                          {ERROR_MESSAGES}
                        </span>
                      ) : (
                        ""
                      )}
                    </div>

                    <div className="pd-field" id="TradingDate">
                      <label className="pd-label">
                        Trading Start Date<span className="pd-req">*</span>
                      </label>
                      <div className="pd-datepicker">
                        <DatePicker
                          minDate={minDate}
                          maxDate={maxDate}
                          format="dd/MM/y"
                          dayPlaceholder="dd"
                          monthPlaceholder="mm"
                          yearPlaceholder="yyyy"
                          value={basicInfo.tradingStartDate}
                          onChange={(e) => {
                            setDateValidation(false);
                            setBasicInfo({
                              ...basicInfo,
                              tradingStartDate: e,
                            });
                          }}
                        />
                      </div>
                      {DateValidation &&
                      (basicInfo.tradingStartDate !== "" ||
                        basicInfo.tradingStartDate !== null) ? (
                        <span className="validation pd-validation">
                          Invalid Date
                        </span>
                      ) : (
                        ""
                      )}
                      {requireErrorMessage &&
                      (basicInfo.tradingStartDate === "" ||
                        basicInfo.tradingStartDate === null) ? (
                        <span className="validation pd-validation">
                          {ERROR_MESSAGES}
                        </span>
                      ) : (
                        ""
                      )}
                    </div>

                    <div className="pd-field pd-field-full" id="TradingAddress">
                      <label className="pd-label">
                        Trading Address<span className="pd-req">*</span>
                      </label>
                      <input
                        className="input-text pd-input pd-input-clickable"
                        placeholder="Trading Address"
                        value={concatenatedTradingAddress}
                        onMouseDown={(e) => {
                          e.preventDefault();

                          handleOpenTradingAddressPopup(e);
                        }}
                      />
                      {requireErrorMessage &&
                      (concatenatedTradingAddress === "" ||
                        concatenatedTradingAddress === null) ? (
                        <span className="validation pd-validation">
                          {ERROR_MESSAGES}
                        </span>
                      ) : (
                        ""
                      )}
                    </div>
                  </>
                )}

                {(basicInfo.businessTypeID === CLIENT_TYPES.Company ||
                  basicInfo.businessTypeID === CLIENT_TYPES.LLP) && (
                  <>
                    <div
                      className="pd-field pd-field-full pd-field-search"
                      id="UpdateCompany"
                    >
                      <label className="pd-label">Update Company</label>
                      <input
                        className="input-text pd-input"
                        placeholder="Search Company"
                        onChange={handleCompanyInputChange}
                        onKeyDown={(e) => {
                          if (e.key === " " && e.target.value === "") {
                            e.preventDefault();
                          }
                        }}
                      />
                      {companies.length > 0 && (
                        <div className="autocomplete-input-div show">
                          <ul className="searchList">
                            {companies.map((i, index) => (
                              <li
                                key={index}
                                onClick={() => handleCompanySelect(i)}
                              >
                                {i.title}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    <div className="pd-field">
                      <label className="pd-label">
                        Company Name<span className="pd-req">*</span>
                      </label>
                      <input
                        disabled
                        className="input-text pd-input"
                        placeholder="Company Name"
                        value={companyForm.companyName}
                        onChange={(e) =>
                          setCompanyForm({
                            ...companyForm,
                            companyName: e.target.value,
                          })
                        }
                      />
                      {requireErrorMessage &&
                      (companyForm.companyName === "" ||
                        companyForm.companyName === null) ? (
                        <span className="validation pd-validation">
                          {ERROR_MESSAGES}
                        </span>
                      ) : (
                        ""
                      )}
                    </div>

                    <div className="pd-field">
                      <label className="pd-label">
                        Entity Type<span className="pd-req">*</span>
                      </label>
                      <input
                        disabled
                        className="input-text pd-input"
                        placeholder="Entity Type"
                        value={companyForm.companyType}
                        onChange={(e) =>
                          setCompanyForm({
                            ...companyForm,
                            companyType: e.target.value,
                          })
                        }
                      />
                      {requireErrorMessage &&
                      (companyForm.companyType === "" ||
                        companyForm.companyType === null) ? (
                        <span className="validation pd-validation">
                          {ERROR_MESSAGES}
                        </span>
                      ) : (
                        ""
                      )}
                    </div>

                    <div className="pd-field" id="CompanyNumber">
                      <label className="pd-label">
                        Company Number<span className="pd-req">*</span>
                      </label>
                      <input
                        disabled
                        className="input-text pd-input"
                        placeholder="Company Number"
                        value={companyForm.companyNumber}
                        onChange={(e) =>
                          setCompanyForm({
                            ...companyForm,
                            companyNumber: e.target.value,
                          })
                        }
                      />
                      {requireErrorMessage &&
                      (companyForm.companyNumber === "" ||
                        companyForm.companyNumber === null) ? (
                        <span className="validation pd-validation">
                          {ERROR_MESSAGES}
                        </span>
                      ) : (
                        ""
                      )}
                    </div>

                    <div className="pd-field">
                      <label className="pd-label">
                        Incorporation Date<span className="pd-req">*</span>
                      </label>
                      <input
                        disabled
                        className="input-text pd-input"
                        placeholder="Incorporation Date"
                        value={formatDate(companyForm.incorporationDate)}
                        onChange={(e) =>
                          setCompanyForm({
                            ...companyForm,
                            incorporationDate: e.target.value,
                          })
                        }
                      />
                      {requireErrorMessage &&
                      (companyForm.incorporationDate === "" ||
                        companyForm.incorporationDate === null) ? (
                        <span className="validation pd-validation">
                          {ERROR_MESSAGES}
                        </span>
                      ) : (
                        ""
                      )}
                    </div>

                    <div className="pd-field pd-field-full" id="CompanyAddress">
                      <label className="pd-label">
                        Registered Office Address
                      </label>
                      <input
                        disabled
                        className="input-text pd-input"
                        placeholder="Registered Office Address"
                        value={concatenatedRegisterAddress}
                        onChange={(e) =>
                          setBasicInfo({
                            ...basicInfo,
                            regOfficeAddress: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="pd-field" id="IncorporatedIn">
                      <label className="pd-label">
                        Incorporated In<span className="pd-req">*</span>
                      </label>
                      <Select
                        className="CurrencySelect pd-select"
                        options={incorporatedInList}
                        value={IncorporatedValue}
                        onChange={handleIncorporatedInChange}
                      />
                      {requireErrorMessage &&
                      (companyForm.incInID === 0 ||
                        companyForm.incInID === null ||
                        companyForm.incInID === "") ? (
                        <span className="validation pd-validation">
                          {ERROR_MESSAGES}
                        </span>
                      ) : (
                        ""
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </section>

          {/* ================= TRADING DETAILS (Company / LLP) ================= */}
          {(basicInfo.businessTypeID === CLIENT_TYPES.Company ||
            basicInfo.businessTypeID === CLIENT_TYPES.LLP) && (
            <section className="pd-card" id="TradingDetails">
              <div className="pd-card-head">
                <span className="pd-card-icon">
                  <Briefcase size={18} />
                </span>
                <div>
                  <h2 className="pd-card-title">Trading Details</h2>
                  <p className="pd-card-subtitle">
                    Trading name, start date and address of the practice.
                  </p>
                </div>
              </div>

              <div className="pd-card-body">
                <div className="pd-grid">
                  <div className="pd-field pd-field-full">
                    <label className="pd-label">
                      Trading Name<span className="pd-req">*</span>
                    </label>
                    <input
                      maxLength={50}
                      type="text"
                      className="input-text pd-input"
                      placeholder="Trading Name"
                      value={basicInfo.tradingName}
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
                          setBasicInfo({
                            ...basicInfo,
                            tradingName: capitalizedValue,
                          });
                        }
                      }}
                    />
                    {requireErrorMessage &&
                    (basicInfo.tradingName === "" ||
                      basicInfo.tradingName === null) ? (
                      <span className="validation pd-validation">
                        {ERROR_MESSAGES}
                      </span>
                    ) : (
                      ""
                    )}
                  </div>

                  <div className="pd-field">
                    <label className="pd-label">
                      Trading Start Date<span className="pd-req">*</span>
                    </label>
                    <div className="pd-datepicker">
                      <DatePicker
                        minDate={minDate}
                        maxDate={maxDate}
                        format="dd/MM/y"
                        dayPlaceholder="dd"
                        monthPlaceholder="mm"
                        yearPlaceholder="yyyy"
                        value={basicInfo.tradingStartDate}
                        onChange={(e) => {
                          setDateValidation(false);
                          setBasicInfo({
                            ...basicInfo,
                            tradingStartDate: e,
                          });
                        }}
                      />
                    </div>
                    {/* {DateValidation &&
                        (basicInfo.tradingStartDate !== "" ||
                          basicInfo.tradingStartDate !== null) ? (
                        <span className="validation">
                          Invalid Date
                        </span>
                      ) : (
                        ""
                      )} */}
                    {requireErrorMessage &&
                    (basicInfo.tradingStartDate === "" ||
                      basicInfo.tradingStartDate === null) ? (
                      <span className="validation pd-validation">
                        {ERROR_MESSAGES}
                      </span>
                    ) : (
                      ""
                    )}
                  </div>

                  <div className="pd-field pd-field-full">
                    <label className="pd-label">
                      Trading Address<span className="pd-req">*</span>
                    </label>
                    <input
                      className="input-text pd-input pd-input-clickable"
                      placeholder="Trading Address"
                      value={concatenatedTradingAddress}
                      onClick={(e) => {
                        handleOpenTradingAddressPopup(e);
                      }}
                    />
                    {requireErrorMessage &&
                    (concatenatedTradingAddress === "" ||
                      concatenatedTradingAddress === null) ? (
                      <span className="validation pd-validation">
                        {ERROR_MESSAGES}
                      </span>
                    ) : (
                      ""
                    )}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* ================= E SIGNATURE ================= */}
          <section className="pd-card" id="E-Signature">
            <div className="pd-card-head">
              <span className="pd-card-icon">
                <PenLine size={18} />
              </span>
              <div>
                <h2 className="pd-card-title">Electronic Signature</h2>
                <p className="pd-card-subtitle">
                  Configure your {EngagementName.toLowerCase()} signature
                  settings.
                </p>
              </div>
            </div>

            <div className="pd-card-body">
              <div className="pd-toggle-panel">
                <label className="pd-toggle-text" htmlFor="isEL">
                  <span className="pd-toggle-title">{EngagementName}</span>
                  <span className="pd-toggle-desc">
                    Enable electronic signatures for{" "}
                    {EngagementName.toLowerCase()} sent to clients.
                  </span>
                </label>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <CustomWidthTooltip title="Enable/Disable EL">
                        <Android12Switch
                          id="isEL"
                          checked={otherInfo.enableEL === 1}
                          onClick={() =>
                            setOtherInfo({
                              ...otherInfo,
                              enableEL: otherInfo.enableEL === 1 ? 0 : 1,
                            })
                          }
                        />
                      </CustomWidthTooltip>
                    }
                  />
                </FormGroup>
              </div>

              <div className="pd-note">
                <Info size={16} className="pd-note-icon" />
                <div>
                  <b>Note: </b>
                  {longText}
                </div>
              </div>

              <div className="pd-grid">
                <div className="pd-field">
                  <label className="pd-label">
                    Signatory Name
                    {((signature !== null &&
                      signature !== undefined &&
                      signature !== "") ||
                      (basicInfo.signatureImageUrl !== null &&
                        basicInfo.signatureImageUrl !== undefined &&
                        basicInfo.signatureImageUrl !== "")) && (
                      <span className="pd-req">*</span>
                    )}
                  </label>
                  <input
                    type="text"
                    className="input-text pd-input"
                    placeholder="Signatory Name"
                    value={basicInfo.signatoryName}
                    onChange={(e) => {
                      if (signature || basicInfo.signatureImageUrl) {
                        if (!e.target.value) {
                          setIsIsSignatoryAvailable(false);
                        } else {
                          setIsIsSignatoryAvailable(true);
                        }
                      } else {
                        if (e.target.value) {
                          setIsIsSignatoryAvailable(false);
                        } else {
                          setIsIsSignatoryAvailable(true);
                        }
                      }
                      setBasicInfo({
                        ...basicInfo,
                        signatoryName: e.target.value,
                      });
                    }}
                  />
                  {requireErrorMessage &&
                  ((signature !== null &&
                    signature !== undefined &&
                    signature !== "") ||
                    (basicInfo.signatureImageUrl !== "" &&
                      basicInfo.signatureImageUrl !== undefined &&
                      basicInfo.signatureImageUrl !== null)) &&
                  (basicInfo.signatoryName === "" ||
                    basicInfo.signatoryName === null) ? (
                    <span className="validation pd-validation">
                      {ERROR_MESSAGES}
                    </span>
                  ) : (
                    ""
                  )}
                </div>

                <div className="pd-field pd-field-full">
                  <label className="pd-label">
                    Signature Image
                    {basicInfo.signatoryName !== null &&
                      basicInfo.signatoryName !== undefined &&
                      basicInfo.signatoryName !== "" && (
                        <span className="pd-req">*</span>
                      )}
                  </label>
                  {signature || basicInfo.signatureImageUrl ? (
                    <div className="pd-media-box">
                      <div className="pd-media-preview">
                        {basicInfo.signatureImageUrl &&
                          basicInfo.signatureImageUrl !== undefined && (
                            <img
                              src={basicInfo.signatureImageUrl}
                              className="pd-media-img"
                              alt="Selected Signature"
                            />
                          )}
                        {signature && (
                          <img
                            src={signature === undefined ? "" : signature}
                            className="pd-media-img"
                            alt="Selected Signature"
                          />
                        )}
                      </div>
                      <button
                        onClick={() => {
                          setSignature(null);
                          if (
                            basicInfo.signatoryName !== null &&
                            basicInfo.signatoryName !== "" &&
                            basicInfo.signatoryName !== undefined
                          ) {
                            setIsIsSignatoryAvailable(false); // If either of them is falsy, set to false
                          } else {
                            setIsIsSignatoryAvailable(true); // Otherwise, set to true
                          }
                          setBasicInfo({
                            ...basicInfo,
                            signatoryImage: null,
                            signatureImageUrl: null,
                          });
                        }}
                        className="btn btn-sm btn-danger remove-item-btn pd-btn pd-btn-danger"
                      >
                        <Trash2 size={14} />
                        <span>Remove</span>
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="pd-upload-box">
                        <button
                          onClick={() => {
                            setType("Signature");
                          }}
                          className="btn btn-md btn-primary create-item-btn pd-btn pd-btn-outline"
                          data-bs-toggle="modal"
                          data-bs-target="#SignatureUploadModel"
                        >
                          <Plus size={15} />
                          <span>Upload Signature</span>
                        </button>
                        <span className="pd-hint">
                          Supported file types are .jpg, .jpeg, .png up to a
                          file size of 2MB.
                        </span>
                      </div>
                      {requireErrorMessage &&
                      basicInfo.signatoryName !== null &&
                      basicInfo.signatoryName !== undefined &&
                      basicInfo.signatoryName !== "" &&
                      (signature === "" || signature === null) ? (
                        <span className="validation pd-validation">
                          This field is required if you have entered a value in
                          the above 'Signatory Name' field. To proceed without
                          uploading a signature, please remove the data from
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
          </section>

          {/* ================= OTHER INFORMATION ================= */}
          <section className="pd-card">
            <div className="pd-card-head">
              <span className="pd-card-icon">
                <Layers size={18} />
              </span>
              <div>
                <h2 className="pd-card-title">Other Information</h2>
                <p className="pd-card-subtitle">
                  Configure branding and contact information.
                </p>
              </div>
            </div>

            <div className="pd-card-body">
              <div className="pd-grid">
                <div className="pd-field" id="WebSite">
                  <label className="pd-label">Website</label>
                  <input
                    maxLength={100}
                    type="text"
                    className="input-text pd-input"
                    placeholder="www.example.com"
                    value={otherInfo.website}
                    onChange={(e) =>
                      setOtherInfo({
                        ...otherInfo,
                        website: e.target.value.trim(),
                      })
                    }
                  />
                  {requireErrorMessage &&
                    otherInfo.website !== null &&
                    otherInfo.website !== "" &&
                    otherInfo.website !== undefined &&
                    !isValidWebUrl(otherInfo.website) && (
                      <span className="validation pd-validation">
                        {" "}
                        Invalid Url{" "}
                      </span>
                    )}
                </div>

                <div className="pd-field" id="Contact_Email">
                  <label className="pd-label">
                    Contact Email<span className="pd-req">*</span>
                  </label>
                  <input
                    type="text"
                    className="input-text pd-input"
                    placeholder="Email"
                    maxLength={50}
                    value={otherInfo.contactEmail}
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
                        setOtherInfo({
                          ...otherInfo,
                          contactEmail: correctedValue,
                        });
                        return;
                      }

                      // Update the contact email in the state
                      setOtherInfo({
                        ...otherInfo,
                        contactEmail: enteredValue,
                      });
                    }}
                  />
                  {requireErrorMessage &&
                    (otherInfo.contactEmail === null ||
                    otherInfo.contactEmail === "" ? (
                      <span className="validation pd-validation">
                        {ERROR_MESSAGES}
                      </span>
                    ) : (
                      !isValidEmail(otherInfo.contactEmail) && (
                        <span className="validation pd-validation">
                          Invalid email pattern
                        </span>
                      )
                    ))}
                </div>

                <div className="pd-field" id="Contact_Phone">
                  <label className="pd-label">
                    Contact Phone<span className="pd-req">*</span>
                  </label>
                  <div className="phone-input-div CompanyInfo pd-phone">
                    <Select
                      className="phone-input-country-code pd-select"
                      options={countryCodes}
                      value={
                        ContactFilter || {
                          value: 9,
                          label: "+44",
                        }
                      }
                      onChange={(e) => {
                        setOtherInfo({
                          ...otherInfo,
                          countryCodeID: e.value,
                        });
                      }}
                    />
                    <div className="phone-input-number-div">
                      <input
                        className="input-text pd-input"
                        type="text"
                        placeholder="Phone"
                        value={otherInfo.contactPhone}
                        onChange={(e) => {
                          const sanitizedInput = e.target.value
                            .replace(/[^0-9]/g, "")
                            .slice(0, 15);
                          setOtherInfo({
                            ...otherInfo,
                            contactPhone: sanitizedInput,
                          });
                        }}
                      />
                    </div>
                  </div>
                  {requireErrorMessage &&
                  (otherInfo.countryCodeID === "" ||
                    otherInfo.countryCodeID === null ||
                    otherInfo.contactPhone === "" ||
                    otherInfo.contactPhone === null) ? (
                    <span className="validation pd-validation">
                      {ERROR_MESSAGES}
                    </span>
                  ) : requireErrorMessage &&
                    !isValidPhoneNumber(otherInfo.contactPhone) ? (
                    <span className="validation pd-validation">
                      {" "}
                      Invalid phone number{" "}
                    </span>
                  ) : (
                    ""
                  )}
                </div>

                <div className="pd-field">
                  <label className="pd-label">{taxName} Registered</label>
                  <BinarySelect
                    options={Utils.VAT_Registered}
                    value={VATRegFilter}
                    onChange={(e) => handleVATStatusChange(e)}
                    ariaLabel="VAT Registered"
                  />
                </div>

                {otherInfo.VATReg === 0 && (
                  <>
                    <div className="pd-field">
                      <label className="pd-label">{taxName} Number</label>
                      <input
                        className="input-text pd-input"
                        type="text"
                        placeholder={`${taxName} Number`}
                        value={otherInfo.vatNumber}
                        onChange={(e) => {
                          const sanitizedInput = e.target.value
                            .trimStart()
                            .slice(0, 12);
                          setOtherInfo({
                            ...otherInfo,
                            vatNumber: sanitizedInput.toUpperCase(),
                          });
                        }}
                      />
                    </div>

                    <div className="pd-field" id="Tax_Percentage">
                      <label className="pd-label">
                        {taxName} Percentage (%)
                      </label>
                      {/* <Slider
                        value={otherInfo.indirectTaxPercentage ?? 20}
                        step={0.1}
                        min={0}
                        max={100}
                        aria-label="Default"
                        valueLabelDisplay="auto"
                        onChange={(e, newValue) => {
                          setOtherInfo({
                            ...otherInfo,
                            indirectTaxPercentage: newValue,
                          });
                        }}
                      /> */}
                      <input
                        className="input-text pd-input"
                        type="text"
                        value={
                          otherInfo.indirectTaxPercentage === 0
                            ? 20.0
                            : otherInfo.indirectTaxPercentage
                        }
                        onChange={handleChangeTaxPercentage}
                      />
                    </div>

                    {requireErrorMessage &&
                      otherInfo.indirectTaxPercentage > 100 && (
                        <div className="pd-field pd-field-full">
                          <label className="text-danger pd-validation">
                            Percentage cannot exceed 100
                          </label>
                        </div>
                      )}
                  </>
                )}

                <div className="pd-field">
                  <label className="pd-label">
                    Currency<span className="pd-req">*</span>
                  </label>
                  <Select
                    className="CurrencySelect pd-select"
                    options={currencyType}
                    value={currencyFilter}
                    // onChange={(e) => {
                    //   setOtherInfo({
                    //     ...otherInfo,
                    //     preferredCurrency: e.value,
                    //   });
                    // }}
                    onChange={handleCurrencyChange}
                  />
                  {requireErrorMessage &&
                  (otherInfo.preferredCurrency === "" ||
                    otherInfo.preferredCurrency === null) ? (
                    <span className="validation pd-validation">
                      {ERROR_MESSAGES}
                    </span>
                  ) : (
                    ""
                  )}
                </div>

                <div className="pd-field">
                  <label className="pd-label">Brand Color</label>
                  <div className="pd-color-row">
                    <input
                      type="color"
                      className="form-control height pd-color-swatch"
                      id="exampleColorInput contactNumber"
                      title="Choose your color"
                      value={otherInfo.brandColor}
                      onChange={(e) =>
                        setOtherInfo({
                          ...otherInfo,
                          brandColor: e.target.value,
                        })
                      }
                    />
                    <span className="pd-color-hex">{otherInfo.brandColor}</span>
                  </div>
                </div>

                <div className="pd-field pd-field-full">
                  <label className="pd-label">Company Logo</label>
                  {otherInfo.logoUrl || CompanyLogo ? (
                    <div className="pd-media-box">
                      <div className="pd-media-preview">
                        {otherInfo.logoUrl && (
                          <img
                            src={otherInfo.logoUrl}
                            className="pd-media-img"
                            alt="Selected Signature"
                          />
                        )}
                        {CompanyLogo && (
                          <img
                            src={CompanyLogo}
                            className="pd-media-img"
                            alt="Selected Signature"
                          />
                        )}
                      </div>
                      <button
                        onClick={() => {
                          setOtherInfo({
                            ...otherInfo,
                            logo: null,
                            logoUrl: null,
                          });
                          setLogo(null);
                        }}
                        className="btn btn-sm btn-danger remove-item-btn pd-btn pd-btn-danger"
                      >
                        <Trash2 size={14} />
                        <span>Remove</span>
                      </button>
                    </div>
                  ) : (
                    <div className="pd-upload-box">
                      <button
                        onClick={() => {
                          setType("Logo");
                        }}
                        className="btn btn-md btn-primary create-item-btn pd-btn pd-btn-outline"
                        data-bs-toggle="modal"
                        data-bs-target="#LogoUploadModal"
                      >
                        <Plus size={15} />
                        <span>Upload Logo</span>
                      </button>
                      <span className="pd-hint">
                        Supported file types are .jpg, .jpeg, .png up to a file
                        size of 2MB.
                      </span>
                    </div>
                  )}
                </div>

                <div className="pd-field pd-field-full">
                  <label className="pd-label">Business Tagline</label>
                  <input
                    maxLength={100}
                    type="text"
                    className="input-text pd-input"
                    placeholder="Business Tagline"
                    value={otherInfo.businessTagline}
                    onChange={(e) =>
                      setOtherInfo({
                        ...otherInfo,
                        businessTagline: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="pd-field">
                  <label className="pd-label">
                    Affiliated Accounting Body Name
                  </label>
                  <input
                    maxLength={100}
                    type="text"
                    className="input-text pd-input"
                    placeholder="Affiliated Accounting Body Name"
                    value={otherInfo.AffiliatedAcBodyName}
                    onChange={(e) =>
                      setOtherInfo({
                        ...otherInfo,
                        AffiliatedAcBodyName: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="pd-field">
                  <label className="pd-label">
                    Website of Affiliated Accounting Body
                  </label>
                  <input
                    maxLength={100}
                    type="text"
                    className="input-text pd-input"
                    placeholder="Website of Affiliated Accounting Body"
                    value={otherInfo.webOfAffiliatedAccount}
                    onChange={(e) =>
                      setOtherInfo({
                        ...otherInfo,
                        webOfAffiliatedAccount: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </div>
          </section>

          {/* ================= SOLE TRADER DETAILS ================= */}
          {basicInfo.businessTypeID === CLIENT_TYPES.Sole_Trader && (
            <section className="pd-card" id="SoleTraderDetails">
              <div className="pd-card-head">
                <span className="pd-card-icon">
                  <User size={18} />
                </span>
                <div>
                  <h2 className="pd-card-title">Sole Trader Details</h2>
                  <p className="pd-card-subtitle">
                    Business owner information.
                  </p>
                </div>
              </div>

              <div className="pd-card-body">
                {officersForm?.map((i, index) => {
                  return (
                    <div className="pd-grid" key={index}>
                      <div className="pd-field">
                        <label className="pd-label">
                          First Name<span className="pd-req">*</span>
                        </label>
                        <input
                          type="text"
                          id="customerName-field"
                          className="input-text pd-input"
                          placeholder="First Name"
                          value={officersForm[index].firstName}
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

                            OnOfficerChange(
                              index,
                              "firstName",
                              capitalizedValue,
                            );
                          }}
                          maxLength={20}
                        />
                        {requireErrorMessage &&
                        (officersForm[index].firstName === null ||
                          officersForm[index].firstName === "") ? (
                          <span className="validation pd-validation">
                            {ERROR_MESSAGES}
                          </span>
                        ) : (
                          ""
                        )}
                      </div>

                      <div className="pd-field">
                        <label className="pd-label">
                          Last Name<span className="pd-req">*</span>
                        </label>
                        <input
                          type="text"
                          id="customerName-field"
                          className="input-text pd-input"
                          placeholder="Last Name"
                          value={
                            officersForm[index].lastName
                              ? officersForm[index].lastName
                                  .charAt(0)
                                  .toUpperCase() +
                                officersForm[index].lastName
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

                            OnOfficerChange(
                              index,
                              "lastName",
                              capitalizedValue,
                            );
                          }}
                        />
                        {requireErrorMessage &&
                        (officersForm[index].lastName === null ||
                          officersForm[index].lastName === "") ? (
                          <span className="validation pd-validation">
                            {ERROR_MESSAGES}
                          </span>
                        ) : (
                          ""
                        )}
                      </div>

                      <div className="pd-field">
                        <label className="pd-label">
                          Phone<span className="pd-req">*</span>
                        </label>
                        <div className="phone-input-div CompanyInfo pd-phone">
                          <Select
                            className="pd-select"
                            options={countryCodes}
                            value={officersForm[index].phoneCountryCodeID}
                            onChange={(e) => {
                              handleOfficerPhoneSelectedValue(e, index);
                            }}
                          />
                          <div className="phone-input-number-div">
                            <input
                              className="input-text pd-input"
                              type="text"
                              placeholder="Phone"
                              value={officersForm[index].phoneNo}
                              onChange={(e) => {
                                // Ensure that the input only contains numeric characters
                                const sanitizedInput = e.target.value
                                  .replace(/[^0-9]/g, "")
                                  .slice(0, 15);
                                OnOfficerChange(
                                  index,
                                  "phoneNo",
                                  sanitizedInput,
                                );
                              }}
                            />
                          </div>
                        </div>
                        {requireErrorMessage &&
                        (officersForm[index].phoneCountryCodeID === null ||
                          officersForm[index].phoneCountryCodeID === null ||
                          officersForm[index].phoneNo === null ||
                          officersForm[index].phoneNo === "") ? (
                          <span className="validation pd-validation">
                            {ERROR_MESSAGES}
                          </span>
                        ) : requireErrorMessage &&
                          !isValidPhoneNumber(officersForm[index].phoneNo) ? (
                          <span className="validation pd-validation">
                            {" "}
                            Invalid phone number{" "}
                          </span>
                        ) : (
                          ""
                        )}
                      </div>

                      <div className="pd-field">
                        <label className="pd-label">
                          Practice Email<span className="pd-req">*</span>
                        </label>
                        <input
                          type="text"
                          id="customerName-field"
                          className="input-text pd-input"
                          placeholder="Email"
                          maxLength={50}
                          value={officersForm[index].emailID}
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
                              OnOfficerChange(index, "emailID", correctedValue);
                              return;
                            }

                            // Update the value in the parent component
                            OnOfficerChange(index, "emailID", enteredValue);
                          }}
                        />
                        {requireErrorMessage &&
                          (officersForm[index].emailID === null ||
                          officersForm[index].emailID === "" ? (
                            <span className="validation pd-validation">
                              {ERROR_MESSAGES}
                            </span>
                          ) : (
                            !isValidEmail(officersForm[index].emailID) && (
                              <span className="validation pd-validation">
                                Invalid email pattern
                              </span>
                            )
                          ))}
                      </div>

                      <div className="pd-field pd-field-full">
                        <label className="pd-label">
                          Practice Address<span className="pd-req">*</span>
                        </label>
                        <input
                          className="input-text pd-input pd-input-clickable"
                          type="text"
                          placeholder="Practice Address"
                          value={
                            concatenatedResidentialAddress[0]
                              ?.officersFullAddress
                          }
                          onMouseDown={(e) => {
                            e.preventDefault();
                            setAddressPopUpTitle("Practice Address");
                            handleOpenRegisterOfficeAddressPopup(e, index);
                          }}
                          autoComplete="off"
                        />
                        {requireErrorMessage &&
                        (concatenatedResidentialAddress[index]
                          .officersFullAddress === null ||
                          concatenatedResidentialAddress[index]
                            .officersFullAddress === "") ? (
                          <span className="validation pd-validation">
                            {ERROR_MESSAGES}
                          </span>
                        ) : (
                          ""
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* ================= PARTNERSHIP DETAILS ================= */}
          {basicInfo.businessTypeID === CLIENT_TYPES.Partnership && (
            <section className="pd-card">
              <div className="pd-card-head">
                <span className="pd-card-icon">
                  <Users size={18} />
                </span>
                <div>
                  <h2 className="pd-card-title">Partnership Details</h2>
                  <p className="pd-card-subtitle">
                    Partner information and authorised signatories.
                  </p>
                </div>
              </div>

              <div className="pd-card-body">
                {officersForm?.map((i, index) => {
                  return (
                    <div
                      className="pd-subcard"
                      id={`Partner_${index}`}
                      key={index}
                    >
                      <div className="pd-subcard-head">
                        <span className="pd-subcard-title">
                          Partner {index + 1}
                        </span>
                        <div className="pd-subcard-actions">
                          <div className="pd-signatory">
                            <Android12Switch
                              id="checkbox"
                              checked={
                                officersForm[index]?.isAuthorisedSignatory
                              }
                              onChange={(e) => handleSwitchToggle(e, index)}
                              color="primary"
                            />
                            <div htmlFor="checkbox" className="isAuthorized">
                              Authorised Signatory
                            </div>
                          </div>
                          {officersForm?.length === 1 ? null : (
                            <button
                              className="btn btn-sm btn-danger pd-btn pd-btn-danger"
                              onClick={() => deleteOfficer(index)}
                            >
                              <Trash2 size={14} />
                              Delete Partner
                            </button>
                          )}
                        </div>
                      </div>

                      {/* {officersForm.length === 0 && (
                        <div className="row fieldset flex-center-div">
                          <div className="col-lg-12 text-right">
                            <span className="validation">
                              {" "}
                              At least 1 authorised partner is required.{" "}
                            </span>
                          </div>
                        </div>
                      )} */}
                      {requireErrorMessage &&
                        AuthorityCount === 0 &&
                        authoritySignatorySignatory && (
                          <span className="validation pd-validation pd-validation-block">
                            {" "}
                            At least 1 authorised partner is required.{" "}
                          </span>
                        )}

                      <div className="pd-grid">
                        <div className="pd-field">
                          <label className="pd-label">
                            First Name<span className="pd-req">*</span>
                          </label>
                          <input
                            type="text"
                            id="customerName-field"
                            className="input-text pd-input"
                            placeholder="First Name"
                            value={officersForm[index]?.firstName}
                            onChange={(e) => {
                              let value = e.target.value;
                              // Remove any non-alphabetic characters
                              value = value.replace(/[0-9]/g, "");
                              // Capitalize the first letter and make the rest lowercase
                              const capitalizedValue =
                                value.charAt(0).toUpperCase() +
                                value.slice(1).toLowerCase();
                              OnOfficerChange(
                                index,
                                "firstName",
                                capitalizedValue,
                              );
                            }}
                            maxLength={20}
                          />
                          {requireErrorMessage &&
                          (officersForm[index].firstName === null ||
                            officersForm[index].firstName === "") ? (
                            <span className="validation pd-validation">
                              {ERROR_MESSAGES}
                            </span>
                          ) : (
                            ""
                          )}
                        </div>

                        <div className="pd-field">
                          <label className="pd-label">
                            Last Name<span className="pd-req">*</span>
                          </label>
                          <input
                            type="text"
                            id="customerName-field"
                            className="input-text pd-input"
                            placeholder="Last Name"
                            value={
                              officersForm[index].lastName
                                ? officersForm[index].lastName
                                    .charAt(0)
                                    .toUpperCase() +
                                  officersForm[index].lastName
                                    .slice(1)
                                    .toLowerCase()
                                : ""
                            }
                            onChange={(e) => {
                              let value = e.target.value;
                              // Remove any non-alphabetic characters
                              value = value.replace(/[0-9]/g, "");
                              // Capitalize the first letter and make the rest lowercase
                              const capitalizedValue =
                                value.charAt(0).toUpperCase() +
                                value.slice(1).toLowerCase();
                              OnOfficerChange(
                                index,
                                "lastName",
                                capitalizedValue,
                              );
                            }}
                            maxLength={20}
                          />
                          {requireErrorMessage &&
                          (officersForm[index]?.lastName === null ||
                            officersForm[index]?.lastName === "") ? (
                            <span className="validation pd-validation">
                              {ERROR_MESSAGES}
                            </span>
                          ) : (
                            ""
                          )}
                        </div>

                        <div className="pd-field">
                          <label className="pd-label">
                            Phone<span className="pd-req">*</span>
                          </label>
                          <div className="phone-input-div pd-phone">
                            <Select
                              className="phone-input-country-code pd-select"
                              options={countryCodes}
                              value={officersForm[index].phoneCountryCodeID}
                              onChange={(e) =>
                                handleOfficerPhoneSelectedValue(e, index)
                              }
                            />
                            <div className="phone-input-number-div">
                              <input
                                className="input-text pd-input"
                                type="text"
                                placeholder="Phone"
                                value={officersForm[index].phoneNo}
                                onChange={(e) => {
                                  // Ensure that the input only contains numeric characters
                                  const sanitizedInput = e.target.value
                                    .replace(/[^0-9]/g, "")
                                    .slice(0, 15);
                                  OnOfficerChange(
                                    index,
                                    "phoneNo",
                                    sanitizedInput,
                                  );
                                }}
                              />
                            </div>
                          </div>
                          {requireErrorMessage &&
                          (officersForm[index].phoneCountryCodeID === null ||
                            officersForm[index].phoneCountryCodeID === null ||
                            officersForm[index].phoneNo === null ||
                            officersForm[index].phoneNo === "") ? (
                            <span className="validation pd-validation">
                              {ERROR_MESSAGES}
                            </span>
                          ) : requireErrorMessage &&
                            !isValidPhoneNumber(officersForm[index].phoneNo) ? (
                            <span className="validation pd-validation">
                              {" "}
                              Invalid phone number{" "}
                            </span>
                          ) : (
                            ""
                          )}
                        </div>

                        <div className="pd-field">
                          <label className="pd-label">
                            Email<span className="pd-req">*</span>
                          </label>
                          <input
                            className="input-text pd-input"
                            type="email"
                            maxLength={50}
                            placeholder="Email"
                            value={officersForm[index]?.emailID}
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
                                OnOfficerChange(
                                  index,
                                  "emailID",
                                  correctedValue,
                                );
                                return;
                              }

                              // Update the email address in the parent component
                              OnOfficerChange(index, "emailID", enteredValue);
                            }}
                          />
                          {requireErrorMessage &&
                            (officersForm[index].emailID === null ||
                            officersForm[index].emailID === "" ? (
                              <span className="validation pd-validation">
                                {ERROR_MESSAGES}
                              </span>
                            ) : (
                              !isValidEmail(officersForm[index].emailID) && (
                                <span className="validation pd-validation">
                                  Invalid email pattern
                                </span>
                              )
                            ))}
                        </div>

                        <div className="pd-field pd-field-full">
                          <label className="pd-label">
                            Residential Address<span className="pd-req">*</span>
                          </label>
                          <input
                            placeholder="Residential Address"
                            className="input-text pd-input pd-input-clickable"
                            type="text"
                            value={
                              concatenatedResidentialAddress[index]
                                ?.officersFullAddress
                            }
                            onMouseDown={(e) => {
                              e.preventDefault();
                              setAddressPopUpTitle("Residential Address");
                              handleOpenRegisterOfficeAddressPopup(e, index);
                            }}
                          />
                          {requireErrorMessage &&
                          (concatenatedResidentialAddress[index]
                            .officersFullAddress === null ||
                            concatenatedResidentialAddress[index]
                              .officersFullAddress === "") ? (
                            <span className="validation pd-validation">
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

                <div className="pd-add-row">
                  <button
                    className="btn btn-md btn-primary create-item-btn pd-btn pd-btn-outline"
                    onClick={addOfficer}
                  >
                    <Plus size={15} />
                    <span>Add Partner</span>
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* ================= OFFICERS (Company / LLP) ================= */}
          {(basicInfo.businessTypeID === CLIENT_TYPES.Company ||
            basicInfo.businessTypeID === CLIENT_TYPES.LLP) && (
            <section className="pd-card">
              <div className="pd-card-head">
                <span className="pd-card-icon">
                  <Users size={18} />
                </span>
                <div>
                  <h2 className="pd-card-title">Officer Details</h2>
                  <p className="pd-card-subtitle">
                    Officer information and authorised signatories.
                  </p>
                </div>
              </div>

              <div className="pd-card-body">
                {officersForm?.map((i, index) => {
                  return (
                    <div
                      className="pd-subcard"
                      id={`Officers${index}`}
                      key={index}
                    >
                      <div className="pd-subcard-head">
                        <span className="pd-subcard-title">
                          Officer {index + 1}
                        </span>
                        <div className="pd-subcard-actions">
                          <div className="pd-signatory">
                            <Android12Switch
                              id="checkbox"
                              checked={
                                officersForm[index]?.isAuthorisedSignatory
                              }
                              onChange={(e) => handleSwitchToggle(e, index)}
                              color="primary"
                            />
                            <div htmlFor="checkbox" className="isAuthorized">
                              Authorised Signatory
                            </div>
                          </div>
                          {officersForm?.length === 1 ? null : (
                            <button
                              className="btn btn-sm btn-danger pd-btn pd-btn-danger"
                              onClick={() => deleteOfficer(index)}
                            >
                              <Trash2 size={14} />
                              Delete Officer
                            </button>
                          )}
                        </div>
                      </div>

                      {officersForm.length === 0 && (
                        <span className="validation pd-validation pd-validation-block">
                          {" "}
                          At least 1 authorised officer is required.{" "}
                        </span>
                      )}
                      {requireErrorMessage &&
                        AuthorityCount === 0 &&
                        authoritySignatorySignatory && (
                          <span className="validation pd-validation pd-validation-block">
                            {" "}
                            At least 1 authorised officer is required.{" "}
                          </span>
                        )}

                      <div className="pd-grid">
                        <div className="pd-field">
                          <label className="pd-label">
                            First Name<span className="pd-req">*</span>
                          </label>
                          <input
                            type="text"
                            id="customerName-field"
                            className="input-text pd-input"
                            placeholder="First Name"
                            value={officersForm[index]?.firstName}
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

                              OnOfficerChange(
                                index,
                                "firstName",
                                capitalizedValue,
                              );
                            }}
                            maxLength={20}
                          />
                          {requireErrorMessage &&
                          (officersForm[index].firstName === null ||
                            officersForm[index].firstName === "") ? (
                            <span className="validation pd-validation">
                              {ERROR_MESSAGES}
                            </span>
                          ) : (
                            ""
                          )}
                        </div>

                        <div className="pd-field">
                          <label className="pd-label">
                            Last Name<span className="pd-req">*</span>
                          </label>
                          <input
                            type="text"
                            id="customerName-field"
                            className="input-text pd-input"
                            placeholder="Last Name"
                            value={
                              officersForm[index].lastName
                                ? officersForm[index].lastName
                                    .charAt(0)
                                    .toUpperCase() +
                                  officersForm[index].lastName
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

                              OnOfficerChange(
                                index,
                                "lastName",
                                capitalizedValue,
                              );
                            }}
                            maxLength={20}
                          />
                          {requireErrorMessage &&
                          (officersForm[index].lastName === null ||
                            officersForm[index].lastName === "") ? (
                            <span className="validation pd-validation">
                              {ERROR_MESSAGES}
                            </span>
                          ) : (
                            ""
                          )}
                        </div>

                        <div className="pd-field">
                          <label className="pd-label">
                            Role<span className="pd-req">*</span>
                          </label>
                          <input
                            maxLength={30}
                            type="text"
                            id="customerName-field"
                            className="input-text pd-input"
                            placeholder="Role"
                            value={officersForm[index]?.officerRole}
                            onChange={(e) =>
                              OnOfficerChange(
                                index,
                                "officerRole",
                                e.target.value.charAt(0).toUpperCase() +
                                  e.target.value.slice(1).toLowerCase(),
                              )
                            }
                          />
                          {requireErrorMessage &&
                          (officersForm[index].officerRole === null ||
                            officersForm[index].officerRole === "") ? (
                            <span className="validation pd-validation">
                              {ERROR_MESSAGES}
                            </span>
                          ) : (
                            ""
                          )}
                        </div>

                        <div className="pd-field">
                          <label className="pd-label">
                            Appointed On<span className="pd-req">*</span>
                          </label>
                          <div className="pd-datepicker">
                            <DatePicker
                              minDate={minDate}
                              maxDate={maxDate}
                              format="dd/MM/y"
                              dayPlaceholder="dd"
                              monthPlaceholder="mm"
                              yearPlaceholder="yyyy"
                              value={officersForm[index]?.appointedOn}
                              onChange={(e) =>
                                OnOfficerChange(index, "appointedOn", e)
                              }
                            />
                          </div>
                          {/* {InvalidAppointedOnDate &&
                              !isValidDate(
                                officersForm[index]?.appointedOn
                              ) ? (
                              <span className="validation">
                                Invalid Date
                              </span>
                            ) : null} */}
                          {requireErrorMessage &&
                          (officersForm[index]?.appointedOn === null ||
                            officersForm[index]?.appointedOn === "") ? (
                            <span className="validation pd-validation">
                              {ERROR_MESSAGES}
                            </span>
                          ) : (
                            ""
                          )}
                        </div>

                        <div className="pd-field">
                          <label className="pd-label">Phone</label>
                          <div className="phone-input-div pd-phone">
                            <Select
                              className="phone-input-country-code pd-select"
                              options={countryCodes}
                              value={officersForm[index].phoneCountryCodeID}
                              onChange={(e) => {
                                handleOfficerPhoneSelectedValue(e, index);
                              }}
                            />
                            <div className="phone-input-number-div">
                              <input
                                className="input-text pd-input"
                                type="text"
                                placeholder="Phone"
                                value={officersForm[index].phoneNo || ""}
                                // onChange={(e) => {
                                //   // Ensure that the input only contains numeric characters
                                //   const sanitizedInput = e.target.value
                                //     .replace(/[^0-9]/g, "")
                                //     .slice(0, 15);
                                //   OnOfficerChange(
                                //     index,
                                //     "phoneNo",
                                //     sanitizedInput
                                //   );
                                // }}
                                onChange={(e) => {
                                  // Ensure that the input only contains numeric characters
                                  const sanitizedInput = e.target.value
                                    .replace(/\[^0-9\]/g, "")
                                    .slice(0, 15)
                                    .trim();
                                  const updatedPhoneNo =
                                    sanitizedInput !== ""
                                      ? sanitizedInput
                                      : null;
                                  OnOfficerChange(
                                    index,
                                    "phoneNo",
                                    updatedPhoneNo,
                                  );
                                }}
                              />
                            </div>
                          </div>
                          {requireErrorMessage &&
                            officersForm[index].phoneNo !== null &&
                            officersForm[index].phoneNo !== "" &&
                            officersForm[index].phoneNo !== undefined &&
                            !isValidPhoneNumber(
                              officersForm[index].phoneNo,
                            ) && (
                              <span className="validation pd-validation">
                                {" "}
                                Invalid phone number{" "}
                              </span>
                            )}
                        </div>

                        <div className="pd-field">
                          <label className="pd-label">
                            Email<span className="pd-req">*</span>
                          </label>
                          <input
                            className="input-text pd-input"
                            type="email"
                            maxLength={50}
                            placeholder="Email"
                            value={officersForm[index]?.emailID}
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
                                OnOfficerChange(
                                  index,
                                  "emailID",
                                  correctedValue,
                                );
                                return;
                              }

                              // Update the email address in the parent component
                              OnOfficerChange(index, "emailID", enteredValue);
                            }}
                          />
                          {requireErrorMessage &&
                            (officersForm[index].emailID === null ||
                            officersForm[index].emailID === "" ? (
                              <span className="validation pd-validation">
                                {ERROR_MESSAGES}
                              </span>
                            ) : (
                              !isValidEmail(officersForm[index].emailID) && (
                                <span className="validation pd-validation">
                                  Invalid email pattern
                                </span>
                              )
                            ))}
                        </div>

                        <div className="pd-field pd-field-full">
                          <label className="address-label pd-label">
                            Correspondence Address
                            <span className="pd-req">*</span>
                          </label>
                          <input
                            placeholder="Correspondence Address"
                            className="input-text pd-input pd-input-clickable"
                            type="text"
                            value={
                              concatenatedResidentialAddress[index]
                                ?.officersFullAddress
                            }
                            onMouseDown={(e) => {
                              e.preventDefault();
                              setAddressPopUpTitle("Correspondence Address");
                              handleOpenRegisterOfficeAddressPopup(e, index);
                            }}
                            autoComplete="off"
                          />
                          {requireErrorMessage &&
                          (concatenatedResidentialAddress[index]
                            .officersFullAddress === null ||
                            concatenatedResidentialAddress[index]
                              .officersFullAddress === "") ? (
                            <span className="validation pd-validation">
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

                <div className="pd-add-row">
                  <button
                    className="btn btn-md btn-primary create-item-btn pd-btn pd-btn-outline"
                    onClick={addOfficer}
                  >
                    <Plus size={15} />
                    <span>Add Officer</span>
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* ================= FOOTER ACTIONS ================= */}
          {errorMessage ? (
            <span className="validation pd-footer-error">{errorMessage}</span>
          ) : (
            ""
          )}

          <div className="pd-footer-bar">
            <button
              onClick={() => {
                AddUpdateClickedPracticeDetails();
              }}
              className="btn btn-md create-item-btn update-practice pd-btn pd-btn-primary"
            >
              <Save size={16} />
              <span>Update Practice Details</span>
            </button>
          </div>
        </div>

        <ConfirmModel
          openErrorModal={openErrorModal}
          openSuccessModal={openSuccessModal}
          modelRequestData={modelRequestData}
          UpdatedStatus={handleConfirmButton}
          modelAction={modelAction}
        />
        <AddressModal
          title={addressPopUpTitle}
          fullAddress={fullAddress}
          setFullAddress={setFullAddress}
          openAddressPopUp={openAddressPopUp}
          address={address}
          handleAddressPopUpClose={handleAddressPopUpClose}
          setAddress={setAddress}
          setOpenAddressPopUp={setOpenAddressPopUp}
          setAddressUpdatedDatetime={setAddressUpdatedDatetime}
        />
        <Upload_image_modal
          class="modal fade"
          id="SignatureUploadModel"
          tabIndex="-1"
          aria_hidden="true"
          selectedImage={selectedImage}
          setSelectedImage={setSelectedImage}
          handleImageUpload={handleImageUpload}
          setBasicInfo={setBasicInfo}
          basicInfo={basicInfo}
        />
        <Upload_Logo_Modal
          class="modal fade"
          id="LogoUploadModal"
          tabIndex="-1"
          aria_hidden="true"
          selectedImage={selectedImage}
          setSelectedImage={setSelectedImage}
          handleImageUpload={handleImageUpload}
          setOtherInfo={setOtherInfo}
          otherInfo={otherInfo}
        />
        <SuccessModal
          handleClose={handleClose}
          setDismissModal={setDismissModal}
          setOpenSuccessModal={setOpenSuccessModal}
          openSuccessModal={openSuccessModal}
          modelAction={modelAction}
          message={"Practice " + basicInfo.tradingName}
        />

        <InstructionModal
          open={modalOpen}
          handleClose={handleCloseModal}
          instructions={instructions}
          // alertMessage={alertMessage} // Pass alert message to InstructionModal
        />
      </div>
      <Footer />
    </>
  );
};

export default Update_Practice_Details;
