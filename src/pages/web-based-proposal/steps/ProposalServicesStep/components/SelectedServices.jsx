import { useState } from "react";
import { ClipboardList, RotateCw, FileStack, X } from "lucide-react";

const PREVIEW_LIMIT = 5;

const getDriverSummary = (driverValues) =>
  Object.values(driverValues || {}).filter(
    (driver) => driver.value !== "" && driver.value !== null && driver.value !== undefined,
  );

const SelectedGroup = ({ label, icon: Icon, items, onRemove }) => {
  if (items.length === 0) return null;

  return (
    <div>
      <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 tracking-wide mb-2">
        <Icon size={12} />
        <span>{label}</span>
      </div>

      <ul className="space-y-2.5">
        {items.map((item) => (
          <li key={item.serviceID} className="group">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{item.serviceName}</p>
                <p className="text-xs text-gray-400">{item.categoryName}</p>
              </div>
              <button
                type="button"
                onClick={() => onRemove(item.listType, item.serviceID)}
                className="shrink-0 text-gray-300 hover:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={13} />
              </button>
            </div>

            {getDriverSummary(item.driverValues).length > 0 && (
              <ul className="mt-1 space-y-0.5">
                {getDriverSummary(item.driverValues).map((driver, index) => (
                  <li key={index} className="text-xs text-gray-400">
                    {driver.driverName}: <span className="text-gray-600">{driver.label ?? driver.value}</span>
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

const SelectedServices = ({ recurringSelected, oneOffSelected, onRemove, onReviewNext, onBack, onSaveDraft }) => {
  const [showAll, setShowAll] = useState(false);

  const totalCount = recurringSelected.length + oneOffSelected.length;

  const visibleRecurring = showAll ? recurringSelected : recurringSelected.slice(0, PREVIEW_LIMIT);
  const remaining = Math.max(PREVIEW_LIMIT - visibleRecurring.length, 0);
  const visibleOneOff = showAll ? oneOffSelected : oneOffSelected.slice(0, remaining);
  const hiddenCount = totalCount - visibleRecurring.length - visibleOneOff.length;

  return (
    <aside className="w-full lg:w-80 shrink-0">
      <div className="lg:sticky lg:top-4 bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-col gap-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">Selected Services</h3>
            <p className="text-xs text-gray-500 mt-0.5">{totalCount} Items Total</p>
          </div>
          <button
            type="button"
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:text-gray-600 hover:border-gray-300"
          >
            <ClipboardList size={16} />
          </button>
        </div>

        {totalCount === 0 ? (
          <p className="text-sm text-gray-400 py-4 text-center border-t border-gray-100">
            No services selected yet.
          </p>
        ) : (
          <div className="border-t border-gray-100 pt-3 flex flex-col gap-4 max-h-[360px] overflow-y-auto">
            <SelectedGroup label="Recurring Services" icon={RotateCw} items={visibleRecurring} onRemove={onRemove} />
            <SelectedGroup label="One-off Services" icon={FileStack} items={visibleOneOff} onRemove={onRemove} />
          </div>
        )}

        {!showAll && hiddenCount > 0 && (
          <button
            type="button"
            onClick={() => setShowAll(true)}
            className="w-full text-center text-sm text-gray-600 border border-gray-200 rounded-lg py-2 hover:bg-gray-50"
          >
            View all {totalCount} items
          </button>
        )}

        <div className="flex flex-col gap-2 pt-2 border-t border-gray-100">
          <button
            type="button"
            onClick={onReviewNext}
            disabled={totalCount === 0}
            className="w-full bg-gray-900 hover:bg-black disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-medium py-2.5 rounded-lg transition-colors"
          >
            Review Selection & Next
          </button>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onBack}
              className="flex-1 border border-gray-200 text-gray-700 text-sm font-medium py-2.5 rounded-lg hover:bg-gray-50"
            >
              Back
            </button>
            <button
              type="button"
              onClick={onSaveDraft}
              className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium py-2.5 rounded-lg"
            >
              Save Draft
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default SelectedServices;
