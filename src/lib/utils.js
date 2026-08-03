import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const PLATFORMS = {
  XERO: "Xero",
  QUICKBOOKS: "QuickBooks",
};

export const getActivePlatform = () => {
  try {
    const data = JSON.parse(localStorage.getItem("persist:Bookkeeping"));
    const bookkeeping = JSON.parse(data?.bookkeeping || "{}");

    if (bookkeeping?.Xero) return PLATFORMS.XERO;
    if (bookkeeping?.QuickBooks) return PLATFORMS.QUICKBOOKS;

    return null;
  } catch (err) {
    console.error("Error reading platform from localStorage", err);
    return null;
  }
};

export function getDriversForServiceScopeRaw(subService) {
  if (!subService) return [];
  if (
    Array.isArray(subService.pricingDriverList) &&
    subService.pricingDriverList.length > 0
  ) {
    return subService.pricingDriverList;
  }
  if (Array.isArray(subService.gpdList) && subService.gpdList.length > 0) {
    return subService.gpdList;
  }
  return [];
}

export function getServiceScopeDriverList(subService) {
  const raw = getDriversForServiceScopeRaw(subService);
  if (!Array.isArray(raw)) return [];
  return raw.map((d) => {
    if (!d) return d;
    if (Array.isArray(d.variation)) return d;
    const hasVariationName =
      d.variationName != null && String(d.variationName).trim() !== "";
    return {
      ...d,
      variation: null,
      driverValue: hasVariationName ? d.variationName : d.driverValue,
    };
  });
}
