import Decimal from "decimal.js";

Decimal.set({
  precision: 40,
  rounding: Decimal.ROUND_HALF_UP,
});

export const decimalValue = (value) => {
  if (value === null || value === undefined || value === "") {
    return new Decimal(0);
  }

  const cleanedValue =
    typeof value === "string" ? value.replace(/,/g, "") : value;

  try {
    return new Decimal(cleanedValue);
  } catch {
    return new Decimal(0);
  }
};

export const truncateMoney = (value) => {
  return decimalValue(value).toDecimalPlaces(2, Decimal.ROUND_DOWN).toNumber();
};

export const calc2 = (value) => {
  const num = Number(value || 0);
  return Math.trunc(num * 100) / 100;
};

export const calc2Fixed = (value) => calc2(value).toFixed(2);

export function truncateVAT(value) {
  return Math.trunc(Number(value || 0) * 100) / 100;
}

export const round2 = (value) => {
  return Number(Number(value || 0).toFixed(2));
};

export const truncate2 = (value) => {
  return Math.trunc(Number(value || 0) * 100) / 100;
};

// export const safeNumber = (value) => {
//   return Number(value || 0);
// };

export const safeNumber = (value) => {
  const cleanedValue =
    typeof value === "string" ? value.replace(/,/g, "") : value;

  const numberValue = Number(cleanedValue);

  return Number.isFinite(numberValue) ? numberValue : 0;
};

// All monetary calculations are performed in cents.
export const toCents = (value) => {
  return Math.round(safeNumber(value) * 100);
};

export const fromCents = (value) => {
  return Number((value / 100).toFixed(2));
};

export const calculateVatCents = (amountCents, vatPercentage) => {
  return Math.round((amountCents * safeNumber(vatPercentage)) / 100);
};

/**
 * Calculates the custom template footer.
 *
 * Net values come from the service rows and therefore remain unchanged
 * when the discount or discounted price changes.
 *
 * Discounted VAT is calculated by proportionally distributing the
 * discounted fees across the service rows. This also supports different
 * VAT percentages for individual services.
 */
export const calculateCustomRecurringFooter = ({
  serviceGroups = [],
  discountedPrice = null,
  discountPercentage = null,
  discountAmount = null,
  fallbackVatPercentage = 0,
}) => {
  const rows = serviceGroups.flatMap((category) =>
    (category?.servicesList || []).map((service) => {
      /*
       * Normal proposal/EL flow may provide `price`.
       * Proposal-generated EL flow may provide quotation price fields.
       */
      const rawFeesValue = hasCalculationValue(service?.price)
        ? service.price
        : hasCalculationValue(service?.quotationPriceWithAllDecimal)
          ? service.quotationPriceWithAllDecimal
          : hasCalculationValue(service?.quotationPrice)
            ? service.quotationPrice
            : 0;

      const feesExact = decimalValue(rawFeesValue);

      const rawVatPercentage =
        service?.service_vat_percentage ??
        service?.serviceVatPercentage ??
        service?.vatPercentage ??
        fallbackVatPercentage ??
        0;

      const vatRateExact = decimalValue(rawVatPercentage);

      const vatExact = feesExact.mul(vatRateExact).div(100);

      return {
        feesExact,
        vatExact,
      };
    }),
  );

  /*
   * Original totals from all service rows.
   */
  const netFeesExact = rows.reduce(
    (total, row) => total.plus(row.feesExact),
    new Decimal(0),
  );

  const netVatExact = rows.reduce(
    (total, row) => total.plus(row.vatExact),
    new Decimal(0),
  );

  const netFeesIncVatExact = netFeesExact.plus(netVatExact);

  /*
   * Resolve the final discounted fees.
   *
   * Priority:
   * 1. Discounted price
   * 2. Discount percentage
   * 3. Absolute discount amount
   * 4. No discount
   */
  let discountedFeesExact = netFeesExact;

  if (hasCalculationValue(discountedPrice)) {
    discountedFeesExact = decimalValue(discountedPrice);
  } else if (hasCalculationValue(discountPercentage)) {
    const discountPercentageExact = decimalValue(discountPercentage);

    const discountFactorExact = new Decimal(1).minus(
      discountPercentageExact.div(100),
    );

    discountedFeesExact = netFeesExact.mul(discountFactorExact);
  } else if (hasCalculationValue(discountAmount)) {
    discountedFeesExact = netFeesExact.minus(decimalValue(discountAmount));
  }

  /*
   * Use the effective VAT ratio so different service VAT rates
   * continue to work correctly after the discount.
   */
  const effectiveVatRatio = netFeesExact.isZero()
    ? new Decimal(0)
    : netVatExact.div(netFeesExact);

  const discountedVatExact = discountedFeesExact.mul(effectiveVatRatio);

  const discountedFeesIncVatExact =
    discountedFeesExact.plus(discountedVatExact);

  /*
   * Discount amounts.
   */
  const discountFeesExact = netFeesExact.minus(discountedFeesExact);

  const discountVatExact = netVatExact.minus(discountedVatExact);

  const discountFeesIncVatExact = netFeesIncVatExact.minus(
    discountedFeesIncVatExact,
  );

  return {
    // Net Total
    netFees: truncateMoney(netFeesExact),
    netVat: truncateMoney(netVatExact),
    netFeesIncVat: truncateMoney(netFeesIncVatExact),

    // Discount
    discountFees: truncateMoney(discountFeesExact),
    discountVat: truncateMoney(discountVatExact),
    discountFeesIncVat: truncateMoney(discountFeesIncVatExact),

    // Grand Total / Discounted Total
    discountedFees: truncateMoney(discountedFeesExact),
    discountedVat: truncateMoney(discountedVatExact),
    discountedFeesIncVat: truncateMoney(discountedFeesIncVatExact),

    hasDiscount: discountFeesExact.greaterThan(0),
    hasPriceIncrease: discountFeesExact.lessThan(0),
  };
};

export const calculateCustomOneOffFooter = ({
  serviceGroups = [],
  discountedPrice = 0,
  fallbackVatPercentage = 0,
}) => {
  const rows = serviceGroups.flatMap((category) =>
    (category.servicesList || []).map((service) => {
      const rawFeesValue = hasCalculationValue(service?.price)
        ? service.price
        : hasCalculationValue(service?.quotationPriceWithAllDecimal)
          ? service.quotationPriceWithAllDecimal
          : hasCalculationValue(service?.quotationPrice)
            ? service.quotationPrice
            : 0;

      const feesExact = decimalValue(rawFeesValue);

      const vatRateExact = decimalValue(
        service.service_vat_percentage ?? fallbackVatPercentage,
      );

      const vatExact = feesExact.mul(vatRateExact).div(100);

      return {
        feesExact,
        vatExact,
      };
    }),
  );

  /*
   * Constant net values.
   * These values only change when the service list changes.
   */
  const netFeesExact = rows.reduce(
    (total, row) => total.plus(row.feesExact),
    new Decimal(0),
  );

  const netVatExact = rows.reduce(
    (total, row) => total.plus(row.vatExact),
    new Decimal(0),
  );

  const netFeesIncVatExact = netFeesExact.plus(netVatExact);

  /*
   * Changeable discounted values.
   */
  const discountedFeesExact = decimalValue(discountedPrice);

  /*
   * Supports both common and service-wise VAT rates.
   */
  const effectiveVatRatio = netFeesExact.isZero()
    ? new Decimal(0)
    : netVatExact.div(netFeesExact);

  const discountedVatExact = discountedFeesExact.mul(effectiveVatRatio);

  const discountedFeesIncVatExact =
    discountedFeesExact.plus(discountedVatExact);

  /*
   * Calculate discounts from exact values.
   * Never subtract displayed or already-truncated values.
   */
  const discountFeesExact = netFeesExact.minus(discountedFeesExact);

  const discountVatExact = netVatExact.minus(discountedVatExact);

  const discountFeesIncVatExact = netFeesIncVatExact.minus(
    discountedFeesIncVatExact,
  );

  return {
    // Net Total row
    netFees: truncateMoney(netFeesExact),
    netVat: truncateMoney(netVatExact),
    netFeesIncVat: truncateMoney(netFeesIncVatExact),

    // Discount row
    discountFees: truncateMoney(discountFeesExact),
    discountVat: truncateMoney(discountVatExact),
    discountFeesIncVat: truncateMoney(discountFeesIncVatExact),

    // Grand Total row
    discountedFees: truncateMoney(discountedFeesExact),
    discountedVat: truncateMoney(discountedVatExact),
    discountedFeesIncVat: truncateMoney(discountedFeesIncVatExact),

    hasDiscount: discountFeesExact.greaterThan(0),
    hasPriceIncrease: discountFeesExact.lessThan(0),
  };
};

const CUSTOM_PACKAGE_FIELDS = [
  {
    valueKey: "packageOneValue",
    originalValueKey: "originalPackageOneValue",
    packageIDKey: "packageOneID",
  },
  {
    valueKey: "packageTwoValue",
    originalValueKey: "originalPackageTwoValue",
    packageIDKey: "packageTwoID",
  },
  {
    valueKey: "packageThreeValue",
    originalValueKey: "originalPackageThreeValue",
    packageIDKey: "packageThreeID",
  },
];

const createEmptyPackageFooter = () => ({
  net: 0,
  vat: 0,
  feesIncVat: 0,

  discount: 0,
  vatDiscount: 0,
  feesIncVatDiscount: 0,

  finalNet: 0,
  finalVat: 0,
  finalFeesIncVat: 0,

  hasPositiveDiscount: false,
  hasPriceIncrease: false,
});

export const calculateCustomRecurringPackageFooter = ({
  serviceGroups = [],
  packageIndex = 0,
  selectedPackageID = null,
  discountPercentage = 0,
  fallbackVatPercentage = 0,
}) => {
  const packageFields = CUSTOM_PACKAGE_FIELDS[packageIndex];

  if (!packageFields) {
    return createEmptyPackageFooter();
  }

  const { valueKey, originalValueKey, packageIDKey } = packageFields;

  let netFeesExact = new Decimal(0);
  let netVatExact = new Decimal(0);

  serviceGroups.forEach((category) => {
    (category.servicesList || []).forEach((service) => {
      const mappedPackageIDs = Array.isArray(service.servicePackageIDs)
        ? service.servicePackageIDs.map(String)
        : [];

      const servicePackageID = service[packageIDKey] ?? selectedPackageID;

      /*
       * Only include the service when it belongs to this package.
       * This also respects additional-service checkbox changes.
       */
      const isIncludedInPackage =
        servicePackageID !== null &&
        servicePackageID !== undefined &&
        mappedPackageIDs.includes(String(servicePackageID));

      if (!isIncludedInPackage) {
        return;
      }

      /*
       * originalPackage...Value retains full precision after
       * payment-frequency division.
       *
       * package...Value may already contain toFixed(2).
       */
      const originalValue = service[originalValueKey];

      const displayedValue = service[valueKey];

      const rawPackageValue =
        originalValue !== null &&
        originalValue !== undefined &&
        originalValue !== ""
          ? originalValue
          : displayedValue;

      if (
        rawPackageValue === null ||
        rawPackageValue === undefined ||
        rawPackageValue === ""
      ) {
        return;
      }

      const feesExact = decimalValue(rawPackageValue);

      const vatRateExact = decimalValue(
        service.service_vat_percentage ?? fallbackVatPercentage,
      );

      const vatExact = feesExact.mul(vatRateExact).div(100);

      netFeesExact = netFeesExact.plus(feesExact);

      netVatExact = netVatExact.plus(vatExact);
    });
  });

  const netFeesIncVatExact = netFeesExact.plus(netVatExact);

  const discountPercentageExact = decimalValue(discountPercentage);

  const discountFactor = new Decimal(1).minus(discountPercentageExact.div(100));

  /*
   * Apply the package discount to the exact package totals.
   * Do not discount each displayed/rounded service row.
   */
  const finalNetExact = netFeesExact.mul(discountFactor);

  const finalVatExact = netVatExact.mul(discountFactor);

  const finalFeesIncVatExact = finalNetExact.plus(finalVatExact);

  /*
   * Calculate discount values from exact amounts.
   * Truncation occurs only when returning the footer.
   */
  const discountExact = netFeesExact.minus(finalNetExact);

  const vatDiscountExact = netVatExact.minus(finalVatExact);

  const feesIncVatDiscountExact =
    netFeesIncVatExact.minus(finalFeesIncVatExact);

  return {
    // Constant Net Total row
    net: truncateMoney(netFeesExact),
    vat: truncateMoney(netVatExact),
    feesIncVat: truncateMoney(netFeesIncVatExact),

    // Discount row
    discount: truncateMoney(discountExact),
    vatDiscount: truncateMoney(vatDiscountExact),
    feesIncVatDiscount: truncateMoney(feesIncVatDiscountExact),

    // Grand Total / Discounted Total row
    finalNet: truncateMoney(finalNetExact),
    finalVat: truncateMoney(finalVatExact),
    finalFeesIncVat: truncateMoney(finalFeesIncVatExact),

    hasPositiveDiscount: discountExact.greaterThan(0),

    hasPriceIncrease: discountExact.lessThan(0),
  };
};

const CUSTOM_PACKAGE_ROW_FIELDS = [
  {
    valueKey: "packageOneValue",
    originalValueKey: "originalPackageOneValue",
    packageIDKey: "packageOneID",
  },
  {
    valueKey: "packageTwoValue",
    originalValueKey: "originalPackageTwoValue",
    packageIDKey: "packageTwoID",
  },
  {
    valueKey: "packageThreeValue",
    originalValueKey: "originalPackageThreeValue",
    packageIDKey: "packageThreeID",
  },
];

export const calculateCustomPackageRow = ({
  service,
  packageIndex,
  fallbackVatPercentage = 0,
}) => {
  const packageFields = CUSTOM_PACKAGE_ROW_FIELDS[packageIndex];

  if (!packageFields) {
    return {
      isIncluded: false,
      fees: 0,
      vatRate: 0,
      vat: 0,
      feesIncVat: 0,
    };
  }

  const { valueKey, originalValueKey, packageIDKey } = packageFields;

  const packageID = service?.[packageIDKey];

  const servicePackageIDs = Array.isArray(service?.servicePackageIDs)
    ? service.servicePackageIDs.map(String)
    : [];

  const isMappedToPackage =
    packageID !== null &&
    packageID !== undefined &&
    servicePackageIDs.includes(String(packageID));

  /*
   * Prefer full-precision value.
   * package...Value may already have been converted using toFixed(2).
   */
  const originalValue = service?.[originalValueKey];

  const displayedValue = service?.[valueKey];

  const rawValue =
    originalValue !== null &&
    originalValue !== undefined &&
    originalValue !== ""
      ? originalValue
      : displayedValue;

  const hasValidValue =
    rawValue !== null &&
    rawValue !== undefined &&
    rawValue !== "" &&
    decimalValue(rawValue).isFinite();

  const isIncluded = isMappedToPackage && hasValidValue;

  if (!isIncluded) {
    return {
      isIncluded: false,
      fees: 0,
      vatRate: 0,
      vat: 0,
      feesIncVat: 0,
    };
  }

  const feesExact = decimalValue(rawValue);

  const vatRateExact = decimalValue(
    service?.service_vat_percentage ?? fallbackVatPercentage,
  );

  const vatExact = feesExact.mul(vatRateExact).div(100);

  const feesIncVatExact = feesExact.plus(vatExact);

  return {
    isIncluded: true,

    fees: truncateMoney(feesExact),

    vatRate: vatRateExact.toNumber(),

    vat: truncateMoney(vatExact),

    feesIncVat: truncateMoney(feesIncVatExact),
  };
};

const CUSTOM_ONE_OFF_PACKAGE_FIELDS = [
  {
    valueKey: "packageOneValue",
    originalValueKey: "originalPackageOneValue",
    packageIDKey: "packageOneID",
  },
  {
    valueKey: "packageTwoValue",
    originalValueKey: "originalPackageTwoValue",
    packageIDKey: "packageTwoID",
  },
  {
    valueKey: "packageThreeValue",
    originalValueKey: "originalPackageThreeValue",
    packageIDKey: "packageThreeID",
  },
];

export const createEmptyOneOffPackageRow = () => ({
  isIncluded: false,

  feesExact: new Decimal(0),
  vatExact: new Decimal(0),
  feesIncVatExact: new Decimal(0),

  fees: 0,
  vatRate: 0,
  vat: 0,
  feesIncVat: 0,
});

export const createEmptyOneOffPackageFooter = () => ({
  net: 0,
  vat: 0,
  feesIncVat: 0,

  discount: 0,
  vatDiscount: 0,
  feesIncVatDiscount: 0,

  finalNet: 0,
  finalVat: 0,
  finalFeesIncVat: 0,

  hasPositiveDiscount: false,
  hasPriceIncrease: false,
});

export const calculateCustomOneOffPackageRow = ({
  service,
  packageIndex,
  selectedPackageID = null,
  fallbackVatPercentage = 0,
}) => {
  const packageFields = CUSTOM_ONE_OFF_PACKAGE_FIELDS[packageIndex];

  if (!packageFields || !service) {
    return createEmptyOneOffPackageRow();
  }

  const { valueKey, originalValueKey, packageIDKey } = packageFields;

  const packageID = service?.[packageIDKey] ?? selectedPackageID;

  const mappedPackageIDs = Array.isArray(service?.servicePackageIDs)
    ? service.servicePackageIDs.map(String)
    : [];

  const isMappedToPackage =
    packageID !== null &&
    packageID !== undefined &&
    mappedPackageIDs.includes(String(packageID));

  const originalValue = service?.[originalValueKey];

  const currentValue = service?.[valueKey];

  const hasCurrentValue =
    currentValue !== null && currentValue !== undefined && currentValue !== "";

  const hasOriginalValue =
    originalValue !== null &&
    originalValue !== undefined &&
    originalValue !== "";

  /*
   * Use the same package value used by the default table.
   * Fall back to the original full-precision value only when
   * the current package value is unavailable.
   */
  const rawFeesValue = hasCurrentValue
    ? currentValue
    : hasOriginalValue
      ? originalValue
      : null;

  const hasFeesValue =
    rawFeesValue !== null && rawFeesValue !== undefined && rawFeesValue !== "";

  if (!isMappedToPackage || !hasFeesValue) {
    return createEmptyOneOffPackageRow();
  }

  const feesExact = decimalValue(rawFeesValue);

  if (!feesExact.isFinite()) {
    return createEmptyOneOffPackageRow();
  }

  let vatRateExact = decimalValue(
    service?.service_vat_percentage ?? fallbackVatPercentage,
  );

  if (!vatRateExact.isFinite()) {
    vatRateExact = new Decimal(0);
  }

  const vatExact = feesExact.mul(vatRateExact).div(100);

  const feesIncVatExact = feesExact.plus(vatExact);

  return {
    isIncluded: true,

    // Exact values used by the footer
    feesExact,
    vatExact,
    feesIncVatExact,

    // Truncated values used by the table row
    fees: truncateMoney(feesExact),
    vatRate: vatRateExact.toNumber(),
    vat: truncateMoney(vatExact),
    feesIncVat: truncateMoney(feesIncVatExact),
  };
};

export const calculateCustomOneOffPackageFooter = ({
  serviceGroups = [],
  packageIndex = 0,
  selectedPackageID = null,
  discountPercentage = 0,
  fallbackVatPercentage = 0,
}) => {
  if (!CUSTOM_ONE_OFF_PACKAGE_FIELDS[packageIndex]) {
    return createEmptyOneOffPackageFooter();
  }

  let netFeesExact = new Decimal(0);
  let netVatExact = new Decimal(0);

  serviceGroups.forEach((category) => {
    (category.servicesList || []).forEach((service) => {
      const row = calculateCustomOneOffPackageRow({
        service,
        packageIndex,
        selectedPackageID,
        fallbackVatPercentage,
      });

      if (!row.isIncluded) {
        return;
      }

      netFeesExact = netFeesExact.plus(row.feesExact);

      netVatExact = netVatExact.plus(row.vatExact);
    });
  });

  const netFeesIncVatExact = netFeesExact.plus(netVatExact);

  let discountPercentageExact = decimalValue(discountPercentage);

  if (!discountPercentageExact.isFinite()) {
    discountPercentageExact = new Decimal(0);
  }

  const discountFactor = new Decimal(1).minus(discountPercentageExact.div(100));

  /*
   * Apply the package discount once to the exact totals.
   */
  const finalNetExact = netFeesExact.mul(discountFactor);

  const finalVatExact = netVatExact.mul(discountFactor);

  const finalFeesIncVatExact = finalNetExact.plus(finalVatExact);

  /*
   * Calculate discounts before truncation.
   */
  const discountExact = netFeesExact.minus(finalNetExact);

  const vatDiscountExact = netVatExact.minus(finalVatExact);

  const feesIncVatDiscountExact =
    netFeesIncVatExact.minus(finalFeesIncVatExact);

  return {
    // Constant Net Total
    net: truncateMoney(netFeesExact),
    vat: truncateMoney(netVatExact),
    feesIncVat: truncateMoney(netFeesIncVatExact),

    // Discount
    discount: truncateMoney(discountExact),
    vatDiscount: truncateMoney(vatDiscountExact),
    feesIncVatDiscount: truncateMoney(feesIncVatDiscountExact),

    // Final values
    finalNet: truncateMoney(finalNetExact),
    finalVat: truncateMoney(finalVatExact),
    finalFeesIncVat: truncateMoney(finalFeesIncVatExact),

    hasPositiveDiscount: discountExact.greaterThan(0),

    hasPriceIncrease: discountExact.lessThan(0),
  };
};

export const calculateCustomServiceRow = ({
  service,
  fallbackVatPercentage = 0,
}) => {
  /*
   * Normal EL normally contains `price`.
   * Proposal-generated EL may contain only quotation price fields.
   */
  const rawFeesValue = hasCalculationValue(service?.price)
    ? service.price
    : hasCalculationValue(service?.quotationPriceWithAllDecimal)
      ? service.quotationPriceWithAllDecimal
      : hasCalculationValue(service?.quotationPrice)
        ? service.quotationPrice
        : 0;

  const feesExact = decimalValue(rawFeesValue);

  const rawVatPercentage =
    service?.service_vat_percentage ??
    service?.serviceVatPercentage ??
    service?.vatPercentage ??
    fallbackVatPercentage;

  const vatRateExact = decimalValue(rawVatPercentage);

  const vatExact = feesExact.mul(vatRateExact).div(100);
  const feesIncVatExact = feesExact.plus(vatExact);

  return {
    feesExact,
    vatExact,
    feesIncVatExact,

    fees: truncateMoney(feesExact),
    vatRate: vatRateExact.toNumber(),
    vat: truncateMoney(vatExact),
    feesIncVat: truncateMoney(feesIncVatExact),
  };
};

const createEmptyCustomServiceFooter = () => ({
  net: 0,
  vat: 0,
  feesIncVat: 0,

  discount: 0,
  vatDiscount: 0,
  feesIncVatDiscount: 0,

  finalNet: 0,
  finalVat: 0,
  finalFeesIncVat: 0,

  hasPositiveDiscount: false,
  hasPriceIncrease: false,
});

export const hasCalculationValue = (value) =>
  value !== null && value !== undefined && value !== "";

export const calculateCustomServiceFooter = ({
  serviceGroups = [],
  discountPercentage = null,
  discountAmount = null,
  fallbackVatPercentage = 0,
}) => {
  let netFeesExact = new Decimal(0);
  let netVatExact = new Decimal(0);

  serviceGroups.forEach((category) => {
    (category?.servicesList || []).forEach((service) => {
      const serviceRow = calculateCustomServiceRow({
        service,
        fallbackVatPercentage,
      });

      netFeesExact = netFeesExact.plus(serviceRow.feesExact);

      netVatExact = netVatExact.plus(serviceRow.vatExact);
    });
  });

  const netFeesIncVatExact = netFeesExact.plus(netVatExact);

  let discountFactorExact = new Decimal(1);

  const hasDiscountPercentage = hasCalculationValue(discountPercentage);

  if (hasDiscountPercentage) {
    const discountPercentageExact = decimalValue(discountPercentage);

    discountFactorExact = new Decimal(1).minus(
      discountPercentageExact.div(100),
    );
  } else if (hasCalculationValue(discountAmount) && !netFeesExact.isZero()) {
    // Compatibility fallback for old proposals
    // where only the absolute discount exists.
    const discountAmountExact = decimalValue(discountAmount);

    const finalNetFromAmountExact = netFeesExact.minus(discountAmountExact);

    discountFactorExact = finalNetFromAmountExact.div(netFeesExact);
  }

  const finalNetExact = netFeesExact.mul(discountFactorExact);

  const finalVatExact = netVatExact.mul(discountFactorExact);

  const finalFeesIncVatExact = finalNetExact.plus(finalVatExact);

  const discountExact = netFeesExact.minus(finalNetExact);

  const vatDiscountExact = netVatExact.minus(finalVatExact);

  const feesIncVatDiscountExact =
    netFeesIncVatExact.minus(finalFeesIncVatExact);

  return {
    net: truncateMoney(netFeesExact),
    vat: truncateMoney(netVatExact),
    feesIncVat: truncateMoney(netFeesIncVatExact),

    discount: truncateMoney(discountExact),
    vatDiscount: truncateMoney(vatDiscountExact),
    feesIncVatDiscount: truncateMoney(feesIncVatDiscountExact),

    finalNet: truncateMoney(finalNetExact),
    finalVat: truncateMoney(finalVatExact),
    finalFeesIncVat: truncateMoney(finalFeesIncVatExact),

    hasPositiveDiscount: discountExact.greaterThan(0),

    hasPriceIncrease: discountExact.lessThan(0),
  };
};
