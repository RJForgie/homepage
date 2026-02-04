// Chart.js theme configuration for NZ Tech dashboard
// Zinc palette with sky-400 accent, monospace font

export const CHART_COLORS = {
  accent: "#38bdf8", // sky-400
  accentMuted: "rgba(56, 189, 248, 0.6)",
  zinc50: "#fafafa",
  zinc300: "#d4d4d8",
  zinc400: "#a1a1aa",
  zinc500: "#71717a",
  zinc600: "#52525b",
  zinc700: "#3f3f46",
  zinc800: "#27272a",
  zinc900: "#18181b",
  transparent: "transparent",
} as const;

// Category colors for technology charts
export const CATEGORY_COLORS: Record<string, string> = {
  language: "#38bdf8", // sky-400
  framework: "#a78bfa", // violet-400
  cloud: "#fb923c", // orange-400
  data: "#34d399", // emerald-400
  database: "#f472b6", // pink-400
  infrastructure: "#fbbf24", // amber-400
  testing: "#94a3b8", // slate-400
  other: "#71717a", // zinc-500
};

export const CATEGORY_LABELS: Record<string, string> = {
  language: "Language",
  framework: "Framework",
  cloud: "Cloud",
  data: "Data",
  database: "Database",
  infrastructure: "Infrastructure",
  testing: "Testing",
  other: "Other",
};

// Chart.js global defaults (applied client-side)
export function getChartDefaults() {
  return {
    font: {
      family:
        'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
      size: 12,
    },
    color: CHART_COLORS.zinc400,
    borderColor: CHART_COLORS.zinc700,
    backgroundColor: CHART_COLORS.transparent,
  };
}
