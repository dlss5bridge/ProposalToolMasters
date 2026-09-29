/* global $ */
import React, { useContext, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { AuthContextProvider } from "../../../AuthContext/AuthContext";
import Android12Switch from "../../../components/AndroidSwitch";
import {
    GetDeviationList,
    GetServiceReviewRuns,
    GetDeviationsByReviewLogID,
    GetServiceReviewSettings,
    AddUpdateServiceReviewSettings,
} from "../../../redux/Services/Setting/DeviationApi";
import { useNavigate } from "react-router-dom";
import { CreateContractFromDeviation } from "../../../redux/Services/EngagementLetter/EngagementLetterApi";
import "./deviation.css";

const Deviation = () => {
    const { setLoader, setTopbar } = useContext(AuthContextProvider);
    const common = useSelector((state) => state.Storage);

    const [activeTab, setActiveTab] = useState("deviation");
    const [visibleCount, setVisibleCount] = useState(10);
    const [loadingMore, setLoadingMore] = useState(false);
    const [deviationData, setDeviationData] = useState([]);
    const [isServiceReviewEnabled, setIsServiceReviewEnabled] = useState(false);
    const [frequencyDays, setFrequencyDays] = useState(90);
    const [runs, setRuns] = useState([]);
    const [runLimit, setRunLimit] = useState(10);
    const [expandedRunId, setExpandedRunId] = useState(null);
    const [isRunning, setIsRunning] = useState(false);
    const [actionError, setActionError] = useState("");
    const [onlyNew, setOnlyNew] = useState(true);

    // config cadence 
    const [cadence, setCadence] = useState("quarterly");
    const [reminderDays, setReminderDays] = useState(0);
    const [nextRunOn, setNextRunOn] = useState(null);
    const [saveMessage, setSaveMessage] = useState("");
    
    const STATE_BADGES = {
        create_contract:    { label: "Variance found",   cls: "bg-warning text-dark" },
        deviating_outdated: { label: "Varied (earlier)", cls: "bg-light text-dark border" },
        successor_pending:  { label: "Revision in progress", cls: "bg-info text-dark" },
        superseded:         { label: "Superseded",         cls: "bg-secondary" },
        clean:              { label: "No Variance",       cls: "bg-success" },
        skipped:            { label: "Not reviewed",       cls: "bg-light text-dark border" },
        failed:             { label: "Review failed",      cls: "bg-danger" },
    };

    const FINDING_BADGES = {
        new:       { label: "New",        cls: "bg-warning text-dark" },
        reminder:  { label: "Reminder",   cls: "bg-info text-dark" },
        unchanged: { label: "Unchanged",  cls: "bg-light text-dark border" },
    };

    const CADENCE_OPTIONS = [
        { value: "daily", label: "Daily", hint: "Catches newly signed contracts within a day" },
        { value: "monthly", label: "Monthly", hint: "Runs on the same date each month" },
        { value: "quarterly", label: "Quarterly", hint: "Runs every three months" },
        { value: "half_yearly", label: "Half-yearly", hint: "Runs every six months" },
        { value: "annually", label: "Annually", hint: "Runs once a year" },
        { value: "custom", label: "Custom", hint: "Choose your own interval in days" },
    ];

    const visibleContracts = (run) =>
    onlyNew
        ? run.contracts.filter(c => c.findingState === "new" || c.findingState === "reminder")
        : run.contracts;


    const loadHistory = async (limit = runLimit, expandLatest = false) => {
      if (!common.organisationKeyID) return;
      try {
        setLoader(true);
        const res = await GetServiceReviewRuns(common.organisationKeyID, limit);
        const list = res?.data?.runs ?? res?.runs ?? [];
        setRuns(Array.isArray(list) ? list : []);
        if (expandLatest && list.length > 0)
          setExpandedRunId(list[0].reviewLogId);
      } catch (err) {
        console.error(err);
      } finally {
        setLoader(false);
      }
    };

    useEffect(() => {
        if (activeTab === "deviation") loadHistory(runLimit, true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab, common.organisationKeyID, runLimit]);

    const navigate = useNavigate();

    // One contract can deviate on several drivers -> one group, one button.
    const groupedDeviations = useMemo(() => {
        const map = new Map();
        (Array.isArray(deviationData) ? deviationData : []).forEach((item) => {
            const key = item.contractKeyID ?? item.contractRefID ?? "unknown";
            if (!map.has(key)) {
                map.set(key, {
                    contractKeyID: item.contractKeyID ?? null,
                    contractRefID: item.contractRefID ?? null,
                    clientName: item.clientName ?? item.ClientName,
                    rows: [],
                });
            }
            map.get(key).rows.push(item);
        });
        return Array.from(map.values());
    }, [deviationData]);

    const visibleGroups = groupedDeviations.slice(0, visibleCount);

    // const handleCreateRevisedContract = async (group) => {
    //     if (!group.contractKeyID) return;
    //     try {
    //         setLoader(true);
    //         const res = await CreateContractFromDeviation({
    //             contractKeyID: group.contractKeyID,
    //             userKeyID: common.userKeyID,
    //             deviations: group.rows.map((d) => ({
    //                 globalPricingDriverID: d.globalPricingDriverId ?? d.globalPricingDriverID,
    //                 actualValue: d.actualValue,
    //             })),
    //         });

    //         const data = res?.data?.responseData?.data;
    //         if (res?.data?.statusCode !== 200 || !data?.contractKeyID) {
    //             console.error(res?.response?.data?.errorMessage);
    //             return;
    //         }

    //         setTopbar("none");
    //         navigate("/add-engagement-letter", {
    //             state: {
    //                 Action: "Update",                    // existing edit path, on the NEW draft
    //                 contractKeyID: data.contractKeyID,
    //                 clientName: group.clientName,
    //                 jumpToPricingTab: data.targetTab,    // 4, 7, or null
    //             },
    //         });
    //     } catch (err) {
    //         console.error(err);
    //     } finally {
    //         setLoader(false);
    //     }
    // };

    const handleCreateRevisedContract = async (run, contract) => {
    setActionError("");
    try {
        setLoader(true);
        const res = await CreateContractFromDeviation({
            contractKeyID: contract.contractKeyId,
            userKeyID: common.userKeyID,
            reviewLogID: run.reviewLogId,
        });

        const data = res?.data?.responseData?.data;
        if (res?.data?.statusCode !== 200 || !data?.contractKeyID) {
            // e.g. a revision already exists, or a newer run replaced this one
            setActionError(res?.response?.data?.errorMessage || "Could not create the revised Engagement Letter.");
            await loadHistory(runLimit);
            return;
        }

        setTopbar("none");
        navigate("/add-engagement-letter", {
            state: {
                Action: "Update",
                contractKeyID: data.contractKeyID,
                clientName: contract.clientName,
                jumpToPricingTab: data.targetTab,
            },
        });
    } catch (err) {
        console.error(err);
    } finally {
        setLoader(false);
    }
};

const openSuccessor = (contract) => {
    if (!contract.successorContractKeyId) return;
    setTopbar("none");
    navigate("/add-engagement-letter", {
        state: { Action: "Update", contractKeyID: contract.successorContractKeyId, clientName: contract.clientName },
    });
};

const formatDate = (d) => (d ? new Date(d).toLocaleString() : "-");

const toggleRun = (id) => setExpandedRunId((cur) => (cur === id ? null : id));

const formatValue = (v) =>
    v === null || v === undefined ? "-" : Number(v).toLocaleString(undefined, { maximumFractionDigits: 2 });

const deltaClass = (pct) => (Number(pct) >= 0 ? "dev-delta--up" : "dev-delta--down");

    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };

    useEffect(() => {
        if (activeTab !== "configuration" || !common.organisationKeyID) {
            return;
        }

        const loadServiceReviewSettings = async () => {
            try {
                setLoader(true);
                const response = await GetServiceReviewSettings(common.organisationKeyID);
                const settings = response?.data?.responseData?.data
                    ?? response?.data?.responseData
                    ?? response?.data
                    ?? response;
                console.log(settings.settings);
                if (settings.settings) {
                    const s = settings.settings;
                    setIsServiceReviewEnabled(s.isEnabled ?? false); 
                    setCadence(s.cadence ?? "quarterly");
                    setFrequencyDays(s.frequencyDays ?? 90);
                    setReminderDays(s.reminderDays ?? 0);
                    setNextRunOn(s.nextRunOn ?? null);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoader(false);
            }
        };

        loadServiceReviewSettings();
    }, [activeTab, common.organisationKeyID, setLoader]);

    const handleSaveConfiguration = async () => {
        try {
            setLoader(true);
            const res = await AddUpdateServiceReviewSettings({
                organisationID: common.organisationKeyID,
                isEnabled: isServiceReviewEnabled,
                cadence,
                frequencyDays: Number(frequencyDays) || 90,
                reminderDays: Number(reminderDays) || 0,
            });
            const s = res?.data?.settings ?? res?.settings;
            if (s?.nextRunOn) setNextRunOn(s.nextRunOn);
            setSaveMessage("Settings saved");
        } catch (error) {
            console.error(error);
            setSaveMessage("Could not save settings");
        } finally {
            setLoader(false);
        }
    };

    // Fetch Data
    // useEffect(() => {
    //     const fetchData = async () => {
    //         try {
    //             setLoader(true);

    //             const res = await GetDeviationList(common.organisationKeyID);
    //             const reviewLogId = res?.data?.reviewLogId ?? res?.reviewLogId;

    //             setData(reviewLogId);
    //             console.log(reviewLogId);
    //         } catch (err) {
    //             console.error(err);
    //         } finally {
    //             setLoader(false);
    //         }
    //     };

    //     if (common.organisationKeyID) fetchData();
    // }, [common.organisationKeyID,manualRun]);


    // const hanldeManualRun = async(reviewLogId) => {
    //     if(!reviewLogId) return;
    //     try {
    //         setManualRun(true);
    //         setLoader(true);
            
    //         const deviations = await GetDeviationsByReviewLogID(
    //             common.organisationKeyID,
    //             reviewLogId
    //         );
    //         const responseData = deviations?.data ?? deviations;
    //         const deviationList = Array.isArray(responseData?.deviations)
    //             ? responseData.deviations
    //             : [];
    //         console.log(deviationList);
    //         setDeviationData(deviationList);
    //     }
    //     catch(err) {
    //         console.error(err)
    //     }
    //     finally{
    //         setLoader(false);
    //     }
    // }
    

    // Load More Handler
    
//     const handleManualRun = async () => {
//     try {
//         setLoader(true);
//         setDeviationData([]);
//         setVisibleCount(10);

//         const res = await GetDeviationList(
//             common.organisationKeyID
//         );

//         const reviewLogId =
//             res?.data?.reviewLogId ?? res?.reviewLogId;

//         if (!reviewLogId) return;

//         const deviations = await GetDeviationsByReviewLogID(
//             common.organisationKeyID,
//             reviewLogId
//         );

//         const responseData = deviations?.data ?? deviations;

//         const deviationList = Array.isArray(responseData?.deviations)
//             ? responseData.deviations
//             : [];

//         setDeviationData(deviationList);

//     } catch (err) {
//         console.error(err);
//     } finally {
//         setLoader(false);
//     }
// };

const handleManualRun = async () => {
    setActionError("");
    try {
        setIsRunning(true);
        setLoader(true);
        const res = await GetDeviationList(common.organisationKeyID);   // POST /run
        const status = res?.status ?? res?.response?.status;
        if (status === 409) {
            setActionError("A review is already running. Please wait for it to finish.");
            return;
        }
        await loadHistory(runLimit, true);
    } catch (err) {
        console.error(err);
    } finally {
        setIsRunning(false);
        setLoader(false);
    }
};


    const handleLoadMore = () => {
        setLoadingMore(true);

        setTimeout(() => {
            setVisibleCount((prev) => prev + 10);
            setLoadingMore(false);
        }, 500); // small delay for spinner UX
    };

    return (
      <div className="container-fluid deviation-page">
        <div className="services page-background">
          <div className="row">
            <div className="col-lg-12">
              <div className="card">
                <div className="card-body mb-2" style={{ marginTop: "3rem" }}>
                  <ul className="nav nav-tabs mb-4" role="tablist">
                    <li className="nav-item" role="presentation">
                      <button
                        className={`nav-link tab_nav ${activeTab === "deviation" ? "active" : ""}`}
                        type="button"
                        onClick={() => handleTabChange("deviation")}
                      >
                        <b>Fee Assurance</b>
                      </button>
                    </li>
                    <li className="nav-item" role="presentation">
                      <button
                        className={`nav-link tab_nav ${activeTab === "configuration" ? "active" : ""}`}
                        type="button"
                        onClick={() => handleTabChange("configuration")}
                      >
                        <b>Configuration</b>
                      </button>
                    </li>
                  </ul>

                  {activeTab === "deviation" && (
                    <>
                      <div className="deviation-history-toolbar">
                        <div className="deviation-toolbar-left">
                          <span className="deviation-eyebrow">
                            Review activity
                          </span>
                          <div className="deviation-heading-row">
                            <h1>Fee Assurance History</h1>
                            <div className="deviation-filter form-check form-switch">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id="onlyNew"
                                checked={onlyNew}
                                onChange={(e) => setOnlyNew(e.target.checked)}
                              />
                              <label
                                className="form-check-label small"
                                htmlFor="onlyNew"
                              >
                                New findings only
                              </label>
                            </div>
                          </div>
                          {actionError && (
                            <div className="text-danger small mt-1">
                              {actionError}
                            </div>
                          )}
                        </div>

                        <button
                          className="btn btn-primary create-item-btn deviation-run-button"
                          onClick={handleManualRun}
                          disabled={isRunning}
                        >
                          {isRunning ? "Running..." : "Run Review Now"}
                        </button>
                      </div>

                      <div className="table-responsive table-card mt-2 mb-3 table-padding deviation-history-table">
                        <table className="table align-middle table-nowrap mb-0">
                          <thead className="table-light table-header-font">
                            <tr className="head-row">
                              <td className="tr-table-class text-white">
                                Run Date
                              </td>
                              <td className="tr-table-class text-white">
                                Trigger
                              </td>
                              <td className="tr-table-class text-white">
                                Status
                              </td>
                              <td className="tr-table-class text-white">
                                Contracts Reviewed
                              </td>
                              <td className="tr-table-class text-white">
                                Variance Count
                              </td>
                              <td className="tr-table-class text-white"></td>
                            </tr>
                          </thead>
                          <tbody className="list form-check-all">
                            {runs.map((run) => {
                              const isOpen = expandedRunId === run.reviewLogId;
                              const panelId = `run-panel-${run.reviewLogId}`;
                              return (
                                <React.Fragment key={run.reviewLogId}>
                                  <tr
                                    className={`table_new table-content-font dev-run-row ${isOpen ? "is-open" : ""}`}
                                    onClick={() => toggleRun(run.reviewLogId)}
                                  >
                                    <td>{formatDate(run.runStartedAt)}</td>
                                    <td>
                                      <span
                                        className={`dev-pill dev-pill--${run.triggerType}`}
                                      >
                                        {run.triggerType}
                                      </span>
                                    </td>
                                    <td>
                                      <span
                                        className={`dev-pill dev-pill--${run.executionStatus}`}
                                      >
                                        {run.executionStatus}
                                      </span>
                                    </td>
                                    <td>{run.contractsProcessed}</td>
                                    <td>
                                      {run.deviationsFound > 0 ? (
                                        <span className="dev-count">
                                          {run.deviationsFound}
                                        </span>
                                      ) : (
                                        <span className="dev-muted">0</span>
                                      )}
                                    </td>
                                    <td className="text-end">
                                      <button
                                        type="button"
                                        className="dev-toggle"
                                        aria-expanded={isOpen}
                                        aria-controls={panelId}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          toggleRun(run.reviewLogId);
                                        }}
                                      >
                                        {isOpen ? "Hide" : "View"}
                                        <svg
                                          className="dev-chevron"
                                          viewBox="0 0 16 16"
                                          fill="none"
                                          aria-hidden="true"
                                        >
                                          <path
                                            d="M4 6l4 4 4-4"
                                            stroke="currentColor"
                                            strokeWidth="1.8"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                          />
                                        </svg>
                                      </button>
                                    </td>
                                  </tr>

                                  {/* Always mounted so it can animate closed as well as open */}
                                  <tr
                                    className={`dev-detail-row ${isOpen ? "is-open" : ""}`}
                                  >
                                    <td colSpan={6}>
                                      <div
                                        id={panelId}
                                        className={`dev-collapse ${isOpen ? "is-open" : ""}`}
                                      >
                                        <div className="dev-panel">
                                          {visibleContracts(run).length ===
                                          0 ? (
                                            <div className="dev-empty">
                                              No contracts were reviewed in this
                                              run
                                            </div>
                                          ) : (
                                            <div className="table-responsive dev-inner-table-wrap mt-2">
                                              <table className="dev-inner-table">
                                                <thead>
                                                  <tr>
                                                    <th>
                                                      Prospect / Engagement
                                                      Letter
                                                    </th>
                                                    <th>Scope</th>
                                                    <th className="dev-num">
                                                      Default
                                                    </th>
                                                    <th className="dev-num">
                                                      Actual
                                                    </th>
                                                    <th className="dev-num">
                                                      Variance
                                                    </th>
                                                    <th>Status</th>
                                                    <th>Action</th>
                                                  </tr>
                                                </thead>
                                                {visibleContracts(run).map(
                                                  (contract) => {
                                                    const rows =
                                                      contract.deviations
                                                        .length > 0
                                                        ? contract.deviations
                                                        : [null];
                                                    const badge =
                                                      STATE_BADGES[
                                                        contract.actionState
                                                      ] ?? STATE_BADGES.clean;
                                                    return (
                                                      <tbody
                                                        key={`${run.reviewLogId}-${contract.contractId}`}
                                                      >
                                                        {rows.map((d, i) => (
                                                          <tr key={i}>
                                                            {i === 0 && (
                                                              <td
                                                                rowSpan={
                                                                  rows.length
                                                                }
                                                              >
                                                                <div className="dev-client">
                                                                  {
                                                                    contract.clientName
                                                                  }
                                                                </div>
                                                                <div className="dev-ref">
                                                                  {
                                                                    contract.contractRefId
                                                                  }
                                                                </div>
                                                              </td>
                                                            )}
                                                            <td>
                                                              {d ? (
                                                                d.driverName
                                                              ) : (
                                                                <span className="dev-muted">
                                                                  —
                                                                </span>
                                                              )}
                                                            </td>
                                                            <td className="dev-num">
                                                              {d
                                                                ? formatValue(
                                                                    d.expectedValue,
                                                                  )
                                                                : "—"}
                                                            </td>
                                                            <td className="dev-num">
                                                              {d
                                                                ? formatValue(
                                                                    d.actualValue,
                                                                  )
                                                                : "—"}
                                                            </td>
                                                            <td className="dev-num">
                                                              {d ? (
                                                                <span
                                                                  className={deltaClass(
                                                                    d.deviationPercent,
                                                                  )}
                                                                >
                                                                  {Number(
                                                                    d.deviationPercent,
                                                                  ) > 0
                                                                    ? "+"
                                                                    : ""}
                                                                  {
                                                                    d.deviationPercent
                                                                  }
                                                                  %
                                                                </span>
                                                              ) : (
                                                                "—"
                                                              )}
                                                            </td>
                                                            {i === 0 && (
                                                              <>
                                                                <td
                                                                  rowSpan={
                                                                    rows.length
                                                                  }
                                                                >
                                                                  <span
                                                                    className={`badge ${badge.cls}`}
                                                                  >
                                                                    {
                                                                      badge.label
                                                                    }
                                                                  </span>
                                                                </td>
                                                                {/* {contract.findingState && FINDING_BADGES[contract.findingState] && (
                                                                                        <span className={`badge ms-1 ${FINDING_BADGES[contract.findingState].cls}`}>
                                                                                            {FINDING_BADGES[contract.findingState].label}
                                                                                        </span>
                                                                                    )} */}
                                                                <td
                                                                  rowSpan={
                                                                    rows.length
                                                                  }
                                                                >
                                                                  {contract.canCreateContract && (
                                                                    <button
                                                                      type="button"
                                                                      className="btn btn-sm btn-primary create-item-btn"
                                                                      onClick={() =>
                                                                        handleCreateRevisedContract(
                                                                          run,
                                                                          contract,
                                                                        )
                                                                      }
                                                                    >
                                                                      Create New
                                                                      Contract
                                                                    </button>
                                                                  )}
                                                                  {contract.actionState ===
                                                                    "successor_pending" &&
                                                                    contract.successorStatusId ===
                                                                      1 && (
                                                                      <button
                                                                        type="button"
                                                                        className="btn btn-sm btn-light"
                                                                        onClick={() =>
                                                                          openSuccessor(
                                                                            contract,
                                                                          )
                                                                        }
                                                                      >
                                                                        Open
                                                                        Draft
                                                                      </button>
                                                                    )}
                                                                </td>
                                                              </>
                                                            )}
                                                          </tr>
                                                        ))}
                                                      </tbody>
                                                    );
                                                  },
                                                )}
                                              </table>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </td>
                                  </tr>
                                </React.Fragment>
                              );
                            })}
                          </tbody>
                        </table>

                        {runs.length === 0 && (
                          <div className="dev-empty">No review runs yet</div>
                        )}

                        {runs.length >= runLimit && runLimit < 100 && (
                          <div className="text-center my-3">
                            <button
                              className="btn btn-success create-item-btn"
                              onClick={() =>
                                setRunLimit((l) => Math.min(l + 10, 100))
                              }
                            >
                              Show More Runs
                            </button>
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {activeTab === "configuration" && (
                    <div className="row justify-content-center">
                      <div className="col-xl-8 col-lg-10">
                        <div className="card border-0 shadow-sm">
                          <div className="card-body p-4 p-md-5">
                            <div className="d-flex align-items-start justify-content-between gap-3 mb-4">
                              <div>
                                <h4 className="mb-2">
                                  Service review settings
                                </h4>
                                <p className="text-muted mb-0">
                                  Automatically check your services for
                                  deviations on a regular schedule.
                                </p>
                              </div>
                              <Android12Switch
                                checked={isServiceReviewEnabled}
                                onChange={(event) =>
                                  setIsServiceReviewEnabled(
                                    event.target.checked,
                                  )
                                }
                                inputProps={{
                                  "aria-label": "Enable service review setting",
                                }}
                              />
                            </div>

                            <div className="border-top pt-4">
                              <div className="d-flex align-items-center justify-content-between mb-3">
                                <label
                                  className="form-label fw-semibold mb-0"
                                  htmlFor="frequencyDays"
                                >
                                  Enable service review setting
                                </label>
                                <span
                                  className={`badge ${isServiceReviewEnabled ? "bg-success" : "bg-secondary"}`}
                                >
                                  {isServiceReviewEnabled
                                    ? "Enabled"
                                    : "Disabled"}
                                </span>
                              </div>

                              {isServiceReviewEnabled ? (
                                <>
                                  {/* <label className="form-label" htmlFor="frequencyDays">
                                                                    Frequency days
                                                                </label>
                                                                <input
                                                                    id="frequencyDays"
                                                                    className="form-control"
                                                                    type="number"
                                                                    min="1"
                                                                    max="365"
                                                                    value={frequencyDays}
                                                                    onChange={(event) => setFrequencyDays(event.target.value)}
                                                                />
                                                                <div className="alert alert-info mt-3 mb-0" role="status">
                                                                    Service review will run every {frequencyDays || "___"} days and if any deviations are found, you will be notified via email.
                                                                </div> */}
                                  <label
                                    className="form-label"
                                    htmlFor="cadence"
                                  >
                                    How often should the signed contracts be
                                    reviewed?
                                  </label>
                                  <select
                                    id="cadence"
                                    className="form-select"
                                    value={cadence}
                                    onChange={(e) => setCadence(e.target.value)}
                                  >
                                    {CADENCE_OPTIONS.map((o) => (
                                      <option key={o.value} value={o.value}>
                                        {o.label}
                                      </option>
                                    ))}
                                  </select>
                                  <div className="form-text">
                                    {
                                      CADENCE_OPTIONS.find(
                                        (o) => o.value === cadence,
                                      )?.hint
                                    }
                                  </div>

                                  {cadence === "custom" && (
                                    <div className="mt-3">
                                      <label
                                        className="form-label"
                                        htmlFor="frequencyDays"
                                      >
                                        Every how many days?
                                      </label>
                                      <input
                                        id="frequencyDays"
                                        className="form-control"
                                        type="number"
                                        min="1"
                                        max="365"
                                        value={frequencyDays}
                                        onChange={(e) =>
                                          setFrequencyDays(e.target.value)
                                        }
                                      />
                                    </div>
                                  )}

                                  <div className="mt-3">
                                    <label
                                      className="form-label"
                                      htmlFor="reminderDays"
                                    >
                                      Remind me about unresolved deviations
                                    </label>
                                    <select
                                      id="reminderDays"
                                      className="form-select"
                                      value={reminderDays}
                                      onChange={(e) =>
                                        setReminderDays(Number(e.target.value))
                                      }
                                    >
                                      <option value={0}>
                                        Never — only tell me about new
                                        deviations
                                      </option>
                                      <option value={30}>After 30 days</option>
                                      <option value={60}>After 60 days</option>
                                      <option value={90}>After 90 days</option>
                                    </select>
                                    <div className="form-text">
                                      You are emailed when a deviation first
                                      appears or materially changes. This
                                      controls how often outstanding ones are
                                      raised again.
                                    </div>
                                  </div>

                                  <div
                                    className="alert alert-info mt-3 mb-0"
                                    role="status"
                                  >
                                    {nextRunOn ? (
                                      <>
                                        Next review due{" "}
                                        <strong>
                                          {new Date(
                                            nextRunOn,
                                          ).toLocaleDateString()}
                                        </strong>
                                        .
                                      </>
                                    ) : (
                                      <>
                                        The first review will run on the next
                                        scheduled check.
                                      </>
                                    )}
                                  </div>

                                  {saveMessage && (
                                    <div className="text-success small mt-2">
                                      {saveMessage}
                                    </div>
                                  )}
                                </>
                              ) : (
                                <p className="text-muted mb-0">
                                  Turn on this setting to choose how often your
                                  services should be reviewed.
                                </p>
                              )}

                              <div className="text-end mt-4">
                                <button
                                  type="button"
                                  className="btn btn-primary create-item-btn"
                                  onClick={handleSaveConfiguration}
                                >
                                  Save Configuration
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
};

export default Deviation;


// /* global $ */
// import React, { useContext, useEffect, useState } from "react";
// import CommonButtonComponent from "../../../components/CommonButtonComponent";
// import { useNavigate } from "react-router";
// import Android12Switch from "../../../components/AndroidSwitch";
// import FormGroup from "@mui/material/FormGroup";
// import FormControlLabel from "@mui/material/FormControlLabel";
// import Tooltip, { tooltipClasses } from "@mui/material/Tooltip";
// import { AuthContextProvider } from "../../../AuthContext/AuthContext";
// import { useDispatch, useSelector } from "react-redux";
// import {
//     CopyPackage,
//     GetPackageList,
//     GetServicePackageModel,
//     ServicePackageChangeStatus,
//     ServicePackageDelete,
// } from "../../../redux/Services/Config/PackageApi";
// import PaginationComponent from "../../../components/PaginationModel";
// import NoResultFoundModel from "../../../components/NoResultFoundModel";
// import ErrorModel from "../../../components/ErrorModel";
// import ConfirmModel from "../../../components/ConfirmationBox";
// import SuccessModal from "../../../components/SuccessModal";
// import Footer from "../../../components/Footer";
// import RecordsAvailablePopupModel from "../../../components/RecordsAvailablePopupModel";
// import { updateState } from "../../../redux/Persist";
// import FilterModel from "../../../components/FilterModel";
// import { GetDeviationList } from "../../../redux/Services/Setting/DeviationApi";


// const Deviation = () => {
//     //const
//     const moduleName = "Deviation";

//     //auth context
//     const {
//         setLoader,
//         setTopbar,
//         isMobile,
//         setListCount,
//         listCount,
//         desktopRecords,
//         isMobileRecords,
//         getCrudButtonTextName,
//         getPlaceholderTextName,
//         getCrudButtonToolTipName,
//         userAccessData,
//         EngagementName,
//         proposalName,
//         handleErrorMessage,
//         formatValue,
//     } = useContext(AuthContextProvider);

//     //redux state
//     const common = useSelector((state) => state.Storage);
//     //state
//     const [totalRecords, setTotalRecords] = useState(-1);
//     const [openErrorModal, setOpenErrorModal] = useState(false);

//     //useEffect

//     useEffect(() => {
//         async function fetchData() {
//             const res = GetDeviationList(common.organisationKeyID);

//         }

//         if (common.organisationKeyID) fetchData()
//     }, [])

//     return (
//         <>
//             <div className="container-fluid">
//                 {/* <div class="main-content"> */}
//                 <div class="services page-background">
//                     <div class="">
//                         <div class="row">
//                             <div class="col-lg-12">
//                                 <div class="card">
//                                     {/* end card header  */}
//                                     <div class="card-body mb-2">
//                                         <div id="customerList" style={{ marginTop: "3rem" }}>
//                                             <div class="bg-light border-bottom px-2">
//                                                 <div className="row">
//                                                     <div className="col-md-6 p-0 ">
//                                                         <div class="page-title-cls">Deviation</div>
//                                                     </div>

//                                                 </div>
//                                             </div>
//                                         </div>
//                                         <div class="" id="tablesections">
//                                             <div class="row">
//                                                 <div class="col-lg-12">
//                                                     <div class="card">
//                                                         {/* end card header  */}
//                                                         <div class="card-body">
//                                                             <div id="customerList">
//                                                                 <div class="row g-4 mb-3"></div>
//                                                                 <div class="table-responsive table-card mt-2 mb-3 table-padding">
//                                                                     <table
//                                                                         class="table align-middle table-nowrap"
//                                                                         id="customerTable"
//                                                                     >
//                                                                         <thead class="table-light table-header-font">
//                                                                             <tr className="head-row">
//                                                                                 <td
//                                                                                     className="tr-table-class text-white"
//                                                                                     style={{ width: "20%" }}
//                                                                                 >
//                                                                                     Name{" "}

//                                                                                 </td>
//                                                                                 <td className="tr-table-class text-white profession-type-column">
//                                                                                     {true && <>Profession Type</>}
//                                                                                 </td>
//                                                                                 <td className="tr-table-class text-white">
//                                                                                     Original Price
//                                                                                 </td>
//                                                                                 <td className="tr-table-class text-white">
//                                                                                     Default Price
//                                                                                 </td>
//                                                                                 <td className="tr-table-class text-white">
//                                                                                     Minimum Price
//                                                                                 </td>
//                                                                                 <td className="tr-table-class text-white">
//                                                                                     Status
//                                                                                 </td>
//                                                                                 <td className="tr-table-class text-white">

//                                                                                 </td>
//                                                                             </tr>
//                                                                         </thead>
//                                                                         <tbody class="list form-check-all">

//                                                                         </tbody>
//                                                                     </table>

//                                                                 </div>
//                                                             </div>
//                                                         </div>

//                                                         {/* end card  */}
//                                                     </div>
//                                                     {/* end col */}
//                                                 </div>
//                                                 {/* end col  */}
//                                             </div>

//                                             {/* end row */}
//                                         </div>
//                                         {/* container-fluid  */}
//                                     </div>
//                                     {/* End Page-content */}

//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>

//                 {/* start back-to-top */}
//                 <button
//                     onclick="topFunction()"
//                     class="btn btn-danger btn-icon"
//                     id="back-to-top"
//                 >
//                     <i class="ri-arrow-up-line"></i>
//                 </button>
//                 {/* end back-to-top */}
//             </div>
//         </>
//     );
// };



// export default Deviation
