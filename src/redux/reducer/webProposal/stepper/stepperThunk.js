import { goToStep, nextStep, previousStep } from "./stepperSlice";

export const handleNextStep = () => (dispatch) => {
  dispatch(nextStep());
};

export const handlePreviousStep = () => (dispatch) => {
  dispatch(previousStep());
};

export const handleGoToStep = (step) => (dispatch) => {
  dispatch(goToStep(step));
};
