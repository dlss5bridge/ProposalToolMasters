export default function ProposalFooter({ theme, left, center, right }) {
  return (
    <footer
      className="h-16 border-t"
      style={{
        background: theme.surface,
        borderColor: theme.border,
      }}
    >
      <div className="flex h-full items-center justify-between px-6">
        <div className="min-w-[220px]">{left}</div>

        <div className="flex-1 flex justify-center">{center}</div>

        <div className="min-w-[220px] flex justify-end">{right}</div>
      </div>
    </footer>
  );
}
