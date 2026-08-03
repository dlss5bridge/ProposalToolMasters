import React, { useContext, useRef, useEffect, useState } from "react";

import { Row, Col, Card, CardBody } from "reactstrap";
import { AuthContextProvider } from "../../AuthContext/AuthContext";
import {
  GetTemplateListLookupList,
  GetTemplateModelData,
} from "../../redux/Services/Config/TemplateApi";
import { ElementType, fieldToIdMap } from "../../Middleware/enums";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import {
  GenerateContractFromProposal,
  GetContractDetailsForSignEasyList,
} from "../../redux/Services/Proposal/ProposalApi";
import { GetSendToSignEasy } from "../../redux/Services/SignEasy";
import GeneratePdfLoaderPage from "../../components/GeneratePdfloaderpage";
import { generatePdfUrl, mergePdfApiUrl } from "../../Base-Url/Base_Url";
import Utils from "../../Middleware/Utils";
function AcceptInvitation() {
  const STOP_AFTER_PDF_GENERATION = false;
  const {
    setTopbar,
    setLoader,
    formatValueWithoutCurrencySymbol,
    formatValueWithoutCurrencySymbol_v1,
    formatValue,
    getFontStylesFromHtml,
    replaceTemplatePricingVariables,
    replaceUrlInHtml,
  } = useContext(AuthContextProvider);
  const [templateElementList, setTemplateElementList] = useState([]);
  const [pricingVariablesForEmail, setPricingVariablesForEmail] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [generatePdfData, setGeneratePdfData] = useState([]);
  const [MergePdfUrl, setMergePdfUrl] = useState("");
  const [isDefaultFirstPage, setIsDefaultFirstPage] = useState(null);
  const [fontFamily, setFontFamily] = useState("");
  const [fontSize, setFontSize] = useState("");
  const [showSeparatorLines, setShowSeparatorLines] = useState(null);
  const [watermarkImage, setWatermarkImage] = useState(null);
  const [orientationID, setOrientationID] = useState(1);
  const [recurringServiceCatList, setRecurringServiceCatList] = useState([]);
  const [oneOffServiceCatList, setOneOffServiceCatList] = useState([]);
  const [serviceDescriptionList, setServiceDescriptionList] = useState([]);
  const [ChargeTypeId1Array, setChargeTypeId1Array] = useState([]);
  const [ChargeTypeId2Array, setChargeTypeId2Array] = useState([]);
  const [packageList, setPackageList] = useState([]);
  const [SvgShow, setSvgShow] = useState(false);
  const [ShowDiscountLine, setShowDiscountLine] = useState(false);
  const [paymentFrequency, setPaymentFrequency] = useState(null);
  const [BrandColor, setBrandColor] = useState(false);
  const [BrandLogo, setBrandLogo] = useState(false);
  const [feeTypeId, setFeeTypeId] = useState("");
  const [TnCHtmlContent, setTnCHtmlContent] = useState(null);
  const [TnCPdf, setTnCPdf] = useState(null);
  const [quoteTypeID, setQuoteTypeID] = useState(null);
  const [webSite, setWebSite] = useState("");
  const [AdditionalInformation, setAdditionalInformation] = useState([]);
  const [HeaderContent, setHeaderContent] = useState(null);
  const [FooterContent, setFooterContent] = useState(null);
  const [HeaderHeight, setHeaderHeight] = useState(null);
  const [FooterHeight, setFooterHeight] = useState(null);
  const [HeaderImage, setHeaderImage] = useState(null);
  const [FooterImage, setFooterImage] = useState(null);
  const [orgkeyId, setOrgkeyId] = useState("");
  const imgTag = `<img src="${BrandLogo}" alt="Logo" style="display: none; margin: 0 auto 15px;">`;

  const [serviceDescriptionObj, setServiceDescriptionObj] = useState({
    mainHeading: null,
    recurringOnGoingHeading: null,
    oneOffAdhocHeading: null,
    mainHeadingFontSize: null,
    recurringOnGoingHeadingFontSize: null,
    oneOffAdhocFontSize: null,
    mainHeadingIsBold: null,
    mainHeadingIsItalic: null,
    recurringOnGoingHeadingIsBold: null,
    recurringOnGoingHeadingIsItalic: null,
    oneOffAdhocHeadingIsBold: null,
    oneOffAdhocHeadingIsItalic: null,
  });

  const [statementOfFactsObj, setStatementOfFactsObj] = useState({
    mainHeading: null,
    recurringOnGoingHeading: null,
    oneOffAdhocHeading: null,
    mainHeadingFontSize: null,
    recurringOnGoingHeadingFontSize: null,
    oneOffAdhocFontSize: null,
    mainHeadingIsBold: null,
    mainHeadingIsItalic: null,
    recurringOnGoingHeadingIsBold: null,
    recurringOnGoingHeadingIsItalic: null,
    oneOffAdhocHeadingIsBold: null,
    oneOffAdhocHeadingIsItalic: null,
  });

  const [statementOfFactsHTML, setStatementOfFactsHTML] = useState("");
  const [serviceDescriptionHTML, setServiceDescriptionHTML] = useState("");

  const [contractSignatoriesList, setContractSignatoriesList] = useState([]);
  const [finalQuotationAmountList, setFinalQuotationAmountList] = useState([]);
  const location = useLocation();
  const [organisationData, setOrganisationData] = useState([]);

  const [contractKeyID, setContractKeyID] = useState();
  const [pricingTableColumnIDs, setPricingTableColumnIDs] = useState("");
  const [visibleFieldsCustomTemp, setVisibleFieldsCustomTemp] = useState(() =>
    Object.fromEntries(Object.keys(fieldToIdMap).map((k) => [k, true])),
  );
  const urlParams = new URLSearchParams(location.search);
  const quoteKeyID = urlParams.get("quoteKeyID");
  const ServiceChargeTypeID = urlParams.get("ServiceChargeTypeID");
  const ContractSignatoryKeyID = urlParams.get("ContractSignatoryKeyID");
  const Action = urlParams.get("Action");
  const ServicePackageKeyID = urlParams.get("ServicePackageKeyID");
  const [quoteInfo, setQuoteInfo] = useState({
    templateKeyID: null,
    clientID: null,
  });
  // const fontSize = "0.20in";
  const fontSizeHeading = "0.2in";
  const common = useSelector((state) => state.Storage);

  useEffect(() => {
    setTopbar("none");
    GetTemplateLookupListData(quoteKeyID, common.organisationKeyID);
    //  GetTemplateModalData()
    GenerateContractFromProposalData();
    // GetOrganisationInformationModelData()
  }, [1]); // eslint-disable-line
  const getPaymentFrequencyLabel = () => {
    const Payment_Frequency = {
      Yearly: 1,
      HalfYearly: 2,
      Quarterly: 3,
      Monthly: 4,
    };

    const frequencyValue = paymentFrequency;

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
  // useEffect(() => {
  //   if (organisationData && organisationData.otherInformation) {
  //     const { emailID, phoneNo, fullAddress } =
  //       organisationData.otherInformation[0];
  //     setEmail(emailID);
  //     setPhone(phoneNo);
  //     setFullAddress(fullAddress);
  //   }
  // }, [organisationData]);

  // const GetOrganisationInformationModelData = async () => {
  //   const response = await GetOrganisationInformationModel(
  //     common.organisationKeyID
  //   );
  //   if (response) {
  //     if (response?.data?.statusCode === 200) {
  //       const ModelData = response?.data?.responseData?.data;

  //       // Extract emailId, phoneNumber, and countryCode
  //       const { emailID, phoneNo, countryCode } = ModelData.otherInformation;

  //       const concatenateFullAddress = (address) => {
  //         const addPart = (part) => (part ? `${part}, ` : "");

  //         let concatenatedAddress = `${addPart(
  //           address?.addressLine1?.replace(",", " ")
  //         )}${addPart(address?.addressLine2)}${addPart(
  //           address?.locality
  //         )}${addPart(address?.region)}${addPart(
  //           address?.country || address?.countryName
  //         )}${address?.postcode || ""}`;

  //         // Remove trailing comma, if present
  //         if (concatenatedAddress.endsWith(", ")) {
  //           concatenatedAddress = concatenatedAddress.slice(0, -2);
  //         }
  //         return concatenatedAddress;
  //       };

  //       const fullAddress = concatenateFullAddress(
  //         ModelData.organisationAddress
  //       );

  //       // Concatenate countryCode and phoneNo
  //       const concatenatedPhone = `${countryCode} ${phoneNo}`;

  //       // Update otherInformation with only required fields
  //       const updatedOtherInformation = [
  //         {
  //           emailID,
  //           phoneNo: concatenatedPhone,
  //           fullAddress,
  //         },
  //       ];

  //       // Set updated organization data
  //       setOrganisationData({
  //         otherInformation: updatedOtherInformation,
  //       });
  //       // Set updated organization data in local storage
  //     } else {
  //       setErrorMessage(response?.data?.errorMessage);
  //     }
  //   }
  // };

  //Change span color
  function changeSpanColor(htmlContent) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, "text/html");
    const elements = doc.getElementsByClassName("OrgBrandColor");
    if (elements.length > 0) {
      // Loop through each element and change its color
      for (let i = 0; i < elements.length; i++) {
        elements[i].style.color = BrandColor;
      }
    }

    return doc.body.innerHTML;
  }

  const updateVisibleFieldsFromIds = (ids) => {
    if (typeof ids !== "string" || ids.trim() === "") {
      setVisibleFieldsCustomTemp(
        Object.fromEntries(Object.keys(fieldToIdMap).map((k) => [k, true])),
      );
      return;
    }

    const idList = ids
      .split(",")
      .map((x) => Number(x.trim()))
      .filter((x) => !Number.isNaN(x));

    setVisibleFieldsCustomTemp(
      Object.fromEntries(
        Object.entries(fieldToIdMap).map(([key, id]) => [
          key,
          idList.includes(id),
        ]),
      ),
    );
  };

  const buildServiceScopeText = (gpdList) => {
    if (!Array.isArray(gpdList) || gpdList.length === 0) return "-";
    const parts = gpdList
      .map((d) => {
        const name = d?.driverName;
        const value =
          d?.variationName ??
          (d?.driverValue !== null && d?.driverValue !== undefined
            ? String(d.driverValue)
            : null);
        if (!name || value === null || value === "") return null;
        return `${name} = ${value}`;
      })
      .filter(Boolean);
    return parts.length ? parts.join("; ") : "-";
  };

  const buildCustomServicePricingTableHtml = ({
    heading,
    serviceCatList,
    packageLabel,
    totals,
  }) => {
    const currencyID = organisationData?.otherInformation?.[0]?.currencyID;
    const currencySymbol = currencyID === 1 ? "£" : "";
    const taxName = "VAT";
    const isVatPresent = (Number(totals?.vatPercentage) || 0) > 0;

    const rows = (serviceCatList || [])
      .flatMap((cat) =>
        (cat?.servicesList || []).map((svc) => ({
          catID: cat?.serviceCatID,
          catName: cat?.serviceCatName || "",
          serviceID: svc?.serviceID,
          serviceName: svc?.serviceName || "",
          price: Number(svc?.quotationPrice) || 0,
          vatPct: Number(svc?.vatPercentage) || 0,
        })),
      )
      .filter((r) => r.serviceName);

    // Column order (match Engagement Letter / email):
    // Service Category, Services, Fees, VAT Rate, VAT, Fees inc VAT, Service Scope
    const headerCells = [
      visibleFieldsCustomTemp.serviceCategory
        ? `<th style="border: 1px solid #dddddd; text-align: left; padding: 8px; color: white; font-size: 18px;">Service Category</th>`
        : "",
      visibleFieldsCustomTemp.serviceName
        ? `<th style="border: 1px solid #dddddd; text-align: left; padding: 8px; color: white; font-size: 18px;">Services</th>`
        : "",
      visibleFieldsCustomTemp.fees
        ? `<th style="border: 1px solid #dddddd; text-align: right; padding: 8px; color: white; font-size: 18px;">Fees (${currencySymbol})</th>`
        : "",
      isVatPresent && visibleFieldsCustomTemp.vatRate
        ? `<th style="border: 1px solid #dddddd; text-align: right; padding: 8px; color: white; font-size: 18px;">${taxName} Rate</th>`
        : "",
      isVatPresent && visibleFieldsCustomTemp.vat
        ? `<th style="border: 1px solid #dddddd; text-align: right; padding: 8px; color: white; font-size: 18px;">${taxName} (${currencySymbol})</th>`
        : "",
      isVatPresent && visibleFieldsCustomTemp.feesIncVat
        ? `<th style="border: 1px solid #dddddd; text-align: right; padding: 8px; color: white; font-size: 18px;">Fees inc ${taxName} (${currencySymbol})</th>`
        : "",
      visibleFieldsCustomTemp.serviceScope
        ? `<th style="border: 1px solid #dddddd; text-align: left; padding: 8px; color: white; font-size: 18px;">Service Scope</th>`
        : "",
    ].join("");

    const bodyRows = rows
      .map((r) => {
        const vatAmount = (r.price * r.vatPct) / 100;
        const feesIncVat = r.price + vatAmount;
        const gpdList =
          (serviceDescriptionList || [])
            .find((d) => d?.serviceCatID === r.catID)
            ?.servicesList?.find((s) => s?.serviceID === r.serviceID)
            ?.gpdList || [];

        const canShowVat = (Number(r.vatPct) || 0) > 0;
        return `
          <tr>
            ${
              visibleFieldsCustomTemp.serviceCategory
                ? `<td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">${r.catName}</td>`
                : ""
            }
            ${
              visibleFieldsCustomTemp.serviceName
                ? `<td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">${r.serviceName}</td>`
                : ""
            }
            ${
              visibleFieldsCustomTemp.fees
                ? `<td style="border: 1px solid #dddddd; text-align: right; padding: 8px;">${
                    feeTypeId == 1
                      ? formatValue(r.price, currencyID)
                      : "&#10003;"
                  }</td>`
                : ""
            }
            ${
              isVatPresent && visibleFieldsCustomTemp.vatRate
                ? `<td style="border: 1px solid #dddddd; text-align: right; padding: 8px;">${
                    canShowVat ? `${r.vatPct}%` : ""
                  }</td>`
                : ""
            }
            ${
              isVatPresent && visibleFieldsCustomTemp.vat
                ? `<td style="border: 1px solid #dddddd; text-align: right; padding: 8px;">${
                    canShowVat
                      ? feeTypeId == 1
                        ? formatValue(vatAmount, currencyID)
                        : "&#10003;"
                      : ""
                  }</td>`
                : ""
            }
            ${
              isVatPresent && visibleFieldsCustomTemp.feesIncVat
                ? `<td style="border: 1px solid #dddddd; text-align: right; padding: 8px;">${
                    canShowVat
                      ? feeTypeId == 1
                        ? formatValue(feesIncVat, currencyID)
                        : "&#10003;"
                      : ""
                  }</td>`
                : ""
            }
            ${
              visibleFieldsCustomTemp.serviceScope
                ? `<td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">${buildServiceScopeText(
                    gpdList,
                  )}</td>`
                : ""
            }
          </tr>`;
      })
      .join("");

    const orderedCols = [
      {
        key: "serviceCategory",
        enabled: !!visibleFieldsCustomTemp.serviceCategory,
      },
      { key: "serviceName", enabled: !!visibleFieldsCustomTemp.serviceName },
      { key: "fees", enabled: !!visibleFieldsCustomTemp.fees },
      {
        key: "vatRate",
        enabled: isVatPresent && !!visibleFieldsCustomTemp.vatRate,
      },
      { key: "vat", enabled: isVatPresent && !!visibleFieldsCustomTemp.vat },
      {
        key: "feesIncVat",
        enabled: isVatPresent && !!visibleFieldsCustomTemp.feesIncVat,
      },
      { key: "serviceScope", enabled: !!visibleFieldsCustomTemp.serviceScope },
    ].filter((c) => c.enabled);

    const renderFooterRow = (label, rowBg, values) => {
      let isFirst = true;
      const cells = orderedCols
        .map((c) => {
          if (isFirst) {
            isFirst = false;
            return `<td style="border: 1px solid #DDDDDD; text-align: left; padding: 8px; color: ${
              rowBg === "#808080" ? "white" : "black"
            };">${label}</td>`;
          }
          if (c.key === "fees") {
            return `<td style="border: 1px solid #DDDDDD; text-align: right; padding: 8px; color: ${
              rowBg === "#808080" ? "white" : "black"
            };">${values.fees ?? ""}</td>`;
          }
          if (c.key === "vatRate") {
            return `<td style="border: 1px solid #DDDDDD; text-align: right; padding: 8px; color: ${
              rowBg === "#808080" ? "white" : "black"
            };"></td>`;
          }
          if (c.key === "vat") {
            return `<td style="border: 1px solid #DDDDDD; text-align: right; padding: 8px; color: ${
              rowBg === "#808080" ? "white" : "black"
            };">${values.vat ?? ""}</td>`;
          }
          if (c.key === "feesIncVat") {
            return `<td style="border: 1px solid #DDDDDD; text-align: right; padding: 8px; color: ${
              rowBg === "#808080" ? "white" : "black"
            };">${values.feesIncVat ?? ""}</td>`;
          }
          return `<td style="border: 1px solid #DDDDDD; text-align: right; padding: 8px; color: ${
            rowBg === "#808080" ? "white" : "black"
          };"></td>`;
        })
        .join("");

      return `<tr style="background-color: ${rowBg};">${cells}</tr>`;
    };

    const netTotal = Number(totals?.netTotal) || 0;
    const discounted = Number(totals?.discounted) || 0;
    const discountedTotal = Number(totals?.discountedTotal) || 0;
    const vatDiscounted = Number(totals?.vat) || 0; // API returns discount-adjusted VAT
    const grandTotal = Number(totals?.grandTotal) || 0;

    const discountApplies = discounted > 0;
    const showDiscountLines = !!ShowDiscountLine;

    // Derive pre-discount VAT (static VAT) from discount % when available.
    // This matches how template-6 email tables show Net Total VAT as pre-discount VAT,
    // and Discount VAT as the difference.
    const discPct = Number(totals?.discountPercentageWithAllDecimal) || 0;
    const discountFactor = 1 - discPct / 100;
    const vatStatic =
      discountApplies && discPct > 0 && discountFactor > 0
        ? vatDiscounted / discountFactor
        : vatDiscounted;
    const vatDiscount = vatStatic - vatDiscounted;

    // Net Total row: if we hide discount lines, show discounted totals directly (same behavior as email tables).
    const netFeesToShow =
      discountApplies && !showDiscountLines ? discountedTotal : netTotal;
    const netVatToShow =
      discountApplies && !showDiscountLines ? vatDiscounted : vatStatic;
    const netFeesIncVatToShow =
      netFeesToShow + (isVatPresent ? netVatToShow : 0);

    const footerRows = [
      // Net Total (always)
      renderFooterRow("Net Total", "#808080", {
        fees: formatValue(netFeesToShow, currencyID),
        vat: isVatPresent ? formatValue(netVatToShow, currencyID) : "",
        feesIncVat: isVatPresent
          ? formatValue(netFeesIncVatToShow, currencyID)
          : "",
      }),

      // Discount row (only when discount applies and we show discount lines)
      discountApplies && showDiscountLines
        ? renderFooterRow("Discount", "#DCDCDC", {
            fees: `(-) ${formatValue(discounted, currencyID)}`,
            vat: isVatPresent
              ? `(-) ${formatValue(vatDiscount, currencyID)}`
              : "",
            feesIncVat: isVatPresent
              ? `(-) ${formatValue(discounted + vatDiscount, currencyID)}`
              : "",
          })
        : "",

      // Final row after discount lines:
      // - VAT org: Grand Total
      // - Non-VAT org: Discounted Total
      discountApplies && showDiscountLines
        ? isVatPresent
          ? renderFooterRow("Grand Total", "#808080", {
              fees: formatValue(discountedTotal, currencyID),
              vat: formatValue(vatDiscounted, currencyID),
              feesIncVat: formatValue(grandTotal, currencyID),
            })
          : renderFooterRow("Discounted Total", "#808080", {
              fees: formatValue(discountedTotal, currencyID),
              vat: "",
              feesIncVat: "",
            })
        : "",
    ].join("");

    // Match Engagement Letter behavior: the package name sits inside the grid
    // (in the first "right side" column, usually Fees), with empty cells for the rest.
    const leftCols = [
      {
        key: "serviceCategory",
        enabled: !!visibleFieldsCustomTemp.serviceCategory,
      },
      { key: "serviceName", enabled: !!visibleFieldsCustomTemp.serviceName },
    ].filter((c) => c.enabled);
    const rightCols = [
      { key: "fees", enabled: !!visibleFieldsCustomTemp.fees },
      {
        key: "vatRate",
        enabled: isVatPresent && !!visibleFieldsCustomTemp.vatRate,
      },
      { key: "vat", enabled: isVatPresent && !!visibleFieldsCustomTemp.vat },
      {
        key: "feesIncVat",
        enabled: isVatPresent && !!visibleFieldsCustomTemp.feesIncVat,
      },
      { key: "serviceScope", enabled: !!visibleFieldsCustomTemp.serviceScope },
    ].filter((c) => c.enabled);

    const packageNameHeaderRow =
      packageLabel && rightCols.length > 0
        ? (() => {
            // Put the package name in the first available right-side column cell.
            // This avoids it drifting to the far-right when multiple right columns are visible.
            const nameIdx = 0;
            const leftTds = leftCols
              .map(
                () =>
                  `<td style="border: 1px solid #dddddd; padding: 8px;"></td>`,
              )
              .join("");
            const rightTds = rightCols
              .map((_, idx) => {
                if (idx === nameIdx) {
                  return `<td style="border: 1px solid #dddddd; text-align: right; padding: 8px; color: white; font-size: 18px;">${String(
                    packageLabel,
                  )}</td>`;
                }
                return `<td style="border: 1px solid #dddddd; padding: 8px;"></td>`;
              })
              .join("");
            return `<tr style="background-color: ${BrandColor};">${leftTds}${rightTds}</tr>`;
          })()
        : "";

    return `
      <div style="padding-left: 40px; padding-right: 40px; font-family:${fontFamily};page-break-inside: avoid; break-inside: avoid;">
        <p style="font-family:${fontFamily}; color: ${BrandColor}; font-size: 20px; margin-top: 15px;">${heading}</p>
        <table style="font-family:${fontFamily}; border-collapse: collapse; width: 100%; margin-top: -15px;">
          ${packageNameHeaderRow}
          <tr style="background-color: ${BrandColor};">
            ${headerCells}
          </tr>
          ${bodyRows}
          ${footerRows}
        </table>
      </div>
    `;
  };

  function getFontNameById(id) {
    const font = Utils.FontFamily.find((f) => f.value === id);
    return font ? font.label : null;
  }
  // Set Default Font
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
  //Generate Pdf Array and objects
  useEffect(() => {
    const currencyID = organisationData?.otherInformation?.[0]?.currencyID;
    const taxName =
      currencyID === 1
        ? "VAT"
        : currencyID === 2
          ? "EU VAT"
          : currencyID === 3
            ? "Sales Tax"
            : currencyID === 4
              ? "GST"
              : "";
    const currencySymbol =
      currencyID === 1
        ? "£"
        : currencyID === 2
          ? "€"
          : currencyID === 3
            ? "$"
            : currencyID === 4
              ? "₹"
              : "";
    if (templateElementList) {
      const pdfDataArray = [];
      let currentArray = [];
      let TermAndConditionAddedOrNot = templateElementList.some(
        (item) => item.templateElementTypeID === 11,
      );
      let prevElementType = null;
      templateElementList.forEach((element) => {
        switch (element.templateElementTypeID) {
          case ElementType.HEADING:
            if (
              prevElementType !== ElementType.PAGE_BREAK &&
              prevElementType !== ElementType.AWS_PDF_LINK
            ) {
              currentArray.push({
                textbox: ` ${imgTag}<div style="padding-left: 40px; padding-right: 40px; color:${BrandColor}; font-size: ${fontSizeHeading}; font-family:${fontFamily};">${element.headings} <br
                >
                <hr  style=" padding-left: 40px; padding-right: 40px; color: black; "></hr></div>`,
              });
            } else {
              pdfDataArray.push(currentArray);
              currentArray = [
                {
                  textbox: ` ${imgTag}<div style="padding-left: 40px; padding-right: 40px; color:${BrandColor}; font-size: ${fontSizeHeading};  font-family:${fontFamily};">${element.headings} <br
                  >
                  <hr  style=" padding-left: 40px; padding-right: 40px; color: black; "></hr></div>`,
                },
              ];
            }
            break;
          case ElementType.STATEMENT_OF_FACTS:
            if (
              prevElementType === ElementType.PAGE_BREAK ||
              prevElementType === ElementType.AWS_PDF_LINK
            ) {
              pdfDataArray.push(currentArray);
              currentArray = [];
            }
            currentArray.push({
              textbox: ` ${imgTag}<div style="padding-left: 40px; padding-right: 40px;margin-top: 10px"> 
                ${serviceDescriptionList
                  .map(
                    (serviceCat) => `
                      <div>
                          <p style="font-family:${fontFamily};color: black; font-size: ${fontSizeHeading}; font-weight: bold;">
                              ${serviceCat.serviceCatName}
                          </p>
                          <hr style="color: gray; margin-top: -15px;">
                          ${serviceCat.servicesList
                            .map(
                              (subService) => `
                              <p style="font-family:${fontFamily}; color:black; font-size: ${fontSize};">
                                  ${subService.serviceName}
                              </p>
                              ${
                                subService?.gpdList !== null
                                  ? subService?.gpdList
                                      .filter((item) => item.driverTypeID !== 1)
                                      ?.map(
                                        (pricingDriver) => `
                                <li style="font-family:${fontFamily}; color:black; font-size: ${fontSize}; margin-top:5px;">
                                ${pricingDriver.driverName}: 
                                <span style="">
                                     <strong> ${
                                       //formatValue(pricingDriver.driverValue)
                                       pricingDriver.driverTypeID === 2
                                         ? Number(pricingDriver.driverValue)
                                             .toFixed(
                                               pricingDriver.quantityDecimalPlaces ??
                                                 2,
                                             )
                                             .toString()
                                             .replace(
                                               /\B(?=(\d{3})+(?!\d))/g,
                                               ",",
                                             )
                                         : pricingDriver.driverTypeID === 3
                                           ? pricingDriver.variationName
                                           : pricingDriver.driverTypeID === 4
                                             ? pricingDriver.slabTypeID === 2
                                               ? formatValueWithoutCurrencySymbol(
                                                   pricingDriver.driverValue,
                                                 )
                                               : Number(pricingDriver.slabFrom)
                                                   .toFixed(
                                                     pricingDriver.decimalPlaces ??
                                                       2,
                                                   )
                                                   .toString()
                                                   .replace(
                                                     /\B(?=(\d{3})+(?!\d))/g,
                                                     ",",
                                                   ) +
                                                 "-" +
                                                 Number(pricingDriver.slabTo)
                                                   .toFixed(
                                                     pricingDriver.decimalPlaces ??
                                                       2,
                                                   )
                                                   .toString()
                                                   .replace(
                                                     /\B(?=(\d{3})+(?!\d))/g,
                                                     ",",
                                                   )
                                             : pricingDriver.driverTypeID === 5
                                               ? pricingDriver?.enteredText
                                               : pricingDriver.driverTypeID ===
                                                   6
                                                 ? pricingDriver?.enteredDate
                                                 : ""
                                     }</strong>
                                </span> 
                            </li>
                              `,
                                      )
                                      .join("")
                                  : ``
                              }
                          `,
                            )
                            .join("")}
                      </div>
                  `,
                  )
                  .join("")}
                                        ${
                                          AdditionalInformation?.length > 0
                                            ? `<p style="font-family:${fontFamily}; color: ${BrandColor}; font-size: ${fontSizeHeading}; font-weight: bold;">
        Additional Information
    </p>
    <hr style="color: gray; margin-top: -15px;" />` +
                                              AdditionalInformation.filter(
                                                (item) =>
                                                  item.driverTypeID !== 1,
                                              )
                                                .map(
                                                  (serviceCat) => `
        <div>
            <p style="font-family:${fontFamily}; color:black; font-size: ${fontSize};">
                ${serviceCat.driverName}:
                ${
                  serviceCat.driverTypeID === 4
                    ? serviceCat.slabTypeID === 2
                      ? `<strong>${formatValueWithoutCurrencySymbol_v1(serviceCat.driverValue)}</strong>`
                      : `<strong>
                  ${formatValueWithoutCurrencySymbol_v1(serviceCat.slabFrom, serviceCat.decimalPlaces ?? 2)}
                  -
                  ${formatValueWithoutCurrencySymbol_v1(serviceCat.slabTo, serviceCat.decimalPlaces ?? 2)}
                  </strong>`
                    : serviceCat.driverTypeID === 3
                      ? `<strong>${serviceCat.variationName}</strong>`
                      : serviceCat.driverTypeID === 5
                        ? `<strong>${serviceCat.enteredText}</strong>`
                        : serviceCat.driverTypeID === 6
                          ? `<strong>${serviceCat.enteredDate}</strong>`
                          : `${serviceCat.driverName}: <strong>${formatValueWithoutCurrencySymbol_v1(serviceCat.driverValue)}</strong>`
                }
            </p>
        </div>
    `,
                                                )
                                                .join("")
                                            : ""
                                        }

                  </div>`,
            });

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
                textbox: ` ${imgTag}<div style="padding-left: 40px; padding-right: 40px;font-family: ${fontFamily};">${appliedFontContent}</div>`,
              });
            } else {
              pdfDataArray.push(currentArray);
              currentArray = [
                {
                  // textbox: ` ${imgTag}<div style="padding-left: 40px; padding-right: 40px;">${replaceUrlInHtml(element.htmlContent)}</div>`,
                  textbox: ` ${imgTag}<div style="padding-left: 40px; padding-right: 40px; font-family: ${fontFamily};">${appliedFontContent}</div>`,
                },
              ];
            }
            break;
          case ElementType.FULL_PAGE_HEADING:
            if (
              prevElementType !== ElementType.PAGE_BREAK &&
              prevElementType !== ElementType.AWS_PDF_LINK
            ) {
              currentArray.push({
                // textbox: `<div style="padding-left: 40px; padding-right: 40px; margin-top: 350px;">${element.htmlContent}</div>`,
                textbox: ` ${imgTag}<div style="text-align: center; padding-left: 40px; padding-right: 40px; color: ${BrandColor}; font-size: ${fontSizeHeading};  margin-top: 350px; font-family:${fontFamily};">${element.headings} <br
                  >
                  <hr  style=" padding-left: 40px; padding-right: 40px; color: black; "></hr><div style=" color: Black; font-size: ${fontSize}; font-family:${fontFamily};">${element.shortDesc}</div></div>
                 `,
              });
            } else {
              pdfDataArray.push(currentArray);
              currentArray = [
                {
                  // textbox: `<div style="padding-left: 40px; padding-right: 40px; margin-top: 350px;">${element.htmlContent}</div>`,
                  textbox: ` ${imgTag}<div style=" text-align: center; padding-left: 40px; padding-right: 40px; color: ${BrandColor}; font-size: ${fontSizeHeading};  margin-top: 350px; font-family:${fontFamily};">${element.headings} <br
                    >
                    <hr  style=" padding-left: 40px; padding-right: 40px; color: black; "></hr> <div style="color: Black; font-size: ${fontSize}; font-family:${fontFamily};">${element.shortDesc}</div></div>
                   `,
                },
              ];
            }
            break;
          case ElementType.SIGNATURE_BLOCK:
            // const signatureObjects = [];
            // Include officers based on image URL and map to opposite side

            const signatureImageUrl =
              organisationData?.otherInformation?.[0]?.signatureImageUrl;

            let rightSignatureList = contractSignatoriesList.filter(
              (x) => x.signaturePositionID === 1 && x.officerType === null,
            );
            let leftSignatureList = contractSignatoriesList.filter(
              (x) => x.signaturePositionID === 2 && x.officerType === null,
            );
            let contractSignatoryRowNoForOfficer =
              contractSignatoriesList.filter((x) => x.officerType !== null);

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
                const org = organisationData.otherInformation[0];
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
                const org = organisationData.otherInformation[0];
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
            // const signatureObject = {
            //   textbox: htmlContentForSignatories,
            // };
            // signatureObjects.push(signatureObject);
            // pdfDataArray.push(signatureObjects);
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
          case ElementType.First_Page:
            if (isDefaultFirstPage) {
              const coloredHtmlContent = changeSpanColor(element.htmlContent);
              if (
                prevElementType !== ElementType.PAGE_BREAK &&
                prevElementType !== ElementType.AWS_PDF_LINK
              ) {
                currentArray.push({
                  textbox: `<div data-first-page="true" style="font-family: ${fontFamily};">${coloredHtmlContent}</div>`,
                });
              } else {
                pdfDataArray.push(currentArray);
                currentArray = [
                  {
                    textbox: `<div data-first-page="true" style="font-family: ${fontFamily};">${coloredHtmlContent}</div>`,
                  },
                ];
              }
            }
            break;
          case ElementType.SERVICE_PRICING_TABLE:
            if (
              prevElementType === ElementType.PAGE_BREAK ||
              prevElementType === ElementType.AWS_PDF_LINK
            ) {
              pdfDataArray.push(currentArray);
              currentArray = [];
            }
            if (
              typeof pricingTableColumnIDs === "string" &&
              pricingTableColumnIDs.trim() !== ""
            ) {
              const selectedPackageName =
                packageList?.[0]?.servicePackageName || "";

              if (recurringServiceCatList?.length > 0) {
                const recurringTotals =
                  finalQuotationAmountList?.find(
                    (x) =>
                      Number(x?.serviceChargeTypeID) === 1 &&
                      (packageList?.[0]?.servicePackageID
                        ? Number(x?.servicePackageID) ===
                          Number(packageList?.[0]?.servicePackageID)
                        : true),
                  ) || null;
                currentArray.push({
                  table: buildCustomServicePricingTableHtml({
                    heading: `Recurring Fees (${getPaymentFrequencyLabel()})`,
                    serviceCatList: recurringServiceCatList,
                    packageLabel: selectedPackageName,
                    totals: recurringTotals,
                  }),
                });
              }

              if (oneOffServiceCatList?.length > 0) {
                const oneOffTotals =
                  finalQuotationAmountList?.find(
                    (x) =>
                      Number(x?.serviceChargeTypeID) === 2 &&
                      (packageList?.[0]?.servicePackageID
                        ? Number(x?.servicePackageID) ===
                          Number(packageList?.[0]?.servicePackageID)
                        : true),
                  ) || null;
                currentArray.push({
                  table: buildCustomServicePricingTableHtml({
                    heading: "One-Off Fees",
                    serviceCatList: oneOffServiceCatList,
                    packageLabel: selectedPackageName,
                    totals: oneOffTotals,
                  }),
                });
              }

              break;
            }
            if (packageList.length > 0) {
              currentArray.push({
                table: packageList.map(
                  (selectedPackagesData) =>
                    ` ${imgTag}<div style="padding-left: 40px; padding-right: 40px; color:${BrandColor}; font-size: 30px;">Package :${selectedPackagesData.servicePackageName} </div>`,
                ),
              });

              if (recurringServiceCatList.length > 0) {
                currentArray.push({
                  table: `
                              <div style="padding-left: 40px; padding-right: 40px; font-family:${fontFamily};page-break-inside: avoid; break-inside: avoid;">
                                <p style="font-family:${fontFamily}; color: ${BrandColor}; font-size: 20px; margin-top: 15px;">Recurring Fees (${getPaymentFrequencyLabel()})</p>
                                <table style="font-family:${fontFamily}; border-collapse: collapse; width: 100%; margin-top: -15px;">
                                  <tr style="background-color: ${BrandColor};">
                                    <th style="border: 1px solid #dddddd; text-align: left; padding: 8px; color: white; font-size: 18px;">Services</th>
                                    ${packageList
                                      .map(
                                        (selectedPackagesData) => `
                                      <th style="border: 1px solid #dddddd; text-align: right; padding: 8px; color: white; font-size: 18px;">
                                        ${selectedPackagesData.servicePackageName}
                                      </th>`,
                                      )
                                      .join("")}
                                  </tr>
                                  ${recurringServiceCatList
                                    .map(
                                      (serviceCat) => `
                                    <tr style="background-color: #DCDCDC;">
                                      <td style="border: 1px solid #dddddd; text-align: left; padding: 8px; font-weight: bold; font-size: 18px;">
                                        ${serviceCat.serviceCatName}
                                      </td>
                                      <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;"></td>
                                    </tr>
                                    ${serviceCat.servicesList
                                      .map(
                                        (subService) => `
                                      <tr>
                                        <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">
                                          ${subService.serviceName}
                                        </td>
                                 ${
                                   feeTypeId == 1
                                     ? `<td style="border: 1px solid #DDDDDD; text-align: right; padding: 8px;"> ${formatValue(
                                         subService.quotationPrice,
                                         currencyID,
                                       )}</td>`
                                     : `<td style="border: 1px solid #DDDDDD; text-align: right; padding: 8px;">&#10003;</td>`
                                 }

                                      </tr>`,
                                      )
                                      .join("")}
                                  `,
                                    )
                                    .join("")}
                                  <tr style="background-color:#808080;">
                                    <td style="border: 1px solid #dddddd; text-align: left; padding: 8px; color: white;">
                                      Net Total
                                    </td>
                                    <td style="border: 1px solid #dddddd; text-align: right; padding: 8px; color: white;">
                                        ${finalQuotationAmountList
                                          .filter(
                                            (x) =>
                                              x.serviceChargeTypeID === 1 &&
                                              x.servicePackageID ===
                                                packageList[0]
                                                  ?.servicePackageID,
                                          )
                                          .map((x) =>
                                            x.netTotal < x.discountedTotal ||
                                            (x.discounted > 0 &&
                                              !ShowDiscountLine)
                                              ? formatValue(
                                                  x.discountedTotal,
                                                  currencyID,
                                                )
                                              : formatValue(
                                                  x.netTotal,
                                                  currencyID,
                                                ),
                                          )
                                          .join("")}
                                    </td>
                                  </tr>
                                  ${
                                    finalQuotationAmountList.some(
                                      (x) =>
                                        x.serviceChargeTypeID === 1 &&
                                        x.discounted > 0,
                                    ) && ShowDiscountLine
                                      ? `
                                    <tr style="background-color: #DCDCDC;">
                                      <td style="border: 1px solid #dddddd; text-align: left; padding: 8px; color: black;">
                                        Discount
                                      </td>
                                      <td style="border: 1px solid #dddddd; text-align: right; padding: 8px; color: black;">
                                        (-)  ${finalQuotationAmountList
                                          .filter(
                                            (x) =>
                                              x.serviceChargeTypeID === 1 &&
                                              x.servicePackageID ===
                                                packageList[0]
                                                  ?.servicePackageID,
                                          )
                                          .map((x) =>
                                            formatValue(
                                              x.discounted,
                                              currencyID,
                                            ),
                                          )
                                          .join("")}
                                      </td>
                                    </tr>
                                  <tr style="background-color:#808080;">
                                    <td style="border: 1px solid #dddddd; text-align: left; padding: 8px; color: white;">
                                      Discounted Total
                                    </td>
                                    <td style="border: 1px solid #dddddd; text-align: right; padding: 8px; color: white;">
                                       ${finalQuotationAmountList
                                         .filter(
                                           (x) =>
                                             x.serviceChargeTypeID === 1 &&
                                             x.servicePackageID ===
                                               packageList[0]?.servicePackageID,
                                         )
                                         .map((x) =>
                                           formatValue(
                                             x.discountedTotal,
                                             currencyID,
                                           ),
                                         )
                                         .join("")}
                                    </td>
                                  </tr>`
                                      : ""
                                  }
                                     ${
                                       finalQuotationAmountList.some(
                                         (x) =>
                                           x.serviceChargeTypeID === 1 &&
                                           x.vat > 0,
                                       )
                                         ? `
                                  <tr style="background-color: #DCDCDC;">
                                    <td style="border: 1px solid #dddddd; text-align: left; padding: 8px; color: black;">
                                      ${taxName}
                                    </td>
                                    <td style="border: 1px solid #dddddd; text-align: right; padding: 8px; color: black;">
                                       ${finalQuotationAmountList
                                         .filter(
                                           (x) =>
                                             x.serviceChargeTypeID === 1 &&
                                             x.servicePackageID ===
                                               packageList[0]?.servicePackageID,
                                         )
                                         .map((x) =>
                                           formatValue(x.vat, currencyID),
                                         )
                                         .join("")}
                                    </td>
                                  </tr>
                                  <tr style="background-color:#808080;">
                                    <td style="border: 1px solid #dddddd; text-align: left; padding: 8px; color: white;">
                                      Grand Total
                                    </td>
                                    <td style="border: 1px solid #dddddd; text-align: right; padding: 8px; color: white;">
                                       ${finalQuotationAmountList
                                         .filter(
                                           (x) =>
                                             x.serviceChargeTypeID === 1 &&
                                             x.servicePackageID ===
                                               packageList[0]?.servicePackageID,
                                         )
                                         .map((x) =>
                                           formatValue(
                                             x.grandTotal,
                                             currencyID,
                                           ),
                                         )
                                         .join("")}
                                    </td>
                                  </tr>`
                                         : ""
                                     }
                                </table>
                              </div>
                            `,
                });
              }

              if (oneOffServiceCatList.length > 0) {
                currentArray.push({
                  table: `
                                <div style="padding-left: 40px; padding-right: 40px; font-family:${fontFamily};page-break-inside: avoid; break-inside: avoid;">

                                  <p style="font-family:${fontFamily}; color: ${BrandColor}; font-size: 20px; margin-top: 15px;"> One-Off Fees </p>
                                  <table style="font-family:${fontFamily}; border-collapse: collapse; width: 100%; margin-top: -15px;">
                                  <tr style="background-color: ${BrandColor};">
                                    <th style="border: 1px solid #dddddd; text-align: left; padding: 8px; color: white; font-size: 18px;">Services</th>
                                    ${packageList
                                      .map(
                                        (selectedPackagesData) => `
                                      <th style="border: 1px solid #dddddd; text-align: right; padding: 8px; color: white; font-size: 18px;">
                                        ${selectedPackagesData.servicePackageName}
                                      </th>`,
                                      )
                                      .join("")}
                                  </tr>
                                  ${oneOffServiceCatList
                                    .map(
                                      (serviceCat) => `
                                    <tr style="background-color: #DCDCDC;">
                                      <td style="border: 1px solid #dddddd; text-align: left; padding: 8px; font-weight: bold; font-size: 18px;">
                                        ${serviceCat.serviceCatName}
                                      </td>
                                      <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;"></td>
                                    </tr>
                                    ${serviceCat.servicesList
                                      .map(
                                        (subService) => `
                                      <tr>
                                        <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">
                                          ${subService.serviceName}
                                        </td>
                                        ${
                                          feeTypeId == 1
                                            ? `<td style="border: 1px solid #DDDDDD; text-align: right; padding: 8px;"> ${formatValue(
                                                subService.quotationPrice,
                                                currencyID,
                                              )}</td>`
                                            : `<td style="border: 1px solid #DDDDDD; text-align: right; padding: 8px;">&#10003;</td>`
                                        }

                                      </tr>`,
                                      )
                                      .join("")}
                                  `,
                                    )
                                    .join("")}
                                  <tr style="background-color:#808080;">
                                    <td style="border: 1px solid #dddddd; text-align: left; padding: 8px; color: white;">
                                      Net Total
                                    </td>
                                    <td style="border: 1px solid #dddddd; text-align: right; padding: 8px; color: white;">
                                     ${finalQuotationAmountList
                                       .filter(
                                         (x) =>
                                           x.serviceChargeTypeID === 2 &&
                                           x.servicePackageID ===
                                             packageList[0]?.servicePackageID,
                                       )
                                       .map((x) =>
                                         x.netTotal < x.discountedTotal ||
                                         (x.discounted > 0 && !ShowDiscountLine)
                                           ? formatValue(
                                               x.discountedTotal,
                                               currencyID,
                                             )
                                           : formatValue(
                                               x.netTotal,
                                               currencyID,
                                             ),
                                       )
                                       .join("")}
                                    </td>
                                  </tr>
                                   ${
                                     finalQuotationAmountList.some(
                                       (x) =>
                                         x.serviceChargeTypeID === 2 &&
                                         x.discounted > 0,
                                     ) && ShowDiscountLine
                                       ? `
                                    <tr style="background-color: #DCDCDC;">
                                      <td style="border: 1px solid #dddddd; text-align: left; padding: 8px; color: black;">
                                        Discount
                                      </td>
                                      <td style="border: 1px solid #dddddd; text-align: right; padding: 8px; color: black;">
                                        (-)  ${finalQuotationAmountList
                                          .filter(
                                            (x) =>
                                              x.serviceChargeTypeID === 2 &&
                                              x.servicePackageID ===
                                                packageList[0]
                                                  ?.servicePackageID,
                                          )
                                          .map((x) =>
                                            formatValue(
                                              x.discounted,
                                              currencyID,
                                            ),
                                          )
                                          .join("")}
                                      </td>
                                    </tr>
                                  <tr style="background-color:#808080;">
                                    <td style="border: 1px solid #dddddd; text-align: left; padding: 8px; color: white;">
                                      Discounted Total
                                    </td>
                                    <td style="border: 1px solid #dddddd; text-align: right; padding: 8px; color: white;">
                                       ${finalQuotationAmountList
                                         .filter(
                                           (x) =>
                                             x.serviceChargeTypeID === 2 &&
                                             x.servicePackageID ===
                                               packageList[0]?.servicePackageID,
                                         )
                                         .map((x) =>
                                           formatValue(
                                             x.discountedTotal,
                                             currencyID,
                                           ),
                                         )
                                         .join("")}
                                    </td>
                                  </tr>`
                                       : ""
                                   }
                                     ${
                                       finalQuotationAmountList.some(
                                         (x) =>
                                           x.serviceChargeTypeID === 2 &&
                                           x.vat > 0,
                                       )
                                         ? `
                                  <tr style="background-color: #DCDCDC;">
                                    <td style="border: 1px solid #dddddd; text-align: left; padding: 8px; color: black;">
                                      ${taxName}
                                    </td>
                                    <td style="border: 1px solid #dddddd; text-align: right; padding: 8px; color: black;">
                                       ${finalQuotationAmountList
                                         .filter(
                                           (x) =>
                                             x.serviceChargeTypeID === 2 &&
                                             x.servicePackageID ===
                                               packageList[0]?.servicePackageID,
                                         )
                                         .map((x) =>
                                           formatValue(x.vat, currencyID),
                                         )
                                         .join("")}
                                    </td>
                                  </tr>
                                  <tr style="background-color:#808080;">
                                    <td style="border: 1px solid #dddddd; text-align: left; padding: 8px; color: white;">
                                      Grand Total
                                    </td>
                                    <td style="border: 1px solid #dddddd; text-align: right; padding: 8px; color: white;">
                                       ${finalQuotationAmountList
                                         .filter(
                                           (x) =>
                                             x.serviceChargeTypeID === 2 &&
                                             x.servicePackageID ===
                                               packageList[0]?.servicePackageID,
                                         )
                                         .map((x) =>
                                           formatValue(
                                             x.grandTotal,
                                             currencyID,
                                           ),
                                         )
                                         .join("")}
                                    </td>
                                  </tr>`
                                         : ""
                                     }
                                </table>
                                </div>
                              `,
                });
              }
            } else {
              if (recurringServiceCatList.length > 0 && quoteTypeID !== 4) {
                currentArray.push({
                  table: ` ${imgTag}
                          <div style="padding: 40px; padding-top:0px; font-family:${fontFamily};page-break-inside: avoid; break-inside: avoid;">
                            <p style="font-family:${fontFamily}; color: ${BrandColor}; font-size: 20px; margin-top: 0px;">Recurring Fees (${getPaymentFrequencyLabel()})</p>
                            <table style="font-family:${fontFamily}; border-collapse: collapse; width: 100%; margin-top: -15px;">
                              <tr style="background-color: ${BrandColor};">
                                <th style="border: 1px solid #dddddd; text-align: left; padding: 8px; color: white; font-size: 18px;">Services</th>
                                <th style="border: 1px solid #dddddd; text-align: right; padding: 8px; color: white; font-size: 18px;">Fees (£)</th>
                              </tr>
                              ${recurringServiceCatList
                                .map(
                                  (serviceCat) => `
                                <tr style="background-color: #eee;">
                                  <td style="border: 1px solid #dddddd; text-align: left; padding: 8px; font-weight: bold; font-size: 18px;">
                                    ${serviceCat.serviceCatName}
                                  </td>
                                  <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;"></td>
                                </tr>
                                ${serviceCat.servicesList
                                  .map(
                                    (subService) => `
                                  <tr>
                                    <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">
                                      ${subService.serviceName}
                                    </td>
                                          ${
                                            feeTypeId == 1
                                              ? `<td style="border: 1px solid #DDDDDD; text-align: right; padding: 8px;"> ${formatValue(
                                                  subService.quotationPrice,
                                                  currencyID,
                                                )}</td>`
                                              : `<td style="border: 1px solid #DDDDDD; text-align: right; padding: 8px;">&#10003;</td>`
                                          }
                                  </tr>`,
                                  )
                                  .join("")}
                              `,
                                )
                                .join("")}
                              ${ChargeTypeId1Array.map(
                                (value) => `
                                <tr style="background-color:#808080;">
                                  <td style="border: 1px solid #dddddd; text-align: left; padding: 8px; color: white;">
                                    Net Total
                                  </td>
                                  <td style="border: 1px solid #dddddd; text-align: right; padding: 8px; color: white;">
                                     ${
                                       value.netTotal < value.discountedTotal ||
                                       (Number(value?.discounted) > 0 &&
                                         !ShowDiscountLine)
                                         ? formatValue(
                                             value.discountedTotal,
                                             currencyID,
                                           )
                                         : formatValue(
                                             value.netTotal,
                                             currencyID,
                                           )
                                     }
                                  </td>
                                </tr>
                                ${
                                  value?.discounted !== null &&
                                  value?.discounted !== 0.0 &&
                                  ShowDiscountLine
                                    ? `
                                  <tr style="background-color: #DCDCDC;">
                                    <td style="border: 1px solid #dddddd; text-align: left; padding: 8px; color: black;">
                                      Discount
                                    </td>
                                    <td style="border: 1px solid #dddddd; text-align: right; padding: 8px; color: black;">
                                      (-)  ${formatValue(value?.discounted, currencyID)}
                                    </td>
                                  </tr>
                                  <tr style="background-color:#808080;">
                                    <td style="border: 1px solid #dddddd; text-align: left; padding: 8px; color: white;">
                                      Discounted Total
                                    </td>
                                    <td style="border: 1px solid #dddddd; text-align: right; padding: 8px; color: white;">
                                       ${formatValue(value?.discountedTotal, currencyID)}
                                    </td>
                                  </tr>`
                                    : ""
                                }
                                ${
                                  value?.vat !== null && value?.vat !== 0.0
                                    ? `
                                  <tr style="background-color: #DCDCDC;">
                                    <td style="border: 1px solid #dddddd; text-align: left; padding: 8px; color: black;">
                                      ${taxName}
                                    </td>
                                    <td style="border: 1px solid #dddddd; text-align: right; padding: 8px; color: black;">
                                       ${formatValue(value?.vat, currencyID)}
                                    </td>
                                  </tr>
                                  <tr style="background-color:#808080;">
                                    <td style="border: 1px solid #dddddd; text-align: left; padding: 8px; color: white;">
                                      Grand Total
                                    </td>
                                    <td style="border: 1px solid #dddddd; text-align: right; padding: 8px; color: white;">
                                       ${formatValue(value?.grandTotal, currencyID)}
                                    </td>
                                  </tr>`
                                    : ""
                                }
                              `,
                              ).join("")}
                            </table>
                          </div>
                        `,
                });
              }
              // Check if selectedOneOffServiceList has items
              if (oneOffServiceCatList.length > 0 && quoteTypeID !== 4) {
                // Append the table for selectedOneOffServiceList
                currentArray.push({
                  table: `
                                <div style="padding: 40px; padding-top:0px; font-family:${fontFamily};page-break-inside: avoid; break-inside: avoid;">
                                  <p style="font-family:${fontFamily}; color: ${BrandColor}; font-size: 20px;margin-top: 0px;">One-Off Fees</p>
                                  <table style="font-family:${fontFamily}; border-collapse: collapse; width: 100%; margin-top: -15px;">
                                    <tr style="background-color: ${BrandColor};">
                                      <th style="border: 1px solid #dddddd; text-align: left; padding: 8px; color: white; font-size: 18px;">Services</th>
                                      <th style="border: 1px solid #dddddd; text-align: right; padding: 8px; color: white; font-size: 18px;">Fees ()</th>
                                    </tr>
                                    ${oneOffServiceCatList
                                      .map(
                                        (serviceCat) => `
                                      <tr style="background-color:#eee;">
                                        <td style="border: 1px solid #dddddd; text-align: left; padding: 8px; font-weight: bold; font-size: 18px;">
                                          ${serviceCat.serviceCatName}
                                        </td>
                                        <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;"></td>
                                      </tr>
                                      ${serviceCat.servicesList
                                        .map(
                                          (subService) => `
                                        <tr>
                                    <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">
                                      ${subService.serviceName}
                                    </td>
                                          ${
                                            feeTypeId == 1
                                              ? `<td style="border: 1px solid #DDDDDD; text-align: right; padding: 8px;"> ${formatValue(
                                                  subService.quotationPrice,
                                                  currencyID,
                                                )}</td>`
                                              : `<td style="border: 1px solid #DDDDDD; text-align: right; padding: 8px;">&#10003;</td>`
                                          }
                                  </tr>`,
                                        )
                                        .join("")}
                                    `,
                                      )
                                      .join("")}
                                    ${ChargeTypeId2Array.map(
                                      (value) => `
                                      <tr style="background-color:#808080;">
                                        <td style="border: 1px solid #dddddd; text-align: left; padding: 8px; color: white;">
                                          Net Total
                                        </td>
                                        <td style="border: 1px solid #dddddd; text-align: right; padding: 8px; color: white;">
                                           ${
                                             value.netTotal <
                                               value.discountedTotal ||
                                             (Number(value?.discounted) > 0 &&
                                               !ShowDiscountLine)
                                               ? formatValue(
                                                   value.discountedTotal,
                                                   currencyID,
                                                 )
                                               : formatValue(
                                                   value.netTotal,
                                                   currencyID,
                                                 )
                                           }
                                        </td>
                                      </tr>
                                      ${
                                        value?.discounted !== null &&
                                        value?.discounted !== 0.0 &&
                                        ShowDiscountLine
                                          ? `
                                        <tr style="background-color: #DCDCDC;">
                                          <td style="border: 1px solid #dddddd; text-align: left; padding: 8px; color: black;">
                                            Discount
                                          </td>
                                          <td style="border: 1px solid #dddddd; text-align: right; padding: 8px; color: black;">
                                            (-)  ${formatValue(
                                              value.discounted,
                                              currencyID,
                                            )}
                                          </td>
                                        </tr>
                                        <tr style="background-color:#808080;">
                                          <td style="border: 1px solid #dddddd; text-align: left; padding: 8px; color: white;">
                                            Discounted Total
                                          </td>
                                          <td style="border: 1px solid #dddddd; text-align: right; padding: 8px; color: white;">
                                             ${formatValue(
                                               value.discountedTotal,
                                               currencyID,
                                             )}
                                          </td>
                                        </tr>`
                                          : ""
                                      }
                                      ${
                                        value?.vat !== null &&
                                        value?.vat !== 0.0
                                          ? `
                                        <tr style="background-color: #DCDCDC;">
                                          <td style="border: 1px solid #dddddd; text-align: left; padding: 8px; color: black;">
                                            ${taxName}
                                          </td>
                                          <td style="border: 1px solid #dddddd; text-align: right; padding: 8px; color: black;">
                                             ${formatValue(value.vat, currencyID)}
                                          </td>
                                        </tr>
                                        <tr style="background-color:#808080;">
                                          <td style="border: 1px solid #dddddd; text-align: left; padding: 8px; color: white;">
                                            Grand Total
                                          </td>
                                          <td style="border: 1px solid #dddddd; text-align: right; padding: 8px; color: white;">
                                             ${formatValue(value.grandTotal, currencyID)}
                                          </td>
                                        </tr>`
                                          : ""
                                      }
                                    `,
                                    ).join("")}
                                  </table>
                                </div>
                              `,
                });
              }
            }

            break;
          case ElementType.SERVICE_DESCRIPTION:
            if (
              prevElementType !== ElementType.PAGE_BREAK &&
              prevElementType !== ElementType.AWS_PDF_LINK
            ) {
              currentArray.push({
                textbox: ` ${imgTag}<div style="padding-left: 40px; padding-right: 40px;margin-top: 10px">                
                                ${serviceDescriptionList
                                  .map(
                                    (serviceCat) => `
                      <div>
                          <p style="font-family:${fontFamily};font-size: ${fontSizeHeading};color: black;font-weight: bold;">
                              ${serviceCat.serviceCatName}
                          </p>
                          <hr style="color: gray; margin-top:-5px;">
                          ${serviceCat.servicesList
                            .map(
                              (subService) => `
                              <p style="font-family:${fontFamily}; color:black; font-size: ${fontSize}; ">
                                  ${subService.serviceName}
                              </p>
                              <p>
                                 
                              ${
                                subService.description === null ||
                                subService.description === undefined ||
                                subService.description === ""
                                  ? ""
                                  : subService.description
                              }
                              </p>
                             
                          `,
                            )
                            .join("")}
                      </div>
                  `,
                                  )
                                  .join("")}
                  
               
                </div >
                    `,
              });
            } else {
              pdfDataArray.push(currentArray);
              currentArray = [
                {
                  textbox: ` ${imgTag}<div style="padding-left: 40px; padding-right: 40px;margin-top: 10px">                    
              ${serviceDescriptionList
                .map(
                  (serviceCat) => `
                      <div>
                          <p style="font-family:${fontFamily}; color: black; font-size: ${fontSizeHeading}; font-weight: bold;">
                              ${serviceCat.serviceCatName}
                          </p>
                          <hr style="color: gray; margin-top: -5px;">
                          ${serviceCat.servicesList
                            .map(
                              (subService) => `
                              <p style="font-family:${fontFamily}; color:black; font-size: ${fontSize}; ">
                                  ${subService.serviceName}
                              </p>
                              <p>
                                  ${
                                    subService.description === null ||
                                    subService.description === undefined ||
                                    subService.description === ""
                                      ? ""
                                      : subService.description
                                  }
                              </p>
                             
                          `,
                            )
                            .join("")}
                      </div>
                  `,
                )
                .join("")}
                  </div >
                  
                  `,
                },
              ];
            }
            break;
          case ElementType.PAGE_BREAK:
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
              TnCHtmlContent,
              fontFamily,
            );
            if (
              prevElementType === ElementType.PAGE_BREAK ||
              prevElementType === ElementType.AWS_PDF_LINK
            ) {
              if (TnCHtmlContent || TnCPdf) {
                if (TnCHtmlContent !== null && TnCHtmlContent !== undefined) {
                  currentArray.push({
                    textbox: `<div style="padding-left: 40px; padding-right: 40px; color:${BrandColor}; font-size: ${fontSizeHeading}; font-family:${fontFamily}" >TERMS & CONDITIONS<br>
                              <hr style="padding-left: 40px; padding-right: 40px; color: black;"></hr></div>
                                <div style="padding-left: 40px; padding-right: 40px;">${appliedFontTNCContent}</div>`,
                  });
                } else if (TnCPdf !== null || TnCHtmlContent === null) {
                  pdfDataArray.push(currentArray);
                  currentArray = [];
                  currentArray.push({
                    ["awsLink"]: TnCPdf,
                  });
                }
              }
            } else {
              pdfDataArray.push(currentArray);
              if (TnCHtmlContent || TnCPdf) {
                if (TnCHtmlContent !== null && TnCHtmlContent !== undefined) {
                  currentArray = [
                    {
                      textbox: `<div style="padding-left: 40px; padding-right: 40px; color:${BrandColor}; font-size: ${fontSizeHeading}; font-family:${fontFamily}" >TERMS & CONDITIONS<br>
                                  <hr style="padding-left: 40px; padding-right: 40px; color: black;"></hr></div>
                                    <div style="padding-left: 40px; padding-right: 40px;">${appliedFontTNCContent}</div>`,
                    },
                  ];
                } else if (TnCPdf !== null || TnCHtmlContent === null) {
                  currentArray = [
                    {
                      ["awsLink"]: TnCPdf,
                    },
                  ];
                }
              }
            }
            break;
          default:
            if (TnCHtmlContent || TnCPdf) {
              if (!TermAndConditionAddedOrNot) {
                const appliedFontTNCContent = setDefaultFontFamily(
                  TnCHtmlContent,
                  fontFamily,
                );
                if (
                  prevElementType === ElementType.PAGE_BREAK ||
                  prevElementType === ElementType.AWS_PDF_LINK
                ) {
                  if (TnCHtmlContent || TnCPdf) {
                    if (
                      TnCHtmlContent !== null &&
                      TnCHtmlContent !== undefined
                    ) {
                      currentArray.push({
                        textbox: `<div style="padding-left: 40px; padding-right: 40px; color:${BrandColor}; font-size: ${fontSizeHeading}; font-family:${fontFamily}" >TERMS & CONDITIONS<br>
                                  <hr style="padding-left: 40px; padding-right: 40px; color: black;"></hr></div>
                                    <div style="padding-left: 40px; padding-right: 40px;">${appliedFontTNCContent}</div>`,
                      });
                    } else if (TnCPdf !== null || TnCHtmlContent === null) {
                      pdfDataArray.push(currentArray);
                      currentArray = [];
                      currentArray.push({
                        ["awsLink"]: TnCPdf,
                      });
                    }
                  }
                } else {
                  pdfDataArray.push(currentArray);
                  if (TnCHtmlContent || TnCPdf) {
                    if (
                      TnCHtmlContent !== null &&
                      TnCHtmlContent !== undefined
                    ) {
                      currentArray = [
                        {
                          textbox: `<div style="padding-left: 40px; padding-right: 40px; color:${BrandColor}; font-size: ${fontSizeHeading}; font-family:${fontFamily}" >TERMS & CONDITIONS<br>
                                      <hr style="padding-left: 40px; padding-right: 40px; color: black;"></hr></div>
                                        <div style="padding-left: 40px; padding-right: 40px;">${appliedFontTNCContent}</div>`,
                        },
                      ];
                    } else if (TnCPdf !== null || TnCHtmlContent === null) {
                      currentArray = [
                        {
                          ["awsLink"]: TnCPdf,
                        },
                      ];
                    }
                  }
                }
              }
              const signatureImageUrl =
                organisationData?.otherInformation?.[0]?.signatureImageUrl;

              let rightSignatureList = contractSignatoriesList.filter(
                (x) => x.signaturePositionID === 1 && x.officerType === null,
              );
              let leftSignatureList = contractSignatoriesList.filter(
                (x) => x.signaturePositionID === 2 && x.officerType === null,
              );
              let contractSignatoryRowNoForOfficer =
                contractSignatoriesList.filter((x) => x.officerType !== null);

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
                  const org = organisationData.otherInformation[0];
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
                  const org = organisationData.otherInformation[0];
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
  }, [templateElementList]);

  //Send data to node js api For Generate Single Pdf .
  const sendDataToBackend = async (
    generatePdfData,
    index,
    email,
    phone,
    fullAddress,
    BrandColor,
    webSite,
  ) => {
    const postData = {
      userId: common.userKeyID,
      email: email,
      mobile: phone,
      fullAddress: fullAddress,
      genratedPdfData: generatePdfData,
      sequence: index + 1,
      color: BrandColor,
      webSite: webSite,
      BrandLogo: BrandLogo,
      fontSizeContent: fontSize,
      fontFamily: fontFamily,
      HeaderContent: HeaderContent,
      FooterContent: FooterContent,
      HeaderHeight: HeaderHeight,
      FooterHeight: FooterHeight,
      HeaderImage: HeaderImage,
      FooterImage: FooterImage,
      showSeparatorLines: showSeparatorLines,
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
    } catch (error) {
      console.error("Error sending data to backend:", error);
    }
  };

  //Generate the merge pdf
  const generateMergePdfUrl = () => {
    fetch(mergePdfApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: common.userKeyID,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          const pdfUrl = data.s3Url;
          setMergePdfUrl(pdfUrl);

          const ApiRequest_ParamsObj = {
            moduleName: "Quotation",
            contractKeyID: contractKeyID,
            contractPDFUrl: pdfUrl,
            ContractSignatoryKeyID: ContractSignatoryKeyID,
            pricingVariablesList: Object.entries(pricingVariablesForEmail).map(
              ([variableName, variableValue]) => ({
                variableName: `$${variableName}$`,
                variableValue:
                  variableValue == null ? "0.00" : String(variableValue),
              }),
            ),
          };

          GetSendToSignEasyData(ApiRequest_ParamsObj);
          // Assuming there's an iframe with id "pdfViewer", uncomment this line if needed
          // document.getElementById("pdfViewer").src = pdfUrl;
        } else {
          console.error("Error:", data.message);
          generatePdf();
        }
      })
      .catch((error) => {
        console.error("Error fetching merged PDF:", error);
        generatePdf();
      });
  };

  //Generate Pdf For send the
  const generatePdf = async () => {
    if (
      generatePdfData.length === 0 ||
      generatePdfData === null ||
      generatePdfData === undefined
    ) {
      return;
    }
    if (generatePdfData) {
      try {
        const promises = generatePdfData.map((data, index) =>
          sendDataToBackend(
            data,
            index,
            organisationData.otherInformation[0].emailID,
            organisationData.otherInformation[0].phoneNo,
            organisationData.otherInformation[0].fullAddress,
            BrandColor,
            webSite,
          ),
        );
        await Promise.all(promises);
        // All API calls have completed, now generate the merge PDF URL
        setSvgShow(true);
        generateMergePdfUrl();
      } catch (error) {
        console.error("Error generating PDFs:", error);
      }
    }
  };
  const GetVariableValuesForTnCTemplateData = async (
    ClientID,
    HtmlContent,
    variablesWithValuesList,
  ) => {
    // const VariableData = await GetVariableValuesForTnCTemplate(
    //   ClientID,
    //   common.userKeyID,
    //   common.organisationKeyID
    // );

    // Function to escape special characters in a string to be used in a regular expression
    function escapeRegExp(string) {
      return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }

    const replaceVariables = (htmlContent, variablesWithValuesList) => {
      let replacedHtmlContent = htmlContent;
      variablesWithValuesList.forEach(({ variableName, variableValue }) => {
        const regex = new RegExp(escapeRegExp(variableName), "g");
        if (variableValue !== null) {
          replacedHtmlContent = replacedHtmlContent?.replace(
            regex,
            variableValue,
          );
        }
      });
      return replacedHtmlContent;
    };

    const htmlContent = replaceVariables(HtmlContent, variablesWithValuesList);
    setTnCHtmlContent(htmlContent);
  };

  useEffect(() => {
    if (
      generatePdfData.length !== 0 &&
      generatePdfData !== null &&
      generatePdfData !== undefined &&
      organisationData.length !== 0
    ) {
      generatePdf();
    }
  }, [generatePdfData, organisationData]);

  const GetTemplateLookupListData = async (QuoteId, OrganisationKeyID) => {
    setLoader(true);
    try {
      const response = await GetTemplateListLookupList({
        TemplateTypeID: 2,
        organisationKeyID:
          common.organisationKeyID === ""
            ? OrganisationKeyID
            : common.organisationKeyID,
        QuoteKeyID: quoteKeyID,
      });
      const data = response.data;
      const isSelectedDefault = data?.responseData?.data.filter(
        (item) => item.isDefault === true,
      );
      if (data.statusCode === 200) {
        setLoader(false);
        const mappedOptions = data?.responseData?.data.map((item) => ({
          value: item.templateKeyID,
          label: item.templateName,
          templateID: item.templateID,
          fontFamilyID: item.fontFamilyID,
          headerHeight: item.headerHeight,
          footerHeight: item.footerHeight,
          headerImage: item.headerImage,
          footerImage: item.footerImage,
          headerContent: item.headerContent,
          footerContent: item.footerContent,
          showSeparatorLines: Boolean(item.showSeparatorLines),
          watermarkImage: item.watermarkImage,
          orientationID: item.orientationID,
        }));
        // setTemplateLookUpOptions(mappedOptions);
        // const isSelectedDefault = data.responseData.data.filter(
        //   (item) => item.isDefault === true
        // );
        setFontFamily(getFontNameById(isSelectedDefault[0].fontFamilyID));

        setHeaderContent(isSelectedDefault[0]?.headerContent);
        setQuoteTypeID(isSelectedDefault[0]?.quoteTypeID);
        // setFontFamily(getFontNameById(mappedOptions[0].fontFamilyID));
        // setHeaderContent(mappedOptions[0]?.headerContent);
        setFooterContent(isSelectedDefault[0]?.footerContent);
        setHeaderImage(isSelectedDefault[0]?.headerImage);
        setFooterImage(isSelectedDefault[0]?.footerImage);
        setHeaderHeight(isSelectedDefault[0]?.headerHeight);
        setFooterHeight(isSelectedDefault[0]?.footerHeight);
        setShowSeparatorLines(isSelectedDefault[0]?.showSeparatorLines);
        setWatermarkImage(isSelectedDefault[0]?.watermarkImage);
        setOrientationID(isSelectedDefault[0]?.orientationID);
      } else {
        setLoader(false);
        console.error("Error fetching data from the API");
      }
    } catch (error) {
      setLoader(false);
      console.error("Error fetching data from the API", error);
    }
  };
  //Get Template Model Data
  const GetTemplateModalData = async (
    TemplateKeyID,
    clientID,
    ModuleKeyID,
    contractSignatoriesList,
    RecurringPricingInfo,
    OneOffPricingInfo,
    paymentFrequencyID,
    packageData,
  ) => {
    debugger;
    try {
      const data = await GetTemplateModelData({
        TemplateKeyID: TemplateKeyID,
        clientID: clientID || null,
        TemplateTypeID: 2,
        ModuleKeyID: ModuleKeyID,
      });
      if (data?.data?.statusCode === 200) {
        if (data?.data?.responseData?.data) {
          const ModelData = data?.data?.responseData?.data;
          function replaceVariables(array, signatoriesList) {
            // Mapping object for variable names to property names
            const variableMap = {
              //Individual Variables :
              "Client.FirstName": ["firstName"],
              "Client.LastName": ["lastName"],
              "Client.Name": ["firstName", "lastName"],
              //Sole Trader Variables :
              "Client.SoleTrader.FirstName": ["firstName"],
              "Client.SoleTrader.LastName": ["lastName"],
              //'Client.SoleTrader.Name': ['soleTraderName'],

              //Partnership Variables :
              "Client.Partner.Name": ["firstName", "lastName"],
              "Client.Partner.FirstName": ["firstName"],
              "Client.Partner.LastName": ["lastName"],

              //LLP / Ltd Variable :
              "Client.Officer.Name": ["firstName", "lastName"],
              "Client.Officer.FirstName": ["firstName"],
              "Client.Officer.LastName": ["lastName"],
            };

            const replacedArray = array.map((item) => {
              if (item.htmlContent) {
                let replacedContent = item.htmlContent;

                // Iterate over each variable and replace it in the content
                for (const variable in variableMap) {
                  const propertyNames = variableMap[variable];
                  const replacement = signatoriesList
                    .map((signatory) =>
                      propertyNames.map((prop) => signatory[prop]).join(" "),
                    )
                    .join(", ");
                  const regex = new RegExp(
                    "\\$" + variable.replace(/\./g, "\\.") + "\\$",
                    "g",
                  );
                  replacedContent = replacedContent.replace(regex, replacement);
                }

                // Update the htmlContent in the item
                return { ...item, htmlContent: replacedContent };
              } else {
                return item;
              }
            });

            return replacedArray;
          }

          // Call the function with your array and contract signatories list as arguments
          const newArray = replaceVariables(
            ModelData.templateElementList,
            contractSignatoriesList,
          );
          const pdfObject = {
            ttetMapID: null, //Template's Template Element Type Mapping Id
            templateElementTypeID: null,
            headings: null,
            shortDesc: null,
            htmlContent: null,
          };
          const updatedTemplateElementList = [...newArray, pdfObject];
          const Logo =
            ModelData.templateElementListWithRequiredData.organisationLogoUrl;
          setBrandLogo(Logo);
          let clientNameOnFirstPage =
            ModelData.templateElementListWithRequiredData
              .clientNameOnFirstPage == null
              ? ""
              : ModelData.templateElementListWithRequiredData
                  .clientNameOnFirstPage;
          const firstPageHTML = `
         <div style="margin-top: 300px;">
     <div style="display: flex; justify-content: center; align-items: center; text-align: center;margin-top:${
       Logo ? `-100px` : "0px"
     }">
    ${
      Logo
        ? `
      <div style="display: inline-block; text-align: center; width: 700px; height: 150px; background-image: url('${Logo}'); background-size: contain; background-repeat: no-repeat; background-position: center;">
      </div>
    `
        : ""
    }

  <p style="text-align: center; color: #00BFFF; page-break-after: always;">
    <span style="color: #00BFFF; margin-top: 15px; font-size: 50px; font-family: ${fontFamily}" class="OrgBrandColor">Engagement Letter For</span><br><br>
    <span style="color: black; margin-top: 15px; font-size: 25px;font-family: ${fontFamily}">${clientNameOnFirstPage}</span><br>
  </p>
    </div>
    </div>
  `;

          debugger;

          let isAddedFirstPage = updatedTemplateElementList.some(
            (item) => item.templateElementTypeID === 10,
          );
          let AddFirstPageHtmlContent = [...updatedTemplateElementList];
          if (!isAddedFirstPage) {
            const firstPageElement = {
              ttetMapID: null,
              templateElementTypeID: 10,
              templateElementTypeName: "First Page",
              serialNo: null,
              headings: "",
              shortDesc: "",
              htmlContent: setDefaultFontFamily(firstPageHTML, fontFamily),
            };
            AddFirstPageHtmlContent.splice(0, 0, firstPageElement);
          }
          // const GetCommonFontFamily = AddFirstPageHtmlContent.find(item => item.templateElementTypeName === "Text Block").htmlContent
          // const { uniqueFontFamilies, // Unique font families
          //   largestFontSize, // Largest font size
          //   smallestFontSize } = getFontStylesFromHtml(GetCommonFontFamily)
          const ReplaceVariableArray = replaceTemplatePricingVariables(
            AddFirstPageHtmlContent,
            RecurringPricingInfo,
            OneOffPricingInfo,
            paymentFrequencyID,
            3,
            packageData,
            recurringServiceCatList,
            oneOffServiceCatList,
          );
          setIsDefaultFirstPage(ModelData?.enableFirstPage);
          setTemplateElementList(ReplaceVariableArray.replacedArray);
          setPricingVariablesForEmail(ReplaceVariableArray.pricingVariables);
          setBrandColor(
            ModelData.templateElementListWithRequiredData.brandColor,
          );
          // setFontFamily(uniqueFontFamilies)
          // setFontSize(smallestFontSize)
          setWebSite(ModelData.templateElementListWithRequiredData.website);
        }
      } else {
        setErrorMessage(data?.data?.errorMessage);
      }
    } catch (error) {
      console.log(error);
    }
  };

  let count = 0;
  const GenerateContractFromProposalData = async () => {
    if (count !== 0) {
      return false;
    }
    count = count + 1;
    setLoader(true);
    try {
      // const SelectedTemplateString = ReactDOMServer.renderToString(SelectedTemplate);
      const data = await GenerateContractFromProposal({
        quoteKeyID: quoteKeyID,
        serviceChargeTypeID: ServiceChargeTypeID, //1: Recurring, 2:OneOff
        servicePackageKeyID: ServicePackageKeyID || null,
        acceptedServiceHtmlContent: null,
        ContractSignatoryKeyID: ContractSignatoryKeyID,
        action: "Accepted", //Accepted/Declined
      });
      if (data) {
        setLoader(false);
        if (data?.data?.statusCode === 200) {
          setSvgShow(true);
          const GetContractKeyID = data?.data?.responseData?.data;
          const SignedFileID = data?.data?.responseData?.signedFileID;
          setContractKeyID(GetContractKeyID);

          if (Number(SignedFileID) > 0) {
            const ApiRequest_ParamsObj = {
              moduleName: "Quotation",
              contractKeyID: GetContractKeyID,
              contractPDFUrl: null,
              ContractSignatoryKeyID: ContractSignatoryKeyID,
              pricingVariablesList: Object.entries(
                pricingVariablesForEmail,
              ).map(([variableName, variableValue]) => ({
                variableName: `$${variableName}$`,
                variableValue:
                  variableValue == null ? "0.00" : String(variableValue),
              })),
            };
            GetSendToSignEasyData(ApiRequest_ParamsObj);
          } else {
            GetContractDetailsForSignEasyData(GetContractKeyID);
          }
        } else {
          setLoader(false);
          setErrorMessage(data?.response?.data?.errorMessage);
          // GetContractDetailsForSignEasyData("510E5FC7-F107-4D6F-97F0-FD7307F29E4A")
        }
      } else {
        setLoader(false);
        setErrorMessage(data?.response?.data?.errorMessage);
        // GetContractDetailsForSignEasyData("510E5FC7-F107-4D6F-97F0-FD7307F29E4A")
      }
    } catch (error) {
      setLoader(false);
      console.log(error);
    }
  };
  //GetContract Details For Sign Easy Data
  const GetContractDetailsForSignEasyData = async (GetContractKeyID) => {
    if (!GetContractKeyID) {
      return;
    }

    debugger;

    try {
      const data = await GetContractDetailsForSignEasyList(GetContractKeyID);

      if (data?.data?.statusCode === 200) {
        if (data?.data?.responseData?.data) {
          const ModelData = data?.data?.responseData?.data;
          const variablesWithValuesList =
            data?.data?.responseData?.variablesWithValuesList;
          await GetVariableValuesForTnCTemplateData(
            ModelData.clientID,
            ModelData.tnCTemplateContent,
            variablesWithValuesList,
          );
          const packageData = data?.data?.responseData?.packageList;
          const finalQuotationAmountList =
            data?.data?.responseData?.finalContractAmountList;
          setServiceDescriptionList(ModelData.serviceDescriptionList);
          setShowDiscountLine(ModelData.showDiscountLine);
          // setShowDiscountLine(true)
          // setTnCHtmlContent(ModelData.tnCTemplateContent)
          setTnCPdf(ModelData.tnCTemplatePdfUrl);

          setFeeTypeId(ModelData.feesInQuoteID);
          setPricingTableColumnIDs(ModelData.pricingTableColumnIDs || "");
          updateVisibleFieldsFromIds(ModelData.pricingTableColumnIDs || "");
          setRecurringServiceCatList(ModelData.recurringServiceCatList);
          setOneOffServiceCatList(ModelData.oneOffServiceCatList);
          const RecurringData = finalQuotationAmountList.filter(
            (item) => item.serviceChargeTypeID === 1,
          );
          const OneOffData = finalQuotationAmountList.filter(
            (item) => item.serviceChargeTypeID === 2,
          );
          let OneOffPricingInfo = {
            OriginalPrice: "",
            DefaultDiscount: "",
            DiscountedPrice: "",
            VATPrice: "",
            NetTotal: "",
            Discount: "",
            GrandTotal: "",
            DiscountedTotal: "",
          };
          let RecurringPricingInfo = {
            OriginalPrice: "",
            DefaultDiscount: "",
            DiscountedPriceL: "",
            VATPrice: "",
            NetTotal: "",
            Discount: "",
            GrandTotal: "",
            DiscountedTotal: "",
          };
          if (RecurringData.length > 0) {
            const recurringItem = RecurringData[0]; // Access the first item in the filtered array

            RecurringPricingInfo = {
              OriginalPrice: recurringItem.netTotal,
              DefaultDiscount: recurringItem.discountPercentageWithAllDecimal,
              DiscountedPrice: recurringItem.discountedTotal,
              VATPrice: recurringItem.vat,
              NetTotal: recurringItem.netTotal,
              Discount: recurringItem.discounted,
              GrandTotal: recurringItem.grandTotal,
              DiscountedTotal: recurringItem.discountedTotal,
            };
          }

          if (OneOffData.length > 0) {
            const oneOffItem = OneOffData[0]; // Access the first item in the filtered array

            OneOffPricingInfo = {
              OriginalPrice: oneOffItem.netTotal,
              DefaultDiscount: oneOffItem.discountPercentageWithAllDecimal,
              DiscountedPrice: oneOffItem.discountedTotal,
              VATPrice: oneOffItem.vat,
              NetTotal: oneOffItem.netTotal,
              Discount: oneOffItem.discounted,
              GrandTotal: oneOffItem.grandTotal,
              DiscountedTotal: oneOffItem.discountedTotal,
            };
          }

          setFinalQuotationAmountList(finalQuotationAmountList);
          const contractSignatoryRowNo = ModelData.contractSignatoriesList.map(
            (item, index) => ({
              ...item,
              RowNo: index + 1,
            }),
          );

          // setContractSignatoriesList(ModelData.contractSignatoriesList)
          setContractSignatoriesList(contractSignatoryRowNo);
          setPackageList(packageData);
          // setPaymentFrequency(2)
          setAdditionalInformation(ModelData.additionalInformationList);
          setPaymentFrequency(ModelData.paymentFrequencyID);
          setQuoteInfo({
            ...quoteInfo,

            templateKeyID: ModelData.templateKeyID,
            clientID: ModelData.clientID,
          });
          const chargeTypeId1Array = finalQuotationAmountList.filter(
            (obj) => obj.serviceChargeTypeID === 1,
          );
          const chargeTypeId2Array = finalQuotationAmountList.filter(
            (obj) => obj.serviceChargeTypeID === 2,
          );

          // setPackageList(packageData);
          const updatedOtherInformation = [
            {
              emailID: ModelData.organisationDetails.emailID,
              phoneNo: `${ModelData.organisationDetails.countryCode} ${ModelData.organisationDetails.phoneNo}`,
              fullAddress: ModelData.organisationDetails.tradingAddress,
              signatureImageUrl:
                ModelData.organisationDetails.signatureImageUrl,
              signatoryName: ModelData.organisationDetails?.signatoryName || "",
              currencyID: ModelData.organisationDetails?.currencyID,
            },
          ];
          setOrgkeyId(ModelData.organisationDetails.organisationKeyID);
          // // Set updated organization data
          setOrganisationData({
            otherInformation: updatedOtherInformation,
          });
          setChargeTypeId1Array(chargeTypeId1Array);
          setChargeTypeId2Array(chargeTypeId2Array);
          await GetTemplateLookupListData(
            ModelData.quoteKeyID,
            ModelData.organisationDetails.organisationKeyID,
          );
          GetTemplateModalData(
            ModelData.templateKeyID,
            ModelData.clientID,
            GetContractKeyID,
            ModelData.contractSignatoriesList,
            RecurringPricingInfo,
            OneOffPricingInfo,
            ModelData.paymentFrequencyID,
            packageData,
          );
        }
      } else {
        // setErrorMessage(data?.data?.errorMessage);
      }
    } catch (error) {
      console.log(error);
    }
  };
  // send To Sign Easy Data
  const GetSendToSignEasyData = async (params) => {
    try {
      const data = await GetSendToSignEasy(params);
      if (data?.data?.statusCode === 200) {
        setLoader(false);
        let acceptedDeclinedByEmailID =
          data?.data?.responseData?.acceptedDeclinedByEmailID;
        const signingUrls = data?.data?.responseData?.sentMailResponse;
        let SignEasyUrlForEmail = signingUrls.find(
          (item) => item.email == acceptedDeclinedByEmailID,
        );
        setSvgShow(false);
        if (SignEasyUrlForEmail.signingUrl) {
          window.open(SignEasyUrlForEmail.signingUrl, "_self");
        }
      } else {
        setErrorMessage(data?.data?.errorMessage);
        setLoader(false);
      }
    } catch (error) {
      console.log(error);
      setLoader(false);
    }
  };

  return (
    <>
      {/* {
        MergePdfUrl && (
          <iframe
            title="PDF Viewer"
            src={MergePdfUrl}
            width="100%"
            height="600px"
          ></iframe>
        )
      } */}
      {/* {
        SvgShow ? */}
      <GeneratePdfLoaderPage message={errorMessage} />
      {/* :

          <React.Fragment>
            <div className="authentication-bg d-flex align-items-center pb-0 vh-100">
              <div className="content-center w-100">
                <div className="container">
                  <Card className="mo-mt-2">
                    <CardBody>
                      <Row className="align-items-center">
                        <Col lg="6" className="mx-auto">
                          <h4 className="mb-4">
                            {SuccessMessage ? SuccessMessage : errorMessage}
                          </h4> */}
      {/* {
                        MergePdfUrl && (
                          <iframe
                            title="PDF Viewer"
                            src={MergePdfUrl}
                            width="100%"
                            height="600px"
                          ></iframe>
                        )
                      } */}
      {/* </Col>
                      </Row>
                    </CardBody>
                  </Card>
                </div>
              </div>
            </div>
          </React.Fragment >

      } */}
    </>
  );
}

export default AcceptInvitation;
