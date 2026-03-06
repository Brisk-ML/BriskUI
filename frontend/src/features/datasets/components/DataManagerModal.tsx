import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { HoverSelect } from "@/shared/components/ui/hover-select";
import { TrainTestSlider } from "@/shared/components/ui/train-test-slider";
import { Button } from "@/shared/components/ui/button";
import { STYLES } from "@/shared/constants/colors";

export interface DataManagerConfig {
  testSize: number;
  nSplits: number;
  splitMethod: "shuffle" | "kfold";
  groupColumn: string | null;
  stratified: boolean;
  randomState: number | null;
}

export const DEFAULT_DATA_MANAGER: DataManagerConfig = {
  testSize: 0.2,
  nSplits: 5,
  splitMethod: "shuffle",
  groupColumn: null,
  stratified: false,
  randomState: null,
};

interface DataManagerModalProps {
  open: boolean;
  onClose: () => void;
  mode: "default" | "dataset";
  datasetName?: string;
  config: DataManagerConfig;
  onSave: (config: DataManagerConfig) => void;
}

export function DataManagerModal({
  open,
  onClose,
  mode,
  datasetName,
  config,
  onSave,
}: DataManagerModalProps) {
  const [localConfig, setLocalConfig] = useState<DataManagerConfig>(config);
  const [nSplitsStr, setNSplitsStr] = useState(config.nSplits.toString());
  const [groupColumnStr, setGroupColumnStr] = useState(config.groupColumn || "");

  useEffect(() => {
    if (open) {
      setLocalConfig(config);
      setNSplitsStr(config.nSplits.toString());
      setGroupColumnStr(config.groupColumn || "");
    }
  // Only re-initialize when dialog opens, not on every config reference change
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleNSplitsChange = (value: string) => {
    setNSplitsStr(value);
    const num = Number.parseInt(value, 10);
    if (!Number.isNaN(num) && num >= 1) {
      setLocalConfig((prev) => ({ ...prev, nSplits: num }));
    }
  };

  const handleGroupColumnChange = (value: string) => {
    setGroupColumnStr(value);
    setLocalConfig((prev) => ({ ...prev, groupColumn: value.trim() || null }));
  };

  const handleRandomStateChange = (value: string) => {
    if (value.trim() === "") {
      setLocalConfig((prev) => ({ ...prev, randomState: null }));
    } else {
      const num = Number.parseInt(value, 10);
      if (!Number.isNaN(num)) {
        setLocalConfig((prev) => ({ ...prev, randomState: num }));
      }
    }
  };

  const handleSave = () => {
    onSave({
      ...localConfig,
      nSplits: localConfig.nSplits || 1,
    });
    onClose();
  };

  const title = mode === "default" 
    ? "Edit Default Split" 
    : `Edit Splitting${datasetName ? ` - ${datasetName}` : ""}`;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent
        showCloseButton={false}
        className={`max-w-[95vw] sm:max-w-[500px] border-2 ${STYLES.border} ${STYLES.bgCard} p-0 gap-0`}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 p-1 text-white/60 hover:text-white transition-colors z-10"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="px-4 sm:px-6 pt-4 pb-3">
          <DialogTitle className="h1-underline text-xl sm:text-2xl font-bold text-white font-display">
            {title}
          </DialogTitle>
        </div>

        <div className="px-4 sm:px-6 pb-4 space-y-4">
          {/* Test Size */}
          <div>
            <Label className="text-white text-base sm:text-lg font-display mb-2 block">
              Test Size
            </Label>
            <TrainTestSlider
              testSize={localConfig.testSize}
              onChange={(v) => setLocalConfig((prev) => ({ ...prev, testSize: v }))}
            />
          </div>

          {/* Group Column */}
          <div>
            <Label className="text-white text-base sm:text-lg font-display mb-2 block">
              Group Column
            </Label>
            <Input
              value={groupColumnStr}
              onChange={(e) => handleGroupColumnChange(e.target.value)}
              placeholder="Optional"
              className="bg-[#282828] border-[#404040] text-white h-10 text-base"
            />
          </div>

          {/* Split Method */}
          <div>
            <Label className="text-white text-base sm:text-lg font-display mb-2 block">
              Split Method
            </Label>
            <HoverSelect
              value={localConfig.splitMethod}
              onValueChange={(v) =>
                setLocalConfig((prev) => ({ ...prev, splitMethod: v as "shuffle" | "kfold" }))
              }
              options={[
                { value: "shuffle", label: "Shuffle" },
                { value: "kfold", label: "K-Fold" },
              ]}
              triggerClassName="bg-[#282828] border-[#404040] text-white h-10 text-base"
            />
          </div>

          {/* Number of Splits */}
          <div>
            <Label className="text-white text-base sm:text-lg font-display mb-2 block">
              Number of Splits
            </Label>
            <Input
              value={nSplitsStr}
              onChange={(e) => handleNSplitsChange(e.target.value)}
              placeholder="5"
              className="bg-[#282828] border-[#404040] text-white h-10 text-base"
            />
          </div>

          {/* Stratified */}
          <div>
            <Label className="text-white text-base sm:text-lg font-display mb-2 block">
              Stratified
            </Label>
            <HoverSelect
              value={localConfig.stratified ? "true" : "false"}
              onValueChange={(v) =>
                setLocalConfig((prev) => ({ ...prev, stratified: v === "true" }))
              }
              options={[
                { value: "false", label: "False" },
                { value: "true", label: "True" },
              ]}
              triggerClassName="bg-[#282828] border-[#404040] text-white h-10 text-base"
            />
          </div>

          {/* Random State */}
          <div>
            <Label className="text-white text-base sm:text-lg font-display mb-2 block">
              Random State
            </Label>
            <Input
              value={localConfig.randomState ?? ""}
              onChange={(e) => handleRandomStateChange(e.target.value)}
              placeholder="Optional (e.g., 42)"
              className="bg-[#282828] border-[#404040] text-white h-10 text-base"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-4 sm:px-6 pb-4 pt-3 border-t border-[#404040] flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-[#404040] bg-[#121212] text-white hover:bg-[#282828] h-10 px-6 text-base font-display"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="btn-add-hover bg-[#006b4c] text-white h-10 px-6 text-base font-display border border-[#363636]"
          >
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
