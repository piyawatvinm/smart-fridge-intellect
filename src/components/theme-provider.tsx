
"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

// Define enum for possible attribute values
type Attribute = 'class' | 'data-theme' | 'data-mode';

// Define our own interface for theme provider props based on next-themes documentation
interface ThemeProviderProps {
  defaultTheme?: string
  storageKey?: string
  enableSystem?: boolean
  disableTransitionOnChange?: boolean
  enableColorScheme?: boolean
  forcedTheme?: string
  attribute?: Attribute | Attribute[]
}

export function ThemeProvider({
  children,
  ...props
}: React.PropsWithChildren<ThemeProviderProps>) {
  return (
    <NextThemesProvider {...props}>
      {children}
    </NextThemesProvider>
  )
}
