import reducer from "./stepperSlice";

export {
  initializeStepper,
  updateTotalSteps,
  nextStep,
  previousStep,
  goToStep,
  resetStepper,
} from "./stepperSlice";

export {
  selectActiveStep,
  selectMaxVisitedStep,
  selectTotalSteps,
} from "./stepperSelectors";

export default reducer;
