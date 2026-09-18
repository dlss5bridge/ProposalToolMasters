import { useMemo } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";

import { getProposalThemeCssVars } from "../theme/proposalTheme";

export default function ProposalLayout({
  theme,
  showSidebar = false,
  sidebar,
  children,
}) {
  // MUI components set their own font-family instead of inheriting it, so we
  // thread it through a ThemeProvider to keep them in sync with the rest.
  const muiTheme = useMemo(
    () => createTheme({ typography: { fontFamily: theme.fontFamily } }),
    [theme.fontFamily],
  );

  return (
    <ThemeProvider theme={muiTheme}>
      <div
        className="wp-proposal-root flex h-screen flex-col overflow-hidden"
        style={{
          // 100dvh avoids the clipping/gap h-screen (100vh) gets on mobile
          // Safari when the address bar shows/hides.
          height: "100dvh",
          background: theme.background,
          fontFamily: theme.fontFamily,
          ...getProposalThemeCssVars(theme),
        }}
      >
        {children}
      </div>
    </ThemeProvider>
  );
}
