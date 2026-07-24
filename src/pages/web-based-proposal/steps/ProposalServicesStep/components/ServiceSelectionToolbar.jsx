import { Search, ChevronDown } from "lucide-react";

const ServiceSelectionToolbar = ({
  search,
  onSearchChange,
  categoryFilter,
  onCategoryFilterChange,
  categoryOptions,
  totalSelected,
  onExpandAll,
  onCollapseAll,
}) => {
  return (
    <div className="flex flex-wrap items-center gap-3 mb-4">
      <div className="relative flex-1 min-w-[220px] max-w-xs">
        <Search
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search services..."
          className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
        />
      </div>

      <div className="relative">
        <select
          value={categoryFilter}
          onChange={(e) =>
            onCategoryFilterChange(
              e.target.value === "all" ? "all" : Number(e.target.value),
            )
          }
          className="appearance-none pl-3 pr-8 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
        >
          <option value="all">All Categories</option>
          {categoryOptions.map((option) => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </select>
        <ChevronDown
          size={14}
          className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400"
        />
      </div>

      <div className="ml-auto flex items-center gap-4">
        <span className="text-sm font-medium text-blue-600">
          {totalSelected} Selected
        </span>

        <div className="flex items-center gap-2 text-sm">
          <button
            type="button"
            onClick={onExpandAll}
            className="text-gray-600 hover:text-gray-900 font-medium"
          >
            Expand All
          </button>
          <span className="text-gray-300">|</span>
          <button
            type="button"
            onClick={onCollapseAll}
            className="text-gray-600 hover:text-gray-900 font-medium"
          >
            Collapse All
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServiceSelectionToolbar;
