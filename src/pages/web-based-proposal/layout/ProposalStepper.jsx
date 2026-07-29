import { useEffect, useRef, useState } from "react";
import { Check, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  initializeStepper,
  updateTotalSteps,
  selectActiveStep,
  selectMaxVisitedStep,
  selectTotalSteps,
} from "../../../redux/reducer/webProposal/stepper";
import {
  handleGoToStep,
  handleNextStep,
  handlePreviousStep,
} from "../../../redux/reducer/webProposal/stepper/stepperThunk";

// `onNext`, if provided, is called with the current step index before the
// stepper advances. It may run async work (e.g. fetching data that decides
// whether a step should be inserted) and return `false` to block advancing.
export default function ProposalStepper({ theme, steps = [], onNext }) {
  const dispatch = useDispatch();

  const activeStep = useSelector(selectActiveStep);
  const maxVisitedStep = useSelector(selectMaxVisitedStep);
  const totalSteps = useSelector(selectTotalSteps);
  const isInitialized = useRef(false);
  const [isAdvancing, setIsAdvancing] = useState(false);

  useEffect(() => {
    if (!isInitialized.current) {
      dispatch(initializeStepper(steps.length));
      isInitialized.current = true;
    } else {
      // The step count can change later on (e.g. an "Additional Information"
      // step gets inserted) — this must not reset activeStep/maxVisitedStep.
      dispatch(updateTotalSteps(steps.length));
    }
  }, [dispatch, steps.length]);

  const isFirstStep = activeStep === 0;
  const isLastStep = activeStep === totalSteps - 1;

  const handleStepClick = (index) => {
    if (index <= maxVisitedStep) {
      dispatch(handleGoToStep(index));
    }
  };

  const handleNext = async () => {
    if (onNext) {
      setIsAdvancing(true);
      let canProceed;
      try {
        canProceed = await onNext(activeStep);
      } finally {
        setIsAdvancing(false);
      }
      if (canProceed === false) return;
    }
    dispatch(handleNextStep());
  };

  return (
    <div className="grid grid-cols-[90px_1fr_90px] items-center gap-4">
      {/* Back Button */}
      <button
        onClick={() => dispatch(handlePreviousStep())}
        disabled={isFirstStep}
        className="flex h-9 items-center justify-center gap-1 rounded-md border text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-40"
        style={{
          borderColor: theme.border,
          color: theme.textPrimary,
          backgroundColor: "#fff",
        }}
      >
        <ChevronLeft size={16} />
        Back
      </button>

      {/* Steps */}
      {/* Center */}
      <div className="flex items-center justify-center overflow-hidden">
        {/* Mobile */}
        <div className="flex flex-col items-center lg:hidden">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold"
            style={{
              backgroundColor: theme.primary,
              color: "#fff",
            }}
          >
            {activeStep + 1}
          </div>

          <span
            className="mt-1 text-sm font-semibold"
            style={{
              color: theme.primary,
            }}
          >
            {steps[activeStep]}
          </span>

          <span
            className="text-xs"
            style={{
              color: theme.textSecondary,
            }}
          >
            Step {activeStep + 1} of {steps.length}
          </span>
        </div>

        {/* Desktop */}
        <div className="hidden items-center justify-center gap-5 lg:flex">
          {steps.map((step, index) => {
            const active = index === activeStep;
            const completed = index < maxVisitedStep;
            const clickable = index <= maxVisitedStep;

            return (
              <div
                key={step}
                onClick={() => handleStepClick(index)}
                className={`flex items-center gap-2 whitespace-nowrap ${
                  clickable ? "cursor-pointer" : "cursor-not-allowed opacity-40"
                }`}
              >
                <div
                  className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold"
                  style={{
                    backgroundColor: completed
                      ? theme.completedStepBackground
                      : active
                        ? theme.primary
                        : "#fff",

                    border: `2px solid ${
                      completed
                        ? theme.completedStepBackground
                        : active
                          ? theme.primary
                          : theme.border
                    }`,

                    color: completed || active ? "#fff" : theme.textSecondary,
                  }}
                >
                  {completed ? <Check size={13} /> : index + 1}
                </div>

                <span
                  className="text-[13px] font-medium"
                  style={{
                    color: active
                      ? theme.primary
                      : completed
                        ? theme.completedStepBackground
                        : theme.textSecondary,
                  }}
                >
                  {step}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Next Button */}
      <button
        onClick={handleNext}
        disabled={isLastStep || isAdvancing}
        className="flex h-9 items-center justify-center gap-1 rounded-md text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-40"
        style={{
          backgroundColor: theme.primary,
        }}
      >
        {isAdvancing ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <>
            {isLastStep ? "Finish" : "Next"}
            {!isLastStep && <ChevronRight size={16} />}
          </>
        )}
      </button>
    </div>
  );
}

// import { useEffect } from "react";
// import { Check, ChevronLeft, ChevronRight } from "lucide-react";
// import { useDispatch, useSelector } from "react-redux";
// import {
//   initializeStepper,
//   selectActiveStep,
//   selectMaxVisitedStep,
//   selectTotalSteps,
// } from "../../../redux/reducer/webProposal/stepper";
// import {
//   handleGoToStep,
//   handleNextStep,
//   handlePreviousStep,
// } from "../../../redux/reducer/webProposal/stepper/stepperThunk";

// export default function ProposalStepper({ theme, steps = [] }) {
//   const dispatch = useDispatch();

//   const activeStep = useSelector(selectActiveStep);
//   const maxVisitedStep = useSelector(selectMaxVisitedStep);
//   const totalSteps = useSelector(selectTotalSteps);

//   useEffect(() => {
//     dispatch(initializeStepper(steps.length));
//   }, [dispatch, steps.length]);

//   const isFirstStep = activeStep === 0;
//   const isLastStep = activeStep === totalSteps - 1;

//   const handleStepClick = (index) => {
//     if (index <= maxVisitedStep) {
//       dispatch(handleGoToStep(index));
//     }
//   };

//   return (
//     <div className="grid grid-cols-[90px_1fr_90px] items-center gap-4">
//       {/* Back Button */}
//       <button
//         onClick={() => dispatch(handlePreviousStep())}
//         disabled={isFirstStep}
//         className="flex h-9 items-center justify-center gap-1 rounded-md border text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-40"
//         style={{
//           borderColor: theme.border,
//           color: theme.textPrimary,
//           backgroundColor: "#fff",
//         }}
//       >
//         <ChevronLeft size={16} />
//         Back
//       </button>

//       {/* Steps */}
//       <div className="flex items-center justify-center gap-5 overflow-hidden">
//         {steps.map((step, index) => {
//           const active = index === activeStep;
//           const completed = index < maxVisitedStep;
//           const clickable = index <= maxVisitedStep;

//           return (
//             <div
//               key={step}
//               onClick={() => handleStepClick(index)}
//               className={`flex items-center gap-2 whitespace-nowrap transition-all ${
//                 clickable ? "cursor-pointer" : "cursor-not-allowed opacity-40"
//               }`}
//             >
//               <div
//                 className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-all duration-200"
//                 style={{
//                   backgroundColor: completed
//                     ? theme.completedStepBackground
//                     : active
//                       ? theme.primary
//                       : "#fff",

//                   border: `2px solid ${
//                     completed
//                       ? theme.completedStepBackground
//                       : active
//                         ? theme.primary
//                         : theme.border
//                   }`,

//                   color: completed || active ? "#fff" : theme.textSecondary,
//                 }}
//               >
//                 {completed ? <Check size={13} /> : index + 1}
//               </div>

//               <span
//                 className="text-[13px] font-medium"
//                 style={{
//                   color: active
//                     ? theme.primary
//                     : completed
//                       ? theme.completedStepBackground
//                       : theme.textSecondary,
//                 }}
//               >
//                 {step}
//               </span>
//             </div>
//           );
//         })}
//       </div>

//       {/* Next Button */}
//       <button
//         onClick={() => dispatch(handleNextStep())}
//         disabled={isLastStep}
//         className="flex h-9 items-center justify-center gap-1 rounded-md text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-40"
//         style={{
//           backgroundColor: theme.primary,
//         }}
//       >
//         {isLastStep ? "Finish" : "Next"}

//         {!isLastStep && <ChevronRight size={16} />}
//       </button>
//     </div>
//   );
// }
