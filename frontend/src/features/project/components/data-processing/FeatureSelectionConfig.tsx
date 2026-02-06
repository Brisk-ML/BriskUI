import { useState, useEffect } from "react";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  useDataProcessingStepStore,
  type FeatureSelectionPreprocessorConfig,
} from "../../stores/useDataProcessingStepStore";

interface FeatureSelectionConfigProps {
  datasetId: string;
}

export function FeatureSelectionConfig({ datasetId }: FeatureSelectionConfigProps) {
  const { addPreprocessorConfig, removePreprocessorConfig, getPreprocessorConfig, getDatasetPreprocessors } = useDataProcessingStepStore();

  const [method, setMethod] = useState<
    FeatureSelectionPreprocessorConfig["method"] | ""
  >("");
  const [nFeatures, setNFeatures] = useState("");
  const [estimator, setEstimator] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Check if this preprocessor is already configured
  const configuredPreprocessors = getDatasetPreprocessors(datasetId);
  const isConfigured = configuredPreprocessors.includes("feature-selection");

  // Load existing config when component mounts or datasetId changes
  useEffect(() => {
    const existingConfig = getPreprocessorConfig(datasetId, "feature-selection") as FeatureSelectionPreprocessorConfig | null;
    if (existingConfig) {
      setMethod(existingConfig.method);
      setNFeatures(existingConfig.nFeatures?.toString() || "");
      setEstimator(existingConfig.estimator || "");
    } else {
      setMethod("");
      setNFeatures("");
      setEstimator("");
    }
  }, [datasetId, getPreprocessorConfig]);

  const handleAdd = async () => {
    if (!method) return;
    setIsProcessing(true);
    
    const config: FeatureSelectionPreprocessorConfig = {
      method,
      nFeatures: nFeatures ? (nFeatures === "auto" ? "auto" : Number(nFeatures)) : undefined,
      estimator: estimator || undefined,
    };
    
    addPreprocessorConfig(datasetId, "feature-selection", config);
    setIsProcessing(false);
  };

  const handleRemove = () => {
    setIsProcessing(true);
    removePreprocessorConfig(datasetId, "feature-selection");
    setMethod("");
    setNFeatures("");
    setEstimator("");
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
          <Select
            value={method}
            onValueChange={(v) =>
              setMethod(v as FeatureSelectionPreprocessorConfig["method"])
            }
          >
            <SelectTrigger className="bg-[#282828] border-[#404040] text-white h-9 sm:h-10 md:h-[40px] text-sm sm:text-base md:text-[18px]">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent className="bg-[#282828] border-[#404040]">
              <SelectItem value="variance" className="text-white text-sm sm:text-base">
                Variance Threshold
              </SelectItem>
              <SelectItem value="univariate" className="text-white text-sm sm:text-base">
                Univariate
              </SelectItem>
              <SelectItem value="recursive" className="text-white text-sm sm:text-base">
                Recursive Feature Elimination
              </SelectItem>
              <SelectItem value="lasso" className="text-white text-sm sm:text-base">
                Lasso
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Number of Features */}
        <div>
          <Label className="text-white text-base sm:text-lg md:text-[20px] font-display mb-2 block">
            Number of Features
          </Label>
          <Input
            value={nFeatures}
            onChange={(e) => setNFeatures(e.target.value)}
            placeholder="auto or number"
            className="bg-[#282828] border-[#404040] text-white h-9 sm:h-10 md:h-[40px] text-sm sm:text-base md:text-[18px]"
          />
        </div>

        {/* Estimator (for recursive method) */}
        {(method === "recursive" || method === "lasso") && (
          <div>
            <Label className="text-white text-base sm:text-lg md:text-[20px] font-display mb-2 block">
              Estimator
            </Label>
            <Input
              value={estimator}
              onChange={(e) => setEstimator(e.target.value)}
              placeholder="e.g., RandomForestClassifier"
              className="bg-[#282828] border-[#404040] text-white h-9 sm:h-10 md:h-[40px] text-sm sm:text-base md:text-[18px]"
            />
          </div>
        )}
      </div>

      {/* Fixed Bottom Section */}
      <div className="mt-auto pt-4 border-t border-[#404040]">
        {/* Help Text */}
        <p className="text-white/60 text-sm sm:text-[16px] font-display mb-4">
          Select features before model training.
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
