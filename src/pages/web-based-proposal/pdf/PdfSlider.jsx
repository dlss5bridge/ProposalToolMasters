import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export default function PdfSlider({ pageNumber, scale, setNumPages }) {
  return (
    <div className="flex flex-1 items-center justify-center overflow-auto bg-slate-200 p-6">
      <Document
        file="https://ontheline.trincoll.edu/images/bookdown/sample-local-pdf.pdf"
        onLoadSuccess={({ numPages }) => setNumPages(numPages)}
        onLoadError={(error) => console.log(error)}
      >
        <Page pageNumber={pageNumber} scale={scale} renderTextLayer={false} />
      </Document>
    </div>
  );
}
