import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { STYLES } from "@/shared/constants/colors";
import { useProjectModalStore } from "@/shared/stores/useProjectModalStore";
import { useProjectStore } from "@/shared/stores/useProjectStore";

export function DeleteProjectDialog() {
  const navigate = useNavigate();
  const { projectName, deleteProject } = useProjectStore();
  const { deleteModal, closeDeleteModal, closeAllModals } =
    useProjectModalStore();
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    if (!deleteModal) {
      setConfirmText("");
      setDeleteError(null);
    }
  }, [deleteModal]);

  const isValid = confirmText === `delete ${projectName}`;

  const handleDelete = async () => {
    if (!isValid) return;

    setIsDeleting(true);
    setDeleteError(null);

    try {
      await deleteProject();
      closeAllModals();
      navigate("/project");
    } catch (err) {
      setDeleteError(
        err instanceof Error ? err.message : "Failed to delete project"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog
      open={deleteModal}
      onOpenChange={(open) => !open && closeDeleteModal()}
    >
      <DialogContent
        showCloseButton={false}
        className={`max-w-[90vw] sm:max-w-[500px] md:max-w-[600px] lg:max-w-[700px] border-[2px] ${STYLES.border} ${STYLES.bgCard} p-6 sm:p-8 md:p-10 z-[70]`}
      >
        <DialogHeader className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
          <DialogTitle className="text-xl sm:text-2xl md:text-3xl font-bold text-white leading-tight font-display">
            Once you delete a project it's gone forever...
          </DialogTitle>
          <p className="text-white/70 text-base sm:text-lg md:text-xl">
            Make sure you are certain before you continue.
          </p>
        </DialogHeader>

        <div className="space-y-3 sm:space-y-4">
          <div className="space-y-2 sm:space-y-3">
            <label
              htmlFor="delete-confirm-input"
              className="text-white/60 text-sm sm:text-base"
            >
              To confirm type{" "}
              <span className="text-white font-medium">
                "delete {projectName}"
              </span>
            </label>
            <Input
              id="delete-confirm-input"
              placeholder="delete..."
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              disabled={isDeleting}
              className={`${STYLES.bgCardAlt} ${STYLES.border} text-white h-10 sm:h-12 text-base sm:text-lg placeholder:text-white/40`}
            />
          </div>

          {deleteError && (
            <div className="p-3 bg-red-500/20 border border-red-500/50">
              <p className="text-red-400 text-sm font-display">{deleteError}</p>
            </div>
          )}
        </div>

        <DialogFooter className="mt-8 sm:mt-10 md:mt-12 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between w-full gap-3 sm:gap-4">
          <Button
            variant="outline"
            onClick={handleDelete}
            disabled={!isValid || isDeleting}
            className={`btn-delete-hover border ${STYLES.border} ${STYLES.bgDark} text-white h-10 sm:h-12 md:h-[50px] text-base sm:text-lg disabled:opacity-30 disabled:cursor-not-allowed w-full sm:flex-1`}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
          <Button
            variant="outline"
            onClick={() => closeDeleteModal()}
            disabled={isDeleting}
            className={`btn-cancel-hover border ${STYLES.border} ${STYLES.bgDark} text-white h-10 sm:h-12 md:h-[50px] text-base sm:text-lg w-full sm:flex-1`}
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
