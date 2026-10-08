'use client'

import { motion } from 'framer-motion'
import { Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function PricingCard({ plan, billingCycle, y, rotateY, rotateZ, scale, opacity, t, onPlanClick }: any) {
  return (
    <motion.div
      style={{ y, rotateY, rotateZ, scale, opacity }}
      className={cn(
        'relative sm:p-8 p-4 rounded-border-radius border backdrop-blur-2xl flex flex-col group overflow-hidden',
        plan.isPopular
          ? 'border-primary/40 shadow-[0_20px_50px_rgba(147,197,253,0.1)] z-10 bg-gradient-to-b from-primary/10 via-transparent to-transparent'
          : 'border-white/10 hover:border-white/20 bg-white/[0.02] hover:bg-gradient-to-b hover:from-white/[0.05] hover:to-transparent'
      )}
    >
      <div className={cn(
        "absolute -top-24 -right-24 w-48 h-48 rounded-full blur-[80px] opacity-20 -z-10",
        plan.id === 'starter' ? "bg-blue-400" : plan.id === 'pro' ? "bg-primary" : "bg-purple-400"
      )} />
      <div className="mb-6 flex items-center gap-3">
        <div className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br",
          plan.color
        )}>
          <plan.icon className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-primary bg-[length:200%_auto] animate-gradient uppercase tracking-wider">{t(plan.name)}</h3>
      </div>

      <p className="text-white/50 text-sm mb-8 leading-relaxed">
        {t(plan.description)}
      </p>

      <div className="mb-8 flex items-baseline gap-1">
        <span className="text-4xl font-bold text-white">${plan.price[billingCycle]}</span>
        <span className="text-white/30 text-sm">/{billingCycle === 'monthly' ? t('mo') : t('yr')}</span>
      </div>

      <div className="space-y-4 mb-10 flex-1">
        {plan.features.map((feature: { name: string; included: boolean }) => (
          <div key={feature.name} className={cn(
            "flex items-center gap-3 text-sm transition-colors",
            feature.included ? "text-white/80" : "text-white/60"
          )}>
            <div className={cn(
              "w-5 h-5 rounded-full flex items-center justify-center shrink-0 border",
              feature.included
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                : "bg-red-500/10 border-red-500/20 text-red-400"
            )}>
              {feature.included ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
            </div>
            <span>{t(feature.name)}</span>
          </div>
        ))}
      </div>

      <Button
        onClick={() => onPlanClick()}
        variant={plan.isPopular ? 'default' : 'outline'}
        className={cn(
          'w-full h-12 rounded-xl font-bold text-sm transition-all duration-300',
          plan.isPopular
            ? 'primary-btn text-white! hover:scale-[1.02] shadow-xl'
            : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
        )}
      >
        {t('get_started')}
      </Button>
    </motion.div>
  )
}
