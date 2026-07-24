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
    <div className="pss-toolbar">
      <div className="pss-toolbar-search">
        <Search size={15} className="pss-toolbar-search-icon" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search services..."
          className="pss-toolbar-search-input"
        />
      </div>

      <div className="pss-toolbar-select-wrap">
        <select
          value={categoryFilter}
          onChange={(e) =>
            onCategoryFilterChange(
              e.target.value === "all" ? "all" : Number(e.target.value),
            )
          }
          className="pss-toolbar-select"
        >
          <option value="all">All Categories</option>
          {categoryOptions.map((option) => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </select>
        <ChevronDown size={14} className="pss-toolbar-select-icon" />
      </div>

      <div className="pss-toolbar-actions">
        <span className="pss-toolbar-selected-count">{totalSelected} Selected</span>

        <div className="pss-toolbar-expand-actions">
          <button type="button" onClick={onExpandAll} className="pss-toolbar-link-btn">
            Expand All
          </button>
          <span className="pss-toolbar-divider">|</span>
          <button type="button" onClick={onCollapseAll} className="pss-toolbar-link-btn">
            Collapse All
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServiceSelectionToolbar;
