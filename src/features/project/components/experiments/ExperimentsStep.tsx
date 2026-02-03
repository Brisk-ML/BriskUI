import { useState } from "react";
import { cn } from "@/lib/utils";
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
import { STYLES } from "@/shared/constants/colors";

// Mock algorithms - in real app, would come from store
const MOCK_ALGORITHMS = Array.from({ length: 14 }, (_, i) => ({
  id: `alg-${i + 1}`,
  name: `Algorithm ${i + 1}`,
}));

// Mock datasets - in real app, would come from store
const MOCK_DATASETS = [
  { id: "dataset-1", name: "Dataset 1" },
  { id: "dataset-2", name: "Dataset 2" },
];

interface ExperimentGroup {
  id: string;
  name: string;
  description: string;
  datasets: string[];
  algorithms: string[];
}

export function ExperimentsStep() {
  const [groupName, setGroupName] = useState("");
  const [selectedDataset, setSelectedDataset] = useState("");
  const [description, setDescription] = useState("");
  const [selectedAlgorithms, setSelectedAlgorithms] = useState<string[]>([]);

  const [groups, setGroups] = useState<ExperimentGroup[]>([]);

  const handleAlgorithmToggle = (algorithmId: string) => {
    setSelectedAlgorithms((prev) =>
      prev.includes(algorithmId)
        ? prev.filter((id) => id !== algorithmId)
        : [...prev, algorithmId],
    );
  };

  const handleReset = () => {
    setGroupName("");
    setSelectedDataset("");
    setDescription("");
    setSelectedAlgorithms([]);
  };

  const handleAddGroup = () => {
    if (!groupName.trim()) return;

    const newGroup: ExperimentGroup = {
      id: crypto.randomUUID(),
      name: groupName,
      description,
      datasets: selectedDataset ? [selectedDataset] : [],
      algorithms: [...selectedAlgorithms],
    };

    setGroups([...groups, newGroup]);
    handleReset();
  };

  return (
    <div className="w-full max-w-[1055px] px-4 xl:px-0 flex flex-col gap-4 sm:gap-6 mx-auto">
      {/* Add Experiments Form */}
      <div className={`${STYLES.bgCard} border-2 ${STYLES.border} p-4 sm:p-6`}>
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <h1 className="h1-underline text-2xl sm:text-3xl lg:text-[36px] font-bold text-white font-display">
            Add Experiments
          </h1>
        </div>

        {/* Form Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_1fr] gap-4 sm:gap-6 mb-6">
          {/* Name */}
          <div>
            <Label className="text-white text-lg sm:text-xl lg:text-[24px] font-display mb-2 block">
              Name
            </Label>
            <Input
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Group name"
              className={`${STYLES.bgCardAlt} ${STYLES.border} text-white h-10 sm:h-[40px] text-base sm:text-[18px] placeholder:text-white/60`}
            />
          </div>

          {/* Datasets */}
          <div>
            <Label className="text-white text-lg sm:text-xl lg:text-[24px] font-display mb-2 block">
              Datasets
            </Label>
            <Select value={selectedDataset} onValueChange={setSelectedDataset}>
              <SelectTrigger
                className={`${STYLES.bgCardAlt} ${STYLES.border} text-white h-10 sm:h-[40px] text-base sm:text-[18px]`}
              >
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent className={`${STYLES.bgCardAlt} ${STYLES.border}`}>
                {MOCK_DATASETS.map((dataset) => (
                  <SelectItem
                    key={dataset.id}
                    value={dataset.id}
                    className="text-white"
                  >
                    {dataset.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div>
            <Label className="text-white text-lg sm:text-xl lg:text-[24px] font-display mb-2 block">
              Description
            </Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional"
              className={`${STYLES.bgCardAlt} ${STYLES.border} text-white text-base sm:text-[18px] placeholder:text-white/60 min-h-[80px] resize-none`}
            />
          </div>
        </div>

        {/* Algorithms */}
        <div className="mb-6">
          <Label className="text-white text-lg sm:text-xl lg:text-[24px] font-display mb-3 block">
            Algorithms
          </Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2 sm:gap-3">
            {MOCK_ALGORITHMS.map((algorithm) => (
              <label
                key={algorithm.id}
                htmlFor={`algorithm-${algorithm.id}`}
                className="flex items-center gap-2 cursor-pointer"
              >
                <Checkbox
                  id={`algorithm-${algorithm.id}`}
                  checked={selectedAlgorithms.includes(algorithm.id)}
                  onCheckedChange={() => handleAlgorithmToggle(algorithm.id)}
                  className={`${STYLES.border} ${STYLES.dataCheckedBgPrimaryLight} ${STYLES.dataCheckedBorderPrimaryLight}`}
                />
                <span className="text-white text-sm sm:text-base lg:text-[18px] font-display">
                  {algorithm.name}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 sm:gap-4 justify-end flex-wrap">
          <Button
            onClick={handleReset}
            variant="outline"
            className={`btn-reset-hover border ${STYLES.border} ${STYLES.bgDark} text-white h-[44px] sm:h-[50px] px-6 sm:px-8 text-xl sm:text-2xl lg:text-[28px] font-display`}
          >
            Reset
          </Button>
          <Button
            onClick={handleAddGroup}
            className={`btn-add-hover ${STYLES.bgPrimary} text-white h-[44px] sm:h-[50px] px-6 sm:px-8 text-xl sm:text-2xl lg:text-[28px] font-display`}
          >
            Add Group
          </Button>
        </div>
      </div>

      {/* Groups List */}
      <div
        className={`${STYLES.bgCardAlt} border-2 ${STYLES.borderSecondary} h-[200px] sm:h-[250px] overflow-hidden`}
      >
        {groups.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-white text-[24px] sm:text-[28px] font-display">
              No groups added
            </p>
          </div>
        ) : (
          <div className="flex gap-4 items-center h-full p-4 overflow-x-auto">
            {groups.map((group) => (
              <div
                key={group.id}
                className={cn(
                  "flex-shrink-0 w-[200px] sm:w-[250px] h-[160px] sm:h-[200px] p-3 sm:p-4 flex flex-col gap-2",
                  `${STYLES.bgDark} border ${STYLES.borderSecondary}`,
                )}
              >
                <div className="text-white text-lg sm:text-[24px] font-display font-bold truncate">
                  {group.name}
                </div>
                <div className="h-[2px] bg-white w-full" />
                <div className="text-white/80 text-sm sm:text-[18px] font-display line-clamp-2">
                  {group.description || "No description"}
                </div>
                <div className="text-white/60 text-sm sm:text-[16px] font-display">
                  {group.datasets.length > 0
                    ? MOCK_DATASETS.find((d) => d.id === group.datasets[0])
                        ?.name || "Dataset"
                    : "No datasets"}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
