'use client'
import AuthInput from '@/components/auth/AuthInput'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/constants/routes'
import { useGetDemoCredentialsQuery, useLoginMutation } from '@/redux/api/authApi'
import { useAppDispatch } from '@/redux/hooks'
import { setAuth } from '@/redux/slices/authSlice'
import { LoginFormValues } from '@/types/auth'
import { ApiError } from '@/types/api'
import { authUtils } from '@/utils'
import { authSchemas } from '@/utils/validation-schemas'
import { Form, Formik } from 'formik'
import { motion } from 'framer-motion'
import { ArrowRight, ArrowUpRight, Lock, Mail, Shield, User } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

const LoginForm = () => {
  const { t } = useTranslation()
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialEmail = searchParams.get('email') || ''
  const dispatch = useAppDispatch()
  const [login] = useLoginMutation()

  const { data: demoData } = useGetDemoCredentialsQuery()
  const isDemoMode = demoData?.demo === true

  const handleSubmit = async (values: LoginFormValues) => {
    try {
      const response = await login(values).unwrap()
      // Save token and user data
      authUtils.setToken(response.token)
      authUtils.setUser(response.user)

      // Update Redux state
      dispatch(
        setAuth({
          token: response.token,
          user: response.user,
        }),
      )

      toast.success(response.message || t('login_successful'))

      // Redirect to specified path or default dashboard
      const redirectTo = searchParams.get('redirect_to')
      if (redirectTo) {
        router.replace(redirectTo)
      } else {
        router.replace(ROUTES.DASHBOARD)
      }
    } catch (error) {
      const apiError = error as ApiError
      const errorMessage = apiError?.data?.message || t('login_failed')
      toast.error(errorMessage)
    } finally {
    }
  }

  return (
    <Formik
      initialValues={{
        email: initialEmail,
        password: '',
      }}
      enableReinitialize={true}
      validationSchema={authSchemas.login(t)}
      onSubmit={handleSubmit}
    >
      {({ isSubmitting, setFieldValue }) => (
        <Form className="space-y-4 text-left">
          <motion.div className='mb-2!'
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <AuthInput
              label={t('email_address', { defaultValue: 'Email address' })}
              name="email"
              type="email"
              icon={Mail}
              placeholder={t('email_placeholder', { defaultValue: 'Enter your email address' })}
              className="border-gray-200 dark:border-white/10 h-[46px] rounded-border-radius-inner bg-transparent text-sm mb-0!"
            />
          </motion.div>

          <motion.div className='mb-2!'
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <AuthInput
              label={t('password', { defaultValue: 'Password' })}
              name="password"
              type="password"
              icon={Lock}
              placeholder={'Enter your password'}
              className="border-gray-200 dark:border-white/10 h-[46px] rounded-border-radius-inner bg-transparent text-sm"
            />
          </motion.div>

          <div className="flex justify-end items-center">
            <Link
              href={ROUTES.AUTH.FORGOT_PASSWORD}
              className="text-base font-medium text-primary hover:underline underline-offset-4 transition-all"
            >
              {t('forgot_password_question', { defaultValue: 'Forgot password?' })}
            </Link>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            <Button
              type="submit"
              className="w-full h-[46px] rounded-border-radius-inner! primary-btn text-white! text-sm font-semibold transition-all duration-200 border-none "
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>{t('signing_in', { defaultValue: 'Signing in...' })}</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <span className="tracking-wide">{t('sign_in', { defaultValue: 'Sign in' })}</span>
                  <ArrowRight className="w-[18px] h-[18px]" strokeWidth={2.5} />
                </div>
              )}
            </Button>
          </motion.div>

          {isDemoMode && (
            <>
              <div className="relative flex items-center justify-center py-2">
                <div className="border-t border-gray-200 dark:border-gray-800 w-full absolute"></div>
                <span className="bg-white dark:bg-light-body px-3 text-[11px] font-medium text-subtitle-color relative z-10 uppercase tracking-widest">OR</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-[42px] rounded-border-radius-inner border border-glass-border! bg-transparent font-black text-title-color hover:bg-primary hover:text-white!"
                  onClick={() => {
                    setFieldValue('email', demoData?.admin?.email || '')
                    setFieldValue('password', demoData?.admin?.password || '')
                  }}
                >
                  <Shield className="w-4 h-4 " />
                  {t('admin_demo', { defaultValue: 'Admin Demo' })}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-[42px] rounded-border-radius-inner border border-glass-border! bg-transparent font-black text-title-color hover:bg-primary hover:text-white!"
                  onClick={() => {
                    setFieldValue('email', demoData?.user?.email || '')
                    setFieldValue('password', demoData?.user?.password || '')
                  }}
                >
                  <User className="w-4 h-4 " />
                  {t('user_demo', { defaultValue: 'User Demo' })}
                </Button>
              </div>
            </>
          )}
        </Form>
      )}
    </Formik>
  )
}

export default LoginForm
