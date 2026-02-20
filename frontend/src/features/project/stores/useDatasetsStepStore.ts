import { create } from "zustand";
import type { Dataset, DatasetFileType, Feature } from "@/types";

/**
 * Form data for creating/editing a dataset.
 */
export interface DatasetFormData {
  fileName: string;
  tableName: string;
  fileType: DatasetFileType;
  groupColumn: string;
  targetFeature: string;
  featuresCount: string;
  observationsCount: string;
  features: Feature[];
}

/**
 * Default empty form data.
 */
const DEFAULT_FORM_DATA: DatasetFormData = {
  fileName: "",
  tableName: "",
  fileType: "csv",
  groupColumn: "",
  targetFeature: "",
  featuresCount: "",
  observationsCount: "",
  features: [],
};

export interface DatasetsStepState {
  // List of datasets created in the wizard
  datasets: Dataset[];

  // Currently selected dataset ID (for editing)
  selectedDatasetId: string | null;

  // Current form data
  form: DatasetFormData;

  // Cached form data (saved when selecting a dataset)
  cachedForm: DatasetFormData | null;

  // Actions
  setForm: (updates: Partial<DatasetFormData>) => void;
  setFeatures: (features: Feature[]) => void;
  addFeature: (feature: Feature) => void;
  removeFeature: (id: string) => void;

  addDataset: () => string | null;
  updateDataset: (id: string) => void;
  removeDataset: (id: string) => void;

  selectDataset: (id: string) => void;
  deselectDataset: () => void;
  toggleDataset: (id: string) => void;

  resetForm: () => void;
  reset: () => void;
}

export const useDatasetsStepStore = create<DatasetsStepState>((set, get) => ({
  datasets: [],
  selectedDatasetId: null,
  form: { ...DEFAULT_FORM_DATA },
  cachedForm: null,

  // Update form fields
  setForm: (updates) => {
    set((state) => ({
      form: { ...state.form, ...updates },
    }));
  },

  // Set features array
  setFeatures: (features) => {
    set((state) => ({
      form: { ...state.form, features },
    }));
  },

  // Add a feature to the form
  addFeature: (feature) => {
    set((state) => ({
      form: {
        ...state.form,
        features: [...state.form.features, feature],
      },
    }));
  },

  // Remove a feature from the form
  removeFeature: (id) => {
    set((state) => ({
      form: {
        ...state.form,
        features: state.form.features.filter((f) => f.id !== id),
      },
    }));
  },

  // Add a new dataset from current form data
  addDataset: () => {
    const { form } = get();

    // Require at least a file name
    if (!form.fileName.trim()) {
      return null;
    }

    const newDataset: Dataset = {
      id: crypto.randomUUID(),
      name: form.fileName,
      fileName: form.fileName,
      tableName: form.tableName,
      fileType: form.fileType,
      groupColumn: form.groupColumn,
      targetFeature: form.targetFeature,
      featuresCount: Number.parseInt(form.featuresCount, 10) || form.features.length,
      observationsCount: Number.parseInt(form.observationsCount, 10) || 0,
      features: [...form.features],
    };

    set((state) => ({
      datasets: [...state.datasets, newDataset],
      form: { ...DEFAULT_FORM_DATA },
      selectedDatasetId: null,
      cachedForm: null,
    }));

    return newDataset.id;
  },

  // Update an existing dataset with current form data
  updateDataset: (id) => {
    const { form } = get();

    set((state) => ({
      datasets: state.datasets.map((d) =>
        d.id === id
          ? {
              ...d,
              name: form.fileName,
              fileName: form.fileName,
              tableName: form.tableName,
              fileType: form.fileType,
              groupColumn: form.groupColumn,
              targetFeature: form.targetFeature,
              featuresCount:
                Number.parseInt(form.featuresCount, 10) || form.features.length,
              observationsCount:
                Number.parseInt(form.observationsCount, 10) || 0,
              features: [...form.features],
            }
          : d
      ),
    }));
  },

  // Remove a dataset
  removeDataset: (id) => {
    const { selectedDatasetId, cachedForm } = get();

    set((state) => ({
      datasets: state.datasets.filter((d) => d.id !== id),
      // If removing the selected dataset, restore cached form
      selectedDatasetId: selectedDatasetId === id ? null : selectedDatasetId,
      form: selectedDatasetId === id && cachedForm ? cachedForm : state.form,
      cachedForm: selectedDatasetId === id ? null : state.cachedForm,
    }));
  },

  // Select a dataset (caches current form, populates with dataset data)
  selectDataset: (id) => {
    const { datasets, form, selectedDatasetId } = get();

    // If already selected, do nothing (use toggleDataset for toggle behavior)
    if (selectedDatasetId === id) {
      return;
    }

    const dataset = datasets.find((d) => d.id === id);
    if (!dataset) return;

    // Cache current form data before populating with dataset
    set({
      cachedForm: { ...form },
      selectedDatasetId: id,
      form: {
        fileName: dataset.fileName,
        tableName: dataset.tableName,
        fileType: dataset.fileType,
        groupColumn: dataset.groupColumn,
        targetFeature: dataset.targetFeature,
        featuresCount: dataset.featuresCount.toString(),
        observationsCount: dataset.observationsCount.toString(),
        features: [...dataset.features],
      },
    });
  },

  // Deselect dataset (restores cached form)
  deselectDataset: () => {
    const { cachedForm } = get();

    set({
      selectedDatasetId: null,
      form: cachedForm || { ...DEFAULT_FORM_DATA },
      cachedForm: null,
    });
  },

  // Toggle dataset selection
  toggleDataset: (id) => {
    const { selectedDatasetId } = get();

    if (selectedDatasetId === id) {
      // Deselect - restore cached form
      get().deselectDataset();
    } else {
      // Select - cache form and populate with dataset
      get().selectDataset(id);
    }
  },

  // Reset form to empty state
  resetForm: () => {
    set({
      form: { ...DEFAULT_FORM_DATA },
      selectedDatasetId: null,
      cachedForm: null,
    });
  },

  // Reset entire store
  reset: () => {
    set({
      datasets: [],
      selectedDatasetId: null,
      form: { ...DEFAULT_FORM_DATA },
      cachedForm: null,
    });
  },
}));
