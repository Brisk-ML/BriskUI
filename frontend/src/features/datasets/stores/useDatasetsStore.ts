import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  DataManagerConfig,
  Dataset,
  DatasetFileType,
  Feature,
  PreprocessorType,
} from "@/types";

// Sample datasets for demo
const SAMPLE_DATASETS: Dataset[] = [
  {
    id: "1",
    name: "Dataset 1",
    fileName: "train_data.csv",
    tableName: "training_set",
    fileType: "csv",
    groupColumn: "user_id",
    targetFeature: "label",
    featuresCount: 15,
    observationsCount: 10000,
    features: [
      { id: "1", name: "age", type: "int" },
      { id: "2", name: "income", type: "float" },
      { id: "3", name: "category", type: "str" },
      { id: "4", name: "score", type: "float" },
      { id: "5", name: "label", type: "int" },
    ],
  },
  {
    id: "2",
    name: "Dataset 2",
    fileName: "test_data.csv",
    tableName: "test_set",
    fileType: "csv",
    groupColumn: "session_id",
    targetFeature: "outcome",
    featuresCount: 12,
    observationsCount: 5000,
    features: [
      { id: "1", name: "duration", type: "float" },
      { id: "2", name: "clicks", type: "int" },
      { id: "3", name: "source", type: "str" },
      { id: "4", name: "outcome", type: "int" },
    ],
  },
  {
    id: "3",
    name: "Dataset 3",
    fileName: "validation.parquet",
    tableName: "validation_set",
    fileType: "parquet",
    groupColumn: "batch_id",
    targetFeature: "target",
    featuresCount: 20,
    observationsCount: 3000,
    features: [
      { id: "1", name: "feature_1", type: "float" },
      { id: "2", name: "feature_2", type: "float" },
      { id: "3", name: "target", type: "int" },
    ],
  },
];

interface DatasetsState {
  // Dataset selection and list
  datasets: Dataset[];
  selectedDatasetId: string | null;

  // Edit form state
  editForm: {
    fileName: string;
    tableName: string;
    fileType: DatasetFileType;
    groupColumn: string;
    targetFeature: string;
    featuresCount: number;
    observationsCount: number;
    features: Feature[];
  };

  // Data manager config
  dataManager: DataManagerConfig;

  // Preprocessor state
  activePreprocessor: PreprocessorType | null;
  configuredPreprocessors: PreprocessorType[];

  // Search
  featureSearch: string;

  // Actions
  selectDataset: (id: string) => void;
  updateEditForm: (updates: Partial<DatasetsState["editForm"]>) => void;
  addFeature: (feature: Feature) => void;
  removeFeature: (id: string) => void;
  updateFeature: (id: string, updates: Partial<Feature>) => void;
  setFeatureSearch: (search: string) => void;
  setActivePreprocessor: (type: PreprocessorType | null) => void;
  togglePreprocessorConfigured: (type: PreprocessorType) => void;
  updateDataManager: (updates: Partial<DataManagerConfig>) => void;
  addDataset: (dataset: Omit<Dataset, "id">) => void;
  deleteDataset: (id: string) => void;
  resetEditForm: () => void;
}

const defaultEditForm: DatasetsState["editForm"] = {
  fileName: "",
  tableName: "",
  fileType: "csv",
  groupColumn: "",
  targetFeature: "",
  featuresCount: 0,
  observationsCount: 0,
  features: [],
};

const defaultDataManager: DataManagerConfig = {
  testSize: { train: 80, test: 20 },
  groupColumn: "",
  splitMethod: "random",
  numberOfSplits: 5,
  stratified: false,
  randomState: 42,
};

export const useDatasetsStore = create<DatasetsState>()(
  persist(
    (set, get) => ({
      datasets: SAMPLE_DATASETS,
      selectedDatasetId: SAMPLE_DATASETS[0]?.id || null,
      editForm: { ...defaultEditForm, ...SAMPLE_DATASETS[0] },
      dataManager: defaultDataManager,
      activePreprocessor: null,
      configuredPreprocessors: [],
      featureSearch: "",

      selectDataset: (id) => {
        const dataset = get().datasets.find((d) => d.id === id);
        if (dataset) {
          set({
            selectedDatasetId: id,
            editForm: {
              fileName: dataset.fileName,
              tableName: dataset.tableName,
              fileType: dataset.fileType,
              groupColumn: dataset.groupColumn,
              targetFeature: dataset.targetFeature,
              featuresCount: dataset.featuresCount,
              observationsCount: dataset.observationsCount,
              features: [...dataset.features],
            },
          });
        }
      },

      updateEditForm: (updates) =>
        set((state) => ({
          editForm: { ...state.editForm, ...updates },
        })),

      addFeature: (feature) =>
        set((state) => ({
          editForm: {
            ...state.editForm,
            features: [...state.editForm.features, feature],
            featuresCount: state.editForm.featuresCount + 1,
          },
        })),

      removeFeature: (id) =>
        set((state) => ({
          editForm: {
            ...state.editForm,
            features: state.editForm.features.filter((f) => f.id !== id),
            featuresCount: Math.max(0, state.editForm.featuresCount - 1),
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

      setFeatureSearch: (search) => set({ featureSearch: search }),

      setActivePreprocessor: (type) => set({ activePreprocessor: type }),

      togglePreprocessorConfigured: (type) =>
        set((state) => {
          const exists = state.configuredPreprocessors.includes(type);
          return {
            configuredPreprocessors: exists
              ? state.configuredPreprocessors.filter((t) => t !== type)
              : [...state.configuredPreprocessors, type],
          };
        }),

      updateDataManager: (updates) =>
        set((state) => ({
          dataManager: { ...state.dataManager, ...updates },
        })),

      addDataset: (dataset) =>
        set((state) => {
          const newDataset = {
            ...dataset,
            id: crypto.randomUUID(),
          };
          return {
            datasets: [...state.datasets, newDataset],
            selectedDatasetId: newDataset.id,
            editForm: {
              fileName: newDataset.fileName,
              tableName: newDataset.tableName,
              fileType: newDataset.fileType,
              groupColumn: newDataset.groupColumn,
              targetFeature: newDataset.targetFeature,
              featuresCount: newDataset.featuresCount,
              observationsCount: newDataset.observationsCount,
              features: [...newDataset.features],
            },
          };
        }),

      deleteDataset: (id) =>
        set((state) => {
          const newDatasets = state.datasets.filter((d) => d.id !== id);
          const newSelectedId =
            state.selectedDatasetId === id
              ? newDatasets[0]?.id || null
              : state.selectedDatasetId;
          return {
            datasets: newDatasets,
            selectedDatasetId: newSelectedId,
          };
        }),

      resetEditForm: () => set({ editForm: defaultEditForm }),
    }),
    {
      name: "brisk-datasets-storage",
      partialize: (state) => ({
        datasets: state.datasets,
        dataManager: state.dataManager,
      }),
    },
  ),
);
