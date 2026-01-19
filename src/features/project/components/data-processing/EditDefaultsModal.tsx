import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { useDataProcessingStore } from "../../stores/useDataProcessingStore";

interface EditDefaultsModalProps {
  open: boolean;
  onClose: () => void;
}

export function EditDefaultsModal({ open, onClose }: EditDefaultsModalProps) {
  const { dataManager, updateDataManager } = useDataProcessingStore();

  const [trainSize, setTrainSize] = useState(
    dataManager.testSize.train.toString(),
  );
  const [testSize, setTestSize] = useState(
    dataManager.testSize.test.toString(),
  );
  const [groupColumn, setGroupColumn] = useState(dataManager.groupColumn);
  const [splitMethod, setSplitMethod] = useState(dataManager.splitMethod);
  const [numberOfSplits, setNumberOfSplits] = useState(
    dataManager.numberOfSplits.toString(),
  );
  const [stratified, setStratified] = useState(
    dataManager.stratified ? "true" : "false",
  );
  const [randomState, setRandomState] = useState(
    dataManager.randomState.toString(),
  );

  useEffect(() => {
    if (open) {
      setTrainSize(dataManager.testSize.train.toString());
      setTestSize(dataManager.testSize.test.toString());
      setGroupColumn(dataManager.groupColumn);
      setSplitMethod(dataManager.splitMethod);
      setNumberOfSplits(dataManager.numberOfSplits.toString());
      setStratified(dataManager.stratified ? "true" : "false");
      setRandomState(dataManager.randomState.toString());
    }
  }, [open, dataManager]);

  const handleSave = () => {
    updateDataManager({
      testSize: {
        train: Number.parseInt(trainSize, 10) || 50,
        test: Number.parseInt(testSize, 10) || 50,
      },
      groupColumn,
      splitMethod: splitMethod as "random" | "shuffle" | "stratified",
      numberOfSplits: Number.parseInt(numberOfSplits, 10) || 3,
      stratified: stratified === "true",
      randomState: Number.parseInt(randomState, 10) || 42,
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-[95vw] sm:max-w-[90vw] md:max-w-[600px] lg:max-w-[700px] border-2 border-[#404040] bg-[#181818] p-4 sm:p-6 md:p-8 md:max-h-[85vh]">
        {/* Header */}
        <DialogHeader className="mb-3 sm:mb-4 md:mb-6">
          <DialogTitle className="text-xl sm:text-2xl md:text-[28px] font-bold text-white font-display relative inline-block w-fit">
            Edit Default Data Manager
            <div className="absolute -bottom-1 left-0 w-full h-[2px] bg-white" />
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
                  value={trainSize}
                  onChange={(e) => {
                    const val = e.target.value;
                    setTrainSize(val);
                    const trainNum = Number.parseInt(val, 10) || 0;
                    setTestSize((100 - trainNum).toString());
                  }}
                  className="bg-[#282828] border-[#404040] text-white h-9 sm:h-10 md:h-[40px] text-sm sm:text-base md:text-[18px]"
                />
                <div className="text-white/60 text-xs sm:text-[14px] mt-1">
                  {trainSize}%
                </div>
              </div>
              <div className="flex-1">
                <div className="text-white text-sm sm:text-[16px] mb-1">
                  Test
                </div>
                <Input
                  value={testSize}
                  onChange={(e) => {
                    const val = e.target.value;
                    setTestSize(val);
                    const testNum = Number.parseInt(val, 10) || 0;
                    setTrainSize((100 - testNum).toString());
                  }}
                  className="bg-[#282828] border-[#404040] text-white h-9 sm:h-10 md:h-[40px] text-sm sm:text-base md:text-[18px]"
                />
                <div className="text-white/60 text-xs sm:text-[14px] mt-1">
                  {testSize}%
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
              placeholder="Name"
              className="bg-[#282828] border-[#404040] text-white h-9 sm:h-10 md:h-[40px] text-sm sm:text-base md:text-[18px]"
            />
          </div>

          {/* Number of Splits */}
          <div>
            <Label className="text-white text-base sm:text-lg md:text-[20px] font-display mb-2 block">
              Number of Splits
            </Label>
            <Input
              value={numberOfSplits}
              onChange={(e) => setNumberOfSplits(e.target.value)}
              placeholder="5"
              className="bg-[#282828] border-[#404040] text-white h-9 sm:h-10 md:h-[40px] text-sm sm:text-base md:text-[18px]"
            />
          </div>

          {/* Split Method */}
          <div>
            <Label className="text-white text-base sm:text-lg md:text-[20px] font-display mb-2 block">
              Split Method
            </Label>
            <Select
              value={splitMethod}
              onValueChange={(v: "random" | "shuffle" | "stratified") =>
                setSplitMethod(v)
              }
            >
              <SelectTrigger className="bg-[#282828] border-[#404040] text-white h-9 sm:h-10 md:h-[40px] text-sm sm:text-base md:text-[18px]">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent className="bg-[#282828] border-[#404040]">
                <SelectItem
                  value="random"
                  className="text-white text-sm sm:text-base"
                >
                  Random
                </SelectItem>
                <SelectItem
                  value="shuffle"
                  className="text-white text-sm sm:text-base"
                >
                  Shuffle
                </SelectItem>
                <SelectItem
                  value="stratified"
                  className="text-white text-sm sm:text-base"
                >
                  Stratified
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Random State */}
          <div>
            <Label className="text-white text-base sm:text-lg md:text-[20px] font-display mb-2 block">
              Random State
            </Label>
            <Input
              value={randomState}
              onChange={(e) => setRandomState(e.target.value)}
              placeholder="42"
              className="bg-[#282828] border-[#404040] text-white h-9 sm:h-10 md:h-[40px] text-sm sm:text-base md:text-[18px]"
            />
          </div>

          {/* Stratified */}
          <div>
            <Label className="text-white text-base sm:text-lg md:text-[20px] font-display mb-2 block">
              Stratified
            </Label>
            <Select value={stratified} onValueChange={setStratified}>
              <SelectTrigger className="bg-[#282828] border-[#404040] text-white h-9 sm:h-10 md:h-[40px] text-sm sm:text-base md:text-[18px]">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent className="bg-[#282828] border-[#404040]">
                <SelectItem
                  value="false"
                  className="text-white text-sm sm:text-base"
                >
                  False
                </SelectItem>
                <SelectItem
                  value="true"
                  className="text-white text-sm sm:text-base"
                >
                  True
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-4 mt-4 sm:mt-6">
          <button
            type="button"
            onClick={onClose}
            className="bg-[#121212] border border-[#404040] text-white h-10 sm:h-11 md:h-[40px] px-4 sm:px-6 text-sm sm:text-base md:text-[18px] font-display hover:bg-[#1a1a1a] transition-colors w-full sm:w-auto"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="bg-[#006b4c] text-white h-10 sm:h-11 md:h-[40px] px-4 sm:px-6 text-sm sm:text-base md:text-[18px] font-display hover:bg-[#005a3f] transition-colors w-full sm:w-auto"
          >
            Save
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
