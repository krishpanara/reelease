import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { LivePreviewProps } from '@/types'
import { Activity, BarChart2, Sun, Moon, ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

export const LivePreview = ({
  primaryColor,
  secondaryColor,
  logoDarkUrl,
  logoLightUrl,
  sidebarLogoDarkUrl,
  sidebarLogoLightUrl,
  liveLogo,
  logoConfig
}: LivePreviewProps) => {
  const { t } = useTranslation()
  const viewport: 'desktop' | 'tablet' | 'mobile' = 'desktop'
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [imageError, setImageError] = useState(false)

  const getActiveLogo = () => {
    if (theme === 'dark') {
      if (!isSidebarOpen) {
        if (liveLogo && liveLogo.target === 'sidebar_logo') {
          return liveLogo.url
        }
        return sidebarLogoDarkUrl || logoDarkUrl
      }
      if (liveLogo && (liveLogo.target === 'logo_dark' || liveLogo.target === 'sidebar_logo')) {
        return liveLogo.url
      }
      return logoDarkUrl
    } else {
      if (!isSidebarOpen) {
        if (liveLogo && liveLogo.target === 'sidebar_light_logo') {
          return liveLogo.url
        }
        return sidebarLogoLightUrl || logoLightUrl
      }
      if (liveLogo && (liveLogo.target === 'logo_light' || liveLogo.target === 'sidebar_light_logo')) {
        return liveLogo.url
      }
      return logoLightUrl
    }
  }

  const logoUrl = getActiveLogo()

  // Reset image error state whenever logo URL changes
  useEffect(() => {
    setImageError(false)
  }, [logoUrl])

  const viewportWidths = {
    desktop: 'max-w-full',
    tablet: 'max-w-[520px]',
    mobile: 'max-w-[340px]'
  }

  return (
    <Card className="border-glass-border glass-card bg-white dark:bg-slate-900/40 rounded-border-radius overflow-hidden">
      <CardHeader className="p-4 sm:p-5 pb-3 border-b border-glass-border">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base font-bold text-slate-850 dark:text-white">
              {t('live_preview', { defaultValue: 'Live Preview' })}
            </CardTitle>
            <CardDescription className="text-xs text-subtitle-color">
              {t('live_preview_desc', { defaultValue: 'See how your brand looks across the platform.' })}
            </CardDescription>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Preview Theme selection */}
            <div className="flex items-center bg-white dark:bg-white/3 p-0.5 rounded-lg border border-glass-border">
              <Button
                type="button"
                onClick={() => setTheme('light')}
                variant="ghost"
                className={cn(
                  'p-1.5 rounded-md! transition-all cursor-pointer h-7! w-7! flex items-center justify-center',
                  theme === 'light'
                    ? 'primary-btn text-white! shadow-sm '
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-transparent!'
                )}
                title="Light Mode"
              >
                <Sun className="w-3.5 h-3.5" />
              </Button>
              <Button
                type="button"
                onClick={() => setTheme('dark')}
                variant="ghost"
                className={cn(
                  'p-1.5 rounded-md! transition-all cursor-pointer h-7! w-7! flex items-center justify-center',
                  theme === 'dark'
                    ? 'primary-btn text-white! shadow-sm '
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-transparent!'
                )}
                title="Dark Mode"
              >
                <Moon className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-5 flex items-center justify-center bg-slate-50 dark:bg-light-body min-h-[380px]">
        {/* Mock App Container */}
        <div
          className={cn(
            'w-full border rounded-xl overflow-hidden shadow-2xl transition-all duration-500 flex flex-col font-sans',
            theme === 'dark' ? 'bg-[#030712] border-glass-border' : 'bg-slate-50 border-slate-200',
            viewportWidths[viewport]
          )}
        >
          {/* Header Bar */}
          <header className={cn(
            'h-12 border-b px-4 flex items-center justify-between',
            theme === 'dark' ? 'border-white/30 bg-black' : 'border-slate-200 bg-white'
          )}>
            <div className="flex items-center gap-3">
              {/* App Logo */}
              {logoUrl && !imageError ? (
                <img
                  src={logoUrl}
                  alt="Logo"
                  className={cn("w-auto object-contain", !logoConfig && "h-8")}
                  style={logoConfig ? { height: `${Math.max(16, Math.min(64, (logoConfig.iconSize / 48) * 32))}px` } : undefined}
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="flex items-center gap-1.5">
                  <div
                    className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black text-white"
                    style={{
                      background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`
                    }}
                  >
                    R
                  </div>
                  <span className={cn(
                    'text-[11px] font-black tracking-tight',
                    theme === 'dark' ? 'text-white' : 'text-slate-900'
                  )}>
                    ReelEase AI
                  </span>
                </div>
              )}
            </div>

            {/* Mock Nav Elements */}
            <div className="flex items-center gap-3">
              {viewport === 'desktop' && (
                <div className={cn(
                  'flex items-center gap-4 text-[10px] font-bold',
                  theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                )}>
                  <span style={{ color: primaryColor }}>Dashboard</span>
                  <span>Publish</span>
                  <span>Analytics</span>
                </div>
              )}
              <div className={cn(
                'w-6 h-6 rounded-full border flex items-center justify-center',
                theme === 'dark' ? 'bg-slate-800 border-glass-border' : 'bg-slate-100 border-slate-200'
              )}>
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: primaryColor }} />
              </div>
            </div>
          </header>

          <div className="flex flex-1 min-h-[260px]">
            {/* Sidebar (Desktop only) */}
            {viewport === 'desktop' && (
              <aside
                className={cn(
                  'border-r p-3 space-y-4 transition-all duration-300 ease-in-out flex-shrink-0 relative z-10',
                  isSidebarOpen ? 'w-40' : 'w-12',
                  theme === 'dark' ? 'border-white/30 bg-black' : 'border-glass-border bg-white'
                )}
              >
                {/* Toggle Button */}
                <button
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="absolute -right-2.5 top-4 w-5 h-5 rounded-full flex items-center justify-center text-white shadow-md z-20 transition-transform hover:scale-110 cursor-pointer"
                  style={{ backgroundColor: primaryColor }}
                >
                  {isSidebarOpen ? <ChevronLeft className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                </button>

                <div className="space-y-1.5 flex flex-col items-stretch overflow-hidden">
                  {[1, 2, 3, 4, 5].map((idx) => (
                    <div
                      key={idx}
                      className={cn(
                        'h-6 rounded-md flex items-center gap-2 text-[9px] font-bold cursor-pointer transition-all whitespace-nowrap',
                        isSidebarOpen ? 'px-2' : 'px-0 justify-center',
                        idx === 1
                          ? 'bg-primary/10'
                          : (theme === 'dark' ? 'text-slate-500 hover:bg-slate-800/30' : 'text-slate-600 hover:bg-slate-200/50')
                      )}
                      style={idx === 1 ? { color: primaryColor, backgroundColor: `${primaryColor}15` } : undefined}
                      title={`Menu Item ${idx}`}
                    >
                      <div
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: idx === 1 ? primaryColor : (theme === 'dark' ? '#475569' : '#cbd5e1') }}
                      />
                      <span className={cn(
                        "transition-all duration-300",
                        isSidebarOpen ? 'opacity-100 translate-x-0 w-auto' : 'opacity-0 -translate-x-2 w-0 overflow-hidden'
                      )}>
                        Menu Item {idx}
                      </span>
                    </div>
                  ))}
                </div>
              </aside>
            )}

            {/* Dashboard Contents */}
            <main className="flex-1 p-4 sm:p-5 space-y-4 sm:space-y-5 overflow-y-auto">
              {/* Hero Banner Box */}
              <div
                className="w-full rounded-border-radius-inner p-4 sm:p-5 flex flex-col justify-end gap-2 shadow-sm relative overflow-hidden text-white"
                style={{
                  background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor || primaryColor})`
                }}
              >
                <div className="absolute inset-0 bg-black/10" />
                <div className="relative z-10 space-y-1">
                  <h4 className="text-sm sm:text-base font-black tracking-tight leading-none">
                    Welcome to Dashboard
                  </h4>
                  <p className="text-[10px] sm:text-xs text-white/90 font-medium max-w-[220px]">
                    Track your performance and manage your content all in one place.
                  </p>
                  <div
                    className="mt-3 inline-flex items-center justify-center px-4 py-1.5 bg-white rounded-md text-[10px] font-bold cursor-pointer transition-opacity hover:opacity-90 shadow-sm"
                    style={{ color: primaryColor }}
                  >
                    Create Post
                  </div>
                </div>
              </div>

              {/* Real Data Cards Row */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {/* Card 1: Workspace Image Card */}
                <div className={cn(
                  "p-3 rounded-border-radius-inner border flex flex-col gap-2.5 shadow-sm",
                  theme === 'dark' ? 'border-white/5 bg-white/3' : 'border-glass-border bg-white'
                )}>
                  <div className={cn(
                    "w-full h-20 sm:h-24 rounded-border-radius-inner flex items-center border justify-center overflow-hidden relative",
                    theme === 'dark' ? 'bg-white/3 ' : 'bg-slate-100'
                  )}>
                    <div className="absolute inset-0 bg-center bg-cover transition-transform duration-500 hover:scale-105" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=600&q=80")' }} />
                  </div>
                  <div>
                    <h5 className={cn("text-[10px] sm:text-xs font-bold leading-tight mb-0.5", theme === 'dark' ? 'text-white' : 'text-slate-900')}>
                      Workspace Setup
                    </h5>
                    <p className={cn("text-[9px] leading-snug", theme === 'dark' ? 'text-slate-400' : 'text-slate-500')}>
                      Complete your profile to get started.
                    </p>
                  </div>
                  <div className="w-full py-1.5 rounded-md mt-auto text-center text-white text-[10px] font-bold transition-opacity hover:opacity-90 cursor-pointer" style={{ backgroundColor: primaryColor }}>
                    Continue
                  </div>
                </div>

                {/* Card 2: Analytics Chart Card */}
                <div className={cn(
                  "p-3 rounded-border-radius-inner border flex flex-col gap-2.5 shadow-sm",
                  theme === 'dark' ? 'border-white/5 bg-black' : 'border-glass-border bg-white'
                )}>
                  <div className={cn(
                    "w-full h-20 sm:h-24 rounded-border-radius-inner border flex flex-col items-center justify-center gap-1.5",
                    theme === 'dark' ? 'bg-white/3 border-white/5' : 'bg-slate-50'
                  )}>
                    <BarChart2 className="w-6 h-6 sm:w-7 sm:h-7" style={{ color: primaryColor }} />
                    <div className="text-center">
                      <div className={cn("text-sm sm:text-lg font-black leading-none", theme === 'dark' ? 'text-white' : 'text-slate-900')}>
                        84.5K
                      </div>
                      <div className={cn("text-[8px] sm:text-[9px] font-bold uppercase mt-1", theme === 'dark' ? 'text-slate-500' : 'text-slate-400')}>
                        Total Reach
                      </div>
                    </div>
                  </div>
                  <div>
                    <h5 className={cn("text-[10px] sm:text-xs font-bold leading-tight mb-0.5", theme === 'dark' ? 'text-white' : 'text-slate-900')}>
                      Analytics
                    </h5>
                    <p className={cn("text-[9px] leading-snug", theme === 'dark' ? 'text-slate-400' : 'text-slate-500')}>
                      Your reach is up 12% this week.
                    </p>
                  </div>
                  <div className="w-full py-1.5 rounded-md mt-auto text-center text-white text-[10px] font-bold transition-opacity hover:opacity-90 cursor-pointer" style={{ backgroundColor: primaryColor }}>
                    View Report
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
