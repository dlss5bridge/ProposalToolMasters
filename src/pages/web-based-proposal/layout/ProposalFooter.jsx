import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";

export default function ProposalFooter({
  theme,
  steps,
  activeStep,
  setActiveStep,
  pageNumber,
  numPages,
  zoom,
  zoomIn,
  zoomOut,
  onPreviousPage,
  onNextPage,
}) {
  const isSlider = activeStep === 0;
  const isLast = activeStep === steps.length - 1;

  return (
    <footer
      style={{
        backgroundColor: theme.footerBackground,
        color: theme.footerText,
      }}
    >
      <div className="flex h-16 items-center justify-between px-6">
        {/* PDF Controls */}
        {isSlider ? (
          <div className="flex items-center gap-4">
            <button
              onClick={zoomOut}
              className="rounded-md border p-2 transition"
              style={{
                borderColor: theme.secondaryButtonBorder,
                backgroundColor: theme.secondaryButtonBackground,
                color: theme.secondaryButtonText,
              }}
            >
              <ZoomOut size={18} />
            </button>

            <span
              className="text-sm font-medium"
              style={{ color: theme.footerText }}
            >
              {(zoom * 100).toFixed(0)}%
            </span>

            <button
              onClick={zoomIn}
              className="rounded-md border p-2 transition"
              style={{
                borderColor: theme.secondaryButtonBorder,
                backgroundColor: theme.secondaryButtonBackground,
                color: theme.secondaryButtonText,
              }}
            >
              <ZoomIn size={18} />
            </button>

            <div className="ml-6 flex items-center gap-2">
              <button
                onClick={onPreviousPage}
                disabled={pageNumber === 1}
                className="rounded-md border p-2 transition disabled:cursor-not-allowed disabled:opacity-40"
                style={{
                  borderColor: theme.secondaryButtonBorder,
                  backgroundColor: theme.secondaryButtonBackground,
                  color: theme.secondaryButtonText,
                }}
              >
                <ChevronLeft size={18} />
              </button>

              <span
                className="text-sm font-medium"
                style={{ color: theme.footerText }}
              >
                {pageNumber} / {numPages}
              </span>

              <button
                onClick={onNextPage}
                disabled={pageNumber === numPages}
                className="rounded-md border p-2 transition disabled:cursor-not-allowed disabled:opacity-40"
                style={{
                  borderColor: theme.secondaryButtonBorder,
                  backgroundColor: theme.secondaryButtonBackground,
                  color: theme.secondaryButtonText,
                }}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        ) : (
          <div />
        )}

        {/* Workflow Buttons */}
        <div className="flex items-center gap-3">
          {activeStep > 0 && (
            <button
              onClick={() => setActiveStep((s) => s - 1)}
              className="rounded-lg border px-5 py-2 text-sm font-medium transition"
              style={{
                backgroundColor: theme.secondaryButtonBackground,
                color: theme.secondaryButtonText,
                borderColor: theme.secondaryButtonBorder,
              }}
            >
              Previous
            </button>
          )}

          {!isLast ? (
            <button
              onClick={() => setActiveStep((s) => s + 1)}
              className="rounded-lg px-6 py-2 text-sm font-medium transition"
              style={{
                backgroundColor: theme.primaryButtonBackground,
                color: theme.primaryButtonText,
              }}
            >
              Next
            </button>
          ) : (
            <button
              className="rounded-lg px-6 py-2 text-sm font-medium transition"
              style={{
                backgroundColor: theme.successButtonBackground,
                color: theme.successButtonText,
              }}
            >
              Accept Proposal
            </button>
          )}
        </div>
      </div>
    </footer>
  );
}
