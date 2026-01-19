import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
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
import { ProjectHeader } from "@/shared/components/layout/ProjectHeader";

const ALGORITHMS = [
  "Algorithm 1",
  "Algorithm 2",
  "Algorithm 3",
  "Algorithm 4",
  "Algorithm 5",
  "Algorithm 6",
  "Algorithm 7",
  "Algorithm 8",
  "Algorithm 9",
  "Algorithm 10",
  "Algorithm 11",
  "Algorithm 12",
  "Algorithm 13",
  "Algorithm 14",
];

const DATASETS = ["Dataset 1", "Dataset 2", "Dataset 3"];

interface ExperimentGroup {
  id: string;
  name: string;
  description: string;
  datasets: string[];
}

export default function ExperimentsPage() {
  const [name, setName] = useState("");
  const [selectedDataset, setSelectedDataset] = useState("");
  const [description, setDescription] = useState("");
  const [selectedAlgorithms, setSelectedAlgorithms] = useState<string[]>(
    [],
  );
  const [groups, setGroups] = useState<ExperimentGroup[]>([
    {
      id: "1",
      name: "Group Name",
      description: "Description",
      datasets: ["Datasets"],
    },
    {
      id: "2",
      name: "Testing",
      description: "Describe the group",
      datasets: ["Dataset 1"],
    },
  ]);

  const handleAlgorithmToggle = (algorithm: string) => {
    setSelectedAlgorithms((prev) =>
      prev.includes(algorithm)
        ? prev.filter((a) => a !== algorithm)
        : [...prev, algorithm],
    );
  };

  const handleReset = () => {
    setName("");
    setSelectedDataset("");
    setDescription("");
    setSelectedAlgorithms([]);
  };

  const handleAddGroup = () => {
    if (!name.trim()) return;

    // Create new experiment group and add to list, then reset form
    const newGroup: ExperimentGroup = {
      id: Date.now().toString(), // Simple ID generation for now
      name: name.trim(),
      description: description.trim() || "No description",
      datasets: selectedDataset ? [selectedDataset] : [],
    };

    setGroups((prev) => [...prev, newGroup]);
    handleReset();
  };

  return (
    <div
      className="min-h-screen flex flex-col overflow-x-hidden pb-20 md:pb-0"
      style={{
        background:
          "linear-gradient(180deg, rgba(18, 18, 18, 1) 39%, rgba(40, 40, 40, 1) 100%)",
      }}
    >
      <ProjectHeader />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto flex flex-col items-center justify-start pt-6 sm:pt-8 lg:pt-12 xl:pt-[144px] px-3 sm:px-4 lg:px-6">
        {/* Add Experiments Form */}
        <div className="w-full max-w-[1055px] bg-[#181818] border-2 border-[#404040] p-3 sm:p-4 lg:p-6">
          {/* Header */}
          <div className="mb-4 sm:mb-6">
            <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-[36px] font-bold text-[#ebebeb] font-display relative inline-block">
              Add Experiments
              <div className="absolute -bottom-1 sm:-bottom-2 left-0 w-full max-w-[330px] h-[2px] bg-white" />
            </h1>
          </div>

          {/* Form Inputs Row */}
          <div className="flex flex-col md:flex-row gap-4 md:gap-6 lg:gap-8 mb-4 sm:mb-6">
            {/* Name Input */}
            <div className="flex flex-col gap-1 sm:gap-2 w-full md:w-[180px] lg:w-[200px]">
              <Label className="text-white text-base sm:text-lg lg:text-xl xl:text-[24px] font-normal font-display">
                Name
              </Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Group name"
                className="bg-[#282828] border-[#404040] text-white text-sm sm:text-base lg:text-lg h-[36px] sm:h-[38px] lg:h-[40px] placeholder:text-white/60"
              />
            </div>

            {/* Datasets Dropdown */}
            <div className="flex flex-col gap-1 sm:gap-2 w-full md:w-[140px] lg:w-[150px]">
              <Label className="text-white text-base sm:text-lg lg:text-xl xl:text-[24px] font-normal font-display">
                Datasets
              </Label>
              <Select
                value={selectedDataset}
                onValueChange={setSelectedDataset}
              >
                <SelectTrigger className="bg-[#282828] border-[#404040] text-white h-[36px] sm:h-[38px] lg:h-[40px] text-sm sm:text-base">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent className="bg-[#282828] border-[#404040]">
                  {DATASETS.map((dataset) => (
                    <SelectItem
                      key={dataset}
                      value={dataset}
                      className="text-white hover:bg-[#363636]"
                    >
                      {dataset}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Description Textarea */}
            <div className="flex flex-col gap-1 sm:gap-2 w-full md:flex-1 lg:w-[300px]">
              <Label className="text-white text-base sm:text-lg lg:text-xl xl:text-[24px] font-normal font-display">
                Description
              </Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional"
                className="bg-[#282828] border-[#404040] text-white text-sm sm:text-base lg:text-lg min-h-[80px] sm:min-h-[100px] lg:min-h-[121px] resize-none placeholder:text-white/60"
              />
            </div>
          </div>

          {/* Algorithms Section */}
          <div className="mb-4 sm:mb-6">
            <Label className="text-white text-base sm:text-lg lg:text-xl xl:text-[24px] font-normal font-display block mb-1 sm:mb-2">
              Algorithms
            </Label>
            <div className="bg-[#282828] border-2 border-[#404040] p-2 sm:p-3 lg:p-4 max-h-[200px] sm:max-h-[240px] lg:max-h-[284px] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 sm:gap-x-6 lg:gap-x-8 gap-y-1 sm:gap-y-2">
                {ALGORITHMS.map((algorithm) => (
                  <div
                    key={algorithm}
                    className="flex items-center gap-2 py-0.5 sm:py-1"
                  >
                    <Checkbox
                      id={algorithm}
                      checked={selectedAlgorithms.includes(algorithm)}
                      onCheckedChange={() => handleAlgorithmToggle(algorithm)}
                      className="bg-[#121212] border-[#363636] data-[state=checked]:bg-accent-500 h-4 w-4 sm:h-5 sm:w-5"
                    />
                    <label
                      htmlFor={algorithm}
                      className="text-white text-sm sm:text-base lg:text-lg font-normal font-display cursor-pointer"
                    >
                      {algorithm}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4">
            <Button
              variant="outline"
              onClick={handleReset}
              className="border-[#404040] bg-[#121212] text-white hover:text-white hover:bg-[#121212]/80 h-[40px] sm:h-[45px] lg:h-[50px] text-base sm:text-lg lg:text-xl xl:text-[24px] px-4 sm:px-6 lg:px-8 w-full sm:w-auto sm:min-w-[120px] lg:min-w-[150px]"
            >
              Reset
            </Button>
            <Button
              onClick={handleAddGroup}
              className="bg-[#006b4c] hover:bg-[#005a3f] text-white h-[40px] sm:h-[45px] lg:h-[50px] text-base sm:text-lg lg:text-xl xl:text-[28px] px-4 sm:px-6 lg:px-8 w-full sm:w-auto sm:min-w-[160px] lg:min-w-[200px]"
            >
              Add Group
            </Button>
          </div>
        </div>

        {/* Experiment Groups Bar */}
        <div className="w-full max-w-[1055px] bg-[#282828] border-2 border-[#363636] mt-3 sm:mt-4 mb-4 sm:mb-6 overflow-hidden">
          <div className="flex gap-2 sm:gap-3 lg:gap-4 p-2 sm:p-3 lg:p-4 overflow-x-auto">
            {groups.map((group) => (
              <div
                key={group.id}
                className="bg-[#121212] border border-[#363636] p-2 flex flex-col gap-2 sm:gap-3 lg:gap-4 min-w-[180px] sm:min-w-[210px] lg:min-w-[250px] w-[180px] sm:w-[210px] lg:w-[250px] h-[180px] sm:h-[210px] lg:h-[250px] shrink-0"
              >
                {/* Group Name */}
                <div className="text-white text-lg sm:text-xl lg:text-2xl xl:text-[28px] font-normal font-display h-[32px] sm:h-[36px] lg:h-[40px] flex items-center truncate">
                  {group.name}
                </div>
                {/* Divider */}
                <div className="h-[1px] bg-white/20 w-full max-w-[225px]" />
                {/* Description */}
                <div className="text-[#b3b3b3] text-base sm:text-lg lg:text-xl xl:text-[24px] font-normal font-display line-clamp-2">
                  {group.description}
                </div>
                {/* Datasets */}
                <div className="text-[#b3b3b3] text-base sm:text-lg lg:text-xl xl:text-[24px] font-normal font-display line-clamp-2">
                  {group.datasets.length > 0
                    ? group.datasets.join(", ")
                    : "No datasets"}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
