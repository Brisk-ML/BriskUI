import { create } from "zustand";

/** Aligned with Brisk PlotSettings defaults for non-default detection. */
export const BRISK_PLOT_SETTINGS_DEFAULTS = {
  file_format: "png",
  transparent: false,
  width: 10,
  height: 8,
  dpi: 300,
  primary_color: "#1175D5",
  secondary_color: "#00A878",
  accent_color: "#DE6B48",
} as const;

export interface PlotSettings {
  fileFormat: string;
  transparent: boolean;
  imageWidth: number;
  imageHeight: number;
  dpi: number;
}

export interface ColorOption {
  id: string;
  name: string;
  color: string;
}

export interface ReportStepState {
  plotSettings: PlotSettings;
  colors: ColorOption[];
  loading: boolean;

  setFileFormat: (format: string) => void;
  setTransparent: (transparent: boolean) => void;
  setImageWidth: (width: number) => void;
  setImageHeight: (height: number) => void;
  setDpi: (dpi: number) => void;
  setPlotSettings: (settings: Partial<PlotSettings>) => void;
  setColor: (id: string, color: string) => void;
  addColor: (colorOption: ColorOption) => void;
  removeColor: (id: string) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

const DEFAULT_PLOT_SETTINGS: PlotSettings = {
  fileFormat: BRISK_PLOT_SETTINGS_DEFAULTS.file_format,
  transparent: BRISK_PLOT_SETTINGS_DEFAULTS.transparent,
  imageWidth: BRISK_PLOT_SETTINGS_DEFAULTS.width,
  imageHeight: BRISK_PLOT_SETTINGS_DEFAULTS.height,
  dpi: BRISK_PLOT_SETTINGS_DEFAULTS.dpi,
};

const DEFAULT_COLORS: ColorOption[] = [
  { id: "primary", name: "Primary", color: BRISK_PLOT_SETTINGS_DEFAULTS.primary_color },
  { id: "secondary", name: "Secondary", color: BRISK_PLOT_SETTINGS_DEFAULTS.secondary_color },
  { id: "accent", name: "Accent", color: BRISK_PLOT_SETTINGS_DEFAULTS.accent_color },
];

export const useReportStepStore = create<ReportStepState>((set) => ({
  plotSettings: DEFAULT_PLOT_SETTINGS,
  colors: DEFAULT_COLORS,
  loading: false,

  setFileFormat: (format) => {
    set((state) => ({
      plotSettings: { ...state.plotSettings, fileFormat: format },
    }));
  },

  setTransparent: (transparent) => {
    set((state) => ({
      plotSettings: { ...state.plotSettings, transparent },
    }));
  },

  setImageWidth: (width) => {
    set((state) => ({
      plotSettings: { ...state.plotSettings, imageWidth: width },
    }));
  },

  setImageHeight: (height) => {
    set((state) => ({
      plotSettings: { ...state.plotSettings, imageHeight: height },
    }));
  },

  setDpi: (dpi) => {
    set((state) => ({
      plotSettings: { ...state.plotSettings, dpi },
    }));
  },

  setPlotSettings: (settings) => {
    set((state) => ({
      plotSettings: { ...state.plotSettings, ...settings },
    }));
  },

  setColor: (id, color) => {
    set((state) => ({
      colors: state.colors.map((c) => (c.id === id ? { ...c, color } : c)),
    }));
  },

  addColor: (colorOption) => {
    set((state) => ({
      colors: [...state.colors, colorOption],
    }));
  },

  removeColor: (id) => {
    set((state) => ({
      colors: state.colors.filter((c) => c.id !== id),
    }));
  },

  setLoading: (loading) => {
    set({ loading });
  },

  reset: () => {
    set({
      plotSettings: DEFAULT_PLOT_SETTINGS,
      colors: DEFAULT_COLORS,
      loading: false,
    });
  },
}));
