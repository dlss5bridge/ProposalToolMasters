import { generatePdfUrl, mergePdfApiUrl } from "../../../Base-Url/Base_Url";
import {
  GetTemplateModelDataWithoutToken,
  GetTemplateHeaderFooterLookupWithoutToken,
  GetOrganisationInformationModelWithoutToken,
} from "../../../redux/Services/Proposal/ProposalApi";
import { ElementType, QUOTE_TYPE_ID } from "../../../Middleware/enums";
import Utils from "../../../Middleware/Utils";

// Web-Based Proposal counterpart to PreviewComponentpdf.jsx's generatePdf/
// sendDataToBackend/generateMergePdfUrl flow, using the same endpoints and
// payload shape but without importing from that admin-only file.
//
// Scope: the full admin document depends on authenticated component state
// with no reachable API, so this regenerates only what the client can
// change (fees, Additional Information) plus the cover page and header/
// footer branding, using endpoints confirmed to work without a token.
const escapeHtml = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (ch) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        ch
      ],
  );

// Admin puts the template's font (Utils.FontFamily by fontFamilyID) into
// every block's inline style; a template without one resolves to null and
// the declaration is invalid, so emit nothing rather than a hardcoded font.
const ffCss = (fontFamily) => (fontFamily ? `font-family:${fontFamily};` : "");

// Text Block htmlContent is raw Draft.js export markup (nested
// data-block/data-text spans with box-sizing/position:relative styles).
// Passed through verbatim it renders no visible text but still reserves a
// full blank page in the PDF microservice, so we extract each
// data-text span's own text into plain <p> tags instead, preserving line
// breaks and bold styling.
const extractDraftJsPlainHtml = (rawHtml) => {
  if (!rawHtml) return "";

  // Admin keeps the editor's own inline typography (color/font-family/
  // font-size); reuse the first such style found so the rebuilt <p> tags
  // look the same instead of falling back to renderer defaults.
  const styleMatch = rawHtml.match(/style="([^"]*font-size[^"]*)"/);
  const pickStyle = (prop) => {
    const found = styleMatch?.[1].match(
      new RegExp(`(?:^|;)\\s*${prop}:\\s*([^;]+)`),
    );
    return found ? `${prop}:${found[1].trim()};` : "";
  };
  const baseStyle = `${pickStyle("color")}${pickStyle("font-family")}${pickStyle("font-size")}`;

  const paragraphs = [];
  const blockPattern =
    /<span[^>]*style="([^"]*)"[^>]*>\s*<span data-text="true"[^>]*>([\s\S]*?)<\/span>\s*<\/span>/g;
  let match = blockPattern.exec(rawHtml);
  while (match) {
    const [, styleAttr, text] = match;
    const isBold = /font-weight:\s*bold/.test(styleAttr);
    const lineBreakHtml = text.replace(/\r?\n/g, "<br>");
    paragraphs.push(
      `<p style="${baseStyle}margin:1em 0px;${isBold ? "font-weight:bold;" : ""}">${lineBreakHtml}</p>`,
    );
    match = blockPattern.exec(rawHtml);
  }

  if (paragraphs.length > 0) return paragraphs.join("");

  // Not every Text Block uses the nested data-text shape — some are plain
  // <p><span>text</span></p> blocks, which the pattern above silently
  // matches nothing for. Fall back to reading each top-level <p>.
  const paragraphPattern = /<p[^>]*>([\s\S]*?)<\/p>/g;
  const fallbackParagraphs = [];
  let pMatch = paragraphPattern.exec(rawHtml);
  while (pMatch) {
    const text = pMatch[1].replace(/<[^>]+>/g, "").trim();
    if (text) {
      fallbackParagraphs.push(`<p style="${baseStyle}">${text}</p>`);
    }
    pMatch = paragraphPattern.exec(rawHtml);
  }
  if (fallbackParagraphs.length > 0) return fallbackParagraphs.join("");

  // Last resort: strip all tags and show the remaining text as one paragraph.
  const plainText = rawHtml.replace(/<[^>]+>/g, "").trim();
  return plainText ? `<p style="${baseStyle}">${plainText}</p>` : "";
};

// Duplicated from ProposalPricingTableStep.jsx (not exported there).
const CURRENCY_SYMBOLS = { 1: "£", 2: "€", 3: "$", 4: "₹" };

// Suffixes the fees table title, e.g. "Recurring Fees (Monthly)".
const PAYMENT_FREQUENCY_LABEL = {
  1: "Yearly",
  2: "Half-Yearly",
  3: "Quarterly",
  4: "Monthly",
};

// Labels the tax row by currency (e.g. "GST" for INR), not a hardcoded "VAT".
// Duplicated from buildAddUpdateQuotePayload.js's getTaxName (not exported).
const getTaxName = (currencyID) => {
  switch (currencyID) {
    case 1:
      return "VAT";
    case 2:
      return "EU VAT";
    case 3:
      return "Salex Tax";
    case 4:
      return "GST";
    default:
      return "VAT";
  }
};

// Groups one charge type's live selections by category for display (name + price only).
const groupSelectionsByCategory = (
  selections,
  serviceChargeTypeID,
  pricing,
) => {
  const priceByServiceID = new Map();
  (pricing || []).forEach((item) => {
    priceByServiceID.set(
      `${item.serviceChargeTypeID}:${item.serviceID}`,
      Number(item.price) || 0,
    );
  });

  const categoriesByID = new Map();
  Object.values(selections || {}).forEach((selection) => {
    const key = selection.serviceCatID ?? "uncategorised";
    if (!categoriesByID.has(key)) {
      categoriesByID.set(key, {
        // Field is `categoryName` on the selection, not `serviceCatName`.
        categoryName: selection.categoryName || "Services",
        services: [],
      });
    }
    categoriesByID.get(key).services.push({
      name: selection.serviceName,
      price: priceByServiceID.get(
        `${serviceChargeTypeID}:${selection.serviceID}`,
      ),
    });
  });

  return Array.from(categoriesByID.values());
};

// Package/Custom Package quotes price a service per package slot
// (packageOneValue/Two/ThreeValue tagged by packageOneID/Two/ThreeID)
// instead of a single flat price. Ported from ProposalPricingTableStep.jsx
// (not exported there). Standard Package trusts the admin-agreed cross-join
// in serviceMappingWithPackagesList; Custom Package reads the pricing item's
// own flat slot value after checking servicePackageIDs membership. Returns
// null (rendered as a cross) when the service isn't part of that package.
const PACKAGE_PRICE_SLOTS = [
  { idKey: "packageOneID", valueKey: "packageOneValue" },
  { idKey: "packageTwoID", valueKey: "packageTwoValue" },
  { idKey: "packageThreeID", valueKey: "packageThreeValue" },
];

const priceForSelectedPackage = (
  item,
  packageID,
  isStandardPackage,
  serviceMappingWithPackagesList,
) => {
  if (!item || packageID === null || packageID === undefined) return null;
  const slot = PACKAGE_PRICE_SLOTS.find(
    ({ idKey }) =>
      item[idKey] !== null && String(item[idKey]) === String(packageID),
  );
  if (!slot) return null;

  if (!isStandardPackage) {
    const membership = (item.servicePackageIDs || []).map(String);
    if (!membership.includes(String(packageID))) return null;
    return Number(item[slot.valueKey]) || 0;
  }

  const match = (serviceMappingWithPackagesList || []).find(
    (row) =>
      row.serviceID === item.serviceID &&
      row.serviceCatID === item.serviceCatID &&
      Number(row.serviceChargeTypeID) === Number(item.serviceChargeTypeID) &&
      String(row.servicePackageID) === String(packageID),
  );
  return match ? Number(match.price) || 0 : null;
};

// Same grouping as groupSelectionsByCategory, but resolves a per-package
// price for every package column instead of a single price.
const groupSelectionsByCategoryForPackages = (
  selections,
  serviceChargeTypeID,
  pricing,
  packageColumns,
  isStandardPackage,
  serviceMappingWithPackagesList,
) => {
  const pricingItemByServiceID = new Map();
  (pricing || []).forEach((item) => {
    if (Number(item.serviceChargeTypeID) === serviceChargeTypeID) {
      pricingItemByServiceID.set(item.serviceID, item);
    }
  });

  const categoriesByID = new Map();
  Object.values(selections || {}).forEach((selection) => {
    const key = selection.serviceCatID ?? "uncategorised";
    if (!categoriesByID.has(key)) {
      categoriesByID.set(key, {
        categoryName: selection.categoryName || "Services",
        services: [],
      });
    }
    const pricingItem = pricingItemByServiceID.get(selection.serviceID);
    categoriesByID.get(key).services.push({
      name: selection.serviceName,
      packagePrices: packageColumns.map((pkg) =>
        priceForSelectedPackage(
          pricingItem,
          pkg.servicePackageID,
          isStandardPackage,
          serviceMappingWithPackagesList,
        ),
      ),
    });
  });

  return Array.from(categoriesByID.values());
};

// Statement of Facts driver breakdown — mirrors admin's STATEMENT_OF_FACTS
// case: heading, category name + <hr>, then per service a bullet list of
// "driverName: value" for each pricing driver. Reads the same redux
// driverValues map the Services step itself writes, so labels stay in sync
// with the UI without a separate lookup.
//
// A service priced purely off Global Pricing Drivers has an empty
// driverValues map (no local pricingDriverList entries), so it needs
// drivers rebuilt from `pricing`'s pricingFormulaGPDsList cross-referenced
// against additionalInformationList instead.
const buildGlobalDriversForService = (
  serviceID,
  serviceChargeTypeID,
  pricing,
  additionalInformationList,
) => {
  const pricingItem = (pricing || []).find(
    (item) =>
      item.serviceID === serviceID &&
      Number(item.serviceChargeTypeID) === serviceChargeTypeID,
  );
  const gpdRefs = (pricingItem?.pricingFormulaGPDsList || []).filter(
    (gpd) => gpd.driverTypeID !== 1,
  );
  if (gpdRefs.length === 0) return [];

  return gpdRefs
    .map((gpd) => {
      const infoItem = (additionalInformationList || []).find(
        (item) => item.globalPricingDriverID === gpd.globalPricingDriverID,
      );
      if (!infoItem) return null;
      const label = resolveAdditionalInformationDisplayValue(infoItem);
      if (label === "" || label == null) return null;
      return { driverName: infoItem.driverName, label };
    })
    .filter(Boolean);
};

const groupSelectionsWithDriverValuesByCategory = (
  selections,
  serviceChargeTypeID,
  pricing,
  additionalInformationList,
) => {
  const categoriesByID = new Map();
  Object.values(selections || {}).forEach((selection) => {
    const key = selection.serviceCatID ?? "uncategorised";
    if (!categoriesByID.has(key)) {
      categoriesByID.set(key, {
        categoryName: selection.categoryName || "Services",
        services: [],
      });
    }
    const localDrivers = Object.values(selection.driverValues || {}).filter(
      (entry) => entry.value !== "" && entry.value != null,
    );
    const globalDrivers =
      localDrivers.length === 0
        ? buildGlobalDriversForService(
            selection.serviceID,
            serviceChargeTypeID,
            pricing,
            additionalInformationList,
          )
        : [];
    categoriesByID.get(key).services.push({
      name: selection.serviceName,
      drivers: localDrivers.length > 0 ? localDrivers : globalDrivers,
    });
  });

  return Array.from(categoriesByID.values());
};

const buildDriverBreakdownSection = (
  selections,
  serviceChargeTypeID,
  pricing,
  additionalInformationList,
  categoryHeading,
  accentColor,
  fontFamily,
) => {
  const categories = groupSelectionsWithDriverValuesByCategory(
    selections,
    serviceChargeTypeID,
    pricing,
    additionalInformationList,
  );
  if (categories.length === 0) return "";

  // The section heading is colored with the brand accent, not black —
  // only the category name below it is black in admin's markup.
  return `
    <p style="${ffCss(fontFamily)}font-size:0.2in;color:${accentColor};font-weight:bold">${escapeHtml(categoryHeading)}</p>
    ${categories
      .map(
        (category) => `
          <div style="${ffCss(fontFamily)}">
            <p style="${ffCss(fontFamily)}color:black;font-size:0.2in;font-weight:bold">${escapeHtml(category.categoryName)}</p>
            <hr style="color:gray;margin-top:-15px">
            ${category.services
              .map(
                (service) => `
                  <p style="${ffCss(fontFamily)}color:black">${escapeHtml(service.name)}</p>
                  ${service.drivers
                    .map(
                      (driver) => `
                        <li style="${ffCss(fontFamily)}color:black;margin-top:5px">${escapeHtml(driver.driverName)}: <strong>${escapeHtml(String(driver.label ?? driver.value))}</strong></li>`,
                    )
                    .join("")}`,
              )
              .join("")}
          </div>`,
      )
      .join("")}`;
};

const buildStatementOfFactsDriverBreakdownHtml = ({
  recurringSelections,
  oneOffSelections,
  pricing,
  additionalInformationList,
  accentColor,
  fontFamily = null,
}) => {
  const recurringSection = buildDriverBreakdownSection(
    recurringSelections,
    1,
    pricing,
    additionalInformationList,
    "Ongoing/Recurring Services",
    accentColor,
    fontFamily,
  );
  const oneOffSection = buildDriverBreakdownSection(
    oneOffSelections,
    2,
    pricing,
    additionalInformationList,
    "One-Off/Ad hoc Services",
    accentColor,
    fontFamily,
  );

  if (!recurringSection && !oneOffSection) return "";

  return `<div style="padding-left:40px;padding-right:40px">${recurringSection}${oneOffSection}</div>`;
};

// Fees table — header/category/total row styling matches admin's
// GetQuoteModel recurringHtmlContent/oneOffHtmlContent output for this
// organisation (#00BFFF header, #DCDCDC category rows, #808080 totals).
const buildFeesTableHtml = ({
  title,
  currencySymbol,
  currencyID,
  categories,
  netTotal,
  discounted,
  vatPercentage,
  vat,
  grandTotal,
  accentColor,
  fontFamily,
}) => {
  if (!categories || categories.length === 0) return "";

  const formatAmount = (value) =>
    `${currencySymbol}${(Number(value) || 0).toFixed(2)}`;

  const categoryRows = categories
    .map(
      (category) => `
        <tr style="background-color:#eee">
          <td style="border:1px solid #DDDDDD;text-align:left;padding:8px;font-weight:bold;font-size:18px">${escapeHtml(category.categoryName)}</td>
          <td style="border:1px solid #DDDDDD;text-align:left;padding:8px"></td>
        </tr>
        ${category.services
          .map(
            (service) => `
              <tr>
                <td style="border:1px solid #DDDDDD;text-align:left;padding:8px">${escapeHtml(service.name)}</td>
                <td style="border:1px solid #DDDDDD;text-align:right;padding:8px">${formatAmount(service.price)}</td>
              </tr>`,
          )
          .join("")}`,
    )
    .join("");

  const discountRow =
    discounted > 0
      ? `<tr style="background-color:#DCDCDC">
          <td style="border:1px solid #DDDDDD;text-align:left;padding:8px;color:black">Discount</td>
          <td style="border:1px solid #DDDDDD;text-align:right;padding:8px;color:black">${formatAmount(discounted)}</td>
        </tr>`
      : "";

  const vatRow =
    vatPercentage != null
      ? `<tr style="background-color:#DCDCDC">
          <td style="border:1px solid #DDDDDD;text-align:left;padding:8px;color:black">${getTaxName(currencyID)}</td>
          <td style="border:1px solid #DDDDDD;text-align:right;padding:8px;color:black">${formatAmount(vat)}</td>
        </tr>`
      : "";

  return `
    <div style="padding-left:40px;padding-right:40px;${ffCss(fontFamily)}page-break-inside:avoid;break-inside:avoid">
      <p style="${ffCss(fontFamily)}color:${accentColor};font-size:20px;margin-top:15px">${escapeHtml(title)}</p>
      <table style="${ffCss(fontFamily)}border-collapse:collapse;width:100%;margin-top:-15px">
        <tr style="background-color:${accentColor}">
          <th style="border:1px solid #DDDDDD;text-align:left;padding:8px;color:white;font-size:18px">Services</th>
          <th style="border:1px solid #DDDDDD;text-align:right;padding:8px;color:white;font-size:18px">Fees (${currencySymbol})</th>
        </tr>
        ${categoryRows}
        <tr style="background-color:#808080">
          <td style="border:1px solid #DDDDDD;text-align:left;padding:8px;color:white">Net Total</td>
          <td style="border:1px solid #DDDDDD;text-align:right;padding:8px;color:white">${formatAmount(netTotal)}</td>
        </tr>
        ${discountRow}
        ${vatRow}
        <tr style="background-color:#808080">
          <td style="border:1px solid #DDDDDD;text-align:left;padding:8px;color:white">Grand Total</td>
          <td style="border:1px solid #DDDDDD;text-align:right;padding:8px;color:white">${grandTotal == null ? formatAmount(netTotal) : formatAmount(grandTotal)}</td>
        </tr>
      </table>
    </div>`;
};

// Package/Custom Package pricing table — same styling as buildFeesTableHtml
// but one column per package. packageTotals holds one
// {netTotal, discounted, vatPercentage, vat, grandTotal} per package column
// since each package prices independently (see findFinalAmountRowForPackage
// below) — quotationFinalAmountList has one row per package, not a single
// shared total.
const buildPackageColumnsFeesTableHtml = ({
  title,
  currencySymbol,
  currencyID,
  categories,
  packageColumns,
  packageTotals,
  accentColor,
  fontFamily,
}) => {
  if (!categories || categories.length === 0 || packageColumns.length === 0) {
    return "";
  }

  const columnCount = packageColumns.length;
  const formatAmount = (value) =>
    `${currencySymbol}${(Number(value) || 0).toFixed(2)}`;
  const formatCell = (value) =>
    value === null ? "&#10007;" : formatAmount(value);

  const categoryRows = categories
    .map(
      (category) => `
        <tr style="background-color:#DCDCDC">
          <td style="border:1px solid #DDDDDD;text-align:left;padding:8px;font-weight:bold;font-size:18px">${escapeHtml(category.categoryName)}</td>
          ${'<td style="border:1px solid #DDDDDD;text-align:left;padding:8px"></td>'.repeat(columnCount)}
        </tr>
        ${category.services
          .map(
            (service) => `
              <tr>
                <td style="border:1px solid #DDDDDD;text-align:left;padding:8px">${escapeHtml(service.name)}</td>
                ${service.packagePrices
                  .map(
                    (price) =>
                      `<td style="border:1px solid #DDDDDD;text-align:right;padding:8px">${formatCell(price)}</td>`,
                  )
                  .join("")}
              </tr>`,
          )
          .join("")}`,
    )
    .join("");

  const totalRow = (label, values, background, color) => `
    <tr style="background-color:${background}">
      <td style="border:1px solid #DDDDDD;text-align:left;padding:8px;color:${color}">${label}</td>
      ${values
        .map(
          (value) =>
            `<td style="border:1px solid #DDDDDD;text-align:right;padding:8px;color:${color}">${formatAmount(value)}</td>`,
        )
        .join("")}
    </tr>`;

  const hasAnyDiscount = packageTotals.some((totals) => totals.discounted > 0);
  const hasAnyVat = packageTotals.some(
    (totals) => totals.vatPercentage != null,
  );

  const discountRow = hasAnyDiscount
    ? totalRow(
        "Discount",
        packageTotals.map((totals) => totals.discounted),
        "#DCDCDC",
        "black",
      )
    : "";
  const vatRow = hasAnyVat
    ? totalRow(
        getTaxName(currencyID),
        packageTotals.map((totals) => totals.vat),
        "#DCDCDC",
        "black",
      )
    : "";

  return `
    <div style="padding-left:40px;padding-right:40px;${ffCss(fontFamily)}page-break-inside:avoid;break-inside:avoid">
      <p style="${ffCss(fontFamily)}color:${accentColor};font-size:20px;margin-top:15px">${escapeHtml(title)}</p>
      <table style="${ffCss(fontFamily)}border-collapse:collapse;width:100%;margin-top:-15px">
        <tr style="background-color:${accentColor}">
          <th style="border:1px solid #DDDDDD;text-align:left;padding:8px;color:white;font-size:18px">Services</th>
          ${packageColumns
            .map(
              (pkg) =>
                `<th style="border:1px solid #DDDDDD;text-align:right;padding:8px;color:white;font-size:18px">${escapeHtml(pkg.servicePackageName)}</th>`,
            )
            .join("")}
        </tr>
        ${categoryRows}
        ${totalRow(
          "Net Total",
          packageTotals.map((totals) => totals.netTotal),
          "#808080",
          "white",
        )}
        ${discountRow}
        ${vatRow}
        ${totalRow(
          "Grand Total",
          packageTotals.map((totals) =>
            totals.grandTotal == null ? totals.netTotal : totals.grandTotal,
          ),
          "#808080",
          "white",
        )}
      </table>
    </div>`;
};

// Fetches this quote's document template (same endpoint/params as
// AddUpdateProposal.jsx's GetTemplateModelData call). Only
// templateElementListWithRequiredData is used right now, for the cover page.
const fetchTemplateModel = async ({ templateKeyID, clientID, moduleKeyID }) => {
  if (!templateKeyID || !clientID) return null;

  const res = await GetTemplateModelDataWithoutToken({
    templateKeyID,
    clientID,
    moduleKeyID,
  });

  return res?.data?.responseData?.data ?? null;
};

// Fetches this organisation's template list. Used both to resolve the real
// templateKeyID for this quote and to pick the header/footer template
// matching this quote's templateID — mirrors AddUpdateProposal.jsx's
// defaultTemplateObject selection, falling back to the first template when
// there's no exact match. Returns null if the lookup fails or none exist.
const fetchTemplateLookupList = async ({
  organisationKeyID,
  clientID,
  quoteKeyID,
}) => {
  if (!organisationKeyID) return null;

  const res = await GetTemplateHeaderFooterLookupWithoutToken({
    organisationKeyID,
    clientID,
    quoteKeyID,
  });

  const list = res?.data?.responseData?.data;
  return Array.isArray(list) && list.length > 0 ? list : null;
};

const fetchTemplateHeaderFooter = ({ list, templateID }) => {
  if (!list) return null;
  return list.find((item) => item.templateID === templateID) || list[0];
};

// Mirrors AddUpdateProposal.jsx's concatenateFullAddress: comma-joins
// whichever address parts are non-empty, trailing comma stripped.
const concatenateFullAddress = (address) => {
  const addPart = (part) => (part ? `${part}, ` : "");

  let concatenatedAddress = `${addPart(
    address?.addressLine1?.replace(",", " "),
  )}${addPart(address?.addressLine2)}${addPart(address?.locality)}${addPart(
    address?.region,
  )}${addPart(address?.country || address?.countryName)}${address?.postcode || ""}`;

  if (concatenatedAddress.endsWith(", ")) {
    concatenatedAddress = concatenatedAddress.slice(0, -2);
  }
  return concatenatedAddress;
};

// Fetches the organisation's contact details (email/phone/address/website),
// the same source AddUpdateProposal.jsx reads. Previously required an auth
// token; that requirement was removed, so it's reachable here too.
const fetchOrganisationContactDetails = async (organisationKeyID) => {
  if (!organisationKeyID) return null;

  const res =
    await GetOrganisationInformationModelWithoutToken(organisationKeyID);
  const modelData = res?.data?.responseData?.data;
  if (!modelData) return null;

  const { emailID, phoneNo, countryCode, website } =
    modelData.otherInformation || {};

  return {
    email: emailID ?? null,
    // Same concatenation as admin's own concatenatedPhone.
    mobile:
      countryCode || phoneNo
        ? `${countryCode ?? ""} ${phoneNo ?? ""}`.trim()
        : null,
    fullAddress: concatenateFullAddress(modelData.organisationAddress) || null,
    webSite: website ?? null,
  };
};

// First/cover page — mirrors admin's firstPageHTML: organisation logo as a
// centered background-image block, then "Proposal For" + client name in
// the hardcoded #00BFFF. Only built when the template doesn't already
// define its own First Page element — that element's htmlContent is
// admin's real cover and must not be overridden.
//
// The `page-break-after: always` here matters: the cover gets appended onto
// the SAME generatePdfUrl call as the intro letter/pricing table that
// follow it (see generateAmendmentPdfUrl below), so this break is the only
// thing separating the cover from that content.
const buildCoverPageHtml = ({
  organisationLogoUrl,
  clientNameOnFirstPage,
  fontFamily,
}) => `
  <div style="margin-top:300px">
    <div style="display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;margin-top:${organisationLogoUrl ? "-100px" : "0px"}">
      ${
        organisationLogoUrl
          ? `<div style="width:700px;height:150px;background-image:url('${organisationLogoUrl}');background-size:contain;background-repeat:no-repeat;background-position:center"></div>`
          : ""
      }
      <p style="text-align:center;color:#00BFFF;page-break-after:always">
        <span style="display:block;color:#00BFFF;margin-top:15px;font-size:50px;${ffCss(fontFamily)}">Proposal For</span>
        <span style="display:block;color:black;margin-top:15px;font-size:25px;${ffCss(fontFamily)}">${escapeHtml(clientNameOnFirstPage || "")}</span>
      </p>
    </div>
  </div>`;

// Service Description section — mirrors admin's SERVICE_DESCRIPTION markup:
// heading, category name + <hr>, then each service's name + description,
// repeated for recurring/one-off. Built from the live selections so a
// client-added service always appears. Description comes from `pricing`
// (GetCalculatedServicesPriceByPackages), not the services catalog — the
// catalog never carries a serviceDescription field on any service.
const buildServiceDescriptionSection = (
  selections,
  descriptionByServiceID,
  categoryHeading,
  accentColor,
  fontFamily,
) => {
  const categoriesByID = new Map();
  Object.values(selections || {}).forEach((selection) => {
    const key = selection.serviceCatID ?? "uncategorised";
    if (!categoriesByID.has(key)) {
      categoriesByID.set(key, {
        categoryName: selection.categoryName || "Services",
        services: [],
      });
    }
    categoriesByID.get(key).services.push({
      name: selection.serviceName,
      description: descriptionByServiceID.get(selection.serviceID),
    });
  });
  const categories = Array.from(categoriesByID.values());
  if (categories.length === 0) return "";

  return `
    ${
      categories.length !== 0
        ? `<p style="${ffCss(fontFamily)}font-size:0.2in;color:${accentColor};font-weight:bold">${escapeHtml(categoryHeading)}</p>`
        : ""
    }
    ${categories
      .map(
        (category) => `
          <div>
            <p style="color:black;font-weight:bold;${ffCss(fontFamily)}font-size:0.2in">${escapeHtml(category.categoryName)}</p>
            <hr style="color:gray;margin-top:-15px">
            ${category.services
              .map(
                (service) => `
                  <p style="color:black;${ffCss(fontFamily)}">${escapeHtml(service.name)}</p>
                  <p style="color:black">${service.description ? service.description : ""}</p>`,
              )
              .join("")}
          </div>`,
      )
      .join("")}`;
};

// serviceID alone is enough to key this map since recurring/one-off
// descriptions are built and looked up in separate maps.
const buildDescriptionByServiceID = (pricing, serviceChargeTypeID) => {
  const map = new Map();
  (pricing || [])
    .filter((item) => Number(item.serviceChargeTypeID) === serviceChargeTypeID)
    .forEach((item) => {
      if (item.serviceDescription) {
        map.set(item.serviceID, item.serviceDescription);
      }
    });
  return map;
};

const buildServiceDescriptionHtml = ({
  recurringSelections,
  oneOffSelections,
  pricing,
  accentColor,
  heading,
  fontFamily = null,
}) => {
  const recurringSection = buildServiceDescriptionSection(
    recurringSelections,
    buildDescriptionByServiceID(pricing, 1),
    "Ongoing/Recurring Services",
    accentColor,
    fontFamily,
  );
  const oneOffSection = buildServiceDescriptionSection(
    oneOffSelections,
    buildDescriptionByServiceID(pricing, 2),
    "One-Off/Ad hoc Services",
    accentColor,
    fontFamily,
  );

  if (!recurringSection && !oneOffSection) return "";

  // Mirrors admin's HEADING case markup — the section-level title above the
  // breakdown, distinct from the breakdown's own sub-headings.
  const headingHtml = heading
    ? `<div style="padding-left:40px;padding-top:40px;padding-right:40px;font-size:0.2in;color:${accentColor};${ffCss(fontFamily)}">${escapeHtml(heading)}<br><hr style="color:black"></div>`
    : "";

  return `${headingHtml}<div style="padding-left:40px;padding-right:40px">${recurringSection}${oneOffSection}</div>`;
};

// "Additional Information" section — mirrors admin's markup (driverName +
// resolved-value paragraphs under a heading). Built from the live redux
// additionalInformationList, same variation/slab/text/date shape as
// buildAddUpdateQuotePayload.js resolves for the payload.
const resolveAdditionalInformationDisplayValue = (item) => {
  if (item.driverTypeID === 5) return item.enteredText ?? "";
  if (item.driverTypeID === 6) return item.enteredDate ?? "";
  if (item.driverTypeID === 3) {
    return (
      item.variation?.find((option) => option.variationID === item.driverValue)
        ?.variationName ?? ""
    );
  }
  if (item.driverTypeID === 4) {
    const slab = item.slab?.find(
      (option) => option.slabID === item.driverValue,
    );
    if (!slab) return "";
    // slabTypeID 2 is the "Other" entry — its slabFrom/slabTo range is
    // meaningless, the client's typed number lives in slabValue instead.
    return slab.slabTypeID === 2
      ? String(slab.slabValue ?? "")
      : `${slab.slabFrom} - ${slab.slabTo}`;
  }
  return item.driverValue ?? "";
};

const buildAdditionalInformationHtml = (
  additionalInformationList,
  accentColor,
  fontFamily,
) => {
  const rows = (additionalInformationList || [])
    .map((item) => ({
      label: item.driverName,
      value: resolveAdditionalInformationDisplayValue(item),
    }))
    .filter((row) => row.label && row.value !== "" && row.value != null);

  if (rows.length === 0) return "";

  return `
    <div style="padding-left:40px;padding-right:40px;${ffCss(fontFamily)}">
      <p style="color:${accentColor};font-weight:bold;font-size:0.2in">Additional Information</p>
      <hr style="color:gray;margin-top:-15px">
      ${rows
        .map(
          (row) =>
            `<p style="color:black">${escapeHtml(row.label)}: <strong>${escapeHtml(row.value)}</strong></p>`,
        )
        .join("")}
    </div>`;
};

// Mirrors sendDataToBackend()'s request shape. headerFooterFirstPage is the
// real template-level value (see resolvedHeaderFooterFirstPage below) —
// hardcoding it false previously sent the wrong value on every call.
// fontSizeContent/fontFamily/landscapeMode/flagForTemplatePdf/awsPdfHeight/
// awsPdfWidth have no equivalent wired up here yet.
const sendAmendmentPageToBackend = async ({
  userId,
  headingforpage,
  page,
  sequence,
  lengthPdf,
  color,
  brandLogo,
  headerContent,
  footerContent,
  headerImage,
  footerImage,
  headerHeight,
  footerHeight,
  watermarkImage,
  showSeparatorLines,
  headerFooterFirstPage,
  email,
  mobile,
  fullAddress,
  webSite,
}) => {
  const response = await fetch(generatePdfUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userId,
      email: email ?? null,
      mobile: mobile ?? null,
      fullAddress: fullAddress ?? null,
      webSite: webSite ?? null,
      headingforpage,
      genratedPdfData: page,
      sequence,
      lengthPdf,
      color: color ?? null,
      BrandLogo: brandLogo ?? null,
      fontSizeContent: null,
      fontFamily: null,
      HeaderContent: headerContent ?? null,
      FooterContent: footerContent ?? null,
      HeaderImage: headerImage ?? null,
      FooterImage: footerImage ?? null,
      HeaderHeight: headerHeight ?? null,
      FooterHeight: footerHeight ?? null,
      WatermarkImage: watermarkImage ?? null,
      showSeparatorLines: Boolean(showSeparatorLines),
      landscapeMode: false,
      headerFooterFirstPage: Boolean(headerFooterFirstPage),
      flagForTemplatePdf: false,
      awsPdfHeight: null,
      awsPdfWidth: null,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.message || "Failed to generate the amendment PDF.");
  }
  return data;
};

// Mirrors generateMergePdfUrl()'s request/response shape:
// {userId, moduleName} in, {success, s3Url} out.
const mergeAmendmentPdfs = async ({ userId, moduleName }) => {
  const response = await fetch(mergePdfApiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userId, moduleName }),
  });

  const data = await response.json();
  if (!response.ok || !data?.success || !data?.s3Url) {
    throw new Error(data?.message || "Failed to merge the amendment PDF.");
  }
  return data.s3Url;
};

// Returns the merged PDF's URL (same field AddUpdateProposal.jsx assigns to
// quotePDFUrl), or null when there's nothing to render.
//
// Mirrors generatePdf(): one generate-PDF call per page (whichever of
// Recurring Fees/One-Off Fees/Additional Information are present), fired
// via Promise.all, then a single merge call once all succeed.
export const generateAmendmentPdfUrl = async ({
  quoteModel,
  accentColor,
  quotationFinalAmountList,
  recurringSelections,
  oneOffSelections,
  additionalInformationList,
  pricing,
  currencyID,
  servicePackageList,
  serviceMappingWithPackagesList,
}) => {
  if (!quoteModel?.userKeyID) return null;

  // generatePdfUrl/mergePdfApiUrl namespace pages purely by this `userId`
  // string, with no clear/reset endpoint. Using quoteModel.userKeyID
  // directly would let a failed prior attempt's stale pages get pulled into
  // the next merge, so each call gets its own disposable key instead.
  const userId = `${quoteModel.userKeyID}-${Date.now()}-${Math.random().toString(36).slice(2)}`;

  const currencySymbol = CURRENCY_SYMBOLS[currencyID] || "£";
  // Overridden below with the template's own requiredData.brandColor once
  // fetched — admin colors every heading/table-header/label from that
  // field, not from this app's own UI theme.
  let resolvedAccentColor = accentColor || "#00BFFF";

  // Fetched once and reused for the cover page, the header/footer template,
  // and resolving the real templateKeyID below. A failure just means the
  // cover page is skipped rather than blocking the other pages.
  let templateLookupList = null;
  try {
    templateLookupList = await fetchTemplateLookupList({
      organisationKeyID: quoteModel?.organisationKeyID,
      clientID: quoteModel?.clientID,
      quoteKeyID: quoteModel?.quoteKeyID,
    });
  } catch (err) {
    templateLookupList = null;
  }

  // quoteModel.templateKeyID is NOT what admin uses to fetch the template —
  // AddUpdateProposal.jsx resolves the real key by matching this quote's
  // templateID against the template lookup list instead. Using the stored
  // field directly pointed at a stale template missing content.
  const resolvedTemplateKeyID =
    (templateLookupList || []).find(
      (item) => item.templateID === quoteModel?.templateID,
    )?.templateKeyID || quoteModel?.templateKeyID;

  const headerFooter = fetchTemplateHeaderFooter({
    list: templateLookupList,
    templateID: quoteModel?.templateID,
  });

  // Same resolution as admin's getFontNameById(template.fontFamilyID); the
  // "Select" placeholder (value null) is not a real font, so treat it as none.
  const resolvedFont = Utils.FontFamily.find(
    (font) => font.value === headerFooter?.fontFamilyID,
  )?.label;
  const fontFamily =
    resolvedFont && resolvedFont !== "Select" ? resolvedFont : null;

  let coverPageHtml = "";
  let introLetterHtml = "";
  let statementOfFactsIntroHtml = "";
  let paymentTermsHtml = "";
  let serviceDescriptionHeading = "Service Description";
  let organisationLogoUrl = null;
  // Admin sends this same value on every page call (computed once from
  // ModelData.enableFirstPage / headerFooterFirstPage, not per-page).
  // Hardcoding false here was sending the wrong value to the render
  // microservice on every call — the likely cause of an extra blank page.
  let resolvedHeaderFooterFirstPage = false;
  try {
    const templateModel = await fetchTemplateModel({
      templateKeyID: resolvedTemplateKeyID,
      clientID: quoteModel?.clientID,
      moduleKeyID: quoteModel?.quoteKeyID,
    });
    const templateElementList = templateModel?.templateElementList;
    const requiredData = templateModel?.templateElementListWithRequiredData;
    const hasOwnFirstPage = Array.isArray(templateElementList)
      ? templateElementList.some(
          (element) => element.templateElementTypeID === ElementType.First_Page,
        )
      : false;

    organisationLogoUrl = requiredData?.organisationLogoUrl || null;
    resolvedHeaderFooterFirstPage = templateModel?.enableFirstPage
      ? Boolean(templateModel?.headerFooterFirstPage)
      : false;
    if (requiredData?.brandColor) {
      resolvedAccentColor = requiredData.brandColor;
    }

    if (!hasOwnFirstPage && requiredData) {
      coverPageHtml = buildCoverPageHtml({
        organisationLogoUrl: requiredData.organisationLogoUrl,
        clientNameOnFirstPage: requiredData.clientNameOnFirstPage,
        fontFamily,
      });
    }

    // The first "Text Block" element is the intro letter (date/"To,"/client
    // details/"Dear <name>,"/opening paragraph), already rendered with this
    // client/quote's variables merged server-side.
    const introTextBlock = Array.isArray(templateElementList)
      ? templateElementList.find(
          (element) => element.templateElementTypeName === "Text Block",
        )
      : null;
    // Every Text Block gets admin's same 40px left/right padding wrapper.
    // Uses extractDraftJsPlainHtml, not raw htmlContent — see that
    // function's comment for why the raw Draft.js markup renders blank.
    introLetterHtml = introTextBlock?.htmlContent
      ? `<div style="padding-left:40px;padding-right:40px">${extractDraftJsPlainHtml(introTextBlock.htmlContent)}</div>`
      : "";

    // The template has a second Text Block sitting directly before the
    // Statement of facts element, distinct from the intro letter above.
    // Statement of facts itself still isn't rendered here (needs admin's
    // own prop shape) — just this static intro paragraph.
    const statementOfFactsIndex = Array.isArray(templateElementList)
      ? templateElementList.findIndex(
          (element) => element.templateElementTypeName === "Statement of facts",
        )
      : -1;
    if (statementOfFactsIndex > -1) {
      for (let i = statementOfFactsIndex - 1; i >= 0; i -= 1) {
        const element = templateElementList[i];
        if (element === introTextBlock) break;
        if (
          element.templateElementTypeName === "Text Block" &&
          element.htmlContent
        ) {
          statementOfFactsIntroHtml = `<div style="padding-left:40px;padding-right:40px">${extractDraftJsPlainHtml(element.htmlContent)}</div>`;
          break;
        }
      }
    }

    // "Payment Terms" is the template's last Text Block, right after
    // "Service Descriptions" — found the same way as the Statement of
    // facts intro above, searching forward instead of back.
    const serviceDescriptionsIndex = Array.isArray(templateElementList)
      ? templateElementList.findIndex(
          (element) =>
            element.templateElementTypeName === "Service Descriptions",
        )
      : -1;
    // The Heading element immediately preceding "Service Descriptions"
    // carries this section's actual title text (element.headings, e.g.
    // "Service Description") — mirrors PreviewComponentpdf.jsx's own
    // The Heading element before "Service Descriptions" carries this
    // section's title text — mirrors admin's own HEADING case.
    if (
      serviceDescriptionsIndex > 0 &&
      templateElementList[serviceDescriptionsIndex - 1]
        ?.templateElementTypeName === "Heading" &&
      templateElementList[serviceDescriptionsIndex - 1]?.headings
    ) {
      serviceDescriptionHeading =
        templateElementList[serviceDescriptionsIndex - 1].headings;
    }
    if (serviceDescriptionsIndex > -1) {
      for (
        let i = serviceDescriptionsIndex + 1;
        i < templateElementList.length;
        i += 1
      ) {
        const element = templateElementList[i];
        if (
          element.templateElementTypeName === "Text Block" &&
          element.htmlContent
        ) {
          paymentTermsHtml = `<div style="padding-left:40px;padding-right:40px">${extractDraftJsPlainHtml(element.htmlContent)}</div>`;
          break;
        }
      }
    }
  } catch (err) {
    coverPageHtml = "";
    introLetterHtml = "";
    statementOfFactsIntroHtml = "";
    paymentTermsHtml = "";
  }

  // Organisation contact details — auth requirement was removed, so this
  // is fetched the same way as the template lookups above.
  let organisationContactDetails = null;
  try {
    organisationContactDetails = await fetchOrganisationContactDetails(
      quoteModel?.organisationKeyID,
    );
  } catch (err) {
    organisationContactDetails = null;
  }

  // Built only now, after resolvedAccentColor may have been overridden by
  // the template's real brandColor above, so colors match admin's PDF.
  const findFinalAmountRow = (serviceChargeTypeID) =>
    (quotationFinalAmountList || []).find(
      (row) => Number(row.serviceChargeTypeID) === serviceChargeTypeID,
    ) || null;

  // Package/Custom Package quotes store one quotationFinalAmountList row
  // per selected package per charge type, not a single servicePackageID:null
  // row like a Service quote — findFinalAmountRow above only matches on
  // charge type, so this looks up each package's own row instead.
  const findFinalAmountRowForPackage = (serviceChargeTypeID, packageID) =>
    (quotationFinalAmountList || []).find(
      (row) =>
        Number(row.serviceChargeTypeID) === serviceChargeTypeID &&
        row.servicePackageID != null &&
        String(row.servicePackageID) === String(packageID),
    ) || null;

  // Mirrors ProposalPricingTableStep.jsx's isStandardPackage/isPackageBased
  // switch, which decides whether priceForSelectedPackage trusts the
  // serviceMappingWithPackagesList cross-join or the pricing item's own
  // flat package value.
  const isStandardPackage = quoteModel?.quoteTypeID === QUOTE_TYPE_ID.Package;
  const isPackageBased =
    isStandardPackage ||
    quoteModel?.quoteTypeID === QUOTE_TYPE_ID.CustomPackage;
  const packageColumns = isPackageBased ? servicePackageList || [] : [];

  const buildFeesHtmlForChargeType = (
    title,
    serviceChargeTypeID,
    selections,
  ) => {
    const row = findFinalAmountRow(serviceChargeTypeID);

    if (packageColumns.length > 0) {
      const categories = groupSelectionsByCategoryForPackages(
        selections,
        serviceChargeTypeID,
        pricing,
        packageColumns,
        isStandardPackage,
        serviceMappingWithPackagesList,
      );
      if (categories.length === 0) return "";

      // netTotal is summed from the live selected services' per-package
      // prices, not the stored quotationFinalAmountList row — that row is a
      // snapshot from admin's last save, so it would undercount anything
      // the client just added via Custom Package. The discount percentage
      // itself is still read from the stored row since that agreed rate
      // hasn't changed.
      const packageTotals = packageColumns.map((pkg, pkgIndex) => {
        const packageRow = findFinalAmountRowForPackage(
          serviceChargeTypeID,
          pkg.servicePackageID,
        );
        const liveNetTotal = categories.reduce(
          (sum, category) =>
            sum +
            category.services.reduce(
              (serviceSum, service) =>
                serviceSum + (service.packagePrices[pkgIndex] || 0),
              0,
            ),
          0,
        );
        const discountPercentage =
          Number(packageRow?.discountPercentageWithAllDecimal) || 0;
        const vatPercentage = packageRow?.vatPercentage ?? null;
        // Rounded to the nearest cent to match
        // AddUpdateProposal.jsx's GetNetTotalValueByRecurringPackage.
        const discounted = Number(
          ((liveNetTotal * discountPercentage) / 100).toFixed(2),
        );
        const discountedTotal = liveNetTotal - discounted;
        // Truncated (not rounded) to match AuthContext.jsx's
        // GetTwoDecimalValueWithoutRoundOff, used for every VAT amount.
        const vat =
          vatPercentage == null
            ? null
            : Math.floor(
                ((discountedTotal * Number(vatPercentage)) / 100) * 100,
              ) / 100;
        const grandTotal = vat == null ? null : discountedTotal + vat;

        return {
          netTotal: liveNetTotal,
          discounted,
          vatPercentage,
          vat,
          grandTotal,
        };
      });

      return buildPackageColumnsFeesTableHtml({
        title,
        currencySymbol,
        currencyID,
        categories,
        packageColumns,
        packageTotals,
        accentColor: resolvedAccentColor,
        fontFamily,
      });
    }

    const categories = groupSelectionsByCategory(
      selections,
      serviceChargeTypeID,
      pricing,
    );
    if (categories.length === 0) return "";

    return buildFeesTableHtml({
      title,
      currencySymbol,
      currencyID,
      categories,
      netTotal: row?.netTotal ?? 0,
      discounted: row?.discounted ?? 0,
      vatPercentage: row?.vatPercentage,
      vat: row?.vat,
      grandTotal: row?.grandTotal,
      accentColor: resolvedAccentColor,
      fontFamily,
    });
  };

  // Admin's Recurring Fees title carries the payment frequency, e.g.
  // "Recurring Fees (Monthly)".
  const paymentFrequencyLabel =
    PAYMENT_FREQUENCY_LABEL[quoteModel?.paymentFrequencyID] || "Yearly";

  const recurringHtml = buildFeesHtmlForChargeType(
    `Recurring Fees (${paymentFrequencyLabel})`,
    1,
    recurringSelections,
  );
  const oneOffHtml = buildFeesHtmlForChargeType(
    "One-Off Fees",
    2,
    oneOffSelections,
  );
  const additionalInformationHtml = buildAdditionalInformationHtml(
    additionalInformationList,
    resolvedAccentColor,
    fontFamily,
  );
  const serviceDescriptionHtml = buildServiceDescriptionHtml({
    recurringSelections,
    oneOffSelections,
    pricing,
    accentColor: resolvedAccentColor,
    heading: serviceDescriptionHeading,
    fontFamily,
  });

  // Second page: intro letter + both fees tables + Statement of Facts intro
  // + driver breakdown, all together — no page break between them, same as
  // the real template.
  const statementOfFactsDriverBreakdownHtml =
    buildStatementOfFactsDriverBreakdownHtml({
      recurringSelections,
      oneOffSelections,
      pricing,
      additionalInformationList,
      accentColor: resolvedAccentColor,
      fontFamily,
    });

  const servicesPageHtml = [
    introLetterHtml,
    recurringHtml,
    oneOffHtml,
    statementOfFactsIntroHtml,
    statementOfFactsDriverBreakdownHtml,
  ]
    .filter(Boolean)
    .join("");

  // Admin never sends the cover as its own standalone generatePdfUrl call —
  // it gets appended onto the same call as the services content (as
  // multiple {textbox} entries, not one concatenated string), matching
  // admin's own element grouping and avoiding an extra blank page.
  // After the fees tables: Service Description, then Additional
  // Information (web-based-proposal-only, not part of the template), then
  // Payment Terms.
  const coverAndServicesPage = [coverPageHtml, servicesPageHtml]
    .filter(Boolean)
    .map((html) => ({ textbox: html }));

  // Service Description is often short on its own (just the section heading
  // and a couple of service names, no long description text) — sending it
  // as its own standalone call reproduces the same isolated-short-call
  // blank-page issue the cover page hit earlier, which was fixed there by
  // merging it into the next call instead of sending it alone. Same fix
  // here: bundled with Additional Information into one call.
  const serviceDescriptionAndAdditionalInfoPage = [
    serviceDescriptionHtml,
    additionalInformationHtml,
  ]
    .filter(Boolean)
    .map((html) => ({ textbox: html }));

  const pages = [
    coverAndServicesPage,
    serviceDescriptionAndAdditionalInfoPage,
    ...[paymentTermsHtml].filter(Boolean).map((html) => [{ textbox: html }]),
  ].filter((page) => page.length > 0);
  if (pages.length === 0) return null;

  const headingforpage = quoteModel?.quotationName || "";
  const lengthPdf = pages.length;

  // These fields are sent identically on every call, same as admin's own
  // postData — none of them vary per page/sequence.
  await Promise.all(
    pages.map((page, index) =>
      sendAmendmentPageToBackend({
        userId,
        headingforpage,
        page,
        sequence: index + 1,
        lengthPdf,
        color: resolvedAccentColor,
        brandLogo: organisationLogoUrl,
        headerContent: headerFooter?.headerContent,
        footerContent: headerFooter?.footerContent,
        headerImage: headerFooter?.headerImage,
        footerImage: headerFooter?.footerImage,
        headerHeight: headerFooter?.headerHeight,

        footerHeight: headerFooter?.footerHeight,
        watermarkImage: headerFooter?.watermarkImage,
        showSeparatorLines: Boolean(headerFooter?.showSeparatorLines),
        headerFooterFirstPage: resolvedHeaderFooterFirstPage,
        email: organisationContactDetails?.email,
        mobile: organisationContactDetails?.mobile,
        fullAddress: organisationContactDetails?.fullAddress,
        webSite: organisationContactDetails?.webSite,
      }),
    ),
  );

  return mergeAmendmentPdfs({ userId, moduleName: "Quote" });
};
