import { useRouter } from '@tanstack/react-router'
import { createContext, use, useEffect, useCallback } from 'react'
import { setTheme as setThemeServerFn } from '@/server/functions/theme'
import type { PropsWithChildren } from 'react'
import type { Theme } from '@/server/functions/theme'

interface ThemeContextValue {
  theme: Theme
  setTheme: (val: Theme) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

const ThemeProvider = ({
  children,
  theme,
}: PropsWithChildren<{ theme: Theme }>) => {
  const router = useRouter()

  const setTheme = useCallback(
    (val: Theme) => setThemeServerFn({ data: val }).then(() => router.invalidate()),
    [router]
  )

  const toggleTheme = useCallback(
    () => setTheme(theme === 'dark' ? 'light' : 'dark'),
    [theme, setTheme]
  )

  // Listen for flashbang event from NavigationContext
  useEffect(() => {
    const handleFlashbang = () => toggleTheme()
    window.addEventListener('flashbang-toggle', handleFlashbang)
    return () => window.removeEventListener('flashbang-toggle', handleFlashbang)
  }, [toggleTheme])

  return (
    <ThemeContext value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext>
  )
}

export const useTheme = () => {
  const val = use(ThemeContext)
  if (!val) throw new Error('`useTheme` called outside of `<ThemeProvider />`')
  return val
}

export default ThemeProvider
