import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Loader2, Repeat, Package } from "lucide-react";

import { selectQuoteModel } from "../../../redux/reducer/webProposal";
import {
  selectRecurringServices,
  selectOneOffServices,
  selectRecurringSelections,
  selectOneOffSelections,
  selectDefaultRecurringSelections,
  selectDefaultOneOffSelections,
  selectServicesPricing,
  selectServicesPricingLoading,
  selectServicesPricingError,
  selectServicesVatPercentage,
  selectServicesCurrencyID,
  selectServiceMappingWithPackagesList,
  selectServicesPackageList,
  getCalculatedServicesPriceByPackages,
} from "../../../redux/reducer/webProposal/services";
import {
  selectAdditionalInformationList,
  selectDefaultAdditionalInformationList,
  getAdditionalInformationFieldErrors,
  buildAdditionalInformationDriverEntries,
  additionalInformationEntriesMatch,
} from "../../../redux/reducer/webProposal/additionalInformation";
import { validateSelectionsMap } from "./ProposalServicesStep/utils/validateSelectionFields";
import { QUOTE_TYPE_ID } from "../../../Middleware/enums";

const CURRENCY_SYMBOLS = { 1: "£", 2: "€", 3: "$", 4: "₹" };

const SERVICE_CHARGE_TYPE_ID = { RECURRING: 1, ONE_OFF: 2 };

// quoteModel.paymentFrequencyID: 1 Yearly, 2 HalfYearly, 3 Quarterly, 4
// Monthly.
const PAYMENT_FREQUENCY_LABEL = {
  1: "Yearly",
  2: "Half-Yearly",
  3: "Quarterly",
  4: "Monthly",
};
// Sent as GetValueOf on GetCalculatedServicesPriceByPackages, exactly mirroring
// AddUpdateProposal.jsx's handleSetCalculatedPackageData/handleCalculatedData
// switch on ProposalObject.Payment_Frequency — the backend, not the client,
// scales the recurring price down to this billing period.
const GET_VALUE_OF_BY_FREQUENCY = {
  1: "Yearly",
  2: "HalfYearly",
  3: "Quarterly",
  4: "Monthly",
};

// serviceID is only unique within a charge type (recurring vs one-off share
// the same ID space), so lookups must key on both — otherwise a one-off
// price entry can be shadowed by a recurring entry with the same serviceID.
const priceKey = (serviceChargeTypeID, serviceID) =>
  `${serviceChargeTypeID}_${serviceID}`;

// Groups a charge type's selected items under their category, preserving
// each category's first-appearance order and each item's selection order.
const groupByCategory = (items) => {
  const groups = new Map();

  items.forEach((item) => {
    const key = item.serviceCatID ?? item.categoryName;
    if (!groups.has(key)) {
      groups.set(key, {
        serviceCatID: item.serviceCatID,
        categoryName: item.categoryName || "Other",
        items: [],
      });
    }
    groups.get(key).items.push(item);
  });

  return Array.from(groups.values());
};

// Reduces a selections map down to just what determines its price (which
// services are picked and the driver values chosen for each), so selections
// that differ only by object identity/order still compare equal.
const normalizeSelectionsForCompare = (selections) =>
  Object.values(selections || {})
    .map((selection) => ({
      serviceID: selection.serviceID,
      driverValues: Object.fromEntries(
        Object.entries(selection.driverValues || {}).map(([key, entry]) => [
          key,
          entry?.value ?? null,
        ]),
      ),
    }))
    .sort((a, b) => String(a.serviceID).localeCompare(String(b.serviceID)));

const selectionsMatch = (current, defaults) =>
  JSON.stringify(normalizeSelectionsForCompare(current)) ===
  JSON.stringify(normalizeSelectionsForCompare(defaults));

const buildServiceDefMap = (categories) => {
  const map = new Map();
  (categories || []).forEach((category) => {
    (category.servicesList || []).forEach((service) =>
      map.set(service.serviceID, service),
    );
  });

  return map;
};

// Turns one selected service (+ the driver values the user chose for it)
// into the row shape GetCalculatedServicesPriceByPackages expects. Mirrors
// the equivalent logic in AddUpdateProposal.jsx's extractServiceData, but
// reads the *chosen* driver value instead of always the default one.
const buildDriverEntries = (selection, serviceDef, serviceChargeTypeID) => {
  const allDrivers = serviceDef?.pricingDriverList || [];
  const visibleDrivers = allDrivers.filter((driver) => driver.driverVisibility);

  const base = {
    serviceID: selection.serviceID,
    serviceChargeTypeID,
    serviceCatID: selection.serviceCatID,
    textID: null,
    dateID: null,
  };

  // A service with no pricing drivers at all still needs one row so the
  // backend has something to price it against.
  if (allDrivers.length === 0) {
    return [
      {
        ...base,
        globalPricingDriverID: null,
        driverValue: null,
        variationID: null,
        slabID: null,
      },
    ];
  }

  // Every driver here is hidden (driverVisibility: false) because it's a
  // global pricing driver captured on the separate Additional Information
  // step instead — additionalDriverEntries supplies its row. Emitting a
  // driverValue: null placeholder here as well would send a second,
  // conflicting row for the same service and shadow that real value.
  if (visibleDrivers.length === 0) {
    return [];
  }

  return visibleDrivers.map((driver) => {
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
      ...base,
      globalPricingDriverID: driver.globalPricingDriverID,
      driverValue,
      variationID,
      slabID,
    };
  });
};

const applyVat = (netTotal, vatPercentage) => {
  const vatAmount = (netTotal * (Number(vatPercentage) || 0)) / 100;
  return { vatAmount, grandTotal: netTotal + vatAmount };
};

// For Package/Custom Package quotes, GetCalculatedServicesPriceByPackages
// doesn't return a plain `price` per service — it returns a value per
// *package slot* (packageOneValue/packageTwoValue/packageThreeValue), each
// tagged with which package landed in that slot (packageOneID/Two/Three).
// A service's real price is whichever slot value(s) it's actually a member
// of (item.servicePackageIDs), mirroring AddUpdateProposal.jsx's package-
// membership gate (`servicePackageIDs.includes(packageXID)`) rather than
// just checking the value is non-null. Summed across slots in case a quote
// ever has more than one selected package.
const PACKAGE_PRICE_SLOTS = [
  { idKey: "packageOneID", valueKey: "packageOneValue" },
  { idKey: "packageTwoID", valueKey: "packageTwoValue" },
  { idKey: "packageThreeID", valueKey: "packageThreeValue" },
];

const packagePriceForItem = (item) => {
  const membership = (item.servicePackageIDs || []).map(String);
  return PACKAGE_PRICE_SLOTS.reduce((sum, { idKey, valueKey }) => {
    const slotID = item[idKey];
    if (slotID === null || slotID === undefined) return sum;
    return membership.includes(String(slotID))
      ? sum + (Number(item[valueKey]) || 0)
      : sum;
  }, 0);
};

// Standard "Package" quotes (QUOTE_TYPE_ID.Package) are priced differently
// from Custom Package in AddUpdateProposal.jsx: Review Packages' Recurring/
// One-Off Services for this type come from GetCalculatedServicesPriceByPackages
// Data, which does NOT trust the flat packageOneValue/Two/ThreeValue on a
// pricing item — those are only used as the *package ID* to cross-join
// against `serviceMappingWithPackagesList` (one row per service per
// currently-selected package: {servicePackageID, serviceID, serviceCatID,
// serviceChargeTypeID, price}). The matched row's own `price` is the real
// per-package value, and a service's package membership is rebuilt from
// which servicePackageIDs actually have a matching row for it — not from the
// pricing item's own servicePackageIDs field. Custom Package keeps using
// packagePriceForItem above (GetCalculatedServicesPriceData/
// handleSetCalculatedPackageData never does this cross-join).
const packagePriceViaMapping = (item, serviceMappingWithPackagesList) => {
  const rows = (serviceMappingWithPackagesList || []).filter(
    (row) =>
      row.serviceID === item.serviceID &&
      row.serviceCatID === item.serviceCatID &&
      Number(row.serviceChargeTypeID) === Number(item.serviceChargeTypeID),
  );
  const membership = rows.map((row) => String(row.servicePackageID));

  return PACKAGE_PRICE_SLOTS.reduce((sum, { idKey }) => {
    const slotID = item[idKey];
    if (slotID === null || slotID === undefined) return sum;
    if (!membership.includes(String(slotID))) return sum;

    const match = rows.find(
      (row) => String(row.servicePackageID) === String(slotID),
    );
    return sum + (Number(match?.price) || 0);
  }, 0);
};

// Per-service, per-package price for the multi-package column display (as
// opposed to packagePriceForItem/packagePriceViaMapping above, which sum
// across every package slot a service belongs to for the combined Net
// Total). Returns null — rendered as "—" — when the service isn't part of
// that particular package, instead of an amount.
const priceForServicePackageSlot = (
  item,
  packageID,
  isStandardPackage,
  serviceMappingWithPackagesList,
) => {
  if (!item) return null;
  const slot = PACKAGE_PRICE_SLOTS.find(
    ({ idKey }) =>
      item[idKey] !== null && String(item[idKey]) === String(packageID),
  );
  if (!slot) return null;

  if (isStandardPackage) {
    const match = (serviceMappingWithPackagesList || []).find(
      (row) =>
        row.serviceID === item.serviceID &&
        row.serviceCatID === item.serviceCatID &&
        Number(row.serviceChargeTypeID) === Number(item.serviceChargeTypeID) &&
        String(row.servicePackageID) === String(packageID),
    );
    return match ? Number(match.price) || 0 : null;
  }

  const membership = (item.servicePackageIDs || []).map(String);
  if (!membership.includes(String(packageID))) return null;
  return Number(item[slot.valueKey]) || 0;
};

// A charge type's Calculation-card figures. When the selections still match
// the quote's hydrated defaults, the stored final amount (with whatever
// discount it already carries) is shown as-is. Otherwise a live recompute is
// needed, and the discount % applied to it differs by proposal type:
//   - Service (isPackageBased: false): an Amendment proposal where the
//     client has swapped out the default services — the discount to show
//     depends on which way the new total moved relative to what they were
//     originally quoted (defaultFinalAmount):
//       - lower total: the original discount no longer applies (it was
//         priced against the higher default total), so the amendment's
//         pre-agreed discount percentage is applied to the new total instead.
//       - higher/equal total: the admin's originally agreed discount
//         percentage still applies, even though the underlying services
//         changed.
//     Either way a note explains why the discount shown differs from the
//     default quote's.
//   - Package/Custom Package (isPackageBased: true): there is no "amendment"
//     concept here — the package's own agreed discount percentage always
//     applies to the live total, regardless of whether it moved above or
//     below the default. No branching, no note.
const buildChargeTypeTotals = ({
  finalAmount,
  defaultFinalAmount,
  liveNetTotal,
  liveVatAmount,
  liveGrandTotal,
  vatPercentage,
  amendmentDiscountPercentage,
  adminDiscountPercentage,
  chargeTypeLabel,
  isPackageBased,
}) => {
  if (finalAmount) {
    const storedDiscountPercentage =
      Number(finalAmount.discountPercentageWithAllDecimal) || 0;
    const storedNetTotal = Number(finalAmount.netTotal) || 0;
    // For a surcharge (negative %), the stored `discounted` field mirrors
    // AddUpdateProposal.jsx's GetNetTotalValueByRecurringPackage, which only
    // ever populates its discountAmount variable in the positive-discount
    // branch — the negative branch computes a separate addOnValue that never
    // gets persisted back into `discounted`. Recompute from the percentage
    // instead of trusting the persisted (always-0) value so the surcharge
    // amount actually displays; discountedTotal/grandTotal are unaffected
    // since those were already correctly persisted including the addOn.
    const discountAmount =
      storedDiscountPercentage < 0
        ? (storedNetTotal * storedDiscountPercentage) / 100
        : Number(finalAmount.discounted) || 0;

    return {
      netTotal: storedNetTotal,
      discountPercentage: storedDiscountPercentage,
      discountAmount,
      discountedTotal: Number(finalAmount.discountedTotal) || 0,
      vatAmount: Number(finalAmount.vat) || 0,
      grandTotal: Number(finalAmount.grandTotal) || 0,
      note: null,
    };
  }

  let discountPercentage = 0;
  let note = null;

  if (isPackageBased) {
    // Mirrors AddUpdateProposal.jsx's GetNetTotalValueByRecurringPackage: a
    // negative package discount percentage is a surcharge (raises the
    // total), not a discount to ignore — gating on `> 0` here silently
    // dropped it instead of letting the discountAmount/discountedTotal math
    // below apply it (a negative % naturally produces a negative
    // discountAmount, which is exactly the surcharge admin computes).
    if (Number(adminDiscountPercentage)) {
      discountPercentage = Number(adminDiscountPercentage);
    }
  } else {
    const defaultNetTotal = Number(defaultFinalAmount?.netTotal) || 0;
    const hasDefault = !!defaultFinalAmount;

    if (
      hasDefault &&
      liveNetTotal < defaultNetTotal &&
      Number(amendmentDiscountPercentage) > 0
    ) {
      discountPercentage = Number(amendmentDiscountPercentage);
      note = `Updated ${chargeTypeLabel} services total less than the originally agreed amount, so the original discount no longer applies and the ${discountPercentage.toFixed(2)}% amendment discount has been applied instead.`;
    } else if (
      hasDefault &&
      liveNetTotal >= defaultNetTotal &&
      Number(adminDiscountPercentage) > 0
    ) {
      discountPercentage = Number(adminDiscountPercentage);
      note = `${chargeTypeLabel.charAt(0).toUpperCase()}${chargeTypeLabel.slice(1)} services have changed, but the originally agreed ${discountPercentage.toFixed(2)}% discount still applies.`;
    }
  }

  if (discountPercentage === 0) {
    return {
      netTotal: liveNetTotal,
      discountPercentage: 0,
      discountAmount: 0,
      discountedTotal: liveNetTotal,
      vatAmount: liveVatAmount,
      grandTotal: liveGrandTotal,
      note: null,
    };
  }

  // Matches GetNetTotalValueByRecurringPackage (the Review Package function
  // this mirrors) exactly rather than a single symmetric formula: a surcharge
  // (negative %) is added at full precision (its addOnValue is never
  // rounded), while a discount (positive %) is rounded to 2 decimals via
  // Math.floor before being subtracted — package/custom-package only, so
  // Review Package/the PDF and this live recompute land on the same cent.
  const discountAmount = isPackageBased
    ? discountPercentage < 0
      ? (liveNetTotal * discountPercentage) / 100
      : Math.floor(((liveNetTotal * discountPercentage) / 100) * 100) / 100
    : (liveNetTotal * discountPercentage) / 100;
  const discountedTotal = liveNetTotal - discountAmount;
  const { vatAmount, grandTotal } = applyVat(discountedTotal, vatPercentage);

  return {
    netTotal: liveNetTotal,
    discountPercentage,
    discountAmount,
    discountedTotal,
    vatAmount,
    grandTotal,
    note,
  };
};

// The Net Total/Discount/VAT/Grand Total block, extracted so it can be
// rendered once for a single blended total or once per package (each against
// that package's own totals) without duplicating the markup.
function CalculationBlock({
  theme,
  accent,
  formatAmount,
  netTotal,
  discountPercentage,
  discountAmount,
  discountedTotal,
  vatPercentage,
  vatAmount,
  grandTotal,
}) {
  const hasDiscount = Number(discountPercentage) !== 0;
  const isSurcharge = Number(discountPercentage) < 0;

  return (
    <div
      className="mt-2 space-y-1.5 rounded-lg px-3 py-2.5"
      style={{ backgroundColor: `${accent}12` }}
    >
      <span
        className="block text-[11px] font-semibold uppercase tracking-wide"
        style={{ color: accent }}
      >
        Calculation
      </span>
      <div className="flex items-center justify-between text-sm">
        <span style={{ color: theme.textSecondary }}>Net Total</span>
        <span style={{ color: theme.textPrimary }}>
          {formatAmount(netTotal)}
        </span>
      </div>
      {hasDiscount && (
        <>
          <div className="flex items-center justify-between text-sm">
            <span style={{ color: theme.textSecondary }}>
              {isSurcharge ? "Surcharge" : "Discount"} (
              {Number(Math.abs(discountPercentage)).toFixed(2)}%)
            </span>
            <span style={{ color: theme.textSecondary }}>
              {isSurcharge ? "(+)" : "(-)"}{" "}
              {formatAmount(Math.abs(discountAmount))}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span style={{ color: theme.textSecondary }}>
              {isSurcharge ? "Adjusted Total" : "Discounted Total"}
            </span>
            <span style={{ color: theme.textPrimary }}>
              {formatAmount(discountedTotal)}
            </span>
          </div>
        </>
      )}
      <div className="flex items-center justify-between text-sm">
        <span style={{ color: theme.textSecondary }}>
          VAT ({Number(vatPercentage) || 0}%)
        </span>
        <span style={{ color: theme.textSecondary }}>
          {formatAmount(vatAmount)}
        </span>
      </div>
      <div
        className="flex items-center justify-between border-t pt-1.5 font-semibold"
        style={{ borderColor: `${accent}33` }}
      >
        <span style={{ color: theme.textPrimary }}>Grand Total</span>
        <span className="text-sm font-semibold" style={{ color: accent }}>
          {formatAmount(grandTotal)}
        </span>
      </div>
    </div>
  );
}

// One charge type rendered as its own tinted section — an accent-colored
// icon/title identify which charge type it is at a glance, its line items,
// and a total row, all within a faint accent-tinted container so the two
// charge types read as clearly separate groups without a heavy card look.
function FeeSection({
  theme,
  title,
  icon: Icon,
  accent,
  items,
  categoryGroups,
  chargeTypeID,
  priceByServiceID,
  pricingLoading,
  formatAmount,
  netTotal,
  discountPercentage,
  discountAmount,
  discountedTotal,
  vatPercentage,
  vatAmount,
  grandTotal,
  note,
  isCustomPackage,
  frequencyLabel,
  // Only set (and only rendered) for Package/Custom Package quotes with more
  // than one selected package — every other quote keeps the single price
  // column above untouched.
  packageColumns,
  priceByServiceAndPackage,
  // One buildChargeTypeTotals result per selected package (see
  // buildPackageTotalsList) — only set alongside packageColumns above.
  packageTotalsList,
}) {
  const hasPackageColumns = (packageColumns?.length || 0) > 1;
  return (
    <div
      className="rounded-xl border-l-4 px-4 py-3"
      style={{ borderColor: accent, backgroundColor: `${accent}0A` }}
    >
      <div className="flex items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <span
            className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full"
            style={{ backgroundColor: `${accent}1F` }}
          >
            <Icon size={14} style={{ color: accent }} />
          </span>
          <span
            className="text-sm font-semibold uppercase tracking-wide"
            style={{ color: accent }}
          >
            {title}
            {/* Same "Recurring Fees (Monthly)" pattern as
                AddUpdateProposal.jsx's Review Services tab
                (getPaymentFrequencyLabel). */}
            {frequencyLabel && (
              <span
                className="ml-1 normal-case tracking-normal"
                style={{ color: theme.textSecondary }}
              >
                ({frequencyLabel})
              </span>
            )}
          </span>
        </div>
        <span className="text-xs" style={{ color: theme.textSecondary }}>
          {items.length} service{items.length === 1 ? "" : "s"}
        </span>
      </div>

      {/* Package/Custom Package quotes with more than one selected package:
          one fully separate, titled block per package — its own service
          list (only the services actually in that package, admin-configured)
          and its own Calculation — instead of a single shared list. Mirrors
          AddUpdateProposal.jsx's Review Packages tab, where each package gets
          its own table and its own GetNetTotalValueByRecurringPackage run. */}
      {hasPackageColumns ? (
        <div className="space-y-3">
          {packageColumns.map((pkg) => {
            const pkgTotals = packageTotalsList.find(
              (entry) => entry.pkg.servicePackageID === pkg.servicePackageID,
            )?.totals;
            const pkgCategoryGroups = categoryGroups
              .map((group) => ({
                ...group,
                items: group.items.filter(
                  (item) =>
                    priceByServiceAndPackage(
                      chargeTypeID,
                      item.serviceID,
                      pkg.servicePackageID,
                    ) !== null,
                ),
              }))
              .filter((group) => group.items.length > 0);

            return (
              <div
                key={pkg.servicePackageID}
                className="overflow-hidden rounded-lg border bg-white"
                style={{ borderColor: theme.border }}
              >
                <div
                  className="px-3 py-2 text-xs font-semibold uppercase tracking-wide"
                  style={{ backgroundColor: `${accent}1F`, color: accent }}
                >
                  {pkg.servicePackageName}
                </div>

                {pkgCategoryGroups.length === 0 ? (
                  <p
                    className="px-3 py-3 text-xs"
                    style={{ color: theme.textSecondary }}
                  >
                    No selected services are included in this package.
                  </p>
                ) : (
                  pkgCategoryGroups.map((group) => (
                    <div key={group.serviceCatID ?? group.categoryName}>
                      <div
                        className="px-3 pt-2 text-[11px] font-semibold uppercase tracking-wide"
                        style={{ color: theme.textSecondary }}
                      >
                        {group.categoryName}
                      </div>
                      {group.items.map((item) => {
                        const pkgPrice = priceByServiceAndPackage(
                          chargeTypeID,
                          item.serviceID,
                          pkg.servicePackageID,
                        );
                        const isUserAdded = isCustomPackage && !item.locked;

                        return (
                          <div
                            key={item.serviceID}
                            className="flex items-center justify-between gap-3 border-b px-3 py-2.5 last:border-b-0"
                            style={{ borderColor: theme.border }}
                          >
                            <span className="flex min-w-0 items-center gap-2">
                              <span
                                className="truncate text-sm"
                                style={{ color: theme.textPrimary }}
                              >
                                {item.serviceName}
                              </span>
                              {isUserAdded && (
                                <span
                                  className="flex-shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                                  style={{
                                    backgroundColor: `${accent}26`,
                                    color: accent,
                                  }}
                                >
                                  Added by you
                                </span>
                              )}
                            </span>
                            {pricingLoading ? (
                              <Loader2
                                size={14}
                                className="flex-shrink-0 animate-spin"
                                style={{ color: theme.textSecondary }}
                              />
                            ) : (
                              <span
                                className="flex-shrink-0 text-sm font-medium"
                                style={{ color: theme.textPrimary }}
                              >
                                {formatAmount(pkgPrice)}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))
                )}

                {pkgTotals && (
                  <div className="px-3 pb-3">
                    <CalculationBlock
                      theme={theme}
                      accent={accent}
                      formatAmount={formatAmount}
                      netTotal={pkgTotals.netTotal}
                      discountPercentage={pkgTotals.discountPercentage}
                      discountAmount={pkgTotals.discountAmount}
                      discountedTotal={pkgTotals.discountedTotal}
                      vatPercentage={vatPercentage}
                      vatAmount={pkgTotals.vatAmount}
                      grandTotal={pkgTotals.grandTotal}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <>
          {/* Service details, grouped under a header per category — its own
              plain white block */}
          <div className="overflow-hidden rounded-lg bg-white">
            {categoryGroups.map((group) => (
              <div key={group.serviceCatID ?? group.categoryName}>
                <div
                  className="px-3 pt-2 text-[11px] font-semibold uppercase tracking-wide"
                  style={{ color: theme.textSecondary }}
                >
                  {group.categoryName}
                </div>
                {group.items.map((item) => {
                  const price =
                    priceByServiceID.get(
                      priceKey(chargeTypeID, item.serviceID),
                    ) || 0;
                  // Custom Package locks the admin's default services (see
                  // ProposalServicesStep) — anything without that `locked`
                  // flag was added by the client themselves, so call it out
                  // here too.
                  const isUserAdded = isCustomPackage && !item.locked;

                  return (
                    <div
                      key={item.serviceID}
                      className="flex items-center justify-between gap-3 border-b px-3 py-2.5 last:border-b-0"
                      style={{ borderColor: theme.border }}
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        <span
                          className="truncate text-sm"
                          style={{ color: theme.textPrimary }}
                        >
                          {item.serviceName}
                        </span>
                        {isUserAdded && (
                          <span
                            className="flex-shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                            style={{
                              backgroundColor: `${accent}26`,
                              color: accent,
                            }}
                          >
                            Added by you
                          </span>
                        )}
                      </span>
                      {pricingLoading ? (
                        <Loader2
                          size={14}
                          className="flex-shrink-0 animate-spin"
                          style={{ color: theme.textSecondary }}
                        />
                      ) : (
                        <span
                          className="flex-shrink-0 text-sm font-medium"
                          style={{ color: theme.textPrimary }}
                        >
                          {formatAmount(price)}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          <CalculationBlock
            theme={theme}
            accent={accent}
            formatAmount={formatAmount}
            netTotal={netTotal}
            discountPercentage={discountPercentage}
            discountAmount={discountAmount}
            discountedTotal={discountedTotal}
            vatPercentage={vatPercentage}
            vatAmount={vatAmount}
            grandTotal={grandTotal}
          />
        </>
      )}

      {note && (
        <p
          className="mt-2 text-xs italic"
          style={{ color: theme.textSecondary }}
        >
          {note}
        </p>
      )}
    </div>
  );
}

export default function ProposalPricingTableStep({ theme, isActive }) {
  const dispatch = useDispatch();

  const quoteModel = useSelector(selectQuoteModel);
  const recurringServices = useSelector(selectRecurringServices);
  const oneOffServices = useSelector(selectOneOffServices);
  const recurringSelections = useSelector(selectRecurringSelections);
  const oneOffSelections = useSelector(selectOneOffSelections);
  const defaultRecurringSelections = useSelector(
    selectDefaultRecurringSelections,
  );
  const defaultOneOffSelections = useSelector(selectDefaultOneOffSelections);
  const additionalInformationList = useSelector(
    selectAdditionalInformationList,
  );
  const defaultAdditionalInformationList = useSelector(
    selectDefaultAdditionalInformationList,
  );

  const pricing = useSelector(selectServicesPricing);
  const pricingLoading = useSelector(selectServicesPricingLoading);
  const pricingError = useSelector(selectServicesPricingError);
  const vatPercentage = useSelector(selectServicesVatPercentage);
  const currencyID = useSelector(selectServicesCurrencyID);
  const serviceMappingWithPackagesList = useSelector(
    selectServiceMappingWithPackagesList,
  );
  const servicesPackageList = useSelector(selectServicesPackageList);

  // Package/Custom Package quotes are priced against the admin's selected
  // package(s) (quoteModel.servicePackageID), not the generic per-service
  // formula the Service flow uses — see packagePriceForItem/findFinalAmount.
  const isCustomPackage =
    quoteModel?.quoteTypeID === QUOTE_TYPE_ID.CustomPackage;
  // Standard "Package" quotes resolve price via the serviceMappingWithPackages
  // List cross-join (packagePriceViaMapping); Custom Package keeps using the
  // flat packageOneValue/Two/ThreeValue fields (packagePriceForItem) — see
  // the comment above packagePriceViaMapping for why these genuinely differ
  // in AddUpdateProposal.jsx.
  const isStandardPackage = quoteModel?.quoteTypeID === QUOTE_TYPE_ID.Package;
  const isPackageBased = isStandardPackage || isCustomPackage;
  // quoteModel is only set once (on load), so keying off the field itself
  // (rather than `|| []` inline, which would be a fresh array every render)
  // keeps this reference-stable for the pricing effect's dependency array.
  const selectedPackageIDs = useMemo(
    () => quoteModel?.servicePackageID || [],
    [quoteModel?.servicePackageID],
  );

  // GetValueOf tells GetCalculatedServicesPriceByPackages which billing
  // period to scale recurring prices down to — the backend does the
  // scaling, mirroring AddUpdateProposal.jsx's handleSetCalculatedPackageData/
  // handleCalculatedData (both switch on Payment_Frequency into this exact
  // string set). The response's price/packageXValue figures already reflect
  // this, so nothing here needs to divide them further client-side.
  const getValueOfFrequency =
    GET_VALUE_OF_BY_FREQUENCY[quoteModel?.paymentFrequencyID] || "Yearly";
  const paymentFrequencyLabel =
    PAYMENT_FREQUENCY_LABEL[quoteModel?.paymentFrequencyID] || "Yearly";

  const recurringServiceByID = useMemo(
    () => buildServiceDefMap(recurringServices),
    [recurringServices],
  );

  const oneOffServiceByID = useMemo(
    () => buildServiceDefMap(oneOffServices),
    [oneOffServices],
  );

  const selectedList = useMemo(() => {
    const recurring = Object.values(recurringSelections || {}).map(
      (selection) => ({ ...selection, listType: "recurring" }),
    );
    const oneOff = Object.values(oneOffSelections || {}).map((selection) => ({
      ...selection,
      listType: "oneOff",
    }));
    return [...recurring, ...oneOff].sort((a, b) => a.order - b.order);
  }, [recurringSelections, oneOffSelections]);

  // Services priced via a global pricing driver (captured on the separate
  // Additional Information step, not here) need their driver value merged in
  // too — otherwise they reach the backend with driverValue: null and price
  // at whatever minimum/fallback the formula defaults to.
  const additionalDriverEntries = useMemo(
    () => buildAdditionalInformationDriverEntries(additionalInformationList),
    [additionalInformationList],
  );

  // additionalDriverEntries are sent as-is, with no serviceChargeTypeID/
  // serviceCatID — mirrors AddUpdateProposal.jsx's extractServiceData
  // AdditionalData block exactly. A global pricing driver's value can feed
  // more than one service's pricing formula (e.g. the same GPD referenced by
  // both a recurring and a one-off service, as with globalPricingDriverID
  // 19540 above), so tagging the row to a single charge type/category was
  // wrong — it made the backend apply the value only to the formula matching
  // that tag and silently zero it out for every other service referencing
  // the same driver.
  const calculateServicesGPDList = useMemo(() => {
    const recurring = Object.values(recurringSelections || {}).flatMap(
      (selection) =>
        buildDriverEntries(
          selection,
          recurringServiceByID.get(selection.serviceID),
          1,
        ),
    );
    const oneOff = Object.values(oneOffSelections || {}).flatMap((selection) =>
      buildDriverEntries(
        selection,
        oneOffServiceByID.get(selection.serviceID),
        2,
      ),
    );
    return [...recurring, ...oneOff, ...additionalDriverEntries];
  }, [
    recurringSelections,
    oneOffSelections,
    recurringServiceByID,
    oneOffServiceByID,
    additionalDriverEntries,
  ]);

  // The Services step's "Next" gate normally blocks leaving with a required
  // driver field unset, but the step tabs let a visited step be reached
  // directly (ProposalStepper's handleStepClick), skipping that gate. A
  // service with a required quantity/variation/slab driver left empty would
  // otherwise reach GetCalculatedServicesPriceByPackages as a null
  // driverValue and break that calculation — so re-check the same
  // requirement here, right before firing the request, regardless of how
  // this step was reached.
  const hasIncompleteSelections = useMemo(
    () =>
      validateSelectionsMap(recurringSelections, recurringServiceByID)
        .hasError ||
      validateSelectionsMap(oneOffSelections, oneOffServiceByID).hasError ||
      Object.keys(
        getAdditionalInformationFieldErrors(additionalInformationList),
      ).length > 0,
    [
      recurringSelections,
      oneOffSelections,
      recurringServiceByID,
      oneOffServiceByID,
      additionalInformationList,
    ],
  );

  useEffect(() => {
    // Only recalculate when the user actually switches onto this step —
    // every step's component stays mounted (just hidden) for the life of
    // the flow, so without this guard the pricing call would fire as soon
    // as the page loads instead of when the Pricing Table step is opened.
    if (
      !isActive ||
      !quoteModel?.organisationKeyID ||
      calculateServicesGPDList.length === 0 ||
      hasIncompleteSelections
    ) {
      return;
    }

    dispatch(
      getCalculatedServicesPriceByPackages({
        userKeyID: quoteModel.userKeyID,
        organisationKeyID: quoteModel.organisationKeyID,
        ServicePackageIDs: selectedPackageIDs,
        GetValueOf: getValueOfFrequency,
        // One-off services are billed once, never on a recurring cadence —
        // pinning their own request to "Yearly" keeps their price stable
        // regardless of the quote's payment frequency (see the thunk).
        oneOffGetValueOf: "Yearly",
        calculateServicesGPDList,
      }),
    );
  }, [
    dispatch,
    isActive,
    quoteModel?.organisationKeyID,
    quoteModel?.userKeyID,
    selectedPackageIDs,
    getValueOfFrequency,
    calculateServicesGPDList,
    hasIncompleteSelections,
  ]);

  const priceByServiceID = useMemo(() => {
    const map = new Map();
    (pricing || []).forEach((item) => {
      // Already scaled to the requested GetValueOf billing period by the
      // backend — none of these branches need further client-side division.
      let price;
      if (isStandardPackage) {
        price = packagePriceViaMapping(item, serviceMappingWithPackagesList);
      } else if (isPackageBased) {
        price = packagePriceForItem(item);
      } else {
        price = Number(item.price) || 0;
      }
      map.set(priceKey(item.serviceChargeTypeID, item.serviceID), price);
    });
    return map;
  }, [
    pricing,
    isPackageBased,
    isStandardPackage,
    serviceMappingWithPackagesList,
  ]);

  // Raw pricing response item per service (packageOneID/Two/Three,
  // servicePackageIDs, etc.) — priceByServiceID above already collapses this
  // down to one combined number, but the per-package column display needs
  // the original per-slot fields to resolve one package's price at a time.
  const pricingItemByServiceID = useMemo(() => {
    const map = new Map();
    (pricing || []).forEach((item) => {
      map.set(priceKey(item.serviceChargeTypeID, item.serviceID), item);
    });
    return map;
  }, [pricing]);

  // Shown as separate columns (one per selected package) only when the quote
  // actually has more than one selected package — a single-package quote
  // keeps the existing single price column untouched. quoteModel has no
  // selectedPackagesList field of its own (that's an AddUpdateProposal.jsx
  // local-state concept, never part of GetQuoteModel's response) — the
  // equivalent list here is packageList, returned by
  // GetCalculatedServicesPriceByPackages itself (the same response
  // servicePackageIDs/pricing came from), so it's only populated once that
  // fetch has actually returned.
  const packageColumns = isPackageBased ? servicesPackageList || [] : [];

  const priceByServiceAndPackage = (chargeTypeID, serviceID, packageID) =>
    priceForServicePackageSlot(
      pricingItemByServiceID.get(priceKey(chargeTypeID, serviceID)),
      packageID,
      isStandardPackage,
      serviceMappingWithPackagesList,
    );

  const recurringSelectedList = useMemo(
    () => selectedList.filter((item) => item.listType === "recurring"),
    [selectedList],
  );
  const oneOffSelectedList = useMemo(
    () => selectedList.filter((item) => item.listType === "oneOff"),
    [selectedList],
  );

  const recurringCategoryGroups = useMemo(
    () => groupByCategory(recurringSelectedList),
    [recurringSelectedList],
  );
  const oneOffCategoryGroups = useMemo(
    () => groupByCategory(oneOffSelectedList),
    [oneOffSelectedList],
  );

  const recurringLiveNetTotal = useMemo(
    () =>
      recurringSelectedList.reduce(
        (sum, item) =>
          sum +
          (priceByServiceID.get(
            priceKey(SERVICE_CHARGE_TYPE_ID.RECURRING, item.serviceID),
          ) || 0),
        0,
      ),
    [recurringSelectedList, priceByServiceID],
  );

  const oneOffLiveNetTotal = useMemo(
    () =>
      oneOffSelectedList.reduce(
        (sum, item) =>
          sum +
          (priceByServiceID.get(
            priceKey(SERVICE_CHARGE_TYPE_ID.ONE_OFF, item.serviceID),
          ) || 0),
        0,
      ),
    [oneOffSelectedList, priceByServiceID],
  );

  // Each charge type is billed (and VAT'd) independently, same as the
  // recurring/one-off fee tables the backend generates for the final quote.
  const recurringLiveVatAmount =
    (recurringLiveNetTotal * (Number(vatPercentage) || 0)) / 100;
  const recurringLiveGrandTotal =
    recurringLiveNetTotal + recurringLiveVatAmount;

  const oneOffLiveVatAmount =
    (oneOffLiveNetTotal * (Number(vatPercentage) || 0)) / 100;
  const oneOffLiveGrandTotal = oneOffLiveNetTotal + oneOffLiveVatAmount;

  // When the user hasn't added/updated any services since this proposal was
  // loaded (selections still match the quote model's hydrated defaults), show
  // the amounts the quote was already priced/discounted at instead of a fresh
  // live recalculation — the stored figures may include discounts a naive
  // net * vat% recompute wouldn't reproduce.
  const quotationFinalAmountList = quoteModel?.quotationFinalAmountList || [];

  // Package/Custom Package quotes store one quotationFinalAmountList row per
  // selected package per charge type (servicePackageID set on each), instead
  // of the single servicePackageID: null row a Service quote has — see
  // AddUpdateProposal.jsx's package-branch quotationFinalAmountList building.
  // Aggregate across the quote's selected package(s) so the rest of this
  // component can keep treating it as one combined final amount.
  const findFinalAmount = (chargeTypeID) => {
    if (!isPackageBased) {
      return quotationFinalAmountList.find(
        (item) =>
          Number(item.serviceChargeTypeID) === chargeTypeID &&
          !item.servicePackageID,
      );
    }

    const packageIDs = selectedPackageIDs.map(String);
    const matches = quotationFinalAmountList.filter(
      (item) =>
        Number(item.serviceChargeTypeID) === chargeTypeID &&
        item.servicePackageID !== null &&
        item.servicePackageID !== undefined &&
        packageIDs.includes(String(item.servicePackageID)),
    );
    if (matches.length === 0) return null;

    const sum = (key) =>
      matches.reduce((total, item) => total + (Number(item[key]) || 0), 0);
    const netTotal = sum("netTotal");
    // Blend each package's discount %, weighted by its net total, so the
    // single discountPercentage this component works with downstream stays
    // representative when more than one package applies.
    const discountPercentageWithAllDecimal = netTotal
      ? matches.reduce(
          (total, item) =>
            total +
            (Number(item.discountPercentageWithAllDecimal) || 0) *
              (Number(item.netTotal) || 0),
          0,
        ) / netTotal
      : 0;

    return {
      netTotal,
      discountPercentageWithAllDecimal,
      discounted: sum("discounted"),
      discountedTotal: sum("discountedTotal"),
      vat: sum("vat"),
      grandTotal: sum("grandTotal"),
      vatPercentage: matches[0]?.vatPercentage,
    };
  };

  // The single, unblended quotationFinalAmountList row for one specific
  // package — used by the per-package calculation columns below (as opposed
  // to findFinalAmount's blended-across-all-selected-packages figure, used
  // for the single combined Calculation card).
  const findPackageFinalAmount = (chargeTypeID, packageID) =>
    quotationFinalAmountList.find(
      (item) =>
        Number(item.serviceChargeTypeID) === chargeTypeID &&
        item.servicePackageID !== null &&
        item.servicePackageID !== undefined &&
        String(item.servicePackageID) === String(packageID),
    ) || null;

  // Same shape AddUpdateProposal.jsx's Review Packages tab shows per package
  // column (GetNetTotalValueByRecurringPackage runs once per package, each
  // against its own agreed discount % and net total) — mirrored here via the
  // same buildChargeTypeTotals used for the single combined card, just
  // called once per package instead of against the blended figures.
  const buildPackageTotalsList = (chargeTypeID, selectedItems, unchanged) =>
    packageColumns.map((pkg) => {
      const finalAmountRow = findPackageFinalAmount(
        chargeTypeID,
        pkg.servicePackageID,
      );
      const liveNetTotal = selectedItems.reduce(
        (sum, item) =>
          sum +
          (priceByServiceAndPackage(
            chargeTypeID,
            item.serviceID,
            pkg.servicePackageID,
          ) || 0),
        0,
      );
      const liveVatAmount = (liveNetTotal * (Number(vatPercentage) || 0)) / 100;

      const totals = buildChargeTypeTotals({
        finalAmount: unchanged ? finalAmountRow : null,
        defaultFinalAmount: finalAmountRow,
        liveNetTotal,
        liveVatAmount,
        liveGrandTotal: liveNetTotal + liveVatAmount,
        vatPercentage,
        adminDiscountPercentage: finalAmountRow?.discountPercentageWithAllDecimal,
        chargeTypeLabel: "recurring",
        isPackageBased: true,
      });

      return { pkg, totals };
    });

  // A service's own driver values live in recurringSelections/oneOffSelections,
  // but a *global* pricing driver's value lives in the separate Additional
  // Information list — selectionsMatch alone can't see an edit there (the
  // selections themselves don't change), so without this a locked default
  // service's global driver value could change price without ever tripping
  // the "unchanged" shortcut below, leaving the stale stored total on screen.
  const additionalInformationUnchanged = additionalInformationEntriesMatch(
    additionalInformationList,
    defaultAdditionalInformationList,
  );

  const recurringUnchanged =
    selectionsMatch(recurringSelections, defaultRecurringSelections) &&
    additionalInformationUnchanged;
  const oneOffUnchanged =
    selectionsMatch(oneOffSelections, defaultOneOffSelections) &&
    additionalInformationUnchanged;

  // defaultFinalAmount is the quote's originally saved pricing for this
  // charge type — used as the "what the client was already quoted" baseline
  // for the amendment-discount check below, regardless of whether the
  // current selections still match it. In AddUpdateProposal.jsx's Review
  // Services tab, handlePaymentFrequencyChange keeps RecurringPricingInfo
  // (the source of the saved quotationFinalAmountList recurring row) synced
  // to whatever payment frequency is selected at save time — and the web
  // proposal has no control to change frequency after that (paymentFrequencyID
  // is fixed, read-only, from quoteModel) — so this stored recurring
  // finalAmount already matches quoteModel.paymentFrequencyID and must be
  // used as-is here, not divided by paymentFrequencyDivisor again.
  const defaultRecurringFinalAmount = findFinalAmount(
    SERVICE_CHARGE_TYPE_ID.RECURRING,
  );
  const defaultOneOffFinalAmount = findFinalAmount(
    SERVICE_CHARGE_TYPE_ID.ONE_OFF,
  );

  const recurringFinalAmount = recurringUnchanged
    ? defaultRecurringFinalAmount
    : null;
  const oneOffFinalAmount = oneOffUnchanged ? defaultOneOffFinalAmount : null;

  // Package/Custom Package quotes have no per-quote recurringDiscountPercentage
  // field (that's a Service-only concept) — their agreed discount lives on the
  // package's own quotationFinalAmountList row(s), already blended into
  // defaultFinalAmount.discountPercentageWithAllDecimal above.
  const recurringAdminDiscountPercentage = isPackageBased
    ? defaultRecurringFinalAmount?.discountPercentageWithAllDecimal
    : quoteModel?.recurringDiscountPercentage;
  const oneOffAdminDiscountPercentage = isPackageBased
    ? defaultOneOffFinalAmount?.discountPercentageWithAllDecimal
    : quoteModel?.oneOffDiscountPercentage;

  const recurringTotals = buildChargeTypeTotals({
    finalAmount: recurringFinalAmount,
    defaultFinalAmount: defaultRecurringFinalAmount,
    liveNetTotal: recurringLiveNetTotal,
    liveVatAmount: recurringLiveVatAmount,
    liveGrandTotal: recurringLiveGrandTotal,
    vatPercentage,
    amendmentDiscountPercentage:
      quoteModel?.recurringDiscountPercentageForAmendment,
    adminDiscountPercentage: recurringAdminDiscountPercentage,
    chargeTypeLabel: "recurring",
    isPackageBased,
  });

  const oneOffTotals = buildChargeTypeTotals({
    finalAmount: oneOffFinalAmount,
    defaultFinalAmount: defaultOneOffFinalAmount,
    liveNetTotal: oneOffLiveNetTotal,
    liveVatAmount: oneOffLiveVatAmount,
    liveGrandTotal: oneOffLiveGrandTotal,
    vatPercentage,
    amendmentDiscountPercentage:
      quoteModel?.oneOffDiscountPercentageForAmendment,
    adminDiscountPercentage: oneOffAdminDiscountPercentage,
    chargeTypeLabel: "one-off",
    isPackageBased,
  });

  const recurringVatPercentage = recurringFinalAmount
    ? Number(recurringFinalAmount.vatPercentage) || 0
    : Number(vatPercentage) || 0;
  const oneOffVatPercentage = oneOffFinalAmount
    ? Number(oneOffFinalAmount.vatPercentage) || 0
    : Number(vatPercentage) || 0;

  // Per-package Calculation columns (Net Total/Discount/VAT/Grand Total each
  // computed against that package's own agreed discount %, mirroring
  // AddUpdateProposal.jsx's Review Packages tab) — only built when there's
  // more than one selected package to show side by side; a single-package
  // quote keeps the existing single blended Calculation card above.
  const hasPackageColumns = packageColumns.length > 1;
  const recurringPackageTotalsList = hasPackageColumns
    ? buildPackageTotalsList(
        SERVICE_CHARGE_TYPE_ID.RECURRING,
        recurringSelectedList,
        recurringUnchanged,
      )
    : [];
  const oneOffPackageTotalsList = hasPackageColumns
    ? buildPackageTotalsList(
        SERVICE_CHARGE_TYPE_ID.ONE_OFF,
        oneOffSelectedList,
        oneOffUnchanged,
      )
    : [];

  const currencySymbol = CURRENCY_SYMBOLS[currencyID] || "£";
  const formatAmount = (value) => `${currencySymbol}${value.toFixed(2)}`;

  const hasRecurring = recurringSelectedList.length > 0;
  const hasOneOff = oneOffSelectedList.length > 0;

  const clientName = quoteModel?.clientName || "Client";
  const organisationName = quoteModel?.organisationName || "Outbooks";
  const preparedOn = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  // Package/Custom Package proposals are built from admin-selected package(s)
  // - shown here so the client sees which package(s) they were quoted, same
  // as servicePackageName on AddUpdateProposal.jsx's selectedPackagesList.
  const packageName = packageColumns
    .map((pkg) => pkg.servicePackageName)
    .filter(Boolean)
    .join(", ");

  return (
    <div
      className="flex h-full overflow-hidden p-1.5 sm:p-3"
      style={{ backgroundColor: theme.background }}
    >
      {/* Full width on mobile so the card isn't squeezed into 90% of an
          already-small viewport. From lg up, w-[90%] (not centered) leaves a
          consistent 10% gap on the right, matching the PDF step's card width. */}
      <div
        className="flex h-full w-full flex-col overflow-hidden rounded-xl border bg-white shadow-lg sm:rounded-2xl lg:w-[90%]"
        style={{ borderColor: theme.border }}
      >
        <div
          className="h-1 flex-shrink-0"
          style={{ background: theme.primary }}
        />

        {/* Header — polished but compact, always visible, never scrolls */}
        <div
          className="flex flex-shrink-0 flex-wrap items-center justify-between gap-2 border-b px-3 py-3 sm:px-5 sm:py-3.5"
          style={{
            background: `linear-gradient(to right, ${theme.primary}14, ${theme.primary}00)`,
            borderColor: theme.border,
          }}
        >
          <div className="flex min-w-0 items-center gap-3">
            <span
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
              style={{ backgroundColor: theme.primary }}
            >
              {clientName.charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0">
              <h2
                className="truncate text-base font-semibold leading-tight"
                style={{ color: theme.textPrimary }}
              >
                {clientName}
              </h2>
              <p
                className="truncate text-xs leading-tight"
                style={{ color: theme.textSecondary }}
              >
                Prepared by {organisationName} &middot; {preparedOn}
              </p>
              {isPackageBased && packageName && (
                <p
                  className="truncate text-xs font-medium leading-tight"
                  style={{ color: theme.primary }}
                >
                  Package: {packageName}
                </p>
              )}
            </div>
          </div>
          <span
            className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
            style={{
              backgroundColor: `${theme.completedStepBackground}1A`,
              color: theme.completedStepBackground,
            }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: theme.completedStepBackground }}
            />
            Ready for Review
          </span>
        </div>

        {/* Services — recurring and one-off each get their own tinted
            section (same accent color for both, so the two share one
            consistent theme) with a title/icon to tell them apart */}
        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-3 py-4 sm:px-6 sm:py-5">
          {selectedList.length === 0 ? (
            <p
              className="py-6 text-center text-sm"
              style={{ color: theme.textSecondary }}
            >
              No services selected yet.
            </p>
          ) : (
            <>
              {hasRecurring && (
                <FeeSection
                  theme={theme}
                  title="Recurring Fees"
                  icon={Repeat}
                  accent={theme.primary}
                  items={recurringSelectedList}
                  categoryGroups={recurringCategoryGroups}
                  chargeTypeID={SERVICE_CHARGE_TYPE_ID.RECURRING}
                  priceByServiceID={priceByServiceID}
                  pricingLoading={pricingLoading}
                  formatAmount={formatAmount}
                  netTotal={recurringTotals.netTotal}
                  discountPercentage={recurringTotals.discountPercentage}
                  discountAmount={recurringTotals.discountAmount}
                  discountedTotal={recurringTotals.discountedTotal}
                  vatPercentage={recurringVatPercentage}
                  vatAmount={recurringTotals.vatAmount}
                  grandTotal={recurringTotals.grandTotal}
                  note={recurringTotals.note}
                  isCustomPackage={isCustomPackage}
                  frequencyLabel={paymentFrequencyLabel}
                  packageColumns={packageColumns}
                  priceByServiceAndPackage={priceByServiceAndPackage}
                  packageTotalsList={recurringPackageTotalsList}
                />
              )}

              {hasOneOff && (
                <FeeSection
                  theme={theme}
                  title="One-off Fees"
                  icon={Package}
                  accent={theme.primary}
                  items={oneOffSelectedList}
                  categoryGroups={oneOffCategoryGroups}
                  chargeTypeID={SERVICE_CHARGE_TYPE_ID.ONE_OFF}
                  priceByServiceID={priceByServiceID}
                  pricingLoading={pricingLoading}
                  formatAmount={formatAmount}
                  netTotal={oneOffTotals.netTotal}
                  discountPercentage={oneOffTotals.discountPercentage}
                  discountAmount={oneOffTotals.discountAmount}
                  discountedTotal={oneOffTotals.discountedTotal}
                  vatPercentage={oneOffVatPercentage}
                  vatAmount={oneOffTotals.vatAmount}
                  grandTotal={oneOffTotals.grandTotal}
                  note={oneOffTotals.note}
                  isCustomPackage={isCustomPackage}
                  packageColumns={packageColumns}
                  priceByServiceAndPackage={priceByServiceAndPackage}
                  packageTotalsList={oneOffPackageTotalsList}
                />
              )}
            </>
          )}

          {hasIncompleteSelections && (
            <p className="mt-2 text-xs text-red-600">
              One or more selected services are missing a required field
              (quantity, variation, or slab). Go back to Services and complete
              them to see accurate pricing.
            </p>
          )}

          {!hasIncompleteSelections && pricingError && (
            <p className="mt-2 text-xs text-red-600">
              Failed to calculate service pricing.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
