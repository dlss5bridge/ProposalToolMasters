// Default ("dummy") color theme used until GetQuoteModel returns a brandColor.
export const DEFAULT_PROPOSAL_THEME = {
  // Layout
  background: "#F8FAFC",
  surface: "#FFFFFF",
  border: "#E2E8F0",

  // Brand
  primary: "#00BFFF",
  secondary: "#00192D",

  // Header/Footer
  headerBackground: "#00192D",
  headerText: "#FFFFFF",

  footerBackground: "#00192D",
  footerText: "#FFFFFF",

  // Sidebar
  sidebarBackground: "#FFFFFF",
  sidebarBorder: "#E2E8F0",

  // Text
  textPrimary: "#1E293B",
  textSecondary: "#64748B",

  // Buttons
  primaryButtonBackground: "#00BFFF",
  primaryButtonText: "#FFFFFF",

  secondaryButtonBackground: "#FFFFFF",
  secondaryButtonBorder: "#CBD5E1",
  secondaryButtonText: "#00192D",

  // PDF
  pdfBackground: "#EEF2F7",

  // Stepper
  completedStepBackground: "#10B981",
};

const HEX_COLOR_RE = /^#([0-9a-fA-F]{6})$/;

const isValidHexColor = (value) =>
  typeof value === "string" && HEX_COLOR_RE.test(value.trim());

const hexToRgb = (hex) => {
  const num = parseInt(hex.trim().replace("#", ""), 16);
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
};

const rgbToHex = ({ r, g, b }) => {
  const toHex = (channel) => channel.toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
};

// Mixes a hex color toward black, used to derive a dark header/footer/secondary
// shade from a single brand color (mirrors the primary/secondary relationship
// in DEFAULT_PROPOSAL_THEME, e.g. #00BFFF -> #00192D).
const darken = (hex, weight) => {
  const { r, g, b } = hexToRgb(hex);
  const clampedWeight = Math.min(Math.max(weight, 0), 1);
  return rgbToHex({
    r: Math.round(r * (1 - clampedWeight)),
    g: Math.round(g * (1 - clampedWeight)),
    b: Math.round(b * (1 - clampedWeight)),
  });
};

const deriveThemeFromBrandColor = (brandColor) => {
  const primary = brandColor.trim().toUpperCase();
  const deepShade = darken(primary, 0.85);

  return {
    ...DEFAULT_PROPOSAL_THEME,
    primary,
    secondary: deepShade,
    headerBackground: deepShade,
    footerBackground: deepShade,
    primaryButtonBackground: primary,
    secondaryButtonText: deepShade,
  };
};

// Resolves the active theme for a proposal: uses quoteModel.brandColor (from
// GetQuoteModel) when present and valid, otherwise falls back to the default
// theme above.
export const getProposalTheme = (quoteModel) => {
  const brandColor = quoteModel?.brandColor;
  if (isValidHexColor(brandColor)) {
    return deriveThemeFromBrandColor(brandColor);
  }
  return DEFAULT_PROPOSAL_THEME;
};

const THEME_KEY_TO_CSS_VAR = {
  background: "--wp-background",
  surface: "--wp-surface",
  border: "--wp-border",
  primary: "--wp-primary",
  secondary: "--wp-secondary",
  headerBackground: "--wp-header-bg",
  headerText: "--wp-header-text",
  footerBackground: "--wp-footer-bg",
  footerText: "--wp-footer-text",
  sidebarBackground: "--wp-sidebar-bg",
  sidebarBorder: "--wp-sidebar-border",
  textPrimary: "--wp-text-primary",
  textSecondary: "--wp-text-secondary",
  primaryButtonBackground: "--wp-primary-btn-bg",
  primaryButtonText: "--wp-primary-btn-text",
  secondaryButtonBackground: "--wp-secondary-btn-bg",
  secondaryButtonBorder: "--wp-secondary-btn-border",
  secondaryButtonText: "--wp-secondary-btn-text",
  pdfBackground: "--wp-pdf-bg",
  completedStepBackground: "--wp-completed-step-bg",
};

// Turns a theme object into CSS custom properties so plain CSS files (e.g.
// ProposalServicesStep.css) can read the same colors via var(--wp-*).
export const getProposalThemeCssVars = (theme) => {
  const vars = {};
  for (const [themeKey, cssVar] of Object.entries(THEME_KEY_TO_CSS_VAR)) {
    if (theme?.[themeKey]) {
      vars[cssVar] = theme[themeKey];
    }
  }
  return vars;
};
