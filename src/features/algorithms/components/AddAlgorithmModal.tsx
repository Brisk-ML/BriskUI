import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { STYLES } from "@/shared/constants/colors";
import { useAlgorithmWrapperStore } from "../stores/useAlgorithmWrapperStore";
import type {
  AlgorithmCatalogItem,
  HyperparameterValue,
  HyperparameterValues,
} from "../types";
import {
  getDefaultHyperparameters,
  validateHyperparameters,
} from "../utils/hyperparameters";
import { HyperparameterForm } from "./HyperparameterForm";

interface AddAlgorithmModalProps {
  open: boolean;
  onClose: () => void;
  algorithm: AlgorithmCatalogItem | null;
}

export function AddAlgorithmModal({
  open,
  onClose,
  algorithm,
}: AddAlgorithmModalProps) {
  const { addWrapper } = useAlgorithmWrapperStore();

  const [name, setName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [useDefaults, setUseDefaults] = useState(true);
  const [hyperparameters, setHyperparameters] = useState<HyperparameterValues>(
    {},
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open && algorithm) {
      setName(algorithm.shortName);
      setDisplayName(algorithm.name);
      setUseDefaults(true);
      setHyperparameters(getDefaultHyperparameters(algorithm.id));
      setErrors({});
    }
  }, [open, algorithm]);

  const handleHyperparameterChange = (
    fieldName: string,
    value: HyperparameterValue,
  ) => {
    setHyperparameters((prev) => ({
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

  const handleAdd = () => {
    if (!algorithm) return;

    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = "Name is required";
    }
    if (!displayName.trim()) {
      newErrors.displayName = "Display Name is required";
    }

    if (!useDefaults) {
      const validation = validateHyperparameters(algorithm.id, hyperparameters);
      if (!validation.valid) {
        Object.assign(newErrors, validation.errors);
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    addWrapper({
      algorithmId: algorithm.id,
      name: name.trim(),
      displayName: displayName.trim(),
      className: algorithm.className,
      useDefaults,
      hyperparameters: useDefaults
        ? getDefaultHyperparameters(algorithm.id)
        : hyperparameters,
      hasHyperparameterGrid: !useDefaults,
    });

    onClose();
  };

  if (!algorithm) return null;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent
        showCloseButton={false}
        className={`max-w-[95vw] sm:max-w-[500px] lg:max-w-[550px] border-2 ${STYLES.border} ${STYLES.bgCard} p-0 gap-0`}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-[8px] top-[8px] sm:right-[10px] sm:top-[10px] size-[40px] sm:size-[48px] flex items-center justify-center text-white hover:opacity-80 transition-opacity z-10"
        >
          <X className="size-5 sm:size-6" />
        </button>

        <div className="px-3 sm:px-[18px] pt-[8px] pb-3 sm:pb-4">
          <DialogTitle className="h1-underline text-[24px] sm:text-[30px] lg:text-[36px] font-bold text-[#ebebeb] font-display">
            Add {algorithm.name}
          </DialogTitle>
        </div>

        <div className="px-3 sm:px-4 pb-3 sm:pb-4 space-y-3 sm:space-y-4">
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

          <div className="flex items-center gap-1 sm:gap-2 border border-[#404040] p-1 sm:p-2">
            <button
              type="button"
              onClick={() => setUseDefaults(true)}
              className={cn(
                "flex-1 h-[32px] sm:h-[35px] lg:h-[38px] flex items-center justify-center text-[13px] sm:text-[16px] lg:text-[18px] font-display text-white transition-colors shrink-0 px-2",
                useDefaults
                  ? `${STYLES.bgDark} ring-2 ring-white ring-offset-1 sm:ring-offset-2 ${STYLES.ringOffset}`
                  : STYLES.bgCardAlt,
              )}
            >
              Defaults
            </button>
            <button
              type="button"
              onClick={() => setUseDefaults(false)}
              className={cn(
                "flex-[2] h-[32px] sm:h-[35px] lg:h-[38px] flex items-center justify-center text-[13px] sm:text-[16px] lg:text-[18px] font-display text-white transition-colors shrink-0 px-2",
                !useDefaults
                  ? `${STYLES.bgDark} ring-2 ring-white ring-offset-1 sm:ring-offset-2 ${STYLES.ringOffset}`
                  : STYLES.bgCardAlt,
              )}
            >
              Hyperparameters
            </button>
          </div>

          {useDefaults && algorithm.hyperparameters.length > 0 && (
            <div className="pt-2 sm:pt-3">
              <p className="text-white/60 text-[12px] sm:text-sm font-display mb-2">
                Default values:
              </p>
              <div className="bg-[#121212] border border-[#404040] p-2 sm:p-3 rounded space-y-1.5 max-h-[120px] sm:max-h-[140px] lg:max-h-[160px] overflow-y-auto text-[12px] sm:text-sm">
                {algorithm.hyperparameters.map((field) => {
                  const def =
                    getDefaultHyperparameters(algorithm.id)[field.name] ??
                    field.defaultValue;
                  const display =
                    def !== null && def !== undefined && def !== ""
                      ? typeof def === "boolean"
                        ? def
                          ? "True"
                          : "False"
                        : String(def)
                      : (field.placeholder ?? "—");
                  return (
                    <div
                      key={field.name}
                      className="flex flex-nowrap justify-between items-center gap-4 text-[12px] sm:text-sm font-display"
                    >
                      <span className="text-white/80 capitalize whitespace-nowrap shrink-0">
                        {field.label.replace(/_/g, " ")}
                      </span>
                      <span className="text-white truncate text-right min-w-0">
                        {display}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {!useDefaults && (
            <div className="pt-2 sm:pt-3">
              <HyperparameterForm
                fields={algorithm.hyperparameters}
                values={hyperparameters}
                onChange={handleHyperparameterChange}
                errors={errors}
              />
            </div>
          )}
        </div>

        <div className="px-3 sm:px-4 pb-3 sm:pb-4 flex justify-end">
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
