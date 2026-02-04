import { create } from "zustand";
import { getProjectSettings, updateProjectSettings } from "@/api";

interface ProjectState {
  projectName: string;
  projectDescription: string;
  projectPath: string;
  isLoading: boolean;
  error: string | null;
  fetchProjectSettings: () => Promise<void>;
  setProjectInfo: (info: {
    name?: string;
    description?: string;
    path?: string;
  }) => Promise<void>;
  deleteProject: () => void;
}

export const useProjectStore = create<ProjectState>()((set, get) => ({
  projectName: "Loading...",
  projectDescription: "",
  projectPath: "",
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

    try {
      const settings = await updateProjectSettings(update);
      set({
        projectName: settings.project_name || "Untitled Project",
        projectDescription: settings.project_description,
        projectPath: settings.project_path,
      });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to save settings",
      });
      throw err;
    }
  },

  // Reset to default project state (local only for now)
  deleteProject: () => {
    set({
      projectName: "New Project",
      projectDescription: "",
      projectPath: "",
    });
  },
}));
