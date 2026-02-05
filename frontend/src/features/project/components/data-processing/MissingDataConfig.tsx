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
import {
  useDataProcessingStepStore,
  type MissingDataPreprocessorConfig,
} from "../../stores/useDataProcessingStepStore";

interface MissingDataConfigProps {
  datasetId: string;
}

export function MissingDataConfig({ datasetId }: MissingDataConfigProps) {
  const { addPreprocessorConfig } = useDataProcessingStepStore();

  const [strategy, setStrategy] = useState<
    MissingDataPreprocessorConfig["strategy"] | ""
  >("");
  const [fillValue, setFillValue] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = async () => {
    if (!strategy) return;
    setIsAdding(true);
    
    const config: MissingDataPreprocessorConfig = {
      strategy,
      fillValue: fillValue || undefined,
    };
    
    addPreprocessorConfig(datasetId, "missing-data", config);
    setStrategy("");
    setFillValue("");
    setIsAdding(false);
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Strategy */}
      <div>
        <Label className="text-white text-base sm:text-lg md:text-[20px] font-display mb-2 block">
          Strategy
        </Label>
        <Select
          value={strategy}
          onValueChange={(v) =>
            setStrategy(v as MissingDataPreprocessorConfig["strategy"])
          }
        >
          <SelectTrigger className="bg-[#282828] border-[#404040] text-white h-9 sm:h-10 md:h-[40px] text-sm sm:text-base md:text-[18px]">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent className="bg-[#282828] border-[#404040]">
            <SelectItem value="mean" className="text-white text-sm sm:text-base">
              Mean
            </SelectItem>
            <SelectItem value="median" className="text-white text-sm sm:text-base">
              Median
            </SelectItem>
            <SelectItem value="most_frequent" className="text-white text-sm sm:text-base">
              Most Frequent
            </SelectItem>
            <SelectItem value="constant" className="text-white text-sm sm:text-base">
              Constant
            </SelectItem>
            <SelectItem value="drop" className="text-white text-sm sm:text-base">
              Drop
            </SelectItem>
          </SelectContent>
        </Select>
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

      {/* Help Text */}
      <p className="text-white/60 text-sm sm:text-[16px] font-display">
        Handle missing values by imputation or dropping rows.
      </p>

      {/* Add Button */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleAdd}
          disabled={isAdding || !strategy}
          className="btn-add-hover bg-[#006b4c] text-white h-10 sm:h-11 md:h-[50px] px-6 sm:px-8 text-base sm:text-lg md:text-[20px] font-display disabled:opacity-50"
        >
          {isAdding ? "Adding..." : "Add"}
        </button>
      </div>
    </div>
  );
}
