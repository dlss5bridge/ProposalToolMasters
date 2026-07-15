import { Document, Page, pdfjs } from "react-pdf";
import PdfThumbnailList from "./PdfThumbnailList";

import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export default function PdfSlider({
  theme,
  pageNumber,
  setPageNumber,
  numPages,
  scale,
  setNumPages,
}) {
  return (
    <Document
      file="https://ontheline.trincoll.edu/images/bookdown/sample-local-pdf.pdf"
      onLoadSuccess={({ numPages }) => setNumPages(numPages)}
    >
      <div
        className="flex h-full"
        style={{
          backgroundColor: theme.pdfBackground,
        }}
      >
        {/* Left Sidebar */}
        <PdfThumbnailList
          theme={theme}
          numPages={numPages}
          pageNumber={pageNumber}
          setPageNumber={setPageNumber}
        />

        {/* Right PDF Preview */}
        <div className="flex flex-1 justify-center overflow-auto p-4">
          <Page
            pageNumber={pageNumber}
            scale={scale}
            renderTextLayer={false}
            renderAnnotationLayer={false}
          />
        </div>
      </div>
    </Document>
  );
}

// import { Document, Page, pdfjs } from "react-pdf";
// import "react-pdf/dist/Page/TextLayer.css";
// import "react-pdf/dist/Page/AnnotationLayer.css";
// import { useEffect, useRef, useState } from "react";

// pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

// export default function PdfSlider({ theme, pageNumber, scale, setNumPages }) {
//   const containerRef = useRef(null);
//   const [pageWidth, setPageWidth] = useState(0);

//   //=================useEffect==================
//   // useEffect(() => {
//   //   const updateWidth = () => {
//   //     if (containerRef.current) {
//   //       setPageWidth(containerRef.current.clientWidth - 12); // padding
//   //     }
//   //   };

//   //   updateWidth();

//   //   window.addEventListener("resize", updateWidth);

//   //   return () => window.removeEventListener("resize", updateWidth);
//   // }, []); //preview pdf on full screen

//   return (
//     <div
//       ref={containerRef}
//       className="flex flex-1 justify-center overflow-auto p-1"
//       style={{ backgroundColor: theme.pdfBackground }}
//     >
//       <Document
//         file="https://ontheline.trincoll.edu/images/bookdown/sample-local-pdf.pdf"
//         onLoadSuccess={({ numPages }) => setNumPages(numPages)}
//       >
//         <Page
//           pageNumber={pageNumber}
//           width={pageWidth}
//           scale={scale}
//           renderTextLayer={false}
//           renderAnnotationLayer={false}
//         />
//       </Document>
//     </div>
//   );
// }
