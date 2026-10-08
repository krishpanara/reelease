'use client'

import { CustomTooltip } from '@/components/reusable/CustomTooltip'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getAiFeaturesList } from '@/data/plan'
import { cn } from '@/lib/utils'
import { AdminPlanCardProps, Plan } from '@/types'
import { BookImage, CreditCard, FilePlay, Film, Image, Info, Layout, Pencil, Sparkles, Star, Trash2, Video, Zap } from 'lucide-react'
import { useTranslation } from 'react-i18next'



const AdminPlanCard = ({ plan, onEdit, onDelete }: AdminPlanCardProps) => {
  const { t } = useTranslation()
  const aiFeaturesList = getAiFeaturesList(t)


  const currencySymbol = plan.currency === 'INR' ? '₹' : plan.currency === 'EUR' ? '€' : plan.currency === 'GBP' ? '£' : '$'

  const isActive = plan.status === 'active' || plan.is_active

  return (
    <div className="group relative h-full flex flex-col bg-white/3 border dark:border-white/10 border-black/10  rounded-border-radius overflow-hidden transition-all duration-500 ">
      {/* Background decoration */}
      {/* Recommended Ribbon */}
      {(plan.is_featured || plan.is_default) && (
        <div className="absolute top-6 right-[-35px] rtl:right-auto rtl:left-[-35px]  rtl:-rotate-45 rotate-45 bg-primary px-10 py-1 shadow-lg z-20">
          <span className="text-[10px] font-bold text-white uppercase tracking-widest flex items-center gap-1">
            <Star className="w-2.5 h-2.5 fill-white" />
            {plan.is_default ? t('default') : t('popular')}
          </span>
        </div>
      )}

      {/* Main Content */}
      <div className="relative z-10 sm:p-6 p-4 flex flex-col h-full bg-white dark:bg-white/3">
        {/* Header */}
        <div className="flex items-start gap-3 mb-8">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-12 h-12 rounded-radius flex items-center justify-center transition-all duration-500 group-hover:scale-110",
                isActive ? "bg-primary/20 text-primary" : "bg-red-500/10 text-red-500"
              )}>
                <Layout className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-title-color dark:text-white leading-none mb-1 group-hover:text-primary transition-colors line-clamp-1">
                  {plan.name}
                </h3>
                <div className="flex items-center gap-2">
                  <p className="text-xs font-bold text-subtitle-color">{plan.slug}</p>
                  <Badge className={cn(
                    "rounded-full px-2 py-0.5 font-bold text-[9px] border-none flex items-center gap-1",
                    isActive ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                  )}>
                    <div className={cn("w-1 h-1 rounded-full", isActive ? "bg-green-600 animate-pulse" : "bg-red-500")} />
                    {isActive ? t('active') : t('inactive')}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Price Display */}
        <div className="sn:mb-8 mb-4 relative py-6 px-4 rounded-border-radius-inner bg-gradient-to-br from-white/[0.05] to-transparent border dark:border-white/5 border-black/10 group-hover:border-primary/20 transition-all overflow-hidden">
          <div className="absolute inset-0 bg-primary/5" />
          <div className="relative flex flex-col items-center">
            <div className="flex items-end gap-1">
              <span className="text-xl font-bold text-subtitle-color">{currencySymbol}</span>
              <span className="text-4xl font-black text-title-color dark:text-white tracking-tighter">
                {plan.amount || plan.price || 0}
              </span>
              <span className="text-sm font-semibold text-subtitle-color">/{t(plan.billing_cycle || 'monthly')}</span>
            </div>
            {plan.trial_days > 0 && (
              <div className="mt-4 flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full border border-primary/20">
                <Info className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-bold text-primary">{plan.trial_days} {t('days_free_trial')}</span>
              </div>
            )}
          </div>
        </div>

        {/* Feature Sections Wrapper */}
        <div className="space-y-8 mb-8 flex-grow">
          {/* Usage Limits */}
          <div className="space-y-4">
            <h4 className="text-base font-bold text-title-color flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" />
              {t('usage_limits')}
            </h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-border-radius-inner dark:bg-white/2 border border-glass-border bg-black/3 hover:border-primary/10 transition-colors">
                <span className="text-sm text-subtitle-color font-medium">{t('monthly_credits')}</span>
                <span className="text-sm font-bold text-title-color dark:text-white">{plan.total_credits || 0}</span>
              </div>
            </div>
          </div>

          {/* AI Capabilities Grid */}
          <div className="space-y-4">
            <h4 className="text-base font-bold text-title-color flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              {t('ai_capabilities')}
            </h4>
            <div className="grid grid-cols-5 gap-3">
              {aiFeaturesList.map((feature) => {
                const isEnabled = plan.ai_features?.[feature.key as keyof typeof plan.ai_features];
                return (
                  <CustomTooltip key={feature.key} title={feature.label}>
                    <div
                      className={cn(
                        "flex items-center justify-center aspect-square rounded-border-radius-inner border transition-all duration-300 ",
                        isEnabled
                          ? "bg-primary/5 border-primary/50"
                          : "dark:bg-white/10 bg-black/5  grayscale scale-95"
                      )}
                    >
                      <feature.icon className={cn("w-5 h-5", isEnabled ? feature.color : "text-gray-400")} />
                    </div>
                  </CustomTooltip>
                )
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-auto pt-5 border-t border-glass-border flex gap-3">
          <Button
            variant="outline"
            className="flex-1 rounded-border-radius-inner h-12 bg-white/3 dark:border-white/10 border-black/10 hover:bg-primary hover:text-white! hover:border-primary transition-all duration-300 font-bold text-xs gap-2"
            onClick={() => onEdit(plan)}
          >
            <Pencil className="w-4 h-4" />
            {t('edit_plan')}
          </Button>
          <Button
            variant="outline"
            className="w-12 h-12 rounded-border-radius-inner border-destructive/20 bg-white/3 text-destructive hover:bg-destructive hover:text-white! transition-all duration-300 flex items-center justify-center p-0!"
            onClick={() => onDelete(plan)}
          >
            <Trash2 className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export default AdminPlanCard
