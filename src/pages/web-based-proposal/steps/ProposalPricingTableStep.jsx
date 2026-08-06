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
  getCalculatedServicesPriceByPackages,
} from "../../../redux/reducer/webProposal/services";
import {
  selectAdditionalInformationList,
  getAdditionalInformationFieldErrors,
  buildAdditionalInformationDriverEntries,
} from "../../../redux/reducer/webProposal/additionalInformation";
import { validateSelectionsMap } from "./ProposalServicesStep/utils/validateSelectionFields";

const CURRENCY_SYMBOLS = { 1: "£", 2: "€", 3: "$", 4: "₹" };

const SERVICE_CHARGE_TYPE_ID = { RECURRING: 1, ONE_OFF: 2 };

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
  // step instead — taggedAdditionalDriverEntries supplies its row. Emitting
  // a driverValue: null placeholder here as well would send a second,
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

// A charge type's Calculation-card figures. When the selections still match
// the quote's hydrated defaults, the stored final amount (with whatever
// discount it already carries) is shown as-is. Otherwise — e.g. on an
// Amendment proposal where the client has swapped out the default services —
// the discount to show depends on which way the new total moved relative to
// what they were originally quoted (defaultFinalAmount):
//   - lower total: the original discount no longer applies (it was priced
//     against the higher default total), so the amendment's pre-agreed
//     discount percentage is applied to the new total instead.
//   - higher/equal total: the admin's originally agreed discount percentage
//     still applies, even though the underlying services changed.
// Either way a note explains why the discount shown differs from the
// default quote's.
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
}) => {
  if (finalAmount) {
    return {
      netTotal: Number(finalAmount.netTotal) || 0,
      discountPercentage:
        Number(finalAmount.discountPercentageWithAllDecimal) || 0,
      discountAmount: Number(finalAmount.discounted) || 0,
      discountedTotal: Number(finalAmount.discountedTotal) || 0,
      vatAmount: Number(finalAmount.vat) || 0,
      grandTotal: Number(finalAmount.grandTotal) || 0,
      note: null,
    };
  }

  const defaultNetTotal = Number(defaultFinalAmount?.netTotal) || 0;
  const hasDefault = !!defaultFinalAmount;

  let discountPercentage = 0;
  let note = null;

  if (
    hasDefault &&
    liveNetTotal < defaultNetTotal &&
    Number(amendmentDiscountPercentage) > 0
  ) {
    discountPercentage = Number(amendmentDiscountPercentage);
    note = `Updated ${chargeTypeLabel} services total less than the originally agreed amount, so the original discount no longer applies and the ${discountPercentage}% amendment discount has been applied instead.`;
  } else if (
    hasDefault &&
    liveNetTotal >= defaultNetTotal &&
    Number(adminDiscountPercentage) > 0
  ) {
    discountPercentage = Number(adminDiscountPercentage);
    note = `${chargeTypeLabel.charAt(0).toUpperCase()}${chargeTypeLabel.slice(1)} services have changed, but the originally agreed ${discountPercentage}% discount still applies.`;
  }

  if (discountPercentage <= 0) {
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

  const discountAmount = (liveNetTotal * discountPercentage) / 100;
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
}) {
  const hasDiscount = Number(discountPercentage) > 0;
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
          </span>
        </div>
        <span className="text-xs" style={{ color: theme.textSecondary }}>
          {items.length} service{items.length === 1 ? "" : "s"}
        </span>
      </div>

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
                priceByServiceID.get(priceKey(chargeTypeID, item.serviceID)) ||
                0;

              return (
                <div
                  key={item.serviceID}
                  className="flex items-center justify-between gap-3 border-b px-3 py-2.5 last:border-b-0"
                  style={{ borderColor: theme.border }}
                >
                  <span
                    className="truncate text-sm"
                    style={{ color: theme.textPrimary }}
                  >
                    {item.serviceName}
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

      {/* Calculation — visually separate, tinted block so it reads as a
          distinct summary rather than a continuation of the item list */}
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
                Discount ({Number(discountPercentage)}%)
              </span>
              <span style={{ color: theme.textSecondary }}>
                (-) {formatAmount(discountAmount)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span style={{ color: theme.textSecondary }}>
                Discounted Total
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

  const pricing = useSelector(selectServicesPricing);
  const pricingLoading = useSelector(selectServicesPricingLoading);
  const pricingError = useSelector(selectServicesPricingError);
  const vatPercentage = useSelector(selectServicesVatPercentage);
  const currencyID = useSelector(selectServicesCurrencyID);

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

  // additionalDriverEntries carry only serviceID + the driver value — unlike
  // every recurring/oneOff row, they have no serviceChargeTypeID/serviceCatID,
  // so the backend can't tell which formula (recurring vs one-off) a given
  // service's global driver value belongs to. Tag each entry with the charge
  // type(s) of the currently selected service it matches — a service can be
  // selected under both charge types at once, so emit one row per match.
  const taggedAdditionalDriverEntries = useMemo(
    () =>
      additionalDriverEntries.flatMap((entry) => {
        const matches = [];
        const recurringSelection = recurringSelections?.[entry.serviceID];
        if (recurringSelection) {
          matches.push({
            ...entry,
            serviceChargeTypeID: SERVICE_CHARGE_TYPE_ID.RECURRING,
            serviceCatID: recurringSelection.serviceCatID,
          });
        }
        const oneOffSelection = oneOffSelections?.[entry.serviceID];
        if (oneOffSelection) {
          matches.push({
            ...entry,
            serviceChargeTypeID: SERVICE_CHARGE_TYPE_ID.ONE_OFF,
            serviceCatID: oneOffSelection.serviceCatID,
          });
        }
        return matches.length > 0 ? matches : [entry];
      }),
    [additionalDriverEntries, recurringSelections, oneOffSelections],
  );

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
    return [...recurring, ...oneOff, ...taggedAdditionalDriverEntries];
  }, [
    recurringSelections,
    oneOffSelections,
    recurringServiceByID,
    oneOffServiceByID,
    taggedAdditionalDriverEntries,
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
        ServicePackageIDs: [],
        GetValueOf: null,
        calculateServicesGPDList,
      }),
    );
  }, [
    dispatch,
    isActive,
    quoteModel?.organisationKeyID,
    quoteModel?.userKeyID,
    calculateServicesGPDList,
    hasIncompleteSelections,
  ]);

  const priceByServiceID = useMemo(() => {
    const map = new Map();
    (pricing || []).forEach((item) =>
      map.set(
        priceKey(item.serviceChargeTypeID, item.serviceID),
        Number(item.price) || 0,
      ),
    );
    return map;
  }, [pricing]);

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
  const findFinalAmount = (chargeTypeID) =>
    quotationFinalAmountList.find(
      (item) =>
        Number(item.serviceChargeTypeID) === chargeTypeID &&
        !item.servicePackageID,
    );

  const recurringUnchanged = selectionsMatch(
    recurringSelections,
    defaultRecurringSelections,
  );
  const oneOffUnchanged = selectionsMatch(
    oneOffSelections,
    defaultOneOffSelections,
  );

  // defaultFinalAmount is the quote's originally saved pricing for this
  // charge type — used as the "what the client was already quoted" baseline
  // for the amendment-discount check below, regardless of whether the
  // current selections still match it.
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

  const recurringTotals = buildChargeTypeTotals({
    finalAmount: recurringFinalAmount,
    defaultFinalAmount: defaultRecurringFinalAmount,
    liveNetTotal: recurringLiveNetTotal,
    liveVatAmount: recurringLiveVatAmount,
    liveGrandTotal: recurringLiveGrandTotal,
    vatPercentage,
    amendmentDiscountPercentage:
      quoteModel?.recurringDiscountPercentageForAmendment,
    adminDiscountPercentage: quoteModel?.recurringDiscountPercentage,
    chargeTypeLabel: "recurring",
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
    adminDiscountPercentage: quoteModel?.oneOffDiscountPercentage,
    chargeTypeLabel: "one-off",
  });

  const recurringVatPercentage = recurringFinalAmount
    ? Number(recurringFinalAmount.vatPercentage) || 0
    : Number(vatPercentage) || 0;
  const oneOffVatPercentage = oneOffFinalAmount
    ? Number(oneOffFinalAmount.vatPercentage) || 0
    : Number(vatPercentage) || 0;

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

  return (
    <div
      className="flex h-full justify-center overflow-hidden p-3"
      style={{ backgroundColor: theme.background }}
    >
      <div
        className="flex h-full w-full max-w-6xl flex-col overflow-hidden rounded-2xl border bg-white shadow-lg"
        style={{ borderColor: theme.border }}
      >
        <div
          className="h-1 flex-shrink-0"
          style={{ background: theme.primary }}
        />

        {/* Header — polished but compact, always visible, never scrolls */}
        <div
          className="flex flex-shrink-0 items-center justify-between border-b px-5 py-3.5"
          style={{
            background: `linear-gradient(to right, ${theme.primary}14, ${theme.primary}00)`,
            borderColor: theme.border,
          }}
        >
          <div className="flex items-center gap-3">
            <span
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
              style={{ backgroundColor: theme.primary }}
            >
              {clientName.charAt(0).toUpperCase()}
            </span>
            <div>
              <h2
                className="text-base font-semibold leading-tight"
                style={{ color: theme.textPrimary }}
              >
                {clientName}
              </h2>
              <p
                className="text-xs leading-tight"
                style={{ color: theme.textSecondary }}
              >
                Prepared by {organisationName} &middot; {preparedOn}
              </p>
            </div>
          </div>
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
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
        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">
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
