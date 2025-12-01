"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { IconMoon, IconSun } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start"
        disabled
      >
        <IconMoon className="mr-2 h-4 w-4" />
        <span>Theme</span>
      </Button>
    )
  }

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
