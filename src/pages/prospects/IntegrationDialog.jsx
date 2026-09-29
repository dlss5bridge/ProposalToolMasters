import {
    Dialog,
    IconButton,
    Typography,
    Box,
    Button,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import SyncAltIcon from "@mui/icons-material/SyncAlt";

const IntegrationDialog = ({ open, onClose, onPlatformSelect }) => {
    const handleQuickbooks = async () => {
        onPlatformSelect("QuickBooks");
        console.log("QuickBooks API Call");
    };

    const handleXero = async () => {
        onPlatformSelect("Xero");
        console.log("Xero API Call");
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <Box
                sx={{
                    position: "relative",
                    p: 4,
                    borderRadius: "16px",
                    textAlign: "center",
                }}
            >
                {/* Close Button */}
                <IconButton
                    onClick={onClose}
                    sx={{
                        position: "absolute",
                        top: 10,
                        right: 10,
                        backgroundColor: "#f5f5f5",
                        "&:hover": { backgroundColor: "#e0e0e0" },
                    }}
                >
                    <CloseIcon />
                </IconButton>

                {/* Title */}
                <Typography variant="h6" fontWeight="bold" mb={1}>
                    Connect Bookkeeping
                </Typography>

                <Typography variant="body2" color="text.secondary" mb={3}>
                    Choose your preferred platform to continue
                </Typography>

                {/* QuickBooks Card Button */}
                <Button
                    fullWidth
                    variant="outlined"
                    onClick={handleQuickbooks}
                    sx={{
                        mb: 2,
                        py: 1.5,
                        borderRadius: "12px",
                        display: "flex",
                        justifyContent: "center",
                        gap: 1,
                        textTransform: "none",
                        fontWeight: 600,
                        "&:hover": {
                            transform: "translateY(-2px)",
                            boxShadow: 2,
                        },
                    }}
                >
                    <AccountBalanceIcon fontSize="small" />
                    Connect to QuickBooks
                </Button>

                {/* Xero Card Button */}
                <Button
                    fullWidth
                    variant="outlined"
                    onClick={handleXero}
                    sx={{
                        py: 1.5,
                        borderRadius: "12px",
                        display: "flex",
                        justifyContent: "center",
                        gap: 1,
                        textTransform: "none",
                        fontWeight: 600,
                        "&:hover": {
                            transform: "translateY(-2px)",
                            boxShadow: 2,
                        },
                    }}
                >
                    <SyncAltIcon fontSize="small" />
                    Connect to Xero
                </Button>
            </Box>
        </Dialog>
    );
};

export default IntegrationDialog;