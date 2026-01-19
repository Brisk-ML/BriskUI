import { useState } from "react";
import { cn } from "@/lib/utils";
import { DataManagerPanel } from "./DataManagerPanel";
import { EditDefaultsModal } from "./EditDefaultsModal";
import { PreprocessorPanel } from "./PreprocessorPanel";

const MOCK_DATASETS = [
  {
    id: "1",
    fileName: "Dataset Name",
    observationsCount: "518",
    featuresCount: "24",
    groupColumn: "None",
    fileType: "CSV",
  },
  {
    id: "2",
    fileName: "Testing",
    observationsCount: "447",
    featuresCount: "10",
    groupColumn: "ID",
    fileType: "SQL",
  },
];

export function DataProcessingStep() {
  const [selectedDataset, setSelectedDataset] = useState<number | null>(
    null,
  );
  const [showEditDefaultsModal, setShowEditDefaultsModal] =
    useState(false);

  const pageTitle =
    selectedDataset !== null ? "Data Processing" : "Apply Preprocessing";

  return (
    <div className="w-full max-w-[1055px] px-4 xl:px-0 flex flex-col gap-6 h-full py-6 mx-auto">
      {/* Main Form - Two Column Layout */}
      <div className="bg-[#181818] border-2 border-[#404040] flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b-2 border-[#404040]">
          <h1 className="text-[28px] sm:text-[32px] md:text-[36px] font-bold text-[#ebebeb] font-display relative inline-block">
            {pageTitle}
            <div className="absolute -bottom-1 left-0 w-full h-[2px] bg-white opacity-80" />
          </h1>
        </div>

        {/* Content Grid - Flex 1 with overflow control */}
        <div className="flex-1 grid grid-cols-1 xl:grid-cols-[460px_1fr] gap-0 overflow-hidden">
          {/* Left Side - Data Manager Panel */}
          <div className="p-4 sm:p-6 border-r-0 xl:border-r-2 border-[#404040] overflow-y-auto">
            {selectedDataset === null ? (
              <div className="flex flex-col items-center justify-center h-full p-8">
                <p className="text-white text-[20px] sm:text-[24px] md:text-[28px] font-display text-center mb-8">
                  Select a dataset to apply preprocessing
                </p>
                <button
                  type="button"
                  onClick={() => setShowEditDefaultsModal(true)}
                  className="bg-[#282828] hover:bg-[#383838] text-white h-[50px] w-[225px] text-[24px] sm:text-[28px] font-display transition-colors"
                >
                  Edit Defaults
                </button>
              </div>
            ) : (
              <DataManagerPanel
                onEditDefaults={() => setShowEditDefaultsModal(true)}
              />
            )}
          </div>

          {/* Right Side - Preprocessor Panel */}
          <div className="p-4 sm:p-6 overflow-y-auto">
            <PreprocessorPanel />
          </div>
        </div>
      </div>

      {/* Datasets Bar - Fixed Height */}
      <div className="bg-[#282828] border-2 border-[#363636] h-[250px] sm:h-[275px] md:h-[300px] overflow-hidden flex-shrink-0">
        <div className="flex gap-4 items-center overflow-x-auto h-full p-4">
          {MOCK_DATASETS.map((dataset, index) => {
            const isSelected = selectedDataset === index;
            return (
              <button
                key={dataset.id}
                type="button"
                onClick={() => setSelectedDataset(isSelected ? null : index)}
                className={cn(
                  "border flex-shrink-0 w-[250px] h-[250px] p-2 flex flex-col gap-4",
                  "cursor-pointer transition-all",
                  "hover:bg-gradient-to-b hover:from-[#1175d5] hover:via-[#181818] hover:via-[40%] hover:to-[#121212] hover:border-[#404040]",
                  isSelected
                    ? "bg-gradient-to-b from-[#1175d5] via-[#181818] via-[40%] to-[#121212] border-[#404040]"
                    : "bg-[#121212] border-[#363636]",
                )}
              >
                <div className="text-white text-[24px] sm:text-[28px] font-display leading-normal h-[40px] flex items-center text-left">
                  {dataset.fileName}
                </div>
                <div className="h-[2px] bg-white w-[225px]" />
                <div className="text-white text-[20px] sm:text-[24px] font-display leading-normal h-[30px] text-left">
                  {dataset.observationsCount} x {dataset.featuresCount}
                </div>
                <div className="text-white text-[20px] sm:text-[24px] font-display leading-normal text-left">
                  Group: {dataset.groupColumn}
                </div>
                <div className="text-white text-[20px] sm:text-[24px] font-display leading-normal text-left">
                  File Type: {dataset.fileType}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Edit Defaults Modal */}
      <EditDefaultsModal
        open={showEditDefaultsModal}
        onClose={() => setShowEditDefaultsModal(false)}
      />
    </div>
  );
}
