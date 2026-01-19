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
  const [hyperparameters, setHyperparameters] =
    useState<HyperparameterValues>({});
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
        className="max-w-[95vw] sm:max-w-[500px] lg:max-w-[550px] border-[#404040] border-2 bg-[#181818] p-0 gap-0"
      >
        {/* Close Button - Responsive size */}
        <button
          onClick={onClose}
          className="absolute right-[8px] top-[8px] sm:right-[10px] sm:top-[10px] size-[40px] sm:size-[48px] flex items-center justify-center text-white hover:opacity-80 transition-opacity z-10"
        >
          <X className="size-5 sm:size-6" />
        </button>

        {/* Header - Responsive text */}
        <div className="px-3 sm:px-[18px] pt-[8px] pb-3 sm:pb-4">
          <DialogTitle className="text-[24px] sm:text-[30px] lg:text-[36px] font-bold text-[#ebebeb] font-['Montserrat'] relative inline-block">
            Add {algorithm.name}
            <div className="absolute -bottom-1 left-0 w-full h-[2px] bg-white" />
          </DialogTitle>
        </div>

        {/* Form Content - Responsive spacing and sizing */}
        <div className="px-3 sm:px-4 pb-3 sm:pb-4 space-y-3 sm:space-y-4">
          {/* Name and Display Name - Stack on mobile, side-by-side on larger screens */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex-1">
              <Label className="text-white text-[18px] sm:text-[22px] lg:text-[24px] font-['Montserrat'] mb-2 block">
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
                className="bg-[#282828] border-[#404040] text-white h-[36px] sm:h-[40px] text-[16px] sm:text-[18px] placeholder:text-white/60"
              />
              {errors.name && (
                <p className="text-red-500 text-[12px] sm:text-[14px] mt-1">
                  {errors.name}
                </p>
              )}
            </div>
            <div className="flex-1">
              <Label className="text-white text-[18px] sm:text-[22px] lg:text-[24px] font-['Montserrat'] mb-2 block">
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
                className="bg-[#282828] border-[#404040] text-white h-[36px] sm:h-[40px] text-[16px] sm:text-[18px] placeholder:text-white/60"
              />
              {errors.displayName && (
                <p className="text-red-500 text-[12px] sm:text-[14px] mt-1">
                  {errors.displayName}
                </p>
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="h-[1px] bg-white/40" />

          {/* Defaults / Hyperparameters Toggle - Responsive text */}
          <div className="flex items-center border border-[#404040]">
            <button
              onClick={() => setUseDefaults(true)}
              className={cn(
                "flex-1 h-[32px] sm:h-[35px] flex items-center justify-center text-[14px] sm:text-[16px] lg:text-[18px] font-['Montserrat'] text-white transition-colors",
                useDefaults ? "bg-[#121212]" : "bg-[#282828]",
              )}
            >
              Defaults
            </button>
            <button
              onClick={() => setUseDefaults(false)}
              className={cn(
                "flex-[2] h-[32px] sm:h-[35px] flex items-center justify-center text-[14px] sm:text-[16px] lg:text-[18px] font-['Montserrat'] text-white transition-colors",
                !useDefaults ? "bg-[#121212]" : "bg-[#282828]",
              )}
            >
              Hyperparameters
            </button>
          </div>

          {/* Hyperparameter Form (only shown when not using defaults) */}
          {!useDefaults && (
            <div className="pt-2">
              <HyperparameterForm
                fields={algorithm.hyperparameters}
                values={hyperparameters}
                onChange={handleHyperparameterChange}
                errors={errors}
              />
            </div>
          )}
        </div>

        {/* Footer - Responsive button */}
        <div className="px-3 sm:px-4 pb-3 sm:pb-4 flex justify-end">
          <Button
            onClick={handleAdd}
            className="bg-[#006b4c] hover:bg-[#005a3f] text-white h-[42px] sm:h-[50px] px-6 sm:px-8 text-[20px] sm:text-[24px] lg:text-[28px] font-['Montserrat'] border border-[#363636]"
          >
            Add
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
