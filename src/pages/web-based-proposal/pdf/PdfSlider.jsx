import { Document, Page, pdfjs } from "react-pdf";

import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";
import { useDispatch, useSelector } from "react-redux";
import {
  selectCurrentPage,
  selectNumPages,
  selectPdfFile,
  selectZoom,
  setNumPages,
} from "../../../redux/reducer/pdfViewer";
import { useEffect, useRef, useState } from "react";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export default function PdfSlider({ theme }) {
  const dispatch = useDispatch();

  const numPages = useSelector(selectNumPages);
  const containerRef = useRef(null);
  const [pageWidth, setPageWidth] = useState(900);

  useEffect(() => {
    const updateWidth = () => {
      if (!containerRef.current) return;

      const width = containerRef.current.clientWidth;

      // Leave some padding around the PDF
      setPageWidth(Math.min(width - 32, 950));
    };

    updateWidth();

    window.addEventListener("resize", updateWidth);

    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  return (
    <Document
      file="https://ontheline.trincoll.edu/images/bookdown/sample-local-pdf.pdf"
      onLoadSuccess={({ numPages }) => dispatch(setNumPages(numPages))}
    >
      <div
        ref={containerRef}
        className="h-full overflow-y-auto overflow-x-hidden"
        style={{
          backgroundColor: theme.pdfBackground,
        }}
      >
        <div className="flex flex-col items-center gap-6 p-4 lg:p-6">
          {Array.from({ length: numPages }, (_, index) => (
            <div key={index} className="rounded-lg bg-white shadow-md">
              <Page
                pageNumber={index + 1}
                width={pageWidth}
                renderTextLayer={false}
                renderAnnotationLayer={false}
              />
            </div>
          ))}
        </div>
      </div>
    </Document>
  );
}
