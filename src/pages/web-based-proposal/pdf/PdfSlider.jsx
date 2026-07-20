import { Document, Page, pdfjs } from "react-pdf";

import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";
import { useDispatch, useSelector } from "react-redux";
import { selectNumPages, setNumPages } from "../../../redux/reducer/pdfViewer";
import { useLayoutEffect, useRef, useState } from "react";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export default function PdfSlider({ theme }) {
  const dispatch = useDispatch();
  const numPages = useSelector(selectNumPages);
  const containerRef = useRef(null);
  const [pageWidth, setPageWidth] = useState(750);

  useLayoutEffect(() => {
    if (!containerRef.current) return;

    const calculateWidth = () => {
      if (!containerRef.current) return;

      const containerWidth = containerRef.current.clientWidth;

      let width = containerWidth * 0.95;

      width = Math.min(width, 950);
      width = Math.max(width, 280);

      setPageWidth(width);
    };

    calculateWidth();

    const observer = new ResizeObserver(calculateWidth);

    observer.observe(containerRef.current);

    return () => observer.disconnect();
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
