import { Search, X, Loader2 } from "lucide-react";
import type { ChangeEvent } from "react";
import { useRef, useState } from "react";
import { parseDatasetFile } from "@/api";
import { useDatasetsStepStore } from "@/features/project/stores/useDatasetsStepStore";
import { cn } from "@/lib/utils";
import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { HoverSelect } from "@/shared/components/ui/hover-select";
import type { DatasetFileType, Feature } from "@/types";

export function DatasetsStep() {
  const {
    datasets,
    selectedDatasetId,
    form,
    setForm,
    addFeature,
    removeFeature,
    addDataset,
    updateDataset,
    removeDataset,
    toggleDataset,
    resetForm,
  } = useDatasetsStepStore();

  // Local state for feature input
  const [featureName, setFeatureName] = useState("");
  const [dataType, setDataType] = useState<"str" | "int" | "float">("str");
  const [isCategorical, setIsCategorical] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [resetHovered, setResetHovered] = useState(false);
  const [isParsingFile, setIsParsingFile] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const extension = file.name.split(".").pop()?.toLowerCase();
    
    // Only support CSV and XLSX for parsing
    if (extension !== "csv" && extension !== "xlsx" && extension !== "xls") {
      setParseError("Only CSV and XLSX files are supported for upload.");
      return;
    }

    setIsParsingFile(true);
    setParseError(null);

    try {
      const result = await parseDatasetFile(file);
      
      // Convert parsed features to our Feature type
      const features: Feature[] = result.features.map((f) => ({
        id: crypto.randomUUID(),
        name: f.name,
        type: f.data_type,
        categorical: f.categorical,
      }));

      // Populate the form with parsed data (skip tableName - only for SQLite)
      setForm({
        fileName: result.file_name,
        tableName: "",
        fileType: result.file_type as DatasetFileType,
        targetFeature: result.target_feature,
        featuresCount: result.feature_count.toString(),
        observationsCount: result.row_count.toString(),
        features,
      });
    } catch (error) {
      setParseError(error instanceof Error ? error.message : "Failed to parse file");
    } finally {
      setIsParsingFile(false);
      // Reset the file input so the same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleAddFeature = () => {
    if (featureName.trim()) {
      addFeature({
        id: crypto.randomUUID(),
        name: featureName,
        type: dataType,
        categorical: isCategorical,
      });
      setFeatureName("");
      setDataType("str");
      setIsCategorical(false);
    }
  };

  const handleDeleteFeature = (id: string) => {
    removeFeature(id);
  };

  const handleReset = () => {
    resetForm();
    setFeatureName("");
    setDataType("str");
    setIsCategorical(false);
    setSearchQuery("");
    setParseError(null);
  };

  const fileNameHasExtension = /\.[^/.]+$/.test(form.fileName);

  const handleAddOrUpdateDataset = () => {
    if (!form.fileName || !fileNameHasExtension) return;

    if (selectedDatasetId) {
      // Update existing dataset
      updateDataset(selectedDatasetId);
    } else {
      // Add new dataset
      addDataset();
    }
  };

  const handleCardClick = (id: string) => {
    toggleDataset(id);
  };

  const filteredFeatures = form.features.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="w-full max-w-[1055px] px-4 xl:px-0 flex flex-col gap-4 sm:gap-6 mx-auto">
      {/* Add Datasets Form */}
      <div className="bg-[#181818] border-2 border-[#404040] px-4 sm:px-6 py-4">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <h1 className="h1-underline text-2xl sm:text-3xl lg:text-4xl font-bold text-white font-display">
            Add Datasets
          </h1>
        </div>

        {/* Form Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Left Side - Form Inputs */}
          <div className="flex flex-wrap gap-x-4 sm:gap-x-8 gap-y-3 sm:gap-y-4">
            {/* File Name */}
            <div className="w-full lg:w-[200px]">
              <Label className="text-white text-lg sm:text-xl lg:text-[24px] font-display mb-2 block">
                File Name <span className="text-red-400">*</span>
              </Label>
              <Input
                value={form.fileName}
                onChange={(e) => setForm({ fileName: e.target.value })}
                placeholder="data.csv"
                className="bg-[#282828] border-[#404040] text-white h-10 sm:h-[40px] text-base sm:text-[18px] placeholder:text-white/60"
              />
              {form.fileName && !fileNameHasExtension && (
                <p className="text-red-400 text-xs mt-1">File extension required (e.g. .csv, .xlsx)</p>
              )}
            </div>

            {/* Table Name */}
            <div className="w-full lg:w-[200px]">
              <Label className="text-white text-lg sm:text-xl lg:text-[24px] font-display mb-2 block">
                Table Name
              </Label>
              <Input
                value={form.tableName}
                onChange={(e) => setForm({ tableName: e.target.value })}
                placeholder="Optional"
                className="bg-[#282828] border-[#404040] text-white h-10 sm:h-[40px] text-base sm:text-[18px] placeholder:text-white/60"
              />
            </div>

            {/* File Type */}
            <div className="w-full lg:w-[200px]">
              <Label className="text-white text-lg sm:text-xl lg:text-[24px] font-display mb-2 block">
                File Type
              </Label>
              <HoverSelect
                value={form.fileType}
                onValueChange={(v) => setForm({ fileType: v as DatasetFileType })}
                placeholder="Select"
                options={[
                  { value: "csv", label: "CSV" },
                  { value: "xlsx", label: "XLSX" },
                  { value: "sqlite", label: "SQLite" },
                ]}
                triggerClassName="bg-[#282828] border-[#404040] text-white h-10 sm:h-[40px] w-full sm:w-[150px] text-base sm:text-[18px]"
              />
            </div>

            {/* Target Feature */}
            <div className="w-full lg:w-[200px]">
              <Label className="text-white text-lg sm:text-xl lg:text-[24px] font-display mb-2 block">
                Target Feature
              </Label>
              <Input
                value={form.targetFeature}
                onChange={(e) => setForm({ targetFeature: e.target.value })}
                placeholder="Name"
                className="bg-[#282828] border-[#404040] text-white h-10 sm:h-[40px] text-base sm:text-[18px] placeholder:text-white/60"
              />
            </div>

            {/* Features Count */}
            <div className="w-full lg:w-[200px]">
              <Label className="text-white text-lg sm:text-xl lg:text-[24px] font-display mb-2 block">
                Features (#)
              </Label>
              <Input
                value={form.featuresCount}
                onChange={(e) => setForm({ featuresCount: e.target.value })}
                placeholder="Ex. 10"
                className="bg-[#282828] border-[#404040] text-white h-10 sm:h-[40px] text-base sm:text-[18px] placeholder:text-white/60"
              />
            </div>

            {/* Observations Count */}
            <div className="w-full lg:w-[200px]">
              <Label className="text-white text-lg sm:text-xl lg:text-[24px] font-display mb-2 block">
                Observations (#)
              </Label>
              <Input
                value={form.observationsCount}
                onChange={(e) => setForm({ observationsCount: e.target.value })}
                placeholder="Ex. 500"
                className="bg-[#282828] border-[#404040] text-white h-10 sm:h-[40px] text-base sm:text-[18px] placeholder:text-white/60"
              />
            </div>
          </div>

          {/* Right Side - Features Table */}
          <div className="border-2 border-[#404040] flex flex-col lg:flex-row h-auto lg:h-[300px]">
            {/* Input Section */}
            <div className="p-3 sm:p-4 space-y-2 sm:space-y-3 border-b-2 lg:border-b-0 lg:border-r-2 border-[#404040] bg-[#181818] lg:w-[220px] flex flex-col">
              <div>
                <Label className="text-white text-base sm:text-lg font-display mb-1 block">
                  Feature Name
                </Label>
                <Input
                  value={featureName}
                  onChange={(e) => setFeatureName(e.target.value)}
                  placeholder="Name"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddFeature();
                  }}
                  className="bg-[#282828] border-[#404040] text-white h-9 text-sm sm:text-base placeholder:text-white/60 w-full"
                />
              </div>
              <div>
                <Label className="text-white text-base sm:text-lg font-display mb-1 block">
                  Data Type
                </Label>
                <HoverSelect
                  value={dataType}
                  onValueChange={(v) => setDataType(v as "str" | "int" | "float")}
                  placeholder="Select"
                  options={[
                    { value: "str", label: "str" },
                    { value: "int", label: "int" },
                    { value: "float", label: "float" },
                  ]}
                  triggerClassName="bg-[#282828] border-[#404040] text-white h-9 w-full text-sm sm:text-base"
                />
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="categorical"
                  checked={isCategorical}
                  onCheckedChange={(checked) => setIsCategorical(checked === true)}
                  className="border-[#404040] data-[state=checked]:bg-[#006b4c] data-[state=checked]:border-[#00a878]"
                />
                <Label
                  htmlFor="categorical"
                  className="text-white text-sm sm:text-base font-display cursor-pointer"
                >
                  Categorical
                </Label>
              </div>
              <Button
                onClick={handleAddFeature}
                className="w-10 h-10 sm:w-12 sm:h-12 bg-[#282828] hover:bg-[#1175d5]/20 hover:border-[#1175d5] text-white border border-[#404040] p-2 flex items-center justify-center transition-colors"
              >
                <img src="/add.svg" alt="Add" className="w-full h-full" />
              </Button>
            </div>

            {/* Table Section */}
            <div className="flex-1 bg-[#181818] overflow-hidden flex flex-col min-h-[240px] lg:min-h-0">
              {/* Table Header */}
              <div className="bg-[#121212] grid grid-cols-[1fr_50px_90px_32px] sm:grid-cols-[1fr_54px_100px_32px] items-center h-[40px] border-b border-[#404040]">
                <span className="text-white text-sm sm:text-base lg:text-lg font-display px-4 border-r border-[#404040]">
                  Name
                </span>
                <span className="text-white text-sm sm:text-base lg:text-lg font-display px-2 border-r border-[#404040]">
                  Type
                </span>
                <span className="text-white text-sm sm:text-base lg:text-lg font-display text-center px-1">
                  Categorical
                </span>
                <div />
              </div>

              {/* Table Body */}
              <div className="flex-1 overflow-y-auto">
                {filteredFeatures.map((feature, index) => (
                  <div
                    key={feature.id}
                    className={cn(
                      "grid grid-cols-[1fr_40px_36px_32px] items-center h-[40px]",
                      index % 2 === 0 ? "bg-[#181818]" : "bg-[#282828]",
                    )}
                  >
                    <span className="text-white text-sm sm:text-base font-display truncate px-4 border-r border-[#404040]">
                      {feature.name}
                    </span>
                    <span className="text-white text-sm sm:text-base font-display px-2 border-r border-[#404040]">
                      {feature.type}
                    </span>
                    <span className="text-white text-sm sm:text-base font-display text-center">
                      {feature.categorical ? "Yes" : "No"}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteFeature(feature.id)}
                      className="w-8 h-8 flex items-center justify-center text-white hover:text-red-500 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Search Bar */}
              <div className="border-t border-[#404040] bg-[#282828] p-2 flex justify-end">
                <div className="relative w-full lg:w-[200px]">
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search"
                    className="bg-[#282828] border-[#404040] text-white h-[28px] sm:h-[30px] pr-8 text-base sm:text-[18px] placeholder:text-white/60 w-full"
                  />
                  <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Parse error message */}
        {parseError && (
          <div className="mt-4">
            <p className="text-red-400 text-[16px] sm:text-[18px] font-display">
              {parseError}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 sm:gap-4 mt-4 sm:mt-6 justify-between items-center flex-wrap">
          {/* Left side - Upload button with note */}
          <div className="relative group/upload inline-flex">
            <Button
              onClick={handleUploadClick}
              disabled={isParsingFile}
              className="bg-[#282828] hover:bg-[#383838] text-white border border-[#404040] h-[44px] sm:h-[50px] px-4 sm:px-6 text-lg sm:text-xl lg:text-[24px] font-display disabled:opacity-50"
            >
              {isParsingFile ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2 inline" />
                  Parsing...
                </>
              ) : (
                "Upload"
              )}
            </Button>
            <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-5 py-2.5 bg-[#282828] border border-[#404040] text-white/80 text-base sm:text-lg font-display whitespace-nowrap opacity-0 group-hover/upload:opacity-100 transition-opacity">
              CSV or XLSX
            </span>
          </div>

          {/* Right side - Reset and Add buttons */}
          <div className="flex gap-3 sm:gap-4">
            <button
              type="button"
              onClick={handleReset}
              onMouseEnter={() => setResetHovered(true)}
              onMouseLeave={() => setResetHovered(false)}
              className="border-2 h-[44px] sm:h-[50px] px-4 sm:px-6 text-lg sm:text-xl lg:text-[24px] font-display transition-colors"
              style={{
                borderColor: resetHovered ? "#FF3D29" : "#404040",
                backgroundColor: resetHovered
                  ? "rgba(255, 61, 41, 0.2)"
                  : "#121212",
                color: "white",
              }}
            >
              {selectedDatasetId ? "Cancel" : "Reset"}
            </button>
            <Button
              onClick={handleAddOrUpdateDataset}
              disabled={!form.fileName || !fileNameHasExtension}
              className="btn-add-hover bg-[#006b4c] text-white h-[44px] sm:h-[50px] px-4 sm:px-6 text-lg sm:text-xl lg:text-[24px] font-display border border-[#363636] disabled:opacity-50"
            >
              {selectedDatasetId ? "Update Dataset" : "Add Dataset"}
            </Button>
          </div>
        </div>
      </div>

      {/* Datasets Bar */}
      <div className="bg-[#282828] border-2 border-[#363636] h-auto sm:h-[300px] overflow-hidden">
        {datasets.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[200px] sm:h-full gap-2">
            <p className="text-white text-[24px] sm:text-[28px] font-display">
              No datasets added
            </p>
            <p className="text-red-400/80 text-sm sm:text-base font-display">
              At least one dataset is required to continue
            </p>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center h-auto sm:h-full p-4 pb-6 sm:pb-4 overflow-y-auto sm:overflow-x-auto sm:overflow-y-hidden">
            {datasets.map((dataset) => {
              const isSelected = selectedDatasetId === dataset.id;
              return (
                <button
                  key={dataset.id}
                  type="button"
                  onClick={() => handleCardClick(dataset.id)}
                  className={cn(
                    "card-hover-fade flex-shrink-0 w-full sm:w-[250px] h-auto min-h-[180px] sm:h-[250px] p-3 sm:p-2 flex flex-col gap-2 sm:gap-4 cursor-pointer transition-all duration-300 border relative",
                    "hover:border-[#404040]",
                    isSelected
                      ? "bg-gradient-to-b from-[#1175d5] via-[#181818] via-[40%] to-[#121212] border-[#404040]"
                      : "bg-[#121212] border-[#363636] hover:bg-[#181818]",
                  )}
                >
                  {/* Delete button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeDataset(dataset.id);
                    }}
                    className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center text-white/60 hover:text-red-500 transition-colors z-10"
                    title="Delete dataset"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div
                    className={cn(
                      "text-white font-display leading-normal min-h-[30px] sm:h-[40px] flex items-center text-left pr-6 overflow-hidden whitespace-nowrap text-ellipsis",
                      (dataset.name || "Dataset Name").length > 24
                        ? "text-sm sm:text-base"
                        : (dataset.name || "Dataset Name").length > 16
                          ? "text-base sm:text-lg"
                          : "text-xl sm:text-[28px]",
                    )}
                  >
                    {dataset.name || "Dataset Name"}
                  </div>
                  <div className="h-[2px] bg-white w-full max-w-[225px]" />
                  <div className="text-white text-lg sm:text-[24px] font-display leading-normal min-h-[24px] sm:h-[30px] text-left">
                    {dataset.observationsCount || "0"} x{" "}
                    {dataset.featuresCount || "0"}
                  </div>
                  <div className="text-white text-lg sm:text-[24px] font-display leading-normal text-left">
                    File Type: {dataset.fileType?.toUpperCase() || "CSV"}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
