import { useState } from "react";
import { ProjectHeader } from "@/shared/components/layout/ProjectHeader";
import { FileList } from "./components/FileList";
import { FileViewer } from "./components/FileViewer";
import { SyncFilesDialog } from "./components/SyncFilesDialog";
import { useFileStore } from "./stores/useFileStore";

export default function FilesPage() {
  const [showSyncDialog, setShowSyncDialog] = useState(false);
  const { syncFiles } = useFileStore();

  const handleSyncConfirm = async () => {
    setShowSyncDialog(false);
    await syncFiles();
  };

  return (
    <div
      className="flex flex-col h-screen min-h-screen overflow-x-hidden pb-20 md:pb-0"
      style={{
        background: "linear-gradient(-0.11deg, #121212 39.262%, #282828 107%)",
      }}
    >
      <ProjectHeader />

      {/* Two-panel layout */}
      <div className="flex-1 flex flex-col lg:flex-row px-4 sm:px-6 md:px-8 lg:px-[16px] pb-4 sm:pb-6 md:pb-8 overflow-hidden">
        <div className="h-[300px] sm:h-[350px] md:h-[400px] lg:h-full w-full lg:w-[260px] xl:w-[300px] 2xl:w-[320px] flex-shrink-0">
          <FileList />
        </div>

        {/* Vertical divider */}
        <div className="hidden lg:flex items-stretch justify-center flex-shrink-0 mx-4 xl:mx-[32px]">
          <div className="w-[2px] bg-white" />
        </div>

        {/* Mobile gap */}
        <div className="h-4 sm:h-5 md:h-6 lg:hidden" />

        <div className="flex-1 min-h-[400px] lg:min-h-0 overflow-hidden">
          <FileViewer onSyncClick={() => setShowSyncDialog(true)} />
        </div>
      </div>

      {/* Sync confirmation dialog */}
      <SyncFilesDialog
        open={showSyncDialog}
        onOpenChange={setShowSyncDialog}
        onConfirm={handleSyncConfirm}
      />
    </div>
  );
}
