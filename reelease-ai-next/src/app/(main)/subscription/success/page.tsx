'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ROUTES } from '@/constants/routes'
import { useConfirmSubscriptionMutation } from '@/redux/api/subscriptionApi'
import { CheckCircle2, Loader2, XCircle } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

export default function SubscriptionSuccessPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [confirmSubscription, { isLoading }] = useConfirmSubscriptionMutation()
  const [isVerified, setIsVerified] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const hasConfirmed = useRef(false)

  const sessionId = searchParams.get('session_id')
  const paypalSubId = searchParams.get('subscription_id')
  const razorpayPaymentId = searchParams.get('razorpay_payment_id')

  useEffect(() => {
    if (hasConfirmed.current) return
    
    const verifyPayment = async () => {
      try {
        let payload: any = {}
        
        if (sessionId) {
          payload = { payment_gateway: 'stripe', session_id: sessionId }
        } else if (paypalSubId) {
          payload = { payment_gateway: 'paypal', paypal_subscription_id: paypalSubId }
        } else if (razorpayPaymentId) {
          payload = { 
            payment_gateway: 'razorpay', 
            razorpay_payment_id: razorpayPaymentId,
            razorpay_subscription_id: searchParams.get('razorpay_subscription_id'),
            razorpay_signature: searchParams.get('razorpay_signature')
          }
        } else {
          // If no params, just assume it's already being processed by webhook or manual
          setIsVerified(true)
          return
        }

        hasConfirmed.current = true
        const result = await confirmSubscription(payload).unwrap()
        if (result.success) {
          setIsVerified(true)
          toast.success(t('subscription_activated', 'Subscription activated successfully!'))
        } else {
          setError(result.message || 'Verification failed')
        }
      } catch (err: any) {
        console.error('Verification error:', err)
        setError(err.data?.message || 'Failed to verify subscription status')
      }
    }

    verifyPayment()
  }, [sessionId, paypalSubId, razorpayPaymentId, confirmSubscription, t, searchParams])

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4">
      <Card className="w-full max-w-md shadow-lg border-primary/20 bg-background">
        <CardHeader className="text-center pt-8">
          <div className="flex justify-center mb-4">
            {isLoading ? (
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : error ? (
              <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center text-destructive border border-destructive/20">
                <XCircle className="h-8 w-8" />
              </div>
            ) : (
              <div className="h-16 w-16 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800">
                <CheckCircle2 className="h-8 w-8" />
              </div>
            )}
          </div>
          <CardTitle className="text-2xl">
            {isLoading ? t('verifying_payment', 'Verifying Payment...') : 
             error ? t('verification_failed', 'Verification Failed') :
             t('payment_successful', 'Payment Successful')}
          </CardTitle>
          <CardDescription className="text-base mt-2">
            {isLoading ? t('please_wait_while_we_confirm', 'Please wait while we confirm your subscription status') :
             error ? error :
             t('your_subscription_is_now_active', 'Your subscription is now active')}
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-8 pt-4">
          <div className="flex flex-col items-center space-y-6 text-center">
            {!isLoading && !error && (
              <div className="space-y-3">
                <p className="text-muted-foreground">
                  {t('payment_processed_successfully', 'Your payment has been processed successfully.')}
                </p>
                <p className="text-muted-foreground text-sm">
                  {t('you_can_now_access_premium_features', 'You can now access all the premium features of your plan.')}
                </p>
              </div>
            )}
            
            <div className="flex gap-3 w-full">
              <Button variant="default" onClick={() => router.push(ROUTES.PLANS)} className="flex-1 primary-btn h-10 text-white! rounded-radius">
                {t('view_plans', 'View Plans')}
              </Button>
              <Button 
                onClick={() => router.push(ROUTES.SUBSCRIPTIONS)} 
                className="flex-1 h-10 primary-btn text-white! rounded-radius"
                disabled={isLoading}
              >
                {t('go_to_subscription', 'Go to Subscription page ')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
