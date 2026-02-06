import { useEffect } from "react";
import {
  DEFAULT_SETUP_STEPS,
  ProgressTracker,
} from "@/shared/components/ProgressTracker";
import { useProjectStore } from "@/shared/stores/useProjectStore";
import { AlgorithmsStep } from "./components/algorithms/AlgorithmsStep";
import { DataProcessingStep } from "./components/data-processing/DataProcessingStep";
import { DatasetsStep } from "./components/datasets/DatasetsStep";
import { ExperimentsStep } from "./components/experiments/ExperimentsStep";
import { ProjectInfoStep } from "./components/project-setup/ProjectInfoStep";
import { ReportStep } from "./components/report/ReportStep";
import { SaveStep } from "./components/sync/SyncStep";
import { WorkflowStep } from "./components/workflow/WorkflowStep";
import { useProjectWizardStore } from "./stores/useProjectWizardStore";

export default function ProjectWizardPage() {
  const { currentStep, nextStep, prevStep, totalSteps, mode, loadFromBackend } =
    useProjectWizardStore();
  const { projectName, projectPath, projectDescription } = useProjectStore();

  // Initialize wizard with existing project data (only in edit mode)
  useEffect(() => {
    // Skip if in create mode - wizard data should stay empty
    if (mode === "create") {
      return;
    }

    // If we have existing project data, load it into wizard (edit mode)
    if (projectName && projectName !== "Loading...") {
      loadFromBackend({
        project_name: projectName,
        project_path: projectPath,
        project_description: projectDescription,
      });
    }
  }, [mode, projectName, projectPath, projectDescription, loadFromBackend]);

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
        return <SaveStep />;
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
      <div className="fixed md:relative top-0 left-0 right-0 z-40 shrink-0">
        <ProgressTracker
          steps={DEFAULT_SETUP_STEPS}
          currentStep={currentStep}
        />
      </div>

      <div className="h-[72px] sm:h-[90px] md:hidden shrink-0" />

      <div className="flex-1 relative flex items-start justify-center min-h-0">
        <div className="flex-1 overflow-y-auto overflow-x-hidden py-4 sm:py-6 flex justify-center min-h-0">
          <div className="w-full">{renderStepContent()}</div>
        </div>

      </div>

      {/* Fixed navigation arrows - stay in place when scrolling */}
      {canGoBack && (
        <button
          type="button"
          onClick={prevStep}
          className="group hidden lg:flex fixed left-4 lg:left-6 xl:left-8 top-1/2 -translate-y-1/2 w-[80px] h-[80px] lg:w-[100px] lg:h-[100px] xl:w-[120px] xl:h-[120px] 2xl:w-[140px] 2xl:h-[140px] items-center justify-center z-10 cursor-pointer"
          aria-label="Previous step"
        >
          <div className="pointer-events-none absolute inset-0 -left-8 lg:-left-10 xl:-left-12 2xl:-left-[76px] -top-4 lg:-top-6 xl:-top-8 2xl:-top-12 -bottom-4 lg:-bottom-6 xl:-bottom-8 2xl:-bottom-12 arrow-glow-left opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <img
            src="/arrow-right.svg"
            alt="Previous"
            className="relative z-10 w-full h-full scale-[0.96] transition-transform duration-300 group-hover:scale-100 rotate-180"
          />
        </button>
      )}

      {/* Right Arrow - fixed position, responsive size */}
      {canGoNext && (
        <button
          type="button"
          onClick={nextStep}
          className="group hidden lg:flex fixed right-4 lg:right-6 xl:right-8 top-1/2 -translate-y-1/2 w-[80px] h-[80px] lg:w-[100px] lg:h-[100px] xl:w-[120px] xl:h-[120px] 2xl:w-[140px] 2xl:h-[140px] items-center justify-center z-10 cursor-pointer"
          aria-label="Next step"
        >
          <div className="pointer-events-none absolute inset-0 -right-8 lg:-right-10 xl:-right-12 2xl:-right-[76px] -top-4 lg:-top-6 xl:-top-8 2xl:-top-12 -bottom-4 lg:-bottom-6 xl:-bottom-8 2xl:-bottom-12 arrow-glow opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <img
            src="/arrow-right.svg"
            alt="Next"
            className="relative z-10 w-full h-full scale-[0.96] transition-transform duration-300 group-hover:scale-100"
          />
        </button>
      )}

      <div className="lg:hidden fixed bottom-24 md:bottom-6 left-4 md:left-[76px] right-4 z-50 flex justify-between pointer-events-none">
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
            className="btn-add-hover pointer-events-auto flex items-center justify-center bg-[#006b4c] text-white px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg shadow-lg"
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
