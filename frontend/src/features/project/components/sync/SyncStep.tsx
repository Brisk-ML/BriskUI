import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, RefreshCw, Upload, AlertCircle, Loader2 } from "lucide-react";
import {
  writeDataFile,
  writeAlgorithmsFile,
  writeMetricsFile,
  writeSettingsFile,
  writeWorkflowFile,
  saveDatasets,
  switchToEditMode,
  type CategoricalFeaturesEntry,
  type StoredDatasetConfig,
  type StoredPreprocessorConfig,
} from "@/api";
import { Button } from "@/shared/components/ui/button";
import { useProjectWizardStore } from "@/features/project/stores/useProjectWizardStore";
import { useDataProcessingStepStore, type DatasetPreprocessors } from "@/features/project/stores/useDataProcessingStepStore";
import { useAlgorithmsStepStore } from "@/features/project/stores/useAlgorithmsStepStore";
import { useDatasetsStepStore } from "@/features/project/stores/useDatasetsStepStore";
import { useExperimentsStepStore } from "@/features/project/stores/useExperimentsStepStore";
import { useWorkflowStepStore } from "@/features/project/stores/useWorkflowStepStore";
import {
  useReportStepStore,
  BRISK_PLOT_SETTINGS_DEFAULTS,
} from "@/features/project/stores/useReportStepStore";
import { useProjectStore } from "@/shared/stores/useProjectStore";

export function SaveStep() {
  const navigate = useNavigate();
  const {
    mode,
    projectInfo,
    problemType,
    isDirty,
    isSyncing,
    syncError,
    syncProjectInfo,
    setStep,
    createdDirectoryName,
    createdProjectPath,
  } = useProjectWizardStore();
  const { baseDataManager, datasetConfigs } = useDataProcessingStepStore();
  const { wrappers } = useAlgorithmsStepStore();
  const { datasets } = useDatasetsStepStore();
  const { groups: experimentGroups } = useExperimentsStepStore();
  const { steps: workflowSteps } = useWorkflowStepStore();
  const { plotSettings, colors } = useReportStepStore();
  const { fetchProjectSettings } = useProjectStore();

  const [syncSuccess, setSyncSuccess] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSync = async () => {
    setSyncSuccess(false);
    setLocalError(null);
    try {
      // First save the project info (project.json file)
      await syncProjectInfo();
      
      // Then write the data.py file with BASE_DATA_MANAGER
      await writeDataFile({
        base_data_manager: {
          test_size: baseDataManager.testSize,
          n_splits: baseDataManager.nSplits,
          split_method: baseDataManager.splitMethod,
          group_column: baseDataManager.groupColumn,
          stratified: baseDataManager.stratified,
          random_state: baseDataManager.randomState,
        },
      });
      
      // Write algorithms.py if there are any algorithm wrappers
      if (wrappers.length > 0) {
        await writeAlgorithmsFile({
          wrappers: wrappers.map((w) => ({
            name: w.name,
            display_name: w.displayName,
            class_name: w.className,
            class_module: w.classModule,
            default_params: w.defaultParams as Record<string, string | number | boolean | null>,
            search_space: w.searchSpace || {},
            use_defaults: w.useDefaults,
          })),
        });
      }
      
      // Write workflow file (workflows/regression.py or workflows/classification.py)
      if (workflowSteps.length > 0) {
        await writeWorkflowFile({
          problem_type: problemType,
          steps: workflowSteps.map((s) => ({
            evaluator_id: s.evaluatorId,
            method_name: s.methodName,
            args: s.args,
          })),
        });
      }

      // Write default metrics.py based on problem type
      await writeMetricsFile({ problem_type: problemType });
      
      // Write settings.py with Configuration and experiment groups
      if (experimentGroups.length > 0) {
        // Brisk pipeline order: missing-data -> encoding -> scaling -> feature-selection
        const PREPROCESSOR_ORDER: Array<"missing-data" | "encoding" | "scaling" | "feature-selection"> = [
          "missing-data",
          "encoding",
          "scaling",
          "feature-selection",
        ];
        const PREPROCESSOR_KEYS: Record<string, keyof DatasetPreprocessors> = {
          "missing-data": "missingData",
          encoding: "encoding",
          scaling: "scaling",
          "feature-selection": "featureSelection",
        };

        // Build plot_settings with only non-default values
        const defs = BRISK_PLOT_SETTINGS_DEFAULTS;
        const primaryColor = colors.find((c) => c.id === "primary")?.color;
        const secondaryColor = colors.find((c) => c.id === "secondary")?.color;
        const accentColor = colors.find((c) => c.id === "accent")?.color;
        const plotSettingsPayload: {
          file_format?: string;
          transparent?: boolean;
          width?: number;
          height?: number;
          dpi?: number;
          primary_color?: string;
          secondary_color?: string;
          accent_color?: string;
        } = {};
        if (plotSettings.fileFormat !== defs.file_format) plotSettingsPayload.file_format = plotSettings.fileFormat;
        if (plotSettings.transparent !== defs.transparent) plotSettingsPayload.transparent = plotSettings.transparent;
        if (plotSettings.imageWidth !== defs.width && plotSettings.imageWidth > 0) plotSettingsPayload.width = plotSettings.imageWidth;
        if (plotSettings.imageHeight !== defs.height && plotSettings.imageHeight > 0) plotSettingsPayload.height = plotSettings.imageHeight;
        if (plotSettings.dpi !== defs.dpi && plotSettings.dpi > 0) plotSettingsPayload.dpi = plotSettings.dpi;
        if (primaryColor && primaryColor !== defs.primary_color) plotSettingsPayload.primary_color = primaryColor;
        if (secondaryColor && secondaryColor !== defs.secondary_color) plotSettingsPayload.secondary_color = secondaryColor;
        if (accentColor && accentColor !== defs.accent_color) plotSettingsPayload.accent_color = accentColor;
        const hasPlotSettings = Object.keys(plotSettingsPayload).length > 0;

        // Build categorical features mapping from datasets
        const categoricalFeatures: CategoricalFeaturesEntry[] = datasets
          .filter((d) => d.features.some((f) => f.categorical))
          .map((d) => ({
            dataset_file_name: d.fileName,
            table_name: d.tableName || null,
            features: d.features.filter((f) => f.categorical).map((f) => f.name),
          }));

        await writeSettingsFile({
          problem_type: problemType,
          default_algorithms: wrappers.map((w) => w.name),
          experiment_groups: experimentGroups.map((group) => {
            const datasetConfig = datasetConfigs[group.datasetId];
            const dm = datasetConfig?.dataManager;
            const preprocessorsObj = datasetConfig?.preprocessors;
            const configured = datasetConfig?.configuredPreprocessors ?? [];

            // Build preprocessors array in pipeline order
            const preprocessors: Array<{ type: "missing-data" | "scaling" | "encoding" | "feature-selection"; config: Record<string, unknown> }> = [];
            for (const type of PREPROCESSOR_ORDER) {
              if (!configured.includes(type)) continue;
              const key = PREPROCESSOR_KEYS[type];
              const config = key && preprocessorsObj?.[key];
              if (config && typeof config === "object") {
                preprocessors.push({
                  type,
                  config: config as unknown as Record<string, unknown>,
                });
              }
            }

            const hasDcParams =
              dm &&
              (dm.testSize !== undefined ||
                dm.nSplits !== undefined ||
                dm.splitMethod !== undefined ||
                dm.groupColumn !== undefined ||
                dm.stratified !== undefined ||
                dm.randomState !== undefined);

            return {
              name: group.name,
              description: group.description || undefined,
              dataset_file_name: group.datasetFileName,
              dataset_table_name: group.datasetTableName,
              algorithms: group.algorithms,
              use_default_data_manager: group.useDefaultDataManager,
              data_config:
                hasDcParams || preprocessors.length > 0
                  ? {
                      ...(hasDcParams && dm
                        ? {
                            test_size: dm.testSize,
                            n_splits: dm.nSplits,
                            split_method: dm.splitMethod,
                            group_column: dm.groupColumn,
                            stratified: dm.stratified,
                            random_state: dm.randomState,
                          }
                        : {}),
                      ...(preprocessors.length > 0 ? { preprocessors } : {}),
                    }
                  : undefined,
            };
          }),
          categorical_features: categoricalFeatures.length > 0 ? categoricalFeatures : undefined,
          plot_settings: hasPlotSettings ? plotSettingsPayload : undefined,
        });
      }
      
      // Save datasets to project.json for persistence
      if (datasets.length > 0) {
        const PREPROCESSOR_ORDER_DS: Array<"missing-data" | "encoding" | "scaling" | "feature-selection"> = [
          "missing-data", "encoding", "scaling", "feature-selection",
        ];
        const PREPROCESSOR_KEYS_DS: Record<string, keyof DatasetPreprocessors> = {
          "missing-data": "missingData",
          encoding: "encoding",
          scaling: "scaling",
          "feature-selection": "featureSelection",
        };

        const storedDatasets: StoredDatasetConfig[] = datasets.map((d) => {
          const dsConfig = datasetConfigs[d.id];
          const preprocessorsObj = dsConfig?.preprocessors;
          const configured = dsConfig?.configuredPreprocessors ?? [];

          const storedPreprocessors: StoredPreprocessorConfig[] = [];
          for (const type of PREPROCESSOR_ORDER_DS) {
            if (!configured.includes(type)) continue;
            const key = PREPROCESSOR_KEYS_DS[type];
            const config = key && preprocessorsObj?.[key];
            if (config && typeof config === "object") {
              storedPreprocessors.push({ type, config: config as unknown as Record<string, unknown> });
            }
          }

          return {
            id: d.id || d.fileName,
            file_name: d.fileName,
            table_name: d.tableName || null,
            file_type: d.fileType,
            target_feature: d.targetFeature,
            features_count: d.featuresCount,
            observations_count: d.observationsCount,
            features: d.features.map((f) => ({
              name: f.name,
              data_type: f.type,
              categorical: f.categorical,
            })),
            data_manager: dsConfig?.dataManager ? {
              test_size: dsConfig.dataManager.testSize,
              n_splits: dsConfig.dataManager.nSplits,
              split_method: dsConfig.dataManager.splitMethod,
              group_column: dsConfig.dataManager.groupColumn,
              stratified: dsConfig.dataManager.stratified,
              random_state: dsConfig.dataManager.randomState,
            } : null,
            preprocessors: storedPreprocessors,
          };
        });

        await saveDatasets({
          datasets: storedDatasets,
          base_data_manager: {
            test_size: baseDataManager.testSize,
            n_splits: baseDataManager.nSplits,
            split_method: baseDataManager.splitMethod,
            group_column: baseDataManager.groupColumn,
            stratified: baseDataManager.stratified,
            random_state: baseDataManager.randomState,
          },
        });
      }

      // Refresh the global project store after sync
      await fetchProjectSettings();
      setSyncSuccess(true);
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Sync failed");
    }
  };

  const handleGoToDashboard = async () => {
    // If in create mode and project was created, switch backend to edit mode
    if (mode === "create" && createdProjectPath) {
      try {
        await switchToEditMode(createdProjectPath);
        // Refresh project settings from the new path
        await fetchProjectSettings();
      } catch (err) {
        console.error("Failed to switch to edit mode:", err);
        // Continue to dashboard anyway
      }
    }
    navigate("/");
  };

  const isProjectInfoComplete = projectInfo.projectName.trim().length > 0;

  return (
    <div className="w-full max-w-[800px] px-4 xl:px-0 mx-auto">
      {/* Main Container */}
      <div className="bg-[#181818] border-2 border-[#404040] p-6 sm:p-8">
        {/* Header */}
        <div className="mb-8 sm:mb-10 text-center">
          <h1 className="h1-underline text-2xl sm:text-3xl lg:text-[36px] font-bold text-white font-display">
            {mode === "create" ? "Create Project" : "Save Project"}
          </h1>
        </div>

        {/* Status */}
        <div className="flex flex-col items-center gap-6 mb-8">
          {syncSuccess ? (
            <>
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-[#00a878] flex items-center justify-center">
                <Check className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
              </div>
              <p className="text-white text-xl sm:text-2xl font-display text-center">
                Project {mode === "create" ? "created" : "saved"} successfully!
              </p>
              {mode === "create" && createdDirectoryName && (
                <div className="text-center">
                  <p className="text-white/60 text-base font-display">
                    Created directory:{" "}
                    <span className="text-white font-mono">{createdDirectoryName}/</span>
                  </p>
                  {createdProjectPath && (
                    <p className="text-white/40 text-sm font-mono mt-1">
                      {createdProjectPath}
                    </p>
                  )}
                </div>
              )}
            </>
          ) : isProjectInfoComplete ? (
            <>
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-[#00a878] flex items-center justify-center">
                <Check className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
              </div>
              <p className="text-white text-xl sm:text-2xl font-display text-center">
                Your project is ready to {mode === "create" ? "create" : "save"}!
              </p>
              <p className="text-white/60 text-base sm:text-lg font-display text-center max-w-md">
                {mode === "create"
                  ? "Click the button below to create your project files."
                  : "Click the button below to save your changes."}
              </p>
            </>
          ) : (
            <>
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-yellow-600 flex items-center justify-center">
                <AlertCircle className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
              </div>
              <p className="text-white text-xl sm:text-2xl font-display text-center">
                Project information incomplete
              </p>
              <p className="text-white/60 text-base sm:text-lg font-display text-center max-w-md">
                Please go back and fill in the required project information.
              </p>
            </>
          )}
        </div>

        {/* Error Display */}
        {(syncError || localError) && (
          <div className="mb-8 p-4 bg-red-500/20 border border-red-500/50">
            <p className="text-red-400 text-sm font-display text-center">
              {syncError || localError}
            </p>
          </div>
        )}

        {/* Summary */}
        <div className="border border-[#404040] p-4 sm:p-6 mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-white font-display mb-4">
            Project Summary
          </h2>
          <div className="space-y-2 text-white/80 font-display text-base sm:text-lg">
            <p>
              • Project Name:{" "}
              <span className={projectInfo.projectName ? "text-white" : "text-white/40"}>
                {projectInfo.projectName || "Not set"}
              </span>
              {isDirty && <span className="text-yellow-500 ml-2">(unsaved)</span>}
            </p>
            <p>
              • Problem Type:{" "}
              <span className="text-white capitalize">
                {problemType}
              </span>
            </p>
            <p>
              • Project Path:{" "}
              <span className={projectInfo.projectPath ? "text-white" : "text-white/40"}>
                {projectInfo.projectPath || "Not set"}
              </span>
            </p>
            <p>
              • Description:{" "}
              <span className={projectInfo.projectDescription ? "text-white" : "text-white/40"}>
                {projectInfo.projectDescription
                  ? `${projectInfo.projectDescription.slice(0, 50)}${projectInfo.projectDescription.length > 50 ? "..." : ""}`
                  : "Not set"}
              </span>
            </p>
          </div>
        </div>

        {/* Data Manager Summary */}
        <div className="border border-[#404040] p-4 sm:p-6 mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-white font-display mb-4">
            Data Manager (data.py)
          </h2>
          <div className="space-y-2 text-white/80 font-display text-base sm:text-lg">
            <p>
              • Test Size: <span className="text-white">{Math.round(baseDataManager.testSize * 100)}%</span>
            </p>
            <p>
              • Split Method: <span className="text-white">{baseDataManager.splitMethod}</span>
            </p>
            <p>
              • Number of Splits: <span className="text-white">{baseDataManager.nSplits}</span>
            </p>
            <p>
              • Stratified: <span className="text-white">{baseDataManager.stratified ? "Yes" : "No"}</span>
            </p>
            <p>
              • Group Column:{" "}
              <span className={baseDataManager.groupColumn ? "text-white" : "text-white/40"}>
                {baseDataManager.groupColumn || "None"}
              </span>
            </p>
            <p>
              • Random State:{" "}
              <span className={baseDataManager.randomState !== null ? "text-white" : "text-white/40"}>
                {baseDataManager.randomState ?? "None"}
              </span>
            </p>
          </div>
        </div>

        {/* Algorithms Summary */}
        <div className="border border-[#404040] p-4 sm:p-6 mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-white font-display mb-4">
            Algorithms (algorithms.py)
          </h2>
          {wrappers.length === 0 ? (
            <p className="text-white/40 font-display text-base sm:text-lg">
              No algorithms configured. Add algorithms in the Algorithms step.
            </p>
          ) : (
            <div className="space-y-2 text-white/80 font-display text-base sm:text-lg">
              <p>
                • Total Algorithms: <span className="text-white">{wrappers.length}</span>
              </p>
              <div className="mt-3 space-y-1">
                {wrappers.map((wrapper) => (
                  <div key={wrapper.id} className="flex items-center gap-2">
                    <span className="text-[#00a878]">•</span>
                    <span className="text-white">{wrapper.displayName}</span>
                    <span className="text-white/40">({wrapper.className})</span>
                    {!wrapper.useDefaults && Object.keys(wrapper.defaultParams).length > 0 && (
                      <span className="text-yellow-500 text-sm">custom params</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Workflow Summary */}
        <div className="border border-[#404040] p-4 sm:p-6 mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-white font-display mb-4">
            Workflow (workflows/{problemType}.py)
          </h2>
          {workflowSteps.length === 0 ? (
            <p className="text-white/40 font-display text-base sm:text-lg">
              No workflow steps configured. Add evaluator steps in the Workflow step.
            </p>
          ) : (
            <div className="space-y-2 text-white/80 font-display text-base sm:text-lg">
              <p>
                • Class: <span className="text-white capitalize">{problemType}</span>
              </p>
              <p>
                • Steps: <span className="text-white">{workflowSteps.length}</span>
              </p>
              <div className="mt-3 space-y-1">
                {workflowSteps.map((step, i) => (
                  <div key={step.id} className="flex items-center gap-2">
                    <span className="text-white/40">{i + 1}.</span>
                    <span className="text-white">{step.methodName}</span>
                    {step.args.filename != null && (
                      <span className="text-white/40 text-sm">
                        ({String(step.args.filename)})
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Experiments Summary */}
        <div className="border border-[#404040] p-4 sm:p-6 mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-white font-display mb-4">
            Experiments (settings.py)
          </h2>
          {experimentGroups.length === 0 ? (
            <p className="text-white/40 font-display text-base sm:text-lg">
              No experiment groups configured. Add experiment groups in the Experiments step.
            </p>
          ) : (
            <div className="space-y-2 text-white/80 font-display text-base sm:text-lg">
              <p>
                • Workflow: <span className="text-white capitalize">{problemType}</span>
              </p>
              <p>
                • Default Algorithms: <span className="text-white">{wrappers.length}</span>
              </p>
              <p>
                • Experiment Groups: <span className="text-white">{experimentGroups.length}</span>
              </p>
              <div className="mt-3 space-y-2">
                {experimentGroups.map((group) => (
                  <div key={group.id} className="pl-2 border-l-2 border-[#404040]">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium">{group.name}</span>
                      {!group.useDefaultDataManager && (
                        <span className="text-yellow-500 text-sm">custom data config</span>
                      )}
                    </div>
                    <div className="text-white/40 text-sm">
                      Dataset: {group.datasetFileName}
                      {group.datasetTableName && ` (${group.datasetTableName})`}
                    </div>
                    <div className="text-white/40 text-sm">
                      Algorithms: {group.algorithms.join(", ")}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {syncSuccess ? (
            <Button
              onClick={handleGoToDashboard}
              className="btn-add-hover bg-[#006b4c] text-white h-[50px] px-8 text-lg font-display"
            >
              Go to Dashboard
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => setStep(1)}
                disabled={isSyncing}
                className="btn-cancel-hover border border-[#404040] bg-[#121212] text-white h-[50px] px-8 text-lg font-display"
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                Review Settings
              </Button>
              <Button
                onClick={handleSync}
                disabled={!isProjectInfoComplete || isSyncing}
                className="btn-add-hover bg-[#006b4c] text-white h-[50px] px-8 text-lg font-display disabled:opacity-50"
              >
                {isSyncing ? (
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <Upload className="w-5 h-5 mr-2" />
                )}
                {isSyncing
                  ? "Saving..."
                  : mode === "create"
                    ? "Create Project"
                    : "Save Now"}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
