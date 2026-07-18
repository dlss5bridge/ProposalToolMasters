import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";

import { useDispatch, useSelector } from "react-redux";

import {
  nextPage,
  previousPage,
  zoomIn,
  zoomOut,
  selectCurrentPage,
  selectNumPages,
  selectZoom,
} from "../../../redux/reducer/pdfViewer";

export default function PdfToolbar({ theme }) {
  const dispatch = useDispatch();

  const pageNumber = useSelector(selectCurrentPage);
  const numPages = useSelector(selectNumPages);
  const scale = useSelector(selectZoom);

  return (
    <div
      className="flex items-center justify-between border-t px-6 py-3"
      style={{
        backgroundColor: theme.surface,
        borderColor: theme.border,
      }}
    >
      {/* Zoom Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => dispatch(zoomOut())}
          className="rounded-lg border p-2 transition hover:opacity-80"
          style={{
            borderColor: theme.border,
            color: theme.textPrimary,
          }}
        >
          <ZoomOut size={18} />
        </button>

        <span
          className="w-14 text-center text-sm font-medium"
          style={{ color: theme.textPrimary }}
        >
          {(scale * 100).toFixed(0)}%
        </span>

        <button
          onClick={() => dispatch(zoomIn())}
          className="rounded-lg border p-2 transition hover:opacity-80"
          style={{
            borderColor: theme.border,
            color: theme.textPrimary,
          }}
        >
          <ZoomIn size={18} />
        </button>
      </div>

      {/* Pagination */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => dispatch(previousPage())}
          disabled={pageNumber === 1}
          className="rounded-lg border p-2 disabled:cursor-not-allowed disabled:opacity-40"
          style={{
            borderColor: theme.border,
            color: theme.textPrimary,
          }}
        >
          <ChevronLeft size={18} />
        </button>

        <span
          className="text-sm font-medium"
          style={{ color: theme.textPrimary }}
        >
          Page {pageNumber} of {numPages}
        </span>

        <button
          onClick={() => dispatch(nextPage())}
          disabled={pageNumber === numPages}
          className="rounded-lg border p-2 disabled:cursor-not-allowed disabled:opacity-40"
          style={{
            borderColor: theme.border,
            color: theme.textPrimary,
          }}
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
