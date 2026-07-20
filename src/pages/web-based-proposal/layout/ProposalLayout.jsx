export default function ProposalLayout({
  theme,
  showSidebar = false,
  sidebar,
  children,
}) {
  return (
    <div
      className="flex h-screen flex-col overflow-hidden"
      style={{ background: theme.background }}
    >
      {children}
    </div>
  );
}
