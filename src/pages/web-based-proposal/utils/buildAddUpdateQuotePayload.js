import { getVisibleInputFieldsItems } from "../../../redux/reducer/webProposal/inputFields";

// driverTypeID: 2 = quantity (driverValue), 3 = variation (lookup select),
// 4 = slab (lookup select), 5 = free text (enteredText), 6 = date
// (enteredDate) — same convention as ProposalInputFieldsStep.jsx. For the
// two lookup-list types, driverValue only holds the selected option's ID
// (variationID/slabID) — AddUpdateQuote wants the option's display label
// instead, so resolve it the same way ProposalInputFieldsStep.jsx renders
// it (option.variationName, or option.slabTypeName falling back to its
// from/to range).
const getEnteredInputFieldValue = (item) => {
  if (item.driverTypeID === 5) return item.enteredText;
  if (item.driverTypeID === 6) return item.enteredDate;

  if (item.driverTypeID === 3) {
    const selected = (item.variation || []).find(
      (option) => option.variationID === item.driverValue,
    );
    return selected ? selected.variationName : item.driverValue;
  }

  if (item.driverTypeID === 4) {
    const selected = (item.slab || []).find(
      (option) => option.slabID === item.driverValue,
    );
    return selected
      ? selected.slabTypeName || `${selected.slabFrom} - ${selected.slabTo}`
      : item.driverValue;
  }

  return item.driverValue;
};

// Patches quoteModel.globalPricingDriverIDsWithValues with only the values
// the client actually entered on the Input Fields step, matched by
// globalPricingDriverID — every other entry (including any with
// values: null the client never touched) is left exactly as GetQuoteModel
// returned it.
export const buildGlobalPricingDriverIDsWithValues = (
  quoteModel,
  inputFieldsList,
) => {
  const existing = Array.isArray(quoteModel?.globalPricingDriverIDsWithValues)
    ? quoteModel.globalPricingDriverIDsWithValues
    : [];

  const visibleItems = getVisibleInputFieldsItems(
    inputFieldsList,
    quoteModel?.globalPricingDriverID,
  );

  const enteredValueByID = new Map();
  visibleItems.forEach((item) => {
    const value = getEnteredInputFieldValue(item);
    if (value === null || value === undefined || value === "") return;
    enteredValueByID.set(item.globalPricingDriverID, String(value));
  });

  if (enteredValueByID.size === 0) return existing;

  return existing.map((entry) =>
    enteredValueByID.has(entry.globalPricingDriverID)
      ? { ...entry, values: enteredValueByID.get(entry.globalPricingDriverID) }
      : entry,
  );
};

// AddUpdateQuote only accepts this exact field set — mirrors
// ApiRequest_ParamsObj in AddUpdateProposal.jsx:23077-23170. GetQuoteModel's
// response carries several extra bookkeeping/audit fields (templateKeyID,
// the *_WithAllDecimal variants, serviceDescription, statementOfFacts,
// createdBy/createdOn, keyID, etc.) that AddUpdateQuote doesn't take and
// that the admin flow never sends — those are dropped here rather than
// forwarded. Every value below is still read straight from GetQuoteModel
// (no reconstruction from other local/derived state), so this is a field
// projection, not a rebuild.
const ADD_UPDATE_QUOTE_FIELD_MAP = [
  "organisationKeyID",
  "userKeyID",
  "showDiscountLine",
  "quoteKeyID",
  "clientID",
  "templateID",
  "quoteTypeID",
  "templatePDFKeyIDs",
  "paymentGatewayID",
  "feesInQuoteID",
  "paymentFrequencyID",
  "recurringOriginalPrice",
  "recurringDiscountedPrice",
  "recurringDiscountPercentage",
  "oneOffOriginalPrice",
  "oneOffDiscountedPrice",
  "oneOffDiscountPercentage",
  "statusID",
  "pricingTableColumnIDs",
  "TabName",
  "quotePDFUrl",
  "documentCode",
  "quoteFormatID",
  "webProposalTypeID",
  "recurringDiscountPercentageForAmendment",
  "oneOffDiscountPercentageForAmendment",
  "recurringHtmlContent",
  "oneOffHtmlContent",
  "customizedEmailContent",
  "pricingVariablesList",
  "servicePackageID",
  "selectedServicesList",
  "additionalInformationList",
  "quotationFinalAmountList",
  "quoteAdditionalServicesInPackages",
];

// Base AddUpdateQuote request payload for every web-based-proposal type:
// only the fields AddUpdateQuote accepts, sourced from the complete
// GetQuoteModel response, with globalPricingDriverIDsWithValues patched
// from what the client actually entered on the Input Fields step.
// Package/Custom Package selection data, services, additional information,
// and everything else is left exactly as GetQuoteModel returned it.
export const buildAddUpdateQuotePayload = (quoteModel, inputFieldsList) => {
  if (!quoteModel) return null;

  const payload = {};
  ADD_UPDATE_QUOTE_FIELD_MAP.forEach((field) => {
    payload[field] = quoteModel[field] ?? null;
  });

  // AddUpdateQuote's backend model marks these non-nullable — the admin
  // flow always sends a real TabName (its current tab label), a
  // (possibly empty) pricingVariablesList array, and templatePDFKeyIDs as
  // an array, never null. GetQuoteModel can return any of these as null
  // when unset, so fall back to a safe non-null default instead of
  // forwarding null and tripping that validation.
  payload.TabName = quoteModel.TabName || "";
  payload.pricingVariablesList = Array.isArray(quoteModel.pricingVariablesList)
    ? quoteModel.pricingVariablesList
    : [];
  payload.templatePDFKeyIDs = Array.isArray(quoteModel.templatePDFKeyIDs)
    ? quoteModel.templatePDFKeyIDs
    : [];
  // servicePackageID is a real array ([1933], etc.) for Package/Custom
  // Package quotes — only a Service-based quote (no packages at all) has
  // it null on GetQuoteModel, and the admin flow always sends [] for that
  // case rather than null.
  payload.servicePackageID = Array.isArray(quoteModel.servicePackageID)
    ? quoteModel.servicePackageID
    : [];

  // GetQuoteModel returns this as serviceMappingWithPackagesList (lowercase
  // s) but AddUpdateQuote expects ServiceMappingWithPackagesList — also
  // non-nullable, so default to [] like the other array fields above.
  payload.ServiceMappingWithPackagesList = Array.isArray(
    quoteModel.serviceMappingWithPackagesList,
  )
    ? quoteModel.serviceMappingWithPackagesList
    : [];

  payload.globalPricingDriverIDsWithValues =
    buildGlobalPricingDriverIDsWithValues(quoteModel, inputFieldsList);

  return payload;
};
