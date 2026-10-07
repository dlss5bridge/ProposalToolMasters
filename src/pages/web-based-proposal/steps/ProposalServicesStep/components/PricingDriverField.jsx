import Select from "react-select";

// driverTypeID: 2 = quantity (number input), 3 = variation (select), 4 = slab (select)
const PricingDriverField = ({
  driver,
  entry,
  errorMessage,
  disabled,
  onChange,
}) => {
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
          step="0.01"
          disabled={disabled}
          onChange={(e) => {
            const value = e.target.value;
            // Blocks a 3rd+ decimal digit as it's typed instead of
            // formatting it away afterwards.
            if (value !== "" && !/^\d*\.?\d{0,2}$/.test(value)) return;
            onChange({ value });
          }}
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
      // slabTypeID 2 is a fixed-value slab, everything else is a range.
      label: isSlab
        ? option.slabTypeID === 2
          ? String(option.slabValue)
          : `${option.slabFrom} - ${option.slabTo}`
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
          isDisabled={disabled}
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
            // Without this the portalled menu sits behind the MUI modal
            // (z-index 1300+), since react-select defaults to z-index 1.
            menuPortal: (base) => ({ ...base, zIndex: 9999 }),
          }}
        />
        {errorMessage && <p className="pss-field-error">{errorMessage}</p>}
      </div>
    );
  }

  return null;
};

export default PricingDriverField;
