import { Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { getStoredDatasets, type StoredDatasetConfig } from "@/api";
import { cn } from "@/lib/utils";
import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { HoverSelect } from "@/shared/components/ui/hover-select";
import {
  usePendingChangesStore,
  type DatasetState,
  type BaseDataManagerConfig,
} from "@/shared/stores/usePendingChangesStore";
import { useDataProcessingStepStore } from "@/features/project/stores/useDataProcessingStepStore";
import { MissingDataConfig } from "@/features/project/components/data-processing/MissingDataConfig";
import { ScalingConfig } from "@/features/project/components/data-processing/ScalingConfig";
import { EncodingConfig } from "@/features/project/components/data-processing/EncodingConfig";
import { FeatureSelectionConfig } from "@/features/project/components/data-processing/FeatureSelectionConfig";
import type { DatasetFileType, Feature, PreprocessorType } from "@/types";
import { AddDatasetModal } from "./components/AddDatasetModal";
import {
  DataManagerModal,
  DEFAULT_DATA_MANAGER,
  type DataManagerConfig,
} from "./components/DataManagerModal";

// Preprocessors
const PREPROCESSORS: { id: PreprocessorType; label: string }[] = [
  { id: "missing-data", label: "Missing\nData" },
  { id: "scaling", label: "Scaling" },
  { id: "encoding", label: "Encoding" },
  { id: "feature-selection", label: "Feature\nSelection" },
];

interface FormState {
  fileName: string;
  tableName: string;
  fileType: DatasetFileType;
  targetFeature: string;
  featuresCount: string;
  observationsCount: string;
  features: Feature[];
}

const DEFAULT_FORM: FormState = {
  fileName: "",
  tableName: "",
  fileType: "csv",
  targetFeature: "",
  featuresCount: "",
  observationsCount: "",
  features: [],
};

export default function DatasetsPage() {
  const {
    datasets,
    baseDataManager,
    setDatasets,
    addDataset,
    updateDataset,
    removeDataset,
    setBaseDataManager,
    markSectionLoaded,
  } = usePendingChangesStore();

  // Data processing store for preprocessors
  const {
    activePreprocessor,
    setActivePreprocessor,
    getDatasetPreprocessors,
    selectDataset: selectDatasetForProcessing,
  } = useDataProcessingStepStore();

  // Local UI state
  const [selectedDatasetId, setSelectedDatasetId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [isLoading, setIsLoading] = useState(false);
  
  // Data manager configs (dataset-specific - local state)
  const [datasetDataManagers, setDatasetDataManagers] = useState<Record<string, DataManagerConfig>>({});

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDataManagerModalOpen, setIsDataManagerModalOpen] = useState(false);
  const [dataManagerMode, setDataManagerMode] = useState<"default" | "dataset">("default");

  // Feature input states
  const [featureName, setFeatureName] = useState("");
  const [dataType, setDataType] = useState<"str" | "int" | "float">("str");
  const [isCategorical, setIsCategorical] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Load data from backend on mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const response = await getStoredDatasets();
        
        // Convert stored datasets to DatasetState format
        // ID is now file-based (filename or filename:tablename)
        const loadedDatasets: DatasetState[] = response.datasets.map((d: StoredDatasetConfig) => ({
          id: d.id, // File-based ID for consistency
          name: d.file_name.replace(/\.[^/.]+$/, ""), // Remove extension for display name
          fileName: d.file_name,
          tableName: d.table_name || "",
          fileType: d.file_type as DatasetFileType,
          targetFeature: d.target_feature || "",
          featuresCount: d.features_count || 0,
          observationsCount: d.observations_count || 0,
          features: d.features.map((f) => ({
            id: crypto.randomUUID(),
            name: f.name,
            type: f.data_type as "str" | "int" | "float",
            categorical: f.categorical,
          })),
        }));
        
        setDatasets(loadedDatasets);
        
        // Restore base_data_manager from project.json if available
        if (response.base_data_manager) {
          const bdm = response.base_data_manager;
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
        
        // Restore preprocessor and data manager configs per dataset
        const loadedDataManagers: Record<string, DataManagerConfig> = {};
        for (const d of response.datasets) {
          if (d.preprocessors && d.preprocessors.length > 0) {
            for (const p of d.preprocessors) {
              const preprocessorKey = {
                "missing-data": "missingData",
                scaling: "scaling",
                encoding: "encoding",
                "feature-selection": "featureSelection",
              }[p.type] as "missingData" | "scaling" | "encoding" | "featureSelection" | undefined;
              
              if (preprocessorKey) {
                useDataProcessingStepStore.getState().addPreprocessorConfig(
                  d.id,
                  p.type as "missing-data" | "scaling" | "encoding" | "feature-selection",
                  p.config as any
                );
              }
            }
          }
          
          // Restore data manager config if stored
          if (d.data_manager) {
            const dmConfig = {
              testSize: d.data_manager.test_size,
              nSplits: d.data_manager.n_splits,
              splitMethod: d.data_manager.split_method as "shuffle" | "kfold" | undefined,
              groupColumn: d.data_manager.group_column,
              stratified: d.data_manager.stratified,
              randomState: d.data_manager.random_state,
            };
            useDataProcessingStepStore.getState().updateDatasetDataManager(d.id, dmConfig);
            
            // Also populate local datasetDataManagers for the modal
            loadedDataManagers[d.id] = {
              testSize: d.data_manager.test_size ?? 0.2,
              nSplits: d.data_manager.n_splits ?? 5,
              splitMethod: (d.data_manager.split_method as "shuffle" | "kfold") ?? "shuffle",
              groupColumn: d.data_manager.group_column ?? null,
              stratified: d.data_manager.stratified ?? false,
              randomState: d.data_manager.random_state ?? null,
            };
          }
        }
        setDatasetDataManagers(loadedDataManagers);
        
        markSectionLoaded("datasets");
        // Reset hasChanges after loading initial data
        usePendingChangesStore.setState({ hasChanges: false });
      } catch (error) {
        console.error("Failed to load datasets:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [setDatasets, markSectionLoaded]);

  // Sync selected dataset with data processing store
  useEffect(() => {
    selectDatasetForProcessing(selectedDatasetId);
  }, [selectedDatasetId, selectDatasetForProcessing]);

  const updateForm = (updates: Partial<FormState>) => {
    setForm((prev) => ({ ...prev, ...updates }));
  };

  const handleAddFeature = () => {
    if (featureName.trim()) {
      const newFeature: Feature = {
        id: crypto.randomUUID(),
        name: featureName,
        type: dataType,
        categorical: isCategorical,
      };
      updateForm({ features: [...form.features, newFeature] });
      setFeatureName("");
      setDataType("str");
      setIsCategorical(false);
    }
  };

  const handleDeleteFeature = (id: string) => {
    updateForm({ features: form.features.filter((f) => f.id !== id) });
  };

  const handleSelectDataset = (id: string) => {
    if (selectedDatasetId === id) {
      // Deselect
      setSelectedDatasetId(null);
      setForm(DEFAULT_FORM);
      setActivePreprocessor(null);
    } else {
      // Select and populate form
      const dataset = datasets.find((d) => d.id === id);
      if (dataset) {
        setSelectedDatasetId(id);
        setForm({
          fileName: dataset.fileName,
          tableName: dataset.tableName,
          fileType: dataset.fileType,
          targetFeature: dataset.targetFeature,
          featuresCount: dataset.featuresCount.toString(),
          observationsCount: dataset.observationsCount.toString(),
          features: [...dataset.features],
        });
        setActivePreprocessor(null);
      }
    }
  };

  const handleAddDatasetFromModal = (dataset: {
    name: string;
    fileName: string;
    tableName: string;
    fileType: DatasetFileType;
    targetFeature: string;
    featuresCount: number;
    observationsCount: number;
    features: Feature[];
  }) => {
    // Generate file-based ID for consistency across sessions
    const datasetId = dataset.fileType === "sqlite" && dataset.tableName
      ? `${dataset.fileName}:${dataset.tableName}`
      : dataset.fileName;
    
    const newDataset: DatasetState = {
      id: datasetId,
      name: dataset.name,
      fileName: dataset.fileName,
      tableName: dataset.tableName,
      fileType: dataset.fileType,
      targetFeature: dataset.targetFeature,
      featuresCount: dataset.featuresCount,
      observationsCount: dataset.observationsCount,
      features: dataset.features,
    };
    addDataset(newDataset);
  };

  const fileNameHasExtension = /\.[^/.]+$/.test(form.fileName);

  const handleSaveDatasetChanges = () => {
    if (!selectedDatasetId || !fileNameHasExtension) return;
    
    updateDataset(selectedDatasetId, {
      fileName: form.fileName,
      tableName: form.tableName,
      fileType: form.fileType,
      targetFeature: form.targetFeature,
      featuresCount: form.features.length || Number.parseInt(form.featuresCount, 10) || 0,
      observationsCount: Number.parseInt(form.observationsCount, 10) || 0,
      features: [...form.features],
    });
  };

  const handleOpenEditSplitting = () => {
    if (selectedDatasetId) {
      setDataManagerMode("dataset");
      setIsDataManagerModalOpen(true);
    }
  };

  const handleOpenEditDefaultSplit = () => {
    setDataManagerMode("default");
    setIsDataManagerModalOpen(true);
  };

  const handleSaveDataManager = (config: DataManagerConfig) => {
    if (dataManagerMode === "default") {
      // Convert to BaseDataManagerConfig format and save to pending changes store
      const baseConfig: BaseDataManagerConfig = {
        testSize: config.testSize,
        nSplits: config.nSplits,
        splitMethod: config.splitMethod,
        groupColumn: config.groupColumn,
        stratified: config.stratified,
        randomState: config.randomState,
      };
      setBaseDataManager(baseConfig);
    } else if (selectedDatasetId) {
      // Store locally for UI
      setDatasetDataManagers((prev) => ({
        ...prev,
        [selectedDatasetId]: config,
      }));
      
      // Also update the data processing store so it gets saved
      useDataProcessingStepStore.getState().updateDatasetDataManager(selectedDatasetId, {
        testSize: config.testSize,
        nSplits: config.nSplits,
        splitMethod: config.splitMethod,
        groupColumn: config.groupColumn,
        stratified: config.stratified,
        randomState: config.randomState,
      });
      
      // Mark changes for dataset-specific configs
      usePendingChangesStore.getState().markChanged();
    }
  };

  const handlePreprocessorClick = (id: PreprocessorType) => {
    if (!selectedDatasetId) return;
    setActivePreprocessor(activePreprocessor === id ? null : id);
  };

  // Get configured preprocessors for the selected dataset
  const configuredPreprocessors = selectedDatasetId
    ? getDatasetPreprocessors(selectedDatasetId)
    : [];

  const filteredFeatures = form.features.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Convert base data manager to modal format
  const baseDataManagerForModal: DataManagerConfig = {
    testSize: baseDataManager.testSize,
    nSplits: baseDataManager.nSplits,
    splitMethod: baseDataManager.splitMethod,
    groupColumn: baseDataManager.groupColumn,
    stratified: baseDataManager.stratified,
    randomState: baseDataManager.randomState,
  };

  const currentDataManagerConfig = dataManagerMode === "default"
    ? baseDataManagerForModal
    : selectedDatasetId
      ? datasetDataManagers[selectedDatasetId] || { ...baseDataManagerForModal }
      : DEFAULT_DATA_MANAGER;

  // Render preprocessor config form
  const renderPreprocessorForm = () => {
    if (!selectedDatasetId) {
      return (
        <div className="flex items-center justify-center h-full">
          <p className="text-white/60 text-base sm:text-lg lg:text-xl font-display text-center">
            Select a dataset first
          </p>
        </div>
      );
    }

    switch (activePreprocessor) {
      case "missing-data":
        return <MissingDataConfig datasetId={selectedDatasetId} />;
      case "scaling":
        return <ScalingConfig datasetId={selectedDatasetId} />;
      case "encoding":
        return <EncodingConfig datasetId={selectedDatasetId} />;
      case "feature-selection":
        return <FeatureSelectionConfig datasetId={selectedDatasetId} />;
      default:
        return (
          <div className="flex items-center justify-center h-full">
            <p className="text-white/60 text-base sm:text-lg lg:text-xl font-display text-center">
              Select a preprocessor to configure
            </p>
          </div>
        );
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col overflow-x-hidden pb-20 md:pb-0"
      style={{
        background:
          "linear-gradient(180deg, rgba(18, 18, 18, 1) 39%, rgba(40, 40, 40, 1) 100%)",
      }}
    >
      {/* Main Content - Scrollable */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        <div className="mx-auto w-full max-w-[1400px]">
          <div className="flex flex-col xl:flex-row gap-3 sm:gap-4">
            {/* Left Panel - Edit Dataset */}
            <div className="flex-1 bg-[#181818] border-2 border-[#404040] p-4 sm:p-6">
              {/* Header */}
              <div className="mb-4 sm:mb-6">
                <h2 className="h1-underline text-xl sm:text-2xl md:text-3xl lg:text-[36px] font-bold text-white font-display">
                  {selectedDatasetId ? "Edit Dataset" : "Select a Dataset"}
                </h2>
              </div>

              <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
                {/* File Name */}
                <div>
                  <Label className="text-white text-sm sm:text-base lg:text-lg font-display mb-1 sm:mb-2 block">
                    File Name
                  </Label>
                  <Input
                    value={form.fileName}
                    onChange={(e) => updateForm({ fileName: e.target.value })}
                    placeholder="data.csv"
                    disabled={!selectedDatasetId}
                    className="bg-[#282828] border-[#404040] text-white h-[32px] sm:h-[36px] text-sm sm:text-base placeholder:text-white/60 disabled:opacity-50"
                  />
                  {form.fileName && !fileNameHasExtension && (
                    <p className="text-red-400 text-xs mt-1">File extension required (e.g. .csv, .xlsx)</p>
                  )}
                </div>

                {/* Table Name */}
                <div>
                  <Label className="text-white text-sm sm:text-base lg:text-lg font-display mb-1 sm:mb-2 block">
                    Table Name
                  </Label>
                  <Input
                    value={form.tableName}
                    onChange={(e) => updateForm({ tableName: e.target.value })}
                    placeholder="Optional (for SQLite)"
                    disabled={!selectedDatasetId}
                    className="bg-[#282828] border-[#404040] text-white h-[32px] sm:h-[36px] text-sm sm:text-base placeholder:text-white/60 disabled:opacity-50"
                  />
                </div>

                {/* File Type */}
                <div>
                  <Label className="text-white text-sm sm:text-base lg:text-lg font-display mb-1 sm:mb-2 block">
                    File Type
                  </Label>
                  <HoverSelect
                    value={form.fileType}
                    onValueChange={(v) => updateForm({ fileType: v as DatasetFileType })}
                    disabled={!selectedDatasetId}
                    placeholder="Select"
                    options={[
                      { value: "csv", label: "CSV" },
                      { value: "xlsx", label: "XLSX" },
                      { value: "sqlite", label: "SQLite" },
                    ]}
                    triggerClassName="bg-[#282828] border-[#404040] text-white h-[32px] sm:h-[36px] disabled:opacity-50"
                  />
                </div>

                {/* Target Feature */}
                <div>
                  <Label className="text-white text-sm sm:text-base lg:text-lg font-display mb-1 sm:mb-2 block">
                    Target Feature
                  </Label>
                  <Input
                    value={form.targetFeature}
                    onChange={(e) => updateForm({ targetFeature: e.target.value })}
                    placeholder="Name"
                    disabled={!selectedDatasetId}
                    className="bg-[#282828] border-[#404040] text-white h-[32px] sm:h-[36px] text-sm sm:text-base placeholder:text-white/60 disabled:opacity-50"
                  />
                </div>

                {/* Features (#) */}
                <div>
                  <Label className="text-white text-sm sm:text-base lg:text-lg font-display mb-1 sm:mb-2 block">
                    Features (#)
                  </Label>
                  <Input
                    value={form.featuresCount}
                    onChange={(e) => updateForm({ featuresCount: e.target.value })}
                    placeholder="Ex. 10"
                    disabled={!selectedDatasetId}
                    className="bg-[#282828] border-[#404040] text-white h-[32px] sm:h-[36px] text-sm sm:text-base placeholder:text-white/60 disabled:opacity-50"
                  />
                </div>

                {/* Observations (#) */}
                <div>
                  <Label className="text-white text-sm sm:text-base lg:text-lg font-display mb-1 sm:mb-2 block">
                    Observations (#)
                  </Label>
                  <Input
                    value={form.observationsCount}
                    onChange={(e) => updateForm({ observationsCount: e.target.value })}
                    placeholder="Ex. 500"
                    disabled={!selectedDatasetId}
                    className="bg-[#282828] border-[#404040] text-white h-[32px] sm:h-[36px] text-sm sm:text-base placeholder:text-white/60 disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Feature Table Section */}
              <div className="flex flex-col md:flex-row border-2 border-[#404040]">
                {/* Left - Feature Input */}
                <div className="p-3 sm:p-4 space-y-2 sm:space-y-3 border-b md:border-b-0 md:border-r border-[#404040] bg-[#181818] w-full md:w-[180px] lg:w-[200px]">
                  <div>
                    <Label className="text-white text-sm sm:text-base lg:text-lg font-display mb-1 sm:mb-2 block">
                      Feature Name
                    </Label>
                    <Input
                      value={featureName}
                      onChange={(e) => setFeatureName(e.target.value)}
                      placeholder="Name"
                      onKeyDown={(e) => e.key === "Enter" && handleAddFeature()}
                      disabled={!selectedDatasetId}
                      className="bg-[#282828] border-[#404040] text-white h-[32px] sm:h-[36px] text-sm sm:text-base placeholder:text-white/60 disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <Label className="text-white text-sm sm:text-base lg:text-lg font-display mb-1 sm:mb-2 block">
                      Data Type
                    </Label>
                    <HoverSelect
                      value={dataType}
                      onValueChange={(v) => setDataType(v as "str" | "int" | "float")}
                      disabled={!selectedDatasetId}
                      placeholder="Select"
                      options={[
                        { value: "str", label: "str" },
                        { value: "int", label: "int" },
                        { value: "float", label: "float" },
                      ]}
                      triggerClassName="bg-[#282828] border-[#404040] text-white h-[32px] sm:h-[36px] disabled:opacity-50"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="categorical-standalone"
                      checked={isCategorical}
                      onCheckedChange={(checked) => setIsCategorical(checked === true)}
                      disabled={!selectedDatasetId}
                      className="border-[#404040] data-[state=checked]:bg-[#006b4c] data-[state=checked]:border-[#00a878] disabled:opacity-50"
                    />
                    <Label
                      htmlFor="categorical-standalone"
                      className={cn(
                        "text-white text-sm sm:text-base font-display cursor-pointer",
                        !selectedDatasetId && "opacity-50"
                      )}
                    >
                      Categorical
                    </Label>
                  </div>
                  <Button
                    onClick={handleAddFeature}
                    disabled={!selectedDatasetId}
                    className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-[#181818] hover:bg-[#282828] text-white p-2 disabled:opacity-50"
                  >
                    <img src="/add.svg" alt="Add" className="w-full h-full" />
                  </Button>
                </div>

                {/* Right - Feature Table */}
                <div className="flex-1 flex flex-col min-h-[150px] sm:min-h-[200px]">
                  {/* Table Header */}
                  <div className="bg-[#121212] grid grid-cols-[1fr_46px_82px_28px] sm:grid-cols-[1fr_50px_90px_32px] items-center h-[32px] sm:h-[36px] border-b border-[#404040]">
                    <span className="text-white text-xs sm:text-sm lg:text-base font-display px-3 sm:px-4 border-r border-[#404040]">
                      Name
                    </span>
                    <span className="text-white text-xs sm:text-sm lg:text-base font-display px-2 border-r border-[#404040]">
                      Type
                    </span>
                    <span className="text-white text-xs sm:text-sm lg:text-base font-display text-center px-1">
                      Categorical
                    </span>
                    <div />
                  </div>

                  {/* Table Body */}
                  <div className="flex-1 overflow-y-auto max-h-[150px] sm:max-h-[200px]">
                    {filteredFeatures.map((feature, index) => (
                      <div
                        key={feature.id}
                        className={cn(
                          "grid grid-cols-[1fr_38px_32px_28px] sm:grid-cols-[1fr_40px_36px_32px] items-center h-[32px] sm:h-[36px]",
                          index % 2 === 0 ? "bg-[#181818]" : "bg-[#282828]"
                        )}
                      >
                        <span className="text-white text-xs sm:text-sm font-display truncate px-3 sm:px-4 border-r border-[#404040]">
                          {feature.name}
                        </span>
                        <span className="text-white text-xs sm:text-sm font-display px-2 border-r border-[#404040]">
                          {feature.type}
                        </span>
                        <span className="text-white text-xs sm:text-sm font-display text-center">
                          {feature.categorical ? "Yes" : "No"}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDeleteFeature(feature.id)}
                          className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center text-white hover:text-red-500"
                        >
                          <X className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Search */}
                  <div className="border-t border-[#404040] bg-[#282828] p-2">
                    <div className="relative">
                      <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search"
                        className="bg-[#282828] border-[#404040] text-white h-[26px] sm:h-[28px] pr-8 text-sm sm:text-base placeholder:text-white/60"
                      />
                      <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-white/60" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              {selectedDatasetId && (
                <div className="mt-4 flex justify-end">
                  <Button
                    onClick={handleSaveDatasetChanges}
                    disabled={!fileNameHasExtension}
                    className="btn-add-hover bg-[#006b4c] text-white h-10 px-6 text-base font-display border border-[#363636] disabled:opacity-50"
                  >
                    Apply Changes
                  </Button>
                </div>
              )}
            </div>

            {/* Right Panel - Preprocessors */}
            <div className="flex-1 bg-[#181818] border-2 border-[#404040] p-3 sm:p-4 lg:p-6 flex flex-col">
              {/* Header */}
              <div className="mb-4 sm:mb-6 shrink-0">
                <h2 className="h1-underline text-xl sm:text-2xl md:text-3xl lg:text-[36px] font-bold text-white font-display">
                  Preprocessors
                </h2>
              </div>

              {/* Preprocessor Buttons */}
              <div className="flex gap-4 flex-wrap justify-center mb-4 shrink-0">
                {PREPROCESSORS.map((preprocessor) => {
                  const isActive = activePreprocessor === preprocessor.id;
                  const isConfigured = configuredPreprocessors.includes(preprocessor.id);
                  const isDisabled = !selectedDatasetId;

                  return (
                    <button
                      key={preprocessor.id}
                      type="button"
                      onClick={() => handlePreprocessorClick(preprocessor.id)}
                      disabled={isDisabled}
                      className={cn(
                        "w-[100px] h-[100px] border-2 flex items-center justify-center relative",
                        "text-white text-[18px] sm:text-[20px] font-display text-center leading-tight",
                        "transition-all duration-300 whitespace-pre-line",
                        isDisabled
                          ? "bg-[#1a1a1a] border-[#2a2a2a] cursor-not-allowed opacity-50"
                          : "cursor-pointer",
                        !isDisabled && isActive
                          ? "bg-[#006b4c] border-[#00a878] ring-2 ring-white ring-offset-2 ring-offset-[#181818]"
                          : !isDisabled && isConfigured
                            ? "bg-[#006b4c] border-[#00a878]"
                            : !isDisabled && "card-hover-fade bg-[#121212] border-[#363636]"
                      )}
                    >
                      {preprocessor.label}
                    </button>
                  );
                })}
              </div>

              {/* Preprocessor Config Area */}
              <div className="bg-[#282828] border-2 border-[#363636] flex-1 min-h-[300px] p-4 overflow-y-auto">
                {renderPreprocessorForm()}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-4 sm:mt-6 shrink-0">
                <Button
                  onClick={handleOpenEditSplitting}
                  disabled={!selectedDatasetId}
                  variant="outline"
                  className="border-[#404040] bg-[#121212] text-white hover:bg-[#282828] h-[36px] sm:h-[40px] lg:h-[44px] px-4 sm:px-6 text-sm sm:text-base lg:text-lg font-display disabled:opacity-50"
                >
                  Edit Splitting
                </Button>
                <Button
                  onClick={handleOpenEditDefaultSplit}
                  variant="outline"
                  className="border-[#404040] bg-[#121212] text-white hover:bg-[#282828] h-[36px] sm:h-[40px] lg:h-[44px] px-4 sm:px-6 text-sm sm:text-base lg:text-lg font-display"
                >
                  Edit Default Split
                </Button>
              </div>
            </div>
          </div>

          {/* Datasets Bar */}
          <div className="bg-[#282828] border-2 border-[#363636] mt-3 sm:mt-4 overflow-hidden">
            <div className="flex gap-2 sm:gap-3 lg:gap-4 p-2 sm:p-3 lg:p-4 overflow-x-auto items-center">
              {/* Loading State */}
              {isLoading ? (
                <div className="shrink-0 w-[140px] sm:w-[160px] lg:w-[200px] h-[130px] sm:h-[150px] lg:h-[180px] border border-[#363636] bg-[#121212] flex items-center justify-center">
                  <p className="text-white/60 font-display">Loading...</p>
                </div>
              ) : (
                <>
                  {/* Dataset Cards */}
                  {datasets.map((dataset) => {
                    const isSelected = selectedDatasetId === dataset.id;
                    return (
                      <button
                        key={dataset.id}
                        type="button"
                        onClick={() => handleSelectDataset(dataset.id)}
                        className={cn(
                          "card-hover-fade shrink-0 w-[140px] sm:w-[160px] lg:w-[200px] h-[130px] sm:h-[150px] lg:h-[180px] p-2 sm:p-3 flex flex-col gap-1 sm:gap-2 border transition-colors duration-300 text-left relative",
                          isSelected
                            ? "bg-gradient-to-b from-[#1175d5] via-[#181818] via-[40%] to-[#121212] border-[#404040]"
                            : "bg-[#121212] border-[#363636] hover:bg-[#181818]"
                        )}
                      >
                        <div
                          className={cn(
                            "text-white font-display pr-5 overflow-hidden whitespace-nowrap text-ellipsis",
                            (dataset.name || dataset.fileName || "Dataset").length > 20
                              ? "text-xs sm:text-sm lg:text-base"
                              : (dataset.name || dataset.fileName || "Dataset").length > 14
                                ? "text-sm sm:text-base lg:text-lg"
                                : "text-base sm:text-lg lg:text-xl",
                          )}
                        >
                          {dataset.name || dataset.fileName || "Dataset"}
                        </div>
                        <div className="h-[1px] bg-white/40 w-full" />
                        <div className="text-white/70 text-sm sm:text-base lg:text-lg font-display">
                          {dataset.observationsCount} x {dataset.featuresCount}
                        </div>
                        <div className="text-white/70 text-sm sm:text-base lg:text-lg font-display">
                          File Type: {dataset.fileType?.toUpperCase() || "CSV"}
                        </div>
                        {/* Delete button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeDataset(dataset.id);
                            if (selectedDatasetId === dataset.id) {
                              setSelectedDatasetId(null);
                              setForm(DEFAULT_FORM);
                            }
                          }}
                          className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center text-white/60 hover:text-red-500 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </button>
                    );
                  })}
                </>
              )}

              {/* Add Button */}
              <button
                type="button"
                onClick={() => setIsAddModalOpen(true)}
                className="shrink-0 w-[140px] sm:w-[160px] lg:w-[200px] h-[130px] sm:h-[150px] lg:h-[180px] border-2 border-dashed border-[#404040] flex items-center justify-center hover:bg-[#181818] transition-colors"
              >
                <img
                  src="/add.svg"
                  alt="Add Dataset"
                  className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 opacity-40"
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddDatasetModal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddDatasetFromModal}
      />
      <DataManagerModal
        open={isDataManagerModalOpen}
        onClose={() => setIsDataManagerModalOpen(false)}
        mode={dataManagerMode}
        datasetName={selectedDatasetId ? datasets.find((d) => d.id === selectedDatasetId)?.name : undefined}
        config={currentDataManagerConfig}
        onSave={handleSaveDataManager}
      />
    </div>
  );
}
