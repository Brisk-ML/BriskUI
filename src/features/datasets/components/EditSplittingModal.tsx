import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
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
import { Slider } from "@/shared/components/ui/slider";
import { useDatasetsModalStore } from "../stores/useDatasetsModalStore";
import { useDatasetsStore } from "../stores/useDatasetsStore";

export function EditSplittingModal() {
  const { dataManager, updateDataManager } = useDatasetsStore();
  const { editSplittingModal, closeEditSplittingModal } =
    useDatasetsModalStore();

  const [trainSize, setTrainSize] = useState(dataManager.testSize.train);
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
    if (editSplittingModal) {
      setTrainSize(dataManager.testSize.train);
      setGroupColumn(dataManager.groupColumn);
      setSplitMethod(dataManager.splitMethod);
      setNumberOfSplits(dataManager.numberOfSplits.toString());
      setStratified(dataManager.stratified ? "true" : "false");
      setRandomState(dataManager.randomState.toString());
    }
  }, [editSplittingModal, dataManager]);

  const handleSave = () => {
    updateDataManager({
      testSize: {
        train: trainSize,
        test: 100 - trainSize,
      },
      groupColumn,
      splitMethod,
      numberOfSplits: Number.parseInt(numberOfSplits, 10) || 5,
      stratified: stratified === "true",
      randomState: Number.parseInt(randomState, 10) || 42,
    });
    closeEditSplittingModal();
  };

  const testSize = 100 - trainSize;

  return (
    <Dialog
      open={editSplittingModal}
      onOpenChange={(isOpen) => !isOpen && closeEditSplittingModal()}
    >
      <DialogContent className="max-w-[95vw] sm:max-w-[90vw] md:max-w-[600px] border-2 border-[#404040] bg-[#181818] p-4 sm:p-6 md:max-h-[85vh]">
        {/* Header */}
        <DialogHeader className="mb-3 sm:mb-4">
          <DialogTitle className="h1-underline text-xl sm:text-2xl md:text-[28px] font-bold text-white font-display w-fit">
            Edit Data Splitting
          </DialogTitle>
        </DialogHeader>

        {/* Form */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {/* Test Size Slider */}
          <div className="col-span-1 sm:col-span-2">
            <Label className="text-white text-base sm:text-lg md:text-[20px] font-display mb-2 block">
              Test Size
            </Label>
            <div className="flex items-center gap-3 sm:gap-4 mb-2">
              <span className="text-white text-sm sm:text-[16px] min-w-[80px] sm:min-w-[100px]">
                Train: {trainSize}%
              </span>
              <span className="text-white text-sm sm:text-[16px] min-w-[80px] sm:min-w-[100px]">
                Test: {testSize}%
              </span>
            </div>
            <Slider
              value={[trainSize]}
              onValueChange={(values) => setTrainSize(values[0])}
              min={10}
              max={90}
              step={5}
              className={cn(
                "w-full",
                "[&_[data-slot=slider-track]]:bg-[#404040] [&_[data-slot=slider-track]]:h-2",
                "[&_[data-slot=slider-range]]:bg-[#006b4c]",
                "[&_[data-slot=slider-thumb]]:border-[#006b4c] [&_[data-slot=slider-thumb]]:size-5",
              )}
            />
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

          {/* Number of Splits */}
          <div>
            <Label className="text-white text-base sm:text-lg md:text-[20px] font-display mb-2 block">
              Number of Splits
            </Label>
            <Input
              value={numberOfSplits}
              onChange={(e) => setNumberOfSplits(e.target.value)}
              placeholder="5"
              type="number"
              min={2}
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

          {/* Random State */}
          <div className="col-span-1 sm:col-span-2 sm:max-w-[calc(50%-12px)]">
            <Label className="text-white text-base sm:text-lg md:text-[20px] font-display mb-2 block">
              Random State
            </Label>
            <Input
              value={randomState}
              onChange={(e) => setRandomState(e.target.value)}
              placeholder="42"
              type="number"
              className="bg-[#282828] border-[#404040] text-white h-9 sm:h-10 md:h-[40px] text-sm sm:text-base md:text-[18px]"
            />
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-4 mt-4 sm:mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={closeEditSplittingModal}
            className="btn-cancel-hover border border-[#404040] bg-[#121212] text-white h-10 sm:h-11 md:h-[40px] px-4 sm:px-6 text-sm sm:text-base md:text-[18px] font-display w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            className="btn-add-hover bg-[#006b4c] text-white h-10 sm:h-11 md:h-[40px] px-4 sm:px-6 text-sm sm:text-base md:text-[18px] font-display border-0 w-full sm:w-auto"
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
