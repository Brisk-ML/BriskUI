import { useEffect, useState } from "react";
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
import { useDatasetsStepStore } from "./stores/useDatasetsStepStore";
import { useAlgorithmsStepStore } from "./stores/useAlgorithmsStepStore";
import { useExperimentsStepStore } from "./stores/useExperimentsStepStore";
import { useWorkflowStepStore } from "./stores/useWorkflowStepStore";

export default function ProjectWizardPage() {
  const { currentStep, nextStep, prevStep, totalSteps, mode, loadFromBackend, projectInfo, problemType } =
    useProjectWizardStore();
  const { projectName, projectPath, projectDescription } = useProjectStore();
  
  // Subscribe to stores for reactive validation
  const datasets = useDatasetsStepStore((s) => s.datasets);
  const algorithms = useAlgorithmsStepStore((s) => s.wrappers);
  const experimentGroups = useExperimentsStepStore((s) => s.groups);
  const workflowSteps = useWorkflowStepStore((s) => s.steps);
  
  // Force re-render when validation-relevant data changes
  const [, setRenderTrigger] = useState(0);
  useEffect(() => {
    setRenderTrigger((v) => v + 1);
  }, [datasets.length, algorithms.length, experimentGroups.length, workflowSteps.length, projectInfo.projectName, problemType]);

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

  // Step validation function
  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 1: // Project Setup - Name required (problemType always has a default value)
        return projectInfo.projectName.trim() !== "";
      
      case 2: // Datasets - At least one dataset required
        return datasets.length > 0;
      
      case 3: // Data Processing - No required fields
        return true;
      
      case 4: // Algorithms - At least one algorithm required
        return algorithms.length > 0;
      
      case 5: // Experiments - At least one experiment group required
        return experimentGroups.length > 0;
      
      case 6: // Workflow - At least one evaluator required
        return workflowSteps.length > 0;
      
      case 7: // Report - No required fields
        return true;
      
      case 8: // Save - No validation needed
        return true;
      
      default:
        return true;
    }
  };

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
  // Also can't go forward if current step is invalid
  const canGoBack = currentStep > 1;
  const canGoNext = currentStep < totalSteps && isStepValid(currentStep);

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
          className="group hidden lg:flex fixed left-0 top-1/2 -translate-y-1/2 w-[160px] h-[300px] lg:w-[200px] lg:h-[400px] xl:w-[220px] xl:h-[500px] 2xl:w-[260px] 2xl:h-[600px] items-center justify-start z-10 cursor-pointer overflow-visible"
          aria-label="Previous step"
        >
          {/* Blue glow coming from off-screen left */}
          <div className="pointer-events-none absolute -left-[180px] top-1/2 -translate-y-1/2 w-[600px] h-[600px] lg:w-[750px] lg:h-[750px] xl:w-[900px] xl:h-[900px] arrow-glow-left opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <img
            src="/arrow-right.svg"
            alt="Previous"
            className="relative z-10 w-[60px] h-[60px] lg:w-[80px] lg:h-[80px] xl:w-[100px] xl:h-[100px] 2xl:w-[120px] 2xl:h-[120px] ml-4 lg:ml-6 scale-[0.96] transition-transform duration-300 group-hover:scale-100 rotate-180"
          />
        </button>
      )}

      {/* Right Arrow - fixed position, responsive size */}
      {/* Show when not last step, but visually indicate if disabled */}
      {currentStep < totalSteps && (
        <button
          type="button"
          onClick={canGoNext ? nextStep : undefined}
          disabled={!canGoNext}
          className={`group hidden lg:flex fixed right-0 top-1/2 -translate-y-1/2 w-[160px] h-[300px] lg:w-[200px] lg:h-[400px] xl:w-[220px] xl:h-[500px] 2xl:w-[260px] 2xl:h-[600px] items-center justify-end z-10 overflow-visible ${
            canGoNext ? "cursor-pointer" : "cursor-not-allowed"
          }`}
          aria-label="Next step"
          aria-disabled={!canGoNext}
        >
          {/* Blue glow coming from off-screen right */}
          <div className={`pointer-events-none absolute -right-[180px] top-1/2 -translate-y-1/2 w-[600px] h-[600px] lg:w-[750px] lg:h-[750px] xl:w-[900px] xl:h-[900px] arrow-glow opacity-0 transition-opacity duration-300 ${canGoNext ? "group-hover:opacity-100" : ""}`} />
          <img
            src="/arrow-right.svg"
            alt="Next"
            className={`relative z-10 w-[60px] h-[60px] lg:w-[80px] lg:h-[80px] xl:w-[100px] xl:h-[100px] 2xl:w-[120px] 2xl:h-[120px] mr-4 lg:mr-6 transition-all duration-300 ${
              canGoNext 
                ? "scale-[0.96] group-hover:scale-100 opacity-100" 
                : "scale-[0.90] opacity-30"
            }`}
          />
        </button>
      )}

      <div className="lg:hidden fixed bottom-24 md:bottom-6 left-4 md:left-[76px] right-4 z-50 flex justify-between pointer-events-none">
        {canGoBack ? (
          <button
            type="button"
            onClick={prevStep}
            className="pointer-events-auto flex items-center justify-center bg-[#282828] text-white px-3 sm:px-4 py-2.5 sm:py-3 hover:bg-[#383838] transition-colors shadow-lg border border-[#404040]"
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
        {currentStep < totalSteps ? (
          <button
            type="button"
            onClick={canGoNext ? nextStep : undefined}
            disabled={!canGoNext}
            className={`pointer-events-auto flex items-center justify-center px-3 sm:px-4 py-2.5 sm:py-3 shadow-lg transition-all ${
              canGoNext 
                ? "btn-add-hover bg-[#006b4c] text-white" 
                : "bg-[#404040] text-white/50 cursor-not-allowed"
            }`}
          >
            <span className="text-xs sm:text-sm font-medium mr-1.5 sm:mr-2">
              Next
            </span>
            <img
              src="/arrow-right.svg"
              alt="Next"
              className={`w-4 h-4 sm:w-5 sm:h-5 ${!canGoNext ? "opacity-50" : ""}`}
            />
          </button>
        ) : (
          <div />
        )}
      </div>
    </div>
  );
}
