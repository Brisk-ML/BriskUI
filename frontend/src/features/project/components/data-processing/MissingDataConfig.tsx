import { useState, useEffect } from "react";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { HoverSelect } from "@/shared/components/ui/hover-select";
import {
  useDataProcessingStepStore,
  type MissingDataPreprocessorConfig,
} from "../../stores/useDataProcessingStepStore";

interface MissingDataConfigProps {
  datasetId: string;
}

export function MissingDataConfig({ datasetId }: MissingDataConfigProps) {
  const { addPreprocessorConfig, removePreprocessorConfig, getPreprocessorConfig, getDatasetPreprocessors } = useDataProcessingStepStore();

  const [strategy, setStrategy] = useState<
    MissingDataPreprocessorConfig["strategy"] | ""
  >("");
  const [fillValue, setFillValue] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Check if this preprocessor is already configured
  const configuredPreprocessors = getDatasetPreprocessors(datasetId);
  const isConfigured = configuredPreprocessors.includes("missing-data");

  // Load existing config when component mounts or datasetId changes
  useEffect(() => {
    const existingConfig = getPreprocessorConfig(datasetId, "missing-data") as MissingDataPreprocessorConfig | null;
    if (existingConfig) {
      setStrategy(existingConfig.strategy);
      setFillValue(existingConfig.fillValue?.toString() || "");
    } else {
      setStrategy("");
      setFillValue("");
    }
  }, [datasetId, getPreprocessorConfig]);

  const handleAdd = async () => {
    if (!strategy) return;
    setIsProcessing(true);
    
    const config: MissingDataPreprocessorConfig = {
      strategy,
      fillValue: fillValue || undefined,
    };
    
    addPreprocessorConfig(datasetId, "missing-data", config);
    setIsProcessing(false);
  };

  const handleRemove = () => {
    setIsProcessing(true);
    removePreprocessorConfig(datasetId, "missing-data");
    setStrategy("");
    setFillValue("");
    setIsProcessing(false);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Form Fields */}
      <div className="flex-1 space-y-3 sm:space-y-4">
        {/* Strategy */}
        <div>
          <Label className="text-white text-base sm:text-lg md:text-[20px] font-display mb-2 block">
            Strategy
          </Label>
          <HoverSelect
            value={strategy}
            onValueChange={(v) =>
              setStrategy(v as MissingDataPreprocessorConfig["strategy"])
            }
            placeholder="Select"
            options={[
              { value: "mean", label: "Mean" },
              { value: "median", label: "Median" },
              { value: "most_frequent", label: "Most Frequent" },
              { value: "constant", label: "Constant" },
              { value: "drop", label: "Drop" },
            ]}
            triggerClassName="bg-[#282828] border-[#404040] text-white h-9 sm:h-10 md:h-[40px] text-sm sm:text-base md:text-[18px]"
          />
        </div>

        {/* Fill Value (only for constant) */}
        {strategy === "constant" && (
          <div>
            <Label className="text-white text-base sm:text-lg md:text-[20px] font-display mb-2 block">
              Fill Value
            </Label>
            <Input
              value={fillValue}
              onChange={(e) => setFillValue(e.target.value)}
              placeholder="Value to fill"
              className="bg-[#282828] border-[#404040] text-white h-9 sm:h-10 md:h-[40px] text-sm sm:text-base md:text-[18px]"
            />
          </div>
        )}
      </div>

      {/* Fixed Bottom Section */}
      <div className="mt-auto pt-4 border-t border-[#404040]">
        {/* Help Text */}
        <p className="text-white/60 text-sm sm:text-[16px] font-display mb-4">
          Handle missing values by imputation or dropping rows.
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
              disabled={isProcessing || !strategy}
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
