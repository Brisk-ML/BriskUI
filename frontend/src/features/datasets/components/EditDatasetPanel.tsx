import { X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { HoverSelect } from "@/shared/components/ui/hover-select";
import type { Feature } from "@/types";
import { useDatasetsModalStore } from "../stores/useDatasetsModalStore";
import { useDatasetsStore } from "../stores/useDatasetsStore";

interface EditDatasetPanelProps {
  className?: string;
}

export function EditDatasetPanel({ className }: EditDatasetPanelProps) {
  const {
    editForm,
    updateEditForm,
    featureSearch,
    setFeatureSearch,
    addFeature,
    removeFeature,
    updateFeature,
  } = useDatasetsStore();
  const { openEditSplittingModal } = useDatasetsModalStore();

  const [newFeatureName, setNewFeatureName] = useState("");

  // Filter features based on search
  const filteredFeatures = editForm.features.filter((feature) =>
    feature.name.toLowerCase().includes(featureSearch.toLowerCase()),
  );

  const handleAddFeature = () => {
    if (newFeatureName.trim()) {
      const newFeature: Feature = {
        id: crypto.randomUUID(),
        name: newFeatureName.trim(),
        type: "str",
      };
      addFeature(newFeature);
      setNewFeatureName("");
    }
  };

  return (
    <div
      className={cn(
        "bg-[#181818] border-2 border-[#404040] flex flex-col h-full",
        className,
      )}
    >
      {/* Header */}
      <div className="px-4 py-3 sm:px-6 sm:py-4">
        <h2 className="h1-underline text-white text-[20px] sm:text-[24px] font-display">
          Edit Dataset
        </h2>
      </div>

      {/* Form Fields */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 space-y-3 sm:space-y-4">
        {/* File Name */}
        <div>
          <Label className="text-white text-[16px] sm:text-[20px] font-display mb-1 sm:mb-2 block">
            File Name
          </Label>
          <Input
            value={editForm.fileName}
            readOnly
            className="bg-[#282828] border-[#404040] text-white h-[36px] sm:h-[40px] text-[16px] sm:text-[18px]"
          />
        </div>

        {/* Table Name */}
        <div>
          <Label className="text-white text-[16px] sm:text-[20px] font-display mb-1 sm:mb-2 block">
            Table Name
          </Label>
          <Input
            value={editForm.tableName}
            readOnly
            className="bg-[#282828] border-[#404040] text-white h-[36px] sm:h-[40px] text-[16px] sm:text-[18px]"
          />
        </div>

        {/* File Type */}
        <div>
          <Label className="text-white text-[16px] sm:text-[20px] font-display mb-1 sm:mb-2 block">
            File Type
          </Label>
          <HoverSelect
            value={editForm.fileType}
            onValueChange={(value) =>
              updateEditForm({ fileType: value as "csv" | "parquet" | "json" })
            }
            options={[
              { value: "csv", label: "CSV" },
              { value: "parquet", label: "Parquet" },
              { value: "json", label: "JSON" },
            ]}
            triggerClassName="bg-[#282828] border-[#404040] text-white h-[36px] sm:h-[40px] text-[16px] sm:text-[18px]"
          />
        </div>

        {/* Group Column */}
        <div>
          <Label className="text-white text-[16px] sm:text-[20px] font-display mb-1 sm:mb-2 block">
            Group Column
          </Label>
          <Input
            value={editForm.groupColumn}
            onChange={(e) => updateEditForm({ groupColumn: e.target.value })}
            className="bg-[#282828] border-[#404040] text-white h-[36px] sm:h-[40px] text-[16px] sm:text-[18px]"
          />
        </div>

        {/* Target Feature */}
        <div>
          <Label className="text-white text-[16px] sm:text-[20px] font-display mb-1 sm:mb-2 block">
            Target Feature
          </Label>
          <Input
            value={editForm.targetFeature}
            onChange={(e) => updateEditForm({ targetFeature: e.target.value })}
            className="bg-[#282828] border-[#404040] text-white h-[36px] sm:h-[40px] text-[16px] sm:text-[18px]"
          />
        </div>

        {/* Features Count */}
        <div>
          <Label className="text-white text-[16px] sm:text-[20px] font-display mb-1 sm:mb-2 block">
            Features Count
          </Label>
          <Input
            value={editForm.featuresCount}
            readOnly
            type="number"
            className="bg-[#282828] border-[#404040] text-white h-[36px] sm:h-[40px] text-[16px] sm:text-[18px]"
          />
        </div>

        {/* Observations Count */}
        <div>
          <Label className="text-white text-[16px] sm:text-[20px] font-display mb-1 sm:mb-2 block">
            Observations Count
          </Label>
          <Input
            value={editForm.observationsCount}
            readOnly
            type="number"
            className="bg-[#282828] border-[#404040] text-white h-[36px] sm:h-[40px] text-[16px] sm:text-[18px]"
          />
        </div>

        {/* Features Table */}
        <div className="pt-2 sm:pt-4">
          <Label className="text-white text-[16px] sm:text-[20px] font-display mb-2 sm:mb-3 block">
            Features
          </Label>

          {/* Search Input */}
          <Input
            placeholder="Search features..."
            value={featureSearch}
            onChange={(e) => setFeatureSearch(e.target.value)}
            className="bg-[#282828] border-[#404040] text-white h-[36px] sm:h-[40px] text-[14px] sm:text-[16px] mb-3"
          />

          {/* Features Table */}
          <div className="border border-[#404040] rounded overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-[1fr_80px_40px] sm:grid-cols-[1fr_100px_50px] bg-[#282828] px-2 sm:px-3 py-2 border-b border-[#404040]">
              <span className="text-white text-[14px] sm:text-[16px] font-display">
                Name
              </span>
              <span className="text-white text-[14px] sm:text-[16px] font-display">
                Type
              </span>
              <span />
            </div>

            {/* Table Body */}
            <div className="max-h-[200px] sm:max-h-[250px] overflow-y-auto">
              {filteredFeatures.length > 0 ? (
                filteredFeatures.map((feature) => (
                  <div
                    key={feature.id}
                    className="grid grid-cols-[1fr_80px_40px] sm:grid-cols-[1fr_100px_50px] px-2 sm:px-3 py-2 border-b border-[#404040] last:border-b-0 items-center"
                  >
                    <span className="text-white text-[14px] sm:text-[16px] truncate">
                      {feature.name}
                    </span>
                    <HoverSelect
                      value={feature.type}
                      onValueChange={(value) =>
                        updateFeature(feature.id, { type: value as "str" | "int" | "float" })
                      }
                      options={[
                        { value: "str", label: "str" },
                        { value: "int", label: "int" },
                        { value: "float", label: "float" },
                      ]}
                      triggerClassName="bg-[#282828] border-[#404040] text-white h-[28px] sm:h-[32px] text-[12px] sm:text-[14px] px-2"
                    />
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => removeFeature(feature.id)}
                      className="text-white/60 hover:text-white hover:bg-[#383838] h-[28px] w-[28px] sm:h-[32px] sm:w-[32px]"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              ) : (
                <div className="px-3 py-4 text-white/60 text-[14px] text-center">
                  {featureSearch ? "No features found" : "No features"}
                </div>
              )}
            </div>
          </div>

          {/* Add Feature */}
          <div className="flex gap-2 mt-3">
            <Input
              placeholder="New feature name"
              value={newFeatureName}
              onChange={(e) => setNewFeatureName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddFeature()}
              className="bg-[#282828] border-[#404040] text-white h-[36px] sm:h-[40px] text-[14px] sm:text-[16px] flex-1"
            />
            <Button
              onClick={handleAddFeature}
              disabled={!newFeatureName.trim()}
              className="bg-[#282828] hover:bg-[#383838] text-white h-[36px] sm:h-[40px] px-3 sm:px-4 font-display text-[14px] sm:text-[16px] border border-[#404040]"
            >
              Add Feature
            </Button>
          </div>
        </div>
      </div>

      {/* Edit Splitting Button */}
      <div className="px-4 sm:px-6 py-4 sm:py-6">
        <Button
          onClick={openEditSplittingModal}
          className="w-full bg-[#282828] hover:bg-[#383838] text-white h-[44px] sm:h-[50px] text-[20px] sm:text-[28px] font-display border border-[#404040]"
        >
          Edit Splitting
        </Button>
      </div>
    </div>
  );
}
