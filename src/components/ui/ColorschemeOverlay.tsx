import { useCallback, useEffect, useState } from "react";

import { useTheme } from "@/context/ThemeContext";
import { COLORSCHEMES, COLORSCHEME_META } from "@/types";

import type { FC } from "react";
import type { Colorscheme } from "@/types";

interface ColorschemeOverlayProps {
  onClose: () => void;
}

export const ColorschemeOverlay: FC<ColorschemeOverlayProps> = ({
  onClose,
}) => {
  const { colorscheme: currentColorscheme, setColorscheme } = useTheme();

  // Find the index of the current colorscheme
  const currentIndex = COLORSCHEMES.indexOf(currentColorscheme);
  const [selectedIndex, setSelectedIndex] = useState(
    currentIndex >= 0 ? currentIndex : 0,
  );

  const handleSelect = useCallback(
    (colorscheme: Colorscheme) => {
      setColorscheme(colorscheme);
      onClose();
    },
    [setColorscheme, onClose],
  );

  // Keyboard navigation - use capture phase to intercept before NavigationContext
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Stop propagation for all keys we handle to prevent NavigationContext from receiving them
      switch (e.key) {
        case "j":
        case "ArrowDown":
          e.preventDefault();
          e.stopPropagation();
          setSelectedIndex((prev) =>
            prev < COLORSCHEMES.length - 1 ? prev + 1 : prev,
          );
          break;
        case "k":
        case "ArrowUp":
          e.preventDefault();
          e.stopPropagation();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
          break;
        case "Enter":
          e.preventDefault();
          e.stopPropagation();
          handleSelect(COLORSCHEMES[selectedIndex]);
          break;
        case "Escape":
          e.preventDefault();
          e.stopPropagation();
          onClose();
          break;
        default:
          // Stop propagation for any other keys to prevent navigation
          e.stopPropagation();
          break;
      }
    };

    // Use capture phase to intercept events before they bubble to NavigationContext
    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [selectedIndex, handleSelect, onClose]);

  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(17, 17, 27, 0.85)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-lg"
        style={{
          backgroundColor: "var(--base)",
          border: "1px solid var(--surface0)",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="px-4 py-3 text-center font-bold"
          style={{
            backgroundColor: "var(--surface0)",
            color: "var(--text)",
            borderBottom: "1px solid var(--surface1)",
          }}
        >
          Colorschemes
        </div>

        {/* Options */}
        <div className="p-2">
          {COLORSCHEMES.map((scheme, index) => {
            const meta = COLORSCHEME_META[scheme];
            const isSelected = index === selectedIndex;
            const isCurrent = scheme === currentColorscheme;

            return (
              <button
                key={scheme}
                type="button"
                className="flex w-full cursor-pointer items-center gap-3 rounded px-3 py-2 text-left text-sm"
                style={{
                  backgroundColor: isSelected
                    ? "var(--surface1)"
                    : "transparent",
                  color: isSelected ? "var(--text)" : "var(--subtext0)",
                }}
                onClick={() => handleSelect(scheme)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                {/* Selection indicator */}
                <span
                  className="w-4 font-bold"
                  style={{
                    color: isSelected ? "var(--blue)" : "transparent",
                  }}
                >
                  {">"}
                </span>

                {/* Color swatch */}
                <span
                  className="h-4 w-4 rounded"
                  style={{
                    backgroundColor: meta.background,
                    border: "1px solid var(--surface2)",
                  }}
                />

                {/* Label */}
                <span
                  className="flex-1 font-mono"
                  style={{
                    color: isSelected ? "var(--text)" : "var(--subtext0)",
                  }}
                >
                  {meta.label}
                </span>

                {/* Description */}
                <span className="text-xs" style={{ color: "var(--overlay1)" }}>
                  {meta.description}
                </span>

                {/* Current indicator */}
                {isCurrent && (
                  <span className="text-xs" style={{ color: "var(--green)" }}>
                    *
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-center gap-6 px-4 py-2 text-xs"
          style={{
            backgroundColor: "var(--surface0)",
            color: "var(--overlay1)",
            borderTop: "1px solid var(--surface1)",
          }}
        >
          <span>
            <KeyHint>j/k</KeyHint> navigate
          </span>
          <span>
            <KeyHint>Enter</KeyHint> select
          </span>
          <span>
            <KeyHint>Esc</KeyHint> close
          </span>
        </div>
      </div>
    </div>
  );
};

// Helper component for key hints
const KeyHint: FC<{ children: React.ReactNode }> = ({ children }) => (
  <span
    className="rounded px-1.5 py-0.5 font-mono text-xs"
    style={{
      backgroundColor: "var(--surface1)",
      color: "var(--blue)",
    }}
  >
    {children}
  </span>
);
