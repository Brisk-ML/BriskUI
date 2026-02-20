import { X } from "lucide-react";
import type { WizardAlgorithmWrapper } from "@/features/project/stores/useAlgorithmsStepStore";
import type { AlgorithmWrapperState } from "@/shared/stores/usePendingChangesStore";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { STYLES } from "@/shared/constants/colors";

// Union type for wrapper that works with both stores
type AlgorithmWrapper = WizardAlgorithmWrapper | AlgorithmWrapperState;

interface ViewAlgorithmModalProps {
  open: boolean;
  onClose: () => void;
  wrapper: AlgorithmWrapper | null;
  onRemove?: (id: string) => void;
}

function formatHyperparameterValue(value: unknown): string {
  if (value === null || value === undefined) return "-";
  if (typeof value === "boolean") return value ? "True" : "False";
  return String(value);
}

function formatSearchSpaceValue(values: unknown[]): string {
  if (!values || values.length === 0) return "-";
  return values.map((v) => {
    if (typeof v === "boolean") return v ? "True" : "False";
    return String(v);
  }).join(", ");
}

export function ViewAlgorithmModal({
  open,
  onClose,
  wrapper,
  onRemove,
}: ViewAlgorithmModalProps) {
  if (!wrapper) return null;

  const hyperparameterEntries = Object.entries(wrapper.defaultParams);
  const searchSpaceEntries = Object.entries(wrapper.searchSpace || {}).filter(
    ([, values]) => values && values.length > 0
  );

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent
        showCloseButton={false}
        className={`max-w-[95vw] sm:max-w-[560px] lg:max-w-[620px] xl:max-w-[680px] min-w-[320px] border-2 ${STYLES.border} ${STYLES.bgCard} p-0 gap-0`}
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
            {wrapper.displayName}
          </DialogTitle>
        </div>

        <div className="px-3 sm:px-4 pb-3 sm:pb-4 space-y-3 sm:space-y-4">
          <div className="space-y-2">
            <div>
              <span className="text-white/60 text-xs sm:text-sm font-display">
                Name
              </span>
              <p className="text-white text-sm sm:text-base font-display">
                {wrapper.name}
              </p>
            </div>
            <div>
              <span className="text-white/60 text-xs sm:text-sm font-display">
                Class
              </span>
              <p className="text-white text-sm sm:text-base font-display">
                {wrapper.className}
              </p>
            </div>
            <div>
              <span className="text-white/60 text-xs sm:text-sm font-display">
                Module
              </span>
              <p className="text-white text-sm sm:text-base font-display">
                {wrapper.classModule}
              </p>
            </div>
            <div>
              <span className="text-white/60 text-xs sm:text-sm font-display">
                Custom Defaults
              </span>
              <p className="text-white text-sm sm:text-base font-display">
                {!wrapper.useDefaults ? "Yes" : "No"}
              </p>
            </div>
            <div>
              <span className="text-white/60 text-xs sm:text-sm font-display">
                Search Space Configured
              </span>
              <p className="text-white text-sm sm:text-base font-display">
                {searchSpaceEntries.length > 0 ? "Yes" : "No"}
              </p>
            </div>
          </div>

          {hyperparameterEntries.length > 0 && (
            <>
              <div className="h-[1px] bg-white/40" />
              <div>
                <span className="text-white/60 text-[12px] sm:text-sm font-display block mb-2">
                  Default Parameters
                </span>
                <div
                  className={`${STYLES.bgDark} border ${STYLES.border} p-3 sm:p-4 rounded space-y-2 sm:space-y-2.5 max-h-[150px] sm:max-h-[180px] overflow-y-auto`}
                >
                  <div className="flex flex-col gap-y-2 sm:gap-y-2.5">
                    {hyperparameterEntries.map(([key, value]) => (
                      <div
                        key={key}
                        className="flex flex-nowrap justify-between items-center gap-4"
                      >
                        <span className="text-white/80 capitalize text-[12px] sm:text-sm font-display whitespace-nowrap shrink-0">
                          {key.replace(/_/g, " ")}
                        </span>
                        <span className="text-white text-[12px] sm:text-sm font-display whitespace-nowrap text-right">
                          {formatHyperparameterValue(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {searchSpaceEntries.length > 0 && (
            <>
              <div className="h-[1px] bg-white/40" />
              <div>
                <span className="text-white/60 text-[12px] sm:text-sm font-display block mb-2">
                  Search Space
                </span>
                <div
                  className={`${STYLES.bgDark} border ${STYLES.border} p-3 sm:p-4 rounded space-y-2 sm:space-y-2.5 max-h-[150px] sm:max-h-[180px] overflow-y-auto`}
                >
                  <div className="flex flex-col gap-y-2 sm:gap-y-2.5">
                    {searchSpaceEntries.map(([key, values]) => (
                      <div
                        key={key}
                        className="flex flex-nowrap justify-between items-center gap-4"
                      >
                        <span className="text-white/80 capitalize text-[12px] sm:text-sm font-display whitespace-nowrap shrink-0">
                          {key.replace(/_/g, " ")}
                        </span>
                        <span className="text-white text-[12px] sm:text-sm font-display text-right">
                          [{formatSearchSpaceValue(values)}]
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="px-3 sm:px-4 pb-3 sm:pb-4 flex flex-col-reverse sm:flex-row justify-end items-stretch sm:items-center gap-2 sm:gap-3">
          {onRemove && (
            <Button
              variant="outline"
              onClick={() => {
                onRemove(wrapper.id);
                onClose();
              }}
              className={`btn-delete-hover border ${STYLES.border} ${STYLES.bgDark} text-white h-9 sm:h-10 md:h-11 px-4 sm:px-6 text-sm sm:text-base font-display w-full sm:w-auto`}
            >
              Remove
            </Button>
          )}
          <Button
            variant="outline"
            onClick={onClose}
            className={`btn-cancel-hover border ${STYLES.border} ${STYLES.bgDark} text-white h-9 sm:h-10 md:h-11 px-4 sm:px-6 text-sm sm:text-base font-display w-full sm:w-auto`}
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
