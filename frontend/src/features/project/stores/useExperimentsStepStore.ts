import { create } from "zustand";

/**
 * Experiment group configuration for settings.py
 * Maps to Configuration.add_experiment_group() call
 */
export interface ExperimentGroup {
  id: string;
  name: string; // group name
  description: string;
  datasetId: string; // reference to dataset in DatasetsStepStore
  datasetFileName: string; // the actual file name for settings.py
  datasetTableName: string | null; // optional table name for tuple format
  algorithms: string[]; // list of algorithm names (from AlgorithmsStepStore)
  useDefaultDataManager: boolean; // if true, skip data_config in settings.py
}

export interface ExperimentsStepState {
  // List of experiment groups
  groups: ExperimentGroup[];

  // Actions
  addGroup: (group: Omit<ExperimentGroup, "id">) => { success: boolean; error?: string };
  updateGroup: (id: string, updates: Partial<ExperimentGroup>) => void;
  deleteGroup: (id: string) => void;

  // Validation
  isNameUnique: (name: string, excludeId?: string) => boolean;

  // Reset
  reset: () => void;
}

export const useExperimentsStepStore = create<ExperimentsStepState>((set, get) => ({
  groups: [],

  addGroup: (group) => {
    const { isNameUnique } = get();

    // Validate unique name
    if (!isNameUnique(group.name)) {
      return {
        success: false,
        error: `An experiment group with name "${group.name}" already exists. Each group must have a unique name.`,
      };
    }

    const newGroup: ExperimentGroup = {
      ...group,
      id: `group-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };

    set((state) => ({
      groups: [...state.groups, newGroup],
    }));

    return { success: true };
  },

  updateGroup: (id, updates) => {
    set((state) => ({
      groups: state.groups.map((g) =>
        g.id === id ? { ...g, ...updates } : g
      ),
    }));
  },

  deleteGroup: (id) => {
    set((state) => ({
      groups: state.groups.filter((g) => g.id !== id),
    }));
  },

  isNameUnique: (name, excludeId) => {
    const { groups } = get();
    const normalizedName = name.toLowerCase().trim();
    return !groups.some(
      (g) => g.id !== excludeId && g.name.toLowerCase().trim() === normalizedName
    );
  },

  reset: () => {
    set({ groups: [] });
  },
}));
