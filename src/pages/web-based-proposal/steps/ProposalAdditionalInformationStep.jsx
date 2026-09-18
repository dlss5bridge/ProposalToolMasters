import { Box, Card, CardContent, Typography } from "@mui/material";
import Select from "react-select";
import { useDispatch, useSelector } from "react-redux";
import { useMemo } from "react";

import {
  selectAdditionalInformationList,
  selectAdditionalInformationValidationVisible,
  setAdditionalInformationList,
  getAdditionalInformationFieldErrors,
  getVisibleAdditionalInformationItems,
} from "../../../redux/reducer/webProposal/additionalInformation";

// driverTypeID: 2 = quantity (number), 3 = variation (select), 4 = slab (select),
// 5 = free text, 6 = date
const updateItem = (list, globalPricingDriverID, patch) =>
  list.map((item) =>
    item.globalPricingDriverID === globalPricingDriverID
      ? { ...item, ...patch }
      : item,
  );

// Same single-column field width used across the other web-proposal steps.
const FIELD_MAX_WIDTH = 420;

export default function ProposalAdditionalInformationStep({
  theme,
  readOnly = false,
  // Custom Package only: locks fields for the admin's default services
  // while leaving the rest of the step editable.
  lockedServiceIDs,
}) {
  const dispatch = useDispatch();
  const additionalInformationList = useSelector(
    selectAdditionalInformationList,
  );
  const validationVisible = useSelector(
    selectAdditionalInformationValidationVisible,
  );

  const visibleItems = getVisibleAdditionalInformationItems(
    additionalInformationList,
  );
  const hasLockedFields = visibleItems.some((item) =>
    lockedServiceIDs?.has(item.serviceID),
  );

  const fieldErrors = useMemo(
    () => getAdditionalInformationFieldErrors(additionalInformationList),
    [additionalInformationList],
  );

  const handleChange = (globalPricingDriverID, patch, isFieldReadOnly) => {
    if (isFieldReadOnly) return;
    dispatch(
      setAdditionalInformationList(
        updateItem(additionalInformationList, globalPricingDriverID, patch),
      ),
    );
  };

  const renderField = (item, errorMessage, isFieldReadOnly) => {
    const hasError = Boolean(errorMessage);
    const inputClassName = `w-full rounded-lg border px-3 py-2 text-sm${
      hasError ? " border-red-500" : ""
    }${isFieldReadOnly ? " cursor-not-allowed opacity-60" : ""}`;
    const inputStyle = { borderColor: hasError ? "#dc2626" : theme.border };

    if (item.driverTypeID === 2) {
      const quantity = item.quantity?.[0];

      return (
        <input
          type="number"
          value={item.driverValue ?? ""}
          min={quantity?.quantityFrom ?? undefined}
          max={quantity?.quantityTo ?? undefined}
          disabled={isFieldReadOnly}
          onChange={(e) =>
            handleChange(
              item.globalPricingDriverID,
              { driverValue: e.target.value },
              isFieldReadOnly,
            )
          }
          placeholder={`Enter ${item.driverName}`}
          className={inputClassName}
          style={inputStyle}
        />
      );
    }

    if (item.driverTypeID === 3 || item.driverTypeID === 4) {
      const isSlab = item.driverTypeID === 4;
      const source = isSlab ? item.slab : item.variation;
      // slabTypeID 2 is the "Other" entry — no from/to range, the client
      // just types an exact number.
      const options = (source || []).map((option) => ({
        value: isSlab ? option.slabID : option.variationID,
        label: isSlab
          ? option.slabTypeID === 2
            ? "Other"
            : `${option.slabFrom} - ${option.slabTo}`
          : option.variationName,
      }));
      const selected =
        options.find((option) => option.value === item.driverValue) || null;
      const selectedSlab = isSlab
        ? item.slab?.find((option) => option.slabID === item.driverValue)
        : null;
      const isOtherSlabSelected = selectedSlab?.slabTypeID === 2;

      return (
        <>
          <Select
            options={options}
            value={selected}
            isDisabled={isFieldReadOnly}
            onChange={(option) => {
              const newlySelectedSlab = isSlab
                ? item.slab?.find((slab) => slab.slabID === option?.value)
                : null;
              // Picking "Other" should start blank rather than showing
              // whatever slabValue the backend sent for that row.
              const patch =
                newlySelectedSlab?.slabTypeID === 2
                  ? {
                      driverValue: option.value,
                      slab: item.slab.map((slab) =>
                        slab.slabID === option.value
                          ? { ...slab, slabValue: "" }
                          : slab,
                      ),
                    }
                  : { driverValue: option?.value ?? null };
              handleChange(item.globalPricingDriverID, patch, isFieldReadOnly);
            }}
            menuPortalTarget={document.body}
            placeholder={`Select ${item.driverName}`}
            styles={{
              control: (base) => ({
                ...base,
                borderRadius: "0.5rem",
                borderColor: hasError ? "#dc2626" : base.borderColor,
              }),
            }}
          />
          {isOtherSlabSelected && (
            <input
              type="number"
              min={0}
              value={selectedSlab?.slabValue ?? ""}
              disabled={isFieldReadOnly}
              onChange={(e) => {
                // The typed number is stored as the Other slab's own
                // slabValue, not a separate field.
                const nextValue = e.target.value;
                handleChange(
                  item.globalPricingDriverID,
                  {
                    slab: (item.slab || []).map((option) =>
                      option.slabID === item.driverValue
                        ? { ...option, slabValue: nextValue }
                        : option,
                    ),
                  },
                  isFieldReadOnly,
                );
              }}
              placeholder={item.driverName}
              className={inputClassName}
              style={{ ...inputStyle, marginTop: 8 }}
            />
          )}
        </>
      );
    }

    if (item.driverTypeID === 5) {
      const textBlock = item.text?.[0] ?? {};

      return (
        <input
          type="text"
          value={item.enteredText ?? ""}
          maxLength={textBlock.textLength || 100}
          disabled={isFieldReadOnly}
          onChange={(e) =>
            handleChange(
              item.globalPricingDriverID,
              { enteredText: e.target.value },
              isFieldReadOnly,
            )
          }
          placeholder={`Enter ${item.driverName}`}
          className={inputClassName}
          style={inputStyle}
        />
      );
    }

    if (item.driverTypeID === 6) {
      return (
        <input
          type="date"
          value={item.enteredDate ?? ""}
          disabled={isFieldReadOnly}
          onChange={(e) =>
            handleChange(
              item.globalPricingDriverID,
              { enteredDate: e.target.value },
              isFieldReadOnly,
            )
          }
          className={inputClassName}
          style={inputStyle}
        />
      );
    }

    return null;
  };

  return (
    <Box
      className="h-full overflow-hidden p-2 lg:p-4"
      sx={{
        display: "flex",
        justifyContent: "center",
      }}
      style={{ backgroundColor: theme.background }}
    >
      {/* height: 100% (align-items defaults to stretch, so this fills the
          Box's full height) instead of a content-sized card floating in a
          sea of empty themed background - the field list scrolls inside
          CardContent if it's taller than the available space. */}
      <Card
        elevation={0}
        className="rounded-2xl"
        sx={{
          width: { xs: "100%", sm: "100%", md: "78%", lg: "58%", xl: "50%" },
          height: "100%",
          display: "flex",
          flexDirection: "column",
          border: `1px solid ${theme.border}`,
          boxShadow: "0 12px 30px rgba(15,23,42,.06)",
        }}
      >
        <CardContent
          className="!p-4 sm:!p-8"
          sx={{ flex: 1, overflowY: "auto" }}
        >
          <div className="mb-8">
            <Typography
              variant="h5"
              sx={{ fontWeight: 700, color: theme.textPrimary }}
            >
              Additional Information
            </Typography>
            <Typography
              sx={{ mt: 0.5, fontSize: 14, color: theme.textSecondary }}
            >
              {readOnly
                ? "These values were set when your proposal was prepared and can't be changed."
                : hasLockedFields
                  ? "Fields already set when your proposal was prepared are locked; provide the remaining details below for the services you added."
                  : "Provide the additional details required for the selected services."}
            </Typography>
          </div>

          <div className="flex flex-col gap-4">
            {visibleItems.map((item) => {
              const errorMessage = validationVisible
                ? fieldErrors[item.globalPricingDriverID]
                : null;
              const isFieldReadOnly =
                readOnly || Boolean(lockedServiceIDs?.has(item.serviceID));

              return (
                <div
                  key={item.globalPricingDriverID}
                  className="flex flex-col gap-2"
                  style={{ maxWidth: FIELD_MAX_WIDTH }}
                >
                  <Typography
                    sx={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: theme.textPrimary,
                    }}
                  >
                    {item.driverName}
                    {!isFieldReadOnly && (
                      <Box component="span" sx={{ color: "#dc2626", ml: 0.25 }}>
                        *
                      </Box>
                    )}
                  </Typography>

                  {renderField(item, errorMessage, isFieldReadOnly)}

                  {errorMessage && (
                    <Typography sx={{ fontSize: 12, color: "#dc2626" }}>
                      {errorMessage}
                    </Typography>
                  )}
                </div>
              );
            })}

            {visibleItems.length === 0 && (
              <Typography sx={{ fontSize: 14, color: theme.textSecondary }}>
                No additional information required.
              </Typography>
            )}
          </div>
        </CardContent>
      </Card>
    </Box>
  );
}
