import React from "react";
import Select from "react-select";
import DatePicker from "react-datepicker";
import { parse, isValid, format } from "date-fns";
import { Tooltip } from "@mui/material";

const formatNumber = (num, dp = 2) =>
  num === null || num === undefined || num === ""
    ? ""
    : Number(num).toFixed(dp).replace(/\B(?=(\d{3})+(?!\.))/g, ",");

const formatDecimalInput = (val, dp = 2) => {
  const cleaned = String(val).replace(/[^0-9.]/g, "");
  const [i, d] = cleaned.split(".");
  return d !== undefined ? `${i.slice(0, 12)}.${d.slice(0, dp)}` : i.slice(0, 12);
};

const parseStoredDate = (dateStr, formatStr) => {
  if (!dateStr) return null;
  try {
    const p = parse(dateStr, formatStr, new Date());
    return isValid(p) ? p : null;
  } catch {
    return null;
  }
};

// Prospect variables nest their date ranges under date[0].blocks,
// unlike service pricing drivers which are flat. See ClientInformationDAL.
const getBlocks = (variable) => variable?.date?.[0]?.blocks || [];
const getDateFormat = (variable) => variable?.date?.[0]?.dateFormat || "dd-MM-yyyy";

const getMinDate = (variable) => {
  const blocks = getBlocks(variable);
  const withFrom = blocks.filter((b) => b.fromDate);
  if (!withFrom.length) return null;
  const f = getDateFormat(variable);
  const dates = withFrom.map((b) => parseStoredDate(b.fromDate, f)).filter(Boolean);
  return dates.length ? new Date(Math.min(...dates)) : null;
};

const getMaxDate = (variable) => {
  const blocks = getBlocks(variable);
  const withTo = blocks.filter((b) => b.toDate);
  if (!withTo.length) return null;
  const f = getDateFormat(variable);
  const dates = withTo.map((b) => parseStoredDate(b.toDate, f)).filter(Boolean);
  return dates.length ? new Date(Math.max(...dates)) : null;
};

const LABEL_CLS = (m) =>
  m === "Package" || m === "Quote"
    ? "col-md-5 col-sm-12 text-start text-md-start"
    : "col-md-3 col-sm-12 text-start text-md-end";

const FIELD_CLS = (m) =>
  m === "Package" || m === "Quote"
    ? "col-lg-7 col-md-9 col-sm-12"
    : "col-lg-9 col-md-9 col-sm-12";

const ProspectVariables = ({
  prospectVariables = [],
  setProspectVariables,
  invalidFieldIds = [],
  moduleName,
  prospectName = "Prospect",
  isMobile = false,
  onChange,
}) => {
  if (!prospectVariables.length) return null;

  const patch = (id, changes) => {
    onChange?.();
    setProspectVariables((prev) =>
      prev.map((v) => (v.globalVariableID === id ? { ...v, ...changes } : v)),
    );
  };

  const renderLabel = (name) => {
    if (isMobile) return name.substring(0, 30).replace(/\b\w/g, (l) => l.toUpperCase());
    if (name.length > 20) {
      return (
        <Tooltip title={name}>
          {name.substring(0, 25).replace(/\b\w/g, (l) => l.toUpperCase()) + "..."}
        </Tooltip>
      );
    }
    return name.replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <div id="ProspectVariablesBlock">
      <h3 className="modal-title">{prospectName} Variables</h3>
      <div className="d-flex align-items-start gap-2 mt-2 mb-3 px-3 py-2 rounded-2 bg-light">
        <i className="bi bi-info-circle text-primary mt-1"></i>
        <span className="text-muted small align-self-center">
        These values are specific to this prospect and will be automatically used in its proposals and engagement letters.
        You can also set up these values in the <a href="/prospects" className="text-decoration-none">Prospects</a> page inside Actions.
        </span>
      </div>
      <div className="separator"></div>

      {prospectVariables.map((variable) => {
        const id = variable.globalVariableID;
        const invalid = invalidFieldIds.includes(id);
        const dateFormat = getDateFormat(variable);

        return (
          <div
            className="row fieldset add-new-package mt-3"
            key={variable.globalVariableKeyID || id}
          >
            <div className={LABEL_CLS(moduleName)}>
              <label className="form-label">
                {renderLabel(variable.globalVariableName || "")}
                <span className="text-danger">*</span>
              </label>
            </div>

            <div id={`PV-${id}`} className={FIELD_CLS(moduleName)}>
              <div className="mb-1">
                <div className="input-group">

                  {variable.dataType == 2 && (
                    <input
                      type="number"
                      className="input-text"
                      placeholder={variable.globalVariableName}
                      value={variable.value ?? ""}
                      onChange={(e) => patch(id, { value: e.target.value })}
                    />
                  )}

                  {variable.dataType == 3 && (
                    <Select
                      className="w-100"
                      options={variable.variation?.map((it) => ({
                        value: it.variationName,
                        label: it.variationName,
                      }))}
                      value={
                        variable.value
                          ? { value: variable.value, label: variable.value }
                          : null
                      }
                      onChange={(s) => patch(id, { value: s?.value })}
                    />
                  )}

                  {variable.dataType == 4 && (
                    <Select
                      className="w-100"
                      options={variable.slab?.map((it) => {
                        const label =
                          it.slabTypeID === 2
                            ? "Other"
                            : `${formatNumber(it.slabFrom, it.decimalPlaces ?? 2)} - ${formatNumber(it.slabTo, it.decimalPlaces ?? 2)}`;
                        return { value: label, label, slabKeyID: it.slabKeyID };
                      })}
                      value={
                        variable.value
                          ? { value: variable.value, label: variable.value }
                          : null
                      }
                      onChange={(s) =>
                        patch(id, {
                          value: s?.value,
                          isOther: s?.value === "Other",
                          otherValue: s?.value === "Other" ? variable.otherValue || "" : "",
                        })
                      }
                    />
                  )}

                  {variable.dataType == 5 && (
                    <input
                      className="input-text"
                      type="text"
                      value={variable.value || ""}
                      maxLength={variable.text?.[0]?.textLength || 100}
                      placeholder="Enter Text"
                      onChange={(e) => {
                        const allowed = (
                          variable.text?.[0]?.allowedSpecialCharacters || ""
                        ).replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
                        patch(id, {
                          value: e.target.value.replace(
                            new RegExp(`[^a-zA-Z0-9 ${allowed}]`, "g"),
                            "",
                          ),
                        });
                      }}
                    />
                  )}

                  {variable.dataType == 6 && (
                    <DatePicker
                      className="input-text"
                      selected={
                        variable.value ? parseStoredDate(variable.value, dateFormat) : null
                      }
                      dateFormat={dateFormat}
                      minDate={getMinDate(variable)}
                      maxDate={getMaxDate(variable)}
                      placeholderText="Select any date"
                      onChange={(d) =>
                        patch(id, { value: d ? format(d, dateFormat) : null })
                      }
                    />
                  )}
                </div>

                {variable.dataType == 4 && variable.isOther && (
                  <input
                    type="text"
                    className="input-text mt-2"
                    placeholder="Enter Value"
                    value={variable.otherValue || ""}
                    onChange={(e) =>
                      patch(id, {
                        otherValue: formatDecimalInput(
                          e.target.value,
                          variable.slab?.find((s) => s.slabTypeID === 2)?.decimalPlaces ?? 2,
                        ),
                      })
                    }
                  />
                )}

                {invalid && (
                  <label className="validation">
                    {variable.dataType == 2 &&
                    variable.value !== "" &&
                    variable.value !== null &&
                    variable.quantity?.length
                      ? `Value must be between ${variable.quantity
                          .map((q) => `${q.quantityFrom} - ${q.quantityTo}`)
                          .join(", ")}`
                      : "This field is required"}
                  </label>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ProspectVariables;