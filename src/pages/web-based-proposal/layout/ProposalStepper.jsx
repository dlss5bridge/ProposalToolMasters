import { ChevronLeft, ChevronRight, Check } from "lucide-react";

export default function ProposalStepper({
  theme,
  steps = [],
  activeStep = 0,
  onPrevious,
  onNext,
}) {
  const isFirstStep = activeStep === 0;
  const isLastStep = activeStep === steps.length - 1;

  return (
    <div className="grid grid-cols-[90px_1fr_90px] items-center gap-4">
      {/* Back */}
      <button
        onClick={onPrevious}
        disabled={isFirstStep}
        className="flex h-9 items-center justify-center gap-1 rounded-md border text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-40"
        style={{
          borderColor: theme.border,
          color: theme.textPrimary,
          background: "#fff",
        }}
      >
        <ChevronLeft size={16} />
        Back
      </button>

      {/* Steps */}
      <div className="flex items-center justify-center gap-5 overflow-hidden">
        {steps.map((step, index) => {
          const active = index === activeStep;
          const completed = index < activeStep;

          return (
            <div
              key={step}
              className="flex items-center gap-2 whitespace-nowrap"
            >
              <div
                className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-all"
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

      {/* Next */}
      <button
        onClick={onNext}
        className="flex h-9 items-center justify-center gap-1 rounded-md text-sm font-medium text-white transition hover:opacity-90"
        style={{
          background: theme.primary,
        }}
      >
        {isLastStep ? "Finish" : "Next"}
        {!isLastStep && <ChevronRight size={16} />}
      </button>
    </div>
  );
}
