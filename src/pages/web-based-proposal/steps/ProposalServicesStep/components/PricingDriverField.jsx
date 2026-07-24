import Select from "react-select";
// import { primarySelectStyles } from "../../../../Utils/Utils";

// driverTypeID: 2 = quantity (number input), 3 = variation (select), 4 = slab (select)
const PricingDriverField = ({ driver, entry, onChange }) => {
  if (driver.driverTypeID === 2) {
    const quantity = driver.quantity?.[0];

    return (
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          {driver.driverName}
        </label>
        <input
          type="number"
          value={entry?.value ?? ""}
          min={quantity?.quantityFrom || undefined}
          max={quantity?.quantityTo || undefined}
          onChange={(e) => onChange({ value: e.target.value })}
          placeholder={`Enter ${driver.driverName}`}
          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
        />
      </div>
    );
  }

  const isSlab = driver.driverTypeID === 4;
  if (driver.driverTypeID === 3 || isSlab) {
    const source = isSlab ? driver.slab : driver.variation;
    const options = (source || []).map((option) => ({
      value: isSlab ? option.slabID : option.variationID,
      label: isSlab
        ? option.slabTypeName || `${option.slabFrom} - ${option.slabTo}`
        : option.variationName,
    }));
    const selected =
      options.find((option) => option.value === entry?.value) || null;

    return (
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          {driver.driverName}
        </label>
        <Select
          options={options}
          value={selected}
          onChange={(option) =>
            onChange({
              value: option?.value ?? null,
              label: option?.label ?? null,
            })
          }
          // styles={primarySelectStyles}
          menuPortalTarget={document.body}
          placeholder={`Select ${driver.driverName}`}
        />
      </div>
    );
  }

  return null;
};

export default PricingDriverField;
