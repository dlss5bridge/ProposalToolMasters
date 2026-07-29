import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Plus, X } from "lucide-react";
import { Modal, Box } from "@mui/material";

import RecurringServices from "./components/RecurringServices";
import OneOffServices from "./components/OneOffServices";
import SelectedServices from "./components/SelectedServices";
import { filterCategories } from "./utils/filterCategories";
import {
  getSelectedCategories,
  getAddableCategories,
} from "./utils/filterBySelectionState";
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
  selectServicesSelectionError,
  setSelectedServiceIDs,
  setServicesSelectionError,
} from "../../../../redux/reducer/webProposal/services";
import "./ProposalServicesStep.css";
import { selectQuoteModel } from "../../../../redux/reducer/webProposal";

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

  const { userKeyID, organisationKeyID, quoteKeyID, clientID, quoteTypeID } =
    useSelector(selectQuoteModel) || {};

  const recurringServices = useSelector(selectRecurringServices);
  const recurringServicesLoading = useSelector(selectRecurringServicesLoading);
  const recurringServicesError = useSelector(selectRecurringServicesError);

  const oneOffServices = useSelector(selectOneOffServices);
  const oneOffServicesLoading = useSelector(selectOneOffServicesLoading);
  const oneOffServicesError = useSelector(selectOneOffServicesError);

  const selectionError = useSelector(selectServicesSelectionError);

  const [recurringSelections, setRecurringSelections] = useState({});
  const [oneOffSelections, setOneOffSelections] = useState({});
  const [expandedRecurring, setExpandedRecurring] = useState(() => new Set());
  const [expandedOneOff, setExpandedOneOff] = useState(() => new Set());
  const orderRef = useRef(0);
  const hydratedRef = useRef(false);
  const [isAddServiceModalOpen, setIsAddServiceModalOpen] = useState(false);

  // Staged picks made inside the Add Service dialog. Kept separate from the
  // committed selections above so a service (and its driver fields) stays
  // visible in the dialog until the user explicitly submits it.
  const [pendingRecurringSelections, setPendingRecurringSelections] = useState(
    {},
  );
  const [pendingOneOffSelections, setPendingOneOffSelections] = useState({});
  const [pendingErrors, setPendingErrors] = useState({
    recurring: {},
    oneOff: {},
  });

  useEffect(() => {
    if (!organisationKeyID || !quoteKeyID) return;

    const quoteIdentity = {
      userKeyID,
      organisationKeyID,
      quoteKeyID,
      clientID,
      quoteTypeID,
    };

    dispatch(getRecurringServices(quoteIdentity));
    dispatch(getOneOffServices(quoteIdentity));
  }, [
    dispatch,
    userKeyID,
    organisationKeyID,
    quoteKeyID,
    clientID,
    quoteTypeID,
  ]);

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

    setExpandedRecurring(
      new Set(
        recurringServices
          .filter((category) =>
            category.servicesList.some(
              (service) => hydratedRecurring[service.serviceID],
            ),
          )
          .map((category) => category.serviceCatID),
      ),
    );
    setExpandedOneOff(
      new Set(
        oneOffServices
          .filter((category) =>
            category.servicesList.some(
              (service) => hydratedOneOff[service.serviceID],
            ),
          )
          .map((category) => category.serviceCatID),
      ),
    );
  }, [
    recurringServices,
    oneOffServices,
    recurringServicesLoading,
    oneOffServicesLoading,
  ]);

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
          serviceCatID: category.serviceCatID,
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

  const clearPendingFieldError = (
    listType,
    serviceID,
    globalPricingDriverID,
  ) => {
    const listKey = listType === "recurring" ? "recurring" : "oneOff";

    setPendingErrors((prev) => {
      const serviceErrors = prev[listKey][serviceID];
      if (!serviceErrors) return prev;

      if (globalPricingDriverID === undefined) {
        if (!(serviceID in prev[listKey])) return prev;
        const nextListErrors = { ...prev[listKey] };
        delete nextListErrors[serviceID];
        return { ...prev, [listKey]: nextListErrors };
      }

      if (!(globalPricingDriverID in serviceErrors)) return prev;
      const nextServiceErrors = { ...serviceErrors };
      delete nextServiceErrors[globalPricingDriverID];
      const nextListErrors = { ...prev[listKey] };
      if (Object.keys(nextServiceErrors).length === 0) {
        delete nextListErrors[serviceID];
      } else {
        nextListErrors[serviceID] = nextServiceErrors;
      }
      return { ...prev, [listKey]: nextListErrors };
    });
  };

  const togglePendingService = (listType, category, service) => {
    const setPending =
      listType === "recurring"
        ? setPendingRecurringSelections
        : setPendingOneOffSelections;

    setPending((prev) => {
      const next = { ...prev };
      if (next[service.serviceID]) {
        delete next[service.serviceID];
      } else {
        next[service.serviceID] = {
          listType,
          serviceID: service.serviceID,
          serviceName: service.serviceName,
          categoryName: category.serviceCatName,
          serviceCatID: category.serviceCatID,
          driverValues: buildInitialDriverValues(service),
          order: orderRef.current++,
        };
      }
      return next;
    });

    clearPendingFieldError(listType, service.serviceID);
  };

  const updatePendingDriverValue = (
    listType,
    serviceID,
    globalPricingDriverID,
    patch,
  ) => {
    const setPending =
      listType === "recurring"
        ? setPendingRecurringSelections
        : setPendingOneOffSelections;

    setPending((prev) => {
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

    clearPendingFieldError(listType, serviceID, globalPricingDriverID);
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

  const defaultRecurringCategories = useMemo(
    () =>
      getSelectedCategories(filteredRecurringCategories, recurringSelections),
    [filteredRecurringCategories, recurringSelections],
  );
  const defaultOneOffCategories = useMemo(
    () => getSelectedCategories(filteredOneOffCategories, oneOffSelections),
    [filteredOneOffCategories, oneOffSelections],
  );

  const addableRecurringCategories = useMemo(
    () =>
      getAddableCategories(filteredRecurringCategories, recurringSelections),
    [filteredRecurringCategories, recurringSelections],
  );
  const addableOneOffCategories = useMemo(
    () => getAddableCategories(filteredOneOffCategories, oneOffSelections),
    [filteredOneOffCategories, oneOffSelections],
  );

  const recurringServiceByID = useMemo(() => {
    const map = new Map();
    recurringServices.forEach((category) => {
      category.servicesList.forEach((service) =>
        map.set(service.serviceID, service),
      );
    });
    return map;
  }, [recurringServices]);

  const oneOffServiceByID = useMemo(() => {
    const map = new Map();
    oneOffServices.forEach((category) => {
      category.servicesList.forEach((service) =>
        map.set(service.serviceID, service),
      );
    });
    return map;
  }, [oneOffServices]);

  const pendingCount =
    Object.keys(pendingRecurringSelections).length +
    Object.keys(pendingOneOffSelections).length;

  const validateSelectionFields = (service, driverValues) => {
    const fieldErrors = {};

    (service.pricingDriverList || [])
      .filter((driver) => driver.driverVisibility)
      .forEach((driver) => {
        const entry = driverValues?.[driver.globalPricingDriverID];

        if (driver.driverTypeID === 2) {
          if (
            entry?.value === "" ||
            entry?.value === null ||
            entry?.value === undefined
          ) {
            fieldErrors[driver.globalPricingDriverID] =
              `${driver.driverName} is required.`;
            return;
          }

          const numericValue = Number(entry.value);
          if (Number.isNaN(numericValue)) {
            fieldErrors[driver.globalPricingDriverID] = "Enter a valid number.";
            return;
          }

          const quantity = driver.quantity?.[0];
          const min =
            quantity?.quantityFrom !== undefined
              ? Number(quantity.quantityFrom)
              : undefined;
          const max =
            quantity?.quantityTo !== undefined
              ? Number(quantity.quantityTo)
              : undefined;
          if (
            (min !== undefined && numericValue < min) ||
            (max !== undefined && numericValue > max)
          ) {
            fieldErrors[driver.globalPricingDriverID] =
              `Enter a value between ${min} and ${max}.`;
          }
        } else if (driver.driverTypeID === 3 || driver.driverTypeID === 4) {
          if (entry?.value === null || entry?.value === undefined) {
            fieldErrors[driver.globalPricingDriverID] =
              `${driver.driverName} is required.`;
          }
        }
      });

    return fieldErrors;
  };

  const validatePendingSelections = () => {
    const errors = { recurring: {}, oneOff: {} };
    let hasError = false;

    Object.values(pendingRecurringSelections).forEach((selection) => {
      const service = recurringServiceByID.get(selection.serviceID);
      if (!service) return;
      const fieldErrors = validateSelectionFields(
        service,
        selection.driverValues,
      );
      if (Object.keys(fieldErrors).length > 0) {
        errors.recurring[selection.serviceID] = fieldErrors;
        hasError = true;
      }
    });

    Object.values(pendingOneOffSelections).forEach((selection) => {
      const service = oneOffServiceByID.get(selection.serviceID);
      if (!service) return;
      const fieldErrors = validateSelectionFields(
        service,
        selection.driverValues,
      );
      if (Object.keys(fieldErrors).length > 0) {
        errors.oneOff[selection.serviceID] = fieldErrors;
        hasError = true;
      }
    });

    return { errors, hasError };
  };

  const resetPendingState = () => {
    setPendingRecurringSelections({});
    setPendingOneOffSelections({});
    setPendingErrors({ recurring: {}, oneOff: {} });
  };

  const handleCloseAddServiceModal = () => {
    resetPendingState();
    setIsAddServiceModalOpen(false);
  };

  const handleSubmitAddedServices = () => {
    const { errors, hasError } = validatePendingSelections();
    if (hasError) {
      setPendingErrors(errors);
      return;
    }

    if (Object.keys(pendingRecurringSelections).length > 0) {
      setRecurringSelections((prev) => ({
        ...prev,
        ...pendingRecurringSelections,
      }));
      setExpandedRecurring((prev) => {
        const next = new Set(prev);
        Object.values(pendingRecurringSelections).forEach((selection) =>
          next.add(selection.serviceCatID),
        );
        return next;
      });
    }

    if (Object.keys(pendingOneOffSelections).length > 0) {
      setOneOffSelections((prev) => ({ ...prev, ...pendingOneOffSelections }));
      setExpandedOneOff((prev) => {
        const next = new Set(prev);
        Object.values(pendingOneOffSelections).forEach((selection) =>
          next.add(selection.serviceCatID),
        );
        return next;
      });
    }

    resetPendingState();
    setIsAddServiceModalOpen(false);
  };

  const recurringSelectedList = useMemo(
    () => Object.values(recurringSelections).sort((a, b) => a.order - b.order),
    [recurringSelections],
  );
  const oneOffSelectedList = useMemo(
    () => Object.values(oneOffSelections).sort((a, b) => a.order - b.order),
    [oneOffSelections],
  );

  useEffect(() => {
    const nextSelectedServiceIDs = [
      ...recurringSelectedList.map((selection) => selection.serviceID),
      ...oneOffSelectedList.map((selection) => selection.serviceID),
    ];
    dispatch(setSelectedServiceIDs(nextSelectedServiceIDs));
    if (nextSelectedServiceIDs.length > 0) {
      dispatch(setServicesSelectionError(false));
    }
  }, [dispatch, recurringSelectedList, oneOffSelectedList]);

  const renderRecurringPanel = ({
    categories,
    selections,
    crossSelections,
    onToggleService,
    onDriverChange,
    fieldErrors,
  }) => (
    <>
      {recurringServicesLoading && (
        <p className="pss-empty-state">Loading recurring services...</p>
      )}
      {recurringServicesError && (
        <p className="pss-empty-state">Failed to load recurring services.</p>
      )}
      {!recurringServicesLoading && !recurringServicesError && (
        <RecurringServices
          categories={categories}
          selections={selections}
          crossSelections={crossSelections}
          expandedIds={expandedRecurring}
          onToggleExpand={(categoryId) =>
            toggleCategoryExpand("recurring", categoryId)
          }
          onToggleService={onToggleService}
          onDriverChange={onDriverChange}
          fieldErrors={fieldErrors}
        />
      )}
    </>
  );

  const renderOneOffPanel = ({
    categories,
    selections,
    crossSelections,
    onToggleService,
    onDriverChange,
    fieldErrors,
  }) => (
    <>
      {oneOffServicesLoading && (
        <p className="pss-empty-state">Loading one-off services...</p>
      )}
      {oneOffServicesError && (
        <p className="pss-empty-state">Failed to load one-off services.</p>
      )}
      {!oneOffServicesLoading && !oneOffServicesError && (
        <OneOffServices
          categories={categories}
          selections={selections}
          crossSelections={crossSelections}
          expandedIds={expandedOneOff}
          onToggleExpand={(categoryId) =>
            toggleCategoryExpand("oneOff", categoryId)
          }
          onToggleService={onToggleService}
          onDriverChange={onDriverChange}
          fieldErrors={fieldErrors}
        />
      )}
    </>
  );

  return (
    <div className="pss-root">
      {selectionError && (
        <p className="pss-selection-error">
          Please select at least one service to continue.
        </p>
      )}
      <div className="pss-columns">
        <div className="pss-list-column">
          {renderRecurringPanel({
            categories: defaultRecurringCategories,
            selections: recurringSelections,
            crossSelections: oneOffSelections,
            onToggleService: (category, service) =>
              toggleService("recurring", category, service),
            onDriverChange: (serviceID, globalPricingDriverID, patch) =>
              updateDriverValue(
                "recurring",
                serviceID,
                globalPricingDriverID,
                patch,
              ),
          })}
        </div>

        <div className="pss-list-column">
          {renderOneOffPanel({
            categories: defaultOneOffCategories,
            selections: oneOffSelections,
            crossSelections: recurringSelections,
            onToggleService: (category, service) =>
              toggleService("oneOff", category, service),
            onDriverChange: (serviceID, globalPricingDriverID, patch) =>
              updateDriverValue(
                "oneOff",
                serviceID,
                globalPricingDriverID,
                patch,
              ),
          })}
        </div>

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

      <Modal open={isAddServiceModalOpen} onClose={handleCloseAddServiceModal}>
        <Box className="pss-modal-box">
          <div className="pss-modal-header">
            <h2 className="pss-modal-title">Add Service</h2>
            <button
              type="button"
              className="pss-modal-close"
              onClick={handleCloseAddServiceModal}
            >
              <X size={18} />
            </button>
          </div>

          <div className="pss-modal-columns">
            <div className="pss-list-column">
              {renderRecurringPanel({
                categories: addableRecurringCategories,
                selections: pendingRecurringSelections,
                crossSelections: {
                  ...oneOffSelections,
                  ...pendingOneOffSelections,
                },
                onToggleService: (category, service) =>
                  togglePendingService("recurring", category, service),
                onDriverChange: (serviceID, globalPricingDriverID, patch) =>
                  updatePendingDriverValue(
                    "recurring",
                    serviceID,
                    globalPricingDriverID,
                    patch,
                  ),
                fieldErrors: pendingErrors.recurring,
              })}
            </div>
            <div className="pss-list-column">
              {renderOneOffPanel({
                categories: addableOneOffCategories,
                selections: pendingOneOffSelections,
                crossSelections: {
                  ...recurringSelections,
                  ...pendingRecurringSelections,
                },
                onToggleService: (category, service) =>
                  togglePendingService("oneOff", category, service),
                onDriverChange: (serviceID, globalPricingDriverID, patch) =>
                  updatePendingDriverValue(
                    "oneOff",
                    serviceID,
                    globalPricingDriverID,
                    patch,
                  ),
                fieldErrors: pendingErrors.oneOff,
              })}
            </div>
          </div>

          <div className="pss-modal-footer">
            <span className="pss-modal-footer-count">
              {pendingCount > 0
                ? `${pendingCount} service${pendingCount > 1 ? "s" : ""} selected`
                : "No services selected"}
            </span>
            <button
              type="button"
              className="pss-modal-submit-btn"
              onClick={handleSubmitAddedServices}
              disabled={pendingCount === 0}
            >
              Add to Proposal
            </button>
          </div>
        </Box>
      </Modal>
    </div>
  );
};

export default ServiceSelectionComponent;
