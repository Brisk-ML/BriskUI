import { useState } from "react";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import type { FeatureSelectionConfig as FeatureSelectionConfigType } from "@/types";
import { useDataProcessingStore } from "../../stores/useDataProcessingStore";

export function FeatureSelectionConfig() {
  const { addFeatureSelectionConfig, loading } = useDataProcessingStore();

  const [method, setMethod] = useState<
    FeatureSelectionConfigType["method"] | ""
  >("");
  const [numberOfFeatures, setNumberOfFeatures] = useState("");
  const [estimator, setEstimator] = useState<
    FeatureSelectionConfigType["estimator"] | ""
  >("");
  const [crossValidation, setCrossValidation] = useState("");

  const handleAdd = async () => {
    if (!method) return;
    await addFeatureSelectionConfig({
      method,
      numberOfFeatures: numberOfFeatures ? Number(numberOfFeatures) : undefined,
      estimator: estimator || undefined,
      crossValidation: crossValidation ? Number(crossValidation) : undefined,
    });
    setMethod("");
    setNumberOfFeatures("");
    setEstimator("");
    setCrossValidation("");
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Method */}
      <div>
        <Label className="text-white text-base sm:text-lg md:text-[20px] font-display mb-2 block">
          Method
        </Label>
        <Select
          value={method}
          onValueChange={(v) =>
            setMethod(v as FeatureSelectionConfigType["method"])
          }
        >
          <SelectTrigger className="bg-[#282828] border-[#404040] text-white h-9 sm:h-10 md:h-[40px] text-sm sm:text-base md:text-[18px]">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent className="bg-[#282828] border-[#404040]">
            <SelectItem
              value="variance"
              className="text-white text-sm sm:text-base"
            >
              Variance Threshold
            </SelectItem>
            <SelectItem
              value="univariate"
              className="text-white text-sm sm:text-base"
            >
              Univariate
            </SelectItem>
            <SelectItem
              value="recursive"
              className="text-white text-sm sm:text-base"
            >
              Recursive Feature Elimination
            </SelectItem>
            <SelectItem
              value="lasso"
              className="text-white text-sm sm:text-base"
            >
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
          value={numberOfFeatures}
          onChange={(e) => setNumberOfFeatures(e.target.value)}
          placeholder="ID"
          className="bg-[#282828] border-[#404040] text-white h-9 sm:h-10 md:h-[40px] text-sm sm:text-base md:text-[18px]"
        />
      </div>

      {/* Estimator */}
      <div>
        <Label className="text-white text-base sm:text-lg md:text-[20px] font-display mb-2 block">
          Estimator
        </Label>
        <Select
          value={estimator}
          onValueChange={(v) =>
            setEstimator(v as FeatureSelectionConfigType["estimator"])
          }
        >
          <SelectTrigger className="bg-[#282828] border-[#404040] text-white h-9 sm:h-10 md:h-[40px] text-sm sm:text-base md:text-[18px]">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent className="bg-[#282828] border-[#404040]">
            <SelectItem
              value="random-forest"
              className="text-white text-sm sm:text-base"
            >
              Random Forest
            </SelectItem>
            <SelectItem
              value="logistic"
              className="text-white text-sm sm:text-base"
            >
              Logistic Regression
            </SelectItem>
            <SelectItem value="svm" className="text-white text-sm sm:text-base">
              SVM
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Cross Validation */}
      <div>
        <Label className="text-white text-base sm:text-lg md:text-[20px] font-display mb-2 block">
          Cross Validation
        </Label>
        <Input
          value={crossValidation}
          onChange={(e) => setCrossValidation(e.target.value)}
          placeholder="5"
          className="bg-[#282828] border-[#404040] text-white h-9 sm:h-10 md:h-[40px] text-sm sm:text-base md:text-[18px]"
        />
      </div>

      {/* Help Text */}
      <p className="text-white/60 text-sm sm:text-[16px] font-display">
        Select features before model training.
      </p>

      {/* Add Button */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleAdd}
          disabled={loading}
          className="bg-[#006b4c] text-white h-10 sm:h-11 md:h-[50px] px-6 sm:px-8 text-base sm:text-lg md:text-[20px] font-display hover:bg-[#005a3f] transition-colors disabled:opacity-50"
        >
          {loading ? "Adding..." : "Add"}
        </button>
      </div>
    </div>
  );
}
