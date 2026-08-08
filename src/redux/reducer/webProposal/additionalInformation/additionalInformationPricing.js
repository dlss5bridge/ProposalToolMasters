import { parse, isValid, isEqual, isAfter, isBefore } from "date-fns";

const parseFormattedDate = (dateStr, formatStr) => {
  if (!dateStr) return null;
  const parsed = parse(dateStr, formatStr, new Date());
  return isValid(parsed) ? parsed : null;
};

// The date field renders as a native <input type="date">, which always
// yields "yyyy-MM-dd" regardless of the block's own dateFormat (that format
// only applies to fromDate/toDate as configured by the org admin).
const resolveDateDriver = (item) => {
  const blocks = item.date || [];
  const selectedDate = parseFormattedDate(item.enteredDate, "yyyy-MM-dd");
  if (!selectedDate || blocks.length === 0) {
    return { driverValue: null, dateID: null };
  }

  const dateFormat = blocks[0]?.dateFormat || "dd-MM-yyyy";
  const matchedBlock =
    blocks.find((block) => {
      const from = parseFormattedDate(block.fromDate, dateFormat);
      const to = parseFormattedDate(block.toDate, dateFormat);

      if (from && to) {
        return (
          (isEqual(selectedDate, from) || isAfter(selectedDate, from)) &&
          (isEqual(selectedDate, to) || isBefore(selectedDate, to))
        );
      }
      if (from && !to) {
        return isEqual(selectedDate, from) || isAfter(selectedDate, from);
      }
      if (!from && to) {
        return isEqual(selectedDate, to) || isBefore(selectedDate, to);
      }
      return false;
    }) || blocks.find((block) => block.isDefault);

  if (!matchedBlock) {
    return { driverValue: blocks[0]?.defaultDateValue ?? null, dateID: null };
  }

  return {
    driverValue: matchedBlock.dateValue ?? matchedBlock.defaultDateValue ?? null,
    dateID: matchedBlock.dateID ?? null,
  };
};

// Turns the Additional Information step's list into the row shape
// GetCalculatedServicesPriceByPackages expects, one entry per visible
// global pricing driver — mirroring extractServiceData's AdditionalData
// block in AddUpdateProposal.jsx, adapted to this list's field names
// (enteredText/enteredDate instead of a pre-resolved driverValue).
export const buildAdditionalInformationDriverEntries = (list) =>
  (list || [])
    .filter((item) => item.driverTypeID !== 1 && item.serviceID != null)
    .map((item) => {
      const base = {
        serviceID: item.serviceID,
        globalPricingDriverID: item.globalPricingDriverID,
        driverValue: null,
        variationID: null,
        slabID: null,
        textID: null,
        dateID: null,
      };

      if (item.driverTypeID === 2) {
        return {
          ...base,
          driverValue:
            item.driverValue !== undefined && item.driverValue !== ""
              ? Number(item.driverValue)
              : null,
        };
      }

      if (item.driverTypeID === 3) {
        const variationID = item.driverValue ?? null;
        return {
          ...base,
          variationID,
          driverValue:
            item.variation?.find(
              (option) => option.variationID === variationID,
            )?.variationValue ?? null,
        };
      }

      if (item.driverTypeID === 4) {
        const slabID = item.driverValue ?? null;
        return {
          ...base,
          slabID,
          driverValue:
            item.slab?.find((option) => option.slabID === slabID)
              ?.slabValue ?? null,
        };
      }

      if (item.driverTypeID === 5) {
        // The price contribution of a free-text driver is a fixed value tied
        // to the driver itself, not derived from what the user typed.
        const textBlock = item.text?.[0] ?? null;
        return {
          ...base,
          textID: textBlock?.textID ?? null,
          driverValue: textBlock?.textValue ?? null,
        };
      }

      if (item.driverTypeID === 6) {
        const { driverValue, dateID } = resolveDateDriver(item);
        return { ...base, dateID, driverValue };
      }

      return base;
    });

// Whether the price-relevant part of the Additional Information list has
// changed since it was fetched — i.e. the same comparison
// ProposalPricingTableStep's selectionsMatch does for per-service driver
// values, but for the separate global-pricing-driver list. Compares the
// *resolved* driverValue (via buildAdditionalInformationDriverEntries)
// rather than the raw list, so an edit only counts as a change if it
// actually affects price (e.g. re-selecting the same variation doesn't).
export const additionalInformationEntriesMatch = (listA, listB) => {
  const normalize = (list) =>
    JSON.stringify(
      buildAdditionalInformationDriverEntries(list)
        .map((entry) => ({
          serviceID: entry.serviceID,
          globalPricingDriverID: entry.globalPricingDriverID,
          driverValue: entry.driverValue,
          variationID: entry.variationID,
          slabID: entry.slabID,
          textID: entry.textID,
          dateID: entry.dateID,
        }))
        .sort((a, b) =>
          `${a.serviceID}_${a.globalPricingDriverID}`.localeCompare(
            `${b.serviceID}_${b.globalPricingDriverID}`,
          ),
        ),
    );

  return normalize(listA) === normalize(listB);
};
