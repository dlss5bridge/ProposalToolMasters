export default function ProposalStepper({
  steps = [],
  activeStep = 0,
  onStepChange,
  clickable = true,
}) {
  if (!steps.length) return null;

  return (
    <div className="overflow-x-auto lg:overflow-x-hidden">
      <div className="flex lg:w-full lg:justify-between min-w-max lg:min-w-0 items-center px-4 py-3">
        {steps.map((step, index) => {
          const active = index === activeStep;
          const completed = index < activeStep;

          return (
            <div
              key={step}
              className="flex min-w-[150px] lg:min-w-0 lg:flex-1 justify-center"
            >
              <div
                className={`
              flex items-center gap-2 rounded-full px-3 py-2 transition-all duration-300
              ${
                active
                  ? "bg-blue-50"
                  : completed
                    ? "bg-emerald-50"
                    : "bg-transparent"
              }
            `}
              >
                {/* Number */}
                <div
                  className={`
                flex h-7 w-7 items-center justify-center rounded-full
                text-[11px] font-semibold
                ${
                  active
                    ? "bg-blue-600 text-white"
                    : completed
                      ? "bg-emerald-500 text-white"
                      : "bg-slate-200 text-slate-600"
                }
              `}
                >
                  {completed ? "✓" : index + 1}
                </div>

                {/* Title */}
                <span
                  className={`
                whitespace-nowrap text-[12px] font-medium
                ${
                  active
                    ? "text-blue-700"
                    : completed
                      ? "text-emerald-700"
                      : "text-slate-600"
                }
              `}
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
