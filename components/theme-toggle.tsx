"use client"

import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"
import { useEffect, useState } from "react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={() =>
              setTheme(theme === "dark" ? "light" : "dark")
            }
            className=""
          >
            {theme === "dark" ? <Moon size={16} /> : <Sun size={16} />}
          </button>
        </TooltipTrigger>
        <TooltipContent>
          {theme === "dark" ? "Light Mode" : "Dark Mode"}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}