import { create } from "zustand";

export type SyncStatus = "idle" | "syncing" | "success" | "error";

export interface SyncSummary {
  projectInfo: boolean;
  datasets: boolean;
  dataProcessing: boolean;
  algorithms: boolean;
  experiments: boolean;
  workflow: boolean;
  report: boolean;
}

export interface SyncStepState {
  status: SyncStatus;
  progress: number;
  error: string | null;
  summary: SyncSummary;

  // Actions
  startSync: () => Promise<void>;
  cancelSync: () => void;
  setSummary: (summary: Partial<SyncSummary>) => void;
  setStatus: (status: SyncStatus) => void;
  setProgress: (progress: number) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const DEFAULT_SUMMARY: SyncSummary = {
  projectInfo: true,
  datasets: true,
  dataProcessing: true,
  algorithms: true,
  experiments: true,
  workflow: true,
  report: true,
};

export const useSyncStepStore = create<SyncStepState>((set, get) => ({
  status: "idle",
  progress: 0,
  error: null,
  summary: DEFAULT_SUMMARY,

  startSync: async () => {
    set({ status: "syncing", progress: 0, error: null });

    try {
      // Simulate sync progress
      for (let i = 0; i <= 100; i += 10) {
        await new Promise((resolve) => setTimeout(resolve, 200));
        if (get().status !== "syncing") return; // Check if cancelled
        set({ progress: i });
      }

      set({ status: "success", progress: 100 });
    } catch (error) {
      set({
        status: "error",
        error: error instanceof Error ? error.message : "Sync failed",
      });
    }
  },

  cancelSync: () => {
    set({ status: "idle", progress: 0 });
  },

  setSummary: (summary) => {
    set((state) => ({
      summary: { ...state.summary, ...summary },
    }));
  },

  setStatus: (status) => {
    set({ status });
  },

  setProgress: (progress) => {
    set({ progress });
  },

  setError: (error) => {
    set({ error });
  },

  reset: () => {
    set({
      status: "idle",
      progress: 0,
      error: null,
      summary: DEFAULT_SUMMARY,
    });
  },
}));
