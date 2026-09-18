import { useLayoutEffect, useRef, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function ProposalSidebar({
  theme,
  width = 320,
  proposal,
  children,
}) {
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [isDescriptionClamped, setIsDescriptionClamped] = useState(false);
  const descriptionRef = useRef(null);

  const organisationDescription =
    proposal?.themeSettings?.organisationDescription ||
    "Accounting & Financial Services";
  const organisationName = proposal?.themeSettings?.tradingBusinessName;
  const logoUrl = proposal?.themeSettings?.logoUrl;

  // Only show "Read More" when the 3-line clamp is actually cutting text off
  // (measured directly, since that depends on width/font size, not char
  // count). Skipped while expanded, since the clamp is removed then anyway.
  useLayoutEffect(() => {
    if (isDescriptionExpanded) return;
    const el = descriptionRef.current;
    if (!el) return;
    setIsDescriptionClamped(el.scrollHeight > el.clientHeight + 1);
  }, [organisationDescription, isDescriptionExpanded]);

  return (
    <aside>
      <div className="p-3">
        {/* Organization card: gradient cover with the logo overlapping as a ringed avatar. */}
        <div
          className="overflow-hidden rounded-2xl border shadow-sm"
          style={{
            background: theme.surface,
            borderColor: theme.border,
          }}
        >
          <div
            className="h-14"
            style={{
              background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
            }}
          />

          <div className="px-4 pb-4 text-center">
            <div className="-mt-8 flex justify-center">
              {/* Rounded-rect plate instead of a circular avatar, since a circle
                  was clipping the edges of wide/rectangular logos. */}
              <div
                className="flex h-16 w-28 items-center justify-center overflow-hidden rounded-xl border-4 bg-white p-2 shadow-md"
                style={{
                  borderColor: theme.surface,
                }}
              >
                <img
                  src={
                    logoUrl ||
                    "https://master.proposal.outbooks.com/static/media/logo-outbooks-proposal.9ab4fff35da097dcf552.webp"
                  }
                  alt="Company Logo"
                  className="h-full w-full object-contain"
                />
              </div>
            </div>

            <h2
              className="mt-3 text-base font-semibold tracking-tight"
              style={{
                color: theme.textPrimary,
              }}
            >
              {organisationName || "Outbooks"}
            </h2>

            {/* Labelled divider separating identity from description. */}
            <div className="mt-3 flex items-center justify-center gap-2">
              <span
                className="h-px w-6"
                style={{ background: theme.border }}
              />
              <span
                className="text-[10px] font-semibold uppercase tracking-widest"
                style={{ color: theme.textSecondary }}
              >
                About
              </span>
              <span
                className="h-px w-6"
                style={{ background: theme.border }}
              />
            </div>

            <p
              ref={descriptionRef}
              className={`mt-2 text-left text-sm leading-6 ${
                isDescriptionExpanded ? "" : "line-clamp-3"
              }`}
              style={{
                color: theme.textSecondary,
              }}
            >
              {organisationDescription}
            </p>
            {/* Kept outside the clamped paragraph so the clamp can't cut it off. */}
            {isDescriptionClamped && (
              <span
                role="button"
                tabIndex={0}
                onClick={() => setIsDescriptionExpanded((prev) => !prev)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setIsDescriptionExpanded((prev) => !prev);
                  }
                }}
                className="mt-1 inline-flex cursor-pointer items-center gap-0.5 text-xs font-semibold tracking-wide transition-opacity hover:opacity-80"
                style={{
                  color: theme.primary,
                }}
              >
                {isDescriptionExpanded ? "Read Less" : "Read More"}
                {isDescriptionExpanded ? (
                  <ChevronUp size={13} />
                ) : (
                  <ChevronDown size={13} />
                )}
              </span>
            )}
          </div>
        </div>

        {children}
      </div>
    </aside>
  );
}
