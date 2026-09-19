import { useState } from "react";
import { ClipboardList, RotateCw, FileStack, X, Lock } from "lucide-react";

const PREVIEW_LIMIT = 5;

const getDriverSummary = (driverValues) =>
  Object.values(driverValues || {}).filter(
    (driver) =>
      driver.value !== "" &&
      driver.value !== null &&
      driver.value !== undefined,
  );

// Groups items under their category, preserving each category's
// first-appearance order and each item's selection order.
const groupByCategory = (items) => {
  const groups = new Map();
  items.forEach((item) => {
    const key = item.serviceCatID ?? item.categoryName ?? "Other";
    if (!groups.has(key)) {
      groups.set(key, {
        key,
        categoryName: item.categoryName || "Other",
        items: [],
      });
    }
    groups.get(key).items.push(item);
  });
  return Array.from(groups.values());
};

const SelectedGroup = ({ label, icon: Icon, items, onRemove }) => {
  if (items.length === 0) return null;

  return (
    <div>
      <div className="pss-sidebar-group-label">
        <Icon size={12} />
        <span>{label}</span>
      </div>

      {groupByCategory(items).map((group) => (
        <div key={group.key} className="pss-sidebar-category">
          <p className="pss-sidebar-category-title">{group.categoryName}</p>
          <ul className="pss-sidebar-group-list">
            {group.items.map((item) => (
              <li key={item.serviceID} className="pss-sidebar-item">
                <div className="pss-sidebar-item-row">
                  <div className="pss-sidebar-item-info">
                    <p className="pss-sidebar-item-name">{item.serviceName}</p>
                  </div>
                  {item.locked ? (
                    <span
                      className="pss-sidebar-item-remove pss-sidebar-item-locked"
                      title="Included by default"
                    >
                      <Lock size={13} />
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onRemove(item.listType, item.serviceID)}
                      className="pss-sidebar-item-remove"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>

                {getDriverSummary(item.driverValues).length > 0 && (
                  <ul className="pss-sidebar-item-drivers">
                    {getDriverSummary(item.driverValues).map(
                      (driver, index) => (
                        <li key={index} className="pss-sidebar-item-driver">
                          {driver.driverName}:{" "}
                          <span className="pss-sidebar-item-driver-value">
                            {driver.label ?? driver.value}
                          </span>
                        </li>
                      ),
                    )}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
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
