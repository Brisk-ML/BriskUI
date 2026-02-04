import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AlgorithmWrapper } from "../types";

interface AlgorithmWrapperState {
  wrappers: AlgorithmWrapper[];
  addWrapper: (wrapper: Omit<AlgorithmWrapper, "id">) => void;
  updateWrapper: (id: string, updates: Partial<AlgorithmWrapper>) => void;
  deleteWrapper: (id: string) => void;
  clearWrappers: () => void;
}

export const useAlgorithmWrapperStore = create<AlgorithmWrapperState>()(
  persist(
    (set) => ({
      wrappers: [],

      addWrapper: (wrapper) => {
        const newWrapper: AlgorithmWrapper = {
          ...wrapper,
          id: `wrapper-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        };
        set((state) => ({
          wrappers: [...state.wrappers, newWrapper],
        }));
      },

      updateWrapper: (id, updates) => {
        set((state) => ({
          wrappers: state.wrappers.map((w) =>
            w.id === id ? { ...w, ...updates } : w,
          ),
        }));
      },

      deleteWrapper: (id) => {
        set((state) => ({
          wrappers: state.wrappers.filter((w) => w.id !== id),
        }));
      },

      clearWrappers: () => {
        set({ wrappers: [] });
      },
    }),
    {
      name: "brisk-algorithm-wrappers-storage",
    },
  ),
);
