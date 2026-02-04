import { cn } from "@/lib/utils";
import type { PreprocessorType } from "@/types";
import { useDataProcessingStore } from "../../stores/useDataProcessingStore";
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

export function PreprocessorPanel() {
  const { activePreprocessor, setActivePreprocessor, configuredPreprocessors } =
    useDataProcessingStore();

  const renderConfigForm = () => {
    switch (activePreprocessor) {
      case "missing-data":
        return <MissingDataConfig />;
      case "scaling":
        return <ScalingConfig />;
      case "encoding":
        return <EncodingConfig />;
      case "feature-selection":
        return <FeatureSelectionConfig />;
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

            return (
              <button
                key={preprocessor.id}
                type="button"
                onClick={() => setActivePreprocessor(preprocessor.id)}
                className={cn(
                  "card-hover-fade w-[100px] h-[100px] border-2 flex items-center justify-center relative",
                  "text-white text-[18px] sm:text-[20px] font-display text-center leading-tight",
                  "transition-all duration-300 cursor-pointer whitespace-pre-line",
                  isActive
                    ? "bg-[#006b4c] border-[#00a878] ring-2 ring-white ring-offset-2 ring-offset-[#181818]"
                    : isConfigured
                      ? "bg-[#006b4c] border-[#00a878]"
                      : "bg-[#121212] border-[#363636]",
                )}
              >
                {preprocessor.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="shrink-0">
        {activePreprocessor && (
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
