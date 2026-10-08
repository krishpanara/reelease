'use client'

import RegisterForm from '@/components/auth/RegisterForm'
import { ROUTES } from '@/constants/routes'
import useSettings from '@/hooks/useSettings'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'

const RegisterPage = () => {
  const { t } = useTranslation()
  const { settings } = useSettings()
  const appName = settings?.app_name || 'Smart AI'

  return (
    <div className="space-y-8 animate-in fade-in duration-1000">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="relative group p-px rounded-border-radius transition-all duration-500 hover:from-primary hover:via-primary/60"
      >
        {/* Top Highlight/Glow Effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-px" />

        <div className="relative rounded-[inherit] transition-all duration-500  border-none text-left">
          {/* Subtle Glow inside card */}
          <div className="absolute top-[-50%] right-[-50%] w-[300px] h-[300px] " />
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-center px-2"
          >
            <h1 className="text-3xl font-semibold text-title-color dark:text-white mb-2">{t('create_account')}</h1>
            <p className="dark:text-white text-black font-medium text-base max-w-[340px] md:max-w-none mx-auto md:mx-0 mb-4">
              {t('get_started_with_reels', { app_name: appName })}
            </p>
          </motion.div>
          <RegisterForm />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.8 }}
        className="text-center text-[15px] font-medium text-subtitle-color px-4"
      >
        {t('already_have_account')}{' '}
        <Link
          href={ROUTES.AUTH.LOGIN}
          className="text-primary hover:text-primary/80 font-medium transition-all ml-1 "
        >
          {t('sign_in')}
        </Link>
      </motion.div>
    </div>
  )
}

export default RegisterPage
