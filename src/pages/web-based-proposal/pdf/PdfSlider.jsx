import { Document, Page, pdfjs } from "react-pdf";

import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";
import { useDispatch, useSelector } from "react-redux";
import { selectNumPages, setNumPages } from "../../../redux/reducer/pdfViewer";
import { useLayoutEffect, useState } from "react";
import { selectQuoteModel } from "../../../redux/reducer/webProposal";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const LARGE_SCREEN_QUERY = "(min-width: 1024px)";
const MOBILE_PAGE_WIDTH_REM = 25;
const LARGE_SCREEN_PAGE_WIDTH_REM = 50;

const getRemInPx = () =>
  parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;

const getPageWidth = (isLargeScreen) =>
  (isLargeScreen ? LARGE_SCREEN_PAGE_WIDTH_REM : MOBILE_PAGE_WIDTH_REM) *
  getRemInPx();

export default function PdfSlider({ theme }) {
  const dispatch = useDispatch();
  const quoteModel = useSelector(selectQuoteModel);

  const numPages = useSelector(selectNumPages);
  const [pageWidth, setPageWidth] = useState(() =>
    typeof window === "undefined"
      ? MOBILE_PAGE_WIDTH_REM * 16
      : getPageWidth(window.matchMedia(LARGE_SCREEN_QUERY).matches),
  );

  useLayoutEffect(() => {
    const mediaQuery = window.matchMedia(LARGE_SCREEN_QUERY);

    const updateWidth = (event) => setPageWidth(getPageWidth(event.matches));

    mediaQuery.addEventListener("change", updateWidth);

    return () => mediaQuery.removeEventListener("change", updateWidth);
  }, []);

  return (
    <Document
      file={quoteModel?.quotePDFUrl}
      onLoadSuccess={({ numPages }) => dispatch(setNumPages(numPages))}
    >
      <div
        className="h-full overflow-y-auto overflow-x-hidden"
        style={{
          backgroundColor: theme.pdfBackground,
        }}
      >
        <div className="flex flex-col items-center gap-3 p-2 sm:gap-6 sm:p-4 lg:p-6">
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
