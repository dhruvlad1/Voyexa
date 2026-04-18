import React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`fixed right-4 bottom-4 sm:right-6 sm:bottom-6 z-[70] inline-flex h-11 w-11 items-center justify-center rounded-full border backdrop-blur-md transition-colors ${
        isDark
          ? "border-white/20 bg-slate-900/70 text-slate-100 hover:bg-slate-800/80"
          : "border-blue-300 bg-blue-50/90 text-blue-800 hover:bg-blue-100"
      }`}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
