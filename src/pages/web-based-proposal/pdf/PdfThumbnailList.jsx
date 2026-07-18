import { Page } from "react-pdf";
import { useDispatch, useSelector } from "react-redux";
import {
  selectCurrentPage,
  selectNumPages,
  selectPdfFile,
  selectZoom,
  setCurrentPage,
} from "../../../redux/reducer/pdfViewer";

export default function PdfThumbnailList({ theme }) {
  const dispatch = useDispatch();

  const pageNumber = useSelector(selectCurrentPage);
  const numPages = useSelector(selectNumPages);

  return (
    <aside
      className="hidden md:flex w-52 shrink-0 flex-col overflow-y-auto border-r p-3"
      style={{
        backgroundColor: theme.surface,
        borderColor: theme.border,
      }}
    >
      <h3 className="mb-3 text-sm font-semibold" style={{ color: theme.text }}>
        Pages
      </h3>

      <div className="space-y-3">
        {Array.from({ length: numPages }, (_, index) => {
          const page = index + 1;
          const selected = page === pageNumber;

          return (
            <button
              key={page}
              type="button"
              onClick={() => dispatch(setCurrentPage(page))}
              className="w-full rounded-lg border p-2 transition-all"
              style={{
                borderColor: selected ? theme.primary : theme.border,
                backgroundColor: selected
                  ? `${theme.primary}15`
                  : theme.surface,
              }}
            >
              <Page
                pageNumber={page}
                width={130}
                renderTextLayer={false}
                renderAnnotationLayer={false}
              />

              <p
                className="mt-2 text-center text-xs font-medium"
                style={{
                  color: selected ? theme.primary : theme.textLight,
                }}
              >
                Page {page}
              </p>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
