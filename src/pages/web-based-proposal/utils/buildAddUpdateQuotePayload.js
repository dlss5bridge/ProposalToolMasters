import { getVisibleInputFieldsItems } from "../../../redux/reducer/webProposal/inputFields";
import { getVisibleAdditionalInformationItems } from "../../../redux/reducer/webProposal/additionalInformation";
import { QUOTE_TYPE_ID } from "../../../Middleware/enums";

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
    // AddUpdateProposal.jsx:22709-22713 only sends null here for its
    // "Master Agreement - Custom Variable Fee" quote type
    // (selectedProposalTypeValue === 4) — a type with no QUOTE_TYPE_ID
    // equivalent that the web proposal flow never reaches. Custom Package
    // is selectedProposalTypeValue === 1, which admin's own condition
    // excludes, so it gets the real live price via
    // service.originalServicePrice, same as every other type this function
    // is called for (Service). Previously this was wrongly nulled for
    // Custom Package by conflating it with admin's value-4 case.
    finalCalculatedServicePrice:
      priceByServiceID.get(`${serviceChargeTypeID}:${selection.serviceID}`) ??
      null,
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

// quotationFinalAmountList holds the recurring/one-off Net Total/Discount/
// VAT/Grand Total the quote was last priced at. For a Service-type quote
// (QUOTE_TYPE_ID.Service — no packages involved) that's stale the moment the
// client adds or removes a service on the Amendment's Services step: the
// stored netTotal no longer reflects what's actually selected. Rebuilds each
// charge type's row from the live selections' summed prices (same
// priceByServiceID source buildSelectedServicesListFromSelections uses for
// finalCalculatedServicePrice), reapplying the quote's already-agreed
// discountPercentageWithAllDecimal/vatPercentage on top — mirrors
// AddUpdateProposal.jsx's non-package quotationFinalAmountList branch
// (AddUpdateProposal.jsx:22926-22990: netTotal from the live total,
// discounted/discountedTotal/vat/grandTotal derived from it) rather than
// AddUpdateProposal.jsx's package branch, which this quote type never uses.
// Package/Custom Package quotes have no client-editable Services step here
// (Package Amendment skips it entirely; Custom Package prices against the
// package, not summed service prices) and keep the quoteModel passthrough
// untouched — see buildQuotationFinalAmountList's dispatch below.
export const buildQuotationFinalAmountListForServiceType = ({
  quoteModel,
  recurringSelections,
  oneOffSelections,
  pricing,
  // Same fallback ProposalPricingTableStep.jsx's recurringVatPercentage/
  // oneOffVatPercentage already use (selectServicesVatPercentage — the
  // live rate from GetCalculatedServicesPriceByPackages, shared across
  // charge types) — needed when a charge type has no existingRow of its
  // own yet, e.g. the admin's original quote only had One-Off services and
  // the client just added a Recurring one on the Amendment's Services step.
  // Without it, that charge type's vatPercentage/vat/grandTotal would come
  // out null even though a real, already-known VAT rate applies.
  vatPercentage: fallbackVatPercentage,
}) => {
  const priceByServiceID = new Map();
  (pricing || []).forEach((item) => {
    priceByServiceID.set(
      `${item.serviceChargeTypeID}:${item.serviceID}`,
      Number(item.price) || 0,
    );
  });

  const existingRows = Array.isArray(quoteModel?.quotationFinalAmountList)
    ? quoteModel.quotationFinalAmountList
    : [];
  const findExistingRow = (serviceChargeTypeID) =>
    existingRows.find(
      (row) => Number(row.serviceChargeTypeID) === serviceChargeTypeID,
    ) || null;

  const buildRow = (selections, serviceChargeTypeID) => {
    const selectedIDs = Object.keys(selections || {});
    if (selectedIDs.length === 0) return null;

    const netTotal = selectedIDs.reduce(
      (sum, serviceID) =>
        sum +
        (priceByServiceID.get(`${serviceChargeTypeID}:${serviceID}`) || 0),
      0,
    );

    const existingRow = findExistingRow(serviceChargeTypeID);
    const discountPercentage =
      Number(existingRow?.discountPercentageWithAllDecimal) || 0;
    const vatPercentage =
      existingRow?.vatPercentage ?? fallbackVatPercentage ?? null;

    const discounted = (netTotal * discountPercentage) / 100;
    const discountedTotal = netTotal - discounted;
    // Truncated to 2 decimals (not rounded) to match AuthContext.jsx's
    // GetTwoDecimalValueWithoutRoundOff, which AddUpdateProposal.jsx's own
    // totals functions use for every VAT amount.
    const vat =
      vatPercentage == null
        ? null
        : Math.floor((discountedTotal * Number(vatPercentage)) / 100 * 100) / 100;
    const grandTotal = vat == null ? null : discountedTotal + vat;

    return {
      moduleKeyID: quoteModel?.quoteKeyID ?? null,
      serviceChargeTypeID,
      servicePackageID: null,
      discountPercentageWithAllDecimal:
        existingRow?.discountPercentageWithAllDecimal ?? null,
      netTotal,
      discounted,
      discountedTotal,
      vatPercentage,
      vat,
      grandTotal,
      netVAT: null,
      vatDiscount: null,
      netFeesIncVAT: null,
      discountedFeesIncVAT: null,
    };
  };

  const rows = [
    buildRow(recurringSelections, 1),
    buildRow(oneOffSelections, 2),
  ].filter(Boolean);

  return rows;
};

// Dispatches quotationFinalAmountList building by proposal type — the only
// type whose totals can go stale from a client Services-step edit is
// Service (see buildQuotationFinalAmountListForServiceType above); every
// other type (Package, Custom Package) keeps the quoteModel passthrough,
// since neither lets the client change which services are priced into it
// here. isAmend gates the Service rebuild too: an unamended Service
// Amendment (client changed nothing from the admin defaults) has nothing to
// rebuild either, so it keeps the same quoteModel passthrough as Package/
// Custom Package. Defaults to true so callers that never pass it (the
// non-Amendment Accept/Save flows in ProposalInputForm.jsx) keep their
// existing always-rebuild behavior unchanged.
export const buildQuotationFinalAmountList = ({
  quoteModel,
  recurringSelections,
  oneOffSelections,
  pricing,
  vatPercentage,
  isAmend = true,
}) => {
  if (isAmend && quoteModel?.quoteTypeID === QUOTE_TYPE_ID.Service) {
    return buildQuotationFinalAmountListForServiceType({
      quoteModel,
      recurringSelections,
      oneOffSelections,
      pricing,
      vatPercentage,
    });
  }

  return quoteModel?.quotationFinalAmountList ?? null;
};

// ---------------------------------------------------------------------------
// pricingVariablesList (Service-type only) — ports AuthContext.jsx's
// replaceTemplatePricingVariables Service branch (selectedProposalTypeValue
// === 3, AuthContext.jsx:3009-3249) and the template-string helpers it calls
// (formatValue, getTaxName, getPaymentFrequencyLabel,
// SingleServiceWithCombinedTableView, ReplaceVariable_WithTableView,
// GetReplaceServiceWithTableView[WithPrice], GetReplaceServiceWithCommaView
// [WithPrice], GetReplaceServiceWithBulletListView[WithPrice],
// GetReplaceValueByWithComma, GetReplaceValueByWithBulletList) verbatim,
// including their existing quirks (e.g. GetReplaceServiceWithTableView's
// duplicated "Recurring Services" heading when a one-off list is also
// present) — this is a byte-for-byte port, not a rewrite, so the web
// proposal's generated HTML/text matches the admin flow exactly. Only each
// function's non-package branch is ported: AuthContext.jsx always calls
// these with servicePackageList: null for a Service-type quote, so the
// package branch is unreachable here and left out. AuthContext.jsx itself
// isn't reusable directly — it's a React context provider only ever mounted
// in the authenticated app, never in the unauthenticated web-proposal route
// tree (see additionalInformationThunk.js's comment on why).

// AuthContext.jsx:1196 formatValue, called everywhere in the Service branch
// with no `id` (currency-symbol) argument — so only the no-symbol path is
// needed here.
const formatValue = (value) => {
  const numericValue = value == null ? 0 : value;
  const valueArray = numericValue.toString().split(".");
  const decimalPart =
    valueArray.length > 1 && typeof valueArray[1] === "string"
      ? valueArray[1]
      : "";

  let valueWithExactTwoPrecision = numericValue.toString();
  if (decimalPart.length > 2) {
    valueWithExactTwoPrecision = (
      Math.floor(numericValue * 100) / 100
    ).toFixed(2);
  }

  return Number(valueWithExactTwoPrecision)
    .toFixed(2)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

// AuthContext.jsx:1251 getTaxName
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

// AuthContext.jsx:2095 getPaymentFrequencyLabel
const getPaymentFrequencyLabel = (paymentFrequencyID) => {
  switch (paymentFrequencyID) {
    case 1:
      return "Yearly";
    case 2:
      return "Half-Yearly";
    case 3:
      return "Quarterly";
    case 4:
      return "Monthly";
    default:
      return "Unknown";
  }
};

// AuthContext.jsx:1523 SingleServiceWithCombinedTableView
const singleServiceWithCombinedTableView = (type, recurringValue, oneOffValue) => `
      <p style="font-weight: 600; margin: 8px 0; font-size: 18px;">
        Recurring Service
      </p>
      <table style="border-collapse: collapse; width: 100%; page-break-inside: avoid; break-inside: avoid;">
        <tr>
          <td style="border: 1px solid black; padding: 8px; width: 50%;">${type}</td>
          <td style="border: 1px solid black; padding: 8px; width: 50%;text-align: right;">${
            recurringValue === null ? formatValue(0) : formatValue(recurringValue)
          }</td>
        </tr>
      </table>
      <p style="font-weight: 600; margin: 8px 0; font-size: 18px;">
        One-Off Service
      </p>
      <table style="border-collapse: collapse; width: 100%; page-break-inside: avoid; break-inside: avoid;">
        <tr>
          <td style="border: 1px solid black; padding: 8px; width: 50%;">${type}</td>
          <td style="border: 1px solid black; padding: 8px; width: 50%;text-align: right;">${
            oneOffValue === null ? formatValue(0) : formatValue(oneOffValue)
          }</td>
        </tr>
      </table>
    `;

// AuthContext.jsx:2117 ReplaceVariable_WithTableView, Service branch
// (selectedProposalTypeValue === 3) only.
const replaceVariableWithTableView = (serviceList, pricingInfo, currencyID) => {
  if (!serviceList || serviceList.length === 0) return "";

  const conditionalNetTotal =
    Number(pricingInfo.OriginalPrice) < Number(pricingInfo.DiscountedPrice)
      ? pricingInfo.DiscountedPrice
      : pricingInfo.OriginalPrice;
  const rows = [
    { label: "Net Total", value: conditionalNetTotal },
    { label: "Discount", value: pricingInfo.Discount },
    { label: "Discounted Price", value: pricingInfo.DiscountedTotal },
    { label: getTaxName(currencyID), value: pricingInfo.VATPrice },
    { label: "Grand Total", value: pricingInfo.GrandTotal },
  ];

  return `
            <table style="border-collapse: collapse; width: 100%; margin-bottom: 16px; page-break-inside: avoid; break-inside: avoid;">
              ${rows
                .map(
                  ({ label, value }) => `
                    <tr>
                      <td style="font-weight: 600; border: 1px solid rgb(10, 10, 10); padding: 8px; font-size: 16px; text-align: left; width: 60%;">
                        ${label}
                      </td>
                      <td style="font-weight: 600; border: 1px solid rgb(10, 10, 10); padding: 8px; font-size: 16px; text-align: right; width: 60%;">
                        ${formatValue(value)}
                      </td>
                    </tr>
                  `,
                )
                .join("")}
            </table>
          `;
};

// AuthContext.jsx:2274 GetReplaceServiceWithTableView, no-servicePackageList
// branch only.
const getReplaceServiceWithTableView = (recurringGroups, oneOffGroups) => {
  const generateTableRows = (serviceList) => {
    if (!serviceList || serviceList.length === 0) return "";
    return `
           <table style="border-collapse: collapse; width: 100%; margin-bottom: 16px;page-break-inside: avoid; break-inside: avoid;">
           <tr>
                      <td style="font-weight: 600; border: 1px solid rgb(10, 10, 10); padding: 8px; font-size: 16px; text-align: left; width: 60%;">
  Service Name
</td>
                    </tr>
           ${serviceList
             .map((item) =>
               item.servicesList
                 .map(
                   (subService) => `

                    <tr>
                      <td style="border: 1px solid rgb(10, 10, 10); padding: 8px; font-size: 16px; text-align: left; width: 60%;">
                        ${subService.serviceName}
                      </td>

                    </tr>

                  `,
                 )
                 .join(""),
             )
             .join("")}
            </table>
        `;
  };

  const recurringServices = generateTableRows(recurringGroups);
  const oneOffServices = generateTableRows(oneOffGroups);

  return `
    <div>
  ${
    recurringGroups?.length !== 0
      ? `<p style="font-weight: 600; margin: 8px 0; font-size: 18px;">
        Recurring Services
      </p>`
      : ""
  }


      ${recurringServices}

       ${
         oneOffGroups?.length !== 0
           ? ` <p style="font-weight: 600; margin: 8px 0; font-size: 18px;">
    <p style="font-weight: 600; margin: 8px 0; font-size: 18px;">
              Recurring Services
            </p>
      ${recurringServices}
    <p style="font-weight: 600; margin: 8px 0; font-size: 18px;">
              One-Off Services
            </p>`
           : ""
       }
      ${oneOffServices}
    </div>
  `;
};

// AuthContext.jsx:2413 GetReplaceServiceWithTableViewWithPrice,
// no-servicePackageList branch only.
const getReplaceServiceWithTableViewWithPrice = (recurringGroups, oneOffGroups) => {
  const generateTableRows = (serviceList) => {
    if (!serviceList || serviceList.length === 0) return "";
    return `
          <table style="border-collapse: collapse; width: 100%; margin-bottom: 16px;page-break-inside: avoid; break-inside: avoid;">
              <tr>
                      <td style="font-weight: 600; border: 1px solid rgb(10, 10, 10); padding: 8px; font-size: 16px; text-align: left; width: 60%;">
  Service Name
</td>
                      <td style="font-weight: 600; border: 1px solid rgb(10, 10, 10); padding: 8px; font-size: 16px; text-align: right; width: 60%;">
  Price
</td>


                    </tr>
          ${serviceList
            .map((item) =>
              item.servicesList
                .map(
                  (subService) => `

                    <tr>
                      <td style="border: 1px solid rgb(10, 10, 10); padding: 8px; font-size: 16px; text-align: left; width: 60%;">
                        ${subService.serviceName}
                      </td>
                      <td style="border: 1px solid rgb(10, 10, 10); padding: 8px; font-size: 16px; text-align: right; width: 30%;">
                          ${formatValue(subService.price)}
                        </td>
                    </tr>

                  `,
                )
                .join(""),
            )
            .join("")}
              </table>
        `;
  };

  const recurringServices = generateTableRows(recurringGroups);
  const oneOffServices = generateTableRows(oneOffGroups);

  return `
    <div>
     ${
       recurringGroups?.length !== 0
         ? `<p style="font-weight: 600; margin: 8px 0; font-size: 18px;">
        Recurring Services
      </p>`
         : ""
     }
      ${recurringServices}

       ${
         oneOffGroups?.length !== 0
           ? `    <p style="font-weight: 600; margin: 8px 0; font-size: 18px;">
              One-Off Services
            </p>`
           : ""
       }

      ${oneOffServices}
    </div>
  `;
};

// AuthContext.jsx:2567 GetReplaceServiceWithCommaView, no-servicePackageList
// branch only.
const getReplaceServiceWithCommaView = (recurringGroups, oneOffGroups) => {
  const generateTableRows = (serviceList) => {
    if (!serviceList || serviceList.length === 0) return "";
    return `
        <p style="margin: 8px 0; line-height: 1.5;">
          ${serviceList
            .map((item) =>
              item.servicesList
                .map((subService) => subService.serviceName)
                .join(", "),
            )
            .join(", ")}
        </p>
      `;
  };

  const recurringServices = generateTableRows(recurringGroups);
  const oneOffServices = generateTableRows(oneOffGroups);

  return `
    <div>
     ${
       recurringGroups?.length !== 0
         ? `<p style="font-weight: 600; margin: 8px 0; font-size: 18px;">
              Recurring Services
            </p>`
         : ""
     }

      ${recurringServices}
      ${
        oneOffGroups?.length !== 0
          ? ` <p style="font-weight: 600; margin: 8px 0; font-size: 18px;">
              One-Off Services
            </p>`
          : ""
      }

      ${oneOffServices}
    </div>
  `;
};

// AuthContext.jsx:2663 GetReplaceServiceWithCommaViewWithPrice,
// no-servicePackageList branch only.
const getReplaceServiceWithCommaViewWithPrice = (recurringGroups, oneOffGroups) => {
  const generateTableRows = (serviceList) => {
    if (!serviceList || serviceList.length === 0) return "";
    return `
        <p style="margin: 8px 0;line-height: 1.5;">
          ${serviceList
            .map((item) =>
              item.servicesList
                .map(
                  (subService) =>
                    `${subService.serviceName}: ${formatValue(subService.price)}`,
                )
                .join(", "),
            )
            .join(", ")}
        </p>
      `;
  };

  const recurringServices = generateTableRows(recurringGroups);
  const oneOffServices = generateTableRows(oneOffGroups);

  return `
      <div>
      ${
        recurringGroups?.length !== 0
          ? `<p style="font-weight: 600; margin: 8px 0; font-size: 18px;">
                Recurring Services
              </p>`
          : ""
      }

        ${recurringServices}

        ${
          oneOffGroups?.length !== 0
            ? `<p style="font-weight: 600; margin: 8px 0; font-size: 18px;">
                One-Off Services
              </p>`
            : ""
        }

        ${oneOffServices}
      </div>
    `;
};

// AuthContext.jsx:2775 GetReplaceServiceWithBulletListView,
// no-servicePackageList branch only.
const getReplaceServiceWithBulletListView = (recurringGroups, oneOffGroups) => {
  const generateTableRows = (serviceList) => {
    if (!serviceList || serviceList.length === 0) return "";
    return `
  <ul style="margin: 8px 0; font-size: 16px; line-height: 1.5;">
    ${serviceList
      .map((item) =>
        item.servicesList
          .map((subService) => `<li>${subService.serviceName}</li>`)
          .join(""),
      )
      .join("")}
  </ul>
`;
  };

  const recurringServices = generateTableRows(recurringGroups);
  const oneOffServices = generateTableRows(oneOffGroups);

  return `
    <div>
    ${
      recurringGroups?.length !== 0
        ? ` <p style="font-weight: 600; margin: 8px 0; font-size: 18px;">
              Recurring Services
            </p>`
        : ""
    }
      ${recurringServices}
      ${
        oneOffGroups?.length !== 0
          ? ` <p style="font-weight: 600; margin: 8px 0; font-size: 18px;">
              One-Off Services
            </p>`
          : ""
      }

      ${oneOffServices}
    </div>
  `;
};

// AuthContext.jsx:2874 GetReplaceServiceWithBulletListViewWithPrice,
// no-servicePackageList branch only.
const getReplaceServiceWithBulletListViewWithPrice = (
  recurringGroups,
  oneOffGroups,
) => {
  const generateTableRows = (serviceList) => {
    if (!serviceList || serviceList.length === 0) return "";
    return `
        <ul style="margin: 8px 0; font-size: 16px; line-height: 1.5;">
          ${serviceList
            .map((item) =>
              item.servicesList
                .map(
                  (subService) =>
                    `<li>${subService.serviceName}: ${formatValue(subService.price)}</li>`,
                )
                .join(""),
            )
            .join("")}
        </ul>
      `;
  };

  const recurringServices = generateTableRows(recurringGroups);
  const oneOffServices = generateTableRows(oneOffGroups);

  return `
      <div>
        ${
          recurringGroups?.length !== 0
            ? `  <p style="font-weight: 600; margin: 8px 0; font-size: 18px;">
                Recurring Services
              </p>`
            : ""
        }

        ${recurringServices}
         ${
           oneOffGroups?.length !== 0
             ? `  <p style="font-weight: 600; margin: 8px 0; font-size: 18px;">
                One-Off Services
              </p>`
             : ""
         }

        ${oneOffServices}
      </div>
    `;
};

// AuthContext.jsx:1824/1957 GetReplaceValueByWithComma/
// GetReplaceValueByWithBulletList, Service branch (selectedProposalTypeValue
// === 3) only.
const getReplaceValueByWithComma = (recurringValue, oneOffValue) =>
  `Recurring Services: ${formatValue(recurringValue)}, One-Off Services: ${formatValue(oneOffValue)}`;

const getReplaceValueByWithBulletList = (recurringValue, oneOffValue) => `
        <ul>
          <li>Recurring Services: ${formatValue(recurringValue)}</li>
          <li>One-Off Services: ${formatValue(oneOffValue)}</li>
        </ul>
      `;

// Groups a charge type's live selections into the
// [{servicesList: [{serviceName, price}]}] shape the ported helpers above
// expect (mirrors AddUpdateProposal.jsx's selectedRecurringServiceList/
// selectedOneOffServiceList category grouping) — one group per selection
// here since the web proposal's selections don't carry serviceCatID-grouped
// batches the way AddUpdateProposal.jsx's category state does; the ported
// helpers only ever flatten via `.servicesList`, so the exact grouping
// doesn't affect the rendered output.
const buildServiceGroupsForTemplateVariables = (selections, chargeTypeID, priceByServiceID) =>
  Object.values(selections || {}).map((selection) => ({
    servicesList: [
      {
        serviceName: selection.serviceName,
        price: priceByServiceID.get(`${chargeTypeID}:${selection.serviceID}`) ?? 0,
      },
    ],
  }));

// Maps a quotationFinalAmountList row (see
// buildQuotationFinalAmountListForServiceType above) to the RecurringPricingInfo/
// OneOffPricingInfo field names replaceTemplatePricingVariables' Service
// branch reads. DiscountedPrice has no distinct source in the rebuilt row —
// AddUpdateProposal.jsx's own RecurringPricingInfo.DiscountedPrice and
// .DiscountedTotal represent the same discounted-total-before-VAT figure in
// practice, so both are aliased to discountedTotal here.
const buildPricingInfoFromRow = (row) => ({
  OriginalPrice: row?.netTotal ?? 0,
  Discount: row?.discounted ?? 0,
  DiscountedTotal: row?.discountedTotal ?? 0,
  DiscountedPrice: row?.discountedTotal ?? 0,
  VATPrice: row?.vat ?? 0,
  GrandTotal: row?.grandTotal ?? 0,
  DefaultDiscount: row?.discountPercentageWithAllDecimal ?? 0,
});

// Rebuilds pricingVariablesList for a Service-type quote, byte-for-byte
// matching AuthContext.jsx's replaceTemplatePricingVariables Service branch
// (AuthContext.jsx:3009-3249) plus AddUpdateProposal.jsx's own
// {variableName, variableValue} wrapping (AddUpdateProposal.jsx:23157-23162)
// — every value is String()-coerced, null/undefined defaults to "0.00".
export const buildPricingVariablesListForServiceType = ({
  quotationFinalAmountRows,
  recurringSelections,
  oneOffSelections,
  pricing,
  paymentFrequencyID,
  currencyID,
}) => {
  const priceByServiceID = new Map();
  (pricing || []).forEach((item) => {
    priceByServiceID.set(
      `${item.serviceChargeTypeID}:${item.serviceID}`,
      Number(item.price) || 0,
    );
  });

  const recurringRow = (quotationFinalAmountRows || []).find(
    (row) => Number(row.serviceChargeTypeID) === 1,
  );
  const oneOffRow = (quotationFinalAmountRows || []).find(
    (row) => Number(row.serviceChargeTypeID) === 2,
  );
  const recurringPricingInfo = buildPricingInfoFromRow(recurringRow);
  const oneOffPricingInfo = buildPricingInfoFromRow(oneOffRow);

  const recurringGroups = buildServiceGroupsForTemplateVariables(
    recurringSelections,
    1,
    priceByServiceID,
  );
  const oneOffGroups = buildServiceGroupsForTemplateVariables(
    oneOffSelections,
    2,
    priceByServiceID,
  );

  const conditionalRecurringNetTotal =
    Number(recurringPricingInfo.OriginalPrice) <
    Number(recurringPricingInfo.DiscountedPrice)
      ? recurringPricingInfo.DiscountedPrice
      : recurringPricingInfo.OriginalPrice;
  const conditionalOneOffNetTotal =
    Number(oneOffPricingInfo.OriginalPrice) <
    Number(oneOffPricingInfo.DiscountedPrice)
      ? oneOffPricingInfo.DiscountedPrice
      : oneOffPricingInfo.OriginalPrice;

  const resultTotalVariablesWithValues = {
    AllRecuringResultTotalVariable_WithPackageName: replaceVariableWithTableView(
      recurringGroups,
      recurringPricingInfo,
      currencyID,
    ),
    AllOneOffResultTotalVariable_WithPackageName: replaceVariableWithTableView(
      oneOffGroups,
      oneOffPricingInfo,
      currencyID,
    ),
    AllRecurringResultTotalVariable_WithoutPackageName: replaceVariableWithTableView(
      recurringGroups,
      recurringPricingInfo,
      currencyID,
    ),
    AllOneOffResultTotalVariable_WithoutPackageName: replaceVariableWithTableView(
      oneOffGroups,
      oneOffPricingInfo,
      currencyID,
    ),

    AllServices_WithTableView: getReplaceServiceWithTableView(
      recurringGroups,
      oneOffGroups,
    ),
    AllServicesWithPrice_WithTableView: getReplaceServiceWithTableViewWithPrice(
      recurringGroups,
      oneOffGroups,
    ),
    AllServices_WithComma: getReplaceServiceWithCommaView(
      recurringGroups,
      oneOffGroups,
    ),
    AllServicesWithPrice_WithComma: getReplaceServiceWithCommaViewWithPrice(
      recurringGroups,
      oneOffGroups,
    ),
    AllServices_WithBulletList: getReplaceServiceWithBulletListView(
      recurringGroups,
      oneOffGroups,
    ),
    AllServicesWithPrice_WithBulletList: getReplaceServiceWithBulletListViewWithPrice(
      recurringGroups,
      oneOffGroups,
    ),

    Net_Total_Recurring: formatValue(conditionalRecurringNetTotal),
    Discount_Recurring: formatValue(recurringPricingInfo.Discount),
    Discounted_Total_Recurring: formatValue(recurringPricingInfo.DiscountedTotal),
    VAT_Recurring: formatValue(recurringPricingInfo.VATPrice),
    Grand_Total_Recurring: formatValue(recurringPricingInfo.GrandTotal),
    Original_Price_Recurring: formatValue(recurringPricingInfo.OriginalPrice),
    Discount_Percentage_Recurring: formatValue(recurringPricingInfo.DefaultDiscount),
    Discounted_Price_Recurring: formatValue(recurringPricingInfo.DiscountedTotal),
    Payment_Frequency_Recurring: getPaymentFrequencyLabel(paymentFrequencyID),

    Net_Total_OneOff: formatValue(conditionalOneOffNetTotal),
    Discount_OneOff: formatValue(oneOffPricingInfo.Discount),
    Discounted_Total_OneOff: formatValue(oneOffPricingInfo.DiscountedTotal),
    VAT_OneOff: formatValue(oneOffPricingInfo.VATPrice),
    Grand_Total_OneOff: formatValue(oneOffPricingInfo.GrandTotal),
    Original_Price_OneOff: formatValue(oneOffPricingInfo.OriginalPrice),
    Discount_Percentage_OneOff: formatValue(oneOffPricingInfo.DefaultDiscount),
    Discounted_Price_OneOff: formatValue(oneOffPricingInfo.DiscountedTotal),

    Net_Total_WithTableView: singleServiceWithCombinedTableView(
      "Net Total",
      conditionalRecurringNetTotal,
      conditionalOneOffNetTotal,
    ),
    Discount_WithTableView: singleServiceWithCombinedTableView(
      "Discount",
      recurringPricingInfo.Discount,
      oneOffPricingInfo.Discount,
    ),
    Discounted_Total_WithTableView: singleServiceWithCombinedTableView(
      "Discounted Total",
      recurringPricingInfo.DiscountedTotal,
      oneOffPricingInfo.DiscountedTotal,
    ),
    VAT_WithTableView: singleServiceWithCombinedTableView(
      getTaxName(currencyID),
      recurringPricingInfo.VATPrice,
      oneOffPricingInfo.VATPrice,
    ),
    Grand_Total_WithTableView: singleServiceWithCombinedTableView(
      "Grand Total",
      recurringPricingInfo.GrandTotal,
      oneOffPricingInfo.GrandTotal,
    ),
    Original_Price_WithTableView: singleServiceWithCombinedTableView(
      "Original Price",
      recurringPricingInfo.OriginalPrice,
      oneOffPricingInfo.OriginalPrice,
    ),
    Discount_Percentage_WithTableView: singleServiceWithCombinedTableView(
      "Default Percentage",
      recurringPricingInfo.DefaultDiscount,
      oneOffPricingInfo.DefaultDiscount,
    ),
    Discounted_Price_WithTableView: singleServiceWithCombinedTableView(
      "Discounted Price",
      recurringPricingInfo.DiscountedPrice,
      oneOffPricingInfo.DiscountedPrice,
    ),

    Net_Total_WithComma: getReplaceValueByWithComma(
      conditionalRecurringNetTotal,
      conditionalOneOffNetTotal,
    ),
    Discount_WithComma: getReplaceValueByWithComma(
      recurringPricingInfo.Discount,
      oneOffPricingInfo.Discount,
    ),
    Discounted_Total_WithComma: getReplaceValueByWithComma(
      recurringPricingInfo.DiscountedTotal,
      oneOffPricingInfo.DiscountedTotal,
    ),
    VAT_WithComma: getReplaceValueByWithComma(
      recurringPricingInfo.VATPrice,
      oneOffPricingInfo.VATPrice,
    ),
    Grand_Total_WithComma: getReplaceValueByWithComma(
      recurringPricingInfo.GrandTotal,
      oneOffPricingInfo.GrandTotal,
    ),
    Original_Price_WithComma: getReplaceValueByWithComma(
      recurringPricingInfo.OriginalPrice,
      oneOffPricingInfo.OriginalPrice,
    ),
    Discount_Percentage_WithComma: getReplaceValueByWithComma(
      recurringPricingInfo.DefaultDiscount,
      oneOffPricingInfo.DefaultDiscount,
    ),
    Discounted_Price_WithComma: getReplaceValueByWithComma(
      recurringPricingInfo.DiscountedPrice,
      oneOffPricingInfo.DiscountedPrice,
    ),

    Net_Total_WithBulletList: getReplaceValueByWithBulletList(
      conditionalRecurringNetTotal,
      conditionalOneOffNetTotal,
    ),
    Discount_WithBulletList: getReplaceValueByWithBulletList(
      recurringPricingInfo.Discount,
      oneOffPricingInfo.Discount,
    ),
    Discounted_Total_WithBulletList: getReplaceValueByWithBulletList(
      recurringPricingInfo.DiscountedTotal,
      oneOffPricingInfo.DiscountedTotal,
    ),
    VAT_WithBulletList: getReplaceValueByWithBulletList(
      recurringPricingInfo.VATPrice,
      oneOffPricingInfo.VATPrice,
    ),
    Grand_Total_WithBulletList: getReplaceValueByWithBulletList(
      recurringPricingInfo.GrandTotal,
      oneOffPricingInfo.GrandTotal,
    ),
    Original_Price_WithBulletList: getReplaceValueByWithBulletList(
      recurringPricingInfo.OriginalPrice,
      oneOffPricingInfo.OriginalPrice,
    ),
    Discount_Percentage_WithBulletList: getReplaceValueByWithBulletList(
      recurringPricingInfo.DefaultDiscount,
      oneOffPricingInfo.DefaultDiscount,
    ),
    Discounted_Price_WithBulletList: getReplaceValueByWithBulletList(
      recurringPricingInfo.DiscountedPrice,
      oneOffPricingInfo.DiscountedPrice,
    ),
  };

  return Object.entries(resultTotalVariablesWithValues).map(
    ([variableName, variableValue]) => ({
      variableName: `$${variableName}$`,
      variableValue: variableValue == null ? "0.00" : String(variableValue),
    }),
  );
};

// ---------------------------------------------------------------------------
// pricingVariablesList (Package and Custom Package) — ports
// replaceTemplatePricingVariables' non-Service branch (AuthContext.jsx:3250-
// 3567, reached whenever selectedProposalTypeValue !== 3 — the admin flow
// itself never distinguishes Package from Custom Package here, so neither
// does this) plus the package-shaped helpers it calls (GetReplacePackageTableView,
// GetReplacePackageCombinedTableView, and the servicePackageList branches of
// GetReplaceValueByWithComma/WithBulletList/ReplaceVariable_WithTableView
// already ported above). Ported verbatim, quirks included — e.g.
// AuthContext.jsx's own Discounted_Total_WithComma/WithBulletList/
// WithTableView calls omit the Type argument, so those three always resolve
// through every branch to PackageOneValue: null, same as admin sends today.
//
// Six variables are intentionally left as the quoteModel passthrough instead
// of rebuilt: AllServices_WithTableView/WithComma/WithBulletList and their
// WithPrice variants. Their admin-side source data (each service's own
// packageOneID/packageOneValue/servicePackageIDs, from the admin's package-
// scoped service catalog fetch) isn't part of the web proposal's live
// selection state, and Package/Custom Package here never let the client
// change which services are priced in anyway (Package Amendment has no
// Services step at all; Custom Package's added services aren't reflected in
// that admin-only catalog shape either) — so there's nothing for a live
// rebuild to actually fix for these six, unlike the totals below (which
// source cleanly from quotationFinalAmountList).

// AuthContext.jsx:1556 GetReplacePackageTableView
const getReplacePackageTableView = (pricingInfo, type, servicePackageList) => {
  const packageValueByType = {
    "Net Total": [
      Number(pricingInfo.packageOneNetTotal) >
      Number(pricingInfo.packageOneDisCountedTotal)
        ? pricingInfo.packageOneNetTotal
        : pricingInfo.packageOneDisCountedTotal,
      Number(pricingInfo.packageTwoNetTotal) >
      Number(pricingInfo.packageTwoDisCountedTotal)
        ? pricingInfo.packageTwoNetTotal
        : pricingInfo.packageTwoDisCountedTotal,
      Number(pricingInfo.packageThreeNetTotal) >
      Number(pricingInfo.packageThreeDisCountedTotal)
        ? pricingInfo.packageThreeNetTotal
        : pricingInfo.packageThreeDisCountedTotal,
    ],
    Discount: [
      pricingInfo.packageOneDisCount,
      pricingInfo.packageTwoDisCount,
      pricingInfo.packageThreeDisCount,
    ],
    "Discounted Total": [
      pricingInfo.packageOneDisCountedTotal,
      pricingInfo.packageTwoDisCountedTotal,
      pricingInfo.packageThreeDisCountedTotal,
    ],
    VAT: [
      pricingInfo.PackageOneVaTPrice,
      pricingInfo.PackageTwoVaTPrice,
      pricingInfo.PackageThreeVaTPrice,
    ],
    "Grand Total": [
      pricingInfo.PackageOneGrandTotal,
      pricingInfo.PackageTwoGrandTotal,
      pricingInfo.PackageThreeGrandTotal,
    ],
    "Original Price": [
      pricingInfo.packageOneNetTotal,
      pricingInfo.packageTwoNetTotal,
      pricingInfo.packageThreeNetTotal,
    ],
    "Default Percentage": [
      pricingInfo.DiscountPercentagePackageOne,
      pricingInfo.DiscountPercentagePackageTwo,
      pricingInfo.DiscountPercentagePackageThree,
    ],
    "Discounted Price": [
      pricingInfo.packageOneDisCountedTotal,
      pricingInfo.packageTwoDisCountedTotal,
      pricingInfo.packageThreeDisCountedTotal,
    ],
  };
  const [packageOneValue, packageTwoValue, packageThreeValue] =
    packageValueByType[type] || [null, null, null];

  const headers = servicePackageList
    .map(
      (item) =>
        `<th style="border: 1px solid black; padding: 8px; width: 25%;">${item.servicePackageName}</th>`,
    )
    .join("");

  let rowValues = "";
  if (servicePackageList.length === 1) {
    rowValues = `<td style="border: 1px solid black; padding: 8px;text-align:center;width: 25%;">${formatValue(packageOneValue)}</td>`;
  } else if (servicePackageList.length === 2) {
    rowValues = `
        <td style="border: 1px solid black; padding: 8px;text-align:right;width: 25%;">${formatValue(packageOneValue)}</td>
        <td style="border: 1px solid black; padding: 8px;text-align:right;width: 25%;">${formatValue(packageTwoValue)}</td>
      `;
  } else if (servicePackageList.length === 3) {
    rowValues = `
        <td style="border: 1px solid black; padding: 8px;text-align: right;width: 25%;">${formatValue(packageOneValue)}</td>
        <td style="border: 1px solid black; padding: 8px;text-align: right;width: 25%;">${formatValue(packageTwoValue)}</td>
        <td style="border: 1px solid black; padding: 8px;text-align: right;width: 25%;">${formatValue(packageThreeValue)}</td>
      `;
  }

  return `
      <table style="border-collapse: collapse; width: 100%; page-break-inside: avoid; break-inside: avoid;">
        <tr>
          <th style="border: 1px solid black; padding: 8px;width: 25%;">Package Name</th>
          ${headers}
        </tr>
        <tr>
          <th style="border: 1px solid black; padding: 8px;width: 25%;">${type}</th>
          ${rowValues}
        </tr>
      </table>`;
};

// AuthContext.jsx:1661 GetReplacePackageCombinedTableView
const getReplacePackageCombinedTableView = (
  recurringPricingInfo,
  oneOffPricingInfo,
  type,
  servicePackageList,
) => {
  const recurringValueByType = {
    "Net Total": [
      Number(recurringPricingInfo.packageOneNetTotal) >
      Number(recurringPricingInfo.packageOneDisCountedTotal)
        ? recurringPricingInfo.packageOneNetTotal
        : recurringPricingInfo.packageOneDisCountedTotal,
      Number(recurringPricingInfo.packageTwoNetTotal) >
      Number(recurringPricingInfo.packageTwoDisCountedTotal)
        ? recurringPricingInfo.packageTwoNetTotal
        : recurringPricingInfo.packageTwoDisCountedTotal,
      Number(recurringPricingInfo.packageThreeNetTotal) >
      Number(recurringPricingInfo.packageThreeDisCountedTotal)
        ? recurringPricingInfo.packageThreeNetTotal
        : recurringPricingInfo.packageThreeDisCountedTotal,
    ],
    Discount: [
      recurringPricingInfo.packageOneDisCount,
      recurringPricingInfo.packageTwoDisCount,
      recurringPricingInfo.packageThreeDisCount,
    ],
    "Discounted Total": [
      recurringPricingInfo.packageOneDisCountedTotal,
      recurringPricingInfo.packageTwoDisCountedTotal,
      recurringPricingInfo.packageThreeDisCountedTotal,
    ],
    VAT: [
      recurringPricingInfo.PackageOneVaTPrice,
      recurringPricingInfo.PackageTwoVaTPrice,
      recurringPricingInfo.PackageThreeVaTPrice,
    ],
    "Grand Total": [
      recurringPricingInfo.PackageOneGrandTotal,
      recurringPricingInfo.PackageTwoGrandTotal,
      recurringPricingInfo.PackageThreeGrandTotal,
    ],
    "Original Price": [
      recurringPricingInfo.packageOneNetTotal,
      recurringPricingInfo.packageTwoNetTotal,
      recurringPricingInfo.packageThreeNetTotal,
    ],
    "Default Percentage": [
      recurringPricingInfo.DiscountPercentagePackageOne,
      recurringPricingInfo.DiscountPercentagePackageTwo,
      recurringPricingInfo.DiscountPercentagePackageThree,
    ],
    "Discounted Price": [
      recurringPricingInfo.packageOneDisCountedTotal,
      recurringPricingInfo.packageTwoDisCountedTotal,
      recurringPricingInfo.packageThreeDisCountedTotal,
    ],
  };
  const oneOffValueByType = {
    "Net Total": [
      Number(oneOffPricingInfo.packageOneNetTotal) >
      Number(oneOffPricingInfo.packageOneDisCountedTotal)
        ? oneOffPricingInfo.packageOneNetTotal
        : oneOffPricingInfo.packageOneDisCountedTotal,
      Number(oneOffPricingInfo.packageTwoNetTotal) >
      Number(oneOffPricingInfo.packageTwoDisCountedTotal)
        ? oneOffPricingInfo.packageTwoNetTotal
        : oneOffPricingInfo.packageTwoDisCountedTotal,
      // Mirrors AuthContext.jsx:1710 verbatim — the package-three fallback
      // there reads RecurringPricingInfo instead of OneOffPricingInfo.
      Number(oneOffPricingInfo.packageThreeNetTotal) >
      Number(oneOffPricingInfo.packageThreeDisCountedTotal)
        ? oneOffPricingInfo.packageThreeNetTotal
        : recurringPricingInfo.packageThreeDisCountedTotal,
    ],
    Discount: [
      oneOffPricingInfo.packageOneDisCount,
      oneOffPricingInfo.packageTwoDisCount,
      oneOffPricingInfo.packageThreeDisCount,
    ],
    "Discounted Total": [
      oneOffPricingInfo.packageOneDisCountedTotal,
      oneOffPricingInfo.packageTwoDisCountedTotal,
      oneOffPricingInfo.packageThreeDisCountedTotal,
    ],
    VAT: [
      oneOffPricingInfo.PackageOneVaTPrice,
      oneOffPricingInfo.PackageTwoVaTPrice,
      oneOffPricingInfo.PackageThreeVaTPrice,
    ],
    "Grand Total": [
      oneOffPricingInfo.PackageOneGrandTotal,
      oneOffPricingInfo.PackageTwoGrandTotal,
      oneOffPricingInfo.PackageThreeGrandTotal,
    ],
    "Original Price": [
      oneOffPricingInfo.packageOneNetTotal,
      oneOffPricingInfo.packageTwoNetTotal,
      oneOffPricingInfo.packageThreeNetTotal,
    ],
    "Default Percentage": [
      oneOffPricingInfo.DiscountPercentagePackageOne,
      oneOffPricingInfo.DiscountPercentagePackageTwo,
      oneOffPricingInfo.DiscountPercentagePackageThree,
    ],
    "Discounted Price": [
      oneOffPricingInfo.packageOneDisCountedTotal,
      oneOffPricingInfo.packageTwoDisCountedTotal,
      oneOffPricingInfo.packageThreeDisCountedTotal,
    ],
  };

  const [recurringOne, recurringTwo, recurringThree] =
    recurringValueByType[type] || [null, null, null];
  const [oneOffOne, oneOffTwo, oneOffThree] = oneOffValueByType[type] || [
    null,
    null,
    null,
  ];

  const cell = (recurringValue, oneOffValue) => `
        <td style="border: 1px solid black; padding: 8px;width: 25%;text-align: right;"><ul>
          <li>Recurring Services: ${formatValue(recurringValue)}</li>
          <li>One-Off Services: ${formatValue(oneOffValue)}</li>
        </ul></td>`;

  let rowValues = "";
  if (servicePackageList.length === 1) {
    rowValues = cell(recurringOne, oneOffOne);
  } else if (servicePackageList.length === 2) {
    rowValues = `${cell(recurringOne, oneOffOne)}${cell(recurringTwo, oneOffTwo)}`;
  } else if (servicePackageList.length === 3) {
    rowValues = `${cell(recurringOne, oneOffOne)}${cell(recurringTwo, oneOffTwo)}${cell(recurringThree, oneOffThree)}`;
  }

  return `
      <table style="border-collapse: collapse; width: 100%; page-break-inside: avoid; break-inside: avoid;">
        <tr>
          <th style="border: 1px solid black; padding: 8px;width: 25%;">Package Name</th>
          ${servicePackageList
            .map(
              (item) =>
                `<th style="border: 1px solid black; padding: 8px;">${item.servicePackageName}</th>`,
            )
            .join("")}
        </tr>
        <tr>
          <th style="border: 1px solid black; padding: 8px;width: 25%;">${type}</th>
          ${rowValues}
        </tr>
      </table>`;
};

// AuthContext.jsx:1824 GetReplaceValueByWithComma, servicePackageList branch
const getReplaceValueByWithCommaPackage = (
  recurringPricingInfo,
  oneOffPricingInfo,
  servicePackageList,
  type,
) => {
  const recurringByType = {
    "Net Total": [
      Number(recurringPricingInfo.packageOneNetTotal) >
      Number(recurringPricingInfo.packageOneDisCountedTotal)
        ? recurringPricingInfo.packageOneNetTotal
        : recurringPricingInfo.packageOneDisCountedTotal,
      Number(recurringPricingInfo.packageTwoNetTotal) >
      Number(recurringPricingInfo.packageTwoDisCountedTotal)
        ? recurringPricingInfo.packageTwoNetTotal
        : recurringPricingInfo.packageTwoDisCountedTotal,
      Number(recurringPricingInfo.packageThreeNetTotal) >
      Number(recurringPricingInfo.packageThreeDisCountedTotal)
        ? recurringPricingInfo.packageThreeNetTotal
        : recurringPricingInfo.packageThreeDisCountedTotal,
    ],
    Discount: [
      recurringPricingInfo.packageOneDisCount,
      recurringPricingInfo.packageTwoDisCount,
      recurringPricingInfo.packageThreeDisCount,
    ],
    "Discounted Total": [
      recurringPricingInfo.packageOneDisCountedTotal,
      recurringPricingInfo.packageTwoDisCountedTotal,
      recurringPricingInfo.packageThreeDisCountedTotal,
    ],
    VAT: [
      recurringPricingInfo.PackageOneVaTPrice,
      recurringPricingInfo.PackageTwoVaTPrice,
      recurringPricingInfo.PackageThreeVaTPrice,
    ],
    "Grand Total": [
      recurringPricingInfo.PackageOneGrandTotal,
      recurringPricingInfo.PackageTwoGrandTotal,
      recurringPricingInfo.PackageThreeGrandTotal,
    ],
    "Original Price": [
      recurringPricingInfo.packageOneNetTotal,
      recurringPricingInfo.packageTwoNetTotal,
      recurringPricingInfo.packageThreeNetTotal,
    ],
    "Default Percentage": [
      recurringPricingInfo.DiscountPercentagePackageOne,
      recurringPricingInfo.DiscountPercentagePackageTwo,
      recurringPricingInfo.DiscountPercentagePackageThree,
    ],
    "Discounted Price": [
      recurringPricingInfo.packageOneDisCountedTotal,
      recurringPricingInfo.packageTwoDisCountedTotal,
      recurringPricingInfo.packageThreeDisCountedTotal,
    ],
  };
  const oneOffByType = {
    "Net Total": [
      Number(oneOffPricingInfo.packageOneNetTotal) >
      Number(oneOffPricingInfo.packageOneDisCountedTotal)
        ? oneOffPricingInfo.packageOneNetTotal
        : oneOffPricingInfo.packageOneDisCountedTotal,
      Number(oneOffPricingInfo.packageTwoNetTotal) >
      Number(oneOffPricingInfo.packageTwoDisCountedTotal)
        ? oneOffPricingInfo.packageTwoNetTotal
        : oneOffPricingInfo.packageTwoDisCountedTotal,
      Number(oneOffPricingInfo.packageThreeNetTotal) >
      Number(oneOffPricingInfo.packageThreeDisCountedTotal)
        ? oneOffPricingInfo.packageThreeNetTotal
        : oneOffPricingInfo.packageThreeDisCountedTotal,
    ],
    Discount: [
      oneOffPricingInfo.packageOneDisCount,
      oneOffPricingInfo.packageTwoDisCount,
      oneOffPricingInfo.packageThreeDisCount,
    ],
    "Discounted Total": [
      oneOffPricingInfo.packageOneDisCountedTotal,
      oneOffPricingInfo.packageTwoDisCountedTotal,
      oneOffPricingInfo.packageThreeDisCountedTotal,
    ],
    VAT: [
      oneOffPricingInfo.PackageOneVaTPrice,
      oneOffPricingInfo.PackageTwoVaTPrice,
      oneOffPricingInfo.PackageThreeVaTPrice,
    ],
    "Grand Total": [
      oneOffPricingInfo.PackageOneGrandTotal,
      oneOffPricingInfo.PackageTwoGrandTotal,
      oneOffPricingInfo.PackageThreeGrandTotal,
    ],
    "Original Price": [
      oneOffPricingInfo.packageOneNetTotal,
      oneOffPricingInfo.packageTwoNetTotal,
      oneOffPricingInfo.packageThreeNetTotal,
    ],
    "Default Percentage": [
      oneOffPricingInfo.DiscountPercentagePackageOne,
      oneOffPricingInfo.DiscountPercentagePackageTwo,
      oneOffPricingInfo.DiscountPercentagePackageThree,
    ],
    "Discounted Price": [
      oneOffPricingInfo.packageOneDisCountedTotal,
      oneOffPricingInfo.packageTwoDisCountedTotal,
      oneOffPricingInfo.packageThreeDisCountedTotal,
    ],
  };
  const recurringValues = recurringByType[type] || [null, null, null];
  const oneOffValues = oneOffByType[type] || [null, null, null];

  return servicePackageList
    .map(
      (item, index) =>
        `<b>${item.servicePackageName}</b>: Recurring Services: ${formatValue(
          recurringValues[index],
        )}, One-Off Services: ${formatValue(oneOffValues[index])}`,
    )
    .join(", ");
};

// AuthContext.jsx:1957 GetReplaceValueByWithBulletList, servicePackageList
// branch — same per-type value resolution as getReplaceValueByWithCommaPackage
// (kept as a private copy here rather than shared, since the source only
// shares the Type-to-field switch by literal duplication too), wrapped as a
// <ul><li> list instead of the comma view's joined <b> string.
const getReplaceValueByWithBulletListPackage = (
  recurringPricingInfo,
  oneOffPricingInfo,
  servicePackageList,
  type,
) => {
  const recurringByType = {
    "Net Total": [
      Number(recurringPricingInfo.packageOneNetTotal) >
      Number(recurringPricingInfo.packageOneDisCountedTotal)
        ? recurringPricingInfo.packageOneNetTotal
        : recurringPricingInfo.packageOneDisCountedTotal,
      Number(recurringPricingInfo.packageTwoNetTotal) >
      Number(recurringPricingInfo.packageTwoDisCountedTotal)
        ? recurringPricingInfo.packageTwoNetTotal
        : recurringPricingInfo.packageTwoDisCountedTotal,
      Number(recurringPricingInfo.packageThreeNetTotal) >
      Number(recurringPricingInfo.packageThreeDisCountedTotal)
        ? recurringPricingInfo.packageThreeNetTotal
        : recurringPricingInfo.packageThreeDisCountedTotal,
    ],
    Discount: [
      recurringPricingInfo.packageOneDisCount,
      recurringPricingInfo.packageTwoDisCount,
      recurringPricingInfo.packageThreeDisCount,
    ],
    "Discounted Total": [
      recurringPricingInfo.packageOneDisCountedTotal,
      recurringPricingInfo.packageTwoDisCountedTotal,
      recurringPricingInfo.packageThreeDisCountedTotal,
    ],
    VAT: [
      recurringPricingInfo.PackageOneVaTPrice,
      recurringPricingInfo.PackageTwoVaTPrice,
      recurringPricingInfo.PackageThreeVaTPrice,
    ],
    "Grand Total": [
      recurringPricingInfo.PackageOneGrandTotal,
      recurringPricingInfo.PackageTwoGrandTotal,
      recurringPricingInfo.PackageThreeGrandTotal,
    ],
    "Original Price": [
      recurringPricingInfo.packageOneNetTotal,
      recurringPricingInfo.packageTwoNetTotal,
      recurringPricingInfo.packageThreeNetTotal,
    ],
    "Default Percentage": [
      recurringPricingInfo.DiscountPercentagePackageOne,
      recurringPricingInfo.DiscountPercentagePackageTwo,
      recurringPricingInfo.DiscountPercentagePackageThree,
    ],
    "Discounted Price": [
      recurringPricingInfo.packageOneDisCountedTotal,
      recurringPricingInfo.packageTwoDisCountedTotal,
      recurringPricingInfo.packageThreeDisCountedTotal,
    ],
  };
  const oneOffByType = {
    "Net Total": [
      Number(oneOffPricingInfo.packageOneNetTotal) >
      Number(oneOffPricingInfo.packageOneDisCountedTotal)
        ? oneOffPricingInfo.packageOneNetTotal
        : oneOffPricingInfo.packageOneDisCountedTotal,
      Number(oneOffPricingInfo.packageTwoNetTotal) >
      Number(oneOffPricingInfo.packageTwoDisCountedTotal)
        ? oneOffPricingInfo.packageTwoNetTotal
        : oneOffPricingInfo.packageTwoDisCountedTotal,
      Number(oneOffPricingInfo.packageThreeNetTotal) >
      Number(oneOffPricingInfo.packageThreeDisCountedTotal)
        ? oneOffPricingInfo.packageThreeNetTotal
        : oneOffPricingInfo.packageThreeDisCountedTotal,
    ],
    Discount: [
      oneOffPricingInfo.packageOneDisCount,
      oneOffPricingInfo.packageTwoDisCount,
      oneOffPricingInfo.packageThreeDisCount,
    ],
    "Discounted Total": [
      oneOffPricingInfo.packageOneDisCountedTotal,
      oneOffPricingInfo.packageTwoDisCountedTotal,
      oneOffPricingInfo.packageThreeDisCountedTotal,
    ],
    VAT: [
      oneOffPricingInfo.PackageOneVaTPrice,
      oneOffPricingInfo.PackageTwoVaTPrice,
      oneOffPricingInfo.PackageThreeVaTPrice,
    ],
    "Grand Total": [
      oneOffPricingInfo.PackageOneGrandTotal,
      oneOffPricingInfo.PackageTwoGrandTotal,
      oneOffPricingInfo.PackageThreeGrandTotal,
    ],
    "Original Price": [
      oneOffPricingInfo.packageOneNetTotal,
      oneOffPricingInfo.packageTwoNetTotal,
      oneOffPricingInfo.packageThreeNetTotal,
    ],
    "Default Percentage": [
      oneOffPricingInfo.DiscountPercentagePackageOne,
      oneOffPricingInfo.DiscountPercentagePackageTwo,
      oneOffPricingInfo.DiscountPercentagePackageThree,
    ],
    "Discounted Price": [
      oneOffPricingInfo.packageOneDisCountedTotal,
      oneOffPricingInfo.packageTwoDisCountedTotal,
      oneOffPricingInfo.packageThreeDisCountedTotal,
    ],
  };
  const recurringValues = recurringByType[type] || [null, null, null];
  const oneOffValues = oneOffByType[type] || [null, null, null];

  return `
        <ul>
          ${servicePackageList
            .map(
              (item, index) => `
            <li>${item.servicePackageName}: Recurring Services: ${formatValue(
              recurringValues[index],
            )}, One-Off Services: ${formatValue(oneOffValues[index])}</li>
          `,
            )
            .join("")}
        </ul>
      `;
};

// AuthContext.jsx:2117 ReplaceVariable_WithTableView, servicePackageList
// branch — the per-package Net Total/Discount/Discounted Price/VAT/Grand
// Total table. withoutName mirrors the admin call site passing Type:
// "WithOutName" to omit the package-name header row.
const replaceVariableWithTableViewPackage = (
  hasServices,
  pricingInfo,
  servicePackageList,
  withoutName,
) => {
  if (!hasServices) return "";

  const packageData = ["One", "Two", "Three"].map((suffix) => {
    const netTotal = pricingInfo[`package${suffix}NetTotal`];
    const discountedTotal = pricingInfo[`package${suffix}DisCountedTotal`];
    return {
      netTotal: Math.max(Number(netTotal) || 0, Number(discountedTotal) || 0),
      discountedTotal,
      discount: pricingInfo[`package${suffix}DisCount`],
      vatPrice: pricingInfo[`Package${suffix}VaTPrice`],
      grandTotal: pricingInfo[`Package${suffix}GrandTotal`],
    };
  });

  return `
  <table style="border-collapse: collapse; width: 100%; margin-bottom: 16px; page-break-inside: avoid; break-inside: avoid;">
    <!-- Package Names Row -->
    ${
      !withoutName
        ? `
        <tr>
          <th style="border: 1px solid rgb(10, 10, 10); padding: 8px; text-align: left; width: 25%;">Package Name</th>
          ${servicePackageList
            .map(
              (pkg) => `
              <th style="border: 1px solid rgb(10, 10, 10); padding: 8px; text-align: right; width: 25%;">
                ${pkg.servicePackageName}
              </th>
            `,
            )
            .join("")}
        </tr>
      `
        : ""
    }

    <!-- Data Rows -->

          <tr>
            <td style="border: 1px solid rgb(10, 10, 10); padding: 8px; text-align: left; width: 25%;">Net Total</td>
            ${servicePackageList
              .map(
                (pkg, index) => `
              <td style="border: 1px solid rgb(10, 10, 10); padding: 8px; text-align: right; width: 25%;">
                ${formatValue(packageData[index]?.netTotal || 0)}
              </td>
            `,
              )
              .join("")}
          </tr>
          <tr>
            <td style="border: 1px solid rgb(10, 10, 10); padding: 8px; text-align: left; width: 25%;">Discount</td>
            ${servicePackageList
              .map(
                (pkg, index) => `
              <td style="border: 1px solid rgb(10, 10, 10); padding: 8px; text-align: right; width: 25%;">
                ${formatValue(packageData[index]?.discount || 0)}
              </td>
            `,
              )
              .join("")}
          </tr>
          <tr>
            <td style="border: 1px solid rgb(10, 10, 10); padding: 8px; text-align: left; width: 25%;">Discounted Price</td>
            ${servicePackageList
              .map(
                (pkg, index) => `
              <td style="border: 1px solid rgb(10, 10, 10); padding: 8px; text-align: right; width: 25%;">
                ${formatValue(packageData[index]?.discountedTotal || 0)}
              </td>
            `,
              )
              .join("")}
          </tr>
          <tr>
            <td style="border: 1px solid rgb(10, 10, 10); padding: 8px; text-align: left; width: 25%;">VAT</td>
            ${servicePackageList
              .map(
                (pkg, index) => `
              <td style="border: 1px solid rgb(10, 10, 10); padding: 8px; text-align: right; width: 25%;">
                ${formatValue(packageData[index]?.vatPrice || 0)}
              </td>
            `,
              )
              .join("")}
          </tr>
          <tr>
            <td style="border: 1px solid rgb(10, 10, 10); padding: 8px; text-align: left; width: 25%;">Grand Total</td>
            ${servicePackageList
              .map(
                (pkg, index) => `
              <td style="border: 1px solid rgb(10, 10, 10); padding: 8px; text-align: right; width: 25%;">
                ${formatValue(packageData[index]?.grandTotal || 0)}
              </td>
            `,
              )
              .join("")}
          </tr>


  </table>
`;
};

// Maps quotationFinalAmountList rows (the existing quoteModel passthrough —
// Package/Custom Package quotes aren't rebuilt, see buildQuotationFinalAmountList)
// to the packageOneNetTotal/packageOneDisCount/.../DiscountPercentagePackageOne
// (…Two/…Three) field set the ported package helpers above read, matching
// each servicePackageList entry to its row by servicePackageID.
const buildPricingInfoWithPackagesFromRows = (
  rows,
  serviceChargeTypeID,
  servicePackageList,
) => {
  const info = {};
  ["One", "Two", "Three"].forEach((suffix, index) => {
    const pkg = servicePackageList[index];
    const row = pkg
      ? (rows || []).find(
          (r) =>
            Number(r.serviceChargeTypeID) === serviceChargeTypeID &&
            String(r.servicePackageID) === String(pkg.servicePackageID),
        )
      : null;
    info[`package${suffix}NetTotal`] = row?.netTotal ?? 0;
    info[`package${suffix}DisCount`] = row?.discounted ?? 0;
    info[`package${suffix}DisCountedTotal`] = row?.discountedTotal ?? 0;
    info[`Package${suffix}VaTPrice`] = row?.vat ?? 0;
    info[`Package${suffix}GrandTotal`] = row?.grandTotal ?? 0;
    info[`DiscountPercentagePackage${suffix}`] =
      row?.discountPercentageWithAllDecimal ?? 0;
  });
  return info;
};

// Rebuilds pricingVariablesList for Package/Custom Package, byte-for-byte
// matching AuthContext.jsx's replaceTemplatePricingVariables non-Service
// branch (AuthContext.jsx:3250-3567) for every variable except the six
// AllServices_*/AllServicesWithPrice_* ones — see the comment above
// getReplacePackageTableView for why those stay as the quoteModel
// passthrough.
export const buildPricingVariablesListForPackageType = ({
  quoteModel,
  servicePackageList,
  paymentFrequencyID,
}) => {
  const rows = Array.isArray(quoteModel?.quotationFinalAmountList)
    ? quoteModel.quotationFinalAmountList
    : [];
  const packages = (servicePackageList || []).slice(0, 3);

  const recurringPricingInfo = buildPricingInfoWithPackagesFromRows(
    rows,
    1,
    packages,
  );
  const oneOffPricingInfo = buildPricingInfoWithPackagesFromRows(
    rows,
    2,
    packages,
  );

  const hasRecurring = rows.some(
    (row) => Number(row.serviceChargeTypeID) === 1,
  );
  const hasOneOff = rows.some((row) => Number(row.serviceChargeTypeID) === 2);

  const passthroughByName = new Map(
    (Array.isArray(quoteModel?.pricingVariablesList)
      ? quoteModel.pricingVariablesList
      : []
    ).map((entry) => [entry.variableName, entry.variableValue]),
  );
  const passthrough = (variableName) =>
    passthroughByName.get(`$${variableName}$`) ?? "";

  const resultTotalVariablesWithValues = {
    AllRecuringResultTotalVariable_WithPackageName:
      replaceVariableWithTableViewPackage(
        hasRecurring,
        recurringPricingInfo,
        packages,
        false,
      ),
    AllOneOffResultTotalVariable_WithPackageName:
      replaceVariableWithTableViewPackage(
        hasOneOff,
        oneOffPricingInfo,
        packages,
        false,
      ),
    AllRecurringResultTotalVariable_WithoutPackageName:
      replaceVariableWithTableViewPackage(
        hasRecurring,
        recurringPricingInfo,
        packages,
        true,
      ),
    AllOneOffResultTotalVariable_WithoutPackageName:
      replaceVariableWithTableViewPackage(
        hasOneOff,
        oneOffPricingInfo,
        packages,
        true,
      ),

    AllServices_WithTableView: passthrough("AllServices_WithTableView"),
    AllServicesWithPrice_WithTableView: passthrough(
      "AllServicesWithPrice_WithTableView",
    ),
    AllServices_WithComma: passthrough("AllServices_WithComma"),
    AllServicesWithPrice_WithComma: passthrough(
      "AllServicesWithPrice_WithComma",
    ),
    AllServices_WithBulletList: passthrough("AllServices_WithBulletList"),
    AllServicesWithPrice_WithBulletList: passthrough(
      "AllServicesWithPrice_WithBulletList",
    ),

    Net_Total_Recurring: getReplacePackageTableView(
      recurringPricingInfo,
      "Net Total",
      packages,
    ),
    Discount_Recurring: getReplacePackageTableView(
      recurringPricingInfo,
      "Discount",
      packages,
    ),
    Discounted_Total_Recurring: getReplacePackageTableView(
      recurringPricingInfo,
      "Discounted Total",
      packages,
    ),
    VAT_Recurring: getReplacePackageTableView(
      recurringPricingInfo,
      "VAT",
      packages,
    ),
    Grand_Total_Recurring: getReplacePackageTableView(
      recurringPricingInfo,
      "Grand Total",
      packages,
    ),
    Original_Price_Recurring: getReplacePackageTableView(
      recurringPricingInfo,
      "Original Price",
      packages,
    ),
    Discount_Percentage_Recurring: getReplacePackageTableView(
      recurringPricingInfo,
      "Default Percentage",
      packages,
    ),
    Discounted_Price_Recurring: getReplacePackageTableView(
      recurringPricingInfo,
      "Discounted Price",
      packages,
    ),
    Payment_Frequency_Recurring: getPaymentFrequencyLabel(paymentFrequencyID),

    Net_Total_OneOff: getReplacePackageTableView(
      oneOffPricingInfo,
      "Net Total",
      packages,
    ),
    Discount_OneOff: getReplacePackageTableView(
      oneOffPricingInfo,
      "Discount",
      packages,
    ),
    Discounted_Total_OneOff: getReplacePackageTableView(
      oneOffPricingInfo,
      "Discounted Total",
      packages,
    ),
    VAT_OneOff: getReplacePackageTableView(oneOffPricingInfo, "VAT", packages),
    Grand_Total_OneOff: getReplacePackageTableView(
      oneOffPricingInfo,
      "Grand Total",
      packages,
    ),
    Original_Price_OneOff: getReplacePackageTableView(
      oneOffPricingInfo,
      "Original Price",
      packages,
    ),
    Discount_Percentage_OneOff: getReplacePackageTableView(
      oneOffPricingInfo,
      "Default Percentage",
      packages,
    ),
    Discounted_Price_OneOff: getReplacePackageTableView(
      oneOffPricingInfo,
      "Discounted Price",
      packages,
    ),

    Net_Total_WithTableView: getReplacePackageCombinedTableView(
      recurringPricingInfo,
      oneOffPricingInfo,
      "Net Total",
      packages,
    ),
    Discount_WithTableView: getReplacePackageCombinedTableView(
      recurringPricingInfo,
      oneOffPricingInfo,
      "Discount",
      packages,
    ),
    Discounted_Total_WithTableView: getReplacePackageCombinedTableView(
      recurringPricingInfo,
      oneOffPricingInfo,
      "Discounted Total",
      packages,
    ),
    Discounted_Price_WithTableView: getReplacePackageCombinedTableView(
      recurringPricingInfo,
      oneOffPricingInfo,
      "Discounted Price",
      packages,
    ),
    VAT_WithTableView: getReplacePackageCombinedTableView(
      recurringPricingInfo,
      oneOffPricingInfo,
      "VAT",
      packages,
    ),
    Grand_Total_WithTableView: getReplacePackageCombinedTableView(
      recurringPricingInfo,
      oneOffPricingInfo,
      "Grand Total",
      packages,
    ),
    Original_Price_WithTableView: getReplacePackageCombinedTableView(
      recurringPricingInfo,
      oneOffPricingInfo,
      "Original Price",
      packages,
    ),
    Discount_Percentage_WithTableView: getReplacePackageCombinedTableView(
      recurringPricingInfo,
      oneOffPricingInfo,
      "Default Percentage",
      packages,
    ),

    Net_Total_WithComma: getReplaceValueByWithCommaPackage(
      recurringPricingInfo,
      oneOffPricingInfo,
      packages,
      "Net Total",
    ),
    Discount_WithComma: getReplaceValueByWithCommaPackage(
      recurringPricingInfo,
      oneOffPricingInfo,
      packages,
      "Discount",
    ),
    // Mirrors AuthContext.jsx:3469-3474 verbatim — the admin call site omits
    // the Type argument here, so this (like the two below it) resolves
    // through every branch to null/null/null.
    Discounted_Total_WithComma: getReplaceValueByWithCommaPackage(
      recurringPricingInfo,
      oneOffPricingInfo,
      packages,
      undefined,
    ),
    VAT_WithComma: getReplaceValueByWithCommaPackage(
      recurringPricingInfo,
      oneOffPricingInfo,
      packages,
      "VAT",
    ),
    Grand_Total_WithComma: getReplaceValueByWithCommaPackage(
      recurringPricingInfo,
      oneOffPricingInfo,
      packages,
      "Grand Total",
    ),
    Original_Price_WithComma: getReplaceValueByWithCommaPackage(
      recurringPricingInfo,
      oneOffPricingInfo,
      packages,
      "Original Price",
    ),
    Discount_Percentage_WithComma: getReplaceValueByWithCommaPackage(
      recurringPricingInfo,
      oneOffPricingInfo,
      packages,
      "Default Percentage",
    ),
    // AuthContext.jsx:3508 passes Type: "Default Price" here, which matches
    // none of the branches (the real key is "Discounted Price") — mirrored
    // verbatim, so this also resolves to null/null/null.
    Discounted_Price_WithComma: getReplaceValueByWithCommaPackage(
      recurringPricingInfo,
      oneOffPricingInfo,
      packages,
      "Default Price",
    ),

    Net_Total_WithBulletList: getReplaceValueByWithBulletListPackage(
      recurringPricingInfo,
      oneOffPricingInfo,
      packages,
      "Net Total",
    ),
    Discount_WithBulletList: getReplaceValueByWithBulletListPackage(
      recurringPricingInfo,
      oneOffPricingInfo,
      packages,
      "Discount",
    ),
    Discounted_Total_WithBulletList: getReplaceValueByWithBulletListPackage(
      recurringPricingInfo,
      oneOffPricingInfo,
      packages,
      undefined,
    ),
    VAT_WithBulletList: getReplaceValueByWithBulletListPackage(
      recurringPricingInfo,
      oneOffPricingInfo,
      packages,
      "VAT",
    ),
    Grand_Total_WithBulletList: getReplaceValueByWithBulletListPackage(
      recurringPricingInfo,
      oneOffPricingInfo,
      packages,
      "Grand Total",
    ),
    Original_Price_WithBulletList: getReplaceValueByWithBulletListPackage(
      recurringPricingInfo,
      oneOffPricingInfo,
      packages,
      "Original Price",
    ),
    Discount_Percentage_WithBulletList: getReplaceValueByWithBulletListPackage(
      recurringPricingInfo,
      oneOffPricingInfo,
      packages,
      "Default Percentage",
    ),
    Discounted_Price_WithBulletList: getReplaceValueByWithBulletListPackage(
      recurringPricingInfo,
      oneOffPricingInfo,
      packages,
      "Default Price",
    ),
  };

  return Object.entries(resultTotalVariablesWithValues).map(
    ([variableName, variableValue]) => ({
      variableName: `$${variableName}$`,
      variableValue: variableValue == null ? "0.00" : String(variableValue),
    }),
  );
};

// Dispatches pricingVariablesList building by proposal type — Service
// rebuilds from the live selections/totals (buildPricingVariablesListForServiceType);
// Package and Custom Package both rebuild from the existing
// quotationFinalAmountList + servicePackageList
// (buildPricingVariablesListForPackageType — the admin flow itself never
// distinguishes the two here either); any other/unrecognised type keeps the
// plain quoteModel passthrough.
// Unlike buildQuotationFinalAmountList/selectedServicesList/
// additionalInformationList, this is NOT gated by isAmend: GetQuoteModel's
// own pricingVariablesList is a write-only template-substitution field that
// AddUpdateQuote itself populates on save, not something GetQuoteModel
// reliably returns already populated — falling back to the raw
// quoteModel.pricingVariablesList passthrough for an unamended Service
// quote would silently send an empty list and drop every $Variable$ the PDF
// template relies on. So Service rebuilds this from the current (unchanged,
// when unamended) live selections/pricing regardless of isAmend, exactly
// like Package/Custom Package's branch below already does unconditionally.
export const buildPricingVariablesList = ({
  quoteModel,
  quotationFinalAmountRows,
  recurringSelections,
  oneOffSelections,
  pricing,
  currencyID,
  servicePackageList,
}) => {
  if (quoteModel?.quoteTypeID === QUOTE_TYPE_ID.Service) {
    return buildPricingVariablesListForServiceType({
      quotationFinalAmountRows,
      recurringSelections,
      oneOffSelections,
      pricing,
      paymentFrequencyID: quoteModel?.paymentFrequencyID,
      currencyID,
    });
  }

  if (
    quoteModel?.quoteTypeID === QUOTE_TYPE_ID.Package ||
    quoteModel?.quoteTypeID === QUOTE_TYPE_ID.CustomPackage
  ) {
    return buildPricingVariablesListForPackageType({
      quoteModel,
      servicePackageList,
      paymentFrequencyID: quoteModel?.paymentFrequencyID,
    });
  }

  return Array.isArray(quoteModel?.pricingVariablesList)
    ? quoteModel.pricingVariablesList
    : [];
};

// GetQuoteModel's selectedServicesList rows are whatever AddUpdateQuote
// persisted the last time this quote was saved — for Package Amendment
// (no client-editable Services step, so buildSelectedServicesListFromSelections
// never runs) that's forwarded as-is today, carrying stale msgMapID/msMapID
// from that prior save and, since it round-tripped through JSON parsing on
// GetQuoteModel's own response, numeric fields that can come back as
// strings ("20" instead of 20). Re-shapes each row into exactly the field
// set/types AddUpdateProposal.jsx's modifiedDraftArray sends
// (AddUpdateProposal.jsx:22700-22716 / 22650-22698), dropping any extra
// GetQuoteModel-only bookkeeping fields and forcing msgMapID/msMapID to
// null the same way buildModuleServicesGPDList and
// buildAdditionalInformationListForPayload already do. servicePackageID is
// likewise always sent as null — modifiedDraftArray hardcodes
// `servicePackageID: null` unconditionally (AddUpdateProposal.jsx:22708),
// for every proposal type including Package, so forwarding whatever value
// GetQuoteModel happens to return here (as the old passthrough-only version
// of this function did) doesn't match the admin flow for a Package quote.
const toNullableNumber = (value) =>
  value === null || value === undefined || value === "" ? null : Number(value);

const normalizeModuleServicesGPDList = (moduleServicesGPDList) => {
  if (!Array.isArray(moduleServicesGPDList) || moduleServicesGPDList.length === 0) {
    return null;
  }

  return moduleServicesGPDList.map((driver) => ({
    driverValue: toNullableNumber(driver.driverValue),
    msgMapID: null,
    msMapID: null,
    globalPricingDriverID: driver.globalPricingDriverID,
    variationID: driver.variationID ?? null,
    slabID: driver.slabID ?? null,
    dateID: driver.dateID ?? null,
    textID: driver.textID ?? null,
    enteredText: driver.enteredText ?? null,
    enteredDate: driver.enteredDate ?? null,
    enteredDateFormat: driver.enteredDateFormat ?? null,
  }));
};

const normalizeSelectedServicesListFromQuoteModel = (selectedServicesList) => {
  if (!Array.isArray(selectedServicesList)) return selectedServicesList ?? null;

  return selectedServicesList.map((service) => ({
    driverValue: null,
    msMapID: null,
    serviceID: service.serviceID,
    proposedServiceName: service.proposedServiceName ?? null,
    serviceCatID: service.serviceCatID,
    serviceChargeTypeID: service.serviceChargeTypeID,
    servicePackageID: null,
    finalCalculatedServicePrice: toNullableNumber(
      service.finalCalculatedServicePrice,
    ),
    moduleServicesGPDList: normalizeModuleServicesGPDList(
      service.moduleServicesGPDList,
    ),
  }));
};

// isAmend: false counterpart to normalizeModuleServicesGPDList/
// normalizeSelectedServicesListFromQuoteModel above — same field
// projection/type coercion (AddUpdateQuote's accepted shape), but keeps
// each row's actual driverValue/msMapID/servicePackageID/msgMapID exactly
// as GetQuoteModel returned them instead of forcing them to null. Nulling
// those IDs so the backend assigns fresh ones only makes sense while
// actually submitting new/changed amendment data (see the comment above
// normalizeSelectedServicesListFromQuoteModel) — an unamended resubmission
// has nothing new to assign fresh IDs for, so the previously-saved IDs are
// preserved as-is.
const preserveModuleServicesGPDList = (moduleServicesGPDList) => {
  if (!Array.isArray(moduleServicesGPDList) || moduleServicesGPDList.length === 0) {
    return null;
  }

  return moduleServicesGPDList.map((driver) => ({
    driverValue: toNullableNumber(driver.driverValue),
    msgMapID: driver.msgMapID ?? null,
    msMapID: driver.msMapID ?? null,
    globalPricingDriverID: driver.globalPricingDriverID,
    variationID: driver.variationID ?? null,
    slabID: driver.slabID ?? null,
    dateID: driver.dateID ?? null,
    textID: driver.textID ?? null,
    enteredText: driver.enteredText ?? null,
    enteredDate: driver.enteredDate ?? null,
    enteredDateFormat: driver.enteredDateFormat ?? null,
  }));
};

const preserveSelectedServicesListFromQuoteModel = (selectedServicesList) => {
  if (!Array.isArray(selectedServicesList)) return selectedServicesList ?? null;

  return selectedServicesList.map((service) => ({
    driverValue: service.driverValue ?? null,
    msMapID: service.msMapID ?? null,
    serviceID: service.serviceID,
    proposedServiceName: service.proposedServiceName ?? null,
    serviceCatID: service.serviceCatID,
    serviceChargeTypeID: service.serviceChargeTypeID,
    servicePackageID: service.servicePackageID ?? null,
    finalCalculatedServicePrice: toNullableNumber(
      service.finalCalculatedServicePrice,
    ),
    moduleServicesGPDList: preserveModuleServicesGPDList(
      service.moduleServicesGPDList,
    ),
  }));
};

// GetQuoteModel's additionalInformationList is the row shape the Additional
// Information step edits (driverValue holding a selected variationID/slabID
// rather than its resolved price, plus msgMapID/msMapID from whatever prior
// save produced that row) — not what AddUpdateQuote accepts. Rebuilds it
// fresh from the step's own live list the same way AddUpdateProposal.jsx's
// modifiedAdditionalServiceArray does (AddUpdateProposal.jsx:22996-23072):
// resolve driverValue to the actual selected value, keep only the ID field
// that applies to this driver's type, and always send msgMapID/msMapID as
// null — the backend assigns real ones on save. Falls back to the
// GetQuoteModel passthrough when the live list isn't available (e.g. a
// proposal type with no Additional Information step at all).
const buildAdditionalInformationListForPayload = (
  additionalInformationList,
  // Both Custom Package only (see buildAdditionalInformationList below):
  {
    // When the live driverValue doesn't resolve to a real variation/slab
    // option — e.g. GetPricingFormulasGlobalPricingDrivers not reliably
    // returning the saved selection for one of Custom Package's
    // admin-locked default services, the same "corrupted default"
    // unreliability already worked around elsewhere for this endpoint (see
    // withDefaultDriverValues.js) — fall back to whichever option the API
    // still marks isDefault, exactly the value AddUpdateProposal.jsx's own
    // modifiedAdditionalServiceArray reads (AddUpdateProposal.jsx:23013-
    // 23031: it picks the isDefault-flagged slab/variation directly, rather
    // than resolving driverValue to an ID first). Service/Package never
    // pass this, so their behavior is unchanged.
    fallbackToIsDefaultOption = false,
    // withDefaultDriverValues.js already corrects this in the redux list
    // for a quantity driver (driverTypeID 2) whose driverValue came back
    // equal to its own globalPricingDriverID — the same "corrupted default"
    // GetPricingFormulasGlobalPricingDrivers quirk documented there — but
    // this function reads item.driverValue straight off the passed-in list
    // without re-checking, so a row that fetch never corrected (or a
    // caller that skipped it) can still leak globalPricingDriverID through
    // as driverValue into the payload. Re-applies the identical guard right
    // before it's sent.
    fixCorruptedQuantityDefault = false,
  } = {},
) => {
  if (!Array.isArray(additionalInformationList)) return additionalInformationList ?? null;

  return getVisibleAdditionalInformationItems(additionalInformationList).map(
    (item) => {
      let driverValue = null;
      let variationID = null;
      let slabID = null;
      let dateID = null;
      let textID = null;

      if (item.driverTypeID === 2) {
        const rawDriverValue =
          fixCorruptedQuantityDefault &&
          item.driverValue != null &&
          item.driverValue === item.globalPricingDriverID
            ? 0
            : item.driverValue;
        driverValue =
          rawDriverValue !== undefined &&
          rawDriverValue !== null &&
          rawDriverValue !== ""
            ? Number(rawDriverValue)
            : null;
      } else if (item.driverTypeID === 3) {
        variationID = item.driverValue ?? null;
        let matchedVariation = item.variation?.find(
          (option) => option.variationID === variationID,
        );
        if (!matchedVariation && fallbackToIsDefaultOption) {
          matchedVariation = item.variation?.find((option) => option.isDefault);
          if (matchedVariation) variationID = matchedVariation.variationID;
        }
        driverValue = matchedVariation?.variationValue ?? null;
      } else if (item.driverTypeID === 4) {
        slabID = item.driverValue ?? null;
        let matchedSlab = item.slab?.find((option) => option.slabID === slabID);
        if (!matchedSlab && fallbackToIsDefaultOption) {
          matchedSlab = item.slab?.find((option) => option.isDefault);
          if (matchedSlab) slabID = matchedSlab.slabID;
        }
        driverValue = matchedSlab?.slabValue ?? null;
      } else if (item.driverTypeID === 5) {
        const textBlock = item.text?.[0] ?? null;
        textID = textBlock?.textID ?? null;
        driverValue = textBlock?.textValue ?? null;
      } else if (item.driverTypeID === 6) {
        const dateBlock =
          item.date?.find((block) => block.isDefault) ?? item.date?.[0] ?? null;
        dateID = dateBlock?.dateID ?? null;
        driverValue = dateBlock?.dateValue ?? dateBlock?.defaultDateValue ?? null;
      }

      return {
        msgMapID: null,
        msMapID: null,
        globalPricingDriverID: item.globalPricingDriverID,
        driverValue,
        variationID,
        slabID,
        dateID,
        textID,
        enteredText: item.driverTypeID === 5 ? (item.enteredText ?? null) : null,
        enteredDate: item.driverTypeID === 6 ? (item.enteredDate ?? null) : null,
        enteredDateFormat:
          item.driverTypeID === 6 ? (item.enteredDateFormat ?? null) : null,
      };
    },
  );
};

// The live additionalInformationList redux list only ever carries drivers
// for services GetPricingFormulasGlobalPricingDrivers was actually asked
// about (ProposalAmendment.jsx's servicesIDs: selectedServiceIDs) — a
// Package-type quote never shows the Additional Information step at all
// (additionalInfoStepInserted is hardcoded false for it), so that live list
// has nothing visible in it; a Custom Package quote's admin-added default
// services (locked, outside the client's own selection) can likewise be
// missing from it. Either way buildAdditionalInformationListForPayload
// above then drops those drivers' rows from the payload entirely — even
// though GetQuoteModel's own additionalInformationList still has the real
// saved values for them (already close to the AddUpdateQuote row shape —
// just msgMapID/msMapID need nulling, like
// normalizeSelectedServicesListFromQuoteModel does for selectedServicesList).
const normalizeAdditionalInformationListFromQuoteModel = (
  additionalInformationList,
  // Custom Package only — see the matching flag on
  // buildAdditionalInformationListForPayload. This passthrough's rows carry
  // no driverTypeID to branch on, but a quantity-type row is the only kind
  // with none of variationID/slabID/dateID/textID set, so that absence is
  // used as the same signal here: if driverValue still equals this row's
  // own globalPricingDriverID (the corrupted-default GetPricingFormulas
  // GlobalPricingDrivers quirk, persisted from a prior save that went out
  // uncorrected), reset it to 0 instead of forwarding the corrupted value.
  { fixCorruptedQuantityDefault = false } = {},
) => {
  if (!Array.isArray(additionalInformationList)) {
    return additionalInformationList ?? null;
  }

  return additionalInformationList.map((item) => {
    const isPlainValueRow =
      item.variationID == null &&
      item.slabID == null &&
      item.dateID == null &&
      item.textID == null;
    const rawDriverValue =
      fixCorruptedQuantityDefault &&
      isPlainValueRow &&
      item.driverValue != null &&
      item.driverValue === item.globalPricingDriverID
        ? 0
        : item.driverValue;

    return {
      msgMapID: null,
      msMapID: null,
      globalPricingDriverID: item.globalPricingDriverID,
      driverValue: toNullableNumber(rawDriverValue) ?? rawDriverValue ?? null,
      variationID: item.variationID ?? null,
      slabID: item.slabID ?? null,
      dateID: item.dateID ?? null,
      textID: item.textID ?? null,
      enteredText: item.enteredText ?? null,
      enteredDate: item.enteredDate ?? null,
      enteredDateFormat: item.enteredDateFormat ?? null,
    };
  });
};

// isAmend: false counterpart to normalizeAdditionalInformationListFromQuoteModel
// above — same field projection, but keeps each row's actual msgMapID/
// msMapID exactly as GetQuoteModel returned them instead of forcing them to
// null (see preserveSelectedServicesListFromQuoteModel's comment for why).
// No fixCorruptedQuantityDefault correction either: that fix exists to
// repair a value the live redux state disagrees with, which only matters
// while actually submitting a live-derived amendment — an unamended
// resubmission has no live-derived value to compare against, so the saved
// driverValue is forwarded exactly as GetQuoteModel returned it.
const preserveAdditionalInformationListFromQuoteModel = (
  additionalInformationList,
) => {
  if (!Array.isArray(additionalInformationList)) {
    return additionalInformationList ?? null;
  }

  return additionalInformationList.map((item) => ({
    msgMapID: item.msgMapID ?? null,
    msMapID: item.msMapID ?? null,
    globalPricingDriverID: item.globalPricingDriverID,
    driverValue: toNullableNumber(item.driverValue) ?? item.driverValue ?? null,
    variationID: item.variationID ?? null,
    slabID: item.slabID ?? null,
    dateID: item.dateID ?? null,
    textID: item.textID ?? null,
    enteredText: item.enteredText ?? null,
    enteredDate: item.enteredDate ?? null,
    enteredDateFormat: item.enteredDateFormat ?? null,
  }));
};

// Merges the live-rebuilt rows (fresher — reflect whatever the client just
// edited) with GetQuoteModel's own saved rows (normalized), keyed by
// globalPricingDriverID: a driver present in both takes the live version; a
// driver GetQuoteModel has that the live fetch never covered (see the
// comment above normalizeAdditionalInformationListFromQuoteModel) is kept
// from the saved copy instead of being silently dropped; a driver only the
// live list has (freshly added) is appended as-is.
const mergeAdditionalInformationLists = (
  liveList,
  quoteModelList,
  { fixCorruptedQuantityDefault = false } = {},
) => {
  const passthroughList =
    normalizeAdditionalInformationListFromQuoteModel(quoteModelList, {
      fixCorruptedQuantityDefault,
    }) || [];
  const liveByDriverID = new Map(
    (liveList || []).map((item) => [item.globalPricingDriverID, item]),
  );

  const merged = passthroughList.map(
    (item) => liveByDriverID.get(item.globalPricingDriverID) ?? item,
  );

  const passthroughDriverIDs = new Set(
    passthroughList.map((item) => item.globalPricingDriverID),
  );
  (liveList || []).forEach((item) => {
    if (!passthroughDriverIDs.has(item.globalPricingDriverID)) {
      merged.push(item);
    }
  });

  return merged;
};

// Dispatches additionalInformationList building by proposal type — Service
// is unchanged: rebuilds purely from the Additional Information step's live
// list (buildAdditionalInformationListForPayload), same as before. Package
// is also unchanged from its own existing fix: always the normalized
// GetQuoteModel passthrough, never the live list — its
// additionalInfoStepInserted is hardcoded false (the client never sees this
// step, so there's nothing to merge from a live edit), and its live redux
// list isn't verified to always be empty in practice, so merging it in
// could resurface the exact driverValue-corruption bug
// fixCorruptedQuantityDefault exists to fix (a fix Package doesn't get,
// since its own consumer never showed the gap). Only Custom Package merges
// the live list with GetQuoteModel's saved one (see
// mergeAdditionalInformationLists above), since it's the one type that can
// have drivers — an admin-added, locked default service among them — the
// live fetch's scope never covers.
//
// isAmend (defaults to true — see buildAddUpdateQuotePayload's matching
// default) gates all of the above: those branches all null out msgMapID/
// msMapID (directly, or via buildAdditionalInformationListForPayload/
// normalizeAdditionalInformationListFromQuoteModel), which is only correct
// while actually submitting new/changed amendment data. An unamended
// Service/Custom Package proposal, and Package's always-unamended one, use
// preserveAdditionalInformationListFromQuoteModel instead — the plain
// GetQuoteModel passthrough with those IDs left exactly as returned.
const buildAdditionalInformationList = ({
  quoteModel,
  additionalInformationList,
  quoteModelAdditionalInformationList,
  isAmend = true,
}) => {
  if (!isAmend) {
    return preserveAdditionalInformationListFromQuoteModel(
      quoteModelAdditionalInformationList,
    );
  }

  if (quoteModel?.quoteTypeID === QUOTE_TYPE_ID.Package) {
    return normalizeAdditionalInformationListFromQuoteModel(
      quoteModelAdditionalInformationList,
    );
  }

  if (quoteModel?.quoteTypeID === QUOTE_TYPE_ID.CustomPackage) {
    const liveList = additionalInformationList
      ? buildAdditionalInformationListForPayload(additionalInformationList, {
          fallbackToIsDefaultOption: true,
          fixCorruptedQuantityDefault: true,
        })
      : [];
    return mergeAdditionalInformationLists(
      liveList,
      quoteModelAdditionalInformationList,
      { fixCorruptedQuantityDefault: true },
    );
  }

  return additionalInformationList
    ? buildAdditionalInformationListForPayload(additionalInformationList)
    : quoteModelAdditionalInformationList;
};

// Mirrors AddUpdateProposal.jsx's own submit-time rebuild of
// quoteAdditionalServicesInPackages (AddUpdateProposal.jsx:22721-22737):
// {serviceID, serviceCatID, serviceChargeTypeID, servicePackageIDs} for
// every currently-selected service flagged isAdditionalService. A
// Package-scoped services fetch sets isAdditionalService = !isDisabled on
// every row it returns (AddUpdateProposal.jsx:20419-20424) — there's no
// separate isAdditionalService field on the web proposal's own services
// catalog response, so it's derived the same way from each service
// definition's own isDisabled flag here.
//
// servicePackageIDs differs by type, because admin's own two
// package-pricing consumers build it differently:
//   - Standard Package (GetCalculatedServicesPriceByPackagesData,
//     AddUpdateProposal.jsx:19011-19073) — left untouched here, out of
//     scope for this fix.
//   - Custom Package (GetCalculatedServicesPriceData,
//     AddUpdateProposal.jsx:17829-17849, repeated at 17858+/17908+): for
//     service.isAdditionalService (a client-added, non-locked service —
//     matched here by !isDisabled), servicePackageIDs is NOT recomputed
//     from live pricing data at all. serviceMappingWithPackagesList only
//     ever carries the admin's own package cross-join rows (the package's
//     pre-configured default services), so a client addition structurally
//     never has a row there — filtering it for one always returns [],
//     which is exactly the bug being fixed here. Admin instead reads
//     straight off this quote's own previously-saved
//     quoteAdditionalServicesInPackages (QuotationAdditionalServices,
//     seeded from ModelData.quoteAdditionalServicesInPackages at
//     AddUpdateProposal.jsx:21732-21734), matched by serviceID +
//     serviceChargeTypeID — i.e. whichever package(s) this addition was
//     already assigned to on a prior save, carried forward as-is. Falls
//     back to [] when there's no prior saved entry (a service the client
//     just added this session, never saved before).
const buildQuoteAdditionalServicesInPackages = ({
  quoteTypeID,
  recurringSelections,
  oneOffSelections,
  recurringServices,
  oneOffServices,
  servicePackageID,
  savedQuoteAdditionalServicesInPackages,
}) => {
  const recurringDefs = buildServiceDefMap(recurringServices);
  const oneOffDefs = buildServiceDefMap(oneOffServices);
  const isCustomPackage = quoteTypeID === QUOTE_TYPE_ID.CustomPackage;

  const savedList = Array.isArray(savedQuoteAdditionalServicesInPackages)
    ? savedQuoteAdditionalServicesInPackages
    : [];
  // Standard Package: every additional service belongs to every package
  // this quote has configured (see the comment above) — unchanged from
  // before this function grew a Custom Package branch.
  const standardPackageServicePackageIDs = Array.isArray(servicePackageID)
    ? servicePackageID
    : [];

  const membershipFor = (serviceID, serviceChargeTypeID) =>
    isCustomPackage
      ? (savedList.find(
          (row) =>
            row.serviceID === serviceID &&
            Number(row.serviceChargeTypeID) === serviceChargeTypeID,
        )?.servicePackageIDs ?? [])
      : standardPackageServicePackageIDs;

  const buildRows = (selections, defs, serviceChargeTypeID) =>
    Object.values(selections || {})
      .filter((selection) => !defs.get(selection.serviceID)?.isDisabled)
      .map((selection) => ({
        serviceID: selection.serviceID,
        serviceCatID: selection.serviceCatID,
        serviceChargeTypeID,
        servicePackageIDs: membershipFor(selection.serviceID, serviceChargeTypeID),
      }));

  return [
    ...buildRows(recurringSelections, recurringDefs, 1),
    ...buildRows(oneOffSelections, oneOffDefs, 2),
  ];
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
// from what the client actually entered on the Input Fields step. Package
// selection data and everything not called out below is left exactly as
// GetQuoteModel returned it. selectedServicesList is rebuilt from the
// client's live selections when selectedServicesListOverride is supplied
// (Service-based/Custom Package Amendment — see
// buildSelectedServicesListFromSelections); every other caller instead gets
// the GetQuoteModel copy re-shaped by
// normalizeSelectedServicesListFromQuoteModel, since that raw copy isn't in
// the shape/types AddUpdateQuote accepts either. additionalInformationList
// is always rebuilt from the Additional Information step's own live list
// (see buildAdditionalInformationListForPayload) when that list is passed
// in — every caller has one available, since GetQuoteModel's copy uses a
// different row shape AddUpdateQuote doesn't accept. quotationFinalAmountList
// and pricingVariablesList are both rebuilt per proposal type (see
// buildQuotationFinalAmountList and buildPricingVariablesList): Service
// recomputes from the live selections/pricing; Package and Custom Package
// both rebuild pricingVariablesList from the existing quotationFinalAmountList
// (left untouched itself) plus servicePackageList; any other/unrecognised
// type keeps the plain passthrough. ServiceMappingWithPackagesList is
// likewise preferred live over the GetQuoteModel passthrough when supplied
// (see the comment above that assignment). serviceSelectionsForTotals
// ({recurringSelections, oneOffSelections, pricing, currencyID,
// servicePackageList, serviceMappingWithPackagesList}) supplies the live
// data these rebuilds need — Service only reads the first four,
// Package/Custom Package only read servicePackageList and
// serviceMappingWithPackagesList — so a caller can omit whichever fields
// its proposal type never needs.
//
// isAmend (defaults to true so callers that never pass it — the
// non-Amendment Accept/Save flows in ProposalInputForm.jsx — keep their
// existing behavior unchanged) additionally gates selectedServicesList,
// additionalInformationList, and the Service-type quotationFinalAmountList
// rebuild: an unamended Service/Custom Package Amendment (client changed
// nothing from the admin defaults) has nothing to rebuild, so those three
// use the plain GetQuoteModel-sourced values (IDs preserved, not nulled —
// see preserveSelectedServicesListFromQuoteModel/
// preserveAdditionalInformationListFromQuoteModel) with the caller expected
// to pass isAmend: false and no selectedServicesListOverride in that case.
// pricingVariablesList is the one exception — see the comment on
// buildPricingVariablesList for why it always rebuilds regardless of
// isAmend.
export const buildAddUpdateQuotePayload = (
  quoteModel,
  inputFieldsList,
  selectedServicesListOverride,
  additionalInformationList,
  serviceSelectionsForTotals,
  isAmend = true,
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
  // pricingVariablesList's non-null default is applied by
  // buildPricingVariablesList below instead (it also rebuilds this list for
  // a Service-type quote), so no separate fallback is needed here.
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

  // ServiceMappingWithPackagesList's admin-side source genuinely differs by
  // type, verified against AddUpdateProposal.jsx directly:
  //   - Standard Package: its ServiceMappingWithPackagesList state is only
  //     ever populated inside GetCalculatedServicesPriceByPackagesData
  //     (selectedProposalTypeValue === 2), from that response's own
  //     serviceMappingWithPackagesList, frequency-rescaled
  //     (AddUpdateProposal.jsx:19520-19559) — always this quote's current
  //     pricing-engine output, never a stale saved one. Sent as-is at
  //     AddUpdateProposal.jsx:23170.
  //   - Custom Package: GetCalculatedServicesPriceData (the consumer used
  //     for selectedProposalTypeValue === 4 — see priceForSelectedPackage's
  //     comment in ProposalPricingTableStep.jsx) never calls
  //     setServiceMappingWithPackagesList at all (that call only exists,
  //     commented out, inside the Standard Package function at
  //     AddUpdateProposal.jsx:18898). The state stays at its useState([])
  //     initial value for the whole Custom Package flow, so
  //     AddUpdateProposal.jsx:23170 genuinely sends [] for Custom Package,
  //     regardless of what the live pricing response's own
  //     serviceMappingWithPackagesList contains.
  // Package (and Service, which never populates this at all) keep preferring
  // the live list over the GetQuoteModel passthrough, same as before; Custom
  // Package always sends [] to match.
  payload.ServiceMappingWithPackagesList =
    quoteModel?.quoteTypeID === QUOTE_TYPE_ID.CustomPackage
      ? []
      : Array.isArray(serviceSelectionsForTotals?.serviceMappingWithPackagesList)
        ? serviceSelectionsForTotals.serviceMappingWithPackagesList
        : Array.isArray(quoteModel.serviceMappingWithPackagesList)
          ? quoteModel.serviceMappingWithPackagesList
          : [];

  payload.globalPricingDriverIDsWithValues =
    buildGlobalPricingDriverIDsWithValues(quoteModel, inputFieldsList);

  payload.additionalInformationList = buildAdditionalInformationList({
    quoteModel,
    additionalInformationList,
    quoteModelAdditionalInformationList: payload.additionalInformationList,
    isAmend,
  });

  // isAmend gates which normalization is used for the non-override path
  // too: true (and no override — the non-Amendment Accept/Save callers)
  // keeps the existing null-heavy normalizeSelectedServicesListFromQuoteModel
  // behavior unchanged; false (an unamended Amendment) preserves the actual
  // GetQuoteModel IDs via preserveSelectedServicesListFromQuoteModel instead
  // of nulling them.
  payload.selectedServicesList =
    isAmend && selectedServicesListOverride
      ? selectedServicesListOverride
      : isAmend
        ? normalizeSelectedServicesListFromQuoteModel(payload.selectedServicesList)
        : preserveSelectedServicesListFromQuoteModel(payload.selectedServicesList);

  payload.quotationFinalAmountList = buildQuotationFinalAmountList({
    quoteModel,
    recurringSelections: serviceSelectionsForTotals?.recurringSelections,
    oneOffSelections: serviceSelectionsForTotals?.oneOffSelections,
    pricing: serviceSelectionsForTotals?.pricing,
    vatPercentage: serviceSelectionsForTotals?.vatPercentage,
    isAmend,
  });

  // AddUpdateProposal.jsx's quoteAdditionalServicesInPackages is built by
  // filtering on service.isAdditionalService (AddUpdateProposal.jsx:22721-
  // 22737) — a flag only ever set (true or false) while fetching a
  // package-scoped service list (AddUpdateProposal.jsx:20419-20424), so it's
  // always undefined for a Service-type proposal and the filter naturally
  // empties out to []. GetQuoteModel doesn't apply that same rule to what it
  // returns here, so a Service-type quote's row can still come back
  // non-empty — force it to [] to match, same as the admin flow always does
  // for this proposal type.
  //
  // Package and Custom Package both rebuild it live from the current
  // selections the same way admin does at submit time, instead of
  // forwarding GetQuoteModel's stale saved copy — see
  // buildQuoteAdditionalServicesInPackages for how servicePackageIDs is
  // sourced for each (Package: unchanged, out of scope; Custom Package:
  // carried forward from this quote's own previously-saved
  // quoteAdditionalServicesInPackages).
  if (quoteModel?.quoteTypeID === QUOTE_TYPE_ID.Service) {
    payload.quoteAdditionalServicesInPackages = [];
  } else if (
    quoteModel?.quoteTypeID === QUOTE_TYPE_ID.Package ||
    quoteModel?.quoteTypeID === QUOTE_TYPE_ID.CustomPackage
  ) {
    payload.quoteAdditionalServicesInPackages =
      buildQuoteAdditionalServicesInPackages({
        quoteTypeID: quoteModel.quoteTypeID,
        recurringSelections: serviceSelectionsForTotals?.recurringSelections,
        oneOffSelections: serviceSelectionsForTotals?.oneOffSelections,
        recurringServices: serviceSelectionsForTotals?.recurringServices,
        oneOffServices: serviceSelectionsForTotals?.oneOffServices,
        servicePackageID: payload.servicePackageID,
        // GetQuoteModel's own saved copy — mirrors admin's
        // QuotationAdditionalServices, itself seeded from
        // ModelData.quoteAdditionalServicesInPackages
        // (AddUpdateProposal.jsx:21732-21734).
        savedQuoteAdditionalServicesInPackages:
          quoteModel?.quoteAdditionalServicesInPackages,
      });
  }

  payload.pricingVariablesList = buildPricingVariablesList({
    quoteModel,
    quotationFinalAmountRows: payload.quotationFinalAmountList,
    recurringSelections: serviceSelectionsForTotals?.recurringSelections,
    oneOffSelections: serviceSelectionsForTotals?.oneOffSelections,
    pricing: serviceSelectionsForTotals?.pricing,
    currencyID: serviceSelectionsForTotals?.currencyID,
    servicePackageList: serviceSelectionsForTotals?.servicePackageList,
  });

  return payload;
};
