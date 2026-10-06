import React from "react";
import "../styles/fancy-select.css";

// Drop-in replacement for a react-select dropdown that only ever has two
// options. Same props as the <Select> it replaces (options, value, onChange,
// isDisabled), and onChange receives the same option object react-select
// would pass, so existing handlers keep working unchanged.
//   - Yes/No options render as a switch.
//   - Any other pair renders as a two-button segmented control.

const isYesNo = (options) =>
  options?.length === 2 &&
  ["yes", "no"].every((label) =>
    options.some((o) => String(o?.label).trim().toLowerCase() === label)
  );

const findByLabel = (options, label) =>
  options.find((o) => String(o?.label).trim().toLowerCase() === label);

function BinarySelect({
  options = [],
  value,
  onChange,
  isDisabled = false,
  ariaLabel,
  className = "",
}) {
  const hasValue = value !== null && value !== undefined && typeof value === "object";
  const selectedValue = hasValue ? value.value : undefined;

  if (isYesNo(options)) {
    const yes = findByLabel(options, "yes");
    const no = findByLabel(options, "no");
    const on = hasValue && selectedValue === yes.value;
    const text = hasValue ? (on ? yes.label : no.label) : "Not set";

    return (
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-label={ariaLabel}
        className={`fx-toggle${on ? " is-on" : ""}${hasValue ? "" : " is-unset"} ${className}`.trim()}
        disabled={isDisabled}
        onClick={() => onChange && onChange(on ? no : yes)}
      >
        <span className="fx-toggle__track">
          <span className="fx-toggle__thumb"></span>
        </span>
        <span className="fx-toggle__text">{text}</span>
      </button>
    );
  }

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={`fx-segmented${isDisabled ? " is-disabled" : ""} ${className}`.trim()}
    >
      {options.map((option) => {
        const active = hasValue && selectedValue === option.value;
        return (
          <button
            type="button"
            role="radio"
            aria-checked={active}
            key={String(option.value)}
            className={`fx-segmented__option${active ? " is-active" : ""}`}
            disabled={isDisabled}
            onClick={() => {
              if (!active && onChange) onChange(option);
            }}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export default BinarySelect;
