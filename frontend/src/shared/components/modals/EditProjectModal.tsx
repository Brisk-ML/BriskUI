import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { ChromePicker, type ColorResult } from "react-color";
import { AlertTriangle } from "lucide-react";
import { getPlotSettings, writeSettingsFile, getExperimentsData, moveProject, type PlotSettingsData } from "@/api";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { HoverSelect } from "@/shared/components/ui/hover-select";
import { Textarea } from "@/shared/components/ui/textarea";
import { STYLES } from "@/shared/constants/colors";
import { useProjectModalStore } from "@/shared/stores/useProjectModalStore";
import { useProjectStore } from "@/shared/stores/useProjectStore";
import { DeleteProjectDialog } from "./DeleteProjectDialog";

interface ColorSwatchProps {
  label: string;
  color: string;
  onChange: (hex: string) => void;
}

function ColorSwatch({ label, color, onChange }: ColorSwatchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const swatchRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const handleSwatchClick = () => {
    if (swatchRef.current) {
      const rect = swatchRef.current.getBoundingClientRect();
      // Use viewport coordinates directly for fixed positioning
      // Position to the right of the swatch, or to the left if not enough space
      const pickerWidth = 240;
      const spaceOnRight = window.innerWidth - rect.right;
      const left = spaceOnRight > pickerWidth + 20 
        ? rect.right + 12 
        : rect.left - pickerWidth - 12;
      
      setPosition({
        top: rect.top,
        left: Math.max(10, left),
      });
    }
    setIsOpen(true);
  };

  const handleChange = (result: ColorResult) => {
    if (result.rgb.a !== undefined && result.rgb.a < 1) {
      onChange(`rgba(${result.rgb.r}, ${result.rgb.g}, ${result.rgb.b}, ${result.rgb.a})`);
    } else {
      onChange(result.hex);
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        swatchRef.current &&
        !swatchRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div className="flex items-center gap-3 relative">
      <button
        ref={swatchRef}
        type="button"
        className={`w-8 h-8 sm:w-10 sm:h-10 border-2 ${STYLES.border} cursor-pointer transition-opacity hover:opacity-90`}
        style={{ backgroundColor: color }}
        onClick={handleSwatchClick}
        aria-label={`Pick color for ${label}`}
      />
      <span className="text-white text-sm sm:text-base font-display">{label}</span>

      {isOpen && position && createPortal(
        <div
          ref={popoverRef}
          className="fixed z-[9999]"
          style={{ top: position.top, left: position.left }}
        >
          <ChromePicker
            color={color}
            onChange={handleChange}
            disableAlpha={false}
            styles={{
              default: {
                picker: { width: "240px" },
                saturation: { paddingBottom: "55%" },
              },
            }}
          />
        </div>,
        document.body
      )}
    </div>
  );
}

const DEFAULT_PLOT_SETTINGS: PlotSettingsData = {
  file_format: "png",
  transparent: false,
  width: 10,
  height: 8,
  dpi: 300,
  primary_color: "#1175D5",
  secondary_color: "#00A878",
  accent_color: "#DE6B48",
};

export function EditProjectModal() {
  const { projectDescription, projectPath, projectType, setProjectInfo } = useProjectStore();
  const { editModal, closeEditModal, openDeleteModal } = useProjectModalStore();

  const [localPath, setLocalPath] = useState(projectPath);
  const [localDescription, setLocalDescription] = useState(projectDescription);
  const [plotSettings, setPlotSettings] = useState<PlotSettingsData>(DEFAULT_PLOT_SETTINGS);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  
  // Move confirmation state
  const [showMoveConfirm, setShowMoveConfirm] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const [moveSuccess, setMoveSuccess] = useState<{ newPath: string } | null>(null);

  useEffect(() => {
    if (editModal) {
      setLocalPath(projectPath);
      setLocalDescription(projectDescription);
      setSaveError(null);
      setShowMoveConfirm(false);
      setMoveSuccess(null);
      
      // Load plot settings
      getPlotSettings()
        .then((data) => setPlotSettings(data))
        .catch(() => setPlotSettings(DEFAULT_PLOT_SETTINGS));
    }
  }, [editModal, projectPath, projectDescription]);

  // Check if path has changed
  const pathHasChanged = localPath.trim() !== projectPath.trim() && localPath.trim() !== "";

  const saveWithoutMove = async () => {
    setIsSaving(true);
    setSaveError(null);
    try {
      // Save project info without changing path
      await setProjectInfo({ path: projectPath, description: localDescription });
      
      // Save plot settings to settings.py
      const experimentsData = await getExperimentsData();
      
      const experimentGroups = experimentsData.experiment_groups.map((g) => ({
        name: g.name,
        description: g.description || "",
        dataset_file_name: g.datasets[0] || "",
        dataset_table_name: null,
        algorithms: g.algorithms,
        use_default_data_manager: true,
      }));
      
      await writeSettingsFile({
        problem_type: projectType,
        default_algorithms: experimentsData.algorithms.map((a) => a.name),
        experiment_groups: experimentGroups,
        plot_settings: {
          file_format: plotSettings.file_format !== DEFAULT_PLOT_SETTINGS.file_format ? plotSettings.file_format : undefined,
          transparent: plotSettings.transparent !== DEFAULT_PLOT_SETTINGS.transparent ? plotSettings.transparent : undefined,
          width: plotSettings.width !== DEFAULT_PLOT_SETTINGS.width ? plotSettings.width : undefined,
          height: plotSettings.height !== DEFAULT_PLOT_SETTINGS.height ? plotSettings.height : undefined,
          dpi: plotSettings.dpi !== DEFAULT_PLOT_SETTINGS.dpi ? plotSettings.dpi : undefined,
          primary_color: plotSettings.primary_color !== DEFAULT_PLOT_SETTINGS.primary_color ? plotSettings.primary_color : undefined,
          secondary_color: plotSettings.secondary_color !== DEFAULT_PLOT_SETTINGS.secondary_color ? plotSettings.secondary_color : undefined,
          accent_color: plotSettings.accent_color !== DEFAULT_PLOT_SETTINGS.accent_color ? plotSettings.accent_color : undefined,
        },
      });
      
      closeEditModal();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setIsSaving(false);
    }
  };

  const handleMoveProject = async () => {
    setIsMoving(true);
    setSaveError(null);
    try {
      // Move the project and update description in one operation
      const moveResult = await moveProject({
        new_path: localPath.trim(),
        new_description: localDescription,  // Save description to new location
      });
      
      if (moveResult.success) {
        // Show success message with instructions
        setMoveSuccess({ newPath: moveResult.new_path });
        setShowMoveConfirm(false);
      }
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to move project");
      setShowMoveConfirm(false);
    } finally {
      setIsMoving(false);
    }
  };

  const handleSave = async () => {
    // If path changed, show confirmation first
    if (pathHasChanged) {
      setShowMoveConfirm(true);
      return;
    }
    
    // Otherwise just save normally
    await saveWithoutMove();
  };

  const handleMoveCancel = async () => {
    // User chose not to move, save other changes without path
    setShowMoveConfirm(false);
    await saveWithoutMove();
  };

  const updatePlotSetting = <K extends keyof PlotSettingsData>(key: K, value: PlotSettingsData[K]) => {
    setPlotSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <>
      {/* Move Confirmation Dialog */}
      <Dialog open={showMoveConfirm} onOpenChange={setShowMoveConfirm}>
        <DialogContent
          showCloseButton={false}
          className={`max-w-[95vw] sm:max-w-[500px] border-[2px] ${STYLES.border} ${STYLES.bgCard} p-4 sm:p-6`}
        >
          <DialogHeader className="mb-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-yellow-500" />
              <DialogTitle className="text-xl font-bold text-[#ebebeb] font-display">
                Move Project?
              </DialogTitle>
            </div>
            <DialogDescription className="text-white/70 text-sm mt-2">
              This will move the entire project directory to a new location.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mb-6">
            <div className="p-3 bg-[#181818] border border-[#404040]">
              <p className="text-white/60 text-xs mb-1">From:</p>
              <p className="text-white text-sm font-mono break-all">{projectPath}</p>
            </div>
            <div className="p-3 bg-[#181818] border border-[#404040]">
              <p className="text-white/60 text-xs mb-1">To:</p>
              <p className="text-white text-sm font-mono break-all">{localPath}</p>
            </div>
            <p className="text-white/70 text-sm">
              Parent directories will be created if they don't exist. After the move, the UI will need to be restarted from the new location.
            </p>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={handleMoveCancel}
              disabled={isMoving}
              className={`btn-cancel-hover border ${STYLES.border} ${STYLES.bgDark} text-white h-9 text-sm`}
            >
              Don't Move (Save Other Changes)
            </Button>
            <Button
              onClick={handleMoveProject}
              disabled={isMoving}
              className="btn-add-hover bg-yellow-600 hover:bg-yellow-700 text-white h-9 text-sm"
            >
              {isMoving ? "Moving..." : "Move Project"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Move Success Dialog */}
      <Dialog open={!!moveSuccess} onOpenChange={() => setMoveSuccess(null)}>
        <DialogContent
          showCloseButton={false}
          className={`max-w-[95vw] sm:max-w-[550px] border-[2px] ${STYLES.border} ${STYLES.bgCard} p-4 sm:p-6`}
        >
          <DialogHeader className="mb-4">
            <DialogTitle className="text-xl font-bold text-green-400 font-display">
              Project Moved Successfully
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mb-6">
            <p className="text-white/90 text-sm">
              Your project has been moved to:
            </p>
            <div className="p-3 bg-[#181818] border border-green-600/50">
              <p className="text-green-400 text-sm font-mono break-all">{moveSuccess?.newPath}</p>
            </div>
            <div className="p-4 bg-yellow-600/20 border border-yellow-600/50">
              <p className="text-yellow-200 text-sm font-medium mb-2">
                Important: Restart Required
              </p>
              <p className="text-white/70 text-sm">
                Please restart the UI by running:
              </p>
              <code className="block mt-2 p-2 bg-[#181818] text-green-400 text-xs font-mono">
                brisk ui {moveSuccess?.newPath}
              </code>
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={() => {
                setMoveSuccess(null);
                closeEditModal();
              }}
              className="btn-add-hover bg-[#1175d5] text-white h-9 text-sm w-full sm:w-auto"
            >
              Got It
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Main Edit Project Dialog */}
      <Dialog
        open={editModal && !showMoveConfirm && !moveSuccess}
        onOpenChange={(open) => !open && closeEditModal()}
      >
        <DialogContent
          showCloseButton={false}
          className={`max-w-[95vw] sm:max-w-[90vw] md:max-w-[800px] lg:max-w-[900px] xl:max-w-[1000px] 2xl:max-w-[1100px] max-h-[90vh] overflow-y-auto border-[2px] ${STYLES.border} ${STYLES.bgCard} p-4 sm:p-6 md:p-8`}
        >
          <DialogHeader className="mb-4 sm:mb-6">
            <DialogTitle className="h1-underline text-xl sm:text-2xl md:text-3xl font-bold text-[#ebebeb] font-display text-left w-fit">
              Project Settings
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Project Info Section */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-white text-base sm:text-lg font-normal font-display">
                  Project Path
                </Label>
                <Input
                  value={localPath}
                  onChange={(e) => setLocalPath(e.target.value)}
                  placeholder="path/to/project"
                  className={`${STYLES.bgCardAlt} ${STYLES.border} text-white text-sm sm:text-base h-9 sm:h-10 placeholder:text-white/60 focus-visible:border-white focus-visible:ring-white/50`}
                />
                {pathHasChanged && (
                  <p className="text-yellow-500 text-xs mt-1">
                    Changing the path will move the project directory to the new location
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-white text-base sm:text-lg font-normal font-display">
                  Description
                </Label>
                <Textarea
                  value={localDescription}
                  onChange={(e) => setLocalDescription(e.target.value)}
                  placeholder="This is a classification project training on ..."
                  className={`${STYLES.bgCardAlt} ${STYLES.border} text-white text-sm sm:text-base min-h-[80px] sm:min-h-[100px] resize-none placeholder:text-white/60 focus-visible:border-white focus-visible:ring-white/50`}
                />
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-white/20" />

            {/* Plot Settings Section */}
            <div className="space-y-4">
              <h3 className="text-lg sm:text-xl font-bold text-white font-display">
                Plot Settings
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column - Plot Settings */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-white text-sm sm:text-base font-display">
                      File Format
                    </Label>
                    <HoverSelect
                      value={plotSettings.file_format}
                      onValueChange={(v) => updatePlotSetting("file_format", v)}
                      placeholder="Select"
                      options={[
                        { value: "png", label: "PNG" },
                        { value: "svg", label: "SVG" },
                        { value: "pdf", label: "PDF" },
                        { value: "jpg", label: "JPG" },
                      ]}
                      triggerClassName={`${STYLES.bgCardAlt} ${STYLES.border} text-white h-9 sm:h-10 w-full max-w-[180px] text-sm`}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white text-sm sm:text-base font-display">
                      Transparent
                    </Label>
                    <HoverSelect
                      value={plotSettings.transparent ? "yes" : "no"}
                      onValueChange={(v) => updatePlotSetting("transparent", v === "yes")}
                      placeholder="Select"
                      options={[
                        { value: "yes", label: "Yes" },
                        { value: "no", label: "No" },
                      ]}
                      triggerClassName={`${STYLES.bgCardAlt} ${STYLES.border} text-white h-9 sm:h-10 w-full max-w-[180px] text-sm`}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-2">
                      <Label className="text-white text-sm font-display">Width (in)</Label>
                      <Input
                        type="number"
                        min={1}
                        value={plotSettings.width === 0 ? "" : String(plotSettings.width)}
                        onChange={(e) => updatePlotSetting("width", e.target.value === "" ? 0 : Number(e.target.value))}
                        placeholder="10"
                        className={`${STYLES.bgCardAlt} ${STYLES.border} text-white h-9 text-sm`}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white text-sm font-display">Height (in)</Label>
                      <Input
                        type="number"
                        min={1}
                        value={plotSettings.height === 0 ? "" : String(plotSettings.height)}
                        onChange={(e) => updatePlotSetting("height", e.target.value === "" ? 0 : Number(e.target.value))}
                        placeholder="8"
                        className={`${STYLES.bgCardAlt} ${STYLES.border} text-white h-9 text-sm`}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white text-sm font-display">DPI</Label>
                      <Input
                        type="number"
                        min={72}
                        value={plotSettings.dpi === 0 ? "" : String(plotSettings.dpi)}
                        onChange={(e) => updatePlotSetting("dpi", e.target.value === "" ? 0 : Number(e.target.value))}
                        placeholder="300"
                        className={`${STYLES.bgCardAlt} ${STYLES.border} text-white h-9 text-sm`}
                      />
                    </div>
                  </div>
                </div>

                {/* Right Column - Colors */}
                <div className="space-y-4">
                  <Label className="text-white text-sm sm:text-base font-display block">
                    Plot Colors
                  </Label>
                  <div className="space-y-3">
                    <ColorSwatch
                      label="Primary"
                      color={plotSettings.primary_color}
                      onChange={(hex) => updatePlotSetting("primary_color", hex)}
                    />
                    <ColorSwatch
                      label="Secondary"
                      color={plotSettings.secondary_color}
                      onChange={(hex) => updatePlotSetting("secondary_color", hex)}
                    />
                    <ColorSwatch
                      label="Accent"
                      color={plotSettings.accent_color}
                      onChange={(hex) => updatePlotSetting("accent_color", hex)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {saveError && (
            <div className="mt-4 p-3 bg-red-500/20 border border-red-500/50">
              <p className="text-red-400 text-sm font-display">{saveError}</p>
            </div>
          )}

          <DialogFooter className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-3">
            <Button
              variant="outline"
              onClick={() => closeEditModal()}
              disabled={isSaving}
              className={`btn-cancel-hover border ${STYLES.border} ${STYLES.bgDark} text-white h-9 sm:h-10 text-sm sm:text-base order-2 sm:order-1`}
            >
              Cancel
            </Button>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 order-1 sm:order-2">
              <Button
                variant="outline"
                onClick={() => openDeleteModal()}
                disabled={isSaving}
                className={`btn-delete-hover border ${STYLES.border} ${STYLES.bgDark} text-white h-9 sm:h-10 text-sm sm:text-base w-full sm:w-auto`}
              >
                Delete
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className={`btn-add-hover ${STYLES.bgPrimary} text-white h-9 sm:h-10 text-sm sm:text-base px-4 sm:px-6 w-full sm:w-auto`}
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteProjectDialog />
    </>
  );
}
