import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { useDispatch } from "react-redux";

import ProposalHeader from "../layout/ProposalHeader";
import ProposalLayout from "../layout/ProposalLayout";
import ProposalFooter from "../layout/ProposalFooter";
import ProposalSidebar from "../layout/ProposalSidebar";
import PdfViewer from "../pdf/PdfViewer";
import { acceptProposal } from "../../../redux/reducer/webProposal";

export default function StandardProposal({ proposal, theme }) {
  const dispatch = useDispatch();
  const [isAccepting, setIsAccepting] = useState(false);

  // Placeholder endpoint until the real "Accept" API is ready — see
  // AcceptWebProposal in ProposalApi.jsx.
  const handleAccept = async () => {
    setIsAccepting(true);
    try {
      await dispatch(
        acceptProposal({ quoteKeyID: proposal.quoteModel?.quoteKeyID }),
      ).unwrap();
    } catch (err) {
      // Endpoint is a placeholder for now, so failures are expected.
    } finally {
      setIsAccepting(false);
    }
  };

  return (
    <ProposalLayout theme={theme}>
      {/* Mobile Header */}
      <div className="block lg:hidden">
        <ProposalHeader
          theme={theme}
          title={proposal.title}
          logo={proposal.themeSettings?.logoUrl}
        />
      </div>

      <div
        className="flex flex-1 gap-3 overflow-hidden"
        style={{
          backgroundColor: theme.background,
        }}
      >
        {/* Sidebar */}
        <aside
          className="
        hidden
        lg:flex
        lg:w-80
        lg:flex-shrink-0
        overflow-y-auto
        border-r
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
        p-1.5
        sm:p-3
      "
          style={{
            backgroundColor: theme.background,
          }}
        >
          {/* Full width on mobile so the PDF frame isn't squeezed into 90% of
              an already-small viewport. From lg up, w-[90%] (not centered)
              leaves a consistent 10% gap on the right instead of a fixed
              pixel margin. */}
          <div className="h-full w-full lg:w-[90%]">
            <div
              className="
            flex
            h-full
            flex-col
            overflow-hidden
            rounded-xl
            border
            bg-white
            shadow-lg
            sm:rounded-2xl
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

      <ProposalFooter theme={theme}>
        <div className="flex justify-end">
          <button
            onClick={handleAccept}
            disabled={isAccepting}
            className="flex h-9 items-center justify-center gap-1 rounded-md px-4 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-40"
            style={{
              backgroundColor: theme.primary,
            }}
          >
            {isAccepting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <>
                Accept
                <Check size={16} />
              </>
            )}
          </button>
        </div>
      </ProposalFooter>
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
