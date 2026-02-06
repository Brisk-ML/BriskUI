import { create } from "zustand";
import {
  createProject,
  updateProjectSettings,
  type ProjectSettings,
} from "@/api";

/**
 * Wizard mode determines whether we're creating a new project
 * or editing an existing one.
 */
export type WizardMode = "create" | "edit";

/**
 * Problem type for the project (used to filter algorithms).
 * Only classification and regression are supported.
 */
export type ProblemType = "classification" | "regression";

/**
 * Project info collected in the wizard.
 * This is held locally until synced to backend.
 */
export interface WizardProjectInfo {
  projectName: string;
  projectPath: string;
  projectDescription: string;
}

export interface ProjectWizardState {
  // Navigation
  currentStep: number;
  totalSteps: number;
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;

  // Wizard mode
  mode: WizardMode;
  setMode: (mode: WizardMode) => void;

  // Problem type (used to filter algorithms)
  problemType: ProblemType;
  setProblemType: (type: ProblemType) => void;

  // Project info (Step 1)
  projectInfo: WizardProjectInfo;
  setProjectInfo: (info: Partial<WizardProjectInfo>) => void;

  // Dirty tracking - has data been modified since last sync?
  isDirty: boolean;
  setDirty: (dirty: boolean) => void;

  // Sync status
  isSyncing: boolean;
  syncError: string | null;

  // Created project info (after successful create)
  createdDirectoryName: string | null;
  createdProjectPath: string | null;

  // Actions
  syncProjectInfo: () => Promise<void>;
  loadFromBackend: (settings: ProjectSettings) => void;
  reset: () => void;
}

const DEFAULT_PROJECT_INFO: WizardProjectInfo = {
  projectName: "",
  projectPath: "",
  projectDescription: "",
};

export const useProjectWizardStore = create<ProjectWizardState>((set, get) => ({
  // Navigation
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

  // Wizard mode
  mode: "edit",
  setMode: (mode) => set({ mode }),

  // Problem type
  problemType: "classification",
  setProblemType: (type) => set({ problemType: type }),

  // Project info
  projectInfo: DEFAULT_PROJECT_INFO,
  setProjectInfo: (info) => {
    set((state) => ({
      projectInfo: { ...state.projectInfo, ...info },
      isDirty: true,
    }));
  },

  // Dirty tracking
  isDirty: false,
  setDirty: (dirty) => set({ isDirty: dirty }),

  // Sync status
  isSyncing: false,
  syncError: null,

  // Created project info
  createdDirectoryName: null,
  createdProjectPath: null,

  // Sync project info to backend
  syncProjectInfo: async () => {
    const { mode, projectInfo, problemType } = get();
    set({ isSyncing: true, syncError: null });

    try {
      if (mode === "create") {
        const result = await createProject({
          project_name: projectInfo.projectName,
          project_path: projectInfo.projectPath,
          project_description: projectInfo.projectDescription,
          project_type: problemType,
        });
        set({
          isDirty: false,
          isSyncing: false,
          createdDirectoryName: result.directory_name,
          createdProjectPath: result.project_path,
        });
      } else {
        await updateProjectSettings({
          project_name: projectInfo.projectName,
          project_path: projectInfo.projectPath,
          project_description: projectInfo.projectDescription,
          project_type: problemType,
        });
        set({ isDirty: false, isSyncing: false });
      }
    } catch (err) {
      set({
        syncError: err instanceof Error ? err.message : "Failed to sync",
        isSyncing: false,
      });
      throw err;
    }
  },

  // Load data from backend settings
  loadFromBackend: (settings) => {
    set({
      projectInfo: {
        projectName: settings.project_name,
        projectPath: settings.project_path,
        projectDescription: settings.project_description,
      },
      problemType: settings.project_type || "classification",
      isDirty: false,
      mode: "edit",
    });
  },

  // Reset wizard state
  reset: () => {
    set({
      currentStep: 1,
      mode: "create",
      problemType: "classification",
      projectInfo: DEFAULT_PROJECT_INFO,
      isDirty: false,
      isSyncing: false,
      syncError: null,
      createdDirectoryName: null,
      createdProjectPath: null,
    });
  },
}));
