import { useState, useEffect } from "react";
import { Highlight, themes } from "prism-react-renderer";
import { previewFiles } from "@/api";
import { cn } from "@/lib/utils";
import { usePendingChangesStore } from "@/shared/stores/usePendingChangesStore";

interface PreviewFile {
  name: string;
  content: string;
}

export default function FilesPage() {
  const [files, setFiles] = useState<PreviewFile[]>([]);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [hoveredFileName, setHoveredFileName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copySuccess, setCopySuccess] = useState(false);

  const { buildPreviewPayload } = usePendingChangesStore();

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      try {
        const payload = buildPreviewPayload();
        const response = await previewFiles(payload);
        if (cancelled) return;
        const entries = Object.entries(response.files).map(([name, content]) => ({
          name,
          content,
        }));
        setFiles(entries);
        setSelectedFileName((prev) => {
          if (prev && entries.some((e) => e.name === prev)) return prev;
          return entries.length > 0 ? entries[0].name : null;
        });
      } catch (error) {
        if (!cancelled) console.error("Failed to generate preview:", error);
      }
      if (!cancelled) setIsLoading(false);
    };
    load();
    return () => { cancelled = true; };
  }, [buildPreviewPayload]);

  const selectedFile = files.find((f) => f.name === selectedFileName);
  const fileContent = selectedFile?.content ?? "";

  const handleCopy = async () => {
    if (!fileContent) return;
    try {
      await navigator.clipboard.writeText(fileContent);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const handleDownload = () => {
    if (!selectedFile) return;
    const blob = new Blob([fileContent], { type: "text/x-python" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = selectedFile.name.includes("/") ? selectedFile.name.split("/").pop()! : selectedFile.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="flex flex-col h-screen min-h-screen overflow-x-hidden pb-20 md:pb-0"
      style={{
        background: "linear-gradient(180deg, rgba(18, 18, 18, 1) 39%, rgba(40, 40, 40, 1) 100%)",
      }}
    >
      <div className="flex-1 flex flex-col overflow-hidden px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        {/* Page heading */}
        <div className="mb-4 sm:mb-6 shrink-0">
          <h1 className="h1-underline text-xl sm:text-2xl md:text-3xl lg:text-[36px] font-bold text-white font-display">
            File Preview
          </h1>
        </div>

        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* File List */}
        <div className="h-[300px] sm:h-[350px] md:h-[400px] lg:h-full w-full lg:w-[260px] xl:w-[300px] 2xl:w-[320px] flex-shrink-0">
          <div className="bg-[#121212] border-2 border-[#363636] h-full flex flex-col overflow-hidden">
            <div className="flex flex-col overflow-y-auto py-2">
              {isLoading ? (
                <div className="flex items-center justify-center h-[150px] sm:h-[180px] lg:h-[200px] text-white/50 text-sm sm:text-base lg:text-lg font-display">
                  Loading...
                </div>
              ) : files.length === 0 ? (
                <div className="flex items-center justify-center h-[150px] sm:h-[180px] lg:h-[200px] text-white/50 text-sm sm:text-base lg:text-lg font-display">
                  No files to preview
                </div>
              ) : (
                files.map((file, index) => {
                  const isSelected = selectedFileName === file.name;
                  const isHovered = hoveredFileName === file.name;

                  return (
                    <div key={file.name} className="shrink-0 relative">
                      {/* Hover indicator */}
                      <div
                        className={cn(
                          "absolute left-0 top-0 bottom-0 w-full pointer-events-none z-0",
                          "transition-opacity ease-out",
                          isHovered && !isSelected
                            ? "opacity-100 duration-75"
                            : "opacity-0 duration-500 delay-100"
                        )}
                      >
                        <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-t from-transparent via-50% via-[#1175d5] to-transparent">
                          <div className="absolute -left-[3px] top-[20%] bottom-[20%] w-[8px] bg-[#1175d5] blur-[5px]" />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-r from-[rgba(10,155,252,0.3)] via-[rgba(10,155,252,0.1)] to-transparent" />
                      </div>

                      {/* Selected state */}
                      {isSelected && (
                        <div className="absolute left-0 top-0 bottom-0 w-full pointer-events-none z-0">
                          <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-t from-transparent via-50% via-[#1175d5] to-transparent">
                            <div className="absolute -left-[3px] top-[20%] bottom-[20%] w-[8px] bg-[#1175d5] blur-[5px]" />
                          </div>
                          <div
                            className="absolute inset-0"
                            style={{
                              background:
                                "linear-gradient(90deg, rgba(10, 155, 252, 0.30) 0%, rgba(0, 0, 0, 0.00) 100%)",
                            }}
                          />
                        </div>
                      )}

                      <button
                        onClick={() => setSelectedFileName(file.name)}
                        onMouseEnter={() => setHoveredFileName(file.name)}
                        onMouseLeave={() => setHoveredFileName(null)}
                        type="button"
                        className={cn(
                          "w-full relative z-10 flex items-center text-white font-normal font-display leading-none transition-all duration-200",
                          "h-[50px] sm:h-[60px] lg:h-[75px]",
                          "text-base sm:text-lg lg:text-xl xl:text-[24px]"
                        )}
                      >
                        <span className="truncate w-full text-left pl-4 sm:pl-5 lg:pl-[29px]">
                          {file.name.includes("/") ? file.name.split("/").pop() : file.name}
                        </span>
                      </button>
                      {index < files.length - 1 && (
                        <div className="h-[1px] bg-[#363636] w-[calc(100%-24px)] sm:w-[calc(100%-32px)] lg:w-[270px] ml-4 sm:ml-5 lg:ml-[29px]" />
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Vertical divider */}
        <div className="hidden lg:flex items-stretch justify-center flex-shrink-0 mx-4 xl:mx-[32px]">
          <div className="w-[2px] bg-white" />
        </div>

        {/* Mobile gap */}
        <div className="h-4 sm:h-5 md:h-6 lg:hidden" />

        {/* File Viewer */}
        <div className="flex-1 min-h-[400px] lg:min-h-0 overflow-hidden">
          <div className="bg-[#181818] border-2 border-[#404040] h-full overflow-hidden relative">
            {/* Action buttons */}
            {selectedFile && (
              <div className="absolute right-4 sm:right-6 lg:right-[28px] top-4 sm:top-6 lg:top-[20px] flex items-center gap-3 z-20">
                <button
                  onClick={handleCopy}
                  className="size-10 sm:size-11 lg:size-12 flex items-center justify-center hover:bg-[#282828] transition-colors relative"
                  title="Copy file content"
                  type="button"
                >
                  <img
                    src="/copy-thin.svg"
                    alt="Copy"
                    className="w-7 h-7 sm:w-8 sm:h-8 lg:w-9 lg:h-9"
                  />
                  {copySuccess && (
                    <span className="absolute -bottom-6 sm:-bottom-7 right-0 text-green-400 text-xs font-display whitespace-nowrap">
                      Copied!
                    </span>
                  )}
                </button>
                <button
                  onClick={handleDownload}
                  className="size-10 sm:size-11 lg:size-12 flex items-center justify-center hover:bg-[#282828] transition-colors"
                  title="Download file"
                  type="button"
                >
                  <img
                    src="/download-thin.svg"
                    alt="Download"
                    className="w-7 h-7 sm:w-8 sm:h-8 lg:w-9 lg:h-9"
                  />
                </button>
              </div>
            )}

            {/* File content area */}
            <div className="bg-[#282828] absolute left-4 sm:left-6 lg:left-[28px] top-[60px] sm:top-[68px] lg:top-[72px] right-4 sm:right-6 lg:right-[34px] bottom-4 sm:bottom-6 lg:bottom-[33px] overflow-hidden">
              {isLoading ? (
                <div className="w-full h-full flex items-center justify-center">
                  <p className="text-white/50 text-xl sm:text-2xl lg:text-[28px] font-display">
                    Loading...
                  </p>
                </div>
              ) : !selectedFile ? (
                <div className="w-full h-full flex items-center justify-center">
                  <p className="text-white text-xl sm:text-2xl lg:text-[28px] font-display text-center px-4">
                    Select a file to preview
                  </p>
                </div>
              ) : (
                <div className="w-full h-full overflow-auto">
                  <Highlight
                    theme={themes.vsDark}
                    code={fileContent}
                    language="python"
                  >
                    {({
                      className,
                      style,
                      tokens,
                      getLineProps,
                      getTokenProps,
                    }) => (
                      <pre
                        className={cn(
                          className,
                          "p-4 sm:p-5 lg:p-6 text-sm sm:text-base lg:text-lg leading-relaxed font-mono"
                        )}
                        style={{
                          ...style,
                          background: "transparent",
                          margin: 0,
                          fontFamily: "Inconsolata, monospace",
                        }}
                      >
                        {tokens.map((line, i) => (
                          <div key={i} {...getLineProps({ line })}>
                            {line.map((token, key) => (
                              <span key={key} {...getTokenProps({ token })} />
                            ))}
                          </div>
                        ))}
                      </pre>
                    )}
                  </Highlight>
                </div>
              )}
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
