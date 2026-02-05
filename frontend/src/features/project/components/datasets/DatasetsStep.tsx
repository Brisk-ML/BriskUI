import { Search, X } from "lucide-react";
import type { ChangeEvent } from "react";
import { useRef, useState } from "react";
import { useDatasetsStepStore } from "@/features/project/stores/useDatasetsStepStore";
import { cn } from "@/lib/utils";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import type { DatasetFileType } from "@/types";

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
    toggleDataset,
    resetForm,
  } = useDatasetsStepStore();

  // Local state for feature input
  const [featureName, setFeatureName] = useState("");
  const [dataType, setDataType] = useState<"str" | "int" | "float">("str");
  const [searchQuery, setSearchQuery] = useState("");
  const [resetHovered, setResetHovered] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const name = file.name;
      const extension = name.split(".").pop()?.toLowerCase();
      let newFileType: DatasetFileType = "csv";
      if (extension === "parquet") newFileType = "parquet";
      else if (extension === "json") newFileType = "json";

      setForm({
        fileName: name,
        tableName: name.replace(/\.[^/.]+$/, ""),
        fileType: newFileType,
      });
    }
  };

  const handleAddFeature = () => {
    if (featureName.trim()) {
      addFeature({
        id: crypto.randomUUID(),
        name: featureName,
        type: dataType,
      });
      setFeatureName("");
      setDataType("str");
    }
  };

  const handleDeleteFeature = (id: string) => {
    removeFeature(id);
  };

  const handleReset = () => {
    resetForm();
    setFeatureName("");
    setDataType("str");
    setSearchQuery("");
  };

  const handleAddOrUpdateDataset = () => {
    if (!form.fileName) return;

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
      <div className="bg-[#181818] border-2 border-[#404040] px-4 sm:px-6 py-4 max-h-[550px] overflow-y-auto">
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
                File Name
              </Label>
              <Input
                value={form.fileName}
                onChange={(e) => setForm({ fileName: e.target.value })}
                placeholder="File name"
                className="bg-[#282828] border-[#404040] text-white h-10 sm:h-[40px] text-base sm:text-[18px] placeholder:text-white/60"
              />
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
              <Select
                value={form.fileType}
                onValueChange={(v: DatasetFileType) =>
                  setForm({ fileType: v })
                }
              >
                <SelectTrigger className="bg-[#282828] border-[#404040] text-white h-10 sm:h-[40px] w-full sm:w-[150px] text-base sm:text-[18px]">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent className="bg-[#282828] border-[#404040]">
                  <SelectItem value="csv" className="text-white">
                    CSV
                  </SelectItem>
                  <SelectItem value="parquet" className="text-white">
                    Parquet
                  </SelectItem>
                  <SelectItem value="json" className="text-white">
                    JSON
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Group Column */}
            <div className="w-full lg:w-[200px]">
              <Label className="text-white text-lg sm:text-xl lg:text-[24px] font-display mb-2 block">
                Group Column
              </Label>
              <Input
                value={form.groupColumn}
                onChange={(e) => setForm({ groupColumn: e.target.value })}
                placeholder="Optional"
                className="bg-[#282828] border-[#404040] text-white h-10 sm:h-[40px] text-base sm:text-[18px] placeholder:text-white/60"
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
          <div className="border-2 border-[#404040] flex flex-col lg:flex-row h-auto lg:h-[351px]">
            {/* Input Section */}
            <div className="p-3 sm:p-4 space-y-3 sm:space-y-4 border-b-2 lg:border-b-0 lg:border-r-2 border-[#404040] bg-[#181818] lg:w-[320px]">
              <div>
                <Label className="text-white text-lg sm:text-xl lg:text-[24px] font-display mb-2 block">
                  Feature Name
                </Label>
                <Input
                  value={featureName}
                  onChange={(e) => setFeatureName(e.target.value)}
                  placeholder="Name"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddFeature();
                  }}
                  className="bg-[#282828] border-[#404040] text-white h-10 sm:h-[40px] text-base sm:text-[18px] placeholder:text-white/60 w-full lg:w-[200px]"
                />
              </div>
              <div>
                <Label className="text-white text-lg sm:text-xl lg:text-[24px] font-display mb-2 block">
                  Data Type
                </Label>
                <Select
                  value={dataType}
                  onValueChange={(v: "str" | "int" | "float") => setDataType(v)}
                >
                  <SelectTrigger className="bg-[#282828] border-[#404040] text-white h-10 sm:h-[40px] w-full lg:w-[200px] text-base sm:text-[18px]">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#282828] border-[#404040]">
                    <SelectItem value="str" className="text-white">
                      str
                    </SelectItem>
                    <SelectItem value="int" className="text-white">
                      int
                    </SelectItem>
                    <SelectItem value="float" className="text-white">
                      float
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handleAddFeature}
                className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-[#282828] hover:bg-[#383838] text-white border border-[#404040] p-3 sm:p-4 lg:p-5 flex items-center justify-center"
              >
                <img src="/add.svg" alt="Add" className="w-full h-full" />
              </Button>
            </div>

            {/* Table Section */}
            <div className="flex-1 bg-white overflow-hidden flex flex-col min-h-[280px] lg:min-h-0">
              {/* Table Header */}
              <div className="bg-[#121212] flex items-center px-4 h-[40px] border-b border-[#404040]">
                <span className="flex-1 text-white text-lg sm:text-xl lg:text-[24px] font-display">
                  Name
                </span>
                <span className="w-16 sm:w-20 text-white text-lg sm:text-xl lg:text-[24px] font-display">
                  Type
                </span>
                <div className="w-8" />
              </div>

              {/* Table Body */}
              <div className="flex-1 overflow-y-auto">
                {filteredFeatures.map((feature, index) => (
                  <div
                    key={feature.id}
                    className={cn(
                      "flex items-center px-4 h-[40px]",
                      index % 2 === 0 ? "bg-[#181818]" : "bg-[#282828]",
                    )}
                  >
                    <span className="flex-1 text-white text-base sm:text-[18px] font-display truncate">
                      {feature.name}
                    </span>
                    <span className="w-16 sm:w-20 text-white text-base sm:text-[18px] font-display">
                      {feature.type}
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

        {/* Divider */}
        <div className="flex items-center gap-4 my-4 sm:my-6">
          <div className="flex-1 h-[1px] bg-white/40" />
          <span className="text-white text-[24px] sm:text-[28px] font-display">
            or
          </span>
          <div className="flex-1 h-[1px] bg-white/40" />
        </div>

        {/* Upload Button */}
        <div className="text-center space-y-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,.xls,.parquet,.json"
            onChange={handleFileChange}
            className="hidden"
          />
          <Button
            onClick={handleUploadClick}
            className="bg-[#282828] hover:bg-[#383838] text-white border border-[#404040] h-[50px] px-8 text-[24px] sm:text-[28px] font-display"
          >
            Upload
          </Button>
          <p className="text-white/60 text-[20px] sm:text-[24px] font-display">
            CSV or XLSX files
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 sm:gap-4 mt-4 sm:mt-6 justify-end flex-wrap">
          <button
            type="button"
            onClick={handleReset}
            onMouseEnter={() => setResetHovered(true)}
            onMouseLeave={() => setResetHovered(false)}
            className="border-2 h-[44px] sm:h-[50px] px-4 sm:px-6 text-xl sm:text-2xl lg:text-[28px] font-display rounded-md transition-colors"
            style={{
              borderColor: resetHovered ? "#FF3D29" : "#404040",
              backgroundColor: resetHovered
                ? "rgba(255, 61, 41, 0.2)"
                : "#121212",
              color: "white",
            }}
          >
            {selectedDatasetId ? "Cancel Edit" : "Reset"}
          </button>
          <Button
            onClick={handleAddOrUpdateDataset}
            className="btn-add-hover bg-[#006b4c] text-white h-[44px] sm:h-[50px] px-4 sm:px-6 text-xl sm:text-2xl lg:text-[28px] font-display border border-[#363636]"
          >
            {selectedDatasetId ? "Update Dataset" : "Add Dataset"}
          </Button>
        </div>
      </div>

      {/* Datasets Bar */}
      <div className="bg-[#282828] border-2 border-[#363636] h-auto sm:h-[300px] overflow-hidden">
        {datasets.length === 0 ? (
          <div className="flex items-center justify-center h-[200px] sm:h-full">
            <p className="text-white text-[24px] sm:text-[28px] font-display">
              No datasets added
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
                  <div className="text-white text-xl sm:text-[28px] font-display leading-normal min-h-[30px] sm:h-[40px] flex items-center text-left truncate">
                    {dataset.name || "Dataset Name"}
                  </div>
                  <div className="h-[2px] bg-white w-full max-w-[225px]" />
                  <div className="text-white text-lg sm:text-[24px] font-display leading-normal min-h-[24px] sm:h-[30px] text-left">
                    {dataset.observationsCount || "0"} x{" "}
                    {dataset.featuresCount || "0"}
                  </div>
                  <div className="text-white text-lg sm:text-[24px] font-display leading-normal text-left">
                    Group: {dataset.groupColumn || "None"}
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
