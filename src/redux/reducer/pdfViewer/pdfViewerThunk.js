import { createAsyncThunk } from "@reduxjs/toolkit";

/**
 * Future:
 * - Fetch PDF URL
 * - Generate signed URL
 * - Download PDF
 */
export const loadPdf = createAsyncThunk(
  "pdfViewer/loadPdf",
  async (_, thunkAPI) => {
    try {
      // const response = await PdfService.getPdf();

      return {
        file: null,
      };
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  },
);
