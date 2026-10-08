'use client'

import { useState } from "react"
import StripeSettings from "./StripeSettings"
import RazorpaySettings from "./RazorpaySettings"
import PayPalSettings from "./PayPalSettings"
import PaymentGatewayHeader from "./PaymentGatewayHeader"
import { useGetGatewaysQuery } from "@/redux/api/paymentGatewayApi"
import { useTranslation } from "react-i18next"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/reusable/PageHeader"
import { CreditCard } from "lucide-react"
import { gateways } from "@/data/paymentGateway"
import { GatewayId } from "@/types/components/features"


const PaymentGatewayContainer = () => {
  const { t } = useTranslation()

  const [activeGateway, setActiveGateway] = useState<GatewayId>("stripe")
  const { refetch, isFetching } = useGetGatewaysQuery()

  const handleRefresh = () => {
    refetch()
  }

  return (
    <div className="space-y-6">
      {/* <PaymentGatewayHeader onRefresh={handleRefresh} isLoading={isFetching} /> */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div className="flex items-center gap-4">
          <PageHeader
            icon={<CreditCard className="w-6 h-6 text-primary animate-pulse" />}
            title={t('gateway_title', { defaultValue: 'Payment Setup' })}
            subtitle={t('gateway_desc', {
              defaultValue:
                'Configure and manage payment gateways, API credentials, and transaction settings for your platform.',
            })}
            showBackButton={false}
          />
        </div>
      </div>

      <div className=" glass-card rounded-border-radius overflow-hidden transition-all duration-500 dark:bg-white/3 bg-white">
        <div className="sm:px-6 px-4 pt-6 pb-4 border-b border-glass-border">
          <p className="text-sm font-bold text-muted-foreground mb-4 px-1">
            {t('payment_provider', { defaultValue: 'Select Payment Provider' })}
          </p>
          <div className="flex flex-wrap w-fit gap-2.5">
            {gateways.map((gw) => {
              const isActive = activeGateway === gw.id
              return (
                <Button
                  key={gw.id}
                  onClick={() => setActiveGateway(gw.id)}
                  className={cn(
                    'group relative w-full sm:w-auto flex items-center gap-3 p-button-padding rounded-radius h-11 border text-sm font-semibold transition-all duration-300 cursor-pointer',
                    isActive
                      ? 'border-primary bg-primary/5 text-primary! shadow-[0_0_15px_rgba(var(--primary-rgb),0.1)]'
                      : 'border-glass-border text-muted-foreground dark:text-white/50 hover:border-primary/50 hover:bg-primary/5 bg-transparent',
                  )}
                >
                  <div className={cn('transition-transform duration-300', isActive && 'scale-110')}>{gw.icon}</div>
                  <span>{gw.name}</span>
                </Button>
              )
            })}
          </div>
        </div>

        <div className="sm:px-6 px-4 py-4">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {activeGateway === 'stripe' && <StripeSettings />}
            {activeGateway === 'razorpay' && <RazorpaySettings />}
            {activeGateway === 'paypal' && <PayPalSettings />}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PaymentGatewayContainer
