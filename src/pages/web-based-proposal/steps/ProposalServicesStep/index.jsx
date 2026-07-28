import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Plus, X } from "lucide-react";
import { Modal, Box } from "@mui/material";

import RecurringServices from "./components/RecurringServices";
import OneOffServices from "./components/OneOffServices";
import SelectedServices from "./components/SelectedServices";
import { filterCategories } from "./utils/filterCategories";
import { buildSelectionsFromQuoteModel } from "./utils/buildSelectionsFromQuoteModel";
import {
  getRecurringServices,
  getOneOffServices,
  selectRecurringServices,
  selectRecurringServicesLoading,
  selectRecurringServicesError,
  selectOneOffServices,
  selectOneOffServicesLoading,
  selectOneOffServicesError,
} from "../../../../redux/reducer/webProposal/services";
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

const ServiceSelectionComponent = () => {
  const dispatch = useDispatch();

  const { userKeyID, organisationKeyID } = useSelector(
    (state) => state.Storage,
  );

  const recurringServices = useSelector(selectRecurringServices);
  const recurringServicesLoading = useSelector(selectRecurringServicesLoading);
  const recurringServicesError = useSelector(selectRecurringServicesError);

  const oneOffServices = useSelector(selectOneOffServices);
  const oneOffServicesLoading = useSelector(selectOneOffServicesLoading);
  const oneOffServicesError = useSelector(selectOneOffServicesError);

  const [recurringSelections, setRecurringSelections] = useState({});
  const [oneOffSelections, setOneOffSelections] = useState({});
  const [expandedRecurring, setExpandedRecurring] = useState(() => new Set());
  const [expandedOneOff, setExpandedOneOff] = useState(() => new Set());
  const orderRef = useRef(0);
  const hydratedRef = useRef(false);
  const [isAddServiceModalOpen, setIsAddServiceModalOpen] = useState(false);

  useEffect(() => {
    dispatch(getRecurringServices({ userKeyID, organisationKeyID }));
    dispatch(getOneOffServices({ userKeyID, organisationKeyID }));
  }, [dispatch, userKeyID, organisationKeyID]);

  useEffect(() => {
    if (hydratedRef.current) return;
    if (recurringServicesLoading || oneOffServicesLoading) return;
    if (!recurringServices.length && !oneOffServices.length) return;

    const {
      recurringSelections: hydratedRecurring,
      oneOffSelections: hydratedOneOff,
      nextOrder,
    } = buildSelectionsFromQuoteModel(recurringServices, oneOffServices);

    setRecurringSelections(hydratedRecurring);
    setOneOffSelections(hydratedOneOff);
    orderRef.current = nextOrder;
    hydratedRef.current = true;
  }, [
    recurringServices,
    oneOffServices,
    recurringServicesLoading,
    oneOffServicesLoading,
  ]);

  useEffect(() => {
    if (recurringServices[0]) {
      setExpandedRecurring((prev) =>
        prev.size === 0 ? new Set([recurringServices[0].serviceCatID]) : prev,
      );
    }
  }, [recurringServices]);

  useEffect(() => {
    if (oneOffServices[0]) {
      setExpandedOneOff((prev) =>
        prev.size === 0 ? new Set([oneOffServices[0].serviceCatID]) : prev,
      );
    }
  }, [oneOffServices]);

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

  const filteredRecurringCategories = useMemo(
    () => filterCategories(recurringServices, "", "all"),
    [recurringServices],
  );
  const filteredOneOffCategories = useMemo(
    () => filterCategories(oneOffServices, "", "all"),
    [oneOffServices],
  );

  const recurringSelectedList = useMemo(
    () => Object.values(recurringSelections).sort((a, b) => a.order - b.order),
    [recurringSelections],
  );
  const oneOffSelectedList = useMemo(
    () => Object.values(oneOffSelections).sort((a, b) => a.order - b.order),
    [oneOffSelections],
  );

  const recurringPanel = (
    <>
      {recurringServicesLoading && (
        <p className="pss-empty-state">Loading recurring services...</p>
      )}
      {recurringServicesError && (
        <p className="pss-empty-state">Failed to load recurring services.</p>
      )}
      {!recurringServicesLoading && !recurringServicesError && (
        <RecurringServices
          categories={filteredRecurringCategories}
          selections={recurringSelections}
          crossSelections={oneOffSelections}
          expandedIds={expandedRecurring}
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
      )}
    </>
  );

  const oneOffPanel = (
    <>
      {oneOffServicesLoading && (
        <p className="pss-empty-state">Loading one-off services...</p>
      )}
      {oneOffServicesError && (
        <p className="pss-empty-state">Failed to load one-off services.</p>
      )}
      {!oneOffServicesLoading && !oneOffServicesError && (
        <OneOffServices
          categories={filteredOneOffCategories}
          selections={oneOffSelections}
          crossSelections={recurringSelections}
          expandedIds={expandedOneOff}
          onToggleExpand={(categoryId) =>
            toggleCategoryExpand("oneOff", categoryId)
          }
          onToggleService={(category, service) =>
            toggleService("oneOff", category, service)
          }
          onDriverChange={(serviceID, globalPricingDriverID, patch) =>
            updateDriverValue("oneOff", serviceID, globalPricingDriverID, patch)
          }
        />
      )}
    </>
  );

  return (
    <div className="pss-root">
      <div className="pss-columns">
        <div className="pss-list-column">{recurringPanel}</div>

        <div className="pss-list-column">{oneOffPanel}</div>

        <div className="pss-list-column">
          <button
            type="button"
            className="pss-add-service-btn"
            onClick={() => setIsAddServiceModalOpen(true)}
          >
            <Plus size={16} />
            <span>Add Service</span>
          </button>
          <SelectedServices
            recurringSelected={recurringSelectedList}
            oneOffSelected={oneOffSelectedList}
            onRemove={removeSelection}
          />
        </div>
      </div>

      <Modal
        open={isAddServiceModalOpen}
        onClose={() => setIsAddServiceModalOpen(false)}
      >
        <Box className="pss-modal-box">
          <div className="pss-modal-header">
            <h2 className="pss-modal-title">Add Service</h2>
            <button
              type="button"
              className="pss-modal-close"
              onClick={() => setIsAddServiceModalOpen(false)}
            >
              <X size={18} />
            </button>
          </div>

          <div className="pss-modal-columns">
            <div className="pss-list-column">{recurringPanel}</div>
            <div className="pss-list-column">{oneOffPanel}</div>
          </div>
        </Box>
      </Modal>
    </div>
  );
};

export default ServiceSelectionComponent;
