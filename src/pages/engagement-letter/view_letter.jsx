/* global $ */
import React, { useContext, useEffect, useState } from "react";
import CommonButtonComponent from "../../components/CommonButtonComponent";
import { useLocation, useNavigate } from "react-router-dom";
import Tooltip from "@mui/material/Tooltip";
import "./Engagement_Letter.css";
import Select from "react-select";
import { AuthContextProvider } from "../../AuthContext/AuthContext";
import Footer from "../../components/Footer";
import { GetContractDetailsModel } from "../../redux/Services/EngagementLetter/EngagementLetterApi";
import axios from "axios";
import Switch from "@mui/material/Switch";
import { useSelector } from "react-redux";
import Utils from "../../Middleware/Utils";
import { fieldToIdMap, statusID } from "../../Middleware/enums";
import { Base_Url } from "../../Base-Url/Base_Url";
import ConfirmModel from "../../components/ConfirmationBox";
import { ERROR_MESSAGES } from "../../components/GlobalMessage";
import { UploadManuallySignedContract } from "../../redux/Services/Setting/Organisation";
import SuccessModal from "../../components/SuccessModal";
import ErrorModel from "../../components/ErrorModel";
import { SendEmailsToManuallySignedContract } from "../../redux/Services/SignEasy";

const View_Engagement_Latter = () => {
  const common = useSelector((state) => state.Storage);
  const [modelRequestData, setModelRequestData] = useState({
    ModuleName: null,
    ProposalId: null,
    keyID: null,
    SearchKeyword: "",
    status: null,
    Action: "",
    fileName: null,
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
  const [packageList, setPackageList] = useState([]);
  const [openErrorModal, setOpenErrorModal] = React.useState(false);

  const [openSuccessModal, setOpenSuccessModal] = React.useState(false);
  const [finalContractAmountList, setFinalQuotationAmountList] = useState([]);
  const [serviceDescriptionHTML, setServiceDescriptionHTML] = useState(null);
  const [statementOfFactsHTML, setStatementOfFactsHTML] = useState(null);

  const [contractSignatoriesList, setContractSignatoriesList] = useState([]);
  const [EngagementObj, setEngagementObj] = useState({
    sourceName: null,
    contractKeyID: null,
    contractName: null,
    quoteKeyID: null,
    clientName: null,
    templateName: null,
    Payment_Frequency: null,
    currencyID: null,
    feeTypeId: null,
    feesInQuoteName: null,
    DiscountLines: null,
    paymentFrequencyName: null,
    paymentGatewayID: null,
    recurringOriginalPrice: null,
    recurringDiscountedPrice: null,
    recurringDiscountPercentage: null,
    oneOffOriginalPrice: null,
    oneOffDiscountedPrice: null,
    oneOffDiscountPercentage: null,
    declinedReason: null,
    contractName: null,
    statusID: null,
    manuallySignedContractDocUrl: null,
    clientMasterBusinessTypeID: null,
    draftOn: null,
    sentOn: null,
    signedOn: null,
    VoidOn: null,
    isSigned: null,
    contractName: null,
  });
  const [selectedRecurringServiceList, setSelectedRecurringServiceList] =
    useState([]);
  const [selectedOneOffServiceList, setSelectedOneOffServiceList] = useState(
    [],
  );
  const [selectedFile, setSelectedFile] = useState({
    fileName: null,
    size: null,
  });
  const [pdfUrl, setPdfUrl] = useState(null);
  const [isUpload, setISUpload] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [requireErrorMessage, setRequireErrorMessage] = useState(false);
  const {
    setTopbar,
    EngagementName,
    setLoader,
    prospectName,
    formatValue,
    proposalName,
    isMobile,
    getTaxName,
    getCurrencySymbol,
  } = useContext(AuthContextProvider);
  const navigate = useNavigate();
  const location = useLocation();
  const [OneOffPricingInfo, setOneOffPricingInfo] = useState({
    OriginalPrice: 0,
    DefaultDiscount: 0.0,
    DiscountedPrice: "",
    MaxDiscount: 0,
    servicePackageName: null,
    MinPrice: "",
    NetTotal: 0,
    VATPrice: null,
    GrandTotal: null,
    Services: null,
    ServicePrice: 0,
    Discount: 0,
    DiscountedTotal: 0,
  });

  const [RecurringPricingInfo, setRecurringPricingInfo] = useState({
    OriginalPrice: 0,
    DefaultDiscount: 0.0,
    DiscountedPrice: "",
    MaxDiscount: 0,
    VATPrice: null,
    servicePackageName: null,
    MinPrice: "",
    NetTotal: 0,
    Services: null,
    ServicePrice: 0,
    Discount: 0,
    GrandTotal: null,
    DiscountedTotal: 0,
  });
  const [vatPercentage, setVATPercentage] = useState("");
  const handleBack = () => {
    navigate("/engagement-letters");
  };

  // const draftOn = location.state.draftOn;
  // const sentOn = location.state.sentOn;
  // const signedOn = location.state.SignedOn;
  // const VoidOn = location.state.voidOn;
  const isSignedStatus = location.state.isSigned;

  const [pricingTableColumnIDs, setPricingTableColumnIDs] = useState("");
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

  useEffect(() => {
    if (location.state?.contractKeyID !== null) {
      GetContractDetailsModelData(location.state?.contractKeyID);
    }
  }, [location.state]);

  useEffect(() => {
    setTopbar("block");
  }, []);

  const GetContractDetailsModelData = async (id) => {
    if (!id) {
      return;
    }

    try {
      const data = await GetContractDetailsModel(id);
      if (data?.data?.statusCode === 200) {
        if (data?.data?.responseData?.data) {
          const ModelData = data?.data?.responseData?.data;
          const packageData = data?.data?.responseData?.packageList;
          const finalContractAmountList =
            data?.data?.responseData?.finalContractAmountList;
          const contractSignatoriesList =
            data?.data?.responseData?.contractSignatoriesList;
          const clientOfficersList =
            data?.data?.responseData.clientOfficersList;

          setServiceDescriptionHTML(ModelData.serviceDescription);
          setStatementOfFactsHTML(ModelData.statementOfFacts);
          setPricingTableColumnIDs(ModelData?.pricingTableColumnIDs);
          updateVisibleFieldsFromIds(ModelData?.pricingTableColumnIDs);

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

          setEngagementObj({
            ...EngagementObj,
            contractKeyID: id,
            contractName: ModelData.contractName,
            sourceName: ModelData.sourceName,
            contractName: ModelData.contractName,
            currencyID: ModelData.currencyID,
            draftOn: ModelData.createdOn,
            sentOn: ModelData.sentOn,
            signedOn: ModelData.signedOn,
            VoidOn: ModelData.lastUpdatedOn,
            quoteKeyID: ModelData.quoteKeyID,
            clientName: ModelData.clientName,
            templateName: ModelData.templateName,
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
            declinedReason: ModelData.declinedReason,
            statusID: ModelData.statusID,
            manuallySignedContractDocUrl:
              ModelData.manuallySignedContractDocUrl,
            clientMasterBusinessTypeID: ModelData.clientMasterBusinessTypeID,
          });

          const RecurringDetails = finalContractAmountList.find(
            (obj) => obj.serviceChargeTypeID === 1,
          );
          const OneOffDetails = finalContractAmountList.find(
            (obj) => obj.serviceChargeTypeID === 2,
          );
          if (
            RecurringDetails !== undefined &&
            RecurringDetails?.length !== 0
          ) {
            setVATPercentage(RecurringDetails?.vatPercentage);
          } else {
            setVATPercentage(OneOffDetails?.vatPercentage);
          }
          if (
            RecurringDetails !== undefined &&
            RecurringDetails?.servicePackageID !== null
          ) {
            setRecurringPricingInfo({
              ...RecurringPricingInfo,
              OriginalPrice: RecurringDetails?.netTotal,
              DefaultDiscount: Number(
                RecurringDetails.discountPercentageWithAllDecimal,
              ).toFixed(2),
              DiscountedPrice: RecurringDetails?.discountedTotal,
              Discount: RecurringDetails?.discounted,
              DiscountedTotal: RecurringDetails?.discountedTotal,
              VATPrice: RecurringDetails?.vat,
              GrandTotal: RecurringDetails?.grandTotal,
            });
          } else if (RecurringDetails !== undefined) {
            setRecurringPricingInfo({
              ...RecurringPricingInfo,
              OriginalPrice: RecurringDetails?.netTotal,
              DefaultDiscount: Number(
                ModelData.recurringDiscountPercentage_WithAllDecimal,
              ).toFixed(2),
              DiscountedPrice: RecurringDetails?.discountedTotal,
              Discount: RecurringDetails?.discounted,
              DiscountedTotal: RecurringDetails?.discountedTotal,
              VATPrice: RecurringDetails?.vat,
              GrandTotal: RecurringDetails?.grandTotal,
            });
          }
          if (
            OneOffDetails !== undefined &&
            OneOffDetails?.servicePackageID !== null
          ) {
            setOneOffPricingInfo({
              ...OneOffPricingInfo,
              OriginalPrice: OneOffDetails?.netTotal,
              DefaultDiscount: Number(
                OneOffDetails.discountPercentageWithAllDecimal,
              ).toFixed(2),
              DiscountedPrice: OneOffDetails?.discountedTotal,
              Discount: OneOffDetails?.discounted,
              DiscountedTotal: OneOffDetails?.discountedTotal,
              VATPrice: OneOffDetails?.vat,
              GrandTotal: OneOffDetails?.grandTotal,
            });
          } else if (OneOffDetails !== undefined) {
            setOneOffPricingInfo({
              ...OneOffPricingInfo,
              OriginalPrice: OneOffDetails?.netTotal,
              DefaultDiscount: Number(
                ModelData.oneOffDiscountPercentage_WithAllDecimal,
              ).toFixed(2),
              DiscountedPrice: OneOffDetails?.discountedTotal,
              Discount: OneOffDetails?.discounted,
              DiscountedTotal: OneOffDetails?.discountedTotal,
              VATPrice: OneOffDetails?.vat,
              GrandTotal: OneOffDetails?.grandTotal,
            });
          }

          setSelectedRecurringServiceList(ModelData.recurringServiceCatList);
          setSelectedOneOffServiceList(ModelData.oneOffServiceCatList);
          setPackageList(packageData);
          setFinalQuotationAmountList(finalContractAmountList);
          setContractSignatoriesList(contractSignatoriesList);
        }
      } else {
        // setErrorMessage(data?.data?.errorMessage);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleDownload = async (ContractKeyID) => {
    setLoader(true);

    if (
      EngagementObj.statusID !== statusID.Signed ||
      (EngagementObj.statusID === statusID.Signed &&
        EngagementObj.manuallySignedContractDocUrl !== null)
    ) {
      setModelRequestData({
        ...modelRequestData,
        ModuleName: "Contract",
        contractKeyID: location.state?.contractKeyID, // Change ClientKeyID to contractKeyID
        Action: "View",
      });
      let ViewPdfData = {
        ModuleName: "Contract",
        quoteKeyID: location.state?.contractKeyID,
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
          `${Base_Url}/SignEasy/DownloadDocumentAsZip?ContractKeyID=${location.state?.contractKeyID}`,
          options,
        );
        // const response = await DownloadDocumentAsZip(ContractKeyID);

        if (!response) {
          throw new Error("Failed to download PDF file");
        }
        // Convert the response to a blob
        const blob = await response.blob();
        // Create a temporary anchor element to trigger the download
        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        link.download = `${EngagementName}-${EngagementObj.contractName}.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setLoader(false);
      } catch (error) {
        setLoader(false);
        console.error("Error downloading PDF file:", error);
      }
    }
    setLoader(false);
  };

  const selectedFrequency = Utils.Payment_Frequency.find(
    (item) => EngagementObj.Payment_Frequency == item.value,
  );
  const feeTypeValue = Utils.feeInProposal.find(
    (item) => EngagementObj.feeTypeId == item.value,
  );
  const PaymentGatewayValue = Utils.payment_gateway.find(
    (item) => EngagementObj.paymentGatewayID == item.value,
  );
  const handleFileUpload = (e) => {
    e.preventDefault();
    setErrorMessage(""); // Clear any existing error message
    setRequireErrorMessage(false); // Clear any existing error message
    const file = e.target.files[0];
    // Check if a file is selected
    if (file) {
      // Check if the file size exceeds the limit (2MB)
      if (file.size > 10 * 1024 * 1024) {
        setErrorMessage("File size must be less than 10MB.");
        return; // Return without setting the pdfUrl state
      }
      setModelRequestData({
        ...modelRequestData,
        Action: "Upload",
        fileName: file,
      });
      setSelectedFile({
        fileName: file,
        size: file.size,
      });

      // File size is within the limit, create a URL for the file
      const url = URL.createObjectURL(file);
      setPdfUrl(url);

      // Update the selectedFile state
      setSelectedFile({
        fileName: file,
        size: file.size,
      });
    }
  };
  const confirmToUpload = () => {
    if (pdfUrl === null) {
      setRequireErrorMessage(true);
      return;
    }
    $("#" + "ConfirmModel").modal("show");
  };
  const UploadManuallySignedContractData = async () => {
    const file = new FormData();
    file.set("file", selectedFile.fileName); // Append the file itself
    setLoader(true);
    const data = await UploadManuallySignedContract(
      EngagementObj.contractKeyID,
      common.userKeyID,
      file,
    );
    if (data) {
      const response = await SendEmailsToManuallySignedContract(
        EngagementObj.contractKeyID,
        common.userKeyID,
      );
      if (response.data.statusCode === 200) {
        setOpenSuccessModal(true);
        setLoader(false);
        setISUpload(false);
        $("#" + "ConfirmModel").modal("hide");
        GetContractDetailsModelData(EngagementObj.contractKeyID);
      } else {
        setErrorMessage(response.data?.errorMessage);
        setOpenErrorModal(true);
      }
    } else {
      setOpenSuccessModal(true);
      setLoader(false);
      setISUpload(false);
      $("#" + "ConfirmModel").modal("hide");
    }
  };
  const handleClose = () => {
    setModelRequestData({
      clientKeyID: null,
      Action: "",
      clientName: null,
    });
    $("#" + "ConfirmModel").modal("hide");
    setOpenSuccessModal(false);
    setOpenErrorModal(false);
  };

  const handleCloseErrorModel = () => {
    $("#" + "ConfirmModel").modal("hide");
    setOpenSuccessModal(false);
    setOpenErrorModal(false);
  };
  const handlePdfDelete = () => {
    setPdfUrl(null);
    setSelectedFile({
      fileName: null,
      size: null,
    });
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

  const formatDateToDDMMYYYY = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleChangeFeesType = (e) => {
    const isRecurringDiscounted =
      Number(RecurringPricingInfo.DiscountedPrice) ===
      Number(RecurringPricingInfo.OriginalPrice);
    const isOneOffDiscounted =
      Number(OneOffPricingInfo.DiscountedPrice) ===
      Number(OneOffPricingInfo.OriginalPrice);

    const updatedEngagementObj = {
      ...EngagementObj,
      feeTypeId: e.value,
    };

    if (e.value == 2 && isRecurringDiscounted && isOneOffDiscounted) {
      updatedEngagementObj.DiscountLines = false;
    } else {
      updatedEngagementObj.DiscountLines = true;
    }

    setEngagementObj(updatedEngagementObj);
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

  const hasVatColumn = (vatValue) => {
    return Number(vatValue || 0) !== 0;
  };

  const showRecurringVat = hasVatColumn(vatPercentage);
  const showOneOffVat = hasVatColumn(vatPercentage);

  const hasValue = (value) =>
    value !== null && value !== undefined && value !== "";

  const toNumber = (value) => {
    const parsedValue = Number(value);
    return Number.isFinite(parsedValue) ? parsedValue : 0;
  };

  const roundCurrency = (value) =>
    Math.round((toNumber(value) + Number.EPSILON) * 100) / 100;

  const calculateEngagementRecurringServiceRow = ({
    service,
    fallbackVatRate = 0,
  }) => {
    const price = roundCurrency(service?.contractPrice);

    const hasServiceVatRate = hasValue(service?.vatPercentage);
    const vatRate = hasServiceVatRate
      ? toNumber(service?.vatPercentage)
      : toNumber(fallbackVatRate);

    /*
     * Prefer the service VAT amount returned by the API.
     * When it is null, calculate it using the service VAT rate or fallback rate.
     */
    const rawVatAmount = hasValue(service?.vatAmount)
      ? toNumber(service?.vatAmount)
      : (price * vatRate) / 100;

    const vatAmount = roundCurrency(rawVatAmount);
    const feesIncludingVat = roundCurrency(price + vatAmount);

    return {
      ...service,
      calculatedPrice: price,
      calculatedVatRate: vatRate,
      calculatedVatAmount: vatAmount,
      calculatedRawVatAmount: rawVatAmount,
      calculatedFeesIncludingVat: feesIncludingVat,
    };
  };

  const calculateEngagementRecurringFooterTotals = ({
    serviceCategories = [],
    finalAmount = {},
  }) => {
    const flattenedServices = serviceCategories.flatMap(
      (category) => category?.servicesList || [],
    );

    const calculatedRows = flattenedServices.map((service) =>
      calculateEngagementRecurringServiceRow({
        service,
        fallbackVatRate: finalAmount?.vatPercentage,
      }),
    );

    const calculatedNetTotal = roundCurrency(
      calculatedRows.reduce(
        (total, service) => total + service.calculatedPrice,
        0,
      ),
    );

    /*
     * Sum the displayed row VAT amounts so the footer always matches
     * the visible service rows, including service-wise VAT rounding.
     */
    const calculatedNetVat = roundCurrency(
      calculatedRows.reduce(
        (total, service) => total + service.calculatedVatAmount,
        0,
      ),
    );

    const netTotal = hasValue(finalAmount?.netTotal)
      ? roundCurrency(finalAmount.netTotal)
      : calculatedNetTotal;

    const discountedTotal = hasValue(finalAmount?.discountedTotal)
      ? roundCurrency(finalAmount.discountedTotal)
      : netTotal;

    const discount = hasValue(finalAmount?.discounted)
      ? roundCurrency(finalAmount.discounted)
      : roundCurrency(netTotal - discountedTotal);

    const netVAT = hasValue(finalAmount?.netVAT)
      ? roundCurrency(finalAmount.netVAT)
      : calculatedNetVat;

    const finalVAT = hasValue(finalAmount?.vat)
      ? roundCurrency(finalAmount.vat)
      : netVAT;

    const vatDiscount = hasValue(finalAmount?.vatDiscount)
      ? roundCurrency(finalAmount.vatDiscount)
      : roundCurrency(Math.max(0, netVAT - finalVAT));

    const netFeesIncVAT = hasValue(finalAmount?.netFeesIncVAT)
      ? roundCurrency(finalAmount.netFeesIncVAT)
      : roundCurrency(netTotal + netVAT);

    const grandTotal = hasValue(finalAmount?.grandTotal)
      ? roundCurrency(finalAmount.grandTotal)
      : roundCurrency(discountedTotal + finalVAT);

    const discountedFeesIncVAT = hasValue(finalAmount?.discountedFeesIncVAT)
      ? roundCurrency(finalAmount.discountedFeesIncVAT)
      : grandTotal;

    return {
      netTotal,
      discount,
      discountedTotal,
      netVAT,
      finalVAT,
      vatDiscount,
      netFeesIncVAT,
      discountedFeesIncVAT,
      grandTotal,
      discountIncludingVAT: roundCurrency(discount + vatDiscount),
      hasDiscount: discount > 0,
    };
  };

  /* -------------------- API RESPONSE MAPPING -------------------- */

  const recurringServiceCategories = Array.isArray(selectedRecurringServiceList)
    ? selectedRecurringServiceList
    : [];

  const recurringFinalAmount =
    finalContractAmountList?.find(
      (item) => Number(item?.serviceChargeTypeID) === 1,
    ) || {};

  const recurringRowsByCategory = recurringServiceCategories.map(
    (category) => ({
      ...category,
      servicesList: (category?.servicesList || []).map((service) =>
        calculateEngagementRecurringServiceRow({
          service,
          fallbackVatRate: recurringFinalAmount?.vatPercentage,
        }),
      ),
    }),
  );

  const recurringFooterTotals = calculateEngagementRecurringFooterTotals({
    serviceCategories: recurringServiceCategories,
    finalAmount: recurringFinalAmount,
  });

  const showRecurringDiscountLine =
    EngagementObj?.DiscountLines ?? Boolean(EngagementObj?.showDiscountLine);

  const recurringNetRowValues =
    recurringFooterTotals.hasDiscount && !showRecurringDiscountLine
      ? {
          fees: recurringFooterTotals.discountedTotal,
          vat: recurringFooterTotals.finalVAT,
          feesIncVAT: recurringFooterTotals.discountedFeesIncVAT,
        }
      : {
          fees: recurringFooterTotals.netTotal,
          vat: recurringFooterTotals.netVAT,
          feesIncVAT: recurringFooterTotals.netFeesIncVAT,
        };

  // One-off footer calculations, and the row calculations:

  const oneOffFinalAmount =
    finalContractAmountList?.find(
      (item) => Number(item.serviceChargeTypeID) === 2,
    ) || {};

  const calculateOneOffServiceRow = ({ service, fallbackVatRate = 0 }) => {
    const price = Number(service?.contractPrice || 0);

    const rawVatRate = service?.vatPercentage;

    // Keep service VAT 0 if explicitly provided
    const hasServiceVatRate =
      rawVatRate !== null && rawVatRate !== undefined && rawVatRate !== "";

    const vatRate = hasServiceVatRate
      ? Number(rawVatRate)
      : Number(fallbackVatRate);

    const vatAmount =
      service?.vatAmount !== null && service?.vatAmount !== undefined
        ? Number(service.vatAmount)
        : (price * vatRate) / 100;

    const feesIncludingVat = price + vatAmount;

    return {
      price,
      vatRate,
      vatAmount,
      feesIncludingVat,
    };
  };

  const calculateOneOffFooterTotals = ({
    serviceList = [],
    fallbackVatRate = 0,
    discountPercentage = 0,
  }) => {
    let netTotal = 0;
    let vatTotal = 0;

    serviceList.forEach((category) => {
      category.servicesList.forEach((service) => {
        const row = calculateOneOffServiceRow({
          service,
          fallbackVatRate,
        });

        netTotal += row.price;
        vatTotal += row.vatAmount;
      });
    });

    const discountAmount = (netTotal * Number(discountPercentage)) / 100;

    const discountedNet = netTotal - discountAmount;

    const discountedVat = (discountedNet * Number(fallbackVatRate)) / 100;

    return {
      netTotal,
      vatTotal,
      grossTotal: netTotal + vatTotal,

      discountAmount,

      discountedNet,
      discountedVat,

      grandTotal: discountedNet + discountedVat,
    };
  };

  const oneOffTotals = calculateOneOffFooterTotals({
    serviceList: selectedOneOffServiceList,
    fallbackVatRate: oneOffFinalAmount.vatPercentage,
    discountPercentage: OneOffPricingInfo.DiscountPercentage,
  });

  // const roundCurrency = (value) => Math.round((Number(value) || 0) * 100) / 100;

  const oneOffNetTotal = roundCurrency(oneOffTotals?.netTotal || 0);

  const oneOffVatTotal = roundCurrency(oneOffTotals?.vatTotal || 0);

  /*
   * Get the percentage from the API response.
   *
   * EngagementObj.oneOffDiscountPercentage_WithAllDecimal
   * is available in your engagement-letter response.
   */
  const explicitOneOffDiscountPercentage = Number(
    OneOffPricingInfo?.DiscountPercentage ??
      EngagementObj?.oneOffDiscountPercentage_WithAllDecimal ??
      EngagementObj?.oneOffDiscountPercentage ??
      0,
  );

  /*
   * OneOffPricingInfo.Discount may contain the discount amount.
   * Use it only as a fallback when the percentage is unavailable.
   */
  const existingOneOffDiscountAmount = roundCurrency(
    OneOffPricingInfo?.Discount || 0,
  );

  const oneOffDiscountPercentage =
    explicitOneOffDiscountPercentage > 0
      ? explicitOneOffDiscountPercentage
      : oneOffNetTotal > 0 && existingOneOffDiscountAmount > 0
        ? (existingOneOffDiscountAmount / oneOffNetTotal) * 100
        : 0;

  const hasOneOffDiscount = oneOffDiscountPercentage > 0;

  const oneOffDiscountAmount = hasOneOffDiscount
    ? roundCurrency((oneOffNetTotal * oneOffDiscountPercentage) / 100)
    : 0;

  /*
   * The same percentage discount is applied proportionately
   * to VAT. This also supports rows having different VAT rates.
   */
  const oneOffVatDiscountAmount = hasOneOffDiscount
    ? roundCurrency((oneOffVatTotal * oneOffDiscountPercentage) / 100)
    : 0;

  const oneOffDiscountedNet = roundCurrency(
    oneOffNetTotal - oneOffDiscountAmount,
  );

  const oneOffDiscountedVat = roundCurrency(
    oneOffVatTotal - oneOffVatDiscountAmount,
  );

  const oneOffNetFeesIncludingVat = roundCurrency(
    oneOffNetTotal + oneOffVatTotal,
  );

  const oneOffDiscountedFeesIncludingVat = roundCurrency(
    oneOffDiscountAmount + oneOffVatDiscountAmount,
  );

  const oneOffGrandTotal = roundCurrency(
    oneOffDiscountedNet + oneOffDiscountedVat,
  );

  /*
   * When DiscountLines is false, show discounted values
   * directly in the Net Total row.
   */
  const oneOffFooterNetFees =
    hasOneOffDiscount && !EngagementObj.DiscountLines
      ? oneOffDiscountedNet
      : oneOffNetTotal;

  const oneOffFooterNetVat =
    hasOneOffDiscount && !EngagementObj.DiscountLines
      ? oneOffDiscountedVat
      : oneOffVatTotal;

  const oneOffFooterNetFeesIncludingVat =
    hasOneOffDiscount && !EngagementObj.DiscountLines
      ? oneOffGrandTotal
      : oneOffNetFeesIncludingVat;

  console.log("recurringServiceCategories", recurringServiceCategories);

  return (
    <div className="container">
      {/* <div class="main-content"> */}
      <div class="page-content page-background prospect-bg">
        {/* <div class="page-info-header page-info-strip"> */}
        <div class="container">
          <div className="row">
            <div className="col-md-6 col-sm-6 col-6">
              <div class="prospects-title">
                <h5>Reference ID: {EngagementObj.contractName}</h5>
                {/* <h5>
                      {EngagementName}:{" "}
                      {isMobile
                        ? EngagementObj.clientName &&
                          EngagementObj.clientName.length > 15
                          ? `${EngagementObj.clientName.substring(0, 15)}...`
                          : EngagementObj.clientName
                        : EngagementObj.clientName}
                    </h5> */}
              </div>
            </div>

            <div className="col-md-6 col-sm-6 col-6">
              <div className="d-flex justify-content-md-end justify-content-sm-end justify-content-end add-new-prospect">
                {EngagementObj.statusID == statusID.Signed &&
                  EngagementObj.manuallySignedContractDocUrl === null && (
                    <Tooltip title={`Download ${EngagementName} `}>
                      <button
                        className="btn btn-md btn-success create-item-btn"
                        onClick={handleDownload}
                      >
                        <i className="bi bi-download"></i>{" "}
                        <span className="d-none d-sm-inline">
                          Download {EngagementName}
                        </span>
                      </button>
                    </Tooltip>
                  )}
                {(EngagementObj.statusID !== statusID.Signed ||
                  (EngagementObj.statusID === statusID.Signed &&
                    EngagementObj.manuallySignedContractDocUrl !== null)) && (
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
                    className="btn btn-md btn-success create-item-btn "
                    onClick={handleBack}
                    style={{ marginLeft: "10px" }}
                  >
                    <i className="fa fa-arrow-left d-md-none"></i>
                    <span className="d-none d-md-inline">Back</span>
                  </button>
                </Tooltip>
              </div>
            </div>
          </div>
        </div>
        {/* </div> */}
        <div class="container-fluid ">
          <div class="row">
            <div class="col-lg-12">
              <div class="card" style={{ marginTop: "75px" }}>
                <div class="card-body">
                  <div style={{ height: "60vh" }} id="customerList">
                    <div class="row g-4 mb-3"></div>
                    <div class="search-box ms-2 width-searchbox prospect-form">
                      <div
                        style={{ height: "70vh" }}
                        class=" table-card  mb-3 Height_View_scroll scroll-hidden"
                      >
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
                          <li class="nav-item">
                            <a
                              class="nav-link tab_nav"
                              data-bs-toggle="tab"
                              href="#Signatory"
                              role="tab"
                              aria-selected="false"
                            >
                              Authorised Signatories
                            </a>
                          </li>
                          {EngagementObj.declinedReason !== null && (
                            <li class="nav-item">
                              <a
                                class="nav-link tab_nav"
                                data-bs-toggle="tab"
                                href="#DeclinedReason"
                                role="tab"
                                aria-selected="false"
                              >
                                Declined Reason
                              </a>
                            </li>
                          )}
                          {(EngagementObj.statusID === statusID.Sent ||
                            EngagementObj.statusID ===
                              statusID.Awaiting_Signature ||
                            EngagementObj.manuallySignedContractDocUrl !==
                              null) && (
                            <li class="nav-item">
                              <a
                                class="nav-link tab_nav"
                                data-bs-toggle="tab"
                                href="#SignManually"
                                role="tab"
                                aria-selected="false"
                              >
                                Sign Manually
                              </a>
                            </li>
                          )}
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
                                  <td> {prospectName} Name</td>
                                  <td class="text-end">
                                    {EngagementObj.clientName}
                                  </td>
                                </tr>
                                {/* <tr>
                                    <td>Reference ID:</td>
                                    <td class="text-end">
                                      {EngagementObj.contractName}
                                    </td>
                                  </tr> */}
                                <tr>
                                  <td>Template</td>
                                  <td class="text-end">
                                    {EngagementObj.templateName}
                                  </td>
                                </tr>
                                {EngagementObj.draftOn && (
                                  <tr>
                                    <td>Drafted On</td>
                                    <td class="text-end">
                                      {GetOnlyDate(EngagementObj.draftOn)}
                                    </td>
                                  </tr>
                                )}
                                {EngagementObj.sentOn && (
                                  <tr>
                                    <td>Sent On</td>
                                    <td class="text-end">
                                      {GetOnlyDate(EngagementObj.sentOn)}
                                    </td>
                                  </tr>
                                )}
                                {EngagementObj.signedOn && isSignedStatus && (
                                  <tr>
                                    <td>Signed On</td>
                                    <td class="text-end">
                                      {GetOnlyDate(EngagementObj.signedOn)}
                                    </td>
                                  </tr>
                                )}

                                {EngagementObj.VoidOn && !isSignedStatus && (
                                  <tr>
                                    <td>Void On</td>
                                    <td class="text-end">
                                      {GetOnlyDate(EngagementObj.VoidOn)}
                                    </td>
                                  </tr>
                                )}
                                <tr>
                                  <td>Linked Proposal</td>
                                  <td
                                    class="text-end"
                                    style={{
                                      color: "blue",
                                      cursor: "pointer",
                                    }}
                                    onClick={() =>
                                      navigate("/view-proposal", {
                                        state: {
                                          quoteKeyID: EngagementObj.quoteKeyID,
                                        },
                                      })
                                    }
                                  >
                                    View Proposal
                                  </td>
                                </tr>

                                {/* <tr>
                                    <td>Select ProposalType</td>
                                    <td class="text-end">
                                      {EngagementObj.contractTypeName}
                                    </td>
                                  </tr> */}
                              </tbody>
                            </table>
                          </div>
                          <div
                            style={{ width: "98%" }}
                            class="tab-pane"
                            id="product"
                            role="tabpanel"
                          >
                            <div className="separator mb-3"></div>
                            <>
                              <div className="row fieldset">
                                <div className="col-md-2 mb-2 text-md-end">
                                  <label className="fieldset-label required">
                                    Fees in the {proposalName}
                                  </label>
                                </div>
                                <div className="col-md-10 mb-2">
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

                              <div className="row fieldset">
                                <div className="col-md-2 mb-2 text-md-end">
                                  <label className="fieldset-label required">
                                    Payment Gateway
                                    <span className="text-danger">*</span>
                                  </label>
                                </div>
                                <div className="col-md-10 mb-2">
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
                              <div className="row fieldset">
                                <div className="col-md-2 mb-2 text-md-end">
                                  <label className="fieldset-label required">
                                    Show Discount
                                  </label>
                                </div>
                                <div className="col-md-10 mb-2">
                                  <div className="input-group">
                                    {/* Replace Select with Checkbox */}
                                    <input
                                      type="checkbox"
                                      disabled
                                      checked={EngagementObj.DiscountLines}
                                    />
                                  </div>
                                </div>
                              </div>
                              {packageList.length > 0 && (
                                <div className="row fieldset">
                                  <div className="col-md-2 mb-2 text-md-end">
                                    <label className="fieldset-label required">
                                      Package Name
                                    </label>
                                  </div>
                                  <div className="col-md-10 mb-2">
                                    <div className="input-group">
                                      {/* Add your Select component here */}
                                      <b>{packageList[0].servicePackageName}</b>
                                    </div>
                                  </div>
                                </div>
                              )}
                              {selectedRecurringServiceList?.length !== 0 && (
                                <div className="tab-content">
                                  <div className="tab-pane p-3 active">
                                    <div className="row">
                                      <div className="col-lg-12">
                                        <div className="separator mb-2"></div>
                                        <h6>Recurring Services</h6>
                                        <div className="separator mb-3"></div>

                                        <div className="row fieldset">
                                          <div className="col-md-2 col-sm-12  text-md-end">
                                            <label className="fieldset-label">
                                              Original Price (
                                              {getCurrencySymbol(
                                                EngagementObj.currencyID,
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
                                                //   formatValue(
                                                //   RecurringPricingInfo.OriginalPrice
                                                // )
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

                                                // RecurringPricingInfo.OriginalPrice?.toString().replace(
                                                //   /\B(?=(\d{3})+(?!\d))/g,
                                                //   ","
                                                // )
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
                                        <div class="row" id="recurring_Default">
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
                                              value={RecurringPricingInfo.DefaultDiscount?.toString()?.replace(
                                                /\B(?=(\d{3})+(?!\d))/g,
                                                ",",
                                              )}
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
                                                  EngagementObj.currencyID,
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
                                                EngagementObj.currencyID,
                                              )})`}
                                              value={Number(
                                                Math.floor(
                                                  RecurringPricingInfo.DiscountedPrice *
                                                    100,
                                                ) / 100,
                                              )
                                                .toFixed(2)
                                                .replace(
                                                  /\B(?=(\d{3})+(?!\d))/g,
                                                  ",",
                                                )}
                                            />
                                          </div>
                                        </div>
                                        <div className="mb-3"></div>
                                        {pricingTableColumnIDs === null ||
                                        pricingTableColumnIDs === "" ||
                                        pricingTableColumnIDs === undefined ? (
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
                                                  <th className="tr-table-class text-white text-right">
                                                    Fees (
                                                    {getCurrencySymbol(
                                                      EngagementObj.currencyID,
                                                    )}
                                                    )
                                                  </th>
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
                                                                className={` ${
                                                                  subService?.isAdditionalService ===
                                                                  true
                                                                    ? "bg-info  text-white"
                                                                    : ""
                                                                }`}
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
                                                                <td className="text-right">
                                                                  {EngagementObj.feeTypeId ===
                                                                    1 && (
                                                                    <>
                                                                      {" "}
                                                                      {formatValue(
                                                                        subService.contractPrice,
                                                                      )}
                                                                    </>
                                                                  )}
                                                                  {EngagementObj.feeTypeId ===
                                                                    2 && (
                                                                    <span className="fa fa-check"></span>
                                                                  )}
                                                                </td>
                                                              </tr>
                                                            );
                                                          },
                                                        )}
                                                      </>
                                                    );
                                                  },
                                                )}
                                                <tr className="head-row">
                                                  <td className="tr-table-class font-14 font-14 text-white">
                                                    Net Total
                                                  </td>
                                                  <td className="tr-table-class font-14 text-white text-right">
                                                    {" "}
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
                                                        !EngagementObj.DiscountLines)
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
                                                {Number(
                                                  RecurringPricingInfo.Discount,
                                                ) > 0 &&
                                                  EngagementObj.DiscountLines && (
                                                    <>
                                                      <tr class="head-grey-row">
                                                        <td className="tr-table-class font-14 text-white">
                                                          Discount
                                                        </td>
                                                        <td className="tr-table-class font-14 text-white text-right">
                                                          (-){" "}
                                                          {formatValue(
                                                            RecurringPricingInfo.Discount,
                                                          )}
                                                        </td>
                                                      </tr>
                                                      <tr class="head-row">
                                                        <td className="tr-table-class font-14 text-white">
                                                          Discounted Total
                                                        </td>
                                                        <td className="tr-table-class font-14 text-white text-right">
                                                          {" "}
                                                          {formatValue(
                                                            RecurringPricingInfo.DiscountedTotal,
                                                          )}
                                                        </td>
                                                      </tr>
                                                    </>
                                                  )}

                                                {vatPercentage && (
                                                  <>
                                                    <tr class="head-grey-row">
                                                      <td className="tr-table-class font-14 text-white">
                                                        {getTaxName(
                                                          EngagementObj.currencyID,
                                                        )}
                                                      </td>
                                                      <td className="tr-table-class text-white font-14 text-right">
                                                        {" "}
                                                        {formatValue(
                                                          RecurringPricingInfo.VATPrice,
                                                        )}
                                                      </td>
                                                    </tr>
                                                    <tr className="head-row">
                                                      <td className="tr-table-class font-14 text-white">
                                                        Grand Total
                                                      </td>
                                                      <td className="tr-table-class font-14 text-white text-right">
                                                        {" "}
                                                        {formatValue(
                                                          RecurringPricingInfo.GrandTotal,
                                                        )}
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

                                                  {visibleFieldsCustomTemp?.serviceName && (
                                                    <th
                                                      className="tr-table-class text-white text-center"
                                                      style={{
                                                        width: "16.66%",
                                                      }}
                                                    >
                                                      Services
                                                    </th>
                                                  )}

                                                  {visibleFieldsCustomTemp?.serviceScope && (
                                                    <th
                                                      className="tr-table-class text-white text-center"
                                                      style={{
                                                        width: "16.66%",
                                                      }}
                                                    >
                                                      Service Scope
                                                    </th>
                                                  )}

                                                  {visibleFieldsCustomTemp?.fees && (
                                                    <th
                                                      className="tr-table-class text-white text-center"
                                                      style={{
                                                        width: "16.66%",
                                                      }}
                                                    >
                                                      Fees (£)
                                                    </th>
                                                  )}

                                                  {showRecurringVat &&
                                                    visibleFieldsCustomTemp?.vatRate && (
                                                      <th
                                                        className="tr-table-class text-white text-center"
                                                        style={{
                                                          width: "16.66%",
                                                        }}
                                                      >
                                                        VAT Rate
                                                      </th>
                                                    )}

                                                  {showRecurringVat &&
                                                    visibleFieldsCustomTemp?.vat && (
                                                      <th
                                                        className="tr-table-class text-white text-center"
                                                        style={{
                                                          width: "16.66%",
                                                        }}
                                                      >
                                                        VAT (£)
                                                      </th>
                                                    )}

                                                  {showRecurringVat &&
                                                    visibleFieldsCustomTemp?.feesIncVat && (
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
                                                {recurringRowsByCategory.map(
                                                  (category, categoryIndex) => (
                                                    <React.Fragment
                                                      key={`recurring-category-${category.serviceCatID || categoryIndex}`}
                                                    >
                                                      {(
                                                        category?.servicesList ||
                                                        []
                                                      ).map(
                                                        (
                                                          subService,
                                                          serviceIndex,
                                                        ) => {
                                                          const driverList =
                                                            subService?.pricingDriverList ||
                                                            [];

                                                          return (
                                                            <tr
                                                              key={`recurring-service-${subService.serviceID || serviceIndex}`}
                                                            >
                                                              {visibleFieldsCustomTemp?.serviceCategory && (
                                                                <td className="text-center">
                                                                  {
                                                                    category.serviceCatName
                                                                  }
                                                                </td>
                                                              )}

                                                              {visibleFieldsCustomTemp?.serviceName && (
                                                                <td className="text-center">
                                                                  {
                                                                    subService.serviceName
                                                                  }
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
                                                                            key={`${driver.driverName}-${driverIndex}`}
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
                                                                  {EngagementObj?.feeTypeId ===
                                                                    1 &&
                                                                    formatValue(
                                                                      subService.calculatedPrice,
                                                                      EngagementObj.currencyID,
                                                                    )}

                                                                  {EngagementObj?.feeTypeId ===
                                                                    2 && (
                                                                    <span className="fa fa-check" />
                                                                  )}
                                                                </td>
                                                              )}

                                                              {showRecurringVat &&
                                                                visibleFieldsCustomTemp?.vatRate && (
                                                                  <td className="text-center">
                                                                    {
                                                                      subService.calculatedVatRate
                                                                    }
                                                                    %
                                                                  </td>
                                                                )}

                                                              {showRecurringVat &&
                                                                visibleFieldsCustomTemp?.vat && (
                                                                  <td className="text-center">
                                                                    {EngagementObj?.feeTypeId ===
                                                                      1 &&
                                                                      formatValue(
                                                                        subService.calculatedVatAmount,
                                                                        EngagementObj.currencyID,
                                                                      )}

                                                                    {EngagementObj?.feeTypeId ===
                                                                      2 && (
                                                                      <span className="fa fa-check" />
                                                                    )}
                                                                  </td>
                                                                )}

                                                              {showRecurringVat &&
                                                                visibleFieldsCustomTemp?.feesIncVat && (
                                                                  <td className="text-center">
                                                                    {EngagementObj?.feeTypeId ===
                                                                      1 &&
                                                                      formatValue(
                                                                        subService.calculatedFeesIncludingVat,
                                                                        EngagementObj.currencyID,
                                                                      )}

                                                                    {EngagementObj?.feeTypeId ===
                                                                      2 && (
                                                                      <span className="fa fa-check" />
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

                                                <tr className="head-row">
                                                  {visibleFieldsCustomTemp?.serviceCategory && (
                                                    <td className="tr-table-class text-white">
                                                      Net Total
                                                    </td>
                                                  )}
                                                  {visibleFieldsCustomTemp?.serviceName && (
                                                    <td />
                                                  )}
                                                  {visibleFieldsCustomTemp?.serviceScope && (
                                                    <td />
                                                  )}

                                                  {visibleFieldsCustomTemp?.fees && (
                                                    <td className="tr-table-class font-14 text-white text-center">
                                                      {formatValue(
                                                        recurringNetRowValues.fees,
                                                        EngagementObj.currencyID,
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
                                                          recurringNetRowValues.vat,
                                                          EngagementObj.currencyID,
                                                        )}
                                                      </td>
                                                    )}

                                                  {showRecurringVat &&
                                                    visibleFieldsCustomTemp?.feesIncVat && (
                                                      <td className="tr-table-class font-14 text-white text-center">
                                                        {formatValue(
                                                          recurringNetRowValues.feesIncVAT,
                                                          EngagementObj.currencyID,
                                                        )}
                                                      </td>
                                                    )}
                                                </tr>

                                                {recurringFooterTotals.hasDiscount &&
                                                  showRecurringDiscountLine && (
                                                    <tr className="head-grey-row">
                                                      {visibleFieldsCustomTemp?.serviceCategory && (
                                                        <td className="tr-table-class font-14 text-white">
                                                          Discount
                                                        </td>
                                                      )}
                                                      {visibleFieldsCustomTemp?.serviceName && (
                                                        <td />
                                                      )}
                                                      {visibleFieldsCustomTemp?.serviceScope && (
                                                        <td />
                                                      )}

                                                      {visibleFieldsCustomTemp?.fees && (
                                                        <td className="tr-table-class font-14 text-white text-center">
                                                          (-){" "}
                                                          {formatValue(
                                                            recurringFooterTotals.discount,
                                                            EngagementObj.currencyID,
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
                                                              EngagementObj.currencyID,
                                                            )}
                                                          </td>
                                                        )}

                                                      {showRecurringVat &&
                                                        visibleFieldsCustomTemp?.feesIncVat && (
                                                          <td className="tr-table-class font-14 text-white text-center">
                                                            (-){" "}
                                                            {formatValue(
                                                              recurringFooterTotals.discountIncludingVAT,
                                                              EngagementObj.currencyID,
                                                            )}
                                                          </td>
                                                        )}
                                                    </tr>
                                                  )}

                                                <tr className="head-row">
                                                  {visibleFieldsCustomTemp?.serviceCategory && (
                                                    <td className="tr-table-class font-14 text-white">
                                                      Grand Total
                                                    </td>
                                                  )}
                                                  {visibleFieldsCustomTemp?.serviceName && (
                                                    <td />
                                                  )}
                                                  {visibleFieldsCustomTemp?.serviceScope && (
                                                    <td />
                                                  )}

                                                  {visibleFieldsCustomTemp?.fees && (
                                                    <td className="tr-table-class font-14 text-white text-center">
                                                      {formatValue(
                                                        recurringFooterTotals.hasDiscount
                                                          ? recurringFooterTotals.discountedTotal
                                                          : recurringFooterTotals.netTotal,
                                                        EngagementObj.currencyID,
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
                                                          recurringFooterTotals.finalVAT,
                                                          EngagementObj.currencyID,
                                                        )}
                                                      </td>
                                                    )}

                                                  {showRecurringVat &&
                                                    visibleFieldsCustomTemp?.feesIncVat && (
                                                      <td className="tr-table-class font-14 text-white text-center">
                                                        {formatValue(
                                                          recurringFooterTotals.grandTotal,
                                                          EngagementObj.currencyID,
                                                        )}
                                                      </td>
                                                    )}
                                                </tr>
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

                                        <div className="row fieldset">
                                          <div className="col-md-2 col-sm-12  text-md-end">
                                            <label className="fieldset-label">
                                              Original Price (
                                              {getCurrencySymbol(
                                                EngagementObj.currencyID,
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
                                                // formatValue(
                                                //   OneOffPricingInfo.OriginalPrice
                                                // )
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
                                                // OneOffPricingInfo.OriginalPrice?.toString().replace(
                                                //   /\B(?=(\d{3})+(?!\d))/g,
                                                //   ","
                                                // )
                                              }
                                            />
                                          </div>
                                        </div>
                                        <div class="row" id="OneOff_Default">
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
                                              value={OneOffPricingInfo.DefaultDiscount?.toString()?.replace(
                                                /\B(?=(\d{3})+(?!\d))/g,
                                                ",",
                                              )}
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
                                                  EngagementObj.currencyID,
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
                                                EngagementObj.currencyID,
                                              )})`}
                                              value={Number(
                                                Math.floor(
                                                  OneOffPricingInfo.DiscountedPrice *
                                                    100,
                                                ) / 100,
                                              )
                                                .toFixed(2)
                                                .replace(
                                                  /\B(?=(\d{3})+(?!\d))/g,
                                                  ",",
                                                )}
                                            />
                                          </div>
                                        </div>
                                        <div className="mb-3"></div>
                                        {pricingTableColumnIDs === null ||
                                        pricingTableColumnIDs === "" ||
                                        pricingTableColumnIDs === undefined ? (
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
                                                  <th className="tr-table-class text-white text-right">
                                                    Fees (
                                                    {getCurrencySymbol(
                                                      EngagementObj.currencyID,
                                                    )}
                                                    )
                                                  </th>
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
                                                                className={` ${
                                                                  subService?.isAdditionalService ===
                                                                  true
                                                                    ? "bg-info  text-white"
                                                                    : ""
                                                                }`}
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
                                                                <td className="text-right">
                                                                  {EngagementObj.feeTypeId ===
                                                                    1 && (
                                                                    <>
                                                                      {" "}
                                                                      {formatValue(
                                                                        subService.contractPrice,
                                                                      )}
                                                                    </>
                                                                  )}
                                                                  {EngagementObj.feeTypeId ===
                                                                    2 && (
                                                                    <span className="fa fa-check"></span>
                                                                  )}
                                                                </td>
                                                              </tr>
                                                            );
                                                          },
                                                        )}
                                                      </>
                                                    );
                                                  },
                                                )}
                                                <tr className="head-row">
                                                  <td className="tr-table-class font-14 text-white">
                                                    Net Total
                                                  </td>
                                                  <td className="tr-table-class font-14 text-white text-right">
                                                    {" "}
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
                                                        !EngagementObj.DiscountLines)
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
                                                {Number(
                                                  OneOffPricingInfo.Discount,
                                                ) > 0 &&
                                                  EngagementObj.DiscountLines && (
                                                    <>
                                                      {" "}
                                                      <tr class="head-grey-row">
                                                        <td className="tr-table-class font-14 text-white">
                                                          Discount
                                                        </td>
                                                        <td className="tr-table-class text-white text-right font-14">
                                                          (-){" "}
                                                          {formatValue(
                                                            OneOffPricingInfo.Discount,
                                                          )}
                                                        </td>
                                                      </tr>
                                                      <tr class="head-row">
                                                        <td className="tr-table-class font-14 text-white">
                                                          Discounted Total
                                                        </td>
                                                        <td className="tr-table-class font-14 text-white text-right">
                                                          {" "}
                                                          {formatValue(
                                                            OneOffPricingInfo.DiscountedTotal,
                                                          )}
                                                        </td>
                                                      </tr>
                                                    </>
                                                  )}
                                                {vatPercentage && (
                                                  <>
                                                    <tr class="head-grey-row">
                                                      <td className="tr-table-class font-14 text-white">
                                                        {getTaxName(
                                                          EngagementObj.currencyID,
                                                        )}
                                                      </td>
                                                      <td className="tr-table-class font-14 text-white text-right">
                                                        {" "}
                                                        {formatValue(
                                                          OneOffPricingInfo.VATPrice,
                                                        )}
                                                      </td>
                                                    </tr>
                                                    <tr className="head-row">
                                                      <td className="tr-table-class font-14 text-white">
                                                        Grand Total
                                                      </td>
                                                      <td className="tr-table-class font-14 text-white text-right">
                                                        {" "}
                                                        {formatValue(
                                                          OneOffPricingInfo.GrandTotal,
                                                        )}
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
                                                      Fees (£)
                                                    </th>
                                                  )}
                                                  {showOneOffVat &&
                                                    visibleFieldsCustomTemp.vatRate && (
                                                      <th
                                                        className="tr-table-class text-white text-center"
                                                        style={{
                                                          width: "16.66%",
                                                        }}
                                                      >
                                                        VAT Rate
                                                      </th>
                                                    )}
                                                  {showOneOffVat &&
                                                    visibleFieldsCustomTemp.vat && (
                                                      <th
                                                        className="tr-table-class text-white text-center"
                                                        style={{
                                                          width: "16.66%",
                                                        }}
                                                      >
                                                        VAT (£)
                                                      </th>
                                                    )}
                                                  {showOneOffVat &&
                                                    visibleFieldsCustomTemp.feesIncVat && (
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
                                                {selectedOneOffServiceList?.map(
                                                  (service, index) => {
                                                    return (
                                                      <>
                                                        {service.servicesList.map(
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
                                                                    oneOffFinalAmount.vatPercentage,
                                                                },
                                                              );
                                                            const driverList =
                                                              subService.pricingDriverList ||
                                                              [];

                                                            return (
                                                              <tr
                                                                key={`sub-oneoff-${index}-${subIndex}`}
                                                              >
                                                                {visibleFieldsCustomTemp?.serviceCategory && (
                                                                  <td className="text-center">
                                                                    {
                                                                      service.serviceCatName
                                                                    }
                                                                  </td>
                                                                )}
                                                                {visibleFieldsCustomTemp.serviceName && (
                                                                  <td className="text-center">
                                                                    {
                                                                      subService.serviceName
                                                                    }
                                                                  </td>
                                                                )}
                                                                {visibleFieldsCustomTemp.serviceScope && (
                                                                  <td className="text-center">
                                                                    {driverList.length >
                                                                    0
                                                                      ? driverList.map(
                                                                          (
                                                                            d,
                                                                            i,
                                                                          ) => (
                                                                            <div
                                                                              key={
                                                                                i
                                                                              }
                                                                            >
                                                                              {
                                                                                d.driverName
                                                                              }{" "}
                                                                              ={" "}
                                                                              {
                                                                                d.driverValue
                                                                              }
                                                                              {i !==
                                                                                driverList.length -
                                                                                  1 &&
                                                                                ", "}
                                                                            </div>
                                                                          ),
                                                                        )
                                                                      : "-"}
                                                                  </td>
                                                                )}
                                                                {visibleFieldsCustomTemp.fees && (
                                                                  <td className="text-center">
                                                                    {EngagementObj.feeTypeId ===
                                                                      1 &&
                                                                      formatValue(
                                                                        price,
                                                                      )}
                                                                    {EngagementObj.feeTypeId ===
                                                                      2 && (
                                                                      <span className="fa fa-check"></span>
                                                                    )}
                                                                  </td>
                                                                )}
                                                                {showOneOffVat &&
                                                                  visibleFieldsCustomTemp.vatRate && (
                                                                    <td className="text-center">
                                                                      {vatRate}%
                                                                    </td>
                                                                  )}
                                                                {showOneOffVat &&
                                                                  visibleFieldsCustomTemp.vat && (
                                                                    <td className="text-center">
                                                                      {EngagementObj.feeTypeId ===
                                                                        1 &&
                                                                        formatValue(
                                                                          vatAmount,
                                                                        )}
                                                                      {EngagementObj.feeTypeId ===
                                                                        2 && (
                                                                        <span className="fa fa-check"></span>
                                                                      )}
                                                                    </td>
                                                                  )}
                                                                {showOneOffVat &&
                                                                  visibleFieldsCustomTemp.feesIncVat && (
                                                                    <td className="text-center">
                                                                      {EngagementObj.feeTypeId ===
                                                                        1 &&
                                                                        formatValue(
                                                                          feesIncludingVat,
                                                                        )}
                                                                      {EngagementObj.feeTypeId ===
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

                                                {/* NET TOTAL */}
                                                <tr className="head-row">
                                                  {visibleFieldsCustomTemp?.serviceCategory && (
                                                    <td className="tr-table-class font-14 text-white">
                                                      Net Total
                                                    </td>
                                                  )}

                                                  {visibleFieldsCustomTemp?.serviceName && (
                                                    <td></td>
                                                  )}

                                                  {visibleFieldsCustomTemp?.serviceScope && (
                                                    <td></td>
                                                  )}

                                                  {visibleFieldsCustomTemp?.fees && (
                                                    <td className="tr-table-class font-14 text-white text-right">
                                                      {formatValue(
                                                        oneOffFooterNetFees,
                                                        EngagementObj.currencyID,
                                                      )}
                                                    </td>
                                                  )}

                                                  {showOneOffVat &&
                                                    visibleFieldsCustomTemp?.vatRate && (
                                                      <td></td>
                                                    )}

                                                  {showOneOffVat &&
                                                    visibleFieldsCustomTemp?.vat && (
                                                      <td className="tr-table-class font-14 text-white text-center">
                                                        {formatValue(
                                                          oneOffFooterNetVat,
                                                          EngagementObj.currencyID,
                                                        )}
                                                      </td>
                                                    )}

                                                  {showOneOffVat &&
                                                    visibleFieldsCustomTemp?.feesIncVat && (
                                                      <td className="tr-table-class font-14 text-white text-center">
                                                        {formatValue(
                                                          oneOffFooterNetFeesIncludingVat,
                                                          EngagementObj.currencyID,
                                                        )}
                                                      </td>
                                                    )}
                                                </tr>

                                                {/* DISCOUNT */}
                                                {hasOneOffDiscount &&
                                                  EngagementObj.DiscountLines && (
                                                    <tr className="head-grey-row">
                                                      {visibleFieldsCustomTemp?.serviceCategory && (
                                                        <td className="tr-table-class font-14 text-white">
                                                          Discount
                                                        </td>
                                                      )}

                                                      {visibleFieldsCustomTemp?.serviceName && (
                                                        <td></td>
                                                      )}

                                                      {visibleFieldsCustomTemp?.serviceScope && (
                                                        <td></td>
                                                      )}

                                                      {visibleFieldsCustomTemp?.fees && (
                                                        <td className="tr-table-class font-14 text-white text-right">
                                                          (-){" "}
                                                          {formatValue(
                                                            oneOffDiscountAmount,
                                                            EngagementObj.currencyID,
                                                          )}
                                                        </td>
                                                      )}

                                                      {showOneOffVat &&
                                                        visibleFieldsCustomTemp?.vatRate && (
                                                          <td></td>
                                                        )}

                                                      {showOneOffVat &&
                                                        visibleFieldsCustomTemp?.vat && (
                                                          <td className="tr-table-class font-14 text-white text-center">
                                                            (-){" "}
                                                            {formatValue(
                                                              oneOffVatDiscountAmount,
                                                              EngagementObj.currencyID,
                                                            )}
                                                          </td>
                                                        )}

                                                      {showOneOffVat &&
                                                        visibleFieldsCustomTemp?.feesIncVat && (
                                                          <td className="tr-table-class font-14 text-white text-center">
                                                            (-){" "}
                                                            {formatValue(
                                                              oneOffDiscountedFeesIncludingVat,
                                                              EngagementObj.currencyID,
                                                            )}
                                                          </td>
                                                        )}
                                                    </tr>
                                                  )}

                                                {/* GRAND TOTAL */}
                                                <tr className="head-row">
                                                  {visibleFieldsCustomTemp?.serviceCategory && (
                                                    <td className="tr-table-class font-14 text-white">
                                                      Grand Total
                                                    </td>
                                                  )}

                                                  {visibleFieldsCustomTemp?.serviceName && (
                                                    <td></td>
                                                  )}

                                                  {visibleFieldsCustomTemp?.serviceScope && (
                                                    <td></td>
                                                  )}

                                                  {visibleFieldsCustomTemp?.fees && (
                                                    <td className="tr-table-class font-14 text-white text-center">
                                                      {formatValue(
                                                        hasOneOffDiscount
                                                          ? oneOffDiscountedNet
                                                          : oneOffNetTotal,
                                                        EngagementObj.currencyID,
                                                      )}
                                                    </td>
                                                  )}

                                                  {showOneOffVat &&
                                                    visibleFieldsCustomTemp?.vatRate && (
                                                      <td></td>
                                                    )}

                                                  {showOneOffVat &&
                                                    visibleFieldsCustomTemp?.vat && (
                                                      <td className="tr-table-class font-14 text-white text-center">
                                                        {formatValue(
                                                          hasOneOffDiscount
                                                            ? oneOffDiscountedVat
                                                            : oneOffVatTotal,
                                                          EngagementObj.currencyID,
                                                        )}
                                                      </td>
                                                    )}

                                                  {showOneOffVat &&
                                                    visibleFieldsCustomTemp?.feesIncVat && (
                                                      <td className="tr-table-class font-14 text-white text-center">
                                                        {formatValue(
                                                          hasOneOffDiscount
                                                            ? oneOffGrandTotal
                                                            : oneOffNetFeesIncludingVat,
                                                          EngagementObj.currencyID,
                                                        )}
                                                      </td>
                                                    )}
                                                </tr>
                                              </tbody>
                                            </table>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </>
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
                          <div
                            style={{ width: "98%" }}
                            class="tab-pane"
                            id="Signatory"
                            role="tabpanel"
                          >
                            {contractSignatoriesList.map((signatory, index) => (
                              <table
                                key={signatory.contractSignatoryID}
                                className="table table-striped fs-13 view-details-table"
                              >
                                <tbody>
                                  <tr>
                                    <td>
                                      <b>
                                        {Utils.stringifyNumber(index + 1)}{" "}
                                        Signatory
                                      </b>
                                    </td>
                                    <td className="text-right">
                                      {/* {basicInfo.businessTypeName} */}
                                    </td>
                                  </tr>
                                  <tr>
                                    <td>First Name</td>
                                    <td className="text-right">
                                      {signatory.firstName}
                                    </td>
                                  </tr>
                                  <tr>
                                    <td>Last Name</td>
                                    <td className="text-right">
                                      {signatory.lastName}
                                    </td>
                                  </tr>
                                  <tr>
                                    <td>Email</td>
                                    <td className="text-right">
                                      {signatory.emailID}
                                    </td>
                                  </tr>
                                  <tr>
                                    <td>Signed on</td>
                                    <td className="text-right">
                                      {signatory.isSigned
                                        ? formatDateToDDMMYYYY(
                                            signatory.isSigned,
                                          )
                                        : "-"}
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            ))}
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
                                        {(EngagementObj.clientMasterBusinessTypeID ===
                                          3 ||
                                          EngagementObj.clientMasterBusinessTypeID ===
                                            4 ||
                                          EngagementObj.clientMasterBusinessTypeID ===
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
                                            {formatDateToDDMMYYYY(
                                              officersForm[index].appointedOn,
                                            )}
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
                          <div
                            class="tab-pane"
                            id="DeclinedReason"
                            role="tabpanel"
                          >
                            <b
                              className="font-14"
                              style={{ marginLeft: "10px" }}
                            >
                              Reason :
                            </b>{" "}
                            {"  "}
                            {EngagementObj.declinedReason}
                          </div>
                          <div
                            class="tab-pane"
                            id="SignManually"
                            role="tabpanel"
                            style={{ marginTop: "-30px" }}
                          >
                            {" "}
                            <div>
                              {EngagementObj.manuallySignedContractDocUrl ===
                              null ? (
                                <>
                                  <span className="text-muted p-2">
                                    <p style={{ padding: "5px" }}>
                                      <i>
                                        <strong>Note:</strong>
                                        Please upload document carefully,
                                        because after uploading document{" "}
                                        {EngagementName} status will change to
                                        signed immediately. you can not change
                                        this document later.
                                      </i>
                                    </p>
                                  </span>
                                  {pdfUrl ? (
                                    <div style={{ height: "25vh" }}>
                                      {isUpload && (
                                        <>
                                          <div className="input-group justify-content-end">
                                            <button
                                              onClick={handlePdfDelete}
                                              style={{
                                                marginBottom: "5px",
                                                fontSize: "75%",
                                              }}
                                              className="btn btn-sm btn-danger remove-item-btn "
                                            >
                                              <span>Delete</span>
                                            </button>
                                          </div>
                                          <div className="input-group justify-content-center">
                                            <object
                                              title="PDF Viewer"
                                              data={pdfUrl}
                                              width="99%"
                                              height="500px"
                                            >
                                              {/* // <p>PDF cannot be displayed. <a href={EngagementObj.pdf}>Download</a> it instead.</p> */}
                                            </object>
                                          </div>
                                        </>
                                      )}
                                    </div>
                                  ) : (
                                    <>
                                      <div>
                                        <div style={{ height: "30vh" }}>
                                          <div
                                            style={{
                                              display: "flex",
                                              alignItems: "center",
                                              justifyContent: "center",
                                              width: "100%",
                                            }}
                                            className="row"
                                          >
                                            <div className="box12">
                                              <div className="col-lg-8 col-md-8 col-sm-12">
                                                {/* <label className="form-label">
                                            <b>
                                              Select File
                                            </b>
                                          </label> */}
                                                {/* </div>
                                        <div className="col-lg-3 col-md-3 col-sm-3 text-center"> */}
                                                <div className="input-group justify-content-center ">
                                                  <input
                                                    id="PdfUpload"
                                                    style={{
                                                      display: "none",
                                                    }}
                                                    type="file"
                                                    accept=".pdf"
                                                    onChange={(e) => {
                                                      e.preventDefault(); // Prevent the default form submission behavior
                                                      handleFileUpload(e);
                                                    }}
                                                  />
                                                  <label
                                                    style={{
                                                      borderRadius: "6px",
                                                    }}
                                                    htmlFor="PdfUpload"
                                                    className="btn btn-md btn-success create-item-btn"
                                                  >
                                                    <b>Select a File</b>
                                                  </label>
                                                  Supported file types are .PDF
                                                  up to a file size of 10MB.
                                                  {requireErrorMessage &&
                                                  pdfUrl === null ? (
                                                    <label className="validation">
                                                      {ERROR_MESSAGES}
                                                    </label>
                                                  ) : (
                                                    ""
                                                  )}
                                                </div>
                                              </div>

                                              {/* <div style={{ display: "flex" }} className="text-muted helpMessage justify-content-center"> */}
                                              {/* Supported file types are .PDF up to a file
                                          size of 10MB. */}
                                              {/* </div> */}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </>
                                  )}
                                </>
                              ) : (
                                <>
                                  {/* <div style={{ marginTop: "30px" }} className="input-group">
                                      {/* Embed the PDF using an iframe 
                                      <iframe
                                        src={EngagementObj.manuallySignedContractDocUrl}
                                        width="100%"
                                        height="600px"
                                        title="PDF Viewer"
                                      />


                                    </div> */}
                                  {/* <div className="input-group justify-content-center"> */}
                                  <div
                                    style={{
                                      height: "30vh",
                                      marginTop: "140px",
                                    }}
                                  >
                                    <div
                                      style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        width: "100%",
                                      }}
                                      className="row"
                                    >
                                      <div className="box12">
                                        <div className="col-lg-8 col-md-8 col-sm-12">
                                          {/* <div className="input-group justify-content-center"> */}
                                          Signed document has been uploaded for{" "}
                                          {EngagementName}{" "}
                                          <b>
                                            {EngagementObj.contractName}.
                                            <br></br>
                                          </b>
                                          To view signed document{" "}
                                          <p
                                            onClick={handleDownload}
                                            style={{
                                              cursor: "pointer",
                                              color: "blue",
                                              display: "inline",
                                            }} // This style ensures the <a> tag is displayed inline
                                          >
                                            click here
                                          </p>
                                          {/* </div> */}
                                        </div>
                                        {/* </div> */}
                                      </div>
                                    </div>
                                  </div>
                                </>
                              )}
                            </div>
                            {EngagementObj.manuallySignedContractDocUrl ===
                              null && isUpload ? (
                              <div className="input-group justify-content-center py1 py2">
                                <button
                                  onClick={confirmToUpload}
                                  style={{
                                    float: "right",
                                    paddingTop: "5px",
                                    marginTop: "20px",
                                  }}
                                  className="btn btn-md btn-success create-item-btn"
                                >
                                  <span>Upload the signed document</span>
                                </button>
                              </div>
                            ) : (
                              ""
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="input-group justify-content-center"></div>
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
      </div>
      {/* End Page-content */}
      <SuccessModal
        handleClose={handleClose}
        setOpenSuccessModal={setOpenSuccessModal}
        openSuccessModal={openSuccessModal}
        modelAction={"Uploaded"}
        message={"Document uploaded successfully"}
      />
      <ConfirmModel
        openErrorModal={openErrorModal}
        openSuccessModal={openSuccessModal}
        modelRequestData={modelRequestData}
        UpdatedStatus={UploadManuallySignedContractData}
        handleClose={handleClose}
      />
      <ErrorModel
        ErrorModel={openErrorModal}
        handleClose={handleCloseErrorModel}
        ErrorMessage={errorMessage}
      />
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
  );
};

export default View_Engagement_Latter;
