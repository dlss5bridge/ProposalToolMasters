export default function ProposalFooter({ theme, children }) {
  return (
    <footer
      className="border-t px-3 py-3 rounded-t-2xl"
      style={{
        borderColor: theme.border,
        backgroundColor: theme.footerBackground,
      }}
    >
      {children}
    </footer>
  );
}
