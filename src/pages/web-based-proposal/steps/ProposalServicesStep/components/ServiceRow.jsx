import { Check } from "lucide-react";
import PricingDriverField from "./PricingDriverField";

const ServiceRow = ({
  service,
  isSelected,
  isLocked,
  disabledReason,
  driverValues,
  fieldErrors,
  onToggle,
  onDriverChange,
}) => {
  const visibleDrivers = (service.pricingDriverList || []).filter(
    (driver) => driver.driverVisibility,
  );
  const isDisabled = Boolean(disabledReason);

  const rowClassName = [
    "pss-service-row",
    isSelected && "pss-service-row--selected",
    isDisabled && "pss-service-row--disabled",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={rowClassName}>
      <button
        type="button"
        disabled={isDisabled}
        onClick={onToggle}
        className={`pss-service-btn${isSelected ? " pss-service-btn--selected" : ""}`}
      >
        <span>
          <span className="pss-service-name">{service.serviceName}</span>
          {disabledReason && (
            <span className="pss-service-disabled-reason">
              {disabledReason}
            </span>
          )}
        </span>

        {isSelected && (
          <span className="pss-service-check">
            <Check size={12} strokeWidth={3} />
          </span>
        )}
      </button>

      {isSelected && visibleDrivers.length > 0 && (
        <div className="pss-service-drivers">
          {visibleDrivers.map((driver) => (
            <PricingDriverField
              key={driver.globalPricingDriverID}
              driver={driver}
              entry={driverValues?.[driver.globalPricingDriverID]}
              errorMessage={fieldErrors?.[driver.globalPricingDriverID]}
              disabled={isLocked}
              onChange={(patch) =>
                onDriverChange(driver.globalPricingDriverID, patch)
              }
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ServiceRow;
