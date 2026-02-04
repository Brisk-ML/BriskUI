import { create } from "zustand";
import type {
  DataManagerConfig,
  EncodingConfig,
  FeatureSelectionConfig,
  MissingDataConfig,
  PreprocessorType,
  ScalingConfig,
} from "@/types";

export interface DataProcessingState {
  dataManager: DataManagerConfig;
  activePreprocessor: PreprocessorType | null;
  configuredPreprocessors: PreprocessorType[];
  loading: boolean;
  setActivePreprocessor: (preprocessor: PreprocessorType | null) => void;
  updateDataManager: (data: Partial<DataManagerConfig>) => void;
  addMissingDataConfig: (config: MissingDataConfig) => Promise<void>;
  addScalingConfig: (config: ScalingConfig) => Promise<void>;
  addEncodingConfig: (config: EncodingConfig) => Promise<void>;
  addFeatureSelectionConfig: (config: FeatureSelectionConfig) => Promise<void>;
}

const DEFAULT_DATA_MANAGER: DataManagerConfig = {
  testSize: {
    train: 50,
    test: 50,
  },
  groupColumn: "",
  splitMethod: "random",
  numberOfSplits: 3,
  stratified: false,
  randomState: 42,
};

export const useDataProcessingStore = create<DataProcessingState>((set) => ({
  dataManager: DEFAULT_DATA_MANAGER,
  activePreprocessor: null,
  configuredPreprocessors: [],
  loading: false,

  setActivePreprocessor: (preprocessor) => {
    set({ activePreprocessor: preprocessor });
  },

  updateDataManager: (data) => {
    set((state) => ({
      dataManager: { ...state.dataManager, ...data },
    }));
  },

  // Add preprocessor config and track it in the list (prevents duplicates)
  addMissingDataConfig: async (_config) => {
    set({ loading: true });
    await new Promise((resolve) => setTimeout(resolve, 500));
    set((state) => ({
      loading: false,
      configuredPreprocessors: state.configuredPreprocessors.includes(
        "missing-data",
      )
        ? state.configuredPreprocessors
        : [...state.configuredPreprocessors, "missing-data"],
    }));
  },

  addScalingConfig: async (_config) => {
    set({ loading: true });
    await new Promise((resolve) => setTimeout(resolve, 500));
    set((state) => ({
      loading: false,
      configuredPreprocessors: state.configuredPreprocessors.includes("scaling")
        ? state.configuredPreprocessors
        : [...state.configuredPreprocessors, "scaling"],
    }));
  },

  addEncodingConfig: async (_config) => {
    set({ loading: true });
    await new Promise((resolve) => setTimeout(resolve, 500));
    set((state) => ({
      loading: false,
      configuredPreprocessors: state.configuredPreprocessors.includes(
        "encoding",
      )
        ? state.configuredPreprocessors
        : [...state.configuredPreprocessors, "encoding"],
    }));
  },

  addFeatureSelectionConfig: async (_config) => {
    set({ loading: true });
    await new Promise((resolve) => setTimeout(resolve, 500));
    set((state) => ({
      loading: false,
      configuredPreprocessors: state.configuredPreprocessors.includes(
        "feature-selection",
      )
        ? state.configuredPreprocessors
        : [...state.configuredPreprocessors, "feature-selection"],
    }));
  },
}));
