'use client'

import type { CSSProperties } from 'react'

export function AspectRatioBox({ ratio }: { ratio: string }) {
  let style: CSSProperties = {}
  switch (ratio) {
    case '16:9':
      style = { width: '24px', height: '14px' }
      break
    case '9:16':
      style = { width: '14px', height: '24px' }
      break
    case '1:1':
      style = { width: '18px', height: '18px' }
      break
    default:
      style = { width: '18px', height: '18px' }
  }
  return (
    <div
      className="border border-current rounded-xs opacity-80 group-hover/btn:opacity-100 transition-opacity shrink-0"
      style={style}
    />
  )
}
