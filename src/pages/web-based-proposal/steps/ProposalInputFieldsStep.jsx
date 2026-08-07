import { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import Select from "react-select";
import { Box, Card, CardContent, Grid, TextField, Typography } from "@mui/material";

import { selectQuoteModel } from "../../../redux/reducer/webProposal";
import {
  selectInputFieldsList,
  selectInputFieldsValidationVisible,
  setInputFieldsList,
  getVisibleInputFieldsItems,
  getInputFieldsFieldErrors,
} from "../../../redux/reducer/webProposal/inputFields";

// driverTypeID: 2 = quantity (number), 3 = variation (select), 4 = slab (select),
// 5 = free text, 6 = date. Same convention used across the web-proposal steps
// (see ProposalAdditionalInformationStep / PricingDriverField).
const updateItem = (list, globalPricingDriverID, patch) =>
  list.map((item) =>
    item.globalPricingDriverID === globalPricingDriverID
      ? { ...item, ...patch }
      : item,
  );

const getTextFieldSx = (theme) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: "10px",
    backgroundColor: "#fff",

    "& fieldset": {
      borderColor: theme.border,
    },

    "&:hover fieldset": {
      borderColor: theme.primary,
    },

    "&.Mui-focused fieldset": {
      borderColor: theme.primary,
      borderWidth: 2,
    },
  },
});

const getSelectStyles = (theme, hasError) => ({
  control: (base) => ({
    ...base,
    minHeight: 40,
    borderRadius: "10px",
    borderColor: hasError ? "#dc2626" : theme.border,
    "&:hover": {
      borderColor: hasError ? "#dc2626" : theme.primary,
    },
  }),
  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
});

export default function ProposalInputFieldsStep({ theme }) {
  const dispatch = useDispatch();

  const quoteModel = useSelector(selectQuoteModel);
  const inputFieldsList = useSelector(selectInputFieldsList);
  const validationVisible = useSelector(selectInputFieldsValidationVisible);

  const allowedDriverIDs = quoteModel?.globalPricingDriverID;

  const fields = useMemo(
    () => getVisibleInputFieldsItems(inputFieldsList, allowedDriverIDs),
    [inputFieldsList, allowedDriverIDs],
  );

  const fieldErrors = useMemo(
    () => getInputFieldsFieldErrors(inputFieldsList, allowedDriverIDs),
    [inputFieldsList, allowedDriverIDs],
  );

  const isTwoColumn = fields.length > 4;

  const handleChange = (globalPricingDriverID, patch) => {
    dispatch(
      setInputFieldsList(
        updateItem(inputFieldsList, globalPricingDriverID, patch),
      ),
    );
  };

  const renderField = (field, errorMessage) => {
    const hasError = Boolean(errorMessage);

    if (field.driverTypeID === 2) {
      const quantity = field.quantity?.[0];

      return (
        <TextField
          fullWidth
          size="small"
          type="number"
          value={field.driverValue ?? ""}
          error={hasError}
          inputProps={{
            min: quantity?.quantityFrom ?? undefined,
            max: quantity?.quantityTo ?? undefined,
          }}
          onChange={(e) =>
            handleChange(field.globalPricingDriverID, {
              driverValue: e.target.value,
            })
          }
          placeholder={`Enter ${field.driverName}`}
          sx={getTextFieldSx(theme)}
        />
      );
    }

    if (field.driverTypeID === 3 || field.driverTypeID === 4) {
      const isSlab = field.driverTypeID === 4;
      const source = isSlab ? field.slab : field.variation;
      const options = (source || []).map((option) => ({
        value: isSlab ? option.slabID : option.variationID,
        label: isSlab
          ? option.slabTypeName || `${option.slabFrom} - ${option.slabTo}`
          : option.variationName,
      }));
      const selected =
        options.find((option) => option.value === field.driverValue) || null;

      return (
        <Select
          options={options}
          value={selected}
          onChange={(option) =>
            handleChange(field.globalPricingDriverID, {
              driverValue: option?.value ?? null,
            })
          }
          menuPortalTarget={document.body}
          placeholder={`Select ${field.driverName}`}
          styles={getSelectStyles(theme, hasError)}
        />
      );
    }

    if (field.driverTypeID === 5) {
      const textBlock = field.text?.[0] ?? {};

      return (
        <TextField
          fullWidth
          size="small"
          value={field.enteredText ?? ""}
          error={hasError}
          inputProps={{ maxLength: textBlock.textLength || 100 }}
          onChange={(e) =>
            handleChange(field.globalPricingDriverID, {
              enteredText: e.target.value,
            })
          }
          placeholder={`Enter ${field.driverName}`}
          sx={getTextFieldSx(theme)}
        />
      );
    }

    if (field.driverTypeID === 6) {
      return (
        <TextField
          fullWidth
          size="small"
          type="date"
          value={field.enteredDate ?? ""}
          error={hasError}
          onChange={(e) =>
            handleChange(field.globalPricingDriverID, {
              enteredDate: e.target.value,
            })
          }
          sx={getTextFieldSx(theme)}
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
      <Card
        elevation={0}
        className="rounded-2xl"
        sx={{
          width: isTwoColumn
            ? {
                xs: "100%",
                sm: "100%",
                md: "78%",
                lg: "58%",
                xl: "50%",
              }
            : {
                xs: "100%",
                sm: "100%",
                md: 520,
              },
          maxHeight: "100%",
          display: "flex",
          flexDirection: "column",
          border: `1px solid ${theme.border}`,
          boxShadow: "0 12px 30px rgba(15,23,42,.06)",
        }}
      >
        <CardContent
          className="!p-4 sm:!p-8"
          sx={{ overflowY: "auto" }}
        >
          {/* Heading */}
          <div className="mb-8">
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                color: theme.textPrimary,
              }}
            >
              Proposal Input Fields
            </Typography>

            <Typography
              sx={{
                mt: 0.5,
                fontSize: 14,
                color: theme.textSecondary,
              }}
            >
              Please provide the required information below.
            </Typography>
          </div>

          {/* Fields */}
          <Grid container spacing={3}>
            {fields.map((field) => {
              const errorMessage = validationVisible
                ? fieldErrors[field.globalPricingDriverID]
                : null;

              return (
                <Grid
                  key={field.globalPricingDriverID}
                  item
                  xs={12}
                  md={isTwoColumn ? 6 : 12}
                >
                  <div
                    className="flex flex-col gap-2"
                    style={{
                      maxWidth: isTwoColumn ? "100%" : 420,
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: theme.textPrimary,
                      }}
                    >
                      {field.driverName}
                      <Box component="span" sx={{ color: "#dc2626", ml: 0.25 }}>
                        *
                      </Box>
                    </Typography>

                    {renderField(field, errorMessage)}

                    {errorMessage && (
                      <Typography sx={{ fontSize: 12, color: "#dc2626" }}>
                        {errorMessage}
                      </Typography>
                    )}
                  </div>
                </Grid>
              );
            })}
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}
