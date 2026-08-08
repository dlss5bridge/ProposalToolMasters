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
  fieldErrors,
}) => {
  const Icon = getCategoryIcon(category.serviceCatName);
  const selectedCount = category.servicesList.filter((service) => selections[service.serviceID]).length;

  return (
    <div className="pss-category-card">
      <button type="button" onClick={onToggleExpand} className="pss-category-header">
        <span className="pss-category-header-left">
          <span className="pss-category-icon">
            <Icon size={18} />
          </span>
          <span className="pss-category-title-group">
            <span className="pss-category-title">{category.serviceCatName}</span>
            <span className="pss-category-meta">
              {category.servicesList.length} Services
              {selectedCount > 0 && (
                <span className="pss-category-meta-selected"> · {selectedCount} Selected</span>
              )}
            </span>
          </span>
        </span>

        <ChevronDown
          size={16}
          className={`pss-category-chevron${expanded ? " pss-category-chevron--expanded" : ""}`}
        />
      </button>

      {expanded && (
        <div className="pss-category-body">
          {category.servicesList.map((service) => {
            const isSelected = Boolean(selections[service.serviceID]);
            const isLocked = Boolean(selections[service.serviceID]?.locked);
            // isLocked is checked first: the backend may also flag an
            // admin-selected default service as isDisabled (e.g. to keep it
            // out of the catalog's own toggle logic), but the client-facing
            // message should always explain *why* — that it's part of the
            // package by default — rather than the generic "Unavailable"
            // that's meant for services not offered at all.
            const disabledReason = isLocked
              ? "Included by default"
              : service.isDisabled
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
                fieldErrors={fieldErrors?.[service.serviceID]}
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
