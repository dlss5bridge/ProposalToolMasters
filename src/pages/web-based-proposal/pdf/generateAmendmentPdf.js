import { generatePdfUrl, mergePdfApiUrl } from "../../../Base-Url/Base_Url";
import {
  GetTemplateModelDataWithoutToken,
  GetTemplateHeaderFooterLookupWithoutToken,
  GetOrganisationInformationModelWithoutToken,
} from "../../../redux/Services/Proposal/ProposalApi";
import { ElementType, QUOTE_TYPE_ID } from "../../../Middleware/enums";

// Web-Based Proposal counterpart to PreviewComponentpdf.jsx's
// generatePdf()/sendDataToBackend()/generateMergePdfUrl() (see that file's
// `generatePdfData`/`MergePdfUrl` state) — reuses the exact same two
// raw-fetch endpoints and payload/response shape AddUpdateProposal.jsx's
// Preview step already relies on, WITHOUT modifying or importing anything
// from PreviewComponentpdf.jsx or AddUpdateProposal.jsx.
//
// Scope: PreviewComponentpdf.jsx's full document (intro letter, Statement of
// Facts, signature/Payment Terms) still depends on admin-authenticated
// component state (contractSignatoriesList, the template editor's live
// content) with no reachable API — so this regenerates only what the client
// can actually change on this Amendment (Services fees, Additional
// Information) plus the cover page and per-page header/footer branding,
// which ARE now reachable: organisation logo/client name
// (GetMasterTemplateDetailsWithVariableValues), header/footer template
// assets (GetProposalEnggLetterTemplateLookUpList — confirmed unauthenticated
// despite the admin-side wrapper's name), and organisation contact details
// (GetOrganisationInformationModel — its auth requirement was removed).
// Merged the same way admin does, via generatePdfUrl/mergePdfApiUrl.
const escapeHtml = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (ch) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        ch
      ],
  );

// Every Text Block element's htmlContent (intro letter, Statement of Facts
// intro, Payment Terms) is raw Draft.js editor export markup: deeply nested
// `<div data-block="true" style="box-sizing: border-box; ...; position:
// relative; ...">` wrappers around `<span data-text="true">`. Confirmed
// live: passed through verbatim, this content never actually renders any
// visible text through the PDF-render microservice, yet still consumes a
// full page of blank space before the next real content — this nested
// box-sizing/position:relative combination is a known problem class for
// wkhtmltopdf-style renderers (silently dropped/blanked while still
// reserving layout space). Rebuilt here as plain, minimal <p> tags instead
// of trusting the raw editor markup — extracts each `data-text="true"`
// span's own text (one per Draft.js block/paragraph), preserving embedded
// newlines as <br> and bold styling on the immediate parent span (the only
// inline style this template actually uses, e.g. the "Payment Terms"
// heading).
const extractDraftJsPlainHtml = (rawHtml) => {
  if (!rawHtml) return "";

  const paragraphs = [];
  const blockPattern =
    /<span[^>]*style="([^"]*)"[^>]*>\s*<span data-text="true"[^>]*>([\s\S]*?)<\/span>\s*<\/span>/g;
  let match = blockPattern.exec(rawHtml);
  while (match) {
    const [, styleAttr, text] = match;
    const isBold = /font-weight:\s*bold/.test(styleAttr);
    const lineBreakHtml = text.replace(/\r?\n/g, "<br>");
    paragraphs.push(
      isBold
        ? `<p style="margin:0 0 1em 0;font-weight:bold">${lineBreakHtml}</p>`
        : `<p style="margin:0 0 1em 0">${lineBreakHtml}</p>`,
    );
    match = blockPattern.exec(rawHtml);
  }

  if (paragraphs.length > 0) return paragraphs.join("");

  // Not every Text Block was authored in Draft.js's own nested
  // data-block/data-text export shape — confirmed live that the Statement
  // of Facts intro paragraph ("Proposal for the custom package is based on
  // the facts...") is instead a plain `<p><span style="...">text</span></p>`
  // block with no data-text attribute at all. The pattern above matched
  // nothing for it and silently returned "", which still passed every
  // caller's truthiness check (the padding div wrapper around it is a
  // non-empty string) — so the section wasn't skipped, it just rendered
  // blank. Falls back to reading each top-level <p> as its own paragraph.
  const paragraphPattern = /<p[^>]*>([\s\S]*?)<\/p>/g;
  const fallbackParagraphs = [];
  let pMatch = paragraphPattern.exec(rawHtml);
  while (pMatch) {
    const text = pMatch[1].replace(/<[^>]+>/g, "").trim();
    if (text) {
      fallbackParagraphs.push(`<p style="margin:0 0 1em 0">${text}</p>`);
    }
    pMatch = paragraphPattern.exec(rawHtml);
  }
  if (fallbackParagraphs.length > 0) return fallbackParagraphs.join("");

  // Last resort — no recognisable paragraph structure at all: strip every
  // tag and show whatever text remains as a single paragraph, rather than
  // silently rendering nothing.
  const plainText = rawHtml.replace(/<[^>]+>/g, "").trim();
  return plainText ? `<p style="margin:0 0 1em 0">${plainText}</p>` : "";
};

// Same map ProposalPricingTableStep.jsx already uses for on-screen totals
// (CURRENCY_SYMBOLS) — duplicated here rather than exported/imported since
// that file doesn't export it and this is a tiny, stable lookup.
const CURRENCY_SYMBOLS = { 1: "£", 2: "€", 3: "$", 4: "₹" };

// Same mapping ProposalPricingTableStep.jsx's own PAYMENT_FREQUENCY_LABEL
// uses, mirroring AddUpdateProposal.jsx's getPaymentFrequencyLabel — admin's
// fees table title is suffixed with this, e.g. "Recurring Fees (Monthly)".
const PAYMENT_FREQUENCY_LABEL = {
  1: "Yearly",
  2: "Half-Yearly",
  3: "Quarterly",
  4: "Monthly",
};

// Same mapping as buildAddUpdateQuotePayload.js's own getTaxName (not
// exported from there, duplicated here for the same reason as
// CURRENCY_SYMBOLS above) — admin's fees table labels this row by currency,
// e.g. "GST" for INR, not a hardcoded "VAT".
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

// Groups one charge type's live, currently-committed selections by category
// — mirrors buildSelectedServicesListFromSelections' own reading of
// `selections`/`pricing`, but only for display (name + price), no payload
// shape involved.
const groupSelectionsByCategory = (selections, serviceChargeTypeID, pricing) => {
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
        // ProposalServicesStep/index.jsx stores this field as `categoryName`
        // (from category.serviceCatName), not `serviceCatName` on the
        // selection itself — using the wrong key silently fell through to
        // the "Services" fallback for every category.
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

// Package/Custom Package quotes price a service per *package slot*
// (packageOneValue/Two/ThreeValue, each tagged with which package landed in
// that slot via packageOneID/Two/ThreeID) instead of a single flat `price` —
// ported verbatim from ProposalPricingTableStep.jsx's own
// priceForSelectedPackage/PACKAGE_PRICE_SLOTS (not exported from there, so
// duplicated here the same way CURRENCY_SYMBOLS/getTaxName already are).
// Standard Package trusts serviceMappingWithPackagesList's cross-join first
// (the admin-agreed per-package price); Custom Package reads the pricing
// item's own flat slot value after checking servicePackageIDs membership
// (a slot can carry a packageID with a null value for a package the service
// isn't actually part of). Returns null — rendered as "—"/a cross — when
// the service isn't part of that package by either source, exactly
// matching the on-screen package columns this same function drives there.
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

// Groups selections by category the same way groupSelectionsByCategory does
// (name/serviceID per service, category name from the selection's own
// categoryName), but resolves a per-package price for every package column
// instead of a single price — for the Package/Custom Package pricing table
// below.
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

// Statement of Facts driver breakdown — mirrors PreviewComponentpdf.jsx's
// own STATEMENT_OF_FACTS case (non-package branch, PreviewComponentpdf.jsx:
// 6199-6351): "Ongoing/Recurring Services"/"One-Off/Ad hoc Services"
// heading, category name + <hr>, then per service its name followed by a
// bullet list of "driverName: value" for every one of its pricing drivers.
// Reads the SAME redux-hydrated `driverValues` map the Services step's own
// dropdowns/inputs read and write (ProposalServicesStep/index.jsx's
// buildInitialDriverValues + PricingDriverField.jsx's onChange) — each
// entry already carries a resolved, human-readable `label` for a
// variation/slab driver (kept in sync with every user edit by
// PricingDriverField.jsx's `label: option?.label ?? null`), so there's no
// separate variation/slab lookup to get wrong here the way
// resolveAdditionalInformationDisplayValue's did — this reuses the value
// the UI itself already computed and displays.
// A service priced purely off Global Pricing Drivers (no local
// pricingDriverList entries of its own — confirmed live: its whole
// pricingDriverList comes back as []) has an empty driverValues map above,
// so it would otherwise show no driver line here at all. Admin's own
// STATEMENT_OF_FACTS case doesn't have this gap because its
// selectedRecurringServiceList/selectedOneOffServiceList items carry a
// separate gpdList field merging in exactly these global drivers
// (AddUpdateProposal.jsx:3249, `srv?.gpdList`). Rebuilt here from data
// already available: `pricing` (GetCalculatedServicesPriceByPackages) has
// this service's own pricingFormulaGPDsList (which globalPricingDriverIDs
// its formula actually uses), cross-referenced against
// additionalInformationList (which has each global driver's own resolved
// display value) — reuses resolveAdditionalInformationDisplayValue rather
// than re-deriving variation/slab labels a second, possibly-inconsistent
// way.
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

  // Mirrors AddUpdateProposal.jsx's own STATEMENT_OF_FACTS non-package case
  // exactly: the "Ongoing/Recurring Services"/"One-Off/Ad hoc Services"
  // heading is colored with newColorCode (the template's brand color), not
  // black — only the category name below it (serviceCat.serviceCatName) is
  // black in admin's own markup. This heading was hardcoded black here,
  // one of the confirmed color mismatches against admin's PDF.
  return `
    <p style="font-family:${fontFamily};font-size:0.2in;color:${accentColor};font-weight:bold">${escapeHtml(categoryHeading)}</p>
    ${categories
      .map(
        (category) => `
          <div style="font-family:${fontFamily}">
            <p style="font-family:${fontFamily};color:black;font-size:0.2in;font-weight:bold">${escapeHtml(category.categoryName)}</p>
            <hr style="color:gray;margin-top:-15px">
            ${category.services
              .map(
                (service) => `
                  <p style="font-family:${fontFamily};color:black;font-size:14px">${escapeHtml(service.name)}</p>
                  ${service.drivers
                    .map(
                      (driver) => `
                        <li style="font-family:${fontFamily};color:black;font-size:14px;margin-top:5px">${escapeHtml(driver.driverName)}: <strong>${escapeHtml(String(driver.label ?? driver.value))}</strong></li>`,
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
  fontFamily = "arial, sans-serif",
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

// Fees table — same header/category/total row styling confirmed via a live
// GetQuoteModel response to match GetQuoteModel's own recurringHtmlContent/
// oneOffHtmlContent for this organisation (#00BFFF header, #DCDCDC category
// rows — two cells, not colspan — #808080 total rows). Fed from the live,
// correctly-computed totals (quotationFinalAmountList, which now falls back
// to the live VAT rate for a charge type with no prior row — see
// buildQuotationFinalAmountListForServiceType).
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
}) => {
  if (!categories || categories.length === 0) return "";

  const formatAmount = (value) =>
    `${currencySymbol}${(Number(value) || 0).toFixed(2)}`;

  const categoryRows = categories
    .map(
      (category) => `
        <tr style="background-color:#DCDCDC">
          <td style="border:1px solid #DDDDDD;text-align:left;padding:8px;font-weight:bold;font-size:0.2in">${escapeHtml(category.categoryName)}</td>
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
    <div style="padding-left:40px;padding-right:40px;font-family:'Times New Roman', Times, serif">
      <p style="font-family:arial, sans-serif;color:${accentColor};font-size:0.2in;margin-top:15px">${escapeHtml(title)}</p>
      <table style="font-family:arial, sans-serif;border-collapse:collapse;width:100%;margin-top:-15px">
        <tr style="background-color:${accentColor}">
          <th style="border:1px solid #DDDDDD;text-align:left;padding:8px;color:white;font-size:0.2in">Services</th>
          <th style="border:1px solid #DDDDDD;text-align:right;padding:8px;color:white;font-size:0.2in">Fees (${currencySymbol})</th>
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

// Package/Custom Package pricing table — same header/category/total-row
// styling as buildFeesTableHtml, but one column per package instead of a
// single "Fees" column, matching the on-screen package columns
// ProposalPricingTableStep.jsx renders (packageColumns.map + "—" for a
// service that isn't part of that package). packageTotals is one
// {netTotal, discounted, vatPercentage, vat, grandTotal} per package column
// (see findFinalAmountRowForPackage below) — each package prices
// independently, so Net Total/Discount/VAT/Grand Total genuinely differ per
// column, same as ProposalPricingTableStep.jsx's own side-by-side
// Calculation columns (buildPackageTotalsList). Showing one shared total
// only in the last column, as an earlier version of this function did, was
// the actual bug: quotationFinalAmountList has one row per package for a
// package-based quote, and only the single row matching the charge type
// (whichever package happened to come first) was ever read.
const buildPackageColumnsFeesTableHtml = ({
  title,
  currencySymbol,
  currencyID,
  categories,
  packageColumns,
  packageTotals,
  accentColor,
}) => {
  if (!categories || categories.length === 0 || packageColumns.length === 0) {
    return "";
  }

  const columnCount = packageColumns.length;
  const formatAmount = (value) =>
    `${currencySymbol}${(Number(value) || 0).toFixed(2)}`;
  const formatCell = (value) => (value === null ? "&#10007;" : formatAmount(value));

  const categoryRows = categories
    .map(
      (category) => `
        <tr style="background-color:#DCDCDC">
          <td style="border:1px solid #DDDDDD;text-align:left;padding:8px;font-weight:bold;font-size:0.2in">${escapeHtml(category.categoryName)}</td>
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
  const hasAnyVat = packageTotals.some((totals) => totals.vatPercentage != null);

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
    <div style="padding-left:40px;padding-right:40px;font-family:'Times New Roman', Times, serif">
      <p style="font-family:arial, sans-serif;color:${accentColor};font-size:0.2in;margin-top:15px">${escapeHtml(title)}</p>
      <table style="font-family:arial, sans-serif;border-collapse:collapse;width:100%;margin-top:-15px">
        <tr style="background-color:${accentColor}">
          <th style="border:1px solid #DDDDDD;text-align:left;padding:8px;color:white;font-size:0.2in">Services</th>
          ${packageColumns
            .map(
              (pkg) =>
                `<th style="border:1px solid #DDDDDD;text-align:right;padding:8px;color:white;font-size:0.2in">${escapeHtml(pkg.servicePackageName)}</th>`,
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

// Fetches this quote's document template — same endpoint/params
// AddUpdateProposal.jsx uses via TemplateApi.jsx's GetTemplateModelData
// (AddUpdateProposal.jsx:21520-21525: TemplateTypeID: 1, ModuleKeyID: the
// quote itself) — returns the whole response data, or null on failure.
// Only templateElementListWithRequiredData (organisationLogoUrl/
// clientNameOnFirstPage) is actually used right now, for the first/cover
// page below.
const fetchTemplateModel = async ({ templateKeyID, clientID, moduleKeyID }) => {
  if (!templateKeyID || !clientID) return null;

  const res = await GetTemplateModelDataWithoutToken({
    templateKeyID,
    clientID,
    moduleKeyID,
  });

  return res?.data?.responseData?.data ?? null;
};

// Fetches this organisation's template list — (templateID, templateKeyID,
// headerContent/footerContent/headerImage/footerImage/headerHeight/
// footerHeight/watermarkImage/showSeparatorLines) per template. Used both to
// resolve the real templateKeyID for this quote (see resolvedTemplateKeyID
// below) and to pick the header/footer template matching this quote's
// templateID — mirrors AddUpdateProposal.jsx's own defaultTemplateObject
// selection exactly (AddUpdateProposal.jsx:20914-20943: filter
// mappedOptions by templateID, use the first match; :21031-21034 for the
// templateKeyID resolution). Falls back to the first template in the list
// when there's no exact templateID match (AddUpdateProposal.jsx's own else
// branch, :21091-21166) rather than returning nothing. Returns null if the
// lookup fails or the organisation has none configured.
const fetchTemplateLookupList = async ({ organisationKeyID, clientID, quoteKeyID }) => {
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

// Same concatenation AddUpdateProposal.jsx's own concatenateFullAddress
// does (AddUpdateProposal.jsx:20780-20796), applied to
// ModelData.organisationAddress — comma-joins whichever address parts are
// non-empty, trailing comma stripped.
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

// Fetches the organisation's own contact details — email/phone/address/
// website — same source AddUpdateProposal.jsx reads for sendDataToBackend's
// email/mobile/fullAddress/webSite fields (AddUpdateProposal.jsx:20754-20804).
// This endpoint previously required an auth token (confirmed via a live
// 401); that requirement has since been removed, so it's now reachable here
// the same way the template lookups above are.
const fetchOrganisationContactDetails = async (organisationKeyID) => {
  if (!organisationKeyID) return null;

  const res = await GetOrganisationInformationModelWithoutToken(
    organisationKeyID,
  );
  const modelData = res?.data?.responseData?.data;
  if (!modelData) return null;

  const { emailID, phoneNo, countryCode, website } =
    modelData.otherInformation || {};

  return {
    email: emailID ?? null,
    // Same concatenation as admin's own concatenatedPhone
    // (AddUpdateProposal.jsx:20803).
    mobile: countryCode || phoneNo ? `${countryCode ?? ""} ${phoneNo ?? ""}`.trim() : null,
    fullAddress: concatenateFullAddress(modelData.organisationAddress) || null,
    webSite: website ?? null,
  };
};

// First/cover page — mirrors AddUpdateProposal.jsx's firstPageHTML
// (AddUpdateProposal.jsx:21545-21565) field-for-field: organisation logo as
// a centered background-image block, then "Proposal For" + the client's
// name, both in the admin flow's hardcoded #00BFFF (not the live brand
// color — admin doesn't use one here either). Only built when the
// template doesn't already define its own First Page element
// (ElementType.First_Page) — mirrors AddUpdateProposal.jsx's
// isAddedFirstPage check (AddUpdateProposal.jsx:21567-21572): if the
// template has one, that element's own (admin-authored) htmlContent is
// admin's real cover page and must not be overridden here.
// NOTE on page-break-after: admin's own firstPageHTML
// (AddUpdateProposal.jsx:21559) has `page-break-after: always` on this
// paragraph because the First Page element is never sent as its own
// standalone generatePdfUrl call — PreviewComponentpdf.jsx's TEXT_BLOCK/
// SERVICE_PRICING_TABLE cases only start a NEW call when the previous
// element was a PAGE_BREAK/AWS_PDF_LINK; First_Page isn't either, so the
// intro letter and pricing table that follow it get APPENDED onto the very
// same call/HTML document as the cover. The forced break is the only thing
// separating the cover from that content within that one shared render.
// An earlier version of this file sent the cover as its own independent,
// short-content call — removing the break there just meant the cover's own
// call didn't force an extra page on ITS OWN, but the underlying
// architecture mismatch (cover as an isolated call at all) was the actual
// bug producing the extra blank page. Fixed at the call site
// (generateAmendmentPdfUrl below) by merging the cover into the same page
// entry as the services content, matching admin's real grouping — which
// means this forced break is genuinely needed again now.
const buildCoverPageHtml = ({ organisationLogoUrl, clientNameOnFirstPage, fontFamily }) => `
  <div style="margin-top:300px">
    <div style="display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;margin-top:${organisationLogoUrl ? "-100px" : "0px"}">
      ${
        organisationLogoUrl
          ? `<div style="width:700px;height:150px;background-image:url('${organisationLogoUrl}');background-size:contain;background-repeat:no-repeat;background-position:center"></div>`
          : ""
      }
      <p style="text-align:center;color:#00BFFF;page-break-after:always">
        <span style="display:block;color:#00BFFF;margin-top:15px;font-size:50px;font-family:${fontFamily}">Proposal For</span>
        <span style="display:block;color:black;margin-top:15px;font-size:25px;font-family:${fontFamily}">${escapeHtml(clientNameOnFirstPage || "")}</span>
      </p>
    </div>
  </div>`;

// Service Description section — mirrors PreviewComponentpdf.jsx's own
// SERVICE_DESCRIPTION case markup (PreviewComponentpdf.jsx:5774-5858):
// "Ongoing/Recurring Services" heading, then each category name + <hr>,
// then each service's name + description paragraph, repeated for
// "One-Off/Ad hoc Services". Built from the LIVE, currently-selected
// services (recurringSelections/oneOffSelections) so a client-added
// service's category/name always appears here, same as before — but its
// description now comes from `descriptionByServiceID` (built from
// `pricing`, i.e. GetCalculatedServicesPriceByPackages), NOT the services
// catalog (GetServicesWithGlobalPricingDriverListByServiceChargeType).
// Confirmed live: the catalog response never carries a serviceDescription
// field on ANY service, admin included — this earlier version read it from
// there and so silently rendered every description as empty. Admin's own
// servicePriceData.serviceDescription (AddUpdateProposal.jsx:17581) is
// read from that same GetCalculatedServicesPriceByPackages response,
// confirmed live to genuinely carry a populated serviceDescription per
// service+charge-type where one is configured.
const buildServiceDescriptionSection = (selections, descriptionByServiceID, categoryHeading, accentColor, fontFamily) => {
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
        ? `<p style="font-family:${fontFamily};font-size:0.2in;color:${accentColor};font-weight:bold">${escapeHtml(categoryHeading)}</p>`
        : ""
    }
    ${categories
      .map(
        (category) => `
          <div>
            <p style="color:black;font-weight:bold;font-family:${fontFamily};font-size:0.2in">${escapeHtml(category.categoryName)}</p>
            <hr style="color:gray;margin-top:-15px">
            ${category.services
              .map(
                (service) => `
                  <p style="color:black;font-family:${fontFamily};font-size:14px">${escapeHtml(service.name)}</p>
                  <p style="color:black">${service.description ? service.description : ""}</p>`,
              )
              .join("")}
          </div>`,
      )
      .join("")}`;
};

// pricing (GetCalculatedServicesPriceByPackages' `data` array) is keyed by
// serviceChargeTypeID+serviceID elsewhere in this file (see
// groupSelectionsByCategory's own priceByServiceID) because a serviceID is
// only unique within one charge type — but Recurring/One-Off descriptions
// are built and looked up separately here (recurringSelections only ever
// contains recurring serviceIDs, oneOffSelections only one-off ones), so a
// plain serviceID keying is unambiguous for each map on its own.
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
  fontFamily = "arial, sans-serif",
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

  // Mirrors PreviewComponentpdf.jsx's own HEADING case markup
  // (padding-top:40px, colored, <br><hr>) — the section-level title
  // ("Service Description") that sits above the Ongoing/Recurring
  // Services breakdown in the real template, distinct from that
  // breakdown's own sub-headings.
  const headingHtml = heading
    ? `<div style="padding-left:40px;padding-top:40px;padding-right:40px;font-size:0.2in;color:${accentColor};font-family:${fontFamily}">${escapeHtml(heading)}<br><hr style="color:black"></div>`
    : "";

  return `${headingHtml}<div style="padding-left:40px;padding-right:40px">${recurringSection}${oneOffSection}</div>`;
};

// "Additional Information" section — mirrors PreviewComponentpdf.jsx's own
// markup for it (its own driverName + resolved-value paragraphs under a
// heading + <hr>), built from the live, redux-hydrated additionalInformationList
// (already carries item.driverName plus the same variation/slab/text/date
// shape buildAdditionalInformationListForPayload resolves in
// buildAddUpdateQuotePayload.js).
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
    const slab = item.slab?.find((option) => option.slabID === item.driverValue);
    if (!slab) return "";
    // Mirrors ProposalAdditionalInformationStep.jsx's own slab label/value
    // resolution exactly (renderField, driverTypeID 4 case): a slabTypeID 2
    // row is the "Other" entry — its own slabFrom/slabTo range is
    // meaningless, the client's typed number lives in slabValue instead.
    // There is no `slabTypeName` field on this shape at all — reading it
    // here always returned undefined and silently fell through to the
    // (equally wrong, for "Other") from-to range.
    return slab.slabTypeID === 2
      ? String(slab.slabValue ?? "")
      : `${slab.slabFrom} - ${slab.slabTo}`;
  }
  return item.driverValue ?? "";
};

const buildAdditionalInformationHtml = (additionalInformationList, accentColor) => {
  const rows = (additionalInformationList || [])
    .map((item) => ({
      label: item.driverName,
      value: resolveAdditionalInformationDisplayValue(item),
    }))
    .filter((row) => row.label && row.value !== "" && row.value != null);

  if (rows.length === 0) return "";

  return `
    <div style="padding-left:40px;padding-right:40px;font-family:arial, sans-serif">
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

// Mirrors sendDataToBackend()'s request shape field-for-field. email/mobile/
// fullAddress/webSite (fetchOrganisationContactDetails) and HeaderContent/
// FooterContent/HeaderImage/FooterImage/HeaderHeight/FooterHeight/
// WatermarkImage/showSeparatorLines (fetchTemplateHeaderFooter) are now
// fetched from their real sources below — both were confirmed to require
// no auth token (one from the start, one after the auth requirement was
// removed). headerFooterFirstPage is now the real, template-level value
// (see resolvedHeaderFooterFirstPage in generateAmendmentPdfUrl) —
// hardcoding it `false` sent an admin-meaningful boolean's wrong value to
// the render microservice on every call. fontSizeContent/fontFamily/
// landscapeMode/flagForTemplatePdf/awsPdfHeight/awsPdfWidth still have no
// equivalent wired up here.
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

// Mirrors generateMergePdfUrl()'s request/response shape exactly:
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
// Sequence mirrors generatePdf() exactly: one generate-PDF call per page —
// Recurring Fees, One-Off Fees, Additional Information, whichever are
// actually present — fired together via Promise.all, and only once every
// one of those calls has succeeded does the single merge call run, matching
// `await Promise.all(promises); generateMergePdfUrl();`.
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
  // string — there's no per-request/session key in their contract, and no
  // clear/reset endpoint exists on either side (PreviewComponentpdf.jsx
  // doesn't call one either). Using the real, shared quoteModel.userKeyID
  // directly meant any earlier attempt for this same quote that generated
  // pages but never reached a successful merge (a thrown error mid-
  // Promise.all, a retried Amend click) left pages sitting under that same
  // key — the next successful merge would then pull those stale pages in
  // alongside the new ones, producing duplicated/out-of-order pages. A
  // fresh, disposable key per call sidesteps that: each Amend attempt gets
  // its own isolated generate+merge namespace.
  const userId = `${quoteModel.userKeyID}-${Date.now()}-${Math.random().toString(36).slice(2)}`;

  const currencySymbol = CURRENCY_SYMBOLS[currencyID] || "£";
  // Overridden below with the template's own requiredData.brandColor once
  // fetched — admin colors every heading/table-header/label (Recurring
  // Fees, Additional Information, Service Description, ...) from that
  // field (PreviewComponentpdf.jsx's `newColorCode = props.BrandColor`),
  // not from this web-based-proposal app's own UI theme. Confirmed live:
  // this org's real brandColor is "#00AFEF", not the "#00BFFF" fallback or
  // whatever theme.primary happens to resolve to here — using the wrong
  // color for every colored element was the actual cause of the visible
  // theme mismatch against admin's PDF.
  let resolvedAccentColor = accentColor || "#00BFFF";

  // First/cover page — fetched separately since it needs
  // templateElementListWithRequiredData (organisationLogoUrl/
  // clientNameOnFirstPage), not anything already available from
  // quoteModel/live selections. A failure here (template fetch, or the
  // template genuinely has no logo/client name) just means no cover page
  // gets prepended — it doesn't block the Services/Additional Information
  // pages this call already produces.
  // Same lookup list used to resolve the header/footer template below —
  // fetched once here and reused for both, since it's also the source of
  // the real templateKeyID (see resolvedTemplateKeyID below).
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

  // quoteModel.templateKeyID (the quote's own stored field) is NOT what
  // admin actually uses to fetch the template — AddUpdateProposal.jsx
  // comments out exactly that assignment (`// selectTemplateTypeId:
  // ModelData.templateKeyID,`) and instead resolves the real key by
  // matching this quote's numeric templateID against
  // GetProposalEnggLetterTemplateLookUpList's results, using THAT record's
  // templateKeyID. Confirmed live: quoteModel.templateKeyID pointed at a
  // stale/wrong template whose Text Block was missing content
  // (documentCode-like value + a second reference number) that the
  // correctly-resolved templateKeyID's Text Block does contain — this was
  // the actual root cause of the missing text, not a backend limitation.
  const resolvedTemplateKeyID =
    (templateLookupList || []).find(
      (item) => item.templateID === quoteModel?.templateID,
    )?.templateKeyID || quoteModel?.templateKeyID;

  let coverPageHtml = "";
  let introLetterHtml = "";
  let statementOfFactsIntroHtml = "";
  let paymentTermsHtml = "";
  let serviceDescriptionHeading = "Service Description";
  let organisationLogoUrl = null;
  // AddUpdateProposal.jsx sends this SAME value on every single page call,
  // not per-page (PreviewComponentpdf.jsx:342-344: `isDefaultFirstPage ?
  // headerFooterFirstPage : null`, both computed once and passed as a
  // constant to every sendDataToBackend call). isDefaultFirstPage is
  // ModelData.enableFirstPage (AddUpdateProposal.jsx:21646); the actual
  // toggle value is ModelData.headerFooterFirstPage — both are fields on
  // this same template model response. Hardcoding `false` here on every
  // page (as before) sent an admin-meaningful boolean's WRONG value to the
  // render microservice on every call, including the one whose sequence
  // really is page 1 of the merged document — this is the most likely
  // cause of the extra blank page that kept appearing directly after the
  // cover regardless of the cover page's own HTML content (confirmed live:
  // the blank page persisted even after the cover page's content was
  // fixed to render correctly).
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
        fontFamily: "arial, sans-serif",
      });
    }

    // Same lookup AddUpdateProposal.jsx itself uses for GetCommonFontFamily
    // (AddUpdateProposal.jsx:21531-21532: the first "Text Block" element) —
    // in the real template this is the intro letter (date/"To,"/client
    // details/"Dear <name>,"/opening paragraph) that sits immediately
    // before the pricing table on the same page, already fully rendered
    // with this client/quote's variables merged by
    // GetMasterTemplateDetailsWithVariableValues. Used verbatim, same as
    // every other Text Block element.
    const introTextBlock = Array.isArray(templateElementList)
      ? templateElementList.find(
          (element) => element.templateElementTypeName === "Text Block",
        )
      : null;
    // Mirrors PreviewComponentpdf.jsx's own TEXT_BLOCK case exactly
    // (PreviewComponentpdf.jsx:5624-5629: `<div style="padding-left: 40px;
    // padding-right: 40px;">${htmlContent}</div>`) — every Text Block gets
    // this 40px left/right padding wrapper; using the raw htmlContent
    // without it (as before) ran the letter edge-to-edge instead of
    // matching admin's actual margins.
    //
    // The short reference value above the contact line, and the second
    // reference number near "To,", both come from this Text Block's
    // htmlContent itself once fetched with the correctly-resolved
    // templateKeyID above — no separate field/guess needed (documentCode
    // and postcode were both ruled out earlier; the real cause was the
    // wrong templateKeyID being used to fetch the template at all).
    //
    // extractDraftJsPlainHtml, not the raw htmlContent: confirmed live that
    // passing this Draft.js markup straight through rendered NO visible
    // text anywhere in the merged PDF while still eating a full blank
    // page — see that function's own comment.
    introLetterHtml = introTextBlock?.htmlContent
      ? `<div style="padding-left:40px;padding-right:40px">${extractDraftJsPlainHtml(introTextBlock.htmlContent)}</div>`
      : "";

    // The real template has a SECOND Text Block ("Proposal for the ...
    // package is based on the facts you have given below. We've based our
    // proposal on the following facts...") sitting directly between the
    // Service Pricing Table and the Statement of facts element — verified
    // live: templateElementList[2] here, right after
    // templateElementList[1]'s Service Pricing Table and right before
    // templateElementList[3]'s Statement of facts. Only picking the FIRST
    // Text Block (the intro letter above) silently dropped this one.
    // Statement of facts itself still isn't rendered here (it needs the
    // admin's own StatementOfFact prop shape, not reachable from this
    // quote's live selections) — just this intro paragraph, which is
    // static per-template text with no per-quote variables.
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

    // "Payment Terms" — the real template's LAST Text Block, sitting right
    // after the "Service Descriptions" element (verified live: it's the
    // Text Block whose own first line is literally "Payment Terms", bold —
    // static per-template text, no per-quote variables). Found by
    // searching forward from Service Descriptions for the next Text Block,
    // same technique as the Statement of facts intro paragraph above but
    // in the opposite direction.
    const serviceDescriptionsIndex = Array.isArray(templateElementList)
      ? templateElementList.findIndex(
          (element) => element.templateElementTypeName === "Service Descriptions",
        )
      : -1;
    // The Heading element immediately preceding "Service Descriptions"
    // carries this section's actual title text (element.headings, e.g.
    // "Service Description") — mirrors PreviewComponentpdf.jsx's own
    // HEADING case. Admin renders it as its own colored label above the
    // Ongoing/Recurring Services breakdown; missing that label made this
    // whole section look like it wasn't there at all, even though the
    // Ongoing/Recurring Services content itself was present underneath it.
    if (
      serviceDescriptionsIndex > 0 &&
      templateElementList[serviceDescriptionsIndex - 1]?.templateElementTypeName ===
        "Heading" &&
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

  // Header/footer template (headerContent/footerContent/headerImage/
  // footerImage/headerHeight/footerHeight/watermarkImage/showSeparatorLines)
  // — confirmed live to be reachable unauthenticated (unlike organisation
  // contact details below), so fetched and sent the same way admin does,
  // even though it comes back null when the organisation hasn't configured
  // one (both are real possibilities, not treated as errors).
  const headerFooter = fetchTemplateHeaderFooter({
    list: templateLookupList,
    templateID: quoteModel?.templateID,
  });

  // Organisation contact details (email/phone/address/website) — the
  // Organisation/GetOrganisationInformationModel auth requirement was
  // removed, so this is now fetched the same way as the two template
  // lookups above.
  let organisationContactDetails = null;
  try {
    organisationContactDetails = await fetchOrganisationContactDetails(
      quoteModel?.organisationKeyID,
    );
  } catch (err) {
    organisationContactDetails = null;
  }

  // Everything colored below is built only now, after resolvedAccentColor
  // has had its chance to be overridden by the template's real brandColor
  // above — building these earlier (against the accentColor prop/#00BFFF
  // fallback only) was the actual cause of the visible color mismatch
  // against admin's PDF, since admin colors every one of these from that
  // same template field.
  const findFinalAmountRow = (serviceChargeTypeID) =>
    (quotationFinalAmountList || []).find(
      (row) => Number(row.serviceChargeTypeID) === serviceChargeTypeID,
    ) || null;

  // Package/Custom Package quotes store ONE quotationFinalAmountList row
  // per selected package per charge type (each tagged with its own
  // servicePackageID), not the single servicePackageID:null row a Service
  // quote has — mirrors ProposalPricingTableStep.jsx's own findFinalAmount.
  // findFinalAmountRow above only matches on serviceChargeTypeID, so for a
  // package-based quote it always resolved to whichever package's row
  // happened to come first — that single row's totals were then shown
  // identically in every package column. This looks up each package's own
  // row instead.
  const findFinalAmountRowForPackage = (serviceChargeTypeID, packageID) =>
    (quotationFinalAmountList || []).find(
      (row) =>
        Number(row.serviceChargeTypeID) === serviceChargeTypeID &&
        row.servicePackageID != null &&
        String(row.servicePackageID) === String(packageID),
    ) || null;

  // Package/Custom Package quotes price against package columns, not a
  // single flat fee per service — mirrors ProposalPricingTableStep.jsx's
  // own isStandardPackage/isPackageBased (quoteModel.quoteTypeID switch),
  // which decides whether priceForSelectedPackage trusts
  // serviceMappingWithPackagesList's cross-join (Standard Package) or the
  // pricing item's own flat packageOne/Two/ThreeValue (Custom Package).
  const isStandardPackage = quoteModel?.quoteTypeID === QUOTE_TYPE_ID.Package;
  const isPackageBased =
    isStandardPackage || quoteModel?.quoteTypeID === QUOTE_TYPE_ID.CustomPackage;
  const packageColumns = isPackageBased ? servicePackageList || [] : [];

  const buildFeesHtmlForChargeType = (title, serviceChargeTypeID, selections) => {
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

      // netTotal is summed from the LIVE, currently-selected services'
      // per-package prices (categories' own packagePrices, already resolved
      // via priceForSelectedPackage above) rather than trusted from the
      // stored quotationFinalAmountList row — that row is a snapshot from
      // whenever admin last saved the quote, so for Custom Package (whose
      // Services step lets the client add services beyond the package's
      // locked defaults) it silently excluded anything the client just
      // added, undercounting both Net Total and Grand Total. Mirrors
      // ProposalPricingTableStep.jsx's own buildPackageTotalsList +
      // buildChargeTypeTotals package branch: Package/Custom Package always
      // applies the package's own already-agreed discount percentage
      // (discountPercentageWithAllDecimal, still read from the stored row —
      // that agreed rate itself hasn't changed) to the live total, with no
      // "unchanged" shortcut and no amendment-specific branching (that
      // branch only exists for Service-type quotes).
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
        // Rounded to the nearest cent (toFixed(2)) to match
        // AddUpdateProposal.jsx's GetNetTotalValueByRecurringPackage —
        // mirrors the same fix applied to ProposalPricingTableStep.jsx's
        // buildChargeTypeTotals; this was the same discountAmount formula,
        // just never rounded at all here, so it could drift from the live
        // Pricing Table/admin figure by more than the Math.floor case did.
        const discounted = Number(
          ((liveNetTotal * discountPercentage) / 100).toFixed(2),
        );
        const discountedTotal = liveNetTotal - discounted;
        // Truncated to 2 decimals (not rounded) to match AuthContext.jsx's
        // GetTwoDecimalValueWithoutRoundOff, which
        // GetNetTotalValueByRecurringPackage uses for every VAT amount.
        const vat =
          vatPercentage == null
            ? null
            : Math.floor((discountedTotal * Number(vatPercentage)) / 100 * 100) / 100;
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
    });
  };

  // Admin's Recurring Fees title carries the payment frequency, e.g.
  // "Recurring Fees (Monthly)" — getPaymentFrequencyLabel() in
  // AddUpdateProposal.jsx, PAYMENT_FREQUENCY_LABEL in
  // ProposalPricingTableStep.jsx.
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
  );
  const serviceDescriptionHtml = buildServiceDescriptionHtml({
    recurringSelections,
    oneOffSelections,
    pricing,
    accentColor: resolvedAccentColor,
    heading: serviceDescriptionHeading,
  });

  // Second page: intro letter + both fees tables + the Statement of Facts
  // intro paragraph + its driver-value breakdown, all together, same as the
  // real template (no page break between any of these elements there) —
  // not separate pages.
  const statementOfFactsDriverBreakdownHtml = buildStatementOfFactsDriverBreakdownHtml({
    recurringSelections,
    oneOffSelections,
    pricing,
    additionalInformationList,
    accentColor: resolvedAccentColor,
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
  // PreviewComponentpdf.jsx's own element-grouping loop only starts a NEW
  // call when the previous element was a PAGE_BREAK/AWS_PDF_LINK, and
  // First_Page isn't either, so the intro letter/pricing table that follow
  // it get appended onto the SAME call as the cover (as multiple {textbox}
  // entries in one array, not one concatenated string — mirrored here).
  // Sending the cover as its own short, isolated call was the actual
  // architecture mismatch causing the extra blank page: fixed by merging it
  // into the same page entry as the services content, exactly like admin's
  // real grouping. After the services fees tables: Service Description,
  // then Additional Information, then Payment Terms — same relative order
  // as the real template's own Service Descriptions -> Payment Terms Text
  // Block, with Additional Information (a web-based-proposal-only section,
  // not part of the fetched template) folded in between.
  const coverAndServicesPage = [coverPageHtml, servicesPageHtml]
    .filter(Boolean)
    .map((html) => ({ textbox: html }));

  const pages = [
    coverAndServicesPage,
    ...[serviceDescriptionHtml, additionalInformationHtml, paymentTermsHtml]
      .filter(Boolean)
      .map((html) => [{ textbox: html }]),
  ].filter((page) => page.length > 0);
  if (pages.length === 0) return null;

  const headingforpage = quoteModel?.quotationName || "";
  const lengthPdf = pages.length;

  // BrandLogo/HeaderContent/FooterContent/HeaderImage/FooterImage/
  // HeaderHeight/FooterHeight/WatermarkImage/showSeparatorLines/
  // headerFooterFirstPage are sent identically on every call, same as
  // admin's own postData — it never varies these per page/sequence.
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
