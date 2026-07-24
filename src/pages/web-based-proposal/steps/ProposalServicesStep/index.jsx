import { useMemo, useRef, useState } from "react";

import ServiceSelectionToolbar from "./components/ServiceSelectionToolbar";
import RecurringServices from "./components/RecurringServices";
import OneOffServices from "./components/OneOffServices";
import SelectedServices from "./components/SelectedServices";
import { filterCategories } from "./utils/filterCategories";
import { Services } from "./data/data";
import "./ProposalServicesStep.css";

const buildInitialDriverValues = (service) => {
  const values = {};

  (service.pricingDriverList || [])
    .filter((driver) => driver.driverVisibility)
    .forEach((driver) => {
      if (driver.driverTypeID === 3) {
        const defaultOption = driver.variation?.find(
          (option) => option.isDefault,
        );
        values[driver.globalPricingDriverID] = {
          driverName: driver.driverName,
          value: defaultOption ? defaultOption.variationID : null,
          label: defaultOption ? defaultOption.variationName : null,
        };
      } else if (driver.driverTypeID === 4) {
        const defaultOption = driver.slab?.find((option) => option.isDefault);
        values[driver.globalPricingDriverID] = {
          driverName: driver.driverName,
          value: defaultOption ? defaultOption.slabID : null,
          label: defaultOption
            ? defaultOption.slabTypeName ||
              `${defaultOption.slabFrom} - ${defaultOption.slabTo}`
            : null,
        };
      } else if (driver.driverTypeID === 2) {
        values[driver.globalPricingDriverID] = {
          driverName: driver.driverName,
          value: "",
        };
      }
    });

  return values;
};

const ServiceSelectionPOC = () => {
  const [recurringSelections, setRecurringSelections] = useState({});
  const [oneOffSelections, setOneOffSelections] = useState({});
  const [expandedRecurring, setExpandedRecurring] = useState(
    () => new Set(Services[0] ? [Services[0].serviceCatID] : []),
  );
  const [expandedOneOff, setExpandedOneOff] = useState(
    () => new Set(Services[0] ? [Services[0].serviceCatID] : []),
  );
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const orderRef = useRef(0);

  const toggleService = (listType, category, service) => {
    const setSelections =
      listType === "recurring" ? setRecurringSelections : setOneOffSelections;

    setSelections((prev) => {
      const next = { ...prev };
      if (next[service.serviceID]) {
        delete next[service.serviceID];
      } else {
        next[service.serviceID] = {
          listType,
          serviceID: service.serviceID,
          serviceName: service.serviceName,
          categoryName: category.serviceCatName,
          driverValues: buildInitialDriverValues(service),
          order: orderRef.current++,
        };
      }
      return next;
    });
  };

  const updateDriverValue = (
    listType,
    serviceID,
    globalPricingDriverID,
    patch,
  ) => {
    const setSelections =
      listType === "recurring" ? setRecurringSelections : setOneOffSelections;

    setSelections((prev) => {
      if (!prev[serviceID]) return prev;
      return {
        ...prev,
        [serviceID]: {
          ...prev[serviceID],
          driverValues: {
            ...prev[serviceID].driverValues,
            [globalPricingDriverID]: {
              ...prev[serviceID].driverValues[globalPricingDriverID],
              ...patch,
            },
          },
        },
      };
    });
  };

  const removeSelection = (listType, serviceID) => {
    const setSelections =
      listType === "recurring" ? setRecurringSelections : setOneOffSelections;

    setSelections((prev) => {
      const next = { ...prev };
      delete next[serviceID];
      return next;
    });
  };

  const toggleCategoryExpand = (listType, categoryId) => {
    const setExpanded =
      listType === "recurring" ? setExpandedRecurring : setExpandedOneOff;

    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) next.delete(categoryId);
      else next.add(categoryId);
      return next;
    });
  };

  const filteredCategories = useMemo(
    () => filterCategories(Services, search, categoryFilter),
    [search, categoryFilter],
  );

  // While searching/filtering, auto-expand every matching category so results are visible.
  const visibleExpandedRecurring = useMemo(() => {
    if (!search.trim() && categoryFilter === "all") return expandedRecurring;
    return new Set(filteredCategories.map((category) => category.serviceCatID));
  }, [search, categoryFilter, expandedRecurring, filteredCategories]);

  const visibleExpandedOneOff = useMemo(() => {
    if (!search.trim() && categoryFilter === "all") return expandedOneOff;
    return new Set(filteredCategories.map((category) => category.serviceCatID));
  }, [search, categoryFilter, expandedOneOff, filteredCategories]);

  const expandAll = () => {
    const allIds = new Set(Services.map((category) => category.serviceCatID));
    setExpandedRecurring(allIds);
    setExpandedOneOff(new Set(allIds));
  };
  const collapseAll = () => {
    setExpandedRecurring(new Set());
    setExpandedOneOff(new Set());
  };

  const recurringSelectedList = useMemo(
    () => Object.values(recurringSelections).sort((a, b) => a.order - b.order),
    [recurringSelections],
  );
  const oneOffSelectedList = useMemo(
    () => Object.values(oneOffSelections).sort((a, b) => a.order - b.order),
    [oneOffSelections],
  );

  const categoryOptions = Services.map((category) => ({
    id: category.serviceCatID,
    name: category.serviceCatName,
  }));

  const totalSelected = recurringSelectedList.length + oneOffSelectedList.length;

  return (
    <div className="pss-root">
      <ServiceSelectionToolbar
        search={search}
        onSearchChange={setSearch}
        categoryFilter={categoryFilter}
        onCategoryFilterChange={setCategoryFilter}
        categoryOptions={categoryOptions}
        totalSelected={totalSelected}
        onExpandAll={expandAll}
        onCollapseAll={collapseAll}
      />

      <div className="pss-columns">
        <div className="pss-lists">
          <RecurringServices
            categories={filteredCategories}
            selections={recurringSelections}
            crossSelections={oneOffSelections}
            expandedIds={visibleExpandedRecurring}
            onToggleExpand={(categoryId) =>
              toggleCategoryExpand("recurring", categoryId)
            }
            onToggleService={(category, service) =>
              toggleService("recurring", category, service)
            }
            onDriverChange={(serviceID, globalPricingDriverID, patch) =>
              updateDriverValue(
                "recurring",
                serviceID,
                globalPricingDriverID,
                patch,
              )
            }
          />

          <OneOffServices
            categories={filteredCategories}
            selections={oneOffSelections}
            crossSelections={recurringSelections}
            expandedIds={visibleExpandedOneOff}
            onToggleExpand={(categoryId) =>
              toggleCategoryExpand("oneOff", categoryId)
            }
            onToggleService={(category, service) =>
              toggleService("oneOff", category, service)
            }
            onDriverChange={(serviceID, globalPricingDriverID, patch) =>
              updateDriverValue(
                "oneOff",
                serviceID,
                globalPricingDriverID,
                patch,
              )
            }
          />
        </div>

        <SelectedServices
          recurringSelected={recurringSelectedList}
          oneOffSelected={oneOffSelectedList}
          onRemove={removeSelection}
        />
      </div>
    </div>
  );
};

export default ServiceSelectionPOC;
