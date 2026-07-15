export default function ProposalStepper({
  theme,
  steps = [],
  activeStep = 0,
  onStepChange,
  clickable = true,
}) {
  if (!steps.length) return null;

  return (
    <div className="overflow-x-auto lg:overflow-x-hidden">
      <div className="flex min-w-max items-center px-4 py-3 lg:min-w-0 lg:w-full lg:justify-between">
        {steps.map((step, index) => {
          const active = index === activeStep;
          const completed = index < activeStep;

          return (
            <div
              key={step}
              className="flex min-w-[150px] justify-center lg:min-w-0 lg:flex-1"
            >
              <div
                className="flex items-center gap-2 rounded-full px-3 py-2 transition-all duration-300"
                style={{
                  backgroundColor: active
                    ? `${theme.activeStepBackground}15`
                    : completed
                      ? `${theme.completedStepBackground}15`
                      : "transparent",
                }}
              >
                {/* Number */}
                <div
                  className="flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-semibold transition-all duration-300"
                  style={{
                    backgroundColor: active
                      ? theme.activeStepBackground
                      : completed
                        ? theme.completedStepBackground
                        : theme.inactiveStepBackground,
                    color:
                      active || completed
                        ? theme.activeStepText
                        : theme.inactiveStepText,
                  }}
                >
                  {completed ? "✓" : index + 1}
                </div>

                {/* Title */}
                <span
                  className="whitespace-nowrap text-[12px] font-medium transition-colors duration-300"
                  style={{
                    color: active
                      ? theme.activeStepLabel
                      : completed
                        ? theme.completedStepLabel
                        : theme.inactiveStepLabel,
                  }}
                >
                  {step}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
