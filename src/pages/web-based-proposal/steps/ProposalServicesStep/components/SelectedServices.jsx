import { useState } from "react";
import { ClipboardList, RotateCw, FileStack, X } from "lucide-react";

const PREVIEW_LIMIT = 5;

const getDriverSummary = (driverValues) =>
  Object.values(driverValues || {}).filter(
    (driver) =>
      driver.value !== "" &&
      driver.value !== null &&
      driver.value !== undefined,
  );

const SelectedGroup = ({ label, icon: Icon, items, onRemove }) => {
  if (items.length === 0) return null;

  return (
    <div>
      <div className="pss-sidebar-group-label">
        <Icon size={12} />
        <span>{label}</span>
      </div>

      <ul className="pss-sidebar-group-list">
        {items.map((item) => (
          <li key={item.serviceID} className="pss-sidebar-item">
            <div className="pss-sidebar-item-row">
              <div className="pss-sidebar-item-info">
                <p className="pss-sidebar-item-name">{item.serviceName}</p>
                <p className="pss-sidebar-item-category">{item.categoryName}</p>
              </div>
              <button
                type="button"
                onClick={() => onRemove(item.listType, item.serviceID)}
                className="pss-sidebar-item-remove"
              >
                <X size={13} />
              </button>
            </div>

            {getDriverSummary(item.driverValues).length > 0 && (
              <ul className="pss-sidebar-item-drivers">
                {getDriverSummary(item.driverValues).map((driver, index) => (
                  <li key={index} className="pss-sidebar-item-driver">
                    {driver.driverName}:{" "}
                    <span className="pss-sidebar-item-driver-value">
                      {driver.label ?? driver.value}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

const SelectedServices = ({
  recurringSelected,
  oneOffSelected,
  onRemove,
  onReviewNext,
  onBack,
  onSaveDraft,
}) => {
  const [showAll, setShowAll] = useState(false);

  const totalCount = recurringSelected.length + oneOffSelected.length;

  const visibleRecurring = showAll
    ? recurringSelected
    : recurringSelected.slice(0, PREVIEW_LIMIT);
  const remaining = Math.max(PREVIEW_LIMIT - visibleRecurring.length, 0);
  const visibleOneOff = showAll
    ? oneOffSelected
    : oneOffSelected.slice(0, remaining);
  const hiddenCount =
    totalCount - visibleRecurring.length - visibleOneOff.length;

  return (
    <aside className="pss-sidebar">
      <div className="pss-sidebar-inner">
        <div className="pss-list-card-header pss-sidebar-header">
          <div>
            <h2 className="pss-list-heading">Selected Services</h2>
            <p className="pss-sidebar-subtitle">{totalCount} Items Total</p>
          </div>
          <button type="button" className="pss-sidebar-print-btn">
            <ClipboardList size={16} />
          </button>
        </div>

        <div className="pss-sidebar-body">
          {totalCount === 0 ? (
            <p className="pss-sidebar-empty">No services selected yet.</p>
          ) : (
            <div className="pss-sidebar-groups">
              <SelectedGroup
                label="Recurring Services"
                icon={RotateCw}
                items={visibleRecurring}
                onRemove={onRemove}
              />
              <SelectedGroup
                label="One-off Services"
                icon={FileStack}
                items={visibleOneOff}
                onRemove={onRemove}
              />
            </div>
          )}

          {!showAll && hiddenCount > 0 && (
            <button
              type="button"
              onClick={() => setShowAll(true)}
              className="pss-sidebar-view-all-btn"
            >
              View all {totalCount} items
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};

export default SelectedServices;
