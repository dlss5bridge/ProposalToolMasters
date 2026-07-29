import Select from "react-select";

// driverTypeID: 2 = quantity (number input), 3 = variation (select), 4 = slab (select)
const PricingDriverField = ({ driver, entry, errorMessage, onChange }) => {
  if (driver.driverTypeID === 2) {
    const quantity = driver.quantity?.[0];

    return (
      <div>
        <label className="pss-field-label">
          {driver.driverName}
          <span className="pss-field-required-mark">*</span>
        </label>
        <input
          type="number"
          value={entry?.value ?? ""}
          min={quantity?.quantityFrom || undefined}
          max={quantity?.quantityTo || undefined}
          onChange={(e) => onChange({ value: e.target.value })}
          placeholder={`Enter ${driver.driverName}`}
          className={`pss-field-input${errorMessage ? " pss-field-input--error" : ""}`}
        />
        {errorMessage && <p className="pss-field-error">{errorMessage}</p>}
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
        <label className="pss-field-label">
          {driver.driverName}
          <span className="pss-field-required-mark">*</span>
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
          menuPortalTarget={document.body}
          placeholder={`Select ${driver.driverName}`}
          styles={{
            control: (base) => ({
              ...base,
              borderColor: errorMessage ? "#f87171" : base.borderColor,
            }),
          }}
        />
        {errorMessage && <p className="pss-field-error">{errorMessage}</p>}
      </div>
    );
  }

  return null;
};

export default PricingDriverField;
