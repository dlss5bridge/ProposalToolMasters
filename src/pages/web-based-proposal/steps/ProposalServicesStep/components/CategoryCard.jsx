import { ChevronDown } from "lucide-react";
import { getCategoryIcon } from "../utils/categoryIcon";
import ServiceRow from "./ServiceRow";

const CategoryCard = ({
  category,
  selections,
  crossSelections,
  crossLabel,
  expanded,
  onToggleExpand,
  onToggleService,
  onDriverChange,
}) => {
  const Icon = getCategoryIcon(category.serviceCatName);
  const selectedCount = category.servicesList.filter((service) => selections[service.serviceID]).length;

  return (
    <div
      className={`rounded-xl border bg-white overflow-hidden transition-colors
        ${expanded ? "border-blue-200 border-l-4 border-l-blue-500" : "border-gray-200"}
      `}
    >
      <button
        type="button"
        onClick={onToggleExpand}
        className="w-full flex items-center justify-between gap-3 p-3"
      >
        <span className="flex items-center gap-3 min-w-0">
          <span className="shrink-0 w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center">
            <Icon size={18} className="text-gray-500" />
          </span>
          <span className="min-w-0 text-left">
            <span className="block text-sm font-medium text-gray-900 truncate">
              {category.serviceCatName}
            </span>
            <span className="block text-xs text-gray-500 mt-0.5">
              {category.servicesList.length} Services
              {selectedCount > 0 && <span className="text-blue-600"> · {selectedCount} Selected</span>}
            </span>
          </span>
        </span>

        <ChevronDown
          size={16}
          className={`shrink-0 text-gray-400 transition-transform ${expanded ? "rotate-180" : ""}`}
        />
      </button>

      {expanded && (
        <div className="border-t border-gray-100 divide-y divide-gray-50">
          {category.servicesList.map((service) => {
            const isSelected = Boolean(selections[service.serviceID]);
            const disabledReason = service.isDisabled
              ? "Unavailable"
              : crossSelections[service.serviceID]
                ? `Already selected in ${crossLabel}`
                : null;

            return (
              <ServiceRow
                key={service.serviceID}
                service={service}
                isSelected={isSelected}
                disabledReason={disabledReason}
                driverValues={selections[service.serviceID]?.driverValues}
                onToggle={() => !disabledReason && onToggleService(category, service)}
                onDriverChange={(globalPricingDriverID, patch) =>
                  onDriverChange(service.serviceID, globalPricingDriverID, patch)
                }
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CategoryCard;
