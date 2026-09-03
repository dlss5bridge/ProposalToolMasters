import { Fragment, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Loader2, Repeat, Package, Check } from "lucide-react";

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

// Exported for ProposalAmendment.jsx's isAmend gate — an amendment is only
// a genuine amendment when something the client controls (a service
// selection or a driver value) actually changed from the admin's defaults.
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
// The proposal is only ever priced against ONE selected package at a time
// (selectedPackageID, shared by Recurring and One-off alike — see
// ProposalPricingTableStep below), so a service's price is whichever single
// slot matches that package, not a sum across every slot it happens to
// belong to.
const PACKAGE_PRICE_SLOTS = [
  { idKey: "packageOneID", valueKey: "packageOneValue" },
  { idKey: "packageTwoID", valueKey: "packageTwoValue" },
  { idKey: "packageThreeID", valueKey: "packageThreeValue" },
];

// GetCalculatedServicesPriceByPackages's `serviceMappingWithPackagesList`
// (one row per service per configured package: {servicePackageID, serviceID,
// serviceCatID, serviceChargeTypeID, price}) is the admin-saved per-package
// price a Standard Package quote (a fixed, non-editable service list) was
// actually agreed/discounted against — the same figure quotationFinalAmount
// List's netTotal and the PDF total add up to. That's what
// GetCalculatedServicesPriceByPackagesData (AddUpdateProposal.jsx, the
// consumer used for Standard Package, selectedProposalTypeValue === 2)
// overrides each service's price with — see its "Override package values if
// data is found in recurringServices" block. Standard Package trusts this
// cross-join match first for exactly that reason.
//
// Custom Package is deliberately different, and matches
// AddUpdateProposal.jsx's ReviewPackagesComponent exactly: for Custom
// Package (selectedProposalTypeValue === 4), the consumer is
// GetCalculatedServicesPriceData, not GetCalculatedServicesPriceByPackages
// Data — and it never reads serviceMappingWithPackagesList for price at all.
// It reads a pricing item's own flat packageOneValue/Two/ThreeValue straight
// off the API response into recArrayWithPrice, which becomes
// selectedRecurringServiceList — the exact prop ReviewPackagesComponent
// renders — with no further scaling. (serviceMappingWithPackagesList is
// still consulted there, but only to rebuild each service's
// servicePackageIDs membership list, never its price.) Returns null —
// rendered as "—" — when the service isn't part of the selected package by
// either source.
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
    // The pricing item tags a slot's packageOneID/Two/ThreeID with whichever
    // package the API put in that position, even for a package this service
    // isn't actually mapped to at all (that slot's own Value then comes back
    // null) — e.g. a service belonging only to package 1929 can still carry
    // packageOneID: 1928 with packageOneValue: null. Reading `slot` alone
    // would surface that null as 0 ("€0.00") for the unrelated package
    // instead of "—". `servicePackageIDs` is the service's actual package
    // membership list (mirrors AddUpdateProposal.jsx's ReviewPackagesComponent
    // checking `servicePackageIDs.includes(packageOneID)` before trusting
    // packageOneValue), so membership must be checked explicitly here too.
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
  // Standard Package quotes are always fully described by the cross-join —
  // no match there means the service genuinely isn't part of this package.
  return match ? Number(match.price) || 0 : null;
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
    const storedDiscountedTotal = Number(finalAmount.discountedTotal) || 0;
    const storedVatAmount = Number(finalAmount.vat) || 0;

    return {
      netTotal: storedNetTotal,
      discountPercentage: storedDiscountPercentage,
      discountAmount,
      discountedTotal: storedDiscountedTotal,
      vatAmount: storedVatAmount,
      // Derived from the other two stored fields rather than trusting
      // finalAmount.grandTotal directly — that field has been seen null on
      // a saved quote (e.g. one with no VAT configured) even though
      // discountedTotal/vat were both correctly persisted, which displayed
      // as a £0.00 Grand Total despite a real, non-zero discounted total.
      grandTotal: storedDiscountedTotal + storedVatAmount,
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
    // No nested card box here — a plain top divider is enough to separate
    // the totals from the line items above. Only the Grand Total keeps a
    // filled band, so it stays the single figure that's unmistakable at a
    // glance.
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
      {/* Grand Total gets its own emphasized band — a filled, rounded strip,
          bolder and larger than every other line above — so it's the one
          figure that's unmistakable at a glance. */}
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
  // Package/Custom Package quotes only — see ProposalPricingTableStep
  isPackageBased,
  // Standard "Package" quotes only (not Custom Package) — gates the
  // "hide services that belong to none of this proposal's packages" filter
  // below, so Custom Package's own row set stays untouched.
  isStandardPackage,
  // Every package this proposal was quoted with, one price/calculation
  // column each, plus the single shared selectedPackageID/onSelectPackage
  // that both the Recurring and One-off sections read from and write to —
  // only set (and only rendered) when there's more than one to choose
  // between; a single-package quote keeps the plain single-column layout.
  packageColumns,
  priceByServiceAndPackage,
  packageTotalsList,
  selectedPackageID,
  onSelectPackage,
  // Package/Custom Package quotes only — shown on the right of the section
  // title when there's a single package (the comparison grid already shows
  // every package's own name in its column header).
  selectedPackageName,
}) {
  const hasPackageColumns = (packageColumns?.length || 0) > 1;

  // Standard Package quotes only: a service that isn't mapped to ANY of
  // this proposal's packages has nothing to show in any column (every
  // cell would be "—"), so drop it from the grid entirely instead of
  // rendering a dead row. Custom Package keeps its full row set — its
  // client-added services are real selections, not package mappings.
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

  // The header badge must reflect what's actually rendered below, not the
  // raw selection count — for Standard Package quotes those can differ
  // (dead rows not in any package are dropped from visibleCategoryGroups
  // above), so this sums the same groups the table renders.
  const visibleServiceCount = visibleCategoryGroups.reduce(
    (sum, group) => sum + group.items.length,
    0,
  );

  return (
    // No card box, no filled header background — just a plain accent-icon
    // title row on the page's own white surface. The dark theme is reserved
    // for the Package Name headers only (see the comparison grid below).
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3">
        <div className="flex items-center gap-2.5">
          <span
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full"
            style={{ backgroundColor: `${accent}1F` }}
          >
            <Icon size={15} style={{ color: accent }} />
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="text-sm font-bold uppercase tracking-wide"
              style={{ color: accent }}
            >
              {title}
            </span>
            {/* Same "Recurring Fees (Monthly)" pattern as
                AddUpdateProposal.jsx's Review Services tab
                (getPaymentFrequencyLabel), styled as a badge so the billing
                period reads clearly at a glance instead of blending into
                the title. */}
            {frequencyLabel && (
              <span
                className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                style={{
                  backgroundColor: `${accent}1A`,
                  color: accent,
                }}
              >
                {frequencyLabel}
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-shrink-0 items-center gap-2">
          {/* Package Name, right-aligned — only shown for the single-package
              layout; the comparison grid already names every package in its
              own column header. */}
          {!hasPackageColumns && selectedPackageName && (
            <span
              className="inline-flex max-w-[45vw] items-center gap-1 truncate rounded-full px-2.5 py-1 text-xs font-semibold sm:max-w-xs"
              style={{
                backgroundColor: `${accent}1A`,
                color: accent,
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
              backgroundColor: theme.background,
              color: theme.textSecondary,
            }}
          >
            {visibleServiceCount} service{visibleServiceCount === 1 ? "" : "s"}
          </span>
        </div>
      </div>

      <div>
        {hasPackageColumns ? (
          // A CSS-grid "plan comparison" layout, not a spreadsheet table: the
          // Service column takes only as much width as it needs (capped), and
          // every package gets an equal, flexible share of whatever space is
          // left — so 2 packages fill the card just as cleanly as 4 do. Every
          // row (header, category label, service, calculation, CTA) reuses
          // the same column template so everything lines up perfectly without
          // table borders/cellspacing doing the work.
          // No nested card box here — the grid sits directly in the section.
          // Horizontal-only dividers (no vertical grid lines), quiet
          // typography for line items, and one tinted "Calculation" zone at
          // the bottom with its own bold Grand Total band — just with
          // package columns standing in for the single value column.
          <div className="overflow-x-auto overflow-y-hidden">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: `minmax(200px,260px) repeat(${packageColumns.length}, minmax(140px,1fr))`,
                minWidth: `${200 + packageColumns.length * 140}px`,
              }}
            >
              {/* Plan header row — package name only, one line, on a dark
                theme background so each package's own identity is clearly
                prominent. Selection lives on the name itself (a filled
                brand-accent pill when active) instead of a separate
                "Selected"/"Select this plan" line, so the header stays
                compact. */}
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
                list, but colored in the accent (the same tone used for the
                Calculation label below) so a category reads unmistakably
                as its own section, distinct from the neutral-grey "Service"
                column header and the plain service names beneath it. */}
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
                CalculationBlock (identical background/border tokens and
                type scale: text-sm regular lines, text-base bold Grand
                Total), just repeated once per package column instead of
                once for a single total. */}
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

              {/* Grand Total — the one filled, bold band, exactly matching
                CalculationBlock's Grand Total footer strip. */}
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

              {/* Select Package — one button per column, immediately below
                  that package's own Grand Total, so it's unambiguous which
                  package it picks. This only selects the package (same
                  effect as clicking its name above) — it never submits or
                  accepts the proposal; that's the footer Accept button's
                  job, once a package is selected. */}
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
            {/* Service details, grouped under a header per category — sits
              directly in the section (no nested card box); horizontal
              dividers alone separate items, since the plain title row above
              is already this content's only heading. */}
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
                    // Custom Package locks the admin's default services (see
                    // ProposalServicesStep) — anything without that `locked`
                    // flag was added by the client themselves, so call it out
                    // here too.
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
  // Package/Custom Package quotes only — called whenever the client's
  // selected package changes (including the initial auto-select for a
  // single-package quote), so the parent can gate its own footer Accept
  // button on whether a selection has actually been made.
  onSelectedPackageChange,
}) {
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
  // Still sent to the pricing API as-is (fetches every admin-configured
  // package's data in one request) so switching the active package below
  // never needs a refetch.
  const selectedPackageIDs = useMemo(
    () => quoteModel?.servicePackageID || [],
    [quoteModel?.servicePackageID],
  );

  // The proposal can only ever be priced/quoted against ONE package at a
  // time — Recurring and One-off are never allowed to show different
  // packages, so this is a single, proposal-level selection (not one per
  // charge type) shared by both FeeSections below. Only auto-selected when
  // there's exactly one configured package (no real choice to make); with
  // more than one, the client must explicitly pick one — the footer Accept
  // button stays disabled until they do (see onSelectedPackageChange below).
  const [selectedPackageID, setSelectedPackageID] = useState(() =>
    selectedPackageIDs.length === 1 ? selectedPackageIDs[0] : null,
  );
  useEffect(() => {
    if (selectedPackageID === null && selectedPackageIDs.length === 1) {
      setSelectedPackageID(selectedPackageIDs[0]);
    }
  }, [selectedPackageID, selectedPackageIDs]);

  // Lets the parent (StandardProposal) gate the footer Accept button on
  // whether a package has actually been selected yet — this component's own
  // selection state stays the single source of truth; the callback just
  // mirrors it upward.
  useEffect(() => {
    onSelectedPackageChange?.(selectedPackageID);
  }, [selectedPackageID, onSelectedPackageChange]);

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
  // Standard Package quotes have no Services step for the client to fill in
  // a quantity/variation/slab field — every selection comes from the
  // admin's own defaults (see buildSelectionsFromQuoteModel's driverValue
  // hydration), and GetCalculatedServicesPriceByPackages already prices
  // them successfully as-is, so this required-field check (and the "go
  // back to Services" warning it drives) only applies where the client
  // actually has a Services step to complete.
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
        // Mirrors AddUpdateProposal.jsx's handleSetCalculatedPackageServiceData/
        // handleCalculatedData: GetValueOf always tracks the quote's actual
        // payment frequency (switch on Payment_Frequency), for every
        // proposal type including Package/Custom Package. This only affects
        // the live flat packageOneValue/Two/ThreeValue fallback used for a
        // service with no serviceMappingWithPackagesList row (e.g. a Custom
        // Package client's own addition) — every service the admin already
        // configured for this package is priced from that cross-join's own
        // saved `price` instead (see priceForSelectedPackage), which is a
        // static figure GetValueOf can't scale either way.
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
    isStandardPackage,
  ]);

  // null means "this service isn't part of the selected package" (rendered
  // as "—"), as opposed to 0 (a real zero-value price) — Map.get() returning
  // undefined for an unpriced service is treated the same way by every
  // consumer below.
  const priceByServiceID = useMemo(() => {
    const map = new Map();
    (pricing || []).forEach((item) => {
      // Already scaled to the requested GetValueOf billing period by the
      // backend — none of these branches need further client-side division.
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

  // The full list of packages this proposal was quoted with (for the
  // side-by-side price/calculation columns below) — quoteModel has no
  // selectedPackagesList field of its own (that's an AddUpdateProposal.jsx
  // local-state concept, never part of GetQuoteModel's response); the
  // equivalent here is packageList, returned by
  // GetCalculatedServicesPriceByPackages itself (the same response
  // servicePackageIDs/pricing came from), so it's only populated once that
  // fetch has actually returned.
  const packageColumns = isPackageBased ? servicesPackageList || [] : [];

  // Raw pricing response item per service (packageOneID/Two/Three,
  // servicePackageIDs, etc.) — priceByServiceID above already resolves this
  // down to one number for the selected package, but the side-by-side
  // columns need to resolve every package's price for the same service, not
  // just the selected one.
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
  // Defaults to the currently selected package (a direct lookup, not a blend
  // across every package the admin configured), but also takes an explicit
  // packageID so buildPackageTotalsList below can look up any package's own
  // row for its side-by-side column.
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

  // One buildChargeTypeTotals result per package, each computed against that
  // package's own agreed discount % and its own net total (mirrors
  // AddUpdateProposal.jsx's Review Packages tab, where
  // GetNetTotalValueByRecurringPackage runs once per package) — shown as the
  // side-by-side calculation columns; the single recurringTotals/oneOffTotals
  // above (used for the plain single-column layout when there's only one
  // package) stay computed against the one selected package only.
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
      const liveVatAmount = (liveNetTotal * (Number(vatPercentage) || 0)) / 100;

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

  // Side-by-side per-package calculation columns — only built when there's
  // more than one package to actually compare; a single-package quote keeps
  // the plain single-column layout with recurringTotals/oneOffTotals above.
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
  const organisationName = quoteModel?.organisationName || "Outbooks";
  const preparedOn = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  // Package/Custom Package proposals are priced against exactly one
  // currently selected package (selectedPackageID) — shown here so the
  // client always sees which package the figures below belong to, same as
  // servicePackageName on AddUpdateProposal.jsx's selectedPackagesList.
  const selectedPackage = packageColumns.find(
    (pkg) => String(pkg.servicePackageID) === String(selectedPackageID),
  );

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
