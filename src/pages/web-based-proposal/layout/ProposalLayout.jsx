import { getProposalThemeCssVars } from "../theme/proposalTheme";

export default function ProposalLayout({
  theme,
  showSidebar = false,
  sidebar,
  children,
}) {
  return (
    <div
      className="flex h-screen flex-col overflow-hidden"
      style={{ background: theme.background, ...getProposalThemeCssVars(theme) }}
    >
      {children}
    </div>
  );
}
