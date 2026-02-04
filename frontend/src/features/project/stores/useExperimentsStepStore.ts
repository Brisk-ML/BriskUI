import { create } from "zustand";

export interface ExperimentGroup {
  id: string;
  name: string;
  description: string;
  datasets: string[];
  algorithms: string[];
}

export interface ExperimentsStepState {
  groups: ExperimentGroup[];
  experimentName: string;
  experimentDescription: string;
  selectedDatasets: string[];
  selectedAlgorithms: string[];
  loading: boolean;

  // Actions
  setExperimentName: (name: string) => void;
  setExperimentDescription: (description: string) => void;
  setSelectedDatasets: (datasets: string[]) => void;
  setSelectedAlgorithms: (algorithms: string[]) => void;
  toggleDataset: (datasetId: string) => void;
  toggleAlgorithm: (algorithmId: string) => void;
  addGroup: (group: ExperimentGroup) => void;
  removeGroup: (id: string) => void;
  updateGroup: (id: string, updates: Partial<ExperimentGroup>) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

export const useExperimentsStepStore = create<ExperimentsStepState>((set) => ({
  groups: [],
  experimentName: "",
  experimentDescription: "",
  selectedDatasets: [],
  selectedAlgorithms: [],
  loading: false,

  setExperimentName: (name) => {
    set({ experimentName: name });
  },

  setExperimentDescription: (description) => {
    set({ experimentDescription: description });
  },

  setSelectedDatasets: (datasets) => {
    set({ selectedDatasets: datasets });
  },

  setSelectedAlgorithms: (algorithms) => {
    set({ selectedAlgorithms: algorithms });
  },

  toggleDataset: (datasetId) => {
    set((state) => {
      const { selectedDatasets } = state;
      if (selectedDatasets.includes(datasetId)) {
        return {
          selectedDatasets: selectedDatasets.filter((id) => id !== datasetId),
        };
      }
      return {
        selectedDatasets: [...selectedDatasets, datasetId],
      };
    });
  },

  toggleAlgorithm: (algorithmId) => {
    set((state) => {
      const { selectedAlgorithms } = state;
      if (selectedAlgorithms.includes(algorithmId)) {
        return {
          selectedAlgorithms: selectedAlgorithms.filter(
            (id) => id !== algorithmId,
          ),
        };
      }
      return {
        selectedAlgorithms: [...selectedAlgorithms, algorithmId],
      };
    });
  },

  addGroup: (group) => {
    set((state) => ({
      groups: [...state.groups, group],
    }));
  },

  removeGroup: (id) => {
    set((state) => ({
      groups: state.groups.filter((g) => g.id !== id),
    }));
  },

  updateGroup: (id, updates) => {
    set((state) => ({
      groups: state.groups.map((g) => (g.id === id ? { ...g, ...updates } : g)),
    }));
  },

  setLoading: (loading) => {
    set({ loading });
  },

  reset: () => {
    set({
      groups: [],
      experimentName: "",
      experimentDescription: "",
      selectedDatasets: [],
      selectedAlgorithms: [],
      loading: false,
    });
  },
}));
