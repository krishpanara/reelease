'use client'

import AuthInput from '@/components/auth/AuthInput'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/constants/routes'
import { useRequestPasswordResetMutation } from '@/redux/api/authApi'
import { ApiError } from '@/types/api'
import { ForgotPasswordFormValues } from '@/types/auth'
import { authSchemas } from '@/utils/validation-schemas'
import { Form, Formik } from 'formik'
import { motion } from 'framer-motion'
import { ArrowUpRight, Mail } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

const ForgotPasswordForm = () => {
  const { t } = useTranslation()
  const router = useRouter()
  const [requestReset, { isLoading }] = useRequestPasswordResetMutation()

  const handleSubmit = async (values: ForgotPasswordFormValues) => {
    try {
      const response = await requestReset(values).unwrap()
      toast.success(response.message || t('otp_sent_successfully'))
      router.push(`${ROUTES.AUTH.VERIFY_OTP}?email=${encodeURIComponent(values.email)}`)
    } catch (error) {
      const apiError = error as ApiError
      toast.error(apiError?.data?.message || t('failed_to_send_otp'))
    }
  }

  return (
    <Formik
      initialValues={{
        email: '',
      }}
      validationSchema={authSchemas.forgotPassword(t)}
      onSubmit={handleSubmit}
    >
      {({ isSubmitting }) => (
        <Form className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <AuthInput
              name="email"
              type="email"
              icon={Mail}
              placeholder={t('email_placeholder')}
              className="border-white/10 h-12 dark:bg-black/40 rounded-radius glass-card"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Button
              type="submit"
              className="w-full h-12 rounded-radius! text-sm primary-btn text-white! font-semibold active:scale-95 transition-all duration-200 border-none"
              disabled={isSubmitting || isLoading}
            >
              {isSubmitting || isLoading ? (
                <div className="flex items-center gap-3">
                  <div className="h-5 w-5 border-2 border-white/30 dark:border-black/30 border-t-white dark:border-t-black rounded-full animate-spin" />
                  {t('sending_otp')}
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 group">
                  {/* <div className="w-0 opacity-0 group-hover:w-4 group-hover:opacity-100 transition-all duration-300 ease-in-out flex items-center justify-center overflow-hidden -ml-1 group-hover:ml-0">
                    <ArrowRight className="w-6 h-6 transition-all duration-500 ease-in-out" />
                  </div> */}
                  <span className="opacity-90 tracking-[0.05em]">{t('send_otp')}</span>

                  <div className="w-4 opacity-100  transition-all duration-300 ease-in-out flex items-center justify-center overflow-hidden mr-0">
                    <ArrowUpRight className="w-6 h-6 transition-all duration-500 ease-in-out" />

                  </div>
                </div>
              )}
            </Button>
          </motion.div>
        </Form>
      )}
    </Formik>
  )
}

export default ForgotPasswordForm
