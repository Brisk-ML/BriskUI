import {
  DEFAULT_SETUP_STEPS,
  ProgressTracker,
} from "@/shared/components/ProgressTracker";
import { AlgorithmsStep } from "./components/algorithms/AlgorithmsStep";
import { DataProcessingStep } from "./components/data-processing/DataProcessingStep";
import { DatasetsStep } from "./components/datasets/DatasetsStep";
import { ExperimentsStep } from "./components/experiments/ExperimentsStep";
import { ProjectInfoStep } from "./components/project-setup/ProjectInfoStep";
import { ReportStep } from "./components/report/ReportStep";
import { SyncStep } from "./components/sync/SyncStep";
import { WorkflowStep } from "./components/workflow/WorkflowStep";
import { useProjectWizardStore } from "./stores/useProjectWizardStore";

export default function ProjectWizardPage() {
  const { currentStep, nextStep, prevStep, totalSteps } =
    useProjectWizardStore();

  // Render the step component based on current step number
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <ProjectInfoStep />;
      case 2:
        return <DatasetsStep />;
      case 3:
        return <DataProcessingStep />;
      case 4:
        return <AlgorithmsStep />;
      case 5:
        return <ExperimentsStep />;
      case 6:
        return <WorkflowStep />;
      case 7:
        return <ReportStep />;
      case 8:
        return <SyncStep />;
      default:
        return <ProjectInfoStep />;
    }
  };

  // Navigation controls - can't go back from step 1, can't go forward from last step
  const canGoBack = currentStep > 1;
  const canGoNext = currentStep < totalSteps;

  return (
    <div
      className="min-h-screen md:h-screen flex flex-col pb-24 md:pb-0"
      style={{
        background: "linear-gradient(-0.11deg, #121212 39.262%, #282828 107%)",
      }}
    >
      {/* Progress Tracker */}
      <div className="fixed md:relative top-0 left-0 right-0 z-40 shrink-0">
        <ProgressTracker
          steps={DEFAULT_SETUP_STEPS}
          currentStep={currentStep}
        />
      </div>

      {/* Spacer for fixed ProgressTracker on mobile */}
      <div className="h-[72px] sm:h-[90px] md:hidden shrink-0" />

      {/* Main Content */}
      <div className="flex-1 relative flex items-start justify-center overflow-y-auto overflow-x-hidden py-4 sm:py-6">
        {/* Left Arrow - Only show on 2xl+ screens */}
        {canGoBack && (
          <button
            type="button"
            onClick={prevStep}
            className="group hidden 2xl:flex absolute left-[76px] top-1/2 -translate-y-1/2 w-[200px] h-[200px] items-center justify-center z-10 cursor-pointer"
            aria-label="Previous step"
          >
            <div className="pointer-events-none absolute -inset-6 arrow-glow-left opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <img
              src="/arrow-right.svg"
              alt="Previous"
              className="relative z-10 h-[200px] w-[200px] scale-[0.96] transition-transform duration-300 group-hover:scale-100 rotate-180"
            />
          </button>
        )}

        {/* Step Content */}
        <div className="w-full">{renderStepContent()}</div>

        {/* Right Arrow - Only show on 2xl+ screens */}
        {canGoNext && (
          <button
            type="button"
            onClick={nextStep}
            className="group hidden 2xl:flex absolute right-[76px] top-1/2 -translate-y-1/2 w-[200px] h-[200px] items-center justify-center z-10 cursor-pointer"
            aria-label="Next step"
          >
            <div className="pointer-events-none absolute -inset-6 arrow-glow opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <img
              src="/arrow-right.svg"
              alt="Next"
              className="relative z-10 h-[200px] w-[200px] scale-[0.96] transition-transform duration-300 group-hover:scale-100"
            />
          </button>
        )}
      </div>

      {/* Mobile/Tablet Navigation Buttons */}
      <div className="2xl:hidden fixed bottom-24 md:bottom-6 left-4 md:left-[104px] right-4 z-50 flex justify-between pointer-events-none">
        {canGoBack ? (
          <button
            type="button"
            onClick={prevStep}
            className="pointer-events-auto flex items-center justify-center bg-[#282828] text-white px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg hover:bg-[#383838] transition-colors shadow-lg border border-[#404040]"
          >
            <img
              src="/arrow-right.svg"
              alt="Previous"
              className="w-4 h-4 sm:w-5 sm:h-5 rotate-180 mr-1.5 sm:mr-2"
            />
            <span className="text-xs sm:text-sm font-medium">Back</span>
          </button>
        ) : (
          <div />
        )}
        {canGoNext ? (
          <button
            type="button"
            onClick={nextStep}
            className="pointer-events-auto flex items-center justify-center bg-[#006b4c] text-white px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg hover:bg-[#005a3f] transition-colors shadow-lg"
          >
            <span className="text-xs sm:text-sm font-medium mr-1.5 sm:mr-2">
              Next
            </span>
            <img
              src="/arrow-right.svg"
              alt="Next"
              className="w-4 h-4 sm:w-5 sm:h-5"
            />
          </button>
        ) : (
          <div />
        )}
      </div>
    </div>
  );
}
