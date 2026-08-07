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
      <div className="flex h-full items-center justify-between gap-3 px-3 sm:px-5">
        {/* Left */}
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          {logo && (
            <img
              src={logo}
              alt="Logo"
              className="h-6 w-auto flex-shrink-0 object-contain sm:h-7"
            />
          )}

          <h1
            className="truncate text-[13px] font-semibold sm:text-[15px]"
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
