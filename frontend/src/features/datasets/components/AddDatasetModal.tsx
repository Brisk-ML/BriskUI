import { Loader2, Search, X } from "lucide-react";
import type { ChangeEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { parseDatasetFile } from "@/api";
import { cn } from "@/lib/utils";
import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Dialog, DialogContent, DialogTitle } from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { HoverSelect } from "@/shared/components/ui/hover-select";
import { STYLES } from "@/shared/constants/colors";
import type { DatasetFileType, Feature } from "@/types";

interface AddDatasetModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (dataset: {
    name: string;
    fileName: string;
    tableName: string;
    fileType: DatasetFileType;
    targetFeature: string;
    featuresCount: number;
    observationsCount: number;
    features: Feature[];
  }) => void;
}

interface FormState {
  fileName: string;
  tableName: string;
  fileType: DatasetFileType;
  targetFeature: string;
  featuresCount: string;
  observationsCount: string;
  features: Feature[];
}

const initialFormState: FormState = {
  fileName: "",
  tableName: "",
  fileType: "csv",
  targetFeature: "",
  featuresCount: "",
  observationsCount: "",
  features: [],
};

export function AddDatasetModal({ open, onClose, onAdd }: AddDatasetModalProps) {
  const [form, setForm] = useState<FormState>(initialFormState);
  const [featureName, setFeatureName] = useState("");
  const [dataType, setDataType] = useState<"str" | "int" | "float">("str");
  const [isCategorical, setIsCategorical] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isParsingFile, setIsParsingFile] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [resetHovered, setResetHovered] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setForm(initialFormState);
      setFeatureName("");
      setDataType("str");
      setIsCategorical(false);
      setSearchQuery("");
      setParseError(null);
    }
  }, [open]);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const extension = file.name.split(".").pop()?.toLowerCase();

    if (extension !== "csv" && extension !== "xlsx" && extension !== "xls") {
      setParseError("Only CSV and XLSX files are supported for upload.");
      return;
    }

    setIsParsingFile(true);
    setParseError(null);

    try {
      const result = await parseDatasetFile(file);

      const features: Feature[] = result.features.map((f) => ({
        id: crypto.randomUUID(),
        name: f.name,
        type: f.data_type,
        categorical: f.categorical,
      }));

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
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleAddFeature = () => {
    if (featureName.trim()) {
      setForm((prev) => ({
        ...prev,
        features: [
          ...prev.features,
          {
            id: crypto.randomUUID(),
            name: featureName,
            type: dataType,
            categorical: isCategorical,
          },
        ],
      }));
      setFeatureName("");
      setDataType("str");
      setIsCategorical(false);
    }
  };

  const handleDeleteFeature = (id: string) => {
    setForm((prev) => ({
      ...prev,
      features: prev.features.filter((f) => f.id !== id),
    }));
  };

  const handleReset = () => {
    setForm(initialFormState);
    setFeatureName("");
    setDataType("str");
    setIsCategorical(false);
    setSearchQuery("");
    setParseError(null);
  };

  const fileNameHasExtension = /\.[^/.]+$/.test(form.fileName);

  const handleSubmit = () => {
    if (!form.fileName || !fileNameHasExtension) return;

    onAdd({
      name: form.tableName || form.fileName.replace(/\.[^/.]+$/, ""),
      fileName: form.fileName,
      tableName: form.tableName,
      fileType: form.fileType,
      targetFeature: form.targetFeature,
      featuresCount: form.features.length || Number(form.featuresCount) || 0,
      observationsCount: Number(form.observationsCount) || 0,
      features: form.features,
    });
    onClose();
  };

  const filteredFeatures = form.features.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent
        showCloseButton={false}
        className={`max-w-[95vw] md:max-w-[900px] border-2 ${STYLES.border} ${STYLES.bgCard} p-0 gap-0 max-h-[90vh] overflow-hidden flex flex-col`}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 p-1 text-white/60 hover:text-white transition-colors z-10"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="px-4 sm:px-6 pt-4 pb-3 shrink-0">
          <DialogTitle className="h1-underline text-2xl sm:text-3xl font-bold text-white font-display">
            Add Dataset
          </DialogTitle>
        </div>

        <div className="px-4 sm:px-6 pb-4 overflow-y-auto flex-1">
          {/* Form Fields */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-4">
            {/* File Name */}
            <div>
              <Label className="text-white text-sm sm:text-base font-display mb-1 block">
                File Name
              </Label>
              <Input
                value={form.fileName}
                onChange={(e) => setForm((prev) => ({ ...prev, fileName: e.target.value }))}
                placeholder="data.csv"
                className="bg-[#282828] border-[#404040] text-white h-9 text-sm"
              />
              {form.fileName && !fileNameHasExtension && (
                <p className="text-red-400 text-xs mt-1">File extension required (e.g. .csv, .xlsx)</p>
              )}
            </div>

            {/* Table Name */}
            <div>
              <Label className="text-white text-sm sm:text-base font-display mb-1 block">
                Table Name
              </Label>
              <Input
                value={form.tableName}
                onChange={(e) => setForm((prev) => ({ ...prev, tableName: e.target.value }))}
                placeholder="Optional (for SQLite)"
                className="bg-[#282828] border-[#404040] text-white h-9 text-sm"
              />
            </div>

            {/* File Type */}
            <div>
              <Label className="text-white text-sm sm:text-base font-display mb-1 block">
                File Type
              </Label>
              <HoverSelect
                value={form.fileType}
                onValueChange={(v) => setForm((prev) => ({ ...prev, fileType: v as DatasetFileType }))}
                placeholder="Select"
                options={[
                  { value: "csv", label: "CSV" },
                  { value: "xlsx", label: "XLSX" },
                  { value: "sqlite", label: "SQLite" },
                ]}
                triggerClassName="bg-[#282828] border-[#404040] text-white h-9 text-sm"
              />
            </div>

            {/* Target Feature */}
            <div>
              <Label className="text-white text-sm sm:text-base font-display mb-1 block">
                Target Feature
              </Label>
              <Input
                value={form.targetFeature}
                onChange={(e) => setForm((prev) => ({ ...prev, targetFeature: e.target.value }))}
                placeholder="Name"
                className="bg-[#282828] border-[#404040] text-white h-9 text-sm"
              />
            </div>

            {/* Features (#) */}
            <div>
              <Label className="text-white text-sm sm:text-base font-display mb-1 block">
                Features (#)
              </Label>
              <Input
                value={form.featuresCount}
                onChange={(e) => setForm((prev) => ({ ...prev, featuresCount: e.target.value }))}
                placeholder="Ex. 10"
                className="bg-[#282828] border-[#404040] text-white h-9 text-sm"
              />
            </div>

            {/* Observations (#) */}
            <div>
              <Label className="text-white text-sm sm:text-base font-display mb-1 block">
                Observations (#)
              </Label>
              <Input
                value={form.observationsCount}
                onChange={(e) => setForm((prev) => ({ ...prev, observationsCount: e.target.value }))}
                placeholder="Ex. 500"
                className="bg-[#282828] border-[#404040] text-white h-9 text-sm"
              />
            </div>
          </div>

          {/* Feature Table Section */}
          <div className="flex flex-col md:flex-row border-2 border-[#404040] mb-4">
            {/* Left - Feature Input */}
            <div className="p-3 space-y-2 border-b md:border-b-0 md:border-r border-[#404040] bg-[#181818] w-full md:w-[180px]">
              <div>
                <Label className="text-white text-sm font-display mb-1 block">
                  Feature Name
                </Label>
                <Input
                  value={featureName}
                  onChange={(e) => setFeatureName(e.target.value)}
                  placeholder="Name"
                  onKeyDown={(e) => e.key === "Enter" && handleAddFeature()}
                  className="bg-[#282828] border-[#404040] text-white h-8 text-sm"
                />
              </div>
              <div>
                <Label className="text-white text-sm font-display mb-1 block">
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
                  triggerClassName="bg-[#282828] border-[#404040] text-white h-8 text-sm"
                />
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="categorical-modal"
                  checked={isCategorical}
                  onCheckedChange={(checked) => setIsCategorical(checked === true)}
                  className="border-[#404040] data-[state=checked]:bg-[#006b4c] data-[state=checked]:border-[#00a878]"
                />
                <Label
                  htmlFor="categorical-modal"
                  className="text-white text-sm font-display cursor-pointer"
                >
                  Categorical
                </Label>
              </div>
              <Button
                onClick={handleAddFeature}
                className="w-10 h-10 bg-[#181818] hover:bg-[#282828] text-white p-2"
              >
                <img src="/add.svg" alt="Add" className="w-full h-full" />
              </Button>
            </div>

            {/* Right - Feature Table */}
            <div className="flex-1 flex flex-col min-h-[180px] max-h-[220px]">
              {/* Table Header */}
              <div className="bg-[#121212] grid grid-cols-[1fr_46px_80px_24px] sm:grid-cols-[1fr_50px_86px_24px] items-center h-8 border-b border-[#404040]">
                <span className="text-white text-xs sm:text-sm font-display px-3 border-r border-[#404040]">Name</span>
                <span className="text-white text-xs sm:text-sm font-display px-2 border-r border-[#404040]">Type</span>
                <span className="text-white text-xs sm:text-sm font-display text-center px-1">Categorical</span>
                <div />
              </div>

              {/* Table Body */}
              <div className="flex-1 overflow-y-auto">
                {filteredFeatures.map((feature, index) => (
                  <div
                    key={feature.id}
                    className={cn(
                      "grid grid-cols-[1fr_38px_32px_24px] items-center h-8",
                      index % 2 === 0 ? "bg-[#181818]" : "bg-[#282828]"
                    )}
                  >
                    <span className="text-white text-xs sm:text-sm font-display truncate px-3 border-r border-[#404040]">
                      {feature.name}
                    </span>
                    <span className="text-white text-xs sm:text-sm font-display px-2 border-r border-[#404040]">{feature.type}</span>
                    <span className="text-white text-xs sm:text-sm font-display text-center">
                      {feature.categorical ? "Yes" : "No"}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteFeature(feature.id)}
                      className="w-6 h-6 flex items-center justify-center text-white hover:text-red-500"
                    >
                      <X className="w-3 h-3" />
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
                    className="bg-[#282828] border-[#404040] text-white h-7 pr-8 text-sm"
                  />
                  <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-white/60" />
                </div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-white/30" />
            <span className="text-white text-lg font-display">or</span>
            <div className="flex-1 h-px bg-white/30" />
          </div>

          {/* Upload Button */}
          <div className="text-center space-y-1">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="relative inline-flex group/upload">
              <Button
                onClick={handleUploadClick}
                disabled={isParsingFile}
                className="bg-[#282828] hover:bg-[#383838] text-white border border-[#404040] h-10 px-8 text-lg font-display disabled:opacity-50"
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
            {parseError && (
              <p className="text-red-400 text-sm font-display">{parseError}</p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-4 sm:px-6 pb-4 pt-3 border-t border-[#404040] flex justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={handleReset}
            onMouseEnter={() => setResetHovered(true)}
            onMouseLeave={() => setResetHovered(false)}
            className="border-2 h-10 px-6 text-base font-display transition-colors"
            style={{
              borderColor: resetHovered ? "#FF3D29" : "#404040",
              backgroundColor: resetHovered ? "rgba(255, 61, 41, 0.2)" : "#121212",
              color: "white",
            }}
          >
            Reset
          </button>
          <Button
            onClick={handleSubmit}
            disabled={!form.fileName || !fileNameHasExtension}
            className="btn-add-hover bg-[#006b4c] text-white h-10 px-6 text-base font-display border border-[#363636] disabled:opacity-50"
          >
            Add Dataset
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
