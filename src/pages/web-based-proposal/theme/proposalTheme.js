import Utils from "../../../Middleware/Utils";

// Default ("dummy") color theme used until GetQuoteModel returns a brandColor.
export const DEFAULT_PROPOSAL_THEME = {
  // Layout
  background: "#F8FAFC",
  surface: "#FFFFFF",
  border: "#E2E8F0",
  fontFamily: "inherit",

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

// Mixes a hex color toward black, used to derive the dark header/footer/
// secondary shade from a single brand color.
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

// GetOrganisationThemeSettings returns a fontFamilyID, not a CSS font-family
// string — look it up in Utils.FontFamily.
const getFontFamilyFromID = (fontFamilyID) => {
  const font = Utils.FontFamily.find((item) => item.value === fontFamilyID);
  return font?.label || null;
};

// Resolves the active theme: brandColor if valid, else the default, with
// GetOrganisationThemeSettings's background/fontFamily layered on top.
export const getProposalTheme = (quoteModel, themeSettings) => {
  const brandColor = quoteModel?.brandColor;
  const baseTheme = isValidHexColor(brandColor)
    ? deriveThemeFromBrandColor(brandColor)
    : DEFAULT_PROPOSAL_THEME;

  const background = themeSettings?.webBasedQuoteBackgroundColor;
  const fontFamily = getFontFamilyFromID(themeSettings?.fontFamilyID);

  if (!isValidHexColor(background) && !fontFamily) {
    return baseTheme;
  }

  return {
    ...baseTheme,
    ...(isValidHexColor(background) && { background: background.trim().toUpperCase() }),
    ...(fontFamily && { fontFamily }),
  };
};

const THEME_KEY_TO_CSS_VAR = {
  background: "--wp-background",
  surface: "--wp-surface",
  border: "--wp-border",
  fontFamily: "--wp-font-family",
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

// Turns a theme object into CSS custom properties so plain CSS files can
// read the same colors via var(--wp-*).
export const getProposalThemeCssVars = (theme) => {
  const vars = {};
  for (const [themeKey, cssVar] of Object.entries(THEME_KEY_TO_CSS_VAR)) {
    if (theme?.[themeKey]) {
      vars[cssVar] = theme[themeKey];
    }
  }
  return vars;
};
