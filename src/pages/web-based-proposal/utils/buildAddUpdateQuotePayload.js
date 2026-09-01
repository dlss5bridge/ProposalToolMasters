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

// Turns one committed selection (+ its service catalog definition) into the
// moduleServicesGPDList row shape AddUpdateProposal.jsx's modifiedDraftArray
// builds (AddUpdateProposal.jsx:22648-22698) — only driverVisibility: true
// drivers get a row, and driverValue is the actual numeric value (a
// variation/slab option's variationValue/slabValue, not its ID; the ID
// itself is carried separately as variationID/slabID). msgMapID/msMapID are
// always null here, same as the admin flow's freshly-built rows — the
// backend assigns real ones on save.
const buildModuleServicesGPDList = (selection, serviceDef) => {
  const visibleDrivers = (serviceDef?.pricingDriverList || []).filter(
    (driver) => driver.driverVisibility,
  );

  const rows = visibleDrivers.map((driver) => {
    const entry = selection.driverValues?.[driver.globalPricingDriverID];
    let driverValue = null;
    let variationID = null;
    let slabID = null;

    if (driver.driverTypeID === 2) {
      driverValue =
        entry?.value !== undefined && entry?.value !== ""
          ? Number(entry.value)
          : null;
    } else if (driver.driverTypeID === 3) {
      variationID = entry?.value ?? null;
      driverValue =
        driver.variation?.find((option) => option.variationID === variationID)
          ?.variationValue ?? null;
    } else if (driver.driverTypeID === 4) {
      slabID = entry?.value ?? null;
      driverValue =
        driver.slab?.find((option) => option.slabID === slabID)?.slabValue ??
        null;
    }

    return {
      driverValue,
      msgMapID: null,
      msMapID: null,
      globalPricingDriverID: driver.globalPricingDriverID,
      variationID,
      slabID,
      textID: null,
      dateID: null,
      enteredText: null,
      enteredDate: null,
      enteredDateFormat: null,
    };
  });

  return rows.length === 0 ? null : rows;
};

// Builds a Map<serviceID, serviceDefinition> from the recurring/one-off
// service catalog lookups (GetServicesWithGlobalPricingDriverListByService
// ChargeType responses) — each category's servicesList entry carries the
// pricingDriverList buildModuleServicesGPDList needs.
const buildServiceDefMap = (categories) => {
  const map = new Map();
  (categories || []).forEach((category) => {
    (category.servicesList || []).forEach((service) =>
      map.set(service.serviceID, service),
    );
  });
  return map;
};

// Reconstructs selectedServicesList from the client's live, possibly-edited
// service selections (recurringSelections/oneOffSelections) instead of the
// stale copy on quoteModel (fetched once at page load, before any Services-
// step edits) — mirrors AddUpdateProposal.jsx's modifiedDraftArray
// (AddUpdateProposal.jsx:22645-22719) field-for-field. Only meaningful for
// Service-based/Custom Package Amendment, where the client can actually add
// or remove services; Package Amendment has no Services step and keeps the
// quoteModel passthrough instead (see buildAddUpdateQuotePayload).
export const buildSelectedServicesListFromSelections = ({
  recurringSelections,
  oneOffSelections,
  recurringServices,
  oneOffServices,
  pricing,
  isCustomPackageType,
}) => {
  const recurringDefs = buildServiceDefMap(recurringServices);
  const oneOffDefs = buildServiceDefMap(oneOffServices);

  const priceByServiceID = new Map();
  (pricing || []).forEach((item) => {
    priceByServiceID.set(
      `${item.serviceChargeTypeID}:${item.serviceID}`,
      Number(item.price) || 0,
    );
  });

  const buildEntry = (selection, serviceChargeTypeID, serviceDef) => ({
    driverValue: null,
    msMapID: null,
    serviceID: selection.serviceID,
    proposedServiceName: selection.serviceName,
    serviceCatID: selection.serviceCatID,
    serviceChargeTypeID,
    servicePackageID: null,
    // Custom Package prices services against the package rather than each
    // service's own formula — AddUpdateProposal.jsx sends null for that
    // case (selectedProposalTypeValue === 4) and the actual live price
    // otherwise.
    finalCalculatedServicePrice: isCustomPackageType
      ? null
      : (priceByServiceID.get(`${serviceChargeTypeID}:${selection.serviceID}`) ??
        null),
    moduleServicesGPDList: buildModuleServicesGPDList(selection, serviceDef),
  });

  const recurringList = Object.values(recurringSelections || {}).map(
    (selection) => buildEntry(selection, 1, recurringDefs.get(selection.serviceID)),
  );
  const oneOffList = Object.values(oneOffSelections || {}).map((selection) =>
    buildEntry(selection, 2, oneOffDefs.get(selection.serviceID)),
  );

  return [...recurringList, ...oneOffList];
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
// selectedServicesList override is used by Service-based/Custom Package
// Amendment (see buildSelectedServicesListFromSelections) — every other
// caller omits it and keeps the quoteModel passthrough below.
export const buildAddUpdateQuotePayload = (
  quoteModel,
  inputFieldsList,
  selectedServicesListOverride,
) => {
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

  if (selectedServicesListOverride) {
    payload.selectedServicesList = selectedServicesListOverride;
  }

  return payload;
};
