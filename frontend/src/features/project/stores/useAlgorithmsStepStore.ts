import { create } from "zustand";
import type { HyperparameterValues } from "@/features/algorithms/types";

/**
 * Algorithm wrapper configuration for the wizard.
 * Maps to Python AlgorithmWrapper class.
 */
export interface WizardAlgorithmWrapper {
  id: string;
  algorithmId: string; // Reference to catalog algorithm
  name: string; // Unique identifier (required, must be unique)
  displayName: string; // Human-readable name
  className: string; // Python class name (e.g., "Ridge")
  classModule: string; // Python module (e.g., "sklearn.linear_model")
  defaultParams: HyperparameterValues; // Default parameters
  useDefaults: boolean; // Whether using catalog defaults
}

export interface AlgorithmsStepState {
  // List of algorithm wrappers configured in wizard
  wrappers: WizardAlgorithmWrapper[];

  // Actions
  addWrapper: (wrapper: Omit<WizardAlgorithmWrapper, "id">) => { success: boolean; error?: string };
  updateWrapper: (id: string, updates: Partial<WizardAlgorithmWrapper>) => { success: boolean; error?: string };
  deleteWrapper: (id: string) => void;

  // Validation
  isNameUnique: (name: string, excludeId?: string) => boolean;
  getWrapperByName: (name: string) => WizardAlgorithmWrapper | undefined;

  // Reset
  reset: () => void;
}

/**
 * Mapping of sklearn class names to their modules.
 * Used to generate correct import statements in algorithms.py
 */
export const SKLEARN_CLASS_MODULES: Record<string, string> = {
  // Regression
  LinearRegression: "sklearn.linear_model",
  Ridge: "sklearn.linear_model",
  Lasso: "sklearn.linear_model",
  BayesianRidge: "sklearn.linear_model",
  ElasticNet: "sklearn.linear_model",
  DecisionTreeRegressor: "sklearn.tree",
  RandomForestRegressor: "sklearn.ensemble",
  SVR: "sklearn.svm",
  MLPRegressor: "sklearn.neural_network",
  KNeighborsRegressor: "sklearn.neighbors",
  // Classification
  LogisticRegression: "sklearn.linear_model",
  SVC: "sklearn.svm",
  KNeighborsClassifier: "sklearn.neighbors",
  DecisionTreeClassifier: "sklearn.tree",
  RandomForestClassifier: "sklearn.ensemble",
  GaussianNB: "sklearn.naive_bayes",
  RidgeClassifier: "sklearn.linear_model",
};

export const useAlgorithmsStepStore = create<AlgorithmsStepState>((set, get) => ({
  wrappers: [],

  addWrapper: (wrapper) => {
    const { isNameUnique } = get();

    // Validate unique name
    if (!isNameUnique(wrapper.name)) {
      return {
        success: false,
        error: `An algorithm with name "${wrapper.name}" already exists. Each algorithm must have a unique name.`,
      };
    }

    const newWrapper: WizardAlgorithmWrapper = {
      ...wrapper,
      id: `wrapper-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };

    set((state) => ({
      wrappers: [...state.wrappers, newWrapper],
    }));

    return { success: true };
  },

  updateWrapper: (id, updates) => {
    const { isNameUnique } = get();

    // If updating name, check uniqueness
    if (updates.name && !isNameUnique(updates.name, id)) {
      return {
        success: false,
        error: `An algorithm with name "${updates.name}" already exists. Each algorithm must have a unique name.`,
      };
    }

    set((state) => ({
      wrappers: state.wrappers.map((w) =>
        w.id === id ? { ...w, ...updates } : w
      ),
    }));

    return { success: true };
  },

  deleteWrapper: (id) => {
    set((state) => ({
      wrappers: state.wrappers.filter((w) => w.id !== id),
    }));
  },

  isNameUnique: (name, excludeId) => {
    const { wrappers } = get();
    const normalizedName = name.toLowerCase().trim();
    return !wrappers.some(
      (w) => w.id !== excludeId && w.name.toLowerCase().trim() === normalizedName
    );
  },

  getWrapperByName: (name) => {
    const { wrappers } = get();
    const normalizedName = name.toLowerCase().trim();
    return wrappers.find((w) => w.name.toLowerCase().trim() === normalizedName);
  },

  reset: () => {
    set({ wrappers: [] });
  },
}));
