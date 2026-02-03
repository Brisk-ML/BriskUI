import { create } from "zustand";

export interface WorkflowMethod {
  id: string;
  model: string;
  xVariable: string;
  yVariable: string;
  metrics: string[];
  filename: string;
  cv: number;
}

export interface WorkflowStepState {
  methods: WorkflowMethod[];
  selectedMethodId: string | null;
  isModalOpen: boolean;
  loading: boolean;

  // Actions
  addMethod: (method: WorkflowMethod) => void;
  removeMethod: (id: string) => void;
  updateMethod: (id: string, updates: Partial<WorkflowMethod>) => void;
  reorderMethods: (fromIndex: number, toIndex: number) => void;
  selectMethod: (id: string | null) => void;
  openModal: () => void;
  closeModal: () => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

export const useWorkflowStepStore = create<WorkflowStepState>((set) => ({
  methods: [],
  selectedMethodId: null,
  isModalOpen: false,
  loading: false,

  addMethod: (method) => {
    set((state) => ({
      methods: [...state.methods, method],
      isModalOpen: false,
    }));
  },

  removeMethod: (id) => {
    set((state) => ({
      methods: state.methods.filter((m) => m.id !== id),
      selectedMethodId:
        state.selectedMethodId === id ? null : state.selectedMethodId,
    }));
  },

  updateMethod: (id, updates) => {
    set((state) => ({
      methods: state.methods.map((m) =>
        m.id === id ? { ...m, ...updates } : m,
      ),
    }));
  },

  reorderMethods: (fromIndex, toIndex) => {
    set((state) => {
      const methods = [...state.methods];
      const [removed] = methods.splice(fromIndex, 1);
      methods.splice(toIndex, 0, removed);
      return { methods };
    });
  },

  selectMethod: (id) => {
    set({ selectedMethodId: id });
  },

  openModal: () => {
    set({ isModalOpen: true });
  },

  closeModal: () => {
    set({ isModalOpen: false });
  },

  setLoading: (loading) => {
    set({ loading });
  },

  reset: () => {
    set({
      methods: [],
      selectedMethodId: null,
      isModalOpen: false,
      loading: false,
    });
  },
}));
