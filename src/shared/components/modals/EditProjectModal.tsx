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
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { useProjectModalStore } from "@/shared/stores/useProjectModalStore";
import { useProjectStore } from "@/shared/stores/useProjectStore";
import { DeleteProjectDialog } from "./DeleteProjectDialog";

export function EditProjectModal() {
  const navigate = useNavigate();
  const { projectDescription, projectPath, setProjectInfo } = useProjectStore();
  const { editModal, closeEditModal, openDeleteModal } = useProjectModalStore();

  const [localPath, setLocalPath] = useState(projectPath);
  const [localDescription, setLocalDescription] =
    useState(projectDescription);

  useEffect(() => {
    if (editModal) {
      setLocalPath(projectPath);
      setLocalDescription(projectDescription);
    }
  }, [editModal, projectPath, projectDescription]);

  const handleSave = () => {
    setProjectInfo({ path: localPath, description: localDescription });
    closeEditModal();
    navigate("/project");
  };

  return (
    <>
      <Dialog
        open={editModal}
        onOpenChange={(open) => !open && closeEditModal()}
      >
        <DialogContent className="max-w-[95vw] sm:max-w-[90vw] md:max-w-[600px] lg:max-w-[700px] xl:max-w-[800px] 2xl:max-w-[900px] border-[#404040] border-[2px] bg-[#181818] p-4 sm:p-6 md:p-8 lg:p-10">
          <DialogHeader className="mb-4 sm:mb-6 md:mb-8">
            <DialogTitle className="text-xl sm:text-2xl md:text-3xl lg:text-[36px] font-bold text-[#ebebeb] font-display text-left relative inline-block w-fit">
              Edit Project
              <div className="absolute -bottom-1 sm:-bottom-2 left-0 w-full h-[2px] bg-white opacity-80" />
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 sm:space-y-4 md:space-y-6 lg:space-y-8">
            <div className="space-y-1 sm:space-y-2 md:space-y-3">
              <Label className="text-white text-base sm:text-lg md:text-xl lg:text-[28px] font-normal font-display">
                Project Path
              </Label>
              <Input
                value={localPath}
                onChange={(e) => setLocalPath(e.target.value)}
                placeholder="path/to/project"
                className="bg-[#282828] border-[#404040] text-white text-sm sm:text-base md:text-lg lg:text-[18px] h-9 sm:h-10 md:h-11 lg:h-[40px] placeholder:text-white/60"
              />
            </div>

            <div className="space-y-1 sm:space-y-2 md:space-y-3">
              <Label className="text-white text-base sm:text-lg md:text-xl lg:text-[28px] font-normal font-display">
                Description
              </Label>
              <Textarea
                value={localDescription}
                onChange={(e) => setLocalDescription(e.target.value)}
                placeholder="This is a classification project training on ..."
                className="bg-[#282828] border-[#404040] text-white text-sm sm:text-base md:text-lg lg:text-[18px] min-h-[100px] sm:min-h-[140px] md:min-h-[180px] lg:min-h-[250px] resize-none placeholder:text-white/60"
              />
            </div>
          </div>

          <DialogFooter className="mt-6 sm:mt-8 md:mt-10 lg:mt-12 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-3 md:gap-4">
            <Button
              variant="outline"
              onClick={() => closeEditModal()}
              className="border-[#404040] bg-[#121212] text-white hover:text-white hover:bg-[#121212]/80 h-9 sm:h-10 md:h-11 lg:h-[50px] text-sm sm:text-base md:text-lg lg:text-[20px] order-2 sm:order-1"
            >
              Cancel
            </Button>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4 order-1 sm:order-2">
              <Button
                variant="outline"
                onClick={() => openDeleteModal()}
                className="border-[#404040] bg-[#121212] text-white hover:text-white hover:bg-[#121212]/80 h-9 sm:h-10 md:h-11 lg:h-[50px] text-sm sm:text-base md:text-lg lg:text-[20px] w-full sm:w-auto"
              >
                Delete
              </Button>
              <Button
                onClick={handleSave}
                className="bg-accent-500 hover:bg-accent-600 text-white h-9 sm:h-10 md:h-11 lg:h-[50px] text-sm sm:text-base md:text-lg lg:text-[20px] px-4 sm:px-6 md:px-8 w-full sm:w-auto"
              >
                Save Changes
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteProjectDialog />
    </>
  );
}
