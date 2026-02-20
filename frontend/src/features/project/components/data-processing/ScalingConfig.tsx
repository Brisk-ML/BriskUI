import { useState, useEffect } from "react";
import { Label } from "@/shared/components/ui/label";
import { HoverSelect } from "@/shared/components/ui/hover-select";
import {
  useDataProcessingStepStore,
  type ScalingPreprocessorConfig,
} from "../../stores/useDataProcessingStepStore";

interface ScalingConfigProps {
  datasetId: string;
}

export function ScalingConfig({ datasetId }: ScalingConfigProps) {
  const { addPreprocessorConfig, removePreprocessorConfig, getPreprocessorConfig, getDatasetPreprocessors } = useDataProcessingStepStore();

  const [method, setMethod] = useState<ScalingPreprocessorConfig["method"] | "">("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Check if this preprocessor is already configured
  const configuredPreprocessors = getDatasetPreprocessors(datasetId);
  const isConfigured = configuredPreprocessors.includes("scaling");

  // Load existing config when component mounts or datasetId changes
  useEffect(() => {
    const existingConfig = getPreprocessorConfig(datasetId, "scaling") as ScalingPreprocessorConfig | null;
    if (existingConfig) {
      setMethod(existingConfig.method);
    } else {
      setMethod("");
    }
  }, [datasetId, getPreprocessorConfig]);

  const handleAdd = async () => {
    if (!method) return;
    setIsProcessing(true);
    
    addPreprocessorConfig(datasetId, "scaling", { method });
    setIsProcessing(false);
  };

  const handleRemove = () => {
    setIsProcessing(true);
    removePreprocessorConfig(datasetId, "scaling");
    setMethod("");
    setIsProcessing(false);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Form Fields */}
      <div className="flex-1 space-y-3 sm:space-y-4">
        {/* Method */}
        <div>
          <Label className="text-white text-base sm:text-lg md:text-[20px] font-display mb-2 block">
            Method
          </Label>
          <HoverSelect
            value={method}
            onValueChange={(v) => setMethod(v as ScalingPreprocessorConfig["method"])}
            placeholder="Select"
            options={[
              { value: "standard", label: "Standard" },
              { value: "minmax", label: "MinMax" },
              { value: "robust", label: "Robust" },
              { value: "normalizer", label: "Normalizer" },
            ]}
            triggerClassName="bg-[#282828] border-[#404040] text-white h-9 sm:h-10 md:h-[40px] text-sm sm:text-base md:text-[18px]"
          />
        </div>
      </div>

      {/* Fixed Bottom Section */}
      <div className="mt-auto pt-4 border-t border-[#404040]">
        {/* Help Text */}
        <p className="text-white/60 text-sm sm:text-[16px] font-display mb-4">
          Apply scaling to input features.
        </p>

        {/* Add/Remove Button */}
        <div className="flex justify-end">
          {isConfigured ? (
            <button
              type="button"
              onClick={handleRemove}
              disabled={isProcessing}
              className="bg-[#8B0000] hover:bg-[#A52A2A] text-white h-10 sm:h-11 md:h-[50px] px-6 sm:px-8 text-base sm:text-lg md:text-[20px] font-display disabled:opacity-50 transition-colors"
            >
              {isProcessing ? "Removing..." : "Remove"}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleAdd}
              disabled={isProcessing || !method}
              className="btn-add-hover bg-[#006b4c] text-white h-10 sm:h-11 md:h-[50px] px-6 sm:px-8 text-base sm:text-lg md:text-[20px] font-display disabled:opacity-50"
            >
              {isProcessing ? "Adding..." : "Add"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
