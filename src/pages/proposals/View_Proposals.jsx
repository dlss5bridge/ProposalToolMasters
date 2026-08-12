import React, { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Tooltip from "@mui/material/Tooltip";
import "./Proposals.css";
import Switch from "@mui/material/Switch";
import Select from "react-select";
import { AuthContextProvider } from "../../AuthContext/AuthContext";
import Footer from "../../components/Footer";
import { GetProposalModelList } from "../../redux/Services/Proposal/ProposalApi";
import { useSelector } from "react-redux";
import Utils from "../../Middleware/Utils";
import "../configure/packages/Package.css";
import { fieldToIdMap, statusID } from "../../Middleware/enums";
import { Base_Url } from "../../Base-Url/Base_Url";

const View_Proposals = () => {
  const common = useSelector((state) => state.Storage);
  const [selectedRecurringServiceList, setSelectedRecurringServiceList] =
    useState([]);
  const [selectedOneOffServiceList, setSelectedOneOffServiceList] = useState(
    [],
  );
  const [acceptedPackageIndex, setAcceptedIndex] = useState(false);
  const [visibleCount, setVisibleCount] = useState(1);
  const [requireMessage, setRequireMessage] = useState(false);
  const [serviceDescriptionHTML, setServiceDescriptionHTML] = useState(null);
  const [statementOfFactsHTML, setStatementOfFactsHTML] = useState(null);

  const [acceptedPackageName, setAcceptedAcceptedName] = useState("");

  const [modelRequestData, setModelRequestData] = useState({
    ModuleName: null,
    ProposalId: null,
    keyID: null,
    SearchKeyword: "",
  });
  const location = useLocation();
  const [vatPercentage, setVATPercentage] = useState(null);
  const [packageList, setPackageList] = useState([]);
  const [selectedPackagesList, setSelectedPackagesList] = useState([]);
  const [finalQuotationAmountList, setFinalQuotationAmountList] = useState([]);
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

  const [ProposalObject, setProposalObject] = useState({
    clientName: null,
    quoteFormatID: null,
    contractKeyID: [],
    statusID: null,
    templateName: null,
    currencyID: null,
    quoteTypeID: null,
    quoteTypeName: null,
    Payment_Frequency: null,
    feeTypeId: null,
    feesInQuoteName: null,
    DiscountLines: null,
    paymentGatewayID: null,
    paymentFrequencyName: null,
    recurringOriginalPrice: null,
    recurringDiscountedPrice: null,
    recurringDiscountPercentage: null,
    oneOffOriginalPrice: null,
    oneOffDiscountedPrice: null,
    oneOffDiscountPercentage: null,
    quoteFormatName: null,
    selectedOneOffServiceList: [],
    reccrunigServiceCatList: [],
    clientMasterBusinessTypeID: null,
    acceptedServicePackageID: null,
    draftOn: null,
    sentOn: null,
    AcceptedOn: null,
    SkippedOn: null,
  });

  const [pricingTableColumnIDs, setPricingTableColumnIDs] = useState("");
  const [currencySymbol, setCurrencySymbol] = useState(null);
  const [taxName, setTaxName] = useState("VAT");
  const [currencyID, setCurrencyID] = useState(null);
  const [visibleFieldsCustomTemp, setVisibleFieldsCustomTemp] = useState({
    serviceCategory: true,
    serviceName: true,
    vatRate: true,
    vat: true,
    fees: true,
    serviceScope: true,
    feesIncVat: true,
  });

  const updateVisibleFieldsFromIds = (idString) => {
    // Ensure idString is a string — handle undefined, null, object, or empty values safely
    if (typeof idString !== "string" || idString.trim() === "") {
      // If no ids provided, set all fields to false (optional)
      const allFalse = Object.fromEntries(
        Object.keys(fieldToIdMap).map((key) => [key, true]),
      );
      setVisibleFieldsCustomTemp(allFalse);
      return;
    }

    const idsFromBackend = idString
      .split(",")
      .map((id) => Number(id.trim()))
      .filter((id) => !isNaN(id)); // avoid NaN if backend sends weird values

    const updatedFields = Object.fromEntries(
      Object.entries(fieldToIdMap).map(([key, id]) => [
        key,
        idsFromBackend.includes(id),
      ]),
    );

    setVisibleFieldsCustomTemp(updatedFields);
  };

  // const draftOn = location.state.draftOn;
  // const sentOn = location.state.sentOn;
  // const AcceptedOn = location.state.AcceptedOn;
  // const SkippedOn = location.state.SkippedOn;

  const {
    setTopbar,
    proposalName,
    setLoader,
    prospectName,
    formatValue,
    isMobile,
    getTaxName,
    getValidationMessage,
    hasHyphenAfterNumber,
    getCurrencySymbol,
    formatValueWithoutCurrencySymbol,
  } = useContext(AuthContextProvider);
  const navigate = useNavigate();

  const [pricingSettingObj, setPricingSettingObj] = useState({
    userKeyID: null,
    minOneOffPriceForQC: null,
    minMonthlyPriceForQC: null,
    maxDiscountForQC: null,
    PaymentFrequency: null,
    enableMasterProposalType: null,
  });

  const [RecurringPricingInfo, setRecurringPricingInfo] = useState({
    OriginalPrice: 0,
    DefaultDiscount: null,
    DiscountPercentagePackageOne: null,
    DiscountPercentagePackageTwo: null,
    DiscountPercentagePackageThree: null,
    DiscountedPrice: "",
    MaxDiscount: 0,
    MinPrice: "",
    NetTotal: 0,
    Services: null,
    ServicePrice: 0,
    Discount: 0,
    GrandTotal: 0,
    DiscountedTotal: 0,
    packageOneNetTotal: 0,
    packageTwoNetTotal: 0,
    packageThreeNetTotal: 0,
    packageOneDisCount: 0,
    packageTwoDisCount: 0,
    packageThreeDisCount: 0,
    packageOneDisCountedTotal: 0,
    packageTwoDisCountedTotal: 0,
    packageThreeDisCountedTotal: 0,
    PackageOneVaTPrice: null,
    PackageTwoVaTPrice: null,
    PackageThreeVaTPrice: null,
    PackageOneGrandTotal: null,
    PackageTwoGrandTotal: null,
    PackageThreeGrandTotal: null,
  });
  const [OneOffPricingInfo, setOneOffPricingInfo] = useState({
    OriginalPrice: 0,
    DefaultDiscount: null,
    DiscountPercentagePackageOne: null,
    DiscountPercentagePackageTwo: null,
    DiscountPercentagePackageThree: null,
    // DefaultDiscount: 0,
    DiscountedPrice: "",
    MaxDiscount: 0,
    MinPrice: "",
    NetTotal: 0,
    Services: null,
    ServicePrice: 0,
    Discount: 0,
    GrandTotal: 0,
    DiscountedTotal: 0,
    packageOneNetTotal: 0,
    packageTwoNetTotal: 0,
    packageThreeNetTotal: 0,
    packageOneDisCount: 0,
    packageTwoDisCount: 0,
    packageThreeDisCount: 0,
    packageOneDisCountedTotal: 0,
    packageTwoDisCountedTotal: 0,
    packageThreeDisCountedTotal: 0,
    PackageOneVaTPrice: null,
    PackageTwoVaTPrice: null,
    PackageThreeVaTPrice: null,
    PackageOneGrandTotal: null,
    PackageTwoGrandTotal: null,
    PackageThreeGrandTotal: null,
  });

  const [OneOffPricingInfoCopy, setOneOffPricingInfoCopy] = useState({
    OriginalPrice: 0,
    DefaultDiscount: null,
    // DefaultDiscount: 0,
    DiscountedPrice: "",
    MaxDiscount: 0,
    MinPrice: "",
    NetTotal: 0,
    Services: null,
    ServicePrice: 0,
    Discount: 0,
    GrandTotal: 0,
    DiscountedTotal: 0,
    packageOneDisCount: 0,
    packageTwoDisCount: 0,
    packageThreeDisCount: 0,
    packageOneDisCountedTotal: 0,
    packageTwoDisCountedTotal: 0,
    packageThreeDisCountedTotal: 0,
    PackageOneVaTPrice: null,
    PackageTwoVaTPrice: null,
    PackageThreeVaTPrice: null,
    PackageOneGrandTotal: null,
    PackageTwoGrandTotal: null,
    PackageThreeGrandTotal: null,
  });

  const [RecurringFrequencyPricingInfo, setRecurringFrequencyPricingInfo] =
    useState({
      OriginalPrice: 0,
      DefaultDiscount: null,
      // DefaultDiscount: 0,
      DiscountedPrice: "",
      MaxDiscount: 0,
      MinPrice: "",
      NetTotal: 0,
      Services: null,
      ServicePrice: 0,
      Discount: 0,
      DiscountedTotal: 0,
      packageOneDisCount: 0,
      packageTwoDisCount: 0,
      packageThreeDisCount: 0,
      packageOneDisCountedTotal: 0,
      packageTwoDisCountedTotal: 0,
      packageThreeDisCountedTotal: 0,
      PackageOneVaTPrice: null,
      PackageTwoVaTPrice: null,
      PackageThreeVaTPrice: null,
      PackageOneGrandTotal: null,
      PackageTwoGrandTotal: null,
      PackageThreeGrandTotal: null,
    });

  const handleBack = () => {
    navigate(-1);
  };

  useEffect(() => {
    setTopbar("block");
  }, []);

  useEffect(() => {
    if (location.state?.quoteKeyID !== null) {
      GetProposalDetailsData(location.state?.quoteKeyID);
    }
  }, [location.state]);

  // Get Proposal Details From Api
  const GetProposalDetailsData = async (id) => {
    if (!id) {
      return;
    }

    try {
      const data = await GetProposalModelList(id);
      if (data?.data?.statusCode === 200) {
        if (data?.data?.responseData?.data) {
          const ModelData = data?.data?.responseData?.data;
          const ServiceMappingWithPackagesList =
            data?.data?.responseData?.serviceMappingWithPackagesList;
          const packageData = data?.data?.responseData?.packageList;
          const PackageOneID = packageData[0]?.servicePackageID;
          const PackageTwoID = packageData[1]?.servicePackageID;
          const PackageThreeID = packageData[2]?.servicePackageID;

          setServiceDescriptionHTML(ModelData.serviceDescription);
          setPricingTableColumnIDs(ModelData.pricingTableColumnIDs);
          updateVisibleFieldsFromIds(ModelData.pricingTableColumnIDs);
          // setStatementOfFactsHTML(ModelData.statementOfFacts);

          const finalQuotationAmountList =
            data?.data?.responseData?.finalQuotationAmountList;
          const clientOfficersList =
            data?.data?.responseData.clientOfficersList;

          let officerArray = [];
          clientOfficersList.forEach((item) => {
            let officerObj = {
              officerID: item.officerID,
              firstName: item.firstName,
              lastName: item.lastName,
              countryCodeID: item.countryCodeID,
              // phoneCountryCodeID: PhoneSelectedValue,
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

          setProposalObject({
            ...ProposalObject,
            statusID: ModelData.statusID,
            quoteFormatID: ModelData.quoteFormatID,
            contractKeyID: ModelData.contractKeyID,
            quotationName: ModelData.quotationName,
            clientName: ModelData.clientName,
            draftOn: ModelData.createdOn,
            sentOn: ModelData.sentOn,
            AcceptedOn: ModelData.acceptDeclineDate,
            SkippedOn: ModelData.lastUpdatedOn,
            templateName: ModelData.templateName,
            currencyID: ModelData.currencyID,
            quoteTypeID: ModelData.quoteTypeID,
            quoteTypeName: ModelData.quoteTypeName,
            feesInQuoteName: ModelData.feesInQuoteName,
            Payment_Frequency: ModelData.paymentFrequencyID,
            feeTypeId: ModelData.feesInQuoteID,
            DiscountLines: ModelData.showDiscountLine,
            paymentGatewayID: ModelData.paymentGatewayID,
            paymentFrequencyName: ModelData.paymentFrequencyName,
            recurringOriginalPrice: ModelData.recurringOriginalPrice,
            recurringDiscountedPrice: ModelData.recurringDiscountedPrice,
            recurringDiscountPercentage: ModelData.recurringDiscountPercentage,
            oneOffOriginalPrice: ModelData.oneOffOriginalPrice,
            oneOffDiscountedPrice: ModelData.oneOffDiscountedPrice,
            oneOffDiscountPercentage: ModelData.oneOffDiscountPercentage,
            quoteFormatName: ModelData.quoteFormatName,
            clientMasterBusinessTypeID: ModelData.clientMasterBusinessTypeID,
            acceptedServicePackageID: ModelData.acceptedServicePackageID,
          });

          const packageName = packageData.find(
            (item) =>
              item.servicePackageID == ModelData.acceptedServicePackageID,
          );
          setAcceptedAcceptedName(packageName?.servicePackageName);
          const packageIndex = packageData.findIndex(
            (item) =>
              item.servicePackageID === ModelData.acceptedServicePackageID,
          );
          setAcceptedIndex(packageIndex);

          if (packageData.length > 0) {
            const RecurringDetails = finalQuotationAmountList.filter(
              (obj) => obj.serviceChargeTypeID === 1,
            );
            const OneOffDetails = finalQuotationAmountList.filter(
              (obj) => obj.serviceChargeTypeID === 2,
            );
            if (
              RecurringDetails !== undefined &&
              RecurringDetails?.length !== 0
            ) {
              setVATPercentage(RecurringDetails[0]?.vatPercentage);
            } else {
              setVATPercentage(OneOffDetails[0]?.vatPercentage);
            }

            setRecurringPricingInfo({
              ...RecurringPricingInfo,
              DefaultDiscount:
                ModelData.quoteTypeID == 1 || ModelData.quoteTypeID == 2
                  ? RecurringDetails[0]?.discountPercentageWithAllDecimal
                  : ModelData.recurringDiscountPercentage == null
                    ? 0
                    : ModelData.recurringDiscountPercentage,
              DiscountPercentagePackageOne:
                RecurringDetails[0]?.discountPercentageWithAllDecimal,
              DiscountPercentagePackageTwo:
                RecurringDetails[1]?.discountPercentageWithAllDecimal,
              DiscountPercentagePackageThree:
                RecurringDetails[2]?.discountPercentageWithAllDecimal,
              packageOneNetTotal: RecurringDetails[0]?.netTotal,
              packageTwoNetTotal: RecurringDetails[1]?.netTotal,
              packageThreeNetTotal: RecurringDetails[2]?.netTotal,
              packageOneDisCount: RecurringDetails[0]?.discounted,
              packageTwoDisCount: RecurringDetails[1]?.discounted,
              packageThreeDisCount: RecurringDetails[2]?.discounted,
              packageOneDisCountedTotal: RecurringDetails[0]?.discountedTotal,
              packageTwoDisCountedTotal: RecurringDetails[1]?.discountedTotal,
              packageThreeDisCountedTotal: RecurringDetails[2]?.discountedTotal,
              PackageOneVaTPrice: RecurringDetails[0]?.vat,
              PackageTwoVaTPrice: RecurringDetails[1]?.vat,
              PackageThreeVaTPrice: RecurringDetails[2]?.vat,
              PackageOneGrandTotal: RecurringDetails[0]?.grandTotal,
              PackageTwoGrandTotal: RecurringDetails[1]?.grandTotal,
              PackageThreeGrandTotal: RecurringDetails[2]?.grandTotal,
            });
            setRecurringFrequencyPricingInfo({
              ...RecurringFrequencyPricingInfo,
              DefaultDiscount:
                ModelData.recurringDiscountPercentage_WithAllDecimal,
              packageOneNetTotal: RecurringDetails[0]?.netTotal,
              packageTwoNetTotal: RecurringDetails[1]?.netTotal,
              packageThreeNetTotal: RecurringDetails[2]?.netTotal,
              packageOneDisCount: RecurringDetails[0]?.discounted,
              packageTwoDisCount: RecurringDetails[1]?.discounted,
              packageThreeDisCount: RecurringDetails[2]?.discounted,
              packageOneDisCountedTotal: RecurringDetails[0]?.discountedTotal,
              packageTwoDisCountedTotal: RecurringDetails[1]?.discountedTotal,
              packageThreeDisCountedTotal: RecurringDetails[2]?.discountedTotal,
              PackageOneVaTPrice: RecurringDetails[0]?.vat,
              PackageTwoVaTPrice: RecurringDetails[1]?.vat,
              PackageThreeVaTPrice: RecurringDetails[2]?.vat,
              PackageOneGrandTotal: RecurringDetails[0]?.grandTotal,
              PackageTwoGrandTotal: RecurringDetails[1]?.grandTotal,
              PackageThreeGrandTotal: RecurringDetails[2]?.grandTotal,
            });

            setOneOffPricingInfo({
              ...OneOffPricingInfo,
              DefaultDiscount:
                ModelData.quoteTypeID == 1
                  ? OneOffDetails[0]?.discountPercentageWithAllDecimal
                  : ModelData.oneOffDiscountPercentage_WithAllDecimal == null
                    ? 0
                    : ModelData.oneOffDiscountPercentage_WithAllDecimal,
              DiscountPercentagePackageOne:
                OneOffDetails[0]?.discountPercentageWithAllDecimal,
              DiscountPercentagePackageTwo:
                OneOffDetails[1]?.discountPercentageWithAllDecimal,
              DiscountPercentagePackageThree:
                OneOffDetails[2]?.discountPercentageWithAllDecimal,
              packageOneDisCount: OneOffDetails[0]?.discounted,
              packageTwoDisCount: OneOffDetails[1]?.discounted,
              packageThreeDisCount: OneOffDetails[2]?.discounted,
              packageOneNetTotal: OneOffDetails[0]?.netTotal,
              packageTwoNetTotal: OneOffDetails[1]?.netTotal,
              packageThreeNetTotal: OneOffDetails[2]?.netTotal,
              packageOneDisCountedTotal: OneOffDetails[0]?.discountedTotal,
              packageTwoDisCountedTotal: OneOffDetails[1]?.discountedTotal,
              packageThreeDisCountedTotal: OneOffDetails[2]?.discountedTotal,
              PackageOneVaTPrice: OneOffDetails[0]?.vat,
              PackageTwoVaTPrice: OneOffDetails[1]?.vat,
              PackageThreeVaTPrice: OneOffDetails[2]?.vat,
              PackageOneGrandTotal: OneOffDetails[0]?.grandTotal,
              PackageTwoGrandTotal: OneOffDetails[1]?.grandTotal,
              PackageThreeGrandTotal: OneOffDetails[2]?.grandTotal,
            });
            setOneOffPricingInfoCopy({
              ...OneOffPricingInfoCopy,
              DefaultDiscount:
                ModelData.oneOffDiscountPercentage_WithAllDecimal,
              packageOneDisCount: OneOffDetails[0]?.discounted,
              packageTwoDisCount: OneOffDetails[1]?.discounted,
              packageThreeDisCount: OneOffDetails[2]?.discounted,
              packageOneNetTotal: OneOffDetails[0]?.netTotal,
              packageTwoNetTotal: OneOffDetails[1]?.netTotal,
              packageThreeNetTotal: OneOffDetails[2]?.netTotal,
              packageOneDisCountedTotal: OneOffDetails[0]?.discountedTotal,
              packageTwoDisCountedTotal: OneOffDetails[1]?.discountedTotal,
              packageThreeDisCountedTotal: OneOffDetails[2]?.discountedTotal,
              PackageOneVaTPrice: OneOffDetails[0]?.vat,
              PackageTwoVaTPrice: OneOffDetails[1]?.vat,
              PackageThreeVaTPrice: OneOffDetails[2]?.vat,
              PackageOneGrandTotal: OneOffDetails[0]?.grandTotal,
              PackageTwoGrandTotal: OneOffDetails[1]?.grandTotal,
              PackageThreeGrandTotal: OneOffDetails[2]?.grandTotal,
            });
          } else {
            const RecurringDetails = finalQuotationAmountList.find(
              (obj) => obj.serviceChargeTypeID === 1,
            );
            const OneOffDetails = finalQuotationAmountList.find(
              (obj) => obj.serviceChargeTypeID === 2,
            );
            if (
              RecurringDetails !== undefined &&
              RecurringDetails?.length === 0
            ) {
              setVATPercentage(RecurringDetails?.vatPercentage);
            } else {
              setVATPercentage(OneOffDetails?.vatPercentage);
            }
            setRecurringPricingInfo({
              ...RecurringPricingInfo,
              OriginalPrice: ModelData.recurringOriginalPrice,
              DefaultDiscount: Number(
                ModelData.recurringDiscountPercentage_WithAllDecimal,
              ).toFixed(12),
              DiscountedPrice: ModelData.recurringDiscountedPrice,
              Discount: RecurringDetails?.discounted,
              DiscountedTotal: RecurringDetails?.discountedTotal,
              VATPrice: RecurringDetails?.vat,
              GrandTotal: RecurringDetails?.grandTotal,
            });

            setRecurringFrequencyPricingInfo({
              ...RecurringFrequencyPricingInfo,
              OriginalPrice: ModelData.recurringOriginalPrice_WithAllDecimal,
              DefaultDiscount:
                ModelData.recurringDiscountPercentage_WithAllDecimal,
              DiscountedPrice: ModelData.recurringDiscountedPrice,
              Discount: RecurringDetails?.discounted,
              DiscountedTotal: RecurringDetails?.discountedTotal,
              VATPrice: RecurringDetails?.vat,
              GrandTotal: RecurringDetails?.grandTotal,
            });
            setOneOffPricingInfo({
              ...OneOffPricingInfo,
              OriginalPrice: ModelData.oneOffOriginalPrice,
              DefaultDiscount: Number(
                ModelData.oneOffDiscountPercentage_WithAllDecimal,
              ).toFixed(12),
              DiscountedPrice: ModelData.oneOffDiscountedPrice,
              Discount: OneOffDetails?.discounted,
              DiscountedTotal: OneOffDetails?.discountedTotal,
              VATPrice: OneOffDetails?.vat,
              GrandTotal: OneOffDetails?.grandTotal,
            });

            setOneOffPricingInfoCopy({
              ...OneOffPricingInfoCopy,
              OriginalPrice: ModelData.oneOffOriginalPrice,
              DefaultDiscount:
                ModelData.oneOffDiscountPercentage_WithAllDecimal,
              DiscountedPrice: ModelData.oneOffDiscountedPrice,
              Discount: OneOffDetails?.discounted,
              DiscountedTotal: OneOffDetails?.discountedTotal,
              VATPrice: OneOffDetails?.vat,
              GrandTotal: OneOffDetails?.grandTotal,
            });
          }
          let RecurringService = ModelData.reccrunigServiceCatList;
          let OneOffService = ModelData.oneOffServiceCatList;
          if (packageData.length !== 0) {
            const updateServicePackages = (
              services,
              servicesList,
              serviceChargeTypeID,
            ) => {
              // Filter the services that match the provided serviceChargeTypeID

              const serviceMappings = ServiceMappingWithPackagesList.filter(
                (item) => item.serviceChargeTypeID === serviceChargeTypeID,
              );

              return servicesList.map((SelectedService) => {
                // Find matching service mappings for the current SelectedService
                const matchedMappings = serviceMappings.filter(
                  (serviceMappingWithPackages) => {
                    return (
                      serviceMappingWithPackages.serviceCatID ===
                        services.serviceCatID &&
                      serviceMappingWithPackages.serviceID ===
                        SelectedService.serviceID
                    );
                  },
                );

                let packageOneValue = SelectedService.packageOneValue;
                let packageTwoValue = SelectedService.packageTwoValue;
                let packageThreeValue = SelectedService.packageThreeValue;

                // Loop through matchedMappings to update package values if a match is found
                matchedMappings.forEach((serviceMappingWithPackages) => {
                  //Set Package One Value
                  if (
                    PackageOneID === serviceMappingWithPackages.servicePackageID
                  ) {
                    packageOneValue =
                      serviceMappingWithPackages.priceWithAllDecimal !== null
                        ? serviceMappingWithPackages.priceWithAllDecimal
                        : SelectedService.packageOneValue;
                  }

                  //Set Package Two Value
                  if (
                    PackageTwoID === serviceMappingWithPackages.servicePackageID
                  ) {
                    packageTwoValue =
                      serviceMappingWithPackages.priceWithAllDecimal !== null
                        ? serviceMappingWithPackages.priceWithAllDecimal
                        : SelectedService.packageTwoValue;
                  }

                  //Set Package Three Value
                  if (
                    PackageThreeID ===
                    serviceMappingWithPackages.servicePackageID
                  ) {
                    packageThreeValue =
                      serviceMappingWithPackages.priceWithAllDecimal !== null
                        ? serviceMappingWithPackages.priceWithAllDecimal
                        : SelectedService.packageThreeValue;
                  }
                });

                // Return the updated SelectedService with new package values
                return {
                  ...SelectedService,
                  packageOneValue,
                  packageTwoValue,
                  packageThreeValue,
                };
              });
            };

            // Update RecurringService
            RecurringService = ModelData.reccrunigServiceCatList.map(
              (services) => {
                return {
                  ...services,
                  servicesList: updateServicePackages(
                    services,
                    services.servicesList,
                    1,
                  ), // serviceChargeTypeID for RecurringService is 1
                };
              },
            );

            // Update OneOffService
            OneOffService = ModelData.oneOffServiceCatList.map((services) => {
              return {
                ...services,
                servicesList: updateServicePackages(
                  services,
                  services.servicesList,
                  2,
                ), // serviceChargeTypeID for OneOffService is 2
              };
            });
          }

          setSelectedRecurringServiceList(RecurringService);
          setSelectedOneOffServiceList(OneOffService);
          setPackageList(packageData);
          setSelectedPackagesList(packageData);
          setFinalQuotationAmountList(finalQuotationAmountList);
          setCurrencyID(ModelData.currencyID);
          setCurrencySymbol(getCurrencySymbol(ModelData.currencyID));
          setTaxName(getTaxName(ModelData.currencyID));

          if (
            ModelData.statementOfFacts &&
            ModelData.statementOfFacts.trim() !== ""
          ) {
            // If SOF already saved while creating proposal
            setStatementOfFactsHTML(ModelData.statementOfFacts);
          } else {
            // If SOF not saved, generate it
            const generatedSOF = generateSOFHTML({
              moduleName: "Quote",
              ProposalObject: {
                selectedProposalTypeValue: ModelData.quoteTypeID,
              },
              selectedRecurringServiceList: RecurringService,
              selectedOneOffServiceList: OneOffService,
              additionalInformationList:
                ModelData.additionalInformationList || [],
              quoteAdditionalInfoGlobalPricingDriver:
                ModelData.quoteAdditionalInfoGlobalPricingDriver || [],
              StatementOfFact: ModelData.statementOfFact || [],
              formatValueWithoutCurrencySymbol,
            });

            setStatementOfFactsHTML(generatedSOF);
          }
        }
      } else {
        // setErrorMessage(data?.data?.errorMessage);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const selectedFrequency = Utils.Payment_Frequency.find(
    (item) => ProposalObject.Payment_Frequency == item.value,
  );
  const feeTypeValue = Utils.feeInProposal.find(
    (item) => ProposalObject.feeTypeId == item.value,
  );
  const PaymentGatewayValue = Utils.payment_gateway.find(
    (item) => ProposalObject.paymentGatewayID == item.value,
  );
  //HandleDownload
  const handleDownload = async (ContractKeyID) => {
    setLoader(true);
    if (ProposalObject.statusID !== statusID.Signed) {
      setModelRequestData({
        ...modelRequestData,
        ModuleName: "Quote",
        contractKeyID: location.state?.contractKeyID, // Change ClientKeyID to contractKeyID
        Action: "View",
      });
      let ViewPdfData = {
        ModuleName: "Quote",
        quoteKeyID: location.state?.quoteKeyID,
      };
      navigate("/view-pdf", { state: ViewPdfData });
    } else {
      try {
        const options = {
          method: "GET",
          headers: {
            Authorization: common.token,
          },
          responseType: "blob",
        };
        const response = await fetch(
          `${Base_Url}/SignEasy/DownloadDocumentAsZip?ContractKeyID=${location.state?.quoteKeyID}`,
          options,
        );
        // const response = await DownloadDocumentAsZip(ContractKeyID);

        if (!response) {
          throw new Error("Failed to download ZIP file");
        }
        // Convert the response to a blob
        const blob = await response.blob();
        // Create a temporary anchor element to trigger the download
        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        link.download = `${proposalName} for-${ProposalObject.clientName}.Zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setLoader(false);
      } catch (error) {
        setLoader(false);
        console.error("Error downloading ZIP file:", error);
      }
    }
  };
  const packageCount = selectedPackagesList.length;

  const getFontStyles = (servicePackageID, Type) => {
    let fontWeight = "400";
    let fontSize = "14px";

    if (Type === "Index") {
      fontWeight =
        acceptedPackageIndex === servicePackageID &&
        ProposalObject.statusID !== statusID.Declined
          ? "600"
          : "400";
      fontSize =
        acceptedPackageIndex === servicePackageID &&
        ProposalObject.statusID !== statusID.Declined
          ? "16px"
          : "14px"; // Adjust font size as needed
    } else {
      fontWeight =
        servicePackageID === ProposalObject.acceptedServicePackageID &&
        ProposalObject.statusID !== statusID.Declined
          ? "600"
          : "400";
      fontSize =
        servicePackageID === ProposalObject.acceptedServicePackageID &&
        ProposalObject.statusID !== statusID.Declined
          ? "16px"
          : "14px"; // Adjust font size as needed
    }

    return { fontWeight, fontSize };
  };

  const handleShowMore = () => {
    setVisibleCount((prev) => prev + 10);
  };

  const GetOnlyDate = (value) => {
    if (!value) return "";

    // Case 1: Format like "May 28 2025  6:03PM" or "May  9 2025  5:55PM"
    if (/[A-Za-z]{3}\s+\d{1,2}\s+\d{4}/.test(value)) {
      const [monthStr, day, year] = value.trim().split(/\s+/);
      const monthMap = {
        Jan: "01",
        Feb: "02",
        Mar: "03",
        Apr: "04",
        May: "05",
        Jun: "06",
        Jul: "07",
        Aug: "08",
        Sep: "09",
        Oct: "10",
        Nov: "11",
        Dec: "12",
      };
      const month = monthMap[monthStr];
      const formattedDay = day.padStart(2, "0");
      return `${formattedDay}/${month}/${year}`;
    }

    // Case 2: Format like "6/11/2025 10:21:35 AM"
    const [datePart] = value.split(" ");
    const [month, day, year] = datePart.split("/"); // US format mm/dd/yyyy
    const formattedDay = day.padStart(2, "0");
    const formattedMonth = month.padStart(2, "0");
    return `${formattedDay}/${formattedMonth}/${year}`;
  };

  const handleChangeFeesType = (e) => {
    const isRecurringDiscounted =
      Number(RecurringPricingInfo.DiscountedPrice) ===
      Number(RecurringPricingInfo.OriginalPrice);
    const isOneOffDiscounted =
      Number(OneOffPricingInfo.DiscountedPrice) ===
      Number(OneOffPricingInfo.OriginalPrice);

    const updatedProposalObj = {
      ...ProposalObject,
      feeTypeId: e.value,
    };

    if (e.value == 2 && isRecurringDiscounted && isOneOffDiscounted) {
      updatedProposalObj.DiscountLines = false;
    } else {
      updatedProposalObj.DiscountLines = true;
    }

    setProposalObject(updatedProposalObj);
  };

  const generateServiceDescription = () => {
    const fontFamily = "Arial, sans-serif";
    const fontSizeHeading = "14px";
    const fontSizeContent = "13px";

    const recurringServiceHtml =
      selectedRecurringServiceList
        ?.map(
          (serviceCat) => `
          <div>
            <p style="color: black; font-weight: bold; font-family: ${fontFamily}; font-size: ${fontSizeHeading};">
              ${serviceCat.serviceCatName || ""}
            </p>

            <hr style="color: gray; margin-top: -15px;" />

            ${
              serviceCat.servicesList
                ?.map(
                  (subService) => `
                    <p style="color: black; font-family: ${fontFamily}; font-size: ${fontSizeContent};">
                      ${subService.serviceName || ""}
                    </p>

                    ${
                      subService.serviceDescription?.trim()
                        ? `
                          <p style="color: black; font-family: ${fontFamily}; font-size: ${fontSizeContent};">
                            ${subService.serviceDescription}
                          </p>
                        `
                        : ""
                    }
                  `,
                )
                .join("") || ""
            }
          </div>
        `,
        )
        .join("") || "";

    const oneOffServiceHtml =
      selectedOneOffServiceList
        ?.map(
          (serviceCat) => `
          <div>
            <p style="color: black; font-weight: bold; font-family: ${fontFamily}; font-size: ${fontSizeHeading};">
              ${serviceCat.serviceCatName || ""}
            </p>

            <hr style="color: gray; margin-top: -15px;" />

            ${
              serviceCat.servicesList
                ?.map(
                  (subService) => `
                    <p style="color: black; font-family: ${fontFamily}; font-size: ${fontSizeContent};">
                      ${subService.serviceName || ""}
                    </p>

                    ${
                      subService.serviceDescription?.trim()
                        ? `
                          <p style="color: black; font-family: ${fontFamily}; font-size: ${fontSizeContent};">
                            ${subService.serviceDescription}
                          </p>
                        `
                        : ""
                    }
                  `,
                )
                .join("") || ""
            }
          </div>
        `,
        )
        .join("") || "";

    return recurringServiceHtml + oneOffServiceHtml;
  };

  const generateSOFHTML = (proposalData = {}) => {
    const fontFamily = "Arial, sans-serif";
    const fontSizeHeading = "18px";
    const fontSizeContent = "14px";
    const headingColor = "#b4aba6";
    const textColor = "black";

    const selectedRecurringServiceList =
      proposalData?.selectedRecurringServiceList || [];

    const selectedOneOffServiceList =
      proposalData?.selectedOneOffServiceList || [];

    const recurringHeading = "Recurring / Ongoing Services";
    const oneOffHeading = "One Off / Adhoc Services";
    const additionalInfoHeading = "Additional Information";

    const additionalInformationList =
      proposalData?.additionalInformationList || [];

    const quoteAdditionalInfoGlobalPricingDriver =
      proposalData?.quoteAdditionalInfoGlobalPricingDriver || [];

    const statementOfFact = proposalData?.StatementOfFact || [];

    const formatCurrency =
      proposalData?.formatValueWithoutCurrencySymbol ||
      ((value) => value ?? "");

    const getDriverValue = (driver, service = null) => {
      if (!driver) return "";

      if (driver.driverTypeID === 2) {
        return formatCurrency(driver.driverValue ?? driver.value);
      }

      if (driver.driverTypeID === 3) {
        if (service?.pricingDriverList && Array.isArray(driver.variation)) {
          return driver.variation.find((v) => v.isDefault)?.variationName || "";
        }

        return driver.variationName || "";
      }

      if (driver.driverTypeID === 4) {
        if (service?.pricingDriverList && Array.isArray(driver.slab)) {
          const slab = driver.slab.find((s) => s.isDefault);

          if (!slab) return "";

          return slab.slabTypeID === 2
            ? formatCurrency(slab.slabValue)
            : `${formatCurrency(slab.slabFrom)}-${formatCurrency(slab.slabTo)}`;
        }

        return driver.slabTypeID === 2
          ? formatCurrency(driver.driverValue ?? driver.value)
          : `${formatCurrency(driver.slabFrom)}-${formatCurrency(driver.slabTo)}`;
      }

      return "";
    };

    const generateMainHeading = (title) => {
      if (!title) return "";

      return `
      <p style="
        font-family: ${fontFamily};
        font-size: ${fontSizeHeading};
        color: ${headingColor};
        font-weight: bold;
      ">
        ${title}
      </p>
    `;
    };

    const generateServiceSection = (serviceList = []) => {
      return (
        serviceList
          ?.map(
            (cat) => `
            <div>
              <p style="
                color: ${textColor};
                font-family: ${fontFamily};
                font-size: ${fontSizeHeading};
                font-weight: bold;
              ">
                ${cat.serviceCatName || cat.serviceCategoryName || ""}
              </p>

              <hr style="color: gray; margin-top: -15px;" />

              ${
                cat.servicesList
                  ?.map((srv) => {
                    const drivers =
                      srv.globalPricingDriverList ||
                      srv.pricingDriverList ||
                      srv.gpdList ||
                      [];

                    return `
                      <p style="
                        color: ${textColor};
                        font-family: ${fontFamily};
                        font-size: ${fontSizeContent};
                      ">
                        ${srv.serviceName || ""}
                      </p>

                      ${
                        drivers
                          ?.filter((d) => d.driverVisibility !== false)
                          ?.filter((d) => d.driverTypeID !== 1)
                          ?.map(
                            (d) => `
                              <li style="
                                color: ${textColor};
                                font-family: ${fontFamily};
                                font-size: ${fontSizeContent};
                                margin-top: 5px;
                              ">
                                ${d.driverName || ""}: 
                                <strong>${getDriverValue(d, srv)}</strong>
                              </li>
                            `,
                          )
                          .join("") || ""
                      }
                    `;
                  })
                  .join("") || ""
              }
            </div>
          `,
          )
          .join("") || ""
      );
    };

    const generateAdditionalInfo = (list = []) => {
      const filteredList = list?.filter((d) => d.driverTypeID !== 1) || [];

      if (!filteredList.length) return "";

      return `
      <p style="
        font-family: ${fontFamily};
        font-size: ${fontSizeHeading};
        color: ${headingColor};
        font-weight: bold;
      ">
        ${additionalInfoHeading}
      </p>

      <hr style="color: gray; margin-top: -15px;" />

      ${
        filteredList
          .map((d) => {
            if (d.driverTypeID === 2) {
              return `
                <p style="
                  color: ${textColor};
                  font-family: ${fontFamily};
                  font-size: ${fontSizeContent};
                ">
                  ${d.driverName || ""}: 
                  <strong>${formatCurrency(d.driverValue ?? d.value)}</strong>
                </p>
              `;
            }

            if (d.driverTypeID === 3) {
              if (Array.isArray(d.variation)) {
                return d.variation
                  .filter((item) => item.isDefault)
                  .map(
                    (item) => `
                      <p style="
                        color: ${textColor};
                        font-family: ${fontFamily};
                        font-size: ${fontSizeContent};
                      ">
                        ${d.driverName || ""}: 
                        <strong>${item.variationName || ""}</strong>
                      </p>
                    `,
                  )
                  .join("");
              }

              return `
                <p style="
                  color: ${textColor};
                  font-family: ${fontFamily};
                  font-size: ${fontSizeContent};
                ">
                  ${d.driverName || ""}: 
                  <strong>${d.variationName || ""}</strong>
                </p>
              `;
            }

            if (d.driverTypeID === 4) {
              if (Array.isArray(d.slab)) {
                return d.slab
                  .filter((item) => item.isDefault)
                  .map(
                    (item) => `
                      <p style="
                        color: ${textColor};
                        font-family: ${fontFamily};
                        font-size: ${fontSizeContent};
                      ">
                        ${d.driverName || ""}: 
                        <strong>
                          ${
                            item.slabTypeID === 2
                              ? formatCurrency(item.slabValue)
                              : `${formatCurrency(item.slabFrom)}-${formatCurrency(
                                  item.slabTo,
                                )}`
                          }
                        </strong>
                      </p>
                    `,
                  )
                  .join("");
              }

              return `
                <p style="
                  color: ${textColor};
                  font-family: ${fontFamily};
                  font-size: ${fontSizeContent};
                ">
                  ${d.driverName || ""}: 
                  <strong>
                    ${
                      d.slabTypeID === 2
                        ? formatCurrency(d.driverValue ?? d.value)
                        : `${formatCurrency(d.slabFrom)}-${formatCurrency(
                            d.slabTo,
                          )}`
                    }
                  </strong>
                </p>
              `;
            }

            return "";
          })
          .join("") || ""
      }
    `;
    };

    const generatePackageSOF = () => {
      return (
        statementOfFact
          ?.map(
            (selectedPackage) => `
            <div style="
              padding-left: 40px;
              padding-right: 40px;
              font-family: ${fontFamily};
            ">
              <p style="
                color: ${headingColor};
                font-size: ${fontSizeHeading};
                font-weight: bold;
              ">
                Package Name: ${selectedPackage.servicePackageName || ""}
              </p>

              <hr style="color: gray; margin-top: -15px;" />

              ${
                selectedPackage.reccuring?.length
                  ? `
                    ${generateMainHeading(recurringHeading)}
                    ${generateServiceSection(
                      selectedPackage.reccuring?.map((cat) => ({
                        serviceCatName: cat.serviceCategoryName,
                        servicesList: cat.servicesList,
                      })) || [],
                    )}
                  `
                  : ""
              }

              ${
                selectedPackage.oneOff?.length
                  ? `
                    ${generateMainHeading(oneOffHeading)}
                    ${generateServiceSection(
                      selectedPackage.oneOff?.map((cat) => ({
                        serviceCatName: cat.serviceCategoryName,
                        servicesList: cat.servicesList,
                      })) || [],
                    )}
                  `
                  : ""
              }

              ${generateAdditionalInfo(
                selectedPackage.additionalInformationList || [],
              )}
            </div>
          `,
          )
          .join("") || ""
      );
    };

    if (
      proposalData?.moduleName === "Quote" &&
      proposalData?.ProposalObject?.selectedProposalTypeValue === 2
    ) {
      return generatePackageSOF();
    }

    const recurringHtml = selectedRecurringServiceList.length
      ? `
      ${generateMainHeading(recurringHeading)}
      ${generateServiceSection(selectedRecurringServiceList)}
    `
      : "";

    const oneOffHtml = selectedOneOffServiceList.length
      ? `
      ${generateMainHeading(oneOffHeading)}
      ${generateServiceSection(selectedOneOffServiceList)}
    `
      : "";

    const additionalInfoHtml = generateAdditionalInfo(
      additionalInformationList,
    );

    const quoteGlobalAdditionalInfoHtml = generateAdditionalInfo(
      quoteAdditionalInfoGlobalPricingDriver,
    );

    return `
    <div style="
      padding-left: 40px;
      padding-right: 40px;
      font-family: ${fontFamily};
    ">
      ${recurringHtml}
      ${oneOffHtml}
      ${additionalInfoHtml}
      ${quoteGlobalAdditionalInfoHtml}
    </div>
  `;
  };

  const serviceDescriptionHtmlGenerated = generateServiceDescription();

  console.log("generateServiceDescription", serviceDescriptionHtmlGenerated);

  const checkAllPackageDiscountPercentageValidation = (
    discountPercentage,
    CurrentValue,
  ) => {
    // Allow only numeric, dot, and negative sign characters and limit to 8 characters
    let sanitizedInput = discountPercentage
      .replace(/[^0-9.-]/g, "")
      .slice(0, 8);

    // Ensure the input is properly formatted with a hyphen if necessary
    sanitizedInput = hasHyphenAfterNumber(sanitizedInput);

    // Split the input into integer and decimal parts
    const [integerPart, decimalPart] = sanitizedInput.split(".");

    // Combine integer and decimal parts with appropriate precision
    let formattedInput;

    // Check if the input is within the valid range
    if (
      sanitizedInput === "-" ||
      (parseFloat(sanitizedInput) >= -999.0 &&
        parseFloat(sanitizedInput) <= 100)
    ) {
      if (decimalPart !== undefined) {
        if (integerPart.includes("-")) {
          // For negative values, ensure 4 digits after the negative sign
          formattedInput = `-${integerPart.slice(1, 4)}.${decimalPart.slice(
            0,
            2,
          )}`;
        } else {
          // For positive values, limit to 4 digits before the decimal point
          formattedInput = `${integerPart.slice(0, 3)}.${decimalPart.slice(
            0,
            2,
          )}`;
        }
      } else {
        // No decimal part, limit to 4 digits
        formattedInput = integerPart.includes("-")
          ? `-${integerPart.slice(1, 4)}`
          : `${integerPart.slice(0, 3)}`;
      }
      return formattedInput === undefined
        ? sanitizedInput === ""
          ? ""
          : CurrentValue
        : formattedInput;
    }
    return formattedInput === undefined
      ? sanitizedInput === ""
        ? ""
        : CurrentValue
      : formattedInput;
  };

  // Recurring service

  const hasVatColumn = (vatValue) => {
    return Number(vatValue || 0) !== 0;
  };

  const showRecurringVat = hasVatColumn(vatPercentage);
  const showOneOffVat = hasVatColumn(vatPercentage);

  // const selectedRecurringServiceList =
  //   ProposalObject?.reccrunigServiceCatList || [];

  const recurringFinalAmount =
    finalQuotationAmountList?.find(
      (item) => Number(item.serviceChargeTypeID) === 1,
    ) || null;

  const recurringVatPercentage = Number(
    recurringFinalAmount?.vatPercentage || 0,
  );

  const feesInQuoteID = Number(ProposalObject?.feeTypeId || 1);

  const showFullBreakdown = feesInQuoteID === 1;
  const showCheckMark = feesInQuoteID === 2;

  const toNumber = (value) => {
    const parsedValue = Number(value);
    return Number.isFinite(parsedValue) ? parsedValue : 0;
  };

  const roundCurrency = (value) => {
    return Math.round((toNumber(value) + Number.EPSILON) * 100) / 100;
  };

  const getServicePrice = (service) => {
    /*
     * Use quotationPrice because the API's final totals are calculated
     * from the individually rounded service prices.
     */
    return roundCurrency(service?.quotationPrice);
  };

  const getServiceVatRate = (service, fallbackVatRate = 0) => {
    const serviceVatRate = toNumber(service?.vatPercentage);

    /*
     * The current API returns 0 at service level but returns 20%
     * in finalQuotationAmountList, so use the summary VAT as fallback.
     */
    return serviceVatRate > 0 ? serviceVatRate : toNumber(fallbackVatRate);
  };

  const calculateRecurringFooterTotals = ({
    serviceCategories = [],
    fallbackVatRate = 0,
    discountPercentage = null,
    discountAmount = null,
  }) => {
    const recurringLines = [];

    serviceCategories.forEach((category) => {
      const services = Array.isArray(category?.servicesList)
        ? category.servicesList
        : [];

      services.forEach((service) => {
        const netAmount = getServicePrice(service);

        const vatRate = getServiceVatRate(service, fallbackVatRate);

        /*
         * Keep the existing service-level VAT rounding.
         */
        const vatAmount = roundCurrency((netAmount * vatRate) / 100);

        const amountIncludingVat = roundCurrency(netAmount + vatAmount);

        recurringLines.push({
          netAmount,
          vatRate,
          vatAmount,
          amountIncludingVat,
        });
      });
    });

    const originalNetTotal = roundCurrency(
      recurringLines.reduce((total, line) => total + line.netAmount, 0),
    );

    const originalVatTotal = roundCurrency(
      recurringLines.reduce((total, line) => total + line.vatAmount, 0),
    );

    const originalTotalIncludingVat = roundCurrency(
      recurringLines.reduce(
        (total, line) => total + line.amountIncludingVat,
        0,
      ),
    );

    /*
     * Effective VAT ratio supports service-wise VAT rates.
     */
    const effectiveVatRatio =
      originalNetTotal > 0 ? originalVatTotal / originalNetTotal : 0;

    const hasDiscountPercentage =
      discountPercentage !== null &&
      discountPercentage !== undefined &&
      discountPercentage !== "";

    let finalNetTotal = originalNetTotal;

    if (hasDiscountPercentage) {
      /*
       * Percentage is the primary source.
       *
       * Positive:
       *  10% => factor 0.90
       *
       * Negative:
       * -100% => factor 2.00
       */
      const percentage = toNumber(discountPercentage);

      const discountFactor = 1 - percentage / 100;

      finalNetTotal = roundCurrency(originalNetTotal * discountFactor);
    } else if (
      discountAmount !== null &&
      discountAmount !== undefined &&
      discountAmount !== ""
    ) {
      /*
       * Compatibility fallback for older proposals.
       *
       * Do not clamp the amount to >= 0 because a negative
       * amount represents a price increase.
       */
      finalNetTotal = roundCurrency(
        originalNetTotal - toNumber(discountAmount),
      );
    }

    /*
     * Difference between original and final.
     *
     * Positive value = normal discount.
     * Negative value = price increase.
     */
    const calculatedDiscountAmount = roundCurrency(
      originalNetTotal - finalNetTotal,
    );

    const hasPositiveDiscount = calculatedDiscountAmount > 0;

    const hasPriceIncrease = calculatedDiscountAmount < 0;

    /*
     * VAT should follow the same effective ratio.
     */
    const finalVatTotal = roundCurrency(finalNetTotal * effectiveVatRatio);

    const grandTotalIncludingVat = roundCurrency(finalNetTotal + finalVatTotal);

    const vatDiscount = roundCurrency(originalVatTotal - finalVatTotal);

    const discountIncludingVat = roundCurrency(
      calculatedDiscountAmount + vatDiscount,
    );

    return {
      lines: recurringLines,

      originalNetTotal,
      originalVatTotal,
      originalTotalIncludingVat,

      /*
       * Keep existing property names for the table.
       */
      discountAmount: calculatedDiscountAmount,
      vatDiscount,
      discountIncludingVat,

      finalNetTotal,
      finalVatTotal,
      grandTotalIncludingVat,

      hasPositiveDiscount,
      hasPriceIncrease,

      /*
       * Net Total display values.
       *
       * Negative discount behaves like the other custom tables:
       * show the increased final amount directly as Net Total.
       */
      displayNetTotal: hasPriceIncrease ? finalNetTotal : originalNetTotal,

      displayVatTotal: hasPriceIncrease ? finalVatTotal : originalVatTotal,

      displayTotalIncludingVat: hasPriceIncrease
        ? grandTotalIncludingVat
        : originalTotalIncludingVat,
    };
  };

  const recurringFallbackVatRate = Number(
    recurringFinalAmount?.vatPercentage || 0,
  );

  const recurringDiscountPercentage =
    RecurringFrequencyPricingInfo?.DefaultDiscount ??
    RecurringPricingInfo?.DefaultDiscount ??
    null;

  const recurringFooterTotals = calculateRecurringFooterTotals({
    serviceCategories: selectedRecurringServiceList || [],
    fallbackVatRate: recurringFallbackVatRate,
    discountPercentage: recurringDiscountPercentage,

    // Fallback for older proposals
    discountAmount: RecurringPricingInfo?.Discount ?? null,
  });

  const hasRecurringDiscount = recurringFooterTotals.discountAmount > 0;

  const showRecurringDiscountLine =
    hasRecurringDiscount && Boolean(ProposalObject?.DiscountLines);

  const recurringFooterDescriptionColumns = [
    {
      key: "serviceCategory",
      visible: visibleFieldsCustomTemp?.serviceCategory,
    },
    {
      key: "serviceName",
      visible: visibleFieldsCustomTemp?.serviceName,
    },
    {
      key: "serviceScope",
      visible: visibleFieldsCustomTemp?.serviceScope,
    },
  ].filter((column) => column.visible);

  const renderRecurringFooterLabel = (
    label,
    className = "tr-table-class text-white",
  ) => {
    return recurringFooterDescriptionColumns.map((column, index) => (
      <td
        key={`${label}-${column.key}`}
        className={index === 0 ? className : ""}
      >
        {index === 0 ? label : ""}
      </td>
    ));
  };

  // One-off sevice calculations

  const calculateOneOffServiceRow = ({ service, fallbackVatRate = 0 }) => {
    const price = roundCurrency(
      service?.price ??
        service?.quotationPriceWithAllDecimal ??
        service?.quotationPrice ??
        0,
    );

    const serviceVatRate = toNumber(
      service?.vatPercentage ?? service?.service_vat_percentage,
    );

    /*
     * The current API returns service VAT as 0,
     * while the one-off final amount returns 20%.
     */
    const vatRate =
      serviceVatRate > 0 ? serviceVatRate : toNumber(fallbackVatRate);

    const apiVatAmount = toNumber(
      service?.vatAmount ?? service?.service_vat_amount,
    );

    const calculatedVatAmount = roundCurrency((price * vatRate) / 100);

    const vatAmount =
      apiVatAmount > 0 ? roundCurrency(apiVatAmount) : calculatedVatAmount;

    const feesIncludingVat = roundCurrency(price + vatAmount);

    return {
      price,
      vatRate,
      vatAmount,
      feesIncludingVat,
    };
  };

  const calculateOneOffFooterTotals = ({
    serviceCategories = [],
    fallbackVatRate = 0,
    discountPercentage = null,
    discountAmount = null,
  }) => {
    const lines = [];

    serviceCategories.forEach((category) => {
      const services = Array.isArray(category?.servicesList)
        ? category.servicesList
        : [];

      services.forEach((service) => {
        lines.push(
          calculateOneOffServiceRow({
            service,
            fallbackVatRate,
          }),
        );
      });
    });

    const originalNetTotal = roundCurrency(
      lines.reduce((total, line) => total + line.price, 0),
    );

    const originalVatTotal = roundCurrency(
      lines.reduce((total, line) => total + line.vatAmount, 0),
    );

    const originalFeesIncludingVat = roundCurrency(
      lines.reduce((total, line) => total + line.feesIncludingVat, 0),
    );

    /*
     * Supports multiple VAT rates across services.
     */
    const effectiveVatRatio =
      originalNetTotal > 0 ? originalVatTotal / originalNetTotal : 0;

    const hasDiscountPercentage =
      discountPercentage !== null &&
      discountPercentage !== undefined &&
      discountPercentage !== "";

    let finalNetTotal = originalNetTotal;

    if (hasDiscountPercentage) {
      /*
       * Positive discount:
       * 10% => factor = 0.90
       *
       * Negative discount:
       * -100% => factor = 2.00
       */
      const percentage = toNumber(discountPercentage);

      const discountFactor = 1 - percentage / 100;

      finalNetTotal = roundCurrency(originalNetTotal * discountFactor);
    } else if (
      discountAmount !== null &&
      discountAmount !== undefined &&
      discountAmount !== ""
    ) {
      /*
       * Compatibility fallback for older proposals.
       */
      finalNetTotal = roundCurrency(
        originalNetTotal - toNumber(discountAmount),
      );
    }

    /*
     * Positive = normal discount
     * Negative = price increase
     */
    const calculatedDiscountAmount = roundCurrency(
      originalNetTotal - finalNetTotal,
    );

    const hasPositiveDiscount = calculatedDiscountAmount > 0;

    const hasPriceIncrease = calculatedDiscountAmount < 0;

    /*
     * VAT follows the same effective ratio.
     */
    const finalVatTotal = roundCurrency(finalNetTotal * effectiveVatRatio);

    const grandTotalIncludingVat = roundCurrency(finalNetTotal + finalVatTotal);

    const vatDiscount = roundCurrency(originalVatTotal - finalVatTotal);

    const discountIncludingVat = roundCurrency(
      calculatedDiscountAmount + vatDiscount,
    );

    return {
      lines,

      originalNetTotal,
      originalVatTotal,
      originalFeesIncludingVat,

      discountAmount: calculatedDiscountAmount,

      vatDiscount,
      discountIncludingVat,

      finalNetTotal,
      finalVatTotal,
      grandTotalIncludingVat,

      hasPositiveDiscount,
      hasPriceIncrease,

      /*
       * Display values for Net Total row.
       */
      displayNetTotal: hasPriceIncrease ? finalNetTotal : originalNetTotal,

      displayVatTotal: hasPriceIncrease ? finalVatTotal : originalVatTotal,

      displayFeesIncludingVat: hasPriceIncrease
        ? grandTotalIncludingVat
        : originalFeesIncludingVat,
    };
  };

  // const selectedOneOffServiceList = ProposalObject?.oneOffServiceCatList || [];

  const oneOffFinalAmount = finalQuotationAmountList?.find(
    (item) => Number(item?.serviceChargeTypeID) === 2,
  );

  const oneOffFallbackVatRate = toNumber(oneOffFinalAmount?.vatPercentage);

  const oneOffDiscountPercentage =
    OneOffPricingInfoCopy?.DefaultDiscount ??
    OneOffPricingInfo?.DefaultDiscount ??
    null;

  const oneOffFooterTotals = calculateOneOffFooterTotals({
    serviceCategories: selectedOneOffServiceList || [],

    fallbackVatRate: oneOffFallbackVatRate,

    discountPercentage: oneOffDiscountPercentage,

    // Fallback for older proposals
    discountAmount: OneOffPricingInfo?.Discount ?? null,
  });

  const oneOffFeesInQuoteID = Number(ProposalObject?.feeTypeId || 1);

  const showOneOffFullBreakdown = oneOffFeesInQuoteID === 1;

  const showOneOffCheckMark = oneOffFeesInQuoteID === 2;

  const hasOneOffDiscount = oneOffFooterTotals.discountAmount > 0;

  const showOneOffDiscountLine =
    hasOneOffDiscount && Boolean(ProposalObject?.DiscountLines);

  const oneOffFooterDescriptionColumns = [
    {
      key: "serviceCategory",
      visible: visibleFieldsCustomTemp?.serviceCategory,
    },
    {
      key: "serviceName",
      visible: visibleFieldsCustomTemp?.serviceName,
    },
    {
      key: "serviceScope",
      visible: visibleFieldsCustomTemp?.serviceScope,
    },
  ].filter((column) => column.visible);

  const renderOneOffFooterLabel = (
    label,
    className = "tr-table-class text-white",
  ) => {
    return oneOffFooterDescriptionColumns.map((column, index) => (
      <td
        key={`one-off-${label}-${column.key}`}
        className={index === 0 ? className : ""}
      >
        {index === 0 ? label : ""}
      </td>
    ));
  };

  // Recurring package row, and footer calculations:

  const GetSingleDefaultDiscountPercentageOfPackages = (
    packageOneDiscountPercentage,
    packageTwoDiscountPercentage,
    packageThreeDiscountPercentage,
  ) => {
    let DefaultDiscount = null;
    if (
      packageOneDiscountPercentage < 0 ||
      packageTwoDiscountPercentage < 0 ||
      packageThreeDiscountPercentage < 0
    ) {
      DefaultDiscount = -0.01;
    } else if (
      packageOneDiscountPercentage > 0 ||
      packageTwoDiscountPercentage > 0 ||
      packageThreeDiscountPercentage > 0
    ) {
      DefaultDiscount = 1.0;
    }
    return DefaultDiscount;
  };

  const handlePackageOneDiscountPercentage = (e) => {
    let InputValue = checkAllPackageDiscountPercentageValidation(
      e.target.value,
      RecurringPricingInfo.DiscountPercentagePackageOne,
    );

    // InputValue = InputValue.replace(
    //   /-/g,
    //   (match, index) => (index === 0 ? match : "")
    // )
    let DefaultDiscount = GetSingleDefaultDiscountPercentageOfPackages(
      InputValue,
      RecurringPricingInfo.DiscountPercentagePackageTwo,
      RecurringPricingInfo.DiscountPercentagePackageThree,
    );

    setRecurringPricingInfo({
      ...RecurringPricingInfo,
      DiscountPercentagePackageOne: InputValue,
      DefaultDiscount: DefaultDiscount,
    });
    setRecurringFrequencyPricingInfo({
      ...RecurringFrequencyPricingInfo,
      DiscountPercentagePackageOne: InputValue,
      DefaultDiscount: DefaultDiscount,
    });
  };

  const handlePackageTwoDiscountPercentage = (e) => {
    let InputValue = checkAllPackageDiscountPercentageValidation(
      e.target.value,
      RecurringPricingInfo.DiscountPercentagePackageTwo,
    );
    // InputValue = InputValue.replace(
    //   /-/g,
    //   (match, index) => (index === 0 ? match : "")
    // )
    let DefaultDiscount = GetSingleDefaultDiscountPercentageOfPackages(
      RecurringPricingInfo.DiscountPercentagePackageOne,
      InputValue,
      RecurringPricingInfo.DiscountPercentagePackageThree,
    );

    setRecurringPricingInfo({
      ...RecurringPricingInfo,
      DiscountPercentagePackageTwo: InputValue,
      DefaultDiscount: DefaultDiscount,
    });
    setRecurringFrequencyPricingInfo({
      ...RecurringFrequencyPricingInfo,
      DiscountPercentagePackageTwo: InputValue,
      DefaultDiscount: DefaultDiscount,
    });
  };

  const handlePackageThreeDiscountPercentage = (e) => {
    let InputValue = checkAllPackageDiscountPercentageValidation(
      e.target.value,
      RecurringPricingInfo.DiscountPercentagePackageThree,
    );
    // InputValue = InputValue.replace(
    //   /-/g,
    //   (match, index) => (index === 0 ? match : "")
    // )

    let DefaultDiscount = GetSingleDefaultDiscountPercentageOfPackages(
      RecurringPricingInfo.DiscountPercentagePackageOne,
      RecurringPricingInfo.DiscountPercentagePackageTwo,
      InputValue,
    );

    setRecurringPricingInfo({
      ...RecurringPricingInfo,
      DiscountPercentagePackageThree: InputValue,
      DefaultDiscount: DefaultDiscount,
    });
    setRecurringFrequencyPricingInfo({
      ...RecurringFrequencyPricingInfo,
      DiscountPercentagePackageThree: InputValue,
      DefaultDiscount: DefaultDiscount,
    });
  };

  const RECURRING_PACKAGE_PRICE_FIELDS = [
    "packageOneValue",
    "packageTwoValue",
    "packageThreeValue",
  ];

  const RECURRING_PACKAGE_DISCOUNT_PERCENTAGE_FIELDS = [
    "DiscountPercentagePackageOne",
    "DiscountPercentagePackageTwo",
    "DiscountPercentagePackageThree",
  ];

  const RECURRING_PACKAGE_DISCOUNT_AMOUNT_FIELDS = [
    "packageOneDisCount",
    "packageTwoDisCount",
    "packageThreeDisCount",
  ];

  const getPackageID = (packageItem) => {
    return (
      packageItem?.servicePackageID ??
      packageItem?.packageID ??
      packageItem?.id ??
      null
    );
  };

  const calculateRecurringPackageServiceRow = ({
    service,
    packageIndex,
    fallbackVatRate = 0,
  }) => {
    const packagePriceField = RECURRING_PACKAGE_PRICE_FIELDS[packageIndex];

    const rawPackagePrice = service?.[packagePriceField];

    const isIncluded =
      rawPackagePrice !== null &&
      rawPackagePrice !== undefined &&
      rawPackagePrice !== "";

    if (!isIncluded) {
      return {
        isIncluded: false,
        price: 0,
        vatRate: 0,
        vatAmount: 0,
        feesIncludingVat: 0,
      };
    }

    const price = roundCurrency(rawPackagePrice);

    const serviceVatRate = toNumber(
      service?.vatPercentage ?? service?.service_vat_percentage,
    );

    const vatRate =
      serviceVatRate > 0 ? serviceVatRate : toNumber(fallbackVatRate);

    /*
     * Package VAT must be calculated using the package price.
     * Do not use service.vatAmount because it may belong to
     * quotationPrice instead of packageOneValue/packageTwoValue.
     */
    const vatAmount = roundCurrency((price * vatRate) / 100);

    const feesIncludingVat = roundCurrency(price + vatAmount);

    return {
      isIncluded: true,
      price,
      vatRate,
      vatAmount,
      feesIncludingVat,
    };
  };

  const calculateRecurringPackageFooterTotals = ({
    serviceCategories = [],
    packageIndex,
    fallbackVatRate = 0,
    discountPercentage = 0,
    discountAmount = 0,
  }) => {
    const lines = [];

    serviceCategories.forEach((category) => {
      const services = Array.isArray(category?.servicesList)
        ? category.servicesList
        : [];

      services.forEach((service) => {
        const calculatedRow = calculateRecurringPackageServiceRow({
          service,
          packageIndex,
          fallbackVatRate,
        });

        if (calculatedRow.isIncluded) {
          lines.push(calculatedRow);
        }
      });
    });

    const originalNetTotal = roundCurrency(
      lines.reduce((total, line) => total + line.price, 0),
    );

    const originalVatTotal = roundCurrency(
      lines.reduce((total, line) => total + line.vatAmount, 0),
    );

    const originalFeesIncludingVat = roundCurrency(
      originalNetTotal + originalVatTotal,
    );

    /*
     * IMPORTANT:
     *
     * Do NOT clamp negative percentage to 0.
     *
     * Positive:
     *  50% => final = 50%
     *
     * Negative:
     * -100% => final = 200%
     */
    const hasDiscountPercentage =
      discountPercentage !== null &&
      discountPercentage !== undefined &&
      discountPercentage !== "";

    let validDiscountPercentage = hasDiscountPercentage
      ? toNumber(discountPercentage)
      : 0;

    let finalNetTotal = originalNetTotal;

    /*
     * Percentage is the main source because recurring
     * package discounts are percentage based.
     */
    if (hasDiscountPercentage && validDiscountPercentage !== 0) {
      const discountFactor = 1 - validDiscountPercentage / 100;

      finalNetTotal = roundCurrency(originalNetTotal * discountFactor);
    } else if (toNumber(discountAmount) !== 0) {
      /*
       * Compatibility fallback for older proposals.
       *
       * Positive discountAmount:
       * original - amount
       *
       * Negative discountAmount:
       * original - (-amount)
       * = price increase
       */
      finalNetTotal = roundCurrency(
        originalNetTotal - toNumber(discountAmount),
      );

      if (originalNetTotal > 0) {
        validDiscountPercentage =
          ((originalNetTotal - finalNetTotal) / originalNetTotal) * 100;
      }
    }

    /*
     * Difference between original and final:
     *
     * Positive => normal discount
     * Negative => price increase
     */
    const calculatedDiscountAmount = roundCurrency(
      originalNetTotal - finalNetTotal,
    );

    const hasPositiveDiscount = calculatedDiscountAmount > 0;

    const hasPriceIncrease = calculatedDiscountAmount < 0;

    /*
     * Calculate final VAT service by service.
     *
     * This preserves support for different VAT rates
     * across package services.
     */
    const discountFactor =
      originalNetTotal > 0 ? finalNetTotal / originalNetTotal : 1;

    const finalVatTotal = roundCurrency(
      lines.reduce((total, line) => {
        const finalLineNet = roundCurrency(line.price * discountFactor);

        const finalLineVat = roundCurrency((finalLineNet * line.vatRate) / 100);

        return total + finalLineVat;
      }, 0),
    );

    const vatDiscount = roundCurrency(originalVatTotal - finalVatTotal);

    const discountIncludingVat = roundCurrency(
      calculatedDiscountAmount + vatDiscount,
    );

    const grandTotalIncludingVat = roundCurrency(finalNetTotal + finalVatTotal);

    return {
      lines,

      originalNetTotal,
      originalVatTotal,
      originalFeesIncludingVat,

      discountPercentage: validDiscountPercentage,

      discountAmount: calculatedDiscountAmount,

      vatDiscount,
      discountIncludingVat,

      finalNetTotal,
      finalVatTotal,
      grandTotalIncludingVat,

      hasPositiveDiscount,
      hasPriceIncrease,
    };
  };

  const getCustomPackageTotalColumns = (vatValue) => {
    const serviceColumnCount = visibleFieldsCustomTemp?.serviceName ? 1 : 0;

    const packageColumnCount =
      (selectedPackagesList || []).length *
      getCustomPackageColumnSpan(vatValue);

    return serviceColumnCount + packageColumnCount;
  };

  const getCustomPackageColumnSpan = (vatValue) => {
    let count = 0;

    if (visibleFieldsCustomTemp?.fees) count += 1;

    if (hasVatColumn(vatValue) && visibleFieldsCustomTemp?.vatRate) count += 1;

    if (hasVatColumn(vatValue) && visibleFieldsCustomTemp?.vat) count += 1;

    if (hasVatColumn(vatValue) && visibleFieldsCustomTemp?.feesIncVat)
      count += 1;

    if (visibleFieldsCustomTemp?.serviceScope) count += 1;

    return count;
  };

  const renderCustomPackageNameHeader = (vatValue) => {
    return (
      <tr className="head-row">
        {visibleFieldsCustomTemp?.serviceName && (
          <th className="tr-table-class text-white text-center"></th>
        )}

        {(selectedPackagesList || []).map((pkg, index) => (
          <th
            key={`package-name-header-${index}`}
            colSpan={getCustomPackageColumnSpan(vatValue)}
            className="tr-table-class text-white text-center"
          >
            {pkg?.servicePackageName || ""}
          </th>
        ))}
      </tr>
    );
  };

  const renderCustomPackageSubHeader = (vatValue) => {
    return (
      <tr className="head-row">
        {visibleFieldsCustomTemp?.serviceName && (
          <th className="tr-table-class text-white text-center">Services</th>
        )}

        {(selectedPackagesList || []).map((pkg, index) => (
          <React.Fragment key={`package-sub-header-${index}`}>
            {visibleFieldsCustomTemp?.fees && (
              <th className="tr-table-class text-white text-center">
                Fees ({currencySymbol})
              </th>
            )}

            {hasVatColumn(vatValue) && visibleFieldsCustomTemp?.vatRate && (
              <th className="tr-table-class text-white text-center">
                {taxName} Rate
              </th>
            )}

            {hasVatColumn(vatValue) && visibleFieldsCustomTemp?.vat && (
              <th className="tr-table-class text-white text-center">
                {taxName} ({currencySymbol})
              </th>
            )}

            {hasVatColumn(vatValue) && visibleFieldsCustomTemp?.feesIncVat && (
              <th className="tr-table-class text-white text-center">
                Fees inc {taxName} ({currencySymbol})
              </th>
            )}

            {visibleFieldsCustomTemp?.serviceScope && (
              <th className="tr-table-class text-white text-center">
                Service Scope
              </th>
            )}
          </React.Fragment>
        ))}
      </tr>
    );
  };

  const renderCustomCategoryRow = (categoryName, vatValue) => {
    return (
      <tr className="a-la-carte-services-review-head-row">
        <th colSpan={getCustomPackageTotalColumns(vatValue)}>{categoryName}</th>
      </tr>
    );
  };

  const activeRecurringPackages = (selectedPackagesList || []).slice(
    0,
    packageCount,
  );

  const genericRecurringFinalAmount = finalQuotationAmountList?.find(
    (item) =>
      Number(item?.serviceChargeTypeID) === 1 && item?.servicePackageID == null,
  );

  const getRecurringPackageFallbackVatRate = (packageItem) => {
    const packageID = getPackageID(packageItem);

    const packageFinalAmount =
      packageID !== null
        ? finalQuotationAmountList?.find(
            (item) =>
              Number(item?.serviceChargeTypeID) === 1 &&
              String(item?.servicePackageID) === String(packageID),
          )
        : null;

    return toNumber(
      packageFinalAmount?.vatPercentage ??
        genericRecurringFinalAmount?.vatPercentage ??
        vatPercentage ??
        0,
    );
  };

  const recurringPackageFooterTotals = activeRecurringPackages.map(
    (packageItem, packageIndex) => {
      const percentageField =
        RECURRING_PACKAGE_DISCOUNT_PERCENTAGE_FIELDS[packageIndex];

      const amountField =
        RECURRING_PACKAGE_DISCOUNT_AMOUNT_FIELDS[packageIndex];

      return calculateRecurringPackageFooterTotals({
        serviceCategories: selectedRecurringServiceList || [],
        packageIndex,
        fallbackVatRate: getRecurringPackageFallbackVatRate(packageItem),
        discountPercentage: RecurringPricingInfo?.[percentageField] || 0,
        discountAmount: RecurringPricingInfo?.[amountField] || 0,
      });
    },
  );

  const recurringPackageFeesInQuoteID = Number(
    ProposalObject?.feesInQuoteID || 1,
  );

  const showRecurringPackageBreakdown = recurringPackageFeesInQuoteID === 1;

  const showRecurringPackageCheckMark = recurringPackageFeesInQuoteID === 2;

  const hasRecurringPackageDiscount = recurringPackageFooterTotals.some(
    (packageTotal) => packageTotal.hasPositiveDiscount,
  );

  const showRecurringPackageDiscountLines =
    hasRecurringPackageDiscount && Boolean(ProposalObject?.DiscountLines);

  const renderRecurringPackageScope = (subService) => {
    const driverList = Array.isArray(subService?.pricingDriverList)
      ? subService.pricingDriverList
      : [];

    if (driverList.length === 0) {
      return "-";
    }

    return driverList.map((driver, driverIndex) => (
      <div key={driver.driverID || `package-driver-${driverIndex}`}>
        {driver.driverName} = {driver.driverValue}
      </div>
    ));
  };

  // One-off package row, and footer calculations:

  const PACKAGE_PRICE_FIELDS = [
    "packageOneValue",
    "packageTwoValue",
    "packageThreeValue",
  ];

  const PACKAGE_DISCOUNT_PERCENTAGE_FIELDS = [
    "DiscountPercentagePackageOne",
    "DiscountPercentagePackageTwo",
    "DiscountPercentagePackageThree",
  ];

  const PACKAGE_DISCOUNT_AMOUNT_FIELDS = [
    "packageOneDisCount",
    "packageTwoDisCount",
    "packageThreeDisCount",
  ];

  const calculateOneOffPackageServiceRow = ({
    service,
    packageIndex,
    fallbackVatRate = 0,
  }) => {
    const packagePriceField = PACKAGE_PRICE_FIELDS[packageIndex];

    const rawPrice = service?.[packagePriceField];

    const isIncluded =
      rawPrice !== null && rawPrice !== undefined && rawPrice !== "";

    if (!isIncluded) {
      return {
        isIncluded: false,
        price: 0,
        vatRate: 0,
        vatAmount: 0,
        feesIncludingVat: 0,
      };
    }

    const price = roundCurrency(rawPrice);

    const serviceVatRate = toNumber(
      service?.vatPercentage ?? service?.service_vat_percentage,
    );

    const vatRate =
      serviceVatRate > 0 ? serviceVatRate : toNumber(fallbackVatRate);

    /*
     * Package VAT must be calculated from the package price.
     * Do not use service.vatAmount because it may be based on
     * quotationPrice instead of the package-specific value.
     */
    const vatAmount = roundCurrency((price * vatRate) / 100);

    const feesIncludingVat = roundCurrency(price + vatAmount);

    return {
      isIncluded: true,
      price,
      vatRate,
      vatAmount,
      feesIncludingVat,
    };
  };

  const calculateOneOffPackageFooterTotals = ({
    serviceCategories = [],
    packageIndex,
    fallbackVatRate = 0,
    discountPercentage = 0,
    discountAmount = 0,
  }) => {
    const lines = [];

    serviceCategories.forEach((category) => {
      const services = Array.isArray(category?.servicesList)
        ? category.servicesList
        : [];

      services.forEach((service) => {
        const calculatedRow = calculateOneOffPackageServiceRow({
          service,
          packageIndex,
          fallbackVatRate,
        });

        if (calculatedRow.isIncluded) {
          lines.push(calculatedRow);
        }
      });
    });

    const originalNetTotal = roundCurrency(
      lines.reduce((total, line) => total + line.price, 0),
    );

    const originalVatTotal = roundCurrency(
      lines.reduce((total, line) => total + line.vatAmount, 0),
    );

    const originalFeesIncludingVat = roundCurrency(
      originalNetTotal + originalVatTotal,
    );

    /*
     * Do not clamp negative discounts.
     *
     * +50%  => final = 50% of original
     * -100% => final = 200% of original
     */
    const hasDiscountPercentage =
      discountPercentage !== null &&
      discountPercentage !== undefined &&
      discountPercentage !== "";

    let validDiscountPercentage = hasDiscountPercentage
      ? toNumber(discountPercentage)
      : 0;

    let finalNetTotal = originalNetTotal;

    /*
     * Percentage is the main source.
     */
    if (hasDiscountPercentage && validDiscountPercentage !== 0) {
      const discountFactor = 1 - validDiscountPercentage / 100;

      finalNetTotal = roundCurrency(originalNetTotal * discountFactor);
    } else if (toNumber(discountAmount) !== 0) {
      /*
       * Fallback for older proposals.
       */
      finalNetTotal = roundCurrency(
        originalNetTotal - toNumber(discountAmount),
      );

      if (originalNetTotal > 0) {
        validDiscountPercentage =
          ((originalNetTotal - finalNetTotal) / originalNetTotal) * 100;
      }
    }

    /*
     * Positive = discount
     * Negative = price increase
     */
    const calculatedDiscountAmount = roundCurrency(
      originalNetTotal - finalNetTotal,
    );

    const hasPositiveDiscount = calculatedDiscountAmount > 0;

    const hasPriceIncrease = calculatedDiscountAmount < 0;

    /*
     * Calculate VAT using the same factor
     * service-by-service.
     */
    const discountFactor =
      originalNetTotal > 0 ? finalNetTotal / originalNetTotal : 1;

    const finalVatTotal = roundCurrency(
      lines.reduce((total, line) => {
        const finalLineNet = roundCurrency(line.price * discountFactor);

        const finalLineVat = roundCurrency((finalLineNet * line.vatRate) / 100);

        return total + finalLineVat;
      }, 0),
    );

    const vatDiscount = roundCurrency(originalVatTotal - finalVatTotal);

    const discountIncludingVat = roundCurrency(
      calculatedDiscountAmount + vatDiscount,
    );

    const grandTotalIncludingVat = roundCurrency(finalNetTotal + finalVatTotal);

    return {
      lines,

      originalNetTotal,
      originalVatTotal,
      originalFeesIncludingVat,

      discountPercentage: validDiscountPercentage,

      discountAmount: calculatedDiscountAmount,

      vatDiscount,
      discountIncludingVat,

      finalNetTotal,
      finalVatTotal,
      grandTotalIncludingVat,

      hasPositiveDiscount,
      hasPriceIncrease,
    };
  };

  const activeOneOffPackages = (selectedPackagesList || []).slice(
    0,
    packageCount,
  );

  const genericOneOffFinalAmount = finalQuotationAmountList?.find(
    (item) =>
      Number(item?.serviceChargeTypeID) === 2 && item?.servicePackageID == null,
  );

  // const getPackageID = (packageItem) => {
  //   return (
  //     packageItem?.servicePackageID ??
  //     packageItem?.packageID ??
  //     packageItem?.id ??
  //     null
  //   );
  // };

  const getOneOffPackageFallbackVatRate = (packageItem) => {
    const packageID = getPackageID(packageItem);

    const packageFinalAmount =
      packageID !== null
        ? finalQuotationAmountList?.find(
            (item) =>
              Number(item?.serviceChargeTypeID) === 2 &&
              String(item?.servicePackageID) === String(packageID),
          )
        : null;

    return toNumber(
      packageFinalAmount?.vatPercentage ??
        genericOneOffFinalAmount?.vatPercentage ??
        vatPercentage ??
        0,
    );
  };

  const oneOffPackageFooterTotals = activeOneOffPackages.map(
    (packageItem, packageIndex) => {
      const discountPercentageField =
        PACKAGE_DISCOUNT_PERCENTAGE_FIELDS[packageIndex];

      const discountAmountField = PACKAGE_DISCOUNT_AMOUNT_FIELDS[packageIndex];

      return calculateOneOffPackageFooterTotals({
        serviceCategories: selectedOneOffServiceList || [],
        packageIndex,
        fallbackVatRate: getOneOffPackageFallbackVatRate(packageItem),
        discountPercentage: OneOffPricingInfo?.[discountPercentageField] || 0,
        discountAmount: OneOffPricingInfo?.[discountAmountField] || 0,
      });
    },
  );

  const oneOffPackageFeesInQuoteID = Number(ProposalObject?.feesInQuoteID || 1);

  const showOneOffPackageBreakdown = oneOffPackageFeesInQuoteID === 1;

  const showOneOffPackageCheckMark = oneOffPackageFeesInQuoteID === 2;

  const hasOneOffPackageDiscount = oneOffPackageFooterTotals.some(
    (packageTotals) => packageTotals.hasPositiveDiscount,
  );

  const showOneOffPackageDiscountLines =
    hasOneOffPackageDiscount && Boolean(ProposalObject?.DiscountLines);

  const renderOneOffPackageScope = (subService) => {
    const driverList = Array.isArray(subService?.pricingDriverList)
      ? subService.pricingDriverList
      : [];

    if (driverList.length === 0) {
      return "-";
    }

    return driverList.map((driver, driverIndex) => (
      <div key={driver.driverID || `one-off-package-driver-${driverIndex}`}>
        {driver.driverName} = {driver.driverValue}
      </div>
    ));
  };

  const handleOneOffPackageOneDiscountPercentage = (e) => {
    let InputValue = checkAllPackageDiscountPercentageValidation(
      e.target.value,
      OneOffPricingInfoCopy.DiscountPercentagePackageOne,
    );
    // InputValue = InputValue.replace(
    //   /-/g,
    //   (match, index) => (index === 0 ? match : "")
    // )
    let DefaultDiscount = GetSingleDefaultDiscountPercentageOfPackages(
      InputValue,
      OneOffPricingInfoCopy.DiscountPercentagePackageTwo,
      OneOffPricingInfoCopy.DiscountPercentagePackageThree,
    );

    setOneOffPricingInfo({
      ...OneOffPricingInfo,
      DiscountPercentagePackageOne: InputValue,
      DefaultDiscount: DefaultDiscount,
    });
    setOneOffPricingInfoCopy({
      ...OneOffPricingInfoCopy,
      DiscountPercentagePackageOne: InputValue,
      DefaultDiscount: DefaultDiscount,
    });
  };

  const handleOneOffPackageTwoDiscountPercentage = (e) => {
    let InputValue = checkAllPackageDiscountPercentageValidation(
      e.target.value,
      OneOffPricingInfoCopy.DiscountPercentagePackageTwo,
    );
    // InputValue = InputValue.replace(
    //   /-/g,
    //   (match, index) => (index === 0 ? match : "")
    // )
    let DefaultDiscount = GetSingleDefaultDiscountPercentageOfPackages(
      OneOffPricingInfoCopy.DiscountPercentagePackageOne,
      InputValue,
      OneOffPricingInfoCopy.DiscountPercentagePackageThree,
    );

    setOneOffPricingInfo({
      ...OneOffPricingInfo,
      DiscountPercentagePackageTwo: InputValue,
      DefaultDiscount: DefaultDiscount,
    });
    setOneOffPricingInfoCopy({
      ...OneOffPricingInfoCopy,
      DiscountPercentagePackageTwo: InputValue,
      DefaultDiscount: DefaultDiscount,
    });
  };

  const handleOneOffPackageThreeDiscountPercentage = (e) => {
    let InputValue = checkAllPackageDiscountPercentageValidation(
      e.target.value,
      OneOffPricingInfoCopy.DiscountPercentagePackageThree,
    );
    // InputValue = InputValue.replace(
    //   /-/g,
    //   (match, index) => (index === 0 ? match : "")
    // )
    let DefaultDiscount = GetSingleDefaultDiscountPercentageOfPackages(
      OneOffPricingInfoCopy.DiscountPercentagePackageOne,
      OneOffPricingInfoCopy.DiscountPercentagePackageTwo,
      InputValue,
    );

    setOneOffPricingInfo({
      ...OneOffPricingInfo,
      DiscountPercentagePackageThree: InputValue,
      DefaultDiscount: DefaultDiscount,
    });
    setOneOffPricingInfoCopy({
      ...OneOffPricingInfoCopy,
      DiscountPercentagePackageThree: InputValue,
      DefaultDiscount: DefaultDiscount,
    });
  };

  return (
    <div className="container">
      {/* <div class="main-content"> */}
      <div class="page-content page-background prospect-bg">
        {/* <div class="page-info-header page-info-strip"> */}
        <div class="container">
          <div className="row">
            <div className="col-md-6 col-sm-6 col-6">
              <div class="prospects-title">
                <h5>
                  {/* {proposalName}:{" "} */}
                  Reference ID:
                  {isMobile
                    ? ProposalObject?.quotationName &&
                      ProposalObject?.quotationName.length > 15
                      ? `${ProposalObject?.quotationName.substring(0, 15)}...`
                      : ProposalObject?.quotationName
                    : ProposalObject?.quotationName}
                </h5>
              </div>
            </div>

            <div className="col-md-6 col-sm-6 col-6">
              <div className="d-flex justify-content-md-end justify-content-sm-end justify-content-end add-new-prospect">
                {ProposalObject.statusID == statusID.Signed && (
                  <Tooltip title={`Download ${proposalName} `}>
                    <button
                      className="btn btn-md btn-success create-item-btn"
                      onClick={handleDownload}
                    >
                      <i className="bi bi-download"></i>{" "}
                      <span className="d-none d-sm-inline">
                        Download {proposalName}
                      </span>
                    </button>
                  </Tooltip>
                )}
                {ProposalObject.statusID !== null &&
                  ProposalObject.statusID !== statusID.Signed && (
                    <Tooltip title={`View Pdf`}>
                      <button
                        className="btn btn-md btn-success create-item-btn"
                        onClick={handleDownload}
                      >
                        <i class="bi bi-eye"></i>{" "}
                        <span className="d-none d-sm-inline">View Pdf</span>
                      </button>
                    </Tooltip>
                  )}
                <Tooltip title={`Back`}>
                  <button
                    className="btn btn-md btn-success create-item-btn"
                    onClick={handleBack}
                    style={{ marginLeft: "10px" }}
                  >
                    <i className="fa fa-arrow-left d-md-none"></i>
                    <span className="d-none d-sm-inline">Back</span>
                  </button>
                </Tooltip>
              </div>
            </div>
          </div>
        </div>
        <div class="container-fluid ">
          <div class="row">
            <div class="col-lg-12">
              <div class="card" style={{ marginTop: "75px" }}>
                <div class="card-body">
                  <div id="customerList">
                    <div class="row g-4 mb-3"></div>
                    <div class="search-box ms-2 width-searchbox prospect-form">
                      <div class=" table-card  mb-3 Height_View_scroll scroll-hidden">
                        <ul class="nav nav-tabs mb-3" role="tablist">
                          <li class="nav-item">
                            <a
                              class="nav-link tab_nav active"
                              data-bs-toggle="tab"
                              href="#base-justified-home"
                              role="tab"
                              aria-selected="false"
                            >
                              Basic Information
                            </a>
                          </li>
                          <li class="nav-item">
                            <a
                              class="nav-link tab_nav"
                              data-bs-toggle="tab"
                              href="#product"
                              role="tab"
                              aria-selected="false"
                            >
                              Selected Services
                            </a>
                          </li>
                          <li class="nav-item">
                            <a
                              class="nav-link tab_nav"
                              data-bs-toggle="tab"
                              href="#service_description"
                              role="tab"
                              aria-selected="false"
                            >
                              Service Description
                            </a>
                          </li>
                          <li class="nav-item">
                            <a
                              class="nav-link tab_nav"
                              data-bs-toggle="tab"
                              href="#sof"
                              role="tab"
                              aria-selected="false"
                            >
                              Statment Of Facts
                            </a>
                          </li>
                          <li class="nav-item">
                            <a
                              class="nav-link tab_nav"
                              data-bs-toggle="tab"
                              href="#Officer"
                              role="tab"
                              aria-selected="false"
                            >
                              All Officers
                            </a>
                          </li>
                        </ul>

                        <div class="tab-content  text-muted">
                          <div
                            class="tab-pane active"
                            id="base-justified-home"
                            role="tabpanel"
                          >
                            <table class="table table-striped fs-13 view-details-table">
                              <tbody>
                                <tr>
                                  <td class="break-table" colspan="2"></td>
                                </tr>
                                <tr>
                                  <th colspan="2">Basic Information</th>
                                </tr>
                                <tr>
                                  <td>{prospectName} Name</td>
                                  <td class="text-end">
                                    {ProposalObject.clientName}
                                  </td>
                                </tr>
                                <tr>
                                  <td>Template</td>
                                  <td class="text-end">
                                    {ProposalObject.templateName}
                                  </td>
                                </tr>
                                <tr>
                                  <td>Proposal Type</td>
                                  <td class="text-end">
                                    {ProposalObject.quoteTypeName}
                                  </td>
                                </tr>
                                {ProposalObject.draftOn && (
                                  <tr>
                                    <td>Drafted On</td>
                                    <td class="text-end">
                                      {GetOnlyDate(ProposalObject.draftOn)}
                                    </td>
                                  </tr>
                                )}
                                {ProposalObject.sentOn && (
                                  <tr>
                                    <td>Sent On</td>
                                    <td class="text-end">
                                      {GetOnlyDate(ProposalObject.sentOn)}
                                    </td>
                                  </tr>
                                )}
                                {ProposalObject.AcceptedOn && (
                                  <tr>
                                    <td>Accepted On</td>
                                    <td class="text-end">
                                      {GetOnlyDate(ProposalObject.AcceptedOn)}
                                    </td>
                                  </tr>
                                )}

                                {ProposalObject.SkippedOn && (
                                  <tr>
                                    <td>Skipped On</td>
                                    <td class="text-end">
                                      {GetOnlyDate(ProposalObject.SkippedOn)}
                                    </td>
                                  </tr>
                                )}
                                {ProposalObject.contractKeyID
                                  ?.slice(0, visibleCount)
                                  .map((contract) => (
                                    <tr>
                                      <td>Linked Engagement Letter</td>
                                      <td
                                        class="text-end"
                                        style={{
                                          color: "blue",
                                          cursor: "pointer",
                                        }}
                                        onClick={() =>
                                          navigate("/view-letter", {
                                            state: {
                                              contractKeyID: contract,
                                            },
                                          })
                                        }
                                      >
                                        View EL
                                      </td>
                                    </tr>
                                  ))}
                              </tbody>
                            </table>
                            {visibleCount <
                              ProposalObject.contractKeyID?.length && (
                              <div className="text-left mt-3">
                                <button
                                  onClick={handleShowMore}
                                  className="btn btn-primary"
                                >
                                  Show More
                                </button>
                              </div>
                            )}
                          </div>

                          <div
                            style={{ width: "98%" }}
                            class="tab-pane"
                            id="product"
                            role="tabpanel"
                          >
                            {packageList.length > 0 ? (
                              <>
                                <div>
                                  <div className="tab-content">
                                    <div className="tab-pane p-3 active">
                                      <div className="row">
                                        <div className="row fieldset">
                                          <div className="col-lg-3 text-lg-right">
                                            <label className="fieldset-label required">
                                              Fees in the {proposalName}
                                            </label>
                                          </div>
                                          <div className="col-lg-9">
                                            <div className="input-group">
                                              {/* Add your Select component here */}
                                              <Select
                                                // isDisabled
                                                className="phone-input-country-code selectDropDown Drop-down-width"
                                                value={feeTypeValue}
                                                options={Utils.feeInProposal}
                                                onChange={handleChangeFeesType}
                                              />
                                            </div>
                                          </div>
                                        </div>
                                        {ProposalObject.paymentGatewayID !==
                                          null && (
                                          <div className="row fieldset">
                                            <div className="col-lg-3 text-lg-right">
                                              <label className="fieldset-label required">
                                                Payment Gateway
                                                <span className="text-danger">
                                                  *
                                                </span>
                                              </label>
                                            </div>
                                            <div className="col-md-9 mb-2">
                                              <div className="input-group">
                                                {/* Adjust the Select component as needed */}
                                                <Select
                                                  isDisabled
                                                  className="phone-input-country-code selectDropDown Drop-down-width"
                                                  value={PaymentGatewayValue}
                                                />
                                              </div>
                                            </div>
                                          </div>
                                        )}
                                        <div className="row fieldset">
                                          <div className="col-lg-3 text-lg-right">
                                            <label className="fieldset-label required">
                                              Show Discount
                                            </label>
                                          </div>
                                          <div className="col-lg-9">
                                            <div className="input-group">
                                              {/* Replace Select with Checkbox */}
                                              <input
                                                type="checkbox"
                                                disabled
                                                checked={
                                                  ProposalObject.DiscountLines
                                                }
                                              />
                                            </div>
                                          </div>
                                        </div>
                                        {ProposalObject.acceptedServicePackageID !==
                                          null &&
                                          ProposalObject.statusID !==
                                            statusID.Declined && (
                                            <div className="row fieldset mt-2">
                                              <div className="col-lg-3 text-lg-right">
                                                <label className="fieldset-label required">
                                                  Accepted Package
                                                </label>
                                              </div>
                                              <div className="col-lg-9">
                                                <div className="input-group">
                                                  <label className="fieldset-label required">
                                                    {acceptedPackageName}
                                                  </label>
                                                </div>
                                              </div>
                                            </div>
                                          )}
                                      </div>
                                    </div>
                                  </div>
                                  {selectedRecurringServiceList?.length !==
                                    0 && (
                                    <div className="tab-content">
                                      <div className="tab-pane p-3 active">
                                        <div className="row">
                                          <div className="col-lg-12">
                                            <div className="separator mb-2"></div>
                                            <h6>Recurring Services</h6>
                                            <div className="separator mb-3"></div>

                                            <div
                                              className="row"
                                              id="recurring_Default"
                                            >
                                              <div class="col-lg-2 mb-1 col-md-2 col-sm-12 mt-2 text-md-end">
                                                {packageCount == 1 && (
                                                  <label className="fieldset-label">
                                                    Discount (%)
                                                  </label>
                                                )}
                                              </div>
                                              <div className="col-lg-4">
                                                {packageCount == 1 && (
                                                  <input
                                                    readonly=""
                                                    className="input-text"
                                                    type="number" // Change type to number
                                                    placeholder="Default Discount (%)"
                                                    value={Number(
                                                      Math.floor(
                                                        RecurringPricingInfo.DefaultDiscount *
                                                          100,
                                                      ) / 100,
                                                    )
                                                      .toFixed(2)
                                                      .replace(
                                                        /\B(?=(\d{3})+(?!\d))/g,
                                                        ",",
                                                      )}
                                                  />
                                                )}
                                              </div>
                                              <div className="col-lg-2 text-lg-right">
                                                <label className="fieldset-label required mt-2">
                                                  Payment Frequency
                                                </label>
                                              </div>
                                              <div className="col-lg-4">
                                                <Select
                                                  isDisabled
                                                  className="phone-input-country-code selectDropDown Drop-down-width"
                                                  value={selectedFrequency}
                                                />
                                              </div>
                                            </div>
                                            <div className="row fieldset"></div>
                                            <div className="mb-3"></div>

                                            {/* Recurring Table */}
                                            {pricingTableColumnIDs === null ||
                                            pricingTableColumnIDs === "" ||
                                            pricingTableColumnIDs ===
                                              undefined ? (
                                              <div
                                                style={{ marginTop: "0px" }}
                                                className="table-responsive"
                                              >
                                                <table
                                                  class="table align-middle table-nowrap"
                                                  style={{ width: "100%" }}
                                                >
                                                  <thead className="table-light table-header-font">
                                                    <tr className="head-row">
                                                      <td className="tr-table-class text-white">
                                                        Services
                                                      </td>
                                                      {selectedPackagesList.map(
                                                        (pkg, index) => (
                                                          <td
                                                            key={index}
                                                            style={{
                                                              fontWeight:
                                                                getFontStyles(
                                                                  selectedPackagesList[
                                                                    index
                                                                  ]
                                                                    .servicePackageID,
                                                                  "ID",
                                                                ).fontWeight,
                                                              fontSize:
                                                                getFontStyles(
                                                                  selectedPackagesList[
                                                                    index
                                                                  ]
                                                                    .servicePackageID,
                                                                  "ID",
                                                                ).fontSize,
                                                            }}
                                                            className="tr-table-class text-white text-right"
                                                          >
                                                            {pkg
                                                              .servicePackageName
                                                              .length > 10 ? (
                                                              <Tooltip
                                                                title={
                                                                  pkg.servicePackageName
                                                                }
                                                              >
                                                                {pkg.servicePackageName
                                                                  .substring(
                                                                    0,
                                                                    10,
                                                                  )
                                                                  .toLowerCase()
                                                                  .replace(
                                                                    /\b\w/g,
                                                                    (l) =>
                                                                      l.toUpperCase(),
                                                                  ) + "..."}
                                                              </Tooltip>
                                                            ) : pkg
                                                                .servicePackageName
                                                                .length > 10 ? (
                                                              <Tooltip
                                                                title={
                                                                  pkg.servicePackageName
                                                                }
                                                              >
                                                                {pkg.servicePackageName.substring(
                                                                  0,
                                                                  10,
                                                                ) + "..."}
                                                              </Tooltip>
                                                            ) : (
                                                              pkg.servicePackageName
                                                            )}
                                                          </td>
                                                        ),
                                                      )}
                                                    </tr>
                                                  </thead>
                                                  <tbody>
                                                    {selectedRecurringServiceList.map(
                                                      (service, index) => {
                                                        return (
                                                          <>
                                                            <tr className="a-la-carte-services-review-head-row">
                                                              <th
                                                                colSpan={
                                                                  1 +
                                                                  packageCount
                                                                }
                                                              >
                                                                {
                                                                  service.serviceCatName
                                                                }
                                                              </th>
                                                            </tr>
                                                            {service.servicesList.map(
                                                              (
                                                                subService,
                                                                subIndex,
                                                              ) => (
                                                                <tr
                                                                  key={subIndex}
                                                                  className={` ${
                                                                    subService?.isAdditionalService ===
                                                                    true
                                                                      ? "bg-info  text-white"
                                                                      : ""
                                                                  }`}
                                                                >
                                                                  <td>
                                                                    <div>
                                                                      {subService
                                                                        .serviceName
                                                                        .length >
                                                                      45
                                                                        ? subService.serviceName
                                                                            .substring(
                                                                              0,
                                                                              45,
                                                                            )
                                                                            .toLowerCase()
                                                                            .replace(
                                                                              /\b\w/g,
                                                                              (
                                                                                l,
                                                                              ) =>
                                                                                l.toUpperCase(),
                                                                            ) +
                                                                          "..."
                                                                        : subService.serviceName}
                                                                    </div>
                                                                    <div className="package-variables"></div>
                                                                  </td>

                                                                  <td
                                                                    style={{
                                                                      fontWeight:
                                                                        getFontStyles(
                                                                          0,
                                                                          "Index",
                                                                        )
                                                                          .fontWeight,
                                                                      fontSize:
                                                                        getFontStyles(
                                                                          0,
                                                                          "Index",
                                                                        )
                                                                          .fontSize,
                                                                    }}
                                                                    className="text-right"
                                                                  >
                                                                    {ProposalObject.feeTypeId ===
                                                                    1 ? (
                                                                      <>
                                                                        {" "}
                                                                        {subService.packageOneValue ===
                                                                        null ? (
                                                                          <span className="fa fa-times"></span>
                                                                        ) : (
                                                                          formatValue(
                                                                            subService.packageOneValue,
                                                                          )
                                                                        )}
                                                                      </>
                                                                    ) : subService.packageOneValue !==
                                                                      null ? (
                                                                      <span className="fa fa-check"></span>
                                                                    ) : (
                                                                      <span className="fa fa-times"></span>
                                                                    )}
                                                                  </td>
                                                                  {packageCount >=
                                                                    2 && (
                                                                    <td
                                                                      style={{
                                                                        fontWeight:
                                                                          getFontStyles(
                                                                            1,
                                                                            "Index",
                                                                          )
                                                                            .fontWeight,
                                                                        fontSize:
                                                                          getFontStyles(
                                                                            1,
                                                                            "Index",
                                                                          )
                                                                            .fontSize,
                                                                      }}
                                                                      className="text-right"
                                                                    >
                                                                      {ProposalObject.feeTypeId ===
                                                                      1 ? (
                                                                        <>
                                                                          {" "}
                                                                          {
                                                                            subService.packageTwoValue ===
                                                                            null ? (
                                                                              <span className="fa fa-times"></span>
                                                                            ) : (
                                                                              formatValue(
                                                                                subService.packageTwoValue,
                                                                              )
                                                                            )
                                                                            // Number(
                                                                            //   subService.packageTwoValue
                                                                            // )
                                                                            //   .toFixed(2)
                                                                            //   .toString()
                                                                            //   .replace(
                                                                            //     /\B(?=(\d{3})+(?!\d))/g,
                                                                            //     ","
                                                                            //   )
                                                                          }
                                                                        </>
                                                                      ) : subService.packageTwoValue !==
                                                                        null ? (
                                                                        <span className="fa fa-check"></span>
                                                                      ) : (
                                                                        <span className="fa fa-times"></span>
                                                                      )}
                                                                    </td>
                                                                  )}
                                                                  {packageCount ===
                                                                    3 && (
                                                                    <td
                                                                      style={{
                                                                        fontWeight:
                                                                          getFontStyles(
                                                                            2,
                                                                            "Index",
                                                                          )
                                                                            .fontWeight,
                                                                        fontSize:
                                                                          getFontStyles(
                                                                            2,
                                                                            "Index",
                                                                          )
                                                                            .fontSize,
                                                                      }}
                                                                      className="text-right"
                                                                    >
                                                                      {ProposalObject.feeTypeId ===
                                                                      1 ? (
                                                                        <>
                                                                          {" "}
                                                                          {
                                                                            subService.packageThreeValue ===
                                                                            null ? (
                                                                              <span className="fa fa-times"></span>
                                                                            ) : (
                                                                              formatValue(
                                                                                subService.packageThreeValue,
                                                                              )
                                                                            )
                                                                            // Number(
                                                                            //   subService.packageThreeValue
                                                                            // )
                                                                            //   .toFixed(2)
                                                                            //   .toString()
                                                                            //   .replace(
                                                                            //     /\B(?=(\d{3})+(?!\d))/g,
                                                                            //     ","
                                                                            //   )
                                                                          }
                                                                        </>
                                                                      ) : subService.packageThreeValue !==
                                                                        null ? (
                                                                        <span className="fa fa-check"></span>
                                                                      ) : (
                                                                        <span className="fa fa-times"></span>
                                                                      )}
                                                                    </td>
                                                                  )}
                                                                </tr>
                                                              ),
                                                            )}
                                                          </>
                                                        );
                                                      },
                                                    )}
                                                  </tbody>
                                                  {packageCount > 1 && (
                                                    <>
                                                      <tr id="recurring_DefaultWithPackages">
                                                        <td>
                                                          <div>
                                                            Discount (%)
                                                          </div>
                                                          {/* <div className="package-variables"></div> */}
                                                        </td>

                                                        <td
                                                          style={{
                                                            width: "35%",
                                                            padding: "0px",
                                                            whiteSpace:
                                                              "normal",
                                                          }}
                                                        >
                                                          <div
                                                            style={{
                                                              display: "flex",
                                                              flexDirection:
                                                                "column",
                                                              alignItems:
                                                                "flex-start",
                                                            }}
                                                          >
                                                            <input
                                                              readOnly
                                                              className="input-text"
                                                              type="number" // Change type to number
                                                              placeholder="Discount (%)"
                                                              value={Number(
                                                                RecurringPricingInfo.DiscountPercentagePackageOne,
                                                              )
                                                                .toFixed(2)
                                                                .replace(
                                                                  /\B(?=(\d{3})+(?!\d))/g,
                                                                  ",",
                                                                )}
                                                              style={{
                                                                width: "100%",
                                                                textAlign:
                                                                  "right",
                                                              }}
                                                            />
                                                          </div>
                                                        </td>

                                                        {packageCount >= 2 && (
                                                          <td
                                                            style={{
                                                              width: "35%",
                                                              padding: "0px",
                                                              whiteSpace:
                                                                "normal",
                                                            }}
                                                          >
                                                            <div
                                                              style={{
                                                                display: "flex",
                                                                flexDirection:
                                                                  "column",
                                                                alignItems:
                                                                  "flex-start",
                                                              }}
                                                            >
                                                              <input
                                                                readOnly
                                                                className="input-text"
                                                                type="number" // Change type to number
                                                                placeholder="Discount (%)"
                                                                value={Number(
                                                                  RecurringPricingInfo.DiscountPercentagePackageTwo,
                                                                )
                                                                  .toFixed(2)
                                                                  .replace(
                                                                    /\B(?=(\d{3})+(?!\d))/g,
                                                                    ",",
                                                                  )}
                                                                style={{
                                                                  width: "100%",
                                                                  textAlign:
                                                                    "right",
                                                                }}
                                                              />
                                                              <div></div>
                                                            </div>
                                                          </td>
                                                        )}

                                                        {packageCount === 3 && (
                                                          <td
                                                            style={{
                                                              width: "35%",
                                                              padding: "0px",
                                                              whiteSpace:
                                                                "normal",
                                                            }}
                                                          >
                                                            <div
                                                              style={{
                                                                display: "flex",
                                                                flexDirection:
                                                                  "column",
                                                                alignItems:
                                                                  "flex-start",
                                                              }}
                                                            >
                                                              <input
                                                                readOnly
                                                                className="input-text"
                                                                type="number" // Change type to number
                                                                placeholder="Discount (%)"
                                                                value={Number(
                                                                  RecurringPricingInfo.DiscountPercentagePackageThree,
                                                                )
                                                                  .toFixed(2)
                                                                  .replace(
                                                                    /\B(?=(\d{3})+(?!\d))/g,
                                                                    ",",
                                                                  )}
                                                                style={{
                                                                  width: "100%",
                                                                  textAlign:
                                                                    "right",
                                                                }}
                                                              />
                                                            </div>
                                                          </td>
                                                        )}
                                                      </tr>
                                                    </>
                                                  )}
                                                  <tr className="head-row">
                                                    <td className="tr-table-class font-14 text-white">
                                                      Net Total
                                                    </td>
                                                    <td
                                                      style={{
                                                        fontWeight:
                                                          getFontStyles(
                                                            0,
                                                            "Index",
                                                          ).fontWeight,
                                                        fontSize: getFontStyles(
                                                          0,
                                                          "Index",
                                                        ).fontSize,
                                                      }}
                                                      className="tr-table-class font-14 text-white text-right"
                                                    >
                                                      {" "}
                                                      {Number(
                                                        RecurringPricingInfo.packageOneNetTotal,
                                                      ) <
                                                        Number(
                                                          RecurringPricingInfo.packageOneDisCountedTotal,
                                                        ) ||
                                                      (Number(
                                                        RecurringPricingInfo.packageOneDisCount,
                                                      ) > 0 &&
                                                        !ProposalObject.DiscountLines)
                                                        ? formatValue(
                                                            RecurringPricingInfo.packageOneDisCountedTotal,
                                                          )
                                                        : formatValue(
                                                            RecurringPricingInfo.packageOneNetTotal,
                                                          )}
                                                    </td>
                                                    {packageCount >= 2 && (
                                                      <td
                                                        style={{
                                                          fontWeight:
                                                            getFontStyles(
                                                              1,
                                                              "Index",
                                                            ).fontWeight,
                                                          fontSize:
                                                            getFontStyles(
                                                              1,
                                                              "Index",
                                                            ).fontSize,
                                                        }}
                                                        className="tr-table-class font-14 text-white text-right"
                                                      >
                                                        {" "}
                                                        {Number(
                                                          RecurringPricingInfo.packageTwoNetTotal,
                                                        ) <
                                                          Number(
                                                            RecurringPricingInfo.packageTwoDisCountedTotal,
                                                          ) ||
                                                        (Number(
                                                          RecurringPricingInfo.packageTwoDisCount,
                                                        ) > 0 &&
                                                          !ProposalObject.DiscountLines)
                                                          ? formatValue(
                                                              RecurringPricingInfo.packageTwoDisCountedTotal,
                                                            )
                                                          : formatValue(
                                                              RecurringPricingInfo.packageTwoNetTotal,
                                                            )}
                                                      </td>
                                                    )}{" "}
                                                    {packageCount === 3 && (
                                                      <td
                                                        style={{
                                                          fontWeight:
                                                            getFontStyles(
                                                              2,
                                                              "Index",
                                                            ).fontWeight,
                                                          fontSize:
                                                            getFontStyles(
                                                              2,
                                                              "Index",
                                                            ).fontSize,
                                                        }}
                                                        className="tr-table-class font-14 text-white text-right"
                                                      >
                                                        {" "}
                                                        {Number(
                                                          RecurringPricingInfo.packageThreeNetTotal,
                                                        ) <
                                                          Number(
                                                            RecurringPricingInfo.packageThreeDisCountedTotal,
                                                          ) ||
                                                        (Number(
                                                          RecurringPricingInfo.packageThreeDisCount,
                                                        ) > 0 &&
                                                          !ProposalObject.DiscountLines)
                                                          ? formatValue(
                                                              RecurringPricingInfo.packageThreeDisCountedTotal,
                                                            )
                                                          : formatValue(
                                                              RecurringPricingInfo.packageThreeNetTotal,
                                                            )}
                                                      </td>
                                                    )}
                                                  </tr>

                                                  {(Number(
                                                    RecurringPricingInfo.packageThreeDisCount,
                                                  ) > 0 ||
                                                    Number(
                                                      RecurringPricingInfo.packageOneDisCount,
                                                    ) > 0 ||
                                                    Number(
                                                      RecurringPricingInfo.packageTwoDisCount,
                                                    ) > 0) &&
                                                    ProposalObject.DiscountLines && (
                                                      <>
                                                        <tr className="head-grey-row">
                                                          <td className="tr-table-class font-14  text-white">
                                                            Discount
                                                          </td>
                                                          <td
                                                            style={{
                                                              fontWeight:
                                                                getFontStyles(
                                                                  0,
                                                                  "Index",
                                                                ).fontWeight,
                                                              fontSize:
                                                                getFontStyles(
                                                                  0,
                                                                  "Index",
                                                                ).fontSize,
                                                            }}
                                                            className="tr-table-class font-14 text-white text-right"
                                                          >
                                                            (-){" "}
                                                            {new Intl.NumberFormat(
                                                              "en-GB",
                                                              {
                                                                style:
                                                                  "currency",
                                                                currency: "GBP",
                                                              },
                                                            ).format(
                                                              Number(
                                                                RecurringPricingInfo.packageOneDisCount,
                                                              ),
                                                            )}
                                                            {/* NewDiscount Rs.{RecurringPackageCalculation.PackageOneDiscountAmount} */}
                                                          </td>
                                                          {packageCount >=
                                                            2 && (
                                                            <td
                                                              style={{
                                                                fontWeight:
                                                                  getFontStyles(
                                                                    1,
                                                                    "Index",
                                                                  ).fontWeight,
                                                                fontSize:
                                                                  getFontStyles(
                                                                    1,
                                                                    "Index",
                                                                  ).fontSize,
                                                              }}
                                                              className="tr-table-class font-14 text-white text-right"
                                                            >
                                                              (-){" "}
                                                              {new Intl.NumberFormat(
                                                                "en-GB",
                                                                {
                                                                  style:
                                                                    "currency",
                                                                  currency:
                                                                    "GBP",
                                                                },
                                                              ).format(
                                                                Number(
                                                                  RecurringPricingInfo.packageTwoDisCount,
                                                                ),
                                                              )}
                                                            </td>
                                                          )}
                                                          {packageCount ===
                                                            3 && (
                                                            <td
                                                              style={{
                                                                fontWeight:
                                                                  getFontStyles(
                                                                    2,
                                                                    "Index",
                                                                  ).fontWeight,
                                                                fontSize:
                                                                  getFontStyles(
                                                                    2,
                                                                    "Index",
                                                                  ).fontSize,
                                                              }}
                                                              className="tr-table-class font-14 text-white text-right"
                                                            >
                                                              (-){" "}
                                                              {new Intl.NumberFormat(
                                                                "en-GB",
                                                                {
                                                                  style:
                                                                    "currency",
                                                                  currency:
                                                                    "GBP",
                                                                },
                                                              ).format(
                                                                Number(
                                                                  RecurringPricingInfo.packageThreeDisCount,
                                                                ),
                                                              )}
                                                            </td>
                                                          )}
                                                        </tr>
                                                        <tr className="head-row">
                                                          <td className="tr-table-class font-14 text-white">
                                                            Discounted Total
                                                          </td>
                                                          <td
                                                            style={{
                                                              fontWeight:
                                                                getFontStyles(
                                                                  0,
                                                                  "Index",
                                                                ).fontWeight,
                                                              fontSize:
                                                                getFontStyles(
                                                                  0,
                                                                  "Index",
                                                                ).fontSize,
                                                            }}
                                                            className="tr-table-class font-14 text-white text-right"
                                                          >
                                                            {new Intl.NumberFormat(
                                                              "en-GB",
                                                              {
                                                                style:
                                                                  "currency",
                                                                currency: "GBP",
                                                              },
                                                            ).format(
                                                              Number(
                                                                RecurringPricingInfo.packageOneDisCountedTotal,
                                                              ),
                                                            )}

                                                            {/* New Rs.{RecurringPackageCalculation.PackageOneDiscountedTotalAmount} */}
                                                          </td>
                                                          {packageCount >=
                                                            2 && (
                                                            <td
                                                              style={{
                                                                fontWeight:
                                                                  getFontStyles(
                                                                    1,
                                                                    "Index",
                                                                  ).fontWeight,
                                                                fontSize:
                                                                  getFontStyles(
                                                                    1,
                                                                    "Index",
                                                                  ).fontSize,
                                                              }}
                                                              className="tr-table-class font-14  text-white text-right"
                                                            >
                                                              {new Intl.NumberFormat(
                                                                "en-GB",
                                                                {
                                                                  style:
                                                                    "currency",
                                                                  currency:
                                                                    "GBP",
                                                                },
                                                              ).format(
                                                                Number(
                                                                  RecurringPricingInfo.packageTwoDisCountedTotal,
                                                                ),
                                                              )}
                                                            </td>
                                                          )}
                                                          {packageCount ===
                                                            3 && (
                                                            <td
                                                              style={{
                                                                fontWeight:
                                                                  getFontStyles(
                                                                    2,
                                                                    "Index",
                                                                  ).fontWeight,
                                                                fontSize:
                                                                  getFontStyles(
                                                                    2,
                                                                    "Index",
                                                                  ).fontSize,
                                                              }}
                                                              className="tr-table-class font-14 text-white text-right"
                                                            >
                                                              {new Intl.NumberFormat(
                                                                "en-GB",
                                                                {
                                                                  style:
                                                                    "currency",
                                                                  currency:
                                                                    "GBP",
                                                                },
                                                              ).format(
                                                                Number(
                                                                  RecurringPricingInfo.packageThreeDisCountedTotal,
                                                                ),
                                                              )}
                                                            </td>
                                                          )}
                                                        </tr>
                                                      </>
                                                    )}

                                                  {vatPercentage && (
                                                    <>
                                                      <tr class="head-grey-row">
                                                        <td className="tr-table-class font-14 text-white">
                                                          {getTaxName(
                                                            ProposalObject.currencyID,
                                                          )}
                                                        </td>
                                                        <td
                                                          style={{
                                                            fontWeight:
                                                              getFontStyles(
                                                                0,
                                                                "Index",
                                                              ).fontWeight,
                                                            fontSize:
                                                              getFontStyles(
                                                                0,
                                                                "Index",
                                                              ).fontSize,
                                                          }}
                                                          className="tr-table-class font-14 text-white text-right"
                                                        >
                                                          {" "}
                                                          {formatValue(
                                                            RecurringPricingInfo.PackageOneVaTPrice,
                                                          )}
                                                        </td>
                                                        {packageCount >= 2 && (
                                                          <td
                                                            style={{
                                                              fontWeight:
                                                                getFontStyles(
                                                                  1,
                                                                  "Index",
                                                                ).fontWeight,
                                                              fontSize:
                                                                getFontStyles(
                                                                  1,
                                                                  "Index",
                                                                ).fontSize,
                                                            }}
                                                            className="tr-table-class font-14 text-white text-right"
                                                          >
                                                            {" "}
                                                            {formatValue(
                                                              RecurringPricingInfo.PackageTwoVaTPrice,
                                                            )}
                                                          </td>
                                                        )}
                                                        {packageCount === 3 && (
                                                          <td
                                                            style={{
                                                              fontWeight:
                                                                getFontStyles(
                                                                  2,
                                                                  "Index",
                                                                ).fontWeight,
                                                              fontSize:
                                                                getFontStyles(
                                                                  2,
                                                                  "Index",
                                                                ).fontSize,
                                                            }}
                                                            className="tr-table-class font-14 text-white text-right"
                                                          >
                                                            {" "}
                                                            {formatValue(
                                                              RecurringPricingInfo.PackageThreeVaTPrice,
                                                            )}
                                                          </td>
                                                        )}
                                                      </tr>
                                                      <tr className="head-row">
                                                        <td className="tr-table-class font-14 text-white">
                                                          Grand Total
                                                        </td>
                                                        <td
                                                          style={{
                                                            fontWeight:
                                                              getFontStyles(
                                                                0,
                                                                "Index",
                                                              ).fontWeight,
                                                            fontSize:
                                                              getFontStyles(
                                                                0,
                                                                "Index",
                                                              ).fontSize,
                                                          }}
                                                          className="tr-table-class font-14 text-white text-right"
                                                        >
                                                          {" "}
                                                          {formatValue(
                                                            RecurringPricingInfo.PackageOneGrandTotal,
                                                          )}
                                                        </td>
                                                        {packageCount >= 2 && (
                                                          <td
                                                            style={{
                                                              fontWeight:
                                                                getFontStyles(
                                                                  1,
                                                                  "Index",
                                                                ).fontWeight,
                                                              fontSize:
                                                                getFontStyles(
                                                                  1,
                                                                  "Index",
                                                                ).fontSize,
                                                            }}
                                                            className="tr-table-class font-14 text-white text-right"
                                                          >
                                                            {" "}
                                                            {formatValue(
                                                              RecurringPricingInfo.PackageTwoGrandTotal,
                                                            )}
                                                          </td>
                                                        )}
                                                        {packageCount == 3 && (
                                                          <td
                                                            style={{
                                                              fontWeight:
                                                                getFontStyles(
                                                                  2,
                                                                  "Index",
                                                                ).fontWeight,
                                                              fontSize:
                                                                getFontStyles(
                                                                  2,
                                                                  "Index",
                                                                ).fontSize,
                                                            }}
                                                            className="tr-table-class font-14 text-white text-right"
                                                          >
                                                            {" "}
                                                            {formatValue(
                                                              RecurringPricingInfo.PackageThreeGrandTotal,
                                                            )}
                                                          </td>
                                                        )}
                                                      </tr>
                                                    </>
                                                  )}
                                                </table>
                                              </div>
                                            ) : (
                                              <div
                                                style={{ marginTop: "0px" }}
                                                className="table-responsive"
                                              >
                                                {/* <div
                                                                                                 dangerouslySetInnerHTML={{
                                                                                                   __html: currentPricingTableDesignRecurring,
                                                                                                 }}
                                                                                               /> */}
                                                <table
                                                  class="table align-middle table-nowrap"
                                                  style={{ width: "100%" }}
                                                >
                                                  <thead className="table-dark text-white">
                                                    {renderCustomPackageNameHeader(
                                                      vatPercentage,
                                                    )}
                                                    {renderCustomPackageSubHeader(
                                                      vatPercentage,
                                                    )}
                                                  </thead>
                                                  <tbody>
                                                    {selectedRecurringServiceList.map(
                                                      (service, index) => (
                                                        <React.Fragment
                                                          key={`recurring-category-${service.serviceCatID || index}`}
                                                        >
                                                          {renderCustomCategoryRow(
                                                            service.serviceCatName,
                                                            vatPercentage,
                                                          )}

                                                          {(
                                                            service.servicesList ||
                                                            []
                                                          ).map(
                                                            (
                                                              subService,
                                                              subIndex,
                                                            ) => (
                                                              <tr
                                                                key={`recurring-service-${service.serviceCatID}-${subService.serviceID || subIndex}`}
                                                              >
                                                                {visibleFieldsCustomTemp?.serviceName && (
                                                                  <td>
                                                                    {
                                                                      subService.serviceName
                                                                    }
                                                                  </td>
                                                                )}

                                                                {activeRecurringPackages.map(
                                                                  (
                                                                    packageItem,
                                                                    packageIndex,
                                                                  ) => {
                                                                    const packageRow =
                                                                      calculateRecurringPackageServiceRow(
                                                                        {
                                                                          service:
                                                                            subService,
                                                                          packageIndex,
                                                                          fallbackVatRate:
                                                                            getRecurringPackageFallbackVatRate(
                                                                              packageItem,
                                                                            ),
                                                                        },
                                                                      );

                                                                    return (
                                                                      <React.Fragment
                                                                        key={`recurring-package-${subService.serviceID}-${packageIndex}`}
                                                                      >
                                                                        {visibleFieldsCustomTemp?.fees && (
                                                                          <td className="text-right">
                                                                            {!packageRow.isIncluded ? (
                                                                              "-"
                                                                            ) : showRecurringPackageBreakdown ? (
                                                                              formatValue(
                                                                                packageRow.price,
                                                                                ProposalObject.currencyID,
                                                                              )
                                                                            ) : (
                                                                              <span
                                                                                className="fa fa-check"
                                                                                aria-label="Included"
                                                                              />
                                                                            )}
                                                                          </td>
                                                                        )}

                                                                        {showRecurringVat &&
                                                                          visibleFieldsCustomTemp?.vatRate && (
                                                                            <td className="text-right">
                                                                              {packageRow.isIncluded
                                                                                ? `${packageRow.vatRate}%`
                                                                                : "-"}
                                                                            </td>
                                                                          )}

                                                                        {showRecurringVat &&
                                                                          visibleFieldsCustomTemp?.vat && (
                                                                            <td className="text-right">
                                                                              {!packageRow.isIncluded ? (
                                                                                "-"
                                                                              ) : showRecurringPackageBreakdown ? (
                                                                                formatValue(
                                                                                  packageRow.vatAmount,
                                                                                  ProposalObject.currencyID,
                                                                                )
                                                                              ) : (
                                                                                <span
                                                                                  className="fa fa-check"
                                                                                  aria-label="Included"
                                                                                />
                                                                              )}
                                                                            </td>
                                                                          )}

                                                                        {showRecurringVat &&
                                                                          visibleFieldsCustomTemp?.feesIncVat && (
                                                                            <td className="text-right">
                                                                              {!packageRow.isIncluded ? (
                                                                                "-"
                                                                              ) : showRecurringPackageBreakdown ? (
                                                                                formatValue(
                                                                                  packageRow.feesIncludingVat,
                                                                                  ProposalObject.currencyID,
                                                                                )
                                                                              ) : (
                                                                                <span
                                                                                  className="fa fa-check"
                                                                                  aria-label="Included"
                                                                                />
                                                                              )}
                                                                            </td>
                                                                          )}

                                                                        {visibleFieldsCustomTemp?.serviceScope && (
                                                                          <td>
                                                                            {packageRow.isIncluded
                                                                              ? renderRecurringPackageScope(
                                                                                  subService,
                                                                                )
                                                                              : "-"}
                                                                          </td>
                                                                        )}
                                                                      </React.Fragment>
                                                                    );
                                                                  },
                                                                )}
                                                              </tr>
                                                            ),
                                                          )}
                                                        </React.Fragment>
                                                      ),
                                                    )}
                                                  </tbody>
                                                  {packageCount > 1 && (
                                                    <>
                                                      <tr id="recurring_DefaultWithPackages">
                                                        <td
                                                          style={{
                                                            padding: "8px",
                                                          }}
                                                        >
                                                          Discount (%)
                                                        </td>

                                                        <td
                                                          style={{
                                                            width: "35%",
                                                            padding: "0px",
                                                            whiteSpace:
                                                              "normal",
                                                          }}
                                                        >
                                                          <div
                                                            style={{
                                                              display: "flex",
                                                              flexDirection:
                                                                "column",
                                                              alignItems:
                                                                "flex-start",
                                                            }}
                                                          >
                                                            <input
                                                              className="input-text"
                                                              type="text"
                                                              placeholder="Discount (%)"
                                                              value={
                                                                Number(
                                                                  RecurringPricingInfo.DiscountPercentagePackageOne ||
                                                                    0,
                                                                ).toFixed(2) ||
                                                                ""
                                                              }
                                                              disabled
                                                              onChange={(e) => {
                                                                handlePackageOneDiscountPercentage(
                                                                  e,
                                                                );
                                                              }}
                                                              style={{
                                                                width: "100%",
                                                                textAlign:
                                                                  "right",
                                                              }}
                                                            />
                                                            <div>
                                                              {getValidationMessage(
                                                                requireMessage,
                                                                pricingSettingObj.maxDiscountForQC,
                                                                RecurringPricingInfo.DiscountPercentagePackageOne,
                                                              )}
                                                            </div>
                                                          </div>
                                                        </td>

                                                        {packageCount >= 2 && (
                                                          <>
                                                            {showRecurringVat &&
                                                              visibleFieldsCustomTemp.vatRate && (
                                                                <td></td>
                                                              )}
                                                            {showRecurringVat &&
                                                              visibleFieldsCustomTemp.vat && (
                                                                <td></td>
                                                              )}
                                                            {showRecurringVat &&
                                                              visibleFieldsCustomTemp.feesIncVat && (
                                                                <td></td>
                                                              )}
                                                            {visibleFieldsCustomTemp.serviceScope && (
                                                              <td></td>
                                                            )}
                                                            <td
                                                              style={{
                                                                width: "35%",
                                                                padding: "0px",
                                                                whiteSpace:
                                                                  "normal",
                                                              }}
                                                            >
                                                              <div
                                                                style={{
                                                                  display:
                                                                    "flex",
                                                                  flexDirection:
                                                                    "column",
                                                                  alignItems:
                                                                    "flex-start",
                                                                }}
                                                              >
                                                                <input
                                                                  className="input-text"
                                                                  type="text"
                                                                  placeholder="Discount (%)"
                                                                  value={
                                                                    Number(
                                                                      RecurringPricingInfo.DiscountPercentagePackageTwo ||
                                                                        0,
                                                                    ).toFixed(
                                                                      2,
                                                                    ) || ""
                                                                  }
                                                                  disabled
                                                                  onChange={(
                                                                    e,
                                                                  ) => {
                                                                    handlePackageTwoDiscountPercentage(
                                                                      e,
                                                                    );
                                                                  }}
                                                                  style={{
                                                                    width:
                                                                      "100%",
                                                                    textAlign:
                                                                      "right",
                                                                  }}
                                                                />
                                                                <div>
                                                                  {getValidationMessage(
                                                                    requireMessage,
                                                                    pricingSettingObj.maxDiscountForQC,
                                                                    RecurringPricingInfo.DiscountPercentagePackageTwo,
                                                                  )}
                                                                </div>
                                                              </div>
                                                            </td>
                                                          </>
                                                        )}

                                                        {packageCount === 3 && (
                                                          <>
                                                            {showRecurringVat &&
                                                              visibleFieldsCustomTemp.vatRate && (
                                                                <td></td>
                                                              )}
                                                            {showRecurringVat &&
                                                              visibleFieldsCustomTemp.vat && (
                                                                <td></td>
                                                              )}
                                                            {showRecurringVat &&
                                                              visibleFieldsCustomTemp.feesIncVat && (
                                                                <td></td>
                                                              )}
                                                            {visibleFieldsCustomTemp.serviceScope && (
                                                              <td></td>
                                                            )}
                                                            <td
                                                              style={{
                                                                width: "35%",
                                                                padding: "0px",
                                                                whiteSpace:
                                                                  "normal",
                                                              }}
                                                            >
                                                              <div
                                                                style={{
                                                                  display:
                                                                    "flex",
                                                                  flexDirection:
                                                                    "column",
                                                                  alignItems:
                                                                    "flex-start",
                                                                }}
                                                              >
                                                                <input
                                                                  className="input-text"
                                                                  type="text"
                                                                  placeholder="Discount (%)"
                                                                  value={
                                                                    Number(
                                                                      RecurringPricingInfo.DiscountPercentagePackageThree ||
                                                                        0,
                                                                    ).toFixed(
                                                                      2,
                                                                    ) || ""
                                                                  }
                                                                  disabled
                                                                  onChange={(
                                                                    e,
                                                                  ) => {
                                                                    handlePackageThreeDiscountPercentage(
                                                                      e,
                                                                    );
                                                                  }}
                                                                  style={{
                                                                    width:
                                                                      "100%",
                                                                    textAlign:
                                                                      "right",
                                                                  }}
                                                                />
                                                                <div>
                                                                  {getValidationMessage(
                                                                    requireMessage,
                                                                    pricingSettingObj.maxDiscountForQC,
                                                                    RecurringPricingInfo.DiscountPercentagePackageThree,
                                                                  )}
                                                                </div>
                                                              </div>
                                                            </td>
                                                          </>
                                                        )}
                                                      </tr>
                                                    </>
                                                  )}

                                                  <tfoot>
                                                    {/* === NET TOTAL === */}
                                                    <tr className="head-row">
                                                      <td className="tr-table-class font-14 text-white">
                                                        Net Total
                                                      </td>

                                                      {activeRecurringPackages.map(
                                                        (
                                                          packageItem,
                                                          packageIndex,
                                                        ) => {
                                                          const totals =
                                                            recurringPackageFooterTotals[
                                                              packageIndex
                                                            ];

                                                          const useRecurringPackageFinalAsNet =
                                                            totals.hasPriceIncrease ||
                                                            (totals.hasPositiveDiscount &&
                                                              !showRecurringPackageDiscountLines);

                                                          const displayedNetTotal =
                                                            useRecurringPackageFinalAsNet
                                                              ? totals.finalNetTotal
                                                              : totals.originalNetTotal;

                                                          const displayedVatTotal =
                                                            useRecurringPackageFinalAsNet
                                                              ? totals.finalVatTotal
                                                              : totals.originalVatTotal;

                                                          const displayedFeesIncludingVat =
                                                            useRecurringPackageFinalAsNet
                                                              ? totals.grandTotalIncludingVat
                                                              : totals.originalFeesIncludingVat;

                                                          return (
                                                            <React.Fragment
                                                              key={`recurring-package-net-${packageIndex}`}
                                                            >
                                                              {visibleFieldsCustomTemp?.fees && (
                                                                <td className="tr-table-class font-14 text-white text-right">
                                                                  {formatValue(
                                                                    displayedNetTotal,
                                                                    ProposalObject.currencyID,
                                                                  )}
                                                                </td>
                                                              )}

                                                              {showRecurringVat &&
                                                                visibleFieldsCustomTemp?.vatRate && (
                                                                  <td className="tr-table-class font-14 text-white" />
                                                                )}

                                                              {showRecurringVat &&
                                                                visibleFieldsCustomTemp?.vat && (
                                                                  <td className="tr-table-class font-14 text-white text-right">
                                                                    {formatValue(
                                                                      displayedVatTotal,
                                                                      ProposalObject.currencyID,
                                                                    )}
                                                                  </td>
                                                                )}

                                                              {showRecurringVat &&
                                                                visibleFieldsCustomTemp?.feesIncVat && (
                                                                  <td className="tr-table-class font-14 text-white text-right">
                                                                    {formatValue(
                                                                      displayedFeesIncludingVat,
                                                                      ProposalObject.currencyID,
                                                                    )}
                                                                  </td>
                                                                )}

                                                              {visibleFieldsCustomTemp?.serviceScope && (
                                                                <td />
                                                              )}
                                                            </React.Fragment>
                                                          );
                                                        },
                                                      )}
                                                    </tr>

                                                    {/* === DISCOUNT === */}
                                                    {showRecurringPackageDiscountLines && (
                                                      <tr className="head-grey-row">
                                                        <td className="tr-table-class font-14 text-white">
                                                          Discount
                                                        </td>

                                                        {activeRecurringPackages.map(
                                                          (
                                                            packageItem,
                                                            packageIndex,
                                                          ) => {
                                                            const totals =
                                                              recurringPackageFooterTotals[
                                                                packageIndex
                                                              ];

                                                            const hasDiscount =
                                                              totals.discountAmount >
                                                              0;

                                                            return (
                                                              <React.Fragment
                                                                key={`recurring-package-discount-${packageIndex}`}
                                                              >
                                                                {visibleFieldsCustomTemp?.fees && (
                                                                  <td className="tr-table-class font-14 text-white text-right">
                                                                    {hasDiscount
                                                                      ? `(-) ${formatValue(
                                                                          totals.discountAmount,
                                                                          ProposalObject.currencyID,
                                                                        )}`
                                                                      : "-"}
                                                                  </td>
                                                                )}

                                                                {showRecurringVat &&
                                                                  visibleFieldsCustomTemp?.vatRate && (
                                                                    <td className="tr-table-class font-14 text-white" />
                                                                  )}

                                                                {showRecurringVat &&
                                                                  visibleFieldsCustomTemp?.vat && (
                                                                    <td className="tr-table-class font-14 text-white text-right">
                                                                      {hasDiscount
                                                                        ? `(-) ${formatValue(
                                                                            totals.vatDiscount,
                                                                            ProposalObject.currencyID,
                                                                          )}`
                                                                        : "-"}
                                                                    </td>
                                                                  )}

                                                                {showRecurringVat &&
                                                                  visibleFieldsCustomTemp?.feesIncVat && (
                                                                    <td className="tr-table-class font-14 text-white text-right">
                                                                      {hasDiscount
                                                                        ? `(-) ${formatValue(
                                                                            totals.discountIncludingVat,
                                                                            ProposalObject.currencyID,
                                                                          )}`
                                                                        : "-"}
                                                                    </td>
                                                                  )}

                                                                {visibleFieldsCustomTemp?.serviceScope && (
                                                                  <td />
                                                                )}
                                                              </React.Fragment>
                                                            );
                                                          },
                                                        )}
                                                      </tr>
                                                    )}

                                                    {/* === GRAND TOTAL === */}
                                                    {showRecurringPackageDiscountLines && (
                                                      <tr className="head-row">
                                                        <td className="tr-table-class font-14 text-white">
                                                          {showRecurringVat
                                                            ? "Grand Total"
                                                            : "Discounted Total"}
                                                        </td>

                                                        {activeRecurringPackages.map(
                                                          (
                                                            packageItem,
                                                            packageIndex,
                                                          ) => {
                                                            const totals =
                                                              recurringPackageFooterTotals[
                                                                packageIndex
                                                              ];

                                                            return (
                                                              <React.Fragment
                                                                key={`recurring-package-grand-${packageIndex}`}
                                                              >
                                                                {visibleFieldsCustomTemp?.fees && (
                                                                  <td className="tr-table-class font-14 text-white text-right">
                                                                    {formatValue(
                                                                      totals.finalNetTotal,
                                                                      ProposalObject.currencyID,
                                                                    )}
                                                                  </td>
                                                                )}

                                                                {showRecurringVat &&
                                                                  visibleFieldsCustomTemp?.vatRate && (
                                                                    <td className="tr-table-class font-14 text-white" />
                                                                  )}

                                                                {showRecurringVat &&
                                                                  visibleFieldsCustomTemp?.vat && (
                                                                    <td className="tr-table-class font-14 text-white text-right">
                                                                      {formatValue(
                                                                        totals.finalVatTotal,
                                                                        ProposalObject.currencyID,
                                                                      )}
                                                                    </td>
                                                                  )}

                                                                {showRecurringVat &&
                                                                  visibleFieldsCustomTemp?.feesIncVat && (
                                                                    <td className="tr-table-class font-14 text-white text-right">
                                                                      {formatValue(
                                                                        totals.grandTotalIncludingVat,
                                                                        ProposalObject.currencyID,
                                                                      )}
                                                                    </td>
                                                                  )}

                                                                {visibleFieldsCustomTemp?.serviceScope && (
                                                                  <td />
                                                                )}
                                                              </React.Fragment>
                                                            );
                                                          },
                                                        )}
                                                      </tr>
                                                    )}
                                                  </tfoot>
                                                </table>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  {selectedOneOffServiceList?.length !== 0 && (
                                    <div className="tab-content">
                                      <div className="tab-pane p-3 active">
                                        <div className="row">
                                          <div className="col-lg-12">
                                            <div className="separator mb-2"></div>
                                            <h6>One-Off Services</h6>
                                            <div className="separator mb-3"></div>
                                            <div
                                              class="row"
                                              id="OneOff_Default"
                                            >
                                              <div class="col-lg-2 mb-1 col-md-2 col-sm-12 mt-2 text-md-end">
                                                <div class="mb-1 text-md-end">
                                                  {packageCount == 1 && (
                                                    <label class="form-label">
                                                      Discount (%)
                                                    </label>
                                                  )}
                                                </div>
                                              </div>
                                              <div className="col-lg-4">
                                                {packageCount == 1 && (
                                                  <input
                                                    readonly=""
                                                    class="input-text"
                                                    type="text"
                                                    placeholder="Default Discount (%)"
                                                    value={
                                                      Number(
                                                        Math.floor(
                                                          OneOffPricingInfo.DefaultDiscount *
                                                            100,
                                                        ) / 100,
                                                      )
                                                        .toFixed(2)
                                                        .replace(
                                                          /\B(?=(\d{3})+(?!\d))/g,
                                                          ",",
                                                        )

                                                      // OneOffPricingInfo.DefaultDiscount
                                                    }
                                                  />
                                                )}
                                              </div>
                                            </div>
                                            <div className="mb-3"></div>

                                            {/* One-off */}
                                            {pricingTableColumnIDs === null ||
                                            pricingTableColumnIDs === "" ||
                                            pricingTableColumnIDs ===
                                              undefined ? (
                                              <div
                                                style={{ marginTop: "0px" }}
                                                className="table-responsive"
                                              >
                                                <table
                                                  class="table align-middle table-nowrap"
                                                  style={{ width: "100%" }}
                                                >
                                                  <thead className="table-light table-header-font">
                                                    <tr className="head-row">
                                                      <td className="tr-table-class text-white">
                                                        Services
                                                      </td>

                                                      {selectedPackagesList.map(
                                                        (pkg, index) => (
                                                          <td
                                                            key={index}
                                                            className="tr-table-class text-white text-right"
                                                            style={{
                                                              fontWeight:
                                                                getFontStyles(
                                                                  selectedPackagesList[
                                                                    index
                                                                  ]
                                                                    .servicePackageID,
                                                                  "ID",
                                                                ).fontWeight,
                                                              fontSize:
                                                                getFontStyles(
                                                                  selectedPackagesList[
                                                                    index
                                                                  ]
                                                                    .servicePackageID,
                                                                  "ID",
                                                                ).fontSize,
                                                            }}
                                                          >
                                                            {pkg
                                                              .servicePackageName
                                                              .length > 10 ? (
                                                              <Tooltip
                                                                title={
                                                                  pkg.servicePackageName
                                                                }
                                                              >
                                                                {pkg.servicePackageName
                                                                  .substring(
                                                                    0,
                                                                    10,
                                                                  )
                                                                  .toLowerCase()
                                                                  .replace(
                                                                    /\b\w/g,
                                                                    (l) =>
                                                                      l.toUpperCase(),
                                                                  ) + "..."}
                                                              </Tooltip>
                                                            ) : pkg
                                                                .servicePackageName
                                                                .length > 10 ? (
                                                              <Tooltip
                                                                title={
                                                                  pkg.servicePackageName
                                                                }
                                                              >
                                                                {pkg.servicePackageName.substring(
                                                                  0,
                                                                  10,
                                                                ) + "..."}
                                                              </Tooltip>
                                                            ) : (
                                                              pkg.servicePackageName
                                                            )}
                                                          </td>
                                                        ),
                                                      )}
                                                    </tr>
                                                  </thead>
                                                  <tbody>
                                                    {selectedOneOffServiceList.map(
                                                      (service, index) => {
                                                        return (
                                                          <>
                                                            <tr className="a-la-carte-services-review-head-row">
                                                              <th
                                                                colSpan={
                                                                  1 +
                                                                  packageCount
                                                                }
                                                              >
                                                                {
                                                                  service.serviceCatName
                                                                }
                                                              </th>
                                                            </tr>
                                                            {service.servicesList.map(
                                                              (
                                                                subService,
                                                                subIndex,
                                                              ) => (
                                                                <tr
                                                                  key={subIndex}
                                                                  className={` ${
                                                                    subService?.isAdditionalService ===
                                                                    true
                                                                      ? "bg-info  text-white"
                                                                      : ""
                                                                  }`}
                                                                >
                                                                  <td>
                                                                    <div>
                                                                      {subService
                                                                        .serviceName
                                                                        .length >
                                                                      45
                                                                        ? subService.serviceName
                                                                            .substring(
                                                                              0,
                                                                              45,
                                                                            )
                                                                            .toLowerCase()
                                                                            .replace(
                                                                              /\b\w/g,
                                                                              (
                                                                                l,
                                                                              ) =>
                                                                                l.toUpperCase(),
                                                                            ) +
                                                                          "..."
                                                                        : subService.serviceName}
                                                                    </div>
                                                                    <div className="package-variables"></div>
                                                                  </td>

                                                                  <td
                                                                    style={{
                                                                      fontWeight:
                                                                        getFontStyles(
                                                                          0,
                                                                          "Index",
                                                                        )
                                                                          .fontWeight,
                                                                      fontSize:
                                                                        getFontStyles(
                                                                          0,
                                                                          "Index",
                                                                        )
                                                                          .fontSize,
                                                                    }}
                                                                    className="text-right"
                                                                  >
                                                                    {ProposalObject.feeTypeId ===
                                                                    1 ? (
                                                                      <>
                                                                        {" "}
                                                                        {subService.packageOneValue ===
                                                                        null ? (
                                                                          <span className="fa fa-times"></span>
                                                                        ) : (
                                                                          formatValue(
                                                                            subService.packageOneValue,
                                                                          )
                                                                        )}
                                                                      </>
                                                                    ) : subService.packageOneValue !==
                                                                      null ? (
                                                                      <span className="fa fa-check"></span>
                                                                    ) : (
                                                                      <span className="fa fa-times"></span>
                                                                    )}
                                                                  </td>
                                                                  {packageCount >=
                                                                    2 && (
                                                                    <td
                                                                      style={{
                                                                        fontWeight:
                                                                          getFontStyles(
                                                                            1,
                                                                            "Index",
                                                                          )
                                                                            .fontWeight,
                                                                        fontSize:
                                                                          getFontStyles(
                                                                            1,
                                                                            "Index",
                                                                          )
                                                                            .fontSize,
                                                                      }}
                                                                      className="text-right"
                                                                    >
                                                                      {ProposalObject.feeTypeId ===
                                                                      1 ? (
                                                                        <>
                                                                          {" "}
                                                                          {subService.packageTwoValue ===
                                                                          null ? (
                                                                            <span className="fa fa-times"></span>
                                                                          ) : (
                                                                            formatValue(
                                                                              subService.packageTwoValue,
                                                                            )
                                                                          )}
                                                                        </>
                                                                      ) : subService.packageTwoValue !==
                                                                        null ? (
                                                                        <span className="fa fa-check"></span>
                                                                      ) : (
                                                                        <span className="fa fa-times"></span>
                                                                      )}
                                                                    </td>
                                                                  )}
                                                                  {packageCount ===
                                                                    3 && (
                                                                    <td
                                                                      style={{
                                                                        fontWeight:
                                                                          getFontStyles(
                                                                            2,
                                                                            "Index",
                                                                          )
                                                                            .fontWeight,
                                                                        fontSize:
                                                                          getFontStyles(
                                                                            2,
                                                                            "Index",
                                                                          )
                                                                            .fontSize,
                                                                      }}
                                                                      className="text-right"
                                                                    >
                                                                      {ProposalObject.feeTypeId ===
                                                                      1 ? (
                                                                        <>
                                                                          {" "}
                                                                          {subService.packageThreeValue ===
                                                                          null ? (
                                                                            <span className="fa fa-times"></span>
                                                                          ) : (
                                                                            formatValue(
                                                                              subService.packageThreeValue,
                                                                            )
                                                                          )}
                                                                        </>
                                                                      ) : subService.packageThreeValue !==
                                                                        null ? (
                                                                        <span className="fa fa-check"></span>
                                                                      ) : (
                                                                        <span className="fa fa-times"></span>
                                                                      )}
                                                                    </td>
                                                                  )}
                                                                </tr>
                                                              ),
                                                            )}
                                                          </>
                                                        );
                                                      },
                                                    )}
                                                  </tbody>
                                                  {packageCount > 1 && (
                                                    <>
                                                      <tr id="recurring_DefaultWithPackages">
                                                        <td>
                                                          <div>
                                                            Discount (%)
                                                          </div>
                                                          {/* <div className="package-variables"></div> */}
                                                        </td>

                                                        <td
                                                          style={{
                                                            width: "35%",
                                                            padding: "0px",
                                                            whiteSpace:
                                                              "normal",
                                                          }}
                                                        >
                                                          <div
                                                            style={{
                                                              display: "flex",
                                                              flexDirection:
                                                                "column",
                                                              alignItems:
                                                                "flex-start",
                                                            }}
                                                          >
                                                            <input
                                                              readOnly
                                                              className="input-text"
                                                              type="number" // Change type to number
                                                              placeholder="Discount (%)"
                                                              value={Number(
                                                                OneOffPricingInfo.DiscountPercentagePackageOne,
                                                              )
                                                                .toFixed(2)
                                                                .replace(
                                                                  /\B(?=(\d{3})+(?!\d))/g,
                                                                  ",",
                                                                )}
                                                              style={{
                                                                width: "100%",
                                                                textAlign:
                                                                  "right",
                                                              }}
                                                            />
                                                          </div>
                                                        </td>

                                                        {packageCount >= 2 && (
                                                          <td
                                                            style={{
                                                              width: "35%",
                                                              padding: "0px",
                                                              whiteSpace:
                                                                "normal",
                                                            }}
                                                          >
                                                            <div
                                                              style={{
                                                                display: "flex",
                                                                flexDirection:
                                                                  "column",
                                                                alignItems:
                                                                  "flex-start",
                                                              }}
                                                            >
                                                              <input
                                                                readOnly
                                                                className="input-text"
                                                                type="number" // Change type to number
                                                                placeholder="Discount (%)"
                                                                value={Number(
                                                                  OneOffPricingInfo.DiscountPercentagePackageTwo,
                                                                )
                                                                  .toFixed(2)
                                                                  .replace(
                                                                    /\B(?=(\d{3})+(?!\d))/g,
                                                                    ",",
                                                                  )}
                                                                style={{
                                                                  width: "100%",
                                                                  textAlign:
                                                                    "right",
                                                                }}
                                                              />
                                                              <div></div>
                                                            </div>
                                                          </td>
                                                        )}

                                                        {packageCount === 3 && (
                                                          <td
                                                            style={{
                                                              width: "35%",
                                                              padding: "0px",
                                                              whiteSpace:
                                                                "normal",
                                                            }}
                                                          >
                                                            <div
                                                              style={{
                                                                display: "flex",
                                                                flexDirection:
                                                                  "column",
                                                                alignItems:
                                                                  "flex-start",
                                                              }}
                                                            >
                                                              <input
                                                                readOnly
                                                                className="input-text"
                                                                type="number" // Change type to number
                                                                placeholder="Discount (%)"
                                                                value={Number(
                                                                  OneOffPricingInfo.DiscountPercentagePackageThree,
                                                                )
                                                                  .toFixed(2)
                                                                  .replace(
                                                                    /\B(?=(\d{3})+(?!\d))/g,
                                                                    ",",
                                                                  )}
                                                                style={{
                                                                  width: "100%",
                                                                  textAlign:
                                                                    "right",
                                                                }}
                                                              />
                                                            </div>
                                                          </td>
                                                        )}
                                                      </tr>
                                                    </>
                                                  )}
                                                  <thead className="table-light table-header-font">
                                                    <tr className="head-row">
                                                      <td className="tr-table-class text-white">
                                                        Net Total
                                                      </td>
                                                      <td
                                                        style={{
                                                          fontWeight:
                                                            getFontStyles(
                                                              0,
                                                              "Index",
                                                            ).fontWeight,
                                                          fontSize:
                                                            getFontStyles(
                                                              0,
                                                              "Index",
                                                            ).fontSize,
                                                        }}
                                                        className="tr-table-class text-white text-right"
                                                      >
                                                        {" "}
                                                        {Number(
                                                          OneOffPricingInfo.packageOneNetTotal,
                                                        ) <
                                                          Number(
                                                            OneOffPricingInfo.packageOneDisCountedTotal,
                                                          ) ||
                                                        (Number(
                                                          OneOffPricingInfo.packageOneDisCount,
                                                        ) > 0 &&
                                                          !ProposalObject.DiscountLines)
                                                          ? formatValue(
                                                              OneOffPricingInfo.packageOneDisCountedTotal,
                                                            )
                                                          : formatValue(
                                                              OneOffPricingInfo.packageOneNetTotal,
                                                            )}
                                                      </td>
                                                      {packageCount >= 2 && (
                                                        <td
                                                          style={{
                                                            fontWeight:
                                                              getFontStyles(
                                                                1,
                                                                "Index",
                                                              ).fontWeight,
                                                            fontSize:
                                                              getFontStyles(
                                                                1,
                                                                "Index",
                                                              ).fontSize,
                                                          }}
                                                          className="tr-table-class text-white text-right"
                                                        >
                                                          {" "}
                                                          {Number(
                                                            OneOffPricingInfo.packageTwoNetTotal,
                                                          ) <
                                                            Number(
                                                              OneOffPricingInfo.packageTwoDisCountedTotal,
                                                            ) ||
                                                          (Number(
                                                            OneOffPricingInfo.packageTwoDisCount,
                                                          ) > 0 &&
                                                            !ProposalObject.DiscountLines)
                                                            ? formatValue(
                                                                OneOffPricingInfo.packageTwoDisCountedTotal,
                                                              )
                                                            : formatValue(
                                                                OneOffPricingInfo.packageTwoNetTotal,
                                                              )}
                                                        </td>
                                                      )}{" "}
                                                      {packageCount === 3 && (
                                                        <td
                                                          style={{
                                                            fontWeight:
                                                              getFontStyles(
                                                                2,
                                                                "Index",
                                                              ).fontWeight,
                                                            fontSize:
                                                              getFontStyles(
                                                                2,
                                                                "Index",
                                                              ).fontSize,
                                                          }}
                                                          className="tr-table-class text-white text-right"
                                                        >
                                                          {" "}
                                                          {Number(
                                                            OneOffPricingInfo.packageThreeNetTotal,
                                                          ) <
                                                            Number(
                                                              OneOffPricingInfo.packageThreeDisCountedTotal,
                                                            ) ||
                                                          (Number(
                                                            OneOffPricingInfo.packageThreeDisCount,
                                                          ) > 0 &&
                                                            !ProposalObject.DiscountLines)
                                                            ? formatValue(
                                                                OneOffPricingInfo.packageThreeDisCountedTotal,
                                                              )
                                                            : formatValue(
                                                                OneOffPricingInfo.packageThreeNetTotal,
                                                              )}
                                                        </td>
                                                      )}
                                                    </tr>
                                                  </thead>
                                                  {(Number(
                                                    OneOffPricingInfo.packageThreeDisCount,
                                                  ) > 0 ||
                                                    Number(
                                                      OneOffPricingInfo.packageOneDisCount,
                                                    ) > 0 ||
                                                    Number(
                                                      OneOffPricingInfo.packageTwoDisCount,
                                                    ) > 0) &&
                                                    ProposalObject.DiscountLines && (
                                                      <>
                                                        <tr className="head-grey-row">
                                                          <td className="tr-table-class text-white">
                                                            Discount
                                                          </td>
                                                          <td
                                                            style={{
                                                              fontWeight:
                                                                getFontStyles(
                                                                  0,
                                                                  "Index",
                                                                ).fontWeight,
                                                              fontSize:
                                                                getFontStyles(
                                                                  0,
                                                                  "Index",
                                                                ).fontSize,
                                                            }}
                                                            className="tr-table-class text-white text-right"
                                                          >
                                                            (-){" "}
                                                            {new Intl.NumberFormat(
                                                              "en-GB",
                                                              {
                                                                style:
                                                                  "currency",
                                                                currency: "GBP",
                                                              },
                                                            ).format(
                                                              Number(
                                                                OneOffPricingInfo.packageOneDisCount,
                                                              ),
                                                            )}
                                                          </td>
                                                          {packageCount >=
                                                            2 && (
                                                            <td
                                                              style={{
                                                                fontWeight:
                                                                  getFontStyles(
                                                                    1,
                                                                    "Index",
                                                                  ).fontWeight,
                                                                fontSize:
                                                                  getFontStyles(
                                                                    1,
                                                                    "Index",
                                                                  ).fontSize,
                                                              }}
                                                              className="tr-table-class text-white text-right"
                                                            >
                                                              (-){" "}
                                                              {new Intl.NumberFormat(
                                                                "en-GB",
                                                                {
                                                                  style:
                                                                    "currency",
                                                                  currency:
                                                                    "GBP",
                                                                },
                                                              ).format(
                                                                Number(
                                                                  OneOffPricingInfo.packageTwoDisCount,
                                                                ),
                                                              )}
                                                            </td>
                                                          )}
                                                          {packageCount ==
                                                            3 && (
                                                            <td
                                                              style={{
                                                                fontWeight:
                                                                  getFontStyles(
                                                                    2,
                                                                    "Index",
                                                                  ).fontWeight,
                                                                fontSize:
                                                                  getFontStyles(
                                                                    2,
                                                                    "Index",
                                                                  ).fontSize,
                                                              }}
                                                              className="tr-table-class text-white text-right"
                                                            >
                                                              (-){" "}
                                                              {new Intl.NumberFormat(
                                                                "en-GB",
                                                                {
                                                                  style:
                                                                    "currency",
                                                                  currency:
                                                                    "GBP",
                                                                },
                                                              ).format(
                                                                Number(
                                                                  OneOffPricingInfo.packageThreeDisCount,
                                                                ),
                                                              )}
                                                            </td>
                                                          )}
                                                        </tr>
                                                        <tr className="head-row">
                                                          <td className="tr-table-class text-white">
                                                            Discounted Total
                                                          </td>
                                                          <td
                                                            style={{
                                                              fontWeight:
                                                                getFontStyles(
                                                                  0,
                                                                  "Index",
                                                                ).fontWeight,
                                                              fontSize:
                                                                getFontStyles(
                                                                  0,
                                                                  "Index",
                                                                ).fontSize,
                                                            }}
                                                            className="tr-table-class text-white text-right"
                                                          >
                                                            {new Intl.NumberFormat(
                                                              "en-GB",
                                                              {
                                                                style:
                                                                  "currency",
                                                                currency: "GBP",
                                                              },
                                                            ).format(
                                                              Number(
                                                                OneOffPricingInfo.packageOneDisCountedTotal,
                                                              ),
                                                            )}
                                                          </td>
                                                          {packageCount >=
                                                            2 && (
                                                            <td
                                                              style={{
                                                                fontWeight:
                                                                  getFontStyles(
                                                                    1,
                                                                    "Index",
                                                                  ).fontWeight,
                                                                fontSize:
                                                                  getFontStyles(
                                                                    1,
                                                                    "Index",
                                                                  ).fontSize,
                                                              }}
                                                              className="tr-table-class text-white text-right"
                                                            >
                                                              {new Intl.NumberFormat(
                                                                "en-GB",
                                                                {
                                                                  style:
                                                                    "currency",
                                                                  currency:
                                                                    "GBP",
                                                                },
                                                              ).format(
                                                                Number(
                                                                  OneOffPricingInfo.packageTwoDisCountedTotal,
                                                                ),
                                                              )}
                                                            </td>
                                                          )}
                                                          {packageCount ==
                                                            3 && (
                                                            <td
                                                              style={{
                                                                fontWeight:
                                                                  getFontStyles(
                                                                    2,
                                                                    "Index",
                                                                  ).fontWeight,
                                                                fontSize:
                                                                  getFontStyles(
                                                                    2,
                                                                    "Index",
                                                                  ).fontSize,
                                                              }}
                                                              className="tr-table-class text-white text-right"
                                                            >
                                                              {new Intl.NumberFormat(
                                                                "en-GB",
                                                                {
                                                                  style:
                                                                    "currency",
                                                                  currency:
                                                                    "GBP",
                                                                },
                                                              ).format(
                                                                Number(
                                                                  OneOffPricingInfo.packageThreeDisCountedTotal,
                                                                ),
                                                              )}
                                                            </td>
                                                          )}
                                                        </tr>
                                                      </>
                                                    )}
                                                  {vatPercentage && (
                                                    <>
                                                      <tr class="head-grey-row">
                                                        <td className="tr-table-class text-white">
                                                          {getTaxName(
                                                            ProposalObject.currencyID,
                                                          )}
                                                        </td>
                                                        <td
                                                          style={{
                                                            fontWeight:
                                                              getFontStyles(
                                                                0,
                                                                "Index",
                                                              ).fontWeight,
                                                            fontSize:
                                                              getFontStyles(
                                                                0,
                                                                "Index",
                                                              ).fontSize,
                                                          }}
                                                          className="tr-table-class text-white text-right"
                                                        >
                                                          {" "}
                                                          {formatValue(
                                                            OneOffPricingInfo.PackageOneVaTPrice,
                                                          )}
                                                        </td>
                                                        {packageCount >= 2 && (
                                                          <td
                                                            style={{
                                                              fontWeight:
                                                                getFontStyles(
                                                                  1,
                                                                  "Index",
                                                                ).fontWeight,
                                                              fontSize:
                                                                getFontStyles(
                                                                  1,
                                                                  "Index",
                                                                ).fontSize,
                                                            }}
                                                            className="tr-table-class text-white text-right"
                                                          >
                                                            {" "}
                                                            {formatValue(
                                                              OneOffPricingInfo.PackageTwoVaTPrice,
                                                            )}
                                                          </td>
                                                        )}
                                                        {packageCount === 3 && (
                                                          <td
                                                            style={{
                                                              fontWeight:
                                                                getFontStyles(
                                                                  2,
                                                                  "Index",
                                                                ).fontWeight,
                                                              fontSize:
                                                                getFontStyles(
                                                                  2,
                                                                  "Index",
                                                                ).fontSize,
                                                            }}
                                                            className="tr-table-class text-white text-right"
                                                          >
                                                            {" "}
                                                            {formatValue(
                                                              OneOffPricingInfo.PackageThreeVaTPrice,
                                                            )}
                                                          </td>
                                                        )}
                                                      </tr>
                                                      <tr className="head-row">
                                                        <td className="tr-table-class text-white">
                                                          Grand Total
                                                        </td>
                                                        <td
                                                          style={{
                                                            fontWeight:
                                                              getFontStyles(
                                                                0,
                                                                "Index",
                                                              ).fontWeight,
                                                            fontSize:
                                                              getFontStyles(
                                                                0,
                                                                "Index",
                                                              ).fontSize,
                                                          }}
                                                          className="tr-table-class text-white text-right"
                                                        >
                                                          {" "}
                                                          {formatValue(
                                                            OneOffPricingInfo.PackageOneGrandTotal,
                                                          )}
                                                        </td>
                                                        {packageCount >= 2 && (
                                                          <td
                                                            style={{
                                                              fontWeight:
                                                                getFontStyles(
                                                                  1,
                                                                  "Index",
                                                                ).fontWeight,
                                                              fontSize:
                                                                getFontStyles(
                                                                  1,
                                                                  "Index",
                                                                ).fontSize,
                                                            }}
                                                            className="tr-table-class text-white text-right"
                                                          >
                                                            {" "}
                                                            {formatValue(
                                                              OneOffPricingInfo.PackageTwoGrandTotal,
                                                            )}
                                                          </td>
                                                        )}
                                                        {packageCount == 3 && (
                                                          <td
                                                            style={{
                                                              fontWeight:
                                                                getFontStyles(
                                                                  2,
                                                                  "Index",
                                                                ).fontWeight,
                                                              fontSize:
                                                                getFontStyles(
                                                                  2,
                                                                  "Index",
                                                                ).fontSize,
                                                            }}
                                                            className="tr-table-class text-white text-right"
                                                          >
                                                            {" "}
                                                            {formatValue(
                                                              OneOffPricingInfo.PackageThreeGrandTotal,
                                                            )}
                                                          </td>
                                                        )}
                                                      </tr>
                                                    </>
                                                  )}
                                                </table>
                                              </div>
                                            ) : (
                                              <div
                                                style={{ marginTop: "0px" }}
                                                className="table-responsive"
                                              >
                                                {/* <div
                                                                          dangerouslySetInnerHTML={{
                                                                            __html: currentPricingTableDesignRecurring,
                                                                          }}
                                                                        /> */}
                                                <table
                                                  class="table align-middle table-nowrap"
                                                  style={{ width: "100%" }}
                                                >
                                                  <thead className="table-dark text-white">
                                                    {renderCustomPackageNameHeader(
                                                      vatPercentage,
                                                    )}
                                                    {renderCustomPackageSubHeader(
                                                      vatPercentage,
                                                    )}
                                                  </thead>
                                                  <tbody>
                                                    {selectedOneOffServiceList.map(
                                                      (
                                                        serviceCategory,
                                                        categoryIndex,
                                                      ) => (
                                                        <React.Fragment
                                                          key={`oneoff-category-${
                                                            serviceCategory.serviceCatID ||
                                                            categoryIndex
                                                          }`}
                                                        >
                                                          {renderCustomCategoryRow(
                                                            serviceCategory.serviceCatName,
                                                            vatPercentage,
                                                          )}

                                                          {(
                                                            serviceCategory.servicesList ||
                                                            []
                                                          ).map(
                                                            (
                                                              subService,
                                                              subIndex,
                                                            ) => (
                                                              <tr
                                                                key={`oneoff-service-${
                                                                  subService.serviceID ||
                                                                  `${categoryIndex}-${subIndex}`
                                                                }`}
                                                              >
                                                                {visibleFieldsCustomTemp?.serviceName && (
                                                                  <td>
                                                                    {subService.serviceName ||
                                                                      "-"}
                                                                  </td>
                                                                )}

                                                                {activeOneOffPackages.map(
                                                                  (
                                                                    packageItem,
                                                                    packageIndex,
                                                                  ) => {
                                                                    const packageRow =
                                                                      calculateOneOffPackageServiceRow(
                                                                        {
                                                                          service:
                                                                            subService,
                                                                          packageIndex,
                                                                          fallbackVatRate:
                                                                            getOneOffPackageFallbackVatRate(
                                                                              packageItem,
                                                                            ),
                                                                        },
                                                                      );

                                                                    return (
                                                                      <React.Fragment
                                                                        key={`oneoff-package-${subService.serviceID}-${packageIndex}`}
                                                                      >
                                                                        {visibleFieldsCustomTemp?.fees && (
                                                                          <td className="text-right">
                                                                            {!packageRow.isIncluded ? (
                                                                              "-"
                                                                            ) : showOneOffPackageBreakdown ? (
                                                                              formatValue(
                                                                                packageRow.price,
                                                                                currencyID,
                                                                              )
                                                                            ) : showOneOffPackageCheckMark ? (
                                                                              <span
                                                                                className="fa fa-check"
                                                                                aria-label="Included"
                                                                              />
                                                                            ) : (
                                                                              "-"
                                                                            )}
                                                                          </td>
                                                                        )}

                                                                        {showOneOffVat &&
                                                                          visibleFieldsCustomTemp?.vatRate && (
                                                                            <td className="text-right">
                                                                              {packageRow.isIncluded
                                                                                ? `${packageRow.vatRate}%`
                                                                                : "-"}
                                                                            </td>
                                                                          )}

                                                                        {showOneOffVat &&
                                                                          visibleFieldsCustomTemp?.vat && (
                                                                            <td className="text-right">
                                                                              {!packageRow.isIncluded ? (
                                                                                "-"
                                                                              ) : showOneOffPackageBreakdown ? (
                                                                                formatValue(
                                                                                  packageRow.vatAmount,
                                                                                  currencyID,
                                                                                )
                                                                              ) : showOneOffPackageCheckMark ? (
                                                                                <span
                                                                                  className="fa fa-check"
                                                                                  aria-label="Included"
                                                                                />
                                                                              ) : (
                                                                                "-"
                                                                              )}
                                                                            </td>
                                                                          )}

                                                                        {showOneOffVat &&
                                                                          visibleFieldsCustomTemp?.feesIncVat && (
                                                                            <td className="text-right">
                                                                              {!packageRow.isIncluded ? (
                                                                                "-"
                                                                              ) : showOneOffPackageBreakdown ? (
                                                                                formatValue(
                                                                                  packageRow.feesIncludingVat,
                                                                                  currencyID,
                                                                                )
                                                                              ) : showOneOffPackageCheckMark ? (
                                                                                <span
                                                                                  className="fa fa-check"
                                                                                  aria-label="Included"
                                                                                />
                                                                              ) : (
                                                                                "-"
                                                                              )}
                                                                            </td>
                                                                          )}

                                                                        {visibleFieldsCustomTemp?.serviceScope && (
                                                                          <td>
                                                                            {packageRow.isIncluded
                                                                              ? renderOneOffPackageScope(
                                                                                  subService,
                                                                                )
                                                                              : "-"}
                                                                          </td>
                                                                        )}
                                                                      </React.Fragment>
                                                                    );
                                                                  },
                                                                )}
                                                              </tr>
                                                            ),
                                                          )}
                                                        </React.Fragment>
                                                      ),
                                                    )}
                                                  </tbody>
                                                  {packageCount > 1 && (
                                                    <>
                                                      <tr id="recurring_DefaultWithPackages">
                                                        <td
                                                          style={{
                                                            padding: "8px",
                                                          }}
                                                        >
                                                          Discount (%)
                                                        </td>

                                                        <td
                                                          style={{
                                                            width: "35%",
                                                            padding: "0px",
                                                            whiteSpace:
                                                              "normal",
                                                          }}
                                                        >
                                                          <div
                                                            style={{
                                                              display: "flex",
                                                              flexDirection:
                                                                "column",
                                                              alignItems:
                                                                "flex-start",
                                                            }}
                                                          >
                                                            <input
                                                              className="input-text"
                                                              type="text"
                                                              placeholder="Discount (%)"
                                                              value={
                                                                Number(
                                                                  OneOffPricingInfo.DiscountPercentagePackageOne ||
                                                                    0,
                                                                ).toFixed(2) ||
                                                                ""
                                                              }
                                                              disabled
                                                              onChange={(e) => {
                                                                handleOneOffPackageOneDiscountPercentage(
                                                                  e,
                                                                );
                                                              }}
                                                              style={{
                                                                width: "100%",
                                                                textAlign:
                                                                  "right",
                                                              }}
                                                            />
                                                            <div>
                                                              {getValidationMessage(
                                                                requireMessage,
                                                                pricingSettingObj.maxDiscountForQC,
                                                                OneOffPricingInfo.DiscountPercentagePackageOne,
                                                              )}
                                                            </div>
                                                          </div>
                                                        </td>

                                                        {packageCount >= 2 && (
                                                          <>
                                                            {showOneOffVat &&
                                                              visibleFieldsCustomTemp.vatRate && (
                                                                <td className="tr-table-class font-14 text-white"></td>
                                                              )}
                                                            {showOneOffVat &&
                                                              visibleFieldsCustomTemp.vat && (
                                                                <td className="tr-table-class font-14 text-white"></td>
                                                              )}
                                                            {showOneOffVat &&
                                                              visibleFieldsCustomTemp.feesIncVat && (
                                                                <td className="tr-table-class font-14 text-white"></td>
                                                              )}
                                                            {visibleFieldsCustomTemp.serviceScope && (
                                                              <td className="tr-table-class font-14 text-white"></td>
                                                            )}
                                                            <td
                                                              style={{
                                                                width: "35%",
                                                                padding: "0px",
                                                                whiteSpace:
                                                                  "normal",
                                                              }}
                                                            >
                                                              <div
                                                                style={{
                                                                  display:
                                                                    "flex",
                                                                  flexDirection:
                                                                    "column",
                                                                  alignItems:
                                                                    "flex-start",
                                                                }}
                                                              >
                                                                <input
                                                                  className="input-text"
                                                                  type="text"
                                                                  placeholder="Discount (%)"
                                                                  value={
                                                                    Number(
                                                                      OneOffPricingInfo.DiscountPercentagePackageTwo ||
                                                                        0,
                                                                    ).toFixed(
                                                                      2,
                                                                    ) || ""
                                                                  }
                                                                  disabled
                                                                  onChange={(
                                                                    e,
                                                                  ) => {
                                                                    handleOneOffPackageTwoDiscountPercentage(
                                                                      e,
                                                                    );
                                                                  }}
                                                                  style={{
                                                                    width:
                                                                      "100%",
                                                                    textAlign:
                                                                      "right",
                                                                  }}
                                                                />
                                                                <div>
                                                                  {getValidationMessage(
                                                                    requireMessage,
                                                                    pricingSettingObj.maxDiscountForQC,
                                                                    OneOffPricingInfo.DiscountPercentagePackageTwo,
                                                                  )}
                                                                </div>
                                                              </div>
                                                            </td>
                                                          </>
                                                        )}

                                                        {packageCount === 3 && (
                                                          <>
                                                            {showOneOffVat &&
                                                              visibleFieldsCustomTemp.vatRate && (
                                                                <td className="tr-table-class font-14 text-white"></td>
                                                              )}
                                                            {showOneOffVat &&
                                                              visibleFieldsCustomTemp.vat && (
                                                                <td className="tr-table-class font-14 text-white"></td>
                                                              )}
                                                            {showOneOffVat &&
                                                              visibleFieldsCustomTemp.feesIncVat && (
                                                                <td className="tr-table-class font-14 text-white"></td>
                                                              )}
                                                            {visibleFieldsCustomTemp.serviceScope && (
                                                              <td></td>
                                                            )}
                                                            <td
                                                              style={{
                                                                width: "35%",
                                                                padding: "0px",
                                                                whiteSpace:
                                                                  "normal",
                                                              }}
                                                            >
                                                              <div
                                                                style={{
                                                                  display:
                                                                    "flex",
                                                                  flexDirection:
                                                                    "column",
                                                                  alignItems:
                                                                    "flex-start",
                                                                }}
                                                              >
                                                                <input
                                                                  className="input-text"
                                                                  type="text"
                                                                  placeholder="Discount (%)"
                                                                  value={
                                                                    Number(
                                                                      OneOffPricingInfo.DiscountPercentagePackageThree ||
                                                                        0,
                                                                    ).toFixed(
                                                                      2,
                                                                    ) || ""
                                                                  }
                                                                  disabled
                                                                  onChange={(
                                                                    e,
                                                                  ) => {
                                                                    handleOneOffPackageThreeDiscountPercentage(
                                                                      e,
                                                                    );
                                                                  }}
                                                                  style={{
                                                                    width:
                                                                      "100%",
                                                                    textAlign:
                                                                      "right",
                                                                  }}
                                                                />
                                                                <div>
                                                                  {getValidationMessage(
                                                                    requireMessage,
                                                                    pricingSettingObj.maxDiscountForQC,
                                                                    OneOffPricingInfo.DiscountPercentagePackageThree,
                                                                  )}
                                                                </div>
                                                              </div>
                                                            </td>
                                                          </>
                                                        )}
                                                      </tr>
                                                    </>
                                                  )}

                                                  <tfoot>
                                                    {/* === NET TOTAL === */}
                                                    <tr className="head-row">
                                                      <td className="tr-table-class font-14 text-white">
                                                        Net Total
                                                      </td>

                                                      {activeOneOffPackages.map(
                                                        (
                                                          packageItem,
                                                          packageIndex,
                                                        ) => {
                                                          const totals =
                                                            oneOffPackageFooterTotals[
                                                              packageIndex
                                                            ];

                                                          const useOneOffPackageFinalAsNet =
                                                            totals.hasPriceIncrease ||
                                                            (totals.hasPositiveDiscount &&
                                                              !showOneOffPackageDiscountLines);

                                                          const displayedNetTotal =
                                                            useOneOffPackageFinalAsNet
                                                              ? totals.finalNetTotal
                                                              : totals.originalNetTotal;

                                                          const displayedVatTotal =
                                                            useOneOffPackageFinalAsNet
                                                              ? totals.finalVatTotal
                                                              : totals.originalVatTotal;

                                                          const displayedFeesIncludingVat =
                                                            useOneOffPackageFinalAsNet
                                                              ? totals.grandTotalIncludingVat
                                                              : totals.originalFeesIncludingVat;

                                                          return (
                                                            <React.Fragment
                                                              key={`one-off-package-net-${packageIndex}`}
                                                            >
                                                              {visibleFieldsCustomTemp?.fees && (
                                                                <td className="tr-table-class font-14 text-white text-right">
                                                                  {formatValue(
                                                                    displayedNetTotal,
                                                                    currencyID,
                                                                  )}
                                                                </td>
                                                              )}

                                                              {showOneOffVat &&
                                                                visibleFieldsCustomTemp?.vatRate && (
                                                                  <td className="tr-table-class font-14 text-white" />
                                                                )}

                                                              {showOneOffVat &&
                                                                visibleFieldsCustomTemp?.vat && (
                                                                  <td className="tr-table-class font-14 text-white text-right">
                                                                    {formatValue(
                                                                      displayedVatTotal,
                                                                      currencyID,
                                                                    )}
                                                                  </td>
                                                                )}

                                                              {showOneOffVat &&
                                                                visibleFieldsCustomTemp?.feesIncVat && (
                                                                  <td className="tr-table-class font-14 text-white text-right">
                                                                    {formatValue(
                                                                      displayedFeesIncludingVat,
                                                                      currencyID,
                                                                    )}
                                                                  </td>
                                                                )}

                                                              {visibleFieldsCustomTemp?.serviceScope && (
                                                                <td />
                                                              )}
                                                            </React.Fragment>
                                                          );
                                                        },
                                                      )}
                                                    </tr>

                                                    {/* === DISCOUNT === */}
                                                    {showOneOffPackageDiscountLines && (
                                                      <tr className="head-grey-row">
                                                        <td className="tr-table-class font-14 text-white">
                                                          Discount
                                                        </td>

                                                        {activeOneOffPackages.map(
                                                          (
                                                            packageItem,
                                                            packageIndex,
                                                          ) => {
                                                            const totals =
                                                              oneOffPackageFooterTotals[
                                                                packageIndex
                                                              ];

                                                            const hasDiscount =
                                                              totals.discountAmount >
                                                              0;

                                                            return (
                                                              <React.Fragment
                                                                key={`one-off-package-discount-${packageIndex}`}
                                                              >
                                                                {visibleFieldsCustomTemp?.fees && (
                                                                  <td className="tr-table-class font-14 text-white text-right">
                                                                    {hasDiscount
                                                                      ? `(-) ${formatValue(
                                                                          totals.discountAmount,
                                                                          currencyID,
                                                                        )}`
                                                                      : "-"}
                                                                  </td>
                                                                )}

                                                                {showOneOffVat &&
                                                                  visibleFieldsCustomTemp?.vatRate && (
                                                                    <td className="tr-table-class font-14 text-white" />
                                                                  )}

                                                                {showOneOffVat &&
                                                                  visibleFieldsCustomTemp?.vat && (
                                                                    <td className="tr-table-class font-14 text-white text-right">
                                                                      {hasDiscount
                                                                        ? `(-) ${formatValue(
                                                                            totals.vatDiscount,
                                                                            currencyID,
                                                                          )}`
                                                                        : "-"}
                                                                    </td>
                                                                  )}

                                                                {showOneOffVat &&
                                                                  visibleFieldsCustomTemp?.feesIncVat && (
                                                                    <td className="tr-table-class font-14 text-white text-right">
                                                                      {hasDiscount
                                                                        ? `(-) ${formatValue(
                                                                            totals.discountIncludingVat,
                                                                            currencyID,
                                                                          )}`
                                                                        : "-"}
                                                                    </td>
                                                                  )}

                                                                {visibleFieldsCustomTemp?.serviceScope && (
                                                                  <td />
                                                                )}
                                                              </React.Fragment>
                                                            );
                                                          },
                                                        )}
                                                      </tr>
                                                    )}

                                                    {/* === GRAND TOTAL === */}
                                                    {showOneOffPackageDiscountLines && (
                                                      <tr className="head-row">
                                                        <td className="tr-table-class font-14 text-white">
                                                          {showOneOffVat
                                                            ? "Grand Total"
                                                            : "Discounted Total"}
                                                        </td>

                                                        {activeOneOffPackages.map(
                                                          (
                                                            packageItem,
                                                            packageIndex,
                                                          ) => {
                                                            const totals =
                                                              oneOffPackageFooterTotals[
                                                                packageIndex
                                                              ];

                                                            return (
                                                              <React.Fragment
                                                                key={`one-off-package-grand-${packageIndex}`}
                                                              >
                                                                {visibleFieldsCustomTemp?.fees && (
                                                                  <td className="tr-table-class font-14 text-white text-right">
                                                                    {formatValue(
                                                                      totals.finalNetTotal,
                                                                      currencyID,
                                                                    )}
                                                                  </td>
                                                                )}

                                                                {showOneOffVat &&
                                                                  visibleFieldsCustomTemp?.vatRate && (
                                                                    <td className="tr-table-class font-14 text-white" />
                                                                  )}

                                                                {showOneOffVat &&
                                                                  visibleFieldsCustomTemp?.vat && (
                                                                    <td className="tr-table-class font-14 text-white text-right">
                                                                      {formatValue(
                                                                        totals.finalVatTotal,
                                                                        currencyID,
                                                                      )}
                                                                    </td>
                                                                  )}

                                                                {showOneOffVat &&
                                                                  visibleFieldsCustomTemp?.feesIncVat && (
                                                                    <td className="tr-table-class font-14 text-white text-right">
                                                                      {formatValue(
                                                                        totals.grandTotalIncludingVat,
                                                                        currencyID,
                                                                      )}
                                                                    </td>
                                                                  )}

                                                                {visibleFieldsCustomTemp?.serviceScope && (
                                                                  <td />
                                                                )}
                                                              </React.Fragment>
                                                            );
                                                          },
                                                        )}
                                                      </tr>
                                                    )}
                                                  </tfoot>
                                                </table>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="row fieldset">
                                  <div className="col-lg-3 text-lg-right">
                                    <label className="fieldset-label required">
                                      Fees in the {proposalName}
                                    </label>
                                  </div>
                                  <div className="col-lg-9">
                                    <div className="input-group">
                                      {/* Add your Select component here */}
                                      <Select
                                        // isDisabled
                                        className="phone-input-country-code selectDropDown Drop-down-width"
                                        value={feeTypeValue}
                                        options={Utils.feeInProposal}
                                        onChange={handleChangeFeesType}
                                      />
                                    </div>
                                  </div>
                                </div>
                                {ProposalObject.paymentGatewayID !== null && (
                                  <div className="row fieldset">
                                    <div className="col-lg-3 text-lg-right">
                                      <label className="fieldset-label required">
                                        Payment Gateway
                                        <span className="text-danger">*</span>
                                      </label>
                                    </div>
                                    <div className="col-md-9 mb-2">
                                      <div className="input-group">
                                        {/* Adjust the Select component as needed */}
                                        <Select
                                          isDisabled
                                          className="phone-input-country-code selectDropDown Drop-down-width"
                                          value={PaymentGatewayValue}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                )}
                                <div className="row fieldset">
                                  <div className="col-lg-3 text-lg-right">
                                    <label className="fieldset-label required">
                                      Show Discount
                                    </label>
                                  </div>
                                  <div className="col-lg-9">
                                    <div className="input-group">
                                      {/* Replace Select with Checkbox */}
                                      <input
                                        type="checkbox"
                                        disabled
                                        checked={ProposalObject.DiscountLines}
                                      />
                                    </div>
                                  </div>
                                </div>
                                {selectedRecurringServiceList?.length !== 0 && (
                                  <div className="tab-content">
                                    <div className="tab-pane p-3 active">
                                      <div className="row">
                                        <div className="col-lg-12">
                                          <div className="separator mb-2"></div>
                                          <h6>Recurring Services</h6>
                                          <div className="separator mb-3"></div>
                                          {ProposalObject.quoteTypeID !== 4 && (
                                            <>
                                              <div className="row fieldset">
                                                <div className="col-md-2 col-sm-12  text-md-end">
                                                  <label className="fieldset-label">
                                                    Original Price (
                                                    {getCurrencySymbol(
                                                      ProposalObject.currencyID,
                                                    )}
                                                    )
                                                  </label>
                                                </div>
                                                <div className="col-md-4 col-sm-12">
                                                  <input
                                                    readonly=""
                                                    type="text"
                                                    class="input-text"
                                                    value={
                                                      Number(
                                                        Math.floor(
                                                          RecurringPricingInfo.OriginalPrice *
                                                            100,
                                                        ) / 100,
                                                      )
                                                        .toFixed(2)
                                                        .replace(
                                                          /\B(?=(\d{3})+(?!\d))/g,
                                                          ",",
                                                        )

                                                      // RecurringPricingInfo.OriginalPrice
                                                    }
                                                  />
                                                </div>
                                                <div className="col-md-2 col-sm-12  text-md-end">
                                                  <label className="fieldset-label required">
                                                    Payment Frequency
                                                  </label>
                                                </div>
                                                <div className="col-md-4 col-sm-12">
                                                  <Select
                                                    isDisabled
                                                    className="phone-input-country-code selectDropDown Drop-down-width"
                                                    value={selectedFrequency}
                                                  />
                                                </div>
                                              </div>
                                              <div
                                                class="row"
                                                id="recurring_Default"
                                              >
                                                <div class="col-lg-2 mb-1 col-md-2 col-sm-12 mt-2 text-md-end">
                                                  <label className="fieldset-label">
                                                    Discount (%)
                                                  </label>
                                                </div>
                                                <div class="col-lg-4 col-md-4 col-sm-12">
                                                  <input
                                                    readonly=""
                                                    class="input-text"
                                                    type="text"
                                                    placeholder="Discount (%)"
                                                    value={
                                                      Number(
                                                        Math.floor(
                                                          RecurringPricingInfo.DefaultDiscount *
                                                            100,
                                                        ) / 100,
                                                      )
                                                        .toFixed(2)
                                                        .replace(
                                                          /\B(?=(\d{3})+(?!\d))/g,
                                                          ",",
                                                        )

                                                      // RecurringPricingInfo.DefaultDiscount
                                                    }
                                                  />
                                                </div>
                                                <div
                                                  style={{ padding: "0px" }}
                                                  class="col-lg-2 col-md-2  col-sm-12"
                                                >
                                                  <div class="mt-2 text-md-end">
                                                    <label class="form-label">
                                                      Discounted Price (
                                                      {getCurrencySymbol(
                                                        ProposalObject.currencyID,
                                                      )}
                                                      )
                                                    </label>
                                                  </div>
                                                </div>
                                                <div class="col-lg-4 col-md-4 col-sm-12">
                                                  <input
                                                    readonly=""
                                                    class="input-text"
                                                    type="text"
                                                    placeholder={`Discounted Price (${getCurrencySymbol(
                                                      ProposalObject.currencyID,
                                                    )})`}
                                                    value={
                                                      Number(
                                                        Math.floor(
                                                          RecurringPricingInfo.DiscountedPrice *
                                                            100,
                                                        ) / 100,
                                                      )
                                                        .toFixed(2)
                                                        .replace(
                                                          /\B(?=(\d{3})+(?!\d))/g,
                                                          ",",
                                                        )

                                                      // RecurringPricingInfo.DiscountedPrice
                                                    }
                                                  />
                                                </div>
                                              </div>
                                            </>
                                          )}
                                          <div className="mb-3"></div>
                                          {pricingTableColumnIDs === null ||
                                          pricingTableColumnIDs === "" ||
                                          pricingTableColumnIDs ===
                                            undefined ? (
                                            <div
                                              style={{ marginTop: "0px" }}
                                              className="table-responsive"
                                            >
                                              <table className="table align-middle table-nowrap">
                                                <thead className="table-light table-header-font">
                                                  <tr className="head-row">
                                                    <th className="tr-table-class text-white">
                                                      Services
                                                    </th>
                                                    {ProposalObject.quoteTypeID !==
                                                      4 && (
                                                      <th className="tr-table-class text-white text-right">
                                                        Fees (
                                                        {getCurrencySymbol(
                                                          ProposalObject.currencyID,
                                                        )}
                                                        )
                                                      </th>
                                                    )}
                                                  </tr>
                                                </thead>
                                                <tbody>
                                                  {selectedRecurringServiceList.map(
                                                    (service, index) => {
                                                      return (
                                                        <>
                                                          <tr class="a-la-carte-services-review-head-row">
                                                            <th colspan="2">
                                                              {
                                                                service.serviceCatName
                                                              }
                                                            </th>
                                                          </tr>
                                                          {service.servicesList.map(
                                                            (
                                                              subService,
                                                              subIndex,
                                                            ) => {
                                                              return (
                                                                <tr
                                                                  key={subIndex}
                                                                >
                                                                  {/* */}
                                                                  <td>
                                                                    <div>
                                                                      {
                                                                        subService.serviceName
                                                                      }
                                                                    </div>
                                                                    <div class="package-variables"></div>
                                                                  </td>
                                                                  {ProposalObject.quoteTypeID !==
                                                                    4 && (
                                                                    <td className="text-right">
                                                                      {ProposalObject.feeTypeId ===
                                                                        1 && (
                                                                        <>
                                                                          {" "}
                                                                          {
                                                                            currencySymbol
                                                                          }
                                                                          {formatValue(
                                                                            subService.quotationPrice,
                                                                          )}
                                                                        </>
                                                                      )}
                                                                      {ProposalObject.feeTypeId ===
                                                                        2 && (
                                                                        <span className="fa fa-check"></span>
                                                                      )}
                                                                    </td>
                                                                  )}
                                                                </tr>
                                                              );
                                                            },
                                                          )}
                                                        </>
                                                      );
                                                    },
                                                  )}
                                                  {ProposalObject.quoteTypeID !==
                                                    4 && (
                                                    <tr className="head-row">
                                                      <td className="tr-table-class text-white">
                                                        Net Total
                                                      </td>
                                                      <td className="tr-table-class text-white text-right">
                                                        {" "}
                                                        {currencySymbol}
                                                        {
                                                          Number(
                                                            RecurringPricingInfo.OriginalPrice,
                                                          ) <
                                                            Number(
                                                              RecurringPricingInfo.DiscountedPrice,
                                                            ) ||
                                                          (Number(
                                                            RecurringPricingInfo.Discount,
                                                          ) > 0 &&
                                                            !ProposalObject.DiscountLines)
                                                            ? formatValue(
                                                                RecurringPricingInfo.DiscountedPrice,
                                                              )
                                                            : // Number(RecurringPricingInfo.DiscountedPrice)
                                                              //     .toFixed(2)
                                                              //     .toString()
                                                              //     .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                                                              formatValue(
                                                                RecurringPricingInfo.OriginalPrice,
                                                              )
                                                          // Number(RecurringPricingInfo.OriginalPrice)
                                                          //     .toFixed(2)
                                                          //     .toString()
                                                          //     .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                                                        }
                                                      </td>
                                                    </tr>
                                                  )}
                                                  {Number(
                                                    RecurringPricingInfo.Discount,
                                                  ) > 0 &&
                                                    ProposalObject.DiscountLines && (
                                                      <>
                                                        <tr class="head-grey-row">
                                                          <td className="tr-table-class text-white">
                                                            Discount
                                                          </td>
                                                          <td className="tr-table-class text-white text-right">
                                                            (-)
                                                            {currencySymbol}
                                                            {
                                                              formatValue(
                                                                RecurringPricingInfo.Discount,
                                                              )
                                                              // Number(RecurringPricingInfo.Discount)
                                                              //   .toFixed(2)
                                                              //   .toString()
                                                              //   .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                                                            }
                                                          </td>
                                                        </tr>
                                                        <tr class="head-row">
                                                          <td className="tr-table-class text-white">
                                                            Discounted Total
                                                          </td>
                                                          <td className="tr-table-class text-white text-right">
                                                            {" "}
                                                            {currencySymbol}
                                                            {
                                                              formatValue(
                                                                RecurringPricingInfo.DiscountedTotal,
                                                              )
                                                              // Number(
                                                              //   RecurringPricingInfo.DiscountedTotal
                                                              // )
                                                              //   .toFixed(2)
                                                              //   .toString()
                                                              //   .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                                                            }
                                                          </td>
                                                        </tr>
                                                      </>
                                                    )}

                                                  {vatPercentage && (
                                                    <>
                                                      <tr class="head-grey-row">
                                                        <td className="tr-table-class text-white">
                                                          {getTaxName(
                                                            ProposalObject.currencyID,
                                                          )}
                                                        </td>
                                                        <td className="tr-table-class text-white text-right">
                                                          {" "}
                                                          {currencySymbol}
                                                          {
                                                            formatValue(
                                                              RecurringPricingInfo.VATPrice,
                                                            )
                                                            // Number(RecurringPricingInfo.VATPrice)
                                                            //   .toFixed(2)
                                                            //   .toString()
                                                            //   .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                                                          }
                                                        </td>
                                                      </tr>
                                                      <tr className="head-row">
                                                        <td className="tr-table-class text-white">
                                                          Grand Total
                                                        </td>
                                                        <td className="tr-table-class text-white text-right">
                                                          {" "}
                                                          {currencySymbol}
                                                          {
                                                            formatValue(
                                                              RecurringPricingInfo.GrandTotal,
                                                            )
                                                            // Number(RecurringPricingInfo.GrandTotal)
                                                            //   .toFixed(2)
                                                            //   .toString()
                                                            //   .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                                                          }
                                                        </td>
                                                      </tr>
                                                    </>
                                                  )}
                                                </tbody>
                                              </table>
                                            </div>
                                          ) : (
                                            <div
                                              style={{ marginTop: "0px" }}
                                              className="table-responsive"
                                            >
                                              <table className="table align-middle table-nowrap">
                                                <thead className="table-dark text-white">
                                                  <tr className="head-row">
                                                    {visibleFieldsCustomTemp?.serviceCategory && (
                                                      <th
                                                        className="tr-table-class text-white text-center"
                                                        style={{
                                                          width: "16.66%",
                                                        }}
                                                      >
                                                        Service Category
                                                      </th>
                                                    )}
                                                    {visibleFieldsCustomTemp.serviceName && (
                                                      <th
                                                        className="tr-table-class text-white text-center"
                                                        style={{
                                                          width: "16.66%",
                                                        }}
                                                      >
                                                        Services
                                                      </th>
                                                    )}
                                                    {visibleFieldsCustomTemp.serviceScope && (
                                                      <th
                                                        className="tr-table-class text-white text-center"
                                                        style={{
                                                          width: "16.66%",
                                                        }}
                                                      >
                                                        Service Scope
                                                      </th>
                                                    )}

                                                    {visibleFieldsCustomTemp.fees && (
                                                      <th
                                                        className="tr-table-class text-white text-center"
                                                        style={{
                                                          width: "16.66%",
                                                        }}
                                                      >
                                                        Fees ({currencySymbol})
                                                      </th>
                                                    )}
                                                    {showRecurringVat &&
                                                      visibleFieldsCustomTemp.vatRate && (
                                                        <th
                                                          className="tr-table-class text-white text-center"
                                                          style={{
                                                            width: "16.66%",
                                                          }}
                                                        >
                                                          {taxName} Rate
                                                        </th>
                                                      )}
                                                    {showRecurringVat &&
                                                      visibleFieldsCustomTemp.vat && (
                                                        <th
                                                          className="tr-table-class text-white text-center"
                                                          style={{
                                                            width: "16.66%",
                                                          }}
                                                        >
                                                          {taxName} (
                                                          {currencySymbol})
                                                        </th>
                                                      )}
                                                    {showRecurringVat &&
                                                      visibleFieldsCustomTemp.feesIncVat && (
                                                        <th
                                                          className="tr-table-class text-white text-center"
                                                          style={{
                                                            width: "16.66%",
                                                          }}
                                                        >
                                                          Fees inc {taxName} (
                                                          {currencySymbol})
                                                        </th>
                                                      )}
                                                  </tr>
                                                </thead>

                                                <tbody>
                                                  {selectedRecurringServiceList.map(
                                                    (service, index) => (
                                                      <React.Fragment
                                                        key={`service-category-${service.serviceCatID || index}`}
                                                      >
                                                        {(
                                                          service.servicesList ||
                                                          []
                                                        ).map(
                                                          (
                                                            subService,
                                                            subIndex,
                                                          ) => {
                                                            /*
                                                             * quotationPriceWithAllDecimal gives better calculation accuracy.
                                                             * formatValue will handle the final displayed decimal places.
                                                             */
                                                            const price =
                                                              Number(
                                                                subService.quotationPriceWithAllDecimal ??
                                                                  subService.quotationPrice ??
                                                                  0,
                                                              );

                                                            /*
                                                             * The current API returns service-level vatPercentage as 0,
                                                             * but finalQuotationAmountList returns recurring VAT as 20%.
                                                             */
                                                            const vatRate =
                                                              Number(
                                                                subService.vatPercentage,
                                                              ) > 0
                                                                ? Number(
                                                                    subService.vatPercentage,
                                                                  )
                                                                : recurringVatPercentage;

                                                            /*
                                                             * Use the service VAT amount when the API provides it.
                                                             * Otherwise calculate it using the recurring VAT percentage.
                                                             */
                                                            const vatAmount =
                                                              Number(
                                                                subService.vatAmount,
                                                              ) > 0
                                                                ? Number(
                                                                    subService.vatAmount,
                                                                  )
                                                                : (price *
                                                                    vatRate) /
                                                                  100;

                                                            const feesIncludingVat =
                                                              price + vatAmount;

                                                            const driverList =
                                                              Array.isArray(
                                                                subService.pricingDriverList,
                                                              )
                                                                ? subService.pricingDriverList
                                                                : [];

                                                            return (
                                                              <tr
                                                                key={`sub-service-${service.serviceCatID}-${subIndex}`}
                                                              >
                                                                {visibleFieldsCustomTemp?.serviceCategory && (
                                                                  <td className="text-center">
                                                                    {service.serviceCatName ||
                                                                      "-"}
                                                                  </td>
                                                                )}

                                                                {visibleFieldsCustomTemp?.serviceName && (
                                                                  <td className="text-center">
                                                                    {subService.serviceName ||
                                                                      "-"}
                                                                  </td>
                                                                )}

                                                                {visibleFieldsCustomTemp?.serviceScope && (
                                                                  <td className="text-center">
                                                                    {driverList.length >
                                                                    0
                                                                      ? driverList.map(
                                                                          (
                                                                            driver,
                                                                            driverIndex,
                                                                          ) => (
                                                                            <div
                                                                              key={
                                                                                driver.driverID ||
                                                                                `driver-${driverIndex}`
                                                                              }
                                                                            >
                                                                              {
                                                                                driver.driverName
                                                                              }{" "}
                                                                              ={" "}
                                                                              {
                                                                                driver.driverValue
                                                                              }
                                                                            </div>
                                                                          ),
                                                                        )
                                                                      : "-"}
                                                                  </td>
                                                                )}

                                                                {visibleFieldsCustomTemp?.fees && (
                                                                  <td className="text-center">
                                                                    {showFullBreakdown &&
                                                                      formatValue(
                                                                        price,
                                                                      )}

                                                                    {showCheckMark && (
                                                                      <span
                                                                        className="fa fa-check"
                                                                        aria-label="Included"
                                                                      />
                                                                    )}
                                                                  </td>
                                                                )}

                                                                {showRecurringVat &&
                                                                  visibleFieldsCustomTemp?.vatRate && (
                                                                    <td className="text-center">
                                                                      {vatRate}%
                                                                    </td>
                                                                  )}

                                                                {showRecurringVat &&
                                                                  visibleFieldsCustomTemp?.vat && (
                                                                    <td className="text-center">
                                                                      {showFullBreakdown &&
                                                                        formatValue(
                                                                          vatAmount,
                                                                        )}

                                                                      {showCheckMark && (
                                                                        <span
                                                                          className="fa fa-check"
                                                                          aria-label="Included"
                                                                        />
                                                                      )}
                                                                    </td>
                                                                  )}

                                                                {showRecurringVat &&
                                                                  visibleFieldsCustomTemp?.feesIncVat && (
                                                                    <td className="text-center">
                                                                      {showFullBreakdown &&
                                                                        formatValue(
                                                                          feesIncludingVat,
                                                                        )}

                                                                      {showCheckMark && (
                                                                        <span
                                                                          className="fa fa-check"
                                                                          aria-label="Included"
                                                                        />
                                                                      )}
                                                                    </td>
                                                                  )}
                                                              </tr>
                                                            );
                                                          },
                                                        )}
                                                      </React.Fragment>
                                                    ),
                                                  )}

                                                  {/* === NET TOTAL ROW === */}
                                                  <tr className="head-row">
                                                    {renderRecurringFooterLabel(
                                                      "Net Total",
                                                    )}

                                                    {visibleFieldsCustomTemp?.fees && (
                                                      <td className="tr-table-class text-white text-center">
                                                        {formatValue(
                                                          recurringFooterTotals.hasPriceIncrease
                                                            ? recurringFooterTotals.finalNetTotal
                                                            : showRecurringDiscountLine
                                                              ? recurringFooterTotals.originalNetTotal
                                                              : recurringFooterTotals.finalNetTotal,
                                                        )}
                                                      </td>
                                                    )}

                                                    {showRecurringVat &&
                                                      visibleFieldsCustomTemp?.vatRate && (
                                                        <td />
                                                      )}

                                                    {showRecurringVat &&
                                                      visibleFieldsCustomTemp?.vat && (
                                                        <td className="tr-table-class text-white text-center">
                                                          {formatValue(
                                                            recurringFooterTotals.hasPriceIncrease
                                                              ? recurringFooterTotals.finalVatTotal
                                                              : showRecurringDiscountLine
                                                                ? recurringFooterTotals.originalVatTotal
                                                                : recurringFooterTotals.finalVatTotal,
                                                          )}
                                                        </td>
                                                      )}

                                                    {showRecurringVat &&
                                                      visibleFieldsCustomTemp?.feesIncVat && (
                                                        <td className="tr-table-class text-white text-center">
                                                          {formatValue(
                                                            recurringFooterTotals.hasPriceIncrease
                                                              ? recurringFooterTotals.grandTotalIncludingVat
                                                              : showRecurringDiscountLine
                                                                ? recurringFooterTotals.originalTotalIncludingVat
                                                                : recurringFooterTotals.grandTotalIncludingVat,
                                                          )}
                                                        </td>
                                                      )}
                                                  </tr>

                                                  {/* === DISCOUNT ROW === */}
                                                  {showRecurringDiscountLine && (
                                                    <tr className="head-grey-row">
                                                      {renderRecurringFooterLabel(
                                                        "Discount",
                                                        "tr-table-class font-14 text-white",
                                                      )}

                                                      {visibleFieldsCustomTemp?.fees && (
                                                        <td className="tr-table-class font-14 text-white text-center">
                                                          (-){" "}
                                                          {formatValue(
                                                            recurringFooterTotals.discountAmount,
                                                          )}
                                                        </td>
                                                      )}

                                                      {showRecurringVat &&
                                                        visibleFieldsCustomTemp?.vatRate && (
                                                          <td />
                                                        )}

                                                      {showRecurringVat &&
                                                        visibleFieldsCustomTemp?.vat && (
                                                          <td className="tr-table-class font-14 text-white text-center">
                                                            (-){" "}
                                                            {formatValue(
                                                              recurringFooterTotals.vatDiscount,
                                                            )}
                                                          </td>
                                                        )}

                                                      {showRecurringVat &&
                                                        visibleFieldsCustomTemp?.feesIncVat && (
                                                          <td className="tr-table-class font-14 text-white text-center">
                                                            (-){" "}
                                                            {formatValue(
                                                              recurringFooterTotals.discountIncludingVat,
                                                            )}
                                                          </td>
                                                        )}
                                                    </tr>
                                                  )}

                                                  {/* === GRAND TOTAL ROW === */}
                                                  {showRecurringDiscountLine && (
                                                    <tr className="head-row">
                                                      {renderRecurringFooterLabel(
                                                        "Grand Total",
                                                        "tr-table-class font-14 text-white",
                                                      )}

                                                      {visibleFieldsCustomTemp?.fees && (
                                                        <td className="tr-table-class font-14 text-white text-center">
                                                          {formatValue(
                                                            recurringFooterTotals.finalNetTotal,
                                                          )}
                                                        </td>
                                                      )}

                                                      {showRecurringVat &&
                                                        visibleFieldsCustomTemp?.vatRate && (
                                                          <td />
                                                        )}

                                                      {showRecurringVat &&
                                                        visibleFieldsCustomTemp?.vat && (
                                                          <td className="tr-table-class font-14 text-white text-center">
                                                            {formatValue(
                                                              recurringFooterTotals.finalVatTotal,
                                                            )}
                                                          </td>
                                                        )}

                                                      {showRecurringVat &&
                                                        visibleFieldsCustomTemp?.feesIncVat && (
                                                          <td className="tr-table-class font-14 text-white text-center">
                                                            {formatValue(
                                                              recurringFooterTotals.grandTotalIncludingVat,
                                                            )}
                                                          </td>
                                                        )}
                                                    </tr>
                                                  )}
                                                </tbody>
                                              </table>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {selectedOneOffServiceList?.length !== 0 && (
                                  <div className="tab-content">
                                    <div className="tab-pane p-3 active">
                                      <div className="row">
                                        <div className="col-lg-12">
                                          <div className="separator mb-2"></div>
                                          <h6>One-Off Services</h6>
                                          <div className="separator mb-3"></div>
                                          {ProposalObject.quoteTypeID !== 4 && (
                                            <>
                                              <div className="row fieldset">
                                                <div className="col-md-2 col-sm-12  text-md-end">
                                                  <label className="fieldset-label">
                                                    Original Price (
                                                    {getCurrencySymbol(
                                                      ProposalObject.currencyID,
                                                    )}
                                                    )
                                                  </label>
                                                </div>
                                                <div className="col-md-10 col-sm-12">
                                                  <input
                                                    readonly=""
                                                    type="text"
                                                    class="input-text"
                                                    value={
                                                      Number(
                                                        Math.floor(
                                                          OneOffPricingInfo.OriginalPrice *
                                                            100,
                                                        ) / 100,
                                                      )
                                                        .toFixed(2)
                                                        .replace(
                                                          /\B(?=(\d{3})+(?!\d))/g,
                                                          ",",
                                                        )

                                                      // formatValue(
                                                      //   OneOffPricingInfo.OriginalPrice
                                                      // )
                                                      //   OneOffPricingInfo.OriginalPrice.toString().replace(
                                                      //   /\B(?=(\d{3})+(?!\d))/g,
                                                      //   ","
                                                      // )
                                                    }
                                                  />
                                                </div>
                                              </div>
                                              <div
                                                class="row"
                                                id="OneOff_Default"
                                              >
                                                <div class="col-lg-2 mb-1 col-md-2 col-sm-12 mt-2 text-md-end">
                                                  <div class="mb-1 text-md-end">
                                                    <label class="form-label">
                                                      Discount (%)
                                                    </label>
                                                  </div>
                                                </div>
                                                <div class="col-lg-4 col-md-4 col-sm-12">
                                                  <input
                                                    readonly=""
                                                    class="input-text"
                                                    type="text"
                                                    placeholder="Discount (%)"
                                                    value={
                                                      Number(
                                                        Math.floor(
                                                          OneOffPricingInfo.DefaultDiscount *
                                                            100,
                                                        ) / 100,
                                                      )
                                                        .toFixed(2)
                                                        .replace(
                                                          /\B(?=(\d{3})+(?!\d))/g,
                                                          ",",
                                                        )

                                                      // OneOffPricingInfo.DefaultDiscount
                                                    }
                                                  />
                                                </div>
                                                <div
                                                  style={{ padding: "0px" }}
                                                  class="col-lg-2 col-md-2 mt-2 col-sm-12"
                                                >
                                                  <div class="mb-1  text-md-end">
                                                    <label class="form-label">
                                                      Discounted Price (
                                                      {getCurrencySymbol(
                                                        ProposalObject.currencyID,
                                                      )}
                                                      )
                                                    </label>
                                                  </div>
                                                </div>
                                                <div class="col-lg-4 col-md-4 col-sm-12">
                                                  <input
                                                    readonly=""
                                                    class="input-text"
                                                    type="text"
                                                    placeholder={`Discounted Price (${getCurrencySymbol(
                                                      ProposalObject.currencyID,
                                                    )})`}
                                                    value={
                                                      Number(
                                                        Math.floor(
                                                          OneOffPricingInfo.DiscountedPrice *
                                                            100,
                                                        ) / 100,
                                                      )
                                                        .toFixed(2)
                                                        .replace(
                                                          /\B(?=(\d{3})+(?!\d))/g,
                                                          ",",
                                                        )

                                                      //     formatValue(
                                                      //   OneOffPricingInfo.DiscountedPrice
                                                      // )
                                                    }
                                                  />
                                                </div>
                                              </div>
                                            </>
                                          )}
                                          <div className="mb-3"></div>
                                          {pricingTableColumnIDs === null ||
                                          pricingTableColumnIDs === "" ||
                                          pricingTableColumnIDs ===
                                            undefined ? (
                                            <div
                                              style={{ marginTop: "0px" }}
                                              className="table-responsive"
                                            >
                                              <table className="table align-middle table-nowrap">
                                                <thead className="table-light table-header-font">
                                                  <tr className="head-row">
                                                    <th className="tr-table-class text-white">
                                                      Services
                                                    </th>
                                                    {ProposalObject.quoteTypeID !==
                                                      4 && (
                                                      <th className="tr-table-class text-white text-right">
                                                        Fees (
                                                        {getCurrencySymbol(
                                                          ProposalObject.currencyID,
                                                        )}
                                                        )
                                                      </th>
                                                    )}
                                                  </tr>
                                                </thead>
                                                <tbody>
                                                  {selectedOneOffServiceList.map(
                                                    (service, index) => {
                                                      return (
                                                        <>
                                                          <tr class="a-la-carte-services-review-head-row">
                                                            <th colspan="2">
                                                              {
                                                                service.serviceCatName
                                                              }
                                                            </th>
                                                          </tr>
                                                          {service.servicesList.map(
                                                            (
                                                              subService,
                                                              subIndex,
                                                            ) => {
                                                              return (
                                                                <tr
                                                                  key={subIndex}
                                                                >
                                                                  {/* */}
                                                                  <td>
                                                                    <div>
                                                                      {
                                                                        subService.serviceName
                                                                      }
                                                                    </div>
                                                                    <div class="package-variables"></div>
                                                                  </td>
                                                                  {ProposalObject.quoteTypeID !==
                                                                    4 && (
                                                                    <td className="text-right">
                                                                      {ProposalObject.feeTypeId ===
                                                                        1 && (
                                                                        <>
                                                                          {" "}
                                                                          {
                                                                            currencySymbol
                                                                          }
                                                                          {formatValue(
                                                                            subService.quotationPrice,
                                                                          )}
                                                                        </>
                                                                      )}
                                                                      {ProposalObject.feeTypeId ===
                                                                        2 && (
                                                                        <span className="fa fa-check"></span>
                                                                      )}
                                                                    </td>
                                                                  )}
                                                                </tr>
                                                              );
                                                            },
                                                          )}
                                                        </>
                                                      );
                                                    },
                                                  )}
                                                  {ProposalObject.quoteTypeID !==
                                                    4 && (
                                                    <tr className="head-row">
                                                      <td className="tr-table-class text-white">
                                                        Net Total
                                                      </td>
                                                      <td className="tr-table-class text-white text-right">
                                                        {" "}
                                                        {currencySymbol}
                                                        {
                                                          Number(
                                                            OneOffPricingInfo.OriginalPrice,
                                                          ) <
                                                            Number(
                                                              OneOffPricingInfo.DiscountedPrice,
                                                            ) ||
                                                          (Number(
                                                            OneOffPricingInfo.Discount,
                                                          ) > 0 &&
                                                            !ProposalObject.DiscountLines)
                                                            ? formatValue(
                                                                OneOffPricingInfo.DiscountedPrice,
                                                              )
                                                            : // Number(OneOffPricingInfo.DiscountedPrice)
                                                              //     .toFixed(2)
                                                              //     .toString()
                                                              //     .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                                                              formatValue(
                                                                OneOffPricingInfo.OriginalPrice,
                                                              )
                                                          //  Number(OneOffPricingInfo.OriginalPrice)
                                                          //     .toFixed(2)
                                                          //     .toString()
                                                          //     .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                                                        }
                                                      </td>
                                                    </tr>
                                                  )}
                                                  {Number(
                                                    OneOffPricingInfo.Discount,
                                                  ) > 0 &&
                                                    ProposalObject.DiscountLines && (
                                                      <>
                                                        {" "}
                                                        <tr class="head-grey-row">
                                                          <td className="tr-table-class text-white">
                                                            Discount
                                                          </td>
                                                          <td className="tr-table-class text-white text-right">
                                                            (-) {currencySymbol}
                                                            {formatValue(
                                                              OneOffPricingInfo.Discount,
                                                            )}
                                                            {/* {OneOffPricingInfo.Discount.toFixed(2)
                                  .toString()
                                  .replace(/\B(?=(\d{3})+(?!\d))/g, ",")} */}
                                                          </td>
                                                        </tr>
                                                        <tr class="head-row">
                                                          <td className="tr-table-class text-white">
                                                            Discounted Total
                                                          </td>
                                                          <td className="tr-table-class text-white text-right">
                                                            {currencySymbol}{" "}
                                                            {formatValue(
                                                              OneOffPricingInfo.DiscountedTotal,
                                                            )}
                                                            {/* {Number(OneOffPricingInfo.DiscountedTotal)
                                  .toFixed(2)
                                  .toString()
                                  .replace(/\B(?=(\d{3})+(?!\d))/g, ",")} */}
                                                          </td>
                                                        </tr>
                                                      </>
                                                    )}
                                                  {vatPercentage && (
                                                    <>
                                                      <tr class="head-grey-row">
                                                        <td className="tr-table-class text-white">
                                                          {getTaxName(
                                                            ProposalObject.currencyID,
                                                          )}
                                                        </td>
                                                        <td className="tr-table-class text-white text-right">
                                                          {" "}
                                                          {currencySymbol}
                                                          {
                                                            formatValue(
                                                              OneOffPricingInfo.VATPrice,
                                                            )
                                                            // Number(OneOffPricingInfo.VATPrice)
                                                            //   .toFixed(2)
                                                            //   .toString()
                                                            //   .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                                                          }
                                                        </td>
                                                      </tr>
                                                      <tr className="head-row">
                                                        <td className="tr-table-class text-white">
                                                          Grand Total
                                                        </td>
                                                        <td className="tr-table-class text-white text-right">
                                                          {" "}
                                                          {currencySymbol}
                                                          {
                                                            formatValue(
                                                              OneOffPricingInfo.GrandTotal,
                                                            )
                                                            // Number(OneOffPricingInfo.GrandTotal)
                                                            //   .toFixed(2)
                                                            //   .toString()
                                                            //   .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                                                          }
                                                        </td>
                                                      </tr>
                                                    </>
                                                  )}
                                                </tbody>
                                              </table>
                                            </div>
                                          ) : (
                                            <div
                                              style={{ marginTop: "0px" }}
                                              className="table-responsive"
                                            >
                                              <table className="table align-middle table-nowrap">
                                                <thead className="table-dark text-white">
                                                  <tr className="head-row">
                                                    {visibleFieldsCustomTemp?.serviceCategory && (
                                                      <th
                                                        className="tr-table-class text-white text-center"
                                                        style={{
                                                          width: "16.66%",
                                                        }}
                                                      >
                                                        Service Category
                                                      </th>
                                                    )}
                                                    {visibleFieldsCustomTemp.serviceName && (
                                                      <th
                                                        className="tr-table-class text-white text-center"
                                                        style={{
                                                          width: "16.66%",
                                                        }}
                                                      >
                                                        Services
                                                      </th>
                                                    )}
                                                    {visibleFieldsCustomTemp.serviceScope && (
                                                      <th
                                                        className="tr-table-class text-white text-center"
                                                        style={{
                                                          width: "16.66%",
                                                        }}
                                                      >
                                                        Service scope
                                                      </th>
                                                    )}

                                                    {/* <th
                                className="tr-table-class text-white text-center"
                                style={{ width: "16.66%" }}
                                >
                                Scope value
                                </th> */}
                                                    {visibleFieldsCustomTemp.fees && (
                                                      <th
                                                        className="tr-table-class text-white text-center"
                                                        style={{
                                                          width: "16.66%",
                                                        }}
                                                      >
                                                        Fees (£)
                                                      </th>
                                                    )}
                                                    {visibleFieldsCustomTemp.vatRate && (
                                                      <th
                                                        className="tr-table-class text-white text-center"
                                                        style={{
                                                          width: "16.66%",
                                                        }}
                                                      >
                                                        VAT Rate
                                                      </th>
                                                    )}
                                                    {visibleFieldsCustomTemp.vat && (
                                                      <th
                                                        className="tr-table-class text-white text-center"
                                                        style={{
                                                          width: "16.66%",
                                                        }}
                                                      >
                                                        VAT (£)
                                                      </th>
                                                    )}
                                                    {visibleFieldsCustomTemp.feesIncVat && (
                                                      <th
                                                        className="tr-table-class text-white text-center"
                                                        style={{
                                                          width: "16.66%",
                                                        }}
                                                      >
                                                        Fees inc VAT (£)
                                                      </th>
                                                    )}
                                                  </tr>
                                                </thead>

                                                <tbody>
                                                  {selectedOneOffServiceList.map(
                                                    (
                                                      serviceCategory,
                                                      categoryIndex,
                                                    ) => (
                                                      <React.Fragment
                                                        key={
                                                          serviceCategory.serviceCatID ||
                                                          `one-off-category-${categoryIndex}`
                                                        }
                                                      >
                                                        {(
                                                          serviceCategory.servicesList ||
                                                          []
                                                        ).map(
                                                          (
                                                            subService,
                                                            subIndex,
                                                          ) => {
                                                            const {
                                                              price,
                                                              vatRate,
                                                              vatAmount,
                                                              feesIncludingVat,
                                                            } =
                                                              calculateOneOffServiceRow(
                                                                {
                                                                  service:
                                                                    subService,
                                                                  fallbackVatRate:
                                                                    oneOffFallbackVatRate,
                                                                },
                                                              );

                                                            const driverList =
                                                              Array.isArray(
                                                                subService?.pricingDriverList,
                                                              )
                                                                ? subService.pricingDriverList
                                                                : [];

                                                            return (
                                                              <tr
                                                                key={
                                                                  subService.serviceID ||
                                                                  `one-off-service-${categoryIndex}-${subIndex}`
                                                                }
                                                              >
                                                                {visibleFieldsCustomTemp?.serviceCategory && (
                                                                  <td className="text-center">
                                                                    {serviceCategory.serviceCatName ||
                                                                      "-"}
                                                                  </td>
                                                                )}

                                                                {visibleFieldsCustomTemp?.serviceName && (
                                                                  <td className="text-center">
                                                                    {subService.serviceName ||
                                                                      "-"}
                                                                  </td>
                                                                )}

                                                                {visibleFieldsCustomTemp?.serviceScope && (
                                                                  <td className="text-center">
                                                                    {driverList.length >
                                                                    0
                                                                      ? driverList.map(
                                                                          (
                                                                            driver,
                                                                            driverIndex,
                                                                          ) => (
                                                                            <div
                                                                              key={
                                                                                driver.driverID ||
                                                                                `one-off-driver-${driverIndex}`
                                                                              }
                                                                            >
                                                                              {
                                                                                driver.driverName
                                                                              }{" "}
                                                                              ={" "}
                                                                              {
                                                                                driver.driverValue
                                                                              }
                                                                            </div>
                                                                          ),
                                                                        )
                                                                      : "-"}
                                                                  </td>
                                                                )}

                                                                {visibleFieldsCustomTemp?.fees && (
                                                                  <td className="text-center">
                                                                    {showOneOffFullBreakdown &&
                                                                      formatValue(
                                                                        price,
                                                                      )}

                                                                    {showOneOffCheckMark && (
                                                                      <span
                                                                        className="fa fa-check"
                                                                        aria-label="Included"
                                                                      />
                                                                    )}
                                                                  </td>
                                                                )}

                                                                {showOneOffVat &&
                                                                  visibleFieldsCustomTemp?.vatRate && (
                                                                    <td className="text-center">
                                                                      {vatRate}%
                                                                    </td>
                                                                  )}

                                                                {showOneOffVat &&
                                                                  visibleFieldsCustomTemp?.vat && (
                                                                    <td className="text-center">
                                                                      {showOneOffFullBreakdown &&
                                                                        formatValue(
                                                                          vatAmount,
                                                                        )}

                                                                      {showOneOffCheckMark && (
                                                                        <span
                                                                          className="fa fa-check"
                                                                          aria-label="Included"
                                                                        />
                                                                      )}
                                                                    </td>
                                                                  )}

                                                                {showOneOffVat &&
                                                                  visibleFieldsCustomTemp?.feesIncVat && (
                                                                    <td className="text-center">
                                                                      {showOneOffFullBreakdown &&
                                                                        formatValue(
                                                                          feesIncludingVat,
                                                                        )}

                                                                      {showOneOffCheckMark && (
                                                                        <span
                                                                          className="fa fa-check"
                                                                          aria-label="Included"
                                                                        />
                                                                      )}
                                                                    </td>
                                                                  )}
                                                              </tr>
                                                            );
                                                          },
                                                        )}
                                                      </React.Fragment>
                                                    ),
                                                  )}

                                                  {/* === NET TOTAL ROW === */}
                                                  <tr className="head-row">
                                                    {renderOneOffFooterLabel(
                                                      "Net Total",
                                                    )}

                                                    {visibleFieldsCustomTemp?.fees && (
                                                      <td className="tr-table-class text-white text-center">
                                                        {formatValue(
                                                          oneOffFooterTotals.hasPriceIncrease
                                                            ? oneOffFooterTotals.finalNetTotal
                                                            : showOneOffDiscountLine
                                                              ? oneOffFooterTotals.originalNetTotal
                                                              : oneOffFooterTotals.finalNetTotal,
                                                        )}
                                                      </td>
                                                    )}

                                                    {showOneOffVat &&
                                                      visibleFieldsCustomTemp?.vatRate && (
                                                        <td />
                                                      )}

                                                    {showOneOffVat &&
                                                      visibleFieldsCustomTemp?.vat && (
                                                        <td className="tr-table-class text-white text-center">
                                                          {formatValue(
                                                            oneOffFooterTotals.hasPriceIncrease
                                                              ? oneOffFooterTotals.finalVatTotal
                                                              : showOneOffDiscountLine
                                                                ? oneOffFooterTotals.originalVatTotal
                                                                : oneOffFooterTotals.finalVatTotal,
                                                          )}
                                                        </td>
                                                      )}

                                                    {showOneOffVat &&
                                                      visibleFieldsCustomTemp?.feesIncVat && (
                                                        <td className="tr-table-class text-white text-center">
                                                          {formatValue(
                                                            oneOffFooterTotals.hasPriceIncrease
                                                              ? oneOffFooterTotals.grandTotalIncludingVat
                                                              : showOneOffDiscountLine
                                                                ? oneOffFooterTotals.originalFeesIncludingVat
                                                                : oneOffFooterTotals.grandTotalIncludingVat,
                                                          )}
                                                        </td>
                                                      )}
                                                  </tr>

                                                  {/* === DISCOUNT ROW === */}
                                                  {showOneOffDiscountLine && (
                                                    <tr className="head-grey-row">
                                                      {renderOneOffFooterLabel(
                                                        "Discount",
                                                        "tr-table-class font-14 text-white",
                                                      )}

                                                      {visibleFieldsCustomTemp?.fees && (
                                                        <td className="tr-table-class font-14 text-white text-center">
                                                          (-){" "}
                                                          {formatValue(
                                                            oneOffFooterTotals.discountAmount,
                                                          )}
                                                        </td>
                                                      )}

                                                      {showOneOffVat &&
                                                        visibleFieldsCustomTemp?.vatRate && (
                                                          <td />
                                                        )}

                                                      {showOneOffVat &&
                                                        visibleFieldsCustomTemp?.vat && (
                                                          <td className="tr-table-class font-14 text-white text-center">
                                                            (-){" "}
                                                            {formatValue(
                                                              oneOffFooterTotals.vatDiscount,
                                                            )}
                                                          </td>
                                                        )}

                                                      {showOneOffVat &&
                                                        visibleFieldsCustomTemp?.feesIncVat && (
                                                          <td className="tr-table-class font-14 text-white text-center">
                                                            (-){" "}
                                                            {formatValue(
                                                              oneOffFooterTotals.discountIncludingVat,
                                                            )}
                                                          </td>
                                                        )}
                                                    </tr>
                                                  )}

                                                  {/* === GRAND TOTAL ROW === */}
                                                  {showOneOffDiscountLine && (
                                                    <tr className="head-row">
                                                      {renderOneOffFooterLabel(
                                                        "Grand Total",
                                                        "tr-table-class font-14 text-white",
                                                      )}

                                                      {visibleFieldsCustomTemp?.fees && (
                                                        <td className="tr-table-class font-14 text-white text-center">
                                                          {formatValue(
                                                            oneOffFooterTotals.finalNetTotal,
                                                          )}
                                                        </td>
                                                      )}

                                                      {showOneOffVat &&
                                                        visibleFieldsCustomTemp?.vatRate && (
                                                          <td />
                                                        )}

                                                      {showOneOffVat &&
                                                        visibleFieldsCustomTemp?.vat && (
                                                          <td className="tr-table-class font-14 text-white text-center">
                                                            {formatValue(
                                                              oneOffFooterTotals.finalVatTotal,
                                                            )}
                                                          </td>
                                                        )}

                                                      {showOneOffVat &&
                                                        visibleFieldsCustomTemp?.feesIncVat && (
                                                          <td className="tr-table-class font-14 text-white text-center">
                                                            {formatValue(
                                                              oneOffFooterTotals.grandTotalIncludingVat,
                                                            )}
                                                          </td>
                                                        )}
                                                    </tr>
                                                  )}
                                                </tbody>
                                              </table>
                                              {/* <div
                        dangerouslySetInnerHTML={{
                          __html: currentPricingTableDesignRecurring,
                        }}
                      /> */}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                          <div
                            className="tab-pane fade"
                            id="service_description"
                            role="tabpanel"
                          >
                            <div className="shadow-sm border-0">
                              <div
                                className="card-body"
                                dangerouslySetInnerHTML={{
                                  __html: serviceDescriptionHTML
                                    ? serviceDescriptionHTML
                                    : serviceDescriptionHtmlGenerated,
                                }}
                              />
                            </div>
                          </div>

                          <div
                            className="tab-pane fade"
                            id="sof"
                            role="tabpanel"
                          >
                            <div className="shadow-sm border-0">
                              <div
                                className="card-body"
                                dangerouslySetInnerHTML={{
                                  __html: statementOfFactsHTML,
                                }}
                              />
                            </div>
                          </div>
                          <div class="tab-pane" id="Officer" role="tabpanel">
                            <div
                              class="tab-pane active"
                              id="Officer"
                              role="tabpanel"
                            >
                              <table className="table table-striped fs-13 view-details-table">
                                <tbody>
                                  {officersForm.map((prospect, index) => (
                                    <React.Fragment key={index}>
                                      <tr>
                                        <th colspan="2">Officer {index + 1}</th>
                                      </tr>

                                      <tr>
                                        {(ProposalObject.clientMasterBusinessTypeID ===
                                          3 ||
                                          ProposalObject.clientMasterBusinessTypeID ===
                                            4 ||
                                          ProposalObject.clientMasterBusinessTypeID ===
                                            5) && (
                                          <>
                                            <td>Authorised </td>
                                            <td className="text-end">
                                              {officersForm[index]
                                                ?.isAuthorisedSignatory
                                                ? "Yes"
                                                : "NO"}
                                              <Switch
                                                checked={
                                                  officersForm[index]
                                                    ?.isAuthorisedSignatory
                                                }
                                                disabled
                                                color="primary"
                                              />
                                            </td>
                                          </>
                                        )}
                                      </tr>

                                      <tr>
                                        <td>First Name</td>
                                        <td className="text-end">
                                          {officersForm[index].firstName}
                                        </td>
                                      </tr>

                                      <tr>
                                        <td>Last Name</td>
                                        <td className="text-end">
                                          {officersForm[index].lastName}
                                        </td>
                                      </tr>

                                      <tr>
                                        <td>Phone</td>
                                        <td className="text-end">
                                          {officersForm[index].phoneNo}
                                        </td>
                                      </tr>

                                      <tr>
                                        <td>Email</td>
                                        <td className="text-end">
                                          {officersForm[index].emailID}
                                        </td>
                                      </tr>

                                      <>
                                        {" "}
                                        <tr>
                                          <td>Role</td>
                                          <td className="text-end">
                                            {officersForm[index].officerRole}
                                          </td>
                                        </tr>
                                        <tr>
                                          <td>Appointed On</td>
                                          <td className="text-end">
                                            {officersForm[index].appointedOn}
                                          </td>
                                        </tr>
                                      </>

                                      {/* <tr>
                                          {(basicInfo.originalBusinessTypeID ===
                                            CLIENT_TYPES.Sole_Trader ||
                                            basicInfo.originalBusinessTypeID ===
                                              CLIENT_TYPES.Other ||
                                            basicInfo.originalBusinessTypeID ===
                                              CLIENT_TYPES.Partnership) && (
                                            <td>Residential Address</td>
                                          )}
                                          {(basicInfo.originalBusinessTypeID ===
                                            CLIENT_TYPES.Company ||
                                            basicInfo.originalBusinessTypeID ===
                                              CLIENT_TYPES.LLP) && (
                                            <td>Correspondence Address</td>
                                          )}

                                          <td className="text-right">
                                            {
                                              concatenatedResidentialAddress[
                                                index
                                              ]?.officersFullAddress
                                            }
                                          </td>
                                        </tr> */}
                                      <tr>
                                        <td
                                          class="break-table"
                                          colspan="2"
                                        ></td>
                                      </tr>
                                    </React.Fragment>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* end card  */}
                </div>
              </div>
              {/* end col */}
            </div>
            {/* end col  */}
          </div>
          {/* end row */}

          {/* end modal  */}
        </div>
        {/* container-fluid  */}

        {/* End Page-content */}

        <Footer />

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
    </div>
  );
};

export default View_Proposals;
