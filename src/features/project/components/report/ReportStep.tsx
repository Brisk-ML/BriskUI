import { useState } from "react";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

interface ColorOption {
  id: string;
  name: string;
  color: string;
}

const DEFAULT_COLORS: ColorOption[] = [
  { id: "primary", name: "Primary", color: "#1175d5" },
  { id: "secondary", name: "Secondary", color: "#00a878" },
  { id: "accent", name: "Accent", color: "#ff6b6b" },
];

export function ReportStep() {
  const [fileFormat, setFileFormat] = useState("");
  const [transparent, setTransparent] = useState("");
  const [imageWidth, setImageWidth] = useState("8");
  const [imageHeight, setImageHeight] = useState("10");
  const [dpi, setDpi] = useState("300");
  const [colors, setColors] = useState<ColorOption[]>(DEFAULT_COLORS);

  const handleColorChange = (colorId: string, newColor: string) => {
    setColors(
      colors.map((c) => (c.id === colorId ? { ...c, color: newColor } : c)),
    );
  };

  return (
    <div className="w-full max-w-[900px] px-4 xl:px-0 mx-auto">
      {/* Main Container */}
      <div className="bg-[#181818] border-2 border-[#404040] p-4 sm:p-6">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-[36px] font-bold text-white font-display relative inline-block">
            Customize Report
            <div className="absolute bottom-0 left-0 w-full h-[4px] bg-white" />
          </h1>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Plot Settings */}
          <div className="border border-[#404040] p-4 sm:p-6">
            <h2 className="text-xl sm:text-2xl lg:text-[28px] font-bold text-white font-display mb-4 sm:mb-6">
              Plot Settings
            </h2>

            <div className="space-y-4">
              {/* File Format */}
              <div>
                <Label className="text-white text-base sm:text-lg lg:text-[20px] font-display mb-2 block">
                  File Format
                </Label>
                <Select value={fileFormat} onValueChange={setFileFormat}>
                  <SelectTrigger className="bg-[#282828] border-[#404040] text-white h-10 w-full max-w-[200px]">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#282828] border-[#404040]">
                    <SelectItem value="png" className="text-white">
                      PNG
                    </SelectItem>
                    <SelectItem value="svg" className="text-white">
                      SVG
                    </SelectItem>
                    <SelectItem value="pdf" className="text-white">
                      PDF
                    </SelectItem>
                    <SelectItem value="jpg" className="text-white">
                      JPG
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Transparent */}
              <div>
                <Label className="text-white text-base sm:text-lg lg:text-[20px] font-display mb-2 block">
                  Transparent
                </Label>
                <Select value={transparent} onValueChange={setTransparent}>
                  <SelectTrigger className="bg-[#282828] border-[#404040] text-white h-10 w-full max-w-[200px]">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#282828] border-[#404040]">
                    <SelectItem value="yes" className="text-white">
                      Yes
                    </SelectItem>
                    <SelectItem value="no" className="text-white">
                      No
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Image Width */}
              <div>
                <Label className="text-white text-base sm:text-lg lg:text-[20px] font-display mb-2 block">
                  Image Width
                </Label>
                <Input
                  value={imageWidth}
                  onChange={(e) => setImageWidth(e.target.value)}
                  placeholder="8"
                  className="bg-[#282828] border-[#404040] text-white h-10 w-full max-w-[200px]"
                />
              </div>

              {/* Image Height */}
              <div>
                <Label className="text-white text-base sm:text-lg lg:text-[20px] font-display mb-2 block">
                  Image Height
                </Label>
                <Input
                  value={imageHeight}
                  onChange={(e) => setImageHeight(e.target.value)}
                  placeholder="10"
                  className="bg-[#282828] border-[#404040] text-white h-10 w-full max-w-[200px]"
                />
              </div>

              {/* DPI */}
              <div>
                <Label className="text-white text-base sm:text-lg lg:text-[20px] font-display mb-2 block">
                  DPI
                </Label>
                <Input
                  value={dpi}
                  onChange={(e) => setDpi(e.target.value)}
                  placeholder="300"
                  className="bg-[#282828] border-[#404040] text-white h-10 w-full max-w-[200px]"
                />
              </div>
            </div>
          </div>

          {/* Adjust Colours */}
          <div className="border border-[#404040] p-4 sm:p-6">
            <h2 className="text-xl sm:text-2xl lg:text-[28px] font-bold text-white font-display mb-4 sm:mb-6">
              Adjust Colours
            </h2>

            <div className="space-y-4">
              {colors.map((colorOption) => (
                <div key={colorOption.id} className="flex items-center gap-4">
                  {/* Color Preview */}
                  <div
                    className="w-10 h-10 sm:w-12 sm:h-12 border border-[#404040] cursor-pointer"
                    style={{ backgroundColor: colorOption.color }}
                    onClick={() => {
                      const newColor = prompt(
                        "Enter color (hex):",
                        colorOption.color,
                      );
                      if (newColor) {
                        handleColorChange(colorOption.id, newColor);
                      }
                    }}
                  />
                  {/* Color Name */}
                  <span className="text-white text-base sm:text-lg lg:text-[20px] font-display">
                    {colorOption.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
