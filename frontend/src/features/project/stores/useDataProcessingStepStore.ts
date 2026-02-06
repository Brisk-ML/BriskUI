import { create } from "zustand";
import type { PreprocessorType } from "@/types";

/**
 * Base DataManager config matching Python DataManager class parameters.
 * This represents the BASE_DATA_MANAGER that gets written to data.py
 */
export interface BaseDataManagerConfig {
  testSize: number; // 0-1 proportion (e.g., 0.2 for 20% test)
  nSplits: number;
  splitMethod: "shuffle" | "kfold";
  groupColumn: string | null;
  stratified: boolean;
  randomState: number | null;
  // problem_type is handled at the project level, not in data.py
}

/**
 * Per-dataset DataManager overrides.
 * Fields are optional - if not set, inherit from BASE_DATA_MANAGER
 */
export interface DatasetDataManagerConfig {
  testSize?: number;
  nSplits?: number;
  splitMethod?: "shuffle" | "kfold";
  groupColumn?: string | null;
  stratified?: boolean;
  randomState?: number | null;
}

/**
 * Preprocessor configuration matching Python preprocessor classes.
 */
export interface MissingDataPreprocessorConfig {
  strategy: "mean" | "median" | "most_frequent" | "constant" | "drop";
  fillValue?: string | number;
}

export interface ScalingPreprocessorConfig {
  method: "standard" | "minmax" | "robust" | "normalizer";
}

export interface EncodingPreprocessorConfig {
  method: "onehot" | "label" | "ordinal" | "target";
  handleUnknown?: "error" | "ignore";
}

export interface FeatureSelectionPreprocessorConfig {
  method: "variance" | "univariate" | "recursive" | "lasso";
  nFeatures?: number | "auto";
  estimator?: string;
}

export interface DatasetPreprocessors {
  missingData?: MissingDataPreprocessorConfig;
  scaling?: ScalingPreprocessorConfig;
  encoding?: EncodingPreprocessorConfig;
  featureSelection?: FeatureSelectionPreprocessorConfig;
}

/**
 * Complete per-dataset configuration.
 */
export interface DatasetProcessingConfig {
  dataManager: DatasetDataManagerConfig;
  preprocessors: DatasetPreprocessors;
  configuredPreprocessors: PreprocessorType[];
}

/**
 * Default BASE_DATA_MANAGER values matching Python defaults.
 */
const DEFAULT_BASE_DATA_MANAGER: BaseDataManagerConfig = {
  testSize: 0.2,
  nSplits: 5,
  splitMethod: "shuffle",
  groupColumn: null,
  stratified: false,
  randomState: null,
};

export interface DataProcessingStepState {
  // The BASE_DATA_MANAGER config (written to data.py)
  baseDataManager: BaseDataManagerConfig;

  // Per-dataset configurations (keyed by dataset ID)
  datasetConfigs: Record<string, DatasetProcessingConfig>;

  // Currently selected dataset ID (from DatasetsStepStore)
  selectedDatasetId: string | null;

  // Currently active preprocessor panel
  activePreprocessor: PreprocessorType | null;

  // Actions for BASE_DATA_MANAGER
  updateBaseDataManager: (updates: Partial<BaseDataManagerConfig>) => void;
  resetBaseDataManager: () => void;

  // Actions for dataset selection
  selectDataset: (id: string | null) => void;

  // Actions for per-dataset DataManager config
  updateDatasetDataManager: (
    datasetId: string,
    updates: Partial<DatasetDataManagerConfig>,
  ) => void;

  // Actions for preprocessors
  setActivePreprocessor: (preprocessor: PreprocessorType | null) => void;
  addPreprocessorConfig: (
    datasetId: string,
    type: PreprocessorType,
    config:
      | MissingDataPreprocessorConfig
      | ScalingPreprocessorConfig
      | EncodingPreprocessorConfig
      | FeatureSelectionPreprocessorConfig,
  ) => void;
  removePreprocessorConfig: (
    datasetId: string,
    type: PreprocessorType,
  ) => void;

  // Get effective DataManager for a dataset (base + overrides)
  getEffectiveDataManager: (datasetId: string) => BaseDataManagerConfig;

  // Get preprocessors configured for a dataset
  getDatasetPreprocessors: (datasetId: string) => PreprocessorType[];

  // Get specific preprocessor config for a dataset
  getPreprocessorConfig: (
    datasetId: string,
    type: PreprocessorType,
  ) =>
    | MissingDataPreprocessorConfig
    | ScalingPreprocessorConfig
    | EncodingPreprocessorConfig
    | FeatureSelectionPreprocessorConfig
    | null;

  // Reset store
  reset: () => void;
}

export const useDataProcessingStepStore = create<DataProcessingStepState>(
  (set, get) => ({
    baseDataManager: { ...DEFAULT_BASE_DATA_MANAGER },
    datasetConfigs: {},
    selectedDatasetId: null,
    activePreprocessor: null,

    updateBaseDataManager: (updates) => {
      set((state) => ({
        baseDataManager: { ...state.baseDataManager, ...updates },
      }));
    },

    resetBaseDataManager: () => {
      set({ baseDataManager: { ...DEFAULT_BASE_DATA_MANAGER } });
    },

    selectDataset: (id) => {
      set({ selectedDatasetId: id, activePreprocessor: null });
    },

    updateDatasetDataManager: (datasetId, updates) => {
      set((state) => {
        const existingConfig = state.datasetConfigs[datasetId] || {
          dataManager: {},
          preprocessors: {},
          configuredPreprocessors: [],
        };
        return {
          datasetConfigs: {
            ...state.datasetConfigs,
            [datasetId]: {
              ...existingConfig,
              dataManager: { ...existingConfig.dataManager, ...updates },
            },
          },
        };
      });
    },

    setActivePreprocessor: (preprocessor) => {
      set({ activePreprocessor: preprocessor });
    },

    addPreprocessorConfig: (datasetId, type, config) => {
      set((state) => {
        const existingConfig = state.datasetConfigs[datasetId] || {
          dataManager: {},
          preprocessors: {},
          configuredPreprocessors: [],
        };

        const preprocessorKey = {
          "missing-data": "missingData",
          scaling: "scaling",
          encoding: "encoding",
          "feature-selection": "featureSelection",
        }[type] as keyof DatasetPreprocessors;

        const configuredPreprocessors = existingConfig.configuredPreprocessors.includes(type)
          ? existingConfig.configuredPreprocessors
          : [...existingConfig.configuredPreprocessors, type];

        return {
          datasetConfigs: {
            ...state.datasetConfigs,
            [datasetId]: {
              ...existingConfig,
              preprocessors: {
                ...existingConfig.preprocessors,
                [preprocessorKey]: config,
              },
              configuredPreprocessors,
            },
          },
        };
      });
    },

    removePreprocessorConfig: (datasetId, type) => {
      set((state) => {
        const existingConfig = state.datasetConfigs[datasetId];
        if (!existingConfig) return state;

        const preprocessorKey = {
          "missing-data": "missingData",
          scaling: "scaling",
          encoding: "encoding",
          "feature-selection": "featureSelection",
        }[type] as keyof DatasetPreprocessors;

        const newPreprocessors = { ...existingConfig.preprocessors };
        delete newPreprocessors[preprocessorKey];

        return {
          datasetConfigs: {
            ...state.datasetConfigs,
            [datasetId]: {
              ...existingConfig,
              preprocessors: newPreprocessors,
              configuredPreprocessors: existingConfig.configuredPreprocessors.filter(
                (p) => p !== type,
              ),
            },
          },
        };
      });
    },

    getEffectiveDataManager: (datasetId) => {
      const { baseDataManager, datasetConfigs } = get();
      const datasetConfig = datasetConfigs[datasetId];
      if (!datasetConfig) return baseDataManager;

      return {
        testSize: datasetConfig.dataManager.testSize ?? baseDataManager.testSize,
        nSplits: datasetConfig.dataManager.nSplits ?? baseDataManager.nSplits,
        splitMethod:
          datasetConfig.dataManager.splitMethod ?? baseDataManager.splitMethod,
        groupColumn:
          datasetConfig.dataManager.groupColumn ?? baseDataManager.groupColumn,
        stratified:
          datasetConfig.dataManager.stratified ?? baseDataManager.stratified,
        randomState:
          datasetConfig.dataManager.randomState ?? baseDataManager.randomState,
      };
    },

    getDatasetPreprocessors: (datasetId) => {
      const { datasetConfigs } = get();
      return datasetConfigs[datasetId]?.configuredPreprocessors || [];
    },

    getPreprocessorConfig: (datasetId, type) => {
      const { datasetConfigs } = get();
      const config = datasetConfigs[datasetId];
      if (!config) return null;

      const preprocessorKey = {
        "missing-data": "missingData",
        scaling: "scaling",
        encoding: "encoding",
        "feature-selection": "featureSelection",
      }[type] as keyof DatasetPreprocessors;

      return config.preprocessors[preprocessorKey] || null;
    },

    reset: () => {
      set({
        baseDataManager: { ...DEFAULT_BASE_DATA_MANAGER },
        datasetConfigs: {},
        selectedDatasetId: null,
        activePreprocessor: null,
      });
    },
  }),
);
