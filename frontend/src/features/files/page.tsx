import { useState, useEffect } from "react";
import { Highlight, themes } from "prism-react-renderer";
import { 
  getProjectFiles, 
  getFileContent, 
  downloadFile,
  type ProjectFileInfo,
} from "@/api";
import { cn } from "@/lib/utils";

export default function FilesPage() {
  const [files, setFiles] = useState<ProjectFileInfo[]>([]);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [hoveredFileId, setHoveredFileId] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // Load files on mount
  useEffect(() => {
    loadFiles();
  }, []);

  // Load file content when selection changes
  useEffect(() => {
    if (selectedFileId) {
      loadFileContent(selectedFileId);
    } else {
      setFileContent("");
    }
  }, [selectedFileId]);

  const loadFiles = async () => {
    setIsLoading(true);
    try {
      const response = await getProjectFiles();
      setFiles(response.files);
      // Auto-select first file if available
      if (response.files.length > 0 && !selectedFileId) {
        setSelectedFileId(response.files[0].id);
      }
    } catch (error) {
      console.error("Failed to load files:", error);
    }
    setIsLoading(false);
  };

  const loadFileContent = async (fileId: string) => {
    setIsLoadingContent(true);
    try {
      const response = await getFileContent(fileId);
      setFileContent(response.exists ? response.content : "# File not yet created");
    } catch (error) {
      console.error("Failed to load file content:", error);
      setFileContent("# Error loading file");
    }
    setIsLoadingContent(false);
  };

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

  const handleDownload = async () => {
    if (!selectedFileId) return;
    try {
      const blob = await downloadFile(selectedFileId);
      const selectedFile = files.find(f => f.id === selectedFileId);
      const filename = selectedFile?.name || "file.py";
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download:", error);
    }
  };

  const selectedFile = files.find(f => f.id === selectedFileId);

  return (
    <div
      className="flex flex-col h-screen min-h-screen overflow-x-hidden pb-20 md:pb-0"
      style={{
        background: "linear-gradient(-0.11deg, #121212 39.262%, #282828 107%)",
      }}
    >
      <div className="flex-1 flex flex-col lg:flex-row px-4 sm:px-6 md:px-8 lg:px-[16px] py-4 sm:py-6 md:py-8 overflow-hidden">
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
                  No files available
                </div>
              ) : (
                files.map((file, index) => {
                  const isSelected = selectedFileId === file.id;
                  const isHovered = hoveredFileId === file.id;

                  return (
                    <div key={file.id} className="shrink-0 relative">
                      {/* Hover indicator with blue glow - same as sidebar */}
                      <div 
                        className={cn(
                          "absolute left-0 top-0 bottom-0 w-full pointer-events-none z-0",
                          "transition-opacity ease-out",
                          isHovered && !isSelected
                            ? "opacity-100 duration-75" // Fast fade-in
                            : "opacity-0 duration-500 delay-100" // Slow fade-out with delay for lingering effect
                        )}
                      >
                        <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-t from-transparent via-50% via-[#1175d5] to-transparent">
                          <div className="absolute -left-[3px] top-[20%] bottom-[20%] w-[8px] bg-[#1175d5] blur-[5px]" />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-r from-[rgba(10,155,252,0.3)] via-[rgba(10,155,252,0.1)] to-transparent" />
                      </div>

                      {/* Selected state indicator */}
                      {isSelected && (
                        <div className="absolute left-0 top-0 bottom-0 w-full pointer-events-none z-0">
                          <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-t from-transparent via-50% via-[#1175d5] to-transparent">
                            <div className="absolute -left-[3px] top-[20%] bottom-[20%] w-[8px] bg-[#1175d5] blur-[5px]" />
                          </div>
                          <div 
                            className="absolute inset-0"
                            style={{
                              background: "linear-gradient(90deg, rgba(10, 155, 252, 0.30) 0%, rgba(0, 0, 0, 0.00) 100%)",
                            }}
                          />
                        </div>
                      )}

                      <button
                        onClick={() => setSelectedFileId(file.id)}
                        onMouseEnter={() => setHoveredFileId(file.id)}
                        onMouseLeave={() => setHoveredFileId(null)}
                        type="button"
                        className={cn(
                          "w-full relative z-10 flex items-center text-white font-normal font-display leading-none transition-all duration-200",
                          "h-[50px] sm:h-[60px] lg:h-[75px]",
                          "text-base sm:text-lg lg:text-xl xl:text-[24px]",
                          !file.exists && "opacity-50"
                        )}
                      >
                        <span className="truncate w-full text-left pl-4 sm:pl-5 lg:pl-[29px]">
                          {file.name}
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
            {/* Copy and Download buttons in top right */}
            {selectedFile && (
              <div className="absolute right-4 sm:right-6 lg:right-[28px] top-4 sm:top-6 lg:top-[20px] flex items-center gap-3 z-20">
                <button
                  onClick={handleCopy}
                  className="size-10 sm:size-11 lg:size-12 flex items-center justify-center hover:bg-[#282828] transition-colors rounded relative"
                  title="Copy file content"
                  type="button"
                >
                  <img src="/copy-thin.svg" alt="Copy" className="w-7 h-7 sm:w-8 sm:h-8 lg:w-9 lg:h-9" />
                  {copySuccess && (
                    <span className="absolute -bottom-6 sm:-bottom-7 right-0 text-green-400 text-xs font-display whitespace-nowrap">
                      Copied!
                    </span>
                  )}
                </button>
                <button
                  onClick={handleDownload}
                  className="size-10 sm:size-11 lg:size-12 flex items-center justify-center hover:bg-[#282828] transition-colors rounded"
                  title="Download file"
                  type="button"
                  disabled={!selectedFile.exists}
                >
                  <img src="/download-thin.svg" alt="Download" className="w-7 h-7 sm:w-8 sm:h-8 lg:w-9 lg:h-9" />
                </button>
              </div>
            )}

            {/* File content area */}
            <div className="bg-[#282828] absolute left-4 sm:left-6 lg:left-[28px] top-[70px] sm:top-[80px] lg:top-[80px] right-4 sm:right-6 lg:right-[34px] bottom-4 sm:bottom-6 lg:bottom-[33px] overflow-hidden">
              {isLoadingContent ? (
                <div className="w-full h-full flex items-center justify-center">
                  <p className="text-white/50 text-xl sm:text-2xl lg:text-[28px] font-display">
                    Loading...
                  </p>
                </div>
              ) : !selectedFile ? (
                <div className="w-full h-full flex items-center justify-center">
                  <p className="text-white text-xl sm:text-2xl lg:text-[28px] font-display text-center px-4">
                    Select a file to view
                  </p>
                </div>
              ) : (
                <div className="w-full h-full overflow-auto">
                  <Highlight
                    theme={themes.vsDark}
                    code={fileContent}
                    language="python"
                  >
                    {({ className, style, tokens, getLineProps, getTokenProps }) => (
                      <pre
                        className={cn(className, "p-4 sm:p-5 lg:p-6 text-sm sm:text-base lg:text-lg leading-relaxed font-mono")}
                        style={{ ...style, background: 'transparent', margin: 0, fontFamily: 'Inconsolata, monospace' }}
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
  );
}
