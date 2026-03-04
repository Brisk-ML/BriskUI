import { useState, useRef, useEffect } from "react";
import { ChromePicker, type ColorResult } from "react-color";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { HoverSelect } from "@/shared/components/ui/hover-select";
import { STYLES } from "@/shared/constants/colors";
import { useReportStepStore, type ColorOption } from "@/features/project/stores/useReportStepStore";

interface ColorSwatchProps {
  colorOption: ColorOption;
  onColorChange: (hex: string) => void;
}

function ColorSwatch({ colorOption, onColorChange }: ColorSwatchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const swatchRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const handleSwatchClick = () => {
    if (swatchRef.current) {
      const rect = swatchRef.current.getBoundingClientRect();
      // Position picker to the right of the swatch, vertically centered
      setPosition({
        top: rect.top + window.scrollY,
        left: rect.right + 12 + window.scrollX,
      });
    }
    setIsOpen(true);
  };

  const handleChange = (color: ColorResult) => {
    // Use rgba if alpha is not 1, otherwise hex
    if (color.rgb.a !== undefined && color.rgb.a < 1) {
      onColorChange(`rgba(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}, ${color.rgb.a})`);
    } else {
      onColorChange(color.hex);
    }
  };

  // Close popover when clicking outside
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
    <div className="flex items-center gap-4 relative">
      <button
        ref={swatchRef}
        type="button"
        className={`w-10 h-10 sm:w-12 sm:h-12 border-2 ${STYLES.border} cursor-pointer transition-opacity hover:opacity-90`}
        style={{ backgroundColor: colorOption.color }}
        onClick={handleSwatchClick}
        aria-label={`Pick color for ${colorOption.name}`}
      />
      <span className="text-white text-base sm:text-lg lg:text-[20px] font-display">
        {colorOption.name}
      </span>

      {isOpen && position && (
        <div
          ref={popoverRef}
          className="fixed z-50"
          style={{ top: position.top, left: position.left }}
        >
          <ChromePicker
            color={colorOption.color}
            onChange={handleChange}
            disableAlpha={false}
            styles={{
              default: {
                picker: {
                  width: "280px",
                },
                saturation: {
                  paddingBottom: "55%",
                },
              },
            }}
          />
        </div>
      )}
    </div>
  );
}

export function ReportStep() {
  const {
    plotSettings,
    colors,
    setFileFormat,
    setTransparent,
    setImageWidth,
    setImageHeight,
    setDpi,
    setColor,
  } = useReportStepStore();

  const widthStr = plotSettings.imageWidth === 0 ? "" : String(plotSettings.imageWidth);
  const heightStr = plotSettings.imageHeight === 0 ? "" : String(plotSettings.imageHeight);
  const dpiStr = plotSettings.dpi === 0 ? "" : String(plotSettings.dpi);

  return (
    <div className="w-full max-w-[900px] px-4 xl:px-0 mx-auto">
      <div className={`${STYLES.bgCard} border-2 ${STYLES.border} p-4 sm:p-6`}>
        <div className="mb-6 sm:mb-8">
          <h1 className="h1-underline text-2xl sm:text-3xl lg:text-[36px] font-bold text-white font-display">
            Customize Report
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          <div className={`border ${STYLES.border} p-4 sm:p-6`}>
            <h2 className="text-xl sm:text-2xl lg:text-[28px] font-bold text-white font-display mb-4 sm:mb-6">
              Plot Settings
            </h2>

            <div className="space-y-4">
              <div>
                <Label className="text-white text-base sm:text-lg lg:text-[20px] font-display mb-2 block">
                  File Format
                </Label>
                <HoverSelect
                  value={plotSettings.fileFormat}
                  onValueChange={setFileFormat}
                  placeholder="Select"
                  options={[
                    { value: "png", label: "PNG" },
                    { value: "svg", label: "SVG" },
                    { value: "pdf", label: "PDF" },
                    { value: "jpg", label: "JPG" },
                  ]}
                  triggerClassName={`${STYLES.bgCardAlt} ${STYLES.border} text-white h-9 sm:h-10 md:h-11 w-full max-w-[200px] text-sm sm:text-base`}
                />
              </div>

              <div>
                <Label className="text-white text-base sm:text-lg lg:text-[20px] font-display mb-2 block">
                  Transparent
                </Label>
                <HoverSelect
                  value={plotSettings.transparent ? "yes" : "no"}
                  onValueChange={(v) => setTransparent(v === "yes")}
                  placeholder="Select"
                  options={[
                    { value: "yes", label: "Yes" },
                    { value: "no", label: "No" },
                  ]}
                  triggerClassName={`${STYLES.bgCardAlt} ${STYLES.border} text-white h-9 sm:h-10 md:h-11 w-full max-w-[200px] text-sm sm:text-base`}
                />
              </div>

              <div>
                <Label className="text-white text-base sm:text-lg lg:text-[20px] font-display mb-2 block">
                  Image Width (in)
                </Label>
                <Input
                  type="number"
                  min={1}
                  value={widthStr}
                  onChange={(e) => {
                    const v = e.target.value;
                    setImageWidth(v === "" ? 0 : Number(v));
                  }}
                  placeholder="10"
                  className={`${STYLES.bgCardAlt} ${STYLES.border} text-white h-9 sm:h-10 md:h-11 w-full max-w-[200px] text-sm sm:text-base`}
                />
              </div>

              <div>
                <Label className="text-white text-base sm:text-lg lg:text-[20px] font-display mb-2 block">
                  Image Height (in)
                </Label>
                <Input
                  type="number"
                  min={1}
                  value={heightStr}
                  onChange={(e) => {
                    const v = e.target.value;
                    setImageHeight(v === "" ? 0 : Number(v));
                  }}
                  placeholder="8"
                  className={`${STYLES.bgCardAlt} ${STYLES.border} text-white h-9 sm:h-10 md:h-11 w-full max-w-[200px] text-sm sm:text-base`}
                />
              </div>

              <div>
                <Label className="text-white text-base sm:text-lg lg:text-[20px] font-display mb-2 block">
                  DPI
                </Label>
                <Input
                  type="number"
                  min={72}
                  value={dpiStr}
                  onChange={(e) => {
                    const v = e.target.value;
                    setDpi(v === "" ? 0 : Number(v));
                  }}
                  placeholder="300"
                  className={`${STYLES.bgCardAlt} ${STYLES.border} text-white h-9 sm:h-10 md:h-11 w-full max-w-[200px] text-sm sm:text-base`}
                />
              </div>
            </div>
          </div>

          <div className={`border ${STYLES.border} p-4 sm:p-6`}>
            <h2 className="text-xl sm:text-2xl lg:text-[28px] font-bold text-white font-display mb-4 sm:mb-6">
              Adjust Colours
            </h2>
            <div className="space-y-4">
              {colors.map((colorOption) => (
                <ColorSwatch
                  key={colorOption.id}
                  colorOption={colorOption}
                  onColorChange={(hex) => setColor(colorOption.id, hex)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
