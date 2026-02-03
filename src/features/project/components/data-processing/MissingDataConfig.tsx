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
import type { MissingDataConfig as MissingDataConfigType } from "@/types";
import { useDataProcessingStore } from "../../stores/useDataProcessingStore";

export function MissingDataConfig() {
  const { addMissingDataConfig, loading } = useDataProcessingStore();

  const [strategy, setStrategy] = useState<
    MissingDataConfigType["strategy"] | ""
  >("");
  const [imputeMethod, setImputeMethod] = useState<
    MissingDataConfigType["imputeMethod"] | ""
  >("");
  const [constantValue, setConstantValue] = useState("");

  const handleAdd = async () => {
    if (!strategy || !imputeMethod) return;
    await addMissingDataConfig({
      strategy,
      imputeMethod,
      constantValue: constantValue || undefined,
    });
    setStrategy("");
    setImputeMethod("");
    setConstantValue("");
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
            setStrategy(v as MissingDataConfigType["strategy"])
          }
        >
          <SelectTrigger className="bg-[#282828] border-[#404040] text-white h-9 sm:h-10 md:h-[40px] text-sm sm:text-base md:text-[18px]">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent className="bg-[#282828] border-[#404040]">
            <SelectItem
              value="drop"
              className="text-white text-sm sm:text-base"
            >
              Drop
            </SelectItem>
            <SelectItem
              value="impute"
              className="text-white text-sm sm:text-base"
            >
              Impute
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Impute Method */}
      <div>
        <Label className="text-white text-base sm:text-lg md:text-[20px] font-display mb-2 block">
          Impute Method
        </Label>
        <Select
          value={imputeMethod}
          onValueChange={(v) =>
            setImputeMethod(v as MissingDataConfigType["imputeMethod"])
          }
        >
          <SelectTrigger className="bg-[#282828] border-[#404040] text-white h-9 sm:h-10 md:h-[40px] text-sm sm:text-base md:text-[18px]">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent className="bg-[#282828] border-[#404040]">
            <SelectItem
              value="mean"
              className="text-white text-sm sm:text-base"
            >
              Mean
            </SelectItem>
            <SelectItem
              value="median"
              className="text-white text-sm sm:text-base"
            >
              Median
            </SelectItem>
            <SelectItem
              value="mode"
              className="text-white text-sm sm:text-base"
            >
              Mode
            </SelectItem>
            <SelectItem
              value="constant"
              className="text-white text-sm sm:text-base"
            >
              Constant
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Constant Value */}
      <div>
        <Label className="text-white text-base sm:text-lg md:text-[20px] font-display mb-2 block">
          Constant Value
        </Label>
        <Input
          value={constantValue}
          onChange={(e) => setConstantValue(e.target.value)}
          placeholder="ID"
          className="bg-[#282828] border-[#404040] text-white h-9 sm:h-10 md:h-[40px] text-sm sm:text-base md:text-[18px]"
        />
      </div>

      {/* Help Text */}
      <p className="text-white/60 text-sm sm:text-[16px] font-display">
        Handle missing values by dropping or imputing value.
      </p>

      {/* Add Button */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleAdd}
          disabled={loading}
          className="btn-add-hover bg-[#006b4c] text-white h-10 sm:h-11 md:h-[50px] px-6 sm:px-8 text-base sm:text-lg md:text-[20px] font-display disabled:opacity-50"
        >
          {loading ? "Adding..." : "Add"}
        </button>
      </div>
    </div>
  );
}
