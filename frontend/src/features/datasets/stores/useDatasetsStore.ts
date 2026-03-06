import { create } from "zustand";
import type { Feature, PreprocessorType } from "@/types";

interface DatasetEntry {
  id: string;
  name: string;
  observationsCount: number;
  featuresCount: number;
}

interface EditForm {
  fileName: string;
  tableName: string;
  fileType: "csv" | "parquet" | "json";
  groupColumn: string;
  targetFeature: string;
  featuresCount: number;
  observationsCount: number;
  features: Feature[];
}

interface DataManager {
  testSize: { train: number; test: number };
  groupColumn: string | null;
  splitMethod: string;
  numberOfSplits: number;
  stratified: boolean;
  randomState: number;
}

interface DatasetsState {
  datasets: DatasetEntry[];
  selectedDatasetId: string | null;
  editForm: EditForm;
  featureSearch: string;
  dataManager: DataManager;
  activePreprocessor: PreprocessorType | null;
  configuredPreprocessors: PreprocessorType[];

  selectDataset: (id: string) => void;
  updateEditForm: (updates: Partial<EditForm>) => void;
  setFeatureSearch: (search: string) => void;
  addFeature: (feature: Feature) => void;
  removeFeature: (id: string) => void;
  updateFeature: (id: string, updates: Partial<Feature>) => void;
  setActivePreprocessor: (type: PreprocessorType) => void;
  togglePreprocessorConfigured: (type: PreprocessorType) => void;
}

const DEFAULT_EDIT_FORM: EditForm = {
  fileName: "",
  tableName: "",
  fileType: "csv",
  groupColumn: "",
  targetFeature: "",
  featuresCount: 0,
  observationsCount: 0,
  features: [],
};

const DEFAULT_DATA_MANAGER: DataManager = {
  testSize: { train: 80, test: 20 },
  groupColumn: null,
  splitMethod: "random",
  numberOfSplits: 5,
  stratified: false,
  randomState: 42,
};

export const useDatasetsStore = create<DatasetsState>()((set) => ({
  datasets: [],
  selectedDatasetId: null,
  editForm: DEFAULT_EDIT_FORM,
  featureSearch: "",
  dataManager: DEFAULT_DATA_MANAGER,
  activePreprocessor: null,
  configuredPreprocessors: [],

  selectDataset: (id) => set({ selectedDatasetId: id }),

  updateEditForm: (updates) =>
    set((state) => ({ editForm: { ...state.editForm, ...updates } })),

  setFeatureSearch: (search) => set({ featureSearch: search }),

  addFeature: (feature) =>
    set((state) => ({
      editForm: {
        ...state.editForm,
        features: [...state.editForm.features, feature],
      },
    })),

  removeFeature: (id) =>
    set((state) => ({
      editForm: {
        ...state.editForm,
        features: state.editForm.features.filter((f) => f.id !== id),
      },
    })),

  updateFeature: (id, updates) =>
    set((state) => ({
      editForm: {
        ...state.editForm,
        features: state.editForm.features.map((f) =>
          f.id === id ? { ...f, ...updates } : f,
        ),
      },
    })),

  setActivePreprocessor: (type) => set({ activePreprocessor: type }),

  togglePreprocessorConfigured: (type) =>
    set((state) => ({
      configuredPreprocessors: state.configuredPreprocessors.includes(type)
        ? state.configuredPreprocessors.filter((t) => t !== type)
        : [...state.configuredPreprocessors, type],
    })),
}));
