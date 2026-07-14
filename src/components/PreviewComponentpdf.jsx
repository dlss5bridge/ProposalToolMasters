import React, { useContext, useEffect, useRef, useState } from "react";
import { ElementType, EMAIL_TEMPLATE, statusID } from "../Middleware/enums";
import { useSelector } from "react-redux";
import { GetOrganisationInformationModel } from "../redux/Services/Setting/Organisation";
import Select from "react-select";
import "../pages/configure/email_template/EmailTemplate.css";
import Utils from "../Middleware/Utils";
import { ERROR_MESSAGES } from "./GlobalMessage";
import { AuthContextProvider } from "../AuthContext/AuthContext";
import { generatePdfUrl, mergePdfApiUrl } from "../Base-Url/Base_Url";
import PdfViewer from "./PdfViewers";
import PaymentGatewayModel from "./PaymentGatewayModel";
import ReactDOMServer from "react-dom/server";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ViewPlan from "./ViewPlan";
import AccountantVariables from "./Variables/AccountantVariables";
import Text_Editor from "./Text_Editor";
import { Tooltip } from "reactstrap";
import { ServiceChargeTypeEnum } from "../Middleware/enums";
import "react-datepicker/dist/react-datepicker.css";
import { format, parse, isValid } from "date-fns";
import {
  GetEmailContent,
  GetTemplateLookupPDFList,
  GetTemplatePdfList,
} from "../redux/Services/Config/TemplateApi";
import { Landscape } from "@mui/icons-material";
export default function PreviewComponentPdf(props) {
  const moduleNameForSaveAsDraft = "Preview";
  const statusIDForSaveAsDraft = 1;
  const statusIDForSendProposal = 2;
  const [showModal, setShowModal] = useState(false);
  const [TemplatePdfList, setTemplatePdfList] = useState([]);
  const [selectedAttachments, setSelectedAttachments] = useState([]);
  const [pdfListCount, setPdfListCount] = useState([]);
  const [isModalOpen, setISModalOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [heading, setHeading] = useState("");
  let count = 0;
  const statusIDForSkipped = 3;
  const [fullAddress, setFullAddress] = useState("");
  const [webSite, setWebSite] = useState("");
  const {
    setLoader,
    proposalName,
    EngagementName,
    userAccessData,
    isMobile,
    replaceUrlInHtml,
    getCurrencySymbol,
    activeOrganizationSubscriptionPlan,
    convertAndParseDate,
  } = useContext(AuthContextProvider);
  const [totalOnePackageValue, setTotalOnePackageValue] = useState(0);
  const [totalTwoPackageValue, setTotalTwoPackageValue] = useState(0);
  const [totalThreePackageValue, setTotalThreePackageValue] = useState(0);
  const [totalOnePackageValueOneOff, setTotalOnePackageValueOneOff] =
    useState(0);
  const [totalTwoPackageValueOneOff, setTotalTwoPackageValueOneOff] =
    useState(0);
  const [totalThreePackageValueOneOff, setTotalThreePackageValueOneOff] =
    useState(0);
  const [isPdfAlreadyGenerated, setIsPdfAlreadyGenerated] = useState(false);
  const [initialContent, setInitialContent] = useState("");
  const [isContentChanged, setIsContentChanged] = useState(false);
  const [editorState, setEditorState] = useState("");
  const [isPopUpVisible, setIsPopUpVisible] = useState(false);
  const openPopup = () => {
    setIsPopUpVisible(true);
  };
  const closePopup = () => {
    setIsPopUpVisible(false);
    setEditorState("");
    if (props.moduleName == "Quote") {
      props?.setProposalObject((prevState) => ({
        ...prevState,
        customizedEmailContent: null,
      }));
    } else if (props.moduleName == "Contract") {
      props?.setEngagementObj((prevState) => ({
        ...prevState,
        customizedEmailContent: null,
      }));
    }
  };
  const GetEmailTemplateContent = async (organisationKeyID, TemplateTypeID) => {
    if (!organisationKeyID) {
      return;
    }
    try {
      const data = await GetEmailContent(
        common.organisationKeyID,
        TemplateTypeID,
      );
      if (data?.data?.statusCode === 200) {
        if (data?.data?.responseData?.data) {
          const htmlContent = data?.data?.responseData?.data;
          setEditorState(htmlContent);
          setInitialContent(htmlContent);
        }
      } else {
        // console.error(error);
        setLoader(false);
      }
    } catch (error) {
      console.error(error);
    }
  };
  const isMeaningfulChanges = (currentContent, initialContent) => {
    const trimmedCurrent = currentContent.replace(/\s+/g, "").trim();
    const trimmedInitial = initialContent.replace(/\s+/g, "").trim();
    console.log("meaningfulChanges: ", trimmedCurrent !== trimmedInitial);
    return trimmedCurrent !== trimmedInitial;
  };
  const handleContentChange = (newContent) => {
    setEditorState(newContent);
    const contentChanged = isMeaningfulChanges(newContent, initialContent);
    if (contentChanged) {
      if (props.moduleName == "Quote") {
        props.setProposalObject({
          ...props.ProposalObject,
          customizedEmailContent: newContent,
        });
      } else if (props.moduleName == "Contract") {
        props.setEngagementObj({
          ...props.engagementObj,
          customizedEmailContent: newContent,
        });
      }
    }
    props.setRequireMessage(false);
  };
  // if(props.moduleName == 'Quote' && isPopUpVisible)  {
  //   if(props.ProposalObject.ProposalFormate === 2) {
  //     GetEmailTemplateContent(common.organisationKeyID,8);
  //   } else {
  //       GetEmailTemplateContent(common.organisationKeyID,5);
  //     }
  // }
  useEffect(() => {
    if (isPopUpVisible && props.moduleName === "Quote") {
      const templateType = props.ProposalObject.ProposalFormate === 2 ? 8 : 5;
      GetEmailTemplateContent(common.organisationKeyID, templateType);
    } else if (isPopUpVisible && props.moduleName === "Contract") {
      GetEmailTemplateContent(common.organisationKeyID, 6);
    }
  }, [isPopUpVisible, props?.ProposalObject?.ProposalFormate]);

  useEffect(() => {
    if (props?.pricingSettingObj?.defaultProposalFormatID != null) {
      props.setProposalObject((prev) => ({
        ...prev,
        ProposalFormate: props?.pricingSettingObj.defaultProposalFormatID,
      }));
    }
  }, [props.pricingSettingObj]);

  const handleFormate = (selectedOption) => {
    props.setProposalObject({
      ...props.ProposalObject,
      ProposalFormate: selectedOption.value,
    });
    props.setRequireMessage(false);
  };
  // const handleFormate = (selectedOption) => {
  //   props.setProposalObject({
  //     ...props.ProposalObject,
  //     ProposalFormate: selectedOption.value === 1 ? 1 : 2,
  //   });
  //   props.setRequireMessage(false);
  // };

  // const ProposalFormatValue = Utils?.PreviewSelection.find(
  //   (item) => props?.ProposalObject?.ProposalFormate == item.value
  // );
  const ProposalFormatValue = Utils.PreviewSelection.find(
    (x) => x.value === props.ProposalObject?.ProposalFormate,
  );
  // const ProposalFormatValue = Utils.PreviewSelection.find(x => x.value === props.pricingSettingObj?.defaultProposalFormatID);
  // useEffect(() => {
  //   return () => {
  //       // Cleanup: Reset HTML content when unmounting (e.g., navigating back)
  //       props.setProposalObject((prev) => ({
  //         ...prev,
  //         recurringHtmlContent: null,
  //         oneOffHtmlContent: null,
  //       }));
  //   };
  // }, []);
  const getDecimalPlaces = (driver) => {
    if (driver.driverTypeID === 2) {
      // Quantity
      return Array.isArray(driver.quantity) && driver.quantity.length > 0
        ? (driver.quantity[0].quantityDecimalPlaces ?? 0)
        : (driver.quantityDecimalPlaces ?? 0);
    }

    if (driver.driverTypeID === 4) {
      // Slab
      return Array.isArray(driver.slab) && driver.slab.length > 0
        ? (driver.slab[0].decimalPlaces ?? 0)
        : (driver.decimalPlaces ?? 0);
    }

    return 0;
  };

  useEffect(() => {
    // Function to compute the sum of package values
    const computeTotalPackageValues = () => {
      let totalOne = 0;
      let totalTwo = 0;
      let totalThree = 0;

      props?.selectedRecurringServiceList?.forEach((category) => {
        category.servicesList.forEach((service) => {
          // Check if the value is not null before adding
          if (service.packageOneValue !== null)
            totalOne += service.packageOneValue;
          if (service.packageTwoValue !== null)
            totalTwo += service.packageTwoValue;
          if (service.packageThreeValue !== null)
            totalThree += service.packageThreeValue;
        });
      });

      // Update state with the computed totals
      setTotalOnePackageValue(totalOne);
      setTotalTwoPackageValue(totalTwo);
      setTotalThreePackageValue(totalThree);
    };

    // Call the function when component mounts
    computeTotalPackageValues();
  }, []);

  useEffect(() => {
    // Function to compute the sum of package values
    const computeTotalPackageValues = () => {
      let totalOne = 0;
      let totalTwo = 0;
      let totalThree = 0;

      props?.selectedOneOffServiceList?.forEach((category) => {
        category.servicesList.forEach((service) => {
          // Check if the value is not null before adding
          if (service.packageOneValue !== null)
            totalOne += service.packageOneValue;
          if (service.packageTwoValue !== null)
            totalTwo += service.packageTwoValue;
          if (service.packageThreeValue !== null)
            totalThree += service.packageThreeValue;
        });
      });

      // Update state with the computed totals
      setTotalOnePackageValueOneOff(totalOne);
      setTotalTwoPackageValueOneOff(totalTwo);
      setTotalThreePackageValueOneOff(totalThree);
    };

    // Call the function when component mounts
    computeTotalPackageValues();
  }, []);

  useEffect(() => {
    if (
      props.organisationData.otherInformation &&
      props.organisationData.otherInformation
    ) {
      const { emailID, phoneNo, fullAddress, website } =
        props.organisationData.otherInformation[0];

      // setOfficersList(props.organisationData.officersList)
      setEmail(emailID);
      setPhone(phoneNo);
      setWebSite(website);
      setFullAddress(fullAddress);
    }
  }, [props.organisationData]);
  const pdfRef = useRef(null);
  const [generatePdfData, setGeneratePdfData] = useState([]);
  const PdfLength = generatePdfData.length;
  const common = useSelector((state) => state.Storage);
  const newColorCode = props.BrandColor; //"#FF5733";
  const BrandLogo = props.Logo; //"#FF5733";
  const [MergePdfUrl, setMergePdfUrl] = useState("");
  const fontSizeContent = props?.fontSize;
  // const fontSizeContent = "0.20in";
  const fontSizeHeading = "0.2in";
  // const fontFamily = "cursive";
  const fontFamily = props?.fontFamily;
  const HeaderContent = props.headerContent;
  const FooterContent = props.footerContent;
  const HeaderImage = props.headerImage;
  const FooterImage = props.footerImage;
  const HeaderHeight = props.headerHeight;
  const FooterHeight = props.footerHeight;
  const WatermarkImage = props.watermarkImage;
  const orientationID = props.orientationID;
  const flagForTemplatePdf = props.flagForTemplatePdf;
  const awsPdfWidth = props.awsPdfWidth;
  const awsPdfHeight = props.awsPdfHeight;
  const headerFooterFirstPage = props?.isDefaultFirstPage
    ? props?.headerFooterFirstPage
    : null;
  const headerFooterLastPage = props?.headerFooterLastPage;
  const [landscapeMode, setLandscapeMode] = useState(orientationID === 2);
  const showSeparatorLines = props.showSeparatorLines;
  console.log(props.StatementOfFact);
  // console.log(props.selectedOneOffServiceList);
  // console.log(props.selectedRecurringServiceList);
  // console.log(props?.ProposalObject?.selectedProposalTypeValue);
  // console.log(props?.engagementObj?.quoteTypeID);
  const CommonFontFamily = "Roboto Mono;sans-serif";
  const imgTag = `<img src="${props.Logo}" alt="Logo" style="display: none; margin: 0 auto 15px;">`;
  let url = `accept-decline-proposal`;
  if (props.common.enableEL === 1) {
    url = `generate-contract`;
  }
  const AcceptRecurringUrlButton1 = `https://$AppUrl$/${url}?quoteKeyID=$QuoteKeyID$&ServiceChargeTypeID=${ServiceChargeTypeEnum.Recurring}&Action=Accepted&ContractSignatoryKeyID=$ContractSignatoryKeyID$`;
  const AcceptRecurringUrlButton2 = `https://$AppUrl$/${url}?quoteKeyID=$QuoteKeyID$&ServiceChargeTypeID=${ServiceChargeTypeEnum.Recurring}&Action=Accepted&ContractSignatoryKeyID=$ContractSignatoryKeyID$`;
  const AcceptRecurringUrlButton3 = `https://$AppUrl$/${url}?quoteKeyID=$QuoteKeyID$&ServiceChargeTypeID=${ServiceChargeTypeEnum.Recurring}&Action=Accepted&ContractSignatoryKeyID=$ContractSignatoryKeyID$`;

  // const AcceptOneOffELOffUrlButton1 = `https://$AppUrl$/accept-decline-proposal?quoteKeyID=$QuoteKeyID$&ServiceChargeTypeID=${ServiceChargeTypeEnum.OneOff}&Action=Accepted&ServicePackageKeyID=${props.selectedPackagesList[0]?.servicePackageKeyID}`;
  // const AcceptOneOffELOffUrlButton2 = `https://$AppUrl$/accept-decline-proposal?quoteKeyID=$QuoteKeyID$&ServiceChargeTypeID=${ServiceChargeTypeEnum.OneOff}&Action=Accepted&ServicePackageKeyID=${props.selectedPackagesList[1]?.servicePackageKeyID}`;
  // const AcceptOneOffELOffUrlButton3 = `https://$AppUrl$/accept-decline-proposal?quoteKeyID=$QuoteKeyID$&ServiceChargeTypeID=${ServiceChargeTypeEnum.OneOff}&Action=Accepted&ServicePackageKeyID=${props.selectedPackagesList[2]?.servicePackageKeyID}`;

  const AcceptOneOffUrlButton1 = `https://$AppUrl$/${url}?quoteKeyID=$QuoteKeyID$&ServiceChargeTypeID=${ServiceChargeTypeEnum.OneOff}&Action=Accepted&ContractSignatoryKeyID=$ContractSignatoryKeyID$`;
  const AcceptOneOffUrlButton2 = `https://$AppUrl$/${url}?quoteKeyID=$QuoteKeyID$&ServiceChargeTypeID=${ServiceChargeTypeEnum.OneOff}&Action=Accepted&ContractSignatoryKeyID=$ContractSignatoryKeyID$`;
  const AcceptOneOffUrlButton3 = `https://$AppUrl$/${url}?quoteKeyID=$QuoteKeyID$&ServiceChargeTypeID=${ServiceChargeTypeEnum.OneOff}&Action=Accepted&ContractSignatoryKeyID=$ContractSignatoryKeyID$`;

  const getPaymentFrequencyLabel = () => {
    const Payment_Frequency = {
      Yearly: 1,
      HalfYearly: 2,
      Quarterly: 3,
      Monthly: 4,
    };

    const frequencyValue =
      props.ProposalObject?.Payment_Frequency ||
      props.engagementObj?.Payment_Frequency;
    switch (frequencyValue) {
      case Payment_Frequency.Yearly:
        return "Yearly";
      case Payment_Frequency.HalfYearly:
        return "Half-Yearly";
      case Payment_Frequency.Quarterly:
        return "Quarterly";
      case Payment_Frequency.Monthly:
        return "Monthly";
      default:
        return "Unknown";
    }
  };

  useEffect(() => {
    if (props?.moduleName === "Contract") {
      props.setEngagementObj((prevState) => ({
        ...prevState,
        pdf: null,
      }));
    }
  }, [props?.engagementObj]);
  const AcceptRecurringUrl = `https://$AppUrl$/${url}?quoteKeyID=$QuoteKeyID$&ServiceChargeTypeID=${ServiceChargeTypeEnum.Recurring}&Action=Accepted&ContractSignatoryKeyID=$ContractSignatoryKeyID$`;
  // const AcceptRecurringELOffUrl = `https://$AppUrl$/accept-decline-proposal?quoteKeyID=$QuoteKeyID$&ServiceChargeTypeID=${ServiceChargeTypeEnum.Recurring}&Action=Accepted`;

  const DeclineRecurringUrl = `https://$AppUrl$/accept-decline-proposal?quoteKeyID=$QuoteKeyID$&ServiceChargeTypeID=${ServiceChargeTypeEnum.Recurring}&Action=Declined&ContractSignatoryKeyID=$ContractSignatoryKeyID$`;

  const AcceptOneOffUrl = `https://$AppUrl$/${url}?quoteKeyID=$QuoteKeyID$&ServiceChargeTypeID=${ServiceChargeTypeEnum.OneOff}&Action=Accepted&ContractSignatoryKeyID=$ContractSignatoryKeyID$`;
  // const AcceptOneOffELOffUrl = `https://$AppUrl$/accept-decline-proposal?quoteKeyID=$QuoteKeyID$&ServiceChargeTypeID=${ServiceChargeTypeEnum.OneOff}&Action=Accepted`;

  const DeclineOneOffUrl = `https://$AppUrl$/accept-decline-proposal?quoteKeyID=$QuoteKeyID$&ServiceChargeTypeID=${ServiceChargeTypeEnum.OneOff}&Action=Declined&ContractSignatoryKeyID=$ContractSignatoryKeyID$`;

  const RecurringPackagesTable = (
    <div
      style={{
        paddingLeft: "40px",
        paddingRight: "40px",
        fontFamily: "'Times New Roman', Times, serif",
      }}
    >
      <p
        style={{
          fontFamily: "arial, sans-serif",
          color: "#00BFFF",
          fontSize: "20px",
          marginTop: "15px",
        }}
      >
        Recurring Services
      </p>
      <table
        style={{
          fontFamily: "arial, sans-serif",
          borderCollapse: "collapse",
          width: "100%",
          marginTop: "15px",
        }}
      >
        <tr style={{ backgroundColor: "#00BFFF" }}>
          <th
            style={{
              border: "1px solid #DDDDDD",
              textAlign: "left",
              padding: "8px",
              color: "white",
              fontSize: "18px",
            }}
          >
            Services
          </th>
          <th
            style={{
              border: "1px solid #DDDDDD",
              textAlign: "right",
              padding: "8px",
              color: "white",
              fontSize: "18px",
            }}
          ></th>
        </tr>
        {props.moduleName === "Quote" &&
          props.selectedRecurringServiceList?.map((serviceCat, index) => (
            <React.Fragment key={index}>
              <tr style={{ backgroundColor: "#DCDCDC" }}>
                <td
                  style={{
                    border: "1px solid #DDDDDD",
                    textAlign: "left",
                    padding: "8px",
                    fontWeight: "bold",
                    fontSize: "18px",
                  }}
                >
                  {serviceCat.serviceCatName}
                </td>
                <td
                  style={{
                    border: "1px solid #DDDDDD",
                    textAlign: "left",
                    padding: "8px",
                  }}
                ></td>
              </tr>
              {serviceCat.servicesList.map((subService, subIndex) => (
                <tr key={subIndex}>
                  <td
                    style={{
                      border: "1px solid #DDDDDD",
                      textAlign: "left",
                      padding: "8px",
                    }}
                  >
                    {subService.serviceName}
                  </td>
                  {props.moduleName == "Quote" &&
                  props.ProposalObject?.feeTypeId == 1 ? (
                    <td
                      style={{
                        border: "1px solid #DDDDDD",
                        textAlign: "right",
                        padding: "8px",
                      }}
                    >
                      &#10003;
                    </td>
                  ) : (
                    <td
                      style={{
                        border: "1px solid #DDDDDD",
                        textAlign: "right",
                        padding: "8px",
                      }}
                    >
                      &#10003;
                    </td>
                  )}
                  {subService.pricingDriverList?.length > 0 &&
                    subService.pricingDriverList.map((driver, driverIndex) => {
                      const isVariation = driver.driverTypeID === 3;
                      const isSlab = driver.driverTypeID === 4;
                      const isQuantity = driver.driverTypeID === 2;
                      const matchedQuantity = driver.driverValue;
                      const isVisible = driver.driverVisibility === true;

                      const matchedVariation = isVariation
                        ? driver.variation?.find(
                            (item) => item.variationID === driver.variationID,
                          )
                        : null;

                      const matchedSlab = isSlab
                        ? driver.slab?.find(
                            (item) => item.slabID === driver.slabID,
                          )
                        : null;

                      return (
                        <>
                          <tr>
                            {isVisible && (
                              <>
                                <td
                                  key={`driver-${driverIndex}`}
                                  style={{
                                    border: "1px solid #DDDDDD",
                                    textAlign: "left",
                                    padding: "8px",
                                    fontWeight: "normal",
                                  }}
                                >
                                  • {driver.driverName}
                                </td>
                                <td
                                  style={{
                                    border: "1px solid #DDDDDD",
                                    textAlign: "right",
                                    padding: "8px",
                                    fontWeight: "normal",
                                  }}
                                >
                                  {isVariation && matchedVariation
                                    ? matchedVariation.variationName
                                    : isSlab && matchedSlab
                                      ? `${matchedSlab.slabFrom} - ${matchedSlab.slabTo}`
                                      : isQuantity
                                        ? matchedQuantity
                                        : ""}
                                </td>
                              </>
                            )}
                          </tr>
                        </>
                      );
                    })}

                  {props?.selectedPackagesList.length >= 2 ? (
                    props.ProposalObject?.feeTypeId == 1 ? (
                      <td
                        style={{
                          border: "1px solid #DDDDDD",
                          textAlign: "right",
                          padding: "8px",
                        }}
                      >
                        {subService.packageTwoValue === null &&
                        !subService.servicePackageIDs.some(
                          (item) =>
                            item ==
                            props.selectedPackagesList[1]?.servicePackageID,
                        ) ? (
                          <span>&#10007;</span>
                        ) : !subService?.servicePackageIDs.includes(
                            subService.packageTwoID,
                          ) ? (
                          <span>&#10007;</span>
                        ) : (
                          ` ${props.formatValue(
                            subService.packageTwoValue,
                            props.currencyID,
                          )}`
                        )}
                      </td>
                    ) : subService.packageTwoValue !== null &&
                      !subService?.servicePackageIDs.includes(
                        subService.packageTwoID,
                      ) ? (
                      <td
                        style={{
                          border: "1px solid #DDDDDD",
                          textAlign: "right",
                          padding: "8px",
                        }}
                      >
                        &#10007;
                      </td>
                    ) : (
                      <td
                        style={{
                          border: "1px solid #DDDDDD",
                          textAlign: "right",
                          padding: "8px",
                        }}
                      >
                        &#10003;
                      </td>
                    )
                  ) : null}
                  {props?.selectedPackagesList.length === 3 ? (
                    props.ProposalObject?.feeTypeId == 1 ? (
                      <td
                        style={{
                          border: "1px solid #DDDDDD",
                          textAlign: "right",
                          padding: "8px",
                        }}
                      >
                        {subService.packageThreeValue === null &&
                        !subService.servicePackageIDs.some(
                          (item) =>
                            item ==
                            props.selectedPackagesList[2]?.servicePackageID,
                        ) ? (
                          <span>&#10007;</span>
                        ) : !subService?.servicePackageIDs.includes(
                            subService.packageThreeID,
                          ) ? (
                          <span>&#10007;</span>
                        ) : (
                          `${props.formatValue(
                            subService.packageThreeValue,
                            props.currencyID,
                          )}`
                        )}
                      </td>
                    ) : subService.packageThreeValue !== null &&
                      !subService?.servicePackageIDs.includes(
                        subService.packageThreeID,
                      ) ? (
                      <td
                        style={{
                          border: "1px solid #DDDDDD",
                          textAlign: "right",
                          padding: "8px",
                        }}
                      >
                        &#10007;
                      </td>
                    ) : (
                      <td
                        style={{
                          border: "1px solid #DDDDDD",
                          textAlign: "right",
                          padding: "8px",
                        }}
                      >
                        &#10003;
                      </td>
                    )
                  ) : null}
                </tr>
              ))}
            </React.Fragment>
          ))}

        <tr style={{ backgroundColor: "#DCDCDC" }}>
          <td
            style={{
              border: "1px solid #DDDDDD",
              textAlign: "left",
              padding: "8px",
            }}
          >
            If you are happy with this proposal please click Accept to Accept
            the Proposal.
          </td>
          <td
            style={{
              border: "1px solid #DDDDDD",
              textAlign: "right",
              float: "right",
              padding: "8px",
              color: "black",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                width: "100%",
              }}
            >
              <a
                href={AcceptRecurringUrlButton1}
                style={{
                  display: "inline-block",
                  padding: "5px 15px",
                  backgroundColor: "green",
                  color: "white",
                  textDecoration: "none",
                  border: "none",
                  borderRadius: "100px",
                  transition:
                    "background-color 0.3s ease, box-shadow 0.3s ease",
                  whiteSpace: "nowrap",
                  flex: 1,
                  textAlign: "center",
                }}
              >
                Accept
              </a>
            </div>
          </td>
          {props?.selectedPackagesList.length >= 2 ? (
            <td
              style={{
                border: "1px solid #DDDDDD",
                textAlign: "right",
                padding: "8px",
                color: "black",
              }}
            >
              {" "}
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  width: "100%",
                }}
              >
                <a
                  href={AcceptRecurringUrlButton2}
                  style={{
                    display: "inline-block",
                    padding: "5px 15px",
                    backgroundColor: "green",
                    color: "white",
                    textDecoration: "none",
                    border: "none",
                    borderRadius: "100px",
                    transition:
                      "background-color 0.3s ease, box-shadow 0.3s ease",
                    whiteSpace: "nowrap",
                    flex: 1,
                    textAlign: "center",
                  }}
                >
                  Accept
                </a>
              </div>
            </td>
          ) : null}
          {props?.selectedPackagesList.length === 3 ? (
            <td
              style={{
                border: "1px solid #DDDDDD",
                textAlign: "right",
                padding: "8px",
                color: "black",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  width: "100%",
                }}
              >
                {" "}
                <a
                  href={AcceptRecurringUrlButton3}
                  style={{
                    display: "inline-block",
                    padding: "5px 15px",
                    backgroundColor: "green",
                    color: "white",
                    textDecoration: "none",
                    border: "none",
                    borderRadius: "100px",
                    transition:
                      "background-color 0.3s ease, box-shadow 0.3s ease",
                    whiteSpace: "nowrap",
                    flex: 1,
                    textAlign: "center",
                  }}
                >
                  Accept
                </a>
              </div>
            </td>
          ) : null}
        </tr>
        {props.common.enableEL == 0 && (
          <tr style={{ backgroundColor: "#DCDCDC" }}>
            <td
              style={{
                border: "1px solid #DDDDDD",
                textAlign: "left",
                padding: "8px",
              }}
            >
              If you are not happy with this proposal please click Decline to
              Decline the Proposal.
            </td>
            <td
              style={{
                border: "1px solid #DDDDDD",
                textAlign: "right",
                padding: "8px",
                color: "black",
              }}
            >
              {" "}
              <a
                href={DeclineRecurringUrl}
                style={{
                  display: "inline-block",
                  padding: "5px 15px",
                  backgroundColor: "red",
                  color: "white",
                  textDecoration: "none",
                  border: "none",
                  borderRadius: "100px",
                  transition:
                    "background-color 0.3s ease, box-shadow 0.3s ease",
                  whiteSpace: "nowrap",
                }}
              >
                Decline
              </a>
            </td>

            {props?.selectedPackagesList.length >= 2 ? (
              <td
                style={{
                  border: "1px solid #DDDDDD",
                  textAlign: "right",
                  padding: "8px",
                  color: "white",
                }}
              ></td>
            ) : null}
            {props?.selectedPackagesList.length === 3 ? (
              <td
                style={{
                  border: "1px solid #DDDDDD",
                  textAlign: "right",
                  padding: "8px",
                  color: "white",
                }}
              ></td>
            ) : null}
          </tr>
        )}
      </table>
    </div>
  );

  // one-Off Service-Pricing Table Formate For E-mail.
  const OneOffPackagesTable = (
    <div
      style={{
        paddingLeft: "40px",
        paddingRight: "40px",
        fontFamily: "'Times New Roman', Times, serif",
      }}
    >
      <p
        style={{
          fontFamily: "arial, sans-serif",
          color: "#00BFFF",
          fontSize: "20px",
          marginTop: "15px",
        }}
      >
        One-Off Services
      </p>
      <table
        style={{
          fontFamily: "arial, sans-serif",
          borderCollapse: "collapse",
          width: "100%",
          marginTop: "15px",
        }}
      >
        <tr style={{ backgroundColor: "#00BFFF" }}>
          <th
            style={{
              border: "1px solid #DDDDDD",
              textAlign: "left",
              padding: "8px",
              color: "white",
              fontSize: "18px",
            }}
          >
            Services
          </th>
          <th
            style={{
              border: "1px solid #DDDDDD",
              textAlign: "right",
              padding: "8px",
              color: "white",
              fontSize: "18px",
            }}
          ></th>
        </tr>
        {props.moduleName == "Quote" &&
          props.selectedOneOffServiceList?.map((serviceCat, index) => (
            <React.Fragment key={index}>
              <tr style={{ backgroundColor: "#DCDCDC" }}>
                <td
                  style={{
                    border: "1px solid #DDDDDD",
                    textAlign: "left",
                    padding: "8px",
                    fontWeight: "bold",
                    fontSize: "18px",
                  }}
                >
                  {serviceCat.serviceCatName}
                </td>
                <td
                  style={{
                    border: "1px solid #DDDDDD",
                    textAlign: "left",
                    padding: "8px",
                  }}
                ></td>
                {props?.selectedPackagesList.length >= 2 ? (
                  <td
                    style={{
                      border: "1px solid #DDDDDD",
                      textAlign: "left",
                      padding: "8px",
                    }}
                  ></td>
                ) : null}
                {props?.selectedPackagesList.length === 3 ? (
                  <td
                    style={{
                      border: "1px solid #DDDDDD",
                      textAlign: "left",
                      padding: "8px",
                    }}
                  ></td>
                ) : null}
              </tr>
              {serviceCat.servicesList.map((subService, subIndex) => (
                <tr>
                  <td
                    style={{
                      border: "1px solid #DDDDDD",
                      textAlign: "left",
                      padding: "8px",
                    }}
                  >
                    {
                      subService.serviceName
                      // .length > 45 ? (
                      //   subService.serviceName
                      //     .substring(0, 45)
                      //     .toLowerCase()
                      //     .replace(/\b\w/g, (l) => l.toUpperCase()) + "..."
                      // ) : (
                      //   subService.serviceName
                      // )
                    }
                  </td>
                  {props.ProposalObject?.feeTypeId == 1 ? (
                    <td
                      style={{
                        border: "1px solid #DDDDDD",
                        textAlign: "right",
                        padding: "8px",
                      }}
                    >
                      &#10003;
                    </td>
                  ) : (
                    <td
                      style={{
                        border: "1px solid #DDDDDD",
                        textAlign: "right",
                        padding: "8px",
                      }}
                    >
                      &#10003;
                    </td>
                  )}

                  {subService.pricingDriverList?.length > 0 &&
                    subService.pricingDriverList.map((driver, driverIndex) => {
                      const isVariation = driver.driverTypeID === 3;
                      const isSlab = driver.driverTypeID === 4;
                      const isQuantity = driver.driverTypeID === 2;
                      const matchedQuantity = driver.driverValue;
                      const isVisible = driver.driverVisibility === true;

                      const matchedVariation = isVariation
                        ? driver.variation?.find(
                            (item) => item.variationID === driver.variationID,
                          )
                        : null;

                      const matchedSlab = isSlab
                        ? driver.slab?.find(
                            (item) => item.slabID === driver.slabID,
                          )
                        : null;

                      return (
                        <>
                          <tr>
                            {isVisible && (
                              <>
                                <td
                                  key={`driver-${driverIndex}`}
                                  style={{
                                    border: "1px solid #DDDDDD",
                                    textAlign: "left",
                                    padding: "8px",
                                    fontWeight: "normal",
                                  }}
                                >
                                  • {driver.driverName}
                                </td>
                                <td
                                  style={{
                                    border: "1px solid #DDDDDD",
                                    textAlign: "right",
                                    padding: "8px",
                                    fontWeight: "normal",
                                  }}
                                >
                                  {isVariation && matchedVariation
                                    ? matchedVariation.variationName
                                    : isSlab && matchedSlab
                                      ? `${matchedSlab.slabFrom} - ${matchedSlab.slabTo}`
                                      : isQuantity
                                        ? matchedQuantity
                                        : ""}
                                </td>
                              </>
                            )}
                          </tr>
                        </>
                      );
                    })}
                </tr>
              ))}
            </React.Fragment>
          ))}
        {/* <tr style={{ backgroundColor: "#808080" }}>
            <td
              style={{
                border: "1px solid #DDDDDD",
                textAlign: "left",
                padding: "8px",
                color: "white",
              }}
            >
              Net Total
            </td>
            <td
              style={{
                border: "1px solid #DDDDDD",
                textAlign: "right",
                padding: "8px",
                color: "white",
              }}
            >
              {" "}
              {
                totalOnePackageValueOneOff <
                  Number(props.OneOffPricingInfo.packageOneDisCountedTotal) ||
                  (Number(props.OneOffPricingInfo.packageOneDisCount) > 0 &&
                    !props.ProposalObject.DiscountLines)
                  ? props.formatValue(
                    props.OneOffPricingInfo.packageOneDisCountedTotal
                  )
                  : // Number(totalOnePackageValueOneOff)
                  //     .toFixed(2)
                  //     .toString()
                  //     .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  props.formatValue(totalOnePackageValueOneOff)
                // Number(
                //     props.OneOffPricingInfo
                //       .packageOneDisCountedTotal
                //   )
                //     .toFixed(2)
                //     .toString()
                //     .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
            </td>
            {props?.selectedPackagesList.length >= 2 && (
              <td
                style={{
                  border: "1px solid #DDDDDD",
                  textAlign: "right",
                  padding: "8px",
                  color: "white",
                }}
              >
                {" "}
                {
                  totalTwoPackageValueOneOff <
                    Number(props.OneOffPricingInfo.packageTwoDisCountedTotal) ||
                    (Number(props.OneOffPricingInfo.packageTwoDisCount) > 0 &&
                      !props.ProposalObject.DiscountLines)
                    ? props.formatValue(
                      props.OneOffPricingInfo.packageTwoDisCountedTotal
                    )
                    : // Number(totalOnePackageValueOneOff)
                    //     .toFixed(2)
                    //     .toString()
                    //     .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    props.formatValue(totalTwoPackageValueOneOff)
                  // Number(
                  //     props.OneOffPricingInfo
                  //       .packageOneDisCountedTotal
                  //   )
                  //     .toFixed(2)
                  //     .toString()
                  //     .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
              </td>
            )}
            {props?.selectedPackagesList.length === 3 && (
              <td
                style={{
                  border: "1px solid #DDDDDD",
                  textAlign: "right",
                  padding: "8px",
                  color: "white",
                }}
              >
                {" "}
                {
                  totalThreePackageValueOneOff <
                    Number(props.OneOffPricingInfo.packageThreeDisCountedTotal) ||
                    (Number(props.OneOffPricingInfo.packageThreeDisCount) > 0 &&
                      !props.ProposalObject.DiscountLines)
                    ? props.formatValue(
                      props.OneOffPricingInfo.packageThreeDisCountedTotal
                    )
                    : // Number(totalOnePackageValueOneOff)
                    //     .toFixed(2)
                    //     .toString()
                    //     .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    props.formatValue(totalThreePackageValueOneOff)
                  // Number(
                  //     props.OneOffPricingInfo
                  //       .packageOneDisCountedTotal
                  //   )
                  //     .toFixed(2)
                  //     .toString()
                  //     .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
              </td>
            )}
          </tr> */}

        <tr style={{ backgroundColor: "#DCDCDC" }}>
          <td
            style={{
              border: "1px solid #DDDDDD",
              textAlign: "left",
              padding: "8px",
            }}
          >
            If you are happy with this proposal please click Accept to Accept
            the Proposal.
          </td>
          <td
            style={{
              border: "1px solid #DDDDDD",
              textAlign: "right",
              float: "right",
              padding: "8px",
              color: "black",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                width: "100%",
              }}
            >
              {" "}
              <a
                href={AcceptOneOffUrlButton1}
                style={{
                  display: "inline-block",
                  padding: "5px 15px",
                  backgroundColor: "green",
                  color: "white",
                  textDecoration: "none",
                  border: "none",
                  borderRadius: "100px",
                  transition:
                    "background-color 0.3s ease, box-shadow 0.3s ease",
                  whiteSpace: "nowrap",
                  flex: 1,
                  textAlign: "center",
                }}
              >
                Accept
              </a>
            </div>
          </td>
          {props?.selectedPackagesList.length >= 2 ? (
            <td
              style={{
                border: "1px solid #DDDDDD",
                textAlign: "right",
                padding: "8px",
                color: "black",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  width: "100%",
                }}
              >
                <a
                  href={AcceptOneOffUrlButton2}
                  style={{
                    display: "inline-block",
                    padding: "5px 15px",
                    backgroundColor: "green",
                    color: "white",
                    textDecoration: "none",
                    border: "none",
                    borderRadius: "100px",
                    transition:
                      "background-color 0.3s ease, box-shadow 0.3s ease",
                    whiteSpace: "nowrap",
                    flex: 1,
                    textAlign: "center",
                  }}
                >
                  Accept
                </a>
              </div>
            </td>
          ) : null}
          {props?.selectedPackagesList.length === 3 ? (
            <td
              style={{
                border: "1px solid #DDDDDD",
                textAlign: "right",
                padding: "8px",
                color: "black",
              }}
            >
              {" "}
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  width: "100%",
                }}
              >
                <a
                  href={AcceptOneOffUrlButton3}
                  style={{
                    display: "inline-block",
                    padding: "5px 15px",
                    backgroundColor: "green",
                    color: "white",
                    textDecoration: "none",
                    border: "none",
                    borderRadius: "100px",
                    transition:
                      "background-color 0.3s ease, box-shadow 0.3s ease",
                    whiteSpace: "nowrap",
                    flex: 1,
                    textAlign: "center",
                  }}
                >
                  Accept
                </a>
              </div>
            </td>
          ) : null}
        </tr>
        {props.common.enableEL == 0 && (
          <tr style={{ backgroundColor: "#DCDCDC" }}>
            <td
              style={{
                border: "1px solid #DDDDDD",
                textAlign: "left",
                padding: "8px",
              }}
            >
              If you are not happy with this proposal please click Decline to
              Decline the Proposal.
            </td>
            <td
              style={{
                border: "1px solid #DDDDDD",
                textAlign: "right",
                padding: "8px",
                color: "black",
              }}
            >
              {" "}
              <a
                href={DeclineOneOffUrl}
                style={{
                  display: "inline-block",
                  padding: "5px 15px",
                  backgroundColor: "red",
                  color: "white",
                  textDecoration: "none",
                  border: "none",
                  borderRadius: "100px",
                  transition:
                    "background-color 0.3s ease, box-shadow 0.3s ease",
                  whiteSpace: "nowrap",
                }}
              >
                Decline
              </a>
            </td>
            {props?.selectedPackagesList.length >= 2 ? (
              <td
                style={{
                  border: "1px solid #DDDDDD",
                  textAlign: "right",
                  padding: "8px",
                  color: "white",
                }}
              ></td>
            ) : null}
            {props?.selectedPackagesList.length === 3 ? (
              <td
                style={{
                  border: "1px solid #DDDDDD",
                  textAlign: "right",
                  padding: "8px",
                  color: "white",
                }}
              ></td>
            ) : null}
          </tr>
        )}
      </table>
    </div>
  );

  const oneOffTableString = ReactDOMServer.renderToString(OneOffPackagesTable);
  const RecurringTableString = ReactDOMServer.renderToString(
    RecurringPackagesTable,
  );

  useEffect(() => {
    if (
      props.moduleName == "Quote" &&
      props?.ProposalObject?.selectedProposalTypeValue === 4
    ) {
      // Clear old PDF content when navigating to Preview
      props.setProposalObject((prevState) => ({
        ...prevState,
        recurringHtmlContent:
          props.selectedRecurringServiceList.length > 0
            ? RecurringTableString
            : null,
        oneOffHtmlContent:
          props.selectedOneOffServiceList.length > 0 ? oneOffTableString : null,
      }));
    }
  }, [
    props?.ProposalObject,
    props?.selectedOneOffServiceList,
    props?.selectedRecurringServiceList,
  ]);

  useEffect(() => {
    const HeadingValue =
      props.ProposalObject?.moduleName || props.engagementObj?.moduleName;
    setHeading(HeadingValue);
  }, []);
  useEffect(() => {
    GetTemplatePdfListData();
  }, []);

  const toggleLandscape = () => {
    setIsPdfAlreadyGenerated(false);
    setLandscapeMode((prev) => !prev);
  };

  if (MergePdfUrl) {
  }
  const sendDataToBackend = async (
    generatePdfData,
    index,
    email,
    phone,
    fullAddress,
    color,
    BrandLogo,
    fontFamily,
  ) => {
    const postData = {
      userId: common.userKeyID,
      email: email,
      mobile: phone,
      fullAddress: fullAddress,
      webSite: webSite,
      headingforpage: heading,
      genratedPdfData: generatePdfData,
      sequence: index + 1,
      lengthPdf: PdfLength,
      color: color,
      BrandLogo: BrandLogo,
      fontSizeContent: fontSizeContent,
      fontFamily: fontFamily,
      HeaderContent: HeaderContent,
      FooterContent: FooterContent,
      HeaderImage: HeaderImage,
      FooterImage: FooterImage,
      HeaderHeight: HeaderHeight,
      FooterHeight: FooterHeight,
      WatermarkImage: WatermarkImage,
      showSeparatorLines: showSeparatorLines,
      landscapeMode: landscapeMode,
      headerFooterFirstPage: headerFooterFirstPage,
      // headerFooterLastPage: headerFooterLastPage,
      flagForTemplatePdf: flagForTemplatePdf,
      awsPdfHeight: awsPdfHeight,
      awsPdfWidth: awsPdfWidth,
    };

    try {
      const response = await fetch(generatePdfUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // 'X-Aws-Pdf-Path': awsPdfPath,
        },
        body: JSON.stringify(postData),
      });
      const responseData = await response.json();
      // if (responseData.success && responseData.AllPdf && Array.isArray(responseData.AllPdf)) {
      //   const urls = responseData.AllPdf.map(pdf => pdf.url);
      //   setSinglePdf(urls);

      // } else {
      //   console.error('PDF creation and saving failed:', response.message);
      // }
    } catch (error) {
      console.error("Error sending data to backend:", error);
    }
  };

  const GetTemplatePdfListData = async () => {
    setLoader(true);
    // const pageNoList = i - 1;
    try {
      const data = await GetTemplateLookupPDFList({
        OrganisationKeyID: common.organisationKeyID,
        userKeyID: common.userKeyID,
        selectedTemplatePDFKeyIDs: null,
      });
      if (data) {
        if (data?.data?.statusCode === 200) {
          // setLoader(false);
          if (data?.data?.responseData?.data) {
            const TemplateListData = data.data.responseData.data;
            setPdfListCount(0);
            setTemplatePdfList(TemplateListData);
            // setTotalRecords(TemplateListData.length);
          }
        }
      }
    } catch (error) {
      setLoader(false);
      console.log(error);
    }
  };
  // const GetTemplatePdfListData = async () => {
  //   setLoader(true);
  //   // const pageNoList = i - 1;
  //   try {
  //     const data = await GetTemplatePdfList({
  //       pageSize: 30,
  //       pageNo: 0,
  //       SearchKeyword: null,
  //       userKeyID: common.userKeyID || null,
  //       organisationKeyID: common.organisationKeyID || null,
  //       primarySortDirection: null,
  //       PrimarySortColumnName: null,
  //     });
  //     if (data) {
  //       if (data?.data?.statusCode === 200) {
  //         // setLoader(false);
  //         if (data?.data?.responseData?.data) {
  //           const TemplateListData = data.data.responseData.data;
  //           setPdfListCount(0);
  //           setTemplatePdfList(TemplateListData);
  //           // setTotalRecords(TemplateListData.length);
  //         }
  //       }
  //     }
  //   } catch (error) {
  //     setLoader(false);
  //     console.log(error);
  //   }
  // };

  const generateMergePdfUrl = () => {
    if (count == 0) {
      return;
    }
    setLoader(true);
    fetch(mergePdfApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        userId: common.userKeyID,
        moduleName: props.moduleName,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          const pdfUrl = data.s3Url;
          setMergePdfUrl(pdfUrl);
          props.setMergePdfUrl(pdfUrl);
          setLoader(false);
          if (pdfRef.current) {
            pdfRef.current.src = pdfUrl;
          }
          // document.getElementById("pdfViewer").src = pdfUrl;
        } else {
          setLoader(false);
          console.error("Error:", data.message);
        }
      })
      .catch((error) => {
        setLoader(false);
        console.error("Error fetching merged PDF:", error);
      });
  };
  const generatePdf = async () => {
    count = +1;
    setLoader(true);
    if (generatePdfData) {
      try {
        const promises = generatePdfData.map((data, index) =>
          sendDataToBackend(
            data,
            index,
            email,
            phone,
            fullAddress,
            newColorCode,
            BrandLogo,
            fontFamily,
            landscapeMode,
            // flagForTemplatePdf,
            awsPdfHeight,
            awsPdfWidth,
          ),
        );
        await Promise.all(promises);
        // setLoader(false);
        generateMergePdfUrl();
      } catch (error) {
        setLoader(false);
        console.error("Error generating PDFs:", error);
      }
    }
  };
  // useEffect(() => {

  //   if (generatePdfData.length !== 0) {
  //     generatePdf();
  //   }
  // }, [generatePdfData]);
  useEffect(() => {
    if (generatePdfData.length !== 0) {
      if (!isPdfAlreadyGenerated) {
        setIsPdfAlreadyGenerated(true);
        generatePdf();
      }
    }
  }, [generatePdfData, landscapeMode]);

  function getPackageName(id, name) {
    const packages = props.lastPaymentFrequencyAndDiscountedPriceForPreview;
    let packageName = "";

    switch (id) {
      case packages?.PackageOneNetValue?.servicePackageID:
      case packages.PackageTwoNetValue?.servicePackageID:
      case packages?.PackageThreeNetValue?.servicePackageID:
        packageName = name;
        break;
      default:
        return name;
    }

    if (!packageName) return "";
    if (packages?.PackageOneNetValue?.servicePackageID === undefined) {
      return name;
    } else {
      return (
        packageName
          .split(",")
          .map((pkgName) => pkgName)
          // .map((pkgName) =>
          //   pkgName.length > 10 ? pkgName.substring(0, 10) + "..." : pkgName
          // )
          .join(", ")
      );
    }
  }

  //   function setDefaultFontFamily(htmlContent, fontFamily) {
  //     const parser = new DOMParser();
  //     const doc = parser.parseFromString(htmlContent, "text/html");

  //     // Detect browser's default font
  //     const tempElement = document.createElement("div");
  //     document.body.appendChild(tempElement);
  //     const defaultFontFamily = window.getComputedStyle(tempElement).fontFamily.toLowerCase();
  //     document.body.removeChild(tempElement);

  //     const elements = doc.querySelectorAll('*');

  //     elements.forEach((el) => {
  //         const computedFont = window.getComputedStyle(el).fontFamily?.toLowerCase().trim();
  //         const hasInlineFont = el.style.fontFamily?.toLowerCase().trim();

  //         if (
  //             !hasInlineFont ||
  //             computedFont === defaultFontFamily ||
  //             hasInlineFont === 'inherit' ||
  //             hasInlineFont === 'initial' ||
  //             hasInlineFont === 'default'
  //         ) {
  //             el.style.setProperty("font-family", fontFamily, "important");
  //         }
  //     });

  //     return doc.body.innerHTML;
  // }

  // function setDefaultFontFamily(htmlContent, fontFamily) {
  //   if (!fontFamily) return htmlContent;

  //   const parser = new DOMParser();
  //   const doc = parser.parseFromString(htmlContent, "text/html");

  //   const elements = doc.querySelectorAll('*');

  //   elements.forEach((el) => {
  //       // Remove any existing font-family styles
  //       el.style.removeProperty("font-family");

  //       // Apply the new font-family with !important
  //       el.style.setProperty("font-family", fontFamily, "important");
  //   });

  //   return doc.body.innerHTML;
  // }

  // function setDefaultFontFamily(htmlContent, fontFamily) {
  //   if (!fontFamily) return htmlContent;

  //   const parser = new DOMParser();
  //   const doc = parser.parseFromString(htmlContent, "text/html");

  //   const elements = doc.querySelectorAll('*');

  //   elements.forEach((el) => {
  //       // Get existing font-family from inline style
  //       const inlineStyle = el.getAttribute("style") || "";
  //       const hasFontFamily = inlineStyle.match(/font-family:\s*([^;]+)/i);

  //       if (hasFontFamily) {
  //           const existingFont = hasFontFamily[1].toLowerCase();

  //           // If "Roboto" is found, replace it with the new font
  //           if (existingFont.includes("roboto") || existingFont === "") {
  //               el.style.setProperty("font-family", fontFamily, "important");
  //           }
  //       }
  //       else {
  //         // If no font-family exists, apply the new font
  //         el.style.setProperty("font-family", fontFamily, "important");
  //       }
  //   });

  //   return doc.body.innerHTML;
  // }
  function setDefaultFontFamily(htmlContent, fontFamily) {
    if (!fontFamily) return htmlContent;

    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, "text/html");

    const elements = doc.querySelectorAll("*");

    elements.forEach((el) => {
      const inlineStyle = el.getAttribute("style") || "";
      const fontFamilyMatch = inlineStyle.match(/font-family:\s*([^;]*)/i);

      if (fontFamilyMatch) {
        const existingFonts = fontFamilyMatch[1]
          .replace(/['"]/g, "") // Remove quotes
          .split(/\s*,\s*/)
          .map((f) => f.toLowerCase());

        // Check if Roboto is the first font in the list
        const hasRobotoPrimary = existingFonts[0] === "roboto";

        // Check if no font family is actually set (empty value)
        const isEmptyFontFamily = existingFonts[0] === "";

        if (hasRobotoPrimary || isEmptyFontFamily) {
          el.style.setProperty("font-family", fontFamily, "important");
        }
      } else {
        // If no font-family exists at all, apply the new font
        el.style.setProperty("font-family", fontFamily, "important");
      }
    });

    return doc.body.innerHTML;
  }
  function changeSpanColor(htmlContent, newColorCode) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, "text/html");
    const elements = doc.getElementsByClassName("OrgnewColorCode");

    // Check if any elements are found with the class name 'OrgnewColorCode'
    if (elements.length > 0) {
      // Loop through each element and change its color
      for (let i = 0; i < elements.length; i++) {
        elements[i].style.color = newColorCode;
      }
    } else {
      return htmlContent;
    }

    return doc.body.innerHTML;
  }

  useEffect(() => {
    if (props.templateElementList) {
      const pdfDataArray = [];
      let currentArray = [];
      let TermAndConditionAddedOrNot = props.templateElementList.some(
        (item) => item.templateElementTypeID === 11,
      );
      // Flag to ensure only one pricing table is added
      let prevElementType = null;
      props.templateElementList.forEach((element) => {
        switch (element.templateElementTypeID) {
          case ElementType.HEADING:
            if (
              prevElementType !== ElementType.PAGE_BREAK &&
              prevElementType !== ElementType.AWS_PDF_LINK
            ) {
              currentArray.push({
                textbox: `<div style="padding-left: 40px; padding-top: 40px; padding-right: 40px; font-size: ${fontSizeHeading}; color:${newColorCode}; font-family:${fontFamily};">${element.headings} <br>
                         <hr style="padding-left: 40px; padding-right: 40px; color: black;"></hr></div>`,
              });
            } else {
              pdfDataArray.push(currentArray);
              currentArray = [
                {
                  textbox: `<div style="padding-left: 40px; padding-right: 40px; color:${newColorCode}; font-size: ${fontSizeHeading}; font-family:${fontFamily};">${element.headings} <br
                >
                <hr style="padding-left: 40px; padding-right: 40px; color: black;"></hr></div>`,
                },
              ];
            }
            break;
          case ElementType.TEXT_BLOCK:
            const appliedFontContent = setDefaultFontFamily(
              element.htmlContent,
              fontFamily,
            );
            if (
              prevElementType !== ElementType.PAGE_BREAK &&
              prevElementType !== ElementType.AWS_PDF_LINK
            ) {
              currentArray.push({
                // textbox: ` ${imgTag}<div style="padding-left: 40px; padding-right: 40px;">${replaceUrlInHtml(element.htmlContent)}</div>`,
                textbox: ` ${imgTag}<div style="padding-left: 40px; padding-right: 40px;">${replaceUrlInHtml(
                  appliedFontContent,
                )}</div>`,
              });
            } else {
              pdfDataArray.push(currentArray);
              currentArray = [
                {
                  // textbox: ` ${imgTag}<div style="padding-left: 40px; padding-right: 40px;">${replaceUrlInHtml(element.htmlContent)}</div>`,
                  textbox: ` ${imgTag}<div style="padding-left: 40px; padding-right: 40px;">${replaceUrlInHtml(
                    appliedFontContent,
                  )}</div>`,
                },
              ];
            }
            break;
          case ElementType.SIGNATURE_BLOCK:
            // Add RowNo to contract signatories
            const contractSignatoryRowNo = props.contractSignatoriesList.map(
              (item, index) => ({
                ...item,
                RowNo: index + 1,
              }),
            );

            const contractSignatoryRowNoForOfficer =
              props.organisationData?.officersList !== undefined &&
              props.organisationData?.officersList
                .filter((item) => item.isAuthorisedSignatory)
                .map((item, index) => ({
                  ...item,
                  RowNo: contractSignatoryRowNo.length + index + 1,
                }));

            // Always include contractSignatories
            let rightSignatureList = contractSignatoryRowNo.filter(
              (x) => x.signaturePositionID === 1,
            );
            let leftSignatureList = contractSignatoryRowNo.filter(
              (x) => x.signaturePositionID === 2,
            );

            // Include officers based on image URL and map to opposite side
            const signatureImageUrl =
              props.organisationData?.otherInformation?.[0]?.signatureImageUrl;

            if (
              !signatureImageUrl &&
              Array.isArray(contractSignatoryRowNoForOfficer)
            ) {
              // Officers go to the *opposite* side of each signaturePositionID
              contractSignatoryRowNoForOfficer.forEach((officer) => {
                // If most contract signatories are on the right, place officers on the left, and vice versa
                if (rightSignatureList.length <= leftSignatureList.length) {
                  rightSignatureList.push(officer); // balance to right
                } else {
                  leftSignatureList.push(officer); // balance to left
                }
              });
            }

            let htmlContentForSignatories = "";
            let loopCount = Math.max(
              rightSignatureList.length,
              leftSignatureList.length,
            );

            let orgSignatureInserted = false;

            htmlContentForSignatories += `<div id='SignatoryBlock' style='width: 95%; padding-left: 0px; padding-right: 0px; margin-top: 50px; page-break-inside: avoid; break-inside: avoid;'>`;
            htmlContentForSignatories +=
              "<table style='width: 100%; border-collapse: collapse;'>";

            for (let i = 0; i < loopCount; i++) {
              htmlContentForSignatories += `<tr style='width:100%; vertical-align: bottom;'>`;

              // --- LEFT SIGNATURE CELL ---
              const left = leftSignatureList?.[i];
              htmlContentForSignatories += `<td id="left_${
                i + 1
              }" style="padding-top: 60px; width: 50%; font-family: ${fontFamily}; font-size: 0.2in; text-align: left; vertical-align: bottom;">`;

              if (left) {
                htmlContentForSignatories += `
                  <span style="color: white;"><^${left.RowNo}_</span><div style="display: inline-block;">${left.firstName} ${left.lastName}</div><span style="color: white;">^></span>`;
              } else if (!orgSignatureInserted && signatureImageUrl) {
                const org = props.organisationData.otherInformation[0];
                htmlContentForSignatories += `
                <div style="margin-left: 60px;">
                  <div style="height:40px; width:130px"><img src="${
                    org.signatureImageUrl
                  }" alt="Signature" style="height:100%; width:100%;"></div>
                  <div style="margin-top: 10px;">${
                    org.signatoryName || ""
                  }</div>
                  </div>`;
                orgSignatureInserted = true;
              }

              htmlContentForSignatories += `</td>`;

              // --- RIGHT SIGNATURE CELL ---
              const right = rightSignatureList?.[i];
              htmlContentForSignatories += `<td id="right_${
                i + 1
              }" style="padding-top: 60px; width: 50%; font-family: ${fontFamily}; font-size: 0.2in; text-align: right; vertical-align: bottom;">`;

              if (right) {
                htmlContentForSignatories += `
                  <span style="color: white;"><^${right.RowNo}_</span><div style="display: inline-block;">${right.firstName} ${right.lastName}</div><span style="color: white;">^></span>`;
              } else if (!orgSignatureInserted && signatureImageUrl) {
                const org = props.organisationData.otherInformation[0];
                htmlContentForSignatories += `
                <div style="margin-left: 60px;">
                  <div style="height:40px; width:130px"><img src="${
                    org.signatureImageUrl
                  }" alt="Signature" style="height:100%; width:100%;"></div>
                  <div style="margin-top: 10px;">${
                    org.signatoryName || ""
                  }</div>
                  </div>`;
                orgSignatureInserted = true;
              }

              htmlContentForSignatories += `</td>`;

              htmlContentForSignatories += `</tr>`;
            }

            htmlContentForSignatories += "</table>";
            htmlContentForSignatories += "</div>";
            if (
              prevElementType !== ElementType.PAGE_BREAK &&
              prevElementType !== ElementType.AWS_PDF_LINK
            ) {
              currentArray.push({
                textbox: `${htmlContentForSignatories}`,
              });
            } else {
              pdfDataArray.push(currentArray);
              currentArray = [
                {
                  textbox: `${htmlContentForSignatories}`,
                },
              ];
            }

            break;
          case ElementType.SERVICE_DESCRIPTION:
            if (
              prevElementType !== ElementType.PAGE_BREAK &&
              prevElementType !== ElementType.AWS_PDF_LINK
            ) {
              currentArray.push({
                textbox: `${imgTag}<div style="padding-left: 40px; padding-right: 40px;">
                ${
                  props?.selectedRecurringServiceList.length !== 0
                    ? `<p style="font-family:${fontFamily};font-size: ${fontSizeHeading};color: ${newColorCode}; font-weight: bold;">
                     Ongoing/Recurring Services
                    </p>`
                    : ""
                }
                   ${props?.selectedRecurringServiceList
                     .map(
                       (serviceCat) => `
                      <div>
                          <p style="color: black; font-weight: bold;font-family:${fontFamily}; font-size: ${fontSizeHeading};">
                              ${serviceCat.serviceCatName}
                          </p>
                          <hr style="color: gray; margin-top: -15px;">
                          ${serviceCat.servicesList
                            .map(
                              (subService) => `
                              <p style=" color:black;font-family:${fontFamily}; font-size: ${fontSizeContent};">
                                  ${subService.serviceName}
                              </p>
                              <p style=" color:black;">
                                ${
                                  subService.serviceDescription === null ||
                                  subService.serviceDescription === undefined ||
                                  subService.serviceDescription === ""
                                    ? ""
                                    : subService.serviceDescription
                                }
                            </p>
                          `,
                            )
                            .join("")}
                      </div>
                  `,
                     )
                     .join("")}
                  
                 ${
                   props?.selectedOneOffServiceList.length !== 0
                     ? `<p style="font-family:${fontFamily}; color: ${newColorCode};font-size: ${fontSizeHeading}; font-weight: bold;">
                          One-Off/Ad hoc Services
                        </p>`
                     : ""
                 }
                   ${props?.selectedOneOffServiceList
                     .map(
                       (serviceCat) => `
                      <div >
                          <p style=" color: black; font-family:${fontFamily}; font-size: ${fontSizeHeading}; font-weight: bold;">
                              ${serviceCat.serviceCatName}
                          </p>
                          <hr style="color: gray; margin-top: -15px;">
                          ${serviceCat.servicesList
                            .map(
                              (subService) => `
                             <p style=" color:black; font-family:${fontFamily}; font-size: ${fontSizeContent};">
                                  ${subService.serviceName}
                              </p>
                              <p style=" color:black;">
                                ${
                                  subService.serviceDescription === null ||
                                  subService.serviceDescription === undefined ||
                                  subService.serviceDescription === ""
                                    ? ""
                                    : subService.serviceDescription
                                }
                            </p>
                          `,
                            )
                            .join("")}
                      </div>
                  `,
                     )
                     .join("")}
                </div>
                `,
              });
            } else {
              pdfDataArray.push(currentArray);
              currentArray = [
                {
                  textbox: `
                ${imgTag}
                <div style="padding-left: 40px; padding-right: 40px;">
              
                ${
                  props?.selectedRecurringServiceList.length !== 0
                    ? `<p style="font-family:${fontFamily};font-size: ${fontSizeHeading};color: ${newColorCode}; font-weight: bold;">
                     Ongoing/Recurring Services
                    </p>`
                    : ""
                }
              ${props?.selectedRecurringServiceList
                .map(
                  (serviceCat) => `
                    <div>
                        <p style=" color: black;font-family:${fontFamily}; font-size: ${fontSizeHeading}; font-weight: bold;">
                            ${serviceCat.serviceCatName}
                        </p>
                        <hr style="color: gray; margin-top: -15px;">
                        ${serviceCat.servicesList
                          .map(
                            (subService) => `
                            <p style=" color:black;font-family:${fontFamily}; font-size: ${fontSizeContent};">
                                ${subService.serviceName}
                            </p>
                            <p style=" color:black;">
                               ${
                                 subService.serviceDescription === null ||
                                 subService.serviceDescription === undefined ||
                                 subService.serviceDescription === ""
                                   ? ""
                                   : subService.serviceDescription
                               }
                            </p>
                        `,
                          )
                          .join("")}
                    </div>
                `,
                )
                .join("")}
                       ${
                         props?.selectedOneOffServiceList.length !== 0
                           ? `<p style="font-family:${fontFamily}; color: ${newColorCode};font-size: ${fontSizeHeading}; font-weight: bold;">
                          One-Off/Ad hoc Services
                        </p>`
                           : ""
                       }
                ${props?.selectedOneOffServiceList
                  .map(
                    (serviceCat) => `
                      <div>
                          <p style=" color: black;font-family:${fontFamily}; font-size: ${fontSizeHeading};font-weight: bold;">
                              ${serviceCat.serviceCatName}
                          </p>
                          <hr style="color: gray; margin-top: -15px;">
                          ${serviceCat.servicesList
                            .map(
                              (subService) => `
                              <p style="color:black;font-family:${fontFamily}; font-size: ${fontSizeContent};">
                                  ${subService.serviceName}
                              </p>
                              <p style=" color:black;">
                                ${
                                  subService.serviceDescription === null ||
                                  subService.serviceDescription === undefined ||
                                  subService.serviceDescription === ""
                                    ? ""
                                    : subService.serviceDescription
                                }
                            </p>
                          `,
                            )
                            .join("")}
                      </div>
                  `,
                  )
                  .join("")}
                </div>
                `,
                },
              ];
            }
            break;
          case ElementType.First_Page:
            if (props?.isDefaultFirstPage) {
              const coloredHtmlContent = changeSpanColor(
                element.htmlContent,
                newColorCode,
              );
              if (
                prevElementType !== ElementType.PAGE_BREAK &&
                prevElementType !== ElementType.AWS_PDF_LINK
              ) {
                pdfDataArray.push(currentArray);
                currentArray = [
                  {
                    textbox: `
      <div data-first-page="true" style="
        page-break-after: always;
      ">
        ${coloredHtmlContent}
      </div>
    `,
                  },
                ];
              } else {
                pdfDataArray.push(currentArray);
                currentArray = [
                  {
                    textbox: `
      <div data-first-page="true" style=" 
        page-break-after: always;
      ">
        ${coloredHtmlContent}
      </div>
    `,
                  },
                ];
              }
            }
            break;
          case ElementType.STATEMENT_OF_FACTS:
            if (
              prevElementType !== ElementType.PAGE_BREAK &&
              prevElementType !== ElementType.AWS_PDF_LINK
            ) {
              if (
                props.moduleName === "Quote" &&
                props?.ProposalObject?.selectedProposalTypeValue === 2
              ) {
                currentArray.push({
                  textbox: `
                    ${imgTag}
                    <div style="padding-left: 40px; padding-right: 40px; font-family:${fontFamily};">
                    ${props.StatementOfFact.map(
                      (SelectedPackage) =>
                        `<div style="font-family:${fontFamily};">
                          <p style="font-family:${fontFamily}; color: ${newColorCode}; font-size: ${fontSizeHeading}; font-weight: bold;">
                            Package Name:  ${SelectedPackage.servicePackageName}
                          </p>
                          <hr style="color: gray; margin-top: -15px;">
                           ${
                             SelectedPackage.reccuring.length !== 0
                               ? `<p style="font-family:${fontFamily};font-size: ${fontSizeHeading};color: ${newColorCode}; font-weight: bold;">
                           Ongoing/Recurring Services
                          </p>`
                               : ""
                           }
                          ${SelectedPackage.reccuring
                            .map(
                              (SelectedServiceCat) =>
                                ` <p style="font-family:${fontFamily}; color: black; font-size: ${fontSizeHeading}; font-weight: bold;">
                              ${SelectedServiceCat.serviceCategoryName}
                          </p>
                         ${SelectedServiceCat.servicesList
                           .map(
                             (subService) => `
                              <p style="font-family:${fontFamily}; color:black; font-size: ${fontSizeContent}; ">
                                  ${subService.serviceName}
                              </p>
                              ${(subService?.gpdList)
                                .filter(
                                  (pricingDriver) =>
                                    pricingDriver.driverTypeID !== 1,
                                )
                                .map(
                                  (pricingDriver) => `
                                <li style="font-family:${fontFamily}; color:black; font-size: ${fontSizeContent}; margin-top:5px;">
                                ${pricingDriver.driverName}: 
                                   <strong> ${
                                     pricingDriver.driverTypeID === 2
                                       ? props.formatValueWithoutCurrencySymbol_v1(
                                           pricingDriver.value,
                                           pricingDriver.quantity?.[0]
                                             ?.quantityDecimalPlaces,
                                         )
                                       : pricingDriver.driverTypeID === 3
                                         ? pricingDriver.variationName
                                         : pricingDriver.driverTypeID === 4
                                           ? pricingDriver.slabTypeID === 2
                                             ? props.formatValueWithoutCurrencySymbol(
                                                 pricingDriver.value,
                                               )
                                             : pricingDriver.slabFrom +
                                               "-" +
                                               pricingDriver.slabTo
                                           : pricingDriver.driverTypeID === 5
                                             ? pricingDriver?.enteredText
                                             : pricingDriver.driverTypeID === 6
                                               ? pricingDriver?.enteredDate
                                               : //  && pricingDriver?.enteredDateFormat
                                                 //     ? (() => {
                                                 //       const dateObj = convertAndParseDate(
                                                 //         pricingDriver.enteredDate,
                                                 //         pricingDriver.enteredDateFormat,
                                                 //         pricingDriver.date?.[0]?.dateFormat
                                                 //       );
                                                 //       return dateObj && isValid(dateObj)
                                                 //         ? format(dateObj, pricingDriver.date?.[0]?.dateFormat)
                                                 //         : "";
                                                 //     })()
                                                 //     : ""
                                                 ""
                                   }</strong>
                            </li>
                              `,
                                )
                                .join("")}
                          `,
                           )
                           .join("")}
                          `,
                            )
                            .join(" ")}
                             ${
                               SelectedPackage.oneOff.length !== 0
                                 ? `<p style="font-family:${fontFamily};font-size: ${fontSizeHeading};color: ${newColorCode}; font-weight: bold;">
                            One-Off/Ad hoc Services
                          </p>`
                                 : ""
                             }
                          ${SelectedPackage.oneOff
                            .map(
                              (SelectedServiceCat) =>
                                ` <p style="font-family:${fontFamily}; color: black; font-size: ${fontSizeHeading}; font-weight: bold;">
                              ${SelectedServiceCat.serviceCategoryName}
                          </p>
                         ${SelectedServiceCat.servicesList
                           .map(
                             (subService) => `
                              <p style="font-family:${fontFamily}; color:black; font-size: ${fontSizeContent}; ">
                                  ${subService.serviceName}
                              </p>
                              ${(subService?.gpdList)
                                .filter(
                                  (pricingDriver) =>
                                    pricingDriver.driverTypeID !== 1,
                                )
                                .map(
                                  (pricingDriver) => `
                                <li style="font-family:${fontFamily}; color:black; font-size: ${fontSizeContent}; margin-top:5px;">
                                ${pricingDriver.driverName}: 
                                    <strong> ${
                                      pricingDriver.driverTypeID === 2
                                        ? props.formatValueWithoutCurrencySymbol_v1(
                                            pricingDriver.value,
                                            pricingDriver.quantity?.[0]
                                              ?.quantityDecimalPlaces,
                                          )
                                        : pricingDriver.driverTypeID === 3
                                          ? pricingDriver.variationName
                                          : pricingDriver.driverTypeID === 4
                                            ? pricingDriver.slabTypeID === 2
                                              ? props.formatValueWithoutCurrencySymbol(
                                                  pricingDriver.value,
                                                )
                                              : pricingDriver.slabFrom +
                                                "-" +
                                                pricingDriver.slabTo
                                            : pricingDriver.driverTypeID === 5
                                              ? pricingDriver?.enteredText
                                              : pricingDriver.driverTypeID === 6
                                                ? pricingDriver?.enteredDate
                                                : //  && pricingDriver?.enteredDateFormat
                                                  //     ? (() => {
                                                  //       const dateObj = convertAndParseDate(
                                                  //         pricingDriver.enteredDate,
                                                  //         pricingDriver.enteredDateFormat,
                                                  //         pricingDriver.date?.[0]?.dateFormat
                                                  //       );
                                                  //       return dateObj && isValid(dateObj)
                                                  //         ? format(dateObj, pricingDriver.date?.[0]?.dateFormat)
                                                  //         : "";
                                                  //     })()
                                                  //     : ""
                                                  ""
                                    }</strong>
                            </li>
                              `,
                                )
                                .join("")}
                          `,
                           )
                           .join("")}
                          `,
                            )
                            .join(" ")}

                            ${
                              SelectedPackage.additionalInformationList
                                ?.length > 0
                                ? `<p style="font-family:${fontFamily}; color: ${newColorCode}; font-size: ${fontSizeHeading}; font-weight: bold;">
        Additional Information
    </p>
    <hr style="color: gray; margin-top: -15px;" />` +
                                  SelectedPackage.additionalInformationList
                                    .filter((item) => item.driverTypeID !== 1)
                                    .map(
                                      (serviceCat) => `
        <div>
            <p style="font-family:${fontFamily}; color:black; font-size: ${fontSizeContent};">
                ${serviceCat.driverName}: ${
                  serviceCat.driverTypeID === 4
                    ? serviceCat.slabTypeID === 2
                      ? `<strong>${props.formatValueWithoutCurrencySymbol(
                          serviceCat.value,
                        )}</strong>`
                      : `<strong>${props.formatValueWithoutCurrencySymbol(
                          serviceCat.slabFrom,
                        )}-${props.formatValueWithoutCurrencySymbol(
                          serviceCat.slabTo,
                        )}</strong>`
                    : serviceCat.driverTypeID === 3
                      ? `<strong>${serviceCat.variationName}</strong>`
                      : serviceCat.driverTypeID === 5
                        ? (`<strong>${serviceCat?.enteredText}</strong>` ?? "")
                        : serviceCat.driverTypeID === 6
                          ? `<strong>${serviceCat?.enteredDate}</strong>`
                          : `${
                              serviceCat.driverName
                            }: <strong>${props.formatValueWithoutCurrencySymbol(
                              serviceCat.value,
                            )}</strong>`
                }
            </p>
        </div>
    `,
                                    )
                                    .join("")
                                : ""
                            }

                        </div>`,
                    ).join(" ")}`,
                });
              } else {
                currentArray.push({
                  textbox: `${imgTag}<div style="padding-left: 40px; padding-right: 40px; font-family:${fontFamily};">
                  ${
                    props?.selectedRecurringServiceList.length !== 0
                      ? `<p style="font-family:${fontFamily};font-size: ${fontSizeHeading};color: ${newColorCode}; font-weight: bold;">
                       Ongoing/Recurring Services
                      </p>`
                      : ""
                  }
                  ${props?.selectedRecurringServiceList
                    .map(
                      (serviceCat) => `
                       <div style="font-family:${fontFamily};">
                          <p style="font-family:${fontFamily}; color: black; font-size: ${fontSizeHeading}; font-weight: bold;">
                              ${serviceCat.serviceCatName}
                          </p>
                          <hr style="color: gray; margin-top: -15px;">
                          ${serviceCat.servicesList
                            .map(
                              (subService) => `
                              <p style="font-family:${fontFamily}; color:black; font-size: ${fontSizeContent}; ">
                                  ${subService.serviceName}
                              </p>
                              ${(
                                subService?.pricingDriverList ||
                                subService?.gpdList ||
                                []
                              )
                                .filter((pricingDriver) =>
                                  subService?.pricingDriverList !== undefined
                                    ? pricingDriver.driverVisibility === true
                                    : true,
                                )
                                .filter(
                                  (pricingDriver) =>
                                    pricingDriver.driverTypeID !== 1,
                                )
                                .map(
                                  (pricingDriver) => `
                                <li style="font-family:${fontFamily}; color:black; font-size: ${fontSizeContent}; margin-top:5px;">
                                ${pricingDriver.driverName}: 
                                    <strong> ${
                                      pricingDriver.driverTypeID === 2
                                        ? props.formatValueWithoutCurrencySymbol_v1(
                                            pricingDriver.driverValue,
                                            getDecimalPlaces(pricingDriver),
                                          )
                                        : // Number(pricingDriver.driverValue).toFixed(2).toString().replace(
                                          //   /\B(?=(\d{3})+(?!\d))/g,
                                          //   ","
                                          // )
                                          pricingDriver.driverTypeID === 3
                                          ? subService?.pricingDriverList ==
                                            undefined
                                            ? pricingDriver.variationName
                                            : pricingDriver.variation.find(
                                                (item) => item.isDefault,
                                              ).variationName
                                          : pricingDriver.driverTypeID === 4
                                            ? subService?.pricingDriverList ==
                                              undefined
                                              ? pricingDriver.slabTypeID === 2
                                                ? props.formatValueWithoutCurrencySymbol_v1(
                                                    pricingDriver.driverValue,
                                                    getDecimalPlaces(
                                                      pricingDriver,
                                                    ),
                                                  )
                                                : props.formatValueWithoutCurrencySymbol_v1(
                                                    pricingDriver.driverValue,
                                                    getDecimalPlaces(
                                                      pricingDriver,
                                                    ),
                                                  ) -
                                                  props.formatValueWithoutCurrencySymbol_v1(
                                                    pricingDriver.driverValue,
                                                    getDecimalPlaces(
                                                      pricingDriver,
                                                    ),
                                                  )
                                              : pricingDriver.slab.find(
                                                    (item) => item.isDefault,
                                                  ).slabTypeID === 2
                                                ? Number(
                                                    pricingDriver.slab.find(
                                                      (item) => item.isDefault,
                                                    ).slabValue,
                                                  )
                                                    .toFixed(2)
                                                    .toString()
                                                    .replace(
                                                      /\B(?=(\d{3})+(?!\d))/g,
                                                      ",",
                                                    )
                                                : Number(
                                                    pricingDriver.slab.find(
                                                      (item) => item.isDefault,
                                                    ).slabFrom,
                                                  )
                                                    .toFixed(
                                                      getDecimalPlaces(
                                                        pricingDriver,
                                                      ),
                                                    )
                                                    .toString()
                                                    .replace(
                                                      /\B(?=(\d{3})+(?!\d))/g,
                                                      ",",
                                                    ) +
                                                  "-" +
                                                  Number(
                                                    pricingDriver.slab.find(
                                                      (item) => item.isDefault,
                                                    ).slabTo,
                                                  )
                                                    .toFixed(
                                                      getDecimalPlaces(
                                                        pricingDriver,
                                                      ),
                                                    )
                                                    .toString()
                                                    .replace(
                                                      /\B(?=(\d{3})+(?!\d))/g,
                                                      ",",
                                                    )
                                            : pricingDriver.driverTypeID === 5
                                              ? (pricingDriver?.enteredText ??
                                                "")
                                              : pricingDriver.driverTypeID === 6
                                                ? pricingDriver.enteredDate
                                                : // ? pricingDriver.date && pricingDriver.date.length > 0
                                                  //   ? (() => {
                                                  //     const inputFormat = pricingDriver.enteredDateFormat;
                                                  //     const outputFormat = pricingDriver.date[0]?.dateFormat;
                                                  //     const dateObj = convertAndParseDate(pricingDriver.enteredDate, inputFormat, outputFormat);
                                                  //     return dateObj && isValid(dateObj) ? format(dateObj, outputFormat) : "";
                                                  //   })()
                                                  //   : pricingDriver.enteredDate
                                                  // : ""
                                                  ""
                                    }</strong>
                            </li>
                              `,
                                )
                                .join("")}
                          `,
                            )
                            .join("")}
                      </div>
                  `,
                    )
                    .join("")}
                    ${
                      props?.selectedOneOffServiceList.length !== 0
                        ? `<p style="font-family:${fontFamily}; color: ${newColorCode};font-size: ${fontSizeHeading}; font-weight: bold;">
                          One-Off/Ad hoc Services
                        </p>`
                        : ""
                    }
                  ${props?.selectedOneOffServiceList
                    .map(
                      (serviceCat) => `
                         <div style="font-family:${fontFamily};">
                            <p style="font-family: ${fontFamily}; color: black; font-size: ${fontSizeHeading}; font-weight: bold;">
                                ${serviceCat.serviceCatName}
                            </p>
                            <hr style="color: gray; margin-top: -15px;">
                            ${serviceCat.servicesList
                              .map(
                                (subService) => `
                             <p style="font-family: ${fontFamily}; color:black; font-size: ${fontSizeContent};">
                                  ${subService.serviceName}
                              </p>
                              ${(
                                subService?.pricingDriverList ||
                                subService?.gpdList ||
                                []
                              )
                                .filter((pricingDriver) =>
                                  subService?.pricingDriverList !== undefined
                                    ? pricingDriver.driverVisibility === true
                                    : true,
                                )
                                .filter(
                                  (pricingDriver) =>
                                    pricingDriver.driverTypeID !== 1,
                                )
                                .map(
                                  (pricingDriver) => `
                                <li style="font-family:${fontFamily}; color:black; font-size: ${fontSizeContent}; margin-top:5px;">
                                ${pricingDriver.driverName}: 
                                    <strong> ${
                                      pricingDriver.driverTypeID === 2
                                        ? props.formatValueWithoutCurrencySymbol_v1(
                                            pricingDriver.driverValue,
                                            getDecimalPlaces(pricingDriver),
                                          )
                                        : // Number(pricingDriver.driverValue).toFixed(2).toString().replace(
                                          //   /\B(?=(\d{3})+(?!\d))/g,
                                          //   ","
                                          // )
                                          pricingDriver.driverTypeID === 3
                                          ? subService?.pricingDriverList ==
                                            undefined
                                            ? pricingDriver.variationName
                                            : pricingDriver.variation.find(
                                                (item) => item.isDefault,
                                              ).variationName
                                          : pricingDriver.driverTypeID === 4
                                            ? subService?.pricingDriverList ==
                                              undefined
                                              ? pricingDriver.slabTypeID === 2
                                                ? props.formatValueWithoutCurrencySymbol_v1(
                                                    pricingDriver.driverValue,
                                                    getDecimalPlaces(
                                                      pricingDriver,
                                                    ),
                                                  )
                                                : props.formatValueWithoutCurrencySymbol_v1(
                                                    pricingDriver.slabFrom,
                                                    getDecimalPlaces(
                                                      pricingDriver,
                                                    ),
                                                  ) +
                                                  "-" +
                                                  props.formatValueWithoutCurrencySymbol_v1(
                                                    pricingDriver.slabTo,
                                                    getDecimalPlaces(
                                                      pricingDriver,
                                                    ),
                                                  )
                                              : pricingDriver.slab?.find(
                                                    (item) => item.isDefault,
                                                  )?.slabTypeID === 2
                                                ? Number(
                                                    pricingDriver?.slab?.find(
                                                      (item) => item.isDefault,
                                                    )?.slabValue ??
                                                      pricingDriver.driverValue,
                                                  )
                                                    .toFixed(2)
                                                    .toString()
                                                    .replace(
                                                      /\B(?=(\d{3})+(?!\d))/g,
                                                      ",",
                                                    )
                                                : Number(
                                                    pricingDriver.slab?.find(
                                                      (item) => item.isDefault,
                                                    )?.slabFrom ??
                                                      pricingDriver.driverValue,
                                                  )
                                                    .toFixed(
                                                      pricingDriver?.slab?.[0]
                                                        ?.decimalPlaces ?? 2,
                                                    )
                                                    .toString()
                                                    .replace(
                                                      /\B(?=(\d{3})+(?!\d))/g,
                                                      ",",
                                                    ) +
                                                  "-" +
                                                  Number(
                                                    pricingDriver.slab?.find(
                                                      (item) => item.isDefault,
                                                    )?.slabTo ??
                                                      pricingDriver.driverValue,
                                                  )
                                                    .toFixed(
                                                      pricingDriver?.slab?.[0]
                                                        ?.decimalPlaces ?? 2,
                                                    )
                                                    .toString()
                                                    .replace(
                                                      /\B(?=(\d{3})+(?!\d))/g,
                                                      ",",
                                                    )
                                            : pricingDriver.driverTypeID === 5
                                              ? (pricingDriver?.enteredText ??
                                                "")
                                              : pricingDriver.driverTypeID === 6
                                                ? pricingDriver?.enteredDate
                                                : //  && pricingDriver?.enteredDateFormat
                                                  //   ? (() => {
                                                  //     const dateObj = convertAndParseDate(
                                                  //       pricingDriver.enteredDate,
                                                  //       pricingDriver.enteredDateFormat,
                                                  //       pricingDriver.date?.[0]?.dateFormat
                                                  //     );
                                                  //     return dateObj && isValid(dateObj)
                                                  //       ? format(dateObj, pricingDriver.date?.[0]?.dateFormat)
                                                  //       : "";
                                                  //   })()
                                                  //   : "" ?? ""
                                                  ""
                                    }</strong>
                            </li>
                              `,
                                )
                                .join("")}
                            `,
                              )
                              .join("")}
                        </div>
                    `,
                    )
                    .join("")}
                      
               
                      ${
                        props?.additionalInformationList?.filter(
                          (item) => item.driverTypeID !== 1,
                        ).length >
                        0 >
                        0
                          ? `<p style="font-family:${fontFamily}; color: ${newColorCode}; font-size: ${fontSizeHeading}; font-weight: bold;">
          Additional Information
      </p><hr style="color: gray; margin-top: -15px;" ></hr>` +
                            props.additionalInformationList
                              .map(
                                (serviceCat) => `
          <div>
              ${
                serviceCat.driverTypeID === 2 &&
                serviceCat.variation === null &&
                serviceCat.slab === null
                  ? `<p style="font-family:${fontFamily}; color:black; font-size: ${fontSizeContent};">
                          ${
                            serviceCat.driverName
                          }:  <strong> ${props.formatValueWithoutCurrencySymbol(
                            serviceCat.driverValue,
                          )} </strong > 
                      </p>`
                  : serviceCat.driverTypeID === 5 ||
                      serviceCat.driverTypeID === 6
                    ? `<p style="font-family:${fontFamily}; color:black; font-size: ${fontSizeContent};">
      ${serviceCat.driverName}: <strong>${
        serviceCat.driverTypeID === 5
          ? (serviceCat.enteredText ?? "")
          : (serviceCat.enteredDate ?? "")
      }</strong>
    </p>`
                    : (serviceCat.driverTypeID === 4
                        ? serviceCat.slab
                        : serviceCat.driverTypeID === 3
                          ? serviceCat.variation
                          : []
                      )
                        .filter((item) => item.isDefault)
                        .map(
                          (subService) => `
  <p style="font-family:${fontFamily}; color:black; font-size: ${fontSizeContent};">
      ${serviceCat.driverName}: ${
        serviceCat.driverTypeID === 4
          ? subService.slabTypeID === 2
            ? `<strong>${props.formatValueWithoutCurrencySymbol(
                subService.slabValue,
              )}</strong>`
            : `<strong>${props.formatValueWithoutCurrencySymbol(
                subService.slabFrom,
              )}-${props.formatValueWithoutCurrencySymbol(
                subService.slabTo,
              )}</strong>`
          : `<strong>${subService.variationName}</strong>`
      }
  </p>
  `,
                        )
                        .join("")
              }
          </div>
      `,
                              )
                              .join("")
                          : ""
                      }
  
                  ${
                    props?.quoteAdditionalInfoGlobalPricingDriver?.filter(
                      (item) => item.driverTypeID !== 1,
                    ).length > 0
                      ? `<p style="font-family:${fontFamily}; color: ${newColorCode}; font-size: ${fontSizeHeading}; font-weight: bold;">
        Additional Information
    </p>
    <hr style="color: gray; margin-top: -15px;" />` +
                        props.quoteAdditionalInfoGlobalPricingDriver
                          .map(
                            (serviceCat) => `
        <div>
          ${
            serviceCat.driverTypeID === 2
              ? `<p style="font-family:${fontFamily}; color:black; font-size: ${fontSizeContent};">
                ${
                  serviceCat.driverName
                }: <strong>${props.formatValueWithoutCurrencySymbol(
                  serviceCat.driverValue,
                )}</strong> 
            </p>`
              : serviceCat.driverTypeID === 3
                ? `<p style="font-family:${fontFamily}; color:black; font-size: ${fontSizeContent};">
                ${serviceCat.driverName}: <strong>${serviceCat.variationName}</strong>
            </p>`
                : serviceCat.driverTypeID === 5
                  ? `<p style="font-family:${fontFamily}; color:black; font-size: ${fontSizeContent};">
                ${serviceCat.driverName}: <strong>${serviceCat?.enteredText}</strong>
            </p>`
                  : serviceCat.driverTypeID === 6
                    ? `<p style="font-family:${fontFamily}; color:black; font-size: ${fontSizeContent};">
                ${serviceCat.driverName}: <strong>${serviceCat?.enteredDate}</strong>
            </p>`
                    : serviceCat.driverTypeID === 4
                      ? `<p style="font-family:${fontFamily}; color:black; font-size: ${fontSizeContent};">
                ${serviceCat.driverName}: ${
                  serviceCat.slabTypeID == 2
                    ? `<strong>${props.formatValueWithoutCurrencySymbol(
                        serviceCat.driverValue,
                      )} <strong>`
                    : `<strong>${props.formatValueWithoutCurrencySymbol(
                        serviceCat.slabFrom,
                      )}</strong> - <strong>${props.formatValueWithoutCurrencySymbol(
                        serviceCat.slabTo,
                      )}</strong>`
                }
            </p>`
                      : ""
          }
        </div>`,
                          )
                          .join("")
                      : ""
                  }
  
                  </div>`,
                });
              }
            } else {
              pdfDataArray.push(currentArray);
              if (
                props.moduleName === "Quote" &&
                props?.ProposalObject?.selectedProposalTypeValue === 2
              ) {
                currentArray.push({
                  textbox: `
                    ${imgTag}
                    <div style="padding-left: 40px; padding-right: 40px; font-family:${fontFamily};">
                    ${props.StatementOfFact.map(
                      (SelectedPackage) =>
                        `<div style="font-family:${fontFamily};">
                          <p style="font-family:${fontFamily}; color: ${newColorCode}; font-size: ${fontSizeHeading}; font-weight: bold;">
                            Package Name:  ${SelectedPackage.servicePackageName}
                          </p>
                          <hr style="color: gray; margin-top: -15px;">
                              ${
                                SelectedPackage.reccuring.length !== 0
                                  ? `<p style="font-family:${fontFamily};font-size: ${fontSizeHeading};color: ${newColorCode}; font-weight: bold;">
                           Ongoing/Recurring Services
                          </p>`
                                  : ""
                              }

                          ${SelectedPackage.reccuring
                            .map(
                              (SelectedServiceCat) =>
                                ` <p style="font-family:${fontFamily}; color: black; font-size: ${fontSizeHeading}; font-weight: bold;">
                              ${SelectedServiceCat.serviceCategoryName}
                          </p>
                         ${SelectedServiceCat.servicesList
                           .map(
                             (subService) => `
                              <p style="font-family:${fontFamily}; color:black; font-size: ${fontSizeContent}; ">
                                  ${subService.serviceName}
                              </p>
                              ${(subService?.gpdList)
                                .filter(
                                  (pricingDriver) =>
                                    pricingDriver.driverTypeID !== 1,
                                )
                                .map(
                                  (pricingDriver) => `
                                <li style="font-family:${fontFamily}; color:black; font-size: ${fontSizeContent}; margin-top:5px;">
                                ${pricingDriver.driverName}: 
                                    <strong> ${
                                      pricingDriver.driverTypeID === 2
                                        ? props.formatValueWithoutCurrencySymbol_v1(
                                            pricingDriver.value,
                                            pricingDriver.quantity?.[0]
                                              ?.quantityDecimalPlaces,
                                          )
                                        : pricingDriver.driverTypeID === 3
                                          ? pricingDriver.variationName
                                          : pricingDriver.driverTypeID === 4
                                            ? pricingDriver.slabTypeID === 2
                                              ? props.formatValueWithoutCurrencySymbol(
                                                  pricingDriver.value,
                                                )
                                              : pricingDriver.slabFrom +
                                                "-" +
                                                pricingDriver.slabTo
                                            : ""
                                    }</strong>
                            </li>
                              `,
                                )
                                .join("")}
                          `,
                           )
                           .join("")}
                          `,
                            )
                            .join(" ")}
                             ${
                               SelectedPackage.oneOff.length !== 0
                                 ? `<p style="font-family:${fontFamily}; color: ${newColorCode};font-size: ${fontSizeHeading}; font-weight: bold;">
                            One-Off/Ad hoc Services
                          </p>`
                                 : ""
                             }

                          ${SelectedPackage.oneOff
                            .map(
                              (SelectedServiceCat) =>
                                ` <p style="font-family:${fontFamily}; color: black; font-size: ${fontSizeHeading}; font-weight: bold;">
                              ${SelectedServiceCat.serviceCategoryName}
                          </p>
                         ${SelectedServiceCat.servicesList
                           .map(
                             (subService) => `
                              <p style="font-family:${fontFamily}; color:black; font-size: ${fontSizeContent}; ">
                                  ${subService.serviceName}
                              </p>
                              ${(subService?.gpdList)
                                .filter(
                                  (pricingDriver) =>
                                    pricingDriver.driverTypeID !== 1,
                                )
                                .map(
                                  (pricingDriver) => `
                                <li style="font-family:${fontFamily}; color:black; font-size: ${fontSizeContent}; margin-top:5px;">
                                ${pricingDriver.driverName}: 
                                    <strong> ${
                                      pricingDriver.driverTypeID === 2
                                        ? props.formatValueWithoutCurrencySymbol_v1(
                                            pricingDriver.driverValue,
                                            pricingDriver.quantity?.[0]
                                              ?.quantityDecimalPlaces,
                                          )
                                        : pricingDriver.driverTypeID === 3
                                          ? pricingDriver.variationName
                                          : pricingDriver.driverTypeID === 4
                                            ? pricingDriver.slabTypeID === 2
                                              ? props.formatValueWithoutCurrencySymbol(
                                                  pricingDriver.value,
                                                )
                                              : pricingDriver.slabFrom +
                                                "-" +
                                                pricingDriver.slabTo
                                            : ""
                                    }</strong>
                            </li>
                              `,
                                )
                                .join("")}
                          `,
                           )
                           .join("")}
                          `,
                            )
                            .join(" ")}
                    
                            ${
                              SelectedPackage.additionalInformationList
                                ?.length > 0
                                ? `<p style="font-family:${fontFamily}; color: ${newColorCode}; font-size: ${fontSizeHeading}; font-weight: bold;">
        Additional Information
    </p>
    <hr style="color: gray; margin-top: -15px;" />` +
                                  SelectedPackage.additionalInformationList
                                    .filter((item) => item.driverTypeID !== 1)
                                    .map(
                                      (serviceCat) => `
        <div>
            <p style="font-family:${fontFamily}; color:black; font-size: ${fontSizeContent};">
                ${serviceCat.driverName}: ${
                  serviceCat.driverTypeID === 4
                    ? serviceCat.slabTypeID === 2
                      ? `<strong>${props.formatValueWithoutCurrencySymbol(
                          serviceCat.value,
                        )}</strong>`
                      : `<strong>${props.formatValueWithoutCurrencySymbol(
                          serviceCat.slabFrom,
                        )}-${props.formatValueWithoutCurrencySymbol(
                          serviceCat.slabTo,
                        )}</strong>`
                    : serviceCat.driverTypeID === 3
                      ? `<strong>${serviceCat.variationName}</strong>`
                      : serviceCat.driverTypID === 5
                        ? `<strong>${serviceCat.enteredText}</strong>`
                        : serviceCat.driverTypID === 6
                          ? `<strong>${serviceCat.enteredDate}</strong>`
                          : `${
                              serviceCat.driverName
                            }: <strong>${props.formatValueWithoutCurrencySymbol(
                              serviceCat.value,
                            )}</strong>`
                }
            </p>
        </div>
    `,
                                    )
                                    .join("")
                                : ""
                            }

                        </div>`,
                    ).join(" ")}`,
                });
              } else {
                currentArray = [
                  {
                    textbox: `${imgTag}<div style="padding-left: 40px; padding-right: 40px; font-family:${fontFamily}">
                       ${
                         props?.selectedRecurringServiceList.length !== 0
                           ? `<p style="font-family:${fontFamily};font-size: ${fontSizeHeading};color: ${newColorCode}; font-weight: bold;">
                           Ongoing/Recurring Services
                          </p>`
                           : ""
                       }
                    ${props?.selectedRecurringServiceList
                      .map(
                        (serviceCat) => `
                      <div>
                          <p style="font-family:${fontFamily}; color: black; font-size: ${fontSizeHeading}; font-weight: bold;">
                              ${serviceCat.serviceCatName}
                          </p>
                          <hr style="color: gray; margin-top: -15px;">
                          ${serviceCat.servicesList
                            .map(
                              (subService) => `
                             <p style="font-family:${fontFamily}; color:black; font-size: ${fontSizeContent}; ">
                                ${subService.serviceName}
                            </p>
                            ${(
                              subService?.pricingDriverList ||
                              subService?.gpdList ||
                              []
                            )
                              .filter((pricingDriver) =>
                                subService?.pricingDriverList !== undefined
                                  ? pricingDriver.driverVisibility === true
                                  : true,
                              )
                              .filter(
                                (pricingDriver) =>
                                  pricingDriver.driverTypeID !== 1,
                              )
                              .map(
                                (pricingDriver) => `
                              <li style="font-family:${fontFamily}; color:black; font-size: ${fontSizeContent}; margin-top:5px;">
                              ${pricingDriver.driverName}: 
                                  <strong> ${
                                    pricingDriver.driverTypeID === 2
                                      ? props.formatValueWithoutCurrencySymbol_v1(
                                          pricingDriver.driverValue,
                                          pricingDriver.quantity?.[0]
                                            ?.quantityDecimalPlaces,
                                        )
                                      : // Number(pricingDriver.driverValue).toFixed(2).toString().replace(
                                        //   /\B(?=(\d{3})+(?!\d))/g,
                                        //   ","
                                        // )
                                        pricingDriver.driverTypeID === 3
                                        ? subService?.pricingDriverList ==
                                          undefined
                                          ? pricingDriver.variationName
                                          : pricingDriver.variation.find(
                                              (item) => item.isDefault,
                                            ).variationName
                                        : pricingDriver.driverTypeID === 4
                                          ? subService?.pricingDriverList ==
                                            undefined
                                            ? pricingDriver.slabTypeID === 2
                                              ? props.formatValueWithoutCurrencySymbol_v1(
                                                  pricingDriver.driverValue,
                                                  getDecimalPlaces(
                                                    pricingDriver,
                                                  ),
                                                )
                                              : props.formatValueWithoutCurrencySymbol_v1(
                                                  pricingDriver.slabFrom,
                                                  getDecimalPlaces(
                                                    pricingDriver,
                                                  ),
                                                ) +
                                                "-" +
                                                props.formatValueWithoutCurrencySymbol_v1(
                                                  pricingDriver.slabTo,
                                                  getDecimalPlaces(
                                                    pricingDriver,
                                                  ),
                                                )
                                            : pricingDriver.slab?.find(
                                                  (item) => item.isDefault,
                                                )?.slabTypeID === 2
                                              ? Number(
                                                  pricingDriver?.slab?.find(
                                                    (item) => item.isDefault,
                                                  )?.slabValue ??
                                                    pricingDriver.driverValue,
                                                )
                                                  .toFixed(2)
                                                  .toString()
                                                  .replace(
                                                    /\B(?=(\d{3})+(?!\d))/g,
                                                    ",",
                                                  )
                                              : Number(
                                                  pricingDriver.slab?.find(
                                                    (item) => item.isDefault,
                                                  )?.slabFrom ??
                                                    pricingDriver.driverValue,
                                                )
                                                  .toFixed(
                                                    pricingDriver?.slab?.[0]
                                                      ?.decimalPlaces ?? 2,
                                                  )
                                                  .toString()
                                                  .replace(
                                                    /\B(?=(\d{3})+(?!\d))/g,
                                                    ",",
                                                  ) +
                                                "-" +
                                                Number(
                                                  pricingDriver.slab?.find(
                                                    (item) => item.isDefault,
                                                  )?.slabTo ??
                                                    pricingDriver.driverValue,
                                                )
                                                  .toFixed(
                                                    pricingDriver?.slab?.[0]
                                                      ?.decimalPlaces ?? 2,
                                                  )
                                                  .toString()
                                                  .replace(
                                                    /\B(?=(\d{3})+(?!\d))/g,
                                                    ",",
                                                  )
                                          : pricingDriver.driverTypeID === 5
                                            ? (pricingDriver?.enteredText ?? "")
                                            : pricingDriver.driverTypeID === 6
                                              ? pricingDriver?.enteredDate
                                              : //  && pricingDriver?.enteredDateFormat
                                                //   ? (() => {
                                                //     const dateObj = convertAndParseDate(
                                                //       pricingDriver.enteredDate,
                                                //       pricingDriver.enteredDateFormat,
                                                //       pricingDriver.date?.[0]?.dateFormat
                                                //     );
                                                //     return dateObj && isValid(dateObj)
                                                //       ? format(dateObj, pricingDriver.date?.[0]?.dateFormat)
                                                //       : "";
                                                //   })()
                                                //   : "" ?? ""
                                                ""
                                  }</strong>
                          </li>
                            `,
                              )
                              .join("")}
                          `,
                            )
                            .join("")}
                      </div>
                  `,
                      )
                      .join("")}
                      ${
                        props?.selectedOneOffServiceList.length !== 0
                          ? `<p style="font-family:${fontFamily}; color: ${newColorCode};font-size: ${fontSizeHeading}; font-weight: bold;">
                            One-Off/Ad hoc Services
                          </p>`
                          : ""
                      }
                  ${props?.selectedOneOffServiceList
                    .map(
                      (serviceCat) => `
                        <div>
                            <p style="font-family:${fontFamily}; color: black; font-size: ${fontSizeHeading}; font-weight: bold;">
                                ${serviceCat.serviceCatName}
                            </p>
                            <hr style="color: gray; margin-top: -15px;">
                            ${serviceCat.servicesList
                              .map(
                                (subService) => `
                                <p style="font-family:${fontFamily}; color:black; font-size: ${fontSizeContent}; ">
                                ${subService.serviceName}
                            </p>
                            ${(
                              subService?.pricingDriverList ||
                              subService?.gpdList ||
                              []
                            )
                              .filter((pricingDriver) =>
                                subService?.pricingDriverList !== undefined
                                  ? pricingDriver.driverVisibility === true
                                  : true,
                              )
                              .filter(
                                (pricingDriver) =>
                                  pricingDriver.driverTypeID !== 1,
                              )
                              .map(
                                (pricingDriver) => `
                              <li style="font-family:${fontFamily}; color:black; font-size: ${fontSizeContent}; margin-top:5px;">
                              ${pricingDriver.driverName}: 
                                  <strong> ${
                                    pricingDriver.driverTypeID === 2
                                      ? props.formatValueWithoutCurrencySymbol(
                                          pricingDriver.driverValue,
                                        )
                                      : // Number(pricingDriver.driverValue).toFixed(2).toString().replace(
                                        //   /\B(?=(\d{3})+(?!\d))/g,
                                        //   ","
                                        // )
                                        pricingDriver.driverTypeID === 3
                                        ? subService?.pricingDriverList ==
                                          undefined
                                          ? pricingDriver.variationName
                                          : pricingDriver.variation.find(
                                              (item) => item.isDefault,
                                            ).variationName
                                        : pricingDriver.driverTypeID === 4
                                          ? subService?.pricingDriverList ==
                                            undefined
                                            ? pricingDriver.slabTypeID === 2
                                              ? props.formatValueWithoutCurrencySymbol(
                                                  pricingDriver.driverValue,
                                                )
                                              : props.formatValueWithoutCurrencySymbol(
                                                  pricingDriver.slabFrom,
                                                ) -
                                                props.formatValueWithoutCurrencySymbol(
                                                  pricingDriver.slabTo,
                                                )
                                            : pricingDriver.slab.find(
                                                  (item) => item.isDefault,
                                                ).slabTypeID === 2
                                              ? Number(
                                                  pricingDriver.slab.find(
                                                    (item) => item.isDefault,
                                                  ).slabValue,
                                                )
                                                  .toFixed(2)
                                                  .toString()
                                                  .replace(
                                                    /\B(?=(\d{3})+(?!\d))/g,
                                                    ",",
                                                  )
                                              : Number(
                                                  pricingDriver.slab.find(
                                                    (item) => item.isDefault,
                                                  ).slabFrom,
                                                )
                                                  .toFixed(2)
                                                  .toString()
                                                  .replace(
                                                    /\B(?=(\d{3})+(?!\d))/g,
                                                    ",",
                                                  ) +
                                                "-" +
                                                Number(
                                                  pricingDriver.slab.find(
                                                    (item) => item.isDefault,
                                                  ).slabTo,
                                                )
                                                  .toFixed(2)
                                                  .toString()
                                                  .replace(
                                                    /\B(?=(\d{3})+(?!\d))/g,
                                                    ",",
                                                  )
                                          : pricingDriver.driverTypeID === 5
                                            ? (pricingDriver?.enteredText ?? "")
                                            : pricingDriver.driverTypeID === 6
                                              ? pricingDriver?.enteredDate
                                              : ""
                                  }</strong>
                          </li>
                            `,
                              )
                              .join("")}
                            `,
                              )
                              .join("")}
                        </div>
                    `,
                    )
                    .join("")}

                          ${
                            props?.additionalInformationList?.filter(
                              (item) => item.driverTypeID !== 1,
                            ).length > 0
                              ? `<p style="font-family:${fontFamily}; color: ${newColorCode}; font-size: ${fontSizeHeading}; font-weight: bold;">
        Additional Information
    </p><hr style="color: gray; margin-top: -15px;" ></hr>` +
                                props.additionalInformationList
                                  .map(
                                    (serviceCat) => `
        <div>
            ${
              serviceCat.driverTypeID === 2 &&
              serviceCat.variation === null &&
              serviceCat.slab === null
                ? `<p style="font-family:${fontFamily}; color:black; font-size: ${fontSizeContent};">
                        ${
                          serviceCat.driverName
                        }:  <strong> ${props.formatValueWithoutCurrencySymbol(
                          serviceCat.driverValue,
                        )} </strong > 
                    </p>`
                : serviceCat.driverTypeID === 5 || serviceCat.driverTypeID === 6
                  ? `<p style="font-family:${fontFamily}; color:black; font-size: ${fontSizeContent};">
      ${serviceCat.driverName}: <strong>${
        serviceCat.driverTypeID === 5
          ? (serviceCat.enteredText ?? "")
          : (serviceCat.enteredDate ?? "")
      }</strong>
    </p>`
                  : (serviceCat.driverTypeID === 4
                      ? serviceCat.slab
                      : serviceCat.driverTypeID === 3
                        ? serviceCat.variation
                        : []
                    )
                      .filter((item) => item.isDefault)
                      .map(
                        (subService) => `
<p style="font-family:${fontFamily}; color:black; font-size: ${fontSizeContent};">
    ${serviceCat.driverName}: ${
      serviceCat.driverTypeID === 4
        ? subService.slabTypeID === 2
          ? `<strong>${props.formatValueWithoutCurrencySymbol(
              subService.slabValue,
            )}</strong>`
          : `<strong>${props.formatValueWithoutCurrencySymbol(
              subService.slabFrom,
            )}-${props.formatValueWithoutCurrencySymbol(
              subService.slabTo,
            )}</strong>`
        : `<strong>${subService.variationName}</strong>`
    }
</p>
`,
                      )
                      .join("")
            }
        </div>
    `,
                                  )
                                  .join("")
                              : ""
                          }

                    ${
                      props?.quoteAdditionalInfoGlobalPricingDriver?.filter(
                        (item) => item.driverTypeID !== 1,
                      ).length > 0
                        ? `<p style="font-family:${fontFamily}; color: ${newColorCode}; font-size: ${fontSizeHeading}; font-weight: bold;">
      Additional Information
  </p>
  <hr style="color: gray; margin-top: -15px;" />` +
                          props.quoteAdditionalInfoGlobalPricingDriver
                            .map(
                              (serviceCat) => `
      <div>
        ${
          serviceCat.driverTypeID === 2
            ? `<p style="font-family:${fontFamily}; color:black; font-size: ${fontSizeContent};">
              ${
                serviceCat.driverName
              }: <strong>${props.formatValueWithoutCurrencySymbol(
                serviceCat.driverValue,
              )}</strong> 
          </p>`
            : serviceCat.driverTypeID === 3
              ? `<p style="font-family:${fontFamily}; color:black; font-size: ${fontSizeContent};">
              ${serviceCat.driverName}: <strong>${serviceCat.variationName}</strong>
          </p>`
              : serviceCat.driverTypeID === 4
                ? `<p style="font-family:${fontFamily}; color:black; font-size: ${fontSizeContent};">
                ${serviceCat.driverName}: ${
                  serviceCat.slabTypeID == 2
                    ? `<strong>${props.formatValueWithoutCurrencySymbol(
                        serviceCat.driverValue,
                      )} <strong>`
                    : `<strong>${props.formatValueWithoutCurrencySymbol(
                        serviceCat.slabFrom,
                      )}</strong> - <strong>${props.formatValueWithoutCurrencySymbol(
                        serviceCat.slabTo,
                      )}</strong>`
                }
          </p>`
                : ""
        }
      </div>`,
                            )
                            .join("")
                        : ""
                    }
                  </div>`,
                  },
                ];
              }
            }
            break;
          case ElementType.SERVICE_PRICING_TABLE:
            // Append the table for selectedRecurringServiceList
            if (
              prevElementType === ElementType.PAGE_BREAK ||
              prevElementType === ElementType.AWS_PDF_LINK
            ) {
              pdfDataArray.push(currentArray);
              currentArray = [];
            }
            if (props?.servicePackageName?.length > 0) {
              currentArray.push({
                table: `<div style="padding-left: 40px; padding-right: 40px; color:${newColorCode}; font-size: 30px;">Package : ${props?.servicePackageName} </div>`,
              });
            }
            if (
              props?.selectedPackages?.length > 0 &&
              props?.selectedPackages !== null
            ) {
              if (props.selectedRecurringServiceList.length > 0) {
                currentArray.push({
                  table: `
                    <div style="padding-left: 40px; padding-right: 40px; font-family:${fontFamily}; page-break-inside: avoid; break-inside: avoid;">
                    
                    <p style="font-family:${fontFamily}; color: ${newColorCode}; font-size: 20px; margin-top: 15px;"> Recurring Fees (${getPaymentFrequencyLabel()})</p>
                      <table style="font-family:${fontFamily}; border-collapse: collapse; width: 100%; margin-top: -15px;">
                        <tr style="background-color:${newColorCode};">
                          <th style="border: 1px solid #dddddd; text-align: left; padding: 8px; color: white; font-size: 18px;">Services</th>
                          ${props?.selectedPackagesList
                            ?.map(
                              (selectedPackagesData) => `
                          <th style="border: 1px solid #dddddd; text-align: right; padding: 8px; color: white; font-size: 18px;">${getPackageName(
                            selectedPackagesData.servicePackageID,
                            selectedPackagesData.servicePackageName,
                          )}</th>
                          `,
                            )
                            .join("")}
                         
                        </tr>
                        ${props.selectedRecurringServiceList
                          .map(
                            (serviceCat) => `
                                                    <tr style="background-color: #DCDCDC;">
                            <td style="border: 1px solid #dddddd; text-align: left; padding: 8px; font-weight: bold; font-size: 18px;">${
                              serviceCat.serviceCatName
                            }</td>
                            <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;"></td>
                            ${
                              props?.selectedPackages.length >= 2
                                ? `<td style="border: 1px solid #dddddd; text-align: left; padding: 8px;"></td>`
                                : ` `
                            }
                            ${
                              props?.selectedPackages.length === 3
                                ? `<td style="border: 1px solid #dddddd; text-align: left; padding: 8px;"></td>`
                                : ` `
                            }
                            
                          </tr>
                          ${serviceCat.servicesList
                            .map(
                              (subService) => `

                             
                            <tr>
                              <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">${
                                subService.serviceName
                              }</td>
                                ${
                                  props?.feeTypeId == 1
                                    ? `<td style="border: 1px solid #DDDDDD; text-align: right; padding: 8px;"> ${
                                        subService.packageOneValue !== undefined
                                          ? (subService.packageOneValue === 0 ||
                                              subService.packageOneValue ===
                                                null) &&
                                            !subService.servicePackageIDs.some(
                                              (item) =>
                                                item ==
                                                props.selectedPackagesList[0]
                                                  ?.servicePackageID,
                                            )
                                            ? `<span>&#10007;</span>`
                                            : !subService?.servicePackageIDs.includes(
                                                  subService.packageOneID,
                                                )
                                              ? `<span>&#10007;</span>`
                                              : `${props.formatValue(
                                                  subService.packageOneValue,
                                                  props.currencyID,
                                                )}`
                                          : props.formatValue(
                                              subService.price,
                                              props.currencyID,
                                            )
                                      }</td>
                            `
                                    : `${
                                        subService.packageOneValue == undefined
                                          ? Number(
                                              subService.packageOneValue,
                                            ) == 0
                                            ? `<td style="border: 1px solid #DDDDDD; text-align: right; padding: 8px;">&#10007;</td>`
                                            : `<td style="border: 1px solid #DDDDDD; text-align: right; padding: 8px;">&#10003;</td>`
                                          : Number(
                                                subService.packageOneValue,
                                              ) !== null &&
                                              !subService?.servicePackageIDs.includes(
                                                subService.packageOneID,
                                              )
                                            ? `<td style="border: 1px solid #DDDDDD; text-align: right; padding: 8px;">&#10007;</td>`
                                            : `<td style="border: 1px solid #DDDDDD; text-align: right; padding: 8px;">&#10003;</td>`
                                      }
                            `
                                }
                             
                              ${
                                props?.selectedPackages.length >= 2
                                  ? `
                                  ${
                                    props?.feeTypeId == 1
                                      ? `<td style="border: 1px solid #DDDDDD; text-align: right; padding: 8px;">${
                                          subService.packageTwoValue !==
                                          undefined
                                            ? (subService.packageTwoValue ===
                                                0 ||
                                                subService.packageTwoValue ===
                                                  null) &&
                                              !subService.servicePackageIDs.some(
                                                (item) =>
                                                  item ==
                                                  props.selectedPackagesList[1]
                                                    ?.servicePackageID,
                                              )
                                              ? `<span>&#10007;</span>`
                                              : !subService?.servicePackageIDs.includes(
                                                    subService.packageTwoID,
                                                  )
                                                ? `<span>&#10007;</span>`
                                                : `${props.formatValue(
                                                    subService.packageTwoValue,
                                                    props.currencyID,
                                                  )}`
                                            : props.formatValue(
                                                subService.price,
                                                props.currencyID,
                                              )
                                        }</td>
                              `
                                      : `${
                                          subService.packageTwoValue ==
                                          undefined
                                            ? Number(
                                                subService.packageTwoValue,
                                              ) == 0
                                              ? `<td style="border: 1px solid #DDDDDD; text-align: right; padding: 8px;">&#10007;</td>`
                                              : `<td style="border: 1px solid #DDDDDD; text-align: right; padding: 8px;">&#10003;</td>`
                                            : Number(
                                                  subService.packageTwoValue,
                                                ) !== null &&
                                                !subService?.servicePackageIDs.includes(
                                                  subService.packageTwoID,
                                                )
                                              ? `<td style="border: 1px solid #DDDDDD; text-align: right; padding: 8px;">&#10007;</td>`
                                              : `<td style="border: 1px solid #DDDDDD; text-align: right; padding: 8px;">&#10003;</td>`
                                        }
                              `
                                  }
                                  `
                                  : ` `
                              }
                              ${
                                props?.selectedPackages.length === 3
                                  ? `
                                  ${
                                    props?.feeTypeId == 1
                                      ? `<td style="border: 1px solid #DDDDDD; text-align: right; padding: 8px;">${
                                          subService.packageThreeValue !==
                                          undefined
                                            ? (subService.packageThreeValue ===
                                                0 ||
                                                subService.packageThreeValue ===
                                                  null) &&
                                              !subService.servicePackageIDs.some(
                                                (item) =>
                                                  item ==
                                                  props.selectedPackagesList[2]
                                                    ?.servicePackageID,
                                              )
                                              ? `<span>&#10007;</span>`
                                              : !subService?.servicePackageIDs.includes(
                                                    subService.packageThreeID,
                                                  )
                                                ? `<span>&#10007;</span>`
                                                : `${props.formatValue(
                                                    subService.packageThreeValue,
                                                    props.currencyID,
                                                  )}`
                                            : props.formatValue(
                                                subService.price,
                                                props.currencyID,
                                              )
                                        }</td>
                              `
                                      : `${
                                          subService.packageThreeValue ==
                                          undefined
                                            ? Number(
                                                subService.packageThreeValue,
                                              ) == 0
                                              ? `<td style="border: 1px solid #DDDDDD; text-align: right; padding: 8px;">&#10007;</td>`
                                              : `<td style="border: 1px solid #DDDDDD; text-align: right; padding: 8px;">&#10003;</td>`
                                            : Number(
                                                  subService.packageThreeValue,
                                                ) !== null &&
                                                !subService?.servicePackageIDs.includes(
                                                  subService.packageThreeID,
                                                )
                                              ? `<td style="border: 1px solid #DDDDDD; text-align: right; padding: 8px;">&#10007;</td>`
                                              : `<td style="border: 1px solid #DDDDDD; text-align: right; padding: 8px;">&#10003;</td>`
                                        }
                              `
                                  }
                                  
                                  `
                                  : ` `
                              }
                            </tr>`,
                            )
                            .join("")}
                        `,
                          )
                          .join("")}
                        <tr style="background-color:#808080;">                         
                        <td style="border: 1px solid #dddddd; text-align: left; padding: 8px; color: white;">Net Total</td>
                        <td style="border: 1px solid #dddddd; text-align: right; padding: 8px; color: white;">   ${
                          Number(
                            props.RecurringPricingInfo.packageOneNetTotal,
                          ) <
                            Number(
                              props.RecurringPricingInfo
                                .packageOneDisCountedTotal,
                            ) ||
                          (Number(
                            props.RecurringPricingInfo.packageOneDisCount,
                          ) > 0 &&
                            !props.DiscountLines)
                            ? props.formatValue(
                                props.RecurringPricingInfo
                                  .packageOneDisCountedTotal,
                                props.currencyID,
                              )
                            : props.formatValue(
                                props.RecurringPricingInfo.packageOneNetTotal,
                                props.currencyID,
                              )
                        }</td >
                          
                           ${
                             props?.selectedPackages.length >= 2
                               ? `  <td style="border: 1px solid #dddddd; text-align: right; padding: 8px; color: white;">  
                      ${
                        Number(props.RecurringPricingInfo.packageTwoNetTotal) <
                          Number(
                            props.RecurringPricingInfo
                              .packageTwoDisCountedTotal,
                          ) ||
                        (Number(props.RecurringPricingInfo.packageTwoDisCount) >
                          0 &&
                          !props.DiscountLines)
                          ? props.formatValue(
                              props.RecurringPricingInfo
                                .packageTwoDisCountedTotal,
                              props.currencyID,
                            )
                          : props.formatValue(
                              props.RecurringPricingInfo.packageTwoNetTotal,
                              props.currencyID,
                            )
                      }</td>`
                               : ``
                           }
                           ${
                             props?.selectedPackages.length === 3
                               ? ` <td style="border: 1px solid #dddddd; text-align: right; padding: 8px; color: white;">
                          ${
                            Number(
                              props.RecurringPricingInfo.packageThreeNetTotal,
                            ) <
                              Number(
                                props.RecurringPricingInfo
                                  .packageThreeDisCountedTotal,
                              ) ||
                            (Number(
                              props.RecurringPricingInfo.packageThreeDisCount,
                            ) > 0 &&
                              !props.DiscountLines)
                              ? props.formatValue(
                                  props.RecurringPricingInfo
                                    .packageThreeDisCountedTotal,
                                  props.currencyID,
                                )
                              : props.formatValue(
                                  props.RecurringPricingInfo
                                    .packageThreeNetTotal,
                                  props.currencyID,
                                )
                          }</td>`
                               : ` `
                           }
                        ${
                          (Number(
                            props.RecurringPricingInfo.packageThreeDisCount,
                          ) > 0 ||
                            Number(
                              props.RecurringPricingInfo.packageOneDisCount,
                            ) > 0 ||
                            Number(
                              props.RecurringPricingInfo.packageTwoDisCount,
                            ) > 0) &&
                          props?.DiscountLines
                            ? `
         <tr style="background-color: #DCDCDC";>
            <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;color: black;">
              Discount
            </td>
             <td style="border: 1px solid #dddddd; text-align: right; padding: 8px;color: black;">
              (-)    
              ${props.formatValue(
                props.RecurringPricingInfo.packageOneDisCount,
                props.currencyID,
              )}
            </td>
            ${
              props?.selectedPackagesList?.length >= 2
                ? `
               <td style="border: 1px solid #dddddd; text-align: right; padding: 8px;color: black;">
                (-)    
                ${props.formatValue(
                  props.RecurringPricingInfo.packageTwoDisCount,
                  props.currencyID,
                )}
              </td>
            `
                : ``
            }
            ${
              props?.selectedPackagesList?.length === 3
                ? `
               <td style="border: 1px solid #dddddd; text-align: right; padding: 8px;color: black;">
                (-)    
                ${props.formatValue(
                  props.RecurringPricingInfo.packageThreeDisCount,
                  props.currencyID,
                )}
              </td>
            `
                : ``
            }
          </tr>
          <tr style="background-color:#808080;">
            <td style="border: 1px solid #dddddd; text-align: left; padding: 8px; color: white;">
              Discounted Total
            </td>
            <td style="border: 1px solid #dddddd; text-align: right; padding: 8px; color: white;">
            
                 
              ${props.formatValue(
                props.RecurringPricingInfo.packageOneDisCountedTotal,
                props.currencyID,
              )}
            </td>
            ${
              props?.selectedPackagesList?.length >= 2
                ? `
              <td style="border: 1px solid #dddddd; text-align: right; padding: 8px; color: white;">
               
                   
                ${props.formatValue(
                  props.RecurringPricingInfo.packageTwoDisCountedTotal,
                  props.currencyID,
                )}
              </td>
            `
                : ``
            }
            ${
              props?.selectedPackagesList?.length === 3
                ? `
              <td style="border: 1px solid #dddddd; text-align: right; padding: 8px; color: white;">
               
                   
                ${props.formatValue(
                  props.RecurringPricingInfo.packageThreeDisCountedTotal,
                  props.currencyID,
                )}
              </td>
            `
                : ``
            }
          </tr>
        
      `
                            : ``
                        }

       ${
         props.vatPercentage
           ? `
        <tr style="background-color: #DCDCDC";>
           <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;color: black;">
              ${props.taxName}
          </td>
           <td style="border: 1px solid #dddddd; text-align: right; padding: 8px;color: black;">
               
            ${
              props.formatValue(
                props.RecurringPricingInfo.PackageOneVaTPrice,
                props.currencyID,
              )

              // Number(props.RecurringPricingInfo.PackageOneVaTPrice).toFixed(2).toString().replace(
              //           /\B(?=(\d{3})+(?!\d))/g,
              //           ","
              //         )
            }
          </td>
          ${
            props?.selectedPackagesList?.length >= 2
              ? `
            <td style="border: 1px solid #dddddd; text-align: right; padding: 8px;color: black;">
                 
              ${
                props.formatValue(
                  props.RecurringPricingInfo.PackageTwoVaTPrice,
                  props.currencyID,
                )
                // Number(props.RecurringPricingInfo.PackageTwoVaTPrice).toFixed(2).toString().replace(
                //         /\B(?=(\d{3})+(?!\d))/g,
                //         ","
                //       )
              }
            </td>
          `
              : ``
          }
          ${
            props?.selectedPackagesList?.length === 3
              ? `
            <td style="border: 1px solid #dddddd; text-align: right; padding: 8px;color: black;">
                 
              ${
                props.formatValue(
                  props.RecurringPricingInfo.PackageThreeVaTPrice,
                  props.currencyID,
                )
                // Number(props.RecurringPricingInfo.PackageThreeVaTPrice).toFixed(2).toString().replace(
                //         /\B(?=(\d{3})+(?!\d))/g,
                //         ","

                //       )
              }
            </td>
          `
              : ``
          }
        </tr>
<tr style="background-color:#808080;">
           <td style="border: 1px solid #dddddd; text-align: left; padding: 8px; color: white;">
              Grand Total
            </td>
          <td style="border: 1px solid #dddddd; text-align: right; padding: 8px; color: white;">
               
            ${
              props.formatValue(
                props.RecurringPricingInfo.PackageOneGrandTotal,
                props.currencyID,
              )
              // Number(props.RecurringPricingInfo.PackageOneGrandTotal).toFixed(2).toString().replace(
              //           /\B(?=(\d{3})+(?!\d))/g,
              //           ","
              //         )
            }
          </td>
          ${
            props?.selectedPackagesList?.length >= 2
              ? `
            <td style="border: 1px solid #dddddd; text-align: right; padding: 8px; color: white;">
                 
              ${
                props.formatValue(
                  props.RecurringPricingInfo.PackageTwoGrandTotal,
                  props.currencyID,
                )
                // Number(props.RecurringPricingInfo.PackageTwoGrandTotal).toFixed(2).toString().replace(
                //         /\B(?=(\d{3})+(?!\d))/g,
                //         ","
                //       )
              }
            </td>
          `
              : ``
          }
          ${
            props?.selectedPackagesList?.length === 3
              ? `
            <td style="border: 1px solid #dddddd; text-align: right; padding: 8px; color: white;">
                 
              ${
                props.formatValue(
                  props.RecurringPricingInfo.PackageThreeGrandTotal,
                  props.currencyID,
                )
                // Number(props.RecurringPricingInfo.PackageThreeGrandTotal).toFixed(2).toString().replace(
                //         /\B(?=(\d{3})+(?!\d))/g,
                //         ","
                //       )
              }
            </td>
          `
              : ``
          }
        </tr>
      
    `
           : ``
       }
                      
                      </table>
                    </div>
                  `,
                });
              }

              if (props.selectedOneOffServiceList.length > 0) {
                currentArray.push({
                  table: `
                    <div style="padding-left: 40px; padding-right: 40px; font-family:${fontFamily};page-break-inside: avoid; break-inside: avoid;">
                      <p style="font-family:${fontFamily}; color:${newColorCode}; font-size: 20px; margin-top: 15px;"> One-Off Fees </p>
                      <table style="font-family:${fontFamily}; border-collapse: collapse; width: 100%; margin-top: -15px;">
                        <tr style="background-color:${newColorCode};">
                          <th style="border: 1px solid #dddddd; text-align: left; padding: 8px; color: white; font-size: 18px;">Services</th>
                          ${props?.selectedPackagesList
                            ?.map(
                              (selectedPackagesData) => `
                          <th style="border: 1px solid #dddddd; text-align: right; padding: 8px; color: white; font-size: 18px;">${getPackageName(
                            selectedPackagesData.servicePackageID,
                            selectedPackagesData.servicePackageName,
                          )}</th>
                          `,
                            )
                            .join("")}                           
                        </tr>
                        ${props.selectedOneOffServiceList
                          .map(
                            (serviceCat) => `
                          <tr style="background-color: #DCDCDC;">
                            <td style="border: 1px solid #dddddd; text-align: left; padding: 8px; font-weight: bold; font-size: 18px;">${
                              serviceCat.serviceCatName
                            }</td>
                            <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;"></td>
                            ${
                              props?.selectedPackages.length >= 2
                                ? `<td style="border: 1px solid #dddddd; text-align: left; padding: 8px;"></td>`
                                : ` `
                            }
                            ${
                              props?.selectedPackages.length === 3
                                ? `<td style="border: 1px solid #dddddd; text-align: left; padding: 8px;"></td>`
                                : ` `
                            }
                            
                          </tr>
                          ${serviceCat.servicesList
                            .map(
                              (subService) => `

                              <tr>
                        

                      </tr>
                            <tr>
                              <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">${
                                subService.serviceName
                              }</td>
                                ${
                                  props?.feeTypeId == 1
                                    ? `<td style="border: 1px solid #DDDDDD; text-align: right; padding: 8px;">${
                                        subService.packageOneValue !== undefined
                                          ? (subService.packageOneValue === 0 ||
                                              subService.packageOneValue ===
                                                null) &&
                                            !subService.servicePackageIDs.some(
                                              (item) =>
                                                item ==
                                                props.selectedPackagesList[0]
                                                  ?.servicePackageID,
                                            )
                                            ? `<span>&#10007;</span>`
                                            : !subService?.servicePackageIDs.includes(
                                                  subService.packageOneID,
                                                )
                                              ? `<span>&#10007;</span>`
                                              : `${props.formatValue(
                                                  subService.packageOneValue,
                                                  props.currencyID,
                                                )}`
                                          : props.formatValue(
                                              subService.price,
                                              props.currencyID,
                                            )
                                      }</td>
                            `
                                    : `${
                                        subService.packageOneValue == undefined
                                          ? Number(
                                              subService.packageOneValue,
                                            ) == 0
                                            ? `<td style="border: 1px solid #DDDDDD; text-align: right; padding: 8px;">&#10007;</td>`
                                            : `<td style="border: 1px solid #DDDDDD; text-align: right; padding: 8px;">&#10003;</td>`
                                          : Number(
                                                subService.packageOneValue,
                                              ) !== null &&
                                              !subService?.servicePackageIDs.includes(
                                                subService.packageOneID,
                                              )
                                            ? `<td style="border: 1px solid #DDDDDD; text-align: right; padding: 8px;">&#10007;</td>`
                                            : `<td style="border: 1px solid #DDDDDD; text-align: right; padding: 8px;">&#10003;</td>`
                                      }
                            `
                                }
                             
                              ${
                                props?.selectedPackages.length >= 2
                                  ? `
                                  ${
                                    props?.feeTypeId == 1
                                      ? `<td style="border: 1px solid #DDDDDD; text-align: right; padding: 8px;"> ${
                                          subService.packageTwoValue !==
                                          undefined
                                            ? (subService.packageTwoValue ===
                                                0 ||
                                                subService.packageTwoValue ===
                                                  null) &&
                                              !subService.servicePackageIDs.some(
                                                (item) =>
                                                  item ==
                                                  props.selectedPackagesList[1]
                                                    ?.servicePackageID,
                                              )
                                              ? `<span>&#10007;</span>`
                                              : !subService?.servicePackageIDs.includes(
                                                    subService.packageTwoID,
                                                  )
                                                ? `<span>&#10007;</span>`
                                                : `${props.formatValue(
                                                    subService.packageTwoValue,
                                                    props.currencyID,
                                                  )}`
                                            : props.formatValue(
                                                subService.price,
                                                props.currencyID,
                                              )
                                        }</td>
                              `
                                      : `${
                                          subService.packageTwoValue ==
                                          undefined
                                            ? Number(
                                                subService.packageTwoValue,
                                              ) == 0
                                              ? `<td style="border: 1px solid #DDDDDD; text-align: right; padding: 8px;">&#10007;</td>`
                                              : `<td style="border: 1px solid #DDDDDD; text-align: right; padding: 8px;">&#10003;</td>`
                                            : Number(
                                                  subService.packageTwoValue,
                                                ) !== null &&
                                                !subService?.servicePackageIDs.includes(
                                                  subService.packageTwoID,
                                                )
                                              ? `<td style="border: 1px solid #DDDDDD; text-align: right; padding: 8px;">&#10007;</td>`
                                              : `<td style="border: 1px solid #DDDDDD; text-align: right; padding: 8px;">&#10003;</td>`
                                        }
                              `
                                  }
                                  `
                                  : ` `
                              }
                              ${
                                props?.selectedPackages.length === 3
                                  ? `
                                  ${
                                    props?.feeTypeId == 1
                                      ? `<td style="border: 1px solid #DDDDDD; text-align: right; padding: 8px;">${
                                          subService.packageThreeValue !==
                                          undefined
                                            ? (subService.packageThreeValue ===
                                                0 ||
                                                subService.packageThreeValue ===
                                                  null) &&
                                              !subService.servicePackageIDs.some(
                                                (item) =>
                                                  item ==
                                                  props.selectedPackagesList[2]
                                                    ?.servicePackageID,
                                              )
                                              ? `<span>&#10007;</span>`
                                              : !subService?.servicePackageIDs.includes(
                                                    subService.packageThreeID,
                                                  )
                                                ? `<span>&#10007;</span>`
                                                : `${props.formatValue(
                                                    subService.packageThreeValue,
                                                    props.currencyID,
                                                  )}`
                                            : props.formatValue(
                                                subService.price,
                                                props.currencyID,
                                              )
                                        }</td>
                              `
                                      : `${
                                          subService.packageThreeValue ==
                                          undefined
                                            ? Number(
                                                subService.packageThreeValue,
                                              ) == 0
                                              ? `<td style="border: 1px solid #DDDDDD; text-align: right; padding: 8px;">&#10007;</td>`
                                              : `<td style="border: 1px solid #DDDDDD; text-align: right; padding: 8px;">&#10003;</td>`
                                            : Number(
                                                  subService.packageThreeValue,
                                                ) !== null &&
                                                !subService?.servicePackageIDs.includes(
                                                  subService.packageThreeID,
                                                )
                                              ? `<td style="border: 1px solid #DDDDDD; text-align: right; padding: 8px;">&#10007;</td>`
                                              : `<td style="border: 1px solid #DDDDDD; text-align: right; padding: 8px;">&#10003;</td>`
                                        }
                              `
                                  }
                                  
                                  `
                                  : ` `
                              }
                            </tr>`,
                            )
                            .join("")}
                        `,
                          )
                          .join("")}
                         <tr style="background-color:#808080;">
                        <td style="border: 1px solid #dddddd; text-align: left; padding: 8px; color: white;">Net Total</td>
                        <td style="border: 1px solid #dddddd; text-align: right; padding: 8px; color: white;">  ${
                          Number(props.OneOffPricingInfo.packageOneNetTotal) <
                            Number(
                              props.OneOffPricingInfo.packageOneDisCountedTotal,
                            ) ||
                          (Number(props.OneOffPricingInfo.packageOneDisCount) >
                            0 &&
                            !props.DiscountLines)
                            ? props.formatValue(
                                props.OneOffPricingInfo
                                  .packageOneDisCountedTotal,
                                props.currencyID,
                              )
                            : props.formatValue(
                                props.OneOffPricingInfo.packageOneNetTotal,
                                props.currencyID,
                              )
                        }</td>
                          
                           ${
                             props?.selectedPackages.length >= 2
                               ? `  <td style="border: 1px solid #dddddd; text-align: right; padding: 8px; color: white;">   ${
                                   Number(
                                     props.OneOffPricingInfo.packageTwoNetTotal,
                                   ) <
                                     Number(
                                       props.OneOffPricingInfo
                                         .packageTwoDisCountedTotal,
                                     ) ||
                                   (Number(
                                     props.OneOffPricingInfo.packageTwoDisCount,
                                   ) > 0 &&
                                     !props.DiscountLines)
                                     ? props.formatValue(
                                         props.OneOffPricingInfo
                                           .packageTwoDisCountedTotal,
                                         props.currencyID,
                                       )
                                     : props.formatValue(
                                         props.OneOffPricingInfo
                                           .packageTwoNetTotal,
                                         props.currencyID,
                                       )
                                 }</td>`
                               : ` `
                           }
                           ${
                             props?.selectedPackages.length === 3
                               ? ` <td style="border: 1px solid #dddddd; text-align: right; padding: 8px; color: white;">  ${
                                   Number(
                                     props.OneOffPricingInfo
                                       .packageThreeNetTotal,
                                   ) <
                                     Number(
                                       props.OneOffPricingInfo
                                         .packageThreeDisCountedTotal,
                                     ) ||
                                   (Number(
                                     props.OneOffPricingInfo
                                       .packageThreeDisCount,
                                   ) > 0 &&
                                     !props.DiscountLines)
                                     ? props.formatValue(
                                         props.OneOffPricingInfo
                                           .packageThreeDisCountedTotal,
                                         props.currencyID,
                                       )
                                     : props.formatValue(
                                         props.OneOffPricingInfo
                                           .packageThreeNetTotal,
                                         props.currencyID,
                                       )
                                 }
                        </td>`
                               : ` `
                           }
                        ${
                          (Number(
                            props.OneOffPricingInfo.packageThreeDisCount,
                          ) > 0 ||
                            Number(props.OneOffPricingInfo.packageOneDisCount) >
                              0 ||
                            Number(props.OneOffPricingInfo.packageTwoDisCount) >
                              0) &&
                          props?.DiscountLines
                            ? `
         <tr style="background-color: #DCDCDC";>
            <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;color: Black;">
              Discount
            </td>
             <td style="border: 1px solid #dddddd; text-align: right; padding: 8px;color: Black;">
              (-)    
              ${props.formatValue(
                props.OneOffPricingInfo.packageOneDisCount,
                props.currencyID,
              )}
            </td>
            ${
              props?.selectedPackagesList?.length >= 2
                ? `
               <td style="border: 1px solid #dddddd; text-align: right; padding: 8px;color: Black;">
                (-)    
                ${props.formatValue(
                  props.OneOffPricingInfo.packageTwoDisCount,
                  props.currencyID,
                )}
              </td>
            `
                : ``
            }
            ${
              props?.selectedPackagesList?.length === 3
                ? `
               <td style="border: 1px solid #dddddd; text-align: right; padding: 8px;color: Black;"">
                (-)    
                ${props.formatValue(
                  props.OneOffPricingInfo.packageThreeDisCount,
                  props.currencyID,
                )}
              </td>
            `
                : ``
            }
          </tr>
          <tr style="background-color:#808080;">
            <td style="border: 1px solid #dddddd; text-align: left; padding: 8px; color: white;">
              Discounted Total
            </td>
            <td style="border: 1px solid #dddddd; text-align: right; padding: 8px; color: white;">
            
                 
              ${
                props.formatValue(
                  props.OneOffPricingInfo.packageOneDisCountedTotal,
                  props.currencyID,
                )
                // Number(props.OneOffPricingInfo.packageOneDisCountedTotal)
                //           .toFixed(2).toString().replace(
                //             /\B(?=(\d{3})+(?!\d))/g,
                //             ","
                //           )
              }
            </td>
            ${
              props?.selectedPackagesList?.length >= 2
                ? `
              <td style="border: 1px solid #dddddd; text-align: right; padding: 8px; color: white;">
   
                ${
                  props.formatValue(
                    props.OneOffPricingInfo.packageTwoDisCountedTotal,
                    props.currencyID,
                  )
                  // Number(props.OneOffPricingInfo.packageTwoDisCountedTotal)
                  //           .toFixed(2).toString().replace(
                  //             /\B(?=(\d{3})+(?!\d))/g,
                  //             ","
                  //           )
                }
              </td>
            `
                : ``
            }
            ${
              props?.selectedPackagesList?.length === 3
                ? `
              <td style="border: 1px solid #dddddd; text-align: right; padding: 8px; color: white;">
               
                   
                ${
                  props.formatValue(
                    props.OneOffPricingInfo.packageThreeDisCountedTotal,
                    props.currencyID,
                  )
                  // Number(props.OneOffPricingInfo.packageThreeDisCountedTotal)
                  //           .toFixed(2).toString().replace(
                  //             /\B(?=(\d{3})+(?!\d))/g,
                  //             ","
                  //           )
                }
              </td>
            `
                : ``
            }
          </tr>
        </>
      `
                            : ``
                        }

       ${
         props.vatPercentage
           ? `
        <tr style="background-color: #DCDCDC";>
           <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;color: black;">
              ${props.taxName}
          </td>
           <td style="border: 1px solid #dddddd; text-align: right; padding: 8px;color: black;">
               
            ${
              props.formatValue(
                props.OneOffPricingInfo.PackageOneVaTPrice,
                props.currencyID,
              )
              // Number(props.OneOffPricingInfo.PackageOneVaTPrice)
              //           .toFixed(2).toString().replace(
              //             /\B(?=(\d{3})+(?!\d))/g,
              //             ","
              //           )
            }
          </td>
          ${
            props?.selectedPackagesList?.length >= 2
              ? `
            <td style="border: 1px solid #dddddd; text-align: right; padding: 8px;color: black;">
                 
              ${
                props.formatValue(
                  props.OneOffPricingInfo.PackageTwoVaTPrice,
                  props.currencyID,
                )
                // Number(props.OneOffPricingInfo.PackageTwoVaTPrice)
                //           .toFixed(2).toString().replace(
                //             /\B(?=(\d{3})+(?!\d))/g,
                //             ","
                //           )
              }
            </td>
          `
              : ``
          }
          ${
            props?.selectedPackagesList?.length === 3
              ? `
            <td style="border: 1px solid #dddddd; text-align: right; padding: 8px;color: black;">
                 
              ${
                props.formatValue(
                  props.OneOffPricingInfo.PackageThreeVaTPrice,
                  props.currencyID,
                )
                // Number(props.OneOffPricingInfo.PackageThreeVaTPrice)
                //           .toFixed(2).toString().replace(
                //             /\B(?=(\d{3})+(?!\d))/g,
                //             ","
                //           )
              }
            </td>
          `
              : ``
          }
        </tr>
<tr style="background-color:#808080;">
           <td style="border: 1px solid #dddddd; text-align: left; padding: 8px; color: white;">
              Grand Total
            </td>
          <td style="border: 1px solid #dddddd; text-align: right; padding: 8px; color: white;">
               
            ${
              props.formatValue(
                props.OneOffPricingInfo.PackageOneGrandTotal,
                props.currencyID,
              )
              // Number(props.OneOffPricingInfo.PackageOneGrandTotal)
              //           .toFixed(2).toString().replace(
              //             /\B(?=(\d{3})+(?!\d))/g,
              //             ","
              //           )
            }
          </td>
          ${
            props?.selectedPackagesList?.length >= 2
              ? `
            <td style="border: 1px solid #dddddd; text-align: right; padding: 8px; color: white;">
                 
              ${
                props.formatValue(
                  props.OneOffPricingInfo.PackageTwoGrandTotal,
                  props.currencyID,
                )
                // Number(props.OneOffPricingInfo.PackageTwoGrandTotal)
                //           .toFixed(2).toString().replace(
                //             /\B(?=(\d{3})+(?!\d))/g,
                //             ","
                //           )
              }
            </td>
          `
              : ``
          }
          ${
            props?.selectedPackagesList?.length === 3
              ? `
            <td style="border: 1px solid #dddddd; text-align: right; padding: 8px; color: white;">
                 
              ${
                props.formatValue(
                  props.OneOffPricingInfo.PackageThreeGrandTotal,
                  props.currencyID,
                )
                // Number(props.OneOffPricingInfo.PackageThreeGrandTotal)
                //           .toFixed(2).toString().replace(
                //             /\B(?=(\d{3})+(?!\d))/g,
                //             ","
                //           )
              }
            </td>
          `
              : ``
          }
        </tr>
      </>
    `
           : ``
       }
                      
                         
                        </tr>
                      </table>
                    </div>
                  `,
                });
              }
            } else {
              if (
                props?.selectedRecurringServiceList.length > 0 &&
                props?.ProposalObject?.selectedProposalTypeValue !== 4 &&
                props?.engagementObj?.quoteTypeID !== 4
              ) {
                currentArray.push({
                  table: `
                    <div style="padding-left: 40px; padding-right: 40px; font-family:${fontFamily};page-break-inside: avoid; break-inside: avoid;">
                     
                      <p style="font-family:${fontFamily}; color:${newColorCode}; font-size: 20px; margin-top: 15px;"> Recurring Fees (${getPaymentFrequencyLabel()})</p>
                      <table style="font-family:${fontFamily}; border-collapse: collapse; width: 100%; margin-top: -15px;">
                        <tr style="background-color:${newColorCode};">
                          <th style="border: 1px solid #dddddd; text-align: left; padding: 8px; color: white; font-size: 18px;">Services</th>
                          <th style="border: 1px solid #dddddd; text-align: right; padding: 8px; color: white; font-size: 18px;">Fees (${getCurrencySymbol(
                            props.currencyID,
                          )})</th>
                        </tr>
                        ${props.selectedRecurringServiceList
                          .map(
                            (serviceCat) => `
                          <tr style="background-color: #eee;">
                            <td style="border: 1px solid #dddddd; text-align: left; padding: 8px; font-weight: bold; font-size: 18px;">${
                              serviceCat.serviceCatName
                            }</td>
                            <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;"></td>
                          </tr>
                          ${serviceCat.servicesList
                            .map(
                              (subService) => `
                            <tr>
                              <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">${
                                subService.serviceName
                              }</td>
                                ${
                                  props?.feeTypeId == 1
                                    ? `<td style="border: 1px solid #DDDDDD; text-align: right; padding: 8px;">   ${
                                        subService.price == undefined
                                          ? props.formatValue(
                                              subService.quotationPrice,
                                              props.currencyID,
                                            )
                                          : props.formatValue(
                                              subService.price,
                                              props.currencyID,
                                            )
                                      }</td>
                            `
                                    : `<td style="border: 1px solid #DDDDDD; text-align: right; padding: 8px;">&#10003;</td>`
                                }
                            </tr>
                          `,
                            )
                            .join("")}
                        `,
                          )
                          .join("")}
                        <tr style="background-color:#808080;">
                          <td style="border: 1px solid #dddddd; text-align: left; padding: 8px; color: white;">Net Total</td>
                          <td style="border: 1px solid #dddddd; text-align: right; padding: 8px; color: white;">   ${
                            Number(props.RecurringPricingInfo.OriginalPrice) <
                              Number(
                                props.RecurringPricingInfo.DiscountedPrice,
                              ) ||
                            (Number(props.RecurringPricingInfo.Discount) > 0 &&
                              !props.DiscountLines)
                              ? Number(
                                  props.RecurringPricingInfo.DiscountedPrice,
                                ) === 0
                                ? props.formatValue(
                                    props.RecurringPricingInfo.OriginalPrice,
                                    props.currencyID,
                                  )
                                : props.formatValue(
                                    props.RecurringPricingInfo.DiscountedPrice,
                                    props.currencyID,
                                  )
                              : props.formatValue(
                                  props.RecurringPricingInfo.OriginalPrice,
                                  props.currencyID,
                                )
                          }
                    </td>
                    </tr>
                   ${
                     Number(
                       props.RecurringPricingInfo.Discount > 0 &&
                         props?.DiscountLines,
                     )
                       ? `<tr style="background-color:#DCDCDC ;">
                      <td style="border: 1px solid #dddddd; text-align: left; padding: 8px; color: black;">
                      Discount
                      </td>
                       <td style="border: 1px solid #dddddd; text-align: right; padding: 8px; color: black;">
                       
                       (-)     ${props.formatValue(
                         props.RecurringPricingInfo.Discount,
                         props.currencyID,
                       )}
                      </td>
                    </tr>
          <tr style="background-color:#808080;">
            <td style="border: 1px solid #dddddd; text-align: left; padding: 8px; color: white;">
              Discounted Total
            </td>
             <td style="border: 1px solid #dddddd; text-align: right; padding: 8px; color: white;">
             
                 
              ${props.formatValue(
                props.RecurringPricingInfo.DiscountedTotal,
                props.currencyID,
              )}
            </td>
          </tr>
        </>
     `
                       : ``
                   }
     
      ${
        props.vatPercentage
          ? `      
          <tr style="background-color: #DCDCDC";>
           <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;color: black;">
              ${props.taxName}
          </td>
            <td style="border: 1px solid #dddddd; text-align: right; padding: 8px;">   ${
              props.formatValue(
                props.RecurringPricingInfo.VATPrice,
                props.currencyID,
              )
              // Number(props.RecurringPricingInfo.VATPrice)
              //           .toFixed(2).toString().replace(
              //             /\B(?=(\d{3})+(?!\d))/g,
              //             ","
              //           )
            }
            </td>
          </tr>
         <tr style="background-color:#808080;">
           <td style="border: 1px solid #dddddd; text-align: left; padding: 8px; color: white;">
              Grand Total
            </td>
          <td style="border: 1px solid #dddddd; text-align: right; padding: 8px; color: white;">
                  
              ${
                props.formatValue(
                  props.RecurringPricingInfo.GrandTotal,
                  props.currencyID,
                )
                // Number(props.RecurringPricingInfo.GrandTotal)
                //         .toFixed(2).toString().replace(
                //           /\B(?=(\d{3})+(?!\d))/g,
                //           ","
                //         )
              }
            </td>
          </tr> `
          : ``
      }
   
                      </table>
                    </div>
                  `,
                });
              }
              // Check if selectedOneOffServiceList has items
              if (
                props?.selectedOneOffServiceList.length > 0 &&
                props?.ProposalObject?.selectedProposalTypeValue !== 4 &&
                props?.engagementObj?.quoteTypeID !== 4
              ) {
                // Append the table for selectedOneOffServiceList
                currentArray.push({
                  table: `
                      <div style="padding: 40px;font-family:${fontFamily};page-break-inside: avoid; break-inside: avoid;">
                        <p style="font-family:${fontFamily}; color:${newColorCode}; font-size: 20px;">One-Off Fees </p>
                        <table style="font-family:${fontFamily}; border-collapse: collapse; width: 100%; margin-top: -15px;">
                          <tr style="background-color:${newColorCode};">
                            <th style="border: 1px solid #dddddd; text-align: left; padding: 8px; color: white; font-size: 18px;">Services</th>
                            <th style="border: 1px solid #dddddd; text-align: right; padding: 8px; color: white; font-size: 18px;">Fees (${getCurrencySymbol(
                              props.currencyID,
                            )})</th>
                          </tr>
                          ${props.selectedOneOffServiceList
                            .map(
                              (serviceCat) => `
                                <tr style="background-color: #eee;">
                                  <td style="border: 1px solid #dddddd; text-align: left; padding: 8px; font-weight: bold; font-size: 18px;">${
                                    serviceCat.serviceCatName
                                  }</td>
                                   <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;"></td>
                                </tr>
                                ${serviceCat.servicesList
                                  .map(
                                    (subService) => `
                                  <tr>
                                    <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">${
                                      subService.serviceName
                                    }</td>
                                ${
                                  props?.feeTypeId == 1
                                    ? `<td style="border: 1px solid #DDDDDD; text-align: right; padding: 8px;">   ${
                                        subService.price == undefined
                                          ? props.formatValue(
                                              subService.quotationPrice,
                                              props.currencyID,
                                            )
                                          : props.formatValue(
                                              subService.price,
                                              props.currencyID,
                                            )
                                      }</td>
                            `
                                    : `<td style="border: 1px solid #DDDDDD; text-align: right; padding: 8px;">&#10003;</td>`
                                }
                                  </tr>
                                `,
                                  )
                                  .join("")}
                              `,
                            )
                            .join("")}
                          <tr style="background-color:#808080;">
                            <td style="border: 1px solid #dddddd; text-align: left; padding: 8px; color: white;">Net Total</td>
                            <td style="border: 1px solid #dddddd; text-align: right; padding: 8px; color: white;">   
                    
                    ${
                      Number(props.OneOffPricingInfo.OriginalPrice) <
                        Number(props.OneOffPricingInfo.DiscountedPrice) ||
                      (Number(props.OneOffPricingInfo.Discount) > 0 &&
                        !props.DiscountLines)
                        ? Number(props.OneOffPricingInfo.DiscountedPrice) === 0
                          ? props.formatValue(
                              props.OneOffPricingInfo.OriginalPrice,
                              props.currencyID,
                            )
                          : props.formatValue(
                              props.OneOffPricingInfo.DiscountedPrice,
                              props.currencyID,
                            )
                        : props.formatValue(
                            props.OneOffPricingInfo.OriginalPrice,
                            props.currencyID,
                          )
                    }
                    </td>
                    </tr>
                    
                      ${
                        Number(
                          props.OneOffPricingInfo.Discount > 0 &&
                            props?.DiscountLines,
                        )
                          ? `
      
          <tr style="background-color:#DCDCDC ;">
                      <td style="border: 1px solid #dddddd; text-align: left; padding: 8px; color: black;">
                      Discount
                      </td>
                       <td style="border: 1px solid #dddddd; text-align: right; padding: 8px; color: black;">
                       
                       (-)      ${props.formatValue(
                         props.OneOffPricingInfo.Discount,
                         props.currencyID,
                       )}
                      </td>
                    </tr>
          <tr style="background-color:#808080;">
            <td style="border: 1px solid #dddddd; text-align: left; padding: 8px; color: white;">
              Discounted Total
            </td>
             <td style="border: 1px solid #dddddd; text-align: right; padding: 8px; color: white;">
                                
              ${props.formatValue(
                props.OneOffPricingInfo.DiscountedTotal,
                props.currencyID,
              )}
            </td>
          </tr>
       
     `
                          : ``
                      }
      ${
        props.vatPercentage
          ? `
       
          <tr style="background-color: #DCDCDC";>
           <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;color: black;">
              ${props.taxName}
          </td>
            <td style="border: 1px solid #dddddd; text-align: right; padding: 8px;">   ${
              props.formatValue(
                props.OneOffPricingInfo.VATPrice,
                props.currencyID,
              )
              // Number(props.OneOffPricingInfo.VATPrice)
              //           .toFixed(2).toString().replace(
              //             /\B(?=(\d{3})+(?!\d))/g,
              //             ","
              //           )
            }
            </td>
          </tr>
         <tr style="background-color:#808080;">
           <td style="border: 1px solid #dddddd; text-align: left; padding: 8px; color: white;">
              Grand Total
            </td>
          <td style="border: 1px solid #dddddd; text-align: right; padding: 8px; color: white;">
              
                  
              ${
                props.formatValue(
                  props.OneOffPricingInfo.GrandTotal,
                  props.currencyID,
                )
                // Number(props.OneOffPricingInfo.GrandTotal)
                //         .toFixed(2).toString().replace(
                //           /\B(?=(\d{3})+(?!\d))/g,
                //           ","
                //         )
              }
            </td>
          </tr>
     
              `
          : ``
      }
                          </tr>
                        </table>
                      </div>
                    `,
                });
              }
            }
            break;
          case ElementType.PAGE_BREAK:
            break;
          case ElementType.FULL_PAGE_HEADING:
            pdfDataArray.push(currentArray);
            currentArray = [
              {
                // textbox: `<div style="padding-left: 40px; padding-right: 40px; margin-top: 350px;">${element.htmlContent}</div>`,
                textbox: ` ${imgTag}<div style=" text-align: center; padding-left: 40px; padding-right: 40px; color:${newColorCode}; margin-top: 400px; padding-bottom: 400px; font-family:${fontFamily}; font-size:${fontSizeHeading}; ">${element.headings} <br
                  >
                  <hr style="padding-left: 40px; padding-right: 40px; color: black; "></hr> <div style="color: Black; font-size: 0.25in;font-family:${fontFamily}; font-size: ${fontSizeContent};">${element.shortDesc}</div></div>
                 `,
              },
            ];
            break;
          case ElementType.AWS_PDF_LINK:
            pdfDataArray.push(currentArray);
            currentArray = [];
            currentArray.push({
              [element.templateElementTypeID === ElementType.PAGE_BREAK
                ? "pageBreak"
                : "awsLink"]: element.htmlContent,
            });
            break;
          case ElementType.TermsAndCondition:
            const appliedFontTNCContent = setDefaultFontFamily(
              props.updatedTnCData,
              fontFamily,
            );
            if (
              prevElementType === ElementType.PAGE_BREAK ||
              prevElementType === ElementType.AWS_PDF_LINK
            ) {
              if (props?.updatedTnCData || props?.engagementObj?.pdf) {
                if (
                  props?.updatedTnCData !== null &&
                  props?.updatedTnCData !== undefined
                ) {
                  currentArray.push({
                    textbox: `<div style="padding-left: 40px; padding-right: 40px; color:${newColorCode}; font-size: ${fontSizeHeading}; font-family:${fontFamily}" >TERMS & CONDITIONS<br>
                    <hr style="padding-left: 40px; padding-right: 40px; color: black;"></hr></div>
                      <div style="padding-left: 40px; padding-right: 40px;">${appliedFontTNCContent}</div>`,
                  });
                } else if (
                  props?.engagementObj?.pdf !== null ||
                  props?.updatedTnCData === null
                ) {
                  pdfDataArray.push(currentArray);
                  currentArray = [];
                  currentArray.push({
                    ["awsLink"]: props.engagementObj.pdf,
                  });
                }
              }
            } else {
              pdfDataArray.push(currentArray);
              if (props?.updatedTnCData || props?.engagementObj?.pdf) {
                if (
                  props?.updatedTnCData !== null &&
                  props?.updatedTnCData !== undefined
                ) {
                  currentArray = [
                    {
                      textbox: `<div style="padding-left: 40px; padding-right: 40px; color:${newColorCode}; font-size: ${fontSizeHeading}; font-family:${fontFamily}" >TERMS & CONDITIONS<br>
                        <hr style="padding-left: 40px; padding-right: 40px; color: black;"></hr></div>
                          <div style="padding-left: 40px; padding-right: 40px;">${appliedFontTNCContent}</div>`,
                    },
                  ];
                } else if (
                  props?.engagementObj?.pdf !== null ||
                  props?.updatedTnCData === null
                ) {
                  currentArray = [
                    {
                      ["awsLink"]: props.engagementObj.pdf,
                    },
                  ];
                }
              }
            }
            break;
          default:
            // pdfDataArray.push([]);
            if (props.moduleName == "Contract") {
              // Add RowNo to contract signatories
              const appliedFontTNCContent = setDefaultFontFamily(
                props.updatedTnCData,
                fontFamily,
              );

              if (!TermAndConditionAddedOrNot) {
                if (
                  prevElementType === ElementType.PAGE_BREAK ||
                  prevElementType === ElementType.AWS_PDF_LINK
                ) {
                  if (props?.updatedTnCData || props?.engagementObj?.pdf) {
                    if (
                      props?.updatedTnCData !== null &&
                      props?.updatedTnCData !== undefined
                    ) {
                      currentArray.push({
                        textbox: `<div style="padding-left: 40px; padding-right: 40px; color:${newColorCode}; font-size: ${fontSizeHeading}; font-family:${fontFamily}" >TERMS & CONDITIONS<br>
                      <hr style="padding-left: 40px; padding-right: 40px; color: black;"></hr></div>
                        <div style="padding-left: 40px; padding-right: 40px;">${appliedFontTNCContent}</div>`,
                      });
                    } else if (
                      props?.engagementObj?.pdf !== null ||
                      props?.updatedTnCData === null
                    ) {
                      pdfDataArray.push(currentArray);
                      currentArray = [];
                      currentArray.push({
                        ["awsLink"]: props.engagementObj.pdf,
                      });
                    }
                  }
                } else {
                  pdfDataArray.push(currentArray);
                  if (props?.updatedTnCData || props?.engagementObj?.pdf) {
                    if (
                      props?.updatedTnCData !== null &&
                      props?.updatedTnCData !== undefined
                    ) {
                      currentArray = [
                        {
                          textbox: `<div style="padding-left: 40px; padding-right: 40px; color:${newColorCode}; font-size: ${fontSizeHeading}; font-family:${fontFamily}" >TERMS & CONDITIONS<br>
                          <hr style="padding-left: 40px; padding-right: 40px; color: black;"></hr></div>
                            <div style="padding-left: 40px; padding-right: 40px;">${appliedFontTNCContent}</div>`,
                        },
                      ];
                    } else if (
                      props?.engagementObj?.pdf !== null ||
                      props?.updatedTnCData === null
                    ) {
                      currentArray = [
                        {
                          ["awsLink"]: props.engagementObj.pdf,
                        },
                      ];
                    }
                  }
                }
              }
              const contractSignatoryRowNo = props.contractSignatoriesList.map(
                (item, index) => ({
                  ...item,
                  RowNo: index + 1,
                }),
              );

              const contractSignatoryRowNoForOfficer =
                props.organisationData?.officersList !== undefined &&
                props.organisationData?.officersList
                  .filter((item) => item.isAuthorisedSignatory)
                  .map((item, index) => ({
                    ...item,
                    RowNo: contractSignatoryRowNo.length + index + 1,
                  }));

              // Always include contractSignatories
              let rightSignatureList = contractSignatoryRowNo.filter(
                (x) => x.signaturePositionID === 1,
              );
              let leftSignatureList = contractSignatoryRowNo.filter(
                (x) => x.signaturePositionID === 2,
              );

              // Include officers based on image URL and map to opposite side
              const signatureImageUrl =
                props.organisationData?.otherInformation?.[0]
                  ?.signatureImageUrl;

              if (
                !signatureImageUrl &&
                Array.isArray(contractSignatoryRowNoForOfficer)
              ) {
                // Officers go to the *opposite* side of each signaturePositionID
                contractSignatoryRowNoForOfficer.forEach((officer) => {
                  // If most contract signatories are on the right, place officers on the left, and vice versa
                  if (rightSignatureList.length <= leftSignatureList.length) {
                    rightSignatureList.push(officer); // balance to right
                  } else {
                    leftSignatureList.push(officer); // balance to left
                  }
                });
              }

              let htmlContentForSignatories = "";
              let loopCount = Math.max(
                rightSignatureList.length,
                leftSignatureList.length,
              );

              let orgSignatureInserted = false;
              htmlContentForSignatories += `<div id='SignatoryBlock' style='width: 95%; padding-left: 0px; padding-right: 0px; margin-top: 50px; page-break-inside: avoid; break-inside: avoid;'>`;
              htmlContentForSignatories +=
                "<table style='width: 100%; border-collapse: collapse;'>";

              for (let i = 0; i < loopCount; i++) {
                htmlContentForSignatories += `<tr style='width:100%; vertical-align: bottom;'>`;

                // --- LEFT SIGNATURE CELL ---
                const left = leftSignatureList?.[i];
                htmlContentForSignatories += `<td id="left_${
                  i + 1
                }" style="padding-top: 60px; width: 50%; font-family: ${fontFamily}; font-size: 0.2in; text-align: left; vertical-align: bottom;">`;

                if (left) {
                  htmlContentForSignatories += `
                  <span style="color: white;"><^${left.RowNo}_</span><div style="display: inline-block;">${left.firstName} ${left.lastName}</div><span style="color: white;">^></span>`;
                } else if (!orgSignatureInserted && signatureImageUrl) {
                  const org = props.organisationData.otherInformation[0];
                  htmlContentForSignatories += `
                <div style="margin-left: 60px;">
                  <div style="height:40px; width:130px"><img src="${
                    org.signatureImageUrl
                  }" alt="Signature" style="height:100%; width:100%;"></div>
                  <div style="margin-top: 10px;">${
                    org.signatoryName || ""
                  }</div>
                  </div>`;
                  orgSignatureInserted = true;
                }

                htmlContentForSignatories += `</td>`;

                // --- RIGHT SIGNATURE CELL ---
                const right = rightSignatureList?.[i];
                htmlContentForSignatories += `<td id="right_${
                  i + 1
                }" style="padding-top: 60px; width: 50%; font-family: ${fontFamily}; font-size: 0.2in; text-align: right; vertical-align: bottom;">`;

                if (right) {
                  htmlContentForSignatories += `
                  <span style="color: white;"><^${right.RowNo}_</span><div style="display: inline-block;">${right.firstName} ${right.lastName}</div><span style="color: white;">^></span>`;
                } else if (!orgSignatureInserted && signatureImageUrl) {
                  const org = props.organisationData.otherInformation[0];
                  htmlContentForSignatories += `
                <div style="margin-right: 60px;">
                  <div style="height:40px; width:130px"><img src="${
                    org.signatureImageUrl
                  }" alt="Signature" style="height:100%; width:100%;"></div>
                  <div style="margin-top: 10px;">${
                    org.signatoryName || ""
                  }</div>
                  </div>`;
                  orgSignatureInserted = true;
                }

                htmlContentForSignatories += `</td>`;

                htmlContentForSignatories += `</tr>`;
              }

              htmlContentForSignatories += "</table>";
              htmlContentForSignatories += "</div>";
              currentArray.push({
                textbox: `${htmlContentForSignatories}`,
              });
            }

            break;
        }
        prevElementType = element.templateElementTypeID;
      });

      if (currentArray.length > 0) {
        pdfDataArray.push(currentArray);
      }

      setGeneratePdfData(pdfDataArray);
    } else {
      console.error("Error: No template element list found.");
    }
  }, [props.templateElementList]);

  const modifiedPaymentGatewayType =
    props.paymentGatewayObj !== undefined &&
    Utils.payment_gateway.map((option) => {
      // Check if GoCardless access token is invalid
      const isGoCardlessTokenInvalid =
        props.paymentGatewayObj.goCardlessAccessToken === null ||
        props.paymentGatewayObj.goCardlessAccessToken === undefined ||
        props.paymentGatewayObj.goCardlessAccessToken === "";

      // Check if Stripe keys are invalid
      const isStripeKeysInvalid =
        (props.paymentGatewayObj.stripePublishableKey === null ||
          props.paymentGatewayObj.stripePublishableKey === undefined ||
          props.paymentGatewayObj.stripePublishableKey === "") &&
        (props.paymentGatewayObj.stripeSecretKey === null ||
          props.paymentGatewayObj.stripeSecretKey === undefined ||
          props.paymentGatewayObj.stripeSecretKey === "");

      // Check if Bank Transfer details are invalid
      const isBankTransferInvalid =
        (props.paymentGatewayObj.AccountNumber === null ||
          props.paymentGatewayObj.AccountNumber === undefined ||
          props.paymentGatewayObj.AccountNumber === "") &&
        (props.paymentGatewayObj.bankTransferName === null ||
          props.paymentGatewayObj.bankTransferName === undefined ||
          props.paymentGatewayObj.bankTransferName === "") &&
        (props.paymentGatewayObj.sortCode === null ||
          props.paymentGatewayObj.sortCode === undefined ||
          props.paymentGatewayObj.sortCode === "");

      // Return the modified option based on conditions
      if (option.value === 3 && isGoCardlessTokenInvalid) {
        return { ...option, isDisabled: true }; // Disable GoCardless option
      } else if (option.value === 2 && isStripeKeysInvalid) {
        return { ...option, isDisabled: true }; // Disable Stripe option
      } else if (option.value === 4 && isBankTransferInvalid) {
        return { ...option, isDisabled: true }; // Disable Bank Transfer option
      } else {
        return { ...option, isDisabled: false }; // Otherwise, leave it enabled (false is default)
      }
    });

  const handleAttachmentSelect = (item) => {
    const keyID = item.templatePDFKeyID;

    if (isPopUpVisible && props.moduleName == "Quote") {
      props.setProposalObject((prev) => {
        const doesExistsAlready = prev.selectedAttachments.includes(keyID);

        if (doesExistsAlready) {
          return {
            ...prev,
            selectedAttachments: prev.selectedAttachments.filter(
              (id) => id !== keyID,
            ),
          };
        } else {
          return {
            ...prev,
            selectedAttachments: [...prev.selectedAttachments, keyID],
          };
        }
      });
    } else if (isPopUpVisible && props.moduleName == "Contract") {
      props.setEngagementObj((prev) => {
        const doesExistsAlready = prev.selectedAttachments.includes(keyID);

        if (doesExistsAlready) {
          return {
            ...prev,
            selectedAttachments: prev.selectedAttachments.filter(
              (id) => id !== keyID,
            ),
          };
        } else {
          return {
            ...prev,
            selectedAttachments: [...prev.selectedAttachments, keyID],
          };
        }
      });
    }
  };

  // useEffect(() => {
  //   console.log("Updated selectedAttachments:", selectedAttachments);
  // }, [selectedAttachments]);

  return (
    <>
      <div
        style={{ padding: isMobile ? "" : "0px 0px 0px 34px" }}
        className="create-practice-height "
      >
        {/* <div className="tab-content"> */}
        <div
          style={{ height: isMobile ? "" : "54vh" }}
          className="tab-pane active"
        >
          {!flagForTemplatePdf && (
            <button
              onClick={toggleLandscape}
              className="btn btn-primary btn-sm mt-2"
              style={{ marginBottom: 10 }}
            >
              <Landscape />
              {landscapeMode ? "Switch to Portrait" : "Switch to Landscape"}
            </button>
          )}
          {MergePdfUrl &&
            (isMobile ? (
              <PdfViewer isVisible={false} pdfFile={MergePdfUrl} />
            ) : (
              <iframe
                title="PDF Viewer"
                src={MergePdfUrl}
                // width="100%"
                // height="700px"
                style={{ width: "100%", height: "100vh", border: "none" }}
              ></iframe>
            ))}

          {/* </div> */}
        </div>
      </div>
      {props.moduleName === "Quote" && (
        <>
          <div className="row fieldset">
            {/* Format Label */}
            <div className="col-lg-2 col-md-2 col-sm-6 d-flex align-items-center mt-4">
              <label className="required mt-2">{proposalName} Format:</label>
              <span className="text-danger">*</span>
            </div>

            {/* Format Select */}
            <div className="col-lg-4 col-md-4 col-sm-6 d-flex align-items-center  mt-4">
              <Select
                menuPosition="auto"
                className="phone-input-country-code selectDropDown"
                options={
                  !common.enableEL ||
                  !props?.pricingSettingObj?.remainingESignatures
                    ? Utils.PreviewSelection.filter((x) => x.value === 2) // only PDF
                    : Utils.PreviewSelection
                }
                onChange={handleFormate}
                value={ProposalFormatValue}
              />
              {props.requireMessage && (
                <span className="validation">{ERROR_MESSAGES}</span>
              )}
            </div>

            {/* proposal types start */}
            {props.ProposalObject?.ProposalFormate === 3 && (
              <>
                {/* Format Label */}
                <div className="col-lg-2 col-md-2 col-sm-6 d-flex align-items-center mt-4">
                  <label className="required mt-2">{proposalName} Type:</label>
                  <span className="text-danger">*</span>
                </div>

                {/* Format Select */}
                <div className="col-lg-4 col-md-4 col-sm-6 d-flex align-items-center mt-4">
                  <Select
                    menuPosition="auto"
                    className="phone-input-country-code selectDropDown"
                    options={Utils?.webBasedProposalTypes}
                    onChange={(selectedOption) => {
                      props.setProposalObject({
                        ...props.ProposalObject,
                        proposalTypeID: selectedOption.value, //TODO: update values later
                      });
                      props.setRequireMessage(false);
                    }}
                    value={Utils.webBasedProposalTypes.find(
                      (x) => x.value === props.ProposalObject?.proposalTypeID,
                    )}
                  />
                  {props.requireMessage && (
                    <span className="validation">{ERROR_MESSAGES}</span>
                  )}
                </div>
              </>
            )}

            {/* proposal types end  */}

            {/* proposal global variables start */}
            {props?.ProposalObject?.proposalTypeID === 3 && (
              <>
                {/* Format Label */}
                <div className="col-lg-2 col-md-2 col-sm-6 d-flex align-items-center mt-4">
                  <label className="required mt-2">
                    {proposalName} Global Variables:
                  </label>
                  <span className="text-danger">*</span>
                </div>

                {/* Format Select */}
                <div className="col-lg-4 col-md-4 col-sm-6 d-flex align-items-center mt-4">
                  <Select
                    isMulti
                    className="phone-input-country-code selectDropDown Drop-down-width pt-2"
                    options={Utils?.webBasedProposalTypes}
                    onChange={(selectedOption) => {
                      props.setProposalObject({
                        ...props.ProposalObject,
                        proposalTypeID: selectedOption.value, //TODO: update values later
                      });
                      props.setRequireMessage(false);
                    }}
                    value={Utils.webBasedProposalTypes.find(
                      (x) => x.value === props.ProposalObject?.proposalTypeID,
                    )}
                  />
                  {props.requireMessage && (
                    <span className="validation">{ERROR_MESSAGES}</span>
                  )}
                </div>
              </>
            )}

            {/* proposal global variables end  */}
            {props.ProposalObject.ProposalFormate === 1 && (
              <>
                {/* Payment Gateway Label */}
                <div className="col-lg-2 col-md-2 col-sm-6 mt-4">
                  <label className="form-label">Payment Gateway</label>
                  <span className="text-danger">*</span>
                </div>

                {/* Payment Gateway Select */}
                <div className="col-lg-4 col-md-4 col-sm-6">
                  <div className="d-flex flex-column align-items-end">
                    <button
                      style={{
                        fontSize: "12px",
                        border: "none",
                        background: "transparent",
                        color: "#626ed4",
                      }}
                      onClick={() => setISModalOpen(true)}
                      data-bs-toggle="modal"
                      data-bs-target="#paymentGatewayModel"
                    >
                      + Payment Gateway
                    </button>
                    <Select
                      className="phone-input-country-code selectDropDown"
                      value={Utils.payment_gateway.find(
                        (item) =>
                          props.ProposalObject.paymentGatewayID === item.value,
                      )}
                      onChange={(e) => {
                        props.setProposalObject({
                          ...props.ProposalObject,
                          paymentGatewayID: e.value,
                        });
                      }}
                      options={modifiedPaymentGatewayType}
                    />
                    {/* Validation error message for Client */}
                    {props.requireMessage &&
                      (!props.ProposalObject.paymentGatewayID ||
                        props.ProposalObject.paymentGatewayID === "") && (
                        <span className="validation">{ERROR_MESSAGES}</span>
                      )}
                  </div>
                </div>
              </>
            )}
          </div>
        </>
      )}
      <div class="separator mt-3 mb-3"></div>

      {/* <div class="modal-footer"> */}

      <div class="row fieldset">
        <div class="col-lg-12 hstack gap-1 justify-content-end text-right mt-3">
          {/* <div class="d-flex" style={{ overflowX: "auto" }}> */}
          <div className="d-flex flex-wrap" style={{ gap: "4px" }}>
            {/* <div class="d-flex flex-row justify-content-end align-items-center overflow-auto custom-scroll"> */}
            <button
              class="btn btn-md btn-light mr-1 text-nowrap"
              onClick={() => props.handleCancelBtn()}
            >
              <span>Cancel</span>
            </button>
            {props?.ProposalObject?.selectedProposalTypeValue === 1 && (
              <button
                style={{ paddingTop: "5px", marginRight: "4px" }}
                class="btn btn-md btn-success create-item-btn text-nowrap"
                onClick={() => props.HandleTabChange(7)}
              >
                <span>Back</span>
              </button>
            )}
            {props.moduleName == "Contract" && (
              <button
                style={{ paddingTop: "5px", marginRight: "4px" }}
                class="btn btn-md btn-success create-item-btn  text-nowrap"
                onClick={() =>
                  props?.HandleBack(
                    props.engagementObj.selectSourceId === 3
                      ? 7
                      : props.engagementObj.selectSourceId === 2 &&
                          props.engagementObj.quoteTypeID === 4
                        ? 3
                        : 4,
                  )
                }
              >
                <span>Back</span>
              </button>
            )}
            {props?.ProposalObject?.selectedProposalTypeValue === 2 && (
              <button
                style={{ paddingTop: "5px", marginRight: "4px" }}
                class="btn btn-md btn-success create-item-btn  text-nowrap"
                onClick={() => props.HandleTabChange(7)}
              >
                <span>Back</span>
              </button>
            )}
            {props?.ProposalObject?.selectedProposalTypeValue === 3 && (
              <button
                style={{ paddingTop: "5px", marginRight: "4px" }}
                class="btn btn-md btn-success create-item-btn text-nowrap"
                onClick={() => props.HandleTabChange(6)}
              >
                <span>Back</span>
              </button>
            )}
            {props?.ProposalObject?.selectedProposalTypeValue === 4 && (
              <button
                style={{ paddingTop: "5px", marginRight: "4px" }}
                className="btn btn-md btn-success create-item-btn text-nowrap"
                onClick={() => {
                  const shouldGoToAdditionalInfo =
                    props.additionalInformationList?.length > 0;
                  // props.isValidForm?.AdditionalInfo;

                  props.HandleTabChange(shouldGoToAdditionalInfo ? 3 : 2);
                }}
              >
                <span>Back</span>
              </button>
            )}
            {props.moduleName == "Quote" && (
              <button
                style={{ paddingTop: "5px", marginRight: "4px" }}
                class="btn btn-md btn-success create-item-btn  text-nowrap"
                onClick={() =>
                  props.handleSaveAsDraft(
                    4,
                    moduleNameForSaveAsDraft,
                    statusIDForSaveAsDraft,
                  )
                }
              >
                <span>Save as a Draft</span>
              </button>
            )}
            {props.moduleName == "Contract" && (
              <button
                style={{ paddingTop: "5px", marginRight: "4px" }}
                class="btn btn-md btn-success create-item-btn  text-nowrap"
                onClick={() => props.handleSaveAsDraft(2, statusID.Draft)}
              >
                <span>Save as a Draft</span>
              </button>
            )}

            {props.moduleName == "Quote" && (
              <div
                className="dropdown"
                style={{ display: "inline-block", marginRight: "4px" }}
              >
                <div className="btn-group d-flex align-items-stretch">
                  <button
                    class="btn btn-md btn-success create-item-btn"
                    type="button"
                    id="dropdownMenuButton"
                    // data-bs-toggle="dropdown"
                    aria-expanded="false"
                    style={{
                      borderTopRightRadius: 0,
                      borderBottomRightRadius: 0,
                      borderRight: "none",
                    }}
                    onClick={() =>
                      props.handleSaveAsDraft(
                        4,
                        moduleNameForSaveAsDraft,
                        statusIDForSendProposal,
                      )
                    }
                  >
                    <span className="d-inline-flex align-items-center">
                      <span className="me-2">Send {proposalName}</span>
                      <i className="bi bi-send"></i>
                    </span>
                  </button>
                  <button
                    class="btn btn-md btn-success create-item-btn d-flex rounded-end-2"
                    type="button"
                    id="dropdownMenuButton"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                    style={{
                      borderTopLeftRadius: 0,
                      borderBottomLeftRadius: 0,
                      borderLeft: "none",
                      padding: "0.375rem 0.75rem",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <ExpandMoreIcon />
                  </button>
                  <ul
                    className="dropdown-menu"
                    aria-labelledby="dropdownMenuButton"
                  >
                    <li>
                      <a
                        className="dropdown-item"
                        onClick={() =>
                          props.handleSaveAsDraft(
                            4,
                            moduleNameForSaveAsDraft,
                            statusIDForSendProposal,
                          )
                        }
                      >
                        <span style={{ fontSize: "0.75rem" }}>
                          Send {proposalName}
                          <i
                            className="bi bi-send"
                            style={{ paddingLeft: "4px" }}
                          ></i>
                        </span>
                      </a>
                    </li>
                    <li>
                      <a className="dropdown-item" onClick={openPopup}>
                        <span style={{ fontSize: "0.75rem" }}>
                          Customize Email and Send
                        </span>
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {isPopUpVisible && props.moduleName == "Quote" && (
              <div className="popup-overlay" onClick={closePopup}>
                <div
                  className="popup-content"
                  style={{ maxWidth: "700px", width: "90%", margin: "5% auto" }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button className="close-button" onClick={closePopup}>
                    &times;
                  </button>
                  <div>
                    <h6 className="mt-2">Email Template Content</h6>
                    <div className="separator mb-3" />
                    <div className="fieldset-group helper-variables-div">
                      <label className="fieldset-group-label">Variables</label>
                      <AccountantVariables
                        ModuleName="EmailTemplate"
                        TemplateType={
                          // TemplateObj.templateTypeID === null
                          //   ? null
                          //   :
                          "EmailTemplate"
                        }
                        ClintType={null}
                        businessTypeId={EMAIL_TEMPLATE.Quote_PDF}
                      />
                    </div>
                    <div>
                      <Text_Editor
                        editorState={editorState}
                        handleContentChange={handleContentChange}
                        // modelAction={modelAction}
                      />
                    </div>
                    {/* Attachment section starts */}

                    <div className="mt-3">
                      {TemplatePdfList.length > 0 && <h6>Attachments:</h6>}
                      <div className="d-flex gap-2">
                        {TemplatePdfList.map((item, index) => (
                          <div
                            className="d-flex align-items-center"
                            key={index}
                          >
                            <input
                              type="checkbox"
                              className="me-2"
                              checked={props.ProposalObject.selectedAttachments.find(
                                (att) =>
                                  att.templatePDFKeyID ===
                                  item.templatePDFKeyID,
                              )}
                              onChange={() => handleAttachmentSelect(item)}
                            />
                            <label
                              className="m-0"
                              style={{ fontSize: "12px", fontWeight: "400" }}
                            >
                              {item.templatePDFTitle}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                    {/* Attachment section ends */}
                  </div>
                  <div className="d-flex justify-content-end flex-wrap mt-5">
                    <button
                      class="btn btn-md btn-light mr-1 ms-auto me-2 mb-2"
                      onClick={closePopup}
                    >
                      <span>Cancel</span>
                    </button>
                    <button
                      style={{ paddingTop: "5px", marginRight: "4px" }}
                      class="btn btn-md btn-success create-item-btn text-nowrap mb-2"
                      onClick={() =>
                        props.handleSaveAsDraft(
                          4,
                          moduleNameForSaveAsDraft,
                          statusIDForSendProposal,
                        )
                      }
                    >
                      <span>
                        Send {proposalName}
                        <i
                          className="bi bi-send"
                          style={{ paddingLeft: "4px" }}
                        ></i>
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            )}
            {common.enableEL == 1 &&
              userAccessData.Admin_Engagement_Latter_CanAdd &&
              userAccessData.Admin_Engagement_Latter_CanView &&
              props.moduleName == "Quote" && (
                <button
                  style={{ paddingTop: "5px", marginRight: "4px" }}
                  class="btn btn-md btn-success create-item-btn text-nowrap"
                  onClick={() => {
                    if (!activeOrganizationSubscriptionPlan.prepareContract) {
                      setShowModal(true);
                      return;
                    }
                    props.handleSaveAsDraft(
                      4,
                      moduleNameForSaveAsDraft,
                      statusIDForSkipped,
                    );
                  }}
                >
                  <span>Skip To {EngagementName}</span>
                </button>
              )}
            {props.moduleName == "Contract" && (
              <div
                className="dropdown"
                style={{ display: "inline-block", marginRight: "4px" }}
              >
                <div className="btn-group d-flex align-items-stretch">
                  <button
                    style={{
                      borderTopRightRadius: 0,
                      borderBottomRightRadius: 0,
                      borderRight: "none",
                    }}
                    className="btn btn-md btn-success create-item-btn text-nowrap"
                    id="dropdownMenuButton"
                    onClick={() => {
                      if (!activeOrganizationSubscriptionPlan.sendContract) {
                        setShowModal(true);
                        return;
                      }
                      props.HandleTabChange(5, statusIDForSendProposal);
                    }}
                  >
                    <span className="d-inline-flex align-items-center">
                      <span className="me-2">Send {EngagementName}</span>
                      <i
                        className="bi bi-send"
                        style={{ paddingLeft: "4px" }}
                      ></i>
                    </span>
                  </button>
                  <button
                    class="btn btn-md btn-success create-item-btn d-flex rounded-end-2"
                    type="button"
                    id="dropdownMenuButton"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                    style={{
                      borderTopLeftRadius: 0,
                      borderBottomLeftRadius: 0,
                      borderLeft: "none",
                      padding: "0.375rem 0.75rem",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <ExpandMoreIcon />
                  </button>
                  <ul
                    className="dropdown-menu"
                    aria-labelledby="dropdownMenuButton"
                  >
                    <li>
                      <button
                        className="dropdown-item"
                        onClick={() => {
                          if (
                            !activeOrganizationSubscriptionPlan.sendContract
                          ) {
                            setShowModal(true);
                            return;
                          }
                          props.HandleTabChange(5, statusIDForSendProposal);
                        }}
                      >
                        <span style={{ fontSize: "0.75rem" }}>
                          Send {EngagementName}
                          <i className="bi bi-send"></i>
                        </span>
                      </button>
                    </li>
                    <li>
                      <button className="dropdown-item" onClick={openPopup}>
                        <span style={{ fontSize: "0.75rem" }}>
                          Customize Email and Send
                        </span>
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            )}
            {isPopUpVisible && props.moduleName == "Contract" && (
              <div className="popup-overlay" onClick={closePopup}>
                <div
                  className="popup-content"
                  style={{ maxWidth: "700px", width: "90%", margin: "5% auto" }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button className="close-button" onClick={closePopup}>
                    &times;
                  </button>
                  <div>
                    <h6 className="mt-2">Email Template Content</h6>
                    <div className="separator mb-3" />
                    <div className="fieldset-group helper-variables-div">
                      <label className="fieldset-group-label">Variables</label>
                      <AccountantVariables
                        ModuleName="EmailTemplate"
                        TemplateType={
                          // TemplateObj.templateTypeID === null
                          //   ? null
                          //   :
                          "EmailTemplate"
                        }
                        ClintType={null}
                        businessTypeId={EMAIL_TEMPLATE.Contract}
                      />
                    </div>
                    <div>
                      <Text_Editor
                        editorState={editorState}
                        handleContentChange={handleContentChange}
                        // modelAction={modelAction}
                      />
                    </div>

                    {/* Attachment section starts */}

                    <div className="mt-3">
                      {TemplatePdfList.length > 0 && <h6>Attachments:</h6>}
                      <div className="d-flex gap-2">
                        {TemplatePdfList.map((item, index) => (
                          <div
                            className="d-flex align-items-center"
                            key={index}
                          >
                            <input
                              type="checkbox"
                              className="me-2"
                              checked={props.engagementObj.selectedAttachments.find(
                                (att) =>
                                  att.templatePDFKeyID ===
                                  item.templatePDFKeyID,
                              )}
                              onChange={() => handleAttachmentSelect(item)}
                            />
                            <label
                              className="m-0"
                              style={{ fontSize: "12px", fontWeight: "400" }}
                            >
                              {item.templatePDFTitle}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                    {/* Attachment section ends */}
                  </div>
                  <div className="d-flex justify-content-end flex-wrap mt-5">
                    <button
                      class="btn btn-md btn-light mr-1 ms-auto me-2 mb-2"
                      onClick={closePopup}
                    >
                      <span>Cancel</span>
                    </button>
                    <button
                      style={{ paddingTop: "5px", marginRight: "4px" }}
                      class="btn btn-md btn-success create-item-btn text-nowrap mb-2"
                      onClick={() => {
                        if (!activeOrganizationSubscriptionPlan.sendContract) {
                          setShowModal(true);
                          return;
                        }
                        props.HandleTabChange(5, statusIDForSendProposal);
                      }}
                    >
                      <span>
                        Send {EngagementName}
                        <i
                          className="bi bi-send"
                          style={{ paddingLeft: "4px" }}
                        ></i>
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            )}
            {/* {props.moduleName == "Contract" && (
              <button
                style={{ paddingTop: "5px", marginRight: "4px" }}
                class="btn btn-md btn-success create-item-btn text-nowrap"
                onClick={() => {
                  if (!activeOrganizationSubscriptionPlan.sendContract) {
                    setShowModal(true)
                    return
                  };
                  props.HandleTabChange(5, statusIDForSendProposal);
                }}

              >
                <span className="me-2">Send {EngagementName}</span>
                <i className="bi bi-send"></i>
              </button>
            )} */}
          </div>
        </div>
        <ViewPlan
          showModal={showModal}
          handleCloseModel={() => setShowModal(false)}
          setShowModal={setShowModal}
          activeOrganizationKeyId={common.organisationKeyID}
        />
        <PaymentGatewayModel
          class="modal fade"
          id="paymentGatewayModel"
          tabindex="-1"
          aria_labelledby="paymentGatewayModel"
          aria_hidden="true"
          isModalOpen={isModalOpen}
          setISModalOpen={setISModalOpen}
          isAddUpdatePricingActionDone={props.isAddUpdatePricingActionDone}
          setIsAddUpdatePricingActionDone={
            props.setIsAddUpdatePricingActionDone
          }
        />
      </div>
    </>
  );
}
