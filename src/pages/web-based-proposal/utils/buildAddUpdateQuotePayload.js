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
    const vatPercentage = existingRow?.vatPercentage ?? null;

    const discounted = (netTotal * discountPercentage) / 100;
    const discountedTotal = netTotal - discounted;
    const vat =
      vatPercentage == null ? null : (discountedTotal * Number(vatPercentage)) / 100;
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
// here.
export const buildQuotationFinalAmountList = ({
  quoteModel,
  recurringSelections,
  oneOffSelections,
  pricing,
}) => {
  if (quoteModel?.quoteTypeID === QUOTE_TYPE_ID.Service) {
    return buildQuotationFinalAmountListForServiceType({
      quoteModel,
      recurringSelections,
      oneOffSelections,
      pricing,
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

// Dispatches pricingVariablesList building by proposal type — same split as
// buildQuotationFinalAmountList: only a Service-type quote's totals/service
// list can go stale from a client Services-step edit, so only that type is
// rebuilt here; Package/Custom Package keep the quoteModel passthrough.
export const buildPricingVariablesList = ({
  quoteModel,
  quotationFinalAmountRows,
  recurringSelections,
  oneOffSelections,
  pricing,
  currencyID,
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
// buildAdditionalInformationListForPayload already do.
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
    servicePackageID: service.servicePackageID ?? null,
    finalCalculatedServicePrice: toNullableNumber(
      service.finalCalculatedServicePrice,
    ),
    moduleServicesGPDList: normalizeModuleServicesGPDList(
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
const buildAdditionalInformationListForPayload = (additionalInformationList) => {
  if (!Array.isArray(additionalInformationList)) return additionalInformationList ?? null;

  return getVisibleAdditionalInformationItems(additionalInformationList).map(
    (item) => {
      let driverValue = null;
      let variationID = null;
      let slabID = null;
      let dateID = null;
      let textID = null;

      if (item.driverTypeID === 2) {
        driverValue =
          item.driverValue !== undefined &&
          item.driverValue !== null &&
          item.driverValue !== ""
            ? Number(item.driverValue)
            : null;
      } else if (item.driverTypeID === 3) {
        variationID = item.driverValue ?? null;
        driverValue =
          item.variation?.find(
            (option) => option.variationID === variationID,
          )?.variationValue ?? null;
      } else if (item.driverTypeID === 4) {
        slabID = item.driverValue ?? null;
        driverValue =
          item.slab?.find((option) => option.slabID === slabID)?.slabValue ??
          null;
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
// buildQuotationFinalAmountList and buildPricingVariablesList — same split:
// only a Service-type quote recomputes, everything else keeps the
// quoteModel passthrough); serviceSelectionsForTotals
// ({recurringSelections, oneOffSelections, pricing, currencyID}) supplies
// the live data those rebuilds need and is only read for a Service-type
// quote, so every other caller can omit it.
export const buildAddUpdateQuotePayload = (
  quoteModel,
  inputFieldsList,
  selectedServicesListOverride,
  additionalInformationList,
  serviceSelectionsForTotals,
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

  payload.additionalInformationList = additionalInformationList
    ? buildAdditionalInformationListForPayload(additionalInformationList)
    : payload.additionalInformationList;

  payload.selectedServicesList = selectedServicesListOverride
    ? selectedServicesListOverride
    : normalizeSelectedServicesListFromQuoteModel(payload.selectedServicesList);

  payload.quotationFinalAmountList = buildQuotationFinalAmountList({
    quoteModel,
    recurringSelections: serviceSelectionsForTotals?.recurringSelections,
    oneOffSelections: serviceSelectionsForTotals?.oneOffSelections,
    pricing: serviceSelectionsForTotals?.pricing,
  });

  // AddUpdateProposal.jsx's quoteAdditionalServicesInPackages is built by
  // filtering on service.isAdditionalService (AddUpdateProposal.jsx:22721-
  // 22737) — a flag only ever set (true or false) while fetching a
  // package-scoped service list (AddUpdateProposal.jsx:20419-20424), so it's
  // always undefined for a Service-type proposal and the filter naturally
  // empties out to []. GetQuoteModel doesn't apply that same rule to what it
  // returns here, so a Service-type quote's row can still come back
  // non-empty — force it to [] to match, same as the admin flow always
  // does for this proposal type. Package/Custom Package quotes keep the
  // quoteModel passthrough untouched.
  if (quoteModel?.quoteTypeID === QUOTE_TYPE_ID.Service) {
    payload.quoteAdditionalServicesInPackages = [];
  }

  payload.pricingVariablesList = buildPricingVariablesList({
    quoteModel,
    quotationFinalAmountRows: payload.quotationFinalAmountList,
    recurringSelections: serviceSelectionsForTotals?.recurringSelections,
    oneOffSelections: serviceSelectionsForTotals?.oneOffSelections,
    pricing: serviceSelectionsForTotals?.pricing,
    currencyID: serviceSelectionsForTotals?.currencyID,
  });

  return payload;
};
