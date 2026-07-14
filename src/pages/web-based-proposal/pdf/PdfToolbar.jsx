import { ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from "lucide-react";

export default function PdfToolbar({
  pageNumber,
  numPages,
  scale,
  onPrev,
  onNext,
  zoomIn,
  zoomOut,
}) {
  return (
    <div className="flex items-center justify-between border-t bg-white px-6 py-3">
      <div className="flex items-center gap-2">
        <button
          onClick={zoomOut}
          className="rounded-lg border p-2 hover:bg-slate-100"
        >
          <ZoomOut size={18} />
        </button>

        <span className="w-14 text-center text-sm">
          {(scale * 100).toFixed(0)}%
        </span>

        <button
          onClick={zoomIn}
          className="rounded-lg border p-2 hover:bg-slate-100"
        >
          <ZoomIn size={18} />
        </button>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onPrev}
          disabled={pageNumber === 1}
          className="rounded-lg border p-2 hover:bg-slate-100 disabled:opacity-40"
        >
          <ChevronLeft size={18} />
        </button>

        <span className="text-sm font-medium">
          Page {pageNumber} of {numPages || 0}
        </span>

        <button
          onClick={onNext}
          disabled={pageNumber === numPages}
          className="rounded-lg border p-2 hover:bg-slate-100 disabled:opacity-40"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
