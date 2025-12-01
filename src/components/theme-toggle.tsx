"use client"

import { useTheme } from "next-themes"
import { IconMoon, IconSun } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="w-full justify-start"
    >
      {theme === "dark" ? <IconSun className="mr-2 h-4 w-4" /> : <IconMoon className="mr-2 h-4 w-4" />}
      <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
    </Button>
  )
}
