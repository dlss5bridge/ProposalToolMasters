import { Fragment, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Loader2, Repeat, Package, Check } from "lucide-react";

import {
  selectQuoteModel,
  selectThemeSettings,
} from "../../../redux/reducer/webProposal";
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
// Sent as GetValueOf on GetCalculatedServicesPriceByPackages — the backend
// scales the recurring price down to this billing period.
const GET_VALUE_OF_BY_FREQUENCY = {
  1: "Yearly",
  2: "HalfYearly",
  3: "Quarterly",
  4: "Monthly",
};

// serviceID is only unique within a charge type (recurring and one-off share
// the same ID space), so lookups must key on both.
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

// Exported for ProposalAmendment.jsx's isAmend gate — it's only a genuine
// amendment when a service selection or driver value changed from the
// admin's defaults.
export const selectionsMatch = (current, defaults) =>
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
// into the row shape GetCalculatedServicesPriceByPackages expects.
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

  // A service with no pricing drivers still needs one row for the backend
  // to price it against.
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

  // Every driver here is hidden because it's a global pricing driver
  // captured on the Additional Information step instead —
  // additionalDriverEntries supplies its row, so skip it here to avoid a
  // conflicting duplicate.
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

// Truncates to 2 decimals rather than rounding, matching how admin computes
// VAT — otherwise our figure could come out a cent higher than theirs.
const truncateToTwoDecimals = (value) => Math.floor(value * 100) / 100;

const applyVat = (netTotal, vatPercentage) => {
  const vatAmount = truncateToTwoDecimals(
    (netTotal * (Number(vatPercentage) || 0)) / 100,
  );
  return { vatAmount, grandTotal: netTotal + vatAmount };
};

// For Package/Custom Package quotes, GetCalculatedServicesPriceByPackages
// returns a value per *package slot* (packageOneValue/Two/Three), each
// tagged with which package landed in that slot. A service's price is
// whichever slot matches the currently selected package.
const PACKAGE_PRICE_SLOTS = [
  { idKey: "packageOneID", valueKey: "packageOneValue" },
  { idKey: "packageTwoID", valueKey: "packageTwoValue" },
  { idKey: "packageThreeID", valueKey: "packageThreeValue" },
];

// GetCalculatedServicesPriceByPackages's `serviceMappingWithPackagesList`
// (one row per service per configured package) is the admin-saved
// per-package price a Standard Package quote was actually agreed/discounted
// against, so Standard Package resolves price via that cross-join first.
//
// Custom Package is deliberately different: it never reads
// serviceMappingWithPackagesList for price, only for a service's
// servicePackageIDs membership list. Its price comes straight off the
// pricing item's own flat packageOneValue/Two/ThreeValue, matching how
// AddUpdateProposal.jsx's ReviewPackagesComponent handles it.
//
// Returns null — rendered as "—" — when the service isn't part of the
// selected package by either source.
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
    // A slot's packageOneID/Two/ThreeID can be tagged with a package this
    // service isn't actually mapped to (that slot's Value then comes back
    // null) — reading `slot` alone would surface that null as 0 instead of
    // "—", so check the service's actual servicePackageIDs membership too.
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
  // No match in the cross-join means the service isn't part of this
  // package.
  return match ? Number(match.price) || 0 : null;
};

// A charge type's Calculation-card figures. When selections still match the
// quote's hydrated defaults, the stored final amount is shown as-is.
// Otherwise a live recompute is needed:
//   - Service: an amendment where services changed — if the new total is
//     lower than what was originally quoted, the original discount no
//     longer applies and the amendment's discount % is used instead; if
//     it's higher/equal, the original discount still applies. A note
//     explains which case applied.
//   - Package/Custom Package: no amendment concept — the package's own
//     agreed discount % always applies to the live total.
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
    // For a surcharge (negative %) the stored `discounted` field is always
    // 0 — admin only persists it on the positive-discount branch — so
    // recompute from the percentage instead to actually show the surcharge.
    // discountedTotal/grandTotal are unaffected since those were already
    // persisted correctly.
    const discountAmount =
      storedDiscountPercentage < 0
        ? (storedNetTotal * storedDiscountPercentage) / 100
        : Number(finalAmount.discounted) || 0;
    const storedDiscountedTotal = Number(finalAmount.discountedTotal) || 0;
    const storedVatAmount = Number(finalAmount.vat) || 0;

    return {
      netTotal: storedNetTotal,
      discountPercentage: storedDiscountPercentage,
      discountAmount,
      discountedTotal: storedDiscountedTotal,
      vatAmount: storedVatAmount,
      // Derived from the other stored fields rather than trusting
      // finalAmount.grandTotal directly — that field can be null on a saved
      // quote even when discountedTotal/vat are both populated.
      grandTotal: storedDiscountedTotal + storedVatAmount,
      note: null,
    };
  }

  let discountPercentage = 0;
  let note = null;

  if (isPackageBased) {
    // A negative package discount percentage is a surcharge (raises the
    // total), not a discount to ignore, so don't gate on `> 0` here — a
    // negative % naturally produces a negative discountAmount below.
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

  // Package/custom-package only: a surcharge (negative %) is added at full
  // precision, while a discount (positive %) is rounded to the nearest cent
  // before being subtracted — matching admin's own rounding so this recompute
  // lands on the same cent as the PDF.
  const discountAmount = isPackageBased
    ? discountPercentage < 0
      ? (liveNetTotal * discountPercentage) / 100
      : Number(((liveNetTotal * discountPercentage) / 100).toFixed(2))
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
    // A plain top divider separates the totals from the line items above;
    // only the Grand Total keeps a filled band so it stands out.
    <div
      className="mt-3 overflow-hidden rounded-lg border-t"
      style={{ borderColor: theme.border }}
    >
      <div className="space-y-1.5 px-1 pb-2.5 pt-2.5">
        <span
          className="block text-[11px] font-bold uppercase tracking-wider"
          style={{ color: accent }}
        >
          Calculation
        </span>
        <div className="flex items-center justify-between text-sm">
          <span style={{ color: theme.textSecondary }}>Net Total</span>
          <span className="font-medium" style={{ color: theme.textPrimary }}>
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
              <span
                className="font-medium"
                style={{ color: isSurcharge ? accent : theme.textSecondary }}
              >
                {isSurcharge ? "(+)" : ""}{" "}
                {formatAmount(Math.abs(discountAmount))}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span style={{ color: theme.textSecondary }}>
                {isSurcharge ? "Adjusted Total" : "Discounted Total"}
              </span>
              <span
                className="font-medium"
                style={{ color: theme.textPrimary }}
              >
                {formatAmount(discountedTotal)}
              </span>
            </div>
          </>
        )}
        <div className="flex items-center justify-between text-sm">
          <span style={{ color: theme.textSecondary }}>
            VAT ({Number(vatPercentage) || 0}%)
          </span>
          <span className="font-medium" style={{ color: theme.textPrimary }}>
            {formatAmount(vatAmount)}
          </span>
        </div>
      </div>
      {/* Grand Total gets its own emphasized band, bolder and larger than
          every line above it. */}
      <div
        className="mt-1.5 flex items-center justify-between rounded-lg px-3.5 py-2.5"
        style={{ backgroundColor: `${accent}1A` }}
      >
        <span
          className="text-xs font-bold uppercase tracking-wide"
          style={{ color: theme.textPrimary }}
        >
          Grand Total
        </span>
        <span className="text-base font-bold" style={{ color: accent }}>
          {formatAmount(grandTotal)}
        </span>
      </div>
    </div>
  );
}

// One charge type rendered as its own tinted section: accent-colored
// icon/title, its line items, and a total row.
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
  // Package/Custom Package quotes only
  isPackageBased,
  // Standard "Package" quotes only — gates the "hide services not mapped to
  // any package" filter below; Custom Package keeps its full row set.
  isStandardPackage,
  // Every package this proposal was quoted with, one price/calculation
  // column each, plus the shared selectedPackageID/onSelectPackage — only
  // set when there's more than one package to choose between.
  packageColumns,
  priceByServiceAndPackage,
  packageTotalsList,
  selectedPackageID,
  onSelectPackage,
  // Package/Custom Package quotes only — shown next to the section title
  // when there's a single package.
  selectedPackageName,
}) {
  const hasPackageColumns = (packageColumns?.length || 0) > 1;

  // Standard Package quotes only: drop a service that isn't mapped to any
  // of this proposal's packages instead of rendering a dead "—" row.
  // Custom Package keeps its full row set — client-added services are real
  // selections, not package mappings.
  const visibleCategoryGroups =
    hasPackageColumns && isStandardPackage
      ? categoryGroups
          .map((group) => ({
            ...group,
            items: group.items.filter((item) =>
              packageColumns.some(
                (pkg) =>
                  priceByServiceAndPackage(
                    chargeTypeID,
                    item.serviceID,
                    pkg.servicePackageID,
                  ) !== null,
              ),
            ),
          }))
          .filter((group) => group.items.length > 0)
      : categoryGroups;

  // Sum the same groups the table renders, not the raw selection count —
  // Standard Package can drop dead rows above, so the two counts can differ.
  const visibleServiceCount = visibleCategoryGroups.reduce(
    (sum, group) => sum + group.items.length,
    0,
  );

  // Service (non-package) proposals only: give the title the same dark-theme
  // treatment as the Package Name headers in the comparison grid, for a
  // consistent look. Package/Custom Package's own title row is untouched.
  const isServiceTitle = !isPackageBased;
  const titleWrapperClassName = isServiceTitle
    ? "mb-3 flex flex-wrap items-center justify-between gap-2 rounded-xl px-4 py-3 sm:px-5 sm:py-3.5"
    : "flex flex-wrap items-center justify-between gap-2 pb-3";
  const titleWrapperStyle = isServiceTitle
    ? { backgroundColor: theme.secondary }
    : undefined;
  const titleIconBg = isServiceTitle ? "rgba(255,255,255,0.16)" : `${accent}1F`;
  const titleColor = isServiceTitle ? theme.headerText : accent;
  const titleBadgeBg = isServiceTitle
    ? "rgba(255,255,255,0.16)"
    : `${accent}1A`;
  const titleCountBg = isServiceTitle
    ? "rgba(255,255,255,0.16)"
    : theme.background;
  const titleCountColor = isServiceTitle
    ? theme.headerText
    : theme.textSecondary;

  return (
    // Package/Custom Package: plain accent-icon title row. Service: a dark
    // theme-background title bar matching the Package Name headers below.
    <div>
      <div className={titleWrapperClassName} style={titleWrapperStyle}>
        <div className="flex items-center gap-2.5">
          <span
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full"
            style={{ backgroundColor: titleIconBg }}
          >
            <Icon size={15} style={{ color: titleColor }} />
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="text-sm font-bold uppercase tracking-wide"
              style={{ color: titleColor }}
            >
              {title}
            </span>
            {/* "Recurring Fees (Monthly)" pattern, styled as a badge so the
                billing period reads clearly instead of blending into the
                title. */}
            {frequencyLabel && (
              <span
                className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                style={{
                  backgroundColor: titleBadgeBg,
                  color: titleColor,
                }}
              >
                {frequencyLabel}
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-shrink-0 items-center gap-2">
          {/* Package Name, right-aligned — only for the single-package
              layout; the comparison grid already names each package in its
              own column header. */}
          {!hasPackageColumns && selectedPackageName && (
            <span
              className="inline-flex max-w-[45vw] items-center gap-1 truncate rounded-full px-2.5 py-1 text-xs font-semibold sm:max-w-xs"
              style={{
                backgroundColor: titleBadgeBg,
                color: titleColor,
              }}
              title={selectedPackageName}
            >
              <Check size={11} strokeWidth={3} className="flex-shrink-0" />
              <span className="truncate">{selectedPackageName}</span>
            </span>
          )}
          <span
            className="rounded-full px-2.5 py-1 text-xs font-medium"
            style={{
              backgroundColor: titleCountBg,
              color: titleCountColor,
            }}
          >
            {visibleServiceCount} service{visibleServiceCount === 1 ? "" : "s"}
          </span>
        </div>
      </div>

      <div>
        {hasPackageColumns ? (
          // A CSS-grid "plan comparison" layout, not a spreadsheet table: the
          // Service column is capped-width, and every package gets an equal
          // flexible share of the rest. Every row reuses the same column
          // template so everything lines up without table borders.
          <div className="overflow-x-auto overflow-y-hidden">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: `minmax(200px,260px) repeat(${packageColumns.length}, minmax(140px,1fr))`,
                minWidth: `${200 + packageColumns.length * 140}px`,
              }}
            >
              {/* Plan header row — package name on a dark theme background.
                Selection lives on the name itself (a filled pill when
                active) rather than a separate line, to stay compact. */}
              <div
                className="sticky left-0 z-10 flex items-center px-3.5 pb-2 pt-3"
                style={{
                  backgroundColor: theme.secondary,
                  borderBottom: "1px solid rgba(255,255,255,0.16)",
                }}
              >
                <span
                  className="text-[11px] font-bold uppercase tracking-wider"
                  style={{ color: "rgba(255,255,255,0.75)" }}
                >
                  Service
                </span>
              </div>
              {packageColumns.map((pkg) => {
                const isActive =
                  String(pkg.servicePackageID) === String(selectedPackageID);
                return (
                  <div
                    key={pkg.servicePackageID}
                    className="flex items-center justify-end px-3 py-2.5 text-center"
                    style={{
                      backgroundColor: theme.secondary,
                      borderBottom: "1px solid rgba(255,255,255,0.16)",
                    }}
                  >
                    {isActive ? (
                      <span
                        className="flex max-w-full items-center gap-1 rounded-full px-3 py-1.5 text-sm font-bold"
                        style={{ backgroundColor: accent, color: "#fff" }}
                        title={pkg.servicePackageName}
                      >
                        <Check
                          size={13}
                          strokeWidth={3}
                          className="flex-shrink-0"
                        />
                        <span className="truncate">
                          {pkg.servicePackageName}
                        </span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onSelectPackage(pkg.servicePackageID)}
                        className="max-w-full appearance-none truncate rounded-full border-0 bg-transparent px-3 py-1.5 text-sm font-bold transition hover:bg-white/10"
                        style={{ color: "rgba(255,255,255,0.85)" }}
                        title={pkg.servicePackageName}
                      >
                        {pkg.servicePackageName}
                      </button>
                    )}
                  </div>
                );
              })}

              {/* Category + service rows — same type scale as the plain
                list, colored in the accent so a category reads as its own
                section. */}
              {visibleCategoryGroups.map((group, groupIndex) => (
                <Fragment key={group.serviceCatID ?? group.categoryName}>
                  <div
                    className="sticky left-0 z-10 px-3.5 pb-1.5 pt-3 text-[11px] font-bold uppercase tracking-wider"
                    style={{
                      gridColumn: "1 / -1",
                      borderTop:
                        groupIndex === 0 ? "none" : `1px solid ${theme.border}`,
                      backgroundColor: "#fff",
                      color: accent,
                    }}
                  >
                    {group.categoryName}
                  </div>
                  {group.items.map((item) => {
                    const isUserAdded = isCustomPackage && !item.locked;

                    return (
                      <Fragment key={item.serviceID}>
                        <div
                          className="sticky left-0 z-10 flex min-w-0 items-center gap-2 border-b px-3.5 py-2.5"
                          style={{
                            borderColor: theme.border,
                            backgroundColor: "#fff",
                          }}
                        >
                          <span
                            className="text-sm leading-snug"
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
                        </div>
                        {packageColumns.map((pkg) => {
                          const pkgPrice = priceByServiceAndPackage(
                            chargeTypeID,
                            item.serviceID,
                            pkg.servicePackageID,
                          );

                          return (
                            <div
                              key={pkg.servicePackageID}
                              className="flex items-center justify-end border-b px-3 py-2.5"
                              style={{ borderColor: theme.border }}
                            >
                              {pricingLoading ? (
                                <Loader2
                                  size={14}
                                  className="animate-spin"
                                  style={{ color: theme.textSecondary }}
                                />
                              ) : (
                                <span
                                  className="text-right text-sm font-semibold"
                                  style={{
                                    color:
                                      pkgPrice === null
                                        ? theme.textSecondary
                                        : theme.textPrimary,
                                  }}
                                >
                                  {pkgPrice === null
                                    ? "—"
                                    : formatAmount(pkgPrice)}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </Fragment>
                    );
                  })}
                </Fragment>
              ))}

              {/* Calculation — same tinted zone + Grand Total band as
                CalculationBlock, repeated once per package column. */}
              <div
                className="sticky left-0 z-10 px-3.5 pb-1 pt-3 text-[11px] font-bold uppercase tracking-wider"
                style={{
                  backgroundColor: `${accent}0A`,
                  borderTop: `1px solid ${accent}26`,
                  color: accent,
                }}
              >
                Calculation
              </div>
              {packageColumns.map((pkg) => (
                <div
                  key={pkg.servicePackageID}
                  className="px-3 pb-1 pt-3"
                  style={{
                    backgroundColor: `${accent}0A`,
                    borderTop: `1px solid ${accent}26`,
                  }}
                />
              ))}

              <div
                className="sticky left-0 z-10 px-3.5 py-1 text-sm"
                style={{
                  backgroundColor: `${accent}0A`,
                  color: theme.textSecondary,
                }}
              >
                Net Total
              </div>
              {packageTotalsList.map(({ pkg, totals }) => (
                <div
                  key={pkg.servicePackageID}
                  className="px-3 py-1 text-right text-sm font-medium"
                  style={{
                    backgroundColor: `${accent}0A`,
                    color: theme.textPrimary,
                  }}
                >
                  {formatAmount(totals.netTotal)}
                </div>
              ))}

              {packageTotalsList.some(
                ({ totals }) => Number(totals.discountPercentage) !== 0,
              ) && (
                <>
                  <div
                    className="sticky left-0 z-10 px-3.5 py-1 text-sm"
                    style={{
                      backgroundColor: `${accent}0A`,
                      color: theme.textSecondary,
                    }}
                  >
                    Discount
                  </div>
                  {packageTotalsList.map(({ pkg, totals }) => {
                    const pct = Number(totals.discountPercentage);
                    const isSurcharge = pct < 0;
                    return (
                      <div
                        key={pkg.servicePackageID}
                        className="px-3 py-1 text-right text-sm font-medium"
                        style={{
                          backgroundColor: `${accent}0A`,
                          color: isSurcharge ? accent : theme.textSecondary,
                        }}
                      >
                        {pct === 0
                          ? "—"
                          : `${isSurcharge ? "(+) " : ""}${formatAmount(
                              Math.abs(totals.discountAmount),
                            )} (${Math.abs(pct).toFixed(2)}%)`}
                      </div>
                    );
                  })}

                  <div
                    className="sticky left-0 z-10 px-3.5 py-1 text-sm"
                    style={{
                      backgroundColor: `${accent}0A`,
                      color: theme.textSecondary,
                    }}
                  >
                    {packageTotalsList.some(
                      ({ totals }) => Number(totals.discountPercentage) < 0,
                    )
                      ? "Adjusted Total"
                      : "Discounted Total"}
                  </div>
                  {packageTotalsList.map(({ pkg, totals }) => (
                    <div
                      key={pkg.servicePackageID}
                      className="px-3 py-1 text-right text-sm font-medium"
                      style={{
                        backgroundColor: `${accent}0A`,
                        color: theme.textPrimary,
                      }}
                    >
                      {formatAmount(totals.discountedTotal)}
                    </div>
                  ))}
                </>
              )}

              <div
                className="sticky left-0 z-10 px-3.5 pb-2.5 pt-1 text-sm"
                style={{
                  backgroundColor: `${accent}0A`,
                  color: theme.textSecondary,
                }}
              >
                VAT ({Number(vatPercentage) || 0}%)
              </div>
              {packageTotalsList.map(({ pkg, totals }) => (
                <div
                  key={pkg.servicePackageID}
                  className="px-3 pb-2.5 pt-1 text-right text-sm font-medium"
                  style={{
                    backgroundColor: `${accent}0A`,
                    color: theme.textPrimary,
                  }}
                >
                  {formatAmount(totals.vatAmount)}
                </div>
              ))}

              {/* Grand Total — filled, bold band matching CalculationBlock's
                footer strip. */}
              <div
                className="sticky left-0 z-10 flex items-center px-3.5 py-2.5 text-xs font-bold uppercase tracking-wide"
                style={{
                  backgroundColor: `${accent}1A`,
                  color: theme.textPrimary,
                }}
              >
                Grand Total
              </div>
              {packageTotalsList.map(({ pkg, totals }) => (
                <div
                  key={pkg.servicePackageID}
                  className="px-3 py-2.5 text-right text-base font-bold"
                  style={{
                    backgroundColor: `${accent}1A`,
                    color: accent,
                  }}
                >
                  {formatAmount(totals.grandTotal)}
                </div>
              ))}

              {/* Select Package — one button per column below that
                  package's Grand Total. Only selects the package (same as
                  clicking its name above); the footer Accept button
                  handles actually submitting. */}
              {onSelectPackage && (
                <>
                  <div
                    className="sticky left-0 z-10 px-3.5 py-2.5"
                    style={{ backgroundColor: `${accent}1A` }}
                  />
                  {packageColumns.map((pkg) => {
                    const isActive =
                      String(pkg.servicePackageID) ===
                      String(selectedPackageID);
                    return (
                      <div
                        key={pkg.servicePackageID}
                        className="flex items-center justify-end px-3 py-2"
                        style={{ backgroundColor: `${accent}1A` }}
                      >
                        <button
                          type="button"
                          onClick={() => onSelectPackage(pkg.servicePackageID)}
                          disabled={isActive}
                          className="inline-flex max-w-full items-center justify-center gap-1 rounded-lg px-3.5 py-2 text-xs font-bold transition disabled:cursor-default"
                          style={
                            isActive
                              ? { backgroundColor: accent, color: "#fff" }
                              : {
                                  backgroundColor: "#fff",
                                  color: accent,
                                  border: `1px solid ${accent}`,
                                }
                          }
                        >
                          {isActive ? "Selected" : "Select Package"}
                          <Check size={13} strokeWidth={3} />
                        </button>
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Service details, grouped under a header per category;
              horizontal dividers alone separate items. */}
            <div>
              {categoryGroups.map((group) => (
                <div key={group.serviceCatID ?? group.categoryName}>
                  <div
                    className="border-t px-3.5 pb-1.5 pt-3 text-[11px] font-bold uppercase tracking-wider first:border-t-0"
                    style={{
                      color: theme.textSecondary,
                      borderColor: theme.border,
                    }}
                  >
                    {group.categoryName}
                  </div>
                  {group.items.map((item) => {
                    const price = priceByServiceID.get(
                      priceKey(chargeTypeID, item.serviceID),
                    );
                    // Custom Package locks the admin's default services —
                    // anything without that `locked` flag was added by the
                    // client themselves.
                    const isUserAdded = isCustomPackage && !item.locked;
                    const notInPackage = isPackageBased && price === null;

                    return (
                      <div
                        key={item.serviceID}
                        className="flex items-center justify-between gap-3 border-b px-3.5 py-2.5 last:border-b-0"
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
                            className="flex-shrink-0 text-sm font-semibold"
                            style={{
                              color: notInPackage
                                ? theme.textSecondary
                                : theme.textPrimary,
                            }}
                          >
                            {notInPackage ? "—" : formatAmount(price || 0)}
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
    </div>
  );
}

export default function ProposalPricingTableStep({
  theme,
  isActive,
  // Package/Custom Package quotes only — called whenever the selected
  // package changes, so the parent can gate the footer Accept button on
  // whether a selection has been made.
  onSelectedPackageChange,
}) {
  const dispatch = useDispatch();

  const quoteModel = useSelector(selectQuoteModel);
  const themeSettings = useSelector(selectThemeSettings);

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
  // package(s), not the generic per-service formula the Service flow uses.
  const isCustomPackage =
    quoteModel?.quoteTypeID === QUOTE_TYPE_ID.CustomPackage;
  // Standard "Package" quotes resolve price via the serviceMappingWithPackages
  // cross-join; Custom Package uses the flat packageOneValue/Two/ThreeValue
  // fields instead — see priceForSelectedPackage.
  const isStandardPackage = quoteModel?.quoteTypeID === QUOTE_TYPE_ID.Package;
  const isPackageBased = isStandardPackage || isCustomPackage;
  // Keying off the field itself (rather than `|| []` inline) keeps this
  // reference-stable for the pricing effect's dependency array. Sent to the
  // pricing API as-is so switching the active package never needs a refetch.
  const selectedPackageIDs = useMemo(
    () => quoteModel?.servicePackageID || [],
    [quoteModel?.servicePackageID],
  );

  // The proposal is only ever priced against ONE package at a time, so this
  // is a single proposal-level selection shared by both FeeSections below.
  // Auto-selected only when there's exactly one configured package; with
  // more than one, the client must explicitly pick one (footer Accept stays
  // disabled until they do).
  const [selectedPackageID, setSelectedPackageID] = useState(() =>
    selectedPackageIDs.length === 1 ? selectedPackageIDs[0] : null,
  );
  useEffect(() => {
    if (selectedPackageID === null && selectedPackageIDs.length === 1) {
      setSelectedPackageID(selectedPackageIDs[0]);
    }
  }, [selectedPackageID, selectedPackageIDs]);

  // Mirrors the selection state upward so the parent can gate the footer
  // Accept button on it.
  useEffect(() => {
    onSelectedPackageChange?.(selectedPackageID);
  }, [selectedPackageID, onSelectedPackageChange]);

  // GetValueOf tells GetCalculatedServicesPriceByPackages which billing
  // period to scale recurring prices down to — the backend does the
  // scaling, so the response's price/packageXValue figures already reflect
  // it and don't need further client-side division.
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

  // Services priced via a global pricing driver (captured on the Additional
  // Information step) need that driver value merged in too, otherwise they
  // reach the backend as driverValue: null and price at some fallback.
  const additionalDriverEntries = useMemo(
    () => buildAdditionalInformationDriverEntries(additionalInformationList),
    [additionalInformationList],
  );

  // additionalDriverEntries are sent as-is, with no serviceChargeTypeID/
  // serviceCatID — a global pricing driver's value can feed more than one
  // service's pricing formula (e.g. both a recurring and a one-off service
  // referencing the same driver), so tagging the row to a single charge
  // type would make the backend zero it out for every other service.
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

  // The Services step's "Next" gate normally blocks a required driver field
  // being left unset, but the step tabs let a visited step be reached
  // directly, skipping that gate — so re-check the same requirement here
  // before firing the pricing request. Standard Package quotes have no
  // Services step (every selection comes from the admin's own defaults), so
  // this check doesn't apply to them.
  const hasIncompleteSelections = useMemo(
    () =>
      !isStandardPackage &&
      (validateSelectionsMap(recurringSelections, recurringServiceByID)
        .hasError ||
        validateSelectionsMap(oneOffSelections, oneOffServiceByID).hasError ||
        Object.keys(
          getAdditionalInformationFieldErrors(additionalInformationList),
        ).length > 0),
    [
      isStandardPackage,
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
      (hasIncompleteSelections && !isStandardPackage)
    ) {
      return;
    }

    dispatch(
      getCalculatedServicesPriceByPackages({
        userKeyID: quoteModel.userKeyID,
        organisationKeyID: quoteModel.organisationKeyID,
        ServicePackageIDs: selectedPackageIDs,
        // GetValueOf tracks the quote's actual payment frequency for every
        // proposal type. This only affects the flat packageOneValue/Two/
        // ThreeValue fallback for a service with no serviceMappingWithPackages
        // List row — services the admin already configured for this package
        // price off that cross-join's static `price` instead.
        GetValueOf: getValueOfFrequency,
        // One-off services are billed once, so pin their request to
        // "Yearly" to keep the price stable regardless of the quote's
        // payment frequency.
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
    isStandardPackage,
  ]);

  // null means "this service isn't part of the selected package" (rendered
  // as "—"), as opposed to 0 (a real zero-value price).
  const priceByServiceID = useMemo(() => {
    const map = new Map();
    (pricing || []).forEach((item) => {
      // Already scaled to the requested GetValueOf billing period by the
      // backend — no further client-side division needed.
      const price = isPackageBased
        ? priceForSelectedPackage(
            item,
            selectedPackageID,
            isStandardPackage,
            serviceMappingWithPackagesList,
          )
        : Number(item.price) || 0;
      map.set(priceKey(item.serviceChargeTypeID, item.serviceID), price);
    });
    return map;
  }, [
    pricing,
    isPackageBased,
    isStandardPackage,
    selectedPackageID,
    serviceMappingWithPackagesList,
  ]);

  // The full list of packages this proposal was quoted with, for the
  // side-by-side price/calculation columns below — populated from the same
  // GetCalculatedServicesPriceByPackages response once it's returned.
  const packageColumns = isPackageBased ? servicesPackageList || [] : [];

  // Raw pricing response item per service — priceByServiceID above already
  // resolves this to one number for the selected package, but the
  // side-by-side columns need every package's price for the same service.
  const pricingItemByServiceID = useMemo(() => {
    const map = new Map();
    (pricing || []).forEach((item) => {
      map.set(priceKey(item.serviceChargeTypeID, item.serviceID), item);
    });
    return map;
  }, [pricing]);

  const priceByServiceAndPackage = (chargeTypeID, serviceID, packageID) =>
    priceForSelectedPackage(
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

  // Each charge type is billed (and VAT'd) independently.
  const recurringLiveVatAmount = truncateToTwoDecimals(
    (recurringLiveNetTotal * (Number(vatPercentage) || 0)) / 100,
  );
  const recurringLiveGrandTotal =
    recurringLiveNetTotal + recurringLiveVatAmount;

  const oneOffLiveVatAmount = truncateToTwoDecimals(
    (oneOffLiveNetTotal * (Number(vatPercentage) || 0)) / 100,
  );
  const oneOffLiveGrandTotal = oneOffLiveNetTotal + oneOffLiveVatAmount;

  // When selections still match the quote model's hydrated defaults, show
  // the amounts the quote was already priced/discounted at instead of a
  // fresh recalculation — the stored figures may include discounts a naive
  // net * vat% recompute wouldn't reproduce.
  const quotationFinalAmountList = quoteModel?.quotationFinalAmountList || [];

  // Package/Custom Package quotes store one quotationFinalAmountList row per
  // selected package per charge type, instead of the single
  // servicePackageID: null row a Service quote has. Defaults to the
  // currently selected package, but also takes an explicit packageID so
  // buildPackageTotalsList below can look up any package's own row.
  const findFinalAmount = (chargeTypeID, packageID = selectedPackageID) => {
    if (!isPackageBased) {
      return quotationFinalAmountList.find(
        (item) =>
          Number(item.serviceChargeTypeID) === chargeTypeID &&
          !item.servicePackageID,
      );
    }

    return (
      quotationFinalAmountList.find(
        (item) =>
          Number(item.serviceChargeTypeID) === chargeTypeID &&
          item.servicePackageID !== null &&
          item.servicePackageID !== undefined &&
          String(item.servicePackageID) === String(packageID),
      ) || null
    );
  };

  // One buildChargeTypeTotals result per package, each computed against
  // that package's own agreed discount % and net total — shown as the
  // side-by-side calculation columns.
  const buildPackageTotalsList = (chargeTypeID, selectedItems, unchanged) =>
    packageColumns.map((pkg) => {
      const finalAmountRow = findFinalAmount(
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
      const liveVatAmount = truncateToTwoDecimals(
        (liveNetTotal * (Number(vatPercentage) || 0)) / 100,
      );

      const totals = buildChargeTypeTotals({
        finalAmount: unchanged ? finalAmountRow : null,
        defaultFinalAmount: finalAmountRow,
        liveNetTotal,
        liveVatAmount,
        liveGrandTotal: liveNetTotal + liveVatAmount,
        vatPercentage,
        adminDiscountPercentage:
          finalAmountRow?.discountPercentageWithAllDecimal,
        chargeTypeLabel:
          chargeTypeID === SERVICE_CHARGE_TYPE_ID.RECURRING
            ? "recurring"
            : "one-off",
        isPackageBased: true,
      });

      return { pkg, totals };
    });

  // A global pricing driver's value lives in the separate Additional
  // Information list, not in recurringSelections/oneOffSelections —
  // selectionsMatch alone can't see an edit there, so check it separately
  // or a changed driver value could leave a stale stored total on screen.
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
  // charge type — the "what the client was already quoted" baseline for the
  // amendment-discount check below, used regardless of whether current
  // selections still match it. paymentFrequencyID is fixed/read-only in the
  // web proposal, so this stored value already matches it and needs no
  // further scaling.
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
  // field — their agreed discount lives on the package's own
  // quotationFinalAmountList row(s) instead.
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

  // Side-by-side per-package calculation columns — only built when there's
  // more than one package to compare.
  const hasMultiplePackagesForTotals = packageColumns.length > 1;
  const recurringPackageTotalsList = hasMultiplePackagesForTotals
    ? buildPackageTotalsList(
        SERVICE_CHARGE_TYPE_ID.RECURRING,
        recurringSelectedList,
        recurringUnchanged,
      )
    : [];
  const oneOffPackageTotalsList = hasMultiplePackagesForTotals
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
  const organisationName = themeSettings?.tradingBusinessName || "Outbooks";
  const preparedOn = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  // Package/Custom Package proposals are priced against exactly one
  // currently selected package — shown here so the client sees which
  // package the figures below belong to.
  const selectedPackage = packageColumns.find(
    (pkg) => String(pkg.servicePackageID) === String(selectedPackageID),
  );

  return (
    <div
      className="flex h-full overflow-hidden p-1.5 sm:p-3"
      style={{ backgroundColor: theme.background }}
    >
      {/* Full width on mobile; from lg up, w-[90%] leaves a consistent gap
          on the right, matching the PDF step's card width. */}
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
              {isPackageBased && selectedPackage && (
                <span
                  className="mt-1 inline-flex max-w-full items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold"
                  style={{
                    backgroundColor: `${theme.primary}14`,
                    color: theme.primary,
                  }}
                >
                  <Check size={11} strokeWidth={3} className="flex-shrink-0" />
                  <span className="truncate">
                    {selectedPackage.servicePackageName}
                  </span>
                </span>
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
            section with a title/icon to tell them apart */}
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
                  isPackageBased={isPackageBased}
                  isStandardPackage={isStandardPackage}
                  packageColumns={packageColumns}
                  priceByServiceAndPackage={priceByServiceAndPackage}
                  packageTotalsList={recurringPackageTotalsList}
                  selectedPackageID={selectedPackageID}
                  onSelectPackage={setSelectedPackageID}
                  selectedPackageName={
                    isPackageBased ? selectedPackage?.servicePackageName : null
                  }
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
                  isPackageBased={isPackageBased}
                  isStandardPackage={isStandardPackage}
                  packageColumns={packageColumns}
                  priceByServiceAndPackage={priceByServiceAndPackage}
                  packageTotalsList={oneOffPackageTotalsList}
                  selectedPackageID={selectedPackageID}
                  onSelectPackage={setSelectedPackageID}
                  selectedPackageName={
                    isPackageBased ? selectedPackage?.servicePackageName : null
                  }
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
