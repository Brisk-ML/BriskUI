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
import type { EncodingConfig as EncodingConfigType } from "@/types";
import { useDataProcessingStore } from "../../stores/useDataProcessingStore";

export function EncodingConfig() {
  const { addEncodingConfig, loading } = useDataProcessingStore();

  const [method, setMethod] = useState<EncodingConfigType["method"] | "">("");
  const [cutoffs, setCutoffs] = useState("");

  const handleAdd = async () => {
    if (!method) return;
    await addEncodingConfig({ method, cutoffs: cutoffs || undefined });
    setMethod("");
    setCutoffs("");
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
          onValueChange={(v) => setMethod(v as EncodingConfigType["method"])}
        >
          <SelectTrigger className="bg-[#282828] border-[#404040] text-white h-9 sm:h-10 md:h-[40px] text-sm sm:text-base md:text-[18px]">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent className="bg-[#282828] border-[#404040]">
            <SelectItem
              value="onehot"
              className="text-white text-sm sm:text-base"
            >
              One-Hot
            </SelectItem>
            <SelectItem
              value="label"
              className="text-white text-sm sm:text-base"
            >
              Label
            </SelectItem>
            <SelectItem
              value="ordinal"
              className="text-white text-sm sm:text-base"
            >
              Ordinal
            </SelectItem>
            <SelectItem
              value="binary"
              className="text-white text-sm sm:text-base"
            >
              Binary
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Cutoffs */}
      <div>
        <Label className="text-white text-base sm:text-lg md:text-[20px] font-display mb-2 block">
          Cutoffs
        </Label>
        <Input
          value={cutoffs}
          onChange={(e) => setCutoffs(e.target.value)}
          placeholder="ID"
          className="bg-[#282828] border-[#404040] text-white h-9 sm:h-10 md:h-[40px] text-sm sm:text-base md:text-[18px]"
        />
      </div>

      {/* Help Text */}
      <p className="text-white/60 text-sm sm:text-[16px] font-display">
        Encode categorical features.
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
