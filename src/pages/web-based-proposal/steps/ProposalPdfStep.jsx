import PdfViewer from "../pdf/PdfViewer";

export default function ProposalPdfStep({ theme }) {
  return (
    <div
      className="h-full p-3"
      style={{
        backgroundColor: theme.background,
      }}
    >
      {/* w-[90%] (not centered) leaves a consistent 10% gap on the right at
          every viewport width, instead of a fixed pixel margin. */}
      <div
        className="flex h-full w-[90%] flex-col overflow-hidden rounded-2xl border bg-white shadow-lg"
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
