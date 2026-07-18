import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  activeStep: 0,
  steps: [],
  clickable: false,
};

const proposalStepperSlice = createSlice({
  name: "proposalStepper",

  initialState,

  reducers: {
    setSteps(state, action) {
      state.steps = action.payload || [];
      state.activeStep = 0;
    },

    setActiveStep(state, action) {
      state.activeStep = action.payload;
    },

    nextStep(state) {
      if (state.activeStep < state.steps.length - 1) {
        state.activeStep += 1;
      }
    },

    previousStep(state) {
      if (state.activeStep > 0) {
        state.activeStep -= 1;
      }
    },

    resetStepper(state) {
      state.activeStep = 0;
    },

    setStepperClickable(state, action) {
      state.clickable = action.payload;
    },
  },
});

export const {
  setSteps,
  setActiveStep,
  nextStep,
  previousStep,
  resetStepper,
  setStepperClickable,
} = proposalStepperSlice.actions;

export default proposalStepperSlice.reducer;
