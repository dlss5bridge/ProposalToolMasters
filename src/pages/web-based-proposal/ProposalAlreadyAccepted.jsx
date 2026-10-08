import { CheckCircle2 } from "lucide-react";

// Shown instead of the Standard/Standard-with-Input-Fields/Amendment flow
// when GetOrganisationThemeSettings reports statusName: "Accepted" — the
// proposal has already been accepted, so the client-facing accept/amend
// flow no longer applies. Same full-screen treatment as PaymentSuccess.jsx,
// but themed with the quote's own resolved theme (available here) rather
// than the default fallback.
export default function ProposalAlreadyAccepted({ theme }) {
  return (
    <main
      className="flex min-h-screen flex-col"
      style={{
        height: "100dvh",
        backgroundColor: theme.background,
        fontFamily: theme.fontFamily,
      }}
    >
      <div
        className="h-1.5 flex-shrink-0"
        style={{
          background: `linear-gradient(90deg, ${theme.primary}, ${theme.secondary})`,
        }}
      />

      <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <div
          className="mb-7 flex h-24 w-24 items-center justify-center rounded-full sm:h-28 sm:w-28"
          style={{ backgroundColor: `${theme.primary}1A` }}
        >
          <div
            className="flex h-16 w-16 items-center justify-center rounded-full sm:h-[4.5rem] sm:w-[4.5rem]"
            style={{ backgroundColor: theme.primary }}
          >
            <CheckCircle2 size={34} strokeWidth={2} color="#fff" />
          </div>
        </div>

        <p
          className="mb-3 text-xs font-bold uppercase tracking-[0.2em]"
          style={{ color: theme.primary }}
        >
          Already accepted
        </p>

        <h1
          className="text-3xl font-bold sm:text-4xl"
          style={{ color: theme.textPrimary }}
        >
          This proposal has already been accepted
        </h1>

        <p
          className="mt-4 max-w-md text-base leading-relaxed sm:text-lg"
          style={{ color: theme.textSecondary }}
        >
          There's nothing further to review or accept here. If you believe
          this is a mistake, please get in touch with us.
        </p>
      </div>
    </main>
  );
}
