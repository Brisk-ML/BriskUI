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

interface DataManagerPanelProps {
  onEditDefaults: () => void;
}

export function DataManagerPanel({ onEditDefaults }: DataManagerPanelProps) {
  const { dataManager } = useDataProcessingStore();

  return (
    <div className="bg-[#181818] border-2 border-[#404040] p-4 sm:p-5 lg:p-6 flex flex-col justify-between h-full">
      <div className="space-y-4">
        {/* Test Size */}
        <div>
          <Label className="text-white text-lg sm:text-xl lg:text-[20px] font-display mb-2 block">
            Test Size
          </Label>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div className="text-white/60 text-[14px] mb-1">Train</div>
              <div className="text-white text-[16px]">
                {dataManager.testSize.train}%
              </div>
            </div>
            <div className="flex-1">
              <div className="text-white/60 text-[14px] mb-1">Test</div>
              <div className="text-white text-[16px]">
                {dataManager.testSize.test}%
              </div>
            </div>
          </div>
        </div>

        {/* Group Column */}
        <div>
          <Label className="text-white text-lg sm:text-xl lg:text-[20px] font-display mb-2 block">
            Group Column
          </Label>
          <Input
            value={dataManager.groupColumn}
            readOnly
            className="bg-[#282828] border-[#404040] text-white h-10 sm:h-[40px] text-base sm:text-[18px]"
          />
        </div>

        {/* Split Method */}
        <div>
          <Label className="text-white text-lg sm:text-xl lg:text-[20px] font-display mb-2 block">
            Split Method
          </Label>
          <Select value={dataManager.splitMethod} disabled>
            <SelectTrigger className="bg-[#282828] border-[#404040] text-white h-[40px] text-[18px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#282828] border-[#404040]">
              <SelectItem value="random" className="text-white">
                Random
              </SelectItem>
              <SelectItem value="shuffle" className="text-white">
                Shuffle
              </SelectItem>
              <SelectItem value="stratified" className="text-white">
                Stratified
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Number of Splits */}
        <div>
          <Label className="text-white text-lg sm:text-xl lg:text-[20px] font-display mb-2 block">
            Number of Splits
          </Label>
          <Input
            value={dataManager.numberOfSplits}
            readOnly
            className="bg-[#282828] border-[#404040] text-white h-10 sm:h-[40px] text-base sm:text-[18px]"
          />
        </div>

        {/* Stratified */}
        <div>
          <Label className="text-white text-lg sm:text-xl lg:text-[20px] font-display mb-2 block">
            Stratified
          </Label>
          <Select value={dataManager.stratified ? "true" : "false"} disabled>
            <SelectTrigger className="bg-[#282828] border-[#404040] text-white h-[40px] text-[18px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#282828] border-[#404040]">
              <SelectItem value="false" className="text-white">
                False
              </SelectItem>
              <SelectItem value="true" className="text-white">
                True
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Random State */}
        <div>
          <Label className="text-white text-lg sm:text-xl lg:text-[20px] font-display mb-2 block">
            Random State
          </Label>
          <Input
            value={dataManager.randomState}
            readOnly
            className="bg-[#282828] border-[#404040] text-white h-10 sm:h-[40px] text-base sm:text-[18px]"
          />
        </div>
      </div>

      {/* Edit Defaults Button */}
      <div className="flex justify-center pt-6">
        <button
          type="button"
          onClick={onEditDefaults}
          className="bg-[#282828] hover:bg-[#383838] text-white h-[44px] w-full sm:w-[225px] text-xl sm:text-2xl lg:text-[28px] font-display transition-colors"
        >
          Edit Defaults
        </button>
      </div>
    </div>
  );
}
