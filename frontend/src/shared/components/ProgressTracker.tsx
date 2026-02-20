import { Fragment } from "react";

export interface Step {
  number: number;
  label: string;
}

interface ProgressTrackerProps {
  steps: Step[];
  currentStep: number;
  className?: string;
}

export function ProgressTracker({
  steps,
  currentStep,
  className = "",
}: ProgressTrackerProps) {
  return (
    <div
      className={`bg-[#181818] px-3 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-3 sm:py-5 md:py-6 w-full max-w-full overflow-x-hidden ${className}`}
    >
      <div className="flex items-start w-full max-w-full overflow-x-auto pb-2 scrollbar-hide">
        <div className="flex items-start mx-auto">
          {steps.map((step, index) => {
            const isActive = step.number === currentStep;
            const isCompleted = step.number < currentStep;
            const isPending = step.number > currentStep;

            return (
              <Fragment key={step.number}>
                {/* Step */}
                <div className="flex flex-col items-center gap-1.5 sm:gap-2 md:gap-3 flex-shrink-0">
                  {/* Number Box */}
                  <div
                    className={`
                      w-[26px] h-[24px] sm:w-[36px] sm:h-[33px] lg:w-[38px] lg:h-[35px]
                      border border-white
                      flex items-center justify-center
                      text-white text-sm sm:text-lg lg:text-[24px]
                      font-display
                      transition-all duration-200
                      ${isCompleted ? "bg-[#00a878] opacity-100" : ""}
                      ${isActive ? "opacity-100" : ""}
                      ${isPending ? "opacity-40" : ""}
                    `}
                  >
                    {!isCompleted && step.number}
                  </div>

                  {/* Label */}
                  <span
                    className={`
                      text-white text-[10px] sm:text-sm lg:text-base xl:text-lg
                      font-display whitespace-nowrap
                      transition-opacity duration-200
                      ${isActive ? "opacity-100" : "opacity-40"}
                    `}
                  >
                    {step.label}
                  </span>
                </div>

                {index < steps.length - 1 && (
                  <div
                    className={`
                      h-[2px] w-[12px] sm:w-[24px] md:w-[32px] lg:w-[48px] xl:w-[60px] 2xl:w-[100px]
                      flex-shrink-0 transition-all duration-200 mx-0.5 sm:mx-1
                      mt-[11px] sm:mt-[15.5px] lg:mt-[16.5px]
                      ${isCompleted ? "bg-[#00a878]" : "bg-white opacity-40"}
                    `}
                  />
                )}
              </Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export const DEFAULT_SETUP_STEPS: Step[] = [
  { number: 1, label: "Project Setup" },
  { number: 2, label: "Datasets" },
  { number: 3, label: "Data Processing" },
  { number: 4, label: "Algorithms" },
  { number: 5, label: "Experiments" },
  { number: 6, label: "Workflow" },
  { number: 7, label: "Report" },
  { number: 8, label: "Save" },
];
