import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Loader2, Repeat, Package } from "lucide-react";

import { selectQuoteModel } from "../../../redux/reducer/webProposal";
import {
  selectRecurringServices,
  selectOneOffServices,
  selectRecurringSelections,
  selectOneOffSelections,
  selectServicesPricing,
  selectServicesPricingLoading,
  selectServicesPricingError,
  selectServicesVatPercentage,
  selectServicesCurrencyID,
  getCalculatedServicesPriceByPackages,
} from "../../../redux/reducer/webProposal/services";

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
  const visibleDrivers = (serviceDef?.pricingDriverList || []).filter(
    (driver) => driver.driverVisibility,
  );

  const base = {
    serviceID: selection.serviceID,
    serviceChargeTypeID,
    serviceCatID: selection.serviceCatID,
    textID: null,
    dateID: null,
  };

  if (visibleDrivers.length === 0) {
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
  vatPercentage,
  vatAmount,
  grandTotal,
}) {
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
    return [...recurring, ...oneOff];
  }, [
    recurringSelections,
    oneOffSelections,
    recurringServiceByID,
    oneOffServiceByID,
  ]);

  useEffect(() => {
    // Only recalculate when the user actually switches onto this step —
    // every step's component stays mounted (just hidden) for the life of
    // the flow, so without this guard the pricing call would fire as soon
    // as the page loads instead of when the Pricing Table step is opened.
    if (
      !isActive ||
      !quoteModel?.organisationKeyID ||
      calculateServicesGPDList.length === 0
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

  const recurringNetTotal = useMemo(
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

  const oneOffNetTotal = useMemo(
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
  const recurringVatAmount =
    (recurringNetTotal * (Number(vatPercentage) || 0)) / 100;
  const recurringGrandTotal = recurringNetTotal + recurringVatAmount;

  const oneOffVatAmount = (oneOffNetTotal * (Number(vatPercentage) || 0)) / 100;
  const oneOffGrandTotal = oneOffNetTotal + oneOffVatAmount;

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
      className="flex h-full justify-center overflow-hidden p-5"
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

        {/* Services — recurring and one-off each get their own accent-tinted
            section so the two charge types are unmistakably separate */}
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
                  netTotal={recurringNetTotal}
                  vatPercentage={vatPercentage}
                  vatAmount={recurringVatAmount}
                  grandTotal={recurringGrandTotal}
                />
              )}

              {hasOneOff && (
                <FeeSection
                  theme={theme}
                  title="One-off Fees"
                  icon={Package}
                  accent={theme.secondary}
                  items={oneOffSelectedList}
                  categoryGroups={oneOffCategoryGroups}
                  chargeTypeID={SERVICE_CHARGE_TYPE_ID.ONE_OFF}
                  priceByServiceID={priceByServiceID}
                  pricingLoading={pricingLoading}
                  formatAmount={formatAmount}
                  netTotal={oneOffNetTotal}
                  vatPercentage={vatPercentage}
                  vatAmount={oneOffVatAmount}
                  grandTotal={oneOffGrandTotal}
                />
              )}
            </>
          )}

          {pricingError && (
            <p className="mt-2 text-xs text-red-600">
              Failed to calculate service pricing.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
