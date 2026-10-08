'use client'

import React from 'react'
import { MonitorPlay, LayoutGrid, Image as ImageIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import { WatermarkPreviewProps } from '@/types/components/features'

export const WatermarkPreview = ({
  watermarkType,
  position,
  opacity,
  scale,
  rotation,
  padding,
  blendMode,
  tiling,
  text,
  textStyle,
  fontWeight,
  isItalic,
  isUnderline,
  textColor,
  fontFamily,
  selectedImage,
}: WatermarkPreviewProps) => {
  const { t } = useTranslation()

  const overlayStyle = {
    opacity: opacity[0] / 100,
    transform: `scale(${scale[0] / 50}) rotate(${rotation[0]}deg)`,
    mixBlendMode: blendMode as React.CSSProperties['mixBlendMode'],
  }

  const getPositionalStyle = () => {
    const p = padding[0] * 2; // Scale for preview
    const style: React.CSSProperties = {};

    if (position.includes('top')) style.top = p;
    else if (position.includes('bottom')) style.bottom = p;
    else style.top = '50%';

    if (position.includes('left')) style.left = p;
    else if (position.includes('right')) style.right = p;
    else style.left = '50%';

    if (position === 'center') {
      style.transform = 'translate(-50%, -50%)';
    } else if (!position.includes('-')) { // top, bottom, left, right (single values)
      if (position === 'top' || position === 'bottom') style.left = '50%';
      if (position === 'left' || position === 'right') style.top = '50%';
    }

    return style;
  }

  const getTextStyleClasses = () => {
    let classes = ''

    switch (fontFamily) {
      case 'serif': classes += ' font-serif'; break;
      case 'mono': classes += ' font-mono'; break;
      case 'outfit': classes += ' font-outfit'; break;
      case 'poppins': classes += ' font-poppins'; break;
      case 'montserrat': classes += ' font-montserrat'; break;
      default: classes += ' font-sans'; break;
    }

    switch (fontWeight) {
      case 'normal': classes += ' font-normal'; break;
      case 'medium': classes += ' font-medium'; break;
      case 'semibold': classes += ' font-semibold'; break;
      case 'black': classes += ' font-black'; break;
      case 'bold':
      default: classes += ' font-bold'; break;
    }

    if (isItalic) classes += ' italic';
    if (isUnderline) classes += ' underline underline-offset-4';

    // const isGradient = ['sunset', 'ocean', 'neon', 'gold', 'rose'].includes(textColor);

    switch (textColor) {
      case 'dark': classes += ' text-slate-900'; break;
      case 'system': classes += ' text-primary'; break;
      case 'emerald': classes += ' text-emerald-500'; break;
      case 'amber': classes += ' text-amber-500'; break;
      case 'violet': classes += ' text-violet-500'; break;
      case 'cyan': classes += ' text-cyan-500'; break;
      case 'sunset': classes += ' text-transparent bg-clip-text bg-gradient-to-tr from-[var(--watermark-sunset-start)] to-[var(--watermark-sunset-end)]'; break;
      case 'ocean': classes += ' text-transparent bg-clip-text bg-gradient-to-tr from-[var(--watermark-ocean-start)] to-[var(--watermark-ocean-end)]'; break;
      case 'neon': classes += ' text-transparent bg-clip-text bg-gradient-to-tr from-[var(--watermark-neon-start)] to-[var(--watermark-neon-end)]'; break;
      case 'gold': classes += ' text-transparent bg-clip-text bg-gradient-to-tr from-[var(--watermark-gold-start)] to-[var(--watermark-gold-end)]'; break;
      case 'rose': classes += ' text-transparent bg-clip-text bg-gradient-to-tr from-[var(--watermark-rose-start)] to-[var(--watermark-rose-end)]'; break;
      case 'white':
      default: classes += ' text-white'; break;
    }

    if (textStyle === 'outline') {
      classes += ' [-webkit-text-stroke:1px_rgba(0,0,0,0.5)] dark:[-webkit-text-stroke:1px_rgba(255,255,255,0.3)]';
    } else if (textStyle !== 'glass') {
      classes += ' drop-shadow-md';
    }

    return classes
  }

  const watermarkContent =
    watermarkType === 'text' ? (
      <div className={cn(
        "flex items-center justify-center transition-all duration-300",
        textStyle === 'glass' && "backdrop-blur-md bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 p-4 rounded-xl shadow-[0_8px_32px_0_rgba(0,0,0,0.1)]"
      )}>
        <span className={cn("leading-none", getTextStyleClasses())}>{text || t('preview', { defaultValue: 'Preview' })}</span>
      </div>
    ) : selectedImage ? (
      <Image
        src={process.env.NEXT_PUBLIC_STORAGE_URL + '/' + selectedImage}
        alt="watermark"
        width={500}
        height={500}
        unoptimized
        className="w-16 h-16 object-contain drop-shadow-md"
      />
    ) : (
      <ImageIcon className="w-16 h-16 drop-shadow-md" />
    )

  return (
    <div className="lg:col-span-6 flex flex-col h-[400px] sm:h-[500px] lg:h-[700px]">
      <div className="glass-card rounded-border-radius flex flex-col h-full overflow-hidden border border-glass-border/50 relative group/preview">
        {/* Cinematic Header Overlay */}
        <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-black/60 to-transparent z-20 pointer-events-none" />

        {/* Floating Toolbar inside canvas */}
        <div className="absolute top-6 left-6 right-6 z-30 flex flex-wrap gap-4 items-center justify-between pointer-events-none">
          <div className="flex items-center gap-3 bg-black/40 backdrop-blur-xl px-4 py-2 rounded-2xl border border-white/10 shadow-2xl">
            <div className="relative">
              <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
              <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-primary animate-ping" />
            </div>
            <span className="text-[11px] font-bold text-white uppercase tracking-[0.1em]">
              {t('live_render', { defaultValue: 'Live Render' })}
            </span>
          </div>

          <div className="bg-black/40 backdrop-blur-xl px-4 py-2 rounded-2xl border border-white/10 shadow-2xl flex items-center gap-2">
            <LayoutGrid className="w-3.5 h-3.5 text-primary" />
            <span className="text-[10px] font-black text-white/90 uppercase tracking-widest">
              {t(position, { defaultValue: position.replace('-', ' ') })}
            </span>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 bg-[#0f172a] relative overflow-hidden group">
          {/* Main Cinematic Background */}
          <div
            className="absolute inset-0 scale-105 group-hover:scale-100 transition-transform duration-[2s] ease-out"
            style={{
              backgroundImage: `url('/images/watermark-preview-bg.png')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />

          {/* Darkening Overlay */}
          <div className="absolute inset-0 bg-black/30" />

          {/* Mockup Frame */}
          <div className="absolute inset-6 sm:inset-10 border border-glass-border rounded-border-radius overflow-hidden bg-black/10 backdrop-blur-[2px] shadow-2xl flex items-center justify-center">

            {/* Corner Accents */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-primary/40 rounded-tl-lg" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-primary/40 rounded-tr-lg" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-primary/40 rounded-bl-lg" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-primary/40 rounded-br-lg" />

            {/* Placeholder Text */}
            {!tiling && (
              <div className="text-center opacity-30 pointer-events-none z-10 scale-90 sm:scale-100">
                <MonitorPlay className="w-16 h-16 mx-auto mb-4 text-white" />
                <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">
                  {t('visual_viewport', { defaultValue: 'Visual Viewport' })}
                </h3>
                <p className="text-xs text-white/70 max-w-[240px] mx-auto font-medium">
                  {t('preview_area_desc', {
                    defaultValue: 'Real-time simulation of watermark placement, scale, and blending.',
                  })}
                </p>
              </div>
            )}

            {/* Watermark layers */}
            <div className="absolute inset-0 z-20 overflow-hidden">
              {tiling ? (
                <div className="absolute inset-0 flex flex-wrap gap-8 items-center justify-center p-8 overflow-hidden pointer-events-none">
                  {Array.from({ length: 30 }).map((_, i) => (
                    <div key={i} className="whitespace-nowrap" style={overlayStyle}>
                      {watermarkContent}
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  className="absolute transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] flex pointer-events-none"
                  style={getPositionalStyle()}
                >
                  <div
                    className={cn(
                      'flex items-center justify-center transition-all duration-300',
                      watermarkType === 'text' ? 'text-4xl' : 'text-5xl',
                    )}
                    style={overlayStyle}
                  >
                    {watermarkContent}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Badge */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
            <div className="bg-white/30 backdrop-blur-3xl text-white! border border-white/50 px-4 py-1.5 rounded-full shadow-2xl flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-white" />
              <span className="text-[14px] font-black text-white">
                Verified Protection Active
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
