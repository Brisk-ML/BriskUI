import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";

interface SyncFilesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function SyncFilesDialog({
  open,
  onOpenChange,
  onConfirm,
}: SyncFilesDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90vw] sm:max-w-[700px] lg:max-w-[900px] border-[#404040] border-2 bg-[#121212] p-6 sm:p-8 md:p-10 rounded-none">
        <DialogHeader className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
          <DialogTitle className="text-2xl sm:text-3xl lg:text-[36px] font-bold text-white leading-tight font-['Montserrat']">
            This will overwrite any existing files...
          </DialogTitle>
          <p className="text-white text-lg sm:text-xl lg:text-[28px] font-['Montserrat'] leading-normal">
            Any existing content will be lost. Are you sure you want to
            continue?
          </p>
        </DialogHeader>

        <DialogFooter className="mt-8 sm:mt-10 md:mt-12 flex flex-col sm:flex-row items-stretch sm:items-center sm:justify-between w-full gap-3">
          <Button
            onClick={onConfirm}
            className="bg-[#121212] hover:bg-[#282828] text-white border border-[#404040] h-[44px] sm:h-[48px] lg:h-[50px] text-lg sm:text-xl lg:text-[28px] font-normal font-['Montserrat'] w-full sm:w-[140px] lg:w-[150px] rounded-none order-2 sm:order-1"
          >
            Overwrite
          </Button>
          <Button
            onClick={() => onOpenChange(false)}
            className="bg-[#006b4c] hover:bg-[#005a3f] text-white h-[44px] sm:h-[48px] lg:h-[50px] text-lg sm:text-xl lg:text-[28px] font-normal font-['Montserrat'] w-full sm:w-[200px] lg:w-[225px] rounded-none order-1 sm:order-2"
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
