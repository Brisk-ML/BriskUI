/**
 * Shared design token colors for consistency across the app.
 * Use COLORS for inline styles; use STYLES for Tailwind className (literal strings required for build).
 */
export const COLORS = {
  primary: "#006b4c",
  primaryLight: "#00a878",
  border: "#404040",
  borderSecondary: "#363636",
  bgDark: "#121212",
  bgCard: "#181818",
  bgCardAlt: "#282828",
  bgHover: "#383838",
  borderHover: "#606060",
  accent: "#1175d5",
  destructive: "#ff3d29",
  bgTertiary: "#1a1a1a",
} as const;

/**
 * Tailwind-compatible class strings. Use in className; must be literals for Tailwind to detect.
 */
export const STYLES = {
  bgDark: "bg-[#121212]",
  bgCard: "bg-[#181818]",
  bgCardAlt: "bg-[#282828]",
  bgTertiary: "bg-[#1a1a1a]",
  hoverBgTertiary: "hover:bg-[#1a1a1a]",
  bgHover: "hover:bg-[#383838]",
  hoverBgCardAlt: "hover:bg-[#282828]",
  bgPrimary: "bg-[#006b4c]",
  bgPrimaryLight: "bg-[#00a878]",
  border: "border-[#404040]",
  borderSecondary: "border-[#363636]",
  borderHover: "hover:border-[#606060]",
  hoverBorder: "hover:border-[#404040]",
  hoverBgCard: "hover:bg-[#181818]",
  borderPrimaryLight: "border-[#00a878]",
  dataCheckedBgPrimaryLight: "data-[state=checked]:bg-[#00a878]",
  dataCheckedBorderPrimaryLight: "data-[state=checked]:border-[#00a878]",
  ringOffset: "ring-offset-[#181818]",
} as const;
