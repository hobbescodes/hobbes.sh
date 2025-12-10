import { CircleHelp, Moon, Search, Sun } from "lucide-react";

import { useNavigation } from "@/context/NavigationContext";
import { useTheme } from "@/context/ThemeContext";

import type { FC } from "react";

/**
 * Action buttons for the title bar (theme toggle, help, search)
 * Designed to be terminal-friendly and mobile-accessible
 */
export const TitleBarActions: FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { setMode, setShowHelp, showHelp } = useNavigation();

  const handleHelpClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowHelp(!showHelp);
  };

  const handleSearchClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setMode("SEARCH");
  };

  const handleThemeToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleTheme();
  };

  // Base button styles - ensures proper tap targets on mobile
  const buttonClass = `
    flex h-6 w-6 min-h-[44px] min-w-[44px] -m-2 items-center justify-center
    transition-opacity hover:opacity-80 active:opacity-60
    md:min-h-[auto] md:min-w-[auto] md:m-0
  `;

  return (
    <div className="flex items-center gap-1 md:gap-2">
      {/* Search button */}
      <button
        type="button"
        onClick={handleSearchClick}
        className={buttonClass}
        style={{ color: "var(--subtext0)" }}
        title="Search (or press /)"
        aria-label="Open search"
      >
        <Search size={16} />
      </button>

      {/* Help button */}
      <button
        type="button"
        onClick={handleHelpClick}
        className={buttonClass}
        style={{ color: "var(--subtext0)" }}
        title="Help (or press ?)"
        aria-label="Toggle help overlay"
      >
        <CircleHelp size={16} />
      </button>

      {/* Theme toggle button */}
      <button
        type="button"
        onClick={handleThemeToggle}
        className={buttonClass}
        style={{ color: "var(--subtext0)" }}
        title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      >
        {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
      </button>
    </div>
  );
};
