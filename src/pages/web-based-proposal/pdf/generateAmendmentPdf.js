import { generatePdfUrl, mergePdfApiUrl } from "../../../Base-Url/Base_Url";
import {
  GetTemplateModelDataWithoutToken,
  GetTemplateHeaderFooterLookupWithoutToken,
  GetOrganisationInformationModelWithoutToken,
} from "../../../redux/Services/Proposal/ProposalApi";
import { ElementType } from "../../../Middleware/enums";

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
    <div style="padding-left:40px;padding-right:40px;font-family:'Times New Roman', Times, serif">
      <p style="font-family:arial, sans-serif;color:${accentColor};font-size:20px;margin-top:15px">${escapeHtml(title)}</p>
      <table style="font-family:arial, sans-serif;border-collapse:collapse;width:100%;margin-top:-15px">
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
// NOTE: admin's own firstPageHTML (AddUpdateProposal.jsx:21559) has
// `page-break-after: always` on this paragraph, but that only makes sense
// there because the First Page element is inserted into a shared element
// list that later gets grouped into MULTIPLE textbox blocks combined onto
// one generatePdfUrl call — the break is what separates the cover content
// from whatever follows it *within that same call*. Here, every logical
// page (cover, services, ...) is already its own independent
// generatePdfUrl call/page, so this cover page's HTML is the entire, only
// content of its call — an inline forced page-break-after on the LAST
// element of that content made the renderer emit an extra, genuinely
// blank page right after it. Removed; no equivalent is needed here.
const buildCoverPageHtml = ({ organisationLogoUrl, clientNameOnFirstPage, fontFamily }) => `
  <div style="margin-top:300px">
    <div style="display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;margin-top:${organisationLogoUrl ? "-100px" : "0px"}">
      ${
        organisationLogoUrl
          ? `<div style="width:700px;height:150px;background-image:url('${organisationLogoUrl}');background-size:contain;background-repeat:no-repeat;background-position:center"></div>`
          : ""
      }
      <p style="text-align:center;color:#00BFFF">
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
// services (recurringSelections/oneOffSelections + their catalog entries in
// recurringServices/oneOffServices) rather than any admin-authored snapshot
// (quoteModel.serviceDescription is a pre-rendered HTML blob frozen at the
// time admin last saved the quote — it would silently omit any service the
// client adds during this amendment). Rebuilding from live selections means
// a client-added service's category/name always appears here; its
// description paragraph is only as good as the catalog's own
// serviceDescription field for that service (falls back to no paragraph,
// same as admin's own null/undefined/"" handling, when the catalog has
// none).
const buildServiceDescriptionSection = (selections, serviceDefMap, categoryHeading, accentColor, fontFamily) => {
  const categoriesByID = new Map();
  Object.values(selections || {}).forEach((selection) => {
    const key = selection.serviceCatID ?? "uncategorised";
    if (!categoriesByID.has(key)) {
      categoriesByID.set(key, {
        categoryName: selection.categoryName || "Services",
        services: [],
      });
    }
    const serviceDef = serviceDefMap.get(selection.serviceID);
    categoriesByID.get(key).services.push({
      name: selection.serviceName,
      description: serviceDef?.serviceDescription,
    });
  });
  const categories = Array.from(categoriesByID.values());
  if (categories.length === 0) return "";

  return `
    ${
      categories.length !== 0
        ? `<p style="font-family:${fontFamily};font-size:18px;color:${accentColor};font-weight:bold">${escapeHtml(categoryHeading)}</p>`
        : ""
    }
    ${categories
      .map(
        (category) => `
          <div>
            <p style="color:black;font-weight:bold;font-family:${fontFamily};font-size:18px">${escapeHtml(category.categoryName)}</p>
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

const buildServiceDescriptionHtml = ({
  recurringSelections,
  oneOffSelections,
  recurringServices,
  oneOffServices,
  accentColor,
  fontFamily = "arial, sans-serif",
}) => {
  const recurringDefMap = buildServiceDefMap(recurringServices);
  const oneOffDefMap = buildServiceDefMap(oneOffServices);

  const recurringSection = buildServiceDescriptionSection(
    recurringSelections,
    recurringDefMap,
    "Ongoing/Recurring Services",
    accentColor,
    fontFamily,
  );
  const oneOffSection = buildServiceDescriptionSection(
    oneOffSelections,
    oneOffDefMap,
    "One-Off/Ad hoc Services",
    accentColor,
    fontFamily,
  );

  if (!recurringSection && !oneOffSection) return "";

  return `<div style="padding-left:40px;padding-right:40px">${recurringSection}${oneOffSection}</div>`;
};

// Same shape ProposalPricingTableStep.jsx's own buildServiceDefMap builds
// (serviceID -> catalog entry, across every category) — duplicated here
// rather than imported since that one is a local, unexported helper there.
const buildServiceDefMap = (categories) => {
  const map = new Map();
  (categories || []).forEach((category) => {
    (category.servicesList || []).forEach((service) =>
      map.set(service.serviceID, service),
    );
  });
  return map;
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
    return slab
      ? slab.slabTypeName || `${slab.slabFrom} - ${slab.slabTo}`
      : "";
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
      <p style="color:${accentColor};font-weight:bold;font-size:18px">Additional Information</p>
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
// removed). fontSizeContent/fontFamily/landscapeMode/headerFooterFirstPage/
// flagForTemplatePdf/awsPdfHeight/awsPdfWidth still have no equivalent
// wired up here.
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
      headerFooterFirstPage: false,
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
  recurringServices,
  oneOffServices,
  additionalInformationList,
  pricing,
  currencyID,
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

  const resolvedAccentColor = accentColor || "#00BFFF";
  const currencySymbol = CURRENCY_SYMBOLS[currencyID] || "£";
  const findFinalAmountRow = (serviceChargeTypeID) =>
    (quotationFinalAmountList || []).find(
      (row) => Number(row.serviceChargeTypeID) === serviceChargeTypeID,
    ) || null;

  const buildFeesHtmlForChargeType = (title, serviceChargeTypeID, selections) => {
    const categories = groupSelectionsByCategory(
      selections,
      serviceChargeTypeID,
      pricing,
    );
    if (categories.length === 0) return "";

    const row = findFinalAmountRow(serviceChargeTypeID);
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
    recurringServices,
    oneOffServices,
    accentColor: resolvedAccentColor,
  });

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
  let organisationLogoUrl = null;
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
    introLetterHtml = introTextBlock?.htmlContent
      ? `<div style="padding-left:40px;padding-right:40px">${introTextBlock.htmlContent}</div>`
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
          statementOfFactsIntroHtml = `<div style="padding-left:40px;padding-right:40px">${element.htmlContent}</div>`;
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
          paymentTermsHtml = `<div style="padding-left:40px;padding-right:40px">${element.htmlContent}</div>`;
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

  // Second page: intro letter + both fees tables + the Statement of Facts
  // intro paragraph together, same as the real template (no page break
  // between any of these elements there) — not separate pages.
  const servicesPageHtml = [
    introLetterHtml,
    recurringHtml,
    oneOffHtml,
    statementOfFactsIntroHtml,
  ]
    .filter(Boolean)
    .join("");

  // After the services fees tables: Service Description, then Additional
  // Information, then Payment Terms — same relative order as the real
  // template's own Service Descriptions -> Payment Terms Text Block, with
  // Additional Information (a web-based-proposal-only section, not part of
  // the fetched template) folded in between.
  const pages = [
    coverPageHtml,
    servicesPageHtml,
    serviceDescriptionHtml,
    additionalInformationHtml,
    paymentTermsHtml,
  ]
    .filter(Boolean)
    .map((html) => [{ textbox: html }]);
  if (pages.length === 0) return null;

  const headingforpage = quoteModel?.quotationName || "";
  const lengthPdf = pages.length;

  // BrandLogo/HeaderContent/FooterContent/HeaderImage/FooterImage/
  // HeaderHeight/FooterHeight/WatermarkImage/showSeparatorLines are sent on
  // every page (not just the cover), same as admin's own postData always
  // includes them — the PDF-render service uses these (with color) to
  // apply consistent per-page branding. The email/phone contact line still
  // has no reachable source (Organisation/GetOrganisationInformationModel
  // returns a genuine 401 without a token, confirmed live), so that stays
  // null.
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
        email: organisationContactDetails?.email,
        mobile: organisationContactDetails?.mobile,
        fullAddress: organisationContactDetails?.fullAddress,
        webSite: organisationContactDetails?.webSite,
      }),
    ),
  );

  return mergeAmendmentPdfs({ userId, moduleName: "Quote" });
};
