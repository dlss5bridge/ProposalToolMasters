/* global $ */
import { useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Select from "react-select";

import ErrorModel from "../../../../components/ErrorModel";
import { AuthContextProvider } from "../../../../AuthContext/AuthContext";
import { SaveMetricMapping } from "../../../../redux/reducer/metricsSlice";
import SuccessModal from "../../../../components/SuccessModal";

export default function MappingUI({
  drivers = [],
  metrics = [],
  metricMappings = [],
}) {
  const dispatch = useDispatch();
  const auth = useSelector((state) => state?.Storage);
  const { handleErrorMessage } = useContext(AuthContextProvider);

  //================ STATE =================
  const [mapping, setMapping] = useState({});
  const [savedMapping, setSavedMapping] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  const [openErrorModal, setOpenErrorModal] = useState(false);
  const formattedErrorMessage = handleErrorMessage(errorMessage);
  const [successMapping, setSuccessMapping] = useState({});
  const [expandedServices, setExpandedServices] = useState({});

  //success modal states
  const [openSuccessModal, setOpenSuccessModal] = useState(false);
  const [modelRequestData, setModelRequestData] = useState({
    message: null,
    status: null,
    Action: null,
    ProposalId: null,
    keyID: null,
    SearchKeyword: "",
    quoteKeyID: null,
    RefId: null,
  });
  //================ STYLES =================
  const headingStyle = { color: "#182031ff" };
  const labelStyle = { color: "#000000ff" };
  //================ DRIVER OPTIONS =================
  const driverOptions = drivers.map((d) => ({
    value: d.id,
    label: d.name,
  }));

  //================ PRELOAD EXISTING MAPPINGS =================
  //================ PRELOAD EXISTING MAPPINGS =================
  useEffect(() => {
    if (!metricMappings?.length || !drivers?.length) return;

    const formattedMapping = {};

    metricMappings.forEach((item) => {
      // selected drivers for react-select
      const selectedDrivers = [];

      // payload-ready drivers
      const payloadDrivers = [];

      // services for UI
      const services = [];

      item.drivers?.forEach((driverItem) => {
        // match full driver object
        const matchedDriver = drivers.find(
          (d) => Number(d.id) === Number(driverItem.globalPricingDriverId),
        );

        // react-select selected values
        if (
          matchedDriver &&
          !selectedDrivers.some(
            (s) => Number(s.value) === Number(matchedDriver.id),
          )
        ) {
          selectedDrivers.push({
            value: matchedDriver.id,
            label: matchedDriver.name,
          });
        }

        // payload structure
        payloadDrivers.push({
          globalPricingDriverId: driverItem.globalPricingDriverId,
          serviceId: driverItem.serviceId || null,
        });

        // ================= GLOBAL SERVICES =================
        if (
          driverItem.scope === "global" &&
          Array.isArray(driverItem.services)
        ) {
          driverItem.services.forEach((service) => {
            services.push({
              serviceID: service.serviceId,
              serviceName: service.serviceName,
            });
          });
        }

        // ================= LOCAL SERVICES =================
        if (driverItem.scope === "local" && driverItem.serviceName) {
          services.push({
            serviceID: driverItem.serviceId,
            serviceName: driverItem.serviceName,
          });
        }
      });

      // REMOVE DUPLICATE SERVICES
      const uniqueServices = services.filter(
        (service, index, self) =>
          index ===
          self.findIndex(
            (s) => Number(s.serviceID) === Number(service.serviceID),
          ),
      );

      // IMPORTANT: THIS SHOULD BE OUTSIDE drivers.forEach
      formattedMapping[item.metricKey] = {
        metricKey: item.metricKey,

        thresholdPercent: item.thresholdPercent || 0,

        selectedDrivers,

        drivers: payloadDrivers,

        services: uniqueServices,
      };
    });

    setMapping(formattedMapping);

    setSavedMapping(formattedMapping);
  }, [metricMappings, drivers]);

  //================ HANDLE SAVE =================
  const handleSave = async (metricKey) => {
    debugger;
    try {
      const payload = {
        metricKey: mapping[metricKey]?.metricKey,
        thresholdPercent: Number(mapping[metricKey]?.thresholdPercent || 0),
        drivers: mapping[metricKey]?.drivers || [],
      };

      // API CALL
      await dispatch(
        SaveMetricMapping({
          organisationKeyID: auth?.organisationKeyID,
          payload,
        }),
      ).unwrap();

      setOpenSuccessModal(true);
      setSuccessMapping((prev) => ({
        ...prev,
        [metricKey]: true,
      }));
      setTimeout(() => {
        setSuccessMapping((prev) => ({
          ...prev,
          [metricKey]: false,
        }));
      }, 4000);
    } catch (err) {
      console.error(err);
      setOpenErrorModal(true);
      setErrorMessage(err?.message || "Something went wrong");
    }
  };

  const handleClose = () => {
    setOpenErrorModal(false);
    setOpenSuccessModal(false);
  };

  //================ UI =================
  return (
    <div className="row g-4">
      {metrics.map((metric, index) => {
        const metricKey = metric.metricKey;
        const data = mapping[metricKey] || {};
        const isSaved = successMapping[metricKey];

        return (
          <div className="col-md-6 col-lg-4" key={metricKey || index}>
            <div className="h-100 p-3 bg-white border rounded-3">
              {/* HEADER */}
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <h6
                    className="mb-1 fw-semibold text-capitalize"
                    style={headingStyle}
                  >
                    {metricKey.replaceAll("_", " ")}
                  </h6>

                  {/* <small style={{ color: "#6b7280" }}>
                      {metric.description}
                    </small> */}
                </div>

                <div className="d-flex align-items-center gap-2">
                  {isSaved ? (
                    <span
                      className="badge"
                      style={{
                        background: "#ecfdf5",
                        color: "#16a34a",
                        fontSize: "11px",
                      }}
                    >
                      Saved
                    </span>
                  ) : (
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => handleSave(metricKey)}
                    >
                      Save
                    </button>
                  )}
                </div>
              </div>

              {/* DRIVER LABEL */}
              <p className="mb-1 small fw-semibold" style={labelStyle}>
                Proposal Tool Drivers
              </p>

              {/* SELECT */}
              <div className="mb-3">
                <Select
                  isMulti
                  options={driverOptions}
                  value={data.selectedDrivers || []}
                  onChange={(selected) => {
                    // selected driver full objects
                    const selectedDriverObjects = drivers.filter((d) =>
                      selected?.some(
                        (option) => Number(option.value) === Number(d.id),
                      ),
                    );

                    // create payload-ready drivers array
                    const payloadDrivers = [];

                    // collect services for UI
                    const services = [];

                    selectedDriverObjects.forEach((driver) => {
                      // GLOBAL DRIVER
                      const isGlobalDriver = driver.services?.every(
                        (service) => service.serviceID === null,
                      );

                      // ================= GLOBAL =================
                      if (isGlobalDriver) {
                        payloadDrivers.push({
                          globalPricingDriverId: driver.id,
                          serviceId: null,
                        });

                        // UI services only
                        driver.services.forEach((service) => {
                          services.push({
                            serviceID: null,
                            serviceName: service.serviceName,
                          });
                        });
                      }

                      // ================= LOCAL =================
                      else {
                        driver.services.forEach((service) => {
                          payloadDrivers.push({
                            globalPricingDriverId: driver.id,
                            serviceId: service.serviceID,
                          });

                          services.push({
                            serviceID: service.serviceID,
                            serviceName: service.serviceName,
                          });
                        });
                      }
                    });

                    setMapping((prev) => ({
                      ...prev,
                      [metricKey]: {
                        ...prev[metricKey],

                        // select value
                        selectedDrivers: selected,

                        // payload-ready array
                        drivers: payloadDrivers,

                        // for UI
                        services,

                        metricKey,

                        thresholdPercent:
                          prev[metricKey]?.thresholdPercent || 0,
                      },
                    }));
                  }}
                  placeholder="Select driver"
                />
              </div>

              {/* SERVICES */}
              <div className="d-flex align-items-center justify-content-between mb-2">
                <p className="mb-2 small fw-semibold" style={labelStyle}>
                  Proposal Services
                </p>

                {data?.services?.length > 3 && (
                  <button
                    type="button"
                    className="btn btn-sm p-0 border-0 bg-transparent"
                    title={
                      expandedServices[metricKey]
                        ? "Collapse services"
                        : "View all services"
                    }
                    onClick={() =>
                      setExpandedServices((prev) => ({
                        ...prev,
                        [metricKey]: !prev[metricKey],
                      }))
                    }
                  >
                    <i
                      className={`bi ${
                        expandedServices[metricKey]
                          ? "bi-chevron-up"
                          : "bi-chevron-down"
                      }`}
                      style={{ fontSize: "14px", color: "#6b7280" }}
                    />
                  </button>
                )}
              </div>

              {data?.services?.length > 0 ? (
                <>
                  <div
                    className={`d-flex flex-wrap gap-2 mb-3 ${
                      expandedServices[metricKey] ? "" : "overflow-hidden"
                    }`}
                    style={{
                      maxHeight: expandedServices[metricKey] ? "unset" : "34px",
                      transition: "max-height 0.3s ease",
                    }}
                  >
                    {(expandedServices[metricKey]
                      ? data.services
                      : data.services.slice(0, 3)
                    ).map((service, i) => (
                      <span key={i} className="service-tag">
                        {service.serviceName}
                      </span>
                    ))}

                    {!expandedServices[metricKey] &&
                      data.services.length > 3 && (
                        <span
                          className="service-tag"
                          style={{
                            background: "#eef2ff",
                            color: "#4338ca",
                            cursor: "pointer",
                          }}
                          title="Click expand icon to view all services"
                        >
                          +{data.services.length - 3}
                        </span>
                      )}
                  </div>

                  <div>
                    <label
                      className="form-label small fw-semibold"
                      style={{ color: "#6b7280" }}
                    >
                      Deviation (%)
                    </label>

                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter deviation"
                      value={data.thresholdPercent ?? ""}
                      onChange={(e) => {
                        const value = e.target.value;

                        // Allow empty value
                        if (value === "") {
                          setMapping((prev) => ({
                            ...prev,
                            [metricKey]: {
                              ...prev[metricKey],
                              thresholdPercent: "",
                            },
                          }));
                          return;
                        }

                        // Allow only numbers with up to 2 decimal places
                        if (!/^\d{0,3}(\.\d{0,2})?$/.test(value)) {
                          return;
                        }

                        const numValue = Number(value);

                        // Prevent values greater than 100
                        if (numValue > 100) return;

                        setMapping((prev) => ({
                          ...prev,
                          [metricKey]: {
                            ...prev[metricKey],
                            thresholdPercent: value, // Keep as string while typing
                          },
                        }));
                      }}
                      // onBlur={() => {
                      //   const value = Number(data.thresholdPercent);

                      //   if (!isNaN(value)) {
                      //     setMapping((prev) => ({
                      //       ...prev,
                      //       [metricKey]: {
                      //         ...prev[metricKey],
                      //         thresholdPercent: value.toFixed(2),
                      //       },
                      //     }));
                      //   }
                      // }}
                    />
                  </div>
                </>
              ) : (
                <p className="small" style={{ color: "#9ca3af" }}>
                  No drivers selected
                </p>
              )}
            </div>
          </div>
        );
      })}

      <ErrorModel
        ErrorModel={openErrorModal}
        handleClose={handleClose}
        ErrorMessage={formattedErrorMessage}
      />

      <SuccessModal
        handleClose={handleClose}
        setOpenSuccessModal={setOpenSuccessModal}
        openSuccessModal={openSuccessModal}
        modelAction={modelRequestData.Action}
        message="Changes Saved Successfully"
      />
    </div>
  );
}
