import { useEffect, useState } from "react";
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
import { useProjectStore } from "@/shared/stores/useProjectStore";

export function ProjectInfoStep() {
  const { projectName, projectPath, projectDescription, setProjectInfo } =
    useProjectStore();

  const [localName, setLocalName] = useState(projectName);
  const [localPath, setLocalPath] = useState(projectPath);
  const [localDescription, setLocalDescription] =
    useState(projectDescription);
  const [problemType, setProblemType] = useState("");

  useEffect(() => {
    setProjectInfo({
      name: localName,
      path: localPath,
      description: localDescription,
    });
  }, [localName, localPath, localDescription, setProjectInfo]);

  return (
    <div className="w-full max-w-[calc(100vw-2rem)] sm:max-w-[600px] md:max-w-[720px] lg:max-w-[900px] xl:max-w-[1050px] 2xl:max-w-[1200px] mx-auto">
      {/* Form Container */}
      <div className="bg-[#181818] border border-[#404040] lg:border-2 p-3 sm:p-4 md:p-6 lg:p-[18px]">
        {/* Header */}
        <div className="mb-3 sm:mb-4 md:mb-6 lg:mb-[12px]">
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-[36px] font-bold text-[#ebebeb] font-display relative inline-block">
            Project Information
            <div className="absolute -bottom-0.5 sm:-bottom-1 left-0 w-full h-[2px] bg-white opacity-80" />
          </h1>
        </div>

        {/* Form Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 md:gap-6 lg:gap-[54px]">
          {/* Left Column */}
          <div className="space-y-3 sm:space-y-4 md:space-y-5 lg:space-y-[95px]">
            {/* Name */}
            <div className="space-y-1 sm:space-y-1.5 lg:space-y-2">
              <Label className="text-white text-base sm:text-lg md:text-xl lg:text-[28px] font-normal font-display block">
                Name
              </Label>
              <Input
                value={localName}
                onChange={(e) => setLocalName(e.target.value)}
                placeholder="Project Name"
                className="bg-[#282828] border-[#404040] text-white text-sm sm:text-base md:text-[17px] lg:text-[18px] h-9 sm:h-10 lg:h-[40px] placeholder:text-white/60 w-full lg:max-w-[400px]"
              />
            </div>

            {/* Project Path */}
            <div className="space-y-1 sm:space-y-1.5 lg:space-y-2">
              <Label className="text-white text-base sm:text-lg md:text-xl lg:text-[28px] font-normal font-display block">
                Project Path
              </Label>
              <Input
                value={localPath}
                onChange={(e) => setLocalPath(e.target.value)}
                placeholder="path/to/project"
                className="bg-[#282828] border-[#404040] text-white text-sm sm:text-base md:text-[17px] lg:text-[18px] h-9 sm:h-10 lg:h-[40px] placeholder:text-white/40 w-full lg:max-w-[400px]"
              />
            </div>

            {/* Problem Type */}
            <div className="space-y-1 sm:space-y-1.5 lg:space-y-2">
              <Label className="text-white text-base sm:text-lg md:text-xl lg:text-[28px] font-normal font-display block">
                Problem Type
              </Label>
              <Select value={problemType} onValueChange={setProblemType}>
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
                  <SelectItem
                    value="clustering"
                    className="text-white text-sm sm:text-base"
                  >
                    Clustering
                  </SelectItem>
                  <SelectItem
                    value="other"
                    className="text-white text-sm sm:text-base"
                  >
                    Other
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Right Column - Description */}
          <div className="space-y-1 sm:space-y-1.5 lg:space-y-2">
            <Label className="text-white text-base sm:text-lg md:text-xl lg:text-[28px] font-normal font-display block">
              Description
            </Label>
            <Textarea
              value={localDescription}
              onChange={(e) => setLocalDescription(e.target.value)}
              placeholder="This is a classification project training on ..."
              className="bg-[#282828] border-[#404040] text-white text-sm sm:text-base md:text-[17px] lg:text-[18px] h-[160px] sm:h-[200px] md:h-[230px] lg:h-[289px] resize-none placeholder:text-white/40 w-full lg:max-w-[400px]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
