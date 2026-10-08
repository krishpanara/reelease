'use client'

import { ThemeProvider } from 'next-themes'
import React from 'react'

const DynamicPageLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider attribute="class" forcedTheme="dark">
      <div className="dark min-h-screen bg-black text-foreground transition-colors duration-500">
        {children}
      </div>
    </ThemeProvider>
  )
}

export default DynamicPageLayout
