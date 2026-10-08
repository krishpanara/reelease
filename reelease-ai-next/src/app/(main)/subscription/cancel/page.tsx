'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { ROUTES } from '@/constants/routes'
import { XCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'

const SubscriptionCancelPage = () => {
  const { t } = useTranslation()
  const router = useRouter()

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-xl bg-background">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <XCircle className="h-12 w-12 text-orange-500" />
            <CardTitle className="text-xl">{t('payment_cancelled', 'Payment Cancelled')}</CardTitle>
            <p className="text-muted-foreground">
              {t('the_payment_process_was_cancelled_no_charges_were_made_to_your_account')}
            </p>
            <div className="flex gap-2 w-full">
              <Button variant="default" onClick={() => router.push(ROUTES.PLANS)} className="flex-1 h-10 primary-btn text-white!">
                {t('back_to_plans')}
              </Button>
              <Button variant="default" onClick={() => router.push(ROUTES.SUBSCRIPTIONS)} className="flex-1 text-white! primary-btn h-10">
                {t('view_subscriptions')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default SubscriptionCancelPage
