import { useState } from "react";
import { useDatasetsStepStore } from "@/features/project/stores/useDatasetsStepStore";
import { useDataProcessingStepStore } from "@/features/project/stores/useDataProcessingStepStore";
import { cn } from "@/lib/utils";
import { DataManagerPanel } from "./DataManagerPanel";
import { EditDefaultsModal } from "./EditDefaultsModal";
import { PreprocessorPanel } from "./PreprocessorPanel";

export function DataProcessingStep() {
  const { datasets } = useDatasetsStepStore();
  const { selectedDatasetId, selectDataset } = useDataProcessingStepStore();
  const [showEditDefaultsModal, setShowEditDefaultsModal] = useState(false);

  const handleDatasetClick = (id: string) => {
    if (selectedDatasetId === id) {
      selectDataset(null);
    } else {
      selectDataset(id);
    }
  };

  const pageTitle =
    selectedDatasetId !== null ? "Data Processing" : "Apply Preprocessing";

  return (
    <div className="w-full max-w-[1055px] px-4 xl:px-0 flex flex-col gap-6 h-full py-6 mx-auto">
      <div className="bg-[#181818] border-2 border-[#404040] flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b-2 border-[#404040]">
          <h1 className="h1-underline text-[28px] sm:text-[32px] md:text-[36px] font-bold text-[#ebebeb] font-display">
            {pageTitle}
          </h1>
        </div>

        <div className="flex-1 grid grid-cols-1 xl:grid-cols-[460px_1fr] gap-0 overflow-hidden">
          <div className="p-4 sm:p-6 border-r-0 xl:border-r-2 border-[#404040] overflow-y-auto">
            {selectedDatasetId === null ? (
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
                datasetId={selectedDatasetId}
                onEditDefaults={() => setShowEditDefaultsModal(true)}
              />
            )}
          </div>

          <div className="p-4 sm:p-6 overflow-y-auto">
            <PreprocessorPanel datasetId={selectedDatasetId} />
          </div>
        </div>
      </div>

      <div className="bg-[#282828] border-2 border-[#363636] h-[250px] sm:h-[275px] md:h-[300px] overflow-hidden flex-shrink-0">
        {datasets.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-white text-[24px] sm:text-[28px] font-display">
              No datasets added - go back to add datasets
            </p>
          </div>
        ) : (
          <div className="flex gap-4 items-center overflow-x-auto h-full p-4">
            {datasets.map((dataset) => {
              const isSelected = selectedDatasetId === dataset.id;
              return (
                <button
                  key={dataset.id}
                  type="button"
                  onClick={() => handleDatasetClick(dataset.id)}
                  className={cn(
                    "card-hover-fade border flex-shrink-0 w-[250px] h-[250px] p-2 flex flex-col gap-4 relative",
                    "cursor-pointer transition-all duration-300",
                    "hover:border-[#404040]",
                    isSelected
                      ? "bg-gradient-to-b from-[#1175d5] via-[#181818] via-[40%] to-[#121212] border-[#404040]"
                      : "bg-[#121212] border-[#363636] hover:bg-[#181818]",
                  )}
                >
                  <div className="text-white text-[24px] sm:text-[28px] font-display leading-normal h-[40px] flex items-center text-left truncate">
                    {dataset.name || dataset.fileName}
                  </div>
                  <div className="h-[2px] bg-white w-[225px]" />
                  <div className="text-white text-[20px] sm:text-[24px] font-display leading-normal h-[30px] text-left">
                    {dataset.observationsCount} x {dataset.featuresCount}
                  </div>
                  <div className="text-white text-[20px] sm:text-[24px] font-display leading-normal text-left">
                    Group: {dataset.groupColumn || "None"}
                  </div>
                  <div className="text-white text-[20px] sm:text-[24px] font-display leading-normal text-left">
                    File Type: {dataset.fileType?.toUpperCase() || "CSV"}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Defaults Modal */}
      <EditDefaultsModal
        open={showEditDefaultsModal}
        onClose={() => setShowEditDefaultsModal(false)}
      />
    </div>
  );
}
