import { create } from "zustand";

export interface Algorithm {
  id: string;
  name: string;
  category: "model" | "method";
  description?: string;
  selected: boolean;
}

export interface AlgorithmsStepState {
  algorithms: Algorithm[];
  selectedModels: string[];
  selectedMethods: string[];
  loading: boolean;
  setAlgorithms: (algorithms: Algorithm[]) => void;
  toggleAlgorithm: (id: string) => void;
  selectAlgorithm: (id: string) => void;
  deselectAlgorithm: (id: string) => void;
  selectAllModels: () => void;
  selectAllMethods: () => void;
  deselectAll: () => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

const DEFAULT_ALGORITHMS: Algorithm[] = [
  {
    id: "linear-regression",
    name: "Linear Regression",
    category: "model",
    selected: false,
  },
  {
    id: "random-forest",
    name: "Random Forest",
    category: "model",
    selected: false,
  },
  { id: "xgboost", name: "XGBoost", category: "model", selected: false },
  { id: "svm", name: "SVM", category: "model", selected: false },
  {
    id: "neural-network",
    name: "Neural Network",
    category: "model",
    selected: false,
  },
  {
    id: "cross-validation",
    name: "Cross-Validation",
    category: "method",
    selected: false,
  },
  {
    id: "grid-search",
    name: "Grid Search",
    category: "method",
    selected: false,
  },
  {
    id: "feature-importance",
    name: "Feature Importance",
    category: "method",
    selected: false,
  },
  {
    id: "hyperparameter-tuning",
    name: "Hyperparameter Tuning",
    category: "method",
    selected: false,
  },
];

export const useAlgorithmsStepStore = create<AlgorithmsStepState>((set) => ({
  algorithms: DEFAULT_ALGORITHMS,
  selectedModels: [],
  selectedMethods: [],
  loading: false,

  setAlgorithms: (algorithms) => {
    set({ algorithms });
  },

  toggleAlgorithm: (id) => {
    set((state) => {
      const algorithm = state.algorithms.find((a) => a.id === id);
      if (!algorithm) return state;

      const newAlgorithms = state.algorithms.map((a) =>
        a.id === id ? { ...a, selected: !a.selected } : a,
      );

      const selected = newAlgorithms.filter((a) => a.selected);
      const selectedModels = selected
        .filter((a) => a.category === "model")
        .map((a) => a.id);
      const selectedMethods = selected
        .filter((a) => a.category === "method")
        .map((a) => a.id);

      return {
        algorithms: newAlgorithms,
        selectedModels,
        selectedMethods,
      };
    });
  },

  selectAlgorithm: (id) => {
    set((state) => {
      const newAlgorithms = state.algorithms.map((a) =>
        a.id === id ? { ...a, selected: true } : a,
      );

      const selected = newAlgorithms.filter((a) => a.selected);
      const selectedModels = selected
        .filter((a) => a.category === "model")
        .map((a) => a.id);
      const selectedMethods = selected
        .filter((a) => a.category === "method")
        .map((a) => a.id);

      return {
        algorithms: newAlgorithms,
        selectedModels,
        selectedMethods,
      };
    });
  },

  deselectAlgorithm: (id) => {
    set((state) => {
      const newAlgorithms = state.algorithms.map((a) =>
        a.id === id ? { ...a, selected: false } : a,
      );

      const selected = newAlgorithms.filter((a) => a.selected);
      const selectedModels = selected
        .filter((a) => a.category === "model")
        .map((a) => a.id);
      const selectedMethods = selected
        .filter((a) => a.category === "method")
        .map((a) => a.id);

      return {
        algorithms: newAlgorithms,
        selectedModels,
        selectedMethods,
      };
    });
  },

  selectAllModels: () => {
    set((state) => {
      const newAlgorithms = state.algorithms.map((a) =>
        a.category === "model" ? { ...a, selected: true } : a,
      );

      const selectedModels = newAlgorithms
        .filter((a) => a.category === "model")
        .map((a) => a.id);

      return {
        algorithms: newAlgorithms,
        selectedModels,
      };
    });
  },

  selectAllMethods: () => {
    set((state) => {
      const newAlgorithms = state.algorithms.map((a) =>
        a.category === "method" ? { ...a, selected: true } : a,
      );

      const selectedMethods = newAlgorithms
        .filter((a) => a.category === "method")
        .map((a) => a.id);

      return {
        algorithms: newAlgorithms,
        selectedMethods,
      };
    });
  },

  deselectAll: () => {
    set((state) => ({
      algorithms: state.algorithms.map((a) => ({ ...a, selected: false })),
      selectedModels: [],
      selectedMethods: [],
    }));
  },

  setLoading: (loading) => {
    set({ loading });
  },

  reset: () => {
    set({
      algorithms: DEFAULT_ALGORITHMS,
      selectedModels: [],
      selectedMethods: [],
      loading: false,
    });
  },
}));
