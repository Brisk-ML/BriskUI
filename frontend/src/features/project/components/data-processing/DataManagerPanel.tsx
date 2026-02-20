import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { HoverSelect } from "@/shared/components/ui/hover-select";
import { useDataProcessingStepStore } from "../../stores/useDataProcessingStepStore";

interface DataManagerPanelProps {
  datasetId: string;
  onEditDefaults: () => void;
}

export function DataManagerPanel({ datasetId, onEditDefaults }: DataManagerPanelProps) {
  const { getEffectiveDataManager, updateDatasetDataManager } = useDataProcessingStepStore();
  const dataManager = getEffectiveDataManager(datasetId);

  // Convert test_size (0-1) to percentages for display
  const testSizePercent = Math.round(dataManager.testSize * 100);

  const handleTestSizeChange = (value: string) => {
    const percent = Number.parseInt(value, 10);
    if (!Number.isNaN(percent) && percent >= 1 && percent <= 99) {
      updateDatasetDataManager(datasetId, { testSize: percent / 100 });
    }
  };

  const handleNSplitsChange = (value: string) => {
    const num = Number.parseInt(value, 10);
    if (!Number.isNaN(num) && num >= 1) {
      updateDatasetDataManager(datasetId, { nSplits: num });
    }
  };

  const handleRandomStateChange = (value: string) => {
    if (value.trim() === "") {
      updateDatasetDataManager(datasetId, { randomState: null });
    } else {
      const num = Number.parseInt(value, 10);
      if (!Number.isNaN(num)) {
        updateDatasetDataManager(datasetId, { randomState: num });
      }
    }
  };

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
              <Input
                value={100 - testSizePercent}
                onChange={(e) => handleTestSizeChange((100 - Number.parseInt(e.target.value, 10) || 0).toString())}
                className="bg-[#282828] border-[#404040] text-white h-9 text-[16px]"
              />
            </div>
            <div className="flex-1">
              <div className="text-white/60 text-[14px] mb-1">Test</div>
              <Input
                value={testSizePercent}
                onChange={(e) => handleTestSizeChange(e.target.value)}
                className="bg-[#282828] border-[#404040] text-white h-9 text-[16px]"
              />
            </div>
          </div>
        </div>

        {/* Group Column */}
        <div>
          <Label className="text-white text-lg sm:text-xl lg:text-[20px] font-display mb-2 block">
            Group Column
          </Label>
          <Input
            value={dataManager.groupColumn || ""}
            onChange={(e) => updateDatasetDataManager(datasetId, { 
              groupColumn: e.target.value.trim() || null 
            })}
            placeholder="Optional"
            className="bg-[#282828] border-[#404040] text-white h-10 sm:h-[40px] text-base sm:text-[18px]"
          />
        </div>

        {/* Split Method */}
        <div>
          <Label className="text-white text-lg sm:text-xl lg:text-[20px] font-display mb-2 block">
            Split Method
          </Label>
          <HoverSelect
            value={dataManager.splitMethod}
            onValueChange={(v) =>
              updateDatasetDataManager(datasetId, { splitMethod: v as "shuffle" | "kfold" })
            }
            options={[
              { value: "shuffle", label: "Shuffle" },
              { value: "kfold", label: "K-Fold" },
            ]}
            triggerClassName="bg-[#282828] border-[#404040] text-white h-[40px] text-[18px]"
          />
        </div>

        {/* Number of Splits */}
        <div>
          <Label className="text-white text-lg sm:text-xl lg:text-[20px] font-display mb-2 block">
            Number of Splits
          </Label>
          <Input
            value={dataManager.nSplits}
            onChange={(e) => handleNSplitsChange(e.target.value)}
            className="bg-[#282828] border-[#404040] text-white h-10 sm:h-[40px] text-base sm:text-[18px]"
          />
        </div>

        {/* Stratified */}
        <div>
          <Label className="text-white text-lg sm:text-xl lg:text-[20px] font-display mb-2 block">
            Stratified
          </Label>
          <HoverSelect
            value={dataManager.stratified ? "true" : "false"}
            onValueChange={(v) =>
              updateDatasetDataManager(datasetId, { stratified: v === "true" })
            }
            options={[
              { value: "false", label: "False" },
              { value: "true", label: "True" },
            ]}
            triggerClassName="bg-[#282828] border-[#404040] text-white h-[40px] text-[18px]"
          />
        </div>

        {/* Random State */}
        <div>
          <Label className="text-white text-lg sm:text-xl lg:text-[20px] font-display mb-2 block">
            Random State
          </Label>
          <Input
            value={dataManager.randomState ?? ""}
            onChange={(e) => handleRandomStateChange(e.target.value)}
            placeholder="Optional (e.g., 42)"
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
