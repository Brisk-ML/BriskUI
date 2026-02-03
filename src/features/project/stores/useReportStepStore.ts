import { create } from "zustand";
import { COLORS } from "@/shared/constants/colors";

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

  // Actions
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
  fileFormat: "png",
  transparent: false,
  imageWidth: 8,
  imageHeight: 10,
  dpi: 300,
};

const DEFAULT_COLORS: ColorOption[] = [
  { id: "primary", name: "Primary", color: COLORS.accent },
  { id: "secondary", name: "Secondary", color: COLORS.primaryLight },
  { id: "accent", name: "Accent", color: "#ff6b6b" },
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
