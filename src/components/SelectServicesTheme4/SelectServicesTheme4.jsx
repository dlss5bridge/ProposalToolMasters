import React, { useLayoutEffect, useMemo, useRef, useState } from "react";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import EastIcon from "@mui/icons-material/East";
import TipsAndUpdatesOutlinedIcon from "@mui/icons-material/TipsAndUpdatesOutlined";
import CreditCardOutlinedIcon from "@mui/icons-material/CreditCardOutlined";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import AccountBalanceOutlinedIcon from "@mui/icons-material/AccountBalanceOutlined";
import PercentOutlinedIcon from "@mui/icons-material/PercentOutlined";
import ApartmentOutlinedIcon from "@mui/icons-material/ApartmentOutlined";
import SupportAgentOutlinedIcon from "@mui/icons-material/SupportAgentOutlined";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import "./SelectServicesTheme4.css";

/*
 * Theme 4 for the "Select Services" tab.
 *
 * PRESENTATION ONLY, same contract as Theme 2 / Theme 3: this component
 * owns no selection state at all. Every selection, pricing-driver input,
 * validation message and Back / Next / Save Draft action is the existing
 * SelectServices logic, passed down through props unchanged.
 *
 * Unlike Theme 3 (one category open at a time, behind a categories rail),
 * this design shows every category as its own card, all on screen at
 * once, with services as pill buttons inside each card. A Recurring
 * category and a One-off category that share a name are still merged into
 * one card (same as Theme 3) - a recurring service is still toggled
 * through the recurring handler and a one-off service through the
 * one-off handler, this design just doesn't show which is which.
 *
 * Because every category is always visible, there is no "reveal the right
 * category before Next" step like Theme 2/3 need: every selected
 * service's pricing-driver fields are already in the DOM, so the existing
 * validation's scroll-to-error keeps working unmodified.
 */

const SERVICE_TYPE = { RECURRING: 1, ONE_OFF: 2 };
const SIDEBAR_ITEMS_PER_GROUP = 4;

// Layout breakpoints, measured on the component's own width (px)
const SUMMARY_BELOW_UNDER = 760;

// Order matters: "VAT" must match before the generic "tax" rule.
const CATEGORY_ICON_RULES = [
  { match: /book|ledger/i, Icon: MenuBookOutlinedIcon },
  { match: /payroll|salar|wage|pension/i, Icon: CreditCardOutlinedIcon },
  { match: /advis|consult|planning/i, Icon: TipsAndUpdatesOutlinedIcon },
  { match: /support|software|help/i, Icon: SupportAgentOutlinedIcon },
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

const SelectServicesTheme4 = ({
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
  nextLabel = "Continue to Pricing",
  nextHelperText = "Pricing details will be configured on the next step.",
  summaryTitle = "Selection Summary",
  recurringTitle = "Recurring",
  oneOffTitle = "One-off",
}) => {
  const [showAllSelected, setShowAllSelected] = useState(false);

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

  const isSummaryBelow = rootWidth > 0 && rootWidth < SUMMARY_BELOW_UNDER;
  const rootClassName = [
    "sst4",
    isSummaryBelow && "is-summary-below",
  ]
    .filter(Boolean)
    .join(" ");

  // Merge a Recurring category and a One-off category that share a name
  // into one card. Card order follows Recurring first, then any One-off
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
      [
        { category: entry.recurring, type: SERVICE_TYPE.RECURRING },
        { category: entry.oneOff, type: SERVICE_TYPE.ONE_OFF },
      ].forEach(({ category, type }) => {
        if (!category) return;
        (category.servicesList || [])
          .map((service, serviceIndex) => ({ service, serviceIndex }))
          .filter(({ service }) => isVisibleService(service))
          .forEach(({ service, serviceIndex }) => {
            cards.push({ service, serviceIndex, category, type });
          });
      });
      return { ...entry, services: cards };
    });
  }, [recurringServiceList, oneOffServiceList]);

  // Selected items grouped by Recurring / One-off (not by category), same
  // grouping the Selection Summary uses in Theme 2 and Theme 3.
  const selectedGroups = useMemo(() => {
    const groups = {
      [SERVICE_TYPE.RECURRING]: [],
      [SERVICE_TYPE.ONE_OFF]: [],
    };
    categories.forEach((category) => {
      category.services.forEach(
        ({ service, serviceIndex, type, category: rawCategory }) => {
          if (isServiceSelected(service)) {
            groups[type].push({ service, serviceIndex, category: rawCategory });
          }
        },
      );
    });
    return groups;
  }, [categories, isServiceSelected]);

  const totalSelected =
    selectedGroups[SERVICE_TYPE.RECURRING].length +
    selectedGroups[SERVICE_TYPE.ONE_OFF].length;

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

  const hiddenSelectedCount = Math.max(
    selectedGroups[SERVICE_TYPE.RECURRING].length - SIDEBAR_ITEMS_PER_GROUP,
    0,
  ) + Math.max(
    selectedGroups[SERVICE_TYPE.ONE_OFF].length - SIDEBAR_ITEMS_PER_GROUP,
    0,
  );

  const renderSummaryGroup = (type, title) => {
    const items = selectedGroups[type];
    const visibleItems = showAllSelected
      ? items
      : items.slice(0, SIDEBAR_ITEMS_PER_GROUP);
    return (
      <section className="sst4-summary__group" key={type}>
        <h4>{title}</h4>
        {items.length === 0 ? (
          <p className="sst4-summary__empty">
            No {title.toLowerCase()} services selected.
          </p>
        ) : (
          <ul className="sst4-summary__list">
            {visibleItems.map(({ service, serviceIndex, category }) => (
              <li key={`${type}-${category.serviceCatID}-${service.serviceID ?? serviceIndex}`}>
                <span>{service.serviceName}</span>
                <button
                  type="button"
                  className="sst4-summary__remove"
                  aria-label={`Remove ${service.serviceName}`}
                  onClick={() =>
                    handleToggleService(category, type, service, serviceIndex)
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
      <div className="sst4__layout">
        <div className="sst4__main">
          {requireMessage && totalSelected === 0 && (
            <p className="sst4-alert" role="alert">
              Please select at least one service.
            </p>
          )}

          {categories.length === 0 ? (
            <p className="sst4-empty-card">
              No services are available in this proposal.
            </p>
          ) : (
            <div className="sst4-card-wrap">
              {categories.map((category) => {
                const Icon = getCategoryIcon(category.name);
                return (
                  <section className="sst4-card" key={category.key}>
                    <header className="sst4-card__head">
                      <span className="sst4-card__icon" aria-hidden="true">
                        <Icon fontSize="small" />
                      </span>
                      <h2 className="sst4-card__name">{category.name}</h2>
                      <span className="sst4-card__badge">
                        {category.services.length} Available
                      </span>
                    </header>

                    <div className="sst4-pill-wrap">
                      {category.services.map(
                        ({ service, serviceIndex, type, category: rawCategory }) => {
                          const selected = isServiceSelected(service);
                          const locked = isServiceLocked(service);
                          const typeClass =
                            type === SERVICE_TYPE.RECURRING
                              ? "sst4-pill--recurring"
                              : "sst4-pill--oneoff";
                          return (
                            <button
                              type="button"
                              key={`${type}-${category.key}-${service.serviceID ?? serviceIndex}`}
                              className={`sst4-pill ${typeClass}${
                                selected ? " is-selected" : ""
                              }${locked ? " is-locked" : ""}`}
                              aria-pressed={selected}
                              disabled={locked}
                              title={
                                locked && !selected
                                  ? type === SERVICE_TYPE.RECURRING
                                    ? "Already added as a one-off service"
                                    : "Already added as a recurring service"
                                  : undefined
                              }
                              onClick={() =>
                                handleToggleService(
                                  rawCategory,
                                  type,
                                  service,
                                  serviceIndex,
                                )
                              }
                            >
                              <span className="sst4-pill__tag">
                                {type === SERVICE_TYPE.RECURRING
                                  ? recurringTitle
                                  : oneOffTitle}
                              </span>
                              {selected && (
                                <CheckIcon fontSize="inherit" />
                              )}
                              {service.serviceName}
                            </button>
                          );
                        },
                      )}
                    </div>

                    {typeof renderServiceDetails === "function" &&
                      category.services
                        .filter(({ service }) => isServiceSelected(service))
                        .map(({ service, serviceIndex, type }) => (
                          <div
                            className="sst4-card__details"
                            key={`details-${type}-${category.key}-${service.serviceID ?? serviceIndex}`}
                          >
                            <p className="sst4-card__details-label">
                              {service.serviceName}
                            </p>
                            {renderServiceDetails(
                              service,
                              type === SERVICE_TYPE.RECURRING
                                ? category.recurring
                                : category.oneOff,
                              type,
                              serviceIndex,
                              0,
                            )}
                          </div>
                        ))}
                  </section>
                );
              })}
            </div>
          )}
        </div>

        <aside className="sst4-summary" aria-label="Selection summary">
          <div className="sst4-summary__head">
            <h3>{summaryTitle}</h3>
            <span className="sst4-summary__badge" aria-hidden="true">
              {totalSelected} Items
            </span>
          </div>

          <div className="sst4-summary__body">
            {totalSelected === 0 ? (
              <p className="sst4-summary__empty">
                Choose services from the categories to add them to this
                proposal.
              </p>
            ) : (
              <>
                {renderSummaryGroup(SERVICE_TYPE.RECURRING, recurringTitle)}
                {renderSummaryGroup(SERVICE_TYPE.ONE_OFF, oneOffTitle)}
              </>
            )}

            {hiddenSelectedCount > 0 && (
              <button
                type="button"
                className="sst4-btn sst4-btn--outline sst4-btn--block"
                onClick={() => setShowAllSelected((prev) => !prev)}
              >
                {showAllSelected
                  ? "Show fewer"
                  : `View all ${totalSelected} items`}
              </button>
            )}
          </div>

          <div className="sst4-summary__actions">
            {typeof onNext === "function" && (
              <>
                <button
                  type="button"
                  className="sst4-btn sst4-btn--primary sst4-btn--block"
                  onClick={onNext}
                >
                  {nextLabel} <EastIcon fontSize="inherit" />
                </button>
                {nextHelperText && (
                  <p className="sst4-summary__helper">{nextHelperText}</p>
                )}
              </>
            )}
            <div className="sst4-summary__row">
              {showBack && typeof onBack === "function" && (
                <button
                  type="button"
                  className="sst4-btn sst4-btn--outline"
                  onClick={onBack}
                >
                  Back
                </button>
              )}
              {typeof onSaveDraft === "function" && (
                <button
                  type="button"
                  className="sst4-btn sst4-btn--outline"
                  onClick={onSaveDraft}
                >
                  Save Draft
                </button>
              )}
            </div>
            {typeof onCancel === "function" && (
              <button
                type="button"
                className="sst4-link sst4-summary__cancel"
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

export default SelectServicesTheme4;
