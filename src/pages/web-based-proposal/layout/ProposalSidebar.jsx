export default function ProposalSidebar({
  theme,
  width = 320,
  proposal,
  children,
}) {
  const organisationDescription =
    proposal?.themeSettings?.organisationDescription;
  const organisationName = proposal?.themeSettings?.tradingBusinessName;
  return (
    <aside>
      <div className="p-6">
        {/* Organization Card */}
        <div
          className="rounded-2xl p-6 text-center"
          style={{
            background: `${theme.primary}10`,
            border: `1px solid ${theme.border}`,
          }}
        >
          <div className="flex justify-center">
            <img
              src="https://master.proposal.outbooks.com/static/media/logo-outbooks-proposal.9ab4fff35da097dcf552.webp"
              alt="Company Logo"
              className="h-24 w-24 rounded-xl border bg-blue-900 object-contain p-2 shadow-sm"
              style={{
                borderColor: theme.border,
              }}
            />
          </div>

          <h2
            className="mt-5 text-lg font-semibold"
            style={{
              color: theme.textPrimary,
            }}
          >
            {organisationName || "Outbooks"}
          </h2>

          <p
            className="mt-2 text-sm leading-6"
            style={{
              color: theme.textSecondary,
            }}
          >
            {organisationDescription || "Accounting & Financial Services"}
          </p>
        </div>

        {children}
      </div>
    </aside>
  );
}
