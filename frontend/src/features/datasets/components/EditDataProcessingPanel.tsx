import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { HoverSelect } from "@/shared/components/ui/hover-select";
import type { PreprocessorType } from "@/types";
import { useDatasetsModalStore } from "../stores/useDatasetsModalStore";
import { useDatasetsStore } from "../stores/useDatasetsStore";

const PREPROCESSORS: { id: PreprocessorType; label: string }[] = [
  { id: "missing-data", label: "Missing\nData" },
  { id: "scaling", label: "Scaling" },
  { id: "encoding", label: "Encoding" },
  { id: "feature-selection", label: "Feature\nSelection" },
];

export function EditDataProcessingPanel() {
  const {
    dataManager,
    activePreprocessor,
    setActivePreprocessor,
    configuredPreprocessors,
    togglePreprocessorConfigured,
  } = useDatasetsStore();
  const { openEditDefaultSplitModal } = useDatasetsModalStore();

  const [missingDataConfig, setMissingDataConfig] = useState({
    strategy: "",
    imputeMethod: "",
    constantValue: "",
  });

  const [scalingConfig, setScalingConfig] = useState({
    method: "",
  });

  const [encodingConfig, setEncodingConfig] = useState({
    method: "",
    cutoffs: "",
  });

  const [featureSelectionConfig, setFeatureSelectionConfig] = useState({
    method: "",
    numberOfFeatures: "",
    estimator: "",
    crossValidation: "",
  });

  const handleAddConfig = () => {
    if (activePreprocessor) {
      togglePreprocessorConfigured(activePreprocessor);
    }
  };

  const renderConfigForm = () => {
    switch (activePreprocessor) {
      case "missing-data":
        return (
          <div className="space-y-4">
            <div>
              <Label className="text-white text-[20px] font-display mb-2 block">
                Strategy
              </Label>
              <HoverSelect
                value={missingDataConfig.strategy}
                onValueChange={(value) =>
                  setMissingDataConfig((prev) => ({ ...prev, strategy: value }))
                }
                placeholder="Select"
                options={[
                  { value: "drop", label: "Drop" },
                  { value: "impute", label: "Impute" },
                ]}
                triggerClassName="bg-[#282828] border-[#404040] text-white h-[40px] text-[18px]"
              />
            </div>

            <div>
              <Label className="text-white text-[20px] font-display mb-2 block">
                Impute Method
              </Label>
              <HoverSelect
                value={missingDataConfig.imputeMethod}
                onValueChange={(value) =>
                  setMissingDataConfig((prev) => ({
                    ...prev,
                    imputeMethod: value,
                  }))
                }
                placeholder="Select"
                options={[
                  { value: "mean", label: "Mean" },
                  { value: "median", label: "Median" },
                  { value: "mode", label: "Mode" },
                  { value: "constant", label: "Constant" },
                ]}
                triggerClassName="bg-[#282828] border-[#404040] text-white h-[40px] text-[18px]"
              />
            </div>

            <div>
              <Label className="text-white text-[20px] font-display mb-2 block">
                Constant Value
              </Label>
              <Input
                value={missingDataConfig.constantValue}
                onChange={(e) =>
                  setMissingDataConfig((prev) => ({
                    ...prev,
                    constantValue: e.target.value,
                  }))
                }
                placeholder="ID"
                className="bg-[#282828] border-[#404040] text-white h-[40px] text-[18px]"
              />
            </div>

            <p className="text-white/60 text-[16px] font-display">
              Handle missing values by dropping or imputing value.
            </p>

            <div className="flex justify-end">
              <Button
                onClick={handleAddConfig}
                className="btn-add-hover bg-[#006b4c] text-white h-[50px] px-8 text-[20px] font-display"
              >
                Add
              </Button>
            </div>
          </div>
        );

      case "scaling":
        return (
          <div className="space-y-4">
            <div>
              <Label className="text-white text-[20px] font-display mb-2 block">
                Method
              </Label>
              <HoverSelect
                value={scalingConfig.method}
                onValueChange={(value) =>
                  setScalingConfig((prev) => ({ ...prev, method: value }))
                }
                placeholder="Select"
                options={[
                  { value: "standard", label: "Standard" },
                  { value: "minmax", label: "MinMax" },
                  { value: "robust", label: "Robust" },
                  { value: "normalizer", label: "Normalizer" },
                ]}
                triggerClassName="bg-[#282828] border-[#404040] text-white h-[40px] text-[18px]"
              />
            </div>

            <p className="text-white/60 text-[16px] font-display">
              Apply scaling to input features.
            </p>

            <div className="flex justify-end">
              <Button
                onClick={handleAddConfig}
                className="btn-add-hover bg-[#006b4c] text-white h-[50px] px-8 text-[20px] font-display"
              >
                Add
              </Button>
            </div>
          </div>
        );

      case "encoding":
        return (
          <div className="space-y-4">
            <div>
              <Label className="text-white text-[20px] font-display mb-2 block">
                Method
              </Label>
              <HoverSelect
                value={encodingConfig.method}
                onValueChange={(value) =>
                  setEncodingConfig((prev) => ({ ...prev, method: value }))
                }
                placeholder="Select"
                options={[
                  { value: "onehot", label: "One-Hot" },
                  { value: "label", label: "Label" },
                  { value: "ordinal", label: "Ordinal" },
                  { value: "binary", label: "Binary" },
                ]}
                triggerClassName="bg-[#282828] border-[#404040] text-white h-[40px] text-[18px]"
              />
            </div>

            <div>
              <Label className="text-white text-[20px] font-display mb-2 block">
                Cutoffs
              </Label>
              <Input
                value={encodingConfig.cutoffs}
                onChange={(e) =>
                  setEncodingConfig((prev) => ({
                    ...prev,
                    cutoffs: e.target.value,
                  }))
                }
                placeholder="ID"
                className="bg-[#282828] border-[#404040] text-white h-[40px] text-[18px]"
              />
            </div>

            <p className="text-white/60 text-[16px] font-display">
              Encode categorical features.
            </p>

            <div className="flex justify-end">
              <Button
                onClick={handleAddConfig}
                className="btn-add-hover bg-[#006b4c] text-white h-[50px] px-8 text-[20px] font-display"
              >
                Add
              </Button>
            </div>
          </div>
        );

      case "feature-selection":
        return (
          <div className="space-y-4">
            <div>
              <Label className="text-white text-[20px] font-display mb-2 block">
                Method
              </Label>
              <HoverSelect
                value={featureSelectionConfig.method}
                onValueChange={(value) =>
                  setFeatureSelectionConfig((prev) => ({
                    ...prev,
                    method: value,
                  }))
                }
                placeholder="Select"
                options={[
                  { value: "variance", label: "Variance Threshold" },
                  { value: "univariate", label: "Univariate" },
                  { value: "recursive", label: "Recursive Feature Elimination" },
                  { value: "lasso", label: "Lasso" },
                ]}
                triggerClassName="bg-[#282828] border-[#404040] text-white h-[40px] text-[18px]"
              />
            </div>

            <div>
              <Label className="text-white text-[20px] font-display mb-2 block">
                Number of Features
              </Label>
              <Input
                value={featureSelectionConfig.numberOfFeatures}
                onChange={(e) =>
                  setFeatureSelectionConfig((prev) => ({
                    ...prev,
                    numberOfFeatures: e.target.value,
                  }))
                }
                placeholder="ID"
                className="bg-[#282828] border-[#404040] text-white h-[40px] text-[18px]"
              />
            </div>

            <div>
              <Label className="text-white text-[20px] font-display mb-2 block">
                Estimator
              </Label>
              <HoverSelect
                value={featureSelectionConfig.estimator}
                onValueChange={(value) =>
                  setFeatureSelectionConfig((prev) => ({
                    ...prev,
                    estimator: value,
                  }))
                }
                placeholder="Select"
                options={[
                  { value: "random-forest", label: "Random Forest" },
                  { value: "logistic", label: "Logistic Regression" },
                  { value: "svm", label: "SVM" },
                ]}
                triggerClassName="bg-[#282828] border-[#404040] text-white h-[40px] text-[18px]"
              />
            </div>

            <div>
              <Label className="text-white text-[20px] font-display mb-2 block">
                Cross Validation
              </Label>
              <Input
                value={featureSelectionConfig.crossValidation}
                onChange={(e) =>
                  setFeatureSelectionConfig((prev) => ({
                    ...prev,
                    crossValidation: e.target.value,
                  }))
                }
                placeholder="5"
                className="bg-[#282828] border-[#404040] text-white h-[40px] text-[18px]"
              />
            </div>

            <p className="text-white/60 text-[16px] font-display">
              Select features before model training.
            </p>

            <div className="flex justify-end">
              <Button
                onClick={handleAddConfig}
                className="btn-add-hover bg-[#006b4c] text-white h-[50px] px-8 text-[20px] font-display"
              >
                Add
              </Button>
            </div>
          </div>
        );

      default:
        return (
          <div className="flex items-center justify-center h-full">
            <p className="text-white text-[20px] font-display text-center">
              Select a preprocessor to configure
            </p>
          </div>
        );
    }
  };

  return (
    <div className="bg-[#282828] border-2 border-[#363636] h-full flex flex-col overflow-hidden">
      {/* Title */}
      <div className="px-6 pt-6 pb-4 border-b border-[#363636]">
        <h2 className="text-white text-[24px] md:text-[28px] font-display text-center">
          Edit Data Processing
        </h2>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Data Manager Section */}
        <div className="space-y-4">
          <h3 className="text-white text-[20px] font-display">Data Manager</h3>

          {/* Test Size */}
          <div>
            <Label className="text-white text-[20px] font-display mb-2 block">
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
            <Label className="text-white text-[20px] font-display mb-2 block">
              Group Column
            </Label>
            <Input
              value={dataManager.groupColumn || "-"}
              readOnly
              className="bg-[#121212] border-[#363636] text-white h-[40px] text-[18px]"
            />
          </div>

          {/* Split Method */}
          <div>
            <Label className="text-white text-[20px] font-display mb-2 block">
              Split Method
            </Label>
            <HoverSelect
              value={dataManager.splitMethod}
              onValueChange={() => {}}
              disabled
              options={[
                { value: "random", label: "Random" },
                { value: "shuffle", label: "Shuffle" },
                { value: "stratified", label: "Stratified" },
              ]}
              triggerClassName="bg-[#121212] border-[#363636] text-white h-[40px] text-[18px]"
            />
          </div>

          {/* Number of Splits */}
          <div>
            <Label className="text-white text-[20px] font-display mb-2 block">
              Number of Splits
            </Label>
            <Input
              value={dataManager.numberOfSplits}
              readOnly
              className="bg-[#121212] border-[#363636] text-white h-[40px] text-[18px]"
            />
          </div>

          {/* Stratified */}
          <div>
            <Label className="text-white text-[20px] font-display mb-2 block">
              Stratified
            </Label>
            <Input
              value={dataManager.stratified ? "Yes" : "No"}
              readOnly
              className="bg-[#121212] border-[#363636] text-white h-[40px] text-[18px]"
            />
          </div>

          {/* Random State */}
          <div>
            <Label className="text-white text-[20px] font-display mb-2 block">
              Random State
            </Label>
            <Input
              value={dataManager.randomState}
              readOnly
              className="bg-[#121212] border-[#363636] text-white h-[40px] text-[18px]"
            />
          </div>

          {/* Edit Defaults Button */}
          <div className="flex justify-center pt-2">
            <Button
              variant="outline"
              onClick={openEditDefaultSplitModal}
              className="bg-[#121212] hover:bg-[#282828] border-[#363636] text-white h-[50px] w-[225px] text-[20px] font-display transition-colors"
            >
              Edit Defaults
            </Button>
          </div>
        </div>

        {/* Preprocessors Section */}
        <div className="space-y-4">
          <h3 className="text-white text-[20px] font-display text-center">
            Preprocessors
          </h3>

          {/* Preprocessor Buttons */}
          <div className="flex gap-3 flex-wrap justify-center">
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
                    "w-[100px] h-[100px] border-2 flex items-center justify-center relative",
                    "text-white text-[16px] sm:text-[18px] font-display text-center leading-tight",
                    "transition-all duration-300 cursor-pointer whitespace-pre-line",
                    isActive
                      ? "bg-[#006b4c] border-[#00a878] ring-2 ring-white ring-offset-2 ring-offset-[#282828]"
                      : isConfigured
                        ? "bg-[#006b4c] border-[#00a878]"
                        : "card-hover-fade bg-[#121212] border-[#363636]",
                  )}
                >
                  {preprocessor.label}
                </button>
              );
            })}
          </div>

          {activePreprocessor && (
            <p className="text-white/80 text-sm font-display">
              Configuring:{" "}
              <span className="font-semibold text-white">
                {PREPROCESSORS.find(
                  (p) => p.id === activePreprocessor,
                )?.label.replace("\n", " ") ?? activePreprocessor}
              </span>
            </p>
          )}
          <div className="bg-[#121212] border border-[#363636] p-4 h-[360px] overflow-y-auto">
            {renderConfigForm()}
          </div>
        </div>
      </div>
    </div>
  );
}
