import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";

export default function ProposalFooter({
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
    <footer className="border-t border-slate-200 bg-white">
      <div className="flex h-16 items-center justify-between px-6">
        {/* PDF Controls */}
        {isSlider ? (
          <div className="flex items-center gap-4">
            <button
              onClick={zoomOut}
              className="rounded-md border p-2 hover:bg-slate-100"
            >
              <ZoomOut size={18} />
            </button>

            <span className="text-sm font-medium">
              {(zoom * 100).toFixed(0)}%
            </span>

            <button
              onClick={zoomIn}
              className="rounded-md border p-2 hover:bg-slate-100"
            >
              <ZoomIn size={18} />
            </button>

            <div className="ml-6 flex items-center gap-2">
              <button
                onClick={onPreviousPage}
                disabled={pageNumber === 1}
                className="rounded-md border p-2 disabled:opacity-40"
              >
                <ChevronLeft size={18} />
              </button>

              <span className="text-sm">
                {pageNumber} / {numPages}
              </span>

              <button
                onClick={onNextPage}
                disabled={pageNumber === numPages}
                className="rounded-md border p-2 disabled:opacity-40"
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
              className="rounded-lg border border-slate-300 px-5 py-2 text-sm font-medium hover:bg-slate-100"
            >
              Previous
            </button>
          )}

          {!isLast ? (
            <button
              onClick={() => setActiveStep((s) => s + 1)}
              className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Next
            </button>
          ) : (
            <button className="rounded-lg bg-emerald-600 px-6 py-2 text-sm font-medium text-white hover:bg-emerald-700">
              Accept Proposal
            </button>
          )}
        </div>
      </div>
    </footer>
  );
}
