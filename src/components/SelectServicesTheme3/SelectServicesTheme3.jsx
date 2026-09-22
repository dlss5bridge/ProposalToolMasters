import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { flushSync } from "react-dom";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import EastIcon from "@mui/icons-material/East";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import QueryStatsOutlinedIcon from "@mui/icons-material/QueryStatsOutlined";
import TipsAndUpdatesOutlinedIcon from "@mui/icons-material/TipsAndUpdatesOutlined";
import CreditCardOutlinedIcon from "@mui/icons-material/CreditCardOutlined";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import AccountBalanceOutlinedIcon from "@mui/icons-material/AccountBalanceOutlined";
import PercentOutlinedIcon from "@mui/icons-material/PercentOutlined";
import ApartmentOutlinedIcon from "@mui/icons-material/ApartmentOutlined";
import SupportAgentOutlinedIcon from "@mui/icons-material/SupportAgentOutlined";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import "./SelectServicesTheme3.css";

/*
 * Theme 3 for the "Select Services" tab.
 *
 * PRESENTATION ONLY, same contract as Theme 2: this component owns view
 * state alone (which category is open, sidebar "view all" toggle). Every
 * selection, pricing-driver input, validation message and Back / Next /
 * Save Draft action is the existing SelectServices logic, passed down
 * through props exactly like Theme 2, so behaviour is unchanged.
 *
 * The one thing Theme 2 didn't need: Theme 1/2 render categories in two
 * separate Recurring / One-off columns. This theme's design merges a
 * Recurring category and a One-off category that share the same name into
 * a single "Category" entry (e.g. one "Advisory" tile holding both the
 * recurring and one-off Advisory services). Nothing about the underlying
 * lists changes - a recurring service is still toggled through the
 * recurring handler and a one-off service through the one-off handler.
 */

const SERVICE_TYPE = { RECURRING: 1, ONE_OFF: 2 };
const SIDEBAR_ITEMS_PER_GROUP = 4;

// Layout breakpoints, measured on the component's own width (px)
const CATEGORIES_BELOW_UNDER = 980;
const SUMMARY_BELOW_UNDER = 760;
const SINGLE_COLUMN_UNDER = 520;

// Order matters: "VAT" must match before the generic "tax" rule.
const CATEGORY_ICON_RULES = [
  { match: /book|ledger/i, Icon: MenuBookOutlinedIcon },
  { match: /payroll|salar|wage|pension/i, Icon: CreditCardOutlinedIcon },
  { match: /advis|consult|planning/i, Icon: TipsAndUpdatesOutlinedIcon },
  { match: /support|help/i, Icon: SupportAgentOutlinedIcon },
  {
    match: /formation|incorporat|company|secretar/i,
    Icon: ApartmentOutlinedIcon,
  },
  { match: /vat|gst|sales tax/i, Icon: PercentOutlinedIcon },
  { match: /tax|account|audit/i, Icon: AccountBalanceOutlinedIcon },
];

const getCategoryIcon = (name = "") =>
  CATEGORY_ICON_RULES.find((rule) => rule.match.test(name))?.Icon ??
  CategoryOutlinedIcon;

const normaliseKey = (name = "") => name.trim().toLowerCase();

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

// Matches the undefined-required-driver check in AddUpdateProposal.jsx's
// validation, so the category it points to is the same one that function
// would scroll to.
const hasUnansweredRequiredDriver = (service) =>
  (service?.pricingDriverList || []).some(
    (driver) =>
      driver.driverVisibility &&
      driver.driverTypeID !== 5 &&
      driver.driverTypeID !== 6 &&
      (driver.driverValue === undefined ||
        driver.driverValue === null ||
        driver.driverValue === ""),
  );

const SelectServicesTheme3 = ({
  recurringServiceList = [],
  oneOffServiceList = [],
  requireMessage = false,

  // Wired to the EXISTING logic inside SelectServices.jsx
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
  nextLabel = "Next Step",
  recurringTitle = "Recurring",
  oneOffTitle = "One-Off",
}) => {
  const [activeCategoryKey, setActiveCategoryKey] = useState(null);
  const [showAllSelected, setShowAllSelected] = useState(false);
  const [categoriesCollapsed, setCategoriesCollapsed] = useState(false);
  const [summaryCollapsed, setSummaryCollapsed] = useState(false);
  const hasInitialisedActive = useRef(false);

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

  const isCategoriesBelow = rootWidth > 0 && rootWidth < CATEGORIES_BELOW_UNDER;
  const isSummaryBelow = rootWidth > 0 && rootWidth < SUMMARY_BELOW_UNDER;
  const isSingleColumn = rootWidth > 0 && rootWidth < SINGLE_COLUMN_UNDER;
  const rootClassName = [
    "sst3",
    isCategoriesBelow && "is-categories-below",
    isSummaryBelow && "is-summary-below",
    isSingleColumn && "is-single-column",
    categoriesCollapsed && "is-categories-collapsed",
    summaryCollapsed && "is-summary-collapsed",
  ]
    .filter(Boolean)
    .join(" ");

  // Merge a Recurring category and a One-off category that share a name
  // into one entry. List order follows Recurring first, then any One-off
  // categories that have no Recurring counterpart.
  const categories = useMemo(() => {
    const order = [];
    const byKey = new Map();

    const addColumn = (list, type) => {
      (list || []).forEach((category) => {
        const key = normaliseKey(category.serviceCatName);
        let entry = byKey.get(key);
        if (!entry) {
          entry = {
            key,
            name: category.serviceCatName,
            recurring: null,
            oneOff: null,
          };
          byKey.set(key, entry);
          order.push(entry);
        }
        if (type === SERVICE_TYPE.RECURRING) entry.recurring = category;
        else entry.oneOff = category;
      });
    };

    addColumn(recurringServiceList, SERVICE_TYPE.RECURRING);
    addColumn(oneOffServiceList, SERVICE_TYPE.ONE_OFF);

    return order.map((entry) => {
      const cards = [];
      let totalCount = 0;
      let selectedCount = 0;

      [
        { category: entry.recurring, type: SERVICE_TYPE.RECURRING },
        { category: entry.oneOff, type: SERVICE_TYPE.ONE_OFF },
      ].forEach(({ category, type }) => {
        if (!category) return;
        (category.servicesList || [])
          .map((service, serviceIndex) => ({ service, serviceIndex }))
          .filter(({ service }) => isVisibleService(service))
          .forEach(({ service, serviceIndex }) => {
            totalCount += 1;
            const selected = isServiceSelected(service);
            if (selected) selectedCount += 1;
            cards.push({ service, serviceIndex, category, type, selected });
          });
      });

      return { ...entry, cards, totalCount, selectedCount };
    });
  }, [recurringServiceList, oneOffServiceList, isServiceSelected]);

  const activeCategory =
    categories.find((category) => category.key === activeCategoryKey) ||
    null;

  const selectedGroups = useMemo(() => {
    const groups = {
      [SERVICE_TYPE.RECURRING]: [],
      [SERVICE_TYPE.ONE_OFF]: [],
    };
    categories.forEach((category) => {
      category.cards.forEach(({ service, category: cat, type, selected }) => {
        if (selected) groups[type].push({ service, category: cat });
      });
    });
    return groups;
  }, [categories]);

  const totalSelected =
    selectedGroups[SERVICE_TYPE.RECURRING].length +
    selectedGroups[SERVICE_TYPE.ONE_OFF].length;

  // Same precedence as the legacy validator: every Recurring category is
  // checked in full before any One-off category is looked at.
  const findCategoryNeedingAttention = () => {
    const scan = (type) =>
      categories.find((category) =>
        category.cards.some(
          (card) =>
            card.type === type && card.selected && hasUnansweredRequiredDriver(card.service),
        ),
      );
    return (
      scan(SERVICE_TYPE.RECURRING) ||
      scan(SERVICE_TYPE.ONE_OFF) ||
      categories.find((category) =>
        category.cards.some((card) => card.selected),
      ) ||
      null
    );
  };

  // Default to a category that already has a selection (edit / back
  // navigation), otherwise the first category.
  useEffect(() => {
    if (hasInitialisedActive.current || categories.length === 0) return;
    const target = findCategoryNeedingAttention() || categories[0];
    setActiveCategoryKey(target.key);
    hasInitialisedActive.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories]);

  /*
   * The existing validation scrolls to `SelectServiceQuantity_<driverName>`.
   * That input only exists in the DOM while its category is the active
   * one, so switch to the right category synchronously first, then run
   * the untouched existing handler.
   */
  const revealSelectionThen = (handler) => () => {
    if (typeof handler !== "function") return;
    const target = findCategoryNeedingAttention();
    if (target) {
      flushSync(() => setActiveCategoryKey(target.key));
    }
    handler();
  };

  const handleToggleService = (category, type, service, serviceIndex) => {
    if (isServiceLocked(service) || typeof onToggleService !== "function")
      return;
    onToggleService({
      serviceType: type,
      category,
      service,
      serviceIndex,
      checked: !isServiceSelected(service),
    });
  };

  const hiddenSelectedCount = {
    [SERVICE_TYPE.RECURRING]: Math.max(
      selectedGroups[SERVICE_TYPE.RECURRING].length - SIDEBAR_ITEMS_PER_GROUP,
      0,
    ),
    [SERVICE_TYPE.ONE_OFF]: Math.max(
      selectedGroups[SERVICE_TYPE.ONE_OFF].length - SIDEBAR_ITEMS_PER_GROUP,
      0,
    ),
  };
  const anyHiddenSelected =
    hiddenSelectedCount[SERVICE_TYPE.RECURRING] > 0 ||
    hiddenSelectedCount[SERVICE_TYPE.ONE_OFF] > 0;

  const renderSummaryGroup = (type, title) => {
    const items = selectedGroups[type];
    const visibleItems = showAllSelected
      ? items
      : items.slice(0, SIDEBAR_ITEMS_PER_GROUP);
    return (
      <section className="sst3-summary__group" key={type}>
        <h4>{title}</h4>
        {items.length === 0 ? (
          <p className="sst3-summary__empty">
            No {title.toLowerCase()} services selected.
          </p>
        ) : (
          <ul className="sst3-summary__list">
            {visibleItems.map(({ service, category }) => (
              <li key={`${type}-${category.serviceCatID}-${service.serviceID}`}>
                <span>{service.serviceName}</span>
                <button
                  type="button"
                  className="sst3-summary__remove"
                  aria-label={`Remove ${service.serviceName}`}
                  onClick={() =>
                    handleToggleService(
                      category,
                      type,
                      service,
                      category.servicesList.indexOf(service),
                    )
                  }
                >
                  <CloseIcon fontSize="inherit" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    );
  };

  return (
    <div className={rootClassName} ref={rootRef}>
      <div className="sst3__layout">
        <aside className="sst3-categories" aria-label="Categories">
          <div className="sst3-categories__head">
            {!categoriesCollapsed && (
              <h2 className="sst3-categories__title">Categories</h2>
            )}
            <button
              type="button"
              className="sst3-panel-toggle"
              aria-expanded={!categoriesCollapsed}
              aria-label={
                categoriesCollapsed ? "Expand categories" : "Collapse categories"
              }
              onClick={() => setCategoriesCollapsed((prev) => !prev)}
            >
              <ChevronLeftIcon
                fontSize="small"
                className={categoriesCollapsed ? "is-flipped" : ""}
              />
            </button>
          </div>

          {categories.length === 0 ? (
            <p className="sst3-empty-card">
              No services are available in this proposal.
            </p>
          ) : (
            <ul className="sst3-categories__list">
              {categories.map((category) => {
                const Icon = getCategoryIcon(category.name);
                const isActive = category.key === activeCategoryKey;
                return (
                  <li key={category.key}>
                    <button
                      type="button"
                      className={`sst3-category-item${isActive ? " is-active" : ""}`}
                      aria-pressed={isActive}
                      title={categoriesCollapsed ? category.name : undefined}
                      onClick={() => setActiveCategoryKey(category.key)}
                    >
                      <span className="sst3-category-item__icon" aria-hidden="true">
                        <Icon fontSize="small" />
                      </span>
                      <span className="sst3-category-item__meta">
                        <span className="sst3-category-item__name">
                          {category.name}
                        </span>
                        <span className="sst3-category-item__count">
                          {category.totalCount} Services
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </aside>

        <div className="sst3__main">
          {requireMessage && totalSelected === 0 && (
            <p className="sst3-alert" role="alert">
              Please select at least one service.
            </p>
          )}

          {activeCategory ? (
            <>
              <div className="sst3-main__head">
                <h1 className="sst3-main__title">
                  {activeCategory.name} Services
                </h1>
                <p className="sst3-main__meta">
                  {activeCategory.totalCount} Services available ·{" "}
                  <span
                    className={
                      activeCategory.selectedCount > 0 ? "is-accent" : ""
                    }
                  >
                    {activeCategory.selectedCount} Selected
                  </span>
                </p>
              </div>

              {activeCategory.cards.length === 0 ? (
                <p className="sst3-empty-card">
                  No services are available in this category.
                </p>
              ) : (
                <ul className="sst3-card-grid">
                  {activeCategory.cards.map(
                    ({ service, serviceIndex, category, type, selected }) => {
                      const locked = isServiceLocked(service);
                      const description = getPlainDescription(service);
                      const TypeIcon =
                        type === SERVICE_TYPE.RECURRING
                          ? TrendingUpOutlinedIcon
                          : QueryStatsOutlinedIcon;

                      return (
                        <li
                          key={`${type}-${category.serviceCatID}-${service.serviceID ?? serviceIndex}`}
                          className={`sst3-card${selected ? " is-selected" : ""}${
                            locked ? " is-locked" : ""
                          }`}
                        >
                          <div className="sst3-card__top">
                            <span
                              className={`sst3-card__icon sst3-card__icon--${
                                type === SERVICE_TYPE.RECURRING
                                  ? "recurring"
                                  : "oneoff"
                              }`}
                              aria-hidden="true"
                            >
                              <TypeIcon fontSize="small" />
                            </span>
                            <span className="sst3-badge">
                              {type === SERVICE_TYPE.RECURRING
                                ? recurringTitle
                                : oneOffTitle}
                            </span>
                          </div>

                          <h3 className="sst3-card__name">
                            {service.serviceName}
                          </h3>
                          {description && (
                            <p className="sst3-card__desc">{description}</p>
                          )}
                          {locked && !selected && (
                            <p className="sst3-card__locked">
                              {type === SERVICE_TYPE.RECURRING
                                ? "Already added as a one-off service"
                                : "Already added as a recurring service"}
                            </p>
                          )}

                          {selected &&
                            typeof renderServiceDetails === "function" && (
                              <div className="sst3-card__details">
                                {renderServiceDetails(
                                  service,
                                  category,
                                  type,
                                  serviceIndex,
                                  0,
                                )}
                              </div>
                            )}

                          <button
                            type="button"
                            className={`sst3-card__toggle${
                              selected ? " is-selected" : ""
                            }`}
                            aria-pressed={selected}
                            disabled={locked}
                            onClick={() =>
                              handleToggleService(
                                category,
                                type,
                                service,
                                serviceIndex,
                              )
                            }
                          >
                            {selected ? (
                              <>
                                <CheckIcon fontSize="inherit" /> Added
                              </>
                            ) : (
                              "Select"
                            )}
                          </button>
                        </li>
                      );
                    },
                  )}
                </ul>
              )}
            </>
          ) : (
            <p className="sst3-empty-card">
              No services are available in this proposal.
            </p>
          )}
        </div>

        <aside className="sst3-summary" aria-label="Selected services">
          <div className="sst3-summary__head">
            <div>
              <h3>Summary</h3>
              <p>Selected Services</p>
            </div>
            <div className="sst3-summary__head-actions">
              <span className="sst3-summary__badge" aria-hidden="true">
                {totalSelected}
              </span>
              <button
                type="button"
                className="sst3-panel-toggle"
                aria-expanded={!summaryCollapsed}
                aria-label={
                  summaryCollapsed
                    ? "Expand selected services"
                    : "Collapse selected services"
                }
                onClick={() => setSummaryCollapsed((prev) => !prev)}
              >
                <ExpandMoreIcon
                  fontSize="small"
                  className={summaryCollapsed ? "" : "is-flipped"}
                />
              </button>
            </div>
          </div>

          {!summaryCollapsed && (
            <div className="sst3-summary__body">
              {renderSummaryGroup(SERVICE_TYPE.RECURRING, recurringTitle)}
              {renderSummaryGroup(SERVICE_TYPE.ONE_OFF, oneOffTitle)}

              {anyHiddenSelected && (
                <button
                  type="button"
                  className="sst3-btn sst3-btn--outline sst3-btn--block"
                  onClick={() => setShowAllSelected((prev) => !prev)}
                >
                  {showAllSelected
                    ? "Show fewer"
                    : `View all ${totalSelected} items`}
                </button>
              )}
            </div>
          )}

          <div className="sst3-summary__actions">
            {typeof onNext === "function" && (
              <button
                type="button"
                className="sst3-btn sst3-btn--primary sst3-btn--block"
                onClick={revealSelectionThen(onNext)}
              >
                {nextLabel} <EastIcon fontSize="inherit" />
              </button>
            )}
            <div className="sst3-summary__row">
              {showBack && typeof onBack === "function" && (
                <button
                  type="button"
                  className="sst3-btn sst3-btn--outline"
                  onClick={onBack}
                >
                  Back
                </button>
              )}
              {typeof onSaveDraft === "function" && (
                <button
                  type="button"
                  className="sst3-btn sst3-btn--outline"
                  onClick={revealSelectionThen(onSaveDraft)}
                >
                  Save Draft
                </button>
              )}
            </div>
            {typeof onCancel === "function" && (
              <button
                type="button"
                className="sst3-link sst3-summary__cancel"
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

export default SelectServicesTheme3;
