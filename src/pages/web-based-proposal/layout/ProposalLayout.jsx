import { useMemo } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";

import { getProposalThemeCssVars } from "../theme/proposalTheme";

export default function ProposalLayout({
  theme,
  showSidebar = false,
  sidebar,
  children,
}) {
  // MUI components (Typography, Modal, Button, ...) set their own font-family
  // rather than inheriting it, so plain CSS inheritance from the div below
  // doesn't reach them. Threading the same fontFamily through a ThemeProvider
  // makes every MUI component under this layout pick it up too.
  const muiTheme = useMemo(
    () => createTheme({ typography: { fontFamily: theme.fontFamily } }),
    [theme.fontFamily],
  );

  return (
    <ThemeProvider theme={muiTheme}>
      <div
        className="wp-proposal-root flex h-screen flex-col overflow-hidden"
        style={{
          // Mobile browsers (esp. iOS Safari) resize the viewport as chrome
          // (address bar) shows/hides, so h-screen (100vh) can clip content
          // or leave a gap. 100dvh tracks the *actual* visible viewport;
          // browsers that don't support it ignore this and keep h-screen.
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
