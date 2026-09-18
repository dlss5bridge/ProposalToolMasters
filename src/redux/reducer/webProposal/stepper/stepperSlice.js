import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  activeStep: 0,
  maxVisitedStep: 0,
  totalSteps: 0,
};

const stepperSlice = createSlice({
  name: "stepper",

  initialState,

  reducers: {
    initializeStepper(state, action) {
      state.totalSteps = action.payload;
      state.activeStep = 0;
      state.maxVisitedStep = 0;
    },

    // Used when step count changes mid-flow (e.g. an "Additional
    // Information" step gets inserted once services are selected) —
    // unlike initializeStepper, this leaves activeStep/maxVisitedStep alone.
    updateTotalSteps(state, action) {
      state.totalSteps = action.payload;
    },

    nextStep(state) {
      if (state.activeStep < state.totalSteps - 1) {
        state.activeStep++;

        if (state.activeStep > state.maxVisitedStep) {
          state.maxVisitedStep = state.activeStep;
        }
      }
    },

    previousStep(state) {
      if (state.activeStep > 0) {
        state.activeStep--;
      }
    },

    goToStep(state, action) {
      const step = action.payload;

      if (step <= state.maxVisitedStep) {
        state.activeStep = step;
      }
    },

    resetStepper(state) {
      state.activeStep = 0;
      state.maxVisitedStep = 0;
    },
  },
});

export const {
  initializeStepper,
  updateTotalSteps,
  nextStep,
  previousStep,
  goToStep,
  resetStepper,
} = stepperSlice.actions;

export default stepperSlice.reducer;
