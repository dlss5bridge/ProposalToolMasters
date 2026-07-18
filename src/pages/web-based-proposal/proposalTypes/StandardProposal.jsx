import ProposalLayout from "../layout/ProposalLayout";
import PdfViewer from "../pdf/PdfViewer";

export default function StandardProposal({ proposal, theme }) {
  return (
    <ProposalLayout theme={theme} title={proposal.title} showSidebar={false}>
      <PdfViewer theme={theme} />
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
