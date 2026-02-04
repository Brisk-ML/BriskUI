import { create } from "zustand";

export interface ProjectWizardState {
  currentStep: number;
  totalSteps: number;
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
}

export const useProjectWizardStore = create<ProjectWizardState>((set, get) => ({
  currentStep: 1,
  totalSteps: 8,

  setStep: (step: number) => {
    const { totalSteps } = get();
    if (step >= 1 && step <= totalSteps) {
      set({ currentStep: step });
    }
  },

  nextStep: () => {
    const { currentStep, totalSteps } = get();
    if (currentStep < totalSteps) {
      set({ currentStep: currentStep + 1 });
    }
  },

  prevStep: () => {
    const { currentStep } = get();
    if (currentStep > 1) {
      set({ currentStep: currentStep - 1 });
    }
  },

  reset: () => {
    set({ currentStep: 1 });
  },
}));
