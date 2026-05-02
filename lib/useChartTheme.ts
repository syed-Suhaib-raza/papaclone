"use client"

import { useTheme } from "next-themes"

type ChartTheme = {
  border: string
  mutedForeground: string
  cardBg: string
  foreground: string
  primary: string
  chart2: string  // blue — for a second series
  chart3: string  // amber — for ratings
}

const LIGHT: ChartTheme = {
  border: "oklch(0.92 0.004 286.32)",
  mutedForeground: "oklch(0.552 0.016 285.938)",
  cardBg: "oklch(1 0 0)",
  foreground: "oklch(0.141 0.005 285.823)",
  primary: "oklch(0.586 0.253 17.585)",
  chart2: "oklch(0.55 0.18 250)",
  chart3: "oklch(0.75 0.16 85)",
}

const DARK: ChartTheme = {
  border: "oklch(1 0 0 / 10%)",
  mutedForeground: "oklch(0.705 0.015 286.067)",
  cardBg: "oklch(0.21 0.006 285.885)",
  foreground: "oklch(0.985 0 0)",
  primary: "oklch(0.645 0.246 16.439)",
  chart2: "oklch(0.65 0.18 250)",
  chart3: "oklch(0.82 0.16 85)",
}

export function useChartTheme(): ChartTheme {
  const { resolvedTheme } = useTheme()
  return resolvedTheme === "dark" ? DARK : LIGHT
}
