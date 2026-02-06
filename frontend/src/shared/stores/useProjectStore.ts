import { create } from "zustand";
import {
  getProjectSettings,
  updateProjectSettings,
  deleteProject as deleteProjectApi,
  type ProblemType,
} from "@/api";

interface ProjectState {
  projectName: string;
  projectDescription: string;
  projectPath: string;
  projectType: ProblemType;
  isLoading: boolean;
  error: string | null;
  fetchProjectSettings: () => Promise<void>;
  setProjectInfo: (info: {
    name?: string;
    description?: string;
    path?: string;
    projectType?: ProblemType;
  }) => Promise<void>;
  deleteProject: () => Promise<void>;
  resetToNewProject: () => void;
}

export const useProjectStore = create<ProjectState>()((set) => ({
  projectName: "Loading...",
  projectDescription: "",
  projectPath: "",
  projectType: "classification",
  isLoading: false,
  error: null,

  // Fetch settings from backend
  fetchProjectSettings: async () => {
    set({ isLoading: true, error: null });
    try {
      const settings = await getProjectSettings();
      set({
        projectName: settings.project_name || "Untitled Project",
        projectDescription: settings.project_description,
        projectPath: settings.project_path,
        projectType: settings.project_type || "classification",
        isLoading: false,
      });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to load settings",
        isLoading: false,
      });
    }
  },

  // Partial update - saves to backend
  setProjectInfo: async (info) => {
    const update: Record<string, string> = {};
    if (info.name !== undefined) update.project_name = info.name;
    if (info.description !== undefined) update.project_description = info.description;
    if (info.path !== undefined) update.project_path = info.path;
    if (info.projectType !== undefined) update.project_type = info.projectType;

    try {
      const settings = await updateProjectSettings(update);
      set({
        projectName: settings.project_name || "Untitled Project",
        projectDescription: settings.project_description,
        projectPath: settings.project_path,
        projectType: settings.project_type || "classification",
      });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to save settings",
      });
      throw err;
    }
  },

  // Delete the project via backend API
  deleteProject: async () => {
    try {
      await deleteProjectApi();
      // Reset to new project state after successful deletion
      set({
        projectName: "New Project",
        projectDescription: "",
        projectPath: "",
        projectType: "classification",
        error: null,
      });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to delete project",
      });
      throw err;
    }
  },

  // Reset to new project state (local only, for UI purposes)
  resetToNewProject: () => {
    set({
      projectName: "New Project",
      projectDescription: "",
      projectPath: "",
      projectType: "classification",
      error: null,
    });
  },
}));
