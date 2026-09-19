import PdfSlider from "./PdfSlider";
// import PdfToolbar from "./PdfToolbar";

export default function PdfViewer({ theme }) {
  return (
    <section
      className="flex h-full flex-col"
      style={{ backgroundColor: theme.surface }}
    >
      <div
        className="relative flex-1 overflow-auto"
        style={{ backgroundColor: theme.pdfBackground }}
      >
        <PdfSlider theme={theme} />
      </div>
      {/* <PdfToolbar theme={theme} /> */}
    </section>
  );
}
