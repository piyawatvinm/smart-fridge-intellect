
"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
// Remove the problematic import and use React's PropsWithChildren type instead

export function ThemeProvider({ children, ...props }: React.PropsWithChildren<any>) {
  return (
    <NextThemesProvider {...props}>
      {children}
    </NextThemesProvider>
  )
}
