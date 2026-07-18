export default function ProposalHeader({
  theme,
  title = "Accounting Proposal",
  logo,
}) {
  return (
    <header
      className="h-12 border-b bg-white"
      style={{
        borderColor: theme.border,
      }}
    >
      <div className="flex h-full items-center justify-between px-5">
        {/* Left */}
        <div className="flex items-center gap-3">
          {logo && (
            <img src={logo} alt="Logo" className="h-7 w-auto object-contain" />
          )}

          <h1
            className="text-[15px] font-semibold"
            style={{
              color: theme.textPrimary,
            }}
          >
            {title}
          </h1>
        </div>

        {/* Future Actions */}
        <div className="flex items-center gap-2">
          {/* Download */}
          {/* Print */}
          {/* Share */}
        </div>
      </div>
    </header>
  );
}
