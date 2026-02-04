import { create } from "zustand";
import type { Dataset } from "@/types";

export interface DatasetsStepState {
  datasets: Dataset[];
  selectedDatasets: string[];
  loading: boolean;
  error: string | null;

  // Actions
  setDatasets: (datasets: Dataset[]) => void;
  addDataset: (dataset: Dataset) => void;
  removeDataset: (id: string) => void;
  selectDataset: (id: string) => void;
  deselectDataset: (id: string) => void;
  toggleDataset: (id: string) => void;
  selectAll: () => void;
  deselectAll: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useDatasetsStepStore = create<DatasetsStepState>((set, get) => ({
  datasets: [],
  selectedDatasets: [],
  loading: false,
  error: null,

  setDatasets: (datasets) => {
    set({ datasets });
  },

  addDataset: (dataset) => {
    set((state) => ({
      datasets: [...state.datasets, dataset],
    }));
  },

  removeDataset: (id) => {
    set((state) => ({
      datasets: state.datasets.filter((d) => d.id !== id),
      selectedDatasets: state.selectedDatasets.filter((sid) => sid !== id),
    }));
  },

  selectDataset: (id) => {
    set((state) => ({
      selectedDatasets: [...state.selectedDatasets, id],
      datasets: state.datasets.map((d) =>
        d.id === id ? { ...d, selected: true } : d,
      ),
    }));
  },

  deselectDataset: (id) => {
    set((state) => ({
      selectedDatasets: state.selectedDatasets.filter((sid) => sid !== id),
      datasets: state.datasets.map((d) =>
        d.id === id ? { ...d, selected: false } : d,
      ),
    }));
  },

  toggleDataset: (id) => {
    const { selectedDatasets } = get();
    if (selectedDatasets.includes(id)) {
      get().deselectDataset(id);
    } else {
      get().selectDataset(id);
    }
  },

  selectAll: () => {
    set((state) => ({
      selectedDatasets: state.datasets.map((d) => d.id),
      datasets: state.datasets.map((d) => ({ ...d, selected: true })),
    }));
  },

  deselectAll: () => {
    set((state) => ({
      selectedDatasets: [],
      datasets: state.datasets.map((d) => ({ ...d, selected: false })),
    }));
  },

  setLoading: (loading) => {
    set({ loading });
  },

  setError: (error) => {
    set({ error });
  },

  reset: () => {
    set({
      datasets: [],
      selectedDatasets: [],
      loading: false,
      error: null,
    });
  },
}));
