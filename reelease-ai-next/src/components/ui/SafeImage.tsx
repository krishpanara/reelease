'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'

interface SafeImageProps extends Omit<React.ComponentProps<typeof Image>, 'src'> {
  src: string | null | undefined
  fallbackName: string
  isStandardImg?: boolean
}

export default function SafeImage({ src, fallbackName, isStandardImg, ...props }: SafeImageProps) {
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    setHasError(false)
  }, [src])

  const firstLetter = fallbackName?.charAt(0)?.toUpperCase() || '?'
  const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(firstLetter)}&background=d5e9f5&color=006fc9&font-size=0.4&bold=true`

  if (isStandardImg) {
    const { fill, ...imgProps } = props as any
    return (
      <img
        {...imgProps}
        src={(!hasError && src) || fallbackUrl}
        onError={() => setHasError(true)}
      />
    )
  }

  return (
    <Image
      {...props}
      src={(!hasError && src) || fallbackUrl}
      onError={() => setHasError(true)}
    />
  )
}
