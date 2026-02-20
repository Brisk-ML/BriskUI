import { create } from "zustand";

/**
 * A single workflow step: one evaluator call with its arguments.
 * Order in the list = order of execution in the workflow.
 */
export interface WorkflowStep {
  id: string;
  evaluatorId: string; // key from workflow evaluators catalog
  methodName: string;  // Python method name on Workflow (e.g. "evaluate_model")
  args: Record<string, unknown>; // collected form values (X, y, metrics, filename, etc.)
}

export interface WorkflowStepState {
  steps: WorkflowStep[];

  addStep: (step: Omit<WorkflowStep, "id">) => void;
  updateStep: (id: string, updates: Partial<Pick<WorkflowStep, "args">>) => void;
  removeStep: (id: string) => void;
  moveStep: (id: string, direction: "up" | "down") => void;

  reset: () => void;
}

export const useWorkflowStepStore = create<WorkflowStepState>((set, get) => ({
  steps: [],

  addStep: (step) => {
    const newStep: WorkflowStep = {
      ...step,
      id: `step-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    };
    set((state) => ({ steps: [...state.steps, newStep] }));
  },

  updateStep: (id, updates) => {
    set((state) => ({
      steps: state.steps.map((s) =>
        s.id === id ? { ...s, ...updates } : s
      ),
    }));
  },

  removeStep: (id) => {
    set((state) => ({ steps: state.steps.filter((s) => s.id !== id) }));
  },

  moveStep: (id, direction) => {
    const { steps } = get();
    const idx = steps.findIndex((s) => s.id === id);
    if (idx < 0) return;
    const newIdx = direction === "up" ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= steps.length) return;
    const next = [...steps];
    [next[idx], next[newIdx]] = [next[newIdx], next[idx]];
    set({ steps: next });
  },

  reset: () => set({ steps: [] }),
}));
