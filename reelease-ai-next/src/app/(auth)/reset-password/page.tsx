'use client'

import ResetPasswordForm from '@/components/auth/ResetPasswordForm'
import { ROUTES } from '@/constants/routes'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Suspense } from 'react'
import { useTranslation } from 'react-i18next'

const ResetPasswordPage = () => {
  const { t } = useTranslation()

  return (
    <div className="space-y-8 animate-in fade-in duration-1000 text-left">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="relative group p-px rounded-border-radius transition-all duration-500 hover:from-primary hover:via-primary/60 overflow-hidden"
      >
        {/* Top Highlight/Glow Effect */}

        <div className="relative rounded-[inherit] transition-all duration-500 overflow-hidden border-none text-left">
          {/* Subtle Glow inside card */}

          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="text-center px-2 mb-8"
          >
            <h1 className="text-3xl font-medium text-title-color dark:text-white mb-2 pt-10">
              {t('reset_password_title')}
            </h1>
            <p className="text-white font-medium text-base max-w-[340px] md:max-w-none mx-auto md:mx-0">
              {t('reset_password_desc')}
            </p>
          </motion.div>

          <Suspense fallback={<div>{t('loading')}</div>}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.8 }}
        className="text-center text-[15px] font-medium text-subtitle-color px-4"
      >
        <Link
          href={ROUTES.AUTH.LOGIN}
          className="text-primary hover:text-primary/80 font-medium transition-all hover:tracking-wide ml-1 decoration-2 underline-offset-4 hover:underline"
        >
          {t('back_to_login')}
        </Link>
      </motion.div>
    </div>
  )
}

export default ResetPasswordPage
