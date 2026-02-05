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
import { useDatasetsStepStore } from "@/features/project/stores/useDatasetsStepStore";
import { useAlgorithmsStepStore } from "@/features/project/stores/useAlgorithmsStepStore";
import {
  useExperimentsStepStore,
  type ExperimentGroup,
} from "@/features/project/stores/useExperimentsStepStore";
import { useDataProcessingStepStore } from "@/features/project/stores/useDataProcessingStepStore";

export function ExperimentsStep() {
  // Get datasets from the datasets step store
  const { datasets } = useDatasetsStepStore();

  // Get algorithms from the algorithms step store
  const { wrappers: algorithms } = useAlgorithmsStepStore();

  // Get experiment groups and actions from the experiments store
  const { groups, addGroup, deleteGroup } = useExperimentsStepStore();

  // Get data processing config to check for non-default values
  const { datasetConfigs, baseDataManager } = useDataProcessingStepStore();

  // Check if a dataset uses default data manager (no overrides)
  const usesDefaultDataManager = (datasetId: string): boolean => {
    const config = datasetConfigs[datasetId];
    if (!config || !config.dataManager) return true;

    const dm = config.dataManager;
    // Check if any values differ from base data manager
    if (dm.testSize !== undefined && dm.testSize !== baseDataManager.testSize)
      return false;
    if (dm.nSplits !== undefined && dm.nSplits !== baseDataManager.nSplits)
      return false;
    if (
      dm.splitMethod !== undefined &&
      dm.splitMethod !== baseDataManager.splitMethod
    )
      return false;
    if (
      dm.groupColumn !== undefined &&
      dm.groupColumn !== baseDataManager.groupColumn
    )
      return false;
    if (
      dm.stratified !== undefined &&
      dm.stratified !== baseDataManager.stratified
    )
      return false;
    if (
      dm.randomState !== undefined &&
      dm.randomState !== baseDataManager.randomState
    )
      return false;

    return true;
  };

  // Form state
  const [groupName, setGroupName] = useState("");
  const [selectedDatasetId, setSelectedDatasetId] = useState("");
  const [description, setDescription] = useState("");
  const [selectedAlgorithms, setSelectedAlgorithms] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleAlgorithmToggle = (algorithmName: string) => {
    setSelectedAlgorithms((prev) =>
      prev.includes(algorithmName)
        ? prev.filter((name) => name !== algorithmName)
        : [...prev, algorithmName]
    );
  };

  const handleSelectAll = () => {
    setSelectedAlgorithms(algorithms.map((a) => a.name));
  };

  const handleDeselectAll = () => {
    setSelectedAlgorithms([]);
  };

  const handleReset = () => {
    setGroupName("");
    setSelectedDatasetId("");
    setDescription("");
    setSelectedAlgorithms([]);
    setError(null);
  };

  const handleAddGroup = () => {
    setError(null);

    if (!groupName.trim()) {
      setError("Group name is required");
      return;
    }

    if (!selectedDatasetId) {
      setError("Please select a dataset");
      return;
    }

    if (selectedAlgorithms.length === 0) {
      setError("Please select at least one algorithm");
      return;
    }

    const dataset = datasets.find((d) => d.id === selectedDatasetId);
    if (!dataset) {
      setError("Selected dataset not found");
      return;
    }

    const result = addGroup({
      name: groupName.trim(),
      description: description.trim(),
      datasetId: selectedDatasetId,
      datasetFileName: dataset.fileName,
      datasetTableName: dataset.tableName || null,
      algorithms: [...selectedAlgorithms],
      useDefaultDataManager: usesDefaultDataManager(selectedDatasetId),
    });

    if (!result.success) {
      setError(result.error || "Failed to add group");
      return;
    }

    handleReset();
  };

  const handleDeleteGroup = (groupId: string) => {
    deleteGroup(groupId);
  };

  // Find dataset name for display
  const getDatasetDisplayName = (group: ExperimentGroup) => {
    const dataset = datasets.find((d) => d.id === group.datasetId);
    return dataset?.fileName || group.datasetFileName;
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

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded">
            <p className="text-red-400 text-sm font-display">{error}</p>
          </div>
        )}

        {/* Empty State Warnings */}
        {datasets.length === 0 && (
          <div className="mb-4 p-3 bg-yellow-500/20 border border-yellow-500/50 rounded">
            <p className="text-yellow-400 text-sm font-display">
              No datasets added. Go back to the Datasets step to add datasets.
            </p>
          </div>
        )}

        {algorithms.length === 0 && (
          <div className="mb-4 p-3 bg-yellow-500/20 border border-yellow-500/50 rounded">
            <p className="text-yellow-400 text-sm font-display">
              No algorithms added. Go back to the Algorithms step to add
              algorithms.
            </p>
          </div>
        )}

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
              Dataset
            </Label>
            <Select
              value={selectedDatasetId}
              onValueChange={setSelectedDatasetId}
            >
              <SelectTrigger
                className={`${STYLES.bgCardAlt} ${STYLES.border} text-white h-10 sm:h-[40px] text-base sm:text-[18px]`}
                disabled={datasets.length === 0}
              >
                <SelectValue
                  placeholder={
                    datasets.length === 0 ? "No datasets available" : "Select"
                  }
                />
              </SelectTrigger>
              <SelectContent className={`${STYLES.bgCardAlt} ${STYLES.border}`}>
                {datasets.map((dataset) => (
                  <SelectItem
                    key={dataset.id}
                    value={dataset.id}
                    className="text-white"
                  >
                    {dataset.fileName}
                    {dataset.tableName && ` (${dataset.tableName})`}
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
          <div className="flex items-center justify-between mb-3">
            <Label className="text-white text-lg sm:text-xl lg:text-[24px] font-display">
              Algorithms
            </Label>
            {algorithms.length > 0 && (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-[#00a878] text-sm font-display hover:underline"
                >
                  Select All
                </button>
                <span className="text-white/40">|</span>
                <button
                  type="button"
                  onClick={handleDeselectAll}
                  className="text-white/60 text-sm font-display hover:underline"
                >
                  Deselect All
                </button>
              </div>
            )}
          </div>
          {algorithms.length === 0 ? (
            <p className="text-white/40 text-sm font-display">
              No algorithms available
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2 sm:gap-3">
              {algorithms.map((algorithm) => (
                <label
                  key={algorithm.id}
                  htmlFor={`algorithm-${algorithm.id}`}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Checkbox
                    id={`algorithm-${algorithm.id}`}
                    checked={selectedAlgorithms.includes(algorithm.name)}
                    onCheckedChange={() => handleAlgorithmToggle(algorithm.name)}
                    className={`${STYLES.border} ${STYLES.dataCheckedBgPrimaryLight} ${STYLES.dataCheckedBorderPrimaryLight}`}
                  />
                  <span className="text-white text-sm sm:text-base lg:text-[18px] font-display truncate">
                    {algorithm.name}
                  </span>
                </label>
              ))}
            </div>
          )}
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
            disabled={
              datasets.length === 0 ||
              algorithms.length === 0 ||
              !groupName.trim()
            }
            className={`btn-add-hover ${STYLES.bgPrimary} text-white h-[44px] sm:h-[50px] px-6 sm:px-8 text-xl sm:text-2xl lg:text-[28px] font-display disabled:opacity-50`}
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
                  "flex-shrink-0 w-[200px] sm:w-[250px] h-[160px] sm:h-[200px] p-3 sm:p-4 flex flex-col gap-2 relative",
                  `${STYLES.bgDark} border ${STYLES.borderSecondary}`
                )}
              >
                {/* Delete button */}
                <button
                  type="button"
                  onClick={() => handleDeleteGroup(group.id)}
                  className="absolute top-2 right-2 text-white/40 hover:text-red-400 transition-colors"
                  title="Delete group"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 6L6 18" />
                    <path d="M6 6l12 12" />
                  </svg>
                </button>

                <div className="text-white text-lg sm:text-[24px] font-display font-bold truncate pr-6">
                  {group.name}
                </div>
                <div className="h-[2px] bg-white w-full" />
                <div className="text-white/80 text-sm sm:text-[18px] font-display line-clamp-2">
                  {group.description || "No description"}
                </div>
                <div className="text-white/60 text-sm sm:text-[16px] font-display truncate">
                  {getDatasetDisplayName(group)}
                </div>
                <div className="text-white/40 text-xs sm:text-[14px] font-display mt-auto">
                  {group.algorithms.length} algorithm
                  {group.algorithms.length !== 1 ? "s" : ""}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
