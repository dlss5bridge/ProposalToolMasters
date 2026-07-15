export default function ProposalHeader({ theme }) {
  return (
    <header
      className="border-b shadow-sm"
      style={{
        backgroundColor: theme.headerBackground,
        borderBottom: `1px solid ${theme.border}`,
      }}
    >
      <div className="flex h-16 items-center justify-center px-4 sm:px-6 lg:px-8">
        <h1
          className="text-center text-lg font-semibold tracking-wide sm:text-xl"
          style={{ color: theme.headerText }}
        >
          Web Based Proposal
        </h1>
      </div>
    </header>
  );
}
