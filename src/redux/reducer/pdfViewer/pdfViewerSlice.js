import { createSlice } from "@reduxjs/toolkit";
import { loadPdf } from "./pdfViewerThunk";

const initialState = {
  file: null,

  currentPage: 1,
  numPages: 0,

  zoom: 1,

  minZoom: 0.6,
  maxZoom: 3,

  loading: false,
  error: null,
};

const pdfViewerSlice = createSlice({
  name: "pdfViewer",

  initialState,

  reducers: {
    setPdfFile(state, action) {
      state.file = action.payload;
    },

    setNumPages(state, action) {
      state.numPages = action.payload;
    },

    setCurrentPage(state, action) {
      state.currentPage = action.payload;
    },

    nextPage(state) {
      if (state.currentPage < state.numPages) {
        state.currentPage += 1;
      }
    },

    previousPage(state) {
      if (state.currentPage > 1) {
        state.currentPage -= 1;
      }
    },

    zoomIn(state) {
      state.zoom = Math.min(state.zoom + 0.2, state.maxZoom);
    },

    zoomOut(state) {
      state.zoom = Math.max(state.zoom - 0.2, state.minZoom);
    },

    resetPdfViewer() {
      return initialState;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(loadPdf.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(loadPdf.fulfilled, (state, action) => {
        state.loading = false;
        state.file = action.payload.file;
      })

      .addCase(loadPdf.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setPdfFile,
  setNumPages,
  setCurrentPage,
  nextPage,
  previousPage,
  zoomIn,
  zoomOut,
  resetPdfViewer,
} = pdfViewerSlice.actions;

export default pdfViewerSlice.reducer;
