import PdfViewer from "../pdf/PdfViewer";

export default function ProposalPdfStep({ theme }) {
  return (
    <div
      className="h-full p-3"
      style={{
        backgroundColor: theme.background,
      }}
    >
      <div
        className="flex h-full flex-col overflow-hidden rounded-2xl border bg-white shadow-lg"
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
