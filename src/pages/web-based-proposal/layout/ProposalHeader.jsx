export default function ProposalHeader({
  theme,
  title = "Accounting Proposal",
  logo,
}) {
  return (
    <header
      className="py-2 sticky top-0 z-20 bg-white shadow-sm"
      style={{
        borderBottom: `1px solid ${theme.border}`,
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
            {title || "Web Proposal"}
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
