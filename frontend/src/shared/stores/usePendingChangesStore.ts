import { create } from "zustand";
import {
  writeSettingsFile,
  writeAlgorithmsFile,
  type ExperimentGroupConfig,
  type AlgorithmWrapperConfig,
  type ProblemType,
} from "@/api";

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
  useDefaults: boolean;
}

interface PendingChangesState {
  // Pending experiment groups to save
  experimentGroups: ExperimentGroupState[];
  defaultAlgorithms: string[];
  problemType: ProblemType;
  
  // Pending algorithm wrappers to save
  algorithmWrappers: AlgorithmWrapperState[];
  
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
  
  markChanged: () => void;
  
  // Save all pending changes
  saveAll: () => Promise<void>;
  
  // Reset
  reset: () => void;
}

const initialState = {
  experimentGroups: [],
  defaultAlgorithms: [],
  problemType: "classification" as ProblemType,
  algorithmWrappers: [],
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

  markChanged: () => {
    set({ hasChanges: true });
  },

  saveAll: async () => {
    const state = get();
    
    if (!state.hasChanges) {
      return;
    }

    set({ isSaving: true, saveError: null });

    try {
      // Write algorithms.py if there are algorithm wrappers
      if (state.algorithmWrappers.length > 0) {
        const algorithmConfigs: AlgorithmWrapperConfig[] = state.algorithmWrappers.map((w) => ({
          name: w.name,
          display_name: w.displayName,
          class_name: w.className,
          class_module: w.classModule,
          default_params: w.defaultParams as Record<string, string | number | boolean | null>,
          use_defaults: w.useDefaults,
        }));

        await writeAlgorithmsFile({ wrappers: algorithmConfigs });
      }

      // Convert to the format expected by the API
      const experimentGroupConfigs: ExperimentGroupConfig[] = state.experimentGroups.map((g) => ({
        name: g.name,
        description: g.description,
        dataset_file_name: g.datasets[0] || "",
        dataset_table_name: null,
        algorithms: g.algorithms,
        use_default_data_manager: true,
        data_config: null,
      }));

      // Write settings file with experiment groups
      // Use algorithm names from pending wrappers as default_algorithms
      const algorithmNames = state.algorithmWrappers.map((w) => w.name);
      
      await writeSettingsFile({
        problem_type: state.problemType,
        default_algorithms: algorithmNames.length > 0 ? algorithmNames : state.defaultAlgorithms,
        experiment_groups: experimentGroupConfigs,
      });

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
