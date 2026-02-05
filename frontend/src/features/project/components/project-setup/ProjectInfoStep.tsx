import { useEffect, useState, useCallback } from "react";
import { getServerStatus, validatePath } from "@/api";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Textarea } from "@/shared/components/ui/textarea";
import { useProjectWizardStore, type ProblemType } from "@/features/project/stores/useProjectWizardStore";

export function ProjectInfoStep() {
  const { projectInfo, setProjectInfo, problemType, setProblemType, mode } = useProjectWizardStore();
  const [pathError, setPathError] = useState<string | null>(null);
  const [isValidatingPath, setIsValidatingPath] = useState(false);

  // Load default path from backend on mount (only in create mode with empty path)
  useEffect(() => {
    if (mode === "create" && !projectInfo.projectPath) {
      getServerStatus().then((status) => {
        if (status.project_path && !projectInfo.projectPath) {
          setProjectInfo({ projectPath: status.project_path });
        }
      }).catch(() => {
        // Ignore errors - path will just be empty
      });
    }
  }, [mode, projectInfo.projectPath, setProjectInfo]);

  // Debounced path validation
  const validateProjectPath = useCallback(async (path: string) => {
    if (!path.trim()) {
      setPathError(null);
      return;
    }
    
    setIsValidatingPath(true);
    try {
      const result = await validatePath(path);
      if (!result.exists) {
        setPathError("Path does not exist");
      } else if (!result.is_directory) {
        setPathError("Path is not a directory");
      } else {
        setPathError(null);
      }
    } catch {
      setPathError("Could not validate path");
    }
    setIsValidatingPath(false);
  }, []);

  // Validate path when it changes (with debounce)
  useEffect(() => {
    const timer = setTimeout(() => {
      validateProjectPath(projectInfo.projectPath);
    }, 500);
    return () => clearTimeout(timer);
  }, [projectInfo.projectPath, validateProjectPath]);

  return (
    <div className="w-full max-w-[calc(100vw-2rem)] sm:max-w-[600px] md:max-w-[720px] lg:max-w-[900px] xl:max-w-[1050px] 2xl:max-w-[1200px] mx-auto min-h-[calc(100vh-12rem)] md:min-h-[calc(100vh-10rem)] flex flex-col">
      {/* Form Container */}
      <div className="bg-[#181818] border border-[#404040] lg:border-2 p-3 sm:p-4 md:p-6 lg:p-[18px] flex-1 flex flex-col min-h-0">
        {/* Header */}
        <div className="mb-3 sm:mb-4 md:mb-6 lg:mb-[12px]">
          <h1 className="h1-underline text-xl sm:text-2xl md:text-3xl lg:text-[36px] font-bold text-[#ebebeb] font-display">
            Project Information
          </h1>
        </div>

        {/* Form Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 md:gap-6 lg:gap-8 flex-1 min-h-0">
          {/* Left Column */}
          <div className="space-y-3 sm:space-y-4 md:space-y-5 lg:space-y-6">
            {/* Name */}
            <div className="space-y-1 sm:space-y-1.5 lg:space-y-2">
              <Label className="text-white text-base sm:text-lg md:text-xl lg:text-[28px] font-normal font-display block">
                Name
              </Label>
              <Input
                value={projectInfo.projectName}
                onChange={(e) => setProjectInfo({ projectName: e.target.value })}
                placeholder="Project Name"
                className="bg-[#282828] border-[#404040] text-white text-sm sm:text-base md:text-[17px] lg:text-[18px] h-9 sm:h-10 lg:h-[40px] placeholder:text-white/60 w-full lg:max-w-[400px]"
              />
            </div>

            {/* Project Path */}
            <div className="space-y-1 sm:space-y-1.5 lg:space-y-2">
              <Label className="text-white text-base sm:text-lg md:text-xl lg:text-[28px] font-normal font-display block">
                Project Path
              </Label>
              <div className="relative">
                <Input
                  value={projectInfo.projectPath}
                  onChange={(e) => setProjectInfo({ projectPath: e.target.value })}
                  placeholder="path/to/project"
                  className={`bg-[#282828] text-white text-sm sm:text-base md:text-[17px] lg:text-[18px] h-9 sm:h-10 lg:h-[40px] placeholder:text-white/40 w-full lg:max-w-[400px] ${
                    pathError ? "border-red-500" : "border-[#404040]"
                  }`}
                />
                {isValidatingPath && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 text-sm">
                    ...
                  </span>
                )}
              </div>
              {pathError && (
                <p className="text-red-400 text-sm font-display">{pathError}</p>
              )}
              {mode === "create" && !pathError && projectInfo.projectPath && (
                <p className="text-white/50 text-sm font-display">
                  Project will be created in this directory
                </p>
              )}
            </div>

            {/* Problem Type */}
            <div className="space-y-1 sm:space-y-1.5 lg:space-y-2">
              <Label className="text-white text-base sm:text-lg md:text-xl lg:text-[28px] font-normal font-display block">
                Problem Type
              </Label>
              <Select 
                value={problemType} 
                onValueChange={(v) => setProblemType(v as ProblemType)}
              >
                <SelectTrigger className="bg-[#282828] border-[#404040] text-white text-sm sm:text-base md:text-[17px] lg:text-[18px] h-9 sm:h-10 lg:h-[40px] w-full max-w-[180px] sm:max-w-[220px]">
                  <SelectValue
                    placeholder="Select one"
                    className="text-white/40"
                  />
                </SelectTrigger>
                <SelectContent className="bg-[#282828] border-[#404040]">
                  <SelectItem
                    value="classification"
                    className="text-white text-sm sm:text-base"
                  >
                    Classification
                  </SelectItem>
                  <SelectItem
                    value="regression"
                    className="text-white text-sm sm:text-base"
                  >
                    Regression
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Right Column - Description */}
          <div className="flex flex-col min-h-0 space-y-1 sm:space-y-1.5 lg:space-y-2">
            <Label className="text-white text-base sm:text-lg md:text-xl lg:text-[28px] font-normal font-display block shrink-0">
              Description
            </Label>
            <Textarea
              value={projectInfo.projectDescription}
              onChange={(e) => setProjectInfo({ projectDescription: e.target.value })}
              placeholder="This is a classification project training on ..."
              className="bg-[#282828] border-[#404040] text-white text-sm sm:text-base md:text-[17px] lg:text-[18px] min-h-[200px] sm:min-h-[280px] md:min-h-[350px] lg:min-h-[400px] xl:min-h-[450px] resize-none placeholder:text-white/40 w-full lg:max-w-[400px] [field-sizing:auto]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
