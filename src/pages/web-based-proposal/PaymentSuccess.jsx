import { Check } from "lucide-react";

import { DEFAULT_PROPOSAL_THEME } from "./theme/proposalTheme";

// No quote-specific theme is available here (this page isn't reached with a
// quoteKeyID to fetch GetOrganisationThemeSettings from), so it uses the
// same default theme tokens the rest of web-based-proposal falls back to.
const theme = DEFAULT_PROPOSAL_THEME;

export default function PaymentSuccess() {
  return (
    <main
      className="flex min-h-screen flex-col"
      style={{
        height: "100dvh",
        backgroundColor: theme.background,
        fontFamily: theme.fontFamily,
      }}
    >
      {/* Same top accent used on every proposal card, here spanning the
          full page instead of a boxed card — this page owns the whole
          screen rather than floating a small card on an empty canvas. */}
      <div
        className="h-1.5 flex-shrink-0"
        style={{
          background: `linear-gradient(90deg, ${theme.primary}, ${theme.secondary})`,
        }}
      />

      <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <div
          className="mb-7 flex h-24 w-24 items-center justify-center rounded-full sm:h-28 sm:w-28"
          style={{ backgroundColor: `${theme.completedStepBackground}1A` }}
        >
          <div
            className="flex h-16 w-16 items-center justify-center rounded-full sm:h-[4.5rem] sm:w-[4.5rem]"
            style={{ backgroundColor: theme.completedStepBackground }}
          >
            <Check size={34} strokeWidth={3} color="#fff" />
          </div>
        </div>

        <p
          className="mb-3 text-xs font-bold uppercase tracking-[0.2em]"
          style={{ color: theme.completedStepBackground }}
        >
          Payment confirmed
        </p>

        <h1
          className="text-3xl font-bold sm:text-4xl"
          style={{ color: theme.textPrimary }}
        >
          Thank you!
        </h1>

        <p
          className="mt-4 max-w-md text-base leading-relaxed sm:text-lg"
          style={{ color: theme.textSecondary }}
        >
          Your payment was received successfully. You can safely close this
          page.
        </p>
      </div>
    </main>
  );
}
