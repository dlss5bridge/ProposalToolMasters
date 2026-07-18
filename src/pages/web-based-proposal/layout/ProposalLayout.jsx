import ProposalHeader from "./ProposalHeader";
import ProposalSidebar from "./ProposalSidebar";
import ProposalFooter from "./ProposalFooter";
export default function ProposalLayout({
  theme,
  showSidebar = false,
  sidebar,
  children,
}) {
  return (
    <div
      className="flex h-screen flex-col"
      style={{ background: theme.background }}
    >
      {children}
    </div>
  );
}
