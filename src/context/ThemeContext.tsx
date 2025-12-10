import { useRouter } from "@tanstack/react-router";
import { createContext, use, useCallback, useEffect } from "react";

import { setTheme as setThemeServerFn } from "@/server/functions/theme";

import type { PropsWithChildren } from "react";
import type { Theme } from "@/server/functions/theme";

interface ThemeContextValue {
  theme: Theme;
  setTheme: (val: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const ThemeProvider = ({
  children,
  theme,
}: PropsWithChildren<{ theme: Theme }>) => {
  const router = useRouter();

  const setTheme = useCallback(
    (val: Theme) =>
      setThemeServerFn({ data: val }).then(() => router.invalidate()),
    [router],
  );

  const toggleTheme = useCallback(
    () => setTheme(theme === "dark" ? "light" : "dark"),
    [theme, setTheme],
  );

  // Listen for theme-set event from NavigationContext (easter egg commands)
  useEffect(() => {
    const handleThemeSet = (e: CustomEvent<Theme>) => setTheme(e.detail);
    window.addEventListener("theme-set", handleThemeSet as EventListener);
    return () =>
      window.removeEventListener("theme-set", handleThemeSet as EventListener);
  }, [setTheme]);

  return (
    <ThemeContext value={{ theme, setTheme, toggleTheme }}>
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
