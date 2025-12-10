import { CircleHelp, Moon, Search, Sun } from "lucide-react";

import { useNavigation } from "@/context/NavigationContext";
import { useTheme } from "@/context/ThemeContext";

import type { FC } from "react";

/**
 * Action buttons for the title bar (colorscheme, help, search)
 * Designed to be terminal-friendly and mobile-accessible
 */
export const TitleBarActions: FC = () => {
  const { colorscheme } = useTheme();
  const {
    setMode,
    setShowHelp,
    showHelp,
    setShowColorscheme,
    showColorscheme,
  } = useNavigation();

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

  const handleColorschemeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowColorscheme(!showColorscheme);
  };

  // Determine icon based on current colorscheme
  const isLight = colorscheme === "latte";

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

      {/* Theme button */}
      <button
        type="button"
        onClick={handleColorschemeClick}
        className={buttonClass}
        style={{ color: "var(--subtext0)" }}
        title="Theme (or :theme)"
        aria-label="Open theme picker"
      >
        {isLight ? <Sun size={16} /> : <Moon size={16} />}
      </button>
    </div>
  );
};
