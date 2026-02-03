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

export function EditDefaultSplitModal() {
  const { dataManager, updateDataManager } = useDatasetsStore();
  const { editDefaultSplitModal, closeEditDefaultSplitModal } =
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

  // Reset form fields when modal opens with fresh data from store
  useEffect(() => {
    if (editDefaultSplitModal) {
      setTrainSize(dataManager.testSize.train);
      setGroupColumn(dataManager.groupColumn);
      setSplitMethod(dataManager.splitMethod);
      setNumberOfSplits(dataManager.numberOfSplits.toString());
      setStratified(dataManager.stratified ? "true" : "false");
      setRandomState(dataManager.randomState.toString());
    }
  }, [editDefaultSplitModal, dataManager]);

  const handleSave = () => {
    // Test size is always the complement of train size (they add up to 100%)
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
    closeEditDefaultSplitModal();
  };

  // Calculate test size for display (train + test always = 100%)
  const testSize = 100 - trainSize;

  return (
    <Dialog
      open={editDefaultSplitModal}
      onOpenChange={(isOpen) => !isOpen && closeEditDefaultSplitModal()}
    >
      <DialogContent className="max-w-[95vw] sm:max-w-[90vw] md:max-w-[600px] border-2 border-[#404040] bg-[#181818] p-4 sm:p-6 md:max-h-[85vh]">
        {/* Header */}
        <DialogHeader className="mb-3 sm:mb-4">
          <DialogTitle className="h1-underline text-xl sm:text-2xl md:text-[28px] font-bold text-white font-display w-fit">
            Edit Default Data Manager
          </DialogTitle>
        </DialogHeader>

        {/* Form */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {/* Test Size with Slider */}
          <div className="col-span-1 sm:col-span-2">
            <Label className="text-white text-base sm:text-lg md:text-[20px] font-display mb-2 block">
              Test Size
            </Label>
            <div className="space-y-3 sm:space-y-4">
              <Slider
                value={[trainSize]}
                onValueChange={(value) => setTrainSize(value[0])}
                max={100}
                min={0}
                step={1}
                className="w-full"
              />
              <div className="flex items-center justify-between gap-3 sm:gap-4">
                <div className="flex-1">
                  <div className="text-white text-sm sm:text-[16px] mb-1">
                    Train
                  </div>
                  <div
                    className={cn(
                      "bg-[#282828] border border-[#404040] text-white h-9 sm:h-10 md:h-[40px] px-3",
                      "flex items-center text-sm sm:text-base md:text-[18px]",
                    )}
                  >
                    {trainSize}%
                  </div>
                </div>
                <div className="flex-1">
                  <div className="text-white text-sm sm:text-[16px] mb-1">
                    Test
                  </div>
                  <div
                    className={cn(
                      "bg-[#282828] border border-[#404040] text-white h-9 sm:h-10 md:h-[40px] px-3",
                      "flex items-center text-sm sm:text-base md:text-[18px]",
                    )}
                  >
                    {testSize}%
                  </div>
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
              type="number"
              value={numberOfSplits}
              onChange={(e) => setNumberOfSplits(e.target.value)}
              placeholder="5"
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
                  No
                </SelectItem>
                <SelectItem
                  value="true"
                  className="text-white text-sm sm:text-base"
                >
                  Yes
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
              type="number"
              value={randomState}
              onChange={(e) => setRandomState(e.target.value)}
              placeholder="42"
              className="bg-[#282828] border-[#404040] text-white h-9 sm:h-10 md:h-[40px] text-sm sm:text-base md:text-[18px]"
            />
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-4 mt-4 sm:mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={closeEditDefaultSplitModal}
            className="btn-cancel-hover border border-[#404040] bg-[#121212] text-white h-10 sm:h-11 md:h-[40px] px-4 sm:px-6 text-sm sm:text-base md:text-[18px] font-display w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            className="btn-add-hover bg-[#006b4c] text-white h-10 sm:h-11 md:h-[40px] px-4 sm:px-6 text-sm sm:text-base md:text-[18px] font-display w-full sm:w-auto"
          >
            Save Defaults
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
