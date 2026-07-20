export default function ProposalSidebar({ theme, width = 320, children }) {
  return (
    <aside
      className="hidden lg:flex flex-col overflow-auto border-r"
      style={{
        width,
        background: theme.sidebarBackground,
        borderColor: theme.sidebarBorder,
      }}
    >
      <div className="p-6">
        {/* Company */}
        <div className="flex flex-col items-center border-b pb-6">
          <img
            src="https://placehold.co/120x120/png?text=Logo"
            alt="Company Logo"
            className="h-24 w-24 rounded-xl border object-cover"
          />

          <h2
            className="mt-4 text-lg font-semibold"
            style={{ color: theme.textPrimary }}
          >
            Wow Solutions Pvt. Ltd.
          </h2>

          <p className="mt-1 text-sm" style={{ color: theme.textSecondary }}>
            Accounting & Financial Services
          </p>
        </div>

        {/* Proposal Details */}
        <div className="mt-6">
          <h3
            className="mb-4 text-sm font-semibold uppercase tracking-wide"
            style={{ color: theme.textSecondary }}
          >
            Proposal Details
          </h3>

          <div className="space-y-4 text-sm">
            <Info label="Proposal No." value="PR-2026-00125" theme={theme} />

            <Info label="Client" value="ABC Technologies Ltd." theme={theme} />

            <Info label="Prepared By" value="John Smith" theme={theme} />

            <Info label="Created On" value="20 July 2026" theme={theme} />

            <Info label="Valid Till" value="20 August 2026" theme={theme} />
          </div>
        </div>

        {/* Status */}
        <div className="mt-8 rounded-xl bg-sky-50 p-4">
          <p
            className="text-xs font-semibold uppercase"
            style={{ color: theme.primary }}
          >
            Status
          </p>

          <p
            className="mt-2 text-lg font-semibold"
            style={{ color: theme.textPrimary }}
          >
            Awaiting Review
          </p>

          <p className="mt-1 text-sm" style={{ color: theme.textSecondary }}>
            Please review the proposal before proceeding.
          </p>
        </div>

        {/* Contact */}
        <div className="mt-8">
          <h3
            className="mb-4 text-sm font-semibold uppercase tracking-wide"
            style={{ color: theme.textSecondary }}
          >
            Contact
          </h3>

          <div className="space-y-3 text-sm">
            <Info label="Email" value="sales@wowsolutions.com" theme={theme} />

            <Info label="Phone" value="+91 98765 43210" theme={theme} />

            <Info label="Website" value="www.wowsolutions.com" theme={theme} />
          </div>
        </div>

        {children}
      </div>
    </aside>
  );
}

function Info({ label, value, theme }) {
  return (
    <div>
      <p className="text-xs uppercase" style={{ color: theme.textSecondary }}>
        {label}
      </p>

      <p className="mt-1 font-medium" style={{ color: theme.textPrimary }}>
        {value}
      </p>
    </div>
  );
}
