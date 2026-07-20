export default function ProposalFooter({ theme, children }) {
  return (
    <footer
      className="border-t px-3 py-3 rounded-t-2xl bg-slate-800"
      style={{
        borderColor: theme.border,
      }}
    >
      {children}
    </footer>
  );
}
