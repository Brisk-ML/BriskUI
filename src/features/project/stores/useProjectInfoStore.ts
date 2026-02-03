import { create } from "zustand";

export interface ProjectInfo {
  projectName: string;
  description: string;
  objective: string;
  createdAt: string | null;
}

export interface ProjectInfoState {
  projectInfo: ProjectInfo;
  isValid: boolean;

  // Actions
  setProjectName: (name: string) => void;
  setDescription: (description: string) => void;
  setObjective: (objective: string) => void;
  setProjectInfo: (info: Partial<ProjectInfo>) => void;
  reset: () => void;
}

const DEFAULT_PROJECT_INFO: ProjectInfo = {
  projectName: "",
  description: "",
  objective: "",
  createdAt: null,
};

export const useProjectInfoStore = create<ProjectInfoState>((set) => ({
  projectInfo: DEFAULT_PROJECT_INFO,
  isValid: false,

  setProjectName: (name) => {
    set((state) => {
      const projectInfo = { ...state.projectInfo, projectName: name };
      return {
        projectInfo,
        isValid: name.trim().length > 0,
      };
    });
  },

  setDescription: (description) => {
    set((state) => ({
      projectInfo: { ...state.projectInfo, description },
    }));
  },

  setObjective: (objective) => {
    set((state) => ({
      projectInfo: { ...state.projectInfo, objective },
    }));
  },

  setProjectInfo: (info) => {
    set((state) => {
      const projectInfo = { ...state.projectInfo, ...info };
      return {
        projectInfo,
        isValid: projectInfo.projectName.trim().length > 0,
      };
    });
  },

  reset: () => {
    set({
      projectInfo: DEFAULT_PROJECT_INFO,
      isValid: false,
    });
  },
}));
