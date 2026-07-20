import reducer from "./stepperSlice";

export {
  initializeStepper,
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
