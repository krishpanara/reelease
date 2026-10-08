import { Card } from '@/components/ui/card'
import { ShieldCheck } from 'lucide-react'
import { SecurityCenterCardProps } from '@/types/components/profile'
import { useTranslation } from 'react-i18next'

export const SecurityCenterCard = ({ securityCenterConfig }: SecurityCenterCardProps) => {
  const { t } = useTranslation()

  return (
    <Card className="xl:col-span-12 border-glass-border glass-card bg-white dark:bg-slate-900/30 rounded-border-radius p-5 sm:p-6">
      <div className="flex items-center justify-between border-b border-glass-border pb-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-100/50 dark:border-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-title-color dark:text-white tracking-tight">
              {t('security_center', { defaultValue: 'Security Center' })}
            </h3>
            <p className="text-base    text-subtitle-color  font-medium mt-0.5">
              {t('security_center_desc', { defaultValue: 'Your account security status.' })}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {securityCenterConfig.map((sec) => {
          const SecIcon = sec.icon
          return (
            <div
              key={sec.key}
              className="bg-subcard dark:bg-white/3 border border-glass-border rounded-border-radius-inner p-4 flex items-start gap-4 transition-all duration-300 hover:border-primary/20"
            >
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border ${sec.colorClass}`}>
                <SecIcon className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <span className="text-xs text-subtitle-color  font-extrabold block">
                  {t(sec.labelKey, { defaultValue: sec.defaultLabel })}
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-base font-extrabold text-title-color dark:text-white">
                    {t(sec.statusKey, { defaultValue: sec.defaultStatus })}
                  </span>
                </div>
                <span className="text-xs text-subtitle-color  block font-normal font-sans">
                  {t(sec.descKey, { defaultValue: sec.defaultDesc })}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
