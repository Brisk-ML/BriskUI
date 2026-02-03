import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ProjectState {
  projectName: string;
  projectDescription: string;
  projectPath: string;
  setProjectInfo: (info: {
    name?: string;
    description?: string;
    path?: string;
  }) => void;
  deleteProject: () => void;
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set) => ({
      projectName: "My Project",
      projectDescription: "",
      projectPath: "path/to/project",
      // Partial update - only changes what's provided, keeps the rest
      setProjectInfo: (info) =>
        set((state) => ({
          projectName: info.name ?? state.projectName,
          projectDescription: info.description ?? state.projectDescription,
          projectPath: info.path ?? state.projectPath,
        })),
      // Reset to default project state
      deleteProject: () => {
        set({
          projectName: "New Project",
          projectDescription: "",
          projectPath: "",
        });
      },
    }),
    {
      name: "brisk-project-storage",
    },
  ),
);
