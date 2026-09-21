import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { flushSync } from "react-dom";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CheckIcon from "@mui/icons-material/Check";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import LooksOneOutlinedIcon from "@mui/icons-material/LooksOneOutlined";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import ApartmentOutlinedIcon from "@mui/icons-material/ApartmentOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import PercentOutlinedIcon from "@mui/icons-material/PercentOutlined";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import BusinessCenterOutlinedIcon from "@mui/icons-material/BusinessCenterOutlined";
import SupportAgentOutlinedIcon from "@mui/icons-material/SupportAgentOutlined";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import "./SelectServicesTheme2.css";

/*
 * Theme 2 for the "Select Services" tab.
 *
 * This component is PRESENTATION ONLY. It owns nothing but view state
 * (search text, category filter, which accordions are open, sidebar expansion).
 * Selecting a service, pricing-driver inputs, validation, back / next / save
 * all come from the existing SelectServices component through props, so the
 * behaviour stays exactly as it is in theme 1.
 */

const SERVICE_TYPE = { RECURRING: 1, ONE_OFF: 2 };
const SIDEBAR_ITEMS_PER_GROUP = 3;

// Layout breakpoints, measured on the component's own width (px)
const SIDEBAR_BELOW_UNDER = 760;
const SINGLE_COLUMN_UNDER = 640;
const COMPACT_TOOLBAR_UNDER = 520;
const SIDEBAR_GAP = 28;
const getSidebarWidth = (width) => Math.min(380, Math.max(300, width * 0.28));

// Order matters: "VAT" must match before the generic "tax" rule.
const CATEGORY_ICON_RULES = [
  { match: /book|ledger/i, Icon: MenuBookOutlinedIcon },
  {
    match: /payroll|salar|wage|pension/i,
    Icon: AccountBalanceWalletOutlinedIcon,
  },
  { match: /advis|consult|planning/i, Icon: BusinessCenterOutlinedIcon },
  { match: /support|help/i, Icon: SupportAgentOutlinedIcon },
  {
    match: /formation|incorporat|company|secretar/i,
    Icon: ApartmentOutlinedIcon,
  },
  { match: /vat|gst|sales tax/i, Icon: PercentOutlinedIcon },
  { match: /tax|account|audit/i, Icon: ReceiptLongOutlinedIcon },
];

const getCategoryIcon = (name = "") =>
  CATEGORY_ICON_RULES.find((rule) => rule.match.test(name))?.Icon ??
  CategoryOutlinedIcon;

const categoryKey = (type, category) => `${type}-${category.serviceCatID}`;

const defaultIsSelected = (service) => service?.isSelected === true;
const defaultIsLocked = () => false;
const isVisibleService = (service) => !service?.isHidden;

const getPlainDescription = (service) => {
  const raw =
    service?.serviceDescription ||
    service?.shortDescription ||
    service?.description ||
    "";
  return String(raw)
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

const matchesSearch = (service, query) =>
  !query ||
  `${service?.serviceName ?? ""} ${getPlainDescription(service)}`
    .toLowerCase()
    .includes(query);

const SelectServicesTheme2 = ({
  recurringServiceList = [],
  oneOffServiceList = [],
  requireMessage = false,

  // Wire these to the EXISTING logic inside SelectServices.jsx
  isServiceSelected = defaultIsSelected,
  isServiceLocked = defaultIsLocked,
  onToggleService,
  renderServiceDetails,
  onBack,
  onSaveDraft,
  onNext,
  onCancel,
  cancelLabel = "Cancel",

  showBack = true,
  nextLabel = "Review Selection & Next",
  recurringTitle = "Recurring Services",
  oneOffTitle = "One-Off / Ad Hoc Services",
}) => {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [expanded, setExpanded] = useState(() => new Set());
  const [showAllSelected, setShowAllSelected] = useState(false);
  const hasInitialisedExpansion = useRef(false);

  // Measure the real available width so the layout fits whatever
  // container this tab is rendered in (sidebar open/closed, zoom, etc.)
  const rootRef = useRef(null);
  const [rootWidth, setRootWidth] = useState(0);

  useLayoutEffect(() => {
    const node = rootRef.current;
    if (!node) return undefined;
    const update = () => setRootWidth(node.getBoundingClientRect().width);
    update();
    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", update);
      return () => window.removeEventListener("resize", update);
    }
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const isSidebarBelow = rootWidth > 0 && rootWidth < SIDEBAR_BELOW_UNDER;
  const mainWidth = isSidebarBelow
    ? rootWidth
    : rootWidth - getSidebarWidth(rootWidth) - SIDEBAR_GAP;
  const isSingleColumn = rootWidth > 0 && mainWidth < SINGLE_COLUMN_UNDER;
  const isCompactToolbar = rootWidth > 0 && mainWidth < COMPACT_TOOLBAR_UNDER;
  const rootClassName = [
    "sst2",
    isSidebarBelow && "is-sidebar-below",
    isSingleColumn && "is-single-column",
    isCompactToolbar && "is-compact-toolbar",
  ]
    .filter(Boolean)
    .join(" ");

  const query = search.trim().toLowerCase();

  const columns = useMemo(
    () => [
      {
        type: SERVICE_TYPE.RECURRING,
        title: recurringTitle,
        list: recurringServiceList || [],
      },
      {
        type: SERVICE_TYPE.ONE_OFF,
        title: oneOffTitle,
        list: oneOffServiceList || [],
      },
    ],
    [recurringServiceList, oneOffServiceList, recurringTitle, oneOffTitle],
  );

  const selectedGroups = useMemo(
    () =>
      columns.map((column) => ({
        type: column.type,
        items: column.list.flatMap((category) =>
          (category.servicesList || [])
            .filter(
              (service) =>
                isVisibleService(service) && isServiceSelected(service),
            )
            .map((service) => ({ service, category })),
        ),
      })),
    [columns, isServiceSelected],
  );

  const totalSelected = selectedGroups.reduce(
    (sum, group) => sum + group.items.length,
    0,
  );

  const categoryOptions = useMemo(() => {
    const names = new Set();
    columns.forEach((column) =>
      column.list.forEach((category) => names.add(category.serviceCatName)),
    );
    return Array.from(names);
  }, [columns]);

  const keysWithSelection = () => {
    const keys = [];
    columns.forEach((column) =>
      column.list.forEach((category) => {
        if ((category.servicesList || []).some(isServiceSelected)) {
          keys.push(categoryKey(column.type, category));
        }
      }),
    );
    return keys;
  };

  // Open categories that already contain selections (edit / back navigation).
  // With nothing selected yet, open the first category of each column.
  useEffect(() => {
    if (hasInitialisedExpansion.current) return;
    const keys = keysWithSelection();
    if (keys.length === 0) {
      columns.forEach((column) => {
        if (column.list[0]) keys.push(categoryKey(column.type, column.list[0]));
      });
    }
    if (keys.length > 0) {
      setExpanded(new Set(keys));
      hasInitialisedExpansion.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columns]);

  // While validation messages are showing, keep selected categories open so
  // the pricing-driver fields (and their error text) stay visible.
  useEffect(() => {
    if (!requireMessage) return;
    setExpanded((prev) => new Set([...prev, ...keysWithSelection()]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requireMessage, columns]);

  /*
   * The existing validation scrolls to `SelectServiceQuantity_<driverName>`.
   * Those inputs only exist in the DOM when their category is open and not
   * filtered out, so reveal every selected service synchronously first,
   * then run the untouched existing handler.
   */
  const revealSelectionThen = (handler) => () => {
    if (typeof handler !== "function") return;
    flushSync(() => {
      setSearch("");
      setCategoryFilter("all");
      setExpanded((prev) => new Set([...prev, ...keysWithSelection()]));
    });
    handler();
  };

  const toggleCategory = (key) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const expandAll = () =>
    setExpanded(
      new Set(
        columns.flatMap((column) =>
          column.list.map((category) => categoryKey(column.type, category)),
        ),
      ),
    );

  const collapseAll = () => setExpanded(new Set());

  const handleToggleService = (
    column,
    category,
    categoryIndex,
    service,
    serviceIndex,
  ) => {
    if (isServiceLocked(service) || typeof onToggleService !== "function")
      return;
    onToggleService({
      serviceType: column.type,
      category,
      categoryIndex,
      service,
      serviceIndex,
      checked: !isServiceSelected(service),
    });
  };

  const renderColumn = (column) => {
    const visibleCategories = column.list
      .map((category, categoryIndex) => ({
        category,
        categoryIndex,
        services: (category.servicesList || [])
          .map((service, serviceIndex) => ({ service, serviceIndex }))
          .filter(
            ({ service }) =>
              isVisibleService(service) && matchesSearch(service, query),
          ),
      }))
      .filter(
        ({ category, services }) =>
          (categoryFilter === "all" ||
            category.serviceCatName === categoryFilter) &&
          (!query || services.length > 0),
      );

    return (
      <section className="sst2-column" key={column.type}>
        <h2 className="sst2-column__title">{column.title}</h2>

        {visibleCategories.length === 0 ? (
          <p className="sst2-empty-card">
            {column.list.length === 0
              ? "No services are available in this group."
              : "No services match your search or filter."}
          </p>
        ) : (
          <ul className="sst2-category-list">
            {visibleCategories.map(({ category, categoryIndex, services }) => {
              const key = categoryKey(column.type, category);
              const isOpen = Boolean(query) || expanded.has(key);
              const allServices = (category.servicesList || []).filter(
                isVisibleService,
              );
              const selectedCount =
                allServices.filter(isServiceSelected).length;
              const Icon = getCategoryIcon(category.serviceCatName);
              const bodyId = `sst2-body-${key}`;

              return (
                <li
                  key={key}
                  className={`sst2-category${isOpen ? " is-open" : ""}`}
                >
                  <button
                    type="button"
                    className="sst2-category__header"
                    aria-expanded={isOpen}
                    aria-controls={bodyId}
                    onClick={() => toggleCategory(key)}
                  >
                    <span className="sst2-category__icon" aria-hidden="true">
                      <Icon fontSize="small" />
                    </span>
                    <span className="sst2-category__meta">
                      <span className="sst2-category__name">
                        {category.serviceCatName}
                      </span>
                      <span className="sst2-category__count">
                        {allServices.length} Services ·{" "}
                        <span className={selectedCount > 0 ? "is-accent" : ""}>
                          {selectedCount} Selected
                        </span>
                      </span>
                    </span>
                    <ExpandMoreIcon
                      className={`sst2-chevron${isOpen ? " is-open" : ""}`}
                      aria-hidden="true"
                    />
                  </button>

                  {isOpen && (
                    <ul className="sst2-service-list" id={bodyId}>
                      {services.map(({ service, serviceIndex }) => {
                        const selected = isServiceSelected(service);
                        const locked = isServiceLocked(service);
                        const description = getPlainDescription(service);

                        return (
                          <li
                            key={service.serviceID ?? serviceIndex}
                            className={`sst2-service${selected ? " is-selected" : ""}${
                              locked ? " is-locked" : ""
                            }`}
                          >
                            <button
                              type="button"
                              className="sst2-service__toggle"
                              aria-pressed={selected}
                              disabled={locked}
                              onClick={() =>
                                handleToggleService(
                                  column,
                                  category,
                                  categoryIndex,
                                  service,
                                  serviceIndex,
                                )
                              }
                            >
                              <span className="sst2-service__text">
                                <span className="sst2-service__name">
                                  {service.serviceName}
                                </span>
                                {description && (
                                  <span className="sst2-service__desc">
                                    {description}
                                  </span>
                                )}
                                {locked && !selected && (
                                  <span className="sst2-badge">
                                    {column.type === SERVICE_TYPE.RECURRING
                                      ? "Already added as a one-off service"
                                      : "Already added as a recurring service"}
                                  </span>
                                )}
                              </span>
                              <span
                                className="sst2-service__check"
                                aria-hidden="true"
                              >
                                {selected && <CheckIcon fontSize="small" />}
                              </span>
                            </button>

                            {selected &&
                              typeof renderServiceDetails === "function" && (
                                <div className="sst2-service__details">
                                  {renderServiceDetails(
                                    service,
                                    category,
                                    column.type,
                                    serviceIndex,
                                    categoryIndex,
                                  )}
                                </div>
                              )}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    );
  };

  const hiddenSelectedCount = selectedGroups.reduce(
    (sum, group) =>
      sum + Math.max(group.items.length - SIDEBAR_ITEMS_PER_GROUP, 0),
    0,
  );

  return (
    <div className={rootClassName} ref={rootRef}>
      <div className="sst2__layout">
        <div className="sst2__main">
          <div className="sst2-toolbar">
            <label className="sst2-search">
              <SearchIcon aria-hidden="true" />
              <input
                type="search"
                placeholder="Search services..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search services"
              />
            </label>

            <label className="sst2-filter">
              <FilterListIcon
                className="sst2-filter__lead"
                aria-hidden="true"
              />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                aria-label="Filter by category"
              >
                <option value="all">All Categories</option>
                {categoryOptions.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
              <ExpandMoreIcon
                className="sst2-filter__chevron"
                aria-hidden="true"
              />
            </label>

            <div className="sst2-toolbar__end">
              <span className="sst2-pill">{totalSelected} Selected</span>
              <span className="sst2-divider" aria-hidden="true" />
              <button type="button" className="sst2-link" onClick={expandAll}>
                Expand All
              </button>
              <button type="button" className="sst2-link" onClick={collapseAll}>
                Collapse All
              </button>
            </div>
          </div>

          {requireMessage && totalSelected === 0 && (
            <p className="sst2-alert" role="alert">
              Please select at least one service.
            </p>
          )}

          <div className="sst2-columns">{columns.map(renderColumn)}</div>
        </div>

        <aside className="sst2-summary" aria-label="Selected services">
          <div className="sst2-summary__head">
            <div>
              <h3>Selected Services</h3>
              <p>{totalSelected} Items Total</p>
            </div>
            <span className="sst2-summary__badge" aria-hidden="true">
              <ReceiptLongOutlinedIcon fontSize="small" />
            </span>
          </div>

          <div className="sst2-summary__body">
            {totalSelected === 0 ? (
              <p className="sst2-summary__empty">
                Choose services from the lists to add them to this proposal.
              </p>
            ) : (
              selectedGroups
                .filter((group) => group.items.length > 0)
                .map((group) => {
                  const isRecurring = group.type === SERVICE_TYPE.RECURRING;
                  const GroupIcon = isRecurring
                    ? AutorenewIcon
                    : LooksOneOutlinedIcon;
                  const items = showAllSelected
                    ? group.items
                    : group.items.slice(0, SIDEBAR_ITEMS_PER_GROUP);

                  return (
                    <section key={group.type}>
                      <h4 className="sst2-summary__group">
                        <GroupIcon aria-hidden="true" />
                        {isRecurring
                          ? "Recurring services"
                          : "One-off services"}
                      </h4>
                      <ul className="sst2-summary__list">
                        {items.map(({ service, category }) => (
                          <li
                            key={`${group.type}-${category.serviceCatID}-${service.serviceID}`}
                          >
                            <span>{service.serviceName}</span>
                            <small>{category.serviceCatName}</small>
                          </li>
                        ))}
                      </ul>
                    </section>
                  );
                })
            )}

            {hiddenSelectedCount > 0 && (
              <button
                type="button"
                className="sst2-btn sst2-btn--outline sst2-btn--block"
                onClick={() => setShowAllSelected((prev) => !prev)}
              >
                {showAllSelected
                  ? "Show fewer"
                  : `View all ${totalSelected} items`}
              </button>
            )}
          </div>

          <div className="sst2-summary__actions">
            {typeof onNext === "function" && (
              <button
                type="button"
                className="sst2-btn sst2-btn--primary sst2-btn--block"
                onClick={revealSelectionThen(onNext)}
              >
                {nextLabel}
              </button>
            )}
            <div className="sst2-summary__row">
              {showBack && typeof onBack === "function" && (
                <button
                  type="button"
                  className="sst2-btn sst2-btn--outline"
                  onClick={onBack}
                >
                  Back
                </button>
              )}
              {typeof onSaveDraft === "function" && (
                <button
                  type="button"
                  className="sst2-btn sst2-btn--success"
                  onClick={revealSelectionThen(onSaveDraft)}
                >
                  Save Draft
                </button>
              )}
            </div>
            {typeof onCancel === "function" && (
              <button
                type="button"
                className="sst2-link sst2-summary__cancel"
                onClick={onCancel}
              >
                {cancelLabel}
              </button>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default SelectServicesTheme2;
