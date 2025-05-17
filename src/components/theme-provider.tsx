
"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

// Using React.PropsWithChildren with the properties from ThemeProviderProps
type ThemeProps = React.PropsWithChildren<{
  defaultTheme?: string;
  storageKey?: string;
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
  enableColorScheme?: boolean;
  forcedTheme?: string;
  attribute?: string;
}>

export function ThemeProvider({
  children,
  ...props
}: ThemeProps) {
  return (
    <NextThemesProvider {...props}>
      {children}
    </NextThemesProvider>
  )
}
