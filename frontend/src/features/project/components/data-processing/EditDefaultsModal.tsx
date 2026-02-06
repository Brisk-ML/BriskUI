import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { HoverSelect } from "@/shared/components/ui/hover-select";
import { useDataProcessingStepStore } from "../../stores/useDataProcessingStepStore";

interface EditDefaultsModalProps {
  open: boolean;
  onClose: () => void;
}

export function EditDefaultsModal({ open, onClose }: EditDefaultsModalProps) {
  const { baseDataManager, updateBaseDataManager } = useDataProcessingStepStore();

  // Convert test_size (0-1) to percentage for display
  const [testSizePercent, setTestSizePercent] = useState(
    Math.round(baseDataManager.testSize * 100).toString(),
  );
  const [groupColumn, setGroupColumn] = useState(baseDataManager.groupColumn || "");
  const [splitMethod, setSplitMethod] = useState(baseDataManager.splitMethod);
  const [nSplits, setNSplits] = useState(baseDataManager.nSplits.toString());
  const [stratified, setStratified] = useState(
    baseDataManager.stratified ? "true" : "false",
  );
  const [randomState, setRandomState] = useState(
    baseDataManager.randomState?.toString() || "",
  );

  useEffect(() => {
    if (open) {
      setTestSizePercent(Math.round(baseDataManager.testSize * 100).toString());
      setGroupColumn(baseDataManager.groupColumn || "");
      setSplitMethod(baseDataManager.splitMethod);
      setNSplits(baseDataManager.nSplits.toString());
      setStratified(baseDataManager.stratified ? "true" : "false");
      setRandomState(baseDataManager.randomState?.toString() || "");
    }
  }, [open, baseDataManager]);

  const handleSave = () => {
    const testSizeValue = Number.parseInt(testSizePercent, 10) || 20;
    const randomStateValue = randomState.trim() 
      ? Number.parseInt(randomState, 10) 
      : null;

    updateBaseDataManager({
      testSize: Math.max(0.01, Math.min(0.99, testSizeValue / 100)),
      groupColumn: groupColumn.trim() || null,
      splitMethod: splitMethod as "shuffle" | "kfold",
      nSplits: Number.parseInt(nSplits, 10) || 5,
      stratified: stratified === "true",
      randomState: randomStateValue,
    });
    onClose();
  };

  const trainSizePercent = 100 - (Number.parseInt(testSizePercent, 10) || 0);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-[95vw] sm:max-w-[90vw] md:max-w-[600px] lg:max-w-[700px] border-2 border-[#404040] bg-[#181818] p-4 sm:p-6 md:p-8 md:max-h-[85vh]">
        {/* Header */}
        <DialogHeader className="mb-3 sm:mb-4 md:mb-6">
          <DialogTitle className="h1-underline text-xl sm:text-2xl md:text-[28px] font-bold text-white font-display w-fit">
            Edit Default Data Manager
          </DialogTitle>
        </DialogHeader>

        {/* Form */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
          {/* Test Size */}
          <div className="col-span-1 sm:col-span-2">
            <Label className="text-white text-base sm:text-lg md:text-[20px] font-display mb-2 block">
              Test Size
            </Label>
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="flex-1">
                <div className="text-white text-sm sm:text-[16px] mb-1">
                  Train
                </div>
                <Input
                  value={trainSizePercent.toString()}
                  onChange={(e) => {
                    const val = e.target.value;
                    const trainNum = Number.parseInt(val, 10) || 0;
                    setTestSizePercent((100 - trainNum).toString());
                  }}
                  className="bg-[#282828] border-[#404040] text-white h-9 sm:h-10 md:h-[40px] text-sm sm:text-base md:text-[18px]"
                />
                <div className="text-white/60 text-xs sm:text-[14px] mt-1">
                  {trainSizePercent}%
                </div>
              </div>
              <div className="flex-1">
                <div className="text-white text-sm sm:text-[16px] mb-1">
                  Test
                </div>
                <Input
                  value={testSizePercent}
                  onChange={(e) => setTestSizePercent(e.target.value)}
                  className="bg-[#282828] border-[#404040] text-white h-9 sm:h-10 md:h-[40px] text-sm sm:text-base md:text-[18px]"
                />
                <div className="text-white/60 text-xs sm:text-[14px] mt-1">
                  {testSizePercent}%
                </div>
              </div>
            </div>
          </div>

          {/* Group Column */}
          <div>
            <Label className="text-white text-base sm:text-lg md:text-[20px] font-display mb-2 block">
              Group Column
            </Label>
            <Input
              value={groupColumn}
              onChange={(e) => setGroupColumn(e.target.value)}
              placeholder="Optional"
              className="bg-[#282828] border-[#404040] text-white h-9 sm:h-10 md:h-[40px] text-sm sm:text-base md:text-[18px]"
            />
          </div>

          {/* Number of Splits */}
          <div>
            <Label className="text-white text-base sm:text-lg md:text-[20px] font-display mb-2 block">
              Number of Splits
            </Label>
            <Input
              value={nSplits}
              onChange={(e) => setNSplits(e.target.value)}
              placeholder="5"
              className="bg-[#282828] border-[#404040] text-white h-9 sm:h-10 md:h-[40px] text-sm sm:text-base md:text-[18px]"
            />
          </div>

          {/* Split Method */}
          <div>
            <Label className="text-white text-base sm:text-lg md:text-[20px] font-display mb-2 block">
              Split Method
            </Label>
            <HoverSelect
              value={splitMethod}
              onValueChange={(v) => setSplitMethod(v as "shuffle" | "kfold")}
              placeholder="Select"
              options={[
                { value: "shuffle", label: "Shuffle" },
                { value: "kfold", label: "K-Fold" },
              ]}
              triggerClassName="bg-[#282828] border-[#404040] text-white h-9 sm:h-10 md:h-[40px] text-sm sm:text-base md:text-[18px]"
            />
          </div>

          {/* Random State */}
          <div>
            <Label className="text-white text-base sm:text-lg md:text-[20px] font-display mb-2 block">
              Random State
            </Label>
            <Input
              value={randomState}
              onChange={(e) => setRandomState(e.target.value)}
              placeholder="Optional (e.g., 42)"
              className="bg-[#282828] border-[#404040] text-white h-9 sm:h-10 md:h-[40px] text-sm sm:text-base md:text-[18px]"
            />
          </div>

          {/* Stratified */}
          <div>
            <Label className="text-white text-base sm:text-lg md:text-[20px] font-display mb-2 block">
              Stratified
            </Label>
            <HoverSelect
              value={stratified}
              onValueChange={setStratified}
              placeholder="Select"
              options={[
                { value: "false", label: "False" },
                { value: "true", label: "True" },
              ]}
              triggerClassName="bg-[#282828] border-[#404040] text-white h-9 sm:h-10 md:h-[40px] text-sm sm:text-base md:text-[18px]"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-4 mt-4 sm:mt-6">
          <button
            type="button"
            onClick={onClose}
            className="btn-cancel-hover border border-[#404040] bg-[#121212] text-white h-10 sm:h-11 md:h-[40px] px-4 sm:px-6 text-sm sm:text-base md:text-[18px] font-display w-full sm:w-auto"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="btn-add-hover bg-[#006b4c] text-white h-10 sm:h-11 md:h-[40px] px-4 sm:px-6 text-sm sm:text-base md:text-[18px] font-display w-full sm:w-auto"
          >
            Save
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
