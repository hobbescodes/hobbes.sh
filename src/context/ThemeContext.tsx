import { useRouter } from "@tanstack/react-router";
import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { setColorscheme as setColorschemeServerFn } from "@/server/functions/theme";

import type { PropsWithChildren } from "react";
import type { Colorscheme } from "@/types";

const DEFAULT_DARK_COLORSCHEME: Colorscheme = "ghostty";
const DEFAULT_LIGHT_COLORSCHEME: Colorscheme = "latte";

interface ThemeContextValue {
  /** The current colorscheme (ghostty, mocha, macchiato, frappe, latte) */
  colorscheme: Colorscheme;
  /** Set a specific colorscheme */
  setColorscheme: (colorscheme: Colorscheme) => void;
  /** Whether current colorscheme is dark */
  isDark: boolean;
  /** Toggle between default light (latte) and default dark (ghostty) */
  toggleLightDark: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

/**
 * Check if a colorscheme is dark
 */
function isDarkColorscheme(colorscheme: Colorscheme): boolean {
  return colorscheme !== "latte";
}

/**
 * Apply colorscheme class to document element
 */
function applyColorschemeClass(colorscheme: Colorscheme) {
  if (typeof document === "undefined") return;

  const html = document.documentElement;
  // Remove all colorscheme classes
  html.classList.remove("latte", "frappe", "macchiato", "mocha", "ghostty");
  // Add the new colorscheme class
  html.classList.add(colorscheme);
}

const ThemeProvider = ({
  children,
  colorscheme: ssrColorscheme,
}: PropsWithChildren<{ colorscheme: Colorscheme }>) => {
  const router = useRouter();

  // Initialize colorscheme from SSR
  const [colorscheme, setColorschemeState] =
    useState<Colorscheme>(ssrColorscheme);

  const isDark = useMemo(() => isDarkColorscheme(colorscheme), [colorscheme]);

  // Apply colorscheme class on mount and when it changes
  useEffect(() => {
    applyColorschemeClass(colorscheme);
  }, [colorscheme]);

  const setColorscheme = useCallback(
    async (newColorscheme: Colorscheme) => {
      // Update state immediately for responsive UI
      setColorschemeState(newColorscheme);

      // Sync cookie for SSR
      await setColorschemeServerFn({ data: newColorscheme });
      router.invalidate();
    },
    [router],
  );

  const toggleLightDark = useCallback(() => {
    const newColorscheme = isDark
      ? DEFAULT_LIGHT_COLORSCHEME
      : DEFAULT_DARK_COLORSCHEME;
    setColorscheme(newColorscheme);
  }, [isDark, setColorscheme]);

  // Listen for colorscheme-set event from NavigationContext (commands)
  useEffect(() => {
    const handleColorschemeSet = (e: CustomEvent<Colorscheme>) => {
      setColorscheme(e.detail);
    };

    window.addEventListener(
      "colorscheme-set",
      handleColorschemeSet as EventListener,
    );
    return () =>
      window.removeEventListener(
        "colorscheme-set",
        handleColorschemeSet as EventListener,
      );
  }, [setColorscheme]);

  return (
    <ThemeContext
      value={{ colorscheme, setColorscheme, isDark, toggleLightDark }}
    >
      {children}
    </ThemeContext>
  );
};

export const useTheme = () => {
  const val = use(ThemeContext);
  if (!val) throw new Error("`useTheme` called outside of `<ThemeProvider />`");
  return val;
};

export default ThemeProvider;
