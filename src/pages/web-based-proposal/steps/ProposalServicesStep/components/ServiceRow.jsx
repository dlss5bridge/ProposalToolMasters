import { Check } from "lucide-react";
import PricingDriverField from "./PricingDriverField";

const ServiceRow = ({ service, isSelected, disabledReason, driverValues, onToggle, onDriverChange }) => {
  const visibleDrivers = (service.pricingDriverList || []).filter(
    (driver) => driver.driverVisibility,
  );
  const isDisabled = Boolean(disabledReason);

  return (
    <div className={isDisabled ? "opacity-60" : ""}>
      <button
        type="button"
        disabled={isDisabled}
        onClick={onToggle}
        className={`w-full flex items-center justify-between gap-3 px-4 py-2.5 text-left transition-colors
          ${isSelected ? "bg-blue-50" : "bg-white hover:bg-gray-50"}
          disabled:cursor-not-allowed
        `}
      >
        <span>
          <span className="block text-sm font-medium text-gray-900">{service.serviceName}</span>
          {disabledReason && (
            <span className="block text-xs text-amber-600 mt-0.5">{disabledReason}</span>
          )}
        </span>

        {isSelected && (
          <span className="shrink-0 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
            <Check size={12} className="text-white" strokeWidth={3} />
          </span>
        )}
      </button>

      {isSelected && visibleDrivers.length > 0 && (
        <div className="px-4 pb-3 pt-1 space-y-3 bg-blue-50/40">
          {visibleDrivers.map((driver) => (
            <PricingDriverField
              key={driver.globalPricingDriverID}
              driver={driver}
              entry={driverValues?.[driver.globalPricingDriverID]}
              onChange={(patch) => onDriverChange(driver.globalPricingDriverID, patch)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ServiceRow;
