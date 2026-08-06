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

  // "Read More" should only appear when the 3-line clamp below is actually
  // cutting text off, which depends on the sidebar's width/font size rather
  // than character count - so measure the real overflow instead of guessing
  // at a character limit. Only meaningful while collapsed: once expanded the
  // clamp is removed (card grows instead), so scrollHeight/clientHeight would
  // always match and there's nothing left to detect.
  useLayoutEffect(() => {
    if (isDescriptionExpanded) return;
    const el = descriptionRef.current;
    if (!el) return;
    setIsDescriptionClamped(el.scrollHeight > el.clientHeight + 1);
  }, [organisationDescription, isDescriptionExpanded]);

  return (
    <aside>
      <div className="p-3">
        {/* Organization Card - a gradient cover with the logo overlapping it
            as a ringed avatar, in the vein of a modern profile/brand card
            rather than a plain centered box. */}
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
              {/* Rounded-rectangle "plate" rather than a circular avatar - a
                  circle clips anything outside its inscribed radius, so a
                  wide/rectangular logo scaled to fit the box's width (via
                  object-contain) had its left/right edges cut off near the
                  corners. A rounded rect fits any aspect ratio - square,
                  landscape, or portrait, white background or transparent -
                  without cropping any of it. */}
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

            {/* Labelled divider separating identity from description,
                instead of a second stacked card. */}
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
            {/* Rendered after (not inside) the clamped paragraph - text
                nested inside a line-clamped element can get cut off by the
                clamp itself, so it can't reliably stay visible glued to the
                end. */}
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
