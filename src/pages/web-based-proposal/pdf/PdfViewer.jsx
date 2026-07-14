import PdfSlider from "./PdfSlider";

export default function PdfViewer({
  pageNumber,
  numPages,
  zoom,
  setNumPages,
  onPreviousPage,
  onNextPage,
  zoomIn,
  zoomOut,
}) {
  return (
    <section className="flex h-full flex-col">
      <div className="flex-1 overflow-auto bg-slate-100">
        <PdfSlider
          pageNumber={pageNumber}
          scale={zoom}
          setNumPages={setNumPages}
        />
      </div>
    </section>
  );
}
