'use client'
import AuthInput from '@/components/auth/AuthInput'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/constants/routes'
import { useRegisterMutation } from '@/redux/api/authApi'
import { RegisterFormValues } from '@/types/auth'
import { ApiError } from '@/types/api'
import { authSchemas } from '@/utils/validation-schemas'
import { Form, Formik } from 'formik'
import { motion } from 'framer-motion'
import { ArrowRight, ArrowUpRight, Lock, Mail, User } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

const RegisterForm = () => {
  const { t } = useTranslation()
  const router = useRouter()
  const [register, { isLoading }] = useRegisterMutation()

  const handleSubmit = async (values: RegisterFormValues) => {
    try {
      const { confirmPassword, ...registerData } = values
      const response = await register(registerData).unwrap()
      toast.success(response.message || t('account_created_successfully'))

      // Redirect to OTP verification with 'type=register' so the OTP page
      // knows to navigate to /login instead of /reset-password after success
      router.push(
        `${ROUTES.AUTH.VERIFY_OTP}?email=${encodeURIComponent(values.email)}&type=register`
      )
    } catch (error) {
      const apiError = error as ApiError
      const errorMessage = apiError?.data?.message || t('registration_failed')
      toast.error(errorMessage)
    }
  }

  return (
    <Formik
      initialValues={{
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
      }}
      validationSchema={authSchemas.register(t)}
      onSubmit={handleSubmit}
    >
      {({ isSubmitting }) => (
        <Form className="space-y-4 text-left">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <AuthInput
              label={t('name')}
              name="name"
              icon={User}
              placeholder={t('enter_name')}
              className="border-gray-200 dark:border-white/10 h-[46px] rounded-border-radius-inner bg-transparent text-sm"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <AuthInput
              label={t('email')}
              name="email"
              type="email"
              icon={Mail}
              placeholder={t('email_placeholder')}
              className="border-gray-200 dark:border-white/10 h-[46px] rounded-border-radius-inner bg-transparent text-sm"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <AuthInput
              label={t('password')}
              name="password"
              type="password"
              icon={Lock}
              placeholder={t('create_password')}
              className="border-gray-200 dark:border-white/10 h-[46px] rounded-border-radius-inner bg-transparent text-sm"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <AuthInput
              label={t('confirm_password')}
              name="confirmPassword"
              type="password"
              icon={Lock}
              placeholder={t('confirm_your_password')}
              className="border-gray-200 dark:border-white/10 h-[46px] rounded-border-radius-inner bg-transparent text-sm"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="pt-2"
          >
            <Button
              type="submit"
              className="w-full h-[46px] rounded-border-radius-inner! primary-btn text-white! text-sm font-semibold transition-all duration-200 border-none"
              disabled={isSubmitting || isLoading}
            >
              {isSubmitting || isLoading ? (
                <div className="flex items-center gap-3">
                  <div className="h-5 w-5 border-2 border-white/30 dark:border-black/30 border-t-white dark:border-t-black rounded-full animate-spin" />
                  {t('creating_account')}
                </div>
              ) : (

                <div className="flex items-center justify-center gap-2 group">
                  <span className="opacity-90 tracking-[0.05em]">{t('create_account')}</span>


                  <div className="w-4 opacity-100  transition-all duration-300 ease-in-out flex items-center justify-center overflow-hidden mr-0 ">
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

export default RegisterForm
