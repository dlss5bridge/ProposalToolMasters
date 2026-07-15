import PdfSlider from "./PdfSlider";

export default function PdfViewer({
  theme,
  pageNumber,
  numPages,
  zoom,
  setNumPages,
  setPageNumber,
  onPreviousPage,
  onNextPage,
  zoomIn,
  zoomOut,
}) {
  return (
    <section
      className="flex h-full flex-col"
      style={{ backgroundColor: theme.surface }}
    >
      <div
        className="flex-1 overflow-auto"
        style={{ backgroundColor: theme.pdfBackground }}
      >
        <PdfSlider
          theme={theme}
          pageNumber={pageNumber}
          setPageNumber={setPageNumber}
          numPages={numPages}
          scale={zoom}
          setNumPages={setNumPages}
        />
      </div>
    </section>
  );
}
