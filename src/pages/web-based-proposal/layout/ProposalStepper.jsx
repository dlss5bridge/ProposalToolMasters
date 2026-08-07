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
//
// `onFinish`, if provided, is called instead of advancing once the last step
// is reached — the button switches from "Next" to `finishLabel` and becomes
// clickable. Without an `onFinish` handler the last-step button stays
// disabled, since there'd be nothing for it to do.
export default function ProposalStepper({
  theme,
  steps = [],
  onNext,
  onFinish,
  finishLabel = "Finish",
}) {
  const dispatch = useDispatch();

  const activeStep = useSelector(selectActiveStep);
  const maxVisitedStep = useSelector(selectMaxVisitedStep);
  const totalSteps = useSelector(selectTotalSteps);
  const isInitialized = useRef(false);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const activeStepRef = useRef(null);

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

  // Keep the active step centered so users swipe/scroll between steps rather
  // than hunting for the current one along a long, off-screen row.
  useEffect(() => {
    activeStepRef.current?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [activeStep]);

  const isFirstStep = activeStep === 0;
  const isLastStep = activeStep === totalSteps - 1;

  const handleStepClick = async (index) => {
    if (index === activeStep || index > maxVisitedStep || isAdvancing) return;

    // Jumping ahead from the step label must be validated the same way the
    // Next button is — otherwise a user can clear a required selection (e.g.
    // Services) on the current step and skip straight past it via the label.
    if (index > activeStep && onNext) {
      setIsAdvancing(true);
      let canProceed;
      try {
        canProceed = await onNext(activeStep);
      } finally {
        setIsAdvancing(false);
      }
      if (canProceed === false) return;
    }

    dispatch(handleGoToStep(index));
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

  const handleFinish = async () => {
    if (!onFinish) return;
    setIsAdvancing(true);
    try {
      await onFinish(activeStep);
    } finally {
      setIsAdvancing(false);
    }
  };

  // A single-step flow has nothing to step between — the back button and
  // step row would just be dead chrome, so show only the finish action.
  if (steps.length <= 1) {
    return (
      <div className="flex justify-end">
        <button
          onClick={handleFinish}
          disabled={isAdvancing || !onFinish}
          className="flex h-9 items-center justify-center gap-1 whitespace-nowrap rounded-md px-4 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-40"
          style={{
            backgroundColor: theme.primary,
          }}
        >
          {isAdvancing ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <>
              {finishLabel}
              <Check size={16} />
            </>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-[44px_1fr_minmax(44px,auto)] items-center gap-2 sm:grid-cols-[90px_1fr_minmax(90px,auto)] sm:gap-4">
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
        <span className="hidden sm:inline">Back</span>
      </button>

      {/* Steps */}
      {/* Center — a single horizontally scrollable row at every breakpoint, so
          steps that don't fit the available width stay reachable and clickable
          instead of being clipped or collapsed into a non-interactive summary. */}
      <div className="hide-scrollbar flex min-w-0 items-center gap-3 overflow-x-auto scroll-smooth px-1 py-1 sm:gap-5 lg:justify-center">
        {steps.map((step, index) => {
          const active = index === activeStep;
          const completed = index < maxVisitedStep;
          const clickable = index <= maxVisitedStep && !isAdvancing;

          return (
            <div
              key={step}
              ref={active ? activeStepRef : null}
              onClick={() => handleStepClick(index)}
              className={`flex flex-shrink-0 items-center gap-2 whitespace-nowrap ${
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

      {/* Next / Finish Button */}
      <button
        onClick={isLastStep ? handleFinish : handleNext}
        disabled={isAdvancing || (isLastStep && !onFinish)}
        className="flex h-9 items-center justify-center gap-1 whitespace-nowrap rounded-md px-2 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-40 sm:px-4"
        style={{
          backgroundColor: theme.primary,
        }}
      >
        {isAdvancing ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <>
            <span className="hidden sm:inline">
              {isLastStep ? finishLabel : "Next"}
            </span>
            {isLastStep ? (
              <Check size={16} className="sm:hidden" />
            ) : (
              <ChevronRight size={16} />
            )}
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
