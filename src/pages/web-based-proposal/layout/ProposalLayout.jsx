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
    <div
      className="flex h-screen flex-col"
      style={{ backgroundColor: theme.background }}
    >
      <ProposalHeader theme={theme} />

      <main
        className="flex-1 overflow-hidden p-1 sm:p-5 lg:p-6"
        style={{
          backgroundColor: theme.background,
        }}
      >
        <div
          className="mx-auto flex h-full flex-col overflow-hidden rounded-3xl shadow-xl"
          style={{
            backgroundColor: theme.surface,
            border: `1px solid ${theme.border}`,
          }}
        >
          {/* Stepper */}
          <ProposalStepper
            theme={theme}
            steps={steps}
            activeStep={activeStep}
          />

          {/* PDF Viewer */}
          <div
            className="flex-1 overflow-hidden"
            style={{
              backgroundColor: theme.pdfBackground,
            }}
          >
            <PdfViewer
              theme={theme}
              pageNumber={pageNumber}
              setPageNumber={setPageNumber}
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

          {/* Footer */}
          <div
            className="sticky bottom-0 z-20"
            style={{
              backgroundColor: theme.footerBackground,
              borderTop: `1px solid ${theme.border}`,
              color: theme.footerText,
            }}
          >
            <ProposalFooter
              theme={theme}
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
