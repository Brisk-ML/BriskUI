import { FileText, Github } from "lucide-react";
import { useProjectStore } from "@/shared/stores/useProjectStore";

interface ProjectHeaderProps {
  projectName?: string;
}

export function ProjectHeader({
  projectName: customProjectName,
}: ProjectHeaderProps) {
  const { projectName: storeProjectName } = useProjectStore();
  // Allow override via prop, otherwise use store value
  const projectName = customProjectName ?? storeProjectName;

  return (
    <div className="px-4 sm:px-6 md:px-8 py-4 sm:py-5 md:py-6 border-b border-border-primary">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Project Name */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white font-display">
          {projectName}
        </h1>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <button
            className="w-11 h-11 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center hover:bg-bg-tertiary transition-colors text-text-tertiary hover:text-text-primary"
            title="GitHub Repository"
          >
            <Github size={20} />
          </button>
          <button
            className="w-11 h-11 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center hover:bg-bg-tertiary transition-colors text-text-tertiary hover:text-text-primary"
            title="Files"
          >
            <FileText size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
