import { RefreshCw } from "lucide-react";
import { useState } from "react";
import { useFileStore } from "../stores/useFileStore";

interface FileViewerProps {
  onSyncClick: () => void;
}

export function FileViewer({ onSyncClick }: FileViewerProps) {
  const { selectedFile, previewData, isLoading, isSyncing } = useFileStore();
  const [copySuccess, setCopySuccess] = useState(false);

  const handleDownload = () => {
    if (!selectedFile || !previewData) return;

    const blob = new Blob([previewData.content as string], {
      type: selectedFile.mimeType,
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = selectedFile.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    if (!previewData) return;

    try {
      await navigator.clipboard.writeText(previewData.content as string);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  return (
    <div className="bg-[#181818] border-2 border-[#404040] h-full overflow-hidden relative">
      <button
        onClick={onSyncClick}
        disabled={isSyncing}
        type="button"
        className="absolute right-4 sm:right-6 lg:right-[28px] top-4 sm:top-6 lg:top-[39px] w-[160px] sm:w-[190px] lg:w-[225px] h-[42px] sm:h-[46px] lg:h-[50px] bg-[#282828] hover:bg-[#363636] disabled:opacity-50 border border-[#404040] text-white text-lg sm:text-xl lg:text-[28px] font-display flex items-center justify-center gap-2 transition-colors z-20"
      >
        {isSyncing ? (
          <>
            <RefreshCw
              size={18}
              className="sm:size-[20px] lg:size-[22px] animate-spin"
            />
            <span>Syncing...</span>
          </>
        ) : (
          <span>Sync Files</span>
        )}
      </button>

      {/* File content area */}
      <div className="bg-[#282828] absolute left-4 sm:left-6 lg:left-[28px] top-[100px] sm:top-[110px] lg:top-[123px] right-4 sm:right-6 lg:right-[34px] bottom-4 sm:bottom-6 lg:bottom-[33px] overflow-hidden">
        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center">
            <p className="text-white/50 text-xl sm:text-2xl lg:text-[28px] font-display">
              Loading...
            </p>
          </div>
        ) : !selectedFile || !previewData ? (
          <div className="w-full h-full flex items-center justify-center">
            <p className="text-white text-xl sm:text-2xl lg:text-[28px] font-display text-center px-4">
              Select a file to view
            </p>
          </div>
        ) : (
          <>
            {/* Preview content */}
            <div className="w-full h-full overflow-auto p-4 sm:p-5 lg:p-6">
              {typeof previewData.content === "string" ? (
                <pre className="text-white text-xs sm:text-sm lg:text-base font-mono leading-relaxed whitespace-pre-wrap break-words">
                  {previewData.content}
                </pre>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-white/50 text-sm sm:text-base lg:text-lg font-display">
                    Binary file preview not supported
                  </p>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="absolute right-2 sm:right-3 lg:right-4 top-2 sm:top-2.5 lg:top-3 flex items-center gap-3 sm:gap-3.5 lg:gap-4">
              <button
                onClick={handleDownload}
                className="size-10 sm:size-11 lg:size-12 flex items-center justify-center hover:bg-[#181818]/30 transition-colors"
                title="Download file"
                type="button"
              >
                <img
                  src="/download.svg"
                  alt="Download"
                  className="w-full h-full"
                />
              </button>
              <button
                onClick={handleCopy}
                className="size-10 sm:size-11 lg:size-12 flex items-center justify-center hover:bg-[#181818]/30 transition-colors relative"
                title="Copy file content"
                type="button"
              >
                <img src="/copy.svg" alt="Copy" className="w-full h-full" />
                {copySuccess && (
                  <span className="absolute -bottom-6 sm:-bottom-7 lg:-bottom-8 right-0 text-green-400 text-xs font-display whitespace-nowrap">
                    Copied!
                  </span>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
