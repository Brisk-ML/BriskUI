import { cn } from "@/lib/utils";
import type { PreprocessorType } from "@/types";
import { useDataProcessingStepStore } from "../../stores/useDataProcessingStepStore";
import { EncodingConfig } from "./EncodingConfig";
import { FeatureSelectionConfig } from "./FeatureSelectionConfig";
import { MissingDataConfig } from "./MissingDataConfig";
import { ScalingConfig } from "./ScalingConfig";

const PREPROCESSORS: { id: PreprocessorType; label: string }[] = [
  { id: "missing-data", label: "Missing\nData" },
  { id: "scaling", label: "Scaling" },
  { id: "encoding", label: "Encoding" },
  { id: "feature-selection", label: "Feature\nSelection" },
];

interface PreprocessorPanelProps {
  datasetId: string | null;
}

export function PreprocessorPanel({ datasetId }: PreprocessorPanelProps) {
  const { activePreprocessor, setActivePreprocessor, getDatasetPreprocessors } =
    useDataProcessingStepStore();

  // Get preprocessors configured for the selected dataset
  const configuredPreprocessors = datasetId
    ? getDatasetPreprocessors(datasetId)
    : [];

  const handlePreprocessorClick = (id: PreprocessorType) => {
    // Must have a dataset selected to select a preprocessor
    if (!datasetId) return;
    setActivePreprocessor(id);
  };

  const renderConfigForm = () => {
    if (!datasetId) {
      return (
        <div className="flex items-center justify-center h-full">
          <p className="text-white text-[28px] font-display text-center">
            Select a dataset first
          </p>
        </div>
      );
    }

    switch (activePreprocessor) {
      case "missing-data":
        return <MissingDataConfig datasetId={datasetId} />;
      case "scaling":
        return <ScalingConfig datasetId={datasetId} />;
      case "encoding":
        return <EncodingConfig datasetId={datasetId} />;
      case "feature-selection":
        return <FeatureSelectionConfig datasetId={datasetId} />;
      default:
        return (
          <div className="flex items-center justify-center h-full">
            <p className="text-white text-[28px] font-display text-center">
              Select a preprocessor to configure
            </p>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col gap-6 h-full min-h-0">
      <div className="shrink-0">
        <h2 className="text-white text-[28px] font-display text-center mb-4">
          Preprocessors
        </h2>
        <div className="flex gap-4 flex-wrap justify-center">
          {PREPROCESSORS.map((preprocessor) => {
            const isActive = activePreprocessor === preprocessor.id;
            const isConfigured = configuredPreprocessors.includes(
              preprocessor.id,
            );
            const isDisabled = !datasetId;

            return (
              <button
                key={preprocessor.id}
                type="button"
                onClick={() => handlePreprocessorClick(preprocessor.id)}
                disabled={isDisabled}
                className={cn(
                  "w-[100px] h-[100px] border-2 flex items-center justify-center relative",
                  "text-white text-[18px] sm:text-[20px] font-display text-center leading-tight",
                  "transition-all duration-300 whitespace-pre-line",
                  isDisabled
                    ? "bg-[#1a1a1a] border-[#2a2a2a] cursor-not-allowed opacity-50"
                    : "cursor-pointer",
                  !isDisabled && isActive
                    ? "bg-[#006b4c] border-[#00a878] ring-2 ring-white ring-offset-2 ring-offset-[#181818]"
                    : !isDisabled && isConfigured
                      ? "bg-[#006b4c] border-[#00a878]"
                      : !isDisabled && "card-hover-fade bg-[#121212] border-[#363636]",
                )}
              >
                {preprocessor.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="shrink-0">
        {activePreprocessor && datasetId && (
          <p className="text-white/80 text-sm sm:text-base font-display mb-2">
            Configuring:{" "}
            <span className="font-semibold text-white">
              {PREPROCESSORS.find(
                (p) => p.id === activePreprocessor,
              )?.label.replace("\n", " ") ?? activePreprocessor}
            </span>
          </p>
        )}
        <div className="bg-[#282828] border-2 border-[#363636] h-[380px] sm:h-[400px] p-6 overflow-y-auto">
          {renderConfigForm()}
        </div>
      </div>
    </div>
  );
}
