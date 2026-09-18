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

// `onNext`, if provided, runs before advancing and can return `false` to
// block the step change (e.g. validation).
//
// `onFinish`, if provided, replaces "Next" with `finishLabel` on the last
// step. Without it the last-step button just stays disabled.
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
      // Step count can change later (e.g. an "Additional Information" step
      // gets inserted) — don't reset activeStep/maxVisitedStep when it does.
      dispatch(updateTotalSteps(steps.length));
    }
  }, [dispatch, steps.length]);

  // Keep the active step centered in the scrollable row.
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

    // Jumping via the step label needs the same validation as Next, otherwise
    // a required selection can be cleared and skipped past.
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
      // Run the last step's own validation before finishing, same as any other step.
      if (onNext) {
        const canProceed = await onNext(activeStep);
        if (canProceed === false) return;
      }
      await onFinish(activeStep);
    } finally {
      setIsAdvancing(false);
    }
  };

  // Single-step flow: no back/step row to show, just the finish action.
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

      {/* Steps: horizontally scrollable row so steps stay reachable when they
          don't all fit. */}
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
