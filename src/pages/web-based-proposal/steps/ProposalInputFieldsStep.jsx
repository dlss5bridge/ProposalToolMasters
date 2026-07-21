import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  Typography,
} from "@mui/material";

export default function ProposalInputFieldsStep({ theme }) {
  // Dummy API response
  const fields = [
    { id: 1, label: "Client Name" },
    { id: 2, label: "Contact Person" },
    { id: 3, label: "Email" },
    // { id: 4, label: "Phone" },
    // { id: 5, label: "Company" },
    // { id: 6, label: "GST Number" },
    // { id: 7, label: "Address" },
    // { id: 8, label: "City" },
  ];

  const isTwoColumn = fields.length > 4;

  return (
    <Box className="h-full overflow-auto bg-white p-2 lg:p-4">
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

          border: `1px solid ${theme.border}`,
          boxShadow: "0 12px 30px rgba(15,23,42,.06)",
        }}
      >
        <CardContent className="!p-8">
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
            {fields.map((field) => (
              <Grid key={field.id} item xs={12} md={isTwoColumn ? 6 : 12}>
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
                    {field.label}
                  </Typography>

                  <TextField
                    fullWidth
                    size="small"
                    placeholder={`Enter ${field.label}`}
                    sx={{
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
                    }}
                  />
                </div>
              </Grid>
            ))}
          </Grid>

          {/* Buttons */}
          <div
            className={`mt-4 border-t pt-2 ${
              isTwoColumn
                ? "flex justify-end gap-3"
                : "flex max-w-[420px] justify-end gap-3"
            }`}
            style={{
              borderColor: theme.border,
            }}
          >
            <Button
              variant="outlined"
              className="!rounded-lg !px-5 !normal-case"
              sx={{
                minWidth: 110,
              }}
            >
              Cancel
            </Button>

            <Button
              variant="contained"
              className="!rounded-lg !px-6 !normal-case"
              sx={{
                minWidth: 120,
                backgroundColor: theme.primary,

                "&:hover": {
                  backgroundColor: theme.primary,
                  opacity: 0.9,
                },
              }}
            >
              Submit
            </Button>
          </div>
        </CardContent>
      </Card>
    </Box>
  );
}
