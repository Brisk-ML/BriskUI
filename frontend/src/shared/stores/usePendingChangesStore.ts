import { create } from "zustand";
import {
  writeSettingsFile,
  writeAlgorithmsFile,
  writeDataFile,
  writeWorkflowFile,
  saveDatasets,
  getExperimentsData,
  type ExperimentGroupConfig,
  type AlgorithmWrapperConfig,
  type ProblemType,
  type CategoricalFeaturesEntry,
  type DataManagerConfig as ApiDataManagerConfig,
  type PreprocessorEntry,
  type StoredDatasetConfig,
  type StoredPreprocessorConfig,
  type WorkflowStepConfig,
  type PreviewFilesRequest,
} from "@/api";
import type { Feature } from "@/types";
import { useDataProcessingStepStore, type DatasetPreprocessors } from "@/features/project/stores/useDataProcessingStepStore";

/**
 * Base data manager config for data.py
 */
export interface BaseDataManagerConfig {
  testSize: number;
  nSplits: number;
  splitMethod: "shuffle" | "kfold";
  groupColumn: string | null;
  stratified: boolean;
  randomState: number | null;
}

interface ExperimentGroupState {
  name: string;
  description: string;
  datasets: string[];
  algorithms: string[];
}

/**
 * Algorithm wrapper state for pending changes.
 * Mirrors WizardAlgorithmWrapper but used for standalone page.
 */
export interface AlgorithmWrapperState {
  id: string;
  algorithmId: string;
  name: string;
  displayName: string;
  className: string;
  classModule: string;
  defaultParams: Record<string, unknown>;
  searchSpace: Record<string, (string | number | boolean)[]>;
  useDefaults: boolean;
}

/**
 * Dataset state for pending changes.
 */
export interface DatasetState {
  id: string;
  name: string;
  fileName: string;
  tableName: string;
  fileType: "csv" | "xlsx" | "sqlite";
  targetFeature: string;
  featuresCount: number;
  observationsCount: number;
  features: Feature[];
}

/**
 * Workflow step state for pending changes.
 */
export interface WorkflowStepState {
  id: string;
  evaluatorId: string;
  methodName: string;
  args: Record<string, unknown>;
}

type LoadedSection = "experiments" | "algorithms" | "datasets" | "workflow";

interface PendingChangesState {
  // Pending experiment groups to save
  experimentGroups: ExperimentGroupState[];
  defaultAlgorithms: string[];
  problemType: ProblemType;
  
  // Pending algorithm wrappers to save
  algorithmWrappers: AlgorithmWrapperState[];
  
  // Pending datasets to save
  datasets: DatasetState[];
  
  // Base data manager config (for data.py)
  baseDataManager: BaseDataManagerConfig;
  
  // Pending workflow steps to save
  workflowSteps: WorkflowStepState[];

  // Tracks which sections have been populated from the backend
  loadedSections: Set<LoadedSection>;
  
  // Track if there are unsaved changes
  hasChanges: boolean;
  
  // Saving state
  isSaving: boolean;
  saveError: string | null;
  
  // Experiment group actions
  setExperimentGroups: (groups: ExperimentGroupState[]) => void;
  addExperimentGroup: (group: ExperimentGroupState) => void;
  removeExperimentGroup: (name: string) => void;
  setDefaultAlgorithms: (algorithms: string[]) => void;
  setProblemType: (type: ProblemType) => void;
  
  // Algorithm wrapper actions
  setAlgorithmWrappers: (wrappers: AlgorithmWrapperState[]) => void;
  addAlgorithmWrapper: (wrapper: Omit<AlgorithmWrapperState, "id">) => { success: boolean; error?: string };
  updateAlgorithmWrapper: (id: string, updates: Partial<AlgorithmWrapperState>) => { success: boolean; error?: string };
  deleteAlgorithmWrapper: (id: string) => void;
  isAlgorithmNameUnique: (name: string, excludeId?: string) => boolean;
  getAlgorithmWrapperByName: (name: string) => AlgorithmWrapperState | undefined;
  
  // Dataset actions
  setDatasets: (datasets: DatasetState[]) => void;
  addDataset: (dataset: DatasetState) => void;
  updateDataset: (id: string, updates: Partial<DatasetState>) => void;
  removeDataset: (id: string) => void;
  
  // Base data manager actions
  setBaseDataManager: (config: BaseDataManagerConfig) => void;
  updateBaseDataManager: (updates: Partial<BaseDataManagerConfig>) => void;
  
  // Workflow step actions
  setWorkflowSteps: (steps: WorkflowStepState[]) => void;
  addWorkflowStep: (step: Omit<WorkflowStepState, "id">) => void;
  removeWorkflowStep: (id: string) => void;
  moveWorkflowStep: (id: string, direction: "up" | "down") => void;
  
  markChanged: () => void;
  markSectionLoaded: (section: LoadedSection) => void;
  
  // Build the payload for the preview endpoint (same data shape as saveAll sends)
  buildPreviewPayload: () => PreviewFilesRequest;
  
  // Save all pending changes
  saveAll: () => Promise<void>;
  
  // Reset
  reset: () => void;
}

const DEFAULT_BASE_DATA_MANAGER: BaseDataManagerConfig = {
  testSize: 0.2,
  nSplits: 5,
  splitMethod: "shuffle",
  groupColumn: null,
  stratified: false,
  randomState: null,
};

const initialState = {
  experimentGroups: [],
  defaultAlgorithms: [],
  problemType: "classification" as ProblemType,
  algorithmWrappers: [],
  datasets: [] as DatasetState[],
  baseDataManager: { ...DEFAULT_BASE_DATA_MANAGER },
  workflowSteps: [] as WorkflowStepState[],
  loadedSections: new Set<LoadedSection>(),
  hasChanges: false,
  isSaving: false,
  saveError: null,
};

export const usePendingChangesStore = create<PendingChangesState>()((set, get) => ({
  ...initialState,

  // Experiment group actions
  setExperimentGroups: (groups) => {
    set({ experimentGroups: groups });
    // Note: don't mark as changed when initializing from backend
  },

  addExperimentGroup: (group) => {
    set((state) => ({
      experimentGroups: [...state.experimentGroups, group],
      hasChanges: true,
    }));
  },

  removeExperimentGroup: (name) => {
    set((state) => ({
      experimentGroups: state.experimentGroups.filter((g) => g.name !== name),
      hasChanges: true,
    }));
  },

  setDefaultAlgorithms: (algorithms) => {
    set({ defaultAlgorithms: algorithms });
    // Note: don't mark as changed when initializing from backend
  },

  setProblemType: (type) => {
    set({ problemType: type });
    // Note: don't mark as changed when syncing from project store
  },

  // Algorithm wrapper actions
  setAlgorithmWrappers: (wrappers) => {
    set({ algorithmWrappers: wrappers });
    // Note: don't mark as changed when initializing from backend
  },

  addAlgorithmWrapper: (wrapper) => {
    const { isAlgorithmNameUnique } = get();
    
    if (!isAlgorithmNameUnique(wrapper.name)) {
      return {
        success: false,
        error: `An algorithm with name "${wrapper.name}" already exists. Each algorithm must have a unique name.`,
      };
    }

    const newWrapper: AlgorithmWrapperState = {
      ...wrapper,
      id: `wrapper-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };

    set((state) => ({
      algorithmWrappers: [...state.algorithmWrappers, newWrapper],
      hasChanges: true,
    }));

    return { success: true };
  },

  updateAlgorithmWrapper: (id, updates) => {
    const { isAlgorithmNameUnique } = get();

    if (updates.name && !isAlgorithmNameUnique(updates.name, id)) {
      return {
        success: false,
        error: `An algorithm with name "${updates.name}" already exists. Each algorithm must have a unique name.`,
      };
    }

    set((state) => ({
      algorithmWrappers: state.algorithmWrappers.map((w) =>
        w.id === id ? { ...w, ...updates } : w
      ),
      hasChanges: true,
    }));

    return { success: true };
  },

  deleteAlgorithmWrapper: (id) => {
    set((state) => ({
      algorithmWrappers: state.algorithmWrappers.filter((w) => w.id !== id),
      hasChanges: true,
    }));
  },

  isAlgorithmNameUnique: (name, excludeId) => {
    const { algorithmWrappers } = get();
    const normalizedName = name.toLowerCase().trim();
    return !algorithmWrappers.some(
      (w) => w.id !== excludeId && w.name.toLowerCase().trim() === normalizedName
    );
  },

  getAlgorithmWrapperByName: (name) => {
    const { algorithmWrappers } = get();
    const normalizedName = name.toLowerCase().trim();
    return algorithmWrappers.find((w) => w.name.toLowerCase().trim() === normalizedName);
  },

  // Dataset actions
  setDatasets: (datasets) => {
    set({ datasets });
    // Note: don't mark as changed when initializing from backend
  },

  addDataset: (dataset) => {
    set((state) => ({
      datasets: [...state.datasets, dataset],
      hasChanges: true,
    }));
  },

  updateDataset: (id, updates) => {
    set((state) => ({
      datasets: state.datasets.map((d) =>
        d.id === id ? { ...d, ...updates } : d
      ),
      hasChanges: true,
    }));
  },

  removeDataset: (id) => {
    set((state) => ({
      datasets: state.datasets.filter((d) => d.id !== id),
      hasChanges: true,
    }));
  },

  // Base data manager actions
  setBaseDataManager: (config) => {
    set({ baseDataManager: config, hasChanges: true });
  },

  updateBaseDataManager: (updates) => {
    set((state) => ({
      baseDataManager: { ...state.baseDataManager, ...updates },
      hasChanges: true,
    }));
  },

  // Workflow step actions
  setWorkflowSteps: (steps) => {
    set({ workflowSteps: steps });
    // Note: don't mark as changed when initializing from backend
  },

  addWorkflowStep: (step) => {
    const newStep: WorkflowStepState = {
      ...step,
      id: `step-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    };
    set((state) => ({
      workflowSteps: [...state.workflowSteps, newStep],
      hasChanges: true,
    }));
  },

  removeWorkflowStep: (id) => {
    set((state) => ({
      workflowSteps: state.workflowSteps.filter((s) => s.id !== id),
      hasChanges: true,
    }));
  },

  moveWorkflowStep: (id, direction) => {
    set((state) => {
      const steps = [...state.workflowSteps];
      const idx = steps.findIndex((s) => s.id === id);
      if (idx < 0) return state;
      const newIdx = direction === "up" ? idx - 1 : idx + 1;
      if (newIdx < 0 || newIdx >= steps.length) return state;
      [steps[idx], steps[newIdx]] = [steps[newIdx], steps[idx]];
      return { workflowSteps: steps, hasChanges: true };
    });
  },

  markChanged: () => {
    set({ hasChanges: true });
  },

  markSectionLoaded: (section) => {
    set((state) => {
      const next = new Set(state.loadedSections);
      next.add(section);
      return { loadedSections: next };
    });
  },

  buildPreviewPayload: () => {
    const state = get();
    const { datasetConfigs } = useDataProcessingStepStore.getState();

    const PREPROCESSOR_ORDER: Array<"missing-data" | "encoding" | "scaling" | "feature-selection"> = [
      "missing-data", "encoding", "scaling", "feature-selection",
    ];
    const PREPROCESSOR_KEYS: Record<string, keyof DatasetPreprocessors> = {
      "missing-data": "missingData",
      encoding: "encoding",
      scaling: "scaling",
      "feature-selection": "featureSelection",
    };

    const getDatasetIdFromFileName = (fileName: string): string => {
      const dataset = state.datasets.find(d => {
        if (d.fileType === "sqlite" && d.tableName) {
          return d.id === `${d.fileName}:${d.tableName}` || d.fileName === fileName;
        }
        if (d.id === fileName || d.fileName === fileName) return true;
        const fileNameWithoutExt = d.fileName.replace(/\.[^/.]+$/, "");
        return fileNameWithoutExt === fileName;
      });
      return dataset?.id || fileName;
    };

    const baseDataManagerConfig: ApiDataManagerConfig = {
      test_size: state.baseDataManager.testSize,
      n_splits: state.baseDataManager.nSplits,
      split_method: state.baseDataManager.splitMethod,
      group_column: state.baseDataManager.groupColumn,
      stratified: state.baseDataManager.stratified,
      random_state: state.baseDataManager.randomState,
    };

    const algorithmConfigs: AlgorithmWrapperConfig[] = state.algorithmWrappers.map((w) => ({
      name: w.name,
      display_name: w.displayName,
      class_name: w.className,
      class_module: w.classModule,
      default_params: w.defaultParams as Record<string, string | number | boolean | null>,
      search_space: w.searchSpace || {},
      use_defaults: w.useDefaults,
    }));

    const experimentGroupConfigs: ExperimentGroupConfig[] = state.experimentGroups.map((g) => {
      const datasetFileName = g.datasets[0] || "";
      const datasetId = getDatasetIdFromFileName(datasetFileName);
      const datasetConfig = datasetConfigs[datasetId];
      const dm = datasetConfig?.dataManager;
      const preprocessorsObj = datasetConfig?.preprocessors;
      const configured = datasetConfig?.configuredPreprocessors ?? [];
      const preprocessors: PreprocessorEntry[] = [];
      for (const type of PREPROCESSOR_ORDER) {
        if (!configured.includes(type)) continue;
        const key = PREPROCESSOR_KEYS[type];
        const config = key && preprocessorsObj?.[key];
        if (config && typeof config === "object") {
          preprocessors.push({ type, config: config as unknown as Record<string, unknown> });
        }
      }
      const hasDcParams = dm && (dm.testSize !== undefined || dm.nSplits !== undefined ||
        dm.splitMethod !== undefined || dm.groupColumn !== undefined ||
        dm.stratified !== undefined || dm.randomState !== undefined);
      const useDefaultDataManager = !hasDcParams && preprocessors.length === 0;
      return {
        name: g.name,
        description: g.description || undefined,
        dataset_file_name: datasetFileName,
        dataset_table_name: null,
        algorithms: g.algorithms,
        use_default_data_manager: useDefaultDataManager,
        data_config: hasDcParams || preprocessors.length > 0
          ? {
              ...(hasDcParams && dm ? {
                test_size: dm.testSize, n_splits: dm.nSplits,
                split_method: dm.splitMethod, group_column: dm.groupColumn,
                stratified: dm.stratified, random_state: dm.randomState,
              } : {}),
              ...(preprocessors.length > 0 ? { preprocessors } : {}),
            }
          : undefined,
      };
    });

    const categoricalFeatures: CategoricalFeaturesEntry[] = state.datasets
      .filter((d) => d.features.some((f) => f.categorical))
      .map((d) => ({
        dataset_file_name: d.fileName,
        table_name: d.fileType === "sqlite" && d.tableName ? d.tableName : null,
        features: d.features.filter((f) => f.categorical).map((f) => f.name),
      }));

    const algorithmNames = state.algorithmWrappers.map((w) => w.name);

    const workflowStepConfigs: WorkflowStepConfig[] = state.workflowSteps.map((s) => ({
      evaluator_id: s.evaluatorId,
      method_name: s.methodName,
      args: s.args,
    }));

    const loaded = state.loadedSections;
    const payload: PreviewFilesRequest = {};

    if (loaded.has("datasets")) {
      payload.data_file = { base_data_manager: baseDataManagerConfig };
    }

    if (loaded.has("experiments")) {
      payload.settings_file = {
        problem_type: state.problemType,
        default_algorithms: algorithmNames.length > 0 ? algorithmNames : state.defaultAlgorithms,
        experiment_groups: experimentGroupConfigs,
        categorical_features: categoricalFeatures.length > 0 ? categoricalFeatures : undefined,
      };
      payload.metrics_file = { problem_type: state.problemType };
    }

    if (loaded.has("algorithms") && state.algorithmWrappers.length > 0) {
      payload.algorithms_file = { wrappers: algorithmConfigs };
    }

    if (loaded.has("workflow") && state.workflowSteps.length > 0) {
      payload.workflow_file = {
        problem_type: state.problemType,
        steps: workflowStepConfigs,
      };
    }

    return payload;
  },

  saveAll: async () => {
    const state = get();
    
    if (!state.hasChanges) {
      return;
    }

    set({ isSaving: true, saveError: null });

    try {
      const loaded = state.loadedSections;

      // Write data.py only if datasets section was loaded
      if (loaded.has("datasets")) {
        const baseDataManagerConfig: ApiDataManagerConfig = {
          test_size: state.baseDataManager.testSize,
          n_splits: state.baseDataManager.nSplits,
          split_method: state.baseDataManager.splitMethod,
          group_column: state.baseDataManager.groupColumn,
          stratified: state.baseDataManager.stratified,
          random_state: state.baseDataManager.randomState,
        };
        await writeDataFile({ base_data_manager: baseDataManagerConfig });
      }

      // Write algorithms.py if algorithms section was loaded and there are wrappers
      if (loaded.has("algorithms") && state.algorithmWrappers.length > 0) {
        const algorithmConfigs: AlgorithmWrapperConfig[] = state.algorithmWrappers.map((w) => ({
          name: w.name,
          display_name: w.displayName,
          class_name: w.className,
          class_module: w.classModule,
          default_params: w.defaultParams as Record<string, string | number | boolean | null>,
          search_space: w.searchSpace || {},
          use_defaults: w.useDefaults,
        }));

        await writeAlgorithmsFile({ wrappers: algorithmConfigs });
      }

      // Get dataset configs from data processing store for preprocessors and data manager overrides
      const { datasetConfigs } = useDataProcessingStepStore.getState();

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

      // Helper to get dataset ID from file name
      // The ID is the file name itself (or "filename:tablename" for sqlite)
      // Also handles legacy case where fileName might be without extension
      const getDatasetIdFromFileName = (fileName: string): string => {
        // Check if any dataset matches this filename
        const dataset = state.datasets.find(d => {
          if (d.fileType === "sqlite" && d.tableName) {
            return d.id === `${d.fileName}:${d.tableName}` || d.fileName === fileName;
          }
          // Direct match with ID or fileName
          if (d.id === fileName || d.fileName === fileName) {
            return true;
          }
          // Handle legacy case: input without extension matching stored name with extension
          // e.g., "test_data_small" should match "test_data_small.xlsx"
          const fileNameWithoutExt = d.fileName.replace(/\.[^/.]+$/, "");
          if (fileNameWithoutExt === fileName) {
            return true;
          }
          return false;
        });
        return dataset?.id || fileName;
      };

      // Convert experiment groups to the format expected by the API
      const experimentGroupConfigs: ExperimentGroupConfig[] = state.experimentGroups.map((g) => {
        // The dataset in experiment group is the file name
        const datasetFileName = g.datasets[0] || "";
        
        // Get the dataset ID - with file-based IDs, this should be the same as the file name
        const datasetId = getDatasetIdFromFileName(datasetFileName);
        const datasetConfig = datasetConfigs[datasetId];
        
        const dm = datasetConfig?.dataManager;
        const preprocessorsObj = datasetConfig?.preprocessors;
        const configured = datasetConfig?.configuredPreprocessors ?? [];

        // Build preprocessors array in pipeline order
        const preprocessors: PreprocessorEntry[] = [];
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

        const useDefaultDataManager = !hasDcParams && preprocessors.length === 0;

        return {
          name: g.name,
          description: g.description || undefined,
          dataset_file_name: datasetFileName,
          dataset_table_name: null,
          algorithms: g.algorithms,
          use_default_data_manager: useDefaultDataManager,
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
      });

      // Build categorical features from datasets
      const categoricalFeatures: CategoricalFeaturesEntry[] = state.datasets
        .filter((d) => d.features.some((f) => f.categorical))
        .map((d) => ({
          dataset_file_name: d.fileName,
          table_name: d.fileType === "sqlite" && d.tableName ? d.tableName : null,
          features: d.features.filter((f) => f.categorical).map((f) => f.name),
        }));

      if (loaded.has("experiments")) {
        const algorithmNames = state.algorithmWrappers.map((w) => w.name);
        
        await writeSettingsFile({
          problem_type: state.problemType,
          default_algorithms: algorithmNames.length > 0 ? algorithmNames : state.defaultAlgorithms,
          experiment_groups: experimentGroupConfigs,
          categorical_features: categoricalFeatures.length > 0 ? categoricalFeatures : undefined,
        });
      } else if (loaded.has("datasets")) {
        // Experiments weren't loaded in this session but dataset configs changed
        // (e.g. preprocessors added). Fetch experiment groups from backend so
        // settings.py reflects the updated preprocessors.
        try {
          const expData = await getExperimentsData();
          if (expData.experiment_groups.length > 0) {
            const backendGroups: ExperimentGroupConfig[] = expData.experiment_groups.map((g) => {
              const datasetFileName = g.datasets[0] || "";
              const datasetId = getDatasetIdFromFileName(datasetFileName);
              const dsCfg = datasetConfigs[datasetId];
              const preprocessorsObj = dsCfg?.preprocessors;
              const configured = dsCfg?.configuredPreprocessors ?? [];

              const preprocessors: PreprocessorEntry[] = [];
              for (const type of PREPROCESSOR_ORDER) {
                if (!configured.includes(type)) continue;
                const key = PREPROCESSOR_KEYS[type];
                const config = key && preprocessorsObj?.[key];
                if (config && typeof config === "object") {
                  preprocessors.push({ type, config: config as unknown as Record<string, unknown> });
                }
              }

              const dm = dsCfg?.dataManager;
              const hasDcParams = dm && (dm.testSize !== undefined || dm.nSplits !== undefined || dm.splitMethod !== undefined || dm.groupColumn !== undefined || dm.stratified !== undefined || dm.randomState !== undefined);
              const useDefaultDataManager = !hasDcParams && preprocessors.length === 0;

              return {
                name: g.name,
                description: g.description || undefined,
                dataset_file_name: datasetFileName,
                dataset_table_name: null,
                algorithms: g.algorithms,
                use_default_data_manager: useDefaultDataManager,
                data_config: hasDcParams || preprocessors.length > 0
                  ? {
                      ...(hasDcParams && dm ? {
                        test_size: dm.testSize, n_splits: dm.nSplits,
                        split_method: dm.splitMethod, group_column: dm.groupColumn,
                        stratified: dm.stratified, random_state: dm.randomState,
                      } : {}),
                      ...(preprocessors.length > 0 ? { preprocessors } : {}),
                    }
                  : undefined,
              };
            });

            await writeSettingsFile({
              problem_type: state.problemType,
              default_algorithms: expData.algorithms.map((a) => a.name),
              experiment_groups: backendGroups,
              categorical_features: categoricalFeatures.length > 0 ? categoricalFeatures : undefined,
            });
          }
        } catch {
          // Settings.py will be updated next time experiments page is visited
        }
      }

      // Save datasets to project.json only if datasets section was loaded
      if (loaded.has("datasets") && state.datasets.length > 0) {
        const storedDatasets: StoredDatasetConfig[] = state.datasets.map((d) => {
          // Get preprocessor configs from data processing store
          const datasetConfig = datasetConfigs[d.id];
          const preprocessorsObj = datasetConfig?.preprocessors;
          const configured = datasetConfig?.configuredPreprocessors ?? [];
          
          // Build stored preprocessors
          const storedPreprocessors: StoredPreprocessorConfig[] = [];
          for (const type of PREPROCESSOR_ORDER) {
            if (!configured.includes(type)) continue;
            const key = PREPROCESSOR_KEYS[type];
            const config = key && preprocessorsObj?.[key];
            if (config && typeof config === "object") {
              storedPreprocessors.push({
                type,
                config: config as unknown as Record<string, unknown>,
              });
            }
          }

          return {
            id: d.id,
            file_name: d.fileName,
            table_name: d.tableName || null,
            file_type: d.fileType,
            target_feature: d.targetFeature,
            features_count: d.featuresCount,
            observations_count: d.observationsCount,
            features: d.features.map(f => ({
              name: f.name,
              data_type: f.type,
              categorical: f.categorical,
            })),
            data_manager: datasetConfig?.dataManager ? {
              test_size: datasetConfig.dataManager.testSize,
              n_splits: datasetConfig.dataManager.nSplits,
              split_method: datasetConfig.dataManager.splitMethod,
              group_column: datasetConfig.dataManager.groupColumn,
              stratified: datasetConfig.dataManager.stratified,
              random_state: datasetConfig.dataManager.randomState,
            } : null,
            preprocessors: storedPreprocessors,
          };
        });

        await saveDatasets({
          datasets: storedDatasets,
          base_data_manager: {
            test_size: state.baseDataManager.testSize,
            n_splits: state.baseDataManager.nSplits,
            split_method: state.baseDataManager.splitMethod,
            group_column: state.baseDataManager.groupColumn,
            stratified: state.baseDataManager.stratified,
            random_state: state.baseDataManager.randomState,
          },
        });
      }

      // Write workflow file only if workflow section was loaded and there are steps
      if (loaded.has("workflow") && state.workflowSteps.length > 0) {
        const workflowStepConfigs: WorkflowStepConfig[] = state.workflowSteps.map((s) => ({
          evaluator_id: s.evaluatorId,
          method_name: s.methodName,
          args: s.args,
        }));

        await writeWorkflowFile({
          problem_type: state.problemType,
          steps: workflowStepConfigs,
        });
      }

      set({ hasChanges: false, isSaving: false });
    } catch (err) {
      set({
        saveError: err instanceof Error ? err.message : "Failed to save",
        isSaving: false,
      });
      throw err;
    }
  },

  reset: () => {
    set(initialState);
  },
}));
