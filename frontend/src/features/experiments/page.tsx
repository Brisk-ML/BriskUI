import { useEffect, useState } from "react";
import { 
  getExperimentsData,
  getStoredDatasets,
  type DatasetInfo, 
  type AlgorithmInfo,
  type StoredDatasetConfig,
} from "@/api";
import { cn } from "@/lib/utils";
import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { HoverSelect } from "@/shared/components/ui/hover-select";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { STYLES } from "@/shared/constants/colors";
import { usePendingChangesStore } from "@/shared/stores/usePendingChangesStore";
import { useProjectStore } from "@/shared/stores/useProjectStore";
import { useDataProcessingStepStore } from "@/features/project/stores/useDataProcessingStepStore";

export default function ExperimentsPage() {
  // Form state
  const [name, setName] = useState("");
  const [selectedDataset, setSelectedDataset] = useState("");
  const [description, setDescription] = useState("");
  const [selectedAlgorithms, setSelectedAlgorithms] = useState<string[]>([]);
  
  // Selected group for editing (null = add mode)
  const [editingGroupName, setEditingGroupName] = useState<string | null>(null);
  
  // Data from backend
  const [datasets, setDatasets] = useState<DatasetInfo[]>([]);
  const [algorithms, setAlgorithms] = useState<AlgorithmInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Global stores
  const { projectType } = useProjectStore();
  const { 
    experimentGroups, 
    setExperimentGroups, 
    addExperimentGroup,
    removeExperimentGroup,
    setDefaultAlgorithms,
    setProblemType,
    setDatasets: setStoreDatasets,
    markSectionLoaded,
  } = usePendingChangesStore();

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  // Sync problem type when it changes
  useEffect(() => {
    setProblemType(projectType);
  }, [projectType, setProblemType]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Fetch experiment data and stored datasets in parallel
      const [data, storedDatasetsResponse] = await Promise.all([
        getExperimentsData(),
        getStoredDatasets(),
      ]);
      
      setDatasets(data.datasets);
      setAlgorithms(data.algorithms);
      
      // Initialize pending changes store with existing data
      setExperimentGroups(data.experiment_groups.map((g) => ({
        name: g.name,
        description: g.description,
        datasets: g.datasets,
        algorithms: g.algorithms,
      })));
      
      // Use stored datasets with file-based IDs for consistency
      setStoreDatasets(storedDatasetsResponse.datasets.map((d: StoredDatasetConfig) => ({
        id: d.id, // File-based ID
        name: d.file_name.replace(/\.[^/.]+$/, ""),
        fileName: d.file_name,
        tableName: d.table_name || "",
        fileType: d.file_type as "csv" | "xlsx" | "sqlite",
        targetFeature: d.target_feature || "",
        featuresCount: d.features_count || 0,
        observationsCount: d.observations_count || 0,
        features: d.features.map((f) => ({
          id: crypto.randomUUID(),
          name: f.name,
          type: f.data_type as "str" | "int" | "float",
          categorical: f.categorical,
        })),
      })));
      
      // Restore base_data_manager from project.json if available
      if (storedDatasetsResponse.base_data_manager) {
        const bdm = storedDatasetsResponse.base_data_manager;
        const restoredBase = {
          testSize: bdm.test_size ?? 0.2,
          nSplits: bdm.n_splits ?? 5,
          splitMethod: (bdm.split_method as "shuffle" | "kfold") ?? "shuffle",
          groupColumn: bdm.group_column ?? null,
          stratified: bdm.stratified ?? false,
          randomState: bdm.random_state ?? null,
        };
        usePendingChangesStore.setState({ baseDataManager: restoredBase });
        useDataProcessingStepStore.getState().updateBaseDataManager(restoredBase);
      }
      
      // Restore preprocessor and data manager configs from stored datasets
      for (const d of storedDatasetsResponse.datasets) {
        if (d.preprocessors && d.preprocessors.length > 0) {
          for (const p of d.preprocessors) {
            useDataProcessingStepStore.getState().addPreprocessorConfig(
              d.id,
              p.type as "missing-data" | "scaling" | "encoding" | "feature-selection",
              p.config as any
            );
          }
        }
        
        if (d.data_manager) {
          useDataProcessingStepStore.getState().updateDatasetDataManager(d.id, {
            testSize: d.data_manager.test_size,
            nSplits: d.data_manager.n_splits,
            splitMethod: d.data_manager.split_method as "shuffle" | "kfold" | undefined,
            groupColumn: d.data_manager.group_column,
            stratified: d.data_manager.stratified,
            randomState: d.data_manager.random_state,
          });
        }
      }
      
      // Set default algorithms from all configured algorithms
      setDefaultAlgorithms(data.algorithms.map((a) => a.name));
      
      markSectionLoaded("experiments");
      // Reset hasChanges since we just loaded from backend
      usePendingChangesStore.setState({ hasChanges: false });
    } catch (error) {
      console.error("Failed to load experiments data:", error);
    }
    setIsLoading(false);
  };

  const handleAlgorithmToggle = (algorithmName: string) => {
    setSelectedAlgorithms((prev) =>
      prev.includes(algorithmName)
        ? prev.filter((a) => a !== algorithmName)
        : [...prev, algorithmName],
    );
  };

  const handleReset = () => {
    setName("");
    setSelectedDataset("");
    setDescription("");
    setSelectedAlgorithms([]);
    setEditingGroupName(null);
  };

  const handleSelectGroup = (groupName: string) => {
    // If already selected, deselect and reset to add mode
    if (editingGroupName === groupName) {
      handleReset();
      return;
    }
    
    // Select the group and populate form
    const group = experimentGroups.find((g) => g.name === groupName);
    if (group) {
      setEditingGroupName(groupName);
      setName(group.name);
      setDescription(group.description);
      setSelectedDataset(group.datasets[0] || "");
      setSelectedAlgorithms([...group.algorithms]);
    }
  };

  const handleAddOrUpdateGroup = () => {
    if (!name.trim()) return;

    if (editingGroupName) {
      // Update existing group - remove old and add new
      removeExperimentGroup(editingGroupName);
    }
    
    addExperimentGroup({
      name: name.trim(),
      description: description.trim() || "",
      datasets: selectedDataset ? [selectedDataset] : [],
      algorithms: selectedAlgorithms,
    });
    
    handleReset();
  };

  const handleDeleteGroup = (groupName: string) => {
    removeExperimentGroup(groupName);
    // If we're editing the deleted group, reset the form
    if (editingGroupName === groupName) {
      handleReset();
    }
  };

  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          background:
            "linear-gradient(180deg, rgba(18, 18, 18, 1) 39%, rgba(40, 40, 40, 1) 100%)",
        }}
      >
        <p className="text-white/50 text-xl font-display">Loading...</p>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col overflow-x-hidden pb-20 md:pb-0"
      style={{
        background:
          "linear-gradient(180deg, rgba(18, 18, 18, 1) 39%, rgba(40, 40, 40, 1) 100%)",
      }}
    >
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto flex flex-col items-center justify-start pt-4 sm:pt-6 lg:pt-8 px-3 sm:px-4 lg:px-6">
        {/* Add Experiments Form */}
        <div className="w-full max-w-[1055px] bg-[#181818] border-2 border-[#404040] p-3 sm:p-4 lg:p-6">
          {/* Header */}
          <div className="mb-4 sm:mb-6">
            <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-[36px] font-bold text-[#ebebeb] font-display relative inline-block">
              {editingGroupName ? "Edit Group" : "Add Experiments"}
              <div className="absolute -bottom-1 sm:-bottom-2 left-0 w-full max-w-[330px] h-[2px] bg-white" />
            </h1>
          </div>

          {/* Form Inputs Row */}
          <div className="flex flex-col md:flex-row gap-4 md:gap-6 lg:gap-8 mb-4 sm:mb-6">
            {/* Name Input */}
            <div className="flex flex-col gap-1 sm:gap-2 w-full md:w-[180px] lg:w-[200px]">
              <Label className="text-white text-base sm:text-lg lg:text-xl xl:text-[24px] font-normal font-display">
                Name <span className="text-red-400">*</span>
              </Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Group name"
                className="bg-[#282828] border-[#404040] text-white text-sm sm:text-base lg:text-lg h-[36px] sm:h-[38px] lg:h-[40px] placeholder:text-white/60"
              />
            </div>

            {/* Datasets Dropdown */}
            <div className="flex flex-col gap-1 sm:gap-2 w-full md:w-[180px] lg:w-[200px]">
              <Label className="text-white text-base sm:text-lg lg:text-xl xl:text-[24px] font-normal font-display">
                Dataset <span className="text-red-400">*</span>
              </Label>
              <HoverSelect
                value={selectedDataset}
                onValueChange={setSelectedDataset}
                placeholder="Select dataset"
                options={
                  datasets.length === 0
                    ? [{ value: "_none", label: "No datasets available", disabled: true }]
                    : datasets.map((dataset) => ({
                        value: dataset.filename,
                        label: dataset.filename,
                      }))
                }
                triggerClassName="bg-[#282828] border-[#404040] text-white h-[36px] sm:h-[38px] lg:h-[40px] text-sm sm:text-base"
              />
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
            <div className="flex items-center justify-between mb-1 sm:mb-2">
              <Label className="text-white text-base sm:text-lg lg:text-xl xl:text-[24px] font-normal font-display">
                Algorithms <span className="text-red-400">*</span>
              </Label>
              {algorithms.length > 0 && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedAlgorithms(algorithms.map((a) => a.name))}
                    className="text-[#00a878] text-sm font-display hover:underline"
                  >
                    Select All
                  </button>
                  <span className="text-white/40">|</span>
                  <button
                    type="button"
                    onClick={() => setSelectedAlgorithms([])}
                    className="text-white/60 text-sm font-display hover:underline"
                  >
                    Deselect All
                  </button>
                </div>
              )}
            </div>
            <div className="bg-[#282828] border-2 border-[#404040] p-2 sm:p-3 lg:p-4 max-h-[200px] sm:max-h-[240px] lg:max-h-[284px] overflow-y-auto">
              {algorithms.length === 0 ? (
                <p className="text-white/50 text-sm sm:text-base font-display py-4 text-center">
                  No algorithms configured. Add algorithms on the Algorithms page first.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 sm:gap-x-6 lg:gap-x-8 gap-y-1 sm:gap-y-2">
                  {algorithms.map((algorithm) => (
                    <div
                      key={algorithm.name}
                      className="flex items-center gap-2 py-0.5 sm:py-1"
                    >
                      <Checkbox
                        id={algorithm.name}
                        checked={selectedAlgorithms.includes(algorithm.name)}
                        onCheckedChange={() => handleAlgorithmToggle(algorithm.name)}
                        className="bg-[#121212] border-[#363636] data-[state=checked]:bg-accent-500 h-4 w-4 sm:h-5 sm:w-5 shrink-0"
                      />
                      <label
                        htmlFor={algorithm.name}
                        className="text-white text-sm sm:text-base lg:text-lg font-normal font-display cursor-pointer"
                      >
                        {algorithm.name}
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4">
            <Button
              variant="outline"
              onClick={handleReset}
              className="btn-reset-hover border border-[#404040] bg-[#121212] text-white h-[40px] sm:h-[45px] lg:h-[50px] text-base sm:text-lg lg:text-xl xl:text-[24px] px-4 sm:px-6 lg:px-8 w-full sm:w-auto sm:min-w-[120px] lg:min-w-[150px]"
            >
              {editingGroupName ? "Cancel" : "Reset"}
            </Button>
            <Button
              onClick={handleAddOrUpdateGroup}
              disabled={!name.trim() || !selectedDataset || selectedAlgorithms.length === 0}
              className="btn-add-hover bg-[#006b4c] text-white h-[40px] sm:h-[45px] lg:h-[50px] text-base sm:text-lg lg:text-xl xl:text-[28px] px-4 sm:px-6 lg:px-8 w-full sm:w-auto sm:min-w-[160px] lg:min-w-[200px] disabled:opacity-50"
            >
              {editingGroupName ? "Update Group" : "Add Group"}
            </Button>
          </div>
        </div>

        {/* Experiment Groups Bar */}
        <div
          className={`w-full max-w-[1055px] ${STYLES.bgCardAlt} border-2 ${STYLES.borderSecondary} mt-3 sm:mt-4 mb-4 sm:mb-6 h-[200px] sm:h-[250px] overflow-hidden`}
        >
          {experimentGroups.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-white text-[24px] sm:text-[28px] font-display">
                No groups added
              </p>
            </div>
          ) : (
            <div className="flex gap-4 items-center h-full p-4 overflow-x-auto">
              {experimentGroups.map((group) => {
                const isSelected = editingGroupName === group.name;
                return (
                  <button
                    key={group.name}
                    type="button"
                    onClick={() => handleSelectGroup(group.name)}
                    className={cn(
                      "card-hover-fade flex-shrink-0 w-[200px] sm:w-[250px] h-[160px] sm:h-[200px] p-3 sm:p-4 flex flex-col gap-2 relative text-left transition-colors duration-300",
                      isSelected
                        ? "bg-gradient-to-b from-[#1175d5] via-[#181818] via-[40%] to-[#121212] border border-[#404040]"
                        : `${STYLES.bgDark} border ${STYLES.borderSecondary} hover:bg-[#181818]`
                    )}
                  >
                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteGroup(group.name);
                      }}
                      className="absolute top-2 right-2 text-white/60 hover:text-red-500 transition-colors"
                      title="Delete group"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
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
                      {group.datasets.length > 0
                        ? group.datasets.join(", ")
                        : "No datasets"}
                    </div>
                    <div className="text-white/40 text-xs sm:text-[14px] font-display mt-auto">
                      {group.algorithms.length} algorithm
                      {group.algorithms.length !== 1 ? "s" : ""}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
