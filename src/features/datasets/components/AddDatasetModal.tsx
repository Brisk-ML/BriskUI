import { Plus, Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/shared/components/ui/button";
import { Dialog, DialogContent } from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import type { Feature } from "@/types";
import { useDatasetsModalStore } from "../stores/useDatasetsModalStore";
import { useDatasetsStore } from "../stores/useDatasetsStore";

interface FormState {
  fileName: string;
  tableName: string;
  fileType: string;
  groupColumn: string;
  targetFeature: string;
  featuresCount: string;
  observationsCount: string;
  newFeatureName: string;
  newFeatureType: string;
  features: Feature[];
}

const initialFormState: FormState = {
  fileName: "",
  tableName: "",
  fileType: "",
  groupColumn: "",
  targetFeature: "",
  featuresCount: "",
  observationsCount: "",
  newFeatureName: "",
  newFeatureType: "",
  features: [
    { id: "1", name: "Feature 1", type: "str" },
    { id: "2", name: "Feature 2", type: "int" },
    { id: "3", name: "Feature 3", type: "float" },
    { id: "4", name: "Feature 4", type: "str" },
    { id: "5", name: "Feature 5", type: "float" },
    { id: "6", name: "Feature 6", type: "str" },
    { id: "7", name: "Feature 7", type: "int" },
  ],
};

export function AddDatasetModal() {
  const { addDataset } = useDatasetsStore();
  const { addDatasetModal, closeAddDatasetModal } = useDatasetsModalStore();

  const [form, setForm] = useState<FormState>(initialFormState);
  const [featureSearch, setFeatureSearch] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (addDatasetModal) {
      setForm(initialFormState);
      setFeatureSearch("");
    }
  }, [addDatasetModal]);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const fileName = file.name;
      const extension = fileName.split(".").pop()?.toLowerCase();
      let fileType = "csv";
      if (extension === "xlsx") fileType = "xlsx";
      else if (extension === "parquet") fileType = "parquet";
      else if (extension === "json") fileType = "json";

      setForm((prev) => ({
        ...prev,
        fileName,
        fileType,
        tableName: fileName.replace(/\.[^/.]+$/, ""),
      }));
    }
  };

  const addFeature = () => {
    if (!form.newFeatureName.trim()) return;
    const newFeature: Feature = {
      id: crypto.randomUUID(),
      name: form.newFeatureName,
      type: (form.newFeatureType as Feature["type"]) || "str",
    };
    setForm((prev) => ({
      ...prev,
      features: [...prev.features, newFeature],
      newFeatureName: "",
      newFeatureType: "",
    }));
  };

  const removeFeature = (id: string) => {
    setForm((prev) => ({
      ...prev,
      features: prev.features.filter((f) => f.id !== id),
    }));
  };

  const filteredFeatures = form.features.filter((f) =>
    f.name.toLowerCase().includes(featureSearch.toLowerCase()),
  );

  const handleReset = () => {
    setForm(initialFormState);
    setFeatureSearch("");
  };

  const handleSubmit = () => {
    addDataset({
      name: form.tableName || form.fileName,
      fileName: form.fileName,
      tableName: form.tableName,
      fileType: form.fileType as "csv" | "parquet" | "json",
      groupColumn: form.groupColumn,
      targetFeature: form.targetFeature,
      featuresCount: form.features.length || Number(form.featuresCount) || 0,
      observationsCount: Number(form.observationsCount) || 0,
      features: form.features,
    });
    closeAddDatasetModal();
  };

  return (
    <Dialog
      open={addDatasetModal}
      onOpenChange={(open) => !open && closeAddDatasetModal()}
    >
      <DialogContent
        showCloseButton={false}
        className="max-w-[95vw] md:max-w-[min(90vw,1060px)] border-2 border-[#404040] bg-[#181818] p-4 sm:p-6 md:max-h-[85vh]"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={closeAddDatasetModal}
          className="absolute top-3 right-3 p-1 text-white/60 hover:text-white transition-colors z-10"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Header */}
        <div className="mb-5">
          <h2 className="text-2xl font-bold text-white font-display relative inline-block">
            Add Datasets
            <div className="absolute -bottom-1 left-0 w-full h-[2px] bg-white" />
          </h2>
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="w-full lg:w-[420px] shrink-0">
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              {/* File Name */}
              <div className="flex flex-col gap-1">
                <Label className="text-white text-sm font-display">
                  File Name
                </Label>
                <Input
                  value={form.fileName}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, fileName: e.target.value }))
                  }
                  placeholder="File name"
                  className="bg-[#282828] border-[#404040] text-white h-9 text-sm"
                />
              </div>

              {/* Table Name */}
              <div className="flex flex-col gap-1">
                <Label className="text-white text-sm font-display">
                  Table Name
                </Label>
                <Input
                  value={form.tableName}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, tableName: e.target.value }))
                  }
                  placeholder="Optional"
                  className="bg-[#282828] border-[#404040] text-white h-9 text-sm"
                />
              </div>

              {/* File Type */}
              <div className="flex flex-col gap-1">
                <Label className="text-white text-sm font-display">
                  File Type
                </Label>
                <Select
                  value={form.fileType}
                  onValueChange={(v) =>
                    setForm((prev) => ({ ...prev, fileType: v }))
                  }
                >
                  <SelectTrigger className="bg-[#282828] border-[#404040] text-white h-9 text-sm">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#282828] border-[#404040]">
                    <SelectItem value="csv" className="text-white">
                      CSV
                    </SelectItem>
                    <SelectItem value="xlsx" className="text-white">
                      XLSX
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
              <div className="flex flex-col gap-1">
                <Label className="text-white text-sm font-display">
                  Group Column
                </Label>
                <Input
                  value={form.groupColumn}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      groupColumn: e.target.value,
                    }))
                  }
                  placeholder="Optional"
                  className="bg-[#282828] border-[#404040] text-white h-9 text-sm"
                />
              </div>

              {/* Target Feature */}
              <div className="flex flex-col gap-1">
                <Label className="text-white text-sm font-display">
                  Target Feature
                </Label>
                <Input
                  value={form.targetFeature}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      targetFeature: e.target.value,
                    }))
                  }
                  placeholder="Name"
                  className="bg-[#282828] border-[#404040] text-white h-9 text-sm"
                />
              </div>

              {/* Features (#) */}
              <div className="flex flex-col gap-1">
                <Label className="text-white text-sm font-display">
                  Features (#)
                </Label>
                <Input
                  value={form.featuresCount}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      featuresCount: e.target.value,
                    }))
                  }
                  placeholder="Ex. 10"
                  className="bg-[#282828] border-[#404040] text-white h-9 text-sm"
                />
              </div>

              {/* Observations (#) */}
              <div className="flex flex-col gap-1 col-span-2">
                <Label className="text-white text-sm font-display">
                  Observations (#)
                </Label>
                <Input
                  value={form.observationsCount}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      observationsCount: e.target.value,
                    }))
                  }
                  placeholder="Ex. 500"
                  className="bg-[#282828] border-[#404040] text-white h-9 text-sm w-1/2"
                />
              </div>
            </div>
          </div>

          {/* Right Side - Features Section */}
          <div className="flex-1 min-w-0 border-2 border-[#404040] flex flex-col sm:flex-row h-auto sm:h-[300px] overflow-hidden">
            {/* Feature Input */}
            <div className="flex flex-row sm:flex-col gap-2 sm:gap-3 p-3 sm:p-4 w-full sm:w-[160px] lg:w-[180px] shrink-0 border-b sm:border-b-0 sm:border-r border-[#404040]">
              <div className="flex flex-col gap-1 flex-1 sm:flex-none">
                <Label className="text-white text-xs sm:text-sm font-display">
                  Feature Name
                </Label>
                <Input
                  value={form.newFeatureName}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      newFeatureName: e.target.value,
                    }))
                  }
                  placeholder="Name"
                  onKeyDown={(e) => e.key === "Enter" && addFeature()}
                  className="bg-[#282828] border-[#404040] text-white h-8 sm:h-9 text-sm"
                />
              </div>
              <div className="flex flex-col gap-1 w-[90px] sm:w-auto shrink-0">
                <Label className="text-white text-xs sm:text-sm font-display">
                  Data Type
                </Label>
                <Select
                  value={form.newFeatureType}
                  onValueChange={(v) =>
                    setForm((prev) => ({ ...prev, newFeatureType: v }))
                  }
                >
                  <SelectTrigger className="bg-[#282828] border-[#404040] text-white h-8 sm:h-9 text-sm">
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
              <button
                type="button"
                onClick={addFeature}
                className="flex items-center justify-center sm:mt-auto self-end sm:self-auto"
              >
                <Plus className="w-7 h-7 sm:w-8 sm:h-8 text-white/60 hover:text-white" />
              </button>
            </div>

            {/* Features Table */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#181818]">
              {/* Header */}
              <div className="flex items-center justify-center gap-6 px-3 py-2 bg-[#121212] shrink-0">
                <span className="text-white text-sm font-display">Name</span>
                <div className="w-px h-4 bg-white/50" />
                <span className="text-white text-sm font-display">Type</span>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto overflow-x-hidden">
                {filteredFeatures.map((feature, index) => (
                  <div
                    key={feature.id}
                    className={cn(
                      "flex items-center px-3 py-2",
                      index % 2 === 0 ? "bg-[#181818]" : "bg-[#282828]",
                    )}
                  >
                    <span className="flex-1 text-white text-sm truncate min-w-0">
                      {feature.name}
                    </span>
                    <span className="w-12 text-white text-sm text-center shrink-0">
                      {feature.type}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeFeature(feature.id)}
                      className="ml-2 text-white/60 hover:text-white shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Search */}
              <div className="relative px-3 py-2 bg-[#282828] shrink-0">
                <Input
                  value={featureSearch}
                  onChange={(e) => setFeatureSearch(e.target.value)}
                  placeholder="Search"
                  className="bg-[#282828] border-[#404040] text-white h-8 text-sm pr-8"
                />
                <Search className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 mt-5">
          <Button
            variant="outline"
            onClick={handleReset}
            className="border-[#404040] bg-[#121212] text-white hover:text-white hover:bg-[#1a1a1a] h-10 px-6 font-display"
          >
            Reset
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-[#006b4c] hover:bg-[#005a3f] text-white h-10 px-6 font-display"
          >
            Add Dataset
          </Button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-white/30" />
          <span className="text-white text-lg font-display">or</span>
          <div className="flex-1 h-px bg-white/30" />
        </div>

        {/* Upload */}
        <div className="flex flex-col items-center gap-1">
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="border-[#404040] bg-[#121212] text-white hover:text-white hover:bg-[#1a1a1a] h-10 w-[180px] font-display"
          >
            Upload
          </Button>
          <span className="text-white text-sm font-display">
            CSV or XLSX files
          </span>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx"
            onChange={handleFileInputChange}
            className="hidden"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
