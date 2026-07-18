export default function ProposalSidebar({ theme, width = 320, children }) {
  return (
    <aside
      className="hidden lg:flex flex-col border-r overflow-auto"
      style={{
        width,
        background: theme.sidebarBackground,
        borderColor: theme.sidebarBorder,
      }}
    >
      {children}
    </aside>
  );
}
