import { useState } from "react";
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
  type EncodingPreprocessorConfig,
} from "../../stores/useDataProcessingStepStore";

interface EncodingConfigProps {
  datasetId: string;
}

export function EncodingConfig({ datasetId }: EncodingConfigProps) {
  const { addPreprocessorConfig } = useDataProcessingStepStore();

  const [method, setMethod] = useState<EncodingPreprocessorConfig["method"] | "">("");
  const [handleUnknown, setHandleUnknown] = useState<"error" | "ignore">("error");
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = async () => {
    if (!method) return;
    setIsAdding(true);
    
    addPreprocessorConfig(datasetId, "encoding", { method, handleUnknown });
    setMethod("");
    setHandleUnknown("error");
    setIsAdding(false);
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
          onValueChange={(v) => setMethod(v as EncodingPreprocessorConfig["method"])}
        >
          <SelectTrigger className="bg-[#282828] border-[#404040] text-white h-9 sm:h-10 md:h-[40px] text-sm sm:text-base md:text-[18px]">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent className="bg-[#282828] border-[#404040]">
            <SelectItem value="onehot" className="text-white text-sm sm:text-base">
              One-Hot
            </SelectItem>
            <SelectItem value="label" className="text-white text-sm sm:text-base">
              Label
            </SelectItem>
            <SelectItem value="ordinal" className="text-white text-sm sm:text-base">
              Ordinal
            </SelectItem>
            <SelectItem value="target" className="text-white text-sm sm:text-base">
              Target
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Handle Unknown */}
      <div>
        <Label className="text-white text-base sm:text-lg md:text-[20px] font-display mb-2 block">
          Handle Unknown
        </Label>
        <Select
          value={handleUnknown}
          onValueChange={(v) => setHandleUnknown(v as "error" | "ignore")}
        >
          <SelectTrigger className="bg-[#282828] border-[#404040] text-white h-9 sm:h-10 md:h-[40px] text-sm sm:text-base md:text-[18px]">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent className="bg-[#282828] border-[#404040]">
            <SelectItem value="error" className="text-white text-sm sm:text-base">
              Error
            </SelectItem>
            <SelectItem value="ignore" className="text-white text-sm sm:text-base">
              Ignore
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Help Text */}
      <p className="text-white/60 text-sm sm:text-[16px] font-display">
        Encode categorical features for model training.
      </p>

      {/* Add Button */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleAdd}
          disabled={isAdding || !method}
          className="btn-add-hover bg-[#006b4c] text-white h-10 sm:h-11 md:h-[50px] px-6 sm:px-8 text-base sm:text-lg md:text-[20px] font-display disabled:opacity-50"
        >
          {isAdding ? "Adding..." : "Add"}
        </button>
      </div>
    </div>
  );
}
