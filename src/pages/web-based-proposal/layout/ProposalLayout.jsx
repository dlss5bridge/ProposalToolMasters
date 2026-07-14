import PdfViewer from "../pdf/PdfViewer";
import ProposalFooter from "./ProposalFooter";
import ProposalHeader from "./ProposalHeader";
import ProposalStepper from "./ProposalStepper";

export default function ProposalLayout({
  theme,
  steps,
  activeStep,
  setActiveStep,
  pageNumber,
  setPageNumber,
  numPages,
  setNumPages,
  zoom,
  setZoom,
  children,
}) {
  //==================functions=====================
  const handlePreviousPage = () => {
    setPageNumber((p) => Math.max(1, p - 1));
  };

  const handleNextPage = () => {
    setPageNumber((p) => Math.min(numPages, p + 1));
  };

  const zoomIn = () => {
    setZoom((z) => Math.min(3, z + 0.2));
  };

  const zoomOut = () => {
    setZoom((z) => Math.max(0.6, z - 0.2));
  };

  return (
    <div className="flex h-screen flex-col bg-slate-100">
      <ProposalHeader style={{ backgroundColor: theme.secondary }} />

      <main className="flex-1 overflow-hidden p-2 sm:p-6">
        <div className="mx-auto flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <ProposalStepper steps={steps} />

          {/* PDF Area */}
          <div className="flex-1 overflow-hidden">
            <PdfViewer
              pageNumber={pageNumber}
              numPages={numPages}
              zoom={zoom}
              setNumPages={setNumPages}
              onPreviousPage={handlePreviousPage}
              onNextPage={handleNextPage}
              zoomIn={zoomIn}
              zoomOut={zoomOut}
            />
          </div>

          {children}

          {/* Sticky Footer */}
          <div className="sticky bottom-0 z-20 border-t border-slate-200 bg-white shadow-[0_-4px_12px_rgba(0,0,0,0.08)]">
            <ProposalFooter
              steps={steps}
              activeStep={activeStep}
              setActiveStep={setActiveStep}
              pageNumber={pageNumber}
              numPages={numPages}
              zoom={zoom}
              onPreviousPage={handlePreviousPage}
              onNextPage={handleNextPage}
              zoomIn={zoomIn}
              zoomOut={zoomOut}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
