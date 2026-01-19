import { useState } from "react";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import type { ScalingConfig as ScalingConfigType } from "@/types";
import { useDataProcessingStore } from "../../stores/useDataProcessingStore";

export function ScalingConfig() {
  const { addScalingConfig, loading } = useDataProcessingStore();

  const [method, setMethod] = useState<ScalingConfigType["method"] | "">(
    "",
  );

  const handleAdd = async () => {
    if (!method) return;
    await addScalingConfig({ method });
    setMethod("");
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
          onValueChange={(v) => setMethod(v as ScalingConfigType["method"])}
        >
          <SelectTrigger className="bg-[#282828] border-[#404040] text-white h-9 sm:h-10 md:h-[40px] text-sm sm:text-base md:text-[18px]">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent className="bg-[#282828] border-[#404040]">
            <SelectItem
              value="standard"
              className="text-white text-sm sm:text-base"
            >
              Standard
            </SelectItem>
            <SelectItem
              value="minmax"
              className="text-white text-sm sm:text-base"
            >
              MinMax
            </SelectItem>
            <SelectItem
              value="robust"
              className="text-white text-sm sm:text-base"
            >
              Robust
            </SelectItem>
            <SelectItem
              value="normalizer"
              className="text-white text-sm sm:text-base"
            >
              Normalizer
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Help Text */}
      <p className="text-white/60 text-sm sm:text-[16px] font-display">
        Apply scaling to input features.
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
