import ProposalHeader from "../layout/ProposalHeader";
import ProposalLayout from "../layout/ProposalLayout";
import ProposalSidebar from "../layout/ProposalSidebar";
import PdfViewer from "../pdf/PdfViewer";

export default function StandardProposal({ proposal, theme }) {
  return (
    <ProposalLayout theme={theme}>
      {/* Mobile Header */}
      <div className="block lg:hidden">
        <ProposalHeader theme={theme} title={proposal.title} />
      </div>

      <div
        className="flex h-full gap-3 overflow-hidden"
        style={{
          backgroundColor: theme.background,
        }}
      >
        {/* Sidebar */}
        <aside
          className="
        hidden
        lg:flex
        lg:w-64
        lg:flex-shrink-0
        overflow-y-auto
        border-r
        p-3
      "
          style={{
            backgroundColor: theme.background,
            borderColor: theme.border,
          }}
        >
          <ProposalSidebar theme={theme} proposal={proposal} />
        </aside>

        {/* PDF Section */}
        <main
          className="
        w-full
        flex-1
        overflow-hidden
        p-3
      "
          style={{
            backgroundColor: theme.background,
          }}
        >
          <div className="mx-auto h-full">
            <div
              className="
            flex
            h-full
            flex-col
            overflow-hidden
            rounded-2xl
            border
            bg-white
            shadow-lg
          "
              style={{
                borderColor: theme.border,
              }}
            >
              {/* Top Accent */}
              <div
                className="h-1.5"
                style={{
                  background: `linear-gradient(90deg, ${theme.primary}, ${theme.secondary})`,
                }}
              />

              {/* PDF Viewer */}
              <div className="flex-1 overflow-hidden bg-white">
                <PdfViewer theme={theme} />
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProposalLayout>
  );
}

// import PdfViewer from "../pdf/PdfViewer";

// export default function StandardProposal({
//   theme,
//   steps,
//   activeStep,
//   setActiveStep,
//   pageNumber,
//   setPageNumber,
//   numPages,
//   setNumPages,
//   zoom,
//   setZoom,
//   children,
// }) {
//   //==================functions=====================
//   const handlePreviousPage = () => {
//     setPageNumber((p) => Math.max(1, p - 1));
//   };

//   const handleNextPage = () => {
//     setPageNumber((p) => Math.min(numPages, p + 1));
//   };

//   const zoomIn = () => {
//     setZoom((z) => Math.min(3, z + 0.2));
//   };

//   const zoomOut = () => {
//     setZoom((z) => Math.max(0.6, z - 0.2));
//   };

//   return (
//     <div className="h-full">
//       <PdfViewer
//         theme={theme}
//         pageNumber={pageNumber}
//         setPageNumber={setPageNumber}
//         numPages={numPages}
//         zoom={zoom}
//         setNumPages={setNumPages}
//         onPreviousPage={handlePreviousPage}
//         onNextPage={handleNextPage}
//         zoomIn={zoomIn}
//         zoomOut={zoomOut}
//       />
//     </div>
//   );
// }
