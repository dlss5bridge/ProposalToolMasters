/* global $ */
import React, { useContext, useEffect, useState } from "react";
import "../proposals/Proposals.css";
import "../../pages/user/UsersStyle.css";
import "./OrganisationViewDetails-redesign.css";
import { useSelector } from "react-redux";
import CommonButtonComponent from "../../components/CommonButtonComponent";
import { Row, Col, Card, CardBody } from "reactstrap";
import {
  DeleteUser,
  GetInviteUsersList,
} from "../../redux/Services/Setting/InviteUserApi";
import ConfirmModel from "../../components/ConfirmationBox";
import { Tooltip } from "@mui/material";
import SuccessModal from "../../components/SuccessModal";
import { AuthContextProvider } from "../../AuthContext/AuthContext";
import ErrorModel from "../../components/ErrorModel";
import Footer from "../../components/Footer";
import UsersModel from "../Settings/users/UsersModel";
import { useLocation, useNavigate } from "react-router-dom";
import {
  GetOrganisationInformationModel,
  GetOrganisationPlanList,
} from "../../redux/Services/Setting/Organisation";
import { CountryCode } from "../../redux/Services/CountryApi";
import { GetIncorporatedInLookUpList } from "../../redux/Services/Master/IncorporatedInLookUpList";
import { GetCurrencyTypeList } from "../../redux/Services/Master/CurrencyTypeLookUpList";
import { CLIENT_TYPES } from "../../Middleware/enums";
import PaginationComponent from "../../components/PaginationModel";
import SubscriptionView from "../../components/SubscriptionView";
import {
  ChoosePlanApi,
  CreateStripeCheckoutSession,
} from "../../redux/Services/Setting/PaymentGatewayApi";
import {
  GetUserSubscriptionPackageModel,
  UpdateUserSubscriptionPackage,
} from "../../redux/Services/Subscription/UserListApi";
import SubscriptionPackageModel from "../subscription/subscription_package/SubscriptionPackageModel";
import OrganisationSubscriptionPackageDetails from "../../components/OrganisationSubscriptionPackageDetails";
const OrganisationViewDetails = () => {
  let getInviteUsersListApiCallCount = 0;
  // A] States Declaration :
  const [inviteUsersList, setInviteUsersList] = useState([]);
  const [openPurchaseModal, setOpenPurchaseModal] = React.useState(false);
  const location = useLocation();
  const [subScriptionPlaneList, setSubScriptionPlaneList] = useState([]);

  const [UserListCount, setUserListCount] = useState([]);
  const [currentPageUsers, setCurrentPageUsers] = useState(1);
  const totalUserPage = Math.ceil(UserListCount / 10); // Calculate the total number of pages based on listCount
  const [saveLocationState, setSaveLocationState] = useState(location.state);
  const [modelRequestData, setModelRequestData] = useState({
    userName: null,
    organisationKeyID: null,
    inviteUserKeyID: null,
    Action: null,
    userKeyID: null,
    status: null,
  });
  const [professionTypeValue, setProfessionTypeValue] = useState("");
  const [concatenatedRegisterAddress, setConcatenatedRegisterAddress] =
    useState("");
  const [concatenatedTradingAddress, setConcatenatedTradingAddress] =
    useState("");
  const [concatenatedResidentialAddress, setConcatenatedResidentialAddress] =
    useState([{ officersFullAddress: "" }]);
  const [isAddUpdateActionDone, setIsAddUpdateActionDone] = useState(false);
  const [openSuccessModal, setOpenSuccessModal] = React.useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [currencyType, setCurrencyType] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchKeywordUsers, setSearchKeywordUsers] = useState("");
  const [requireErrorMessage, setRequireErrorMessage] = useState(false);
  const [
    requireErrorMessageForESignature,
    setRequireErrorMessageForESignature,
  ] = useState(false);

  const [primarySortDirectionUsers, setPrimarySortDirectionUsers] =
    useState(null); //setPrimarySortDirectionUsers
  const [primaryUserSortDirectionObj, setPrimaryUserSortDirectionObj] =
    useState({
      UserNameTypeSort: null,
      RoleTypeSort: null,
      AcceptanceStatusTypeSort: null,
      EmailTypeSort: null,
    });
  const [subScriptionActiveList, setSubScriptionActiveList] = useState({});
  const [showPackageModal, setShowPackageModal] = useState(false);
  const [UserSortType, setUserSortType] = useState("");
  const common = useSelector((state) => state.Storage); //Getting Logged Users Details From Persist Storage of redux hooks
  const [openErrorModal, setOpenErrorModal] = useState(false);
  const {
    setTopbar,
    prospectName,
    setLoader,
    EngagementName,
    proposalName,
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
    GetCustomDate,
    formatValue,
    formatValueWithoutCurrencySymbol,
    scrollUpDownByElementID,
  } = useContext(AuthContextProvider);
  const [chooseApiData, setChooseApiData] = useState();
  const pageSize = isMobile ? isMobileRecords : desktopRecords;
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
    signatoryName: null,
    signatoryImage: null,
    searchCompany: null,
    regOfficeAddress: null,
  });
  const [otherInfo, setOtherInfo] = useState({
    orgOtherInfoId: null,
    VATReg: null,
    vatNumber: null,
    preferredCurrency: 1,
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
    incInID: 0,
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
  const [subscriptionPackageObj, setSubscriptionPackageObj] = useState({
    ospKeyID: null,
    remainingESignatures: null,
    remainingQuotesPerMonth: null,
    apiIntegration: null,
    subscriptionPackageKeyID: null,
    packageName: "",
    prepareQuote: false,
    sendQuote: false,
    quotesPerMonth: null,
    prepareContract: false,
    sendContract: false,
    signContract: false,
    eSignaturePerMonth: "",
    enablePdfToCsv: false,
    noOfPages: null,
    yearlyValuePlan: "",
    discountPercentage: "",
    discountPrice: "",
    subscriptionStartDate: "",
    monthFree: "",
    getMonths: "",
    inPriceOfMonth: "",
    isMailBox: false,
    paymentFrequencyID: null,
    renewDate: "",
    paymentStatus: "",
    subscriptionStatus: "",
    subscriptionPackageObj: "",
    hostedInvoiceUrl: "",
    invoiceKeyID: "",
  });
  const [officersForm, setOfficers] = useState([
    {
      organisationKeyID: saveLocationState?.OrgKeyID,
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
      isAuthorisedSignatory: 0,
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
  const navigate = useNavigate();

  const [incorporatedInList, setIncorporatedInList] = useState([]);

  // B] Initial useEffect :
  // 1) Will Call Initial Api Like List Api
  useEffect(() => {
    setTopbar("block");
    GetInviteUsersListData(1);
    GetIncorporatedInLookUpListData();
    GetCurrencyListData();
  }, [common.organisationKeyID]);

  useEffect(() => {
    if (
      saveLocationState?.Action !== undefined &&
      saveLocationState?.Action !== null
    ) {
      GetOrganisationInformationModelData(saveLocationState?.OrgKeyID);
      GetOrganisationPlanListData(1);
    }
  }, [saveLocationState]);
  //2) This useEffect will trigger when we successfully add or update record from popup model
  useEffect(() => {
    if (isAddUpdateActionDone) {
      if (modelRequestData.Action === null) {
        setCurrentPage(1);
        GetInviteUsersListData(1, null, null);
      } else {
        GetInviteUsersListData(currentPage);
      }
      setIsAddUpdateActionDone(false);
    }
  }, [isAddUpdateActionDone]);
  // const handleOpenSubscriptionModel = (subscriptionObj) => {
  //   setActiveOrganizationKeyId(subscriptionObj.ospKeyID);
  //   // setSubscriptionModal(true)
  // };
  const handleClosePurchaseModel = () => {
    setOpenPurchaseModal(false);
  };
  const handleOpenPurchaseModel = async (value) => {
    // setActiveOrganizationKeyIdForUpgradePlan(value.organisationKeyID)
    await ChoosePlanApiModelData();
    navigate("/ChoosePlan", {
      state: { organizationKeyId: saveLocationState?.OrgKeyID },
    });
    // If API call is successful, set state to open the modal
    // setOpenPurchaseModal(true);
  };

  const handleOpenSubscriptionModel = (subscriptionObj) => {
    GetSubscriptionPackageModelData(subscriptionObj.ospKeyID);
    // setSubscriptionModal(true)
  };

  const handleOrganisationSubscriptionPackageModel = async () => {
    setShowPackageModal(true);
    await GetSubscriptionPackageModelData(subScriptionActiveList.ospKeyID);
    await GetOrganisationPlanListData(1);
  };
  const GetSubscriptionPackageModelData = async (id) => {
    if (!id) {
      return;
    }
    //..............Subscription package Edit Data Api...................
    try {
      const data = await GetUserSubscriptionPackageModel(id);
      if (data?.data?.statusCode === 200) {
        if (data?.data?.responseData?.data) {
          const ModelData = data?.data?.responseData?.data;
          setSubscriptionPackageObj({
            ...subscriptionPackageObj,
            ospKeyID: ModelData.ospKeyID,
            apiIntegration: ModelData.apiIntegration,
            remainingESignatures: ModelData.remainingESignatures,
            remainingQuotesPerMonth: ModelData.remainingQuotesPerMonth,
            subscriptionPackageKeyID: ModelData.subscriptionPackageKeyID,
            packageName: ModelData.packageName,
            prepareQuote: ModelData.prepareQuote,
            sendQuote: ModelData.sendQuote,
            quotesPerMonth: ModelData.quotesPerMonth,
            prepareContract: ModelData.prepareContract,
            sendContract: ModelData.sendContract,
            signContract: ModelData.signContract,
            eSignaturePerMonth: ModelData.eSignaturePerMonth,
            enablePdfToCsv: ModelData.enablePdfToCsv,
            noOfPages: ModelData.noOfPages,
            yearlyValuePlan: ModelData.yearlyValuePlan,
            discountPercentage: ModelData.discountPercentage,
            discountPrice: ModelData.discountPrice,
            monthFree: ModelData.monthFree,
            getMonths: ModelData.getMonths,
            inPriceOfMonth: ModelData.inPriceOfMonth,
            isMailBox: ModelData.isMailBox,
            paymentFrequencyID: ModelData.paymentFrequencyID,
            subscriptionStartDate: ModelData.subscriptionStartDate,
            renewDate: ModelData.renewDate,
            paymentStatus: ModelData.paymentStatus,
            subscriptionStatus: ModelData.subscriptionStatus,
            subscriptionPackageObj: ModelData.subscriptionPackageObj,
            hostedInvoiceUrl: ModelData.hostedInvoiceUrl,
            invoiceKeyID: ModelData.invoiceKeyID,
          });
        }
      } else {
        // setErrorMessage(data?.data?.errorMessage);
      }
    } catch (error) {
      console.log(error);
    }
  };

  //2]Add Update Button Click Function
  const SubscriptionPackageAddUpdateBtnClicked = () => {
    //Check Validations will be done here

    if (
      subscriptionPackageObj.packageName === undefined ||
      subscriptionPackageObj.packageName === "" ||
      subscriptionPackageObj.packageName === null
    ) {
      scrollUpDownByElementID("PackageName");
      setRequireErrorMessage(true);
      return false; // Return false or handle your error logic here if needed.
    } else {
      setRequireErrorMessage(""); // Clear the error message if there are no errors.
    }
    if (
      subscriptionPackageObj.enablePdfToCsv &&
      (subscriptionPackageObj.pages === undefined ||
        subscriptionPackageObj.pages === "" ||
        subscriptionPackageObj.pages === null)
    ) {
      scrollUpDownByElementID("Pages");
      setRequireErrorMessage(true);
      return false; // Return false or handle your error logic here if needed.
    } else {
      setRequireErrorMessage(""); // Clear the error message if there are no errors.
    }
    if (subscriptionPackageObj.sendContract === true) {
      if (Number(subscriptionPackageObj.eSignaturePerMonth) < 1) {
        scrollUpDownByElementID("ESignature");
        setRequireErrorMessageForESignature(true);
        return false;
      }
    }
    const { yearlyValuePlan, discountPriceMonth, discountPriceYear } =
      subscriptionPackageObj;

    if (
      Number(yearlyValuePlan) > 20000 ||
      Number(discountPriceMonth) > 20000 ||
      Number(discountPriceYear) > 20000
    ) {
      let exceededValue = "";

      if (Number(yearlyValuePlan) > 20000) {
        exceededValue = `The Yearly Plan Value (${yearlyValuePlan})`;
      } else if (Number(discountPriceMonth) > 20000) {
        exceededValue = `The Monthly Discount Price (${discountPriceMonth})`;
      } else if (Number(discountPriceYear) > 20000) {
        exceededValue = `The Yearly Discount Price (${discountPriceYear})`;
      }

      setErrorMessage(
        `${exceededValue
          ?.toString()
          .replace(
            /\B(?=(\d{3})+(?!\d))/g,
            ",",
          )} exceeds Stripe's transaction limit of £ 20,000. Please enter a lower amount.`,
      );

      scrollUpDownByElementID("ErrorMessage");
      return false;
    }

    scrollUpDownByElementID("ErrorMessage");
    // Clear the error message and set close to true if there are no errors.
    setErrorMessage("");

    // Preparing Object For Add Update and if any modification then it will done here
    const ApiRequest_ParamsObj = {
      //global level params : fixed
      // Action: modelRequestData.Action,
      userKeyID: common.userKeyID,
      // organisationKeyID: common.organisationKeyID,

      //form level params : fixed
      // subscriptionPackageKeyID: props.modelRequestData.subscriptionPackageKeyID, //will change module wise
      // subscriptionPackageKeyID: subscriptionPackageObj.subscriptionPackageKeyID, //will change module wise
      ospKeyID: subscriptionPackageObj.ospKeyID,
      //form level params : will change according to module
      apiIntegration: subscriptionPackageObj.apiIntegration,
      packageName: subscriptionPackageObj.packageName,
      prepareQuote: subscriptionPackageObj.prepareQuote,
      sendQuote: subscriptionPackageObj.sendQuote,
      quotesPerMonth:
        subscriptionPackageObj.quotesPerMonth === ""
          ? null
          : subscriptionPackageObj.quotesPerMonth,
      prepareContract: subscriptionPackageObj.prepareContract,
      enablePdfToCsv: subscriptionPackageObj.enablePdfToCsv,
      noOfPages: subscriptionPackageObj.pages
        ? subscriptionPackageObj.pages
        : 0,
      sendContract: subscriptionPackageObj.sendContract,
      signContract: subscriptionPackageObj.sendContract,
      isMailBox: subscriptionPackageObj.isMailBox,
      eSignaturePerMonth:
        subscriptionPackageObj.eSignaturePerMonth === ""
          ? null
          : subscriptionPackageObj.eSignaturePerMonth,
      yearlyValuePlan:
        subscriptionPackageObj.yearlyValuePlan === ""
          ? null
          : Number(subscriptionPackageObj.yearlyValuePlan),

      // subscriptionOffers: subscriptionPackageObj.isFreePackage
      //   ? null
      //   : [
      //     {
      //       paymentFrequencyID: 4, // Monthly
      //       discountPercentage:
      //         subscriptionPackageObj.discountPercentageMonthCheck
      //           ? subscriptionPackageObj.discountPercentageMonth === ""
      //             ? null
      //             : Number(subscriptionPackageObj.discountPercentageMonth)
      //           : 0,
      //       discountPrice: subscriptionPackageObj.discountPriceMonthCheck
      //         ? subscriptionPackageObj.discountPriceMonth === ""
      //           ? null
      //           : Number(subscriptionPackageObj.discountPriceMonth)
      //         : 0,
      //       monthFree: subscriptionPackageObj.monthFreeMonthCheck
      //         ? subscriptionPackageObj.monthFreeMonth === ""
      //           ? null
      //           : Number(subscriptionPackageObj.monthFreeMonth)
      //         : 0,
      //       getMonths: subscriptionPackageObj.getMonthsMonthCheck
      //         ? subscriptionPackageObj.getMonthsMonth === ""
      //           ? null
      //           : Number(subscriptionPackageObj.getMonthsMonth)
      //         : 0,
      //       inPriceOfMonth:
      //         subscriptionPackageObj.inPriceOfMonthMonth === ""
      //           ? null
      //           : Number(subscriptionPackageObj.inPriceOfMonthMonth),
      //     },
      //     {
      //       paymentFrequencyID: 1, // Yearly
      //       discountPercentage:
      //         subscriptionPackageObj.discountPercentageYearCheck
      //           ? subscriptionPackageObj.discountPercentageYear === ""
      //             ? null
      //             : Number(subscriptionPackageObj.discountPercentageYear)
      //           : 0,
      //       discountPrice: subscriptionPackageObj.discountPriceYearCheck
      //         ? subscriptionPackageObj.discountPriceYear === ""
      //           ? null
      //           : Number(subscriptionPackageObj.discountPriceYear)
      //         : 0,
      //       monthFree: subscriptionPackageObj.monthFreeYearCheck
      //         ? subscriptionPackageObj.monthFreeYear === ""
      //           ? null
      //           : Number(subscriptionPackageObj.monthFreeYear)
      //         : 0,
      //       getMonths: subscriptionPackageObj.getMonthsYearCheck
      //         ? subscriptionPackageObj.getMonthsYear === ""
      //           ? null
      //           : Number(subscriptionPackageObj.getMonthsYear)
      //         : 0,
      //       inPriceOfMonth:
      //         subscriptionPackageObj.inPriceOfMonthYear === ""
      //           ? null
      //           : Number(subscriptionPackageObj.inPriceOfMonthYear),
      //     },
      //   ],
    };
    AddUpdateSubscriptionPackageData(ApiRequest_ParamsObj);
    // console.log("ApiRequest_ParamsObj", ApiRequest_ParamsObj);
  };

  // 3) Add Update Subscription package Data Api
  const AddUpdateSubscriptionPackageData = async (ApiRequest_ParamsObj) => {
    setLoader(true);
    try {
      const response =
        await UpdateUserSubscriptionPackage(ApiRequest_ParamsObj);
      if (response) {
        setLoader(false);
        if (response?.data?.statusCode === 200) {
          // $('#' + props.id).modal('hide')
          // uncomment upper code for hide

          if (ApiRequest_ParamsObj.Action === null) {
            setOpenSuccessModal(true);
            setIsAddUpdateActionDone(true);
            navigate("/sub-package");
          } else {
            setOpenSuccessModal(true);
            setIsAddUpdateActionDone(true);
            navigate("/sub-package");
          }
        } else {
          setErrorMessage(response?.response?.data?.errorMessage);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  // C] Calling All Api's like List and other Here :
  // 1) Get Users List Data
  const GetInviteUsersListData = async (
    i,
    searchKeywordValue,
    sortValue,
    UserSort,
  ) => {
    setLoader(true);
    try {
      const data = await GetInviteUsersList({
        pageSize: 10,
        pageNo: i - 1,
        organisationKeyID: saveLocationState?.OrgKeyID,
        userKeyID: common.userKeyID,
        searchKeyword:
          searchKeywordValue === undefined
            ? searchKeywordUsers
            : searchKeywordValue,
        primarySortDirection:
          sortValue === undefined ? primarySortDirectionUsers : sortValue,
        PrimarySortColumnName:
          UserSort == undefined || UserSort == null || UserSort == ""
            ? UserSortType
            : UserSort,
      });
      if (data) {
        if (data?.data?.statusCode === 200) {
          setLoader(false);
          getInviteUsersListApiCallCount = 0;
          if (data?.data?.responseData?.data) {
            const totalCount = data.data.totalCount;
            const InviteUsersListData = data.data.responseData.data;
            setUserListCount(totalCount);
            setInviteUsersList(InviteUsersListData);
          }
        } else {
          if (getInviteUsersListApiCallCount < maxCountToRecallApi) {
            getInviteUsersListApiCallCount += 1;
            setTimeout(function () {
              GetInviteUsersListData(
                i,
                searchKeywordValue,
                sortValue,
                UserSort,
              );
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
  const RedirectStripeCheckout = (subscription) => {
    CreateStripeCheckoutSessionRedirection(
      common.userKeyID,
      subscription.invoiceKeyID,
    );
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
        setLoader(false);
        const sessionURL = data.responseData.sessionURL;

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
  // 2]Get Organisation details api
  const GetOrganisationInformationModelData = async (id) => {
    if (!id) {
      return;
    }
    setLoader(true);
    const response = await GetOrganisationInformationModel(id);
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
        const professionTypeName = ModelData.professionTypeList.map((item) => {
          return item.professionTypeName;
        });

        setProfessionTypeValue(professionTypeName);
        setOtherInfo({
          orgOtherInfoId: ModelData.otherInformation.orgOtherInfoId,
          VATReg: ModelData.otherInformation.isVatRegistered,
          vatNumber: ModelData.otherInformation.vatNumber,
          preferredCurrency: ModelData.otherInformation.preferredCurrencyId,
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
            organisationKeyID: saveLocationState?.OrgKeyID,
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
            addressLine1: ModelData.companyDetails.companyAddress?.addressLine1,
            addressLine2: ModelData.companyDetails.companyAddress?.addressLine2,
            locality: ModelData.companyDetails.companyAddress?.locality,
            region: ModelData.companyDetails.companyAddress?.region,
            countryId: ModelData.companyDetails.companyAddress?.countryId,
            postcode: ModelData.companyDetails.companyAddress?.postcode,
            countryName: ModelData.companyDetails.companyAddress?.countryName,
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
  const GetPlanList = () => {
    GetOrganisationPlanListData(1);
  };
  useEffect(() => {
    if (location.state?.organizationKeyId !== null) {
      GetOrganisationPlanListData(1, location.state?.organizationKeyId);
    }
  }, [location.state]);

  const GetOrganisationPlanListData = async (i, orgId) => {
    setLoader(true);
    const pageNoList = i - 1;
    let getOrganisationListCallCount = 0;
    try {
      const data = await GetOrganisationPlanList({
        pageSize: pageSize,
        pageNo: pageNoList,
        userKeyID: common.userKeyID,
        organisationKeyID: saveLocationState?.OrgKeyID || orgId,
      });

      if (data) {
        if (data?.data?.statusCode === 200) {
          setLoader(false);
          if (data?.data?.responseData) {
            const SubScriptionListData = data?.data?.responseData;
            const totalCount = data.data.totalCount;
            if (pageNoList > 0 && SubScriptionListData.length === 0) {
              let newPaneNo = Number(pageNoList);
              if (newPaneNo > 1) {
                newPaneNo = newPaneNo - 1;
              }
              GetOrganisationPlanListData(newPaneNo);
              setCurrentPage(pageNoList);
              return;
            }
            setListCount(totalCount);
            // Extract planList and store in subscriptionList state
            setSubScriptionPlaneList(SubScriptionListData?.planList || []);
            setSubScriptionActiveList(SubScriptionListData?.activePlan || []);
          }
        } else {
          if (getOrganisationListCallCount < maxCountToRecallApi) {
            getOrganisationListCallCount += 1;
            setTimeout(function () {
              GetOrganisationPlanListData(i);
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
          officersForm.forEach((element) => {
            element.countryCodeID = CurrencyList[0].countryCodeId;
          });
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

  // E] Event Handling Functions will call here.
  // 1) On Click Users Add Button
  const UsersAddBtnClicked = (users) => {
    {
      setModelRequestData({
        ...modelRequestData,
        organisationKeyID: saveLocationState?.OrgKeyID,
        Action: null,
      });
    }
  };

  // Update Function Modal
  // 2) On Click user Status Button
  const InviteUserChangeStatusData = async () => {
    setLoader(true);
    if (modelRequestData.Action === "Delete") {
      try {
        const Data = await DeleteUser(
          modelRequestData.inviteUserKeyID,
          common.userKeyID,
        );
        if (Data) {
          setLoader(false);
          if (Data?.data?.statusCode === 200) {
            setSuccessMessage(`User ${modelRequestData.userName}`);
            $("#" + "ConfirmModel").one("hidden.bs.modal", () => {
              setOpenSuccessModal(true);
            });
            $("#" + "ConfirmModel").modal("hide");
          } else {
            setErrorMessage(Data?.response?.data?.errors?.InviteUserKeyID[0]);
            setOpenErrorModal(true);
          }

          GetInviteUsersListData(currentPage);
        }
      } catch (error) {
        console.log(error);
      }
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

  // E] Sorting & handle Function
  const handleUserSort = (sortValue, UserSort) => {
    if (UserSort == "FirstName") {
      setPrimarySortDirectionUsers(sortValue);
      setPrimaryUserSortDirectionObj({
        ...primaryUserSortDirectionObj,
        UserNameTypeSort: sortValue,
      });
      setCurrentPage(1);
      GetInviteUsersListData(1, searchKeywordUsers, sortValue, UserSort);
    } else if (UserSort == "RoleName") {
      setPrimarySortDirectionUsers(sortValue);
      setPrimaryUserSortDirectionObj({
        ...primaryUserSortDirectionObj,
        RoleTypeSort: sortValue,
      });
      setCurrentPage(1);
      GetInviteUsersListData(1, searchKeywordUsers, sortValue, UserSort);
    } else if (UserSort == "Email") {
      setPrimarySortDirectionUsers(sortValue);
      setPrimaryUserSortDirectionObj({
        ...primaryUserSortDirectionObj,
        EmailTypeSort: sortValue,
      });
      setCurrentPage(1);
      GetInviteUsersListData(1, searchKeywordUsers, sortValue, UserSort);
    }
  };
  const HandleSearch = (e) => {
    const searchKeywordValue = e.target.value;
    setSearchKeywordUsers(searchKeywordValue);
    setCurrentPage(1);
    GetInviteUsersListData(1, searchKeywordValue);
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
  const handleClose = () => {
    $("#" + "ConfirmModel").modal("hide");
    setOpenSuccessModal(false);
    setOpenErrorModal(false);
  };

  //pagination for invite user

  const HandlePageChangeUsers = async (pageNumber) => {
    setCurrentPageUsers(pageNumber);
    await GetInviteUsersListData(pageNumber); // Call your function with the selected page number
  };
  const currencyFilter = currencyType.find(
    (item) => otherInfo.preferredCurrency == item.value,
  );

  const IncorporatedValue = incorporatedInList.filter(
    (item) => companyForm?.incInID == item.value,
  );
  return (
    <div className="organisation-view-redesign">
      <div className="organisation-view-page">
        {/* PAGE HEADER */}
        <div className="organisation-view-page-header">
          <div className="organisation-view-heading">
            <button
              type="button"
              className="organisation-view-back-icon"
              onClick={() => navigate("/organisations")}
              aria-label="Back"
            >
              <i className="ri-arrow-left-line"></i>
            </button>

            <div>
              <h1>Organisation / Practice Details</h1>
              <p>
                Review organisation information, invited users and subscription
                details.
              </p>
            </div>
          </div>

          <div className="organisation-view-header-meta">
            <span className="organisation-view-meta-label">Organisation</span>
            <strong>{basicInfo.tradingName}</strong>
          </div>
        </div>

        {/* MAIN CARD */}
        <section className="organisation-view-card">
          {/* TABS */}
          <div className="organisation-view-tabs-wrap">
            <ul className="nav nav-tabs organisation-view-tabs">
              <li className="nav-item">
                <a
                  className="nav-link active"
                  data-bs-toggle="tab"
                  href="#base-justified-home"
                  role="tab"
                  aria-selected="false"
                >
                  <i className="ri-building-line"></i>
                  <span>Organisation / Practice Details</span>
                </a>
              </li>

              <li className="nav-item">
                <a
                  onClick={() => GetInviteUsersListData(1)}
                  className="nav-link"
                  data-bs-toggle="tab"
                  href="#product"
                  role="tab"
                  aria-selected="false"
                >
                  <i className="ri-group-line"></i>
                  <span>Invite User</span>
                </a>
              </li>

              <li className="nav-item">
                <a
                  className="nav-link"
                  data-bs-toggle="tab"
                  href="#Plan"
                  role="tab"
                  aria-selected="false"
                >
                  <i className="ri-bank-card-line"></i>
                  <span>Subscription Plan</span>
                </a>
              </li>
            </ul>
          </div>

          <div className="tab-content">
            {/* =====================================================
                ORGANISATION DETAILS TAB
                ===================================================== */}
            <div
              className="tab-pane fade show active"
              id="base-justified-home"
              role="tabpanel"
            >
              <div className="organisation-view-details-content">
                {/* LEFT COLUMN */}
                <div className="organisation-view-details-column">
                  {/* BASIC INFORMATION */}
                  <section className="organisation-view-info-card">
                    <div className="organisation-view-section-header">
                      <span className="organisation-view-section-icon">
                        <i className="ri-information-line"></i>
                      </span>

                      <div>
                        <h2>Basic Information</h2>
                        <p>Core organisation and profession details.</p>
                      </div>
                    </div>

                    <div className="organisation-view-field-grid">
                      <div className="organisation-view-field">
                        <span>Profession Type</span>
                        <strong>{professionTypeValue}</strong>
                      </div>

                      <div className="organisation-view-field">
                        <span>Business Type</span>
                        <strong>{basicInfo.businessTypeName}</strong>
                      </div>
                    </div>
                  </section>

                  {/* TRADING DETAILS */}
                  <section className="organisation-view-info-card">
                    <div className="organisation-view-section-header">
                      <span className="organisation-view-section-icon">
                        <i className="ri-store-2-line"></i>
                      </span>

                      <div>
                        <h2>Trading Details</h2>
                        <p>Trading identity, address and start date.</p>
                      </div>
                    </div>

                    <div className="organisation-view-field-grid">
                      <div className="organisation-view-field">
                        <span>Trading Name</span>
                        <strong>{basicInfo.tradingName}</strong>
                      </div>

                      <div className="organisation-view-field">
                        <span>Trading Start Date</span>
                        <strong>{basicInfo.tradingStartDate}</strong>
                      </div>

                      <div className="organisation-view-field organisation-view-field-full">
                        <span>Trading Address</span>
                        <strong>{concatenatedTradingAddress}</strong>
                      </div>
                    </div>
                  </section>

                  {/* COMPANY DETAILS */}
                  {(basicInfo.businessTypeID == CLIENT_TYPES.LLP ||
                    basicInfo.businessTypeID == CLIENT_TYPES.Company) && (
                    <section className="organisation-view-info-card">
                      <div className="organisation-view-section-header">
                        <span className="organisation-view-section-icon">
                          <i className="ri-building-4-line"></i>
                        </span>

                        <div>
                          <h2>Company Details</h2>
                          <p>
                            Registered company and incorporation information.
                          </p>
                        </div>
                      </div>

                      <div className="organisation-view-field-grid">
                        <div className="organisation-view-field">
                          <span>Company Name</span>
                          <strong>{companyForm.companyName}</strong>
                        </div>

                        <div className="organisation-view-field">
                          <span>Entity Type</span>
                          <strong>{companyForm.companyType}</strong>
                        </div>

                        <div className="organisation-view-field">
                          <span>Company Number</span>
                          <strong>{companyForm.companyNumber}</strong>
                        </div>

                        <div className="organisation-view-field">
                          <span>Company Incorporated In</span>
                          <strong>{IncorporatedValue[0]?.label}</strong>
                        </div>

                        <div className="organisation-view-field">
                          <span>Company Incorporation Date</span>
                          <strong>{companyForm.incorporationDate}</strong>
                        </div>

                        <div className="organisation-view-field organisation-view-field-full">
                          <span>Company Registered Office Address</span>
                          <strong>{concatenatedRegisterAddress}</strong>
                        </div>
                      </div>
                    </section>
                  )}

                  {/* E SIGNATURE */}
                  <section className="organisation-view-info-card">
                    <div className="organisation-view-section-header">
                      <span className="organisation-view-section-icon">
                        <i className="ri-quill-pen-line"></i>
                      </span>

                      <div>
                        <h2>E Signature</h2>
                        <p>Authorized signatory information.</p>
                      </div>
                    </div>

                    <div className="organisation-view-field-grid">
                      <div className="organisation-view-field">
                        <span>Signatory Name</span>
                        <strong>{basicInfo.signatoryName}</strong>
                      </div>

                      <div className="organisation-view-field">
                        <span>Signature Image</span>
                        <strong>
                          {basicInfo.signatureImageUrl ? (
                            <a
                              className="organisation-view-link"
                              href={basicInfo.signatureImageUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <i className="ri-external-link-line"></i>
                              View Signature
                            </a>
                          ) : (
                            <span className="organisation-view-muted-value">
                              Not available
                            </span>
                          )}
                        </strong>
                      </div>
                    </div>
                  </section>
                </div>

                {/* RIGHT COLUMN */}
                <div className="organisation-view-details-column">
                  {/* OTHER INFORMATION */}
                  <section className="organisation-view-info-card">
                    <div className="organisation-view-section-header">
                      <span className="organisation-view-section-icon">
                        <i className="ri-settings-3-line"></i>
                      </span>

                      <div>
                        <h2>Other Information</h2>
                        <p>Contact, branding and accounting information.</p>
                      </div>
                    </div>

                    <div className="organisation-view-field-grid">
                      <div className="organisation-view-field">
                        <span>Currency Type</span>
                        <strong>{currencyFilter?.label}</strong>
                      </div>

                      <div className="organisation-view-field">
                        <span>VAT Number</span>
                        <strong>{otherInfo.vatNumber}</strong>
                      </div>

                      <div className="organisation-view-field">
                        <span>Contact Email</span>
                        <strong>{otherInfo.contactEmail}</strong>
                      </div>

                      <div className="organisation-view-field">
                        <span>Contact Phone</span>
                        <strong>{otherInfo.contactPhone}</strong>
                      </div>

                      <div className="organisation-view-field">
                        <span>Logo</span>
                        <strong>
                          {otherInfo.logoUrl ? (
                            <a
                              className="organisation-view-link"
                              href={otherInfo.logoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <i className="ri-external-link-line"></i>
                              View Logo
                            </a>
                          ) : (
                            <span className="organisation-view-muted-value">
                              Not available
                            </span>
                          )}
                        </strong>
                      </div>

                      <div className="organisation-view-field">
                        <span>Website</span>
                        <strong>{otherInfo.website}</strong>
                      </div>

                      <div className="organisation-view-field">
                        <span>Color</span>
                        <strong className="organisation-view-color-value">
                          <span
                            className="organisation-view-color-swatch"
                            style={{ backgroundColor: otherInfo.brandColor }}
                          ></span>
                          <span>{otherInfo.brandColor}</span>
                        </strong>
                      </div>

                      <div className="organisation-view-field">
                        <span>Business Tagline</span>
                        <strong>{otherInfo.businessTagline}</strong>
                      </div>

                      <div className="organisation-view-field">
                        <span>Affiliated Accounting Body Name</span>
                        <strong>{otherInfo.AffiliatedAcBodyName}</strong>
                      </div>

                      <div className="organisation-view-field">
                        <span>Website of Affiliated Accounting Body</span>
                        <strong>{otherInfo.webOfAffiliatedAccount}</strong>
                      </div>
                    </div>
                  </section>

                  {/* OFFICER / PARTNERSHIP DETAILS */}
                  {officersForm.map((prospect, index) => (
                    <section
                      className="organisation-view-info-card"
                      key={index}
                    >
                      <div className="organisation-view-section-header">
                        <span className="organisation-view-section-icon">
                          <i className="ri-user-star-line"></i>
                        </span>

                        <div>
                          <h2>
                            {basicInfo.businessTypeID ===
                              CLIENT_TYPES.Partnership &&
                              `Partner ${index + 1}`}

                            {basicInfo.businessTypeID ===
                              CLIENT_TYPES.Sole_Trader && "Officers Details"}

                            {(basicInfo.businessTypeID === CLIENT_TYPES.LLP ||
                              basicInfo.businessTypeID ===
                                CLIENT_TYPES.Company) &&
                              `Officer ${index + 1}`}
                          </h2>

                          <p>
                            {basicInfo.businessTypeID ===
                            CLIENT_TYPES.Partnership
                              ? "Partnership contact and residential details."
                              : "Officer contact and appointment details."}
                          </p>
                        </div>
                      </div>

                      <div className="organisation-view-field-grid">
                        <div className="organisation-view-field">
                          <span>First Name</span>
                          <strong>{officersForm[index].firstName}</strong>
                        </div>

                        <div className="organisation-view-field">
                          <span>Last Name</span>
                          <strong>{officersForm[index].lastName}</strong>
                        </div>

                        <div className="organisation-view-field">
                          <span>Phone</span>
                          <strong>{officersForm[index].phoneNo}</strong>
                        </div>

                        <div className="organisation-view-field">
                          <span>Email</span>
                          <strong>{officersForm[index].emailID}</strong>
                        </div>

                        {basicInfo.businessTypeID ===
                          CLIENT_TYPES.Sole_Trader ||
                        basicInfo.businessTypeID ===
                          CLIENT_TYPES.Partnership ? null : (
                          <>
                            <div className="organisation-view-field">
                              <span>Role</span>
                              <strong>{officersForm[index].officerRole}</strong>
                            </div>

                            <div className="organisation-view-field">
                              <span>Appointed On</span>
                              <strong>{officersForm[index].appointedOn}</strong>
                            </div>
                          </>
                        )}

                        <div className="organisation-view-field organisation-view-field-full">
                          <span>
                            {(basicInfo.businessTypeID ===
                              CLIENT_TYPES.Sole_Trader ||
                              basicInfo.businessTypeID ===
                                CLIENT_TYPES.Partnership) &&
                              "Residential Address"}

                            {(basicInfo.businessTypeID ===
                              CLIENT_TYPES.Company ||
                              basicInfo.businessTypeID === CLIENT_TYPES.LLP) &&
                              "Correspondence Address"}
                          </span>

                          <strong>
                            {
                              concatenatedResidentialAddress[index]
                                ?.officersFullAddress
                            }
                          </strong>
                        </div>
                      </div>
                    </section>
                  ))}
                </div>
              </div>
            </div>

            {/* =====================================================
                INVITE USERS TAB
                ===================================================== */}
            <div className="tab-pane fade" id="product" role="tabpanel">
              <div className="organisation-view-list-tab">
                <div className="organisation-view-tab-toolbar">
                  <div className="organisation-view-search-wrap">
                    <i className="ri-search-line"></i>

                    <input
                      type="text"
                      value={searchKeywordUsers}
                      onChange={(e) => {
                        HandleSearch(e);
                      }}
                      className="form-control organisation-view-search-input"
                      placeholder="Search User"
                    />
                  </div>

                  <div className="organisation-view-toolbar-action">
                    {userAccessData.User_CanAdd && (
                      <CommonButtonComponent
                        title="Invite New User"
                        dataBsTarget="#addUpdateModal"
                        data_bs_toggle="modal"
                        name="Invite New User"
                        AddBtn={() => UsersAddBtnClicked()}
                      />
                    )}
                  </div>
                </div>

                <div className="organisation-view-table-scroll">
                  <table className="organisation-view-table">
                    <thead>
                      <tr>
                        <th>
                          <button
                            type="button"
                            className="organisation-view-sort-btn"
                            onClick={() => {
                              setUserSortType("FirstName");
                              handleUserSort(
                                primaryUserSortDirectionObj.UserNameTypeSort ===
                                  null
                                  ? "asc"
                                  : primaryUserSortDirectionObj.UserNameTypeSort ===
                                      "asc"
                                    ? "desc"
                                    : "asc",
                                "FirstName",
                              );
                            }}
                          >
                            <span>First Name</span>
                            <i
                              className={
                                primaryUserSortDirectionObj.UserNameTypeSort ===
                                "desc"
                                  ? "fas fa-sort-alpha-up"
                                  : "fas fa-sort-alpha-down"
                              }
                            ></i>
                          </button>
                        </th>

                        <th>Last Name</th>

                        <th>
                          <button
                            type="button"
                            className="organisation-view-sort-btn"
                            onClick={() => {
                              setUserSortType("Email");
                              handleUserSort(
                                primaryUserSortDirectionObj.EmailTypeSort ===
                                  null
                                  ? "asc"
                                  : primaryUserSortDirectionObj.EmailTypeSort ===
                                      "asc"
                                    ? "desc"
                                    : "asc",
                                "Email",
                              );
                            }}
                          >
                            <span>Email</span>
                            <i
                              className={
                                primaryUserSortDirectionObj.EmailTypeSort ===
                                "desc"
                                  ? "fas fa-sort-alpha-up"
                                  : "fas fa-sort-alpha-down"
                              }
                            ></i>
                          </button>
                        </th>

                        <th>
                          <button
                            type="button"
                            className="organisation-view-sort-btn"
                            onClick={() => {
                              setUserSortType("RoleName");
                              handleUserSort(
                                primaryUserSortDirectionObj.RoleTypeSort ===
                                  null
                                  ? "asc"
                                  : primaryUserSortDirectionObj.RoleTypeSort ===
                                      "asc"
                                    ? "desc"
                                    : "asc",
                                "RoleName",
                              );
                            }}
                          >
                            <span>Role</span>
                            <i
                              className={
                                primaryUserSortDirectionObj.RoleTypeSort ===
                                "desc"
                                  ? "fas fa-sort-alpha-up"
                                  : "fas fa-sort-alpha-down"
                              }
                            ></i>
                          </button>
                        </th>

                        <th>Acceptance Status</th>

                        <th className="organisation-view-actions-heading">
                          {userAccessData.User_CanDelete && <>Action</>}
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {inviteUsersList.map((users) => (
                        <tr key={users.inviteUserKeyID}>
                          <td>
                            <div className="organisation-view-user-cell">
                              <span className="organisation-view-user-avatar">
                                {users.firstName?.charAt(0)?.toUpperCase()}
                              </span>
                              <strong>{users.firstName}</strong>
                            </div>
                          </td>

                          <td>{users.lastName}</td>
                          <td>{users.email}</td>
                          <td>
                            <span className="organisation-view-role-pill">
                              {users.roleName}
                            </span>
                          </td>
                          <td>
                            <span className="organisation-view-acceptance-pill">
                              {users.acceptanceStatus}
                            </span>
                          </td>

                          <td className="organisation-view-actions-cell">
                            {userAccessData.User_CanDelete && (
                              <Tooltip title={"Delete User"}>
                                <button
                                  type="button"
                                  className="organisation-view-delete-btn"
                                  data-bs-toggle="modal"
                                  data-bs-target="#ConfirmModel"
                                  onClick={() =>
                                    setModelRequestData({
                                      ...modelRequestData,
                                      userName: users.firstName,
                                      inviteUserKeyID: users.inviteUserKeyID,
                                      status: users.statusName,
                                      user: "Invite User",
                                      Action: "Delete",
                                    })
                                  }
                                >
                                  <i className="ri-delete-bin-5-line"></i>
                                </button>
                              </Tooltip>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {inviteUsersList && inviteUsersList.length === 0 && (
                  <div className="organisation-view-empty">
                    <noResultFoundModel />
                  </div>
                )}

                {UserListCount > 10 && (
                  <div className="organisation-view-pagination">
                    <PaginationComponent
                      totalCount={UserListCount}
                      totalPages={totalUserPage}
                      currentPage={currentPageUsers}
                      onPageChange={HandlePageChangeUsers}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* =====================================================
                SUBSCRIPTION TAB
                ===================================================== */}
            <div className="tab-pane fade" id="Plan" role="tabpanel">
              <div className="organisation-view-subscription-tab">
                <div className="organisation-view-subscription-heading">
                  <div>
                    <h2>Subscription Plan</h2>
                    <p>
                      Review the active package and subscription payment
                      history.
                    </p>
                  </div>

                  <button
                    type="button"
                    className="btn organisation-view-primary-btn"
                    onClick={() => handleOpenPurchaseModel()}
                  >
                    <i className="ri-arrow-up-circle-line"></i>
                    <span>Upgrade Plan</span>
                  </button>
                </div>

                {/* ACTIVE PLAN */}
                <div className="organisation-view-subscription-grid organisation-view-subscription-grid-v2">
                  {/* SUBSCRIPTION DETAILS */}
                  <section className="organisation-view-plan-card organisation-view-subscription-details-card">
                    <div className="organisation-view-plan-card-header organisation-view-subscription-card-header">
                      <h3>Subscription Details</h3>

                      <div className="organisation-view-status-group">
                        {subScriptionActiveList.subscriptionStatus && (
                          <span
                            className={`organisation-view-header-status ${
                              subScriptionActiveList.subscriptionStatus ===
                              "Active"
                                ? "is-active"
                                : subScriptionActiveList.subscriptionStatus ===
                                    "Pending"
                                  ? "is-pending"
                                  : "is-inactive"
                            }`}
                          >
                            <i className="ri-checkbox-blank-circle-fill"></i>
                            {subScriptionActiveList.subscriptionStatus}
                          </span>
                        )}

                        {subScriptionActiveList.paymentStatus && (
                          <span
                            className={`organisation-view-header-status ${
                              subScriptionActiveList.paymentStatus === "Paid"
                                ? "is-paid"
                                : subScriptionActiveList.paymentStatus ===
                                    "Unpaid"
                                  ? "is-unpaid"
                                  : "is-free"
                            }`}
                          >
                            {subScriptionActiveList.paymentStatus}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="organisation-view-subscription-details-body">
                      <div className="organisation-view-subscription-facts">
                        <div className="organisation-view-subscription-fact">
                          <span>Package Name</span>
                          <strong>{subScriptionActiveList.packageName}</strong>
                        </div>

                        <div className="organisation-view-subscription-fact">
                          <span>Payment Frequency</span>
                          <strong>
                            {subScriptionActiveList.paymentFrequencyID === 1
                              ? "Yearly"
                              : subScriptionActiveList.paymentFrequencyID === 4
                                ? "Monthly"
                                : ""}
                          </strong>
                        </div>

                        <div className="organisation-view-subscription-fact">
                          <span>Billing Cycle</span>
                          <strong>
                            {subScriptionActiveList.paymentFrequencyID === 1
                              ? "365 Days"
                              : subScriptionActiveList.paymentFrequencyID === 4
                                ? "30 Days"
                                : "-"}
                          </strong>
                        </div>

                        <div className="organisation-view-subscription-fact">
                          <span>Start Date</span>
                          <strong>
                            {subScriptionActiveList.subscriptionStartDate ===
                            null
                              ? "-"
                              : subScriptionActiveList.subscriptionStartDate}
                          </strong>
                        </div>

                        <div className="organisation-view-subscription-fact">
                          <span>Next Renewal</span>
                          <strong>
                            {subScriptionActiveList.renewDate === null
                              ? "-"
                              : subScriptionActiveList.renewDate}
                          </strong>
                        </div>

                        <div className="organisation-view-subscription-fact">
                          <span>Payment Status</span>
                          <strong>
                            {subScriptionActiveList.paymentStatus}
                          </strong>
                        </div>
                      </div>

                      <div className="organisation-view-subscription-invoice-row">
                        {subScriptionActiveList.paymentStatus === "Unpaid" && (
                          <Tooltip title={`Pay Now`}>
                            <button
                              type="button"
                              className="organisation-view-pay-btn"
                              onClick={() =>
                                RedirectStripeCheckout(subScriptionActiveList)
                              }
                            >
                              Pay Now
                            </button>
                          </Tooltip>
                        )}

                        {subScriptionActiveList.paymentStatus === "Paid" && (
                          <Tooltip title={`Invoice`}>
                            <a
                              href={subScriptionActiveList.hostedInvoiceUrl}
                              className="organisation-view-invoice-btn"
                            >
                              <i className="fa fa-download"></i>
                              <span>Invoice</span>
                            </a>
                          </Tooltip>
                        )}

                        {subScriptionActiveList.paymentStatus === "Free" && (
                          <span className="organisation-view-free-pill">
                            Free
                          </span>
                        )}
                      </div>

                      <div className="organisation-view-usage-grid">
                        <div className="organisation-view-usage-card">
                          <span>Remaining Proposals</span>
                          <strong>
                            {subScriptionActiveList.remainingQuotesPerMonth < 0
                              ? 0
                              : subScriptionActiveList.remainingQuotesPerMonth}
                          </strong>
                        </div>

                        <div className="organisation-view-usage-card">
                          <span>Remaining E-Signatures</span>
                          <strong>
                            {subScriptionActiveList.remainingESignatures < 0
                              ? 0
                              : subScriptionActiveList.remainingESignatures}
                          </strong>
                        </div>

                        <div className="organisation-view-usage-card">
                          <span>Remaining Pages</span>
                          <strong>
                            {subScriptionActiveList.remainingPages ??
                              subScriptionActiveList.noOfPages ??
                              0}
                          </strong>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* PACKAGE DETAILS */}
                  <section className="organisation-view-plan-card organisation-view-package-details-card">
                    <div className="organisation-view-plan-card-header organisation-view-subscription-card-header">
                      <h3>Package Details</h3>

                      <div className="organisation-view-package-header-actions">
                        <div className="organisation-view-package-monthly-price">
                          <strong>
                            {formatValue(
                              subScriptionActiveList?.yearlyValuePlan / 12,
                            )}
                          </strong>
                          <span>/ Month</span>
                        </div>

                        <button
                          type="button"
                          className="organisation-view-edit-plan-btn"
                          aria-label="Edit package details"
                        >
                          <i
                            className="ri-pencil-fill"
                            data-bs-toggle="modal"
                            data-bs-target="#OrganisationSubscriptionPackageDetails"
                            onClick={(e) => {
                              e.stopPropagation();
                              GetSubscriptionPackageModelData(
                                subScriptionActiveList.ospKeyID,
                              );
                              GetOrganisationPlanListData(1);
                            }}
                          />
                        </button>
                      </div>
                    </div>

                    <div className="organisation-view-feature-list organisation-view-feature-list-v2">
                      <div>
                        <i
                          className={
                            subScriptionActiveList?.apiIntegration == true
                              ? "ri-checkbox-circle-fill organisation-feature-yes"
                              : "ri-close-circle-line organisation-feature-no"
                          }
                        ></i>
                        <span>API Integration</span>
                      </div>

                      <div>
                        <i
                          className={
                            subScriptionActiveList?.prepareQuote == true
                              ? "ri-checkbox-circle-fill organisation-feature-yes"
                              : "ri-close-circle-line organisation-feature-no"
                          }
                        ></i>
                        <span>Prepare {proposalName}</span>
                      </div>

                      <div>
                        <i
                          className={
                            subScriptionActiveList?.sendQuote === true
                              ? "ri-checkbox-circle-fill organisation-feature-yes"
                              : "ri-close-circle-line organisation-feature-no"
                          }
                        ></i>
                        <span>Send {proposalName}</span>
                      </div>

                      <div>
                        <i
                          className={
                            subScriptionActiveList?.prepareContract === true
                              ? "ri-checkbox-circle-fill organisation-feature-yes"
                              : "ri-close-circle-line organisation-feature-no"
                          }
                        ></i>
                        <span>Prepare {EngagementName}</span>
                      </div>

                      {subScriptionActiveList?.sendQuote === true &&
                        subScriptionActiveList?.quotesPerMonth > 0 && (
                          <div>
                            <i className="ri-checkbox-circle-fill organisation-feature-yes"></i>
                            <span>
                              Prepare and Send {proposalName}:{" "}
                              {formatValueWithoutCurrencySymbol(
                                subScriptionActiveList?.quotesPerMonth,
                              )}
                              /Month
                            </span>
                          </div>
                        )}

                      <div>
                        <i
                          className={
                            subScriptionActiveList?.signContract === true
                              ? "ri-checkbox-circle-fill organisation-feature-yes"
                              : "ri-close-circle-line organisation-feature-no"
                          }
                        ></i>
                        <span>
                          Send And Digitally Sign The {EngagementName}:{" "}
                          {formatValueWithoutCurrencySymbol(
                            subScriptionActiveList?.eSignaturePerMonth,
                          )}
                          /Month
                        </span>
                      </div>

                      <div>
                        <i
                          className={
                            subScriptionActiveList?.enablePdfToCsv === true
                              ? "ri-checkbox-circle-fill organisation-feature-yes"
                              : "ri-close-circle-line organisation-feature-no"
                          }
                        ></i>
                        <span>
                          PDF To CSV
                          {subScriptionActiveList?.enablePdfToCsv === true
                            ? `: ${
                                subScriptionActiveList?.noOfPages ?? 0
                              } Page${
                                Number(subScriptionActiveList?.noOfPages) === 1
                                  ? ""
                                  : "s"
                              }`
                            : ""}
                        </span>
                      </div>

                      <div>
                        <i
                          className={
                            subScriptionActiveList?.isMailBox === null ||
                            !subScriptionActiveList?.isMailBox
                              ? "ri-close-circle-line organisation-feature-no"
                              : "ri-checkbox-circle-fill organisation-feature-yes"
                          }
                        ></i>
                        <span>Personalized Outgoing Mailbox</span>
                      </div>
                    </div>
                  </section>
                </div>

                {/* SUBSCRIPTION HISTORY */}
                <section className="organisation-view-history-card">
                  <div className="organisation-view-history-header">
                    <div>
                      <h3>Subscription History</h3>
                      <p>Review previous and current subscription records.</p>
                    </div>
                  </div>

                  <div className="organisation-view-table-scroll">
                    <table className="organisation-view-table organisation-view-subscription-table">
                      <thead>
                        <tr>
                          <th>Email</th>
                          <th>Contact No</th>
                          <th>Package Name</th>
                          <th>Package Price</th>
                          <th>Subscription Start Date</th>
                          <th>Next Renewal Date</th>
                          <th>Payable Amount</th>
                          <th>Payment Status</th>
                          <th>Subscription Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>

                      <tbody>
                        {subScriptionPlaneList.map((subscription, index) => (
                          <tr key={index}>
                            <td>{subscription.email}</td>
                            <td>{subscription.mobileNumber}</td>
                            <td>{subscription.packageName}</td>
                            <td>{formatValue(subscription.packagePrice)}</td>
                            <td>
                              {subscription.subscriptionStartDate
                                ? subscription.subscriptionStartDate
                                : "_"}
                            </td>
                            <td>
                              {subscription.nextRenewalDate
                                ? subscription.nextRenewalDate
                                : " _"}
                            </td>
                            <td>
                              {formatValue(subscription.finalBillingAmount)}
                            </td>

                            <td className="organisation-view-payment-cell">
                              {subscription.paymentStatus === "Unpaid" && (
                                <Tooltip title={`Pay Now`}>
                                  <button
                                    type="button"
                                    className="organisation-view-pay-btn"
                                    onClick={() =>
                                      RedirectStripeCheckout(subscription)
                                    }
                                  >
                                    Pay Now
                                  </button>
                                </Tooltip>
                              )}

                              {subscription.paymentStatus === "Paid" && (
                                <Tooltip title={`Download`}>
                                  <a
                                    href={subscription.hostedInvoiceUrl}
                                    className="organisation-view-download-btn"
                                  >
                                    <i className="fa fa-download"></i>
                                  </a>
                                </Tooltip>
                              )}

                              {subscription.paymentStatus === "Free" && (
                                <span className="organisation-view-free-pill">
                                  Free
                                </span>
                              )}
                            </td>

                            <td>
                              <span
                                className={`organisation-view-subscription-status ${
                                  subscription.subscriptionStatus === "Active"
                                    ? "is-active"
                                    : subscription.subscriptionStatus ===
                                        "Expired"
                                      ? "is-expired"
                                      : subscription.subscriptionStatus ===
                                          "Pending"
                                        ? "is-pending"
                                        : subscription.subscriptionStatus ===
                                            "InActive"
                                          ? "is-inactive"
                                          : "is-default"
                                }`}
                              >
                                {subscription.subscriptionStatus}
                              </span>
                            </td>

                            <td>
                              <Tooltip title={`View Subscription`}>
                                <button
                                  type="button"
                                  className="organisation-view-table-action-btn"
                                  onClick={() =>
                                    handleOpenSubscriptionModel(subscription)
                                  }
                                  data-bs-toggle="modal"
                                  data-bs-target="#addSubscriptionViewModalUser"
                                >
                                  <i className="bi bi-eye"></i>
                                </button>
                              </Tooltip>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </section>

        {/* EXISTING MODALS */}
        <ErrorModel
          ErrorModel={openErrorModal}
          handleClose={handleClose}
          ErrorMessage={errorMessage}
        />

        <ConfirmModel
          openErrorModal={openErrorModal}
          openSuccessModal={openSuccessModal}
          modelRequestData={modelRequestData}
          UpdatedStatus={InviteUserChangeStatusData}
        />

        <SubscriptionView
          class="modal fade"
          id="addSubscriptionViewModalUser"
          tabIndex="-1"
          aria_labelledby="exampleModalLabel"
          aria_hidden="true"
          subscriptionPackageObj={subscriptionPackageObj}
        />

        <OrganisationSubscriptionPackageDetails
          subscriptionPackageObj={subScriptionActiveList}
          setSubscriptionPackageObj={setSubScriptionActiveList}
        />

        <SuccessModal
          handleClose={handleClose}
          setOpenSuccessModal={setOpenSuccessModal}
          openSuccessModal={openSuccessModal}
          modelAction={modelRequestData.Action}
          message={successMessage}
        />

        <UsersModel
          class="modal fade"
          id="addUpdateModal"
          tabIndex="-1"
          aria_labelledby="exampleModalLabel"
          aria_hidden="true"
          setIsAddUpdateActionDone={setIsAddUpdateActionDone}
          modelRequestData={modelRequestData}
        />
      </div>

      <Footer />
    </div>
  );
};

export default OrganisationViewDetails;
