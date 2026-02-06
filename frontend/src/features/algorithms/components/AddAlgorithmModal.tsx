import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import {
  useAlgorithmsStepStore,
  SKLEARN_CLASS_MODULES,
} from "@/features/project/stores/useAlgorithmsStepStore";
import { usePendingChangesStore } from "@/shared/stores/usePendingChangesStore";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { STYLES } from "@/shared/constants/colors";
import type {
  AlgorithmCatalogItem,
  HyperparameterValue,
  HyperparameterValues,
  HyperparameterSearchSpace,
  HyperparameterArrayValue,
} from "../types";
import {
  getDefaultHyperparameters,
  validateHyperparameters,
} from "../utils/hyperparameters";
import { HyperparameterForm } from "./HyperparameterForm";
import { SearchSpaceForm } from "./SearchSpaceForm";

export type AddAlgorithmMode = "wizard" | "standalone";

type TabType = "custom" | "search";

interface AddAlgorithmModalProps {
  open: boolean;
  onClose: () => void;
  algorithm: AlgorithmCatalogItem | null;
  mode?: AddAlgorithmMode;
}

export function AddAlgorithmModal({
  open,
  onClose,
  algorithm,
  mode = "wizard",
}: AddAlgorithmModalProps) {
  // Use appropriate store based on mode
  const wizardStore = useAlgorithmsStepStore();
  const pendingStore = usePendingChangesStore();
  
  const addWrapper = mode === "wizard" 
    ? wizardStore.addWrapper 
    : pendingStore.addAlgorithmWrapper;
  const isNameUnique = mode === "wizard" 
    ? wizardStore.isNameUnique 
    : pendingStore.isAlgorithmNameUnique;

  const [name, setName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [activeTab, setActiveTab] = useState<TabType>("defaults");
  const [defaultParams, setDefaultParams] = useState<HyperparameterValues>({});
  const [searchSpace, setSearchSpace] = useState<HyperparameterSearchSpace>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open && algorithm) {
      setName(algorithm.shortName);
      setDisplayName(algorithm.name);
      setActiveTab("custom");
      setDefaultParams(getDefaultHyperparameters(algorithm.id));
      setSearchSpace({});
      setErrors({});
    }
  }, [open, algorithm]);

  const handleDefaultParamChange = (
    fieldName: string,
    value: HyperparameterValue,
  ) => {
    setDefaultParams((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
    if (errors[fieldName]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  const handleSearchSpaceChange = (
    fieldName: string,
    value: HyperparameterArrayValue,
  ) => {
    setSearchSpace((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  const handleAdd = () => {
    if (!algorithm) return;

    const newErrors: Record<string, string> = {};
    const trimmedName = name.trim();

    if (!trimmedName) {
      newErrors.name = "Name is required";
    } else if (!isNameUnique(trimmedName)) {
      newErrors.name = "An algorithm with this name already exists. Each algorithm must have a unique name.";
    }
    if (!displayName.trim()) {
      newErrors.displayName = "Display Name is required";
    }

    // Validate default params
    const validation = validateHyperparameters(algorithm.id, defaultParams);
    if (!validation.valid) {
      Object.assign(newErrors, validation.errors);
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Get the class module from the mapping
    const classModule = SKLEARN_CLASS_MODULES[algorithm.className] || "sklearn";

    // Check if user modified defaults (compare with catalog defaults)
    const catalogDefaults = getDefaultHyperparameters(algorithm.id);
    const useDefaults = JSON.stringify(defaultParams) === JSON.stringify(catalogDefaults);

    // Filter out empty search space entries
    const filteredSearchSpace: HyperparameterSearchSpace = {};
    for (const [key, val] of Object.entries(searchSpace)) {
      if (val && val.length > 0) {
        filteredSearchSpace[key] = val;
      }
    }

    const result = addWrapper({
      algorithmId: algorithm.id,
      name: trimmedName,
      displayName: displayName.trim(),
      className: algorithm.className,
      classModule,
      useDefaults,
      defaultParams,
      searchSpace: filteredSearchSpace,
    });

    if (!result.success) {
      setErrors({ name: result.error || "Failed to add algorithm" });
      return;
    }

    onClose();
  };

  if (!algorithm) return null;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent
        showCloseButton={false}
        className={`max-w-[95vw] sm:max-w-[550px] lg:max-w-[600px] border-2 ${STYLES.border} ${STYLES.bgCard} p-0 gap-0 max-h-[90vh] overflow-hidden flex flex-col`}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-[8px] top-[8px] sm:right-[10px] sm:top-[10px] size-[40px] sm:size-[48px] flex items-center justify-center text-white hover:opacity-80 transition-opacity z-10"
        >
          <X className="size-5 sm:size-6" />
        </button>

        <div className="px-3 sm:px-[18px] pt-[8px] pb-3 sm:pb-4 shrink-0">
          <DialogTitle className="h1-underline text-[24px] sm:text-[30px] lg:text-[36px] font-bold text-[#ebebeb] font-display">
            Add {algorithm.name}
          </DialogTitle>
        </div>

        <div className="px-3 sm:px-4 pb-3 sm:pb-4 space-y-3 sm:space-y-4 overflow-y-auto flex-1">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex-1">
              <Label className="text-white text-[18px] sm:text-[22px] lg:text-[24px] font-display mb-2 block">
                Name
              </Label>
              <Input
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) {
                    setErrors((prev) => {
                      const newErrors = { ...prev };
                      delete newErrors.name;
                      return newErrors;
                    });
                  }
                }}
                placeholder={`Ex. ${algorithm.shortName}`}
                className={`${STYLES.bgCardAlt} ${STYLES.border} text-white h-[36px] sm:h-[40px] text-[16px] sm:text-[18px] placeholder:text-white/60`}
              />
              {errors.name && (
                <p className="text-red-500 text-[12px] sm:text-[14px] mt-1">
                  {errors.name}
                </p>
              )}
            </div>
            <div className="flex-1">
              <Label className="text-white text-[18px] sm:text-[22px] lg:text-[24px] font-display mb-2 block">
                Display Name
              </Label>
              <Input
                value={displayName}
                onChange={(e) => {
                  setDisplayName(e.target.value);
                  if (errors.displayName) {
                    setErrors((prev) => {
                      const newErrors = { ...prev };
                      delete newErrors.displayName;
                      return newErrors;
                    });
                  }
                }}
                placeholder={`Ex. ${algorithm.name}`}
                className={`${STYLES.bgCardAlt} ${STYLES.border} text-white h-[36px] sm:h-[40px] text-[16px] sm:text-[18px] placeholder:text-white/60`}
              />
              {errors.displayName && (
                <p className="text-red-500 text-[12px] sm:text-[14px] mt-1">
                  {errors.displayName}
                </p>
              )}
            </div>
          </div>

          <div className="h-[1px] bg-white/40" />

          {/* Tab buttons */}
          <div className="flex items-center gap-1 sm:gap-2 border border-[#404040] p-1 sm:p-2">
            <button
              type="button"
              onClick={() => setActiveTab("custom")}
              className={cn(
                "flex-1 h-[32px] sm:h-[35px] lg:h-[38px] flex items-center justify-center text-[12px] sm:text-[14px] lg:text-[16px] font-display text-white transition-colors shrink-0 px-2",
                activeTab === "custom"
                  ? `${STYLES.bgDark} ring-2 ring-white ring-offset-1 sm:ring-offset-2 ${STYLES.ringOffset}`
                  : STYLES.bgCardAlt,
              )}
            >
              Default Values
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("search")}
              className={cn(
                "flex-1 h-[32px] sm:h-[35px] lg:h-[38px] flex items-center justify-center text-[12px] sm:text-[14px] lg:text-[16px] font-display text-white transition-colors shrink-0 px-2",
                activeTab === "search"
                  ? `${STYLES.bgDark} ring-2 ring-white ring-offset-1 sm:ring-offset-2 ${STYLES.ringOffset}`
                  : STYLES.bgCardAlt,
              )}
            >
              Hyperparameters
            </button>
          </div>

          {/* Custom defaults tab - editable single values */}
          {activeTab === "custom" && (
            <div className="pt-2 sm:pt-3">
              <p className="text-white/60 text-[12px] sm:text-sm font-display mb-3">
                Set custom default values for the algorithm:
              </p>
              {algorithm.hyperparameters.length > 0 ? (
                <HyperparameterForm
                  fields={algorithm.hyperparameters}
                  values={defaultParams}
                  onChange={handleDefaultParamChange}
                  errors={errors}
                />
              ) : (
                <p className="text-white/60 text-sm font-display">
                  This algorithm has no configurable hyperparameters.
                </p>
              )}
            </div>
          )}

          {/* Hyperparameters tab - arrays of values for tuning */}
          {activeTab === "search" && (
            <div className="pt-2 sm:pt-3">
              <p className="text-white/60 text-[12px] sm:text-sm font-display mb-3">
                Define the hyperparameter search space. Select multiple values for each parameter:
              </p>
              {algorithm.hyperparameters.length > 0 ? (
                <SearchSpaceForm
                  fields={algorithm.hyperparameters}
                  values={searchSpace}
                  onChange={handleSearchSpaceChange}
                  errors={errors}
                />
              ) : (
                <p className="text-white/60 text-sm font-display">
                  This algorithm has no configurable hyperparameters.
                </p>
              )}
            </div>
          )}
        </div>

        <div className="px-3 sm:px-4 pb-3 sm:pb-4 flex justify-end shrink-0 border-t border-[#404040] pt-3">
          <Button
            onClick={handleAdd}
            className={`btn-add-hover ${STYLES.bgPrimary} text-white h-[42px] sm:h-[50px] px-6 sm:px-8 text-[20px] sm:text-[24px] lg:text-[28px] font-display border ${STYLES.borderSecondary}`}
          >
            Add
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
