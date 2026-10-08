'use client'

import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm'
import { ROUTES } from '@/constants/routes'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'

const ForgotPasswordPage = () => {
  const { t } = useTranslation()

  return (
    <div className="space-y-8 animate-in fade-in duration-1000 text-left">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="relative group p-px rounded-border-radius transition-all duration-500 hover:from-primary hover:via-primary/60"
      >

        {/* Subtle Glow inside card */}

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="text-center px-2 mb-6"
        >
          <h1 className="text-3xl font-semibold text-title-color dark:text-white mb-2 pt-10">
            {t('forgot_password_title')}
          </h1>
          <p className="dark:text-white text-black   font-medium text-base max-w-85 md:max-w-none mx-auto md:mx-0">
            {t('forgot_password_desc')}
          </p>
        </motion.div>

        <ForgotPasswordForm />
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.8 }}
        className="text-center text-[15px] font-medium text-subtitle-color px-4"
      >
        {t('remember_password')}{' '}
        <Link
          href={ROUTES.AUTH.LOGIN}
          className="text-primary hover:text-primary/80 font-medium transition-all  ml-1 "
        >
          {t('sign_in')}
        </Link>
      </motion.div>
    </div>
  )
}

export default ForgotPasswordPage
