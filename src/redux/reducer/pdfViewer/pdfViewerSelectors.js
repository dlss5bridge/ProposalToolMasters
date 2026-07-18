export const selectPdfViewer = (state) => state.pdfViewer;

export const selectCurrentPage = (state) => state.pdfViewer.currentPage;

export const selectNumPages = (state) => state.pdfViewer.numPages;

export const selectZoom = (state) => state.pdfViewer.zoom;

export const selectPdfFile = (state) => state.pdfViewer.file;
