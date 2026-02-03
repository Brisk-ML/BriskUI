import { cn } from "@/lib/utils";
import { useFileStore } from "../stores/useFileStore";

export function FileList() {
  const { filteredFiles, selectedFileId, selectFile } = useFileStore();

  return (
    <div className="bg-[#121212] border-2 border-[#363636] h-full flex flex-col overflow-hidden">
      <div className="flex flex-col gap-1 sm:gap-1.5 lg:gap-2 overflow-y-auto px-2 sm:px-3 lg:px-4 py-2">
        {filteredFiles.length === 0 ? (
          <div className="flex items-center justify-center h-[150px] sm:h-[180px] lg:h-[200px] text-white/50 text-sm sm:text-base lg:text-lg font-display">
            No files available
          </div>
        ) : (
          filteredFiles.map((file, index) => {
            const isSelected = selectedFileId === file.id;

            return (
              <div key={file.id} className="shrink-0">
                <button
                  onClick={() => selectFile(file.id)}
                  type="button"
                  className={cn(
                    "group w-full relative overflow-hidden flex items-center text-white font-normal font-display leading-none transition-all duration-200",
                    "h-[50px] sm:h-[60px] lg:h-[75px]",
                    "text-base sm:text-lg lg:text-xl xl:text-[24px]",
                  )}
                >
                  {/* Hover state */}
                  {!isSelected && (
                    <div
                      className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      style={{
                        background:
                          "linear-gradient(90deg, rgba(10, 155, 252, 0.15) 0%, rgba(0, 0, 0, 0.00) 100%)",
                      }}
                    />
                  )}
                  {/* Selected state */}
                  {isSelected && (
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background:
                          "linear-gradient(90deg, rgba(10, 155, 252, 0.30) 0%, rgba(0, 0, 0, 0.00) 100%)",
                      }}
                    />
                  )}
                  <span className="truncate w-full text-left relative z-10 pl-3 sm:pl-5 lg:pl-[29px]">
                    {file.name}
                  </span>
                </button>
                {index < filteredFiles.length - 1 && (
                  <div className="h-[1px] bg-[#363636] w-[calc(100%-24px)] sm:w-[calc(100%-32px)] lg:w-[270px] ml-3 sm:ml-5 lg:ml-[29px]" />
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
