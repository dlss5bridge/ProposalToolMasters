import PdfViewer from "../pdf/PdfViewer";

export default function ProposalPdfStep({ theme }) {
  return (
    <div
      className="h-full p-1.5 sm:p-3"
      style={{
        backgroundColor: theme.background,
      }}
    >
      {/* Full width on mobile so the PDF frame isn't squeezed into 90% of an
          already-small viewport. From lg up, w-[90%] (not centered) leaves a
          consistent 10% gap on the right instead of a fixed pixel margin. */}
      <div
        className="flex h-full w-full flex-col overflow-hidden rounded-xl border bg-white shadow-lg sm:rounded-2xl lg:w-[90%]"
        style={{
          borderColor: theme.border,
        }}
      >
        <div
          className="h-1.5"
          style={{
            background: `${theme.primary}`,
          }}
        />

        <div className="flex-1 overflow-hidden">
          <PdfViewer theme={theme} />
        </div>
      </div>
    </div>
  );
}
