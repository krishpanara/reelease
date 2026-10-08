import { ShieldCheck } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const FooterInfo = () => {
  const { t } = useTranslation()

  return (
    <div className="w-full rounded-border-radius bg-primary/10 border border-glass-border dark:border-white/10 p-4 flex flex-col sm:flex-row items-center justify-between gap-4 backdrop-blur-md transition-colors mt-6">
      <div className="flex items-center gap-3 text-left">
        <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0 border border-primary/20">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-primary mb-0.5">
            {t('secure_private')}
          </h4>
          <p className="text-xs text-primary font-medium">
            {t('secure_private_desc')}
          </p>
        </div>
      </div>
    </div>
  )
}

export default FooterInfo
