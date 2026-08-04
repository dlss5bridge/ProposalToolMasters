/* global $ */
import React, { useState, useContext, useEffect } from "react";
import { useSelector } from "react-redux";
import Select from "react-select";
import SuccessModal from "../../../components/SuccessModal";
import ConfirmModel from "../../../components/ConfirmationBox";
import { AuthContextProvider } from "../../../AuthContext/AuthContext";
import {
  GetServiceFeeInflationList,
  AddUpdateServiceFeeInflation,
  DeleteAllServiceFeeInflationConfiguration,
} from "../../../redux/Services/Config/ServicesApi";
import { USER_ROLE_TYPE } from "../../../Middleware/enums";
import "../Pricing-settings/PricingSettingStyle.css";

const FeeInflationView = () => {
  const [openSuccessModal, setOpenSuccessModal] = useState(false);
  const [dismissModal, setDismissModal] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isAddUpdateActionDone, setIsAddUpdateActionDone] = useState(false);
  const [modelRequestData, setModelRequestData] = useState({
    message: null,
    status: null,
    Action: null,
    keyID: null,
    SearchKeyword: "",
    RefId: null,
  });
  const [ServiceFeeInflationConfig, setServiceFeeInflationConfig] = useState({
    OrganisationKeyID: null,
    UserKeyID: null,
    ServiceFeeInflationList: [],
    HasExistingConfig: false,
    SelectionError: "",
    SelectedServices: [],
    InflationRule: {
      operator: null,
      value: null,
    },
  });

  const { setLoader, setTopbar, userAccessData } =
    useContext(AuthContextProvider);
  const common = useSelector((state) => state.Storage);
  const isSuperAdminView = common?.organisationKeyID == null;
  const canManageFeeInflation =
    isSuperAdminView && common?.roleTypeId === USER_ROLE_TYPE.SuperAdmin;

  useEffect(() => {
    setTopbar("block");
  }, [setTopbar]);

  useEffect(() => {
    if (common.userKeyID && canManageFeeInflation) {
      GetServiceFeeInflationConfigData();
    }
  }, [common.organisationKeyID, common.userKeyID, canManageFeeInflation]);

  const GetServiceFeeInflationConfigData = async () => {
    if (!common.userKeyID) {
      return;
    }

    try {
      const data = await GetServiceFeeInflationList({
        organisationKeyID: common.organisationKeyID,
        userKeyID: common.userKeyID,
      });

      if (data?.data?.statusCode === 200) {
        if (data?.data?.responseData?.data) {
          const ListData = data?.data?.responseData?.data;
          setServiceFeeInflationConfig((prev) => ({
            ...prev,
            OrganisationKeyID: common.organisationKeyID,
            UserKeyID: common.userKeyID,
            ServiceFeeInflationList: ListData,
            SelectedServices: [],
            HasExistingConfig: ListData.some(
              (s) => s.operator !== null && s.value !== null,
            ),
            InflationRule: {
              operator: null,
              value: null,
            },
          }));
        }
      } else {
        setErrorMessage(
          data?.data?.errorMessage || "Unable to load fee inflation data.",
        );
      }
    } catch (error) {
      console.error(error);
      setErrorMessage("Unable to load fee inflation data.");
    }
  };

  const SubmitServiceFeeInflation = async () => {
    setErrorMessage("");
    if (
      !ServiceFeeInflationConfig.SelectedServices ||
      ServiceFeeInflationConfig.SelectedServices.length === 0
    ) {
      // setErrorMessage("Please select one or more services to configure.");
      setServiceFeeInflationConfig({
        ...ServiceFeeInflationConfig,
        SelectionError: "Please select one or more services to configure.",
      });
      return;
    }

    if (!ServiceFeeInflationConfig.InflationRule.operator) {
      // setErrorMessage("Please choose an operator.");
      setServiceFeeInflationConfig({
        ...ServiceFeeInflationConfig,
        SelectionError: "Please choose an operator.",
      });
      return;
    }

    if (ServiceFeeInflationConfig.InflationRule.value === null) {
      // setErrorMessage("Please enter a value.");
      setServiceFeeInflationConfig({
        ...ServiceFeeInflationConfig,
        SelectionError: "Please enter a value.",
      });
      return;
    }

    setLoader(true);
    try {
      const serviceIDs = ServiceFeeInflationConfig.SelectedServices.map(
        (s) => s.serviceID ?? s.serviceID ?? s.ServiceID,
      ).join(",");

      const apiParams = {
        organisationKeyID: common.organisationKeyID,
        userKeyID: common.userKeyID,
        operator: ServiceFeeInflationConfig.InflationRule.operator,
        value: ServiceFeeInflationConfig.InflationRule.value,
        serviceIDs,
      };

      const response = await AddUpdateServiceFeeInflation(apiParams);
      setLoader(false);
      if (response?.data?.statusCode === 200) {
        setOpenSuccessModal(true);
        setIsAddUpdateActionDone(true);
        GetServiceFeeInflationConfigData();
      } else {
        setErrorMessage(
          response?.data?.errorMessage ||
            response?.response?.data?.errorMessage ||
            "Unable to save fee inflation rule.",
        );
      }
    } catch (error) {
      setLoader(false);
      console.error(error);
      setErrorMessage("Unable to save fee inflation rule.");
    }
  };

  const DeleteServiceFeeInflationConfig = async () => {
    if (!common.userKeyID) {
      return;
    }

    try {
      const data = await DeleteAllServiceFeeInflationConfiguration(
        common.organisationKeyID,
        common.userKeyID,
        modelRequestData.batchID,
      );

      if (data?.data?.statusCode === 200) {
        $("#ConfirmModel").one("hidden.bs.modal", () => {
          setIsAddUpdateActionDone(true);
          setOpenSuccessModal(true);
          GetServiceFeeInflationConfigData();
        });
        $("#ConfirmModel").modal("hide");
      } else {
        setErrorMessage(
          data?.data?.errorMessage ||
            data?.response?.data?.errorMessage ||
            "Unable to delete fee inflation rule.",
        );
      }
    } catch (error) {
      console.error(error);
      setLoader(false);
      setErrorMessage("Unable to delete fee inflation rule.");
    }
  };

  const handleClose = () => {
    $("#" + "confirm").modal("hide");
    setOpenSuccessModal(false);
  };

  if (!canManageFeeInflation) {
    return (
      <div className="container py-4">
        <div className="alert alert-info mb-0">
          This fee inflation screen is available only for super admin users.
        </div>
      </div>
    );
  }

  return (
    <div>
      <div class="page-title-cls ms-2">Fee Inflation</div>
      <div className="container" style={{ marginTop: "40px" }}>
        <div className="row">
          <div className="col-12 mt-3">
            <strong>
              Configure a price adjustment rule for one or more services.
              <br />
              Select the services you want to apply an inflation rule to, then
              choose an operator and value:
            </strong>
          </div>
        </div>

        <div className="row mt-3">
          <div className="col-md-2 pt-1">
            <div className="form-label" style={{ fontSize: "14px" }}>
              Select Services
            </div>
          </div>
          <div className="col-md-6">
            <Select
              isMulti
              options={ServiceFeeInflationConfig.ServiceFeeInflationList.filter(
                (s) => {
                  const isFixed = s.pricingTypeID !== 2;
                  const isAlreadyConfigured =
                    s.operator !== null && s.value !== null;
                  if (isFixed && isAlreadyConfigured) return false;
                  return true;
                },
              ).map((s) => ({
                value: s.serviceID,
                label: s.serviceName,
                isConfigured: s.operator !== null && s.value !== null,
                data: s,
              }))}
              value={ServiceFeeInflationConfig.SelectedServices.map((s) => ({
                value: s.serviceID,
                label: s.serviceName,
                isConfigured: s.operator !== null && s.value !== null,
                data: s,
              }))}
              onChange={(selected) => {
                setServiceFeeInflationConfig((prev) => ({
                  ...prev,
                  SelectedServices: selected ? selected.map((s) => s.data) : [],
                  InflationRule:
                    selected && selected.length > 0
                      ? prev.InflationRule
                      : {
                          operator: null,
                          value: null,
                        },
                  SelectionError: "",
                }));
              }}
              formatOptionLabel={(option) => (
                <div className="d-flex align-items-center justify-content-between">
                  <span>{option.label}</span>
                  {option.isConfigured && (
                    <span className="badge bg-success ms-2">Configured</span>
                  )}
                </div>
              )}
              isClearable
              placeholder="Search and select services..."
            />
            {ServiceFeeInflationConfig.SelectedServices.length == 0 &&
              ServiceFeeInflationConfig.SelectionError && (
                <label className="validation">
                  {ServiceFeeInflationConfig.SelectionError}
                </label>
              )}
          </div>
        </div>

        {ServiceFeeInflationConfig.SelectedServices.length > 0 && (
          <div className="row mt-4">
            <div className="col-12 mb-2">
              <label className="form-label">Inflation Configuration</label>
            </div>

            <div className="col-12 mb-3">
              <div className="d-flex gap-2">
                {[
                  { symbol: "+", label: "Add" },
                  { symbol: "-", label: "Subtract" },
                  { symbol: "*", label: "Markup %" },
                  { symbol: "/", label: "Discount %" },
                ].map((op) => (
                  <button
                    key={op.symbol}
                    type="button"
                    className={`btn ${ServiceFeeInflationConfig.InflationRule.operator === op.symbol ? "btn-primary" : "btn-outline-secondary"}`}
                    onClick={() =>
                      setServiceFeeInflationConfig((prev) => ({
                        ...prev,
                        InflationRule: {
                          ...prev.InflationRule,
                          operator: op.symbol,
                          value: null,
                        },
                        SelectionError: "",
                      }))
                    }
                  >
                    <div>{op.symbol}</div>
                    <small>{op.label}</small>
                  </button>
                ))}
              </div>
            </div>
            {!ServiceFeeInflationConfig.InflationRule.operator &&
              ServiceFeeInflationConfig.SelectionError && (
                <label className="validation">
                  {ServiceFeeInflationConfig.SelectionError}
                </label>
              )}

            {ServiceFeeInflationConfig.InflationRule.operator && (
              <div className="col-md-4 mb-3">
                <label className="form-label">
                  {ServiceFeeInflationConfig.InflationRule.operator === "+" ||
                  ServiceFeeInflationConfig.InflationRule.operator === "-"
                    ? "Amount"
                    : "Percentage (%)"}
                </label>
                <input
                  type="text"
                  inpitMode="decimal"
                  className="form-control"
                  min={0}
                  placeholder={
                    ServiceFeeInflationConfig.InflationRule.operator === "+" ||
                    ServiceFeeInflationConfig.InflationRule.operator === "-"
                      ? "Enter flat amount"
                      : "Enter percentage e.g. 10"
                  }
                  value={ServiceFeeInflationConfig.InflationRule.value ?? ""}
                  onChange={(e) => {
                    const value = e.target.value;

                    // Allow empty value
                    if (value === "") {
                      setServiceFeeInflationConfig({
                        ...ServiceFeeInflationConfig,
                        InflationRule: {
                          ...ServiceFeeInflationConfig.InflationRule,
                          value: null,
                        },
                        SelectionError: "",
                      });
                      return;
                    }

                    // First digit must be 1-9, following digits can be 0-9
                    if (!/^[1-9][0-9]*$/.test(value)) {
                      return;
                    }

                    const maxValue =
                      ServiceFeeInflationConfig.InflationRule.operator ===
                        "+" ||
                      ServiceFeeInflationConfig.InflationRule.operator === "-"
                        ? 9999
                        : 100;

                    if (parseInt(value, 10) > maxValue) {
                      return;
                    }

                    setServiceFeeInflationConfig({
                      ...ServiceFeeInflationConfig,
                      InflationRule: {
                        ...ServiceFeeInflationConfig.InflationRule,
                        value,
                      },
                    });
                  }}
                />
                {ServiceFeeInflationConfig.InflationRule.value > 0 && (
                  <small className="text-muted mt-1 d-block">
                    {ServiceFeeInflationConfig.InflationRule.operator === "+" &&
                      `Price + ${ServiceFeeInflationConfig.InflationRule.value}`}
                    {ServiceFeeInflationConfig.InflationRule.operator === "-" &&
                      `Price − ${ServiceFeeInflationConfig.InflationRule.value}`}
                    {ServiceFeeInflationConfig.InflationRule.operator === "*" &&
                      `Price × ${(1 + ServiceFeeInflationConfig.InflationRule.value / 100).toFixed(2)}`}
                    {ServiceFeeInflationConfig.InflationRule.operator === "/" &&
                      `Price × ${(1 - ServiceFeeInflationConfig.InflationRule.value / 100).toFixed(2)}`}
                  </small>
                )}
                {ServiceFeeInflationConfig.InflationRule.operator &&
                  ServiceFeeInflationConfig.InflationRule.value === null &&
                  ServiceFeeInflationConfig.SelectionError && (
                    <label className="validation">
                      {ServiceFeeInflationConfig.SelectionError}
                    </label>
                  )}
              </div>
            )}
          </div>
        )}

        {canManageFeeInflation && (
          <>
            <div className="col-12 text-start mt-3">
              <button
                style={{
                  fontSize: "14px",
                  marginTop: "5px",
                  marginRight: "10px",
                }}
                className="btn btn-primary create-item-btn"
                onClick={() => SubmitServiceFeeInflation()}
              >
                <span>Submit</span>
              </button>
              {/* {ServiceFeeInflationConfig.ServiceFeeInflationList.some((s) => s.operator !== null && s.value !== null) && (
            <button
              className="btn btn-outline-danger btn-sm mt-2"
              data-bs-toggle="modal"
              data-bs-target="#ConfirmModel"
              onClick={() =>
                setModelRequestData({
                  Action: "DeleteServiceFeeInflationConfig",
                  batchID: null,
                  message: "This will delete all existing fee inflation configurations. Are you sure you want to proceed?",
                })
              }
            >
              Delete All Configuration
            </button>
          )} */}
            </div>
            {/* <label className="validation">{errorMessage}</label> */}
          </>
        )}

        {(() => {
          const configured =
            ServiceFeeInflationConfig.ServiceFeeInflationList.filter(
              (s) => s.operator !== null && s.value !== null,
            );
          if (configured.length === 0) return null;

          const grouped = configured.reduce((acc, s) => {
            const key = `${s.operator}|${s.value}|${s.batchID}`;
            if (!acc[key]) {
              acc[key] = {
                operator: s.operator,
                value: s.value,
                batchID: s.batchID,
                services: [],
              };
            }
            acc[key].services.push({
              serviceID: s.serviceID,
              serviceName: s.serviceName,
            });
            return acc;
          }, {});

          const rows = Object.values(grouped);
          const operatorLabel = (op, val) => {
            if (op === "+") return `+ ${val} (flat add)`;
            if (op === "-") return `− ${val} (flat subtract)`;
            if (op === "*")
              return `× ${(1 + val / 100).toFixed(2)} (${val}% markup)`;
            if (op === "/")
              return `× ${(1 - val / 100).toFixed(2)} (${val}% discount)`;
            return `${op} ${val}`;
          };

          return (
            <div className="row mt-4">
              <div className="col-12">
                <div className="form-label" style={{ fontSize: "14px" }}>
                  Configured Inflation Rules
                </div>
                <table className="table table-bordered table-sm">
                  <thead className="table-light">
                    <tr>
                      <th style={{ width: "35%", color: "white" }}>
                        Inflation Rule
                      </th>
                      <th style={{ color: "white" }}>Services</th>
                      {canManageFeeInflation && (
                        <th
                          style={{ width: "80px", color: "white" }}
                          className="text-center"
                        >
                          Action
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr key={`${row.operator}|${row.value}|${row.batchID}`}>
                        <td
                          className="align-middle"
                          style={{ fontSize: "14px" }}
                        >
                          <code className="fw-bold">
                            {operatorLabel(row.operator, row.value)}
                          </code>
                        </td>
                        <td
                          className="align-middle text-white"
                          style={{ fontSize: "14px" }}
                        >
                          <div className="d-flex flex-wrap gap-1">
                            {row.services.map((svc) => (
                              <span
                                key={svc.serviceID}
                                className="badge bg-secondary text-white"
                              >
                                {svc.serviceName}
                              </span>
                            ))}
                          </div>
                        </td>
                        {canManageFeeInflation && (
                          <td className="text-center align-middle">
                            <button
                              className="btn btn-danger text-white btn-outline-danger btn-sm"
                              data-bs-toggle="modal"
                              data-bs-target="#ConfirmModel"
                              onClick={() =>
                                setModelRequestData({
                                  Action: "DeleteServiceFeeInflationRule",
                                  batchID: row.batchID,
                                  serviceIDs: row.services.map(
                                    (s) => s.serviceID,
                                  ),
                                  message:
                                    "This will delete the inflation rule. Are you sure?",
                                })
                              }
                            >
                              Delete
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })()}

        <ConfirmModel
          openSuccessModal={openSuccessModal}
          modelRequestData={modelRequestData}
          setModelRequestData={setModelRequestData}
          UpdatedStatus={
            modelRequestData.Action === "DeleteServiceFeeInflationRule"
              ? DeleteServiceFeeInflationConfig
              : null
          }
        />
        <SuccessModal
          handleClose={handleClose}
          setDismissModal={setDismissModal}
          setOpenSuccessModal={setOpenSuccessModal}
          openSuccessModal={openSuccessModal}
          modelAction={"Update"}
          message={"Fee inflation"}
        />
      </div>
    </div>
  );
};

export default FeeInflationView;
